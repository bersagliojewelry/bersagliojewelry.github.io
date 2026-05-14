/**
 * Bersaglio Jewelry — Lista de deseos (Wishlist) page.
 *
 * Pagina dedicada para casos donde el usuario llega a /lista-deseos.html
 * directamente (deep link, compartido). En el flujo normal del sitio, los
 * clicks a /lista-deseos.html los intercepta wishlist-drawer.js y abre el
 * drawer en su lugar — pero en esta página específicamente NO se intercepta
 * (porque el drawer.js verifica location.pathname.endsWith('lista-deseos.html')).
 *
 * Renderiza:
 *   1. Hero (eyebrow + display title + count)
 *   2. Grid de cards (aspect 4/5 + name + price + acciones cart/remove)
 *   3. CTA WhatsApp share + Limpiar lista
 *   4. Empty state cuando vacío
 *
 * data.onChange + cart.onChange + wishlist.onChange → re-render.
 */

import { html, escape } from '../core/html.js';
import { format$ } from '../core/format.js';
import { data } from '../core/data.js';
import { cart } from '../core/cart.js';
import { wishlist } from '../core/wishlist.js';

function joinWishlist() {
    return wishlist.getAll().map(slug => ({ slug, piece: data.getBySlug(slug) }));
}

function buildShareURL(rows) {
    const phone = '573108136829';
    const lines = rows.map(r => {
        const name = r.piece?.name || r.slug;
        const url  = `https://bersagliojewelry.co/pieza.html?p=${encodeURIComponent(r.slug)}`;
        return `• ${name}\n  ${url}`;
    });
    const message = `Hola Bersaglio, me interesan estas piezas de mi lista:\n\n${lines.join('\n\n')}`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function renderHero(count) {
    return html`
        <section class="wl-hero">
            <div class="eyebrow wl-hero-eyebrow">Tus favoritas · ${count}</div>
            <h1 class="wl-hero-title">
                Lista de <span class="italic emerald-text">deseos</span>
            </h1>
            <p class="wl-hero-lead">
                Las piezas que te detuvieron. Vuelve cuando quieras, comparte
                con quien quieras, agrega al carrito cuando estés lista.
            </p>
        </section>`;
}

function renderEmpty() {
    return html`
        <div class="wl-empty">
            <div class="wl-empty-icon" aria-hidden="true">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
            </div>
            <h2 class="wl-empty-title">Tu lista está vacía</h2>
            <p class="wl-empty-sub">
                Guarda piezas que te inspiren tocando el corazón en cualquier ficha.
            </p>
            <a href="/colecciones.html" class="btn-aqua btn-aqua-emerald">Explorar el catálogo</a>
        </div>`;
}

function renderCard(row) {
    const { slug, piece } = row;
    if (!piece) {
        return html`
            <article class="glass wl-card wl-card--stale" data-slug="${escape(slug)}">
                <div class="wl-card-img wl-card-img--missing" aria-hidden="true"></div>
                <div class="wl-card-body">
                    <div class="wl-card-name">Pieza retirada</div>
                    <div class="mono wl-card-meta">${escape(slug)}</div>
                    <div class="wl-card-actions">
                        <button type="button" class="wl-card-remove" data-action="remove" data-slug="${escape(slug)}">Quitar</button>
                    </div>
                </div>
            </article>`;
    }
    const img = piece.images?.[0] || piece.image || '';
    const inCart = cart.has(slug);
    return html`
        <article class="glass glass-iridescent wl-card" data-slug="${escape(slug)}">
            <a class="wl-card-imglink" href="/pieza.html?p=${encodeURIComponent(piece.slug || slug)}">
                <div class="wl-card-img" style="background:url('${escape(img)}') center/cover"></div>
                <div class="wl-card-vignette" aria-hidden="true"></div>
            </a>
            <div class="wl-card-body">
                <a class="wl-card-name" href="/pieza.html?p=${encodeURIComponent(piece.slug || slug)}">${escape(piece.name || 'Pieza')}</a>
                <div class="mono wl-card-price">${escape(format$(piece.price))}</div>
                <div class="wl-card-actions">
                    <button type="button"
                            class="wl-card-cart ${inCart ? 'is-in-cart' : ''}"
                            data-action="toggle-cart"
                            data-slug="${escape(slug)}">${inCart ? 'En carrito' : 'Al carrito'}</button>
                    <button type="button"
                            class="wl-card-remove"
                            data-action="remove"
                            data-slug="${escape(slug)}"
                            aria-label="Quitar de favoritos">Quitar</button>
                </div>
            </div>
        </article>`;
}

function renderActions(rows) {
    if (rows.length === 0) return '';
    return html`
        <div class="wl-actions">
            <a href="${buildShareURL(rows)}"
               target="_blank"
               rel="noopener noreferrer"
               class="btn-aqua btn-aqua-emerald wl-share-btn">
                Consultar lista por WhatsApp
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </a>
            <button type="button" class="btn-aqua wl-clear-btn" data-action="clear">Vaciar la lista</button>
        </div>`;
}

function renderAll() {
    const rows = joinWishlist();
    if (rows.length === 0) {
        return html`
            <div class="container wl-page">
                ${renderHero(0)}
                ${renderEmpty()}
            </div>`;
    }
    return html`
        <div class="container wl-page">
            ${renderHero(rows.length)}
            <div class="wl-grid">
                ${rows.map(renderCard)}
            </div>
            ${renderActions(rows)}
        </div>`;
}

function refresh() {
    const main = document.getElementById('main-content');
    if (!main) return;
    main.innerHTML = renderAll();
}

function onMainClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const slug = btn.dataset.slug;

    if (action === 'remove' && slug) {
        wishlist.remove(slug);
        return;
    }
    if (action === 'toggle-cart' && slug) {
        cart.toggle(slug);
        return;
    }
    if (action === 'clear') {
        e.preventDefault();
        if (!confirm('¿Vaciar toda la lista de deseos?')) return;
        wishlist.clear();
    }
}

export async function init() {
    const main = document.getElementById('main-content');
    if (!main) return;

    data.load().catch(() => {});

    refresh();
    main.addEventListener('click', onMainClick);

    wishlist.onChange(refresh);
    cart.onChange(refresh);
    data.onChange(refresh);
}

export default { init };
