/**
 * Bersaglio Jewelry — Home (compositor).
 *
 * Las 9 secciones viven en js/home/* (un módulo por sección, bajo acoplamiento).
 * Este archivo solo: compone el orden, hidrata en #main-content, y suscribe las
 * secciones DINÁMICAS (destacadas + categorías) a Firestore vía data.onChange().
 *
 * Orden:
 *   1 Hero · 2 Categorías · 3 Destacadas(Firestore) · 4 Editorial
 *   5 Servicios · 6 Atelier · 7 Journal · 8 CTA
 *   (§156: el marquee de credenciales se retiró — desencajaba de lo premium, Daniel)
 */

import { data } from '../core/data.js';
import { renderHero, refreshHero } from '../home/hero.js';
import { renderCategories, refreshCategories } from '../home/categories.js';
import { renderFeatured, refreshFeatured } from '../home/featured.js';
import { renderEditorial, refreshEditorial } from '../home/editorial.js';
import { renderServices } from '../home/services.js';
import { renderAtelier, refreshAtelier } from '../home/atelier.js';
import { renderJournalPreview, refreshJournalPreview, initJournalNewsletter } from '../home/journal-preview.js';
import { renderFilms, refreshFilms, initFilms } from '../home/films.js';
import { renderSocial, refreshSocial, initSocial } from '../home/social.js';
import { renderCTA, refreshCTA } from '../home/cta.js';

function renderAll() {
    return [
        renderHero(),
        renderCategories(),
        renderFeatured(),
        renderEditorial(),
        renderServices(),
        renderAtelier(),
        renderJournalPreview(),
        renderFilms(),
        renderSocial(),
        renderCTA(),
    ].join('');
}

export async function init() {
    const main = document.getElementById('main-content');
    if (!main) return;

    // Kick off Firestore data load (non-blocking — first paint uses skeleton)
    data.load().catch(() => {});
    data.loadJournal();   // B4: el Home muestra journal-preview → opt-in al listener
    data.loadFilms();     // CMS: videos del home (films/) — hide-when-empty si no hay
    data.loadSocial();    // CMS: redes del home (socialPosts/) — hide-when-empty si no hay
    // CMS P1: textos de hero/editorial. getDoc one-shot; re-pinta UNA vez al resolver
    // (no en cada data.onChange → sin flash del LCP por cambios de piezas/journal).
    data.loadSiteContent('home', () => { refreshHero(); refreshEditorial(); refreshAtelier(); refreshCTA(); });

    // Initial paint
    main.innerHTML = renderAll();

    // Reveal-on-scroll para secciones below-the-fold (el hero queda visible).
    // boot.js llama observeReveals() justo después de init(); estas clases ya estarán puestas.
    ['home-cats', 'home-featured', 'home-editorial', 'home-services', 'home-atelier', 'home-journal', 'home-cta']
        .forEach(c => main.querySelector('.' + c)?.classList.add('reveal'));

    // Wire interactive sections after paint
    requestAnimationFrame(() => {
        initJournalNewsletter();
        initFilms();
        initSocial();
    });

    // Real-time refresh of dynamic sections only (avoids hero re-render)
    data.onChange(() => {
        refreshFeatured();
        refreshCategories();
        refreshJournalPreview();
        refreshFilms();
        refreshSocial();
    });
}

export default { init };
