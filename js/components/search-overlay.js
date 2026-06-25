/**
 * Bersaglio Jewelry — Cmd+K command palette.
 *
 * Search overlay glass que sale del top, busca live sobre data.getAll() (piezas)
 * + data.getCollections() + journal entries (cuando exista).
 *
 * Triggers:
 *   - Cmd/Ctrl+K (global)
 *   - "/" key (cuando no hay otro input enfocado)
 *   - document.dispatchEvent(new CustomEvent('bj:search:open'))
 *   - <button data-action="search-open"> en el header (futuro)
 *
 * Match logic:
 *   - Normaliza acento (NFD strip combining)
 *   - Empareja contra: piece.name, piece.collection, piece.specs.stones,
 *     piece.specs.metal, piece.code
 *   - Score: empieza-con > contiene > fuzzy substring
 *   - Top 8 resultados
 *
 * Keyboard nav:
 *   - ↑↓ navegan entre resultados
 *   - Enter abre el resultado seleccionado
 *   - Esc cierra
 */

import { html, escape } from '../core/html.js';
import { format$, debounce } from '../core/format.js';
import { data } from '../core/data.js';
import { pieceUrl } from '../core/urls.js';

let _root = null;
let _open = false;
let _initialized = false;
let _query = '';
let _results = [];
let _activeIdx = 0;

function normalize(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function score(piece, q) {
    const name = normalize(piece.name);
    if (!name) return -1;
    if (name.startsWith(q)) return 100;
    if (name.includes(q)) return 70;
    const collection = normalize(piece.collection);
    if (collection.startsWith(q)) return 50;
    if (collection.includes(q)) return 35;
    const stones = normalize(piece.specs?.stones || piece.specs?.stone || '');
    if (stones.includes(q)) return 30;
    const metal = normalize(piece.specs?.metal || '');
    if (metal.includes(q)) return 20;
    const code = normalize(piece.code);
    if (code === q) return 90;
    if (code.includes(q)) return 40;
    return -1;
}

function search(query) {
    const q = normalize(query.trim());
    if (q.length < 2) return [];
    const all = data.getAll();
    const scored = all
        .map(p => ({ p, s: score(p, q) }))
        .filter(x => x.s >= 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 8)
        .map(x => x.p);
    return scored;
}

function buildDOM() {
    if (_initialized) return;
    _root = document.createElement('div');
    _root.className = 'bj-search-backdrop';
    _root.setAttribute('aria-hidden', 'true');
    _root.innerHTML = html`
        <div class="glass bj-search-panel" role="dialog" aria-modal="true" aria-label="Buscar">
            <div class="bj-search-input-row">
                <svg class="bj-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
                    <circle cx="11" cy="11" r="7"/>
                    <line x1="20" y1="20" x2="16.5" y2="16.5"/>
                </svg>
                <input type="search"
                       id="bj-search-input"
                       class="bj-search-input"
                       placeholder="Buscar piezas, colecciones, esmeraldas…"
                       autocomplete="off"
                       spellcheck="false"
                       aria-label="Buscar"
                       aria-controls="bj-search-results"
                       aria-activedescendant="">
                <kbd class="bj-search-kbd">Esc</kbd>
            </div>
            <div id="bj-search-results" class="bj-search-results" role="listbox"></div>
            <div class="bj-search-hint">
                <span><kbd>↑</kbd><kbd>↓</kbd> navegar</span>
                <span><kbd>↵</kbd> abrir</span>
                <span><kbd>esc</kbd> cerrar</span>
            </div>
        </div>`;

    document.body.appendChild(_root);

    _root.addEventListener('click', e => {
        if (e.target === _root) return closeOverlay();
    });

    const input = _root.querySelector('#bj-search-input');
    input.addEventListener('input', debounce(e => {
        _query = e.target.value;
        _results = search(_query);
        _activeIdx = 0;
        renderResults();
    }, 80));

    input.addEventListener('keydown', onInputKey);

    // Click delegation on results
    _root.querySelector('.bj-search-results').addEventListener('click', e => {
        const item = e.target.closest('[data-href]');
        if (!item) return;
        location.href = item.dataset.href;
        closeOverlay();
    });

    _initialized = true;
}

function renderResults() {
    const list = _root.querySelector('.bj-search-results');
    if (!list) return;
    if (_query.trim().length < 2) {
        list.innerHTML = html`<div class="bj-search-empty">Escribe al menos 2 caracteres para buscar.</div>`;
        return;
    }
    if (_results.length === 0) {
        list.innerHTML = html`<div class="bj-search-empty">Sin resultados para "${escape(_query)}".</div>`;
        return;
    }
    list.innerHTML = _results.map((p, idx) => {
        const slug = p.slug || p.id;
        const img = p.images?.[0] || p.image || '';
        return html`
            <a class="bj-search-result ${idx === _activeIdx ? 'is-active' : ''}"
               id="bj-search-result-${idx}"
               role="option"
               aria-selected="${idx === _activeIdx}"
               href="${pieceUrl(slug)}"
               data-href="${pieceUrl(slug)}">
                <div class="bj-search-result-img" style="background-image:url('${escape(img)}')" aria-hidden="true"></div>
                <div class="bj-search-result-body">
                    <div class="bj-search-result-name">${escape(p.name || 'Pieza')}</div>
                    <div class="bj-search-result-meta">${escape(p.collection || '')} · ${escape(p.specs?.stones || p.specs?.metal || '')}</div>
                </div>
                <div class="mono bj-search-result-price">${escape(format$(p.price))}</div>
            </a>`;
    }).join('');
    _root.querySelector('.bj-search-input')?.setAttribute('aria-activedescendant', `bj-search-result-${_activeIdx}`);
}

function onInputKey(e) {
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (_results.length === 0) return;
        _activeIdx = (_activeIdx + 1) % _results.length;
        renderResults();
        return;
    }
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (_results.length === 0) return;
        _activeIdx = (_activeIdx - 1 + _results.length) % _results.length;
        renderResults();
        return;
    }
    if (e.key === 'Enter') {
        e.preventDefault();
        const target = _results[_activeIdx];
        if (!target) return;
        location.href = pieceUrl(target.slug || target.id);
    }
}

function onGlobalKey(e) {
    // Cmd/Ctrl+K toggles
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        _open ? closeOverlay() : openOverlay();
        return;
    }
    // "/" opens (but only when not typing in another field)
    if (!_open && e.key === '/' && !isTypingInField()) {
        e.preventDefault();
        openOverlay();
        return;
    }
    if (_open && e.key === 'Escape') {
        closeOverlay();
    }
}

function isTypingInField() {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
}

export function openOverlay() {
    if (!_initialized) buildDOM();
    if (_open) return;
    _open = true;
    _root.classList.add('is-open');
    document.body.classList.add('search-overlay-open');
    requestAnimationFrame(() => {
        const input = _root.querySelector('#bj-search-input');
        input?.focus();
        input?.select();
    });
}

export function closeOverlay() {
    if (!_open) return;
    _open = false;
    _root?.classList.remove('is-open');
    document.body.classList.remove('search-overlay-open');
}

export function initSearchOverlay() {
    document.addEventListener('bj:search:open', openOverlay);

    // Click delegation for any [data-action="search-open"] trigger anywhere
    document.addEventListener('click', e => {
        const trigger = e.target.closest('[data-action="search-open"]');
        if (!trigger) return;
        e.preventDefault();
        openOverlay();
    });

    // Lazy install global keydown — actual buildDOM happens on first open.
    document.addEventListener('keydown', onGlobalKey);
}

export default { initSearchOverlay, openOverlay, closeOverlay };
