/**
 * TODO-73 · POS-pro money-model — integración de `crearPedidoCore` (datáfono · sin-pieza · pagos[])
 * y `cerrarTurnoCore` (reconciliación de vouchers datáfono, split-aware).
 *   firebase emulators:exec --only firestore --project demo-bersaglio "node --test functions/f2-3-pos-pro.integration.test.mjs"
 *
 * SSoT: docs/superpowers/specs/2026-07-08-pos-pro-datafono-servicios-DISENO.md (§3/§8 comité/§9 split).
 * Invariantes: Σpagos===total===Σitems; datáfono NO suma al efectivo del cajón; voucher cuenta PAGOS
 * datáfono con dinero (anulados EXCLUIDOS pero expuestos); descuadre NUNCA bloquea; null-safe;
 * doble-cierre devuelve vouchers; sin-pieza no toca stock; back-compat pago único / legacy sin pagos.
 */
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import core from './pedidos-core.js';
import caja from './caja-core.js';
const { crearPedidoCore, anularPedidoCore } = core;
const { abrirTurnoCore, cerrarTurnoCore } = caja;

initializeApp({ projectId: 'demo-bersaglio' });
const db = getFirestore();

before(async () => {
    await db.doc('contadores/pedidos').delete().catch(() => {});
    await db.doc('caja/estado').delete().catch(() => {});
    await db.doc('servicios/srvGrab').set({ codigo: 'GRAB', nombre: 'Grabado láser', precio: 20000, activo: true, naturaleza: 'servicio' });
    await db.doc('servicios/srvRep').set({ codigo: 'REP', nombre: 'Reparación de broche', precio: 50000, activo: true, naturaleza: 'servicio' });
    await db.doc('config/caja').set({ enforceTurno: false, topeLineaLibre: 2000000, topeExtrasTotal: 10000000, umbralRevisionLibre: 500000 });
    // `encargo` = vendible sin decrementar stock → reusable en los tests de cierre (ninguno verifica stock aquí).
    for (const id of ['d1', 'mix1', 'leg1', 'ver1']) {
        await db.doc(`pieces/${id}`).set({ name: `Pieza ${id}`, slug: id, price: 1000000, stockType: 'encargo' });
    }
});

// Helper: turno limpio (cierra el previo si quedó abierto por el puntero singleton).
async function nuevoTurno(opId) {
    const est = (await db.doc('caja/estado').get()).data();
    if (est?.turnoAbiertoId) await cerrarTurnoCore(db, { turnoId: est.turnoAbiertoId, conteoPorMedio: { efectivo: 0 }, autor: 't' }).catch(() => {});
    await abrirTurnoCore(db, { opId, fondoApertura: 0, autor: 'kary' });
    return opId;
}

// ─────────────── 3a · DATÁFONO (medio tarjeta, pago inmediato) ───────────────
test('datáfono: pago inmediato → estado entregado; pagos=[{datafono,total}]; medio top-level datafono', async () => {
    const r = await crearPedidoCore(db, { pedidoId: 'pd1', pieceId: 'd1', medio: 'datafono', autor: 'kary' });
    assert.equal(r.total, 1000000);
    assert.equal(r.estado, 'entregado');                       // como efectivo (tarjeta aprueba en el acto)
    const ped = (await db.doc('pedidos/pd1').get()).data();
    assert.equal(ped.medio, 'datafono');
    assert.deepEqual(ped.pagos, [{ medio: 'datafono', monto: 1000000 }]);
    assert.equal(ped.items.reduce((a, it) => a + it.precio * it.cantidad, 0), ped.total);
});

// ─────────────── 3c · VENTA SIN PIEZA (solo servicios/monto libre) ───────────────
test('sin pieza + servicio: total=servicio; items sin L0; sin stock; pieceId null; pieceName legible', async () => {
    const r = await crearPedidoCore(db, {
        pedidoId: 'psp1', medio: 'efectivo', autor: 'kary',
        lineasExtra: [{ tipo: 'servicio', servicioId: 'srvRep' }],
    });
    assert.equal(r.total, 50000);
    assert.equal(r.estado, 'entregado');
    const ped = (await db.doc('pedidos/psp1').get()).data();
    assert.equal(ped.pieceId ?? null, null);
    assert.equal(ped.pieceSlug ?? null, null);
    assert.equal(ped.consumioStock ?? false, false);
    assert.equal(ped.desglose.tipo, 'sin_pieza');
    assert.ok(ped.items.every(it => it.lineId !== 'L0'));      // no hay línea de pieza
    assert.equal(ped.items.reduce((a, it) => a + it.precio * it.cantidad, 0), 50000);
    assert.ok(/repar/i.test(ped.pieceName));                   // etiqueta legible (nombre del servicio)
});

test('sin pieza + línea libre (monto libre): total=precio libre', async () => {
    const r = await crearPedidoCore(db, {
        pedidoId: 'psp2', medio: 'datafono', autor: 'kary',
        lineasExtra: [{ tipo: 'libre', concepto: 'Ajuste especial', precio: 40000 }],
    });
    assert.equal(r.total, 40000);
    const ped = (await db.doc('pedidos/psp2').get()).data();
    assert.equal(ped.pieceId ?? null, null);
    assert.equal(ped.estado, 'entregado');                     // datáfono inmediato
});

