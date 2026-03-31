/**
 * Bersaglio Jewelry — Interactive Effects Engine
 * Magnetic hover (gsap.quickTo) · Stagger reveals · Counter animation (GSAP) · 3D Tilt
 *
 * Improved with GSAP best practices:
 *   - gsap.quickTo() for magnetic hover (reuses single tween, ~60fps)
 *   - gsap.to() for counter animation (replaces manual RAF)
 *   - gsap.matchMedia() for responsive cleanup
 */

import { gsap } from './gsap-core.js';
import { initTilt } from './effects/tilt.js';


/* ─── Magnetic Hover (gsap.quickTo) ────────────────────────── */
function initMagnetic() {
    function bindMagnetic(el) {
        if (el.dataset.magnetBound) return;
        el.dataset.magnetBound = '1';

        // gsap.quickTo creates a reusable tween — ideal for frequent updates (mousemove)
        const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });

        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            xTo((e.clientX - cx) * 0.28);
            yTo((e.clientY - cy) * 0.28);
        });

        el.addEventListener('mouseleave', () => {
            xTo(0);
            yTo(0);
        });
    }

    document.querySelectorAll('.btn, .nav-link--cta').forEach(bindMagnetic);

    // Re-bind after dynamic renders
    const mo = new MutationObserver(() => {
        document.querySelectorAll('.btn:not([data-magnet-bound]), .nav-link--cta:not([data-magnet-bound])').forEach(bindMagnetic);
    });
    mo.observe(document.body, { childList: true, subtree: true });
}

/* ─── Stagger Animation Delays ──────────────────────────────── */
function initStagger() {
    // Featured grid: stagger pieces
    document.querySelectorAll('#featured-grid .piece-card, #featured-grid .animate-on-scroll').forEach((el, i) => {
        el.style.transitionDelay = `${i * 80}ms`;
    });

    // Collection panels: stagger
    document.querySelectorAll('.collection-panel').forEach((el, i) => {
        el.style.transitionDelay = `${i * 100}ms`;
    });

    // Service rows: stagger
    document.querySelectorAll('.service-row').forEach((el, i) => {
        el.style.transitionDelay = `${i * 90}ms`;
    });
}

/* ─── Counter Animation (GSAP tween) ───────────────────────── */
function animateCounter(el) {
    const rawText  = el.textContent.trim();
    const number   = parseFloat(rawText);
    if (isNaN(number)) return;

    const suffix   = rawText.replace(/[\d.]+/, '');
    const decimals = (rawText.split('.')[1] || '').replace(/[^0-9]/g, '').length;

    // Use a proxy object — GSAP tweens its 'val' property and we update the DOM in onUpdate
    const proxy = { val: 0 };
    gsap.to(proxy, {
        val: number,
        duration: 1.4,
        ease: 'power3.out',
        onUpdate() {
            const display = decimals > 0 ? proxy.val.toFixed(decimals) : Math.round(proxy.val);
            el.textContent = `${display}${suffix}`;
        },
    });
}

function initCounters() {
    if (!('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number').forEach(el => obs.observe(el));
}

/* ─── Reveal already-visible elements ───────────────────────── */
function forceRevealInView() {
    const ALL_SELECTORS = '.animate-on-scroll, .collection-panel, .service-row';

    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll(ALL_SELECTORS).forEach(el => el.classList.add('is-visible'));
        return;
    }
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });

    document.querySelectorAll(ALL_SELECTORS).forEach(el => obs.observe(el));
}

/* ─── Nuclear fallback: force all content visible after 3.5s ── */
function scheduleNuclearReveal() {
    setTimeout(() => {
        const hidden = document.querySelectorAll(
            '.animate-on-scroll:not(.is-visible), .collection-panel:not(.is-visible), .service-row:not(.is-visible)'
        );
        if (hidden.length) {
            hidden.forEach(el => el.classList.add('is-visible'));
        }
    }, 3500);
}


/* ─── Main Init ─────────────────────────────────────────────── */
export function initEffects() {
    // gsap.matchMedia() for responsive — auto cleanup on breakpoint change
    const mm = gsap.matchMedia();

    mm.add('(pointer: fine)', () => {
        // Desktop-only effects
        initMagnetic();
        initTilt();
    });

    initCounters();

    // Stagger after short delay so dynamic content has rendered
    setTimeout(() => {
        initStagger();
        forceRevealInView();
        scheduleNuclearReveal();
    }, 150);
}
