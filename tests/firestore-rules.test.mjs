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
    doc, getDoc, getDocs, setDoc, addDoc, deleteDoc, updateDoc, collection, collectionGroup, query,
    serverTimestamp,
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

        // ─── CRM Fase R: vendedoras (entidad), cliente (vendedoraId), config, pendientes ──
        await setDoc(doc(db, 'users/ownerUid'), { role: 'owner' });
        await setDoc(doc(db, 'users/vendUid'),  { role: 'vendedora' }); // rol RESIDUAL: debe quedar SIN acceso al CRM
        await setDoc(doc(db, 'users/degradadoUid'), { role: 'admin' }); // F6-B: doc admin + claim editor → claim manda
        await setDoc(doc(db, 'users/objetivoUid'), { role: 'editor', email: 'o@x.co', displayName: 'Obj' }); // F6-B: víctima de los tests de escalada
        await setDoc(doc(db, 'vendedoras/vendA'), { nombre: 'Vendedora A', activa: true });
        await setDoc(doc(db, 'clientes/cliV'), { nombre: 'Cliente V', vendedoraId: 'vendA', saldoActual: 0 });
        await setDoc(doc(db, 'clientes/cliV/movimientos/m1'), { tipo: 'factura', monto: 100000, registradoPor: 'adminUid', anulado: false });
        await setDoc(doc(db, 'config/status'),  { ok: true });
        await setDoc(doc(db, 'config/negocio'), { fechaCorteMigracion: '2025-12-31' });
        await setDoc(doc(db, 'solicitudesCorreccion/s1'), { clienteId: 'cliV', estado: 'pendiente' }); // legacy: debe quedar INACCESIBLE
        await setDoc(doc(db, 'pendientes/p1'), { titulo: 'Definir corte', categoria: 'definir-kary', estado: 'pendiente' });

        // ─── F6 frente D: salud del sistema (las escriben SOLO las CFs) ──────────
        await setDoc(doc(db, 'salud/backup'), { ultimoOk: new Date(), archivo: 'backups/firestore/backup-x.json.gz', totalDocs: 700 });
        await setDoc(doc(db, 'saludEventos/ev1'), { tipo: 'recalc-saldo-error', clienteId: 'cliV', error: 'boom', resuelto: false });
        await setDoc(doc(db, 'saludEventos/ev2'), { tipo: 'recalc-saldo-error', clienteId: 'cliV', error: 'boom', resuelto: false });
        await setDoc(doc(db, 'saludEventos/ev3'), { tipo: 'recalc-saldo-error', clienteId: 'cliV', error: 'boom', resuelto: false });
        await setDoc(doc(db, 'saludEventos/ev4'), { tipo: 'recalc-saldo-error', clienteId: 'cliV', error: 'boom', resuelto: false });
        await setDoc(doc(db, 'saludEventos/ev5'), { tipo: 'recalc-saldo-error', clienteId: 'cliV', error: 'boom', resuelto: false });
        await setDoc(doc(db, 'saludEventos/evResuelto'), { tipo: 'recalc-saldo-error', error: 'boom', resuelto: true, resueltoPor: 'adminUid' });
    });
});

after(async () => { await testEnv?.cleanup(); });

const anon   = () => testEnv.unauthenticatedContext().firestore();
const asUser = (uid) => testEnv.authenticatedContext(uid).firestore();
// F6 frente B: contexto con custom claim `role` en el token (sin depender del doc users/).
const asClaim = (uid, role) => testEnv.authenticatedContext(uid, { role }).firestore();

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

// ─── Reseñas: create público pero con FORMA EXACTA (F6 frenos de gasto) ───────
test('reseñas · cualquiera puede crear una reseña BIEN FORMADA (no aprobada)', async () => {
    await assertSucceeds(addDoc(collection(anon(), 'reviews'), {
        pieceSlug: 'anillo', pieceName: 'Anillo', author: 'Clienta', rating: 5,
        comment: 'Hermosa pieza', email: 'c@x.co', approved: false, createdAt: serverTimestamp(),
    }));
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

// ─── CRM Fase R: vendedoras = entidad de datos (solo admin/owner) ─────────────
test('CRM vend · admin lee y crea vendedoras', async () => {
    await assertSucceeds(getDoc(doc(asUser('adminUid'), 'vendedoras/vendA')));
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'vendedoras/vNueva'), { nombre: 'Tania', activa: true }));
});
test('CRM vend · owner gestiona vendedoras', async () => {
    await assertSucceeds(setDoc(doc(asUser('ownerUid'), 'vendedoras/vO'), { nombre: 'Daniela', activa: true }));
});
test('CRM vend · sin nombre es rechazada', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'vendedoras/vBad'), { activa: true }));
});
test('CRM vend · activa no-bool es rechazada', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'vendedoras/vBool'), { nombre: 'X', activa: 'sí' }));
});
test('CRM vend · editor y sin-rol NO acceden', async () => {
    await assertFails(getDoc(doc(asUser('editorUid'), 'vendedoras/vendA')));
    await assertFails(setDoc(doc(asUser('editorUid'), 'vendedoras/vE'), { nombre: 'X', activa: true }));
});

