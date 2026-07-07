/**
 * pedidos-service.js — cliente del ÚNICO escritor de ventas (B1 paso 3 · TODO-37).
 *
 * El navegador (POS/web/WhatsApp) manda INSUMOS; la Cloud Function `crearPedido` (Admin SDK)
 * valida el stock atómico (candado = doc de la pieza), RECALCULA el total server-side y congela
 * el snapshot inmutable. Aquí NO vive lógica de dinero ni de concurrencia: solo transporte
 * (callable) + lectura de las ventas (staff). Aísla el backend de la vista (pos.js) para que
 * web/WhatsApp reusen lo mismo sin arrastrar el DOM del panel (§3.6 cero monolitos).
 */
import { app, firestoreDb } from './firebase-config.js';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { subscribeWithRetry } from './core/live-query.js';

// Callable lazy (no cargamos firebase/functions hasta la 1ª venta — igual que crm-service).
async function _callable(name) {
    const { getFunctions, httpsCallable } = await import('firebase/functions');
    return httpsCallable(getFunctions(app, 'us-central1'), name);
}

/**
 * Registra una venta llamando a la CF `crearPedido` (idempotente por `pedidoId`).
 * @param {{ pedidoId:string, pieceId:string, valorGramo?:number|string, peso?:number|string,
 *           manoObra?:number|string, medio?:string, canal?:string }} input
 * @returns {Promise<{ pedidoId:string, numero:number, total:number, yaExistia:boolean }>}
 */
export async function crearPedido(input) {
    const fn = await _callable('crearPedido');
    return (await fn(input)).data;
}

/**
 * Wompi F2 — el cliente PÚBLICO inicia el cobro web de UNA pieza. La CF `iniciarPagoWeb` reserva
 * la pieza (candado atómico), crea el pedido `pago_pendiente`, recalcula el total y FIRMA server-side.
 * @param {{ pedidoId:string, pieceId:string, shipping?:object }} input  (pedidoId = UUID del cliente, idempotencia)
 * @returns {Promise<{ reference:string, amountInCents:number, currency:string, signature:string, publicKey:string, estado:string }>}
 */
export async function iniciarPagoWeb(input) {
    const fn = await _callable('iniciarPagoWeb');
    return (await fn(input)).data;
}

/**
 * Confirma que llegó el pago de un pedido ("vi la plata"): `pago_por_verificar` → `pagado`.
 * Solo la CF flipea el estado (regla SoD). Idempotente.
 * @param {string} pedidoId
 * @returns {Promise<{ pedidoId:string, estado:string, yaEstaba:boolean }>}
 */
export async function confirmarPago(pedidoId) {
    const fn = await _callable('confirmarPago');
    return (await fn({ pedidoId })).data;
}

/**
 * Anula un pedido (VOID): lo marca `anulado` y reintegra la pieza al catálogo. Idempotente.
 * @param {string} pedidoId @param {string} [motivo]
 * @returns {Promise<{ ok:boolean, yaAnulado:boolean, piezaReintegrada?:boolean }>}
 */
export async function anularPedido(pedidoId, motivo) {
    const fn = await _callable('anularPedido');
    return (await fn({ pedidoId, motivo })).data;
}

/**
 * F1-CORE: avanza un pedido por la máquina de estados (tabla TRANSICIONES server-side).
 * @param {{ pedidoId:string, a:string, datos?:object, nota?:string }} input
 * @returns {Promise<{ pedidoId:string, estado:string, de?:string, yaEstaba?:boolean }>}
 */
export async function avanzarPedido(input) {
    const fn = await _callable('avanzarPedido');
    return (await fn(input)).data;
}

/**
 * Cierre de caja (arqueo): declara el efectivo contado → devuelve esperado y descuadre. Idempotente por arqueoId.
 * @param {{ arqueoId:string, declaradoEfectivo:number|string }} input
 * @returns {Promise<{ esperadoEfectivo:number, esperadoPorMedio:object, declaradoEfectivo:number, descuadre:number, yaExistia:boolean }>}
 */
export async function cierreCaja(input) {
    const fn = await _callable('cierreCaja');
    return (await fn(input)).data;
}

// ─── F2.0 · Sesión de caja + Bóveda (transporte callable; lógica en caja-core.js del server) ─────
// El navegador genera el `opId` (idempotencia §8.1.2) y lo manda; el rol lo valida la CF (isCaja opera,
// owner aprueba). Los cores recomputan/gatean server-side; aquí SOLO transporte (§3.6 cero monolitos).

