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
 * Cierre de caja (arqueo): declara el efectivo contado → devuelve esperado y descuadre. Idempotente por arqueoId.
 * @param {{ arqueoId:string, declaradoEfectivo:number|string }} input
 * @returns {Promise<{ esperadoEfectivo:number, esperadoPorMedio:object, declaradoEfectivo:number, descuadre:number, yaExistia:boolean }>}
 */
export async function cierreCaja(input) {
    const fn = await _callable('cierreCaja');
    return (await fn(input)).data;
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

export default { crearPedido, iniciarPagoWeb, confirmarPago, anularPedido, cierreCaja, ultimasVentas, onPedidosChange };
