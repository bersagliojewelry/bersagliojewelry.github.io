/**
 * pago-web.js — Cobro web con Wompi (F2 · "Comprar ahora", 1 pieza) por REDIRECCIÓN.
 *
 * TODO-63 (comité + Antigravity #5): se usa el Web Checkout por REDIRECCIÓN a checkout.wompi.co
 * (página segura de Wompi, responsive y robusta) en vez del Widget modal embebido — el modal fallaba
 * en navegadores in-app (Instagram/TikTok) con 3D Secure y se veía enorme en desktop.
 *
 * Aísla la pasarela de la vista (carrito.js): pide a la CF `iniciarPagoWeb` la reserva + el total + la
 * FIRMA (server-side; el navegador NUNCA firma), arma la URL de Wompi y NAVEGA. La VERDAD del pago la
 * da el WEBHOOK (no el redirect): `gracias.html?ref=…&id=…` solo muestra el estado.
 */
import { iniciarPagoWeb } from './pedidos-service.js';
import { waPhone } from './core/countries.js';

const WOMPI_CHECKOUT = 'https://checkout.wompi.co/p/';
const TOPE_TX_COP = 2500000;   // espeja el tope server-side (solo para no ofrecer la opción si no aplica)
const PEDIDO_KEY = 'bj_wompi_pedido_';   // + pieceId → pedidoId reusable (A.2 reintento)

// Elegibilidad para "Pagar ahora" (el server RE-VALIDA; esto solo decide si MOSTRAR la opción).
// Se mide por `cantidad` (doc vivo), NO por `available` (que solo lo inyecta el SSG) — gap del gate live (§11.4).
export function wompiEligible(piece, total) {
    return !!piece
        && Number.isInteger(piece.cantidad) && piece.cantidad > 0
        && typeof piece.price === 'number' && piece.price > 0
        && total > 0 && total <= TOPE_TX_COP;
}

function nuevoPedidoId() {
    try { if (window.crypto?.randomUUID) return window.crypto.randomUUID(); } catch {}
    return `web-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
}

// A.2 (reintento reserva): el pedidoId se PERSISTE por pieza (sessionStorage) y se REUSA en cada
// clic → un reintento tras DECLINED/cancelar reusa la MISMA reserva (path idempotente del server)
// en vez de crear un pedido nuevo cuya reserva chocaría con la propia ("agotada" ~18 min).
function pedidoIdPara(pieceId) {
    try {
        const k = PEDIDO_KEY + pieceId;
        let id = sessionStorage.getItem(k);
        if (!id) { id = nuevoPedidoId(); sessionStorage.setItem(k, id); }
        return id;
    } catch { return nuevoPedidoId(); }
}
function limpiarPedido(pieceId) {
    try { sessionStorage.removeItem(PEDIDO_KEY + pieceId); } catch { /* noop */ }
}

// Arma la query del Web Checkout SIN codificar los dos puntos de las claves (`signature:integrity`,
// `customer-data:*`) — Wompi los espera literales; solo se codifican los VALORES.
function kv(key, value) {
    return value == null || value === '' ? null : `${key}=${encodeURIComponent(value)}`;
}

/**
 * Inicia (reserva + firma) y REDIRIGE a la página de pago de Wompi. No resuelve (la página navega);
 * el webhook confirma y `gracias.html` lee el estado al volver.
 * @param {{ pieceId:string, shipping?:object, habeas?:object, redirectBase?:string }} args
 */
export async function pagarConWompi({ pieceId, shipping, tipoEntrega, habeas, redirectBase }) {
    if (!pieceId) throw new Error('Falta la pieza.');
    // A.2: reusa el pedidoId guardado; si el server responde "reserva-no-vigente" (el pedido guardado
    // ya expiró/se pagó/se canceló) se regenera UNA vez con un pedidoId nuevo.
    let res;
    try {
        res = await iniciarPagoWeb({ pedidoId: pedidoIdPara(pieceId), pieceId, shipping, tipoEntrega, habeas });
    } catch (err) {
        if (/reserva-no-vigente/.test(err?.message || '')) {
            limpiarPedido(pieceId);
            res = await iniciarPagoWeb({ pedidoId: pedidoIdPara(pieceId), pieceId, shipping, tipoEntrega, habeas });
        } else {
            throw err;
        }
    }
    if (!res?.signature || !res?.publicKey || !res?.amountInCents) {
        throw new Error('No se pudo iniciar el pago.');
    }
    // §164: el comprador es invitado (sin cuenta) → su COMPROBANTE se deja en sessionStorage para que
    // gracias.html lo muestre al volver de Wompi (misma pestaña). §166: el comprobante es el CÓDIGO
    // público BJ-XXXX-XXXX — la CF ya no expone el correlativo interno al navegador.
    try { sessionStorage.setItem('bj-ultimo-pago', JSON.stringify({ codigo: res.codigo, pedidoId: res.reference, publicKey: res.publicKey })); } catch {}
    const base = redirectBase || (typeof location !== 'undefined' ? location.origin : '');
    const sh = shipping || {};
    const fullName = `${sh.firstName || ''} ${sh.lastName || ''}`.trim();
    const parts = [
        kv('public-key', res.publicKey),
        kv('currency', res.currency || 'COP'),
        kv('amount-in-cents', String(res.amountInCents)),
        kv('reference', res.reference),
        kv('signature:integrity', res.signature),
        kv('redirect-url', `${base}/gracias.html?ref=${encodeURIComponent(res.reference)}`),
        kv('expiration-time', res.expirationTime),
        // customer-data: mejora el antifraude de Wompi; el legal_id es clave en montos altos (Antigravity A1).
        kv('customer-data:email', sh.email),
        kv('customer-data:full-name', fullName),
        // A.8: teléfono con indicativo internacional (waPhone) — sin +57 el antifraude Wompi lo puntúa peor.
        kv('customer-data:phone-number', waPhone(sh.countryIso2, sh.phone) || sh.phone),
        kv('customer-data:legal-id', sh.docNumber),
        kv('customer-data:legal-id-type', sh.docType),
    ].filter(Boolean);
    window.location.href = `${WOMPI_CHECKOUT}?${parts.join('&')}`;
    return new Promise(() => {});   // la navegación se va de la página; intencionalmente no resuelve
}

export default { wompiEligible, pagarConWompi };
