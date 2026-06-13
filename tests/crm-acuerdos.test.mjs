/**
 * Tests del GENERADOR de cuotas (panel-only) — js/crm-acuerdos.js (spec
 * acuerdos 2026-06-12 §1.9). Runner: node:test.
 *
 *   npm run test:generador
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generarCuotas, siguienteQuincena, masMeses, sumaCuotas, resumenCuotas } from '../js/crm-acuerdos.js';

// ─── cadencias ─────────────────────────────────────────────────────────────────
test('quincena cartagenera: 15 → fin de mes → 15 del siguiente (incluye febrero)', () => {
    assert.equal(siguienteQuincena('2026-06-15'), '2026-06-30');
    assert.equal(siguienteQuincena('2026-06-30'), '2026-07-15');
    assert.equal(siguienteQuincena('2026-06-03'), '2026-06-15');   // antes del 15 → al 15
    assert.equal(siguienteQuincena('2026-06-20'), '2026-06-30');   // entre 15 y fin → al fin
    assert.equal(siguienteQuincena('2026-02-15'), '2026-02-28');   // febrero no bisiesto
    assert.equal(siguienteQuincena('2024-02-15'), '2024-02-29');   // bisiesto
});

test('mensual ancla al día de la PRIMERA con clamp (31 ene → 28 feb → 31 mar)', () => {
    assert.equal(masMeses('2026-01-31', 1), '2026-02-28');
    assert.equal(masMeses('2026-01-31', 2), '2026-03-31');   // NO camina con el clamp
    assert.equal(masMeses('2026-12-15', 1), '2027-01-15');   // cruza el año
});

// ─── generador ─────────────────────────────────────────────────────────────────
test('reparto ENTERO: cuotas iguales, residuo a la ÚLTIMA; Σ == total exacto', () => {
    const c = generarCuotas({ total: 100000, n: 3, periodicidad: 'mensual', primeraFecha: '2026-07-01' });
    assert.deepEqual(c.map((q) => q.monto), [33333, 33333, 33334]);
    assert.equal(sumaCuotas(c), 100000);
    assert.deepEqual(c.map((q) => q.fecha), ['2026-07-01', '2026-08-01', '2026-09-01']);
});

test('quincenal engancha la cadencia desde la primera cuota', () => {
    const c = generarCuotas({ total: 90000, n: 3, periodicidad: 'quincenal', primeraFecha: '2026-06-15' });
    assert.deepEqual(c.map((q) => q.fecha), ['2026-06-15', '2026-06-30', '2026-07-15']);
});

test('parámetros insanos → null (total no entero/negativo, n fuera de rango, fecha mala, más cuotas que pesos)', () => {
    assert.equal(generarCuotas({ total: 0, n: 2, periodicidad: 'mensual', primeraFecha: '2026-07-01' }), null);
    assert.equal(generarCuotas({ total: 100.5, n: 2, periodicidad: 'mensual', primeraFecha: '2026-07-01' }), null);
    assert.equal(generarCuotas({ total: 100000, n: 0, periodicidad: 'mensual', primeraFecha: '2026-07-01' }), null);
    assert.equal(generarCuotas({ total: 100000, n: 25, periodicidad: 'mensual', primeraFecha: '2026-07-01' }), null);
    assert.equal(generarCuotas({ total: 100000, n: 4, periodicidad: 'semanal', primeraFecha: '2026-07-01' }), null);
    assert.equal(generarCuotas({ total: 100000, n: 4, periodicidad: 'mensual', primeraFecha: '01/07/2026' }), null);
    assert.equal(generarCuotas({ total: 3, n: 4, periodicidad: 'mensual', primeraFecha: '2026-07-01' }), null);
});

test('resumenCuotas habla en mostrador (primera/última, residuo distinto)', () => {
    const fmt = (n) => `$${n}`;
    const c = generarCuotas({ total: 100000, n: 3, periodicidad: 'mensual', primeraFecha: '2026-07-01' });
    const r = resumenCuotas(c, fmt);
    assert.ok(r.includes('3 cuotas de $33333'));
    assert.ok(r.includes('última $33334'));
    assert.ok(r.includes('01/07/2026'));
    assert.equal(resumenCuotas([], fmt), '');
});
