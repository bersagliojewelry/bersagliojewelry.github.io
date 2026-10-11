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

test('el guardia caza el café y la cita previa, que seguían vivos en el panel', () => {
    const bloque = GEN.slice(GEN.indexOf('const HECHOS_RETIRADOS'), GEN.indexOf('/** Devuelve los hechos retirados'));
    assert.match(bloque, /caf\[e/i, 'el café de bienvenida está retirado y debe estar vigilado');
    assert.match(bloque, /cita\\s\+previa/i, 'la cita previa está retirada y debe estar vigilada');
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
