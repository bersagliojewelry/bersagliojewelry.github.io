/**
 * Bersaglio Jewelry — Collections Component V3
 * Editorial vertical cards with gold border + prominent image
 */

import db from '../data/catalog.js';

const collectionIcons = {
    'anillos':          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="3" ry="9"/></svg>`,
    'topos-aretes':     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8"><polygon points="12,2 22,8.5 12,22 2,8.5"/><line x1="2" y1="8.5" x2="22" y2="8.5"/><polyline points="7,2 12,8.5 17,2"/></svg>`,
    'dijes-colgantes':  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8"><path d="M12 2v14M8 12l4 4 4-4"/><circle cx="12" cy="20" r="2"/></svg>`,
    'argollas':         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8"><circle cx="9" cy="12" r="7"/><circle cx="15" cy="12" r="7"/></svg>`
};

export function renderCollections() {
    const collections = db.getCollections(true);
    const container   = document.querySelector('#collections-grid');
    if (!container) return;

    container.innerHTML = collections.map((col) => `
        <article class="collection-panel ${col.bannerUrl ? 'has-banner' : ''}" data-col="${col.slug}">
            <a href="${col.slug}.html" class="collection-panel-link" aria-label="Explorar ${col.name}">
                <div class="collection-panel-img">
                    ${col.bannerUrl
                        ? `<img src="${col.bannerUrl}" alt="${col.name}" loading="lazy">`
                        : `<div class="collection-panel-icon">${collectionIcons[col.slug] || ''}</div>`
                    }
                </div>
                <div class="collection-panel-body">
                    <h3 class="collection-panel-name">${col.name}</h3>
                    <span class="collection-panel-cta">Ver Colección</span>
                </div>
            </a>
        </article>
    `).join('');
}
