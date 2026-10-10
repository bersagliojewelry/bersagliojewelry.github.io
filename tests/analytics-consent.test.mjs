/**
 * Gate de CONSENTIMIENTO y de VERDAD DE LA COMPRA (auditoría de medición, 2026-10-09).
 *
 * Nace de dos fallos MEDIDOS en el código vivo, los dos invisibles hasta que costaron:
 *
 *   1. El pixel de Meta y Hotjar se cargaban SIEMPRE, sin mirar el banner de cookies, mientras
 *      GA4 sí arrancaba denegado (Consent Mode v2). Ninguno de los 540 tests lo cubría.
 *   2. La COMPRA estaba invertida: `carrito.js` hacía `return` en la rama de Wompi ANTES de medir,
 *      así que el pago real no se contaba y abrir WhatsApp SÍ se contaba como venta, con el
 *      subtotal entero. GA4 (G-HS26X60DK3, vivo) llevaba meses recibiendo ventas falsas.
 *
 * Este gate mira el FUENTE, no el runtime: lo que protege es que nadie vuelva a quitar la
 * compuerta ni a devolver la medición de compra al carrito. Patrones deliberadamente LAXOS
 * (M-07: un gate de patrón debe tolerar variación benigna sin perder la detección del bug).
 *
 *   node --test tests/analytics-consent.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const stripComments = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const src = p => stripComments(readFileSync(join(ROOT, p), 'utf8'));

/** Cuerpo de una función `function nombre(...) { ... }`, contando llaves. */
function cuerpoDe(code, nombre) {
    const i = code.indexOf(`function ${nombre}(`);
    assert.notEqual(i, -1, `no se encontró la función ${nombre}()`);
    const abre = code.indexOf('{', i);
    let nivel = 0;
    for (let j = abre; j < code.length; j++) {
        if (code[j] === '{') nivel++;
        else if (code[j] === '}' && --nivel === 0) return code.slice(abre, j + 1);
    }
    throw new Error(`llaves sin cerrar en ${nombre}()`);
}

/* ─── 1. La compuerta de consentimiento ──────────────────────────────── */

test('consentimiento: loadFBPixel() NO carga Meta sin aceptar', () => {
    const cuerpo = cuerpoDe(src('js/analytics.js'), 'loadFBPixel');
    assert.match(cuerpo, /hasConsent\s*\(\s*\)/,
        'loadFBPixel() debe consultar hasConsent() antes de inyectar fbevents.js');
    // El guard tiene que estar ANTES del snippet, no después.
    assert.ok(cuerpo.indexOf('hasConsent') < cuerpo.indexOf('connect.facebook.net'),
        'el guard de consentimiento va ANTES de cargar el script de Meta');
});

test('consentimiento: loadHotjar() tampoco graba sin aceptar', () => {
    const cuerpo = cuerpoDe(src('js/analytics.js'), 'loadHotjar');
    assert.match(cuerpo, /hasConsent\s*\(\s*\)/,
        'Hotjar graba la sesión: sin hasConsent() queda a un número de distancia de abrir un agujero');
});

test('consentimiento: loadFBPixel() es idempotente (no repite PageView)', () => {
    const cuerpo = cuerpoDe(src('js/analytics.js'), 'loadFBPixel');
    assert.match(cuerpo, /if\s*\(\s*fbReady\s*\)\s*return/,
        'el `if(f.fbq)return` del snippet de Meta NO corta a loadFBPixel: hace falta su propio guard');
});

test('consentimiento: hasConsent() compara con "accepted", no con "accept"', () => {
    // El dueño se mudó a core/consent.js (extracción 2026-10-09): la llave estaba repetida en tres
    // sitios y el control de preferencias habría sido el cuarto. El test sigue al dueño.
    const cuerpo = cuerpoDe(src('js/core/consent.js'), 'hasConsent');
    assert.match(cuerpo, /===\s*'accepted'/,
        'el banner GUARDA "accepted" y EMITE "accept": confundirlos deja la compuerta abierta');
});

test('consentimiento: la llave `bj-cookie-consent` tiene UN solo dueño', () => {
    const conLlave = ['js/analytics.js', 'js/components/cookie-banner.js', 'js/pages/privacidad.js']
        .filter(p => /'bj-cookie-consent'/.test(src(p)));
    assert.deepEqual(conLlave, [],
        `la llave debe vivir SOLO en core/consent.js; la repiten: ${conLlave.join(', ')}`);
    assert.match(src('js/core/consent.js'), /'bj-cookie-consent'/, 'core/consent.js debe tenerla');
});

test('consentimiento: setConsent es el ÚNICO que emite el evento', () => {
    const emisores = ['js/analytics.js', 'js/components/cookie-banner.js', 'js/pages/privacidad.js']
        .filter(p => /dispatchEvent[\s\S]{0,120}bj:cookie-consent/.test(src(p)));
    assert.deepEqual(emisores, [],
        `dos emisores pueden divergir; debe emitir solo core/consent.js. Emiten: ${emisores.join(', ')}`);
});

