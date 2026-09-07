/**
 * Bersaglio — Datos de ENSAYO para el guion de verificación M2b CON DANIEL
 * (plan Fase M §69 L87: 5 tareas en prod; el caso "saldo cambió" exige fixture).
 *
 * Crea UNA clienta de prueba claramente marcada + 3 movimientos + 4 solicitudes
 * pendientes que espejan EXACTAMENTE lo que M2a escribe (contrato ADR §74):
 *   S1 ajuste −$30.000 (aprobación simple, 2 escrituras)
 *   S2 corrección factura $500.000→$80.000 (aprobación de par, 3 escrituras)
 *   S3 ajuste −$60.000 (para RECHAZAR con motivo)
 *   S4 ajuste −$20.000 con saldoAlSolicitar FALSO ($999.000) → alerta roja de drift
 *
 * EFÍMERO: se borra el MISMO día con --limpiar (la clienta, sus movimientos y
 * solicitudes). La limpieza vigila el "fantasma": recalcSaldoCliente escribe con
 * set+merge y puede resucitar el doc del cliente si su trigger corre tras el borrado.
 *
 * USO (L-23, ADC):
 *   node functions/seed-guion-m2b.mjs              → preflight (muestra el plan)
 *   node functions/seed-guion-m2b.mjs --aplicar    → siembra (si NO existe)
 *   node functions/seed-guion-m2b.mjs --verificar  → audita el resultado del guion (read-only)
 *   node functions/seed-guion-m2b.mjs --limpiar    → borra todo el ensayo y verifica
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const APLICAR = process.argv.includes('--aplicar');
const LIMPIAR = process.argv.includes('--limpiar');
const VERIFICAR = process.argv.includes('--verificar');

// Guardia anti-destino-equivocado (espejo de seed-config-cartera.mjs).
const emuVars = ['FIRESTORE_EMULATOR_HOST', 'FIREBASE_AUTH_EMULATOR_HOST']
    .filter((v) => process.env[v]);
if (emuVars.length) {
    console.error(`\n⛔ Hay variables de EMULADOR activas (${emuVars.join(', ')}). Este script opera sobre PRODUCCIÓN.\n   Abre una shell limpia y vuelve a intentar.\n`);
    process.exit(1);
}

const CLIENTE_ID = 'zz-prueba-m2b';   // id fijo → limpieza determinista; 'zz' = al final de las listas
const SOLICITANTE = 'seed-prueba-m2b';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hace = (dias) => {
    const d = new Date(Date.now() - dias * 864e5);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

console.log('\n→ Destino: PROYECTO REAL bersaglio-jewelry (ADC).');
initializeApp({ credential: applicationDefault(), projectId: 'bersaglio-jewelry' });
const db = getFirestore();
const clienteRef = db.collection('clientes').doc(CLIENTE_ID);

// ─── VERIFICACIÓN POST-GUION (read-only): cada escritura contra el contrato §74 ──
if (VERIFICAR) {
    const fallos = [];
    const ok = (cond, msg) => { console.log(`${cond ? '✅' : '⛔'} ${msg}`); if (!cond) fallos.push(msg); };

    const cli = (await clienteRef.get()).data() || {};
    ok(cli.saldoActual === 10000, `saldoActual = ${cli.saldoActual} (esperado 10.000 = 460k − 30k − 420k)`);

    const sols = {};
    for (const id of ['s1-simple', 's2-correccion', 's3-rechazar', 's4-drift']) {
        sols[id] = (await clienteRef.collection('solicitudes').doc(id).get()).data() || {};
    }
    ok(sols['s1-simple'].estado === 'aprobada' && !!sols['s1-simple'].resueltoPor && !!sols['s1-simple'].resueltoEn,
        `s1 aprobada con sello (resueltoPor=${sols['s1-simple'].resueltoPor})`);
    ok(!('motivoRechazo' in sols['s1-simple']), 's1 aprobada NO porta motivoRechazo (contrato §72)');
    ok(sols['s2-correccion'].estado === 'aprobada', 's2 (corrección) aprobada');
    ok(sols['s3-rechazar'].estado === 'rechazada' && (sols['s3-rechazar'].motivoRechazo || '').length > 0,
        `s3 rechazada con motivo ("${sols['s3-rechazar'].motivoRechazo}")`);
    ok(sols['s4-drift'].estado === 'pendiente', 's4 (fixture de drift) sigue pendiente — no se tocó');

    const movs = (await clienteRef.collection('movimientos').get()).docs.map((d) => ({ id: d.id, ...d.data() }));
    const ajusteAprobado = movs.find((m) => m.solicitudId === 's1-simple');
    ok(!!ajusteAprobado && ajusteAprobado.tipo === 'ajuste' && ajusteAprobado.monto === -30000
        && ajusteAprobado.motivo === 'DESCUENTO_AUTORIZADO' && !!ajusteAprobado.nota
        && ajusteAprobado.registradoPor === sols['s1-simple'].resueltoPor && ajusteAprobado.anulado === false,
        'asiento del ajuste aprobado: tipo/monto/motivo+nota top-level/registradoPor=Daniel/solicitudId');
    const f1 = movs.find((m) => m.id === 'f1');
    const reemplazo = movs.find((m) => m.solicitudId === 's2-correccion');
    ok(!!f1 && f1.anulado === true && f1.motivoCategoria === 'CORRECCION' && f1.corregidoPor === reemplazo?.id,
        `original f1 ANULADO con motivoCategoria + corregidoPor → ${f1?.corregidoPor}`);
    ok(!!reemplazo && reemplazo.tipo === 'factura' && reemplazo.monto === 80000
        && reemplazo.correccionDe === 'f1' && reemplazo.fecha === f1?.fecha
        && reemplazo.registradoPor === sols['s2-correccion'].resueltoPor && reemplazo.anulado === false,
        'reemplazo: factura $80.000, fecha del original, correccionDe=f1, registradoPor=Daniel');
    ok(movs.length === 5, `5 movimientos en el libro (3 sembrados + 2 nacidos al aprobar) — hay ${movs.length}`);

    console.log(fallos.length === 0
        ? '\n🏁 GUION VERIFICADO AL 100%: las escrituras de M2b cuadran con el contrato §74.\n'
        : `\n⛔ ${fallos.length} verificación(es) FALLARON.\n`);
    process.exit(fallos.length === 0 ? 0 : 1);
}

// ─── LIMPIEZA ──────────────────────────────────────────────────────────────────
if (LIMPIAR) {
    const snap = await clienteRef.get();
    if (!snap.exists) {
        const movs = await clienteRef.collection('movimientos').limit(1).get();
        if (movs.empty) { console.log('ℹ️ Nada que limpiar: la clienta de prueba no existe.'); process.exit(0); }
        console.log('⚠️ Doc del cliente ausente pero hay subcolecciones huérfanas — limpiando igual…');
    }
    await db.recursiveDelete(clienteRef);
    console.log('🧹 recursiveDelete ejecutado. Vigilando el fantasma del trigger (8s)…');
    await sleep(8000);
    // El trigger de un movimiento borrado pudo resucitar el doc (set+merge) → re-borrar.
    for (let i = 0; i < 3; i++) {
        const ghost = await clienteRef.get();
        if (!ghost.exists) break;
        console.log(`👻 Doc resucitado por el trigger (intento ${i + 1}) — borrando de nuevo…`);
        await clienteRef.delete();
        await sleep(4000);
    }
    const final = await clienteRef.get();
    const movsFinal = await clienteRef.collection('movimientos').limit(1).get();
    const solsFinal = await clienteRef.collection('solicitudes').limit(1).get();
    if (!final.exists && movsFinal.empty && solsFinal.empty) {
        console.log('✅ Limpieza VERIFICADA: clienta, movimientos y solicitudes de prueba eliminados.\n');
    } else {
        console.error(`⛔ Quedaron restos: doc=${final.exists} movs=${!movsFinal.empty} sols=${!solsFinal.empty} — re-correr --limpiar.\n`);
        process.exit(1);
    }
    process.exit(0);
}

// ─── SIEMBRA ───────────────────────────────────────────────────────────────────
const existente = await clienteRef.get();
if (existente.exists) {
    console.log('\nℹ️ La clienta de prueba YA existe — no se vuelve a sembrar. Para empezar de cero: --limpiar y luego --aplicar.');
    process.exit(0);
}

// Movimientos realistas: factura vieja VENCIDA (mora visible en la tarjeta),
// un abono y una factura reciente. Saldo esperado: 500k − 100k + 60k = 460.000.
const F1_FECHA = hace(45);
const MOVS = [
    { id: 'f1', data: { tipo: 'factura', monto: 500000, fecha: F1_FECHA, descripcion: 'PRUEBA M2B — anillo de ensayo', registradoPor: SOLICITANTE, anulado: false } },
    { id: 'a1', data: { tipo: 'abono', monto: 100000, fecha: hace(10), descripcion: 'PRUEBA M2B — abono de ensayo', medioPago: 'transferencia', registradoPor: SOLICITANTE, anulado: false } },
    { id: 'f2', data: { tipo: 'factura', monto: 60000, fecha: hace(5), descripcion: 'PRUEBA M2B — dije de ensayo', registradoPor: SOLICITANTE, anulado: false } },
];
const SALDO_ESPERADO = 460000;

// Solicitudes espejo EXACTO del contrato §74 (lo que M2a escribiría).
const SOLICITUDES = [
    { id: 's1-simple', data: {
        tipo: 'ajuste', monto: -30000, motivo: 'DESCUENTO_AUTORIZADO',
        nota: 'PRUEBA M2B (paso 2 del guion): apruébala — ajuste simple',
        fecha: hace(0), solicitadoPor: SOLICITANTE, estado: 'pendiente',
        saldoAlSolicitar: SALDO_ESPERADO,
    } },
    { id: 's2-correccion', data: {
        tipo: 'correccion', monto: -420000, motivo: 'Te equivocaste al digitar el monto',
        nota: 'PRUEBA M2B (paso 3 del guion): apruébala — la factura real era de 80 mil',
        fecha: F1_FECHA, solicitadoPor: SOLICITANTE, estado: 'pendiente',
        correccionDe: 'f1',
        datosCorreccion: {
            reemplazo: { tipo: 'factura', monto: 80000, fecha: F1_FECHA, descripcion: 'PRUEBA M2B — anillo de ensayo (corregido)' },
            snapshotOriginal: { tipo: 'factura', monto: 500000, fecha: F1_FECHA, descripcion: 'PRUEBA M2B — anillo de ensayo', anulado: false },
            motivoCategoria: 'CORRECCION',
        },
        saldoAlSolicitar: SALDO_ESPERADO,
    } },
    { id: 's3-rechazar', data: {
        tipo: 'ajuste', monto: -60000, motivo: 'OTRO',
        nota: 'PRUEBA M2B (paso 4 del guion): RECHÁZALA escribiendo un motivo',
        fecha: hace(0), solicitadoPor: SOLICITANTE, estado: 'pendiente',
        saldoAlSolicitar: SALDO_ESPERADO,
    } },
    { id: 's4-drift', data: {
        tipo: 'ajuste', monto: -20000, motivo: 'ERROR_REGISTRO',
        nota: 'PRUEBA M2B (paso 5 del guion): mira la alerta roja de "el saldo cambió" — no la toques',
        fecha: hace(0), solicitadoPor: SOLICITANTE, estado: 'pendiente',
        saldoAlSolicitar: 999000,   // FALSO a propósito → dispara la alerta de drift (PR2)
    } },
];

if (!APLICAR) {
    console.log('\n— PREFLIGHT (esto es lo que se crearía con --aplicar):');
    console.log(`  clientes/${CLIENTE_ID} — "🧪 PRUEBA M2B (se borra hoy — no tocar)"`);
    MOVS.forEach((m) => console.log(`  movimientos/${m.id}: ${m.data.tipo} $${m.data.monto.toLocaleString('es-CO')} (${m.data.fecha})`));
    SOLICITUDES.forEach((s) => console.log(`  solicitudes/${s.id}: ${s.data.tipo} ${s.data.monto.toLocaleString('es-CO')} — ${s.data.nota}`));
    console.log(`  Saldo esperado tras el recálculo: $${SALDO_ESPERADO.toLocaleString('es-CO')}`);
    process.exit(0);
}

await clienteRef.set({
    nombre: '🧪 PRUEBA M2B (se borra hoy — no tocar)',
    notas: 'Clienta de ENSAYO para el guion de verificación M2b. La borra Claude con seed-guion-m2b.mjs --limpiar.',
    origen: 'seed-prueba-m2b',
    activo: true,
    createdAt: FieldValue.serverTimestamp(),
});
for (const m of MOVS) {
    await clienteRef.collection('movimientos').doc(m.id)
        .set({ ...m.data, registradoEn: FieldValue.serverTimestamp() });
}
console.log('✍️ Clienta + 3 movimientos creados. Esperando el recálculo del saldo (4s)…');
await sleep(4000);
const conSaldo = await clienteRef.get();
const saldo = conSaldo.data()?.saldoActual;
console.log(saldo === SALDO_ESPERADO
    ? `✅ recalcSaldoCliente VIVO: saldoActual = $${saldo.toLocaleString('es-CO')} (esperado).`
    : `⚠️ saldoActual = ${saldo} (esperado ${SALDO_ESPERADO}) — puede estar aún propagándose.`);

for (const s of SOLICITUDES) {
    await clienteRef.collection('solicitudes').doc(s.id)
        .set({ ...s.data, creadoEn: FieldValue.serverTimestamp() });
}
console.log(`✅ 4 solicitudes pendientes sembradas. El guion está listo en admin-salud.html.\n`);
