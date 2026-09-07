/**
 * Integración del REAPER (`liberarReservaCore` / `liberarReservasVencidasCore`) — Wompi F2.
 *   firebase emulators:exec --only firestore --project demo-bersaglio "node --test functions/wompi-reaper.integration.test.mjs"
 *
 * Libera reservas web NO pagadas y vencidas, SIN liberar a ciegas (consejo §11): re-consulta el pago
 * antes de soltar. APPROVED → a_revisar (no pierde venta) · PENDING/consulta-falla → NO libera ·
 * NONE → repone unidad (+1) + estado derivado + ledger + pedido `expirado`. Idempotente (gate por
 * transición de estado). El barrido respeta GRACE y no toca reservas vigentes.
 */
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import pcore from './pedidos-core.js';
const { liberarReservaCore, liberarReservasVencidasCore } = pcore;

initializeApp({ projectId: 'demo-bersaglio' });
const db = getFirestore();

const NOW = 1719600000000;
const OLD = Timestamp.fromMillis(NOW - 20 * 60 * 1000);    // vencida hace 20 min (> GRACE)
const RECENT = Timestamp.fromMillis(NOW - 1 * 60 * 1000);  // vencida hace 1 min (< GRACE 3min)
const FUTURE = Timestamp.fromMillis(NOW + 10 * 60 * 1000); // aún vigente
const vp = v => async () => v;                              // verificarPago mock
const vpThrows = async () => { throw new Error('wompi down'); };

async function seedReserva(id, pieceId, { estado = 'pago_pendiente', reservaExpira = OLD } = {}) {
    await db.doc(`pieces/${pieceId}`).set({ name: id, slug: id, price: 1000000, stockType: 'finito', cantidad: 0, estado: 'agotada', reservaId: id, reservaExpira });
    await db.doc(`pedidos/${id}`).set({ total: 1000000, canal: 'web', medio: 'wompi', estado, consumioStock: true, pieceId, reservaExpira });
}

before(async () => {
    await seedReserva('rLib', 'pzLib');
    await seedReserva('rApr', 'pzApr');
    await seedReserva('rPen', 'pzPen');
    await seedReserva('rFail', 'pzFail');
    await seedReserva('rB1', 'pzB1');
    await seedReserva('rB2', 'pzB2');
    await seedReserva('rBFut', 'pzBFut', { reservaExpira: FUTURE });
    await seedReserva('rBGrace', 'pzBGrace', { reservaExpira: RECENT });
});

test('NONE (no hay pago) → libera: repone unidad +1 + estado derivado + ledger + pedido expirado', async () => {
    const r = await liberarReservaCore(db, 'rLib', { verificarPago: vp('NONE') });
    assert.equal(r.accion, 'liberado');
    const pz = (await db.doc('pieces/pzLib').get()).data();
    assert.equal(pz.cantidad, 1);
    assert.equal(pz.estado, 'disponible');
    assert.equal(pz.reservaId, null);
    assert.equal((await db.doc('pieces/pzLib/movimientos/exp-rLib').get()).data().motivo, 'reserva-expirada');
    assert.equal((await db.doc('pedidos/rLib').get()).data().estado, 'expirado');
});

test('APPROVED (pagó pero sin webhook) → a_revisar, NO libera (no pierde la venta)', async () => {
    const r = await liberarReservaCore(db, 'rApr', { verificarPago: vp('APPROVED') });
    assert.equal(r.accion, 'a_revisar-aprobado');
    assert.equal((await db.doc('pedidos/rApr').get()).data().estado, 'a_revisar');
    assert.equal((await db.doc('pieces/pzApr').get()).data().cantidad, 0);   // NO repuso
});

test('PENDING (sigue procesando en Wompi) → NO libera', async () => {
    const r = await liberarReservaCore(db, 'rPen', { verificarPago: vp('PENDING') });
    assert.match(r.accion, /pendiente|skip/);
    assert.equal((await db.doc('pedidos/rPen').get()).data().estado, 'pago_pendiente');
});

test('consulta a Wompi falla → NO libera (reintenta en el próximo tick)', async () => {
    const r = await liberarReservaCore(db, 'rFail', { verificarPago: vpThrows });
    assert.match(r.accion, /skip|fallo/);
    assert.equal((await db.doc('pedidos/rFail').get()).data().estado, 'pago_pendiente');
});

test('idempotente: liberar 2× → la 2ª no re-repone (gate por estado)', async () => {
    const r2 = await liberarReservaCore(db, 'rLib', { verificarPago: vp('NONE') });
    assert.match(r2.accion, /no-pendiente|ya-resuelto/);
    assert.equal((await db.doc('pieces/pzLib').get()).data().cantidad, 1);   // sigue en 1, no 2
});

test('barrido: libera SOLO vencidas+GRACE; respeta vigentes y dentro de GRACE', async () => {
    const out = await liberarReservasVencidasCore(db, { nowMs: NOW, verificarPago: vp('NONE') });
    assert.ok(out.revisados >= 2);                                   // rB1, rB2 (al menos)
    const ids = out.resultados.map(r => r.pedidoId);
    assert.ok(ids.includes('rB1') && ids.includes('rB2'));
    assert.ok(!ids.includes('rBFut'), 'no debe tocar reservas vigentes');
    assert.ok(!ids.includes('rBGrace'), 'no debe tocar dentro de GRACE');
    assert.equal((await db.doc('pedidos/rB1').get()).data().estado, 'expirado');
    assert.equal((await db.doc('pedidos/rBFut').get()).data().estado, 'pago_pendiente');
    assert.equal((await db.doc('pedidos/rBGrace').get()).data().estado, 'pago_pendiente');
});
