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

    // 4. Mark body ready for any CSS that depends on hydration complete.
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
    ];
    await Promise.allSettled(tasks);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}
