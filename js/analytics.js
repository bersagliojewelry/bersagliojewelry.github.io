/**
 * Bersaglio Jewelry — Analytics
 * Phase 6: Google Analytics 4 + Facebook Meta Pixel + Hotjar + e-commerce event tracking.
 *
 * ──────────────────────────────────────────────────
 *  CONFIGURACIÓN:
 *  1. Reemplaza GA4_ID con tu Measurement ID real (G-XXXXXXXXXX)
 *  2. Reemplaza FB_PIXEL_ID con tu Pixel ID real (número o string)
 *  3. Reemplaza HOTJAR_ID con tu Site ID real (número entero)
 *     → Deja HOTJAR_ID = 0 para deshabilitar Hotjar
 * ──────────────────────────────────────────────────
 */

// Flujo "Bersaglio Jewelry Web" (URL bersagliojewelry.co) — verificado en GA 2026-06-25.
// Override por env (VITE_GA_MEASUREMENT_ID) si algún día cambia; el fallback es el real.
const GA4_ID      = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GA_MEASUREMENT_ID) || 'G-HS26X60DK3';
const FB_PIXEL_ID = 'PIXEL_ID_PLACEHOLDER'; // ← Reemplazar con ID real del Pixel de Facebook
const HOTJAR_ID   = 0;                     // ← Reemplazar con Site ID real (0 = deshabilitado)

let gaReady = false;
let fbReady = false;

/* ─── Google Analytics 4 ─────────────────────────────────────── */
function loadGA4() {
    if (!GA4_ID || GA4_ID === 'G-XXXXXXXXXX') return; // skip placeholder

    const script   = document.createElement('script');
    script.async   = true;
    script.src     = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { window.dataLayer.push(arguments); };

    // Consent Mode v2 (Ley 1581 / cookies): TODO denegado por defecto ANTES del config.
    // GA corre en modo cookieless (pings anonimizados, sin cookies/PII) hasta que el
    // visitante ACEPTA en el banner (cookie-banner.js → grantConsent). Cumplimiento +
    // medición modelada desde el inicio.
    window.gtag('consent', 'default', {
        ad_storage:         'denied',
        ad_user_data:       'denied',
        ad_personalization: 'denied',
        analytics_storage:  'denied',
        wait_for_update:    500,
    });

    window.gtag('js', new Date());
    window.gtag('config', GA4_ID, {
        page_path:       window.location.pathname + window.location.search,
        send_page_view:  true,
        cookie_flags:    'SameSite=None;Secure',
    });

    gaReady = true;

    // Revisita que ya aceptó antes → conceder de inmediato.
    try {
        if (localStorage.getItem('bj-cookie-consent') === 'accepted') grantConsent();
    } catch { /* sin localStorage → permanece en modo denegado */ }
}

// Consent Mode v2: el banner dispara 'bj:cookie-consent' con detail 'accept'/'decline'.
// 'accept' → concede analytics + ads; 'decline' → permanece denegado (cookieless, cumple).
function grantConsent() {
    if (typeof window.gtag !== 'function') return;
    window.gtag('consent', 'update', {
        ad_storage:         'granted',
        ad_user_data:       'granted',
        ad_personalization: 'granted',
        analytics_storage:  'granted',
    });
}

