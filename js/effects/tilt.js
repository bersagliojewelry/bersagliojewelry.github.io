/**
 * Bersaglio Jewelry — 3D Tilt + Shine Effect (GSAP-powered)
 * Applies to piece cards and collection panels on desktop.
 * Uses gsap.quickTo() for buttery smooth spring interpolation.
 */

import { gsap } from '../gsap-core.js';

function bindTilt(el) {
    if (el.dataset.tiltBound) return;
    el.dataset.tiltBound = '1';

    // Shine overlay
    const shine = document.createElement('div');
    shine.className = 'tilt-shine';
    el.appendChild(shine);

    const MAX_TILT = el.classList.contains('collection-panel') ? 8 : 12;

    // gsap.quickTo — reuses a single tween per property, ideal for mousemove
    const rotateXTo = gsap.quickTo(el, 'rotateX', { duration: 0.5, ease: 'power3.out' });
    const rotateYTo = gsap.quickTo(el, 'rotateY', { duration: 0.5, ease: 'power3.out' });

    // Set perspective once
    gsap.set(el, { transformPerspective: 900 });

    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;

        rotateXTo(y * -MAX_TILT);
        rotateYTo(x *  MAX_TILT);

        // Shine gradient follows cursor
        const px = ((e.clientX - rect.left) / rect.width)  * 100;
        const py = ((e.clientY - rect.top)  / rect.height) * 100;
        shine.style.background =
            `radial-gradient(circle at ${px}% ${py}%, rgba(201,169,110,0.13) 0%, rgba(201,169,110,0.04) 35%, transparent 65%)`;
    }, { passive: true });

    el.addEventListener('mouseleave', () => {
        rotateXTo(0);
        rotateYTo(0);
        shine.style.background = 'none';
    });
}

export function initTilt(selector = '.piece-card, .collection-panel') {
    document.querySelectorAll(selector).forEach(bindTilt);

    // Watch for dynamically added elements (piece cards render after DB load)
    const observer = new MutationObserver(() => {
        document.querySelectorAll(selector).forEach(bindTilt);
    });
    observer.observe(document.body, { childList: true, subtree: true });
}
