/**
 * Bersaglio Admin — Bandeja única de aprobaciones (F-IA-2 B4 · [OPUS-4.8], owner-only).
 *
 * UN solo lugar donde Daniel decide lo pendiente que YA existe, con las acciones que YA existen
 * (patrón twenty T-25 §183: agregadora, no módulo nuevo). Controlador DELGADO (D5):
 *   (a) monta `initAprobaciones()` TAL CUAL — la cola de cartera (M2b) que antes vivía en Salud;
 *       esta página replica el contrato DOM de ids que `admin-salud.html` le daba.
 *   (b) sección "Bóveda y caja" — réplica EXACTA de `boveda.js:117` (renderPendientes/aprobar):
 *       movimientos de bóveda `estado === 'pendiente_aprobacion'` aprobados con la callable
 *       EXISTENTE `aprobarEventoCaja({opId})`. CERO callables nuevas; si hoy no hay rechazo para
 *       bóveda, NO se inventa (D5). Todo owner-only: la bóveda es `read isOwner` (reglas) y la
 *       callable valida owner server-side — un rol no-owner ni ve el ítem del rail.
 *
 * DOM seguro (sin innerHTML, patrón boveda.js) → cero superficie de inyección.
 */

import { admToast, admConfirm, initSidebar, requireAuth, errorMessage, fmtDateTime, fmtDate } from './shared.js';
import { initAprobaciones } from './aprobaciones.js';
import { aprobarEventoCaja, onBovedaMovsChange } from '../pedidos-service.js';
import { tipoBovedaLabel, esDestructivo } from './caja-format.js';
import { onMovimientosPendientesChange, aprobarMovimientoTesoreria, onCuentasTesoreriaChange } from '../tesoreria-service.js';
import { ETIQUETAS_TIPO, entero } from './tesoreria-format.js';

// Bóveda: los montos pueden ser negativos (reversa) → signo, sin clamp (patrón boveda.js).
const cop = (v) => { const x = Math.round(Number(v) || 0); return (x < 0 ? '-$' : '$') + Math.abs(x).toLocaleString('es-CO'); };
const BUSINESS_ERR = ['failed-precondition', 'invalid-argument', 'not-found', 'already-exists', 'permission-denied'];
const SOCIA_LABEL = { kary: 'Kary', daniela: 'Daniela', veronica: 'Verónica' };
let _tesoPend = [];       // últimos pendientes de tesorería (re-render cuando llegan los nombres de cuenta)
let _cuentaNombre = {};   // cuentaId → nombre, para dar contexto al owner al decidir

// ─── DOM builder seguro (sin innerHTML, mismo helper que boveda.js) ──────────────
function el(tag, attrs = {}, kids = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else node.setAttribute(k, v);
    }
    for (const c of [].concat(kids)) if (c) node.appendChild(c);
    return node;
}

async function init() {
    await requireAuth('owner');   // Bandeja = owner-only (bóveda read isOwner + callables owner)
    initSidebar();

    // (a) Cola de cartera M2b — módulo intacto, mismo contrato DOM que le daba admin-salud.html.
    initAprobaciones();

    // (b) Sección Bóveda y caja — réplica de boveda.js:117.
    onBovedaMovsChange(
        (movs) => renderCajaPend(movs.filter(esDestructivo)),
        200,
        (e) => admToast(errorMessage(e, 'No se pudo leer los movimientos de bóveda.'), 'danger', 4000),
    );

    // (c) Sección Tesorería — retiros/devoluciones de socia + ajustes del cuadre pendientes de firma.
    //     Aprobar/rechazar con la CF aprobarMovimientoTesoreria (owner-only, reglas read admin/owner).
    //     El nombre de la cuenta (contexto para el owner) llega por su propia suscripción; re-render.
    onCuentasTesoreriaChange(
        (cuentas) => { _cuentaNombre = {}; for (const c of cuentas) _cuentaNombre[c.id] = c.nombre || '—'; renderTesoPend(_tesoPend); },
        (e) => admToast(errorMessage(e, 'No se pudieron leer las cuentas de tesorería.'), 'danger', 4000),
    );
    onMovimientosPendientesChange(
        (movs) => { _tesoPend = movs; renderTesoPend(movs); },
        (e) => admToast(errorMessage(e, 'No se pudieron leer los pendientes de tesorería.'), 'danger', 4000),
    );
}

// ─── Bóveda y caja: pendientes de aprobación (réplica EXACTA de boveda.js renderPendientes) ──────
function renderCajaPend(pend) {
    const list = document.getElementById('caja-pend-list');
    const empty = document.getElementById('caja-pend-empty');
    if (!list || !empty) return;
    list.replaceChildren();
    empty.hidden = pend.length > 0;

    for (const m of pend) {
        const monto = el('strong', { class: 'adm-money', text: cop(Math.abs(m.delta ?? m.monto)) });
        const info = el('div', { class: 'bov-mov-info' }, [
            el('span', { class: 'bov-mov-tipo', text: tipoBovedaLabel(m.tipo) }),
            el('span', { class: 'bov-mov-sub', text: m.motivo || m.nota || '—' }),
            el('span', { class: 'bov-mov-time', text: fmtDateTime(m.ts) }),
        ]);
        const btn = el('button', { class: 'adm-btn adm-btn--primary adm-btn--sm', type: 'button', text: 'Aprobar' });
        btn.addEventListener('click', () => aprobar(m));
        list.appendChild(el('li', { class: 'bov-mov bov-mov--pend' }, [info, el('div', { class: 'bov-mov-right' }, [monto, btn])]));
    }
}