test('consentimiento: revocar BORRA el identificador, no solo cierra el grifo', () => {
    const modulo = src('js/core/consent.js');
    const cuerpo = cuerpoDe(modulo, 'borrarCookiesDeTerceros');
    // La lista de prefijos vive fuera de la función (es una constante), así que se mira el módulo.
    assert.match(modulo, /_fbp/, 'el `_fbp` de Meta es first-party en nuestro dominio: hay que borrarlo');
    assert.match(modulo, /_ga/, 'y el `_ga` de Google, que también identifica');
    assert.match(cuerpo, /expires=Thu, 01 Jan 1970/, 'se borra caducando la cookie');
    assert.match(cuerpo, /domain=/, 'una cookie puesta en `.dominio.co` no se borra sin el domain');
    assert.match(cuerpoDe(src('js/analytics.js'), 'revokeConsent'), /borrarCookiesDeTerceros\s*\(/,
        'revokeConsent() debe llamarlo, o la promesa de la política es un gesto');
});

test('consentimiento: al aceptar en el banner, Meta arranca sin recargar', () => {
    const code = src('js/analytics.js');
    assert.match(code, /bj:cookie-consent[\s\S]{0,400}loadFBPixel\s*\(/,
        'el listener de bj:cookie-consent debe llamar a loadFBPixel() cuando llega "accept"');
});

test('consentimiento: existe forma de REVOCAR (la política lo promete)', () => {
    const code = src('js/analytics.js');
    assert.match(code, /function\s+revokeConsent\s*\(/, 'falta revokeConsent()');
    const cuerpo = cuerpoDe(code, 'revokeConsent');
    assert.match(cuerpo, /'denied'/, 'revocar debe denegar los permisos de GA4');
    assert.match(cuerpo, /fbq[\s\S]{0,80}revoke/, 'a Meta hay que decirle `consent revoke`, no basta con no llamarlo');
});

/* ─── 1-bis. Las dos puertas y el banner que no se enteraba ──────────── */

test('preferencias: el banner se retira si la decisión llega de OTRO sitio', () => {
    // Bug MEDIDO el 2026-10-09 recorriendo el camino en el navegador: al decidir desde el control
    // de /privacidad.html con el banner en pantalla, el banner seguía preguntando lo ya respondido
    // y `bj-cookie-active` no se quitaba nunca → el FAB de asesoría quedaba apartado para siempre.
    const code = src('js/components/cookie-banner.js');
    assert.match(code, /addEventListener\s*\(\s*CONSENT_EVENT/,
        'el banner debe oír el evento del consentimiento, no solo su propio clic');
    const cuerpo = cuerpoDe(code, 'build');
    const clic = cuerpo.slice(cuerpo.indexOf("closest('[data-action]')"));
    assert.doesNotMatch(clic.slice(0, 600), /classList\.remove\('bj-cookie-active'\)/,
        'retirarse debe tener UN solo camino (el oyente), no uno propio dentro del clic');
});

test('preferencias: al vencer el plazo se vuelve a preguntar si ya decidió', () => {
    // En /privacidad.html el control está visible desde el primer instante: en los 1,5 s de espera
    // el visitante ya puede haber decidido, y entonces el banner no debe construirse.
    const cuerpo = cuerpoDe(src('js/components/cookie-banner.js'), 'initCookieBanner');
    assert.match(cuerpo, /setTimeout\s*\(\s*\(\s*\)\s*=>\s*\{[\s\S]{0,120}hasDecided\s*\(\s*\)/,
        'la comprobación tiene que estar DENTRO del setTimeout, no solo antes de programarlo');
});

test('preferencias: las dos puertas pesan igual (consentimiento no empujado)', () => {
    const css = src('css/legal.css');
    const i = css.indexOf('.lg-cookie-btn');
    assert.notEqual(i, -1, 'faltan los estilos del control de preferencias');
    const bloque = css.slice(i, i + 900);
    assert.doesNotMatch(bloque, /linear-gradient/,
        'ningún botón del control puede ser el botón macizo de marca: empujaría la decisión');
});

/* ─── 1-ter. Que el texto no prometa lo que el código no hace ────────── */

test('verdad: la política NO promete que "no se carga nada" (GA4 arranca siempre)', () => {
    // El comité lo cazó como CRÍTICO: GA4 se descarga en la primera visita, en modo denegado y sin
    // cookies, pero se descarga. Prometer lo contrario es justo el medio engañoso que esta página
    // vino a corregir, y se desmiente abriendo la pestaña de red del navegador.
    const texto = src('js/pages/privacidad.js') + src('js/components/cookie-banner.js');
    assert.doesNotMatch(texto, /no se carga nada hasta que/i,
        'GA4 SÍ se carga antes de aceptar (sin cookies). Di eso, no que no se carga nada.');
    assert.match(src('js/pages/privacidad.js'), /modo restringido/,
        'hay que explicar que la medición de Google corre en modo restringido antes de aceptar');
});

test('verdad: la política NO declara cookies propias (el sitio no pone ninguna)', () => {
    const texto = src('js/pages/privacidad.js') + src('js/components/cookie-banner.js');
    assert.doesNotMatch(texto, /cookies (estrictamente necesarias|propias) para que el sitio funcione/i,
        'medido: el sitio no pone ni una cookie propia, todo lo suyo es localStorage con prefijo bj-');
});

test('verdad: se declara que las tipografías de Google se piden aunque rechaces', () => {
    // Medido 2026-10-09: las 31 páginas del build enlazan fonts.googleapis.com, así que Google ve la
    // visita decida lo que decida. Si algún día se autoalojan, este test avisa de que sobra la frase.
    assert.match(src('js/pages/privacidad.js'), /letras con las que está escrita/,
        'si el sitio pide tipografías a Google, hay que decirlo: "no reciben nada" sería falso');
});

test('consentimiento: la decisión CRUZA pestañas (un CustomEvent no sale de su documento)', () => {
    // Sin esto, rechazar en una pestaña deja la otra con el pixel cargado recreando el `_fbp`.
    const code = src('js/core/consent.js');
    assert.match(code, /addEventListener\s*\(\s*'storage'/,
        'falta el oyente de `storage`, que es lo único que avisa a las demás pestañas');
    assert.match(code, /ultimoPropagado/,
        'la llave y su versión llegan en dos eventos: hace falta el guardia contra el duplicado');
});

test('consentimiento: el borrado de cookies nunca toca lo nuestro ni lo de Firebase', () => {
    const cuerpo = cuerpoDe(src('js/core/consent.js'), 'borrarCookiesDeTerceros');
    assert.match(cuerpo, /NUNCA_BORRAR/, 'falta el cinturón de exclusiones en el filtro');
    assert.match(src('js/core/consent.js'), /startsWith\('bj-'\)/, 'lo nuestro empieza por bj-');
});

test('consentimiento: FINALIDAD_VERSION es un candado deliberado, no una fecha', () => {
    // Trampa a propósito: si alguien cambia la constante, este test falla y le obliga a leer por qué.
    assert.match(src('js/core/consent.js'), /FINALIDAD_VERSION\s*=\s*'2026-10-09'/,
        '¿Cambiaste FINALIDAD_VERSION? Eso hace REAPARECER el banner a TODO el que ya había decidido. '
        + 'Es correcto SOLO si cambió PARA QUÉ se usan los datos (§04 de la política). '
        + 'Si solo corregiste redacción, revierte. Si el cambio es real, actualiza este test y el §10.');
});

/* ─── 2. La verdad de la compra ──────────────────────────────────────── */

test('compra: el carrito NO mide ventas (ahí todavía no hay pago)', () => {
    const code = src('js/pages/carrito.js');
    assert.doesNotMatch(code, /trackPurchase/,
        'medir la compra al confirmar el carrito cuenta "abrir WhatsApp" como venta');
    assert.doesNotMatch(code, /track\s*\(\s*['"]purchase['"]/,
        'el carrito no debe emitir el evento `purchase` por ninguna vía');
});

test('compra: trackPurchase() ya no existe en el módulo de analítica', () => {
    assert.doesNotMatch(src('js/analytics.js'), /export\s+function\s+trackPurchase/,
        'inventaba transaction_id con Date.now() (id nuevo en cada recarga)');
});

test('compra: gracias.js mide la venta SOLO con el APPROVED de Wompi', () => {
    const code = src('js/pages/gracias.js');
    assert.match(code, /medirCompra/, 'falta la función que mide la compra');
    assert.match(code, /APPROVED[\s\S]{0,120}medirCompra\s*\(/,
        'la compra se mide solo si Wompi responde APPROVED');
    const cuerpo = cuerpoDe(code, 'medirCompra');
    assert.match(cuerpo, /transaction_id/, 'la venta necesita la referencia real de Wompi');
    assert.doesNotMatch(cuerpo, /Date\.now\s*\(/,
        'el id de la transacción es la referencia de Wompi, no un número inventado al recargar');
    assert.match(cuerpo, /sessionStorage/, 'hace falta candado: recargar /gracias.html no debe recontar la venta');
});

test('compra: el valor sale del monto real, no de cero', () => {
    const cuerpo = cuerpoDe(src('js/pages/gracias.js'), 'medirCompra');
    assert.match(cuerpo, /amount_in_cents|amountInCents/,
        'sin el monto, la venta se reportaría en 0 — otra mentira distinta');
    assert.match(src('js/pago-web.js'), /amountInCents/,
        'pago-web.js debe guardar el monto en el stash como respaldo si la consulta falla');
});

test('compra: Meta recibe eventID para poder deduplicar', () => {
    assert.match(src('js/analytics.js'), /eventID/,
        'sin eventID, la misma compra contaría dos veces si mañana llega también por la API de conversiones');
});
