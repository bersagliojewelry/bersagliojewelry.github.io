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
    try {
        await loadAllComponents();
        await db.load();
    } catch (err) {
        console.error('[Bersaglio] Bootstrap failed:', err);
        return;
    }

    // Render sections — isolated so one failure doesn't block others
    const safeRender = (fn, label) => {
        try { fn(); } catch (err) { console.warn(`[Bersaglio] ${label} failed:`, err); }
    };

    safeRender(renderCollections,   'renderCollections');
    safeRender(renderFeaturedPieces,'renderFeaturedPieces');
    safeRender(renderServices,      'renderServices');
    safeRender(renderJournal,       'renderJournal');

    Renderer.initScrollAnimations();
    Renderer.initLazyImages();

    try { initWhatsAppButton(); } catch {}

    // Effects — non-critical, isolated
    const safeEffect = (fn, label) => {
        try { fn(); } catch (err) { console.warn(`[Bersaglio] ${label} failed:`, err); }
    };

    safeEffect(initEffects,              'initEffects');
    safeEffect(initHero,                 'initHero');
    safeEffect(initCollectionsHScroll,   'initCollectionsHScroll');
    safeEffect(initGSAPScrollAnimations, 'initGSAPScrollAnimations');
    safeEffect(initParallax,             'initParallax');
    safeEffect(initMicroAnimations,      'initMicroAnimations');
    safeEffect(initBannerKenBurns,       'initBannerKenBurns');
}

function initBannerKenBurns() {
    const banner = document.querySelector('.banner-section');
    if (!banner) return;
    // Trigger Ken Burns scale-down when section is visible
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                banner.classList.add('is-visible');
                io.disconnect();
            }
        });
    }, { threshold: 0.1 });
    io.observe(banner);
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
