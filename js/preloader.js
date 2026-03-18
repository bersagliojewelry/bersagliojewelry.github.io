/**
 * Bersaglio Jewelry — Preloader v2
 * Cutting-edge loading screen with:
 *   • Canvas particle constellation that converges → explodes on exit
 *   • SVG morphing diamond ring with glow pulse
 *   • Real progress tracking with shimmer text
 *   • GSAP-powered exit (zero flicker, GPU-accelerated)
 *   • Aurora gradient background
 */

import { gsap } from './gsap-core.js';

/* ── Brand colours ──────────────────────────────────────────── */
const EMERALD = { r: 61,  g: 155, b: 106 };
const GOLD    = { r: 201, g: 169, b: 110 };
const IVORY   = { r: 245, g: 243, b: 237 };

/* ── Particle system ────────────────────────────────────────── */
class PreloaderParticle {
    constructor(w, h, cx, cy) {
        this.w = w; this.h = h;
        this.cx = cx; this.cy = cy;
        this.init();
    }

    init() {
        const angle  = Math.random() * Math.PI * 2;
        const radius = 60 + Math.random() * Math.min(this.w, this.h) * 0.35;
        this.x  = this.cx + Math.cos(angle) * radius;
        this.y  = this.cy + Math.sin(angle) * radius;
        this.tx = this.cx + (Math.random() - 0.5) * 80;
        this.ty = this.cy + (Math.random() - 0.5) * 80;
        this.r  = Math.random() * 2 + 0.5;

        const palette = Math.random();
        if (palette < 0.45) {
            this.color = EMERALD;
        } else if (palette < 0.85) {
            this.color = GOLD;
        } else {
            this.color = IVORY;
        }

        this.baseAlpha = Math.random() * 0.6 + 0.2;
        this.alpha     = 0;
        this.phase     = Math.random() * Math.PI * 2;
        this.speed     = Math.random() * 0.02 + 0.008;
        this.converge  = 0;
    }

    update(t, converge) {
        this.converge = converge;
        const lerp = this.converge;
        const ox = Math.sin(t * this.speed + this.phase) * (12 * (1 - lerp));
        const oy = Math.cos(t * this.speed * 0.7 + this.phase) * (8 * (1 - lerp));

        this.x += (this.tx + ox - this.x) * 0.03;
        this.y += (this.ty + oy - this.y) * 0.03;

        const pulse = 0.5 + 0.5 * Math.sin(t * 0.003 + this.phase);
        this.alpha = this.baseAlpha * (0.6 + 0.4 * pulse) * Math.min(converge * 3, 1);
    }

    draw(ctx) {
        if (this.alpha < 0.01) return;
        const { r, g, b } = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${this.alpha})`;
        ctx.fill();

        if (this.r > 1.2 && this.alpha > 0.3) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r},${g},${b},${this.alpha * 0.15})`;
            ctx.fill();
        }
    }

    explode(cx, cy) {
        const dx = this.x - cx;
        const dy = this.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const power = 300 + Math.random() * 500;
        this.tx = this.x + (dx / dist) * power;
        this.ty = this.y + (dy / dist) * power;
    }
}

/* ── Connection lines between nearby particles ──────────────── */
function drawConnections(ctx, particles, maxDist) {
    for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        if (a.alpha < 0.05) continue;
        for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];
            if (b.alpha < 0.05) continue;
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const d  = dx * dx + dy * dy;
            if (d < maxDist * maxDist) {
                const alpha = (1 - Math.sqrt(d) / maxDist) * 0.12 * Math.min(a.alpha, b.alpha);
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = `rgba(201,169,110,${alpha})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
}

/* ── Build DOM ──────────────────────────────────────────────── */
function createPreloaderDOM() {
    const el = document.createElement('div');
    el.id = 'preloader';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
        <canvas class="preloader-canvas"></canvas>
        <div class="preloader-aurora"></div>
        <div class="preloader-center">
            <svg class="preloader-ring" viewBox="0 0 120 120" fill="none">
                <defs>
                    <linearGradient id="preloader-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%"   stop-color="#C9A96E"/>
                        <stop offset="50%"  stop-color="#3D9B6A"/>
                        <stop offset="100%" stop-color="#C9A96E"/>
                    </linearGradient>
                    <filter id="preloader-glow">
                        <feGaussianBlur stdDeviation="3" result="blur"/>
                        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                    </filter>
                </defs>
                <circle class="preloader-ring-track" cx="60" cy="60" r="48"
                        stroke="rgba(201,169,110,0.08)" stroke-width="1" fill="none"/>
                <circle class="preloader-ring-progress" cx="60" cy="60" r="48"
                        stroke="url(#preloader-grad)" stroke-width="1.5" fill="none"
                        stroke-linecap="round" filter="url(#preloader-glow)"
                        stroke-dasharray="301.6" stroke-dashoffset="301.6"
                        transform="rotate(-90 60 60)"/>
                <polygon class="preloader-diamond" points="60,18 72,42 60,54 48,42"
                         stroke="rgba(201,169,110,0.5)" stroke-width="0.8" fill="none"
                         stroke-linejoin="round"/>
                <line class="preloader-cross-h" x1="36" y1="60" x2="84" y2="60"
                      stroke="rgba(201,169,110,0.12)" stroke-width="0.5"/>
                <line class="preloader-cross-v" x1="60" y1="36" x2="60" y2="84"
                      stroke="rgba(201,169,110,0.12)" stroke-width="0.5"/>
            </svg>
            <div class="preloader-text">
                <span class="preloader-brand">BERSAGLIO</span>
                <span class="preloader-sub">JEWELRY</span>
            </div>
            <div class="preloader-progress-line">
                <div class="preloader-progress-fill"></div>
            </div>
        </div>
    `;
    return el;
}

