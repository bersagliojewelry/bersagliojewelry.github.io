/**
 * Wrappers `onCall` de las CFs de identidad (F2.1). Responsabilidad: auth + rol, inyectar el
 * `autor` (uid del SERVIDOR — nunca del cliente), el secreto `IDENTIDAD_PEPPER`, y mapear
 * `IdentidadError` → `HttpsError`. Toda la lógica (transacciones, índice, fusión) vive en
 * `identidad-cf.js` (testeable contra el emulador). Patrón espejo de `pedidos.js`.
 *
 * Seguridad: `clientesPorDoc` es CF-only (reglas deny-all) → SOLO estas CFs reservan/leen el índice;
 * `pedido.clienteId`/`clientes.legalIdKey`/`docKeys`/`authUid` los escribe SOLO la CF (reglas).
 */
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { getFirestore } = require('firebase-admin/firestore');
const {
    resolverClienteCore, crearClienteConDocCore, attachDocAClienteCore,
    vincularClientePedidoCore, fusionarClientesCore, IdentidadError,
} = require('./identidad-cf');

// Pepper del índice hasheado (Secret Manager; NUNCA en el repo):
//   firebase functions:secrets:set IDENTIDAD_PEPPER
const IDENTIDAD_PEPPER = defineSecret('IDENTIDAD_PEPPER');

const VENTAS = ['owner', 'admin', 'catalogo'];   // Kary opera identidad desde el POS/pedidos

async function exigirRol(db, auth, permitidos, msg) {
    if (!auth) throw new HttpsError('unauthenticated', 'Debes iniciar sesión.');
    let role = typeof auth.token?.role === 'string' ? auth.token.role : null;
    if (!role) {
        const snap = await db.collection('users').doc(auth.uid).get();
        if (!snap.exists) throw new HttpsError('permission-denied', 'Usuario no registrado.');
        role = snap.data().role;
    }
    if (!permitidos.includes(role)) throw new HttpsError('permission-denied', msg);
    return role;
}

// IdentidadError (códigos ya válidos de functions) → HttpsError; cualquier otro re-lanza.
function alHttps(e) {
    if (e instanceof IdentidadError) throw new HttpsError(e.code, e.message);
    throw e;
}

const OPTS = { region: 'us-central1', secrets: [IDENTIDAD_PEPPER] };

// resolverCliente — match EXACTO por documento (para la sugerencia del pedido web). Read-only.
const resolverCliente = onCall(OPTS, async (request) => {
    const db = getFirestore();
    await exigirRol(db, request.auth, VENTAS, 'No tienes permiso para consultar clientes.');
    try {
        return await resolverClienteCore(db, request.data || {}, IDENTIDAD_PEPPER.value());
    } catch (e) { alHttps(e); }
});

// crearClienteConDoc — documento opcional; con doc reserva el índice (colisión→existente) + consent.
const crearClienteConDoc = onCall(OPTS, async (request) => {
    const db = getFirestore();
    await exigirRol(db, request.auth, VENTAS, 'No tienes permiso para crear clientes.');
    try {
        const data = { ...(request.data || {}), autor: request.auth.uid };   // autor = SERVIDOR
        return await crearClienteConDocCore(db, data, IDENTIDAD_PEPPER.value());
    } catch (e) { alHttps(e); }
});

// attachDocACliente — adjunta un documento a un cliente ya creado (colisión con otro→needsMerge).
const attachDocACliente = onCall(OPTS, async (request) => {
    const db = getFirestore();
    await exigirRol(db, request.auth, VENTAS, 'No tienes permiso para editar clientes.');
    try {
        const data = { ...(request.data || {}), autor: request.auth.uid };
        return await attachDocAClienteCore(db, data, IDENTIDAD_PEPPER.value());
    } catch (e) { alHttps(e); }
});

// vincularClientePedido — escribe pedido.clienteId (CF-only) + traza en historial.
const vincularClientePedido = onCall({ region: 'us-central1' }, async (request) => {
    const db = getFirestore();
    await exigirRol(db, request.auth, VENTAS, 'No tienes permiso para vincular pedidos.');
    try {
        const { pedidoId, clienteId } = request.data || {};
        return await vincularClientePedidoCore(db, { pedidoId, clienteId, autor: request.auth.uid });
    } catch (e) { alHttps(e); }
});

// fusionarClientes — OWNER-only (SoD): operación sensible (re-apunta pedidos + índice + cartera).
const fusionarClientes = onCall({ region: 'us-central1' }, async (request) => {
    const db = getFirestore();
    await exigirRol(db, request.auth, ['owner'], 'Solo el dueño puede fusionar clientes.');
    try {
        const { fromId, intoId } = request.data || {};
        return await fusionarClientesCore(db, { fromId, intoId, autor: request.auth.uid });
    } catch (e) { alHttps(e); }
});

module.exports = { resolverCliente, crearClienteConDoc, attachDocACliente, vincularClientePedido, fusionarClientes };
