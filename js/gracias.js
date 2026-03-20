/**
 * Bersaglio Jewelry — Confirmation Page
 * Muestra la confirmación del pago después de completar el checkout con Wompi.
 */

import { loadAllComponents } from './components.js';
import { initEffects } from './effects.js';
import { cart } from './cart.js';
import db from './data/catalog.js';
import { wompiCheckout } from './checkout.js';

async function init() {
    await loadAllComponents();
    await db.load();
    initWhatsAppButton();
    renderConfirmation();
    initEffects();
}

function initWhatsAppButton() {
    const { whatsapp } = db.getContact();
    const phone = whatsapp.replace('+', '');
    const msg   = encodeURIComponent('Hola Bersaglio Jewelry, acabo de realizar un pago y tengo una consulta.');
    const url   = `https://wa.me/${phone}?text=${msg}`;
    document.querySelectorAll('.wa-float, #wa-nav, #conf-whatsapp').forEach(btn => {
        btn.href = url;
    });
}

function renderConfirmation() {
    // Get transaction ID from URL params (Wompi redirects with ?id=...)
    const params        = new URLSearchParams(window.location.search);
    const transactionId = params.get('id') || '—';

    // Get checkout data from sessionStorage
    const raw      = sessionStorage.getItem('bersaglio_checkout');
    const checkout = raw ? JSON.parse(raw) : null;

    // Transaction ID
    const confIdEl = document.getElementById('conf-transaction-id');
    if (confIdEl) confIdEl.textContent = transactionId;

    if (checkout) {
        // Reference
        const refEl = document.getElementById('conf-reference');
        if (refEl) refEl.textContent = checkout.reference;

        // Items list
        const itemsEl = document.getElementById('confirmation-items');
        if (itemsEl && checkout.pieces) {
            itemsEl.innerHTML = checkout.pieces.map(p => `
                <div class="conf-item">
                    <span class="conf-item-name">${p.name}</span>
                    <span class="conf-item-price">${wompiCheckout.formatCOP(p.price)}</span>
                </div>
            `).join('');
        }

        // Total
        const totalEl = document.getElementById('conf-total');
        if (totalEl) totalEl.textContent = wompiCheckout.formatCOP(checkout.total);

        // Clear paid items from cart
        if (checkout.pieces) {
            checkout.pieces.forEach(p => cart.remove(p.slug));
        }

        // Clean up sessionStorage
        sessionStorage.removeItem('bersaglio_checkout');
    }
}

init();
