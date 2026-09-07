/**
 * Integración de los CORES de identidad (F2.1) contra el emulador de Firestore.
 *   firebase emulators:exec --only firestore --project demo-bersaglio \
 *     "node --test functions/identidad.integration.test.mjs"
 *   (o: npm run test:identidad:integration)
 *
 * Verifica END-TO-END lo que el unit test puro NO puede: las transacciones del índice de
 * reserva (crear/attach/colisión), el vínculo del pedido con traza, y la fusión append-only.
 * Escribe vía firebase-admin (bypassa reglas — las reglas se prueban en tests/firestore-rules).
 */
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const require = createRequire(import.meta.url);
const {
    resolverClienteCore, crearClienteConDocCore, attachDocAClienteCore,
    vincularClientePedidoCore, fusionarClientesCore,
} = require('./identidad-cf.js');
const { docKeyAndHash } = require('./identidad-core.js');

initializeApp({ projectId: 'demo-bersaglio' });
const db = getFirestore();
const PEPPER = 'test-pepper-integracion';
const consent = { granted: true, method: 'presencial', policyVersion: 'v1' };

before(async () => {
    // Limpiar colecciones tocadas (por si el emulador persistió de una corrida previa).
    for (const col of ['clientes', 'clientesPorDoc', 'pedidos']) {
        const snap = await db.collection(col).get();
        await Promise.all(snap.docs.map((d) => d.ref.delete()));
    }
});

test('crear SIN documento → cliente con nombre+teléfono, sin índice', async () => {
    const r = await crearClienteConDocCore(db, { nombre: 'Doña Marta', telefono: '3001112233', autor: 'kary' }, PEPPER);
    assert.equal(r.yaExistia, false);
    const c = (await db.collection('clientes').doc(r.clienteId).get()).data();
    assert.equal(c.nombre, 'Doña Marta');
    assert.equal(c.legalIdKey, undefined);          // sin doc → sin clave
    assert.equal(c.contacto.contactVerified, false); // reserva F5 sembrada
    assert.equal(c.authUid, null);
});

test('crear CON documento + consent → cliente + índice reservado', async () => {
    const r = await crearClienteConDocCore(db, {
        nombre: 'Ana María Gómez', telefono: '3009998877', docType: 'CC', docNumber: '1.032.456.789', consent, autor: 'kary',
    }, PEPPER);
    assert.equal(r.yaExistia, false);
    const c = (await db.collection('clientes').doc(r.clienteId).get()).data();
    assert.equal(c.legalIdKey, 'CC:1032456789');
    assert.deepEqual(c.docKeys, ['CC:1032456789']);
    const { docHash } = docKeyAndHash('CC', '1032456789', PEPPER);
    const idx = (await db.doc(`clientesPorDoc/${docHash}`).get()).data();
    assert.equal(idx.clienteId, r.clienteId);
    assert.equal(idx.consent.granted, true);
});

test('crear CON documento SIN consent → rechaza (Habeas Data)', async () => {
    await assert.rejects(
        () => crearClienteConDocCore(db, { nombre: 'X', docType: 'CC', docNumber: '999', autor: 'kary' }, PEPPER),
        /Habeas Data/,
    );
});

test('resolver por documento → encuentra el match exacto', async () => {
    const r = await resolverClienteCore(db, { docType: 'CC', docNumber: '1032456789' }, PEPPER);
    assert.ok(r.match);
    assert.equal(r.match.nombre, 'Ana María Gómez');
});

test('resolver documento inexistente → sin match', async () => {
    const r = await resolverClienteCore(db, { docType: 'CC', docNumber: '77777777' }, PEPPER);
    assert.equal(r.match, null);
    assert.equal(r.legalIdKey, 'CC:77777777');
});

test('crear con el MISMO documento → colisión devuelve el existente (no duplica)', async () => {
    const antes = (await db.collection('clientes').get()).size;
    const r = await crearClienteConDocCore(db, {
        nombre: 'Ana (otra vez)', docType: 'CC', docNumber: '1032456789', consent, autor: 'kary',
    }, PEPPER);
    assert.equal(r.yaExistia, true);
    const despues = (await db.collection('clientes').get()).size;
    assert.equal(despues, antes, 'no debe crear un cliente nuevo en colisión');
});

test('attach documento a un cliente SIN doc → lo reserva', async () => {
    const marta = (await db.collection('clientes').where('nombre', '==', 'Doña Marta').get()).docs[0];
    const r = await attachDocAClienteCore(db, {
        clienteId: marta.id, docType: 'CC', docNumber: '52.111.222', consent, autor: 'kary',
    }, PEPPER);
    assert.equal(r.attached, true);
    const c = (await marta.ref.get()).data();
    assert.equal(c.legalIdKey, 'CC:52111222');
    assert.ok(c.docKeys.includes('CC:52111222'));
});

test('attach documento que YA es de OTRO cliente → needsMerge', async () => {
    const marta = (await db.collection('clientes').where('nombre', '==', 'Doña Marta').get()).docs[0];
    // 1032456789 es de Ana → adjuntarlo a Marta debe pedir fusión, no romper.
    const r = await attachDocAClienteCore(db, {
        clienteId: marta.id, docType: 'CC', docNumber: '1032456789', consent, autor: 'kary',
    }, PEPPER);
    assert.equal(r.needsMerge, true);
    assert.ok(r.otherClienteId);
});

