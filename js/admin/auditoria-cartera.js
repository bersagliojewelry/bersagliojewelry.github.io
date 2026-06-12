/**
 * Bersaglio Admin — "Cartera: mes en curso" (Fase M · M4, owner-only en Salud).
 *
 * La pata DETECTIVA visible: consume los detectores PUROS de js/crm-auditoria.js
 * sobre los listeners en vivo y RESALTA lo que las reglas no pueden sumar
 * (pitufeo mensual, correcciones sin enlace, rechazos burlados) + recaudo por
 * medio para la conciliación, la muestra trimestral sembrada, el último corte y
 * el ACTA mensual (create-once owner). Agrupado por reloj del SERVIDOR siempre.
 *
 * XSS: tarjetas construidas con createElement/textContent (cero interpolación).
 */

import { admToast, admConfirm, esc, fmtDateTime, currentUser } from './shared.js';
import {
    onAllMovimientosChange, onSolicitudesPendientesChange, onSolicitudesRechazadasRecientes,
    onClientesChange, onActaChange, crearActa, onUltimoCorteChange, getConfig, fmtCOP,
} from '../crm-service.js';
import {
    mesDe, trimestreDe, pendientesFueraDeSLA, ajustesNegativosAuto, anulacionesDelMes,
    rechazadasBurladas, abonosPorMedio, muestraTrimestral,
} from '../crm-auditoria.js';

const MEDIO_LABEL = { efectivo: 'Efectivo', transferencia: 'Transferencia', datafono: 'Datáfono', otro: 'Otro', sin_medio: 'Sin medio (antiguos)' };

let _movs = [];
let _movsLoaded = false;       // el acta JAMÁS se levanta antes del primer snapshot
let _movsTruncados = false;    // ni con la lista cortada en el tope (totales parciales)
let _pendientes = [];
let _rechazadas = [];
let _nombres = new Map();      // clienteId → nombre
let _cfg = { topeMensual: 50000, slaDias: 2 };
let _ownerUid = null;
let _actaMesAnterior = null;   // acta del mes que cerró (la que toca levantar)
let _actaError = false;        // listener del acta muerto → no ofrecer el form
let _mesAnterior = '';

function el(tag, { cls, css, text, title } = {}) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (css) n.style.cssText = css;
    if (text != null) n.textContent = text;
    if (title) n.title = title;
    return n;
}
const nombre = (id) => _nombres.get(id) || id || 'Clienta';

function mesActual() { return mesDe(new Date()); }
// ANCLADO al día 1 (verif. M4): setMonth sobre un día 29-31 "normaliza" hacia
// adelante y devolvería el mes EN CURSO — el acta inmutable se quemaría con el
// mes equivocado justo en los cierres de mes.
function mesAnteriorLocal() {
    const h = new Date();
    return mesDe(new Date(h.getFullYear(), h.getMonth() - 1, 1));
}

// ─── Render de cada bloque (pisar el contenedor, datos en vivo) ───────────────

function bloque(titulo, nodos, { alerta = false, vacio = 'Sin novedades este mes.' } = {}) {
    const box = el('div', { css: `padding:14px 16px;border-radius:14px;margin-bottom:12px;background:${alerta ? 'var(--adm-danger-light,#fdecea)' : 'var(--adm-soft,#f5f3ef)'};` });
    box.appendChild(el('div', {
        css: 'font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--adm-muted);margin-bottom:8px;font-weight:700;',
        text: titulo,
    }));
    const vacios = nodos.filter(Boolean);
    if (!vacios.length) box.appendChild(el('div', { css: 'font-size:13px;color:var(--adm-muted);', text: vacio }));
    else vacios.forEach((n) => box.appendChild(n));
    return box;
}

function fila(izq, der, { rojo = false, ambar = false } = {}) {
    const f = el('div', { css: 'display:flex;justify-content:space-between;gap:10px;font-size:13px;padding:3px 0;' });
    const l = el('span', { text: izq });
    const r = el('span', { cls: 'adm-money', text: der });
    if (rojo) { l.style.color = 'var(--adm-danger)'; l.style.fontWeight = '600'; r.style.color = 'var(--adm-danger)'; }
    else if (ambar) { l.style.color = '#9a7730'; l.style.fontWeight = '600'; }
    f.append(l, r);
    return f;
}

