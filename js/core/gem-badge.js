/**
 * Badge de GEMA por color (§149 → modelo canónico §150/TODO-57) — muestra UNA gema (la principal)
 * con su color de marca. Reemplaza al genérico "Destacada".
 *
 * Fuente del dato (decisión comité ×5 + Daniel): el CANÓNICO `piece.gemPrincipal` (slug) — escrito
 * por el select del admin / la migración. FALLBACK transicional al texto libre (`specs.stone`) SOLO
 * mientras una pieza no esté migrada, para que ninguna rompa en la ventana de deploy (§150 ·3.6).
 * El COLOR vive como dato en la taxonomía (`gem-taxonomy.js` + colección `gemTaxonomy`), no aquí.
 *
 * Escenarios: A (una gema) → chip color de la principal · B (multi-gema) → SOLO la principal (los
 * acentos viven en la ficha + filtros) · C (sin gema, oro solo) → null = sin badge.
 */
import { gemColor, gemLabel, slugFromText } from './gem-taxonomy.js';

/** Slug de la gema PRINCIPAL: dato canónico (gemPrincipal/gems[]) → fallback al texto libre. */
function slugPrincipal(piece) {
    if (piece?.gemPrincipal) return String(piece.gemPrincipal).toLowerCase();
    if (Array.isArray(piece?.gems) && piece.gems.length) {
        const p = piece.gems.find(g => g?.role === 'principal') || piece.gems[0];
        if (p?.type) return String(p.type).toLowerCase();
    }
    // Transición §150: pieza sin migrar → derivar del texto libre (se retira tras migrar + form select).
    return slugFromText(piece?.specs?.stones || piece?.specs?.stone);
}

/**
 * @returns {{slug:string,name:string,color:string}|null} la gema principal de la pieza, o null si
 *   no hay gema (oro solo) → el callsite no muestra badge.
 */
export function gemBadge(piece) {
    const slug = slugPrincipal(piece);
    if (!slug) return null;
    return { slug, name: gemLabel(slug), color: gemColor(slug) };
}

/** Filtro: ¿la pieza LLEVA esta gema (principal o acento)? Para filtros futuros (TODO-50, array-contains). */
export function tieneGema(piece, slug) {
    const s = String(slug || '').toLowerCase();
    if (Array.isArray(piece?.gems)) return piece.gems.some(g => String(g?.type || '').toLowerCase() === s);
    return slugPrincipal(piece) === s;   // fallback transicional
}
