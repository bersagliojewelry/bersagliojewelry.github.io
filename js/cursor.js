/**
 * Bersaglio Jewelry — Cursor de carga
 *
 * El cursor normal (puntero.cur) y el de mano (manito.cur) se aplican
 * directamente en CSS con cursor: url() — no necesitan JavaScript.
 *
 * Este script solo maneja el estado "cargando" al navegar entre páginas.
 */
(function () {
    'use strict';

    if (!window.matchMedia || window.matchMedia('(pointer: coarse)').matches) return;

    var styleEl = null;

    function showLoadingCursor() {
        if (!styleEl) {
            styleEl = document.createElement('style');
            document.head.appendChild(styleEl);
        }
        styleEl.textContent = '* { cursor: wait !important; }';
    }

    function clearLoadingCursor() {
        if (styleEl) styleEl.textContent = '';
    }

    // Cursor de carga al hacer clic en un enlace que cambia de página
    document.addEventListener('click', function (e) {
        var a = e.target.closest('a[href]');
        if (!a) return;
        var h = a.getAttribute('href') || '';
        if (h && !h.startsWith('#') && !h.startsWith('tel:') && !h.startsWith('mailto:') && a.target !== '_blank') {
            showLoadingCursor();
        }
    });

    // Limpiar al volver con el botón atrás del navegador
    window.addEventListener('pageshow', clearLoadingCursor);

}());
