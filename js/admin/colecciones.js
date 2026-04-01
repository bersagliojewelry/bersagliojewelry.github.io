/**
 * Bersaglio Admin — Colecciones CRUD (real-time)
 * Now includes banner image upload with automatic WebP conversion.
 */

import adminDb from './db.js';
import { admToast, admConfirm, initSidebar, esc, requireAuth } from './shared.js';

let _collections = [];
let _bannerUrl = '';

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
                ${c.bannerUrl ? `<a href="${esc(c.bannerUrl)}" target="_blank" style="color:var(--adm-accent);">Ver banner</a>` : '<em>Sin banner</em>'}
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

    initBannerUpload();
}

function slugify(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');
}

// ─── Banner Upload ───────────────────────────────────────────────────────────

function initBannerUpload() {
    const zone      = document.getElementById('cf-banner-upload-zone');
    const fileInput = document.getElementById('cf-banner-file');
    if (!zone || !fileInput) return;

    zone.addEventListener('click', () => fileInput.click());

    zone.addEventListener('dragover', e => {
        e.preventDefault();
        zone.style.borderColor = 'var(--adm-accent)';
    });
    zone.addEventListener('dragleave', () => {
        zone.style.borderColor = '';
    });
    zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.style.borderColor = '';
        if (e.dataTransfer.files.length) handleBannerFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', e => {
        if (e.target.files.length) handleBannerFile(e.target.files[0]);
    });
}

async function handleBannerFile(file) {
    if (!file.type.startsWith('image/')) {
        admToast('El archivo debe ser una imagen', 'danger');
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        admToast('La imagen supera los 10 MB', 'danger');
        return;
    }

    const form = document.getElementById('col-form');
    const colId = form.querySelector('[name="id"]').value || slugify(form.querySelector('[name="name"]').value || `col${Date.now()}`);

    const progressWrap = document.getElementById('cf-banner-progress');
    const progressBar  = document.getElementById('cf-banner-progress-bar');
    progressWrap.hidden = false;

    try {
        const { uploadCollectionBanner } = await import('../storage-service.js');
        const { optimizeImage }          = await import('../image-optimizer.js');

        admToast(`Optimizando banner\u2026`);
        const optimized = await optimizeImage(file);

        const url = await uploadCollectionBanner(colId, optimized, pct => {
            progressBar.style.width = `${pct}%`;
        });

        _bannerUrl = url;
        document.getElementById('cf-banner-url').value = url;
        renderBannerPreview(url);

        const saved = optimized.size < file.size
            ? `(${Math.round((1 - optimized.size / file.size) * 100)}% m\u00e1s liviana)`
            : '';
        admToast(`Banner subido en WebP ${saved}`);
    } catch (err) {
        admToast('Error al subir banner', 'danger');
    } finally {
        progressWrap.hidden = true;
        progressBar.style.width = '0%';
    }
}

function renderBannerPreview(url) {
    const container = document.getElementById('cf-banner-preview');
    if (!container) return;

    if (!url) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <div style="position:relative;border-radius:var(--adm-radius);overflow:hidden;max-height:160px;">
            <img src="${esc(url)}" alt="Banner preview" style="width:100%;height:160px;object-fit:cover;display:block;">
            <button type="button" id="cf-banner-remove" style="position:absolute;top:6px;right:6px;background:rgba(0,0,0,0.7);color:#fff;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;font-size:14px;line-height:1;">&times;</button>
        </div>
    `;

    document.getElementById('cf-banner-remove').addEventListener('click', async () => {
        try {
            const { deletePieceImage } = await import('../storage-service.js');
            await deletePieceImage(url);
        } catch { /* ignore */ }
        _bannerUrl = '';
        document.getElementById('cf-banner-url').value = '';
        renderBannerPreview(null);
        admToast('Banner eliminado');
    });
}

function getPieceCount(colId) {
    return adminDb.getAllPieces().filter(p => p.collection === colId).length;
}

// ─── Modal Open/Close ────────────────────────────────────────────────────────

function openModal(id = null) {
    const modal   = document.getElementById('col-modal');
    const titleEl = document.getElementById('col-modal-title');
    const form    = document.getElementById('col-form');

    form.reset();
    _bannerUrl = '';

    if (id) {
        const col = _collections.find(c => c.id === id);
        if (!col) return;
        titleEl.textContent = 'Editar colecci\u00f3n';
        form.querySelector('[name="id"]').value          = col.id;
        form.querySelector('[name="name"]').value        = col.name || '';
        form.querySelector('[name="slug"]').value        = col.slug || col.id;
        form.querySelector('[name="subtitle"]').value    = col.subtitle || '';
        form.querySelector('[name="description"]').value = col.description || '';
        form.querySelector('[name="pieces"]').value      = getPieceCount(col.id);
        form.querySelector('[name="featured"]').checked  = !!col.featured;
        document.getElementById('cf-slug').dataset.auto = 'no';

        // Load existing banner
        _bannerUrl = col.bannerUrl || '';
        document.getElementById('cf-banner-url').value = _bannerUrl;
        renderBannerPreview(_bannerUrl);
    } else {
        titleEl.textContent = 'Nueva colecci\u00f3n';
        document.getElementById('cf-slug').dataset.auto = '';
        renderBannerPreview(null);
    }

    modal.hidden = false;
    document.getElementById('cf-name').focus();
}

function closeModal() {
    document.getElementById('col-modal').hidden = true;
    _bannerUrl = '';
    renderBannerPreview(null);
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
        pieces:      getPieceCount(get('id') || slugify(name)),
        featured:    form.querySelector('[name="featured"]').checked,
        bannerUrl:   _bannerUrl || get('bannerUrl') || null,
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
