/**
 * Bersaglio CRM — Lógica PURA de la aprobación de Daniel (Fase M · M2b).
 *
 * Este módulo NO toca Firestore: es el RE-VALIDADOR y armador de payloads que
 * consume la superficie de aprobación (js/admin/aprobaciones.js). Regla de oro del
 * contrato verificado (ADR §74): **M2b NUNCA confía en `datosCorreccion`** (es un
 * map libre que las reglas no inspeccionan) — re-lee el movimiento ORIGINAL real
 * y verifica que todo cuadre ANTES de que Daniel apruebe:
 *   (a) el original sigue VIGENTE (existe y no está anulado),
 *   (b) el tipo coincide (el reemplazo conserva el MISMO tipo),
 *   (c) el original no mutó frente al snapshot que Kary vio (monto = bloqueante),
 *   (d) el delta solicitado es coherente — recomputado con `efectoSaldo` IMPORTADO
 *       de js/crm-correccion.js (fuente única del signo, deferido 3 del §74),
 *   (e) el reemplazo es válido (entero; factura/abono > 0; fecha ISO),
 *   (f) drift de saldo (cambió desde que Kary pidió) → ADVIERTE (no bloquea),
 *   (g) drift del snapshot en campos no monetarios (fecha/descripción) → ADVIERTE.
 *
 * El `solicitudId` que viaja en el asiento aprobado es el ID REAL del doc de la
 * solicitud (lo pone el llamador desde el snapshot — deferido 2 del §74), nunca
 * algo que venga dentro de `datosCorreccion`.
 *
 * PURO y testeable sin emulador → `tests/crm-aprobacion.test.mjs`.
 */

import { efectoSaldo } from './crm-correccion.js';

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

// Motivo de rechazo AUTOMÁTICO cuando el original ya no está vigente (plan §69 M2b:
// "no hay 4º estado 'obsoleta'; se reusa el ciclo existente" — Kary ve el rechazo
// y re-solicita sobre el estado actual).
export const MOTIVO_OBSOLETA = 'ASIENTO_YA_NO_VIGENTE';
// Motivo automático cuando la solicitud no cuadra con el registro real (defensa del
// backlog §72-2: coherencia tipo↔payload; la re-solicitud de Kary es la salida).
export const MOTIVO_INCOHERENTE = 'DATOS_NO_COINCIDEN';

/**
 * Valida una solicitud de AJUSTE simple antes de aprobar (2 escrituras).
 * @returns {{ok:boolean, errores:string[]}}
 */
export function validarAprobacionAjuste(sol) {
    const errores = [];
    if (!sol || sol.tipo !== 'ajuste') errores.push('La solicitud no es un ajuste de saldo.');
    const monto = Number(sol && sol.monto);
    if (!Number.isInteger(monto) || monto === 0) errores.push('El ajuste no tiene un monto válido.');
    return { ok: errores.length === 0, errores };
}

/**
 * RE-VALIDA una solicitud de CORRECCIÓN contra el movimiento original REAL
 * (re-leído este instante, no el snapshot). Contrato §74 (a)-(e) bloquean;
 * (g) advierte. El drift de saldo (f) se evalúa aparte (hayDriftSaldo).
 * @param {object} sol       solicitud { tipo, monto, correccionDe, datosCorreccion }
 * @param {object|null} original  movimiento actual re-leído (null = ya no existe)
 * @returns {{ok:boolean, obsoleta:boolean, errores:string[], advertencias:string[]}}
 */
export function validarAprobacionCorreccion(sol, original) {
    const errores = [];
    const advertencias = [];

    if (!sol || sol.tipo !== 'correccion') {
        return { ok: false, obsoleta: false, errores: ['La solicitud no es una corrección.'], advertencias };
    }
    const dc = sol.datosCorreccion;
    const reemplazo = dc && dc.reemplazo;
    const snap = dc && dc.snapshotOriginal;
    // Las reglas M1 admiten 'correccion' sin estos campos (backlog §72-2): aquí se
    // exige el payload completo o no hay nada que aprobar.
    if (!sol.correccionDe || !reemplazo || typeof reemplazo !== 'object') {
        return { ok: false, obsoleta: false, errores: ['La solicitud no trae los datos completos de la corrección.'], advertencias };
    }

    // (a) vigente — si no, la solicitud quedó OBSOLETA (rechazo automático, no error).
    if (!original) {
        return { ok: false, obsoleta: true, errores: ['El movimiento original ya no existe.'], advertencias };
    }
    if (original.anulado === true) {
        return { ok: false, obsoleta: true, errores: ['El movimiento original ya fue corregido o anulado por otra vía.'], advertencias };
    }

    const montoOriginal = Math.round(Number(original.monto));
    const montoNuevo = Number(reemplazo.monto);

    // Un AJUSTE no se corrige con par (M3): se anula y se registra uno nuevo con su
    // propio motivo. M2a ya no produce estas solicitudes; esto bloquea las residuales.
    if (original.tipo === 'ajuste') {
        errores.push('Un ajuste no se corrige así — se anula y se registra un ajuste nuevo desde "Corregir saldo".');
    }
    // (b) tipo coincide — el par de corrección conserva el MISMO tipo del original.
    if (reemplazo.tipo !== original.tipo) {
        errores.push('El tipo del reemplazo no coincide con el del registro actual.');
    }
    if (snap && snap.tipo !== original.tipo) {
        errores.push('El registro actual no es del tipo que Kary vio al pedir la corrección.');
    }
    // (c) el original no mutó vs el snapshot — en el campo de DINERO es bloqueante.
    if (snap && Math.round(Number(snap.monto)) !== montoOriginal) {
        errores.push('El monto del registro actual no coincide con el que Kary vio al pedir la corrección.');
    }
    // (g) drift en campos no monetarios → se advierte, no bloquea.
    if (snap && (snap.fecha || original.fecha) && snap.fecha !== original.fecha) {
        advertencias.push('La fecha del registro difiere de la que Kary vio.');
    }
    if (snap && (snap.descripcion || original.descripcion) && snap.descripcion !== original.descripcion) {
        advertencias.push('La descripción del registro difiere de la que Kary vio.');
    }

    // (e) reemplazo válido.
    if (!Number.isInteger(montoNuevo)) {
        errores.push('El monto nuevo no es un valor entero válido.');
    }
    if (['factura', 'abono'].includes(original.tipo) && !(montoNuevo > 0)) {
        errores.push('El monto nuevo debe ser mayor que 0.');
    }
    if (reemplazo.fecha && !ISO_RE.test(String(reemplazo.fecha))) {
        errores.push('La fecha nueva no es válida.');
    }

    // (d) delta coherente — recomputado, jamás confiado. (delta 0 es legítimo:
    // corrección de FECHA con el mismo monto.)
    if (Number.isInteger(montoNuevo)) {
        const delta = efectoSaldo(original.tipo, montoNuevo) - efectoSaldo(original.tipo, montoOriginal);
        if (delta !== Math.round(Number(sol.monto))) {
            errores.push('El efecto en el saldo no cuadra con lo que pide la solicitud.');
        }
    }

    return { ok: errores.length === 0, obsoleta: false, errores, advertencias };
}

