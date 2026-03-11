/**
 * Bersaglio Jewelry — Interactive Effects Engine
 * Custom cursor · Magnetic hover · Stagger reveals · Counter animation · 3D Tilt
 */

import { initTilt } from './effects/tilt.js';

/* ─── Custom Cursor ─────────────────────────────────────────── */

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ·–';

function scrambleText(el, text) {
    let frame = 0;
    const total = 11;
    cancelAnimationFrame(el._scrambleRaf);
    (function tick() {
        el.textContent = [...text].map((ch, i) =>
            frame / total > i / text.length
                ? ch
                : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
        ).join('');
        frame++;
        if (frame <= total) el._scrambleRaf = requestAnimationFrame(tick);
        else el.textContent = text;
    })();
}

// Label selectors: [selector, label text]
const LABEL_MAP = [
    ['.piece-card',          'VER'],
    ['.collection-panel',    'VER'],
    ['.journal-card',        'LEER'],
    ['#journal-featured > *','LEER'],
    ['.btn-primary',         'IR'],
    ['.btn-outline',         'VER'],
    ['a[href$=".html"]:not(.btn):not(.logo-link)', 'VER'],
];

function initCursor() {
    const cursor   = document.createElement('div');
    const follower = document.createElement('div');
    const label    = document.createElement('span');

    cursor.className   = 'cursor cursor--hidden';
    follower.className = 'cursor-follower cursor--hidden';
    label.className    = 'cursor-label';

    document.body.appendChild(cursor);
    document.body.appendChild(follower);
    document.body.appendChild(label);

    let mx = 0, my = 0;
    let fx = 0, fy = 0;
    let visible = false;

    function show() {
        if (!visible) {
            cursor.classList.remove('cursor--hidden');
            follower.classList.remove('cursor--hidden');
            visible = true;
        }
    }

    function hide() {
        cursor.classList.add('cursor--hidden');
        follower.classList.add('cursor--hidden');
        label.classList.remove('cursor-label--visible');
        visible = false;
    }

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
        cursor.style.transform   = `translate(${mx - 3}px, ${my - 3}px)`;
        label.style.transform    = `translate(${mx + 26}px, ${my + 26}px)`;
        show();
    });

    document.addEventListener('mouseleave', hide);
    document.addEventListener('mouseenter', show);
    window.addEventListener('blur', hide);

    (function animateFollower() {
        fx += (mx - fx) * 0.09;
        fy += (my - fy) * 0.09;
        follower.style.transform = `translate(${fx - 22}px, ${fy - 22}px)`;
        requestAnimationFrame(animateFollower);
    })();

    const hoverEls = 'a, button, [role="button"], .piece-card, .collection-panel, label, input, select, textarea';

    function bindHover(el) {
        if (el.dataset.cursorBound) return;
        el.dataset.cursorBound = '1';
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor--hover');
            follower.classList.add('cursor-follower--hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor--hover');
            follower.classList.remove('cursor-follower--hover');
        });
    }

    function bindLabel(el) {
        if (el.dataset.labelBound) return;
        el.dataset.labelBound = '1';

        const entry = LABEL_MAP.find(([sel]) => {
            try { return el.matches(sel); } catch { return false; }
        });
        const text = el.dataset.cursor || (entry ? entry[1] : null);
        if (!text) return;

        el.addEventListener('mouseenter', () => {
            scrambleText(label, text);
            label.classList.add('cursor-label--visible');
        });
        el.addEventListener('mouseleave', () => {
            label.classList.remove('cursor-label--visible');
        });
    }

    document.querySelectorAll(hoverEls).forEach(bindHover);
    LABEL_MAP.forEach(([sel]) => {
        try { document.querySelectorAll(sel).forEach(bindLabel); } catch {}
    });

    // Watch dynamically added elements
    const bodyObserver = new MutationObserver(() => {
        document.querySelectorAll(hoverEls).forEach(bindHover);
        LABEL_MAP.forEach(([sel]) => {
            try { document.querySelectorAll(sel).forEach(bindLabel); } catch {}
        });
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });
}

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

// Re-run stagger after dynamic content loads
export function restaggerAfterRender() {
    setTimeout(initStagger, 100);
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

/* ─── Parallax on Hero ──────────────────────────────────────── */
function initHeroParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    document.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
            hero.style.backgroundPositionY = `${y * 0.3}px`;
        }
    }, { passive: true });
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
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (!isTouch) {
        initCursor();
        initMagnetic();
    }

    initHeroParallax();
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
