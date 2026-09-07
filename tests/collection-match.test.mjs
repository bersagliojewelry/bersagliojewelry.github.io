/**
 * Vínculo pieza↔colección tolerante (slug O id) — js/core/collection-match.js.
 * Fija el bug del catálogo: el admin guardaba el id, el público filtra por slug;
 * si difieren, el filtrado fallaba EN SILENCIO. El matcher tolerante lo cierra.
 *
 *   node --test tests/collection-match.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pieceInCollection, collectionOfPiece, piecesOfCollection } from '../js/core/collection-match.js';

const col = { id: 'col-abc123', slug: 'collares', name: 'Collares' };       // id != slug (el caso roto)
const colIgual = { id: 'anillos', slug: 'anillos', name: 'Anillos' };       // id == slug (el caso ok)

test('pieceInCollection: matchea por SLUG (lo que guarda la web)', () => {
    assert.equal(pieceInCollection({ collection: 'collares' }, col), true);
    assert.equal(pieceInCollection({ collection: 'anillos' }, colIgual), true);
});

test('pieceInCollection: matchea por ID (dato viejo del admin) — tolerante', () => {
    assert.equal(pieceInCollection({ collection: 'col-abc123' }, col), true);
});

test('pieceInCollection: NO matchea otra colección ni datos nulos', () => {
    assert.equal(pieceInCollection({ collection: 'aretes' }, col), false);
    assert.equal(pieceInCollection({ collection: null }, col), false);
    assert.equal(pieceInCollection(null, col), false);
    assert.equal(pieceInCollection({ collection: 'collares' }, null), false);
});

test('collectionOfPiece: resuelve el doc de la colección (slug o id)', () => {
    const cols = [col, colIgual];
    assert.equal(collectionOfPiece({ collection: 'collares' }, cols)?.id, 'col-abc123');
    assert.equal(collectionOfPiece({ collection: 'col-abc123' }, cols)?.slug, 'collares');
    assert.equal(collectionOfPiece({ collection: 'anillos' }, cols)?.slug, 'anillos');
    assert.equal(collectionOfPiece({ collection: 'nada' }, cols), null);
});

test('piecesOfCollection: filtra por slug O id resolviendo la colección', () => {
    const cols = [col, colIgual];
    const pieces = [
        { id: 'p1', collection: 'collares' },     // por slug
        { id: 'p2', collection: 'col-abc123' },   // por id (viejo)
        { id: 'p3', collection: 'anillos' },
        { id: 'p4', collection: 'aretes' },
    ];
    // Buscar por slug 'collares' debe traer p1 Y p2 (id viejo del mismo doc).
    assert.deepEqual(piecesOfCollection(pieces, cols, 'collares').map((p) => p.id), ['p1', 'p2']);
    // Buscar por el id también resuelve el mismo doc.
    assert.deepEqual(piecesOfCollection(pieces, cols, 'col-abc123').map((p) => p.id), ['p1', 'p2']);
    assert.deepEqual(piecesOfCollection(pieces, cols, 'anillos').map((p) => p.id), ['p3']);
    // Sin colecciones: fallback al match directo por el campo.
    assert.deepEqual(piecesOfCollection(pieces, null, 'collares').map((p) => p.id), ['p1']);
});
