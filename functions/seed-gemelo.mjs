/**
 * Bersaglio — sembrador del GEMELO (datos de JUGUETE, plan §57: aula de Kary).
 *
 * Crea en bersaglio-gemelo: vendedoras, clientas ficticias con movimientos y
 * saldo PRE-calculado (en el gemelo Spark no corre la Cloud Function), piezas
 * de catálogo de juguete, config y los usuarios del aula (Auth + roles).
 *
 * SEGURO POR DISEÑO: se NIEGA a correr contra producción.
 *   node seed-gemelo.mjs            ← siembra bersaglio-gemelo vía ADC
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { computeSaldo } = require('./saldo.js');

const TARGET = 'bersaglio-gemelo';
if (TARGET.includes('jewelry')) { console.error('⛔ jamás contra prod'); process.exit(1); }

initializeApp({ projectId: TARGET });
const db = getFirestore();
const auth = getAuth();

const ts = (diasAtras) => Timestamp.fromDate(new Date(Date.now() - diasAtras * 86400000));
const iso = (diasAtras) => new Date(Date.now() - diasAtras * 86400000).toISOString().slice(0, 10);

// ─── Usuarios del aula (Auth + perfil con rol) ────────────────────────────────
const USUARIOS = [
    { email: 'aula-kary@gemelo.bersaglio', pass: 'AulaKary-2026', nombre: 'Kary (aula)', role: 'admin' },
    { email: 'aula-daniel@gemelo.bersaglio', pass: 'AulaDaniel-2026', nombre: 'Daniel (aula)', role: 'owner' },
];

// ─── Datos de juguete ─────────────────────────────────────────────────────────
const VENDEDORAS = [
    { id: 'vend-luna',  nombre: 'Luna Prueba',  activa: true },
    { id: 'vend-perla', nombre: 'Perla Ensayo', activa: true },
];

// Cada clienta: movimientos → saldo se PRE-calcula con la MISMA función pura de prod.
const CLIENTAS = [
    { id: 'cli-esmeralda', nombre: 'Esmeralda Ficticia', telefono: '3000000001', vendedoraId: 'vend-luna',
      movs: [
        { tipo: 'apertura', monto: 800000,  fecha: iso(90), dias: 90 },
        { tipo: 'abono',    monto: 200000,  fecha: iso(45), dias: 45 },
      ] },
    { id: 'cli-rubi', nombre: 'Rubí Imaginaria', telefono: '3000000002', vendedoraId: 'vend-luna',
      movs: [
        { tipo: 'factura', monto: 1500000, fecha: iso(70), dias: 70 },
        { tipo: 'abono',   monto: 500000,  fecha: iso(40), dias: 40 },
        { tipo: 'abono',   monto: 300000,  fecha: iso(10), dias: 10 },
      ] },
    { id: 'cli-zafiro', nombre: 'Zafiro Demo', telefono: '3000000003', vendedoraId: 'vend-perla',
      movs: [
        { tipo: 'factura', monto: 2400000, fecha: iso(20), dias: 20 },
      ] },
    { id: 'cli-ambar', nombre: 'Ámbar Entrenamiento', telefono: '3000000004', vendedoraId: 'vend-perla',
      movs: [
        { tipo: 'apertura', monto: 600000, fecha: iso(120), dias: 120 },   // morosa de juguete (+90d)
      ] },
    { id: 'cli-coral', nombre: 'Coral Saldada', telefono: '3000000005', vendedoraId: 'vend-luna',
      movs: [
        { tipo: 'factura', monto: 900000, fecha: iso(60), dias: 60 },
        { tipo: 'abono',   monto: 900000, fecha: iso(5),  dias: 5 },       // saldo 0: caso feliz
      ] },
];

const PIEZAS = [
    { id: 'pieza-demo-1', name: 'Anillo de Ensayo',   code: 'DEMO-001', slug: 'anillo-ensayo',   price: 2400000, featured: true },
    { id: 'pieza-demo-2', name: 'Aretes de Práctica', code: 'DEMO-002', slug: 'aretes-practica', price: 1500000, featured: false },
    { id: 'pieza-demo-3', name: 'Dije de Juguete',    code: 'DEMO-003', slug: 'dije-juguete',    price: 800000,  featured: false },
];

// ─── Siembra ──────────────────────────────────────────────────────────────────
console.log(`Sembrando ${TARGET} con datos de JUGUETE…`);

// Usuarios (Auth + perfil)
for (const u of USUARIOS) {
    let rec;
    try {
        rec = await auth.createUser({ email: u.email, password: u.pass, displayName: u.nombre });
    } catch (e) {
        if (e.code === 'auth/email-already-exists') { rec = await auth.getUserByEmail(u.email); }
        else throw e;
    }
    await db.doc(`users/${rec.uid}`).set({ email: u.email, displayName: u.nombre, role: u.role, active: true, createdAt: Timestamp.now() });
    console.log(`  user ${u.email} (${u.role})`);
}

for (const v of VENDEDORAS) {
    await db.doc(`vendedoras/${v.id}`).set({ nombre: v.nombre, activa: v.activa, createdAt: Timestamp.now() });
}
console.log(`  ${VENDEDORAS.length} vendedoras`);

let totalMovs = 0;
for (const c of CLIENTAS) {
    const movsData = c.movs.map((m) => ({
        tipo: m.tipo, monto: m.monto, fecha: m.fecha, anulado: false,
        registradoPor: 'seed', registradoEn: ts(m.dias),
        descripcion: `(juguete) ${m.tipo}`,
    }));
    await db.doc(`clientes/${c.id}`).set({
        nombre: c.nombre, telefono: c.telefono, whatsapp: c.telefono,
        vendedoraId: c.vendedoraId, origen: 'aula', activo: true,
        saldoActual: computeSaldo(movsData),            // misma función pura de prod
        saldoActualizadoEn: Timestamp.now(), createdAt: Timestamp.now(),
    });
    for (let i = 0; i < movsData.length; i++) {
        await db.doc(`clientes/${c.id}/movimientos/mov-${i + 1}`).set(movsData[i]);
        totalMovs++;
    }
}
console.log(`  ${CLIENTAS.length} clientas + ${totalMovs} movimientos (saldos pre-calculados)`);

for (const p of PIEZAS) {
    const { id, ...data } = p;
    await db.doc(`pieces/${id}`).set({ ...data, images: [], specs: {}, createdAt: Timestamp.now() });
}
console.log(`  ${PIEZAS.length} piezas`);

await db.doc('config/status').set({ ok: true, entorno: 'GEMELO — datos de juguete' });
await db.doc('config/negocio').set({ diasPlazo: 30 });
console.log('  config');

console.log('✅ Gemelo sembrado. Login del aula: aula-kary@gemelo.bersaglio');
