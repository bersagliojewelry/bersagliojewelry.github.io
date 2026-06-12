/**
 * Bersaglio CRM — Lógica PURA de corrección y enrutamiento del gate (Fase M · M2a).
 *
 * Este módulo NO toca Firestore: es el CONTRATO de decisión que comparten la UI de
 * Kary (M2a) y las reglas restrictivas (M3, ADR §69). Codifica UNA sola vez "¿esta
 * operación la puede hacer Kary (admin) sola, o necesita la aprobación de Daniel
 * (owner) vía solicitud?". M2a enruta como SI el candado ya existiera (expand-contract,
 * tren acoplado): cuando M3 despliegue las reglas, la UI ya se comporta igual.
 *
 * Fuente de verdad de los límites: `config/cartera` (owner-only, M0 §70). Si el doc
 * está ausente/corrupto, este módulo FALLA CERRADO (→ requiere aprobación del owner),
 * espejo de la regla "config ausente → ajuste admin FALLA, owner intacto" (plan §69).
 *
 * PURO y testeable sin emulador → `tests/crm-correccion.test.mjs`.
 */

// Motivos de ajuste (espejo de config/cartera.motivosAjuste, M0 §70). Los NEUTROS
// (los 3 primeros) son los únicos que un admin puede auto-aprobar en un ajuste
// negativo bajo el tope; el resto exige a Daniel.
export const MOTIVOS_NEUTROS_DEFAULT = ['ERROR_REGISTRO', 'ABONO_NO_REGISTRADO', 'RECLASIFICACION'];

// Mapeo "pregunta de mostrador" → motivo (plan §69 M2a): Kary no elige un código,
// responde una pregunta en su idioma y el sistema deriva el motivo. El orden es el
// de presentación. `siempreSolicitud` se marca para los no-neutros como pista de UI
// (el gate real lo decide ajusteRequiereAprobacion; esto es solo para el copy).
export const PREGUNTAS_CORRECCION = [
    { pregunta: 'Te equivocaste al digitar el monto',          motivo: 'ERROR_REGISTRO' },
    { pregunta: 'La fecha del registro está mal',              motivo: 'CORRECCION_FECHA' },
    { pregunta: 'La clienta pagó y no se anotó',               motivo: 'ABONO_NO_REGISTRADO' },
    { pregunta: 'La clienta devolvió la pieza',                motivo: 'DEVOLUCION_PIEZA' },
    { pregunta: 'Daniel te autorizó un descuento',             motivo: 'DESCUENTO_AUTORIZADO' },
    { pregunta: 'Otra cosa (la revisa Daniel)',                motivo: 'OTRO' },
];

function topeValido(cfg) {
    // El tope debe ser un entero ≥ 0 para confiar en él; cualquier otra cosa = doc
    // ausente/corrupto → tratamos como "sin carril auto-aprobable" (falla cerrado).
    const t = cfg && cfg.autoAprobacionMax;
    return Number.isInteger(t) && t >= 0 ? t : null;
}

function neutros(cfg) {
    const m = cfg && cfg.motivosNeutros;
    return Array.isArray(m) && m.length ? m : MOTIVOS_NEUTROS_DEFAULT;
}

/**
 * ¿Un AJUSTE (corrección de saldo directa) necesita la aprobación de Daniel?
 * Espejo del gate de CREATE de ajuste en M3 (plan §69):
 *   · ajuste POSITIVO  → admin (sin tope).
 *   · ajuste NEGATIVO  → admin SOLO si motivo ∈ neutros Y |monto| ≤ tope; si no → owner.
 *   · monto 0 / no finito / tope inválido → falla cerrado (owner).
 * @param {number} monto  delta del ajuste (negativo = reduce saldo).
 * @param {string} motivo código de motivosAjuste.
 * @param {object} cfg    config/cartera ({ autoAprobacionMax, motivosNeutros }).
 * @returns {boolean} true = necesita solicitud al owner; false = admin lo aplica ya.
 */
export function ajusteRequiereAprobacion(monto, motivo, cfg) {
    if (!Number.isFinite(monto) || monto === 0) return true;   // no-op / basura → cerrado
    if (monto > 0) return false;                               // ajuste positivo: sin tope
    // monto < 0 (reduce saldo / saldo a favor): el carril sensible.
    const tope = topeValido(cfg);
    if (tope === null) return true;                            // sin límites confiables → owner
    const esNeutro = neutros(cfg).includes(motivo);
    return !(esNeutro && Math.abs(monto) <= tope);
}

/**
 * ¿ANULAR un movimiento existente necesita la aprobación de Daniel?
 * Tabla de predicados de M3 (plan §69, hallazgo E1 — lee resource.tipo y resource.monto):
 *   · monto ≤ 0 (negativo o cero, cualquier tipo) → owner (anularlo revierte una reducción ya aprobada).
 *   · tipo == 'abono' (monto > 0)                  → owner (anular un abono "desaparece" un pago).
 *   · tipo ∈ {factura, apertura, ajuste}, 0 < monto ≤ tope → admin.
 *   · tipo ∈ {factura, apertura, ajuste}, monto > tope     → owner.
 * Corregir un movimiento = anular el original + crear el reemplazo; el gate del PAR
 * es este (la anulación es la pata destructiva).
 * @param {object} mov  { tipo, monto } del movimiento a anular.
 * @param {object} cfg  config/cartera.
 * @returns {boolean} true = necesita solicitud al owner; false = admin lo hace ya.
 */
