/**
 * Integración de los ABONOS DE CARTERA contra el emulador Firestore (F-TESORERÍA B5 · V17).
 *   firebase emulators:exec --only firestore --project demo-bersaglio "node --test functions/cartera.integration.test.mjs"
 *   (o: FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node --test functions/cartera.integration.test.mjs)
 *
 * EL AGUJERO QUE CIERRA (V17, consejo externo §0.7 — P0):
 *   un abono en EFECTIVO baja la deuda de la clienta, pero el billete no entraba a NINGÚN libro de
 *   efectivo → el arqueo del turno no lo esperaba → si el billete se va al bolsillo, el arqueo
 *   CUADRA igual. Vector de robo perfecto. Fix: la MISMA transacción que registra el abono escribe
 *   su pata en `turnos/{id}/movsCaja` → el esperado del arqueo la pide automáticamente.
 *
 * DESVÍO DELIBERADO de la letra de la spec (§G.4 Desafío Crítico, con evidencia — igual que L-73):
 *   la spec dice «tipo nuevo `abono_cartera`»; la pata nace `tipo:'ingreso'` +
 *   `concepto:'abono_cartera'`. Razón: la ecuación del esperado está COPIADA en 3 sitios
 *   (caja-core `cerrarTurnoCore`, `pos.js movsSums`, `auditoria.js`) y suma solo ingreso/egreso —
 *   uno de ellos rotula lo desconocido como "Ingreso". Un `tipo` nuevo deja la plata a merced del
 *   espejo que alguien olvide; con `ingreso` entra al esperado en los 3 SIN tocar la ecuación,
 *   que es literalmente lo que la spec dice que debe pasar («entra al esperado automáticamente»).
 *   La distinción humana la da el `concepto`.
 *
 * Invariantes cubiertos (skill `auditoria-financiera`): #1 conservación · #2 mismo número en todas
 * las vistas · #3 idempotencia REAL (por-libro, ANCLADA al turno) · #4 deshacer netea TODO ·
 * #7 las anomalías GRITAN (nunca se tragan en silencio).
 * Escribe vía firebase-admin (bypassa reglas, = la CF).
 */
import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import core from './cartera-core.js';
import cajaCore from './caja-core.js';
import saldoMod from './saldo.js';
import tesoCore from './tesoreria-core.js';

const { computeSaldo } = saldoMod;
const { registrarAbonoCarteraCore, anularAbonoCarteraCore, asignarCuentaAbonoCore, MEDIOS_ABONO, CONCEPTO_ABONO } = core;
const { abrirTurnoCore, cerrarTurnoCore, movimientoCajaCore } = cajaCore;

initializeApp({ projectId: 'demo-bersaglio' });
const db = getFirestore();

const CLI = 'cliV17';
const limpiarPuntero = () => db.doc('caja/estado').delete().catch(() => {});

/** Borra los turnos y sus movsCaja (el path de idempotencia es POR turno). */
async function limpiarTurnos() {
    const ts = await db.collection('turnos').get();
    for (const t of ts.docs) {
        const movs = await t.ref.collection('movsCaja').get();
        await Promise.all(movs.docs.map((d) => d.ref.delete()));
        await t.ref.delete();
    }
}

/** Deja a la clienta con una factura de $2.000.000 y sin abonos. */
async function resetCliente() {
    const movs = await db.collection(`clientes/${CLI}/movimientos`).get();
    await Promise.all(movs.docs.map((d) => d.ref.delete()));
    await db.doc(`clientes/${CLI}`).set({ nombre: 'María Gómez', activo: true });
    await db.doc(`clientes/${CLI}/movimientos/fac1`).set({
        tipo: 'factura', monto: 2000000, fecha: '2026-07-01', anulado: false, registradoPor: 'kary',
    });
}

/** Saldo por la fórmula AUTORIDAD (la misma del trigger recalcSaldoCliente). */
async function saldoDe(clienteId = CLI) {
    const snap = await db.collection(`clientes/${clienteId}/movimientos`).get();
    return computeSaldo(snap.docs.map((d) => d.data()));
}