function render() {
    const cont = document.getElementById('audit-cont');
    if (!cont) return;
    const mes = mesActual();
    const ahora = Date.now();

    // (1) Degradado por SLA — también pinta la entrada del banner rojo superior.
    const sla = pendientesFueraDeSLA(_pendientes, _cfg.slaDias, ahora);
    const banner = document.getElementById('audit-degradado');
    if (banner) {
        banner.hidden = !sla.degradado;
        if (sla.degradado) {
            banner.textContent = `⛔ ${sla.vencidas.length} solicitud(es) de Kary llevan más de ${sla.slaDias} días esperando tu aprobación — revísalas arriba.`;
        }
    }

    // (2) Tajadas del mes (ajustes negativos auto) por clienta vs tope mensual.
    const taj = ajustesNegativosAuto(_movs, mes, { topeMensual: _cfg.topeMensual, ownerUid: _ownerUid });
    const tajNodos = [...taj.porClienta.entries()]
        .sort((a, b) => b[1].total - a[1].total)
        .map(([cid, c]) => fila(
            `${nombre(cid)} — ${c.items.length} ajuste(s)${c.sobreTopeMensual ? ' · SOBRE EL TOPE MENSUAL' : (c.multiplesNeutros ? ' · varios en el mes' : '')}`,
            `−${fmtCOP(c.total)}`,
            { rojo: c.sobreTopeMensual, ambar: !c.sobreTopeMensual && c.multiplesNeutros },
        ));
    if (taj.global > 0) tajNodos.push(fila(`TOTAL del mes (tope por clienta: ${fmtCOP(taj.topeMensual)})`, `−${fmtCOP(taj.global)}`, { rojo: taj.sobreTopeGlobal }));

    // (3) Anulaciones del mes + flags deterministas.
    const anul = anulacionesDelMes(_movs, mes, { topeMensual: _cfg.topeMensual, ownerUid: _ownerUid });
    const anulNodos = [];
    for (const i of anul.sinEnlace) {
        anulNodos.push(fila(`⛔ CORRECCIÓN SIN ENLACE — ${nombre(i.clienteId)} (${i.motivoCategoria}): el reemplazo falta o no está vigente`, fmtCOP(Math.abs(i.monto || 0)), { rojo: true }));
    }
    for (const i of anul.correccionesFecha) {
        anulNodos.push(fila(`📅 Corrección de FECHA — ${nombre(i.clienteId)}`, fmtCOP(Math.abs(i.monto || 0)), { ambar: true }));
    }
    for (const [cid, c] of anul.porClienta.entries()) {
        if (c.sobreTopeMensual) anulNodos.push(fila(`${nombre(cid)} — Σ anulado del mes SOBRE EL TOPE (${c.n} anulación(es))`, fmtCOP(c.total), { rojo: true }));
    }
    if (anul.items.length && !anulNodos.length) {
        anulNodos.push(fila(`${anul.items.length} anulación(es) este mes — todas con enlace y bajo el tope`, ''));
    }

    // (3b) Rechazadas burladas.
    const burladas = rechazadasBurladas(_rechazadas, _movs, { ownerUid: _ownerUid });
    const burlNodos = burladas.map((b) => fila(
        `🚨 ${nombre(b.solicitud.clienteId)}: rechazaste ${fmtCOP(Math.abs(b.solicitud.monto))} y ${b.diasDespues} día(s) después apareció un ajuste directo de ${fmtCOP(Math.abs(b.ajuste.monto))}`,
        '', { rojo: true },
    ));

    // (4) Recaudo del mes por medio (insumo del acta).
    const rec = abonosPorMedio(_movs, mes);
    const recNodos = [...rec.porMedio.entries()].map(([medio, v]) =>
        fila(`${MEDIO_LABEL[medio] || medio} (${v.n})`, fmtCOP(v.total)));
    if (rec.total > 0) recNodos.push(fila('TOTAL recaudado (vigente)', fmtCOP(rec.total)));
    if (rec.anuladosTotal > 0) recNodos.push(fila('⚠️ Abonos ANULADOS este mes (no suman)', fmtCOP(rec.anuladosTotal), { ambar: true }));

    // (5) Muestra trimestral sembrada (para cotejar contra soportes, política A.5).
    const tri = trimestreDe(new Date());
    const muestra = muestraTrimestral(_movs, tri);
    const muestraNodos = muestra.map((m) => fila(
        `${nombre(m.clienteId)} — ajuste ${fmtFechaCorta(m.registradoEn)}${m.motivo ? ` (${m.motivo})` : ''}`,
        fmtCOP(Math.abs(m.monto || 0)),
    ));

    cont.replaceChildren(
        bloque(`Ajustes directos del mes (tajadas) — ${mes}`, tajNodos),
        bloque('Anulaciones y banderas', anulNodos),
        ...(burlNodos.length ? [bloque('🚨 Posible "no" burlado', burlNodos, { alerta: true })] : []),
        bloque('Recaudo por medio de pago (mes en curso)', recNodos, { vacio: 'Aún no hay abonos registrados este mes.' }),
        bloque(`Muestra del trimestre ${tri} para cotejar contra soportes (sorteo fijo: ${muestra.length})`, muestraNodos,
            { vacio: 'Ningún ajuste para cotejar este trimestre.' }),
    );
}

