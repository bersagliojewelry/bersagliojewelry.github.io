/**
 * Bersaglio Jewelry — Portfolio V9.2: Adaptive Luxury Grid
 *
 * 12-column editorial grid with dynamic span assignment.
 * Guarantees ZERO gaps regardless of piece count.
 * Row patterns cycle: [6,3,3] → [4,4,4] → [3,3,6] for visual rhythm.
 * Progressive "Ver más" — reveals 3 rows per click.
 * Golden shimmer loading · Animated counter · Progress bar.
 * Golden shine sweep on hover, staggered text reveals.
 * GSAP entrance + collection filter transitions.
 */

import { gsap } from '../gsap-core.js';
import db from '../data/catalog.js';

let _lastSignature = '';
let _activeCollection = 'all';
let _collections = [];
let _allPieces = [];

const ROWS_PER_BATCH = 3;
let _currentBatch = 1;
let _rowBoundaries = [];

/* ── Layout algorithm ──────────────────────────────────────── */

function computeRowPlan(count) {
    if (count === 0) return [];
    if (count <= 4) return [count];

    const mod = count % 3;
    const rows = [];
    let rem = count;

    if (mod === 0) {
        while (rem > 0) { rows.push(3); rem -= 3; }
    } else if (mod === 1) {
        while (rem > 4) { rows.push(3); rem -= 3; }
        rows.push(4);
    } else {
        while (rem > 2) { rows.push(3); rem -= 3; }
        rows.push(2);
    }

    return rows;
}

const SPAN_PATTERNS_3 = [[6, 3, 3], [4, 4, 4], [3, 3, 6]];

function assignSpans(rowPlan) {
    const spans = [];
    let p3 = 0;

    for (const size of rowPlan) {
        if (size === 1) spans.push(12);
        else if (size === 2) spans.push(6, 6);
        else if (size === 3) {
            spans.push(...SPAN_PATTERNS_3[p3 % SPAN_PATTERNS_3.length]);
            p3++;
        } else if (size === 4) spans.push(3, 3, 3, 3);
    }

    return spans;
}

function computeLayout(pieces) {
    const count = pieces.length;
    if (count === 0) return { spans: [], rowBoundaries: [] };

    const rowPlan = computeRowPlan(count);
    const spans = assignSpans(rowPlan);

    const rowBoundaries = [];
    let cumulative = 0;
    for (const rowSize of rowPlan) {
        cumulative += rowSize;
        rowBoundaries.push(cumulative);
    }

    return { spans, rowBoundaries };
}

function getVisibleCount() {
    const targetIdx = Math.min(
        _currentBatch * ROWS_PER_BATCH,
        _rowBoundaries.length
    ) - 1;
    if (targetIdx < 0 || !_rowBoundaries.length) return 0;
    return _rowBoundaries[targetIdx];
}

function isFullyExpanded() {
    return _currentBatch * ROWS_PER_BATCH >= _rowBoundaries.length;
}

function sortPieces(pieces) {
    return [...pieces].sort((a, b) => {
        const aS = (a.image ? 10 : 0) + (a.featured ? 1 : 0);
        const bS = (b.image ? 10 : 0) + (b.featured ? 1 : 0);
        return bS - aS;
    });
}

/* ── Render a single card ──────────────────────────────────── */

function renderCard(piece, col, span, index, isHidden) {
    const s = piece.specs || {};
    const specLine = [s.stone, s.metal, s.carat ? `${s.carat} ct` : '']
        .filter(Boolean).join(' · ');

    const lgClass = span >= 6 ? ' ptf-card--lg' : '';
    const hiddenClass = isHidden ? ' ptf-card--hidden' : '';

    return `
    <a href="pieza.html?p=${piece.slug}" class="ptf-card${lgClass}${hiddenClass}"
       data-col="${piece.collection}" data-idx="${index}"
       style="grid-column: span ${span}">
        <div class="ptf-card-visual">
            ${piece.image
            ? `<div class="ptf-card-backdrop" style="background-image:url('${piece.image}')"></div>
               <img src="${piece.image}" alt="${piece.name}" loading="lazy" class="ptf-card-img">`
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="1.5">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="13,6 19,12 13,18"/>
                </svg>
            </span>
        </div>
        ${piece.badge ? `<span class="ptf-card-badge">${piece.badge}</span>` : ''}
    </a>`;
}

/* ── Build grid cards for a set of pieces ──────────────────── */

