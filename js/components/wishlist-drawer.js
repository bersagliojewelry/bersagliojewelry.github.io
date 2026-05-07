/**
 * Bersaglio Jewelry — Wishlist Drawer (lateral slide-in from right)
 *
 * Mirrors cart-drawer.js but for the wishlist. Triggered by:
 *   - Programmatic call: window.openWishlistDrawer()
 *   - Footer "Lista de deseos" link (intercepted in initWishlistDrawer)
 *
 * Each item shows: image, name, meta, price, "Mover al carrito" + remove.
 * Empty state encourages exploration.
 */

import db          from '../data/catalog.js';
import { wishlist } from '../wishlist.js';
import { cart }    from '../cart.js';
import { toast }   from '../toast.js';

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
    _backdropEl.className = 'wishlist-drawer-backdrop';
    _backdropEl.setAttribute('aria-hidden', 'true');
    _drawerEl = document.createElement('aside');
    _drawerEl.className = 'wishlist-drawer glass';
    _drawerEl.id = 'wishlist-drawer';
    _drawerEl.setAttribute('role', 'dialog');
    _drawerEl.setAttribute('aria-label', 'Lista de deseos');
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
    document.body.classList.add('wishlist-drawer-open');
}
function unlockBodyScroll() {
    document.body.classList.remove('wishlist-drawer-open');
    document.body.style.top = '';
    window.scrollTo(0, _savedScrollY);
}

