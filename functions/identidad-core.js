/**
 * Bersaglio ERP — Núcleo de IDENTIDAD del cliente (F2.1, función PURA).
 *
 * Contrato CONGELADO de identidad (comité ×3, 2026-07-07 · spec 2026-07-07-f2-1-vinculo-cliente):
 * la clave canónica de un documento es `TIPO:NÚMERO` normalizado. Es el MISMO contrato que el
 * portal del cliente (F5) usará para el claim → cambiarlo es caro de revertir.
 *
 * Doctrina anti-divergencia (comité arquitecto FATAL-3): la normalización vive SOLO aquí (servidor).
 * El navegador NUNCA la ejecuta — manda el documento CRUDO y la Cloud Function normaliza. Espejarla
 * en el cliente produciría splits silenciosos (dos runtimes que divergen). Este módulo es PURO
 * (sin Firestore) para testear el contrato sin emulador.
 *
 * Privacidad (comité seguridad GRAVE-4): el índice `clientesPorDoc` se llavea por `docHash =
 * HMAC-SHA256(legalIdKey, PEPPER)`, NUNCA por la cédula en claro (que viajaría a logs/rutas/backups).
 * El PEPPER vive en Secret Manager. El `legalIdKey` crudo solo persiste como CAMPO protegido por reglas.
 */

'use strict';
const crypto = require('crypto');

// Tipos de documento aceptados (espeja la whitelist DOC_TYPES del checkout web).
// CC cédula · CE cédula extranjería · NIT empresa · PA pasaporte · TI tarjeta identidad · PPT permiso.
const DOC_TYPES = Object.freeze(['CC', 'CE', 'NIT', 'PA', 'TI', 'PPT']);

// Versión de la normalización. Si algún día cambia una regla de abajo, se sube esta versión y se
// migra el índice (spec §1.2) — nunca cambiar en silencio (rompería el reencuentro del cliente).
const NORM_VERSION = 1;

/**
 * Normaliza un documento a su clave canónica `TIPO:NÚMERO`. Devuelve `null` si es inválido
 * (tipo fuera de whitelist o número vacío tras normalizar) — nunca adivina.
 *
 * Reglas (congeladas, normVersion:1):
 *  - número → mayúsculas → quita `[.\-\s]` → conserva solo `[0-9A-Z]` (pasaportes traen letras).
 *  - NIT → descarta el dígito de verificación cuando viene como `-<dígito>` al final
 *    (`900.123.456-7` → canon `NIT:900123456`). Sin guion, no recorta nada.
 *  - tipo → de DOC_TYPES (case-insensitive); desconocido → null.
 *
 * @param {string} docType
 * @param {string|number} docNumber
 * @returns {string|null}
 */
function normalizeLegalId(docType, docNumber) {
    const type = String(docType == null ? '' : docType).trim().toUpperCase();
    if (!DOC_TYPES.includes(type)) return null;

    let raw = String(docNumber == null ? '' : docNumber).trim();
    // NIT: quitar el dígito de verificación escrito como "-<dígito>" al final ANTES de compactar.
    if (type === 'NIT') raw = raw.replace(/-\s*\d\s*$/, '');

    const num = raw.toUpperCase()
        .replace(/[.\-\s]/g, '')      // puntos, guiones, espacios
        .replace(/[^0-9A-Z]/g, '');   // solo alfanumérico
    if (!num) return null;

    return `${type}:${num}`;
}

/**
 * docHash = HMAC-SHA256(legalIdKey, pepper) en hex. Determinista (mismo pepper → mismo hash) →
 * sirve de ID del documento en el índice de reserva. Lanza si falta la clave o el pepper
 * (nunca hashea a ciegas: un pepper vacío haría el índice trivialmente reversible).
 *
 * @param {string} legalIdKey  clave canónica (salida de normalizeLegalId)
 * @param {string} pepper      secreto de Secret Manager (IDENTIDAD_PEPPER)
 * @returns {string} hex de 64 chars
 */
function docHash(legalIdKey, pepper) {
    if (!legalIdKey || !pepper) throw new Error('docHash: se requieren legalIdKey y pepper');
    return crypto.createHmac('sha256', pepper).update(legalIdKey).digest('hex');
}

/**
 * Compone {legalIdKey, docHash, normVersion} desde un documento crudo. `null` si inválido.
 * Es la puerta única servidor: recibe crudo, devuelve el par canónico + su hash.
 */
function docKeyAndHash(docType, docNumber, pepper) {
    const legalIdKey = normalizeLegalId(docType, docNumber);
    if (!legalIdKey) return null;
    return { legalIdKey, docHash: docHash(legalIdKey, pepper), normVersion: NORM_VERSION };
}

/**
 * Normaliza un teléfono para dedup blando: solo dígitos, y si es un celular CO con prefijo país
 * (57 + 10 dígitos) lo quita para que `+57 300…` y `300…` colisionen.
 */
function normalizePhone(phone) {
    const d = String(phone == null ? '' : phone).replace(/\D/g, '');
    if (d.length === 12 && d.startsWith('57')) return d.slice(2);
    return d;
}

/**
 * Normaliza un nombre para comparación blanda: minúsculas, sin tildes/diacríticos (plegado
 * agresivo: ñ→n para capturar "Muñoz"/"Munoz"), espacios colapsados. Un falso positivo solo
 * dispara el aviso "¿es la misma persona?" que Kary confirma — nunca fusiona sola.
 */
function normalizeName(name) {
    return String(name == null ? '' : name)
        .normalize('NFD').replace(/[̀-ͯ]/g, '')   // separa y quita diacríticos (é→e, ñ→n)
        .toLowerCase().trim().replace(/\s+/g, ' ');
}

module.exports = {
    DOC_TYPES,
    NORM_VERSION,
    normalizeLegalId,
    docHash,
    docKeyAndHash,
    normalizePhone,
    normalizeName,
};
