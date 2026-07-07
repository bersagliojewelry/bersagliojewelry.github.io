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
    crearPedido, confirmarPago, anularPedido, cierreCaja, ultimasVentas, onUltimasVentasChange,
    abrirTurno, cerrarTurno, movimientoCaja, registrarTraslado,               // F2.0 · escrituras
    onCajaEstadoChange, onConfigCajaChange, onTurnoChange, onMovsCajaChange,  // F2.0 · lecturas
    onVentasTurnoChange, onTrasladosTurnoChange,
    crearClienteConDoc, vincularClientePedido, getConfigIdentidadActiva, fetchClientesLite,  // F2.1 · identidad
} from '../pedidos-service.js';
import { estadoPedido, ESTADOS_SIN_DINERO } from './pedidos-format.js';   // F1-CORE: mapa de estados compartido con Pedidos
import { CONCEPTOS_CAJA, conceptoLabel, efectivoEnCajon, trasladoSugerido, superaLimite } from './caja-format.js';
import { advisoryMatchHint, filterClientes, maskDoc, maskPhone } from './advisory-match.js';   // F2.1 · dedup blando + máscara PII

const cop = n => '$' + Math.round(Math.max(0, Number(n) || 0)).toLocaleString('es-CO');
const entero = n => Math.round(Math.max(0, Number(n) || 0));
// UUID de idempotencia (secure context → randomUUID; fallback defensivo si faltara).
const uid = () => (crypto?.randomUUID?.() || `pos-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);

const MEDIO_LABEL = { efectivo: 'Efectivo', transferencia: 'Transferencia', wompi: 'Wompi' };
// Mensaje de negocio de la CF (claro, en español) > el genérico por código.
const BUSINESS_ERR = ['failed-precondition', 'invalid-argument', 'not-found', 'already-exists'];

let _allPieces = [];
let _selected  = null;    // pieza elegida
let _pedidoId  = null;    // UUID de la venta en curso (idempotencia)
let _query     = '';
let _submitting = false;
let _arqueoId  = null;    // UUID del cierre de caja en curso (idempotencia)
let _cierreDone = false;  // ya se calculó el arqueo (el botón pasa a "Listo")

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
let _cierreTurnoMode = false;                                // el modal de cierre cierra un TURNO (no el Z legacy)
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

    // Cierre de caja (arqueo · paso 5)
    document.getElementById('btn-cierre').addEventListener('click', openCierre);
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
    onConfigCajaChange(cfg => { _cfgCaja = cfg; renderCaja(); recalcTotal(); },
        e => console.warn('[caja] config no legible:', e?.code || e));
    onCajaEstadoChange(handleCajaEstado,
        e => console.warn('[caja] estado no legible:', e?.code || e));

    // Botones del turno (existen en el HTML del POS; wire defensivo).
    document.getElementById('caja-abrir')?.addEventListener('click', abrirCaja);
    document.getElementById('caja-mov')?.addEventListener('click', () => openMov());
    document.getElementById('caja-traslado')?.addEventListener('click', () => openTraslado(efectivoCajon()));
    document.getElementById('caja-cerrar')?.addEventListener('click', openCierre);

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
        if (id) {
            _turnoUnsubs.push(onTurnoChange(id, t => { _turno = t; renderCaja(); recalcTotal(); },
                e => console.warn('[caja] turno no legible:', e?.code || e)));
            _turnoUnsubs.push(onMovsCajaChange(id, m => { _movsCaja = m; renderCaja(); recalcTotal(); },
                e => console.warn('[caja] movimientos no legibles:', e?.code || e)));
            // Ventas del turno (read isVentas). Un rol `caja` puro aún NO puede leer pedidos (gap
            // documentado) → degrada: el efectivo del cajón se muestra sin las ventas hasta habilitarlo.
            _turnoUnsubs.push(onVentasTurnoChange(id, v => { _ventasTurno = v; renderCaja(); recalcTotal(); },
                e => console.warn('[caja] ventas del turno no legibles (rol sin lectura de pedidos):', e?.code || e)));
            // Traslados del turno (read isOwner). Si el operador NO es owner → error → usamos el
            // rastreo por sesión (client-track). El owner (Kary en prod) obtiene el cajón exacto.
            _turnoUnsubs.push(onTrasladosTurnoChange(id, tr => { _trasladosLedger = tr; renderCaja(); recalcTotal(); },
                () => { _trasladosLedger = null; renderCaja(); }));
        }
    }
    renderCaja();
    recalcTotal();
}

// ─── Derivación del efectivo del cajón (ESTIMACIÓN operativa; la autoridad es el cierre server) ──
function ventasEfectivoTurno() {
    return _ventasTurno.reduce((s, p) =>
        (p.medio === 'efectivo' && !ESTADOS_SIN_DINERO.has(p.estado)) ? s + entero(p.total) : s, 0);
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
    if (Array.isArray(_trasladosLedger)) {                          // owner-authoritative (ledger real)
        let cajonABoveda = 0, bovedaACajon = 0;
        for (const t of _trasladosLedger) {
            if (t.anulado) continue;
            if (t.tipo === 'cajon_a_boveda') cajonABoveda += entero(t.monto);
            else if (t.tipo === 'boveda_a_cajon') bovedaACajon += entero(t.monto);
        }
        return { cajonABoveda, bovedaACajon };
    }
    return { cajonABoveda: _trasladadoSesion, bovedaACajon: 0 };   // fallback en memoria (rol sin lectura del ledger)
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

// ─── Render del panel de caja ─────────────────────────────────────────────────
function renderCaja() {
    const card = document.getElementById('caja-card');
    if (!card || !_isCaja) return;

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
    document.getElementById('caja-efectivo').textContent  = cop(efectivo);

    // Barra de límite (discreta): solo si el owner configuró un límite.
    const limWrap = document.getElementById('caja-limite-wrap');
    const over = superaLimite(efectivo, limite);
    if (limWrap) {
        if (Number.isFinite(limite) && limite > 0) {
            limWrap.hidden = false;
            const pct = Math.min(100, Math.round((efectivo / limite) * 100));
            const bar = document.getElementById('caja-limite-bar');
            if (bar) { bar.style.width = pct + '%'; bar.classList.toggle('is-over', over); }
            document.getElementById('caja-limite-txt').textContent = `Límite del cajón: ${cop(limite)}`;
        } else {
            limWrap.hidden = true;
        }
    }

    // Alerta + auto-modal al CRUZAR el límite (una sola vez; se re-arma al bajar). Se inhibe si YA hay
    // un overlay abierto (traslado/cierre/movimiento/confirmación): abrir el traslado encima apilaría
    // dos modales sobre el mismo backdrop y robaría el foco a la operación en curso.
    const alerta = document.getElementById('caja-alerta');
    if (alerta) alerta.hidden = !over;
    if (over && !_overLimit && !anyOverlayOpen()) openTraslado(efectivo);
    _overLimit = over;
}

function isTrasladoOpen() { return !document.getElementById('tras-modal')?.hidden; }
function isCierreOpen()   { return !document.getElementById('cierre-modal')?.hidden; }
function isMovOpen()      { return !document.getElementById('mov-modal')?.hidden; }
function isConfirmOpen()  { return !document.getElementById('confirm-dialog')?.hidden; }
function anyOverlayOpen() { return isTrasladoOpen() || isCierreOpen() || isMovOpen() || isConfirmOpen(); }

// ─── Abrir caja ────────────────────────────────────────────────────────────────
function abrirCaja() {
    const fondoDefault = entero(_cfgCaja?.fondoTrabajo || 0);
    const raw = window.prompt(
        `Fondo de apertura (base en efectivo para el cambio).\nSugerido: ${cop(fondoDefault)}`,
        String(fondoDefault || ''),
    );
    if (raw === null) return;                       // canceló
    const fondo = entero(raw);
    if (!(fondo >= 0)) { admToast('El fondo debe ser un número válido.', 'danger'); return; }
    if (!_turnoOpId) _turnoOpId = uid();            // idempotencia: mismo opId si reintenta

    admConfirm(`¿Abrir la caja con un fondo de ${cop(fondo)}?`, async () => {
        try {
            const res = await abrirTurno({ opId: _turnoOpId, fondoApertura: fondo });
            _turnoOpId = null;                        // el turno nuevo resetea _trasladadoSesion vía handleCajaEstado
            // Render OPTIMISTA: la CF ya commiteó el turno (existe en Firestore) → pintamos "abierta" AL
            // INSTANTE, sin esperar los 2 viajes del puntero encadenado (caja/estado → onTurnoChange).
            // Disparamos handleCajaEstado a mano con el estado ya conocido; el snapshot real reconcilia.
            _pendingOpenTurno = { id: res.turnoId, estado: 'abierto', fondoApertura: entero(res.fondoApertura ?? fondo) };
            handleCajaEstado({ turnoAbiertoId: res.turnoId, docsDelTurno: 0 });
            admToast('✓ Caja abierta', 'success');
        } catch (err) {
            const msg = (BUSINESS_ERR.includes(err?.code) && err?.message) ? err.message
                : errorMessage(err, 'No se pudo abrir la caja.');
            admToast(msg, 'danger', 5000);
            // Conservamos _turnoOpId → reintentar es idempotente (no crea dos turnos).
        }
    });
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
function openTraslado(efectivoActual) {
    if (!_turno || _turno.estado !== 'abierto') { admToast('Abre la caja primero.', 'danger'); return; }
    // opId perezoso (se acuña en handleTraslado): cerrar+reabrir tras un fallo aparente reusa el mismo
    // id → cero doble-vaciado del cajón si la CF ya había commiteado antes del corte de red.
    const sugerido = trasladoSugerido(efectivoActual, entero(_cfgCaja?.fondoTrabajo || 0));
    const over = superaLimite(efectivoActual, Number(_cfgCaja?.limiteCajon));
    document.getElementById('tras-monto').value = sugerido || '';
    document.getElementById('tras-nota').value = '';
    document.getElementById('tras-obligatorio').hidden = !over;
    document.getElementById('tras-efectivo').textContent = cop(efectivoActual);
    const submit = document.getElementById('tras-submit');
    submit.disabled = false; submit.textContent = 'Registrar traslado';
    document.getElementById('tras-modal').hidden = false;
    document.getElementById('tras-monto').focus();
}
function closeTraslado() { document.getElementById('tras-modal').hidden = true; }
async function handleTraslado() {
    if (!_turno) return;
    const monto = entero(document.getElementById('tras-monto').value);
    const nota = document.getElementById('tras-nota').value.trim();
    if (!(monto > 0)) { admToast('El monto debe ser mayor a 0.', 'danger'); return; }
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

    _selected = piece;
    _pedidoId = uid();   // nueva venta → nuevo UUID de idempotencia
    ocultarBannerAdjuntar();   // F2.1: empezar la siguiente venta archiva la anterior a la cola (sin toques)

    document.getElementById('pos-sel-name').textContent = piece.name || 'Pieza';
    document.getElementById('pos-sel-code').textContent = piece.code ? `· ${piece.code}` : '';
    document.getElementById('pos-picker').hidden   = true;
    document.getElementById('pos-selected').hidden = false;
    document.getElementById('pos-sale').hidden     = false;

    setupPriceMode(piece);
    recalcTotal();
}

function resetSale() {
    _selected = null;
    _pedidoId = null;
    _query = '';
    document.getElementById('pos-search').value = '';
    document.getElementById('pos-picker').hidden   = false;
    document.getElementById('pos-selected').hidden = true;
    document.getElementById('pos-sale').hidden     = true;
    ['pos-gramo', 'pos-peso', 'pos-mano'].forEach(id => { document.getElementById(id).value = ''; });
    document.getElementById('pos-envio').checked = false;   // F1-CORE: cada venta decide su envío
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

/** Total que se MOSTRARÁ y se cobrará (mismo criterio que pedidos-core). */
function computeTotal() {
    if (!_selected) return 0;
    if (isPrecioFijo(_selected)) return entero(_selected.price);
    const r = calcularPrecio({
        valorGramo: document.getElementById('pos-gramo').value,
        peso:       document.getElementById('pos-peso').value,
        manoObra:   document.getElementById('pos-mano').value,
    });
    return r.total;
}

function recalcTotal() {
    const total = computeTotal();
    document.getElementById('pos-total').textContent = cop(total);
    const blocked = ventaBloqueadaPorCaja();   // F2.0: sin caja abierta (enforceTurno) o cajón sobre el límite
    document.getElementById('pos-submit').disabled = !(total > 0) || _submitting || blocked;
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

// ─── Paso 3: medio de pago ────────────────────────────────────────────────────
// F1-CORE §3.3 (ruta corta): mostrador SIN envío = venta EN MANO → termina `entregado` de una vez
// (en efectivo nace así; transferencia/wompi al confirmar el pago). CON envío entra al flujo
// logístico del módulo Pedidos. El hint le dice a Kary EXACTAMENTE qué va a pasar.
function updateMedioHint() {
    const medio = document.getElementById('pos-medio').value;
    const envio = document.getElementById('pos-envio').checked;
    const hint  = document.getElementById('pos-medio-hint');
    if (medio === 'efectivo') {
        hint.textContent = envio
            ? 'Quedará PAGADA y entrará al flujo de envío (módulo Pedidos).'
            : 'Venta en mano: quedará ENTREGADA (pagada) de una vez.';
    } else {
        hint.textContent = envio
            ? 'Quedará "por verificar"; al confirmar el pago entrará al flujo de envío.'
            : 'Quedará "por verificar"; al confirmar el pago quedará ENTREGADA (venta en mano).';
    }
}

// ─── Confirmar y registrar ────────────────────────────────────────────────────
function handleSubmit() {
    if (!_selected || _submitting) return;
    const total = computeTotal();
    if (total <= 0) { admToast('El total debe ser mayor a 0.', 'danger'); return; }

    const medio = document.getElementById('pos-medio').value;
    const nombre = _selected.name || 'la pieza';
    admConfirm(
        `¿Registrar la venta de «${nombre}» por ${cop(total)} (${MEDIO_LABEL[medio] || medio})?`,
        () => doRegister(medio, total)
    );
}

async function doRegister(medio, total) {
    _submitting = true;
    const btn = document.getElementById('pos-submit');
    btn.disabled = true;
    const prevText = btn.textContent;
    btn.textContent = 'Registrando…';

    const payload = { pedidoId: _pedidoId, pieceId: _selected.id, medio, canal: 'pos' };
    // F1-CORE §3.3: con envío el pedido NO es venta en mano → entra al flujo logístico.
    if (document.getElementById('pos-envio').checked) payload.requiereEnvio = true;
    if (!isPrecioFijo(_selected)) {
        payload.valorGramo = document.getElementById('pos-gramo').value;
        payload.peso       = document.getElementById('pos-peso').value;
        payload.manoObra   = document.getElementById('pos-mano').value;
    }

    try {
        const res = await crearPedido(payload);
        // F2.1 money-safety (comité regresión): capturar POR VALOR ANTES de resetSale; el reset va
        // PRIMERO (si no corre, `_pedidoId` no rota → la venta siguiente colisiona por idempotencia →
        // venta perdida en silencio); el banner de adjuntar va DESPUÉS, en try/catch, y JAMÁS lo impide.
        const nuevoPedidoId = res.pedidoId || _pedidoId;
        const label = `Pedido ${res.codigo || '#' + res.numero} · ${_selected?.name || 'Pieza'} · ${cop(res.total)}`;
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
        const anularBtn = muerta ? '' :
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

// ─── Cierre de caja (arqueo · paso 5 / cierre de TURNO F2.0) ───────────────────
// Contexto: si hay un turno abierto (F2.0), "Cerrar caja" cierra el TURNO (cerrarTurno, ecuación
// completa §8.1.7 + desglose por medio); si no, cae al Cierre Z legacy (cierreCaja). El conteo a
// ciegas (contar efectivo antes de ver el esperado) es idéntico en ambos.
function openCierre() {
    _cierreTurnoMode = _isCaja && !!_cajaEstado?.turnoAbiertoId;
    _arqueoId   = uid();
    _cierreDone = false;
    const title = document.getElementById('cierre-title');
    if (title) title.textContent = _cierreTurnoMode ? 'Cerrar turno de caja' : 'Cerrar caja';
    document.getElementById('cierre-efectivo').value = '';
    document.getElementById('cierre-input-wrap').hidden = false;
    document.getElementById('cierre-result').hidden = true;
    const digital = document.getElementById('cierre-digital');
    if (digital) digital.hidden = true;
    const submit = document.getElementById('cierre-submit');
    submit.textContent = _cierreTurnoMode ? 'Cerrar turno' : 'Cerrar caja';
    submit.disabled = false;
    document.getElementById('cierre-modal').hidden = false;
    document.getElementById('cierre-efectivo').focus();
}

function closeCierre() { document.getElementById('cierre-modal').hidden = true; }

async function handleCierre() {
    if (_cierreDone) { closeCierre(); return; }   // 2º clic tras el resultado = "Listo"
    const raw = document.getElementById('cierre-efectivo').value;
    if (raw === '' || !(Number(raw) >= 0)) { admToast('Escribe el efectivo contado.', 'danger'); return; }

    // Revalidación (edge multi-sesión): el modo se fijó al ABRIR el modal; si el turno se cerró desde
    // otra sesión entre tanto, `_cajaEstado.turnoAbiertoId` ya es null (lo actualizó handleCajaEstado).
    // Re-derivamos el turnoId del estado VIVO para no mandar cerrarTurno({turnoId:null}); si ya no hay
    // turno, avisamos (el arqueo del turno lo hizo la otra sesión — no forzamos un Z legacy espurio).
    const turnoId = _cajaEstado?.turnoAbiertoId || null;
    if (_cierreTurnoMode && !turnoId) {
        admToast('El turno ya se cerró (posiblemente desde otra sesión). No se registró un cierre duplicado.', 'danger', 5000);
        closeCierre();
        return;
    }

    const submit = document.getElementById('cierre-submit');
    submit.disabled = true;
    submit.textContent = 'Calculando…';
    try {
        let r;
        if (_cierreTurnoMode) {
            r = await cerrarTurno({ turnoId, conteoPorMedio: { efectivo: entero(raw) } });
            renderDigitalBreakdown(r.esperadoPorMedio);             // reporte diario de tarjetas/transferencias (§9.5)
        } else {
            r = await cierreCaja({ arqueoId: _arqueoId, declaradoEfectivo: raw });
        }
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
        document.getElementById('cierre-result').hidden = false;
        _cierreDone = true;
        submit.textContent = 'Listo';
        submit.disabled = false;
    } catch (err) {
        const msg = (BUSINESS_ERR.includes(err?.code) && err?.message) ? err.message
            : errorMessage(err, 'No se pudo cerrar la caja.');
        admToast(msg, 'danger', 4000);
        submit.textContent = _cierreTurnoMode ? 'Cerrar turno' : 'Cerrar caja';
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

// ─── Export al contador (paso 6 · bruto/neto) ─────────────────────────────────
// L-72: el estado se rotula con estadoPedido() compartido (no un mapa local que se pudre al
// sumar estados — antes el CSV mostraba 'despacho_nacional' crudo en vez de "En camino").
const csvCell = v => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

// Descarga un CSV de las ventas con bruto/comisión/retenciones/neto para el contador.
// Bruto = exacto (server). Neto usa tasas DEFAULT (Wompi/retenciones) hasta que el contador
// confirme las reales (calcularNeto, §fiscal.js). Anuladas = neto 0 (no son ingreso).
async function exportarContador() {
    let ventas;
    try { ventas = await ultimasVentas(500); }
    catch (err) { admToast(errorMessage(err, 'No se pudieron cargar las ventas.'), 'danger'); return; }
    if (!ventas.length) { admToast('No hay ventas para exportar.', 'default'); return; }

    // C.4: la comisión Wompi va DISCRIMINADA (base + IVA) para que el contador tenga el IVA descontable aparte.
    const head = ['Número', 'Fecha', 'Pieza', 'Medio', 'Estado', 'Bruto', 'Comisión base', 'IVA comisión', 'Comisión total', 'ReteFuente', 'ReteICA', 'Neto'];
    const rows = ventas.map(v => {
        const f = (v.estado === 'anulado')
            ? { bruto: entero(v.total), comisionWompi: 0, comisionBase: 0, comisionIva: 0, reteFuente: 0, reteIca: 0, neto: 0 }
            : calcularNeto({ bruto: v.total, medio: v.medio });
        return [
            v.numero ?? '', fmtDateTime(v.createdAt), v.pieceName || 'Pieza', v.medio || '',
            estadoPedido(v.estado).label,
            f.bruto, f.comisionBase, f.comisionIva, f.comisionWompi, f.reteFuente, f.reteIca, f.neto,
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
