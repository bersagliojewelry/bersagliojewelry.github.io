/**
 * Bersaglio Jewelry — Digital Portfolio / Lookbook V3
 * Realistic page-flip experience using StPageFlip library.
 * ALL data from Firestore via catalog.js (real-time sync).
 */

import db from '../data/catalog.js';
import { PageFlip } from 'page-flip';

/* ── Max pieces per gallery page ─────────────── */
const PIECES_PER_PAGE = 4;

/**
 * Build an ordered array of page objects:
 *   { type: 'cover' }                — front cover
 *   { type: 'col-intro', collection } — collection intro (left page)
 *   { type: 'gallery', collection, pieces, pageInCol, totalColPages }
 *   { type: 'back' }                 — back cover
 */
function buildPages(collections, allPieces) {
    const pages = [];

    // Front cover
    pages.push({ type: 'cover' });

    for (const col of collections) {
        const colPieces = allPieces.filter(p => p.collection === col.slug);
        if (!colPieces.length) continue;

        // Collection intro page
        pages.push({
            type: 'col-intro',
            collection: col,
            totalPieces: colPieces.length
        });

        // Gallery pages
        const totalColPages = Math.ceil(colPieces.length / PIECES_PER_PAGE);
        for (let i = 0; i < colPieces.length; i += PIECES_PER_PAGE) {
            pages.push({
                type: 'gallery',
                collection: col,
                pieces: colPieces.slice(i, i + PIECES_PER_PAGE),
                pageInCol: Math.floor(i / PIECES_PER_PAGE) + 1,
                totalColPages
            });
        }
    }

    // Ensure even page count (required by PageFlip)
    if (pages.length % 2 !== 0) {
        pages.push({ type: 'blank' });
    }

    // Back cover
    pages.push({ type: 'back' });

    // Ensure even again after back cover
    if (pages.length % 2 !== 0) {
        pages.push({ type: 'blank' });
    }

    return pages;
}

