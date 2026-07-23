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
