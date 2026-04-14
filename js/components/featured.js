/**
 * Bersaglio Jewelry — Featured Pieces Component V2
 * Editorial grid, tall image area, reveal-on-hover actions
 */

import db from '../data/catalog.js';
import Renderer from '../utils/renderer.js';
import { wishlist } from '../wishlist.js';
import { cart }     from '../cart.js';
import { toast }    from '../toast.js';
import { buildProductListSchema, injectJsonLd } from '../utils/schema.js';

const specLabels = {
    stone: 'Piedra', carat: 'Quilates', metal: 'Metal', accent: 'Acentos',
    cut: 'Talla', color: 'Color', clarity: 'Calidad', weight: 'Peso',
    style: 'Estilo', finish: 'Acabado', length: 'Longitud'
};

function renderSpecs(specs) {
    return Object.entries(specs)
        .filter(([k]) => k !== 'certificate')
        .slice(0, 3) // show max 3 specs on card
        .map(([k, v]) => `<span class="spec-item"><strong>${specLabels[k] || k}:</strong> ${v}</span>`)
        .join('');
}

function wishlistBtn(piece) {
    const saved = wishlist.has(piece.slug);
    return `
        <button
            class="piece-wishlist-btn${saved ? ' is-saved' : ''}"
            data-wishlist-slug="${piece.slug}"
            aria-label="${saved ? 'Quitar de lista de deseos' : 'Añadir a lista de deseos'}"
            title="${saved ? 'Quitar de lista de deseos' : 'Añadir a lista de deseos'}"
        >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="${saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
        </button>`;
}

function cartBtn(piece) {
    const inCart = cart.has(piece.slug);
    return `
        <button
            class="piece-cart-btn${inCart ? ' is-in-cart' : ''}"
            data-cart-slug="${piece.slug}"
            aria-label="${inCart ? 'Quitar del carrito' : 'Añadir al carrito'}"
            title="${inCart ? 'Quitar del carrito' : 'Añadir al carrito'}"
        >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
        </button>`;
}

const collectionNames = {
    'anillos':          'Anillos',
    'topos-aretes':     'Topos & Aretes',
    'dijes-colgantes':  'Dijes & Colgantes',
    'argollas':         'Argollas',
};

export function renderFeaturedPieces() {
    const pieces    = db.getFeatured(6);
    const container = document.querySelector('#featured-grid');
    const section   = document.querySelector('#piezas');
    if (!container) return;

    // Hide entire section when no featured pieces exist
    if (!pieces.length) {
        if (section) section.classList.add('is-empty');
        container.innerHTML = '';
        return;
    }

    if (section) section.classList.remove('is-empty');

    Renderer.renderList('#featured-grid', pieces, (piece) => {
        const colName = collectionNames[piece.collection] || '';
        return `
        <article class="piece-card animate-on-scroll" data-piece="${piece.id}">
            <a href="pieza.html?p=${piece.slug}" class="piece-image-wrapper" aria-label="Ver ${piece.name}">
                ${piece.image
                    ? `<img src="${piece.image}" alt="${piece.name}" class="piece-img" loading="lazy">`
                    : `<div class="piece-placeholder" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" aria-hidden="true">
                            <polygon points="12,2 22,8.5 12,22 2,8.5"/>
                            <line x1="2" y1="8.5" x2="22" y2="8.5"/>
                            <polyline points="7,2 12,8.5 17,2"/>
                        </svg>
                    </div>`}
                ${piece.badge ? `<span class="piece-badge">${piece.badge}</span>` : ''}
                <div class="piece-actions">
                    ${wishlistBtn(piece)}
                    ${cartBtn(piece)}
                </div>
            </a>
            <div class="piece-info">
                ${colName ? `<a href="${piece.collection}.html" class="piece-collection-tag">${colName}</a>` : ''}
                <h3 class="piece-name">
                    <a href="pieza.html?p=${piece.slug}">${piece.name}</a>
                </h3>
                <p class="piece-desc">${piece.description}</p>
                <div class="piece-specs">${renderSpecs(piece.specs)}</div>
                <div class="piece-footer">
                    <span class="piece-price">${piece.priceLabel}</span>
                    <a href="pieza.html?p=${piece.slug}" class="piece-cta" aria-label="Ver detalle de ${piece.name}">
                        Ver pieza
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
                    </a>
                </div>
            </div>
        </article>
    `; });

    // Inject valid Product structured data (JSON-LD) for Google
    injectJsonLd('featured-products-schema', buildProductListSchema(pieces));

    // Event delegation: wishlist ♡
    wishlist.initButtons(container, (_slug, added) => {
        toast.show(
            added ? 'Añadida a tu lista de deseos' : 'Eliminada de la lista',
            added ? 'added' : 'removed'
        );
    });

    // Event delegation: cart
    cart.initButtons(container, (_slug, added) => {
        toast.show(
            added ? 'Añadida al carrito' : 'Eliminada del carrito',
            added ? 'added' : 'removed'
        );
    });
}
