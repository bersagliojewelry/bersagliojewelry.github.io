/**
 * js/admin/singleton-admin-core.js — NÚCLEO PURO del scaffold SINGLETON-FORM (P1 del
 * gran plan §2.E): textos de página por FORMULARIO → setDoc(merge). Sin Firebase/DOM →
 * testeable en Node. El factory con I/O vive en singleton-admin.js.
 *
 * Modelo: un doc por página con sub-mapas por sección (hero{}, editorial{}…). El form
 * agrupa campos por sección; cada input lleva data-sf="seccion.campo". collectSingleton
 * reconstruye el doc anidado SOLO con las claves declaradas (whitelist implícita).
 * Todo valor va por escape() (anti stored-XSS; los textos los edita un rol `editor`).
 */
import { escape } from '../core/html.js';

function fieldHTML(sectionKey, f, value) {
    const ph   = f.placeholder ? ` placeholder="${escape(f.placeholder)}"` : '';
    const hint = f.hint ? `<small style="color:var(--adm-muted);font-size:11px;margin-top:2px;display:block;">${escape(f.hint)}</small>` : '';
    const sf   = `data-sf="${escape(sectionKey)}.${escape(f.name)}"`;
    // Límite de caracteres (F1, consejo Gemini): tipografía de lujo se rompe con texto largo.
    // maxlength corta en el navegador; el contador da feedback en vivo (lo actualiza singleton-admin).
    const max   = f.max ? ` maxlength="${f.max}"` : '';
    const count = f.max ? `<small class="sf-count" data-sf-count>${String(value ?? '').length}/${f.max}</small>` : '';
    const control = f.type === 'textarea'
        ? `<textarea class="adm-input" ${sf} rows="${f.rows || 3}"${max}${ph}>${escape(value)}</textarea>`
        : `<input class="adm-input" type="text" ${sf} value="${escape(value)}"${max}${ph}>`;
    return `<div class="adm-field"><label>${escape(f.label)}${count}</label>${control}${hint}</div>`;
}

/**
 * HTML del formulario: un <fieldset> por sección, campos pre-rellenados con `values`
 * (objeto merged {seccion:{campo:valor}}).
 */
export function singletonFormHTML(sections, values = {}) {
    return sections.map(sec => {
        const v = values[sec.key] || {};
        const rows = sec.fields.map(f =>
            `<div class="adm-form-row adm-col-1" style="margin-top:12px;">${fieldHTML(sec.key, f, v[f.name] ?? '')}</div>`
        ).join('');
        return `<fieldset style="border:1px solid var(--adm-border);border-radius:var(--adm-radius);padding:14px 16px;margin-bottom:18px;">
            <legend style="padding:0 8px;font-weight:600;color:var(--adm-accent);">${escape(sec.label)}</legend>
            ${rows}
        </fieldset>`;
    }).join('');
}

/**
 * raw = { "seccion.campo": valor } (leído del DOM) → { seccion: { campo: valor } }.
 * Solo incluye las claves DECLARADAS en el descriptor (nada inyectado pasa). Trim de
 * strings. Es la whitelist en el cliente; las reglas validan hasOnly de sub-mapas.
 */
export function collectSingleton(raw, sections) {
    const out = {};
    for (const sec of sections) {
        out[sec.key] = {};
        for (const f of sec.fields) {
            out[sec.key][f.name] = (raw[`${sec.key}.${f.name}`] ?? '').toString().trim();
        }
    }
    return out;
}

/** merge(defaults, doc) por sección — pre-llenado del form (Kary parte del texto actual). */
export function mergeSections(defaults, doc, sections) {
    const out = {};
    const d = doc || {};
    for (const sec of sections) {
        out[sec.key] = { ...((defaults || {})[sec.key] || {}), ...((d[sec.key]) || {}) };
    }
    return out;
}
