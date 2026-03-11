/**
 * Bersaglio Jewelry — Live Search Overlay
 * Phase 5: real-time piece + collection filtering, keyboard nav, Cmd+K shortcut.
 */

import db from './data/catalog.js';

const MAX_PIECES      = 6;
const MAX_COLLECTIONS = 2;

/* ─── Overlay markup ────────────────────────────────────────── */
function createOverlay() {
    const existing = document.getElementById('search-overlay');
    if (existing) return existing;

    const el = document.createElement('div');
    el.id = 'search-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Buscar piezas');
    el.innerHTML = `
        <div class="search-backdrop"></div>
        <div class="search-panel">
            <div class="search-header">
                <div class="search-input-wrap">
                    <svg class="search-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="17" height="17" aria-hidden="true">
                        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <input
                        type="text"
                        id="search-input"
                        class="search-input"
                        placeholder="Buscar piezas, colecciones, gemas…"
                        autocomplete="off"
                        spellcheck="false"
                        aria-autocomplete="list"
                        aria-controls="search-results"
                    >
                    <button class="search-clear" id="search-clear" aria-label="Limpiar búsqueda" hidden>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" aria-hidden="true">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <button class="search-close" id="search-close" aria-label="Cerrar búsqueda">
                    <kbd>ESC</kbd>
                </button>
            </div>

            <div class="search-results" id="search-results" role="listbox" aria-label="Resultados de búsqueda">
                <p class="search-hint" id="search-hint">
                    Escribe para buscar piezas y colecciones
                </p>
            </div>

            <div class="search-footer">
                <span class="search-shortcut"><kbd>↑</kbd><kbd>↓</kbd> navegar</span>
                <span class="search-shortcut"><kbd>↵</kbd> abrir</span>
                <span class="search-shortcut"><kbd>ESC</kbd> cerrar</span>
            </div>
        </div>
    `;
    document.body.appendChild(el);
    return el;
}

/* ─── Helpers ───────────────────────────────────────────────── */
function esc(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlight(text, query) {
    if (!query || !text) return text || '';
    return text.replace(new RegExp(`(${esc(query)})`, 'gi'), '<mark class="search-mark">$1</mark>');
}

function formatPrice(piece) {
    if (!piece.price) return '';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP', maximumFractionDigits: 0,
    }).format(piece.price);
}

/* ─── Result rendering ──────────────────────────────────────── */
function buildResultItem(item, query) {
    const el = document.createElement('a');
    el.className = 'search-result-item';
    el.setAttribute('role', 'option');

    if (item._type === 'piece') {
        el.href = `pieza.html?p=${item.slug}`;
        const price = formatPrice(item);
        el.innerHTML = `
            <span class="sri-icon sri-icon--piece" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" width="16" height="16">
                    <polygon points="12,2 22,8.5 12,22 2,8.5"/>
                </svg>
            </span>
            <span class="sri-body">
                <span class="sri-name">${highlight(item.name, query)}</span>
                <span class="sri-sub">${highlight(item.collection || '', query)}</span>
            </span>
            ${price ? `<span class="sri-price">${price}</span>` : ''}
        `;
    } else {
        el.href = `colecciones.html`;
        el.innerHTML = `
            <span class="sri-icon sri-icon--collection" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" width="16" height="16">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
            </span>
            <span class="sri-body">
                <span class="sri-name">${highlight(item.name, query)}</span>
                <span class="sri-sub">Colección · ${item.pieces || 0} piezas</span>
            </span>
            <span class="sri-tag">Colección</span>
        `;
    }
    return el;
}

function renderResults(results, query) {
    const container = document.getElementById('search-results');
    const hint      = document.getElementById('search-hint');

    container.querySelectorAll('.search-result-item').forEach(el => el.remove());

    if (!results.length) {
        hint.innerHTML = `Sin resultados para <strong>"${query}"</strong>`;
        hint.hidden = false;
        return;
    }

    hint.hidden = true;
    const frag = document.createDocumentFragment();
    results.forEach(item => frag.appendChild(buildResultItem(item, query)));
    container.appendChild(frag);
}

