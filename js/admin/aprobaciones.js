/**
 * Bersaglio Admin — Cola de aprobación de Daniel (Fase M · M2b, owner-only).
 *
 * La otra mitad del sistema de control: Kary pide (M2a), Daniel decide AQUÍ.
 * Cada solicitud pendiente se pinta como una tarjeta CON CONTEXTO REAL (PR3):
 * clienta + mora + últimos movimientos + saldo ANTES→DESPUÉS re-computado AL
 * RENDER (PR2: se aprueba ALGO vigente, no un snapshot de hace días) + alerta
 * roja si el saldo cambió desde que Kary pidió. Aprobar/rechazar POR solicitud
 * — no existe "aprobar todo"; rechazar exige motivo.
 *
 * Al APROBAR, el asiento nace en UN writeBatch de Daniel (crm-service.js); la
 * re-validación previa es PURA (js/crm-aprobacion.js) y NUNCA confía en
 * `datosCorreccion`: re-lee el movimiento original ese instante (ADR §74).
 *
 * XSS: las tarjetas se construyen con métodos DOM (createElement/textContent),
 * nunca interpolando datos en HTML.
 */

import { admToast, admConfirm, fmtDateTime, currentUser } from './shared.js';
import {
    onSolicitudesPendientesChange, fetchMovimientos, getMovimiento, getCliente, getConfig,
    aprobarSolicitudAjuste, aprobarSolicitudCorreccion, rechazarSolicitud, fmtCOP,
} from '../crm-service.js';
import { estadoCuenta } from '../crm-estado-cuenta.js';
import { estadoLabel, estadoPillClass } from './saldo-format.js';
import {
    validarAprobacionAjuste, validarAprobacionCorreccion, hayDriftSaldo,
    planAprobacionAjuste, planAprobacionCorreccion, MOTIVO_OBSOLETA, MOTIVO_INCOHERENTE,
} from '../crm-aprobacion.js';

const TIPO_LABEL = { factura: 'Factura', abono: 'Abono', apertura: 'Apertura', ajuste: 'Ajuste' };
const SIGNO = { factura: 1, apertura: 1, ajuste: 1, abono: -1 };
const SLA_DIAS_DEFAULT = 2;   // política v1.1: SLA 48h; config/cartera.slaRevisionDias manda

let _pendientes = [];          // solicitudes pendientes vivas (collectionGroup)
let _ctx = new Map();          // clienteId → { cliente, movimientos, estado } del último render
let _slaDias = SLA_DIAS_DEFAULT;
let _diasPlazo = 30;
let _fechaCorte = null;
let _renderSeq = 0;            // descarta renders viejos si llegan fuera de orden
let _rechazo = null;           // { clienteId, solId } objetivo del modal de rechazo

// 'YYYY-MM-DD' → 'DD/MM/YYYY'; '' si no es ISO.
function fmtFecha(iso) {
    if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
}

function diasDesde(ts) {
    const ms = ts?.toMillis?.() ?? null;
    return ms === null ? 0 : Math.floor((Date.now() - ms) / 864e5);
}

function uid() { return currentUser()?.user?.uid || null; }

// Mini-fábrica DOM (texto SIEMPRE via textContent — cero interpolación en HTML).
function el(tag, { cls, css, text, title } = {}) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (css) n.style.cssText = css;
    if (text != null) n.textContent = text;
    if (title) n.title = title;
    return n;
}

// ─── Carga del contexto por clienta (cliente + movimientos, tolerante a fallos) ──
async function cargarContexto(clienteIds) {
    const ctx = new Map();
    await Promise.all(clienteIds.map(async (cid) => {
        try {
            const [cliente, movimientos] = await Promise.all([getCliente(cid), fetchMovimientos(cid)]);
            const estado = estadoCuenta(movimientos, { diasPlazo: _diasPlazo, fechaCorte: _fechaCorte });
            ctx.set(cid, { cliente, movimientos, estado });
        } catch (err) {
            console.warn('[aprobaciones] contexto de', cid, err);
            // `error: true` ≠ "sin movimientos": un fetch fallido NO puede pintarse
            // como contexto real ni habilitar decisiones (hallazgo de la verificación).
            ctx.set(cid, { cliente: null, movimientos: null, estado: null, error: true });
        }
    }));
    return ctx;
}

