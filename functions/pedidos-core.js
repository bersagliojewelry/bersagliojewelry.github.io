/**
 * Núcleo de `crearPedido` (B1 paso 3) — lógica PURA de negocio, SIN auth ni firebase-functions
 * (solo firebase-admin) → testeable end-to-end contra el emulador. El wrapper onCall (pedidos.js)
 * hace la autenticación/rol y mapea `PedidoError` → `HttpsError`.
 *
 * Garantías (dinero/concurrencia): único escritor (Admin SDK), candado atómico = el doc de la
 * pieza (runTransaction → imposible doble venta), total RECALCULADO server-side (no se confía en
 * el cliente), snapshot INMUTABLE, correlativo atómico, e IDEMPOTENTE por pedidoId.
 */
const { FieldValue, Timestamp } = require('firebase-admin/firestore');
const crypto = require('crypto');
const { montoEnCentavos, firmaIntegridad, verificarFirmaEvento } = require('./wompi-core');

const MEDIOS  = ['efectivo', 'transferencia', 'wompi', 'addi'];
const CANALES = ['pos', 'web', 'whatsapp'];
// F2.0 B2 (§9.2): cota de docs por turno. El cierre recomputa síncrono en UNA transacción; el límite
// duro de Firestore es 500 lecturas/tx. Al acercarse (~350, margen), el POS FUERZA cerrar el turno antes
// de seguir vendiendo → cerrarTurno queda SIEMPRE O(<400). `crearPedido` devuelve `cotaProxima` al cruzarla.
const COTA_TURNO = 350;

// ── Código PÚBLICO de pedido (§166 · comité ×3) ────────────────────────────────
// El correlativo `numero` es INTERNO (contable, jamás al cliente: revela volumen). Lo que el
// cliente ve es `codigo` BJ-XXXX-XXXX: 8 símbolos crypto-aleatorios de un alfabeto de 29 SIN
// ambiguos telefónicos (0/O · 1/I/L · U · V — "be larga/ve corta"). crypto.randomInt = sin sesgo
// modular (rejection sampling nativo). Unicidad NO probabilística: `reservarCodigo` verifica el
// índice `codigosPedido/{codigo}` DENTRO de la transacción que crea el pedido (lecturas antes de
// escrituras) — dos tx concurrentes con el mismo código conflictúan y una reintenta. REGLA: toda
// creación de pedido (CF, scripts, migraciones) pasa por este patrón lookup+reserva; jamás a mano.
const CODIGO_ALFABETO = '23456789ABCDEFGHJKMNPQRSTWXYZ';   // 29 símbolos
const CODIGO_MAX_INTENTOS = 5;

/** Genera un candidato BJ-XXXX-XXXX. `randInt(max)` inyectable para tests deterministas. */
function generarCodigoPedido(randInt = (max) => crypto.randomInt(max)) {
    let s = '';
    for (let i = 0; i < 8; i++) s += CODIGO_ALFABETO[randInt(CODIGO_ALFABETO.length)];
    return `BJ-${s.slice(0, 4)}-${s.slice(4)}`;
}

/**
 * Reserva un código único DENTRO de la tx (solo LECTURAS aquí; el caller escribe `codigoRef`
 * junto con el pedido). Si 5 intentos colisionan (p ≈ n/29^8 ≈ 0) ABORTA con error logueado —
 * NUNCA degrada a escritura sin verificar (contrato del comité).
 */
async function reservarCodigo(db, tx, randInt) {
    for (let i = 0; i < CODIGO_MAX_INTENTOS; i++) {
        const codigo = generarCodigoPedido(randInt);
        const ref = db.doc(`codigosPedido/${codigo}`);
        const snap = await tx.get(ref);
        if (!snap.exists) return { codigo, codigoRef: ref };
    }
    console.error(`[pedidos] ${CODIGO_MAX_INTENTOS} colisiones seguidas de código — improbable: revisar codigosPedido`);
    throw new PedidoError('internal', 'No fue posible asignar un código de pedido único. Reintenta.');
}

// Enteros COP. Espejo de calcularPrecio (js/admin/calculadora.js): redondeo al final.
const entero = n => Math.round(Math.max(0, Number(n) || 0));
const calcOro = (valorGramo, peso) => Math.round(Math.max(0, Number(valorGramo) || 0) * Math.max(0, Number(peso) || 0));

// ── Modelo de inventario v3 (TODO-40) ─────────────────────────────────────────
// ESPEJO de js/admin/inventario-model.js `derivarEstado` (frontera ESM↔CJS; la SSoT del
// comportamiento vive allá, testeada). estado = DERIVADO de (stockType, cantidad); SSoT = cantidad.
const STOCK_TYPES = ['finito', 'finito_refabricable', 'encargo'];
const normStockType = st => STOCK_TYPES.includes(st) ? st : 'finito';   // legacy → finito
function derivarEstado(stockType, cantidad) {
    if (stockType === 'encargo') return 'disponible';
    const n = Number.isInteger(cantidad) ? cantidad : 0;
    if (n > 0) return 'disponible';
    return stockType === 'finito_refabricable' ? 'bajo_pedido' : 'agotada';
}

class PedidoError extends Error {
    constructor(code, message) { super(message); this.code = code; this.name = 'PedidoError'; }
}

// ── F1-CORE: máquina de estados post-pago (spec 2026-07-06-f1-core §2) ─────────
// TABLA de configuración, NO if-chains: F2 añade filas (p.ej. apartado), no reabre la CF.
// Los estados PRE-pago (pago_pendiente/por_verificar/a_revisar/pagado_sin_stock) NO están aquí:
// sus salidas son las CFs existentes (confirmarPago · anularPedido/VOID · webhook · reaper).
const TRANSICIONES = {
    pagado:            ['preparacion', 'entregado', 'cancelado'],   // 'entregado' directo = venta en mano (POS)
    preparacion:       ['despacho_nacional', 'entrega_local', 'listo_retiro', 'cancelado'],
    despacho_nacional: ['entregado'],
    entrega_local:     ['entregado'],
    listo_retiro:      ['entregado'],
    entregado:         ['reembolsado'],                              // retracto Ley 1480 / garantía
};

// P0 del arqueo (spec §3.4): el cierre Z suma por "el dinero ENTRÓ", no por estado literal —
// sin esto, avanzar un pedido a preparacion/entregado antes del cierre lo esfumaba del arqueo.
// Paridad con la tabla verificada por test (avanzar-pedido.test.mjs).
const ESTADOS_CON_DINERO = new Set(['pagado', 'preparacion', 'despacho_nacional', 'entrega_local', 'listo_retiro', 'entregado']);

/** Día LOCAL Bogotá (UTC-5 fijo, sin DST) — patrón L-30: la agenda del negocio, no la del server. */
const dayKeyBogota = (ms = Date.now()) => new Date(ms - 5 * 3600e3).toISOString().slice(0, 10);

