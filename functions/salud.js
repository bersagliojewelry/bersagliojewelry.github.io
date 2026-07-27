/**
 * Bersaglio — Salud del sistema (F6 frente D, plan §57).
 *
 * Red de seguridad del dinero: la reconciliación recomputa el saldo de TODOS los
 * clientes desde la fuente de verdad (sus movimientos) y lo compara contra el
 * `saldoActual` guardado. Un descuadre = el trigger `recalcSaldoCliente` falló en
 * silencio o hay un dato corrupto → queda visible en el panel (vista Salud) y en
 * los logs (señal para la alerta de Cloud Monitoring, pendiente de Daniel).
 *
 * Escrituras (SOLO Cloud Functions — las reglas niegan write a clientes):
 *   salud/reconciliacion  — resultado de la ÚLTIMA corrida (pisar, no apilar).
 *   salud/backup          — lo escribe backup.js tras cada copia exitosa.
 *   saludEventos/{id}     — eventos de fallo (p.ej. recalc-saldo-error, index.js).
 *
 * Costo (§3.6, zero-budget): 1 lectura de `clientes` + 1 collectionGroup de
 * `movimientos` al día (~unidades de millar de lecturas a la escala actual).
 * Upgrade path a escala (anotado en revisión F6): reconciliación INCREMENTAL
 * (solo clientes con saldoActualizadoEn posterior a la última corrida) cuando la
 * base se acerque a ~25k docs (2 full-scans/día ≈ tope del free tier).
 */
'use strict';

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { compararSaldos, compararSaldosCuentas } = require('./reconciliacion');

// La vista Salud lista los descuadres; un tope evita un doc gigante si algún día
// se descuadra la cartera entera (el total real siempre viaja en totalDescuadres).
const MAX_DESCUADRES_GUARDADOS = 50;

/**
 * Corre la reconciliación completa y persiste el resultado en `salud/reconciliacion`.
 * @param {FirebaseFirestore.Firestore} db
 * @param {'diaria'|'manual'} origen
 * @returns {Promise<{totalClientes: number, totalDescuadres: number, ok: boolean}>}
 */
async function runReconciliacion(db, origen) {
    const [clientesSnap, movsSnap] = await Promise.all([
        db.collection('clientes').get(),
        db.collectionGroup('movimientos').get(),
    ]);

    const clientes = clientesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const movimientosPorCliente = new Map();
    for (const mov of movsSnap.docs) {
        const clienteId = mov.ref.parent.parent?.id;
        if (!clienteId) continue;
        if (!movimientosPorCliente.has(clienteId)) movimientosPorCliente.set(clienteId, []);
        movimientosPorCliente.get(clienteId).push(mov.data());
    }

    const r = compararSaldos(clientes, movimientosPorCliente);

    // Anti falsa-alarma: el full-scan NO es una vista consistente (dos queries
    // independientes) y `saldoActual` lo escribe un trigger asíncrono — si Kary
    // registra un movimiento durante la corrida, saldría un descuadre FANTASMA.
    // Cada sospechoso se RE-VERIFICA con una lectura fresca y puntual (cliente +
    // sus movimientos): solo se reporta lo que sigue descuadrado.
    if (!r.ok) {
        const confirmados = [];
        for (const d of r.descuadres) {
            const ref = db.collection('clientes').doc(d.clienteId);
            const [cliSnap, movsSnap] = await Promise.all([ref.get(), ref.collection('movimientos').get()]);
            if (!cliSnap.exists) continue; // borrado entre pasadas → no es descuadre
            const check = compararSaldos(
                [{ id: d.clienteId, ...cliSnap.data() }],
                new Map([[d.clienteId, movsSnap.docs.map((m) => m.data())]]),
            );
            confirmados.push(...check.descuadres);
        }
        r.descuadres = confirmados;
        r.totalDescuadres = confirmados.length;
        r.ok = confirmados.length === 0;
    }

    await db.collection('salud').doc('reconciliacion').set({
        ultimaCorrida: FieldValue.serverTimestamp(),
        origen,
        ok: r.ok,
        totalClientes: r.totalClientes,
        totalDescuadres: r.totalDescuadres,
        descuadres: r.descuadres.slice(0, MAX_DESCUADRES_GUARDADOS),
    });

    if (!r.ok) {
        // console.error = señal para la futura alert policy de Cloud Monitoring.
        console.error(`[reconciliacion] DESCUADRE en ${r.totalDescuadres} cliente(s) de ${r.totalClientes}: `
            + r.descuadres.slice(0, 10).map((d) => `${d.clienteId} (guardado ${d.saldoGuardado} ≠ calculado ${d.saldoCalculado})`).join(' · '));
    } else {
        console.log(`[reconciliacion] OK — ${r.totalClientes} cliente(s) cuadrado(s) (origen: ${origen})`);
    }

    return { totalClientes: r.totalClientes, totalDescuadres: r.totalDescuadres, ok: r.ok };
}