/** Limpia el libro de tesorería y sus cuentas entre escenarios de D9. */
async function limpiarTesoreria() {
    for (const col of ['cuentasTesoreria', 'movimientosTesoreria']) {
        const snap = await db.collection(col).get();
        await Promise.all(snap.docs.map((d) => d.ref.delete()));
    }
}

const autor = { uid: 'kary', nombre: 'Kary' };
// Alertas: se INYECTAN (patrón caja-core) → aquí las capturamos para probar que la anomalía GRITA.
let alertas = [];
const opts = { notificar: async (evt) => { alertas.push(evt); } };

before(async () => { await limpiarPuntero(); await limpiarTurnos(); });
beforeEach(async () => { alertas = []; await limpiarPuntero(); await limpiarTurnos(); await resetCliente(); });

// ─── V17 · el billete entra al arqueo (el corazón del control) ───────────────
test('abono en EFECTIVO con turno abierto → baja la deuda Y el arqueo espera el billete', async () => {
    await abrirTurnoCore(db, { opId: 'T1', fondoApertura: 100000, autor: 'kary' });
    const r = await registrarAbonoCarteraCore(db, {
        opId: 'AB1', clienteId: CLI, monto: 500000, fecha: '2026-07-25',
        medioPago: 'efectivo', descripcion: 'Abono en tienda', autor,
    }, opts);

    assert.equal(r.yaExistia, false);
    assert.deepEqual(r.pataCaja, { turnoId: 'T1', movId: 'AB1-caja' });
    // (a) libro de cartera: la deuda bajó
    assert.equal(await saldoDe(), 1500000);
    const mov = (await db.doc(`clientes/${CLI}/movimientos/AB1`).get()).data();
    assert.equal(mov.tipo, 'abono');
    assert.equal(mov.monto, 500000);
    assert.equal(mov.medioPago, 'efectivo');
    assert.equal(mov.anulado, false);
    assert.equal(mov.pataCaja.turnoId, 'T1', 'el turno queda ANCLADO en el movimiento (idempotencia por-libro)');
    // (b) libro de caja: la pata nace como INGRESO (para que las 3 vistas del esperado la sumen solas)
    const pata = (await db.doc('turnos/T1/movsCaja/AB1-caja').get()).data();
    assert.equal(pata.tipo, 'ingreso');
    assert.equal(pata.concepto, CONCEPTO_ABONO);
    assert.equal(pata.monto, 500000);
    assert.equal(pata.refAbono.clienteId, CLI);
    assert.equal(pata.refAbono.movId, 'AB1');
    // (c) EL CONTROL: el arqueo pide el billete → 100.000 (fondo) + 500.000 (abono) = 600.000
    const cierre = await cerrarTurnoCore(db, { turnoId: 'T1', conteoPorMedio: { efectivo: 600000 }, autor: 'kary' });
    assert.equal(cierre.esperadoEfectivo, 600000);
    assert.equal(cierre.descuadre, 0);
});

test('el billete robado ahora GRITA: si no aparece en el conteo, el arqueo marca la falta', async () => {
    await abrirTurnoCore(db, { opId: 'T2', fondoApertura: 100000, autor: 'kary' });
    await registrarAbonoCarteraCore(db, {
        opId: 'AB2', clienteId: CLI, monto: 500000, fecha: '2026-07-25', medioPago: 'efectivo', autor,
    }, opts);
    // Kary declara solo el fondo (el billete del abono no está en el cajón).
    const cierre = await cerrarTurnoCore(db, { turnoId: 'T2', conteoPorMedio: { efectivo: 100000 }, autor: 'kary' });
    assert.equal(cierre.esperadoEfectivo, 600000);
    assert.equal(cierre.descuadre, -500000, 'ANTES de V17 esto daba 0 y el robo era invisible');
});

// ─── V17 · sin turno no hay custodia (rechazo TOTAL, atómico) ────────────────
test('abono en EFECTIVO sin turno abierto → rechaza TODO (la deuda no se mueve)', async () => {
    await assert.rejects(
        registrarAbonoCarteraCore(db, {
            opId: 'AB3', clienteId: CLI, monto: 500000, fecha: '2026-07-25', medioPago: 'efectivo', autor,
        }, opts),
        (e) => e.code === 'failed-precondition' && /caja/i.test(e.message) && /Mostrador/i.test(e.message),
    );
    assert.equal(await saldoDe(), 2000000, 'atomicidad: sin pata de caja, tampoco hay abono');
    assert.equal((await db.doc(`clientes/${CLI}/movimientos/AB3`).get()).exists, false);
});

