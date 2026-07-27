/**
 * Integración de F-TESORERÍA (B0 seed + B1 núcleo de dinero) contra el emulador Firestore.
 *   firebase emulators:exec --only firestore --project demo-bersaglio "node --test functions/tesoreria.integration.test.mjs"
 *
 * Verifica los invariantes de dinero POR ESCENARIO (spec §5 + §0.6/§0.7):
 *   1 conservación · 2 idempotencia · 3 atomicidad del traslado · 4 SoD (pendiente no cuenta,
 *   solo owner aprueba, fechaEfectiva V5) · 5 deshacer netea (2º inverso rechazado) ·
 *   6 inmutabilidad conciliada · 7 virtuales rechazan · 11 fecha<fechaCorte · 12 reembolso>aporte
 *   GRITA · 14 abono_cartera solo SISTEMA (V12) · 20 gasto exige categoría (V20).
 *   (8 paridad servidor≡cliente vive en tests/tesoreria-paridad.test.mjs, node puro.)
 * Escribe vía firebase-admin (bypassa reglas, = la CF). El trigger D5 no corre aquí (emulador
 * solo-firestore) → el recompute se invoca DIRECTO (mismo core que ejecuta el trigger).
 */
import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import core from './tesoreria-core.js';
const {
    seedCuentasVirtuales, TIPOS_VIRTUALES, TesoreriaError,
    crearCuentaTesoreriaCore, registrarMovimientoTesoreriaCore, trasladarEntreCuentasCore,
    aprobarMovimientoTesoreriaCore, marcarConciliadoCore, reabrirCuadreCore, recalcularSaldoCuentaCore,
    actualizarConfigSistemaCore, CAMPOS_CONFIG,
} = core;

initializeApp({ projectId: 'demo-bersaglio' });
const db = getFirestore();

async function limpiar() {
    for (const col of ['cuentasTesoreria', 'movimientosTesoreria']) {
        const snap = await db.collection(col).get();
        await Promise.all(snap.docs.map((d) => d.ref.delete()));
    }
}
before(limpiar);
beforeEach(limpiar);

// Helper: cuenta real lista para operar (fechaCorte vieja para no chocar con fechas de test).
const HOY = '2026-07-20';
async function cuenta(id, extra = {}) {
    await crearCuentaTesoreriaCore(db, {
        opId: id, nombre: `Cuenta ${id}`, banco: 'Bancolombia', tipo: 'banco', titular: 'kary',
        saldoInicial: extra.saldoInicial ?? 0, fechaCorte: extra.fechaCorte ?? '2026-01-01',
        esDeSocia: extra.esDeSocia === true, autor: 'testUid',
    });
    return id;
}
const saldoDe = async (id) => (await recalcularSaldoCuentaCore(db, id)).saldo;
const reg = (input) => registrarMovimientoTesoreriaCore(db, { fecha: HOY, autor: 'adminUid', ...input });
const esTesoError = (code) => (e) => e instanceof TesoreriaError && e.code === code;

// ─── B0 · seed estructural (V21) ─────────────────────────────────────────────
test('seed · crea las 2 cuentas virtuales (Caja + Bóveda) con la forma de D1', async () => {
    const r = await seedCuentasVirtuales(db);
    assert.deepEqual(r.creadas.sort(), ['boveda', 'caja']);
    for (const id of ['caja', 'boveda']) {
        const c = (await db.doc(`cuentasTesoreria/${id}`).get()).data();
        assert.ok(TIPOS_VIRTUALES.includes(c.tipo));
        assert.equal(c.activa, true);
        assert.equal('saldoInicial' in c, false, `${id} sin saldoInicial`);
        assert.equal('saldoActual' in c, false, `${id} sin saldoActual`);
    }
});

test('seed · IDEMPOTENTE: re-correr no crea nada nuevo ni pisa lo existente', async () => {
    await seedCuentasVirtuales(db);
    await db.doc('cuentasTesoreria/caja').set({ nombre: 'Renombrada por Kary' }, { merge: true });
    const second = await seedCuentasVirtuales(db);
    assert.deepEqual(second.creadas, []);
    assert.equal((await db.collection('cuentasTesoreria').get()).size, 2);
    assert.equal((await db.doc('cuentasTesoreria/caja').get()).data().nombre, 'Renombrada por Kary');
});

// ─── §5.1 · Conservación ─────────────────────────────────────────────────────
test('§5.1 conservación · ingreso+gasto+traslado: cada saldo cuadra y la Σ global se conserva', async () => {
    await cuenta('A', { saldoInicial: 0 });
    await cuenta('B', { saldoInicial: 0 });
    await reg({ opId: 'i1', cuentaId: 'A', tipo: 'ingreso_venta', monto: 100000 });
    await reg({ opId: 'g1', cuentaId: 'A', tipo: 'gasto', monto: 30000, categoria: 'papeleria', contraparte: { nombre: 'Papelería X' } });
    const antes = (await saldoDe('A')) + (await saldoDe('B'));
    await trasladarEntreCuentasCore(db, { opId: 'T1', origenId: 'A', destinoId: 'B', monto: 50000, fecha: HOY, autor: 'adminUid' });
    const [sA, sB] = [await saldoDe('A'), await saldoDe('B')];
    assert.equal(sA, 0 + 100000 - 30000 - 50000);   // 20000
    assert.equal(sB, 0 + 50000);
    assert.equal(sA + sB, antes, 'el traslado NO crea ni destruye plata');
});

