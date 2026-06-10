/**
 * Tests del banner de truncado (HTML puro, sin DOM ni Firestore).
 *   node --test tests/truncado.test.mjs    (o: npm run test:truncado)
 *
 * Fija el contrato del aviso §9.1: qué ve Kary cuando un listener llega a su
 * tope (datos incompletos) y que el contenido va escapado.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { truncadoBannerHTML } from '../js/admin/truncado.js';

test('banner · nombra el origen truncado', () => {
    const html = truncadoBannerHTML(new Set(['Clientes']));
    assert.match(html, /Clientes/);
    assert.match(html, /más registros de los que el panel puede cargar/);
});

test('banner · varios orígenes se listan separados', () => {
    const html = truncadoBannerHTML(new Set(['Clientes', 'Bandeja (leads)']));
    assert.match(html, /Clientes · Bandeja \(leads\)/);
});

test('banner · botón de cierre presente (no es un toast efímero)', () => {
    const html = truncadoBannerHTML(new Set(['Clientes']));
    assert.match(html, /data-truncado-cerrar/);
});

test('banner · el origen va escapado (defensa de atributo/HTML)', () => {
    const html = truncadoBannerHTML(new Set(['<img src=x onerror=alert(1)>']));
    assert.doesNotMatch(html, /<img/);
    assert.match(html, /&lt;img/);
});
