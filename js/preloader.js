/**
 * Bersaglio Jewelry — Preloader v3
 * Premium loading experience inspired by the brand's concentric-ring + crosshair logo.
 *   • Orbital particles in symmetrical concentric rings
 *   • SVG concentric circles that draw themselves + crosshair
 *   • Progress arc with golden gradient
 *   • GSAP-powered entrance/exit — zero flicker
 */

import { gsap } from './gsap-core.js';

/* ── Orbital particle ───────────────────────────────────────── */
class OrbitalParticle {
    constructor(cx, cy, orbit, index, total) {
        this.cx = cx;
        this.cy = cy;
        this.orbit = orbit;
        this.angle = (index / total) * Math.PI * 2;
        this.baseAngle = this.angle;
        this.speed = (0.0004 + Math.random() * 0.0003) * (Math.random() > 0.5 ? 1 : -1);
        this.r = Math.random() * 1.8 + 0.6;

        const p = Math.random();
        if (p < 0.5) {
            this.cr = 201; this.cg = 169; this.cb = 110; // gold
        } else if (p < 0.85) {
            this.cr = 61; this.cg = 155; this.cb = 106;  // emerald
        } else {
            this.cr = 245; this.cg = 243; this.cb = 237; // ivory
        }

        this.baseAlpha = 0.25 + Math.random() * 0.5;
        this.alpha = 0;
        this.phase = Math.random() * Math.PI * 2;
        this.wobble = Math.random() * 4;
    }

    update(t) {
        this.angle = this.baseAngle + t * this.speed;
        const wobbleR = this.orbit + Math.sin(t * 0.001 + this.phase) * this.wobble;
        this.x = this.cx + Math.cos(this.angle) * wobbleR;
        this.y = this.cy + Math.sin(this.angle) * wobbleR;

        const pulse = 0.7 + 0.3 * Math.sin(t * 0.002 + this.phase);
        this.alpha = this.baseAlpha * pulse;
    }

    draw(ctx) {
        if (this.alpha < 0.02) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.cr},${this.cg},${this.cb},${this.alpha})`;
        ctx.fill();

        // Soft glow for larger particles
        if (this.r > 1.4) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r * 3.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.cr},${this.cg},${this.cb},${this.alpha * 0.08})`;
            ctx.fill();
        }
    }
}

/* ── Build symmetrical orbital particles ────────────────────── */
function buildParticles(cx, cy, baseRadius, isTouch) {
    const particles = [];
    const orbits = isTouch
        ? [
            { r: baseRadius * 0.6,  count: 6  },
            { r: baseRadius * 0.85, count: 10 },
            { r: baseRadius * 1.1,  count: 8  },
        ]
        : [
            { r: baseRadius * 0.45, count: 6  },
            { r: baseRadius * 0.65, count: 10 },
            { r: baseRadius * 0.85, count: 14 },
            { r: baseRadius * 1.05, count: 12 },
            { r: baseRadius * 1.3,  count: 10 },
            { r: baseRadius * 1.6,  count: 8  },
        ];

    orbits.forEach(({ r, count }) => {
        for (let i = 0; i < count; i++) {
            particles.push(new OrbitalParticle(cx, cy, r, i, count));
        }
    });
    return particles;
}

/* ── Subtle connection lines ────────────────────────────────── */
function drawConnections(ctx, particles) {
    const maxDist = 60;
    const maxDistSq = maxDist * maxDist;
    for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        if (a.alpha < 0.1) continue;
        for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];
            if (b.alpha < 0.1) continue;
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dSq = dx * dx + dy * dy;
            if (dSq < maxDistSq) {
                const alpha = (1 - Math.sqrt(dSq) / maxDist) * 0.06;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = `rgba(201,169,110,${alpha})`;
                ctx.lineWidth = 0.4;
                ctx.stroke();
            }
        }
    }
}

