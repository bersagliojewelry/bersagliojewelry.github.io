/**
 * Tests del núcleo PURO de tesorería (sin emulador).
 *   node --test functions/tesoreria-core.test.mjs   (o: npm run test:tesoreria)
 *
 * Fijan la fórmula de saldo por recompute (D5) y sus invariantes de dinero (auditoria-financiera):
 *   #1 conservación por signo · #7 anomalía que GRITA (fail-red) · plata firme (pendiente no cuenta).
 * SSoT: docs/superpowers/specs/2026-07-18-f-tesoreria-DISENO.md (§0.5 D5 · §1 · V1/V3/V20). [OPUS-4.8]
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import core from './tesoreria-core.js';

const { SIGNO_TESORERIA, TIPOS_MOV, computeSaldoCuenta, signoDeMovimiento, entero, TesoreriaError } = core;

// ─── entero (T-3: pesos sin centavos, desenvuelve {monto}) ──────────────────────
test('entero · desenvuelve {monto:int} y acepta int desnudo', () => {
    assert.equal(entero({ monto: 5000, moneda: 'COP' }), 5000);
    assert.equal(entero(7000), 7000);
    assert.equal(entero({ monto: 1200.9 }), 1200);   // trunca a entero
    assert.equal(entero(null), 0);
    assert.equal(entero(undefined), 0);
});

// ─── Mapa de signos (V1 entra, V20 sale) ────────────────────────────────────────
test('SIGNO_TESORERIA · V1: consignacion_in (+) y retiro_efectivo_out (−) existen', () => {
    assert.equal(SIGNO_TESORERIA.consignacion_in, 1);
    assert.equal(SIGNO_TESORERIA.retiro_efectivo_out, -1);
});
test('SIGNO_TESORERIA · V20: servicio_publico fue RETIRADO (no tiene signo propio)', () => {
    assert.equal(SIGNO_TESORERIA.servicio_publico, undefined);
    assert.ok(!TIPOS_MOV.includes('servicio_publico'));
    assert.ok(TIPOS_MOV.includes('gasto'));
});

// ─── computeSaldoCuenta · base y conservación (#1) ──────────────────────────────
test('saldo · sin movimientos = saldoInicial', () => {
    assert.equal(computeSaldoCuenta({ monto: 1000000 }, []), 1000000);
    assert.equal(computeSaldoCuenta(500000, undefined), 500000);
});
test('saldo · conservación: entradas suman, salidas restan por su signo', () => {
    const movs = [
        { id: 'a', tipo: 'ingreso_venta', monto: { monto: 100000 } },
        { id: 'b', tipo: 'gasto', monto: { monto: 30000 }, categoria: 'papeleria' },
        { id: 'c', tipo: 'traslado_in', monto: { monto: 50000 } },
        { id: 'd', tipo: 'traslado_out', monto: { monto: 20000 } },
        { id: 'e', tipo: 'aporte_socia', monto: { monto: 10000 } },
    ];
    // 0 + 100000 − 30000 + 50000 − 20000 + 10000 = 110000
    assert.equal(computeSaldoCuenta(0, movs), 110000);
});

// ─── Plata firme: pendiente/rechazado NO cuentan (D4) ───────────────────────────
test('saldo · pendiente_aprobacion y rechazado NO cuentan (solo plata firme)', () => {
    const movs = [
        { id: 'a', tipo: 'ingreso_venta', monto: { monto: 100000 }, estado: 'activo' },
        { id: 'b', tipo: 'retiro_socia', monto: { monto: 40000 }, estado: 'pendiente_aprobacion' },
        { id: 'c', tipo: 'gasto', monto: { monto: 25000 }, estado: 'rechazado', categoria: 'otros' },
    ];
    assert.equal(computeSaldoCuenta(0, movs), 100000);   // solo el ingreso activo
});
test('saldo · retiro_socia aprobado (activo) SÍ resta', () => {
    const movs = [
        { id: 'a', tipo: 'ingreso_venta', monto: { monto: 100000 }, estado: 'activo' },
        { id: 'b', tipo: 'retiro_socia', monto: { monto: 40000 }, estado: 'activo' },
    ];
    assert.equal(computeSaldoCuenta(0, movs), 60000);
});

// ─── ajuste_conciliacion por direccion (V3) ─────────────────────────────────────
test('saldo · ajuste_conciliacion suma si direccion=entrada, resta si salida', () => {
    assert.equal(computeSaldoCuenta(0, [{ id: 'x', tipo: 'ajuste_conciliacion', direccion: 'entrada', monto: { monto: 5000 } }]), 5000);
    assert.equal(computeSaldoCuenta(0, [{ id: 'y', tipo: 'ajuste_conciliacion', direccion: 'salida', monto: { monto: 5000 } }]), -5000);
});

// ─── ajuste_inverso = −signo(ref) (V3) ──────────────────────────────────────────
test('saldo · ajuste_inverso netea EXACTAMENTE el movimiento referido (deshacer)', () => {
    const movs = [
        { id: 'g1', tipo: 'gasto', monto: { monto: 30000 }, categoria: 'otros' },        // −30000
        { id: 'inv', tipo: 'ajuste_inverso', refDocumento: 'g1', monto: { monto: 30000 } }, // −signo(gasto=−1)=+1 → +30000
    ];
    assert.equal(computeSaldoCuenta(0, movs), 0);   // el gasto y su inverso se cancelan
});
test('saldo · ajuste_inverso de una entrada la anula (signo negativo)', () => {
    const movs = [
        { id: 'i1', tipo: 'ingreso_venta', monto: { monto: 80000 } },                    // +80000
        { id: 'inv', tipo: 'ajuste_inverso', refDocumento: 'i1', monto: { monto: 80000 } }, // −80000
    ];
    assert.equal(computeSaldoCuenta(0, movs), 0);
});

// ─── Negativo se CONSERVA, no se clampa (V6) ────────────────────────────────────
test('saldo · una salida mayor que el saldo deja NEGATIVO (V6, sin clamp)', () => {
    const movs = [{ id: 'a', tipo: 'retiro_efectivo_out', monto: { monto: 1800000 }, estado: 'activo' }];
    assert.equal(computeSaldoCuenta(0, movs), -1800000);
});

// ─── Invariante #7: anomalías que GRITAN (fail-red) ─────────────────────────────
test('#7 · tipo desconocido LANZA (no devuelve saldo malo en silencio)', () => {
    assert.throws(() => computeSaldoCuenta(0, [{ id: 'z', tipo: 'tipo_inventado', monto: { monto: 1 } }]),
        (e) => e instanceof TesoreriaError && e.code === 'invalid-argument');
});
test('#7 · ajuste_conciliacion sin direccion válida LANZA', () => {
    assert.throws(() => computeSaldoCuenta(0, [{ id: 'z', tipo: 'ajuste_conciliacion', monto: { monto: 1 } }]),
        (e) => e instanceof TesoreriaError && e.code === 'invalid-argument');
});
test('#7 · ajuste_inverso con ref irresoluble LANZA', () => {
    assert.throws(() => computeSaldoCuenta(0, [{ id: 'z', tipo: 'ajuste_inverso', refDocumento: 'no-existe', monto: { monto: 1 } }]),
        (e) => e instanceof TesoreriaError && e.code === 'failed-precondition');
});
test('#7 · no se puede reversar un ajuste_inverso (inv.6)', () => {
    const movs = [
        { id: 'inv1', tipo: 'ajuste_inverso', refDocumento: 'inv2', monto: { monto: 1 } },
        { id: 'inv2', tipo: 'ajuste_inverso', refDocumento: 'inv1', monto: { monto: 1 } },
    ];
    assert.throws(() => computeSaldoCuenta(0, movs),
        (e) => e instanceof TesoreriaError && e.code === 'failed-precondition');
});
