/**
 * tests/retiro-posicionamiento.test.mjs — El RETIRO del posicionamiento (TODO-99 · cerebro `49a`).
 *
 * Daniel, 20-oct-2026: Bersaglio no pagó el trabajo; el proyecto queda en pausa. La web SIGUE VIVA por
 * el dominio, pero fuera de buscadores y de las IA. Esto fija las cuatro cosas que lo hacen cierto:
 *   1. ninguna página publicada sale sin `noindex` (ni con JSON-LD), y la verificación de Search
 *      Console queda intacta (sin ella no hay herramienta de retirada ni vuelta atrás);
 *   2. del `dist` salen el sitemap y `llms.txt`;
 *   3. `robots.txt` cierra la puerta a los bots de IA pero NO a Googlebot/Bingbot — si no entran, no ven
 *      el `noindex` y la URL se queda indexada — ni a `facebookexternalhit` (vistas previas en IG/FB/WA);
 *   4. el navegador tampoco inyecta JSON-LD.
 * Revertir = `RETIRO_POSICIONAMIENTO = false` en `js/core/retiro.js` + el `robots.txt` anterior.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { RETIRO_POSICIONAMIENTO, ROBOTS_RETIRO, retirarDeBuscadores } from '../js/core/retiro.js';
import { barrerDist } from './../scripts/retiro-posicionamiento.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const META = `<meta name="robots" content="${ROBOTS_RETIRO}">`;

const PAGINA = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="robots" content="index, follow">
    <title>Joyería en Cartagena</title>
    <script type="application/ld+json" id="business-jsonld">{"@type":"JewelryStore","name":"x"}</script>
    <script type="application/ld+json">
      {"@type":"BreadcrumbList"}
    </script>
    <script type="module" src="/js/app.js"></script>
</head>
<body><main>hola</main></body>
</html>`;

test('el interruptor está ENCENDIDO y la orden es la más fuerte', () => {
    assert.equal(RETIRO_POSICIONAMIENTO, true);
    for (const d of ['noindex', 'nofollow', 'noarchive', 'nosnippet', 'noimageindex']) {
        assert.ok(ROBOTS_RETIRO.includes(d), `falta ${d}`);
    }
});

test('una página con `index, follow` y JSON-LD sale con noindex y sin un solo JSON-LD', () => {
    const out = retirarDeBuscadores(PAGINA);
    assert.ok(out.includes(META));
    assert.ok(!out.includes('index, follow'));
    assert.ok(!/application\/ld\+json/i.test(out), 'quedó JSON-LD');
    assert.equal((out.match(/name="robots"/g) || []).length, 1, 'debe quedar UNA sola meta robots');
    assert.ok(out.includes('<script type="module" src="/js/app.js"></script>'), 'tocó un script que no era JSON-LD');
    assert.ok(out.includes('<main>hola</main>'), 'tocó el cuerpo');
});

test('una página SIN meta robots la recibe dentro del <head>', () => {
    const sin = '<html><head>\n<title>t</title>\n</head><body></body></html>';
    const out = retirarDeBuscadores(sin);
    assert.ok(out.includes(META));
    assert.ok(out.indexOf(META) < out.indexOf('</head>'));
});

test('es idempotente: pasarla dos veces no cambia nada', () => {
    const una = retirarDeBuscadores(PAGINA);
    assert.equal(retirarDeBuscadores(una), una);
});

test('la verificación de Search Console (sin <head>) queda INTACTA', () => {
    const verif = 'google-site-verification: googlea3095f6436afe156.html';
    assert.equal(retirarDeBuscadores(verif), verif);
});

test('el barrido del dist: todas las páginas, sitemap y llms.txt fuera, el resto intacto', () => {
    const dist = mkdtempSync(join(tmpdir(), 'retiro-'));
    try {
        mkdirSync(join(dist, 'pieza'), { recursive: true });
        mkdirSync(join(dist, 'journal'), { recursive: true });
        writeFileSync(join(dist, 'index.html'), PAGINA);
        writeFileSync(join(dist, 'pieza', 'anillo.html'), PAGINA);
        writeFileSync(join(dist, 'journal', 'articulo.html'), PAGINA);
        writeFileSync(join(dist, 'googlea3095f6436afe156.html'), 'google-site-verification: googlea3095f6436afe156.html');
        writeFileSync(join(dist, 'sitemap.xml'), '<urlset></urlset>');
        writeFileSync(join(dist, 'llms.txt'), '# Bersaglio');
        writeFileSync(join(dist, 'robots.txt'), 'User-agent: *');
        writeFileSync(join(dist, 'app.js'), 'console.log(1)');

        const r = barrerDist(dist);

        for (const f of ['index.html', join('pieza', 'anillo.html'), join('journal', 'articulo.html')]) {
            const h = readFileSync(join(dist, f), 'utf-8');
            assert.ok(h.includes(META), `${f} sin noindex`);
            assert.ok(!/application\/ld\+json/i.test(h), `${f} con JSON-LD`);
        }
        assert.equal(readFileSync(join(dist, 'googlea3095f6436afe156.html'), 'utf-8'),
            'google-site-verification: googlea3095f6436afe156.html');
        assert.ok(!existsSync(join(dist, 'sitemap.xml')), 'el sitemap sigue publicado');
        assert.ok(!existsSync(join(dist, 'llms.txt')), 'llms.txt sigue publicado');
        assert.ok(existsSync(join(dist, 'robots.txt')) && existsSync(join(dist, 'app.js')), 'borró algo que no debía');
        assert.equal(r.paginas, 3);
        assert.deepEqual(r.borrados.sort(), ['llms.txt', 'sitemap.xml']);
    } finally {
        rmSync(dist, { recursive: true, force: true });
    }
});

// ── robots.txt ────────────────────────────────────────────────────────────────────────────────────
// Grupos de robots.txt: líneas `User-agent:` seguidas de sus reglas. Se parsea de verdad (no con un
// `includes`), porque lo que importa es QUÉ regla le toca a cada bot.
function grupos(txt) {
    const out = []; let actual = null; let enAgentes = false;
    for (const cruda of txt.split(/\r?\n/)) {
        const l = cruda.replace(/#.*/, '').trim();
        if (!l) continue;
        const [k, ...v] = l.split(':'); const clave = k.trim().toLowerCase(); const valor = v.join(':').trim();
        if (clave === 'user-agent') {
            if (!enAgentes) { actual = { agentes: [], reglas: [] }; out.push(actual); }
            actual.agentes.push(valor.toLowerCase()); enAgentes = true;
        } else if (actual) { actual.reglas.push(`${clave}: ${valor}`); enAgentes = false; }
    }
    return out;
}
const reglasDe = (gs, bot) => (gs.find((g) => g.agentes.includes(bot.toLowerCase())) || { reglas: null }).reglas;

