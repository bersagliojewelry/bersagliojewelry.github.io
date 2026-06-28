/**
 * Bersaglio Jewelry — Service Worker
 * Strategy:
 *   • HTML pages:  network-first → cache fallback → /offline.html
 *   • CSS + JS + assets: cache-first → network
 *   • Cross-origin: pass-through (no caching)
 */

// Bumped to v51 — §145: arreglo de gestos del visor de zoom (ficha) — el PINCH (2 dedos) y el
// ARRASTRAR-para-mover ahora funcionan. Manejo UNIFICADO con pointer events (antes pointer+touch+
// click se peleaban en táctil: el pinch caía en "cerrar" y el pan no se activaba). (v50 = candado
// §144; v49 = visor §143; v48 = LQIP §142.)
const CACHE_NAME    = 'bersaglio-v51';
const OFFLINE_URL   = '/offline.html';

// Vite hashes CSS/JS so we can't precache them by path. Static assets only.
const SHELL_ASSETS = [
    OFFLINE_URL,
    '/img/banner-hero-1200.webp',
    '/img/logo-bersaglio.png',
    '/manifest.json',
];

/* ─── Install ────────────────────────────────────────────────── */
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache =>
            // Use individual adds so one failure doesn't block the rest
            Promise.allSettled(SHELL_ASSETS.map(url => cache.add(url)))
        )
    );
});

/* ─── Activate ───────────────────────────────────────────────── */
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

/* ─── Fetch ──────────────────────────────────────────────────── */
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests (fonts, GA, etc.)
    if (url.origin !== self.location.origin) return;

    // Skip non-GET
    if (request.method !== 'GET') return;

    // ── HTML: network-first ───────────────────────────────────
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    putInCache(request, response.clone());
                    return response;
                })
                .catch(async () => {
                    const cached = await caches.match(request);
                    return cached || caches.match(OFFLINE_URL);
                })
        );
        return;
    }

    // ── CSS + JS + assets: cache-first ────────────────────────
    const isCacheable =
        request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'image' ||
        request.destination === 'font';

    if (isCacheable) {
        event.respondWith(
            caches.match(request).then(cached => {
                if (cached) return cached;
                return fetch(request).then(response => {
                    putInCache(request, response.clone());
                    return response;
                });
            }).catch(() => new Response('', { status: 503 }))
        );
        return;
    }

    // ── Everything else: network-only ─────────────────────────
});

/* ─── Push Notifications (FCM) ──────────────────────────────── */
self.addEventListener('push', event => {
    const data = event.data?.json() ?? {};
    const title = data.notification?.title || data.title || 'Bersaglio Jewelry';
    const options = {
        body:  data.notification?.body || data.body || '',
        icon:  '/img/logo-bersaglio.png',
        badge: '/img/logo-bersaglio.png',
        data:  { url: data.data?.url || data.url || '/' },
        tag:   data.tag || 'bersaglio-notification',
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const url = event.notification.data?.url || '/';
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clients => {
                const existing = clients.find(c => c.url.includes(url));
                if (existing) return existing.focus();
                return self.clients.openWindow(url);
            })
    );
});

/* ─── Helpers ────────────────────────────────────────────────── */
async function putInCache(request, response) {
    if (!response.ok) return;
    try {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response);
    } catch {
        // Storage quota exceeded or other error — silently ignore
    }
}
