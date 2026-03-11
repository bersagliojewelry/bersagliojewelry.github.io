/**
 * Bersaglio Jewelry — Micro-animations
 * Phase 5: Flying icon arcs from action buttons to header targets.
 *   • flyToCart()     — cart icon arcs to cart button in header
 *   • flyToWishlist() — heart arcs to wishlist button in header
 */

const CART_SVG_PATH   = 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0';
const HEART_SVG_PATH  = 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z';

function getTarget(selector) {
    const el = document.querySelector(selector);
    return el?.closest('a') || el;
}

/* ─── Core fly animation ─────────────────────────────────────── */
function flyIcon({ fromEl, toEl, path, color, filled = false }) {
    if (!fromEl || !toEl) return;

    const fromRect = fromEl.getBoundingClientRect();
    const toRect   = toEl.getBoundingClientRect();

    // Create flying SVG element
    const ns  = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '18');
    svg.setAttribute('height', '18');
    svg.setAttribute('aria-hidden', 'true');

    const pathEl = document.createElementNS(ns, 'path');
    pathEl.setAttribute('d', path);
    pathEl.setAttribute('fill', filled ? color : 'none');
    pathEl.setAttribute('stroke', color);
    pathEl.setAttribute('stroke-width', '1.5');
    svg.appendChild(pathEl);

    const startX = fromRect.left + fromRect.width  / 2 - 9;
    const startY = fromRect.top  + fromRect.height / 2 - 9;
    const endX   = toRect.left   + toRect.width    / 2 - 9;
    const endY   = toRect.top    + toRect.height   / 2 - 9;

    // Parabolic arc — control point arcs above both
    const ctrlX  = (startX + endX) / 2;
    const ctrlY  = Math.min(startY, endY) - 70;

    Object.assign(svg.style, {
        position:  'fixed',
        top:       `${startY}px`,
        left:      `${startX}px`,
        zIndex:    '99990',
        pointerEvents: 'none',
        filter:    `drop-shadow(0 0 4px ${color})`,
    });

    document.body.appendChild(svg);

    const duration = 580;
    const startTs  = performance.now();

    function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

    function tick(now) {
        const t  = Math.min((now - startTs) / duration, 1);
        const et = easeInOut(t);

        // Quadratic bezier
        const x  = (1-t)*(1-t)*startX + 2*(1-t)*t*ctrlX + t*t*endX;
        const y  = (1-t)*(1-t)*startY + 2*(1-t)*t*ctrlY + t*t*endY;
        const sc = 1 - et * 0.55;
        const op = t > 0.75 ? 1 - (t - 0.75) / 0.25 : 0.9;

        svg.style.transform = `translate(${x - startX}px, ${y - startY}px) scale(${sc})`;
        svg.style.opacity   = op;

        if (t < 1) requestAnimationFrame(tick);
        else svg.remove();
    }

    requestAnimationFrame(tick);

    // Bounce the target icon
    requestAnimationFrame(() => {
        toEl.style.transition = 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1)';
        toEl.style.transform  = 'scale(1.4)';
        setTimeout(() => {
            toEl.style.transform = '';
            setTimeout(() => { toEl.style.transition = ''; }, 200);
        }, duration - 80);
    });
}

/* ─── Public helpers ─────────────────────────────────────────── */
export function flyToCart(triggerEl) {
    flyIcon({
        fromEl: triggerEl,
        toEl:   getTarget('.cart-btn'),
        path:   CART_SVG_PATH,
        color:  'var(--gold)',
    });
}

export function flyToWishlist(triggerEl) {
    flyIcon({
        fromEl:  triggerEl,
        toEl:    getTarget('.wishlist-btn'),
        path:    HEART_SVG_PATH,
        color:   '#e87c7c',
        filled:  true,
    });
}

/* ─── Global delegation ──────────────────────────────────────── */
export function initMicroAnimations() {
    document.addEventListener('click', e => {
        const cartBtn     = e.target.closest('[data-cart-slug]');
        const wishlistBtn = e.target.closest('[data-wishlist-slug]');

        if (cartBtn)     flyToCart(cartBtn);
        if (wishlistBtn) flyToWishlist(wishlistBtn);
    });
}
