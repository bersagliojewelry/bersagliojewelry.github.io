// Test puro del color del oro (TODO-59) — sin DOM ni red. node --test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { metalConColor, metalColorLabel } from '../js/core/metal.js';

test('metalConColor: inserta el color tras "Oro" → "Oro blanco 18k"', () => {
  assert.equal(metalConColor({ metal: 'Oro 18k', metalColor: 'blanco' }), 'Oro blanco 18k');
  assert.equal(metalConColor({ metal: 'Oro 14k', metalColor: 'rosa' }), 'Oro rosa 14k');
  assert.equal(metalConColor({ metal: 'Oro 18k', metalColor: 'amarillo' }), 'Oro amarillo 18k');
});

test('metalConColor: sin color (o inválido) → el metal tal cual', () => {
  assert.equal(metalConColor({ metal: 'Oro 18k' }), 'Oro 18k');
  assert.equal(metalConColor({ metal: 'Oro 18k', metalColor: '' }), 'Oro 18k');
  assert.equal(metalConColor({ metal: 'Oro 18k', metalColor: 'verde' }), 'Oro 18k');   // no es color de oro
  assert.equal(metalConColor({}), '');
});

test('metalConColor: no duplica si el texto ya dice el color', () => {
  assert.equal(metalConColor({ metal: 'Oro blanco 18k', metalColor: 'blanco' }), 'Oro blanco 18k');
});

test('metalConColor: el color de oro NO aplica a no-oro (platino/plata)', () => {
  assert.equal(metalConColor({ metal: 'Platino', metalColor: 'blanco' }), 'Platino');
  assert.equal(metalConColor({ metal: 'Plata 950', metalColor: 'amarillo' }), 'Plata 950');
});

test('metalColorLabel: normaliza válidos; vacío para no-válidos', () => {
  assert.equal(metalColorLabel({ metalColor: 'BLANCO' }), 'blanco');
  assert.equal(metalColorLabel({ metalColor: 'amarillo' }), 'amarillo');
  assert.equal(metalColorLabel({ metalColor: 'verde' }), '');
  assert.equal(metalColorLabel({}), '');
});
