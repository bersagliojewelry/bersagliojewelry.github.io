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
    where, serverTimestamp, writeBatch, deleteField,
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
        await setDoc(doc(db, 'users/catalogoUid'), { role: 'catalogo' }); // TODO-19: gestor de catálogo (Kary)
        await setDoc(doc(db, 'reviews/approvedRev'), { approved: true,  pieceSlug: 'x', rating: 5 });
        await setDoc(doc(db, 'reviews/pendingRev'),  { approved: false, pieceSlug: 'x', rating: 5 });
        await setDoc(doc(db, 'pieces/p1'), { name: 'Anillo', slug: 'anillo' });
        await setDoc(doc(db, 'journal/j1'), { title: 'Esmeraldas', published: true }); // CMS: lectura pública + borrado admin

        // ─── CRM Fase R: vendedoras (entidad), cliente (vendedoraId), config, pendientes ──
        await setDoc(doc(db, 'users/ownerUid'), { role: 'owner' });
        await setDoc(doc(db, 'users/vendUid'),  { role: 'vendedora' }); // rol RESIDUAL: debe quedar SIN acceso al CRM
        await setDoc(doc(db, 'users/degradadoUid'), { role: 'admin' }); // F6-B: doc admin + claim editor → claim manda
        await setDoc(doc(db, 'users/objetivoUid'), { role: 'editor', email: 'o@x.co', displayName: 'Obj' }); // F6-B: víctima de los tests de escalada
        await setDoc(doc(db, 'vendedoras/vendA'), { nombre: 'Vendedora A', activa: true });
        await setDoc(doc(db, 'clientes/cliV'), { nombre: 'Cliente V', vendedoraId: 'vendA', saldoActual: 0 });
        await setDoc(doc(db, 'clientes/cliV/movimientos/m1'), { tipo: 'factura', monto: 100000, registradoPor: 'adminUid', anulado: false }); // > tope: anularla = owner (M3)
        await setDoc(doc(db, 'clientes/cliV/movimientos/mLink'), { tipo: 'factura', monto: 40000, registradoPor: 'adminUid', anulado: false }); // ≤ tope: M2a-1b anulación admin con enlace
        // ─── M3 (candado): semillas de la tabla de predicados de anulación + config ──
        await setDoc(doc(db, 'config/cartera'), { autoAprobacionMax: 50000, slaRevisionDias: 2 }); // el gate la LEE (seed con reglas off)
        await setDoc(doc(db, 'clientes/cliV/movimientos/mChico'), { tipo: 'factura', monto: 40000, fecha: '2026-06-01', registradoPor: 'adminUid', anulado: false });
        await setDoc(doc(db, 'clientes/cliV/movimientos/mAbonoSem'), { tipo: 'abono', monto: 30000, fecha: '2026-06-01', medioPago: 'efectivo', registradoPor: 'adminUid', anulado: false });
        await setDoc(doc(db, 'clientes/cliV/movimientos/mGrande'), { tipo: 'factura', monto: 5000000, fecha: '2026-06-01', registradoPor: 'adminUid', anulado: false });
        await setDoc(doc(db, 'clientes/cliV/movimientos/mCero'), { tipo: 'ajuste', monto: 0, fecha: '2026-06-01', registradoPor: 'adminUid', anulado: false });
        await setDoc(doc(db, 'clientes/cliV/movimientos/mNegSem'), { tipo: 'ajuste', monto: -20000, fecha: '2026-06-01', registradoPor: 'adminUid', anulado: false });
        await setDoc(doc(db, 'clientes/cliV/movimientos/mLegacySucio'), { tipo: 'factura', monto: 25000, registradoPor: 'adminUid', anulado: false, campo_basura_v1: 'x' }); // sin fecha/medioPago + clave vieja: anulable igual (delta-only)
        await setDoc(doc(db, 'clientes/cliV/movimientos/mBorde'), { tipo: 'factura', monto: 50000, fecha: '2026-06-01', registradoPor: 'adminUid', anulado: false });      // == tope exacto
        await setDoc(doc(db, 'clientes/cliV/movimientos/mBordePlus'), { tipo: 'factura', monto: 50001, fecha: '2026-06-01', registradoPor: 'adminUid', anulado: false });  // tope + 1
        await setDoc(doc(db, 'clientes/cliV/movimientos/mAbonoCorr'), { tipo: 'abono', monto: 100000, fecha: '2026-06-01', registradoPor: 'adminUid', anulado: false });   // abono LEGACY (sin medioPago) a corregir
        await setDoc(doc(db, 'clientes/cliV/solicitudes/solAbonoCorr'), { tipo: 'correccion', monto: -50000, motivo: 'dedazo en el abono', nota: 'eran 150 mil', solicitadoPor: 'adminUid', creadoEn: new Date(), estado: 'pendiente', correccionDe: 'mAbonoCorr',
            datosCorreccion: { reemplazo: { tipo: 'abono', monto: 150000, fecha: '2026-06-01', medioPago: 'otro' }, snapshotOriginal: { tipo: 'abono', monto: 100000, fecha: '2026-06-01', anulado: false }, motivoCategoria: 'ABONO_NO_REGISTRADO' } });
        await setDoc(doc(db, 'clientes/cliW'), { nombre: 'Cliente W', saldoActual: 0 });
        await setDoc(doc(db, 'clientes/cliW/solicitudes/solAjena'), { tipo: 'ajuste', monto: -70000, motivo: 'DESCUENTO_AUTORIZADO', nota: 'de otro cliente', solicitadoPor: 'adminUid', creadoEn: new Date(), estado: 'pendiente' });
        await setDoc(doc(db, 'clientes/cliV/solicitudes/solAjusteOk'), { tipo: 'ajuste', monto: -70000, motivo: 'DESCUENTO_AUTORIZADO', nota: 'aprobable', solicitadoPor: 'adminUid', creadoEn: new Date(), estado: 'pendiente' });
        await setDoc(doc(db, 'config/status'),  { ok: true });
        await setDoc(doc(db, 'config/negocio'), { fechaCorteMigracion: '2025-12-31' });
        await setDoc(doc(db, 'solicitudesCorreccion/s1'), { clienteId: 'cliV', estado: 'pendiente' }); // legacy: debe quedar INACCESIBLE
        await setDoc(doc(db, 'pendientes/p1'), { titulo: 'Definir corte', categoria: 'definir-kary', estado: 'pendiente' });

        // ─── Fase M (M1): solicitudes pendientes + gestión sembrada ──────────────
        await setDoc(doc(db, 'clientes/cliV/solicitudes/sol1'), { tipo: 'ajuste', monto: -80000, motivo: 'DESCUENTO_AUTORIZADO', nota: 'desc autorizado', solicitadoPor: 'adminUid', creadoEn: new Date(), estado: 'pendiente' });
        await setDoc(doc(db, 'clientes/cliV/solicitudes/sol2'), { tipo: 'ajuste', monto: -90000, motivo: 'OTRO', nota: 'caso raro', solicitadoPor: 'adminUid', creadoEn: new Date(), estado: 'pendiente' });
        await setDoc(doc(db, 'clientes/cliV/solicitudes/sol3'), { tipo: 'correccion', monto: 60000, motivo: 'ERROR_REGISTRO', nota: 'dedazo', solicitadoPor: 'adminUid', creadoEn: new Date(), estado: 'pendiente' });
        await setDoc(doc(db, 'clientes/cliV/solicitudes/sol4'), { tipo: 'ajuste', monto: -70000, motivo: 'OTRO', nota: 'x', solicitadoPor: 'adminUid', creadoEn: new Date(), estado: 'pendiente' });
        await setDoc(doc(db, 'clientes/cliV/solicitudes/sol5'), { tipo: 'ajuste', monto: -50000, motivo: 'OTRO', nota: 'dedicada al test de motivoRechazo en aprobada', solicitadoPor: 'adminUid', creadoEn: new Date(), estado: 'pendiente' });
        await setDoc(doc(db, 'clientes/cliV/gestiones/g1'), { tipo: 'llamada', nota: 'no contesta', fecha: '2026-06-10', resultado: 'no_contesto', registradoPor: 'adminUid', creadoEn: new Date() });

        // ─── Acuerdos de pago v2 (MUTEX): un cliente SIN acuerdo + uno CON vigente ──
        const acBase = { fechaPacto: '2026-06-01',
            cuotas: [{ fecha: '2026-06-15', monto: 50000 }], periodicidad: 'mensual',
            primeraCuotaFecha: '2026-06-15', ultimaCuotaFecha: '2026-06-15',
            nota: 'pacto sembrado', estado: 'vigente', creadoPor: 'adminUid',
            creadoEn: new Date(), rolAlCrear: 'admin' };
        await setDoc(doc(db, 'clientes/cliAcuVacio'), { nombre: 'Sin acuerdo', saldoActual: 0 });
        await setDoc(doc(db, 'clientes/cliAcuVig'), { nombre: 'Con acuerdo', saldoActual: 0, acuerdoVigenteId: 'acVig' });
        await setDoc(doc(db, 'clientes/cliAcuVig/acuerdos/acVig'), acBase);  // el vigente apuntado por el puntero
        await setDoc(doc(db, 'clientes/cliAnu'), { nombre: 'Para anular', saldoActual: 0, acuerdoVigenteId: 'acAnu' });
        await setDoc(doc(db, 'clientes/cliAnu/acuerdos/acAnu'), acBase);     // owner anula OK / admin FALLA
        await setDoc(doc(db, 'clientes/cliAcuVig/acuerdos/acCerrado'), { ...acBase, estado: 'reemplazado', reemplazadoPor: 'acVig' }); // no-vigente: inmutable

        // ─── Fase M (M2b): semillas del batch de aprobación de Daniel ────────────
        await setDoc(doc(db, 'clientes/cliV/movimientos/mCorr'), { tipo: 'factura', monto: 500000, fecha: '2026-06-01', registradoPor: 'adminUid', anulado: false });          // original VIGENTE (corrección feliz)
        await setDoc(doc(db, 'clientes/cliV/movimientos/mYaAnulado'), { tipo: 'factura', monto: 500000, fecha: '2026-06-01', registradoPor: 'adminUid', anulado: true, anuladoPor: 'adminUid', motivoAnulacion: 'corregido antes' }); // carrera: ya anulado
        await setDoc(doc(db, 'clientes/cliV/solicitudes/solM2b1'), { tipo: 'correccion', monto: -420000, motivo: 'dedazo', nota: 'era 80 mil', solicitadoPor: 'adminUid', creadoEn: new Date(), estado: 'pendiente', correccionDe: 'mCorr',
            datosCorreccion: { reemplazo: { tipo: 'factura', monto: 80000, fecha: '2026-06-01' }, snapshotOriginal: { tipo: 'factura', monto: 500000, fecha: '2026-06-01', anulado: false }, motivoCategoria: 'CORRECCION' } });
        await setDoc(doc(db, 'clientes/cliV/solicitudes/solM2b2'), { tipo: 'correccion', monto: -420000, motivo: 'dedazo', nota: 'era 80 mil', solicitadoPor: 'adminUid', creadoEn: new Date(), estado: 'pendiente', correccionDe: 'mYaAnulado',
            datosCorreccion: { reemplazo: { tipo: 'factura', monto: 80000, fecha: '2026-06-01' }, snapshotOriginal: { tipo: 'factura', monto: 500000, fecha: '2026-06-01', anulado: false }, motivoCategoria: 'CORRECCION' } });
        await setDoc(doc(db, 'clientes/cliV/solicitudes/solM2b3'), { tipo: 'ajuste', monto: -90000, motivo: 'DESCUENTO_AUTORIZADO', nota: 'autorizado', solicitadoPor: 'adminUid', creadoEn: new Date(), estado: 'pendiente' });
        await setDoc(doc(db, 'clientes/cliV/solicitudes/solM2b4'), { tipo: 'ajuste', monto: -90000, motivo: 'OTRO', nota: 'x', solicitadoPor: 'adminUid', creadoEn: new Date(), estado: 'pendiente' });

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

