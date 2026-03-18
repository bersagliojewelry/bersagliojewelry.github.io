/**
 * Bersaglio Jewelry — Page Transitions v3
 * Premium inter-page transitions matching the preloader's visual language.
 *   • Concentric rings + crosshair SVG (brand-consistent)
 *   • Canvas orbital particles during transition
 *   • Clip-path panel reveal
 *   • Pure GSAP — zero flicker
 */

import { gsap } from './gsap-core.js';

/* ── Orbital particles for transition canvas ────────────────── */
class TransitParticle {
    constructor(cx, cy, orbit, i, total) {
        this.cx = cx;
        this.cy = cy;
        this.orbit = orbit;
        this.angle = (i / total) * Math.PI * 2;
        this.speed = (0.001 + Math.random() * 0.001) * (Math.random() > 0.5 ? 1 : -1);
        this.r = Math.random() * 1.6 + 0.4;
        const p = Math.random();
        this.cr = p < 0.5 ? 201 : 61;
        this.cg = p < 0.5 ? 169 : 155;
        this.cb = p < 0.5 ? 110 : 106;
        this.baseAlpha = 0.2 + Math.random() * 0.45;
        this.phase = Math.random() * Math.PI * 2;
    }
    update(t) {
        const a = this.angle + t * this.speed;
        this.x = this.cx + Math.cos(a) * this.orbit;
        this.y = this.cy + Math.sin(a) * this.orbit;
        this.alpha = this.baseAlpha * (0.6 + 0.4 * Math.sin(t * 0.002 + this.phase));
    }
    draw(ctx) {
        if (this.alpha < 0.02) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.cr},${this.cg},${this.cb},${this.alpha})`;
        ctx.fill();
        if (this.r > 1.2) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.cr},${this.cg},${this.cb},${this.alpha * 0.06})`;
            ctx.fill();
        }
    }
}

function buildTransitParticles(cx, cy) {
    const particles = [];
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const orbits = isTouch
        ? [{ r: 30, n: 5 }, { r: 50, n: 8 }, { r: 70, n: 6 }]
        : [{ r: 25, n: 5 }, { r: 40, n: 8 }, { r: 55, n: 10 }, { r: 72, n: 8 }, { r: 90, n: 6 }];
    orbits.forEach(({ r, n }) => {
        for (let i = 0; i < n; i++) particles.push(new TransitParticle(cx, cy, r, i, n));
    });
    return particles;
}

/* ── Canvas particle loop ───────────────────────────────────── */
function startParticleLoop(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const particles = buildTransitParticles(cx, cy);
    let running = true;
    let t = 0;

    function loop() {
        if (!running) return;
        t += 16;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(t); p.draw(ctx); });
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    return () => { running = false; };
}