// ─── Semáforo (4ª tarjeta de Salud) ───────────────────────────────────────────
function renderStat() {
    const valor = document.getElementById('stat-aprob-valor');
    const icono = document.getElementById('stat-aprob-icon');
    if (!valor || !icono) return;
    const n = _pendientes.length;
    const vencidas = _pendientes.some((s) => diasDesde(s.creadoEn) > _slaDias);
    valor.textContent = n === 0 ? 'Al día' : `${n} por revisar`;
    icono.className = `adm-stat-icon adm-stat-icon--${n === 0 ? 'green' : vencidas ? 'red' : 'gold'}`;
}

// ─── Tarjetas de la cola ───────────────────────────────────────────────────────
function nodoMiniMovs(movimientos) {
    const cont = el('div');
    // null = la carga FALLÓ (no es lo mismo que una clienta sin movimientos).
    if (movimientos === null) {
        cont.appendChild(el('div', { css: 'color:var(--adm-muted);font-size:12px;', text: 'No se pudieron cargar.' }));
        return cont;
    }
    const ultimos = movimientos.slice(0, 5);
    if (!ultimos.length) {
        cont.appendChild(el('div', { css: 'color:var(--adm-muted);font-size:12px;', text: 'Sin movimientos.' }));
        return cont;
    }
    for (const m of ultimos) {
        const aporte = (SIGNO[m.tipo] ?? 0) * (typeof m.monto === 'number' ? m.monto : 0);
        const fecha = fmtFecha(m.fecha) || fmtDateTime(m.registradoEn);
        const anulado = m.anulado === true;
        const fila = el('div', { css: `display:flex;justify-content:space-between;gap:10px;font-size:12px;${anulado ? 'opacity:.5;text-decoration:line-through;' : ''}` });
        fila.appendChild(el('span', { css: 'color:var(--adm-muted);', text: `${fecha} · ${TIPO_LABEL[m.tipo] || m.tipo || '—'}` }));
        fila.appendChild(el('span', { cls: 'adm-money', text: (aporte > 0 ? '+' : '') + fmtCOP(aporte) }));
        cont.appendChild(fila);
    }
    return cont;
}

function pillAntiguedad(sol) {
    const dias = diasDesde(sol.creadoEn);
    const txt = dias <= 0 ? 'hoy' : dias === 1 ? 'hace 1 día' : `hace ${dias} días`;
    const fueraSLA = dias > _slaDias;
    return el('span', {
        cls: `adm-pill ${fueraSLA ? 'adm-pill--red' : 'adm-pill--gray'}`,
        text: `⏳ ${txt}${fueraSLA ? ' · fuera de plazo' : ''}`,
        title: fueraSLA ? `Lleva más de ${_slaDias} días esperando tu revisión` : '',
    });
}

/** Estado de la solicitud evaluado AL RENDER (con los movimientos ya cargados). */
function evaluarAlRender(sol, ctx) {
    if (sol.tipo === 'ajuste') {
        const v = validarAprobacionAjuste(sol);
        return { ...v, obsoleta: false, advertencias: [], original: null };
    }
    const original = (ctx?.movimientos || []).find((m) => m.id === sol.correccionDe) || null;
    const v = validarAprobacionCorreccion(sol, original);
    return { ...v, original };
}

function botonAccion(texto, dataset, primario = false) {
    const b = el('button', { cls: `adm-btn ${primario ? 'adm-btn--primary' : 'adm-btn--ghost'} adm-btn--sm`, text: texto });
    for (const [k, v] of Object.entries(dataset)) b.dataset[k] = v;
    return b;
}

