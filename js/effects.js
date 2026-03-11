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
    // Solo en dispositivos con ratón
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const IMG = {
        normal:  'img/cursor-normal.png',  // CURSOR.png
        hand:    'img/cursor-hand.png',    // MANO.png
        loading: 'img/cursor-load.png',    // CARGANDO.png
    };

    // Pre-carga silenciosa para evitar parpadeo
    Object.values(IMG).forEach(src => { const pre = new Image(); pre.src = src; });

    // Crear elemento cursor
    const wrap = document.createElement('div');
    wrap.id = 'bj-cursor';
    const img = document.createElement('img');
    img.src = IMG.normal;
    img.alt = '';
    img.draggable = false;
    wrap.appendChild(img);
    document.body.appendChild(wrap);

    let currentState = 'normal';

    function setState(state) {
        if (currentState === state) return;
        currentState = state;
        img.src = IMG[state];
        wrap.dataset.state = state;
    }

    function show() { wrap.style.opacity = '1'; }
    function hide() { wrap.style.opacity = '0'; }

    document.addEventListener('mousemove', (e) => {
        wrap.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        show();
    });

    document.addEventListener('mouseleave', hide);
    document.addEventListener('mouseenter', show);
    window.addEventListener('blur', hide);

    const hoverEls = 'a, button, [role="button"], .piece-card, .collection-panel, label, input, select, textarea';

    function bindHover(el) {
        if (el.dataset.cursorBound) return;
        el.dataset.cursorBound = '1';
        el.addEventListener('mouseenter', () => {
            if (currentState !== 'loading') setState('hand');
        });
        el.addEventListener('mouseleave', () => {
            if (currentState !== 'loading') setState('normal');
        });
    }

    document.querySelectorAll(hoverEls).forEach(bindHover);

    new MutationObserver(() => {
        document.querySelectorAll(hoverEls).forEach(bindHover);
    }).observe(document.body, { childList: true, subtree: true });

    // Estado loading al navegar a otra página
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;
        const href = link.getAttribute('href') || '';
        if (href && !href.startsWith('#') && !href.startsWith('tel:') &&
            !href.startsWith('mailto:') && link.target !== '_blank') {
            setState('loading');
        }
    });
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
    // pointer:coarse = dispositivo táctil primario (móvil/tablet)
    // pointer:fine = ratón/trackpad (desktop/laptop) — matchMedia es el único método fiable
    // navigator.maxTouchPoints > 0 da falso positivo en macOS (trackpad = 5 puntos)
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

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
