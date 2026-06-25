/**
 * Reparto inteligente de columnas (TODO-36) — la regla SSoT de las grillas (destacadas/catálogo/
 * relacionados). Fija los ejemplos de Daniel (5→3+2, 6→3+3, 7→4+3, 8→4+4) + bordes (0,1) y N grande.
 *
 *   node --test tests/grid-balance.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { balancedCols } from '../js/core/grid-balance.js';

test('balancedCols: ejemplos de Daniel (máx 4)', () => {
    assert.equal(balancedCols(4, 4), 4);   // 4 en una fila
    assert.equal(balancedCols(5, 4), 3);   // 3 + 2 (NO 4 + 1)
    assert.equal(balancedCols(6, 4), 3);   // 3 + 3
    assert.equal(balancedCols(7, 4), 4);   // 4 + 3
    assert.equal(balancedCols(8, 4), 4);   // 4 + 4
    assert.equal(balancedCols(9, 4), 3);   // 3 + 3 + 3
});

test('balancedCols: bordes (0, 1, 2, 3) nunca colapsan ni exceden N', () => {
    assert.equal(balancedCols(0, 4), 1);   // sin tarjetas → 1 (inerte)
    assert.equal(balancedCols(1, 4), 1);   // 1 sola
    assert.equal(balancedCols(2, 4), 2);
    assert.equal(balancedCols(3, 4), 3);
});

test('balancedCols: N grande se queda en el máx (sin filas casi vacías raras)', () => {
    for (let n = 10; n <= 24; n++) {
        const c = balancedCols(n, 4);
        assert.ok(c >= 1 && c <= 4, `cols(${n}) fuera de rango: ${c}`);
        // última fila nunca con 1 sola tarjeta si se puede evitar (sin huérfana): holes < cols
        const holes = Math.ceil(n / c) * c - n;
        assert.ok(holes < c, `cols(${n})=${c} deja huérfana (holes=${holes})`);
    }
});

test('balancedCols: respeta un máximo distinto (tablet=3)', () => {
    assert.equal(balancedCols(5, 3), 3);   // 3 + 2
    assert.equal(balancedCols(4, 3), 2);   // 2 + 2 (no 3 + 1)
    assert.equal(balancedCols(7, 3), 3);   // 3 + 3 + 1 → holes<cols ok (1<3)
});

test('balancedCols: entradas inválidas degradan a 1 (no NaN/0)', () => {
    assert.equal(balancedCols(undefined, 4), 1);
    assert.equal(balancedCols(-3, 4), 1);
    assert.equal(balancedCols(2.7, 4), 2);   // floor
});
