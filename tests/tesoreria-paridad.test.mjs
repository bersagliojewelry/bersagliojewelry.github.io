/**
 * PARIDAD de tesorería (§5.8, patrón aging-paridad): `js/admin/tesoreria-format.js` (panel)
 * DEBE computar EXACTAMENTE lo mismo que `functions/tesoreria-core.js` (servidor) — el saldo
 * que ve Kary y el que sella la CF son EL MISMO número (invariante 2, L-03: una sola fórmula).
 * Byte-compare imposible (CJS servidor ↔ ESM cliente) → paridad CONDUCTUAL exhaustiva: cada
 * tipo de movimiento, direcciones, inversos, pendientes/rechazados y constantes del contrato.
 *
 *   npm run test:teso-paridad
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import * as cliente from '../js/admin/tesoreria-format.js';

const require = createRequire(import.meta.url);
const servidor = require('../functions/tesoreria-core.js');

test('paridad · constantes del contrato IDÉNTICAS (signos, tipos, categorías, estados)', () => {
    assert.deepEqual({ ...cliente.SIGNO_TESORERIA }, { ...servidor.SIGNO_TESORERIA });
    assert.deepEqual([...cliente.TIPOS_MOV], [...servidor.TIPOS_MOV]);
    assert.deepEqual([...cliente.TIPOS_DERIVADOS], [...servidor.TIPOS_DERIVADOS]);
    assert.deepEqual([...cliente.TIPOS_VIRTUALES], [...servidor.TIPOS_VIRTUALES]);
    assert.deepEqual([...cliente.TIPOS_PENDIENTES], [...servidor.TIPOS_PENDIENTES]);
    assert.deepEqual([...cliente.CATEGORIAS_GASTO], [...servidor.CATEGORIAS_GASTO]);
    assert.deepEqual([...cliente.DIRECCIONES], [...servidor.DIRECCIONES]);
    assert.deepEqual([...cliente.ESTADOS_MOV], [...servidor.ESTADOS_MOV]);
});

test('paridad · V14: toda etiqueta humana cubre exactamente los tipos del contrato', () => {
    assert.deepEqual(Object.keys(cliente.ETIQUETAS_TIPO).sort(), [...servidor.TIPOS_MOV].sort());
});

// Fixture EXHAUSTIVO: cada tipo con signo fijo + los dos derivados + estados no-firmes.
const FIXTURE = [
    { id: 'a', tipo: 'ingreso_venta', monto: { monto: 1000000 }, estado: 'activo' },
    { id: 'b', tipo: 'abono_cartera', monto: { monto: 200000 }, estado: 'activo' },
    { id: 'c', tipo: 'pago_proveedor', monto: { monto: 350000 }, estado: 'activo' },
    { id: 'd', tipo: 'gasto', monto: { monto: 45000 }, categoria: 'gmf', estado: 'activo' },
    { id: 'e', tipo: 'traslado_in', monto: { monto: 80000 }, estado: 'activo' },
    { id: 'f', tipo: 'traslado_out', monto: { monto: 60000 }, estado: 'activo' },
    { id: 'g', tipo: 'aporte_socia', monto: { monto: 500000 }, estado: 'activo' },
    { id: 'h', tipo: 'reembolso_socia', monto: { monto: 100000 }, estado: 'activo' },
    { id: 'i', tipo: 'retiro_socia', monto: { monto: 70000 }, estado: 'pendiente_aprobacion' },   // NO cuenta
    { id: 'j', tipo: 'consignacion_in', monto: { monto: 250000 }, estado: 'activo' },
    { id: 'k', tipo: 'retiro_efectivo_out', monto: { monto: 90000 }, estado: 'activo' },
    { id: 'l', tipo: 'ajuste_conciliacion', direccion: 'entrada', monto: { monto: 15000 }, estado: 'activo' },
    { id: 'm', tipo: 'ajuste_conciliacion', direccion: 'salida', monto: { monto: 5000 }, estado: 'activo' },   // test 15
    { id: 'n', tipo: 'ajuste_inverso', refDocumento: 'd', monto: { monto: 45000 }, estado: 'activo' },         // netea el gasto
    { id: 'o', tipo: 'gasto', monto: { monto: 999999 }, categoria: 'otros', estado: 'rechazado' },             // NO cuenta
];

test('paridad · computeSaldoCuenta servidor ≡ cliente sobre el fixture exhaustivo', () => {
    const s = servidor.computeSaldoCuenta({ monto: 300000 }, FIXTURE);
    const c = cliente.computeSaldoCuenta({ monto: 300000 }, FIXTURE);
    assert.equal(s, c);
    // Y el número es el esperado a mano: 300000 +1000000+200000−350000−45000+80000−60000
    // +500000−100000 +250000−90000 +15000−5000 +45000 = 1740000
    assert.equal(s, 1740000);
});

test('paridad · mismos resultados en saldo negativo y lista vacía', () => {
    const negativo = [{ id: 'x', tipo: 'retiro_efectivo_out', monto: { monto: 1800000 }, estado: 'activo' }];
    assert.equal(servidor.computeSaldoCuenta(0, negativo), cliente.computeSaldoCuenta(0, negativo));
    assert.equal(servidor.computeSaldoCuenta({ monto: 42 }, []), cliente.computeSaldoCuenta({ monto: 42 }, []));
});

test('paridad · mismas anomalías GRITAN igual en ambos lados (tipo desconocido / direccion inválida)', () => {
    for (const mod of [servidor, cliente]) {
        assert.throws(() => mod.computeSaldoCuenta(0, [{ id: 'z', tipo: 'invento', monto: { monto: 1 } }]), /sin signo definido/);
        assert.throws(() => mod.computeSaldoCuenta(0, [{ id: 'z', tipo: 'ajuste_conciliacion', monto: { monto: 1 } }]), /direccion/);
    }
});
