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
const EXP = new Date(NOW + TTL).toISOString();   // A.4: expiration_time firmado y enviado al Widget
const firmaCon = (reference, amountInCents) => firmaIntegridad({ reference, amountInCents, currency: 'COP', expirationTime: EXP, integritySecret: SECRET });

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
    assert.equal(r.expirationTime, EXP);                                   // A.4: viaja al Widget
    assert.equal(r.signature, firmaCon('wp1', 215000000));                 // firmada CON expirationTime

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

test('reserva web idempotente: mismo pedidoId (pago_pendiente) no duplica ni re-decrementa', async () => {
    const r = await iniciarPagoWebCore(db, { pedidoId: 'wp1', pieceId: 'pw1' }, OPTS);
    assert.equal(r.yaExistia, true);
    assert.equal(r.total, 2150000);
    assert.equal(r.expirationTime, EXP);                                   // A.2: mismo reservaExpira → mismo expiration
    assert.equal(r.signature, firmaCon('wp1', 215000000));                 // A.2: firma cobrable estable en el reintento
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

// ── Bloque A del plan Fable (piezas DEDICADAS para no contaminar el estado de los tests de arriba) ──
test('A.2: reintento sobre un pedido NO vigente (expirado) → reserva-no-vigente (no firma cobrable)', async () => {
    await db.doc('pieces/pwA2').set({ name: 'A2', slug: 'a2', price: 500000, stockType: 'finito', cantidad: 1, visibilidad: 'publica' });
    // Pedido ya liberado: existe pero su estado ya no es pago_pendiente → NO debe devolver firma cobrable.
    await db.doc('pedidos/wpExp').set({ numero: 99, total: 500000, estado: 'expirado', reservaExpira: null });
    await assert.rejects(
        iniciarPagoWebCore(db, { pedidoId: 'wpExp', pieceId: 'pwA2', habeas: HABEAS }, OPTS),
        /reserva-no-vigente/,
    );
    assert.equal((await db.doc('pieces/pwA2').get()).data().cantidad, 1);   // no tocó la pieza
});

test('A.7: pieza legacy SIN campo cantidad → decrementa a 0 (no -1) y queda agotada', async () => {
    await db.doc('pieces/pwLegacy').set({ name: 'Legacy', slug: 'legacy', price: 600000, stockType: 'finito', visibilidad: 'publica' });   // sin `cantidad`
    const r = await iniciarPagoWebCore(db, { pedidoId: 'wpLeg', pieceId: 'pwLegacy', habeas: HABEAS }, OPTS);
    assert.equal(r.estado, 'pago_pendiente');
    const pz = (await db.doc('pieces/pwLegacy').get()).data();
    assert.equal(pz.cantidad, 0);          // ABSOLUTO, no -1 (A.7)
    assert.equal(pz.estado, 'agotada');
});

test('A.8: persiste docType/docNumber/countryIso2 (normalizado) + tipoEntrega', async () => {
    await db.doc('pieces/pwA8').set({ name: 'A8', slug: 'a8', price: 700000, stockType: 'finito', cantidad: 1, visibilidad: 'publica' });
    const shipping = { firstName: 'Ana', email: 'a@x.co', address: 'Calle 1', city: 'Cartagena', docType: 'cc', docNumber: '123', countryIso2: 'co', phone: '3001234567' };
    await iniciarPagoWebCore(db, { pedidoId: 'wpDatos', pieceId: 'pwA8', shipping, tipoEntrega: 'tienda', habeas: HABEAS }, OPTS);
    const ped = (await db.doc('pedidos/wpDatos').get()).data();
    assert.equal(ped.shipping.docType, 'CC');           // normalizado a mayúscula
    assert.equal(ped.shipping.docNumber, '123');
    assert.equal(ped.shipping.countryIso2, 'CO');
    assert.equal(ped.tipoEntrega, 'tienda');
});

test('A.8: tipoEntrega inválido → null (no rompe)', async () => {
    await db.doc('pieces/pwA8b').set({ name: 'A8b', slug: 'a8b', price: 700000, stockType: 'finito', cantidad: 1, visibilidad: 'publica' });
    await iniciarPagoWebCore(db, { pedidoId: 'wpTE', pieceId: 'pwA8b', tipoEntrega: 'hackeo', habeas: HABEAS }, OPTS);
    assert.equal((await db.doc('pedidos/wpTE').get()).data().tipoEntrega, null);
});
