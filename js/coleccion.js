/**
 * Bersaglio Jewelry — Individual Collection Page
 * URL: anillos.html | topos-aretes.html | dijes-colgantes.html | argollas.html
 * Reads [data-collection] from <html> tag to know which collection to render.
 */

import { loadAllComponents }   from './components.js';
import { initEffects }         from './effects.js';
import { wishlist }            from './wishlist.js';
import { cart }                from './cart.js';
import { toast }               from './toast.js';
import Renderer                from './utils/renderer.js';
import db                      from './data/catalog.js';
import { buildProductListSchema, injectJsonLd } from './utils/schema.js';
import { initSkeletonShimmer } from './skeleton.js';
import { initPrefetch }        from './prefetch.js';

const collectionIcons = {
    'anillos':          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" width="80" height="80" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="3" ry="9"/></svg>`,
    'topos-aretes':     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" width="80" height="80" aria-hidden="true"><polygon points="12,2 22,8.5 12,22 2,8.5"/><line x1="2" y1="8.5" x2="22" y2="8.5"/><polyline points="7,2 12,8.5 17,2"/></svg>`,
    'dijes-colgantes':  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" width="80" height="80" aria-hidden="true"><path d="M12 2v14M8 12l4 4 4-4"/><circle cx="12" cy="20" r="2"/></svg>`,
    'argollas':         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" width="80" height="80" aria-hidden="true"><circle cx="9" cy="12" r="7"/><circle cx="15" cy="12" r="7"/></svg>`,
};

async function init() {
    await loadAllComponents();
    await db.load();

    const slug = document.documentElement.dataset.collection;
    const collection = db.getCollections().find(c => c.slug === slug);

    if (!collection) {
        document.title = 'Colección no encontrada | Bersaglio Jewelry';
        return;
    }

    updatePageMeta(collection);
    renderHero(collection);
    renderPieces(collection, slug);
    initWhatsAppButton(collection);
    Renderer.initScrollAnimations();
    Renderer.initLazyImages();
    initSkeletonShimmer();
    initPrefetch();
    initEffects();

    // Real-time: re-render when admin changes data
    db.startRealtime().catch(() => {});
    db.onChange(() => {
        const col = db.getCollections().find(c => c.slug === slug);
        if (col) {
            renderHero(col);
            renderPieces(col, slug);
            Renderer.initScrollAnimations();
        }
    });
}

function updatePageMeta(col) {
    document.title = `${col.name} | Bersaglio Jewelry`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', col.description);

    // Dynamic canonical
    let canon = document.querySelector('link[rel="canonical"]');
    if (!canon) {
        canon = document.createElement('link');
        canon.rel = 'canonical';
        document.head.appendChild(canon);
    }
    canon.href = `https://bersagliojewelry.co/${col.slug}.html`;

    // BreadcrumbList schema
    injectJsonLd('breadcrumb-schema', {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Inicio',      item: 'https://bersagliojewelry.co/' },
            { '@type': 'ListItem', position: 2, name: 'Colecciones', item: 'https://bersagliojewelry.co/colecciones.html' },
            { '@type': 'ListItem', position: 3, name: col.name,      item: `https://bersagliojewelry.co/${col.slug}.html` },
        ]
    });

    // CollectionPage schema
    injectJsonLd('collection-schema', {
        '@context':    'https://schema.org',
        '@type':       'CollectionPage',
        name:          col.name,
        description:   col.description,
        url:           `https://bersagliojewelry.co/${col.slug}.html`,
        isPartOf:      { '@type': 'WebSite', name: 'Bersaglio Jewelry', url: 'https://bersagliojewelry.co' },
        breadcrumb:    { '@id': '#breadcrumb-schema' },
    });
}

function renderHero(col) {
    const eyebrow = document.getElementById('col-eyebrow');
    const title   = document.getElementById('col-title');
    const sub     = document.getElementById('col-sub');
    const badge   = document.getElementById('col-badge');
    const hero    = document.querySelector('.page-hero');

    if (eyebrow) eyebrow.textContent = col.subtitle || 'Alta Joyería';
    if (title)   title.textContent   = col.name;
    if (sub)     sub.textContent     = col.description;
    if (badge)   badge.textContent   = `${col.pieces} piezas`;

    // Show banner as hero background with full-coverage image
    if (hero && col.bannerUrl) {
        let bannerImg = hero.querySelector('.page-hero-banner');
        if (!bannerImg) {
            bannerImg = document.createElement('img');
            bannerImg.className = 'page-hero-banner';
            bannerImg.setAttribute('aria-hidden', 'true');
            bannerImg.alt = '';
            hero.insertBefore(bannerImg, hero.firstChild);
            hero.classList.add('has-banner');
        }
        bannerImg.src = col.bannerUrl;
    }
}

