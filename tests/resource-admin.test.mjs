/**
 * Motor CRUD genérico de contenido (BLOQUEANTE #2b) — núcleo PURO.
 *   node --test tests/resource-admin.test.mjs
 *
 * Verifica las piezas testeables sin DOM/Firebase: slug + id anti-colisión,
 * coerción/whitelist de valores, y el render de celdas/campos con escape +
 * safeUrl (anti stored-XSS, BLOQUEANTE #1 del comité).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    slugify, nextSlugId, coerceValues, cellText, fieldHTML, formFieldsHTML,
} from '../js/admin/resource-admin-core.js';

test('slugify: minúsculas, acentos y espacios → slug limpio', () => {
    assert.equal(slugify('Anillos de Compromiso'), 'anillos-de-compromiso');
    assert.equal(slugify('Esmeraldas Únicas — 2026'), 'esmeraldas-unicas-2026');
    assert.equal(slugify('  Hólá  Múndo  '), 'hola-mundo');
    assert.equal(slugify(''), '');
    assert.equal(slugify(null), '');
});

test('nextSlugId: libre vs colisión con sufijo numérico', () => {
    assert.equal(nextSlugId('Mi Entrada', []), 'mi-entrada');
    assert.equal(nextSlugId('Mi Entrada', ['mi-entrada']), 'mi-entrada-2');
    assert.equal(nextSlugId('Mi Entrada', ['mi-entrada', 'mi-entrada-2']), 'mi-entrada-3');
    assert.equal(nextSlugId('   ', []), '');                       // sin base → ''
});

test('coerceValues: tipos por campo + whitelist (ignora claves no declaradas)', () => {
    const fields = [
        { name: 'title', type: 'text' },
        { name: 'published', type: 'checkbox' },
        { name: 'order', type: 'number' },
    ];
    const out = coerceValues(
        { title: '  Hola  ', published: true, order: '5', hacker: 'DROP TABLE' },
        fields
    );
    assert.deepEqual(out, { title: 'Hola', published: true, order: 5 });
    assert.equal('hacker' in out, false);                          // no declarado → fuera
});

test('coerceValues: number inválido → null; checkbox falsy → false', () => {
    const fields = [{ name: 'order', type: 'number' }, { name: 'pub', type: 'checkbox' }];
    assert.deepEqual(coerceValues({ order: 'abc', pub: undefined }, fields), { order: null, pub: false });
});

test('cellText badge/date/text: escapa y formatea', () => {
    assert.match(cellText({ ok: true }, { key: 'ok', type: 'badge', on: 'Sí', off: 'No' }), /adm-pill--green/);
    assert.match(cellText({ ok: false }, { key: 'ok', type: 'badge' }), /adm-pill--gray/);
    assert.match(cellText({ d: '2026-06-14' }, { key: 'd', type: 'date' }), /2026/);
    assert.equal(cellText({ t: '<b>x</b>' }, { key: 't', type: 'text' }), '&lt;b&gt;x&lt;/b&gt;');
});

test('cellText thumb: safeUrl bloquea javascript: (stored-XSS)', () => {
    const evil = cellText({ img: 'javascript:alert(1)' }, { key: 'img', type: 'thumb' });
    assert.doesNotMatch(evil, /javascript:/);                     // neutralizado por safeUrl
    const ok = cellText({ img: 'https://x.com/a.webp' }, { key: 'img', type: 'thumb' });
    assert.match(ok, /https:\/\/x\.com\/a\.webp/);
});

test('fieldHTML: data-field presente y label escapado; checkbox tiene su forma', () => {
    const t = fieldHTML({ name: 'title', label: 'Tí"tulo', type: 'text' });
    assert.match(t, /data-field="title"/);
    assert.match(t, /T&#0?39;|Tí&quot;tulo/);                     // comilla del label escapada
    const c = fieldHTML({ name: 'pub', label: 'Publicar', type: 'checkbox' });
    assert.match(c, /type="checkbox"/);
    assert.match(c, /data-field="pub"/);
});

test('formFieldsHTML: una fila por campo', () => {
    const html = formFieldsHTML([
        { name: 'a', label: 'A', type: 'text' },
        { name: 'b', label: 'B', type: 'textarea' },
    ]);
    assert.equal((html.match(/adm-form-row/g) || []).length, 2);
    assert.match(html, /<textarea/);
});
