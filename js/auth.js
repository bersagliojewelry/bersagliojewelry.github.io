/**
 * Bersaglio Jewelry — Firebase Authentication + Role-Based Access
 *
 * Roles (hierarchical):
 *   owner  → Full access. Can manage users, config, and everything.
 *   admin  → Can manage products, collections, reviews, inquiries. Can't manage users.
 *   editor → Can edit products and collections. Can view inquiries. Can't delete.
 *
 * Usage:
 *   import { requireAuth, currentUser, signOut } from './auth.js';
 *   await requireAuth('editor');  // redirects to login if not authorized
 */

import { app, auth, firestoreDb } from './firebase-config.js';
import {
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// ─── Role hierarchy ─────────────────────────────────────────────────────────

// catalogo:0 = rol "catálogo" (Kary, TODO-19) por DEBAJO de editor → solo accede a
// páginas con requireAuth('catalogo') (Piezas/Colecciones); todo lo demás (editor+) lo bloquea.
const ROLE_LEVELS = { owner: 3, admin: 2, editor: 1, catalogo: 0 };

function hasMinRole(userRole, requiredRole) {
    return (ROLE_LEVELS[userRole] || 0) >= (ROLE_LEVELS[requiredRole] || 0);
}

// ─── State ──────────────────────────────────────────────────────────────────

let _currentUser = null;
let _userProfile = null;
let _authReady   = false;
const _listeners = [];

/**
 * Returns a promise that resolves when auth state is determined.
 */
function waitForAuth() {
    if (_authReady) return Promise.resolve();
    return new Promise(resolve => {
        const unsub = onAuthStateChanged(auth, () => {
            _authReady = true;
            unsub();
            resolve();
        });
    });
}

// Listen for auth state changes and cache profile
onAuthStateChanged(auth, async (user) => {
    _currentUser = user;
    _authReady   = true;

    if (user) {
        try {
            const snap = await getDoc(doc(firestoreDb, 'users', user.uid));
            _userProfile = snap.exists() ? snap.data() : null;
            if (_userProfile) sessionStorage.setItem('bj_auth', '1');
        } catch {
            _userProfile = null;
        }
    } else {
        _userProfile = null;
        sessionStorage.removeItem('bj_auth');
    }

    _listeners.forEach(cb => cb({ user: _currentUser, profile: _userProfile }));
});

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Sign in with email and password.
 * @returns {{ user, profile }} on success
 * @throws {Error} with Spanish message on failure
 */
export async function signIn(email, password) {
    try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const snap = await getDoc(doc(firestoreDb, 'users', cred.user.uid));

        if (!snap.exists()) {
            await firebaseSignOut(auth);
            throw new Error('No tienes permisos para acceder al panel de administración.');
        }

        // Cuenta desactivada (active:false): cerrar sesión y rechazar. El bloqueo
        // DURO es Auth disabled (lo pone la CF deactivateUser); esto es defensa en
        // profundidad para el caso de un doc en active:false sin disabled aún.
        if (snap.data().active === false) {
            await firebaseSignOut(auth);
            throw new Error('Tu cuenta fue desactivada. Contacta al administrador.');
        }

        _userProfile = snap.data();

        // Update last login — best-effort: las reglas de `users` solo dejan que
        // owner/admin actualicen docs de usuario; si el rol no puede, NO debe
        // tumbar el login (es telemetría).
        try {
            await setDoc(doc(firestoreDb, 'users', cred.user.uid), {
                lastLogin: serverTimestamp()
            }, { merge: true });
        } catch (e) {
            console.warn('[auth] lastLogin no actualizado (permiso):', e?.code || e);
        }

        return { user: cred.user, profile: _userProfile };
    } catch (err) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            throw new Error('Email o contraseña incorrectos.');
        }
        if (err.code === 'auth/user-disabled') {
            throw new Error('Tu cuenta fue desactivada. Contacta al administrador.');
        }
        if (err.code === 'auth/too-many-requests') {
            throw new Error('Demasiados intentos. Intenta de nuevo en unos minutos.');
        }
        throw err;
    }
}

/**
 * Sign out the current user.
 */
export async function signOut() {
    sessionStorage.removeItem('bj_auth');
    await firebaseSignOut(auth);
    _currentUser = null;
    _userProfile = null;
    window.location.href = 'admin-login.html';
}

/**
 * Send password reset email.
 */
export async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
}

/**
 * Get the currently signed-in user + profile.
 * @returns {{ user, profile } | null}
 */
export function currentUser() {
    return _currentUser ? { user: _currentUser, profile: _userProfile } : null;
}

