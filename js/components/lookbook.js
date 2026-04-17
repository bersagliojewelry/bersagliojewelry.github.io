/**
 * Bersaglio Jewelry — Portfolio V7
 * Premium showcase: Swiper.js + GSAP cinematics.
 * Full-bleed piece presentation, fade + creative transitions,
 * GSAP-powered text reveals on each slide change.
 */

import Swiper from 'swiper';
import { Navigation, Pagination, Keyboard, EffectCreative, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-creative';
import { gsap } from '../gsap-core.js';
import db from '../data/catalog.js';

let _swiper = null;
let _lastSignature = '';

/* ── Build flat list of slides ──────────────────────────────── */

function buildSlides(collections, allPieces) {
    const slides = [];

    slides.push({ type: 'cover' });

    for (const col of collections) {
        const pieces = allPieces.filter(p => p.collection === col.slug);
        if (!pieces.length) continue;

        for (const piece of pieces) {
            slides.push({
                type: 'piece',
                piece,
                collection: col,
            });
        }
    }

    slides.push({ type: 'back' });
    return slides;
}

/* ── Render slide HTML ──────────────────────────────────────── */

function renderSlide(slide) {
    if (slide.type === 'cover') {
        return `<div class="swiper-slide lb-slide lb-slide--cover">
            <div class="lb-cover">
                <div class="lb-cover-gem">
                    <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="0.4">
                        <polygon points="30,4 56,20 30,56 4,20"/>
                        <line x1="4" y1="20" x2="56" y2="20"/>
                        <line x1="30" y1="4" x2="20" y2="20"/>
                        <line x1="30" y1="4" x2="40" y2="20"/>
                        <line x1="20" y1="20" x2="30" y2="56"/>
                        <line x1="40" y1="20" x2="30" y2="56"/>
                        <line x1="30" y1="4" x2="30" y2="56" opacity="0.3"/>
                    </svg>
                </div>
                <span class="lb-anim-el lb-cover-eyebrow">Bersaglio Jewelry</span>
                <h3 class="lb-anim-el lb-cover-title">Portafolio<br>Digital</h3>
                <div class="lb-anim-el lb-cover-line"></div>
                <span class="lb-anim-el lb-cover-sub">Alta Joyería · Esmeraldas Colombianas</span>
                <span class="lb-anim-el lb-cover-year">${new Date().getFullYear()}</span>
            </div>
        </div>`;
    }

    if (slide.type === 'back') {
        return `<div class="swiper-slide lb-slide lb-slide--back">
            <div class="lb-cover">
                <div class="lb-cover-gem lb-cover-gem--sm">
                    <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="0.4">
                        <polygon points="30,8 52,22 30,52 8,22"/>
                    </svg>
                </div>
                <span class="lb-anim-el lb-back-brand">Bersaglio Jewelry</span>
                <div class="lb-anim-el lb-cover-line"></div>
                <p class="lb-anim-el lb-back-tagline">Fabricantes de Alta Joyería en Cartagena, Colombia</p>
                <a href="contacto.html" class="lb-anim-el lb-back-cta">Agendar Asesoría</a>
            </div>
        </div>`;
    }

    const p = slide.piece;
    const c = slide.collection;
    return `<div class="swiper-slide lb-slide lb-slide--piece">
        <div class="lb-piece-layout">
            <div class="lb-piece-visual">
                <div class="lb-piece-frame">
                    ${p.image
                        ? `<img class="lb-piece-img" src="${p.image}" alt="${p.name}" loading="lazy">`
                        : `<div class="lb-piece-placeholder">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.4">
                                <polygon points="12,2 22,8.5 12,22 2,8.5"/>
                            </svg>
                        </div>`}
                </div>
            </div>
            <div class="lb-piece-meta">
                <span class="lb-anim-el lb-piece-collection">${c.name || c.slug}</span>
                <h4 class="lb-anim-el lb-piece-name">${p.name}</h4>
                ${p.priceLabel ? `<span class="lb-anim-el lb-piece-price">${p.priceLabel}</span>` : ''}
                <a href="pieza.html?p=${p.slug}" class="lb-anim-el lb-piece-link">
                    Ver Pieza
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
                </a>
            </div>
        </div>
    </div>`;
}

/* ── GSAP slide animations ──────────────────────────────────── */

function animateSlideIn(slideEl) {
    const els = slideEl.querySelectorAll('.lb-anim-el');
    const img = slideEl.querySelector('.lb-piece-img');
    const frame = slideEl.querySelector('.lb-piece-frame');

    if (els.length) {
        gsap.fromTo(els,
            { opacity: 0, y: 25 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out', delay: 0.15 }
        );
    }

    if (img) {
        gsap.fromTo(img,
            { scale: 1.08, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.9, ease: 'power2.out', delay: 0.1 }
        );
    }

    if (frame) {
        gsap.fromTo(frame,
            { opacity: 0 },
            { opacity: 1, duration: 0.6, ease: 'power2.out' }
        );
    }

    const gem = slideEl.querySelector('.lb-cover-gem');
    if (gem) {
        gsap.fromTo(gem,
            { scale: 0.7, opacity: 0, rotation: -15 },
            { scale: 1, opacity: 1, rotation: 0, duration: 1, ease: 'power3.out', delay: 0.05 }
        );
    }
}

function resetSlide(slideEl) {
    const els = slideEl.querySelectorAll('.lb-anim-el');
    const img = slideEl.querySelector('.lb-piece-img');
    const frame = slideEl.querySelector('.lb-piece-frame');
    const gem = slideEl.querySelector('.lb-cover-gem');

    gsap.set(els, { opacity: 0, y: 25 });
    if (img) gsap.set(img, { scale: 1.08, opacity: 0 });
    if (frame) gsap.set(frame, { opacity: 0 });
    if (gem) gsap.set(gem, { scale: 0.7, opacity: 0, rotation: -15 });
}

/* ── Public render ──────────────────────────────────────────── */

export function renderLookbook() {
    const root = document.querySelector('#lookbook');
    if (!root) return;

    const collections = db.getCollections();
    const allPieces = db.getAll();

    if (!allPieces.length) {
        root.innerHTML = '';
        _lastSignature = '';
        return;
    }

    const slides = buildSlides(collections, allPieces);
    if (slides.length < 2) { root.innerHTML = ''; return; }

    const sig = JSON.stringify(slides.map(s => {
        if (s.type === 'piece') return [s.piece.id, s.piece.image || '', s.piece.name, s.piece.priceLabel || ''];
        return s.type;
    }));
    if (sig === _lastSignature) return;
    _lastSignature = sig;

    if (_swiper) {
        _swiper.destroy(true, true);
        _swiper = null;
    }

    root.innerHTML = `
        <div class="lb-showcase swiper">
            <div class="swiper-wrapper">
                ${slides.map(s => renderSlide(s)).join('')}
            </div>
            <div class="lb-nav">
                <button class="lb-nav-btn lb-nav-prev" aria-label="Anterior">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><polyline points="15,18 9,12 15,6"/></svg>
                </button>
                <div class="lb-pagination"></div>
                <button class="lb-nav-btn lb-nav-next" aria-label="Siguiente">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><polyline points="9,6 15,12 9,18"/></svg>
                </button>
            </div>
            <div class="lb-progress"><div class="lb-progress-bar"></div></div>
        </div>`;

    _swiper = new Swiper(root.querySelector('.lb-showcase'), {
        modules: [Navigation, Pagination, Keyboard, EffectCreative, A11y],
        effect: 'creative',
        creativeEffect: {
            prev: {
                translate: [0, 0, -400],
                opacity: 0,
            },
            next: {
                translate: ['100%', 0, 0],
                opacity: 0,
            },
        },
        speed: 800,
        keyboard: { enabled: true, onlyInViewport: true },
        navigation: {
            nextEl: root.querySelector('.lb-nav-next'),
            prevEl: root.querySelector('.lb-nav-prev'),
        },
        pagination: {
            el: root.querySelector('.lb-pagination'),
            clickable: true,
            bulletClass: 'lb-bullet',
            bulletActiveClass: 'lb-bullet--active',
            renderBullet(index, className) {
                return `<button class="${className}" aria-label="Slide ${index + 1}"></button>`;
            },
        },
        a11y: {
            prevSlideMessage: 'Pieza anterior',
            nextSlideMessage: 'Siguiente pieza',
        },
        grabCursor: true,
        on: {
            init(swiper) {
                const active = swiper.slides[swiper.activeIndex];
                if (active) animateSlideIn(active);
                updateProgress(swiper);
            },
            slideChangeTransitionStart(swiper) {
                swiper.slides.forEach(sl => resetSlide(sl));
                updateProgress(swiper);
            },
            slideChangeTransitionEnd(swiper) {
                const active = swiper.slides[swiper.activeIndex];
                if (active) animateSlideIn(active);
            },
        },
    });
}

function updateProgress(swiper) {
    const bar = swiper.el.querySelector('.lb-progress-bar');
    if (!bar) return;
    const pct = swiper.slides.length > 1
        ? (swiper.activeIndex / (swiper.slides.length - 1)) * 100
        : 100;
    bar.style.width = `${pct}%`;
}
