/**
 * tests/caja-format.test.mjs — helper PURO de caja/bóveda (F2.0 B5b-1).
 * `node --test tests/caja-format.test.mjs` (npm run test:caja-format). Sin DOM ni Firestore.
 *
 * Foco: la ecuación del cajón `efectivoEnCajon()` DEBE ser espejo EXACTO de cerrarTurnoCore
 * (functions/caja-core.js §8.1.7). Si el core cambia el signo de un término, este test lo caza.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    efectivoEnCajon, trasladoSugerido, superaLimite,
    CONCEPTOS_CAJA, conceptoLabel, tipoBovedaLabel, aprobacionInfo, esDestructivo,
} from '../js/admin/caja-format.js';

test('efectivoEnCajon — ecuación completa (§8.1.7)', () => {
    // fondo + ventas + ingresos − egresos + boveda_a_cajon − cajon_a_boveda
    assert.equal(efectivoEnCajon({
        fondoApertura: 200000, ventasEfectivo: 1500000, ingresos: 50000,
        egresos: 30000, bovedaACajon: 100000, cajonABoveda: 800000,
    }), 200000 + 1500000 + 50000 - 30000 + 100000 - 800000);   // = 1020000
});

test('efectivoEnCajon — turno recién abierto = solo el fondo', () => {
    assert.equal(efectivoEnCajon({ fondoApertura: 200000 }), 200000);
    assert.equal(efectivoEnCajon({}), 0);
});

test('efectivoEnCajon — puede ser negativo (anomalía real, sin clamp igual que el core)', () => {
    assert.equal(efectivoEnCajon({ fondoApertura: 0, egresos: 50000 }), -50000);
});

test('efectivoEnCajon — coacciona strings/basura a entero seguro (sin |0 de 32 bits)', () => {
    assert.equal(efectivoEnCajon({ fondoApertura: '200000', ventasEfectivo: '3000000000' }), 3000200000);
    assert.equal(efectivoEnCajon({ fondoApertura: null, ventasEfectivo: undefined, ingresos: NaN }), 0);
});

test('trasladoSugerido — deja el cajón en el fondo de trabajo, redondeado a mil', () => {
    assert.equal(trasladoSugerido(4500000, 200000), 4300000);   // 4.5M − 200k = 4.3M
    assert.equal(trasladoSugerido(4500500, 200000), 4301000);   // redondea hacia arriba al mil
    assert.equal(trasladoSugerido(150000, 200000), 0);          // por debajo del fondo → nada que trasladar
    assert.equal(trasladoSugerido(200000, 200000), 0);
});

test('superaLimite — ∞/ausente/0 nunca alarma (antirrobo apagado §8.6.2)', () => {
    assert.equal(superaLimite(9999999, Infinity), false);
    assert.equal(superaLimite(9999999, null), false);
    assert.equal(superaLimite(9999999, 0), false);
    assert.equal(superaLimite(9999999, undefined), false);
});

test('superaLimite — dispara SOLO por encima del límite (no en el borde)', () => {
    assert.equal(superaLimite(4000000, 4000000), false);   // en el límite → aún cabe
    assert.equal(superaLimite(4000001, 4000000), true);
    assert.equal(superaLimite(3999999, 4000000), false);
});

test('conceptos de caja: lista cerrada + etiquetas + fallback', () => {
    assert.deepEqual(CONCEPTOS_CAJA, ['pago_domiciliario', 'compra_empaques', 'adelanto_vendedora', 'gasto_menor', 'retiro_socio', 'otro']);
    assert.equal(conceptoLabel('retiro_socio'), 'Retiro de socio');
    assert.equal(conceptoLabel('desconocido'), 'desconocido');   // fallback nunca rompe la UI
});

test('tipos de bóveda + estado de aprobación', () => {
    assert.equal(tipoBovedaLabel('cajon_a_boveda'), 'Cajón → Bóveda');
    assert.equal(tipoBovedaLabel('boveda_a_banco'), 'Bóveda → Banco (consignación)');
    assert.equal(aprobacionInfo('pendiente_aprobacion').pill, 'gold');
    assert.equal(aprobacionInfo('aprobado').pill, 'green');
    assert.equal(aprobacionInfo('inexistente'), null);
    assert.equal(esDestructivo({ estado: 'pendiente_aprobacion' }), true);
    assert.equal(esDestructivo({ estado: 'aprobado' }), false);
});
