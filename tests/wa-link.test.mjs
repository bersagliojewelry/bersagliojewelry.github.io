/**
 * waLink — enlace wa.me con mensaje pre-cargado (TODO-37 B0.5 "frena la fuga").
 * Fija: extracción de dígitos del número mostrado, encodeo del texto, y el caso sin texto.
 *
 *   node --test tests/wa-link.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { waLink, waHref } from '../js/core/global-defaults.js';

test('waLink: número mostrado → solo dígitos en wa.me', () => {
    assert.equal(waLink('+57 301 375 2592', 'Hola'), 'https://wa.me/573013752592?text=Hola');
});

test('waLink: sin texto → idéntico a waHref (sin ?text)', () => {
    assert.equal(waLink('+57 301 375 2592', ''), 'https://wa.me/573013752592');
    assert.equal(waLink('+57 301 375 2592'), waHref('+57 301 375 2592'));
});

test('waLink: encodea el mensaje (espacios, acentos, dos puntos, URL) → URL no se rompe', () => {
    const msg = 'Hola Bersaglio, me interesa esta pieza: Anillo Esmeralda (Ref. BJ-01). https://bersagliojewelry.co/pieza/anillo-esmeralda';
    const url = waLink('+57 301 375 2592', msg);
    // No deben quedar caracteres crudos que rompan el atributo href / la URL.
    assert.ok(!/\s/.test(url), 'no debe haber espacios sin encodear');
    assert.ok(!url.includes('?text=Hola Bersaglio'), 'el texto debe ir encodeado');
    // Decodificar el text= devuelve el mensaje original intacto.
    const decoded = decodeURIComponent(url.split('?text=')[1]);
    assert.equal(decoded, msg);
});

test('waLink: robusto a número vacío/nulo (no lanza, base wa.me/)', () => {
    assert.equal(waLink('', 'x'), 'https://wa.me/?text=x');
    assert.equal(waLink(null, ''), 'https://wa.me/');
});