function aprobar(mov) {
    admConfirm(
        `¿Aprobar «${tipoBovedaLabel(mov.tipo)}» por ${cop(Math.abs(mov.delta ?? mov.monto))}? Entrará al saldo de la bóveda y no se puede deshacer.`,
        async () => {
            try {
                await aprobarEventoCaja({ opId: mov.id });
                admToast('✓ Movimiento aprobado', 'success');
            } catch (err) {
                const msg = (BUSINESS_ERR.includes(err?.code) && err?.message) ? err.message : errorMessage(err, 'No se pudo aprobar.');
                admToast(msg, 'danger', 4500);
            }
        },
    );
}

// ─── Tesorería: pendientes de firma (patrón bóveda + rechazo con motivo, la CF lo soporta) ──────
// Sub-texto = contexto para el owner: socia (en retiro/reembolso), o sentido del ajuste, o la nota.
function subTextoTeso(m) {
    if (m.contraparte && m.contraparte.tipo === 'socia') return SOCIA_LABEL[m.contraparte.id] || 'socia';
    if (m.tipo === 'ajuste_conciliacion') return m.descripcion || (m.direccion === 'entrada' ? 'sube el saldo' : 'baja el saldo');
    return m.descripcion || '—';
}

function renderTesoPend(pend) {
    const list = document.getElementById('teso-pend-list');
    const empty = document.getElementById('teso-pend-empty');
    if (!list || !empty) return;
    list.replaceChildren();
    // Orden estable, más reciente primero ('YYYY-MM-DD' ordena bien como string).
    const orden = [...(pend || [])].sort((a, b) => String(b.fecha || '').localeCompare(String(a.fecha || '')));
    empty.hidden = orden.length > 0;

    for (const m of orden) {
        // Monto SIN signo: calcular el signo de un ajuste_inverso pendiente lanzaría (su ref no está
        // en esta lista). El owner decide sobre el monto + la etiqueta humana, que ya dice qué es.
        const monto = el('strong', { class: 'adm-money', text: cop(entero(m.monto)) });
        const ctx = [_cuentaNombre[m.cuentaId], subTextoTeso(m)].filter(Boolean).join(' · ');
        const info = el('div', { class: 'bov-mov-info' }, [
            el('span', { class: 'bov-mov-tipo', text: ETIQUETAS_TIPO[m.tipo] || m.tipo }),
            el('span', { class: 'bov-mov-sub', text: ctx || '—' }),
            el('span', { class: 'bov-mov-time', text: fmtDate(m.fecha) }),
        ]);
        const btnA = el('button', { class: 'adm-btn adm-btn--primary adm-btn--sm', type: 'button', text: 'Aprobar' });
        btnA.addEventListener('click', () => decidirTeso(m, 'aprobar'));
        const btnR = el('button', { class: 'adm-btn adm-btn--ghost adm-btn--sm', type: 'button', text: 'Rechazar' });
        btnR.addEventListener('click', () => decidirTeso(m, 'rechazar'));
        list.appendChild(el('li', { class: 'bov-mov bov-mov--pend' }, [info, el('div', { class: 'bov-mov-right' }, [monto, btnA, btnR])]));
    }
}

function decidirTeso(mov, decision) {
    const etiqueta = ETIQUETAS_TIPO[mov.tipo] || mov.tipo;
    if (decision === 'aprobar') {
        admConfirm(
            `¿Aprobar «${etiqueta}» por ${cop(entero(mov.monto))}? Entrará al saldo de la cuenta y no se puede deshacer.`,
            () => enviarTeso(mov, 'aprobar'),
        );
    } else {
        const motivo = window.prompt(`Motivo para rechazar «${etiqueta}» por ${cop(entero(mov.monto))} (Kary lo verá):`, '');
        if (motivo === null) return;                                   // canceló el prompt
        if (!motivo.trim()) { admToast('Rechazar exige un motivo.', 'danger'); return; }
        enviarTeso(mov, 'rechazar', motivo.trim());
    }
}

async function enviarTeso(mov, decision, motivo) {
    const payload = { opId: mov.id, decision };
    if (motivo) payload.motivo = motivo;   // solo en rechazo (la CF lo exige); en aprobar no va
    try {
        await aprobarMovimientoTesoreria(payload);
        admToast(decision === 'aprobar' ? '✓ Movimiento aprobado' : '✓ Movimiento rechazado', 'success');
    } catch (err) {
        const msg = (BUSINESS_ERR.includes(err?.code) && err?.message) ? err.message : errorMessage(err, 'No se pudo procesar.');
        admToast(msg, 'danger', 4500);
    }
}

init();
