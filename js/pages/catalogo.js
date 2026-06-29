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

import { html, escape, mount } from '../core/html.js';
import { pieceUrl } from '../core/urls.js';
import { priceDisplay } from '../core/format.js';
import { data } from '../core/data.js';
import { lqipBgStyle } from '../core/lqip.js';   // §110.4: blur-up de la pieza (degrada si no hay LQIP)
import { injectCatalogSchema } from '../core/schema.js';
import { balancedCols } from '../core/grid-balance.js';   // reparto inteligente de columnas (sin huérfanas)
import { esVendida } from '../core/stock.js';             // TODO-56: ocultar piezas únicas vendidas de la grilla
import { renderBuscadorCodigo } from '../core/buscador-codigo.js';   // TODO-58: buscador por código
import { filtrarCatalogo, agregarReciente } from '../core/codigo-util.js';   // TODO-60: filtro inteligente + recientes

const SORTS = [
    { key: 'destacados', label: 'Destacados' },
    { key: 'menor',      label: 'Precio · menor' },
    { key: 'mayor',      label: 'Precio · mayor' },
    { key: 'nombre',     label: 'Nombre A-Z' },
];

let _state = { cat: 'all', sort: 'destacados', q: '' };   // q = búsqueda por código/nombre (TODO-60)

function readURLState() {
    const u = new URL(location.href);
    return {
        cat:  u.searchParams.get('col')  || 'all',
        sort: u.searchParams.get('sort') || 'destacados',
        q:    u.searchParams.get('q')    || '',
    };
}
function writeURLState(state) {
    const u = new URL(location.href);
    if (state.cat === 'all') u.searchParams.delete('col');
    else                      u.searchParams.set('col', state.cat);
    if (state.sort === 'destacados') u.searchParams.delete('sort');
    else                              u.searchParams.set('sort', state.sort);
    if (!state.q) u.searchParams.delete('q');
    else           u.searchParams.set('q', state.q);
    history.replaceState({}, '', u.toString());
}

function applyFilters() {
    // TODO-56: la pieza única vendida (finito agotada) sale de la grilla pública (Daniel: "bajar de la
    // web, NO borrar de inventario"). Su ficha sigue viva por enlace directo (SEO/historia) con sello
    // "Vendida". Las refabricables/encargo (pedibles) se quedan.
    let list = data.getAll().filter(p => !esVendida(p));
    if (_state.cat !== 'all') list = list.filter(p => p.collection === _state.cat);
    if (_state.q) list = filtrarCatalogo(list, _state.q);   // TODO-60: búsqueda inteligente código/nombre

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
    const tag = p.tag || p.badge || null;   // §149 (Daniel): sin "Destacada" redundante; el badge por pieza ya se ve
    const stones = p.specs?.stones || p.specs?.stone || '';
    const collection = data.collectionOf(p);
    const catLabel = collection?.name || p.collection || '';
    return html`
        <a class="glass glass-iridescent cat-card"
           href="${pieceUrl(slug)}"
           data-piece-slug="${escape(slug)}" data-piece-name="${escape(p.name || 'Pieza')}"
           data-list-id="catalogo" data-list-name="Catálogo">
            <div class="cat-card-imgwrap">
                <div class="cat-card-img" style="${lqipBgStyle(img, '')};background-size:cover;background-position:center"></div>
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
                    <div class="mono cat-card-price">${escape(priceDisplay(p))}</div>
                    <div class="cat-card-arrow">
                        Ver
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </div>
                </div>
            </div>
        </a>`;
}

function renderEmpty() {
    // Estado-cero CONSCIENTE de la búsqueda (TODO-60): si hay query, el mensaje habla del término
    // buscado + CTA a la asesora; si no, es el "colección vacía" de siempre.
    const buscando = !!_state.q;
    const title = buscando
        ? html`No encontramos piezas para «${escape(_state.q)}».`
        : html`No hay piezas en esta colección — todavía.`;
    const sub = buscando
        ? 'Revisa el código o el nombre, o escríbele a tu asesora.'
        : 'Estamos curando el próximo lote. Mientras tanto, explora otras categorías.';
    const cta = buscando
        ? html`<a href="https://wa.me/573013752592" target="_blank" rel="noopener" class="btn-aqua btn-aqua-emerald">Escribir por WhatsApp</a>`
        : html`<a href="/colecciones.html" class="btn-aqua btn-aqua-emerald" data-action="reset">Ver todo el catálogo</a>`;
    return html`
        <div class="cat-empty">
            <div class="cat-empty-icon" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                    <circle cx="11" cy="11" r="7"/>
                    <line x1="20" y1="20" x2="16.5" y2="16.5"/>
                </svg>
            </div>
            <p class="cat-empty-title">${title}</p>
            <p class="cat-empty-sub">${escape(sub)}</p>
            ${cta}
        </div>`;
}