// ── Candado de stock COMPARTIDO (POS + reserva web F2/TODO-42) ─────────────────
// `evaluarStock` = validación PURA de disponibilidad (sin writes → seguro llamarla temprano en la
// transacción). `aplicarConsumo` = el WRITE (decrementa `cantidad` + estado derivado + asiento de
// ledger), con opción `reserva` para la reserva web (setea `reservaId`/`reservaExpira` en el MISMO
// update atómico). Reusados por `crearPedidoCore` (venta mostrador) y por `iniciarPagoWebCore` (F2).
function evaluarStock(piece) {
    const stockType = normStockType(piece.stockType);
    const cantidadActual = (stockType === 'encargo') ? null
        : (Number.isInteger(piece.cantidad) ? piece.cantidad : 1);   // legacy ??1
    // Agotada = finito SIN stock (o legacy estado='vendida'). encargo y refabricable-en-0 = vendibles (se fabrican).
    const agotada = (piece.estado === 'vendida') || (stockType === 'finito' && cantidadActual <= 0);
    if (agotada) throw new PedidoError('failed-precondition', 'Esa pieza está agotada.');
    // ¿Consume una unidad física? finito*/cantidad>0 sí; encargo y refabricable-en-0 no (se fabrica).
    const consumeUnidad = (stockType !== 'encargo') && (cantidadActual > 0);
    return { stockType, cantidadActual, consumeUnidad };
}

function aplicarConsumo(tx, pieceRef, { pedidoId, autor, motivo = 'venta', movId, stockType, cantidadActual, reserva = null }) {
    const nuevaCantidad = cantidadActual - 1;
    const update = {
        // A.7: cantidad ABSOLUTA (ya leída en la tx = aislada). `increment(-1)` sobre una pieza legacy
        // SIN campo `cantidad` la dejaba en -1 (mientras el estado se derivaba de 0) → al liberar/anular
        // (-1+1=0) quedaba 'agotada' e invendible. El absoluto = `cantidadActual − 1` corrige el legacy.
        cantidad: nuevaCantidad,
        estado: derivarEstado(stockType, nuevaCantidad),
        updatedAt: FieldValue.serverTimestamp(),
    };
    if (reserva) { update.reservaId = reserva.reservaId; update.reservaExpira = reserva.reservaExpira; }
    tx.update(pieceRef, update);
    // Ledger append-only (C4); movId por defecto = pedidoId → idempotente con el pedido (un reintento no re-asienta).
    tx.set(pieceRef.collection('movimientos').doc(movId || pedidoId), {
        delta: -1, motivo, pedidoId, cantidadResultante: nuevaCantidad,
        actor: autor, at: FieldValue.serverTimestamp(),
    });
}

/**
 * reponerStock (C.1) — repone UNA unidad al reintegrar/liberar un pedido que consumió stock (VOID o
 * reserva expirada). Centraliza lo que estaba DUPLICADO y divergente en anularPedidoCore y
 * liberarReservaCore. Correcciones:
 *   (a) si la pieza es AHORA `encargo` (Kary cambió el tipo tras la venta), NO incrementa `cantidad`
 *       (encargo = sin inventario) → solo audita, evita el invariante roto "encargo con cantidad".
 *   (b) limpia SIEMPRE `reservaId`/`reservaExpira` cuando esta reserva era la activa (reservaId===pedidoId)
 *       → evita la "reserva fantasma" que dejaba la rama v3 de anular.
 * Cantidad ABSOLUTA (leída en la tx, coherente con A.7). Idempotencia = el gate de transición del caller.
 * @returns nuevaCantidad (o null si encargo).
 */
function reponerStock(tx, pieceRef, piece, { pedidoId, motivo, ledgerId, actor }) {
    const st = normStockType(piece.stockType);
    const esEncargo = st === 'encargo';
    const nuevaCantidad = esEncargo ? null : (Number.isInteger(piece.cantidad) ? piece.cantidad : 0) + 1;
    const update = { estado: derivarEstado(st, nuevaCantidad), updatedAt: FieldValue.serverTimestamp() };
    if (!esEncargo) update.cantidad = nuevaCantidad;
    if (piece.reservaId === pedidoId) { update.reservaId = null; update.reservaExpira = null; }
    tx.update(pieceRef, update);
    tx.set(pieceRef.collection('movimientos').doc(ledgerId), {
        delta: esEncargo ? 0 : 1, motivo, pedidoId, cantidadResultante: nuevaCantidad,
        actor, at: FieldValue.serverTimestamp(),
    });
    return nuevaCantidad;
}

/**
 * @param db Firestore (admin) — bypassa reglas (único escritor server-side).
 * @param input { pedidoId, pieceId, valorGramo?, peso?, manoObra?, medio?, canal?, autor }
 * @param opts  { randInt? } — inyección del rng del código (tests deterministas)
 */
