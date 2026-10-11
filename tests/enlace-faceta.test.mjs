/**
 * tests/enlace-faceta.test.mjs — El enlace interno a las facetas, y el pie que las publica.
 *
 * LA FUGA DE AUTORIDAD que esto cierra (medida el 2026-10-10 en el HTML servido):
 *   - Los seis azulejos de categoría de la portada apuntaban todos a `/colecciones.html?col=…`.
 *     Como `?col=` es un parámetro sobre una página cuya canónica es ella misma, los seis enlaces
 *     se consolidaban en UNA URL: las cinco páginas de categoría indexables y las cuatro de gema
 *     recibían CERO enlaces internos.
 *   - El pie sí las enlazaba las nueve, pero lo pinta JavaScript: `<div id="footer-mount"></div>`
 *     llegaba vacío en las 52 páginas servidas, así que para Google tampoco contaban.
 *   - Y los nueve destinos estaban escritos A MANO, cuando una faceta solo se hornea con
 *     `FACET_MIN` piezas pedibles y el build corre por cron diario: `cadenas` tenía 2 ese día.
 *     Una venta y el enlace que viaja en las 52 páginas se convierte en un 404.
 *
 * La regla, por tanto: el destino se DERIVA de las facetas que el build horneó de verdad, y la que
 * no está cae en la vista filtrada, que siempre existe.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { facetHref } from '../js/core/urls.js';
import { footerHTML } from '../js/components/footer-markup.js';
import { mergeGlobal } from '../js/core/global-defaults.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// El conjunto medido en producción el 2026-10-10: 5 colecciones + 4 gemas horneadas.
const HORNEADAS = {
    col:  ['anillos', 'aretes', 'cadenas', 'dijes', 'pulseras'],
    gema: ['diamante', 'esmeralda', 'rubi', 'zafiro'],
};

test('faceta horneada → URL limpia e indexable', () => {
    assert.equal(facetHref('col', 'anillos', HORNEADAS), '/coleccion/anillos.html');
    assert.equal(facetHref('gema', 'esmeralda', HORNEADAS), '/gema/esmeralda.html');
});

test('faceta NO horneada → vista filtrada, nunca un 404', () => {
    // El caso real: `argollas-de-matrimonio` tiene 0 piezas, su página da 404 y el azulejo de la
    // portada seguía apuntando ahí. Con esto cae en la vista filtrada, que siempre responde.
    assert.equal(facetHref('col', 'argollas-de-matrimonio', HORNEADAS),
        '/colecciones.html?col=argollas-de-matrimonio');
    assert.equal(facetHref('gema', 'topacio', HORNEADAS), '/colecciones.html?gema=topacio');
});

test('sin semilla de facetas NO se inventa una URL que podría no existir', () => {
    // Fail-safe: si el build no sembró nada (o el cliente carga antes), se prefiere la vista
    // filtrada —fea pero viva— a un enlace limpio que puede ser un 404.
    assert.equal(facetHref('col', 'anillos', { col: [], gema: [] }), '/colecciones.html?col=anillos');
});

test('un slug vacío no produce una URL rota', () => {
    assert.equal(facetHref('col', '', HORNEADAS), '/colecciones.html');
    assert.equal(facetHref('col', null, HORNEADAS), '/colecciones.html');
});

test('el slug va escapado en la URL (no se cuela un parámetro ajeno)', () => {
    const href = facetHref('col', 'a&b=c', HORNEADAS);
    assert.ok(!href.includes('&b=c'), `el slug debería ir codificado y salió: ${href}`);
    assert.match(href, /a%26b%3Dc/);
});

// ── El pie ────────────────────────────────────────────────────────────────────

const GLOBAL = mergeGlobal(null);

test('el pie enlaza las NUEVE facetas horneadas, con URL limpia', () => {
    const h = footerHTML(GLOBAL, HORNEADAS);
    for (const s of HORNEADAS.col)  assert.match(h, new RegExp(`/coleccion/${s}\\.html`), `falta /coleccion/${s}`);
    for (const s of HORNEADAS.gema) assert.match(h, new RegExp(`/gema/${s}\\.html`), `falta /gema/${s}`);
});

test('el pie NO publica un enlace a una faceta que este build no horneó', () => {
    // El escenario que de verdad va a pasar: se venden las piezas de `cadenas`, el cron reconstruye
    // y esa faceta deja de existir. El pie, que viaja en las 52 páginas, no puede seguir apuntando.
    const sinCadenas = { col: HORNEADAS.col.filter(s => s !== 'cadenas'), gema: HORNEADAS.gema };
    const h = footerHTML(GLOBAL, sinCadenas);
    assert.doesNotMatch(h, /\/coleccion\/cadenas\.html/,
        'una faceta caída no puede quedar enlazada desde el pie: sería un 404 en todo el sitio');
    assert.match(h, /colecciones\.html\?col=cadenas/, 'debe caer en la vista filtrada');
});

test('el pie lleva los enlaces a Nosotros, Contacto y el Journal', () => {
    const h = footerHTML(GLOBAL, HORNEADAS);
    for (const u of ['/nosotros.html', '/contacto.html', '/journal.html']) {
        assert.ok(h.includes(u), `el pie debería enlazar ${u}`);
    }
});

test('el pie es DETERMINISTA: el navegador repinta encima de lo horneado sin que se vea', () => {
    assert.equal(footerHTML(GLOBAL, HORNEADAS), footerHTML(GLOBAL, HORNEADAS));
});

test('el markup del pie es PURO: no se le cuela `data` ni el DOM', () => {
    // Si alguien vuelve a importar js/core/data.js aquí, el generador deja de poder hornear el pie
    // (arrastra la configuración de Firebase con import.meta.env, que en Node no existe) y las 52
    // páginas se quedan otra vez sin enlaces internos, en silencio.
    const src = readFileSync(join(ROOT, 'js/components/footer-markup.js'), 'utf8');
    assert.doesNotMatch(src, /from '\.\.\/core\/data\.js'/, 'footer-markup.js NO puede importar data.js');
    assert.doesNotMatch(src, /\bdocument\.|window\./, 'footer-markup.js NO puede tocar el DOM');
});

test('si el pie se hornea, la SEMILLA de facetas viaja en la misma página', () => {
    // EL CANDADO DE LA REGRESIÓN REAL (L-93). Se horneó el pie con sus nueve enlaces limpios y por
    // `curl` estaba perfecto; pero al abrir una ficha de pieza en el NAVEGADOR, el cliente
    // repintaba el pie llamando a `facetHref` sin datos —nunca se sembró `window.__BJ_FACETS`— y
    // los nueve caían a `?col=`. El HTML servido decía una cosa y el usuario veía otra.
    // Las dos inyecciones tienen que vivir en la misma función para que no se puedan separar.
    const gen = readFileSync(join(ROOT, 'scripts/generate-pieces.mjs'), 'utf8');
    const i = gen.indexOf('function bakeFooter');
    assert.ok(i > 0, 'falta bakeFooter');
    const cuerpo = gen.slice(i, gen.indexOf('\n}', i));
    assert.match(cuerpo, /footerHTML\(/, 'bakeFooter debe hornear el pie');
    assert.match(cuerpo, /__BJ_FACETS/,
        'bakeFooter debe sembrar window.__BJ_FACETS en la MISMA página: sin la semilla, el pie '
        + 'hidratado degrada a ?col= y lo horneado y lo visible dejan de coincidir');
});

// ── El rescate del 404 ────────────────────────────────────────────────────────

test('404.html rescata las facetas, presentes y futuras', () => {
    // Es la red bajo todo lo anterior: entre dos builds, o si alguien escribe la URL a mano, una
    // faceta que ya no existe tiene que caer en la vista filtrada y no en una página de error.
    const src = readFileSync(join(ROOT, 'public/404.html'), 'utf8');
    assert.match(src, /\(coleccion\|gema\)/, 'falta la rama de rescate de facetas');
    assert.match(src, /colecciones\.html\?/, 'el rescate debe llevar a la vista filtrada');
});
