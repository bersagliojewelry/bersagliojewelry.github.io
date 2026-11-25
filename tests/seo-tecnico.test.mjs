/**
 * tests/seo-tecnico.test.mjs — SEO técnico que no depende de los precios (cerebro `49b §3.2`).
 *
 * Lo encontraron los revisores de la reanudación (24-nov-2026) y se midió en vivo con curl el 25-nov:
 *   - Nosotros y Contacto anunciaban en `og:url` la PORTADA. Al compartir esas páginas, Facebook,
 *     WhatsApp e Instagram (y los buscadores que leen Open Graph) las tomaban por la portada.
 *     Las páginas que hornea el SSG (fichas, facetas, listados, Journal) corrigen su `og:url` al
 *     hornearse; estas dos no pasan por ahí: su `<head>` sale tal cual del código.
 *   - `offline.html` (la página «sin conexión» del service worker) no llevaba `noindex`.
 * Las migas de las fichas van en el SSG_SELFTEST de `scripts/generate-pieces.mjs` (el generador no se
 * puede importar sin ejecutarlo) y el `robots.txt`, con sus demás pruebas, en
 * `tests/retiro-posicionamiento.test.mjs`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { pideNoindex } from '../scripts/compuerta-dist.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

test('cada página que nace indexable anuncia en og:url su propia dirección (su canónica), no la portada', () => {
    const revisadas = [];
    const mal = [];
    for (const f of readdirSync(ROOT).filter((x) => x.endsWith('.html'))) {
        const html = readFileSync(join(ROOT, f), 'utf-8');
        if (!/<head[\s>]/i.test(html) || pideNoindex(html)) continue;   // los shells noindex los corrige el SSG
        const ogUrl = (html.match(/<meta\s+property="og:url"\s+content="([^"]*)"/i) || [])[1];
        if (ogUrl === undefined) continue;
        const canonica = (html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i) || [])[1];
        revisadas.push(f);
        if (!canonica || ogUrl !== canonica) mal.push(`${f}: og:url=${ogUrl} · canónica=${canonica}`);
    }
    for (const f of ['index.html', 'nosotros.html', 'contacto.html']) {
        assert.ok(revisadas.includes(f), `${f} no se revisó: ¿dejó de ser indexable o perdió su og:url?`);
    }
    assert.deepEqual(mal, []);
});

test('offline.html (la página sin conexión del service worker) no se indexa', () => {
    assert.ok(pideNoindex(readFileSync(join(ROOT, 'public', 'offline.html'), 'utf-8')),
        'public/offline.html no lleva noindex');
});
