/**
 * F-TESORERÍA (B1) — wrappers onCall (auth/rol) + trigger de recompute sobre los cores de
 * `tesoreria-core.js`. Patrón pedidos.js: el wrapper resuelve el rol (claim con fallback a
 * users/{uid}) y mapea TesoreriaError → HttpsError; la lógica de dinero vive en el core
 * (testeable contra el emulador sin functions). SSoT: spec 2026-07-18-f-tesoreria-DISENO.md
 * (§2 contratos · D2/D3/D4/D5/D8). Deploy = MANUAL (L-22).
 */
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const core = require('./tesoreria-core.js');
const { TesoreriaError } = core;

const ADMIN = ['owner', 'admin'];   // D8: permisos v1 = roles existentes (Kary registra, owner aprueba)

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
const lanzar = (e) => { if (e instanceof TesoreriaError) throw new HttpsError(e.code, e.message); throw e; };

exports.crearCuentaTesoreria = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    await rolDe(db, request.auth, ADMIN, 'No tienes permiso para gestionar cuentas.');
    try {
        const d = request.data || {};
        return await core.crearCuentaTesoreriaCore(db, {
            opId: d.opId, nombre: d.nombre, banco: d.banco, tipo: d.tipo, titular: d.titular,
            esDeSocia: d.esDeSocia, saldoInicial: d.saldoInicial, fechaCorte: d.fechaCorte,
            soporteCorteURL: d.soporteCorteURL, autor: actorDe(request.auth),
        });
    } catch (e) { lanzar(e); }
});

exports.registrarMovimientoTesoreria = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    await rolDe(db, request.auth, ADMIN, 'No tienes permiso para registrar movimientos.');
    try {
        const d = request.data || {};
        // fuente FORZADA a MANUAL: el camino SISTEMA (abono_cartera D9, patas de bóveda V1/V18)
        // solo existe server-side — otra CF llamando al core directo, jamás por esta puerta.
        return await core.registrarMovimientoTesoreriaCore(db, {
            opId: d.opId, cuentaId: d.cuentaId, tipo: d.tipo, monto: d.monto, fecha: d.fecha,
            descripcion: d.descripcion, soporteURL: d.soporteURL, contraparte: d.contraparte,
            categoria: d.categoria, direccion: d.direccion, refDocumento: d.refDocumento,
            fuente: 'MANUAL', autor: actorDe(request.auth),
        });
    } catch (e) { lanzar(e); }
});

exports.trasladarEntreCuentas = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    await rolDe(db, request.auth, ADMIN, 'No tienes permiso para trasladar entre cuentas.');
    try {
        const d = request.data || {};
        return await core.trasladarEntreCuentasCore(db, {
            opId: d.opId, origenId: d.origenId, destinoId: d.destinoId, monto: d.monto,
            fecha: d.fecha, descripcion: d.descripcion, autor: actorDe(request.auth),
        });
    } catch (e) { lanzar(e); }
});

exports.aprobarMovimientoTesoreria = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    const rol = await rolDe(db, request.auth, ['owner'], 'Solo el dueño (owner) aprueba movimientos de dinero.');
    try {
        const d = request.data || {};
        return await core.aprobarMovimientoTesoreriaCore(db, {
            opId: d.opId, decision: d.decision, motivo: d.motivo, actor: actorDe(request.auth), rol,
        });
    } catch (e) { lanzar(e); }
});

exports.marcarConciliado = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    await rolDe(db, request.auth, ADMIN, 'No tienes permiso para cuadrar cuentas.');
    try {
        const d = request.data || {};
        return await core.marcarConciliadoCore(db, {
            cuentaId: d.cuentaId, periodo: d.periodo, opIds: d.opIds, actor: actorDe(request.auth),
        });
    } catch (e) { lanzar(e); }
});

exports.reabrirCuadre = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    const rol = await rolDe(db, request.auth, ['owner'], 'Solo el dueño (owner) puede reabrir un cuadre.');
    try {
        const d = request.data || {};
        return await core.reabrirCuadreCore(db, { cuentaId: d.cuentaId, periodo: d.periodo, motivo: d.motivo, actor: actorDe(request.auth), rol });
    } catch (e) { lanzar(e); }
});

// CF 7 · D6 (B5): edita UN parámetro de las "Reglas del sistema". OWNER-only (SoD inv.6) —
// la whitelist + los rangos + el audit trail viven en el core.
exports.actualizarConfigSistema = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    const rol = await rolDe(db, request.auth, ['owner'], 'Solo el dueño (owner) puede cambiar las reglas del sistema.');
    try {
        const d = request.data || {};
        return await core.actualizarConfigSistemaCore(db, { campo: d.campo, valor: d.valor, actor: actorDe(request.auth), rol });
    } catch (e) { lanzar(e); }
});

// Callable de REPARACIÓN (patrón repararSaldo §64): fuerza el recompute de una cuenta.
exports.repararSaldoTesoreria = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
    const db = getFirestore();
    await rolDe(db, request.auth, ADMIN, 'No tienes permiso para reparar saldos.');
    try {
        return await core.recalcularSaldoCuentaCore(db, (request.data || {}).cuentaId);
    } catch (e) { lanzar(e); }
});

// Trigger D5: cada escritura al ledger recomputa el saldo de SU cuenta. Un traslado (par) dispara
// dos eventos → cada pata recomputa su cuenta. Fallo → saludEventos (patrón recalcSaldoCliente
// §64: id determinista por event.id, re-lanza para Monitoring).
exports.recalcSaldoTesoreria = onDocumentWritten('movimientosTesoreria/{opId}', async (event) => {
    const db = getFirestore();
    const doc = event.data?.after?.exists ? event.data.after.data()
        : (event.data?.before?.exists ? event.data.before.data() : null);
    const cuentaId = doc?.cuentaId;
    if (!cuentaId) return;                                  // doc sin cuenta (no debería existir) → nada que recomputar
    try {
        await core.recalcularSaldoCuentaCore(db, cuentaId);
    } catch (err) {
        console.error(`[recalcSaldoTesoreria] FALLO cuentaId=${cuentaId} opId=${event.params.opId}:`, err);
        try {
            await db.collection('saludEventos').doc(`teso-recalc-${event.id}`).set({
                tipo: 'teso-recalc-error', cuentaId, opId: event.params.opId,
                error: String(err?.message || err), at: FieldValue.serverTimestamp(), resuelto: false,
            });
        } catch (err2) {
            console.error('[recalcSaldoTesoreria] no se pudo registrar el evento de salud:', err2);
        }
        throw err;
    }
});
