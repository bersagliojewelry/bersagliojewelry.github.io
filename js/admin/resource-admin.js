/**
 * js/admin/resource-admin.js — Motor CRUD genérico para recursos-LISTA de
 * CONTENIDO PÚBLICO (journal / films / socialPosts). BLOQUEANTE #2b del comité
 * de diseño (wrpym7h3p): clonar el CRUD ×6 ≈ 2400 líneas; en su lugar cada
 * recurso se DECLARA con un descriptor (~30 líneas) y obtiene tabla + modal +
 * alta/edición/borrado con bloqueo optimista + sincronización en vivo.
 *
 * Montaje SCOPED a un host element (cero IDs globales) → varios recursos conviven
 * en pestañas dentro de admin-contenido.html (decisión UX #3 del comité: UNA
 * página de pestañas, no 6 admin-*.html sueltos).
 *
 * NO retrofitea pieces/collections: su CRUD tiene upload multi-imagen + specs
 * propios y vive en producción. El comité los dejó como cobayas del motor de
 * SERVICIO (createTypedDoc, firestore-service.js), no de este motor de UI; aquí
 * el primer consumidor/validador es journal.
 *
 * Seguridad: TODO HTML se monta por el sink sancionado mount() (js/core/html.js)
 * con valores YA escapados por el núcleo puro (resource-admin-core.js): esc en
 * texto, safeUrl en url→href/src (stored-XSS, BLOQUEANTE #1). Columnas DECLARATIVAS
 * (text/badge/date/thumb) — sin render() arbitrario que inyecte HTML sin escapar.
 */
import {
    onCollectionChange, createTypedDoc, updateTypedDoc, deleteTypedDoc,
} from '../firestore-service.js';
import { admToast, admConfirm, esc } from './shared.js';
import { safeUrl } from '../core/safe-url.js';
import { mount } from '../core/html.js';
import {
    slugify, nextSlugId, coerceValues, cellText, formFieldsHTML,
} from './resource-admin-core.js';

// Re-export del núcleo puro (un solo punto de import para los consumidores/tests).
export { slugify, nextSlugId, coerceValues, cellText, formFieldsHTML };

/**
 * @param {object} d  descriptor del recurso:
 *   - collection {string}      nombre de la colección Firestore
 *   - singular/plural {string} para textos de UI
 *   - titleKey {string}        clave del título (para confirmaciones); default 'title'
 *   - idFrom {string}          campo del que derivar el id en alta; default 'slug'
 *   - columns {Array}          { key, label, type } (text|badge|date|thumb|mono)
 *   - fields {Array}           { name, label, type, required?, slugSource?, ... }
 *   - toDoc(values) -> data    serializa el form al doc (whitelist + defaults)
 *   - fromDoc(doc) -> values   (opcional) pobla el form; default = identidad
 *   - listLimit {number}       cota del listener (S3); truncado emite banner
 * @returns {{ mount(hostEl):void, destroy():void }}
 */