/* ── Build overlay DOM ──────────────────────────────────────── */
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
            <svg class="pt-svg" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="pt-grad" x1="0" y1="0" x2="160" y2="160" gradientUnits="userSpaceOnUse">
                        <stop offset="0%"   stop-color="#C9A96E"/>
                        <stop offset="50%"  stop-color="#E8D5A8"/>
                        <stop offset="100%" stop-color="#C9A96E"/>
                    </linearGradient>
                    <filter id="pt-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="1.5" result="blur"/>
                        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                    </filter>
                </defs>

                <!-- Outer ring -->
                <circle class="pt-ring-outer" cx="80" cy="80" r="60"
                        stroke="url(#pt-grad)" stroke-width="0.7"
                        stroke-dasharray="376.99" stroke-dashoffset="376.99"
                        opacity="0.5"/>

                <!-- Inner ring -->
                <circle class="pt-ring-inner" cx="80" cy="80" r="54"
                        stroke="url(#pt-grad)" stroke-width="0.4"
                        stroke-dasharray="339.29" stroke-dashoffset="-339.29"
                        opacity="0.3"/>

                <!-- Spinning arc -->
                <circle class="pt-arc" cx="80" cy="80" r="57"
                        stroke="#3D9B6A" stroke-width="1.2"
                        stroke-linecap="round" filter="url(#pt-glow)"
                        stroke-dasharray="90 268.19"
                        transform="rotate(-90 80 80)"
                        opacity="0.7"/>

                <!-- Crosshair -->
                <line class="pt-cross" x1="80" y1="14" x2="80" y2="146"
                      stroke="url(#pt-grad)" stroke-width="0.3" opacity="0"/>
                <line class="pt-cross" x1="14" y1="80" x2="146" y2="80"
                      stroke="url(#pt-grad)" stroke-width="0.3" opacity="0"/>

                <!-- Center dot -->
                <circle class="pt-dot" cx="80" cy="80" r="1.5"
                        fill="#C9A96E" opacity="0"/>

                <!-- Cardinal ticks -->
                <line class="pt-tick" x1="80" y1="16" x2="80" y2="22" stroke="#C9A96E" stroke-width="0.5" opacity="0"/>
                <line class="pt-tick" x1="80" y1="138" x2="80" y2="144" stroke="#C9A96E" stroke-width="0.5" opacity="0"/>
                <line class="pt-tick" x1="16" y1="80" x2="22" y2="80" stroke="#C9A96E" stroke-width="0.5" opacity="0"/>
                <line class="pt-tick" x1="138" y1="80" x2="144" y2="80" stroke="#C9A96E" stroke-width="0.5" opacity="0"/>
            </svg>
            <span class="pt-label">BERSAGLIO</span>
        </div>
    `;
    document.body.appendChild(el);
    return el;
}

/* ── Animate enter (page just loaded from transition) ───────── */
function animateEnter(overlay) {
    const panel  = overlay.querySelector('.pt-panel');
    const center = overlay.querySelector('.pt-center');
    const canvas = overlay.querySelector('.pt-canvas');
    const arc    = overlay.querySelector('.pt-arc');
    const outerR = overlay.querySelector('.pt-ring-outer');
    const innerR = overlay.querySelector('.pt-ring-inner');
    const crosses = overlay.querySelectorAll('.pt-cross');
    const dot    = overlay.querySelector('.pt-dot');
    const ticks  = overlay.querySelectorAll('.pt-tick');

    gsap.set(overlay, { display: 'flex', pointerEvents: 'none' });
    gsap.set(panel, { clipPath: 'inset(0% 0% 0% 0%)' });
    gsap.set(center, { opacity: 1, scale: 1 });
    gsap.set(outerR, { strokeDashoffset: 0 });
    gsap.set(innerR, { strokeDashoffset: 0 });
    gsap.set(crosses, { opacity: 0.15 });
    gsap.set(dot, { opacity: 0.7 });
    gsap.set(ticks, { opacity: 0.35 });

    const spinTween = gsap.to(arc, {
        rotation: 360, duration: 1.5, repeat: -1, ease: 'none',
        transformOrigin: '80px 80px'
    });

    const stopParticles = startParticleLoop(canvas);

    const tl = gsap.timeline({
        onComplete() {
            spinTween.kill();
            stopParticles();
            gsap.set(overlay, { display: 'none' });
            // Reset for next use
            gsap.set(panel, { clipPath: 'inset(100% 0% 0% 0%)' });
            gsap.set(center, { opacity: 0, scale: 0.9 });
            gsap.set(outerR, { strokeDashoffset: 376.99 });
            gsap.set(innerR, { strokeDashoffset: -339.29 });
            gsap.set(crosses, { opacity: 0 });
            gsap.set(dot, { opacity: 0 });
            gsap.set(ticks, { opacity: 0 });
        },
    });

    tl.to(center, { opacity: 0, scale: 1.1, duration: 0.35, ease: 'power2.in', delay: 0.25 })
      .to(canvas, { opacity: 0, duration: 0.3, ease: 'power2.in' }, '-=0.2')
      .to(panel, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.65, ease: 'power4.inOut' }, '-=0.15');
}

/* ── Animate exit (navigating away) ─────────────────────────── */
function animateExit(overlay, href) {
    const panel  = overlay.querySelector('.pt-panel');
    const center = overlay.querySelector('.pt-center');
    const canvas = overlay.querySelector('.pt-canvas');
    const arc    = overlay.querySelector('.pt-arc');
    const outerR = overlay.querySelector('.pt-ring-outer');
    const innerR = overlay.querySelector('.pt-ring-inner');
    const crosses = overlay.querySelectorAll('.pt-cross');
    const dot    = overlay.querySelector('.pt-dot');
    const ticks  = overlay.querySelectorAll('.pt-tick');
    const label  = overlay.querySelector('.pt-label');

    gsap.set(overlay, { display: 'flex', pointerEvents: 'all' });
    gsap.set(panel, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(center, { opacity: 0, scale: 0.85 });
    gsap.set(outerR, { strokeDashoffset: 376.99 });
    gsap.set(innerR, { strokeDashoffset: -339.29 });
    gsap.set(crosses, { opacity: 0 });
    gsap.set(dot, { opacity: 0 });
    gsap.set(ticks, { opacity: 0 });
    gsap.set(label, { opacity: 0 });

    const spinTween = gsap.to(arc, {
        rotation: 360, duration: 1.5, repeat: -1, ease: 'none',
        transformOrigin: '80px 80px'
    });

    const stopParticles = startParticleLoop(canvas);

    const tl = gsap.timeline({
        onComplete() {
            spinTween.kill();
            stopParticles();
            window.location.href = href;
        },
    });

    // Panel reveals
    tl.to(panel, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'power4.inOut' });

    // Center fades in
    tl.to(center, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }, '-=0.2');

    // Rings draw in
    tl.to(outerR, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' }, '-=0.15');
    tl.to(innerR, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut' }, '-=0.45');

    // Crosshairs + dot + ticks
    tl.to(crosses, { opacity: 0.15, duration: 0.3 }, '-=0.3');
    tl.to(dot, { opacity: 0.7, duration: 0.25 }, '-=0.25');
    tl.to(ticks, { opacity: 0.35, duration: 0.2, stagger: 0.03 }, '-=0.2');

    // Label
    tl.to(label, { opacity: 0.7, duration: 0.3 }, '-=0.15');
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
