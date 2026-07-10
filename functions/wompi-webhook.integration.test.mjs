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
    // A.3: el no-APPROVED se audita en la llave COMPUESTA, NUNCA en `webhookEvents/{txId}` (que bloquearía
    // el APPROVED posterior del mismo txId como replay).
    assert.equal((await db.doc('webhookEvents/tx_decl-DECLINED').get()).data().accion, 'auditado-no-aprobado');
    assert.equal((await db.doc('webhookEvents/tx_decl').get()).exists, false);
});

test('A.3: PENDING y luego APPROVED del MISMO txId (PSE/Nequi) → el APPROVED procesa, no cae en replay', async () => {
    await db.doc('pedidos/wpAsync').set({ total: 2150000, canal: 'web', medio: 'wompi', consumioStock: true, estado: 'pago_pendiente' });
    // 1º: la re-consulta dice PENDING (asíncrono) → audita en llave compuesta, NO transiciona, NO bloquea txId.
    const evP = signedEvent({ txId: 'tx_async', reference: 'wpAsync', status: 'PENDING' });
    const rP = await confirmarPagoWompiCore(db, evP, { eventsSecret: EVENTS_SECRET, fetchTransaction: fetcher({ reference: 'wpAsync', status: 'PENDING' }) });
    assert.match(rP.reason, /no-aprobado/);
    assert.equal((await db.doc('pedidos/wpAsync').get()).data().estado, 'pago_pendiente');
    assert.equal((await db.doc('webhookEvents/tx_async').get()).exists, false);       // llave txId libre
    // 2º: la MISMA transacción pasa a APPROVED → DEBE procesar (antes caía en replay y el pedido colgaba).
    const evA = signedEvent({ txId: 'tx_async', reference: 'wpAsync', status: 'APPROVED' });
    const rA = await confirmarPagoWompiCore(db, evA, { eventsSecret: EVENTS_SECRET, fetchTransaction: fetcher({ reference: 'wpAsync', status: 'APPROVED' }) });
    assert.equal(rA.reason, 'pagado');
    assert.equal((await db.doc('pedidos/wpAsync').get()).data().estado, 'pagado');
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

// ─── Auditoría 2026-07-10 · reversas (VOIDED/REFUNDED) y doble cobro ──────────────────────────
// P0 real: la reversa llegaba con el MISMO txId del APPROVED → el replay-guard se la tragaba y
// Kary despachaba mercancía cuyo dinero ya se devolvió. P0-2: un 2º APPROVED (otra tx, misma
// referencia) cobraba al cliente 2× en silencio.

test('REVERSA · VOIDED tras APPROVED (mismo txId) → frena el despacho (a_revisar) + alerta saludEventos', async () => {
    await db.doc('pedidos/wpVoid').set({ total: 2150000, canal: 'web', medio: 'wompi', consumioStock: true, estado: 'pago_pendiente' });
    const opts = ov => ({ eventsSecret: EVENTS_SECRET, fetchTransaction: fetcher({ reference: 'wpVoid', ...ov }) });
    // 1) APPROVED normal → pagado.
    await confirmarPagoWompiCore(db, signedEvent({ txId: 'tx_void', reference: 'wpVoid' }), opts());
    assert.equal((await db.doc('pedidos/wpVoid').get()).data().estado, 'pagado');
    // 2) Kary/Wompi reversa la transacción → evento del MISMO txId con status VOIDED.
    const r = await confirmarPagoWompiCore(db, signedEvent({ txId: 'tx_void', reference: 'wpVoid', status: 'VOIDED' }), opts({ status: 'VOIDED' }));
    assert.equal(r.reason, 'reversa:VOIDED');
    const ped = (await db.doc('pedidos/wpVoid').get()).data();
    assert.equal(ped.estado, 'a_revisar');                                     // despacho FRENADO
    assert.match(ped.revisarMotivo, /VOIDED/);
    const alerta = await db.doc('saludEventos/wompi-reversa-tx_void').get();
    assert.equal(alerta.exists, true);                                          // el panel se entera
    assert.equal((await db.doc('webhookEvents/tx_void-VOIDED').get()).exists, true);   // audit trail compuesto
});

test('REVERSA · VOIDED sobre pedido YA ENTREGADO → NO regresa el estado, pero alerta (mercancía afuera)', async () => {
    await db.doc('pedidos/wpVoidEnt').set({ total: 2150000, canal: 'web', medio: 'wompi', estado: 'entregado', wompiTxId: 'tx_voident' });
    await db.doc('webhookEvents/tx_voident').set({ txId: 'tx_voident', reference: 'wpVoidEnt', status: 'APPROVED' });
    const r = await confirmarPagoWompiCore(db, signedEvent({ txId: 'tx_voident', reference: 'wpVoidEnt', status: 'REFUNDED' }),
        { eventsSecret: EVENTS_SECRET, fetchTransaction: fetcher({ reference: 'wpVoidEnt', status: 'REFUNDED' }) });
    assert.equal(r.reason, 'reversa:REFUNDED');
    assert.equal((await db.doc('pedidos/wpVoidEnt').get()).data().estado, 'entregado');   // el estado NO se pisa
    const alerta = (await db.doc('saludEventos/wompi-reversa-tx_voident').get()).data();
    assert.match(alerta.detalle, /YA se entregó/);
});

test('REVERSA · replay EXACTO del mismo status sigue siendo replay (no rompe la idempotencia)', async () => {
    const opts = { eventsSecret: EVENTS_SECRET, fetchTransaction: fetcher({ reference: 'wpVoid', status: 'VOIDED' }) };
    const r = await confirmarPagoWompiCore(db, signedEvent({ txId: 'tx_void', reference: 'wpVoid', status: 'VOIDED' }), opts);
    // el 2º VOIDED del mismo txId: el compuesto {txId}-VOIDED ya existe pero la llave base guarda APPROVED →
    // status distinto → re-emite la reversa idempotente (merge sobre los mismos docs). No debe crashear.
    assert.ok(['reversa:VOIDED', 'replay', 'status-cambiado:VOIDED'].includes(r.reason));   // ya frenado (a_revisar) → solo re-audita
});

test('DOBLE COBRO · 2º APPROVED con OTRO txId sobre pedido pagado → alerta de reembolso (antes: invisible)', async () => {
    await db.doc('pedidos/wpDoble').set({ total: 2150000, canal: 'web', medio: 'wompi', estado: 'pagado', wompiTxId: 'tx_orig' });
    const r = await confirmarPagoWompiCore(db, signedEvent({ txId: 'tx_dup2', reference: 'wpDoble' }),
        { eventsSecret: EVENTS_SECRET, fetchTransaction: fetcher({ reference: 'wpDoble' }) });
    assert.equal(r.reason, 'doble-cobro');
    const ped = (await db.doc('pedidos/wpDoble').get()).data();
    assert.equal(ped.estado, 'pagado');                    // el pedido NO se toca
    assert.equal(ped.wompiTxId, 'tx_orig');                // la tx original manda
    const alerta = (await db.doc('saludEventos/wompi-doble-cobro-tx_dup2').get()).data();
    assert.match(alerta.detalle, /DOBLE COBRO/);
});

test('APPROVED tardío con otro txId sobre pedido ENTREGADO → ya-pagado/doble-cobro, JAMÁS pagado_sin_stock (regresión)', async () => {
    await db.doc('pedidos/wpEntTardio').set({ total: 2150000, canal: 'web', medio: 'wompi', estado: 'entregado', wompiTxId: 'tx_ent1' });
    const r = await confirmarPagoWompiCore(db, signedEvent({ txId: 'tx_ent2', reference: 'wpEntTardio' }),
        { eventsSecret: EVENTS_SECRET, fetchTransaction: fetcher({ reference: 'wpEntTardio' }) });
    assert.equal(r.reason, 'doble-cobro');
    assert.equal((await db.doc('pedidos/wpEntTardio').get()).data().estado, 'entregado');   // NO regresa a pagado_sin_stock
});

test('COBRO SIN PEDIDO · APPROVED con referencia inexistente → alerta saludEventos (antes: solo audit invisible)', async () => {
    const r = await confirmarPagoWompiCore(db, signedEvent({ txId: 'tx_huerfano', reference: 'no-existe-999' }),
        { eventsSecret: EVENTS_SECRET, fetchTransaction: fetcher({ reference: 'no-existe-999' }) });
    assert.equal(r.reason, 'pedido-inexistente');
    assert.equal((await db.doc('saludEventos/wompi-sin-pedido-tx_huerfano').get()).exists, true);
});

test('MONEDA AUSENTE en la re-consulta → a_revisar (defensa en profundidad, ya no se salta el chequeo)', async () => {
    await db.doc('pedidos/wpSinMoneda').set({ total: 2150000, canal: 'web', medio: 'wompi', estado: 'pago_pendiente' });
    const r = await confirmarPagoWompiCore(db, signedEvent({ txId: 'tx_sinmoneda', reference: 'wpSinMoneda' }),
        { eventsSecret: EVENTS_SECRET, fetchTransaction: fetcher({ reference: 'wpSinMoneda', currency: undefined }) });
    assert.equal(r.reason, 'monto-no-coincide');
    assert.equal((await db.doc('pedidos/wpSinMoneda').get()).data().estado, 'a_revisar');
});
