/**
 * Integración de la SESIÓN DE CAJA (F2.0 B1) contra el emulador Firestore.
 *   firebase emulators:exec --only firestore --project demo-bersaglio "node --test functions/caja.integration.test.mjs"
 *   (o: FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node --test functions/caja.integration.test.mjs)
 *
 * Verifica los invariantes de dinero/concurrencia del turno (SSoT: spec §Bloque B1 · §8.1):
 *   #4 puntero SINGLETON (un solo turno abierto, transaccional) · #2 idempotencia por opId ·
 *   #7 ecuación de cierre COMPLETA (fondo + ventas + ingresos − egresos + boveda_a_cajon − cajon_a_boveda).
 * Escribe vía firebase-admin (bypassa reglas, = la CF). B1 = turnos SIN ventas aún (ventas → B2).
 */
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import core from './caja-core.js';
const { abrirTurnoCore, cerrarTurnoCore } = core;

initializeApp({ projectId: 'demo-bersaglio' });
const db = getFirestore();

const limpiarPuntero = () => db.doc('caja/estado').delete().catch(() => {});
before(limpiarPuntero);

// ─── Apertura por puntero singleton (invariante #4) ──────────────────────────
test('abrir · puntero null → crea 1 turno abierto + el puntero lo apunta', async () => {
    await limpiarPuntero();
    const r = await abrirTurnoCore(db, { opId: 'TA', fondoApertura: 200000, autor: 'cajera1' });
    assert.equal(r.yaExistia, false);
    assert.equal(r.turnoId, 'TA');
    assert.equal(r.estado, 'abierto');
    const t = (await db.doc('turnos/TA').get()).data();
    assert.equal(t.estado, 'abierto');
    assert.equal(t.fondoApertura, 200000);
    assert.equal(t.aperturaPor, 'cajera1');
    assert.ok(t.aperturaTs, 'aperturaTs sellado por el servidor');
    assert.equal((await db.doc('caja/estado').get()).data().turnoAbiertoId, 'TA');
});

test('abrir · con una caja YA abierta → rechaza (un solo turno abierto)', async () => {
    await limpiarPuntero();
    await abrirTurnoCore(db, { opId: 'TA1', fondoApertura: 200000, autor: 'cajera1' });
    await assert.rejects(
        abrirTurnoCore(db, { opId: 'TB1', fondoApertura: 100000, autor: 'cajera2' }),
        /caja abierta/i,
    );
    assert.equal((await db.doc('turnos/TB1').get()).exists, false);   // no se creó el 2º
});

test('abrir · 2 aperturas CONCURRENTES (distinto opId) → exactamente 1 gana (test de carrera)', async () => {
    await limpiarPuntero();
    const settled = await Promise.allSettled([
        abrirTurnoCore(db, { opId: 'R1', fondoApertura: 200000, autor: 'c1' }),
        abrirTurnoCore(db, { opId: 'R2', fondoApertura: 200000, autor: 'c2' }),
    ]);
    const ganaron = settled.filter((s) => s.status === 'fulfilled' && s.value.yaExistia === false);
    const rechazos = settled.filter((s) => s.status === 'rejected');
    assert.equal(ganaron.length, 1, 'exactamente un turno se creó');
    assert.equal(rechazos.length, 1, 'el otro fue rechazado');
    const abiertoId = (await db.doc('caja/estado').get()).data().turnoAbiertoId;
    assert.ok(abiertoId === 'R1' || abiertoId === 'R2');
    const existen = [(await db.doc('turnos/R1').get()).exists, (await db.doc('turnos/R2').get()).exists];
    assert.equal(existen.filter(Boolean).length, 1, 'solo el ganador existe como turno');
});

test('abrir · doble-tap MISMO opId → idempotente (1 turno, sin error)', async () => {
    await limpiarPuntero();
    const [a, b] = await Promise.all([
        abrirTurnoCore(db, { opId: 'IDEM', fondoApertura: 200000, autor: 'c1' }),
        abrirTurnoCore(db, { opId: 'IDEM', fondoApertura: 200000, autor: 'c1' }),
    ]);
    assert.equal(a.turnoId, 'IDEM');
    assert.equal(b.turnoId, 'IDEM');
    assert.equal(a.yaExistia !== b.yaExistia, true, 'exactamente uno lo creó, el otro lo encontró');
});

