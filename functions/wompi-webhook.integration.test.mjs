/**
 * Integración del WEBHOOK `confirmarPagoWompiCore` (Wompi F2) contra el emulador Firestore.
 *   firebase emulators:exec --only firestore --project demo-bersaglio "node --test functions/wompi-webhook.integration.test.mjs"
 *
 * Lo crítico anti-fraude (consejo §11 / comité §9): firma del evento → re-consulta API (VERDAD) →
 * valida monto/referencia vs el pedido CONGELADO → SOLO APPROVED transiciona pago_pendiente→pagado;
 * DECLINED NO cancela (el cliente reintenta); idempotencia por transactionId; APPROVED tardío sobre
 * reserva ya liberada → pagado_sin_stock (NUNCA revende). El webhook JAMÁS toca stock.
 */
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import pcore from './pedidos-core.js';
const { confirmarPagoWompiCore } = pcore;

initializeApp({ projectId: 'demo-bersaglio' });
const db = getFirestore();

const EVENTS_SECRET = 'test_events_secret_abc';
const sha = s => crypto.createHash('sha256').update(s, 'utf8').digest('hex');

// Construye un evento de Wompi FIRMADO (checksum válido sobre los valores de las properties).
function signedEvent({ txId, reference, status = 'APPROVED', amount = 215000000, currency = 'COP', ts = 1719600000 }) {
    const data = { transaction: { id: txId, reference, status, amount_in_cents: amount, currency } };
    const properties = ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'];
    const checksum = sha(`${txId}${status}${amount}${ts}${EVENTS_SECRET}`);
    return { event: 'transaction.updated', data, signature: { properties, checksum }, timestamp: ts };
}
// fetchTransaction mock: por defecto devuelve lo que diga `over`, o un APPROVED coherente.
const fetcher = (over = {}) => async (id) => ({ id, status: 'APPROVED', amount_in_cents: 215000000, currency: 'COP', reference: over.reference, ...over });

before(async () => {
    const base = { total: 2150000, canal: 'web', medio: 'wompi', consumioStock: true };
    await db.doc('pedidos/wpPay').set({ ...base, estado: 'pago_pendiente' });
    await db.doc('pedidos/wpReplay').set({ ...base, estado: 'pago_pendiente' });
    await db.doc('pedidos/wpMonto').set({ ...base, estado: 'pago_pendiente' });
    await db.doc('pedidos/wpDeclined').set({ ...base, estado: 'pago_pendiente' });
    await db.doc('pedidos/wpYaPagado').set({ ...base, estado: 'pagado' });
    await db.doc('pedidos/wpExpirado').set({ ...base, estado: 'expirado' });
    await db.doc('pedidos/wpReQuery').set({ ...base, estado: 'pago_pendiente' });
    await db.doc('pedidos/wpFirma').set({ ...base, estado: 'pago_pendiente' });
});

test('APPROVED válido sobre pago_pendiente → pagado + evento registrado', async () => {
    const ev = signedEvent({ txId: 'tx_pay', reference: 'wpPay' });
    const r = await confirmarPagoWompiCore(db, ev, { eventsSecret: EVENTS_SECRET, fetchTransaction: fetcher({ reference: 'wpPay' }) });
    assert.equal(r.ok, true);
    assert.equal(r.reason, 'pagado');
    const ped = (await db.doc('pedidos/wpPay').get()).data();
    assert.equal(ped.estado, 'pagado');
    assert.equal(ped.wompiTxId, 'tx_pay');
    assert.equal(ped.confirmadoPor, 'wompi-webhook');
    assert.equal((await db.doc('webhookEvents/tx_pay').get()).data().accion, 'pagado');
});

test('firma inválida → rechazo 401, pedido intacto', async () => {
    const ev = signedEvent({ txId: 'tx_firma', reference: 'wpFirma' });
    ev.signature.checksum = 'firma_falsa';
    const r = await confirmarPagoWompiCore(db, ev, { eventsSecret: EVENTS_SECRET, fetchTransaction: fetcher({ reference: 'wpFirma' }) });
    assert.equal(r.ok, false);
    assert.equal(r.status, 401);
    assert.equal((await db.doc('pedidos/wpFirma').get()).data().estado, 'pago_pendiente');   // intacto
});

