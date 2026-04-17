/**
 * Bersaglio Jewelry — Digital Portfolio V5
 * Pure CSS slider — no external libraries.
 * Data from Firestore via catalog.js (real-time sync).
 */

import db from '../data/catalog.js';

const PIECES_PER_PAGE = 4;

/* ── Data → Pages ────────────────────────────────────────────── */

function buildPages(collections, allPieces) {
    const pages = [];
    pages.push({ type: 'cover' });

    for (const col of collections) {
        const pieces = allPieces.filter(p => p.collection === col.slug);
        if (!pieces.length) continue;

        pages.push({ type: 'intro', collection: col, total: pieces.length });

        const totalColPages = Math.ceil(pieces.length / PIECES_PER_PAGE);
        for (let i = 0; i < pieces.length; i += PIECES_PER_PAGE) {
            pages.push({
                type: 'gallery',
                collection: col,
                pieces: pieces.slice(i, i + PIECES_PER_PAGE),
                pageNum: Math.floor(i / PIECES_PER_PAGE) + 1,
                totalColPages,
            });
        }
    }

    pages.push({ type: 'back' });
    return pages;
}

/* ── Render individual slide ─────────────────────────────────── */

function renderSlide(page, idx) {
    const cls = `lb-slide lb-slide--${page.type}`;

    if (page.type === 'cover') {
        return `<div class="${cls}" data-idx="${idx}">
            <div class="lb-slide__inner">
                <div class="lb-accent"></div>
                <span class="lb-eyebrow">Bersaglio Jewelry</span>
                <h3 class="lb-cover-title">Portafolio<br>Digital</h3>
                <span class="lb-year">${new Date().getFullYear()}</span>
                <div class="lb-accent"></div>
                <p class="lb-tagline">Alta Joyería · Esmeraldas Colombianas</p>
            </div>
        </div>`;
    }

    if (page.type === 'back') {
        return `<div class="${cls}" data-idx="${idx}">
            <div class="lb-slide__inner">
                <div class="lb-accent"></div>
                <span class="lb-back-brand">Bersaglio Jewelry</span>
                <p class="lb-back-url">bersagliojewelry.co</p>
                <a href="contacto.html" class="lb-back-cta">Agendar Asesoría</a>
                <div class="lb-accent"></div>
            </div>
        </div>`;
    }

    if (page.type === 'intro') {
        const c = page.collection;
        return `<div class="${cls}" data-idx="${idx}">
            <div class="lb-intro__inner">
                <div class="lb-intro-ornament">◆</div>
                <h3 class="lb-intro-title">${c.name || c.slug}</h3>
                ${c.subtitle ? `<span class="lb-intro-sub">${c.subtitle}</span>` : ''}
                <p class="lb-intro-desc">${c.description || ''}</p>
                <span class="lb-intro-count">${page.total} pieza${page.total !== 1 ? 's' : ''} en esta colección</span>
            </div>
        </div>`;
    }

    if (page.type === 'gallery') {
        const c = page.collection;
        return `<div class="${cls}" data-idx="${idx}">
            <div class="lb-gallery__inner">
                <div class="lb-gallery-header">
                    <span class="lb-gallery-col">${c.name || c.slug}</span>
                    <span class="lb-gallery-pag">${page.pageNum}/${page.totalColPages}</span>
                </div>
                <div class="lb-gallery-grid lb-grid-${page.pieces.length}">
                    ${page.pieces.map(p => `
                        <a href="pieza.html?p=${p.slug}" class="lb-piece">
                            <div class="lb-piece-img">
                                ${p.image
                                    ? `<img src="${p.image}" alt="${p.name}" loading="lazy">`
                                    : `<div class="lb-piece-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.6"><polygon points="12,2 22,8.5 12,22 2,8.5"/></svg></div>`}
                            </div>
                            <div class="lb-piece-info">
                                <span class="lb-piece-name">${p.name}</span>
                                ${p.priceLabel ? `<span class="lb-piece-price">${p.priceLabel}</span>` : ''}
                            </div>
                        </a>
                    `).join('')}
                </div>
            </div>
        </div>`;
    }

    return '';
}

/* ── State ───────────────────────────────────────────────────── */

let _current = 0;
let _total = 0;
let _track = null;
let _lastSignature = '';

/* ── Public render entry ─────────────────────────────────────── */

