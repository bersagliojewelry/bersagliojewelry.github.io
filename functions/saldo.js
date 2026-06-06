/**
 * Bersaglio CRM — Cálculo de saldo de cuenta por cobrar (núcleo, función PURA).
 *
 * El saldo de un cliente = suma con signo de sus movimientos NO anulados:
 *   factura / apertura / ajuste  → SUMAN  (+monto)   "el cliente debe más"
 *   abono                        → RESTA  (−monto)   "el cliente pagó"
 *
 * Convención de `monto` (validada en firestore.rules):
 *   - factura / abono:  monto >= 0  (cargo y pago son siempre positivos).
 *   - apertura / ajuste: monto puede ser NEGATIVO (solo admin) → así se modela
 *     el saldo a favor inicial (apertura negativa) y la corrección a la baja
 *     (ajuste negativo). Decisión Bloque 2 (ADR §43) — confirmable por Daniel/Kary.
 *
 * Resultado: saldo POSITIVO = el cliente debe; NEGATIVO = saldo a favor del cliente.
 *
 * Es PURA (sin Firestore) para poder testear la aritmética exacta sin emulador.
 */

// Signo que cada tipo aporta al saldo.
const SIGNO_POR_TIPO = Object.freeze({
    factura: 1,
    apertura: 1,
    ajuste: 1,
    abono: -1,
});

// Redondeo a 2 decimales para evitar artefactos de punto flotante (precisión exacta).
function round2(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Aporte con signo de un movimiento. Defensivo: un tipo desconocido, un movimiento
 * anulado o un monto no numérico aportan 0 (nunca rompen ni ensucian el saldo).
 * @param {object} mov - data del movimiento ({ tipo, monto, anulado }).
 * @returns {number}
 */
function aporteSaldo(mov) {
    if (!mov || mov.anulado === true) return 0;
    const signo = SIGNO_POR_TIPO[mov.tipo];
    if (signo === undefined) return 0;
    const monto = typeof mov.monto === 'number' && isFinite(mov.monto) ? mov.monto : 0;
    return signo * monto;
}

/**
 * Saldo total a partir de la lista de movimientos (data plana de cada doc).
 * @param {Array<object>} movimientos
 * @returns {number} saldo redondeado a 2 decimales.
 */
function computeSaldo(movimientos) {
    if (!Array.isArray(movimientos)) return 0;
    let saldo = 0;
    for (const mov of movimientos) saldo += aporteSaldo(mov);
    return round2(saldo);
}

module.exports = { computeSaldo, aporteSaldo, SIGNO_POR_TIPO };
