import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estadoCuenta, hoyISO, vencimientoDefaultISO } from '../js/crm-estado-cuenta.js';

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

// ─── M6: acuerdo de pago POR DEUDA (vencimiento explícito del cargo) ───────────

test('M6: vencimiento explícito MANDA sobre fecha+plazo (acorta el plazo)', () => {
  // Factura de hace 10 días: con plazo 30 estaría al día; el acuerdo venció hace 3.
  const r = estadoCuenta([F('factura', 90000, hace(10), { vencimiento: hace(3) })],
    { hoy: HOY, diasPlazo: 30 });
  assert.equal(r.vencido, 90000);
  assert.equal(r.diasMora, 3);
  assert.equal(r.buckets.d1_30, 90000);
  assert.equal(r.estado, 'vencido');
});

test('M6: vencimiento explícito ALARGA el plazo (acuerdo a 90 días)', () => {
  // Factura de hace 40 días: con plazo 30 estaría vencida; el acuerdo vence en 50 días.
  const venceEnFuturo = new Date(Date.UTC(2026, 5, 7) + 50 * DAY).toISOString().slice(0, 10);
  const r = estadoCuenta([F('factura', 120000, hace(40), { vencimiento: venceEnFuturo })],
    { hoy: HOY, diasPlazo: 30 });
  assert.equal(r.vencido, 0);
  assert.equal(r.alDia, 120000);
  assert.equal(r.estado, 'al-dia');
});

test('M6: convivencia mixta — con y sin acuerdo, cada cargo con su vencimiento efectivo', () => {
  const r = estadoCuenta([
    F('factura', 50000, hace(40)),                            // sin acuerdo → fecha+30 → mora 10
    F('factura', 30000, hace(40), { vencimiento: hace(70) }), // acuerdo viejo → mora 70 (+60)
  ], { hoy: HOY, diasPlazo: 30 });
  assert.equal(r.vencido, 80000);
  assert.equal(r.buckets.d1_30, 50000);
  assert.equal(r.buckets.d60plus, 30000);
  assert.equal(r.diasMora, 70);
});

test('M6: vencimiento IMPOSIBLE (pasa la regex de la regla) → fallback fecha+plazo', () => {
  const r = estadoCuenta([F('factura', 40000, hace(40), { vencimiento: '2026-02-30' })],
    { hoy: HOY, diasPlazo: 30 });
  assert.equal(r.vencido, 40000);    // envejece por fecha+30 como si no hubiera acuerdo
  assert.equal(r.diasMora, 10);
});

test('M6: cargo SIN fecha sigue en sinFecha aunque traiga vencimiento (no envejece)', () => {
  const r = estadoCuenta([F('factura', 25000, undefined, { vencimiento: hace(5) })],
    { hoy: HOY, diasPlazo: 30 });
  assert.equal(r.sinFecha, 25000);
  assert.equal(r.vencido, 0);
});

test('M6: el FIFO sigue por FECHA del cargo, no por vencimiento (semántica fijada)', () => {
  // La factura MÁS VIEJA por fecha tiene acuerdo lejano; la nueva ya venció por acuerdo.
  // El abono paga la más vieja por FECHA → la nueva queda pendiente y vencida.
  const venceLejos = new Date(Date.UTC(2026, 5, 7) + 60 * DAY).toISOString().slice(0, 10);
  const r = estadoCuenta([
    F('factura', 50000, hace(90), { vencimiento: venceLejos }),  // vieja, al día por acuerdo
    F('factura', 50000, hace(20), { vencimiento: hace(2) }),     // nueva, vencida por acuerdo
    F('abono', 50000, hace(1)),
  ], { hoy: HOY, diasPlazo: 30 });
  assert.equal(r.saldo, 50000);
  assert.equal(r.vencido, 50000);    // quedó pendiente la NUEVA (vencida por su acuerdo)
  assert.equal(r.diasMora, 2);
});

test('M6: vencimientoDefaultISO = fecha + plazo (la MISMA suma del fallback)', () => {
  assert.equal(vencimientoDefaultISO('2026-06-07', 30), '2026-07-07');
  assert.equal(vencimientoDefaultISO('2026-12-15', 30), '2027-01-14');  // cruza el año
  assert.equal(vencimientoDefaultISO('2026-06-07', 0), '2026-06-07');   // plazo 0 = vence el mismo día
  assert.equal(vencimientoDefaultISO('2026-02-30', 30), '');            // fecha imposible → ''
  assert.equal(vencimientoDefaultISO('', 30), '');
  assert.equal(vencimientoDefaultISO('2026-06-07', -5), '2026-07-07');  // plazo basura → default 30
});

test('M6-fix: saneo de diasPlazo idéntico al del default (trunc + finito → misma suma L-03)', () => {
  const movs = [F('factura', 10000, hace(35))];
  // 30.5 se trunca a 30 → mora 5 (idéntico al sugerido fecha+30 que vio Kary)
  assert.equal(estadoCuenta(movs, { hoy: HOY, diasPlazo: 30.5 }).vencido, 10000);
  assert.equal(estadoCuenta(movs, { hoy: HOY, diasPlazo: 30.5 }).diasMora, 5);
  // Infinity NO es un plazo: cae al default 30 (jamás "al día" eterno)
  assert.equal(estadoCuenta(movs, { hoy: HOY, diasPlazo: Infinity }).vencido, 10000);
});

test('M6-fix: fechaVencidoMasAntigua = fecha del cargo con PEOR mora (coherente con diasMora)', () => {
  // Acuerdos invertidos: el cargo VIEJO por fecha tiene mora 1; el NUEVO tiene mora 50.
  const r = estadoCuenta([
    F('factura', 50000, hace(90), { vencimiento: hace(1) }),    // fecha vieja, mora 1
    F('factura', 30000, hace(10), { vencimiento: hace(50) }),   // fecha nueva, mora 50
  ], { hoy: HOY, diasPlazo: 30 });
  assert.equal(r.diasMora, 50);
  assert.equal(r.fechaVencidoMasAntigua, hace(10));   // el MISMO cargo que define diasMora
});