test('abono en efectivo con el turno YA CERRADO → rechaza (su arqueo está sellado)', async () => {
    await abrirTurnoCore(db, { opId: 'T3', fondoApertura: 100000, autor: 'kary' });
    await cerrarTurnoCore(db, { turnoId: 'T3', conteoPorMedio: { efectivo: 100000 }, autor: 'kary' });
    await assert.rejects(
        registrarAbonoCarteraCore(db, {
            opId: 'AB4', clienteId: CLI, monto: 300000, fecha: '2026-07-25', medioPago: 'efectivo', autor,
        }, opts),
        (e) => e.code === 'failed-precondition',
    );
    assert.equal(await saldoDe(), 2000000);
});

// ─── V17 · medios que NO son efectivo: cero cambios en caja ──────────────────
test('abono por TRANSFERENCIA → NO toca la caja (el esperado del arqueo no cambia)', async () => {
    await abrirTurnoCore(db, { opId: 'T4', fondoApertura: 100000, autor: 'kary' });
    const r = await registrarAbonoCarteraCore(db, {
        opId: 'AB5', clienteId: CLI, monto: 400000, fecha: '2026-07-25', medioPago: 'transferencia', autor,
    }, opts);
    assert.equal(r.pataCaja, null);
    assert.equal(await saldoDe(), 1600000);
    assert.equal((await db.collection('turnos/T4/movsCaja').get()).size, 0);
    const cierre = await cerrarTurnoCore(db, { turnoId: 'T4', conteoPorMedio: { efectivo: 100000 }, autor: 'kary' });
    assert.equal(cierre.esperadoEfectivo, 100000);
});

test('abono por transferencia SIN turno abierto → se registra igual (no exige caja)', async () => {
    const r = await registrarAbonoCarteraCore(db, {
        opId: 'AB6', clienteId: CLI, monto: 400000, fecha: '2026-07-25', medioPago: 'transferencia', autor,
    }, opts);
    assert.equal(r.pataCaja, null);
    assert.equal(await saldoDe(), 1600000);
});

// ─── #3 Idempotencia REAL: POR-LIBRO y ANCLADA al turno ─────────────────────
test('replay del MISMO opId → ni duplica el abono ni duplica la pata', async () => {
    await abrirTurnoCore(db, { opId: 'T5', fondoApertura: 100000, autor: 'kary' });
    const p = { opId: 'AB7', clienteId: CLI, monto: 500000, fecha: '2026-07-25', medioPago: 'efectivo', autor };
    await registrarAbonoCarteraCore(db, p, opts);
    const r2 = await registrarAbonoCarteraCore(db, p, opts);
    assert.equal(r2.yaExistia, true);
    assert.equal(await saldoDe(), 1500000, 'la deuda bajó UNA sola vez');
    assert.equal((await db.collection('turnos/T5/movsCaja').get()).size, 1);
    const cierre = await cerrarTurnoCore(db, { turnoId: 'T5', conteoPorMedio: { efectivo: 600000 }, autor: 'kary' });
    assert.equal(cierre.esperadoEfectivo, 600000, 'el billete se espera UNA vez, no dos');
});

test('POR-LIBRO: si la pata falta (fallo parcial) y su turno sigue abierto, el replay la crea', async () => {
    await abrirTurnoCore(db, { opId: 'T6', fondoApertura: 100000, autor: 'kary' });
    const p = { opId: 'AB8', clienteId: CLI, monto: 500000, fecha: '2026-07-25', medioPago: 'efectivo', autor };
    await registrarAbonoCarteraCore(db, p, opts);
    await db.doc('turnos/T6/movsCaja/AB8-caja').delete();          // simula el fallo parcial
    const r = await registrarAbonoCarteraCore(db, p, opts);
    assert.equal(r.yaExistia, true);
    assert.equal(r.pataCreada, true, 'jamás "éxito previo" global: se verifica CADA libro');
    assert.equal((await db.collection('turnos/T6/movsCaja').get()).size, 1);
    assert.equal(await saldoDe(), 1500000, 'y la cartera NO se duplica');
});

