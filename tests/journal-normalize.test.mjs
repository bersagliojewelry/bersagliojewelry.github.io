/**
 * Normalización del journal (Firestore → forma de display).
 *   node --test tests/journal-normalize.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isoToDisplay, normalizeEntry } from '../js/data/journal-normalize.js';

test('isoToDisplay: ISO válido → short DD·MM·YY + long Mes Año', () => {
    assert.deepEqual(isoToDisplay('2026-06-14'), { short: '14·06·26', long: 'Junio 2026' });
    assert.deepEqual(isoToDisplay('2025-12-31'), { short: '31·12·25', long: 'Diciembre 2025' });
});

test('isoToDisplay: entradas inválidas → vacío (no rompe el render)', () => {
    assert.deepEqual(isoToDisplay(''), { short: '', long: '' });
    assert.deepEqual(isoToDisplay(null), { short: '', long: '' });
    assert.deepEqual(isoToDisplay('14/06/2026'), { short: '', long: '' });
    assert.deepEqual(isoToDisplay('2026-13-40'), { short: '40·13·26', long: '2026' }); // mes fuera de rango → long sin mes
});

test('normalizeEntry: mapea doc Firestore a la forma de las páginas', () => {
    const e = normalizeEntry({
        id: 'alma-verde', title: 'El alma verde', section: 'Reportaje',
        date: '2026-06-14', image: '/img/x.webp', featured: true, body: 'Hola.\n\nMundo.',
    });
    assert.equal(e.slug, 'alma-verde');         // id como slug si no hay slug propio
    assert.equal(e.title, 'El alma verde');
    assert.equal(e.date, '14·06·26');
    assert.equal(e.dateLong, 'Junio 2026');
    assert.equal(e.featured, true);
    assert.equal(e.body, 'Hola.\n\nMundo.');
});

test('normalizeEntry: campos ausentes → strings vacíos (sin undefined)', () => {
    const e = normalizeEntry({ id: 'x', title: 'X' });
    assert.equal(e.section, '');
    assert.equal(e.excerpt, '');
    assert.equal(e.image, '');
    assert.equal(e.featured, false);
    assert.equal(e.date, '');
    assert.equal(e.slug, 'x');
});

test('normalizeEntry: slug propio gana al id', () => {
    assert.equal(normalizeEntry({ id: 'doc123', slug: 'mi-slug', title: 'T' }).slug, 'mi-slug');
});