// ─── §5.2 · Idempotencia ─────────────────────────────────────────────────────
test('§5.2 idempotencia · replay del MISMO opId (registrar y trasladar) ⇒ 1 solo asiento/par', async () => {
    await cuenta('A'); await cuenta('B');
    const r1 = await reg({ opId: 'op1', cuentaId: 'A', tipo: 'ingreso_venta', monto: 70000 });
    const r2 = await reg({ opId: 'op1', cuentaId: 'A', tipo: 'ingreso_venta', monto: 70000 });
    assert.equal(r1.yaExistia, false);
    assert.equal(r2.yaExistia, true);
    const t1 = await trasladarEntreCuentasCore(db, { opId: 'T1', origenId: 'A', destinoId: 'B', monto: 10000, fecha: HOY });
    const t2 = await trasladarEntreCuentasCore(db, { opId: 'T1', origenId: 'A', destinoId: 'B', monto: 10000, fecha: HOY });
    assert.equal(t1.yaExistia, false);
    assert.equal(t2.yaExistia, true);
    assert.equal((await db.collection('movimientosTesoreria').get()).size, 3);   // 1 ingreso + el par
    assert.equal(await saldoDe('A'), 60000);
});

// ─── §5.3 · Atomicidad del traslado ──────────────────────────────────────────
test('§5.3 atomicidad · destino inexistente ⇒ la tx aborta y NO queda medio-par', async () => {
    await cuenta('A', { saldoInicial: 100000 });
    await assert.rejects(
        trasladarEntreCuentasCore(db, { opId: 'TX', origenId: 'A', destinoId: 'noExiste', monto: 5000, fecha: HOY }),
        esTesoError('not-found'));
    assert.equal((await db.doc('movimientosTesoreria/TX-out').get()).exists, false, 'sin pata out huérfana');
    assert.equal((await db.doc('movimientosTesoreria/TX-in').get()).exists, false);
    assert.equal(await saldoDe('A'), 100000);
});

// ─── §5.4 · SoD ──────────────────────────────────────────────────────────────
test('§5.4 SoD · retiro_socia nace pendiente (no cuenta); admin NO aprueba; owner aprueba (resta + fechaEfectiva V5); rechazado no resta', async () => {
    await cuenta('S', { saldoInicial: 500000, esDeSocia: true, titular: 'daniela' });
    const socia = { tipo: 'socia', id: 'daniela' };
    const r = await reg({ opId: 'ret1', cuentaId: 'S', tipo: 'retiro_socia', monto: 200000, contraparte: socia });
    assert.equal(r.estado, 'pendiente_aprobacion');
    assert.equal(await saldoDe('S'), 500000, 'pendiente NO afecta el saldo');
    // admin intenta aprobar → permission-denied (SoD)
    await assert.rejects(
        aprobarMovimientoTesoreriaCore(db, { opId: 'ret1', decision: 'aprobar', actor: 'adminUid', rol: 'admin' }),
        esTesoError('permission-denied'));
    // owner aprueba → activo + fechaEfectiva estampada (V5) + resta
    const ap = await aprobarMovimientoTesoreriaCore(db, { opId: 'ret1', decision: 'aprobar', actor: 'ownerUid', rol: 'owner', hoy: '2026-07-21' });
    assert.equal(ap.estado, 'activo');
    assert.equal(ap.fechaEfectiva, '2026-07-21');
    assert.equal((await db.doc('movimientosTesoreria/ret1').get()).data().fechaEfectiva, '2026-07-21');
    assert.equal(await saldoDe('S'), 300000);
    // otro retiro rechazado → jamás cuenta (y exige motivo)
    await reg({ opId: 'ret2', cuentaId: 'S', tipo: 'retiro_socia', monto: 50000, contraparte: socia });
    await assert.rejects(
        aprobarMovimientoTesoreriaCore(db, { opId: 'ret2', decision: 'rechazar', actor: 'ownerUid', rol: 'owner' }),
        esTesoError('invalid-argument'));   // sin motivo no hay rechazo
    await aprobarMovimientoTesoreriaCore(db, { opId: 'ret2', decision: 'rechazar', motivo: 'no autorizado', actor: 'ownerUid', rol: 'owner' });
    assert.equal(await saldoDe('S'), 300000);
});

// ─── §5.5 · Deshacer netea ───────────────────────────────────────────────────
test('§5.5 deshacer · ajuste_inverso aprobado netea EXACTO; segundo inverso del mismo ref ⇒ rechazado', async () => {
    await cuenta('A', { saldoInicial: 100000 });
    await reg({ opId: 'g1', cuentaId: 'A', tipo: 'gasto', monto: 30000, categoria: 'otros', contraparte: { nombre: 'Prov' } });
    assert.equal(await saldoDe('A'), 70000);
    const inv = await reg({ opId: 'inv1', cuentaId: 'A', tipo: 'ajuste_inverso', monto: 30000, refDocumento: 'g1' });
    assert.equal(inv.estado, 'pendiente_aprobacion');
    assert.equal(await saldoDe('A'), 70000, 'inverso pendiente aún no netea');
    await aprobarMovimientoTesoreriaCore(db, { opId: 'inv1', decision: 'aprobar', actor: 'ownerUid', rol: 'owner' });
    assert.equal(await saldoDe('A'), 100000, 'inverso aprobado netea exacto');
    // segundo inverso del MISMO ref → rechazado en el registro (costura de auditoría)
    await assert.rejects(
        reg({ opId: 'inv2', cuentaId: 'A', tipo: 'ajuste_inverso', monto: 30000, refDocumento: 'g1' }),
        esTesoError('failed-precondition'));
    // amarres extra: monto distinto y reversar-un-inverso también rechazan
    await reg({ opId: 'g2', cuentaId: 'A', tipo: 'gasto', monto: 10000, categoria: 'otros', contraparte: { nombre: 'Prov' } });
    await assert.rejects(reg({ opId: 'inv3', cuentaId: 'A', tipo: 'ajuste_inverso', monto: 9999, refDocumento: 'g2' }),
        esTesoError('invalid-argument'));
    await assert.rejects(reg({ opId: 'inv4', cuentaId: 'A', tipo: 'ajuste_inverso', monto: 30000, refDocumento: 'inv1' }),
        esTesoError('failed-precondition'));
});

