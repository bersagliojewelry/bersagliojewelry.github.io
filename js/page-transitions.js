/**
 * Bersaglio Jewelry — Page Transitions
 * CSS-only dark overlay with diamond spinner.
 * No external images — pure CSS animation.
 */

import { gsap } from './gsap-core.js';

function createOverlay() {
    const existing = document.getElementById('page-transition');
    if (existing) return existing;

    const el = document.createElement('div');
    el.id = 'page-transition';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
        <div class="pt-panel"></div>
        <div class="pt-center">
            <div class="preloader-diamond">
                <div class="preloader-diamond-inner"></div>
            </div>
            <div class="preloader-ring">
                <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" />
                </svg>
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
