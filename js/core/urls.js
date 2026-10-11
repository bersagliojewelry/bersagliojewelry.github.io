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

// ─── FACETAS: /coleccion/<slug>.html y /gema/<slug>.html ──────────────────────────────────────
//
// LA FUGA DE AUTORIDAD (medida el 2026-10-10 en el HTML servido). Los seis azulejos de categoría
// de la portada —la página con más autoridad del sitio— apuntaban todos a
// `/colecciones.html?col=<slug>`. Como `?col=` es un parámetro sobre `colecciones.html`, cuya
// canónica es ella misma, los seis enlaces se consolidaban en UNA sola URL: las cinco páginas de
// categoría indexables recibían CERO enlaces internos, y las cuatro de gema tampoco. El pie sí las
// enlaza las nueve, pero el pie lo pinta el JavaScript y no existe en el HTML servido de ninguna
// página, así que para Google tampoco contaban.
//
// Y no se puede arreglar escribiendo las URLs a mano, que es lo que hace el pie: una faceta solo se
// hornea con `FACET_MIN` piezas pedibles o más, el build corre por cron DIARIO, y medido ese día
// `cadenas` tenía 2 piezas pedibles —una venta de margen— y `pulseras` 3. O sea que la lista a mano
// y el conjunto real pueden divergir sin que nadie toque nada, y entonces el enlace es un 404.
//
// Por eso el destino se DERIVA del conjunto de facetas que el build horneó de verdad, que viaja en
// `window.__BJ_FACETS`; y si una faceta no está, el enlace cae a la vista filtrada, que siempre
// existe. `public/404.html` cubre además el hueco entre dos builds.

/** El conjunto de facetas horneadas, sembrado por el build. Vacío = no sembrado (fail-safe). */
export function bakedFacets() {
    const f = (typeof window !== 'undefined' && window.__BJ_FACETS) || null;
    return {
        col:  Array.isArray(f && f.col)  ? f.col  : [],
        gema: Array.isArray(f && f.gema) ? f.gema : [],
    };
}

/**
 * Enlace a una faceta. `kind` = 'col' | 'gema'.
 * Devuelve la URL limpia e indexable si esa faceta se horneó; si no, la vista filtrada.
 * `facets` se puede inyectar (el build le pasa el suyo); por defecto lee la semilla.
 */
export function facetHref(kind, slug, facets) {
    const s = String(slug || '').trim();
    if (!s) return '/colecciones.html';
    const f = facets || bakedFacets();
    const lista = kind === 'gema' ? f.gema : f.col;
    if (lista.includes(s)) {
        return `/${kind === 'gema' ? 'gema' : 'coleccion'}/${encodeURIComponent(s)}.html`;
    }
    return `/colecciones.html?${kind === 'gema' ? 'gema' : 'col'}=${encodeURIComponent(s)}`;
}
