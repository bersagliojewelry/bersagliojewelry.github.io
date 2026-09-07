/**
 * Núcleo de las operaciones de stock manuales (TODO-40 · Fase 1 · Bloque 3b) — lógica PURA
 * (solo firebase-admin) → testeable contra el emulador. Wrappers onCall → ./inventario.js.
 *
 * Capacidades que el comité v2 exigió para operar inventario real de joyería:
 *  · ajustarStock(pieceId, delta, motivo) — MERMA/daño/robo/corrección/reabasto. delta firmado;
 *    la cantidad NUNCA queda negativa. Único camino de mutar `cantidad` fuera de la venta (las reglas
 *    la bloquean al cliente). Idempotente por `ajusteId`. Asienta en el ledger (C4).
 *  · cambiarTipoPieza(pieceId, nuevoStockType) — transición de tipo con PURGA de campos (D6): a
 *    'encargo' borra `cantidad`; a finito* la fija (dada o conservada). estado DERIVADO.
 *
 * `cantidad`/`estado` = CF-only (las reglas lo garantizan); estado = DERIVADO de cantidad (SSoT).
 */
const { FieldValue } = require('firebase-admin/firestore');
const { derivarEstado, normStockType, STOCK_TYPES, PedidoError } = require('./pedidos-core');

const MOTIVOS_AJUSTE = ['reabasto', 'merma', 'dano', 'robo', 'correccion'];

/**
 * Ajuste manual de stock (delta firmado) — merma/daño/robo/corrección/reabasto.
 * @param db Firestore (admin). @param input { ajusteId, pieceId, delta, motivo, autor }
 */
async function ajustarStockCore(db, input = {}) {
    const ajusteId = String(input.ajusteId || '').trim();   // UUID de idempotencia
    const pieceId  = String(input.pieceId  || '').trim();
    const delta    = Number(input.delta);
    const motivo   = MOTIVOS_AJUSTE.includes(input.motivo) ? input.motivo : null;
    const autor    = input.autor || null;
    if (!ajusteId || !pieceId) throw new PedidoError('invalid-argument', 'ajusteId y pieceId son obligatorios.');
    if (!Number.isInteger(delta) || delta === 0) throw new PedidoError('invalid-argument', 'delta debe ser un entero distinto de 0.');
    if (!motivo) throw new PedidoError('invalid-argument', 'motivo inválido (reabasto/merma/dano/robo/correccion).');

    return db.runTransaction(async (tx) => {
        const movRef = db.doc(`pieces/${pieceId}/movimientos/${ajusteId}`);
        const movSnap = await tx.get(movRef);
        if (movSnap.exists) {                                // IDEMPOTENTE: reintento → mismo ajuste
            const m = movSnap.data();
            return { pieceId, ajusteId, cantidad: m.cantidadResultante, yaExistia: true };
        }
        const pieceRef = db.doc(`pieces/${pieceId}`);
        const pieceSnap = await tx.get(pieceRef);
        if (!pieceSnap.exists) throw new PedidoError('not-found', 'La pieza no existe.');
        const piece = pieceSnap.data();
        const stockType = normStockType(piece.stockType);
        if (stockType === 'encargo') throw new PedidoError('failed-precondition', 'El stock no aplica a piezas por encargo.');

        const cantidadActual = Number.isInteger(piece.cantidad) ? piece.cantidad : 1;   // legacy ??1
        const nuevaCantidad = cantidadActual + delta;
        if (nuevaCantidad < 0) throw new PedidoError('failed-precondition', `La cantidad no puede quedar negativa (actual ${cantidadActual}, ajuste ${delta}).`);

        tx.update(pieceRef, {
            cantidad: FieldValue.increment(delta),
            estado: derivarEstado(stockType, nuevaCantidad),
            updatedAt: FieldValue.serverTimestamp(),
        });
        tx.set(movRef, {
            delta, motivo, cantidadResultante: nuevaCantidad, actor: autor, at: FieldValue.serverTimestamp(),
        });
        return { pieceId, ajusteId, cantidad: nuevaCantidad, yaExistia: false };
    });
}

/**
 * Cambiar el tipo de stock de una pieza (D6: purga los campos del tipo anterior).
 *  · → 'encargo'  : borra `cantidad` (no aplica), estado 'disponible'.
 *  · → finito*    : fija `cantidad` (la dada si es int≥0; si no, conserva la actual; si no, 1), estado derivado.
 * @param db Firestore (admin). @param input { pieceId, nuevoStockType, cantidad?, autor }
 */
async function cambiarTipoPiezaCore(db, input = {}) {
    const pieceId = String(input.pieceId || '').trim();
    const nuevo   = STOCK_TYPES.includes(input.nuevoStockType) ? input.nuevoStockType : null;
    const autor   = input.autor || null;
    if (!pieceId) throw new PedidoError('invalid-argument', 'pieceId es obligatorio.');
    if (!nuevo)   throw new PedidoError('invalid-argument', 'nuevoStockType inválido (finito/finito_refabricable/encargo).');

    return db.runTransaction(async (tx) => {
        const pieceRef = db.doc(`pieces/${pieceId}`);
        const pieceSnap = await tx.get(pieceRef);
        if (!pieceSnap.exists) throw new PedidoError('not-found', 'La pieza no existe.');
        const piece = pieceSnap.data();

        if (nuevo === 'encargo') {
            tx.update(pieceRef, {
                stockType: 'encargo',
                cantidad: FieldValue.delete(),               // PURGA (D6): encargo no tiene cantidad
                estado: 'disponible',
                updatedAt: FieldValue.serverTimestamp(),
            });
            return { pieceId, stockType: 'encargo', cantidad: null };
        }
        // → finito*: cantidad dada, o conserva, o 1.
        const cantidad = Number.isInteger(input.cantidad) && input.cantidad >= 0 ? input.cantidad
                       : (Number.isInteger(piece.cantidad) ? piece.cantidad : 1);
        tx.update(pieceRef, {
            stockType: nuevo,
            cantidad,
            estado: derivarEstado(nuevo, cantidad),
            updatedAt: FieldValue.serverTimestamp(),
        });
        return { pieceId, stockType: nuevo, cantidad };
    });
}

module.exports = { ajustarStockCore, cambiarTipoPiezaCore, MOTIVOS_AJUSTE };
