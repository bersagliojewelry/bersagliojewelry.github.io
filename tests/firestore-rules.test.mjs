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
test('pieces · editor SÍ escribe', async () => {
    await assertSucceeds(setDoc(doc(asUser('editorUid'), 'pieces/p3'), { name: 'X', slug: 'x' }));
});
