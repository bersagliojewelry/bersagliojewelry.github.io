/**
 * functions/cartera.js — wrappers onCall (auth/rol) de los ABONOS de cartera (F-TESORERÍA B5 · V17).
 * Patrón `tesoreria.js`/`pedidos.js`: el wrapper resuelve el rol (claim con fallback a users/{uid})
 * y mapea PedidoError → HttpsError; la lógica de dinero vive en `cartera-core.js` (testeable contra
 * el emulador sin functions). SSoT: spec 2026-07-18-f-tesoreria-DISENO.md §0.7 V17. Deploy MANUAL (L-22).
 *
 * Por qué el abono pasa a tener puerta de servidor: `movsCaja` es CF-only (`allow write: if false`),
 * así que la pata del efectivo SOLO puede nacer aquí — y debe nacer en la MISMA transacción que el
 * abono (si no, la deuda baja sin que el billete entre a ningún libro: el agujero de V17).
 */
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const core = require('./cartera-core.js');
const { PedidoError } = require('./pedidos-core.js');

const ADMIN = ['owner', 'admin'];   // D8: Kary (admin) registra

async function rolDe(db, auth, permitidos, mensaje) {
    if (!auth) throw new HttpsError('unauthenticated', 'Debes iniciar sesión.');
    let role = typeof auth.token?.role === 'string' ? auth.token.role : null;
    if (!role) {
        const snap = await db.collection('users').doc(auth.uid).get();
        if (!snap.exists) throw new HttpsError('permission-denied', 'Usuario no registrado.');
        role = snap.data().role;
    }
    if (!permitidos.includes(role)) throw new HttpsError('permission-denied', mensaje);
    return role;
}
const actorDe = (auth) => ({ uid: auth.uid, nombre: auth.token?.name || auth.token?.email || null });
const lanzar = (e) => { if (e instanceof PedidoError) throw new HttpsError(e.code, e.message); throw e; };

/**
 * Alerta al owner de una anomalía del par abono↔caja. `resuelto: false` A PROPÓSITO: son FALLAS
 * (la tarjeta "Avisos" del Hoy las cuenta como pendientes de atender). Ojo con la precisión de D6:
 * los eventos de mera AUDITORÍA nacen `resuelto: true`; estos NO son auditoría, es plata descuadrada.
 */
function notificarAbono(db) {
    return async (evt) => {
        const DETALLE = {
            abono_pata_faltante: `⚠️ El abono en efectivo ${evt.opId} (${evt.monto || '?'} COP) no tiene su registro en la caja del turno ${evt.turnoId || '?'}, y ese turno ya cerró. El arqueo de ese turno quedó sellado sin ese billete: revisa a mano.`,
            abono_anulado_sin_pata: `⚠️ Se anuló el abono en efectivo ${evt.opId} pero su registro en la caja no estaba: revisa el arqueo de ese turno.`,
        };
        try {
            await db.collection('saludEventos').doc(`abono-${evt.evento}-${evt.opId}`).set({
                tipo: 'cartera-alerta', evento: evt.evento,
                detalle: DETALLE[evt.evento] || `Anomalía de abono: ${evt.evento}`,
                opId: evt.opId || null, clienteId: evt.clienteId || null,
                monto: evt.monto ?? null, autor: evt.autor ?? null,
                at: FieldValue.serverTimestamp(), resuelto: false,
            });
        } catch (e) { console.error('[notificarAbono] alerta no registrada:', e); }
    };
}

/** V17 · registra el abono y, si es en efectivo, su pata en la caja del turno abierto (misma tx). */
exports.registrarAbonoCartera = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    await rolDe(db, request.auth, ADMIN, 'No tienes permiso para registrar abonos.');
    try {
        const d = request.data || {};
        return await core.registrarAbonoCarteraCore(db, {
            opId: d.opId, clienteId: d.clienteId, monto: d.monto, fecha: d.fecha,
            medioPago: d.medioPago, descripcion: d.descripcion,
            cuentaId: d.cuentaId,   // D9: solo transferencia; ausente = "todavía no sé" (V12)
            autor: actorDe(request.auth),
        }, { notificar: notificarAbono(db) });
    } catch (e) { lanzar(e); }
});

/**
 * V17 · anula un abono y netea su pata de caja en la misma tx. OWNER-only: espeja la regla vigente
 * (firestore.rules `anulacionValida` deja al admin anular SOLO factura/apertura/ajuste bajo tope —
 * los abonos siempre fueron del dueño, directo o vía solicitud de corrección aprobada). Esta puerta
 * NO amplía permisos: solo añade el neteo del libro de caja, que el camino cliente no podía hacer.
 */
exports.anularAbonoCartera = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    await rolDe(db, request.auth, ['owner'], 'Solo el dueño (owner) puede anular un abono.');
    try {
        const d = request.data || {};
        return await core.anularAbonoCarteraCore(db, {
            clienteId: d.clienteId, movId: d.movId, motivo: d.motivo,
            motivoCategoria: d.motivoCategoria, autor: actorDe(request.auth),
        }, { notificar: notificarAbono(db) });
    } catch (e) { lanzar(e); }
});
