/**
 * Gate determinista CERO-FICCIÓN (regla dura Daniel 2026-06-20, `feedback_no_demo_en_index`,
 * spec 2026-06-20-cms-cero-ficcion-design.md, barrera #5 del comité).
 *
 * Revienta el build/test si REAPARECE una fuente de contenido demo/ficticio en el index:
 *   1. el archivo de datos de ejemplo `js/data/home-media.js` (borrado a propósito);
 *   2. cualquier módulo que vuelva a importar `home-media`;
 *   3. el array "baked" de artículos ficticios del journal (JOURNAL_ENTRIES).
 *
 *   node --test tests/no-demo-home.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

test('cero-ficción: js/data/home-media.js (datos de ejemplo) NO existe', () => {
    assert.equal(
        existsSync(join(ROOT, 'js/data/home-media.js')), false,
        'home-media.js reapareció — es la fuente de demo prohibida (feedback_no_demo_en_index)',
    );
});

test('cero-ficción: ningún módulo importa/referencia home-media', () => {
    for (const d of ['js/home', 'js/pages', 'js/data', 'js/core']) {
        const full = join(ROOT, d);
        if (!existsSync(full)) continue;
        for (const f of readdirSync(full)) {
            if (!f.endsWith('.js')) continue;
            const src = readFileSync(join(full, f), 'utf8');
            assert.ok(!src.includes('home-media'), `${d}/${f} referencia home-media (demo prohibido)`);
        }
    }
});

test('cero-ficción: data/journal.js sin array baked de respaldo (artículos ficticios)', () => {
    const src = readFileSync(join(ROOT, 'js/data/journal.js'), 'utf8');
    assert.ok(!src.includes('JOURNAL_ENTRIES'), 'data/journal.js reintrodujo JOURNAL_ENTRIES (artículos ficticios)');
    // entries() debe devolver [] cuando no hay entradas vivas (sin caer a baked).
    assert.ok(
        /Array\.isArray\(live\)\s*\?\s*live\.map\([^)]*\)\s*:\s*\[\]/.test(src),
        'entries() debe devolver [] sin entradas publicadas (sin fallback baked)',
    );
});
