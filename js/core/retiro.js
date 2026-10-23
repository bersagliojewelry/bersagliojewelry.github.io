/**
 * js/core/retiro.js — RETIRO DEL POSICIONAMIENTO (TODO-99 · cerebro `49a` · Daniel, 20-oct-2026).
 *
 * El proyecto está en pausa por impago: la web SIGUE VIVA por el dominio, pero fuera de buscadores e IA.
 * Un solo interruptor para todo lo que hace el código:
 *   - el barrido final del build (`scripts/retiro-posicionamiento.mjs`) pone `noindex` en cada página,
 *     quita el JSON-LD y saca del `dist` el sitemap y `llms.txt`;
 *   - `injectSchema` (js/core/schema.js) deja de inyectar JSON-LD en el navegador.
 * El `robots.txt` (bots de IA bloqueados, sin `Sitemap:`) es un fichero aparte de `public/`.
 *
 * REVERTIR (si retoman): `RETIRO_POSICIONAMIENTO = false` + el `robots.txt` anterior (git) + deploy.
 * Los ficheros de origen (`public/sitemap.xml`, `public/llms.txt`, las metas de cada página) NO se
 * tocaron: con el interruptor apagado vuelve exactamente lo de antes.
 *
 * Es browser-safe a propósito (sin `fs`): lo importan el navegador y el build.
 */

export const RETIRO_POSICIONAMIENTO = true;

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
