/**
 * Tests de la aritmética de saldo (función PURA, sin emulador).
 *   node --test functions/saldo.test.mjs    (o: npm run test:saldo)
 *
 * Doctrina del proyecto: los saldos son EXACTOS como las matemáticas. Estos tests
 * fijan la convención de signo del CRM (ADR §43) y blindan el cálculo del Bloque 2.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import saldoMod from './saldo.js';

const { computeSaldo, aporteSaldo } = saldoMod;

test('saldo · sin movimientos = 0', () => {
    assert.equal(computeSaldo([]), 0);
    assert.equal(computeSaldo(undefined), 0);
    assert.equal(computeSaldo(null), 0);
});

test('saldo · una factura suma', () => {
    assert.equal(computeSaldo([{ tipo: 'factura', monto: 100000 }]), 100000);
});

test('saldo · apertura suma (saldo inicial migrado)', () => {
    assert.equal(computeSaldo([{ tipo: 'apertura', monto: 250000 }]), 250000);
});

test('saldo · abono resta', () => {
    assert.equal(computeSaldo([
        { tipo: 'factura', monto: 100000 },
        { tipo: 'abono', monto: 40000 },
    ]), 60000);
});

test('saldo · pago total deja 0', () => {
    assert.equal(computeSaldo([
        { tipo: 'factura', monto: 80000 },
        { tipo: 'abono', monto: 80000 },
    ]), 0);
});

test('saldo · sobrepago = saldo a favor (negativo)', () => {
    assert.equal(computeSaldo([
        { tipo: 'factura', monto: 50000 },
        { tipo: 'abono', monto: 70000 },
    ]), -20000);
});

test('saldo · apertura negativa = cliente arranca con saldo a favor', () => {
    assert.equal(computeSaldo([{ tipo: 'apertura', monto: -30000 }]), -30000);
});

test('saldo · ajuste positivo y negativo', () => {
    assert.equal(computeSaldo([
        { tipo: 'factura', monto: 100000 },
        { tipo: 'ajuste', monto: 5000 },
        { tipo: 'ajuste', monto: -2000 },
    ]), 103000);
});

test('saldo · movimiento anulado NO cuenta', () => {
    assert.equal(computeSaldo([
        { tipo: 'factura', monto: 100000 },
        { tipo: 'factura', monto: 999999, anulado: true },
        { tipo: 'abono', monto: 30000, anulado: true },
    ]), 100000);
});

test('saldo · escenario realista de cuenta corriente', () => {
    assert.equal(computeSaldo([
        { tipo: 'apertura', monto: 120000 },
        { tipo: 'factura', monto: 350000 },
        { tipo: 'abono', monto: 200000 },
        { tipo: 'factura', monto: 80000 },
        { tipo: 'abono', monto: 150000 },
        { tipo: 'ajuste', monto: -10000 },          // corrección a la baja
        { tipo: 'factura', monto: 60000, anulado: true }, // anulada por Kary
    ]), 190000);
});

test('saldo · defensivo: tipo desconocido, monto faltante o no-numérico aportan 0', () => {
    assert.equal(computeSaldo([
        { tipo: 'regalo', monto: 999 },     // tipo fuera del modelo
        { tipo: 'factura' },                // sin monto
        { tipo: 'factura', monto: 'caro' }, // monto no numérico
        { tipo: 'abono', monto: NaN },      // NaN
        { tipo: 'factura', monto: 1000 },   // único válido
    ]), 1000);
    assert.equal(aporteSaldo(null), 0);
    assert.equal(aporteSaldo({}), 0);
});

test('saldo · entero-COP: el saldo SIEMPRE es un peso entero (residuos flotantes redondean al peso)', () => {
    // 0.1 + 0.2 (artefacto flotante legacy) → redondea a 0 pesos, nunca fracciones
    assert.equal(computeSaldo([
        { tipo: 'factura', monto: 0.1 },
        { tipo: 'factura', monto: 0.2 },
    ]), 0);
    // half-up al peso completo
    assert.equal(computeSaldo([{ tipo: 'factura', monto: 1000.6 }]), 1001);
    // la suma de enteros queda entera
    assert.ok(Number.isInteger(computeSaldo([
        { tipo: 'factura', monto: 50000 },
        { tipo: 'abono', monto: 12345 },
    ])));
});
