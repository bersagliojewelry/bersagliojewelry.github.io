/**
 * Home · Sección 4 — Piezas destacadas (DINÁMICO desde Firestore).
 *
 * REGLA cero-ficción (`feedback_no_demo_en_index`): con menos de MIN_FEATURED piezas
 * destacadas-con-precio la sección NO se monta (hide-when-empty), SIN placeholder.
 *
 * CARGA FLUIDA (comité v3 + consejo Gemini · 2026-06-21): mismo modelo de 3 estados que
 * categorías para que el contenido no salte al llegar Firebase: LISTO+datos → contenido (fade-in,
 * swap directo en .bj-lite/RM); LISTO+<umbral → '' (colapsa); CARGANDO → reserva el alto de la
 * última carga (1ª visita sin alto → '' colapso limpio). `data.isReady('featured')` mira datos
 * REALES (no el timeout de 4s); un watchdog de 8s colapsa si nunca llegan (anti-carga-eterna).
 */
import { html, escape, mount } from '../core/html.js';
import { format$ } from '../core/format.js';
import { data } from '../core/data.js';
import { MIN_FEATURED } from '../core/home-sections.js';   // umbral de dignidad (SSoT cero-ficción)
import { reservedHeight, rememberHeight } from '../core/section-reserve.js';
import { lqipBgStyle } from '../core/lqip.js';             // §108 F3: blur-up (degrada si no hay LQIP)
import { pieceUrl } from '../core/urls.js';               // SSoT URL pieza horneada (/pieza/<slug>.html)

// Piezas visibles en Destacadas = featured + con FOTO (la franja es un escaparate VISUAL).
// Daniel 2026-06-23: el precio es OPCIONAL (price-on-request → format$ pinta "Cotización"); lo
// comercial manda, una pieza sin precio igual se muestra. Lee en TIEMPO DE RENDER (live).
const featuredPieces = () => data.getFeatured(8).filter(p => p.images?.[0] || p.image);

// Watchdog anti-carga-eterna (ver categories.js): 8s > timeout de data.load() (4s) para dar
// margen a redes lentas a llenar la reserva sin saltar.
let _watchdog = null;
let _gaveUp = false;
function armWatchdog() {
    if (_watchdog !== null || _gaveUp) return;
    try {
        _watchdog = setTimeout(() => {
            _watchdog = null;
            if (!data.isReady('featured')) { _gaveUp = true; refreshFeatured(); }
        }, 8000);
    } catch { /* entorno sin timers → sin watchdog (no crítico) */ }
}

export function renderFeatured() {
    armWatchdog();
    return html`<section class="home-featured">${featuredInner()}</section>`;
}

// Header de marca — COPY ESTÁTICO (ancla la sección en "cargando").
function headerHtml() {
    return html`
        <div class="home-featured-header">
            <div>
                <div class="eyebrow">Curaduría del Atelier</div>
                <h2 class="home-featured-title">Piezas <span class="italic emerald-text">singulares</span></h2>
            </div>
            <a href="/colecciones.html" class="btn-aqua home-featured-cta">
                Explorar el catálogo entero
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </a>
        </div>`;
}

function contentHtml(pieces) {
    return html`
        <div class="container">
            ${headerHtml()}
            <div class="home-featured-grid" data-featured>
                ${pieces.slice(0, 6).map(renderFeaturedCard)}
            </div>
        </div>`;
}

// CARGANDO: header real + grilla vacía con el alto reservado de la última carga.
function loadingHtml(rh) {
    return html`
        <div class="container">
            ${headerHtml()}
            <div class="home-featured-grid is-loading" aria-busy="true" aria-hidden="true" style="min-height:${rh}px"></div>
        </div>`;
}

function featuredInner() {
    const pieces = featuredPieces();
    if (data.isReady('featured')) {
        return pieces.length >= MIN_FEATURED ? contentHtml(pieces) : '';   // datos | bajo umbral(colapsa)
    }
    if (_gaveUp) return '';                                                 // watchdog: datos nunca llegaron
    const rh = reservedHeight('featured');
    return rh ? loadingHtml(rh) : '';                                       // reserva | colapso limpio (1ª visita)
}

function renderFeaturedCard(p) {
    const slug = p.slug || p.id;
    const img = p.images?.[0] || p.image || '';
    const tag = p.tag || (p.featured ? 'Destacada' : null);
    const stones = p.specs?.stones || p.specs?.stone || '';
    const metal  = p.specs?.metal  || p.specs?.gold  || '';
    const cat = p.collection || '';
    return html`
        <a class="glass glass-iridescent home-featured-card"
           href="${pieceUrl(slug)}">
            <div class="home-featured-card-imgwrap">
                <div class="home-featured-card-img" style="${lqipBgStyle(img, p.imageLqip)};background-size:cover;background-position:center"></div>
                <div class="home-featured-card-vignette" aria-hidden="true"></div>
                ${tag ? html`
                    <div class="home-featured-card-tag">
                        <div class="chip">
                            <span class="chip-dot"></span>${escape(tag)}
                        </div>
                    </div>` : ''}
                <div class="home-featured-card-wishlist" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </div>
            </div>
            <div class="home-featured-card-body">
                <div class="home-featured-card-cat">${escape(cat)}</div>
                <div class="home-featured-card-name">${escape(p.name || 'Pieza')}</div>
                <div class="home-featured-card-meta">${escape([stones, metal].filter(Boolean).join(' · '))}</div>
                <div class="home-featured-card-foot">
                    <div class="mono home-featured-card-price">${escape(format$(p.price))}</div>
                    <div class="home-featured-card-arrow">
                        Ver pieza
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </div>
                </div>
            </div>
        </a>`;
}

export function refreshFeatured() {
    const sec = document.querySelector('.home-featured');
    if (!sec) return;
    if (data.isReady('featured') && _watchdog !== null) { clearTimeout(_watchdog); _watchdog = null; }
    const hadContent = !!sec.querySelector('[data-featured]');
    mount(sec, featuredInner());
    const grid = sec.querySelector('[data-featured]');
    if (grid) {
        requestAnimationFrame(() => rememberHeight('featured', grid));
        if (!hadContent) grid.classList.add('bj-fade-in');
    }
}

export default { renderFeatured, refreshFeatured };
