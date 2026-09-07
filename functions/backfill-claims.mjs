/**
 * Bersaglio — Backfill ÚNICO de custom claims (F6 frente B, ADR §65).
 *
 * Copia el rol de cada users/{uid}.role (fuente de verdad) al custom claim del
 * token, para los usuarios que existían ANTES del trigger espejo `syncRoleClaim`.
 * Idempotente: re-correrlo solo re-escribe el mismo claim.
 *
 * USO (L-23: autentica por ADC, no por `firebase login`):
 *   node functions/backfill-claims.mjs            → PREFLIGHT (solo lectura: plan)
 *   node functions/backfill-claims.mjs --aplicar  → escribe los claims y verifica
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const APLICAR = process.argv.includes('--aplicar');
const ROLES_VALIDOS = new Set(['owner', 'admin', 'editor']);

// Guardia anti-destino-equivocado: si alguna var de emulador quedó en la shell
// (convención de los seeds, `$env:...` persiste TODA la sesión de PowerShell),
// el Admin SDK hablaría con el EMULADOR creyendo que es prod — y escribiría/leería
// claims en el lugar equivocado SIN avisar. Abortamos en vez de adivinar.
const emuVars = ['FIRESTORE_EMULATOR_HOST', 'FIREBASE_AUTH_EMULATOR_HOST']
    .filter((v) => process.env[v]);
if (emuVars.length) {
    console.error(`\n⛔ Hay variables de EMULADOR activas (${emuVars.join(', ')}). Este script opera sobre PRODUCCIÓN.\n   Abre una shell limpia (sin esas vars) y vuelve a intentar.\n`);
    process.exit(1);
}

console.log(`\n→ Destino: PROYECTO REAL bersaglio-jewelry (ADC).`);
initializeApp({ credential: applicationDefault(), projectId: 'bersaglio-jewelry' });
const auth = getAuth();
const db = getFirestore();

const snap = await db.collection('users').get();
console.log(`\n— Backfill de claims (${APLICAR ? 'APLICAR' : 'preflight, solo lectura'}) — ${snap.size} doc(s) en users/\n`);

let pendientes = 0;
for (const doc of snap.docs) {
    const uid = doc.id;
    const role = doc.data().role;
    let linea = `  ${uid} → rol doc: ${role ?? '(sin rol)'}`;

    if (!ROLES_VALIDOS.has(role)) {
        console.log(`${linea} · ⛔ rol inválido — se OMITE (revisar a mano)`);
        continue;
    }

    let user;
    try {
        user = await auth.getUser(uid);
    } catch (err) {
        if (err?.code === 'auth/user-not-found') {
            console.log(`${linea} · ⛔ NO existe en Auth — se OMITE (doc huérfano)`);
            continue;
        }
        // Error TRANSITORIO (red/credenciales/deadline): NO clasificar como huérfano
        // ni reportar éxito — abortar para que el operador no crea que aplicó claims.
        console.error(`${linea} · ❌ error al consultar Auth (${err?.code || err}). Se ABORTA el backfill.`);
        process.exit(1);
    }

    const claimActual = user.customClaims?.role ?? null;
    if (claimActual === role) {
        console.log(`${linea} · ✅ claim ya correcto ("${claimActual}")`);
        continue;
    }

    pendientes++;
    if (!APLICAR) {
        console.log(`${linea} · 📝 claim actual: ${claimActual ?? '(ninguno)'} → se escribiría "${role}"`);
        continue;
    }

    await auth.setCustomUserClaims(uid, { role });
    const verificado = (await auth.getUser(uid)).customClaims?.role;
    console.log(`${linea} · ✍️ claim escrito y verificado: "${verificado}" ${verificado === role ? '✅' : '❌ NO COINCIDE'}`);
}

console.log(`\n${APLICAR ? 'Hecho.' : `Plan: ${pendientes} claim(s) por escribir. Corre con --aplicar para ejecutar.`}\n`);