/**
 * F-TESORERÍA B5 (cierre) · el MISMO control, para el libro del banco: `saldoActual` de cada cuenta
 * vs el recompute desde su ledger. Un descuadre aquí significa que el trigger `recalcSaldoTesoreria`
 * falló en silencio — el fallo que nadie nota hasta que la plata no aparece.
 *
 * Escribe `salud/reconciliacionTesoreria` (pisar, no apilar) y, si el descuadre se CONFIRMA, un
 * `saludEventos` con `resuelto:false` → suena en la tarjeta "Avisos" del Hoy, que es donde Daniel
 * mira (precisión de D6: los eventos de auditoría nacen `resuelto:true`; los FALLOS, false).
 *
 * @param {FirebaseFirestore.Firestore} db
 * @param {'diaria'|'manual'} origen
 */
async function runReconciliacionTesoreria(db, origen) {
    const [cuentasSnap, movsSnap] = await Promise.all([
        db.collection('cuentasTesoreria').get(),
        db.collection('movimientosTesoreria').get(),
    ]);

    const cuentas = cuentasSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const movsPorCuenta = new Map();
    for (const m of movsSnap.docs) {
        const data = m.data();
        const cid = data.cuentaId;
        if (!cid) continue;
        if (!movsPorCuenta.has(cid)) movsPorCuenta.set(cid, []);
        movsPorCuenta.get(cid).push({ id: m.id, ...data });   // `id` lo necesita ajuste_inverso (signo del ref)
    }

    const r = compararSaldosCuentas(cuentas, movsPorCuenta);

    // Anti falsa-alarma (mismo blindaje que la cartera): el full-scan son DOS queries independientes
    // y `saldoActual` lo escribe un trigger asíncrono — un movimiento registrado DURANTE la corrida
    // daría un descuadre fantasma. Cada sospechoso se re-verifica con lecturas frescas y puntuales.
    if (!r.ok) {
        const confirmados = [];
        for (const d of r.descuadres) {
            const ctaSnap = await db.collection('cuentasTesoreria').doc(d.cuentaId).get();
            if (!ctaSnap.exists) continue;   // borrada entre pasadas → no es descuadre
            const frescos = await db.collection('movimientosTesoreria').where('cuentaId', '==', d.cuentaId).get();
            const check = compararSaldosCuentas(
                [{ id: d.cuentaId, ...ctaSnap.data() }],
                new Map([[d.cuentaId, frescos.docs.map((m) => ({ id: m.id, ...m.data() }))]]),
            );
            confirmados.push(...check.descuadres);
        }
        r.descuadres = confirmados;
        r.totalDescuadres = confirmados.length;
        r.ok = confirmados.length === 0;
    }

    await db.collection('salud').doc('reconciliacionTesoreria').set({
        ultimaCorrida: FieldValue.serverTimestamp(),
        origen,
        ok: r.ok,
        totalCuentas: r.totalCuentas,
        totalDescuadres: r.totalDescuadres,
        descuadres: r.descuadres.slice(0, MAX_DESCUADRES_GUARDADOS),
    });

    if (!r.ok) {
        console.error(`[reconciliacion-tesoreria] DESCUADRE en ${r.totalDescuadres} cuenta(s) de ${r.totalCuentas}: `
            + r.descuadres.slice(0, 10).map((d) => `${d.nombre} (guardado ${d.saldoGuardado} ≠ calculado ${d.saldoCalculado})`).join(' · '));
        // Un doc POR CUENTA: el aviso se puede resolver una a una, y re-correr no duplica (id fijo).
        await Promise.all(r.descuadres.slice(0, MAX_DESCUADRES_GUARDADOS).map((d) => db
            .collection('saludEventos').doc(`teso-descuadre-${d.cuentaId}`).set({
                tipo: 'tesoreria-descuadre',
                detalle: `⚠️ La cuenta "${d.nombre}" muestra ${d.saldoGuardado} pero sus movimientos suman ${d.saldoCalculado} (diferencia ${d.diferencia}). El recálculo automático falló y el saldo guardado quedó viejo — los movimientos son la verdad. Arréglalo con el botón "Reparar" de Salud del sistema.`,
                cuentaId: d.cuentaId, diferencia: d.diferencia,
                at: FieldValue.serverTimestamp(), resuelto: false,
            }, { merge: true })
            .catch((e) => console.error('[reconciliacion-tesoreria] aviso no registrado:', e))));
    } else {
        console.log(`[reconciliacion-tesoreria] OK — ${r.totalCuentas} cuenta(s) cuadrada(s) (origen: ${origen})`);
    }

    return { totalCuentas: r.totalCuentas, totalDescuadres: r.totalDescuadres, ok: r.ok };
}

// 3:30 AM Bogotá — media hora después de backupDiario (3:00), para reconciliar
// sobre la base recién respaldada y no competir por la misma ventana.
exports.reconciliacionDiaria = onSchedule({
    schedule: '30 3 * * *',
    timeZone: 'America/Bogota',
    region: 'us-central1',
    timeoutSeconds: 300,
    memory: '256MiB',
    retryCount: 2,
    maxInstances: 1,
}, async () => {
    const db = getFirestore();
    await runReconciliacion(db, 'diaria');
    // El cuadre del banco va DESPUÉS y aislado: si falla (p.ej. una cuenta con dato corrupto),
    // no puede tumbar el de cartera, que ya quedó escrito.
    try { await runReconciliacionTesoreria(db, 'diaria'); }
    catch (e) { console.error('[reconciliacion-tesoreria] falló:', e); }
});

exports.runReconciliacion = runReconciliacion;
exports.runReconciliacionTesoreria = runReconciliacionTesoreria;
