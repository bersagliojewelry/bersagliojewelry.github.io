/**
 * Bersaglio Jewelry — Pieza detail page.
 *
 * Mirror funcional de BERSAGLIO NOVO/project/js/pages.jsx (Producto L98-193):
 *   - Breadcrumb glass: Inicio / Catálogo / nombre
 *   - Layout 1.1fr 1fr: gallery (main + thumbs) | info column
 *   - Info: eyebrow (categoría · 2026) + nombre display + price+IVA + descripción
 *           + specs grid 2×2 + talla selector (anillos/argollas) + 3 CTAs
 *
 * Extensiones sobre el bundle:
 *   - URL state: ?p=<slug>
 *   - Datos vivos via data.getBySlug(slug) + re-render en data.onChange()
 *   - Wishlist toggle persistente vía wishlist.js
 *   - Cart add abre el cart-drawer (custom event bj:cart-drawer:open)
 *   - 404 state cuando la pieza no existe
 *   - "Consultar con asesor" → contacto.html?ref=<slug>
 *   - Related pieces grid (4 más de la misma colección)
 */

import { html, escape } from '../core/html.js';
import { format$ } from '../core/format.js';
import { data } from '../core/data.js';
import { cart } from '../core/cart.js';
import { wishlist } from '../core/wishlist.js';

let _slug = '';
let _viewIdx = 0;
let _selectedSize = null;

const TALLAS_COLLECTIONS = new Set(['anillos', 'argollas']);

function getSlugFromURL() {
    return new URL(location.href).searchParams.get('p') || '';
}

function gemSVG() {
    return html`<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="12,2 22,8.5 12,22 2,8.5"/></svg>`;
}

