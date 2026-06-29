/**
 * Núcleo Wompi — lógica PURA (sin Firestore ni firebase-functions) → testeable con `node --test`
 * SIN emulador (L-17: la cripto del dinero se testea pura y determinista). Cubre la **firma de
 * integridad** del Widget (al iniciar el pago) y la **firma del evento** del webhook (al confirmar).
 *
 * Verificado vs doc Wompi + consejo externo (spec wompi-checkout §9/§11):
 *  - Firma de INTEGRIDAD: SHA256( reference + amount_in_cents + currency + [expiration_time] + secret )
 *    en hex, SIN separadores; expiration_time SOLO si se envía al Widget ("lo firmado == lo enviado").
 *  - Firma del EVENTO (webhook): SHA256( <valores de signature.properties EN ORDEN> + timestamp +
 *    EventsSecret ); las properties vienen en DOT-NOTATION ("transaction.amount_in_cents") → hay que
 *    resolver rutas anidadas, NO `body[prop]` (daría undefined → la firma siempre fallaría).
 */
const crypto = require('crypto');

// COP → centavos. Wompi exige `amount_in_cents` ENTERO; el COP no maneja decimales → COP × 100.
function montoEnCentavos(totalCop) {
    return Math.round(Math.max(0, Number(totalCop) || 0)) * 100;
}

// Firma de integridad del Widget (al CREAR la transacción).
function firmaIntegridad({ reference, amountInCents, currency = 'COP', expirationTime = null, integritySecret }) {
    if (!reference || !Number.isInteger(amountInCents) || amountInCents <= 0 || !integritySecret) {
        throw new Error('firmaIntegridad: requiere reference, amountInCents entero>0 e integritySecret.');
    }
    // SIN separadores; expiration_time solo si se envía (debe coincidir EXACTO con lo mandado al Widget).
    const base = `${reference}${amountInCents}${currency}${expirationTime || ''}${integritySecret}`;
    return crypto.createHash('sha256').update(base, 'utf8').digest('hex');
}

// Resuelve una ruta dot-notation ("transaction.amount_in_cents") sobre un objeto anidado.
function resolverRuta(obj, ruta) {
    return String(ruta).split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

/**
 * Valida la firma del EVENTO del webhook de Wompi (comparación de tiempo constante).
 * @param event  el body del webhook { data, signature:{properties[],checksum}, timestamp, ... }
 * @param eventsSecret  el "Secreto de Eventos" del panel.
 * @returns true si el checksum recalculado coincide; false si no (→ responder 401, no procesar).
 */
function verificarFirmaEvento(event, eventsSecret) {
    const props = event?.signature?.properties;
    const checksum = event?.signature?.checksum;
    const timestamp = event?.timestamp;
    if (!Array.isArray(props) || !props.length || !checksum || timestamp == null || !eventsSecret) return false;
    // Concatena los VALORES de las properties EN ORDEN (dot-notation) + timestamp + secreto.
    // Wompi: las properties son rutas DENTRO de `data` (p.ej. "transaction.id" → data.transaction.id).
    let base = '';
    for (const ruta of props) {
        const val = resolverRuta(event.data, ruta);
        if (val === undefined || val === null) return false;           // property declarada pero ausente → inválido
        base += String(val);
    }
    base += String(timestamp) + eventsSecret;
    const calc = crypto.createHash('sha256').update(base, 'utf8').digest('hex');
    // Comparación de tiempo constante (evita timing attacks); longitudes deben coincidir.
    const a = Buffer.from(calc, 'utf8');
    const b = Buffer.from(String(checksum), 'utf8');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { montoEnCentavos, firmaIntegridad, resolverRuta, verificarFirmaEvento };
