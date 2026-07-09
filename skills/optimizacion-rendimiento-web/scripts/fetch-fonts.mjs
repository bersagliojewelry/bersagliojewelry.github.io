// fetch-fonts.mjs — Self-host reproducible de Google Fonts (skill optimizacion-rendimiento-web).
//
// POR QUÉ: cargar fuentes desde fonts.googleapis.com + fonts.gstatic.com mete 2 conexiones externas
// (DNS+TLS handshake) en el critical path de render → penaliza FCP. Self-hostear los woff2 en el
// mismo origen los saca del critical path. Con `unicode-range` (preservado), el navegador solo baja
// el subset+peso que la página usa — idéntico a Google, sin peso muerto.
//
// USO (Node 18+, con `fetch` global):
//   1. Edita CONFIG abajo: las FAMILIES/ejes que tu sitio pide HOY (réplica exacta = cero regresión),
//      los subsets que necesitas, y las rutas de salida.
//   2. Corre desde la raíz del sitio:  node ruta/a/fetch-fonts.mjs
//   3. Enlaza el CSS emitido y reemplaza los <link> de Google. Conserva cualquier marcador/guard que
//      tu código use para no reinyectar Google Fonts. Verifica EN VIVO: 0 peticiones a fonts.*.
//
// Idempotente: sobrescribe la carpeta de fuentes y el/los CSS en cada corrida.

import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join, resolve } from 'path';

// ─────────────────────────── CONFIG (edita esto) ───────────────────────────
const CONFIG = {
  // Directorio raíz del sitio (por defecto el cwd desde donde corres el script).
  root: process.cwd(),
  // Dónde guardar los woff2 (relativo a root).
  fontsDir: 'fonts',
  // Dónde escribir el CSS con los @font-face (relativo a root). Usa `target` por familia
  // para separar en varios archivos (p.ej. una fuente que solo carga una página).
  cssDir: 'css',
  // Subsets a conservar. Para español basta 'latin' (á,é,í,ó,ú,ñ,ü,¿,¡ están en U+00xx);
  // 'latin-ext' es red de seguridad (solo se transfiere si aparece un glifo de ese rango).
  keepSubsets: ['latin', 'latin-ext'],
  // Las familias/ejes EXACTOS que tu sitio pide hoy (mira tus <link> de fonts.googleapis.com/css2).
  // El `query` es el string tras `?` en esa URL (sin `&display=swap`, que se añade solo).
  // `target` = archivo CSS de salida (agrupa las universales; separa las de una sola página).
  families: [
    { name: 'Manrope',          query: 'family=Manrope:wght@400;500;600;700', target: 'fonts.css' },
    { name: 'Instrument Serif', query: 'family=Instrument+Serif:ital@0;1',     target: 'fonts.css' },
    // { name: 'Inter', query: 'family=Inter:wght@400;500;600;700', target: 'fonts-extra.css' },
  ],
};
// ────────────────────────────────────────────────────────────────────────────

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
const ROOT = resolve(CONFIG.root);
const FONTS_DIR = join(ROOT, CONFIG.fontsDir);
const CSS_DIR = join(ROOT, CONFIG.cssDir);
const KEEP = new Set(CONFIG.keepSubsets);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function field(block, name) {
  const m = block.match(new RegExp(name + '\\s*:\\s*([^;]+);'));
  return m ? m[1].trim() : '';
}
async function fetchText(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`GET ${url} -> HTTP ${r.status}`);
  return r.text();
}
async function fetchWoff2(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`GET ${url} -> HTTP ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 4 || buf.toString('ascii', 0, 4) !== 'wOF2') {
    throw new Error(`${url} no es woff2 valido (magic=${buf.toString('hex', 0, 4)})`);
  }
  return buf;
}

// Google emite:  /* latin */\n@font-face { ... }
const BLOCK_RE = /\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g;

async function processFamily(fam) {
  const url = `https://fonts.googleapis.com/css2?${fam.query}&display=swap`;
  const css = await fetchText(url);
  const out = [];
  let kept = 0, skipped = 0;
  for (const m of css.matchAll(BLOCK_RE)) {
    const subset = m[1];
    let block = m[2];
    if (!KEEP.has(subset)) { skipped++; continue; }
    const srcM = block.match(/url\((https:\/\/[^)]+\.woff2)\)/);
    if (!srcM) { skipped++; continue; }
    const family = field(block, 'font-family').replace(/['"]/g, '');
    const weight = field(block, 'font-weight') || '400';
    const style = field(block, 'font-style') || 'normal';
    const fname = `${slug(family)}-${weight}-${style}-${subset}.woff2`;
    writeFileSync(join(FONTS_DIR, fname), await fetchWoff2(srcM[1]));
    // Ruta local relativa desde cssDir -> fontsDir.
    const rel = ('../'.repeat(CONFIG.cssDir.split('/').filter(Boolean).length)) + CONFIG.fontsDir;
    block = block.replace(/url\(https:\/\/[^)]+\.woff2\)/, `url(${rel}/${fname})`);
    out.push(`/* ${family} ${weight} ${style} - ${subset} */\n${block}`);
    kept++;
    process.stdout.write(`  ok ${fname}\n`);
  }
  console.log(`${fam.name}: ${kept} woff2 self-hosteados, ${skipped} subsets descartados`);
  return { target: fam.target, css: out.join('\n\n') };
}

async function main() {
  console.log(`-> Self-host de fuentes en ${FONTS_DIR}\n`);
  rmSync(FONTS_DIR, { recursive: true, force: true });
  mkdirSync(FONTS_DIR, { recursive: true });
  mkdirSync(CSS_DIR, { recursive: true });

  const byTarget = new Map();
  for (const fam of CONFIG.families) {
    const { target, css } = await processFamily(fam);
    if (!byTarget.has(target)) byTarget.set(target, []);
    byTarget.get(target).push(css);
  }
  const header = `/* GENERADO por fetch-fonts.mjs (skill optimizacion-rendimiento-web) - NO editar a mano.\n` +
    `   Self-host de Google Fonts para sacar fonts.googleapis/gstatic del critical path.\n` +
    `   Re-generar: node fetch-fonts.mjs */\n\n`;
  for (const [target, chunks] of byTarget) {
    writeFileSync(join(CSS_DIR, target), header + chunks.join('\n\n') + '\n');
    console.log(`\n-> ${join(CONFIG.cssDir, target)} escrito`);
  }
  console.log('\nListo. Enlaza el CSS, reemplaza los <link> de Google y VERIFICA EN VIVO (0 req a fonts.*).');
}

main().catch((e) => { console.error('x', e.message); process.exit(1); });
