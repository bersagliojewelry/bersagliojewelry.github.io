/**
 * Bersaglio Jewelry — Digital Portfolio / Lookbook Component
 * Interactive book-like browsing experience showing ALL pieces by collection.
 * Driven entirely by Firestore data.
 */

import db from '../data/catalog.js';

const collectionLabels = {
    'anillos':          'Anillos',
    'topos-aretes':     'Topos & Aretes',
    'dijes-colgantes':  'Dijes & Colgantes',
    'argollas':         'Argollas'
};

const collectionIcons = {
    'anillos':         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="3" ry="9"/></svg>`,
    'topos-aretes':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8"><polygon points="12,2 22,8.5 12,22 2,8.5"/><line x1="2" y1="8.5" x2="22" y2="8.5"/></svg>`,
    'dijes-colgantes': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8"><path d="M12 2v14M8 12l4 4 4-4"/><circle cx="12" cy="20" r="2"/></svg>`,
    'argollas':        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8"><circle cx="9" cy="12" r="7"/><circle cx="15" cy="12" r="7"/></svg>`
};

/**
 * Build "pages" — each page is a spread: left = collection intro, right = piece grid.
 * We create one spread per collection that has pieces.
 */
function buildPages(collections, allPieces) {
    const pages = [];

    for (const col of collections) {
        const pieces = allPieces.filter(p => p.collection === col.slug);
        if (!pieces.length) continue;

        pages.push({
            slug: col.slug,
            name: col.name || collectionLabels[col.slug] || col.slug,
            subtitle: col.subtitle || '',
            description: col.description || '',
            pieces
        });
    }

    return pages;
}

function renderPieceCard(piece) {
    return `
        <a href="pieza.html?p=${piece.slug}" class="lookbook-piece" aria-label="Ver ${piece.name}">
            <div class="lookbook-piece-img">
                ${piece.image
                    ? `<img src="${piece.image}" alt="${piece.name}" loading="lazy">`
                    : `<div class="lookbook-piece-placeholder">
                        ${collectionIcons[piece.collection] || collectionIcons['anillos']}
                    </div>`}
            </div>
            <div class="lookbook-piece-info">
                <span class="lookbook-piece-name">${piece.name}</span>
                ${piece.priceLabel ? `<span class="lookbook-piece-price">${piece.priceLabel}</span>` : ''}
            </div>
        </a>`;
}

function renderSpread(page, index, total) {
    return `
        <div class="lookbook-spread" data-spread="${index}" data-collection="${page.slug}">
            <!-- Left page: collection intro -->
            <div class="lookbook-page lookbook-page-left">
                <div class="lookbook-page-inner">
                    <span class="lookbook-page-num">${String(index + 1).padStart(2, '0')}</span>
                    <div class="lookbook-collection-icon" aria-hidden="true">
                        ${collectionIcons[page.slug] || ''}
                    </div>
                    <h3 class="lookbook-collection-name">${page.name}</h3>
                    ${page.subtitle ? `<span class="lookbook-collection-sub">${page.subtitle}</span>` : ''}
                    <p class="lookbook-collection-desc">${page.description}</p>
                    <span class="lookbook-collection-count">${page.pieces.length} pieza${page.pieces.length !== 1 ? 's' : ''}</span>
                    <a href="${page.slug}.html" class="lookbook-collection-link">
                        Ver colección completa
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
                    </a>
                </div>
            </div>
            <!-- Right page: piece grid -->
            <div class="lookbook-page lookbook-page-right">
                <div class="lookbook-pieces-grid">
                    ${page.pieces.map(p => renderPieceCard(p)).join('')}
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

    container.innerHTML = `
        <div class="lookbook-book">
            <!-- Navigation tabs -->
            <nav class="lookbook-tabs" aria-label="Colecciones del portafolio">
                ${pages.map((p, i) => `
                    <button class="lookbook-tab ${i === 0 ? 'is-active' : ''}"
                            data-goto="${i}"
                            aria-label="${p.name}">
                        <span class="lookbook-tab-icon">${collectionIcons[p.slug] || ''}</span>
                        <span class="lookbook-tab-label">${p.name}</span>
                    </button>
                `).join('')}
            </nav>

            <!-- Book viewport -->
            <div class="lookbook-viewport">
                <div class="lookbook-spreads">
                    ${pages.map((p, i) => renderSpread(p, i, pages.length)).join('')}
                </div>
            </div>

            <!-- Page controls -->
            <div class="lookbook-controls">
                <button class="lookbook-btn lookbook-prev" aria-label="Página anterior" disabled>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="15,18 9,12 15,6"/></svg>
                </button>
                <span class="lookbook-page-indicator">
                    <span class="lookbook-current">01</span>
                    <span class="lookbook-sep">/</span>
                    <span class="lookbook-total">${String(pages.length).padStart(2, '0')}</span>
                </span>
                <button class="lookbook-btn lookbook-next" aria-label="Página siguiente" ${pages.length <= 1 ? 'disabled' : ''}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="9,6 15,12 9,18"/></svg>
                </button>
            </div>
        </div>`;

    initLookbookInteraction(container, pages.length);
}

function initLookbookInteraction(container, total) {
    let current = 0;

    const spreads   = container.querySelectorAll('.lookbook-spread');
    const tabs      = container.querySelectorAll('.lookbook-tab');
    const prevBtn   = container.querySelector('.lookbook-prev');
    const nextBtn   = container.querySelector('.lookbook-next');
    const indicator = container.querySelector('.lookbook-current');

    function goTo(index) {
        if (index < 0 || index >= total) return;
        current = index;

        spreads.forEach((s, i) => {
            s.classList.toggle('is-active', i === current);
            s.classList.toggle('is-prev', i < current);
            s.classList.toggle('is-next', i > current);
        });

        tabs.forEach((t, i) => t.classList.toggle('is-active', i === current));

        prevBtn.disabled = current === 0;
        nextBtn.disabled = current === total - 1;
        indicator.textContent = String(current + 1).padStart(2, '0');
    }

    // Initialize first spread
    goTo(0);

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const idx = parseInt(tab.dataset.goto, 10);
            goTo(idx);
        });
    });

    // Keyboard navigation
    container.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft')  goTo(current - 1);
        if (e.key === 'ArrowRight') goTo(current + 1);
    });

    // Touch swipe support
    let touchStartX = 0;
    const viewport = container.querySelector('.lookbook-viewport');
    viewport.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    viewport.addEventListener('touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? goTo(current + 1) : goTo(current - 1);
        }
    }, { passive: true });
}
