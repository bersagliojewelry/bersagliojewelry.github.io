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

// ─── F-TESORERÍA B5 (cierre) · el mismo control para el libro del BANCO ────────
const { compararSaldosCuentas } = reconMod;
const cta = (id, ini, act, extra = {}) => ({
    id, nombre: `Cuenta ${id}`, tipo: 'banco',
    saldoInicial: { monto: ini, moneda: 'COP' },
    ...(act === null ? {} : { saldoActual: { monto: act, moneda: 'COP' } }),
    ...extra,
});
const mov = (cuentaId, tipo, monto, extra = {}) => ({
    cuentaId, tipo, monto: { monto, moneda: 'COP' }, estado: 'activo', fecha: '2026-07-20', ...extra,
});

test('tesorería · cuentas cuadradas = sin descuadres', () => {
    const r = compararSaldosCuentas(
        [cta('A', 100000, 400000), cta('B', 0, 0)],
        new Map([['A', [mov('A', 'ingreso_venta', 300000)]]]),
    );
    assert.equal(r.ok, true);
    assert.equal(r.totalCuentas, 2);
    assert.equal(r.totalDescuadres, 0);
});

test('tesorería · el trigger falló en silencio → descuadre con la diferencia exacta', () => {
    const r = compararSaldosCuentas(
        [cta('A', 0, 0)],                                  // saldoActual quedó viejo
        new Map([['A', [mov('A', 'abono_cartera', 250000)]]]),
    );
    assert.equal(r.ok, false);
    assert.deepEqual(r.descuadres[0], {
        cuentaId: 'A', nombre: 'Cuenta A', saldoGuardado: 0, saldoCalculado: 250000, diferencia: 250000,
    });
});

test('tesorería · las VIRTUALES (caja/bóveda) se saltan: su plata la cuadra su propio módulo', () => {
    const r = compararSaldosCuentas(
        [{ id: 'caja', nombre: 'Caja', tipo: 'caja' }, { id: 'bov', nombre: 'Bóveda', tipo: 'boveda' }, cta('A', 0, 0)],
        new Map(),
    );
    assert.equal(r.totalCuentas, 1, 'solo la cuenta REAL entra al control');
    assert.equal(r.ok, true);
});

test('tesorería · cuenta NUEVA sin saldoActual todavía → NO es falsa alarma', () => {
    // Kary crea la cuenta con $500.000 de arranque; el trigger aún no ha corrido.
    const r = compararSaldosCuentas([cta('A', 500000, null)], new Map());
    assert.equal(r.ok, true, 'sin saldoActual se compara contra el saldoInicial, no contra 0');
});

test('tesorería · lo que NO es plata firme no cuenta (anulado/pendiente/rechazado)', () => {
    const r = compararSaldosCuentas(
        [cta('A', 0, 100000)],
        new Map([['A', [
            mov('A', 'ingreso_venta', 100000),
            mov('A', 'abono_cartera', 999000, { estado: 'anulado' }),        // D9: sellado al anular el abono
            mov('A', 'retiro_socia', 500000, { estado: 'pendiente_aprobacion' }),
            mov('A', 'ajuste_conciliacion', 700000, { estado: 'rechazado', direccion: 'entrada' }),
        ]]]),
    );
    assert.equal(r.ok, true, 'solo suma lo activo — misma regla que el saldo de la pantalla');
});

test('tesorería · movimientos huérfanos (su cuenta ya no existe) se ignoran', () => {
    const r = compararSaldosCuentas([cta('A', 0, 0)], new Map([['ZZZ', [mov('ZZZ', 'ingreso_venta', 999)]]]));
    assert.equal(r.ok, true);
});

test('tesorería · sin cuentas → cuadrado (estado-cero honesto, no explota)', () => {
    const r = compararSaldosCuentas([], new Map());
    assert.deepEqual({ ok: r.ok, totalCuentas: r.totalCuentas, totalDescuadres: r.totalDescuadres },
        { ok: true, totalCuentas: 0, totalDescuadres: 0 });
});
