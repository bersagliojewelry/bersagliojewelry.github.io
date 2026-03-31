/**
 * Bersaglio Jewelry — GSAP Scroll Animations
 * Uses ScrollTrigger.batch() for efficient grouped reveals,
 * gsap.matchMedia() for responsive cleanup, and proper
 * ScrollTrigger best practices from the official GSAP skills.
 */

import { gsap, ScrollTrigger } from './gsap-core.js';

/* ─── Section headers animated entrance ────────────────────── */
function initSectionHeaders() {
    document.querySelectorAll('.section-header').forEach(header => {
        const eyebrow = header.querySelector('.section-eyebrow');
        const title   = header.querySelector('.section-title');
        const desc    = header.querySelector('.section-desc');

        const els = [eyebrow, title, desc].filter(Boolean);
        if (!els.length) return;

        gsap.fromTo(els,
            { y: 28, opacity: 0 },
            {
                y: 0, opacity: 1,
                duration: 0.75,
                stagger: 0.12,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: header,
                    start: 'top 82%',
                    toggleActions: 'play none none none',
                },
            }
        );
    });
}

/* ─── Piece cards — ScrollTrigger.batch() for grouped reveals ─ */
function initPieceCards() {
    const grid = document.getElementById('featured-grid');
    if (!grid) return;

    function bindCards() {
        const cards = grid.querySelectorAll('.piece-card:not([data-gsap-bound])');
        if (!cards.length) return;

        cards.forEach(c => c.setAttribute('data-gsap-bound', '1'));

        // Set initial state
        gsap.set(cards, { y: 40, opacity: 0, scale: 0.97 });

        // batch() — groups elements entering viewport in the same frame,
        // fires one callback with all of them → natural stagger effect
        ScrollTrigger.batch(cards, {
            start: 'top 85%',
            onEnter: (batch) => {
                gsap.to(batch, {
                    y: 0, opacity: 1, scale: 1,
                    duration: 0.65,
                    stagger: 0.08,
                    ease: 'power2.out',
                    overwrite: true,
                });
            },
            once: true,
        });
    }

    bindCards();

    if (!grid.querySelector('.piece-card')) {
        const obs = new MutationObserver(() => {
            if (grid.querySelector('.piece-card')) {
                obs.disconnect();
                bindCards();
            }
        });
        obs.observe(grid, { childList: true });
    }
}

/* ─── Services animated entrance ───────────────────────────── */
function initServicesSection() {
    const grid = document.getElementById('services-grid');
    if (!grid) return;

    function bindServices() {
        const rows = grid.querySelectorAll('.service-row:not([data-gsap-bound]), .service-card:not([data-gsap-bound])');
        if (!rows.length) return;

        rows.forEach(r => r.setAttribute('data-gsap-bound', '1'));

        gsap.set(rows, { x: -30, opacity: 0 });

        ScrollTrigger.batch(rows, {
            start: 'top 85%',
            onEnter: (batch) => {
                gsap.to(batch, {
                    x: 0, opacity: 1,
                    duration: 0.7,
                    stagger: 0.1,
                    ease: 'power3.out',
                    overwrite: true,
                });
            },
            once: true,
        });
    }

    bindServices();

    if (!grid.querySelector('.service-row, .service-card')) {
        const obs = new MutationObserver(() => {
            if (grid.querySelector('.service-row, .service-card')) {
                obs.disconnect();
                bindServices();
            }
        });
        obs.observe(grid, { childList: true });
    }
}

/* ─── Brand statement animated entrance ────────────────────── */
function initBrandStatement() {
    const el = document.querySelector('.brand-statement-inner');
    if (!el) return;

    gsap.fromTo(el,
        { y: 20, opacity: 0 },
        {
            y: 0, opacity: 1,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
        }
    );
}

/* ─── About teaser stats: entrance + counter animation ────────── */
function initStatsBars() {
    const stats = document.querySelectorAll('.stat');
    if (!stats.length) return;

    gsap.fromTo(stats,
        { y: 30, opacity: 0 },
        {
            y: 0, opacity: 1,
            duration: 0.6,
            stagger: 0.14,
            ease: 'back.out(1.2)',
            scrollTrigger: {
                trigger: stats[0].closest('.about-teaser-stats, .about-stats') || stats[0],
                start: 'top 78%',
                toggleActions: 'play none none none',
                onEnter: () => animateCounters(),
            },
        }
    );
}

/* ─── Counter animation — GSAP tween with proxy object ─────── */
function animateCounters() {
    document.querySelectorAll('.stat-number[data-count]').forEach(el => {
        const target  = parseFloat(el.dataset.count);
        const suffix  = el.dataset.suffix || '';
        const prefix  = el.dataset.prefix || '';
        if (isNaN(target)) return;

        const isInt = Number.isInteger(target);
        const proxy = { val: 0 };

        gsap.to(proxy, {
            val: target,
            duration: 1.4,
            ease: 'power3.out',
            onUpdate() {
                const display = isInt ? Math.round(proxy.val) : proxy.val.toFixed(1);
                el.textContent = `${prefix}${display}${suffix}`;
            },
        });
    });
}

/* ─── Journal cards — ScrollTrigger.batch() ────────────────── */
function initJournalCards() {
    const preview = document.querySelector('.journal-preview-grid');
    if (!preview) return;

    function bindJournal() {
        const cards = preview.querySelectorAll('.journal-card:not([data-gsap-bound]), .journal-featured:not([data-gsap-bound])');
        if (!cards.length) return;
        cards.forEach(c => c.setAttribute('data-gsap-bound', '1'));

        gsap.set(cards, { y: 35, opacity: 0 });

        ScrollTrigger.batch(cards, {
            start: 'top 85%',
            onEnter: (batch) => {
                gsap.to(batch, {
                    y: 0, opacity: 1,
                    duration: 0.7,
                    stagger: 0.1,
                    ease: 'power2.out',
                    overwrite: true,
                });
            },
            once: true,
        });
    }

    bindJournal();

    const obs = new MutationObserver(() => {
        bindJournal();
    });
    obs.observe(preview, { childList: true, subtree: true });
}

/* ─── CTA banner entrance ───────────────────────────────────── */
function initCtaBanner() {
    const cta = document.querySelector('.cta-inner');
    if (!cta) return;

    gsap.fromTo(cta,
        { y: 25, opacity: 0 },
        {
            y: 0, opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: cta,
                start: 'top 82%',
                toggleActions: 'play none none none',
            },
        }
    );
}

/* ─── Services connector line ──────────────────────────────── */
function initServicesLine() {
    const line = document.querySelector('.services-vline');
    if (!line) return;

    gsap.fromTo(line,
        { scaleY: 0 },
        {
            scaleY: 1,
            duration: 1.2,
            ease: 'power2.inOut',
            scrollTrigger: {
                trigger: line,
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
        }
    );
}

/* ─── Main init ─────────────────────────────────────────────── */
export function initGSAPScrollAnimations() {
    // Small delay to let dynamic content render
    setTimeout(() => {
        initSectionHeaders();
        initBrandStatement();
        initPieceCards();
        initServicesSection();
        initStatsBars();
        initJournalCards();
        initCtaBanner();
        initServicesLine();
        ScrollTrigger.refresh();
    }, 200);
}
