/**
 * Tests del panel de Parámetros (módulo PURO, sin DOM ni Firestore).
 *   node --test tests/parametros-form.test.mjs    (o: npm run test:parametros)
 *
 * Fija el contrato del M0-C: defaults espejo de la política v1, validación de
 * rangos/listas y las reglas de coherencia (neutros ⊆ ajuste; prohibidos fuera).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, SECCIONES, LISTAS, validarConfigCartera, leerPath, escribirPath } from '../js/admin/parametros-form.js';

test('parámetros · los DEFAULTS pasan su propia validación', () => {
    const r = validarConfigCartera(DEFAULTS);
    assert.deepEqual(r.errores, []);
    assert.equal(r.ok, true);
});

test('parámetros · todo campo declarado existe en DEFAULTS (sin metadatos huérfanos)', () => {
    for (const sec of SECCIONES) {
        for (const c of sec.campos) {
            assert.notEqual(leerPath(DEFAULTS, c.path), undefined, `falta ${c.path}`);
        }
    }
    for (const l of LISTAS) {
        assert.ok(Array.isArray(leerPath(DEFAULTS, l.path)), `falta lista ${l.path}`);
    }
});

test('parámetros · monto con decimales es rechazado (entero-COP)', () => {
    const data = escribirPath(DEFAULTS, 'autoAprobacionMax', 50000.5);
    const r = validarConfigCartera(data);
    assert.equal(r.ok, false);
    assert.match(r.errores.join(' '), /entero/);
});

test('parámetros · fuera de rango es rechazado', () => {
    const data = escribirPath(DEFAULTS, 'slaRevisionDias', 0);
    assert.equal(validarConfigCartera(data).ok, false);
});

test('parámetros · lista vacía es rechazada', () => {
    const data = { ...DEFAULTS, mediosPago: [] };
    assert.equal(validarConfigCartera(data).ok, false);
});

test('parámetros · valores con espacios/caracteres raros en listas son rechazados', () => {
    const data = { ...DEFAULTS, motivosAnulacion: ['ERROR REGISTRO'] };
    assert.equal(validarConfigCartera(data).ok, false);
});

test('parámetros · neutro que no existe en motivos de ajuste es rechazado', () => {
    const data = { ...DEFAULTS, motivosNeutros: ['ERROR_REGISTRO', 'NO_EXISTE'] };
    const r = validarConfigCartera(data);
    assert.equal(r.ok, false);
    assert.match(r.errores.join(' '), /NO_EXISTE/);
});

test('parámetros · DESCUENTO_AUTORIZADO/CASTIGO/OTRO jamás pueden ser neutros (política A.3)', () => {
    for (const prohibido of ['DESCUENTO_AUTORIZADO', 'CASTIGO', 'OTRO']) {
        const data = { ...DEFAULTS, motivosNeutros: [...DEFAULTS.motivosNeutros, prohibido] };
        assert.equal(validarConfigCartera(data).ok, false, `${prohibido} debió ser rechazado`);
    }
});

test('parámetros · escribirPath no muta el objeto original (anidado)', () => {
    const data = escribirPath(DEFAULTS, 'criteriosCastigo.moraDias', 400);
    assert.equal(leerPath(data, 'criteriosCastigo.moraDias'), 400);
    assert.equal(DEFAULTS.criteriosCastigo.moraDias, 360);
});
