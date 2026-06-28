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

import { html, escape, mount } from '../core/html.js';
import { priceDisplay } from '../core/format.js';
import { lqipBgStyle } from '../core/lqip.js';   // §110.4: blur-up de la imagen principal (idx 0)
import { data } from '../core/data.js';
import { cart } from '../core/cart.js';
import { wishlist } from '../core/wishlist.js';
import { injectProductSchema, injectBreadcrumbSchema } from '../core/schema.js';
import { pieceUrl, pieceAbsUrl } from '../core/urls.js';
import { balancedCols } from '../core/grid-balance.js';       // reparto inteligente de columnas
import { track, trackPieceView } from '../analytics.js';      // medición GA4 (view_item / view_item_list)
import { mergeGlobal, waLink } from '../core/global-defaults.js';  // WhatsApp directo (fuente única del número)
import { saveInquiry } from '../firestore-service.js';        // lead in-page (form flotante, no navega a contacto)

let _slug = '';
let _viewIdx = 0;
let _selectedSize = null;
let _viewTrackedSlug = '';   // GA4 view_item: 1× por pieza (no en cada re-render)
let _listTrackedSlug = '';   // GA4 view_item_list: 1× por pieza (impresión del riel)

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

// Precio unificado (§133 → §138): index, catálogo y ficha leen el MISMO helper `priceDisplay`
// (core/format.js). Sin precio → la etiqueta ÚNICA "Precio a consultar". (Antes la ficha caía a
// 'Consultar precio' y el index a 'Cotización'; consolidado en §138.)

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

// ── WhatsApp directo (TODO-37 B0.5 · "frena la fuga") ──────────────────────────
// Alta joyería = mayoría "bajo consulta": antes el CTA caía a /contacto.html (formulario
// largo que pierde en móvil = fuga de leads, dx del Plan Maestro §1/§2). Ahora abre WhatsApp
// con la pieza YA escrita (nombre + Ref. + URL) para que Kary responda con contexto. El número
// sale de la FUENTE ÚNICA (siteContent/global.contacto → fallback al real); nunca href vacío.
function asesorWaText(piece) {
    if (!piece) return 'Hola Bersaglio, quisiera información sobre una pieza.';
    const ref = piece.code ? ` (Ref. ${piece.code})` : '';
    const url = pieceAbsUrl(piece.slug || piece.id);
    return `Hola Bersaglio, me interesa esta pieza: ${piece.name || 'Pieza'}${ref}. ${url}`;
}
function asesorWaHref(piece) {
    const wa = mergeGlobal(data.getSiteContent('global')).contacto.whatsapp;
    return waLink(wa, asesorWaText(piece));
}