// ─── §5.6 · Inmutabilidad conciliada ─────────────────────────────────────────
test('§5.6 conciliado · un movimiento cuadrado es INTOCABLE; solo se cuadra plata firme', async () => {
    await cuenta('A');
    await reg({ opId: 'i1', cuentaId: 'A', tipo: 'ingreso_venta', monto: 40000 });
    const r = await marcarConciliadoCore(db, { cuentaId: 'A', periodo: '2026-07', opIds: ['i1'], actor: 'adminUid' });
    assert.equal(r.conciliados, 1);
    const m = (await db.doc('movimientosTesoreria/i1').get()).data();
    assert.equal(m.conciliado, true);
    assert.equal(m.periodoConciliado, '2026-07');
    // tocar el estado de un conciliado (ni "rechazarlo") → rechazo
    await assert.rejects(
        aprobarMovimientoTesoreriaCore(db, { opId: 'i1', decision: 'rechazar', motivo: 'x', actor: 'ownerUid', rol: 'owner' }),
        esTesoError('failed-precondition'));
    // re-conciliar es idempotente (no explota, no duplica)
    const r2 = await marcarConciliadoCore(db, { cuentaId: 'A', periodo: '2026-07', opIds: ['i1'], actor: 'adminUid' });
    assert.equal(r2.yaEstaban, 1);
    // un PENDIENTE no se puede cuadrar (solo plata firme)
    await reg({ opId: 'aj1', cuentaId: 'A', tipo: 'ajuste_conciliacion', direccion: 'entrada', monto: 5000 });
    await assert.rejects(
        marcarConciliadoCore(db, { cuentaId: 'A', periodo: '2026-07', opIds: ['aj1'], actor: 'adminUid' }),
        esTesoError('failed-precondition'));
    // y un movimiento de OTRA cuenta tampoco entra al cuadre de A
    await cuenta('B');
    await reg({ opId: 'iB', cuentaId: 'B', tipo: 'ingreso_venta', monto: 1000 });
    await assert.rejects(
        marcarConciliadoCore(db, { cuentaId: 'A', periodo: '2026-07', opIds: ['iB'], actor: 'adminUid' }),
        esTesoError('failed-precondition'));
});

// ─── §5.7 · Virtuales ────────────────────────────────────────────────────────
test('§5.7 virtuales · registrar/trasladar sobre caja/bóveda ⇒ rechazo con mensaje de su módulo', async () => {
    await seedCuentasVirtuales(db);
    await cuenta('A', { saldoInicial: 10000 });
    await assert.rejects(reg({ opId: 'x1', cuentaId: 'caja', tipo: 'ingreso_venta', monto: 1000 }),
        (e) => e instanceof TesoreriaError && /su módulo/.test(e.message));
    await assert.rejects(
        trasladarEntreCuentasCore(db, { opId: 'x2', origenId: 'boveda', destinoId: 'A', monto: 1000, fecha: HOY }),
        (e) => e instanceof TesoreriaError && /su módulo/.test(e.message));
    await assert.rejects(
        trasladarEntreCuentasCore(db, { opId: 'x3', origenId: 'A', destinoId: 'caja', monto: 1000, fecha: HOY }),
        (e) => e instanceof TesoreriaError && /su módulo/.test(e.message));
    // el recompute también las salta (sin saldo propio, D1)
    assert.equal((await recalcularSaldoCuentaCore(db, 'caja')).saldo, null);
    assert.equal('saldoActual' in (await db.doc('cuentasTesoreria/caja').get()).data(), false);
});

// ─── Test 11 (V10) · fecha < fechaCorte ──────────────────────────────────────
test('test 11 (V10) · movimiento con fecha anterior al corte inicial ⇒ rechazo (double-count)', async () => {
    await cuenta('A', { fechaCorte: '2026-07-01' });
    await assert.rejects(
        reg({ opId: 'v1', cuentaId: 'A', tipo: 'ingreso_venta', monto: 1000, fecha: '2026-06-30' }),
        esTesoError('failed-precondition'));
    const ok = await reg({ opId: 'v2', cuentaId: 'A', tipo: 'ingreso_venta', monto: 1000, fecha: '2026-07-01' });
    assert.equal(ok.yaExistia, false);   // == corte sí pasa (el corte es el arranque)
});

// ─── Test 12 (V2) · reembolso > aporte GRITA ─────────────────────────────────
test('test 12 (V2) · reembolso que excede el saldo-aporte de la socia nace con excedeAporte:true', async () => {
    await cuenta('S', { saldoInicial: 1000000, esDeSocia: true, titular: 'daniela' });
    const socia = { tipo: 'socia', id: 'daniela' };
    await reg({ opId: 'ap1', cuentaId: 'S', tipo: 'aporte_socia', monto: 100000, contraparte: socia });
    const dentro = await reg({ opId: 'rb1', cuentaId: 'S', tipo: 'reembolso_socia', monto: 60000, contraparte: socia });
    assert.equal(dentro.estado, 'pendiente_aprobacion');    // V2: TODO reembolso pide firma
    assert.equal(dentro.excedeAporte, false);
    // el pendiente rb1 NO descuenta aporte aún (solo cuentan activos) → 150000 > 100000 excede
    const excede = await reg({ opId: 'rb2', cuentaId: 'S', tipo: 'reembolso_socia', monto: 150000, contraparte: socia });
    assert.equal(excede.excedeAporte, true, 'el asiento GRITA (aviso, no bloqueo)');
    assert.equal((await db.doc('movimientosTesoreria/rb2').get()).data().excedeAporte, true);
});