/* ─── Search logic ──────────────────────────────────────────── */
function runSearch(query) {
    const q = query.trim().toLowerCase();
    const hint = document.getElementById('search-hint');

    if (!q) {
        hint.innerHTML = 'Escribe para buscar piezas y colecciones';
        hint.hidden = false;
        document.querySelectorAll('.search-result-item').forEach(el => el.remove());
        return;
    }

    const pieces = db.getAll()
        .filter(p =>
            p.name?.toLowerCase().includes(q) ||
            p.collection?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            Object.values(p.specs || {}).some(v => String(v).toLowerCase().includes(q))
        )
        .slice(0, MAX_PIECES)
        .map(p => ({ ...p, _type: 'piece' }));

    const collections = db.getCollections()
        .filter(c =>
            c.name?.toLowerCase().includes(q) ||
            c.subtitle?.toLowerCase().includes(q) ||
            c.description?.toLowerCase().includes(q)
        )
        .slice(0, MAX_COLLECTIONS)
        .map(c => ({ ...c, _type: 'collection' }));

    renderResults([...collections, ...pieces], query.trim());
}

/* ─── Keyboard navigation ───────────────────────────────────── */
function navigateResults(dir) {
    const items = [...document.querySelectorAll('.search-result-item')];
    if (!items.length) return;

    const current = items.findIndex(el => el.classList.contains('is-active'));
    const next    = Math.max(0, Math.min(items.length - 1, current + dir));

    items.forEach((el, i) => el.classList.toggle('is-active', i === next));
    items[next]?.scrollIntoView({ block: 'nearest' });
}

/* ─── Public init ───────────────────────────────────────────── */
export function initSearch() {
    const overlay  = createOverlay();
    const input    = document.getElementById('search-input');
    const clearBtn = document.getElementById('search-clear');
    const closeBtn = document.getElementById('search-close');
    const backdrop = overlay.querySelector('.search-backdrop');

    // Pre-load catalog so first search is instant
    db.load().catch(() => {});

    function open() {
        overlay.classList.add('search-overlay--open');
        document.body.classList.add('search-open');
        requestAnimationFrame(() => { input.focus(); input.select(); });
    }

    function close() {
        overlay.classList.remove('search-overlay--open');
        document.body.classList.remove('search-open');
        input.value   = '';
        clearBtn.hidden = true;
        const hint = document.getElementById('search-hint');
        hint.innerHTML = 'Escribe para buscar piezas y colecciones';
        hint.hidden = false;
        document.querySelectorAll('.search-result-item').forEach(el => el.remove());
    }

    // Input
    input.addEventListener('input', e => {
        clearBtn.hidden = !e.target.value;
        runSearch(e.target.value);
    });

    // Keyboard
    input.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown')  { e.preventDefault(); navigateResults(1); }
        if (e.key === 'ArrowUp')    { e.preventDefault(); navigateResults(-1); }
        if (e.key === 'Enter') {
            const active = document.querySelector('.search-result-item.is-active');
            if (active) { close(); window.location.href = active.href; }
        }
        if (e.key === 'Escape')     close();
    });

    clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.hidden = true;
        runSearch('');
        input.focus();
    });

    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);

    // Global keyboard shortcuts
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && overlay.classList.contains('search-overlay--open')) {
            close();
        }
        // Cmd+K / Ctrl+K
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            overlay.classList.contains('search-overlay--open') ? close() : open();
        }
    });

    // Delegate to any search trigger
    document.addEventListener('click', e => {
        if (e.target.closest('#search-trigger, .search-trigger')) open();
    });

    // Navigate into result on click (close overlay first)
    document.addEventListener('click', e => {
        const item = e.target.closest('.search-result-item');
        if (item) close();
    });

    return { open, close };
}