function renderPage(page, index, totalPages) {
    const base = `data-density="soft"`;

    if (page.type === 'cover') {
        return `
            <div class="pf-page pf-cover" ${base}>
                <div class="pf-page-content pf-cover-content">
                    <div class="pf-cover-border">
                        <div class="pf-cover-inner">
                            <div class="pf-cover-line" aria-hidden="true"></div>
                            <span class="pf-cover-eyebrow">Bersaglio Jewelry</span>
                            <h3 class="pf-cover-title">Portafolio<br>Digital</h3>
                            <span class="pf-cover-year">${new Date().getFullYear()}</span>
                            <div class="pf-cover-line" aria-hidden="true"></div>
                            <p class="pf-cover-tagline">Alta Joyería · Esmeraldas Colombianas</p>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    if (page.type === 'back') {
        return `
            <div class="pf-page pf-back" ${base}>
                <div class="pf-page-content pf-back-content">
                    <div class="pf-cover-border">
                        <div class="pf-cover-inner">
                            <div class="pf-cover-line" aria-hidden="true"></div>
                            <span class="pf-back-brand">Bersaglio Jewelry</span>
                            <p class="pf-back-text">bersagliojewelry.co</p>
                            <a href="contacto.html" class="pf-back-cta">Agendar Asesoría</a>
                            <div class="pf-cover-line" aria-hidden="true"></div>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    if (page.type === 'blank') {
        return `
            <div class="pf-page pf-blank" ${base}>
                <div class="pf-page-content"></div>
            </div>`;
    }

    if (page.type === 'col-intro') {
        const col = page.collection;
        return `
            <div class="pf-page pf-intro" ${base}>
                <div class="pf-page-content">
                    <div class="pf-page-frame">
                        <span class="pf-page-num">${String(index).padStart(2, '0')}</span>
                        <div class="pf-intro-body">
                            <div class="pf-intro-ornament" aria-hidden="true">◆</div>
                            <h3 class="pf-intro-title">${col.name || col.slug}</h3>
                            ${col.subtitle ? `<span class="pf-intro-sub">${col.subtitle}</span>` : ''}
                            <p class="pf-intro-desc">${col.description || ''}</p>
                            <span class="pf-intro-count">${page.totalPieces} pieza${page.totalPieces !== 1 ? 's' : ''} en esta colección</span>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    if (page.type === 'gallery') {
        const col = page.collection;
        return `
            <div class="pf-page pf-gallery" ${base}>
                <div class="pf-page-content">
                    <div class="pf-page-frame">
                        <div class="pf-gallery-header">
                            <span class="pf-gallery-colname">${col.name || col.slug}</span>
                            <span class="pf-gallery-pag">${page.pageInCol}/${page.totalColPages}</span>
                        </div>
                        <div class="pf-gallery-grid pf-grid-${page.pieces.length}">
                            ${page.pieces.map(p => `
                                <a href="pieza.html?p=${p.slug}" class="pf-piece">
                                    <div class="pf-piece-img">
                                        ${p.image
                                            ? `<img src="${p.image}" alt="${p.name}" loading="lazy">`
                                            : `<div class="pf-piece-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.6"><polygon points="12,2 22,8.5 12,22 2,8.5"/></svg></div>`}
                                    </div>
                                    <div class="pf-piece-info">
                                        <span class="pf-piece-name">${p.name}</span>
                                        ${p.priceLabel ? `<span class="pf-piece-price">${p.priceLabel}</span>` : ''}
                                    </div>
                                </a>
                            `).join('')}
                        </div>
                        <span class="pf-page-num pf-page-num-bottom">${String(index).padStart(2, '0')}</span>
                    </div>
                </div>
            </div>`;
    }

    return '';
}

/* ── Stored instance so we can destroy on re-render ──── */
let _flipInstance = null;

export function renderLookbook() {
    const container = document.querySelector('#lookbook');
    if (!container) return;

    const collections = db.getCollections();
    const allPieces   = db.getAll();

    if (!allPieces.length) {
        container.innerHTML = '';
        return;
    }

    const pages = buildPages(collections, allPieces);
    if (pages.length < 2) {
        container.innerHTML = '';
        return;
    }

    // Destroy previous instance if re-rendering (real-time update)
    if (_flipInstance) {
        try { _flipInstance.destroy(); } catch {}
        _flipInstance = null;
    }

    container.innerHTML = `
        <div class="pf-wrapper">
            <div class="pf-book" id="pf-book">
                ${pages.map((p, i) => renderPage(p, i, pages.length)).join('')}
            </div>
            <div class="pf-controls">
                <button class="pf-btn pf-prev" aria-label="Página anterior">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="15,18 9,12 15,6"/></svg>
                </button>
                <span class="pf-indicator">
                    Página <span class="pf-cur">1</span> de <span class="pf-tot">${pages.length}</span>
                </span>
                <button class="pf-btn pf-next" aria-label="Página siguiente">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="9,6 15,12 9,18"/></svg>
                </button>
            </div>
            <p class="pf-hint">Arrastra la esquina de la página o usa las flechas para explorar</p>
        </div>`;

    initPageFlip(container, pages.length);
}

function initPageFlip(container, totalPages) {
    const bookEl = container.querySelector('#pf-book');
    const prevBtn = container.querySelector('.pf-prev');
    const nextBtn = container.querySelector('.pf-next');
    const curLabel = container.querySelector('.pf-cur');
    const totLabel = container.querySelector('.pf-tot');

    _flipInstance = new PageFlip(bookEl, {
        width:       550,
        height:      733,
        size:        'stretch',
        minWidth:    280,
        maxWidth:    700,
        minHeight:   373,
        maxHeight:   933,
        showCover:   true,
        maxShadowOpacity: 0.6,
        mobileScrollSupport: false,
        flippingTime: 800,
        usePortrait: true,
        startZIndex: 0,
        autoSize:    true,
        drawShadow:  true,
        showPageCorners: true,
    });

    _flipInstance.loadFromHTML(bookEl.querySelectorAll('.pf-page'));

    totLabel.textContent = _flipInstance.getPageCount();

    _flipInstance.on('flip', (e) => {
        curLabel.textContent = e.data + 1;
    });

    prevBtn.addEventListener('click', () => _flipInstance.flipPrev());
    nextBtn.addEventListener('click', () => _flipInstance.flipNext());

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (!bookEl.closest('.lookbook-section')) return;
        const rect = bookEl.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (!inView) return;
        if (e.key === 'ArrowRight') _flipInstance.flipNext();
        if (e.key === 'ArrowLeft')  _flipInstance.flipPrev();
    });
}