const ROBOTS = readFileSync(join(ROOT, 'public', 'robots.txt'), 'utf-8');
const BOTS_IA = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot',
    'Claude-Web', 'anthropic-ai', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended',
    'CCBot', 'Bytespider', 'Amazonbot', 'meta-externalagent', 'cohere-ai', 'Diffbot', 'DuckAssistBot',
    'YouBot', 'MistralAI-User'];

test('robots.txt: cada bot de IA tiene la puerta CERRADA', () => {
    const gs = grupos(ROBOTS);
    for (const bot of BOTS_IA) {
        const r = reglasDe(gs, bot);
        assert.ok(r, `${bot} no tiene grupo propio`);
        assert.ok(r.includes('disallow: /'), `${bot} no está bloqueado`);
        assert.ok(!r.some((x) => x.startsWith('allow:')), `${bot} conserva un Allow`);
    }
});

test('robots.txt: Googlebot/Bingbot SÍ entran (para ver el noindex) y sin Sitemap', () => {
    const gs = grupos(ROBOTS);
    const general = reglasDe(gs, '*');
    assert.ok(general, 'falta el grupo `User-agent: *`');
    assert.ok(!general.includes('disallow: /'), 'el grupo general bloquea todo: Google no vería el noindex');
    assert.ok(!/^\s*sitemap\s*:/im.test(ROBOTS), 'robots.txt sigue anunciando el sitemap');
    assert.ok(reglasDe(gs, 'Googlebot-Image')?.includes('disallow: /'), 'Googlebot-Image no está bloqueado');
});

test('robots.txt: las vistas previas de Instagram/Facebook/WhatsApp NO se bloquean', () => {
    const r = reglasDe(grupos(ROBOTS), 'facebookexternalhit');
    assert.ok(!r || !r.includes('disallow: /'), 'facebookexternalhit bloqueado: los enlaces en IG/FB/WA saldrían sin vista previa');
});

// ── navegador ─────────────────────────────────────────────────────────────────────────────────────
test('el navegador tampoco inyecta JSON-LD (injectSchema no hace nada con el retiro encendido)', async () => {
    const añadidos = [];
    globalThis.document = {
        getElementById: () => null,
        createElement: () => ({ remove() {} }),
        head: { appendChild: (n) => añadidos.push(n) },
    };
    try {
        const { injectSchema } = await import('../js/core/schema.js');
        injectSchema('x-jsonld', { '@type': 'Thing' });
        assert.equal(añadidos.length, 0, 'se inyectó un JSON-LD');
    } finally {
        delete globalThis.document;
    }
});
