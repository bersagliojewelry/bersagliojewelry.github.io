/**
 * Bersaglio Jewelry — html`` tagged template + HTML escaping
 *
 * Equivalente expressivo a JSX sin React. Permite:
 *   import { html, escape } from './html.js';
 *   const markup = html`<div class="${cls}">${escape(text)}</div>`;
 *
 * Reglas:
 *  - Strings se concatenan tal cual (los valores ya deberían ir escapeados
 *    por el caller cuando vienen de input externo).
 *  - Arrays se aplanan automáticamente (útil para listas: items.map(...)).
 *  - null/undefined/false se ignoran (renderizan vacío).
 *  - Otros valores se convierten via String().
 */

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
const ESC_RE = /[&<>"']/g;

export function escape(value) {
    if (value == null) return '';
    return String(value).replace(ESC_RE, c => ESC[c]);
}

/**
 * html`` — tagged template literal that builds an HTML string.
 * No sanitization happens here; values are inserted as-is. Use escape()
 * on user-provided data to prevent XSS.
 */
export function html(strings, ...values) {
    let out = strings[0];
    for (let i = 0; i < values.length; i++) {
        out += stringify(values[i]) + strings[i + 1];
    }
    return out;
}

function stringify(value) {
    if (value == null || value === false) return '';
    if (Array.isArray(value)) return value.map(stringify).join('');
    return String(value);
}

/** Mount HTML string into a DOM container, replacing previous contents. */
export function mount(container, htmlString) {
    if (!container) return;
    container.innerHTML = htmlString;
}

/** Append HTML string to container without clearing. */
export function append(container, htmlString) {
    if (!container) return;
    const tpl = document.createElement('template');
    tpl.innerHTML = htmlString;
    container.appendChild(tpl.content);
}

/** Build a DocumentFragment from an HTML string (useful for measuring before mount). */
export function fragment(htmlString) {
    const tpl = document.createElement('template');
    tpl.innerHTML = htmlString;
    return tpl.content;
}
