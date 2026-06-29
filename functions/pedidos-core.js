/**
 * Núcleo de `crearPedido` (B1 paso 3) — lógica PURA de negocio, SIN auth ni firebase-functions
 * (solo firebase-admin) → testeable end-to-end contra el emulador. El wrapper onCall (pedidos.js)
 * hace la autenticación/rol y mapea `PedidoError` → `HttpsError`.
 *
 * Garantías (dinero/concurrencia): único escritor (Admin SDK), candado atómico = el doc de la
 * pieza (runTransaction → imposible doble venta), total RECALCULADO server-side (no se confía en
 * el cliente), snapshot INMUTABLE, correlativo atómico, e IDEMPOTENTE por pedidoId.
 */
const { FieldValue } = require('firebase-admin/firestore');

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
    entero, calcOro, PedidoError,
    derivarEstado, normStockType, STOCK_TYPES,   // modelo v3 (reusado por inventario-core.js)
    evaluarStock, aplicarConsumo,                // candado de stock compartido (reusado por iniciarPagoWeb, F2)
};
