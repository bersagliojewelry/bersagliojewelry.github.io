/**
 * Bersaglio Jewelry — Featured Pieces Component
 * Renders featured jewelry pieces from catalog data
 */

import BersaglioCatalog from '../data/catalog.js';
import Renderer from '../utils/renderer.js';

function renderSpecs(specs) {
    const keys = Object.entries(specs).filter(([k]) => k !== 'certificate');
    const labels = {
        stone: 'Piedra', carat: 'Quilates', metal: 'Metal', accent: 'Acentos',
        cut: 'Talla', color: 'Color', clarity: 'Claridad', weight: 'Peso',
        style: 'Estilo', finish: 'Acabado', length: 'Longitud'
    };
    return keys.map(([key, val]) =>
        `<span class="spec-item"><strong>${labels[key] || key}:</strong> ${val}</span>`
    ).join('');
}

export function renderFeaturedPieces() {
    const pieces = BersaglioCatalog.featuredPieces.filter(p => p.featured).slice(0, 6);
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
                    <a href="#contacto" class="piece-cta">
                        Solicitar información
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                </div>
            </div>
        </article>
    `);
}
