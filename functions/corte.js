/**
 * Bersaglio — CORTE MENSUAL inmutable del aging (Fase M · M4, plan §69 PR1).
 *
 * El ancla probatoria: el libro vivo se recomputa retroactivamente (una
 * CORRECCION_FECHA aprobada reescribe la historia de mora hacia atrás); la FOTO
 * de cada cierre NO. Soporta provisión (art. 145 ET, se calcula al cierre),
 * expediente de castigo (mora >360 A una fecha) y baseline de indicadores.
 *
 * UNA FÓRMULA (L-03): el aging se calcula con `crm-estado-cuenta.mjs`, copia
 * BYTE-IDÉNTICA de `js/crm-estado-cuenta.js` (lo que ve el panel). El test de
 * paridad (tests/aging-paridad.test.mjs) revienta si alguien las hace divergir.
 *
 * INMUTABILIDAD: si `cortes/{mes}` ya existe, NO se reescribe (la primera foto
 * gana). Las reglas niegan todo write del cliente; solo este Admin SDK escribe.
 *
 * Programada: día 1 de cada mes, 03:50 Bogotá (tras backup 3:00 y reconciliación
 * 3:30) → fotografía el mes que ACABA de cerrar. `generarCorte` (callable,
 * owner-only) es el respaldo manual si el scheduler falla.
 */
'use strict';

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// Bogotá es UTC-5 SIN horario de verano → el corrimiento fijo es correcto.
const BOGOTA_OFFSET_MS = 5 * 3600e3;

/** 'YYYY-MM' del mes ANTERIOR al instante dado, en hora de Bogotá. */
function mesAnterior(ahora = new Date()) {
    const bog = new Date(ahora.getTime() - BOGOTA_OFFSET_MS);
    let y = bog.getUTCFullYear();
    let m = bog.getUTCMonth();            // 0-11 = mes ACTUAL en Bogotá
    if (m === 0) { y -= 1; m = 12; } // enero → diciembre del año anterior
    return `${y}-${String(m).padStart(2, '0')}`;
}

/**
 * Genera el corte del mes indicado (si NO existe). Full-scan espejo de la
 * reconciliación (salud.js): 1 lectura de clientes + 1 collectionGroup.
 * @returns {Promise<{mes:string, existed:boolean, totalClientes?:number}>}
 */
async function runCorte(db, mes, origen) {
    const ref = db.collection('cortes').doc(mes);
    const ya = await ref.get();
    if (ya.exists) {
        console.log(`[corte] ${mes} YA existe — inmutable, no se reescribe (origen: ${origen}).`);
        return { mes, existed: true };
    }

    // El aging vive en el módulo ESM byte-idéntico al del panel (una fórmula).
    const { estadoCuenta } = await import('./crm-estado-cuenta.mjs');

    const [clientesSnap, movsSnap, negocioSnap] = await Promise.all([
        db.collection('clientes').get(),
        db.collectionGroup('movimientos').get(),
        db.collection('config').doc('negocio').get(),
    ]);
    const cfg = negocioSnap.exists ? negocioSnap.data() : {};
    const diasPlazo = (typeof cfg.diasPlazo === 'number' && cfg.diasPlazo >= 0) ? cfg.diasPlazo : 30;
    const fechaCorte = typeof cfg.fechaCorteMigracion === 'string' ? cfg.fechaCorteMigracion : undefined;

    const movimientosPorCliente = new Map();
    for (const mov of movsSnap.docs) {
        const clienteId = mov.ref.parent.parent?.id;
        if (!clienteId) continue;
        if (!movimientosPorCliente.has(clienteId)) movimientosPorCliente.set(clienteId, []);
        movimientosPorCliente.get(clienteId).push(mov.data());
    }

    const clientes = {};
    const totales = { saldo: 0, vencido: 0, alDia: 0, sinFecha: 0 };
    for (const doc of clientesSnap.docs) {
        const est = estadoCuenta(movimientosPorCliente.get(doc.id) || [], { diasPlazo, fechaCorte });
        clientes[doc.id] = {
            nombre: doc.data().nombre || '',
            saldo: est.saldo, vencido: est.vencido, alDia: est.alDia,
            sinFecha: est.sinFecha, diasMora: est.diasMora, buckets: est.buckets,
            estado: est.estado,
        };
        totales.saldo += est.saldo;
        totales.vencido += est.vencido;
        totales.alDia += est.alDia;
        totales.sinFecha += est.sinFecha;
    }

    await ref.set({
        mes,
        generadoEn: FieldValue.serverTimestamp(),
        origen,
        diasPlazo,
        ...(fechaCorte ? { fechaCorte } : {}),
        totalClientes: clientesSnap.size,
        totales,
        clientes,
    });
    console.log(`[corte] ${mes} GENERADO — ${clientesSnap.size} cliente(s), saldo total ${totales.saldo}, vencido ${totales.vencido} (origen: ${origen}).`);
    return { mes, existed: false, totalClientes: clientesSnap.size };
}

// Día 1 de cada mes, 03:50 Bogotá → la foto del mes que acaba de cerrar.
exports.corteMensual = onSchedule({
    schedule: '50 3 1 * *',
    timeZone: 'America/Bogota',
    region: 'us-central1',
    timeoutSeconds: 300,
    memory: '256MiB',
    retryCount: 2,
    maxInstances: 1,
}, async () => {
    await runCorte(getFirestore(), mesAnterior(), 'programado');
});

exports.runCorte = runCorte;
exports.mesAnterior = mesAnterior;
