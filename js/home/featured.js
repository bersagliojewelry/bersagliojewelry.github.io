/**
 * Home · Sección 4 — Piezas destacadas (DINÁMICO desde Firestore).
 * refreshFeatured() re-renderiza el grid en cada data.onChange().
 */
import { html, escape } from '../core/html.js';
import { format$ } from '../core/format.js';
import { data } from '../core/data.js';

export function renderFeatured() {
    const pieces = data.getFeatured(8).filter(p => p.price);
    return html`
        <section class="home-featured">
            <div class="container">
                <div class="home-featured-header">
                    <div>
                        <div class="eyebrow">Curaduría del Atelier</div>
                        <h2 class="home-featured-title">Piezas <span class="italic emerald-text">singulares</span></h2>
                    </div>
                    <a href="/colecciones.html" class="btn-aqua home-featured-cta">
                        Explorar el catálogo entero
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </a>
                </div>

                <div class="home-featured-grid" data-featured>
                    ${pieces.length === 0 ? renderFeaturedEmpty() : pieces.slice(0, 6).map(renderFeaturedCard)}
                </div>
            </div>
        </section>`;
}

function renderFeaturedEmpty() {
    return html`
        <div class="home-featured-empty">
            <p class="mono home-featured-empty-text">El atelier está afilando la próxima curaduría.</p>
            <a href="/colecciones.html" class="btn-aqua btn-aqua-emerald">Explorar todas las piezas</a>
        </div>`;
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
           href="/pieza.html?p=${encodeURIComponent(slug)}">
            <div class="home-featured-card-imgwrap">
                <div class="home-featured-card-img" style="background:url('${escape(img)}') center/cover"></div>
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
    const grid = document.querySelector('[data-featured]');
    if (!grid) return;
    const pieces = data.getFeatured(8).filter(p => p.price);
    grid.innerHTML = pieces.length === 0
        ? renderFeaturedEmpty()
        : pieces.slice(0, 6).map(renderFeaturedCard).join('');
}

export default { renderFeatured, refreshFeatured };
