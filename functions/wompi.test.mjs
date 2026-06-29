/**
 * Test PURO de la cripto Wompi (sin emulador, L-17). Corre: node --test functions/wompi.test.mjs
 * Fija el CONTRATO de las firmas (orden de concatenación = el bug-prone que cazó el comité/consejo).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import core from './wompi-core.js';
const { montoEnCentavos, firmaIntegridad, resolverRuta, verificarFirmaEvento } = core;

const sha = s => crypto.createHash('sha256').update(s, 'utf8').digest('hex');

test('montoEnCentavos: COP × 100 entero (sin decimales)', () => {
    assert.equal(montoEnCentavos(2150000), 215000000);
    assert.equal(montoEnCentavos(0), 0);
    assert.equal(montoEnCentavos(1000.4), 100000);   // redondea el COP (sin decimales) ANTES de ×100
});

test('firmaIntegridad: SHA256(reference+amount+currency+secret) hex, orden EXACTO', () => {
    const sig = firmaIntegridad({ reference: 'ped-1', amountInCents: 215000000, currency: 'COP', integritySecret: 'test_integrity_xyz' });
    // El contrato es el ORDEN literal documentado (sin separadores, secreto al final):
    assert.equal(sig, sha('ped-1' + '215000000' + 'COP' + 'test_integrity_xyz'));
    assert.match(sig, /^[a-f0-9]{64}$/);
});

test('firmaIntegridad: incluir expiration_time cambia la firma (y va ANTES del secreto)', () => {
    const sin = firmaIntegridad({ reference: 'r', amountInCents: 100, integritySecret: 's' });
    const con = firmaIntegridad({ reference: 'r', amountInCents: 100, expirationTime: '2026-06-28T20:00:00.000Z', integritySecret: 's' });
    assert.notEqual(sin, con);
    assert.equal(con, sha('r' + '100' + 'COP' + '2026-06-28T20:00:00.000Z' + 's'));
});

test('firmaIntegridad: cambiar el monto cambia la firma (anti-manipulación)', () => {
    const a = firmaIntegridad({ reference: 'r', amountInCents: 100, integritySecret: 's' });
    const b = firmaIntegridad({ reference: 'r', amountInCents: 200, integritySecret: 's' });
    assert.notEqual(a, b);
});

test('firmaIntegridad: rechaza datos inválidos (monto 0 / sin secreto)', () => {
    assert.throws(() => firmaIntegridad({ reference: 'r', amountInCents: 0, integritySecret: 's' }));
    assert.throws(() => firmaIntegridad({ reference: 'r', amountInCents: 100, integritySecret: '' }));
});

test('resolverRuta: dot-notation sobre objeto anidado', () => {
    const data = { transaction: { id: 'tx_1', amount_in_cents: 215000000, status: 'APPROVED' } };
    assert.equal(resolverRuta(data, 'transaction.id'), 'tx_1');
    assert.equal(resolverRuta(data, 'transaction.amount_in_cents'), 215000000);
    assert.equal(resolverRuta(data, 'transaction.no_existe'), undefined);
});

// ── Firma del EVENTO del webhook ──────────────────────────────────────────────
const SECRET = 'test_events_secret_abc';
function eventoConChecksum({ id = 'tx_1', status = 'APPROVED', amount = 215000000, ts = 1719600000 } = {}) {
    const data = { transaction: { id, status, amount_in_cents: amount } };
    const props = ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'];
    const checksum = sha(`${id}${status}${amount}${ts}${SECRET}`);   // valores EN ORDEN + ts + secreto
    return { event: 'transaction.updated', data, signature: { properties: props, checksum }, timestamp: ts };
}

test('verificarFirmaEvento: checksum correcto → true', () => {
    assert.equal(verificarFirmaEvento(eventoConChecksum(), SECRET), true);
});

test('verificarFirmaEvento: secreto equivocado → false', () => {
    assert.equal(verificarFirmaEvento(eventoConChecksum(), 'otro_secreto'), false);
});

test('verificarFirmaEvento: monto manipulado en data (checksum viejo) → false (anti-forja)', () => {
    const ev = eventoConChecksum({ amount: 215000000 });
    ev.data.transaction.amount_in_cents = 100;   // atacante cambia el monto pero no puede re-firmar
    assert.equal(verificarFirmaEvento(ev, SECRET), false);
});

test('verificarFirmaEvento: property declarada pero ausente en data → false', () => {
    const ev = eventoConChecksum();
    delete ev.data.transaction.status;
    assert.equal(verificarFirmaEvento(ev, SECRET), false);
});

test('verificarFirmaEvento: sin checksum/properties/timestamp → false (no revienta)', () => {
    assert.equal(verificarFirmaEvento({}, SECRET), false);
    assert.equal(verificarFirmaEvento({ signature: { properties: [], checksum: 'x' }, timestamp: 1 }, SECRET), false);
});