// ─── B1 paso 1: inventario/clasificación (stockType/cantidad/gender) ──────────
test('B1 · crea pieza con stockType/cantidad/gender válidos', async () => {
    await assertSucceeds(setDoc(doc(asUser('catalogoUid'), 'pieces/pInv'), {
        name: 'Anillo', code: 'C-INV', stockType: 'finito', cantidad: 1, gender: 'mujer',
    }));
});
test('B1 · stockType fuera del enum → DENY', async () => {
    await assertFails(setDoc(doc(asUser('catalogoUid'), 'pieces/pInvBad1'), {
        name: 'X', code: 'C-IB1', stockType: 'infinito',
    }));
});
test('B1 · cantidad negativa o no-int → DENY', async () => {
    await assertFails(setDoc(doc(asUser('catalogoUid'), 'pieces/pInvBad2'), { name: 'X', code: 'C-IB2', cantidad: -1 }));
    await assertFails(setDoc(doc(asUser('catalogoUid'), 'pieces/pInvBad3'), { name: 'X', code: 'C-IB3', cantidad: 'dos' }));
});
test('B1 · gender fuera del enum → DENY', async () => {
    await assertFails(setDoc(doc(asUser('catalogoUid'), 'pieces/pInvBad4'), { name: 'X', code: 'C-IB4', gender: 'otro' }));
});
test('B1 · patch merge con cantidad válida en pieza existente SÍ pasa', async () => {
    await assertSucceeds(setDoc(doc(asUser('catalogoUid'), 'pieces/p1'), { cantidad: 2, stockType: 'encargo' }, { merge: true }));
});
test('S6 · colección: editor crea con name', async () => {
    await assertSucceeds(setDoc(doc(asUser('editorUid'), 'collections/c1'), { name: 'Anillos', slug: 'anillos' }));
});
test('S6 · colección: NO crea sin name', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'collections/c2'), { subtitle: 'x' }));
});

// ─── Rol "catálogo" (TODO-19, §114-build): CRUD en pieces/collections, CANDADO en el resto ──
test('catálogo · crea + edita pieza', async () => {
    await assertSucceeds(setDoc(doc(asUser('catalogoUid'), 'pieces/pCat'), { name: 'Aretes', code: 'C-CAT', slug: 'aretes' }));
    await assertSucceeds(setDoc(doc(asUser('catalogoUid'), 'pieces/pCat'), { price: 100 }, { merge: true }));
});
test('catálogo · BORRA pieza (a diferencia de editor)', async () => {
    await assertSucceeds(deleteDoc(doc(asUser('catalogoUid'), 'pieces/pCat')));
});
test('catálogo · crea + borra colección', async () => {
    await assertSucceeds(setDoc(doc(asUser('catalogoUid'), 'collections/cCat'), { name: 'Aretes', slug: 'aretes' }));
    await assertSucceeds(deleteDoc(doc(asUser('catalogoUid'), 'collections/cCat')));
});
test('regresión · editor NO borra pieza; admin SÍ (delete = admin||catálogo, NUNCA editor)', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'pieces/pDel'), { name: 'X', code: 'C-DEL' }));
    await assertFails(deleteDoc(doc(asUser('editorUid'), 'pieces/pDel')));
    await assertSucceeds(deleteDoc(doc(asUser('adminUid'), 'pieces/pDel')));
});
test('catálogo · CANDADO: NO escribe journal ni siteContent (CMS = editor+)', async () => {
    await assertFails(setDoc(doc(asUser('catalogoUid'), 'journal/jCat'), { title: 'X', excerpt: 'y', image: '/i.webp', published: true }));
    await assertFails(setDoc(doc(asUser('catalogoUid'), 'siteContent/home'), { hero: { title: 'X' } }, { merge: true }));
});
test('catálogo · CANDADO: NO lee ni crea clientes (CRM = admin+)', async () => {
    await assertFails(getDoc(doc(asUser('catalogoUid'), 'clientes/cliV')));
    await assertFails(setDoc(doc(asUser('catalogoUid'), 'clientes/cCat'), { nombre: 'X' }));
});
test('catálogo · CANDADO: NO crea movimientos (dinero = admin+)', async () => {
    await assertFails(setDoc(doc(asUser('catalogoUid'), 'clientes/cliV/movimientos/mCat'), {
        tipo: 'factura', monto: 1000, fecha: '2026-06-01', registradoPor: 'catalogoUid', registradoEn: serverTimestamp(), anulado: false }));
});
test('catálogo · CANDADO: NO escribe config ni vendedoras (admin+/owner)', async () => {
    await assertFails(setDoc(doc(asUser('catalogoUid'), 'config/negocio'), { x: 1 }, { merge: true }));
    await assertFails(setDoc(doc(asUser('catalogoUid'), 'vendedoras/vCat'), { nombre: 'X', activa: true }));
});
test('catálogo · CANDADO: NO crea usuarios (users = owner-only)', async () => {
    await assertFails(setDoc(doc(asUser('catalogoUid'), 'users/uCat'), { role: 'catalogo', email: 'x@x.co' }));
});

// ─── CMS · Journal: lectura pública, escritura editor con hasOnly tipado ──────
test('journal · lectura pública', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'journal/j1')));
});
test('journal · editor crea entrada bien formada', async () => {
    await assertSucceeds(setDoc(doc(asUser('editorUid'), 'journal/e1'), {
        title: 'El alma verde', section: 'Reportaje', excerpt: 'x',
        date: '2026-06-14', image: '/img/x.webp', featured: false, published: true,
    }));
});
test('journal · NO crea sin title', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'journal/e2'), { excerpt: 'sin titulo' }));
});
test('journal · hasOnly RECHAZA campo inyectado fuera del whitelist', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'journal/e3'), { title: 'X', hacker: 'evil' }));
});
test('journal · RECHAZA date con formato inválido', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'journal/e4'), { title: 'X', date: '14/06/2026' }));
});
test('journal · cliente SIN rol NO escribe', async () => {
    await assertFails(setDoc(doc(asUser('customerUid'), 'journal/e5'), { title: 'X' }));
});
test('journal · editor NO borra; admin SÍ', async () => {
    await assertFails(deleteDoc(doc(asUser('editorUid'), 'journal/j1')));
    await assertSucceeds(deleteDoc(doc(asUser('adminUid'), 'journal/j1')));
});
// PUERTA cero-ficción Fase B (TODO-24): publicado ⇒ image+excerpt reales. La entrada
// completa de arriba pasa (no-regresión); una incompleta NO se puede publicar.
test('journal · cero-ficción: NO publica sin imagen/resumen', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'journal/eIncompleta'), {
        title: 'Solo título', published: true,
    }));
});

// ─── CMS · Films (videos del home) — cero-ficción Fase B (TODO-24) ───────────
test('films · editor crea video PUBLICADO completo (title+thumb+href)', async () => {
    await assertSucceeds(setDoc(doc(asUser('editorUid'), 'films/f1'), {
        title: 'Tallado', thumb: '/img/v.webp', href: 'https://youtu.be/x',
        cat: 'Atelier', published: true, featured: true,
    }));
});
test('films · borrador incompleto SÍ se guarda (published=false)', async () => {
    await assertSucceeds(setDoc(doc(asUser('editorUid'), 'films/f2'), { title: 'Borrador', published: false }));
});
test('films · cero-ficción: NO publica sin miniatura', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'films/f3'), { title: 'X', href: 'https://youtu.be/x', published: true }));
});
test('films · cero-ficción: NO publica sin enlace', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'films/f4'), { title: 'X', thumb: '/img/v.webp', published: true }));
});
test('films · NO crea sin title (ni borrador)', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'films/f5'), { published: false, thumb: '/img/v.webp' }));
});
test('films · hasOnly RECHAZA campo inyectado', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'films/f6'), { title: 'X', hacker: 'evil' }));
});
test('films · lectura pública; editor NO borra, admin SÍ', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'films/f1')));
    await assertFails(deleteDoc(doc(asUser('editorUid'), 'films/f1')));
    await assertSucceeds(deleteDoc(doc(asUser('adminUid'), 'films/f1')));
});

