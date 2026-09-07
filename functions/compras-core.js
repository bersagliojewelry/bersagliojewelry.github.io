/**
 * F-COMPRAS "Proveedores" (C0) — núcleo PURO: fórmula de saldo POR DOCUMENTO (A1),
 * constantes del modelo y las reglas de negocio decididas por el comité (§2 R1-R5).
 * SSoT del diseño: docs/superpowers/specs/2026-07-27-f-compras-DISENO.md. [OPUS-5] interinato #4.
 *
 * PURO POR DISEÑO (invariante 2 «mismo número en todas las vistas», auditoria-financiera):
 * NO importa firebase-admin ni nada de servidor → se espeja en el cliente
 * (js/admin/compras-format.js, C2) para el test de paridad. Patrón tesoreria-core.js.
 *
 * Invariantes de dinero fijados aquí:
 *  #1 CONSERVACIÓN — el signo lo da el TIPO (SIGNO_DOCUMENTO / SIGNO_MOVIMIENTO), jamás un campo
 *     guardado (un signo almacenado se corrompe; uno derivado no).
 *  #7 ANOMALÍA QUE GRITA — un tipo sin signo LANZA (fail-red); el saldo a favor sale NEGATIVO y se
 *     muestra, nunca se clampa con `Math.max(0, …)`.
 *  A2 — un pago apunta a UN documento; el cruce de anticipo es un PAR ATÓMICO (patrón del traslado
 *     entre cuentas, tesoreria-core.js §CF3): dos asientos con el mismo `cruceId`, uno en cada
 *     documento, escritos en la MISMA tx. Así el saldo de un documento nunca depende de leer otro.
 */

// ─── Documentos (A1: el ledger es por documento, con su propio vencimiento) ──────────────────────
// La DEUDA es positiva. `anticipo` y `nota_credito` nacen en contra: son plata a favor del negocio.
const SIGNO_DOCUMENTO = Object.freeze({
    factura: 1,          // le debo al proveedor
    anticipo: -1,        // le pagué por adelantado ⇒ saldo a MI favor (A3)
    nota_credito: -1,    // devolución / descuento posterior
});
const TIPOS_DOCUMENTO = Object.freeze(Object.keys(SIGNO_DOCUMENTO));

// ─── Movimientos aplicados a UN documento ───────────────────────────────────────────────────────
// `cruce_aplicado` vive en la FACTURA (baja lo que debo) y `cruce_consumido` en el ANTICIPO (gasta
// el saldo a favor, llevándolo hacia 0). Los dos nacen juntos con el mismo `cruceId` (A3).
const SIGNO_MOVIMIENTO = Object.freeze({
    pago: -1,
    cruce_aplicado: -1,
    cruce_consumido: 1,
});
const TIPOS_MOVIMIENTO = Object.freeze(Object.keys(SIGNO_MOVIMIENTO));

// 'anulado' = sellado, jamás borrado (A5 + invariante 5: significa lo mismo que en cartera y
// tesorería). El recompute solo suma 'activo', así que un sellado deja de contar SOLO.
const ESTADOS = Object.freeze(['activo', 'anulado']);

// R1 · De dónde sale la plata. `banco` → pata en movimientosTesoreria (cuentaId obligatorio).
// `efectivo` → pata en el libro de la BÓVEDA (NO lleva cuentaId: la bóveda no es una cuenta de
// tesorería — `construirPataSistema` rechaza las virtuales a propósito).
const ORIGENES_PAGO = Object.freeze(['banco', 'efectivo']);

// Régimen del proveedor: se CAPTURA para el exporte del contador; aquí NO se liquida nada
// (anti-scope §0: las retenciones las calcula el contador).
const REGIMENES = Object.freeze(['no_responsable_iva', 'responsable_iva', 'gran_contribuyente', 'simple', 'desconocido']);

// Ventana de "se vence pronto" para la señal de Hoy (R5). Días naturales.
const DIAS_VENCE_PRONTO = 7;

class ComprasError extends Error {
    constructor(code, message) { super(message); this.name = 'ComprasError'; this.code = code; }
}

// Entero-COP seguro (T-3: pesos SIN centavos). Desenvuelve {monto:int} o acepta int desnudo.
function entero(v) {
    const n = (v !== null && typeof v === 'object') ? v.monto : v;
    const i = Math.trunc(Number(n));
    return Number.isFinite(i) ? i : 0;
}

// Guard duro para montos de entrada (a diferencia de `entero`, que coacciona): patrón caja-core.
function guardMonto(monto, que = 'El monto') {
    const n = (monto !== null && typeof monto === 'object') ? monto.monto : monto;
    if (!Number.isSafeInteger(n) || n <= 0) {
        throw new ComprasError('invalid-argument', `${que} debe ser un número entero de pesos mayor a 0.`);
    }
    return n;
}