function buildCards(pieces) {
    const sorted = sortPieces(pieces);
    const { spans, rowBoundaries } = computeLayout(sorted);
    _rowBoundaries = rowBoundaries;

    const visibleCount = getVisibleCount();

    const html = sorted.map((piece, i) => {
        const col = _collections.find(c =>
            c.slug === piece.collection || c.id === piece.collection
        );
        return renderCard(piece, col, spans[i], i, i >= visibleCount);
    }).join('');

    return { html, count: sorted.length, visibleCount };
}

/* ── UI helpers ────────────────────────────────────────────── */

function updateExpandButton(btn, totalCount) {
    if (!btn) return;
    const visibleCount = Math.min(getVisibleCount(), totalCount);
    const remaining = totalCount - visibleCount;

    if (remaining <= 0) {
        btn.classList.add('is-expanded');
        btn.querySelector('span').textContent = 'Mostrar menos';
        btn.querySelector('svg').style.transform = 'rotate(180deg)';
    } else {
        btn.classList.remove('is-expanded');
        btn.querySelector('span').textContent =
            `Ver más piezas · ${remaining} restante${remaining !== 1 ? 's' : ''}`;
        btn.querySelector('svg').style.transform = '';
    }
}

function updateProgress(root) {
    const grid = root.querySelector('.ptf-grid');
    const totalCount = grid ? grid.querySelectorAll('.ptf-card').length : 0;
    const visibleCount = Math.min(getVisibleCount(), totalCount);
    const pct = totalCount > 0 ? (visibleCount / totalCount) * 100 : 100;

    const bar = root.querySelector('.ptf-progress-bar');
    const text = root.querySelector('.ptf-progress-text');

    if (bar) bar.style.width = `${pct}%`;
    if (text) text.textContent = `Mostrando ${visibleCount} de ${totalCount}`;
}

function updateExpandUI(root) {
    const grid = root.querySelector('.ptf-grid');
    const totalCount = grid ? grid.querySelectorAll('.ptf-card').length : 0;
    const visibleCount = Math.min(getVisibleCount(), totalCount);

    const expandWrap = root.querySelector('.ptf-expand-wrap');
    const expandBtn = root.querySelector('.ptf-expand-btn');
    const hasMore = totalCount > visibleCount || _currentBatch > 1;

    if (expandWrap) expandWrap.style.display = hasMore ? '' : 'none';
    if (expandBtn) expandBtn.dataset.total = totalCount;

    updateExpandButton(expandBtn, totalCount);
    updateProgress(root);
}

/* ── Shimmer loading + adaptive fit detection ──────────────── */

/**
 * Tier 1: compare image aspect ratio vs card aspect ratio.
 * If difference > 18%, switch to contain mode (shows full piece,
 * no cropping). Otherwise keep cover (natural fit, no letterbox).
 */
const FIT_TOLERANCE = 0.18;

function applyAdaptiveFit(visual, img) {
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!nw || !nh) return;

    const rect = visual.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const imgRatio = nw / nh;
    const cardRatio = rect.width / rect.height;
    const diff = Math.abs(imgRatio - cardRatio) / cardRatio;

    if (diff > FIT_TOLERANCE) {
        visual.classList.add('ptf-card-visual--contain');
    } else {
        visual.classList.remove('ptf-card-visual--contain');
    }
}

function setupShimmer(container) {
    container.querySelectorAll('.ptf-card-visual').forEach(visual => {
        if (visual.classList.contains('is-loaded')) return;

        const img = visual.querySelector('.ptf-card-img');
        if (!img) {
            visual.classList.add('is-loaded');
            return;
        }

        const finalize = () => {
            applyAdaptiveFit(visual, img);
            visual.classList.add('is-loaded');
        };

        if (img.complete && img.naturalWidth > 0) {
            finalize();
        } else {
            img.addEventListener('load', finalize, { once: true });
            img.addEventListener('error', () =>
                visual.classList.add('is-loaded'), { once: true });
        }
    });
}

/* ── Build the full portfolio HTML ─────────────────────────── */

