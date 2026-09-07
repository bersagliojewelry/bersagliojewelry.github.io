/**
 * Siembra datos de PRUEBA en los emuladores (NO toca producción). Para verificar
 * el CRM end-to-end en local. Correr con los emuladores arriba y las env vars:
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
 *   node functions/seed-emulator.mjs
 * Crea: owner (owner@test.com), vendedora (vend@test.com), ambos pass "test1234",
 * + 1 cliente de la vendedora. Datos ficticios (no reales).
 */
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({ projectId: 'bersaglio-jewelry' });
const auth = getAuth();
const db = getFirestore();

async function ensureUser(uid, email, displayName, role) {
    try { await auth.deleteUser(uid); } catch { /* not exists */ }
    await auth.createUser({ uid, email, password: 'test1234', displayName });
    await db.doc(`users/${uid}`).set({ email, displayName, role, active: true });
    console.log(`seeded user ${role}: ${email}`);
}

await ensureUser('ownerSeed', 'owner@test.com', 'Daniel (owner)', 'owner');
await ensureUser('vendSeed', 'vend@test.com', 'María Vendedora', 'vendedora');

const cli = await db.collection('clientes').add({
    nombre: 'Cliente Demo', vendedoraUid: 'vendSeed',
    telefono: '310 000 0000', origen: 'vendedora', activo: true,
});
console.log(`seeded cliente ${cli.id} (de la vendedora)`);

process.exit(0);
