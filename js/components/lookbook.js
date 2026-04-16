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
        // Desactivado: el hover en las esquinas disparaba changeState y
        // provocaba que el libro cerrado se desplazara a la derecha sin
        // que el usuario hiciera click. Sin preview de esquina el libro
        // queda siempre firme en su posición cuando está cerrado.
        showPageCorners: false,
        // Mouse events (drag) están habilitados. El listener de
        // changeState sincroniza las clases is-cover-state / is-back-state
        // al inicio del flip, así el shift CSS anima en paralelo con la
        // rotación de la página tanto para clicks como para drags.
        useMouseEvents: true,
    });

    _flipInstance.loadFromHTML(bookEl.querySelectorAll('.pf-page'));
    // Mark book as ready so the CSS guard that hides raw .pf-page elements
    // can release them — by now PageFlip has built its canvas.
    bookEl.classList.add('is-ready');
    if (wrapper) wrapper.classList.add('is-ready');

    // PageFlip dibuja un spread doble en landscape: la tapa queda en la
    // mitad derecha del canvas y la contratapa en la izquierda. Para
    // recentrar visualmente cuando solo una cara es visible, exponemos
    // un CSS var con la mitad del ancho de página y dejamos que CSS
    // aplique el translateX correspondiente. En portrait (móvil) el
    // canvas ya muestra una sola página, así que el shift es 0.
    function syncCoverShift() {
        if (!wrapper) return;
        let isLandscape = false;
        try {
            const ori = _flipInstance?.getOrientation?.();
            isLandscape = ori === 'landscape';
        } catch {}
        wrapper.style.setProperty('--pf-cover-shift', isLandscape ? `${Math.round(maxW / 2)}px` : '0px');
    }
    syncCoverShift();
    try {
        _flipInstance.on('changeOrientation', syncCoverShift);
    } catch {}

    // Current page is tracked locally so handlers can predict destination
    // classes and drive flipNext/flipPrev correctly.
    let _currentPage = 0;

    /**
     * Sync the wrapper state classes from a given page index. This is the
     * authoritative reconciliation — called from the `flip` event at the
     * end of every animation, so even drag-initiated flips end up with
     * the right classes.
     */
    function updateUI(pageIndex) {
        _currentPage = pageIndex;
        curLabel.textContent = pageIndex + 1;
        dots.forEach((d, i) => d.classList.toggle('is-active', i === pageIndex));
        if (wrapper) {
            wrapper.classList.toggle('is-cover-state', pageIndex === 0);
            wrapper.classList.toggle('is-back-state',  pageIndex === totalPages - 1);
        }
    }

    /**
     * Apply the predicted cover/back state BEFORE starting a flip. This is
     * what makes the horizontal re-center animate IN PARALLEL with the
     * page rotation: we toggle the class at click time and CSS transitions
     * the transform over `flippingTime` (600ms) with a matching easing.
     *
     * The gap previously reported ("cover detaching from book") was caused
     * by either (a) the class changing AFTER the flip completed — producing
     * a 2-phase rotate-then-slide — or (b) an instant snap at click time
     * producing a visible jump. Animating in parallel is the only way the
     * slide and the rotation look like a single cohesive motion.
     */
    function predictNextState() {
        // Leaving cover? Always.
        if (_currentPage === 0) return { cover: false, back: false };
        // One spread before the back cover → flipNext lands on back.
        // In landscape+showCover spreads are pairs; the right page of
        // the last non-cover spread is totalPages-2, left page is -3.
        if (_currentPage === totalPages - 2 || _currentPage === totalPages - 3) {
            return { cover: false, back: true };
        }
        return { cover: false, back: false };
    }

    function predictPrevState() {
        if (_currentPage === totalPages - 1) return { cover: false, back: false };
        // First spread after cover is pages [1,2]. flipPrev from either
        // lands on cover (page 0).
        if (_currentPage === 1 || _currentPage === 2) {
            return { cover: true, back: false };
        }
        return { cover: false, back: false };
    }

    function applyState(state) {
        if (!wrapper) return;
        wrapper.classList.toggle('is-cover-state', state.cover);
        wrapper.classList.toggle('is-back-state',  state.back);
    }

    function goNext() {
        if (!_flipInstance) return;
        if (_currentPage >= totalPages - 1) return;
        applyState(predictNextState());
        _flipInstance.flipNext();
    }

    function goPrev() {
        if (!_flipInstance) return;
        if (_currentPage <= 0) return;
        applyState(predictPrevState());
        _flipInstance.flipPrev();
    }

    function goTo(target) {
        if (!_flipInstance) return;
        target = Math.max(0, Math.min(totalPages - 1, target));
        if (target === _currentPage) return;
        applyState({
            cover: target === 0,
            back:  target === totalPages - 1,
        });
        _flipInstance.flip(target);
    }

    _flipInstance.on('flip', (e) => updateUI(e.data));

    // changeState fires at the START of a flip — critical for drag
    // interactions which bypass our button handlers. If the user grabs
    // the cover and starts flipping, this peels the is-cover-state class
    // off so the shift starts animating in parallel with the rotation.
    _flipInstance.on('changeState', (e) => {
        const st = e.data;
        if (st !== 'flipping' && st !== 'user_fold') return;
        if (!wrapper) return;
        if (_currentPage === 0 && wrapper.classList.contains('is-cover-state')) {
            wrapper.classList.remove('is-cover-state');
        }
        if (_currentPage === totalPages - 1 && wrapper.classList.contains('is-back-state')) {
            wrapper.classList.remove('is-back-state');
        }
    });

    updateUI(0);

    prevBtn.addEventListener('click', goPrev);
    nextBtn.addEventListener('click', goNext);

    // Dot navigation — quick jump to any page
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            goTo(parseInt(dot.dataset.page, 10));
        });
    });

    // Keyboard navigation (only when book is in view)
    document.addEventListener('keydown', (e) => {
        if (!bookEl.closest('.lookbook-section')) return;
        const rect = bookEl.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (!inView) return;
        if (e.key === 'ArrowRight') goNext();
        if (e.key === 'ArrowLeft')  goPrev();
    });
}
