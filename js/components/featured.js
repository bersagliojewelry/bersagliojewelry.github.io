/**
 * Bersaglio Jewelry — Featured Pieces Component V3
 * Asymmetric editorial cards · Gold shimmer border · Inner glow
 * Inspired by Claude Design "Piezas Cards" (Variant C — Asymmetric)
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

const SPEC_PRIORITY = ['carat', 'weight', 'clarity', 'stone', 'cut', 'color'];
const OFFSETS = ['offset-up', 'offset-down', 'offset-mid'];

function getTopSpecs(specs) {
    if (!specs) return [];
    return SPEC_PRIORITY
        .filter(k => specs[k])
        .slice(0, 3)
        .map(k => ({ label: specLabels[k] || k, value: specs[k] }));
}

function chipClass(metal) {
    if (!metal) return 'yellow';
    const m = metal.toLowerCase();
    if (m.includes('blanco') || m.includes('white')) return 'white';
    if (m.includes('rosa') || m.includes('rose')) return 'rose';
    return 'yellow';
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
            <svg viewBox="0 0 24 24" width="15" height="15" fill="${saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5">
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
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
        </button>`;
}

export function renderFeaturedPieces() {
    const pieces    = db.getFeatured(6);
    const container = document.querySelector('#featured-grid');
    const section   = document.querySelector('#piezas');
    if (!container) return;

    if (!pieces.length) {
        if (section) section.classList.add('is-empty');
        container.innerHTML = '';
        return;
    }

    if (section) section.classList.remove('is-empty');

    Renderer.renderList('#featured-grid', pieces, (piece, index) => {
        const offset = OFFSETS[index % 3];
        const tallClass = index % 2 === 0 ? ' tall' : '';
        const metal = piece.specs?.metal || 'Oro 18K';
        const chip = chipClass(piece.specs?.metal);
        const specs = getTopSpecs(piece.specs);
        const ref = piece.code || '';
        const num = String(index + 1).padStart(2, '0');

        return `
        <article class="piece-card ${offset} animate-on-scroll" data-piece="${piece.id}">
            <span class="piece-num">nº ${num}</span>
            <a href="pieza.html?p=${piece.slug}" class="piece-image-wrapper${tallClass}" aria-label="Ver ${piece.name}">
                ${piece.image
                    ? `<img src="${piece.image}" alt="${piece.name}" class="piece-img" loading="lazy">`
                    : `<div class="piece-placeholder" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8">
                            <polygon points="12,2 22,8.5 12,22 2,8.5"/>
                        </svg>
                    </div>`}
                <div class="piece-shine"></div>
                ${specs.length ? `
                <div class="piece-float-meta">
                    ${specs.slice(0, 2).map(s =>
                        `<span class="piece-float-dot">${s.value}</span>`
                    ).join('')}
                </div>` : ''}
                ${piece.badge ? `<span class="piece-badge">${piece.badge}</span>` : ''}
                <div class="piece-actions">
                    ${wishlistBtn(piece)}
                    ${cartBtn(piece)}
                </div>
            </a>
            <div class="piece-info">
                <div class="piece-top-row">
                    <span class="piece-chip ${chip}">${metal}</span>
                    ${ref ? `<span class="piece-ref">${ref}</span>` : ''}
                </div>
                <h3 class="piece-name">
                    <a href="pieza.html?p=${piece.slug}">${piece.name}</a>
                </h3>
                <p class="piece-desc">${piece.description}</p>
                ${specs.length ? `
                <div class="piece-spec-grid">
                    ${specs.map(s => `
                        <div>
                            <div class="spec-lbl">${s.label}</div>
                            <div class="spec-val">${s.value}</div>
                        </div>
                    `).join('')}
                </div>` : ''}
                <div class="piece-cta-row">
                    <a href="pieza.html?p=${piece.slug}" class="piece-btn primary">Ver pieza</a>
                    <a href="contacto.html" class="piece-btn ghost">Consultar</a>
                </div>
            </div>
        </article>`;
    });

    injectJsonLd('featured-products-schema', buildProductListSchema(pieces));

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

    container.addEventListener('mousemove', e => {
        const card = e.target.closest('.piece-card');
        if (!card) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
    });
}