// ─── Test 14 (V12) · una sola puerta para el abono ───────────────────────────
test('test 14 (V12) · abono_cartera MANUAL ⇒ rechazo; con fuente SISTEMA (CF del abono, D9) sí nace', async () => {
    await cuenta('A');
    await assert.rejects(reg({ opId: 'ab1', cuentaId: 'A', tipo: 'abono_cartera', monto: 5000 }),
        esTesoError('failed-precondition'));
    const sys = await reg({ opId: 'ab2', cuentaId: 'A', tipo: 'abono_cartera', monto: 5000, fuente: 'SISTEMA' });
    assert.equal(sys.estado, 'activo');
    assert.equal((await db.doc('movimientosTesoreria/ab2').get()).data().creadoPor.fuente, 'SISTEMA');
    // y los tipos de sistema puros JAMÁS entran por registrar (ni con fuente SISTEMA)
    await assert.rejects(reg({ opId: 'ab3', cuentaId: 'A', tipo: 'consignacion_in', monto: 5000, fuente: 'SISTEMA' }),
        esTesoError('failed-precondition'));
    await assert.rejects(reg({ opId: 'ab4', cuentaId: 'A', tipo: 'traslado_out', monto: 5000 }),
        esTesoError('failed-precondition'));
});

// ─── Test 20 (V20) · categoría obligatoria del gasto ─────────────────────────
test('test 20 (V20) · gasto sin categoría (o con una inventada) ⇒ rechazo; pago_proveedor no la lleva', async () => {
    await cuenta('A');
    await assert.rejects(reg({ opId: 'g1', cuentaId: 'A', tipo: 'gasto', monto: 1000, contraparte: { nombre: 'X' } }),
        esTesoError('invalid-argument'));
    await assert.rejects(reg({ opId: 'g2', cuentaId: 'A', tipo: 'gasto', monto: 1000, categoria: 'rumba', contraparte: { nombre: 'X' } }),
        esTesoError('invalid-argument'));
    await assert.rejects(reg({ opId: 'g3', cuentaId: 'A', tipo: 'pago_proveedor', monto: 1000, categoria: 'otros', contraparte: { nombre: 'X' } }),
        esTesoError('invalid-argument'));   // categoria SOLO en gasto (proveedor = costo de venta aparte)
    const ok = await reg({ opId: 'g4', cuentaId: 'A', tipo: 'gasto', monto: 1000, categoria: 'gmf', contraparte: { nombre: 'Banco' } });
    assert.equal(ok.yaExistia, false);
    // V8: egreso deducible sin contraparte ⇒ rechazo
    await assert.rejects(reg({ opId: 'g5', cuentaId: 'A', tipo: 'gasto', monto: 1000, categoria: 'otros' }),
        esTesoError('invalid-argument'));
});

// ─── B3 · Reabrir cuadre (V19: sello en dos etapas) ──────────────────────────
test('B3 reabrir · owner reabre un mes sellado (conciliado→false); admin no; sin motivo no; audit', async () => {
    await cuenta('A');
    await reg({ opId: 'i1', cuentaId: 'A', tipo: 'ingreso_venta', monto: 40000, fecha: '2026-07-05' });
    await marcarConciliadoCore(db, { cuentaId: 'A', periodo: '2026-07', opIds: ['i1'], actor: 'adminUid' });
    assert.equal((await db.doc('movimientosTesoreria/i1').get()).data().conciliado, true);
    // admin no puede reabrir
    await assert.rejects(reabrirCuadreCore(db, { cuentaId: 'A', periodo: '2026-07', motivo: 'x', actor: 'adminUid', rol: 'admin' }), esTesoError('permission-denied'));
    // owner sin motivo tampoco
    await assert.rejects(reabrirCuadreCore(db, { cuentaId: 'A', periodo: '2026-07', actor: 'ownerUid', rol: 'owner' }), esTesoError('invalid-argument'));
    // owner con motivo → reabre
    const r = await reabrirCuadreCore(db, { cuentaId: 'A', periodo: '2026-07', motivo: 'me equivoqué de mes', actor: 'ownerUid', rol: 'owner' });
    assert.equal(r.reabiertos, 1);
    const m = (await db.doc('movimientosTesoreria/i1').get()).data();
    assert.equal(m.conciliado, false);
    assert.equal('periodoConciliado' in m, false, 'quita periodoConciliado');
    assert.equal(m.reabiertoPor.motivo, 'me equivoqué de mes');   // audit trail
    // reabrir un mes sin cuadre → not-found
    await assert.rejects(reabrirCuadreCore(db, { cuentaId: 'A', periodo: '2026-05', motivo: 'x', actor: 'ownerUid', rol: 'owner' }), esTesoError('not-found'));
});

test('B3 reabrir · bloqueado si el mes SIGUIENTE ya está sellado (se reabre el más reciente primero)', async () => {
    await cuenta('A');
    await reg({ opId: 'jul', cuentaId: 'A', tipo: 'ingreso_venta', monto: 10000, fecha: '2026-07-10' });
    await reg({ opId: 'ago', cuentaId: 'A', tipo: 'ingreso_venta', monto: 20000, fecha: '2026-08-10' });
    await marcarConciliadoCore(db, { cuentaId: 'A', periodo: '2026-07', opIds: ['jul'], actor: 'adminUid' });
    await marcarConciliadoCore(db, { cuentaId: 'A', periodo: '2026-08', opIds: ['ago'], actor: 'adminUid' });
    // reabrir julio con agosto sellado → rechazo (rollover diciembre cubierto por periodoSiguiente)
    await assert.rejects(reabrirCuadreCore(db, { cuentaId: 'A', periodo: '2026-07', motivo: 'x', actor: 'ownerUid', rol: 'owner' }), esTesoError('failed-precondition'));
    // reabrir agosto (el más reciente) sí se puede; luego julio queda libre
    await reabrirCuadreCore(db, { cuentaId: 'A', periodo: '2026-08', motivo: 'orden correcto', actor: 'ownerUid', rol: 'owner' });
    const r = await reabrirCuadreCore(db, { cuentaId: 'A', periodo: '2026-07', motivo: 'ahora sí', actor: 'ownerUid', rol: 'owner' });
    assert.equal(r.reabiertos, 1);
});