// Contexto que NO cargó (red/permiso): tarjeta neutra SIN botones de decisión —
// con datos a ciegas no se aprueba ni se rechaza dinero (anti rubber-stamping).
function nodoTarjetaSinContexto(sol) {
    const card = el('div', { css: 'padding:16px;border-radius:14px;margin-bottom:12px;background:var(--adm-soft,#f5f3ef);' });
    const head = el('div', { css: 'display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;' });
    head.appendChild(el('div', { css: 'font-weight:600;', text: `Solicitud ${sol.tipo === 'correccion' ? 'de corrección' : 'de ajuste'}` }));
    head.appendChild(pillAntiguedad(sol));
    card.appendChild(head);
    card.appendChild(el('div', {
        css: 'color:var(--adm-danger,#c0392b);font-size:13px;margin-top:8px;',
        text: '⚠️ No se pudo cargar el contexto de esta clienta. Revisa tu conexión e inténtalo de nuevo — sin el contexto no se puede decidir.',
    }));
    const acciones = el('div', { css: 'display:flex;justify-content:flex-end;gap:8px;margin-top:12px;' });
    acciones.appendChild(botonAccion('Reintentar', { reintentar: sol.id }));
    card.appendChild(acciones);
    return card;
}

function nodoTarjeta(sol) {
    const ctx = _ctx.get(sol.clienteId) || {};
    if (ctx.error) return nodoTarjetaSinContexto(sol);
    const est = ctx.estado;
    const evalR = evaluarAlRender(sol, ctx);

    // Saldo ANTES (re-computado de los movimientos AL RENDER) → DESPUÉS (+ delta).
    const tieneSaldo = est && Number.isFinite(est.saldo);
    const saldoAntes = tieneSaldo ? Math.round(est.saldo) : null;
    const delta = Math.round(Number(sol.monto) || 0);
    const drift = tieneSaldo ? hayDriftSaldo(sol, saldoAntes) : { drift: false, saldoAlSolicitar: null };

    const esCorr = sol.tipo === 'correccion';
    const card = el('div', { css: 'padding:16px;border-radius:14px;margin-bottom:12px;background:var(--adm-soft,#f5f3ef);' });

    // Encabezado: clienta (link a la ficha) + título + pills (mora · antigüedad).
    const head = el('div', { css: 'display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;' });
    const quien = el('div', { css: 'font-weight:600;' });
    if (ctx.cliente) {
        const link = el('a', { text: ctx.cliente.nombre || 'Clienta' });
        link.href = `admin-cuenta.html?id=${encodeURIComponent(sol.clienteId)}`;
        quien.appendChild(link);
    } else {
        // La clienta fue borrada: sin link a una ficha muerta.
        quien.appendChild(el('span', { text: 'Clienta no encontrada' }));
    }
    quien.appendChild(el('span', { css: 'color:var(--adm-muted);font-weight:400;', text: ` · ${esCorr ? 'Corrección de un movimiento' : 'Ajuste de saldo'}` }));
    const pills = el('div', { css: 'display:flex;gap:6px;align-items:center;' });
    if (est) pills.appendChild(el('span', { cls: `adm-pill ${estadoPillClass(est)}`, text: estadoLabel(est) }));
    pills.appendChild(pillAntiguedad(sol));
    head.append(quien, pills);
    card.appendChild(head);

    // Cuerpo en dos columnas: detalle de la solicitud | últimos movimientos.
    const grid = el('div', { css: 'display:grid;grid-template-columns:1fr 240px;gap:14px;margin-top:10px;align-items:start;' });
    const izq = el('div');

    const efecto = delta === 0
        ? 'Sin efecto en el saldo (corrige la fecha)'
        : `El saldo ${delta > 0 ? 'sube' : 'baja'} ${fmtCOP(Math.abs(delta))}`;
    izq.appendChild(el('div', { css: 'font-size:13px;font-weight:600;', text: efecto }));
    izq.appendChild(el('div', {
        css: 'font-size:13px;color:var(--adm-muted);margin-top:4px;',
        text: `${sol.motivo || ''}${sol.nota ? ` — ${sol.nota}` : ''}`,
    }));

    // Detalle del par original → reemplazo (solo display; la verdad la decide la
    // re-validación al aprobar, sobre el original re-leído).
    if (esCorr) {
        const o = evalR.original;
        const r = sol.datosCorreccion?.reemplazo;
        const par = el('div', { css: 'font-size:13px;margin-top:6px;' });
        const oTxt = o ? `${TIPO_LABEL[o.tipo] || o.tipo} · ${fmtCOP(o.monto)}${o.fecha ? ` · ${fmtFecha(o.fecha)}` : ''}` : 'no encontrado';
        const rTxt = r ? `${fmtCOP(Number(r.monto))}${r.fecha ? ` · ${fmtFecha(String(r.fecha))}` : ''}` : '—';
        par.appendChild(el('span', { text: 'Original: ' }));
        par.appendChild(el('strong', { text: oTxt }));
        par.appendChild(el('span', { css: 'color:var(--adm-muted);', text: '  →  queda en  ' }));
        par.appendChild(el('strong', { text: rTxt }));
        izq.appendChild(par);
    }

    // Saldo antes → después + alerta de drift (PR2).
    if (tieneSaldo) {
        const fila = el('div', { css: 'font-size:13px;margin-top:6px;' });
        fila.appendChild(el('span', { text: 'Saldo: ' }));
        fila.appendChild(el('strong', { cls: 'adm-money', text: fmtCOP(saldoAntes) }));
        fila.appendChild(el('span', { css: 'color:var(--adm-muted);', text: '  →  ' }));
        fila.appendChild(el('strong', { cls: 'adm-money', text: fmtCOP(saldoAntes + delta) }));
        izq.appendChild(fila);
        if (drift.drift) {
            izq.appendChild(el('div', {
                css: 'color:var(--adm-danger,#c0392b);font-weight:600;margin-top:4px;font-size:13px;',
                text: `⚠️ El saldo cambió desde que Kary pidió esto (era ${fmtCOP(drift.saldoAlSolicitar)}). Revisa antes de aprobar.`,
            }));
        }
    }

    // Avisos de la re-validación al render.
    if (evalR.obsoleta) {
        izq.appendChild(el('div', {
            css: 'color:var(--adm-muted);font-weight:600;margin-top:6px;font-size:13px;',
            text: 'Este registro ya fue corregido por otra vía; la solicitud quedó obsoleta.',
        }));
    } else if (!evalR.ok) {
        izq.appendChild(el('div', {
            css: 'color:var(--adm-danger,#c0392b);margin-top:6px;font-size:13px;',
            text: `No se puede aprobar: ${evalR.errores.join(' ')}`,
        }));
    } else if (evalR.advertencias.length) {
        izq.appendChild(el('div', { css: 'color:#b8860b;margin-top:6px;font-size:13px;', text: evalR.advertencias.join(' ') }));
    }

    const der = el('div', { css: 'border-left:1px solid rgba(0,0,0,.08);padding-left:14px;' });
    der.appendChild(el('div', {
        css: 'font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--adm-muted);margin-bottom:6px;',
        text: 'Últimos movimientos',
    }));
    der.appendChild(nodoMiniMovs(ctx.movimientos));
    grid.append(izq, der);
    card.appendChild(grid);

    // Acciones: aprobar/rechazar POR solicitud; obsoleta → un toque la rechaza con
    // motivo automático (Kary la ve y re-solicita sobre el estado actual, §69).
    const acciones = el('div', { css: 'display:flex;justify-content:flex-end;gap:8px;margin-top:12px;' });
    if (evalR.obsoleta) {
        acciones.appendChild(botonAccion('Marcar obsoleta', { obsoleta: sol.id, cliente: sol.clienteId }));
    } else if (!evalR.ok) {
        acciones.appendChild(botonAccion('Rechazar (no cuadra)', { incoherente: sol.id, cliente: sol.clienteId }));
    } else {
        acciones.appendChild(botonAccion('Rechazar', { rechazar: sol.id, cliente: sol.clienteId }));
        acciones.appendChild(botonAccion('Aprobar', { aprobar: sol.id, cliente: sol.clienteId }, true));
    }
    card.appendChild(acciones);
    return card;
}