/**
 * Get the current user's role.
 * @returns {'owner'|'admin'|'editor'|null}
 */
export function currentRole() {
    return _userProfile?.role || null;
}

/**
 * Check if current user has at least the given role.
 */
export function hasRole(requiredRole) {
    return hasMinRole(_userProfile?.role, requiredRole);
}

/**
 * Subscribe to auth state changes.
 * @param {Function} callback - receives { user, profile }
 * @returns {Function} unsubscribe
 */
export function onAuthChange(callback) {
    _listeners.push(callback);
    // Emit current state immediately if auth is ready
    if (_authReady) callback({ user: _currentUser, profile: _userProfile });
    return () => {
        const idx = _listeners.indexOf(callback);
        if (idx >= 0) _listeners.splice(idx, 1);
    };
}

/**
 * Auth guard for admin pages.
 * Call at the top of every admin page's init().
 * Redirects to login if not authenticated or insufficient role.
 *
 * @param {'owner'|'admin'|'editor'} minRole - minimum required role
 * @returns {Promise<{ user, profile }>} the authenticated user
 */
export async function requireAuth(minRole = 'editor') {
    await waitForAuth();

    if (!_currentUser) {
        sessionStorage.removeItem('bj_auth');
        window.location.replace('admin-login.html');
        throw new Error('Not authenticated');
    }

    // Fetch fresh profile if not cached
    if (!_userProfile) {
        try {
            const snap = await getDoc(doc(firestoreDb, 'users', _currentUser.uid));
            _userProfile = snap.exists() ? snap.data() : null;
        } catch {
            _userProfile = null;
        }
    }

    if (!_userProfile || !hasMinRole(_userProfile.role, minRole)) {
        sessionStorage.removeItem('bj_auth');
        window.location.replace('admin-login.html?error=forbidden');
        throw new Error('Insufficient role');
    }

    // Cuenta desactivada → fuera (cada página admin es una carga fresca → el perfil
    // se re-lee, así que esto cierra la ventana de una sesión abierta tras desactivar).
    if (_userProfile.active === false) {
        sessionStorage.removeItem('bj_auth');
        await firebaseSignOut(auth);
        window.location.replace('admin-login.html?error=disabled');
        throw new Error('Account disabled');
    }

    // Auth passed — show the page
    document.body.style.display = '';

    return { user: _currentUser, profile: _userProfile };
}

// ─── User Management (Owner only) ──────────────────────────────────────────

/**
 * Create a new admin user profile in Firestore.
 * Note: The actual Firebase Auth user must be created via Firebase Console
 * or Cloud Functions (createUser). This only sets the role document.
 */
export async function createUserProfile(uid, { email, displayName, role }) {
    if (!hasRole('owner')) throw new Error('Solo el owner puede crear usuarios.');
    if (!['admin', 'editor', 'catalogo'].includes(role)) throw new Error('Rol inválido.');

    await setDoc(doc(firestoreDb, 'users', uid), {
        email,
        displayName,
        role,
        createdAt: serverTimestamp(),
        createdBy: _currentUser.uid,
        active: true
    });
}

/**
 * Update a user's role.
 */
export async function updateUserRole(uid, newRole) {
    if (!hasRole('owner')) throw new Error('Solo el owner puede cambiar roles.');
    if (uid === _currentUser.uid) throw new Error('No puedes cambiar tu propio rol.');

    await setDoc(doc(firestoreDb, 'users', uid), {
        role: newRole,
        updatedAt: serverTimestamp(),
        updatedBy: _currentUser.uid
    }, { merge: true });
}

/**
 * Desactiva un usuario. Llama la Cloud Function `deactivateUser` (no escribe el
 * doc directo) porque desactivar DEBE deshabilitar la cuenta en Firebase Auth
 * (`disabled:true`) — un write de solo `active:false` NO bloquea el acceso (un
 * doc no es una credencial). La CF: verifica owner server-side, protege al owner,
 * deshabilita Auth y marca `active:false`. firebase/functions se importa LAZY para
 * no inflar el bundle público (auth.js viaja en el sitio).
 */
export async function deactivateUser(uid) {
    if (!hasRole('owner')) throw new Error('Solo el owner puede desactivar usuarios.');
    if (uid === _currentUser.uid) throw new Error('No puedes desactivarte a ti mismo.');

    const { getFunctions, httpsCallable } = await import('firebase/functions');
    const fn = httpsCallable(getFunctions(app, 'us-central1'), 'deactivateUser');
    await fn({ uid });
}
