/**
 * Bersaglio Jewelry — Cursor de Precisión
 *
 *  · Dot central  → sigue el ratón; círculo → diamante en hover
 *  · Anillo       → sigue con lag magnético; se expande en hover
 *  · Partículas   → trail de oro en movimiento
 *  · Burst        → anillo expansivo al hacer clic
 */
(function () {
    'use strict';

    // Solo dispositivos de puntero fino
    if (!window.matchMedia || window.matchMedia('(pointer: coarse)').matches) return;

    // Evitar doble ejecución
    if (document.getElementById('bj-dot-wrap')) return;

    function boot() {
        /* ── Crear elementos ─────────────────────────────────── */
        var dotWrap = document.createElement('div');
        dotWrap.id = 'bj-dot-wrap';
        document.body.appendChild(dotWrap);

        var dot = document.createElement('div');
        dot.className = 'bj-dot';
        dotWrap.appendChild(dot);

        var ring = document.createElement('div');
        ring.id = 'bj-ring';
        document.body.appendChild(ring);

        // Confirmar al CSS que el cursor custom existe
        document.documentElement.classList.add('bj-cursor-ready');

        /* ── Estado ──────────────────────────────────────────── */
        var mx = -200, my = -200;
        var rx = -200, ry = -200;
        var lastPx = 0, lastPy = 0, lastT = 0;

        /* ── Seguimiento del ratón ───────────────────────────── */
        document.addEventListener('mousemove', function (e) {
            mx = e.clientX;
            my = e.clientY;
            sparkle(mx, my);
        });

        document.addEventListener('mouseleave', function () {
            dotWrap.style.opacity = '0';
            ring.style.opacity    = '0';
        });
        document.addEventListener('mouseenter', function () {
            dotWrap.style.opacity = '';
            ring.style.opacity    = '';
        });

        /* ── Hover ───────────────────────────────────────────── */
        var SEL = 'a,button,[role="button"],input,select,textarea,label,summary,.piece-card,.collection-panel,[tabindex]';
        document.addEventListener('mouseover', function (e) {
            var on = !!e.target.closest(SEL);
            dot.classList.toggle('is-hover', on);
            ring.classList.toggle('is-hover', on);
        });

        /* ── Press ───────────────────────────────────────────── */
        document.addEventListener('mousedown', function () {
            dot.classList.add('is-down');
            ring.classList.add('is-down');
        });
        document.addEventListener('mouseup', function () {
            dot.classList.remove('is-down');
            ring.classList.remove('is-down');
        });

        /* ── Click burst ─────────────────────────────────────── */
        document.addEventListener('click', function (e) {
            var b = document.createElement('div');
            b.className = 'bj-burst';
            b.style.left = e.clientX + 'px';
            b.style.top  = e.clientY + 'px';
            document.body.appendChild(b);
            setTimeout(function () { b.remove(); }, 700);
        });

        /* ── Loop de animación ───────────────────────────────── */
        var EASE = 0.095;
        (function tick() {
            rx += (mx - rx) * EASE;
            ry += (my - ry) * EASE;
            dotWrap.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
            ring.style.transform    = 'translate(' + rx + 'px,' + ry + 'px)';
            requestAnimationFrame(tick);
        })();

        /* ── Partículas ──────────────────────────────────────── */
        function sparkle(x, y) {
            var now = Date.now();
            if (now - lastT < 40) return;
            var dx = x - lastPx, dy = y - lastPy;
            if (dx * dx + dy * dy < 100) return;
            lastT = now; lastPx = x; lastPy = y;

            for (var i = 0; i < 2; i++) {
                var s    = document.createElement('div');
                s.className = 'bj-sparkle';
                var sz   = (2 + Math.random() * 2.5).toFixed(1);
                var ang  = Math.floor(Math.random() * 360);
                var dist = (5 + Math.random() * 12).toFixed(1);
                var dur  = Math.floor(380 + Math.random() * 320);
                s.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + sz + 'px;height:' + sz + 'px;--a:' + ang + 'deg;--d:' + dist + 'px;animation-duration:' + dur + 'ms';
                document.body.appendChild(s);
                setTimeout(s.remove.bind(s), dur + 60);
            }
        }

        /* ── Cursor de carga (navegación interna) ────────────── */
        var loadStyle = null;
        document.addEventListener('click', function (e) {
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

    // Ejecutar cuando body esté disponible
    if (document.body) {
        boot();
    } else {
        document.addEventListener('DOMContentLoaded', boot);
    }

}());
