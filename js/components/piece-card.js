/**
 * Bersaglio Jewelry — Shared Piece Card renderer (Liquid Glass Aqua)
 *
 * Single source of truth for piece-card markup used by:
 *   - js/components/featured.js (#featured-grid in home)
 *   - js/coleccion.js           (#col-pieces-grid in catalog pages)
 *   - js/colecciones.js         (#featured-grid in colecciones.html)
 *
 * Card structure matches bersaglio.html design: glass-iridescent shell with
 * image (aspect 4/5), tag chip top-left, wishlist+cart icon stack top-right,
 * info row with eyebrow / display title / meta / price+arrow.
 *
 * Public API:
 *   renderPieceCardHTML(piece) → string of HTML for one card
 *   wirePieceCardActions(container, { onWishlistToggle, onCartToggle }) →
 *       wires wishlist + cart buttons in the container after innerHTML set
 */

import db from '../data/catalog.js';
import { wishlist } from '../wishlist.js';
import { cart }     from '../cart.js';
import { toast }    from '../toast.js';

function escapeHtml(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function normCase(text) {
    if (!text) return '';
    if (text.length > 15 && !/[a-záéíóúñü]/.test(text)) {
        return text.toLowerCase().replace(/(^|[.!?]\s*)([a-záéíóúñü])/g,
            (m, prefix, char) => prefix + char.toUpperCase());
    }
    return text;
}

function collectionName(slug) {
    if (!slug) return '';
    const col = db.getCollections().find(c => (c.slug || c.id) === slug);
    return col?.name || slug.replace(/-/g, ' ');
}

function metaLine(piece) {
    const stone = piece.specs?.stone || '';
    const metal = piece.specs?.metal || '';
    return [stone, metal].filter(Boolean).join(' · ');
}

function wishlistBtn(piece) {
    const saved = wishlist.has(piece.slug);
    return `
        <button
            class="piece-wishlist-btn${saved ? ' is-saved' : ''}"
            data-wishlist-slug="${escapeHtml(piece.slug)}"
            aria-label="${saved ? 'Quitar de lista de deseos' : 'Añadir a lista de deseos'}"
            title="${saved ? 'Quitar de lista de deseos' : 'Añadir a lista de deseos'}"
        >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="${saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
        </button>`;
}

function cartBtn(piece) {
    const inCart = cart.has(piece.slug);
    return `
        <button
            class="piece-cart-btn${inCart ? ' is-in-cart' : ''}"
            data-cart-slug="${escapeHtml(piece.slug)}"
            aria-label="${inCart ? 'Quitar del carrito' : 'Añadir al carrito'}"
            title="${inCart ? 'Quitar del carrito' : 'Añadir al carrito'}"
        >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
        </button>`;
}

function arrowSvg() {
    return `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>`;
}

export function renderPieceCardHTML(piece) {
    const eyebrow = collectionName(piece.collection);
    const meta    = metaLine(piece);
    const price   = piece.priceLabel || (piece.price ? `$ ${Number(piece.price).toLocaleString('es-CO')}` : 'Consultar precio');
    const slug    = escapeHtml(piece.slug);
    const name    = escapeHtml(piece.name);

    return `
    <article class="glass glass-iridescent piece-card" data-piece="${escapeHtml(piece.id)}">
        <a href="pieza.html?p=${slug}" class="piece-media" aria-label="Ver ${name}">
            ${piece.image
                ? `<img src="${escapeHtml(piece.image)}" alt="${name}" class="piece-img" loading="lazy">`
                : `<div class="piece-placeholder" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" width="56" height="56">
                        <polygon points="12,2 22,8.5 12,22 2,8.5"/>
                    </svg>
                </div>`}
            <div class="piece-media-overlay" aria-hidden="true"></div>
            ${piece.badge ? `<span class="piece-badge chip"><span class="chip-dot"></span>${escapeHtml(piece.badge)}</span>` : ''}
            <div class="piece-actions">
                ${wishlistBtn(piece)}
                ${cartBtn(piece)}
            </div>
        </a>
        <div class="piece-info">
            ${eyebrow ? `<div class="piece-eyebrow">${escapeHtml(eyebrow)}</div>` : ''}
            <h3 class="piece-name"><a href="pieza.html?p=${slug}">${name}</a></h3>
            ${meta ? `<div class="piece-meta">${escapeHtml(meta)}</div>` : ''}
            <div class="piece-footer">
                <span class="piece-price mono">${escapeHtml(price)}</span>
                <a href="pieza.html?p=${slug}" class="piece-link">Ver pieza ${arrowSvg()}</a>
            </div>
        </div>
    </article>`;
}

export function wirePieceCardActions(container) {
    if (!container) return;
    wishlist.initButtons(container, (_slug, added) => {
        toast.show(
            added ? 'Añadida a tu lista de deseos' : 'Eliminada de la lista',
            added ? 'added' : 'removed'
        );
    });
    cart.initButtons(container, (_slug, added) => {
        toast.show(
            added ? 'Añadida al carrito' : 'Eliminada del carrito',
            added ? 'added' : 'removed'
        );
    });
}

export { normCase, escapeHtml };
