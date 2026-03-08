/**
 * Bersaglio Jewelry — Collections Component
 * Renders collection cards from catalog data
 */

import BersaglioCatalog from '../data/catalog.js';
import Renderer from '../utils/renderer.js';

const collectionIcons = {
    'esmeraldas-colombianas': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
    'diamantes-eternos': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12,2 22,8.5 12,22 2,8.5"/><line x1="2" y1="8.5" x2="22" y2="8.5"/><polyline points="7,2 12,8.5 17,2"/></svg>`,
    'oro-escultorico': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20"/><path d="M2 12h20"/></svg>`,
    'novias': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
};

export function renderCollections() {
    const collections = BersaglioCatalog.collections.filter(c => c.featured);
    const container = document.querySelector('#collections-grid');
    if (!container) return;

    Renderer.renderList('#collections-grid', collections, (col) => `
        <article class="collection-card animate-on-scroll" data-collection="${col.slug}">
            <div class="collection-icon">
                ${collectionIcons[col.slug] || ''}
            </div>
            <h3 class="collection-name">${col.name}</h3>
            <p class="collection-subtitle">${col.subtitle}</p>
            <p class="collection-desc">${col.description}</p>
            <span class="collection-count">${col.pieces} piezas</span>
            <a href="#contacto" class="collection-link" aria-label="Explorar ${col.name}">
                Explorar
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
        </article>
    `);
}
