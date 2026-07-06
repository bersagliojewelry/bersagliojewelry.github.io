/**
 * F1-CORE — integración de `avanzarPedidoCore` + fix P0 del arqueo contra el emulador.
 *   firebase emulators:exec --only firestore --project demo-bersaglio "node --test functions/avanzar-pedido.integration.test.mjs"
 * ⚠️ UN archivo de integración por sesión de emulador (en paralelo se pisan el contador/arqueo).
 */
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import core from './pedidos-core.js';
const { crearPedidoCore, avanzarPedidoCore, cierreCajaCore } = core;

initializeApp({ projectId: 'demo-bersaglio' });
const db = getFirestore();

const historialDe = async (id) => {
    const s = await db.collection(`pedidos/${id}/historial`).get();
    return s.docs.map(d => d.data());
};

before(async () => {
    await db.doc('contadores/pedidos').delete().catch(() => {});
    // Piezas para el flujo (efectivo+requiereEnvio → nace `pagado` y entra al flujo logístico).
    await db.doc('pieces/av1').set({ name: 'Colgante Ruta', slug: 'colgante-ruta', price: 900000, stockType: 'finito', cantidad: 1 });
    await db.doc('pieces/av2').set({ name: 'Anillo Peso', slug: 'anillo-peso', stockType: 'finito', cantidad: 1 });   // por peso (merma)
    await db.doc('pieces/av3').set({ name: 'Aretes Cancel', slug: 'aretes-cancel', price: 500000, stockType: 'finito', cantidad: 1 });
    await crearPedidoCore(db, { pedidoId: 'pAv1', pieceId: 'av1', medio: 'efectivo', autor: 'kary', requiereEnvio: true });
    await crearPedidoCore(db, { pedidoId: 'pAv2', pieceId: 'av2', medio: 'efectivo', autor: 'kary', requiereEnvio: true, valorGramo: 100000, peso: 5, manoObra: 0 });
    await crearPedidoCore(db, { pedidoId: 'pAv3', pieceId: 'av3', medio: 'efectivo', autor: 'kary', requiereEnvio: true });
});