// ─── Cierre por puntero + ecuación completa (invariantes #7) ─────────────────
test('cerrar · sella el turno + libera el puntero (otra caja puede abrir)', async () => {
    await limpiarPuntero();
    await abrirTurnoCore(db, { opId: 'TC', fondoApertura: 200000, autor: 'c1' });
    const r = await cerrarTurnoCore(db, { turnoId: 'TC', conteoPorMedio: { efectivo: 200000 }, autor: 'c1' });
    assert.equal(r.yaExistia, false);
    assert.equal(r.esperadoEfectivo, 200000);   // solo el fondo (sin ventas ni movimientos)
    assert.equal(r.descuadre, 0);
    const t = (await db.doc('turnos/TC').get()).data();
    assert.equal(t.estado, 'cerrado');
    assert.ok(t.cierreTs);
    assert.equal((await db.doc('caja/estado').get()).data().turnoAbiertoId, null);   // puntero libre
    assert.equal((await abrirTurnoCore(db, { opId: 'TC2', fondoApertura: 200000, autor: 'c1' })).yaExistia, false);
});

test('cerrar · doble cierre → idempotente (mismo descuadre, no re-sella con el 2º conteo)', async () => {
    await limpiarPuntero();
    await abrirTurnoCore(db, { opId: 'TD', fondoApertura: 200000, autor: 'c1' });
    const r1 = await cerrarTurnoCore(db, { turnoId: 'TD', conteoPorMedio: { efectivo: 190000 }, autor: 'c1' });
    const r2 = await cerrarTurnoCore(db, { turnoId: 'TD', conteoPorMedio: { efectivo: 999999 }, autor: 'c1' });
    assert.equal(r1.yaExistia, false);
    assert.equal(r2.yaExistia, true);
    assert.equal(r1.descuadre, -10000);          // 190000 − 200000 = falta 10.000
    assert.equal(r2.descuadre, r1.descuadre);    // NO recomputa con el conteo nuevo (sello inmutable)
});

test('cerrar · ecuación COMPLETA con boveda_a_cajon (fondo + ingresos − egresos + boveda_a_cajon − cajon_a_boveda)', async () => {
    await limpiarPuntero();
    await abrirTurnoCore(db, { opId: 'TE', fondoApertura: 200000, autor: 'c1' });
    // Movimientos manuales del turno (los escribirá movimientoCaja, B-posterior; aquí Admin SDK).
    await db.doc('turnos/TE/movsCaja/mi1').set({ tipo: 'ingreso', concepto: 'otro', monto: 50000, autor: 'c1', ts: FieldValue.serverTimestamp() });
    await db.doc('turnos/TE/movsCaja/me1').set({ tipo: 'egreso', concepto: 'compra_empaques', monto: 30000, autor: 'c1', ts: FieldValue.serverTimestamp() });
    await db.doc('turnos/TE/movsCaja/meAnul').set({ tipo: 'egreso', concepto: 'otro', monto: 999999, anulado: true, autor: 'c1', ts: FieldValue.serverTimestamp() }); // anulado → IGNORADO
    // Traslados bóveda↔cajón de ESTE turno (los escribirá registrarTraslado, B3).
    await db.doc('bovedaMovimientos/bt1').set({ tipo: 'boveda_a_cajon', monto: 100000, turnoId: 'TE', autor: 'c1', ts: FieldValue.serverTimestamp() });
    await db.doc('bovedaMovimientos/bt2').set({ tipo: 'cajon_a_boveda', monto: 40000, turnoId: 'TE', autor: 'c1', ts: FieldValue.serverTimestamp() });
    // esperado = 200000 + 0(ventas) + 50000 − 30000 + 100000 − 40000 = 280000
    const r = await cerrarTurnoCore(db, { turnoId: 'TE', conteoPorMedio: { efectivo: 275000 }, autor: 'c1' });
    assert.equal(r.esperadoEfectivo, 280000);
    assert.equal(r.descuadre, -5000);            // 275000 − 280000 = falta 5.000
    const t = (await db.doc('turnos/TE').get()).data();
    assert.equal(t.ingresos, 50000);
    assert.equal(t.egresos, 30000);
    assert.equal(t.bovedaACajon, 100000);
    assert.equal(t.cajonABoveda, 40000);
});

test('cerrar · turno inexistente → rechaza (not-found)', async () => {
    await assert.rejects(cerrarTurnoCore(db, { turnoId: 'NOPE', conteoPorMedio: { efectivo: 0 }, autor: 'c1' }), /no existe/i);
});
