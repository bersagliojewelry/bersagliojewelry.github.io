/**
 * js/admin/resource-admin-core.js — NÚCLEO PURO del motor CRUD de contenido
 * (resource-admin.js). Sin dependencias de Firebase ni del DOM → testeable en
 * Node (tests/resource-admin.test.mjs). Solo importa utilidades puras: escape()
 * (html.js) y safeUrl() (safe-url.js). El factory con I/O vive en resource-admin.js.
 */
import { escape } from '../core/html.js';
import { safeUrl } from '../core/safe-url.js';

/** Slug canónico (espejo de AdminDatabase.slugify / colecciones.js). */
export function slugify(s) {
    return String(s ?? '')
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

/**
 * id libre por slug, con sufijo -2,-3… ante colisión (espejo de saveCollection).
 * Determinista: NO usa relojes/azar salvo agotar 200 intentos (caso imposible).
 */
export function nextSlugId(base, existingIds = []) {
    const set  = new Set(existingIds);
    const root = slugify(base);
    if (!root) return '';
    if (!set.has(root)) return root;
    for (let i = 2; i < 200; i++) {
        const c = `${root}-${i}`;
        if (!set.has(c)) return c;
    }
    return `${root}-x`;
}

/**
 * Coerciona los valores crudos del formulario según el tipo de cada campo.
 * Strings → trim; number → float|null; checkbox → bool. Solo incluye los campos
 * declarados (whitelist implícita: nada fuera del descriptor llega al doc).
 */
export function coerceValues(raw, fields) {
    const out = {};
    for (const f of fields) {
        const v = raw[f.name];
        if (f.type === 'checkbox')      out[f.name] = !!v;
        else if (f.type === 'number') { const n = parseFloat(v); out[f.name] = Number.isFinite(n) ? n : null; }
        else                            out[f.name] = (v ?? '').toString().trim();
    }
    return out;
}

/** Fecha corta es-CO ('14 jun 2026'); robusta a Timestamp Firestore / ISO / Date. */
export function fmtDateShort(val) {
    if (!val) return '—';
    const dt = val.toDate ? val.toDate() : new Date(val);
    return isNaN(dt) ? '—' : dt.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Celda de tabla según el tipo de columna (SIEMPRE escapada/saneada). */
export function cellText(item, col) {
    const raw = item[col.key];
    switch (col.type) {
        case 'badge':
            return raw
                ? `<span class="adm-pill adm-pill--green">${escape(col.on || 'Sí')}</span>`
                : `<span class="adm-pill adm-pill--gray">${escape(col.off || 'No')}</span>`;
        case 'date':
            return `<span class="adm-td-muted">${escape(fmtDateShort(raw))}</span>`;
        case 'thumb':
            return raw
                ? `<img src="${escape(safeUrl(raw))}" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:6px;display:block;">`
                : '<span class="adm-td-muted">—</span>';
        case 'mono':
            return `<code style="font-size:11px;">${escape(raw ?? '—')}</code>`;
        default:
            return escape(raw ?? '—');
    }
}

/** HTML de UN campo del formulario según su tipo (data-field = clave). */
export function fieldHTML(f) {
    const req  = f.required ? ' <span style="color:var(--adm-danger)">*</span>' : '';
    const ph   = f.placeholder ? ` placeholder="${escape(f.placeholder)}"` : '';
    const hint = f.hint ? `<small style="color:var(--adm-muted);font-size:11px;margin-top:2px;display:block;">${escape(f.hint)}</small>` : '';
    let control;
    switch (f.type) {
        case 'textarea':
            control = `<textarea class="adm-input" data-field="${escape(f.name)}" rows="${f.rows || 3}"${ph}></textarea>`;
            break;
        case 'checkbox':
            return `<label class="adm-checkbox-row"><input type="checkbox" data-field="${escape(f.name)}"><span>${escape(f.label)}</span></label>${hint}`;
        case 'image':
            control = `
                <input type="hidden" data-field="${escape(f.name)}">
                <div class="adm-upload-zone" data-upload="${escape(f.name)}" style="padding:18px;border:2px dashed rgba(201,169,110,0.25);border-radius:var(--adm-radius);text-align:center;cursor:pointer;transition:border-color .2s;">
                    <p style="margin:0;font-size:13px;color:var(--adm-muted);">Arrastra una imagen o <strong>haz clic</strong> para subir</p>
                    <p style="margin:6px 0 0;font-size:11px;color:var(--adm-muted);opacity:.7;">Se convierte a WebP · máx. 10 MB</p>
                    <input type="file" data-file="${escape(f.name)}" accept="image/*" style="display:none;">
                </div>
                <div class="adm-prog" data-prog="${escape(f.name)}" hidden style="margin-top:8px;background:var(--adm-border);border-radius:4px;height:4px;overflow:hidden;"><div data-progbar="${escape(f.name)}" style="height:100%;background:var(--adm-accent);width:0%;transition:width .2s;"></div></div>
                <div data-preview="${escape(f.name)}" style="margin-top:8px;"></div>`;
            break;
        case 'date':
            control = `<input class="adm-input" type="date" data-field="${escape(f.name)}"${ph}>`;
            break;
        case 'number':
            control = `<input class="adm-input" type="number" data-field="${escape(f.name)}"${ph}>`;
            break;
        default: // text / slug / url
            control = `<input class="adm-input" type="text" data-field="${escape(f.name)}"${ph}>`;
    }
    return `<div class="adm-field"><label>${escape(f.label)}${req}</label>${control}${hint}</div>`;
}

/** HTML del cuerpo del formulario (un campo por fila). */
export function formFieldsHTML(fields) {
    return fields.map(f => `<div class="adm-form-row adm-col-1" style="margin-top:12px;">${fieldHTML(f)}</div>`).join('');
}
