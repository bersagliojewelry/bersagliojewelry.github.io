/**
 * Bersaglio Jewelry — Main Application
 * Entry point: carga datos → inicializa componentes → renderiza secciones.
 */

import { loadAllComponents }   from './components.js';
import { renderFeaturedPieces } from './components/featured.js';
import { renderServices }      from './components/services.js';
import { renderJournal }       from './components/journal.js';
import { renderCategoriesDock, initCategoriesDock } from './components/categories-dock.js';
// renderCollections + renderLookbook removed — replaced by aqua categories dock + design has no lookbook
import Renderer from './utils/renderer.js';
import db       from './data/catalog.js';
import { initEffects }              from './effects.js';
// initHero + initCollectionsHScroll removed — targeted V7 hero markup that no longer exists
import { initGSAPScrollAnimations } from './scroll-animations.js';
import { initParallax }             from './parallax.js';
import { initMicroAnimations }      from './effects/micro.js';
import { initSkeletonShimmer }      from './skeleton.js';
import { initPrefetch }             from './prefetch.js';
import { initCookieConsent }        from './cookie-consent.js';
import { initEmailCapture }         from './email-capture.js';

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

    const renderAllSections = (label = '') => {
        safeRender(renderCategoriesDock, `renderCategoriesDock${label}`);
        safeRender(renderFeaturedPieces, `renderFeaturedPieces${label}`);
        safeRender(renderJournal,        `renderJournal${label}`);
        safeRender(renderServices,       `renderServices${label}`);
    };

    renderAllSections();
    safeRender(initCategoriesDock, 'initCategoriesDock');

    Renderer.initScrollAnimations();
    Renderer.initLazyImages();

    // Real-time Firestore sync — re-render every section when admin changes
    // data. db.load() already wired the live listeners so this is a no-op
    // beyond returning an unsubscribe function.
    db.onChange(() => {
        renderAllSections(' (realtime)');
        Renderer.initScrollAnimations();
        Renderer.initLazyImages();
    });

    try { initWhatsAppButton(); } catch {}

    // Effects — non-critical, isolated
    const safeEffect = (fn, label) => {
        try { fn(); } catch (err) { console.warn(`[Bersaglio] ${label} failed:`, err); }
    };

    safeEffect(initSkeletonShimmer,      'initSkeletonShimmer');
    safeEffect(initPrefetch,             'initPrefetch');
    safeEffect(initEffects,              'initEffects');
    safeEffect(initGSAPScrollAnimations, 'initGSAPScrollAnimations');
    safeEffect(initParallax,             'initParallax');
    safeEffect(initMicroAnimations,      'initMicroAnimations');
    safeEffect(initCookieConsent,         'initCookieConsent');
    safeEffect(initEmailCapture,          'initEmailCapture');
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
