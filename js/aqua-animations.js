/**
 * Bersaglio Jewelry — Aqua entrance animations
 *
 * Auto-applies .is-visible to elements with .aqua-fade-in or
 * .aqua-stagger when they scroll into view. Uses IntersectionObserver
 * (no GSAP / no scrollTrigger). Respects prefers-reduced-motion.
 *
 * Auto-tags on init:
 *   - Every <section> in main.aqua-page-* gets .aqua-fade-in
 *   - Common grid containers get .aqua-stagger applied to themselves
 */

const THRESHOLD = 0.12;
const ROOT_MARGIN = '0px 0px -10% 0px';

let _observer = null;

function ensureObserver() {
    if (_observer) return _observer;
    if (typeof IntersectionObserver === 'undefined') return null;

    _observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                _observer.unobserve(entry.target);
            }
        });
    }, { threshold: THRESHOLD, rootMargin: ROOT_MARGIN });

    return _observer;
}

function observe(el) {
    const obs = ensureObserver();
    if (!obs) {
        // Fallback: snap visible immediately
        el.classList.add('is-visible');
        return;
    }
    obs.observe(el);
}

export function initAquaAnimations() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Auto-tag every section that doesn't already have an animation class.
    // Skip header / footer / preloader / cart-drawer / aside.
    document.querySelectorAll('main section').forEach(sec => {
        if (sec.classList.contains('aqua-fade-in') || sec.classList.contains('aqua-stagger')) return;
        sec.classList.add('aqua-fade-in');
    });

    // Auto-tag common grid containers as staggered (cards reveal in sequence).
    document.querySelectorAll('.featured-grid, .hero-aqua-cats-dock, .nosotros-timeline-grid, .checkout-payment-options, .contact-sidebar').forEach(grid => {
        grid.classList.add('aqua-stagger');
    });

    // Now observe all tagged elements (newly tagged + any pre-existing).
    document.querySelectorAll('.aqua-fade-in, .aqua-stagger').forEach(observe);
}

// Re-observe newly added DOM (e.g. when JS-rendered cards arrive after fetch).
export function refreshAquaAnimations(rootEl = document) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    rootEl.querySelectorAll('.aqua-fade-in:not(.is-visible), .aqua-stagger:not(.is-visible)').forEach(observe);
}

if (typeof window !== 'undefined') {
    window.refreshAquaAnimations = refreshAquaAnimations;
}