// ─── B5 · D6 · Editor "Reglas del sistema" (owner-only + rangos + audit trail) ────────────────
// SoD inv.6: quien OPERA no reescribe los parámetros de su propio control (limiteCajon/enforceTurno/
// tasas son parámetros de DINERO). El audit trail ES el control (§0.7 REFUTADO: por eso no hay
// "editor sin audit"). Whitelist cerrada: un `campo` fuera de ella NO escribe nada.
async function limpiarConfig() {
    for (const col of ['config', 'saludEventos']) {
        const snap = await db.collection(col).get();
        await Promise.all(snap.docs.map((d) => d.ref.delete()));
    }
}
const cfg = async (doc) => (await db.doc(`config/${doc}`).get()).data() || {};
const eventosConfig = async () => (await db.collection('saludEventos').where('tipo', '==', 'config-cambiada').get()).docs.map((d) => d.data());
const setCfg = (campo, valor, extra = {}) => actualizarConfigSistemaCore(db, { campo, valor, actor: { uid: 'ownerUid', nombre: 'Daniel' }, rol: 'owner', ...extra });

test('D6 · owner edita enforceTurno/limiteCajon → escribe config/caja + audit con valor anterior y nuevo', async () => {
    await limpiarConfig();
    await db.doc('config/caja').set({ enforceTurno: true, limiteCajon: 2000000, fondoTrabajo: 200000 });

    const r = await setCfg('enforceTurno', false);
    assert.equal(r.doc, 'caja');
    assert.equal((await cfg('caja')).enforceTurno, false);

    const evs = await eventosConfig();
    assert.equal(evs.length, 1, 'un evento de auditoría por cambio');
    assert.equal(evs[0].campo, 'enforceTurno');
    assert.equal(evs[0].anterior, true);           // el audit prueba QUÉ cambió
    assert.equal(evs[0].nuevo, false);
    assert.equal(evs[0].actor.uid, 'ownerUid');
    // COSTURA: el Hoy cuenta los saludEventos NO resueltos como "avisos del sistema" → un cambio
    // de config es REGISTRO, no falla; debe nacer resuelto o le enciende una alarma falsa al dueño.
    assert.equal(evs[0].resuelto, true, 'auditoría, no alarma');
});

test('D6 · MERGE: cambiar un campo NO borra el resto del doc de config', async () => {
    await limpiarConfig();
    await db.doc('config/caja').set({ enforceTurno: true, limiteCajon: 2000000, fondoTrabajo: 200000 });
    await setCfg('limiteCajon', 3500000);
    const c = await cfg('caja');
    assert.equal(c.limiteCajon, 3500000);
    assert.equal(c.enforceTurno, true, 'preserva enforceTurno');
    assert.equal(c.fondoTrabajo, 200000, 'preserva fondoTrabajo (campo ajeno a D6)');
});

test('D6 · SoD: admin NO puede editar (permission-denied) y NADA cambia', async () => {
    await limpiarConfig();
    await db.doc('config/caja').set({ limiteCajon: 2000000 });
    await assert.rejects(setCfg('limiteCajon', 9999999, { rol: 'admin' }), esTesoError('permission-denied'));
    assert.equal((await cfg('caja')).limiteCajon, 2000000, 'el valor sigue intacto');
    assert.equal((await eventosConfig()).length, 0, 'sin audit de un cambio que no ocurrió');
});

test('D6 · whitelist cerrada: un campo desconocido se rechaza y no escribe nada', async () => {
    await limpiarConfig();
    await assert.rejects(setCfg('rutaDeEscape', 'lo-que-sea'), esTesoError('invalid-argument'));
    await assert.rejects(setCfg('diasPlazo', 90), esTesoError('invalid-argument'));   // existe en config/negocio, NO es de D6
    assert.equal((await db.collection('config').get()).size, 0, 'ningún doc de config creado');
});

test('D6 · rangos: limiteCajon entero > 0 · enforceTurno booleano estricto', async () => {
    await limpiarConfig();
    for (const malo of [0, -5, 1500.75, 'mucho', null]) {
        await assert.rejects(setCfg('limiteCajon', malo), esTesoError('invalid-argument'), `limiteCajon ${malo}`);
    }
    for (const malo of ['true', 1, null]) {
        await assert.rejects(setCfg('enforceTurno', malo), esTesoError('invalid-argument'), `enforceTurno ${malo}`);
    }
    // válidos
    await setCfg('limiteCajon', 1);
    assert.equal((await cfg('caja')).limiteCajon, 1);
});

test('D6 · tasas fiscales: fracciones 0-1; reteIcaXMil es POR MIL (‰), no fracción', async () => {
    await limpiarConfig();
    for (const malo of [1.5, -0.1, 'gratis']) {
        await assert.rejects(setCfg('wompiPct', malo), esTesoError('invalid-argument'), `wompiPct ${malo}`);
    }
    await setCfg('wompiPct', 0.0265);
    await setCfg('reteFuentePct', 0.025);
    assert.equal((await cfg('fiscal')).wompiPct, 0.0265);
    assert.equal((await cfg('fiscal')).reteFuentePct, 0.025);
    // reteIcaXMil: 7‰ es un valor REAL y válido (validarlo como 0-1 rompería la tarifa del contador)
    await setCfg('reteIcaXMil', 7);
    assert.equal((await cfg('fiscal')).reteIcaXMil, 7);
    await assert.rejects(setCfg('reteIcaXMil', 500), esTesoError('invalid-argument'), 'tope de cordura ‰');
    // wompiFijo es COP entero, no fracción
    await setCfg('wompiFijo', 700);
    assert.equal((await cfg('fiscal')).wompiFijo, 700);
    await assert.rejects(setCfg('wompiFijo', 700.5), esTesoError('invalid-argument'));
});

