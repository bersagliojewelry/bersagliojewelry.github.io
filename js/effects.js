/**
 * Bersaglio Jewelry — Interactive Effects Engine
 * Custom cursor · Magnetic hover · Stagger reveals · Counter animation
 */

/* ─── Custom Cursor ─────────────────────────────────────────── */
function initCursor() {
    const cursor   = document.createElement('div');
    const follower = document.createElement('div');
    cursor.className   = 'cursor';
    follower.className = 'cursor-follower';
    document.body.appendChild(cursor);
    document.body.appendChild(follower);

    let mx = 0, my = 0;
    let fx = 0, fy = 0;

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
        cursor.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
    });

    (function animateFollower() {
        fx += (mx - fx) * 0.1;
        fy += (my - fy) * 0.1;
        follower.style.transform = `translate(${fx - 16}px, ${fy - 16}px)`;
        requestAnimationFrame(animateFollower);
    })();

    const hoverEls = 'a, button, [role="button"], .piece-card, .collection-panel, label, input, select, textarea';
    document.querySelectorAll(hoverEls).forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor--hover');
            follower.classList.add('cursor-follower--hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor--hover');
            follower.classList.remove('cursor-follower--hover');
        });
    });

    // Also watch dynamically added pieces/collections cards
    const bodyObserver = new MutationObserver(() => {
        document.querySelectorAll(`${hoverEls}:not([data-cursor-bound])`).forEach(el => {
            el.setAttribute('data-cursor-bound', '1');
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('cursor--hover');
                follower.classList.add('cursor-follower--hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('cursor--hover');
                follower.classList.remove('cursor-follower--hover');
            });
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
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.animate-on-scroll').forEach(el => el.classList.add('is-visible'));
        document.querySelectorAll('.collection-panel').forEach(el => el.classList.add('is-visible'));
        document.querySelectorAll('.service-row').forEach(el => el.classList.add('is-visible'));
        return;
    }
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.collection-panel, .service-row').forEach(el => obs.observe(el));
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
    }, 150);
}
