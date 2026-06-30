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
const { montoEnCentavos, firmaIntegridad, verificarFirmaEvento } = require('./wompi-core');

const MEDIOS  = ['efectivo', 'transferencia', 'wompi', 'addi'];
const CANALES = ['pos', 'web', 'whatsapp'];

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
        cantidad: FieldValue.increment(-1),
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
 * @param db Firestore (admin) — bypassa reglas (único escritor server-side).
 * @param input { pedidoId, pieceId, valorGramo?, peso?, manoObra?, medio?, canal?, autor }
 */
async function crearPedidoCore(db, input = {}) {
    const pedidoId = String(input.pedidoId || '').trim();   // UUID del cliente (idempotencia)
    const pieceId  = String(input.pieceId  || '').trim();
    const autor    = input.autor || null;
    if (!pedidoId || !pieceId) throw new PedidoError('invalid-argument', 'pedidoId y pieceId son obligatorios.');
    const medio = MEDIOS.includes(input.medio)  ? input.medio  : 'efectivo';
    const canal = CANALES.includes(input.canal) ? input.canal : 'pos';

    return db.runTransaction(async (tx) => {
        const pedidoRef = db.doc(`pedidos/${pedidoId}`);
        const existing = await tx.get(pedidoRef);
        if (existing.exists) {                          // IDEMPOTENTE: reintento → mismo pedido
            const e = existing.data();
            return { pedidoId, numero: e.numero, total: e.total, yaExistia: true };
        }

        const pieceRef = db.doc(`pieces/${pieceId}`);
        const pieceSnap = await tx.get(pieceRef);
        if (!pieceSnap.exists) throw new PedidoError('not-found', 'La pieza no existe.');
        const piece = pieceSnap.data();
        // TODO-40 v3: candado de stock compartido (POS + reserva web). Valida disponibilidad (throw si
        // agotada) y calcula si esta venta consume una unidad física. SSoT = cantidad (helper reusable).
        const { stockType, cantidadActual, consumeUnidad } = evaluarStock(piece);

        // Total server-side: precio fijo si la pieza lo tiene; si no, por peso (peso×gramo+mano).
        const precioFijo = typeof piece.price === 'number' && isFinite(piece.price);
        const oro   = precioFijo ? 0 : calcOro(input.valorGramo, input.peso);
        const mano  = precioFijo ? 0 : entero(input.manoObra);
        const total = precioFijo ? entero(piece.price) : (oro + mano);
        if (total <= 0) throw new PedidoError('invalid-argument', 'El total debe ser mayor a 0 (revisa el precio o el peso/gramo).');

        // Correlativo atómico (dentro de ESTA transacción → sin números repetidos).
        const contRef = db.doc('contadores/pedidos');
        const contSnap = await tx.get(contRef);
        const numero = ((contSnap.exists && Number(contSnap.data().valor)) || 0) + 1;

        const desglose = precioFijo
            ? { tipo: 'precio_fijo', total }
            : { tipo: 'por_peso', peso: Math.max(0, Number(input.peso) || 0), valorGramo: entero(input.valorGramo), manoObra: mano, oro, total };

        tx.set(pedidoRef, {
            numero, pieceId,
            pieceSlug: piece.slug || pieceId,
            pieceName: piece.name || 'Pieza',
            canal, medio,
            estado: medio === 'efectivo' ? 'pagado' : 'pago_por_verificar',
            total,
            desglose,                                   // SNAPSHOT inmutable (la CF nunca lo edita)
            consumioStock: consumeUnidad,               // v3: ¿bajó una unidad física? → anular la repone
            autor,
            createdAt: FieldValue.serverTimestamp(),
        });
        // TODO-40 v3: decrementar `cantidad` (NO marcar 'vendida') + estado DERIVADO + ledger (venta mostrador).
        if (consumeUnidad) aplicarConsumo(tx, pieceRef, { pedidoId, autor, motivo: 'venta', stockType, cantidadActual });
        tx.set(contRef, { valor: numero });

        return { pedidoId, numero, total, yaExistia: false };
    });
}

// ── Wompi F2 (TODO-42): reserva web → pedido pago_pendiente + firma de integridad ─────────────
const TOPE_TX_COP = 2500000;            // tope Persona Natural por transacción (server-side, §11)
const RESERVA_TTL_MS = 15 * 60 * 1000;  // 15 min (MVP tarjeta; PSE/Nequi en 2b ata al expiry de Wompi)

