/**
 * Integración de `crearPedidoCore` (B1 paso 3) contra el emulador Firestore.
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node --test functions/pedidos.integration.test.mjs
 *   (o, aislado: firebase emulators:exec --only firestore --project demo-bersaglio "node --test ...")
 *
 * Verifica END-TO-END lo crítico del dinero/concurrencia: candado atómico de la pieza (imposible
 * doble venta), total recalculado server-side, snapshot inmutable, correlativo, e idempotencia.
 * Escribe vía firebase-admin (bypassa reglas, = la CF).
 */
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import core from './pedidos-core.js';
const { crearPedidoCore, confirmarPagoCore } = core;

initializeApp({ projectId: 'demo-bersaglio' });
const db = getFirestore();

before(async () => {
    await db.doc('contadores/pedidos').delete().catch(() => {});
    await db.doc('pieces/pInt1').set({ name: 'Anillo Test', slug: 'anillo-test', stockType: 'finito' });          // por peso
    await db.doc('pieces/pInt2').set({ name: 'Aretes Test', slug: 'aretes-test', price: 5000000, stockType: 'finito' }); // precio fijo
    await db.doc('pieces/pInt3').set({ name: 'Sin datos', slug: 'sin-datos', stockType: 'finito' });               // sin precio ni peso
});

test('venta por peso: total = peso×gramo+mano, pieza vendida, numero 1', async () => {
    const r = await crearPedidoCore(db, { pedidoId: 'ped1', pieceId: 'pInt1', valorGramo: 350000, peso: 5, manoObra: 200000, medio: 'efectivo', autor: 'u1' });
    assert.equal(r.total, 1950000);   // 350000*5 + 200000
    assert.equal(r.numero, 1);
    assert.equal(r.yaExistia, false);
    const ped = (await db.doc('pedidos/ped1').get()).data();
    assert.equal(ped.total, 1950000);
    assert.equal(ped.estado, 'pagado');           // efectivo = pagado al registrar
    assert.equal(ped.desglose.tipo, 'por_peso');
    assert.equal(ped.desglose.oro, 1750000);
    assert.equal((await db.doc('pieces/pInt1').get()).data().estado, 'vendida');
});

test('DOBLE VENTA: la misma pieza ya vendida no se vende otra vez → rechaza', async () => {
    await assert.rejects(
        crearPedidoCore(db, { pedidoId: 'ped2', pieceId: 'pInt1', valorGramo: 350000, peso: 5, autor: 'u1' }),
        /vendida/i,
    );
});

test('IDEMPOTENTE: mismo pedidoId → devuelve el mismo (no duplica ni recalcula)', async () => {
    const r = await crearPedidoCore(db, { pedidoId: 'ped1', pieceId: 'pInt1', valorGramo: 999, peso: 999, autor: 'u1' });
    assert.equal(r.yaExistia, true);
    assert.equal(r.numero, 1);
    assert.equal(r.total, 1950000);   // total ORIGINAL, no el de los nuevos valores
});

test('precio FIJO: total = price (ignora peso/gramo) + correlativo 2', async () => {
    const r = await crearPedidoCore(db, { pedidoId: 'ped3', pieceId: 'pInt2', valorGramo: 1, peso: 1, manoObra: 1, autor: 'u1' });
    assert.equal(r.total, 5000000);
    assert.equal(r.numero, 2);
    assert.equal((await db.doc('pedidos/ped3').get()).data().desglose.tipo, 'precio_fijo');
});

test('sin total válido (sin precio ni peso/gramo) → rechaza', async () => {
    await assert.rejects(
        crearPedidoCore(db, { pedidoId: 'ped4', pieceId: 'pInt3', autor: 'u1' }),
        /mayor a 0/i,
    );
});

test('transferencia → estado pago_por_verificar (no pagado)', async () => {
    await db.doc('pieces/pInt4').set({ name: 'Transf', slug: 'transf', price: 1000000, stockType: 'finito' });
    const r = await crearPedidoCore(db, { pedidoId: 'ped5', pieceId: 'pInt4', medio: 'transferencia', autor: 'u1' });
    assert.equal(r.total, 1000000);
    assert.equal((await db.doc('pedidos/ped5').get()).data().estado, 'pago_por_verificar');
});

