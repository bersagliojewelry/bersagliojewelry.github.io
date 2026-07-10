/**
 * Bersaglio Admin — Mostrador (POS · B1 paso 3 · TODO-37).
 *
 * Kary registra una venta presencial de UNA pieza:
 *   elegir pieza → fijar precio (fijo si la pieza lo trae, o por peso con la misma fórmula
 *   de la calculadora) → medio de pago → confirmar → la CF `crearPedido` la persiste con
 *   stock atómico (candado = pieza) y total RE-CALCULADO server-side.
 *
 * Regla de oro del dinero: esta vista ESPEJA exactamente lo que cobra la CF — si la pieza
 * tiene precio numérico, ese es el total (la CF ignora el peso); si no, total = peso×gramo+mano.
 * Nunca mostramos un total distinto al que se cobra. La integridad la garantiza el servidor.
 *
 * Render: TODA interpolación en innerHTML pasa por esc() (convención L-03/F6, igual que piezas.js).
 */

import adminDb from './db.js';
import { admToast, admConfirm, initSidebar, esc, requireAuth, currentRole, errorMessage, fmtDateTime } from './shared.js';
import { esDisponible, STOCK_TYPES } from './inventario-model.js';   // TODO-40 v3: vendibles espeja el gate de la CF
import { calcularPrecio } from './calculadora.js';
import { calcularNeto } from './fiscal.js';
import {
    crearPedido, confirmarPago, anularPedido, ultimasVentas, onUltimasVentasChange,
    onServiciosChange,                                                        // F2.2 · catálogo de servicios (chips)
    abrirTurno, cerrarTurno, movimientoCaja, registrarTraslado,               // F2.0 · escrituras
    onCajaEstadoChange, onConfigCajaChange, onTurnoChange, onMovsCajaChange,  // F2.0 · lecturas
    onVentasTurnoChange, onTrasladosTurnoChange,
    crearClienteConDoc, vincularClientePedido, getConfigIdentidadActiva, fetchClientesLite,  // F2.1 · identidad
} from '../pedidos-service.js';
import { estadoPedido, ESTADOS_SIN_DINERO } from './pedidos-format.js';   // F1-CORE: mapa de estados compartido con Pedidos
import { CONCEPTOS_CAJA, conceptoLabel, efectivoEnCajon, trasladoSugerido, superaLimite } from './caja-format.js';
import { advisoryMatchHint, filterClientes, maskDoc, maskPhone } from './advisory-match.js';   // F2.1 · dedup blando + máscara PII

