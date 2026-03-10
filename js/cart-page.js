/**
 * Bersaglio Jewelry — Cart Page
 * Renderiza las piezas guardadas en el carrito y permite solicitar por WhatsApp.
 */

import { loadAllComponents } from './components.js';
import { initEffects } from './effects.js';
import { cart }    from './cart.js';
import { wishlist } from './wishlist.js';
import { toast }   from './toast.js';
import db          from './data/catalog.js';

async function init() {
    await loadAllComponents();
    await db.load();

    renderCart();
    cart.onChange(() => renderCart());

    initActions();
    initWhatsAppButton();
    initEffects();
}

function initWhatsAppButton() {
    const { whatsapp } = db.getContact();
    const phone = whatsapp.replace('+', '');
    const msg   = encodeURIComponent('Hola Bersaglio Jewelry, me interesa conocer más sobre sus piezas de alta joyería.');
    const url   = `https://wa.me/${phone}?text=${msg}`;
    document.querySelectorAll('.wa-float, #wa-nav').forEach(btn => { btn.href = url; });
}

function renderCart() {
    const slugs   = cart.getAll();
    const grid    = document.getElementById('cart-grid');
    const empty   = document.getElementById('cart-empty');
    const actions = document.getElementById('cart-actions');
    const countEl = document.getElementById('cart-item-count');

    if (!slugs.length) {
        if (grid)    grid.innerHTML    = '';
        if (empty)   empty.hidden      = false;
        if (actions) actions.hidden    = true;
        return;
    }

    if (empty)   empty.hidden   = true;
    if (actions) actions.hidden = false;

    const pieces = slugs.map(s => db.getBySlug(s)).filter(Boolean);

    if (countEl) {
        const n = pieces.length;
        countEl.textContent = `${n} ${n === 1 ? 'pieza' : 'piezas'}`;
    }

    if (grid) {
        grid.innerHTML = pieces.map(piece => cartCard(piece)).join('');

        // Cart button delegation
        cart.initButtons(grid, (slug, added) => {
            toast.show(
                added ? 'Añadida al carrito' : 'Eliminada del carrito',
                added ? 'added' : 'removed'
            );
        });

        // Wishlist button delegation
        wishlist.initButtons(grid, (_slug, added) => {
            toast.show(
                added ? 'Añadida a lista de deseos' : 'Eliminada de la lista',
                added ? 'added' : 'removed'
            );
        });
    }
}

function cartCard(piece) {
    const inWishlist = wishlist.has(piece.slug);
    const specLabels = {
        stone: 'Piedra', carat: 'Quilates', metal: 'Metal',
        cut: 'Talla', color: 'Color', clarity: 'Claridad',
    };
    const specs = Object.entries(piece.specs || {})
        .filter(([k]) => ['stone', 'carat', 'metal'].includes(k))
        .map(([k, v]) => `<span class="spec-item"><strong>${specLabels[k] || k}:</strong> ${v}</span>`)
        .join('');

    return `
        <article class="piece-card cart-card animate-on-scroll">
            <div class="piece-image-wrapper">
                <div class="piece-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><polygon points="12,2 22,8.5 12,22 2,8.5"/><line x1="2" y1="8.5" x2="22" y2="8.5"/><polyline points="7,2 12,8.5 17,2"/></svg>
                </div>
                ${piece.badge ? `<span class="piece-badge">${piece.badge}</span>` : ''}
                <button
                    class="piece-wishlist-btn ${inWishlist ? 'is-saved' : ''}"
                    data-wishlist-slug="${piece.slug}"
                    aria-label="${inWishlist ? 'Quitar de lista de deseos' : 'Añadir a lista de deseos'}"
                    title="${inWishlist ? 'Quitar de lista de deseos' : 'Añadir a lista de deseos'}"
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
            </div>
            <div class="piece-info">
                <h3 class="piece-name">${piece.name}</h3>
                <p class="piece-desc">${piece.description}</p>
                <div class="piece-specs">${specs}</div>
                <div class="piece-footer">
                    <span class="piece-price">${piece.priceLabel}</span>
                    <div class="piece-footer-actions">
                        <a href="pieza.html?p=${piece.slug}" class="piece-cta">
                            Ver detalle
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </a>
                        <button
                            class="cart-remove-btn"
                            data-cart-slug="${piece.slug}"
                            aria-label="Quitar del carrito"
                            title="Quitar del carrito"
                        >
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    `;
}

function initActions() {
    // Clear cart button
    document.getElementById('btn-clear-cart')?.addEventListener('click', () => {
        cart.clear();
        toast.show('Carrito vacío', 'removed');
    });

    // WhatsApp inquiry for all cart items
    document.getElementById('btn-cart-wa')?.addEventListener('click', async () => {
        const slugs  = cart.getAll();
        if (!slugs.length) return;
        const pieces = slugs.map(s => db.getBySlug(s)).filter(Boolean);
        const list   = pieces.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
        const { whatsapp } = db.getContact();
        const phone  = whatsapp.replace('+', '');
        const msg    = encodeURIComponent(
            `Hola Bersaglio Jewelry, estoy interesado/a en las siguientes piezas:\n\n${list}\n\n¿Me pueden dar más información?`
        );
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank', 'noopener');
    });
}

init();
