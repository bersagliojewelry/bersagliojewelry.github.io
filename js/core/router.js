/**
 * Bersaglio Jewelry — Router híbrido SEO-shells + SPA dinámico.
 *
 * Routes:
 *   /                  → home (index.html SPA shell)
 *   /colecciones       → catalogo (colecciones.html shell + JS)
 *   /nosotros          → nosotros.html shell + JS
 *   /contacto          → contacto.html shell + JS
 *   /journal           → journal.html shell + JS
 *
 *   /pieza?p=<slug>    → SPA dynamic detail (within index.html OR pieza.html)
 *   /entrada?e=<slug>  → SPA dynamic blog post
 *   /carrito           → SPA dynamic cart + checkout
 *
 *   #/<route>          → hash routing for SPA navigation within a shell
 *
 * Transition strategy:
 * - Same-shell internal nav → use View Transitions API (Chrome 111+).
 *   Fallback: simple opacity fade on <main>.
 * - Cross-shell nav (e.g. home → colecciones) → real page navigation
 *   for SEO + best LCP per page.
 *
 * The router is intentionally LIGHT — it only intercepts <a> clicks,
 * detects whether to do hash routing or full nav, and handles
 * popstate. Page logic lives in js/pages/<page>.js.
 */

const SEO_SHELLS = new Set([
    '',                     // home (index.html)
    'index',
    'colecciones',
    'nosotros',
    'contacto',
    'journal',
    'gracias',
    'privacidad',
    'terminos',
]);

let _currentRoute = parseRoute(location.pathname + location.search + location.hash);
const _routeListeners = new Set();
const _supportsViewTransition = typeof document.startViewTransition === 'function';

/** Returns { page, params, hash } from a URL. */
function parseRoute(urlPath) {
    const u = new URL(urlPath, location.origin);
    let page = u.pathname.replace(/^\//, '').replace(/\.html$/, '');
    if (!page) page = 'index';

    const params = Object.fromEntries(u.searchParams);
    const hash = u.hash.replace(/^#\/?/, '');

    return { page, params, hash, raw: urlPath };
}

/** Public: get current parsed route. */
export function getRoute() {
    return { ..._currentRoute };
}

/** Public: subscribe to route changes (only fires on hash/popstate, not on real page nav). */
export function onRouteChange(cb) {
    _routeListeners.add(cb);
    return () => _routeListeners.delete(cb);
}

/** Public: programmatic navigation. */
export function navigate(href, opts = {}) {
    const target = parseRoute(href);
    const sameShell = (target.page === _currentRoute.page);

    if (sameShell && opts.spa !== false) {
        // SPA-style: update URL + dispatch route change, no full reload.
        history.pushState({}, '', href);
        _currentRoute = target;
        _notifyRouteChange();
        return;
    }
    // Cross-shell: do real navigation (with view transition if supported).
    transitionTo(href);
}

/** Real page nav with optional view-transition. */
function transitionTo(href) {
    if (_supportsViewTransition) {
        document.startViewTransition(() => {
            location.href = href;
        });
    } else {
        location.href = href;
    }
}

/** Returns true if href points to a SEO shell page (different .html file). */
function isCrossShell(href) {
    try {
        const u = new URL(href, location.origin);
        if (u.origin !== location.origin) return false; // external — never cross-shell
        const target = u.pathname.replace(/^\//, '').replace(/\.html$/, '') || 'index';
        const current = _currentRoute.page;
        return target !== current;
    } catch {
        return false;
    }
}

/** Listener: clicks on <a> get intercepted to apply view-transition. */
function onLinkClick(e) {
    const a = e.target.closest('a[href]');
    if (!a) return;
    if (a.target && a.target !== '_self') return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.hasAttribute('download')) return;

    const href = a.getAttribute('href');
    if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;

    let url;
    try { url = new URL(href, location.origin); }
    catch { return; }

    if (url.origin !== location.origin) return;
    // Don't intercept downloads or PDFs
    if (/\.(pdf|zip|doc|docx)$/i.test(url.pathname)) return;

    // For both SEO-shell links AND query-param-only links on same shell:
    // prefer view-transition if available
    e.preventDefault();
    navigate(url.pathname + url.search + url.hash);
}

function onPopState() {
    const prev = _currentRoute;
    _currentRoute = parseRoute(location.pathname + location.search + location.hash);
    if (prev.page !== _currentRoute.page) {
        // Cross-shell via back/forward — let browser do its native nav (already done).
        return;
    }
    _notifyRouteChange();
}

function _notifyRouteChange() {
    for (const cb of _routeListeners) {
        try { cb(_currentRoute); } catch (e) { console.error('[router] listener error:', e); }
    }
}

/** Initialize router — call once from boot.js. */
export function initRouter() {
    document.addEventListener('click', onLinkClick);
    window.addEventListener('popstate', onPopState);
}

export default { initRouter, navigate, getRoute, onRouteChange };