test('ANCLADA al turno: si el turno del abono ya cerró, el replay NO inyecta plata en el arqueo sellado — GRITA', async () => {
    await abrirTurnoCore(db, { opId: 'T7', fondoApertura: 100000, autor: 'kary' });
    const p = { opId: 'AB9', clienteId: CLI, monto: 500000, fecha: '2026-07-25', medioPago: 'efectivo', autor };
    await registrarAbonoCarteraCore(db, p, opts);
    await db.doc('turnos/T7/movsCaja/AB9-caja').delete();
    await cerrarTurnoCore(db, { turnoId: 'T7', conteoPorMedio: { efectivo: 100000 }, autor: 'kary' });
    await abrirTurnoCore(db, { opId: 'T8', fondoApertura: 50000, autor: 'kary' });   // otro turno abierto AHORA

    const r = await registrarAbonoCarteraCore(db, p, opts);
    assert.equal(r.yaExistia, true);
    assert.equal(r.pataFaltante, true);
    assert.equal((await db.collection('turnos/T7/movsCaja').get()).size, 0, 'no se reescribe un arqueo sellado');
    assert.equal((await db.collection('turnos/T8/movsCaja').get()).size, 0, 'ni se mete en el turno equivocado');
    assert.ok(alertas.some((a) => a.evento === 'abono_pata_faltante' && a.alOwner === true),
        'la anomalía no se traga en silencio (invariante #7)');
});

// ─── #4 Deshacer netea TODO (en los DOS libros) ─────────────────────────────
test('anular un abono en efectivo con el turno abierto → netea cartera Y caja en la misma tx', async () => {
    await abrirTurnoCore(db, { opId: 'T9', fondoApertura: 100000, autor: 'kary' });
    await registrarAbonoCarteraCore(db, {
        opId: 'ABA', clienteId: CLI, monto: 500000, fecha: '2026-07-25', medioPago: 'efectivo', autor,
    }, opts);
    const r = await anularAbonoCarteraCore(db, {
        clienteId: CLI, movId: 'ABA', motivo: 'La clienta se arrepintió', motivoCategoria: 'ERROR_REGISTRO', autor,
    }, opts);
    assert.equal(r.pataAnulada, true);
    assert.equal(await saldoDe(), 2000000, 'la deuda volvió');
    assert.equal((await db.doc('turnos/T9/movsCaja/ABA-caja').get()).data().anulado, true);
    const cierre = await cerrarTurnoCore(db, { turnoId: 'T9', conteoPorMedio: { efectivo: 100000 }, autor: 'kary' });
    assert.equal(cierre.esperadoEfectivo, 100000, 'el arqueo ya NO pide un billete que no existe');
    assert.equal(cierre.descuadre, 0);
});

test('anular un abono cuyo turno ya CERRÓ → rechaza y no muta nada (arqueo firmado, no se reescribe)', async () => {
    await abrirTurnoCore(db, { opId: 'TB', fondoApertura: 100000, autor: 'kary' });
    await registrarAbonoCarteraCore(db, {
        opId: 'ABB', clienteId: CLI, monto: 500000, fecha: '2026-07-25', medioPago: 'efectivo', autor,
    }, opts);
    await cerrarTurnoCore(db, { turnoId: 'TB', conteoPorMedio: { efectivo: 600000 }, autor: 'kary' });
    await assert.rejects(
        anularAbonoCarteraCore(db, { clienteId: CLI, movId: 'ABB', motivo: 'me equivoqué', autor }, opts),
        (e) => e.code === 'failed-precondition' && /cerrad/i.test(e.message),
    );
    assert.equal(await saldoDe(), 1500000, 'la cartera NO se movió');
    assert.equal((await db.doc('turnos/TB/movsCaja/ABB-caja').get()).data().anulado, undefined);
});

