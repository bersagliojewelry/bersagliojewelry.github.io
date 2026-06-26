/**
 * Unit tests del Modelo de Inventario v3 (TODO-40 · Fase 1 · Bloque 1). PURO → sin emulador.
 *   node --test tests/inventario-migracion.test.mjs
 *
 * Cubre: derivación de estado, disponibilidad, migración legacy→v3 (idempotente) e invariantes
 * (gate del comité v2 · C1). Tests-en-rojo-primero del plan F1 (§12.3).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    derivarEstado, esDisponible, migrarPiezaV3, violacionesInvariantes,
    STOCK_TYPES, VISIBILIDADES,
} from '../js/admin/inventario-model.js';

// ─── derivarEstado (SSoT = cantidad) ──────────────────────────────────────────
test('derivarEstado: finito con stock → disponible', () => {
    assert.equal(derivarEstado('finito', 3), 'disponible');
    assert.equal(derivarEstado('finito', 1), 'disponible');
});
test('derivarEstado: finito agotado (0) → agotada (fuera del listado)', () => {
    assert.equal(derivarEstado('finito', 0), 'agotada');
    assert.equal(derivarEstado('finito', -1), 'agotada');   // defensivo
});
test('derivarEstado: finito_refabricable agotado → bajo_pedido (sigue pedible)', () => {
    assert.equal(derivarEstado('finito_refabricable', 0), 'bajo_pedido');
    assert.equal(derivarEstado('finito_refabricable', 2), 'disponible');
});
test('derivarEstado: encargo → siempre disponible (cantidad irrelevante)', () => {
    assert.equal(derivarEstado('encargo', null), 'disponible');
    assert.equal(derivarEstado('encargo', 0), 'disponible');
});
test('esDisponible: agotada = NO; bajo_pedido y encargo = SÍ', () => {
    assert.equal(esDisponible('finito', 0), false);
    assert.equal(esDisponible('finito_refabricable', 0), true);
    assert.equal(esDisponible('encargo', null), true);
    assert.equal(esDisponible('finito', 2), true);
});

// ─── migrarPiezaV3 (legacy → v3) ──────────────────────────────────────────────
test('migración: pieza legacy sin campos → finito, cantidad 1, publica', () => {
    const { cambio, cambios } = migrarPiezaV3({ name: 'Anillo' });
    assert.equal(cambio, true);
    assert.equal(cambios.stockType, 'finito');
    assert.equal(cambios.cantidad, 1);
    assert.equal(cambios.visibilidad, 'publica');
});
test('migración: refabricable:true (bool legacy) → finito_refabricable', () => {
    const { cambios, stockType } = migrarPiezaV3({ refabricable: true, cantidad: 0, estado: 'vendida' });
    assert.equal(stockType, 'finito_refabricable');
    assert.equal(cambios.stockType, 'finito_refabricable');
});
test('migración: vendida legacy → cantidad 0 SIEMPRE (no se confía conteo declarado)', () => {
    const { cambios } = migrarPiezaV3({ stockType: 'finito', cantidad: 5, estado: 'vendida', visibilidad: 'publica' });
    assert.equal(cambios.cantidad, 0);   // pese a cantidad:5 declarada
});
test('migración: encargo → cantidad null (purga D6)', () => {
    const { cambios, cantidad } = migrarPiezaV3({ stockType: 'encargo', cantidad: 3, visibilidad: 'publica' });
    assert.equal(cantidad, null);
    assert.equal(cambios.cantidad, null);
});
test('migración: lote ya válido (finito, cantidad 4, publica) → respeta el conteo', () => {
    const { cantidad, cambios } = migrarPiezaV3({ stockType: 'finito', cantidad: 4, visibilidad: 'publica', estado: 'disponible' });
    assert.equal(cantidad, 4);
    assert.equal('cantidad' in cambios, false);
});
test('migración: IDEMPOTENTE — pieza ya en v3 coherente → cambio false', () => {
    const v3 = { stockType: 'finito', cantidad: 2, visibilidad: 'publica' };
    assert.equal(migrarPiezaV3(v3).cambio, false);
    const v3enc = { stockType: 'encargo', cantidad: null, visibilidad: 'privada' };
    assert.equal(migrarPiezaV3(v3enc).cambio, false);
});

// ─── violacionesInvariantes (gate C1) ─────────────────────────────────────────
test('invariantes: estado vendida + cantidad>0 → viola', () => {
    const v = violacionesInvariantes({ stockType: 'finito', estado: 'vendida', cantidad: 3 });
    assert.ok(v.some(x => x.includes('vendida')));
});
test('invariantes: finito* con cantidad null → viola', () => {
    assert.ok(violacionesInvariantes({ stockType: 'finito', cantidad: null }).some(x => x.includes('cantidad==null')));
});
test('invariantes: encargo con cantidad no-null → viola', () => {
    assert.ok(violacionesInvariantes({ stockType: 'encargo', cantidad: 2 }).some(x => x.includes('encargo')));
});
test('invariantes: pieza v3 sana → cero violaciones', () => {
    assert.deepEqual(violacionesInvariantes({ stockType: 'finito', cantidad: 2, visibilidad: 'publica', estado: 'vendida' && undefined }), []);
    assert.deepEqual(violacionesInvariantes({ stockType: 'encargo', cantidad: null, visibilidad: 'publica' }), []);
    assert.deepEqual(violacionesInvariantes({ stockType: 'finito_refabricable', cantidad: 0, visibilidad: 'privada' }), []);
});
test('invariantes: post-migración de una vendida (cantidad→0) NO viola', () => {
    // Simula el estado RESULTANTE: estado legacy 'vendida' permanece, cantidad migrada a 0.
    const v = violacionesInvariantes({ stockType: 'finito', estado: 'vendida', cantidad: 0, visibilidad: 'publica' });
    assert.deepEqual(v, []);
});

test('constantes: enums esperados', () => {
    assert.deepEqual(STOCK_TYPES, ['finito', 'finito_refabricable', 'encargo']);
    assert.deepEqual(VISIBILIDADES, ['publica', 'privada']);
});
