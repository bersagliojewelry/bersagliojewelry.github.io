/**
 * safeUrl() — saneo de URLs para href/src (js/core/safe-url.js).
 * Cierra el vector stored-XSS que `escape()` (contexto-HTML) NO cubre cuando el
 * CMS expone URLs editables por rol `editor`.
 *
 *   node --test tests/safe-url.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safeUrl, isSafeUrl, safeLqip } from '../js/core/safe-url.js';

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

// ─── safeLqip() — placeholder difuso data:image (§103 F1) ───────────────────
test('safeLqip: acepta data:image base64 (webp/avif/jpeg/png)', () => {
    const webp = 'data:image/webp;base64,UklGRhYAAABXRUJQ';
    assert.equal(safeLqip(webp), webp);
    const jpeg = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
    assert.equal(safeLqip(jpeg), jpeg);
    assert.equal(safeLqip('data:image/png;base64,iVBORw0KGgo='), 'data:image/png;base64,iVBORw0KGgo=');
    assert.equal(safeLqip('data:image/avif;base64,AAAAHGZ0eXA='), 'data:image/avif;base64,AAAAHGZ0eXA=');
});

test('safeLqip: RECHAZA data:text/html y otros tipos no-imagen -> fallback', () => {
    assert.equal(safeLqip('data:text/html;base64,PHNjcmlwdD4='), '');
    assert.equal(safeLqip('data:image/svg+xml;base64,PHN2Zz4='), '');   // svg puede traer script
    assert.equal(safeLqip('data:application/json;base64,e30='), '');
});

test('safeLqip: RECHAZA contenido con comilla/paréntesis (anti-breakout de url())', () => {
    assert.equal(safeLqip("data:image/webp;base64,AAAA');background:red"), '');   // intento de breakout
    assert.equal(safeLqip('data:image/webp;base64,AAAA)evil'), '');
    assert.equal(safeLqip('data:image/webp;base64,AA AA'), '');                   // espacio no es base64
    assert.equal(safeLqip('https://evil.com/x.webp'), '');                        // URL normal no es LQIP
    assert.equal(safeLqip('javascript:alert(1)'), '');
});

test('safeLqip: entradas inválidas y cap de tamaño -> fallback', () => {
    assert.equal(safeLqip(null), '');
    assert.equal(safeLqip(undefined), '');
    assert.equal(safeLqip(123), '');
    assert.equal(safeLqip(''), '');
    const huge = 'data:image/webp;base64,' + 'A'.repeat(7000);   // supera el cap (6000)
    assert.equal(safeLqip(huge), '');
    assert.equal(safeLqip('data:image/webp;base64,AAAA', '#'), 'data:image/webp;base64,AAAA');  // válido ignora fallback
    assert.equal(safeLqip('nope', '#'), '#');                    // fallback custom
});