const cop = n => '$' + Math.round(Math.max(0, Number(n) || 0)).toLocaleString('es-CO');
// El ESTIMADO del cajón puede ser negativo (anomalía real: traslado duplicado / venta anulada tras
// trasladar) → formateo con signo, sin clamp (patrón boveda.js). Bug "se perdieron los 200" 2026-07-09:
// cop() recortaba −$5.4M a $0 y escondía la anomalía.
const copSigned = n => { const v = Math.round(Number(n) || 0); return (v < 0 ? '-$' : '$') + Math.abs(v).toLocaleString('es-CO'); };
const entero = n => Math.round(Math.max(0, Number(n) || 0));
// UUID de idempotencia (secure context → randomUUID; fallback defensivo si faltara).
const uid = () => (crypto?.randomUUID?.() || `pos-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);

const MEDIO_LABEL = { efectivo: 'Efectivo', datafono: 'Datáfono (tarjeta)', transferencia: 'Transferencia', wompi: 'Wompi', addi: 'Addi', mixto: 'Mixto' };
// TODO-73: medios SELECCIONABLES en el mostrador. Addi ❄️ congelado (hasta que Kary vincule) → fuera del
// selector; su label queda en MEDIO_LABEL para pintar pedidos legacy. Orden: efectivo → datáfono → transferencia → wompi.
const MEDIOS_POS = [['efectivo', 'Efectivo'], ['datafono', 'Datáfono (tarjeta)'], ['transferencia', 'Transferencia'], ['wompi', 'Wompi']];
const MEDIOS_INMEDIATOS = new Set(['efectivo', 'datafono']);   // aprueban en el acto (espeja pedidos-core)
// Mensaje de negocio de la CF (claro, en español) > el genérico por código.
const BUSINESS_ERR = ['failed-precondition', 'invalid-argument', 'not-found', 'already-exists'];

let _allPieces = [];
let _selected  = null;    // pieza elegida
let _pedidoId  = null;    // UUID de la venta en curso (idempotencia)
let _query     = '';
let _submitting = false;
let _cierreDone = false;  // ya se calculó el arqueo (el botón pasa a "Listo")
// ─── TODO-73 · POS money-model (datáfono · pago dividido · venta sin pieza) ────────────────────
let _sinPieza = false;    // venta de solo servicio/arreglo (sin pieza): computeTotal usa solo los extras
let _split    = false;    // §9: pago dividido activo (el constructor de pagos manda sobre #pos-medio)
let _pagos    = [];       // §9: [{medio, monto}] cuando _split; se envía como input.pagos (Σ === total)

// ─── F2.2 · Facturación multi-línea (servicios/modificaciones de la venta en curso) ───────────
let _lineasExtra    = [];     // líneas extra de ESTA venta: {tipo,servicioId?,codigo?,nombre?,concepto?,precio,cantidad,naturaleza}
let _servicios      = [];     // catálogo de servicios ACTIVOS (listener onServiciosChange)
let _serviciosUnsub = null;   // cleanup del listener

// ─── F2.0 · Sesión de caja + Bóveda (estado del turno) ─────────────────────────
// isCaja = quien OPERA la caja (owner/admin/caja). En prod Kary opera como `owner`. El candado real
// es server-side (reglas + wrappers rolDeCaja); esto solo decide qué UI pintar. Se resuelve en
// initCaja() (tras requireAuth) — NUNCA en tiempo de import: ahí el perfil aún no está cargado.
let _isCaja        = false;
let _cfgCaja       = null;                                   // config/caja {enforceTurno,fondoTrabajo,limiteCajon}
let _cajaEstado    = { turnoAbiertoId: null, docsDelTurno: 0 };
let _turno         = null;                                   // turno abierto {id,fondoApertura,estado,...}
let _movsCaja      = [];                                     // ingresos/egresos del turno
let _ventasTurno   = [];                                     // pedidos where turnoId (pertenencia #6)
let _trasladosLedger = null;                                 // traslados owner-authoritative (null = sin acceso → fallback en memoria)
let _trasladadoSesion = 0;                                   // fallback: traslados cajón→bóveda de ESTA sesión (rol sin lectura del ledger)
let _turnoOpId     = null;                                   // opId de la apertura en curso (idempotencia §8.1.2)
let _movOpId       = null;                                   // opId del movimiento en curso
let _trasladoOpId  = null;                                   // opId del traslado en curso
// Fix traslado-duplicado (2026-07-10): el auto-modal de traslado SOLO se dispara con la foto del cajón
// COMPLETA — al recargar, las ventas podían llegar ANTES que los traslados → estimado inflado → el modal
// pedía volver a trasladar lo ya trasladado (duplicó $5.6M en prod el 2026-07-09).
let _ventasReady    = false;                                 // 1ª foto de ventas del turno ya llegó
let _trasladosReady = false;                                 // 1ª foto del ledger de traslados ya llegó
let _trasAutoOpened = false;                                 // el modal se abrió SOLO → puede cerrarse solo si fue falsa alarma
let _trasPrefill    = null;                                  // sugerido pre-cargado (si el usuario no lo tocó, es refrescable)
let _overLimit     = false;                                  // el cajón superó el límite → ventas bloqueadas hasta trasladar
let _turnoUnsubs   = [];                                     // listeners con alcance de turno (se recablean al cambiar de turno)
let _pendingOpenTurno = null;                                // turno recién abierto (pinta el panel al instante; el listener lo reconcilia)

// ─── Ventas recientes EN VIVO (reactividad money-safe · Daniel 2026-07-07) ────────────────────────
// La lista se ALIMENTA de un listener (onUltimasVentasChange) — NUNCA de un fetch de una vez: cerrar
// el turno, o una venta/anulación desde otra sesión, se refleja sin refrescar. Autoridad = Firestore.
let _ventasRecientes = [];   // últimas 15 ventas (fuente del render; la escribe el listener)
let _ventasError     = false;// el listener falló y aún no hay datos → aviso mientras reintenta solo
let _ventasUnsub     = null; // cleanup del listener (page-scope; no hay SPA teardown, pero lo guardamos)

// ─── F2.1 · Adjuntar cliente a la venta (flag fail-closed; cache local de clientes) ───────────────
let _identidadActiva = false;   // flag config/identidad.activo (leído 1 vez en boot; hot path lee este cache)
let _clientes        = [];      // lista acotada para el typeahead (fetch puntual, NO listener; comité)
let _adjPedidoId     = null;    // pedido al que se está adjuntando (capturado POR VALOR — nunca el global _pedidoId)
let _adjLabel        = '';      // etiqueta de la venta (pieza·monto) para que el modal muestre a cuál adjunta
let _adjSubmitting   = false;   // flag PROPIO del modal (no comparte _submitting de la venta)

// Helpers F2.1 (módulo): estado muerto de un pedido + nombre de cliente desde el cache local.
const esMuertaVenta = (v) => ['anulado', 'cancelado', 'reembolsado', 'expirado'].includes(v?.estado);
const nombreClienteLocal = (id) => _clientes.find(c => c.id === id)?.nombre || null;

// ─── Init ───────────────────────────────────────────────────────────────────────
async function init() {
    await requireAuth('catalogo');   // Kary (catálogo) + admin/owner registran ventas (espeja la CF)
    await adminDb.init();
    initSidebar();

    _allPieces = adminDb.getAllPieces();
    renderResults();

    // Real-time: si el catálogo cambia (p.ej. la pieza recién vendida desaparece), refresca.
    adminDb.on('pieces', pieces => {
        _allPieces = pieces;
        // C.3: si hay una venta en curso y la pieza seleccionada cambió de precio/stock desde OTRA sesión,
        // refresca `_selected` — si no, el diálogo mostraría el precio viejo mientras la CF cobra el nuevo
        // (viola la doctrina "nunca mostramos un total distinto al que se cobra").
        if (_selected) {
            const fresca = pieces.find(p => p.id === _selected.id);
            if (fresca && (fresca.price !== _selected.price || fresca.stockType !== _selected.stockType)) {
                _selected = fresca;
                setupPriceMode(fresca);
                recalcTotal();
                admToast('El precio o el stock de esta pieza cambió; se actualizó el total.', 'danger', 5000);
            }
        }
        renderResults();
    });

    document.getElementById('pos-search').addEventListener('input', e => {
        _query = e.target.value.trim().toLowerCase();
        renderResults();
    });
    document.getElementById('pos-change').addEventListener('click', resetSale);
    document.getElementById('pos-medio').addEventListener('change', updateMedioHint);
    document.getElementById('pos-envio').addEventListener('change', updateMedioHint);
    ['pos-gramo', 'pos-peso', 'pos-mano'].forEach(id =>
        document.getElementById(id).addEventListener('input', recalcTotal));
    document.getElementById('pos-submit').addEventListener('click', handleSubmit);

    // F2.2 · bloque de servicios/modificaciones (colapsable + línea libre) + catálogo en vivo
    document.getElementById('pos-serv-toggle')?.addEventListener('click', () => {
        const body = document.getElementById('pos-serv-body');
        const toggle = document.getElementById('pos-serv-toggle');
        const abrir = body.hidden;
        body.hidden = !abrir;
        toggle.setAttribute('aria-expanded', String(abrir));
    });
    document.getElementById('pos-libre-add')?.addEventListener('click', addLibreLine);
    subscribeServicios();

    // TODO-73 · venta sin pieza + pago dividido
    document.getElementById('pos-sin-pieza')?.addEventListener('click', startSinPieza);
    document.getElementById('pos-split-toggle')?.addEventListener('click', toggleSplit);
    document.getElementById('pos-split-add')?.addEventListener('click', addSplitRow);

    // Cierre de caja (arqueo · paso 5). TODO-70/L-81: el cierre vive SOLO en la tarjeta de caja
    // (botón "Cerrar turno", visible únicamente con turno abierto). El "Cerrar caja" legacy del
    // topbar (Z a ciegas sin turno) se RETIRÓ — caja cerrada = solo abrir, ni vender ni cerrar.
    document.getElementById('cierre-close').addEventListener('click', closeCierre);
    document.getElementById('cierre-cancel').addEventListener('click', closeCierre);
    document.getElementById('cierre-submit').addEventListener('click', handleCierre);
    document.getElementById('cierre-modal').addEventListener('click', e => { if (e.target.id === 'cierre-modal') closeCierre(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !document.getElementById('cierre-modal').hidden) closeCierre(); });

    document.getElementById('btn-export-contador').addEventListener('click', exportarContador);

    initCaja();       // F2.0 · turno de caja + bóveda (no-op si el rol no opera caja)
    await initIdentidad();   // F2.1 · flag + cache de clientes + wiring del modal (no-op si el flag está OFF)
    updateMedioHint();
    subscribeVentas();   // ventas recientes EN VIVO (tras initIdentidad → _identidadActiva/_clientes listos al 1er render)
}

// ─── F2.0 · Ciclo del turno de caja (apertura / movimientos / traslado / cierre) ──────────────

function initCaja() {
    _isCaja = ['owner', 'admin', 'caja'].includes(currentRole());   // tras requireAuth: el perfil ya está
    const card = document.getElementById('caja-card');
    if (!_isCaja) { if (card) card.hidden = true; return; }   // catálogo/editor: sin caja (usan el Z legacy)
    if (card) card.hidden = false;

    // Config + puntero del turno abierto (read isCaja). El puntero manda: al cambiar `turnoAbiertoId`
    // recableamos los listeners con alcance de turno (turno + movs + ventas + traslados).
    onConfigCajaChange(cfg => { _cfgCaja = cfg; renderCaja(); recalcTotal(); renderVentas(); },
        e => console.warn('[caja] config no legible:', e?.code || e));
    onCajaEstadoChange(handleCajaEstado,
        e => console.warn('[caja] estado no legible:', e?.code || e));

    // Botones del turno (existen en el HTML del POS; wire defensivo).
    document.getElementById('caja-abrir')?.addEventListener('click', abrirCaja);
    document.getElementById('caja-mov')?.addEventListener('click', () => openMov());
    document.getElementById('caja-traslado')?.addEventListener('click', () => openTraslado(efectivoCajon()));
    document.getElementById('caja-cerrar')?.addEventListener('click', openCierre);

    // Modal de apertura de caja (fondo)
    document.getElementById('apertura-close')?.addEventListener('click', closeApertura);
    document.getElementById('apertura-cancel')?.addEventListener('click', closeApertura);
    document.getElementById('apertura-submit')?.addEventListener('click', handleApertura);
    document.getElementById('apertura-modal')?.addEventListener('click', e => { if (e.target.id === 'apertura-modal') closeApertura(); });
    document.getElementById('apertura-fondo')?.addEventListener('keydown', e => { if (e.key === 'Enter') handleApertura(); });

    // Modal de movimiento (ingreso/egreso)
    document.getElementById('mov-close')?.addEventListener('click', closeMov);
    document.getElementById('mov-cancel')?.addEventListener('click', closeMov);
    document.getElementById('mov-submit')?.addEventListener('click', handleMov);
    document.getElementById('mov-concepto')?.addEventListener('change', updateMovNota);
    document.getElementById('mov-modal')?.addEventListener('click', e => { if (e.target.id === 'mov-modal') closeMov(); });

    // Modal de traslado a bóveda
    document.getElementById('tras-close')?.addEventListener('click', closeTraslado);
    document.getElementById('tras-cancel')?.addEventListener('click', closeTraslado);
    document.getElementById('tras-submit')?.addEventListener('click', handleTraslado);
    document.getElementById('tras-modal')?.addEventListener('click', e => { if (e.target.id === 'tras-modal') closeTraslado(); });

    // Poblar el <select> de conceptos una vez (DOM seguro, sin innerHTML).
    const sel = document.getElementById('mov-concepto');
    if (sel && !sel.children.length) {
        for (const c of CONCEPTOS_CAJA) {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = conceptoLabel(c);
            sel.appendChild(opt);
        }
    }
}

// Cambió el puntero del turno abierto → recablea los listeners con alcance de turno.
function handleCajaEstado(est) {
    const prev = _cajaEstado?.turnoAbiertoId || null;
    _cajaEstado = est || { turnoAbiertoId: null, docsDelTurno: 0 };
    const id = _cajaEstado.turnoAbiertoId || null;

    if (id !== prev) {
        _turnoUnsubs.forEach(u => { try { u(); } catch { /* noop */ } });
        _turnoUnsubs = [];
        // Sembrado OPTIMISTA: si acabamos de abrir ESTE turno, arranca `_turno` con el dato de la CF
        // (no null) → el panel pinta "abierta" de una vez, sin parpadear "cerrada" hasta que llegue
        // el snapshot de onTurnoChange (que reconcilia con la autoridad server).
        _turno = (id && _pendingOpenTurno && _pendingOpenTurno.id === id) ? _pendingOpenTurno : null;
        _movsCaja = []; _ventasTurno = []; _trasladosLedger = null; _trasladadoSesion = 0; _overLimit = false;
        _ventasReady = false; _trasladosReady = false;   // la foto del cajón vuelve a estar INCOMPLETA
        // Auditoría 2026-07-10 (P2): los opId pendientes NO cruzan turnos — la idempotencia de movsCaja
        // vive en `turnos/{turnoId}/movsCaja/{opId}` (path POR turno): reusar un opId viejo en el turno
        // nuevo crearía un movimiento fantasma contado en ambos turnos. Turno nuevo = opIds nuevos.
        _movOpId = null; _trasladoOpId = null;
        if (id) {
            _turnoUnsubs.push(onTurnoChange(id, t => { _turno = t; renderCaja(); recalcTotal(); },
                e => console.warn('[caja] turno no legible:', e?.code || e)));
            _turnoUnsubs.push(onMovsCajaChange(id, m => { _movsCaja = m; renderCaja(); recalcTotal(); },
                e => console.warn('[caja] movimientos no legibles:', e?.code || e)));
            // Ventas del turno (read isVentas). Un rol `caja` puro aún NO puede leer pedidos (gap
            // documentado) → degrada: el efectivo del cajón se muestra sin las ventas hasta habilitarlo.
            _turnoUnsubs.push(onVentasTurnoChange(id, v => { _ventasTurno = v; _ventasReady = true; renderCaja(); recalcTotal(); },
                e => console.warn('[caja] ventas del turno no legibles (rol sin lectura de pedidos):', e?.code || e)));
            // Traslados del turno (read isOwner). Si el operador NO es owner → error → usamos el
            // acumulador del doc del turno (server) o el rastreo por sesión como último recurso.
            _turnoUnsubs.push(onTrasladosTurnoChange(id, tr => { _trasladosLedger = tr; _trasladosReady = true; renderCaja(); recalcTotal(); },
                () => { _trasladosLedger = null; _trasladosReady = false; renderCaja(); }));
        }
    }
    renderCaja();
    recalcTotal();
    renderVentas();   // TODO-70: caja cerrada ↔ abierta cambia si se listan (o no) las ventas del turno
}

// ─── Derivación del efectivo del cajón (ESTIMACIÓN operativa; la autoridad es el cierre server) ──
function ventasEfectivoTurno() {
    // TODO-73 §9 split-aware: una venta MIXTA aporta SOLO su porción efectivo (no el total). Con `pagos[]`
    // sumamos los pagos efectivo; legacy (sin pagos) cae al total si el medio único era efectivo.
    return _ventasTurno.reduce((s, p) => {
        if (ESTADOS_SIN_DINERO.has(p.estado)) return s;
        if (Array.isArray(p.pagos) && p.pagos.length) {
            return s + p.pagos.reduce((a, pg) => a + (pg.medio === 'efectivo' ? entero(pg.monto) : 0), 0);
        }
        return p.medio === 'efectivo' ? s + entero(p.total) : s;
    }, 0);
}
// TODO-73 3b: ¿hubo ventas con datáfono en el turno? Incluye ANULADAS: el voucher físico se imprimió
// igual → la cajera lo cuenta (una "sobra" queda explicada por `datafonoAnuladoEnTurno`).
function hayVentasDatafonoTurno() {
    // Legacy sin `pagos[]` (pre TODO-73): el medio único vive en p.medio — sin ese OR, el cierre no
    // pedía contar esos vouchers y el cuadre de datáfono daba "faltan" falsos (auditoría 2026-07-10).
    return _ventasTurno.some(p =>
        (Array.isArray(p.pagos) && p.pagos.some(pg => pg.medio === 'datafono')) || p.medio === 'datafono');
}
function movsSums() {
    let ingresos = 0, egresos = 0;
    for (const m of _movsCaja) {
        if (m.anulado) continue;
        if (m.tipo === 'ingreso') ingresos += entero(m.monto);
        else if (m.tipo === 'egreso') egresos += entero(m.monto);
    }
    return { ingresos, egresos };
}
function trasladosSums() {
    // 1º: acumuladores del DOC DEL TURNO — los escribe la CF en la MISMA transacción del traslado
    // (atómicos con el fondo, legibles por cualquier rol de caja, cero carrera de listeners). Es la
    // fuente preferida desde el fix traslado-duplicado 2026-07-10; la autoridad sigue siendo el cierre.
    if (_turno && typeof _turno.cajonABoveda === 'number' && typeof _turno.bovedaACajon === 'number') {
        return { cajonABoveda: Math.round(Number(_turno.cajonABoveda) || 0), bovedaACajon: Math.round(Number(_turno.bovedaACajon) || 0) };
    }
    if (Array.isArray(_trasladosLedger)) {                          // 2º: ledger real (owner; turnos legacy)
        let cajonABoveda = 0, bovedaACajon = 0;
        for (const t of _trasladosLedger) {
            if (t.anulado || t.estado === 'pendiente_aprobacion' || t.estado === 'rechazado') continue;
            if (t.tipo === 'cajon_a_boveda') cajonABoveda += entero(t.monto);
            else if (t.tipo === 'boveda_a_cajon') bovedaACajon += entero(t.monto);
            else if (t.tipo === 'reverso') {                        // espejo de cerrarTurnoCore: la reversa netea
                if ((t.delta || 0) < 0) cajonABoveda -= entero(t.monto);
                else bovedaACajon -= entero(t.monto);
            }
        }
        return { cajonABoveda, bovedaACajon };
    }
    return { cajonABoveda: _trasladadoSesion, bovedaACajon: 0 };   // 3º: fallback en memoria (rol sin lectura del ledger)
}
// ¿La foto del cajón está COMPLETA para decisiones automáticas (auto-modal de traslado)? El botón
// manual siempre funciona; esto solo gatea lo que se dispara SOLO.
function fuentesDelCajonListas() {
    const acumDelTurno = !!_turno && typeof _turno.cajonABoveda === 'number' && typeof _turno.bovedaACajon === 'number';
    return _ventasReady && (acumDelTurno || _trasladosReady);
}
function efectivoCajon() {
    if (!_turno) return 0;
    const { ingresos, egresos } = movsSums();
    const { cajonABoveda, bovedaACajon } = trasladosSums();
    return efectivoEnCajon({
        fondoApertura: _turno.fondoApertura, ventasEfectivo: ventasEfectivoTurno(),
        ingresos, egresos, cajonABoveda, bovedaACajon,
    });
}
// La venta se bloquea si: (enforceTurno && sin turno abierto) o (cajón sobre el límite sin trasladar).
function ventaBloqueadaPorCaja() {
    if (!_isCaja) return false;
    if (_cfgCaja?.enforceTurno && !_cajaEstado?.turnoAbiertoId) return true;
    return _overLimit;
}
// TODO-70/L-81: caja OBLIGATORIA cerrada (enforceTurno y sin turno abierto). El mostrador está
// "cerrado" → no se vende NI se listan las ventas del turno (no se opera sobre una caja cerrada).
// Distinto de ventaBloqueadaPorCaja: el over-límite NO cierra el mostrador (el turno sigue abierto).
function sinTurnoAbierto() {
    return _isCaja && _cfgCaja?.enforceTurno === true && !_cajaEstado?.turnoAbiertoId;
}

// ─── Render del panel de caja ─────────────────────────────────────────────────
function renderCaja() {
    const card = document.getElementById('caja-card');
    if (!card || !_isCaja) return;

    // TODO-72 (Daniel): mostrador CERRADO (enforceTurno sin turno) = no se opera. Se oculta TODA la
    // zona de registro ("Registrar venta" / elige la pieza), no solo el botón — antes el buscador
    // seguía visible con la caja cerrada (confuso: parecía que se podía vender).
    const regCard = document.getElementById('pos-registrar-card');
    if (regCard) regCard.hidden = sinTurnoAbierto();

    const abierta = !!_turno && _turno.estado === 'abierto';
    document.getElementById('caja-cerrada').hidden = abierta;
    document.getElementById('caja-abierta').hidden = !abierta;

    // Estado CERRADA: aviso + botón abrir. Si enforceTurno, recalca que sin caja no hay ventas.
    const avisoCerrada = document.getElementById('caja-cerrada-aviso');
    if (avisoCerrada) {
        avisoCerrada.textContent = _cfgCaja?.enforceTurno
            ? 'La caja está cerrada. Ábrela para poder registrar ventas de mostrador.'
            : 'La caja está cerrada. Ábrela para llevar el control del efectivo del turno.';
    }

    if (!abierta) { _overLimit = false; return; }

    // Estado ABIERTA: métricas del turno.
    const efectivo = efectivoCajon();
    const { ingresos, egresos } = movsSums();
    const ventas = ventasEfectivoTurno();
    const limite = Number(_cfgCaja?.limiteCajon);

    document.getElementById('caja-fondo').textContent     = cop(_turno.fondoApertura);
    document.getElementById('caja-ventas-ef').textContent = cop(ventas);
    document.getElementById('caja-ingresos').textContent  = cop(ingresos);
    document.getElementById('caja-egresos').textContent   = cop(egresos);
    // El estimado JAMÁS se recorta a $0: un negativo es una anomalía y debe gritarse (2026-07-09).
    const efEl = document.getElementById('caja-efectivo');
    efEl.textContent = copSigned(efectivo);
    efEl.style.color = efectivo < 0 ? 'var(--adm-danger)' : '';

    // Barra de límite (discreta): solo si el owner configuró un límite.
    const limWrap = document.getElementById('caja-limite-wrap');
    const over = superaLimite(efectivo, limite);
    if (limWrap) {
        if (Number.isFinite(limite) && limite > 0) {
            limWrap.hidden = false;
            const pct = Math.min(100, Math.max(0, Math.round((efectivo / limite) * 100)));
            const bar = document.getElementById('caja-limite-bar');
            if (bar) { bar.style.width = pct + '%'; bar.classList.toggle('is-over', over); }
            document.getElementById('caja-limite-txt').textContent = `Límite del cajón: ${cop(limite)}`;
        } else {
            limWrap.hidden = true;
        }
    }

    // Alerta bajo la barra: sobre-límite (traslado obligatorio) o estimado NEGATIVO (anomalía).
    const alerta = document.getElementById('caja-alerta');
    if (alerta) {
        alerta.hidden = !(over || efectivo < 0);
        if (over) alerta.textContent = 'El cajón superó el límite. Traslada el excedente a la bóveda antes de seguir vendiendo.';
        else if (efectivo < 0) alerta.textContent = 'El estimado del cajón quedó NEGATIVO — eso no debería pasar. Revisa en la Bóveda si un traslado quedó registrado dos veces (se corrige con «Reversar») o si se anuló una venta cuyo efectivo ya se había trasladado.';
    }

    // Modal de traslado ABIERTO: refresca sus cifras con la foto viva. Si se abrió SOLO (auto), el
    // usuario no ha tocado el monto y la foto completa dice que ya no hace falta → se cierra solo
    // (era la falsa alarma de datos a medio llegar que duplicó el traslado el 2026-07-09).
    if (isTrasladoOpen()) {
        document.getElementById('tras-efectivo').textContent = copSigned(efectivo);
        document.getElementById('tras-obligatorio').hidden = !over;
        const inp = document.getElementById('tras-monto');
        const untouched = _trasPrefill !== null && (inp.value === '' || entero(inp.value) === _trasPrefill);
        if (untouched) {
            if (!over && _trasAutoOpened) {
                closeTraslado();
                admToast('Falsa alarma: con los datos completos el cajón está dentro del límite. No hace falta trasladar.', 'default', 5000);
            } else {
                const sug = trasladoSugerido(efectivo, entero(_cfgCaja?.fondoTrabajo || 0));
                inp.value = sug || '';
                _trasPrefill = sug;
            }
        }
    }

    // Auto-modal al CRUZAR el límite (una sola vez; se re-arma al bajar) — SOLO con la foto del cajón
    // COMPLETA (fuentesDelCajonListas). Se inhibe si YA hay un overlay abierto (traslado/cierre/
    // movimiento/confirmación): abrirlo encima apilaría modales y robaría el foco a la operación en curso.
    if (over && !_overLimit && !anyOverlayOpen() && fuentesDelCajonListas()) openTraslado(efectivo, true);
    _overLimit = over;
}

function isTrasladoOpen() { return !document.getElementById('tras-modal')?.hidden; }
function isCierreOpen()   { return !document.getElementById('cierre-modal')?.hidden; }
function isMovOpen()      { return !document.getElementById('mov-modal')?.hidden; }
function isConfirmOpen()  { return !document.getElementById('confirm-dialog')?.hidden; }
function isAperturaOpen() { return !document.getElementById('apertura-modal')?.hidden; }
function anyOverlayOpen() { return isTrasladoOpen() || isCierreOpen() || isMovOpen() || isConfirmOpen() || isAperturaOpen(); }

// ─── Abrir caja ────────────────────────────────────────────────────────────────
// Modal propio (comité UX 2026-07-10): el window.prompt() nativo parecía un error del navegador,
// no validaba y no se podía estilar. El modal ES la confirmación (un solo paso, botón explícito).
function abrirCaja() {
    const fondoDefault = entero(_cfgCaja?.fondoTrabajo || 0);
    document.getElementById('apertura-fondo').value = fondoDefault || '';
    document.getElementById('apertura-hint').textContent = fondoDefault
        ? `Sugerido: ${cop(fondoDefault)} (la base de trabajo configurada).`
        : 'Escribe la base en efectivo con la que abre el cajón (puede ser 0).';
    const submit = document.getElementById('apertura-submit');
    submit.disabled = false; submit.textContent = 'Abrir caja';
    document.getElementById('apertura-modal').hidden = false;
    document.getElementById('apertura-fondo').focus();
}
function closeApertura() { document.getElementById('apertura-modal').hidden = true; }
async function handleApertura() {
    const raw = document.getElementById('apertura-fondo').value;
    const fondo = entero(raw);
    if (raw === '' || !(fondo >= 0)) { admToast('Escribe el fondo de apertura (puede ser 0).', 'danger'); return; }
    if (!_turnoOpId) _turnoOpId = uid();            // idempotencia: mismo opId si reintenta

    const submit = document.getElementById('apertura-submit');
    submit.disabled = true; submit.textContent = 'Abriendo…';
    try {
        const res = await abrirTurno({ opId: _turnoOpId, fondoApertura: fondo });
        _turnoOpId = null;                        // el turno nuevo resetea _trasladadoSesion vía handleCajaEstado
        // Render OPTIMISTA: la CF ya commiteó el turno (existe en Firestore) → pintamos "abierta" AL
        // INSTANTE, sin esperar los 2 viajes del puntero encadenado (caja/estado → onTurnoChange).
        // Disparamos handleCajaEstado a mano con el estado ya conocido; el snapshot real reconcilia.
        _pendingOpenTurno = { id: res.turnoId, estado: 'abierto', fondoApertura: entero(res.fondoApertura ?? fondo) };
        handleCajaEstado({ turnoAbiertoId: res.turnoId, docsDelTurno: 0 });
        admToast('✓ Caja abierta', 'success');
        closeApertura();
    } catch (err) {
        const msg = (BUSINESS_ERR.includes(err?.code) && err?.message) ? err.message
            : errorMessage(err, 'No se pudo abrir la caja.');
        admToast(msg, 'danger', 5000);
        submit.disabled = false; submit.textContent = 'Abrir caja';
        // Conservamos _turnoOpId → reintentar es idempotente (no crea dos turnos).
    }
}

// ─── Movimiento manual (ingreso / egreso) ──────────────────────────────────────
function openMov() {
    if (!_turno || _turno.estado !== 'abierto') { admToast('Abre la caja primero.', 'danger'); return; }
    // El opId se acuña PEREZOSO en handleMov (no aquí): así, tras un fallo aparente que dejó la CF
    // ya commiteada, cerrar y REABRIR el modal reusa el mismo opId (idempotente) en vez de duplicar.
    document.getElementById('mov-tipo').value = 'egreso';
    document.getElementById('mov-concepto').value = CONCEPTOS_CAJA[0];
    document.getElementById('mov-monto').value = '';
    document.getElementById('mov-nota').value = '';
    updateMovNota();
    const submit = document.getElementById('mov-submit');
    submit.disabled = false; submit.textContent = 'Registrar movimiento';
    document.getElementById('mov-modal').hidden = false;
    document.getElementById('mov-monto').focus();
}
function closeMov() { document.getElementById('mov-modal').hidden = true; }
function updateMovNota() {
    // 'otro' exige nota (espeja el guard del core). El resto la deja opcional.
    const esOtro = document.getElementById('mov-concepto').value === 'otro';
    const nota = document.getElementById('mov-nota');
    nota.placeholder = esOtro ? 'Nota (obligatoria para "Otro")' : 'Nota (opcional)';
    document.getElementById('mov-nota-req').hidden = !esOtro;
}
async function handleMov() {
    if (!_turno) return;
    const tipo = document.getElementById('mov-tipo').value;
    const concepto = document.getElementById('mov-concepto').value;
    const monto = entero(document.getElementById('mov-monto').value);
    const nota = document.getElementById('mov-nota').value.trim();
    if (!(monto > 0)) { admToast('El monto debe ser mayor a 0.', 'danger'); return; }
    if (concepto === 'otro' && !nota) { admToast('El concepto "Otro" exige una nota.', 'danger'); return; }
    if (!_movOpId) _movOpId = uid();

    const submit = document.getElementById('mov-submit');
    submit.disabled = true; submit.textContent = 'Registrando…';
    try {
        await movimientoCaja({ turnoId: _turno.id, opId: _movOpId, tipo, concepto, monto, nota: nota || undefined });
        _movOpId = null;
        admToast(`✓ ${tipo === 'egreso' ? 'Egreso' : 'Ingreso'} registrado · ${cop(monto)}`, 'success');
        closeMov();
    } catch (err) {
        const msg = (BUSINESS_ERR.includes(err?.code) && err?.message) ? err.message
            : errorMessage(err, 'No se pudo registrar el movimiento.');
        admToast(msg, 'danger', 5000);
        submit.disabled = false; submit.textContent = 'Registrar movimiento';
    }
}

// ─── Traslado a bóveda (vaciar el cajón al superar el límite) ───────────────────
function openTraslado(efectivoActual, auto = false) {
    if (!_turno || _turno.estado !== 'abierto') { admToast('Abre la caja primero.', 'danger'); return; }
    // opId perezoso (se acuña en handleTraslado): cerrar+reabrir tras un fallo aparente reusa el mismo
    // id → cero doble-vaciado del cajón si la CF ya había commiteado antes del corte de red.
    const sugerido = trasladoSugerido(efectivoActual, entero(_cfgCaja?.fondoTrabajo || 0));
    const over = superaLimite(efectivoActual, Number(_cfgCaja?.limiteCajon));
    _trasAutoOpened = auto;        // si fue auto y resulta falsa alarma, renderCaja lo cierra solo
    _trasPrefill = sugerido;       // mientras el usuario no toque el monto, la cifra es refrescable
    document.getElementById('tras-monto').value = sugerido || '';
    document.getElementById('tras-nota').value = '';
    document.getElementById('tras-obligatorio').hidden = !over;
    document.getElementById('tras-efectivo').textContent = copSigned(efectivoActual);
    const submit = document.getElementById('tras-submit');
    submit.disabled = false; submit.textContent = 'Registrar traslado';
    document.getElementById('tras-modal').hidden = false;
    document.getElementById('tras-monto').focus();
}
function closeTraslado() {
    document.getElementById('tras-modal').hidden = true;
    _trasAutoOpened = false;
    _trasPrefill = null;
}
async function handleTraslado() {
    if (!_turno) return;
    const monto = entero(document.getElementById('tras-monto').value);
    const nota = document.getElementById('tras-nota').value.trim();
    if (!(monto > 0)) { admToast('El monto debe ser mayor a 0.', 'danger'); return; }

    // Guard anti-duplicado (2026-07-09): trasladar MÁS de lo que el estimado dice que hay casi siempre
    // significa que el traslado YA quedó registrado (o que faltan datos). Doble confirmación explícita —
    // el estimado no es precondición (doctrina caja-format), pero repetir un traslado sí exige conciencia.
    const efectivoActual = efectivoCajon();
    if (monto > efectivoActual) {
        admConfirm(
            `⚠️ Vas a registrar un traslado de ${cop(monto)}, pero el efectivo estimado del cajón es ${copSigned(efectivoActual)}. ` +
            'Esto suele pasar cuando el traslado YA quedó registrado (revísalo en la Bóveda). ¿Registrarlo de todos modos?',
            () => doTraslado(monto, nota),
        );
        return;
    }
    await doTraslado(monto, nota);
}
async function doTraslado(monto, nota) {
    if (!_turno) return;
    if (!_trasladoOpId) _trasladoOpId = uid();

    const submit = document.getElementById('tras-submit');
    submit.disabled = true; submit.textContent = 'Trasladando…';
    try {
        await registrarTraslado({ opId: _trasladoOpId, tipo: 'cajon_a_boveda', monto, turnoId: _turno.id, nota: nota || undefined });
        _trasladadoSesion += entero(monto);          // fallback en memoria (el owner usa el ledger real)
        _trasladoOpId = null;
        admToast(`✓ Trasladado a bóveda · ${cop(monto)}`, 'success');
        closeTraslado();
        renderCaja();                                 // re-evalúa el límite (baja el cajón → desbloquea ventas)
        recalcTotal();
    } catch (err) {
        const msg = (BUSINESS_ERR.includes(err?.code) && err?.message) ? err.message
            : errorMessage(err, 'No se pudo registrar el traslado.');
        admToast(msg, 'danger', 5000);
        submit.disabled = false; submit.textContent = 'Registrar traslado';
    }
}

// ─── Paso 1: elegir pieza ─────────────────────────────────────────────────────
function availablePieces() {
    // Vendibles v3 (TODO-40) — ESPEJA el gate de crearPedidoCore: excluye agotadas (finito en 0) y el
    // legacy 'vendida'; encargo y refabricable-en-0 (bajo pedido) SÍ se venden (se fabrican). Las privadas
    // se incluyen a propósito: existen para facturarse en el mostrador (fuera del catálogo público, D5).
    return _allPieces.filter(p => {
        if ((p.estado || '') === 'vendida') return false;       // legacy pre-v3 (estado, no cantidad)
        const st   = STOCK_TYPES.includes(p.stockType) ? p.stockType : 'finito';
        const cant = st === 'encargo' ? null : (Number.isInteger(p.cantidad) ? p.cantidad : 1);
        return esDisponible(st, cant);                          // agotada → false; resto → true
    });
}

function priceHint(p) {
    return isPrecioFijo(p) ? cop(p.price) : 'Por peso';   // price 0/ausente → 'Por peso' (no "$0")
}

function renderResults() {
    const ul   = document.getElementById('pos-results');
    const hint = document.getElementById('pos-picker-hint');
    if (!_query) { ul.innerHTML = ''; hint.hidden = false; hint.textContent = 'Escribe para buscar entre las piezas disponibles.'; return; }

    const matches = availablePieces().filter(p =>
        (p.name || '').toLowerCase().includes(_query) ||
        (p.code || '').toLowerCase().includes(_query)
    ).slice(0, 8);

    if (!matches.length) { ul.innerHTML = ''; hint.hidden = false; hint.textContent = 'No hay piezas disponibles con ese criterio.'; return; }

    hint.hidden = true;
    ul.innerHTML = matches.map(p => `
        <li>
            <button type="button" class="pos-result" data-id="${esc(p.id)}">
                <span class="pos-result-name">${esc(p.name || 'Pieza')}</span>
                <span class="pos-result-meta">
                    <code>${esc(p.code || '—')}</code>
                    <span class="pos-result-price">${esc(priceHint(p))}</span>
                </span>
            </button>
        </li>`).join('');

    ul.querySelectorAll('.pos-result').forEach(btn =>
        btn.addEventListener('click', () => selectPiece(btn.dataset.id)));
}

function selectPiece(id) {
    const piece = _allPieces.find(p => p.id === id);
    if (!piece) { admToast('Esa pieza ya no está disponible.', 'danger'); renderResults(); return; }

    _sinPieza = false;     // TODO-73: venta CON pieza (no sin-pieza)
    _selected = piece;
    _pedidoId = uid();   // nueva venta → nuevo UUID de idempotencia
    ocultarBannerAdjuntar();   // F2.1: empezar la siguiente venta archiva la anterior a la cola (sin toques)

    document.getElementById('pos-sel-name').textContent = piece.name || 'Pieza';
    document.getElementById('pos-sel-code').textContent = piece.code ? `· ${piece.code}` : '';
    document.getElementById('pos-picker').hidden   = true;
    document.getElementById('pos-selected').hidden = false;
    document.getElementById('pos-sale').hidden     = false;

    resetServicios();      // F2.2: cada nueva venta arranca sin servicios y con el bloque colapsado
    resetSplit();          // TODO-73 §9: cada venta arranca en pago único
    setupPriceMode(piece);
    recalcTotal();
}

// TODO-73 3c · venta SIN pieza (solo servicio/arreglo). No hay paso de precio de pieza; el bloque de
// servicios arranca ABIERTO (es lo único que se cobra). El payload omite pieceId → anular NO repone stock.
function startSinPieza() {
    _sinPieza = true;
    _selected = null;
    _pedidoId = uid();
    ocultarBannerAdjuntar();
    document.getElementById('pos-sel-name').textContent = 'Servicio / arreglo (sin pieza)';
    document.getElementById('pos-sel-code').textContent = '';
    document.getElementById('pos-picker').hidden   = true;
    document.getElementById('pos-selected').hidden = false;
    document.getElementById('pos-sale').hidden     = false;
    document.getElementById('pos-price-fijo').hidden = true;   // sin pieza → sin precio de pieza
    document.getElementById('pos-price-peso').hidden = true;
    resetServicios();
    const body = document.getElementById('pos-serv-body');
    const toggle = document.getElementById('pos-serv-toggle');
    if (body) body.hidden = false;                              // abrir el bloque de servicios de una
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    resetSplit();
    recalcTotal();
}

function resetSale() {
    _selected = null;
    _pedidoId = null;
    _sinPieza = false;      // TODO-73: la siguiente venta arranca en modo pieza
    _query = '';
    document.getElementById('pos-search').value = '';
    document.getElementById('pos-picker').hidden   = false;
    document.getElementById('pos-selected').hidden = true;
    document.getElementById('pos-sale').hidden     = true;
    ['pos-gramo', 'pos-peso', 'pos-mano'].forEach(id => { document.getElementById(id).value = ''; });
    document.getElementById('pos-envio').checked = false;   // F1-CORE: cada venta decide su envío
    resetServicios();                                        // F2.2: vacía líneas + colapsa el bloque
    resetSplit();                                            // TODO-73 §9: vuelve a pago único
    updateMedioHint();
    renderResults();
    document.getElementById('pos-search').focus();
}

// ─── Paso 2: precio (espeja la CF) ────────────────────────────────────────────
// price 0 o ausente = "SIN precio en sistema" (regla del dueño) → se cobra POR PESO (gramo×peso+mano).
// El `> 0` espeja pedidos-core.js; sin él, una pieza en 0 caía en "fijo $0" con el botón bloqueado.
function isPrecioFijo(p) { return typeof p?.price === 'number' && isFinite(p.price) && p.price > 0; }

function setupPriceMode(piece) {
    const fijoBox = document.getElementById('pos-price-fijo');
    const pesoBox = document.getElementById('pos-price-peso');
    if (isPrecioFijo(piece)) {
        fijoBox.hidden = false;
        pesoBox.hidden = true;
        document.getElementById('pos-fijo-val').textContent = cop(piece.price);
        document.getElementById('pos-fijo-hint').hidden = true;
    } else {
        fijoBox.hidden = true;
        pesoBox.hidden = false;
        document.getElementById('pos-gramo').focus();
    }
}

/** Subtotal SOLO de las líneas extra (servicios/modificaciones) de la venta en curso. */
function extrasTotal() {
    return _lineasExtra.reduce((a, l) => a + entero(l.precio) * (l.cantidad || 1), 0);
}

/** Total que se MOSTRARÁ y se cobrará (mismo criterio que pedidos-core): pieza + líneas extra (F2.2). */
function computeTotal() {
    if (_sinPieza) return extrasTotal();   // TODO-73 3c: venta sin pieza → solo los servicios/líneas
    if (!_selected) return 0;
    const base = isPrecioFijo(_selected)
        ? entero(_selected.price)
        : calcularPrecio({
            valorGramo: document.getElementById('pos-gramo').value,
            peso:       document.getElementById('pos-peso').value,
            manoObra:   document.getElementById('pos-mano').value,
        }).total;
    return base + extrasTotal();   // §regla de oro: el total en vivo = pieza + servicios = lo que cobra la CF
}

function recalcTotal() {
    const total = computeTotal();
    document.getElementById('pos-total').textContent = cop(total);
    if (_split) updateSplitStatus();   // TODO-73 §9: si cambió el total (p.ej. otro servicio), refresca el reparto
    const blocked = ventaBloqueadaPorCaja();   // F2.0: sin caja abierta (enforceTurno) o cajón sobre el límite
    const splitOk = !_split || splitStatus().ok;   // §9: con pago dividido exige Σ montos === total
    document.getElementById('pos-submit').disabled = !(total > 0) || !splitOk || _submitting || blocked;
    const bh = document.getElementById('pos-caja-block');
    if (bh) {
        bh.hidden = !blocked;
        if (blocked) {
            bh.textContent = _overLimit
                ? 'El cajón superó el límite: traslada efectivo a la bóveda antes de registrar otra venta.'
                : 'Abre la caja para registrar ventas de mostrador.';
        }
    }
}

// ─── Paso 2.5 · Servicios / modificaciones (F2.2, opcional) ────────────────────
// El bloque nace COLAPSADO (la venta solo-pieza queda idéntica). Catálogo PRIMERO (chips de un
// toque), línea libre = último recurso. El precio del servicio lo re-lee la CF server-side; estos
// chips/total son espejo. Render 100% por createElement/textContent (XSS-safe, L-03).
function renderServChips() {
    const box = document.getElementById('pos-serv-chips');
    if (!box) return;
    box.textContent = '';
    if (!_servicios.length) {
        const p = document.createElement('p');
        p.className = 'pos-hint';
        p.textContent = 'Aún no hay servicios en el catálogo. El dueño los crea en Configuración.';
        box.appendChild(p);
        return;
    }
    for (const s of _servicios) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'pos-serv-chip';
        b.textContent = `+ ${s.nombre} · ${cop(s.precio)}`;
        b.addEventListener('click', () => addServicioLine(s.id));
        box.appendChild(b);
    }
}

function addServicioLine(id) {
    const s = _servicios.find(x => x.id === id);
    if (!s) { admToast('Ese servicio ya no está disponible.', 'danger'); return; }
    const existing = _lineasExtra.find(l => l.tipo === 'servicio' && l.servicioId === id);
    if (existing) {
        if (existing.cantidad >= 50) return;   // tope de cantidad por línea (espeja la CF)
        existing.cantidad += 1;
    } else {
        _lineasExtra.push({ tipo: 'servicio', servicioId: id, codigo: s.codigo, nombre: s.nombre, precio: entero(s.precio), cantidad: 1, naturaleza: s.naturaleza || 'servicio' });
    }
    renderLineas();
    recalcTotal();
}

function addLibreLine() {
    const cIn  = document.getElementById('pos-libre-concepto');
    const pIn  = document.getElementById('pos-libre-precio');
    const hint = document.getElementById('pos-libre-hint');
    const err  = (msg) => { hint.textContent = msg; hint.hidden = false; };
    const concepto = (cIn.value || '').replace(/\s+/g, ' ').trim().slice(0, 120);
    const precio   = Number(pIn.value);
    const tope     = Number.isInteger(_cfgCaja?.topeLineaLibre) ? _cfgCaja.topeLineaLibre : 2000000;   // espeja config/caja
    if (!concepto) return err('Escribe el concepto del trabajo.');
    if (!Number.isInteger(precio) || precio < 1) return err('El precio debe ser un número entero mayor a 0 (sin decimales).');
    if (precio > tope) return err(`El precio supera el tope de ${cop(tope)}.`);
    hint.hidden = true;
    _lineasExtra.push({ tipo: 'libre', concepto, precio, cantidad: 1, naturaleza: 'servicio' });
    cIn.value = ''; pIn.value = '';
    renderLineas();
    recalcTotal();
    cIn.focus();
}

function changeQty(idx, delta) {
    const l = _lineasExtra[idx];
    if (!l) return;
    const next = l.cantidad + delta;
    if (next < 1) { removeLine(idx); return; }   // "−" en 1 = quitar
    if (next > 50) return;
    l.cantidad = next;
    renderLineas();
    recalcTotal();
}

function removeLine(idx) {
    _lineasExtra.splice(idx, 1);
    renderLineas();
    recalcTotal();
}

function renderLineas() {
    const ul = document.getElementById('pos-serv-list');
    if (!ul) return;
    ul.textContent = '';
    _lineasExtra.forEach((l, idx) => {
        const li = document.createElement('li');
        li.className = 'pos-serv-item';

        const name = document.createElement('span');
        name.className = 'pos-serv-item-name';
        name.textContent = l.tipo === 'servicio' ? l.nombre : l.concepto;   // textContent = XSS-safe

        const stepper = document.createElement('div');
        stepper.className = 'pos-serv-qty';
        const minus = document.createElement('button'); minus.type = 'button'; minus.className = 'pos-serv-qbtn'; minus.textContent = '−'; minus.setAttribute('aria-label', 'Quitar uno');
        const qn    = document.createElement('span');   qn.className = 'pos-serv-qn'; qn.textContent = String(l.cantidad);
        const plus  = document.createElement('button'); plus.type = 'button'; plus.className = 'pos-serv-qbtn'; plus.textContent = '+'; plus.setAttribute('aria-label', 'Agregar uno');
        minus.addEventListener('click', () => changeQty(idx, -1));
        plus.addEventListener('click', () => changeQty(idx, +1));
        stepper.append(minus, qn, plus);

        const sub = document.createElement('strong');
        sub.className = 'pos-serv-item-sub';
        sub.textContent = cop(entero(l.precio) * (l.cantidad || 1));

        const rm = document.createElement('button');
        rm.type = 'button'; rm.className = 'pos-serv-remove'; rm.textContent = '✕'; rm.setAttribute('aria-label', 'Quitar línea');
        rm.addEventListener('click', () => removeLine(idx));

        li.append(name, stepper, sub, rm);
        ul.appendChild(li);
    });
}

/** Reinicia el bloque de servicios (nueva venta o cambio de pieza): vacía líneas, colapsa, limpia libre. */
function resetServicios() {
    _lineasExtra = [];
    const body = document.getElementById('pos-serv-body');
    const toggle = document.getElementById('pos-serv-toggle');
    if (body) body.hidden = true;
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    const cIn = document.getElementById('pos-libre-concepto'); if (cIn) cIn.value = '';
    const pIn = document.getElementById('pos-libre-precio');   if (pIn) pIn.value = '';
    const hint = document.getElementById('pos-libre-hint');    if (hint) hint.hidden = true;
    renderLineas();
}

// Catálogo de servicios EN VIVO. Doctrina "nunca un total distinto al que se cobra" (C.3): si un
// servicio YA agregado cambia de precio o se desactiva, re-sincroniza las líneas de la venta en curso.
function subscribeServicios() {
    _serviciosUnsub = onServiciosChange((servicios) => {
        _servicios = servicios;
        let changed = false;
        _lineasExtra = _lineasExtra.filter(l => {
            if (l.tipo !== 'servicio') return true;
            const fresh = servicios.find(s => s.id === l.servicioId);
            if (!fresh) { changed = true; return false; }                 // desactivado → quitar la línea
            if (entero(fresh.precio) !== l.precio) { l.precio = entero(fresh.precio); l.nombre = fresh.nombre; changed = true; }
            return true;
        });
        renderServChips();
        renderLineas();
        if (changed) { recalcTotal(); admToast('El catálogo de servicios cambió; se actualizó el total.', 'danger', 4000); }
    });
}

// ─── Paso 3: medio de pago ────────────────────────────────────────────────────
// F1-CORE §3.3 (ruta corta): mostrador SIN envío = venta EN MANO → termina `entregado` de una vez
// (en efectivo nace así; transferencia/wompi al confirmar el pago). CON envío entra al flujo
// logístico del módulo Pedidos. El hint le dice a Kary EXACTAMENTE qué va a pasar.
function updateMedioHint() {
    const medio = document.getElementById('pos-medio').value;
    const envio = document.getElementById('pos-envio').checked;
    const hint  = document.getElementById('pos-medio-hint');
    if (_split) {   // TODO-73 §9: con pago dividido el hint lo da el constructor de pagos
        hint.textContent = 'Pago dividido: la venta queda entregada si TODOS los medios aprueban en el acto (efectivo/tarjeta); si hay un medio diferido (transferencia/Wompi) queda "por verificar".';
        return;
    }
    if (medio === 'efectivo') {
        hint.textContent = envio
            ? 'Quedará PAGADA y entrará al flujo de envío (módulo Pedidos).'
            : 'Venta en mano: quedará ENTREGADA (pagada) de una vez.';
    } else if (medio === 'datafono') {   // TODO-73 3a: tarjeta = pago inmediato (como efectivo); su voucher se cuadra al cierre
        hint.textContent = envio
            ? 'Tarjeta: quedará PAGADA y entrará al flujo de envío. Su voucher se cuadra al cerrar caja.'
            : 'Tarjeta: queda ENTREGADA (pagada) de una vez. Su voucher se cuadra al cerrar caja.';
    } else {
        hint.textContent = envio
            ? 'Quedará "por verificar"; al confirmar el pago entrará al flujo de envío.'
            : 'Quedará "por verificar"; al confirmar el pago quedará ENTREGADA (venta en mano).';
    }
}

// ─── TODO-73 §9 · Pago dividido (constructor de pagos) ─────────────────────────────────────────
// El pago único (la mayoría) NO cambia: #pos-medio manda. "Dividir pago" activa un constructor de
// líneas {medio, monto}; la venta solo se registra cuando Σ montos === total (el server re-valida).
function resetSplit() {
    _split = false;
    _pagos = [];
    const body = document.getElementById('pos-split-body');
    const toggle = document.getElementById('pos-split-toggle');
    const label = document.getElementById('pos-split-toggle-label');
    const medioStep = document.getElementById('pos-medio-step');
    if (body) body.hidden = true;
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    if (label) label.textContent = '+ Dividir el pago en varios medios';
    if (medioStep) medioStep.hidden = false;
}

function toggleSplit() {
    _split = !_split;
    const body = document.getElementById('pos-split-body');
    const toggle = document.getElementById('pos-split-toggle');
    const label = document.getElementById('pos-split-toggle-label');
    const medioStep = document.getElementById('pos-medio-step');
    if (_split) {
        // Semilla: 1 línea = medio actual + total. La cajera reparte desde ahí.
        _pagos = [{ medio: document.getElementById('pos-medio').value, monto: computeTotal() }];
        if (medioStep) medioStep.hidden = true;   // el select simple se oculta (el constructor manda)
        if (body) body.hidden = false;
        if (label) label.textContent = '− Volver a un solo medio de pago';
        if (toggle) toggle.setAttribute('aria-expanded', 'true');
        renderSplitRows();
    } else {
        resetSplit();
    }
    updateMedioHint();
    recalcTotal();
}

/** Estado del reparto: total, asignado, faltante y si cuadra (Σ === total con medios/montos válidos). */
function splitStatus() {
    const total = computeTotal();
    const asignado = _pagos.reduce((a, p) => a + entero(p.monto), 0);
    const okMedios = _pagos.length >= 1 && _pagos.every(p => MEDIOS_POS.some(([k]) => k === p.medio) && entero(p.monto) > 0);
    return { total, asignado, faltan: total - asignado, ok: okMedios && asignado === total && total > 0 };
}

function renderSplitRows() {
    const box = document.getElementById('pos-split-rows');
    if (!box) return;
    box.textContent = '';
    _pagos.forEach((pago, i) => {
        const row = document.createElement('div');
        row.className = 'adm-form-row pos-split-row';
        row.style.cssText = 'margin-top:10px;align-items:flex-end;gap:8px;';
        const selWrap = document.createElement('div'); selWrap.className = 'adm-field'; selWrap.style.flex = '1';
        const sel = document.createElement('select'); sel.className = 'adm-input'; sel.setAttribute('aria-label', `Medio del pago ${i + 1}`);
        for (const [k, lbl] of MEDIOS_POS) { const o = document.createElement('option'); o.value = k; o.textContent = lbl; if (k === pago.medio) o.selected = true; sel.appendChild(o); }
        sel.addEventListener('change', () => { _pagos[i].medio = sel.value; updateSplitStatus(); recalcTotal(); });
        selWrap.appendChild(sel);
        const inWrap = document.createElement('div'); inWrap.className = 'adm-field'; inWrap.style.width = '140px';
        const inp = document.createElement('input'); inp.className = 'adm-input'; inp.type = 'number'; inp.min = '0'; inp.inputMode = 'numeric'; inp.placeholder = 'Monto'; inp.setAttribute('aria-label', `Monto del pago ${i + 1}`);
        inp.value = entero(pago.monto) || '';
        inp.addEventListener('input', () => { _pagos[i].monto = entero(inp.value); updateSplitStatus(); recalcTotal(); });
        inWrap.appendChild(inp);
        row.appendChild(selWrap); row.appendChild(inWrap);
        if (_pagos.length > 1) {
            const rm = document.createElement('button'); rm.type = 'button'; rm.className = 'adm-btn adm-btn--ghost adm-btn--sm'; rm.textContent = '✕'; rm.setAttribute('aria-label', `Quitar el pago ${i + 1}`);
            rm.addEventListener('click', () => { _pagos.splice(i, 1); renderSplitRows(); recalcTotal(); });
            row.appendChild(rm);
        }
        box.appendChild(row);
    });
    updateSplitStatus();
}

function addSplitRow() {
    if (_pagos.length >= 4) { admToast('Máximo 4 medios de pago por venta.', 'default'); return; }
    const { faltan } = splitStatus();
    _pagos.push({ medio: 'efectivo', monto: Math.max(0, faltan) });   // sugiere lo que falta
    renderSplitRows();
    recalcTotal();
}

function updateSplitStatus() {
    const st = document.getElementById('pos-split-status');
    if (!st) return;
    const { asignado, faltan, total } = splitStatus();
    if (total <= 0) { st.textContent = 'Agrega la pieza o el servicio primero.'; st.style.color = ''; return; }
    if (faltan === 0)      { st.textContent = `✓ Asignado ${cop(asignado)} — cuadra con el total.`;        st.style.color = 'var(--adm-success)'; }
    else if (faltan > 0)   { st.textContent = `Asignado ${cop(asignado)} · Faltan ${cop(faltan)} por asignar.`; st.style.color = 'var(--adm-danger)'; }
    else                   { st.textContent = `Asignado ${cop(asignado)} · Te pasaste ${cop(-faltan)} del total.`; st.style.color = 'var(--adm-danger)'; }
}

// ─── Confirmar y registrar ────────────────────────────────────────────────────
// TODO-73 §9: la venta SIEMPRE se envía como `pagos[]` (pago único = 1 pago con el total). Split = las
// líneas del constructor. El server re-valida Σ === total (cero confianza cliente).
function buildPagos(total) {
    if (_split) return _pagos.map(p => ({ medio: p.medio, monto: entero(p.monto) }));
    return [{ medio: document.getElementById('pos-medio').value, monto: entero(total) }];
}

function handleSubmit() {
    if ((!_selected && !_sinPieza) || _submitting) return;   // TODO-73 3c: sin-pieza es venta válida
    const total = computeTotal();
    if (total <= 0) { admToast(_sinPieza ? 'Agrega al menos un servicio o una línea.' : 'El total debe ser mayor a 0.', 'danger'); return; }
    if (_split && !splitStatus().ok) { admToast('El pago dividido debe sumar exactamente el total.', 'danger'); return; }

    const pagos = buildPagos(total);
    const medioTxt = _split ? 'varios medios' : (MEDIO_LABEL[document.getElementById('pos-medio').value] || document.getElementById('pos-medio').value);
    const nombre = _sinPieza ? 'servicio / arreglo' : (_selected.name || 'la pieza');
    admConfirm(
        `¿Registrar la venta de «${nombre}» por ${cop(total)} (${medioTxt})?`,
        () => doRegister(pagos, total)
    );
}

async function doRegister(pagos, total) {
    _submitting = true;
    const btn = document.getElementById('pos-submit');
    btn.disabled = true;
    const prevText = btn.textContent;
    btn.textContent = 'Registrando…';

    // §9: `pagos[]` es la SSoT del medio; `pieceId` se omite en venta sin pieza (anular NO repone stock).
    const payload = { pedidoId: _pedidoId, pagos, canal: 'pos' };
    if (!_sinPieza) payload.pieceId = _selected.id;
    // F1-CORE §3.3: con envío el pedido NO es venta en mano → entra al flujo logístico.
    if (document.getElementById('pos-envio').checked) payload.requiereEnvio = true;
    if (!_sinPieza && !isPrecioFijo(_selected)) {
        payload.valorGramo = document.getElementById('pos-gramo').value;
        payload.peso       = document.getElementById('pos-peso').value;
        payload.manoObra   = document.getElementById('pos-mano').value;
    }
    // F2.2: líneas extra (servicio = solo el id → precio server-side; libre = concepto+precio con guardas).
    if (_lineasExtra.length) {
        payload.lineasExtra = _lineasExtra.map(l => l.tipo === 'servicio'
            ? { tipo: 'servicio', servicioId: l.servicioId, cantidad: l.cantidad }
            : { tipo: 'libre', concepto: l.concepto, precio: l.precio, cantidad: l.cantidad });
    }

    try {
        const res = await crearPedido(payload);
        // F2.1 money-safety (comité regresión): capturar POR VALOR ANTES de resetSale; el reset va
        // PRIMERO (si no corre, `_pedidoId` no rota → la venta siguiente colisiona por idempotencia →
        // venta perdida en silencio); el banner de adjuntar va DESPUÉS, en try/catch, y JAMÁS lo impide.
        const nuevoPedidoId = res.pedidoId || _pedidoId;
        const label = `Pedido ${res.codigo || '#' + res.numero} · ${_sinPieza ? 'Servicio / arreglo' : (_selected?.name || 'Pieza')} · ${cop(res.total)}`;
        const fueNueva = !res.yaExistia;
        if (res.yaExistia) {
            admToast(`Esta venta ya estaba registrada (Pedido ${res.codigo || '#' + res.numero}) — no se duplicó.`, 'default', 4000);
        } else {
            // §166: Kary comunica al cliente el CÓDIGO (el # correlativo es interno).
            admToast(`✓ Venta registrada · Pedido ${res.codigo || '#' + res.numero} · ${cop(res.total)}`, 'success', 4000);
        }
        resetSale();
        // ventas recientes se re-pinta sola vía el listener onUltimasVentasChange (money-safe).
        if (_identidadActiva && fueNueva) {
            try { mostrarBannerAdjuntar(nuevoPedidoId, label); } catch (e) { console.warn('[pos] banner adjuntar:', e?.message || e); }
        }
    } catch (err) {
        // Mensaje de negocio de la CF ("Esa pieza ya fue vendida.") cuando aplica; si no, el genérico.
        const msg = (BUSINESS_ERR.includes(err?.code) && err?.message)
            ? err.message
            : errorMessage(err, 'No se pudo registrar la venta.');
        admToast(msg, 'danger', 5000);
        // Mantenemos _pedidoId → reintentar es idempotente (no crea dos ventas).
    } finally {
        _submitting = false;
        btn.textContent = prevText;
        recalcTotal();   // re-evalúa disabled
    }
}

// ─── Ventas recientes (EN VIVO) ───────────────────────────────────────────────
// Suscripción única: el listener escribe `_ventasRecientes` y re-pinta. Reemplaza el patrón viejo
// de `loadVentas()` imperativo (fetch de una vez tras cada acción) que exigía refrescar para ver
// cambios de otra sesión / del cierre de turno. Autoridad = Firestore; re-suscribe sola (ADR §93).
function subscribeVentas() {
    _ventasUnsub = onUltimasVentasChange(
        (ventas) => { _ventasRecientes = ventas; _ventasError = false; renderVentas(); },
        15,
        // El helper reintenta con backoff; solo avisamos si aún no hay datos que mostrar.
        () => { if (!_ventasRecientes.length) { _ventasError = true; renderVentas(); } },
    );
}

function renderVentas() {
    const ul    = document.getElementById('pos-ventas');
    const empty = document.getElementById('pos-ventas-empty');
    const emptyP = empty.querySelector('p');

    // TODO-70/L-81: caja obligatoria cerrada → no se listan ventas (mostrador cerrado hasta abrir turno).
    if (sinTurnoAbierto()) {
        empty.hidden = false;
        if (emptyP) emptyP.textContent = 'La caja está cerrada. Ábrela para registrar y ver las ventas del turno.';
        ul.replaceChildren();
        renderColaBadge(0);
        return;
    }

    if (_ventasError) {
        empty.hidden = false;
        if (emptyP) emptyP.textContent = 'No se pudieron cargar las ventas (reintentando…).';
        ul.replaceChildren();
        return;
    }

    const ventas = _ventasRecientes;
    if (emptyP) emptyP.textContent = 'Aún no hay ventas registradas.';   // restaura el texto por defecto tras un error
    empty.hidden = ventas.length > 0;
    if (!ventas.length) { ul.replaceChildren(); renderColaBadge(0); return; }

    ul.innerHTML = ventas.map(v => {
        // F1-CORE: el POS conoce TODOS los estados (mapa compartido con Pedidos — antes el trinario
        // legacy pintaba "Por verificar" a un entregado/expirado y le ofrecía "Confirmar pago").
        const est = estadoPedido(v.estado);
        const muerta = esMuertaVenta(v);
        const confirmBtn = v.estado === 'pago_por_verificar'
            ? `<button class="adm-btn adm-btn--ghost adm-btn--sm pos-venta-confirm" data-id="${esc(v.id)}">Confirmar pago</button>` : '';
        // Semántica de POS real (comité + pregunta de Daniel 2026-07-10): ANULAR (void) es para el
        // ERROR DE REGISTRO INMEDIATO y solo existe dentro del MISMO turno abierto. Una venta de un
        // turno ya cerrado o de la web es una DEVOLUCIÓN → se gestiona en Pedidos (cancelar/reembolsar)
        // con motivo y rastro. Antes el botón salía en ventas entregadas de días anteriores.
        const esDelTurnoAbierto = !!v.turnoId && v.turnoId === (_cajaEstado?.turnoAbiertoId || null);
        const anularBtn = (muerta || !esDelTurnoAbierto) ? '' :
            `<button class="adm-btn adm-btn--ghost adm-btn--sm pos-venta-anular" data-id="${esc(v.id)}">Anular</button>`;
        // F2.1 (solo con el flag activo): vínculo con el cliente. Botón por fila = camino AUTORITATIVO
        // (data-id sin ambigüedad, comité). Sin cliente → resalta + cuenta para la cola; con cliente → nombre.
        const falta = _identidadActiva && !muerta && !v.clienteId;
        let clienteCell = '';
        if (_identidadActiva && !muerta) {
            if (v.clienteId) {
                clienteCell = `<span class="pos-venta-cliente">✓ ${esc(nombreClienteLocal(v.clienteId) || 'cliente')}</span>`;
            } else {
                const lbl = `Pedido ${v.codigo || '#' + (v.numero ?? '—')} · ${v.pieceName || 'Pieza'} · ${cop(v.total)}`;
                clienteCell = `<button class="adm-btn adm-btn--ghost adm-btn--sm pos-venta-cliente-btn pos-venta-cliente--none" data-id="${esc(v.id)}" data-label="${esc(lbl)}">+ cliente</button>`;
            }
        }
        return `
        <li class="pos-venta${muerta ? ' pos-venta--anulada' : ''}${falta ? ' pos-venta--sin-cliente' : ''}">
            <div class="pos-venta-main">
                <span class="pos-venta-num">#${esc(v.numero ?? '—')}</span>
                <span class="pos-venta-name">${esc(v.pieceName || 'Pieza')}</span>
            </div>
            <div class="pos-venta-meta">
                <strong>${esc(cop(v.total))}</strong>
                <span class="adm-pill adm-pill--${esc(est.pill)}">${esc(est.label)}</span>
                ${v.medio ? `<span class="pos-venta-medio" style="font-size:11px;opacity:.7">${esc(MEDIO_LABEL[v.medio] || v.medio)}</span>` : ''}
                <span class="pos-venta-time">${esc(fmtDateTime(v.createdAt))}</span>
                ${clienteCell}${confirmBtn}${anularBtn}
            </div>
        </li>`;
    }).join('');

    renderColaBadge(ventas.filter(v => _identidadActiva && !esMuertaVenta(v) && !v.clienteId).length);
    ul.querySelectorAll('.pos-venta-cliente-btn').forEach(btn =>
        btn.addEventListener('click', () => openAdjuntar(btn.dataset.id, btn.dataset.label || '')));
    ul.querySelectorAll('.pos-venta-confirm').forEach(btn =>
        btn.addEventListener('click', () => confirmarVenta(btn.dataset.id)));
    ul.querySelectorAll('.pos-venta-anular').forEach(btn =>
        btn.addEventListener('click', () => anularVenta(btn.dataset.id)));
}

// "Vi la plata": confirma el pago de una venta por verificar (transferencia/Wompi) → pagado.
function confirmarVenta(pedidoId) {
    admConfirm('¿Confirmas que ya viste el pago de esta venta? Quedará como pagada.', async () => {
        try {
            await confirmarPago(pedidoId);
            admToast('✓ Pago confirmado', 'success');
            // la lista se actualiza sola (listener en vivo)
        } catch (err) {
            const msg = (BUSINESS_ERR.includes(err?.code) && err?.message)
                ? err.message
                : errorMessage(err, 'No se pudo confirmar el pago.');
            admToast(msg, 'danger', 4000);
        }
    });
}

// Anula una venta (VOID): la pieza vuelve al catálogo. Append-only (queda como anulada, con traza).
function anularVenta(pedidoId) {
    admConfirm('¿Anular esta venta? La pieza vuelve al catálogo como disponible y la venta queda registrada como anulada.', async () => {
        try {
            const r = await anularPedido(pedidoId);
            admToast(r.piezaReintegrada ? '✓ Venta anulada · la pieza volvió al catálogo' : '✓ Venta anulada', 'success', 4000);
            // la venta anulada se re-pinta sola (listener); la pieza reintegrada vuelve al buscador vía adminDb('pieces')
        } catch (err) {
            const msg = (BUSINESS_ERR.includes(err?.code) && err?.message)
                ? err.message
                : errorMessage(err, 'No se pudo anular la venta.');
            admToast(msg, 'danger', 4000);
        }
    });
}

// ─── F2.1 · Adjuntar cliente a la venta (banner no-modal + cola + modal) ──────────────────────
// Regla de oro (comité): esto NUNCA toca el flujo de dinero. El banner auto-aparece post-venta y se
// ignora con cero toques; el modal se abre EXPLÍCITO, atado a un pedidoId capturado por valor.

function renderColaBadge(n) {
    const badge = document.getElementById('pos-ventas-badge');
    if (!badge) return;
    if (_identidadActiva && n > 0) { badge.textContent = `${n} sin cliente`; badge.hidden = false; }
    else badge.hidden = true;
}

function mostrarBannerAdjuntar(pedidoId, label) {
    const banner = document.getElementById('pos-adjuntar-banner');
    const txt = document.getElementById('pos-adjuntar-banner-txt');
    const btn = document.getElementById('pos-adjuntar-banner-btn');
    if (!banner || !btn || !txt) return;
    txt.textContent = `${label} — ¿adjuntar cliente?`;   // textContent = sin riesgo XSS
    btn.dataset.pedido = pedidoId;
    btn.dataset.label = label;
    banner.hidden = false;
}
function ocultarBannerAdjuntar() {
    const banner = document.getElementById('pos-adjuntar-banner');
    if (banner) banner.hidden = true;
}

function openAdjuntar(pedidoId, label) {
    if (!pedidoId || !_identidadActiva) return;
    _adjPedidoId = pedidoId;                 // POR VALOR — nunca el global _pedidoId
    _adjLabel = label || '';
    document.getElementById('adjuntar-sub').textContent = label ? `Adjuntando a: ${label}` : 'Adjuntar cliente a la venta';
    document.getElementById('adjuntar-search').value = '';
    document.getElementById('adjuntar-results').replaceChildren();
    ['adjuntar-nombre', 'adjuntar-tel', 'adjuntar-doc'].forEach(id => { document.getElementById(id).value = ''; });
    document.getElementById('adjuntar-doctype').value = '';
    document.getElementById('adjuntar-consent').checked = false;
    document.getElementById('adjuntar-consent-wrap').hidden = true;
    const dupe = document.getElementById('adjuntar-dupe'); dupe.hidden = true; dupe.replaceChildren();
    document.getElementById('adjuntar-crear-wrap').open = false;
    document.getElementById('adjuntar-modal').hidden = false;
    document.getElementById('adjuntar-search').focus();
}
function closeAdjuntar() {
    const modal = document.getElementById('adjuntar-modal');
    if (modal) modal.hidden = true;
    _adjPedidoId = null; _adjLabel = '';
}

// Resultados de búsqueda: DOM seguro (createElement + textContent), PII enmascarada (maskDoc/maskPhone).
function renderAdjuntarResults() {
    const ul = document.getElementById('adjuntar-results');
    ul.replaceChildren();
    const matches = filterClientes(_clientes, document.getElementById('adjuntar-search').value);
    for (const c of matches) {
        const li = document.createElement('li');
        li.className = 'pos-adjuntar-row';
        const info = document.createElement('div');
        info.className = 'pos-adjuntar-row-info';
        const nm = document.createElement('strong'); nm.textContent = c.nombre || 'Cliente';
        const meta = document.createElement('span');
        const doc = (c.docKeys && c.docKeys[0]) ? maskDoc(c.docKeys[0]) : '';
        const tel = maskPhone(c.telefono || c.whatsapp);
        meta.textContent = [doc, tel].filter(Boolean).join(' · ') || 'sin documento en sistema';
        info.append(nm, meta);
        const btn = document.createElement('button');
        btn.className = 'adm-btn adm-btn--primary adm-btn--sm';
        btn.textContent = 'Vincular';
        btn.addEventListener('click', () => doVincular(c.id));
        li.append(info, btn);
        ul.appendChild(li);
    }
}

// Aviso anti-duplicado (advisory) al escribir un cliente nuevo: teléfono/nombre ya existente.
function checkAdjuntarDupe() {
    const nombre = document.getElementById('adjuntar-nombre').value.trim();
    const telefono = document.getElementById('adjuntar-tel').value.trim();
    const box = document.getElementById('adjuntar-dupe');
    const hints = advisoryMatchHint(_clientes, { telefono, nombre });
    box.replaceChildren();
    if (!hints.length) { box.hidden = true; return; }
    const h = hints[0];
    const span = document.createElement('span');
    span.textContent = `Ya existe «${h.nombre || 'un cliente'}» con ese ${h.motivo === 'telefono' ? 'teléfono' : 'nombre'}. ¿Es la misma persona? `;
    const btn = document.createElement('button');
    btn.className = 'adm-btn adm-btn--ghost adm-btn--sm';
    btn.textContent = 'Vincular a ese cliente';
    btn.addEventListener('click', () => doVincular(h.clienteId));
    box.append(span, btn);
    box.hidden = false;
}

// El consentimiento (Habeas Data) solo aparece cuando hay documento (comité seguridad).
function toggleConsent() {
    const doc = document.getElementById('adjuntar-doc').value.trim();
    const dt = document.getElementById('adjuntar-doctype').value;
    document.getElementById('adjuntar-consent-wrap').hidden = !(doc && dt);
}

async function doVincular(clienteId) {
    if (_adjSubmitting || !_adjPedidoId || !clienteId) return;
    _adjSubmitting = true;
    try {
        await vincularClientePedido({ pedidoId: _adjPedidoId, clienteId });
        admToast('✓ Cliente vinculado a la venta', 'success');
        ocultarBannerAdjuntar(); closeAdjuntar();   // lista en vivo (listener)
    } catch (err) {
        const msg = (BUSINESS_ERR.includes(err?.code) && err?.message) ? err.message : errorMessage(err, 'No se pudo vincular el cliente.');
        admToast(msg, 'danger', 4000);
    } finally { _adjSubmitting = false; }
}

async function doCrearVincular() {
    if (_adjSubmitting || !_adjPedidoId) return;
    const nombre = document.getElementById('adjuntar-nombre').value.trim();
    const telefono = document.getElementById('adjuntar-tel').value.trim();
    const docType = document.getElementById('adjuntar-doctype').value;
    const docNumber = document.getElementById('adjuntar-doc').value.trim();
    if (!nombre) { admToast('Escribe el nombre del cliente.', 'danger'); return; }
    const tieneDoc = !!(docType && docNumber);
    let consent;
    if (tieneDoc) {
        if (!document.getElementById('adjuntar-consent').checked) {
            admToast('Marca la autorización de datos (Habeas Data) para guardar el documento.', 'danger', 4500); return;
        }
        consent = { granted: true, method: 'presencial', canal: 'mostrador_POS', policyVersion: 'v1',
                    finalidades: ['facturacion_dian', 'antifraude', 'cartera_posventa'] };
    }
    _adjSubmitting = true;
    try {
        const r = await crearClienteConDoc({ nombre, telefono, docType: docType || undefined, docNumber: docNumber || undefined, consent });
        await vincularClientePedido({ pedidoId: _adjPedidoId, clienteId: r.clienteId });
        // Append en memoria (comité: sin refetch de la colección). docKeys las calcula el server → se
        // completan en el próximo fetch; la búsqueda por nombre/teléfono ya funciona con esto.
        if (!_clientes.find(c => c.id === r.clienteId)) {
            _clientes.push({ id: r.clienteId, nombre, telefono, whatsapp: '', docKeys: [], activo: true });
        }
        admToast(r.yaExistia ? '✓ Ese documento ya era de un cliente; se vinculó a la venta' : '✓ Cliente creado y vinculado', 'success', 4000);
        ocultarBannerAdjuntar(); closeAdjuntar();   // lista en vivo (listener)
    } catch (err) {
        const msg = (BUSINESS_ERR.includes(err?.code) && err?.message) ? err.message : errorMessage(err, 'No se pudo crear el cliente.');
        admToast(msg, 'danger', 4000);
    } finally { _adjSubmitting = false; }
}

async function initIdentidad() {
    try { _identidadActiva = await getConfigIdentidadActiva(); } catch { _identidadActiva = false; }
    if (!_identidadActiva) return;   // flag OFF (o error) → POS idéntico a hoy (fail-closed)
    try { _clientes = await fetchClientesLite(); } catch (e) { console.warn('[pos] fetchClientesLite:', e?.code || e); _clientes = []; }
    document.getElementById('pos-adjuntar-banner-btn')?.addEventListener('click', (e) => {
        const b = e.currentTarget; openAdjuntar(b.dataset.pedido, b.dataset.label || '');
    });
    document.getElementById('adjuntar-close')?.addEventListener('click', closeAdjuntar);
    document.getElementById('adjuntar-cancel')?.addEventListener('click', closeAdjuntar);
    document.getElementById('adjuntar-modal')?.addEventListener('click', (e) => { if (e.target.id === 'adjuntar-modal') closeAdjuntar(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !document.getElementById('adjuntar-modal')?.hidden) closeAdjuntar(); });
    document.getElementById('adjuntar-search')?.addEventListener('input', renderAdjuntarResults);
    document.getElementById('adjuntar-crear-btn')?.addEventListener('click', doCrearVincular);
    document.getElementById('adjuntar-doc')?.addEventListener('input', toggleConsent);
    document.getElementById('adjuntar-doctype')?.addEventListener('change', toggleConsent);
    document.getElementById('adjuntar-nombre')?.addEventListener('input', checkAdjuntarDupe);
    document.getElementById('adjuntar-tel')?.addEventListener('input', checkAdjuntarDupe);
}

// ─── Cierre de TURNO de caja (arqueo · conteo a ciegas) ───────────────────────
// TODO-70/L-81: el cierre es SIEMPRE de un turno abierto (el Cierre Z legacy sin turno se RETIRÓ). El
// modal solo se abre desde "Cerrar turno" de la tarjeta de caja, visible únicamente con turno abierto.
function openCierre() {
    _cierreDone = false;
    const title = document.getElementById('cierre-title');
    if (title) title.textContent = 'Cerrar turno de caja';
    document.getElementById('cierre-efectivo').value = '';
    document.getElementById('cierre-input-wrap').hidden = false;
    document.getElementById('cierre-result').hidden = true;
    const digital = document.getElementById('cierre-digital');
    if (digital) digital.hidden = true;
    // TODO-73 3b: los campos de voucher solo aparecen si hubo ventas con datáfono en el turno.
    const hayDatafono = hayVentasDatafonoTurno();
    const vwrap = document.getElementById('cierre-voucher-wrap');
    if (vwrap) {
        vwrap.hidden = !hayDatafono;
        document.getElementById('cierre-voucher-cant').value = '';
        document.getElementById('cierre-voucher-suma').value = '';
    }
    const vres = document.getElementById('cierre-voucher-result');
    if (vres) vres.hidden = true;
    const submit = document.getElementById('cierre-submit');
    submit.textContent = 'Cerrar turno';
    submit.disabled = false;
    document.getElementById('cierre-modal').hidden = false;
    document.getElementById('cierre-efectivo').focus();
}

function closeCierre() { document.getElementById('cierre-modal').hidden = true; }

async function handleCierre() {
    if (_cierreDone) { closeCierre(); return; }   // 2º clic tras el resultado = "Listo"
    const raw = document.getElementById('cierre-efectivo').value;
    if (raw === '' || !(Number(raw) >= 0)) { admToast('Escribe el efectivo contado.', 'danger'); return; }

    // TODO-73 3b: si hubo datáfono, EXIGIR el conteo de vouchers (como el efectivo → evita el "Falta $X"
    // falso que Daniel odia). El core distingue `datafono` AUSENTE de `{0,0}`.
    const conteoPorMedio = { efectivo: entero(raw) };
    const hayDatafono = hayVentasDatafonoTurno();
    if (hayDatafono) {
        const vc = document.getElementById('cierre-voucher-cant').value;
        const vs = document.getElementById('cierre-voucher-suma').value;
        if (vc === '' || !(Number(vc) >= 0) || vs === '' || !(Number(vs) >= 0)) {
            admToast('Cuenta los vouchers del datáfono: cuántos son y por cuánto.', 'danger'); return;
        }
        conteoPorMedio.datafono = { suma: entero(vs), cantidad: entero(vc) };
    }

    // El cierre es SIEMPRE de un turno (Z legacy retirado). Re-derivamos el turnoId del estado VIVO:
    // si el turno se cerró desde otra sesión entre abrir el modal y confirmar, avisamos y no forzamos nada.
    const turnoId = _cajaEstado?.turnoAbiertoId || null;
    if (!turnoId) {
        admToast('No hay un turno de caja abierto para cerrar (¿ya se cerró en otra sesión?).', 'danger', 5000);
        closeCierre();
        return;
    }

    const submit = document.getElementById('cierre-submit');
    submit.disabled = true;
    submit.textContent = 'Calculando…';
    try {
        const r = await cerrarTurno({ turnoId, conteoPorMedio });
        renderDigitalBreakdown(r.esperadoPorMedio);             // reporte diario de tarjetas/transferencias (§9.5)
        renderVoucherResult(r, hayDatafono);                    // TODO-73 3b: cuadre de vouchers del datáfono
        // Conteo a ciegas: el esperado se revela AHORA, no antes.
        document.getElementById('cierre-esperado').textContent = cop(r.esperadoEfectivo);
        document.getElementById('cierre-contado').textContent  = cop(r.declaradoEfectivo);
        const d     = Number(r.descuadre) || 0;
        const label = document.getElementById('cierre-descuadre-label');
        const val   = document.getElementById('cierre-descuadre');
        if (d === 0)    { label.textContent = 'Cuadra ✓'; val.textContent = cop(0);  val.style.color = 'var(--adm-success)'; }
        else if (d > 0) { label.textContent = 'Sobra';     val.textContent = cop(d);  val.style.color = 'var(--adm-accent)'; }
        else            { label.textContent = 'Falta';     val.textContent = cop(-d); val.style.color = 'var(--adm-danger)'; }
        document.getElementById('cierre-input-wrap').hidden = true;
        const vwrap = document.getElementById('cierre-voucher-wrap'); if (vwrap) vwrap.hidden = true;   // TODO-73: ocultar inputs tras revelar
        document.getElementById('cierre-result').hidden = false;
        _cierreDone = true;
        submit.textContent = 'Listo';
        submit.disabled = false;
    } catch (err) {
        const msg = (BUSINESS_ERR.includes(err?.code) && err?.message) ? err.message
            : errorMessage(err, 'No se pudo cerrar el turno.');
        admToast(msg, 'danger', 4000);
        submit.textContent = 'Cerrar turno';
        submit.disabled = false;
    }
}

// Desglose por medio digital (transferencia/Wompi/Addi) del turno cerrado — reporte diario (§9.5).
// El efectivo va aparte (arriba); esto es informativo (medios electrónicos no se "cuentan a ciegas").
function renderDigitalBreakdown(esperadoPorMedio) {
    const box  = document.getElementById('cierre-digital');
    const list = document.getElementById('cierre-digital-list');
    if (!box || !list) return;
    list.textContent = '';
    const MEDIOS = [['transferencia', 'Transferencia'], ['wompi', 'Wompi'], ['addi', 'Addi']];
    let any = false;
    for (const [k, label] of MEDIOS) {
        const val = entero(esperadoPorMedio?.[k]);
        if (val <= 0) continue;
        any = true;
        const line = document.createElement('div'); line.className = 'adm-calc-line';
        const s  = document.createElement('span');   s.textContent = label;
        const st = document.createElement('strong'); st.textContent = cop(val);
        line.appendChild(s); line.appendChild(st); list.appendChild(line);
    }
    box.hidden = !any;
}

// TODO-73 3b · Cuadre de VOUCHERS del datáfono (cantidad + monto). Lenguaje del comité (§8): Cuadra/Sobra/
// Falta para el MONTO ($); coinciden/sobran N/faltan N para la CANTIDAD (jamás formatear la cantidad como
// dinero). NUNCA bloquea (Daniel). `datafonoAnuladoEnTurno` explica una "sobra" (anti-fraude). Back-compat:
// turnos viejos sin esperadoDatafono → {suma:0,cantidad:0}.
function renderVoucherResult(r, hayDatafono) {
    const box = document.getElementById('cierre-voucher-result');
    if (!box) return;
    if (!hayDatafono) { box.hidden = true; return; }
    const cero = { suma: 0, cantidad: 0 };
    const esp = r.esperadoDatafono  || cero;
    const dec = r.declaradoDatafono || cero;
    const dMonto = entero(dec.suma) - entero(esp.suma);
    const dCant  = entero(dec.cantidad) - entero(esp.cantidad);
    document.getElementById('cierre-voucher-esp').textContent = `${entero(esp.cantidad)} voucher(s) · ${cop(esp.suma)}`;
    document.getElementById('cierre-voucher-con').textContent = `${entero(dec.cantidad)} voucher(s) · ${cop(dec.suma)}`;
    const mLbl = document.getElementById('cierre-voucher-monto-label');
    const mVal = document.getElementById('cierre-voucher-monto');
    if (dMonto === 0)     { mLbl.textContent = 'Monto: cuadra ✓'; mVal.textContent = cop(0);       mVal.style.color = 'var(--adm-success)'; }
    else if (dMonto > 0)  { mLbl.textContent = 'Monto: sobra';    mVal.textContent = cop(dMonto);   mVal.style.color = 'var(--adm-accent)'; }
    else                  { mLbl.textContent = 'Monto: falta';    mVal.textContent = cop(-dMonto);  mVal.style.color = 'var(--adm-danger)'; }
    const cLbl = document.getElementById('cierre-voucher-cant-label');
    const cVal = document.getElementById('cierre-voucher-cant-res');
    if (dCant === 0)     { cLbl.textContent = 'Cantidad: coinciden ✓'; cVal.textContent = String(entero(dec.cantidad)); cVal.style.color = 'var(--adm-success)'; }
    else if (dCant > 0)  { cLbl.textContent = 'Cantidad: sobran';      cVal.textContent = `+${dCant}`;                   cVal.style.color = 'var(--adm-accent)'; }
    else                 { cLbl.textContent = 'Cantidad: faltan';      cVal.textContent = String(dCant);                 cVal.style.color = 'var(--adm-danger)'; }
    const anu  = r.datafonoAnuladoEnTurno || cero;
    const anuP = document.getElementById('cierre-voucher-anulado');
    if (anuP) {
        if (entero(anu.cantidad) > 0) {
            anuP.textContent = `⚠ ${entero(anu.cantidad)} cobro(s) con tarjeta anulados en el turno (${cop(anu.suma)}): verifica que también se anularan en el datáfono.`;
            anuP.hidden = false;
        } else { anuP.hidden = true; }
    }
    box.hidden = false;
}

// ─── Export al contador (paso 6 · bruto/neto) ─────────────────────────────────
// L-72: el estado se rotula con estadoPedido() compartido (no un mapa local que se pudre al
// sumar estados — antes el CSV mostraba 'despacho_nacional' crudo en vez de "En camino").
const csvCell = v => {
    let s = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;   // anti CSV/formula-injection: '=SUM(..)' no se ejecuta en Excel/Sheets (comité F2.2)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Descarga un CSV de las ventas con bruto/comisión/retenciones/neto para el contador.
// Bruto = exacto (server). Neto usa tasas DEFAULT (Wompi/retenciones) hasta que el contador
// confirme las reales (calcularNeto, §fiscal.js). Anuladas = neto 0 (no son ingreso).
async function exportarContador() {
    let ventas;
    try { ventas = await ultimasVentas(500); }
    catch (err) { admToast(errorMessage(err, 'No se pudieron cargar las ventas.'), 'danger'); return; }
    if (!ventas.length) { admToast('No hay ventas para exportar.', 'default'); return; }

    // F2.2 §8.3 D: split por NATURALEZA para la renta por actividad (joyas 3211 vs servicios). Cada venta
    // es 1 pieza (bien) + N servicios/modificaciones → "Servicios (bruto)" = Σ líneas naturaleza 'servicio';
    // bienes = Bruto − Servicios. Sin IVA (titular No responsable de IVA, §8.3 D). Legacy sin items → 0.
    const brutoServicios = v => Array.isArray(v.items)
        ? v.items.reduce((a, it) => a + (it.naturaleza === 'servicio' ? entero(it.precio) * (Number(it.cantidad) || 1) : 0), 0)
        : 0;
    // C.4: la comisión Wompi va DISCRIMINADA (base + IVA) para que el contador tenga el IVA descontable aparte.
    const head = ['Número', 'Fecha', 'Pieza', 'Medio', 'Estado', 'Bruto', 'Servicios (bruto)', 'Comisión base', 'IVA comisión', 'Comisión total', 'ReteFuente', 'ReteICA', 'Neto'];
    // TODO-73 §9: con pago dividido la comisión (p.ej. Wompi) aplica SOLO a su porción → neto por-pago y se suma.
    const fiscalDe = (v) => {
        if (v.estado === 'anulado') return { bruto: entero(v.total), comisionWompi: 0, comisionBase: 0, comisionIva: 0, reteFuente: 0, reteIca: 0, neto: 0 };
        if (Array.isArray(v.pagos) && v.pagos.length) {
            const acc = { bruto: 0, comisionWompi: 0, comisionBase: 0, comisionIva: 0, reteFuente: 0, reteIca: 0, neto: 0 };
            for (const pg of v.pagos) { const g = calcularNeto({ bruto: entero(pg.monto), medio: pg.medio }); for (const k in acc) acc[k] += (Number(g[k]) || 0); }
            return acc;
        }
        return calcularNeto({ bruto: v.total, medio: v.medio });
    };
    const rows = ventas.map(v => {
        const f = fiscalDe(v);
        return [
            v.numero ?? '', fmtDateTime(v.createdAt), v.pieceName || 'Pieza', v.medio || '',
            estadoPedido(v.estado).label,
            f.bruto, brutoServicios(v), f.comisionBase, f.comisionIva, f.comisionWompi, f.reteFuente, f.reteIca, f.neto,
        ].map(csvCell).join(',');
    });
    const csv = '﻿' + [head.map(csvCell).join(','), ...rows].join('\r\n');   // BOM → Excel respeta acentos
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ventas-contador.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    admToast('Descargando ventas-contador.csv…');
}

init();
