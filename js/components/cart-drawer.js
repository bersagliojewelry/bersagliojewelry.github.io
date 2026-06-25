/**
 * Bersaglio Jewelry — Cart drawer (right slide-in glass).
 *
 * Mirror funcional de BERSAGLIO NOVO/project/js/shell.jsx (CartDrawer L183-244).
 *
 * API:
 *   import { initCartDrawer } from './components/cart-drawer.js';
 *   initCartDrawer();
 *
 *   // Abrir programáticamente:
 *   document.dispatchEvent(new CustomEvent('bj:cart-drawer:open'));
 *
 * Responsabilidades:
 *  - Lazy-build del DOM en el primer open (ahorra ciclos).
 *  - Render de items: imagen + nombre + qty stepper (− / + ) + remove + price.
 *  - Subtotal mono live.
 *  - Empty state con CTA.
 *  - iOS body scroll lock (position:fixed + restore scrollY on close).
 *  - Suscripto a cart.onChange + data.onChange (resync si admin actualiza precios).
 *  - ESC + click en backdrop cierran.
 */

import { html, escape } from '../core/html.js';
import { cart } from '../core/cart.js';
import { format$ } from '../core/format.js';
import { data } from '../core/data.js';
import { pieceUrl } from '../core/urls.js';

let _root = null;
let _backdrop = null;
let _open = false;
let _savedScrollY = 0;
let _initialized = false;

function lockScroll() {
    _savedScrollY = window.scrollY;
    document.body.style.top = `-${_savedScrollY}px`;
    document.body.classList.add('cart-drawer-open');
}

function unlockScroll() {
    document.body.classList.remove('cart-drawer-open');
    document.body.style.top = '';
    window.scrollTo(0, _savedScrollY);
}

function buildDOM() {
    if (_initialized) return;
    _backdrop = document.createElement('div');
    _backdrop.className = 'bj-drawer-backdrop';
    _backdrop.setAttribute('aria-hidden', 'true');
    _backdrop.addEventListener('click', closeDrawer);

    _root = document.createElement('aside');
    _root.className = 'glass bj-cart-drawer';
    _root.setAttribute('role', 'dialog');
    _root.setAttribute('aria-modal', 'true');
    _root.setAttribute('aria-label', 'Carrito de compra');
    _root.addEventListener('click', onDrawerClick);

    document.body.appendChild(_backdrop);
    document.body.appendChild(_root);

    cart.onChange(() => { if (_open) renderContents(); });
    data.onChange(() => { if (_open) renderContents(); });

    document.addEventListener('keydown', e => {
        if (_open && e.key === 'Escape') closeDrawer();
    });

    _initialized = true;
}

function joinCartWithPieces() {
    const items = cart.getAll();
    return items.map(item => {
        const piece = data.getBySlug(item.slug);
        return { ...item, piece };
    });
}

function renderContents() {
    if (!_root) return;
    const rows = joinCartWithPieces();
    const subtotal = rows.reduce((s, r) => {
        const p = Number(r.piece?.price || 0);
        return s + p * (r.qty || 1);
    }, 0);
    const totalQty = rows.reduce((s, r) => s + (r.qty || 1), 0);

    _root.innerHTML = html`
        <header class="bj-cart-header">
            <div>
                <div class="eyebrow">Carrito</div>
                <h3 class="bj-cart-title">Tus joyas</h3>
            </div>
            <button type="button"
                    class="bj-cart-close"
                    data-action="close"
                    aria-label="Cerrar carrito">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <line x1="6" y1="6" x2="18" y2="18"/>
                    <line x1="18" y1="6" x2="6" y2="18"/>
                </svg>
            </button>
        </header>

        <div class="bj-cart-body">
            ${rows.length === 0 ? renderEmpty() : rows.map(renderRow)}
        </div>

        ${rows.length > 0 ? html`
            <footer class="bj-cart-footer">
                <div class="bj-cart-subtotal-row">
                    <span class="eyebrow">Subtotal · ${totalQty} ${totalQty === 1 ? 'pieza' : 'piezas'}</span>
                    <span class="mono bj-cart-subtotal">${escape(format$(subtotal))}</span>
                </div>
                <a href="/carrito.html"
                   class="btn-aqua btn-aqua-emerald bj-cart-checkout-btn"
                   data-action="goto-checkout">
                    Ir al checkout
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M5 12h14M13 5l7 7-7 7"/>
                    </svg>
                </a>
                <p class="bj-cart-note">Los precios incluyen IVA. El envío se confirma en checkout.</p>
            </footer>` : ''}`;
}

