/**
 * Bersaglio Jewelry — Cart Drawer (lateral slide-in)
 *
 * Slide-in panel from the right when the user clicks the cart icon
 * in the header. Shows current cart items + subtotal + "Ir al
 * checkout" CTA that navigates to carrito.html.
 *
 * Sync:
 *   - cart.onChange       → re-render items + subtotal
 *   - db.onChange         → re-render in case admin edits prices
 *   - Click on header cart icon → open drawer (preventDefault on link)
 *   - ESC key             → close drawer
 *   - Click on backdrop   → close drawer
 *
 * Body scroll lock uses the same iOS Safari technique as the mobile
 * menu drawer (body.position:fixed + saved scrollY restore).
 */

import db          from '../data/catalog.js';
import { cart }    from '../cart.js';
import { toast }   from '../toast.js';
import { wompiCheckout } from '../checkout.js';

let _drawerEl  = null;
let _backdropEl = null;
let _open      = false;
let _savedScrollY = 0;

function escapeHtml(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function buildDOM() {
    if (_drawerEl) return;

    _backdropEl = document.createElement('div');
    _backdropEl.className = 'cart-drawer-backdrop';
    _backdropEl.setAttribute('aria-hidden', 'true');

    _drawerEl = document.createElement('aside');
    _drawerEl.className = 'cart-drawer glass';
    _drawerEl.id        = 'cart-drawer';
    _drawerEl.setAttribute('role', 'dialog');
    _drawerEl.setAttribute('aria-label', 'Carrito de compras');
    _drawerEl.setAttribute('aria-modal', 'true');

    document.body.appendChild(_backdropEl);
    document.body.appendChild(_drawerEl);

    _backdropEl.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && _open) closeDrawer();
    });
}

function lockBodyScroll() {
    _savedScrollY = window.scrollY;
    document.body.style.top = `-${_savedScrollY}px`;
    document.body.classList.add('cart-drawer-open');
}
function unlockBodyScroll() {
    document.body.classList.remove('cart-drawer-open');
    document.body.style.top = '';
    window.scrollTo(0, _savedScrollY);
}

function renderDrawer() {
    if (!_drawerEl) return;

    const slugs  = cart.getAll();
    const pieces = slugs.map(s => db.getBySlug(s)).filter(Boolean);
    const { totalFormatted, pricedItems } = wompiCheckout.summary(pieces);

    if (!pieces.length) {
        _drawerEl.innerHTML = `
            <header class="cart-drawer-header">
                <div>
                    <span class="section-eyebrow">Carrito</span>
                    <h3 class="cart-drawer-title">Tu <em class="emerald-text">selección</em></h3>
                </div>
                <button type="button" class="cart-drawer-close" aria-label="Cerrar carrito">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
                </button>
            </header>
            <div class="cart-drawer-empty">
                <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="0.7" aria-hidden="true">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                <p>Tu carrito está vacío</p>
                <a href="colecciones.html" class="btn-aqua btn-aqua-emerald">Explorar colecciones</a>
            </div>
        `;
    } else {
        _drawerEl.innerHTML = `
            <header class="cart-drawer-header">
                <div>
                    <span class="section-eyebrow">Carrito · ${pieces.length} ${pieces.length === 1 ? 'pieza' : 'piezas'}</span>
                    <h3 class="cart-drawer-title">Tu <em class="emerald-text">selección</em></h3>
                </div>
                <button type="button" class="cart-drawer-close" aria-label="Cerrar carrito">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
                </button>
            </header>

            <div class="cart-drawer-items">
                ${pieces.map(p => `
                    <article class="cart-drawer-item">
                        <a href="pieza.html?p=${escapeHtml(p.slug)}" class="cart-drawer-item-img" aria-label="Ver ${escapeHtml(p.name)}">
                            ${p.image
                                ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy">`
                                : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" width="32" height="32" aria-hidden="true"><polygon points="12,2 22,8.5 12,22 2,8.5"/></svg>`}
                        </a>
                        <div class="cart-drawer-item-body">
                            <a href="pieza.html?p=${escapeHtml(p.slug)}" class="cart-drawer-item-name">${escapeHtml(p.name)}</a>
                            <span class="cart-drawer-item-meta">${escapeHtml(p.specs?.stone || p.specs?.metal || '')}</span>
                            <span class="cart-drawer-item-price mono">${escapeHtml(p.priceLabel || (p.price ? wompiCheckout.formatCOP(p.price) : 'Cotización'))}</span>
                        </div>
                        <button type="button" class="cart-drawer-item-remove" data-cart-remove="${escapeHtml(p.slug)}" aria-label="Quitar ${escapeHtml(p.name)} del carrito" title="Quitar">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                        </button>
                    </article>
                `).join('')}
            </div>

            <footer class="cart-drawer-footer">
                ${pricedItems.length ? `
                    <div class="cart-drawer-subtotal">
                        <span>Subtotal</span>
                        <span class="mono cart-drawer-subtotal-value">${totalFormatted}</span>
                    </div>
                ` : `
                    <div class="cart-drawer-quote-note">
                        Algunas piezas requieren cotización. Continúa al checkout para coordinar.
                    </div>
                `}
                <a href="carrito.html" class="btn-aqua btn-aqua-emerald cart-drawer-checkout-btn">
                    Ir al checkout
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                </a>
                <button type="button" class="cart-drawer-continue">Seguir explorando</button>
            </footer>
        `;
    }

    // Wire up close + remove handlers
    _drawerEl.querySelector('.cart-drawer-close')?.addEventListener('click', closeDrawer);
    _drawerEl.querySelector('.cart-drawer-continue')?.addEventListener('click', closeDrawer);
    _drawerEl.querySelectorAll('[data-cart-remove]').forEach(btn => {
        btn.addEventListener('click', () => {
            const slug = btn.dataset.cartRemove;
            cart.remove(slug);
            toast.show('Eliminada del carrito', 'removed');
        });
    });
}

function openDrawer() {
    buildDOM();
    renderDrawer();
    _open = true;
    requestAnimationFrame(() => {
        _backdropEl.classList.add('is-open');
        _drawerEl.classList.add('is-open');
    });
    lockBodyScroll();
    // Focus the close button for accessibility
    setTimeout(() => _drawerEl.querySelector('.cart-drawer-close')?.focus(), 100);
}

function closeDrawer() {
    if (!_open) return;
    _open = false;
    _backdropEl?.classList.remove('is-open');
    _drawerEl?.classList.remove('is-open');
    unlockBodyScroll();
}

/**
 * Wire up the header cart icon: clicking it opens the drawer
 * instead of navigating to carrito.html (the link is preserved as
 * a fallback for non-JS users + for users who Cmd+Click to open
 * the cart in a new tab).
 */
export function initCartDrawer() {
    const cartBtn = document.querySelector('.header.header-aqua .cart-btn');
    if (!cartBtn) return;

    cartBtn.addEventListener('click', e => {
        // Allow Cmd/Ctrl+Click to open carrito.html in new tab
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        openDrawer();
    });

    // Re-render drawer on cart/db changes (only does work when drawer is built)
    cart.onChange(() => { if (_drawerEl) renderDrawer(); });
    db.onChange(() => { if (_drawerEl) renderDrawer(); });
}

// Expose for programmatic open (e.g. after add-to-cart from another page)
if (typeof window !== 'undefined') {
    window.openCartDrawer = openDrawer;
}