/** Abre el turno de caja (rechaza si ya hay uno abierto). @param {{opId:string, fondoApertura:number}} input */
export async function abrirTurno(input) {
    const fn = await _callable('abrirTurno');
    return (await fn(input)).data;
}
/** Cierra el turno: arqueo a ciegas + ecuación completa + descuadre. @param {{turnoId:string, conteoPorMedio:object}} input */
export async function cerrarTurno(input) {
    const fn = await _callable('cerrarTurno');
    return (await fn(input)).data;
}
/** Ingreso/egreso manual del turno (egreso → alerta al owner). @param {{turnoId, opId, tipo, concepto, monto, nota?}} input */
export async function movimientoCaja(input) {
    const fn = await _callable('movimientoCaja');
    return (await fn(input)).data;
}
/** Traslado de dinero cajón↔bóveda↔banco (recompute del saldo). @param {{opId, tipo, monto, turnoId?, nota?}} input */
export async function registrarTraslado(input) {
    const fn = await _callable('registrarTraslado');
    return (await fn(input)).data;
}
/** Reversa (asiento compensatorio) de un movimiento de bóveda — nace PENDIENTE. @param {{opId, reversaA, motivo}} input */
export async function reversoTraslado(input) {
    const fn = await _callable('reversoTraslado');
    return (await fn(input)).data;
}
/** Ajuste de bóveda por conteo físico (faltante/sobrante) — nace PENDIENTE. @param {{opId, tipo, monto, motivo}} input */
export async function ajusteBoveda(input) {
    const fn = await _callable('ajusteBoveda');
    return (await fn(input)).data;
}
/** Aprueba un evento destructivo pendiente (reverso/ajuste) → entra al recompute. SOLO owner. @param {{opId}} input */
export async function aprobarEventoCaja(input) {
    const fn = await _callable('aprobarEventoCaja');
    return (await fn(input)).data;
}

/**
 * F1-CORE: historial append-only del pedido (traza de transiciones que escribe `avanzarPedido`).
 * One-shot al abrir el detalle (no listener: es una traza, no un tablero). La regla de `pedidos`
 * ya cubre subcolecciones para staff (`match /{sub=**}`).
 * @param {string} pedidoId @param {number} [max=100]
 * @returns {Promise<Array>} eventos {de, a, autor, at, nota, dayKey} — más reciente primero
 */
export async function historialPedido(pedidoId, max = 100) {
    const q = query(collection(firestoreDb, 'pedidos', pedidoId, 'historial'), orderBy('at', 'desc'), limit(max));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Últimas ventas registradas (lectura permitida a staff de ventas: owner/admin/catálogo).
 * @param {number} [max=15]
 * @returns {Promise<Array>} pedidos (más reciente primero)
 */
export async function ultimasVentas(max = 15) {
    const q = query(collection(firestoreDb, 'pedidos'), orderBy('createdAt', 'desc'), limit(max));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Pedidos EN VIVO (F1-PUENTE · TODO-68): lista reactiva para el módulo admin Pedidos.
 * Re-suscribe sola ante errores transitorios (subscribeWithRetry, ADR §93) — un pedido web
 * nuevo aparece sin recargar. Lectura = staff de ventas (owner/admin/catalogo, reglas).
 * @param {Function} cb (pedidos[]) => void — más reciente primero
 * @param {number}   [max=200] tope del listener (paginación real = F1-CORE/F6)
 * @param {Function} [onUiError] opcional: la UI pinta un aviso mientras el helper reintenta
 * @returns {Function} cleanup
 */
export function onPedidosChange(cb, max = 200, onUiError) {
    return subscribeWithRetry(
        () => query(collection(firestoreDb, 'pedidos'), orderBy('createdAt', 'desc'), limit(max)),
        snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        'pedidos',
        onUiError
    );
}

export default {
    crearPedido, iniciarPagoWeb, confirmarPago, anularPedido, cierreCaja, avanzarPedido,
    historialPedido, ultimasVentas, onPedidosChange,
    // F2.0 caja/bóveda
    abrirTurno, cerrarTurno, movimientoCaja, registrarTraslado, reversoTraslado, ajusteBoveda, aprobarEventoCaja,
};
