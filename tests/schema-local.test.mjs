/**
 * tests/schema-local.test.mjs — El JSON-LD de Contacto y Nosotros, y el guardia de hechos que
 * decide qué del PANEL se puede amplificar a structured data.
 *
 * Qué se arregló el 2026-10-10, y una premisa que cayó al medirla:
 *   - `contacto.html` y `nosotros.html` servían CERO structured data. Contacto es la página que
 *     debería declarar el negocio local y la que abre un turista para saber si puede ir hoy.
 *   - La premisa que cayó: se daba por hecho que las dos «llegan a Google en blanco». El HTML
 *     crudo sí, pero el renderizador ejecuta JS y el de estas dos páginas NO espera a la red
 *     (pinta con los defaults del repositorio). Comprobado en el navegador contra producción:
 *     447 palabras en Contacto y 1.062 en Nosotros. El techo del Journal era otro problema —
 *     allí el primer pintado dependía de Firestore.
 *   - Y lo que se evitó por leer una por una las seis preguntas frecuentes antes de hornearlas:
 *     dos hechos que el dueño YA había retirado seguían vivos en el panel —el café de bienvenida
 *     y la cita previa— y estaban a punto de viajar a JSON-LD, que es una afirmación más fuerte
 *     que un párrafo.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GEN = readFileSync(join(ROOT, 'scripts/generate-pieces.mjs'), 'utf8');
const TENANT = JSON.parse(readFileSync(join(ROOT, 'tenant_config.json'), 'utf8'));

test('el generador hornea JSON-LD en Contacto y en Nosotros', () => {
    assert.match(GEN, /injectGraphIntoPage\('contacto\.html'/, 'falta el JSON-LD de Contacto');
    assert.match(GEN, /injectGraphIntoPage\('nosotros\.html'/, 'falta el JSON-LD de Nosotros');
});

test('Contacto declara el negocio con el MISMO @id que la portada (una entidad, no dos)', () => {
    // Referenciar por @id algo definido en OTRA página no es fiable, así que el nodo se repite.
    // Pero con el mismo identificador: dos JewelryStore con @id distinto describirían dos negocios.
    assert.match(GEN, /function buildContactoGraph/);
    assert.match(GEN, /buildBusinessGraph\(cfg\)/, 'Contacto debe reusar el nodo de negocio, no escribir otro');
    assert.match(GEN, /'@id': BUSINESS_ID/, 'el @id del negocio tiene que ser el compartido');
});

test('el NAP del schema sale de tenant_config, que es la fuente única', () => {
    // Si alguien teclea otro teléfono o otro horario en el generador, esto lo caza: el 2026-10-10
    // la portada mandaba a un WhatsApp que no era de la casa y cada clic era un cliente
    // escribiéndole a un desconocido.
    assert.equal(TENANT.nap.telephone, '+573013752592');
    assert.equal(TENANT.openingHours[0].opens, '09:30');
    assert.equal(TENANT.openingHours[0].closes, '19:00');
    assert.equal(TENANT.openingHours[0].dayOfWeek.length, 7, 'abre los SIETE días, festivos incluidos');
    assert.doesNotMatch(GEN, /\+57\s?3008142345/, 'el WhatsApp equivocado no vuelve al generador');
});

test('el guardia de hechos del BUILD existe y dice qué descarta', () => {
    // El gate de ficheros declara que NO ve el panel. Este guardia tapa ese hueco para lo que el
    // generador hornea: no puede arreglar el panel, pero se niega a amplificar lo retirado.
    assert.match(GEN, /HECHOS_RETIRADOS/);
    assert.match(GEN, /function hechosRetiradosEn/);
    assert.match(GEN, /FAQ NO horneada/, 'un recorte en silencio sería peor que no recortar');
});

test('el guardia caza lo que la tabla de hechos marca NO VERIFICADO o FALSO', () => {
    const bloque = GEN.slice(GEN.indexOf('const HECHOS_RETIRADOS'), GEN.indexOf('/** Devuelve los hechos retirados'));
    assert.match(bloque, /caf\[e/i, 'el café nace del prototipo de IA: NO VERIFICADO');
    assert.match(bloque, /compromiso\\s\+de\\s\+compra/i, '«sin compromiso de compra»: NO VERIFICADO');
    assert.match(bloque, /taller\|atelier/i, 'el taller visitable: FALSO — y tampoco vale llamarlo «atelier»');
});

test('el guardia ya NO caza «fabricamos, no revendemos»: la tabla lo pasó a VERIFICADO', () => {
    // Derogación con fecha. Hasta el 2026-10-13 la frase estaba marcada DUDOSA «sin confirmación
    // pieza a pieza» (venía de leer el CIIU 3211), y el guardia la tumbaba en silencio del JSON-LD
    // mientras el manifiesto del Home la publicaba — el repo afirmaba las dos cosas a la vez.
    // Daniel la confirmó de frente: «bersaglio no le compra a nadie las piezas, las fabrican ellos
    // mismos». Este test es el que impide que la entrada vuelva por inercia.
    const bloque = GEN.slice(GEN.indexOf('const HECHOS_RETIRADOS'), GEN.indexOf('/** Devuelve los hechos retirados'));
    assert.doesNotMatch(bloque, /\[\/no\\s\+revendemos/,
        '«fabricamos, no revendemos» está VERIFICADO desde el 13-oct: no puede volver a la lista de retirados. '
        + 'El límite que SÍ sigue en pie es el taller, que no se visita — esa entrada es otra.');
});

test('el guardia vigila el REQUISITO de la cita, no la palabra «cita previa»', () => {
    // Matiz que casi cuesta una FAQ buena: agendar la visita está VERIFICADO «como opción»; lo
    // FALSO es «atendemos con cita previa» / «solo con cita», porque la cita NO es obligatoria.
    // La primera versión prohibía la frase entera y habría tumbado la pregunta de Contacto que
    // dice justo lo correcto — y que la tabla de hechos cita como prueba de que se puede agendar.
    const gen = GEN;
    const i = gen.indexOf('const HECHOS_RETIRADOS');
    const bloque = gen.slice(i, gen.indexOf('/** Devuelve los hechos retirados'));
    assert.doesNotMatch(bloque, /\[\/cita\\s\+previa\/i/, '«cita previa» a secas no puede estar prohibido');
    assert.match(bloque, /atendemos\|solo/, 'debe vigilar el requisito: «atendemos…» / «solo con cita»');
    const contacto = readFileSync(join(ROOT, 'js/pages/contacto-defaults.js'), 'utf8');
    assert.match(contacto, /No es obligatoria/, 'la FAQ que enmarca bien la cita debe seguir viva');
});

test('el guardia NO caza una mención divulgativa a un laboratorio', () => {
    // Falso positivo real: la primera versión marcó el artículo que explica, sin afirmar nada de
    // la casa, que «para los diamantes el referente mundial es el GIA». Un guardia que grita de
    // más enseña a ignorarlo — y entonces deja de servir justo cuando hace falta.
    const bloque = GEN.slice(GEN.indexOf('const HECHOS_RETIRADOS'), GEN.indexOf('/** Devuelve los hechos retirados'));
    assert.doesNotMatch(bloque, /^\s*\[\/\\b\(GIA\|/m, 'el GIA a secas no puede estar prohibido');
    // Lo prohibido es atribuirlo: un cuantificador o un posesivo cerca del laboratorio.
    assert.match(bloque, /cada \(pieza\|joya\|gema\)/, 'debe seguir vigilando «cada pieza … <laboratorio>»');
    assert.match(bloque, /nuestr\[oa\]s\?/, 'debe seguir vigilando «nuestras esmeraldas … <laboratorio>»');
});

test('sin preguntas reales no se emite un FAQPage vacío (cero-ficción)', () => {
    assert.match(GEN, /if \(preguntas\.length\)/, 'un FAQPage sin preguntas sería structured data inventada');
});
