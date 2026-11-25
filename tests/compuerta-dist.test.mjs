/**
 * tests/compuerta-dist.test.mjs — La compuerta del dist (cerebro `49b §3.3`).
 *
 * Nada revisaba el `dist` antes de publicarlo. El SSG hornea el sitemap y voltea a `index, follow` cada
 * página que debe salir en Google, pero si un horneado no encuentra su ancla (`replaceOnce` devuelve el HTML
 * intacto), la página sale con el `noindex` de su shell y se publica igual, en silencio. Lo mismo si el
 * sitemap o `llms.txt` no llegan al `dist`. Es el accidente más caro del SEO y no hacía ruido.
 *
 * La compuerta corre en `deploy.yml` entre `npm run generate` y la subida a Pages. Lee el interruptor del
 * retiro (`js/core/retiro.js`), porque lo sano depende de él:
 *   - APAGADO (hoy): `sitemap.xml` y `llms.txt` publicados, y ninguna página del sitemap con `noindex`.
 *   - ENCENDIDO: lo contrario — sin sitemap ni `llms.txt`, y todas las páginas con `noindex`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { RETIRO_POSICIONAMIENTO, ROBOTS_RETIRO } from '../js/core/retiro.js';
import { revisarDist } from '../scripts/compuerta-dist.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITIO = 'https://bersagliojewelry.co';

const pagina = (robots) => `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    ${robots == null ? '' : `<meta name="robots" content="${robots}">`}
    <title>Joyería en Cartagena</title>
</head>
<body><main>hola</main></body>
</html>`;

const sitemap = (...rutas) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rutas.map((r) => `    <url>\n        <loc>${SITIO}${r}</loc>\n        <lastmod>2026-11-25</lastmod>\n    </url>`).join('\n')}
</urlset>
`;

const VERIFICACION = 'google-site-verification: googlea3095f6436afe156.html';

// Un dist como el de hoy: páginas indexables en el sitemap; el panel y el carrito, con su noindex, FUERA.
function distEncendido() {
    return {
        'index.html': pagina('index, follow'),
        'nosotros.html': pagina('index, follow'),
        'pieza/anillo-esmeralda.html': pagina('index, follow'),
        'coleccion/anillos.html': pagina(null),   // sin meta robots también es indexable
        'admin.html': pagina('noindex, nofollow'),
        'carrito.html': pagina('noindex, nofollow'),
        'googlea3095f6436afe156.html': VERIFICACION,
        'sitemap.xml': sitemap('/', '/nosotros.html', '/pieza/anillo-esmeralda.html', '/coleccion/anillos.html'),
        'llms.txt': '# Bersaglio Jewelry\n',
        'robots.txt': 'User-agent: *\nAllow: /\n',
    };
}

// Un dist como el del retiro (barrerDist): todo con noindex, sin sitemap ni llms.txt.
function distRetirado() {
    return {
        'index.html': pagina(ROBOTS_RETIRO),
        'nosotros.html': pagina(ROBOTS_RETIRO),
        'pieza/anillo-esmeralda.html': pagina(ROBOTS_RETIRO),
        'admin.html': pagina(ROBOTS_RETIRO),
        'googlea3095f6436afe156.html': VERIFICACION,
        'robots.txt': 'User-agent: *\nAllow: /\n',
    };
}

function conDist(archivos, fn) {
    const dist = mkdtempSync(join(tmpdir(), 'compuerta-'));
    try {
        for (const [ruta, contenido] of Object.entries(archivos)) {
            mkdirSync(dirname(join(dist, ruta)), { recursive: true });
            writeFileSync(join(dist, ruta), contenido);
        }
        return fn(dist);
    } finally {
        rmSync(dist, { recursive: true, force: true });
    }
}

const fallosDe = (archivos, retiro) => conDist(archivos, (dist) => revisarDist(dist, { retiro }).fallos);

// ── Retiro APAGADO (el estado de hoy) ─────────────────────────────────────────────────────────────

test('un dist sano pasa sin un solo fallo, aunque el panel y el carrito lleven noindex (no están en el sitemap)', () => {
    conDist(distEncendido(), (dist) => {
        const r = revisarDist(dist, { retiro: false });
        assert.deepEqual(r.fallos, []);
        assert.equal(r.paginas, 4, 'debía revisar las 4 páginas del sitemap');
    });
});

test('sin sitemap.xml el despliegue se para', () => {
    const d = distEncendido();
    delete d['sitemap.xml'];
    const fallos = fallosDe(d, false);
    assert.ok(fallos.some((f) => f.includes('sitemap.xml')), `no avisó del sitemap: ${fallos.join(' | ')}`);
});

test('un sitemap sin una sola URL cuenta como si no estuviera', () => {
    const fallos = fallosDe({ ...distEncendido(), 'sitemap.xml': sitemap() }, false);
    assert.ok(fallos.some((f) => f.includes('sitemap.xml')), `no avisó del sitemap vacío: ${fallos.join(' | ')}`);
});

test('sin llms.txt, o con llms.txt vacío, el despliegue se para', () => {
    const sin = distEncendido();
    delete sin['llms.txt'];
    for (const [caso, d] of [['ausente', sin], ['vacío', { ...distEncendido(), 'llms.txt': '' }]]) {
        const fallos = fallosDe(d, false);
        assert.ok(fallos.some((f) => f.includes('llms.txt')), `llms.txt ${caso} pasó la compuerta`);
    }
});

test('una página del sitemap con noindex para el despliegue y sale con su nombre', () => {
    for (const meta of [
        '<meta name="robots" content="noindex, nofollow">',
        '<meta name="robots" content="none">',
        '<meta name="googlebot" content="noindex">',
        '<meta content="NOINDEX, follow" name="ROBOTS">',
    ]) {
        const d = distEncendido();
        d['nosotros.html'] = pagina(null).replace('<title>', `${meta}\n    <title>`);
        const fallos = fallosDe(d, false);
        assert.equal(fallos.length, 1, `${meta} → ${fallos.join(' | ')}`);
        assert.ok(fallos[0].includes('nosotros.html'), `${meta} → no nombró la página: ${fallos[0]}`);
    }
});

test('«none» dentro de otra directiva (max-image-preview:none) no se confunde con noindex', () => {
    const d = distEncendido();
    d['nosotros.html'] = pagina('index, follow, max-image-preview:none');
    assert.deepEqual(fallosDe(d, false), []);
});

test('una URL del sitemap que no existe en el dist para el despliegue (sería un 404 anunciado a Google)', () => {
    const d = distEncendido();
    d['sitemap.xml'] = sitemap('/', '/nosotros.html', '/journal/perdido.html');
    const fallos = fallosDe(d, false);
    assert.equal(fallos.length, 1, fallos.join(' | '));
    assert.ok(fallos[0].includes('journal/perdido.html'), fallos[0]);
});

test('una URL del sitemap de otro dominio para el despliegue', () => {
    const d = distEncendido();
    d['sitemap.xml'] = sitemap('/').replace('</urlset>',
        '    <url><loc>https://bersaglio-jewelry.web.app/nosotros.html</loc></url>\n</urlset>');
    const fallos = fallosDe(d, false);
    assert.ok(fallos.some((f) => f.includes('bersaglio-jewelry.web.app')), fallos.join(' | '));
});

// ── Retiro ENCENDIDO: lo sano es lo contrario ─────────────────────────────────────────────────────

test('con el retiro encendido, un dist retirado (sin sitemap ni llms.txt, todo con noindex) pasa', () => {
    assert.deepEqual(fallosDe(distRetirado(), true), []);
});

test('con el retiro encendido, un sitemap o un llms.txt publicados paran el despliegue', () => {
    for (const f of ['sitemap.xml', 'llms.txt']) {
        const fallos = fallosDe({ ...distRetirado(), [f]: distEncendido()[f] }, true);
        assert.ok(fallos.some((x) => x.includes(f)), `${f} publicado con el retiro encendido pasó la compuerta`);
    }
});

test('con el retiro encendido, una página que sigue indexable para el despliegue', () => {
    const d = distRetirado();
    d['pieza/anillo-esmeralda.html'] = pagina('index, follow');
    const fallos = fallosDe(d, true);
    assert.equal(fallos.length, 1, fallos.join(' | '));
    assert.ok(fallos[0].includes('pieza/anillo-esmeralda.html'), fallos[0]);
});

// ── La orden que corre el CI ──────────────────────────────────────────────────────────────────────

test('una carpeta que no existe no pasa la compuerta (el build no llegó a hacerse)', () => {
    const fallos = revisarDist(join(tmpdir(), 'compuerta-no-existe-' + process.pid)).fallos;
    assert.ok(fallos.length > 0, 'una carpeta inexistente pasó la compuerta');
});

const correr = (dist) => spawnSync(process.execPath, [join(ROOT, 'scripts', 'compuerta-dist.mjs'), dist],
    { cwd: ROOT, encoding: 'utf-8' });

test('la orden del CI lee el interruptor: un dist sano sale con 0 y uno roto con 1, nombrando el fallo', () => {
    const sano = RETIRO_POSICIONAMIENTO ? distRetirado() : distEncendido();
    conDist(sano, (dist) => {
        const ok = correr(dist);
        assert.equal(ok.status, 0, `un dist sano no pasó: ${ok.stdout}${ok.stderr}`);
        // Romperlo: con el retiro apagado falta llms.txt; con el retiro encendido sobra.
        if (RETIRO_POSICIONAMIENTO) writeFileSync(join(dist, 'llms.txt'), '# Bersaglio');
        else unlinkSync(join(dist, 'llms.txt'));
        const roto = correr(dist);
        assert.equal(roto.status, 1, `un dist roto pasó: ${roto.stdout}${roto.stderr}`);
        assert.ok(roto.stderr.includes('llms.txt'), `no nombró el fallo: ${roto.stderr}`);
    });
});

test('deploy.yml corre la compuerta después de generar el dist y antes de publicarlo, sin dejarla pasar', () => {
    const yml = readFileSync(join(ROOT, '.github', 'workflows', 'deploy.yml'), 'utf-8');
    const generar = yml.indexOf('run: npm run generate');
    const compuerta = yml.indexOf('run: node scripts/compuerta-dist.mjs');
    const subir = yml.indexOf('uses: actions/upload-pages-artifact');
    assert.ok(generar > 0 && subir > 0, 'deploy.yml cambió de forma: no encuentro generate o la subida a Pages');
    assert.ok(compuerta > 0, 'deploy.yml no corre la compuerta del dist');
    assert.ok(generar < compuerta && compuerta < subir, 'la compuerta debe ir después de generate y antes de subir el dist');
    const paso = yml.slice(yml.lastIndexOf('- name:', compuerta), subir);
    assert.ok(!/continue-on-error|^\s*if:/m.test(paso), 'el paso de la compuerta no puede llevar continue-on-error ni if:');
});
