/**
 * Bersaglio Jewelry — Cloud Functions
 *
 * Firebase Cloud Functions for backend operations:
 * - User creation with role assignment
 * - Inquiry notification emails
 * - Image cleanup on piece deletion
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentDeleted } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

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
    const configRef = db.collection('config').doc('counters');
    await configRef.set(
        { unreadInquiries: FieldValue.increment(1) },
        { merge: true }
    );
});
