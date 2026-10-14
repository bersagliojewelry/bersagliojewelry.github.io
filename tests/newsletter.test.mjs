/**
 * tests/newsletter.test.mjs — El alta al newsletter (js/core/newsletter.js).
 *
 * Qué defiende, y por qué se escribió el 2026-10-13:
 *
 *   1. QUE EL CORREO LLEGUE. El alta estaba escrita TRES veces. El 11-oct se arregló la del modal
 *      y las otras dos —la caja de la portada y la del Journal— se quedaron guardando el correo en
 *      el `localStorage` DEL PROPIO VISITANTE y dándole las gracias. Medido el 13-oct en los
 *      chunks que servía el sitio (`home-DHxh5UUP.js`, `journal-ClZvwq5G.js`): una aparición de
 *      `bj-email-subscribed` y CERO de `saveSubscription` en cada uno. Cada persona que se
 *      suscribió por ahí es un lead que no existió y una promesa que no se podía cumplir.
 *      Lo que impide que vuelva a pasar no es acordarse: es que haya UN dueño, y que un test se
 *      niegue a dejar nacer un segundo.
 *
 *   2. LA AUTORIZACIÓN. Ninguna de las dos cajas pedía la casilla, así que ni queriendo habrían
 *      podido guardar: `subscriptionCreateValida()` rechaza el documento sin `habeasData`. La
 *      casilla nace VACÍA y obligatoria — el silencio no es autorización (Decreto 1377, art. 7).
 *
 *   3. QUE FIREBASE NO SUBA A LA PORTADA. El módulo lo importan la portada y el Journal solo para
 *      pintar la casilla. Si alguien mete el SDK arriba del archivo, se cuelan ≈637 KB en el
 *      primer paquete de la página más visitada por una casilla que casi nadie marca.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { TEXTO_AUTORIZACION, casillaNewsletterHtml, suscribir, initNewsletterForms } from '../js/core/newsletter.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const leer = (rel) => readFileSync(join(ROOT, rel), 'utf8');

// ── 1. UN solo dueño ──────────────────────────────────────────────────────────

test('un dueño: nadie más escribe el correo del suscriptor ni le da las gracias', () => {
    // La forma exacta en que las dos copias mentían: guardar en el navegador del visitante y
    // pintar un «gracias». Si reaparece en cualquier otro fichero, es que nació una cuarta copia.
    const SOSPECHOSOS = ['js/home/journal-preview.js', 'js/pages/journal.js', 'js/components/email-modal.js'];
    for (const rel of SOSPECHOSOS) {
        const txt = leer(rel);
        assert.ok(!/localStorage\.setItem\(\s*['"]bj-email-subscribed['"]/.test(txt),
            `${rel} vuelve a guardar el correo en el localStorage del visitante. Eso NO es guardar: `
            + 'el alta vive en js/core/newsletter.js y pasa por saveSubscription().');
        assert.ok(!/newsletter-thanks">Gracias\. Te escribiremos pronto/.test(txt),
            `${rel} promete escribir sin haber guardado nada. Un «gracias» sobre un fallo es la `
            + 'mentira que este módulo vino a quitar.');
    }
});

test('un dueño: las dos cajas en línea declaran de dónde vienen', () => {
    // `source` es lo que le dice al panel qué sitio convierte. Sin él, las tres altas se mezclan.
    assert.match(leer('js/home/journal-preview.js'), /data-newsletter="home-journal"/);
    assert.match(leer('js/pages/journal.js'), /data-newsletter="journal"/);
    assert.match(leer('js/components/email-modal.js'), /suscribir\(email, 'modal-web'\)/);
});

test('un dueño: las tres pantallas pintan la MISMA casilla, no una copia a mano', () => {
    for (const rel of ['js/home/journal-preview.js', 'js/pages/journal.js', 'js/components/email-modal.js']) {
        assert.match(leer(rel), /casillaNewsletterHtml\(\)/,
            `${rel} debería pintar la casilla compartida. Si la escribe a mano, el día que se `
            + 'corrija el texto esta pantalla seguirá enseñando otro — y la prueba archivada '
            + 'dejará de corresponder a lo que el titular vio.');
    }
});

// ── 2. La autorización ───────────────────────────────────────────────────────

test('habeas data: la casilla nace vacía, es obligatoria y lleva la frase informada', () => {
    const h = casillaNewsletterHtml();
    assert.match(h, /type="checkbox"/);
    assert.match(h, /name="habeas"/);
    assert.match(h, /required/);
    assert.ok(!/checked/.test(h), 'la casilla NO puede nacer marcada: el silencio no es autorización');
    assert.ok(h.includes(TEXTO_AUTORIZACION), 'la casilla tiene que mostrar la frase que se archiva');
});

test('habeas data: la frase dice la finalidad REAL y el canal para revocar', () => {
    assert.match(TEXTO_AUTORIZACION, /Autorizo a Bersaglio Jewelry/);
    assert.match(TEXTO_AUTORIZACION, /correo/, 'tiene que decir QUÉ dato se guarda');
    assert.match(TEXTO_AUTORIZACION, /piezas y novedades/, 'tiene que decir PARA QUÉ, no una fórmula general');
    assert.match(TEXTO_AUTORIZACION, /borren cuando quiera/, 'revocar debe ser tan fácil como autorizar (Ley 1581, art. 8.e)');
});

test('habeas data: el enlace a la política va FUERA de la frase archivada', () => {
    // Es navegación, no parte de lo que se autoriza: así lo guardado y lo visible siguen
    // coincidiendo carácter a carácter.
    assert.ok(!TEXTO_AUTORIZACION.includes('<a '), 'la frase archivada no puede llevar markup');
    assert.match(casillaNewsletterHtml(), /href="\/privacidad\.html"/);
});

// ── 3. La frontera de carga ──────────────────────────────────────────────────

test('carga: el módulo NO importa Firebase arriba del archivo', () => {
    const src = leer('js/core/newsletter.js');
    const estaticos = [...src.matchAll(/^import\s.*from\s+['"](.+)['"]/gm)].map(m => m[1]);
    assert.deepEqual(estaticos, [],
        `js/core/newsletter.js tiene imports estáticos (${estaticos.join(', ')}). Lo importan la `
        + 'portada y el Journal solo para pintar una casilla: el SDK de Firebase se carga con '
        + '`import()` dentro de suscribir(), cuando alguien se suscribe de verdad.');
    assert.match(src, /await import\('\.\.\/firestore-service\.js'\)/, 'el guardado sí debe cargarse bajo demanda');
});

test('carga: el módulo se importa y pinta en Node, sin DOM', () => {
    // Si esto corre, el import de arriba funcionó sin `document` ni Firebase.
    assert.equal(typeof globalThis.document, 'undefined');
    assert.equal(typeof suscribir, 'function');
    assert.equal(typeof initNewsletterForms, 'function');
    assert.ok(casillaNewsletterHtml().length > 100);
});

// ── 4. El enganche ───────────────────────────────────────────────────────────

test('enganche: initNewsletterForms no se engancha dos veces sobre el mismo formulario', () => {
    // `refreshJournalPreview()` vuelve a montar la sección y llama al init otra vez. Sin la marca,
    // dos oyentes sobre el mismo submit guardarían la suscripción dos veces.
    assert.match(leer('js/core/newsletter.js'), /if \(form\.dataset\.newsletterReady\) return;/);
});

test('enganche: el evento de analítica se dispara DESPUÉS de guardar, no antes', () => {
    // `js/analytics.js` cuenta `bj:email-subscribed` como LEAD. Mientras las dos copias lo
    // disparaban sin guardar, la medición registraba conversiones de correos tirados a la basura.
    const src = leer('js/core/newsletter.js');
    const iGuardado = src.indexOf('await suscribir(');
    const iEvento = src.indexOf("new CustomEvent('bj:email-subscribed'");
    assert.ok(iGuardado > 0 && iEvento > iGuardado,
        'el evento de LEAD no puede dispararse antes de que el guardado haya devuelto');
    assert.match(src, /catch \(err\) \{[\s\S]*?return;\n {4}\}/,
        'si el guardado falla hay que SALIR, no seguir hasta el «gracias»');
});
