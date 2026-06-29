// Test puro del buscador por código (TODO-58) — sin DOM ni red. node --test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCodigo, resolverCodigo } from '../js/core/codigo-util.js';

const PIECES = [
  { code: '0953', slug: 'anillo-diamante-natural-0953' },
  { code: '1008', slug: 'anillo-diamante-natural-1008' },
];
const lookup = (c) => PIECES.find(p => p.code === c) || null;

test('normalizeCodigo: trim + colapsa espacios; vacío/null → ""', () => {
  assert.equal(normalizeCodigo('  0953 '), '0953');
  assert.equal(normalizeCodigo('09 53'), '0953');   // el cliente lo teclea con espacio
  assert.equal(normalizeCodigo(''), '');
  assert.equal(normalizeCodigo(null), '');
  assert.equal(normalizeCodigo(undefined), '');
});

test('resolverCodigo: código vacío → status "empty" (no navega)', () => {
  assert.deepEqual(resolverCodigo('   ', lookup), { status: 'empty', code: '' });
});

test('resolverCodigo: código real → "found" con la URL canónica de la pieza', () => {
  const r = resolverCodigo('0953', lookup);
  assert.equal(r.status, 'found');
  assert.equal(r.code, '0953');
  assert.equal(r.url, '/pieza/anillo-diamante-natural-0953.html');
});

test('resolverCodigo: tolera espacios alrededor (Kary dicta con pausa)', () => {
  const r = resolverCodigo(' 0953 ', lookup);
  assert.equal(r.status, 'found');
  assert.equal(r.url, '/pieza/anillo-diamante-natural-0953.html');
});

test('resolverCodigo: código inexistente (typo) → "notfound" con el código tecleado', () => {
  const r = resolverCodigo('9999', lookup);
  assert.equal(r.status, 'notfound');
  assert.equal(r.code, '9999');
  assert.equal(r.url, undefined);
});
