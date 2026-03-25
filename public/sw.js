/**
 * Bersaglio Jewelry — Service Worker
 * Strategy:
 *   • HTML pages:  network-first → cache fallback → /offline.html
 *   • CSS + images: cache-first → network
 *   • JS (hashed): network-only (hashes change each build)
 *   • Cross-origin: pass-through (no caching)
 */

const CACHE_NAME    = 'bersaglio-v2';
const OFFLINE_URL   = '/offline.html';

const SHELL_ASSETS = [
    OFFLINE_URL,
    '/css/style.css',
    '/img/logo-bj2.png',
    '/img/banner-1200.webp',
    '/img/banner-800.webp',
    '/img/collage.webp',
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

    // ── CSS + images: cache-first ─────────────────────────────
    const isCacheable =
        request.destination === 'style' ||
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

    // ── Everything else (JS scripts, etc.): network-only ─────
    // Hashed JS chunks from Vite change per build — don't cache them.
});

/* ─── Push Notifications (FCM) ──────────────────────────────── */
self.addEventListener('push', event => {
    const data = event.data?.json() ?? {};
    const title = data.notification?.title || data.title || 'Bersaglio Jewelry';
    const options = {
        body:  data.notification?.body || data.body || '',
        icon:  '/img/logo-bj2.png',
        badge: '/img/logo-bj2.png',
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