// Whitelist de envío (el cliente público no graba datos arbitrarios). null si viene vacío.
function sanitizeShipping(s) {
    if (!s || typeof s !== 'object') return null;
    const str = k => (typeof s[k] === 'string' ? s[k].trim().slice(0, 200) : '');
    const out = {
        firstName: str('firstName'), lastName: str('lastName'), email: str('email'),
        phone: str('phone'), address: str('address'), city: str('city'),
        country: str('country') || 'Colombia', zip: str('zip'),
    };
    return Object.values(out).some(v => v && v !== 'Colombia') ? out : null;
}

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

    const result = await db.runTransaction(async (tx) => {
        const pedidoRef = db.doc(`pedidos/${pedidoId}`);
        const existing = await tx.get(pedidoRef);
        if (existing.exists) {                          // IDEMPOTENTE: reintento → mismo pedido
            const e = existing.data();
            return { pedidoId, numero: e.numero, total: e.total, estado: e.estado, yaExistia: true };
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
        const reservaExpira = Timestamp.fromMillis(nowMs + ttlMs);

        tx.set(pedidoRef, {
            numero, pieceId,
            pieceSlug: piece.slug || pieceId,
            pieceName: piece.name || 'Pieza',
            canal: 'web', medio: 'wompi',
            estado: 'pago_pendiente',
            total,
            desglose: { tipo: 'precio_fijo', total },   // SNAPSHOT inmutable (el webhook valida vs este total)
            consumioStock: true,
            reservaExpira,                              // verdad de la reserva (el reaper la lee)
            shipping: shipping || null,
            habeasData: { aceptado: true, version: habeasVersion, fecha: FieldValue.serverTimestamp() },  // prueba del consentimiento (Dto.1377 art.5)
            autor: null,                               // cliente público sin login
            createdAt: FieldValue.serverTimestamp(),
        });
        // Reserva: decrementa cantidad + estado derivado + reservaId/reservaExpira (C5) + ledger.
        aplicarConsumo(tx, pieceRef, {
            pedidoId, autor: null, motivo: 'reserva-web', stockType, cantidadActual,
            reserva: { reservaId: pedidoId, reservaExpira },
        });
        tx.set(contRef, { valor: numero });
        return { pedidoId, numero, total, estado: 'pago_pendiente', yaExistia: false };
    });

    // Firma de integridad (datos ya fijos; fuera de la tx). reference = pedidoId.
    const amountInCents = montoEnCentavos(result.total);
    const signature = firmaIntegridad({ reference: pedidoId, amountInCents, currency: 'COP', integritySecret });
    return { ...result, reference: pedidoId, amountInCents, currency: 'COP', signature };
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
        if (ped.estado === 'pagado') return { pedidoId, estado: 'pagado', yaEstaba: true };   // idempotente
        if (ped.estado !== 'pago_por_verificar') {
            throw new PedidoError('failed-precondition', `Solo se confirma un pago "por verificar" (este está "${ped.estado}").`);
        }
        tx.update(ref, {
            estado: 'pagado',
            confirmadoPor: autor,
            confirmadoEn: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });
        return { pedidoId, estado: 'pagado', yaEstaba: false };
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

        // No-APPROVED (DECLINED/VOIDED/ERROR/PENDING): NO transiciona (el cliente reintenta; el reaper libera). Audita.
        if (tx.status !== 'APPROVED') {
            t.set(evtRef, { ...evt, accion: 'auditado-no-aprobado' });
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
        // NONE → liberar: repone la unidad si este pedido la consumió (espeja anularPedido).
        if (ped.consumioStock === true && ped.pieceId) {
            const pieceRef = db.doc(`pieces/${ped.pieceId}`);
            const pieceSnap = await t.get(pieceRef);
            if (pieceSnap.exists) {
                const p = pieceSnap.data();
                const st = normStockType(p.stockType);
                const nuevaCantidad = (Number.isInteger(p.cantidad) ? p.cantidad : 0) + 1;
                t.update(pieceRef, { cantidad: FieldValue.increment(1), estado: derivarEstado(st, nuevaCantidad), reservaId: null, reservaExpira: null, updatedAt: FieldValue.serverTimestamp() });
                t.set(pieceRef.collection('movimientos').doc(`exp-${pedidoId}`), { delta: 1, motivo: 'reserva-expirada', pedidoId, cantidadResultante: nuevaCantidad, actor: 'reaper', at: FieldValue.serverTimestamp() });
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
                    // v3: el pedido bajó una unidad → increment(+1) + estado DERIVADO + ledger.
                    const st = normStockType(p.stockType);
                    const nuevaCantidad = (Number.isInteger(p.cantidad) ? p.cantidad : 0) + 1;
                    tx.update(pieceRef, {
                        cantidad: FieldValue.increment(1),
                        estado: derivarEstado(st, nuevaCantidad),
                        updatedAt: FieldValue.serverTimestamp(),
                    });
                    tx.set(db.doc(`pieces/${ped.pieceId}/movimientos/anul-${pedidoId}`), {
                        delta: 1, motivo: 'anulacion', pedidoId, cantidadResultante: nuevaCantidad,
                        actor: autor, at: FieldValue.serverTimestamp(),
                    });
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
    // Rango sobre createdAt (campo único → sin índice compuesto); el estado se filtra en código.
    let q = db.collection('pedidos');
    if (desde) q = q.where('createdAt', '>', desde);
    const peds = await q.get();

    const esperado = { efectivo: 0, transferencia: 0, wompi: 0 };
    peds.forEach(d => {
        const p = d.data();
        if (p.estado === 'pagado' && esperado[p.medio] != null) esperado[p.medio] += entero(p.total);
    });
    const descuadre = declarado - esperado.efectivo;    // + sobra, − falta

    await ref.set({
        aperturaDesde: desde || null,
        cierreTs: FieldValue.serverTimestamp(),
        autor,
        esperadoPorMedio: esperado,
        esperadoEfectivo: esperado.efectivo,
        declaradoEfectivo: declarado,
        descuadre,
    });
    return { arqueoId, esperadoPorMedio: esperado, esperadoEfectivo: esperado.efectivo, declaradoEfectivo: declarado, descuadre, yaExistia: false };
}

module.exports = {
    crearPedidoCore, confirmarPagoCore, anularPedidoCore, cierreCajaCore,
    iniciarPagoWebCore,                          // Wompi F2: reserva web → pago_pendiente + firma
    confirmarPagoWompiCore,                      // Wompi F2: webhook → valida firma+re-consulta → pagado
    liberarReservaCore, liberarReservasVencidasCore,   // Wompi F2: reaper (libera reservas vencidas no pagadas)
    entero, calcOro, PedidoError,
    derivarEstado, normStockType, STOCK_TYPES,   // modelo v3 (reusado por inventario-core.js)
    evaluarStock, aplicarConsumo,                // candado de stock compartido (reusado por iniciarPagoWeb, F2)
};
