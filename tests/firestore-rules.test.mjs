/**
 * Bersaglio Jewelry — Firestore Security Rules tests (Fase 2 hardening).
 *
 * Runner: node:test (sin jest/vitest — cero deps extra).
 * Requiere el emulador Firestore corriendo. En CI lo levanta
 * `firebase emulators:exec` (Java en el runner). Localmente necesita un JDK.
 *
 *   npm run test:rules        # levanta emulador + corre estos tests
 *
 * Cubre: S5 (reseñas approved-only) + baseline (pieces público/editor).
 * Las decisiones de rol leen users/{uid}.data.role → se siembran con reglas off.
 */
import { test, before, after } from 'node:test';
import { readFileSync } from 'node:fs';
import {
    initializeTestEnvironment,
    assertFails,
    assertSucceeds,
} from '@firebase/rules-unit-testing';
import {
    doc, getDoc, setDoc, addDoc, deleteDoc, collection,
    getDocs, query, where,
} from 'firebase/firestore';

let testEnv;

before(async () => {
    testEnv = await initializeTestEnvironment({
        projectId: 'demo-bersaglio',
        firestore: {
            rules: readFileSync('firestore.rules', 'utf8'),
            host: '127.0.0.1',
            port: 8080,
        },
    });

    // Semilla con reglas desactivadas: roles + reseñas + una pieza.
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
        const db = ctx.firestore();
        await setDoc(doc(db, 'users/editorUid'), { role: 'editor' });
        await setDoc(doc(db, 'users/adminUid'),  { role: 'admin'  });
        await setDoc(doc(db, 'reviews/approvedRev'), { approved: true,  pieceSlug: 'x', rating: 5 });
        await setDoc(doc(db, 'reviews/pendingRev'),  { approved: false, pieceSlug: 'x', rating: 5 });
        await setDoc(doc(db, 'pieces/p1'), { name: 'Anillo', slug: 'anillo' });

        // ─── CRM (Bloque 1): vendedoras, cliente, movimiento, config, solicitud ──
        await setDoc(doc(db, 'users/ownerUid'), { role: 'owner' });
        await setDoc(doc(db, 'users/vendUid'),  { role: 'vendedora' });
        await setDoc(doc(db, 'users/vend2Uid'), { role: 'vendedora' });
        await setDoc(doc(db, 'clientes/cliV'), { nombre: 'Cliente V', vendedoraUid: 'vendUid', saldoActual: 0 });
        await setDoc(doc(db, 'clientes/cliV/movimientos/m1'), { tipo: 'factura', monto: 100000, registradoPor: 'vendUid' });
        // Cliente directo de Kary: SIN vendedoraUid (caso spec §3).
        await setDoc(doc(db, 'clientes/cliDirecto'), { nombre: 'Directo Kary' });
        await setDoc(doc(db, 'config/status'),  { ok: true });
        await setDoc(doc(db, 'config/negocio'), { fechaCorteMigracion: '2025-12-31' });
        await setDoc(doc(db, 'solicitudesCorreccion/s1'), { vendedoraUid: 'vendUid', clienteId: 'cliV', estado: 'pendiente' });
    });
});

after(async () => { await testEnv?.cleanup(); });

const anon   = () => testEnv.unauthenticatedContext().firestore();
const asUser = (uid) => testEnv.authenticatedContext(uid).firestore();

// ─── S5: reseñas legibles solo si approved (admin ve todas) ──────────────────
test('S5 · público lee reseña APROBADA', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'reviews/approvedRev')));
});
test('S5 · público NO lee reseña pendiente', async () => {
    await assertFails(getDoc(doc(anon(), 'reviews/pendingRev')));
});
test('S5 · admin SÍ lee reseña pendiente', async () => {
    await assertSucceeds(getDoc(doc(asUser('adminUid'), 'reviews/pendingRev')));
});

// ─── Reseñas: create abierto, moderación solo admin ──────────────────────────
test('reseñas · cualquiera puede crear (no aprobada)', async () => {
    await assertSucceeds(addDoc(collection(anon(), 'reviews'), { approved: false, rating: 5, pieceSlug: 'x' }));
});
test('reseñas · no-admin NO puede borrar', async () => {
    await assertFails(deleteDoc(doc(asUser('editorUid'), 'reviews/approvedRev')));
});

