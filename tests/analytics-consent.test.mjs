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
    const cuerpo = cuerpoDe(src('js/analytics.js'), 'hasConsent');
    assert.match(cuerpo, /===\s*'accepted'/,
        'el banner GUARDA "accepted" y EMITE "accept": confundirlos deja la compuerta abierta');
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
