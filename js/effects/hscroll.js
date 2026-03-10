/**
 * Bersaglio Jewelry — Collections Horizontal Scroll
 * Desktop: pins the track outer, animates collection panels horizontally.
 * Mobile/tablet: no-op; CSS handles a 2-column grid.
 */

import { gsap, ScrollTrigger } from '../gsap-core.js';

export function initCollectionsHScroll() {
    // Only on real desktop with fine pointer
    const isDesktop = window.matchMedia('(min-width: 960px) and (pointer: fine)').matches;
    if (!isDesktop) return;

    const outer = document.getElementById('collections-track-outer');
    const track = document.getElementById('collections-grid');
    if (!outer || !track) return;

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
    }
}

function setup(outer, track, panels) {
    // Apply horizontal layout classes
    track.classList.add('collections-grid--hscroll');
    panels.forEach(p => p.classList.add('collection-panel--hscroll'));

    // Mark panels as visible (bypass IntersectionObserver)
    panels.forEach(p => p.classList.add('is-visible'));

    const getScrollDist = () => track.scrollWidth - window.innerWidth;

    // Horizontal translate animation
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
    panels.forEach((panel, i) => {
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