function renderGallery(piece) {
    const images = (piece.images || []).filter(Boolean);
    if (images.length === 0 && piece.image) images.push(piece.image);
    if (images.length === 0) images.push(''); // placeholder
    const idx = Math.min(_viewIdx, images.length - 1);
    const main = images[idx];
    const showCert = piece.specs?.certificate || piece.specs?.gia;

    const multi = images.length > 1;   // Carrusel (flechas + puntos) SOLO con >1 imagen (Daniel)

    return html`
        <div class="pz-gallery">
            <div class="glass glass-iridescent pz-main">
                <div class="pz-main-img" style="${lqipBgStyle(main, '')};background-size:cover;background-position:center"></div>
                ${showCert ? html`
                    <div class="pz-main-chips">
                        <div class="chip pz-cert-chip">
                            ${gemSVG()}Certificado
                        </div>
                    </div>` : ''}
                ${multi ? html`
                    <button type="button" class="pz-nav pz-nav-prev" data-action="gallery-prev" aria-label="Imagen anterior">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <button type="button" class="pz-nav pz-nav-next" data-action="gallery-next" aria-label="Imagen siguiente">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                    <div class="pz-counter">${idx + 1} / ${images.length}</div>` : ''}
            </div>
            ${multi ? html`
                <div class="pz-dots" role="tablist" aria-label="Imágenes de la pieza">
                    ${images.map((_, i) => html`
                        <button type="button"
                                class="pz-dot ${i === idx ? 'is-active' : ''}"
                                data-action="dot" data-idx="${i}"
                                aria-label="Ver imagen ${i + 1}"
                                ${i === idx ? 'aria-current="true"' : ''}></button>`)}
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

    return html`
        <div class="pz-info">
            <div class="pz-info-top">
                <span class="eyebrow pz-info-eyebrow">${escape(cat)} · Alta Joyería</span>
                ${piece.badge ? html`<span class="chip pz-badge">${escape(piece.badge)}</span>` : ''}
            </div>
            <h1 class="pz-info-name">${escape(piece.name || 'Pieza')}</h1>

            ${hasPrice ? html`
            <div class="pz-price-row">
                <div class="mono pz-price">${escape(priceDisplay(piece))}</div>
                <div class="pz-iva">IVA incluido</div>
            </div>` : ''}

            ${desc ? html`<p class="pz-info-desc">${escape(desc)}</p>` : ''}

            ${(specs.hero || specs.groups.length) ? html`
                <div class="glass glass-iridescent pz-ficha">
                    <span class="pz-ficha-watermark" aria-hidden="true">${emeraldGemSVG(220, false)}</span>
                    <div class="pz-ficha-head"><span class="pz-ficha-head-label">Carta gemológica</span></div>
                    ${specs.hero ? html`
                        <div class="pz-ficha-hero">
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
                    <div class="eyebrow pz-talla-label pz-talla-medida-title">Talla a medida</div>
                    <p class="pz-talla-medida-note">Su pieza se ajusta en taller. Consúltela con un asesor.</p>
                </div>` : ''}

            <div class="pz-actions">
                ${hasPrice ? html`
                    <button type="button" class="btn-aqua btn-aqua-emerald pz-cart-btn" data-action="cart">
                        ${inCart ? 'Ver carrito' : 'Agregar al carrito'}
                    </button>`
                : html`
                    <a href="${asesorWaHref(piece)}" target="_blank" rel="noopener"
                       class="btn-aqua btn-aqua-emerald pz-cart-btn pz-asesor-primary"
                       data-wa-click="pieza" data-wa-piece="${escape(piece.slug || piece.id)}"
                       data-wa-name="${escape(piece.name || 'Pieza')}" data-wa-cat="${escape(cat)}">
                        Consultar por WhatsApp
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
                <a href="${asesorWaHref(piece)}" target="_blank" rel="noopener"
                   class="btn-aqua btn-aqua-gold pz-asesor-btn"
                   data-wa-click="pieza" data-wa-piece="${escape(piece.slug || piece.id)}"
                   data-wa-name="${escape(piece.name || 'Pieza')}" data-wa-cat="${escape(cat)}">
                    Consultar por WhatsApp
                </a>`
            : html`
                <button type="button" class="btn-aqua btn-aqua-gold pz-asesor-btn pz-asesor-secondary" data-action="lead-open">
                    Prefiero dejar mis datos
                </button>`}

            ${piece.code ? html`<div class="pz-ref mono">Ref. ${escape(piece.code)}</div>` : ''}
        </div>`;
}

// ── Recomendaciones por CONTENIDO (cero-ficción: nunca al azar bajo un título mentiroso) ──
// Comité ×4 + consejo Gemini (TODO-36): la categoría es COMPUERTA (no peso suelto que se vuelque);
// gema/metal/precio solo ORDENAN; precio ausente = neutro. Si faltan afines, se COMPLETA con
// Destacadas (curaduría real, no azar) y el título cambia a uno honesto → riel completo SIN mentir.
const _norm = s => String(s || '').toLowerCase();
const _cap  = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
function stoneTokens(p) {
    return _norm(p.specs?.stones || p.specs?.stone).split(/[^a-záéíóúñ]+/i).filter(t => t.length > 2);
}
function metalToken(p) {
    return _norm(p.specs?.metal || p.specs?.gold).replace(/[^a-z0-9]+/g, ' ').trim();
}
function relatedScore(base, cand) {
    const shared = stoneTokens(base).filter(t => stoneTokens(cand).includes(t)).length;
    let score = shared * 20;
    if (metalToken(base) && metalToken(base) === metalToken(cand)) score += 8;
    const bp = Number(base.price), cp = Number(cand.price);   // precio ausente = NEUTRO (no penaliza)
    if (bp > 0 && cp > 0 && Math.min(bp, cp) / Math.max(bp, cp) >= 0.6) score += 6;
    if (cand.featured) score += 1;
    return { score, shared };
}

// Devuelve { shown[], lead, emph } o null (catálogo sin nada real que mostrar → ocultar el riel).
function computeRelated(piece) {
    const slug = piece.slug || piece.id;
    const withImg = p => p.images?.[0] || p.image;
    const others = data.getAll().filter(p => (p.slug || p.id) !== slug && withImg(p));
    const sameCat = p => p.collection && p.collection === piece.collection;

    // Afines = misma categoría (COMPUERTA) O comparten gema; ordenados: categoría primero, luego score.
    const relevants = others
        .map(p => ({ p, ...relatedScore(piece, p), same: sameCat(p) }))
        .filter(x => x.same || x.shared > 0)
        .sort((a, b) => (b.same - a.same) || (b.score - a.score))
        .map(x => x.p);

    const shown = relevants.slice(0, 4);
    // Completar con DESTACADAS (curaduría); si aún faltan, otras piezas reales — NUNCA al azar mintiendo.
    if (shown.length < 4) {
        const have = new Set(shown.map(p => p.slug || p.id));
        const pool = [...data.getFeatured(20).filter(p => withImg(p) && (p.slug || p.id) !== slug), ...others];
        for (const p of pool) {
            if (shown.length >= 4) break;
            const k = p.slug || p.id;
            if (!have.has(k)) { have.add(k); shown.push(p); }
        }
    }
    if (shown.length === 0) return null;

    // Título HONESTO: solo promete categoría/gema si TODO el riel es afín (sin relleno curado).
    const onlyRelevant = shown.every(p => relevants.includes(p));
    const mainGem = stoneTokens(piece)[0];
    let lead, emph;
    if (onlyRelevant && shown.every(p => p.collection === piece.collection)) {
        lead = 'Más de';         emph = getCategoryLabel(piece);
    } else if (onlyRelevant && mainGem && shown.every(p => stoneTokens(p).includes(mainGem))) {
        lead = 'También en';     emph = _cap(mainGem);
    } else {
        lead = 'Más piezas del'; emph = 'atelier';
    }
    return { shown, lead, emph };
}

function renderRelated(piece) {
    const rel = computeRelated(piece);
    if (!rel) return '';
    const { shown, lead, emph } = rel;
    const cols = balancedCols(shown.length, 4);
    return html`
        <section class="pz-related">
            <div class="pz-related-header">
                <div class="eyebrow">También podría gustarte</div>
                <h2 class="pz-related-title">${escape(lead)} <span class="italic emerald-text">${escape(emph)}</span></h2>
            </div>
            <div class="pz-related-grid" style="--n:${cols}">
                ${shown.map((p, i) => {
                    const pSlug = p.slug || p.id;
                    const img = p.images?.[0] || p.image || '';
                    return html`
                        <a class="glass glass-iridescent pz-related-card"
                           href="${pieceUrl(pSlug)}"
                           data-piece-slug="${escape(pSlug)}" data-piece-name="${escape(p.name || 'Pieza')}"
                           data-list-id="related_pieces" data-index="${i}">
                            <div class="pz-related-imgwrap">
                                <div class="pz-related-img" style="background:url('${escape(img)}') center/cover"></div>
                            </div>
                            <div class="pz-related-body">
                                <div class="pz-related-name">${escape(p.name || 'Pieza')}</div>
                                <div class="${p.price ? 'mono pz-related-price' : 'pz-related-price pz-related-price--consulta'}">${escape(priceDisplay(p))}</div>
                            </div>
                        </a>`;
                })}
            </div>
        </section>`;
}

// ── Form flotante de lead (Daniel 2026-06-26) ──────────────────────────────────
// "Prefiero dejar mis datos" abre ESTE modal en la MISMA ficha (no navega a
// /contacto.html → el cliente no cae en una página ajena y el lead NO se pierde).
// Guarda en la Bandeja del CRM (saveInquiry → inquiries, MISMO destino que contacto)
// con la pieza enlazada (pieceSlug). Optimista: éxito inmediato, Firestore en background.
function leadFormHtml(piece) {
    return html`
        <form class="pz-lead-form" data-lead-form novalidate>
            <div class="eyebrow pz-lead-eyebrow">Déjanos tus datos</div>
            <h3 class="pz-lead-title">Te contactamos por <span class="italic emerald-text">${escape(piece.name || 'esta pieza')}</span></h3>
            <p class="pz-lead-sub">Cuéntanos cómo ubicarte y un asesor te escribe pronto.</p>
            <input class="pz-lead-input" name="nombre" placeholder="Tu nombre" autocomplete="name" required>
            <input class="pz-lead-input" name="tel" placeholder="WhatsApp o teléfono" autocomplete="tel" inputmode="tel" required>
            <input class="pz-lead-input" name="email" type="email" placeholder="Correo (opcional)" autocomplete="email">
            <textarea class="pz-lead-input pz-lead-textarea" name="mensaje" rows="2" placeholder="¿Algo que debamos saber? (opcional)"></textarea>
            <button type="submit" class="btn-aqua btn-aqua-emerald pz-lead-submit">Enviar mis datos</button>
        </form>`;
}
function leadSuccessHtml() {
    return html`
        <div class="pz-lead-success">
            <div class="pz-lead-success-icon" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h3 class="pz-lead-title">¡Gracias! Te contactamos pronto.</h3>
            <p class="pz-lead-sub">Recibimos tus datos. Un asesor de Bersaglio te escribirá sobre esta pieza.</p>
            <button type="button" class="btn-aqua pz-lead-done" data-action="lead-close">Cerrar</button>
        </div>`;
}
function renderLeadModal(piece) {
    return html`
        <div class="pz-lead-modal" data-lead-modal>
            <div class="pz-lead-backdrop" data-action="lead-close"></div>
            <div class="glass glass-iridescent pz-lead-card" role="dialog" aria-modal="true" aria-label="Déjanos tus datos">
                <button type="button" class="pz-lead-x" data-action="lead-close" aria-label="Cerrar">&times;</button>
                <div class="pz-lead-body" data-lead-body>${leadFormHtml(piece)}</div>
            </div>
        </div>`;
}
function openLead() {
    const modal = document.querySelector('[data-lead-modal]');
    const piece = data.getBySlug(_slug);
    if (!modal || !piece) return;
    // re-pinta el form limpio (por si quedó en estado "éxito" de un envío anterior)
    mount(modal.querySelector('[data-lead-body]'), leadFormHtml(piece));
    modal.classList.add('is-open');
    try { document.body.style.overflow = 'hidden'; } catch { /* no-op */ }
    modal.querySelector('[name="nombre"]')?.focus();
}
function closeLead() {
    document.querySelector('[data-lead-modal]')?.classList.remove('is-open');
    try { document.body.style.overflow = ''; } catch { /* no-op */ }
}
function onLeadSubmit(e) {
    const form = e.target.closest('[data-lead-form]');
    if (!form) return;
    e.preventDefault();
    const nombre = (form.nombre?.value || '').trim();
    const tel    = (form.tel?.value || '').trim();
    if (!nombre || !tel) { (!nombre ? form.nombre : form.tel)?.focus(); return; }
    const email   = (form.email?.value || '').trim();
    const mensaje = (form.mensaje?.value || '').trim();
    const piece = data.getBySlug(_slug);
    const slug      = piece?.slug || piece?.id || _slug;
    const pieceName = piece?.name || 'Pieza';

    // Optimista: muestra el éxito ya; Firestore en background (igual que contacto.js).
    mount(form.closest('[data-lead-body]'), leadSuccessHtml());
    try { track('generate_lead', { lead_type: 'pieza', piece_slug: slug }); } catch { /* analítica nunca rompe */ }
    saveInquiry({
        name: nombre, email, phone: tel,
        message: `[Pieza] Me interesa: ${pieceName}${mensaje ? ` — ${mensaje}` : ''}`,
        pieceSlug: slug, source: 'pieza-form',
    }).catch(err => console.warn('[pieza] saveInquiry falló (UX no-op):', err));
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
                    <a href="${asesorWaHref(null)}" target="_blank" rel="noopener" class="btn-aqua" data-wa-click="pieza-404">Hablar por WhatsApp</a>
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
            ${renderLeadModal(piece)}
        </div>`;
}

