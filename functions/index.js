/**
 * Bersaglio Jewelry — Cloud Functions
 *
 * Firebase Cloud Functions for backend operations:
 * - User creation with role assignment
 * - Inquiry notification emails
 * - Image cleanup on piece deletion
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentDeleted, onDocumentWritten } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { computeSaldo } = require('./saldo');

initializeApp();

const db = getFirestore();
const ROLE_LEVEL = { owner: 3, admin: 2, editor: 1 };

// ─── Helper: verify caller has minimum role ─────────────────────────────────

async function verifyRole(auth, minRole) {
    if (!auth) throw new HttpsError('unauthenticated', 'Debes iniciar sesión.');
    const snap = await db.collection('users').doc(auth.uid).get();
    if (!snap.exists) throw new HttpsError('permission-denied', 'Usuario no registrado.');
    const callerRole = snap.data().role;
    if ((ROLE_LEVEL[callerRole] || 0) < (ROLE_LEVEL[minRole] || 99)) {
        throw new HttpsError('permission-denied', 'No tienes permisos suficientes.');
    }
    return { callerRole, callerData: snap.data() };
}

// ─── createUser ─────────────────────────────────────────────────────────────
// Callable: creates a Firebase Auth user + Firestore profile.
// Only owner can call this.

exports.createUser = onCall({ region: 'us-central1' }, async (request) => {
    await verifyRole(request.auth, 'owner');

    const { email, password, displayName, role } = request.data;

    if (!email || !password || !displayName || !role) {
        throw new HttpsError('invalid-argument', 'Todos los campos son obligatorios.');
    }
    if (!['admin', 'editor'].includes(role)) {
        throw new HttpsError('invalid-argument', 'Rol inválido. Usa "admin" o "editor".');
    }
    if (password.length < 8) {
        throw new HttpsError('invalid-argument', 'La contraseña debe tener al menos 8 caracteres.');
    }

    const userRecord = await getAuth().createUser({
        email,
        password,
        displayName,
    });

    await db.collection('users').doc(userRecord.uid).set({
        email,
        displayName,
        role,
        active: true,
        createdAt: FieldValue.serverTimestamp(),
        createdBy: request.auth.uid,
    });

    return { uid: userRecord.uid, message: `Usuario "${displayName}" creado como ${role}.` };
});

// ─── updateUserRole ─────────────────────────────────────────────────────────
// Callable: updates a user's role. Only owner can call.

exports.updateUserRole = onCall({ region: 'us-central1' }, async (request) => {
    await verifyRole(request.auth, 'owner');

    const { uid, newRole } = request.data;
    if (!uid || !newRole) throw new HttpsError('invalid-argument', 'UID y rol son obligatorios.');
    if (!['admin', 'editor'].includes(newRole)) {
        throw new HttpsError('invalid-argument', 'Rol inválido.');
    }

    const targetSnap = await db.collection('users').doc(uid).get();
    if (!targetSnap.exists) throw new HttpsError('not-found', 'Usuario no encontrado.');
    if (targetSnap.data().role === 'owner') {
        throw new HttpsError('permission-denied', 'No puedes cambiar el rol del owner.');
    }

    await db.collection('users').doc(uid).update({
        role: newRole,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: request.auth.uid,
    });

    return { message: `Rol actualizado a "${newRole}".` };
});

// ─── deactivateUser ─────────────────────────────────────────────────────────
// Callable: disables a user in Auth + sets active=false in Firestore.

exports.deactivateUser = onCall({ region: 'us-central1' }, async (request) => {
    await verifyRole(request.auth, 'owner');

    const { uid } = request.data;
    if (!uid) throw new HttpsError('invalid-argument', 'UID es obligatorio.');

    const targetSnap = await db.collection('users').doc(uid).get();
    if (!targetSnap.exists) throw new HttpsError('not-found', 'Usuario no encontrado.');
    if (targetSnap.data().role === 'owner') {
        throw new HttpsError('permission-denied', 'No puedes desactivar al owner.');
    }

    await getAuth().updateUser(uid, { disabled: true });
    await db.collection('users').doc(uid).update({
        active: false,
        deactivatedAt: FieldValue.serverTimestamp(),
        deactivatedBy: request.auth.uid,
    });

    return { message: 'Usuario desactivado.' };
});

// ─── onPieceDeleted ─────────────────────────────────────────────────────────
// Trigger: cleans up Storage images when a piece document is deleted.

exports.onPieceDeleted = onDocumentDeleted('pieces/{pieceId}', async (event) => {
    const pieceId = event.params.pieceId;
    const bucket = getStorage().bucket();
    const [files] = await bucket.getFiles({ prefix: `pieces/${pieceId}/` });

    if (files.length) {
        await Promise.all(files.map(f => f.delete()));
    }
});

// ─── onInquiryCreated ───────────────────────────────────────────────────────
// Trigger: increments unread counter when a new inquiry arrives.

const { onDocumentCreated } = require('firebase-functions/v2/firestore');

exports.onInquiryCreated = onDocumentCreated('inquiries/{inquiryId}', async (event) => {
    // Idempotente: los triggers son at-least-once. Marcamos la consulta como contada
    // DENTRO de la misma transacción que incrementa → un reintento no duplica el contador.
    const inqRef = event.data?.ref;
    if (!inqRef) return;
    const counterRef = db.collection('config').doc('counters');
    await db.runTransaction(async (tx) => {
        const snap = await tx.get(inqRef);
        if (!snap.exists || snap.get('_counted') === true) return;
        tx.update(inqRef, { _counted: true });
        tx.set(counterRef, { unreadInquiries: FieldValue.increment(1) }, { merge: true });
    });
});

// ─── recalcSaldoCliente (CRM Bloque 2) ───────────────────────────────────────
// Trigger: al crear/editar/borrar un movimiento, recalcula el saldo del cliente
// SERVER-SIDE desde la fuente de verdad (todos sus movimientos no anulados). Es la
// ÚNICA escritura de `saldoActual` (las reglas prohíben que el cliente lo escriba).
// Idempotente (recomputa desde cero) + transacción (evita carreras). No re-dispara:
// escribe en el doc del cliente, no en la subcolección de movimientos.

// ─── backupDiario (F6 / PRE-1) ───────────────────────────────────────────────
// Programada 3:00 AM Bogotá: dump completo de Firestore → Storage (backups/firestore/)
// + retención 30 días. Lógica y diseño en ./backup.js; codec puro en ./backup-codec.js.

exports.backupDiario = require('./backup').backupDiario;

exports.recalcSaldoCliente = onDocumentWritten('clientes/{clienteId}/movimientos/{movId}', async (event) => {
    const { clienteId } = event.params;
    const clienteRef = db.collection('clientes').doc(clienteId);
    const movsRef = clienteRef.collection('movimientos');

    await db.runTransaction(async (tx) => {
        const clienteSnap = await tx.get(clienteRef);
        if (!clienteSnap.exists) return; // cliente borrado → no resucitarlo

        const movsSnap = await tx.get(movsRef);
        const saldo = computeSaldo(movsSnap.docs.map((d) => d.data()));

        tx.set(clienteRef, {
            saldoActual: saldo,
            saldoActualizadoEn: FieldValue.serverTimestamp(),
        }, { merge: true });
    });
});