// ─── CMS · SocialPosts (feed de redes del home, curado manual) ──────────────
test('socialPosts · editor crea post PUBLICADO completo (thumb+caption+platform)', async () => {
    await assertSucceeds(setDoc(doc(asUser('editorUid'), 'socialPosts/s1'), {
        platform: 'Instagram', thumb: '/img/p.webp', caption: 'Nuevo anillo',
        href: 'https://instagram.com/p/x', published: true,
    }));
});
test('socialPosts · cero-ficción: NO publica con red no soportada', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'socialPosts/s2'), {
        platform: 'Threads', thumb: '/img/p.webp', caption: 'x', published: true,
    }));
});
test('socialPosts · cero-ficción: NO publica sin texto', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'socialPosts/s3'), {
        platform: 'Instagram', thumb: '/img/p.webp', published: true,
    }));
});
test('socialPosts · borrador incompleto SÍ se guarda', async () => {
    await assertSucceeds(setDoc(doc(asUser('editorUid'), 'socialPosts/s4'), { platform: 'TikTok', published: false }));
});
test('socialPosts · cliente SIN rol NO escribe', async () => {
    await assertFails(setDoc(doc(asUser('customerUid'), 'socialPosts/s5'), { platform: 'Instagram', published: false }));
});
test('socialPosts · cero-ficción: NO publica sin enlace al post (href obligatorio)', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'socialPosts/sNoHref'), {
        platform: 'Instagram', thumb: '/img/p.webp', caption: 'sin enlace', published: true,
    }));
});

// cero-ficción: campos SOLO-espacios NO cuentan como contenido real (nonEmptyStr usa .trim()).
test('cero-ficción whitespace · films NO publica con miniatura en blanco (espacios)', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'films/fws'), {
        title: 'X', thumb: '   ', href: 'https://y/x', published: true,
    }));
});
test('cero-ficción whitespace · journal NO publica con imagen/resumen en blanco', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'journal/jws'), {
        title: 'X', image: ' ', excerpt: '  ', published: true,
    }));
});
test('cero-ficción whitespace · social NO publica con texto en blanco', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'socialPosts/sws'), {
        platform: 'Instagram', thumb: '/img/p.webp', caption: '   ', published: true,
    }));
});

// ─── CMS · B1: system/meta (señal de frescura) — write editor + hasOnly ──────
test('system/meta · editor escribe la señal de cache (lastDataUpdate)', async () => {
    await assertSucceeds(setDoc(doc(asUser('editorUid'), 'system/meta'),
        { lastDataUpdate: serverTimestamp() }, { merge: true }));
});
test('system/meta · lectura pública (la web detecta cambios)', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'system/meta')));
});
test('system/meta · anónimo NO escribe', async () => {
    await assertFails(setDoc(doc(anon(), 'system/meta'), { lastDataUpdate: serverTimestamp() }));
});
test('system/meta · hasOnly RECHAZA clave fuera del whitelist', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'system/meta'),
        { lastDataUpdate: serverTimestamp(), hacker: 'x' }, { merge: true }));
});

// ─── CMS · P1: siteContent (singletons de texto) — write editor + hasOnly + maps ─
test('siteContent · editor escribe contenido de home (sub-mapas)', async () => {
    await assertSucceeds(setDoc(doc(asUser('editorUid'), 'siteContent/home'), {
        hero: { h1a: 'Alta', h1b: 'joyería', manifiesto: 'x' },
        editorial: { titulo: 'T', lead: 'L' },
        _published: true,
    }));
});
test('siteContent · lectura pública', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'siteContent/home')));
});
test('siteContent · anónimo NO escribe', async () => {
    await assertFails(setDoc(doc(anon(), 'siteContent/home'), { hero: { h1a: 'x' } }));
});
test('siteContent · hasOnly RECHAZA sub-mapa no previsto', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'siteContent/home'), { hacker: { x: 1 } }));
});
test('siteContent · RECHAZA sub-mapa que no es map', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'siteContent/home'), { hero: 'no-soy-map' }));
});
test('siteContent · editor escribe contacto (hero/proceso/faq)', async () => {
    await assertSucceeds(setDoc(doc(asUser('editorUid'), 'siteContent/contacto'), {
        hero: { eyebrow: 'x' }, proceso: { title1: 'y' }, faq: { q1: 'z' },
    }));
});
test('siteContent · per-página: RECHAZA sub-mapa de OTRA página', async () => {
    // 'editorial' es de home, no de contacto → hasOnly por-página lo rechaza
    await assertFails(setDoc(doc(asUser('editorUid'), 'siteContent/contacto'), { editorial: { x: 1 } }));
});
test('siteContent · RECHAZA página desconocida (id raro)', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'siteContent/hackerpage'), { hero: { x: 1 } }));
});
// P4: Nosotros con modelo PLANO (12 claves; listas = arrays dentro de sub-mapas `is map`).
test('siteContent · editor escribe nosotros con listas dentro del cap', async () => {
    await assertSucceeds(setDoc(doc(asUser('editorUid'), 'siteContent/nosotros'), {
        hero: { eyebrow: 'x' },
        valores: { eyebrow: 'P', titlePre: 'a', titleEm: 'b', items: [{ t: 'a', d: 'b' }, { t: 'c', d: 'd' }] },
        timeline: { titlePre: 't', titleEm: 'c', items: [{ y: '2013', t: 'x', d: 'y' }] },
        equipo: { items: [{ n: 'K', r: 'R', b: 'B' }] },
        atelier: { title1: 'A', p1: 'x' },
        cifras: { items: [{ n: '13', l: 'años', s: 's' }] },
        certificaciones: { items: [] },
        resenas: { items: [] },
        faqs: { items: [{ q: 'q', a: 'a' }] },
        cierre: { ctaLabel: 'Hablemos' },
    }));
});
// §103 F1: el LQIP (placeholder difuso) viaja como campo INTERNO de una sección. Las reglas
// validan la whitelist a nivel de SECCIÓN (is map), NO las claves internas → se acepta sin
// tocar firestore.rules (verificado: siteContentValid no recursa en las claves del sub-mapa).
test('siteContent · §103 F1: acepta imageLqip/bgImageLqip dentro de una sección (sin cambio de reglas)', async () => {
    await assertSucceeds(setDoc(doc(asUser('editorUid'), 'siteContent/home'), {
        hero: { bgImage: 'https://fs/x.webp', bgImageLqip: 'data:image/webp;base64,AAAA' },
        editorial: { image: 'https://fs/e.webp', imageLqip: 'data:image/webp;base64,BBBB' },
    }));
    await assertSucceeds(setDoc(doc(asUser('editorUid'), 'siteContent/nosotros'), {
        hero: { image: 'https://fs/h.webp', imageLqip: 'data:image/webp;base64,CCCC' },
        atelier: { image: 'https://fs/a.webp', imageLqip: 'data:image/webp;base64,DDDD' },
        equipo: { items: [{ n: 'K', r: 'R', b: 'B', img: 'https://fs/k.webp', imgLqip: 'data:image/webp;base64,EEEE' }] },
    }));
});
test('siteContent · nosotros: lista vacía [] permitida (hide-when-empty)', async () => {
    await assertSucceeds(setDoc(doc(asUser('editorUid'), 'siteContent/nosotros'), {
        valores: { items: [] }, faqs: { items: [] },
    }));
});
test('siteContent · nosotros: RECHAZA lista que supera el cap de cardinalidad (25 > 24)', async () => {
    const big = Array.from({ length: 25 }, (_, i) => ({ t: 't' + i, d: 'd' + i }));
    await assertFails(setDoc(doc(asUser('editorUid'), 'siteContent/nosotros'), { valores: { items: big } }));
});
test('siteContent · nosotros: RECHAZA lista de reseñas que supera el cap (25 > 24)', async () => {
    const big = Array.from({ length: 25 }, (_, i) => ({ n: 'n' + i, t: 't' + i, loc: 'g' }));
    await assertFails(setDoc(doc(asUser('editorUid'), 'siteContent/nosotros'), { resenas: { items: big } }));
});
test('siteContent · nosotros: RECHAZA campo de lista mal-tipado (items NO es list)', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'siteContent/nosotros'), { valores: { items: 'no-soy-lista' } }));
});
test('siteContent · nosotros: RECHAZA clave fuera de la whitelist (cartagena ya no existe)', async () => {
    await assertFails(setDoc(doc(asUser('editorUid'), 'siteContent/nosotros'), { cartagena: { stats: [] } }));
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
test('CRM mov · admin crea abono y apertura positiva (contract M3); tipo inválido rechazado', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mA'), {
        tipo: 'abono', monto: 5000, fecha: '2026-06-07', medioPago: 'efectivo',
        registradoPor: 'adminUid', registradoEn: serverTimestamp(), anulado: false }));
    // M0-H (§69): la apertura NEGATIVA pasó a owner-only (test propio abajo); la positiva sigue admin.
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mAp'), {
        tipo: 'apertura', monto: 1000, fecha: '2026-06-07',
        registradoPor: 'adminUid', registradoEn: serverTimestamp(), anulado: false }));
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
test('CRM mov · anular con el contract M3: admin solo ≤ tope; > tope va al owner', async () => {
    // m1 = factura $100.000 > tope ($50.000) → el ADMIN ya no puede anularla (M3)…
    await assertFails(updateDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m1'),
        { anulado: true, anuladoPor: 'adminUid', anuladoEn: serverTimestamp(), motivoAnulacion: 'duplicado', motivoCategoria: 'DUPLICADO' }));
    // …el OWNER sí.
    await assertSucceeds(updateDoc(doc(asUser('ownerUid'), 'clientes/cliV/movimientos/m1'),
        { anulado: true, anuladoPor: 'ownerUid', anuladoEn: serverTimestamp(), motivoAnulacion: 'duplicado', motivoCategoria: 'DUPLICADO' }));
    // factura CHICA (≤ tope) → el admin anula con motivo + categoría + reloj de servidor.
    await assertSucceeds(updateDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mChico'),
        { anulado: true, anuladoPor: 'adminUid', anuladoEn: serverTimestamp(), motivoAnulacion: 'duplicado', motivoCategoria: 'DUPLICADO' }));
});
// ─── M2a-1b (ADR §73): EXPAND aditivo — anulación con enlace de corrección ─────
test('M2a-1b/M3 · anular con enlace de corrección: campo extra y tipos inválidos fallan; enlace válido pasa', async () => {
    const ref = doc(asUser('adminUid'), 'clientes/cliV/movimientos/mLink');   // factura $40.000 ≤ tope
    const base = { anulado: true, anuladoPor: 'adminUid', anuladoEn: serverTimestamp(), motivoAnulacion: 'corrección' };
    // (los assertFails NO mutan mLink → sigue anulado:false hasta el éxito final)
    // clave fuera del whitelist (inyección) → rechazada
    await assertFails(updateDoc(ref, { ...base, hacked: true, motivoCategoria: 'CORRECCION' }));
    // motivoCategoria vacío / fuera de lista → rechazada (M3: lista cerrada obligatoria)
    await assertFails(updateDoc(ref, { ...base, motivoCategoria: '', corregidoPor: 'mNuevo' }));
    await assertFails(updateDoc(ref, { ...base, motivoCategoria: 'PORQUE_SI', corregidoPor: 'mNuevo' }));
    // corregidoPor no-string → rechazada
    await assertFails(updateDoc(ref, { ...base, motivoCategoria: 'CORRECCION', corregidoPor: 123 }));
    // enlace VÁLIDO (motivoCategoria + corregidoPor) → pasa
    await assertSucceeds(updateDoc(ref, { ...base, motivoCategoria: 'CORRECCION', corregidoPor: 'mNuevo' }));
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
        { tipo: 'factura', monto: 50000, fecha: '2026-06-07', registradoPor: 'adminUid', registradoEn: serverTimestamp(), anulado: false }));
});
test('CRM mov · fecha con formato NO ISO es rechazada (validación server-side)', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mBadFecha'),
        { tipo: 'factura', monto: 1000, fecha: '2026/06/07', registradoPor: 'adminUid', registradoEn: serverTimestamp(), anulado: false }));
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
        { tipo: 'abono', monto: 12345, fecha: '2026-06-07', medioPago: 'transferencia',
          registradoPor: 'adminUid', registradoEn: serverTimestamp(), anulado: false }));
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
        { tipo: 'apertura', monto: -50000, fecha: '2026-06-07', registradoPor: 'adminUid', registradoEn: serverTimestamp(), anulado: false }));
    await assertSucceeds(setDoc(doc(asUser('ownerUid'), 'clientes/cliV/movimientos/apNegO'),
        { tipo: 'apertura', monto: -50000, fecha: '2026-06-07', registradoPor: 'ownerUid', registradoEn: serverTimestamp(), anulado: false }));
});
test('M3 · ajuste negativo del admin: motivo NEUTRO y dentro del tope → pasa; el payload viejo (sin motivo) → falla', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/ajNeg'),
        { tipo: 'ajuste', monto: -10000, fecha: '2026-06-07', motivo: 'ERROR_REGISTRO', nota: 'dedazo corregido',
          registradoPor: 'adminUid', registradoEn: serverTimestamp(), anulado: false }));
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/ajNegViejo'),
        { tipo: 'ajuste', monto: -10000, fecha: '2026-06-07', registradoPor: 'adminUid', registradoEn: serverTimestamp(), anulado: false }));
});

