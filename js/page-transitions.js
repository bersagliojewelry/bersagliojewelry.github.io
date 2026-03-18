/**
 * Bersaglio Jewelry — Page Transitions
 * CARGANDO.png embebido como base64.
 */

import { gsap } from './gsap-core.js';

const SPINNER_SRC = 'data:image/png;base64,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';

function createOverlay() {
    const existing = document.getElementById('page-transition');
    if (existing) return existing;

    const el = document.createElement('div');
    el.id = 'page-transition';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
        <div class="pt-panel"></div>
        <div class="pt-center">
            <div class="preloader-spinner">
                <img src="${SPINNER_SRC}" class="preloader-img" alt="" draggable="false">
            </div>
        </div>
    `;
    document.body.appendChild(el);
    return el;
}

function animateEnter(overlay) {
    const panel = overlay.querySelector('.pt-panel');
    const center = overlay.querySelector('.pt-center');

    gsap.set(center, { opacity: 1 });

    const tl = gsap.timeline({
        onComplete() {
            gsap.set(overlay, { display: 'none' });
            gsap.set(panel,   { yPercent: 0 });
            gsap.set(center,  { opacity: 0 });
        },
    });

    tl.to(center, { opacity: 0,    duration: 0.22, ease: 'power2.in', delay: 0.3 })
      .to(panel,  { yPercent: -100, duration: 0.72, ease: 'power4.inOut' }, '-=0.1');
}

function animateExit(overlay, href) {
    const panel  = overlay.querySelector('.pt-panel');
    const center = overlay.querySelector('.pt-center');

    gsap.set(overlay, { display: 'flex' });
    gsap.set(panel,   { yPercent: 100 });
    gsap.set(center,  { opacity: 0 });

    gsap.timeline({
        onComplete() { window.location.href = href; },
    })
    .to(panel,  { yPercent: 0, duration: 0.55, ease: 'power4.inOut' })
    .to(center, { opacity: 1, duration: 0.28, ease: 'power2.out' }, '-=0.15');
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

    window.addEventListener('pageshow', (e) => {
        if (e.persisted) {
            gsap.set(overlay, { display: 'none' });
            sessionStorage.removeItem('bj-pt-nav');
            document.body.classList.remove('is-preloading');
        }
    });

    const fromTransition = sessionStorage.getItem('bj-pt-nav');
    sessionStorage.removeItem('bj-pt-nav');

    if (fromTransition) {
        const panel = overlay.querySelector('.pt-panel');
        gsap.set(overlay, { display: 'flex' });
        gsap.set(panel,   { yPercent: 0 });
        animateEnter(overlay);
    } else {
        gsap.set(overlay, { display: 'none' });
    }

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;

        const href   = link.getAttribute('href');
        const target = link.getAttribute('target') || '';

        if (!isInternal(href, target)) return;

        e.preventDefault();
        sessionStorage.setItem('bj-pt-nav', '1');
        animateExit(overlay, href);
    }, true);
}
