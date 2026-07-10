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
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import core from './caja-core.js';
import pedidosCore from './pedidos-core.js';
const { abrirTurnoCore, cerrarTurnoCore, registrarTrasladoCore, reversoCore, recalcBovedaCore,
        movimientoCajaCore, ajusteCore, aprobarEventoCajaCore } = core;
const { crearPedidoCore, COTA_TURNO } = pedidosCore;

// Limpia la bóveda entre tests B3 (singleton + ledger + checkpoints).
async function resetBoveda() {
    await db.doc('boveda/main').delete().catch(() => {});
    const movs = await db.collection('bovedaMovimientos').get();
    await Promise.all(movs.docs.map((d) => d.ref.delete()));
    const cps = await db.collection('boveda').doc('main').collection('checkpoints').get();
    await Promise.all(cps.docs.map((d) => d.ref.delete()));
}

initializeApp({ projectId: 'demo-bersaglio' });
const db = getFirestore();

const limpiarPuntero = () => db.doc('caja/estado').delete().catch(() => {});
const sinEnforce   = () => db.doc('config/caja').delete().catch(() => {});   // config ausente ⇒ enforceTurno=false
before(async () => {
    await limpiarPuntero();
    await sinEnforce();
    // Pieza precio-fijo con stock holgado para las ventas POS del bloque B2 (id fijo, cantidad alta).
    await db.doc('pieces/pCajaB2').set({ name: 'Dije B2', slug: 'dije-b2', price: 100000, stockType: 'finito', cantidad: 500, visibilidad: 'privada' });
});

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

