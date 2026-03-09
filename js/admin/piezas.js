/**
 * Bersaglio Admin — Piezas CRUD
 */

import adminDb from './db.js';
import { admToast, admConfirm, initSidebar, esc } from './shared.js';

let _allPieces = [];
let _query     = '';
let _filterCol = '';
let _filterFeatured = '';

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
    await adminDb.init();
    initSidebar();

    _allPieces = adminDb.getAllPieces();

    // Populate collection filter
    populateCollectionFilters();

    // Render
    renderTable();

    // Filters
    document.getElementById('search-input').addEventListener('input', e => {
        _query = e.target.value.toLowerCase();
        renderTable();
    });
    document.getElementById('filter-collection').addEventListener('change', e => {
        _filterCol = e.target.value;
        renderTable();
    });
    document.getElementById('filter-featured').addEventListener('change', e => {
        _filterFeatured = e.target.value;
        renderTable();
    });

    // Buttons
    document.getElementById('btn-new-piece').addEventListener('click', () => openModal());
    document.getElementById('btn-export-csv').addEventListener('click', () => {
        adminDb.exportPiecesCSV();
        admToast('Descargando piezas.csv…');
    });

    // Open modal directly if ?new=1
    if (new URLSearchParams(location.search).get('new') === '1') {
        openModal();
        history.replaceState(null, '', 'admin-piezas.html');
    }

    initModal();
}

// ─── Table ────────────────────────────────────────────────────────────────────

function getFiltered() {
    return _allPieces.filter(p => {
        const matchQ = !_query ||
            p.name.toLowerCase().includes(_query) ||
            (p.collection || '').toLowerCase().includes(_query);
        const matchC = !_filterCol || p.collection === _filterCol;
        const matchF = !_filterFeatured ||
            (_filterFeatured === 'yes' ? p.featured : !p.featured);
        return matchQ && matchC && matchF;
    });
}

