/**
 * Bersaglio Jewelry — Hero GSAP Animation
 * Cinematic entrance sequence using GSAP timeline + SplitText.
 *
 * Connected to preloader: if the preloader is active, the hero
 * entrance waits for 'bj:preloader-done' before playing.
 * If no preloader (returning visitor), plays immediately.
 *
 * Also animates the header/nav entrance for a cohesive reveal.
 *
 * Sequence:
 *   0.0s  header nav fades in + slides down
 *   0.1s  overline slides in
 *   0.3s  title characters fall (SplitText stagger)
 *   0.9s  underline draws
 *   1.1s  description fades up
 *   1.3s  CTAs appear
 *   1.5s  meta badges fade in
 *   ∞     parallax on scroll (ScrollTrigger scrub)
 */

import { gsap, ScrollTrigger } from './gsap-core.js';
import { SplitText }           from 'gsap/SplitText';
import { initParticles }       from './canvas/particles.js';
import { initSmoothScroll }    from './gsap-core.js';

gsap.registerPlugin(SplitText);

export function initHero() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    // ── Particles ───────────────────────────────────────────────
    initParticles(hero);

    // ── Smooth Scroll (Lenis) ────────────────────────────────────
    initSmoothScroll();

    // ── SplitText — replaces manual regex character splitting ────
    const titleEl = hero.querySelector('.hero-title');
    let split = null;

    if (titleEl) {
        split = SplitText.create(titleEl, {
            type: 'words, chars',
            wordsClass: 'hero-word-wrap',
            charsClass: 'hero-char',
        });
    }

    // ── Build the entrance timeline (paused — we play after preloader) ──
    const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power3.out' },
    });

    // Header / Nav entrance — elegant slide-down from top
    const header = document.querySelector('.header, .site-header, header');
    if (header) {
        tl.fromTo(header,
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.6 },
            0.0
        );
    }

    // Overline
    tl.fromTo('.hero-eyebrow',
        { opacity: 0, x: -24 },
        { opacity: 1, x: 0, duration: 0.7 },
        0.1
    );

    // Title chars fall from above (using SplitText chars array)
    if (split) {
        tl.fromTo(split.chars,
            { opacity: 0, y: -40, rotateX: 60 },
            {
                opacity: 1, y: 0, rotateX: 0,
                duration: 0.7, ease: 'back.out(1.2)',
                stagger: { amount: 0.55, from: 'start' },
            },
            0.3
        );
    }

    // Title underline draws
    tl.fromTo('.hero-title-line',
        { scaleX: 0, transformOrigin: 'left' },
        { scaleX: 1, duration: 0.6, ease: 'power2.inOut' },
        0.9
    );

    // Description
    tl.fromTo('.hero-desc',
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.7 },
        1.1
    );

    // CTAs
    tl.fromTo('.hero-actions .btn',
        { opacity: 0, y: 18, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power2.out', stagger: 0.12 },
        1.3
    );

    // Meta badges
    tl.fromTo('.hero-meta',
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        1.5
    );

    // Scroll indicator
    tl.fromTo('.hero-scroll-indicator',
        { opacity: 0, y: -8 },
        { opacity: 0.7, y: 0, duration: 0.6 },
        1.7
    );

    // ── Play after preloader or immediately ───────────────────────
    if (document.body.classList.contains('is-preloading')) {
        // Preloader is active — wait for it to finish
        window.addEventListener('bj:preloader-done', () => tl.play(), { once: true });
    } else {
        // No preloader (returning visitor) — play with small delay
        tl.delay(0.15).play();
    }

    // ── Parallax (scroll scrub) — smooth fade instead of pocket clip ───
    gsap.to('.hero-content', {
        yPercent: 15,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: '80% top',
            scrub: true,
        },
    });

    // Subtle overlay darkens as you scroll into hero
    gsap.to('.hero-overlay', {
        opacity: 0.85,
        ease: 'none',
        scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: '60% top',
            scrub: true,
        },
    });
}