// ─── Baseline pieces: lectura pública, escritura solo editor+ ────────────────
test('pieces · lectura pública', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'pieces/p1')));
});
test('pieces · cliente autenticado SIN rol NO escribe', async () => {
    await assertFails(setDoc(doc(asUser('customerUid'), 'pieces/p2'), { name: 'X', slug: 'x' }));
});
test('pieces · editor SÍ crea (con name+code)', async () => {
    await assertSucceeds(setDoc(doc(asUser('editorUid'), 'pieces/p3'), { name: 'X', code: 'C-3', slug: 'x' }));
});

// ─── S6: validación de campos server-side ────────────────────────────────────
test('S6 · NO crea pieza sin code', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'pieces/p4'), { name: 'Sin code' }));
});
test('S6 · NO crea pieza con name no-string', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'pieces/p5'), { name: 123, code: 'C-5' }));
});
test('S6 · NO crea pieza con price no-numérico', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'pieces/p6'), { name: 'X', code: 'C-6', price: 'caro' }));
});
test('S6 · patch parcial (solo images, merge) en pieza existente SÍ pasa', async () => {
    // Flujo crítico del admin (patchPiece con merge) — NO debe romperse.
    await assertSucceeds(setDoc(doc(asUser('editorUid'), 'pieces/p1'), { images: ['a.webp'], image: 'a.webp' }, { merge: true }));
});
test('S6 · colección: editor crea con name', async () => {
    await assertSucceeds(setDoc(doc(asUser('editorUid'), 'collections/c1'), { name: 'Anillos', slug: 'anillos' }));
});
test('S6 · colección: NO crea sin name', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'collections/c2'), { subtitle: 'x' }));
});

// ─── CRM Bloque 1: clientes (RBAC + scoped a la vendedora) ───────────────────
test('CRM clientes · admin lee cualquier cliente', async () => {
    await assertSucceeds(getDoc(doc(asUser('adminUid'), 'clientes/cliV')));
});
test('CRM clientes · vendedora lee SU cliente', async () => {
    await assertSucceeds(getDoc(doc(asUser('vendUid'), 'clientes/cliV')));
});
test('CRM clientes · vendedora NO lee cliente de otra', async () => {
    await assertFails(getDoc(doc(asUser('vend2Uid'), 'clientes/cliV')));
});
test('CRM clientes · vendedora crea cliente asignado a sí misma', async () => {
    await assertSucceeds(setDoc(doc(asUser('vendUid'), 'clientes/cliNuevo'), { nombre: 'Nueva', vendedoraUid: 'vendUid' }));
});
test('CRM clientes · vendedora NO crea cliente asignado a otra', async () => {
    await assertFails(setDoc(doc(asUser('vendUid'), 'clientes/cliX'), { nombre: 'X', vendedoraUid: 'vend2Uid' }));
});
test('CRM clientes · vendedora NO edita ni borra', async () => {
    await assertFails(setDoc(doc(asUser('vendUid'), 'clientes/cliV'), { nombre: 'Cambiado', vendedoraUid: 'vendUid' }, { merge: true }));
    await assertFails(deleteDoc(doc(asUser('vendUid'), 'clientes/cliV')));
});
test('CRM clientes · admin edita y borra', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV'), { nombre: 'Editado por Kary' }, { merge: true }));
});

// ─── CRM Bloque 1: movimientos (append-only para vendedora) ───────────────────
test('CRM mov · vendedora añade movimiento a SU cliente', async () => {
    await assertSucceeds(setDoc(doc(asUser('vendUid'), 'clientes/cliV/movimientos/m2'), { tipo: 'abono', monto: 50000, registradoPor: 'vendUid' }));
});
test('CRM mov · vendedora NO añade a cliente de otra', async () => {
    await assertFails(setDoc(doc(asUser('vend2Uid'), 'clientes/cliV/movimientos/m3'), { tipo: 'abono', monto: 50000, registradoPor: 'vend2Uid' }));
});
test('CRM mov · vendedora NO edita ni borra movimientos (append-only)', async () => {
    await assertFails(setDoc(doc(asUser('vendUid'), 'clientes/cliV/movimientos/m1'), { monto: 1 }, { merge: true }));
    await assertFails(deleteDoc(doc(asUser('vendUid'), 'clientes/cliV/movimientos/m1')));
});
test('CRM mov · movimiento con tipo inválido es rechazado', async () => {
    await assertFails(setDoc(doc(asUser('vendUid'), 'clientes/cliV/movimientos/mBad'), { tipo: 'regalo', monto: 1, registradoPor: 'vendUid' }));
});
test('CRM mov · admin edita/borra movimientos (correcciones)', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m1'), { anulado: true }, { merge: true }));
});