async function render() {
    const seq = ++_renderSeq;
    const lista = document.getElementById('aprob-list');
    const empty = document.getElementById('aprob-empty');
    if (!lista || !empty) return;

    renderStat();
    if (!_pendientes.length) {
        _ctx = new Map();
        lista.replaceChildren();
        empty.hidden = false;
        return;
    }
    const ids = [...new Set(_pendientes.map((s) => s.clienteId).filter(Boolean))];
    const ctx = await cargarContexto(ids);
    if (seq !== _renderSeq) return;   // llegó un snapshot más nuevo mientras cargábamos
    _ctx = ctx;
    empty.hidden = true;
    lista.replaceChildren(..._pendientes.map(nodoTarjeta));
}

// ─── Acciones ──────────────────────────────────────────────────────────────────

function buscarSolicitud(solId) {
    return _pendientes.find((s) => s.id === solId) || null;
}

async function rechazarCon(clienteId, solId, motivo, exitoMsg) {
    try {
        await rechazarSolicitud(clienteId, solId, uid(), motivo);
        admToast(exitoMsg || 'Solicitud rechazada — Kary lo verá en la ficha.');
    } catch (err) {
        console.error('[aprobaciones] rechazar:', err);
        admToast('No se pudo rechazar. Intenta de nuevo.', 'danger');
    }
}

