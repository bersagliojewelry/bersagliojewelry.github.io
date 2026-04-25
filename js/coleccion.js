/**
 * Bersaglio Jewelry — Individual Collection Page
 * URL: anillos.html | topos-aretes.html | dijes-colgantes.html | argollas.html
 * Reads [data-collection] from <html> tag to know which collection to render.
 */

import { loadAllComponents }   from './components.js';
import { initEffects }         from './effects.js';
import Renderer                from './utils/renderer.js';
import db                      from './data/catalog.js';
import { renderPieceCardHTML, wirePieceCardActions } from './components/piece-card.js';
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
            <div class="col-empty">
                <div style="color: var(--bj-emerald-300); margin-bottom: 28px; display: flex; justify-content: center;">
                    ${collectionIcons[slug] || collectionIcons['anillos']}
                </div>
                <p style="font-family: var(--font-display-aqua); font-size: 1.4rem; font-weight: 300; color: var(--bj-ink-soft); text-align: center;">
                    Próximamente en esta colección
                </p>
                <div style="text-align:center; margin-top: 24px;">
                    <a href="contacto.html" class="btn-aqua btn-aqua-emerald">Consultar disponibilidad</a>
                </div>
            </div>`;
        return;
    }

    grid.innerHTML = pieces.map(renderPieceCardHTML).join('');

    injectJsonLd('collection-products-schema', buildProductListSchema(pieces));
    wirePieceCardActions(grid);
}

function initWhatsAppButton(col) {
    const { whatsapp } = db.getContact();
    const phone = whatsapp.replace('+', '');
    const msg   = encodeURIComponent(`Hola Bersaglio Jewelry, me interesa conocer más sobre la colección ${col.name}.`);
    const url   = `https://wa.me/${phone}?text=${msg}`;
    document.querySelectorAll('.wa-float, #wa-nav').forEach(btn => { btn.href = url; });
}

init();