test('abrir · doble-tap MISMO opId → idempotente (1 turno, sin duplicar)', async () => {
    await limpiarPuntero();
    // opId = docId ⇒ la duplicación es estructuralmente imposible. Bajo contención extrema el emulador
    // puede abortar una de las dos tx (en prod el cliente reintenta); aseramos el INVARIANTE, no el XOR.
    const settled = await Promise.allSettled([
        abrirTurnoCore(db, { opId: 'IDEM', fondoApertura: 200000, autor: 'c1' }),
        abrirTurnoCore(db, { opId: 'IDEM', fondoApertura: 200000, autor: 'c1' }),
    ]);
    assert.ok(settled.some((s) => s.status === 'fulfilled' && s.value.turnoId === 'IDEM'), 'al menos una apertura resolvió');
    assert.equal((await db.doc('turnos/IDEM').get()).exists, true);
    assert.equal((await db.doc('caja/estado').get()).data().turnoAbiertoId, 'IDEM');
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

// ─── B2 · Enlace venta↔turno (crearPedido POS) — invariantes #5/#6, §9.5, cota §9.2 ──────────
test('B2 · venta POS con turno abierto guarda turnoId en TODOS los medios (§9.5)', async () => {
    await limpiarPuntero(); await sinEnforce();
    await abrirTurnoCore(db, { opId: 'TV', fondoApertura: 200000, autor: 'c1' });
    const r1 = await crearPedidoCore(db, { pedidoId: 'v-efec', pieceId: 'pCajaB2', medio: 'efectivo', canal: 'pos', autor: 'c1' });
    const r2 = await crearPedidoCore(db, { pedidoId: 'v-transf', pieceId: 'pCajaB2', medio: 'transferencia', canal: 'pos', autor: 'c1' });
    assert.equal(r1.turnoId, 'TV');
    assert.equal(r2.turnoId, 'TV');                                   // §9.5: transferencia POS también hereda el turno
    assert.equal((await db.doc('pedidos/v-efec').get()).data().turnoId, 'TV');
    assert.equal((await db.doc('pedidos/v-transf').get()).data().turnoId, 'TV');
    assert.equal((await db.doc('caja/estado').get()).data().docsDelTurno, 2);   // cota: 2 ventas en el turno
});

test('B2 · venta WEB NO hereda turno (el cliente paga solo; reporte digital aparte, §9.5)', async () => {
    await limpiarPuntero(); await sinEnforce();
    await abrirTurnoCore(db, { opId: 'TW', fondoApertura: 0, autor: 'c1' });
    const r = await crearPedidoCore(db, { pedidoId: 'v-web', pieceId: 'pCajaB2', medio: 'efectivo', canal: 'whatsapp', autor: 'c1' });
    assert.equal(r.turnoId ?? null, null);                           // canal ≠ pos → sin turnoId
    assert.equal((await db.doc('pedidos/v-web').get()).data().turnoId ?? null, null);
    assert.equal((await db.doc('caja/estado').get()).data().docsDelTurno, 0);   // no tocó la cota del turno
});

test('B2 · sin turno + enforceTurno=true → RECHAZA la venta POS ("abre la caja")', async () => {
    await limpiarPuntero();
    await db.doc('config/caja').set({ enforceTurno: true });
    await assert.rejects(
        crearPedidoCore(db, { pedidoId: 'v-noturno', pieceId: 'pCajaB2', medio: 'efectivo', canal: 'pos', autor: 'c1' }),
        /abre la caja/i,
    );
    assert.equal((await db.doc('pedidos/v-noturno').get()).exists, false);   // no se creó
    await sinEnforce();
});

test('B2 · sin turno + enforceTurno=false → vende sin turnoId (compat. migración T0)', async () => {
    await limpiarPuntero(); await sinEnforce();
    const r = await crearPedidoCore(db, { pedidoId: 'v-legacy', pieceId: 'pCajaB2', medio: 'efectivo', canal: 'pos', autor: 'c1' });
    assert.equal(r.turnoId ?? null, null);
    assert.equal((await db.doc('pedidos/v-legacy').get()).data().turnoId ?? null, null);
});

test('B2 · cota §9.2: al cruzar COTA_TURNO la venta devuelve cotaProxima=true', async () => {
    await limpiarPuntero(); await sinEnforce();
    await abrirTurnoCore(db, { opId: 'TCota', fondoApertura: 0, autor: 'c1' });
    await db.doc('caja/estado').update({ docsDelTurno: COTA_TURNO - 1 });     // justo debajo del tope
    const r = await crearPedidoCore(db, { pedidoId: 'v-cota', pieceId: 'pCajaB2', medio: 'efectivo', canal: 'pos', autor: 'c1' });
    assert.equal(r.cotaProxima, true);
    assert.equal((await db.doc('caja/estado').get()).data().docsDelTurno, COTA_TURNO);
});

test('B2 · CARRERA cerrarTurno vs crearPedido → sin pedido HUÉRFANO (invariante #5)', async () => {
    await limpiarPuntero();
    await db.doc('config/caja').set({ enforceTurno: true });
    await abrirTurnoCore(db, { opId: 'TRace', fondoApertura: 0, autor: 'c1' });
    const [rClose, rSale] = await Promise.allSettled([
        cerrarTurnoCore(db, { turnoId: 'TRace', conteoPorMedio: { efectivo: 100000 }, autor: 'c1' }),
        crearPedidoCore(db, { pedidoId: 'pRace', pieceId: 'pCajaB2', medio: 'efectivo', canal: 'pos', autor: 'c1' }),
    ]);
    assert.equal(rClose.status, 'fulfilled');                        // el cierre SIEMPRE gana (o la venta reintenta)
    const pedSnap = await db.doc('pedidos/pRace').get();
    const turno = (await db.doc('turnos/TRace').get()).data();
    assert.equal(turno.estado, 'cerrado');
    // INVARIANTE: si el pedido quedó con turnoId=TRace, el cierre DEBE haberlo contado (no huérfano);
    // si no, la venta fue rechazada (puntero ya null) o no lleva turnoId. Nunca lo tercero.
    if (pedSnap.exists && pedSnap.data().turnoId === 'TRace') {
        assert.ok(turno.esperadoPorMedio.efectivo >= pedSnap.data().total, 'el cierre contó el pedido enlazado');
    } else {
        assert.ok(!pedSnap.exists || (pedSnap.data().turnoId ?? null) === null, 'venta rechazada o sin turno = sin huérfano');
    }
    await sinEnforce();
});

// ─── B3 · Bóveda: traslado/reverso + recompute + checkpoint (§9.3 · §8.1.2/3 · §8.3) ─────────
test('B3 · traslado cajón→bóveda: el saldo SUBE por recompute (no se incrementa a mano)', async () => {
    await resetBoveda();
    await limpiarPuntero();
    await abrirTurnoCore(db, { opId: 'T', fondoApertura: 0, autor: 'kary' });   // 2026-07-10: el turno atribuido debe existir y estar abierto
    const r1 = await registrarTrasladoCore(db, { opId: 'TR1', tipo: 'cajon_a_boveda', monto: 100000, turnoId: 'T', autor: 'kary' });
    assert.equal(r1.saldo, 100000);
    const r2 = await registrarTrasladoCore(db, { opId: 'TR2', tipo: 'cajon_a_boveda', monto: 50000, turnoId: 'T', autor: 'kary' });
    assert.equal(r2.saldo, 150000);
    assert.equal((await db.doc('boveda/main').get()).data().saldo, 150000);
    const mov = (await db.doc('bovedaMovimientos/TR1').get()).data();
    assert.equal(mov.delta, 100000);                        // delta firmado = autoridad del recompute
});

test('B3 · salida boveda→banco: el saldo BAJA (signo por tipo)', async () => {
    await resetBoveda();
    await registrarTrasladoCore(db, { opId: 'S1', tipo: 'cajon_a_boveda', monto: 200000, autor: 'kary' });
    const r = await registrarTrasladoCore(db, { opId: 'S2', tipo: 'boveda_a_banco', monto: 120000, autor: 'kary', nota: 'consignación' });
    assert.equal(r.saldo, 80000);
    assert.equal((await db.doc('bovedaMovimientos/S2').get()).data().delta, -120000);
});

test('B3/B4 · reverso: NO borra el original — nace asiento compensatorio PENDIENTE (saldo NO cambia aún, §9.1)', async () => {
    await resetBoveda();
    await registrarTrasladoCore(db, { opId: 'ORIG', tipo: 'cajon_a_boveda', monto: 100000, autor: 'kary' });
    const rev = await reversoCore(db, { opId: 'REV', reversaA: 'ORIG', autor: 'kary', motivo: 'traslado mal digitado' });
    assert.equal(rev.estado, 'pendiente_aprobacion');       // destructivo → requiere firma del owner
    assert.equal(rev.saldo, 100000);                        // NO cuenta hasta aprobar
    assert.equal((await db.doc('bovedaMovimientos/ORIG').get()).exists, true);   // el original SIGUE (no se borró)
    const r = (await db.doc('bovedaMovimientos/REV').get()).data();
    assert.equal(r.tipo, 'reverso');
    assert.equal(r.reversaA, 'ORIG');
    assert.equal(r.delta, -100000);                         // exactamente el opuesto
    assert.equal(r.estado, 'pendiente_aprobacion');
    assert.equal((await db.doc('boveda/main').get()).data().saldo, 100000);   // saldo INTACTO (pendiente)
});

test('B3 · reverso: doble reverso del MISMO original → rechaza (no doble compensación)', async () => {
    await resetBoveda();
    await registrarTrasladoCore(db, { opId: 'O2', tipo: 'cajon_a_boveda', monto: 100000, autor: 'kary' });
    await reversoCore(db, { opId: 'RV2', reversaA: 'O2', autor: 'kary', motivo: 'x' });
    await assert.rejects(reversoCore(db, { opId: 'RV2b', reversaA: 'O2', autor: 'kary', motivo: 'otra vez' }), /ya.*revers/i);
});

test('B3 · idempotencia: doble-tap MISMO opId de traslado → saldo NO se duplica (un solo asiento)', async () => {
    await resetBoveda();
    // opId = docId ⇒ un solo movimiento posible. Tolera un abort transitorio; asera el saldo.
    const settled = await Promise.allSettled([
        registrarTrasladoCore(db, { opId: 'IDEMT', tipo: 'cajon_a_boveda', monto: 100000, autor: 'kary' }),
        registrarTrasladoCore(db, { opId: 'IDEMT', tipo: 'cajon_a_boveda', monto: 100000, autor: 'kary' }),
    ]);
    assert.ok(settled.some((s) => s.status === 'fulfilled'), 'al menos un traslado resolvió');
    assert.equal((await db.doc('boveda/main').get()).data().saldo, 100000);   // NO 200000
    assert.equal((await db.collection('bovedaMovimientos').get()).docs.filter((d) => d.id === 'IDEMT').length, 1);
});

test('B3 · guard de monto: no-entero / negativo / cero → rechaza (§8.3)', async () => {
    await resetBoveda();
    await assert.rejects(registrarTrasladoCore(db, { opId: 'G1', tipo: 'cajon_a_boveda', monto: 100.5, autor: 'k' }), /monto/i);
    await assert.rejects(registrarTrasladoCore(db, { opId: 'G2', tipo: 'cajon_a_boveda', monto: -100, autor: 'k' }), /monto/i);
    await assert.rejects(registrarTrasladoCore(db, { opId: 'G3', tipo: 'cajon_a_boveda', monto: 0, autor: 'k' }), /monto/i);
    await assert.rejects(registrarTrasladoCore(db, { opId: 'G4', tipo: 'inventado', monto: 100, autor: 'k' }), /tipo/i);
});

test('B3 · saldo insuficiente: boveda→banco por más que el saldo → rechaza (no deja negativa la bóveda)', async () => {
    await resetBoveda();
    await registrarTrasladoCore(db, { opId: 'I1', tipo: 'cajon_a_boveda', monto: 50000, autor: 'kary' });
    await assert.rejects(registrarTrasladoCore(db, { opId: 'I2', tipo: 'boveda_a_banco', monto: 120000, autor: 'kary' }), /insuficiente/i);
    assert.equal((await db.doc('boveda/main').get()).data().saldo, 50000);   // no cambió
});

test('B3 · checkpoint ACOTA el recompute (base sellada + solo movimientos posteriores)', async () => {
    await resetBoveda();
    const sellTs = Timestamp.fromMillis(1_700_000_000_000);   // corte fijo en el pasado
    await db.doc('boveda/main/checkpoints/2026-06').set({ mes: '2026-06', saldo: 500000, sellTs });
    // Movimiento ANTERIOR al corte (ya sellado en el checkpoint) → debe IGNORARSE en el recompute.
    await db.doc('bovedaMovimientos/viejo').set({ tipo: 'cajon_a_boveda', monto: 999999, delta: 999999, autor: 'x', ts: Timestamp.fromMillis(1_600_000_000_000) });
    // Nuevo traslado (ts = ahora > sellTs) → recompute = 500000 + 30000, ignora el viejo.
    const r = await registrarTrasladoCore(db, { opId: 'CP1', tipo: 'cajon_a_boveda', monto: 30000, autor: 'kary' });
    assert.equal(r.saldo, 530000);
    assert.equal((await recalcBovedaCore(db)).saldo, 530000);   // el recompute standalone (trigger) coincide
});

test('B3 · recalcBovedaCore: no-op si el saldo no cambió (evita re-trigger)', async () => {
    await resetBoveda();
    await registrarTrasladoCore(db, { opId: 'NC1', tipo: 'cajon_a_boveda', monto: 100000, autor: 'kary' });
    const r = await recalcBovedaCore(db);
    assert.equal(r.saldo, 100000);
    assert.equal(r.changed, false);                         // ya estaba en 100000 → no reescribe
});

// ─── B4 · Dual-Approval (§9.1) + alertas al owner (§9.8, mock) ────────────────────────────────
const mockAlertas = () => { const buf = []; return { notificar: (e) => buf.push(e), buf }; };

test('B4 · evento destructivo (reverso) NO cuenta hasta que el OWNER aprueba; luego el saldo baja', async () => {
    await resetBoveda();
    await registrarTrasladoCore(db, { opId: 'RO', tipo: 'cajon_a_boveda', monto: 100000, autor: 'kary' });
    await reversoCore(db, { opId: 'RREV', reversaA: 'RO', autor: 'caja1', motivo: 'error' });
    assert.equal((await db.doc('boveda/main').get()).data().saldo, 100000);   // pendiente → aún no cuenta
    const ap = await aprobarEventoCajaCore(db, { opId: 'RREV', aprobadoPor: 'kary', rol: 'owner' });
    assert.equal(ap.estado, 'aprobado');
    assert.equal(ap.saldo, 0);                                                 // ya cuenta → compensado
    assert.equal((await db.doc('bovedaMovimientos/RREV').get()).data().estado, 'aprobado');
    assert.equal((await db.doc('boveda/main').get()).data().saldo, 0);
});

test('B4 · la CAJA NO puede aprobar (SoD): rol ≠ owner → rechaza', async () => {
    await resetBoveda();
    await registrarTrasladoCore(db, { opId: 'RO2', tipo: 'cajon_a_boveda', monto: 100000, autor: 'kary' });
    await reversoCore(db, { opId: 'RREV2', reversaA: 'RO2', autor: 'caja1', motivo: 'error' });
    await assert.rejects(aprobarEventoCajaCore(db, { opId: 'RREV2', aprobadoPor: 'caja1', rol: 'caja' }), /dueñ|owner|aprob/i);
    assert.equal((await db.doc('bovedaMovimientos/RREV2').get()).data().estado, 'pendiente_aprobacion');   // sigue pendiente
    assert.equal((await db.doc('boveda/main').get()).data().saldo, 100000);   // no cambió
});

test('B4 · ajuste_faltante nace pendiente (no cuenta) → owner aprueba → baja el saldo', async () => {
    await resetBoveda();
    await registrarTrasladoCore(db, { opId: 'AJB', tipo: 'cajon_a_boveda', monto: 500000, autor: 'kary' });
    const aj = await ajusteCore(db, { opId: 'AJ1', tipo: 'ajuste_faltante', monto: 20000, motivo: 'conteo físico: faltan 20k', autor: 'caja1' });
    assert.equal(aj.estado, 'pendiente_aprobacion');
    assert.equal((await db.doc('boveda/main').get()).data().saldo, 500000);   // pendiente → no cuenta
    const ap = await aprobarEventoCajaCore(db, { opId: 'AJ1', aprobadoPor: 'kary', rol: 'owner' });
    assert.equal(ap.saldo, 480000);                                            // 500000 − 20000
});

test('B4 · ajuste: monto inválido / motivo vacío / tipo malo → rechaza', async () => {
    await resetBoveda();
    await assert.rejects(ajusteCore(db, { opId: 'AX1', tipo: 'ajuste_faltante', monto: -5, motivo: 'x', autor: 'c' }), /monto/i);
    await assert.rejects(ajusteCore(db, { opId: 'AX2', tipo: 'ajuste_faltante', monto: 5000, motivo: '', autor: 'c' }), /motivo/i);
    await assert.rejects(ajusteCore(db, { opId: 'AX3', tipo: 'inventado', monto: 5000, motivo: 'x', autor: 'c' }), /tipo/i);
});

test('B4 · alerta al owner: crear un reverso EMITE alerta (mock); el destinatario incluye SIEMPRE al owner', async () => {
    await resetBoveda();
    const a = mockAlertas();
    await registrarTrasladoCore(db, { opId: 'AL1', tipo: 'cajon_a_boveda', monto: 100000, autor: 'kary' });
    await reversoCore(db, { opId: 'ALREV', reversaA: 'AL1', autor: 'caja1', motivo: 'error' }, a);
    assert.equal(a.buf.length, 1);
    assert.equal(a.buf[0].evento, 'reverso');
    assert.equal(a.buf[0].requiereAprobacion, true);
});

test('B4 · movimientoCaja EGRESO emite alerta (fraude interno §8.5); INGRESO no', async () => {
    await limpiarPuntero();
    await abrirTurnoCore(db, { opId: 'TMOV', fondoApertura: 200000, autor: 'caja1' });
    const a = mockAlertas();
    const eg = await movimientoCajaCore(db, { turnoId: 'TMOV', opId: 'MEG', tipo: 'egreso', concepto: 'gasto_menor', monto: 15000, autor: 'caja1' }, a);
    assert.equal(eg.yaExistia, false);
    assert.equal((await db.doc('turnos/TMOV/movsCaja/MEG').get()).data().monto, 15000);
    assert.equal(a.buf.filter((e) => e.evento === 'egreso').length, 1);        // egreso → alerta
    const b = mockAlertas();
    await movimientoCajaCore(db, { turnoId: 'TMOV', opId: 'MIN', tipo: 'ingreso', concepto: 'otro', monto: 5000, nota: 'devolución', autor: 'caja1' }, b);
    assert.equal(b.buf.filter((e) => e.evento === 'egreso').length, 0);        // ingreso → sin alerta de egreso
});

test('B4 · movimientoCaja: concepto fuera de lista / "otro" sin nota / turno cerrado → rechaza', async () => {
    await limpiarPuntero();
    await abrirTurnoCore(db, { opId: 'TMOV2', fondoApertura: 0, autor: 'caja1' });
    await assert.rejects(movimientoCajaCore(db, { turnoId: 'TMOV2', opId: 'MC1', tipo: 'egreso', concepto: 'sobornos', monto: 1000, autor: 'c' }), /concepto/i);
    await assert.rejects(movimientoCajaCore(db, { turnoId: 'TMOV2', opId: 'MC2', tipo: 'egreso', concepto: 'otro', monto: 1000, autor: 'c' }), /nota/i);
    await cerrarTurnoCore(db, { turnoId: 'TMOV2', conteoPorMedio: { efectivo: 0 }, autor: 'caja1' });
    await assert.rejects(movimientoCajaCore(db, { turnoId: 'TMOV2', opId: 'MC3', tipo: 'egreso', concepto: 'gasto_menor', monto: 1000, autor: 'c' }), /cerrad|abiert/i);
});

test('B4 · aprobar: evento inexistente → not-found; doble aprobación → idempotente', async () => {
    await resetBoveda();
    await registrarTrasladoCore(db, { opId: 'DA', tipo: 'cajon_a_boveda', monto: 100000, autor: 'kary' });
    await reversoCore(db, { opId: 'DAREV', reversaA: 'DA', autor: 'caja1', motivo: 'x' });
    await assert.rejects(aprobarEventoCajaCore(db, { opId: 'NOEXISTE', aprobadoPor: 'kary', rol: 'owner' }), /no existe|not.?found/i);
    const a1 = await aprobarEventoCajaCore(db, { opId: 'DAREV', aprobadoPor: 'kary', rol: 'owner' });
    const a2 = await aprobarEventoCajaCore(db, { opId: 'DAREV', aprobadoPor: 'kary', rol: 'owner' });
    assert.equal(a1.saldo, 0);
    assert.equal(a2.yaExistia, true);
    assert.equal(a2.saldo, 0);                                                 // no re-aplica
});

// ─── Fix traslado-duplicado (2026-07-10) · acumuladores del turno + reversa consciente del turno ──
// RCA real de prod (2026-07-09): la carrera de listeners del POS duplicó un traslado de $5.6M; la
// reversa arregló la bóveda pero el cierre del turno selló un descuadre de +11.2M porque no la veía.

test('acumuladores · abrir inicializa en 0; el traslado con turnoId incrementa en la MISMA tx (idempotente)', async () => {
    await limpiarPuntero(); await resetBoveda();
    await abrirTurnoCore(db, { opId: 'TAC1', fondoApertura: 200000, autor: 'kary' });
    let t = (await db.doc('turnos/TAC1').get()).data();
    assert.equal(t.cajonABoveda, 0);
    assert.equal(t.bovedaACajon, 0);
    await registrarTrasladoCore(db, { opId: 'TAC1-T1', tipo: 'cajon_a_boveda', monto: 300000, turnoId: 'TAC1', autor: 'kary' });
    await registrarTrasladoCore(db, { opId: 'TAC1-T2', tipo: 'boveda_a_cajon', monto: 50000, turnoId: 'TAC1', autor: 'kary' });
    t = (await db.doc('turnos/TAC1').get()).data();
    assert.equal(t.cajonABoveda, 300000);
    assert.equal(t.bovedaACajon, 50000);
    // Reintento del MISMO opId → idempotente: NO re-incrementa el acumulador.
    await registrarTrasladoCore(db, { opId: 'TAC1-T1', tipo: 'cajon_a_boveda', monto: 300000, turnoId: 'TAC1', autor: 'kary' });
    assert.equal((await db.doc('turnos/TAC1').get()).data().cajonABoveda, 300000);
    await cerrarTurnoCore(db, { turnoId: 'TAC1', conteoPorMedio: { efectivo: 0 }, autor: 'kary' });
});

test('acumuladores · traslado atribuido a turno CERRADO o inexistente → rechaza (sin turnoId sigue OK)', async () => {
    await limpiarPuntero(); await resetBoveda();
    await abrirTurnoCore(db, { opId: 'TAC2', fondoApertura: 0, autor: 'kary' });
    await cerrarTurnoCore(db, { turnoId: 'TAC2', conteoPorMedio: { efectivo: 0 }, autor: 'kary' });
    await assert.rejects(registrarTrasladoCore(db, { opId: 'TAC2-T1', tipo: 'cajon_a_boveda', monto: 1000, turnoId: 'TAC2', autor: 'kary' }), /cerrad/i);
    await assert.rejects(registrarTrasladoCore(db, { opId: 'TAC2-T2', tipo: 'cajon_a_boveda', monto: 1000, turnoId: 'NOEXISTE', autor: 'kary' }), /no existe/i);
    const r = await registrarTrasladoCore(db, { opId: 'TAC2-T3', tipo: 'cajon_a_boveda', monto: 1000, autor: 'kary' });
    assert.equal(r.saldo, 1000);
});

test('reversa-turno · ESCENARIO DEL DUPLICADO: reverso hereda turnoId, aprobar netea el acumulador y el CIERRE lo ve', async () => {
    await limpiarPuntero(); await resetBoveda();
    await abrirTurnoCore(db, { opId: 'TDUP', fondoApertura: 200000, autor: 'kary' });
    await registrarTrasladoCore(db, { opId: 'DUP-1', tipo: 'cajon_a_boveda', monto: 100000, turnoId: 'TDUP', autor: 'kary' });
    await registrarTrasladoCore(db, { opId: 'DUP-2', tipo: 'cajon_a_boveda', monto: 100000, turnoId: 'TDUP', autor: 'kary' });   // el fantasma
    const rev = await reversoCore(db, { opId: 'DUP-REV', reversaA: 'DUP-2', autor: 'kary', motivo: 'traslado duplicado' });
    assert.equal(rev.estado, 'pendiente_aprobacion');
    const revDoc = (await db.doc('bovedaMovimientos/DUP-REV').get()).data();
    assert.equal(revDoc.turnoId, 'TDUP');                        // hereda el turno del original
    assert.equal(revDoc.reversaTipo, 'cajon_a_boveda');
    assert.equal((await db.doc('turnos/TDUP').get()).data().cajonABoveda, 200000);   // pendiente: aún NO netea
    await aprobarEventoCajaCore(db, { opId: 'DUP-REV', aprobadoPor: 'kary', rol: 'owner' });
    assert.equal((await db.doc('turnos/TDUP').get()).data().cajonABoveda, 100000);   // acumulador neteado
    assert.equal((await db.doc('boveda/main').get()).data().saldo, 100000);          // bóveda sana
    const cierre = await cerrarTurnoCore(db, { turnoId: 'TDUP', conteoPorMedio: { efectivo: 100000 }, autor: 'kary' });
    assert.equal(cierre.esperadoEfectivo, 100000);   // 200000 − (200000 − 100000 reversa) — antes del fix: 0 y descuadre fantasma
    assert.equal(cierre.descuadre, 0);
});

test('reversa-turno · reverso PENDIENTE no cuenta: el cierre solo netea reversas APROBADAS', async () => {
    await limpiarPuntero(); await resetBoveda();
    await abrirTurnoCore(db, { opId: 'TPEND', fondoApertura: 0, autor: 'kary' });
    await registrarTrasladoCore(db, { opId: 'PEND-1', tipo: 'cajon_a_boveda', monto: 40000, turnoId: 'TPEND', autor: 'kary' });
    await reversoCore(db, { opId: 'PEND-REV', reversaA: 'PEND-1', autor: 'kary', motivo: 'x' });
    const cierre = await cerrarTurnoCore(db, { turnoId: 'TPEND', conteoPorMedio: { efectivo: 0 }, autor: 'kary' });
    assert.equal(cierre.esperadoEfectivo, -40000);   // el traslado cuenta; la reversa pendiente NO
});

test('reversa-turno · aprobar tras el CIERRE → el sello NO se toca, la bóveda SÍ, y alerta turnoSellado', async () => {
    await limpiarPuntero(); await resetBoveda();
    await abrirTurnoCore(db, { opId: 'TSEL', fondoApertura: 0, autor: 'kary' });
    await registrarTrasladoCore(db, { opId: 'SEL-1', tipo: 'cajon_a_boveda', monto: 25000, turnoId: 'TSEL', autor: 'kary' });
    await reversoCore(db, { opId: 'SEL-REV', reversaA: 'SEL-1', autor: 'kary', motivo: 'tarde' });
    await cerrarTurnoCore(db, { turnoId: 'TSEL', conteoPorMedio: { efectivo: 0 }, autor: 'kary' });
    const a = mockAlertas();
    const r = await aprobarEventoCajaCore(db, { opId: 'SEL-REV', aprobadoPor: 'kary', rol: 'owner' }, a);
    assert.equal(r.turnoSellado, true);
    assert.equal((await db.doc('turnos/TSEL').get()).data().cajonABoveda, 25000);   // sello inmutable
    assert.equal((await db.doc('boveda/main').get()).data().saldo, 0);              // bóveda corregida
    assert.ok(a.buf.some((e) => e.evento === 'aprobacion' && e.turnoSellado === true));
});

test('B4 · concepto reembolso_cliente (egreso trazable de un reembolso de turno anterior) entra a la ecuación', async () => {
    await limpiarPuntero(); await resetBoveda();
    await abrirTurnoCore(db, { opId: 'TREM', fondoApertura: 100000, autor: 'kary' });
    const r = await movimientoCajaCore(db, { turnoId: 'TREM', opId: 'REM1', tipo: 'egreso', concepto: 'reembolso_cliente', monto: 50000, autor: 'kary' });
    assert.equal(r.yaExistia, false);
    const cierre = await cerrarTurnoCore(db, { turnoId: 'TREM', conteoPorMedio: { efectivo: 50000 }, autor: 'kary' });
    assert.equal(cierre.esperadoEfectivo, 50000);
    assert.equal(cierre.descuadre, 0);
});