/* ─── Facebook Meta Pixel ────────────────────────────────────── */
function loadFBPixel() {
    if (!FB_PIXEL_ID || FB_PIXEL_ID === 'PIXEL_ID_PLACEHOLDER') return;

    /* eslint-disable */
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */

    window.fbq('init', FB_PIXEL_ID);
    window.fbq('track', 'PageView');

    fbReady = true;
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

/* ─── Event Mapping Helper ──────────────────────────────────── */
/**
 * Maps GA4 standard e-commerce events to Facebook Pixel standard events.
 * @param {string} eventName - GA4 event name
 * @param {Object} params - Event parameters
 * @returns {{ name: string, params: Object }|null} Meta Pixel event or null
 */
function mapEventToFB(eventName, params) {
    const items = params.items || [];
    const firstItem = items[0] || {};

    switch (eventName) {
        case 'view_item':
            return {
                name: 'ViewContent',
                params: {
                    content_type: 'product',
                    content_ids: [firstItem.item_id || ''],
                    content_name: firstItem.item_name || '',
                    content_category: firstItem.item_category || '',
                    value: Number(params.value || firstItem.price || 0),
                    currency: params.currency || 'COP'
                }
            };
        case 'add_to_cart':
            return {
                name: 'AddToCart',
                params: {
                    content_type: 'product',
                    content_ids: items.map(i => i.item_id),
                    value: Number(params.value || firstItem.price || 0),
                    currency: params.currency || 'COP'
                }
            };
        case 'begin_checkout':
            return {
                name: 'InitiateCheckout',
                params: {
                    content_type: 'product',
                    content_ids: items.map(i => i.item_id),
                    value: Number(params.value || 0),
                    currency: params.currency || 'COP',
                    num_items: items.length
                }
            };
        case 'purchase':
            return {
                name: 'Purchase',
                params: {
                    content_type: 'product',
                    content_ids: items.map(i => i.item_id),
                    value: Number(params.value || 0),
                    currency: params.currency || 'COP',
                    num_items: items.length
                }
            };
        case 'generate_lead':
            return {
                name: 'Lead',
                params: {
                    content_name: params.lead_type || 'contact',
                    value: 0,
                    currency: 'COP'
                }
            };
        default:
            return null;
    }
}

/* ─── Event tracking API ─────────────────────────────────────── */
/**
 * Track a GA4 and Meta Pixel event.
 * @param {string} eventName - Standard event name
 * @param {Object} [params]  - Event parameters
 */
export function track(eventName, params = {}) {
    // 1. Google Analytics 4
    if (gaReady && typeof window.gtag === 'function') {
        window.gtag('event', eventName, params);
    }

    // 2. Facebook Pixel
    if (fbReady && typeof window.fbq === 'function') {
        const fbEvent = mapEventToFB(eventName, params);
        if (fbEvent) {
            window.fbq('track', fbEvent.name, fbEvent.params);
        }
    }
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

    // Listen to custom newsletter subscription event
    document.addEventListener('bj:email-subscribed', e => {
        track('generate_lead', {
            lead_type: 'newsletter',
            email: e.detail
        });
    });

    // Consent Mode v2: conceder cuando el visitante ACEPTA en el banner de cookies.
    document.addEventListener('bj:cookie-consent', e => {
        if (e.detail === 'accept') grantConsent();
    });
}

/* ─── Main init ─────────────────────────────────────────────── */
export function initAnalytics() {
    loadGA4();
    loadFBPixel();
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
        value: piece.price || 0,
        items: [{
            item_id:       piece.slug,
            item_name:     piece.name,
            item_category: piece.collection,
            price:         piece.price || 0,
        }],
    });
}

/**
 * Track an InitiateCheckout event.
 * @param {Array} rows - Cart items with pieces joined
 * @param {number} value - Subtotal value
 */
export function trackBeginCheckout(rows, value) {
    track('begin_checkout', {
        currency: 'COP',
        value: value,
        items: rows.map(r => ({
            item_id:       r.slug,
            item_name:     r.piece?.name || r.slug,
            item_category: r.piece?.collection || '',
            price:         r.piece?.price || 0,
            quantity:      r.qty || 1
        }))
    });
}

/**
 * Track a Purchase event.
 * @param {Array} rows - Cart items with pieces joined
 * @param {number} value - Subtotal value
 * @param {string} paymentMethod
 */
export function trackPurchase(rows, value, paymentMethod) {
    track('purchase', {
        currency: 'COP',
        value: value,
        transaction_id: `T-${Date.now()}`,
        payment_type: paymentMethod,
        items: rows.map(r => ({
            item_id:       r.slug,
            item_name:     r.piece?.name || r.slug,
            item_category: r.piece?.collection || '',
            price:         r.piece?.price || 0,
            quantity:      r.qty || 1
        }))
    });
}
