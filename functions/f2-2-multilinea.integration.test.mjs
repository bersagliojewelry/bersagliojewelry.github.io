/**
 * F2.2 · Facturación multi-línea — integración de `crearPedidoCore` con `lineasExtra`.
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node --test functions/f2-2-multilinea.integration.test.mjs
 *   (aislado: firebase emulators:exec --only firestore --project demo-bersaglio "node --test ...")
 *
 * SSoT del diseño: docs/superpowers/specs/2026-07-07-f2-2-facturacion-multilinea-DISENO.md (§8).
 * Verifica los INVARIANTES DE DINERO del comité (§8.1): items[]=SSoT, total recalculado
 * server-side, precio de servicio LEÍDO del catálogo (nunca del cliente), guardas de línea
 * libre, caps, snapshot auto-contenido, servicios NO tocan stock, idempotencia + fingerprint,
 * no-regresión byte-comportamiento sin lineasExtra. Escribe vía firebase-admin (= la CF).
 */
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import core from './pedidos-core.js';
const { crearPedidoCore, anularPedidoCore, cierreCajaCore } = core;

initializeApp({ projectId: 'demo-bersaglio' });
const db = getFirestore();

const sleep = ms => new Promise(r => setTimeout(r, ms));

before(async () => {
    await db.doc('contadores/pedidos').delete().catch(() => {});
    // Catálogo de servicios (F2.2): activos + uno inactivo.
    await db.doc('servicios/srvGrab').set({ codigo: 'GRAB', nombre: 'Grabado láser', precio: 20000, activo: true, naturaleza: 'servicio' });
    await db.doc('servicios/srvTalla').set({ codigo: 'TALLA', nombre: 'Ajuste de talla', precio: 35000, activo: true, naturaleza: 'servicio' });
    await db.doc('servicios/srvInactivo').set({ codigo: 'OLD', nombre: 'Servicio retirado', precio: 9999, activo: false, naturaleza: 'servicio' });
    // Config de caja con los topes de F2.2 (el core los lee en la tx del POS).
    await db.doc('config/caja').set({ enforceTurno: false, topeLineaLibre: 2000000, topeExtrasTotal: 10000000, umbralRevisionLibre: 500000 });
    // Piezas de prueba (precio fijo → total predecible; una por test para no acoplar stock).
    for (const id of ['fpieza', 'fserv', 'fnoconf', 'finact', 'fnoexist', 'flibre', 'fguard', 'fmulti', 'fcaps', 'fidem', 'ffp', 'fstock', 'farqueo', 'fweb', 'fanul', 'fcant']) {
        await db.doc(`pieces/${id}`).set({ name: `Pieza ${id}`, slug: id, price: 1000000, stockType: 'finito', cantidad: 1 });
    }
    await db.doc('pieces/fstockLote').set({ name: 'Lote', slug: 'flote', price: 1000000, stockType: 'finito', cantidad: 5 });
    // `fcant` con stock de sobra: una venta OK + dos rechazos por cantidad (que NO consumen) sobre la misma pieza.
    await db.doc('pieces/fcant').set({ name: 'Pieza fcant', slug: 'fcant', price: 1000000, stockType: 'finito', cantidad: 5 });
});

// ── §8.1.11 · NO-REGRESIÓN: sin lineasExtra = comportamiento idéntico ──────────────
test('sin lineasExtra: venta idéntica (1 línea pieza, total=precio, lineId L0, naturaleza bien)', async () => {
    const r = await crearPedidoCore(db, { pedidoId: 'p-noextra', pieceId: 'fpieza', medio: 'efectivo', autor: 'u1' });
    assert.equal(r.total, 1000000);
    assert.equal(r.estado, 'entregado');                        // ruta corta F1-CORE (efectivo mostrador)
    const ped = (await db.doc('pedidos/p-noextra').get()).data();
    assert.equal(ped.total, 1000000);
    assert.equal(ped.items.length, 1);
    assert.equal(ped.items[0].tipo, 'pieza');
    assert.equal(ped.items[0].lineId, 'L0');
    assert.equal(ped.items[0].precio, 1000000);
    assert.equal(ped.items[0].naturaleza, 'bien');
    assert.equal(ped.desglose.total, 1000000);                  // desglose = subtotal de la pieza
    assert.equal((await db.doc('pieces/fpieza').get()).data().cantidad, 0);   // bajó stock igual
});

