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
import { lqipBgStyle } from '../core/lqip.js';   // §110.4: blur-up de la imagen principal (idx 0)
import { data } from '../core/data.js';
import { cart } from '../core/cart.js';
import { wishlist } from '../core/wishlist.js';
import { injectProductSchema, injectBreadcrumbSchema } from '../core/schema.js';
import { pieceUrl, pieceAbsUrl } from '../core/urls.js';

let _slug = '';
let _viewIdx = 0;
let _selectedSize = null;

const TALLAS_COLLECTIONS = new Set(['anillos', 'argollas']);

function getSlugFromURL() {
    // Página HORNEADA (/pieza/<slug>.html) → window.PRERENDERED_PIECE_SLUG (sin ?p=, lo
    // inyecta el SSG). Shell legacy /pieza.html?p=<slug> → query param. (TODO-35.)
    if (typeof window !== 'undefined' && window.PRERENDERED_PIECE_SLUG) return window.PRERENDERED_PIECE_SLUG;
    return new URL(location.href).searchParams.get('p') || '';
}

function gemSVG() {
    return html`<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="12,2 22,8.5 12,22 2,8.5"/></svg>`;
}

// Gema talla esmeralda (octágono facetado con lustre radial) — firma de la "Carta
// Gemológica". Render fino portado de Claude Design (adaptado, no mirror). lustrous=true →
// mesa interior con degradado mint→esmeralda que simula brillo (héroe); false → solo
// contorno (filigrana de fondo). El trazo hereda currentColor (esmeralda del contenedor).
function emeraldGemSVG(size, lustrous) {
    const luster = lustrous
        ? html`<defs><radialGradient id="bjGemLuster" cx="42%" cy="36%" r="68%"><stop offset="0" stop-color="#CFEBDC" stop-opacity="0.95"/><stop offset="1" stop-color="#0E5A38" stop-opacity="0.26"/></radialGradient></defs><polygon points="38,20 62,20 80,38 80,62 62,80 38,80 20,62 20,38" fill="url(#bjGemLuster)" stroke="none"/>`
        : '';
    return html`<svg viewBox="0 0 100 100" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
        ${luster}
        <polygon points="30,2 70,2 98,30 98,70 70,98 30,98 2,70 2,30" stroke-opacity="0.9"/>
        <polygon points="38,20 62,20 80,38 80,62 62,80 38,80 20,62 20,38" stroke-opacity="0.55"/>
        <line x1="30" y1="2" x2="38" y2="20" stroke-opacity="0.4"/>
        <line x1="70" y1="2" x2="62" y2="20" stroke-opacity="0.4"/>
        <line x1="98" y1="30" x2="80" y2="38" stroke-opacity="0.4"/>
        <line x1="98" y1="70" x2="80" y2="62" stroke-opacity="0.4"/>
        <line x1="70" y1="98" x2="62" y2="80" stroke-opacity="0.4"/>
        <line x1="30" y1="98" x2="38" y2="80" stroke-opacity="0.4"/>
        <line x1="2" y1="70" x2="20" y2="62" stroke-opacity="0.4"/>
        <line x1="2" y1="30" x2="20" y2="38" stroke-opacity="0.4"/>
    </svg>`;
}