// ─── CRM Fase R: clientes y movimientos = SOLO admin/owner ───────────────────
test('CRM clientes · admin lee/crea/edita', async () => {
    await assertSucceeds(getDoc(doc(asUser('adminUid'), 'clientes/cliV')));
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliNuevo'), { nombre: 'Nueva', vendedoraId: 'vendA' }));
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV'), { nombre: 'Editado' }, { merge: true }));
});
test('CRM clientes · owner también lee', async () => {
    await assertSucceeds(getDoc(doc(asUser('ownerUid'), 'clientes/cliV')));
});
test('CRM clientes · vendedora (rol residual) NO accede', async () => {
    await assertFails(getDoc(doc(asUser('vendUid'), 'clientes/cliV')));
    await assertFails(setDoc(doc(asUser('vendUid'), 'clientes/cliZ'), { nombre: 'Z', vendedoraId: 'vendA' }));
});
test('CRM clientes · editor y sin-rol NO acceden', async () => {
    await assertFails(getDoc(doc(asUser('editorUid'), 'clientes/cliV')));
    await assertFails(getDoc(doc(asUser('customerUid'), 'clientes/cliV')));
});
test('CRM clientes · saldoActual NO se puede sembrar (hasOnly)', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliHack'), { nombre: 'H', saldoActual: 999 }));
});
test('CRM mov · admin crea abono y apertura positiva; tipo inválido rechazado', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mA'), { tipo: 'abono', monto: 5000, registradoPor: 'adminUid', anulado: false }));
    // M0-H (§69): la apertura NEGATIVA pasó a owner-only (test propio abajo); la positiva sigue admin.
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mAp'), { tipo: 'apertura', monto: 1000, registradoPor: 'adminUid' }));
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mBad'), { tipo: 'regalo', monto: 1, registradoPor: 'adminUid' }));
});
test('CRM mov · vendedora(residual) y editor NO crean', async () => {
    await assertFails(setDoc(doc(asUser('vendUid'), 'clientes/cliV/movimientos/mV'), { tipo: 'abono', monto: 1, registradoPor: 'vendUid' }));
    await assertFails(setDoc(doc(asUser('editorUid'), 'clientes/cliV/movimientos/mE'), { tipo: 'abono', monto: 1, registradoPor: 'editorUid' }));
});

// ─── CRM: movimientos APPEND-ONLY (PRE: solo anular con motivo; nunca editar/borrar) ──
test('CRM mov · anular SIN motivo es rechazado', async () => {
    await assertFails(updateDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m1'),
        { anulado: true, anuladoPor: 'adminUid', anuladoEn: '2026-06-07T00:00:00Z' }));
});
test('CRM mov · editar monto/tipo de un asiento es rechazado (append-only)', async () => {
    await assertFails(updateDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m1'), { monto: 999 }));
    await assertFails(updateDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m1'), { tipo: 'abono' }));
});
test('CRM mov · NADIE borra un movimiento (ni admin)', async () => {
    await assertFails(deleteDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m1')));
});
test('CRM mov · admin SÍ anula con motivo (anulado false→true + motivoAnulacion)', async () => {
    await assertSucceeds(updateDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m1'),
        { anulado: true, anuladoPor: 'adminUid', anuladoEn: '2026-06-07T00:00:00Z', motivoAnulacion: 'duplicado' }));
});

// ─── CRM: collectionGroup de movimientos (lectura para el aging de la lista CxC, §51) ──
test('CRM mov · admin SÍ lee el collectionGroup de movimientos', async () => {
    await assertSucceeds(getDocs(query(collectionGroup(asUser('adminUid'), 'movimientos'))));
});
test('CRM mov · editor NO lee el collectionGroup de movimientos', async () => {
    await assertFails(getDocs(query(collectionGroup(asUser('editorUid'), 'movimientos'))));
});
test('CRM mov · admin crea movimiento con fecha real (mora)', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mFecha'),
        { tipo: 'factura', monto: 50000, fecha: '2026-06-07', registradoPor: 'adminUid', anulado: false }));
});
test('CRM mov · fecha con formato NO ISO es rechazada (validación server-side)', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mBadFecha'),
        { tipo: 'factura', monto: 1000, fecha: '2026/06/07', registradoPor: 'adminUid', anulado: false }));
});