/**
 * (f) ¿El saldo del cliente cambió desde que Kary pidió? Compara el saldo
 * RE-COMPUTADO al render contra `saldoAlSolicitar` (PR2: la aprobación es DE ALGO
 * vigente, no de un snapshot de hace días). Sin `saldoAlSolicitar` → sin señal.
 * @returns {{drift:boolean, saldoAlSolicitar:(number|null)}}
 */
export function hayDriftSaldo(sol, saldoRecomputado) {
    const ref = sol && sol.saldoAlSolicitar;
    if (!Number.isInteger(ref)) return { drift: false, saldoAlSolicitar: null };
    return { drift: Math.round(Number(saldoRecomputado)) !== ref, saldoAlSolicitar: ref };
}

/**
 * Arma el asiento de un AJUSTE aprobado (la escritura 1 de 2 del batch).
 * `solicitudId` = ID REAL del doc de la solicitud (deferido 2 del §74).
 * `motivo`/`nota` van TOP-LEVEL (deferido 4 del §74, enmienda 2026-06-11): el gate
 * de M3 exige a todo ajuste "motivo de lista cerrada + nota no vacía" y la regla
 * COINCIDENCIA solicitud↔asiento los compara — ambos están en la whitelist M3.
 * El servicio añade registradoPor/registradoEn/anulado.
 */
export function planAprobacionAjuste(sol, solId) {
    const motivo = String(sol.motivo || '').trim();
    const nota = String(sol.nota || '').trim();
    return {
        tipo: 'ajuste',
        monto: Math.round(Number(sol.monto)),
        ...(ISO_RE.test(String(sol.fecha || '')) ? { fecha: sol.fecha } : {}),
        descripcion: `Corrección aprobada (${motivo}): ${nota}`,
        ...(motivo ? { motivo } : {}),
        ...(nota ? { nota } : {}),
        solicitudId: solId,
    };
}

/**
 * Arma las DOS piezas del par de una CORRECCIÓN aprobada (escrituras 1 y 2 de 3):
 * el patch de ANULACIÓN del original y el doc del REEMPLAZO. Solo debe llamarse
 * tras `validarAprobacionCorreccion(...).ok === true`.
 * Fechas: la nueva si vino; si no, la del ORIGINAL re-leído (no la del snapshot).
 */
export function planAprobacionCorreccion(sol, solId, original) {
    const r = sol.datosCorreccion.reemplazo;
    const cat = String(sol.datosCorreccion.motivoCategoria || '').trim() || 'CORRECCION';
    const nota = String(sol.nota || sol.motivo || '').trim() || 'Corrección aprobada por el dueño';
    const fecha = ISO_RE.test(String(r.fecha || '')) ? r.fecha
        : (ISO_RE.test(String(original.fecha || '')) ? original.fecha : null);
    return {
        anulacion: { motivoAnulacion: nota, motivoCategoria: cat },
        reemplazo: {
            tipo: original.tipo,
            monto: Math.round(Number(r.monto)),
            ...(fecha ? { fecha } : {}),
            ...(r.descripcion ? { descripcion: String(r.descripcion).trim() } : {}),
            // Reemplazo de un ABONO: la regla M3 exige medioPago — se hereda del
            // ORIGINAL re-leído (no del snapshot); fallback 'otro' (red-team M3).
            ...(original.tipo === 'abono' ? { medioPago: original.medioPago || r.medioPago || 'otro' } : {}),
            correccionDe: sol.correccionDe,
            solicitudId: solId,
        },
    };
}
