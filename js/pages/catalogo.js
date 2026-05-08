/**
 * Bersaglio Jewelry — Catálogo page (filtros + grid).
 *
 * Mirror exacto de BERSAGLIO NOVO/project/js/pages.jsx (Catalogo L7-93):
 *   - Header centrado: eyebrow "Catálogo · 2026" + h1 "Todas las piezas" + lead
 *   - Glass-pill row con filtros de categoría (Todo + dynamic desde db.getCollections())
 *   - Glass-pill row derecha con sort dropdown (Destacados / Precio · menor / Precio · mayor)
 *   - Grid auto-fit min 280px, glass-iridescent cards con aspect-ratio 4/5
 *
 * Diferencias con el bundle:
 *   - Datos vienen de Firestore via data.js (no PRODUCTS hard-coded)
 *   - URL state: ?col=<slug>&sort=<key> via history.replaceState
 *   - Re-renderiza filter pills + grid en data.onChange()
 *   - "destacados" sort prioriza piece.featured=true
 *
 * El header pill flotante + el footer ya están montados por boot.js antes de
 * este init().
 */

import { html, escape } from '../core/html.js';
import { format$ } from '../core/format.js';
import { data } from '../core/data.js';

const SORTS = [
    { key: 'destacados', label: 'Destacados' },
    { key: 'menor',      label: 'Precio · menor' },
    { key: 'mayor',      label: 'Precio · mayor' },
    { key: 'nombre',     label: 'Nombre A-Z' },
];

let _state = { cat: 'all', sort: 'destacados' };

function readURLState() {
    const u = new URL(location.href);
    return {
        cat:  u.searchParams.get('col')  || 'all',
        sort: u.searchParams.get('sort') || 'destacados',
    };
}
function writeURLState(state) {
    const u = new URL(location.href);
    if (state.cat === 'all') u.searchParams.delete('col');
    else                      u.searchParams.set('col', state.cat);
    if (state.sort === 'destacados') u.searchParams.delete('sort');
    else                              u.searchParams.set('sort', state.sort);
    history.replaceState({}, '', u.toString());
}

function applyFilters() {
    let list = data.getAll();
    if (_state.cat !== 'all') list = list.filter(p => p.collection === _state.cat);

    if (_state.sort === 'menor')  list = [...list].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    else if (_state.sort === 'mayor') list = [...list].sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    else if (_state.sort === 'nombre') list = [...list].sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    else /* destacados */ list = [...list].sort((a, b) => {
        const af = a.featured ? 1 : 0;
        const bf = b.featured ? 1 : 0;
        if (af !== bf) return bf - af;
        // tie-breaker: most-recent createdAt first
        const at = a.updatedAt?.seconds || a.createdAt?.seconds || 0;
        const bt = b.updatedAt?.seconds || b.createdAt?.seconds || 0;
        return bt - at;
    });

    return list;
}

function renderHeader() {
    const cat = _state.cat;
    const collection = cat !== 'all' ? data.getCollections().find(c => c.slug === cat) : null;
    const titleHtml = collection
        ? html`${escape(collection.name)} <span class="italic emerald-text">en cristal</span>`
        : html`Todas las <span class="italic emerald-text">piezas</span>`;
    const lead = collection?.description
        || 'Explora nuestra colección completa. Cada pieza es única, con certificación de origen y oro de ley 750.';
    return html`
        <div class="cat-page-header">
            <div class="eyebrow cat-page-eyebrow">Catálogo · 2026</div>
            <h1 class="cat-page-title">${titleHtml}</h1>
            <p class="cat-page-lead">${escape(lead)}</p>
        </div>`;
}

function renderFilters() {
    const cats = [{ slug: 'all', name: 'Todo' }, ...data.getCollections()];
    return html`
        <div class="cat-controls">
            <div class="glass cat-pills" role="tablist" aria-label="Filtrar por colección">
                ${cats.map(c => {
                    const active = (_state.cat === c.slug);
                    return html`
                        <button type="button"
                                class="cat-pill ${active ? 'is-active' : ''}"
                                data-action="filter"
                                data-slug="${escape(c.slug)}"
                                role="tab"
                                aria-selected="${active ? 'true' : 'false'}">${escape(c.name)}</button>`;
                })}
            </div>

            <div class="glass cat-sort">
                <span class="cat-sort-label">Orden</span>
                <select class="cat-sort-select" data-action="sort" aria-label="Ordenar resultados">
                    ${SORTS.map(s => html`
                        <option value="${escape(s.key)}" ${_state.sort === s.key ? 'selected' : ''}>${escape(s.label)}</option>`)}
                </select>
            </div>
        </div>`;
}