// ─── CRM Fase R: solicitudesCorreccion ELIMINADA (sin regla = denegado a todos) ─
test('CRM solicitudes · colección eliminada: ni admin accede', async () => {
    await assertFails(getDoc(doc(asUser('adminUid'), 'solicitudesCorreccion/s1')));
    await assertFails(setDoc(doc(asUser('adminUid'), 'solicitudesCorreccion/s2'), { x: 1 }));
});

// ─── CRM Fase R: config + pendientes ─────────────────────────────────────────
test('CRM config · admin lee/escribe negocio; status público; editor NO lee negocio', async () => {
    await assertSucceeds(getDoc(doc(asUser('adminUid'), 'config/negocio')));
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'config/negocio'), { diasPlazo: 30 }, { merge: true }));
    await assertSucceeds(getDoc(doc(anon(), 'config/status')));
    await assertFails(getDoc(doc(asUser('editorUid'), 'config/negocio')));
});
test('PEND · admin sí; editor no', async () => {
    await assertSucceeds(getDoc(doc(asUser('adminUid'), 'pendientes/p1')));
    await assertFails(getDoc(doc(asUser('editorUid'), 'pendientes/p1')));
});

// ─── F6 frenos de gasto: forms públicos con forma exacta (ADR §59) ───────────
// Reseñas
test('F6 reseñas · rating fuera de 1-5 es rechazado', async () => {
    await assertFails(addDoc(collection(anon(), 'reviews'), {
        author: 'X', rating: 9, comment: 'spam', approved: false, createdAt: serverTimestamp(),
    }));
});
test('F6 reseñas · NO puede nacer aprobada (anti auto-aprobación)', async () => {
    await assertFails(addDoc(collection(anon(), 'reviews'), {
        author: 'X', rating: 5, comment: 'ok', approved: true, createdAt: serverTimestamp(),
    }));
});
test('F6 reseñas · comentario gigante (>2000) es rechazado', async () => {
    await assertFails(addDoc(collection(anon(), 'reviews'), {
        author: 'X', rating: 5, comment: 'a'.repeat(2500), approved: false, createdAt: serverTimestamp(),
    }));
});
test('F6 reseñas · campo NO previsto (inyección) es rechazado', async () => {
    await assertFails(addDoc(collection(anon(), 'reviews'), {
        author: 'X', rating: 5, comment: 'ok', approved: false, createdAt: serverTimestamp(), hacked: true,
    }));
});
test('F6 reseñas · createdAt del cliente (no serverTimestamp) es rechazado', async () => {
    await assertFails(addDoc(collection(anon(), 'reviews'), {
        author: 'X', rating: 5, comment: 'ok', approved: false, createdAt: new Date('2020-01-01'),
    }));
});

// Newsletter (subscriptions)
test('F6 news · email válido se suscribe', async () => {
    await assertSucceeds(addDoc(collection(anon(), 'subscriptions'), {
        email: 'clienta@correo.co', source: 'website_modal', active: true, createdAt: serverTimestamp(),
    }));
});
test('F6 news · email sin @ es rechazado', async () => {
    await assertFails(addDoc(collection(anon(), 'subscriptions'), {
        email: 'no-es-un-correo', source: 'website_modal', active: true, createdAt: serverTimestamp(),
    }));
});
test('F6 news · active:false (forma rara) es rechazado', async () => {
    await assertFails(addDoc(collection(anon(), 'subscriptions'), {
        email: 'a@b.co', source: 'website_modal', active: false, createdAt: serverTimestamp(),
    }));
});
test('F6 news · campo extra es rechazado', async () => {
    await assertFails(addDoc(collection(anon(), 'subscriptions'), {
        email: 'a@b.co', source: 'website_modal', active: true, createdAt: serverTimestamp(), admin: true,
    }));
});

