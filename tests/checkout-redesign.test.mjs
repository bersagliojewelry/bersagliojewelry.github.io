/**
 * Tests PUROS (sin emulador) del rediseño del checkout (TODO-63):
 * countries.js (datos + waPhone) y envio-config.js (reglas por tipo de entrega).
 *   node --test tests/checkout-redesign.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COUNTRIES, DEFAULT_ISO2, countryByIso2, waPhone } from '../js/core/countries.js';
import { getEnvioConfig, campoVisible, campoRequerido, TIPOS_ENTREGA, DEFAULT_TIPO } from '../js/core/envio-config.js';

// ───────── countries ─────────
test('países: Colombia es el primero y el default', () => {
    assert.equal(COUNTRIES[0].iso2, 'CO');
    assert.equal(DEFAULT_ISO2, 'CO');
    assert.equal(countryByIso2('CO').code, '57');
});

test('países: ISO2 únicos y todos con indicativo numérico', () => {
    const isos = COUNTRIES.map(c => c.iso2);
    assert.equal(new Set(isos).size, isos.length, 'ISO2 duplicado');
    for (const c of COUNTRIES) {
        assert.match(c.code, /^\d+$/, `indicativo no numérico: ${c.iso2}`);
        assert.ok(c.nombre && c.flag, `falta nombre/bandera: ${c.iso2}`);
    }
});

test('países: +1 lo comparten varios países pero con ISO2 distinto (la clave es ISO2, no el code)', () => {
    const unos = COUNTRIES.filter(c => c.code === '1').map(c => c.iso2);
    assert.ok(unos.includes('US') && unos.includes('CA'), 'US y CA deben existir');
    assert.equal(new Set(unos).size, unos.length, 'ISO2 con +1 deben ser distintos');
});

test('países: incluye LatAm + USA/Canadá + Europa principal', () => {
    const isos = new Set(COUNTRIES.map(c => c.iso2));
    for (const must of ['CO', 'VE', 'MX', 'AR', 'US', 'CA', 'ES', 'DE', 'FR', 'IT', 'GB']) {
        assert.ok(isos.has(must), `falta país clave: ${must}`);
    }
});

test('waPhone: normaliza (quita signos/espacios/paréntesis y cero troncal, antepone indicativo)', () => {
    assert.equal(waPhone('CO', '300 123 4567'), '573001234567');
    assert.equal(waPhone('CO', '(300) 123-4567'), '573001234567');
    assert.equal(waPhone('CO', '03001234567'), '573001234567');   // cero troncal
    assert.equal(waPhone('US', '415 555 0172'), '14155550172');
    assert.equal(waPhone('CO', ''), '');                           // vacío → vacío
});

test('waPhone: no duplica el indicativo si el usuario ya lo tecleó', () => {
    assert.equal(waPhone('CO', '57 300 123 4567'), '573001234567');
});

// ───────── envio-config ─────────
test('envio-config: nacional es el default y tolera tipos inválidos', () => {
    assert.equal(DEFAULT_TIPO, 'nacional');
    assert.equal(getEnvioConfig('xxx').tipo, 'nacional');
    assert.equal(getEnvioConfig(undefined).tipo, 'nacional');
});

test('envio-config: INVARIANTE internacional NUNCA cobra online + solo contacto', () => {
    const intl = getEnvioConfig('internacional');
    assert.equal(intl.permitePagoOnline, false);
    assert.ok(!intl.campos.includes('address'), 'internacional no pide dirección');
    assert.ok(!intl.requeridos.includes('docNumber'), 'internacional no exige documento');
});

test('envio-config: tienda y nacional permiten pago online y EXIGEN legal_id + dirección de facturación', () => {
    for (const t of ['tienda', 'nacional']) {
        const c = getEnvioConfig(t);
        assert.equal(c.permitePagoOnline, true, `${t} debe permitir online`);
        for (const req of ['docType', 'docNumber', 'city', 'address']) {
            assert.ok(c.requeridos.includes(req), `${t} debe exigir ${req}`);
        }
    }
});

test('envio-config: tienda pide dirección (facturación, antifraude) aunque NO sea envío', () => {
    assert.ok(campoVisible('tienda', 'address'), 'tienda debe mostrar dirección de facturación');
    assert.ok(campoRequerido('tienda', 'address'));
});

test('envio-config: campo oculto NO es requerido (no trampa WCAG 3.3)', () => {
    assert.equal(campoVisible('internacional', 'address'), false);
    assert.equal(campoRequerido('internacional', 'address'), false);
});

test('envio-config: los 3 tipos existen', () => {
    assert.deepEqual([...TIPOS_ENTREGA].sort(), ['internacional', 'nacional', 'tienda']);
});
