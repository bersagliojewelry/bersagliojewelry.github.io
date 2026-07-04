import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    ESTADO_PEDIDO, estadoPedido, canalLabel, medioLabel, entregaLabel,
    nombreComprador, direccionTexto, resumenPedido,
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

test('resumenPedido: pedido web completo (todas las líneas)', () => {
    const r = resumenPedido({
        numero: 7, pieceName: 'Anillo Alma', total: 2500000, estado: 'pagado', medio: 'wompi', canal: 'web',
        tipoEntrega: 'nacional',
        shipping: { firstName: 'María', lastName: 'Pérez', docType: 'CC', docNumber: '123', phone: '3001234567', email: 'm@x.co', address: 'Cll 1', city: 'Bogotá', country: 'Colombia', zip: '' },
    });
    assert.match(r, /^Pedido #7 · Bersaglio$/m);
    assert.match(r, /^Pieza: Anillo Alma$/m);
    assert.match(r, /^Total: \$2\.500\.000$/m);
    assert.match(r, /^Estado: Pagado · Wompi · Web$/m);
    assert.match(r, /^Cliente: María Pérez \(CC 123\)$/m);
    assert.match(r, /^Tel: 3001234567$/m);
    assert.match(r, /^Entrega: Envío nacional — Cll 1, Bogotá, Colombia$/m);
});

test('resumenPedido: venta de mostrador (sin shipping) omite líneas vacías', () => {
    const r = resumenPedido({ numero: 3, pieceName: 'Dije Sol', total: 900000, estado: 'pagado', medio: 'efectivo', canal: 'pos' });
    assert.match(r, /^Estado: Pagado · Efectivo · Mostrador$/m);
    assert.doesNotMatch(r, /Cliente:|Tel:|Email:|Entrega:/);
});