// ─── Fase M · M0 (§69): config/cartera = límites de la operadora → owner-only ──
test('M0 · config/cartera: admin NO la escribe (sus propios límites), owner SÍ', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'config/cartera'),
        { autoAprobacionMax: 999999999 }, { merge: true }));
    await assertSucceeds(setDoc(doc(asUser('ownerUid'), 'config/cartera'),
        { autoAprobacionMax: 50000 }, { merge: true }));
});
test('M0 · config/cartera: admin SÍ la lee (la UI necesita los límites)', async () => {
    await assertSucceeds(getDoc(doc(asUser('adminUid'), 'config/cartera')));
});
test('M0 · no-regresión: config/negocio sigue siendo editable por admin (Kary)', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'config/negocio'),
        { diasPlazo: 30 }, { merge: true }));
});

// ─── Fase M · M1 (§69): solicitudes de aprobación ("el asiento nace al aprobarse") ─
test('M1 solicitud · admin crea válida (nace pendiente, sellada por el servidor)', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV/solicitudes/solNueva'), {
        tipo: 'ajuste', monto: -120000, motivo: 'DESCUENTO_AUTORIZADO', nota: 'autorizado por WhatsApp',
        solicitadoPor: 'adminUid', creadoEn: serverTimestamp(), estado: 'pendiente',
    }));
});
test('M1 solicitud · estado pre-cocinado (nace aprobada) es rechazado', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/solicitudes/solPre'), {
        tipo: 'ajuste', monto: -1000, motivo: 'OTRO', nota: 'x',
        solicitadoPor: 'adminUid', creadoEn: serverTimestamp(), estado: 'aprobada',
    }));
});
test('M1 solicitud · solicitadoPor ajeno (suplantación) es rechazado', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/solicitudes/solSupl'), {
        tipo: 'ajuste', monto: -1000, motivo: 'OTRO', nota: 'x',
        solicitadoPor: 'ownerUid', creadoEn: serverTimestamp(), estado: 'pendiente',
    }));
});
test('M1 solicitud · creadoEn del cliente (no serverTimestamp) es rechazado', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/solicitudes/solReloj'), {
        tipo: 'ajuste', monto: -1000, motivo: 'OTRO', nota: 'x',
        solicitadoPor: 'adminUid', creadoEn: new Date('2020-01-01'), estado: 'pendiente',
    }));
});
test('M1 solicitud · campo extra (inyección) y editor son rechazados', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/solicitudes/solIny'), {
        tipo: 'ajuste', monto: -1000, motivo: 'OTRO', nota: 'x', hacked: true,
        solicitadoPor: 'adminUid', creadoEn: serverTimestamp(), estado: 'pendiente',
    }));
    await assertFails(setDoc(doc(asUser('editorUid'), 'clientes/cliV/solicitudes/solEd'), {
        tipo: 'ajuste', monto: -1000, motivo: 'OTRO', nota: 'x',
        solicitadoPor: 'editorUid', creadoEn: serverTimestamp(), estado: 'pendiente',
    }));
});
test('M1 transición · el ADMIN no aprueba (el corazón del SoD)', async () => {
    await assertFails(updateDoc(doc(asUser('adminUid'), 'clientes/cliV/solicitudes/sol1'), {
        estado: 'aprobada', resueltoPor: 'adminUid', resueltoEn: serverTimestamp(),
    }));
});
test('M1 transición · owner aprueba con sello del servidor', async () => {
    await assertSucceeds(updateDoc(doc(asUser('ownerUid'), 'clientes/cliV/solicitudes/sol1'), {
        estado: 'aprobada', resueltoPor: 'ownerUid', resueltoEn: serverTimestamp(),
    }));
});
test('M1 transición · re-resolver una APROBADA es rechazado (one-way)', async () => {
    await assertFails(updateDoc(doc(asUser('ownerUid'), 'clientes/cliV/solicitudes/sol1'), {
        estado: 'rechazada', resueltoPor: 'ownerUid', resueltoEn: serverTimestamp(), motivoRechazo: 'cambio de idea',
    }));
});
test('M1 transición · rechazar SIN motivo es rechazado; con motivo pasa', async () => {
    await assertFails(updateDoc(doc(asUser('ownerUid'), 'clientes/cliV/solicitudes/sol2'), {
        estado: 'rechazada', resueltoPor: 'ownerUid', resueltoEn: serverTimestamp(),
    }));
    await assertSucceeds(updateDoc(doc(asUser('ownerUid'), 'clientes/cliV/solicitudes/sol2'), {
        estado: 'rechazada', resueltoPor: 'ownerUid', resueltoEn: serverTimestamp(), motivoRechazo: 'no procede',
    }));
});
test('M1 transición · aprobar con motivoRechazo colado es rechazado (contrato estado↔campo, ADR §72)', async () => {
    // 'aprobada' NO puede portar motivoRechazo → estado de datos contradictorio que M2b leería.
    await assertFails(updateDoc(doc(asUser('ownerUid'), 'clientes/cliV/solicitudes/sol5'), {
        estado: 'aprobada', resueltoPor: 'ownerUid', resueltoEn: serverTimestamp(), motivoRechazo: 'no me convence',
    }));
    // la misma pendiente, aprobada LIMPIA (sin el campo), SÍ pasa.
    await assertSucceeds(updateDoc(doc(asUser('ownerUid'), 'clientes/cliV/solicitudes/sol5'), {
        estado: 'aprobada', resueltoPor: 'ownerUid', resueltoEn: serverTimestamp(),
    }));
});
test('M1 transición · la solicitante cancela la suya; un admin AJENO no', async () => {
    await assertFails(updateDoc(doc(asClaim('otroAdmin', 'admin'), 'clientes/cliV/solicitudes/sol4'), {
        estado: 'cancelada', canceladoPor: 'otroAdmin', canceladoEn: serverTimestamp(),
    }));
    await assertSucceeds(updateDoc(doc(asUser('adminUid'), 'clientes/cliV/solicitudes/sol3'), {
        estado: 'cancelada', canceladoPor: 'adminUid', canceladoEn: serverTimestamp(),
    }));
});
test('M1 solicitud · NADIE borra (el ciclo queda en el libro)', async () => {
    await assertFails(deleteDoc(doc(asUser('ownerUid'), 'clientes/cliV/solicitudes/sol4')));
});
test('M1 solicitudes · collectionGroup: admin lee pendientes; editor NO', async () => {
    await assertSucceeds(getDocs(query(collectionGroup(asUser('adminUid'), 'solicitudes'),
        where('estado', '==', 'pendiente'))));
    await assertFails(getDocs(query(collectionGroup(asUser('editorUid'), 'solicitudes'),
        where('estado', '==', 'pendiente'))));
});