// ── §8.1.3 · Servicio del catálogo: precio LEÍDO del server ────────────────────────
test('servicio del catálogo: total = pieza + precio del catálogo; snapshot auto-contenido', async () => {
    const r = await crearPedidoCore(db, {
        pedidoId: 'p-serv', pieceId: 'fserv', medio: 'efectivo', autor: 'u1',
        lineasExtra: [{ tipo: 'servicio', servicioId: 'srvGrab' }],
    });
    assert.equal(r.total, 1020000);                             // 1.000.000 + 20.000
    const ped = (await db.doc('pedidos/p-serv').get()).data();
    assert.equal(ped.items.length, 2);
    const s = ped.items[1];
    assert.equal(s.tipo, 'servicio');
    assert.equal(s.lineId, 'L1');
    assert.equal(s.servicioId, 'srvGrab');
    assert.equal(s.codigo, 'GRAB');                             // §8.1.7: congela identidad del catálogo
    assert.equal(s.nombre, 'Grabado láser');
    assert.equal(s.precio, 20000);
    assert.equal(s.naturaleza, 'servicio');
    assert.equal(ped.desglose.total, 1000000);                  // desglose sigue siendo el de la pieza
});

test('servicio: el precio del CLIENTE se IGNORA (se lee del catálogo, cero confianza)', async () => {
    const r = await crearPedidoCore(db, {
        pedidoId: 'p-noconf', pieceId: 'fnoconf', medio: 'efectivo', autor: 'u1',
        lineasExtra: [{ tipo: 'servicio', servicioId: 'srvGrab', precio: 1 }],   // intenta cobrar $1
    });
    assert.equal(r.total, 1020000);                             // usó 20.000 del catálogo, no el $1 del cliente
});

test('servicio INACTIVO → falla cerrado (nunca omite ni $0)', async () => {
    await assert.rejects(
        crearPedidoCore(db, { pedidoId: 'p-inact', pieceId: 'finact', medio: 'efectivo', autor: 'u1', lineasExtra: [{ tipo: 'servicio', servicioId: 'srvInactivo' }] }),
        /servicio/i,
    );
    assert.equal((await db.doc('pedidos/p-inact').get()).exists, false);   // no nació el pedido
    assert.equal((await db.doc('pieces/finact').get()).data().cantidad, 1); // no tocó stock
});

test('servicio INEXISTENTE → falla cerrado', async () => {
    await assert.rejects(
        crearPedidoCore(db, { pedidoId: 'p-noexist', pieceId: 'fnoexist', medio: 'efectivo', autor: 'u1', lineasExtra: [{ tipo: 'servicio', servicioId: 'nope' }] }),
        /servicio/i,
    );
});

// ── §8.1.4 · Línea libre: precio del cliente CON guardas ───────────────────────────
test('línea libre OK: concepto saneado + precio del cliente + audit (addedBy)', async () => {
    const r = await crearPedidoCore(db, {
        pedidoId: 'p-libre', pieceId: 'flibre', medio: 'efectivo', autor: 'kary',
        lineasExtra: [{ tipo: 'libre', concepto: '  Reparación   especial  ', precio: 80000 }],
    });
    assert.equal(r.total, 1080000);
    const l = (await db.doc('pedidos/p-libre').get()).data().items[1];
    assert.equal(l.tipo, 'libre');
    assert.equal(l.concepto, 'Reparación especial');           // colapsa espacios, recorta
    assert.equal(l.precio, 80000);
    assert.equal(l.naturaleza, 'servicio');                    // default
    assert.equal(l.addedBy, 'kary');                           // §8.2: auditoría de la línea libre
});

test('línea libre: guardas rechazan 0 / negativo / float / vacío / sobre-tope', async () => {
    const base = { pieceId: 'fguard', medio: 'efectivo', autor: 'u1' };
    await assert.rejects(crearPedidoCore(db, { ...base, pedidoId: 'g1', lineasExtra: [{ tipo: 'libre', concepto: 'x', precio: 0 }] }), /libre|precio/i);
    await assert.rejects(crearPedidoCore(db, { ...base, pedidoId: 'g2', lineasExtra: [{ tipo: 'libre', concepto: 'x', precio: -5 }] }), /libre|precio/i);
    await assert.rejects(crearPedidoCore(db, { ...base, pedidoId: 'g3', lineasExtra: [{ tipo: 'libre', concepto: 'x', precio: 1.5 }] }), /libre|precio/i);
    await assert.rejects(crearPedidoCore(db, { ...base, pedidoId: 'g4', lineasExtra: [{ tipo: 'libre', concepto: '   ', precio: 100 }] }), /concepto/i);
    await assert.rejects(crearPedidoCore(db, { ...base, pedidoId: 'g5', lineasExtra: [{ tipo: 'libre', concepto: 'x', precio: 2000001 }] }), /tope|máx|max/i);
    assert.equal((await db.doc('pieces/fguard').get()).data().cantidad, 1);   // ningún intento tocó stock
});

