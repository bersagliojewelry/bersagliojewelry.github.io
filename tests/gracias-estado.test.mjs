/**
 * §164 (gate A.9): gracias.html habla CLARO según el estado real de la transacción Wompi.
 * PURA — mensajePorEstadoTx(status, codigo). El neutro "confirmando" solo para PENDING/desconocido.
 * §166: el comprobante del invitado es el CÓDIGO público (BJ-XXXX-XXXX) — el correlativo #N es
 * interno y NUNCA debe aparecer en la página (revela volumen de ventas).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mensajePorEstadoTx } from '../js/pages/gracias.js';

test('APPROVED → confirmado + CÓDIGO de pedido como comprobante + CTA WhatsApp', () => {
    const m = mensajePorEstadoTx('APPROVED', 'BJ-7K4M-Q2X9');
    assert.equal(m.tone, 'ok');
    assert.match(m.eyebrow, /CONFIRMADO/);
    assert.match(m.body, /pedido BJ-7K4M-Q2X9/);
    assert.match(m.nextLabel, /BJ-7K4M-Q2X9/);
    assert.match(m.wa, /pedido BJ-7K4M-Q2X9/);
    assert.ok(!m.retry);
});

test('APPROVED sin código (stash perdido/viejo) → confirma sin inventar comprobante', () => {
    for (const sinCodigo of [undefined, null, '', 6]) {   // 6 = stash legacy con numero → NO mostrarlo
        const m = mensajePorEstadoTx('APPROVED', sinCodigo);
        assert.equal(m.tone, 'ok');
        assert.ok(!/#/.test(m.nextLabel), 'jamás el correlativo interno');
        assert.ok(!/comprobante:/.test(m.nextLabel));
    }
});

test('el correlativo interno (#N) no aparece en NINGÚN mensaje (§166 anti-fuga)', () => {
    for (const s of ['APPROVED', 'DECLINED']) {
        const m = mensajePorEstadoTx(s, 'BJ-AAAA-BBBB');
        for (const campo of [m.body, m.nextLabel, m.wa || '']) assert.ok(!/#\d/.test(campo), `${s}: ${campo}`);
    }
});

test('DECLINED/ERROR/VOIDED → honesto: nada debitado + pieza apartada + reintentar', () => {
    for (const s of ['DECLINED', 'ERROR', 'VOIDED']) {
        const m = mensajePorEstadoTx(s, 'BJ-7K4M-Q2X9');
        assert.equal(m.tone, 'warn', s);
        assert.match(m.body, /no se debitó/i);
        assert.match(m.body, /apartada/i);
        assert.equal(m.retry, true, s);
    }
});

test('PENDING / desconocido / null → null (se mantiene el neutro "confirmando")', () => {
    assert.equal(mensajePorEstadoTx('PENDING', 'BJ-7K4M-Q2X9'), null);
    assert.equal(mensajePorEstadoTx(undefined, 'BJ-7K4M-Q2X9'), null);
    assert.equal(mensajePorEstadoTx(null, null), null);
});
