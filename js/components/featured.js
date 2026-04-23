/**
 * Bersaglio Jewelry — Featured Pieces Component V4
 * 3D parallax tilt · Magnetic buttons · Hover reveal · Scroll entrance
 * Dark emerald · Claude Design V2 potentiated
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

const SPEC_PRIORITY = ['carat', 'weight', 'clarity', 'stone', 'cut', 'color', 'metal'];

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

function normCase(text) {
    if (!text) return '';
    if (text.length > 15 && !/[a-záéíóúñü]/.test(text)) {
        return text.toLowerCase().replace(/(^|[.!?]\s*)([a-záéíóúñü])/g,
            (m, prefix, char) => prefix + char.toUpperCase());
    }
    return text;
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

    Renderer.renderList('#featured-grid', pieces, (piece) => {
        const metal = piece.specs?.metal || 'Oro 18K';
        const chip  = chipClass(piece.specs?.metal);
        const specs = getTopSpecs(piece.specs);
        const ref   = piece.code || '';
        const desc  = normCase(piece.description);

        return `
        <article class="piece-card" data-piece="${piece.id}">
            <a href="pieza.html?p=${piece.slug}" class="piece-media" aria-label="Ver ${piece.name}">
                ${piece.image
                    ? `<img src="${piece.image}" alt="${piece.name}" class="piece-img" loading="lazy">`
                    : `<div class="piece-placeholder" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8">
                            <polygon points="12,2 22,8.5 12,22 2,8.5"/>
                        </svg>
                    </div>`}
                <div class="piece-shine"></div>
                ${piece.badge ? `<span class="piece-badge">${piece.badge}</span>` : ''}
                <div class="piece-actions">
                    ${wishlistBtn(piece)}
                    ${cartBtn(piece)}
                </div>
            </a>
            <div class="piece-info">
                <div class="piece-meta-row">
                    <span class="piece-chip ${chip}">${metal}</span>
                    ${ref ? `<span class="piece-ref">${ref}</span>` : ''}
                </div>
                <h3 class="piece-name">
                    <a href="pieza.html?p=${piece.slug}">${piece.name}</a>
                </h3>
                ${desc ? `<p class="piece-desc">${desc}</p>` : ''}
                ${specs.length ? `
                <div class="piece-spec-grid">
                    ${specs.map((s, i) => `
                        <div class="spec-cell${i > 0 ? ' has-border' : ''}">
                            <span class="spec-lbl">${s.label}</span>
                            <span class="spec-val">${s.value}</span>
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

    const cards = container.querySelectorAll('.piece-card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('is-tilting');
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.classList.remove('is-tilting');
        });
    });

    container.addEventListener('mousemove', e => {
        const card = e.target.closest('.piece-card');
        if (!card || !card.classList.contains('is-tilting')) return;

        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const tiltX = (0.5 - y) * 6;
        const tiltY = (x - 0.5) * 6;

        card.style.transform =
            `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(6px)`;
        card.style.setProperty('--mx', (x * 100) + '%');
        card.style.setProperty('--my', (y * 100) + '%');

        const btn = e.target.closest('.piece-btn');
        if (btn) {
            const br = btn.getBoundingClientRect();
            btn.style.setProperty('--bx', ((e.clientX - br.left) / br.width * 100) + '%');
            btn.style.setProperty('--by', ((e.clientY - br.top) / br.height * 100) + '%');
        }
    });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none)').matches;

    if (!prefersReducedMotion && !isTouch && 'IntersectionObserver' in window) {
        cards.forEach((card, i) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(24px)';
            const delay = i * 0.12;

            const observer = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting) {
                    card.style.transition =
                        `opacity 0.7s cubic-bezier(0.19,1,0.22,1) ${delay}s, ` +
                        `transform 0.7s cubic-bezier(0.19,1,0.22,1) ${delay}s`;
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                    observer.unobserve(card);
                    setTimeout(() => {
                        card.style.transition = '';
                        card.style.opacity = '';
                        card.style.transform = '';
                    }, (delay + 0.8) * 1000);
                }
            }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

            observer.observe(card);
        });
    }
}
