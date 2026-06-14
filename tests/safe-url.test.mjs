/**
 * safeUrl() — saneo de URLs para href/src (js/core/safe-url.js).
 * Cierra el vector stored-XSS que `escape()` (contexto-HTML) NO cubre cuando el
 * CMS expone URLs editables por rol `editor`.
 *
 *   node --test tests/safe-url.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safeUrl, isSafeUrl } from '../js/core/safe-url.js';

test('permite esquemas seguros (http/https/mailto/tel)', () => {
    assert.equal(safeUrl('https://instagram.com/bersaglio'), 'https://instagram.com/bersaglio');
    assert.equal(safeUrl('http://example.com/x.jpg'), 'http://example.com/x.jpg');
    assert.equal(safeUrl('mailto:hola@bersagliojewelry.co'), 'mailto:hola@bersagliojewelry.co');
    assert.equal(safeUrl('tel:+573001234567'), 'tel:+573001234567');
});

test('permite rutas relativas same-origin (imágenes locales)', () => {
    assert.equal(safeUrl('/img/banner-hero.avif'), '/img/banner-hero.avif');
    assert.equal(safeUrl('./foto.webp'), './foto.webp');
    assert.equal(safeUrl('../assets/x.png'), '../assets/x.png');
    assert.equal(safeUrl('#seccion'), '#seccion');
    assert.equal(safeUrl('?q=anillos'), '?q=anillos');
});

test('RECHAZA javascript:/data:/vbscript: (el vector XSS) -> fallback', () => {
    assert.equal(safeUrl('javascript:alert(1)'), '');
    assert.equal(safeUrl('JavaScript:alert(1)'), '');                 // mayúsculas
    assert.equal(safeUrl('data:text/html,<script>alert(1)</script>'), '');
    assert.equal(safeUrl('vbscript:msgbox(1)'), '');
    assert.equal(safeUrl('  javascript:alert(1)'), '');               // espacio inicial
});

test('RECHAZA evasión por whitespace/control en el esquema (java\\tscript:)', () => {
    assert.equal(safeUrl('java\tscript:alert(1)'), '');
    assert.equal(safeUrl('java\nscript:alert(1)'), '');
    assert.equal(safeUrl('  jav\tas cript:alert(1)  '), '');
});

test('entradas inválidas -> fallback', () => {
    assert.equal(safeUrl(null), '');
    assert.equal(safeUrl(undefined), '');
    assert.equal(safeUrl(123), '');
    assert.equal(safeUrl(''), '');
    assert.equal(safeUrl('   '), '');
    assert.equal(safeUrl('javascript:alert(1)', '#'), '#');           // fallback custom
});

test('isSafeUrl: gate booleano', () => {
    assert.equal(isSafeUrl('https://x.com'), true);
    assert.equal(isSafeUrl('/img/x.jpg'), true);
    assert.equal(isSafeUrl('javascript:alert(1)'), false);
    assert.equal(isSafeUrl(null), false);
});
