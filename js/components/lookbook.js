/**
 * Bersaglio Jewelry — Portfolio V8: Immersive Gallery
 *
 * Concept: Full-width masonry-like grid organized by collection.
 * Collection tabs for navigation. Each piece card shows the product
 * large with a cinematic hover overlay revealing info + CTA.
 * GSAP powers staggered reveals and collection transitions.
 *
 * No slider. The grid IS the portfolio — every piece visible,
 * maximum space utilization, luxury hover interactions.
 */

import { gsap } from '../gsap-core.js';
import db from '../data/catalog.js';

let _lastSignature = '';
let _activeCollection = 'all';

/* ── Render a single piece card ─────────────────────────────── */

function renderCard(piece, col, index) {
    const s = piece.specs || {};
    const specLine = [s.stone, s.metal, s.carat ? `${s.carat} ct` : '']
        .filter(Boolean).join(' · ');

    return `
    <a href="pieza.html?p=${piece.slug}" class="ptf-card" data-col="${piece.collection}" data-idx="${index}">
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
            cards.push(renderCard(piece, col, cardIndex++));
        }
    }

    const count = allPieces.length;

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
    </div>`;
}

/* ── Filter by collection with GSAP ─────────────────────────── */

function filterCollection(root, slug) {
    if (slug === _activeCollection) return;
    _activeCollection = slug;

    const tabs = root.querySelectorAll('.ptf-tab');
    tabs.forEach(t => t.classList.toggle('is-active', t.dataset.col === slug));

    const cards = root.querySelectorAll('.ptf-card');
    const countEl = root.querySelector('.ptf-count-num');

    gsap.to(cards, {
        opacity: 0,
        y: 20,
        scale: 0.96,
        duration: 0.25,
        stagger: 0.02,
        ease: 'power2.in',
        onComplete() {
            let visible = 0;
            cards.forEach(card => {
                const show = slug === 'all' || card.dataset.col === slug;
                card.style.display = show ? '' : 'none';
                if (show) visible++;
            });

            if (countEl) countEl.textContent = visible;

            const visibleCards = [...cards].filter(c => c.style.display !== 'none');
            gsap.fromTo(visibleCards,
                { opacity: 0, y: 30, scale: 0.96 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: 0.5,
                    stagger: 0.06,
                    ease: 'power3.out',
                }
            );
        }
    });
}

/* ── Initial entrance animation ─────────────────────────────── */

function animateEntrance(root) {
    const cards = root.querySelectorAll('.ptf-card');
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
                opacity: 1, y: 0,
                duration: 0.4,
                stagger: 0.05,
                ease: 'power2.out',
                delay: 0.2,
            });

            gsap.to(cards, {
                opacity: 1, y: 0, scale: 1,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power3.out',
                delay: 0.3,
            });
        });
    }, { threshold: 0.1, rootMargin: '100px' });

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

    // Tab click handlers
    const tabsWrap = root.querySelector('.ptf-tabs');
    if (tabsWrap) {
        tabsWrap.addEventListener('click', e => {
            const tab = e.target.closest('.ptf-tab');
            if (tab) filterCollection(root, tab.dataset.col);
        });
    }

    animateEntrance(root);
}