test('idempotente: mismo transactionId 2× → 2ª vez replay, no re-procesa', async () => {
    const ev = signedEvent({ txId: 'tx_replay', reference: 'wpReplay' });
    const opts = { eventsSecret: EVENTS_SECRET, fetchTransaction: fetcher({ reference: 'wpReplay' }) };
    const r1 = await confirmarPagoWompiCore(db, ev, opts);
    const r2 = await confirmarPagoWompiCore(db, ev, opts);
    assert.equal(r1.reason, 'pagado');
    assert.equal(r2.yaProcesado, true);
    assert.equal((await db.doc('pedidos/wpReplay').get()).data().estado, 'pagado');
});

test('monto re-consultado ≠ total congelado → a_revisar, NO paga (anti-fraude)', async () => {
    const ev = signedEvent({ txId: 'tx_monto', reference: 'wpMonto' });
    // El evento dice 215000000 pero la re-consulta a Wompi dice 100 → no se paga.
    const r = await confirmarPagoWompiCore(db, ev, { eventsSecret: EVENTS_SECRET, fetchTransaction: fetcher({ reference: 'wpMonto', amount_in_cents: 100 }) });
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'monto-no-coincide');
    assert.equal((await db.doc('pedidos/wpMonto').get()).data().estado, 'a_revisar');
});

test('DECLINED → NO cancela el pedido (el cliente puede reintentar); audita', async () => {
    const ev = signedEvent({ txId: 'tx_decl', reference: 'wpDeclined', status: 'DECLINED' });
    const r = await confirmarPagoWompiCore(db, ev, { eventsSecret: EVENTS_SECRET, fetchTransaction: fetcher({ reference: 'wpDeclined', status: 'DECLINED' }) });
    assert.equal(r.ok, true);
    assert.match(r.reason, /no-aprobado/);
    assert.equal((await db.doc('pedidos/wpDeclined').get()).data().estado, 'pago_pendiente');   // sigue vivo
    assert.equal((await db.doc('webhookEvents/tx_decl').get()).data().accion, 'auditado-no-aprobado');
});

test('APPROVED sobre pedido ya pagado → idempotente (no rompe)', async () => {
    const ev = signedEvent({ txId: 'tx_ya', reference: 'wpYaPagado' });
    const r = await confirmarPagoWompiCore(db, ev, { eventsSecret: EVENTS_SECRET, fetchTransaction: fetcher({ reference: 'wpYaPagado' }) });
    assert.equal(r.ok, true);
    assert.equal(r.reason, 'ya-pagado');
});

test('APPROVED tardío sobre reserva liberada (expirado) → pagado_sin_stock (no revende)', async () => {
    const ev = signedEvent({ txId: 'tx_exp', reference: 'wpExpirado' });
    const r = await confirmarPagoWompiCore(db, ev, { eventsSecret: EVENTS_SECRET, fetchTransaction: fetcher({ reference: 'wpExpirado' }) });
    assert.equal(r.reason, 'pagado-sin-stock');
    assert.equal((await db.doc('pedidos/wpExpirado').get()).data().estado, 'pagado_sin_stock');
});

test('re-consulta es la VERDAD: evento dice APPROVED pero Wompi dice DECLINED → no paga', async () => {
    const ev = signedEvent({ txId: 'tx_rq', reference: 'wpReQuery', status: 'APPROVED' });
    const r = await confirmarPagoWompiCore(db, ev, { eventsSecret: EVENTS_SECRET, fetchTransaction: fetcher({ reference: 'wpReQuery', status: 'DECLINED' }) });
    assert.match(r.reason, /no-aprobado/);
    assert.equal((await db.doc('pedidos/wpReQuery').get()).data().estado, 'pago_pendiente');
});
