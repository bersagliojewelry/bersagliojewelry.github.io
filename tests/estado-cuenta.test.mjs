import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estadoCuenta, hoyISO } from '../js/crm-estado-cuenta.js';

const HOY = '2026-06-07';
const DAY = 86400000;
// Fecha ISO `n` días ANTES de HOY (UTC, determinista).
function hace(n) {
  return new Date(Date.UTC(2026, 5, 7) - n * DAY).toISOString().slice(0, 10);
}
const F = (tipo, monto, fecha, extra = {}) => ({ tipo, monto, fecha, anulado: false, ...extra });

test('cuenta vacía → sin deuda', () => {
  const r = estadoCuenta([], { hoy: HOY });
  assert.equal(r.saldo, 0);
  assert.equal(r.vencido, 0);
  assert.equal(r.estado, 'sin-deuda');
});

test('factura vencida (mora 10) → vencido en bucket 1-30', () => {
  const r = estadoCuenta([F('factura', 100000, hace(40))], { hoy: HOY, diasPlazo: 30 });
  assert.equal(r.saldo, 100000);
  assert.equal(r.vencido, 100000);
  assert.equal(r.alDia, 0);
  assert.equal(r.buckets.d1_30, 100000);
  assert.equal(r.diasMora, 10);
  assert.equal(r.fechaVencidoMasAntigua, hace(40));
  assert.equal(r.estado, 'vencido');
});

test('factura dentro del plazo → al día', () => {
  const r = estadoCuenta([F('factura', 80000, HOY)], { hoy: HOY, diasPlazo: 30 });
  assert.equal(r.vencido, 0);
  assert.equal(r.alDia, 80000);
  assert.equal(r.estado, 'al-dia');
});

test('factura + abono total → saldo 0, sin deuda', () => {
  const r = estadoCuenta([F('factura', 50000, hace(40)), F('abono', 50000, hace(2))], { hoy: HOY });
  assert.equal(r.saldo, 0);
  assert.equal(r.vencido, 0);
  assert.equal(r.estado, 'sin-deuda');
});

test('abono parcial → FIFO deja el pendiente envejecido', () => {
  const r = estadoCuenta([F('factura', 100000, hace(40)), F('abono', 30000, hace(5))], { hoy: HOY, diasPlazo: 30 });
  assert.equal(r.saldo, 70000);
  assert.equal(r.vencido, 70000);
  assert.equal(r.buckets.d1_30, 70000);
  assert.equal(r.diasMora, 10);
});

test('FIFO: el abono paga la factura MÁS VIEJA primero', () => {
  const r = estadoCuenta([
    F('factura', 50000, hace(90)),   // mora 60 → vencida
    F('factura', 50000, hace(10)),   // al día
    F('abono', 50000, hace(1)),
  ], { hoy: HOY, diasPlazo: 30 });
  assert.equal(r.saldo, 50000);
  assert.equal(r.vencido, 0);        // la vieja quedó pagada
  assert.equal(r.alDia, 50000);
  assert.equal(r.estado, 'al-dia');
});

test('apertura negativa → saldo a favor', () => {
  const r = estadoCuenta([F('apertura', -20000, hace(10))], { hoy: HOY });
  assert.equal(r.saldo, -20000);
  assert.equal(r.vencido, 0);
  assert.equal(r.estado, 'a-favor');
});

test('límites de bucket exactos (mora 30/31/60/61)', () => {
  const b = (n) => estadoCuenta([F('factura', 1000, hace(n + 30))], { hoy: HOY, diasPlazo: 30 }).buckets;
  // hace(n+30) con plazo 30 → mora = n
  assert.deepEqual(b(30), { d1_30: 1000, d31_60: 0, d60plus: 0 }); // mora 30
  assert.deepEqual(b(31), { d1_30: 0, d31_60: 1000, d60plus: 0 }); // mora 31
  assert.deepEqual(b(60), { d1_30: 0, d31_60: 1000, d60plus: 0 }); // mora 60
  assert.deepEqual(b(61), { d1_30: 0, d31_60: 0, d60plus: 1000 }); // mora 61
});

test('día 0 del vencimiento aún cuenta como al día', () => {
  // fecha hace(30) + plazo 30 → vence HOY → mora 0 → al día
  const r = estadoCuenta([F('factura', 5000, hace(30))], { hoy: HOY, diasPlazo: 30 });
  assert.equal(r.vencido, 0);
  assert.equal(r.alDia, 5000);
});

test('movimiento sin fecha usa fechaCorte de fallback', () => {
  const r = estadoCuenta([{ tipo: 'apertura', monto: 80000, anulado: false }],
    { hoy: HOY, diasPlazo: 30, fechaCorte: hace(50) });   // mora 20
  assert.equal(r.vencido, 80000);
  assert.equal(r.buckets.d1_30, 80000);
  assert.equal(r.diasMora, 20);
});

test('movimiento sin fecha y sin corte → cuenta en saldo pero no en vencido', () => {
  const r = estadoCuenta([{ tipo: 'apertura', monto: 80000, anulado: false }], { hoy: HOY });
  assert.equal(r.saldo, 80000);
  assert.equal(r.vencido, 0);
  assert.equal(r.sinFecha, 80000);
  assert.equal(r.estado, 'al-dia');
});

test('fecha imposible (2026-13-45) → tratada como sin fecha (no se vence en silencio)', () => {
  const r = estadoCuenta([F('factura', 40000, '2026-13-45')], { hoy: HOY, diasPlazo: 30 });
  assert.equal(r.saldo, 40000);
  assert.equal(r.vencido, 0);
  assert.equal(r.sinFecha, 40000);
  assert.equal(r.estado, 'al-dia');
});

test('movimiento anulado se ignora', () => {
  const r = estadoCuenta([
    F('factura', 100000, hace(40), { anulado: true }),
    F('factura', 50000, hace(40)),
  ], { hoy: HOY, diasPlazo: 30 });
  assert.equal(r.saldo, 50000);
  assert.equal(r.vencido, 50000);
});

test('diasPlazo por defecto = 30 y custom', () => {
  const movs = [F('factura', 10000, hace(5))];
  assert.equal(estadoCuenta(movs, { hoy: HOY }).estado, 'al-dia');         // default 30 → mora -25
  assert.equal(estadoCuenta(movs, { hoy: HOY, diasPlazo: 0 }).vencido, 10000); // vence inmediato → mora 5
});

test('hoyISO formatea fecha local', () => {
  assert.equal(hoyISO(new Date(2026, 0, 5)), '2026-01-05');
});
