/**
 * Integración de inventario-core (TODO-40 · F1 · B3b) contra el emulador Firestore.
 *   firebase emulators:exec --only firestore --project demo-bersaglio "node --test functions/inventario.integration.test.mjs"
 *
 * ajustarStock (merma/reabasto/corrección) + cambiarTipoPieza (transición con purga D6). Escribe vía
 * firebase-admin (bypassa reglas, = la CF). Verifica candado, no-negatividad, idempotencia y ledger.
 */
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import inv from './inventario-core.js';
const { ajustarStockCore, cambiarTipoPiezaCore } = inv;

initializeApp({ projectId: 'demo-bersaglio' });
const db = getFirestore();

before(async () => {
    await db.doc('pieces/aj1').set({ name: 'Aj1', slug: 'aj1', stockType: 'finito', cantidad: 3, estado: 'disponible' });
    await db.doc('pieces/ajEnc').set({ name: 'AjEnc', slug: 'ajenc', stockType: 'encargo' });
    await db.doc('pieces/ct1').set({ name: 'Ct1', slug: 'ct1', stockType: 'finito', cantidad: 2, estado: 'disponible' });
    await db.doc('pieces/ct2').set({ name: 'Ct2', slug: 'ct2', stockType: 'encargo' });
});

// ─── ajustarStock ─────────────────────────────────────────────────────────────
test('ajustarStock REABASTO (+2): sube cantidad, estado disponible, ledger', async () => {
    const r = await ajustarStockCore(db, { ajusteId: 'a1', pieceId: 'aj1', delta: 2, motivo: 'reabasto', autor: 'kary' });
    assert.equal(r.cantidad, 5);
    const pz = (await db.doc('pieces/aj1').get()).data();
    assert.equal(pz.cantidad, 5);
    assert.equal(pz.estado, 'disponible');
    const mov = (await db.doc('pieces/aj1/movimientos/a1').get()).data();
    assert.equal(mov.delta, 2);
    assert.equal(mov.motivo, 'reabasto');
    assert.equal(mov.cantidadResultante, 5);
});

test('ajustarStock MERMA (-5 desde 5): a 0 → agotada', async () => {
    const r = await ajustarStockCore(db, { ajusteId: 'a2', pieceId: 'aj1', delta: -5, motivo: 'merma', autor: 'kary' });
    assert.equal(r.cantidad, 0);
    assert.equal((await db.doc('pieces/aj1').get()).data().estado, 'agotada');
});

test('ajustarStock NO deja cantidad negativa → rechaza', async () => {
    await assert.rejects(
        ajustarStockCore(db, { ajusteId: 'a3', pieceId: 'aj1', delta: -1, motivo: 'merma', autor: 'kary' }),
        /negativa/i,
    );
});

test('ajustarStock IDEMPOTENTE: mismo ajusteId → no re-aplica', async () => {
    const r = await ajustarStockCore(db, { ajusteId: 'a1', pieceId: 'aj1', delta: 999, motivo: 'reabasto', autor: 'kary' });
    assert.equal(r.yaExistia, true);
    assert.equal((await db.doc('pieces/aj1').get()).data().cantidad, 0);   // sigue en 0 (no sumó 999)
});

test('ajustarStock en ENCARGO → rechaza (no aplica)', async () => {
    await assert.rejects(
        ajustarStockCore(db, { ajusteId: 'a4', pieceId: 'ajEnc', delta: 1, motivo: 'reabasto', autor: 'kary' }),
        /encargo/i,
    );
});

test('ajustarStock motivo inválido / delta 0 → rechaza', async () => {
    await assert.rejects(ajustarStockCore(db, { ajusteId: 'a5', pieceId: 'aj1', delta: 1, motivo: 'porque_si', autor: 'k' }), /motivo/i);
    await assert.rejects(ajustarStockCore(db, { ajusteId: 'a6', pieceId: 'aj1', delta: 0, motivo: 'reabasto', autor: 'k' }), /entero/i);
});

// ─── cambiarTipoPieza (D6 purga) ──────────────────────────────────────────────
test('cambiarTipoPieza finito → encargo: PURGA cantidad (borra), estado disponible', async () => {
    const r = await cambiarTipoPiezaCore(db, { pieceId: 'ct1', nuevoStockType: 'encargo', autor: 'kary' });
    assert.equal(r.stockType, 'encargo');
    assert.equal(r.cantidad, null);
    const pz = (await db.doc('pieces/ct1').get()).data();
    assert.equal('cantidad' in pz, false);        // campo BORRADO (no null)
    assert.equal(pz.estado, 'disponible');
});

test('cambiarTipoPieza encargo → finito: fija cantidad (dada), estado derivado', async () => {
    const r = await cambiarTipoPiezaCore(db, { pieceId: 'ct2', nuevoStockType: 'finito', cantidad: 4, autor: 'kary' });
    assert.equal(r.cantidad, 4);
    const pz = (await db.doc('pieces/ct2').get()).data();
    assert.equal(pz.cantidad, 4);
    assert.equal(pz.estado, 'disponible');
});

test('cambiarTipoPieza nuevoStockType inválido → rechaza', async () => {
    await assert.rejects(
        cambiarTipoPiezaCore(db, { pieceId: 'ct2', nuevoStockType: 'infinito', autor: 'kary' }),
        /inválido|invalido/i,
    );
});
