/**
 * Bersaglio Admin — Hoy (pulso del negocio · F-IA-2 B3 · [OPUS-4.8]).
 *
 * El "Hoy" deja de ser un buzón de leads (esas viven en Interesados) y pasa a ser el PULSO del
 * negocio: qué se vendió hoy, cuánto hay en caja, quién paga esta semana, qué falta entregar y qué
 * avisos esperan. TODO es de SOLO LECTURA (listeners) — el pulso NUNCA escribe ni mueve dinero.
 *
 * Cada señal es un widget autónomo {query → agregado → render} GATEADO POR ROL: si el rol no puede
 * leer su fuente, la tarjeta ni se monta (sin tormentas de permission-denied, L-78). Los
 * formateadores y el censo de estados se REUSAN (pedidos-format / caja-format / crm-estado-cuenta)
 * → los números del Hoy coinciden con los de sus páginas fuente (conservación, caza-bugs §2b). El
 * "efectivo del turno" y el "efectivo total" del owner salen del MISMO controlador `cajaLive` y de
 * la MISMA fórmula que el Mostrador (caja-format) → no pueden divergir. Dinero SIN clamp: un
 * negativo se pinta en rojo, jamás se recorta a $0 (L-26/§181).
 *
 * XSS: todo dato dinámico (nombres, códigos) entra al DOM por textContent (builder `el`), nunca innerHTML.
 */

import adminDb from './db.js';
import { admToast, initSidebar, requireAuth, currentRole, hasRole } from './shared.js';
import { initAvisoSolicitudes } from './aviso-solicitudes.js';
import { pmark, psummary } from '../core/perf-probe.js';   // sonda TODO-33 (gateada; no-op si off)
import {
    fmtCOP, getConfig, onClientesChange, onAllMovimientosChange, onAllAcuerdosVigentesChange,
    onSolicitudesPendientesChange, onSaludEventosChange,
} from '../crm-service.js';
import {
    onPedidosChange, onTurnosChange, onVentasTurnoChange, onMovsCajaChange, onBovedaChange,
} from '../pedidos-service.js';
import { estadoCuenta, hoyISO } from '../crm-estado-cuenta.js';
import { estadoPedido, idVisible } from './pedidos-format.js';
import { efectivoEnCajon, ventasEfectivoTurno } from './caja-format.js';
import { rangoDia, ventasDeHoy, pedidosPorEntregar, cuotaEnVentana } from './hoy-format.js';
import { firestoreDb } from '../firebase-config.js';
import { doc, getDoc } from 'firebase/firestore';

// COP con signo: una anomalía negativa se VE (sin clamp — patrón boveda/pos). Entero, es-CO.
const copSigned = (v) => { const x = Math.round(Number(v) || 0); return (x < 0 ? '-$' : '$') + Math.abs(x).toLocaleString('es-CO'); };
// Entero COP no negativo (montos de entrada). Espeja `entero` de pos.js / `pos` de caja-format.
const ent = (v) => Math.round(Math.max(0, Number(v) || 0));
// 'YYYY-MM-DD' → 'DD/MM' (corto para la lista de cobros). '' si no es ISO.
const fechaCorta = (iso) => (typeof iso === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(iso)) ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '';

// ─── Mini-builder DOM (texto SIEMPRE por textContent → cero superficie de inyección) ───────────
function el(tag, { cls, css, text, href } = {}, kids = []) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (css) node.style.cssText = css;
    if (text != null) node.textContent = text;
    if (href) node.href = href;
    for (const k of [].concat(kids)) if (k) node.appendChild(k);
    return node;
}

// Tarjeta de señal reutilizable (misma estructura .adm-stat-card del panel; icono = emoji tintado).
function statCard({ icon, tone, label }) {
    const val = el('div', { cls: 'adm-stat-value', text: '—' });
    const sub = el('div', { cls: 'adm-stat-exacto' });
    const card = el('div', { cls: 'adm-stat-card' }, [
        el('div', { cls: `adm-stat-icon adm-stat-icon--${tone}`, text: icon }),
        el('div', { cls: 'adm-stat-body' }, [val, el('div', { cls: 'adm-stat-label', text: label }), sub]),
    ]);
    return { card, val, sub };
}

