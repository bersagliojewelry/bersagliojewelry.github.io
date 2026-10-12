/**
 * Bersaglio Jewelry — la autorización de datos de los FORMULARIOS (Ley 1581 de 2012).
 *
 * Por qué existe este archivo y no una frase suelta en cada formulario: la autorización solo vale
 * si fue INFORMADA, y eso se juzga por lo que el titular VIO, no por lo que quedó guardado. Si el
 * texto se escribe a mano en tres sitios, el día que se corrija uno los otros dos siguen pintando
 * otra cosa y la prueba archivada deja de corresponder a lo que se enseñó. Aquí el texto tiene UN
 * dueño: lo que se pinta y lo que se archiva salen de la misma línea.
 *
 * Lo que la ley pide y aquí se cumple:
 *   · PREVIA y EXPRESA — la casilla nace vacía y el envío no sale sin ella. El silencio NO es
 *     autorización (Decreto 1377 de 2013, art. 7), así que nada de «al enviar aceptas».
 *   · INFORMADA — cada formulario declara SU finalidad real (responder, agendar, llamar), no una
 *     fórmula general que lo cubra todo.
 *   · CON PRUEBA — se archiva `{ aceptado, version, fecha }` junto al lead. La versión apunta a
 *     esta tabla, que vive en git: versión + `source` reconstruyen la frase exacta que se mostró.
 *   · REVOCABLE — revocar tiene que ser tan fácil como autorizar (Ley 1581, art. 8 lit. e), y por
 *     eso el canal va escrito DENTRO de la frase, no escondido en la política.
 *
 * ⚠️ `VERSION` sube cuando cambia la FINALIDAD o el canal de revocación — no cuando se corrige una
 * coma. Al subirla, lo archivado antes sigue siendo válido: apunta a su propia versión.
 */

/** Versión de la familia de textos de abajo. Sube con la finalidad, no con la redacción menor. */
export const VERSION = '2026-10-12';

/** El canal de revocación. Es el mismo correo que el sitio publica en Contacto y en Privacidad. */
const CANAL = 'info@bersagliojewelry.co';

/**
 * La finalidad REAL de cada formulario, en las palabras del lector. La clave es el `source` con
 * que el lead entra a la Bandeja, así que la prueba archivada y el texto mostrado comparten llave.
 */
const FINALIDADES = {
    'contacto-mensaje': 'responder tu mensaje',
    'contacto-visita':  'agendar y confirmarte la visita',
    'contacto-llamada': 'llamarte en la franja que elegiste',
    'pieza-form':       'escribirte sobre la pieza que te gustó',
};

/**
 * La frase que se le muestra al titular. Se compone aquí, nunca en la plantilla.
 * @param {string} source  el mismo `source` con que se guardará el lead
 * @returns {string} texto plano, sin HTML
 */
export function texto(source) {
    const finalidad = FINALIDADES[source];
    // Un `source` que no esté en la tabla es un error de programación, no un caso a cubrir en
    // silencio: una finalidad genérica sería justo la autorización en blanco que la ley prohíbe.
    if (!finalidad) throw new Error(`[habeas] sin finalidad declarada para "${source}"`);
    return `Autorizo a Bersaglio Jewelry a guardar mi nombre y mis datos de contacto para `
         + `${finalidad}. Puedo pedir que los corrijan o los borren cuando quiera, escribiendo a `
         + `${CANAL}.`;
}

/**
 * La casilla, ya montada: vacía, obligatoria, y con el texto que luego se archiva. El enlace a la
 * política va FUERA de la frase archivada —es navegación, no parte de lo que se autoriza—, así que
 * el texto guardado y el visible siguen coincidiendo carácter a carácter.
 * @param {string} source
 * @returns {string} HTML
 */
export function casillaHtml(source) {
    return `<label class="bj-habeas">
            <input type="checkbox" name="habeas" required>
            <span>${texto(source)} <a href="/privacidad.html" target="_blank" rel="noopener">Cómo tratamos tus datos</a>.</span>
        </label>`;
}

/**
 * La prueba que se archiva con el lead. La fecha la pone el SERVIDOR (`serverTimestamp` en
 * `firestore-service`), no el reloj del visitante: una fecha que el cliente puede mover no prueba
 * nada. Esta forma es la MISMA del newsletter, para que las dos reglas de Firestore sean gemelas.
 */
export function prueba() {
    return { aceptado: true, version: VERSION };
}
