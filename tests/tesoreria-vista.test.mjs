/**
 * VISTA de tesorería (B4) — agregaciones de tablero PURAS de `js/admin/tesoreria-format.js`:
 * `sumaSaldosReales` (parte de cuentas del "Plata total" de Hoy y del total de la página, inv.2)
 * y `throughputAnio` (V9: heads-up tributario de cuentas de socia). Sin espejo servidor a
 * propósito → test de unidad, no de paridad.
 *
 *   npm run test:teso-vista
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sumaSaldosReales, throughputAnio } from '../js/admin/tesoreria-format.js';

// ─── sumaSaldosReales ──────────────────────────────────────────────────────────
test('sumaSaldosReales · suma solo cuentas REALES activas; excluye virtuales e inactivas', () => {
    const cuentas = [
        { id: 'a', tipo: 'banco', activa: true,  saldoActual: { monto: 3_500_000 } },
        { id: 'b', tipo: 'nequi', activa: true,  saldoActual: { monto: 1_200_000 } },
        { id: 'c', tipo: 'banco', activa: false, saldoActual: { monto: 9_999_999 } },   // inactiva → NO cuenta
        { id: 'caja', tipo: 'caja',   saldoActual: { monto: 500_000 } },                 // virtual → NO cuenta
        { id: 'bov',  tipo: 'boveda', saldoActual: { monto: 800_000 } },                 // virtual → NO cuenta
    ];
    assert.equal(sumaSaldosReales(cuentas), 4_700_000);   // 3.5M + 1.2M
});

test('sumaSaldosReales · una cuenta en rojo baja el total (sin clamp, V6)', () => {
    const cuentas = [
        { id: 'a', tipo: 'banco', saldoActual: { monto: 1_000_000 } },
        { id: 'b', tipo: 'nequi', saldoActual: { monto: -1_800_000 } },   // negativa: resta
    ];
    assert.equal(sumaSaldosReales(cuentas), -800_000);
});

test('sumaSaldosReales · `activa` ausente = activa (default); saldoActual ausente = 0; robusto a basura', () => {
    const cuentas = [
        { id: 'a', tipo: 'banco', saldoActual: { monto: 100 } },   // sin `activa` → cuenta
        { id: 'b', tipo: 'nequi' },                                // sin saldoActual → 0
        null,                                                      // basura → se ignora
        { id: 'c', tipo: 'banco', saldoActual: 250 },              // entero desnudo → 250
    ];
    assert.equal(sumaSaldosReales(cuentas), 350);
});

test('sumaSaldosReales · lista vacía / no-array = 0', () => {
    assert.equal(sumaSaldosReales([]), 0);
    assert.equal(sumaSaldosReales(undefined), 0);
    assert.equal(sumaSaldosReales(null), 0);
});

// ─── throughputAnio (V9) ───────────────────────────────────────────────────────
test('throughputAnio · Σ |monto| de movimientos FIRMES del año (entradas y salidas)', () => {
    const movs = [
        { id: '1', tipo: 'aporte_socia', monto: { monto: 500_000 }, fecha: '2026-03-01', estado: 'activo' },
        { id: '2', tipo: 'retiro_socia', monto: { monto: 200_000 }, fecha: '2026-05-10', estado: 'activo' },
        { id: '3', tipo: 'aporte_socia', monto: { monto: 300_000 }, fecha: '2025-12-30', estado: 'activo' },   // otro año → NO
    ];
    assert.equal(throughputAnio(movs, 2026), 700_000);   // 500k + 200k (valor absoluto, ambos)
    assert.equal(throughputAnio(movs, '2026'), 700_000); // acepta 'YYYY'
    assert.equal(throughputAnio(movs, 2025), 300_000);
});

test('throughputAnio · pendientes y rechazados NO cuentan (no movieron plata)', () => {
    const movs = [
        { id: '1', tipo: 'aporte_socia', monto: { monto: 400_000 }, fecha: '2026-02-01', estado: 'activo' },
        { id: '2', tipo: 'retiro_socia', monto: { monto: 900_000 }, fecha: '2026-02-02', estado: 'pendiente_aprobacion' },
        { id: '3', tipo: 'retiro_socia', monto: { monto: 700_000 }, fecha: '2026-02-03', estado: 'rechazado' },
    ];
    assert.equal(throughputAnio(movs, 2026), 400_000);
});

test('throughputAnio · estado ausente = activo (default); robusto a fecha/monto faltantes y basura', () => {
    const movs = [
        { id: '1', tipo: 'aporte_socia', monto: { monto: 150_000 }, fecha: '2026-01-15' },   // sin estado → activo
        { id: '2', tipo: 'gasto', monto: { monto: 50_000 } },                                // sin fecha → no matchea año
        null,                                                                                // basura → se ignora
    ];
    assert.equal(throughputAnio(movs, 2026), 150_000);
});

test('throughputAnio · lista vacía / no-array = 0', () => {
    assert.equal(throughputAnio([], 2026), 0);
    assert.equal(throughputAnio(undefined, 2026), 0);
});