function renderEmpty() {
    return html`
        <div class="bj-cart-empty">
            <img class="bj-cart-empty-illus" src="/img/cart-gems.webp" alt="" width="140" height="140" loading="lazy" decoding="async">
            <p class="bj-cart-empty-title">Tu carrito está vacío</p>
            <p class="bj-cart-empty-sub">Explora la colección y guarda piezas que te inspiren.</p>
            <a href="/colecciones.html"
               class="btn-aqua btn-aqua-emerald"
               data-action="close">
                Ver colecciones
            </a>
        </div>`;
}

function renderRow(row) {
    const { slug, qty, piece } = row;
    if (!piece) {
        // Pieza removida del catálogo — placeholder para que el usuario pueda quitarla
        return html`
            <article class="bj-cart-row is-stale" data-slug="${escape(slug)}">
                <div class="bj-cart-row-img bj-cart-row-img--missing" aria-hidden="true"></div>
                <div class="bj-cart-row-body">
                    <div class="bj-cart-row-name">Pieza no disponible</div>
                    <div class="bj-cart-row-meta mono">${escape(slug)}</div>
                    <div class="bj-cart-row-controls">
                        <button type="button"
                                class="bj-cart-row-remove"
                                data-action="remove"
                                data-slug="${escape(slug)}">Quitar</button>
                    </div>
                </div>
            </article>`;
    }
    const img = piece.images?.[0] || piece.image || '';
    const price = Number(piece.price || 0);
    return html`
        <article class="bj-cart-row" data-slug="${escape(slug)}">
            <a class="bj-cart-row-img"
               href="${pieceUrl(piece.slug || slug)}"
               style="background-image:url('${escape(img)}')"
               aria-label="Ver ${escape(piece.name || '')}"></a>
            <div class="bj-cart-row-body">
                <a class="bj-cart-row-name"
                   href="${pieceUrl(piece.slug || slug)}">${escape(piece.name || 'Pieza')}</a>
                <div class="bj-cart-row-meta mono">${escape(format$(price))}</div>
                <div class="bj-cart-row-controls">
                    <div class="bj-cart-qty">
                        <button type="button"
                                class="bj-cart-qty-btn"
                                data-action="dec"
                                data-slug="${escape(slug)}"
                                aria-label="Restar uno">−</button>
                        <span class="mono bj-cart-qty-val" aria-live="polite">${qty}</span>
                        <button type="button"
                                class="bj-cart-qty-btn"
                                data-action="inc"
                                data-slug="${escape(slug)}"
                                aria-label="Sumar uno">+</button>
                    </div>
                    <button type="button"
                            class="bj-cart-row-remove"
                            data-action="remove"
                            data-slug="${escape(slug)}">Quitar</button>
                </div>
            </div>
        </article>`;
}

function onDrawerClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const slug = btn.dataset.slug;

    if (action === 'close') {
        e.preventDefault();
        closeDrawer();
        return;
    }
    if (action === 'inc' && slug) {
        const item = cart.get(slug);
        cart.updateQty(slug, (item?.qty || 1) + 1);
        return;
    }
    if (action === 'dec' && slug) {
        const item = cart.get(slug);
        cart.updateQty(slug, (item?.qty || 1) - 1);
        return;
    }
    if (action === 'remove' && slug) {
        cart.remove(slug);
        return;
    }
    if (action === 'goto-checkout') {
        // Let the link navigate normally; just close the drawer.
        closeDrawer();
    }
}

export function openDrawer() {
    if (!_initialized) buildDOM();
    if (_open) return;
    _open = true;
    renderContents();
    requestAnimationFrame(() => {
        _backdrop.classList.add('is-open');
        _root.classList.add('is-open');
    });
    lockScroll();
}

export function closeDrawer() {
    if (!_open) return;
    _open = false;
    _backdrop?.classList.remove('is-open');
    _root?.classList.remove('is-open');
    unlockScroll();
}

export function initCartDrawer() {
    document.addEventListener('bj:cart-drawer:open', openDrawer);

    // Auto-open if URL has ?cart=1 (deep-link from email or share)
    if (new URLSearchParams(location.search).get('cart') === '1') {
        // Wait for first paint so drawer animates over hero
        requestAnimationFrame(() => requestAnimationFrame(openDrawer));
    }
}

export default { initCartDrawer, openDrawer, closeDrawer };