// ─── Fase M · M1 (§69): gestiones de cobro (evidencia inmutable, art. 146 ET) ──
test('M1 gestión · admin registra una gestión válida', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV/gestiones/gNueva'), {
        tipo: 'whatsapp', nota: 'prometió abonar el viernes', fecha: '2026-06-10',
        resultado: 'promesa_pago', registradoPor: 'adminUid', creadoEn: serverTimestamp(),
    }));
});
test('M1 gestión · sin resultado o con resultado/tipo fuera de lista es rechazada', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/gestiones/gSin'), {
        tipo: 'llamada', fecha: '2026-06-10', registradoPor: 'adminUid', creadoEn: serverTimestamp(),
    }));
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/gestiones/gRes'), {
        tipo: 'llamada', fecha: '2026-06-10', resultado: 'se_intentó', registradoPor: 'adminUid', creadoEn: serverTimestamp(),
    }));
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/gestiones/gTipo'), {
        tipo: 'telegrama', fecha: '2026-06-10', resultado: 'otro', registradoPor: 'adminUid', creadoEn: serverTimestamp(),
    }));
});
test('M1 gestión · INMUTABLE: ni update ni delete (ni el owner)', async () => {
    await assertFails(updateDoc(doc(asUser('ownerUid'), 'clientes/cliV/gestiones/g1'), { nota: 'editada' }));
    await assertFails(deleteDoc(doc(asUser('ownerUid'), 'clientes/cliV/gestiones/g1')));
});

// ─── Fase M · M2b (§69 C3): el writeBatch de aprobación de Daniel ──────────────
// Las reglas evalúan cada escritura contra el estado PRE-batch: "estaba pendiente"
// vale por diseño, y un original ya anulado revienta el batch ENTERO (atómico).

test('M2b batch · corrección aprobada por el OWNER: 3 escrituras pasan juntas', async () => {
    const db = asUser('ownerUid');
    const nuevoRef = doc(collection(db, 'clientes/cliV/movimientos'));
    const batch = writeBatch(db);
    batch.update(doc(db, 'clientes/cliV/movimientos/mCorr'), {
        anulado: true, anuladoPor: 'ownerUid', anuladoEn: serverTimestamp(),
        motivoAnulacion: 'era 80 mil', motivoCategoria: 'CORRECCION', corregidoPor: nuevoRef.id,
    });
    batch.set(nuevoRef, {
        tipo: 'factura', monto: 80000, fecha: '2026-06-01', correccionDe: 'mCorr',
        solicitudId: 'solM2b1', registradoPor: 'ownerUid', registradoEn: serverTimestamp(), anulado: false,
    });
    batch.update(doc(db, 'clientes/cliV/solicitudes/solM2b1'), {
        estado: 'aprobada', resueltoPor: 'ownerUid', resueltoEn: serverTimestamp(),
    });
    await assertSucceeds(batch.commit());
});

test('M2b batch · original YA ANULADO revienta el batch ENTERO (la solicitud queda pendiente)', async () => {
    const db = asUser('ownerUid');
    const nuevoRef = doc(collection(db, 'clientes/cliV/movimientos'));
    const batch = writeBatch(db);
    batch.update(doc(db, 'clientes/cliV/movimientos/mYaAnulado'), {
        anulado: true, anuladoPor: 'ownerUid', anuladoEn: serverTimestamp(),
        motivoAnulacion: 'era 80 mil', motivoCategoria: 'CORRECCION', corregidoPor: nuevoRef.id,
    });
    batch.set(nuevoRef, {
        tipo: 'factura', monto: 80000, fecha: '2026-06-01', correccionDe: 'mYaAnulado',
        solicitudId: 'solM2b2', registradoPor: 'ownerUid', registradoEn: serverTimestamp(), anulado: false,
    });
    batch.update(doc(db, 'clientes/cliV/solicitudes/solM2b2'), {
        estado: 'aprobada', resueltoPor: 'ownerUid', resueltoEn: serverTimestamp(),
    });
    await assertFails(batch.commit());   // anulacionValida: resource.anulado debe ser false
    // ATOMICIDAD: ninguna pata se aplicó — la solicitud sigue pendiente y el
    // reemplazo no existe (es el invariante anti-doble-reducción del plan §69).
    const sol = await getDoc(doc(asUser('ownerUid'), 'clientes/cliV/solicitudes/solM2b2'));
    if (sol.data().estado !== 'pendiente') throw new Error('el batch fallido dejó la solicitud transicionada');
    const nuevo = await getDoc(doc(asUser('ownerUid'), `clientes/cliV/movimientos/${nuevoRef.id}`));
    if (nuevo.exists()) throw new Error('el batch fallido dejó creado el reemplazo');
});

test('M2b batch · aprobación SIMPLE (ajuste) del owner: 2 escrituras pasan juntas', async () => {
    const db = asUser('ownerUid');
    const movRef = doc(collection(db, 'clientes/cliV/movimientos'));
    const batch = writeBatch(db);
    batch.set(movRef, {
        tipo: 'ajuste', monto: -90000, fecha: '2026-06-10',
        descripcion: 'Corrección aprobada (DESCUENTO_AUTORIZADO): autorizado',
        // M3 (deferido 4 §74): motivo+nota TOP-LEVEL — la COINCIDENCIA exige motivo idéntico.
        motivo: 'DESCUENTO_AUTORIZADO', nota: 'autorizado',
        solicitudId: 'solM2b3', registradoPor: 'ownerUid', registradoEn: serverTimestamp(), anulado: false,
    });
    batch.update(doc(db, 'clientes/cliV/solicitudes/solM2b3'), {
        estado: 'aprobada', resueltoPor: 'ownerUid', resueltoEn: serverTimestamp(),
    });
    await assertSucceeds(batch.commit());
});

test('M2b batch · un ADMIN no puede ejecutar la aprobación (el batch entero falla)', async () => {
    const db = asUser('adminUid');
    const movRef = doc(collection(db, 'clientes/cliV/movimientos'));
    const batch = writeBatch(db);
    batch.set(movRef, {
        tipo: 'ajuste', monto: -90000, solicitudId: 'solM2b4',
        registradoPor: 'adminUid', registradoEn: serverTimestamp(), anulado: false,
    });
    batch.update(doc(db, 'clientes/cliV/solicitudes/solM2b4'), {
        estado: 'aprobada', resueltoPor: 'adminUid', resueltoEn: serverTimestamp(),
    });
    await assertFails(batch.commit());   // transicionSolicitudValida exige isOwner()
    const sol = await getDoc(doc(asUser('adminUid'), 'clientes/cliV/solicitudes/solM2b4'));
    if (sol.data().estado !== 'pendiente') throw new Error('el batch del admin transicionó la solicitud');
});

// ─── Fase M · M3 (§69 + Consejo Externo Gemini): el CANDADO — suite exhaustiva ──
// Payload VÁLIDO de referencia (contract): cualquier desviación de aquí debe tener
// su caso rojo. Los verdes con mes/día < 10 también verifican que int('06') parsea.

test('M3 create · inyección de clave extra es rechazada (hasOnly)', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3Iny'),
        { tipo: 'factura', monto: 1000, fecha: '2026-06-07', registradoPor: 'adminUid',
          registradoEn: serverTimestamp(), anulado: false, saldoQueQuiero: 0 }));
});
test('M3 create · registradoEn que NO es el reloj del servidor es rechazado', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3Reloj'),
        { tipo: 'factura', monto: 1000, fecha: '2026-06-07', registradoPor: 'adminUid',
          registradoEn: new Date(), anulado: false }));
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3Reloj2'),
        { tipo: 'factura', monto: 1000, fecha: '2026-06-07', registradoPor: 'adminUid',
          registradoEn: '2026-06-11', anulado: false }));
});
test('M3 fecha · obligatoria; FUTURA (evasión del aging), prehistórica y 2026-02-30 rechazadas', async () => {
    const base = { tipo: 'factura', monto: 1000, registradoPor: 'adminUid', registradoEn: serverTimestamp(), anulado: false };
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3SinFecha'), base));
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3Futuro'),
        { ...base, fecha: '2030-01-01' }));                       // factura que jamás vencería
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3Viejo'),
        { ...base, fecha: '2010-01-01' }));                       // dedazo de año
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3Imposible'),
        { ...base, fecha: '2026-02-30' }));                       // calendario inválido → error → deny
});
test('M3 abono · sin medioPago / fuera de lista / medioPago en factura → rechazados', async () => {
    const base = { tipo: 'abono', monto: 1000, fecha: '2026-06-07', registradoPor: 'adminUid', registradoEn: serverTimestamp(), anulado: false };
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3SinMedio'), base));
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3MedioRaro'),
        { ...base, medioPago: 'cripto' }));
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3MedioFactura'),
        { tipo: 'factura', monto: 1000, fecha: '2026-06-07', medioPago: 'efectivo',
          registradoPor: 'adminUid', registradoEn: serverTimestamp(), anulado: false }));
});
test('M3 ajuste · sin nota o motivo fuera de lista → rechazado (también para el OWNER)', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3SinNota'),
        { tipo: 'ajuste', monto: -1000, fecha: '2026-06-07', motivo: 'ERROR_REGISTRO',
          registradoPor: 'adminUid', registradoEn: serverTimestamp(), anulado: false }));
    await assertFails(setDoc(doc(asUser('ownerUid'), 'clientes/cliV/movimientos/m3MotivoRaro'),
        { tipo: 'ajuste', monto: -1000, fecha: '2026-06-07', motivo: 'PORQUE_SI', nota: 'x',
          registradoPor: 'ownerUid', registradoEn: serverTimestamp(), anulado: false }));
});
test('M3 ajuste negativo · admin: > tope y motivo NO neutro rechazados; el owner pasa ambos', async () => {
    const base = { fecha: '2026-06-07', nota: 'caso de prueba', registradoEn: serverTimestamp(), anulado: false };
    // > tope ($50.000) con motivo neutro → admin NO
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3TopeA'),
        { ...base, tipo: 'ajuste', monto: -60000, motivo: 'ERROR_REGISTRO', registradoPor: 'adminUid' }));
    // ≤ tope pero motivo NO neutro (DESCUENTO_AUTORIZADO) → admin NO
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3NoNeutro'),
        { ...base, tipo: 'ajuste', monto: -10000, motivo: 'DESCUENTO_AUTORIZADO', registradoPor: 'adminUid' }));
    // el OWNER pasa los dos (su carril no depende del tope)
    await assertSucceeds(setDoc(doc(asUser('ownerUid'), 'clientes/cliV/movimientos/m3TopeO'),
        { ...base, tipo: 'ajuste', monto: -60000, motivo: 'ERROR_REGISTRO', registradoPor: 'ownerUid' }));
    await assertSucceeds(setDoc(doc(asUser('ownerUid'), 'clientes/cliV/movimientos/m3NoNeutroO'),
        { ...base, tipo: 'ajuste', monto: -10000, motivo: 'DESCUENTO_AUTORIZADO', registradoPor: 'ownerUid' }));
});
test('M3 ajuste positivo · admin con motivo+nota: sin tope (sube saldo) → pasa', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3Positivo'),
        { tipo: 'ajuste', monto: 900000, fecha: '2026-06-07', motivo: 'RECLASIFICACION', nota: 'reclasificación de cargo',
          registradoPor: 'adminUid', registradoEn: serverTimestamp(), anulado: false }));
});
test('M3 vencimiento · solo facturas y puede ser futuro; en abono se rechaza', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3Venc'),
        { tipo: 'factura', monto: 1000, fecha: '2026-06-07', vencimiento: '2026-09-07',
          registradoPor: 'adminUid', registradoEn: serverTimestamp(), anulado: false }));
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3VencAbono'),
        { tipo: 'abono', monto: 1000, fecha: '2026-06-07', medioPago: 'efectivo', vencimiento: '2026-09-07',
          registradoPor: 'adminUid', registradoEn: serverTimestamp(), anulado: false }));
});