function renderPieces(col, slug) {
    const grid = document.getElementById('col-pieces-grid');
    if (!grid) return;

    const pieces = db.getByCollection(slug);

    if (!pieces.length) {
        grid.innerHTML = `
            <div class="col-empty animate-on-scroll">
                <div style="color: var(--border); margin-bottom: var(--space-lg);">
                    ${collectionIcons[slug] || collectionIcons['anillos']}
                </div>
                <p style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 300; color: var(--text-muted);">
                    Próximamente en esta colección
                </p>
                <a href="contacto.html" class="btn btn-outline" style="margin-top: var(--space-lg);">
                    Consultar disponibilidad
                </a>
            </div>`;
        return;
    }

    grid.innerHTML = pieces.map(p => {
        const inWishlist = wishlist.has(p.slug);
        const inCart     = cart.has(p.slug);
        const mainSpec   = p.specs?.stone || p.specs?.metal || '';

        return `
            <article class="piece-card animate-on-scroll">
                <a href="pieza.html?p=${p.slug}" class="piece-card-img" aria-label="Ver ${p.name}">
                    <div class="piece-card-visual">
                        ${p.image
                            ? `<img src="${p.image}" alt="${p.name}" class="piece-card-img-real" loading="lazy">`
                            : (collectionIcons[p.collection] || collectionIcons['anillos'])}
                    </div>
                    ${p.badge ? `<span class="piece-badge">${p.badge}</span>` : ''}
                    <div class="piece-card-actions">
                        <button
                            class="piece-action-btn wishlist-action ${inWishlist ? 'is-saved' : ''}"
                            data-wishlist-slug="${p.slug}"
                            aria-label="${inWishlist ? 'Quitar de lista de deseos' : 'Añadir a lista de deseos'}"
                            title="Lista de deseos"
                        >
                            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                        </button>
                        <button
                            class="piece-action-btn cart-action ${inCart ? 'is-in-cart' : ''}"
                            data-cart-slug="${p.slug}"
                            aria-label="${inCart ? 'En carrito' : 'Añadir al carrito'}"
                            title="Añadir al carrito"
                        >
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                                <line x1="3" y1="6" x2="21" y2="6"/>
                                <path d="M16 10a4 4 0 0 1-8 0"/>
                            </svg>
                        </button>
                    </div>
                </a>
                <div class="piece-card-body">
                    ${mainSpec ? `<span class="piece-card-spec">${mainSpec}</span>` : ''}
                    <h2 class="piece-card-name">
                        <a href="pieza.html?p=${p.slug}">${p.name}</a>
                    </h2>
                    <p class="piece-card-desc">${p.description.length > 100 ? p.description.slice(0, 100) + '…' : p.description}</p>
                    <div class="piece-card-footer">
                        <span class="piece-card-price">${p.priceLabel}</span>
                        <a href="pieza.html?p=${p.slug}" class="btn btn-outline btn-sm">Ver pieza</a>
                    </div>
                </div>
            </article>`;
    }).join('');

    // Inject Product structured data (JSON-LD) for Google
    injectJsonLd('collection-products-schema', buildProductListSchema(pieces));

    // Init wishlist + cart
    wishlist.initButtons(grid, (_slug, added) => {
        toast.show(added ? 'Añadida a lista de deseos' : 'Eliminada de la lista', added ? 'added' : 'removed');
    });
    cart.initButtons(grid, (_slug, added) => {
        toast.show(added ? 'Añadida al carrito' : 'Eliminada del carrito', added ? 'added' : 'removed');
    });
}

function initWhatsAppButton(col) {
    const { whatsapp } = db.getContact();
    const phone = whatsapp.replace('+', '');
    const msg   = encodeURIComponent(`Hola Bersaglio Jewelry, me interesa conocer más sobre la colección ${col.name}.`);
    const url   = `https://wa.me/${phone}?text=${msg}`;
    document.querySelectorAll('.wa-float, #wa-nav').forEach(btn => { btn.href = url; });
}

init();