test('D6 · la whitelist cubre exactamente los campos de caja + fiscal que D6 gobierna', () => {
    assert.deepEqual(Object.keys(CAMPOS_CONFIG).sort(),
        ['enforceTurno', 'limiteCajon', 'reteFuentePct', 'reteIcaXMil', 'wompiFijo', 'wompiIvaPct', 'wompiPct'].sort());
});

// ─── B5 · V1 (P0) · Frontera virtual↔real: la consignación bóveda→banco lleva PATA BANCARIA ────
// El bug que el comité cazó en papel: la bóveda ya consignaba al banco (`boveda_a_banco`) y esa
// plata SALÍA de la bóveda sin ENTRAR a ninguna cuenta → desaparecía de la consolidada y el cuadre
// del banco nunca cerraba. Fix: la MISMA tx del traslado escribe la pata `consignacion_in`.
// ⚠️ ZONA CALIENTE R3 (toca la CF de bóveda, ya en producción): estos tests van ANTES del código.
import cajaCore from './caja-core.js';
const { registrarTrasladoCore, reversoCore, aprobarEventoCajaCore } = cajaCore;

async function limpiarBoveda() {
    const snap = await db.collection('bovedaMovimientos').get();
    await Promise.all(snap.docs.map((d) => d.ref.delete()));
    await db.doc('boveda/main').delete().catch(() => {});
}
// Siembra saldo en la bóveda por su LEDGER (el saldo es recompute, no un campo que se escriba).
const sembrarBoveda = (monto) => db.doc('bovedaMovimientos/seed').set({ tipo: 'cajon_a_boveda', monto, delta: monto, ts: new Date('2026-07-01') });
const saldoBoveda = async () => (await db.doc('boveda/main').get()).data()?.saldo ?? 0;
const pataDe = async (opId) => (await db.doc(`movimientosTesoreria/${opId}-teso`).get());
const trasladar = (input) => registrarTrasladoCore(db, { autor: 'karyUid', fecha: HOY, ...input });

test('V1 · consignación bóveda→banco: UNA tx crea el asiento de bóveda Y la pata bancaria; la plata NO desaparece', async () => {
    await limpiarBoveda();
    await cuenta('BANCO', { saldoInicial: 0 });
    await sembrarBoveda(1000000);
    const consolidadaAntes = 1000000 + (await saldoDe('BANCO'));

    const r = await trasladar({ opId: 'TR1', tipo: 'boveda_a_banco', monto: 400000, cuentaId: 'BANCO' });
    assert.equal(r.saldo, 600000, 'la bóveda baja');

    const pata = await pataDe('TR1');
    assert.ok(pata.exists, 'nace la pata bancaria en el MISMO acto');
    const p = pata.data();
    assert.equal(p.tipo, 'consignacion_in');
    assert.equal(p.cuentaId, 'BANCO');
    assert.equal(p.estado, 'activo');
    assert.equal(p.creadoPor.fuente, 'SISTEMA', 'la escribe el sistema, no la puerta manual');
    assert.equal(p.refDocumento, 'TR1', 'trazable al movimiento de bóveda');
    assert.equal(await saldoDe('BANCO'), 400000, 'el banco recibe');
    assert.equal(600000 + (await saldoDe('BANCO')), consolidadaAntes, 'CONSERVACIÓN: la consolidada no cambia');
});

test('V1 · atomicidad: cuenta inválida (inexistente / inactiva / virtual) ⇒ la tx ABORTA y la bóveda NO baja', async () => {
    await limpiarBoveda();
    await sembrarBoveda(500000);
    await seedCuentasVirtuales(db);                                   // caja/boveda virtuales
    await cuenta('OFF'); await db.doc('cuentasTesoreria/OFF').set({ activa: false }, { merge: true });

    for (const [cuentaId, etiqueta] of [['noExiste', 'inexistente'], ['OFF', 'inactiva'], ['caja', 'virtual']]) {
        await assert.rejects(trasladar({ opId: `TX-${cuentaId}`, tipo: 'boveda_a_banco', monto: 100000, cuentaId }),
            (e) => e instanceof Error, `cuenta ${etiqueta} debe rechazar`);
        assert.equal((await db.doc(`bovedaMovimientos/TX-${cuentaId}`).get()).exists, false, `sin asiento de bóveda huérfano (${etiqueta})`);
    }
    assert.equal(await saldoBoveda(), 0, 'boveda/main jamás se escribió');   // ninguna tx llegó a commitear
});

test('V1 · retrocompatible: sin cuentaId el traslado se comporta EXACTO como hoy (sin pata)', async () => {
    await limpiarBoveda();
    await sembrarBoveda(300000);
    const r = await trasladar({ opId: 'TR-SIN', tipo: 'boveda_a_banco', monto: 100000 });
    assert.equal(r.saldo, 200000);
    assert.equal((await pataDe('TR-SIN')).exists, false, 'sin cuenta elegida no inventa la pata');
    // y los traslados que NO tocan banco no aceptan cuenta (no tienen pata bancaria posible)
    await assert.rejects(trasladar({ opId: 'TR-MAL', tipo: 'cajon_a_boveda', monto: 50000, cuentaId: 'BANCO' }), (e) => e instanceof Error);
});

test('V1 · idempotencia POR-LIBRO (V4): replay no duplica; si la pata FALTA, el replay la crea', async () => {
    await limpiarBoveda();
    await cuenta('BANCO');
    await sembrarBoveda(1000000);

    // 1er intento SIN cuenta (como los traslados viejos, anteriores a V1) → solo bóveda
    await trasladar({ opId: 'TR2', tipo: 'boveda_a_banco', monto: 200000 });
    assert.equal((await pataDe('TR2')).exists, false);

    // replay del MISMO opId AHORA con cuenta → NO re-descuenta la bóveda, pero SÍ crea la pata faltante
    const r = await trasladar({ opId: 'TR2', tipo: 'boveda_a_banco', monto: 200000, cuentaId: 'BANCO' });
    assert.equal(r.yaExistia, true);
    assert.equal(await saldoBoveda(), 800000, 'la bóveda NO se descuenta dos veces');
    assert.ok((await pataDe('TR2')).exists, 'la pata que faltaba nace en el replay (V4)');
    assert.equal(await saldoDe('BANCO'), 200000);

    // un segundo replay ya no cambia nada (ambos libros completos)
    await trasladar({ opId: 'TR2', tipo: 'boveda_a_banco', monto: 200000, cuentaId: 'BANCO' });
    assert.equal(await saldoDe('BANCO'), 200000, 'sin doble asiento en tesorería');
    assert.equal((await db.collection('movimientosTesoreria').get()).size, 1);
});

