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
import { pmark } from './core/perf-probe.js';   // sonda TODO-33 (gateada; no-op si off)

// ─── Role hierarchy ─────────────────────────────────────────────────────────

// catalogo:0 = rol "catálogo" (Kary, TODO-19) por DEBAJO de editor → solo accede a
// páginas con requireAuth('catalogo') (Piezas/Colecciones); todo lo demás (editor+) lo bloquea.
const ROLE_LEVELS = { owner: 3, admin: 2, editor: 1, catalogo: 0 };

function hasMinRole(userRole, requiredRole) {
    return (ROLE_LEVELS[userRole] || 0) >= (ROLE_LEVELS[requiredRole] || 0);
}

// Página de aterrizaje segura por rol: catálogo (Kary, TODO-19) solo accede a Piezas/Colecciones/POS
// (todas requireAuth('catalogo')); editor+ aterrizan en el dashboard (requireAuth('editor')). Se usa
// para rutar un rol insuficiente a una página que SÍ puede ver, no al login (mata el ping-pong H2).
function roleLanding(role) {
    return role === 'catalogo' ? 'admin-piezas.html' : 'admin.html';
}

// ─── State ──────────────────────────────────────────────────────────────────

let _currentUser = null;
let _userProfile = null;
let _authReady   = false;
const _listeners = [];

// sessionReady() — promesa que resuelve UNA vez, al terminar la PRIMERA resolución del estado de
// auth (incluido el getDoc del perfil). Se resuelve DESPUÉS de escribir `bj_auth` (cacheAuthHints),
// así login.js puede redirigir con el rol REAL sin carrera ni timeout mágico (TODO-64 H1). Reemplaza
// el `setTimeout(500)` de login.js: determinista, no un adivina-cuánto-tarda-el-getDoc.
let _sessionReadySettled = false;
let _resolveSessionReady;
const _sessionReadyPromise = new Promise(resolve => { _resolveSessionReady = resolve; });
function settleSessionReady() {
    if (_sessionReadySettled) return;
    _sessionReadySettled = true;
    _resolveSessionReady({ user: _currentUser, profile: _userProfile });
}

// Pistas de sesión para PINTAR rápido (NO autorizan nada — el candado real es server-side:
// reglas Firestore + claims). `bj_auth` = hay sesión (lo lee el inline anti-flash de cada
// admin*.html, §115/L-57). `bj_role` = rol para pintar el menú AL INSTANTE en cada navegación
// (A3 §TODO-33), sin esperar la cascada de auth (~900ms); shared.js reconcilia tras auth si difiere.
// sessionStorage (no localStorage): solo rol+flags, jamás PII/dinero (invariante del comité).
function cacheAuthHints(role) {
    try {
        sessionStorage.setItem('bj_auth', '1');
        if (role) sessionStorage.setItem('bj_role', role);
    } catch { /* storage bloqueado → degrada a menú tardío */ }
}
function clearAuthHints() {
    try { sessionStorage.removeItem('bj_auth'); sessionStorage.removeItem('bj_role'); } catch { /* noop */ }
}

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
            if (_userProfile) cacheAuthHints(_userProfile.role);
        } catch {
            _userProfile = null;
        }
    } else {
        _userProfile = null;
        clearAuthHints();
    }

    // Resuelve sessionReady() al final de la 1ª pasada (bj_auth ya escrito si había perfil).
    settleSessionReady();
    _listeners.forEach(cb => cb({ user: _currentUser, profile: _userProfile }));
});

/**
 * Promesa que resuelve cuando el estado de auth quedó determinado por primera vez, con `bj_auth`
 * ya persistido si hay perfil. Úsala en la página de login para redirigir con el rol REAL sin
 * carreras (reemplaza timeouts). Resuelve también cuando NO hay sesión (`{ user:null, profile:null }`).
 * @returns {Promise<{ user, profile }>}
 */
export function sessionReady() {
    return _sessionReadyPromise;
}

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
        cacheAuthHints(_userProfile.role);   // pinta el menú al instante en la 1ª página tras login

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
        if (err.code === 'auth/network-request-failed') {
            throw new Error('Sin conexión. Revisa tu internet e intenta de nuevo.');
        }
        // Cualquier otro code de Firebase (inglés técnico) → mensaje genérico en español para Kary.
        if (typeof err?.code === 'string' && err.code.startsWith('auth/')) {
            throw new Error('No se pudo iniciar sesión. Intenta de nuevo.');
        }
        throw err;
    }
}

/**
 * Sign out the current user.
 * @param {{ redirect?: boolean }} [opts] - redirect:false cierra sesión SIN navegar (para el caso
 *   "sesión viva sin perfil válido" en login.js, que ya está en la página de login). Default: redirige.
 */
export async function signOut({ redirect = true } = {}) {
    clearAuthHints();
    await firebaseSignOut(auth);
    _currentUser = null;
    _userProfile = null;
    if (redirect) window.location.href = 'admin-login.html';
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
    pmark('auth:requireAuth-start');
    await waitForAuth();
    pmark('auth:waitForAuth-done');

    if (!_currentUser) {
        clearAuthHints();
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

    // Sin perfil legible (getDoc falló) → al login: sin rol no hay a dónde rutear.
    if (!_userProfile) {
        clearAuthHints();
        window.location.replace('admin-login.html');
        throw new Error('No profile');
    }
    // Autenticado pero rol insuficiente para ESTA página: la sesión EXISTE (no borrar bj_auth) →
    // rutar a la página que el rol SÍ puede ver (catálogo→Piezas), no rebotar al login. Elimina el
    // ping-pong login↔admin que veía Kary (TODO-64 H2). Guard anti-loop: si ya estamos en la landing
    // del rol, no redirigir (defensa; con los minRoles actuales el rol siempre puede ver su landing).
    if (!hasMinRole(_userProfile.role, minRole)) {
        const landing = roleLanding(_userProfile.role);
        if (!location.pathname.endsWith(landing)) window.location.replace(landing);
        throw new Error('Insufficient role');
    }

    // Cuenta desactivada → fuera (cada página admin es una carga fresca → el perfil
    // se re-lee, así que esto cierra la ventana de una sesión abierta tras desactivar).
    if (_userProfile.active === false) {
        clearAuthHints();
        await firebaseSignOut(auth);
        window.location.replace('admin-login.html?error=disabled');
        throw new Error('Account disabled');
    }

    // Auth passed — show the page
    document.body.style.display = '';
    pmark('auth:passed+show');

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

/**
 * Crea un usuario NUEVO (cuenta de Auth + perfil en Firestore) vía la Cloud Function
 * `createUser` (owner-only, server-side). El panel NO puede crear la cuenta de Auth
 * directo (requiere Admin SDK) → la CF la crea y siembra users/{uid}. Patrón espejo de
 * deactivateUser (httpsCallable lazy). Reemplaza el flujo viejo "UID manual de la consola".
 */
export async function createUser({ email, password, displayName, role }) {
    if (!hasRole('owner')) throw new Error('Solo el owner puede crear usuarios.');
    if (!['admin', 'editor', 'catalogo'].includes(role)) throw new Error('Rol inválido.');
    if (!password || password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');

    const { getFunctions, httpsCallable } = await import('firebase/functions');
    const fn = httpsCallable(getFunctions(app, 'us-central1'), 'createUser');
    const res = await fn({ email, password, displayName, role });
    return res.data;
}
