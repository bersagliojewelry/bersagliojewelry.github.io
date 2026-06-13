/**
 * PARIDAD DE INSUMOS panel↔corte (spec acuerdos 2026-06-12 §1.4, slice 3).
 *
 * v2 (escudo): la paridad BYTE de la fórmula no basta. El acuerdo de SALDO cubre
 * por `registradoEn` (reloj de servidor); si el corte arma los movimientos SIN ese
 * campo (o sin los acuerdos), el escudo no protege y la foto mensual fotografiaría
 * "vencido" donde el panel dice "en acuerdo". Este test alimenta la MISMA fórmula
 * con los insumos armados COMO EL CORTE (agruparPorCliente sobre docs crudos) y
 * COMO EL PANEL (listener mapeado), y exige salida idéntica.
 *
 *   npm run test:insumos
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { estadoCuenta } from '../js/crm-estado-cuenta.js';

const require = createRequire(import.meta.url);
const { agruparPorCliente, acuerdoAlCorte } = require('../functions/corte.js');

const HOY = '2026-06-07';
const DAY = 86400000;
const T0 = Date.UTC(2026, 5, 7);
const ts = (ms) => ({ toMillis: () => ms });
const hace = (n) => new Date(T0 - n * DAY).toISOString().slice(0, 10);
const en = (n) => new Date(T0 + n * DAY).toISOString().slice(0, 10);

// Doc crudo como lo entrega un collectionGroup del Admin SDK.
const fakeDoc = (clienteId, id, data) => ({
    id, data: () => data, ref: { parent: { parent: { id: clienteId } } },
});

const MOVS = [
    ['cliA', 'f1', { tipo: 'factura', monto: 300000, fecha: hace(40), anulado: false, registradoEn: ts(T0 - 40 * DAY) }],
    ['cliA', 'a1', { tipo: 'abono', monto: 100000, fecha: hace(2), medioPago: 'efectivo', anulado: false, registradoEn: ts(T0 - 2 * DAY) }],
    ['cliB', 'f2', { tipo: 'factura', monto: 80000, fecha: hace(50), anulado: false, registradoEn: ts(T0 - 50 * DAY) }],
];
const ACUERDOS = [
    ['cliA', 'ac1', {
        fechaPacto: hace(28), estado: 'vigente',
        cuotas: [{ fecha: hace(10), monto: 100000 }, { fecha: en(5), monto: 100000 }, { fecha: en(20), monto: 100000 }],
        periodicidad: 'mensual', primeraCuotaFecha: hace(10), ultimaCuotaFecha: en(20),
        nota: 'pacto', creadoPor: 'u', creadoEn: ts(T0 - 28 * DAY), rolAlCrear: 'admin',
    }],
];

test('insumos: la fórmula recibe LO MISMO armado como el corte y como el panel', () => {
    // Camino del CORTE: docs crudos → agruparPorCliente (conserva el id).
    const movsCorte = agruparPorCliente(MOVS.map(([c, id, d]) => fakeDoc(c, id, d)));
    const acsCorte = agruparPorCliente(ACUERDOS.map(([c, id, d]) => fakeDoc(c, id, d)));
    // Camino del PANEL: listener `{ id: d.id, ...d.data() }` (crm-service.js).
    const movsPanel = new Map();
    for (const [c, id, d] of MOVS) {
        if (!movsPanel.has(c)) movsPanel.set(c, []);
        movsPanel.get(c).push({ id, ...d });
    }
    const acsPanel = new Map();
    for (const [c, id, d] of ACUERDOS) {
        if (!acsPanel.has(c)) acsPanel.set(c, []);
        acsPanel.get(c).push({ id, ...d });
    }

    for (const cliente of ['cliA', 'cliB']) {
        const delCorte = estadoCuenta(movsCorte.get(cliente) || [],
            { hoy: HOY, diasPlazo: 30, acuerdos: acsCorte.get(cliente) || [], horizonteDias: 730 });
        const delPanel = estadoCuenta(movsPanel.get(cliente) || [],
            { hoy: HOY, diasPlazo: 30, acuerdos: acsPanel.get(cliente) || [], horizonteDias: 730 });
        assert.deepEqual(delCorte, delPanel, `insumos divergen para ${cliente}`);
    }
});

test('insumos: el escudo ANCLA en el corte por registradoEn (el reloj de servidor viaja)', () => {
    const movs = agruparPorCliente(MOVS.map(([c, id, d]) => fakeDoc(c, id, d)));
    const acs = agruparPorCliente(ACUERDOS.map(([c, id, d]) => fakeDoc(c, id, d)));
    const r = estadoCuenta(movs.get('cliA'), { hoy: HOY, diasPlazo: 30, acuerdos: acs.get('cliA'), horizonteDias: 730 });
    // 300k − 100k abono = 200k pendiente; el abono pagó la cuota vencida → al día por pacto.
    assert.equal(r.saldo, 200000);
    assert.equal(r.vencido, 0);
    assert.equal(r.bajoAcuerdo, 200000);
    assert.equal(r.plan.acuerdoId, 'ac1');
    // Sin registradoEn (insumo roto), el escudo NO cubre → fotografiaría "vencido":
    const sinReg = (movs.get('cliA') || []).map(({ registradoEn, ...resto }) => resto);
    const roto = estadoCuenta(sinReg, { hoy: HOY, diasPlazo: 30, acuerdos: acs.get('cliA'), horizonteDias: 730 });
    assert.equal(roto.plan, null);
    assert.equal(roto.vencido > 0, true);   // la mentira que este test impide
});

test('insumos: docs sin clienteId (path roto) se descartan sin reventar', () => {
    const suelto = { id: 'x', data: () => ({}), ref: { parent: { parent: null } } };
    const por = agruparPorCliente([suelto]);
    assert.equal(por.size, 0);
});

// ─── R3: cristalización del estado del acuerdo (evidencia DIAN art. 146) ───────
test('acuerdoAlCorte: roto→incumplido; atrasado→en-mora; al día→al-dia', () => {
    assert.deepEqual(
        acuerdoAlCorte({ acuerdoId: 'a1', roto: true, vencidoPlan: 300000, cuotasVencidas: 3 }),
        { id: 'a1', estadoAlCorte: 'incumplido', cuotasVencidas: 3, vencidoPlan: 300000 });
    assert.deepEqual(
        acuerdoAlCorte({ acuerdoId: 'a2', roto: false, vencidoPlan: 40000, cuotasVencidas: 1 }),
        { id: 'a2', estadoAlCorte: 'en-mora', cuotasVencidas: 1, vencidoPlan: 40000 });
    assert.deepEqual(
        acuerdoAlCorte({ acuerdoId: 'a3', roto: false, vencidoPlan: 0, cuotasVencidas: 0 }),
        { id: 'a3', estadoAlCorte: 'al-dia', cuotasVencidas: 0, vencidoPlan: 0 });
});