test('V1 · saldo insuficiente en bóveda ⇒ no hay asiento NI pata (el gate existente sigue mandando)', async () => {
    await limpiarBoveda();
    await cuenta('BANCO');
    await sembrarBoveda(50000);
    await assert.rejects(trasladar({ opId: 'TR3', tipo: 'boveda_a_banco', monto: 400000, cuentaId: 'BANCO' }), (e) => e instanceof Error);
    assert.equal((await db.doc('bovedaMovimientos/TR3').get()).exists, false);
    assert.equal((await pataDe('TR3')).exists, false);
    assert.equal(await saldoDe('BANCO'), 0);
});

// ─── B5 · V18 · "Retiro de banco" (banco→bóveda) = espejo exacto de la consignación ────────────
// Circuito ADAPTADO del consejo externo: el efectivo entra y sale SIEMPRE por la BÓVEDA (un solo
// punto de control). banco→bóveda es flujo NUEVO (una CF, dos patas); bóveda→cajón sigue intacto;
// banco→cajón directo NO EXISTE a propósito. Al ser nuevo NO hay legado que preservar → la cuenta
// es OBLIGATORIA (no se puede "retirar del banco" sin decir de cuál).
test('V18 · retiro de banco: la bóveda sube y la cuenta baja en UNA tx; la consolidada se conserva', async () => {
    await limpiarBoveda();
    await cuenta('BANCO', { saldoInicial: 2000000 });
    await sembrarBoveda(100000);
    const consolidadaAntes = 100000 + (await saldoDe('BANCO'));

    const r = await trasladar({ opId: 'RB1', tipo: 'banco_a_boveda', monto: 500000, cuentaId: 'BANCO' });
    assert.equal(r.saldo, 600000, 'la bóveda recibe el efectivo');

    const p = (await pataDe('RB1')).data();
    assert.equal(p.tipo, 'retiro_efectivo_out', 'la pata SALE de la cuenta bancaria');
    assert.equal(p.cuentaId, 'BANCO');
    assert.equal(p.creadoPor.fuente, 'SISTEMA');
    assert.equal(p.refDocumento, 'RB1');
    assert.equal(await saldoDe('BANCO'), 1500000, '2.000.000 − 500.000');
    assert.equal(600000 + (await saldoDe('BANCO')), consolidadaAntes, 'CONSERVACIÓN: solo cambió DÓNDE está');
});

test('V18 · flujo NUEVO ⇒ la cuenta es OBLIGATORIA (sin legado que preservar) y no queda asiento', async () => {
    await limpiarBoveda();
    await sembrarBoveda(100000);
    await assert.rejects(trasladar({ opId: 'RB-SIN', tipo: 'banco_a_boveda', monto: 200000 }), (e) => e instanceof Error);
    assert.equal((await db.doc('bovedaMovimientos/RB-SIN').get()).exists, false, 'sin asiento de bóveda');
    assert.equal(await saldoBoveda(), 0, 'la bóveda no se movió');
});

test('V18 · atomicidad + idempotencia por-libro (mismo blindaje que V1)', async () => {
    await limpiarBoveda();
    await cuenta('BANCO', { saldoInicial: 1000000 });
    await sembrarBoveda(0);
    // cuenta inválida ⇒ aborta TODO (la bóveda no recibe plata de la nada)
    await assert.rejects(trasladar({ opId: 'RB-MAL', tipo: 'banco_a_boveda', monto: 100000, cuentaId: 'noExiste' }), (e) => e instanceof Error);
    assert.equal((await db.doc('bovedaMovimientos/RB-MAL').get()).exists, false);
    // replay del MISMO opId ⇒ un solo asiento en cada libro
    await trasladar({ opId: 'RB2', tipo: 'banco_a_boveda', monto: 300000, cuentaId: 'BANCO' });
    const r2 = await trasladar({ opId: 'RB2', tipo: 'banco_a_boveda', monto: 300000, cuentaId: 'BANCO' });
    assert.equal(r2.yaExistia, true);
    assert.equal(await saldoBoveda(), 300000, 'la bóveda no recibe dos veces');
    assert.equal(await saldoDe('BANCO'), 700000, 'la cuenta no se descuenta dos veces');
    assert.equal((await db.collection('movimientosTesoreria').get()).size, 1);
});

test('V18 · el efectivo SIEMPRE pasa por la bóveda: no existe un traslado banco→cajón directo', async () => {
    await limpiarBoveda();
    await cuenta('BANCO', { saldoInicial: 1000000 });
    await assert.rejects(trasladar({ opId: 'BC', tipo: 'banco_a_cajon', monto: 100000, cuentaId: 'BANCO' }), (e) => e instanceof Error,
        'banco→cajón directo NO es un tipo válido (un solo punto de entrada del efectivo)');
});

