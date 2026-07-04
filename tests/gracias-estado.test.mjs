/**
 * §164 (gate A.9): gracias.html habla CLARO según el estado real de la transacción Wompi.
 * PURA — mensajePorEstadoTx(status, numero). El neutro "confirmando" solo para PENDING/desconocido.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mensajePorEstadoTx } from '../js/pages/gracias.js';

test('APPROVED → confirmado + número de pedido como comprobante + CTA WhatsApp', () => {
    const m = mensajePorEstadoTx('APPROVED', 6);
    assert.equal(m.tone, 'ok');
    assert.match(m.eyebrow, /CONFIRMADO/);
    assert.match(m.body, /pedido #6/);
    assert.match(m.nextLabel, /#6/);
    assert.match(m.wa, /pedido #6/);
    assert.ok(!m.retry);
});

test('APPROVED sin número (stash perdido) → confirma sin inventar comprobante', () => {
    const m = mensajePorEstadoTx('APPROVED', undefined);
    assert.equal(m.tone, 'ok');
    assert.ok(!/#/.test(m.nextLabel));
});

test('DECLINED/ERROR/VOIDED → honesto: nada debitado + pieza apartada + reintentar', () => {
    for (const s of ['DECLINED', 'ERROR', 'VOIDED']) {
        const m = mensajePorEstadoTx(s, 6);
        assert.equal(m.tone, 'warn', s);
        assert.match(m.body, /no se debitó/i);
        assert.match(m.body, /apartada/i);
        assert.equal(m.retry, true, s);
    }
});

test('PENDING / desconocido / null → null (se mantiene el neutro "confirmando")', () => {
    assert.equal(mensajePorEstadoTx('PENDING', 6), null);
    assert.equal(mensajePorEstadoTx(undefined, 6), null);
    assert.equal(mensajePorEstadoTx(null, null), null);
});