async function crearPedidoCore(db, input = {}, opts = {}) {
    const pedidoId = String(input.pedidoId || '').trim();   // UUID del cliente (idempotencia)
    const pieceId  = String(input.pieceId  || '').trim();
    const autor    = input.autor || null;
    if (!pedidoId || !pieceId) throw new PedidoError('invalid-argument', 'pedidoId y pieceId son obligatorios.');
    const medio = MEDIOS.includes(input.medio)  ? input.medio  : 'efectivo';
    const canal = CANALES.includes(input.canal) ? input.canal : 'pos';
    const requiereEnvio = input.requiereEnvio === true;   // F1-CORE §3.3: mostrador con envío = flujo logístico

    return db.runTransaction(async (tx) => {
        const pedidoRef = db.doc(`pedidos/${pedidoId}`);
        const existing = await tx.get(pedidoRef);
        if (existing.exists) {                          // IDEMPOTENTE: reintento → mismo pedido
            const e = existing.data();
            return { pedidoId, numero: e.numero, codigo: e.codigo || null, total: e.total, yaExistia: true };
        }

        // ── F2.0 B2: enlace venta↔turno (SOLO canal POS) ──────────────────────────────────────
        // Lee el puntero `caja/estado` en la MISMA tx → atomicidad #5 con cerrarTurno: si el cierre
        // gana, esta venta reintenta, re-lee puntero=null y —con enforceTurno— falla limpio; jamás un
        // pedido apuntando a un turno YA cerrado (sin huérfano). §9.5: el turno viaja en TODOS los
        // medios POS (efectivo/transferencia/wompi/addi), no solo efectivo. Web/WhatsApp NO llevan turno.
        let turnoId = null, docsDelTurnoNuevo = null, cotaProxima = false;
        const estadoRef = db.doc('caja/estado');
        if (canal === 'pos') {
            const [estadoSnap, cfgSnap] = await Promise.all([tx.get(estadoRef), tx.get(db.doc('config/caja'))]);
            const abiertoId = estadoSnap.exists ? (estadoSnap.data().turnoAbiertoId || null) : null;
            const enforceTurno = cfgSnap.exists && cfgSnap.data().enforceTurno === true;   // default false (config ausente)
            if (!abiertoId && enforceTurno) throw new PedidoError('failed-precondition', 'Abre la caja antes de registrar una venta en el mostrador.');
            if (abiertoId) {
                turnoId = abiertoId;
                docsDelTurnoNuevo = (estadoSnap.data().docsDelTurno || 0) + 1;
                cotaProxima = docsDelTurnoNuevo >= COTA_TURNO;   // §9.2: el POS forzará cerrar el turno
            }
        }

        const pieceRef = db.doc(`pieces/${pieceId}`);
        const pieceSnap = await tx.get(pieceRef);
        if (!pieceSnap.exists) throw new PedidoError('not-found', 'La pieza no existe.');
        const piece = pieceSnap.data();
        // TODO-40 v3: candado de stock compartido (POS + reserva web). Valida disponibilidad (throw si
        // agotada) y calcula si esta venta consume una unidad física. SSoT = cantidad (helper reusable).
        const { stockType, cantidadActual, consumeUnidad } = evaluarStock(piece);

        // Total server-side: precio fijo si la pieza lo tiene; si no, por peso (peso×gramo+mano).
        // price 0 o ausente = "SIN precio en sistema" (regla del dueño): el mostrador cobra POR PESO.
        // Sin el `> 0`, una pieza en 0 caía en modo fijo → total 0 → rechazo = mostrador bloqueado.
        const precioFijo = typeof piece.price === 'number' && isFinite(piece.price) && piece.price > 0;
        const oro   = precioFijo ? 0 : calcOro(input.valorGramo, input.peso);
        const mano  = precioFijo ? 0 : entero(input.manoObra);
        const total = precioFijo ? entero(piece.price) : (oro + mano);
        if (total <= 0) throw new PedidoError('invalid-argument', 'El total debe ser mayor a 0 (revisa el precio o el peso/gramo).');

        // Correlativo atómico (dentro de ESTA transacción → sin números repetidos).
        const contRef = db.doc('contadores/pedidos');
        const contSnap = await tx.get(contRef);
        const numero = ((contSnap.exists && Number(contSnap.data().valor)) || 0) + 1;
        // Código PÚBLICO único (§166) — última LECTURA de la tx (antes de cualquier write).
        const { codigo, codigoRef } = await reservarCodigo(db, tx, opts.randInt);

        const desglose = precioFijo
            ? { tipo: 'precio_fijo', total }
            : { tipo: 'por_peso', peso: Math.max(0, Number(input.peso) || 0), valorGramo: entero(input.valorGramo), manoObra: mano, oro, total };

        // F1-CORE ruta corta (spec §3.3): mostrador en efectivo SIN envío = venta EN MANO → nace
        // `entregado` (el ciclo no queda artificialmente abierto). Con envío o pago por confirmar,
        // entra al flujo normal. El arqueo cuenta igual (ESTADOS_CON_DINERO incluye `entregado`).
        const enMano = medio === 'efectivo' && canal === 'pos' && !requiereEnvio;
        const estadoInicial = medio === 'efectivo' ? (enMano ? 'entregado' : 'pagado') : 'pago_por_verificar';
        const doc = {
            numero, codigo, pieceId,
            pieceSlug: piece.slug || pieceId,
            pieceName: piece.name || 'Pieza',
            canal, medio,
            estado: estadoInicial,
            total,
            desglose,                                   // SNAPSHOT inmutable (la CF nunca lo edita)
            consumioStock: consumeUnidad,               // v3: ¿bajó una unidad física? → anular la repone
            requiereEnvio,                              // F1-CORE: lo respeta confirmarPago (ruta corta)
            // Costuras F1-CORE (spec §3.5, contratos aditivos): F2.2 generaliza a N líneas; el costo
            // se congela cuando las piezas tengan campo de costo (F3) — hoy null, NO inventarlo.
            items: [{ pieceId, pieceName: piece.name || 'Pieza', pieceSlug: piece.slug || pieceId, cantidad: 1, precio: total, costoSnapshot: null }],
            clienteId: null,                            // vínculo CRM = F2.1 (CF-only)
            autor,
            createdAt: FieldValue.serverTimestamp(),
        };
        if (enMano) { doc.entregadoEn = FieldValue.serverTimestamp(); doc.pod = { enMano: true }; }
        if (turnoId) doc.turnoId = turnoId;                         // F2.0 B2 (§9.5): la venta POS pertenece al turno
        tx.set(pedidoRef, doc);
        if (turnoId) tx.update(estadoRef, { docsDelTurno: docsDelTurnoNuevo });   // cota §9.2 + refuerza el conflicto con cerrarTurno
        if (enMano) {
            tx.set(pedidoRef.collection('historial').doc(), {
                de: 'pagado', a: 'entregado', autor, nota: 'venta en mano',
                at: FieldValue.serverTimestamp(), dayKey: dayKeyBogota(Number.isFinite(opts.nowMs) ? opts.nowMs : Date.now()),
            });
        }
        // TODO-40 v3: decrementar `cantidad` (NO marcar 'vendida') + estado DERIVADO + ledger (venta mostrador).
        if (consumeUnidad) aplicarConsumo(tx, pieceRef, { pedidoId, autor, motivo: 'venta', stockType, cantidadActual });
        tx.set(contRef, { valor: numero });
        tx.set(codigoRef, { pedidoId, at: FieldValue.serverTimestamp() });   // reserva del código (misma tx = atómico)

        return { pedidoId, numero, codigo, total, estado: estadoInicial, turnoId, cotaProxima, yaExistia: false };
    });
}

// ── Wompi F2 (TODO-42): reserva web → pedido pago_pendiente + firma de integridad ─────────────
const TOPE_TX_COP = 2500000;            // tope Persona Natural por transacción (server-side, §11)
const RESERVA_TTL_MS = 15 * 60 * 1000;  // 15 min (MVP tarjeta; PSE/Nequi en 2b ata al expiry de Wompi)

// Whitelist de envío (el cliente público no graba datos arbitrarios). null si viene vacío.
// A.8: se persisten también `docType`/`docNumber` (cédula = DIAN/guía/factura + antifraude Wompi) y
// `countryIso2` (para reconstruir el teléfono con indicativo). Sin esto Kary recibía un pedido pagado
// sin saber la cédula ni el país del comprador.
const DOC_TYPES = ['CC', 'CE', 'PP', 'NIT'];
function sanitizeShipping(s) {
    if (!s || typeof s !== 'object') return null;
    const str = k => (typeof s[k] === 'string' ? s[k].trim().slice(0, 200) : '');
    const dt = str('docType').toUpperCase();
    const out = {
        firstName: str('firstName'), lastName: str('lastName'), email: str('email'),
        phone: str('phone'), address: str('address'), city: str('city'),
        country: str('country') || 'Colombia', zip: str('zip'),
        docType: DOC_TYPES.includes(dt) ? dt : '', docNumber: str('docNumber'),
        countryIso2: str('countryIso2').toUpperCase().slice(0, 2),
    };
    return Object.values(out).some(v => v && v !== 'Colombia') ? out : null;
}

// Tipo de entrega válido (server-side). Espeja `TIPOS_ENTREGA` de js/core/envio-config.js (frontera
// ESM↔CJS). Se persiste en el pedido para que Kary sepa si es recoger-en-tienda o envío al despachar.
const TIPOS_ENTREGA = ['nacional', 'tienda', 'internacional'];
const normTipoEntrega = t => TIPOS_ENTREGA.includes(t) ? t : null;

/**
 * iniciarPagoWebCore (Wompi F2) — el cliente PÚBLICO (sin login) inicia el cobro de UNA pieza:
 * reserva atómica (decrementa `cantidad` + ledger 'reserva-web'), crea pedido `pago_pendiente`
 * (canal:web/medio:wompi) con `reservaExpira` (la VERDAD de la reserva vive en el PEDIDO → la lee
 * el reaper; lote-safe), total RECALCULADO server-side y firma de integridad server-side.
 * Idempotente por pedidoId. Elegibilidad (spec §6): pública + precio fijo>0 + stock físico + ≤$2.5M.
 * @param opts { integritySecret, ttlMs?, nowMs? } (secreto e inyecciones para test determinista)
 */