export function createResourceAdmin(d) {
    let items   = [];
    let unsub   = null;
    let host    = null;
    let editing = null;      // doc en edición (null = alta)
    let editVer = null;      // _version base para el bloqueo optimista
    const uploads = {};      // urls subidas por campo image en la sesión del modal

    const $ = sel => host.querySelector(sel);

    function mountInto(hostEl) {
        host = hostEl;
        mount(host, skeleton());
        $('[data-new]').addEventListener('click', () => openModal());
        $('[data-modal-close]').addEventListener('click', closeModal);
        $('[data-modal-cancel]').addEventListener('click', closeModal);
        $('[data-modal-save]').addEventListener('click', save);
        wireSlugAuto();
        wireUploads();
        renderTable();
        unsub = onCollectionChange(d.collection, list => {
            items = list;
            renderTable();
        }, { limit: d.listLimit || 200, truncationLabel: d.plural || d.collection });
    }

    function destroy() {
        if (unsub) { unsub(); unsub = null; }
        if (host) mount(host, '');
        host = null;
    }

    function skeleton() {
        const cols = d.columns.map(c => `<th>${esc(c.label)}</th>`).join('');
        return `
        <div class="adm-content-head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;gap:12px;flex-wrap:wrap;">
            <p class="adm-td-muted" data-count style="margin:0;font-size:13px;"></p>
            <button class="adm-btn adm-btn--primary" data-new>+ Nueva ${esc(d.singular)}</button>
        </div>
        <div class="adm-table-wrap">
            <table class="adm-table">
                <thead><tr>${cols}<th></th></tr></thead>
                <tbody data-tbody></tbody>
            </table>
            <p data-empty hidden class="adm-td-muted" style="padding:24px;text-align:center;">Aún no hay ${esc(d.plural)}. Crea la primera con el botón de arriba.</p>
        </div>
        <div class="adm-modal" data-modal hidden>
            <div class="adm-modal-box">
                <div class="adm-modal-head">
                    <h2 data-modal-title>Nueva ${esc(d.singular)}</h2>
                    <button class="adm-modal-close" data-modal-close aria-label="Cerrar">✕</button>
                </div>
                <div class="adm-modal-body"><form data-form novalidate>${formFieldsHTML(d.fields)}</form></div>
                <div class="adm-modal-foot">
                    <button class="adm-btn adm-btn--ghost" data-modal-cancel>Cancelar</button>
                    <button class="adm-btn adm-btn--primary" data-modal-save>Guardar</button>
                </div>
            </div>
        </div>`;
    }

    function renderTable() {
        if (!host) return;
        const tbody = $('[data-tbody]');
        const empty = $('[data-empty]');
        const count = $('[data-count]');
        if (count) count.textContent = `${items.length} ${items.length === 1 ? d.singular : d.plural}`;
        if (empty) empty.hidden = items.length > 0;
        const rows = items.map(it => {
            const cells = d.columns.map(c => `<td>${cellText(it, c)}</td>`).join('');
            return `<tr>${cells}<td><div class="adm-table-actions">
                <button class="adm-btn adm-btn--ghost adm-btn--sm" data-edit="${esc(it.id)}">Editar</button>
                <button class="adm-btn adm-btn--icon adm-btn--danger" data-del="${esc(it.id)}" title="Eliminar">✕</button>
            </div></td></tr>`;
        }).join('');
        mount(tbody, rows);
        tbody.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => openModal(b.dataset.edit)));
        tbody.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => del(b.dataset.del)));
    }

    // ── Slug automático desde el campo marcado slugSource ───────────────────────
    function wireSlugAuto() {
        const src  = d.fields.find(f => f.slugSource);
        const slug = d.fields.find(f => f.type === 'slug');
        if (!src || !slug) return;
        const srcEl  = $(`[data-field="${src.name}"]`);
        const slugEl = $(`[data-field="${slug.name}"]`);
        if (!srcEl || !slugEl) return;
        srcEl.addEventListener('input', e => {
            if (!slugEl.dataset.manual) slugEl.value = slugify(e.target.value);
        });
        slugEl.addEventListener('input', e => { e.target.dataset.manual = e.target.value ? '1' : ''; });
    }

    // ── Upload de imágenes (reusa uploadAsset + optimizeImage, como pieces) ─────
    function wireUploads() {
        d.fields.filter(f => f.type === 'image').forEach(f => {
            const zone = $(`[data-upload="${f.name}"]`);
            const file = $(`[data-file="${f.name}"]`);
            if (!zone || !file) return;
            zone.addEventListener('click', () => file.click());
            zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = 'var(--adm-accent)'; });
            zone.addEventListener('dragleave', () => { zone.style.borderColor = ''; });
            zone.addEventListener('drop', e => { e.preventDefault(); zone.style.borderColor = ''; if (e.dataTransfer.files.length) handleUpload(f.name, e.dataTransfer.files[0]); });
            file.addEventListener('change', e => { if (e.target.files.length) handleUpload(f.name, e.target.files[0]); });
        });
    }

    async function handleUpload(name, file) {
        if (!file.type.startsWith('image/')) { admToast('El archivo debe ser una imagen', 'danger'); return; }
        if (file.size > 10 * 1024 * 1024)    { admToast('La imagen supera los 10 MB', 'danger'); return; }
        const prog = $(`[data-prog="${name}"]`);
        const bar  = $(`[data-progbar="${name}"]`);
        if (prog) prog.hidden = false;
        try {
            const { uploadAsset }   = await import('../storage-service.js');
            const { optimizeImage } = await import('../image-optimizer.js');
            admToast('Optimizando imagen…');
            const optimized = await optimizeImage(file);
            const url = await uploadAsset(optimized, pct => { if (bar) bar.style.width = `${pct}%`; });
            uploads[name] = url;
            $(`[data-field="${name}"]`).value = url;
            renderPreview(name, url);
            admToast('Imagen subida');
        } catch {
            admToast('Error al subir la imagen', 'danger');
        } finally {
            if (prog) prog.hidden = true;
            if (bar)  bar.style.width = '0%';
        }
    }

    function renderPreview(name, url) {
        const box = $(`[data-preview="${name}"]`);
        if (!box) return;
        mount(box, url
            ? `<img src="${esc(safeUrl(url))}" alt="" style="max-height:120px;border-radius:var(--adm-radius);display:block;">`
            : '');
    }

    // ── Modal ───────────────────────────────────────────────────────────────────
    function openModal(id = null) {
        editing = id ? items.find(x => x.id === id) : null;
        editVer = editing && typeof editing._version === 'number' ? editing._version : null;
        Object.keys(uploads).forEach(k => delete uploads[k]);
        const form = $('[data-form]');
        form.reset();
        form.querySelectorAll('[data-field]').forEach(el => {
            if (el.type === 'checkbox') el.checked = false; else el.value = '';
            delete el.dataset.manual;
        });
        d.fields.filter(f => f.type === 'image').forEach(f => renderPreview(f.name, ''));

        $('[data-modal-title]').textContent = editing ? `Editar ${d.singular}` : `Nueva ${d.singular}`;
        if (editing) {
            const values = d.fromDoc ? d.fromDoc(editing) : editing;
            d.fields.forEach(f => {
                const el = $(`[data-field="${f.name}"]`);
                if (!el) return;
                const v = values[f.name];
                if (f.type === 'checkbox') el.checked = !!v;
                else { el.value = v ?? ''; if (f.type === 'slug') el.dataset.manual = '1'; }
                if (f.type === 'image') renderPreview(f.name, v);
            });
        }
        $('[data-modal]').hidden = false;
    }

    function closeModal() {
        const m = $('[data-modal]');
        if (m) m.hidden = true;
        Object.keys(uploads).forEach(k => delete uploads[k]);
    }

    function readForm() {
        const raw = {};
        d.fields.forEach(f => {
            const el = $(`[data-field="${f.name}"]`);
            if (!el) return;
            raw[f.name] = f.type === 'checkbox' ? el.checked : el.value;
        });
        return coerceValues(raw, d.fields);
    }

    async function save() {
        const values = readForm();
        const missing = d.fields.find(f => f.required && !values[f.name]);
        if (missing) { admToast(`"${missing.label}" es obligatorio`, 'danger'); return; }
        const data = d.toDoc(values);
        try {
            if (editing) {
                await updateTypedDoc(d.collection, editing.id, data, { expectedVersion: editVer });
            } else {
                const base = values[d.idFrom || 'slug'] || values.title || d.collection;
                const id   = nextSlugId(base, items.map(x => x.id));
                await createTypedDoc(d.collection, id, data);
            }
            closeModal();
            admToast(editing ? 'Cambios guardados' : `${d.singular} creada`);
        } catch (err) {
            console.error(`[resource-admin:${d.collection}] save failed:`, err);
            if (err?.code === 'version-conflict') { admToast('Otra persona lo modificó mientras editabas. Recarga para ver los cambios.', 'danger', 5000); return; }
            if (err?.code === 'not-found')        { admToast('El elemento fue eliminado por otra persona.', 'danger', 5000); return; }
            if (err?.code === 'id-collision')     { admToast('Ya existe un elemento con ese identificador.', 'danger'); return; }
            admToast(err?.message || 'Error al guardar', 'danger');
        }
    }

    function del(id) {
        const it = items.find(x => x.id === id);
        admConfirm(`¿Eliminar "${it?.[d.titleKey || 'title'] || 'este elemento'}"? Esta acción no se puede deshacer.`, async () => {
            try {
                await deleteTypedDoc(d.collection, id);
                admToast(`${d.singular} eliminada`, 'danger');
            } catch {
                admToast('Error al eliminar', 'danger');
            }
        });
    }

    return { mount: mountInto, destroy };
}

export default createResourceAdmin;
