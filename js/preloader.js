/**
 * Bersaglio Jewelry — Preloader
 * Muestra una sola vez por sesión. Animado con GSAP (sin conflictos de CSS).
 */

import { gsap } from './gsap-core.js';

export function initPreloader() {
    if (sessionStorage.getItem('bj-loaded')) return;
    sessionStorage.setItem('bj-loaded', '1');

    const el = document.createElement('div');
    el.id = 'preloader';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
        <div class="preloader-inner">
            <div class="preloader-logo-wrap">
                <img src="/img/logo-bj2.png" alt="" class="preloader-logo-img" draggable="false">
            </div>
            <div class="preloader-label">
                <span class="preloader-brand">BERSAGLIO</span>
                <span class="preloader-sep"></span>
                <span class="preloader-sub">JEWELRY</span>
            </div>
        </div>
    `;
    document.body.appendChild(el);
    document.body.classList.add('is-preloading');

    const wrap  = el.querySelector('.preloader-logo-wrap');
    const brand = el.querySelector('.preloader-brand');
    const sep   = el.querySelector('.preloader-sep');
    const sub   = el.querySelector('.preloader-sub');

    // Estados iniciales — GSAP los controla, no CSS
    gsap.set(wrap,  { opacity: 0, scale: 0.85 });
    gsap.set(brand, { opacity: 0, y: 8 });
    gsap.set(sep,   { opacity: 0, scaleX: 0 });
    gsap.set(sub,   { opacity: 0, y: 6 });

    const tl = gsap.timeline({
        delay: 0.1,
        onComplete() {
            gsap.to(el, {
                opacity: 0,
                duration: 0.75,
                ease: 'power2.inOut',
                delay: 0.2,
                onComplete() {
                    el.remove();
                    document.body.classList.remove('is-preloading');
                },
            });
        },
    });

    tl.to(wrap,  { opacity: 1, scale: 1, duration: 0.85, ease: 'expo.out' },       0.05)
      .to(brand, { opacity: 1, y: 0,     duration: 0.65, ease: 'expo.out' },        0.65)
      .to(sep,   { opacity: 1, scaleX: 1, duration: 0.5, ease: 'power2.out',
                   transformOrigin: 'center center' },                               1.1)
      .to(sub,   { opacity: 1, y: 0,     duration: 0.5,  ease: 'expo.out' },        1.35)
      .to({},    {},                                                                  2.4); // hold
}
