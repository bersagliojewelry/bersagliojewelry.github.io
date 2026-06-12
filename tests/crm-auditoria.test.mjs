/**
 * Tests de los detectores PUROS de la auditoría mensual (Fase M · M4) —
 * js/crm-auditoria.js. Runner: node:test (sin emulador).
 *
 * Cubre los fixtures que el plan §69-M4 exige: clienta sobre tope mensual
 * resaltada · flag "corrección sin enlace" dispara · alerta "rechazada burlada"
 * dispara · degradado al exceder el SLA · totales de recaudo correctos ·
 * muestra trimestral determinista.
 *
 *   npm run test:auditoria
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    mesDe, trimestreDe, esMontoSimilar, pendientesFueraDeSLA,
    ajustesNegativosAuto, anulacionesDelMes, rechazadasBurladas,
    abonosPorMedio, muestraTrimestral, acuerdosLargos,
    acuerdosSobreMora, acuerdosAnomalos, renegociacionesSeriales,
} from '../js/crm-auditoria.js';

const OWNER = 'uid-daniel';
const KARY = 'uid-kary';
const JUNIO = '2026-06';
const d = (iso) => new Date(`${iso}T10:00:00`);   // hora local fija

function ajuste(over = {}) {
    return { id: over.id || `aj-${Math.abs(over.monto || 0)}`, clienteId: 'cliA', tipo: 'ajuste',
        monto: -10000, registradoPor: KARY, registradoEn: d('2026-06-10'), anulado: false, ...over };
}

// ─── tiempo ───────────────────────────────────────────────────────────────────
test('mesDe/trimestreDe agrupan por el instante (hora local)', () => {
    assert.equal(mesDe(d('2026-06-01')), '2026-06');
    assert.equal(mesDe(d('2026-12-31')), '2026-12');
    assert.equal(trimestreDe(d('2026-06-15')), '2026-Q2');
    assert.equal(trimestreDe(d('2026-10-01')), '2026-Q4');
    assert.equal(mesDe(null), null);
});

test('esMontoSimilar: 10% con piso de $1.000; signos irrelevantes', () => {
    assert.equal(esMontoSimilar(-50000, 48000), true);     // 4% de diferencia
    assert.equal(esMontoSimilar(-50000, 40000), false);    // 20%
    assert.equal(esMontoSimilar(-900, 300), true);         // bajo el piso de 1.000
});

// ─── (1) degradado por SLA ─────────────────────────────────────────────────────
test('pendientesFueraDeSLA: dispara al EXCEDER el sla; dentro del plazo no', () => {
    const ahora = d('2026-06-10').getTime();
    const pend = [
        { id: 'reciente', creadoEn: d('2026-06-09') },     // 1 día
        { id: 'vieja', creadoEn: d('2026-06-01') },        // 9 días
    ];
    const r = pendientesFueraDeSLA(pend, 2, ahora);
    assert.equal(r.degradado, true);
    assert.deepEqual(r.vencidas.map((s) => s.id), ['vieja']);
    const ok = pendientesFueraDeSLA([pend[0]], 2, ahora);
    assert.equal(ok.degradado, false);
});

// ─── (2a) tajadas del mes ──────────────────────────────────────────────────────
test('ajustesNegativosAuto: clienta sobre tope MENSUAL resaltada; ≥2 neutros marcado', () => {
    const movs = [
        ajuste({ id: 'a1', monto: -30000 }),
        ajuste({ id: 'a2', monto: -25000 }),               // misma clienta: 55k > 50k
        ajuste({ id: 'b1', clienteId: 'cliB', monto: -10000 }),
    ];
    const r = ajustesNegativosAuto(movs, JUNIO, { topeMensual: 50000, ownerUid: OWNER });
    assert.equal(r.porClienta.get('cliA').sobreTopeMensual, true);
    assert.equal(r.porClienta.get('cliA').multiplesNeutros, true);
    assert.equal(r.porClienta.get('cliB').sobreTopeMensual, false);
    assert.equal(r.global, 65000);
    assert.equal(r.sobreTopeGlobal, true);
});

test('ajustesNegativosAuto: excluye owner, aprobados (solicitudId), otros meses y positivos; anulado SIGUE contando', () => {
    const movs = [
        ajuste({ id: 'owner', registradoPor: OWNER, monto: -90000 }),          // autoridad, no tajada
        ajuste({ id: 'aprob', solicitudId: 'sol1', monto: -80000 }),           // aprobado por Daniel
        ajuste({ id: 'mayo', registradoEn: d('2026-05-20'), monto: -70000 }),  // otro mes
        ajuste({ id: 'pos', monto: 40000 }),                                   // positivo
        ajuste({ id: 'anulada', monto: -20000, anulado: true }),               // tajada anulada: firmada igual
    ];
    const r = ajustesNegativosAuto(movs, JUNIO, { topeMensual: 50000, ownerUid: OWNER });
    assert.equal(r.global, 20000);
    assert.equal(r.porClienta.get('cliA').items.length, 1);
});

// ─── (2b+3) anulaciones + corrección sin enlace ────────────────────────────────
test('anulacionesDelMes: flag "corrección sin enlace" dispara (sin corregidoPor o reemplazo anulado)', () => {
    const movs = [
        { id: 'x1', clienteId: 'cliA', tipo: 'factura', monto: 30000, anulado: true,
          anuladoPor: KARY, anuladoEn: d('2026-06-05'), motivoCategoria: 'CORRECCION' },           // SIN corregidoPor
        { id: 'x2', clienteId: 'cliA', tipo: 'factura', monto: 20000, anulado: true,
          anuladoPor: KARY, anuladoEn: d('2026-06-06'), motivoCategoria: 'CORRECCION', corregidoPor: 'muerto' },
        { id: 'muerto', clienteId: 'cliA', tipo: 'factura', monto: 20000, anulado: true,
          anuladoPor: KARY, anuladoEn: d('2026-06-07'), motivoCategoria: 'OTRO' },                  // reemplazo NO vigente
        { id: 'x3', clienteId: 'cliB', tipo: 'factura', monto: 10000, anulado: true,
          anuladoPor: KARY, anuladoEn: d('2026-06-08'), motivoCategoria: 'CORRECCION', corregidoPor: 'vivo' },
        { id: 'vivo', clienteId: 'cliB', tipo: 'factura', monto: 9000, anulado: false, registradoEn: d('2026-06-08') },
        { id: 'xf', clienteId: 'cliB', tipo: 'factura', monto: 5000, anulado: true,
          anuladoPor: KARY, anuladoEn: d('2026-06-09'), motivoCategoria: 'CORRECCION_FECHA', corregidoPor: 'vivo' },
    ];
    const r = anulacionesDelMes(movs, JUNIO, { topeMensual: 50000, ownerUid: OWNER });
    assert.deepEqual(r.sinEnlace.map((i) => i.id).sort(), ['x1', 'x2']);
    assert.deepEqual(r.correccionesFecha.map((i) => i.id), ['xf']);
    // Σ anulado por NO-owner a cliA: 30k+20k+20k = 70k > tope → resaltada
    assert.equal(r.porClienta.get('cliA').sobreTopeMensual, true);
});

test('anulacionesDelMes: lo anulado por el OWNER no suma al salami; otros meses fuera', () => {
    const movs = [
        { id: 'o1', clienteId: 'cliA', tipo: 'factura', monto: 900000, anulado: true,
          anuladoPor: OWNER, anuladoEn: d('2026-06-05'), motivoCategoria: 'DUPLICADO' },
        { id: 'm1', clienteId: 'cliA', tipo: 'factura', monto: 30000, anulado: true,
          anuladoPor: KARY, anuladoEn: d('2026-05-05'), motivoCategoria: 'DUPLICADO' },
    ];
    const r = anulacionesDelMes(movs, JUNIO, { topeMensual: 50000, ownerUid: OWNER });
    assert.equal(r.items.length, 1);                       // solo o1 es de junio
    assert.equal(r.porClienta.has('cliA'), false);         // owner no suma
});

// ─── (3b) rechazada burlada ────────────────────────────────────────────────────
test('rechazadasBurladas: rechazo + ajuste neutro similar misma clienta <30 días → alerta', () => {
    const sols = [{ id: 's1', clienteId: 'cliA', estado: 'rechazada', monto: -48000,
        resueltoEn: d('2026-06-01') }];
    const movs = [
        ajuste({ id: 'burla', monto: -47000, registradoEn: d('2026-06-10') }),  // similar, 9 días después
    ];
    const r = rechazadasBurladas(sols, movs, { ownerUid: OWNER });
    assert.equal(r.length, 1);
    assert.equal(r[0].ajuste.id, 'burla');
    assert.equal(r[0].diasDespues, 9);
});

test('rechazadasBurladas: NO dispara si es antes del rechazo, fuera de ventana, monto distinto, otra clienta o vía solicitud', () => {
    const sols = [{ id: 's1', clienteId: 'cliA', estado: 'rechazada', monto: -48000, resueltoEn: d('2026-06-01') }];
    const movs = [
        ajuste({ id: 'antes', monto: -48000, registradoEn: d('2026-05-30') }),
        ajuste({ id: 'tarde', monto: -48000, registradoEn: d('2026-07-15') }),
        ajuste({ id: 'distinto', monto: -10000, registradoEn: d('2026-06-05') }),
        ajuste({ id: 'otra', clienteId: 'cliB', monto: -48000, registradoEn: d('2026-06-05') }),
        ajuste({ id: 'aprobado', monto: -48000, solicitudId: 's2', registradoEn: d('2026-06-05') }),
    ];
    assert.equal(rechazadasBurladas(sols, movs, { ownerUid: OWNER }).length, 0);
});

// ─── (4) recaudo por medio ─────────────────────────────────────────────────────
test('abonosPorMedio: totales correctos; anulados aparte; legacy sin medio señalado', () => {
    const ab = (id, monto, medioPago, over = {}) => ({ id, clienteId: 'cliA', tipo: 'abono', monto,
        registradoEn: d('2026-06-10'), anulado: false, ...(medioPago ? { medioPago } : {}), ...over });
    const movs = [
        ab('e1', 100000, 'efectivo'), ab('e2', 50000, 'efectivo'),
        ab('t1', 200000, 'transferencia'),
        ab('an', 70000, 'efectivo', { anulado: true }),
        ab('legacy', 30000, null),
        ab('mayo', 999999, 'efectivo', { registradoEn: d('2026-05-10') }),
    ];
    const r = abonosPorMedio(movs, JUNIO);
    assert.equal(r.porMedio.get('efectivo').total, 150000);
    assert.equal(r.porMedio.get('transferencia').total, 200000);
    assert.equal(r.total, 380000);
    assert.equal(r.anuladosTotal, 70000);
    assert.equal(r.sinMedio, 30000);
});

// ─── (5) muestra trimestral determinista ───────────────────────────────────────
test('muestraTrimestral: misma semilla → misma muestra; solo ajustes del trimestre; máx n', () => {
    const movs = [];
    for (let i = 0; i < 30; i++) movs.push(ajuste({ id: `q2-${i}`, registradoEn: d('2026-05-15') }));
    movs.push(ajuste({ id: 'q1', registradoEn: d('2026-02-10') }));
    movs.push({ id: 'fact', clienteId: 'cliA', tipo: 'factura', monto: 5000, registradoEn: d('2026-05-15') });
    const a = muestraTrimestral(movs, '2026-Q2');
    const b = muestraTrimestral(movs, '2026-Q2');
    assert.deepEqual(a.map((m) => m.id), b.map((m) => m.id));   // determinista
    assert.equal(a.length, 10);
    assert.ok(a.every((m) => m.tipo === 'ajuste' && m.id.startsWith('q2-')));
    const c = muestraTrimestral(movs, '2026-Q3');
    assert.equal(c.length, 0);
});

// ─── (6 · M6) acuerdos de pago anormalmente largos (parqueo de mora) ───────────
test('acuerdosLargos: atrapa el dedazo de año, ignora acuerdos normales/anulados/no-facturas', () => {
    const movs = [
        { id: 'f1', clienteId: 'cliA', tipo: 'factura', monto: 90000, fecha: '2026-06-01', vencimiento: '2099-06-01', anulado: false },
        { id: 'f2', clienteId: 'cliB', tipo: 'factura', monto: 50000, fecha: '2026-06-01', vencimiento: '2026-07-01', anulado: false },
        { id: 'f3', clienteId: 'cliC', tipo: 'factura', monto: 70000, fecha: '2026-06-01', vencimiento: '2026-11-15', anulado: false },
        { id: 'f4', clienteId: 'cliD', tipo: 'factura', monto: 80000, fecha: '2026-06-01', vencimiento: '2099-01-01', anulado: true },
        { id: 'a1', clienteId: 'cliE', tipo: 'ajuste', monto: -10000, fecha: '2026-06-01', vencimiento: '2099-01-01', anulado: false },
        { id: 'f5', clienteId: 'cliF', tipo: 'factura', monto: 60000, fecha: '2026-06-01', anulado: false },
    ];
    const r = acuerdosLargos(movs, { umbralDias: 120 });
    assert.deepEqual(r.map((m) => m.id), ['f1', 'f3']);   // peor primero
    assert.ok(r[0].diasAcuerdo > 26000);                   // ~73 años
    assert.equal(r[1].diasAcuerdo, 167);
});

// ─── (7) Vigilancia de acuerdos de pago (spec 2026-06-12 §1.8) ─────────────────
const tsA = (ms) => ({ toMillis: () => ms, toDate: () => new Date(ms) });   // Timestamp real: ambos
const T0A = Date.UTC(2026, 5, 10);
function acuerdoFix(over = {}) {
    return { id: over.id || 'ac-1', clienteId: 'cliA', alcance: 'saldo', estado: 'vigente',
        fechaPacto: '2026-06-05', cuotas: [{ fecha: '2026-06-20', monto: 50000 }],
        primeraCuotaFecha: '2026-06-20', ultimaCuotaFecha: '2026-06-20',
        nota: 'pacto', creadoEn: tsA(T0A), ...over };
}

test('acuerdosSobreMora: pactado sobre cuenta vencida del corte previo → rojo; sin corte → visible en ámbar', () => {
    const corte = { clientes: { cliA: { vencido: 120000, diasMora: 45 }, cliB: { vencido: 0 } } };
    const acs = [
        acuerdoFix({ id: 'a1', clienteId: 'cliA' }),                      // sobre mora → rojo
        acuerdoFix({ id: 'a2', clienteId: 'cliB' }),                      // estaba al día → no aparece
        acuerdoFix({ id: 'a3', clienteId: 'cliNueva' }),                  // sin corte previo → visible
        acuerdoFix({ id: 'a4', clienteId: 'cliA', creadoEn: tsA(Date.UTC(2026, 3, 1)) }), // otro mes
    ];
    const r = acuerdosSobreMora(acs, '2026-06', corte);
    assert.deepEqual(r.map((x) => x.acuerdo.id), ['a1', 'a3']);
    assert.equal(r[0].vencidoPrevio, 120000);
    assert.equal(r[0].diasMoraPrevio, 45);
    assert.equal(r[1].vencidoPrevio, null);
    // sin corte previo en absoluto → todos los del mes quedan visibles
    assert.equal(acuerdosSobreMora([acuerdoFix()], '2026-06', null).length, 1);
});

test('acuerdosAnomalos: malformado, huérfano, solapados y plan >12 meses', () => {
    const movs = [{ id: 'f-viva', clienteId: 'cliA', tipo: 'factura', monto: 1, anulado: false }];
    const acs = [
        acuerdoFix({ id: 'ok' }),
        acuerdoFix({ id: 'malo', cuotas: [{ fecha: '2026-06-20', monto: 0 }] }),            // monto inválido
        acuerdoFix({ id: 'huerfano', alcance: 'factura', movimientoId: 'f-muerta' }),
        acuerdoFix({ id: 'solape', clienteId: 'cliA' }),                                     // 2º vigente de cliA... (ok+malo+solape = 3)
        acuerdoFix({ id: 'largo', fechaPacto: '2026-06-05', cuotas: [{ fecha: '2027-08-01', monto: 50000 }],
            primeraCuotaFecha: '2027-08-01', ultimaCuotaFecha: '2027-08-01' }),              // 422 días
        acuerdoFix({ id: 'cerrado', estado: 'reemplazado' }),                                // se ignora
    ];
    const r = acuerdosAnomalos(acs, movs, { horizonteDias: 730 });
    assert.deepEqual(r.invalidos.map((a) => a.id), ['malo']);
    assert.deepEqual(r.huerfanos.map((a) => a.id), ['huerfano']);
    assert.equal(r.solapados.length, 1);
    assert.equal(r.solapados[0].clienteId, 'cliA');
    assert.deepEqual(r.largos.map((a) => a.id), ['largo']);
});

test('renegociacionesSeriales: cuenta por creadoEn (reloj de servidor), no por enlaces', () => {
    const acs = [
        acuerdoFix({ id: 'r1', clienteId: 'cliX', creadoEn: tsA(T0A - 30 * 864e5) }),
        acuerdoFix({ id: 'r2', clienteId: 'cliX', creadoEn: tsA(T0A - 5 * 864e5), estado: 'reemplazado' }), // cerrados cuentan
        acuerdoFix({ id: 'r3', clienteId: 'cliY', creadoEn: tsA(T0A - 400 * 864e5) }),  // fuera de ventana
        acuerdoFix({ id: 'r4', clienteId: 'cliY', creadoEn: tsA(T0A) }),
    ];
    const r = renegociacionesSeriales(acs, { ahoraMs: T0A });
    assert.deepEqual(r, [{ clienteId: 'cliX', n: 2 }]);
});

test('acuerdosLargos excluye facturas CUBIERTAS por un plan vigente (M6+acuerdos)', () => {
    const movs = [
        { id: 'f1', clienteId: 'cliA', tipo: 'factura', monto: 90000, fecha: '2026-06-01', vencimiento: '2026-12-01', anulado: false }, // 183d, cubierta por plan
        { id: 'f2', clienteId: 'cliB', tipo: 'factura', monto: 70000, fecha: '2026-06-01', vencimiento: '2026-12-01', anulado: false }, // 183d, SIN plan → aparece
    ];
    const acs = [acuerdoFix({ alcance: 'factura', movimientoId: 'f1', clienteId: 'cliA' })];
    const r = acuerdosLargos(movs, { umbralDias: 120, acuerdos: acs });
    assert.deepEqual(r.map((m) => m.id), ['f2']);
});
