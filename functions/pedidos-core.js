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

class PedidoError extends Error {
    constructor(code, message) { super(message); this.code = code; this.name = 'PedidoError'; }
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
        if (piece.estado === 'vendida') throw new PedidoError('failed-precondition', 'Esa pieza ya fue vendida.');
        // (Una pieza 'reservada' sin pago SÍ se vende en mostrador: "mostrador gana", plan §2.1.)

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
            autor,
            createdAt: FieldValue.serverTimestamp(),
        });
        // Solo las piezas ÚNICAS (finito) se marcan vendidas; 'encargo' se fabrica (no consume unidad).
        if ((piece.stockType || 'finito') !== 'encargo') {
            tx.update(pieceRef, { estado: 'vendida', updatedAt: FieldValue.serverTimestamp() });
        }
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

        // Reintegrar la pieza SOLO si este pedido la dejó vendida (finito). [reads antes de writes]
        let reintegrada = false;
        if (ped.pieceId) {
            const pieceRef = db.doc(`pieces/${ped.pieceId}`);
            const pieceSnap = await tx.get(pieceRef);
            if (pieceSnap.exists && pieceSnap.data().estado === 'vendida') {
                tx.update(pieceRef, { estado: 'disponible', reservaId: null, updatedAt: FieldValue.serverTimestamp() });
                reintegrada = true;
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

module.exports = { crearPedidoCore, confirmarPagoCore, anularPedidoCore, cierreCajaCore, entero, calcOro, PedidoError };
