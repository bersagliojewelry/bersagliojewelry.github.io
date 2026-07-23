/**
 * F-TESORERÍA — espejo CLIENTE de la sección PURA de `functions/tesoreria-core.js` (D5,
 * invariante 2: el panel muestra EXACTAMENTE el número que computa el servidor).
 * ⚠️ NO editar esta lógica aquí: la fuente de verdad es functions/tesoreria-core.js; si cambias
 * la fórmula allá, replica acá — el test de paridad (tests/tesoreria-paridad.test.mjs, patrón
 * aging-paridad §5.8) revienta si divergen CONDUCTUALMENTE (byte-compare imposible: CJS↔ESM).
 * SSoT del diseño: docs/superpowers/specs/2026-07-18-f-tesoreria-DISENO.md (§0.5 D5 · §1).
 */

// Signo firmado por tipo de movimiento. Entradas +1, salidas −1. §1 modelo + V1 (consignacion_in /
// retiro_efectivo_out, patas bancarias de bóveda↔banco) + V20 (retira `servicio_publico` → `gasto`).
export const SIGNO_TESORERIA = Object.freeze({
    ingreso_venta: 1, abono_cartera: 1, traslado_in: 1, aporte_socia: 1, consignacion_in: 1,
    pago_proveedor: -1, gasto: -1, traslado_out: -1,
    reembolso_socia: -1, retiro_socia: -1, retiro_efectivo_out: -1,
});
// Los dos tipos SIN signo fijo lo derivan de otro campo: `ajuste_conciliacion` (direccion),
// `ajuste_inverso` (signo del ref). Van aparte del mapa a propósito.
export const TIPOS_DERIVADOS = Object.freeze(['ajuste_conciliacion', 'ajuste_inverso']);
export const TIPOS_MOV = Object.freeze([...Object.keys(SIGNO_TESORERIA), ...TIPOS_DERIVADOS]);

export const TIPOS_CUENTA = Object.freeze(['banco', 'nequi', 'caja', 'boveda']);
export const TIPOS_VIRTUALES = Object.freeze(['caja', 'boveda']);   // sin saldoInicial/ledger propio (D1)

export const ESTADOS_MOV = Object.freeze(['activo', 'pendiente_aprobacion', 'rechazado']);
export const TIPOS_PENDIENTES = Object.freeze(['retiro_socia', 'reembolso_socia', 'ajuste_inverso', 'ajuste_conciliacion']);
export const CATEGORIAS_GASTO = Object.freeze(['gmf', 'comision_bancaria', 'comision_pasarela', 'arriendo',
    'nomina', 'servicios_publicos', 'papeleria', 'otros']);
export const DIRECCIONES = Object.freeze(['entrada', 'salida']);   // solo `ajuste_conciliacion` (V3)

// §3-bis · Etiquetas humanas VINCULANTES (V14, es-CO cero jerga). El modal de registrar muestra
// SOLO los tipos manuales; los de sistema (traslado_*, abono_cartera, consignacion/retiro,
// ajuste_*) solo se LEEN en la tabla con estas etiquetas.
export const ETIQUETAS_TIPO = Object.freeze({
    ingreso_venta: 'Entró plata de una venta',
    abono_cartera: 'Abono de clienta',
    pago_proveedor: 'Pago a proveedor (mercancía/taller)',
    gasto: 'Gasto',
    traslado_out: 'Pasó a otra cuenta',
    traslado_in: 'Llegó de otra cuenta',
    aporte_socia: 'Aporte de socia',
    reembolso_socia: 'Devolución a socia (pide aprobación)',
    retiro_socia: 'Retiro de socia (pide aprobación)',
    ajuste_inverso: 'Corrección (reversa un movimiento)',
    ajuste_conciliacion: 'Ajuste del cuadre (pide aprobación)',
    consignacion_in: 'Consignación desde la bóveda',
    retiro_efectivo_out: 'Retiro para efectivo',
});

// Error de dominio (espejo). El panel lo atrapa para mostrar el mensaje humano.
export class TesoreriaError extends Error {
    constructor(code, message) { super(message); this.name = 'TesoreriaError'; this.code = code; }
}

// Entero-COP seguro (T-3: pesos SIN centavos). Desenvuelve {monto:int} o acepta int desnudo.
export function entero(v) {
    const n = (v !== null && typeof v === 'object') ? v.monto : v;
    const i = Math.trunc(Number(n));
    return Number.isFinite(i) ? i : 0;
}

// Signo firmado de UN movimiento (autoridad del recompute). `byId` (mapa opId→mov) resuelve el
// `refDocumento` del `ajuste_inverso`. Fail-red ante datos malformados (invariante #7).
export function signoDeMovimiento(mov, byId, _depth = 0) {
    const tipo = mov && mov.tipo;
    if (tipo === 'ajuste_conciliacion') {
        if (mov.direccion === 'entrada') return 1;
        if (mov.direccion === 'salida') return -1;
        throw new TesoreriaError('invalid-argument',
            `ajuste_conciliacion exige direccion entrada|salida (mov ${mov.id}).`);
    }
    if (tipo === 'ajuste_inverso') {
        if (_depth > 0) throw new TesoreriaError('failed-precondition', 'No se puede reversar un ajuste_inverso.');
        const ref = byId ? byId[mov.refDocumento] : undefined;
        if (!ref) throw new TesoreriaError('failed-precondition',
            `ajuste_inverso con refDocumento irresoluble: ${mov.refDocumento}.`);
        return -signoDeMovimiento(ref, byId, _depth + 1);
    }
    const s = SIGNO_TESORERIA[tipo];
    if (s === undefined) throw new TesoreriaError('invalid-argument', `tipo de movimiento sin signo definido: ${tipo}.`);
    return s;
}

/**
 * Saldo de una cuenta REAL por RECOMPUTE (D5) — ESPEJO EXACTO del servidor. PURA e idempotente.
 * Solo cuentan los movimientos FIRMES ('activo'); el resultado PUEDE ser negativo (V6 lo grita).
 */
export function computeSaldoCuenta(saldoInicial, movs) {
    const base = entero(saldoInicial);
    const lista = Array.isArray(movs) ? movs : [];
    const byId = {};
    for (const m of lista) { if (m && m.id != null) byId[m.id] = m; }
    let suma = 0;
    for (const m of lista) {
        if (!m) continue;
        if ((m.estado || 'activo') !== 'activo') continue;   // plata firme: pendiente/rechazado NO cuentan (D4)
        suma += signoDeMovimiento(m, byId) * entero(m.monto);
    }
    return base + suma;
}