test('anular un abono SIN pata (transferencia) → funciona como siempre', async () => {
    await registrarAbonoCarteraCore(db, {
        opId: 'ABC', clienteId: CLI, monto: 300000, fecha: '2026-07-25', medioPago: 'transferencia', autor,
    }, opts);
    const r = await anularAbonoCarteraCore(db, { clienteId: CLI, movId: 'ABC', motivo: 'duplicado', autor }, opts);
    assert.equal(r.pataAnulada, false);
    assert.equal(await saldoDe(), 2000000);
    const mov = (await db.doc(`clientes/${CLI}/movimientos/ABC`).get()).data();
    assert.equal(mov.anulado, true);
    assert.equal(mov.motivoAnulacion, 'duplicado');
    assert.ok(mov.anuladoEn, 'sello del servidor');
});

test('anular dos veces → idempotente (no vuelve a mover la deuda)', async () => {
    await abrirTurnoCore(db, { opId: 'TC2', fondoApertura: 100000, autor: 'kary' });
    await registrarAbonoCarteraCore(db, {
        opId: 'ABD', clienteId: CLI, monto: 200000, fecha: '2026-07-25', medioPago: 'efectivo', autor,
    }, opts);
    await anularAbonoCarteraCore(db, { clienteId: CLI, movId: 'ABD', motivo: 'x', autor }, opts);
    const r2 = await anularAbonoCarteraCore(db, { clienteId: CLI, movId: 'ABD', motivo: 'x', autor }, opts);
    assert.equal(r2.yaEstabaAnulado, true);
    assert.equal(await saldoDe(), 2000000);
});

// ─── Una sola puerta: la caja manual NO puede fabricar la pata (V12 análogo) ─
test('la puerta MANUAL de caja rechaza el concepto `abono_cartera` (solo lo crea la CF del abono)', async () => {
    await abrirTurnoCore(db, { opId: 'TD2', fondoApertura: 100000, autor: 'kary' });
    await assert.rejects(
        movimientoCajaCore(db, { turnoId: 'TD2', opId: 'MAN1', tipo: 'ingreso', concepto: CONCEPTO_ABONO, monto: 100000, autor: 'kary' }),
        (e) => e.code === 'invalid-argument',
    );
});

// ─── Guards de frontera ─────────────────────────────────────────────────────
test('validaciones: medio inválido · monto no entero positivo · fecha mal · clienta inexistente', async () => {
    await abrirTurnoCore(db, { opId: 'TE2', fondoApertura: 100000, autor: 'kary' });
    const base = { clienteId: CLI, monto: 100000, fecha: '2026-07-25', medioPago: 'efectivo', autor };
    await assert.rejects(registrarAbonoCarteraCore(db, { ...base, opId: 'V1', medioPago: 'cripto' }, opts), /medio/i);
    await assert.rejects(registrarAbonoCarteraCore(db, { ...base, opId: 'V2', monto: 0 }, opts), /mayor/i);
    await assert.rejects(registrarAbonoCarteraCore(db, { ...base, opId: 'V3', monto: -5000 }, opts), /mayor/i);
    await assert.rejects(registrarAbonoCarteraCore(db, { ...base, opId: 'V4', monto: 1500.5 }, opts), /entero|mayor/i);
    await assert.rejects(registrarAbonoCarteraCore(db, { ...base, opId: 'V5', fecha: '25/07/2026' }, opts), /fecha/i);
    await assert.rejects(registrarAbonoCarteraCore(db, { ...base, opId: 'V6', clienteId: 'noExiste' }, opts), /client/i);
    await assert.rejects(registrarAbonoCarteraCore(db, { ...base, opId: '' }, opts), /opId/i);
    assert.equal(await saldoDe(), 2000000, 'ninguna validación dejó basura en el libro');
});

test('MEDIOS_ABONO es espejo EXACTO de la lista literal de firestore.rules', () => {
    assert.deepEqual(MEDIOS_ABONO, ['efectivo', 'transferencia', 'datafono', 'otro']);
});

