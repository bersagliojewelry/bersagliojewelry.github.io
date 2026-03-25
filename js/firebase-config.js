/**
 * Bersaglio Jewelry — Firebase Configuration
 * Central module for Firebase initialization.
 *
 * Services initialized:
 *   - Firestore (real-time database)
 *   - Cloud Messaging (push notifications)
 *   - Analytics (event tracking)
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
    apiKey:            "AIzaSyBersaglioJewelry_REPLACE_ME",
    authDomain:        "bersaglio-jewelry.firebaseapp.com",
    projectId:         "bersaglio-jewelry",
    storageBucket:     "bersaglio-jewelry.firebasestorage.app",
    messagingSenderId: "000000000000",
    appId:             "1:000000000000:web:0000000000000000",
    measurementId:     "G-HS26X60DK3"
};

// ─── Initialize Firebase ─────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);
const firestoreDb = getFirestore(app);

// Connect to emulator in development
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    try {
        connectFirestoreEmulator(firestoreDb, 'localhost', 8080);
        console.info('[Firebase] Connected to Firestore emulator');
    } catch {
        // Already connected or emulator not running
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

export { app, firestoreDb };
export default app;