function renderGrid() {
    const list = applyFilters();
    const cols = balancedCols(list.length, 4);   // reparto según cantidad (sin huérfana)
    return html`
        <div class="cat-grid" data-grid style="--n:${cols}">
            ${list.length === 0 ? renderEmpty() : list.map(renderCard)}
        </div>`;
}

function renderAll() {
    return html`
        <div class="container cat-page">
            ${renderHeader()}
            ${renderBuscadorCodigo('catalogo')}
            ${renderFilters()}
            ${renderGrid()}
        </div>`;
}

function updateSchemaMetadata() {
    try {
        const collection = _state.cat !== 'all' ? data.getCollections().find(c => c.slug === _state.cat) : null;
        const filteredList = applyFilters();
        injectCatalogSchema(collection, filteredList);
    } catch (err) {
        console.warn('[catalogo] Schema injection failed:', err);
    }
}

function refreshGrid() {
    const grid = document.querySelector('[data-grid]');
    if (!grid) return;
    const list = applyFilters();
    grid.style.setProperty('--n', balancedCols(list.length, 4));   // re-reparto al filtrar
    grid.innerHTML = list.length === 0 ? renderEmpty() : list.map(renderCard).join('');
    updateSchemaMetadata();
    refreshSearchExtra();   // TODO-60: conteo en vivo / recientes
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
    const chip = e.target.closest('[data-reciente]');   // TODO-60: chip de búsqueda reciente → re-aplica
    if (chip) { e.preventDefault(); applySearch(chip.dataset.reciente); return; }
    const card = e.target.closest('.cat-card');           // recordar la búsqueda antes de navegar a la pieza
    if (card && _state.q.trim()) guardarReciente(_state.q.trim());
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

// ─── TODO-60: búsqueda inteligente (código O nombre) con filtro en TIEMPO REAL ──────────
// El buscador del catálogo NO navega: filtra la grilla EN VIVO mientras se teclea (debounce 160ms,
// re-pinta solo la grilla → el input conserva foco/cursor). Enter: si queda UNA pieza, va directo a ella.
let _searchTimer = null;
function onSearchInput(e) {
    const input = e.target.closest('.bc-input');
    if (!input) return;
    const val = input.value;
    if (_searchTimer) clearTimeout(_searchTimer);
    _searchTimer = setTimeout(() => {
        _searchTimer = null;
        if (val === _state.q) return;
        _state.q = val;
        writeURLState(_state);
        refreshGrid();
    }, 160);
}
function onSearchSubmit(e) {
    const form = e.target.closest('[data-buscador-codigo]');
    if (!form) return;
    e.preventDefault();
    if (_searchTimer) { clearTimeout(_searchTimer); _searchTimer = null; }
    const input = form.querySelector('.bc-input');
    if (input) { _state.q = input.value; writeURLState(_state); refreshGrid(); }
    if (_state.q.trim()) guardarReciente(_state.q.trim());   // recordar la búsqueda (idea Altorra)
    const list = applyFilters();              // ya filtrado por q (+ colección)
    if (list.length === 1) location.assign(pieceUrl(list[0]));   // 1 resultado → directo a la pieza
}

// ─── TODO-60: conteo en vivo + búsquedas recientes (ideas portadas de Altorra Cars) ─────────
const RECIENTES_KEY = 'bj_busquedas';
function getRecientes() {
    try {
        const v = JSON.parse(localStorage.getItem(RECIENTES_KEY));
        return Array.isArray(v) ? v.filter(x => typeof x === 'string') : [];
    } catch { return []; }
}
function guardarReciente(term) {
    try { localStorage.setItem(RECIENTES_KEY, JSON.stringify(agregarReciente(getRecientes(), term))); }
    catch { /* localStorage off → sin recientes, sin romper la búsqueda */ }
}
function applySearch(term) {
    _state.q = term || '';
    const input = document.querySelector('.bc-input');
    if (input) input.value = _state.q;
    writeURLState(_state);
    refreshGrid();
}
// Pinta, bajo el buscador: el CONTEO de resultados (q activo) o las BÚSQUEDAS RECIENTES (q vacío).
function refreshSearchExtra() {
    const main = document.getElementById('main-content');
    if (!main) return;
    const msg = main.querySelector('[data-bc-msg]');
    const rec = main.querySelector('[data-bc-recientes]');
    if (_state.q.trim()) {
        if (rec) { rec.hidden = true; rec.replaceChildren(); }
        if (msg) {
            const n = applyFilters().length;
            if (n === 0) { msg.hidden = true; msg.textContent = ''; }   // el estado-cero de la grilla ya lo dice
            else { msg.hidden = false; msg.textContent = n === 1 ? '1 pieza encontrada' : `${n} piezas encontradas`; }
        }
    } else {
        if (msg) { msg.hidden = true; msg.textContent = ''; }
        renderRecientes(rec);
    }
}
function renderRecientes(rec) {
    if (!rec) return;
    const items = getRecientes();
    rec.replaceChildren();   // nodos DOM (sin innerHTML) → los términos del usuario nunca se interpretan como HTML
    if (!items.length) { rec.hidden = true; return; }
    rec.hidden = false;
    const label = document.createElement('span');
    label.className = 'bc-rec-label';
    label.textContent = 'Recientes:';
    rec.append(label);
    for (const t of items) {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'bc-chip';
        chip.dataset.reciente = t;
        chip.textContent = t;
        rec.append(chip);
    }
}

// ─── Carga fluida (Daniel reportó el flash 2026-06-22) ──────────────────────────────
// No pintar el catálogo con datos vacíos (título genérico "Todas las piezas" + filtros solo
// "Todo" + "No hay piezas" FALSO) antes de que Firestore responda. Esperamos readiness REAL de
// piezas Y colecciones (no el timeout de 4s); mientras, estado de carga reservado SIN texto
// equivocado. Watchdog 8s evita carga eterna (tras él se pinta el estado real, vacío si no hay).
const catalogReady = () => data.isReady('cats') && data.isReady('featured');
let _watchdog = null;
let _gaveUp = false;
function armWatchdog() {
    if (_watchdog !== null || _gaveUp) return;
    try {
        _watchdog = setTimeout(() => {
            _watchdog = null;
            if (!catalogReady()) { _gaveUp = true; renderCatalog(); }
        }, 8000);
    } catch { /* sin timers → sin watchdog */ }
}

// Estado CARGANDO: eyebrow real (ancla de marca) + título y grilla reservados — sin título
// genérico ni "no hay piezas" falso. Se reemplaza por el render real al llegar los datos.
function renderLoading() {
    return html`
        <div class="container cat-page">
            <div class="cat-page-header">
                <div class="eyebrow cat-page-eyebrow">Catálogo · 2026</div>
                <h1 class="cat-page-title" aria-busy="true" style="min-height:1.1em">&nbsp;</h1>
            </div>
            <div class="cat-grid" aria-busy="true" aria-hidden="true" style="min-height:60vh"></div>
        </div>`;
}

// Decide el render: real cuando hay datos (o tras el watchdog); si no, cargando.
function renderCatalog() {
    const main = document.getElementById('main-content');
    if (!main) return;
    if (catalogReady() || _gaveUp) {
        mount(main, renderAll());
        const bc = main.querySelector('.bc-input');   // restaura el query tras re-render (deep-link ?q=)
        if (bc && _state.q) bc.value = _state.q;
        refreshSearchExtra();   // TODO-60: pinta recientes (q vacío) o conteo (q activo) tras el render
        updateSchemaMetadata();
        if (_watchdog !== null) { clearTimeout(_watchdog); _watchdog = null; }
    } else {
        mount(main, renderLoading());
    }
}

export async function init() {
    const main = document.getElementById('main-content');
    if (!main) return;

    _state = readURLState();

    // Kick off Firestore (non-blocking). El render espera datos reales (no pinta el estado vacío).
    data.load().catch(() => {});
    armWatchdog();

    renderCatalog();   // cargando o real según readiness

    main.addEventListener('click', onMainClick);
    main.addEventListener('change', onMainChange);
    main.addEventListener('input', onSearchInput);     // TODO-60: filtro en vivo por código/nombre
    main.addEventListener('submit', onSearchSubmit);   // Enter → si hay 1 resultado, va a la pieza

    // Datos en vivo: re-render (maneja la transición cargando→listo y updates posteriores).
    data.onChange(renderCatalog);

    // Back/forward entre URLs de filtro.
    window.addEventListener('popstate', () => {
        _state = readURLState();
        renderCatalog();
    });
}

export default { init };