test('sin pieza Y sin líneas → rechaza (una venta necesita pieza o servicio)', async () => {
    await assert.rejects(
        crearPedidoCore(db, { pedidoId: 'psp3', medio: 'efectivo', autor: 'kary' }),
        /pieza|servicio|línea/i,
    );
    assert.equal((await db.doc('pedidos/psp3').get()).exists, false);
});

test('anular venta sin pieza: queda anulado; NO intenta reponer stock (no hay pieza)', async () => {
    await crearPedidoCore(db, { pedidoId: 'psp4', medio: 'efectivo', autor: 'kary', lineasExtra: [{ tipo: 'servicio', servicioId: 'srvRep' }] });
    const r = await anularPedidoCore(db, { pedidoId: 'psp4', motivo: 'prueba', autor: 'kary' });
    assert.equal(r.piezaReintegrada ?? false, false);          // no había pieza que reponer
    assert.equal((await db.doc('pedidos/psp4').get()).data().estado, 'anulado');
});

// ─────────────── 9 · PAGO DIVIDIDO (pagos[]) ───────────────
test('pago dividido tarjeta+efectivo: Σpagos=total; medio=mixto; inmediato → entregado', async () => {
    const r = await crearPedidoCore(db, {
        pedidoId: 'pmx1', pieceId: 'mix1', autor: 'kary',
        pagos: [{ medio: 'datafono', monto: 700000 }, { medio: 'efectivo', monto: 300000 }],
    });
    assert.equal(r.total, 1000000);
    assert.equal(r.estado, 'entregado');                       // ambos inmediatos
    const ped = (await db.doc('pedidos/pmx1').get()).data();
    assert.equal(ped.medio, 'mixto');
    assert.equal(ped.pagos.reduce((a, p) => a + p.monto, 0), ped.total);
});

test('pago dividido: Σpagos ≠ total → rechaza', async () => {
    await assert.rejects(
        crearPedidoCore(db, { pedidoId: 'pmx2', pieceId: 'mix1', autor: 'kary', pagos: [{ medio: 'datafono', monto: 700000 }, { medio: 'efectivo', monto: 200000 }] }),
        /pago|total|suma/i,
    );
});

test('pago dividido con un diferido (transferencia) → pago_por_verificar', async () => {
    const r = await crearPedidoCore(db, {
        pedidoId: 'pmx3', pieceId: 'mix1', autor: 'kary',
        pagos: [{ medio: 'datafono', monto: 500000 }, { medio: 'transferencia', monto: 500000 }],
    });
    assert.equal(r.estado, 'pago_por_verificar');              // algún pago diferido → la venta espera
});

test('legacy: crearPedido con medio (sin pagos) → pagos derivado [{medio,total}]', async () => {
    await crearPedidoCore(db, { pedidoId: 'pleg1', pieceId: 'leg1', medio: 'efectivo', autor: 'kary' });
    const ped = (await db.doc('pedidos/pleg1').get()).data();
    assert.deepEqual(ped.pagos, [{ medio: 'efectivo', monto: 1000000 }]);
});

// ─────────────── 3b · RECONCILIACIÓN DE VOUCHERS AL CIERRE ───────────────
test('cierre: N ventas datáfono → esperadoDatafono={suma,cantidad}; conteo exacto → descuadre 0', async () => {
    const T = await nuevoTurno('Tvouch');
    await crearPedidoCore(db, { pedidoId: 'tv1', pieceId: 'ver1', medio: 'datafono', autor: 'kary' });   // 1.000.000
    await crearPedidoCore(db, { pedidoId: 'tv2', medio: 'datafono', autor: 'kary', lineasExtra: [{ tipo: 'servicio', servicioId: 'srvRep' }] }); // 50.000 sin pieza
    const c = await cerrarTurnoCore(db, { turnoId: T, conteoPorMedio: { efectivo: 0, datafono: { suma: 1050000, cantidad: 2 } }, autor: 'kary' });
    assert.equal(c.esperadoDatafono.suma, 1050000);
    assert.equal(c.esperadoDatafono.cantidad, 2);
    assert.equal(c.descuadreDatafono.suma, 0);
    assert.equal(c.descuadreDatafono.cantidad, 0);
    assert.equal(c.esperadoEfectivo, 0);                       // datáfono NO entra al efectivo del cajón
});

test('cierre: conteo de vouchers con descuadre → lo calcula y CIERRA IGUAL (no bloquea)', async () => {
    const T = await nuevoTurno('Tdesc');
    await crearPedidoCore(db, { pedidoId: 'td1', pieceId: 'ver1', medio: 'datafono', autor: 'kary' });   // esperado suma 1.000.000, cant 1
    const c = await cerrarTurnoCore(db, { turnoId: T, conteoPorMedio: { efectivo: 0, datafono: { suma: 999000, cantidad: 0 } }, autor: 'kary' });
    assert.equal(c.descuadreDatafono.suma, -1000);             // faltó $1.000
    assert.equal(c.descuadreDatafono.cantidad, -1);            // faltó 1 voucher
    assert.equal((await db.doc(`turnos/${T}`).get()).data().estado, 'cerrado');   // cerró igual
});

