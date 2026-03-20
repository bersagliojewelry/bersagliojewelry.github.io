/**
 * Bersaglio Jewelry — Wompi Checkout Integration
 *
 * Integración con el widget de Wompi para pagos en línea.
 * Usa la llave pública de sandbox para pruebas.
 *
 * Uso:
 *   import { wompiCheckout } from './checkout.js';
 *   wompiCheckout.pay(pieces);  // abre el widget de Wompi
 */

const WOMPI_PUBLIC_KEY = 'pub_test_wvDY7iLAIUXx0QKzrOw2a0MFVZngXSZL';
const CURRENCY = 'COP';

/**
 * Genera una referencia única para la transacción.
 * Formato: BJ-<timestamp>-<random>
 */
function generateReference() {
    const ts   = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 8);
    return `BJ-${ts}-${rand}`.toUpperCase();
}

/**
 * Formatea un valor en pesos colombianos.
 * @param {number} amount — valor en pesos (no centavos)
 * @returns {string}
 */
function formatCOP(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Calcula el resumen del carrito.
 * @param {Array} pieces — piezas del carrito (objetos del catálogo)
 * @returns {{ pricedItems: Array, unpricedItems: Array, totalCents: number, totalFormatted: string }}
 */
function cartSummary(pieces) {
    const pricedItems   = pieces.filter(p => p.price != null && p.price > 0);
    const unpricedItems = pieces.filter(p => p.price == null || p.price <= 0);
    const total         = pricedItems.reduce((sum, p) => sum + p.price, 0);

    return {
        pricedItems,
        unpricedItems,
        totalCents:     total * 100,
        totalFormatted: formatCOP(total),
    };
}

/**
 * Abre el widget de Wompi para procesar el pago.
 * @param {Array} pieces — piezas con precio del carrito
 * @param {Function} [onSuccess] — callback al completar el pago
 */
function openWompiWidget(pieces, onSuccess) {
    const summary   = cartSummary(pieces);
    const reference = generateReference();

    if (summary.totalCents <= 0) {
        console.warn('[Wompi] No hay piezas con precio para pagar.');
        return;
    }

    // Guardar referencia y piezas en sessionStorage para la página de confirmación
    sessionStorage.setItem('bersaglio_checkout', JSON.stringify({
        reference,
        pieces: summary.pricedItems.map(p => ({ slug: p.slug, name: p.name, price: p.price })),
        total: summary.totalCents / 100,
    }));

    // Construir URL de redirección
    const baseUrl     = window.location.origin;
    const redirectUrl = `${baseUrl}/gracias.html`;

    // eslint-disable-next-line no-undef
    const checkout = new WidgetCheckout({
        currency:      CURRENCY,
        amountInCents: summary.totalCents,
        reference:     reference,
        publicKey:     WOMPI_PUBLIC_KEY,
        redirectUrl:   redirectUrl,
    });

    checkout.open(function (result) {
        const transaction = result.transaction;
        console.log('[Wompi] Transacción:', transaction.id, transaction.status);

        if (onSuccess && transaction.status === 'APPROVED') {
            onSuccess(transaction);
        }
    });
}

export const wompiCheckout = {
    pay: openWompiWidget,
    summary: cartSummary,
    formatCOP,
    WOMPI_PUBLIC_KEY,
};

export default wompiCheckout;
