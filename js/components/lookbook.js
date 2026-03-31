/**
 * Bersaglio Jewelry — Digital Portfolio / Lookbook Component V2
 * Premium page-turning experience with 3D flip animations.
 * ALL data comes from Firestore via catalog.js (real-time sync).
 */

import db from '../data/catalog.js';

/* ── How many pieces per "page" (right side of a spread) ───────── */
const PIECES_PER_PAGE = 4;

/**
 * Build flat list of "pages". Each page is either:
 *   { type: 'cover',   collection }           — left-side intro
 *   { type: 'pieces',  collection, pieces }   — right-side grid (max PIECES_PER_PAGE)
 * Pages alternate: cover → pieces → pieces → cover → pieces …
 * This gives us the "book" feel: turn a page, see pieces; turn again, next collection.
 */
function buildPages(collections, allPieces) {
    const pages = [];

    for (const col of collections) {
        const colPieces = allPieces.filter(p => p.collection === col.slug);
        if (!colPieces.length) continue;

        // Cover page for this collection
        pages.push({
            type: 'cover',
            collection: col,
            totalPieces: colPieces.length
        });

        // Chunk pieces into pages of PIECES_PER_PAGE
        for (let i = 0; i < colPieces.length; i += PIECES_PER_PAGE) {
            pages.push({
                type: 'pieces',
                collection: col,
                pieces: colPieces.slice(i, i + PIECES_PER_PAGE),
                pageInCol: Math.floor(i / PIECES_PER_PAGE) + 1,
                totalColPages: Math.ceil(colPieces.length / PIECES_PER_PAGE)
            });
        }
    }

    return pages;
}

function renderCoverPage(page, pageNum) {
    const col = page.collection;
    return `
        <div class="lb-page lb-cover" data-page="${pageNum}">
            <div class="lb-page-inner">
                <div class="lb-cover-ornament" aria-hidden="true">
                    <svg viewBox="0 0 100 2" preserveAspectRatio="none"><line x1="0" y1="1" x2="100" y2="1" stroke="currentColor" stroke-width="0.5"/></svg>
                </div>
                <span class="lb-page-number">${String(pageNum + 1).padStart(2, '0')}</span>
                <h3 class="lb-cover-title">${col.name || col.slug}</h3>
                ${col.subtitle ? `<span class="lb-cover-subtitle">${col.subtitle}</span>` : ''}
                <p class="lb-cover-desc">${col.description || ''}</p>
                <div class="lb-cover-meta">
                    <span class="lb-cover-count">${page.totalPieces} pieza${page.totalPieces !== 1 ? 's' : ''}</span>
                </div>
                <a href="${col.slug}.html" class="lb-cover-cta">
                    Explorar colección
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
                </a>
                <div class="lb-cover-ornament lb-cover-ornament-bottom" aria-hidden="true">
                    <svg viewBox="0 0 100 2" preserveAspectRatio="none"><line x1="0" y1="1" x2="100" y2="1" stroke="currentColor" stroke-width="0.5"/></svg>
                </div>
            </div>
        </div>`;
}