/* ── SVG: brand-accurate concentric rings + crosshair ───────── */
function svgMarkup() {
    return `
        <svg class="preloader-svg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="pl-grad-gold" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                    <stop offset="0%"   stop-color="#C9A96E"/>
                    <stop offset="50%"  stop-color="#E8D5A8"/>
                    <stop offset="100%" stop-color="#C9A96E"/>
                </linearGradient>
                <linearGradient id="pl-grad-emerald" x1="0" y1="200" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0%"   stop-color="#3D9B6A"/>
                    <stop offset="50%"  stop-color="#5BC08C"/>
                    <stop offset="100%" stop-color="#3D9B6A"/>
                </linearGradient>
                <filter id="pl-glow-gold" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="blur"/>
                    <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                </filter>
            </defs>

            <!-- Outer ring (draws itself) -->
            <circle class="pl-ring pl-ring-outer" cx="100" cy="100" r="80"
                    stroke="url(#pl-grad-gold)" stroke-width="0.8"
                    stroke-dasharray="502.65" stroke-dashoffset="502.65"
                    opacity="0.6"/>

            <!-- Inner ring (draws itself, opposite direction) -->
            <circle class="pl-ring pl-ring-inner" cx="100" cy="100" r="72"
                    stroke="url(#pl-grad-gold)" stroke-width="0.5"
                    stroke-dasharray="452.39" stroke-dashoffset="-452.39"
                    opacity="0.35"/>

            <!-- Progress arc -->
            <circle class="pl-progress" cx="100" cy="100" r="76"
                    stroke="url(#pl-grad-emerald)" stroke-width="1.5"
                    stroke-linecap="round" filter="url(#pl-glow-gold)"
                    stroke-dasharray="477.52" stroke-dashoffset="477.52"
                    transform="rotate(-90 100 100)"
                    opacity="0.9"/>

            <!-- Crosshair vertical -->
            <line class="pl-cross pl-cross-v" x1="100" y1="12" x2="100" y2="188"
                  stroke="url(#pl-grad-gold)" stroke-width="0.4" opacity="0"/>

            <!-- Crosshair horizontal -->
            <line class="pl-cross pl-cross-h" x1="12" y1="100" x2="188" y2="100"
                  stroke="url(#pl-grad-gold)" stroke-width="0.4" opacity="0"/>

            <!-- Center dot -->
            <circle class="pl-dot" cx="100" cy="100" r="2"
                    fill="#C9A96E" opacity="0"/>

            <!-- 4 cardinal ticks -->
            <line class="pl-tick" x1="100" y1="16" x2="100" y2="24" stroke="#C9A96E" stroke-width="0.6" opacity="0"/>
            <line class="pl-tick" x1="100" y1="176" x2="100" y2="184" stroke="#C9A96E" stroke-width="0.6" opacity="0"/>
            <line class="pl-tick" x1="16" y1="100" x2="24" y2="100" stroke="#C9A96E" stroke-width="0.6" opacity="0"/>
            <line class="pl-tick" x1="176" y1="100" x2="184" y2="100" stroke="#C9A96E" stroke-width="0.6" opacity="0"/>
        </svg>`;
}

