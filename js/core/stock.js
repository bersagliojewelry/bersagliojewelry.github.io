/**
 * Estado de stock para la UI PÚBLICA (ficha + grilla + recos) — TODO-56.
 *
 * Reusa el modelo SSoT v3 (`derivarEstado` de `js/admin/inventario-model.js`, el MISMO que el
 * SSG `generate-pieces.mjs` importa y la CF `pedidos-core.js` replica) → "agotado" se decide en UN
 * lugar para toda la web. Espeja la lógica STOCK-AWARE del SSG (`generate-pieces.mjs §10.1`):
 *   · finito agotada (cantidad 0)          → "Vendida" — pieza única vendida, NO se ofrece.
 *   · finito_refabricable en 0 / encargo   → "Por encargo" — sí pedible (se fabrica).
 *   · finito con stock                     → disponible normal (precio + carrito).
 *
 * ⚠️ Antes (bug §147/TODO-56): el cliente vivo (`pieza.js`/`catalogo.js`) leía Firestore en vivo
 * (sin el campo `available` que solo hornea el SSG) y NO derivaba el estado → una pieza vendida se
 * mostraba como disponible. Este helper cierra ese hueco con el modelo real (`stockType`+`cantidad`).
 */
import { derivarEstado } from '../admin/inventario-model.js';

/**
 * Cómo presentar el stock de una pieza en la web pública.
 * @returns {{ estado:string, vendida:boolean, porEncargo:boolean, vendible:boolean }}
 *   · vendida=true   → finito agotada: sin precio, sin carrito, sello "Vendida" + CTA asesor.
 *   · porEncargo=true→ encargo / refabricable-en-0: pedible bajo encargo (CTA encargar/consultar).
 *   · vendible=true  → se puede ofrecer (todo menos `vendida`).
 */
export function estadoVisual(piece) {
    const estado = derivarEstado(piece?.stockType, piece?.cantidad);
    const vendida = estado === 'agotada';                       // finito sin stock = pieza única vendida
    const porEncargo = !vendida && (piece?.stockType === 'encargo' || estado === 'bajo_pedido');
    return { estado, vendida, porEncargo, vendible: !vendida };
}

/** Predicado para FILTRAR las vendidas de un listado público (grilla/recos). */
export function esVendida(piece) {
    return estadoVisual(piece).vendida;
}