// ═══ D9 · la otra costura: ¿a qué CUENTA entró la transferencia? ═══════════════════════════════
// El abono en efectivo entra a la caja (V17); el que llega por TRANSFERENCIA entra a un banco, y
// hasta ahora tampoco aparecía en ningún libro: el saldo del banco no lo veía y el cuadre mensual
// nunca cerraba. Misma doctrina: la MISMA tx escribe la pata `abono_cartera` en
// `movimientosTesoreria/{opId}-teso` (fuente SISTEMA; la puerta MANUAL la rechaza — V12, ya probado
// en tesoreria.integration test 14). `cuentaId` es OPCIONAL a propósito (V12: "todavía no sé" es una
// respuesta legítima), y esos abonos quedan listables para cerrarlos en "Cuadrar mes".
async function cuentaBanco(id, extra = {}) {
    await tesoCore.crearCuentaTesoreriaCore(db, {
        opId: id, nombre: `Cuenta ${id}`, banco: 'Bancolombia', tipo: 'banco', titular: 'kary',
        saldoInicial: extra.saldoInicial ?? 0, fechaCorte: extra.fechaCorte ?? '2026-01-01',
        esDeSocia: false, autor: 'testUid',
    });
    return id;
}
const saldoCuenta = async (id) => {
    const cta = (await db.doc(`cuentasTesoreria/${id}`).get()).data();
    const movs = await db.collection('movimientosTesoreria').where('cuentaId', '==', id).get();
    return tesoCore.computeSaldoCuenta(cta.saldoInicial?.monto ?? 0,
        movs.docs.map((d) => ({ id: d.id, ...d.data() })));
};

test('D9 · abono por TRANSFERENCIA con cuenta → la plata entra al banco en la MISMA tx', async () => {
    await limpiarTesoreria();
    await cuentaBanco('BCO1');
    const r = await registrarAbonoCarteraCore(db, {
        opId: 'D9A', clienteId: CLI, monto: 400000, fecha: '2026-07-25',
        medioPago: 'transferencia', cuentaId: 'BCO1', autor,
    }, opts);
    assert.deepEqual(r.pataTeso, { cuentaId: 'BCO1', movId: 'D9A-teso' });
    assert.equal(r.pataCaja, null, 'una transferencia NO toca la caja del turno');
    assert.equal(await saldoDe(), 1600000);
    const pata = (await db.doc('movimientosTesoreria/D9A-teso').get()).data();
    assert.equal(pata.tipo, 'abono_cartera');
    assert.equal(pata.cuentaId, 'BCO1');
    assert.equal(pata.monto.monto, 400000);
    assert.equal(pata.estado, 'activo');
    assert.equal(pata.creadoPor.fuente, 'SISTEMA', 'la puerta MANUAL rechaza este tipo (V12)');
    assert.equal(pata.refDocumento, 'D9A', 'trazable al movimiento de cartera');
    assert.equal(await saldoCuenta('BCO1'), 400000, 'el banco YA ve la plata');
});

test('D9 · "todavía no sé" (sin cuenta) → se registra igual y queda LISTABLE para el cuadre', async () => {
    await limpiarTesoreria();
    const r = await registrarAbonoCarteraCore(db, {
        opId: 'D9B', clienteId: CLI, monto: 300000, fecha: '2026-07-25', medioPago: 'transferencia', autor,
    }, opts);
    assert.equal(r.pataTeso, null);
    assert.equal(await saldoDe(), 1700000, 'la deuda baja igual: no se castiga decir la verdad');
    const mov = (await db.doc(`clientes/${CLI}/movimientos/D9B`).get()).data();
    assert.equal(mov.pataTeso, undefined);
    assert.equal(mov.sinCuentaAsignada, true, 'bandera para la lista "abonos sin cuenta" del cuadre');
});

test('D9 · el EFECTIVO no acepta cuenta bancaria (su destino es el cajón, no el banco)', async () => {
    await limpiarTesoreria();
    await cuentaBanco('BCO2');
    await abrirTurnoCore(db, { opId: 'TD9', fondoApertura: 0, autor: 'kary' });
    await assert.rejects(registrarAbonoCarteraCore(db, {
        opId: 'D9C', clienteId: CLI, monto: 100000, fecha: '2026-07-25',
        medioPago: 'efectivo', cuentaId: 'BCO2', autor,
    }, opts), (e) => e.code === 'invalid-argument');
    assert.equal(await saldoDe(), 2000000, 'no queda ni abono ni pata');
});