// ─── M3 · COINCIDENCIA solicitud↔asiento ────────────────────────────────────────
test('M3 coincidencia · un ADMIN no crea asientos con solicitudId (aunque coincidan)', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3CoinA'),
        { tipo: 'ajuste', monto: -70000, fecha: '2026-06-07', motivo: 'DESCUENTO_AUTORIZADO', nota: 'aprobable',
          solicitudId: 'solAjusteOk', registradoPor: 'adminUid', registradoEn: serverTimestamp(), anulado: false }));
});
test('M3 coincidencia · monto o motivo divergente de la solicitud → rechazado (owner)', async () => {
    const base = { tipo: 'ajuste', fecha: '2026-06-07', nota: 'aprobable', solicitudId: 'solAjusteOk',
        registradoPor: 'ownerUid', registradoEn: serverTimestamp(), anulado: false };
    await assertFails(setDoc(doc(asUser('ownerUid'), 'clientes/cliV/movimientos/m3CoinMonto'),
        { ...base, monto: -7000, motivo: 'DESCUENTO_AUTORIZADO' }));     // monto ≠ -70000
    await assertFails(setDoc(doc(asUser('ownerUid'), 'clientes/cliV/movimientos/m3CoinMotivo'),
        { ...base, monto: -70000, motivo: 'OTRO' }));                    // motivo ≠
});
test('M3 coincidencia · hijacking: solicitud de OTRO cliente o de OTRO tipo → rechazado [Consejo]', async () => {
    // solAjena vive en cliW: el get() anclado al path de cliV no la encuentra → deny.
    await assertFails(setDoc(doc(asUser('ownerUid'), 'clientes/cliV/movimientos/m3CoinAjena'),
        { tipo: 'ajuste', monto: -70000, fecha: '2026-06-07', motivo: 'DESCUENTO_AUTORIZADO', nota: 'x',
          solicitudId: 'solAjena', registradoPor: 'ownerUid', registradoEn: serverTimestamp(), anulado: false }));
    // solM2b2 es una solicitud de CORRECCIÓN pendiente: un asiento AJUSTE no coincide.
    await assertFails(setDoc(doc(asUser('ownerUid'), 'clientes/cliV/movimientos/m3CoinTipo'),
        { tipo: 'ajuste', monto: -420000, fecha: '2026-06-07', motivo: 'ERROR_REGISTRO', nota: 'x',
          solicitudId: 'solM2b2', registradoPor: 'ownerUid', registradoEn: serverTimestamp(), anulado: false }));
});
test('M3 coincidencia · solicitud ya RESUELTA no respalda asientos nuevos (anti-replay)', async () => {
    // solM2b3 quedó 'aprobada' en el batch de arriba → un segundo asiento con su id falla.
    await assertFails(setDoc(doc(asUser('ownerUid'), 'clientes/cliV/movimientos/m3Replay'),
        { tipo: 'ajuste', monto: -90000, fecha: '2026-06-07', motivo: 'DESCUENTO_AUTORIZADO', nota: 'autorizado',
          solicitudId: 'solM2b3', registradoPor: 'ownerUid', registradoEn: serverTimestamp(), anulado: false }));
});
test('M3 coincidencia · VERDE: el owner aprueba un ajuste idéntico a su solicitud pendiente', async () => {
    await assertSucceeds(setDoc(doc(asUser('ownerUid'), 'clientes/cliV/movimientos/m3CoinOk'),
        { tipo: 'ajuste', monto: -70000, fecha: '2026-06-07', motivo: 'DESCUENTO_AUTORIZADO', nota: 'aprobable',
          solicitudId: 'solAjusteOk', registradoPor: 'ownerUid', registradoEn: serverTimestamp(), anulado: false }));
});

