/**
 * Bersaglio — vínculo pieza ↔ colección (función PURA, testeable sin Firebase).
 *
 * Causa raíz del "el admin no sincroniza con la web" (auditoría 2026-06-14): el
 * admin guardaba `piece.collection` con el **id** del doc de colección
 * (`piezas.js`), mientras el público filtra por **slug** (URLs SEO:
 * `catalogo.js`/`pieza.js`). Cuando `id != slug` (slug editado o id con sufijo
 * anti-colisión) el match daba CERO → catálogo y "relacionados" vacíos EN SILENCIO.
 *
 * Estandarizamos el vínculo en `slug`, pero matcheamos slug O id para que ningún
 * dato viejo/edge vuelva a romper el filtrado sin avisar (lectura tolerante).
 */

/** ¿La pieza pertenece a esta colección? Tolerante a slug O id. */
export function pieceInCollection(piece, col) {
    if (!piece || !col) return false;
    const link = piece.collection;
    if (link == null) return false;
    return link === col.slug || link === col.id;
}

/** La colección (doc) a la que pertenece una pieza, o null. */
export function collectionOfPiece(piece, collections) {
    if (!piece || !Array.isArray(collections)) return null;
    return collections.find((c) => pieceInCollection(piece, c)) || null;
}

/** Piezas de una colección dada (por su slug o id), tolerante en ambos lados. */
export function piecesOfCollection(pieces, collections, slugOrId) {
    if (!Array.isArray(pieces)) return [];
    const col = Array.isArray(collections)
        ? collections.find((c) => c.slug === slugOrId || c.id === slugOrId)
        : null;
    return col
        ? pieces.filter((p) => pieceInCollection(p, col))
        : pieces.filter((p) => p.collection === slugOrId);
}
