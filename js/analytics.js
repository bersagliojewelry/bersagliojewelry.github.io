/**
 * Bersaglio Jewelry — Analytics
 * Phase 6: Google Analytics 4 + Hotjar + micro-conversion event tracking.
 *
 * ──────────────────────────────────────────────────
 *  CONFIGURACIÓN:
 *  1. Reemplaza GA4_ID con tu Measurement ID real (G-XXXXXXXXXX)
 *  2. Reemplaza HOTJAR_ID con tu Site ID real (número entero)
 *     → Deja HOTJAR_ID = 0 para deshabilitar Hotjar
 * ──────────────────────────────────────────────────
 */

const GA4_ID    = 'G-XXXXXXXXXX'; // ← reemplazar con ID real
const HOTJAR_ID = 0;              // ← reemplazar con Site ID real (0 = deshabilitado)

let gaReady = false;

/* ─── Google Analytics 4 ─────────────────────────────────────── */
function loadGA4() {
    if (!GA4_ID || GA4_ID === 'G-XXXXXXXXXX') return; // skip placeholder

    const script   = document.createElement('script');
    script.async   = true;
    script.src     = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID, {
        page_path:       window.location.pathname + window.location.search,
        send_page_view:  true,
        cookie_flags:    'SameSite=None;Secure',
    });

    gaReady = true;
}

/* ─── Hotjar ─────────────────────────────────────────────────── */
function loadHotjar() {
    if (!HOTJAR_ID) return;

    /* eslint-disable */
    (function(h, o, t, j, a, r) {
        h.hj = h.hj || function() { (h.hj.q = h.hj.q || []).push(arguments); };
        h._hjSettings = { hjid: HOTJAR_ID, hjsv: 6 };
        a = o.getElementsByTagName('head')[0];
        r = o.createElement('script');
        r.async = 1;
        r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
        a.appendChild(r);
    })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
    /* eslint-enable */
}

/* ─── Event tracking API ─────────────────────────────────────── */
/**
 * Track a GA4 event.
 * @param {string} eventName - GA4 event name
 * @param {Object} [params]  - Event parameters
 */
export function track(eventName, params = {}) {
    if (!gaReady || typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, params);
}

/* ─── Auto delegation ────────────────────────────────────────── */
function bindDelegatedEvents() {
    document.addEventListener('click', e => {

        // add_to_wishlist
        const wishBtn = e.target.closest('[data-wishlist-slug]');
        if (wishBtn) {
            track('add_to_wishlist', {
                currency: 'COP',
                items: [{ item_id: wishBtn.dataset.wishlistSlug }],
            });
        }

        // add_to_cart
        const cartBtn = e.target.closest('[data-cart-slug]');
        if (cartBtn) {
            track('add_to_cart', {
                currency: 'COP',
                items: [{ item_id: cartBtn.dataset.cartSlug }],
            });
        }

        // contact via WhatsApp
        if (e.target.closest('#wa-nav, .wa-float, #pieza-wa-btn, #wa-contact')) {
            track('contact', { method: 'whatsapp' });
        }

        // search trigger
        if (e.target.closest('#search-trigger, .search-trigger')) {
            track('search', { engagement_type: 'open_search' });
        }

        // view collection (header dropdown or collection panel)
        const collLink = e.target.closest('.collection-panel a, .dropdown-link');
        if (collLink) {
            const name =
                collLink.closest('.collection-panel')
                    ?.querySelector('.collection-name')?.textContent?.trim() ||
                collLink.querySelector('.dropdown-link-name')?.textContent?.trim();
            if (name) track('view_item_list', { item_list_name: name });
        }

        // view piece card
        const pieceCard = e.target.closest('.piece-card');
        if (pieceCard) {
            const slug = pieceCard.querySelector('[data-cart-slug]')?.dataset.cartSlug ||
                         pieceCard.querySelector('[data-wishlist-slug]')?.dataset.wishlistSlug;
            const name = pieceCard.querySelector('.piece-name')?.textContent?.trim();
            if (slug) track('select_item', { items: [{ item_id: slug, item_name: name }] });
        }
    });

    // Track search queries
    document.addEventListener('input', e => {
        if (e.target.id === 'search-input' && e.target.value.length > 2) {
            // Debounce: track after user pauses typing
            clearTimeout(e.target._analyticsTimer);
            e.target._analyticsTimer = setTimeout(() => {
                track('search', { search_term: e.target.value.trim() });
            }, 1000);
        }
    });
}

/* ─── Main init ─────────────────────────────────────────────── */
export function initAnalytics() {
    loadGA4();
    loadHotjar();
    bindDelegatedEvents();
}

/**
 * Track a piece page view (call from pieza.js after rendering).
 * @param {{ slug: string, name: string, collection: string, price: number }} piece
 */
export function trackPieceView(piece) {
    track('view_item', {
        currency: 'COP',
        items: [{
            item_id:       piece.slug,
            item_name:     piece.name,
            item_category: piece.collection,
            price:         piece.price || 0,
        }],
    });
}
