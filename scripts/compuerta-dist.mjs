/**
 * scripts/compuerta-dist.mjs — LA COMPUERTA DEL DIST (cerebro `49b §3.3`).
 *
 * Corre en `deploy.yml` después de `npm run generate` y antes de subir el `dist` a Pages. Si algo no
 * cuadra, sale con 1 y el despliegue se para: producción se queda en el último build bueno.
 *
 * POR QUÉ EXISTE. El SSG voltea a `index, follow` cada página que debe salir en Google (fichas, facetas,
 * listados, Journal) reemplazando el `noindex` de su shell con `replaceOnce`. Si un rediseño mueve esa
 * ancla, `replaceOnce` devuelve el HTML intacto y la página se publica con `noindex`, sin un solo aviso.
 * Lo mismo si el sitemap o `llms.txt` no llegan al `dist`. Es el accidente más caro del SEO y era mudo:
 * nada miraba el `dist` antes de publicarlo.
 *
 * QUÉ MIRA, según el interruptor del retiro (`js/core/retiro.js`):
 *   - APAGADO (lo de hoy): `sitemap.xml` (con URLs) y `llms.txt` (no vacío) en el `dist`, y cada URL del
 *     sitemap es de bersagliojewelry.co, existe en el `dist` y no lleva `noindex` (ni `none`) en una meta
 *     robots/googlebot/bingbot. Las páginas fuera del sitemap (el panel, el carrito…) no se miran: su
 *     `noindex` es legítimo.
 *   - ENCENDIDO: lo contrario — sin sitemap ni `llms.txt`, y toda página con `<head>` lleva `noindex` (la
 *     verificación de Search Console no tiene `<head>` y se salta, como en `barrerDist`).
 *
 * Uso: node scripts/compuerta-dist.mjs [carpeta]   (por defecto, el dist/ del repo)
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { RETIRO_POSICIONAMIENTO } from '../js/core/retiro.js';

const SITIO = 'https://bersagliojewelry.co';
const PUBLICADOS = ['sitemap.xml', 'llms.txt'];

// Valor de un atributo, con comillas dobles, simples o sin comillas (HTML válido las tres).
function atributo(etiqueta, nombre) {
    const m = etiqueta.match(new RegExp(`\\s${nombre}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, 'i'));
    return m ? (m[1] ?? m[2] ?? m[3]) : null;
}

/** Las directivas de cada meta robots/googlebot/bingbot de la página, una a una y en minúsculas. */
function directivasRobots(html) {
    const out = [];
    for (const [etiqueta] of html.matchAll(/<meta\b[^>]*>/gi)) {
        const nombre = atributo(etiqueta, 'name');
        if (!nombre || !/^(?:robots|googlebot|bingbot)$/i.test(nombre.trim())) continue;
        out.push(...(atributo(etiqueta, 'content') || '').split(',').map((d) => d.trim().toLowerCase()));
    }
    return out;
}

/**
 * ¿La página les pide a los buscadores que no la indexen? `none` equivale a `noindex, nofollow`. Se compara
 * directiva por directiva, no con una búsqueda de texto: `max-image-preview:none` NO es un noindex.
 */
export function pideNoindex(html) {
    return directivasRobots(html).some((d) => d === 'noindex' || d === 'none');
}

