import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import {
    ESTADO_PEDIDO, estadoPedido, canalLabel, medioLabel, entregaLabel,
    nombreComprador, direccionTexto, resumenPedido,
    idVisible, normalizarCodigo, pedidoCoincide,
    TRANSICIONES_PEDIDO, ACCION_TRANSICION, ESTADOS_SIN_DINERO,
    totalesFiltro, itemsDePedido, plantillaDespacho, plantillaSinStock,
} from '../js/admin/pedidos-format.js';

// Frontera CJS↔ESM (patrón corte-insumos/derivarEstado): el test lee la CF REAL.
const require = createRequire(import.meta.url);
const core = require('../functions/pedidos-core.js');

// Censo canónico del backend (pedidos-core.js + webhook + reaper + F1-CORE). Si el backend
// agrega un estado y este mapa no lo conoce, este test lo delata (paridad cliente↔CF).
const ESTADOS_BACKEND = [
    'pago_pendiente', 'pago_por_verificar', 'pagado', 'pagado_sin_stock', 'a_revisar', 'expirado', 'anulado',
    'preparacion', 'despacho_nacional', 'entrega_local', 'listo_retiro', 'entregado', 'cancelado', 'reembolsado',
];

test('cubre TODOS los estados que escribe el backend', () => {
    for (const e of ESTADOS_BACKEND) {
        assert.ok(ESTADO_PEDIDO[e], `falta el estado '${e}' en ESTADO_PEDIDO`);
        assert.ok(ESTADO_PEDIDO[e].label, `estado '${e}' sin label`);
        assert.match(ESTADO_PEDIDO[e].pill, /^(green|gold|emerald|red|gray)$/, `estado '${e}' con pill fuera del design-system`);
    }
});

test('estado desconocido NO rompe (fallback gris con el valor crudo)', () => {
    assert.deepEqual(estadoPedido('estado_futuro_f9'), { label: 'estado_futuro_f9', pill: 'gray' });
    assert.equal(estadoPedido(undefined).label, '—');
});

// ─── F1-CORE: paridad del espejo con la CF (el corazón de la spec §2) ──────────

test('F1-CORE paridad: TRANSICIONES_PEDIDO (cliente) === TRANSICIONES (CF), deepEqual', () => {
    assert.deepEqual(TRANSICIONES_PEDIDO, core.TRANSICIONES,
        'el espejo del cliente divergió de la tabla del backend — sincronízalos en el MISMO commit');
});

test('F1-CORE: todo estado DESTINO de la tabla tiene acción (botón) y label de estado', () => {
    const destinos = new Set(Object.values(TRANSICIONES_PEDIDO).flat());
    for (const d of destinos) {
        assert.ok(ACCION_TRANSICION[d], `destino '${d}' sin entrada en ACCION_TRANSICION`);
        assert.ok(ACCION_TRANSICION[d].label, `destino '${d}' sin label de botón`);
        assert.match(ACCION_TRANSICION[d].tono, /^(primary|danger)$/, `destino '${d}' con tono desconocido`);
        assert.ok(ESTADO_PEDIDO[d], `destino '${d}' sin label/pill en ESTADO_PEDIDO`);
    }
});

test('F1-CORE totalesFiltro: n cuenta todo; la suma excluye los sin-dinero (spec §4.2 + reembolsado)', () => {
    const r = totalesFiltro([
        { estado: 'pagado',           total: 1000000 },
        { estado: 'entregado',        total: 500000 },
        { estado: 'preparacion',      total: 200000 },
        { estado: 'pago_por_verificar', total: 300000 },   // registrado, cuenta (pipeline POS)
        { estado: 'expirado',         total: 900000 },     // fuera
        { estado: 'anulado',          total: 900000 },     // fuera
        { estado: 'cancelado',        total: 900000 },     // fuera
        { estado: 'pago_pendiente',   total: 900000 },     // fuera
        { estado: 'reembolsado',      total: 900000 },     // fuera (dinero devuelto)
    ]);
    assert.equal(r.n, 9);
    assert.equal(r.totalCOP, 2000000);
    assert.equal(r.excluidos, 5);
    assert.deepEqual(totalesFiltro([]), { n: 0, totalCOP: 0, excluidos: 0 });
    for (const e of ESTADOS_SIN_DINERO) assert.ok(ESTADO_PEDIDO[e], `ESTADOS_SIN_DINERO tiene un estado fantasma: '${e}'`);
});

test('F1-CORE itemsDePedido: legacy fabrica 1 línea; nuevo devuelve items[] tal cual; vacío = []', () => {
    assert.deepEqual(itemsDePedido({ pieceId: 'p1', pieceName: 'Anillo Alma', pieceSlug: 'anillo-alma', total: 2500000 }), [
        { pieceId: 'p1', pieceName: 'Anillo Alma', pieceSlug: 'anillo-alma', cantidad: 1, precio: 2500000, costoSnapshot: null },
    ]);
    const items = [{ pieceId: 'x', pieceName: 'Dije', pieceSlug: 'dije', cantidad: 1, precio: 900000, costoSnapshot: null }];
    assert.equal(itemsDePedido({ items, pieceId: 'IGNORADO' }), items);
    assert.deepEqual(itemsDePedido({}), []);
    assert.deepEqual(itemsDePedido(null), []);
});

test('F1-CORE plantillaDespacho: texto EXACTO de la spec §3.5 (código público, nunca #interno)', () => {
    const p = { codigo: 'BJ-7K4M-Q2X9', numero: 7, transportadora: 'Servientrega', guia: 'GU123456' };
    assert.equal(plantillaDespacho(p), 'Tu pedido BJ-7K4M-Q2X9 va en camino con Servientrega, guía GU123456. — Bersaglio');
    assert.ok(!plantillaDespacho(p).includes('#7'));
});

test('F1-CORE plantillaSinStock: voz de marca — código, pieza y las DOS salidas (refabricar o reembolsar)', () => {
    const t = plantillaSinStock({ codigo: 'BJ-AAAA-BBBB', pieceName: 'Anillo Alma', shipping: { firstName: 'María', lastName: 'Pérez' } });
    assert.ok(t.includes('Hola María'));
    assert.ok(t.includes('BJ-AAAA-BBBB'));
    assert.ok(t.includes('«Anillo Alma»'));
    assert.ok(/elaborarla de nuevo/.test(t) && /devolverte el dinero/.test(t));
    assert.ok(!t.includes('#'));
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
