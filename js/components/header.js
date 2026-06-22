/**
 * Bersaglio Jewelry — Floating glass pill header (Dynamic Island).
 *
 * Mirror del rediseño:
 *   - Logo (B en círculo + BERSAGLIO + "Jewelry" subtítulo)
 *   - Nav pills con active emerald gradient (Inicio · Colecciones · Nosotros · Contacto)
 *   - Acciones: Buscar (desktop) · Favoritos (corazón + badge wishlist) · Carrito (badge)
 *   - Mobile hamburger + drawer below the pill
 *   - "Dynamic Island": el pill se airea arriba (scale 1.03) y se compacta al hacer
 *     scroll (`is-scrolled` sobre el PILL — toggled en onScroll/render).
 *
 * Desacoplamiento:
 *  - Buscar → dispara `bj:search:open` (search-overlay.js lo maneja).
 *  - Carrito → dispara `bj:cart-drawer:open` (cart-drawer.js lo maneja).
 *  - Favoritos → navega a /lista-deseos.html (router intercepta el <a>).
 *  - Counts vienen de cart.js / wishlist.js (localStorage), no de estado React.
 */

import { html, mount, escape } from '../core/html.js';
import { cart } from '../core/cart.js';
import { wishlist } from '../core/wishlist.js';

const NAV = [
    { key: 'home',        label: 'Inicio',      href: '/' },
    { key: 'colecciones', label: 'Colecciones', href: '/colecciones.html' },
    { key: 'nosotros',    label: 'Nosotros',    href: '/nosotros.html' },
    { key: 'contacto',    label: 'Contacto',    href: '/contacto.html' },
];

let _root = null;
let _mobileOpen = false;
let _scrollTop = 0;
let _hidden = false;   // header auto-oculto (al bajar) — se preserva entre re-renders

