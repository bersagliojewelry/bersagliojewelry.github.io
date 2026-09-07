/**
 * countries.js — Fuente ÚNICA de países para el checkout (Wompi F2 / TODO-63).
 *
 * Cada país: { iso2, nombre (es), code (indicativo telefónico), flag (emoji) }.
 * Clave primaria = ISO2 (el indicativo NO identifica unívocamente: +1 lo comparten
 * US/CA/PR/DO — comité+Antigravity). Colombia primero (default); resto alfabético.
 * El link de WhatsApp usa `code + número normalizado` (solo dígitos) → ver waPhone().
 */

export const COUNTRIES = [
    { iso2: 'CO', nombre: 'Colombia',            code: '57',  flag: '🇨🇴' },
    { iso2: 'DE', nombre: 'Alemania',            code: '49',  flag: '🇩🇪' },
    { iso2: 'AR', nombre: 'Argentina',           code: '54',  flag: '🇦🇷' },
    { iso2: 'AT', nombre: 'Austria',             code: '43',  flag: '🇦🇹' },
    { iso2: 'BE', nombre: 'Bélgica',             code: '32',  flag: '🇧🇪' },
    { iso2: 'BO', nombre: 'Bolivia',             code: '591', flag: '🇧🇴' },
    { iso2: 'BR', nombre: 'Brasil',              code: '55',  flag: '🇧🇷' },
    { iso2: 'CA', nombre: 'Canadá',              code: '1',   flag: '🇨🇦' },
    { iso2: 'CL', nombre: 'Chile',               code: '56',  flag: '🇨🇱' },
    { iso2: 'CR', nombre: 'Costa Rica',          code: '506', flag: '🇨🇷' },
    { iso2: 'CU', nombre: 'Cuba',                code: '53',  flag: '🇨🇺' },
    { iso2: 'DK', nombre: 'Dinamarca',           code: '45',  flag: '🇩🇰' },
    { iso2: 'EC', nombre: 'Ecuador',             code: '593', flag: '🇪🇨' },
    { iso2: 'SV', nombre: 'El Salvador',         code: '503', flag: '🇸🇻' },
    { iso2: 'ES', nombre: 'España',              code: '34',  flag: '🇪🇸' },
    { iso2: 'US', nombre: 'Estados Unidos',      code: '1',   flag: '🇺🇸' },
    { iso2: 'FR', nombre: 'Francia',             code: '33',  flag: '🇫🇷' },
    { iso2: 'GT', nombre: 'Guatemala',           code: '502', flag: '🇬🇹' },
    { iso2: 'HN', nombre: 'Honduras',            code: '504', flag: '🇭🇳' },
    { iso2: 'IE', nombre: 'Irlanda',             code: '353', flag: '🇮🇪' },
    { iso2: 'IT', nombre: 'Italia',              code: '39',  flag: '🇮🇹' },
    { iso2: 'MX', nombre: 'México',              code: '52',  flag: '🇲🇽' },
    { iso2: 'NI', nombre: 'Nicaragua',           code: '505', flag: '🇳🇮' },
    { iso2: 'NO', nombre: 'Noruega',             code: '47',  flag: '🇳🇴' },
    { iso2: 'NL', nombre: 'Países Bajos',        code: '31',  flag: '🇳🇱' },
    { iso2: 'PA', nombre: 'Panamá',              code: '507', flag: '🇵🇦' },
    { iso2: 'PY', nombre: 'Paraguay',            code: '595', flag: '🇵🇾' },
    { iso2: 'PE', nombre: 'Perú',                code: '51',  flag: '🇵🇪' },
    { iso2: 'PT', nombre: 'Portugal',            code: '351', flag: '🇵🇹' },
    { iso2: 'PR', nombre: 'Puerto Rico',         code: '1',   flag: '🇵🇷' },
    { iso2: 'GB', nombre: 'Reino Unido',         code: '44',  flag: '🇬🇧' },
    { iso2: 'DO', nombre: 'República Dominicana', code: '1',  flag: '🇩🇴' },
    { iso2: 'CH', nombre: 'Suiza',               code: '41',  flag: '🇨🇭' },
    { iso2: 'SE', nombre: 'Suecia',              code: '46',  flag: '🇸🇪' },
    { iso2: 'UY', nombre: 'Uruguay',             code: '598', flag: '🇺🇾' },
    { iso2: 'VE', nombre: 'Venezuela',           code: '58',  flag: '🇻🇪' },
];

export const DEFAULT_ISO2 = 'CO';

/** País por ISO2 (fallback Colombia). */
export function countryByIso2(iso2) {
    return COUNTRIES.find(c => c.iso2 === iso2) || COUNTRIES[0];
}

/**
 * Arma el teléfono para wa.me / Wompi: indicativo + número local SIN signos, espacios,
 * paréntesis ni cero/+ inicial. Devuelve solo dígitos (p.ej. "573001234567").
 */
export function waPhone(iso2, rawNumber) {
    const c = countryByIso2(iso2);
    let local = String(rawNumber || '').replace(/\D/g, '');   // solo dígitos
    local = local.replace(/^0+/, '');                          // quita ceros iniciales (troncal)
    if (!local) return '';
    // Si el usuario ya tecleó el indicativo al inicio, no lo dupliques.
    return local.startsWith(c.code) ? local : c.code + local;
}

export default { COUNTRIES, DEFAULT_ISO2, countryByIso2, waPhone };
