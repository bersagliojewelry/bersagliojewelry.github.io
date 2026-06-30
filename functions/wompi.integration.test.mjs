/**
 * Integración de `iniciarPagoWebCore` (Wompi F2 · reserva web) contra el emulador Firestore.
 *   firebase emulators:exec --only firestore --project demo-bersaglio "node --test functions/wompi.integration.test.mjs"
 *
 * Verifica el corazón del cobro web: reserva atómica de la pieza (decrementa + ledger), pedido
 * `pago_pendiente` (canal:web/medio:wompi) con `reservaExpira` (verdad de la reserva = el PEDIDO),
 * total + firma server-side, tope $2.5M, elegibilidad (pública, precio fijo, stock), idempotencia.
 * Escribe vía firebase-admin (= la CF, bypassa reglas).
 */
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import pcore from './pedidos-core.js';
import wcore from './wompi-core.js';
const { iniciarPagoWebCore } = pcore;
const { firmaIntegridad } = wcore;

initializeApp({ projectId: 'demo-bersaglio' });
const db = getFirestore();

const SECRET = 'test_integrity_xyz';
const NOW = 1719600000000;
const TTL = 15 * 60 * 1000;
const OPTS = { integritySecret: SECRET, ttlMs: TTL, nowMs: NOW };

before(async () => {
    await db.doc('contadores/pedidos').delete().catch(() => {});
    await db.doc('pieces/pw1').set({ name: 'Anillo Web', slug: 'anillo-web', price: 2150000, stockType: 'finito', cantidad: 1, visibilidad: 'publica' });
    await db.doc('pieces/pwLote').set({ name: 'Lote Web', slug: 'lote-web', price: 500000, stockType: 'finito', cantidad: 2, visibilidad: 'publica' });
    await db.doc('pieces/pwSinPrecio').set({ name: 'Sin precio', slug: 'sin-precio', stockType: 'finito', cantidad: 1, visibilidad: 'publica' });
    await db.doc('pieces/pwCara').set({ name: 'Cara', slug: 'cara', price: 3000000, stockType: 'finito', cantidad: 1, visibilidad: 'publica' });
    await db.doc('pieces/pwPriv').set({ name: 'Privada', slug: 'priv', price: 1000000, stockType: 'finito', cantidad: 1, visibilidad: 'privada' });
    await db.doc('pieces/pwEnc').set({ name: 'Encargo', slug: 'enc-web', price: 800000, stockType: 'encargo', visibilidad: 'publica' });
    await db.doc('pieces/pwAgot').set({ name: 'Agotada', slug: 'agot', price: 900000, stockType: 'finito', cantidad: 0, visibilidad: 'publica' });
    await db.doc('pieces/pwHab').set({ name: 'Consentimiento', slug: 'hab', price: 700000, stockType: 'finito', cantidad: 1, visibilidad: 'publica' });
});

const HABEAS = { aceptado: true, version: '2026-06-30' };   // consentimiento (Habeas Data) — obligatorio al crear

test('reserva web OK: pedido pago_pendiente + reserva atómica + firma server-side', async () => {
    const r = await iniciarPagoWebCore(db, { pedidoId: 'wp1', pieceId: 'pw1', shipping: { firstName: 'Ana', email: 'a@x.co', address: 'Calle 1' }, habeas: HABEAS }, OPTS);
    assert.equal(r.estado, 'pago_pendiente');
    assert.equal(r.total, 2150000);
    assert.equal(r.reference, 'wp1');
    assert.equal(r.amountInCents, 215000000);
    assert.equal(r.currency, 'COP');
    assert.equal(r.yaExistia, false);
    assert.equal(r.signature, firmaIntegridad({ reference: 'wp1', amountInCents: 215000000, currency: 'COP', integritySecret: SECRET }));

    const ped = (await db.doc('pedidos/wp1').get()).data();
    assert.equal(ped.estado, 'pago_pendiente');
    assert.equal(ped.canal, 'web');
    assert.equal(ped.medio, 'wompi');
    assert.equal(ped.total, 2150000);
    assert.equal(ped.consumioStock, true);
    assert.equal(ped.numero, 1);
    assert.equal(ped.reservaExpira.toMillis(), NOW + TTL);   // verdad de la reserva en el PEDIDO
    assert.equal(ped.shipping.firstName, 'Ana');
    assert.equal(ped.autor, null);                            // cliente sin login
    assert.equal(ped.habeasData.aceptado, true);              // prueba del consentimiento (Dto.1377 art.5)
    assert.equal(ped.habeasData.version, '2026-06-30');

    const pz = (await db.doc('pieces/pw1').get()).data();
    assert.equal(pz.cantidad, 0);
    assert.equal(pz.estado, 'agotada');
    assert.equal(pz.reservaId, 'wp1');
    assert.equal((await db.doc('pieces/pw1/movimientos/wp1').get()).data().motivo, 'reserva-web');
});

