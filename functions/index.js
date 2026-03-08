const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

// ========== SEO PAGE GENERATION TRIGGER ==========
// GitHub Personal Access Token stored in Firebase Secret Manager
// Set it with: firebase functions:secrets:set GITHUB_PAT
const githubPat = defineSecret('GITHUB_PAT');

// Debounce: only trigger once per 5 minutes max
let _lastDispatchTime = 0;
const DEBOUNCE_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Firestore trigger: when any vehicle document is created, updated, or deleted,
 * dispatch a GitHub Actions workflow to regenerate SEO pages.
 */
exports.onVehicleChange = onDocumentWritten({
    document: 'vehiculos/{vehicleId}',
    region: 'us-central1',
    secrets: [githubPat]
}, async (event) => {
    const now = Date.now();
    if (now - _lastDispatchTime < DEBOUNCE_MS) {
        console.log('[SEO] Skipped — debounce active (last dispatch ' + Math.round((now - _lastDispatchTime) / 1000) + 's ago)');
        return;
    }

    // Check if this is a meaningful change (not just a read)
    const before = event.data.before ? event.data.before.data() : null;
    const after = event.data.after ? event.data.after.data() : null;

    // ALL fields used by generate-vehicles.mjs to build OG tags, JSON-LD, and noscript content.
    // If ANY of these change, the static page must be regenerated.
    // Source: scripts/generate-vehicles.mjs — full audit of og:title, og:description, og:image,
    //         twitter:*, JSON-LD schema, noscript block, sitemap image tags, and slug generation.
    var SEO_FIELDS = [
        'marca',         // og:title, og:description, slug, JSON-LD name/brand, sitemap
        'modelo',        // og:title, og:description, slug, JSON-LD model, sitemap
        'year',          // og:title, og:description, slug, JSON-LD vehicleModelDate, sitemap
        'imagen',        // og:image, twitter:image, JSON-LD image, sitemap image, noscript
        'precio',        // og:description, JSON-LD offer price
        'precioOferta',  // og:description, JSON-LD offer price (takes precedence over precio)
        'estado',        // determines if page exists (only "disponible" gets a page)
        'descripcion',   // noscript SEO content
        'tipo',          // og:description, noscript
        'transmision',   // og:description, JSON-LD vehicleTransmission, noscript
        'kilometraje',   // og:description, JSON-LD mileageFromOdometer, noscript
        'combustible',   // JSON-LD fuelType, noscript
        'color',         // JSON-LD color, noscript
        'puertas',       // JSON-LD numberOfDoors
        'pasajeros',     // JSON-LD seatingCapacity
        'categoria'      // noscript content
    ];

    // For updates: skip if no SEO-relevant field changed
    if (before && after) {
        var changed = SEO_FIELDS.some(function(field) {
            return before[field] !== after[field];
        });
        if (!changed) {
            console.log('[SEO] Skipped — no SEO-relevant fields changed');
            return;
        }
        // Log which fields changed for debugging
        var changedFields = SEO_FIELDS.filter(function(field) {
            return before[field] !== after[field];
        });
        console.log('[SEO] Changed fields: ' + changedFields.join(', '));
    }

    const token = githubPat.value();
    if (!token) {
        console.error('[SEO] GITHUB_PAT secret not configured. Run: firebase functions:secrets:set GITHUB_PAT');
        return;
    }

    try {
        const response = await fetch('https://api.github.com/repos/altorracars/altorracars.github.io/dispatches', {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event_type: 'vehicle-changed',
                client_payload: {
                    vehicleId: event.params.vehicleId,
                    action: !before ? 'created' : !after ? 'deleted' : 'updated',
                    timestamp: new Date().toISOString()
                }
            })
        });

        if (response.ok || response.status === 204) {
            _lastDispatchTime = now;
            console.log('[SEO] GitHub Actions dispatched for vehicle ' + event.params.vehicleId);
        } else {
            const body = await response.text();
            console.error('[SEO] GitHub API error ' + response.status + ': ' + body);
        }
    } catch (err) {
        console.error('[SEO] Failed to dispatch GitHub Actions:', err.message);
    }
});

/**
 * Callable function: manually trigger SEO page regeneration from admin panel.
 * Only super_admin can call this.
 */
