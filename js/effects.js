/**
 * Bersaglio Jewelry — Interactive Effects Engine
 * Magnetic hover · Stagger reveals · Counter animation · 3D Tilt
 */

import { initTilt } from './effects/tilt.js';


/* ─── Magnetic Hover ────────────────────────────────────────── */
function initMagnetic() {
    function bindMagnetic(el) {
        if (el.dataset.magnetBound) return;
        el.dataset.magnetBound = '1';
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) * 0.28;
            const dy = (e.clientY - cy) * 0.28;
            el.style.transform = `translate(${dx}px, ${dy}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
            el.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
            setTimeout(() => { el.style.transition = ''; }, 500);
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

/* ─── Counter Animation ─────────────────────────────────────── */
function animateCounter(el) {
    const rawText  = el.textContent.trim();
    const number   = parseFloat(rawText);
    if (isNaN(number)) return;

    const suffix   = rawText.replace(/[\d.]+/, '');
    const decimals = (rawText.split('.')[1] || '').replace(/[^0-9]/g, '').length;
    const duration = 1600;
    const startTs  = performance.now();

    (function tick(now) {
        const elapsed  = now - startTs;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current  = eased * number;
        el.textContent = current.toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
    })(performance.now());
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
// Safety net: if IntersectionObserver never fires (e.g. hidden iframe,
// odd scroll container), reveal everything so the site is never blank.
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
    // pointer:coarse = dispositivo táctil primario (móvil/tablet)
    // pointer:fine = ratón/trackpad (desktop/laptop) — matchMedia es el único método fiable
    // navigator.maxTouchPoints > 0 da falso positivo en macOS (trackpad = 5 puntos)
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    if (!isTouch) {
        initMagnetic();
    }

    initCounters();

    // Stagger after short delay so dynamic content has rendered
    setTimeout(() => {
        initStagger();
        forceRevealInView();
        scheduleNuclearReveal();
    }, 150);

    // 3D tilt for cards and panels (desktop only)
    if (!isTouch) {
        initTilt();
    }
}