test('D9 · cuenta inválida (inexistente/virtual) ⇒ aborta TODO (la deuda no baja)', async () => {
    await limpiarTesoreria();
    await tesoCore.seedCuentasVirtuales(db);   // crea caja/bóveda virtuales
    await assert.rejects(registrarAbonoCarteraCore(db, {
        opId: 'D9D', clienteId: CLI, monto: 100000, fecha: '2026-07-25',
        medioPago: 'transferencia', cuentaId: 'noExiste', autor,
    }, opts), (e) => e.code === 'not-found');
    assert.equal(await saldoDe(), 2000000);
    const virtual = (await db.collection('cuentasTesoreria').where('tipo', '==', 'caja').get()).docs[0];
    await assert.rejects(registrarAbonoCarteraCore(db, {
        opId: 'D9E', clienteId: CLI, monto: 100000, fecha: '2026-07-25',
        medioPago: 'transferencia', cuentaId: virtual.id, autor,
    }, opts), (e) => e.code === 'failed-precondition');
    assert.equal(await saldoDe(), 2000000, 'Caja/Bóveda no son cuentas bancarias');
});

test('D9 · idempotencia POR-LIBRO: si falta la pata del banco, el replay la crea (y no duplica cartera)', async () => {
    await limpiarTesoreria();
    await cuentaBanco('BCO3');
    const p = { opId: 'D9F', clienteId: CLI, monto: 250000, fecha: '2026-07-25', medioPago: 'transferencia', cuentaId: 'BCO3', autor };
    await registrarAbonoCarteraCore(db, p, opts);
    await db.doc('movimientosTesoreria/D9F-teso').delete();          // fallo parcial
    const r = await registrarAbonoCarteraCore(db, p, opts);
    assert.equal(r.yaExistia, true);
    assert.equal(r.pataTesoCreada, true);
    assert.equal(await saldoCuenta('BCO3'), 250000);
    assert.equal(await saldoDe(), 1750000, 'la cartera NO se duplica');
});

test('D9 · anular el abono NETEA el banco (la pata deja de contar) si el mes no está cuadrado', async () => {
    await limpiarTesoreria();
    await cuentaBanco('BCO4');
    await registrarAbonoCarteraCore(db, {
        opId: 'D9G', clienteId: CLI, monto: 500000, fecha: '2026-07-25', medioPago: 'transferencia', cuentaId: 'BCO4', autor,
    }, opts);
    assert.equal(await saldoCuenta('BCO4'), 500000);
    const r = await anularAbonoCarteraCore(db, {
        clienteId: CLI, movId: 'D9G', motivo: 'no entró la transferencia', motivoCategoria: 'ERROR_REGISTRO', autor,
    }, opts);
    assert.equal(r.pataTesoAnulada, true);
    assert.equal(await saldoDe(), 2000000);
    assert.equal(await saldoCuenta('BCO4'), 0, 'el banco ya no cuenta esa plata');
    const pata = (await db.doc('movimientosTesoreria/D9G-teso').get()).data();
    assert.equal(pata.estado, 'anulado', 'append-only: no se borra, se sella');
    assert.ok(pata.anuladoPor, 'queda quién y cuándo');
});

test('D9 · si la pata YA está CUADRADA con el extracto, anular se RECHAZA (lo sellado no se reescribe)', async () => {
    await limpiarTesoreria();
    await cuentaBanco('BCO5');
    await registrarAbonoCarteraCore(db, {
        opId: 'D9H', clienteId: CLI, monto: 500000, fecha: '2026-07-25', medioPago: 'transferencia', cuentaId: 'BCO5', autor,
    }, opts);
    await tesoCore.marcarConciliadoCore(db, { cuentaId: 'BCO5', periodo: '2026-07', opIds: ['D9H-teso'], actor: 'ownerUid' });
    await assert.rejects(
        anularAbonoCarteraCore(db, { clienteId: CLI, movId: 'D9H', motivo: 'tarde', autor }, opts),
        (e) => e.code === 'failed-precondition' && /cuadrad/i.test(e.message),
    );
    assert.equal(await saldoDe(), 1500000, 'la cartera tampoco se movió');
    assert.equal(await saldoCuenta('BCO5'), 500000);
});

