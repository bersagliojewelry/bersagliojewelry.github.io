/**
 * F1-CORE — tests PUROS de la máquina de estados (spec 2026-07-06-f1-core §2/§3.4).
 * La TABLA es el contrato: F2 añade filas, no reabre la CF. ESTADOS_CON_DINERO se DERIVA
 * de la tabla (paridad mecánica) — es lo que protege el arqueo del P0 (dinero que "se esfuma"
 * al avanzar un pedido antes del cierre Z).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { TRANSICIONES, ESTADOS_CON_DINERO, dayKeyBogota } = require('./pedidos-core.js');

test('tabla de transiciones EXACTA (spec §2 — cambiarla = decisión, no accidente)', () => {
    assert.deepEqual(TRANSICIONES, {
        pagado:            ['preparacion', 'entregado', 'cancelado'],
        preparacion:       ['despacho_nacional', 'entrega_local', 'listo_retiro', 'cancelado'],
        despacho_nacional: ['entregado'],
        entrega_local:     ['entregado'],
        listo_retiro:      ['entregado'],
        entregado:         ['reembolsado'],
    });
});

test('ESTADOS_CON_DINERO = {pagado} ∪ alcanzables desde pagado − {cancelado, reembolsado} (paridad derivada)', () => {
    const alcanzables = new Set(['pagado']);
    let creció = true;
    while (creció) {
        creció = false;
        for (const e of [...alcanzables]) {
            for (const dest of (TRANSICIONES[e] || [])) {
                if (!alcanzables.has(dest)) { alcanzables.add(dest); creció = true; }
            }
        }
    }
    alcanzables.delete('cancelado');
    alcanzables.delete('reembolsado');
    assert.deepEqual([...ESTADOS_CON_DINERO].sort(), [...alcanzables].sort());
    // Anti-regresión del P0: los post-pago SIGUEN contando en el arqueo.
    for (const e of ['pagado', 'preparacion', 'despacho_nacional', 'entrega_local', 'listo_retiro', 'entregado'])
        assert.ok(ESTADOS_CON_DINERO.has(e), `'${e}' debe contar dinero en el cierre Z`);
    for (const e of ['cancelado', 'reembolsado', 'anulado', 'expirado', 'pago_pendiente', 'pago_por_verificar'])
        assert.ok(!ESTADOS_CON_DINERO.has(e), `'${e}' NO debe contar dinero`);
});

test('dayKeyBogota: día LOCAL UTC-5 (patrón L-30), determinista por nowMs', () => {
    // 2026-07-07 02:30 UTC = 2026-07-06 21:30 Bogotá → el dayKey es 06, no 07.
    assert.equal(dayKeyBogota(Date.UTC(2026, 6, 7, 2, 30)), '2026-07-06');
    assert.equal(dayKeyBogota(Date.UTC(2026, 6, 7, 12, 0)), '2026-07-07');
});