// Sección de "lista corta" bajo el pulso (nombres / deep-links). Oculta cuando no hay filas.
function seccionLista(titulo) {
    const wrap = document.getElementById('pulso-listas');
    const body = el('div', { css: 'display:flex;flex-direction:column;' });
    const sec = el('div', { cls: 'adm-section' }, [
        el('div', { cls: 'adm-section-head' }, [el('h2', { text: titulo })]),
        body,
    ]);
    sec.hidden = true;
    wrap?.appendChild(sec);
    return { sec, body };
}
const FILA_CSS = 'display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--adm-border);font-size:13px;text-decoration:none;color:inherit;';
const ELIPSIS = 'flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';

// Cache UID → nombre legible (respeta la invisibilidad de root: sin permiso → sin nombre, jamás lo revela).
const _nameCache = new Map();
async function resolverNombre(uid) {
    if (!uid) return '';
    if (_nameCache.has(uid)) return _nameCache.get(uid);
    let label = '';
    try {
        const s = await getDoc(doc(firestoreDb, 'users', uid));
        if (s.exists()) { const d = s.data(); label = d.displayName || d.email || ''; }
    } catch { /* root invisible / sin permiso → sin nombre (nunca revela) */ }
    _nameCache.set(uid, label);
    return label;
}

// ═══ Init de la página ════════════════════════════════════════════════════════════════════════
async function init() {
    pmark('page:init-start');
    await requireAuth('editor');
    pmark('page:auth-done');
    await adminDb.init();
    pmark('page:adminDb-done');
    initSidebar();
    pmark('page:sidebar-done');

    // Banner de solicitudes fuera de plazo (Fase M · M4; solo admin/owner, se sale solo si no aplica).
    initAvisoSolicitudes();

    // Pulso del negocio (F-IA-2 B3) — read-only, gateado por rol.
    initPulso();

    // Stats de catálogo (inventario), en vivo vía adminDb.
    updateStats(adminDb.getStats());
    adminDb.on('stats', updateStats);
    pmark('page:first-data-render'); psummary('hoy');

    document.getElementById('btn-export-quick')?.addEventListener('click', () => {
        adminDb.exportPiecesCSV();
        admToast('Descargando la lista de piezas…');
    });
}

function updateStats(stats) {
    const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    set('stat-total-piezas', stats.totalPieces);
    set('stat-destacadas', stats.featuredPieces);
    set('stat-colecciones', stats.collections);
    set('stat-consultas', stats.unread);
}

// ═══ PULSO ══════════════════════════════════════════════════════════════════════════════════════
function initPulso() {
    const grid = document.getElementById('pulso-cards');
    if (!grid) return;
    const rol = currentRole();
    const puedePedidos = ['owner', 'admin', 'catalogo'].includes(rol);   // lectura de `pedidos` (staff de ventas)
    const puedeCaja    = ['owner', 'admin', 'caja'].includes(rol);       // lectura de caja/turnos (isCaja)
    const esAdmin = hasRole('admin');
    const esOwner = hasRole('owner');

    // Controlador ÚNICO de caja en vivo (turnos + ventas/movs del abierto + bóveda si owner). La señal
    // #2 y la fila owner lo comparten → "efectivo del turno" y "efectivo total" no pueden divergir.
    const cajaLive = puedeCaja ? crearCajaLive({ conBoveda: esOwner }) : null;

    if (puedePedidos) initSenalPedidos(grid);            // #1 Vendido hoy + #4 Por entregar (una sola fuente)
    if (cajaLive) initSenalTurno(grid, cajaLive);        // #2 Efectivo del turno
    if (esAdmin) initSenalCobros(grid);                  // #3 Cobros de la semana (gateado por acuerdosActivos)
    if (esAdmin || esOwner) initSenalAvisos(grid, esOwner);  // #5 Avisos
    if (esOwner && cajaLive) initSenalOwner(grid, cajaLive); // fila owner: efectivo total + último arqueo
}

