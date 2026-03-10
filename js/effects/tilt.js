/**
 * Bersaglio Jewelry — 3D Tilt + Shine Effect
 * Applies to piece cards and collection panels on desktop.
 * VanillaTilt-style using requestAnimationFrame for smooth spring.
 */

const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

function bindTilt(el) {
    if (el.dataset.tiltBound || isTouch) return;
    el.dataset.tiltBound = '1';

    // Shine overlay
    const shine = document.createElement('div');
    shine.className = 'tilt-shine';
    el.appendChild(shine);

    const MAX_TILT = el.classList.contains('collection-panel') ? 8 : 12;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let raf = null;
    let inside = false;

    el.addEventListener('mouseenter', () => { inside = true; });

    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;

        targetX = y * -MAX_TILT;
        targetY = x *  MAX_TILT;

        // Shine gradient follows cursor
        const px = ((e.clientX - rect.left) / rect.width)  * 100;
        const py = ((e.clientY - rect.top)  / rect.height) * 100;
        shine.style.background =
            `radial-gradient(circle at ${px}% ${py}%, rgba(201,169,110,0.13) 0%, rgba(201,169,110,0.04) 35%, transparent 65%)`;

        if (!raf) loop();
    }, { passive: true });

    el.addEventListener('mouseleave', () => {
        inside  = false;
        targetX = 0;
        targetY = 0;
        shine.style.background = 'none';
        if (!raf) loop();
    });

    function loop() {
        currentX += (targetX - currentX) * 0.1;
        currentY += (targetY - currentY) * 0.1;

        el.style.transform =
            `perspective(900px) rotateX(${currentX.toFixed(3)}deg) rotateY(${currentY.toFixed(3)}deg)`;

        const done = Math.abs(targetX - currentX) < 0.015 &&
                     Math.abs(targetY - currentY) < 0.015;

        if (done && !inside) {
            el.style.transform = '';
            raf = null;
        } else {
            raf = requestAnimationFrame(loop);
        }
    }
}

export function initTilt(selector = '.piece-card, .collection-panel') {
    if (isTouch) return;

    document.querySelectorAll(selector).forEach(bindTilt);

    // Watch for dynamically added elements (piece cards render after DB load)
    const observer = new MutationObserver(() => {
        document.querySelectorAll(selector).forEach(bindTilt);
    });
    observer.observe(document.body, { childList: true, subtree: true });
}
