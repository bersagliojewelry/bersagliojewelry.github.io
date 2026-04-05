/**
 * Bersaglio Jewelry — Just-in-Time Prefetch
 *
 * When the user hovers over a product link or "Ver pieza/Ver detalles" button,
 * silently prefetch the target HTML page so clicking feels instant.
 *
 * Strategy:
 *   - Detect hover on links to pieza.html, coleccion pages, etc.
 *   - Insert a <link rel="prefetch"> for that URL
 *   - Each URL is prefetched at most once per session
 *   - Only prefetch on desktop (pointer: fine) to save mobile data
 *   - Debounce: only prefetch after 150ms hover (avoids drive-by mousemoves)
 */

const prefetched = new Set();
let hoverTimer = null;

function prefetchUrl(url) {
    if (prefetched.has(url)) return;
    prefetched.add(url);

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'document';
    document.head.appendChild(link);
}

function getPageUrl(anchor) {
    // Only prefetch internal page links
    const href = anchor.getAttribute('href');
    if (!href) return null;
    if (href.startsWith('http') && !href.includes(location.host)) return null;
    if (href.startsWith('#') || href.startsWith('javascript')) return null;
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('https://wa.me')) return null;
    return href;
}

function onPointerEnter(e) {
    if (!e.target || typeof e.target.closest !== 'function') return;
    const anchor = e.target.closest('a[href]');
    if (!anchor) return;

    const url = getPageUrl(anchor);
    if (!url || prefetched.has(url)) return;

    // Debounce: only prefetch after 150ms hover
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => prefetchUrl(url), 150);
}

function onPointerLeave() {
    clearTimeout(hoverTimer);
}

export function initPrefetch() {
    // Only on desktop to respect mobile data
    if (!window.matchMedia('(pointer: fine)').matches) return;

    // Use event delegation on the whole document
    document.addEventListener('pointerenter', onPointerEnter, true);
    document.addEventListener('pointerleave', onPointerLeave, true);
}