// ─── Controlador de caja en vivo (compartido) ─────────────────────────────────────────────────
function crearCajaLive({ conBoveda }) {
    const subs = [];
    const state = { turno: null, cajon: 0, cajonListo: false, boveda: null, arqueoDescuadre: null, operadora: '', error: false };
    let ventas = [], movs = [], ventasReady = false, movsReady = false, turnoUnsubs = [];

    const emit = () => subs.forEach((fn) => { try { fn(state); } catch (e) { console.error('[hoy] cajaLive listener', e); } });

    // Recalcula el estimado con la MISMA fórmula del Mostrador (caja-format.efectivoEnCajon +
    // ventasEfectivoTurno) y los acumuladores de traslado del DOC del turno (atómicos, sin carrera).
    const recompCajon = () => {
        if (!state.turno) { state.cajon = 0; state.cajonListo = false; return; }
        if (!(ventasReady && movsReady)) { state.cajonListo = false; return; }   // foto completa (§2b): no pintar a medio llegar
        const ingresos = movs.reduce((s, m) => (!m.anulado && m.tipo === 'ingreso') ? s + ent(m.monto) : s, 0);
        const egresos  = movs.reduce((s, m) => (!m.anulado && m.tipo === 'egreso')  ? s + ent(m.monto) : s, 0);
        state.cajon = efectivoEnCajon({
            fondoApertura: state.turno.fondoApertura, ventasEfectivo: ventasEfectivoTurno(ventas),
            ingresos, egresos, cajonABoveda: state.turno.cajonABoveda, bovedaACajon: state.turno.bovedaACajon,
        });
        state.cajonListo = true;
    };

    const rewire = (id) => {
        turnoUnsubs.forEach((u) => { try { u(); } catch { /* noop */ } });
        turnoUnsubs = [];
        ventas = []; movs = []; ventasReady = false; movsReady = false;
        if (!id) return;
        turnoUnsubs.push(onVentasTurnoChange(id, (v) => { ventas = v; ventasReady = true; recompCajon(); emit(); }, () => { /* rol sin lectura → sin estimado */ }));
        turnoUnsubs.push(onMovsCajaChange(id, (m) => { movs = m; movsReady = true; recompCajon(); emit(); }, () => { /* idem */ }));
    };

    onTurnosChange((turnos) => {
        const abierto = turnos.find((t) => t.estado === 'abierto') || null;
        // Último arqueo = turno CERRADO más reciente con descuadre numérico (turnos vienen desc por apertura).
        const cerrado = turnos.find((t) => t.estado === 'cerrado' && Number.isFinite(Number(t.descuadre)));
        state.arqueoDescuadre = cerrado ? Number(cerrado.descuadre) : null;
        state.error = false;
        if ((abierto?.id || null) !== (state.turno?.id || null)) rewire(abierto?.id || null);
        state.turno = abierto;
        recompCajon();
        emit();
        // Operadora (best-effort, no bloquea el pulso; respeta invisibilidad de root).
        if (abierto?.aperturaPor) {
            resolverNombre(abierto.aperturaPor).then((nm) => { if (state.turno?.id === abierto.id) { state.operadora = nm; emit(); } });
        } else { state.operadora = ''; }
    }, 60, () => { state.error = true; emit(); });

    if (conBoveda) {
        onBovedaChange((b) => { state.boveda = b; emit(); }, () => { state.boveda = null; emit(); });
    }

    return { onChange: (fn) => { subs.push(fn); fn(state); } };
}

// ─── #1 Vendido hoy  +  #4 Por entregar (una sola suscripción a `pedidos`) ─────────────────────
function initSenalPedidos(grid) {
    const vendido  = statCard({ icon: '💵', tone: 'emerald', label: 'Vendido hoy' });
    const entregar = statCard({ icon: '📦', tone: 'gold', label: 'Por entregar' });
    grid.append(vendido.card, entregar.card);
    const lista = seccionLista('Pedidos por entregar');

    onPedidosChange((pedidos) => {
        const { inicioMs, finMs } = rangoDia();
        const v = ventasDeHoy(pedidos, inicioMs, finMs);   // { n, totalCOP } — mismo censo que el KPI de Pedidos
        vendido.val.textContent = fmtCOP(v.totalCOP);
        vendido.sub.textContent = v.n === 0 ? 'Sin ventas aún hoy' : `${v.n} pedido${v.n === 1 ? '' : 's'}`;

        const porEntregar = pedidosPorEntregar(pedidos);
        entregar.val.textContent = String(porEntregar.length);
        entregar.sub.textContent = porEntregar.length === 0 ? 'Nada pendiente' : 'pendientes de entrega';
        renderListaEntregar(lista, porEntregar.slice(0, 6));
    }, 200, () => { vendido.sub.textContent = 'Sin conexión — reintentando'; });
}

function renderListaEntregar({ sec, body }, pedidos) {
    body.replaceChildren();
    sec.hidden = pedidos.length === 0;
    for (const p of pedidos) {
        const est = estadoPedido(p.estado);
        body.appendChild(el('a', { css: FILA_CSS, href: `admin-pedidos.html?id=${encodeURIComponent(p.id)}` }, [
            el('strong', { text: idVisible(p) }),
            el('span', { cls: `adm-pill adm-pill--${est.pill}`, text: est.label }),
            el('span', { css: ELIPSIS + 'color:var(--adm-muted);', text: p.pieceName || '—' }),
        ]));
    }
}