/**
 * Rechazo AUTOMÁTICO verificado (obsoleta / no cuadra). Un código de auditoría
 * NUNCA se escribe sobre lo que mostró el render: se RE-LEE el original ese
 * instante (espejo de handleAprobar, contrato §74) y el veredicto FRESCO decide
 * el motivo — o ninguno, si la solicitud en realidad cuadra (p. ej. el contexto
 * del render había fallado y el registro sigue vigente).
 */
async function confirmarRechazoAutomatico(clienteId, solId) {
    const sol = buscarSolicitud(solId);
    if (!sol) return;
    try {
        if (sol.tipo === 'correccion') {
            const original = await getMovimiento(clienteId, sol.correccionDe);
            const v = validarAprobacionCorreccion(sol, original);
            if (v.obsoleta) { await rechazarCon(clienteId, solId, MOTIVO_OBSOLETA, 'Solicitud marcada como obsoleta.'); return; }
            if (!v.ok) { await rechazarCon(clienteId, solId, MOTIVO_INCOHERENTE); return; }
            admToast('El registro sigue vigente y la solicitud cuadra — revisa la tarjeta de nuevo.');
        } else {
            const v = validarAprobacionAjuste(sol);
            if (!v.ok) { await rechazarCon(clienteId, solId, MOTIVO_INCOHERENTE); return; }
            admToast('La solicitud cuadra — revisa la tarjeta de nuevo.');
        }
        render();
    } catch (err) {
        console.error('[aprobaciones] rechazo automático:', err);
        admToast('No se pudo verificar el registro. Intenta de nuevo.', 'danger');
    }
}

