/**
 * Bersaglio Jewelry — Portfolio V8.1: Immersive Gallery (refined)
 *
 * Full-width grid organized by collection with intelligent layout.
 * - Smart grid: auto-flow dense fills every gap
 * - 8-piece initial limit with "Ver más" expand
 * - Collection tabs with GSAP transitions
 * - Cinematic hover overlays with staggered text reveals
 */

import { gsap } from '../gsap-core.js';
import db from '../data/catalog.js';

let _lastSignature = '';
let _activeCollection = 'all';
const INITIAL_VISIBLE = 8;

/* ── Render a single piece card ─────────────────────────────── */

function renderCard(piece, col, index, isHero) {
    const s = piece.specs || {};
    const specLine = [s.stone, s.metal, s.carat ? `${s.carat} ct` : '']
        .filter(Boolean).join(' · ');

    const heroClass = isHero ? ' ptf-card--hero' : '';
    const hiddenClass = index >= INITIAL_VISIBLE ? ' ptf-card--hidden' : '';

    return `
    <a href="pieza.html?p=${piece.slug}" class="ptf-card${heroClass}${hiddenClass}" data-col="${piece.collection}" data-idx="${index}">
        <div class="ptf-card-visual">
            ${piece.image
                ? `<img src="${piece.image}" alt="${piece.name}" loading="lazy" class="ptf-card-img">`
                : `<div class="ptf-card-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.4">
                        <polygon points="12,2 22,8.5 12,22 2,8.5"/>
                    </svg>
                </div>`}
        </div>
        <div class="ptf-card-overlay">
            <span class="ptf-card-col">${col?.name || piece.collection}</span>
            <h4 class="ptf-card-name">${piece.name}</h4>
            ${specLine ? `<span class="ptf-card-specs">${specLine}</span>` : ''}
            ${piece.priceLabel ? `<span class="ptf-card-price">${piece.priceLabel}</span>` : ''}
            <span class="ptf-card-cta">
                Ver Pieza
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13,6 19,12 13,18"/></svg>
            </span>
        </div>
        ${piece.badge ? `<span class="ptf-card-badge">${piece.badge}</span>` : ''}
    </a>`;
}

/* ── Build the full portfolio HTML ──────────────────────────── */

function buildPortfolioHTML(collections, allPieces) {
    const tabs = [
        `<button class="ptf-tab is-active" data-col="all">Todas</button>`,
        ...collections
            .filter(c => allPieces.some(p => p.collection === c.slug || p.collection === c.id))
            .map(c => `<button class="ptf-tab" data-col="${c.slug || c.id}">${c.name}</button>`)
    ].join('');

    let cardIndex = 0;
    const cards = [];
    for (const col of collections) {
        const pieces = allPieces.filter(p => p.collection === col.slug || p.collection === col.id);
        for (const piece of pieces) {
            const isHero = cardIndex === 0 || cardIndex === 5;
            cards.push(renderCard(piece, col, cardIndex, isHero));
            cardIndex++;
        }
    }

    const count = allPieces.length;
    const hasMore = count > INITIAL_VISIBLE;

    return `
    <div class="ptf-container">
        <div class="ptf-header">
            <div class="ptf-tabs-wrap">
                <div class="ptf-tabs">${tabs}</div>
            </div>
            <span class="ptf-count"><span class="ptf-count-num">${count}</span> pieza${count !== 1 ? 's' : ''}</span>
        </div>
        <div class="ptf-grid">
            ${cards.join('')}
        </div>
        ${hasMore ? `
        <div class="ptf-expand-wrap">
            <button class="ptf-expand-btn" data-total="${count}">
                <span>Ver las ${count} piezas</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="6,9 12,15 18,9"/></svg>
            </button>
        </div>` : ''}
    </div>`;
}

/* ── Expand / collapse ──────────────────────────────────────── */

