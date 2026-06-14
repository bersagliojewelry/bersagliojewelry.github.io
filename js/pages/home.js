/**
 * Bersaglio Jewelry — Home (compositor).
 *
 * Las 9 secciones viven en js/home/* (un módulo por sección, bajo acoplamiento).
 * Este archivo solo: compone el orden, hidrata en #main-content, y suscribe las
 * secciones DINÁMICAS (destacadas + categorías) a Firestore vía data.onChange().
 *
 * Orden:
 *   1 Hero · 2 Marquee · 3 Categorías · 4 Destacadas(Firestore) · 5 Editorial
 *   6 Servicios · 7 Atelier · 8 Journal · 9 CTA
 */

import { data } from '../core/data.js';
import { renderHero } from '../home/hero.js';
import { renderMarquee } from '../home/marquee.js';
import { renderCategories, refreshCategories } from '../home/categories.js';
import { renderFeatured, refreshFeatured } from '../home/featured.js';
import { renderEditorial } from '../home/editorial.js';
import { renderServices } from '../home/services.js';
import { renderAtelier } from '../home/atelier.js';
import { renderJournalPreview, refreshJournalPreview, initJournalNewsletter } from '../home/journal-preview.js';
import { renderFilms, initFilms } from '../home/films.js';
import { renderSocial, initSocial } from '../home/social.js';
import { renderCTA } from '../home/cta.js';

function renderAll() {
    return [
        renderHero(),
        renderMarquee(),
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

    // Initial paint
    main.innerHTML = renderAll();

    // Reveal-on-scroll para secciones below-the-fold (hero + marquee quedan visibles).
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
    });
}

export default { init };
