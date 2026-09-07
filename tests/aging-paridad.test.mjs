/**
 * PARIDAD del aging (Fase M · M4): `functions/crm-estado-cuenta.mjs` DEBE ser
 * copia BYTE-IDÉNTICA de `js/crm-estado-cuenta.js` — el corte mensual y el panel
 * calculan la mora con LA MISMA fórmula (L-03: un solo renderer/una sola fórmula).
 * Si alguien edita una copia sin la otra, este test revienta el pre-commit/CI.
 *
 * + bordes de `mesAnterior` (functions/corte.js): la etiqueta del corte en
 * hora de Bogotá, incluido el rollover de enero.
 *
 *   npm run test:paridad
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

test('aging: functions/crm-estado-cuenta.mjs es BYTE-IDÉNTICO a js/crm-estado-cuenta.js', () => {
    const original = readFileSync(new URL('../js/crm-estado-cuenta.js', import.meta.url), 'utf8');
    const copia = readFileSync(new URL('../functions/crm-estado-cuenta.mjs', import.meta.url), 'utf8');
    assert.equal(copia, original,
        'Las dos copias del aging DIVERGEN. Edita js/crm-estado-cuenta.js y re-copia: '
        + 'Copy-Item js/crm-estado-cuenta.js functions/crm-estado-cuenta.mjs');
});

test('aging: ambas copias calculan IDÉNTICO sobre el mismo fixture (sanity conductual)', async () => {
    const { estadoCuenta: delPanel } = await import('../js/crm-estado-cuenta.js');
    const { estadoCuenta: delCorte } = await import('../functions/crm-estado-cuenta.mjs');
    const movs = [
        { tipo: 'factura', monto: 500000, fecha: '2026-04-01', anulado: false },
        { tipo: 'abono', monto: 100000, fecha: '2026-05-01', anulado: false },
        { tipo: 'ajuste', monto: -30000, fecha: '2026-06-01', anulado: false },
        { tipo: 'factura', monto: 60000, anulado: false },                      // sin fecha → fallback
        { tipo: 'abono', monto: 999999, fecha: '2026-05-02', anulado: true },   // anulado no cuenta
    ];
    const opts = { hoy: '2026-06-12', diasPlazo: 30, fechaCorte: '2025-12-31' };
    assert.deepEqual(delCorte(movs, opts), delPanel(movs, opts));
});

test('aging: ambas copias calculan IDÉNTICO en el camino CON acuerdo (escudo y perforado)', async () => {
    const { estadoCuenta: delPanel } = await import('../js/crm-estado-cuenta.js');
    const { estadoCuenta: delCorte } = await import('../functions/crm-estado-cuenta.mjs');
    const DAY = 86400000;
    const T0 = Date.UTC(2026, 5, 7);
    const ts = (ms) => ({ toMillis: () => ms });
    const iso = (n) => new Date(T0 + n * DAY).toISOString().slice(0, 10);
    const base = { hoy: iso(0), diasPlazo: 30, horizonteDias: 730 };
    // ESCUDO (no roto): factura cubierta, 1 cuota vencida + 2 futuras.
    const escudo = {
        movs: [{ id: 'f1', tipo: 'factura', monto: 300000, fecha: iso(-30), anulado: false, registradoEn: ts(T0 - 30 * DAY) }],
        acuerdos: [{ id: 'ac1', estado: 'vigente', fechaPacto: iso(-30), creadoEn: ts(T0 - 30 * DAY),
            cuotas: [{ fecha: iso(-10), monto: 100000 }, { fecha: iso(5), monto: 100000 }, { fecha: iso(20), monto: 100000 }],
            primeraCuotaFecha: iso(-10), ultimaCuotaFecha: iso(20) }],
    };
    // PERFORADO (roto): factura MUY vieja, 3 cuotas todas vencidas e impagas → escudo cae.
    const perforado = {
        movs: [{ id: 'f1', tipo: 'factura', monto: 300000, fecha: iso(-400), anulado: false, registradoEn: ts(T0 - 400 * DAY) }],
        acuerdos: [{ id: 'ac2', estado: 'vigente', fechaPacto: iso(-70), creadoEn: ts(T0 - 70 * DAY),
            cuotas: [{ fecha: iso(-60), monto: 100000 }, { fecha: iso(-40), monto: 100000 }, { fecha: iso(-20), monto: 100000 }],
            primeraCuotaFecha: iso(-60), ultimaCuotaFecha: iso(-20) }],
    };
    for (const c of [escudo, perforado]) {
        const o = { ...base, acuerdos: c.acuerdos };
        assert.deepEqual(delCorte(c.movs, o), delPanel(c.movs, o));
    }
});

test('mesAnterior: etiqueta del mes que cierra, en hora de Bogotá (UTC-5), con rollover de enero', () => {
    const { mesAnterior } = require('../functions/corte.js');
    // Corrida típica: 1 de julio 03:50 Bogotá = 08:50 UTC → corte de JUNIO.
    assert.equal(mesAnterior(new Date('2026-07-01T08:50:00Z')), '2026-06');
    // 1 de enero 03:50 Bogotá → corte de DICIEMBRE del año anterior.
    assert.equal(mesAnterior(new Date('2027-01-01T08:50:00Z')), '2026-12');
    // Borde de medianoche: 1 de julio 00:00 UTC aún es 30 de junio en Bogotá → corte de MAYO.
    assert.equal(mesAnterior(new Date('2026-07-01T00:00:00Z')), '2026-05');
});