function fmtFechaCorta(ts) {
    const d = ts?.toDate ? ts.toDate() : null;
    return d ? d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) : '—';
}

// ─── Acta mensual (create-once, owner) ─────────────────────────────────────────
// REGLAS DE ESTABILIDAD (verif. M4): el formulario se construye UNA vez y NUNCA
// se reconstruye por un snapshot de movimientos (borraría lo que Daniel está
// escribiendo); solo el RESUMEN de recaudo se refresca por textContent. Y el
// acta no se puede levantar con datos incompletos: ni antes de que carguen los
// movimientos, ni con la lista truncada, ni si el listener del acta falló.
function textoResumenActa() {
    const rec = abonosPorMedio(_movs, _mesAnterior);
    return rec.porMedio.size
        ? 'Recaudo registrado ese mes: ' + [...rec.porMedio.entries()].map(([k, v]) => `${MEDIO_LABEL[k] || k} ${fmtCOP(v.total)}`).join(' · ')
        : 'Ese mes no registró abonos.';
}

function renderActa() {
    const cont = document.getElementById('acta-cont');
    if (!cont) return;

    // El form ya está montado y el estado no cambió → solo refrescar el resumen
    // (jamás tocar checkboxes/textarea con un re-render en vivo).
    if (!_actaMesAnterior && !_actaError && document.getElementById('acta-form-box')) {
        const res = document.getElementById('acta-resumen');
        if (res && _movsLoaded) res.textContent = textoResumenActa();
        return;
    }

    cont.replaceChildren();
    cont.appendChild(el('div', { css: 'font-size:13px;margin-bottom:8px;', text: `Acta de conciliación del mes cerrado (${_mesAnterior}):` }));

    if (_actaError) {
        cont.appendChild(el('div', { css: 'font-size:13px;color:var(--adm-danger);font-weight:600;', text: '⚠️ No se pudo verificar si el acta ya existe — recarga la página antes de levantarla.' }));
        return;
    }
    if (_actaMesAnterior) {
        const a = _actaMesAnterior;
        const ok = a.bancoCuadra && a.efectivoCuadra;
        cont.appendChild(el('div', {
            css: `font-size:13px;font-weight:600;color:${ok ? 'var(--adm-success,#2e7d32)' : 'var(--adm-danger)'};`,
            text: `${ok ? '✅ Levantada y CUADRADA' : '⚠️ Levantada CON DIFERENCIAS'} — ${fmtDateTime(a.creadoEn)}`,
        }));
        if (a.diferencias) cont.appendChild(el('div', { css: 'font-size:13px;color:var(--adm-muted);margin-top:4px;', text: `Diferencias: ${a.diferencias}` }));
        return;
    }
    if (!_movsLoaded) {
        cont.appendChild(el('div', { css: 'font-size:13px;color:var(--adm-muted);', text: 'Cargando movimientos…' }));
        return;
    }
    if (_movsTruncados) {
        cont.appendChild(el('div', { css: 'font-size:13px;color:var(--adm-danger);font-weight:600;', text: '⚠️ La lista de movimientos está incompleta (tope de carga) — no se puede levantar el acta con totales parciales.' }));
        return;
    }

    // Sin acta aún: prefill con el recaudo REAL del mes cerrado + form one-way.
    const box = el('div'); box.id = 'acta-form-box';
    const resumen = el('div', { css: 'font-size:13px;color:var(--adm-muted);margin-bottom:8px;' });
    resumen.id = 'acta-resumen';
    resumen.textContent = textoResumenActa();
    box.appendChild(resumen);

    const chk = (id, txt) => {
        const lab = el('label', { css: 'display:flex;gap:8px;align-items:center;font-size:13px;margin:6px 0;cursor:pointer;' });
        const c = document.createElement('input'); c.type = 'checkbox'; c.id = id;
        lab.append(c, el('span', { text: txt }));
        return lab;
    };
    box.appendChild(chk('acta-banco', 'El banco CUADRA: Σ(transferencias + datáfono) coincide con el extracto'));
    box.appendChild(chk('acta-efectivo', 'El efectivo CUADRA: el arqueo coincide con Σ(abonos en efectivo)'));
    const dif = document.createElement('textarea');
    dif.id = 'acta-diferencias'; dif.className = 'adm-input'; dif.rows = 2;
    dif.placeholder = 'Diferencias encontradas (si todo cuadra, déjalo vacío)';
    box.appendChild(dif);
    const btn = el('button', { cls: 'adm-btn adm-btn--primary adm-btn--sm', text: `Levantar el acta de ${_mesAnterior}` });
    btn.style.marginTop = '8px';
    btn.addEventListener('click', () => {
        const banco = document.getElementById('acta-banco').checked;
        const efectivo = document.getElementById('acta-efectivo').checked;
        const diferencias = document.getElementById('acta-diferencias').value.trim();
        if (!_movsLoaded || _movsTruncados) { admToast('Los movimientos no han cargado completos — espera un momento.', 'danger'); return; }
        if (_mesAnterior === mesActual()) { admToast('Ese mes aún no cierra.', 'danger'); return; }
        if ((!banco || !efectivo) && !diferencias) {
            admToast('Si algo NO cuadra, escribe la diferencia — el acta queda para siempre.', 'danger');
            return;
        }
        if (banco && efectivo && diferencias) {
            admToast('Marcaste que TODO cuadra pero escribiste diferencias — desmarca lo que no cuadre o borra el texto.', 'danger');
            return;
        }
        admConfirm(`El acta de ${_mesAnterior} es INMUTABLE: queda registrada una sola vez y no se puede editar. ¿Levantarla?`, async () => {
            try {
                const totalPorMedio = {};
                for (const [k, v] of abonosPorMedio(_movs, _mesAnterior).porMedio.entries()) totalPorMedio[k] = v.total;
                await crearActa(_mesAnterior, {
                    totalPorMedio, bancoCuadra: banco, efectivoCuadra: efectivo, diferencias,
                    uid: currentUser()?.user?.uid,
                });
                admToast('Acta levantada — quedó en el libro.');
            } catch (err) {
                console.error('[auditoria] crearActa:', err);
                admToast(err?.code === 'permission-denied'
                    ? 'No se pudo levantar: puede que el acta de este mes YA exista — recarga la página (Ctrl+Shift+R).'
                    : 'No se pudo levantar el acta.', 'danger');
            }
        });
    });
    box.appendChild(btn);
    cont.appendChild(box);
}

