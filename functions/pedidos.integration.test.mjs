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
    await db.doc('pieces/pInt1').set({ name: 'Anillo Test', slug: 'anillo-test', stockType: 'finito', cantidad: 1 });          // por peso, única
    await db.doc('pieces/pInt2').set({ name: 'Aretes Test', slug: 'aretes-test', price: 5000000, stockType: 'finito', cantidad: 1 }); // precio fijo
    await db.doc('pieces/pInt3').set({ name: 'Sin datos', slug: 'sin-datos', stockType: 'finito', cantidad: 1 });               // sin precio ni peso
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
    assert.equal(ped.consumioStock, true);                                  // v3: bajó una unidad
    const pz = (await db.doc('pieces/pInt1').get()).data();
    assert.equal(pz.cantidad, 0);                                           // v3: decrementó (no marca 'vendida')
    assert.equal(pz.estado, 'agotada');                                     // estado DERIVADO de cantidad
    assert.equal((await db.doc('pieces/pInt1/movimientos/ped1').get()).data().delta, -1);  // ledger
});

test('DOBLE VENTA: la misma pieza ya agotada no se vende otra vez → rechaza', async () => {
    await assert.rejects(
        crearPedidoCore(db, { pedidoId: 'ped2', pieceId: 'pInt1', valorGramo: 350000, peso: 5, autor: 'u1' }),
        /agotada/i,
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

const { anularPedidoCore, cierreCajaCore } = core;   // confirmarPagoCore ya viene del import de arriba
const sleep = ms => new Promise(r => setTimeout(r, ms));

test('anularPedido: marca anulado + REPONE la unidad (v3: cantidad + estado derivado + ledger)', async () => {
    await db.doc('pieces/pAnular').set({ name: 'Anulable', slug: 'anulable', price: 800000, stockType: 'finito', cantidad: 1 });
    await crearPedidoCore(db, { pedidoId: 'pedAnular', pieceId: 'pAnular', medio: 'efectivo', autor: 'u1' });
    assert.equal((await db.doc('pieces/pAnular').get()).data().cantidad, 0);   // vendió → 0 (agotada)

    const r = await anularPedidoCore(db, { pedidoId: 'pedAnular', motivo: 'cliente se arrepintió', autor: 'kary' });
    assert.equal(r.ok, true);
    assert.equal(r.piezaReintegrada, true);
    const ped = (await db.doc('pedidos/pedAnular').get()).data();
    assert.equal(ped.estado, 'anulado');
    assert.equal(ped.motivoAnulacion, 'cliente se arrepintió');
    const pz = (await db.doc('pieces/pAnular').get()).data();
    assert.equal(pz.cantidad, 1);                                             // repuesta
    assert.equal(pz.estado, 'disponible');                                    // derivado
    assert.equal((await db.doc('pieces/pAnular/movimientos/anul-pedAnular').get()).data().delta, 1);  // ledger
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

// ─── TODO-40 v3: tipos de stock (lote / encargo / refabricable) — AL FINAL para no alterar el correlativo ───
test('v3 LOTE (cantidad 3): cada venta decrementa; a 0 → agotada + ledger por venta', async () => {
    await db.doc('pieces/pLote').set({ name: 'Lote', slug: 'lote', price: 100000, stockType: 'finito', cantidad: 3 });
    for (const [n, restante, estado] of [[1, 2, 'disponible'], [2, 1, 'disponible'], [3, 0, 'agotada']]) {
        await crearPedidoCore(db, { pedidoId: `pedLote${n}`, pieceId: 'pLote', medio: 'efectivo', autor: 'u1' });
        const pz = (await db.doc('pieces/pLote').get()).data();
        assert.equal(pz.cantidad, restante, `tras venta ${n}`);
        assert.equal(pz.estado, estado);
        assert.equal((await db.doc(`pieces/pLote/movimientos/pedLote${n}`).get()).data().cantidadResultante, restante);
    }
    await assert.rejects(crearPedidoCore(db, { pedidoId: 'pedLote4', pieceId: 'pLote', medio: 'efectivo', autor: 'u1' }), /agotada/i);
});

test('v3 ENCARGO: vende SIN decrementar (se fabrica); cero ledger, consumioStock false', async () => {
    await db.doc('pieces/pEnc').set({ name: 'Encargo', slug: 'encargo', price: 200000, stockType: 'encargo' });
    await crearPedidoCore(db, { pedidoId: 'pedEnc1', pieceId: 'pEnc', medio: 'efectivo', autor: 'u1' });
    const pz = (await db.doc('pieces/pEnc').get()).data();
    assert.equal(pz.cantidad ?? null, null);                                   // no aplica (no se tocó)
    assert.equal((await db.doc('pedidos/pedEnc1').get()).data().consumioStock, false);
    assert.equal((await db.doc('pieces/pEnc/movimientos/pedEnc1').get()).exists, false);   // sin asiento
    await crearPedidoCore(db, { pedidoId: 'pedEnc2', pieceId: 'pEnc', medio: 'efectivo', autor: 'u1' });   // vendible otra vez
    assert.equal((await db.doc('pedidos/pedEnc2').get()).data().estado, 'pagado');
});

test('v3 REFABRICABLE agotado (cantidad 0): vende bajo-pedido SIN decrementar (no -1)', async () => {
    await db.doc('pieces/pRef0').set({ name: 'Refab0', slug: 'refab0', price: 300000, stockType: 'finito_refabricable', cantidad: 0 });
    await crearPedidoCore(db, { pedidoId: 'pedRef1', pieceId: 'pRef0', medio: 'efectivo', autor: 'u1' });
    assert.equal((await db.doc('pieces/pRef0').get()).data().cantidad, 0);     // NO bajó a -1
    assert.equal((await db.doc('pedidos/pedRef1').get()).data().consumioStock, false);
});

test('v3 REFABRICABLE con stock (cantidad 1): vende → 0 → bajo_pedido (NO agotada, sigue pedible)', async () => {
    await db.doc('pieces/pRef1').set({ name: 'Refab1', slug: 'refab1', price: 300000, stockType: 'finito_refabricable', cantidad: 1 });
    await crearPedidoCore(db, { pedidoId: 'pedRef2', pieceId: 'pRef1', medio: 'efectivo', autor: 'u1' });
    const pz = (await db.doc('pieces/pRef1').get()).data();
    assert.equal(pz.cantidad, 0);
    assert.equal(pz.estado, 'bajo_pedido');                                    // refabricable agotado sigue vendible
    await crearPedidoCore(db, { pedidoId: 'pedRef3', pieceId: 'pRef1', medio: 'efectivo', autor: 'u1' });   // se sigue vendiendo
    assert.equal((await db.doc('pieces/pRef1').get()).data().cantidad, 0);     // no baja de 0
});

// ─── Bloque C del plan Fable (AL FINAL: crean pedidos → correlativo) ───
test('C.1: anular una pieza que Kary cambió a ENCARGO no le crea cantidad (invariante)', async () => {
    await db.doc('pieces/pC1enc').set({ name: 'C1enc', slug: 'c1enc', price: 400000, stockType: 'finito', cantidad: 1 });
    await crearPedidoCore(db, { pedidoId: 'pedC1enc', pieceId: 'pC1enc', medio: 'efectivo', autor: 'u1' });
    await db.doc('pieces/pC1enc').set({ name: 'C1enc', slug: 'c1enc', price: 400000, stockType: 'encargo' });   // Kary cambia el tipo
    await anularPedidoCore(db, { pedidoId: 'pedC1enc', autor: 'kary' });
    const pz = (await db.doc('pieces/pC1enc').get()).data();
    assert.equal(pz.cantidad ?? null, null);        // NO se creó `cantidad` sobre un encargo
    assert.equal(pz.estado, 'disponible');
});

test('C.1: anular un pedido web pago_pendiente limpia reservaId/reservaExpira (sin reserva fantasma)', async () => {
    await db.doc('pieces/pC1res').set({ name: 'C1res', slug: 'c1res', price: 500000, stockType: 'finito', cantidad: 0, estado: 'agotada', reservaId: 'pedC1res', reservaExpira: null });
    await db.doc('pedidos/pedC1res').set({ pieceId: 'pC1res', total: 500000, estado: 'pago_pendiente', consumioStock: true, canal: 'web', medio: 'wompi' });
    await anularPedidoCore(db, { pedidoId: 'pedC1res', autor: 'kary' });
    const pz = (await db.doc('pieces/pC1res').get()).data();
    assert.equal(pz.cantidad, 1);            // repuesta
    assert.equal(pz.reservaId, null);        // C.1: limpia la reserva (antes quedaba fantasma)
    assert.equal(pz.reservaExpira, null);
});

test('C.2: venta transferencia confirmada en un turno POSTERIOR cuenta en ese turno (no se pierde)', async () => {
    await db.doc('pieces/pC2').set({ name: 'C2', slug: 'c2', price: 700000, stockType: 'finito', cantidad: 1 });
    await crearPedidoCore(db, { pedidoId: 'pedC2', pieceId: 'pC2', medio: 'transferencia', autor: 'u1' });   // nace pago_por_verificar
    await sleep(15);
    const c1 = await cierreCajaCore(db, { arqueoId: 'arqC2a', declaradoEfectivo: 0, autor: 'kary' });
    assert.equal(c1.esperadoPorMedio.transferencia, 0);   // aún no pagada → no cuenta en el turno 1
    await sleep(15);
    await confirmarPagoCore(db, { pedidoId: 'pedC2', autor: 'kary' });   // confirmada en el turno 2
    await sleep(15);
    const c2 = await cierreCajaCore(db, { arqueoId: 'arqC2b', declaradoEfectivo: 0, autor: 'kary' });
    assert.equal(c2.esperadoPorMedio.transferencia, 700000);   // C.2: cuenta en el turno de confirmación
});

test('C.2 guard: anular una transferencia NUNCA pagada de un turno previo NO genera devolución (ajuste fantasma)', async () => {
    await db.doc('pieces/pC2b').set({ name: 'C2b', slug: 'c2b', price: 900000, stockType: 'finito', cantidad: 1 });
    await crearPedidoCore(db, { pedidoId: 'pedC2b', pieceId: 'pC2b', medio: 'transferencia', autor: 'u1' });   // nace pago_por_verificar y NUNCA se confirma
    await sleep(15);
    const c1 = await cierreCajaCore(db, { arqueoId: 'arqC2c', declaradoEfectivo: 0, autor: 'kary' });
    assert.equal(c1.esperadoPorMedio.transferencia, 0);        // nunca ingresó dinero
    await sleep(15);
    await anularPedidoCore(db, { pedidoId: 'pedC2b', autor: 'kary' });   // anulada en el turno SIGUIENTE
    await sleep(15);
    const c2 = await cierreCajaCore(db, { arqueoId: 'arqC2d', declaradoEfectivo: 0, autor: 'kary' });
    assert.equal(c2.ajustesPorMedio.transferencia, 0);         // sin confirmadoEn no hay dinero que "devolver"
});

test('price 0 = SIN precio en sistema: el mostrador vende POR PESO (no queda bloqueado en fijo $0)', async () => {
    await db.doc('pieces/pCero').set({ name: 'Sin Precio', slug: 'sin-precio-pos', price: 0, stockType: 'finito', cantidad: 1 });
    const r = await crearPedidoCore(db, {
        pedidoId: 'pedCero', pieceId: 'pCero', medio: 'efectivo', autor: 'u1',
        valorGramo: 300000, peso: 2.5, manoObra: 50000,
    });
    assert.equal(r.total, 800000);                             // 300000×2.5 + 50000 (por peso, no $0 fijo)
    const ped = (await db.doc('pedidos/pedCero').get()).data();
    assert.equal(ped.desglose.tipo, 'por_peso');               // regla del dueño: 0 = se cobra por peso
    assert.equal(ped.estado, 'pagado');
    // Y sin peso/gramo sigue siendo invendible (el guard total>0 no se relajó) — pieza fresca con stock:
    await db.doc('pieces/pCero2').set({ name: 'Sin Precio 2', slug: 'sin-precio-pos-2', price: 0, stockType: 'finito', cantidad: 1 });
    await assert.rejects(
        crearPedidoCore(db, { pedidoId: 'pedCero2', pieceId: 'pCero2', medio: 'efectivo', autor: 'u1' }),
        /mayor a 0/i
    );
});