function toggleExpand(root) {
    const btn = root.querySelector('.ptf-expand-btn');
    if (!btn) return;

    const hidden = root.querySelectorAll('.ptf-card--hidden');
    const isExpanded = btn.classList.contains('is-expanded');

    if (isExpanded) {
        gsap.to(hidden, {
            opacity: 0, y: 20, scale: 0.96,
            duration: 0.3, stagger: 0.02, ease: 'power2.in',
            onComplete() {
                hidden.forEach(c => c.style.display = 'none');
                btn.classList.remove('is-expanded');
                btn.querySelector('span').textContent = `Ver las ${btn.dataset.total} piezas`;
                btn.querySelector('svg').style.transform = '';
                root.querySelector('.ptf-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    } else {
        hidden.forEach(c => c.style.display = '');
        gsap.fromTo(hidden,
            { opacity: 0, y: 30, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out' }
        );
        btn.classList.add('is-expanded');
        btn.querySelector('span').textContent = 'Mostrar menos';
        btn.querySelector('svg').style.transform = 'rotate(180deg)';
    }
}

/* ── Filter by collection with GSAP ─────────────────────────── */

function filterCollection(root, slug) {
    if (slug === _activeCollection) return;
    _activeCollection = slug;

    const tabs = root.querySelectorAll('.ptf-tab');
    tabs.forEach(t => t.classList.toggle('is-active', t.dataset.col === slug));

    const cards = root.querySelectorAll('.ptf-card');
    const countEl = root.querySelector('.ptf-count-num');
    const expandWrap = root.querySelector('.ptf-expand-wrap');
    const expandBtn = root.querySelector('.ptf-expand-btn');

    gsap.to(cards, {
        opacity: 0, y: 20, scale: 0.96,
        duration: 0.25, stagger: 0.015, ease: 'power2.in',
        onComplete() {
            let visible = 0;
            cards.forEach(card => {
                const matchesCol = slug === 'all' || card.dataset.col === slug;
                card.style.display = matchesCol ? '' : 'none';
                card.classList.remove('ptf-card--hidden');
                if (matchesCol) visible++;
            });

            if (countEl) countEl.textContent = visible;

            if (expandWrap) expandWrap.style.display = 'none';
            if (expandBtn) {
                expandBtn.classList.remove('is-expanded');
                expandBtn.querySelector('span').textContent = `Ver las ${visible} piezas`;
                expandBtn.querySelector('svg').style.transform = '';
            }

            if (slug === 'all') {
                let idx = 0;
                cards.forEach(card => {
                    if (card.style.display !== 'none') {
                        if (idx >= INITIAL_VISIBLE) {
                            card.classList.add('ptf-card--hidden');
                            card.style.display = 'none';
                        }
                        idx++;
                    }
                });
                if (expandWrap && visible > INITIAL_VISIBLE) {
                    expandWrap.style.display = '';
                }
            }

            const visibleCards = [...cards].filter(c => c.style.display !== 'none');
            gsap.fromTo(visibleCards,
                { opacity: 0, y: 30, scale: 0.96 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out' }
            );
        }
    });
}

/* ── Initial entrance animation ─────────────────────────────── */

function animateEntrance(root) {
    const cards = [...root.querySelectorAll('.ptf-card')].filter(c => c.style.display !== 'none');
    const tabs = root.querySelectorAll('.ptf-tab');
    const header = root.querySelector('.ptf-header');

    gsap.set(cards, { opacity: 0, y: 40, scale: 0.95 });
    gsap.set(tabs, { opacity: 0, y: -10 });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            observer.disconnect();

            if (header) {
                gsap.fromTo(header,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
                );
            }

            gsap.to(tabs, {
                opacity: 1, y: 0, duration: 0.4, stagger: 0.05,
                ease: 'power2.out', delay: 0.2,
            });

            gsap.to(cards, {
                opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.07,
                ease: 'power3.out', delay: 0.3,
            });
        });
    }, { threshold: 0.05, rootMargin: '100px' });

    observer.observe(root);
}

/* ── Public render entry ────────────────────────────────────── */

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

    const sig = JSON.stringify(allPieces.map(p =>
        `${p.id}|${p.image || ''}|${p.name}|${p.priceLabel || ''}|${p.badge || ''}|${p.collection}`
    ));
    if (sig === _lastSignature) return;
    _lastSignature = sig;

    _activeCollection = 'all';
    root.innerHTML = buildPortfolioHTML(collections, allPieces);

    root.querySelectorAll('.ptf-card--hidden').forEach(c => c.style.display = 'none');

    root.querySelector('.ptf-tabs')?.addEventListener('click', e => {
        const tab = e.target.closest('.ptf-tab');
        if (tab) filterCollection(root, tab.dataset.col);
    });

    root.querySelector('.ptf-expand-btn')?.addEventListener('click', () => toggleExpand(root));

    animateEntrance(root);
}
