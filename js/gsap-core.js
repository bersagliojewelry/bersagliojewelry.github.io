/**
 * Bersaglio Jewelry — GSAP Core
 * Initializes GSAP + ScrollTrigger + Lenis smooth scroll.
 * All other modules import from here instead of importing GSAP directly.
 */

import { gsap }          from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis             from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

let lenis = null;

export function initSmoothScroll() {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouch) return; // native scroll on mobile

    lenis = new Lenis({
        duration:   1.2,
        easing:     t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        syncTouch:  false,
    });

    // Wire Lenis to GSAP ticker
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Keep ScrollTrigger in sync
    lenis.on('scroll', ScrollTrigger.update);
}

export function getLenis() { return lenis; }

export { gsap, ScrollTrigger };
