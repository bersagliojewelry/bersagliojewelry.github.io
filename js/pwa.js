/**
 * Bersaglio Jewelry — PWA
 * Phase 6: Service Worker registration + "Install App" banner.
 */

/* ─── Service Worker registration ───────────────────────────── */
export async function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker?.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    showUpdateBanner();
                }
            });
        });
    } catch (err) {
        // SW registration failed (e.g. localhost without HTTPS) — silently skip
    }
}

/* ─── "Update available" toast ───────────────────────────────── */
function showUpdateBanner() {
    const banner = document.createElement('div');
    banner.className = 'pwa-update-banner';
    banner.innerHTML = `
        <span>Nueva versión disponible</span>
        <button class="pwa-update-btn" id="pwa-update-btn">Actualizar</button>
        <button class="pwa-update-close" aria-label="Cerrar">✕</button>
    `;
    document.body.appendChild(banner);

    setTimeout(() => banner.classList.add('pwa-banner--visible'), 100);

    document.getElementById('pwa-update-btn')?.addEventListener('click', () => {
        window.location.reload();
    });
    banner.querySelector('.pwa-update-close')?.addEventListener('click', () => {
        banner.classList.remove('pwa-banner--visible');
        setTimeout(() => banner.remove(), 400);
    });
}

/* ─── "Add to home screen" install banner ───────────────────── */
let deferredPrompt = null;
let installBanner  = null;

window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;

    // Show banner only if user has not dismissed it
    const dismissed = sessionStorage.getItem('bj_pwa_dismissed');
    if (!dismissed) {
        showInstallBanner();
    }
});

window.addEventListener('appinstalled', () => {
    hideInstallBanner();
    deferredPrompt = null;
});

function showInstallBanner() {
    // Don't show if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (installBanner) return;

    installBanner = document.createElement('div');
    installBanner.className = 'pwa-install-banner';
    installBanner.setAttribute('role', 'complementary');
    installBanner.setAttribute('aria-label', 'Instalar aplicación');
    installBanner.innerHTML = `
        <div class="pwa-install-icon" aria-hidden="true">
            <img src="img/logo-bj2.png" alt="" width="32" height="32" loading="lazy">
        </div>
        <div class="pwa-install-body">
            <strong>Bersaglio Jewelry</strong>
            <span>Instala la app para acceso rápido</span>
        </div>
        <button class="pwa-install-btn" id="pwa-install-btn">Instalar</button>
        <button class="pwa-install-close" id="pwa-install-close" aria-label="No instalar">✕</button>
    `;
    document.body.appendChild(installBanner);

    requestAnimationFrame(() => installBanner.classList.add('pwa-banner--visible'));

    document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
        hideInstallBanner();
        if (outcome === 'accepted') sessionStorage.setItem('bj_pwa_dismissed', '1');
    });

    document.getElementById('pwa-install-close')?.addEventListener('click', () => {
        sessionStorage.setItem('bj_pwa_dismissed', '1');
        hideInstallBanner();
    });
}

function hideInstallBanner() {
    if (!installBanner) return;
    installBanner.classList.remove('pwa-banner--visible');
    setTimeout(() => { installBanner?.remove(); installBanner = null; }, 400);
}

/* ─── Push Notification Subscription (FCM) ─────────────────── */

/**
 * Request push notification permission and register with FCM.
 * Call after user interaction (e.g., a button click or after opt-in).
 * Requires Firebase Blaze plan to function.
 */
export async function subscribeToPush() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    try {
        const { getMessagingInstance } = await import('./firebase-config.js');
        const messaging = await getMessagingInstance();
        if (!messaging) return null;

        const { getToken } = await import('firebase/messaging');
        const registration = await navigator.serviceWorker.ready;
        const token = await getToken(messaging, {
            serviceWorkerRegistration: registration,
            // Replace with actual VAPID key from Firebase Console
            vapidKey: 'REPLACE_WITH_VAPID_KEY'
        });

        if (token) {
            console.info('[PWA] FCM token obtained');
            // Persist token to Firestore for server-side targeting
            try {
                const { firestoreDb } = await import('./firebase-config.js');
                const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
                await setDoc(doc(firestoreDb, 'push_tokens', token), {
                    token,
                    userAgent: navigator.userAgent,
                    createdAt: serverTimestamp()
                });
            } catch {
                // Firestore unavailable — token stored only client-side
            }
        }
        return token;
    } catch (err) {
        console.warn('[PWA] Push subscription failed:', err.message);
        return null;
    }
}

/* ─── Main init ─────────────────────────────────────────────── */
export function initPWA() {
    registerSW();
}
