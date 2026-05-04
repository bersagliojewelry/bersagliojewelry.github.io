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
    initStepper();
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
    const slugs       = cart.getAll();
    const grid        = document.getElementById('cart-grid');
    const empty       = document.getElementById('cart-empty');
    const actions     = document.getElementById('cart-actions');
    const countEl     = document.getElementById('cart-item-count');
    const stepperWrap = document.getElementById('checkout-stepper-wrap');
    const layout      = document.getElementById('checkout-layout');

    if (!slugs.length) {
        if (grid)        grid.innerHTML  = '';
        if (empty)       empty.hidden    = false;
        if (actions)     actions.hidden  = true;
        if (stepperWrap) stepperWrap.hidden = true;
        if (layout)      layout.hidden   = true;
        return;
    }

    if (empty)       empty.hidden    = true;
    if (actions)     actions.hidden  = false;
    if (stepperWrap) stepperWrap.hidden = false;
    if (layout)      layout.hidden   = false;

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

/* ─── Checkout Summary (sticky sidebar — Phase Item-1) ─────────────────────── */

function renderCheckoutSummary(pieces) {
    const { pricedItems, unpricedItems, totalFormatted } = wompiCheckout.summary(pieces);

    // Line items inside the sticky sidebar
    const linesEl = document.getElementById('cart-summary-lines');
    if (linesEl) {
        if (!pricedItems.length) {
            linesEl.innerHTML = '';
        } else {
            linesEl.innerHTML = pricedItems.map(p => `
                <div class="cart-summary-line">
                    <span class="cart-summary-line-name">${p.name}</span>
                    <span class="cart-summary-line-price mono">${wompiCheckout.formatCOP(p.price)}</span>
                </div>
            `).join('');
        }
    }

    // Subtotal
    const subEl = document.getElementById('cart-summary-subtotal');
    if (subEl) subEl.textContent = pricedItems.length ? totalFormatted : '—';

    // Total
    const totalEl = document.getElementById('cart-summary-total-value');
    if (totalEl) totalEl.textContent = pricedItems.length ? totalFormatted : 'Cotización';

    // Wompi quick-pay button (hide if no priced items)
    const wompiBtn = document.getElementById('btn-wompi-pay');
    if (wompiBtn) wompiBtn.hidden = !pricedItems.length;

    // Confirm button label on step 3
    const confirmLabel = document.getElementById('btn-confirm-label');
    if (confirmLabel) {
        confirmLabel.textContent = pricedItems.length
            ? `Confirmar compra · ${totalFormatted}`
            : 'Solicitar cotización';
    }

    // Unpriced items note
    const unpricedNote = document.getElementById('cart-unpriced-note');
    const unpricedText = document.getElementById('cart-unpriced-text');
    if (unpricedNote && unpricedText) {
        if (unpricedItems.length) {
            unpricedNote.hidden = false;
            const names = unpricedItems.map(p => `<strong>${p.name}</strong>`).join(', ');
            unpricedText.innerHTML = `${names} ${unpricedItems.length === 1 ? 'requiere' : 'requieren'} cotización por WhatsApp.`;
        } else {
            unpricedNote.hidden = true;
        }
    }
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

/* ─── Stepper navigation (3 steps: Carrito → Envío → Pago) ──────────────── */

function initStepper() {
    const stepper = document.querySelector('.checkout-stepper');
    if (!stepper) return;

    function goToStep(n) {
        // Update stepper buttons
        stepper.querySelectorAll('.checkout-step').forEach(btn => {
            btn.classList.toggle('is-active', Number(btn.dataset.step) === n);
        });
        // Show only the active step view
        document.querySelectorAll('.checkout-step-view').forEach(view => {
            const isActive = view.id === `checkout-step-${n}`;
            view.hidden = !isActive;
            view.classList.toggle('is-active', isActive);
        });
        // Show/hide elements bound to a specific step (e.g. quick-pay only on step 1)
        document.querySelectorAll('[data-step-show]').forEach(el => {
            el.hidden = Number(el.dataset.stepShow) !== n;
        });
        // Scroll back to the top of the stepper for context
        stepper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Direct stepper clicks
    stepper.addEventListener('click', e => {
        const btn = e.target.closest('.checkout-step');
        if (!btn) return;
        const n = Number(btn.dataset.step);
        if (n === 1 || cart.getAll().length) goToStep(n);
    });

    // "Continuar" forward buttons
    document.querySelectorAll('.checkout-step-next').forEach(btn => {
        btn.addEventListener('click', () => goToStep(Number(btn.dataset.next)));
    });

    // "Volver" backward buttons
    document.querySelectorAll('.checkout-step-prev').forEach(btn => {
        btn.addEventListener('click', () => goToStep(Number(btn.dataset.prev)));
    });

    // Shipping form: validates HTML5 + advances to step 3 on submit
    document.getElementById('shipping-form')?.addEventListener('submit', e => {
        e.preventDefault();
        if (!e.target.checkValidity()) {
            e.target.reportValidity();
            return;
        }
        // Persist shipping data in sessionStorage so a refresh doesn't lose it
        const fd = new FormData(e.target);
        const data = Object.fromEntries(fd.entries());
        try { sessionStorage.setItem('bj-shipping', JSON.stringify(data)); } catch {}
        goToStep(3);
    });

    // Restore shipping data on page load
    try {
        const saved = JSON.parse(sessionStorage.getItem('bj-shipping') || 'null');
        if (saved) {
            Object.entries(saved).forEach(([k, v]) => {
                const input = document.querySelector(`#shipping-form [name="${k}"]`);
                if (input) input.value = v;
            });
        }
    } catch {}

    // Confirm payment button (step 3)
    document.getElementById('btn-confirm-payment')?.addEventListener('click', () => {
        const slugs = cart.getAll();
        if (!slugs.length) return;
        const pieces = slugs.map(s => db.getBySlug(s)).filter(Boolean);
        const method = document.querySelector('input[name="payMethod"]:checked')?.value || 'wompi';

        if (method === 'wompi') {
            wompiCheckout.pay(pieces, () => {
                const { pricedItems } = wompiCheckout.summary(pieces);
                pricedItems.forEach(p => cart.remove(p.slug));
                try { sessionStorage.removeItem('bj-shipping'); } catch {}
                toast.show('¡Pago exitoso! Gracias por tu compra.', 'added');
            });
        } else if (method === 'transfer') {
            // For now: redirect to gracias.html with method query
            window.location.href = 'gracias.html?method=transfer';
        } else if (method === 'whatsapp') {
            // Reuse the existing WA inquiry flow
            document.getElementById('btn-cart-wa')?.click();
        }
    });
}

init();
