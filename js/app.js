/**
 * Bersaglio Jewelry — Main Application
 * Entry point: carga datos → inicializa componentes → renderiza secciones.
 */

import { loadAllComponents } from './components.js';
import { renderCollections }  from './components/collections.js';
import { renderFeaturedPieces } from './components/featured.js';
import { renderServices }     from './components/services.js';
import Renderer from './utils/renderer.js';
import db from './data/catalog.js';

async function initApp() {
    // 1. Snippets del header y footer + inicializar su comportamiento
    await loadAllComponents();

    // 2. Capa de datos — hoy: local; mañana: Firestore sin cambiar nada más
    await db.load();

    // 3. Renderizar secciones dinámicas
    renderCollections();
    renderFeaturedPieces();
    renderServices();

    // 4. Experiencia visual
    Renderer.initScrollAnimations();
    Renderer.initLazyImages();

    // 5. Botones WhatsApp (float + nav)
    initWhatsAppButton();
}

function initWhatsAppButton() {
    const { whatsapp } = db.getContact();
    const phone = whatsapp.replace('+', '');
    const msg   = encodeURIComponent('Hola Bersaglio Jewelry, me interesa conocer más sobre sus piezas de alta joyería.');
    const url   = `https://wa.me/${phone}?text=${msg}`;

    document.querySelectorAll('.wa-float, #wa-nav').forEach(btn => {
        btn.href = url;
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
