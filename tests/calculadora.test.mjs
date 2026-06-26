/**
 * Calculadora de precio por peso (B1 paso 2): total = peso × valor_gramo + mano_obra.
 * Función PURA (sin DOM). El valor del gramo es input de Kary (varía); enteros COP.
 *
 *   node --test tests/calculadora.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularPrecio } from '../js/admin/calculadora.js';

test('calcularPrecio: peso × gramo + mano de obra (caso real)', () => {
    const r = calcularPrecio({ valorGramo: 350000, peso: 5.2, manoObra: 200000 });
    assert.equal(r.oro, 1820000);
    assert.equal(r.mano, 200000);
    assert.equal(r.total, 2020000);
});

test('calcularPrecio: peso decimal redondea a entero COP', () => {
    assert.equal(calcularPrecio({ valorGramo: 1000, peso: 1.5, manoObra: 0 }).total, 1500);
    assert.equal(calcularPrecio({ valorGramo: 1, peso: 2.5, manoObra: 0 }).oro, 3);   // Math.round(2.5)=3
});

test('calcularPrecio: sin mano de obra → total = oro', () => {
    const r = calcularPrecio({ valorGramo: 300000, peso: 4, manoObra: '' });
    assert.equal(r.total, 1200000);
    assert.equal(r.mano, 0);
});

test('calcularPrecio: solo mano de obra (sin peso/gramo) → total = mano', () => {
    assert.equal(calcularPrecio({ valorGramo: 0, peso: 0, manoObra: 150000 }).total, 150000);
});

test('calcularPrecio: entradas inválidas/negativas → 0 (no NaN)', () => {
    assert.deepEqual(calcularPrecio({ valorGramo: -5, peso: 'x', manoObra: NaN }), { oro: 0, mano: 0, total: 0 });
    assert.deepEqual(calcularPrecio({}), { oro: 0, mano: 0, total: 0 });
    assert.deepEqual(calcularPrecio(), { oro: 0, mano: 0, total: 0 });
});

test('calcularPrecio: acepta strings (vienen de los inputs del form)', () => {
    assert.equal(calcularPrecio({ valorGramo: '350000', peso: '2', manoObra: '100000' }).total, 800000);
});