// Consultas (inquiries → Bandeja)
test('F6 leads · payload EXACTO del form de contacto pasa', async () => {
    await assertSucceeds(addDoc(collection(anon(), 'inquiries'), {
        name: 'Clienta', email: 'c@x.co', phone: '3000000000', message: 'Quiero el anillo',
        pieceSlug: null, source: 'web', status: 'nuevo', createdAt: serverTimestamp(),
    }));
});
test('F6 leads · status pre-cocinado (≠ nuevo) es rechazado', async () => {
    await assertFails(addDoc(collection(anon(), 'inquiries'), {
        name: 'X', message: 'hola', pieceSlug: null, source: 'web', status: 'convertido', createdAt: serverTimestamp(),
    }));
});
test('F6 leads · mensaje gigante (>3000) es rechazado', async () => {
    await assertFails(addDoc(collection(anon(), 'inquiries'), {
        name: 'X', message: 'a'.repeat(3500), pieceSlug: null, source: 'web', status: 'nuevo', createdAt: serverTimestamp(),
    }));
});
test('F6 leads · sin nombre es rechazado', async () => {
    await assertFails(addDoc(collection(anon(), 'inquiries'), {
        message: 'hola', pieceSlug: null, source: 'web', status: 'nuevo', createdAt: serverTimestamp(),
    }));
});

// push_tokens: sin writer legítimo en el código → cerrado
test('F6 push_tokens · creación pública CERRADA (sin uso legítimo)', async () => {
    await assertFails(setDoc(doc(anon(), 'push_tokens/t1'), { token: 'abc' }));
});

// entero-COP (spec §5.1): pesos enteros en la frontera de escritura
test('F6 entero-COP · monto con decimales es RECHAZADO (pesos enteros)', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mFloat'),
        { tipo: 'factura', monto: 50000.5, registradoPor: 'adminUid', anulado: false }));
});
test('F6 entero-COP · monto entero SÍ pasa', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mEntero'),
        { tipo: 'abono', monto: 12345, registradoPor: 'adminUid', anulado: false }));
});

// ─── F6 frente D: salud del sistema (solo lectura admin; escribe la CF) ────────
test('F6 salud · admin SÍ lee salud/backup', async () => {
    await assertSucceeds(getDoc(doc(asUser('adminUid'), 'salud/backup')));
});
test('F6 salud · anónimo y editor NO leen salud', async () => {
    await assertFails(getDoc(doc(anon(), 'salud/backup')));
    await assertFails(getDoc(doc(asUser('editorUid'), 'salud/backup')));
});
test('F6 salud · ni el admin escribe salud (solo la Cloud Function)', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'salud/reconciliacion'), { ok: true }));
});
test('F6 saludEventos · admin lee; editor NO', async () => {
    await assertSucceeds(getDoc(doc(asUser('adminUid'), 'saludEventos/ev1')));
    await assertFails(getDoc(doc(asUser('editorUid'), 'saludEventos/ev1')));
});
test('F6 saludEventos · admin marca resuelto (3 claves exactas)', async () => {
    await assertSucceeds(updateDoc(doc(asUser('adminUid'), 'saludEventos/ev1'), {
        resuelto: true, resueltoEn: serverTimestamp(), resueltoPor: 'adminUid',
    }));
});
test('F6 saludEventos · update que reescribe el testimonio (error) es rechazado', async () => {
    await assertFails(updateDoc(doc(asUser('adminUid'), 'saludEventos/ev2'), {
        resuelto: true, resueltoEn: serverTimestamp(), resueltoPor: 'adminUid', error: 'no pasó nada',
    }));
});
test('F6 saludEventos · resuelto:false (des-resolver) es rechazado', async () => {
    await assertFails(updateDoc(doc(asUser('adminUid'), 'saludEventos/ev3'), {
        resuelto: false, resueltoEn: serverTimestamp(), resueltoPor: 'adminUid',
    }));
});
test('F6 saludEventos · resueltoPor ajeno (suplantación) es rechazado', async () => {
    await assertFails(updateDoc(doc(asUser('adminUid'), 'saludEventos/ev4'), {
        resuelto: true, resueltoEn: serverTimestamp(), resueltoPor: 'otroUid',
    }));
});
test('F6 saludEventos · el cliente NO crea eventos (solo la Cloud Function)', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'saludEventos/evNuevo'), {
        tipo: 'recalc-saldo-error', resuelto: false,
    }));
});
test('F6 saludEventos · re-resolver un evento YA resuelto es rechazado', async () => {
    await assertFails(updateDoc(doc(asUser('adminUid'), 'saludEventos/evResuelto'), {
        resuelto: true, resueltoEn: serverTimestamp(), resueltoPor: 'adminUid',
    }));
});
test('F6 saludEventos · resueltoEn del cliente (no serverTimestamp) es rechazado', async () => {
    await assertFails(updateDoc(doc(asUser('adminUid'), 'saludEventos/ev5'), {
        resuelto: true, resueltoEn: new Date('2020-01-01'), resueltoPor: 'adminUid',
    }));
});

