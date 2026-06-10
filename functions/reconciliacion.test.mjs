/**
 * Tests de la reconciliación de cartera (función PURA, sin emulador).
 *   node --test functions/reconciliacion.test.mjs    (o: npm run test:reconciliacion)
 *
 * Fija la política de descuadres del frente D (F6): qué cuenta como descuadre,
 * cómo se tratan los bordes (cliente sin movimientos, sin saldoActual, movimientos
 * anulados, huérfanos) y la forma exacta del reporte que consume la vista Salud.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import reconMod from './reconciliacion.js';

const { compararSaldos } = reconMod;

test('reconciliación · cartera cuadrada = sin descuadres', () => {
    const clientes = [
        { id: 'a', nombre: 'Ana', saldoActual: 100000 },
        { id: 'b', nombre: 'Bea', saldoActual: 0 },
    ];
    const movs = new Map([
        ['a', [{ tipo: 'factura', monto: 150000 }, { tipo: 'abono', monto: 50000 }]],
        ['b', []],
    ]);
    const r = compararSaldos(clientes, movs);
    assert.equal(r.ok, true);
    assert.equal(r.totalClientes, 2);
    assert.equal(r.totalDescuadres, 0);
    assert.deepEqual(r.descuadres, []);
});

test('reconciliación · detecta saldo guardado distinto al calculado', () => {
    const clientes = [{ id: 'a', nombre: 'Ana', saldoActual: 90000 }];
    const movs = new Map([['a', [{ tipo: 'factura', monto: 100000 }]]]);
    const r = compararSaldos(clientes, movs);
    assert.equal(r.ok, false);
    assert.equal(r.totalDescuadres, 1);
    assert.deepEqual(r.descuadres[0], {
        clienteId: 'a', nombre: 'Ana',
        saldoGuardado: 90000, saldoCalculado: 100000, diferencia: 10000,
    });
});

test('reconciliación · cliente sin movimientos con saldo guardado ≠ 0 descuadra', () => {
    const r = compararSaldos([{ id: 'a', nombre: 'Ana', saldoActual: 5000 }], new Map());
    assert.equal(r.totalDescuadres, 1);
    assert.equal(r.descuadres[0].saldoCalculado, 0);
    assert.equal(r.descuadres[0].diferencia, -5000);
});

test('reconciliación · cliente sin saldoActual (legacy) se trata como 0 guardado', () => {
    // Sin movimientos y sin saldoActual → cuadra (0 == 0).
    const cuadra = compararSaldos([{ id: 'a', nombre: 'Ana' }], new Map());
    assert.equal(cuadra.ok, true);
    // Con movimientos y sin saldoActual → descuadra (la CF nunca corrió).
    const movs = new Map([['a', [{ tipo: 'factura', monto: 80000 }]]]);
    const falla = compararSaldos([{ id: 'a', nombre: 'Ana' }], movs);
    assert.equal(falla.totalDescuadres, 1);
    assert.equal(falla.descuadres[0].saldoGuardado, 0);
});

test('reconciliación · movimientos anulados no cuentan (misma regla que el saldo)', () => {
    const clientes = [{ id: 'a', nombre: 'Ana', saldoActual: 100000 }];
    const movs = new Map([['a', [
        { tipo: 'factura', monto: 100000 },
        { tipo: 'factura', monto: 999999, anulado: true },
    ]]]);
    assert.equal(compararSaldos(clientes, movs).ok, true);
});

test('reconciliación · movimientos huérfanos (cliente borrado) se ignoran', () => {
    const movs = new Map([['fantasma', [{ tipo: 'factura', monto: 50000 }]]]);
    const r = compararSaldos([], movs);
    assert.equal(r.ok, true);
    assert.equal(r.totalClientes, 0);
});

test('reconciliación · varios clientes: solo reporta los descuadrados', () => {
    const clientes = [
        { id: 'a', nombre: 'Ana', saldoActual: 100000 },
        { id: 'b', nombre: 'Bea', saldoActual: 1 },       // descuadre
        { id: 'c', nombre: 'Cleo', saldoActual: -20000 }, // saldo a favor, cuadra
    ];
    const movs = new Map([
        ['a', [{ tipo: 'factura', monto: 100000 }]],
        ['b', [{ tipo: 'factura', monto: 30000 }, { tipo: 'abono', monto: 30000 }]],
        ['c', [{ tipo: 'apertura', monto: -20000 }]],
    ]);
    const r = compararSaldos(clientes, movs);
    assert.equal(r.totalClientes, 3);
    assert.equal(r.totalDescuadres, 1);
    assert.equal(r.descuadres[0].clienteId, 'b');
});

test('reconciliación · acepta objeto plano además de Map', () => {
    const r = compararSaldos(
        [{ id: 'a', nombre: 'Ana', saldoActual: 70000 }],
        { a: [{ tipo: 'factura', monto: 70000 }] },
    );
    assert.equal(r.ok, true);
});

test('reconciliación · entradas inválidas no rompen', () => {
    assert.equal(compararSaldos(null, null).totalClientes, 0);
    assert.equal(compararSaldos(undefined, undefined).ok, true);
});
