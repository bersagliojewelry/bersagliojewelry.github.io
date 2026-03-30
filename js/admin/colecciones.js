/**
 * Bersaglio Admin — Colecciones CRUD (real-time)
 */

import adminDb from './db.js';
import { admToast, admConfirm, initSidebar, esc, requireAuth } from './shared.js';

let _collections = [];

async function init() {
    await requireAuth('editor');
    await adminDb.init();
    initSidebar();
    _collections = adminDb.getAllCollections();
    renderTable();

    // Real-time: re-render when collections or pieces change
    adminDb.on('collections', collections => {
        _collections = collections;
        renderTable();
    });
    adminDb.on('pieces', () => renderTable());

    document.getElementById('btn-new-col').addEventListener('click', () => openModal());
    initModal();
}

// ─── Table ────────────────────────────────────────────────────────────────────

function renderTable() {
    const tbody  = document.getElementById('col-tbody');
    const pieces = adminDb.getAllPieces();

    tbody.innerHTML = _collections.map(c => {
        const pCount = pieces.filter(p => p.collection === c.id).length;
        return `
        <tr>
            <td style="font-weight:500;">${esc(c.name)}</td>
            <td class="adm-td-muted"><code style="font-size:11px;">${esc(c.slug || c.id)}</code></td>
            <td class="adm-td-muted">${esc(c.subtitle || '\u2014')}</td>
            <td style="text-align:center;">${pCount}</td>
            <td>
                <span class="adm-pill ${c.featured ? 'adm-pill--green' : 'adm-pill--gray'}">
                    ${c.featured ? '\u2713 Destacada' : 'No'}
                </span>
            </td>
            <td class="adm-td-muted" style="font-size:12px;max-width:180px;overflow:hidden;text-overflow:ellipsis;">
                ${c.bannerUrl ? `<a href="${esc(c.bannerUrl)}" target="_blank" style="color:var(--adm-accent);">Ver imagen</a>` : '<em>Sin banner</em>'}
            </td>
            <td>
                <div class="adm-table-actions">
                    <button class="adm-btn adm-btn--ghost adm-btn--sm" data-action="edit" data-id="${c.id}">Editar</button>
                    <button class="adm-btn adm-btn--icon adm-btn--danger" data-action="delete" data-id="${c.id}" title="Eliminar">
                        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');

    tbody.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.action === 'edit')   openModal(btn.dataset.id);
            if (btn.dataset.action === 'delete') handleDelete(btn.dataset.id);
        });
    });
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function initModal() {
    document.getElementById('col-modal-close').addEventListener('click', closeModal);
    document.getElementById('col-modal-cancel').addEventListener('click', closeModal);
    document.getElementById('col-modal-save').addEventListener('click', handleSave);

    document.getElementById('cf-name').addEventListener('input', e => {
        const slugEl = document.getElementById('cf-slug');
        if (!slugEl.value || slugEl.dataset.auto !== 'no') {
            slugEl.value = slugify(e.target.value);
        }
    });
    document.getElementById('cf-slug').addEventListener('input', e => {
        e.target.dataset.auto = e.target.value ? 'no' : '';
    });
}

function slugify(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');
}

function openModal(id = null) {
    const modal   = document.getElementById('col-modal');
    const titleEl = document.getElementById('col-modal-title');
    const form    = document.getElementById('col-form');

    form.reset();

    if (id) {
        const col = _collections.find(c => c.id === id);
        if (!col) return;
        titleEl.textContent = 'Editar colecci\u00f3n';
        form.querySelector('[name="id"]').value          = col.id;
        form.querySelector('[name="name"]').value        = col.name || '';
        form.querySelector('[name="slug"]').value        = col.slug || col.id;
        form.querySelector('[name="subtitle"]').value    = col.subtitle || '';
        form.querySelector('[name="description"]').value = col.description || '';
        form.querySelector('[name="pieces"]').value      = col.pieces || '';
        form.querySelector('[name="featured"]').checked  = !!col.featured;
        document.getElementById('cf-slug').dataset.auto = 'no';
    } else {
        titleEl.textContent = 'Nueva colecci\u00f3n';
        document.getElementById('cf-slug').dataset.auto = '';
    }

    modal.hidden = false;
    document.getElementById('cf-name').focus();
}

function closeModal() {
    document.getElementById('col-modal').hidden = true;
}

async function handleSave() {
    const form = document.getElementById('col-form');
    const get  = name => form.querySelector(`[name="${name}"]`)?.value.trim() || '';

    const name = get('name');
    if (!name) { admToast('El nombre es obligatorio', 'danger'); return; }

    const col = {
        id:          get('id') || slugify(name),
        name,
        slug:        get('slug') || slugify(name),
        subtitle:    get('subtitle'),
        description: get('description'),
        pieces:      parseInt(get('pieces')) || 0,
        featured:    form.querySelector('[name="featured"]').checked,
    };

    try {
        await adminDb.saveCollection(col);
        closeModal();
        admToast(`"${col.name}" guardada`);
    } catch (err) {
        admToast('Error al guardar colecci\u00f3n', 'danger');
    }
}

function handleDelete(id) {
    const col = _collections.find(c => c.id === id);
    admConfirm(
        `\u00bfEliminar la colecci\u00f3n "${col?.name}"? Las piezas asociadas no ser\u00e1n eliminadas.`,
        async () => {
            try {
                await adminDb.deleteCollection(id);
                admToast('Colecci\u00f3n eliminada', 'danger');
            } catch (err) {
                admToast('Error al eliminar', 'danger');
            }
        }
    );
}

init();
