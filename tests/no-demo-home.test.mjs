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
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Quita comentarios de bloque y de línea (preservando `https://` por el [^:]) para que las
// aserciones de patrón no se rompan por un comentario intercalado. Usado por barrera #5 y L-42.
const stripComments = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

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

test('cero-ficción: ningún módulo de js/home/ exporta un array no vacío (fuente demo nueva)', () => {
    // Barrera #5 del spec: atrapa una fuente demo NUEVA con otro nombre que reintroduzca
    // un array "baked" de items. El contenido dinámico viene de Firestore; los módulos de
    // home/ exportan FUNCIONES de render, nunca arrays de datos.
    const dir = join(ROOT, 'js/home');
    const named = /export\s+(?:const|let|var)\s+\w+\s*=\s*\[\s*[^\]\s]/;   // export const X = [ <algo>
    const dflt  = /export\s+default\s*\[\s*[^\]\s]/;                       // export default [ <algo>
    for (const f of readdirSync(dir)) {
        if (!f.endsWith('.js')) continue;
        const src = stripComments(readFileSync(join(dir, f), 'utf8'));
        assert.ok(
            !named.test(src) && !dflt.test(src),
            `js/home/${f} exporta un array no vacío — posible fuente de datos demo (barrera #5 cero-ficción)`,
        );
    }
});

// GATE estado-cero (L-42 · ADR §89/§90 · TODO-25 caza-bugs), generalizado a las 5 secciones
// DINÁMICAS del home. Invariante: renderX() monta SIEMPRE su <section class="home-X"> (con el
// inner '' si no hay datos) y refreshX() rellena ESE contenedor con mount(). Si render devuelve
// '' condicional sin datos, la sección nunca entra al DOM → refresh no puede CREARLA → al
// partir de 0 ítems el contenido jamás aparece (ni en vivo ni al recargar; el 1er paint es
// async-vacío). Es el bug de Categorías 2026-06-21; el gate ahora protege la CLASE entera (un
// futuro §89 en films/redes/journal/destacadas también revienta el build).
const HOME_DINAMICAS = [
    { file: 'js/home/categories.js',      render: 'renderCategories',     refresh: 'refreshCategories',     sec: 'home-cats' },
    { file: 'js/home/films.js',           render: 'renderFilms',          refresh: 'refreshFilms',          sec: 'home-films' },
    { file: 'js/home/social.js',          render: 'renderSocial',         refresh: 'refreshSocial',         sec: 'home-social' },
    { file: 'js/home/journal-preview.js', render: 'renderJournalPreview', refresh: 'refreshJournalPreview', sec: 'home-journal' },
    { file: 'js/home/featured.js',        render: 'renderFeatured',       refresh: 'refreshFeatured',       sec: 'home-featured' },
];

for (const s of HOME_DINAMICAS) {
    test(`home dinámico (L-42): ${s.render}() monta SIEMPRE <section class="${s.sec}"> y ${s.refresh}() la rellena en vivo`, () => {
        const src = stripComments(readFileSync(join(ROOT, s.file), 'utf8'));   // sin comentarios intercalados (§102)
        // El regex exige que renderX devuelva `html`<section class="home-X">${` montando
        // SIEMPRE la sección. Tolera llamadas benignas previas (`armWatchdog();` del modelo
        // 3-estados §102) con `(?:\w+(...);)*`, PERO sigue cazando el bug: un `if (...) return '';`
        // ANTES del <section> NO encaja en ese prefijo de-solo-llamadas → rompe el match.
        const renderRe = new RegExp(
            s.render + '\\([^)]*\\)\\s*\\{\\s*(?:\\w+\\([^)]*\\)\\s*;\\s*)*return html`<section class="' + s.sec + '">\\$\\{',
        );
        assert.match(src, renderRe,
            `${s.render} debe devolver SIEMPRE html\`<section class="${s.sec}">\${...} (patrón L-42), sin '' condicional antes del <section>`);
        // refresh DEBE localizar la sección existente y mount() el inner (NO re-crearla ni salir).
        const refreshRe = new RegExp(
            s.refresh + "[\\s\\S]*?querySelector\\('\\." + s.sec + "'\\)[\\s\\S]*?mount\\(",
        );
        assert.match(src, refreshRe,
            `${s.refresh} debe querySelector('.${s.sec}') y mount() el inner en la sección ya montada`);
    });
}

test('cero-ficción: Destacadas (featured.js) oculta bajo umbral, sin placeholder', () => {
    const src = readFileSync(join(ROOT, 'js/home/featured.js'), 'utf8');
    assert.ok(src.includes('MIN_FEATURED'), 'featured.js debe usar el umbral MIN_FEATURED (SSoT home-sections)');
    // Acepta ambas formas EQUIVALENTes del guard de umbral (hide-when-empty):
    //   forma clásica  `length < MIN_FEATURED ? '' : …`
    //   forma 3-estados (§102 carga fluida) `length >= MIN_FEATURED ? contentHtml(…) : ''`
    // Lo invariante: bajo el umbral el render es vacío (sin placeholder, ver assert siguiente).
    assert.match(
        src,
        /<\s*MIN_FEATURED|>=\s*MIN_FEATURED\s*\?[\s\S]*?:\s*''/,
        'featured.js debe ocultar la sección bajo MIN_FEATURED (umbral → render vacío, sin placeholder)',
    );
    assert.ok(
        !/afilando la próxima curaduría|home-featured-empty/.test(src),
        'featured.js reintrodujo un placeholder/empty-state (cero-ficción: hide-when-empty, no placeholder)',
    );
});