test('reserva web idempotente: mismo pedidoId no duplica ni re-decrementa', async () => {
    const r = await iniciarPagoWebCore(db, { pedidoId: 'wp1', pieceId: 'pw1' }, OPTS);
    assert.equal(r.yaExistia, true);
    assert.equal(r.total, 2150000);
    assert.equal(r.signature, firmaIntegridad({ reference: 'wp1', amountInCents: 215000000, currency: 'COP', integritySecret: SECRET }));
    assert.equal((await db.doc('pieces/pw1').get()).data().cantidad, 0);   // no bajó a -1
});

test('reserva web sobre LOTE: decrementa a 1, sigue disponible', async () => {
    const r = await iniciarPagoWebCore(db, { pedidoId: 'wpL1', pieceId: 'pwLote', habeas: HABEAS }, OPTS);
    assert.equal(r.estado, 'pago_pendiente');
    const pz = (await db.doc('pieces/pwLote').get()).data();
    assert.equal(pz.cantidad, 1);
    assert.equal(pz.estado, 'disponible');   // lote con stock restante
});

test('rechaza pieza agotada', async () => {
    await assert.rejects(iniciarPagoWebCore(db, { pedidoId: 'wpA', pieceId: 'pwAgot' }, OPTS), /agotada/i);
});

test('rechaza pieza sin precio (bajo consulta → asesor)', async () => {
    await assert.rejects(iniciarPagoWebCore(db, { pedidoId: 'wpSP', pieceId: 'pwSinPrecio' }, OPTS), /asesor/i);
});

test('rechaza pieza sobre el tope $2.5M (→ asesor)', async () => {
    await assert.rejects(iniciarPagoWebCore(db, { pedidoId: 'wpC', pieceId: 'pwCara' }, OPTS), /asesor|2\.500\.000/i);
});

test('rechaza pieza privada (no disponible en línea)', async () => {
    await assert.rejects(iniciarPagoWebCore(db, { pedidoId: 'wpP', pieceId: 'pwPriv' }, OPTS), /línea|disponible/i);
    assert.equal((await db.doc('pieces/pwPriv').get()).data().cantidad, 1);   // no la tocó
});

test('rechaza pieza por encargo (no es compra inmediata)', async () => {
    await assert.rejects(iniciarPagoWebCore(db, { pedidoId: 'wpE', pieceId: 'pwEnc' }, OPTS), /asesor|inmediata/i);
});

test('rechaza sin consentimiento Habeas Data (no crea pedido ni decrementa)', async () => {
    await assert.rejects(iniciarPagoWebCore(db, { pedidoId: 'wpHab', pieceId: 'pwHab' }, OPTS), /Habeas|autoriza|tratamiento/i);
    assert.equal((await db.doc('pieces/pwHab').get()).data().cantidad, 1);   // no la tocó (la tx abortó)
    assert.equal((await db.doc('pedidos/wpHab').get()).exists, false);       // no creó el pedido
});

test('rechaza sin secreto de integridad', async () => {
    await assert.rejects(iniciarPagoWebCore(db, { pedidoId: 'wpNS', pieceId: 'pwLote' }, { ttlMs: TTL, nowMs: NOW }), /secreto|integridad/i);
});

test('rechaza pedidoId/pieceId vacíos', async () => {
    await assert.rejects(iniciarPagoWebCore(db, { pieceId: 'pw1' }, OPTS), /obligatorio/i);
});
