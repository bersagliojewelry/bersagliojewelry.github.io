#!/usr/bin/env node
/**
 * Bersaglio — Cambiar el CORREO del usuario DUEÑO (owner) · TODO-20.
 *
 * Por qué este script: la consola de Firebase NO deja editar el email de un usuario
 * (solo reset clave / inhabilitar / borrar). El Admin SDK SÍ → `updateUser(uid,{email})`.
 * Cambia SOLO el correo de inicio de sesión; el MISMO usuario (uid) conserva su rol de
 * dueño (el sistema reconoce al owner por uid/rol, no por correo → 0 riesgo de lockout).
 * La contraseña NO cambia.
 *
 * LO CORRE DANIEL (es un cambio de credencial, no lo hace Claude). DRY-RUN por defecto.
 *
 * Uso (en la raíz del repo, con la llave de bersaglio):
 *   # 1) prueba en seco (NO cambia nada, solo muestra):
 *   GOOGLE_APPLICATION_CREDENTIALS="C:/Users/romad/Downloads/bersaglio-jewelry-firebase-adminsdk-XXXX.json" \
 *     node scripts/migrate-owner-email.mjs tu-correo-personal@gmail.com
 *
 *   # 2) si se ve bien, aplícalo:
 *   GOOGLE_APPLICATION_CREDENTIALS="...json" \
 *     node scripts/migrate-owner-email.mjs tu-correo-personal@gmail.com --apply
 *
 * Después: entra al panel con el correo NUEVO + tu MISMA contraseña. `bersagliojewelry@gmail.com`
 * queda libre para Kary (rol catálogo, TODO-19). Luego borra la llave de Descargas.
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const NEW_EMAIL = process.argv[2];
const APPLY     = process.argv.includes('--apply');
const PROJECT   = 'bersaglio-jewelry';

if (!NEW_EMAIL || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(NEW_EMAIL) || NEW_EMAIL.startsWith('--')) {
    console.error('❌ Falta el correo nuevo (o no es válido).');
    console.error('   Uso: node scripts/migrate-owner-email.mjs tu-correo-personal@gmail.com [--apply]');
    process.exit(1);
}

initializeApp({ credential: applicationDefault(), projectId: PROJECT });
const db = getFirestore();
const auth = getAuth();

(async () => {
    console.log(`Cambiar correo del DUEÑO · ${APPLY ? 'APPLY (ESCRIBE)' : 'DRY-RUN (solo reporta)'} · ${PROJECT}\n`);

    // 1) Encuentra al owner por su ROL (no por correo) — robusto.
    const snap = await db.collection('users').where('role', '==', 'owner').get();
    if (snap.empty) { console.error('❌ No encontré ningún usuario con rol "owner".'); process.exit(1); }
    if (snap.size > 1) { console.error(`⚠️  Hay ${snap.size} owners; este script asume 1. Aborto por seguridad.`); process.exit(1); }

    const ownerDoc = snap.docs[0];
    const uid = ownerDoc.id;
    const rec = await auth.getUser(uid);
    const oldEmail = rec.email;

    console.log(`  Owner: uid=${uid}`);
    console.log(`  Correo actual: ${oldEmail}`);
    console.log(`  Correo nuevo:  ${NEW_EMAIL}`);

    if (oldEmail === NEW_EMAIL) { console.log('\n✓ Ya tiene ese correo. Nada que hacer.'); process.exit(0); }

    // Choque: ¿el correo nuevo ya lo usa OTRA cuenta?
    try {
        const other = await auth.getUserByEmail(NEW_EMAIL);
        if (other.uid !== uid) { console.error(`\n❌ El correo ${NEW_EMAIL} ya pertenece a otra cuenta (uid=${other.uid}). Elige otro o bórrala primero.`); process.exit(1); }
    } catch { /* not-found = libre, perfecto */ }

    if (!APPLY) {
        console.log('\n✓ Dry-run: TODO listo. El owner conserva su rol (mismo uid). La contraseña NO cambia.');
        console.log('  → si se ve bien, repite el comando agregando  --apply');
        process.exit(0);
    }

    // 2) Cambia el correo en Auth (mismo uid → rol/owner intactos) + marca verificado.
    await auth.updateUser(uid, { email: NEW_EMAIL, emailVerified: true });
    // 3) Refleja el correo en el perfil users/{uid} (para que el panel lo muestre bien).
    await db.collection('users').doc(uid).set({ email: NEW_EMAIL }, { merge: true });

    console.log(`\n✅ Listo. El dueño ahora entra con: ${NEW_EMAIL} (misma contraseña).`);
    console.log(`   ${oldEmail} quedó LIBRE para Kary (rol catálogo, TODO-19).`);
    process.exit(0);
})().catch(e => {
    console.error('\n[FATAL]', e.message);
    if (/credential|auth|ADC|default/i.test(e.message)) {
        console.error('  → Falta la llave. Define GOOGLE_APPLICATION_CREDENTIALS con el .json de bersaglio.');
    }
    process.exit(1);
});
