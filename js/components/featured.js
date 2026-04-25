/**
 * Bersaglio Jewelry — Featured Pieces (home #featured-grid)
 *
 * Uses the shared piece-card renderer to keep markup identical across
 * featured + catalog + collection pages.
 *
 * Data: db.getFeatured(6) — pieces with featured=true in admin.
 * Real-time: re-rendered via db.onChange() in app.js.
 */

import db from '../data/catalog.js';
import Renderer from '../utils/renderer.js';
import { renderPieceCardHTML, wirePieceCardActions } from './piece-card.js';
import { buildProductListSchema, injectJsonLd } from '../utils/schema.js';

const FEATURED_LIMIT = 6;

export function renderFeaturedPieces() {
    const pieces    = db.getFeatured(FEATURED_LIMIT);
    const container = document.querySelector('#featured-grid');
    const section   = document.querySelector('#piezas');
    if (!container) return;

    if (!pieces.length) {
        if (section) section.classList.add('is-empty');
        container.innerHTML = '';
        return;
    }
    if (section) section.classList.remove('is-empty');

    Renderer.renderList('#featured-grid', pieces, renderPieceCardHTML);

    try { injectJsonLd('featured-products-schema', buildProductListSchema(pieces)); } catch {}

    wirePieceCardActions(container);
}