async function handleAprobar(clienteId, solId, btn) {
    const sol = buscarSolicitud(solId);
    if (!sol) return;
    btn.disabled = true;
    try {
        if (sol.tipo === 'correccion') {
            // RE-VALIDACIÓN sobre el original RE-LEÍDO este instante (nunca el snapshot).
            const original = await getMovimiento(clienteId, sol.correccionDe);
            const v = validarAprobacionCorreccion(sol, original);
            if (v.obsoleta) {
                admConfirm('Este registro ya fue corregido por otra vía; la solicitud quedó obsoleta. ¿Marcarla como rechazada para que Kary la vea y vuelva a corregir sobre lo actual?', async () => {
                    await rechazarCon(clienteId, solId, MOTIVO_OBSOLETA, 'Solicitud marcada como obsoleta.');
                });
                render();
                return;
            }
            if (!v.ok) { admToast(`No se puede aprobar: ${v.errores.join(' ')}`, 'danger'); render(); return; }
            const delta = Math.round(Number(sol.monto) || 0);
            const efecto = delta === 0 ? 'el saldo no cambia (corrige la fecha)'
                : `el saldo ${delta > 0 ? 'sube' : 'baja'} ${fmtCOP(Math.abs(delta))}`;
            admConfirm(`Se anula el registro original y se crea el corregido — ${efecto}. ¿Aprobar como dueño?`, async () => {
                try {
                    const plan = planAprobacionCorreccion(sol, sol.id, original);
                    await aprobarSolicitudCorreccion(clienteId, sol.id, original.id, plan, uid());
                    admToast('Corrección aprobada. El saldo se actualizará en un momento.');
                } catch (err) {
                    console.error('[aprobaciones] aprobar corrección:', err);
                    // Carrera: el original se anuló entre la re-lectura y el commit →
                    // anulacionValida reventó el batch ENTERO (invariante atómico §69).
                    admToast(err?.code === 'permission-denied'
                        ? 'El registro cambió mientras aprobabas — revisa la tarjeta de nuevo.'
                        : 'No se pudo aprobar. Intenta de nuevo.', 'danger');
                    render();
                }
            });
        } else {
            const v = validarAprobacionAjuste(sol);
            if (!v.ok) { admToast(`No se puede aprobar: ${v.errores.join(' ')}`, 'danger'); return; }
            const delta = Math.round(Number(sol.monto));
            admConfirm(`Se registrará un ajuste de ${delta > 0 ? '+' : '−'}${fmtCOP(Math.abs(delta))} aprobado por ti. ¿Aprobar como dueño?`, async () => {
                try {
                    await aprobarSolicitudAjuste(clienteId, sol.id, planAprobacionAjuste(sol, sol.id), uid());
                    admToast('Ajuste aprobado. El saldo se actualizará en un momento.');
                } catch (err) {
                    console.error('[aprobaciones] aprobar ajuste:', err);
                    admToast('No se pudo aprobar. Intenta de nuevo.', 'danger');
                }
            });
        }
    } catch (err) {
        // La re-lectura del original puede fallar (offline): Daniel SIEMPRE recibe señal.
        console.error('[aprobaciones] aprobar:', err);
        admToast('No se pudo aprobar. Intenta de nuevo.', 'danger');
    } finally {
        btn.disabled = false;
    }
}

// ─── Modal de rechazo (motivo obligatorio — la regla lo exige) ─────────────────
function wireRechazo() {
    const modal = document.getElementById('rechazo-modal');
    const form = document.getElementById('rechazo-form');
    const motivoEl = document.getElementById('rechazo-motivo');
    if (!modal || !form) return;
    const close = () => { modal.hidden = true; _rechazo = null; form.reset(); };
    document.getElementById('rechazo-cancel').addEventListener('click', close);
    document.getElementById('rechazo-close').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const motivo = motivoEl.value.trim();
        if (!motivo) { admToast('Escribe por qué la rechazas — Kary necesita saberlo.', 'danger'); return; }
        if (!_rechazo) return;
        const btn = document.getElementById('rechazo-confirm');
        btn.disabled = true;
        try {
            await rechazarCon(_rechazo.clienteId, _rechazo.solId, motivo);
            close();
        } finally {
            btn.disabled = false;
        }
    });
}

function abrirRechazo(clienteId, solId) {
    _rechazo = { clienteId, solId };
    const modal = document.getElementById('rechazo-modal');
    document.getElementById('rechazo-form').reset();
    modal.hidden = false;
    document.getElementById('rechazo-motivo').focus();
}

