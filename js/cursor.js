/**
 * Bersaglio Jewelry — Cursor PNG
 * Script autónomo, NO es un módulo ES.
 * Se carga con <script defer> y opera completamente
 * independiente del sistema de módulos de app.js.
 */
(function () {
    'use strict';

    // Solo en dispositivos con ratón (pointer fino)
    if (!window.matchMedia || window.matchMedia('(pointer: coarse)').matches) return;

    /* ── Crear el elemento cursor ── */
    var div = document.createElement('div');
    div.id = 'bj-cursor';

    var img = document.createElement('img');
    img.src = 'img/cursor-normal.png';
    img.alt = '';
    img.setAttribute('draggable', 'false');
    img.setAttribute('aria-hidden', 'true');

    div.appendChild(img);

    /* ── Insertar en el DOM ── */
    function mount() {
        if (document.getElementById('bj-cursor')) return; // ya existe
        document.body.appendChild(div);
    }

    if (document.body) {
        mount();
    } else {
        document.addEventListener('DOMContentLoaded', mount, { once: true });
    }

    /* ── Pre-cargar imagen de mano ── */
    var imgHand   = new Image(); imgHand.src   = 'img/cursor-hand.png';
    var imgNormal = new Image(); imgNormal.src = 'img/cursor-normal.png';

    /* ── Seguimiento del ratón ── */
    document.addEventListener('mousemove', function (e) {
        div.style.transform  = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0)';
        div.style.visibility = 'visible';
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
        div.style.visibility = 'hidden';
    });

    document.addEventListener('mouseenter', function () {
        div.style.visibility = 'visible';
    });

    /* ── Cambio de imagen: normal ↔ mano ── */
    document.addEventListener('mouseover', function (e) {
        if (!e.target) return;
        var t = e.target.closest('a, button, [role="button"], label, select, input, textarea, .piece-card, .collection-panel');
        img.src = t ? 'img/cursor-hand.png' : 'img/cursor-normal.png';
    }, { passive: true });

}());