function getCurrentKey() {
    const p = location.pathname.replace(/\.html$/, '').replace(/^\//, '');
    if (!p || p === 'index') return 'home';
    if (p.startsWith('pieza') || p.startsWith('colecciones')) return 'colecciones';
    return p;
}

function logoSVG() {
    return html`
        <svg width="28" height="29" viewBox="0 0 80 84" fill="none" aria-hidden="true" style="display:block">
            <circle cx="40" cy="42" r="28" stroke="var(--bj-emerald-800)" stroke-width="1.2" opacity="0.85" fill="none"/>
            <line x1="40" y1="4" x2="40" y2="80" stroke="var(--bj-emerald-800)" stroke-width="0.8" opacity="0.5"/>
            <text x="40" y="54" text-anchor="middle" font-family="Fraunces, serif" font-weight="600" font-size="32" fill="var(--bj-emerald-800)">B</text>
        </svg>`;
}

function searchIconSVG() {
    return html`
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7"/>
            <path d="M21 21l-4.3-4.3"/>
        </svg>`;
}

function heartIconSVG() {
    return html`
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>`;
}

function cartIconSVG() {
    return html`
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>`;
}

function hamburgerSVG() {
    return html`
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <line x1="4" y1="8" x2="20" y2="8"/>
            <line x1="4" y1="16" x2="20" y2="16"/>
        </svg>`;
}

function closeSVG() {
    return html`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <line x1="6" y1="6" x2="18" y2="18"/>
            <line x1="18" y1="6" x2="6" y2="18"/>
        </svg>`;
}

function render() {
    if (!_root) return;
    const currentKey = getCurrentKey();
    const cartCount = cart.count();
    const wishCount = wishlist.count();

    _root.innerHTML = html`
        <header class="bj-header" role="banner">
            <div class="glass glass-iridescent bj-header-pill">
                <a class="bj-header-logo" href="/" aria-label="Bersaglio Jewelry — inicio">
                    ${logoSVG()}
                    <div class="bj-header-logo-text">
                        <div class="bj-header-brand">BERSAGLIO</div>
                        <div class="bj-header-sub">Jewelry</div>
                    </div>
                </a>

                <nav class="bj-header-nav hide-mobile" aria-label="Navegación principal">
                    ${NAV.map(n => {
                        const active = n.key === currentKey;
                        return html`
                            <a class="bj-nav-pill ${active ? 'is-active' : ''}"
                               href="${n.href}"
                               data-key="${n.key}"
                               ${active ? 'aria-current="page"' : ''}>${escape(n.label)}</a>`;
                    })}
                </nav>

                <button class="bj-header-cart bj-header-search"
                        type="button"
                        data-action="open-search"
                        aria-label="Buscar (Ctrl+K)">
                    ${searchIconSVG()}
                </button>

                <a class="bj-header-cart bj-header-fav"
                   href="/lista-deseos.html"
                   aria-label="Favoritos (${wishCount} ${wishCount === 1 ? 'pieza' : 'piezas'})">
                    ${heartIconSVG()}
                    ${wishCount > 0 ? html`<span class="bj-header-badge">${wishCount}</span>` : ''}
                </a>

                <button class="bj-header-cart"
                        type="button"
                        data-action="open-cart"
                        aria-label="Abrir carrito (${cartCount} ${cartCount === 1 ? 'pieza' : 'piezas'})">
                    ${cartIconSVG()}
                    ${cartCount > 0 ? html`<span class="bj-header-badge">${cartCount}</span>` : ''}
                </button>

                <button class="bj-header-burger show-mobile"
                        type="button"
                        data-action="toggle-mobile"
                        aria-label="${_mobileOpen ? 'Cerrar menú' : 'Abrir menú'}"
                        aria-expanded="${_mobileOpen ? 'true' : 'false'}">
                    ${_mobileOpen ? closeSVG() : hamburgerSVG()}
                </button>
            </div>

            ${_mobileOpen ? html`
                <div class="glass bj-header-drawer" role="dialog" aria-label="Menú móvil">
                    ${NAV.map(n => {
                        const active = n.key === currentKey;
                        return html`
                            <a class="bj-drawer-link ${active ? 'is-active' : ''}"
                               href="${n.href}"
                               ${active ? 'aria-current="page"' : ''}>${escape(n.label)}</a>`;
                    })}
                    <a class="bj-drawer-link" href="/lista-deseos.html">Favoritos${wishCount > 0 ? html` (${wishCount})` : ''}</a>
                </div>` : ''}
        </header>`;

    // Preserva el estado "scrolled" del pill y el "oculto" del header entre re-renders
    // (cart/wishlist/ruta) para que no parpadeen al re-renderizar.
    if (window.scrollY > 30) {
        _root.querySelector('.bj-header-pill')?.classList.add('is-scrolled');
    }
    if (_hidden && !_mobileOpen) {
        _root.querySelector('.bj-header')?.classList.add('is-hidden');
    }
}

function onClick(e) {
    const action = e.target.closest('[data-action]');
    if (!action) {
        // Mobile drawer link tapped → close drawer
        if (_mobileOpen && e.target.closest('.bj-drawer-link')) {
            _mobileOpen = false;
            render();
        }
        return;
    }
    const a = action.dataset.action;
    if (a === 'open-cart') {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('bj:cart-drawer:open'));
        return;
    }
    if (a === 'open-search') {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('bj:search:open'));
        return;
    }
    if (a === 'toggle-mobile') {
        e.preventDefault();
        _mobileOpen = !_mobileOpen;
        render();
    }
}

function onScroll() {
    if (!_root) return;
    const y = Math.max(0, window.scrollY);
    if ((y > 30) !== (_scrollTop > 30)) {
        _root.querySelector('.bj-header-pill')?.classList.toggle('is-scrolled', y > 30);
    }
    // Auto-ocultar: al BAJAR se esconde, al SUBIR reaparece (móvil y PC). Cerca del tope o con el
    // menú móvil abierto, siempre visible. Delta de 4px evita parpadeo por inercia/micro-scroll.
    const header = _root.querySelector('.bj-header');
    if (header) {
        const delta = y - _scrollTop;
        if (y < 120 || _mobileOpen)  _hidden = false;
        else if (delta > 4)          _hidden = true;
        else if (delta < -4)         _hidden = false;
        header.classList.toggle('is-hidden', _hidden);
    }
    _scrollTop = y;
}

function onResize() {
    if (_mobileOpen && window.innerWidth > 820) {
        _mobileOpen = false;
        render();
    }
}

export function mountHeader() {
    _root = document.getElementById('header-mount');
    if (!_root) return;

    render();

    _root.addEventListener('click', onClick);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    // Re-render on cart / wishlist changes to update badges
    cart.onChange(() => render());
    wishlist.onChange(() => render());

    // Re-render on route changes (back/forward) so active state stays correct
    window.addEventListener('popstate', () => {
        _mobileOpen = false;
        render();
    });
}

export default { mountHeader };
