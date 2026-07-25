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

// 'anulado' (D9): lo sella la CF del abono al anularlo — append-only, y el recompute solo suma
// 'activo', así que deja de contar sin borrar nada. Distinto de 'rechazado' (lo negó el dueño).
export const ESTADOS_MOV = Object.freeze(['activo', 'pendiente_aprobacion', 'rechazado', 'anulado']);
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

// ─── Agregaciones de VISTA (B4) ────────────────────────────────────────────────
// NO tienen espejo en el servidor a propósito: son sumas de tablero, no el recompute D5 (ese sí
// vive en la CF y se espeja arriba). PURAS. El test que las cubre es de unidad, no de paridad.

/**
 * Σ `saldoActual` de las cuentas REALES ACTIVAS (excluye las virtuales caja/bóveda —que no tienen
 * saldo propio, D1— y las inactivas). Lo comparten la página "Cuentas y bancos" (su "Total en
 * cuentas y bancos") y el "Plata total" de Hoy (inv.2: la parte de cuentas es UN solo número). El
 * resultado PUEDE ser negativo (una cuenta en rojo) — sin clamp (V6).
 */
export function sumaSaldosReales(cuentas) {
    const lista = Array.isArray(cuentas) ? cuentas : [];
    let s = 0;
    for (const c of lista) {
        if (!c) continue;
        if (TIPOS_VIRTUALES.includes(c.tipo)) continue;   // caja/bóveda: sin saldo propio (D1)
        if (c.activa === false) continue;                 // inactivas no suman
        s += entero(c.saldoActual);
    }
    return s;
}

/**
 * V9 · Cuánto "pasó por" una cuenta en un año = Σ |monto| de sus movimientos FIRMES ('activo') de
 * ese año. Es un HEADS-UP tributario para cuentas de socia (exógena/594-3, SARLAFT) — NO una cifra
 * fiscal oficial. PURA. `anio` = número o 'YYYY'. Pendientes/rechazados no movieron plata → no
 * cuentan. Quien la llama debe pasar los movimientos del año COMPLETO; si la lista viene truncada
 * (tope del listener), la vista lo señala ("o más") en vez de mentir con un exacto.
 */
export function throughputAnio(movs, anio) {
    const lista = Array.isArray(movs) ? movs : [];
    const y = String(anio);
    let s = 0;
    for (const m of lista) {
        if (!m) continue;
        if ((m.estado || 'activo') !== 'activo') continue;
        if (!String(m.fecha || '').startsWith(y)) continue;
        s += Math.abs(entero(m.monto));
    }
    return s;
}