/* ── Build full DOM ─────────────────────────────────────────── */
function createDOM() {
    const el = document.createElement('div');
    el.id = 'preloader';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
        <canvas class="preloader-canvas"></canvas>
        <div class="preloader-aurora"></div>
        <div class="preloader-center">
            ${svgMarkup()}
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

/* ── Main ───────────────────────────────────────────────────── */
export function initPreloader() {
    if (sessionStorage.getItem('bj-loaded')) return;
    sessionStorage.setItem('bj-loaded', '1');

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    const el = createDOM();
    document.body.prepend(el);
    document.body.classList.add('is-preloading');

    /* Canvas setup */
    const canvas = el.querySelector('.preloader-canvas');
    const ctx = canvas.getContext('2d');
    let w, h, cx, cy, particles = [];
    let running = true;
    let t = 0;

    /* SVG refs */
    const progressArc = el.querySelector('.pl-progress');
    const fillBar = el.querySelector('.preloader-progress-fill');
    const PROGRESS_CIRC = 477.52;
    let progress = 0;

    function resize() {
        w = canvas.width = el.offsetWidth;
        h = canvas.height = el.offsetHeight;
        cx = w / 2;
        cy = h / 2;
        const baseR = Math.min(w, h) * 0.12;
        particles = buildParticles(cx, cy, baseR, isTouch);
    }

    function updateProgress(p) {
        progress = Math.min(p, 1);
        progressArc.style.strokeDashoffset = PROGRESS_CIRC * (1 - progress);
        fillBar.style.transform = `scaleX(${progress})`;
    }

    function loop() {
        if (!running) return;
        t += 16;
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => { p.update(t); p.draw(ctx); });
        drawConnections(ctx, particles);
        requestAnimationFrame(loop);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    if (!reducedMotion) {
        loop();
    }

    /* ── SVG entrance animation ────────────────────────────────── */
    const entranceTl = gsap.timeline();

    // Rings draw in
    entranceTl.to('.pl-ring-outer', {
        strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut'
    }, 0);
    entranceTl.to('.pl-ring-inner', {
        strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut'
    }, 0.15);

    // Crosshairs fade in and extend
    entranceTl.to('.pl-cross-v', {
        opacity: 0.15, duration: 0.6, ease: 'power2.out'
    }, 0.5);
    entranceTl.to('.pl-cross-h', {
        opacity: 0.15, duration: 0.6, ease: 'power2.out'
    }, 0.6);

    // Center dot
    entranceTl.to('.pl-dot', {
        opacity: 0.8, duration: 0.4, ease: 'power2.out'
    }, 0.7);

    // Cardinal ticks
    entranceTl.to('.pl-tick', {
        opacity: 0.4, duration: 0.4, ease: 'power2.out', stagger: 0.06
    }, 0.65);

    // Text entrance
    entranceTl.fromTo('.preloader-brand',
        { opacity: 0, y: 10, letterSpacing: '0.6em' },
        { opacity: 1, y: 0, letterSpacing: '0.35em', duration: 0.7, ease: 'power2.out' },
        0.6
    );
    entranceTl.fromTo('.preloader-sub',
        { opacity: 0, y: 6 },
        { opacity: 0.5, y: 0, duration: 0.5, ease: 'power2.out' },
        0.8
    );

    // Progress line
    entranceTl.fromTo('.preloader-progress-line',
        { opacity: 0, scaleX: 0.3 },
        { opacity: 1, scaleX: 1, duration: 0.5, ease: 'power2.out' },
        0.9
    );

    // Slow rotation of outer ring
    if (!reducedMotion) {
        gsap.to('.pl-ring-outer', {
            rotation: 360, duration: 30, repeat: -1, ease: 'none',
            transformOrigin: '100px 100px'
        });
        gsap.to('.pl-ring-inner', {
            rotation: -360, duration: 40, repeat: -1, ease: 'none',
            transformOrigin: '100px 100px'
        });
    }

    /* ── Progress tracking ─────────────────────────────────────── */
    const startTime = Date.now();
    /* Reduced from 1800 → 350ms — Claude Design loads "instantly".
       Long preloader was the main cause of perceived load jank. */
    const minMs = 350;

    const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const fake = 1 - Math.exp(-elapsed / 1200);
        updateProgress(Math.min(fake, 0.88));
    }, 30);

    /* ── Hide ──────────────────────────────────────────────────── */
    function hide() {
        const elapsed = Date.now() - startTime;
        const wait = Math.max(0, minMs - elapsed);

        setTimeout(() => {
            clearInterval(progressInterval);

            // Complete progress to 100%
            const completeTl = gsap.timeline();
            completeTl.to({}, {
                duration: 0.35,
                onUpdate() { updateProgress(progress + (1 - progress) * this.progress()); }
            });

            // Exit animation — fast fade-out (was 0.3s delay + ~1.2s exit, now 0.05s + ~0.5s)
            const exitTl = gsap.timeline({
                delay: 0.05,
                onComplete() {
                    running = false;
                    ro.disconnect();
                    el.remove();
                    document.body.classList.remove('is-preloading');
                    // Signal to hero animation and other systems that preloader is done
                    window.dispatchEvent(new CustomEvent('bj:preloader-done'));
                }
            });

            // Single fast crossfade — feels instant on subsequent reveals
            exitTl.to(el, { opacity: 0, duration: 0.35, ease: 'power2.out' }, 0);
        }, wait);
    }

    if (document.readyState === 'complete') {
        hide();
    } else {
        window.addEventListener('load', hide, { once: true });
    }

    // Safety fallback: ensure body scroll is never permanently locked
    setTimeout(() => {
        document.body.classList.remove('is-preloading');
    }, 6000);
}
