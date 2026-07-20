/**
 * F-TESORERÍA (B0) — núcleo PURO de tesorería: fórmula de saldo por recompute (D5),
 * constantes del modelo de datos y seed ESTRUCTURAL de las 2 cuentas virtuales.
 * SSoT del diseño: docs/superpowers/specs/2026-07-18-f-tesoreria-DISENO.md
 *   (§0.5 D1-D5 · §1 modelo · §0.6 V1/V3 · §0.7 V20 · §0.8 V21). [OPUS-4.8] interinato #4.
 *
 * PURO POR DISEÑO (invariante 2 «mismo número en todas las vistas», auditoria-financiera):
 * `computeSaldoCuenta` y sus ayudantes NO importan firebase-admin ni ningún módulo de
 * servidor → pueden espejarse en el cliente (js/admin/tesoreria-format.js, B1) para el test
 * de paridad (patrón aging-paridad §5.8). La única pata que toca la BD es `seedCuentasVirtuales`,
 * y su dependencia de firebase-admin va LAZY (dentro de la función), fuera del camino puro.
 *
 * Invariantes de dinero fijados aquí:
 *  #1 CONSERVACIÓN — el signo lo da el TIPO (SIGNO_TESORERIA); `ajuste_conciliacion` por su
 *     `direccion` explícita (V3); `ajuste_inverso` = −signo(tipo del ref) (V3; no se reversa un reverso).
 *  #7 ANOMALÍA QUE GRITA — un tipo sin signo, una `direccion` inválida o un ref irresoluble
 *     LANZAN (fail-red), jamás devuelven un saldo silenciosamente malo (nada de `|| 0` que esconda).
 *  Plata FIRME: los movimientos `pendiente_aprobacion` / `rechazado` NO cuentan al saldo (D4).
 */

// Signo firmado por tipo de movimiento. Entradas +1, salidas −1. §1 modelo + V1 (consignacion_in /
// retiro_efectivo_out, patas bancarias de bóveda↔banco) + V20 (retira `servicio_publico` → `gasto`).
const SIGNO_TESORERIA = Object.freeze({
    ingreso_venta: 1, abono_cartera: 1, traslado_in: 1, aporte_socia: 1, consignacion_in: 1,
    pago_proveedor: -1, gasto: -1, traslado_out: -1,
    reembolso_socia: -1, retiro_socia: -1, retiro_efectivo_out: -1,
});
// Los dos tipos SIN signo fijo lo derivan de otro campo: `ajuste_conciliacion` (direccion),
// `ajuste_inverso` (signo del ref). Van aparte del mapa a propósito.
const TIPOS_DERIVADOS = Object.freeze(['ajuste_conciliacion', 'ajuste_inverso']);
const TIPOS_MOV = Object.freeze([...Object.keys(SIGNO_TESORERIA), ...TIPOS_DERIVADOS]);

const TIPOS_CUENTA = Object.freeze(['banco', 'nequi', 'caja', 'boveda']);
const TIPOS_VIRTUALES = Object.freeze(['caja', 'boveda']);   // sin saldoInicial/ledger propio (D1)
const TITULARES = Object.freeze(['empresa', 'kary', 'daniela', 'veronica']);

const ESTADOS_MOV = Object.freeze(['activo', 'pendiente_aprobacion', 'rechazado']);
// Nacen `pendiente_aprobacion` (D4 + V2 + V3): toda plata que sale a una socia o toca el saldo por
// ajuste pide firma del owner antes de contar.
const TIPOS_PENDIENTES = Object.freeze(['retiro_socia', 'reembolso_socia', 'ajuste_inverso', 'ajuste_conciliacion']);
// `gasto`: categoria OBLIGATORIA de lista CERRADA (V7 + V20). `pago_proveedor` = COSTO DE VENTA
// (tipo aparte, para el margen bruto de F-REPORTES) — NO lleva categoria.
const CATEGORIAS_GASTO = Object.freeze(['gmf', 'comision_bancaria', 'comision_pasarela', 'arriendo',
    'nomina', 'servicios_publicos', 'papeleria', 'otros']);
