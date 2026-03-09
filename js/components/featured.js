/**
 * Bersaglio Jewelry — Featured Pieces Component
 */

import db from '../data/catalog.js';
import Renderer from '../utils/renderer.js';

const specLabels = {
    stone: 'Piedra', carat: 'Quilates', metal: 'Metal', accent: 'Acentos',
    cut: 'Talla', color: 'Color', clarity: 'Claridad', weight: 'Peso',
    style: 'Estilo', finish: 'Acabado', length: 'Longitud'
};

function renderSpecs(specs) {
    return Object.entries(specs)
        .filter(([k]) => k !== 'certificate')
        .map(([k, v]) => `<span class="spec-item"><strong>${specLabels[k] || k}:</strong> ${v}</span>`)
        .join('');
}

export function renderFeaturedPieces() {
    const pieces    = db.getFeatured(6);
    const container = document.querySelector('#featured-grid');
    if (!container) return;

    Renderer.renderList('#featured-grid', pieces, (piece) => `
        <article class="piece-card animate-on-scroll" data-piece="${piece.id}">
            <div class="piece-image-wrapper">
                <div class="piece-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><polygon points="12,2 22,8.5 12,22 2,8.5"/><line x1="2" y1="8.5" x2="22" y2="8.5"/><polyline points="7,2 12,8.5 17,2"/></svg>
                </div>
                ${piece.badge ? `<span class="piece-badge">${piece.badge}</span>` : ''}
            </div>
            <div class="piece-info">
                <h3 class="piece-name">${piece.name}</h3>
                <p class="piece-desc">${piece.description}</p>
                <div class="piece-specs">${renderSpecs(piece.specs)}</div>
                <div class="piece-footer">
                    <span class="piece-price">${piece.priceLabel}</span>
                    <a href="pieza.html?p=${piece.slug}" class="piece-cta">
                        Ver detalle
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                </div>
            </div>
        </article>
    `);
}
