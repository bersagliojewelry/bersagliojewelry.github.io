/**
 * Bersaglio — saneo de URLs para atributos href/src (función PURA, testeable).
 *
 * ⚠️ `escape()` (js/core/html.js) solo HTML-encodea & < > " ' — NO neutraliza
 * `javascript:`/`data:`/`vbscript:` ni breakouts de CSS `url()`. Cuando el CMS
 * permita que un rol `editor` edite URLs (imágenes/links de journal/films/redes/
 * footer), un `javascript:alert(1)` sobreviviría `escape()` -> **stored-XSS contra
 * todos los visitantes** (repo público L-15 agrava: el atacante ve qué campo llega
 * a href/src). Lección: `escape()` es contexto-HTML; href/src/url() necesitan ESTO.
 *
 * Regla: rutas relativas same-origin (`/img/x`, `./`, `#`, `?`) son seguras;
 * con esquema, solo se permite la allow-list. Todo lo demás -> `fallback`.
 *
 * USO: en TODO punto donde un campo EDITABLE entra a href o src. Para fondos NO
 * interpolar en `style="background:url(...)"` (el contexto CSS permite breakouts
 * que ni esto cubre): usar `<img src="${safeUrl(x)}">` + object-fit:cover.
 */

const SAFE_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:'];

/** Devuelve `raw` si es una URL segura para href/src; si no, `fallback`. */
export function safeUrl(raw, fallback = '') {
    if (typeof raw !== 'string') return fallback;
    // Quitar TODO whitespace (espacios/tab/newline) — neutraliza la evasión
    // `java\tscript:` que el navegador tolera al resolver el esquema. Una URL
    // legítima no lleva whitespace crudo (iría percent-encoded).
    const s = raw.replace(/\s+/g, '').trim();
    if (!s) return fallback;
    // Same-origin / relativo / fragmento / query -> seguro (no hay esquema).
    if (/^[/#?]/.test(s) || /^\.{1,2}\//.test(s)) return s;
    // Con (posible) esquema: parsear y validar contra la allow-list.
    try {
        const u = new URL(s, 'https://bersagliojewelry.co');
        return SAFE_SCHEMES.includes(u.protocol) ? s : fallback;
    } catch {
        return fallback;
    }
}

/** Conveniencia: ¿es segura? (para gating en validadores/UI). */
export function isSafeUrl(raw) {
    return safeUrl(raw, ' ') !== ' ';
}

// ─── LQIP (placeholder difuso, §103 F1) ─────────────────────────────────────
// Un LQIP es un data-URI de imagen base64 MINÚSCULO que generamos nosotros
// (image-optimizer.makeLqip) y guardamos junto a la URL para pintar un fondo
// borroso al instante (blur-up). `safeUrl` lo RECHAZA a propósito (data: no está
// en su allow-list); este validador es su contraparte para el contexto data:image.
//
// Por qué es seguro en `style="background-image:url('...')"` (lo que safe-url.js
// desaconseja para URLs editables): el regex EXIGE el alfabeto base64 puro
// (`[A-Za-z0-9+/=]`) tras el prefijo → es IMPOSIBLE que contenga comilla, paréntesis
// o whitespace → no hay breakout del `url()`. Más estricto aún que `safeUrl`. El cap
// de tamaño corta un LQIP anómalo (uno legítimo de ~40px pesa ~1-3 KB).
const LQIP_RE  = /^data:image\/(?:webp|avif|jpeg|png);base64,[A-Za-z0-9+/=]+$/;
const LQIP_MAX = 6000;   // chars; espejo del guard en image-optimizer.makeLqip

/** Devuelve el data-URI si es un LQIP válido y acotado; si no, `fallback` (''). */
export function safeLqip(raw, fallback = '') {
    if (typeof raw !== 'string' || raw.length > LQIP_MAX) return fallback;
    return LQIP_RE.test(raw) ? raw : fallback;
}