exports.triggerSeoRegeneration = onCall({
    region: 'us-central1',
    invoker: 'public',
    cors: true,
    secrets: [githubPat]
}, async (request) => {
    // Verify super_admin
    if (!request.auth || !request.auth.uid) {
        throw new HttpsError('unauthenticated', 'Debes iniciar sesion.');
    }
    const callerDoc = await db.collection('usuarios').doc(request.auth.uid).get();
    if (!callerDoc.exists || callerDoc.data().rol !== 'super_admin') {
        throw new HttpsError('permission-denied', 'Solo Super Admin puede regenerar paginas SEO.');
    }

    const token = githubPat.value();
    if (!token) {
        throw new HttpsError('failed-precondition', 'GITHUB_PAT no configurado en Firebase Secrets.');
    }

    try {
        const response = await fetch('https://api.github.com/repos/altorracars/altorracars.github.io/dispatches', {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event_type: 'vehicle-changed',
                client_payload: {
                    action: 'manual-trigger',
                    triggeredBy: request.auth.token.email || request.auth.uid,
                    timestamp: new Date().toISOString()
                }
            })
        });

        if (response.ok || response.status === 204) {
            return { success: true, message: 'Regeneracion de paginas SEO iniciada. Las paginas se actualizaran en ~2 minutos.' };
        } else {
            const body = await response.text();
            throw new HttpsError('internal', 'GitHub API error: ' + response.status);
        }
    } catch (err) {
        if (err instanceof HttpsError) throw err;
        throw new HttpsError('internal', 'Error al disparar regeneracion: ' + err.message);
    }
});
const callableOptionsV2 = {
    region: 'us-central1',
    invoker: 'public',
    cors: true
};

function mapAuthError(error, fallbackAction) {
    const code = error && error.code ? String(error.code) : '';
    const message = error && error.message ? String(error.message) : 'Sin detalles';

    if (code === 'auth/email-already-exists') {
        return new HttpsError('already-exists',
            'Este email ya tiene una cuenta en Firebase Auth. Eliminala primero desde Firebase Console si deseas re-crearla.');
    }

    if (code === 'auth/invalid-email') {
        return new HttpsError('invalid-argument', 'El formato del email no es valido.');
    }

    if (code === 'auth/weak-password' || code === 'auth/invalid-password') {
        return new HttpsError('invalid-argument', 'La contrasena no cumple los requisitos minimos.');
    }

    if (code === 'auth/operation-not-allowed') {
        return new HttpsError('failed-precondition',
            'El proveedor Email/Password no esta habilitado en Firebase Authentication.');
    }

    if (code === 'auth/insufficient-permission') {
        return new HttpsError('permission-denied',
            'La cuenta de servicio de Cloud Functions no tiene permisos de Firebase Auth Admin.');
    }

    return new HttpsError('internal',
        fallbackAction + ' (codigo: ' + (code || 'desconocido') + ').',
        { code: code || 'unknown', originalMessage: message });
}

async function verifySuperAdmin(auth) {
    if (!auth || !auth.uid) {
        throw new HttpsError('unauthenticated', 'Debes iniciar sesion.');
    }

    const callerDoc = await db.collection('usuarios').doc(auth.uid).get();

    if (!callerDoc.exists) {
        throw new HttpsError('permission-denied', 'No tienes un perfil de administrador.');
    }

    const callerData = callerDoc.data();
    if (callerData.rol !== 'super_admin') {
        throw new HttpsError('permission-denied', 'Solo un Super Admin puede realizar esta accion.');
    }

    return callerData;
}

function throwInputError(code) {
    if (code === '__INVALID_NAME__') {
        throw new HttpsError('invalid-argument', 'El nombre es obligatorio (minimo 2 caracteres).');
    }
    if (code === '__INVALID_EMAIL__') {
        throw new HttpsError('invalid-argument', 'El email no es valido.');
    }
    if (code === '__INVALID_PASSWORD__') {
        throw new HttpsError('invalid-argument', 'La contrasena debe tener al menos 6 caracteres.');
    }
    if (code === '__INVALID_ROLE__') {
        throw new HttpsError('invalid-argument', 'Rol invalido. Debe ser: super_admin, editor o viewer.');
    }
    if (code === '__ALREADY_EXISTS_FIRESTORE__') {
        throw new HttpsError('already-exists', 'Ya existe un usuario con ese email en el sistema.');
    }
}

