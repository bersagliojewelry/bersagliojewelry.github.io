/**
 * Bersaglio Jewelry — Contrato de URLs de pieza (SSoT). ⟦OPUS-4.8⟧
 *
 * Una pieza se publica como página HORNEADA por el SSG en /pieza/<slug>.html
 * (ver scripts/generate-pieces.mjs). El slug DEBE resolverse igual aquí y allá,
 * o el link del cliente apuntaría a un archivo inexistente.
 *
 * El shell legacy /pieza.html?p=<slug> sigue funcionando (links viejos), pero su
 * canonical apunta a la URL limpia → cero contenido duplicado.
 *
 * Acepta una pieza (objeto) o un slug/string ya resuelto.
 */

const SITE_URL = 'https://bersagliojewelry.co';

/** Slug canónico: piece.slug si existe, si no el id. (Mismo contrato que el generador.) */
export function pieceSlug(pOrSlug) {
    if (pOrSlug == null) return '';
    if (typeof pOrSlug === 'string') return pOrSlug.trim();
    const s = (pOrSlug.slug || '').trim();
    return s || String(pOrSlug.id || '');
}

/** Ruta relativa indexable de la pieza. Ej: /pieza/anillo-esmeralda-001.html */
export function pieceUrl(pOrSlug) {
    return `/pieza/${pieceSlug(pOrSlug)}.html`;
}

/** URL absoluta (para canonical/OG/schema/compartir). */
export function pieceAbsUrl(pOrSlug) {
    return `${SITE_URL}/pieza/${pieceSlug(pOrSlug)}.html`;
}
