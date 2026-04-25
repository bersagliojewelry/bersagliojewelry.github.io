/**
 * Bersaglio Jewelry — Cart Page
 * Renderiza las piezas guardadas en el carrito, muestra resumen de precios
 * y permite pagar con Wompi o consultar por WhatsApp.
 */

import { loadAllComponents } from './components.js';
import { initEffects } from './effects.js';
import { cart }    from './cart.js';
import { wishlist } from './wishlist.js';
import { toast }   from './toast.js';
import db          from './data/catalog.js';
import { wompiCheckout } from './checkout.js';
import { renderPieceCardHTML, wirePieceCardActions } from './components/piece-card.js';

async function init() {
    await loadAllComponents();
    await db.load();

    renderCart();
    cart.onChange(() => renderCart());
    // Re-render when admin updates piece data in real-time.
    db.onChange(() => renderCart());

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
        hideCheckoutSummary();
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
        wirePieceCardActions(grid);
    }

    renderCheckoutSummary(pieces);
}

// cartCard delegates to the shared aqua renderer (consistent with home/catalog/wishlist).
// The cart-specific "remove" action is handled via the standard wishlist+cart toggle
// in piece-card.js — clicking the cart icon button toggles the slug out of the cart,
// which fires cart.onChange and re-renders this page.
const cartCard = renderPieceCardHTML;

/* ─── Checkout Summary ──────────────────────────────────────────────────────── */

function renderCheckoutSummary(pieces) {
    const summaryEl = document.getElementById('cart-summary');
    if (!summaryEl) return;

    const { pricedItems, unpricedItems, totalFormatted } = wompiCheckout.summary(pieces);

    // No priced items at all → hide summary
    if (!pricedItems.length) {
        summaryEl.hidden = true;
        return;
    }

    summaryEl.hidden = false;

    // Line items
    const linesEl = document.getElementById('cart-summary-lines');
    if (linesEl) {
        linesEl.innerHTML = pricedItems.map(p => `
            <div class="cart-summary-line">
                <span class="cart-summary-line-name">${p.name}</span>
                <span class="cart-summary-line-price">${wompiCheckout.formatCOP(p.price)}</span>
            </div>
        `).join('');
    }

    // Total
    const totalEl = document.getElementById('cart-summary-total-value');
    if (totalEl) totalEl.textContent = totalFormatted;

    // Unpriced items note
    const unpricedNote = document.getElementById('cart-unpriced-note');
    const unpricedText = document.getElementById('cart-unpriced-text');
    if (unpricedNote && unpricedText) {
        if (unpricedItems.length) {
            unpricedNote.hidden = false;
            const names = unpricedItems.map(p => `<strong>${p.name}</strong>`).join(', ');
            unpricedText.innerHTML = `${names} ${unpricedItems.length === 1 ? 'requiere' : 'requieren'} cotización personalizada. Consulta por WhatsApp para conocer el precio.`;
        } else {
            unpricedNote.hidden = true;
        }
    }
}

function hideCheckoutSummary() {
    const summaryEl = document.getElementById('cart-summary');
    if (summaryEl) summaryEl.hidden = true;
}

/* ─── Actions ───────────────────────────────────────────────────────────────── */

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

    // Wompi checkout button
    document.getElementById('btn-wompi-pay')?.addEventListener('click', () => {
        const slugs  = cart.getAll();
        if (!slugs.length) return;
        const pieces = slugs.map(s => db.getBySlug(s)).filter(Boolean);

        wompiCheckout.pay(pieces, (transaction) => {
            // On successful payment, clear the priced items from cart
            const { pricedItems } = wompiCheckout.summary(pieces);
            pricedItems.forEach(p => cart.remove(p.slug));
            toast.show('¡Pago exitoso! Gracias por tu compra.', 'added');
        });
    });
}

init();