// ─── Init (lo llama salud.js tras requireAuth('owner')) ────────────────────────
export async function initAprobaciones() {
    // Banner permanente de identidad (mitigación [HONOR] del supuesto de dos
    // actores, plan §69): quién está aprobando, siempre visible.
    const banner = document.getElementById('aprob-banner');
    if (banner) {
        const u = currentUser();
        const nombre = u?.profile?.displayName || u?.user?.email?.split('@')[0] || 'dueño';
        banner.textContent = `Estás aprobando como ${nombre} (dueño)`;
    }

    try {
        const negocio = await getConfig('negocio');
        if (typeof negocio?.diasPlazo === 'number' && negocio.diasPlazo >= 0) _diasPlazo = negocio.diasPlazo;
        if (negocio?.fechaCorteMigracion) _fechaCorte = negocio.fechaCorteMigracion;
    } catch (err) { console.warn('[aprobaciones] config negocio:', err); }
    try {
        const cartera = await getConfig('cartera');
        if (Number.isInteger(cartera?.slaRevisionDias) && cartera.slaRevisionDias >= 1) _slaDias = cartera.slaRevisionDias;
    } catch (err) { console.warn('[aprobaciones] config cartera:', err); }

    wireRechazo();

    // Clicks delegados de las tarjetas (la lista se re-pinta entera por snapshot).
    // Los rechazos automáticos pasan SIEMPRE por confirmarRechazoAutomatico (re-lee
    // y re-valida antes de escribir — el render solo sugiere, nunca decide).
    document.getElementById('aprob-list')?.addEventListener('click', (e) => {
        const aprobar = e.target.closest('[data-aprobar]');
        if (aprobar) { handleAprobar(aprobar.dataset.cliente, aprobar.dataset.aprobar, aprobar); return; }
        const rechazar = e.target.closest('[data-rechazar]');
        if (rechazar) { abrirRechazo(rechazar.dataset.cliente, rechazar.dataset.rechazar); return; }
        const reintentar = e.target.closest('[data-reintentar]');
        if (reintentar) { render(); return; }
        const obsoleta = e.target.closest('[data-obsoleta]');
        if (obsoleta) {
            admConfirm('Este registro parece corregido por otra vía. ¿Marcar la solicitud como obsoleta? Se verifica de nuevo contra el registro actual antes de escribir; Kary la verá rechazada y podrá volver a corregir sobre lo actual.', () => {
                confirmarRechazoAutomatico(obsoleta.dataset.cliente, obsoleta.dataset.obsoleta);
            });
            return;
        }
        const incoherente = e.target.closest('[data-incoherente]');
        if (incoherente) {
            admConfirm('Los datos de la solicitud no cuadran con el registro actual. ¿Rechazarla? Se verifica de nuevo antes de escribir; Kary la verá y podrá volver a corregir sobre lo actual.', () => {
                confirmarRechazoAutomatico(incoherente.dataset.cliente, incoherente.dataset.incoherente);
            });
        }
    });

    onSolicitudesPendientesChange(
        (list) => { _pendientes = list; render(); },
        () => renderColaRota(),
    );
}

// La cola NUNCA muere en silencio: si el listener falla (índice en construcción,
// permiso, red persistente), Daniel ve un estado de ERROR distinguible de "al día".
function renderColaRota() {
    const valor = document.getElementById('stat-aprob-valor');
    const icono = document.getElementById('stat-aprob-icon');
    if (valor) valor.textContent = 'Error al cargar';
    if (icono) icono.className = 'adm-stat-icon adm-stat-icon--red';
    const lista = document.getElementById('aprob-list');
    const empty = document.getElementById('aprob-empty');
    if (empty) empty.hidden = true;
    if (lista) {
        lista.replaceChildren(el('div', {
            css: 'color:var(--adm-danger,#c0392b);font-size:13px;font-weight:600;',
            text: '⚠️ No se pudo cargar la cola de aprobación. Recarga la página (Ctrl+Shift+R); si el problema sigue, las solicitudes de Kary están esperando aunque no se vean aquí.',
        }));
    }
}
