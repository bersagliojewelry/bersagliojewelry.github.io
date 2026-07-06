import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    ESTADO_PEDIDO, estadoPedido, canalLabel, medioLabel, entregaLabel,
    nombreComprador, direccionTexto, resumenPedido,
    idVisible, normalizarCodigo, pedidoCoincide,
} from '../js/admin/pedidos-format.js';

// Censo canónico del backend (functions/pedidos-core.js + webhook + reaper). Si el backend
// agrega un estado y este mapa no lo conoce, este test lo delata (paridad cliente↔CF).
const ESTADOS_BACKEND = ['pago_pendiente', 'pago_por_verificar', 'pagado', 'pagado_sin_stock', 'a_revisar', 'expirado', 'anulado'];

test('cubre TODOS los estados que escribe el backend', () => {
    for (const e of ESTADOS_BACKEND) {
        assert.ok(ESTADO_PEDIDO[e], `falta el estado '${e}' en ESTADO_PEDIDO`);
        assert.ok(ESTADO_PEDIDO[e].label, `estado '${e}' sin label`);
        assert.match(ESTADO_PEDIDO[e].pill, /^(green|gold|emerald|red|gray)$/, `estado '${e}' con pill fuera del design-system`);
    }
});

test('estado desconocido NO rompe (fallback gris con el valor crudo)', () => {
    assert.deepEqual(estadoPedido('preparacion'), { label: 'preparacion', pill: 'gray' });
    assert.equal(estadoPedido(undefined).label, '—');
});

test('labels de canal/medio/entrega', () => {
    assert.equal(canalLabel('pos'), 'Mostrador');
    assert.equal(canalLabel('web'), 'Web');
    assert.equal(medioLabel('wompi'), 'Wompi');
    assert.equal(medioLabel('efectivo'), 'Efectivo');
    assert.equal(entregaLabel('tienda'), 'Recoge en tienda');
    assert.equal(entregaLabel('nacional'), 'Envío nacional');
    assert.equal(entregaLabel(null), '');
});

test('nombreComprador: web con shipping / mostrador sin shipping', () => {
    assert.equal(nombreComprador({ shipping: { firstName: 'María', lastName: 'Pérez' } }), 'María Pérez');
    assert.equal(nombreComprador({ shipping: { firstName: 'María' } }), 'María');
    assert.equal(nombreComprador({ shipping: null }), '');
    assert.equal(nombreComprador({}), '');
});

test('direccionTexto arma la línea solo con lo que hay', () => {
    assert.equal(direccionTexto({ address: 'Cll 1 #2-3', city: 'Bogotá', country: 'Colombia', zip: '110111' }),
        'Cll 1 #2-3, Bogotá, Colombia (110111)');
    assert.equal(direccionTexto({ city: 'Bogotá' }), 'Bogotá');
    assert.equal(direccionTexto(null), '');
});

test('§166 idVisible: código público primero; fallback legacy #interno; nunca inventa', () => {
    assert.equal(idVisible({ codigo: 'BJ-7K4M-Q2X9', numero: 7 }), 'BJ-7K4M-Q2X9');
    assert.equal(idVisible({ numero: 7 }), '#7');
    assert.equal(idVisible({}), '—');
});

test('§166 normalizarCodigo: mayúsculas y sin ruido (guiones/espacios/minúsculas de WhatsApp)', () => {
    assert.equal(normalizarCodigo(' bj-7k4m-q2x9 '), 'BJ7K4MQ2X9');
    assert.equal(normalizarCodigo('BJ 7K4M Q2X9'), 'BJ7K4MQ2X9');
    assert.equal(normalizarCodigo(''), '');
});

test('§166 pedidoCoincide: tolerante — código parcial/sin guiones, sufijo, #interno, pieza, cliente', () => {
    const p = { codigo: 'BJ-7K4M-Q2X9', numero: 7, pieceName: 'Anillo Alma', shipping: { firstName: 'María', lastName: 'Pérez' } };
    for (const q of ['bj-7k4m-q2x9', 'BJ7K4MQ2X9', '7k4m', 'q2x9', 'Q2X9 ', '#7', '7', 'alma', 'maría', 'pérez', ''])
        assert.equal(pedidoCoincide(p, q), true, `debía coincidir: '${q}'`);
    for (const q of ['BJ-AAAA-BBBB', 'zafiro', '99'])
        assert.equal(pedidoCoincide(p, q), false, `NO debía coincidir: '${q}'`);
});

test('resumenPedido: pedido web completo (todas las líneas, código §166)', () => {
    const r = resumenPedido({
        numero: 7, codigo: 'BJ-7K4M-Q2X9', pieceName: 'Anillo Alma', total: 2500000, estado: 'pagado', medio: 'wompi', canal: 'web',
        tipoEntrega: 'nacional',
        shipping: { firstName: 'María', lastName: 'Pérez', docType: 'CC', docNumber: '123', phone: '3001234567', email: 'm@x.co', address: 'Cll 1', city: 'Bogotá', country: 'Colombia', zip: '' },
    });
    assert.match(r, /^Pedido BJ-7K4M-Q2X9 · Bersaglio$/m);
    assert.ok(!/#7/.test(r), 'el resumen va al CLIENTE: jamás el correlativo interno');
    assert.match(r, /^Pieza: Anillo Alma$/m);
    assert.match(r, /^Total: \$2\.500\.000$/m);
    assert.match(r, /^Estado: Pagado · Wompi · Web$/m);
    assert.match(r, /^Cliente: María Pérez \(CC 123\)$/m);
    assert.match(r, /^Tel: 3001234567$/m);
    assert.match(r, /^Entrega: Envío nacional — Cll 1, Bogotá, Colombia$/m);
});

test('resumenPedido: venta de mostrador (sin shipping) omite líneas vacías', () => {
    const r = resumenPedido({ numero: 3, codigo: 'BJ-AAAA-BBBB', pieceName: 'Dije Sol', total: 900000, estado: 'pagado', medio: 'efectivo', canal: 'pos' });
    assert.match(r, /^Estado: Pagado · Efectivo · Mostrador$/m);
    assert.doesNotMatch(r, /Cliente:|Tel:|Email:|Entrega:/);
});