test('attach idempotente (mismo cliente, mismo doc) → yaExistia', async () => {
    const marta = (await db.collection('clientes').where('nombre', '==', 'Doña Marta').get()).docs[0];
    const r = await attachDocAClienteCore(db, {
        clienteId: marta.id, docType: 'CC', docNumber: '52111222', consent, autor: 'kary',
    }, PEPPER);
    assert.equal(r.yaExistia, true);
});

test('vincular pedido → escribe clienteId + traza en historial', async () => {
    const ana = (await db.collection('clientes').where('nombre', '==', 'Ana María Gómez').get()).docs[0];
    await db.collection('pedidos').doc('ped1').set({ codigo: 'BJ-0001-0001', total: 500000, clienteId: null, estado: 'pagado' });
    const r = await vincularClientePedidoCore(db, { pedidoId: 'ped1', clienteId: ana.id, autor: 'kary' }, { nowMs: Date.parse('2026-07-07T15:00:00Z') });
    assert.equal(r.clienteId, ana.id);
    assert.equal(r.previo, null);
    const ped = (await db.collection('pedidos').doc('ped1').get()).data();
    assert.equal(ped.clienteId, ana.id);
    const hist = await db.collection('pedidos').doc('ped1').collection('historial').get();
    assert.equal(hist.size, 1);
    assert.equal(hist.docs[0].data().tipo, 'vinculo_cliente');
    assert.equal(hist.docs[0].data().dayKey, '2026-07-07');   // 15:00Z = 10:00 Bogotá → mismo día
});

test('re-vincular pedido a otro cliente → asiento nuevo, previo registrado', async () => {
    const marta = (await db.collection('clientes').where('nombre', '==', 'Doña Marta').get()).docs[0];
    const ana = (await db.collection('clientes').where('nombre', '==', 'Ana María Gómez').get()).docs[0];
    const r = await vincularClientePedidoCore(db, { pedidoId: 'ped1', clienteId: marta.id, autor: 'kary' });
    assert.equal(r.previo, ana.id);
    const hist = await db.collection('pedidos').doc('ped1').collection('historial').get();
    assert.equal(hist.size, 2);   // append-only: no borra el anterior
});

test('vincular idempotente → yaVinculado, sin asiento nuevo', async () => {
    const marta = (await db.collection('clientes').where('nombre', '==', 'Doña Marta').get()).docs[0];
    const r = await vincularClientePedidoCore(db, { pedidoId: 'ped1', clienteId: marta.id, autor: 'kary' });
    assert.equal(r.yaVinculado, true);
    const hist = await db.collection('pedidos').doc('ped1').collection('historial').get();
    assert.equal(hist.size, 2);   // no creció
});

test('fusionar clientes SIN cartera → re-apunta pedidos + índice + docKeys, absorbido inactivo', async () => {
    // from = un cliente nuevo con doc y un pedido; into = Ana.
    const from = await crearClienteConDocCore(db, { nombre: 'Ana M.', docType: 'CC', docNumber: '1099887766', consent, autor: 'kary' }, PEPPER);
    const ana = (await db.collection('clientes').where('nombre', '==', 'Ana María Gómez').get()).docs[0];
    await db.collection('pedidos').doc('ped2').set({ codigo: 'BJ-0002-0002', total: 200000, clienteId: from.clienteId, estado: 'pagado' });

    const r = await fusionarClientesCore(db, { fromId: from.clienteId, intoId: ana.id, autor: 'daniel' });
    assert.equal(r.pedidosMovidos, 1);
    assert.equal(r.docsMovidos, 1);
    // pedido re-apuntado
    assert.equal((await db.collection('pedidos').doc('ped2').get()).data().clienteId, ana.id);
    // índice re-mapeado
    const { docHash } = docKeyAndHash('CC', '1099887766', PEPPER);
    assert.equal((await db.doc(`clientesPorDoc/${docHash}`).get()).data().clienteId, ana.id);
    // docKeys unidas en Ana
    assert.ok((await ana.ref.get()).data().docKeys.includes('CC:1099887766'));
    // absorbido inactivo (anular≠borrar)
    const fromC = (await db.collection('clientes').doc(from.clienteId).get()).data();
    assert.equal(fromC.activo, false);
    assert.equal(fromC.fusionadoEn.intoId, ana.id);
});

test('fusionar con cartera en el absorbido → needsCarteraMerge (no pierde plata)', async () => {
    const from = await crearClienteConDocCore(db, { nombre: 'Con saldo', telefono: '3005550000', autor: 'kary' }, PEPPER);
    await db.collection('clientes').doc(from.clienteId).collection('movimientos').doc('m1').set({ tipo: 'factura', monto: 100000, anulado: false });
    const ana = (await db.collection('clientes').where('nombre', '==', 'Ana María Gómez').get()).docs[0];
    const r = await fusionarClientesCore(db, { fromId: from.clienteId, intoId: ana.id, autor: 'daniel' });
    assert.equal(r.needsCarteraMerge, true);
    // el absorbido sigue ACTIVO (no se tocó)
    assert.equal((await db.collection('clientes').doc(from.clienteId).get()).data().activo, true);
});
