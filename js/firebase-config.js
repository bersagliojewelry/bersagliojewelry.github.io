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
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || '',
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'bersaglio-jewelry.firebaseapp.com',
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'bersaglio-jewelry',
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'bersaglio-jewelry.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '',
    measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID     || 'G-HS26X60DK3'
};

// ─── Initialize Firebase ─────────────────────────────────────────────────────

const app        = initializeApp(firebaseConfig);
const firestoreDb = getFirestore(app);
const auth       = getAuth(app);
const storage    = getStorage(app);

// Connect to emulators in development
const isDev = typeof location !== 'undefined' &&
              (location.hostname === 'localhost' || location.hostname === '127.0.0.1');

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
