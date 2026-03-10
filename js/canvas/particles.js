/**
 * Bersaglio Jewelry — Hero Particle Canvas
 * Two particle types:
 *   • Dust  — tiny circles (emerald glow + gold), brownian drift + mouse repulsion
 *   • Gems  — hexagon outlines (gold), slow orbital rotation
 * Runs fully off the main thread via requestAnimationFrame.
 * Respects prefers-reduced-motion.
 */

const EMERALD = 'rgba(61,155,106,';
const GOLD    = 'rgba(201,169,110,';

function hexPath(ctx, x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const px = x + r * Math.cos(a);
        const py = y + r * Math.sin(a);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
}

class Particle {
    constructor(w, h, type) {
        this.type   = type; // 'dust' | 'gem'
        this.w      = w;
        this.h      = h;
        this.reset(true);
    }

    reset(init = false) {
        this.x  = Math.random() * this.w;
        this.y  = init ? Math.random() * this.h : this.h + 10;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = -(Math.random() * 0.4 + 0.1);

        if (this.type === 'dust') {
            this.r       = Math.random() * 1.8 + 0.4;
            this.color   = Math.random() > 0.55 ? EMERALD : GOLD;
            this.opacity = Math.random() * 0.45 + 0.15;
            this.life    = 1;
            this.decay   = Math.random() * 0.0008 + 0.0003;
        } else {
            this.r       = Math.random() * 4 + 3;
            this.color   = GOLD;
            this.opacity = Math.random() * 0.25 + 0.08;
            this.life    = 1;
            this.decay   = Math.random() * 0.0004 + 0.0001;
            this.rot     = Math.random() * Math.PI * 2;
            this.rotV    = (Math.random() - 0.5) * 0.005;
        }
    }

    update(mx, my) {
        // Mouse repulsion (only dust)
        if (this.type === 'dust' && mx !== null) {
            const dx = this.x - mx;
            const dy = this.y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                const force = (120 - dist) / 120 * 0.6;
                this.vx += (dx / dist) * force;
                this.vy += (dy / dist) * force;
            }
        }

        // Drag
        this.vx *= 0.98;
        this.vy *= 0.98;

        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;

        if (this.type === 'gem') this.rot += this.rotV;

        if (this.life <= 0 || this.y < -20) this.reset();
    }

    draw(ctx) {
        const alpha = this.life * this.opacity;
        ctx.globalAlpha = alpha;

        if (this.type === 'dust') {
            ctx.fillStyle = this.color + alpha + ')';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rot);
            ctx.strokeStyle = this.color + alpha + ')';
            ctx.lineWidth   = 0.6;
            hexPath(ctx, 0, 0, this.r);
            ctx.stroke();
            ctx.restore();
        }

        ctx.globalAlpha = 1;
    }
}

export function initParticles(container) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    const canvas = document.createElement('canvas');
    canvas.className = 'hero-canvas';
    container.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let w, h, particles;
    let mx = null, my = null;
    let raf = null;
    let running = true;

    const DUST_COUNT = isTouch ? 30 : 55;
    const GEM_COUNT  = isTouch ? 6  : 14;

    function resize() {
        w = canvas.width  = container.offsetWidth;
        h = canvas.height = container.offsetHeight;
        if (particles) particles.forEach(p => { p.w = w; p.h = h; });
    }

    function build() {
        particles = [
            ...Array.from({ length: DUST_COUNT }, () => new Particle(w, h, 'dust')),
            ...Array.from({ length: GEM_COUNT  }, () => new Particle(w, h, 'gem')),
        ];
    }

    function loop() {
        if (!running) return;
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => { p.update(mx, my); p.draw(ctx); });
        raf = requestAnimationFrame(loop);
    }

    // Mouse tracking (desktop only)
    if (!isTouch) {
        container.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            mx = e.clientX - rect.left;
            my = e.clientY - rect.top;
        }, { passive: true });

        container.addEventListener('mouseleave', () => { mx = null; my = null; });
    }

    // Pause when not visible
    const observer = new IntersectionObserver(([entry]) => {
        running = entry.isIntersecting;
        if (running) loop();
        else cancelAnimationFrame(raf);
    }, { threshold: 0 });

    observer.observe(canvas);

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    resize();
    build();
    loop();
}
