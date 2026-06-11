/**
 * Tests del contrato PURO de corrección (Fase M · M2a) — js/crm-correccion.js.
 * Runner: node:test (sin emulador). El gate aquí DEBE coincidir con las reglas M3
 * (plan §69) — este test es el guardián de esa coincidencia.
 *
 *   npm run test:correccion
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    ajusteRequiereAprobacion, anulacionRequiereAprobacion, planearCorreccionSaldo,
    efectoSaldo, planearCorreccionMovimiento,
    PREGUNTAS_CORRECCION, MOTIVOS_NEUTROS_DEFAULT,
} from '../js/crm-correccion.js';

const CFG = { autoAprobacionMax: 50000, motivosNeutros: ['ERROR_REGISTRO', 'ABONO_NO_REGISTRADO', 'RECLASIFICACION'] };

// ─── ajusteRequiereAprobacion ─────────────────────────────────────────────────
test('ajuste POSITIVO no necesita aprobación (sin tope)', () => {
    assert.equal(ajusteRequiereAprobacion(9_000_000, 'OTRO', CFG), false);
    assert.equal(ajusteRequiereAprobacion(1000, 'DEVOLUCION_PIEZA', CFG), false);
});
test('ajuste NEGATIVO neutro y bajo el tope → admin (sin solicitud)', () => {
    assert.equal(ajusteRequiereAprobacion(-50000, 'ERROR_REGISTRO', CFG), false);   // exactamente en el tope
    assert.equal(ajusteRequiereAprobacion(-30000, 'ABONO_NO_REGISTRADO', CFG), false);
});
test('ajuste NEGATIVO neutro por ENCIMA del tope → solicitud', () => {
    assert.equal(ajusteRequiereAprobacion(-50001, 'ERROR_REGISTRO', CFG), true);
});
test('ajuste NEGATIVO con motivo NO neutro → siempre solicitud (devolución/descuento/otro)', () => {
    assert.equal(ajusteRequiereAprobacion(-100, 'DEVOLUCION_PIEZA', CFG), true);
    assert.equal(ajusteRequiereAprobacion(-100, 'DESCUENTO_AUTORIZADO', CFG), true);
    assert.equal(ajusteRequiereAprobacion(-100, 'OTRO', CFG), true);
});
test('ajuste de 0 o no finito → falla cerrado (solicitud)', () => {
    assert.equal(ajusteRequiereAprobacion(0, 'ERROR_REGISTRO', CFG), true);
    assert.equal(ajusteRequiereAprobacion(NaN, 'ERROR_REGISTRO', CFG), true);
});
test('config ausente/corrupta → ajuste negativo falla cerrado; positivo sigue admin', () => {
    assert.equal(ajusteRequiereAprobacion(-100, 'ERROR_REGISTRO', null), true);
    assert.equal(ajusteRequiereAprobacion(-100, 'ERROR_REGISTRO', {}), true);
    assert.equal(ajusteRequiereAprobacion(-100, 'ERROR_REGISTRO', { autoAprobacionMax: 'x' }), true);
    assert.equal(ajusteRequiereAprobacion(5000, 'ERROR_REGISTRO', null), false);   // positivo sin tope
});

// ─── anulacionRequiereAprobacion (tabla de predicados M3) ─────────────────────
test('anular factura/apertura/ajuste POSITIVO bajo el tope → admin', () => {
    assert.equal(anulacionRequiereAprobacion({ tipo: 'factura', monto: 50000 }, CFG), false);
    assert.equal(anulacionRequiereAprobacion({ tipo: 'apertura', monto: 1 }, CFG), false);
    assert.equal(anulacionRequiereAprobacion({ tipo: 'ajuste', monto: 49999 }, CFG), false);
});
test('anular factura/apertura/ajuste por ENCIMA del tope → owner', () => {
    assert.equal(anulacionRequiereAprobacion({ tipo: 'factura', monto: 50001 }, CFG), true);
    assert.equal(anulacionRequiereAprobacion({ tipo: 'factura', monto: 5_000_000 }, CFG), true);
});
test('anular un ABONO (cualquier monto) → owner', () => {
    assert.equal(anulacionRequiereAprobacion({ tipo: 'abono', monto: 100 }, CFG), true);
    assert.equal(anulacionRequiereAprobacion({ tipo: 'abono', monto: 50_000_000 }, CFG), true);
});
test('anular un asiento de monto ≤ 0 (negativo o cero) → owner', () => {
    assert.equal(anulacionRequiereAprobacion({ tipo: 'ajuste', monto: -1000 }, CFG), true);
    assert.equal(anulacionRequiereAprobacion({ tipo: 'apertura', monto: -200000 }, CFG), true);
    assert.equal(anulacionRequiereAprobacion({ tipo: 'factura', monto: 0 }, CFG), true);
});
test('anulación con config ausente → falla cerrado (owner)', () => {
    assert.equal(anulacionRequiereAprobacion({ tipo: 'factura', monto: 1000 }, null), true);
    assert.equal(anulacionRequiereAprobacion({ tipo: 'factura', monto: 1000 }, {}), true);
});

// ─── planearCorreccionSaldo (anuncio en pesos) ────────────────────────────────
test('planear: delta 0 = no-op', () => {
    const r = planearCorreccionSaldo(100000, 100000, 'ERROR_REGISTRO', CFG);
    assert.equal(r.noOp, true);
    assert.equal(r.delta, 0);
});
test('planear: bajar saldo dentro del tope con motivo neutro → admin', () => {
    const r = planearCorreccionSaldo(100000, 60000, 'ERROR_REGISTRO', CFG);   // delta -40000
    assert.equal(r.noOp, false);
    assert.equal(r.delta, -40000);
    assert.equal(r.requiereAprobacion, false);
});
test('planear: bajar saldo por debajo del tope total (delta > tope) → solicitud', () => {
    const r = planearCorreccionSaldo(100000, 20000, 'ERROR_REGISTRO', CFG);   // delta -80000 > tope
    assert.equal(r.delta, -80000);
    assert.equal(r.requiereAprobacion, true);
});
test('planear: subir saldo (delta positivo) → admin sin tope', () => {
    const r = planearCorreccionSaldo(100000, 250000, 'OTRO', CFG);            // delta +150000
    assert.equal(r.delta, 150000);
    assert.equal(r.requiereAprobacion, false);
});

// ─── efectoSaldo (signo por tipo, fuente única) ───────────────────────────────
test('efectoSaldo: factura/apertura/ajuste suman; abono resta; desconocido = 0', () => {
    assert.equal(efectoSaldo('factura', 1000), 1000);
    assert.equal(efectoSaldo('apertura', 1000), 1000);
    assert.equal(efectoSaldo('ajuste', -1000), -1000);
    assert.equal(efectoSaldo('abono', 1000), -1000);
    assert.equal(efectoSaldo('raro', 1000), 0);
});

// ─── planearCorreccionMovimiento (contrato §74) ───────────────────────────────
test('corregir factura 500k→450k: delta −50k, requiere aprobación (anular >tope)', () => {
    const p = planearCorreccionMovimiento(
        { id: 'm1', tipo: 'factura', monto: 500000, fecha: '2026-06-03' },
        { montoNuevo: 450000, motivoCategoria: 'ERROR_REGISTRO' }, CFG);
    assert.equal(p.delta, -50000);
    assert.equal(p.requiereAprobacion, true);   // anular factura 500k > tope 50k → owner
    assert.equal(p.noOp, false);
    assert.equal(p.datosCorreccion.reemplazo.monto, 450000);
    assert.equal(p.datosCorreccion.snapshotOriginal.monto, 500000);
    assert.equal(p.datosCorreccion.snapshotOriginal.anulado, false);
    assert.equal(p.datosCorreccion.motivoCategoria, 'ERROR_REGISTRO');
});
test('corregir factura pequeña 30k→20k: auto-aprobable (anular ≤ tope)', () => {
    const p = planearCorreccionMovimiento(
        { id: 'm2', tipo: 'factura', monto: 30000, fecha: '2026-06-03' },
        { montoNuevo: 20000, motivoCategoria: 'ERROR_REGISTRO' }, CFG);
    assert.equal(p.delta, -10000);
    assert.equal(p.requiereAprobacion, false);
});
test('corregir abono (subir el abono baja el saldo) → siempre requiere aprobación', () => {
    const p = planearCorreccionMovimiento(
        { id: 'm3', tipo: 'abono', monto: 100000, fecha: '2026-06-03' },
        { montoNuevo: 120000, motivoCategoria: 'ERROR_REGISTRO' }, CFG);
    assert.equal(p.delta, -20000);            // abono resta: +20k de abono = −20k de saldo
    assert.equal(p.requiereAprobacion, true); // anular un abono → owner
});
test('corregir solo la fecha (mismo monto): delta 0 pero NO es no-op (cambia mora)', () => {
    const p = planearCorreccionMovimiento(
        { id: 'm4', tipo: 'factura', monto: 50000, fecha: '2026-06-03' },
        { montoNuevo: 50000, fechaNueva: '2026-05-01', motivoCategoria: 'CORRECCION_FECHA' }, CFG);
    assert.equal(p.delta, 0);
    assert.equal(p.noOp, false);
    assert.equal(p.datosCorreccion.reemplazo.fecha, '2026-05-01');
});
test('corregir sin cambiar nada (mismo monto, misma fecha) → no-op', () => {
    const p = planearCorreccionMovimiento(
        { id: 'm5', tipo: 'factura', monto: 50000, fecha: '2026-06-03' },
        { montoNuevo: 50000, motivoCategoria: 'ERROR_REGISTRO' }, CFG);
    assert.equal(p.noOp, true);
});

// ─── Datos de presentación ────────────────────────────────────────────────────
test('PREGUNTAS_CORRECCION mapea preguntas a motivos válidos sin huérfanos', () => {
    assert.ok(PREGUNTAS_CORRECCION.length >= 4);
    for (const p of PREGUNTAS_CORRECCION) {
        assert.equal(typeof p.pregunta, 'string');
        assert.ok(p.pregunta.length > 0);
        assert.equal(typeof p.motivo, 'string');
        assert.ok(p.motivo.length > 0);
    }
    // los 3 neutros por defecto son los del contrato
    assert.deepEqual(MOTIVOS_NEUTROS_DEFAULT, ['ERROR_REGISTRO', 'ABONO_NO_REGISTRADO', 'RECLASIFICACION']);
});
