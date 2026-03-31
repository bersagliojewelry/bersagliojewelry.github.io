/**
 * Bersaglio Jewelry — Collections Horizontal Scroll
 * Desktop: pins the track outer, animates collection panels horizontally.
 * Mobile/tablet: no-op; CSS handles a 2-column grid.
 *
 * Improved with GSAP best practices:
 *   - gsap.matchMedia() for responsive setup + auto cleanup
 *   - ease: "none" on horizontal tween (required for containerAnimation)
 *   - Proper pin + scrub configuration
 */

import { gsap, ScrollTrigger } from '../gsap-core.js';

export function initCollectionsHScroll() {
    const outer = document.getElementById('collections-track-outer');
    const track = document.getElementById('collections-grid');
    if (!outer || !track) return;

    // gsap.matchMedia() — auto-reverts all animations when breakpoint changes
    const mm = gsap.matchMedia();

    mm.add('(min-width: 960px) and (pointer: fine)', () => {
        // Wait for collection panels to be rendered by JS
        function trySetup() {
            const panels = track.querySelectorAll('.collection-panel');
            if (panels.length < 2) return;
            setup(outer, track, panels);
        }

        trySetup();

        if (track.querySelectorAll('.collection-panel').length < 2) {
            const obs = new MutationObserver(() => {
                if (track.querySelectorAll('.collection-panel').length >= 2) {
                    obs.disconnect();
                    trySetup();
                }
            });
            obs.observe(track, { childList: true });

            // Return cleanup for matchMedia revert
            return () => obs.disconnect();
        }
    });
}

function setup(outer, track, panels) {
    // Apply horizontal layout classes
    track.classList.add('collections-grid--hscroll');
    panels.forEach(p => p.classList.add('collection-panel--hscroll'));

    // Mark panels as visible (bypass IntersectionObserver)
    panels.forEach(p => p.classList.add('is-visible'));

    const getScrollDist = () => track.scrollWidth - window.innerWidth;

    // Horizontal translate — ease: "none" is REQUIRED for containerAnimation
    const tween = gsap.to(track, {
        x: () => -getScrollDist(),
        ease: 'none',
        scrollTrigger: {
            trigger: outer,
            pin: true,
            anticipatePin: 1,
            scrub: 1.2,
            invalidateOnRefresh: true,
            end: () => `+=${getScrollDist()}`,
            onUpdate: (self) => {
                const fill = document.querySelector('.collections-progress-fill');
                if (fill) fill.style.transform = `scaleX(${self.progress})`;
            },
        },
    });

    // Panel stagger entrance: each panel fades in as it enters viewport
    // containerAnimation ties these ScrollTriggers to the horizontal movement
    panels.forEach((panel) => {
        gsap.fromTo(panel,
            { opacity: 0, scale: 0.96 },
            {
                opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out',
                scrollTrigger: {
                    trigger: panel,
                    containerAnimation: tween,
                    start: 'left 90%',
                    toggleActions: 'play none none none',
                },
            }
        );
    });

    ScrollTrigger.refresh();
}