test('cantidad: servicio ×3 suma 3× ; cantidad 0 o sobre-tope → rechaza', async () => {
    const r = await crearPedidoCore(db, { pedidoId: 'p-cant', pieceId: 'fcant', medio: 'efectivo', autor: 'u1', lineasExtra: [{ tipo: 'servicio', servicioId: 'srvGrab', cantidad: 3 }] });
    assert.equal(r.total, 1060000);                             // 1.000.000 + 20.000×3
    await assert.rejects(crearPedidoCore(db, { pedidoId: 'c0', pieceId: 'fcant', medio: 'efectivo', autor: 'u1', lineasExtra: [{ tipo: 'servicio', servicioId: 'srvGrab', cantidad: 0 }] }), /cantidad/i);
    await assert.rejects(crearPedidoCore(db, { pedidoId: 'c99', pieceId: 'fcant', medio: 'efectivo', autor: 'u1', lineasExtra: [{ tipo: 'servicio', servicioId: 'srvGrab', cantidad: 999 }] }), /cantidad/i);
});

// ── §8.1.1 · total = pieza + Σ(extras), items[] = SSoT ─────────────────────────────
test('multi-línea: total = pieza + servicio + libre×2; items[] cuadra', async () => {
    const r = await crearPedidoCore(db, {
        pedidoId: 'p-multi', pieceId: 'fmulti', medio: 'efectivo', autor: 'u1',
        lineasExtra: [
            { tipo: 'servicio', servicioId: 'srvGrab' },              // 20.000
            { tipo: 'libre', concepto: 'Piedra extra', precio: 80000, cantidad: 2 },  // 160.000
        ],
    });
    assert.equal(r.total, 1180000);                             // 1.000.000 + 20.000 + 160.000
    const ped = (await db.doc('pedidos/p-multi').get()).data();
    assert.equal(ped.items.length, 3);
    const suma = ped.items.reduce((a, it) => a + it.precio * it.cantidad, 0);
    assert.equal(suma, ped.total);                              // §8.1.1: items[] = SSoT del total
    assert.deepEqual(ped.items.map(i => i.lineId), ['L0', 'L1', 'L2']);   // §8.1.8: lineId estable
});

// ── §8.1.5 · Caps: nº de líneas + suma de extras ───────────────────────────────────
test('caps: > 20 líneas → rechaza; suma de extras sobre-tope → rechaza', async () => {
    const muchas = Array.from({ length: 21 }, () => ({ tipo: 'servicio', servicioId: 'srvGrab' }));
    await assert.rejects(crearPedidoCore(db, { pedidoId: 'cap1', pieceId: 'fcaps', medio: 'efectivo', autor: 'u1', lineasExtra: muchas }), /línea|lineas|20/i);
    // suma de extras > topeExtrasTotal (10M): 6 líneas libres de 1.8M = 10.8M
    const caras = Array.from({ length: 6 }, () => ({ tipo: 'libre', concepto: 'trabajo', precio: 1800000 }));
    await assert.rejects(crearPedidoCore(db, { pedidoId: 'cap2', pieceId: 'fcaps', medio: 'efectivo', autor: 'u1', lineasExtra: caras }), /suma|tope|total/i);
    assert.equal((await db.doc('pieces/fcaps').get()).data().cantidad, 1);   // no tocó stock
});