export function renderLookbook() {
    const root = document.querySelector('#lookbook');
    if (!root) return;

    const collections = db.getCollections();
    const allPieces = db.getAll();

    if (!allPieces.length) {
        root.innerHTML = '';
        _lastSignature = '';
        return;
    }

    const pages = buildPages(collections, allPieces);
    if (pages.length < 2) { root.innerHTML = ''; return; }

    const sig = JSON.stringify(pages.map(p => {
        if (p.type === 'gallery') return [p.type, p.collection?.id, p.pieces.map(x => `${x.id}|${x.image || ''}|${x.name}|${x.priceLabel || ''}`)];
        if (p.type === 'intro') return [p.type, p.collection?.id, p.total];
        return p.type;
    }));
    if (sig === _lastSignature) return;
    _lastSignature = sig;

    _total = pages.length;
    _current = 0;

    const dots = pages.map((_, i) =>
        `<button class="lb-dot${i === 0 ? ' is-active' : ''}" data-i="${i}" aria-label="Página ${i + 1}"></button>`
    ).join('');

    root.innerHTML = `
        <div class="lb-viewport">
            <div class="lb-track">
                ${pages.map((p, i) => renderSlide(p, i)).join('')}
            </div>
            <button class="lb-arrow lb-arrow--prev" aria-label="Anterior">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="15,18 9,12 15,6"/></svg>
            </button>
            <button class="lb-arrow lb-arrow--next" aria-label="Siguiente">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="9,6 15,12 9,18"/></svg>
            </button>
        </div>
        <div class="lb-controls">
            <div class="lb-dots">${dots}</div>
            <span class="lb-counter"><span class="lb-cur">1</span> / <span class="lb-tot">${_total}</span></span>
        </div>`;

    _track = root.querySelector('.lb-track');

    initSlider(root);
}

/* ── Slider logic ────────────────────────────────────────────── */

function initSlider(root) {
    const track = root.querySelector('.lb-track');
    const prevBtn = root.querySelector('.lb-arrow--prev');
    const nextBtn = root.querySelector('.lb-arrow--next');
    const curEl = root.querySelector('.lb-cur');
    const dotsWrap = root.querySelector('.lb-dots');
    const dots = root.querySelectorAll('.lb-dot');

    function goTo(n) {
        n = Math.max(0, Math.min(_total - 1, n));
        if (n === _current && track.style.transform) return;
        _current = n;
        track.style.transform = `translateX(-${n * 100}%)`;
        curEl.textContent = n + 1;
        dots.forEach((d, i) => d.classList.toggle('is-active', i === n));
        prevBtn.style.opacity = n === 0 ? '0.25' : '';
        prevBtn.style.pointerEvents = n === 0 ? 'none' : '';
        nextBtn.style.opacity = n === _total - 1 ? '0.25' : '';
        nextBtn.style.pointerEvents = n === _total - 1 ? 'none' : '';
    }

    goTo(0);

    prevBtn.addEventListener('click', () => goTo(_current - 1));
    nextBtn.addEventListener('click', () => goTo(_current + 1));

    dotsWrap.addEventListener('click', (e) => {
        const dot = e.target.closest('.lb-dot');
        if (dot) goTo(parseInt(dot.dataset.i, 10));
    });

    document.addEventListener('keydown', (e) => {
        const rect = root.getBoundingClientRect();
        if (rect.top > window.innerHeight || rect.bottom < 0) return;
        if (e.key === 'ArrowRight') { goTo(_current + 1); e.preventDefault(); }
        if (e.key === 'ArrowLeft') { goTo(_current - 1); e.preventDefault(); }
    });

    /* ── Touch / swipe ───────────────────────────────────────── */
    let tx0 = 0, ty0 = 0, swiping = false;

    track.addEventListener('touchstart', (e) => {
        tx0 = e.touches[0].clientX;
        ty0 = e.touches[0].clientY;
        swiping = false;
        track.style.transition = 'none';
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
        const dx = e.touches[0].clientX - tx0;
        const dy = e.touches[0].clientY - ty0;
        if (!swiping && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) swiping = true;
        if (swiping) {
            const base = -_current * 100;
            const pct = (dx / root.querySelector('.lb-viewport').offsetWidth) * 100;
            track.style.transform = `translateX(${base + pct}%)`;
        }
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        track.style.transition = '';
        if (!swiping) return;
        const dx = e.changedTouches[0].clientX - tx0;
        if (dx < -40) goTo(_current + 1);
        else if (dx > 40) goTo(_current - 1);
        else goTo(_current);
    });
}