function renderDrawer() {
    if (!_drawerEl) return;
    const slugs  = wishlist.getAll();
    const pieces = slugs.map(s => db.getBySlug(s)).filter(Boolean);

    if (!pieces.length) {
        _drawerEl.innerHTML = `
            <header class="wishlist-drawer-header">
                <div>
                    <span class="section-eyebrow">Lista de deseos</span>
                    <h3 class="wishlist-drawer-title">Tus <em class="emerald-text">favoritas</em></h3>
                </div>
                <button type="button" class="wishlist-drawer-close" aria-label="Cerrar lista de deseos">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
                </button>
            </header>
            <div class="wishlist-drawer-empty">
                <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="0.7" aria-hidden="true">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <p>Tu lista está vacía</p>
                <span class="wishlist-drawer-empty-sub">Guarda piezas que te inspiren para volver a encontrarlas aquí.</span>
                <a href="colecciones.html" class="btn-aqua btn-aqua-emerald">Explorar colecciones</a>
            </div>
        `;
    } else {
        _drawerEl.innerHTML = `
            <header class="wishlist-drawer-header">
                <div>
                    <span class="section-eyebrow">Lista · ${pieces.length} ${pieces.length === 1 ? 'pieza' : 'piezas'}</span>
                    <h3 class="wishlist-drawer-title">Tus <em class="emerald-text">favoritas</em></h3>
                </div>
                <button type="button" class="wishlist-drawer-close" aria-label="Cerrar lista de deseos">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
                </button>
            </header>

            <div class="wishlist-drawer-items">
                ${pieces.map(p => {
                    const inCart = cart.has(p.slug);
                    return `
                    <article class="wishlist-drawer-item">
                        <a href="pieza.html?p=${escapeHtml(p.slug)}" class="wishlist-drawer-item-img" aria-label="Ver ${escapeHtml(p.name)}">
                            ${p.image
                                ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy">`
                                : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" width="32" height="32" aria-hidden="true"><polygon points="12,2 22,8.5 12,22 2,8.5"/></svg>`}
                        </a>
                        <div class="wishlist-drawer-item-body">
                            <a href="pieza.html?p=${escapeHtml(p.slug)}" class="wishlist-drawer-item-name">${escapeHtml(p.name)}</a>
                            <span class="wishlist-drawer-item-meta">${escapeHtml(p.specs?.stone || p.specs?.metal || '')}</span>
                            <span class="wishlist-drawer-item-price mono">${escapeHtml(p.priceLabel || (p.price ? `$ ${Number(p.price).toLocaleString('es-CO')}` : 'Cotización'))}</span>
                            <div class="wishlist-drawer-item-actions">
                                <button type="button" class="wishlist-drawer-item-cart ${inCart ? 'is-in-cart' : ''}" data-cart-toggle="${escapeHtml(p.slug)}" aria-label="${inCart ? 'Quitar del carrito' : 'Mover al carrito'}">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                                    ${inCart ? 'En carrito' : 'Al carrito'}
                                </button>
                            </div>
                        </div>
                        <button type="button" class="wishlist-drawer-item-remove" data-wishlist-remove="${escapeHtml(p.slug)}" aria-label="Quitar ${escapeHtml(p.name)} de la lista" title="Quitar">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                        </button>
                    </article>`;
                }).join('')}
            </div>

            <footer class="wishlist-drawer-footer">
                <button type="button" class="wishlist-drawer-share" id="wishlist-drawer-share">
                    <svg width="13" height="13" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path fill="currentColor" d="M16 0C7.163 0 0 7.163 0 16c0 2.825.739 5.488 2.037 7.813L.112 31.488l8.013-2.038C10.413 30.725 13.113 32 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.388c-2.475 0-4.8-.675-6.787-1.85l-.488-.288-5.05 1.288 1.338-4.863-.313-.512C3.338 21.088 2.612 18.6 2.612 16 2.612 8.6 8.6 2.612 16 2.612S29.388 8.6 29.388 16 23.4 29.388 16 29.388z"/></svg>
                    Compartir por WhatsApp
                </button>
                <a href="lista-deseos.html" class="btn-aqua btn-aqua-emerald wishlist-drawer-go-list">
                    Ver lista completa
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                </a>
                <button type="button" class="wishlist-drawer-continue">Seguir explorando</button>
            </footer>
        `;
    }

    // Wire handlers
    _drawerEl.querySelector('.wishlist-drawer-close')?.addEventListener('click', closeDrawer);
    _drawerEl.querySelector('.wishlist-drawer-continue')?.addEventListener('click', closeDrawer);
    _drawerEl.querySelectorAll('[data-wishlist-remove]').forEach(btn => {
        btn.addEventListener('click', () => {
            wishlist.remove(btn.dataset.wishlistRemove);
            toast.show('Eliminada de tu lista', 'removed');
        });
    });
    _drawerEl.querySelectorAll('[data-cart-toggle]').forEach(btn => {
        btn.addEventListener('click', () => {
            const slug = btn.dataset.cartToggle;
            const added = cart.toggle(slug);
            toast.show(added ? 'Añadida al carrito' : 'Eliminada del carrito', added ? 'added' : 'removed');
        });
    });

    // Share by WhatsApp (uses contact info)
    _drawerEl.querySelector('#wishlist-drawer-share')?.addEventListener('click', () => {
        const slugs  = wishlist.getAll();
        if (!slugs.length) return;
        const pieces = slugs.map(s => db.getBySlug(s)).filter(Boolean);
        const list   = pieces.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
        const { whatsapp } = db.getContact();
        const phone  = whatsapp.replace('+', '');
        const msg    = encodeURIComponent(
            `Hola Bersaglio Jewelry, esta es mi lista de deseos:\n\n${list}\n\n¿Me pueden dar más información?`
        );
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank', 'noopener');
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
    setTimeout(() => _drawerEl.querySelector('.wishlist-drawer-close')?.focus(), 100);
}

function closeDrawer() {
    if (!_open) return;
    _open = false;
    _backdropEl?.classList.remove('is-open');
    _drawerEl?.classList.remove('is-open');
    unlockBodyScroll();
}

/**
 * Intercept any anchor that links to lista-deseos.html so it opens
 * the drawer instead of navigating. Cmd/Ctrl/Shift-Click preserves
 * navigation (open in new tab).
 */
export function initWishlistDrawer() {
    document.addEventListener('click', e => {
        const a = e.target.closest('a[href$="lista-deseos.html"], a[href="/lista-deseos.html"]');
        if (!a) return;
        // Don't intercept on lista-deseos page itself (avoid drawer-over-page conflict)
        if (location.pathname.endsWith('lista-deseos.html')) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        openDrawer();
    });

    wishlist.onChange(() => { if (_drawerEl) renderDrawer(); });
    cart.onChange(() => { if (_drawerEl) renderDrawer(); });
    db.onChange(() => { if (_drawerEl) renderDrawer(); });
}

if (typeof window !== 'undefined') {
    window.openWishlistDrawer = openDrawer;
}
