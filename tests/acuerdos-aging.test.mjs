/**
 * Matriz de tests del AGING CON ACUERDOS DE PAGO (spec 2026-06-12 §1.4, slice 1) —
 * js/crm-estado-cuenta.js (opts.acuerdos + acuerdoEsValido). Runner: node:test.
 *
 * Invariante maestro: el acuerdo NO mueve dinero — re-programa la EXIGIBILIDAD.
 * Sin acuerdos la salida es IDÉNTICA a la fórmula previa (primer test la fija).
 *
 *   npm run test:acuerdos
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estadoCuenta, acuerdoEsValido } from '../js/crm-estado-cuenta.js';

const HOY = '2026-06-07';
const DAY = 86400000;
const T0 = Date.UTC(2026, 5, 7);
const ts = (ms) => ({ toMillis: () => ms });
const hace = (n) => new Date(T0 - n * DAY).toISOString().slice(0, 10);
const en = (n) => new Date(T0 + n * DAY).toISOString().slice(0, 10);

// Movimiento con insumos de acuerdos (id + registradoEn de servidor).
function mov(tipo, monto, fecha, extra = {}) {
    return {
        id: extra.id || `m-${tipo}-${monto}`, tipo, monto, fecha, anulado: false,
        registradoEn: ts(T0 - 40 * DAY), ...extra,
    };
}

function acuerdo(over = {}) {
    const cuotas = over.cuotas || [
        { fecha: hace(10), monto: 100000 },
        { fecha: en(5), monto: 100000 },
        { fecha: en(20), monto: 100000 },
    ];
    return {
        id: 'ac-1', estado: 'vigente', alcance: 'saldo', fechaPacto: hace(30),
        cuotas,
        primeraCuotaFecha: cuotas[0]?.fecha ?? '',
        ultimaCuotaFecha: cuotas[cuotas.length - 1]?.fecha ?? '',
        creadoEn: ts(T0 - 30 * DAY),
        ...over,
    };
}

const OPTS = { hoy: HOY, diasPlazo: 30 };

// ─── invariante maestro: sin acuerdos, NADA cambia ─────────────────────────────
test('acuerdos:[] u omitido → salida IDÉNTICA a la fórmula previa (campo a campo)', () => {
    const movs = [mov('factura', 300000, hace(40), { vencimiento: hace(5) }), mov('abono', 50000, hace(3))];
    const sin = estadoCuenta(movs, OPTS);
    const vacio = estadoCuenta(movs, { ...OPTS, acuerdos: [] });
    assert.deepEqual(vacio, sin);
    assert.equal(sin.plan, null);
    assert.equal(sin.bajoAcuerdo, 0);
});

// ─── el caso central: factura en cuotas ────────────────────────────────────────
test('cuotas: solo el EXIGIBLE acumulado impago está vencido; el resto al día', () => {
    // 300k en 3 cuotas de 100k: una venció hace 10 días, dos son futuras. Sin abonos.
    const movs = [mov('factura', 300000, hace(30), { id: 'f1' })];
    const r = estadoCuenta(movs, { ...OPTS, acuerdos: [acuerdo({ alcance: 'factura', movimientoId: 'f1' })] });
    assert.equal(r.saldo, 300000);
    assert.equal(r.vencido, 100000);          // SOLO la cuota pasada (ni todo el saldo)
    assert.equal(r.alDia, 200000);            // cuotas futuras
    assert.equal(r.buckets.d1_30, 100000);
    assert.equal(r.diasMora, 10);             // mora de LA CUOTA, no de la factura
    assert.equal(r.fechaVencidoMasAntigua, hace(30));   // fecha del HECHO del cargo
    assert.equal(r.bajoAcuerdo, 300000);
    assert.deepEqual(r.plan, {
        acuerdoId: 'ac-1', exigible: 100000, cubierto: 0, vencidoPlan: 100000,
        cuotasVencidas: 1, proximaCuota: { fecha: hace(10), monto: 100000 },
    });
});

test('el abono paga la cuota MÁS VIEJA (desde el frente): cuota vencida queda cubierta', () => {
    const movs = [mov('factura', 300000, hace(30), { id: 'f1' }), mov('abono', 100000, hace(2), { medioPago: 'efectivo' })];
    const r = estadoCuenta(movs, { ...OPTS, acuerdos: [acuerdo({ alcance: 'factura', movimientoId: 'f1' })] });
    assert.equal(r.saldo, 200000);
    assert.equal(r.vencido, 0);               // la cuota pasada quedó pagada
    assert.equal(r.alDia, 200000);
    assert.equal(r.estado, 'al-dia');         // P1: cumple su acuerdo → no es morosa hoy
    assert.equal(r.bajoAcuerdo, 200000);
    assert.equal(r.plan.cubierto, 100000);    // exigible 100k, todo cubierto
    assert.deepEqual(r.plan.proximaCuota, { fecha: en(5), monto: 100000 });
});

test('abono PARCIAL de la cuota vencida: el resto de ESA cuota sigue vencido', () => {
    const movs = [mov('factura', 300000, hace(30), { id: 'f1' }), mov('abono', 60000, hace(2), { medioPago: 'efectivo' })];
    const r = estadoCuenta(movs, { ...OPTS, acuerdos: [acuerdo({ alcance: 'factura', movimientoId: 'f1' })] });
    assert.equal(r.vencido, 40000);
    assert.equal(r.plan.vencidoPlan, 40000);
    assert.equal(r.plan.cuotasVencidas, 1);
    assert.deepEqual(r.plan.proximaCuota, { fecha: hace(10), monto: 40000 });
});

test('deuda saldada → cero tramos, plan null (nada pendiente que mostrar)', () => {
    const movs = [mov('factura', 300000, hace(30), { id: 'f1' }), mov('abono', 300000, hace(1), { medioPago: 'efectivo' })];
    const r = estadoCuenta(movs, { ...OPTS, acuerdos: [acuerdo({ alcance: 'factura', movimientoId: 'f1' })] });
    assert.equal(r.estado, 'sin-deuda');
    assert.equal(r.plan, null);
    assert.equal(r.bajoAcuerdo, 0);
});

// ─── anti-parqueo: el cronograma es la única verdad ────────────────────────────
test('EXCEDENTE sobre Σcuotas envejece por su vencimiento ORIGINAL (inflar no parquea)', () => {
    // Factura 500k con acuerdo de solo 300k en cuotas futuras: los 200k restantes
    // siguen envejeciendo por su vencimiento M6 (vencido hace 15 días).
    const movs = [mov('factura', 500000, hace(40), { id: 'f1', vencimiento: hace(15) })];
    const cuotas = [{ fecha: en(5), monto: 150000 }, { fecha: en(20), monto: 150000 }];
    const r = estadoCuenta(movs, { ...OPTS, acuerdos: [acuerdo({ alcance: 'factura', movimientoId: 'f1', cuotas })] });
    assert.equal(r.vencido, 200000);          // el excedente, por el vencimiento original
    assert.equal(r.alDia, 300000);            // lo pactado, en cuotas futuras
    assert.equal(r.diasMora, 15);
    assert.equal(r.bajoAcuerdo, 300000);      // el excedente NO se etiqueta como pactado
});

test("alcance 'saldo' NO cubre facturas REGISTRADAS después del pacto (reloj de servidor)", () => {
    const movs = [
        mov('factura', 100000, hace(60), { id: 'vieja', registradoEn: ts(T0 - 60 * DAY) }),
        // retrofechada: fecha vieja pero REGISTRADA después del pacto (hace 30d)
        mov('factura', 80000, hace(60), { id: 'colada', registradoEn: ts(T0 - 5 * DAY) }),
    ];
    const cuotas = [{ fecha: en(10), monto: 100000 }];
    const r = estadoCuenta(movs, { ...OPTS, acuerdos: [acuerdo({ cuotas })] });
    assert.equal(r.alDia, 100000);            // la vieja quedó re-programada (cuota futura)
    assert.equal(r.vencido, 80000);           // la colada envejece por su cuenta (fecha+30 → mora 30)
    assert.equal(r.bajoAcuerdo, 100000);
});

// ─── validación: inválido = IGNORADO = fallback conservador ────────────────────
test('acuerdo inválido (cuotas desordenadas / monto no entero / tamaño) → IGNORADO', () => {
    const movs = [mov('factura', 100000, hace(40), { id: 'f1' })];
    const base = estadoCuenta(movs, OPTS);
    const malos = [
        acuerdo({ alcance: 'factura', movimientoId: 'f1', cuotas: [{ fecha: en(20), monto: 50000 }, { fecha: en(5), monto: 50000 }] }),
        acuerdo({ alcance: 'factura', movimientoId: 'f1', cuotas: [{ fecha: en(5), monto: 50000.5 }, { fecha: en(20), monto: 49999.5 }] }),
        acuerdo({ alcance: 'factura', movimientoId: 'f1', cuotas: [] }),
    ];
    for (const a of malos) {
        assert.equal(acuerdoEsValido(a), false);
        assert.deepEqual(estadoCuenta(movs, { ...OPTS, acuerdos: [a] }), base);
    }
});

test('horizonte: última cuota más allá del tope (P3: 730d) → inválido; knob lo gobierna', () => {
    const lejos = acuerdo({ cuotas: [{ fecha: en(800), monto: 100000 }] });
    assert.equal(acuerdoEsValido(lejos), false);
    assert.equal(acuerdoEsValido(lejos, { horizonteDias: 900 }), true);
    // el "sobre" denormalizado también se exige coherente
    assert.equal(acuerdoEsValido(acuerdo({ ultimaCuotaFecha: '2099-01-01' })), false);
});

test("estado 'reemplazado'/'anulado' → no re-programa nada (solo el vigente manda)", () => {
    const movs = [mov('factura', 100000, hace(40), { id: 'f1' })];
    const base = estadoCuenta(movs, OPTS);
    for (const estado of ['reemplazado', 'anulado']) {
        const r = estadoCuenta(movs, { ...OPTS, acuerdos: [acuerdo({ alcance: 'factura', movimientoId: 'f1', estado })] });
        assert.deepEqual(r, base);
    }
});

test('huérfano post-corrección: movimientoId que ya no existe → fallback benigno', () => {
    const movs = [mov('factura', 100000, hace(40), { id: 'f-nuevo', vencimiento: en(10) })];
    const r = estadoCuenta(movs, { ...OPTS, acuerdos: [acuerdo({ alcance: 'factura', movimientoId: 'f-viejo' })] });
    assert.equal(r.alDia, 100000);            // manda el vencimiento M6 del reemplazo
    assert.equal(r.plan, null);
    assert.equal(r.bajoAcuerdo, 0);
});

// ─── selección determinista ────────────────────────────────────────────────────
test('dos vigentes que cubren el mismo cargo: gana el MÁS NUEVO (creadoEn; empate → id mayor)', () => {
    const movs = [mov('factura', 100000, hace(60), { registradoEn: ts(T0 - 60 * DAY) })];
    const viejo = acuerdo({ id: 'ac-a', creadoEn: ts(T0 - 20 * DAY), cuotas: [{ fecha: hace(1), monto: 100000 }] });
    const nuevo = acuerdo({ id: 'ac-b', creadoEn: ts(T0 - 2 * DAY), cuotas: [{ fecha: en(15), monto: 100000 }] });
    const r = estadoCuenta(movs, { ...OPTS, acuerdos: [viejo, nuevo] });
    assert.equal(r.vencido, 0);               // aplicó el nuevo (cuota futura), no el viejo
    assert.equal(r.plan.acuerdoId, 'ac-b');
    // Empate exacto de creadoEn → id lexicográfico mayor
    const gemelo = acuerdo({ id: 'ac-z', creadoEn: ts(T0 - 2 * DAY), cuotas: [{ fecha: hace(2), monto: 100000 }] });
    const r2 = estadoCuenta(movs, { ...OPTS, acuerdos: [nuevo, gemelo] });
    assert.equal(r2.plan.acuerdoId, 'ac-z');
});

// ─── bordes que ya cuidaba la fórmula ──────────────────────────────────────────
test("cargo SIN fecha queda FUERA del plan (sigue en sinFecha — conservador)", () => {
    const movs = [{ id: 'x', tipo: 'apertura', monto: 80000, anulado: false, registradoEn: ts(T0 - 60 * DAY) }];
    const r = estadoCuenta(movs, { ...OPTS, acuerdos: [acuerdo()] });
    assert.equal(r.sinFecha, 80000);
    assert.equal(r.bajoAcuerdo, 0);
});

test('precedencia: el acuerdo manda SOBRE el vencimiento M6 del propio cargo', () => {
    // vencimiento M6 ya pasado, pero el acuerdo re-programa a cuota futura → al día.
    const movs = [mov('factura', 100000, hace(40), { id: 'f1', vencimiento: hace(10) })];
    const cuotas = [{ fecha: en(10), monto: 100000 }];
    const r = estadoCuenta(movs, { ...OPTS, acuerdos: [acuerdo({ alcance: 'factura', movimientoId: 'f1', cuotas })] });
    assert.equal(r.vencido, 0);
    assert.equal(r.alDia, 100000);
});

test('día exacto de la cuota: aún al día (misma convención estricta del aging)', () => {
    const movs = [mov('factura', 100000, hace(40), { id: 'f1' })];
    const cuotas = [{ fecha: HOY, monto: 100000 }];
    const r = estadoCuenta(movs, { ...OPTS, acuerdos: [acuerdo({ alcance: 'factura', movimientoId: 'f1', cuotas })] });
    assert.equal(r.vencido, 0);
    assert.equal(r.plan.cuotasVencidas, 0);
});
