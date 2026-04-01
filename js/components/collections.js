/**
 * Bersaglio Jewelry — Collections Component V2
 * Editorial dark panels with reveal animations
 */

import db from '../data/catalog.js';

const collectionIcons = {
    'anillos':          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="3" ry="9"/></svg>`,
    'topos-aretes':     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8"><polygon points="12,2 22,8.5 12,22 2,8.5"/><line x1="2" y1="8.5" x2="22" y2="8.5"/><polyline points="7,2 12,8.5 17,2"/></svg>`,
    'dijes-colgantes':  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8"><path d="M12 2v14M8 12l4 4 4-4"/><circle cx="12" cy="20" r="2"/></svg>`,
    'argollas':         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8"><circle cx="9" cy="12" r="7"/><circle cx="15" cy="12" r="7"/></svg>`
};

const arrowSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>`;

export function renderCollections() {
    const collections = db.getCollections(true);
    const container   = document.querySelector('#collections-grid');
    if (!container) return;

    container.innerHTML = collections.map((col, i) => `
        <article class="collection-panel ${col.bannerUrl ? 'has-banner' : ''}" data-col="${col.slug}" role="article">
            <a href="${col.slug}.html" class="collection-panel-link" aria-label="Explorar ${col.name}">

                <!-- Background: banner image or icon fallback -->
                ${col.bannerUrl
                    ? `<div class="collection-panel-bg-img" aria-hidden="true">
                           <img src="${col.bannerUrl}" alt="" loading="lazy">
                       </div>`
                    : `<div class="collection-panel-bg-icon" aria-hidden="true">
                           ${collectionIcons[col.slug] || ''}
                       </div>`
                }

                <!-- Number -->
                <span class="collection-panel-num" aria-hidden="true">0${i + 1}</span>

                <!-- Body -->
                <span class="collection-panel-sub">${col.subtitle}</span>
                <h3 class="collection-panel-name">${col.name}</h3>
                <p class="collection-panel-desc">${col.description}</p>

                <!-- Footer -->
                <div class="collection-panel-footer">
                    <span class="collection-panel-count">${col.pieces} piezas</span>
                    <span class="collection-panel-cta">
                        Explorar
                        ${arrowSvg}
                    </span>
                </div>
            </a>
        </article>
    `).join('');
}
