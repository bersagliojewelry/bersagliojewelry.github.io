/**
 * Color del oro / tipo de metal (TODO-59, Daniel 2026-06-29) — campo ESTRUCTURADO `specs.metalColor`
 * ('amarillo'|'blanco'|'rosa'), elegido en un SELECT del admin (cero typos), aparte del texto libre
 * `specs.metal` (material/quilataje, ej. "Oro 18k"). El display combina ambos → "Oro blanco 18k".
 * Espeja el patrón de la gema (§151: dato estructurado + prosa libre). PURO → testeable.
 */
const COLOR_LABEL = { amarillo: 'amarillo', blanco: 'blanco', rosa: 'rosa' };

/** Etiqueta del color del oro ('blanco') o '' si no hay / no es válido. */
export function metalColorLabel(specs) {
    return COLOR_LABEL[String(specs?.metalColor || '').toLowerCase()] || '';
}

/**
 * Metal para MOSTRAR: inserta el color del oro tras "Oro" → "Oro 18k" + blanco = "Oro blanco 18k".
 * No duplica si el texto ya lo dice; el color solo aplica a oro; sin color → el texto tal cual.
 */
export function metalConColor(specs) {
    const s = specs || {};
    const metal = s.metal || s.gold || '';
    const color = metalColorLabel(s);
    if (!color || !/\boro\b/i.test(metal)) return metal;
    if (new RegExp(`\\b${color}\\b`, 'i').test(metal)) return metal;   // ya lo dice → no duplicar
    return metal.replace(/\boro\b/i, m => `${m} ${color}`);
}
