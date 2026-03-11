/**
 * Bersaglio Jewelry — Main Application
 * Entry point: carga datos → inicializa componentes → renderiza secciones.
 */

import { loadAllComponents }   from './components.js';
import { renderCollections }   from './components/collections.js';
import { renderFeaturedPieces } from './components/featured.js';
import { renderServices }      from './components/services.js';
import { renderJournal }       from './components/journal.js';
import Renderer from './utils/renderer.js';
import db       from './data/catalog.js';
import { initEffects }              from './effects.js';
import { initHero }                 from './hero-animation.js';
import { initCollectionsHScroll }   from './effects/hscroll.js';
import { initGSAPScrollAnimations } from './scroll-animations.js';
import { initParallax }             from './parallax.js';
import { initMicroAnimations }      from './effects/micro.js';

async function initApp() {
    await loadAllComponents();
    await db.load();

    renderCollections();
    renderFeaturedPieces();
    renderServices();
    renderJournal();

    Renderer.initScrollAnimations();
    Renderer.initLazyImages();
    initWhatsAppButton();
    initEffects();
    initHero();
    initCollectionsHScroll();
    initGSAPScrollAnimations();
    initParallax();
    initMicroAnimations();
}

function initWhatsAppButton() {
    const { whatsapp } = db.getContact();
    const phone = whatsapp.replace('+', '');
    const msg   = encodeURIComponent('Hola Bersaglio Jewelry, me interesa conocer más sobre sus piezas de alta joyería.');
    const url   = `https://wa.me/${phone}?text=${msg}`;

    document.querySelectorAll('.wa-float, #wa-nav, #wa-contact').forEach(btn => {
        btn.href = url;
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
