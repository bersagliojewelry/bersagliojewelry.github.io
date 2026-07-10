/**
 * caja-format.js — helper PURO de la SESIÓN DE CAJA + BÓVEDA (F2.0 B5b-1 · TODO-68).
 *
 * Mapea los valores CANÓNICOS del backend (functions/caja-core.js: conceptos de movimiento,
 * tipos de traslado de bóveda, estados de aprobación) a etiquetas en español, y expone la
 * ECUACIÓN DEL CAJÓN como función pura (espejo del cierre server-side §8.1.7). Sin DOM ni
 * Firestore → testeable en Node (mismo patrón que pedidos-format.js / saldo-format.js).
 *
 * ⚠️ AUTORIDAD DEL DINERO: la única verdad del efectivo del turno la calcula el servidor al
 * cerrar (cerrarTurnoCore, recompute en tx). `efectivoEnCajon()` es una ESTIMACIÓN operativa
 * para la UI (mueve la barra de límite y dispara el modal de traslado); NUNCA una precondición.
 */

// Entero COP seguro (sin centavos, sin negativos accidentales por coacción). Hasta 2^53, no |0.
const n = (v) => Math.round(Number(v) || 0);

// ─── Conceptos de movimiento de caja (§8.5 · lista cerrada, espeja CONCEPTOS_CAJA del core) ───
export const CONCEPTOS_CAJA = ['pago_domiciliario', 'compra_empaques', 'adelanto_vendedora', 'gasto_menor', 'retiro_socio', 'reembolso_cliente', 'otro'];
export const CONCEPTO_LABEL = {
    pago_domiciliario: 'Pago a domiciliario',
    compra_empaques:   'Compra de empaques',
    adelanto_vendedora:'Adelanto a vendedora',
    gasto_menor:       'Gasto menor',
    retiro_socio:      'Retiro de socio',
    reembolso_cliente: 'Reembolso a cliente (venta de un turno anterior)',
    otro:              'Otro (con nota)',
};
export const conceptoLabel = (c) => CONCEPTO_LABEL[c] || c || '—';

// ─── Tipos de movimiento del ledger de bóveda (espeja SIGNO_BOVEDA + tipos destructivos) ──────
export const TIPO_BOVEDA_LABEL = {
    saldo_inicial:   'Saldo inicial',
    cajon_a_boveda:  'Cajón → Bóveda',
    boveda_a_cajon:  'Bóveda → Cajón (reponer cambio)',
    boveda_a_banco:  'Bóveda → Banco (consignación)',
    reverso:         'Reversa',
    ajuste_faltante: 'Ajuste · faltante',
    ajuste_sobrante: 'Ajuste · sobrante',
};
export const tipoBovedaLabel = (t) => TIPO_BOVEDA_LABEL[t] || t || '—';

// Tipos que la CAJERA registra desde el POS (vaciar el cajón al superar el límite). Los demás
// (consignar al banco / reponer cambio / conteo / reverso) son OWNER-only (vista Bóveda §9.9).
export const TIPOS_TRASLADO_POS = ['cajon_a_boveda'];

// Estado de aprobación de un evento destructivo del ledger (Dual-Approval §9.1).
export const APROBACION_LABEL = {
    pendiente_aprobacion: { label: 'Pendiente de aprobación', pill: 'gold'  },
    aprobado:             { label: 'Aprobado',                pill: 'green' },
    rechazado:            { label: 'Rechazado',               pill: 'gray'  },
};
export const aprobacionInfo = (estado) => APROBACION_LABEL[estado] || null;

// Un movimiento del ledger es DESTRUCTIVO (requiere firma del owner) si nace pendiente.
export const esDestructivo = (mov) => (mov?.estado === 'pendiente_aprobacion');

/**
 * Ecuación del efectivo esperado en el cajón (§8.1.7) — ESPEJO EXACTO de cerrarTurnoCore:
 *   fondoApertura + ventas_efectivo + ingresos − egresos + boveda_a_cajon − cajon_a_boveda.
 * Puede ser < 0 (anomalía real) → sin clamp, igual que el core. Todos los términos en COP entero.
 * @param {{fondoApertura?, ventasEfectivo?, ingresos?, egresos?, cajonABoveda?, bovedaACajon?}} t
 * @returns {number} efectivo estimado en el cajón (COP)
 */
export function efectivoEnCajon(t = {}) {
    return n(t.fondoApertura) + n(t.ventasEfectivo) + n(t.ingresos) - n(t.egresos)
         + n(t.bovedaACajon) - n(t.cajonABoveda);
}

/**
 * Monto SUGERIDO a trasladar a la bóveda cuando el cajón supera el límite: deja el cajón en el
 * `fondoTrabajo`. Nunca negativo (si por debajo del fondo, sugiere 0). Redondea al múltiplo de mil
 * más cercano hacia arriba para dejar cifras "de billete" (Kary mueve fajos, no monedas sueltas).
 * @param {number} efectivoCajon @param {number} fondoTrabajo
 * @returns {number} monto sugerido (COP, múltiplo de 1000)
 */
export function trasladoSugerido(efectivoCajon, fondoTrabajo) {
    const exceso = n(efectivoCajon) - n(fondoTrabajo);
    if (exceso <= 0) return 0;
    return Math.ceil(exceso / 1000) * 1000;
}

/** ¿El cajón superó el límite y exige un traslado a bóveda? (∞/ausente = sin alarma, §8.6.2). */
export function superaLimite(efectivoCajon, limiteCajon) {
    const lim = Number(limiteCajon);
    if (!Number.isFinite(lim) || lim <= 0) return false;   // límite sin configurar → nunca bloquea
    return n(efectivoCajon) > lim;
}

export default {
    CONCEPTOS_CAJA, CONCEPTO_LABEL, conceptoLabel,
    TIPO_BOVEDA_LABEL, tipoBovedaLabel, TIPOS_TRASLADO_POS,
    APROBACION_LABEL, aprobacionInfo, esDestructivo,
    efectivoEnCajon, trasladoSugerido, superaLimite,
};
