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
const { defineSecret } = require('firebase-functions/params');
const { getFirestore } = require('firebase-admin/firestore');
const { crearPedidoCore, confirmarPagoCore, anularPedidoCore, cierreCajaCore, iniciarPagoWebCore, PedidoError } = require('./pedidos-core');

const VENTAS = ['owner', 'admin', 'catalogo'];

// Secreto de INTEGRIDAD de Wompi (Secret Manager; NUNCA en el repo). Se setea por entorno:
//   firebase functions:secrets:set WOMPI_INTEGRITY_SECRET   (test en sandbox · prod al lanzar)
// La llave PÚBLICA (pub_test_/pub_prod_) va por env normal WOMPI_PUBLIC_KEY (es pública por diseño).
const WOMPI_INTEGRITY_SECRET = defineSecret('WOMPI_INTEGRITY_SECRET');

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

// iniciarPagoWeb (Wompi F2): el cliente PÚBLICO (sin login) inicia el cobro de una pieza.
// NO lleva check de rol (lo llama el comprador, no Kary); la robustez vive en el core (elegibilidad,
// tope $2.5M, total+firma server-side). ⚠️ Anti-abuso (App Check/rate-limit) = hardening 2c (TODO-14).
const iniciarPagoWeb = onCall({ region: 'us-central1', invoker: 'public', secrets: [WOMPI_INTEGRITY_SECRET] }, async (request) => {
    const db = getFirestore();
    try {
        const d = request.data || {};
        const res = await iniciarPagoWebCore(db, { pedidoId: d.pedidoId, pieceId: d.pieceId, shipping: d.shipping }, {
            integritySecret: WOMPI_INTEGRITY_SECRET.value(),
        });
        // La llave pública (pub_test_/pub_prod_) la necesita el Widget; es pública por diseño.
        return { ...res, publicKey: process.env.WOMPI_PUBLIC_KEY || null };
    } catch (e) {
        if (e instanceof PedidoError) throw new HttpsError(e.code, e.message);
        throw e;
    }
});

module.exports = { crearPedido, confirmarPago, anularPedido, cierreCaja, iniciarPagoWeb };
