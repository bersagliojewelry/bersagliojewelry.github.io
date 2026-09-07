/**
 * js/admin/singleton-admin-core.js — NÚCLEO PURO del scaffold SINGLETON-FORM (P1 del
 * gran plan §2.E): textos de página por FORMULARIO → setDoc(merge). Sin Firebase/DOM →
 * testeable en Node. El factory con I/O vive en singleton-admin.js.
 *
 * Modelo: un doc por página con sub-mapas por sección (hero{}, editorial{}…). El form
 * agrupa campos por sección; cada input lleva data-sf="seccion.campo". collectSingleton
 * reconstruye el doc anidado SOLO con las claves declaradas (whitelist implícita).
 * Todo valor va por escape() (anti stored-XSS; los textos los edita un rol `editor`).
 *
 * P4 (listas repetibles): un field-type `list` añade arrays de ítems DENTRO de un
 * sub-mapa (ej. valores{items:[{t,d}]}). Cada ítem reusa los field-types text/textarea/
 * image con data-sf INDEXADO (seccion.lista.i.sub). collectSingleton agrupa esos índices
 * de vuelta a un array (en orden, con trim y recorte a `max`). El reordenar/añadir/quitar
 * (mutación del DOM + reindex) lo maneja singleton-admin.js; aquí solo el HTML + recolección.
 */
import { escape } from '../core/html.js';

