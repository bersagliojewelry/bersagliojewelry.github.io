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
 * Últimas ventas registradas (lectura permitida a staff de ventas: owner/admin/catálogo).
 * @param {number} [max=15]
 * @returns {Promise<Array>} pedidos (más reciente primero)
 */
export async function ultimasVentas(max = 15) {
    const q = query(collection(firestoreDb, 'pedidos'), orderBy('createdAt', 'desc'), limit(max));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export default { crearPedido, confirmarPago, ultimasVentas };
