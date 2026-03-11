/**
 * Bersaglio Jewelry — Colecciones Page
 * Soporta filtrado por colección: ?col=slug pre-selecciona el filtro activo.
 */

import { loadAllComponents } from './components.js';
import { wishlist }          from './wishlist.js';
import { cart }              from './cart.js';
import { toast }             from './toast.js';
import { initEffects }       from './effects.js';
import Renderer              from './utils/renderer.js';
import db                    from './data/catalog.js';

const collectionIcons = {
    'esmeraldas-colombianas': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="64" height="64"><polygon points="12,2 22,8.5 12,22 2,8.5"/></svg>`,
    'diamantes-eternos':      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="64" height="64"><polygon points="12,2 19,7 22,14 12,22 2,14 5,7"/></svg>`,
    'oro-escultorico':        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="64" height="64"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/></svg>`,
    'novias':                 `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="64" height="64"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
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
    initWhatsAppButton();
    Renderer.initScrollAnimations();
    Renderer.initLazyImages();
    initEffects();
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
                    ${collectionIcons[col.slug] || collectionIcons['esmeraldas-colombianas']}
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
        ? db.getFeatured()
        : db.getByCollection(activeFilter);

    if (!allPieces.length) {
        grid.innerHTML = `
            <div class="col-empty" style="grid-column:1/-1; text-align:center; padding: var(--space-3xl) 0;">
                <p style="font-family:var(--font-display); font-size:1.4rem; font-weight:300; color:var(--text-on-dark-muted);">
                    Próximamente en esta colección
                </p>
                <a href="contacto.html" class="btn btn-outline" style="margin-top:var(--space-lg);">
                    Consultar disponibilidad
                </a>
            </div>`;
        return;
    }

    grid.innerHTML = allPieces.map(p => {
        const inWishlist = wishlist.has(p.slug);
        const inCart     = cart.has(p.slug);
        const mainSpec   = p.specs?.stone || p.specs?.metal || '';

        return `
            <article class="piece-card animate-on-scroll" itemscope itemtype="https://schema.org/Product">
                <div class="piece-image-wrapper">
                    <div class="piece-placeholder">
                        ${collectionIcons[p.collection] || collectionIcons['esmeraldas-colombianas']}
                    </div>
                    ${p.badge ? `<span class="piece-badge" itemprop="name" style="display:none">${p.name}</span>` : ''}
                    ${p.badge ? `<span class="piece-badge">${p.badge}</span>` : ''}
                    <div class="piece-actions">
                        <button
                            class="piece-wishlist-btn ${inWishlist ? 'is-saved' : ''}"
                            data-wishlist-slug="${p.slug}"
                            aria-label="${inWishlist ? 'Quitar de lista de deseos' : 'Añadir a lista de deseos'}"
                            title="Lista de deseos"
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                        </button>
                        <button
                            class="piece-cart-btn ${inCart ? 'is-in-cart' : ''}"
                            data-cart-slug="${p.slug}"
                            aria-label="${inCart ? 'En carrito' : 'Añadir al carrito'}"
                            title="Añadir al carrito"
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                                <line x1="3" y1="6" x2="21" y2="6"/>
                                <path d="M16 10a4 4 0 0 1-8 0"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="piece-info">
                    ${mainSpec ? `<span class="piece-spec-tag">${mainSpec}</span>` : ''}
                    <h3 class="piece-name">
                        <a href="pieza.html?p=${p.slug}" itemprop="url">${p.name}</a>
                    </h3>
                    <p class="piece-desc">${p.description}</p>
                    <div class="piece-footer">
                        <span class="piece-price">${p.priceLabel}</span>
                        <a href="pieza.html?p=${p.slug}" class="btn btn-outline btn-sm">Ver pieza</a>
                    </div>
                </div>
            </article>`;
    }).join('');

    // Re-init wishlist + cart buttons
    wishlist.initButtons(grid, (_slug, added) => {
        toast.show(added ? 'Añadida a lista de deseos' : 'Eliminada de la lista', added ? 'added' : 'removed');
    });
    cart.initButtons(grid, (_slug, added) => {
        toast.show(added ? 'Añadida al carrito' : 'Eliminada del carrito', added ? 'added' : 'removed');
    });

    Renderer.initScrollAnimations();
}

init();