// ─── F6 frente B: RBAC por custom claims (dual: claim del token ?? doc users) ─
test('F6 claims · admin POR CLAIM (sin doc en users/) SÍ accede al CRM', async () => {
    await assertSucceeds(getDoc(doc(asClaim('soloClaimAdmin', 'admin'), 'clientes/cliV')));
});
test('F6 claims · editor POR CLAIM NO accede al CRM (admin-only)', async () => {
    await assertFails(getDoc(doc(asClaim('soloClaimEditor', 'editor'), 'clientes/cliV')));
});
test('F6 claims · owner POR CLAIM puede crear usuarios', async () => {
    await assertSucceeds(setDoc(doc(asClaim('soloClaimOwner', 'owner'), 'users/nuevoUid'), {
        email: 'n@x.co', displayName: 'Nuevo', role: 'editor',
    }));
});
test('F6 claims · el claim TIENE PRECEDENCIA sobre el doc (degradado no retiene acceso)', async () => {
    // users/degradadoUid dice admin, pero su token ya trae claim editor → el claim manda.
    await assertFails(getDoc(doc(asClaim('degradadoUid', 'editor'), 'clientes/cliV')));
});
test('F6 claims · sin claim, el fallback al doc users/ sigue vivo (transición)', async () => {
    await assertSucceeds(getDoc(doc(asUser('adminUid'), 'clientes/cliV')));
});

// ─── F6 frente B: integridad de la frontera users/ (anti escalada de rol) ─────
test('F6 users · admin NO puede acuñar un owner en el doc de otro', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'users/objetivoUid'),
        { role: 'owner' }, { merge: true }));
});
test('F6 users · admin NO puede degradar/tocar al owner', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'users/ownerUid'),
        { role: 'editor' }, { merge: true }));
});
test('F6 users · admin NO muta usuarios (gestión owner-only, §66)', async () => {
    // Ni siquiera un cambio de rol "benigno" editor→admin: la frontera es owner-only.
    await assertFails(setDoc(doc(asUser('adminUid'), 'users/objetivoUid'),
        { role: 'admin' }, { merge: true }));
});
test('F6 users · admin NO puede desactivar a otro por write directo (§66)', async () => {
    // Desactivar va por la CF (deshabilita Auth); el write directo del admin se niega.
    await assertFails(setDoc(doc(asUser('adminUid'), 'users/objetivoUid'),
        { active: false }, { merge: true }));
});
test('F6 users · admin NO puede auto-promoverse (userId == self)', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'users/adminUid'),
        { role: 'owner' }, { merge: true }));
});
test('F6 users · owner crea editor desde la app, pero NO un owner', async () => {
    await assertSucceeds(setDoc(doc(asUser('ownerUid'), 'users/nuevoApp'),
        { email: 'n@x.co', displayName: 'N', role: 'editor', active: true,
          createdAt: serverTimestamp(), createdBy: 'ownerUid' }));
    await assertFails(setDoc(doc(asUser('ownerUid'), 'users/nuevoOwner'),
        { email: 'o@x.co', displayName: 'O', role: 'owner', active: true }));
});
test('F6 users · campo no previsto (inyección) en users es rechazado', async () => {
    await assertFails(setDoc(doc(asUser('ownerUid'), 'users/objetivoUid'),
        { hackeado: true }, { merge: true }));
});

// ─── Fase M · M0-H (§69): cierre de los 2 agujeros verificados ─────────────────
test('M0-H · admin NO puede pisar saldoActual del cliente (solo la CF)', async () => {
    // Valor DISTINTO al sembrado (0): un merge con el mismo valor da diff vacío y pasa vacuamente.
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV'),
        { saldoActual: 999999 }, { merge: true }));
});
test('M0-H · editar cliente (flujo actual del panel) SIGUE pasando', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV'),
        { nombre: 'Cliente V2', telefono: '300', updatedAt: serverTimestamp() }, { merge: true }));
});
test('M0-H · apertura NEGATIVA: admin NO, owner SÍ', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/apNegA'),
        { tipo: 'apertura', monto: -50000, registradoPor: 'adminUid', anulado: false }));
    await assertSucceeds(setDoc(doc(asUser('ownerUid'), 'clientes/cliV/movimientos/apNegO'),
        { tipo: 'apertura', monto: -50000, registradoPor: 'ownerUid', anulado: false }));
});
test('M0-H · no-regresión: ajuste negativo de admin conserva su régimen (hasta M3)', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/ajNeg'),
        { tipo: 'ajuste', monto: -10000, registradoPor: 'adminUid', anulado: false }));
});