// ─── B6 · P0-1 · La REVERSA de un traslado con pata bancaria debe netear los DOS libros ─────────
// Hallazgo del rompimiento (2026-07-27): V1/V18 añadieron un TERCER libro (el banco) al traslado de
// bóveda, pero el camino de DESHACER —`reversoCore` + su aprobación— seguía neteando solo la bóveda
// (y el acumulador del turno, fix de 2026-07-10). La pata bancaria quedaba VIVA: reversar una
// consignación devolvía la plata a la bóveda SIN quitarla del banco ⇒ la consolidada inventaba
// plata. Invisible para el cuadre 3:30 (compara cada libro CONSIGO MISMO, no entre libros).
// Doctrina del fix = la MISMA que la anulación del abono (D9): la pata se SELLA `estado:'anulado'`
// (append-only; el recompute solo suma 'activo') y lo ya CUADRADO contra el extracto es intocable.
// ⚠️ ZONA CALIENTE R3: estos tests van ANTES del código.
const reversar = (opId, reversaA) => reversoCore(db, { opId, reversaA, autor: 'karyUid', motivo: 'consignación mal digitada' });
const aprobar = (opId) => aprobarEventoCajaCore(db, { opId, aprobadoPor: 'ownerUid', rol: 'owner' });

test('B6 · reversar una CONSIGNACIÓN netea AMBOS libros: la plata vuelve a la bóveda y sale del banco', async () => {
    await limpiarBoveda();
    await cuenta('BANCO', { saldoInicial: 0 });
    await sembrarBoveda(1000000);
    const consolidadaAntes = 1000000 + (await saldoDe('BANCO'));

    await trasladar({ opId: 'RVT1', tipo: 'boveda_a_banco', monto: 400000, cuentaId: 'BANCO' });
    assert.equal(await saldoDe('BANCO'), 400000, 'la consignación entró al banco');

    await reversar('RVT1-REV', 'RVT1');
    assert.equal(await saldoDe('BANCO'), 400000, 'SoD: el reverso PENDIENTE todavía no netea nada');
    assert.equal((await pataDe('RVT1')).data().estado, 'activo');

    await aprobar('RVT1-REV');
    assert.equal(await saldoBoveda(), 1000000, 'la plata vuelve a la bóveda');
    const pata = (await pataDe('RVT1')).data();
    assert.equal(pata.estado, 'anulado', 'la pata bancaria se SELLA (append-only, no se borra)');
    assert.equal(pata.reversadoPor.opId, 'RVT1-REV', 'queda el rastro de quién la neteó');
    assert.equal(await saldoDe('BANCO'), 0, 'el banco deja de contarla');
    assert.equal((await saldoBoveda()) + (await saldoDe('BANCO')), consolidadaAntes,
        'CONSERVACIÓN: deshacer no puede CREAR plata');
});

test('B6 · reversar un RETIRO DE BANCO (V18) es el espejo: la bóveda baja y la cuenta la recupera', async () => {
    await limpiarBoveda();
    await cuenta('BANCO', { saldoInicial: 2000000 });
    await sembrarBoveda(100000);
    const consolidadaAntes = 100000 + (await saldoDe('BANCO'));

    await trasladar({ opId: 'RVT2', tipo: 'banco_a_boveda', monto: 500000, cuentaId: 'BANCO' });
    assert.equal(await saldoDe('BANCO'), 1500000);

    await reversar('RVT2-REV', 'RVT2');
    await aprobar('RVT2-REV');

    assert.equal(await saldoBoveda(), 100000, 'el efectivo sale de la bóveda');
    assert.equal((await pataDe('RVT2')).data().estado, 'anulado');
    assert.equal(await saldoDe('BANCO'), 2000000, 'la cuenta recupera lo que nunca salió');
    assert.equal((await saldoBoveda()) + (await saldoDe('BANCO')), consolidadaAntes,
        'CONSERVACIÓN: deshacer no puede DESAPARECER plata');
});

test('B6 · lo ya CUADRADO contra el extracto es intocable: la reversa se rechaza (misma doctrina del turno sellado)', async () => {
    await limpiarBoveda();
    await cuenta('BANCO', { saldoInicial: 0 });
    await sembrarBoveda(1000000);
    await trasladar({ opId: 'RVT3', tipo: 'boveda_a_banco', monto: 400000, cuentaId: 'BANCO' });
    await marcarConciliadoCore(db, { cuentaId: 'BANCO', periodo: '2026-07', opIds: ['RVT3-teso'], actor: 'karyUid' });

    await assert.rejects(reversar('RVT3-REV', 'RVT3'), /cuadrad|extracto/i,
        'no se reescribe un mes ya cuadrado: eso es un ajuste nuevo, no una reversa');
    assert.equal((await db.doc('bovedaMovimientos/RVT3-REV').get()).exists, false, 'sin asiento de reversa huérfano');
    assert.equal(await saldoDe('BANCO'), 400000, 'el banco queda como estaba');
});

test('B6 · retrocompatible: reversar un traslado SIN pata bancaria se comporta EXACTO como antes', async () => {
    await limpiarBoveda();
    await sembrarBoveda(500000);
    await trasladar({ opId: 'RVT4', tipo: 'boveda_a_banco', monto: 200000 });   // consignación vieja, sin cuenta
    assert.equal(await saldoBoveda(), 300000);

    await reversar('RVT4-REV', 'RVT4');
    await aprobar('RVT4-REV');
    assert.equal(await saldoBoveda(), 500000, 'la bóveda se netea igual que siempre');
    assert.equal((await db.collection('movimientosTesoreria').get()).size, 0, 'no inventa patas donde no las hay');
});

test('B6 · la reversa NO se puede aprobar dos veces (el banco no se netea dos veces)', async () => {
    await limpiarBoveda();
    await cuenta('BANCO', { saldoInicial: 0 });
    await sembrarBoveda(1000000);
    await trasladar({ opId: 'RVT5', tipo: 'boveda_a_banco', monto: 400000, cuentaId: 'BANCO' });
    await reversar('RVT5-REV', 'RVT5');
    await aprobar('RVT5-REV');
    const r2 = await aprobar('RVT5-REV');
    assert.equal(r2.yaExistia, true, 'aprobar de nuevo es idempotente');
    assert.equal(await saldoBoveda(), 1000000);
    assert.equal(await saldoDe('BANCO'), 0, 'el banco quedó en 0, no en −400.000');
});