test('requiereEnvio: nace pagado (NO en mano) + costuras items[]/clienteId/codigo', async () => {
    const p = (await db.doc('pedidos/pAv1').get()).data();
    assert.equal(p.estado, 'pagado');
    assert.equal(p.requiereEnvio, true);
    assert.equal(p.clienteId, null);
    assert.equal(p.items.length, 1);
    assert.deepEqual(p.items[0], { pieceId: 'av1', pieceName: 'Colgante Ruta', pieceSlug: 'colgante-ruta', cantidad: 1, precio: 900000, costoSnapshot: null });
    assert.match(p.codigo, /^BJ-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
});

test('transición válida: pagado→preparacion escribe estado + historial con dayKey local', async () => {
    const r = await avanzarPedidoCore(db, { pedidoId: 'pAv1', a: 'preparacion', autor: 'kary' }, { nowMs: Date.UTC(2026, 6, 7, 2, 30) });
    assert.deepEqual(r, { pedidoId: 'pAv1', estado: 'preparacion', de: 'pagado' });
    const h = await historialDe('pAv1');
    assert.equal(h.length, 1);
    assert.equal(h[0].de, 'pagado');
    assert.equal(h[0].a, 'preparacion');
    assert.equal(h[0].autor, 'kary');
    assert.equal(h[0].dayKey, '2026-07-06');   // 02:30 UTC = 21:30 Bogotá del día anterior
});

test('transición INVÁLIDA (preparacion→reembolsado) falla y NO escribe nada', async () => {
    await assert.rejects(avanzarPedidoCore(db, { pedidoId: 'pAv1', a: 'reembolsado', autor: 'kary' }), /inválida/i);
    assert.equal((await db.doc('pedidos/pAv1').get()).data().estado, 'preparacion');
    assert.equal((await historialDe('pAv1')).length, 1);
});

test('idempotente: a === estado actual → yaEstaba, sin historial nuevo', async () => {
    const r = await avanzarPedidoCore(db, { pedidoId: 'pAv1', a: 'preparacion', autor: 'kary' });
    assert.equal(r.yaEstaba, true);
    assert.equal((await historialDe('pAv1')).length, 1);
});

test('despacho_nacional EXIGE flete+transportadora+guía; snapshot INTACTO; flete aditivo', async () => {
    await assert.rejects(avanzarPedidoCore(db, { pedidoId: 'pAv1', a: 'despacho_nacional', autor: 'kary' }), /exige/i);
    await avanzarPedidoCore(db, {
        pedidoId: 'pAv1', a: 'despacho_nacional', autor: 'kary',
        datos: { flete: { valorCOP: 25000, medio: 'wompi' }, transportadora: 'Servientrega', guia: 'G-123', asegurado: true },
    });
    const p = (await db.doc('pedidos/pAv1').get()).data();
    assert.equal(p.estado, 'despacho_nacional');
    assert.deepEqual(p.flete, { valorCOP: 25000, cobro: 'cobrado', medio: 'wompi', estado: 'pendiente' });   // D-2: default cobrado aparte
    assert.equal(p.transportadora, 'Servientrega');
    assert.equal(p.guia, 'G-123');
    assert.equal(p.total, 900000);                       // JAMÁS recalculado (flete NO suma al snapshot)
    assert.equal(p.desglose.total, 900000);
});

test('entregado desde despacho: pod.evidencia + entregadoEn; luego SOLO reembolsado', async () => {
    await avanzarPedidoCore(db, { pedidoId: 'pAv1', a: 'entregado', autor: 'kary', datos: { evidencia: 'foto-guia.jpg' } });
    const p = (await db.doc('pedidos/pAv1').get()).data();
    assert.equal(p.estado, 'entregado');
    assert.ok(p.entregadoEn);
    assert.equal(p.pod.evidencia, 'foto-guia.jpg');
    await assert.rejects(avanzarPedidoCore(db, { pedidoId: 'pAv1', a: 'preparacion', autor: 'kary' }), /inválida/i);
});

test('reembolsado exige datos.reembolso{medio,monto>0}; NO repone stock', async () => {
    await assert.rejects(avanzarPedidoCore(db, { pedidoId: 'pAv1', a: 'reembolsado', autor: 'kary' }), /Reembolso exige/i);
    await avanzarPedidoCore(db, { pedidoId: 'pAv1', a: 'reembolsado', autor: 'kary', datos: { reembolso: { medio: 'transferencia', monto: 900000 } } });
    const p = (await db.doc('pedidos/pAv1').get()).data();
    assert.equal(p.estado, 'reembolsado');
    assert.equal(p.reembolso.monto, 900000);
    assert.equal((await db.doc('pieces/av1').get()).data().cantidad, 0);    // NO repuso (decisión humana → F3)
});

test('merma por_peso: pesoEntregado < pesoCobrado asienta en el LEDGER de la pieza (no campo suelto)', async () => {
    await avanzarPedidoCore(db, { pedidoId: 'pAv2', a: 'preparacion', autor: 'kary' });
    await avanzarPedidoCore(db, {
        pedidoId: 'pAv2', a: 'despacho_nacional', autor: 'kary',
        datos: { flete: { valorCOP: 0, cobro: 'asumido' }, transportadora: 'Inter', guia: 'G-9', pesoEntregado: 4.6 },
    });
    const mov = (await db.doc('pieces/av2/movimientos/merma-pAv2').get()).data();
    assert.equal(mov.motivo, 'merma');
    assert.equal(mov.delta, 0);
    assert.ok(Math.abs(mov.gramos - 0.4) < 1e-9);
    assert.equal((await db.doc('pedidos/pAv2').get()).data().flete.cobro, 'asumido');
});

test('cancelado pre-despacho: exige motivo + REPONE stock (cantidad+1 + ledger) + registro', async () => {
    await avanzarPedidoCore(db, { pedidoId: 'pAv3', a: 'preparacion', autor: 'kary' });
    await assert.rejects(avanzarPedidoCore(db, { pedidoId: 'pAv3', a: 'cancelado', autor: 'kary' }), /motivo/i);
    await avanzarPedidoCore(db, { pedidoId: 'pAv3', a: 'cancelado', autor: 'kary', datos: { motivo: 'cliente desistió antes del despacho' } });
    const p = (await db.doc('pedidos/pAv3').get()).data();
    assert.equal(p.estado, 'cancelado');
    assert.equal(p.motivoCancelacion, 'cliente desistió antes del despacho');
    const pz = (await db.doc('pieces/av3').get()).data();
    assert.equal(pz.cantidad, 1);                                            // repuesta
    assert.equal(pz.estado, 'disponible');
    assert.equal((await db.doc('pieces/av3/movimientos/cancelado-pAv3').get()).data().delta, 1);
});

test('retiro: entregado exige cédula cotejada (POD)', async () => {
    await db.doc('pieces/av4').set({ name: 'Retiro', slug: 'retiro-t', price: 100000, stockType: 'finito', cantidad: 1 });
    await crearPedidoCore(db, { pedidoId: 'pAv4', pieceId: 'av4', medio: 'efectivo', autor: 'kary', requiereEnvio: true });
    await avanzarPedidoCore(db, { pedidoId: 'pAv4', a: 'preparacion', autor: 'kary' });
    await avanzarPedidoCore(db, { pedidoId: 'pAv4', a: 'listo_retiro', autor: 'kary' });
    await assert.rejects(avanzarPedidoCore(db, { pedidoId: 'pAv4', a: 'entregado', autor: 'kary' }), /cédula/i);
    await avanzarPedidoCore(db, { pedidoId: 'pAv4', a: 'entregado', autor: 'kary', datos: { cedulaCotejada: true } });
    assert.equal((await db.doc('pedidos/pAv4').get()).data().pod.cedulaCotejada, true);
});

test('entrega_local exige nombre del receptor', async () => {
    await db.doc('pieces/av5').set({ name: 'Local', slug: 'local-t', price: 100000, stockType: 'finito', cantidad: 1 });
    await crearPedidoCore(db, { pedidoId: 'pAv5', pieceId: 'av5', medio: 'efectivo', autor: 'kary', requiereEnvio: true });
    await avanzarPedidoCore(db, { pedidoId: 'pAv5', a: 'preparacion', autor: 'kary' });
    await assert.rejects(avanzarPedidoCore(db, { pedidoId: 'pAv5', a: 'entrega_local', autor: 'kary' }), /recibe/i);
    await avanzarPedidoCore(db, { pedidoId: 'pAv5', a: 'entrega_local', autor: 'kary', datos: { receptorNombre: 'Marta Díaz' } });
    assert.equal((await db.doc('pedidos/pAv5').get()).data().pod.receptorNombre, 'Marta Díaz');
});

// ── P0 ARQUEO (spec §3.4): el dinero NO se esfuma al avanzar; devuelto resta en turno posterior ──
test('arqueo: pedido pagado→ENTREGADO en el mismo turno SIGUE contando (fix ESTADOS_CON_DINERO)', async () => {
    await cierreCajaCore(db, { arqueoId: 'avBase', declaradoEfectivo: 0, autor: 'kary' });   // baseline
    await db.doc('pieces/av6').set({ name: 'Arqueo1', slug: 'arqueo-1', price: 700000, stockType: 'finito', cantidad: 1 });
    await crearPedidoCore(db, { pedidoId: 'pAv6', pieceId: 'av6', medio: 'efectivo', autor: 'kary', requiereEnvio: true });
    await avanzarPedidoCore(db, { pedidoId: 'pAv6', a: 'entregado', autor: 'kary' });        // en mano manual
    const c = await cierreCajaCore(db, { arqueoId: 'avC1', declaradoEfectivo: 700000, autor: 'kary' });
    assert.equal(c.esperadoEfectivo, 700000);   // ANTES del fix: 0 (el dinero se esfumaba)
    assert.equal(c.descuadre, 0);
});

test('arqueo: CANCELADO en turno posterior resta lo contado antes (ajuste, como anulado)', async () => {
    await db.doc('pieces/av7').set({ name: 'Arqueo2', slug: 'arqueo-2', price: 300000, stockType: 'finito', cantidad: 1 });
    await crearPedidoCore(db, { pedidoId: 'pAv7', pieceId: 'av7', medio: 'efectivo', autor: 'kary', requiereEnvio: true });
    const c1 = await cierreCajaCore(db, { arqueoId: 'avC2', declaradoEfectivo: 300000, autor: 'kary' });
    assert.equal(c1.esperadoEfectivo, 300000);                                // contada en ESTE cierre
    await avanzarPedidoCore(db, { pedidoId: 'pAv7', a: 'cancelado', autor: 'kary', datos: { motivo: 'se devolvió la plata' } });
    // El conteo físico no puede ser negativo (entero() clampa a 0): caja vacía + devolución hecha
    // → esperado NETO -300000 y descuadre +300000 explicable (la plata salió del cajón al cliente).
    const c2 = await cierreCajaCore(db, { arqueoId: 'avC3', declaradoEfectivo: 0, autor: 'kary' });
    assert.equal(c2.ajustesPorMedio.efectivo, -300000);                       // devolución del turno previo
    assert.equal(c2.esperadoEfectivo, -300000);
    assert.equal(c2.descuadre, 300000);
});