function buildPortfolioHTML() {
    const tabs = [
        `<button class="ptf-tab is-active" data-col="all">Todas</button>`,
        ..._collections
            .filter(c => _allPieces.some(p =>
                p.collection === c.slug || p.collection === c.id
            ))
            .map(c =>
                `<button class="ptf-tab" data-col="${c.slug || c.id}">${c.name}</button>`
            )
    ].join('');

    const { html: cardsHtml, count, visibleCount } = buildCards(_allPieces);
    const hasMore = count > visibleCount;
    const remaining = count - visibleCount;
    const pct = count > 0 ? Math.round((visibleCount / count) * 100) : 100;

    return `
    <div class="ptf-container">
        <div class="ptf-hero-header">
            <div class="ptf-hero-left">
                <span class="ptf-hero-eyebrow">Explorar</span>
                <h2 class="ptf-hero-title">Nuestras Creaciones</h2>
            </div>
            <div class="ptf-hero-right">
                <div class="ptf-tabs-wrap">
                    <div class="ptf-tabs">${tabs}</div>
                </div>
                <span class="ptf-count">
                    <span class="ptf-count-num">${count}</span> pieza${count !== 1 ? 's' : ''} únicas
                </span>
            </div>
        </div>
        <div class="ptf-hero-divider"></div>
        <div class="ptf-grid">${cardsHtml}</div>
        <div class="ptf-expand-wrap"${hasMore ? '' : ' style="display:none"'}>
            <div class="ptf-progress">
                <div class="ptf-progress-bar" style="width: ${pct}%"></div>
            </div>
            <span class="ptf-progress-text">Mostrando ${visibleCount} de ${count}</span>
            <button class="ptf-expand-btn" data-total="${count}">
                <span>Ver más piezas · ${remaining} restante${remaining !== 1 ? 's' : ''}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="1.5">
                    <polyline points="6,9 12,15 18,9"/>
                </svg>
            </button>
        </div>
    </div>`;
}

/* ── Progressive expand / collapse ─────────────────────────── */

