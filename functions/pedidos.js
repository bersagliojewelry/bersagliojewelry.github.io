/**
 * crearPedido (B1 paso 3 · TODO-37) — wrapper `onCall` del único escritor de `pedidos`.
 *
 * Responsabilidad de ESTE archivo: autenticación + rol (owner/admin/catálogo = Kary) y mapear
 * los errores de negocio (`PedidoError`) a `HttpsError`. TODA la lógica de dinero/concurrencia
 * (transacción atómica, candado de stock, recálculo server-side, snapshot inmutable, idempotencia)
 * vive en `pedidos-core.js` (sin firebase-functions → testeable contra el emulador).
 *
 * Seguridad: reglas `pedidos` create:false + `pieces.estado/reserva*` cliente-DENY → SOLO esta CF
 * escribe el estado de venta (nadie des-vende ni cambia precios por fuera).
 */
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore } = require('firebase-admin/firestore');
const { crearPedidoCore, confirmarPagoCore, anularPedidoCore, cierreCajaCore, PedidoError } = require('./pedidos-core');

const VENTAS = ['owner', 'admin', 'catalogo'];

async function rolDeVentas(db, auth) {
    if (!auth) throw new HttpsError('unauthenticated', 'Debes iniciar sesión.');
    let role = typeof auth.token?.role === 'string' ? auth.token.role : null;
    if (!role) {
        const snap = await db.collection('users').doc(auth.uid).get();
        if (!snap.exists) throw new HttpsError('permission-denied', 'Usuario no registrado.');
        role = snap.data().role;
    }
    if (!VENTAS.includes(role)) throw new HttpsError('permission-denied', 'No tienes permiso para registrar ventas.');
    return role;
}

const crearPedido = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    await rolDeVentas(db, request.auth);
    try {
        return await crearPedidoCore(db, { ...(request.data || {}), autor: request.auth.uid });
    } catch (e) {
        if (e instanceof PedidoError) throw new HttpsError(e.code, e.message);
        throw e;   // error inesperado → 'internal' (firebase-functions lo envuelve)
    }
});

// confirmarPago (paso 4): Kary confirma "ya vi la plata" → por_verificar → pagado.
const confirmarPago = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    await rolDeVentas(db, request.auth);
    try {
        return await confirmarPagoCore(db, { pedidoId: (request.data || {}).pedidoId, autor: request.auth.uid });
    } catch (e) {
        if (e instanceof PedidoError) throw new HttpsError(e.code, e.message);
        throw e;
    }
});

// anularPedido (paso 5 · VOID): marca anulado + reintegra la pieza al catálogo.
const anularPedido = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    await rolDeVentas(db, request.auth);
    try {
        const d = request.data || {};
        return await anularPedidoCore(db, { pedidoId: d.pedidoId, motivo: d.motivo, autor: request.auth.uid });
    } catch (e) {
        if (e instanceof PedidoError) throw new HttpsError(e.code, e.message);
        throw e;
    }
});

// cierreCaja (paso 5 · Cierre Z): arqueo del turno (esperado vs efectivo declarado → descuadre).
const cierreCaja = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    await rolDeVentas(db, request.auth);
    try {
        const d = request.data || {};
        return await cierreCajaCore(db, { arqueoId: d.arqueoId, declaradoEfectivo: d.declaradoEfectivo, autor: request.auth.uid });
    } catch (e) {
        if (e instanceof PedidoError) throw new HttpsError(e.code, e.message);
        throw e;
    }
});

module.exports = { crearPedido, confirmarPago, anularPedido, cierreCaja };
