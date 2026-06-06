/**
 * Integración del trigger recalcSaldoCliente (CRM Bloque 2) contra los emuladores.
 *   firebase emulators:exec --only firestore,functions --project demo-bersaglio \
 *     "node --test functions/saldo.integration.test.mjs"
 *   (o: npm run test:saldo:integration)
 *
 * Verifica END-TO-END lo que el unit test puro NO puede: que el trigger dispare,
 * que la transacción con lectura de colección funcione, y que `saldoActual` cuadre
 * tras create/anular(update)/delete. Escribe vía firebase-admin (bypassa reglas).
 */
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// emulators:exec exporta FIRESTORE_EMULATOR_HOST → admin se conecta solo.
initializeApp({ projectId: 'demo-bersaglio' });
const db = getFirestore();

const CLI = 'cliInt';
const cliRef = db.collection('clientes').doc(CLI);
const movs = cliRef.collection('movimientos');

// Espera (poll) a que el trigger async deje el saldo esperado.
async function waitForSaldo(expected, timeoutMs = 15000) {
    const start = Date.now();
    let last;
    while (Date.now() - start < timeoutMs) {
        const snap = await cliRef.get();
        last = snap.exists ? snap.data().saldoActual : undefined;
        if (last === expected) return last;
        await new Promise((r) => setTimeout(r, 250));
    }
    throw new Error(`timeout: saldoActual=${last}, esperado=${expected}`);
}

before(async () => {
    await cliRef.set({ nombre: 'Integración', vendedoraUid: 'vendUid' });
});

test('integración · factura → saldo 100000', async () => {
    await movs.doc('f1').set({ tipo: 'factura', monto: 100000, registradoPor: 'vendUid' });
    assert.equal(await waitForSaldo(100000), 100000);
});

test('integración · abono → saldo 60000', async () => {
    await movs.doc('a1').set({ tipo: 'abono', monto: 40000, registradoPor: 'vendUid' });
    assert.equal(await waitForSaldo(60000), 60000);
});

test('integración · apertura negativa (saldo a favor) → saldo 50000', async () => {
    await movs.doc('ap1').set({ tipo: 'apertura', monto: -10000, registradoPor: 'adminUid' });
    assert.equal(await waitForSaldo(50000), 50000);
});

test('integración · anular la factura (update) → saldo -50000', async () => {
    await movs.doc('f1').set({ anulado: true }, { merge: true });
    assert.equal(await waitForSaldo(-50000), -50000);
});

test('integración · borrar el abono (delete) → saldo -10000', async () => {
    await movs.doc('a1').delete();
    assert.equal(await waitForSaldo(-10000), -10000);
});
