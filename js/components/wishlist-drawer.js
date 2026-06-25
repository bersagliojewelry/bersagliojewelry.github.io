/**
 * Bersaglio Jewelry — Wishlist drawer (right slide-in glass).
 *
 * Análogo al cart-drawer pero para wishlist (lista de slugs sin qty).
 * Cada item tiene pill "Al carrito" que invoca cart.toggle(slug).
 *
 * API:
 *   import { initWishlistDrawer } from './components/wishlist-drawer.js';
 *   initWishlistDrawer();
 *
 *   document.dispatchEvent(new CustomEvent('bj:wishlist-drawer:open'));
 */

import { html, escape } from '../core/html.js';
import { wishlist } from '../core/wishlist.js';
import { cart } from '../core/cart.js';
import { format$ } from '../core/format.js';
import { data } from '../core/data.js';
import { mergeGlobal, waHref } from '../core/global-defaults.js';
import { pieceUrl, pieceAbsUrl } from '../core/urls.js';

let _root = null;
let _backdrop = null;
let _open = false;
let _savedScrollY = 0;
let _initialized = false;

function lockScroll() {
    _savedScrollY = window.scrollY;
    document.body.style.top = `-${_savedScrollY}px`;
    document.body.classList.add('wishlist-drawer-open');
}
function unlockScroll() {
    document.body.classList.remove('wishlist-drawer-open');
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
    _root.className = 'glass bj-wishlist-drawer';
    _root.setAttribute('role', 'dialog');
    _root.setAttribute('aria-modal', 'true');
    _root.setAttribute('aria-label', 'Lista de deseos');
    _root.addEventListener('click', onDrawerClick);

    document.body.appendChild(_backdrop);
    document.body.appendChild(_root);

    wishlist.onChange(() => { if (_open) renderContents(); });
    cart.onChange(() => { if (_open) renderContents(); });
    data.onChange(() => { if (_open) renderContents(); });

    document.addEventListener('keydown', e => {
        if (_open && e.key === 'Escape') closeDrawer();
    });

    _initialized = true;
}

function joinWishlistWithPieces() {
    return wishlist.getAll().map(slug => ({ slug, piece: data.getBySlug(slug) }));
}

function buildShareURL(rows) {
    // WhatsApp desde la FUENTE ÚNICA (siteContent/global.contacto); fallback = default real.
    const waBase = waHref(mergeGlobal(data.getSiteContent('global')).contacto.whatsapp);
    const lines = rows.map(r => {
        const name = r.piece?.name || r.slug;
        const url = `${pieceAbsUrl(r.slug)}`;
        return `• ${name}\n  ${url}`;
    });
    const message = `Hola Bersaglio, me interesan estas piezas de mi lista:\n\n${lines.join('\n\n')}`;
    return `${waBase}?text=${encodeURIComponent(message)}`;
}

function renderContents() {
    if (!_root) return;
    const rows = joinWishlistWithPieces();
    const count = rows.length;
    const shareURL = buildShareURL(rows);

    _root.innerHTML = html`
        <header class="bj-cart-header">
            <div>
                <div class="eyebrow">Lista · ${count} ${count === 1 ? 'pieza' : 'piezas'}</div>
                <h3 class="bj-cart-title">Tus favoritas</h3>
            </div>
            <button type="button"
                    class="bj-cart-close"
                    data-action="close"
                    aria-label="Cerrar lista">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <line x1="6" y1="6" x2="18" y2="18"/>
                    <line x1="18" y1="6" x2="6" y2="18"/>
                </svg>
            </button>
        </header>

        <div class="bj-cart-body">
            ${count === 0 ? renderEmpty() : rows.map(renderRow)}
        </div>

        ${count > 0 ? html`
            <footer class="bj-cart-footer">
                <a class="btn-aqua btn-aqua-emerald bj-wishlist-share-btn"
                   href="${shareURL}"
                   target="_blank"
                   rel="noopener noreferrer"
                   data-action="share">
                    Consultar por WhatsApp
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M5 12h14M13 5l7 7-7 7"/>
                    </svg>
                </a>
                <a href="/lista-deseos.html"
                   class="btn-aqua bj-wishlist-fullpage-btn">
                    Ver lista completa
                </a>
            </footer>` : ''}`;
}

function renderEmpty() {
    return html`
        <div class="bj-cart-empty">
            <div class="bj-cart-empty-icon">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
            </div>
            <p class="bj-cart-empty-title">Tu lista está vacía</p>
            <p class="bj-cart-empty-sub">Guarda piezas que te inspiren para volver a verlas más tarde.</p>
            <a href="/colecciones.html" class="btn-aqua btn-aqua-emerald" data-action="close">
                Explorar colecciones
            </a>
        </div>`;
}

function renderRow(row) {
    const { slug, piece } = row;
    if (!piece) {
        return html`
            <article class="bj-cart-row is-stale" data-slug="${escape(slug)}">
                <div class="bj-cart-row-img bj-cart-row-img--missing" aria-hidden="true"></div>
                <div class="bj-cart-row-body">
                    <div class="bj-cart-row-name">Pieza no disponible</div>
                    <div class="bj-cart-row-meta mono">${escape(slug)}</div>
                    <div class="bj-cart-row-controls">
                        <button type="button"
                                class="bj-cart-row-remove"
                                data-action="wl-remove"
                                data-slug="${escape(slug)}">Quitar</button>
                    </div>
                </div>
            </article>`;
    }
    const img = piece.images?.[0] || piece.image || '';
    const inCart = cart.has(slug);
    return html`
        <article class="bj-cart-row" data-slug="${escape(slug)}">
            <a class="bj-cart-row-img"
               href="${pieceUrl(piece.slug || slug)}"
               style="background-image:url('${escape(img)}')"
               aria-label="Ver ${escape(piece.name || '')}"></a>
            <div class="bj-cart-row-body">
                <a class="bj-cart-row-name"
                   href="${pieceUrl(piece.slug || slug)}">${escape(piece.name || 'Pieza')}</a>
                <div class="bj-cart-row-meta mono">${escape(format$(piece.price))}</div>
                <div class="bj-cart-row-controls">
                    <button type="button"
                            class="bj-wishlist-cart-pill ${inCart ? 'is-in-cart' : ''}"
                            data-action="wl-toggle-cart"
                            data-slug="${escape(slug)}">
                        ${inCart ? 'En carrito' : 'Al carrito'}
                    </button>
                    <button type="button"
                            class="bj-cart-row-remove"
                            data-action="wl-remove"
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
    if (action === 'wl-remove' && slug) {
        wishlist.remove(slug);
        return;
    }
    if (action === 'wl-toggle-cart' && slug) {
        cart.toggle(slug);
        return;
    }
    if (action === 'share') {
        // Don't preventDefault — let WhatsApp link open in new tab.
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

export function initWishlistDrawer() {
    document.addEventListener('bj:wishlist-drawer:open', openDrawer);

    // Intercept any link to /lista-deseos.html (except on that page itself
    // and except modifier-clicks for new-tab UX).
    document.addEventListener('click', e => {
        if (location.pathname.endsWith('lista-deseos.html')) return;
        const a = e.target.closest('a[href$="lista-deseos.html"]');
        if (!a) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (a.target && a.target !== '_self') return;
        e.preventDefault();
        openDrawer();
    });
}

export default { initWishlistDrawer, openDrawer, closeDrawer };
