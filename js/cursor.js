/**
 * Bersaglio Jewelry — Cursor de Precisión
 *
 * Sistema completo de cursor premium:
 *  · Dot central  → sigue el ratón con exactitud; círculo → diamante en hover
 *  · Anillo       → sigue con lag magnético (ease 10%); se expande en hover
 *  · Partículas   → trail de oro en movimiento (velocidad mínima requerida)
 *  · Burst        → anillo expansivo al hacer clic
 *  · Estado carga → oculta el cursor custom y muestra wait nativo
 */
(function () {
    'use strict';

    // Solo dispositivos de puntero fino (mouse / trackpad)
    if (!window.matchMedia || window.matchMedia('(pointer: coarse)').matches) return;

    /* ── Crear elementos DOM ──────────────────────────────────── */
    function mkEl(tag, id, cls) {
        var d = document.createElement(tag);
        if (id)  d.id        = id;
        if (cls) d.className = cls;
        document.body.appendChild(d);
        return d;
    }

    var dotWrap = mkEl('div', 'bj-dot-wrap');
    var dot     = document.createElement('div');
    dot.className = 'bj-dot';
    dotWrap.appendChild(dot);

    var ring = mkEl('div', 'bj-ring');

    // Confirmar al CSS que el cursor custom está listo
    document.documentElement.classList.add('bj-cursor-ready');

    /* ── Estado ───────────────────────────────────────────────── */
    var mx = -300, my = -300;   // posición exacta del ratón
    var rx = -300, ry = -300;   // posición del anillo (con lag)
    var lastPx = 0, lastPy = 0, lastSparkleT = 0;

    /* ── Seguimiento del ratón ────────────────────────────────── */
    document.addEventListener('mousemove', function (e) {
        mx = e.clientX;
        my = e.clientY;
        maybeSparkle(mx, my);
    });

    document.addEventListener('mouseleave', function () {
        dotWrap.style.opacity = '0';
        ring.style.opacity    = '0';
    });
    document.addEventListener('mouseenter', function () {
        dotWrap.style.opacity = '';
        ring.style.opacity    = '';
    });

    /* ── Detección de hover interactivo ───────────────────────── */
    var INTERACTIVE = 'a,button,[role="button"],input,select,textarea,label,summary,.piece-card,.collection-panel,[tabindex]';

    document.addEventListener('mouseover', function (e) {
        var over = !!e.target.closest(INTERACTIVE);
        dot.classList.toggle('is-hover', over);
        ring.classList.toggle('is-hover', over);
    });

    /* ── Mouse down / up ──────────────────────────────────────── */
    document.addEventListener('mousedown', function () {
        dot.classList.add('is-down');
        ring.classList.add('is-down');
    });
    document.addEventListener('mouseup', function () {
        dot.classList.remove('is-down');
        ring.classList.remove('is-down');
    });

    /* ── Burst al hacer clic ──────────────────────────────────── */
    document.addEventListener('click', function (e) {
        createBurst(e.clientX, e.clientY);
    });

    /* ── Loop de animación (60 fps) ───────────────────────────── */
    var EASE = 0.095;
    function tick() {
        rx += (mx - rx) * EASE;
        ry += (my - ry) * EASE;

        dotWrap.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
        ring.style.transform    = 'translate(' + rx + 'px,' + ry + 'px)';

        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    /* ── Partículas de oro ────────────────────────────────────── */
    function maybeSparkle(x, y) {
        var now = Date.now();
        if (now - lastSparkleT < 38) return;

        var dx = x - lastPx, dy = y - lastPy;
        if (dx * dx + dy * dy < 120) return;   // umbral de velocidad

        lastSparkleT = now;
        lastPx = x;
        lastPy = y;

        // 2 partículas por intervalo
        for (var i = 0; i < 2; i++) {
            var s    = document.createElement('div');
            s.className = 'bj-sparkle';
            var size = (2 + Math.random() * 2.5).toFixed(1);
            var angle = Math.floor(Math.random() * 360);
            var dist  = (5 + Math.random() * 12).toFixed(1);
            var dur   = Math.floor(380 + Math.random() * 320);
            s.style.cssText = 'left:' + x + 'px;top:' + y + 'px;'
                + 'width:' + size + 'px;height:' + size + 'px;'
                + '--a:' + angle + 'deg;--d:' + dist + 'px;'
                + 'animation-duration:' + dur + 'ms';
            document.body.appendChild(s);
            (function (el, d) { setTimeout(function () { el.remove(); }, d + 60); })(s, dur);
        }
    }

    /* ── Burst de clic ────────────────────────────────────────── */
    function createBurst(x, y) {
        var b = document.createElement('div');
        b.className = 'bj-burst';
        b.style.left = x + 'px';
        b.style.top  = y + 'px';
        document.body.appendChild(b);
        setTimeout(function () { b.remove(); }, 700);
    }

    /* ── Cursor de carga (navegación interna) ─────────────────── */
    var loadStyle = null;
    function showLoading() {
        if (!loadStyle) {
            loadStyle = document.createElement('style');
            document.head.appendChild(loadStyle);
        }
        loadStyle.textContent = '* { cursor: wait !important; } #bj-dot-wrap, #bj-ring { opacity: 0 !important; }';
    }
    function clearLoading() {
        if (loadStyle) loadStyle.textContent = '';
    }

    document.addEventListener('click', function (e) {
        var a = e.target.closest('a[href]');
        if (!a) return;
        var h = a.getAttribute('href') || '';
        if (h && !h.startsWith('#') && !h.startsWith('tel:') && !h.startsWith('mailto:') && a.target !== '_blank') {
            showLoading();
        }
    });
    window.addEventListener('pageshow', clearLoading);

}());
