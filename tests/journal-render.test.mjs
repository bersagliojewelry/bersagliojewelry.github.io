/**
 * tests/journal-render.test.mjs — El motor del artículo del Journal (js/data/journal-render.js).
 *
 * Qué defiende, y por qué se escribió el 2026-10-10:
 *   1. EL TECHO TÉCNICO (TODO-92). El cuerpo del artículo solo vivía dentro de `<noscript>` y el
 *      renderizador de Google —que ejecuta JS y por tanto lo descarta— fotografió «Cargando la
 *      entrada…». Lo que hace que eso no vuelva es que haya UN motor de render, puro, que el
 *      navegador y el build importen igual. Si alguien vuelve a escribir el markup a mano en el
 *      generador, los dos lados divergen y el repintado al hidratar se ve como un salto.
 *   2. LOS SUBTÍTULOS. El motor partía por líneas en blanco y envolvía todo en `<p>`: cero `<h2>`
 *      en los seis artículos. Ahora `## ` es un subtítulo, en los dos renderizadores.
 *   3. EL `<title>`. El generador horneaba «… · Journal · Bersaglio Jewelry Cartagena» y el
 *      navegador lo pisaba con «… · The Bersaglio Journal», quitándole la ciudad, que es la
 *      palabra con la que la gente busca. Una sola fórmula, y un test que lo clava.
 *   4. EL ESCAPADO. El cuerpo lo escribe una persona en un `<textarea>` del panel. El marcado se
 *      decide antes de escapar y se aplica después: nada tecleado ahí puede salir como HTML.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
    bodyBlocks, renderBody, renderArticle, relatedFrom, entryHref, entryTitleTag,
} from '../js/data/journal-render.js';

const ENTRADA = {
    slug: 'anillo', section: 'Guía de compra', kicker: 'Compromiso',
    title: 'Anillos de compromiso en Cartagena', excerpt: 'Resumen',
    body: 'Primer párrafo.\n\nSegundo párrafo.',
    date: '11·07·26', dateLong: 'Julio 2026', read: '5 min',
    author: 'Kary Mendoza', authorRole: 'Diseñadora',
    image: 'https://x/y.webp',
};

// ── 1. Bloques del cuerpo ──────────────────────────────────────────────────────

test('cuerpo: los párrafos se separan por línea en blanco, como siempre', () => {
    const b = bodyBlocks('Uno.\n\nDos.\n\nTres.');
    assert.deepEqual(b.map(x => x.type), ['p', 'p', 'p']);
    assert.deepEqual(b.map(x => x.text), ['Uno.', 'Dos.', 'Tres.']);
});

test('cuerpo: una línea `## ` es un SUBTÍTULO, no un párrafo', () => {
    const b = bodyBlocks('Intro.\n\n## Por dónde empezar\n\nLa gema manda.');
    assert.deepEqual(b, [
        { type: 'p',  text: 'Intro.' },
        { type: 'h2', text: 'Por dónde empezar' },
        { type: 'p',  text: 'La gema manda.' },
    ]);
});

test('cuerpo: el subtítulo pegado a su párrafo con un solo salto también se separa', () => {
    // Es el error de tecleo más probable de quien escribe en el panel sin saber Markdown.
    const b = bodyBlocks('## La talla\nSe pregunta sin preguntar.');
    assert.deepEqual(b, [
        { type: 'h2', text: 'La talla' },
        { type: 'p',  text: 'Se pregunta sin preguntar.' },
    ]);
});

test('cuerpo: `##` sin espacio NO es subtítulo (la marca es explícita, no se adivina)', () => {
    const b = bodyBlocks('##pegado');
    assert.deepEqual(b, [{ type: 'p', text: '##pegado' }]);
});

test('cuerpo: los seis artículos publicados hoy no usan la marca → nada cambia para ellos', () => {
    // Medido el 2026-10-10 contra Firestore: ninguno de los 6 cuerpos contiene `## `.
    const b = bodyBlocks('Pocas decisiones se sienten tan grandes.\n\nEmpieza por la gema.');
    assert.equal(b.filter(x => x.type === 'h2').length, 0);
    assert.equal(b.length, 2);
});

test('cuerpo: vacío o nulo no reventa y no inventa bloques', () => {
    assert.deepEqual(bodyBlocks(''), []);
    assert.deepEqual(bodyBlocks(null), []);
    assert.deepEqual(bodyBlocks(undefined), []);
    assert.deepEqual(bodyBlocks('   \n\n  \n'), []);
});

// ── 2. Render del cuerpo ───────────────────────────────────────────────────────

test('render: el `## ` sale como <h2> de verdad', () => {
    const h = renderBody({ body: 'Intro.\n\n## Qué dice el certificado\n\nEsto.' });
    assert.match(h, /<h2 class="en-body-h2">Qué dice el certificado<\/h2>/);
    assert.doesNotMatch(h, /<p class="en-body-p[^"]*">\s*(<span[^>]*>#<\/span>)?#/);
});

test('render: la capital ornamental va en el primer PÁRRAFO, no en un subtítulo de apertura', () => {
    const h = renderBody({ body: '## Abro con subtítulo\n\nY este es el primer párrafo.' });
    const iH2 = h.indexOf('<h2');
    const iCap = h.indexOf('en-dropcap');
    assert.ok(iH2 >= 0 && iCap > iH2, 'la capital debe caer después del subtítulo, en el párrafo');
    assert.match(h, /<span class="en-dropcap">Y<\/span>/);
});

test('render: la capital aparece UNA sola vez aunque haya muchos párrafos', () => {
    const h = renderBody({ body: 'Uno.\n\nDos.\n\n## Tres\n\nCuatro.' });
    assert.equal(h.split('en-dropcap').length - 1, 1);
});

test('render: el HTML tecleado en el panel NO sale crudo (ni en párrafo ni en subtítulo)', () => {
    const veneno = '<script>alert(1)</script>';
    const h = renderBody({ body: `${veneno}\n\n## ${veneno}\n\nfin` });
    assert.doesNotMatch(h, /<script>/);
    assert.match(h, /&lt;script&gt;/);
});

// ── 3. El artículo completo ────────────────────────────────────────────────────

test('artículo: trae H1, cuerpo y migas — es lo que Google tiene que leer sin ejecutar nada', () => {
    const h = renderArticle(ENTRADA, []);
    assert.match(h, /<h1 class="en-title">Anillos de compromiso en Cartagena<\/h1>/);
    // La capital ornamental separa la primera letra del primer párrafo: el texto llega como
    // `<span class="en-dropcap">P</span>rimer párrafo.` — así que se comprueba por partes.
    assert.match(h, /<span class="en-dropcap">P<\/span>rimer párrafo\./);
    assert.match(h, /Segundo párrafo\./);
    assert.match(h, /aria-label="Migas de pan"/);
});

test('artículo: sin relacionadas no deja una sección vacía (hide-when-empty)', () => {
    assert.doesNotMatch(renderArticle(ENTRADA, []), /en-related/);
    assert.match(renderArticle(ENTRADA, [ENTRADA]), /en-related-card/);
});

test('artículo: es DETERMINISTA — misma entrada, mismo HTML', () => {
    // Es la condición que permite que el navegador repinte encima de lo horneado sin que se vea.
    assert.equal(renderArticle(ENTRADA, [ENTRADA]), renderArticle(ENTRADA, [ENTRADA]));
});

test('artículo: los enlaces de relacionadas apuntan a la URL horneada e indexable', () => {
    const h = renderArticle(ENTRADA, [{ ...ENTRADA, slug: 'otra' }]);
    assert.match(h, /href="\/journal\/otra\.html"/);
    assert.doesNotMatch(h, /entrada\.html\?e=/);
});

// ── 4. Relacionadas ───────────────────────────────────────────────────────────

test('relacionadas: prefiere la misma sección y nunca se incluye a sí misma', () => {
    const todas = [
        { slug: 'a', section: 'Gemología' },
        { slug: 'b', section: 'Gemología' },
        { slug: 'c', section: 'Cuidado' },
    ];
    const r = relatedFrom(todas, 'a', 2);
    assert.deepEqual(r.map(x => x.slug), ['b', 'c']);
    assert.ok(!r.some(x => x.slug === 'a'));
});

test('relacionadas: un slug que no existe devuelve lista vacía, no reventa', () => {
    assert.deepEqual(relatedFrom([{ slug: 'a', section: 'x' }], 'no-existe'), []);
    assert.deepEqual(relatedFrom(null, 'a'), []);
});

// ── 5. URL y <title> ──────────────────────────────────────────────────────────

test('enlace: la URL canónica de una entrada es la horneada', () => {
    assert.equal(entryHref('anillo-de-compromiso'), '/journal/anillo-de-compromiso.html');
});

test('título: lleva «Journal» y lleva «Cartagena» — perderla costó las impresiones', () => {
    const t = entryTitleTag('Anillos de compromiso en Cartagena: una guía sin nervios');
    assert.match(t, /Journal/);
    assert.match(t, /Cartagena/);
    assert.match(t, /Bersaglio Jewelry/);
    // La fórmula vieja del navegador, la que hay que no volver a ver.
    assert.doesNotMatch(t, /The Bersaglio Journal/);
});