const DIRECCIONES = Object.freeze(['entrada', 'salida']);   // solo `ajuste_conciliacion` (V3)

// Error de dominio local (el núcleo es admin-free → no reusa PedidoError, que arrastra firebase-admin).
// Los wrappers onCall de B1 (tesoreria.js) mapearán `.code` a HttpsError, patrón caja/pedidos.
class TesoreriaError extends Error {
    constructor(code, message) { super(message); this.name = 'TesoreriaError'; this.code = code; }
}

// Entero-COP seguro (T-3: pesos SIN centavos). Desenvuelve {monto:int} o acepta int desnudo.
// Admin-free → espejable byte-a-byte en el cliente.
function entero(v) {
    const n = (v !== null && typeof v === 'object') ? v.monto : v;
    const i = Math.trunc(Number(n));
    return Number.isFinite(i) ? i : 0;
}

// Signo firmado de UN movimiento (autoridad del recompute). `byId` (mapa opId→mov) resuelve el
// `refDocumento` del `ajuste_inverso`. Fail-red ante datos malformados (invariante #7).
function signoDeMovimiento(mov, byId, _depth = 0) {
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
 * Saldo de una cuenta REAL por RECOMPUTE (D5, autoridad server-side). PURA e idempotente.
 * `saldoInicial` y cada `mov.monto` son {monto:int} o int. Solo cuentan los movimientos FIRMES
 * (estado 'activo'); `pendiente_aprobacion`/`rechazado` no. El resultado PUEDE ser negativo
 * (V6 lo GRITA en rojo; jamás se clampa aquí).
 * @param {{monto:number}|number} saldoInicial
 * @param {Array<{id?:string,tipo:string,monto:any,estado?:string,direccion?:string,refDocumento?:string}>} movs
 * @returns {number} saldo en COP (entero, con signo)
 */
function computeSaldoCuenta(saldoInicial, movs) {
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

/**
 * Seed ESTRUCTURAL de las 2 cuentas virtuales (§0.8 V21: es el ÚNICO seed permitido; las cuentas
 * REALES las crea Kary por la UI al recibir la plataforma). Idempotente (create-if-not-exists) →
 * seguro de re-correr en cada deploy. Corre con Admin SDK (ignora las reglas write:false).
 * Las virtuales NO llevan saldoInicial/fechaCorte/saldoActual: la vista consolidada LEE sus módulos
 * existentes (Caja = ecuación del turno · Bóveda = su saldo) — cero doble asiento (D1).
 * @param db Firestore (admin). @returns {Promise<{creadas:string[]}>}
 */
async function seedCuentasVirtuales(db) {
    const { FieldValue } = require('firebase-admin/firestore');   // LAZY: fuera del camino puro
    const VIRTUALES = [
        { id: 'caja',   nombre: 'Caja (efectivo del mostrador)', tipo: 'caja' },
        { id: 'boveda', nombre: 'Bóveda',                         tipo: 'boveda' },
    ];
    const creadas = [];
    for (const v of VIRTUALES) {
        const ref = db.doc(`cuentasTesoreria/${v.id}`);
        const snap = await ref.get();
        if (snap.exists) continue;                                // idempotente: nunca pisa datos
        await ref.set({
            nombre: v.nombre, banco: null, tipo: v.tipo, titular: 'empresa',
            esDeSocia: false, activa: true,
            creadoPor: { uid: null, nombre: 'seed B0 (F-TESORERÍA)', fuente: 'SISTEMA' },   // T-7 sello de actor
            creadoEn: FieldValue.serverTimestamp(),
        });
        creadas.push(v.id);
    }
    return { creadas };
}

module.exports = {
    SIGNO_TESORERIA, TIPOS_DERIVADOS, TIPOS_MOV, TIPOS_CUENTA, TIPOS_VIRTUALES, TITULARES,
    ESTADOS_MOV, TIPOS_PENDIENTES, CATEGORIAS_GASTO, DIRECCIONES,
    TesoreriaError, entero, signoDeMovimiento, computeSaldoCuenta, seedCuentasVirtuales,
};
