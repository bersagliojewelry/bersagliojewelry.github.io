// Test puro del modelo de GEMA (TODO-57 §150/§151) — sin emulador ni red.
// Cubre: gemBadge (dato badgeGem → fallback regex → sin gema), tieneGema (array plano),
// y gemDisplayName (nombre canónico para JSON-LD/AEO). node --test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gemBadge, tieneGema, gemDisplayName } from '../js/core/gem-badge.js';

// ───────────────────────── gemBadge ─────────────────────────
test('gemBadge: dato canónico (badgeGem) → chip con label y color de marca', () => {
  const b = gemBadge({ specs: { badgeGem: 'esmeralda' } });
  assert.equal(b.slug, 'esmeralda');
  assert.equal(b.name, 'Esmeralda');
  assert.match(b.color, /^#[0-9A-Fa-f]{6}$/);   // color = dato de la taxonomía, no genérico
});

test('gemBadge: fallback transicional al texto libre (pieza sin migrar)', () => {
  const b = gemBadge({ specs: { stone: 'Rubí Natural' } });   // sin badgeGem → regex
  assert.equal(b.slug, 'rubi');
  assert.equal(b.name, 'Rubí');
});

test('gemBadge: sin gema (oro solo / vacío) → null (el callsite no pinta badge)', () => {
  assert.equal(gemBadge({ specs: { badgeGem: 'oro' } }), null);
  assert.equal(gemBadge({ specs: {} }), null);
  assert.equal(gemBadge({ specs: { stone: 'Oro 18k' } }), null);   // "oro" no es gema reconocida
});

// ───────────────────────── tieneGema (filtros TODO-50) ─────────────────────────
test('tieneGema: array plano gemFilterIds (multi-gema) → array-contains lógico', () => {
  const p = { specs: { gemFilterIds: ['esmeralda', 'diamante'] } };
  assert.equal(tieneGema(p, 'diamante'), true);
  assert.equal(tieneGema(p, 'esmeralda'), true);
  assert.equal(tieneGema(p, 'rubi'), false);
});

test('tieneGema: fallback a la protagonista cuando no hay gemFilterIds', () => {
  assert.equal(tieneGema({ specs: { badgeGem: 'zafiro' } }, 'zafiro'), true);
  assert.equal(tieneGema({ specs: { badgeGem: 'zafiro' } }, 'rubi'), false);
});

// ───────────────────────── gemDisplayName (JSON-LD / AEO) ─────────────────────────
test('gemDisplayName: dato → NOMBRE CANÓNICO limpio (no "Natural" ni truncado)', () => {
  assert.equal(gemDisplayName({ badgeGem: 'esmeralda', stone: 'Esmeralda Natural' }), 'Esmeralda');
  assert.equal(gemDisplayName({ badgeGem: 'diamante' }), 'Diamante');
});

test('gemDisplayName: sin badgeGem → regex sobre la prosa → label canónico', () => {
  assert.equal(gemDisplayName({ stone: 'Esmeralda Natural' }), 'Esmeralda');
});

test('gemDisplayName: gema NO reconocida → conserva la prosa (no la pierde)', () => {
  assert.equal(gemDisplayName({ stone: 'Tanzanita rara' }), 'Tanzanita rara');
});

test('gemDisplayName: sin gema (oro/null/vacío) → "" (el callsite filtra la propiedad)', () => {
  assert.equal(gemDisplayName({ badgeGem: 'oro' }), '');
  assert.equal(gemDisplayName({}), '');
});