async function iniciarPagoWebCore(db, input = {}, opts = {}) {
    const pedidoId = String(input.pedidoId || '').trim();
    const pieceId  = String(input.pieceId  || '').trim();
    if (!pedidoId || !pieceId) throw new PedidoError('invalid-argument', 'pedidoId y pieceId son obligatorios.');
    const integritySecret = opts.integritySecret;
    if (!integritySecret) throw new PedidoError('failed-precondition', 'Falta el secreto de integridad de Wompi.');
    const ttlMs = Number.isFinite(opts.ttlMs) ? opts.ttlMs : RESERVA_TTL_MS;
    const nowMs = Number.isFinite(opts.nowMs) ? opts.nowMs : Date.now();
    const shipping = sanitizeShipping(input.shipping);
    const tipoEntrega = normTipoEntrega(input.tipoEntrega);   // A.8: recoger-en-tienda vs envío (para el despacho)

    const result = await db.runTransaction(async (tx) => {
        const pedidoRef = db.doc(`pedidos/${pedidoId}`);
        const existing = await tx.get(pedidoRef);
        if (existing.exists) {                          // IDEMPOTENTE: reintento → mismo pedido
            const e = existing.data();
            // A.2 (reintento reserva): SOLO se reusa un pedido cuya reserva sigue VIVA (`pago_pendiente`).
            // Uno expirado/cancelado/pagado ya liberó su reserva → devolver una firma cobrable sobre él
            // produciría `pagado_sin_stock` (cobro real sin pieza). El cliente debe regenerar el pedidoId.
            if (e.estado !== 'pago_pendiente') {
                throw new PedidoError('failed-precondition', 'reserva-no-vigente');
            }
            // A.2b: el reintento puede traer datos CORREGIDOS del comprador (canceló en Wompi, arregló
            // dirección/cédula/entrega y volvió a pagar). Se refrescan en el pedido reusado — el total y
            // la firma nacen de la pieza y NO cambian; sin esto el despacho/factura salían con los viejos.
            const refresco = {};
            if (shipping) refresco.shipping = shipping;
            if (tipoEntrega) refresco.tipoEntrega = tipoEntrega;
            if (Object.keys(refresco).length) tx.update(pedidoRef, refresco);
            // Reusa la MISMA reserva (mismo `reservaExpira` → misma firma/expiration-time, sin re-decrementar).
            // §166: el payload PÚBLICO lleva `codigo`, NUNCA `numero` (el correlativo revela volumen
            // de ventas y este callable lo invoca el navegador del cliente — se veía en DevTools).
            return { pedidoId, codigo: e.codigo || null, total: e.total, estado: e.estado,
                     expiraMs: e.reservaExpira?.toMillis?.() ?? (nowMs + ttlMs), yaExistia: true };
        }
        const pieceRef = db.doc(`pieces/${pieceId}`);
        const pieceSnap = await tx.get(pieceRef);
        if (!pieceSnap.exists) throw new PedidoError('not-found', 'La pieza no existe.');
        const piece = pieceSnap.data();
        // Elegibilidad web. Privada = nunca en línea (se factura por mostrador/CRM, D5).
        if (piece.visibilidad === 'privada') throw new PedidoError('failed-precondition', 'Esta pieza no está disponible para compra en línea.');
        const { stockType, cantidadActual, consumeUnidad } = evaluarStock(piece);   // throw si agotada
        if (!consumeUnidad) throw new PedidoError('failed-precondition', 'Esta pieza se cotiza con un asesor (no es compra inmediata).');
        const precioFijo = typeof piece.price === 'number' && isFinite(piece.price) && piece.price > 0;
        if (!precioFijo) throw new PedidoError('failed-precondition', 'Esta pieza se cotiza con un asesor (precio bajo consulta).');
        const total = entero(piece.price);
        if (total > TOPE_TX_COP) throw new PedidoError('failed-precondition', `El pago en línea admite hasta $${TOPE_TX_COP.toLocaleString('es-CO')}. Coordina con un asesor.`);

        // Habeas Data (Ley 1581 / Decreto 1377 art.5): el consentimiento es OBLIGATORIO para crear el
        // pedido con datos del comprador y se PERSISTE como prueba (no se confía solo en el front). Se
        // exige SOLO al CREAR (el reintento idempotente ya salió arriba con su consentimiento original).
        const habeas = input.habeas;
        const habeasAceptado = habeas === true || !!(habeas && habeas.aceptado === true);
        if (!habeasAceptado) throw new PedidoError('failed-precondition', 'Falta la autorización de tratamiento de datos (Habeas Data).');
        const habeasVersion = (habeas && typeof habeas.version === 'string') ? habeas.version : null;

        const contRef = db.doc('contadores/pedidos');
        const contSnap = await tx.get(contRef);
        const numero = ((contSnap.exists && Number(contSnap.data().valor)) || 0) + 1;
        // Código PÚBLICO único (§166) — última LECTURA de la tx (antes de cualquier write).
        const { codigo, codigoRef } = await reservarCodigo(db, tx, opts.randInt);
        const reservaExpira = Timestamp.fromMillis(nowMs + ttlMs);

        tx.set(pedidoRef, {
            numero, codigo, pieceId,
            pieceSlug: piece.slug || pieceId,
            pieceName: piece.name || 'Pieza',
            canal: 'web', medio: 'wompi',
            estado: 'pago_pendiente',
            total,
            desglose: { tipo: 'precio_fijo', total },   // SNAPSHOT inmutable (el webhook valida vs este total)
            consumioStock: true,
            reservaExpira,                              // verdad de la reserva (el reaper la lee)
            shipping: shipping || null,
            tipoEntrega,                                // A.8: 'tienda'|'nacional'|'internacional'|null
            habeasData: { aceptado: true, version: habeasVersion, fecha: FieldValue.serverTimestamp() },  // prueba del consentimiento (Dto.1377 art.5)
            // Costuras F1-CORE (spec §3.5): 1 línea hoy, F2.2 generaliza; costo se congela en F3.
            items: [{ pieceId, pieceName: piece.name || 'Pieza', pieceSlug: piece.slug || pieceId, cantidad: 1, precio: total, costoSnapshot: null }],
            clienteId: null,                            // vínculo CRM = F2.1 (CF-only)
            autor: null,                               // cliente público sin login
            createdAt: FieldValue.serverTimestamp(),
        });
        // Reserva: decrementa cantidad + estado derivado + reservaId/reservaExpira (C5) + ledger.
        aplicarConsumo(tx, pieceRef, {
            pedidoId, autor: null, motivo: 'reserva-web', stockType, cantidadActual,
            reserva: { reservaId: pedidoId, reservaExpira },
        });
        tx.set(contRef, { valor: numero });
        tx.set(codigoRef, { pedidoId, at: FieldValue.serverTimestamp() });   // reserva del código (misma tx = atómico)
        // §166: payload público SIN `numero` (ver comentario del path idempotente).
        return { pedidoId, codigo, total, estado: 'pago_pendiente', expiraMs: nowMs + ttlMs, yaExistia: false };
    });

    // Firma de integridad (datos ya fijos; fuera de la tx). reference = pedidoId.
    // A.4: `expiration_time` (ISO-8601 UTC) DERIVADO del `reservaExpira` REAL del pedido (nuevo o reusado)
    // → viaja al Widget Y a la firma ("lo firmado == lo enviado", wompi-core §8). Sin esto el link de pago
    // vivía para siempre → un APPROVED tardío tras liberar la reserva = `pagado_sin_stock` (cobro sin pieza).
    const amountInCents = montoEnCentavos(result.total);
    const expirationTime = new Date(result.expiraMs).toISOString();
    const signature = firmaIntegridad({ reference: pedidoId, amountInCents, currency: 'COP', expirationTime, integritySecret });
    const { expiraMs, ...rest } = result;
    return { ...rest, reference: pedidoId, amountInCents, currency: 'COP', signature, expirationTime };
}

