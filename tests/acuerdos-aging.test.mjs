/**
 * Matriz del AGING CON ACUERDOS DE PAGO — ESCUDO de 2 estados (spec **v2** §1.4,
 * Consejo Externo). js/crm-estado-cuenta.js (opts.acuerdos + acuerdoEsValido).
 *
 * v2 (Gemini): NO tramos. Todo acuerdo es de SALDO (cobertura por reloj de
 * servidor). El plan es un ESCUDO: al-día → la deuda cubierta se rige por el
 * cronograma; ROTO (≥N cuotas vencidas impagas) → el escudo CAE y la deuda revive
 * su vencimiento ORIGINAL (mora histórica para el castigo). Sin acuerdos → salida
 * IDÉNTICA a la fórmula previa (primer test la fija).
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

// Movimiento con insumos de acuerdos (registradoEn del servidor; default: antes del pacto).
function mov(tipo, monto, fecha, extra = {}) {
    return {
        id: extra.id || `m-${tipo}-${monto}`, tipo, monto, fecha, anulado: false,
        registradoEn: ts(T0 - 40 * DAY), ...extra,
    };
}

// Acuerdo de SALDO (v2: sin alcance/movimientoId). creadoEn = hace 30 días.
function acuerdo(over = {}) {
    const cuotas = over.cuotas || [
        { fecha: hace(10), monto: 100000 },
        { fecha: en(5), monto: 100000 },
        { fecha: en(20), monto: 100000 },
    ];
    return {
        id: 'ac-1', estado: 'vigente', fechaPacto: hace(30), cuotas,
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

// ─── ESCUDO al día: el exigible acumulado impago, no todo el saldo ─────────────
test('escudo: solo el EXIGIBLE acumulado impago está vencido; aged por la CUOTA', () => {
    // 300k en 3 cuotas de 100k: una venció hace 10 días, dos futuras. Sin abonos.
    const movs = [mov('factura', 300000, hace(30), { id: 'f1' })];
    const r = estadoCuenta(movs, { ...OPTS, acuerdos: [acuerdo()] });
    assert.equal(r.saldo, 300000);
    assert.equal(r.vencido, 100000);          // SOLO la cuota pasada (ni todo el saldo)
    assert.equal(r.alDia, 200000);            // cuotas futuras, al día por pacto
    assert.equal(r.buckets.d1_30, 100000);
    assert.equal(r.diasMora, 10);             // mora de LA CUOTA, no de la factura
    assert.equal(r.fechaVencidoMasAntigua, hace(10));   // la CUOTA impaga más vieja
    assert.equal(r.bajoAcuerdo, 300000);
    assert.deepEqual(r.plan, {
        acuerdoId: 'ac-1', exigible: 100000, vencidoPlan: 100000,
        cuotasVencidas: 1, proximaCuota: { fecha: hace(10), monto: 100000 }, roto: false,
    });
});

test('el abono paga la cuota MÁS VIEJA (desde el frente) → cuota vencida cubierta', () => {
    // El abono es POST-pacto (registradoEn > creadoEn): paga el PLAN. Un abono PRE-pacto
    // bajaría la deuda AL PACTO (D0), no las cuotas (ver test A8). `mov()` registra por
    // defecto pre-pacto, así que se sobreescribe explícitamente aquí.
    const movs = [mov('factura', 300000, hace(30), { id: 'f1' }), mov('abono', 100000, hace(2), { medioPago: 'efectivo', registradoEn: ts(T0 - 1 * DAY) })];
    const r = estadoCuenta(movs, { ...OPTS, acuerdos: [acuerdo()] });
    assert.equal(r.saldo, 200000);
    assert.equal(r.vencido, 0);               // la cuota pasada quedó pagada
    assert.equal(r.alDia, 200000);
    assert.equal(r.estado, 'al-dia');         // P1: cumple su acuerdo → no es morosa hoy
    assert.equal(r.bajoAcuerdo, 200000);
    assert.equal(r.plan.vencidoPlan, 0);
    assert.deepEqual(r.plan.proximaCuota, { fecha: en(5), monto: 100000 });
});

test('abono PARCIAL de la cuota vencida: el resto de ESA cuota sigue vencido', () => {
    const movs = [mov('factura', 300000, hace(30), { id: 'f1' }), mov('abono', 60000, hace(2), { medioPago: 'efectivo', registradoEn: ts(T0 - 1 * DAY) })];   // abono POST-pacto (paga el plan)
    const r = estadoCuenta(movs, { ...OPTS, acuerdos: [acuerdo()] });
    assert.equal(r.vencido, 40000);
    assert.equal(r.plan.vencidoPlan, 40000);
    assert.equal(r.plan.cuotasVencidas, 1);
    assert.deepEqual(r.plan.proximaCuota, { fecha: hace(10), monto: 40000 });
});

test('deuda saldada → plan null, bajoAcuerdo 0 (no se muestra plan a quien no debe)', () => {
    const movs = [mov('factura', 300000, hace(30), { id: 'f1' }), mov('abono', 300000, hace(1), { medioPago: 'efectivo', registradoEn: ts(T0 - 1 * DAY) })];   // abono POST-pacto
    const r = estadoCuenta(movs, { ...OPTS, acuerdos: [acuerdo()] });
    assert.equal(r.estado, 'sin-deuda');
    assert.equal(r.plan, null);
    assert.equal(r.bajoAcuerdo, 0);
});

// ─── PERFORADO: ≥N cuotas rotas → revive el vencimiento ORIGINAL ───────────────
test('roto (≥2 cuotas vencidas impagas): el escudo CAE → mora histórica original', () => {
    // Factura MUY vieja, 3 cuotas todas pasadas e impagas → roto. Sin escudo, la
    // factura envejece por fecha+plazo (mora ~370 días) — lo que el castigo exige.
    const cuotas = [{ fecha: hace(60), monto: 100000 }, { fecha: hace(40), monto: 100000 }, { fecha: hace(20), monto: 100000 }];
    const movs = [mov('factura', 300000, hace(400), { id: 'f1', registradoEn: ts(T0 - 400 * DAY) })];
    const r = estadoCuenta(movs, { ...OPTS, acuerdos: [acuerdo({ fechaPacto: hace(70), creadoEn: ts(T0 - 70 * DAY), cuotas })] });
    assert.equal(r.vencido, 300000);
    assert.equal(r.diasMora, 370);            // hace(400) + 30 → mora histórica
    assert.equal(r.buckets.d60plus, 300000);
    assert.equal(r.bajoAcuerdo, 0);           // el escudo NO protege un acuerdo roto
    assert.equal(r.plan.roto, true);
    assert.equal(r.plan.cuotasVencidas, 3);
});

test('knob incumplidoCuotas: con N=4 las mismas 3 cuotas NO rompen → sigue escudado', () => {
    const cuotas = [{ fecha: hace(60), monto: 100000 }, { fecha: hace(40), monto: 100000 }, { fecha: hace(20), monto: 100000 }];
    const movs = [mov('factura', 300000, hace(400), { id: 'f1', registradoEn: ts(T0 - 400 * DAY) })];
    const r = estadoCuenta(movs, { ...OPTS, incumplidoCuotas: 4, acuerdos: [acuerdo({ fechaPacto: hace(70), creadoEn: ts(T0 - 70 * DAY), cuotas })] });
    assert.equal(r.vencido, 300000);
    assert.equal(r.diasMora, 60);             // aged por la CUOTA más vieja (60), no por la factura (370)
    assert.equal(r.bajoAcuerdo, 300000);      // sigue bajo el escudo
    assert.equal(r.plan.roto, false);
});

// ─── anti-parqueo: sub-programar por SDK no esconde deuda ───────────────────────
test('EXCESO sobre Σcuotas (sub-programación) envejece por su vencimiento ORIGINAL', () => {
    // Factura 500k cubierta, pero cuotas suman solo 300k (futuras): los 200k de
    // exceso NO se esconden — envejecen por su vencimiento M6 (vencido hace 15).
    const movs = [mov('factura', 500000, hace(40), { id: 'f1', vencimiento: hace(15) })];
    const cuotas = [{ fecha: en(5), monto: 150000 }, { fecha: en(20), monto: 150000 }];
    const r = estadoCuenta(movs, { ...OPTS, acuerdos: [acuerdo({ cuotas })] });
    assert.equal(r.vencido, 200000);          // el exceso, por el vencimiento original
    assert.equal(r.alDia, 300000);            // lo pactado, en cuotas futuras
    assert.equal(r.diasMora, 15);
    assert.equal(r.bajoAcuerdo, 300000);      // el exceso NO se etiqueta como pactado
});

test('cuotas INFLADAS sobre la deuda cubierta NO fabrican pagado fantasma (mora real expuesta)', () => {
    // Deuda cubierta REAL = 100k (una factura, sin abonos). Acuerdo INFLADO por SDK:
    // 3 cuotas de 100k (Σ=300k = 3× la deuda), DOS ya vencidas. El clamp viejo hacía
    // pagado = Σcuotas − deudaCubierta = 200k FANTASMA (nadie pagó) → marcaba las 2
    // cuotas vencidas como pagadas → al-día FALSO. El fix acota `pagado` por la
    // reducción FIFO realmente probada (Σ orig−pendiente del libro inmutable) = 0.
    const movs = [mov('factura', 100000, hace(40), { id: 'f1' })];
    const cuotas = [{ fecha: hace(10), monto: 100000 }, { fecha: hace(5), monto: 100000 }, { fecha: en(20), monto: 100000 }];
    const r = estadoCuenta(movs, { ...OPTS, acuerdos: [acuerdo({ cuotas })] });
    assert.equal(r.saldo, 100000);
    assert.equal(r.plan.roto, true);          // 2 cuotas vencidas impagas (no fantasma) → escudo CAE
    assert.equal(r.vencido, 100000);          // la mora real NO se esconde
    assert.equal(r.bajoAcuerdo, 0);
    assert.notEqual(r.estado, 'al-dia');
});

test('A8: abono PRE-PACTO no paga el plan → la mora real NO se oculta (clamp D0)', () => {
    // Factura 200k + abono 100k ambos REGISTRADOS antes del pacto → deuda AL PACTO (D0)
    // = 100k. Acuerdo de 2×100k (Σ=200k, inflado sobre D0), la 1ª cuota ya vencida.
    // BUG A8 (clamp viejo): contaba el abono pre-pacto como "pagado del plan" → marcaba
    // la cuota vieja como pagada → vencido 0 (mora OCULTA). FIX: pagado = D0 − deudaCubierta
    // = 0 (nadie pagó DESPUÉS del pacto) → la cuota vencida queda EXPUESTA.
    const movs = [
        mov('factura', 200000, hace(40), { id: 'f1', registradoEn: ts(T0 - 40 * DAY) }),
        mov('abono', 100000, hace(35), { id: 'ab1', registradoEn: ts(T0 - 35 * DAY) }),   // PRE-pacto (pacto = hace 30)
    ];
    const cuotas = [{ fecha: hace(10), monto: 100000 }, { fecha: en(20), monto: 100000 }];
    const r = estadoCuenta(movs, { ...OPTS, acuerdos: [acuerdo({ cuotas })] });
    assert.equal(r.saldo, 100000);            // 200k − 100k abono
    assert.equal(r.vencido, 100000);          // la cuota vieja NO está pagada (abono fue pre-pacto)
    assert.equal(r.plan.vencidoPlan, 100000);
    assert.equal(r.plan.cuotasVencidas, 1);
    assert.notEqual(r.estado, 'al-dia');      // no es al-día: tiene una cuota vencida real
});

test('contraste A8: el MISMO abono POST-pacto SÍ paga la cuota vieja (al-día)', () => {
    // Idéntico al A8 pero el abono se registró DESPUÉS del pacto → es un pago del plan:
    // la 1ª cuota queda cubierta. Demuestra que el discriminante es el reloj de servidor.
    const movs = [
        mov('factura', 200000, hace(40), { id: 'f1', registradoEn: ts(T0 - 40 * DAY) }),
        mov('abono', 100000, hace(5), { id: 'ab1', registradoEn: ts(T0 - 5 * DAY) }),   // POST-pacto
    ];
    const cuotas = [{ fecha: hace(10), monto: 100000 }, { fecha: en(20), monto: 100000 }];
    const r = estadoCuenta(movs, { ...OPTS, acuerdos: [acuerdo({ cuotas })] });
    assert.equal(r.saldo, 100000);
    assert.equal(r.vencido, 0);               // la cuota vieja quedó pagada por el abono post-pacto
    assert.equal(r.plan.vencidoPlan, 0);
    assert.equal(r.plan.cuotasVencidas, 0);
});

test('cobertura por reloj de SERVIDOR: factura registrada DESPUÉS del pacto queda fuera', () => {
    const movs = [
        mov('factura', 100000, hace(60), { id: 'vieja', registradoEn: ts(T0 - 60 * DAY) }),
        // retrofechada: fecha vieja pero REGISTRADA después del pacto (hace 5d)
        mov('factura', 80000, hace(60), { id: 'colada', registradoEn: ts(T0 - 5 * DAY) }),
    ];
    const cuotas = [{ fecha: en(10), monto: 100000 }];
    const r = estadoCuenta(movs, { ...OPTS, acuerdos: [acuerdo({ cuotas })] });
    assert.equal(r.alDia, 100000);            // la vieja quedó re-programada (cuota futura)
    assert.equal(r.vencido, 80000);           // la colada envejece por su cuenta (fecha+30 → mora 30)
    assert.equal(r.bajoAcuerdo, 100000);
});

// ─── validación: inválido = IGNORADO = fallback conservador ────────────────────
test('acuerdo inválido (cuotas desordenadas / monto no entero / vacío) → IGNORADO', () => {
    const movs = [mov('factura', 100000, hace(40), { id: 'f1' })];
    const base = estadoCuenta(movs, OPTS);
    const malos = [
        acuerdo({ cuotas: [{ fecha: en(20), monto: 50000 }, { fecha: en(5), monto: 50000 }] }),
        acuerdo({ cuotas: [{ fecha: en(5), monto: 50000.5 }, { fecha: en(20), monto: 49999.5 }] }),
        acuerdo({ cuotas: [] }),
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
    assert.equal(acuerdoEsValido(acuerdo({ ultimaCuotaFecha: '2099-01-01' })), false);  // sobre incoherente
});

test("estado 'reemplazado'/'anulado' → no re-programa nada (solo el vigente manda)", () => {
    const movs = [mov('factura', 100000, hace(40), { id: 'f1' })];
    const base = estadoCuenta(movs, OPTS);
    for (const estado of ['reemplazado', 'anulado']) {
        assert.deepEqual(estadoCuenta(movs, { ...OPTS, acuerdos: [acuerdo({ estado })] }), base);
    }
});

// ─── selección determinista (defensa: el mutex ya garantiza 1 vigente) ─────────
test('dos vigentes que cubren (legacy): gana el MÁS NUEVO (creadoEn; empate → id mayor)', () => {
    const movs = [mov('factura', 100000, hace(60), { registradoEn: ts(T0 - 60 * DAY) })];
    const viejo = acuerdo({ id: 'ac-a', creadoEn: ts(T0 - 20 * DAY), cuotas: [{ fecha: hace(1), monto: 100000 }] });
    const nuevo = acuerdo({ id: 'ac-b', creadoEn: ts(T0 - 2 * DAY), cuotas: [{ fecha: en(15), monto: 100000 }] });
    const r = estadoCuenta(movs, { ...OPTS, acuerdos: [viejo, nuevo] });
    assert.equal(r.vencido, 0);               // aplicó el nuevo (cuota futura), no el viejo
    assert.equal(r.plan.acuerdoId, 'ac-b');
    const gemelo = acuerdo({ id: 'ac-z', creadoEn: ts(T0 - 2 * DAY), cuotas: [{ fecha: en(9), monto: 100000 }] });
    const r2 = estadoCuenta(movs, { ...OPTS, acuerdos: [nuevo, gemelo] });
    assert.equal(r2.plan.acuerdoId, 'ac-z');  // empate exacto → id lexicográfico mayor
});

// ─── bordes ─────────────────────────────────────────────────────────────────────
test('cargo SIN fecha queda FUERA del plan (sigue en sinFecha — conservador)', () => {
    const movs = [{ id: 'x', tipo: 'apertura', monto: 80000, anulado: false, registradoEn: ts(T0 - 60 * DAY) }];
    const r = estadoCuenta(movs, { ...OPTS, acuerdos: [acuerdo()] });
    assert.equal(r.sinFecha, 80000);
    assert.equal(r.bajoAcuerdo, 0);
});

test('día exacto de la cuota: aún al día (misma convención estricta del aging)', () => {
    const movs = [mov('factura', 100000, hace(40), { id: 'f1' })];
    const r = estadoCuenta(movs, { ...OPTS, acuerdos: [acuerdo({ cuotas: [{ fecha: HOY, monto: 100000 }] })] });
    assert.equal(r.vencido, 0);
    assert.equal(r.plan.cuotasVencidas, 0);
});
