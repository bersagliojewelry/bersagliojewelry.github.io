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
    visibilityStatus, visibilityCell,
} from '../js/admin/resource-admin-core.js';
import { isFilmComplete, isSocialComplete } from '../js/core/home-sections.js';

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

// ─── select (Red social) — opciones string|obj, escape, blank si opcional ────
test('fieldHTML select: opciones, data-field, sin blank si required', () => {
    const s = fieldHTML({ name: 'platform', label: 'Red', type: 'select', required: true, options: ['Instagram', 'TikTok'] });
    assert.match(s, /<select[^>]*data-field="platform"/);
    assert.match(s, /<option value="Instagram">Instagram<\/option>/);
    assert.doesNotMatch(s, /<option value=""><\/option>/);          // required → sin opción vacía
    const o = fieldHTML({ name: 'p', label: 'P', type: 'select', options: [{ value: 'a', label: 'A' }] });
    assert.match(o, /<option value=""><\/option>/);                 // opcional → opción vacía
    assert.match(o, /<option value="a">A<\/option>/);
});
test('fieldHTML select: escapa value/label (anti-inyección)', () => {
    const s = fieldHTML({ name: 'p', label: 'P', type: 'select', options: [{ value: '"><script>', label: '<b>x</b>' }] });
    assert.doesNotMatch(s, /<script>/);
    assert.doesNotMatch(s, /<b>x<\/b>/);
});

// ─── visibilityStatus / visibilityCell — "¿Se ve en la web?" (cero-ficción) ──
const filmVis = { minItems: 3, unit: 'videos', isComplete: isFilmComplete };

test('visibilityStatus: borrador → off (es un borrador)', () => {
    const st = visibilityStatus({ published: false, title: 'x', thumb: 't', href: 'h' }, filmVis, 5);
    assert.equal(st.state, 'off');
    assert.match(st.reason, /borrador/);
});
test('visibilityStatus: publicado pero incompleto → off + qué falta', () => {
    const st = visibilityStatus({ published: true, title: 'x' }, filmVis, 5);
    assert.equal(st.state, 'off');
    assert.match(st.reason, /miniatura/);
    assert.match(st.reason, /enlace/);
});
test('visibilityStatus: completo pero bajo el umbral → almost', () => {
    const st = visibilityStatus({ published: true, title: 'x', thumb: 't', href: 'h' }, filmVis, 2);
    assert.equal(st.state, 'almost');
    assert.match(st.reason, /te falta 1 /);
});
test('visibilityStatus: completo y umbral alcanzado → on', () => {
    const st = visibilityStatus({ published: true, title: 'x', thumb: 't', href: 'h' }, filmVis, 3);
    assert.equal(st.state, 'on');
    assert.equal(st.reason, '');
});
test('visibilityStatus social: red no soportada cuenta como incompleta', () => {
    const vis = { minItems: 4, unit: 'publicaciones', isComplete: isSocialComplete };
    const st = visibilityStatus({ published: true, thumb: 't', caption: 'c', platform: 'Threads' }, vis, 9);
    assert.equal(st.state, 'off');
    assert.match(st.reason, /red social/);
});
test('visibilityStatus social: sin enlace al post → off (href obligatorio)', () => {
    const vis = { minItems: 4, unit: 'publicaciones', isComplete: isSocialComplete };
    const st = visibilityStatus({ published: true, thumb: 't', caption: 'c', platform: 'Instagram' }, vis, 9);
    assert.equal(st.state, 'off');
    assert.match(st.reason, /enlace/);
});
test('visibilityCell: píldora por estado + razón escapada', () => {
    assert.match(visibilityCell({ state: 'on', label: 'Sí se ve', reason: '' }), /adm-pill--green/);
    assert.match(visibilityCell({ state: 'almost', label: 'Listo, casi', reason: 'x' }), /adm-pill--gold/);
    const off = visibilityCell({ state: 'off', label: 'No', reason: '<b>r</b>' });
    assert.match(off, /adm-pill--gray/);
    assert.doesNotMatch(off, /<b>r<\/b>/);                          // razón escapada
});
