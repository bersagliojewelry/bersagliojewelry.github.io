/**
 * Gate de SUPERFICIE PUBLICADA (2026-10-09).
 *
 * Por qué existe: `vite.config.js` → `discoverHtmlEntries()` lee **todo `.html` de la raíz** y lo
 * convierte en página del sitio. Es cómodo —añadir una página es dejar el fichero ahí— y es también
 * una puerta que publica sola: cualquier `.html` que alguien deje en la raíz y commitee aparece en
 * bersagliojewelry.co sin que nadie lo revise. Hoy solo hay una línea del `.gitignore`
 * (`session-report-*.html`) frenando un caso concreto; todo lo demás entra.
 *
 * Qué mide: lo que GIT RASTREA, no lo que hay en el disco. Esa distinción es el punto del gate.
 * El despliegue se construye desde el repo (CI hace checkout), así que un fichero sin rastrear no
 * se publica por mucho que esté en tu carpeta y aparezca en tu `dist/` local.
 *
 * 🔑 La lección que lo motivó (2026-10-09, error medido): se dio por publicado un informe interno
 * porque aparecía en el `dist/` LOCAL. No lo estaba — el `.gitignore` ya lo excluía y la URL
 * devolvía 404. Auditar la carpeta de trabajo NO es auditar lo publicado.
 *
 *   node --test tests/publicacion.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Las páginas que el sitio PUBLICA a propósito. Añadir una aquí es un acto deliberado. */
const PERMITIDAS = new Set([
    // públicas
    'index.html', 'colecciones.html', 'pieza.html', 'carrito.html', 'lista-deseos.html',
    'contacto.html', 'nosotros.html', 'journal.html', 'entrada.html', 'gracias.html',
    'privacidad.html', 'terminos.html',
    // verificación de Google (vive en la raíz desde su alta; sale intacta)
    'googlea3095f6436afe156.html',
]);
/** El panel: mismo build, pero son muchas y cambian por fase. Se admiten por prefijo. */
const PREFIJOS_ADMIN = ['admin-', 'admin.'];

function htmlDeLaRaizQueGitRastrea() {
    const salida = execFileSync('git', ['ls-files', '--', '*.html'], { cwd: ROOT, encoding: 'utf8' });
    return salida.split('\n')
        .map(s => s.trim())
        .filter(Boolean)
        // solo la RAÍZ: `discoverHtmlEntries()` usa readdirSync(__dirname), no recorre subcarpetas
        .filter(f => !f.includes('/'));
}

test('publicación: ningún .html inesperado en la raíz (el build publica la raíz entera)', () => {
    const esperada = f => PERMITIDAS.has(f) || PREFIJOS_ADMIN.some(p => f.startsWith(p));
    const intrusas = htmlDeLaRaizQueGitRastrea().filter(f => !esperada(f));
    assert.deepEqual(intrusas, [],
        'Estos .html de la raíz se PUBLICARÍAN en bersagliojewelry.co y no están en la lista: '
        + `${intrusas.join(', ')}. Si son páginas del sitio, añádelas a PERMITIDAS. Si son `
        + 'artefactos internos (informes, volcados, notas), NO van en la raíz del repo: sácalos o '
        + 'ignóralos en .gitignore, como ya se hace con `session-report-*.html`.');
});

test('publicación: las páginas declaradas siguen existiendo (un renombrado no las tira en silencio)', () => {
    const ausentes = [...PERMITIDAS].filter(f => !existsSync(join(ROOT, f)));
    assert.deepEqual(ausentes, [],
        `declaradas como publicadas pero ya no están en el disco: ${ausentes.join(', ')}. `
        + 'Si la página se retiró a propósito, quítala también de PERMITIDAS.');
});

test('publicación: el .gitignore sigue frenando los informes de sesión', () => {
    // Es la única barrera que impidió que un informe interno de 143 KB acabara en la web.
    // Si alguien la quita "porque no estorba", vuelve a abrirse esa puerta.
    let ignorado = true;
    try {
        execFileSync('git', ['check-ignore', '-q', 'session-report-PRUEBA.html'], { cwd: ROOT });
    } catch { ignorado = false; }
    assert.ok(ignorado,
        'se quitó la regla `session-report-*.html` del .gitignore: cualquier informe de sesión '
        + 'que se commitee acabaría publicado en el sitio (el build emite todo .html de la raíz)');
});