// ─── D9 · cerrar el ciclo: asignar la cuenta DESPUÉS ("todavía no sé" no es un agujero) ────────
test('D9 · asignar la cuenta más tarde crea la pata y quita la bandera de pendiente', async () => {
    await limpiarTesoreria();
    await cuentaBanco('BCO6');
    await registrarAbonoCarteraCore(db, {
        opId: 'D9I', clienteId: CLI, monto: 200000, fecha: '2026-07-25', medioPago: 'transferencia', autor,
    }, opts);
    const r = await asignarCuentaAbonoCore(db, { clienteId: CLI, movId: 'D9I', cuentaId: 'BCO6', autor }, opts);
    assert.deepEqual(r.pataTeso, { cuentaId: 'BCO6', movId: 'D9I-teso' });
    assert.equal(await saldoCuenta('BCO6'), 200000, 'la plata YA cuenta en el banco');
    const mov = (await db.doc(`clientes/${CLI}/movimientos/D9I`).get()).data();
    assert.equal(mov.pataTeso.cuentaId, 'BCO6');
    assert.equal(mov.sinCuentaAsignada, false, 'sale de la lista del cuadre');
    assert.equal(await saldoDe(), 1800000, 'la deuda NO se vuelve a mover');
});

test('D9 · asignar dos veces → idempotente; y no se re-asigna una cuenta ya puesta', async () => {
    await limpiarTesoreria();
    await cuentaBanco('BCO7'); await cuentaBanco('BCO8');
    await registrarAbonoCarteraCore(db, {
        opId: 'D9J', clienteId: CLI, monto: 200000, fecha: '2026-07-25', medioPago: 'transferencia', autor,
    }, opts);
    await asignarCuentaAbonoCore(db, { clienteId: CLI, movId: 'D9J', cuentaId: 'BCO7', autor }, opts);
    const r2 = await asignarCuentaAbonoCore(db, { clienteId: CLI, movId: 'D9J', cuentaId: 'BCO7', autor }, opts);
    assert.equal(r2.yaExistia, true);
    assert.equal(await saldoCuenta('BCO7'), 200000, 'no se duplica');
    await assert.rejects(
        asignarCuentaAbonoCore(db, { clienteId: CLI, movId: 'D9J', cuentaId: 'BCO8', autor }, opts),
        (e) => e.code === 'failed-precondition',
    );
    assert.equal(await saldoCuenta('BCO8'), 0, 'cambiar de cuenta NO es asignar: eso es un traslado');
});

test('D9 · no se asigna cuenta a un abono ANULADO ni a uno que no es transferencia', async () => {
    await limpiarTesoreria();
    await cuentaBanco('BCO9');
    await registrarAbonoCarteraCore(db, {
        opId: 'D9K', clienteId: CLI, monto: 100000, fecha: '2026-07-25', medioPago: 'transferencia', autor,
    }, opts);
    await anularAbonoCarteraCore(db, { clienteId: CLI, movId: 'D9K', motivo: 'x', autor }, opts);
    await assert.rejects(
        asignarCuentaAbonoCore(db, { clienteId: CLI, movId: 'D9K', cuentaId: 'BCO9', autor }, opts),
        (e) => e.code === 'failed-precondition',
    );
    await abrirTurnoCore(db, { opId: 'TD9b', fondoApertura: 0, autor: 'kary' });
    await registrarAbonoCarteraCore(db, {
        opId: 'D9L', clienteId: CLI, monto: 100000, fecha: '2026-07-25', medioPago: 'efectivo', autor,
    }, opts);
    await assert.rejects(
        asignarCuentaAbonoCore(db, { clienteId: CLI, movId: 'D9L', cuentaId: 'BCO9', autor }, opts),
        (e) => e.code === 'invalid-argument',
    );
    assert.equal(await saldoCuenta('BCO9'), 0);
});
