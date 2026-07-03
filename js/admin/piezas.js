/**
 * Bersaglio Admin — Piezas CRUD (real-time)
 */

import adminDb from './db.js';
import { admToast, admConfirm, initSidebar, esc, requireAuth, hasRole, errorMessage } from './shared.js';
import { pmark, psummary } from '../core/perf-probe.js';   // sonda TODO-33 (gateada; no-op si off)
import { initCalculadora } from './calculadora.js';        // B1 paso 2: calculadora de precio por peso
import invService from '../inventario-service.js';         // TODO-40 v3: stock CF-only (ajustar / cambiar tipo)
import { allGems } from '../core/gem-taxonomy.js';         // §151: lista canónica de gemas (select + filtros)

let _allPieces = [];
let _query     = '';
let _filterCol = '';
let _filterFeatured = '';
// _version of the piece currently loaded in the modal. Null for new pieces.
// Used as the optimistic-lock baseline on save.
let _editingVersion = null;
// stockType the modal loaded with (TODO-40 v3). handleSave compares against the select to detect
// a type change in EDIT mode → routes it to the CF cambiarTipoPieza (the form never mutates cantidad/estado).
let _editingStockType = null;

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
    pmark('page:init-start');
    await requireAuth('catalogo');   // catálogo (Kary, TODO-19) + editor+ gestionan piezas
    pmark('page:auth-done');
    await adminDb.init();
    pmark('page:adminDb-done');
    initSidebar();
    pmark('page:sidebar-done');

    _allPieces = adminDb.getAllPieces();

    populateCollectionFilters();
    renderTable();
    pmark('page:first-data-render'); psummary('piezas');

    // Real-time: re-render when pieces change
    adminDb.on('pieces', pieces => {
        _allPieces = pieces;
        renderTable();
    });

    // Real-time: update collection filters when collections change
    adminDb.on('collections', () => {
        populateCollectionFilters();
    });

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
        admToast('Descargando piezas.csv\u2026');
    });
    initCalculadora();   // B1 paso 2: calculadora de precio por peso (modal en la topbar)

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
            (p.name || '').toLowerCase().includes(_query) ||
            (p.code || '').toLowerCase().includes(_query) ||
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

    const collections = adminDb.getAllCollections();

    tbody.innerHTML = pieces.map(p => {
        const col = collections.find(c => c.id === p.collection);
        return `
        <tr>
            <td><code style="font-size:11px;background:rgba(201,169,110,0.1);padding:2px 6px;border-radius:3px;color:var(--adm-accent);">${esc(p.code || '\u2014')}</code></td>
            <td style="font-weight:500;">${esc(p.name)}</td>
            <td class="adm-td-muted">${esc(col?.name || p.collection || '\u2014')}</td>
            <td>${p.badge ? `<span class="adm-pill adm-pill--gold">${esc(p.badge)}</span>` : '<span class="adm-td-muted">\u2014</span>'}</td>
            <td>
                <span class="adm-pill ${p.featured ? 'adm-pill--green' : 'adm-pill--gray'}">
                    ${p.featured ? '\u2713 S\u00ed' : 'No'}
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

    // Preserve current selection
    const currentFilter = selectFilter?.value || '';
    const currentForm   = selectForm?.value || '';

    if (selectFilter) {
        const firstOpt = selectFilter.querySelector('option[value=""]');
        selectFilter.innerHTML = '';
        if (firstOpt) selectFilter.appendChild(firstOpt);
        else selectFilter.innerHTML = '<option value="">Todas</option>';
    }
    if (selectForm) {
        const firstOpt = selectForm.querySelector('option[value=""]');
        selectForm.innerHTML = '';
        if (firstOpt) selectForm.appendChild(firstOpt);
        else selectForm.innerHTML = '<option value="">Sin colecci\u00f3n</option>';
    }

    cols.forEach(c => {
        const opt = `<option value="${esc(c.slug || c.id)}">${esc(c.name)}</option>`;
        if (selectFilter) selectFilter.insertAdjacentHTML('beforeend', opt);
        if (selectForm)   selectForm.insertAdjacentHTML('beforeend', opt);
    });

    if (selectFilter) selectFilter.value = currentFilter;
    if (selectForm)   selectForm.value = currentForm;
}

// ─── Modal CRUD ───────────────────────────────────────────────────────────────

let _uploadedImages = [];
let _uploadedLqips  = [];   // §108 F3: LQIP (data-URI blur) paralelo a _uploadedImages

// §151: puebla el <select> "Gema principal" + los checkboxes "Otras gemas (filtros)" desde la
// taxonomía canónica (allGems = semilla + extras de Kary). Kary elige de la lista → cero typos.
// DOM seguro (new Option/createElement/textContent), no innerHTML.
function populateGemControls() {
    const sel = document.getElementById('f-badge-gem');
    const box = document.getElementById('f-gem-filters');
    if (!sel || !box) return;
    const gems = allGems();
    sel.replaceChildren();
    sel.add(new Option('— Elige la gema —', ''));
    for (const g of gems) sel.add(new Option(g.label, g.slug));
    sel.add(new Option('Sin piedra (solo oro)', 'oro'));
    box.replaceChildren();
    for (const g of gems) {
        const label = document.createElement('label');
        label.style.cssText = 'display:inline-flex;align-items:center;gap:5px;font-size:13px;color:var(--adm-fg);cursor:pointer;';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'f-gem-filter';
        cb.value = g.slug;
        label.append(cb, ' ' + g.label);
        box.appendChild(label);
    }
}

function initModal() {
    populateGemControls();
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-save').addEventListener('click', handleSave);

    document.getElementById('f-name').addEventListener('input', e => {
        const slugField = document.getElementById('f-slug');
        if (!slugField.dataset.manual) {
            slugField.value = AdminDb.slugify(e.target.value);
        }
    });
    document.getElementById('f-slug').addEventListener('input', e => {
        e.target.dataset.manual = e.target.value ? '1' : '';
    });

    // TODO-40 v3: el tipo de stock condiciona la casilla Cantidad y el control de "mover stock".
    document.getElementById('f-stocktype').addEventListener('change', syncStockFields);
    // Ajuste de stock (reabasto/merma/…) → CF ajustarStock (la cantidad es CF-only).
    document.getElementById('btn-ajustar-stock')?.addEventListener('click', handleAjusteStock);

    initImageUpload();
}

// Refleja el tipo de stock (enum 3) en la casilla Cantidad y muestra/oculta el control de mover stock.
// Reglas (modelo v3): `encargo` no tiene unidades; `cantidad` es STOCK TRANSACCIONAL (CF-only) → en
// EDICIÓN se muestra de solo lectura y se mueve con la CF; en CREACIÓN es la cantidad INICIAL editable.
// Se llama al abrir el modal y al cambiar el select.
function syncStockFields() {
    const stockTypeEl = document.getElementById('f-stocktype');
    const cantidadEl  = document.getElementById('f-cantidad');
    const hintEl      = document.getElementById('f-cantidad-hint');
    const adjustEl    = document.getElementById('stock-adjust');
    const idEl        = document.querySelector('#piece-form [name="id"]');
    if (!stockTypeEl || !cantidadEl) return;

    const isEdit    = !!(idEl && idEl.value);
    const esEncargo = stockTypeEl.value === 'encargo';

    if (esEncargo) {
        cantidadEl.disabled = true;
        cantidadEl.value = '';
        if (hintEl) hintEl.textContent = 'Por encargo: no hay unidades en inventario (se fabrica al pedir).';
    } else if (isEdit) {
        // finito*: en edición la cantidad es CF-only → solo lectura; se cambia con "Mover el stock".
        cantidadEl.disabled = true;
        if (hintEl) hintEl.textContent = 'La cantidad se cambia con "Mover el stock" (abajo), no a mano.';
    } else {
        // finito* al crear: cantidad inicial editable.
        cantidadEl.disabled = false;
        if (!cantidadEl.value) cantidadEl.value = '1';
        if (hintEl) hintEl.textContent = 'Cantidad inicial de la pieza (luego se ajusta desde aquí).';
    }

    // El control de mover stock solo aplica a una pieza física YA guardada (necesita su id para la CF).
    if (adjustEl) adjustEl.hidden = !(isEdit && !esEncargo);
}

// Mueve el stock de una pieza física por la CF (delta firmado + motivo, auditado en el ledger). La
// cantidad NUNCA la edita el cliente a mano (las reglas la bloquean): esta es la vía legítima.
async function handleAjusteStock() {
    const form    = document.getElementById('piece-form');
    const pieceId = form.querySelector('[name="id"]')?.value;
    if (!pieceId) return;   // solo piezas ya guardadas

    const deltaEl  = document.getElementById('f-ajuste-delta');
    const motivoEl = document.getElementById('f-ajuste-motivo');
    const btn      = document.getElementById('btn-ajustar-stock');
    const delta    = parseInt(deltaEl?.value, 10);
    if (!Number.isInteger(delta) || delta === 0) {
        admToast('Indica cuántas unidades sumar (+) o restar (−).', 'danger');
        deltaEl?.focus();
        return;
    }

    btn.disabled = true;
    try {
        const res = await invService.ajustarStock({ pieceId, delta, motivo: motivoEl.value });
        const cantidadEl = document.getElementById('f-cantidad');
        if (cantidadEl) cantidadEl.value = res.cantidad;   // refleja la nueva cantidad (solo lectura)
        if (deltaEl) deltaEl.value = '';
        admToast(`Stock actualizado: ${res.cantidad} unidad${res.cantidad === 1 ? '' : 'es'}.`);
    } catch (err) {
        console.error('[Admin] ajustarStock failed:', err);
        admToast(errorMessage(err, 'No se pudo ajustar el stock.'), 'danger');
    } finally {
        btn.disabled = false;
    }
}

function initImageUpload() {
    const zone     = document.getElementById('upload-zone');
    const fileInput = document.getElementById('f-images');
    if (!zone || !fileInput) return;

    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('is-dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('is-dragover'));
    zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('is-dragover');
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', e => handleFiles(e.target.files));
}

async function handleFiles(files) {
    if (!files.length) return;

    const form      = document.getElementById('piece-form');
    const existingId = form.querySelector('[name="id"]').value;
    // For new pieces we store the images under a temporary upload bucket so we
    // don't lock in a piece id until the form is actually saved. This avoids
    // any chance of a stale id being reused.
    const pieceId = existingId || `tmp${Date.now()}${Math.random().toString(36).slice(2, 8)}`;

    const progressWrap = document.getElementById('upload-progress');
    const progressBar  = document.getElementById('upload-progress-bar');
    progressWrap.hidden = false;

    try {
        const { uploadPieceImage } = await import('../storage-service.js');
        const { optimizeImage, makeLqip } = await import('../image-optimizer.js');

        for (const file of files) {
            if (file.size > 10 * 1024 * 1024) {
                admToast(`${file.name} supera los 10 MB`, 'danger');
                continue;
            }
            if (!file.type.startsWith('image/')) {
                admToast(`${file.name} no es una imagen`, 'danger');
                continue;
            }

            // Optimize: resize + convert to WebP/AVIF + genera el LQIP (blur \u00a7108 F3) en paralelo.
            admToast(`Optimizando ${file.name}\u2026`);
            const [optimized, lqip] = await Promise.all([optimizeImage(file), makeLqip(file)]);

            const url = await uploadPieceImage(pieceId, optimized, pct => {
                progressBar.style.width = `${pct}%`;
            });

            _uploadedImages.push(url);
            _uploadedLqips.push(lqip || '');
            renderImagePreviews();

            const saved = optimized.size < file.size
                ? `(${Math.round((1 - optimized.size / file.size) * 100)}% m\u00e1s liviana)`
                : '';
            admToast(`${file.name} \u2192 WebP subida ${saved}`);
        }
    } catch (err) {
        admToast(errorMessage(err, 'No se pudo subir la imagen.'), 'danger');
    } finally {
        progressWrap.hidden = true;
        progressBar.style.width = '0%';
    }
}

function renderImagePreviews() {
    const container = document.getElementById('image-preview');
    if (!container) return;

    container.innerHTML = _uploadedImages.map((url, i) => `
        <div class="adm-image-thumb">
            <img src="${esc(url)}" alt="Foto ${i + 1}" loading="lazy">
            <button class="adm-image-thumb-delete" data-idx="${i}" title="Eliminar">&times;</button>
        </div>
    `).join('');

    container.querySelectorAll('.adm-image-thumb-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            const idx = parseInt(btn.dataset.idx);
            const urlToDelete = _uploadedImages[idx];

            // 1. Delete from Firebase Storage
            try {
                const { deletePieceImage } = await import('../storage-service.js');
                await deletePieceImage(urlToDelete);   // salta si no es de Storage; no lanza si ya no existe
            } catch (err) {
                console.warn('[Admin] Storage delete failed:', err && err.code, err);
                admToast('No se pudo borrar la imagen: ' + ((err && err.code) || (err && err.message) || 'error'), 'danger');
            }

            // 2. Remove from local array (+ su LQIP paralelo, §108 F3)
            _uploadedImages.splice(idx, 1);
            _uploadedLqips.splice(idx, 1);
            renderImagePreviews();

            // 3. If we're editing an existing piece, persist the updated images
            //    array as a partial update so the rest of the document is
            //    preserved. For NEW pieces (no persisted id yet) we just keep
            //    the change in-memory; it will be saved when the user clicks
            //    Guardar.
            const form    = document.getElementById('piece-form');
            const pieceId = form.querySelector('[name="id"]')?.value;
            const isPersisted = pieceId && _allPieces.some(p => p.id === pieceId);
            if (isPersisted) {
                try {
                    const newVersion = await adminDb.patchPiece(pieceId, {
                        images: [..._uploadedImages],
                        image:  _uploadedImages[0] || null,
                        imageLqip: _uploadedLqips[0] || null,   // §108 F3
                    });
                    // Advance the optimistic-lock baseline to include our own
                    // patch — otherwise the next form Save would falsely
                    // detect a version-conflict against ourselves.
                    if (typeof newVersion === 'number') {
                        _editingVersion = newVersion;
                    }
                    admToast('Imagen eliminada y pieza actualizada');
                } catch (err) {
                    console.error('[Admin] Firestore update failed:', err);
                    admToast('Imagen quitada localmente, error al guardar en BD', 'danger');
                }
            } else {
                admToast('Imagen eliminada');
            }
        });
    });
}

const AdminDb = { slugify: (s) => adminDb.constructor.slugify ? adminDb.constructor.slugify(s) : s };

async function openModal(id = null) {
    const modal    = document.getElementById('piece-modal');
    const titleEl  = document.getElementById('modal-title');
    const form     = document.getElementById('piece-form');
    const slugEl   = document.getElementById('f-slug');

    form.reset();
    // Hard-clear the hidden id field — form.reset() only restores
    // defaultValue which can be bypassed by stale state in some edge cases.
    form.querySelector('[name="id"]').value = '';
    delete slugEl.dataset.manual;
    _uploadedImages = [];
    _uploadedLqips  = [];
    _editingVersion = null;
    _editingStockType = null;

    if (id) {
        const piece = _allPieces.find(p => p.id === id);
        if (!piece) return;
        titleEl.textContent = 'Editar pieza';
        populateForm(form, piece);
        slugEl.dataset.manual = '1';
        // Capture the version that was loaded into the form. handleSave will
        // send this back as opts.expectedVersion so the transaction can abort
        // if another admin wrote to the same piece in the meantime.
        _editingVersion = typeof piece._version === 'number' ? piece._version : null;
        // Baseline del tipo de stock (TODO-40 v3): si cambia al guardar, handleSave lo enruta a la CF.
        _editingStockType = piece.stockType || 'finito';

        if (piece.images?.length) {
            _uploadedImages = [...piece.images];
        } else {
            try {
                const { getPieceImages } = await import('../storage-service.js');
                _uploadedImages = await getPieceImages(piece.id);
            } catch { /* Storage unavailable */ }
        }
        // §108 F3: el LQIP de la principal viaja en el doc (no se re-deriva de Storage).
        _uploadedLqips = piece.imageLqip ? [piece.imageLqip] : [];
    } else {
        titleEl.textContent = 'Nueva pieza';
    }

    renderImagePreviews();
    syncStockFields();   // estado inicial de la casilla Cantidad según el tipo de stock (crear o editar).
    modal.hidden = false;
    form.querySelector('input:not([type=hidden])').focus();
}

function closeModal() {
    document.getElementById('piece-modal').hidden = true;
    _uploadedImages = [];
    renderImagePreviews();
}

function populateForm(form, piece) {
    form.querySelector('[name="id"]').value          = piece.id || '';
    form.querySelector('[name="code"]').value        = piece.code || '';
    form.querySelector('[name="name"]').value        = piece.name || '';
    form.querySelector('[name="slug"]').value        = piece.slug || '';
    form.querySelector('[name="collection"]').value  = piece.collection || '';
    form.querySelector('[name="description"]').value = piece.description || '';
    form.querySelector('[name="badge"]').value       = piece.badge || '';
    form.querySelector('[name="featured"]').checked  = !!piece.featured;
    form.querySelector('[name="price"]').value       = piece.price ?? '';

    // TODO-40 v3: inventario/clasificación (default tolerante a piezas legacy sin estos campos).
    // cantidad puede ser 0 (mostrar el real) o null (encargo → syncStockFields la vacía).
    form.querySelector('[name="stockType"]').value   = piece.stockType || 'finito';
    form.querySelector('[name="visibilidad"]').value = piece.visibilidad || 'publica';
    form.querySelector('[name="cantidad"]').value    = (piece.cantidad ?? '');
    form.querySelector('[name="gender"]').value      = piece.gender || '';

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
    form.querySelector('[name="specs.origin"]').value      = specs.origin || '';
    form.querySelector('[name="specs.delivery"]').value    = specs.delivery || '';
    form.querySelector('[name="sizes"]').value = Array.isArray(piece.sizes) ? piece.sizes.join(', ') : '';

    // §151: gema canónica. badgeGem → select; gemFilterIds → checkboxes marcados.
    const selGem = form.querySelector('[name="specs.badgeGem"]');
    if (selGem) selGem.value = specs.badgeGem || '';
    // TODO-59: color del oro (select) ← dato estructurado
    const selMc = form.querySelector('[name="specs.metalColor"]');
    if (selMc) selMc.value = specs.metalColor || '';
    const filtros = new Set((Array.isArray(specs.gemFilterIds) ? specs.gemFilterIds : []).map(s => String(s).toLowerCase()));
    form.querySelectorAll('.f-gem-filter').forEach(cb => { cb.checked = filtros.has(cb.value); });
}

async function handleSave() {
    const form = document.getElementById('piece-form');
    const get  = name => form.querySelector(`[name="${name}"]`)?.value.trim() || '';

    const name = get('name');
    if (!name) { admToast('El nombre es obligatorio', 'danger'); return; }

    const code    = get('code');
    const editing = get('id');
    if (!code) {
        admToast('El código de la pieza es obligatorio', 'danger');
        form.querySelector('[name="code"]').focus();
        return;
    }
    // Uniqueness check — codes must be unique across all pieces, except when
    // editing the same piece.
    const codeNorm = code.toLowerCase();
    const dup = _allPieces.find(p =>
        (p.code || '').toLowerCase() === codeNorm && p.id !== editing
    );
    if (dup) {
        admToast(`El código "${code}" ya está en uso por "${dup.name}"`, 'danger');
        form.querySelector('[name="code"]').focus();
        return;
    }

    // Tope de 16 destacadas (Daniel §138): la home muestra hasta 16 (4 columnas exactas). Al
    // intentar destacar una 17ª, se bloquea con mensaje (no permite, hay que quitar una primero).
    // Solo aplica si ESTA pieza pasa a destacada y aún no contaba como tal.
    const wantsFeatured = form.querySelector('[name="featured"]').checked;
    if (wantsFeatured) {
        const featuredCount = _allPieces.filter(p => p.featured && p.id !== editing).length;
        if (featuredCount >= 16) {
            admToast('Ya hay 16 piezas destacadas (el máximo). Quita una destacada antes de agregar otra.', 'danger', 5000);
            form.querySelector('[name="featured"]').focus();
            return;
        }
    }

    const specs = {};
    ['stone','carat','metal','metalColor','accent','certificate','cut','color','clarity','weight','origin','delivery'].forEach(k => {
        const v = get(`specs.${k}`);
        if (v) specs[k] = v;
    });

    // §151: gema canónica (modelo plano). badgeGem (del select; 'oro'/'' = sin gema) tiñe el badge;
    // gemFilterIds = unión de la principal + las "otras gemas" marcadas (array plano → array-contains).
    const badgeGem = get('specs.badgeGem');
    const filtros = new Set();
    form.querySelectorAll('.f-gem-filter:checked').forEach(cb => filtros.add(cb.value));
    if (badgeGem && badgeGem !== 'oro') filtros.add(badgeGem);   // la principal siempre cuenta en filtros
    if (badgeGem) specs.badgeGem = badgeGem;                      // explícito (incl. 'oro' = sin gema)
    specs.gemFilterIds = [...filtros];                           // [] = sin gema (filtro "solo oro" explícito)

    // Tallas disponibles (bug-1): array que controla Kary. Vacío → la pieza muestra "a medida".
    const sizes = get('sizes').split(',').map(s => s.trim()).filter(Boolean);

    // TODO-40 v3: inventario/clasificación. stockType (enum 3) y cantidad son STOCK TRANSACCIONAL.
    //  · CREATE: el admin fija tipo + cantidad inicial (pieceCreateValid los acepta; encargo → sin cantidad).
    //  · UPDATE: NO se envían — cantidad/estado son CF-only; el merge preserva cantidad (pieceCantidadUnchanged)
    //    y el cambio de tipo se enruta a la CF cambiarTipoPieza (purga D6 + estado derivado). visibilidad
    //    (publica/privada) la controla Kary en ambos casos. gender = OPCIONAL (se OMITE vacío).
    const isNew       = !editing;                  // `editing` (= get('id')) ya viene de los checks de arriba
    const stockType   = get('stockType') || 'finito';
    const visibilidad = get('visibilidad') || 'publica';

    const piece = {
        id:          editing || null,
        code,
        name,
        slug:        get('slug'),
        collection:  get('collection'),
        description: get('description'),
        badge:       get('badge') || null,
        featured:    form.querySelector('[name="featured"]').checked,
        visibilidad,
        priceLabel:  '',   // §145: casilla removida del form → SIEMPRE el rótulo estándar "Consultar precio" (§138)
        specs,
        sizes,       // array (posiblemente vacío) — vacío = "a medida" en el detalle
        images:      _uploadedImages.length ? [..._uploadedImages] : [],
        image:       _uploadedImages[0] || null,
    };

    const genderVal = get('gender');
    if (genderVal) piece.gender = genderVal;

    if (isNew) {
        piece.stockType = stockType;
        // encargo → cantidad AUSENTE (la regla lo exige); finito* → cantidad inicial int≥0 (default 1).
        if (stockType !== 'encargo') {
            const cantidadNum = parseInt(get('cantidad'), 10);
            piece.cantidad = (Number.isInteger(cantidadNum) && cantidadNum >= 0) ? cantidadNum : 1;
        }
    }

    if (!piece.id) delete piece.id;

    // El precio es OPCIONAL. Las reglas (pieceCreateValid/pieceTypesValid en
    // firestore.rules) exigen "ausente o número": un `price: null` (campo vacío) era
    // RECHAZADO con "Missing or insufficient permissions" al guardar. Solo se incluye
    // cuando es un número válido (incluido 0); vacío → se OMITE la clave → la regla pasa
    // y la pieza se guarda con priceLabel vacío → la web muestra el rótulo único "Precio a consultar" (§138).
    const priceNum = parseFloat(get('price'));
    if (Number.isFinite(priceNum)) piece.price = priceNum;

    // §108 F3: LQIP (blur) de la imagen principal. Solo si existe (se omite vacío, como price).
    if (_uploadedLqips[0]) piece.imageLqip = _uploadedLqips[0];

    try {
        const saved = await adminDb.savePiece(piece, {
            expectedVersion: isNew ? undefined : _editingVersion,
        });
        // UPDATE: si Kary cambió el tipo de stock, la transición (purga cantidad / estado derivado) la
        // hace SOLO la CF (cantidad es CF-only). savePiece va primero (candado optimista); la CF después.
        if (!isNew && stockType !== _editingStockType) {
            try {
                await invService.cambiarTipoPieza({ pieceId: editing, nuevoStockType: stockType });
            } catch (err) {
                console.error('[Admin] cambiarTipoPieza failed:', err);
                admToast(errorMessage(err, 'Se guardaron los datos, pero no se pudo cambiar el tipo de stock. Reintenta el cambio de tipo.'), 'danger', 6000);
                return;   // no cerramos: Kary ve el error y reintenta solo el cambio de tipo
            }
        }
        closeModal();
        admToast(`"${saved.name}" guardada correctamente`);
    } catch (err) {
        console.error('[Admin] savePiece failed:', err);
        if (err?.code === 'version-conflict') {
            admToast(
                'Otra persona modificó esta pieza mientras la editabas. Recarga para ver los cambios.',
                'danger',
                5000
            );
            return;
        }
        if (err?.code === 'not-found') {
            admToast('La pieza fue eliminada por otra persona.', 'danger', 5000);
            return;
        }
        admToast(errorMessage(err, 'No se pudo guardar la pieza.'), 'danger');
    }
}

function handleDelete(id) {
    const piece = _allPieces.find(p => p.id === id);
    admConfirm(
        `\u00bfEliminar "${piece?.name || 'esta pieza'}"? Esta acci\u00f3n no se puede deshacer.`,
        async () => {
            try {
                // Delete images from Storage first
                try {
                    const { deleteAllPieceImages } = await import('../storage-service.js');
                    await deleteAllPieceImages(id);
                } catch (err) {
                    console.warn('[Admin] Could not delete images from Storage:', err);
                }
                // Then delete the Firestore document
                await adminDb.deletePiece(id);
                admToast('Pieza e im\u00e1genes eliminadas', 'danger');
            } catch (err) {
                admToast(errorMessage(err, 'No se pudo eliminar la pieza.'), 'danger');
            }
        }
    );
}

init();
