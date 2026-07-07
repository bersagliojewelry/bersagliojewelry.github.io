/**
 * Tests del dedup BLANDO client-side del POS (F2.1). node --test tests/advisory-match.test.mjs
 *   (o: npm run test:advisory). Advisory: alimenta el aviso "¿es la misma?" + typeahead + máscara PII.
 *   NO es la clave canónica (esa vive en el server) — ver frontera en advisory-match.js.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advisoryPhone, advisoryName, advisoryMatchHint, filterClientes, maskDoc, maskPhone } from '../js/admin/advisory-match.js';

const clientes = [
    { id: 'a', nombre: 'Ana María Gómez', telefono: '3009998877', docKeys: ['CC:1032456789'], activo: true },
    { id: 'b', nombre: 'Ana G.', whatsapp: '+57 300 999 8877', activo: true },
    { id: 'c', nombre: 'Bruno Díaz', telefono: '3105550000', activo: true },
    { id: 'd', nombre: 'Vieja Inactiva', telefono: '3009998877', activo: false },
];

test('advisoryPhone · dígitos + quita prefijo 57', () => {
    assert.equal(advisoryPhone('+57 300 999 8877'), '3009998877');
    assert.equal(advisoryPhone('(300) 999-8877'), '3009998877');
});

test('advisoryName · minúsculas sin tildes', () => {
    assert.equal(advisoryName('Ana  MARÍA '), 'ana maria');
    assert.equal(advisoryName('Díaz'), 'diaz');
});

test('advisoryMatchHint · avisa por teléfono (b comparte el de a) e ignora inactivos', () => {
    const hints = advisoryMatchHint(clientes, { telefono: '3009998877', nombre: 'Ana Gómez' });
    const ids = hints.map((h) => h.clienteId);
    assert.ok(ids.includes('a'));
    assert.ok(ids.includes('b'));      // mismo teléfono normalizado (whatsapp con prefijo 57)
    assert.ok(!ids.includes('d'));     // inactivo excluido
});

test('advisoryMatchHint · sin coincidencia → vacío', () => {
    assert.deepEqual(advisoryMatchHint(clientes, { telefono: '3001112222', nombre: 'Zzz' }), []);
});

test('filterClientes · por nombre, teléfono y sufijo de documento', () => {
    assert.deepEqual(filterClientes(clientes, 'ana').map((c) => c.id).sort(), ['a', 'b']);
    assert.deepEqual(filterClientes(clientes, '5550').map((c) => c.id), ['c']);
    assert.deepEqual(filterClientes(clientes, '456789').map((c) => c.id), ['a']);   // sufijo cédula
    assert.deepEqual(filterClientes(clientes, ''), []);
});

test('maskDoc / maskPhone · solo últimos 4', () => {
    assert.equal(maskDoc('CC:1032456789'), 'CC ···6789');
    assert.equal(maskPhone('+57 300 999 8877'), '··· ·· 8877');
    assert.equal(maskDoc(''), '');
});