// ─── M3 · ANULACIÓN: tabla de predicados ────────────────────────────────────────
test('M3 anulación · ABONO: admin NO (herramienta del skimming), owner SÍ', async () => {
    const patch = { anulado: true, anuladoEn: serverTimestamp(), motivoAnulacion: 'caso', motivoCategoria: 'ERROR_REGISTRO' };
    await assertFails(updateDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mAbonoSem'),
        { ...patch, anuladoPor: 'adminUid' }));
    await assertSucceeds(updateDoc(doc(asUser('ownerUid'), 'clientes/cliV/movimientos/mAbonoSem'),
        { ...patch, anuladoPor: 'ownerUid' }));
});
test('M3 anulación · factura $5M seca: admin NO, owner SÍ', async () => {
    const patch = { anulado: true, anuladoEn: serverTimestamp(), motivoAnulacion: 'caso', motivoCategoria: 'DUPLICADO' };
    await assertFails(updateDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mGrande'),
        { ...patch, anuladoPor: 'adminUid' }));
    await assertSucceeds(updateDoc(doc(asUser('ownerUid'), 'clientes/cliV/movimientos/mGrande'),
        { ...patch, anuladoPor: 'ownerUid' }));
});
test('M3 anulación · asiento de monto 0 o NEGATIVO: admin NO (falla cerrado)', async () => {
    const patch = { anulado: true, anuladoPor: 'adminUid', anuladoEn: serverTimestamp(), motivoAnulacion: 'caso', motivoCategoria: 'OTRO' };
    await assertFails(updateDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mCero'), patch));
    await assertFails(updateDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mNegSem'), patch));
});
test('M3 anulación · sin motivoCategoria → rechazada (lista cerrada obligatoria)', async () => {
    await assertFails(updateDoc(doc(asUser('ownerUid'), 'clientes/cliV/movimientos/mNegSem'),
        { anulado: true, anuladoPor: 'ownerUid', anuladoEn: serverTimestamp(), motivoAnulacion: 'caso' }));
});
test('M3 anulación · UPDATE MUTANTE: anular y alterar otro campo a la vez → rechazado [Consejo]', async () => {
    await assertFails(updateDoc(doc(asUser('ownerUid'), 'clientes/cliV/movimientos/mNegSem'),
        { anulado: true, anuladoPor: 'ownerUid', anuladoEn: serverTimestamp(), motivoAnulacion: 'caso',
          motivoCategoria: 'OTRO', descripcion: 'reescrita', monto: 0 }));
});
test('M3 anulación · anuladoEn que NO es reloj del servidor → rechazada', async () => {
    await assertFails(updateDoc(doc(asUser('ownerUid'), 'clientes/cliV/movimientos/mNegSem'),
        { anulado: true, anuladoPor: 'ownerUid', anuladoEn: '2026-06-11T00:00:00Z',
          motivoAnulacion: 'caso', motivoCategoria: 'OTRO' }));
});
test('M3 anulación · LEGACY SUCIA (clave vieja + sin medioPago/fecha): admin SÍ anula [Consejo]', async () => {
    // La validación es del DELTA — el estado viejo del doc no la contamina.
    await assertSucceeds(updateDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mLegacySucio'),
        { anulado: true, anuladoPor: 'adminUid', anuladoEn: serverTimestamp(),
          motivoAnulacion: 'asiento duplicado de la migración', motivoCategoria: 'DUPLICADO' }));
});

// ─── M3 · arreglos del red-team (W-01, 16 agentes): los 2 bloqueos + huecos ─────
test('M3 redteam · factura/abono NEGATIVOS rechazados (condonación sin gate) — admin y owner', async () => {
    const base = { fecha: '2026-06-07', registradoEn: serverTimestamp(), anulado: false };
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3NegFactA'),
        { ...base, tipo: 'factura', monto: -1000000, registradoPor: 'adminUid' }));
    await assertFails(setDoc(doc(asUser('ownerUid'), 'clientes/cliV/movimientos/m3NegFactO'),
        { ...base, tipo: 'factura', monto: -1000000, registradoPor: 'ownerUid' }));
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3NegAbono'),
        { ...base, tipo: 'abono', monto: -50000, medioPago: 'efectivo', registradoPor: 'adminUid' }));
});
test('M3 redteam · autoría SUPLANTADA: registradoPor/anuladoPor ajenos rechazados', async () => {
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3SuplReg'),
        { tipo: 'factura', monto: 1000, fecha: '2026-06-07', registradoPor: 'ownerUid',
          registradoEn: serverTimestamp(), anulado: false }));
    await assertFails(updateDoc(doc(asUser('ownerUid'), 'clientes/cliV/movimientos/mNegSem'),
        { anulado: true, anuladoPor: 'adminUid', anuladoEn: serverTimestamp(),
          motivoAnulacion: 'x', motivoCategoria: 'OTRO' }));
});
test('M3 redteam · rama CORRECCIÓN de la coincidencia: monto o correccionDe divergente → rechazado', async () => {
    const base = { tipo: 'factura', fecha: '2026-06-07', solicitudId: 'solM2b2',
        registradoPor: 'ownerUid', registradoEn: serverTimestamp(), anulado: false };
    await assertFails(setDoc(doc(asUser('ownerUid'), 'clientes/cliV/movimientos/m3CorrMonto'),
        { ...base, monto: 999999, correccionDe: 'mYaAnulado' }));     // monto ≠ reemplazo.monto (80000)
    await assertFails(setDoc(doc(asUser('ownerUid'), 'clientes/cliV/movimientos/m3CorrDe'),
        { ...base, monto: 80000, correccionDe: 'otroAsiento' }));     // correccionDe ≠ el de la solicitud
});
test('M3 redteam · BORDES del tope: ajuste −50000 admin pasa, −50001 no; anular 50000 admin sí, 50001 no', async () => {
    const baseAj = { tipo: 'ajuste', fecha: '2026-06-07', motivo: 'ERROR_REGISTRO', nota: 'borde',
        registradoPor: 'adminUid', registradoEn: serverTimestamp(), anulado: false };
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3BordeAj'), { ...baseAj, monto: -50000 }));
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3BordeAjPlus'), { ...baseAj, monto: -50001 }));
    const patch = { anulado: true, anuladoPor: 'adminUid', anuladoEn: serverTimestamp(), motivoAnulacion: 'borde', motivoCategoria: 'OTRO' };
    await assertSucceeds(updateDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mBorde'), patch));
    await assertFails(updateDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mBordePlus'), patch));
});
test('M3 redteam · fecha: VERDE mañana (tolerancia +2d); ROJOS mes 13/00 y día 00', async () => {
    const base = { tipo: 'factura', monto: 1000, registradoPor: 'adminUid', registradoEn: serverTimestamp(), anulado: false };
    const manana = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3Manana'), { ...base, fecha: manana }));
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3Mes13'), { ...base, fecha: '2026-13-01' }));
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3Mes00'), { ...base, fecha: '2026-00-15' }));
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3Dia00'), { ...base, fecha: '2026-06-00' }));
});
test('M3 redteam · motivoCategoria del MOSTRADOR (DESCUENTO_AUTORIZADO) anula sin reventar', async () => {
    // El flujo "Corregir movimiento" deriva estas categorías de las preguntas de Kary;
    // la lista de la regla es la UNIÓN (el bloqueante del red-team). ABONO_NO_REGISTRADO
    // se ejercita en el batch de corrección de abono (test de abajo).
    await assertSucceeds(updateDoc(doc(asUser('ownerUid'), 'clientes/cliV/movimientos/mNegSem'),
        { anulado: true, anuladoPor: 'ownerUid', anuladoEn: serverTimestamp(),
          motivoAnulacion: 'descuento que autoricé', motivoCategoria: 'DESCUENTO_AUTORIZADO' }));
});
test('M3 redteam · corrección de un ABONO: el batch de aprobación del owner PASA (reemplazo con medioPago)', async () => {
    const db = asUser('ownerUid');
    const nuevoRef = doc(collection(db, 'clientes/cliV/movimientos'));
    const batch = writeBatch(db);
    batch.update(doc(db, 'clientes/cliV/movimientos/mAbonoCorr'), {
        anulado: true, anuladoPor: 'ownerUid', anuladoEn: serverTimestamp(),
        motivoAnulacion: 'eran 150 mil', motivoCategoria: 'ABONO_NO_REGISTRADO', corregidoPor: nuevoRef.id,
    });
    batch.set(nuevoRef, {
        tipo: 'abono', monto: 150000, fecha: '2026-06-01', medioPago: 'otro',
        correccionDe: 'mAbonoCorr', solicitudId: 'solAbonoCorr',
        registradoPor: 'ownerUid', registradoEn: serverTimestamp(), anulado: false,
    });
    batch.update(doc(db, 'clientes/cliV/solicitudes/solAbonoCorr'), {
        estado: 'aprobada', resueltoPor: 'ownerUid', resueltoEn: serverTimestamp(),
    });
    await assertSucceeds(batch.commit());
});
test('M3 redteam · motivosNeutros CONFIGURABLES: el owner amplía la lista y el carril del admin la respeta', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(doc(ctx.firestore(), 'config/cartera'),
            { autoAprobacionMax: 50000, motivosNeutros: ['ERROR_REGISTRO', 'ABONO_NO_REGISTRADO', 'RECLASIFICACION', 'DEVOLUCION_PIEZA'] });
    });
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3NeutroCfg'),
        { tipo: 'ajuste', monto: -10000, fecha: '2026-06-07', motivo: 'DEVOLUCION_PIEZA', nota: 'devolvió',
          registradoPor: 'adminUid', registradoEn: serverTimestamp(), anulado: false }));
    // Restaurar el doc canónico (sin motivosNeutros → default de la regla = los 3).
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(doc(ctx.firestore(), 'config/cartera'), { autoAprobacionMax: 50000, slaRevisionDias: 2 });
    });
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3NeutroOff'),
        { tipo: 'ajuste', monto: -10000, fecha: '2026-06-07', motivo: 'DEVOLUCION_PIEZA', nota: 'devolvió',
          registradoPor: 'adminUid', registradoEn: serverTimestamp(), anulado: false }));
});

// ─── Fase M · M4 (§69): acta de conciliación (owner one-way) + cortes (solo CF) ──
test('M4 acta · el OWNER crea el acta mensual bien formada; one-way (sin update/delete)', async () => {
    const acta = {
        mes: '2026-06', totalPorMedio: { efectivo: 150000, transferencia: 200000 },
        bancoCuadra: true, efectivoCuadra: false, diferencias: 'faltan $20.000 del 15/06',
        creadoPor: 'ownerUid', creadoEn: serverTimestamp(),
    };
    await assertSucceeds(setDoc(doc(asUser('ownerUid'), 'conciliaciones/2026-06'), acta));
    await assertFails(updateDoc(doc(asUser('ownerUid'), 'conciliaciones/2026-06'), { bancoCuadra: false }));
    await assertFails(deleteDoc(doc(asUser('ownerUid'), 'conciliaciones/2026-06')));
});
test('M4 acta · admin NO crea (Kary no se arquea a sí misma); admin SÍ lee; docId/forma validados', async () => {
    const acta = (over = {}) => ({
        mes: '2026-07', totalPorMedio: {}, bancoCuadra: true, efectivoCuadra: true,
        diferencias: '', creadoPor: 'adminUid', creadoEn: serverTimestamp(), ...over,
    });
    await assertFails(setDoc(doc(asUser('adminUid'), 'conciliaciones/2026-07'), acta()));
    await assertSucceeds(getDoc(doc(asUser('adminUid'), 'conciliaciones/2026-06')));
    // docId que no es 'YYYY-MM' / mes que no coincide / clave extra / reloj del cliente → rechazados
    await assertFails(setDoc(doc(asUser('ownerUid'), 'conciliaciones/junio'), acta({ mes: 'junio', creadoPor: 'ownerUid' })));
    await assertFails(setDoc(doc(asUser('ownerUid'), 'conciliaciones/2026-08'), acta({ mes: '2026-07', creadoPor: 'ownerUid' })));
    await assertFails(setDoc(doc(asUser('ownerUid'), 'conciliaciones/2026-09'), acta({ mes: '2026-09', creadoPor: 'ownerUid', extra: 1 })));
    await assertFails(setDoc(doc(asUser('ownerUid'), 'conciliaciones/2026-10'), acta({ mes: '2026-10', creadoPor: 'ownerUid', creadoEn: new Date() })));
});
test('M4 cortes · NADIE escribe desde el cliente (solo la CF); admin lee, editor no', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(doc(ctx.firestore(), 'cortes/2026-05'), { mes: '2026-05', clientes: 344 });
    });
    await assertFails(setDoc(doc(asUser('ownerUid'), 'cortes/2026-06'), { mes: '2026-06' }));
    await assertFails(updateDoc(doc(asUser('adminUid'), 'cortes/2026-05'), { clientes: 1 }));
    await assertSucceeds(getDoc(doc(asUser('adminUid'), 'cortes/2026-05')));
    await assertFails(getDoc(doc(asUser('editorUid'), 'cortes/2026-05')));
});

// ─── M3 · ANTI-LOCKOUT: config/cartera ausente (SIEMPRE el último: muta config) ──
test('M3 anti-lockout · config ausente: abono PASA, ajuste negativo admin FALLA cerrado, owner intacto', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await deleteDoc(doc(ctx.firestore(), 'config/cartera'));
    });
    // El camino DIARIO (abono) jamás lee config → sigue vivo.
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3LockAbono'),
        { tipo: 'abono', monto: 2000, fecha: '2026-06-07', medioPago: 'efectivo',
          registradoPor: 'adminUid', registradoEn: serverTimestamp(), anulado: false }));
    // La rama gateada del admin FALLA CERRADA (get a doc ausente → error → deny).
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/m3LockAjuste'),
        { tipo: 'ajuste', monto: -10000, fecha: '2026-06-07', motivo: 'ERROR_REGISTRO', nota: 'x',
          registradoPor: 'adminUid', registradoEn: serverTimestamp(), anulado: false }));
    // El OWNER nunca depende del doc (cortocircuito).
    await assertSucceeds(setDoc(doc(asUser('ownerUid'), 'clientes/cliV/movimientos/m3LockOwner'),
        { tipo: 'ajuste', monto: -10000, fecha: '2026-06-07', motivo: 'ERROR_REGISTRO', nota: 'x',
          registradoPor: 'ownerUid', registradoEn: serverTimestamp(), anulado: false }));
    // Restaurar para cualquier corrida posterior.
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(doc(ctx.firestore(), 'config/cartera'), { autoAprobacionMax: 50000, slaRevisionDias: 2 });
    });
});

