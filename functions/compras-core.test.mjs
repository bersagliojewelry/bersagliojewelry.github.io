/**
 * Tests del núcleo PURO de F-COMPRAS (sin emulador).
 *   node --test functions/compras-core.test.mjs   (o: npm run test:compras)
 *
 * Fijan el saldo POR DOCUMENTO (A1), el par atómico del cruce de anticipo (A3) y las reglas que
 * decidió el comité: R1 (origen del pago) · R2 (unicidad + pago gemelo) · R3 (sin factura) ·
 * R4 (pagar de más avisa, no bloquea). Invariantes: #1 conservación · #7 anomalía que GRITA.
 * SSoT: docs/superpowers/specs/2026-07-27-f-compras-DISENO.md. [OPUS-5]
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import core from './compras-core.js';

const {
    SIGNO_DOCUMENTO, computeSaldoDocumento, computeSaldoProveedor, estadoVencimiento,
    llaveFactura, esPagoGemelo, excedenteDePago, validarDocumento, validarPago,
    signoDocumento, signoMovimiento, entero, guardMonto, diasEntre, ComprasError,
} = core;

// ─── Signos: derivados del tipo, jamás guardados (invariante #1) ─────────────────
test('signos · la deuda es positiva; anticipo y nota crédito nacen en contra', () => {
    assert.equal(SIGNO_DOCUMENTO.factura, 1);
    assert.equal(SIGNO_DOCUMENTO.anticipo, -1);
    assert.equal(SIGNO_DOCUMENTO.nota_credito, -1);
    assert.equal(signoMovimiento('pago'), -1);
    assert.equal(signoMovimiento('cruce_aplicado'), -1);
    assert.equal(signoMovimiento('cruce_consumido'), 1);
});
test('signos · un tipo desconocido LANZA, no devuelve 0 en silencio (invariante #7)', () => {
    assert.throws(() => signoDocumento('recibo_raro'), ComprasError);
    assert.throws(() => signoMovimiento('abono'), ComprasError);
});

// ─── entero / guardMonto (T-3: pesos sin centavos) ───────────────────────────────
test('entero · desenvuelve {monto:int} y trunca', () => {
    assert.equal(entero({ monto: 500000, moneda: 'COP' }), 500000);
    assert.equal(entero(7000), 7000);
    assert.equal(entero({ monto: 1200.9 }), 1200);
    assert.equal(entero(null), 0);
});
test('guardMonto · rechaza 0, negativos y basura (a diferencia de entero, que coacciona)', () => {
    assert.throws(() => guardMonto(0), ComprasError);
    assert.throws(() => guardMonto(-5000), ComprasError);
    assert.throws(() => guardMonto('mucho'), ComprasError);
    assert.equal(guardMonto({ monto: 3000 }), 3000);
});

// ─── Saldo por documento (A1) ────────────────────────────────────────────────────
test('saldo · factura 500k con pago parcial de 200k queda debiendo 300k', () => {
    const doc = { tipo: 'factura', valor: 500000 };
    const movs = [{ tipo: 'pago', monto: 200000 }];
    assert.equal(computeSaldoDocumento(doc, movs), 300000);
});
test('saldo · un pago ANULADO deja de contar (deshacer netea, invariante #4)', () => {
    const doc = { tipo: 'factura', valor: 500000 };
    const movs = [{ tipo: 'pago', monto: 200000, estado: 'anulado' }];
    assert.equal(computeSaldoDocumento(doc, movs), 500000);
});
test('saldo · un documento ANULADO vale 0 pero sigue en el ledger (sellado, no borrado)', () => {
    const doc = { tipo: 'factura', valor: 500000, estado: 'anulado' };
    assert.equal(computeSaldoDocumento(doc, [{ tipo: 'pago', monto: 100000 }]), 0);
});
test('saldo · pagar de MÁS deja saldo NEGATIVO y NO se clampa (invariante #7: grita)', () => {
    const doc = { tipo: 'factura', valor: 500000 };
    const movs = [{ tipo: 'pago', monto: 600000 }];
    assert.equal(computeSaldoDocumento(doc, movs), -100000);   // jamás Math.max(0, …)
});
test('saldo · sin movimientos, el documento vale su propio signo', () => {
    assert.equal(computeSaldoDocumento({ tipo: 'factura', valor: 300000 }, []), 300000);
    assert.equal(computeSaldoDocumento({ tipo: 'anticipo', valor: 100000 }, []), -100000);
    assert.equal(computeSaldoDocumento({ tipo: 'nota_credito', valor: 50000 }, undefined), -50000);
});

// ─── A3 · el cruce del anticipo es un PAR: baja los dos saldos ───────────────────
test('cruce · el par atómico consume el anticipo y baja la factura por el mismo monto', () => {
    const anticipo = { tipo: 'anticipo', valor: 100000 };
    const factura = { tipo: 'factura', valor: 500000 };
    // Las dos patas del mismo cruce (mismo cruceId en la CF; aquí solo importa el efecto).
    const enAnticipo = [{ tipo: 'cruce_consumido', monto: 100000 }];
    const enFactura = [{ tipo: 'cruce_aplicado', monto: 100000 }];
    assert.equal(computeSaldoDocumento(anticipo, enAnticipo), 0);        // saldo a favor consumido
    assert.equal(computeSaldoDocumento(factura, enFactura), 400000);     // deuda reducida
    // Conservación (#1): lo que bajó la deuda == lo que se consumió del anticipo.
    const total = computeSaldoProveedor([{ doc: anticipo, movs: enAnticipo }, { doc: factura, movs: enFactura }]);
    assert.equal(total, 400000);
});
test('cruce · deshacerlo (anular las dos patas) devuelve EXACTAMENTE el estado previo', () => {
    const anticipo = { tipo: 'anticipo', valor: 100000 };
    const factura = { tipo: 'factura', valor: 500000 };
    const anuladas = (t) => [{ tipo: t, monto: 100000, estado: 'anulado' }];
    const total = computeSaldoProveedor([
        { doc: anticipo, movs: anuladas('cruce_consumido') },
        { doc: factura, movs: anuladas('cruce_aplicado') },
    ]);
    assert.equal(total, 400000 - 100000 + 100000 - 100000 + 100000);   // = 400000 sin cruce ⇒ 400000
    assert.equal(total, 400000);
});

// ─── Saldo total del proveedor ───────────────────────────────────────────────────
test('proveedor · el saldo total suma sus documentos vivos, con signo', () => {
    const docs = [
        { doc: { tipo: 'factura', valor: 500000 }, movs: [{ tipo: 'pago', monto: 200000 }] },
        { doc: { tipo: 'factura', valor: 300000 }, movs: [] },
        { doc: { tipo: 'anticipo', valor: 100000 }, movs: [] },
        { doc: { tipo: 'factura', valor: 999999 }, movs: [], },
    ];
    docs[3].doc.estado = 'anulado';                       // sellada: no pesa
    assert.equal(computeSaldoProveedor(docs), 300000 + 300000 - 100000);
});
test('proveedor · si le pagué de más en neto, el saldo total sale NEGATIVO (a mi favor)', () => {
    const docs = [{ doc: { tipo: 'anticipo', valor: 250000 }, movs: [] }];
    assert.equal(computeSaldoProveedor(docs), -250000);
    assert.equal(computeSaldoProveedor([]), 0);
    assert.equal(computeSaldoProveedor(null), 0);
});

// ─── Vencimientos (R5: la señal de Hoy) ──────────────────────────────────────────
test('vencimiento · vencido / vence pronto / al día', () => {
    const doc = (venceEl) => ({ tipo: 'factura', valor: 100000, venceEl });
    assert.equal(estadoVencimiento(doc('2026-07-20'), '2026-07-27', 100000), 'vencido');
    assert.equal(estadoVencimiento(doc('2026-07-30'), '2026-07-27', 100000), 'vence_pronto');
    assert.equal(estadoVencimiento(doc('2026-08-30'), '2026-07-27', 100000), 'al_dia');
    assert.equal(estadoVencimiento(doc('2026-07-27'), '2026-07-27', 100000), 'vence_pronto');  // hoy mismo
});
test('vencimiento · sin plazo es LEGÍTIMO (D0: la UI no puede exigir vencimiento)', () => {
    assert.equal(estadoVencimiento({ tipo: 'factura', valor: 100000 }, '2026-07-27', 100000), 'sin_plazo');
});
test('vencimiento · lo saldado y lo anulado no vencen', () => {
    const doc = { tipo: 'factura', valor: 100000, venceEl: '2026-01-01' };
    assert.equal(estadoVencimiento(doc, '2026-07-27', 0), 'saldado');
    assert.equal(estadoVencimiento(doc, '2026-07-27', -5000), 'saldado');   // pagado de más
    assert.equal(estadoVencimiento({ ...doc, estado: 'anulado' }, '2026-07-27', 100000), 'anulado');
});
test('diasEntre · cuenta días naturales sin sorpresas de zona horaria', () => {
    assert.equal(diasEntre('2026-07-27', '2026-08-03'), 7);
    assert.equal(diasEntre('2026-07-27', '2026-07-27'), 0);
    assert.equal(diasEntre('2026-12-31', '2027-01-01'), 1);
});

// ─── R2a · unicidad de factura ───────────────────────────────────────────────────
test('llaveFactura · normaliza para que las variantes del mismo número CHOQUEN', () => {
    const a = llaveFactura('900123456-7', 'A-001');
    assert.equal(a, llaveFactura('9001234567', 'a 001'));
    assert.equal(a, llaveFactura('900.123.456-7', 'A001'));
});
test('llaveFactura · sin número NO hay llave (R3: el taller que no factura es legítimo)', () => {
    assert.equal(llaveFactura('900123456', ''), null);
    assert.equal(llaveFactura('900123456', null), null);
    assert.equal(llaveFactura('900123456', '---'), null);      // puntuación sola no es un número
});
test('llaveFactura · proveedores DISTINTOS con el mismo número no chocan', () => {
    assert.notEqual(llaveFactura('900111', 'F-1'), llaveFactura('900222', 'F-1'));
});

// ─── R2b · pago gemelo: pregunta, no bloquea ─────────────────────────────────────
test('pago gemelo · mismo monto + misma fecha en el mismo documento se detecta', () => {
    const previos = [{ tipo: 'pago', monto: 200000, fecha: '2026-07-27' }];
    assert.equal(esPagoGemelo(previos, { monto: 200000, fecha: '2026-07-27' }), true);
});
test('pago gemelo · distinto monto o distinta fecha NO es gemelo (dos cuotas son legítimas)', () => {
    const previos = [{ tipo: 'pago', monto: 200000, fecha: '2026-07-27' }];
    assert.equal(esPagoGemelo(previos, { monto: 200001, fecha: '2026-07-27' }), false);
    assert.equal(esPagoGemelo(previos, { monto: 200000, fecha: '2026-07-28' }), false);
    assert.equal(esPagoGemelo([], { monto: 200000, fecha: '2026-07-27' }), false);
});
test('pago gemelo · un pago ANULADO no cuenta como gemelo (si lo anuló, lo va a repetir)', () => {
    const previos = [{ tipo: 'pago', monto: 200000, fecha: '2026-07-27', estado: 'anulado' }];
    assert.equal(esPagoGemelo(previos, { monto: 200000, fecha: '2026-07-27' }), false);
});

// ─── R4 · pagar de más avisa, no bloquea ─────────────────────────────────────────
test('excedente · dice cuánto sobra, y 0 cuando no sobra', () => {
    assert.equal(excedenteDePago(300000, 500000), 200000);
    assert.equal(excedenteDePago(300000, 300000), 0);
    assert.equal(excedenteDePago(300000, 100000), 0);
});

// ─── validarDocumento (D0: ningún camino se cierra) ──────────────────────────────
test('validarDocumento · una compra de contado SIN vencimiento se acepta (D0)', () => {
    const r = validarDocumento({ tipo: 'factura', valor: 500000, fecha: '2026-07-27', numero: 'F-9' });
    assert.equal(r.venceEl, null);
    assert.equal(r.sinFactura, false);
    assert.equal(r.valor, 500000);
});
test('validarDocumento · sin número queda marcada "sin factura" (R3), nunca bloqueada', () => {
    const r = validarDocumento({ tipo: 'factura', valor: 80000, fecha: '2026-07-27' });
    assert.equal(r.sinFactura, true);
    assert.equal(r.numero, null);
});
test('validarDocumento · rechaza lo que haría mentir al ledger', () => {
    assert.throws(() => validarDocumento({ tipo: 'recibo', valor: 1000, fecha: '2026-07-27' }), ComprasError);
    assert.throws(() => validarDocumento({ tipo: 'factura', valor: 0, fecha: '2026-07-27' }), ComprasError);
    assert.throws(() => validarDocumento({ tipo: 'factura', valor: 1000, fecha: '27/07/2026' }), ComprasError);
    assert.throws(() => validarDocumento({ tipo: 'factura', valor: 1000, fecha: '2026-07-27', venceEl: '2026-07-01' }),
        ComprasError);   // vence antes de nacer
});

// ─── validarPago · R1 + A4/771-5 ─────────────────────────────────────────────────
test('validarPago · el origen es OBLIGATORIO (771-5: sin saber de dónde salió, no es deducible)', () => {
    assert.throws(() => validarPago({ monto: 100000, fecha: '2026-07-27', documentoId: 'd1' }), ComprasError);
});
test('validarPago · por banco exige la cuenta; en efectivo la RECHAZA (R1: sale de la bóveda)', () => {
    assert.throws(() => validarPago({ monto: 1000, fecha: '2026-07-27', documentoId: 'd1', origen: 'banco' }), ComprasError);
    assert.throws(() => validarPago({ monto: 1000, fecha: '2026-07-27', documentoId: 'd1', origen: 'efectivo', cuentaId: 'boveda' }),
        ComprasError);   // el doble conteo contra el saldo de la bóveda (el P0 de §194) queda cerrado aquí
    const banco = validarPago({ monto: 1000, fecha: '2026-07-27', documentoId: 'd1', origen: 'banco', cuentaId: 'bancolombia' });
    assert.equal(banco.cuentaId, 'bancolombia');
    const efectivo = validarPago({ monto: 1000, fecha: '2026-07-27', documentoId: 'd1', origen: 'efectivo' });
    assert.equal(efectivo.cuentaId, null);
});
test('validarPago · un pago sin documento no existe (A2: un pago apunta a UNO)', () => {
    assert.throws(() => validarPago({ monto: 1000, fecha: '2026-07-27', origen: 'efectivo' }), ComprasError);
});
