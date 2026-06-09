#!/usr/bin/env node
// ===========================================================
// 🧠 brain-check — Linter de integridad del cerebro neuronal (CANÓNICO · portable)
// ===========================================================
// KERNEL del cerebro multi-proyecto (ADR §170 / plan v5). Este archivo es IDÉNTICO
// en los 3 repos (cars/bersaglio/inmobiliaria) — canon = bersaglio (single-writer).
// Los TOPES/budgets son INSTANCE: viven en docs/.brain-manifest.json por-repo.
// READ-ONLY: reporta problemas, no modifica nada. Sin dependencias de child_process.
//
//   node scripts/brain-check.mjs           → --full (default): TODO (pre-commit / manual)
//   node scripts/brain-check.mjs --boot    → arranque LIVIANO: NO lee 99-HISTORIAL (~43k L)
//
// Chequea:
//   (1) Neuronas huérfanas (docs/NN-*.md referenciada en CLAUDE.md; 41-49 vía 40-LOBULOS).
//   (2) Capacidad §G.5 — chars (unidad real de contexto) + líneas, desde el manifest, + sub-presupuesto de BOOT.
//   (3) Desync 00-INDICE → 99-HISTORIAL [solo --full · lee el 99].
//   (4) Frescura OPCIONAL: cache SW (Altorra service-worker.js | genérico public/sw.js).
//   (5) Referencias cruzadas: (5a ADR↔índice)(5b L-/M-↔30) [solo --full · leen 99/30] · (5c hojas) [siempre].
//   (6) Skills del repo catalogadas en skills-inventory [solo --full].
//
// Diseño: chequeos universales fallan; opcionales solo informan. Convención-agnóstico
// (headers numerados "## NN." o por fecha). El SessionStart usa --boot.
// ===========================================================
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');
let problems = 0;
const warn = (m) => { console.log('  ⚠️  ' + m); problems++; };
const ok = (m) => console.log('  ✅ ' + m);
const info = (m) => console.log('  ℹ️  ' + m);
const read = (p) => readFileSync(p, 'utf-8');

// --boot: arranque liviano (NO lee 99-HISTORIAL). default/--full: todo (plan v5 §6.7).
const BOOT = process.argv.includes('--boot');

console.log(`\n🧠 BRAIN-CHECK${BOOT ? ' --boot (liviano)' : ''} — integridad del cerebro neuronal\n`);

// Pre-flight: las piezas críticas existen.
const CLAUDE_PATH = join(ROOT, 'CLAUDE.md');
if (!existsSync(CLAUDE_PATH)) {
  console.log('  ⚠️  CLAUDE.md no existe en la raíz — ¿estás corriendo el linter desde el directorio correcto?');
  process.exit(1);
}
if (!existsSync(DOCS)) {
  console.log('  ⚠️  docs/ no existe — el cerebro no está cableado.');
  process.exit(1);
}

// Config INSTANCE (topes/budgets) desde docs/.brain-manifest.json. Si no existe, defaults por líneas.
const MANIFEST_PATH = join(DOCS, '.brain-manifest.json');
let manifest = {};
if (existsSync(MANIFEST_PATH)) {
  try { manifest = JSON.parse(read(MANIFEST_PATH)); }
  catch { info('.brain-manifest.json ilegible (JSON inválido) — usando defaults de líneas'); }
}
const DEFAULT_CAPS = {
  'CLAUDE.md': { lines: 320 }, 'docs/05-ESTADO-GLOBAL.md': { lines: 25 },
  'docs/10-MEMORIA-CORTO-PLAZO.md': { lines: 110 }, 'docs/20-MEMORIA-ESPACIAL.md': { lines: 280 },
  'docs/30-LECCIONES.md': { lines: 350 }, 'docs/00-INDICE.md': { lines: 450 },
  'docs/40-LOBULOS-DOMINIO.md': { lines: 280 },
};
const CAPS = manifest.caps || DEFAULT_CAPS;
const ALWAYS_ON = manifest.alwaysOn || ['CLAUDE.md', 'docs/05-ESTADO-GLOBAL.md', 'docs/10-MEMORIA-CORTO-PLAZO.md'];
const BOOT_CHARS_TARGET = manifest.bootCharsTarget || null;

const claude = read(CLAUDE_PATH);
const indicePath = join(DOCS, '00-INDICE.md');
const histPath = join(DOCS, '99-HISTORIAL-ADR.md');

// Registry de lóbulos: los hijos (41-49) NO viven en CLAUDE.md §0 — se registran en 40-LOBULOS-DOMINIO.md.
const lobeRegistryPath = join(DOCS, '40-LOBULOS-DOMINIO.md');
const lobeRegistry = existsSync(lobeRegistryPath) ? read(lobeRegistryPath) : '';

