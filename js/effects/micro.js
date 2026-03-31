/**
 * Bersaglio Jewelry — Micro-animations (GSAP-powered)
 * Flying icon arcs from action buttons to header targets.
 *   • flyToCart()     — cart icon arcs to cart button in header
 *   • flyToWishlist() — heart arcs to wishlist button in header
 *
 * Improved: uses GSAP timelines instead of manual RAF bezier,
 * for smoother animation and easier maintenance.
 */

import { gsap } from '../gsap-core.js';

const CART_SVG_PATH   = 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0';
const HEART_SVG_PATH  = 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z';

function getTarget(selector) {
    const el = document.querySelector(selector);
    return el?.closest('a') || el;
}

/* ─── Core fly animation (GSAP timeline) ─────────────────────── */
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

    // Parabolic arc control point
    const ctrlX  = (startX + endX) / 2;
    const ctrlY  = Math.min(startY, endY) - 70;

    Object.assign(svg.style, {
        position:  'fixed',
        top:       '0',
        left:      '0',
        zIndex:    '99990',
        pointerEvents: 'none',
        filter:    `drop-shadow(0 0 4px ${color})`,
    });

    document.body.appendChild(svg);

    // Proxy for bezier interpolation — GSAP animates t from 0→1,
    // we compute quadratic bezier position each frame
    const proxy = { t: 0 };

    const tl = gsap.timeline({
        onComplete: () => svg.remove(),
        defaults: { ease: 'power2.inOut' },
    });

    tl.set(svg, { x: startX, y: startY, scale: 1, autoAlpha: 0.9 });

    // Main arc movement via proxy
    tl.to(proxy, {
        t: 1,
        duration: 0.58,
        ease: 'power2.inOut',
        onUpdate() {
            const t = proxy.t;
            const x = (1-t)*(1-t)*startX + 2*(1-t)*t*ctrlX + t*t*endX;
            const y = (1-t)*(1-t)*startY + 2*(1-t)*t*ctrlY + t*t*endY;
            gsap.set(svg, { x, y });
        },
    }, 0);

    // Scale down and fade out during flight
    tl.to(svg, { scale: 0.45, duration: 0.58, ease: 'power2.in' }, 0);
    tl.to(svg, { autoAlpha: 0, duration: 0.15 }, 0.43);

    // Bounce the target icon
    gsap.fromTo(toEl,
        { scale: 1 },
        { scale: 1.4, duration: 0.15, ease: 'back.out(3)', yoyo: true, repeat: 1 }
    );
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
