/**
 * Bersaglio Jewelry — Cursor Premium v4
 * "El Engaste"
 *
 * SIN inyección de estilos. cursor:none lo aplica style.css directamente
 * via @media (hover:hover) and (pointer:fine) — activo desde el primer
 * parseo del CSS, antes de que cualquier JS se ejecute.
 *
 * Este script SOLO crea los elementos visuales y los anima.
 */
(function () {
    'use strict';

    if (document.getElementById('bj-dot')) return;

    function boot() {

        /* ── Crear elementos ── */
        var dot = document.createElement('div');
        dot.id = 'bj-dot';
        dot.setAttribute('aria-hidden', 'true');

        var gem = document.createElement('div');
        gem.className = 'bj-gem';
        dot.appendChild(gem);

        var ring = document.createElement('div');
        ring.id = 'bj-ring';
        ring.setAttribute('aria-hidden', 'true');

        document.body.appendChild(dot);
        document.body.appendChild(ring);

        /* ── Estado ── */
        var mx = -9999, my = -9999;
        var rx = -9999, ry = -9999;
        var live = false;
        var lastT = 0, lastX = 0, lastY = 0;

        /* Fuera de pantalla hasta el primer movimiento */
        dot.style.transform  = 'translate(-9999px,-9999px)';
        ring.style.transform = 'translate(-9999px,-9999px)';
        dot.style.opacity    = '0';
        ring.style.opacity   = '0';

        /* ── Activar en primer movimiento ── */
        function activate(x, y) {
            if (live) return;
            live = true;
            mx = rx = x;
            my = ry = y;
            dot.style.opacity  = '1';
            ring.style.opacity = '1';
        }

        /* ── Seguimiento del mouse ── */
        document.addEventListener('mousemove', function (e) {
            if (!live) activate(e.clientX, e.clientY);
            mx = e.clientX;
            my = e.clientY;
            spawnSpark(mx, my);
        }, { passive: true });

        /* ── Visibilidad al salir/entrar ── */
        document.addEventListener('mouseleave', function () {
            if (!live) return;
            dot.style.opacity  = '0';
            ring.style.opacity = '0';
        });
        document.addEventListener('mouseenter', function () {
            if (!live) return;
            dot.style.opacity  = '1';
            ring.style.opacity = '1';
        });

        /* ── Hover sobre elementos interactivos ── */
        var SEL = 'a,button,[role="button"],input,select,textarea,' +
                  'label,summary,[tabindex],.piece-card,.collection-panel';
        document.addEventListener('mouseover', function (e) {
            if (!live) return;
            var on = !!e.target.closest(SEL);
            dot.classList.toggle('bj-hover', on);
            ring.classList.toggle('bj-hover', on);
        });

        /* ── Press ── */
        document.addEventListener('mousedown', function () {
            if (!live) return;
            dot.classList.add('bj-press');
            ring.classList.add('bj-press');
        });
        document.addEventListener('mouseup', function () {
            dot.classList.remove('bj-press');
            ring.classList.remove('bj-press');
        });

        /* ── Onda de clic ── */
        document.addEventListener('click', function (e) {
            if (!live) return;
            var b = document.createElement('div');
            b.className = 'bj-burst';
            b.style.left = e.clientX + 'px';
            b.style.top  = e.clientY + 'px';
            document.body.appendChild(b);
            setTimeout(function () {
                b.parentNode && b.parentNode.removeChild(b);
            }, 750);
        });

        /* ── Loop de animación (RAF + translate3d GPU) ── */
        var EASE = 0.10;
        (function loop() {
            requestAnimationFrame(loop);
            if (!live) return;
            rx += (mx - rx) * EASE;
            ry += (my - ry) * EASE;
            dot.style.transform  = 'translate3d(' + mx  + 'px,' + my  + 'px,0)';
            ring.style.transform = 'translate3d(' + rx  + 'px,' + ry  + 'px,0)';
        }());

        /* ── Partículas de oro ── */
        function spawnSpark(x, y) {
            var now = Date.now();
            if (now - lastT < 48) return;
            var dx = x - lastX, dy = y - lastY;
            if (dx * dx + dy * dy < 81) return;
            lastT = now; lastX = x; lastY = y;

            for (var i = 0; i < 3; i++) {
                var s   = document.createElement('div');
                s.className = 'bj-spark';
                var sz  = (1.5 + Math.random() * 3  ).toFixed(1);
                var ang = Math.floor(Math.random() * 360);
                var dst = (8   + Math.random() * 14  ).toFixed(1);
                var dur = Math.floor(320 + Math.random() * 380);
                s.style.cssText =
                    'left:'   + x   + 'px;' +
                    'top:'    + y   + 'px;' +
                    'width:'  + sz  + 'px;' +
                    'height:' + sz  + 'px;' +
                    '--a:'    + ang + 'deg;' +
                    '--d:'    + dst + 'px;' +
                    'animation-duration:' + dur + 'ms';
                document.body.appendChild(s);
                setTimeout(function (el) {
                    el.parentNode && el.parentNode.removeChild(el);
                }, dur + 80, s);
            }
        }

        /* ── Ocultar cursor en navegación interna ── */
        var navStyle = null;
        document.addEventListener('click', function (e) {
            if (!live) return;
            var a = e.target.closest('a[href]');
            if (!a) return;
            var h = a.getAttribute('href') || '';
            if (h && !h.startsWith('#') && !h.startsWith('tel:') &&
                !h.startsWith('mailto:') && a.target !== '_blank') {
                if (!navStyle) {
                    navStyle = document.createElement('style');
                    document.head.appendChild(navStyle);
                }
                navStyle.textContent = '#bj-dot,#bj-ring{opacity:0!important}';
            }
        });
        window.addEventListener('pageshow', function () {
            if (navStyle) navStyle.textContent = '';
        });
    }

    /* ── Punto de entrada ── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

}());
