/**
 * Bersaglio Jewelry — Cursor de Precisión Premium v2
 *
 * CORRECCIONES vs v1:
 *  · Usa Pointer Events API (pointermove + pointerType:'mouse') en vez de
 *    mousemove + sourceCapabilities (que en Windows con touchscreen era true
 *    incluso con ratón físico → bloqueaba toda activación)
 *  · Inyecta cursor:none INMEDIATAMENTE via <style> (no espera mousemove)
 *  · matchMedia (pointer:fine)|(any-pointer:fine) — sale en touch-only
 *  · Elementos iniciados en translate(-9999px) — sin flash en esquina 0,0
 *  · translate3d para aceleración GPU en el loop de animación
 *  · Limpieza automática si el primer evento real es touchstart
 */
(function () {
    'use strict';

    /* ── Guard: doble ejecución ──────────────────────────────── */
    if (document.getElementById('bj-dot-wrap')) return;

    /* ── Guard: solo dispositivos con mouse fino ─────────────── */
    var mq = window.matchMedia;
    if (!mq) return;                                    // browser muy antiguo
    if (!mq('(pointer: fine)').matches && !mq('(any-pointer: fine)').matches) return;

    /* ── Boot (puede llamarse ahora o en DOMContentLoaded) ───── */
    function boot() {

        /* ── 1. Inyectar cursor:none inmediatamente ─────────── */
        var hideStyle = document.createElement('style');
        hideStyle.id  = 'bj-cursor-hide';
        hideStyle.textContent = '*, *::before, *::after { cursor: none !important; }';
        document.head.appendChild(hideStyle);

        /* ── 2. Crear elementos del cursor ───────────────────── */
        var dotWrap = document.createElement('div');
        dotWrap.id  = 'bj-dot-wrap';
        dotWrap.setAttribute('aria-hidden', 'true');
        dotWrap.style.cssText = 'opacity:0;transform:translate3d(-9999px,-9999px,0)';
        document.body.appendChild(dotWrap);

        var dot = document.createElement('div');
        dot.className = 'bj-dot';
        dotWrap.appendChild(dot);

        var ring = document.createElement('div');
        ring.id  = 'bj-ring';
        ring.setAttribute('aria-hidden', 'true');
        ring.style.transform = 'translate3d(-9999px,-9999px,0)';
        document.body.appendChild(ring);

        /* ── 3. Estado ───────────────────────────────────────── */
        var mx = -9999, my = -9999;
        var rx = -9999, ry = -9999;
        var active    = false;
        var lastPx    = 0, lastPy = 0, lastT = 0;

        /* ── 4. Función de activación (primera vez) ──────────── */
        function activate(x, y) {
            if (active) return;
            active = true;
            mx = rx = x;
            my = ry = y;
            dotWrap.style.opacity = '1';
            document.documentElement.classList.add('bj-cursor-ready');
        }

        /* ── 5. Pointer Events (API moderna, confiable) ──────── */
        document.addEventListener('pointermove', function (e) {
            if (e.pointerType !== 'mouse') return;   // ignorar stylus/touch
            if (!active) activate(e.clientX, e.clientY);
            mx = e.clientX;
            my = e.clientY;
            sparkle(mx, my);
        }, { passive: true });

        /* ── 6. Fallback: mousemove para IE/Edge Legacy ──────── */
        if (!window.PointerEvent) {
            document.addEventListener('mousemove', function (e) {
                if (!active) activate(e.clientX, e.clientY);
                mx = e.clientX;
                my = e.clientY;
                sparkle(mx, my);
            }, { passive: true });
        }

        /* ── 7. Si el primer evento real es touch → limpiar ──── */
        document.addEventListener('touchstart', function () {
            if (active) return;                      // ya confirmado como mouse
            hideStyle.parentNode  && hideStyle.parentNode.removeChild(hideStyle);
            dotWrap.parentNode    && dotWrap.parentNode.removeChild(dotWrap);
            ring.parentNode       && ring.parentNode.removeChild(ring);
        }, { once: true, passive: true });

        /* ── 8. Visibilidad al salir/entrar del documento ────── */
        document.addEventListener('mouseleave', function () {
            if (!active) return;
            dotWrap.style.opacity = '0';
            ring.style.opacity    = '0';
        });
        document.addEventListener('mouseenter', function () {
            if (!active) return;
            dotWrap.style.opacity = '1';
            ring.style.opacity    = '';
        });

        /* ── 9. Hover sobre elementos interactivos ───────────── */
        var SEL = 'a,button,[role="button"],input,select,textarea,label,summary,.piece-card,.collection-panel,[tabindex]';
        document.addEventListener('mouseover', function (e) {
            if (!active) return;
            var on = !!e.target.closest(SEL);
            dot.classList.toggle('is-hover', on);
            ring.classList.toggle('is-hover', on);
        });

        /* ── 10. Press ───────────────────────────────────────── */
        document.addEventListener('mousedown', function () {
            if (!active) return;
            dot.classList.add('is-down');
            ring.classList.add('is-down');
        });
        document.addEventListener('mouseup', function () {
            dot.classList.remove('is-down');
            ring.classList.remove('is-down');
        });

        /* ── 11. Click burst ─────────────────────────────────── */
        document.addEventListener('click', function (e) {
            if (!active) return;
            var b = document.createElement('div');
            b.className = 'bj-burst';
            b.style.left = e.clientX + 'px';
            b.style.top  = e.clientY + 'px';
            document.body.appendChild(b);
            setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 700);
        });

        /* ── 12. Loop de animación con GPU (translate3d) ─────── */
        var EASE = 0.095;
        (function tick() {
            if (active) {
                rx += (mx - rx) * EASE;
                ry += (my - ry) * EASE;
                dotWrap.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
                ring.style.transform    = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
            }
            requestAnimationFrame(tick);
        })();

        /* ── 13. Partículas de oro ───────────────────────────── */
        function sparkle(x, y) {
            var now = Date.now();
            if (now - lastT < 40) return;
            var dx = x - lastPx, dy = y - lastPy;
            if (dx * dx + dy * dy < 100) return;
            lastT = now; lastPx = x; lastPy = y;

            for (var i = 0; i < 2; i++) {
                var s   = document.createElement('div');
                s.className = 'bj-sparkle';
                var sz  = (2 + Math.random() * 2.5).toFixed(1);
                var ang = Math.floor(Math.random() * 360);
                var dst = (5 + Math.random() * 12).toFixed(1);
                var dur = Math.floor(380 + Math.random() * 320);
                s.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + sz +
                    'px;height:' + sz + 'px;--a:' + ang + 'deg;--d:' + dst +
                    'px;animation-duration:' + dur + 'ms';
                document.body.appendChild(s);
                setTimeout(function (el) {
                    if (el.parentNode) el.parentNode.removeChild(el);
                }, dur + 60, s);
            }
        }

        /* ── 14. Cursor de espera en navegación interna ──────── */
        var loadStyle = null;
        document.addEventListener('click', function (e) {
            if (!active) return;
            var a = e.target.closest('a[href]');
            if (!a) return;
            var h = a.getAttribute('href') || '';
            if (h && !h.startsWith('#') && !h.startsWith('tel:') &&
                !h.startsWith('mailto:') && a.target !== '_blank') {
                if (!loadStyle) {
                    loadStyle = document.createElement('style');
                    document.head.appendChild(loadStyle);
                }
                loadStyle.textContent = '#bj-dot-wrap, #bj-ring { opacity:0 !important; }';
            }
        });
        window.addEventListener('pageshow', function () {
            if (loadStyle) loadStyle.textContent = '';
        });
    }

    /* ── Punto de entrada ────────────────────────────────────── */
    if (document.body) {
        boot();
    } else {
        document.addEventListener('DOMContentLoaded', boot);
    }

}());