function renderPiecesPage(page, pageNum) {
    return `
        <div class="lb-page lb-gallery" data-page="${pageNum}">
            <div class="lb-page-inner">
                <div class="lb-gallery-header">
                    <span class="lb-gallery-col-name">${page.collection.name || page.collection.slug}</span>
                    <span class="lb-gallery-pagination">${page.pageInCol} / ${page.totalColPages}</span>
                </div>
                <div class="lb-gallery-grid lb-grid-${page.pieces.length}">
                    ${page.pieces.map(p => `
                        <a href="pieza.html?p=${p.slug}" class="lb-piece">
                            <div class="lb-piece-visual">
                                ${p.image
                                    ? `<img src="${p.image}" alt="${p.name}" loading="lazy">`
                                    : `<div class="lb-piece-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.6"><polygon points="12,2 22,8.5 12,22 2,8.5"/></svg></div>`}
                                <div class="lb-piece-shine" aria-hidden="true"></div>
                            </div>
                            <div class="lb-piece-caption">
                                <span class="lb-piece-name">${p.name}</span>
                                ${p.priceLabel ? `<span class="lb-piece-price">${p.priceLabel}</span>` : ''}
                            </div>
                        </a>
                    `).join('')}
                </div>
            </div>
        </div>`;
}

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
    if (!pages.length) {
        container.innerHTML = '';
        return;
    }

    const totalPages = pages.length;

    container.innerHTML = `
        <div class="lb-book" tabindex="0" role="region" aria-label="Portafolio digital de joyería">

            <!-- Book wrapper with 3D perspective -->
            <div class="lb-scene">
                <div class="lb-pages-track">
                    ${pages.map((p, i) =>
                        p.type === 'cover'
                            ? renderCoverPage(p, i)
                            : renderPiecesPage(p, i)
                    ).join('')}
                </div>
            </div>

            <!-- Controls -->
            <div class="lb-nav">
                <button class="lb-nav-btn lb-prev" aria-label="Página anterior" disabled>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><polyline points="15,18 9,12 15,6"/></svg>
                </button>

                <div class="lb-nav-center">
                    <div class="lb-progress">
                        <div class="lb-progress-fill" style="width: ${100 / totalPages}%"></div>
                    </div>
                    <span class="lb-indicator">
                        <span class="lb-indicator-current">1</span> de <span class="lb-indicator-total">${totalPages}</span>
                    </span>
                </div>

                <button class="lb-nav-btn lb-next" aria-label="Página siguiente" ${totalPages <= 1 ? 'disabled' : ''}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><polyline points="9,6 15,12 9,18"/></svg>
                </button>
            </div>
        </div>`;

    initInteraction(container, totalPages);
}

function initInteraction(container, total) {
    let current   = 0;
    let animating = false;

    const pagesEls   = container.querySelectorAll('.lb-page');
    const prevBtn    = container.querySelector('.lb-prev');
    const nextBtn    = container.querySelector('.lb-next');
    const curLabel   = container.querySelector('.lb-indicator-current');
    const progFill   = container.querySelector('.lb-progress-fill');
    const book       = container.querySelector('.lb-book');

    function goTo(index, direction = 'next') {
        if (index < 0 || index >= total || index === current || animating) return;
        animating = true;

        const leaving  = pagesEls[current];
        const entering = pagesEls[index];

        // Remove all states first
        pagesEls.forEach(p => {
            p.classList.remove('is-active', 'is-leaving-left', 'is-leaving-right',
                               'is-entering-left', 'is-entering-right');
        });

        // Animate leaving page
        leaving.classList.add(direction === 'next' ? 'is-leaving-left' : 'is-leaving-right');

        // Animate entering page
        entering.classList.add(direction === 'next' ? 'is-entering-right' : 'is-entering-left');

        // After animation completes, settle
        setTimeout(() => {
            leaving.classList.remove('is-leaving-left', 'is-leaving-right');
            entering.classList.remove('is-entering-right', 'is-entering-left');
            entering.classList.add('is-active');
            current = index;

            prevBtn.disabled = current === 0;
            nextBtn.disabled = current === total - 1;
            curLabel.textContent = current + 1;
            progFill.style.width = `${((current + 1) / total) * 100}%`;

            animating = false;
        }, 700);
    }

    // Initialize first page
    pagesEls[0].classList.add('is-active');

    prevBtn.addEventListener('click', () => goTo(current - 1, 'prev'));
    nextBtn.addEventListener('click', () => goTo(current + 1, 'next'));

    // Keyboard
    book.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1, 'prev'); }
        if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1, 'next'); }
    });

    // Touch swipe
    let touchX = 0;
    const scene = container.querySelector('.lb-scene');
    scene.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    scene.addEventListener('touchend', (e) => {
        const diff = touchX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? goTo(current + 1, 'next') : goTo(current - 1, 'prev');
        }
    }, { passive: true });
}
