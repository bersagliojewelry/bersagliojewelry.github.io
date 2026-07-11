/**
 * Bersaglio Jewelry — Service Worker
 * Strategy:
 *   • HTML pages:  network-first → cache fallback → /offline.html
 *   • CSS + JS + assets: cache-first → network
 *   • Cross-origin: pass-through (no caching)
 */

// Bumped to v52 — §146: modelo de TOQUE del visor de zoom intuitivo — tocar la JOYA ACERCA
// (antes cualquier toque cerraba, y como la imagen es pointer-events:none tocar la joya la
// cerraba); tocar el MARGEN oscuro cierra; arrastrar mueve; pellizca/rueda zoom; X/Esc cierran.
// v53 = UX de pieza VENDIDA/agotada en el cliente vivo (§148, TODO-56): la ficha muestra sello
// "Vendida" + CTA asesor (sin precio/carrito), la grilla oculta las vendidas; "Por encargo" para
// refabricable/encargo. (v52 = modelo de toque del visor §146; v51 = §145; v50 = §144; v49 = §143.)
// v55/v56 = §156 rediseño de la primera cara: foto-héroe (hero-*.avif/webp) + hero limpio (texto a la
// izquierda en oscuro sobre la foto CLARA, 2 CTAs). v56: foto re-optimizada a MAYOR calidad + ancho 2200
// (arregla borroso por upscaling) + object-position arriba (no cortar la cabeza) + locator/firma restaurados.
// v57 = §156.18 (TODO-62): estabilidad de memoria en pinch-zoom iOS — content-visibility en
// secciones estáticas del home + quitar filter:blur() decorativos en móvil (NO promueve capas;
// reemplaza al revertido §156.17). Bump para garantizar CSS fresco en el iPhone de prueba.
// v58 = §156.19: el aviso de cookies (z-90) quedaba DEBAJO del FAB "Asesoría privada" (z-200) y el
// toque de "Aceptar" caía en el FAB (móvil). Fix: banner a z-210 + el FAB se aparta mientras el
// banner está presente (bandera body.bj-cookie-active desde cookie-banner.js). Bump = CSS/JS fresco.
// v64 = fixes: selector país "CO +57" (ISO mayúscula, sin nombre/bandera) · borrado de fotos
// robusto (salta no-Storage, muestra código real; cubre piezas y colecciones) · caché SÍNCRONO
// del CMS en localStorage → sin flash de la imagen vieja del repo (hero y toda sección).
// v66 = plan Fable Bloques A-E: checkout hardening (qty/reintento/expiration — carrito.js/pago-web.js),
// admin robustez (banner diferido, CSV, beforeunload, esc), POS/fiscal (comisión IVA discriminada), caché
// CMS anti-flash.
// v67 = auditoría de cierre Fable: el LCP real es la familia `hero-*.avif` que pinta js/home/hero.js
// (banner-hero-* era un preload huérfano del rediseño §156 — se descargaba con fetchpriority=high y
// nunca se pintaba). Preload de index.html corregido + precache de `/img/hero-1200.avif` + fixes backend
// (A.2b shipping fresco en reintento, C.2 guard ajuste fantasma) + login sin err.message crudo.
// v65 = fix login admin (TODO-64 / A0): sessionReady() determinista + ruteo por rol + limpieza ?error.
// v64 = fixes país/borrado-fotos/caché-CMS. v63 = rediseño checkout. v62 = FAQ financiación. v60 = Wompi ON.
// v68 = POS: price 0/ausente = SIN precio → modo POR PESO (antes quedaba bloqueado en "fijo $0");
// espejo cliente (pos.js) ↔ CF (pedidos-core). Regla del dueño: $0 nunca es un precio.
// v69 = §163 anti-flash CMS: el SSG hornea siteContent/{home,global} en index.html (window.__BJ_SC)
// → la 1ª visita pinta la imagen REAL del hero (cero flash beige→verde) y el preload apunta a ella;
// data.js la usa de semilla (memoria > localStorage > horneado > defaults).
// v70 = encendido A.9: el stepper del checkout ya no permite SALTAR a "03 Pago" sin pasar por la
// validación de Entrega (píldoras futuras deshabilitadas; hallazgo del dueño durante el gate live).
// v71 = §164 blindaje post-gate: gracias.html consulta el estado REAL de la transacción (aprobado /
// rechazado-reintenta / confirmando), muestra el nº de pedido como comprobante del invitado + CTA
// WhatsApp (concierge); pago-web deja el comprobante en sessionStorage.
// v72 = F1-PUENTE (TODO-68): módulo admin Pedidos (admin-pedidos.html, lista+detalle read-only en
// vivo de todos los canales); nav Ventas renombrada (Pedidos real; fuera placeholders Ventas/Facturas/CxC).
// v73 = §166 código público de pedido BJ-XXXX-XXXX (comité ×3): el cliente ya NO ve el correlativo
// (revela volumen); comprobante de gracias/WhatsApp/panel = código; buscador tolerante en Pedidos.
// v74 = F1-CORE UI (spec 2026-07-06 §4): módulo Pedidos operable — filtros/KPI/colas + acciones de
// transición (avanzarPedido) + historial + aviso de despacho; POS con checkbox "requiere envío".
// v75 = [OPUS-4.8] domicilio local cobrado: entrega_local traza flete{valorCOP,cobro,medio,estado}
// igual que el envío nacional (Daniel 2026-07-06); "Flete / domicilio" en el detalle.
// v76 = [OPUS-4.8] F2.0 B5b-1 UI caja/bóveda: POS turno (apertura/movimientos/traslado/cierre) +
// página Bóveda owner (saldo/consignar/reponer/conteo/reverso) + panel de aprobaciones (Dual-Approval).
// v77 = [OPUS-4.8] B5c fixes post-gate: reponer cambio lleva turnoId (cierre correcto) + opId de
// idempotencia perezoso (no duplica un movimiento al reabrir el modal tras un fallo de red).
// v78 = [OPUS-4.8] §170 pulido de la revisión adversarial §169 (4 hallazgos low): handleCierre revalida el turno
// vivo · opId propio+perezoso en bóveda salida/conteo · guard del auto-traslado ignora mov/confirm
// abiertos · listeners de caja con subscribeWithRetry (re-suscripción ante error transitorio).
// v79 = [OPUS-4.8] F2.1 UI: POS adjuntar cliente post-cobro (banner no-modal + cola "sin cliente" +
// modal búsqueda/crear con consentimiento) tras flag config/identidad.activo (fail-closed). Shell admin.
// v80 = [OPUS-4.8] Mostrador reactividad money-safe: "Ventas recientes" EN VIVO (onUltimasVentasChange,
// ya no fetch de una vez → no exige refresco) + render OPTIMISTA del panel al abrir caja (sin parpadeo).
// v81 = [OPUS-4.8] Auditoría de caja (F2 · TODO-69): admin-auditoria.html + auditoria.js — vista OWNER
// solo-lectura, línea de tiempo EN VIVO de cada turno (quién abrió/movió/vendió/cerró + hora), UID→nombre.
// v82 = [OPUS-4.8] Hardening export CSV: csvCell neutraliza inyección de fórmulas (=/+/-/@) en el export
// al contador (pos.js) y al turno (auditoria.js) — hallazgo del comité F2.2, ya explotable hoy.
// v83 = [OPUS-4.8] TODO-70 POS profesional: cierre solo-turno (Z legacy retirado), ventas ocultas con caja
// cerrada, panel de anomalías (ventas fuera de turno) en la Auditoría. Prereq de F2.2.
// v84 = [OPUS-4.8] Index carga fluida (TODO-74): skeleton de cristal (destacadas + colecciones) en el
// estado "cargando" — reemplaza el hueco en blanco del visitante nuevo/incógnito (home.css + featured/categories).
// v85 = [OPUS-4.8] Auditoría Antigravity SEO: hidratación sin skeleton (window.__BJ_CATALOG horneado +
// data.hydrateFromBake) + copy verdad-de-marca (fuera superlativo falso "más grande de la región").
// v86 = [FABLE-5] Fix traslado-duplicado del POS (carrera de listeners → modal fantasma): acumuladores
// de traslado en el doc del turno + reversa consciente del turno + estimado sin clamp + tope $500k Kary.
// v87 = [FABLE-5] Auditoría anti-fugas: anti doble-reintegro de stock, webhook Wompi maneja reversas y
// doble cobro, arqueo split-aware, opIds por turno, vouchers legacy, auditoría honesta del descuadre.
// v88 = [FABLE-5] Reestructuración IA del panel (rail v2 comité ×3): grupos por dominio, cero PRONTO,
// menú==título; KPI cartera sin desborde (abreviado+exacto+mini-barra aging); Anular solo turno abierto;
// modal propio de apertura (fuera window.prompt).
// v93 = [OPUS-4.8] F-IA-2 B5: Salud legible ("Avisos del sistema", semáforos con nombre humano) +
// "Cierre de mes" reescrito IN SITU (D4) + pasada de microcopy GLOBAL (lead→interesado, jerga
// contable→llano, CSV→Excel). SOLO texto: cero cambio de lógica/ids.
const CACHE_NAME    = 'bersaglio-v93';
const OFFLINE_URL   = '/offline.html';

// Vite hashes CSS/JS so we can't precache them by path. Static assets only.
const SHELL_ASSETS = [
    OFFLINE_URL,
    '/img/hero-1200.avif',   // E.3 (corregido v67): el hero LCP real que pinta js/home/hero.js (banner-hero-* era un preload huérfano)
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
