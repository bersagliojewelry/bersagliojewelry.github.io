/**
 * Bersaglio Jewelry — Colecciones Page (Liquid Glass Aqua, Phase 11)
 *
 * Pre-selección de filtro vía URL: ?col=<slug>
 *
 * Layout (matches bersaglio.html design):
 *   1. Hero: "CATÁLOGO · 2026" eyebrow + "Todas las piezas" / "<col name>" title + lead
 *   2. Filter pills container (glass-pill) with "Todo" + dynamic pills from db.getCollections()
 *   3. Sort dropdown (glass-pill) — featured / newest / price asc/desc / name
 *   4. Cards grid via renderPieceCardHTML
 *
 * Real-time: db.onChange() re-renders pills (admin adds collection),
 *            grid (admin adds/edits pieces), and title (active collection name).
 */

import { loadAllComponents } from './components.js';
import { initEffects }       from './effects.js';
import Renderer              from './utils/renderer.js';
import db                    from './data/catalog.js';
import { renderPieceCardHTML, wirePieceCardActions } from './components/piece-card.js';
import { buildProductListSchema, injectJsonLd } from './utils/schema.js';
import { initSkeletonShimmer, processImages } from './skeleton.js';
import { initPrefetch }      from './prefetch.js';

// ─── State ──────────────────────────────────────────────────────────────────
let activeFilter = 'all';        // 'all' | <collection.slug>
let activeSort   = 'featured';   // 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'name'

// ─── Helpers ────────────────────────────────────────────────────────────────
function escapeHtml(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function activeCollection() {
    if (activeFilter === 'all') return null;
    return db.getCollections().find(c => (c.slug || c.id) === activeFilter) || null;
}

function priceOf(p) {
    if (typeof p.price === 'number' && Number.isFinite(p.price)) return p.price;
    return Number.POSITIVE_INFINITY;  // unpriced items go last in price sorts
}

function sortPieces(arr) {
    const list = [...arr];
    switch (activeSort) {
        case 'newest':
            return list.sort((a, b) => {
                const ta = a.updatedAt?.seconds ?? a.createdAt?.seconds ?? 0;
                const tb = b.updatedAt?.seconds ?? b.createdAt?.seconds ?? 0;
                return tb - ta;
            });
        case 'price-asc':
            return list.sort((a, b) => priceOf(a) - priceOf(b));
        case 'price-desc':
            return list.sort((a, b) => priceOf(b) - priceOf(a));
        case 'name':
            return list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es'));
        case 'featured':
        default:
            return list.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (b.featured && !a.featured) return 1;
                return 0;
            });
    }
}

// ─── Init ───────────────────────────────────────────────────────────────────
async function init() {
    await loadAllComponents();
    await db.load();

    // Pre-select via ?col=slug
    const urlParams = new URLSearchParams(window.location.search);
    const colParam  = urlParams.get('col');
    if (colParam && db.getCollections().find(c => (c.slug || c.id) === colParam)) {
        activeFilter = colParam;
    }

    renderTitle();
    renderPills();
    renderPieces();
    initSort();
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
        renderTitle();
        renderPills();
        renderPieces();
    });
}

// ─── Title (dynamic per active filter) ──────────────────────────────────────
function renderTitle() {
    const titleEl = document.getElementById('catalog-title');
    const leadEl  = document.getElementById('catalog-lead');
    if (!titleEl) return;

    const col = activeCollection();
    if (col) {
        const name = col.name || col.slug;
        // Italicize the last word for visual rhythm (matches design)
        const parts = name.split(' ');
        if (parts.length > 1) {
            const last = parts.pop();
            titleEl.innerHTML = `${escapeHtml(parts.join(' '))} <em class="emerald-text">${escapeHtml(last)}</em>`;
        } else {
            titleEl.innerHTML = `<em class="emerald-text">${escapeHtml(name)}</em>`;
        }
        if (leadEl && col.description) leadEl.textContent = col.description;
        else if (leadEl) leadEl.textContent = `Explora la colección ${name}.`;
    } else {
        titleEl.innerHTML = 'Todas las <em class="emerald-text">piezas</em>';
        if (leadEl) leadEl.textContent = 'Explora nuestra colección completa. Cada pieza es única, con certificación de origen y oro de ley 750.';
    }
}

// ─── Pills (dynamic from db.getCollections) ────────────────────────────────
function renderPills() {
    const wrap = document.getElementById('catalog-pills');
    if (!wrap) return;

    const collections = db.getCollections();

    const html = [
        `<button type="button" class="catalog-pill ${activeFilter === 'all' ? 'is-active' : ''}"
                data-filter="all" role="tab" aria-selected="${activeFilter === 'all'}">
            Todo
        </button>`,
        ...collections.map(col => {
            const slug = col.slug || col.id;
            const name = col.name || slug;
            const isActive = activeFilter === slug;
            return `<button type="button" class="catalog-pill ${isActive ? 'is-active' : ''}"
                    data-filter="${escapeHtml(slug)}" role="tab" aria-selected="${isActive}">
                ${escapeHtml(name)}
            </button>`;
        })
    ].join('');

    wrap.innerHTML = html;

    // Click delegation
    wrap.querySelectorAll('.catalog-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            activeFilter = btn.dataset.filter;
            wrap.querySelectorAll('.catalog-pill').forEach(b => {
                const on = b.dataset.filter === activeFilter;
                b.classList.toggle('is-active', on);
                b.setAttribute('aria-selected', on);
            });
            // Update URL without full reload (preserves history)
            const url = new URL(window.location.href);
            if (activeFilter === 'all') url.searchParams.delete('col');
            else url.searchParams.set('col', activeFilter);
            window.history.replaceState({}, '', url);

            renderTitle();
            renderPieces();
        });
    });
}

// ─── Sort dropdown ──────────────────────────────────────────────────────────
function initSort() {
    const select = document.getElementById('catalog-sort-select');
    if (!select) return;
    select.value = activeSort;
    select.addEventListener('change', () => {
        activeSort = select.value;
        renderPieces();
    });
}

// ─── Pieces grid ────────────────────────────────────────────────────────────
function renderPieces() {
    const grid = document.getElementById('featured-grid');
    if (!grid) return;

    const all = activeFilter === 'all'
        ? db.getAll()
        : db.getByCollection(activeFilter);

    const pieces = sortPieces(all);

    if (!pieces.length) {
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

    grid.innerHTML = pieces.map(renderPieceCardHTML).join('');

    injectJsonLd('catalog-products-schema', buildProductListSchema(pieces));
    wirePieceCardActions(grid);

    Renderer.initScrollAnimations();
    processImages();
}

// ─── SEO ────────────────────────────────────────────────────────────────────
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
        description:   'Explora las colecciones de Bersaglio Jewelry. Alta joyería certificada con esmeraldas colombianas, diamantes y oro 18k.',
        url:           `${base}/colecciones.html`,
        isPartOf:      { '@type': 'WebSite', name: 'Bersaglio Jewelry', url: base },
    });
}

function initWhatsAppButton() {
    const { whatsapp } = db.getContact();
    const phone = whatsapp.replace('+', '');
    const msg   = encodeURIComponent('Hola Bersaglio Jewelry, me interesa conocer más sobre sus colecciones.');
    const url   = `https://wa.me/${phone}?text=${msg}`;
    document.querySelectorAll('.wa-float, #wa-nav, #wa-nav-mobile').forEach(btn => { btn.href = url; });
}

init();