test('confirmarPago: "vi la plata" → por_verificar pasa a pagado', async () => {
    const r = await confirmarPagoCore(db, { pedidoId: 'ped5', autor: 'kary' });
    assert.equal(r.estado, 'pagado');
    assert.equal(r.yaEstaba, false);
    const ped = (await db.doc('pedidos/ped5').get()).data();
    assert.equal(ped.estado, 'pagado');
    assert.equal(ped.confirmadoPor, 'kary');
});

test('confirmarPago: idempotente (re-confirmar un pagado → yaEstaba, no rompe)', async () => {
    const r = await confirmarPagoCore(db, { pedidoId: 'ped5', autor: 'kary' });
    assert.equal(r.yaEstaba, true);
    assert.equal(r.estado, 'pagado');
});

test('confirmarPago: pedido inexistente → rechaza', async () => {
    await assert.rejects(confirmarPagoCore(db, { pedidoId: 'noexiste', autor: 'kary' }), /no existe/i);
});

const { anularPedidoCore, cierreCajaCore } = core;
const sleep = ms => new Promise(r => setTimeout(r, ms));

test('anularPedido: marca anulado + REINTEGRA la pieza al catálogo', async () => {
    await db.doc('pieces/pAnular').set({ name: 'Anulable', slug: 'anulable', price: 800000, stockType: 'finito' });
    await crearPedidoCore(db, { pedidoId: 'pedAnular', pieceId: 'pAnular', medio: 'efectivo', autor: 'u1' });
    assert.equal((await db.doc('pieces/pAnular').get()).data().estado, 'vendida');

    const r = await anularPedidoCore(db, { pedidoId: 'pedAnular', motivo: 'cliente se arrepintió', autor: 'kary' });
    assert.equal(r.ok, true);
    assert.equal(r.piezaReintegrada, true);
    const ped = (await db.doc('pedidos/pedAnular').get()).data();
    assert.equal(ped.estado, 'anulado');
    assert.equal(ped.motivoAnulacion, 'cliente se arrepintió');
    assert.equal((await db.doc('pieces/pAnular').get()).data().estado, 'disponible');   // reintegrada
});

test('anularPedido: idempotente (re-anular → yaAnulado, no rompe)', async () => {
    const r = await anularPedidoCore(db, { pedidoId: 'pedAnular', autor: 'kary' });
    assert.equal(r.yaAnulado, true);
});

test('anularPedido: pedido inexistente → rechaza', async () => {
    await assert.rejects(anularPedidoCore(db, { pedidoId: 'noexiste', autor: 'kary' }), /no existe/i);
});

test('cierreCaja: efectivo esperado = ventas pagadas en efectivo del turno; descuadre 0 si cuadra', async () => {
    await cierreCajaCore(db, { arqueoId: 'arqBase', declaradoEfectivo: 0, autor: 'kary' });   // baseline: consume lo previo
    await sleep(15);
    await db.doc('pieces/pCaja1').set({ name: 'Caja1', slug: 'caja1', price: 1000000, stockType: 'finito' });
    await crearPedidoCore(db, { pedidoId: 'pedCaja1', pieceId: 'pCaja1', medio: 'efectivo', autor: 'u1' });   // efectivo pagado
    await sleep(15);
    const r = await cierreCajaCore(db, { arqueoId: 'arq1', declaradoEfectivo: 1000000, autor: 'kary' });
    assert.equal(r.esperadoEfectivo, 1000000);
    assert.equal(r.descuadre, 0);
});

test('cierreCaja: descuadre negativo cuando falta efectivo', async () => {
    await sleep(15);
    await db.doc('pieces/pCaja2').set({ name: 'Caja2', slug: 'caja2', price: 500000, stockType: 'finito' });
    await crearPedidoCore(db, { pedidoId: 'pedCaja2', pieceId: 'pCaja2', medio: 'efectivo', autor: 'u1' });
    await sleep(15);
    const r = await cierreCajaCore(db, { arqueoId: 'arq2', declaradoEfectivo: 400000, autor: 'kary' });
    assert.equal(r.esperadoEfectivo, 500000);
    assert.equal(r.descuadre, -100000);
});

test('cierreCaja: idempotente (mismo arqueoId → yaExistia, no recalcula)', async () => {
    const r = await cierreCajaCore(db, { arqueoId: 'arq2', declaradoEfectivo: 999999, autor: 'kary' });
    assert.equal(r.yaExistia, true);
    assert.equal(r.descuadre, -100000);   // el ORIGINAL, no el nuevo declarado
});