// 1) Neuronas huérfanas
console.log('1) Neuronas huérfanas (registradas en CLAUDE.md / 40-LOBULOS):');
const neurons = readdirSync(DOCS).filter((f) => /^\d{2}-.*\.md$/.test(f));
for (const n of neurons) {
  const isChildLobe = /^4[1-9]-/.test(n);
  if (claude.includes(n)) ok(`${n}`);
  else if (isChildLobe && lobeRegistry.includes(n)) ok(`${n} (lóbulo hijo → 40-LOBULOS-DOMINIO)`);
  else if (isChildLobe) warn(`${n} lóbulo hijo NO registrado en 40-LOBULOS-DOMINIO`);
  else warn(`${n} NO referenciada en CLAUDE.md → HUÉRFANA (conectar en §0)`);
}

// 2) Capacidad (§G.5) — chars = unidad REAL de contexto (manifest); líneas = compat.
console.log('\n2) Capacidad de neuronas (§G.5 · chars = unidad real de contexto):');
let bootChars = 0;
for (const [rel, cap] of Object.entries(CAPS)) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) continue; // capado pero ausente en este repo → omitir (portable)
  const txt = read(p);
  const lines = txt.split('\n').length;
  const chars = txt.length;
  if (ALWAYS_ON.includes(rel)) bootChars += chars;
  const lc = cap.lines, cc = cap.chars;
  const over = (lc && lines > Math.round(lc * 1.1)) || (cc && chars > Math.round(cc * 1.1));
  const nudge = (lc && lines > lc) || (cc && chars > cc);
  const tag = cc ? `${chars}c/${cc} · ${lines}L/${lc}` : `${lines}L/${lc} (${chars}c)`;
  if (over) warn(`${rel}: ${tag} → SHARD/poda (excede tope)`);
  else if (nudge) console.log(`  ↗  ${rel}: ${tag} (leve exceso — destilar)`);
  else ok(`${rel}: ${tag}`);
}
if (BOOT_CHARS_TARGET) {
  const bootTok = Math.round(bootChars / 3.5);
  // INFORMATIVO por diseño (NO incrementa problems / NO afecta exit-code): el objetivo de boot es
  // aspiracional; el exceso se reduce destilando o difiriendo superficie always-on, NO es un fallo
  // bloqueante. Honesto: nudge declarado, no un símbolo que finge ser warning (anti-teatro de proceso).
  if (bootChars > Math.round(BOOT_CHARS_TARGET * 1.1))
    console.log(`  ℹ️  BOOT always-on = ${bootChars}c (~${bootTok} tok) vs objetivo ${BOOT_CHARS_TARGET}c — informativo (aspiracional; destilar/diferir, NO bloquea)`);
  else ok(`BOOT always-on = ${bootChars}c (~${bootTok} tok) ≤ objetivo ${BOOT_CHARS_TARGET}c`);
}