/**
 * confirmarPago (B1 paso 4) — Kary confirma "ya vi la plata" → pasa el pedido de
 * `pago_por_verificar` a `pagado`. La regla SoD ("no se despacha sin ver el dinero"): el
 * estado de pago SOLO lo flipea la CF, nunca el cliente. Idempotente (re-confirmar = no-op).
 * @param db Firestore (admin). @param input { pedidoId, autor }
 */
async function confirmarPagoCore(db, input = {}) {
    const pedidoId = String(input.pedidoId || '').trim();
    const autor    = input.autor || null;
    if (!pedidoId) throw new PedidoError('invalid-argument', 'pedidoId es obligatorio.');

    return db.runTransaction(async (tx) => {
        const ref = db.doc(`pedidos/${pedidoId}`);
        const snap = await tx.get(ref);
        if (!snap.exists) throw new PedidoError('not-found', 'El pedido no existe.');
        const ped = snap.data();
        if (ped.estado === 'pagado' || ped.estado === 'entregado') return { pedidoId, estado: ped.estado, yaEstaba: true };   // idempotente
        if (ped.estado !== 'pago_por_verificar') {
            throw new PedidoError('failed-precondition', `Solo se confirma un pago "por verificar" (este está "${ped.estado}").`);
        }
        // F1-CORE ruta corta (spec §3.3): venta de MOSTRADOR sin envío = entrega en mano — al confirmar
        // el pago queda `entregado` directo (con traza doble). Si pidió envío (`requiereEnvio`), queda
        // `pagado` y entra al flujo logístico normal (avanzarPedido).
        const enMano = ped.canal === 'pos' && ped.requiereEnvio !== true;
        const update = {
            estado: enMano ? 'entregado' : 'pagado',
            confirmadoPor: autor,
            confirmadoEn: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        };
        if (enMano) { update.entregadoEn = FieldValue.serverTimestamp(); update.pod = { enMano: true }; }
        tx.update(ref, update);
        const base = { autor, nota: null, at: FieldValue.serverTimestamp(), dayKey: dayKeyBogota() };
        tx.set(ref.collection('historial').doc(), { ...base, de: 'pago_por_verificar', a: 'pagado', nota: 'pago confirmado' });
        if (enMano) tx.set(ref.collection('historial').doc(), { ...base, de: 'pagado', a: 'entregado', nota: 'venta en mano' });
        return { pedidoId, estado: update.estado, yaEstaba: false };
    });
}

/**
 * confirmarPagoWompiCore (Wompi F2) — receptor del WEBHOOK de Wompi (la web cobra sola).
 * El webhook es DISPARADOR, no verdad: (1) valida la firma del evento (secreto de Eventos);
 * (2) RE-CONSULTA la API de Wompi (`fetchTransaction` = source of truth, no se confía en el payload);
 * (3) valida monto/moneda/referencia vs el pedido CONGELADO (D-W11); (4) SOLO APPROVED transiciona
 * pago_pendiente→pagado, idempotente por transactionId (webhookEvents/{txId}). DECLINED/otros NO
 * cancelan (el cliente reintenta; el reaper libera por tiempo). APPROVED tardío sobre reserva ya
 * liberada → pagado_sin_stock (NUNCA revende, C3). El webhook JAMÁS toca stock (ya descontado al reservar).
 * @param event  body del webhook { data.transaction, signature{properties,checksum}, timestamp }
 * @param opts   { eventsSecret, fetchTransaction:(txId)=>Promise<{id,status,amount_in_cents,currency,reference}> }
 */
