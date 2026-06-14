/**
 * Categorías del Home dinámicas — mapeo colecciones→tarjetas (js/home/categories-data.js).
 * Fija el comportamiento CMS: derivar de las colecciones reales; NO-DEMO si no hay.
 *
 *   node --test tests/categories-data.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardsFrom } from '../js/home/categories-data.js';

test('sin colecciones → [] (NO-DEMO: la sección se oculta, no muestra demo)', () => {
    assert.deepEqual(cardsFrom([]), []);
    assert.deepEqual(cardsFrom(null), []);
    assert.deepEqual(cardsFrom(undefined), []);
});

test('deriva de las colecciones reales (name/slug/bannerUrl)', () => {
    const r = cardsFrom([{ name: 'Collares', slug: 'collares', bannerUrl: '/img/c.webp', featured: true }]);
    assert.equal(r.length, 1);
    assert.equal(r[0].name, 'Collares');
    assert.equal(r[0].slug, 'collares');
    assert.equal(r[0].img, '/img/c.webp');          // usa bannerUrl existente
    assert.equal(Number.isFinite(r[0].hue), true);
    assert.equal(r[0].pos, 'center');
});

test('honra hue/pos/img propios si la colección los define', () => {
    const r = cardsFrom([{ name: 'X', slug: 'x', img: '/i.webp', bannerUrl: '/b.webp', hue: 42, pos: 'top' }]);
    assert.equal(r[0].img, '/i.webp');              // img propio gana sobre bannerUrl
    assert.equal(r[0].hue, 42);
    assert.equal(r[0].pos, 'top');
});

test('hue por defecto rotativo cuando la colección no lo define', () => {
    const r = cardsFrom([{ slug: 'a' }, { slug: 'b' }]);
    assert.equal(Number.isFinite(r[0].hue), true);
    assert.equal(Number.isFinite(r[1].hue), true);
    assert.notEqual(r[0].hue, r[1].hue);            // paleta rota por índice
});

test('defaults seguros con campos faltantes', () => {
    const r = cardsFrom([{}]);
    assert.equal(r[0].name, 'Colección');
    assert.equal(r[0].slug, '');
    assert.equal(r[0].img, '');
    assert.equal(r[0].pos, 'center');
});
