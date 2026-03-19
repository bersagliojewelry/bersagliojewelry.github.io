/**
 * Bersaglio Jewelry — Cursor Premium v3
 * Diseñado desde cero. Máxima robustez y sofisticación visual.
 *
 *  Arquitectura:
 *  · Inyecta cursor:none SINCRÓNICAMENTE (antes de cualquier evento)
 *  · Crea #bj-dot  (punta de precisión — sin lag, posición exacta)
 *    └─ .bj-gem    (diamante 10px rotado 45° + brazos de cruceta)
 *  · Crea #bj-ring (anillo magnético — sigue con easing)
 *    └─ ::before   (arco giratorio animado, aislado del transform JS)
 *    └─ ::after    (órbita exterior estática)
 *  · Partículas de oro en el trail de movimiento
 *  · Burst radial al hacer clic
 *  · Limpieza automática en touch-only
 */
(function () {
    'use strict';

    /* ── 0. Guard ──────────────────────────────────────────────── */
    if (document.getElementById('bj-dot')) return;

    /* ── 1. cursor:none INMEDIATO (síncrono, antes de DOM ready) ─ */
    var hideStyle = document.createElement('style');
    hideStyle.id = 'bj-hide';
    hideStyle.textContent = '*, *::before, *::after { cursor: none !important; }';
    (document.head || document.documentElement).appendChild(hideStyle);

    /* ── 2. Si el primer evento real es touch → limpiar todo ───── */
    var touchClean = function () {
        document.removeEventListener('touchstart', touchClean);
        hideStyle.parentNode && hideStyle.parentNode.removeChild(hideStyle);
        var d = document.getElementById('bj-dot');
        var r = document.getElementById('bj-ring');
        d && d.parentNode && d.parentNode.removeChild(d);
        r && r.parentNode && r.parentNode.removeChild(r);
    };
    document.addEventListener('touchstart', touchClean, { passive: true });

    /* ── 3. Crear y cablear el cursor ──────────────────────────── */
    function boot() {

        /* ── Elementos ── */
        var dotEl = document.createElement('div');
        dotEl.id = 'bj-dot';
        dotEl.setAttribute('aria-hidden', 'true');

        /* gem: el diamante central + brazos de cruceta */
        var gem = document.createElement('div');
        gem.className = 'bj-gem';
        dotEl.appendChild(gem);

        var ringEl = document.createElement('div');
        ringEl.id = 'bj-ring';
        ringEl.setAttribute('aria-hidden', 'true');

        document.body.appendChild(dotEl);
        document.body.appendChild(ringEl);

        /* ── Estado ── */
        var mx = -9999, my = -9999;   /* posición del mouse */
        var rx = -9999, ry = -9999;   /* posición interpolada del ring */
        var live = false;             /* true tras primer mousemove */
        var lastT = 0, lastX = 0, lastY = 0;

        /* ── Posición inicial fuera de pantalla ── */
        dotEl.style.cssText  = 'transform:translate(-9999px,-9999px);opacity:0';
        ringEl.style.cssText = 'transform:translate(-9999px,-9999px);opacity:0';

        /* ── Activación en el primer movimiento ── */
        function activate(x, y) {
            if (live) return;
            live = true;
            mx = rx = x;
            my = ry = y;
            dotEl.style.opacity  = '1';
            ringEl.style.opacity = '1';
            document.removeEventListener('touchstart', touchClean); /* ya es mouse */
        }

        /* ── mousemove (evento primario, universal) ── */
        document.addEventListener('mousemove', function (e) {
            if (!live) activate(e.clientX, e.clientY);
            mx = e.clientX;
            my = e.clientY;
            spawnSpark(mx, my);
        }, { passive: true });

        /* ── pointermove (backup, distingue tipo de puntero) ── */
        if (window.PointerEvent) {
            document.addEventListener('pointermove', function (e) {
                if (e.pointerType !== 'mouse') return;
                if (!live) activate(e.clientX, e.clientY);
                mx = e.clientX;
                my = e.clientY;
            }, { passive: true });
        }

        /* ── Visibilidad al salir/entrar del viewport ── */
        document.addEventListener('mouseleave', function () {
            if (!live) return;
            dotEl.style.opacity  = '0';
            ringEl.style.opacity = '0';
        });
        document.addEventListener('mouseenter', function () {
            if (!live) return;
            dotEl.style.opacity  = '1';
            ringEl.style.opacity = '1';
        });

        /* ── Hover: detectar interactivos ── */
        var SEL = 'a,button,[role="button"],input,select,textarea,' +
                  'label,summary,[tabindex],.piece-card,.collection-panel';
        document.addEventListener('mouseover', function (e) {
            if (!live) return;
            var on = !!e.target.closest(SEL);
            dotEl.classList.toggle('bj-hover',  on);
            ringEl.classList.toggle('bj-hover', on);
        });

        /* ── Press ── */
        document.addEventListener('mousedown', function () {
            if (!live) return;
            dotEl.classList.add('bj-press');
            ringEl.classList.add('bj-press');
        });
        document.addEventListener('mouseup', function () {
            dotEl.classList.remove('bj-press');
            ringEl.classList.remove('bj-press');
        });

        /* ── Click burst ── */
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

        /* ── RAF: loop de animación (translate3d para GPU) ── */
        var EASE = 0.10;
        (function loop() {
            requestAnimationFrame(loop);
            if (!live) return;
            rx += (mx - rx) * EASE;
            ry += (my - ry) * EASE;
            dotEl.style.transform  = 'translate3d(' + mx + 'px,' + my + 'px,0)';
            ringEl.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
        }());

        /* ── Partículas de oro ── */
        function spawnSpark(x, y) {
            var now = Date.now();
            if (now - lastT < 48) return;
            var dx = x - lastX, dy = y - lastY;
            if (dx * dx + dy * dy < 81) return; /* mínimo desplazamiento */
            lastT = now; lastX = x; lastY = y;

            for (var i = 0; i < 3; i++) {
                var s   = document.createElement('div');
                s.className = 'bj-spark';
                var sz  = (1.5 + Math.random() * 3).toFixed(1);
                var ang = Math.floor(Math.random() * 360);
                var dst = (8 + Math.random() * 14).toFixed(1);
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

        /* ── Cursor de espera en navegación interna ── */
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

    /* ── 4. Punto de entrada ── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

}());
