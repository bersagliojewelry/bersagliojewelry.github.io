/**
 * Bersaglio Jewelry — Multi-layer Parallax
 * Phase 4: depth layers for hero, page heroes, and key sections.
 * Uses GSAP ScrollTrigger (scrub) for buttery smooth scroll-linked motion.
 *
 * Layers:
 *   Hero        → canvas (slowest), overlay (medium) — content handled in hero-animation.js
 *   Page heroes → inner content drift
 *   Sections    → brand-statement, about-teaser, cta-banner subtle Y drift
 */

import { gsap, ScrollTrigger } from './gsap-core.js';

/* ─── Hero canvas + overlay depth layers ───────────────────── */
function initHeroLayers() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const canvas  = hero.querySelector('.hero-canvas');
    const overlay = hero.querySelector('.hero-overlay');

    // Particles drift up very slowly — creates separation from content
    if (canvas) {
        gsap.to(canvas, {
            yPercent: 10,
            ease: 'none',
            scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            },
        });
    }

    // Overlay moves at a different rate than content — depth illusion
    if (overlay) {
        gsap.to(overlay, {
            yPercent: 18,
            ease: 'none',
            scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            },
        });
    }
}

/* ─── Page hero parallax (inner pages) ─────────────────────── */
function initPageHeroLayer() {
    const pageHero = document.querySelector('.page-hero');
    if (!pageHero) return;

    const content = pageHero.querySelector('.page-hero-inner, .container');
    if (!content) return;

    gsap.to(content, {
        yPercent: 22,
        ease: 'none',
        scrollTrigger: {
            trigger: pageHero,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
        },
    });

    // Subtle overlay darkening during scroll
    const overlay = pageHero.querySelector('.page-hero-overlay');
    if (overlay) {
        gsap.to(overlay, {
            opacity: 0.6,
            ease: 'none',
            scrollTrigger: {
                trigger: pageHero,
                start: 'top top',
                end: '60% top',
                scrub: true,
            },
        });
    }
}

/* ─── Brand statement section ───────────────────────────────── */
function initBrandParallax() {
    const el = document.querySelector('.brand-statement-inner');
    if (!el) return;

    gsap.to(el, {
        y: -16,
        ease: 'none',
        scrollTrigger: {
            trigger: '.brand-statement',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
        },
    });
}

/* ─── About teaser split layers ─────────────────────────────── */
function initAboutParallax() {
    const content = document.querySelector('.about-teaser-content');
    const stats   = document.querySelector('.about-teaser-stats');
    if (!content || !stats) return;

    gsap.to(content, {
        y: -20,
        ease: 'none',
        scrollTrigger: {
            trigger: '.about-teaser',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
        },
    });

    // Stats drift slightly faster for a separation effect
    gsap.to(stats, {
        y: -10,
        ease: 'none',
        scrollTrigger: {
            trigger: '.about-teaser',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
        },
    });
}

/* ─── CTA banner depth ───────────────────────────────────────── */
function initCtaParallax() {
    const inner = document.querySelector('.cta-inner');
    if (!inner) return;

    gsap.to(inner, {
        y: -14,
        ease: 'none',
        scrollTrigger: {
            trigger: '.cta-banner',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
        },
    });
}

/* ─── Section headers subtle depth ──────────────────────────── */
function initHeadersDepth() {
    document.querySelectorAll('.section-header').forEach(header => {
        gsap.to(header, {
            y: -10,
            ease: 'none',
            scrollTrigger: {
                trigger: header,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
            },
        });
    });
}

/* ─── Main export ────────────────────────────────────────────── */
export function initParallax() {
    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    initHeroLayers();
    initPageHeroLayer();
    initBrandParallax();
    initAboutParallax();
    initCtaParallax();
    initHeadersDepth();

    ScrollTrigger.refresh();
}
