/**
 * Bersaglio Jewelry — Digital Portfolio / Lookbook V4
 * Realistic page-flip using StPageFlip library.
 * ALL data from Firestore via catalog.js (real-time sync).
 */

import db from '../data/catalog.js';
import { PageFlip } from 'page-flip';

const PIECES_PER_PAGE = 4;

function buildPages(collections, allPieces) {
    const pages = [];

    // Front cover (hard density = doesn't bend)
    pages.push({ type: 'cover' });

    for (const col of collections) {
        const colPieces = allPieces.filter(p => p.collection === col.slug);
        if (!colPieces.length) continue;

        pages.push({
            type: 'col-intro',
            collection: col,
            totalPieces: colPieces.length
        });

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

    // Back cover
    pages.push({ type: 'back' });

    // PageFlip needs even page count — add a branded page if odd
    if (pages.length % 2 !== 0) {
        // Insert a "fin" page before back cover
        pages.splice(pages.length - 1, 0, { type: 'fin' });
    }

    return pages;
}

function renderPage(page, index) {
    // Covers use hard density (rigid like a real cover)
    const density = (page.type === 'cover' || page.type === 'back')
        ? 'data-density="hard"'
        : 'data-density="soft"';

    if (page.type === 'cover') {
        return `
            <div class="pf-page pf-cover" ${density}>
                <div class="pf-page-content pf-cover-content">
                    <div class="pf-cover-border">
                        <div class="pf-cover-inner">
                            <div class="pf-cover-line"></div>
                            <span class="pf-cover-eyebrow">Bersaglio Jewelry</span>
                            <h3 class="pf-cover-title">Portafolio<br>Digital</h3>
                            <span class="pf-cover-year">${new Date().getFullYear()}</span>
                            <div class="pf-cover-line"></div>
                            <p class="pf-cover-tagline">Alta Joyería · Esmeraldas Colombianas</p>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    if (page.type === 'back') {
        return `
            <div class="pf-page pf-back" ${density}>
                <div class="pf-page-content pf-back-content">
                    <div class="pf-cover-border">
                        <div class="pf-cover-inner">
                            <div class="pf-cover-line"></div>
                            <span class="pf-back-brand">Bersaglio Jewelry</span>
                            <p class="pf-back-text">bersagliojewelry.co</p>
                            <a href="contacto.html" class="pf-back-cta">Agendar Asesoría</a>
                            <div class="pf-cover-line"></div>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    if (page.type === 'fin') {
        return `
            <div class="pf-page pf-fin" ${density}>
                <div class="pf-page-content">
                    <div class="pf-page-frame">
                        <div class="pf-fin-body">
                            <div class="pf-cover-line"></div>
                            <p class="pf-fin-text">Gracias por explorar<br>nuestra colección</p>
                            <a href="contacto.html" class="pf-fin-cta">Solicitar asesoría personalizada</a>
                            <div class="pf-cover-line"></div>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    if (page.type === 'col-intro') {
        const col = page.collection;
        return `
            <div class="pf-page pf-intro" ${density}>
                <div class="pf-page-content">
                    <div class="pf-page-frame">
                        <span class="pf-page-num">${String(index).padStart(2, '0')}</span>
                        <div class="pf-intro-body">
                            <div class="pf-intro-ornament">◆</div>
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
            <div class="pf-page pf-gallery" ${density}>
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

let _flipInstance = null;
let _lastSignature = '';
let _pendingObserver = null;

export function renderLookbook() {
    const container = document.querySelector('#lookbook');
    if (!container) return;

    const collections = db.getCollections();
    const allPieces   = db.getAll();

    if (!allPieces.length) {
        container.innerHTML = '';
        _lastSignature = '';
        if (_flipInstance) { try { _flipInstance.destroy(); } catch {} _flipInstance = null; }
        if (_pendingObserver) { _pendingObserver.disconnect(); _pendingObserver = null; }
        return;
    }

    const pages = buildPages(collections, allPieces);
    if (pages.length < 2) {
        container.innerHTML = '';
        _lastSignature = '';
        return;
    }

    // Dedupe: skip the expensive rebuild if neither pieces nor collections
    // produced a structurally different page list. Avoids wasted PageFlip
    // teardown + reinit on every realtime snapshot burst.
    const signature = JSON.stringify(pages.map(p => {
        if (p.type === 'gallery') return [p.type, p.collection?.id, p.pieces.map(x => `${x.id}|${x.image || ''}|${x.name}|${x.priceLabel || ''}`)];
        if (p.type === 'col-intro') return [p.type, p.collection?.id, p.totalPieces];
        return p.type;
    }));
    if (signature === _lastSignature && _flipInstance) return;
    _lastSignature = signature;

    if (_flipInstance) {
        try { _flipInstance.destroy(); } catch {}
        _flipInstance = null;
    }
    if (_pendingObserver) {
        _pendingObserver.disconnect();
        _pendingObserver = null;
    }

    // Build page dots for quick navigation
    const dots = pages.map((_, i) => `<button class="pf-dot ${i === 0 ? 'is-active' : ''}" data-page="${i}" aria-label="Ir a página ${i + 1}"></button>`).join('');

    container.innerHTML = `
        <div class="pf-wrapper is-cover-state">
            <button class="pf-side-btn pf-side-prev" aria-label="Página anterior">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="15,18 9,12 15,6"/></svg>
            </button>

            <div class="pf-book-area">
                <div class="pf-book" id="pf-book">
                    ${pages.map((p, i) => renderPage(p, i)).join('')}
                </div>
            </div>

            <button class="pf-side-btn pf-side-next" aria-label="Página siguiente">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="9,6 15,12 9,18"/></svg>
            </button>
        </div>

        <div class="pf-pagination">
            <div class="pf-dots">${dots}</div>
            <span class="pf-indicator">Página <span class="pf-cur">1</span> de <span class="pf-tot">${pages.length}</span></span>
        </div>
        <p class="pf-hint">Arrastra la esquina de la página para pasar la hoja</p>`;

    // Defer the heavy PageFlip init until the section is near the viewport.
    // Dramatically improves first-paint on mobile because the canvas / event
    // wiring isn't created until the user actually scrolls down.
    const startInit = () => initPageFlip(container, pages.length);
    if ('IntersectionObserver' in window) {
        _pendingObserver = new IntersectionObserver((entries, observer) => {
            if (entries.some(e => e.isIntersecting)) {
                observer.disconnect();
                _pendingObserver = null;
                startInit();
            }
        }, { rootMargin: '300px 0px' });
        _pendingObserver.observe(container);
    } else {
        startInit();
    }
}

function initPageFlip(container, totalPages) {
    const bookEl  = container.querySelector('#pf-book');
    const wrapper = container.querySelector('.pf-wrapper');
    const prevBtn = container.querySelector('.pf-side-prev');
    const nextBtn = container.querySelector('.pf-side-next');
    const curLabel = container.querySelector('.pf-cur');
    const dots     = container.querySelectorAll('.pf-dot');

    // Calculate responsive dimensions — wider book for premium look.
    // Mobile gets a much wider slice of the viewport so the cover is not
    // squeezed into a 150-px-wide vertical strip.
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const isMobile = vw < 768;

    let maxW, maxH;
    if (isMobile) {
        // Reserve ~64-80px total for the side arrow buttons + gaps.
        const reservedX = vw < 380 ? 56 : 80;
        maxW = Math.min(vw - reservedX, 380);
        // Portrait book aspect ratio ~ 1:1.4
        maxH = Math.min(Math.round(maxW * 1.4), Math.round(vh * 0.72));
    } else {
        maxH = Math.min(Math.round(vh * 0.68), 750);
        maxW = Math.min(Math.round(maxH * 0.78), Math.round(vw * 0.42));
    }

    _flipInstance = new PageFlip(bookEl, {
        width:       maxW,
        height:      maxH,
        // 'fixed' uses width/height exactly — avoids the stretch flash on
        // load and gives the book a predictable footprint that the parent
        // flex container can center naturally.
        size:        'fixed',
        minWidth:    isMobile ? 220 : 240,
        maxWidth:    maxW,
        minHeight:   isMobile ? 300 : 320,
        maxHeight:   maxH,
        showCover:   true,
        maxShadowOpacity: 0.5,
        mobileScrollSupport: false, // Disable to prevent scroll hijack on touch
        flippingTime: 600,
        usePortrait: true,
        startZIndex: 0,
        autoSize:    false,
        drawShadow:  true,
        showPageCorners: true,
    });

    _flipInstance.loadFromHTML(bookEl.querySelectorAll('.pf-page'));
    // Mark book as ready so the CSS guard that hides raw .pf-page elements
    // can release them — by now PageFlip has built its canvas.
    bookEl.classList.add('is-ready');
    if (wrapper) wrapper.classList.add('is-ready');

    function updateUI(pageIndex) {
        curLabel.textContent = pageIndex + 1;
        dots.forEach((d, i) => d.classList.toggle('is-active', i === pageIndex));
        // Toggle cover/back state on the wrapper so CSS can visually
        // re-center the book when only one face is visible (avoids the
        // "offset right" / "offset left" gap in portrait mode).
        if (wrapper) {
            wrapper.classList.toggle('is-cover-state', pageIndex === 0);
            wrapper.classList.toggle('is-back-state',  pageIndex === totalPages - 1);
        }
    }

    _flipInstance.on('flip', (e) => updateUI(e.data));
    updateUI(0);

    prevBtn.addEventListener('click', () => _flipInstance.flipPrev());
    nextBtn.addEventListener('click', () => _flipInstance.flipNext());

    // Dot navigation — quick jump to any page
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const target = parseInt(dot.dataset.page, 10);
            _flipInstance.flip(target);
        });
    });

    // Keyboard navigation (only when book is in view)
    document.addEventListener('keydown', (e) => {
        if (!bookEl.closest('.lookbook-section')) return;
        const rect = bookEl.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (!inView) return;
        if (e.key === 'ArrowRight') _flipInstance.flipNext();
        if (e.key === 'ArrowLeft')  _flipInstance.flipPrev();
    });
}
