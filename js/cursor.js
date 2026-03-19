/**
 * Bersaglio Jewelry — Cursor de Precisión Premium
 *
 *  · Dot central  → sigue el ratón; círculo → diamante en hover
 *  · Anillo       → sigue con lag magnético; se expande en hover
 *  · Partículas   → trail de oro en movimiento
 *  · Burst        → anillo expansivo al hacer clic
 *
 *  Activación: solo tras el primer evento mousemove real
 *  (funciona en cualquier dispositivo sin depender de media queries)
 */
(function () {
    'use strict';

    // Evitar doble ejecución
    if (document.getElementById('bj-dot-wrap')) return;

    function boot() {

        /* ── Crear elementos ─────────────────────────────────── */
        var dotWrap = document.createElement('div');
        dotWrap.id = 'bj-dot-wrap';
        dotWrap.setAttribute('aria-hidden', 'true');
        document.body.appendChild(dotWrap);

        var dot = document.createElement('div');
        dot.className = 'bj-dot';
        dotWrap.appendChild(dot);

        var ring = document.createElement('div');
        ring.id = 'bj-ring';
        ring.setAttribute('aria-hidden', 'true');
        document.body.appendChild(ring);

        /* ── Estado ──────────────────────────────────────────── */
        var mx = -300, my = -300;
        var rx = -300, ry = -300;
        var active = false;
        var lastPx = 0, lastPy = 0, lastT = 0;

        /* ── Activación en primer mousemove ──────────────────── */
        function onFirstMove(e) {
            // Verificar que es un mouse real (no un evento de touch simulado)
            if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;

            active = true;
            mx = rx = e.clientX;
            my = ry = e.clientY;

            // Mostrar cursor y ocultar el nativo
            document.documentElement.classList.add('bj-cursor-ready');
            dotWrap.style.opacity = '';
            ring.style.opacity    = '';

            document.removeEventListener('mousemove', onFirstMove);
            document.addEventListener('mousemove', onMove, { passive: true });
        }

        function onMove(e) {
            mx = e.clientX;
            my = e.clientY;
            sparkle(mx, my);
        }

        document.addEventListener('mousemove', onFirstMove);

        /* ── Visibilidad al salir/entrar del documento ───────── */
        document.addEventListener('mouseleave', function () {
            if (!active) return;
            dotWrap.style.opacity = '0';
            ring.style.opacity    = '0';
        });
        document.addEventListener('mouseenter', function () {
            if (!active) return;
            dotWrap.style.opacity = '';
            ring.style.opacity    = '';
        });

        /* ── Hover ───────────────────────────────────────────── */
        var SEL = 'a,button,[role="button"],input,select,textarea,label,summary,.piece-card,.collection-panel,[tabindex]';
        document.addEventListener('mouseover', function (e) {
            if (!active) return;
            var on = !!e.target.closest(SEL);
            dot.classList.toggle('is-hover', on);
            ring.classList.toggle('is-hover', on);
        });

        /* ── Press ───────────────────────────────────────────── */
        document.addEventListener('mousedown', function () {
            if (!active) return;
            dot.classList.add('is-down');
            ring.classList.add('is-down');
        });
        document.addEventListener('mouseup', function () {
            dot.classList.remove('is-down');
            ring.classList.remove('is-down');
        });

        /* ── Click burst ─────────────────────────────────────── */
        document.addEventListener('click', function (e) {
            if (!active) return;
            var b = document.createElement('div');
            b.className = 'bj-burst';
            b.style.left = e.clientX + 'px';
            b.style.top  = e.clientY + 'px';
            document.body.appendChild(b);
            setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 700);
        });

        /* ── Loop de animación ───────────────────────────────── */
        var EASE = 0.095;
        (function tick() {
            if (active) {
                rx += (mx - rx) * EASE;
                ry += (my - ry) * EASE;
                dotWrap.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
                ring.style.transform    = 'translate(' + rx + 'px,' + ry + 'px)';
            }
            requestAnimationFrame(tick);
        })();

        /* ── Partículas de oro ───────────────────────────────── */
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
                s.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + sz + 'px;height:' + sz + 'px;--a:' + ang + 'deg;--d:' + dst + 'px;animation-duration:' + dur + 'ms';
                document.body.appendChild(s);
                setTimeout(function (el) { if (el.parentNode) el.parentNode.removeChild(el); }, dur + 60, s);
            }
        }

        /* ── Cursor de espera en navegación interna ──────────── */
        var loadStyle = null;
        document.addEventListener('click', function (e) {
            if (!active) return;
            var a = e.target.closest('a[href]');
            if (!a) return;
            var h = a.getAttribute('href') || '';
            if (h && !h.startsWith('#') && !h.startsWith('tel:') && !h.startsWith('mailto:') && a.target !== '_blank') {
                if (!loadStyle) { loadStyle = document.createElement('style'); document.head.appendChild(loadStyle); }
                loadStyle.textContent = '* { cursor: wait !important; } #bj-dot-wrap, #bj-ring { opacity:0 !important; }';
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
