/**
 * tests/hoy-format.test.mjs — pulso del "Hoy" (F-IA-2 B3 · [OPUS-4.8]).
 * Fija los helpers PUROS: censo "por entregar", ventas del día (conservación == KPI Pedidos),
 * parseo de timestamps, límites del día y ventana de cobro de cuotas. `node --test`.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    ESTADOS_POR_ENTREGAR, esPorEntregar, tsAMs, rangoDia, ventasDeHoy, pedidosPorEntregar, cuotaEnVentana,
} from '../js/admin/hoy-format.js';

test('esPorEntregar: post-pago pre-entrega true; terminales y sin-pagar false', () => {
    for (const e of ['pagado', 'preparacion', 'despacho_nacional', 'entrega_local', 'listo_retiro']) {
        assert.equal(esPorEntregar(e), true, `${e} debería contar por entregar`);
    }
    for (const e of ['entregado', 'reembolsado', 'cancelado', 'anulado', 'expirado',
                     'pago_pendiente', 'pago_por_verificar', 'a_revisar', 'pagado_sin_stock']) {
        assert.equal(esPorEntregar(e), false, `${e} NO debería contar por entregar`);
    }
    assert.equal(esPorEntregar(undefined), false);
});

test('tsAMs: Timestamp | seconds | ISO | Date | nulo', () => {
    assert.equal(tsAMs({ toMillis: () => 1700000000000 }), 1700000000000);
    assert.equal(tsAMs({ seconds: 1700000000 }), 1700000000000);
    assert.equal(tsAMs('2026-07-10T12:00:00Z'), Date.parse('2026-07-10T12:00:00Z'));
    const d = new Date(1700000000000);
    assert.equal(tsAMs(d), 1700000000000);
    assert.equal(tsAMs(null), 0);
    assert.equal(tsAMs('no-fecha'), 0);
});

test('rangoDia: inicio < fin, mismo día, fin inclusivo (23:59:59.999)', () => {
    const now = new Date(2026, 6, 10, 15, 30, 0);   // 10-jul-2026 local
    const { inicioMs, finMs } = rangoDia(now);
    assert.ok(inicioMs < finMs);
    assert.equal(new Date(inicioMs).getHours(), 0);
    assert.equal(new Date(finMs).getHours(), 23);
    assert.equal(finMs - inicioMs, 86399999);        // día completo menos 1 ms
});

test('ventasDeHoy: solo el día, y la suma excluye estados sin dinero (== censo Pedidos)', () => {
    const { inicioMs, finMs } = rangoDia(new Date(2026, 6, 10, 10));
    const hoyMs = new Date(2026, 6, 10, 9).getTime();
    const ayerMs = new Date(2026, 6, 9, 9).getTime();
    const pedidos = [
        { estado: 'pagado',         total: 100000, createdAt: { toMillis: () => hoyMs } },
        { estado: 'entregado',      total: 50000,  createdAt: { toMillis: () => hoyMs } },
        { estado: 'anulado',        total: 999999, createdAt: { toMillis: () => hoyMs } },   // sin dinero → fuera de la suma
        { estado: 'reembolsado',    total: 30000,  createdAt: { toMillis: () => hoyMs } },   // sin dinero → fuera de la suma
        { estado: 'pagado',         total: 70000,  createdAt: { toMillis: () => ayerMs } },  // ayer → fuera del día
    ];
    const r = ventasDeHoy(pedidos, inicioMs, finMs);
    assert.equal(r.n, 4);                 // los 4 de HOY (incluye los sin-dinero en el conteo n)
    assert.equal(r.totalCOP, 150000);     // solo pagado+entregado de hoy (100k + 50k)
    assert.equal(r.excluidos, 2);         // anulado + reembolsado
});

test('ventasDeHoy: sin ventas hoy = estado-cero limpio', () => {
    const { inicioMs, finMs } = rangoDia(new Date(2026, 6, 10, 10));
    assert.deepEqual(ventasDeHoy([], inicioMs, finMs), { n: 0, totalCOP: 0, excluidos: 0 });
    assert.equal(ventasDeHoy(null, inicioMs, finMs).n, 0);
});

test('pedidosPorEntregar: filtra al set logístico y conserva orden', () => {
    const lista = [
        { id: 'a', estado: 'pagado' },
        { id: 'b', estado: 'entregado' },
        { id: 'c', estado: 'despacho_nacional' },
        { id: 'd', estado: 'pago_pendiente' },
    ];
    assert.deepEqual(pedidosPorEntregar(lista).map(p => p.id), ['a', 'c']);
    assert.deepEqual(pedidosPorEntregar([]), []);
});

test('cuotaEnVentana: hoy y hoy+7 dentro; hoy+8 fuera; vencida (pasado) dentro; sin plan null', () => {
    const hoy = '2026-07-10';
    assert.deepEqual(cuotaEnVentana({ proximaCuota: { fecha: '2026-07-10', monto: 5000 } }, hoy), { fecha: '2026-07-10', monto: 5000 });
    assert.deepEqual(cuotaEnVentana({ proximaCuota: { fecha: '2026-07-17', monto: 5000 } }, hoy), { fecha: '2026-07-17', monto: 5000 }); // hoy+7 inclusive
    assert.equal(cuotaEnVentana({ proximaCuota: { fecha: '2026-07-18', monto: 5000 } }, hoy), null);                                     // hoy+8 fuera
    assert.deepEqual(cuotaEnVentana({ proximaCuota: { fecha: '2026-07-01', monto: 5000 } }, hoy), { fecha: '2026-07-01', monto: 5000 }); // vencida → dentro
    assert.equal(cuotaEnVentana(null, hoy), null);
    assert.equal(cuotaEnVentana({ proximaCuota: null }, hoy), null);
});

test('ESTADOS_POR_ENTREGAR es el set esperado (sin terminales ni excepciones)', () => {
    assert.deepEqual([...ESTADOS_POR_ENTREGAR].sort(),
        ['despacho_nacional', 'entrega_local', 'listo_retiro', 'pagado', 'preparacion'].sort());
});
