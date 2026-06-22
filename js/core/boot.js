/**
 * Bersaglio Jewelry — Boot entry point.
 *
 * Cada SEO shell (index.html, colecciones.html, nosotros.html, contacto.html,
 * journal.html, etc) carga este archivo via:
 *
 *   <script type="module" src="js/core/boot.js"></script>
 *
 * boot.js detecta `<body data-page="...">` y dispara:
 *   1. Mount header + footer + drawers (componentes globales)
 *   2. Lazy import del page handler correspondiente: js/pages/<page>.js
 *   3. Init Firestore data layer (page handler decide si lo necesita)
 *   4. Init router (link interception + view transitions)
 *
 * Performance:
 * - Header/footer renderizan inline ASAP (no esperan Firestore)
 * - Page handler se importa con import() dinámico → page-specific code es
 *   un chunk separado que el browser carga en paralelo
 * - data.load() en background, no bloquea first paint
 */

import { initRouter } from './router.js';
import { observeReveals } from './reveal.js';

/**
 * Scroll predecible en recarga. La página se arma con JS y CAMBIA DE ALTO mientras carga (más aún
 * con la reserva de espacio de las secciones dinámicas), así que la restauración automática del
 * navegador ('auto') caía en una posición inconsistente —a media página— en Ctrl+Shift+R (carrera
 * restauración↔contenido). 'manual' → la recarga empieza ARRIBA y el contenido dinámico se desarrolla
 * debajo del pliegue sin mover la vista. No afecta el scroll a anclas #id (mecanismo aparte).
 * (Daniel 2026-06-21.)
 */
try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch { /* no soportado */ }

/**
 * §C3 — Detección de CAPACIDAD (no de tamaño). Marca <html class="bj-lite"> en equipos
 * modestos/móviles para que el CSS aligere los efectos de cristal (header blur, aurora, blobs,
 * dock) SOLO ahí; en equipos capaces el diseño queda 100% idéntico (regla "no romper el diseño").
 * Cubre el caso del portátil corriente (pantalla grande pero gráfica/RAM débil) que un media query
 * por ancho NO atraparía. Defensivo: cualquier fallo → sin clase → diseño completo (fallback seguro).
 * Recon+comité+Gemini 2026-06-21 (PERF-04 / TODO-28 F4).
 */
(function flagDeviceCapability() {
    try {
        const mm = typeof window.matchMedia === 'function' ? window.matchMedia : null;
        const mem = navigator.deviceMemory;                 // GB (Chrome/Edge); puede ser undefined
        const conn = navigator.connection;
        const saveData = !!(conn && conn.saveData);
        const coarse  = mm ? mm('(pointer: coarse)').matches : false;          // móvil/táctil
        const small   = mm ? mm('(max-width: 920px)').matches : false;         // pantalla chica
        const reduced = mm ? mm('(prefers-reduced-motion: reduce)').matches : false;
        const weakRAM = typeof mem === 'number' && mem <= 4;                   // gama baja real
        if (saveData || coarse || small || reduced || weakRAM) {
            document.documentElement.classList.add('bj-lite');
        }
    } catch {
        /* Sin degradación: el diseño completo es el fallback seguro. */
    }
})();

const PAGES = {
    home:        () => import('../pages/home.js'),
    index:       () => import('../pages/home.js'),
    colecciones: () => import('../pages/catalogo.js'),
    pieza:       () => import('../pages/pieza.js'),
    nosotros:    () => import('../pages/nosotros.js'),
    contacto:    () => import('../pages/contacto.js'),
    carrito:        () => import('../pages/carrito.js'),
    'lista-deseos': () => import('../pages/lista-deseos.js'),
    journal:        () => import('../pages/journal.js'),
    entrada:        () => import('../pages/entrada.js'),
    gracias:        () => import('../pages/gracias.js'),
    terminos:       () => import('../pages/terminos.js'),
    privacidad:     () => import('../pages/privacidad.js'),
};

async function boot() {
    // 1. Mount global shell components (header, footer, drawers, banners).
    await loadShell();

    // 2. Init router for link interception + view transitions.
    initRouter();

    // 3. Detect page from <body data-page="..."> or fallback to 'home'.
    const pageKey = document.body.dataset.page || 'home';
    const loader = PAGES[pageKey];

    if (loader) {
        try {
            const module = await loader();
            if (module && typeof module.init === 'function') {
                await module.init();
            }
        } catch (err) {
            console.error(`[boot] failed to load page module "${pageKey}":`, err);
        }
    } else {
        console.warn(`[boot] unknown page: ${pageKey}`);
    }

    // 4. Activate scroll reveals for `.reveal` elements now in the DOM.
    //    Idempotent + re-callable after dynamic re-renders (Firestore onChange).
    observeReveals();

    // 5. Mark body ready for any CSS that depends on hydration complete.
    document.body.classList.add('bj-ready');
}

async function loadShell() {
    const tasks = [
        import('../components/header.js').then(m => m.mountHeader?.()),
        import('../components/footer.js').then(m => m.mountFooter?.()),
        // Drawers + global UI bits — registered but not mounted until triggered
        import('../components/cart-drawer.js').then(m => m.initCartDrawer?.()),
        import('../components/wishlist-drawer.js').then(m => m.initWishlistDrawer?.()),
        import('../components/cookie-banner.js').then(m => m.initCookieBanner?.()),
        import('../components/email-modal.js').then(m => m.initEmailModal?.()),
        import('../components/search-overlay.js').then(m => m.initSearchOverlay?.()),
        import('../components/quick-dock.js').then(m => m.mountQuickDock?.()),
    ];
    await Promise.allSettled(tasks);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}
