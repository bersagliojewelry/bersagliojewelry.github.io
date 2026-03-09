/**
 * Bersaglio Jewelry — Colecciones Page
 */

import { loadAllComponents } from './components.js';
import { renderFeaturedPieces } from './components/featured.js';
import Renderer from './utils/renderer.js';
import db from './data/catalog.js';

const collectionIcons = {
    'esmeraldas-colombianas': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="64" height="64"><polygon points="12,2 22,8.5 12,22 2,8.5"/></svg>`,
    'diamantes-eternos':      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="64" height="64"><polygon points="12,2 19,7 22,14 12,22 2,14 5,7"/></svg>`,
    'oro-escultorico':        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="64" height="64"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/></svg>`,
    'novias':                 `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="64" height="64"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
};

async function init() {
    await loadAllComponents();
    await db.load();
    renderCatalogCollections();
    renderFeaturedPieces();
    Renderer.initScrollAnimations();
    Renderer.initLazyImages();
    initWhatsAppButton();
}

function initWhatsAppButton() {
    const { whatsapp } = db.getContact();
    const phone = whatsapp.replace('+', '');
    const msg   = encodeURIComponent('Hola Bersaglio Jewelry, me interesa conocer más sobre sus colecciones.');
    const url   = `https://wa.me/${phone}?text=${msg}`;
    document.querySelectorAll('.wa-float, #wa-nav').forEach(btn => { btn.href = url; });
}

function renderCatalogCollections() {
    const grid        = document.getElementById('catalog-collections-grid');
    if (!grid) return;

    const collections = db.getCollections();

    grid.innerHTML = collections.map(col => `
        <article class="catalog-collection-card animate-on-scroll">
            <div class="catalog-collection-visual">
                ${collectionIcons[col.slug] || collectionIcons['esmeraldas-colombianas']}
            </div>
            <div class="catalog-collection-body">
                <div class="catalog-collection-count">${col.pieces} piezas</div>
                <h2 class="catalog-collection-name">${col.name}</h2>
                <p class="catalog-collection-desc">${col.description}</p>
                <a href="${col.slug}.html" class="btn btn-outline">
                    Explorar colección
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
            </div>
        </article>
    `).join('');
}

init();