// GA4 view_item_list: dispara cuando el riel de relacionados ENTRA a pantalla (impresión real,
// no solo render — consejo Gemini/comité). 1× por pieza. Lee los slugs ya pintados (sin recomputar).
function trackRelatedImpression() {
    if (_listTrackedSlug === _slug) return;
    const grid = document.querySelector('.pz-related-grid');
    if (!grid) return;
    const cards = [...grid.querySelectorAll('[data-piece-slug]')];
    if (!cards.length) return;
    const fire = () => {
        if (_listTrackedSlug === _slug) return;
        _listTrackedSlug = _slug;
        try {
            track('view_item_list', {
                item_list_id: 'related_pieces',
                item_list_name: 'Relacionados',
                items: cards.map((c, i) => ({ item_id: c.dataset.pieceSlug, item_name: c.dataset.pieceName, index: i })),
            });
        } catch { /* analítica nunca rompe el render */ }
    };
    if (typeof IntersectionObserver !== 'function') { fire(); return; }
    const io = new IntersectionObserver((entries, obs) => {
        if (entries.some(e => e.isIntersecting)) { fire(); obs.disconnect(); }
    }, { threshold: 0.5 });
    io.observe(grid);
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

        // ── Medición GA4 (TODO-36) — view_item 1× por pieza (NO en cada re-render) ──
        try { sessionStorage.setItem('bj_cur_piece', _slug); } catch { /* sin storage */ }
        if (_viewTrackedSlug !== _slug) {
            _viewTrackedSlug = _slug;
            try { trackPieceView(piece); } catch { /* analítica nunca rompe el render */ }
        }
        trackRelatedImpression();   // view_item_list cuando el riel entra a pantalla
    }
}

