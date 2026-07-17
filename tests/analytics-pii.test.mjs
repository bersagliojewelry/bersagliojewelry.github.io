/**
 * analytics-pii.test.mjs — el guard anti-PII de la analítica (§189).
 *
 * Por qué existe: `js/analytics.js` mandaba `email: e.detail` a GA4 en el lead de newsletter →
 * PII a un tercero (los Términos de GA4 lo prohíben: puede costar la cuenta/los datos; y en
 * Colombia = dato personal sin base legal, Ley 1581). El fix no fue solo limpiar el callsite:
 * el guard vive en `track()` para que ningún callsite futuro pueda filtrar.
 *
 * El caso que este test protege de verdad: `item_name` (el nombre de la JOYA) DEBE sobrevivir.
 * Un filtro por substring "name" lo mataría y dejaría la atribución por producto inservible —
 * o sea, "arreglar" la privacidad rompiendo justo lo que se quería medir.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stripPII } from '../js/core/analytics-pii.js';

test('borra el email del lead de newsletter (la fuga real que se corrigió)', () => {
    assert.deepEqual(stripPII({ lead_type: 'newsletter', email: 'kary@cliente.com' }), { lead_type: 'newsletter' });
});

test('CONSERVA item_name/item_category: la joya no es PII (si esto se rompe, medir no sirve)', () => {
    const out = stripPII({
        currency: 'COP',
        items: [{ item_id: 'anillo-diamante-natural-0953', item_name: 'Puro Albor', item_category: 'Anillos' }],
    });
    assert.equal(out.items[0].item_name, 'Puro Albor');
    assert.equal(out.items[0].item_category, 'Anillos');
    assert.equal(out.items[0].item_id, 'anillo-diamante-natural-0953');
    assert.equal(out.currency, 'COP');
});

test('corta PII de persona por clave exacta', () => {
    const out = stripPII({
        lead_type: 'mensaje',
        name: 'Daniel Romero', phone: '3001234567', cedula: '1020304050',
        address: 'Cra 1 #2-3', direccion: 'Centro', legal_id: 'CC123', password: 'x',
    });
    assert.deepEqual(out, { lead_type: 'mensaje' });
});

test('corta un email colado en una clave no listada (defensa por valor)', () => {
    assert.deepEqual(stripPII({ place: 'ficha', nota: 'escríbeme a kary@bersaglio.co' }), { place: 'ficha' });
});

test('es case-insensitive en las claves', () => {
    assert.deepEqual(stripPII({ Email: 'a@b.co', PHONE: '300', Nombre: 'X', ok: 1 }), { ok: 1 });
});

test('limpia PII anidada dentro de items[]', () => {
    assert.deepEqual(
        stripPII({ items: [{ item_id: 'x', email: 'a@b.co', item_name: 'Joya' }] }),
        { items: [{ item_id: 'x', item_name: 'Joya' }] },
    );
});

test('no muta el objeto de entrada', () => {
    const input = { lead_type: 'newsletter', email: 'a@b.co' };
    stripPII(input);
    assert.equal(input.email, 'a@b.co', 'stripPII no debe mutar al llamador');
});

test('deja pasar los params legítimos del lead de contacto (no rompe lo que ya funciona)', () => {
    const out = stripPII({ lead_type: 'visita', piece_slug: 'anillo-esmeralda-natural-0963' });
    assert.deepEqual(out, { lead_type: 'visita', piece_slug: 'anillo-esmeralda-natural-0963' });
});

test('conserva los params de whatsapp_click (el lead real en Colombia)', () => {
    const out = stripPII({
        place: 'ficha',
        items: [{ item_id: 'anillo-rubi-0954', item_name: 'Brasa', item_category: 'Anillos' }],
    });
    assert.equal(out.place, 'ficha');
    assert.equal(out.items[0].item_name, 'Brasa');
});

test('tolera valores nulos/primitivos sin reventar', () => {
    assert.deepEqual(stripPII({ a: null, b: 0, c: false }), { a: null, b: 0, c: false });
    assert.equal(stripPII('texto'), 'texto');
    assert.equal(stripPII(42), 42);
});