function heartSVG() {
    return html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
}
function heartSolidSVG() {
    return html`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
}

// Cero-demo (feedback_no_demo_en_index): NUNCA inventar copy. Si no hay descripción real
// (o es dato de prueba "PRUEBA n"), no se muestra nada (hide-when-empty). El fallback viejo
// afirmaba "esmeralda de Cartagena" en piezas que no lo son → mentira verificable.
function descriptionFor(piece) {
    const d = (piece.description || '').trim();
    if (!d || /^prueba\b/i.test(d)) return '';
    return d;
}

// Precio unificado: "Bajo consulta" cuando no hay precio (alta joyería = mayoría sin precio público).
// Una sola etiqueta de marca en detalle Y relacionados (antes el related decía "Cotización").
function priceDisplay(price) {
    return (price && Number.isFinite(Number(price))) ? format$(price) : 'Bajo consulta';
}

// Ficha técnica DINÁMICA agrupada — "Carta Gemológica" (TODO-34). Estructura curada de
// alta joyería: la GEMA es protagonista (hero) y el resto se agrupa en secciones. Cero-demo:
// hero/grupo/fila aparecen SOLO si hay valor REAL (hide-when-empty); SIN defaults inventados.
// Escala de 2 a 11 specs sin huecos. Si NO hay piedra, los datos gemológicos caen a un grupo
// (no se pierde ningún dato real). Devuelve { hero|null, groups[], certificate }.
function buildSpecs(piece) {
    const s = piece.specs || {};
    const clean = v => (v == null ? '' : String(v).trim());
    const stones = clean(s.stones || s.stone);
    const hasStone = stones !== '';
    const carat = clean(s.carat);
    const color = clean(s.color);

    // Hero: la gema (nombre completo + quilates · color). Solo si hay piedra real.
    const hero = hasStone
        ? { name: stones, sub: [carat, color].filter(Boolean).join(' · ') }
        : null;

    const row = (key, val, pill) => ({ key, val: clean(val), pill: !!pill });
    const groups = [
        { title: 'Calidad', rows: [
            // Sin hero, quilates/color no se pierden: caen aquí.
            ...(hasStone ? [] : [row('Quilates', carat), row('Color', color)]),
            row('Claridad', s.clarity),
            row('Corte', s.cut),
            row('Acentos', s.accent),
        ] },
        { title: 'El metal', rows: [
            row('Metal', s.metal || s.gold),
            row('Peso', s.weight),
        ] },
        { title: 'Origen y garantía', rows: [
            row('Origen', s.origin),
            row('Entrega', s.delivery),
            row('Certificación', s.certificate || s.gia, true),   // pastilla dorada (sello)
        ] },
    ].map(g => ({ ...g, rows: g.rows.filter(r => r.val !== '') }))
     .filter(g => g.rows.length > 0);

    return { hero, groups };
}

function getCategoryLabel(piece) {
    const collection = data.collectionOf(piece);
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
                <div class="pz-main-img" style="${lqipBgStyle(main, idx === 0 ? piece.imageLqip : '')};background-size:cover;background-position:center"></div>
                ${showCert ? html`
                    <div class="pz-main-chips">
                        <div class="chip pz-cert-chip">
                            ${gemSVG()}Certificado
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
    const hasPrice = !!piece.price && Number.isFinite(Number(piece.price));
    const inWishlist = wishlist.has(piece.slug || piece.id);
    const inCart = cart.has(piece.slug || piece.id);
    const desc = descriptionFor(piece);
    const specs = buildSpecs(piece);

    // Tallas SOLO desde datos reales de la pieza (piece.sizes, array que controla Kary en el admin).
    // Sin stock falso 5-9. Si no hay tallas pero es anillo/argolla → "a medida" honesto. Si no, se oculta.
    const sizes = Array.isArray(piece.sizes) ? piece.sizes.map(s => String(s).trim()).filter(Boolean) : [];
    const isRingLike = TALLAS_COLLECTIONS.has(piece.collection);

    const asesorHref = `/contacto.html?ref=${encodeURIComponent(piece.slug || piece.id)}`
        + (piece.code ? `&code=${encodeURIComponent(piece.code)}` : '');

    return html`
        <div class="pz-info">
            <div class="pz-info-top">
                <span class="eyebrow pz-info-eyebrow">${escape(cat)} · Alta Joyería</span>
                ${piece.badge ? html`<span class="chip pz-badge">${escape(piece.badge)}</span>` : ''}
            </div>
            <h1 class="pz-info-name">${escape(piece.name || 'Pieza')}</h1>

            <div class="pz-price-row">
                <div class="${hasPrice ? 'mono pz-price' : 'pz-price pz-price--consulta'}">${escape(priceDisplay(piece.price))}</div>
                ${hasPrice ? html`<div class="pz-iva">IVA incluido</div>` : ''}
            </div>

            ${desc ? html`<p class="pz-info-desc">${escape(desc)}</p>` : ''}

            ${(specs.hero || specs.groups.length) ? html`
                <div class="glass glass-iridescent pz-ficha">
                    <span class="pz-ficha-watermark" aria-hidden="true">${emeraldGemSVG(220, false)}</span>
                    <div class="pz-ficha-head"><span class="pz-ficha-mark"></span><span class="pz-ficha-head-label">Carta gemológica</span></div>
                    ${specs.hero ? html`
                        <div class="pz-ficha-hero">
                            <div class="pz-ficha-hero-label">Gema principal</div>
                            <div class="pz-ficha-hero-name">${escape(specs.hero.name)}</div>
                            ${specs.hero.sub ? html`<div class="pz-ficha-hero-sub">${escape(specs.hero.sub)}</div>` : ''}
                        </div>` : ''}
                    ${specs.groups.map(g => html`
                        <div class="pz-ficha-group">
                            <div class="pz-ficha-group-title">
                                <span class="pz-ficha-mark"></span>
                                <span class="pz-ficha-group-label">${escape(g.title)}</span>
                                <span class="pz-ficha-rule"></span>
                            </div>
                            <div class="pz-ficha-rows">
                                ${g.rows.map(r => html`
                                    <div class="pz-ficha-row">
                                        <span class="pz-ficha-k">${escape(r.key)}</span>
                                        ${r.pill
                                            ? html`<span class="pz-ficha-pill"><span class="pz-ficha-mark"></span>${escape(r.val)}</span>`
                                            : html`<span class="pz-ficha-v">${escape(r.val)}</span>`}
                                    </div>`)}
                            </div>
                        </div>`)}
                </div>` : ''}

            ${sizes.length ? html`
                <div class="pz-talla">
                    <div class="eyebrow pz-talla-label">Talla</div>
                    <div class="pz-talla-pills" role="group" aria-label="Talla disponible">
                        ${sizes.map(s => html`
                            <button type="button"
                                    class="glass pz-talla-pill ${String(_selectedSize) === s ? 'is-active' : ''}"
                                    data-action="size" data-size="${escape(s)}"
                                    aria-pressed="${String(_selectedSize) === s ? 'true' : 'false'}">${escape(s)}</button>`)}
                    </div>
                </div>`
            : isRingLike ? html`
                <div class="pz-talla pz-talla--medida">
                    <div class="eyebrow pz-talla-label">Talla</div>
                    <p class="pz-talla-medida-note">Talla a medida — su pieza se ajusta en taller. Consúltela con un asesor.</p>
                </div>` : ''}

            <div class="pz-actions">
                ${hasPrice ? html`
                    <button type="button" class="btn-aqua btn-aqua-emerald pz-cart-btn" data-action="cart">
                        ${inCart ? 'Ver carrito' : 'Agregar al carrito'}
                    </button>`
                : html`
                    <a href="${asesorHref}" class="btn-aqua btn-aqua-emerald pz-cart-btn pz-asesor-primary">
                        Consultar esta pieza
                    </a>`}
                <button type="button"
                        class="btn-aqua pz-wish-btn ${inWishlist ? 'is-saved' : ''}"
                        data-action="wishlist"
                        aria-label="${inWishlist ? 'Quitar de favoritos' : 'Guardar en favoritos'}"
                        aria-pressed="${inWishlist ? 'true' : 'false'}">
                    ${inWishlist ? heartSolidSVG() : heartSVG()}
                </button>
            </div>

            ${hasPrice ? html`
                <a href="${asesorHref}" class="btn-aqua btn-aqua-gold pz-asesor-btn">
                    Consultar con un asesor
                </a>` : ''}

            ${piece.code ? html`<div class="pz-ref mono">Ref. ${escape(piece.code)}</div>` : ''}
        </div>`;
}