const XML = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" };
const urlsDelSitemap = (xml) => [...xml.matchAll(/<loc>\s*([^<]*?)\s*<\/loc>/gi)]
    .map((m) => m[1].replace(/&(amp|lt|gt|quot|apos|#39);/g, (_, e) => XML[e]));

/** El fichero del dist que sirve esa URL (`/` → `index.html`), o null si la URL no es de este sitio. */
function archivoDe(loc) {
    let u;
    try { u = new URL(loc); } catch { return null; }
    if (u.origin !== SITIO) return null;
    let ruta = u.pathname;
    try { ruta = decodeURIComponent(ruta); } catch { /* se queda codificada */ }
    if (ruta.endsWith('/')) ruta += 'index.html';
    return ruta.replace(/^\/+/, '');
}

function paginasHtml(dist) {
    const out = [];
    (function recorrer(dir) {
        for (const nombre of readdirSync(dir)) {
            const ruta = join(dir, nombre);
            if (statSync(ruta).isDirectory()) recorrer(ruta);
            else if (nombre.endsWith('.html')) out.push(ruta);
        }
    })(dist);
    return out;
}

/**
 * Revisa un `dist` ya generado. Devuelve `{ fallos, paginas }`: los fallos en castellano (vacío = se puede
 * publicar) y cuántas páginas se revisaron. `retiro` es el interruptor; por defecto, el de `js/core/retiro.js`.
 */
export function revisarDist(dist, { retiro = RETIRO_POSICIONAMIENTO } = {}) {
    if (!existsSync(dist) || !statSync(dist).isDirectory()) {
        return { fallos: [`no existe la carpeta ${dist}: el build no llegó a hacerse`], paginas: 0 };
    }
    const fallos = [];
    let paginas = 0;

    if (retiro) {
        for (const f of PUBLICADOS) {
            if (existsSync(join(dist, f))) fallos.push(`${f} está publicado y el retiro está ENCENDIDO: debía salir del dist`);
        }
        for (const ruta of paginasHtml(dist)) {
            const html = readFileSync(ruta, 'utf-8');
            if (!/<head[\s>]/i.test(html)) continue;
            paginas++;
            if (!pideNoindex(html)) {
                fallos.push(`${relative(dist, ruta).split(sep).join('/')} es indexable y el retiro está ENCENDIDO`);
            }
        }
        return { fallos, paginas };
    }

    for (const f of PUBLICADOS) {
        const ruta = join(dist, f);
        if (!existsSync(ruta)) fallos.push(`falta ${f} en el dist`);
        else if (!readFileSync(ruta, 'utf-8').trim()) fallos.push(`${f} está vacío`);
    }
    const rutaSitemap = join(dist, 'sitemap.xml');
    if (!existsSync(rutaSitemap)) return { fallos, paginas };
    const urls = urlsDelSitemap(readFileSync(rutaSitemap, 'utf-8'));
    if (!urls.length) {
        fallos.push('sitemap.xml no anuncia ni una URL');
        return { fallos, paginas };
    }
    for (const loc of urls) {
        const archivo = archivoDe(loc);
        if (!archivo) { fallos.push(`sitemap.xml anuncia una URL de otro dominio: ${loc}`); continue; }
        const ruta = join(dist, ...archivo.split('/'));
        if (!existsSync(ruta) || statSync(ruta).isDirectory()) {
            fallos.push(`sitemap.xml anuncia ${loc}, que no está en el dist (${archivo}): sería un 404`);
            continue;
        }
        paginas++;
        if (pideNoindex(readFileSync(ruta, 'utf-8'))) fallos.push(`${archivo} está en el sitemap y lleva noindex`);
    }
    return { fallos, paginas };
}

// ── La orden (la que corre deploy.yml) ───────────────────────────────────────────────────────────
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    const dist = resolve(process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '..', 'dist'));
    const estado = RETIRO_POSICIONAMIENTO ? 'retiro ENCENDIDO' : 'retiro apagado';
    const { fallos, paginas } = revisarDist(dist);
    if (fallos.length) {
        console.error(`❌ COMPUERTA DEL DIST (${estado}): ${fallos.length} fallo(s). NO se publica; producción se queda en el último build bueno.`);
        for (const f of fallos) console.error(`   · ${f}`);
        console.error('   Por qué existe y qué mira: cabecera de scripts/compuerta-dist.mjs (cerebro 49b §3.3).');
        process.exit(1);
    }
    console.log(RETIRO_POSICIONAMIENTO
        ? `✅ Compuerta del dist (${estado}): sin sitemap ni llms.txt, y ${paginas} página(s) con noindex.`
        : `✅ Compuerta del dist (${estado}): sitemap.xml y llms.txt publicados, y las ${paginas} página(s) del sitemap son indexables.`);
}