// ─── Acuerdos de pago v2 (MUTEX): forma + transiciones atómicas + jineteo ──────
const ACUERDO_OK = {
    fechaPacto: '2026-06-01',
    cuotas: [{ fecha: '2026-06-15', monto: 20000 }, { fecha: '2026-07-15', monto: 20000 }],
    periodicidad: 'mensual', primeraCuotaFecha: '2026-06-15', ultimaCuotaFecha: '2026-07-15',
    saldoAlPactar: 40000, nota: 'pactado con la clienta', estado: 'vigente',
    creadoPor: 'adminUid', rolAlCrear: 'admin',
};
// Crear acuerdo = batch (acuerdo + puntero del cliente) — la transacción del MUTEX.
function crearAcuerdoBatch(uid, clienteId, acuerdoId, over = {}) {
    const db = asUser(uid);
    const b = writeBatch(db);
    b.set(doc(db, `clientes/${clienteId}/acuerdos/${acuerdoId}`),
        { ...ACUERDO_OK, creadoEn: serverTimestamp(), ...over });
    b.update(doc(db, `clientes/${clienteId}`), { acuerdoVigenteId: acuerdoId });
    return b.commit();
}

test('acuerdos · MUTEX: crear SUELTO (sin mover el puntero) FALLA; batch con puntero OK', async () => {
    // suelto: create sin actualizar el puntero del cliente → deny (getAfter ≠ id)
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliAcuVacio/acuerdos/acSuelto'),
        { ...ACUERDO_OK, creadoEn: serverTimestamp() }));
    // batch (create + puntero) → OK; editor no puede; editor no lee; admin lee
    await assertSucceeds(crearAcuerdoBatch('adminUid', 'cliAcuVacio', 'acOk1'));
    await assertFails(crearAcuerdoBatch('editorUid', 'cliAcuVacio', 'acEd', { creadoPor: 'editorUid', rolAlCrear: 'editor' }));
    await assertFails(getDoc(doc(asUser('editorUid'), 'clientes/cliAcuVig/acuerdos/acVig')));
    await assertSucceeds(getDoc(doc(asUser('adminUid'), 'clientes/cliAcuVig/acuerdos/acVig')));
});

test('acuerdos · MUTEX cierra el JINETEO: 2º vigente suelto sobre cuenta con acuerdo → deny', async () => {
    // cliAcuVig YA tiene acVig (puntero=acVig). Inyectar otro vigente SIN renegociar
    // (sin sellar el viejo ni mover el puntero) era el vector del Consejo → deny.
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliAcuVig/acuerdos/acJinete'),
        { ...ACUERDO_OK, creadoEn: serverTimestamp() }));
});

test('acuerdos · la forma es la frontera (estado/sobre/nota/rol/reloj/whitelist v2)', async () => {
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliFormaTest'),
        { nombre: 'f', origen: 'kary', activo: true }));
    const crea = (id, over) => crearAcuerdoBatch('adminUid', 'cliFormaTest', id, over);   // null→new; todos FALLAN
    await assertFails(crea('acEstado', { estado: 'anulado' }));            // nace 'vigente'
    await assertFails(crea('acAlcance', { alcance: 'saldo' }));            // 'alcance' YA NO está en la whitelist v2
    await assertFails(crea('acMov', { movimientoId: 'mChico' }));          // 'movimientoId' fuera (todo es saldo)
    await assertFails(crea('acExtra', { campoExtra: 'x' }));               // whitelist hasOnly
    await assertFails(crea('acNotaVacia', { nota: '' }));                  // qué se habló = evidencia
    await assertFails(crea('acNotaLarga', { nota: 'x'.repeat(501) }));     // size() ≤ 500
    await assertFails(crea('acSobre', { primeraCuotaFecha: '2026-05-01' })); // < fechaPacto
    await assertFails(crea('acRol', { rolAlCrear: 'owner' }));             // investidura falsa
    await assertFails(crea('acCuotasVacias', { cuotas: [] }));
    await assertFails(crea('acReloj', { creadoEn: new Date() }));          // reloj del SERVIDOR
});

test('acuerdos · el owner pacta a su nombre (mutex null→new, rolAlCrear owner)', async () => {
    await assertSucceeds(setDoc(doc(asUser('ownerUid'), 'clientes/cliOwnerPacta'),
        { nombre: 'o', origen: 'kary', activo: true }));
    await assertSucceeds(crearAcuerdoBatch('ownerUid', 'cliOwnerPacta', 'acOwn', { creadoPor: 'ownerUid', rolAlCrear: 'owner' }));
});

test('acuerdos · renegociación ATÓMICA (nuevo + sello + puntero); sueltos jamás', async () => {
    // create con reemplazaA SIN sellar ni mover el puntero → deny
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliAcuVig/acuerdos/acRenSuelto'),
        { ...ACUERDO_OK, creadoEn: serverTimestamp(), reemplazaA: 'acVig' }));
    // sello suelto apuntando a un reemplazo que NO se crea → deny
    await assertFails(updateDoc(doc(asUser('adminUid'), 'clientes/cliAcuVig/acuerdos/acVig'),
        { estado: 'reemplazado', cerradoPor: 'adminUid', cerradoEn: serverTimestamp(), reemplazadoPor: 'acNoExiste' }));
    // batch completo: nuevo (reemplazaA) + viejo sellado + puntero→nuevo → OK
    const db = asUser('adminUid');
    const b = writeBatch(db);
    b.set(doc(db, 'clientes/cliAcuVig/acuerdos/acRen1'),
        { ...ACUERDO_OK, creadoEn: serverTimestamp(), reemplazaA: 'acVig' });
    b.update(doc(db, 'clientes/cliAcuVig/acuerdos/acVig'),
        { estado: 'reemplazado', cerradoPor: 'adminUid', cerradoEn: serverTimestamp(), reemplazadoPor: 'acRen1' });
    b.update(doc(db, 'clientes/cliAcuVig'), { acuerdoVigenteId: 'acRen1' });
    await assertSucceeds(b.commit());
});

test('acuerdos · anular = SOLO owner con motivo + puntero a null; admin FALLA; cerrado inmutable', async () => {
    const anular = (uid) => {
        const db = asUser(uid);
        const b = writeBatch(db);
        b.update(doc(db, 'clientes/cliAnu/acuerdos/acAnu'),
            { estado: 'anulado', cerradoPor: uid, cerradoEn: serverTimestamp(), motivoCierre: 'pactado por error' });
        b.update(doc(db, 'clientes/cliAnu'), { acuerdoVigenteId: deleteField() });
        return b.commit();
    };
    await assertFails(anular('adminUid'));        // anular = owner-only
    await assertFails(updateDoc(doc(asUser('ownerUid'), 'clientes/cliAnu/acuerdos/acAnu'),
        { estado: 'anulado', cerradoPor: 'ownerUid', cerradoEn: serverTimestamp() }));  // suelto / sin motivo
    await assertSucceeds(anular('ownerUid'));      // owner + motivo + puntero null
    // un acuerdo cerrado es INMUTABLE (la transición solo arranca de 'vigente')
    await assertFails(updateDoc(doc(asUser('ownerUid'), 'clientes/cliAcuVig/acuerdos/acCerrado'),
        { estado: 'anulado', cerradoPor: 'ownerUid', cerradoEn: serverTimestamp(), motivoCierre: 'x' }));
    await assertFails(deleteDoc(doc(asUser('ownerUid'), 'clientes/cliAcuVig/acuerdos/acCerrado')));
});

test('acuerdos · collectionGroup solo admin; asesorId viaja en el cliente (costura)', async () => {
    await assertSucceeds(getDocs(query(collectionGroup(asUser('adminUid'), 'acuerdos'), where('estado', '==', 'vigente'))));
    await assertFails(getDocs(query(collectionGroup(asUser('editorUid'), 'acuerdos'), where('estado', '==', 'vigente'))));
    // asesorId: la frontera es la WHITELIST (el tipo se valida en el CREATE, patrón vendedoraId)
    await assertSucceeds(updateDoc(doc(asUser('adminUid'), 'clientes/cliV'), { asesorId: 'asesor-1' }));
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliAsesorMal'),
        { nombre: 'Clienta As', asesorId: 7, origen: 'kary', activo: true }));        // tipo en create
    await assertSucceeds(setDoc(doc(asUser('adminUid'), 'clientes/cliAsesorOk'),
        { nombre: 'Clienta As', asesorId: 'asesor-1', origen: 'kary', activo: true }));
});

test('size() ≤500 en texto libre: gestiones/solicitudes/movimientos (deferido M5)', async () => {
    const larga = 'x'.repeat(501);
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/gestiones/gLarga'),
        { tipo: 'llamada', nota: larga, fecha: '2026-06-10', resultado: 'no_contesto',
          registradoPor: 'adminUid', creadoEn: serverTimestamp() }));
    await assertFails(addDoc(collection(asUser('adminUid'), 'clientes/cliV/solicitudes'),
        { tipo: 'ajuste', monto: -70000, motivo: larga, nota: 'x', solicitadoPor: 'adminUid',
          creadoEn: serverTimestamp(), estado: 'pendiente' }));
    await assertFails(setDoc(doc(asUser('adminUid'), 'clientes/cliV/movimientos/mDescLarga'),
        { tipo: 'factura', monto: 10000, fecha: '2026-06-07', descripcion: larga,
          registradoPor: 'adminUid', registradoEn: serverTimestamp(), anulado: false }));
});
