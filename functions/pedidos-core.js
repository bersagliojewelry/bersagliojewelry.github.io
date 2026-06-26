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

module.exports = { crearPedidoCore, entero, calcOro, PedidoError };