// ── §8.1.6 · Idempotencia + fingerprint ────────────────────────────────────────────
test('idempotente con líneas: mismo payload → mismo pedido, sin re-decrementar stock', async () => {
    const input = { pedidoId: 'p-idem', pieceId: 'fidem', medio: 'efectivo', autor: 'u1', lineasExtra: [{ tipo: 'servicio', servicioId: 'srvGrab' }] };
    const r1 = await crearPedidoCore(db, input);
    assert.equal(r1.total, 1020000);
    assert.equal((await db.doc('pieces/fidem').get()).data().cantidad, 0);
    const r2 = await crearPedidoCore(db, input);                // reintento idéntico
    assert.equal(r2.yaExistia, true);
    assert.equal(r2.total, 1020000);
    assert.equal(r2.fingerprintDivergente ?? false, false);
    assert.equal((await db.doc('pieces/fidem').get()).data().cantidad, 0);   // NO volvió a bajar
});

test('fingerprint divergente: mismo pedidoId + payload distinto → marca, no re-cobra', async () => {
    await crearPedidoCore(db, { pedidoId: 'p-fp', pieceId: 'ffp', medio: 'efectivo', autor: 'u1', lineasExtra: [{ tipo: 'servicio', servicioId: 'srvGrab' }] });
    const r = await crearPedidoCore(db, { pedidoId: 'p-fp', pieceId: 'ffp', medio: 'efectivo', autor: 'u1', lineasExtra: [{ tipo: 'servicio', servicioId: 'srvTalla' }] });
    assert.equal(r.yaExistia, true);
    assert.equal(r.fingerprintDivergente, true);
    assert.equal(r.total, 1020000);                             // el ORIGINAL (GRAB), no el nuevo (TALLA)
});

// ── §8.1.10 · Servicios NO tocan stock ─────────────────────────────────────────────
test('servicios NO tocan stock: solo la pieza decrementa; sin asiento de ledger por servicio', async () => {
    await crearPedidoCore(db, { pedidoId: 'p-stock', pieceId: 'fstock', medio: 'efectivo', autor: 'u1', lineasExtra: [{ tipo: 'servicio', servicioId: 'srvGrab' }, { tipo: 'servicio', servicioId: 'srvTalla' }] });
    const pz = (await db.doc('pieces/fstock').get()).data();
    assert.equal(pz.cantidad, 0);                               // solo bajó 1 por la PIEZA (no 3)
    assert.equal((await db.doc('pedidos/p-stock').get()).data().consumioStock, true);
});

// ── canal mostrador-only ────────────────────────────────────────────────────────────
test('lineasExtra en canal != pos → rechaza (facturación multi-línea es del mostrador)', async () => {
    await assert.rejects(
        crearPedidoCore(db, { pedidoId: 'p-web', pieceId: 'fweb', canal: 'web', medio: 'efectivo', autor: 'u1', lineasExtra: [{ tipo: 'servicio', servicioId: 'srvGrab' }] }),
        /mostrador|pos|canal/i,
    );
});

// ── §8.1.9 · Anular revierte el total completo (pieza + servicios) ─────────────────
test('anular revierte total completo: repone pieza; snapshot conserva el total con servicios', async () => {
    await crearPedidoCore(db, { pedidoId: 'p-anul', pieceId: 'fanul', medio: 'efectivo', autor: 'u1', lineasExtra: [{ tipo: 'servicio', servicioId: 'srvGrab' }] });
    const r = await anularPedidoCore(db, { pedidoId: 'p-anul', motivo: 'prueba', autor: 'kary' });
    assert.equal(r.piezaReintegrada, true);
    const ped = (await db.doc('pedidos/p-anul').get()).data();
    assert.equal(ped.estado, 'anulado');
    assert.equal(ped.total, 1020000);                          // snapshot completo intacto
    assert.equal((await db.doc('pieces/fanul').get()).data().cantidad, 1);   // pieza repuesta
});

// ── Arqueo: el total con servicios entra al turno ──────────────────────────────────
test('arqueo del turno suma el total CON servicios', async () => {
    await cierreCajaCore(db, { arqueoId: 'arqBaseF22', declaradoEfectivo: 0, autor: 'kary' });   // baseline
    await sleep(20);
    await crearPedidoCore(db, { pedidoId: 'p-arqueo', pieceId: 'farqueo', medio: 'efectivo', autor: 'u1', lineasExtra: [{ tipo: 'servicio', servicioId: 'srvTalla' }] });  // 1.035.000
    await sleep(20);
    const c = await cierreCajaCore(db, { arqueoId: 'arqF22', declaradoEfectivo: 1035000, autor: 'kary' });
    assert.equal(c.esperadoEfectivo, 1035000);                 // pieza (1.000.000) + servicio (35.000)
    assert.equal(c.descuadre, 0);
});