function handleExpand(root) {
    const btn = root.querySelector('.ptf-expand-btn');
    if (!btn) return;

    const grid = root.querySelector('.ptf-grid');
    const allCards = [...grid.querySelectorAll('.ptf-card')];
    const totalCount = allCards.length;

    if (isFullyExpanded()) {
        const oldVisible = getVisibleCount();
        _currentBatch = 1;
        const newVisible = getVisibleCount();
        const toHide = allCards.slice(newVisible, oldVisible);

        gsap.to(toHide, {
            opacity: 0, y: 20, scale: 0.96,
            duration: 0.3, stagger: 0.02, ease: 'power2.in',
            onComplete() {
                toHide.forEach(c => {
                    c.classList.add('ptf-card--hidden');
                    c.style.display = 'none';
                });
                updateExpandUI(root);
                grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    } else {
        const oldVisible = getVisibleCount();
        _currentBatch++;
        const newVisible = getVisibleCount();
        const toShow = allCards.slice(oldVisible, newVisible);

        toShow.forEach(c => {
            c.classList.remove('ptf-card--hidden');
            c.style.display = '';
        });

        gsap.fromTo(toShow,
            { opacity: 0, y: 30, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5,
              stagger: 0.06, ease: 'power3.out' }
        );

        updateExpandUI(root);
        setupShimmer(grid);

        if (toShow.length > 0) {
            setTimeout(() => {
                toShow[0].scrollIntoView({
                    behavior: 'smooth', block: 'nearest'
                });
            }, 150);
        }
    }
}

/* ── Filter by collection ──────────────────────────────────── */

function filterCollection(root, slug) {
    if (slug === _activeCollection) return;
    _activeCollection = slug;
    _currentBatch = 1;

    root.querySelectorAll('.ptf-tab').forEach(t =>
        t.classList.toggle('is-active', t.dataset.col === slug)
    );

    const filtered = slug === 'all'
        ? _allPieces
        : _allPieces.filter(p => p.collection === slug);

    const grid = root.querySelector('.ptf-grid');
    const currentCards = grid.querySelectorAll('.ptf-card');

    gsap.to(currentCards, {
        opacity: 0, y: 20, scale: 0.96,
        duration: 0.25, stagger: 0.015, ease: 'power2.in',
        onComplete() {
            if (filtered.length === 0) {
                grid.innerHTML = `
                    <div class="ptf-empty" style="grid-column: 1 / -1">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             stroke-width="0.4" width="48" height="48">
                            <polygon points="12,2 22,8.5 12,22 2,8.5"/>
                        </svg>
                        <p>No hay piezas en esta colección</p>
                    </div>`;

                const countEl = root.querySelector('.ptf-count-num');
                if (countEl) countEl.textContent = '0';

                const expandWrap = root.querySelector('.ptf-expand-wrap');
                if (expandWrap) expandWrap.style.display = 'none';

                gsap.fromTo(grid.querySelector('.ptf-empty'),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
                );
                return;
            }

            const { html, count } = buildCards(filtered);

            grid.innerHTML = html;
            grid.querySelectorAll('.ptf-card--hidden')
                .forEach(c => c.style.display = 'none');

            const countEl = root.querySelector('.ptf-count-num');
            if (countEl) countEl.textContent = count;

            updateExpandUI(root);
            setupShimmer(grid);

            const newCards = [...grid.querySelectorAll('.ptf-card')]
                .filter(c => c.style.display !== 'none');
            gsap.fromTo(newCards,
                { opacity: 0, y: 30, scale: 0.96 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5,
                  stagger: 0.05, ease: 'power3.out' }
            );
        }
    });
}

/* ── Entrance animation ────────────────────────────────────── */

function animateEntrance(root) {
    const cards = [...root.querySelectorAll('.ptf-card')]
        .filter(c => c.style.display !== 'none');
    const tabs = root.querySelectorAll('.ptf-tab');
    const heroTitle = root.querySelector('.ptf-hero-title');
    const heroEyebrow = root.querySelector('.ptf-hero-eyebrow');
    const heroRight = root.querySelector('.ptf-hero-right');
    const divider = root.querySelector('.ptf-hero-divider');
    const countNum = root.querySelector('.ptf-count-num');
    const progressBar = root.querySelector('.ptf-progress-bar');

    gsap.set(cards, { opacity: 0, y: 40, scale: 0.95 });
    gsap.set(tabs, { opacity: 0, y: -10 });
    if (heroEyebrow) gsap.set(heroEyebrow, { opacity: 0, x: -20 });
    if (heroTitle) gsap.set(heroTitle, { opacity: 0, y: 30 });
    if (heroRight) gsap.set(heroRight, { opacity: 0, y: 15 });
    if (divider) gsap.set(divider, { scaleX: 0, transformOrigin: 'left center' });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            observer.disconnect();

            if (heroEyebrow) {
                gsap.to(heroEyebrow, {
                    opacity: 1, x: 0, duration: 0.5, ease: 'power2.out'
                });
            }

            if (heroTitle) {
                gsap.to(heroTitle, {
                    opacity: 1, y: 0, duration: 0.7,
                    ease: 'power3.out', delay: 0.1,
                });
            }

            if (heroRight) {
                gsap.to(heroRight, {
                    opacity: 1, y: 0, duration: 0.5,
                    ease: 'power2.out', delay: 0.2,
                });
            }

            if (countNum) {
                const target = parseInt(countNum.textContent, 10);
                if (!isNaN(target) && target > 0) {
                    countNum.textContent = '0';
                    gsap.to(countNum, {
                        textContent: target,
                        duration: 1.2,
                        ease: 'power2.out',
                        snap: { textContent: 1 },
                        delay: 0.4,
                    });
                }
            }

            if (divider) {
                gsap.to(divider, {
                    scaleX: 1, duration: 0.8,
                    ease: 'power2.inOut', delay: 0.3,
                });
            }

            gsap.to(tabs, {
                opacity: 1, y: 0, duration: 0.4,
                stagger: 0.05, ease: 'power2.out', delay: 0.35,
            });

            gsap.to(cards, {
                opacity: 1, y: 0, scale: 1, duration: 0.6,
                stagger: 0.07, ease: 'power3.out', delay: 0.5,
            });

            if (progressBar) {
                const targetWidth = progressBar.style.width;
                progressBar.style.width = '0%';
                gsap.to(progressBar, {
                    width: targetWidth,
                    duration: 0.8, ease: 'power2.out', delay: 0.7,
                });
            }
        });
    }, { threshold: 0.05, rootMargin: '100px' });

    observer.observe(root);
}

/* ── Public render entry ───────────────────────────────────── */

export function renderLookbook() {
    const root = document.querySelector('#lookbook');
    if (!root) return;

    _collections = db.getCollections();
    _allPieces = db.getAll();

    if (!_allPieces.length) {
        root.innerHTML = '';
        _lastSignature = '';
        return;
    }

    const sig = JSON.stringify(_allPieces.map(p =>
        `${p.id}|${p.image || ''}|${p.name}|${p.priceLabel || ''}|${p.badge || ''}|${p.collection}`
    ));
    if (sig === _lastSignature) return;
    _lastSignature = sig;

    _activeCollection = 'all';
    _currentBatch = 1;
    root.innerHTML = buildPortfolioHTML();

    root.querySelectorAll('.ptf-card--hidden')
        .forEach(c => c.style.display = 'none');

    setupShimmer(root);

    root.addEventListener('click', e => {
        const tab = e.target.closest('.ptf-tab');
        if (tab) return filterCollection(root, tab.dataset.col);

        const expandBtn = e.target.closest('.ptf-expand-btn');
        if (expandBtn) return handleExpand(root);
    });

    animateEntrance(root);
}