function fieldHTML(sectionKey, f, value, lqipValue) {
    const ph   = f.placeholder ? ` placeholder="${escape(f.placeholder)}"` : '';
    const hint = f.hint ? `<small style="color:var(--adm-muted);font-size:11px;margin-top:2px;display:block;">${escape(f.hint)}</small>` : '';
    const sf   = `data-sf="${escape(sectionKey)}.${escape(f.name)}"`;
    // P4: campo LISTA. Render N tarjetas (itemTemplateHTML) + botón "añadir". El sub-mapa
    // contenedor sigue siendo `is map` para las reglas; el array vive en su clave (f.name).
    if (f.type === 'list') {
        const items = Array.isArray(value) ? value : [];
        const cards = items.map((item, i) => itemTemplateHTML(sectionKey, f, item, i)).join('');
        const max   = f.max ? ` data-list-max="${f.max}"` : '';
        const min   = f.min ? ` data-list-min="${f.min}"` : '';
        const count = f.max ? `<small class="sf-list-count" data-sf-list-count>${items.length}/${f.max}</small>` : '';
        const addLabel = f.addLabel || 'Añadir';
        return `<div class="adm-field sf-list-field">
            <label>${escape(f.label)}</label>
            <div class="sf-list" data-sf-list="${escape(sectionKey)}.${escape(f.name)}"${max}${min}>${cards}</div>
            <div class="sf-list-foot">
                <button type="button" class="adm-btn adm-btn--ghost adm-btn--sm" data-list-act="add">+ ${escape(addLabel)}</button>
                ${count}
            </div>
            ${hint}
        </div>`;
    }
    // P3.5: campo IMAGEN. La URL (de Storage) vive en un <input hidden> con data-sf, así que
    // collectSingleton la recoge como cualquier campo. El handler de subida (optimizeImage +
    // uploadAsset) vive en singleton-admin.js (delegado por data-img-input). escape() en el src.
    // §103 F1: un 2º hidden compañero `<campo>Lqip` viaja el LQIP (placeholder difuso) generado
    // al subir; collectSingleton/collectList lo recogen como detalle del tipo `image`.
    if (f.type === 'image') {
        const url = escape(value || '');
        const lq  = escape(lqipValue || '');
        const has = !!value;
        return `<div class="adm-field sf-img-field">
            <label>${escape(f.label)}</label>
            <div class="sf-img" data-img-wrap>
                <input type="hidden" ${sf} value="${url}">
                <input type="hidden" data-sf="${escape(sectionKey)}.${escape(f.name)}Lqip" data-img-lqip value="${lq}">
                <div class="sf-img-preview" data-img-preview>${has ? `<img src="${url}" alt="">` : '<span class="sf-img-empty">Sin imagen propia — se usa la de la web</span>'}</div>
                <div class="sf-img-actions">
                    <label class="adm-btn adm-btn--ghost adm-btn--sm sf-img-pick">Cambiar imagen<input type="file" accept="image/png,image/jpeg,image/webp,image/avif" data-img-input hidden></label>
                    <button type="button" class="adm-btn adm-btn--ghost adm-btn--sm" data-img-clear${has ? '' : ' hidden'}>Quitar</button>
                    <span class="sf-img-progress" data-img-progress hidden></span>
                </div>
                ${hint}
            </div>
        </div>`;
    }
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
 * HTML de UNA tarjeta de ítem de lista (P4). PURO. Reusado por fieldHTML (ítems
 * existentes) y por el handler "añadir" de singleton-admin.js (ítem en blanco). El
 * `index` indexa los data-sf de los sub-campos (seccion.lista.i.sub) reusando fieldHTML
 * con el prefijo `seccion.lista.i` → cada sub-campo reusa text/textarea/image tal cual.
 * El título de la cabecera lo deriva de `itemTitleFrom` (decorativo; no es un campo).
 */
function itemTemplateHTML(sectionKey, f, item, index) {
    const it = item || {};
    const itemFields = f.itemFields || [];
    const titleKey = f.itemTitleFrom || (itemFields[0] && itemFields[0].name);
    const titleVal = titleKey ? String(it[titleKey] ?? '').trim() : '';
    const titleHTML = titleVal
        ? escape(titleVal)
        : `<span class="sf-item-untitled">${escape(f.itemTitleEmpty || `${f.singular || 'Elemento'} ${index + 1}`)}</span>`;
    const body = itemFields
        .map(sf => fieldHTML(`${sectionKey}.${f.name}.${index}`, sf, it[sf.name] ?? '', it[`${sf.name}Lqip`] ?? ''))
        .join('');
    return `<div class="sf-item" data-sf-item>
        <div class="sf-item-head">
            <span class="sf-item-title" data-sf-item-title>${titleHTML}</span>
            <span class="sf-item-acts">
                <button type="button" class="adm-btn adm-btn--ghost adm-btn--sm sf-item-btn" data-list-act="up" title="Subir" aria-label="Subir">↑</button>
                <button type="button" class="adm-btn adm-btn--ghost adm-btn--sm sf-item-btn" data-list-act="down" title="Bajar" aria-label="Bajar">↓</button>
                <button type="button" class="adm-btn adm-btn--ghost adm-btn--sm sf-item-btn sf-item-btn--del" data-list-act="del" title="Quitar" aria-label="Quitar">✕</button>
            </span>
        </div>
        <div class="sf-item-body">${body}</div>
    </div>`;
}

export { itemTemplateHTML };

/**
 * Reescribe el índice de un data-sf de ítem a `newIndex`, preservando sección/lista/sub.
 * PURO (el punto frágil del reordenar/quitar): "valores.items.3.t" + ("valores.items",0)
 * → "valores.items.0.t". Un data-sf que no pertenece a la lista se devuelve intacto.
 * Lo usa el reindex del DOM de singleton-admin.js tras cada mutación de la lista.
 */
export function reindexItemSf(sf, listKey, newIndex) {
    if (typeof sf !== 'string' || !sf.startsWith(`${listKey}.`)) return sf;
    const rest = sf.slice(listKey.length + 1);     // "3.t"
    const dot = rest.indexOf('.');
    if (dot < 0) return sf;
    const sub = rest.slice(dot + 1);               // "t"
    return `${listKey}.${newIndex}.${sub}`;
}

/**
 * HTML del formulario: un <fieldset> por sección, campos pre-rellenados con `values`
 * (objeto merged {seccion:{campo:valor}}).
 */
export function singletonFormHTML(sections, values = {}) {
    return sections.map(sec => {
        const v = values[sec.key] || {};
        const rows = sec.fields.map(f =>
            `<div class="adm-form-row adm-col-1" style="margin-top:12px;">${fieldHTML(sec.key, f, v[f.name] ?? '', v[`${f.name}Lqip`] ?? '')}</div>`
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
 *
 * P4: un campo `list` agrupa raw["seccion.lista.i.sub"] de vuelta a un array de objetos,
 * en orden de índice ascendente (compacta huecos por robustez), SOLO con los itemFields
 * declarados, con trim, y recortado a `max` (cap anti denial-of-wallet en el cliente).
 */
export function collectSingleton(raw, sections) {
    const out = {};
    for (const sec of sections) {
        out[sec.key] = {};
        for (const f of sec.fields) {
            if (f.type === 'list') {
                out[sec.key][f.name] = collectList(raw, sec.key, f);
                continue;
            }
            out[sec.key][f.name] = (raw[`${sec.key}.${f.name}`] ?? '').toString().trim();
            // §103 F1: el campo image arrastra su compañero `<campo>Lqip` (placeholder difuso).
            if (f.type === 'image') {
                out[sec.key][`${f.name}Lqip`] = (raw[`${sec.key}.${f.name}Lqip`] ?? '').toString().trim();
            }
        }
    }
    return out;
}

/** Reconstruye un array de ítems desde raw["seccion.lista.i.sub"] (orden + trim + cap). */
function collectList(raw, sectionKey, f) {
    const prefix = `${sectionKey}.${f.name}.`;
    const itemFields = f.itemFields || [];
    const declared = new Set(itemFields.map(sf => sf.name));
    // §103 F1: cada sub-campo image arrastra su compañero `<sub>Lqip` (placeholder difuso).
    const imageNames = new Set(itemFields.filter(sf => sf.type === 'image').map(sf => sf.name));
    const byIndex = new Map();
    for (const key of Object.keys(raw)) {
        if (!key.startsWith(prefix)) continue;
        const rest = key.slice(prefix.length);     // "0.t"
        const dot = rest.indexOf('.');
        if (dot < 0) continue;
        const i = Number(rest.slice(0, dot));
        const sub = rest.slice(dot + 1);
        if (!Number.isInteger(i) || i < 0) continue;
        const isLqip = sub.endsWith('Lqip') && imageNames.has(sub.slice(0, -4));
        if (!declared.has(sub) && !isLqip) continue;   // solo sub-campos declarados (+ su LQIP)
        if (!byIndex.has(i)) byIndex.set(i, {});
        byIndex.get(i)[sub] = (raw[key] ?? '').toString().trim();
    }
    const indices = [...byIndex.keys()].sort((a, b) => a - b);
    let arr = indices.map(i => {
        const item = {};
        for (const sf of itemFields) {
            item[sf.name] = byIndex.get(i)[sf.name] ?? '';
            if (sf.type === 'image') item[`${sf.name}Lqip`] = byIndex.get(i)[`${sf.name}Lqip`] ?? '';
        }
        return item;
    });
    if (f.max && arr.length > f.max) arr = arr.slice(0, f.max);
    return arr;
}

/**
 * merge(defaults, doc) por sección — pre-llenado del form (Kary parte del texto actual).
 * El spread por sección reemplaza arrays enteros (no fusiona índice-por-índice), que es la
 * semántica correcta para listas: un doc con `items:[]` muestra lista vacía; un doc sin la
 * clave cae al default. Por eso las listas NO requieren rama aparte aquí.
 */
export function mergeSections(defaults, doc, sections) {
    const out = {};
    const d = doc || {};
    for (const sec of sections) {
        out[sec.key] = { ...((defaults || {})[sec.key] || {}), ...((d[sec.key]) || {}) };
    }
    return out;
}