function heartSVG() {
    return html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
}
function heartSolidSVG() {
    return html`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
}

function descriptionFor(piece) {
    if (piece.description) return piece.description;
    const stones = (piece.specs?.stones || piece.specs?.stone || 'esmeralda colombiana').toLowerCase();
    return `Una pieza de alta joyería esculpida en oro de 18 quilates alrededor de una ${stones}. Acabado pulido a mano por nuestro atelier en Cartagena.`;
}

function buildSpecs(piece) {
    const stones = piece.specs?.stones || piece.specs?.stone || '';
    const primary = stones.includes('·') ? stones.split('·')[0].trim() : stones;
    return [
        { key: 'Gema principal', val: primary || 'Esmeralda' },
        { key: 'Metal',          val: piece.specs?.metal || piece.specs?.gold || 'Oro 18K' },
        { key: 'Origen',         val: piece.specs?.origin || 'Muzo, Colombia' },
        { key: 'Entrega',        val: piece.specs?.delivery || '2-3 semanas' },
    ];
}

function getCategoryLabel(piece) {
    const collection = data.getCollections().find(c => c.slug === piece.collection);
    return collection?.name || piece.collection || 'Pieza';
}

function renderGallery(piece) {
    const images = (piece.images || []).filter(Boolean);
    if (images.length === 0 && piece.image) images.push(piece.image);
    if (images.length === 0) images.push(''); // placeholder
    const idx = Math.min(_viewIdx, images.length - 1);
    const main = images[idx];
    const showCert = piece.specs?.certificate || piece.specs?.gia;

    return html`
        <div class="pz-gallery">
            <div class="glass glass-iridescent pz-main">
                <div class="pz-main-img" style="background:url('${escape(main)}') center/cover"></div>
                ${showCert ? html`
                    <div class="pz-main-chips">
                        <div class="chip pz-cert-chip">
                            ${gemSVG()}
                            ${escape(piece.specs?.certificate ? `${piece.specs.certificate} Certificado` : 'GIA Certificado')}
                        </div>
                    </div>` : ''}
            </div>
            ${images.length > 1 ? html`
                <div class="pz-thumbs">
                    ${images.slice(0, 6).map((src, i) => html`
                        <button type="button"
                                class="glass pz-thumb ${i === idx ? 'is-active' : ''}"
                                data-action="thumb"
                                data-idx="${i}"
                                aria-label="Ver imagen ${i + 1}"
                                ${i === idx ? 'aria-current="true"' : ''}>
                            <div class="pz-thumb-img" style="background:url('${escape(src)}') center/cover"></div>
                        </button>`)}
                </div>` : ''}
        </div>`;
}

function renderInfo(piece) {
    const cat = getCategoryLabel(piece);
    const price = Number(piece.price || 0);
    const inWishlist = wishlist.has(piece.slug || piece.id);
    const inCart = cart.has(piece.slug || piece.id);
    const showTalla = TALLAS_COLLECTIONS.has(piece.collection);

    return html`
        <div class="pz-info">
            <div class="eyebrow pz-info-eyebrow">${escape(cat)} · Bersaglio 2026</div>
            <h1 class="pz-info-name">${escape(piece.name || 'Pieza')}</h1>

            <div class="pz-price-row">
                <div class="mono pz-price">${escape(price ? format$(price) : 'Bajo consulta')}</div>
                ${price ? html`<div class="pz-iva">IVA incluido</div>` : ''}
            </div>

            <p class="pz-info-desc">${escape(descriptionFor(piece))}</p>

            <div class="pz-specs">
                ${buildSpecs(piece).map(s => html`
                    <div class="glass pz-spec">
                        <div class="pz-spec-key">${escape(s.key)}</div>
                        <div class="pz-spec-val">${escape(s.val)}</div>
                    </div>`)}
            </div>

            ${showTalla ? html`
                <div class="pz-talla">
                    <div class="eyebrow pz-talla-label">Talla</div>
                    <div class="pz-talla-pills">
                        ${[5, 6, 7, 8, 9].map(s => html`
                            <button type="button"
                                    class="glass pz-talla-pill ${_selectedSize === s ? 'is-active' : ''}"
                                    data-action="size"
                                    data-size="${s}">${s}</button>`)}
                        <button type="button"
                                class="glass pz-talla-pill pz-talla-custom ${_selectedSize === 'custom' ? 'is-active' : ''}"
                                data-action="size"
                                data-size="custom">A medida</button>
                    </div>
                </div>` : ''}

            <div class="pz-actions">
                <button type="button"
                        class="btn-aqua btn-aqua-emerald pz-cart-btn"
                        data-action="cart">
                    ${inCart ? 'Ver carrito' : 'Agregar al carrito'}
                </button>
                <button type="button"
                        class="btn-aqua pz-wish-btn ${inWishlist ? 'is-saved' : ''}"
                        data-action="wishlist"
                        aria-label="${inWishlist ? 'Quitar de favoritos' : 'Guardar en favoritos'}"
                        aria-pressed="${inWishlist ? 'true' : 'false'}">
                    ${inWishlist ? heartSolidSVG() : heartSVG()}
                </button>
            </div>

            <a href="/contacto.html?ref=${encodeURIComponent(piece.slug || piece.id)}"
               class="btn-aqua btn-aqua-gold pz-asesor-btn">
                Consultar con un asesor
            </a>
        </div>`;
}

function renderRelated(piece) {
    const all = data.getAll();
    const slug = piece.slug || piece.id;
    let related = all
        .filter(p => p.collection === piece.collection && (p.slug || p.id) !== slug);
    if (related.length < 4) {
        const fillers = all.filter(p => (p.slug || p.id) !== slug && !related.includes(p));
        related = [...related, ...fillers].slice(0, 4);
    } else {
        related = related.slice(0, 4);
    }

    if (related.length === 0) return '';
    return html`
        <section class="pz-related">
            <div class="pz-related-header">
                <div class="eyebrow">También podría gustarte</div>
                <h2 class="pz-related-title">Más de <span class="italic emerald-text">${escape(getCategoryLabel(piece))}</span></h2>
            </div>
            <div class="pz-related-grid">
                ${related.map(p => {
                    const pSlug = p.slug || p.id;
                    const img = p.images?.[0] || p.image || '';
                    return html`
                        <a class="glass glass-iridescent pz-related-card"
                           href="/pieza.html?p=${encodeURIComponent(pSlug)}">
                            <div class="pz-related-imgwrap">
                                <div class="pz-related-img" style="background:url('${escape(img)}') center/cover"></div>
                            </div>
                            <div class="pz-related-body">
                                <div class="pz-related-name">${escape(p.name || 'Pieza')}</div>
                                <div class="mono pz-related-price">${escape(format$(p.price))}</div>
                            </div>
                        </a>`;
                })}
            </div>
        </section>`;
}

function renderBreadcrumb(piece) {
    const cat = piece ? getCategoryLabel(piece) : 'Catálogo';
    return html`
        <nav class="pz-breadcrumb" aria-label="Migas de pan">
            <a class="pz-crumb" href="/">Inicio</a>
            <span class="pz-crumb-sep" aria-hidden="true">→</span>
            <a class="pz-crumb" href="/colecciones.html${piece?.collection ? `?col=${encodeURIComponent(piece.collection)}` : ''}">${escape(cat)}</a>
            <span class="pz-crumb-sep" aria-hidden="true">→</span>
            <span class="pz-crumb pz-crumb-current">${escape(piece?.name || 'Pieza')}</span>
        </nav>`;
}

function renderNotFound() {
    return html`
        <div class="container pz-page">
            ${renderBreadcrumb(null)}
            <div class="glass pz-notfound">
                <div class="pz-notfound-icon" aria-hidden="true">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="13"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>
                <h1 class="pz-notfound-title">Esta pieza descansa en otro lugar</h1>
                <p class="pz-notfound-sub">No la encontramos en el atelier — quizá fue retirada o el enlace cambió.</p>
                <div class="pz-notfound-actions">
                    <a href="/colecciones.html" class="btn-aqua btn-aqua-emerald">Ver el catálogo</a>
                    <a href="/contacto.html" class="btn-aqua">Hablar con un asesor</a>
                </div>
            </div>
        </div>`;
}

function renderLoading() {
    return html`
        <div class="container pz-page">
            <div class="pz-skeleton" aria-busy="true" aria-label="Cargando pieza">
                <div class="pz-skeleton-gallery"></div>
                <div class="pz-skeleton-info">
                    <div class="pz-skeleton-row pz-skeleton-row--sm"></div>
                    <div class="pz-skeleton-row pz-skeleton-row--lg"></div>
                    <div class="pz-skeleton-row pz-skeleton-row--md"></div>
                    <div class="pz-skeleton-row pz-skeleton-row--full"></div>
                </div>
            </div>
        </div>`;
}

function renderPage() {
    const piece = data.getBySlug(_slug);
    if (!data.isReady() && !piece) return renderLoading();
    if (!piece) return renderNotFound();

    return html`
        <div class="container pz-page">
            ${renderBreadcrumb(piece)}
            <article class="pz-layout">
                ${renderGallery(piece)}
                ${renderInfo(piece)}
            </article>
            ${renderRelated(piece)}
        </div>`;
}

function refresh() {
    const main = document.getElementById('main-content');
    if (!main) return;
    main.innerHTML = renderPage();

    const piece = data.getBySlug(_slug);
    if (piece) {
        document.title = `${piece.name} · Bersaglio Jewelry`;
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.setAttribute('href', `https://bersagliojewelry.co/pieza.html?p=${encodeURIComponent(_slug)}`);
        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute('content', `https://bersagliojewelry.co/pieza.html?p=${encodeURIComponent(_slug)}`);
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', `${piece.name} · Bersaglio Jewelry`);
        const ogImg = document.querySelector('meta[property="og:image"]');
        if (ogImg && (piece.images?.[0] || piece.image)) {
            ogImg.setAttribute('content', piece.images?.[0] || piece.image);
        }
    }
}

function onMainClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'thumb') {
        e.preventDefault();
        _viewIdx = Number(btn.dataset.idx) || 0;
        const piece = data.getBySlug(_slug);
        if (!piece) return;
        const images = (piece.images || []).filter(Boolean);
        if (images.length === 0 && piece.image) images.push(piece.image);
        const main = images[_viewIdx];
        const mainEl = document.querySelector('.pz-main-img');
        if (mainEl) mainEl.style.background = `url('${main}') center/cover`;
        document.querySelectorAll('.pz-thumb').forEach((el, i) => {
            el.classList.toggle('is-active', i === _viewIdx);
            if (i === _viewIdx) el.setAttribute('aria-current', 'true');
            else el.removeAttribute('aria-current');
        });
        return;
    }

    if (action === 'size') {
        e.preventDefault();
        const newSize = btn.dataset.size === 'custom' ? 'custom' : Number(btn.dataset.size);
        _selectedSize = newSize === _selectedSize ? null : newSize;
        document.querySelectorAll('.pz-talla-pill').forEach(el => {
            const isThis = el.dataset.size === btn.dataset.size && _selectedSize !== null;
            el.classList.toggle('is-active', isThis);
        });
        return;
    }

    if (action === 'cart') {
        e.preventDefault();
        const piece = data.getBySlug(_slug);
        if (!piece) return;
        const slug = piece.slug || piece.id;
        if (!cart.has(slug)) cart.add(slug, 1);
        document.dispatchEvent(new CustomEvent('bj:cart-drawer:open'));
        return;
    }

    if (action === 'wishlist') {
        e.preventDefault();
        const piece = data.getBySlug(_slug);
        if (!piece) return;
        wishlist.toggle(piece.slug || piece.id);
        const wl = wishlist.has(piece.slug || piece.id);
        btn.classList.toggle('is-saved', wl);
        btn.setAttribute('aria-pressed', wl ? 'true' : 'false');
        btn.setAttribute('aria-label', wl ? 'Quitar de favoritos' : 'Guardar en favoritos');
        btn.innerHTML = wl ? heartSolidSVG() : heartSVG();
    }
}

export async function init() {
    const main = document.getElementById('main-content');
    if (!main) return;

    _slug = getSlugFromURL();
    if (!_slug) {
        main.innerHTML = renderNotFound();
        return;
    }

    data.load().catch(() => {});

    main.innerHTML = renderPage();
    main.addEventListener('click', onMainClick);

    data.onChange(refresh);
    cart.onChange(refresh);
    wishlist.onChange(refresh);

    window.addEventListener('popstate', () => {
        _slug = getSlugFromURL();
        _viewIdx = 0;
        _selectedSize = null;
        refresh();
    });
}

export default { init };