function renderRelated(piece) {
    const all = data.getAll();
    const slug = piece.slug || piece.id;
    const col = data.collectionOf(piece);
    let related = (col ? data.getByCollection(col.slug) : all.filter(p => p.collection === piece.collection))
        .filter(p => (p.slug || p.id) !== slug);
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
                           href="${pieceUrl(pSlug)}">
                            <div class="pz-related-imgwrap">
                                <div class="pz-related-img" style="background:url('${escape(img)}') center/cover"></div>
                            </div>
                            <div class="pz-related-body">
                                <div class="pz-related-name">${escape(p.name || 'Pieza')}</div>
                                <div class="${p.price ? 'mono pz-related-price' : 'pz-related-price pz-related-price--consulta'}">${escape(priceDisplay(p.price))}</div>
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
                <p class="pz-notfound-sub">La pieza solicitada no se encuentra disponible actualmente en nuestro atelier. Es posible que haya sido adquirida o que el enlace sea incorrecto.</p>
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

// Carga fluida (Daniel 2026-06-22): readiness REAL de piezas (no el timeout de 4s de data.load(),
// que mostraba "Esta pieza descansa en otro lugar" en FALSO en redes lentas y luego aparecía la
// pieza). Watchdog 8s → tras él, si la pieza no llegó, recién mostramos el 404.
let _wdPieza = null;
let _gaveUp = false;
function armWatchdog() {
    if (_wdPieza !== null || _gaveUp) return;
    try {
        _wdPieza = setTimeout(() => {
            _wdPieza = null;
            if (!data.isReady('featured') && !data.getBySlug(_slug)) { _gaveUp = true; refresh(); }
        }, 8000);
    } catch { /* sin timers → sin watchdog */ }
}

function renderPage() {
    const piece = data.getBySlug(_slug);
    if (!piece && !data.isReady('featured') && !_gaveUp) return renderLoading();
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
        if (canonical) canonical.setAttribute('href', pieceAbsUrl(_slug));
        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute('content', pieceAbsUrl(_slug));
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', `${piece.name} · Bersaglio Jewelry`);
        const ogImg = document.querySelector('meta[property="og:image"]');
        if (ogImg && (piece.images?.[0] || piece.image)) {
            ogImg.setAttribute('content', piece.images?.[0] || piece.image);
        }

        // Schema JSON-LD: en la página HORNEADA (SSG) ya viene en el <head> verificable
        // por crawlers sin JS. Solo se inyecta en el shell legacy ?p= (sin schema baked)
        // para no DUPLICARlo. (TODO-35.)
        if (!(typeof window !== 'undefined' && window.PRERENDERED_PIECE_SLUG)) {
            try {
                injectProductSchema(piece, getCategoryLabel, descriptionFor);
                injectBreadcrumbSchema(piece, getCategoryLabel);
            } catch (err) {
                console.warn('[pieza] Schema injection failed:', err);
            }
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
        const sz = btn.dataset.size;
        _selectedSize = (sz === _selectedSize) ? null : sz;
        document.querySelectorAll('.pz-talla-pill').forEach(el => {
            const on = el.dataset.size === _selectedSize;
            el.classList.toggle('is-active', on);
            el.setAttribute('aria-pressed', on ? 'true' : 'false');
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
    armWatchdog();
    refresh();   // paint inicial (skeleton si aún no hay datos)

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