// 3) Desync del índice → 99 (LEE el 99 ~43k líneas) — solo en --full.
console.log('\n3) Desync índice 00-INDICE → 99-HISTORIAL (fragilidad offset):');
if (BOOT) {
  console.log('  ⏭️  omitido en --boot (lee 99-HISTORIAL) → corre en pre-commit / npm run brain:check');
} else if (existsSync(indicePath) && existsSync(histPath)) {
  const indice = read(indicePath).split('\n');
  const hist = read(histPath).split('\n');
  const numberedConvention = hist.some((l) => /^##\s+\d+\.\s/.test(l));
  let checked = 0, desync = 0;
  for (const row of indice) {
    const m = row.match(/^\|\s*§([\w.]+)\s*\|.*\|\s*(\d+)\s*\|\s*$/);
    if (!m) continue;
    const sec = m[1], ln = parseInt(m[2], 10);
    const target = hist[ln - 1] || '';
    checked++;
    if (!/^##\s/.test(target)) { warn(`§${sec} → línea ${ln} NO es un header (desync: "${target.slice(0, 40)}")`); desync++; }
    else if (numberedConvention && /^\d+$/.test(sec.split('.')[0]) && !new RegExp(`^##\\s+${sec.split('.')[0]}[.\\s]`).test(target)) {
      warn(`§${sec} → línea ${ln} apunta a OTRO § ("${target.replace(/^##\s*/, '').slice(0, 28)}…") → offset drift`); desync++;
    }
  }
  if (!checked) info('índice vacío (sin ADRs todavía) — chequeo omitido');
  else if (!desync) ok(`${checked} entradas del índice apuntan a headers válidos${numberedConvention ? ' (+ número §)' : ' (convención por fecha)'}`);
} else {
  info('00-INDICE.md o 99-HISTORIAL-ADR.md no existe — chequeo omitido');
}

// 4) Frescura OPCIONAL (cache SW) — barato, siempre. Solo aplica si el proyecto declara §4 + SW existe.
console.log('\n4) Frescura (cache SW ↔ 05) — OPCIONAL:');
const hasSwSection = /##\s*§4\s*—\s*Cache bump/i.test(claude);
const swCandidates = ['service-worker.js', 'public/sw.js', 'sw.js', 'public/service-worker.js'];
let swFile = null;
for (const c of swCandidates) { if (existsSync(join(ROOT, c))) { swFile = c; break; } }
if (hasSwSection && swFile) {
  const swSrc = read(join(ROOT, swFile));
  const swVer =
    (swSrc.match(/CACHE_VERSION\s*=\s*'v?(\d{14})'/) || [])[1] ||
    (swSrc.match(/CACHE_(?:NAME|VERSION)\s*=\s*['"]([^'"]+)['"]/) || [])[1] || null;
  if (!swVer) {
    info(`encontré ${swFile} pero no pude parsear CACHE_NAME/CACHE_VERSION (¿cambió el formato?)`);
  } else {
    info(`service-worker: ${swFile} → cache "${swVer}"`);
    const cmCandidates = ['js/core/cache-manager.js', 'src/cache-manager.js', 'src/lib/cache-manager.js'];
    let cmVer = null, cmPath = null;
    for (const c of cmCandidates) {
      const p = join(ROOT, c);
      if (existsSync(p)) {
        const v = (read(p).match(/APP_VERSION\s*=\s*'v?(\d{14})'/) || [])[1];
        if (v) { cmVer = v; cmPath = c; break; }
      }
    }
    if (cmVer) {
      if (swVer === cmVer || swVer === 'v' + cmVer) ok(`cache SW == ${cmPath} (${swVer})`);
      else warn(`cache DESYNC: SW=${swVer} ≠ ${cmPath}=v${cmVer} → bumpear AMBOS (§4)`);
    }
    const estadoPath = join(DOCS, '05-ESTADO-GLOBAL.md');
    if (existsSync(estadoPath)) {
      const estado = read(estadoPath);
      const vigLine = estado.split('\n').find((l) => /Cache version vigente|Versi[oó]n.*Cache/i.test(l)) || '';
      const vig = (vigLine.match(/`([^`]+)`/) || [])[1] || (vigLine.match(/v\d{14}/) || [])[0] || null;
      if (vig) {
        const norm = (s) => String(s).replace(/^v/, ''); // tolera el prefijo 'v' (05 lo escribe con v; el SW da dígitos)
        if (norm(vig) === norm(swVer)) ok(`05 cache vigente == SW ("${swVer}")`);
        else warn(`05 STALE: declara cache vigente "${vig}" pero SW="${swVer}" → actualizar 05`);
      } else {
        info('05 no declara una "Cache version vigente" parseable (token en backticks)');
      }
    }
  }
} else {
  info('proyecto sin service-worker (o sin §4 en CLAUDE.md) — chequeos de cache omitidos');
}

// 5) Referencias cruzadas. 5a/5b LEEN 99/30 (caros) → solo --full. 5c barato → siempre.
console.log('\n5) Referencias cruzadas (huecos en el cerebro):');
if (!BOOT && existsSync(histPath) && existsSync(indicePath)) {
  // 5a) Todo ADR "## NN." de 99 debe tener fila "| §NN |" en 00-INDICE
  const histText = read(histPath);
  const indiceText = read(indicePath);
  const adrNums = new Set([...histText.matchAll(/^##\s+(\d+)\./gm)].map((m) => m[1]));
  const idxNums = new Set([...indiceText.matchAll(/^\|\s*§(\d+)\b/gm)].map((m) => m[1]));
  const missingIdx = [...adrNums].filter((n) => !idxNums.has(n)).sort((a, b) => +a - +b);
  if (!adrNums.size) info('99 usa headers por fecha (no "## NN.") — chequeo 5a omitido');
  else if (!missingIdx.length) ok(`${adrNums.size} ADRs de 99 indexados en 00`);
  else warn(`${missingIdx.length} ADR(s) de 99 SIN fila en 00-INDICE: §${missingIdx.join(', §')}`);
}
const leccionesPath = join(DOCS, '30-LECCIONES.md');
if (!BOOT && existsSync(leccionesPath)) {
  // 5b) Referencias L-/M- usadas en el cerebro deben estar definidas (### L-NN/M-NN) en 30
  const leccionesText = read(leccionesPath);
  const cortoPath = join(DOCS, '10-MEMORIA-CORTO-PLAZO.md');
  const espacialPath = join(DOCS, '20-MEMORIA-ESPACIAL.md');
  const estadoPath = join(DOCS, '05-ESTADO-GLOBAL.md');
  const histText = existsSync(histPath) ? read(histPath) : '';
  const indiceText = existsSync(indicePath) ? read(indicePath) : '';
  const defined = new Set([...leccionesText.matchAll(/^###\s+([LM]-\d{2})\b/gm)].map((m) => m[1]));
  const allBrain = [
    claude, indiceText,
    existsSync(estadoPath) ? read(estadoPath) : '',
    leccionesText, histText,
    existsSync(cortoPath) ? read(cortoPath) : '',
    existsSync(espacialPath) ? read(espacialPath) : '',
  ].join('\n');
  const referenced = new Set([...allBrain.matchAll(/\b([LM]-\d{2})\b/g)].map((m) => m[1]));
  const dangling = [...referenced].filter((r) => !defined.has(r)).sort();
  if (!referenced.size) info('aún no hay refs L-NN/M-NN en el cerebro');
  else if (!dangling.length) ok(`refs L-/M- (${referenced.size} usadas / ${defined.size} def) todas resuelven en 30`);
  else warn(`refs L-/M- COLGANTES (sin def en 30): ${dangling.join(', ')} → definir o corregir`);
}
if (BOOT) console.log('  ⏭️  5a/5b (ADRs↔índice, refs L-/M-) omitidas en --boot (leen 99/30) → pre-commit / brain:check');
// 5c) Hojas docs/*.md referenciadas en CLAUDE.md deben existir — barato, siempre.
const refDocs = new Set([...claude.matchAll(/docs\/([\w-]+\.md)/g)].map((m) => m[1]));
const PLACEHOLDER = /^NN-|NOMBRE|<tema>|<carpeta>/;
const missingDocs = [...refDocs].filter((f) => !PLACEHOLDER.test(f) && !existsSync(join(DOCS, f)));
if (!missingDocs.length) ok(`hojas docs/*.md referenciadas en CLAUDE.md (${refDocs.size}) existen`);
else warn(`hojas referenciadas en CLAUDE.md INEXISTENTES: ${missingDocs.join(', ')}`);

// 6) Skills del repo catalogadas en skills-inventory (lee N×SKILL.md) — solo --full.
console.log('\n6) Skills del repo catalogadas en skills-inventory:');
const SKILLS_DIR = join(ROOT, 'skills');
const invPath = join(DOCS, 'skills-inventory.md');
if (BOOT) {
  console.log('  ⏭️  omitido en --boot (lee N×SKILL.md) → corre en pre-commit / npm run brain:check');
} else if (existsSync(SKILLS_DIR) && existsSync(invPath)) {
  const inv = read(invPath);
  const grabName = (p) => { const m = read(p).match(/^[ \t]*name:[ \t]*["']?([^"'\n]+)/im); return m ? m[1].trim() : null; };
  const dirs = readdirSync(SKILLS_DIR, { withFileTypes: true }).filter((d) => d.isDirectory());
  let uncat = 0;
  for (const d of dirs) {
    const names = [];
    const own = join(SKILLS_DIR, d.name, 'SKILL.md');
    if (existsSync(own)) { const n = grabName(own); if (n) names.push(n); }
    else {
      try {
        for (const sub of readdirSync(join(SKILLS_DIR, d.name), { withFileTypes: true })) {
          if (!sub.isDirectory()) continue;
          const p = join(SKILLS_DIR, d.name, sub.name, 'SKILL.md');
          if (existsSync(p)) { const n = grabName(p); if (n) names.push(n); }
        }
      } catch { /* sin permiso/illegible: se cataloga por nombre de carpeta */ }
    }
    const catalogued = inv.includes(d.name) || names.some((n) => inv.includes(n));
    if (!catalogued) { warn(`skill '${d.name}'${names.length ? ' (' + names.join(', ') + ')' : ''} NO está en skills-inventory.md → catalogar (§G.4)`); uncat++; }
  }
  if (!uncat) ok(`${dirs.length} carpetas de skills/ catalogadas en skills-inventory.md`);
} else if (existsSync(SKILLS_DIR)) {
  // skills/ SIN catálogo = invisibles para el cerebro → problema real, no nota (ADR §173 / kernel v1.1)
  warn('skills/ existe pero docs/skills-inventory.md NO → crear el catálogo (§G.4)');
} else {
  info('skills/ no existe — chequeo de catálogo de skills omitido');
}

console.log(`\n${problems === 0 ? '✅ CEREBRO SANO' : '⚠️  ' + problems + ' problema(s) — revisar antes de avanzar'}\n`);
process.exit(problems ? 1 : 0);