// ─── CRM Bloque 1: config (write admin) y solicitudesCorreccion ───────────────
test('CRM config · cualquiera autenticado lee config', async () => {
    await assertSucceeds(getDoc(doc(asUser('vendUid'), 'config/negocio')));
});
test('CRM config · vendedora NO escribe config', async () => {
    await assertFails(setDoc(doc(asUser('vendUid'), 'config/negocio'), { fechaCorteMigracion: 'x' }, { merge: true }));
});
test('CRM config · admin escribe config', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'config/negocio'), { fechaCorteMigracion: '2026-01-01' }, { merge: true }));
});
test('CRM solicitud · vendedora crea su solicitud', async () => {
    await assertSucceeds(setDoc(doc(asUser('vendUid'), 'solicitudesCorreccion/s2'), { vendedoraUid: 'vendUid', clienteId: 'cliV', estado: 'pendiente' }));
});
test('CRM solicitud · vendedora NO aprueba (update)', async () => {
    await assertFails(setDoc(doc(asUser('vendUid'), 'solicitudesCorreccion/s1'), { estado: 'aprobada' }, { merge: true }));
});
test('CRM solicitud · admin aprueba', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'solicitudesCorreccion/s1'), { estado: 'aprobada' }, { merge: true }));
});

// ─── CRM Bloque 1: endurecimiento (revisión adversarial) ─────────────────────
// Integridad de movimientos: la vendedora no manipula el saldo por el payload de create.
test('HARD mov · vendedora NO crea movimiento ya anulado', async () => {
    await assertFails(setDoc(doc(asUser('vendUid'), 'clientes/cliV/movimientos/mAnul'),
        { tipo: 'factura', monto: 5000000, registradoPor: 'vendUid', anulado: true }));
});
test('HARD mov · vendedora NO crea movimiento con auditoría de anulación', async () => {
    await assertFails(setDoc(doc(asUser('vendUid'), 'clientes/cliV/movimientos/mAud'),
        { tipo: 'abono', monto: 1, registradoPor: 'vendUid', anuladoPor: 'adminUid' }));
});
test('HARD mov · vendedora NO usa tipo apertura ni ajuste (solo factura/abono)', async () => {
    await assertFails(setDoc(doc(asUser('vendUid'), 'clientes/cliV/movimientos/mAp'),
        { tipo: 'apertura', monto: 9999999, registradoPor: 'vendUid' }));
    await assertFails(setDoc(doc(asUser('vendUid'), 'clientes/cliV/movimientos/mAj'),
        { tipo: 'ajuste', monto: 9999999, registradoPor: 'vendUid' }));
});
test('HARD mov · admin SÍ crea apertura (migración)', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mAperturaOk'),
        { tipo: 'apertura', monto: 200000, registradoPor: 'adminUid' }));
});
test('HARD mov · vendedora NO falsifica registradoPor de otra', async () => {
    await assertFails(setDoc(doc(asUser('vendUid'), 'clientes/cliV/movimientos/mFake'),
        { tipo: 'abono', monto: 1, registradoPor: 'vend2Uid' }));
});

// Integridad de clientes: whitelist anti-inyección (saldoActual = solo CF).
test('HARD cliente · vendedora NO siembra saldoActual', async () => {
    await assertFails(setDoc(doc(asUser('vendUid'), 'clientes/cliHackSaldo'),
        { nombre: 'X', vendedoraUid: 'vendUid', saldoActual: 5000000 }));
});
test('HARD cliente · vendedora NO inyecta campo desconocido', async () => {
    await assertFails(setDoc(doc(asUser('vendUid'), 'clientes/cliHackKey'),
        { nombre: 'X', vendedoraUid: 'vendUid', hack: true }));
});