// Carrusel: lista de imágenes reales de la pieza (con fallback a image legacy).
function galleryImages(piece) {
    const images = (piece.images || []).filter(Boolean);
    if (images.length === 0 && piece.image) images.push(piece.image);
    return images;
}

// Carrusel: muestra la imagen `newIdx` (con wrap-around) — swap DIRECTO del fondo +
// actualiza contador y puntos, SIN re-render (mismo patrón liviano que la antigua miniatura).
function setGalleryIdx(images, newIdx) {
    const n = images.length;
    if (n <= 1) return;
    _viewIdx = ((newIdx % n) + n) % n;
    const mainEl = document.querySelector('.pz-main-img');
    if (mainEl) mainEl.style.backgroundImage = `url('${images[_viewIdx]}')`;   // solo la imagen (conserva el color de fondo limpio del CSS para transparentes)
    const counter = document.querySelector('.pz-counter');
    if (counter) counter.textContent = `${_viewIdx + 1} / ${n}`;
    document.querySelectorAll('.pz-dot').forEach((el, i) => {
        const on = i === _viewIdx;
        el.classList.toggle('is-active', on);
        if (on) el.setAttribute('aria-current', 'true'); else el.removeAttribute('aria-current');
    });
}

function onMainClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'lead-open')  { e.preventDefault(); openLead();  return; }
    if (action === 'lead-close') { e.preventDefault(); closeLead(); return; }

    if (action === 'gallery-prev' || action === 'gallery-next' || action === 'dot') {
        e.preventDefault();
        const piece = data.getBySlug(_slug);
        if (!piece) return;
        const images = galleryImages(piece);
        if (images.length <= 1) return;
        const next = action === 'dot'
            ? (Number(btn.dataset.idx) || 0)
            : _viewIdx + (action === 'gallery-next' ? 1 : -1);
        setGalleryIdx(images, next);
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
    main.addEventListener('submit', onLeadSubmit);   // form flotante de lead
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLead(); });

    // Carrusel: swipe táctil en la galería (móvil) → siguiente/anterior imagen.
    let _touchX = null;
    main.addEventListener('touchstart', e => {
        _touchX = e.target.closest('.pz-main') ? e.changedTouches[0].clientX : null;
    }, { passive: true });
    main.addEventListener('touchend', e => {
        if (_touchX === null) return;
        const dx = e.changedTouches[0].clientX - _touchX;
        _touchX = null;
        if (Math.abs(dx) < 40) return;   // umbral: ignora toques/scroll vertical
        const piece = data.getBySlug(_slug);
        if (!piece) return;
        const images = galleryImages(piece);
        if (images.length <= 1) return;
        setGalleryIdx(images, _viewIdx + (dx < 0 ? 1 : -1));   // swipe izq → siguiente
    }, { passive: true });

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
