/**
 * Taxonomía canónica de GEMAS (TODO-57, decisión §150) — SSoT del slug, label y COLOR por gema.
 *
 * Decisión del comité ×5 + Daniel: el color de la gema es un DATO (no hardcode en un regex). Esta
 * SEMILLA define las gemas conocidas; la colección Firestore `gemTaxonomy/{slug}` la ESPEJA y permite
 * que Kary/Daniel agreguen gemas nuevas (ópalo, perla…) sin redeploy. El cliente usa la semilla como
 * base + (cuando esté) la colección para las gemas añadidas. Slug = ASCII minúscula sin tildes (clave
 * estable e indexable). Una gema sin color → fallback NEUTRO (nunca rompe el badge).
 *
 * Colores §149 (ahora como dato): esmeralda=verde · rubi=rojo · zafiro=azul · diamante=platino.
 */

export const GEM_NEUTRAL = '#8C8C84';   // fallback seguro para gema sin color asignado

// Semilla canónica. `syn` = sinónimos/variantes de texto libre para el parser transicional y la migración.
export const GEM_SEED = [
    { slug: 'esmeralda', label: 'Esmeralda', color: '#1D9E75', syn: ['esmeralda', 'emerald'] },
    { slug: 'rubi',      label: 'Rubí',      color: '#C0143C', syn: ['rubi', 'rubí', 'ruby'] },
    { slug: 'zafiro',    label: 'Zafiro',    color: '#1E63B0', syn: ['zafiro', 'safiro', 'sapphire'] },
    { slug: 'diamante',  label: 'Diamante',  color: '#7E94A6', syn: ['diamante', 'diamond', 'brillante'] },
    // Comunes adicionales (color de partida; Kary/Daniel ajustan en gemTaxonomy):
    { slug: 'perla',      label: 'Perla',      color: '#E7E1D3', syn: ['perla', 'pearl'] },
    { slug: 'opalo',      label: 'Ópalo',      color: '#7FB7C4', syn: ['opalo', 'ópalo', 'opal'] },
    { slug: 'topacio',    label: 'Topacio',    color: '#D9A441', syn: ['topacio', 'topaz'] },
    { slug: 'aguamarina', label: 'Aguamarina', color: '#5FB3C4', syn: ['aguamarina', 'aquamarine'] },
    { slug: 'morganita',  label: 'Morganita',  color: '#E0A6A0', syn: ['morganita', 'morganite'] },
    { slug: 'amatista',   label: 'Amatista',   color: '#8E6FB0', syn: ['amatista', 'amethyst'] },
];

const BY_SLUG = new Map(GEM_SEED.map(g => [g.slug, g]));

// Gemas AÑADIDAS por Kary/Daniel (colección/doc `settings/gems`), inyectadas por `data.js` (live) o
// por el SSG (horneadas en catalogo.json). Tienen prioridad sobre la semilla (Kary ajusta el color).
let _extra = new Map();

/**
 * Carga el catálogo de gemas editable (settings/gems) → el badge público y el select del admin lo usan.
 * @param {Array<{slug:string,label?:string,color?:string}>} list
 */
export function setGemCatalog(list) {
    _extra = new Map();
    for (const g of (Array.isArray(list) ? list : [])) {
        const slug = String(g?.slug || '').toLowerCase().trim();
        if (slug) _extra.set(slug, { slug, label: g.label || '', color: g.color || '' });
    }
}

/** Color de una gema por slug: extras (Kary) → semilla → neutro (nunca rompe el badge). */
export function gemColor(slug) {
    const s = String(slug || '').toLowerCase();
    return _extra.get(s)?.color || BY_SLUG.get(s)?.color || GEM_NEUTRAL;
}

/** Label visible de una gema por slug (extras → semilla → capitaliza el slug). */
export function gemLabel(slug) {
    const s = String(slug || '').toLowerCase();
    return _extra.get(s)?.label || BY_SLUG.get(s)?.label || (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
}

/** ¿La gema existe (semilla o extras)? */
export function gemKnown(slug) {
    const s = String(slug || '').toLowerCase();
    return BY_SLUG.has(s) || _extra.has(s);
}

/** Lista completa de gemas (semilla + extras de Kary) para poblar el SELECT del admin. Ordenada por label. */
export function allGems() {
    const m = new Map(GEM_SEED.map(g => [g.slug, { slug: g.slug, label: g.label, color: g.color }]));
    for (const [s, g] of _extra) m.set(s, { slug: s, label: g.label || gemLabel(s), color: g.color || GEM_NEUTRAL });
    return [...m.values()].sort((a, b) => a.label.localeCompare(b.label, 'es'));
}

/**
 * Parser TRANSICIONAL: deriva el slug canónico de un texto libre (`specs.stone` = "Esmeralda Natural").
 * Se usa SOLO durante la migración y como fallback del badge mientras las piezas no tengan `gemPrincipal`.
 * Tras migrar + form con select, esto deja de correr en vivo. @returns slug | null (null = no reconocida).
 */
export function slugFromText(texto) {
    const t = String(texto || '').toLowerCase();
    if (!t.trim()) return null;
    for (const g of GEM_SEED) {
        if (g.syn.some(s => t.includes(s))) return g.slug;
    }
    return null;
}
