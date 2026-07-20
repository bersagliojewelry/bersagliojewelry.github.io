/**
 * Integración de F-TESORERÍA (B0) contra el emulador Firestore.
 *   firebase emulators:exec --only firestore --project demo-bersaglio "node --test functions/tesoreria.integration.test.mjs"
 *   (o: FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node --test functions/tesoreria.integration.test.mjs)
 *
 * B0 = fundación técnica: verifica el SEED ESTRUCTURAL de las 2 cuentas virtuales (§0.8 V21).
 * Escenario (R2): (1) el seed crea Caja + Bóveda con la forma correcta; (2) es IDEMPOTENTE
 * (re-correr no duplica ni pisa). Escribe vía firebase-admin (bypassa reglas, = la CF).
 */
import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import core from './tesoreria-core.js';
const { seedCuentasVirtuales, TIPOS_VIRTUALES } = core;

initializeApp({ projectId: 'demo-bersaglio' });
const db = getFirestore();

async function limpiarCuentas() {
    const snap = await db.collection('cuentasTesoreria').get();
    await Promise.all(snap.docs.map((d) => d.ref.delete()));
}

before(limpiarCuentas);
beforeEach(limpiarCuentas);

test('seed · crea las 2 cuentas virtuales (Caja + Bóveda) con la forma de D1', async () => {
    const r = await seedCuentasVirtuales(db);
    assert.deepEqual(r.creadas.sort(), ['boveda', 'caja']);

    const caja = (await db.doc('cuentasTesoreria/caja').get()).data();
    const boveda = (await db.doc('cuentasTesoreria/boveda').get()).data();
    for (const [id, c] of [['caja', caja], ['boveda', boveda]]) {
        assert.ok(c, `${id} existe`);
        assert.ok(TIPOS_VIRTUALES.includes(c.tipo), `${id}.tipo es virtual`);
        assert.equal(c.tipo, id);
        assert.equal(c.activa, true);
        assert.equal(c.esDeSocia, false);
        assert.equal(c.titular, 'empresa');
        assert.ok(c.creadoEn, 'creadoEn sellado por el servidor');
        // D1: las virtuales NO llevan saldos propios (la vista consolidada LEE su módulo).
        assert.equal('saldoInicial' in c, false, `${id} sin saldoInicial`);
        assert.equal('fechaCorte' in c, false, `${id} sin fechaCorte`);
        assert.equal('saldoActual' in c, false, `${id} sin saldoActual`);
    }
});

test('seed · IDEMPOTENTE: re-correr no crea nada nuevo ni pisa lo existente', async () => {
    const first = await seedCuentasVirtuales(db);
    assert.equal(first.creadas.length, 2);
    // Marca un campo para probar que el 2º seed NO lo sobrescribe.
    await db.doc('cuentasTesoreria/caja').set({ nombre: 'Renombrada por Kary' }, { merge: true });

    const second = await seedCuentasVirtuales(db);
    assert.deepEqual(second.creadas, []);   // nada nuevo

    const total = (await db.collection('cuentasTesoreria').get()).size;
    assert.equal(total, 2);                 // no duplicó
    const caja = (await db.doc('cuentasTesoreria/caja').get()).data();
    assert.equal(caja.nombre, 'Renombrada por Kary');   // no pisó el cambio del usuario
});