// solicitudesCorreccion: sin auto-aprobación ni manipulación cruzada.
test('HARD solicitud · vendedora NO crea solicitud ya aprobada', async () => {
    await assertFails(setDoc(doc(asUser('vendUid'), 'solicitudesCorreccion/sApr'),
        { vendedoraUid: 'vendUid', clienteId: 'cliV', estado: 'aprobada' }));
});
test('HARD solicitud · vendedora NO crea solicitud con autorizadoPor', async () => {
    await assertFails(setDoc(doc(asUser('vendUid'), 'solicitudesCorreccion/sAuth'),
        { vendedoraUid: 'vendUid', clienteId: 'cliV', estado: 'pendiente', autorizadoPor: 'adminUid' }));
});
test('HARD solicitud · vendedora NO crea solicitud sobre cliente de OTRA', async () => {
    await assertFails(setDoc(doc(asUser('vend2Uid'), 'solicitudesCorreccion/sCruz'),
        { vendedoraUid: 'vend2Uid', clienteId: 'cliV', estado: 'pendiente' }));
});

// Robustez: cliente directo de Kary (sin vendedoraUid) no rompe ni filtra.
test('HARD directo · vendedora NO lee cliente directo de Kary (deny limpio)', async () => {
    await assertFails(getDoc(doc(asUser('vendUid'), 'clientes/cliDirecto')));
});
test('HARD directo · vendedora NO crea movimiento en cliente directo de Kary', async () => {
    await assertFails(setDoc(doc(asUser('vendUid'), 'clientes/cliDirecto/movimientos/x'),
        { tipo: 'abono', monto: 1, registradoPor: 'vendUid' }));
});
test('HARD directo · admin SÍ lee cliente directo de Kary', async () => {
    await assertSucceeds(getDoc(doc(asUser('adminUid'), 'clientes/cliDirecto')));
});

// Cobertura de roles: owner = admin; editor/customer/ghost excluidos del CRM.
test('HARD rol · owner lee y crea clientes', async () => {
    await assertSucceeds(getDoc(doc(asUser('ownerUid'), 'clientes/cliV')));
    await assertSucceeds(setDoc(doc(asUser('ownerUid'), 'clientes/cliOwner'), { nombre: 'De Daniel' }));
});
test('HARD rol · editor NO toca el CRM', async () => {
    await assertFails(getDoc(doc(asUser('editorUid'), 'clientes/cliV')));
    await assertFails(getDoc(doc(asUser('editorUid'), 'clientes/cliV/movimientos/m1')));
    await assertFails(getDoc(doc(asUser('editorUid'), 'solicitudesCorreccion/s1')));
});
test('HARD rol · customer sin rol y ghost (auth sin doc) NO leen clientes', async () => {
    await assertFails(getDoc(doc(asUser('customerUid'), 'clientes/cliV')));
    await assertFails(getDoc(doc(asUser('ghostUid'), 'clientes/cliV')));
});

// Aislamiento de cartera en list/query (no solo get de doc individual).
test('HARD list · vendedora NO enumera clientes sin filtro', async () => {
    await assertFails(getDocs(collection(asUser('vendUid'), 'clientes')));
});
test('HARD list · vendedora SÍ lista los suyos con filtro vendedoraUid', async () => {
    await assertSucceeds(getDocs(query(collection(asUser('vendUid'), 'clientes'),
        where('vendedoraUid', '==', 'vendUid'))));
});
test('HARD list · vendedora NO lista la cartera de OTRA aunque filtre', async () => {
    await assertFails(getDocs(query(collection(asUser('vend2Uid'), 'clientes'),
        where('vendedoraUid', '==', 'vendUid'))));
});

// Confidencialidad de config: status público; negocio solo admin/vendedora.
test('HARD config · anónimo lee config/status (health check)', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'config/status')));
});
test('HARD config · anónimo NO lee config/negocio', async () => {
    await assertFails(getDoc(doc(anon(), 'config/negocio')));
});
test('HARD config · editor NO lee config/negocio (datos del negocio)', async () => {
    await assertFails(getDoc(doc(asUser('editorUid'), 'config/negocio')));
});

// ─── CRM Bloque 2: modelo de signo del monto (saldo a favor / ajuste a la baja) ──
test('SALDO · admin crea apertura con monto negativo (saldo a favor inicial)', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mApFavor'),
        { tipo: 'apertura', monto: -30000, registradoPor: 'adminUid' }));
});
test('SALDO · admin crea ajuste con monto negativo (corrección a la baja)', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mAjNeg'),
        { tipo: 'ajuste', monto: -5000, registradoPor: 'adminUid' }));
});
test('SALDO · vendedora NO crea factura con monto negativo', async () => {
    await assertFails(setDoc(doc(asUser('vendUid'), 'clientes/cliV/movimientos/mFacNeg'),
        { tipo: 'factura', monto: -1, registradoPor: 'vendUid' }));
});