function renderCorte(corte) {
    const elC = document.getElementById('audit-corte');
    if (!elC) return;
    elC.textContent = corte
        ? `📸 Último corte inmutable: ${corte.mes} — ${corte.totalClientes} clienta(s), vencido ${fmtCOP(corte.totales?.vencido || 0)} (generado ${fmtDateTime(corte.generadoEn)})`
        : '📸 Aún no hay cortes mensuales: el primero se toma automáticamente el día 1 a las 3:50 AM.';
}

// ─── Init (lo llama salud.js tras requireAuth('owner')) ────────────────────────
export async function initAuditoriaCartera() {
    _ownerUid = currentUser()?.user?.uid || null;
    _mesAnterior = mesAnteriorLocal();

    try {
        const cc = await getConfig('cartera');
        if (Number(cc?.autoAprobacionMax) > 0) _cfg.topeMensual = Number(cc.autoAprobacionMax);
        if (Number.isInteger(cc?.slaRevisionDias) && cc.slaRevisionDias >= 1) _cfg.slaDias = cc.slaRevisionDias;
    } catch (err) { console.warn('[auditoria] config cartera:', err); }

    // Truncado del listener de movimientos → el acta queda BLOQUEADA (totales
    // parciales no se congelan en un doc inmutable).
    document.addEventListener('bj:truncado', (e) => {
        if (String(e.detail?.origen || '').includes('Movimientos')) { _movsTruncados = true; renderActa(); }
    });

    onClientesChange((list) => {
        _nombres = new Map(list.map((c) => [c.id, c.nombre || c.id]));
        render();
    });
    onAllMovimientosChange((list) => { _movs = list; _movsLoaded = true; render(); renderActa(); });
    onSolicitudesPendientesChange((list) => { _pendientes = list; render(); },
        () => { /* la cola de aprobaciones ya pinta su propio estado de error */ });
    // Ventana 120d sobre creadoEn (la detección de burlas corre sobre resueltoEn,
    // 30d): una solicitud RECHAZADA cuya creación sea más vieja que la ventana
    // escapa al listener — trade-off documentado para no exigir índice nuevo.
    onSolicitudesRechazadasRecientes(120, (list) => { _rechazadas = list; render(); },
        () => admToast('No se pudo cargar el historial de rechazos (auditoría).', 'danger'));
    onActaChange(_mesAnterior, (acta) => { _actaMesAnterior = acta; _actaError = false; renderActa(); },
        () => { _actaError = true; renderActa(); });
    onUltimoCorteChange((corte) => renderCorte(corte), () => {
        const elC = document.getElementById('audit-corte');
        if (elC) elC.textContent = '⚠️ No se pudo consultar los cortes mensuales — recarga la página.';
    });

    // El SLA también cruza el umbral por puro PASO DEL TIEMPO (pestaña abierta):
    // re-evaluación periódica local (cero lecturas extra; render es idempotente).
    setInterval(render, 10 * 60 * 1000);
}