function renderTable() {
    const tbody   = document.getElementById('pieces-tbody');
    const emptyEl = document.getElementById('pieces-empty');
    const pieces  = getFiltered();

    emptyEl.hidden = pieces.length > 0;

    if (!pieces.length) { tbody.innerHTML = ''; return; }

    tbody.innerHTML = pieces.map(p => {
        const col = adminDb.getAllCollections().find(c => c.id === p.collection);
        return `
        <tr>
            <td style="font-weight:500;">${esc(p.name)}</td>
            <td class="adm-td-muted">${esc(col?.name || p.collection || '—')}</td>
            <td>${p.badge ? `<span class="adm-pill adm-pill--gold">${esc(p.badge)}</span>` : '<span class="adm-td-muted">—</span>'}</td>
            <td class="adm-td-muted">${esc(p.priceLabel || '—')}</td>
            <td>
                <span class="adm-pill ${p.featured ? 'adm-pill--green' : 'adm-pill--gray'}">
                    ${p.featured ? '✓ Sí' : 'No'}
                </span>
            </td>
            <td>
                <div class="adm-table-actions">
                    <button class="adm-btn adm-btn--ghost adm-btn--sm" data-action="edit" data-id="${p.id}">Editar</button>
                    <button class="adm-btn adm-btn--icon adm-btn--danger" data-action="delete" data-id="${p.id}" title="Eliminar">
                        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');

    // Row action delegation
    tbody.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const { action, id } = btn.dataset;
            if (action === 'edit')   openModal(id);
            if (action === 'delete') handleDelete(id);
        });
    });
}

function populateCollectionFilters() {
    const cols = adminDb.getAllCollections();
    const selectFilter = document.getElementById('filter-collection');
    const selectForm   = document.getElementById('f-collection');

    cols.forEach(c => {
        const opt = `<option value="${c.id}">${esc(c.name)}</option>`;
        if (selectFilter) selectFilter.insertAdjacentHTML('beforeend', opt);
        if (selectForm)   selectForm.insertAdjacentHTML('beforeend', opt);
    });
}

// ─── Modal CRUD ───────────────────────────────────────────────────────────────

function initModal() {
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-save').addEventListener('click', handleSave);

    // Auto-generate slug from name
    document.getElementById('f-name').addEventListener('input', e => {
        const slugField = document.getElementById('f-slug');
        if (!slugField.dataset.manual) {
            slugField.value = AdminDb.slugify(e.target.value);
        }
    });
    document.getElementById('f-slug').addEventListener('input', e => {
        e.target.dataset.manual = e.target.value ? '1' : '';
    });
}

const AdminDb = { slugify: (s) => adminDb.constructor.slugify ? adminDb.constructor.slugify(s) : s };

function openModal(id = null) {
    const modal    = document.getElementById('piece-modal');
    const titleEl  = document.getElementById('modal-title');
    const form     = document.getElementById('piece-form');
    const slugEl   = document.getElementById('f-slug');

    form.reset();
    delete slugEl.dataset.manual;

    if (id) {
        const piece = _allPieces.find(p => p.id === id);
        if (!piece) return;
        titleEl.textContent = 'Editar pieza';
        populateForm(form, piece);
        slugEl.dataset.manual = '1';
    } else {
        titleEl.textContent = 'Nueva pieza';
        form.querySelector('[name="priceLabel"]').value = 'Consultar precio';
    }

    modal.hidden = false;
    form.querySelector('input:not([type=hidden])').focus();
}

function closeModal() {
    document.getElementById('piece-modal').hidden = true;
}

function populateForm(form, piece) {
    form.querySelector('[name="id"]').value          = piece.id || '';
    form.querySelector('[name="name"]').value        = piece.name || '';
    form.querySelector('[name="slug"]').value        = piece.slug || '';
    form.querySelector('[name="collection"]').value  = piece.collection || '';
    form.querySelector('[name="description"]').value = piece.description || '';
    form.querySelector('[name="badge"]').value       = piece.badge || '';
    form.querySelector('[name="featured"]').checked  = !!piece.featured;
    form.querySelector('[name="priceLabel"]').value  = piece.priceLabel || 'Consultar precio';
    form.querySelector('[name="price"]').value       = piece.price ?? '';

    const specs = piece.specs || {};
    form.querySelector('[name="specs.stone"]').value       = specs.stone || '';
    form.querySelector('[name="specs.carat"]').value       = specs.carat || '';
    form.querySelector('[name="specs.metal"]').value       = specs.metal || '';
    form.querySelector('[name="specs.accent"]').value      = specs.accent || '';
    form.querySelector('[name="specs.certificate"]').value = specs.certificate || '';
    form.querySelector('[name="specs.cut"]').value         = specs.cut || '';
    form.querySelector('[name="specs.color"]').value       = specs.color || '';
    form.querySelector('[name="specs.clarity"]').value     = specs.clarity || '';
    form.querySelector('[name="specs.weight"]').value      = specs.weight || '';
}

function handleSave() {
    const form = document.getElementById('piece-form');
    const get  = name => form.querySelector(`[name="${name}"]`)?.value.trim() || '';

    const name = get('name');
    if (!name) { admToast('El nombre es obligatorio', 'danger'); return; }

    // Build specs (only non-empty)
    const specs = {};
    ['stone','carat','metal','accent','certificate','cut','color','clarity','weight'].forEach(k => {
        const v = get(`specs.${k}`);
        if (v) specs[k] = v;
    });

    const piece = {
        id:          get('id') || null,
        name,
        slug:        get('slug') || import.meta.url, // fallback handled in db.js
        collection:  get('collection'),
        description: get('description'),
        badge:       get('badge') || null,
        featured:    form.querySelector('[name="featured"]').checked,
        priceLabel:  get('priceLabel') || 'Consultar precio',
        price:       parseFloat(get('price')) || null,
        specs,
    };

    // Remove null id for new pieces
    if (!piece.id) delete piece.id;

    const saved = adminDb.savePiece(piece);
    _allPieces = adminDb.getAllPieces();
    closeModal();
    renderTable();
    admToast(`"${saved.name}" guardada correctamente`);
}

function handleDelete(id) {
    const piece = _allPieces.find(p => p.id === id);
    admConfirm(
        `¿Eliminar "${piece?.name || 'esta pieza'}"? Esta acción no se puede deshacer.`,
        () => {
            adminDb.deletePiece(id);
            _allPieces = adminDb.getAllPieces();
            renderTable();
            admToast('Pieza eliminada', 'danger');
        }
    );
}

init();
