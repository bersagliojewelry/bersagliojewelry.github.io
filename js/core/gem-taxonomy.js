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

/** Color de una gema por slug (semilla; fallback neutro si no existe/no tiene color). */
export function gemColor(slug) {
    return BY_SLUG.get(String(slug || '').toLowerCase())?.color || GEM_NEUTRAL;
}

/** Label visible de una gema por slug (capitaliza el slug si no está en la semilla). */
export function gemLabel(slug) {
    const s = String(slug || '').toLowerCase();
    return BY_SLUG.get(s)?.label || (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
}

/** ¿La gema existe en la semilla canónica? (para validar/decidir si pinta color real o neutro). */
export function gemKnown(slug) {
    return BY_SLUG.has(String(slug || '').toLowerCase());
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