// ─── #2 Efectivo del turno ─────────────────────────────────────────────────────────────────────
function initSenalTurno(grid, cajaLive) {
    const c = statCard({ icon: '🧾', tone: 'green', label: 'Efectivo del turno' });
    grid.append(c.card);
    cajaLive.onChange((s) => {
        if (s.error)        { c.val.textContent = 'Sin conexión'; c.val.style.color = ''; c.sub.textContent = 'Reintentando…'; return; }
        if (!s.turno)       { c.val.textContent = 'Caja cerrada'; c.val.style.color = ''; c.sub.textContent = 'Ábrela en el Mostrador'; return; }
        if (!s.cajonListo)  { c.val.textContent = 'Calculando…'; c.val.style.color = ''; c.sub.textContent = `Fondo ${fmtCOP(s.turno.fondoApertura)}`; return; }
        c.val.textContent = copSigned(s.cajon);
        c.val.style.color = s.cajon < 0 ? 'var(--adm-danger)' : '';
        c.sub.textContent = `Fondo ${fmtCOP(s.turno.fondoApertura)}${s.operadora ? ' · abrió ' + s.operadora : ''}`;
    });
}

// ─── #3 Cobros de la semana (cuotas de acuerdos que vencen ≤ hoy+7) ────────────────────────────
function initSenalCobros(grid) {
    const c = statCard({ icon: '⏰', tone: 'gold', label: 'Cobros de la semana' });
    const lista = seccionLista('Quién paga esta semana');
    let diasPlazo = 30, fechaCorte = null, horizonteDias = 730, incumplidoCuotas = 2;
    let clientes = [], movs = [], acuerdos = new Map(), montado = false;

    const montar = () => { if (!montado) { grid.append(c.card); montado = true; } };

    Promise.all([getConfig('negocio').catch(() => null), getConfig('cartera').catch(() => null)]).then(([neg, car]) => {
        if (typeof neg?.diasPlazo === 'number' && neg.diasPlazo >= 0) diasPlazo = neg.diasPlazo;
        if (neg?.fechaCorteMigracion) fechaCorte = neg.fechaCorteMigracion;
        if (typeof car?.horizonteAcuerdoDias === 'number' && car.horizonteAcuerdoDias > 0) horizonteDias = car.horizonteAcuerdoDias;
        if (Number.isInteger(car?.acuerdoIncumplidoCuotas) && car.acuerdoIncumplidoCuotas >= 1) incumplidoCuotas = car.acuerdoIncumplidoCuotas;

        // Sin acuerdos activos NO hay cronogramas de cuotas → señal inerte pero HONESTA (§0.5).
        if (car?.acuerdosActivos !== true) {
            montar();
            c.val.textContent = '—';
            c.sub.textContent = 'Sin acuerdos de pago activos';
            return;
        }
        montar();
        onClientesChange((list) => { clientes = list; recompute(); });
        onAllMovimientosChange((m) => { movs = m; recompute(); });
        onAllAcuerdosVigentesChange((list) => {
            acuerdos = new Map();
            for (const a of list) { if (!a.clienteId) continue; if (!acuerdos.has(a.clienteId)) acuerdos.set(a.clienteId, []); acuerdos.get(a.clienteId).push(a); }
            recompute();
        }, () => { acuerdos = new Map(); recompute(); });   // listener muerto → sin plan (conservador)
    });

    function recompute() {
        const byCliente = new Map();
        for (const m of movs) { if (!m.clienteId) continue; if (!byCliente.has(m.clienteId)) byCliente.set(m.clienteId, []); byCliente.get(m.clienteId).push(m); }
        const hoy = hoyISO();
        const filas = [];
        let total = 0;
        for (const cli of clientes) {
            const est = estadoCuenta(byCliente.get(cli.id) || [], { diasPlazo, fechaCorte, acuerdos: acuerdos.get(cli.id) || [], horizonteDias, incumplidoCuotas });
            const cuota = cuotaEnVentana(est.plan, hoy, 7);
            if (cuota) { filas.push({ id: cli.id, nombre: cli.nombre || 'Cliente', fecha: cuota.fecha, monto: cuota.monto }); total += Math.round(Number(cuota.monto) || 0); }
        }
        filas.sort((a, b) => a.fecha.localeCompare(b.fecha));
        c.val.textContent = fmtCOP(total);
        c.sub.textContent = filas.length === 0 ? 'Nadie con cuota esta semana' : `${filas.length} cliente${filas.length === 1 ? '' : 's'}`;
        renderListaCobros(lista, filas.slice(0, 6));
    }
}