async function confirmarPagoWompiCore(db, event = {}, opts = {}) {
    const { eventsSecret, fetchTransaction } = opts;
    if (!eventsSecret || typeof fetchTransaction !== 'function') {
        throw new PedidoError('failed-precondition', 'Webhook mal configurado (falta secreto de eventos o consulta).');
    }
    // 1. Firma del evento. Inválida → 401 (no es un evento legítimo de Wompi; no se procesa).
    if (!verificarFirmaEvento(event, eventsSecret)) return { ok: false, status: 401, reason: 'firma-invalida' };

    const txEvent = event?.data?.transaction || {};
    const txId = String(txEvent.id || '').trim();
    const reference = String(txEvent.reference || '').trim();
    if (!txId || !reference) return { ok: false, status: 400, reason: 'evento-incompleto' };

    // 2. RE-CONSULTA a Wompi = la VERDAD (no confiar en el status/monto del payload del evento).
    const tx = await fetchTransaction(txId);
    if (!tx) return { ok: false, status: 502, reason: 'sin-consulta' };   // transitorio → Wompi reintenta

    // 3. Idempotencia (webhookEvents/{txId}) + transición del pedido, atómico.
    return db.runTransaction(async (t) => {
        const evtRef = db.doc(`webhookEvents/${txId}`);
        const pedidoRef = db.doc(`pedidos/${reference}`);
        const evtSnap = await t.get(evtRef);
        const pedSnap = await t.get(pedidoRef);                            // reads antes de writes
        if (evtSnap.exists) return { ok: true, status: 200, reason: 'replay', yaProcesado: true };

        const evt = { txId, reference, status: tx.status, amount_in_cents: tx.amount_in_cents, procesadoEn: FieldValue.serverTimestamp() };
        if (!pedSnap.exists) {
            t.set(evtRef, { ...evt, accion: 'pedido-inexistente' });
            return { ok: true, status: 200, reason: 'pedido-inexistente' };
        }
        const ped = pedSnap.data();

        // No-APPROVED (DECLINED/VOIDED/ERROR/PENDING): NO transiciona (el cliente reintenta; el reaper libera).
        // A.3: se audita en un doc COMPUESTO `webhookEvents/{txId}-{status}`, NUNCA en `webhookEvents/{txId}`.
        // Una misma transacción PSE/Nequi emite varios eventos (PENDING → APPROVED); si el PENDING escribiera
        // la llave `{txId}`, el APPROVED posterior caería en el replay-guard de arriba y el pedido nunca pasaría
        // a `pagado` (quedaría para revisión manual). Con la llave compuesta, el APPROVED del mismo txId procesa.
        if (tx.status !== 'APPROVED') {
            t.set(db.doc(`webhookEvents/${txId}-${tx.status}`), { ...evt, accion: 'auditado-no-aprobado' }, { merge: true });
            return { ok: true, status: 200, reason: `no-aprobado:${tx.status}`, pedidoEstado: ped.estado };
        }
        // APPROVED: valida monto + moneda + referencia contra el pedido CONGELADO.
        const esperado = Math.round(Number(ped.total) || 0) * 100;
        if (tx.amount_in_cents !== esperado || (tx.currency && tx.currency !== 'COP') || tx.reference !== reference) {
            t.set(evtRef, { ...evt, accion: 'monto-o-ref-no-coincide', esperado });
            t.update(pedidoRef, { estado: 'a_revisar', revisarMotivo: 'monto/moneda/referencia ≠ Wompi', wompiTxId: txId, updatedAt: FieldValue.serverTimestamp() });
            return { ok: false, status: 200, reason: 'monto-no-coincide' };
        }
        // Transición por estado del pedido (idempotencia de negocio). NUNCA toca stock (ya descontado).
        if (ped.estado === 'pagado') {
            t.set(evtRef, { ...evt, accion: 'ya-pagado' });
            return { ok: true, status: 200, reason: 'ya-pagado', yaProcesado: true };
        }
        if (ped.estado === 'pago_pendiente') {
            t.set(evtRef, { ...evt, accion: 'pagado' });
            t.update(pedidoRef, { estado: 'pagado', confirmadoPor: 'wompi-webhook', wompiTxId: txId, confirmadoEn: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
            return { ok: true, status: 200, reason: 'pagado' };
        }
        // Otro estado (expirado/cancelado/anulado): la reserva ya se liberó → cobro real SIN stock.
        // NUNCA revende auto (C3): pagado_sin_stock para revisión/reembolso manual (dueño + SLA).
        t.set(evtRef, { ...evt, accion: 'pagado-sin-stock' });
        t.update(pedidoRef, { estado: 'pagado_sin_stock', wompiTxId: txId, revisarMotivo: `APPROVED tardío sobre estado ${ped.estado}`, updatedAt: FieldValue.serverTimestamp() });
        return { ok: true, status: 200, reason: 'pagado-sin-stock', pedidoEstado: ped.estado };
    });
}

// ── Reaper (Wompi F2): libera reservas web vencidas y NO pagadas ──────────────────────────────
const GRACE_MS = 3 * 60 * 1000;   // colchón tras vencer (no cortar un webhook en vuelo).

/**
 * liberarReservaCore — libera UNA reserva web no pagada (idempotente por transición de estado).
 * NUNCA a ciegas (consejo §11): re-consulta el pago (verificarPago) ANTES de soltar.
 *   APPROVED → a_revisar (pagó sin webhook; no perder la venta) · PENDING/null/throw → NO libera ·
 *   NONE → repone unidad (+1) + estado derivado + ledger 'reserva-expirada' + pedido `expirado`.
 * @param verificarPago (pedido)=>Promise<'APPROVED'|'PENDING'|'NONE'> (null/throw = no se pudo → skip)
 */
async function liberarReservaCore(db, pedidoId, opts = {}) {
    const { verificarPago } = opts;
    const pedidoRef = db.doc(`pedidos/${pedidoId}`);
    const snap0 = await pedidoRef.get();
    if (!snap0.exists) return { pedidoId, accion: 'inexistente' };
    if (snap0.data().estado !== 'pago_pendiente') return { pedidoId, accion: 'no-pendiente', estado: snap0.data().estado };

    // Re-consulta el pago ANTES de liberar (I/O fuera de la tx). Falla → NO libera (reintenta luego).
    let estadoPago = 'NONE';
    if (typeof verificarPago === 'function') {
        try { estadoPago = await verificarPago(snap0.data(), pedidoId); }   // pedidoId = reference Wompi
        catch { return { pedidoId, accion: 'consulta-fallo-skip' }; }
        if (estadoPago == null) return { pedidoId, accion: 'consulta-fallo-skip' };
    }
    if (estadoPago === 'PENDING') return { pedidoId, accion: 'pendiente-skip' };

    return db.runTransaction(async (t) => {
        const snap = await t.get(pedidoRef);
        const ped = snap.exists ? snap.data() : null;
        if (!ped || ped.estado !== 'pago_pendiente') return { pedidoId, accion: 'ya-resuelto', estado: ped && ped.estado };

        if (estadoPago === 'APPROVED') {
            t.update(pedidoRef, { estado: 'a_revisar', revisarMotivo: 'reaper halló pago APPROVED sin webhook', updatedAt: FieldValue.serverTimestamp() });
            return { pedidoId, accion: 'a_revisar-aprobado' };
        }
        // NONE → liberar: repone la unidad si este pedido la consumió (helper compartido C.1).
        if (ped.consumioStock === true && ped.pieceId) {
            const pieceRef = db.doc(`pieces/${ped.pieceId}`);
            const pieceSnap = await t.get(pieceRef);
            if (pieceSnap.exists) {
                reponerStock(t, pieceRef, pieceSnap.data(), { pedidoId, motivo: 'reserva-expirada', ledgerId: `exp-${pedidoId}`, actor: 'reaper' });
            }
        }
        t.update(pedidoRef, { estado: 'expirado', expiradoEn: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
        return { pedidoId, accion: 'liberado' };
    });
}

/**
 * liberarReservasVencidasCore — barrido (reaper, Cloud Scheduler): pedidos `pago_pendiente` con
 * `reservaExpira` ≤ (now − GRACE). Requiere índice pedidos(estado,reservaExpira). Secuencial
 * (lujo = bajo volumen). Pasa `opts` (verificarPago) a cada `liberarReservaCore`.
 */
async function liberarReservasVencidasCore(db, opts = {}) {
    const nowMs = Number.isFinite(opts.nowMs) ? opts.nowMs : Date.now();
    const graceMs = Number.isFinite(opts.graceMs) ? opts.graceMs : GRACE_MS;
    const max = Number.isFinite(opts.limit) ? opts.limit : 50;
    const cutoff = Timestamp.fromMillis(nowMs - graceMs);
    const snap = await db.collection('pedidos')
        .where('estado', '==', 'pago_pendiente').where('reservaExpira', '<=', cutoff).limit(max).get();
    const resultados = [];
    for (const doc of snap.docs) resultados.push(await liberarReservaCore(db, doc.id, opts));
    return { revisados: snap.size, liberados: resultados.filter(r => r.accion === 'liberado').length, resultados };
}

/**
 * anularPedido (B1 paso 5 · VOID) — marca el pedido como `anulado` (append-only, NO borra) y
 * REINTEGRA la pieza al catálogo (`vendida`→`disponible`) si este pedido la había tomado.
 * "Inmutable ≠ no-anulable": el desglose/total quedan como snapshot; se agrega traza
 * (anuladoPor/motivo). Idempotente. El correlativo NO se reusa (el numero queda para auditoría).
 * @param db Firestore (admin). @param input { pedidoId, motivo?, autor }
 */
async function anularPedidoCore(db, input = {}) {
    const pedidoId = String(input.pedidoId || '').trim();
    const autor    = input.autor || null;
    const motivo   = String(input.motivo || '').trim().slice(0, 300);
    if (!pedidoId) throw new PedidoError('invalid-argument', 'pedidoId es obligatorio.');

    return db.runTransaction(async (tx) => {
        const pedidoRef = db.doc(`pedidos/${pedidoId}`);
        const snap = await tx.get(pedidoRef);
        if (!snap.exists) throw new PedidoError('not-found', 'El pedido no existe.');
        const ped = snap.data();
        if (ped.estado === 'anulado') return { pedidoId, ok: true, yaAnulado: true };

        // TODO-40 v3: reponer la unidad si este pedido consumió stock. [reads antes de writes]
        // El gate de transición (ped.estado==='anulado' arriba) garantiza UNA sola reposición (idempotente).
        let reintegrada = false;
        if (ped.pieceId) {
            const pieceRef = db.doc(`pieces/${ped.pieceId}`);
            const pieceSnap = await tx.get(pieceRef);
            if (pieceSnap.exists) {
                const p = pieceSnap.data();
                if (ped.consumioStock === true) {
                    // C.1: v3 → helper compartido (repone +1, respeta encargo, limpia reservaId fantasma).
                    reponerStock(tx, pieceRef, p, { pedidoId, motivo: 'anulacion', ledgerId: `anul-${pedidoId}`, actor: autor });
                    reintegrada = true;
                } else if (p.estado === 'vendida') {
                    // LEGACY (pedido pre-v3): la pieza quedó 'vendida' → volver a disponible (modelo viejo).
                    tx.update(pieceRef, { estado: 'disponible', reservaId: null, updatedAt: FieldValue.serverTimestamp() });
                    reintegrada = true;
                }
            }
        }
        tx.update(pedidoRef, {
            estado: 'anulado', anuladoPor: autor, anuladoEn: FieldValue.serverTimestamp(),
            motivoAnulacion: motivo || null, updatedAt: FieldValue.serverTimestamp(),
        });
        return { pedidoId, ok: true, yaAnulado: false, piezaReintegrada: reintegrada };
    });
}

/**
 * avanzarPedido (F1-CORE, spec 2026-07-06 §3) — ÚNICA puerta de las transiciones post-pago.
 * Valida contra TRANSICIONES (tabla), escribe el efecto de la transición + traza append-only en
 * `pedidos/{id}/historial` (autor + serverTimestamp + dayKey local), todo en UNA transacción.
 * Idempotente: estado===a → no-op. El snapshot (`total`/`desglose`) JAMÁS se toca: el flete es
 * cargo ADITIVO (D-2: se cobra aparte). Cancelado pre-entrega repone stock (reusa reponerStock).
 * @param db Firestore (admin). @param input { pedidoId, a, datos?, nota?, autor }
 * @param opts { nowMs? } — dayKey determinista en tests
 */
async function avanzarPedidoCore(db, input = {}, opts = {}) {
    const pedidoId = String(input.pedidoId || '').trim();
    const a        = String(input.a || '').trim();
    const autor    = input.autor || null;
    const nota     = (typeof input.nota === 'string' && input.nota.trim()) ? input.nota.trim().slice(0, 500) : null;
    const datos    = (input.datos && typeof input.datos === 'object') ? input.datos : {};
    if (!pedidoId || !a) throw new PedidoError('invalid-argument', 'pedidoId y el estado destino (a) son obligatorios.');
    const nowMs = Number.isFinite(opts.nowMs) ? opts.nowMs : Date.now();
    const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
    // Flete/domicilio = cargo ADITIVO trazable (D-2), misma forma en nacional y local (Daniel 2026-07-06).
    const normFlete = (f) => ({
        valorCOP: entero(f.valorCOP),
        cobro: f.cobro === 'asumido' ? 'asumido' : 'cobrado',   // D-2: default se cobra aparte
        medio: str(f.medio, 40) || null,
        estado: f.estado === 'recibido' ? 'recibido' : 'pendiente',
    });

    return db.runTransaction(async (tx) => {
        const ref = db.doc(`pedidos/${pedidoId}`);
        const snap = await tx.get(ref);
        if (!snap.exists) throw new PedidoError('not-found', 'El pedido no existe.');
        const p = snap.data();
        if (p.estado === a) return { pedidoId, estado: a, yaEstaba: true };
        const permitidos = TRANSICIONES[p.estado] || [];
        if (!permitidos.includes(a)) {
            throw new PedidoError('failed-precondition', `Transición inválida: ${p.estado} → ${a}.`);
        }

        const update = { estado: a, updatedAt: FieldValue.serverTimestamp() };
        let merma = null;           // asiento de ledger (write diferido tras las lecturas)
        let reponer = null;         // { pieceRef, piece } para cancelado

        if (a === 'despacho_nacional') {
            const f = (datos.flete && typeof datos.flete === 'object') ? datos.flete : null;
            const transportadora = str(datos.transportadora);
            const guia = str(datos.guia);
            if (!f || !transportadora || !guia) {
                throw new PedidoError('invalid-argument', 'Despacho nacional exige flete{valorCOP,cobro,medio}, transportadora y guía.');
            }
            update.flete = normFlete(f);
            update.transportadora = transportadora;
            update.guia = guia;
            if (datos.valorDeclarado != null) update.valorDeclarado = entero(datos.valorDeclarado);
            if (typeof datos.asegurado === 'boolean') update.asegurado = datos.asegurado;
            const pesoEntregado = Number(datos.pesoEntregado);
            if (Number.isFinite(pesoEntregado) && pesoEntregado > 0) {
                update.pesoEntregado = pesoEntregado;
                // Merma (spec §3.2): SOLO al ledger de la pieza — una sola fuente de verdad del stock.
                const pesoCobrado = Number(p.desglose?.peso);
                if (p.desglose?.tipo === 'por_peso' && Number.isFinite(pesoCobrado) && pesoEntregado < pesoCobrado) {
                    merma = {
                        ref: db.doc(`pieces/${p.pieceId}`).collection('movimientos').doc(`merma-${pedidoId}`),
                        data: { delta: 0, motivo: 'merma', pedidoId, gramos: pesoCobrado - pesoEntregado, actor: autor, at: FieldValue.serverTimestamp() },
                    };
                }
            }
        } else if (a === 'entrega_local') {
            const receptor = str(datos.receptorNombre);
            if (!receptor) throw new PedidoError('invalid-argument', 'Entrega local exige el nombre de quien recibe.');
            update.pod = { receptorNombre: receptor };
            // Domicilio local COBRADO (Daniel 2026-07-06): misma trazabilidad que el flete nacional —
            // cuánto, quién lo paga y si la plata ya llegó, ANTES de despachar al mensajero.
            // Opcional: domicilio gratis no deja rastro de flete.
            if (datos.flete && typeof datos.flete === 'object') update.flete = normFlete(datos.flete);
        } else if (a === 'entregado') {
            update.entregadoEn = FieldValue.serverTimestamp();
            if (p.estado === 'listo_retiro') {
                // Retiro en atelier: Kary coteja la cédula física contra shipping.docNumber.
                if (datos.cedulaCotejada !== true) throw new PedidoError('failed-precondition', 'Retiro: confirma que cotejaste la cédula del comprador.');
                update.pod = { ...(p.pod || {}), cedulaCotejada: true };
            } else if (p.estado === 'despacho_nacional') {
                update.pod = { ...(p.pod || {}), evidencia: str(datos.evidencia, 500) || null };
            } else if (p.estado === 'pagado') {
                update.pod = { enMano: true };                       // venta en mano (manual)
            }
        } else if (a === 'cancelado') {
            const motivo = str(datos.motivo, 500);
            if (!motivo) throw new PedidoError('invalid-argument', 'Cancelar exige un motivo.');
            update.canceladoEn = FieldValue.serverTimestamp();
            update.canceladoPor = autor;
            update.motivoCancelacion = motivo;
            if (p.consumioStock) {
                const pieceRef = db.doc(`pieces/${p.pieceId}`);
                const pieceSnap = await tx.get(pieceRef);            // lectura ANTES de todo write
                if (pieceSnap.exists) reponer = { pieceRef, piece: pieceSnap.data() };
            }
        } else if (a === 'reembolsado') {
            const r = (datos.reembolso && typeof datos.reembolso === 'object') ? datos.reembolso : null;
            if (!r || entero(r.monto) <= 0 || !str(r.medio, 40)) {
                throw new PedidoError('invalid-argument', 'Reembolso exige medio y monto (>0).');
            }
            update.reembolso = { medio: str(r.medio, 40), monto: entero(r.monto), referencia: str(r.referencia) || null };
            update.reembolsadoEn = FieldValue.serverTimestamp();
            update.reembolsadoPor = autor;
            // NO repone stock automático: si la pieza volvió física es un alta consciente (F3/kardex).
        }

        // ── Writes (todas las lecturas ya ocurrieron) ──
        if (reponer) reponerStock(tx, reponer.pieceRef, reponer.piece, { pedidoId, motivo: 'cancelado', ledgerId: `cancelado-${pedidoId}`, actor: autor });
        if (merma) tx.set(merma.ref, merma.data);
        tx.update(ref, update);
        tx.set(ref.collection('historial').doc(), {
            de: p.estado, a, autor, nota,
            at: FieldValue.serverTimestamp(),
            dayKey: dayKeyBogota(nowMs),
        });
        return { pedidoId, estado: a, de: p.estado };
    });
}

/**
 * cierreCaja (B1 paso 5 · Cierre Z / arqueo) — Kary declara el efectivo FÍSICO contado; el sistema
 * compara contra lo esperado (suma de pedidos `pagado` por medio desde el último cierre) y revela el
 * descuadre. Conteo A CIEGAS: el esperado se calcula al cerrar, no se muestra antes. Idempotente por
 * `arqueoId`. Los anulados quedan excluidos (no son `pagado`). Escritor único = la CF (arqueo cliente-DENY).
 * @param db Firestore (admin). @param input { arqueoId, declaradoEfectivo, autor }
 */
async function cierreCajaCore(db, input = {}) {
    const arqueoId  = String(input.arqueoId || '').trim();
    const autor     = input.autor || null;
    const declarado = entero(input.declaradoEfectivo);
    if (!arqueoId) throw new PedidoError('invalid-argument', 'arqueoId es obligatorio.');

    const ref = db.doc(`arqueo/${arqueoId}`);
    const existing = await ref.get();
    if (existing.exists) {                              // IDEMPOTENTE: doble clic → mismo arqueo
        const e = existing.data();
        return { arqueoId, esperadoPorMedio: e.esperadoPorMedio, esperadoEfectivo: e.esperadoEfectivo, declaradoEfectivo: e.declaradoEfectivo, descuadre: e.descuadre, yaExistia: true };
    }

    // Ventana del turno = desde el último cierre (o desde siempre la 1ª vez).
    const lastSnap = await db.collection('arqueo').orderBy('cierreTs', 'desc').limit(1).get();
    const desde = lastSnap.empty ? null : lastSnap.docs[0].data().cierreTs;

    // C.2: el "momento del dinero" de un pedido pagado = `confirmadoEn` (transferencia/Wompi, confirmado
    // por Kary/webhook) o `createdAt` (efectivo, nace pagado). Se suma por ESE momento, no por createdAt:
    // una venta creada en un turno y confirmada en ESTE cuenta aquí (antes se perdía = subreporte). Como
    // confirmadoEn≠createdAt, se recolecta por 3 vías (creados/confirmados/anulados en la ventana; dedup por id).
    const vistos = new Map();
    const recolectar = snap => snap.forEach(d => vistos.set(d.id, d.data()));
    const qBase = db.collection('pedidos');
    recolectar(await (desde ? qBase.where('createdAt', '>', desde) : qBase).get());
    if (desde) {
        recolectar(await qBase.where('confirmadoEn', '>', desde).get());     // confirmados tarde
        recolectar(await qBase.where('anuladoEn', '>', desde).get());         // anulados en el turno
        recolectar(await qBase.where('canceladoEn', '>', desde).get());       // F1-CORE: cancelados en el turno
        recolectar(await qBase.where('reembolsadoEn', '>', desde).get());     // F1-CORE: reembolsados en el turno
    }
    const enVentana = ts => ts && (!desde || (ts.toMillis?.() ?? 0) > desde.toMillis());

    // C.4: los medios salen de MEDIOS (no un objeto fijo) → si mañana se descongela ADDI, no queda invisible.
    // F1-CORE (P0, spec §3.4): el dinero se cuenta por ESTADOS_CON_DINERO (pagado y posteriores), no por
    // estado literal 'pagado' — avanzar un pedido a preparacion/entregado antes del cierre YA NO lo esfuma.
    const esperado = Object.fromEntries(MEDIOS.map(m => [m, 0]));
    const ajustes  = Object.fromEntries(MEDIOS.map(m => [m, 0]));   // devoluciones de dinero contado en cierres PREVIOS
    const DEVUELVEN = { anulado: 'anuladoEn', cancelado: 'canceladoEn', reembolsado: 'reembolsadoEn' };
    for (const p of vistos.values()) {
        if (esperado[p.medio] == null) continue;
        const momento = p.confirmadoEn || p.createdAt;
        if (ESTADOS_CON_DINERO.has(p.estado)) {
            if (enVentana(momento)) esperado[p.medio] += entero(p.total);
        } else if (DEVUELVEN[p.estado] && enVentana(p[DEVUELVEN[p.estado]])) {
            // Devuelto en este turno; si su dinero se contó en un cierre PREVIO (momento ≤ desde), se resta ahora.
            // Transferencia/wompi solo INGRESAN al confirmarse: sin `confirmadoEn` nunca hubo dinero
            // (pago_por_verificar/pago_pendiente viejo) → no genera devolución fantasma.
            const ingreso = p.medio === 'efectivo' || !!p.confirmadoEn;
            if (ingreso && desde && momento && (momento.toMillis?.() ?? 0) <= desde.toMillis()) ajustes[p.medio] -= entero(p.total);
        }
    }
    const esperadoEfectivo = esperado.efectivo + ajustes.efectivo;   // neto: ventas del turno − devoluciones de turnos previos
    const descuadre = declarado - esperadoEfectivo;                  // + sobra, − falta

    await ref.set({
        aperturaDesde: desde || null,
        cierreTs: FieldValue.serverTimestamp(),
        autor,
        esperadoPorMedio: esperado,
        ajustesPorMedio: ajustes,        // C.2: devoluciones por anulación de ventas contadas en cierres previos
        esperadoEfectivo,
        declaradoEfectivo: declarado,
        descuadre,
    });
    return { arqueoId, esperadoPorMedio: esperado, ajustesPorMedio: ajustes, esperadoEfectivo, declaradoEfectivo: declarado, descuadre, yaExistia: false };
}

module.exports = {
    crearPedidoCore, confirmarPagoCore, anularPedidoCore, cierreCajaCore,
    avanzarPedidoCore, TRANSICIONES, ESTADOS_CON_DINERO, dayKeyBogota,   // F1-CORE (spec 2026-07-06)
    iniciarPagoWebCore,                          // Wompi F2: reserva web → pago_pendiente + firma
    confirmarPagoWompiCore,                      // Wompi F2: webhook → valida firma+re-consulta → pagado
    liberarReservaCore, liberarReservasVencidasCore,   // Wompi F2: reaper (libera reservas vencidas no pagadas)
    entero, calcOro, PedidoError, MEDIOS, COTA_TURNO,   // SSoT reusados por caja-core / tests (F2.0)
    derivarEstado, normStockType, STOCK_TYPES,   // modelo v3 (reusado por inventario-core.js)
    evaluarStock, aplicarConsumo,                // candado de stock compartido (reusado por iniciarPagoWeb, F2)
    generarCodigoPedido, CODIGO_ALFABETO,        // §166: código público (tests + backfill)
};
