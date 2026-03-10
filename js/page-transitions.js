/**
 * Bersaglio Jewelry — Page Transitions
 * GSAP-powered dark overlay that sweeps in before navigation
 * and sweeps out on page enter. Works with the multi-page architecture.
 *
 * Flow:
 *   link click → exit(sweep in) → window.location = href
 *   new page load → enter(sweep out) → content visible
 */

import { gsap } from './gsap-core.js';

const LOGO_MARK = `
<svg class="pt-gem" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
  <polygon points="28,4 52,18 52,38 28,52 4,38 4,18"
           stroke="rgba(201,169,110,0.9)" stroke-width="1" fill="none"/>
  <polygon points="28,14 42,22 42,34 28,42 14,34 14,22"
           stroke="rgba(201,169,110,0.45)" stroke-width="0.7" fill="none"/>
  <line x1="4"  y1="18" x2="28" y2="28" stroke="rgba(201,169,110,0.25)" stroke-width="0.5"/>
  <line x1="52" y1="18" x2="28" y2="28" stroke="rgba(201,169,110,0.25)" stroke-width="0.5"/>
  <line x1="28" y1="4"  x2="28" y2="28" stroke="rgba(201,169,110,0.25)" stroke-width="0.5"/>
</svg>`;

function createOverlay() {
    const existing = document.getElementById('page-transition');
    if (existing) return existing;

    const el = document.createElement('div');
    el.id = 'page-transition';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
        <div class="pt-panel"></div>
        <div class="pt-center">
            ${LOGO_MARK}
            <span class="pt-brand">BERSAGLIO</span>
        </div>
    `;
    document.body.appendChild(el);
    return el;
}

/** Sweeps the overlay out — reveals the incoming page */
function animateEnter(overlay) {
    const panel = overlay.querySelector('.pt-panel');
    const center = overlay.querySelector('.pt-center');

    const tl = gsap.timeline({
        onComplete() {
            gsap.set(overlay, { display: 'none' });
            gsap.set(panel,  { yPercent: 0 });      // reset for next exit
            gsap.set(center, { opacity: 0 });
        },
    });

    tl.to(center, { opacity: 0,    duration: 0.22, ease: 'power2.in' })
      .to(panel,  { yPercent: -100, duration: 0.72, ease: 'power4.inOut' }, '-=0.1');
}

/** Sweeps the overlay in — covers current page before navigation */
function animateExit(overlay, href) {
    const panel  = overlay.querySelector('.pt-panel');
    const center = overlay.querySelector('.pt-center');

    gsap.set(overlay, { display: 'flex' });
    gsap.set(panel,   { yPercent: 100 });
    gsap.set(center,  { opacity: 0 });

    gsap.timeline({
        onComplete() { window.location.href = href; },
    })
    .to(panel,  { yPercent: 0,  duration: 0.55, ease: 'power4.inOut' })
    .to(center, { opacity: 1,   duration: 0.28, ease: 'power2.out' }, '-=0.15');
}

function isInternal(href, target) {
    if (!href) return false;
    if (target === '_blank') return false;
    if (href.startsWith('http') || href.startsWith('//')) return false;
    if (href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) return false;
    if (href.includes('wa.me') || href.includes('whatsapp')) return false;
    if (href.includes('admin')) return false;
    return true;
}

export function initPageTransitions() {
    const overlay = createOverlay();

    // Determine whether we arrived via page-transition (vs direct URL / refresh)
    const fromTransition = sessionStorage.getItem('bj-pt-nav');
    sessionStorage.removeItem('bj-pt-nav');

    if (fromTransition) {
        // Arrived here from a transition exit — play the enter animation
        const panel = overlay.querySelector('.pt-panel');
        gsap.set(overlay, { display: 'flex' });
        gsap.set(panel,   { yPercent: 0 });
        animateEnter(overlay);
    } else {
        // Direct load / refresh — hide immediately (preloader handles first-load reveal)
        gsap.set(overlay, { display: 'none' });
    }

    // Intercept internal link clicks (capture phase to run before other handlers)
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;

        const href   = link.getAttribute('href');
        const target = link.getAttribute('target') || '';

        if (!isInternal(href, target)) return;

        e.preventDefault();
        // Mark that next page should run enter animation
        sessionStorage.setItem('bj-pt-nav', '1');
        animateExit(overlay, href);
    }, true);
}
