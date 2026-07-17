/**
 * analytics-pii.js — Guard anti-PII de la analítica. PURO y testeable (sin DOM, sin gtag).
 *
 * POR QUÉ (§189): `analytics.js` mandaba `email: e.detail` a GA4 en el lead de newsletter.
 * Eso es PII viajando a un tercero:
 *   - Los Términos de GA4 PROHÍBEN recibir PII → sanción = eliminación de datos/cuenta.
 *   - Ley 1581 (Habeas Data, CO): dato personal a un tercero sin base legal.
 *   - Y ocurría aunque el visitante RECHAZARA el banner: el consent gobierna las cookies,
 *     no el CONTENIDO del hit.
 *
 * El guard se aplica dentro de `track()` — el único paso obligado hacia gtag/fbq — para que
 * ningún callsite futuro pueda filtrar aunque su autor lo olvide (defensa por diseño, no por
 * disciplina). Vive aparte para poder testearlo sin navegador (mismo criterio que envio-config.js).
 *
 * REGLA CLAVE — claves EXACTAS, jamás substring: `item_name`/`content_name` son el nombre de la
 * JOYA y DEBEN pasar; son la atribución por producto, o sea el valor mismo de medir. Un filtro
 * por substring "name" los borraría → "arreglaríamos" la privacidad rompiendo la medición.
 */

/** Claves que NUNCA salen hacia GA4/Meta (comparadas en minúsculas, exactas). */
export const PII_KEYS = new Set([
    'email', 'mail', 'correo', 'e_mail',
    'phone', 'telefono', 'tel', 'celular', 'movil', 'whatsapp_number',
    'name', 'nombre', 'apellido', 'first_name', 'last_name', 'firstname', 'lastname',
    'username', 'user_name', 'password',
    'cedula', 'documento', 'doc_number', 'docnumber', 'nit', 'legal_id',
    'address', 'direccion', 'zip', 'ip',
]);

/** Email colado como VALOR en una clave no listada (defensa extra). */
export const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/;

/**
 * Devuelve una copia de `value` sin PII. Recursivo (cubre `items[]`). No muta la entrada.
 * @param {any} value
 * @returns {any}
 */
export function stripPII(value) {
    if (Array.isArray(value)) return value.map(stripPII);
    if (value && typeof value === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            if (PII_KEYS.has(String(k).toLowerCase())) continue;         // clave prohibida
            if (typeof v === 'string' && EMAIL_RE.test(v)) continue;     // email en clave rara
            out[k] = stripPII(v);
        }
        return out;
    }
    return value;
}

export default { PII_KEYS, EMAIL_RE, stripPII };