async function createManagedUserCore(data, auth) {
    const { nombre, email, password, rol } = data;

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
        throw new Error('__INVALID_NAME__');
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
        throw new Error('__INVALID_EMAIL__');
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
        throw new Error('__INVALID_PASSWORD__');
    }

    const validRoles = ['super_admin', 'editor', 'viewer'];
    if (!rol || !validRoles.includes(rol)) {
        throw new Error('__INVALID_ROLE__');
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingSnap = await db.collection('usuarios')
        .where('email', '==', normalizedEmail)
        .limit(1)
        .get();

    if (!existingSnap.empty) {
        throw new Error('__ALREADY_EXISTS_FIRESTORE__');
    }

    try {
        const userRecord = await admin.auth().createUser({
            email: normalizedEmail,
            password: password,
            displayName: nombre.trim()
        });

        await db.collection('usuarios').doc(userRecord.uid).set({
            nombre: nombre.trim(),
            email: normalizedEmail,
            rol: rol,
            estado: 'activo',
            uid: userRecord.uid,
            creadoEn: new Date().toISOString(),
            creadoPor: (auth && auth.token && auth.token.email) || auth.uid
        });

        return {
            success: true,
            uid: userRecord.uid,
            message: 'Usuario "' + nombre.trim() + '" creado exitosamente.'
        };
    } catch (error) {
        throw mapAuthError(error, 'No se pudo crear el usuario');
    }
}

// ========== CREATE MANAGED USER ==========
exports.createManagedUserV2 = onCall(callableOptionsV2, async (request) => {
    await verifySuperAdmin(request.auth);

    try {
        return await createManagedUserCore(request.data || {}, request.auth);
    } catch (error) {
        if (error && error.message) {
            throwInputError(error.message);
        }
        throw error;
    }
});

// ========== DELETE MANAGED USER ==========
exports.deleteManagedUserV2 = onCall(callableOptionsV2, async (request) => {
    await verifySuperAdmin(request.auth);

    const { uid } = request.data || {};

    if (!uid || typeof uid !== 'string') {
        throw new HttpsError('invalid-argument', 'UID del usuario es obligatorio.');
    }

    if (uid === request.auth.uid) {
        throw new HttpsError('failed-precondition', 'No puedes eliminar tu propia cuenta.');
    }

    const userDoc = await db.collection('usuarios').doc(uid).get();
    if (userDoc.exists) {
        await db.collection('usuarios').doc(uid).delete();
    }

    try {
        await admin.auth().deleteUser(uid);
    } catch (error) {
        if (error.code !== 'auth/user-not-found') {
            throw mapAuthError(error, 'El perfil se elimino, pero no se pudo eliminar la cuenta de Authentication');
        }
    }

    return {
        success: true,
        message: 'Usuario eliminado completamente (Auth + Firestore).'
    };
});

// ========== UPDATE USER ROLE ==========
exports.updateUserRoleV2 = onCall(callableOptionsV2, async (request) => {
    await verifySuperAdmin(request.auth);

    const { uid, nombre, rol } = request.data || {};

    if (!uid || typeof uid !== 'string') {
        throw new HttpsError('invalid-argument', 'UID del usuario es obligatorio.');
    }

    const validRoles = ['super_admin', 'editor', 'viewer'];
    if (!rol || !validRoles.includes(rol)) {
        throw new HttpsError('invalid-argument', 'Rol invalido.');
    }

    const userDoc = await db.collection('usuarios').doc(uid).get();
    if (!userDoc.exists) {
        throw new HttpsError('not-found', 'Usuario no encontrado.');
    }

    const updateData = {
        rol: rol,
        actualizadoEn: new Date().toISOString(),
        actualizadoPor: (request.auth && request.auth.token && request.auth.token.email) || request.auth.uid
    };

    if (nombre && typeof nombre === 'string') {
        updateData.nombre = nombre.trim();
    }

    await db.collection('usuarios').doc(uid).update(updateData);

    return {
        success: true,
        message: 'Usuario actualizado.'
    };
});