test('cero-ficción: data/journal.js sin array baked de respaldo (artículos ficticios)', () => {
    const src = readFileSync(join(ROOT, 'js/data/journal.js'), 'utf8');
    assert.ok(!src.includes('JOURNAL_ENTRIES'), 'data/journal.js reintrodujo JOURNAL_ENTRIES (artículos ficticios)');
    // entries() debe devolver [] cuando no hay entradas vivas (sin caer a baked). Tolera
    // el .filter(isJournalComplete) añadido en Fase B: lo clave es el fallback `: []`.
    assert.ok(
        /Array\.isArray\(live\)[\s\S]*?live\.map\([\s\S]*?:\s*\[\]/.test(src),
        'entries() debe devolver [] sin entradas publicadas (sin fallback baked)',
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// Cero-ficción en los DEFAULTS de página (js/pages/*-defaults.js) — cierra el hueco §191/TODO-47.
//
// Los defaults de página SÍ hornean copy de marca legítimo (hero, valores, faqs, timeline…):
// ese es su diseño (§5-G — pre-llenan el form del admin desde el texto ACTUAL). PERO las
// secciones de EVIDENCIA de TERCEROS —reseñas/testimonios— deben nacer VACÍAS: el contenido
// real llega del CMS (Firestore / colección `reviews`), nunca horneado en código. Un testimonio
// con nombre + texto en el default es ficticio por definición (`feedback_no_demo_en_index`).
//
// Motivo: `nosotros-defaults.js` tuvo 4 reseñas INVENTADAS ("Valentina Restrepo", etc.) durante
// MESES sin que ningún test las viera — el guard de `js/home/` (arriba) NO cubre `js/pages/`,
// y solo se ocultaban en prod por un override de Firestore (`resenas.items:[]` + hide-when-empty).
//
// Alcance DELIBERADO: solo testimonios. `equipo`/`certificaciones`/`cifras` son CLAIMS de marca
// cuya veracidad es verificación HUMANA (verdad-de-marca / TODO-47), no algo que un test
// determine — forzarlos vacíos rompería contenido legítimo. Un grep no distingue "real" de
// "inventado" en una persona o una cifra; sí puede exigir que los TESTIMONIOS no se horneen.

const TESTIMONIAL_KEY = /rese[nñ]a|review|testimoni/i;

// Recorre un objeto de defaults y devuelve las rutas de secciones-testimonio con `items` no vacío.
function bakedTestimonials(root) {
    const hits = [];
    const visit = (val, path) => {
        if (!val || typeof val !== 'object') return;
        for (const [k, v] of Object.entries(val)) {
            const p = path ? `${path}.${k}` : k;
            if (TESTIMONIAL_KEY.test(k) && v && Array.isArray(v.items) && v.items.length > 0) hits.push(p);
            if (v && typeof v === 'object') visit(v, p);
        }
    };
    visit(root, '');
    return hits;
}

test('cero-ficción: el detector de testimonios horneados funciona (self-check)', () => {
    // Caso ficticio → se marca.
    assert.deepEqual(
        bakedTestimonials({ resenas: { items: [{ n: 'Fulano de Tal', t: 'Todo excelente' }] } }),
        ['resenas'],
        'debe marcar una sección de reseñas con items horneados',
    );
    // Copy editorial legítimo → NO se marca (no sobre-alcanza a faqs/valores ni a reseñas vacías).
    assert.deepEqual(
        bakedTestimonials({ resenas: { items: [] }, faqs: { items: [{ q: '¿?', a: '.' }] }, valores: { items: [{ t: 'X', d: 'Y' }] } }),
        [],
        'NO debe marcar reseñas vacías ni copy editorial (faqs/valores)',
    );
});

test('cero-ficción: js/pages/*-defaults.js no hornea reseñas/testimonios (deben venir del CMS)', async () => {
    const dir = join(ROOT, 'js/pages');
    const files = readdirSync(dir).filter(f => f.endsWith('-defaults.js'));
    assert.ok(files.length > 0, 'no se encontró ningún *-defaults.js en js/pages (¿ruta cambió?)');
    for (const f of files) {
        const mod = await import(pathToFileURL(join(dir, f)).href);
        for (const exported of Object.values(mod)) {
            if (!exported || typeof exported !== 'object') continue;   // funciones/primitivos → fuera
            const hits = bakedTestimonials(exported);
            assert.deepEqual(
                hits, [],
                `js/pages/${f} hornea testimonios en [${hits.join(', ')}] — las reseñas deben venir del CMS, no del código (feedback_no_demo_en_index)`,
            );
        }
    }
});