export function anulacionRequiereAprobacion(mov, cfg) {
    const monto = mov && Number(mov.monto);
    if (!Number.isFinite(monto) || monto <= 0) return true;    // negativo/cero/basura → owner
    if (mov.tipo === 'abono') return true;                     // anular un pago → owner
    const tope = topeValido(cfg);
    if (tope === null) return true;                            // sin límites confiables → owner
    return monto > tope;                                       // > tope → owner; ≤ tope → admin
}

/**
 * Resumen para el ANUNCIO en pesos antes de enviar una corrección de saldo (plan §69:
 * "Se registrará un ajuste de −$X. [dentro de tu límite / se enviará a Daniel]").
 * @returns {{delta:number, requiereAprobacion:boolean, noOp:boolean}}
 */
export function planearCorreccionSaldo(saldoActual, saldoNuevo, motivo, cfg) {
    const actual = Number.isFinite(saldoActual) ? saldoActual : 0;
    const nuevo = Number(saldoNuevo);
    const delta = Number.isFinite(nuevo) ? Math.round(nuevo - actual) : NaN;
    if (!Number.isFinite(delta) || delta === 0) {
        return { delta: 0, requiereAprobacion: false, noOp: true };
    }
    return { delta, requiereAprobacion: ajusteRequiereAprobacion(delta, motivo, cfg), noOp: false };
}

// ─── Corrección de un MOVIMIENTO (par anular+crear) — contrato verificado (ADR §74) ──
// Efecto de un asiento sobre el saldo: factura/apertura/ajuste SUMAN; abono RESTA
// (espejo de movimientoValido en firestore.rules). FUENTE ÚNICA del signo — la usan el
// productor del delta (M2a) y el re-validador (M2b), para que no diverjan dos copias.
const SIGNO_SALDO = { factura: 1, apertura: 1, ajuste: 1, abono: -1 };
export function efectoSaldo(tipo, monto) {
    const s = SIGNO_SALDO[tipo] || 0;
    return s * (Number.isFinite(monto) ? monto : 0);
}

/**
 * Planea la corrección de UN movimiento (anular el original + crear el reemplazo, MISMO
 * tipo). El gate es la ANULACIÓN del original (la pata destructiva). Arma el contrato
 * verificado de la solicitud cuando necesita a Daniel: `monto` = DELTA NETO firmado al
 * saldo; `datosCorreccion` = { reemplazo, snapshotOriginal (evidencia, no autoridad),
 * motivoCategoria }. M2b RE-LEE el original y re-valida; NUNCA confía en datosCorreccion.
 * @param {object} original  movimiento a corregir { id, tipo, monto, fecha?, descripcion? }
 * @param {object} cambio     { montoNuevo:int, fechaNueva?, descripcionNueva?, motivoCategoria }
 * @param {object} cfg        config/cartera
 * @returns {{delta:number, requiereAprobacion:boolean, noOp:boolean, reemplazo:object, datosCorreccion:object}}
 */
export function planearCorreccionMovimiento(original, cambio, cfg) {
    const tipo = original.tipo;
    const montoOriginal = Math.round(Number(original.monto));
    const montoNuevo = Math.round(Number(cambio.montoNuevo));
    const fechaNueva = /^\d{4}-\d{2}-\d{2}$/.test(cambio.fechaNueva || '') ? cambio.fechaNueva : original.fecha;
    const delta = efectoSaldo(tipo, montoNuevo) - efectoSaldo(tipo, montoOriginal);
    const cambiaFecha = (cambio.fechaNueva || '') && cambio.fechaNueva !== original.fecha;
    // no-op: ni el monto ni la fecha cambian (nada que corregir).
    const noOp = montoNuevo === montoOriginal && !cambiaFecha;

    const reemplazo = {
        tipo,
        monto: montoNuevo,
        ...(fechaNueva ? { fecha: fechaNueva } : {}),
        ...(cambio.descripcionNueva ? { descripcion: String(cambio.descripcionNueva).trim() } : {}),
        // El reemplazo de un ABONO hereda el medio de pago (la regla M3 lo exige en
        // todo abono nuevo); fallback 'otro' para abonos sin el campo (red-team M3).
        ...(tipo === 'abono' ? { medioPago: original.medioPago || 'otro' } : {}),
    };
    const snapshotOriginal = {
        tipo,
        monto: montoOriginal,
        ...(original.fecha ? { fecha: original.fecha } : {}),
        ...(original.descripcion ? { descripcion: original.descripcion } : {}),
        ...(original.medioPago ? { medioPago: original.medioPago } : {}),
        anulado: false,
    };
    return {
        delta,
        requiereAprobacion: anulacionRequiereAprobacion(original, cfg),
        noOp,
        reemplazo,
        datosCorreccion: { reemplazo, snapshotOriginal, motivoCategoria: cambio.motivoCategoria },
    };
}
