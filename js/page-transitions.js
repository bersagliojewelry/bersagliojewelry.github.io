/**
 * Bersaglio Jewelry — Page Transitions v2
 * Smooth clip-path reveal + particle burst.
 * Pure GSAP timelines — no CSS transitionend = zero flicker.
 */

import { gsap } from './gsap-core.js';

/* ── Particle burst during transition ───────────────────────── */
const EMERALD_STR = 'rgba(61,155,106,';
const GOLD_STR    = 'rgba(201,169,110,';

class TransitionParticle {
    constructor(x, y) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        this.x  = x;
        this.y  = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.r  = Math.random() * 2.5 + 0.5;
        this.color = Math.random() > 0.5 ? GOLD_STR : EMERALD_STR;
        this.life = 1;
        this.decay = 0.015 + Math.random() * 0.02;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.life -= this.decay;
    }
    draw(ctx) {
        if (this.life <= 0) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color + (this.life * 0.6) + ')';
        ctx.fill();
    }
}

function createOverlay() {
    const existing = document.getElementById('page-transition');
    if (existing) return existing;

    const el = document.createElement('div');
    el.id = 'page-transition';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
        <div class="pt-panel"></div>
        <canvas class="pt-canvas"></canvas>
        <div class="pt-center">
            <svg class="pt-ring" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="30" stroke="rgba(201,169,110,0.15)" stroke-width="1" fill="none"/>
                <circle class="pt-ring-arc" cx="40" cy="40" r="30" stroke="rgba(201,169,110,0.7)"
                        stroke-width="1.5" fill="none" stroke-linecap="round"
                        stroke-dasharray="188.5" stroke-dashoffset="141.4"
                        transform="rotate(-90 40 40)"/>
                <polygon points="40,16 48,32 40,40 32,32"
                         stroke="rgba(201,169,110,0.4)" stroke-width="0.6" fill="none"/>
            </svg>
            <span class="pt-label">BERSAGLIO</span>
        </div>
    `;
    document.body.appendChild(el);
    return el;
}

/* ── Particle canvas during transition ──────────────────────── */
function burstParticles(canvas, duration) {
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const count = window.innerWidth < 768 ? 30 : 60;
    const particles = Array.from({ length: count }, () => new TransitionParticle(cx, cy));
    let running = true;
    const start = performance.now();

    function loop(now) {
        if (!running) return;
        if (now - start > duration) { running = false; return; }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(ctx); });
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    return () => { running = false; };
}

/* ── Enter: page just loaded from a transition ──────────────── */
function animateEnter(overlay) {
    const panel  = overlay.querySelector('.pt-panel');
    const center = overlay.querySelector('.pt-center');
    const canvas = overlay.querySelector('.pt-canvas');
    const arc    = overlay.querySelector('.pt-ring-arc');

    gsap.set(overlay, { display: 'flex', pointerEvents: 'none' });
    gsap.set(panel, { clipPath: 'inset(0% 0% 0% 0%)' });
    gsap.set(center, { opacity: 1, scale: 1 });

    /* Spin arc while visible */
    const spinTween = gsap.to(arc, { rotation: 360, duration: 1.2, repeat: -1, ease: 'none', transformOrigin: '40px 40px' });

    const stopBurst = burstParticles(canvas, 1200);

    const tl = gsap.timeline({
        onComplete() {
            spinTween.kill();
            stopBurst();
            gsap.set(overlay, { display: 'none' });
            gsap.set(panel, { clipPath: 'inset(0% 0% 100% 0%)' });
            gsap.set(center, { opacity: 0, scale: 0.9 });
        },
    });

    tl.to(center, { opacity: 0, scale: 1.15, duration: 0.35, ease: 'power2.in', delay: 0.2 })
      .to(panel, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.7, ease: 'power4.inOut' }, '-=0.15');
}

/* ── Exit: navigating away ──────────────────────────────────── */
function animateExit(overlay, href) {
    const panel  = overlay.querySelector('.pt-panel');
    const center = overlay.querySelector('.pt-center');
    const arc    = overlay.querySelector('.pt-ring-arc');

    gsap.set(overlay, { display: 'flex', pointerEvents: 'all' });
    gsap.set(panel, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(center, { opacity: 0, scale: 0.85 });

    const spinTween = gsap.to(arc, { rotation: 360, duration: 1.2, repeat: -1, ease: 'none', transformOrigin: '40px 40px' });

    gsap.timeline({
        onComplete() {
            spinTween.kill();
            window.location.href = href;
        },
    })
    .to(panel, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: 'power4.inOut' })
    .to(center, { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' }, '-=0.2');
}

function isInternal(href, target) {
    if (!href) return false;
    if (target === '_blank') return false;
    if (href.startsWith('http') || href.startsWith('//')) return false;
    if (href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) return false;
    if (href.includes('wa.me') || href.includes('whatsapp')) return false;
    if (href.includes('admin')) return false;
    return true;
}

export function initPageTransitions() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const overlay = createOverlay();

    /* Back-forward cache: reset overlay on bfcache restore */
    window.addEventListener('pageshow', (e) => {
        if (e.persisted) {
            gsap.set(overlay, { display: 'none' });
            sessionStorage.removeItem('bj-pt-nav');
            document.body.classList.remove('is-preloading');
        }
    });

    const fromTransition = sessionStorage.getItem('bj-pt-nav');
    sessionStorage.removeItem('bj-pt-nav');

    if (fromTransition) {
        animateEnter(overlay);
    } else {
        gsap.set(overlay, { display: 'none' });
    }

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;

        const href   = link.getAttribute('href');
        const target = link.getAttribute('target') || '';

        if (!isInternal(href, target)) return;

        e.preventDefault();
        sessionStorage.setItem('bj-pt-nav', '1');
        animateExit(overlay, href);
    }, true);
}
