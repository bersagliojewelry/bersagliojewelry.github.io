/**
 * Wrappers `onCall` de las operaciones manuales de stock (TODO-40 · Fase 1 · Bloque 3b).
 * Auth + rol (gestores de catálogo = isCatalogo) y mapeo PedidoError → HttpsError. La lógica de
 * dinero/stock/concurrencia vive en ./inventario-core.js (testeable contra el emulador).
 *
 * Seguridad: reglas `pieces.cantidad` = CF-only (igualdad en update) → el cliente NUNCA muta cantidad
 * directo; estas CFs (Admin SDK) son el ÚNICO camino, con candado atómico + ledger (auditoría).
 */
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore } = require('firebase-admin/firestore');
const { ajustarStockCore, cambiarTipoPiezaCore } = require('./inventario-core');
const { PedidoError } = require('./pedidos-core');

const CATALOGO = ['owner', 'admin', 'editor', 'catalogo'];   // gestores de catálogo (espeja isCatalogo de las reglas)

async function rolDeCatalogo(db, auth) {
    if (!auth) throw new HttpsError('unauthenticated', 'Debes iniciar sesión.');
    let role = typeof auth.token?.role === 'string' ? auth.token.role : null;
    if (!role) {
        const snap = await db.collection('users').doc(auth.uid).get();
        if (!snap.exists) throw new HttpsError('permission-denied', 'Usuario no registrado.');
        role = snap.data().role;
    }
    if (!CATALOGO.includes(role)) throw new HttpsError('permission-denied', 'No tienes permiso para gestionar inventario.');
    return role;
}

function wrap(coreFn) {
    return onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
        const db = getFirestore();
        await rolDeCatalogo(db, request.auth);
        try {
            return await coreFn(db, { ...(request.data || {}), autor: request.auth.uid });
        } catch (e) {
            if (e instanceof PedidoError) throw new HttpsError(e.code, e.message);
            throw e;   // inesperado → 'internal'
        }
    });
}

const ajustarStock     = wrap(ajustarStockCore);       // merma/reabasto/corrección (delta firmado, auditado)
const cambiarTipoPieza = wrap(cambiarTipoPiezaCore);   // transición de tipo (purga cantidad, D6)

module.exports = { ajustarStock, cambiarTipoPieza };
