/**
 * js/core/retiro.js — EL INTERRUPTOR DEL POSICIONAMIENTO (cerebro `49a`).
 *
 * ESTADO: APAGADO desde el 24-nov-2026. Daniel volvió a trabajar con Bersaglio y ordenó encender el
 * posicionamiento; la web vuelve a salir indexable, con su JSON-LD, su sitemap y su `llms.txt`.
 * (Estuvo ENCENDIDO del 22-oct al 24-nov-2026: pausa por impago, TODO-99.)
 *
 * Un solo interruptor para todo lo que hace el código. Con `true`:
 *   - el barrido final del build (`scripts/retiro-posicionamiento.mjs`) pone `noindex` en cada página,
 *     quita el JSON-LD y saca del `dist` el sitemap y `llms.txt`;
 *   - `injectSchema` (js/core/schema.js) deja de inyectar JSON-LD en el navegador.
 * El `robots.txt` (bots de IA bloqueados, sin `Sitemap:`) es un fichero aparte de `public/`.
 * Los ficheros de origen (`public/sitemap.xml`, `public/llms.txt`, las metas de cada página) nunca se
 * tocaron: por eso apagarlo devuelve exactamente lo de antes.
 *
 * VOLVER A RETIRAR: devolver tres ficheros a como estaban en el commit del retiro (`ea8e2ef`): este
 * interruptor, `public/robots.txt` y `tests/retiro-posicionamiento.test.mjs`. El service worker NO se
 * revierte: su `CACHE_NAME` siempre sube al número siguiente. Después, desplegar.
 * El test fija el estado declarado: un `true` aquí lo pone en rojo, para que nunca pase por accidente.
 *
 * Es browser-safe a propósito (sin `fs`): lo importan el navegador y el build.
 */

export const RETIRO_POSICIONAMIENTO = false;

export const ROBOTS_RETIRO = 'noindex, nofollow, noarchive, nosnippet, noimageindex';

// Todas las metas robots (y las de googlebot/bingbot, por si un día aparecen), con su salto de línea.
const META_ROBOTS = /[ \t]*<meta\s+name=["'](?:robots|googlebot|bingbot)["'][^>]*>[ \t]*\r?\n?/gi;
// Todo bloque JSON-LD, con o sin `id`, en una línea o en varias.
const LD_JSON = /[ \t]*<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>[ \t]*\r?\n?/gi;

/**
 * Deja una página HTML fuera de buscadores: UNA meta robots con la orden del retiro y cero JSON-LD.
 * Lo que no tiene `<head>` (la verificación de Search Console) sale intacto. Es idempotente.
 * Los reemplazos van con función: una cadena de reemplazo expandiría `$&` y compañía (ver el
 * SSG_SELFTEST de generate-pieces).
 */
export function retirarDeBuscadores(html) {
    if (!/<head[\s>]/i.test(html)) return html;
    const meta = `<meta name="robots" content="${ROBOTS_RETIRO}">`;
    const limpio = html.replace(LD_JSON, () => '').replace(META_ROBOTS, () => '');
    return limpio.replace(/<head\b[^>]*>/i, (m) => `${m}\n    ${meta}`);
}