function renderListaCobros({ sec, body }, filas) {
    body.replaceChildren();
    sec.hidden = filas.length === 0;
    for (const f of filas) {
        body.appendChild(el('a', { css: FILA_CSS, href: `admin-cuenta.html?id=${encodeURIComponent(f.id)}` }, [
            el('span', { css: ELIPSIS, text: f.nombre }),
            el('span', { css: 'color:var(--adm-muted);', text: fechaCorta(f.fecha) }),
            el('strong', { cls: 'adm-money', text: fmtCOP(f.monto) }),
        ]));
    }
}

// ─── #5 Avisos (aprobaciones pendientes + fallos del sistema sin resolver) ─────────────────────
function initSenalAvisos(grid, esOwner) {
    const c = statCard({ icon: '🔔', tone: 'red', label: 'Avisos' });
    // Las aprobaciones (lo frecuente/accionable) viven en la Bandeja (F-IA-2 B4); los fallos del
    // sistema, en Salud. La tarjeta enlaza a la Bandeja (owner-only, como sus fuentes). Solo el owner
    // navega ahí; un admin ve el conteo de solicitudes pero no la página.
    if (esOwner) {
        c.card.style.cursor = 'pointer';
        c.card.setAttribute('role', 'link');
        c.card.addEventListener('click', () => { location.href = 'admin-aprobaciones.html'; });
    }
    grid.append(c.card);

    let solicitudes = 0, fallos = 0, solOk = false, falOk = !esOwner;   // admin no lee saludEventos
    const render = () => {
        const total = solicitudes + fallos;
        c.val.textContent = String(total);
        c.val.style.color = total > 0 ? 'var(--adm-danger)' : '';
        const partes = [];
        if (solOk) partes.push(`${solicitudes} aprobación${solicitudes === 1 ? '' : 'es'}`);
        if (esOwner && falOk) partes.push(`${fallos} fallas del sistema`);
        c.sub.textContent = total === 0 ? ((solOk || (esOwner && falOk)) ? 'Todo en orden' : 'Cargando…') : partes.join(' · ');
    };
    render();

    onSolicitudesPendientesChange((list) => { solicitudes = list.length; solOk = true; render(); }, () => { solOk = false; render(); });
    if (esOwner) onSaludEventosChange((evs) => { fallos = evs.filter((e) => e.resuelto !== true).length; falOk = true; render(); });
}

// ─── Fila OWNER: efectivo total (cajón + bóveda) + último arqueo ───────────────────────────────
function initSenalOwner(grid, cajaLive) {
    const plata  = statCard({ icon: '🏦', tone: 'emerald', label: 'Efectivo total (cajón + bóveda)' });
    const arqueo = statCard({ icon: '⚖️', tone: 'gold', label: 'Último arqueo' });
    grid.append(plata.card, arqueo.card);

    cajaLive.onChange((s) => {
        // Efectivo total = estimado del cajón (0 si la caja está cerrada) + saldo de la bóveda.
        const bov = Number(s.boveda?.saldo) || 0;
        if (s.turno && !s.cajonListo) {
            plata.val.textContent = 'Calculando…'; plata.val.style.color = '';
            plata.sub.textContent = `Bóveda ${copSigned(bov)}`;
        } else {
            const cajon = s.turno ? s.cajon : 0;
            const total = cajon + bov;
            plata.val.textContent = copSigned(total);
            plata.val.style.color = total < 0 ? 'var(--adm-danger)' : '';
            plata.sub.textContent = `Cajón ${copSigned(cajon)} · Bóveda ${copSigned(bov)}`;
        }

        // Último arqueo (descuadre del último cierre, sin clamp).
        const d = s.arqueoDescuadre;
        if (d == null)      { arqueo.val.textContent = '—';           arqueo.val.style.color = '';                    arqueo.sub.textContent = 'Aún no hay cierres'; }
        else if (d === 0)   { arqueo.val.textContent = 'Cuadró';           arqueo.val.style.color = 'var(--adm-success)';  arqueo.sub.textContent = 'El último cierre cuadró ✓'; }
        else if (d > 0)     { arqueo.val.textContent = `Sobró ${copSigned(d)}`;  arqueo.val.style.color = 'var(--adm-accent)'; arqueo.sub.textContent = 'Revisa el último cierre'; }
        else                { arqueo.val.textContent = `Faltó ${copSigned(-d)}`; arqueo.val.style.color = 'var(--adm-danger)'; arqueo.sub.textContent = 'Revisa el último cierre'; }
    });
}

init();
