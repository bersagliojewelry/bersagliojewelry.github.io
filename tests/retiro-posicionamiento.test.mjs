/**
 * tests/retiro-posicionamiento.test.mjs — El interruptor del posicionamiento (cerebro `49a`).
 *
 * Historia: el 22-oct-2026 el posicionamiento se RETIRÓ (pausa por impago, TODO-99) y el 24-nov-2026 se
 * REANUDÓ (Daniel: «vamos a encenderlos para que aumenten notablemente su posicionamiento»). Hoy la web
 * está ENCENDIDA, y este fichero fija dos cosas:
 *   A. El estado declarado. El interruptor está apagado y `robots.txt` cuenta la misma historia:
 *      anuncia el sitemap, invita a los motores de respuesta, deja entrar a Google Imágenes y mantiene
 *      fuera el panel. Un `noindex` que se cuela en producción es el accidente más caro del SEO: si
 *      alguien vuelve a encender el retiro, que sea a propósito y con estos tests cambiados.
 *   B. El mecanismo del retiro sigue armado y probado (`retirarDeBuscadores`, `barrerDist`), por si un
 *      día hace falta: noindex en cada página, cero JSON-LD, sitemap y `llms.txt` fuera del `dist`, y la
 *      verificación de Search Console intacta (sin ella no hay herramienta de retirada ni vuelta atrás).
 * Volver a retirar = devolver el interruptor, `robots.txt` y estos tests a como estaban en el commit del
 * retiro (`ea8e2ef`); el service worker no se revierte, su caché siempre sube al número siguiente.
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

test('el retiro está APAGADO (reanudado el 24-nov-2026) y su orden sigue siendo la más fuerte', () => {
    assert.equal(RETIRO_POSICIONAMIENTO, false,
        'el retiro está ENCENDIDO: toda la web saldría con noindex. Si es a propósito, cambia con él los tests de robots.txt (cerebro 49a)');
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
// Los nueve que `robots.txt` invita por su nombre (AEO · TODO-35); los demás entran por el grupo general.
const INVITADOS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Google-Extended',
    'Applebot-Extended', 'ClaudeBot', 'Claude-Web', 'CCBot'];

test('robots.txt: ningún bot de IA tiene la puerta cerrada y los nueve invitados lo están por su nombre', () => {
    const gs = grupos(ROBOTS);
    for (const bot of BOTS_IA) {
        const r = reglasDe(gs, bot);
        assert.ok(!r || !r.includes('disallow: /'), `${bot} sigue bloqueado: es el robots.txt del retiro`);
    }
    for (const bot of INVITADOS) {
        assert.ok(reglasDe(gs, bot)?.includes('allow: /'), `${bot} no está invitado por su nombre`);
    }
});

test('robots.txt: anuncia el sitemap, deja entrar a Google Imágenes y no bloquea el sitio', () => {
    const gs = grupos(ROBOTS);
    const general = reglasDe(gs, '*');
    assert.ok(general, 'falta el grupo `User-agent: *`');
    assert.ok(!general.includes('disallow: /'), 'el grupo general bloquea todo el sitio');
    assert.ok(/^sitemap:\s*https:\/\/bersagliojewelry\.co\/sitemap\.xml\s*$/im.test(ROBOTS), 'robots.txt no anuncia el sitemap');
    const img = reglasDe(gs, 'Googlebot-Image');
    assert.ok(!img || !img.includes('disallow: /'), 'Googlebot-Image sigue bloqueado: las joyas no saldrían en Google Imágenes');
});

test('robots.txt: el panel y las páginas de usuario siguen FUERA de los buscadores', () => {
    const general = reglasDe(grupos(ROBOTS), '*') || [];
    for (const p of ['/admin.html', '/admin-login.html', '/admin-piezas.html', '/admin-cuentas.html',
        '/carrito.html', '/lista-deseos.html', '/gracias.html']) {
        assert.ok(general.includes(`disallow: ${p}`), `${p} quedó abierto a los buscadores`);
    }
});

test('robots.txt: las vistas previas de Instagram/Facebook/WhatsApp NO se bloquean', () => {
    const r = reglasDe(grupos(ROBOTS), 'facebookexternalhit');
    assert.ok(!r || !r.includes('disallow: /'), 'facebookexternalhit bloqueado: los enlaces en IG/FB/WA saldrían sin vista previa');
});

// ── navegador ─────────────────────────────────────────────────────────────────────────────────────
test('el navegador vuelve a inyectar el JSON-LD (injectSchema, con el retiro apagado)', async () => {
    const añadidos = [];
    globalThis.document = {
        getElementById: () => null,
        createElement: () => ({ remove() {} }),
        head: { appendChild: (n) => añadidos.push(n) },
    };
    try {
        const { injectSchema } = await import('../js/core/schema.js');
        injectSchema('x-jsonld', { '@type': 'Thing' });
        assert.equal(añadidos.length, 1, 'no se inyectó el JSON-LD: el retiro sigue encendido en el navegador');
        assert.equal(añadidos[0].type, 'application/ld+json');
        assert.equal(añadidos[0].id, 'x-jsonld');
        assert.deepEqual(JSON.parse(añadidos[0].textContent), { '@type': 'Thing' });
    } finally {
        delete globalThis.document;
    }
});
