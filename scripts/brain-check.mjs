#!/usr/bin/env node
// ===========================================================
// 🧠 brain-check — Linter de integridad del cerebro neuronal
// ===========================================================
// Mitiga la "fatiga de mantenimiento" del LLM (un script NO se vuelve perezoso).
// READ-ONLY: reporta problemas, no modifica nada. Lo corre el Reflejo de
// Auto-auditoría (CLAUDE.md §G.4) al arrancar / antes de consolidar.
//
//   node scripts/brain-check.mjs    (o: npm run brain:check)
//
// Chequea: (1) neuronas huérfanas, (2) saturación de capacidad (§G.5),
//          (3) desync del índice 00-INDICE → 99-HISTORIAL (fragilidad del offset).
// ===========================================================
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');
let problems = 0;
const warn = (m) => { console.log('  ⚠️  ' + m); problems++; };
const ok = (m) => console.log('  ✅ ' + m);
const read = (p) => readFileSync(p, 'utf-8');

console.log('\n🧠 BRAIN-CHECK — integridad del cerebro neuronal\n');

// Topes §G.5 (auto-cargadas en rojo)
const CAPS = {
  'CLAUDE.md': 320, 'docs/05-ESTADO-GLOBAL.md': 25, 'docs/10-MEMORIA-CORTO-PLAZO.md': 110,
  'docs/20-MEMORIA-ESPACIAL.md': 280, 'docs/30-LECCIONES.md': 350, 'docs/00-INDICE.md': 450,
};

const claude = read(join(ROOT, 'CLAUDE.md'));

// Registry de lóbulos de dominio
const lobeRegistryPath = join(DOCS, '40-LOBULOS-DOMINIO.md');
const lobeRegistry = existsSync(lobeRegistryPath) ? read(lobeRegistryPath) : '';

// 1) Neuronas huérfanas: toda docs/*.md debe estar referenciada en CLAUDE.md
//    (excepto lóbulos hijos 41-49, que se registran en 40-LOBULOS-DOMINIO).
console.log('1) Neuronas huérfanas (registradas en CLAUDE.md / 40-LOBULOS):');
const files = readdirSync(DOCS).filter((f) => f.endsWith('.md') && f !== 'README.md');
for (const n of files) {
  const isChildLobe = /^4[1-9]-/.test(n); // 41..49 = lóbulos de dominio hijos
  const searchName = `docs/${n}`;
  if (claude.includes(searchName) || claude.includes(n)) ok(`${n}`);
  else if (isChildLobe && (lobeRegistry.includes(searchName) || lobeRegistry.includes(n))) ok(`${n} (lóbulo hijo → 40-LOBULOS-DOMINIO)`);
  else if (isChildLobe) warn(`${n} lóbulo hijo NO registrado en 40-LOBULOS-DOMINIO`);
  else warn(`${n} NO referenciada en CLAUDE.md → HUÉRFANA (conectar en §0)`);
}

// 2) Capacidad (§G.5)
console.log('\n2) Capacidad de neuronas (§G.5):');
for (const [rel, cap] of Object.entries(CAPS)) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) { warn(`${rel} no existe`); continue; }
  const lines = read(p).split('\n').length;
  if (lines > Math.round(cap * 1.1)) warn(`${rel}: ${lines} líneas (tope ~${cap}) → SHARD/poda`);
  else if (lines > cap) console.log(`  ↗  ${rel}: ${lines} (tope ~${cap}, leve exceso)`);
  else ok(`${rel}: ${lines}/${cap}`);
}

// 3) Desync del índice: cada "| §X | tema | N |" debe apuntar a un header "## " del historial
console.log('\n3) Desync índice 00-INDICE → 99-HISTORIAL (fragilidad offset):');
const indice = read(join(DOCS, '00-INDICE.md')).split('\n');
const hist = read(join(DOCS, '99-HISTORIAL-ADR.md')).split('\n');
let checked = 0, desync = 0;
for (const row of indice) {
  const m = row.match(/^\|\s*§([\w.]+)\s*\|.*\|\s*(\d+)\s*\|\s*$/);
  if (!m) continue;
  const sec = m[1], ln = parseInt(m[2], 10);
  const target = hist[ln - 1] || '';
  checked++;
  if (!/^##\s/.test(target)) { warn(`§${sec} → línea ${ln} NO es un header (desync: "${target}")`); desync++; }
}
if (checked && !desync) ok(`${checked} entradas del índice apuntan a headers válidos`);

console.log(`\n${problems === 0 ? '✅ CEREBRO SANO' : '⚠️  ' + problems + ' problema(s) — revisar antes de avanzar'}\n`);
process.exit(problems ? 1 : 0);
