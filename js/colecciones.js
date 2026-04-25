/**
 * Bersaglio Jewelry — Colecciones Page
 * Soporta filtrado por colección: ?col=slug pre-selecciona el filtro activo.
 */

import { loadAllComponents } from './components.js';
import { initEffects }       from './effects.js';
import Renderer              from './utils/renderer.js';
import db                    from './data/catalog.js';
import { renderPieceCardHTML, wirePieceCardActions } from './components/piece-card.js';
import { buildProductListSchema, injectJsonLd } from './utils/schema.js';
import { initSkeletonShimmer, processImages } from './skeleton.js';
import { initPrefetch }      from './prefetch.js';

const collectionIcons = {
    'anillos':          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="64" height="64"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="3" ry="9"/></svg>`,
    'topos-aretes':     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="64" height="64"><polygon points="12,2 22,8.5 12,22 2,8.5"/><line x1="2" y1="8.5" x2="22" y2="8.5"/><polyline points="7,2 12,8.5 17,2"/></svg>`,
    'dijes-colgantes':  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="64" height="64"><path d="M12 2v14M8 12l4 4 4-4"/><circle cx="12" cy="20" r="2"/></svg>`,
    'argollas':         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="64" height="64"><circle cx="9" cy="12" r="7"/><circle cx="15" cy="12" r="7"/></svg>`,
};

// Filtro activo actual
let activeFilter = 'all';

async function init() {
    await loadAllComponents();
    await db.load();

    // Leer filtro desde URL (?col=slug)
    const urlParams = new URLSearchParams(window.location.search);
    const colParam  = urlParams.get('col');
    if (colParam && db.getCollections().find(c => c.slug === colParam)) {
        activeFilter = colParam;
    }

    renderCatalogCollections();
    renderFiltersAndPieces();
    injectCatalogSchema();
    initWhatsAppButton();
    Renderer.initScrollAnimations();
    Renderer.initLazyImages();
    initSkeletonShimmer();
    initPrefetch();
    initEffects();

    // Real-time: re-render when admin changes data
    db.startRealtime().catch(() => {});
    db.onChange(() => {
        renderCatalogCollections();
        renderPieces(document.getElementById('featured-grid'));
    });
}

function injectCatalogSchema() {
    const base = 'https://bersagliojewelry.co';
    injectJsonLd('breadcrumb-schema', {
        '@context': 'https://schema.org',
        '@type':    'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Inicio',      item: `${base}/` },
            { '@type': 'ListItem', position: 2, name: 'Colecciones', item: `${base}/colecciones.html` },
        ]
    });
    injectJsonLd('catalog-page-schema', {
        '@context':    'https://schema.org',
        '@type':       'CollectionPage',
        name:          'Colecciones — Bersaglio Jewelry',
        description:   'Explora las colecciones de Bersaglio Jewelry: Anillos, Topos & Aretes, Dijes & Colgantes y Argollas. Alta joyería certificada.',
        url:           `${base}/colecciones.html`,
        isPartOf:      { '@type': 'WebSite', name: 'Bersaglio Jewelry', url: base },
    });
}

function initWhatsAppButton() {
    const { whatsapp } = db.getContact();
    const phone = whatsapp.replace('+', '');
    const msg   = encodeURIComponent('Hola Bersaglio Jewelry, me interesa conocer más sobre sus colecciones.');
    const url   = `https://wa.me/${phone}?text=${msg}`;
    document.querySelectorAll('.wa-float, #wa-nav').forEach(btn => { btn.href = url; });
}

function renderCatalogCollections() {
    const grid = document.getElementById('catalog-collections-grid');
    if (!grid) return;

    const collections = db.getCollections();

    grid.innerHTML = collections.map(col => `
        <article class="catalog-collection-card animate-on-scroll">
            <a href="${col.slug}.html" class="catalog-collection-link" aria-label="Explorar ${col.name}">
                <div class="catalog-collection-visual">
                    ${col.bannerUrl
                        ? `<img src="${col.bannerUrl}" alt="${col.name}" loading="lazy">`
                        : (collectionIcons[col.slug] || collectionIcons['anillos'])}
                </div>
                <div class="catalog-collection-body">
                    <div class="catalog-collection-count">${col.pieces} piezas</div>
                    <h2 class="catalog-collection-name">${col.name}</h2>
                    <p class="catalog-collection-subtitle">${col.subtitle}</p>
                    <p class="catalog-collection-desc">${col.description}</p>
                    <span class="catalog-collection-cta">
                        Explorar colección
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </span>
                </div>
            </a>
        </article>
    `).join('');
}

function renderFiltersAndPieces() {
    const section = document.querySelector('.section.featured');
    if (!section) return;

    const header = section.querySelector('.section-header');
    const grid   = document.getElementById('featured-grid');
    if (!grid) return;

    // Insertar filtros entre el header y el grid
    const existingFilters = section.querySelector('.catalog-filters');
    if (!existingFilters) {
        const filtersEl = document.createElement('div');
        filtersEl.className = 'catalog-filters animate-on-scroll';
        filtersEl.setAttribute('role', 'tablist');
        filtersEl.setAttribute('aria-label', 'Filtrar por colección');

        const collections = db.getCollections();
        filtersEl.innerHTML = `
            <button class="catalog-filter-btn ${activeFilter === 'all' ? 'is-active' : ''}"
                    data-filter="all" role="tab" aria-selected="${activeFilter === 'all'}">
                Todas las piezas
            </button>
            ${collections.map(col => `
                <button class="catalog-filter-btn ${activeFilter === col.slug ? 'is-active' : ''}"
                        data-filter="${col.slug}" role="tab" aria-selected="${activeFilter === col.slug}">
                    ${col.name}
                </button>
            `).join('')}
        `;

        header.after(filtersEl);

        // Eventos de filtro
        filtersEl.querySelectorAll('.catalog-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                activeFilter = btn.dataset.filter;
                filtersEl.querySelectorAll('.catalog-filter-btn').forEach(b => {
                    b.classList.toggle('is-active', b.dataset.filter === activeFilter);
                    b.setAttribute('aria-selected', b.dataset.filter === activeFilter);
                });
                renderPieces(grid);
            });
        });
    }

    renderPieces(grid);
}

function renderPieces(grid) {
    const allPieces = activeFilter === 'all'
        ? db.getAll()
        : db.getByCollection(activeFilter);

    if (!allPieces.length) {
        grid.innerHTML = `
            <div class="col-empty" style="grid-column:1/-1; text-align:center; padding: 80px 0;">
                <p style="font-family:var(--font-display-aqua); font-size:1.4rem; font-weight:300; color:var(--bj-ink-soft);">
                    Próximamente en esta colección
                </p>
                <a href="contacto.html" class="btn-aqua btn-aqua-emerald" style="margin-top: 24px;">
                    Consultar disponibilidad
                </a>
            </div>`;
        return;
    }

    grid.innerHTML = allPieces.map(renderPieceCardHTML).join('');

    injectJsonLd('catalog-products-schema', buildProductListSchema(allPieces));
    wirePieceCardActions(grid);

    Renderer.initScrollAnimations();
    processImages();
}

init();
