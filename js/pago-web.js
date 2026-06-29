/**
 * pago-web.js — Cobro web con el Widget de Wompi (Wompi F2 · "Comprar ahora", 1 pieza).
 *
 * Aísla la pasarela de la vista (carrito.js): genera el `pedidoId` (idempotencia), pide a la CF
 * `iniciarPagoWeb` la reserva + el total + la FIRMA (server-side; el navegador NUNCA firma), y abre
 * el Widget de Wompi (checkout.wompi.co). La VERDAD del pago la da el webhook (no el callback ni el
 * redirect): `gracias.html` solo muestra estado. El flag de activación vive en el callsite (carrito.js).
 */
import { iniciarPagoWeb } from './pedidos-service.js';

const WIDGET_SRC = 'https://checkout.wompi.co/widget.js';
const TOPE_TX_COP = 2500000;   // espeja el tope server-side (solo para no ofrecer la opción si no aplica)

// Elegibilidad para "Pagar ahora" (el server RE-VALIDA; esto solo decide si MOSTRAR la opción).
// Disponible AHORA = hay una unidad física para reservar → espeja `consumeUnidad` del server
// (pedidos-core: finito* con cantidad>0; encargo/cantidad null = a fabricar, NO "pagar ahora").
// ⚠️ Se mide por `cantidad`, NO por `available`: el doc VIVO de Firestore (lo que lee data.js) y el
// catalogo.json del SSG traen ambos `cantidad`, pero `available` SOLO lo inyecta el SSG → con datos
// vivos el botón nunca aparecía (gap cazado en el gate live, gate empírico §11.4).
export function wompiEligible(piece, total) {
    return !!piece
        && Number.isInteger(piece.cantidad) && piece.cantidad > 0
        && typeof piece.price === 'number' && piece.price > 0
        && total > 0 && total <= TOPE_TX_COP;
}

let _widget = null;
function cargarWidget() {
    if (_widget) return _widget;
    _widget = new Promise((resolve, reject) => {
        if (window.WidgetCheckout) return resolve();
        const s = document.createElement('script');
        s.src = WIDGET_SRC;
        s.async = true;
        s.onload = () => (window.WidgetCheckout ? resolve() : reject(new Error('Widget de Wompi no disponible.')));
        s.onerror = () => reject(new Error('No se pudo cargar el pago seguro de Wompi.'));
        document.head.appendChild(s);
    });
    return _widget;
}

function nuevoPedidoId() {
    try { if (window.crypto?.randomUUID) return window.crypto.randomUUID(); } catch {}
    return `web-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
}

/**
 * Inicia y abre el cobro de UNA pieza. Resuelve cuando el widget se cierra (con o sin pago);
 * la confirmación REAL la hace el webhook → `gracias.html?ref=` lee el estado.
 * @param {{ pieceId:string, shipping?:object, redirectBase?:string }} args
 * @returns {Promise<{ reference:string, transaction?:object }>}
 */
export async function pagarConWompi({ pieceId, shipping, redirectBase }) {
    if (!pieceId) throw new Error('Falta la pieza.');
    const res = await iniciarPagoWeb({ pedidoId: nuevoPedidoId(), pieceId, shipping });
    if (!res?.signature || !res?.publicKey || !res?.amountInCents) {
        throw new Error('No se pudo iniciar el pago.');
    }
    await cargarWidget();
    const base = redirectBase || (typeof location !== 'undefined' ? location.origin : '');
    const checkout = new window.WidgetCheckout({
        currency: res.currency || 'COP',
        amountInCents: res.amountInCents,
        reference: res.reference,
        publicKey: res.publicKey,
        signature: { integrity: res.signature },
        redirectUrl: `${base}/gracias.html?ref=${encodeURIComponent(res.reference)}`,
    });
    return new Promise((resolve) => {
        checkout.open((result) => resolve({ reference: res.reference, transaction: result?.transaction }));
    });
}

export default { wompiEligible, pagarConWompi };
