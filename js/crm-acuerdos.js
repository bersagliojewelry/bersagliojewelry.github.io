/**
 * Bersaglio CRM — Acuerdos de pago: GENERADOR de cuotas y helpers de UI
 * (panel-only, spec 2026-06-12 §1.9).
 *
 * La VALIDACIÓN del acuerdo vive en `js/crm-estado-cuenta.js` (acuerdoEsValido,
 * el archivo de PARIDAD que también corre en el corte mensual) — este módulo
 * solo ARMA propuestas que aquella acepta, y la fórmula del aging NO lo importa
 * (un import roto en functions reventaría la paridad de la que depende el corte).
 *
 * "Quincenal" cartagenero = los días 15 y ÚLTIMO de cada mes (decisión operativa
 * del comité; la primera cuota la elige Kary y la cadencia se engancha sola).
 * El MODELO soporta 'fechas' (lista pactada explícita); la UI v1 no la genera.
 */

const ISO = /^\d{4}-\d{2}-\d{2}$/;

function aDate(iso) { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); }
function aISO(dt) { return dt.toISOString().slice(0, 10); }

/** Siguiente fecha de QUINCENA: día 15 → fin de mes → 15 del mes siguiente… */
export function siguienteQuincena(iso) {
    const dt = aDate(iso);
    const y = dt.getUTCFullYear(), m = dt.getUTCMonth(), dia = dt.getUTCDate();
    const finMes = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    if (dia < 15) return aISO(new Date(Date.UTC(y, m, 15)));
    if (dia < finMes) return aISO(new Date(Date.UTC(y, m + 1, 0)));
    return aISO(new Date(Date.UTC(y, m + 1, 15)));
}

/** `primera` + n meses, conservando el día (clamp al fin de mes: 31 ene → 28 feb → 31 mar). */
export function masMeses(iso, n) {
    const dt = aDate(iso);
    const y = dt.getUTCFullYear(), m = dt.getUTCMonth(), d = dt.getUTCDate();
    const finMes = new Date(Date.UTC(y, m + n + 1, 0)).getUTCDate();
    return aISO(new Date(Date.UTC(y, m + n, Math.min(d, finMes))));
}

/**
 * Genera las cuotas del plan: montos ENTEROS iguales con el residuo en la
 * ÚLTIMA cuota (entero-COP, nada de centavos fantasma); fechas por cadencia.
 * @param {object} p { total:int>0, n:int 1..24, periodicidad:'quincenal'|'mensual', primeraFecha:'YYYY-MM-DD' }
 * @returns {Array<{fecha:string,monto:number}>|null} null si no da un plan sano.
 */
export function generarCuotas({ total, n, periodicidad, primeraFecha }) {
    if (!Number.isInteger(total) || total <= 0) return null;
    if (!Number.isInteger(n) || n < 1 || n > 24) return null;
    if (!ISO.test(primeraFecha || '')) return null;
    if (!['quincenal', 'mensual'].includes(periodicidad)) return null;
    const base = Math.floor(total / n);
    if (base < 1) return null;                        // más cuotas que pesos
    const cuotas = [];
    let fecha = primeraFecha;
    for (let i = 0; i < n; i++) {
        if (i > 0) {
            // mensual ancla al DÍA de la primera (no camina con el clamp);
            // quincenal es una cadencia y se engancha desde la cuota anterior.
            fecha = periodicidad === 'mensual' ? masMeses(primeraFecha, i) : siguienteQuincena(fecha);
        }
        cuotas.push({ fecha, monto: i === n - 1 ? total - base * (n - 1) : base });
    }
    return cuotas;
}

export function sumaCuotas(cuotas) {
    return (cuotas || []).reduce((s, q) => s + (Number.isFinite(q?.monto) ? q.monto : 0), 0);
}

/** Resumen del plan para el preview del modal (lenguaje de mostrador). */
export function resumenCuotas(cuotas, fmtCOP) {
    if (!cuotas || !cuotas.length) return '';
    const primera = cuotas[0], ultima = cuotas[cuotas.length - 1];
    const fmtF = (iso) => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };
    if (cuotas.length === 1) return `1 cuota de ${fmtCOP(primera.monto)} el ${fmtF(primera.fecha)}.`;
    return `${cuotas.length} cuotas de ${fmtCOP(primera.monto)}`
        + (ultima.monto !== primera.monto ? ` (última ${fmtCOP(ultima.monto)})` : '')
        + ` · primera ${fmtF(primera.fecha)} · última ${fmtF(ultima.fecha)}.`;
}
