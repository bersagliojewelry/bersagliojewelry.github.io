/**
 * envio-config.js — Motor de reglas del checkout (Wompi F2 / TODO-63), PURO y testeable.
 *
 * UNA fuente de verdad: el tipo de entrega decide a la vez (a) qué campos se muestran/
 * requieren y (b) si se puede pagar EN LÍNEA. Tanto el paso "Entrega" como "Pago" leen
 * el MISMO objeto → el invariante "internacional NUNCA cobra online" vive en un solo
 * lugar (comité conv.#2 + Antigravity). Sin estado, sin DOM: testeable con tabla.
 *
 * Tipos:
 *  - tienda        Recoger en el atelier (Cartagena). NO hay envío, pero Wompi exige
 *                  dirección+ciudad de FACTURACIÓN para el antifraude (Antigravity A2)
 *                  → se piden igual, rotuladas "datos de facturación".
 *  - nacional      Envío en Colombia. Dirección de envío + facturación.
 *  - internacional NO cobra en línea (Términos): se deriva a WhatsApp. Solo contacto+país.
 *
 * `legal_id` (docType+docNumber): obligatorio en tienda/nacional (DIAN/guía/factura +
 * antifraude Wompi en montos altos, Antigravity A1). En internacional NO (cierre por chat).
 */

export const TIPOS_ENTREGA = ['nacional', 'tienda', 'internacional'];   // nacional = default
export const DEFAULT_TIPO = 'nacional';

const CONTACTO = ['firstName', 'lastName', 'email', 'phone'];
const FACTURACION = ['docType', 'docNumber', 'city', 'address'];

const CONFIGS = {
    tienda: {
        label: 'Recoger en tienda',
        sub: 'En el atelier de Cartagena',
        titulo: 'Datos de facturación',
        nota: 'Pedimos ciudad y dirección por requisito de seguridad bancaria; no haremos envíos a esta dirección.',
        campos: [...CONTACTO, ...FACTURACION],
        requeridos: [...CONTACTO, ...FACTURACION],
        permitePagoOnline: true,
    },
    nacional: {
        label: 'Envío nacional',
        sub: 'A toda Colombia',
        titulo: 'Datos de envío',
        nota: 'El costo del envío se calcula según el destino y se confirma antes de despachar.',
        campos: [...CONTACTO, ...FACTURACION, 'zip'],
        requeridos: [...CONTACTO, ...FACTURACION],
        permitePagoOnline: true,
    },
    internacional: {
        label: 'Envío internacional',
        sub: 'Cierre por WhatsApp',
        titulo: 'Te atiende un asesor',
        nota: 'Los envíos internacionales se coordinan con un asesor por WhatsApp (no se cobran en línea).',
        campos: [...CONTACTO],
        requeridos: ['firstName', 'phone'],
        permitePagoOnline: false,
    },
};

/**
 * @param {string} tipo
 * @returns {{ tipo, label, sub, titulo, nota, campos:string[], requeridos:string[], permitePagoOnline:boolean }}
 */
export function getEnvioConfig(tipo) {
    const key = CONFIGS[tipo] ? tipo : DEFAULT_TIPO;
    return { tipo: key, ...CONFIGS[key] };
}

/** ¿Se muestra el campo en este tipo de entrega? */
export function campoVisible(tipo, name) {
    return getEnvioConfig(tipo).campos.includes(name);
}

/** ¿El campo es obligatorio en este tipo? (para no dejar `required` en campos ocultos — WCAG 3.3) */
export function campoRequerido(tipo, name) {
    return getEnvioConfig(tipo).requeridos.includes(name);
}

export default { TIPOS_ENTREGA, DEFAULT_TIPO, getEnvioConfig, campoVisible, campoRequerido };