function signoDocumento(tipo) {
    const s = SIGNO_DOCUMENTO[tipo];
    if (s === undefined) throw new ComprasError('invalid-argument', `tipo de documento sin signo definido: ${tipo}.`);
    return s;
}

function signoMovimiento(tipo) {
    const s = SIGNO_MOVIMIENTO[tipo];
    if (s === undefined) throw new ComprasError('invalid-argument', `tipo de movimiento sin signo definido: ${tipo}.`);
    return s;
}

/**
 * Saldo de UN documento por RECOMPUTE (autoridad server-side, patrón D5 de tesorería). PURA.
 * Solo cuentan los movimientos 'activo'. El resultado PUEDE ser negativo (le pagué de más ⇒
 * invariante 7: se GRITA en rojo, jamás se clampa aquí).
 * Un documento 'anulado' vale 0: sellado, sigue en el ledger, deja de pesar.
 * @param {{tipo:string, valor:any, estado?:string}} doc
 * @param {Array<{tipo:string, monto:any, estado?:string}>} movs  movimientos DE ESE documento
 * @returns {number} saldo en COP (positivo = le debo; negativo = a mi favor)
 */
function computeSaldoDocumento(doc, movs) {
    if (!doc) throw new ComprasError('invalid-argument', 'El documento es obligatorio para calcular su saldo.');
    if ((doc.estado || 'activo') === 'anulado') return 0;
    let saldo = signoDocumento(doc.tipo) * entero(doc.valor);
    for (const m of (Array.isArray(movs) ? movs : [])) {
        if (!m) continue;
        if ((m.estado || 'activo') !== 'activo') continue;
        saldo += signoMovimiento(m.tipo) * entero(m.monto);
    }
    return saldo;
}

/**
 * Saldo TOTAL del proveedor = Σ de los saldos de sus documentos vivos. PURA.
 * Positivo = le debo. Negativo = tengo saldo a favor (le pagué de más / anticipo sin cruzar).
 * @param {Array<{doc:object, movs:Array}>} documentos  cada uno con sus movimientos
 */
function computeSaldoProveedor(documentos) {
    let total = 0;
    for (const d of (Array.isArray(documentos) ? documentos : [])) {
        if (!d || !d.doc) continue;
        total += computeSaldoDocumento(d.doc, d.movs);
    }
    return total;
}

/**
 * Estado de vencimiento de un documento (para la señal de Hoy, R5, y el rojo de la ficha).
 * `hoy` y `venceEl` en 'YYYY-MM-DD' (comparación lexicográfica: correcta con ese formato).
 * Un documento SIN vencimiento es legítimo (D0: la UI no puede exigir uno) ⇒ 'sin_plazo'.
 * Un documento ya saldado no vence: se pagó (por eso pide el saldo, no solo la fecha).
 */
function estadoVencimiento(doc, hoy, saldo) {
    if (!doc) throw new ComprasError('invalid-argument', 'El documento es obligatorio.');
    if ((doc.estado || 'activo') === 'anulado') return 'anulado';
    if (entero(saldo) <= 0) return 'saldado';
    const vence = String(doc.venceEl || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(vence)) return 'sin_plazo';
    const dia = String(hoy || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) {
        throw new ComprasError('invalid-argument', "La fecha de hoy debe ser 'YYYY-MM-DD'.");
    }
    if (vence < dia) return 'vencido';
    if (diasEntre(dia, vence) <= DIAS_VENCE_PRONTO) return 'vence_pronto';
    return 'al_dia';
}