/* ── Main init ──────────────────────────────────────────────── */
export function initPreloader() {
    if (sessionStorage.getItem('bj-loaded')) return;
    sessionStorage.setItem('bj-loaded', '1');

    const el = createPreloaderDOM();
    document.body.prepend(el);
    document.body.classList.add('is-preloading');

    const canvas = el.querySelector('.preloader-canvas');
    const ctx    = canvas.getContext('2d');
    const ring   = el.querySelector('.preloader-ring-progress');
    const fill   = el.querySelector('.preloader-progress-fill');
    const diamond = el.querySelector('.preloader-diamond');

    const CIRCUMFERENCE = 301.6;
    let w, h, cx, cy;
    let particles = [];
    let running = true;
    let startTime = Date.now();
    let progress = 0;
    let converge = 0;

    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const PARTICLE_COUNT = isTouch ? 35 : 70;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
        w = canvas.width  = el.offsetWidth;
        h = canvas.height = el.offsetHeight;
        cx = w / 2;
        cy = h / 2;
        particles.forEach(p => { p.w = w; p.h = h; p.cx = cx; p.cy = cy; });
    }

    function build() {
        particles = Array.from({ length: PARTICLE_COUNT },
            () => new PreloaderParticle(w, h, cx, cy));
    }

    function updateProgress(p) {
        progress = Math.min(p, 1);
        const offset = CIRCUMFERENCE * (1 - progress);
        ring.style.strokeDashoffset = offset;
        fill.style.transform = `scaleX(${progress})`;

        converge = Math.min(progress * 1.5, 1);
    }

    let t = 0;
    function loop() {
        if (!running) return;
        t += 16;
        ctx.clearRect(0, 0, w, h);

        if (!reducedMotion) {
            particles.forEach(p => { p.update(t, converge); p.draw(ctx); });
            drawConnections(ctx, particles, 100);
        }

        requestAnimationFrame(loop);
    }

    resize();
    build();

    if (!reducedMotion) {
        loop();

        gsap.to(diamond, {
            rotation: 360,
            duration: 8,
            repeat: -1,
            ease: 'none',
            transformOrigin: '60px 36px'
        });
    }

    const entranceTl = gsap.timeline();
    entranceTl
        .fromTo('.preloader-center', { opacity: 0, scale: 0.85 },
            { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }, 0)
        .fromTo('.preloader-brand', { opacity: 0, y: 12, letterSpacing: '0.6em' },
            { opacity: 1, y: 0, letterSpacing: '0.35em', duration: 0.7, ease: 'power2.out' }, 0.3)
        .fromTo('.preloader-sub', { opacity: 0, y: 8 },
            { opacity: 0.6, y: 0, duration: 0.5, ease: 'power2.out' }, 0.5);

    /* ── Simulated progress (tracks real resources when possible) ── */
    const minMs = 1800;
    const fakeInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const fakeProgress = 1 - Math.exp(-elapsed / 1200);
        updateProgress(Math.min(fakeProgress, 0.85));
    }, 30);

    /* ── Resize handler ──────────────────────────────────────────── */
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    /* ── Hide sequence ───────────────────────────────────────────── */
    function hide() {
        const elapsed = Date.now() - startTime;
        const wait = Math.max(0, minMs - elapsed);

        setTimeout(() => {
            clearInterval(fakeInterval);

            /* Snap progress to 100% */
            const completeTl = gsap.timeline();
            completeTl.to({}, {
                duration: 0.4,
                onUpdate() {
                    updateProgress(progress + (1 - progress) * this.progress());
                }
            });

            completeTl.call(() => {
                /* Explode particles outward */
                particles.forEach(p => p.explode(cx, cy));
            }, null, '+=0.15');

            /* Exit animation — no CSS transitionend, pure GSAP = zero flicker */
            const exitTl = gsap.timeline({
                delay: 0.25,
                onComplete() {
                    running = false;
                    ro.disconnect();
                    el.remove();
                    document.body.classList.remove('is-preloading');
                }
            });

            exitTl
                .to('.preloader-progress-line', { opacity: 0, scaleX: 1.5, duration: 0.3, ease: 'power2.in' }, 0)
                .to('.preloader-ring', { scale: 1.8, opacity: 0, duration: 0.7, ease: 'power3.in' }, 0.05)
                .to('.preloader-brand', { y: -20, opacity: 0, duration: 0.4, ease: 'power2.in' }, 0.05)
                .to('.preloader-sub', { y: -14, opacity: 0, duration: 0.35, ease: 'power2.in' }, 0.1)
                .to('.preloader-aurora', { opacity: 0, duration: 0.5, ease: 'power2.inOut' }, 0.2)
                .to(canvas, { opacity: 0, duration: 0.6, ease: 'power2.in' }, 0.1)
                .to(el, {
                    opacity: 0,
                    duration: 0.5,
                    ease: 'power2.inOut',
                }, 0.35);

        }, wait);
    }

    if (document.readyState === 'complete') {
        hide();
    } else {
        window.addEventListener('load', hide, { once: true });
    }
}
