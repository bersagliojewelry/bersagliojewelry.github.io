/**
 * Bersaglio Jewelry — Floating glass pill header.
 *
 * Mirror exact de BERSAGLIO NOVO/project/js/shell.jsx (Header L63-178):
 *   - Logo (B en círculo + BERSAGLIO + "Jewelry" subtítulo)
 *   - Nav pills con active emerald gradient (Inicio · Colecciones · Nosotros · Contacto)
 *   - Cart button con badge live (count desde cart.js)
 *   - Mobile hamburger + drawer below the pill
 *
 * Diferencias con el bundle:
 *  - Routing real (no hash) via js/core/router.js. Active state se calcula
 *    desde location.pathname.
 *  - Cart count viene de cart.count() (localStorage), no del React state.
 *  - El cart click dispara `bj:cart-drawer:open` event para que cart-drawer.js
 *    lo maneje sin acoplamiento directo.
 */

import { html, mount, escape } from '../core/html.js';
import { cart } from '../core/cart.js';

const NAV = [
    { key: 'home',        label: 'Inicio',      href: '/' },
    { key: 'colecciones', label: 'Colecciones', href: '/colecciones.html' },
    { key: 'nosotros',    label: 'Nosotros',    href: '/nosotros.html' },
    { key: 'contacto',    label: 'Contacto',    href: '/contacto.html' },
];

let _root = null;
let _mobileOpen = false;
let _scrollTop = 0;

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

function cartIconSVG() {
    return html`
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path d="M6 2l-2 5v15h16V7l-2-5H6z"/>
            <path d="M4 7h16M10 11a2 2 0 0 0 4 0"/>
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
                </div>` : ''}
        </header>`;
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
    if (a === 'toggle-mobile') {
        e.preventDefault();
        _mobileOpen = !_mobileOpen;
        render();
    }
}

function onScroll() {
    if (!_root) return;
    const y = window.scrollY;
    if ((y > 30) !== (_scrollTop > 30)) {
        _root.firstElementChild?.classList.toggle('is-scrolled', y > 30);
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

    // Re-render on cart changes to update badge
    cart.onChange(() => render());

    // Re-render on route changes (back/forward) so active state stays correct
    window.addEventListener('popstate', () => {
        _mobileOpen = false;
        render();
    });
}

export default { mountHeader };