test('cierre solo-efectivo SIN conteo.datafono → NO crashea (null-safe, regresión de HOY)', async () => {
    const T = await nuevoTurno('Tcash');
    await crearPedidoCore(db, { pedidoId: 'tc1', pieceId: 'ver1', medio: 'efectivo', autor: 'kary' });
    const c = await cerrarTurnoCore(db, { turnoId: T, conteoPorMedio: { efectivo: 1000000 }, autor: 'kary' });
    assert.equal(c.descuadre, 0);
    assert.equal(c.esperadoDatafono.suma, 0);
    assert.equal(c.esperadoDatafono.cantidad, 0);
});

test('doble-cierre idempotente devuelve los campos de voucher (no vacíos en el reintento)', async () => {
    const T = await nuevoTurno('Tdbl');
    await crearPedidoCore(db, { pedidoId: 'tdb1', pieceId: 'ver1', medio: 'datafono', autor: 'kary' });
    const c1 = await cerrarTurnoCore(db, { turnoId: T, conteoPorMedio: { efectivo: 0, datafono: { suma: 1000000, cantidad: 1 } }, autor: 'kary' });
    const c2 = await cerrarTurnoCore(db, { turnoId: T, conteoPorMedio: { efectivo: 0, datafono: { suma: 1000000, cantidad: 1 } }, autor: 'kary' });
    assert.equal(c2.yaExistia, true);
    assert.deepEqual(c2.esperadoDatafono, c1.esperadoDatafono);
    assert.deepEqual(c2.descuadreDatafono, c1.descuadreDatafono);
});

test('datáfono ANULADO en el turno: sale del esperado (suma+cantidad) y aparece en datafonoAnuladoEnTurno', async () => {
    const T = await nuevoTurno('Tanul');
    await crearPedidoCore(db, { pedidoId: 'ta1', pieceId: 'ver1', medio: 'datafono', autor: 'kary' });   // vive
    await crearPedidoCore(db, { pedidoId: 'ta2', pieceId: 'ver1', medio: 'datafono', autor: 'kary' });   // se anula
    await anularPedidoCore(db, { pedidoId: 'ta2', motivo: 'reversado en terminal', autor: 'kary' });
    const c = await cerrarTurnoCore(db, { turnoId: T, conteoPorMedio: { efectivo: 0, datafono: { suma: 1000000, cantidad: 1 } }, autor: 'kary' });
    assert.equal(c.esperadoDatafono.cantidad, 1);              // solo la viva cuenta
    assert.equal(c.esperadoDatafono.suma, 1000000);
    assert.equal(c.datafonoAnuladoEnTurno.cantidad, 1);        // la anulada queda EXPUESTA (legibilidad)
    assert.equal(c.datafonoAnuladoEnTurno.suma, 1000000);
});

test('turno mixto efectivo+datáfono: cantidad datáfono excluye las ventas en efectivo', async () => {
    const T = await nuevoTurno('Tmix');
    await crearPedidoCore(db, { pedidoId: 'tm1', pieceId: 'ver1', medio: 'efectivo', autor: 'kary' });   // efectivo
    await crearPedidoCore(db, { pedidoId: 'tm2', pieceId: 'ver1', medio: 'datafono', autor: 'kary' });   // datáfono
    const c = await cerrarTurnoCore(db, { turnoId: T, conteoPorMedio: { efectivo: 1000000, datafono: { suma: 1000000, cantidad: 1 } }, autor: 'kary' });
    assert.equal(c.esperadoDatafono.cantidad, 1);              // NO 2
    assert.equal(c.esperadoEfectivo, 1000000);                // solo la venta en efectivo
});

test('arqueo split-aware: pago dividido asigna a cada medio; voucher datáfono cuenta 1 pago', async () => {
    const T = await nuevoTurno('Tsplit');
    await crearPedidoCore(db, { pedidoId: 'ts1', pieceId: 'mix1', autor: 'kary', pagos: [{ medio: 'datafono', monto: 600000 }, { medio: 'efectivo', monto: 400000 }] });
    const c = await cerrarTurnoCore(db, { turnoId: T, conteoPorMedio: { efectivo: 400000, datafono: { suma: 600000, cantidad: 1 } }, autor: 'kary' });
    assert.equal(c.esperadoEfectivo, 400000);                 // solo la porción efectivo del split
    assert.equal(c.esperadoDatafono.suma, 600000);            // solo la porción datáfono
    assert.equal(c.esperadoDatafono.cantidad, 1);             // 1 pago datáfono (no 1 pedido con 2 pagos → sigue 1 voucher)
    assert.equal(c.descuadreDatafono.suma, 0);
});