function renderCard(p) {
    const slug = p.slug || p.id;
    const img = p.images?.[0] || p.image || '';
    const tag = p.tag || (p.featured ? 'Destacada' : null);
    const stones = p.specs?.stones || p.specs?.stone || '';
    const collection = data.getCollections().find(c => c.slug === p.collection);
    const catLabel = collection?.name || p.collection || '';
    const price = Number(p.price || 0);
    return html`
        <a class="glass glass-iridescent cat-card"
           href="/pieza.html?p=${encodeURIComponent(slug)}">
            <div class="cat-card-imgwrap">
                <div class="cat-card-img" style="background:url('${escape(img)}') center/cover"></div>
                <div class="cat-card-vignette" aria-hidden="true"></div>
                ${tag ? html`
                    <div class="cat-card-tag">
                        <div class="chip"><span class="chip-dot"></span>${escape(tag)}</div>
                    </div>` : ''}
            </div>
            <div class="cat-card-body">
                <div class="cat-card-cat">${escape(catLabel)}</div>
                <div class="cat-card-name">${escape(p.name || 'Pieza')}</div>
                <div class="cat-card-meta">${escape(stones)}</div>
                <div class="cat-card-foot">
                    <div class="mono cat-card-price">${price ? escape(format$(price)) : '— Editorial —'}</div>
                    <div class="cat-card-arrow">
                        Ver
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </div>
                </div>
            </div>
        </a>`;
}

function renderEmpty() {
    return html`
        <div class="cat-empty">
            <div class="cat-empty-icon" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                    <circle cx="11" cy="11" r="7"/>
                    <line x1="20" y1="20" x2="16.5" y2="16.5"/>
                </svg>
            </div>
            <p class="cat-empty-title">No hay piezas en esta colección — todavía.</p>
            <p class="cat-empty-sub">Estamos curando el próximo lote. Mientras tanto, explora otras categorías.</p>
            <a href="/colecciones.html" class="btn-aqua btn-aqua-emerald" data-action="reset">Ver todo el catálogo</a>
        </div>`;
}

function renderGrid() {
    const list = applyFilters();
    return html`
        <div class="cat-grid" data-grid>
            ${list.length === 0 ? renderEmpty() : list.map(renderCard)}
        </div>`;
}

function renderAll() {
    return html`
        <div class="container cat-page">
            ${renderHeader()}
            ${renderFilters()}
            ${renderGrid()}
        </div>`;
}

function refreshGrid() {
    const grid = document.querySelector('[data-grid]');
    if (!grid) return;
    const list = applyFilters();
    grid.innerHTML = list.length === 0 ? renderEmpty() : list.map(renderCard).join('');
}

function refreshHeader() {
    const root = document.querySelector('.cat-page');
    if (!root) return;
    // Replace only the header + filters block to avoid scroll jump
    const oldHeader  = root.querySelector('.cat-page-header');
    const oldControls = root.querySelector('.cat-controls');
    if (!oldHeader || !oldControls) return;

    const wrap = document.createElement('div');
    wrap.innerHTML = renderHeader() + renderFilters();
    const newHeader  = wrap.querySelector('.cat-page-header');
    const newControls = wrap.querySelector('.cat-controls');
    oldHeader.replaceWith(newHeader);
    oldControls.replaceWith(newControls);
}

function onMainClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'filter') {
        e.preventDefault();
        const slug = btn.dataset.slug || 'all';
        if (slug === _state.cat) return;
        _state.cat = slug;
        writeURLState(_state);
        refreshHeader();
        refreshGrid();
        return;
    }
    if (action === 'reset') {
        e.preventDefault();
        _state.cat = 'all';
        writeURLState(_state);
        refreshHeader();
        refreshGrid();
    }
}

function onMainChange(e) {
    const sel = e.target.closest('[data-action="sort"]');
    if (!sel) return;
    _state.sort = sel.value;
    writeURLState(_state);
    refreshGrid();
}

export async function init() {
    const main = document.getElementById('main-content');
    if (!main) return;

    _state = readURLState();

    // Kick off Firestore (non-blocking — first paint can show the empty state)
    data.load().catch(() => {});

    // Initial paint
    main.innerHTML = renderAll();

    main.addEventListener('click', onMainClick);
    main.addEventListener('change', onMainChange);

    // Real-time refresh on Firestore updates
    data.onChange(() => {
        refreshHeader();
        refreshGrid();
    });

    // Sync state from popstate (back/forward navigation between filter URLs)
    window.addEventListener('popstate', () => {
        _state = readURLState();
        refreshHeader();
        refreshGrid();
    });
}

export default { init };