// Días naturales entre dos 'YYYY-MM-DD' (b − a). UTC a propósito: sin horas, sin DST, sin sorpresas.
function diasEntre(a, b) {
    const ms = Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`);
    return Math.round(ms / 86400000);
}

/**
 * R2a · Llave determinista para la unicidad "una factura por proveedor" (Firestore NO tiene unique
 * constraint ⇒ se emula con un doc-llave escrito en la MISMA tx; un query "a ver si existe" es una
 * carrera). Devuelve null cuando NO hay número: sin número no hay llave, y eso es LEGÍTIMO (R3,
 * el taller que no factura). Normaliza para que "A-001", "a 001" y "a001" choquen entre sí.
 */
function llaveFactura(nit, numero) {
    const num = String(numero == null ? '' : numero).trim();
    if (!num) return null;
    const norm = (s) => String(s == null ? '' : s).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const n = norm(num);
    if (!n) return null;                       // un número que era solo puntuación no es un número
    const doc = norm(nit) || 'SIN-NIT';
    return `${doc}__${n}`;
}

/**
 * R2b · Detector de PAGO GEMELO: mismo documento + mismo monto + misma fecha.
 * Devuelve true para que la UI PREGUNTE — nunca para bloquear: pagar dos cuotas iguales el mismo
 * día es legítimo; pagar dos veces la misma es el error #1 de cuentas por pagar. El sistema
 * pregunta, no decide.
 */
function esPagoGemelo(pagosExistentes, nuevo) {
    if (!nuevo) return false;
    const monto = entero(nuevo.monto);
    const fecha = String(nuevo.fecha || '').trim();
    return (Array.isArray(pagosExistentes) ? pagosExistentes : []).some((p) => p
        && (p.estado || 'activo') === 'activo'
        && p.tipo === 'pago'
        && entero(p.monto) === monto
        && String(p.fecha || '').trim() === fecha);
}

/**
 * R4 · ¿El pago excede lo que se debe? NO bloquea (D0 permite el saldo a favor), pero la UI debe
 * confirmarlo y pintar el excedente en rojo. Devuelve cuánto sobra (0 si no sobra).
 */
function excedenteDePago(saldoDocumento, monto) {
    const sobra = entero(monto) - entero(saldoDocumento);
    return sobra > 0 ? sobra : 0;
}

/**
 * Validación PURA del documento a registrar (la CF la llama antes de abrir la tx).
 * D0 manda: NO exige vencimiento (una compra de contado no tiene), NO exige número (R3).
 * Lo que SÍ exige: tipo válido, valor > 0 y fecha bien formada — sin eso el ledger miente.
 */
function validarDocumento(input = {}) {
    const tipo = input.tipo;
    if (!TIPOS_DOCUMENTO.includes(tipo)) {
        throw new ComprasError('invalid-argument', `Tipo de documento inválido (${TIPOS_DOCUMENTO.join(', ')}).`);
    }
    const valor = guardMonto(input.valor, 'El valor de la compra');
    const fecha = String(input.fecha || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw new ComprasError('invalid-argument', "La fecha debe ser 'YYYY-MM-DD'.");
    const vence = String(input.venceEl || '').trim();
    if (vence) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(vence)) throw new ComprasError('invalid-argument', "El vencimiento debe ser 'YYYY-MM-DD'.");
        if (vence < fecha) throw new ComprasError('invalid-argument', 'El vencimiento no puede ser anterior a la fecha de la compra.');
    }
    // R3 · sin factura es LEGÍTIMO: se marca para el contador, jamás se bloquea.
    const sinFactura = input.sinFactura === true || !String(input.numero || '').trim();
    return {
        tipo, valor, fecha,
        venceEl: vence || null,
        numero: String(input.numero || '').trim() || null,
        sinFactura,
    };
}

/**
 * Validación PURA del pago. A4/771-5: el ORIGEN es OBLIGATORIO (a diferencia del abono de cartera,
 * donde "todavía no sé de dónde entró" sí se acepta — aquí la deducibilidad depende de saberlo).
 * R1: banco ⇒ cuentaId; efectivo ⇒ SIN cuentaId (su pata va al libro de la bóveda, no a tesorería).
 */
function validarPago(input = {}) {
    const monto = guardMonto(input.monto, 'El pago');
    const fecha = String(input.fecha || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw new ComprasError('invalid-argument', "La fecha debe ser 'YYYY-MM-DD'.");
    const origen = input.origen;
    if (!ORIGENES_PAGO.includes(origen)) {
        throw new ComprasError('invalid-argument', 'Falta de dónde salió la plata: del banco o en efectivo.');
    }
    const cuentaId = String(input.cuentaId || '').trim();
    if (origen === 'banco' && !cuentaId) {
        throw new ComprasError('invalid-argument', 'Elige de qué cuenta salió el pago.');
    }
    if (origen === 'efectivo' && cuentaId) {
        // R1: el efectivo NO vive en tesorería. Aceptar una cuenta aquí abriría el doble conteo
        // contra el saldo de la bóveda (el P0 de §194).
        throw new ComprasError('invalid-argument', 'El pago en efectivo sale de la bóveda: no lleva cuenta bancaria.');
    }
    const documentoId = String(input.documentoId || '').trim();
    if (!documentoId) throw new ComprasError('invalid-argument', 'El pago debe apuntar a una compra (A2).');
    return { monto, fecha, origen, cuentaId: origen === 'banco' ? cuentaId : null, documentoId };
}

module.exports = {
    SIGNO_DOCUMENTO, TIPOS_DOCUMENTO, SIGNO_MOVIMIENTO, TIPOS_MOVIMIENTO,
    ESTADOS, ORIGENES_PAGO, REGIMENES, DIAS_VENCE_PRONTO,
    ComprasError, entero, guardMonto,
    signoDocumento, signoMovimiento,
    computeSaldoDocumento, computeSaldoProveedor,
    estadoVencimiento, diasEntre,
    llaveFactura, esPagoGemelo, excedenteDePago,
    validarDocumento, validarPago,
};
