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

// Versión de la FÓRMULA del aging que fotografía este corte. El mes del
// despliegue de acuerdos, "vencido" cambia por FÓRMULA, no por cobranza — sin
// este marcador, una comparativa mes-a-mes leería una mejora/empeora ficticia.
//   v1 = fecha+plazo / vencimiento M6 · v2 = acuerdos por TRAMOS (descartada) ·
//   v3 = acuerdos como ESCUDO de 2 estados (Consejo Externo; saldo + mutex)
const FORMULA_VERSION = 3;

/**
 * Agrupa docs de un collectionGroup por clienteId conservando el ID del doc.
 * Es el armado de INSUMOS de la fórmula compartida: los acuerdos de alcance
 * 'factura' anclan por `movimientoId == mov.id` — un corte que pasara los
 * movimientos SIN id rompería la paridad de INSUMOS aunque el código de la
 * fórmula sea byte-idéntico (test: tests/corte-insumos.test.mjs).
 */
function agruparPorCliente(docs) {
    const por = new Map();
    for (const d of docs) {
        const clienteId = d.ref.parent.parent?.id;
        if (!clienteId) continue;
        if (!por.has(clienteId)) por.set(clienteId, []);
        por.get(clienteId).push({ id: d.id, ...d.data() });
    }
    return por;
}

/**
 * Cristaliza el estado del acuerdo para el corte inmutable (evidencia DIAN art.
 * 146). Estados: 'al-dia' (cumple), 'en-mora' (atrasado pero el escudo aguanta),
 * 'incumplido' (roto/perforado). PURO → testeable sin emulador.
 * @param {object} plan  est.plan de estadoCuenta ({acuerdoId, roto, vencidoPlan, cuotasVencidas})
 */
function acuerdoAlCorte(plan) {
    return {
        id: plan.acuerdoId,
        estadoAlCorte: plan.roto ? 'incumplido' : (plan.vencidoPlan > 0 ? 'en-mora' : 'al-dia'),
        cuotasVencidas: plan.cuotasVencidas,
        vencidoPlan: plan.vencidoPlan,
    };
}

/**
 * Genera el corte del mes indicado (si NO existe). Full-scan espejo de la
 * reconciliación (salud.js): 1 lectura de clientes + 2 collectionGroup.
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

    const [clientesSnap, movsSnap, acuerdosSnap, negocioSnap, carteraSnap] = await Promise.all([
        db.collection('clientes').get(),
        db.collectionGroup('movimientos').get(),
        db.collectionGroup('acuerdos').get(),
        db.collection('config').doc('negocio').get(),
        db.collection('config').doc('cartera').get(),
    ]);
    const cfg = negocioSnap.exists ? negocioSnap.data() : {};
    const diasPlazo = (typeof cfg.diasPlazo === 'number' && cfg.diasPlazo >= 0) ? cfg.diasPlazo : 30;
    const fechaCorte = typeof cfg.fechaCorteMigracion === 'string' ? cfg.fechaCorteMigracion : undefined;
    // Horizonte del acuerdo (P3 de Daniel: 24 meses; owner-only en config/cartera).
    const cart = carteraSnap.exists ? carteraSnap.data() : {};
    const horizonteDias = (typeof cart.horizonteAcuerdoDias === 'number' && cart.horizonteAcuerdoDias > 0)
        ? cart.horizonteAcuerdoDias : 730;

    const movimientosPorCliente = agruparPorCliente(movsSnap.docs);
    const acuerdosPorCliente = agruparPorCliente(acuerdosSnap.docs);

    const clientes = {};
    const totales = { saldo: 0, vencido: 0, alDia: 0, sinFecha: 0, bajoAcuerdo: 0 };
    for (const doc of clientesSnap.docs) {
        const est = estadoCuenta(movimientosPorCliente.get(doc.id) || [], {
            diasPlazo, fechaCorte,
            acuerdos: acuerdosPorCliente.get(doc.id) || [], horizonteDias,
        });
        clientes[doc.id] = {
            nombre: doc.data().nombre || '',
            saldo: est.saldo, vencido: est.vencido, alDia: est.alDia,
            sinFecha: est.sinFecha, diasMora: est.diasMora, buckets: est.buckets,
            estado: est.estado,
            // Cartera reestructurada ≠ vigente: la foto distingue al-día-genuino de
            // al-día-por-pacto. `bajoAcuerdo` = monto reestructurado.
            ...(est.bajoAcuerdo > 0 ? { bajoAcuerdo: est.bajoAcuerdo } : {}),
            // CRISTALIZACIÓN del estado del acuerdo (Consejo Externo, evidencia DIAN
            // art. 146): el estado DERIVADO se congela firmado por el reloj del
            // servidor — reconstruirlo al vuelo en 2 años es indefendible. Compacto
            // (el calendario probatorio vive en el doc inmutable del acuerdo).
            ...(est.plan ? { acuerdoAlCorte: acuerdoAlCorte(est.plan) } : {}),
        };
        totales.saldo += est.saldo;
        totales.vencido += est.vencido;
        totales.alDia += est.alDia;
        totales.sinFecha += est.sinFecha;
        totales.bajoAcuerdo += est.bajoAcuerdo;
    }

    await ref.set({
        mes,
        generadoEn: FieldValue.serverTimestamp(),
        origen,
        formulaVersion: FORMULA_VERSION,
        diasPlazo,
        ...(fechaCorte ? { fechaCorte } : {}),
        totalClientes: clientesSnap.size,
        totales,
        clientes,
    });
    console.log(`[corte] ${mes} GENERADO — ${clientesSnap.size} cliente(s), saldo total ${totales.saldo}, vencido ${totales.vencido}, bajoAcuerdo ${totales.bajoAcuerdo} (origen: ${origen}, fórmula v${FORMULA_VERSION}).`);
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
exports.agruparPorCliente = agruparPorCliente;
exports.acuerdoAlCorte = acuerdoAlCorte;
