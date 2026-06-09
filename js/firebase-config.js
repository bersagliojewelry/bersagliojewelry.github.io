/**
 * Bersaglio Jewelry — Firebase Configuration
 * Central module for Firebase initialization.
 *
 * Services initialized:
 *   - Firestore (real-time database)
 *   - Auth (authentication + roles)
 *   - Cloud Storage (images)
 *   - Cloud Messaging (push notifications)
 *   - Analytics (event tracking)
 *
 * All keys come from Vite env variables (see .env.example).
 */

import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Las API keys WEB de Firebase son PÚBLICAS por diseño (viajan en el bundle cliente
// igual). El fallback hardcodeado es una RED DE SEGURIDAD: si el build no recibe los
// VITE_* (p.ej. secrets de CI sin configurar), el sitio NO se cae. La seguridad real
// son las reglas (firestore/storage) + App Check, NO esconder la key. (Revertido S1:
// quitar el fallback tumbó producción — ver docs/30 L-14.)
const firebaseConfig = {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'AIzaSyDcAvuRKN8_h_uSXzXkCzC0foLxTOkd5WM',
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'bersaglio-jewelry.firebaseapp.com',
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'bersaglio-jewelry',
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'bersaglio-jewelry.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '111509809378',
    appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '1:111509809378:web:8df8ee7df50afe6f1896bb',
    measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID     || 'G-F0CEWY7SP1'
};

// ─── Initialize Firebase ─────────────────────────────────────────────────────

// Dev = emuladores locales. NO se activa App Check en dev (rompería las llamadas al
// emulador) ni se conecta a prod.
const isDev = typeof location !== 'undefined' &&
              (location.hostname === 'localhost' || location.hostname === '127.0.0.1');

const app = initializeApp(firebaseConfig);

// ─── App Check (anti-abuso, F6 §A) ───────────────────────────────────────────
// "Sello de navegador real" (reCAPTCHA v3) que el SDK adjunta a CADA petición a
// Firestore/Storage/Functions → cierra el hueco "denial-of-wallet" (un bot ya no
// puede spamear las colecciones públicas y agotar la cuota/factura). NO rompe nada
// por sí solo: solo ADJUNTA el token; el rechazo se activa en la consola (Enforcement)
// cuando Daniel ya vio tráfico legítimo tokenizado en el monitor (rollout seguro).
// Gateado por la key: sin `VITE_RECAPTCHA_SITE_KEY` (o en dev) → no-op, el sitio sigue
// vivo (red de seguridad, igual que el fallback de llaves — L-14). Detalle: spec
// docs/superpowers/specs/2026-06-08-f6-hardening-plan.md + docs/41-SEGURIDAD.
// Site key reCAPTCHA v3 (PÚBLICA — viaja en el bundle igual). Fallback hardcodeado
// como las llaves Firebase (L-14): registrada para bersagliojewelry.co + .github.io
// (proyecto bersaglio-jewelry, 2026-06-08). La clave SECRETA vive SOLO en Firebase
// App Check (servidor), nunca en el cliente.
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LdSoxQtAAAAAAAiQ_dZz8-Cy5mARqjhCMtcZa3K';
if (!isDev && recaptchaSiteKey) {
    try {
        initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(recaptchaSiteKey),
            isTokenAutoRefreshEnabled: true,
        });
    } catch (err) {
        console.warn('[Firebase] App Check no se pudo inicializar:', err);
    }
}

const firestoreDb = getFirestore(app);
const auth        = getAuth(app);
const storage     = getStorage(app);

if (isDev) {
    try {
        connectFirestoreEmulator(firestoreDb, 'localhost', 8080);
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        connectStorageEmulator(storage, 'localhost', 9199);
        console.info('[Firebase] Connected to emulators (Firestore, Auth, Storage)');
    } catch {
        // Already connected or emulators not running
    }
}

// ─── Lazy-loaded services ────────────────────────────────────────────────────

let _messaging = null;
let _analytics = null;

/**
 * Get Cloud Messaging instance (lazy-loaded to avoid bundle bloat)
 */
export async function getMessagingInstance() {
    if (_messaging) return _messaging;
    const { getMessaging, isSupported } = await import('firebase/messaging');
    const supported = await isSupported();
    if (!supported) {
        console.warn('[Firebase] Cloud Messaging not supported in this browser');
        return null;
    }
    _messaging = getMessaging(app);
    return _messaging;
}

/**
 * Get Analytics instance (lazy-loaded, respects cookie consent)
 */
export async function getAnalyticsInstance() {
    if (_analytics) return _analytics;
    const { getAnalytics, isSupported } = await import('firebase/analytics');
    const supported = await isSupported();
    if (!supported) return null;
    _analytics = getAnalytics(app);
    return _analytics;
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export { app, firestoreDb, auth, storage };
export default app;
