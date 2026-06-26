/**
 * Unit tests de calcularNeto (B1 paso 6). PURO → sin emulador.
 *   node --test tests/fiscal.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularNeto, FISCAL_DEFAULT } from '../js/admin/fiscal.js';

test('efectivo: sin comisión ni retenciones → neto = bruto', () => {
    const r = calcularNeto({ bruto: 2000000, medio: 'efectivo' });
    assert.equal(r.comisionWompi, 0);
    assert.equal(r.neto, 2000000);
});

test('transferencia: sin comisión Wompi → neto = bruto', () => {
    const r = calcularNeto({ bruto: 1000000, medio: 'transferencia' });
    assert.equal(r.comisionWompi, 0);
    assert.equal(r.neto, 1000000);
});

test('wompi: comisión = (bruto·2,65% + $700)·1,19; neto = bruto − comisión', () => {
    const r = calcularNeto({ bruto: 1000000, medio: 'wompi' });
    // (1000000*0.0265 + 700) * 1.19 = (26500 + 700) * 1.19 = 27200 * 1.19 = 32368
    assert.equal(r.comisionWompi, 32368);
    assert.equal(r.neto, 1000000 - 32368);
});

test('retenciones por parámetro (contador): ReteFuente y ReteICA se restan del bruto', () => {
    const r = calcularNeto({
        bruto: 2000000, medio: 'efectivo',
        fiscal: { ...FISCAL_DEFAULT, reteFuentePct: 0.025, reteIcaXMil: 7 },   // 2,5% + 7‰
    });
    assert.equal(r.reteFuente, 50000);   // 2000000 * 0.025
    assert.equal(r.reteIca, 14000);      // 2000000 * 7/1000
    assert.equal(r.neto, 2000000 - 50000 - 14000);
});

test('valores inválidos → 0 (no rompe)', () => {
    const r = calcularNeto({ bruto: 'abc', medio: 'wompi' });
    assert.equal(r.bruto, 0);
    assert.equal(r.neto, 0);
});
