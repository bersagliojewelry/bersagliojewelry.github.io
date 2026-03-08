// ============================================
// SIMULADOR DE CRÉDITO - FUNCIONES FINANCIERAS
// ALTORRA CARS - Versión 2.0
// Implementación Excel-compatible de PMT y PV
// ============================================

/**
 * PMT - Calcula el pago periódico de un préstamo (Excel-compatible)
 *
 * Convención:
 * - pv (valor presente/principal) se pasa NEGATIVO para préstamos
 * - PMT devuelve valor POSITIVO (el pago que debe hacer)
 *
 * @param {number} rate - Tasa de interés por período (ej: 0.0161 para 1.61% mensual)
 * @param {number} nper - Número total de períodos (meses)
 * @param {number} pv - Valor presente (negativo para préstamos)
 * @param {number} fv - Valor futuro (default 0, o residual en leasing)
 * @param {number} when - 0=fin de período, 1=inicio de período (default 0)
 * @returns {number} Pago por período
 */
function PMT(rate, nper, pv, fv = 0, when = 0) {
    if (rate === 0) {
        return -(pv + fv) / nper;
    }
    const pow = Math.pow(1 + rate, nper);
    return -(rate * (pv * pow + fv)) / ((1 + rate * when) * (pow - 1));
}

/**
 * PV - Calcula el valor presente de una serie de pagos (Excel-compatible)
 *
 * @param {number} rate - Tasa de interés por período
 * @param {number} nper - Número total de períodos
 * @param {number} pmt - Pago por período (negativo para pagos que se hacen)
 * @param {number} fv - Valor futuro (default 0)
 * @param {number} when - 0=fin de período, 1=inicio de período (default 0)
 * @returns {number} Valor presente
 */
function PV(rate, nper, pmt, fv = 0, when = 0) {
    if (rate === 0) {
        return -(pmt * nper) - fv;
    }
    const pow = Math.pow(1 + rate, nper);
    return -(pmt * (1 + rate * when) * (pow - 1) / rate + fv) / pow;
}

/**
 * Calcula el seguro de vida mensual
 * @param {number} valorFinanciar - Monto financiado
 * @param {number} factorSeguro - Factor de seguro por millón
 * @returns {number} Seguro mensual
 */
function calcularSeguroMensual(valorFinanciar, factorSeguro) {
    return valorFinanciar * (factorSeguro / 1000000);
}

/**
 * Formatea un número como moneda COP
 * @param {number} amount - Monto a formatear
 * @returns {string} Monto formateado (ej: "$ 1.234.567")
 */
function formatCOP(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return '—';
    }
    return '$ ' + Math.round(amount).toLocaleString('es-CO');
}

/**
 * Formatea un número como porcentaje
 * @param {number} rate - Tasa (ej: 0.0161)
 * @returns {string} Porcentaje formateado (ej: "1.61%")
 */
function formatPercent(rate) {
    if (typeof rate !== 'number' || isNaN(rate)) {
        return '—';
    }
    return (rate * 100).toFixed(2) + '%';
}

/**
 * Parsea un string de moneda a número
 * @param {string|number} str - String o número
 * @returns {number} Valor numérico
 */
function parseCurrency(str) {
    if (typeof str === 'number') return str;
    return parseInt(String(str).replace(/[^\d]/g, '')) || 0;
}

// Exportar para uso en otros módulos
const exports = {
    PMT,
    PV,
    calcularSeguroMensual,
    formatCOP,
    formatPercent,
    parseCurrency
};

if (typeof window !== 'undefined') {
    window.SimuladorFinance = exports;
}
if (typeof global !== 'undefined') {
    global.SimuladorFinance = exports;
}
