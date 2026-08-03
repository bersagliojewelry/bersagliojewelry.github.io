#!/usr/bin/env node
// ===========================================================
// 🧠 brain-check v1.5 — Linter de integridad del cerebro neuronal (CANÓNICO · portable)
// ===========================================================
// KERNEL del cerebro multi-proyecto (ADR §170/§171/§173; v1.3 = kill-list F0 Cerebro v2, inmobiliaria §50).
// Este archivo es IDÉNTICO en los 4 repos — escritor único = operador-inmobiliaria (§41).
// Los DATOS (topes/budgets/rutas) son INSTANCE: viven en docs/.brain-manifest.json.
// ⚠️ La SEVERIDAD de cada gate está HARDCODEADA aquí (anti green-tuning, ADR §173):
// el manifest NUNCA puede degradar un warn; solo aporta datos. Campo `downgrades`
// (con ADR citado) se IMPRIME en cada corrida — visible, no silencioso.
// READ-ONLY: reporta, no modifica. Sin child_process (portabilidad + byte-identidad ×repos).
//
//   node scripts/brain-check.mjs           → --full (default): TODO (pre-commit / manual)
//   node scripts/brain-check.mjs --boot    → arranque LIVIANO + SILENCIOSO (presupuesto de stdout;
//                                            NO lee 99-HISTORIAL; el hook re-inyecta cada línea)
//
// Checks (fija) · v1.3 F0-§50: #1→#10 · #6b/#11 QUITADOS · #13 endurecida · +5c/+7b/+tableFile:
//   (2) Caps chars+líneas [warn] · pre-shard ≥90% [info] (8) SSoT: hecho duplicado fuera del nodo dueño [warn, --full]
//       · 🔒 boot-budget [WARN desde v1.8.0 — ×4 bajo   (9) Consolidado-aún-en-10: fila ✅+§NN indexado [warn, --full]
//         presupuesto, §81] (24) 🐤 canario de boot [warn, --full]
//   (3) Desync 00→99 [warn, --full]                     (10) Huérfanas: BFS 2º orden + neurona NN- sin registro directo [warn, --full]
//   (4) Frescura cache SW↔05 [warn, opcional]           (12) Fechas stale en 05/10 [info, --boot]
//   (5) Refs cruzadas ADR/L-M/hojas [warn]              (13) Specs: checklist con evidencia RESOLUBLE [warn, --full]
//       + 5c) cita viva a lección ⚰️ cuarentenada [warn] (14) deepAudit Nivel-2 vencida [info] + tableFile existe [warn]
//   (6) Skills↔inventario [warn, --full]                (15) Schema del manifest: clave desconocida [warn]
//   (7) archiveDir íntegro [warn, --full]               (16) Fiabilidad M-22: `verificado-vivo` stale [info, --full]
//       (0-canónico, 7, 7b, 14-tableFile) DEGRADAN si la bóveda o el canónico no están clonados
//       + 7b) bóveda: commits ≠ origin vía fs [warn]
// ===========================================================
const KERNEL_VERSION = '1.10.3';
import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');
let problems = 0;
const BOOT = process.argv.includes('--boot');
// Presupuesto de stdout en --boot (el SessionStart re-inyecta CADA línea como contexto).
const lines = [];
const say = (m) => { lines.push(m); };
const warn = (m) => { say('  ⚠️  ' + m); problems++; };
const ok = (m) => { if (!BOOT) say('  ✅ ' + m); };
const info = (m) => say('  ℹ️  ' + m);
// v1.10.3 (inmobiliaria ADR 85, U-04): un gate que NO PUEDE correr (boveda sin clonar,
// canonico ausente) se anunciaba con info() y el veredicto final seguia diciendo CEREBRO
// SANO. Es la tercera forma de M-06: el gate no miente, miente el RESUMEN. degrade() no
// bloquea -no hay nada que arreglar en el repo- pero se cuenta y cambia el veredicto:
// integro no es lo mismo que verificado.
let degraded = 0;
const degrade = (m) => { say('  🟠 [DEGRADADO] ' + m); degraded++; };
const head = (m) => { if (!BOOT) say(m); };
const read = (p) => readFileSync(p, 'utf-8');

say(`\n🧠 BRAIN-CHECK v${KERNEL_VERSION}${BOOT ? ' --boot (liviano+silencioso)' : ' --full'} — integridad del cerebro\n`);

// Pre-flight
const CLAUDE_PATH = join(ROOT, 'CLAUDE.md');
if (!existsSync(CLAUDE_PATH) || !existsSync(DOCS)) {
  console.log('  ⚠️  CLAUDE.md o docs/ no existe — ¿directorio correcto? Cerebro no cableado.');
  process.exit(1);
}

// ---- Manifest (DATOS instance; jamás severidades) + validación de schema (#15) ----
const MANIFEST_PATH = join(DOCS, '.brain-manifest.json');
let manifest = {};
if (existsSync(MANIFEST_PATH)) {
  try { manifest = JSON.parse(read(MANIFEST_PATH)); }
  catch { info('.brain-manifest.json ilegible (JSON inválido) — defaults'); }
}
const KNOWN_KEYS = new Set([
  'brainTemplateVersion', 'repo', 'bootCharsTarget', 'alwaysOn', 'caps', 'archiveDir',
  'deepAudit', 'peers', 'kernelFiles', 'ssotFacts', 'specsDir', 'staleDays', 'ignoreDirs',
  'downgrades', 'orphanAllowlist', 'verifiedLiveStaleDays', 'verifiedLiveScan', 'lastOffsiteBackup',
  'harnessCanary', // v1.10.3 (#24): declara si este repo DEBE tener el SessionStart cableado
  'noCap', // v1.7 (#23): { "docs/X.md": "razón" } — declarar SIN tope es una decisión, no un olvido
]);
for (const k of Object.keys(manifest)) {
  if (!k.startsWith('_') && !KNOWN_KEYS.has(k)) warn(`manifest: clave desconocida "${k}" (¿typo? un typo apaga gates en silencio) — schema v1.2`);
}
// v1.9.0 (§83) — el schema vigilaba las claves de MÁS y era ciego a las de MENOS. Cada gate
// abajo hace `if (manifest.X)`, así que BORRAR una clave no rompe nada: apaga el gate y el
// linter sigue imprimiendo verde. Es la vía de escape perfecta para el candado de boot que
// acaba de volverse bloqueante — se desactiva con una tecla de suprimir y sin dejar rastro.
const REQUIRED_KEYS = {
  bootCharsTarget: 'el CANDADO DE BOOT (#2, bloqueante)',
  alwaysOn: 'el CANDADO DE BOOT (#2, bloqueante)',
  caps: 'los topes de neurona (#2)',
  deepAudit: 'el vencimiento de la auditoría Nivel-2 (#14)',
  harnessCanary: 'el CANARIO DE BOOT (#24)',
};
for (const [k, gate] of Object.entries(REQUIRED_KEYS)) {
  if (manifest[k] === undefined) warn(`manifest SIN "${k}" → ${gate} está APAGADO, y en silencio. Un gate que se desactiva borrando una clave no es un gate: declara la clave o documenta el downgrade.`);
}
if (Array.isArray(manifest.downgrades) && manifest.downgrades.length) {
  for (const d of manifest.downgrades) info(`DOWNGRADE activo: ${typeof d === 'string' ? d : JSON.stringify(d)} (visible por diseño — exige ADR)`);
}
// Compat kernel↔manifest (v1.4 §51): degradación RUIDOSA, jamás silencio.
const REQUIRED_MANIFEST_MAJOR = 1;
const mMajor = parseInt(String(manifest.brainTemplateVersion || '1').split('.')[0], 10) || 1;
if (mMajor !== REQUIRED_MANIFEST_MAJOR) warn(`manifest brainTemplateVersion "${manifest.brainTemplateVersion}" ≠ major ${REQUIRED_MANIFEST_MAJOR} que exige este kernel → migrar el manifest (el kernel corre degradado)`);

// 0) Identidad del kernel vs canónico (v1.4 §51 — reemplaza al viejo #11; corre también en --boot):
//    el kernel canónico vive UNA vez en <bóveda>/kernel/; cada repo lo trae con `npm run brain:pull`
//    que escribe scripts/.kernel-version.json (stamp commiteado). Editar scripts/*.mjs a mano = fork.
{
  const stampP = join(ROOT, 'scripts', '.kernel-version.json');
  if (!existsSync(stampP)) { if (!BOOT) info('sin scripts/.kernel-version.json — repo pre-F1 (migrar: npm run brain:pull)'); }
  else {
    let stamp = null; try { stamp = JSON.parse(read(stampP)); } catch { warn('scripts/.kernel-version.json ilegible (JSON inválido)'); }
    const shaHex = (p) => createHash('sha256').update(read(p).replace(/\r\n/g, '\n')).digest('hex');
    let bad = 0;
    for (const [name, h] of Object.entries((stamp && stamp.files) || {})) {
      const p = join(ROOT, 'scripts', name);
      if (!existsSync(p)) { warn(`kernel: ${name} está en el stamp pero AUSENTE en scripts/`); bad++; }
      else if (shaHex(p) !== h) { warn(`kernel EDITADO LOCALMENTE: ${name} ≠ stamp (fork prohibido §51) → editar el CANÓNICO y npm run brain:pull`); bad++; }
    }
    let vault = manifest.archiveDir ? join(ROOT, manifest.archiveDir) : null;
    if (vault) for (let i = 0; i < 4 && !existsSync(join(vault, '.git')); i++) vault = join(vault, '..');
    const canonVerP = vault ? join(vault, 'kernel', 'VERSION') : null;
    const canonVer = canonVerP && existsSync(canonVerP) ? read(canonVerP).trim() : null;
    if (stamp && canonVer && canonVer !== stamp.version) { warn(`kernel v${stamp.version} STALE vs canónico v${canonVer} → npm run brain:pull`); bad++; }
    // v1.5.1 §52 (punto ciego cazado EN VIVO): una edición del canónico SIN bump de VERSION era
    // invisible (el gate solo miraba stamp+versión). Con el canónico presente, comparar CONTENIDO.
    if (stamp && vault && existsSync(join(vault, 'kernel'))) for (const name of Object.keys(stamp.files || {})) {
      const c = join(vault, 'kernel', name), l = join(ROOT, 'scripts', name);
      if (existsSync(c) && existsSync(l) && shaHex(c) !== shaHex(l)) { warn(`kernel: ${name} difiere del CANÓNICO aun con versión igual (edición canónica sin bump / pull a medias) → npm run brain:pull`); bad++; break; }
    }
    if (stamp && !canonVer) degrade('kernel: el CANÓNICO no está clonado en esta máquina → la comparación vs canónico (stale de versión + diff de contenido) NO corrió; solo se validó el stamp local');
    if (stamp && !bad) {
      if (BOOT) say(`  ✅ kernel v${stamp.version} íntegro${canonVer ? ' == canónico' : ''}`);
      else ok(`kernel v${stamp.version} íntegro (${Object.keys(stamp.files || {}).length} archivos)${canonVer ? ' == canónico v' + canonVer : ' (canónico no clonado en esta máquina)'}`);
    }
  }
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
const lobeRegistryPath = join(DOCS, '40-LOBULOS-DOMINIO.md');
const lobeRegistry = existsSync(lobeRegistryPath) ? read(lobeRegistryPath) : '';

// Índice posiblemente RANGE-SHARDED (ADR): 00-INDICE.md + hermanas 00[a-z]-INDICE*.md
// (descubrimiento por PATRÓN → byte-idéntico ×repos, cero config; repos sin shard ⇒ solo 00).
// Los checks que leen el ÍNDICE como fuente (#3 desync, #5a refs-ADR, #9 consolidado) lo tratan
// como UNO vía readIndex() — así mover filas viejas a 00a NO dispara falsos "ADR sin fila en 00".
const indexNames = readdirSync(DOCS).filter((f) => /^00[a-z]?-INDICE.*\.md$/.test(f)).sort();
const indexPaths = indexNames.map((f) => join(DOCS, f));
const readIndex = () => indexPaths.map((p) => read(p)).join('\n');

// 2) Capacidad (§G.5) + pre-shard 90% + boot-budget
head('\n2) Capacidad de neuronas (§G.5 · chars = unidad real de contexto):');
let bootChars = 0;
const preShard = [];
let okCaps = 0, capCount = 0;
for (const [rel, cap] of Object.entries(CAPS)) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) continue;
  capCount++;
  const txt = read(p);
  const nLines = txt.split('\n').length;
  const chars = txt.length;
  if (ALWAYS_ON.includes(rel)) bootChars += chars;
  const lc = cap.lines, cc = cap.chars;
  const over = (lc && nLines > Math.round(lc * 1.1)) || (cc && chars > Math.round(cc * 1.1));
  const nudge = (lc && nLines > lc) || (cc && chars > cc);
  const near = (cc && chars >= Math.round(cc * 0.9)) || (lc && nLines >= Math.round(lc * 0.9));
  const tag = cc ? `${chars}c/${cc} · ${nLines}L/${lc}` : `${nLines}L/${lc} (${chars}c)`;
  if (over) warn(`${rel}: ${tag} → SHARD/poda (excede tope)`);
  else if (nudge) say(`  ↗  ${rel}: ${tag} (leve exceso — destilar)`);
  else { ok(`${rel}: ${tag}`); okCaps++; if (near) preShard.push(rel); }
}
if (BOOT && okCaps) say(`  ✅ ${okCaps}/${capCount} neuronas dentro de tope`);
if (preShard.length) info(`pre-shard: ${preShard.length} neurona(s) ≥90% de su cap (${preShard.join(', ')}) — planear shard/GC ANTES de reventar`);
if (BOOT_CHARS_TARGET) {
  const bootTok = Math.round(bootChars / 3.5);
  // 🔒 GATE DE BOOT — BLOQUEANTE desde v1.8.0 (inmobiliaria ADR §81).
  // Fue INFORMATIVO por diseño mientras algún repo estuviera sobre presupuesto (condición §173);
  // la condición se cumplió ×4 el 2026-08-01 (inmo 31448 · cars 29715 · bersaglio 31448 · insema
  // 27546). One-in-one-out: el `scripts/boot-gate.mjs` instance-side de inmobiliaria se RETIRA en
  // este mismo cambio, y su canario de boot baja al chequeo #24 de aquí.
  if (bootChars > BOOT_CHARS_TARGET)
    warn(`BOOT always-on = ${bootChars}c (~${bootTok} tok) > objetivo ${BOOT_CHARS_TARGET}c (exceso ${bootChars - BOOT_CHARS_TARGET}c) → PODA antes de commitear. One-in-one-out (§G.5): toda regla nueva DESPLAZA o fusiona una existente; subir el techo NO es cerrar (M-05).`);
  else {
    say(`  ✅ BOOT always-on = ${bootChars}c (~${bootTok} tok) ≤ objetivo ${BOOT_CHARS_TARGET}c`);
    // v1.9.2 (§83, TODO-37): el candado era un MURO sin acera — se pasaba de ✅ a commit bloqueado
    // sin aviso, y el ✅ se daba igual con el 99,8% gastado. Quien escribe no sabe que va al filo
    // hasta que choca, y entonces poda con prisa (que es como se poda mal). Banda de pre-aviso:
    const margen = BOOT_CHARS_TARGET - bootChars;
    const pct = Math.round((bootChars / BOOT_CHARS_TARGET) * 1000) / 10;
    if (pct >= 97) info(`⚠️ boot al ${pct}% — solo ${margen}c de margen: la PRÓXIMA regla que entre al router bloquea el commit. Poda AHORA, con calma, no cuando choques.`);
  }
  // v1.9.0 (§83): el gate mide los 3 archivos EDITABLES, pero el SessionStart tambien inyecta
  // los sidecars del heartbeat. No entran al candado a proposito -- se GENERAN, nadie puede
  // podarlos y bloquear un commit por ellos seria inaccionable-- pero callarlos hacia que el
  // numero del boot fuera menor que el boot real. Se publica, no se castiga.
  const sidecars = ['.estado-auto.md', '.handoff-auto.md'].map((f) => join(DOCS, f)).filter(existsSync);
  // v1.10.3 (ADR 85, U-02): la linea existia pero se ocultaba en --boot con && !BOOT, que es
  // exactamente el momento en que uno decide si le cabe una regla mas. Se publica siempre.
  // NO entra al umbral del pre-aviso: nadie puede podar un sidecar GENERADO, y un guardian
  // que ladra por algo inaccionable ensena a ignorarlo (la leccion del canario, v1.10.1).
  if (sidecars.length) {
    const extra = sidecars.reduce((a, p) => a + read(p).length, 0);
    info(`+ sidecars del heartbeat: ${extra}c no medidos por el candado (se generan, no se podan) → boot REAL ≈ ${bootChars + extra}c`);
  }
}

// 3) Desync índice → 99 [--full]
head('\n3) Desync índice 00-INDICE → 99-HISTORIAL:');
if (BOOT) { head('  ⏭️  omitido en --boot'); }
else if (indexPaths.length && existsSync(histPath)) {
  const indice = readIndex().split('\n');
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
      warn(`§${sec} → línea ${ln} apunta a OTRO § → offset drift`); desync++;
    }
  }
  if (!checked) info('índice sin filas § — omitido');
  else if (!desync) ok(`${checked} entradas del índice apuntan a headers válidos`);
}

// 4) Frescura cache SW ↔ 05 (opcional)
head('\n4) Frescura (cache SW ↔ 05) — OPCIONAL:');
const hasSwSection = /##\s*§4\s*—\s*Cache bump/i.test(claude);
const swCandidates = ['service-worker.js', 'public/sw.js', 'sw.js', 'public/service-worker.js'];
let swFile = null;
let cacheCruces = 0, swVerGlobal = null;   // v1.9.0: el ✅ del boot exige cruces REALES (§83)
for (const c of swCandidates) { if (existsSync(join(ROOT, c))) { swFile = c; break; } }
if (hasSwSection && swFile) {
  const swSrc = read(join(ROOT, swFile));
  const swVer =
    (swSrc.match(/CACHE_VERSION\s*=\s*'v?(\d{14})'/) || [])[1] ||
    (swSrc.match(/CACHE_(?:NAME|VERSION)\s*=\s*['"]([^'"]+)['"]/) || [])[1] || null;
  if (!swVer) info(`${swFile} sin CACHE_NAME/CACHE_VERSION parseable`);
  else {
    swVerGlobal = swVer;
    head(`  ℹ️  service-worker: ${swFile} → cache "${swVer}"`);
    // v1.9.0 (§83): faltaba `js/cache-manager.js` — la ruta REAL de inmobiliaria. El cruce
    // SW↔manager llevaba meses sin ejecutarse y el boot igual imprimia su ✅ (ver abajo).
    const cmCandidates = ['js/cache-manager.js', 'js/core/cache-manager.js', 'src/cache-manager.js', 'src/lib/cache-manager.js'];
    let cmVer = null, cmPath = null;
    for (const c of cmCandidates) {
      const p = join(ROOT, c);
      if (existsSync(p)) { const v = (read(p).match(/APP_VERSION\s*=\s*'v?(\d{14})'/) || [])[1]; if (v) { cmVer = v; cmPath = c; break; } }
    }
    if (cmVer) {
      cacheCruces++;
      if (swVer === cmVer || swVer === 'v' + cmVer) ok(`cache SW == ${cmPath} (${swVer})`);
      else warn(`cache DESYNC: SW=${swVer} ≠ ${cmPath}=v${cmVer} → bumpear AMBOS (§4)`);
    }
    const estadoPath = join(DOCS, '05-ESTADO-GLOBAL.md');
    if (existsSync(estadoPath)) {
      const estado = read(estadoPath);
      const vigLine = estado.split('\n').find((l) => /Cache version vigente|Versi[oó]n.*Cache|\*\*Cache\*\*/i.test(l)) || '';
      // El candidato debe PARECER una versión de caché, no cualquier backtick: en la era-heartbeat
      // esta fila es un PUNTERO (`docs/.estado-auto.md`) y tomarlo por versión disparaba un
      // "05 STALE" falso justo en los repos que ya hicieron lo correcto (soltar el dato derivable).
      const esVersion = (s) => s && !s.includes('/') && !/\.(md|json|mjs|js)$/i.test(s) && /\d/.test(s) && s.length <= 40;
      const vig = [...vigLine.matchAll(/`([^`]+)`/g)].map((m) => m[1]).find(esVersion)
        || (vigLine.match(/v\d{14}/) || [])[0] || null;
      if (vig) {
        const nv = (s) => String(s).replace(/^v/, '');
        cacheCruces++;
        if (nv(vig) === nv(swVer)) ok(`05 cache vigente == SW ("${swVer}")`);
        else warn(`05 STALE: declara "${vig}" pero SW="${swVer}" → actualizar 05`);
      } else if (!existsSync(join(DOCS, '.estado-auto.md'))) info('05 sin "Cache version vigente" parseable (y sin heartbeat §52 — en era-heartbeat el campo vive en el sidecar)');
    }
  }
} else head('  ℹ️  sin service-worker o sin §4 — omitido');
// v1.9.0 (§83): este ✅ se imprimia SIEMPRE que existiera un service-worker, aunque no se
// hubiera cruzado NADA — y no se cruzaba, porque la ruta del manager estaba mal y en la
// era-heartbeat el 05 ya no declara la cache. Un ✅ que no depende de haber comparado algo
// es la 1a forma de mentir de un gate (M-06): no dispara, y encima tranquiliza.
if (BOOT && swFile) {
  if (cacheCruces > 0) say(`  ✅ cache verificada (${cacheCruces} cruce(s))`);
  else say(`  ℹ️  cache: SW dice "${swVerGlobal || '?'}" — sin contraparte que cruzar (nada verificado)`);
}

// 5) Referencias cruzadas
head('\n5) Referencias cruzadas (huecos en el cerebro):');
if (!BOOT && existsSync(histPath) && indexPaths.length) {
  const histText = read(histPath);
  const indiceText = readIndex();
  const adrNums = new Set([...histText.matchAll(/^##\s+(\d+)\./gm)].map((m) => m[1]));
  const idxNums = new Set([...indiceText.matchAll(/^\|\s*§(\d+)\b/gm)].map((m) => m[1]));
  const missingIdx = [...adrNums].filter((n) => !idxNums.has(n)).sort((a, b) => +a - +b);
  if (!adrNums.size) info('99 con headers por fecha — 5a omitido');
  else if (!missingIdx.length) ok(`${adrNums.size} ADRs de 99 indexados en 00`);
  else warn(`${missingIdx.length} ADR(s) de 99 SIN fila en 00-INDICE: §${missingIdx.join(', §')}`);
}
const leccionesPath = join(DOCS, '30-LECCIONES.md');
if (!BOOT && existsSync(leccionesPath)) {
  const leccionesText = read(leccionesPath);
  const cortoPath = join(DOCS, '10-MEMORIA-CORTO-PLAZO.md');
  const espacialPath = join(DOCS, '20-MEMORIA-ESPACIAL.md');
  const estadoPath = join(DOCS, '05-ESTADO-GLOBAL.md');
  const histText = existsSync(histPath) ? read(histPath) : '';
  const indiceText = indexPaths.length ? readIndex() : '';
  const defined = new Set([...leccionesText.matchAll(/^###\s+([LM]-\d{2})\b/gm)].map((m) => m[1]));
  const allBrain = [claude, indiceText, existsSync(estadoPath) ? read(estadoPath) : '', leccionesText, histText,
    existsSync(cortoPath) ? read(cortoPath) : '', existsSync(espacialPath) ? read(espacialPath) : ''].join('\n');
  const referenced = new Set([...allBrain.matchAll(/\b([LM]-\d{2})\b/g)].map((m) => m[1]));
  const dangling = [...referenced].filter((r) => !defined.has(r)).sort();
  if (!referenced.size) info('sin refs L-NN/M-NN aún');
  else if (!dangling.length) ok(`refs L-/M- (${referenced.size} usadas / ${defined.size} def) resuelven en 30`);
  else warn(`refs L-/M- COLGANTES: ${dangling.join(', ')}`);
  // 5c) Tombstones-lite (v1.3 §50): lección ⚰️ citada desde nodos VIVOS (99 puede: es historia).
  const quarantined = new Set([...leccionesText.matchAll(/^###\s+([LM]-\d{2})\b[^\n]*⚰️/gm)].map((m) => m[1]));
  if (quarantined.size) {
    const liveText = [claude, existsSync(estadoPath) ? read(estadoPath) : '',
      existsSync(cortoPath) ? read(cortoPath) : '', existsSync(espacialPath) ? read(espacialPath) : ''].join('\n');
    const cited = [...quarantined].filter((id) => new RegExp(`\\b${id}\\b`).test(liveText)).sort();
    if (cited.length) warn(`nodo VIVO cita lección ⚰️ cuarentenada: ${cited.join(', ')} → apuntar al reemplazo o retirar la cita`);
    else ok(`${quarantined.size} lección(es) ⚰️ sin citas desde nodos vivos`);
  }
}
if (BOOT) head('  ⏭️  5a/5b omitidas en --boot');
const refDocs = new Set([...claude.matchAll(/docs\/([\w-]+\.md)/g)].map((m) => m[1]));
const PLACEHOLDER = /^NN-|NOMBRE|<tema>|<carpeta>/;
const missingDocs = [...refDocs].filter((f) => !PLACEHOLDER.test(f) && !existsSync(join(DOCS, f)));
if (!missingDocs.length) ok(`hojas docs/*.md referenciadas en CLAUDE.md (${refDocs.size}) existen`);
else warn(`hojas referenciadas en CLAUDE.md INEXISTENTES: ${missingDocs.join(', ')}`);
if (BOOT && !missingDocs.length) say(`  ✅ ${refDocs.size} hojas referenciadas existen`);

// 6) Skills ↔ inventario [--full] (v1.1: skills/ sin inventario = WARN)
head('\n6) Skills del repo catalogadas en skills-inventory:');
const SKILLS_DIR = join(ROOT, 'skills');
const invPath = join(DOCS, 'skills-inventory.md');
if (BOOT) head('  ⏭️  omitido en --boot');
else if (existsSync(SKILLS_DIR) && existsSync(invPath)) {
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
      } catch { /* ilegible → por nombre de carpeta */ }
    }
    const catalogued = inv.includes(d.name) || names.some((n) => inv.includes(n));
    if (!catalogued) { warn(`skill '${d.name}' NO está en skills-inventory.md → catalogar (§G.4)`); uncat++; }
  }
  if (!uncat) ok(`${dirs.length} carpetas de skills/ catalogadas`);
  // (6b QUITADO en v1.3 — sentencia G-11: 0 señal en 3 auditorías, puro ruido.)
} else if (existsSync(SKILLS_DIR)) {
  warn('skills/ existe pero docs/skills-inventory.md NO → crear el catálogo (§G.4)');
} else head('  ℹ️  skills/ no existe — omitido');

// 7) Integridad de archiveDir (deliberaciones) [--full]
head('\n7) Integridad de archiveDir (deliberación capturada ↔ conectada):');
const archiveDir = manifest.archiveDir ? join(ROOT, manifest.archiveDir) : null;
if (BOOT) head('  ⏭️  omitido en --boot');
else if (!archiveDir) degrade('manifest SIN archiveDir → gates 7 y 7b OFF (declararlo, §G.4)');
else if (!existsSync(archiveDir)) degrade(`archiveDir no existe en esta máquina (${manifest.archiveDir}) — bóveda no clonada → gates 7 y 7b OFF`);
else {
  // v1.9.1 (§83, TODO-37): el filtro solo miraba ficheros sueltos .json/.md, así que las
  // deliberaciones más CARAS —las que se guardan como CARPETA con su 00-LEEME y sus crudos—
  // no las veía ninguna corrida. El gate decía "80 crudos indexados" ignorando justo las tres
  // que costaron millones de tokens. Una carpeta cuenta como UNA entrada y debe estar en el README.
  const entries = readdirSync(archiveDir, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && /\.(json|md)$/i.test(e.name) && !/^README/i.test(e.name) && e.name !== 'runs.log')
    .map((e) => e.name);
  const dirs = entries.filter((e) => e.isDirectory() && !/^[._]/.test(e.name)).map((e) => e.name);
  files.push(...dirs);
  const readmePath = join(archiveDir, 'README.md');
  const readme = existsSync(readmePath) ? read(readmePath) : '';
  let bad = 0;
  if (!readme) { warn('archiveDir sin README.md índice — todo crudo debe estar indexado'); bad++; }
  else for (const f of files) if (!readme.includes(f)) { warn(`archivo de deliberación SIN fila en el README del archive: ${f}`); bad++; }
  // anclas: toda ref "research-archive/<file>" en 99/00/10/specs debe resolver en archiveDir
  const scanFiles = [histPath, indicePath, join(DOCS, '10-MEMORIA-CORTO-PLAZO.md')];
  if (manifest.specsDir && existsSync(join(ROOT, manifest.specsDir)))
    for (const s of readdirSync(join(ROOT, manifest.specsDir)).filter((f) => f.endsWith('.md')))
      scanFiles.push(join(ROOT, manifest.specsDir, s));
  const refd = new Set();
  for (const sf of scanFiles) {
    if (!existsSync(sf)) continue;
    for (const m of read(sf).matchAll(/research-archive\/([\w][\w.-]+\.(?:json|md))/g)) refd.add(m[1]);
  }
  const danglingRefs = [...refd].filter((f) => !existsSync(join(archiveDir, f)));
  if (danglingRefs.length) { warn(`anclas de deliberación que NO resuelven en archiveDir: ${danglingRefs.join(', ')}`); bad++; }
  const runsLog = join(archiveDir, 'runs.log');
  if (existsSync(runsLog)) {
    for (const l of read(runsLog).split('\n').filter(Boolean)) {
      const f = (l.split('|')[2] || '').trim();
      if (f && f !== 'DESCARTADO' && !existsSync(join(archiveDir, f))) { warn(`runs.log cita archivo inexistente: ${f}`); bad++; }
    }
  }
  if (!bad) ok(`archiveDir íntegro (${files.length} crudos indexados; anclas resuelven)`);
  // 7b) Bóveda vía fs (M-03 §50): commits ≠ origin. Lo no-commiteado lo cubre session-handoff.
  let vaultGit = archiveDir;
  for (let i = 0; i < 4 && !existsSync(join(vaultGit, '.git')); i++) vaultGit = join(vaultGit, '..');
  if (existsSync(join(vaultGit, '.git'))) {
    const refSha = (name) => {
      const direct = join(vaultGit, '.git', name);
      if (existsSync(direct)) return read(direct).trim().slice(0, 40);
      const packed = join(vaultGit, '.git', 'packed-refs');
      if (existsSync(packed)) { const l = read(packed).split('\n').find((x) => x.endsWith(' ' + name)); if (l) return l.slice(0, 40); }
      return null;
    };
    const headRef = (read(join(vaultGit, '.git', 'HEAD')).match(/ref:\s*(\S+)/) || [])[1];
    const local = headRef ? refSha(headRef) : null;
    const remote = headRef ? refSha(headRef.replace('refs/heads/', 'refs/remotes/origin/')) : null;
    if (local && remote && local !== remote)
      warn(`bóveda: HEAD local (${local.slice(0, 7)}) ≠ origin (${remote.slice(0, 7)}) → push pendiente (o pull si origin avanzó) — M-03`);
    else if (local && remote) ok('bóveda: HEAD local == origin (respaldo remoto al día)');
  }
}

// 8) SSoT — hecho duplicado fuera del nodo dueño [--full]
head('\n8) SSoT (un hecho = un nodo dueño):');
if (BOOT) head('  ⏭️  omitido en --boot');
else if (!Array.isArray(manifest.ssotFacts) || !manifest.ssotFacts.length) info('manifest sin ssotFacts — gate omitido (declarar hechos críticos)');
else {
  let hits = 0;
  for (const fact of manifest.ssotFacts) {
    // v1.9.3 (§83, TODO-37): una regex con los escapes COMIDOS sigue siendo VÁLIDA — no cae en el
    // catch— pero no matchea nada, así que el gate imprime ✅ en falso. Me pasó al declarar la
    // versión del kernel: quedó "[Kk]ernels+v?d+.d+.d+" tras cruzar bash→node→JSON, y el chequeo
    // dio verde. Un ssotFact roto es peor que no declararlo: promete vigilancia que no existe.
    if (/(^|[^\\])\b[dswDSWbB]\+/.test(fact.regex) || /(^|[^\\])\b[dswDSW]\{/.test(fact.regex))
      warn(`ssotFacts: la regex "${fact.regex}" parece tener los escapes COMIDOS (\\d/\\s/\\w sin barra invertida). Es válida pero no matchea nada → el gate daría ✅ en falso.`), hits++;
    try {
      const re = new RegExp(fact.regex, 'g');
      for (const rel of fact.scan || []) {
        if (rel === fact.owner) continue;
        const p = join(ROOT, rel);
        if (!existsSync(p)) continue;
        const m = read(p).match(re);
        if (m) { warn(`SSoT: "${fact.regex}" (dueño: ${fact.owner}) aparece en ${rel} (${m.length}×) → reemplazar por puntero`); hits++; }
      }
    } catch { warn(`ssotFacts: regex inválida "${fact.regex}"`); hits++; }
  }
  if (!hits) ok(`${manifest.ssotFacts.length} hecho(s) SSoT sin duplicados fuera de su dueño`);
}

// 9) Consolidado-aún-en-10 (síntoma exacto de la inflación) [--full]
head('\n9) Consolidado-aún-en-10 (GC pendiente):');
const cortoP = join(DOCS, '10-MEMORIA-CORTO-PLAZO.md');
if (BOOT) head('  ⏭️  omitido en --boot');
else if (existsSync(cortoP) && indexPaths.length) {
  const idxNums = new Set([...readIndex().matchAll(/^\|\s*§(\d+)\b/gm)].map((m) => m[1]));
  let flagged = 0;
  for (const l of read(cortoP).split('\n')) {
    if (!l.trim().startsWith('|')) continue; // solo filas de tabla (TODO ledger)
    // el ✅ debe estar en la CELDA de estado (no inline en el texto del item) — anti falso-positivo
    const cells = l.split('|').map((c) => c.trim());
    if (!cells.some((c) => /^✅/.test(c))) continue;
    const secs = [...l.matchAll(/§(\d+)/g)].map((m) => m[1]);
    if (secs.some((s) => idxNums.has(s))) { warn(`fila con estado ✅ ya consolidada (§${secs.join(',§')}) sigue en la tabla del 10 → retirarla en la poda (GC §G.4)`); flagged++; }
    // v1.9.0 (§83) — POLARIDAD INVERTIDA, el caso GRAVE que este gate no veía: una fila ✅ que
    // no cita NINGÚN § indexado. La de arriba dice "ya está en 99, retírala del 10" (benigna,
    // es higiene). Esta dice "la diste por cerrada y no hay ADR en ninguna parte" — el trabajo
    // se pierde entero y ninguna corrida lo delataba, porque sin § el `some()` daba false.
    else { warn(`fila con estado ✅ SIN § indexado que la respalde → o se consolidó y falta el puntero, o NUNCA se consolidó y el trabajo no está en ${'`99`'} (§G.3). Cita el §NN o abre el ADR: ${l.slice(0, 90).trim()}`); flagged++; }
  }
  if (!flagged) ok('tabla TODO del 10 sin filas ✅ ya consolidadas');
}

// 10) Huérfanas (v1.3: fusiona el viejo #1): BFS 2º orden + registro DIRECTO de neuronas NN- [--full]
head('\n10) Huérfanas (BFS de ruteo + registro directo de neuronas):');
if (BOOT) head('  ⏭️  omitido en --boot');
else {
  const allow = new Set(manifest.orphanAllowlist || []);
  const universe = readdirSync(DOCS).filter((f) => f.endsWith('.md'));
  const edgeRe = /(?:docs\/)?([\w][\w-]*\.md)/g;
  const fileText = (f) => existsSync(join(DOCS, f)) ? read(join(DOCS, f)) : '';
  const reachable = new Set();
  const queue = [];
  // raíces: CLAUDE.md + 00 + 40 (sus referencias arrancan el grafo)
  for (const rootTxt of [claude, fileText('00-INDICE.md'), fileText('40-LOBULOS-DOMINIO.md')])
    for (const m of rootTxt.matchAll(edgeRe)) if (universe.includes(m[1]) && !reachable.has(m[1])) { reachable.add(m[1]); queue.push(m[1]); }
  reachable.add('00-INDICE.md'); reachable.add('40-LOBULOS-DOMINIO.md');
  while (queue.length) {
    const cur = queue.pop();
    for (const m of fileText(cur).matchAll(edgeRe)) if (universe.includes(m[1]) && !reachable.has(m[1])) { reachable.add(m[1]); queue.push(m[1]); }
  }
  const orphans = universe.filter((f) => !reachable.has(f) && !allow.has(f));
  if (orphans.length) warn(`huérfanas de 2º ORDEN (existen pero ningún nodo de ruteo llega a ellas): ${orphans.join(', ')} → conectar o allowlist con razón`);
  // registro DIRECTO (regla §G.5 "si CLAUDE.md no la conoce, el cerebro está roto" — ex-#1):
  let unregistered = 0;
  for (const n of universe.filter((f) => /^\d{2}-/.test(f))) {
    const isChildLobe = /^4[1-9]-/.test(n);
    if (claude.includes(n)) continue;
    if (isChildLobe && lobeRegistry.includes(n)) continue;
    warn(`neurona ${n} sin registro DIRECTO en ${isChildLobe ? '40-LOBULOS' : 'CLAUDE.md §0'} (§G.5)`); unregistered++;
  }
  if (!orphans.length && !unregistered) ok(`${universe.length} docs alcanzables y neuronas registradas`);
}

// (11 QUITADO v1.3: peer-hash warn no cazó 3 kernels divergentes; F1 = hash-gate BLOQUEANTE vs canónico.)

// 12) Fechas stale en 05/10 [info · corre también en --boot]
{
  const staleDays = manifest.staleDays || 10;
  const today = new Date();
  let oldest = null, oldestWhere = '';
  for (const rel of ['docs/05-ESTADO-GLOBAL.md', 'docs/10-MEMORIA-CORTO-PLAZO.md']) {
    const p = join(ROOT, rel);
    if (!existsSync(p)) continue;
    const m = read(p).match(/(?:última actualización[:* ]*|\(al |actualizado )\**(\d{4}-\d{2}-\d{2})/i);
    if (m) { const d = new Date(m[1]); if (!oldest || d < oldest) { oldest = d; oldestWhere = rel; } }
  }
  if (oldest) {
    const days = Math.floor((today - oldest) / 86400000);
    if (days > staleDays) info(`frescura: ${oldestWhere} sellado hace ${days} días (> ${staleDays}) → re-verificar vs git real y re-sellar`);
  }
}

// 13) Specs: checklist con evidencia [--full]
head('\n13) Specs con checklist tickeable (evidencia, no dibujito):');
if (BOOT) head('  ⏭️  omitido en --boot');
else if (!manifest.specsDir) info('manifest sin specsDir — gate omitido');
else {
  const sd = join(ROOT, manifest.specsDir);
  if (!existsSync(sd)) info(`specsDir no existe (${manifest.specsDir})`);
  else {
    const specs = readdirSync(sd).filter((f) => f.endsWith('.md'));
    let noCk = 0, badTicks = 0;
    // v1.3 §50: solo evidencia RESOLUBLE (ancla seguible); la vieja aceptaba backtick/fecha = tautológica.
    const EVIDENCE = /§\d+|TODO-\d+|research-archive\/|docs\/[\w-]+\.md|specs\/[\w-]+\.md|https?:\/\/|\b[0-9a-f]{7,40}\b/;
    for (const s of specs) {
      const t = read(join(sd, s));
      if (!/^##+\s*.*Checklist/im.test(t)) { noCk++; continue; }
      // v1.4.1 §51: agregar POR SPEC (no por tick) — 33 warns idénticos en un repo hermano eran
      // ruido inaccionable; 1 warn con conteo + 1er ejemplo empuja igual y se LEE.
      let n = 0, first = '';
      for (const l of t.split('\n')) {
        if (!/^\s*-\s*\[x\]/i.test(l)) continue;
        if (!EVIDENCE.test(l)) { n++; if (!first) first = l.trim().slice(0, 60); }
      }
      if (n) { warn(`${s}: ${n} ítem(s) tickeado(s) SIN evidencia resoluble (1º: "${first}…") → anclar §/TODO/ruta/URL/sha`); badTicks += n; }
    }
    if (!badTicks) ok(`ticks de checklist con evidencia en ${specs.length - noCk} spec(s) con checklist`);
    if (noCk) info(`${noCk} spec(s) sin sección "## Checklist" (los previos a la convención §173 — info)`);
  }
}

// 14) deepAudit — auditoría Nivel-2 vigente [nudge info; días en --boot, headers solo en --full]
{
  const da = manifest.deepAudit;
  if (da && da.last) {
    const days = Math.floor((new Date() - new Date(da.last)) / 86400000);
    let due = da.maxDays && days > da.maxDays ? `hace ${days} días (> ${da.maxDays})` : null;
    let gap = 0;
    if (!BOOT && da.maxAdrGap && existsSync(histPath)) {
      const headers = (read(histPath).match(/^##\s+/gm) || []).length;
      gap = da.coveredHeaderCount ? headers - da.coveredHeaderCount : 0;
      if (gap >= da.maxAdrGap) due = (due ? due + ' y ' : '') + `${gap} ADRs nuevos (≥ ${da.maxAdrGap})`;
    }
    // v1.6 F3 §53 (escalación con GRACIA — el nudge info se ignoró semanas; el warn BLOQUEA commits
    // del cerebro vía pre-commit): vencida dentro de gracia (maxDays+7 / gap+6) = info; pasada = WARN.
    const pastGrace = (da.maxDays && days > da.maxDays + 7) || (da.maxAdrGap && gap >= da.maxAdrGap + 6);
    if (due && pastGrace) warn(`🔬 auditoría Nivel-2 MUY vencida (${due}; gracia agotada) → correr skill auditoria-cerebro / mantenimiento-general AHORA`);
    else if (due) info(`🔬 auditoría Nivel-2 VENCIDA: última ${da.last}, ${due} → correr skill auditoria-cerebro (§173)`);
    // v1.3 §50: la tabla de la auditoría debe EXISTIR (sin ella la Sonda 0 no puede diffear).
    if (!BOOT && da.tableFile && archiveDir && existsSync(archiveDir) && !existsSync(join(archiveDir, da.tableFile)))
      warn(`deepAudit.tableFile "${da.tableFile}" NO existe en archiveDir → la Sonda 0 de la próxima auditoría no tiene input`);
    else if (!BOOT && da.tableFile && (!archiveDir || !existsSync(archiveDir)))
      degrade(`deepAudit.tableFile "${da.tableFile}" NO verificable — bóveda no clonada`);
  } else info('manifest sin deepAudit — la auditoría Nivel-2 no tiene disparador (declararlo, §173)');
}

// 16) Fiabilidad (M-22 §257/TODO-44): marcadores `verificado-vivo:` stale [info, --full]
//     Cura del hueco "documentado ✅ ≠ real": una afirmación sobre realidad externa
//     (desplegado/live/datos) lleva `verificado-vivo: YYYY-MM-DD`; este gate avisa cuando se
//     vuelve stale. Opt-in: 0 marcadores → 0 hallazgos → no rompe ningún repo (mecaniza M-22).
head('\n16) Fiabilidad (M-22): claims `verificado-vivo` vs realidad:');
if (BOOT) head('  ⏭️  omitido en --boot');
else {
  const vlStaleDays = manifest.verifiedLiveStaleDays || 30;
  const vlScan = manifest.verifiedLiveScan || ['docs/05-ESTADO-GLOBAL.md', 'docs/10-MEMORIA-CORTO-PLAZO.md'];
  const today = new Date();
  let total = 0, stale = 0;
  for (const rel of vlScan) {
    const p = join(ROOT, rel);
    if (!existsSync(p)) continue;
    for (const m of read(p).matchAll(/verificado-vivo:\s*(\d{4}-\d{2}-\d{2})/gi)) {
      total++;
      const days = Math.floor((today - new Date(m[1])) / 86400000);
      if (days > vlStaleDays) { info(`claim "verificado-vivo: ${m[1]}" en ${rel} tiene ${days}d (> ${vlStaleDays}) → re-verificar contra realidad o retirar la afirmación (M-22)`); stale++; }
    }
  }
  if (total && !stale) ok(`${total} claim(s) \`verificado-vivo\` vigentes (≤ ${vlStaleDays}d)`);
  else if (!total) ok('check de fiabilidad activo (sin marcadores `verificado-vivo:` aún — opt-in M-22/§257)');
}

// 17) Git del PROPIO repo (auditoría Nivel-2 insemastereo 2026-08-01, N2-01) [--boot y --full]
//     Punto ciego de diseño hasta v1.6: el único bloque git del kernel (#7b) mira la BÓVEDA.
//     Del repo que audita, el linter no sabía nada — así que el `05` de insemastereo pudo
//     declarar «main == origin/main, pusheado ✓, 3 commits» durante 42 días con el HEAD en otra
//     rama y `main` 24 commits detrás, y los 16 gates seguían dando SANO. Cinco sondas de la
//     auditoría lo reportaron por separado; ninguno de los gates podía.
//     Solo fs, sin child_process (mismo criterio que #7b): no dispara procesos en cada boot.
head('\n17) Git del PROPIO repo (¿el cerebro dice la verdad sobre dónde estás?):');
{
  const gitDir = join(ROOT, '.git');
  if (!existsSync(gitDir)) info('sin .git — gate omitido');
  else {
    const refSha = (name) => {
      const direct = join(gitDir, name);
      if (existsSync(direct)) return read(direct).trim().slice(0, 40);
      const packed = join(gitDir, 'packed-refs');
      if (existsSync(packed)) { const l = read(packed).split('\n').find((x) => x.endsWith(' ' + name)); if (l) return l.slice(0, 40); }
      return null;
    };
    const headRef = (read(join(gitDir, 'HEAD')).match(/ref:\s*(\S+)/) || [])[1];
    const branch = headRef ? headRef.replace('refs/heads/', '') : '(detached)';
    const local = headRef ? refSha(headRef) : null;
    const remote = headRef ? refSha(headRef.replace('refs/heads/', 'refs/remotes/origin/')) : null;

    // (a) el hecho, para que el boot lo tenga sin adivinar
    if (!remote) info(`rama \`${branch}\` — sin \`origin/${branch}\` local: o no está pusheada, o falta \`git fetch\``);
    else if (local !== remote) info(`rama \`${branch}\`: local ${String(local).slice(0, 7)} ≠ origin ${String(remote).slice(0, 7)} → hay push o pull pendiente`);
    else ok(`rama \`${branch}\` == origin`);

    // (b) el gate que importa: ¿algún nodo always-on declara OTRA rama?
    //     Se recorre LÍNEA a línea y solo se miran las que hablan de git; de esas se extraen los
    //     tokens con forma de rama (`backticked` y origin/<x>).
    //     ⚠️ La v1 buscaba solo "rama X"/"branch X" y NO cazaba el caso real que motivó el gate
    //     —el 05 de insemastereo decía «Local `main` == `origin/main`»—: era teatro hasta que se
    //     probó restituyendo la mentira y viendo que NO disparaba. Un gate se verifica encendido.
    //     Se evalúa POR ARCHIVO, no en bolsa común: el defecto real era que el `05` —el nodo que
    //     se lee primero— mentía, mientras el `10` sí nombraba la rama buena. Sumar los tokens de
    //     todos los always-on daba por sana la mentira. Cada nodo responde de lo que él declara.
    if (headRef) {
      // PRECISIÓN sobre recall: solo cuentan DOS señales inequívocas —`origin/<x>`, que nadie escribe
      // salvo para hablar de una rama, y un token pegado a la palabra rama/branch—. La v3 recogía
      // CUALQUIER backtick de una línea git-ish y en bersaglio acusó al `05` de «declarar la rama
      // `arquitecto-software` / `OPUS-5`» (una skill y un tag de modelo). Un gate ruidoso se acaba
      // ignorando: perder una mentira rara cuesta menos que perder la confianza en el gate ([[M-05]]).
      const RUIDO = (r) => /^(única|activa|actual|de|del|la|el|en|y|o|prod|producción|git|origin|main-.*)$/i.test(r)
        || /^\d+[a-z]?$/.test(r)            // `05`, `10`, `99`, `00a`
        || /^\d{2}[-_]/.test(r)             // `30-LECCIONES`, `00-INDICE`
        || /\.(md|mjs|json|js|html|css|ps1|yml)$/i.test(r);
      for (const rel of (manifest.alwaysOn || [])) {
        const p = join(ROOT, rel);
        if (!existsSync(p)) continue;
        const declara = new Set();
        for (const linea of read(p).split('\n')) {
          if (!/rama|branch|origin\//i.test(linea)) continue;
          for (const m of linea.matchAll(/origin\/([\w.-][\w./-]{0,39})/g)) declara.add(m[1]);
          // token INMEDIATAMENTE tras rama/branch (con los calificativos que se usan en estos cerebros)
          for (const m of linea.matchAll(/\b(?:rama|branch)\s+(?:única\s+|activa\s+|de trabajo\s+|prod\s+)?[`*]{1,2}([\w.-][\w./-]{0,39})[`*]{1,2}/gi)) declara.add(m[1]);
          // v1.10.2: la excepción de «flujo declarado» de abajo existía pero NUNCA se activaba,
          // porque solo se capturaba el lado IZQUIERDO. cars declara «rama ÚNICA `dev` · merge
          // `dev`→`main`»: el gate veía `dev`, no veía `main`, y acusaba de mentir a un `05` que
          // dice la verdad —una REGLA durable, no una afirmación sobre el checkout de ahora—.
          // 4ª corrección de este chequeo por la misma clase: distinguir la regla del dato volátil.
          for (const m of linea.matchAll(/[`*]{1,2}([\w.-][\w./-]{0,39})[`*]{1,2}\s*(?:→|->|=>)\s*[`*]{1,2}([\w.-][\w./-]{0,39})[`*]{1,2}/g)) { declara.add(m[1]); declara.add(m[2]); }
        }
        const otras = [...declara].filter((r) => r !== branch && !RUIDO(r));
        // Si el archivo nombra varias ramas y una es la real, es un flujo declarado (dev→main), no una mentira.
        if (otras.length && !declara.has(branch))
          warn(`\`${rel}\` declara la rama ${otras.map((r) => '`' + r + '`').join(' / ')} pero estás en \`${branch}\` → el nodo que se lee primero miente sobre dónde estás (N2-01). El dato volátil se GENERA (heartbeat), no se copia al 05.`);
      }
    }
  }
}

// 23) Neuronas SIN cap declarado (ADR inmobiliaria §74) [--full]
//     El linter solo vigila lo que el manifest declara, y el manifest callaba sobre el resto:
//     así `32-LECCIONES-META` de cars llegó a 27k sin que ningún gate la mirara. La ausencia
//     de cap dejaba de ser una decisión y pasaba a ser un olvido silencioso. Ahora se declara
//     un cap, o se declara en `noCap` CON RAZÓN — pero se decide.
head('\n23) Neuronas con techo declarado (el silencio no es una decisión):');
if (BOOT) head('  ⏭️  omitido en --boot');
else {
  const caps = manifest.caps || {};
  const noCap = manifest.noCap || {};                 // { "docs/99-HISTORIAL-ADR.md": "razón" }
  const sinDecidir = [];
  for (const f of readdirSync(DOCS).filter((x) => x.endsWith('.md') && !x.startsWith('.'))) {
    const rel = 'docs/' + f;
    if (caps[rel] || noCap[rel]) continue;
    sinDecidir.push([rel, read(join(DOCS, f)).length]);
  }
  if (!sinDecidir.length) ok(`${Object.keys(caps).length} neurona(s) con cap + ${Object.keys(noCap).length} declarada(s) sin tope`);
  else {
    sinDecidir.sort((a, b) => b[1] - a[1]);
    const top = sinDecidir.slice(0, 6).map(([r, n]) => `${r.replace('docs/', '')} (${Math.round(n / 1000)}k)`).join(' · ');
    info(`${sinDecidir.length} neurona(s) sin \`caps\` ni \`noCap\` en el manifest → crecen sin techo y ningún gate las mira: ${top}${sinDecidir.length > 6 ? ' …' : ''}`);
    info('   decide cada una: cap medido (NO inventado — §74.3) o `noCap` con su razón (p.ej. 99: nunca se lee entero)');
  }
}

// 24) 🐤 Canario de boot (bajado del `boot-gate.mjs` instance-side, v1.8.0) [--full]
//     session-handoff --boot-echo escribe docs/.boot-marker en CADA SessionStart. Si nadie lo
//     escribió en 48h, los hooks del harness están MUERTOS (máquina nueva, settings.json roto,
//     node fuera de PATH): el cerebro arranca sin signos vitales y NADA lo detecta (A-03).
//     Kernel-safe ×repos: solo aplica donde el contrato está INSTALADO (settings.json con
//     session-handoff) — un repo sin ese hook no debe bloquearse por un marker que nada escribe.
head('\n24) Canario de boot (¿los hooks del harness siguen vivos?):');
if (BOOT) head('  ⏭️  omitido en --boot (lo está escribiendo esta misma sesión)');
else {
  const settingsP = join(ROOT, '.claude', 'settings.json');
  const wired = existsSync(settingsP) && read(settingsP).includes('session-handoff');
  // v1.10.3 (ADR 85, U-13): el gate le preguntaba al PROPIO archivo vigilado si debia
  // vigilarlo. Borra el hook de settings.json y el canario contestaba 'no aplica en este
  // repo': falla ABIERTO ante justo la regresion que existe para cazar. La declaracion sube
  // al manifest (como bootCharsTarget en #15), asi apagarlo es una decision EXPLICITA.
  const declared = manifest.harnessCanary === true;
  if (!declared) info(manifest.harnessCanary === false
    ? 'canario de boot APAGADO por declaración EXPLÍCITA (harnessCanary:false) — su razón debe estar en el manifest'
    : 'canario de boot no declarado en el manifest (harnessCanary) — no aplica en este repo');
  else if (!wired) warn('el manifest declara harnessCanary pero .claude/settings.json NO invoca session-handoff → el hook SessionStart está roto o borrado y el cerebro arranca SIN signos vitales. Recablea el hook, o pon harnessCanary:false con su razón.');
  else {
    const markerP = join(DOCS, '.boot-marker');
    const ageH = existsSync(markerP) ? (Date.now() - statSync(markerP).mtimeMs) / 3.6e6 : Infinity;
    // v1.10.1: el canario comparaba el marker contra el RELOJ, y un repo en PAUSA lo incumple
    // siempre — insema lleva semanas parado a propósito y el gate gritaba «hooks muertos» cada
    // corrida. Un guardián que ladra a un repo que nadie tocó enseña a ignorarlo, y entonces no
    // avisa el día que importa. Ahora compara contra la ACTIVIDAD REAL del repo (`.git/logs/HEAD`,
    // leído con fs, sin child_process): si hubo commits DESPUÉS del último marker, estuviste
    // trabajando aquí y los hooks no dispararon → eso sí es la avería. Sin actividad → informativo.
    const reflog = join(ROOT, '.git', 'logs', 'HEAD');
    const actividadH = existsSync(reflog) ? (Date.now() - statSync(reflog).mtimeMs) / 3.6e6 : Infinity;
    const trabajandoAqui = actividadH < ageH;         // hubo git DESPUÉS del último arranque
    // Umbral CRÓNICO (168h), no agudo: un repo hermano se mantiene a ráfagas desde la sesión de
    // OTRO —ahí el pre-commit sí corre; lo que no dispara es el SessionStart, que no existe— y con
    // 48h eso gritaba en cada mantenimiento cruzado. Una semana de actividad sin un solo arranque
    // ya no es un patrón de trabajo: es el contrato roto.
    if (ageH > 168 && trabajandoAqui && !process.env.BOOT_CANARY_SKIP)
      warn(`una SEMANA de actividad git (última hace ${Math.round(actividadH)}h) sin que ningún SessionStart escriba docs/.boot-marker (${ageH === Infinity ? 'NUNCA' : Math.round(ageH) + 'h'}) — los hooks del harness NO disparan aquí. Verifica .claude/settings.json (o: node scripts/session-handoff.mjs --boot-echo). Intencional → BOOT_CANARY_SKIP=1.`);
    else if (ageH > 48)
      info(`canario en reposo: marker de hace ${ageH === Infinity ? 'nunca' : Math.round(ageH) + 'h'}${trabajandoAqui ? ' (mantenido desde otra sesión: el pre-commit sí corre)' : ' y sin actividad git posterior'}`);
    else ok(`canario vivo (marker de hace ${Math.round(ageH)}h)`);
  }
}

// 25) ¿Alguien me INVOCA? — cableado del propio linter (inmobiliaria ADR §81, lección M-07) [--full]
//     Un gate compartido tiene DOS mitades: el código (kernel, byte-idéntico ×repos) y el CABLEADO
//     (instance: core.hooksPath + githooks/pre-commit). La mitad instance es la que se olvida y falla
//     en SILENCIO: `insemastereo` corrió semanas sin pre-commit y ninguna corrida lo delató, porque
//     este linter validaba el CONTENIDO del kernel, nunca si alguien lo LLAMA. Sin child_process:
//     se lee .git/config con fs, igual que el resto del kernel.
head('\n25) Cableado del linter (un gate que nadie invoca no protege nada):');
if (BOOT) head('  ⏭️  omitido en --boot');
else {
  const gitCfg = join(ROOT, '.git', 'config');
  if (!existsSync(gitCfg)) info('sin .git/config legible (¿worktree o submódulo?) — cableado no verificable aquí');
  else {
    const cfg = read(gitCfg);
    const m = cfg.match(/^\s*hooksPath\s*=\s*(.+)$/m);
    const hooksDir = m ? m[1].trim() : join('.git', 'hooks');
    const hookP = join(ROOT, hooksDir, 'pre-commit');
    if (!existsSync(hookP))
      warn(`no hay pre-commit en "${hooksDir}/" → este linter NO corre solo: los commits del cerebro pasan sin mirar. Cablea: cp githooks/pre-commit + \`git config core.hooksPath githooks\` (M-07).`);
    else if (!read(hookP).includes('brain-check'))
      warn(`"${hooksDir}/pre-commit" existe pero NO invoca brain-check.mjs → gate decorativo (M-06/M-07).`);
    else ok(`pre-commit cableado en "${hooksDir}/" e invoca este linter`);
  }
}

// 26) Longitud de fila del INDICE (la regla escrita que nadie medía) [--full]
//     El manifest de inmobiliaria declara "objetivo <=200c por fila" y "revisar hacia los ~100
//     ADRs"; al medirlo, las 13 filas mas recientes lo incumplian TODAS (§71 = 449c) y el cap
//     reventaba hacia los ~83 ADRs, no los ~100. Una regla sin gate es una intencion: el indice
//     es la capa de RUTEO -- si cada fila cuenta la historia, deja de enrutar y pasa a narrar.
head('\n26) Longitud de fila del índice (ruteo, no narración):');
if (BOOT) head('  ⏭️  omitido en --boot');
else if (!indexPaths.length) info('sin índice');
else {
  const LIMITE = 200, RUIDO = 260;   // avisa desde 260c para no ahogar por 10 chars de mas
  const gordas = [];
  for (const p of indexPaths) {
    read(p).split('\n').forEach((l, i) => {
      const m = l.match(/^\|\s*§(\d+)\b/);
      if (m && l.length > RUIDO) gordas.push({ f: p.split(/[\\/]/).pop(), n: i + 1, s: m[1], c: l.length });
    });
  }
  if (!gordas.length) ok(`filas §NN del índice dentro de ${LIMITE}c (+holgura)`);
  else {
    gordas.sort((a, b) => b.c - a.c);
    const top = gordas.slice(0, 5).map((g) => `§${g.s} (${g.c}c)`).join(' · ');
    info(`${gordas.length} fila(s) §NN por encima de ${RUIDO}c (objetivo ${LIMITE}c): ${top}${gordas.length > 5 ? ' …' : ''} → el detalle va al ADR; la fila enruta`);
  }
}

// 27) Rutas FANTASMA en las neuronas (mecaniza la "Frescura" de §G.4, que era [HONOR]) [--full]
//     La doctrina dice "si mueves/renombras/eliminas un componente, actualiza el nodo en el MISMO
//     cambio" — y no había gate. Al medirlo a mano, el nodo espacial de inmobiliaria citaba
//     `render.js` con una función `renderPropertyCard()` que NO EXISTE en ninguna parte, y un
//     `toast.js` cuyo código vive en `utils.js`. Una neurona que manda a leer un archivo inexistente
//     es peor que una incompleta: gasta el turno del que confió en ella.
head('\n27) Rutas fantasma en las neuronas (frescura mecanizada):');
if (BOOT) head('  ⏭️  omitido en --boot');
else {
  const SKIP_DIR = new Set(['node_modules', '.git', 'dist', '.astro', '.wrangler', '_legacy', 'coverage', '.next']);
  const porNombre = new Set();
  let visitados = 0;
  (function walk(d) {
    if (visitados > 20000) return;                       // cota dura: el linter no se cuelga por un repo enorme
    let ents = []; try { ents = readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      if (SKIP_DIR.has(e.name) || e.name.startsWith('.')) continue;
      visitados++;
      if (e.isDirectory()) walk(join(d, e.name)); else porNombre.add(e.name);
    }
  })(ROOT);
  // MISMA excepción que aprendió el kit ([[LD-07]]): una ruta puede citarse legítimamente para
  // decir que YA NO existe. Sin esta ventana, el gate acusa justo a quien documentó la corrección.
  // La ventana de negación incluye `ex \`X\`` porque así es como el cerebro marca un nombre viejo
  // en la práctica ("`js/admin/hoy.js` (ex `dashboard.js`)") — sin ella el gate acusa justo a la
  // línea que YA documentó el renombre, que es el caso mejor documentado de todos.
  const NEGACION = /no existe|NO existe|fantasma|inexistente|eliminad|borrad|retirad|ya no |obsolet|antes (se |era|dec)|renombrad|movid|\bex\s+`|\bantiguo|\bviejo/i;
  // ÁMBITO acotado a las neuronas cuyo oficio ES describir el PRESENTE (estado · WIP · espacial ·
  // config). La primera versión escaneó todo `docs/` y acusó a 137 inocentes en cars: el historial
  // `99` y el índice `00` citan el pasado POR DISEÑO —un ADR es un registro fechado, no una
  // afirmación sobre hoy— y las lecciones usan rutas-plantilla (`admin-X.js`). Acusar a la historia
  // por envejecer es lo que convierte un gate en ruido, y el ruido lo apaga en una semana.
  const AMBITO = /^(05|10|20|21|22|50)[-.]/;
  const PLANTILLA = /(^|[/_-])[A-Z]([./_-]|$)|^[-.]/;   // `admin-X.js`, `X.ui.js`, `.dc.html`: patrón, no ruta
  const fantasmas = [];
  for (const f of readdirSync(DOCS).filter((x) => AMBITO.test(x) && x.endsWith('.md'))) {
    const lineas = read(join(DOCS, f)).split('\n');
    // Contexto EXTERNO: una neurona describe legítimamente cosas que viven fuera del repo (la
    // bóveda, un prototipo en otra carpeta, un repo hermano). El contexto que lo establece suele
    // estar en la línea anterior —«`PROTOTIPO/` (en `Desktop/`, repo aparte)»— así que leer
    // línea-a-línea acusa al nodo mejor escrito. Ventana de 2 líneas hacia atrás.
    const EXTERNO = /\.\.\/|repo aparte|b[oó]veda|Desktop|fuera del repo|otro repo|hermano|canon del kernel/i;
    lineas.forEach((l, i) => {
      if (NEGACION.test(l)) return;
      if (EXTERNO.test(l) || EXTERNO.test(lineas[i - 1] || '') || EXTERNO.test(lineas[i - 2] || '')) return;
      for (const m of l.matchAll(/`([A-Za-z0-9_/.-]+\.(?:js|mjs|ts|astro|css|html))`/g)) {
        const ruta = m[1];
        if (ruta.startsWith('..') || /^[A-Za-z]:/.test(ruta)) continue;   // cross-repo: no es asunto de este linter
        if (PLANTILLA.test(ruta)) continue;                               // ruta-plantilla, no ruta real
        if (existsSync(join(ROOT, ruta))) continue;
        if (porNombre.has(ruta.split('/').pop())) continue;               // existe, aunque el nodo cite otra ruta
        fantasmas.push(`${f}:${i + 1} → \`${ruta}\``);
      }
    });
  }
  if (!fantasmas.length) ok('ninguna neurona cita archivos inexistentes');
  else { warn(`${fantasmas.length} ruta(s) FANTASMA citadas por neuronas (el archivo no existe en el repo): ${fantasmas.slice(0, 6).join(' · ')}${fantasmas.length > 6 ? ' …' : ''} → corregir el nodo o marcar la ruta como retirada`); }
}

// ---- salida (presupuesto de stdout en --boot) ----
const sano = '✅ CEREBRO SANO (estructura íntegra' + (manifest.deepAudit && manifest.deepAudit.last ? ' · auditoría semántica: ' + manifest.deepAudit.last : '') + ')';
const parcial = `🟠 ESTRUCTURA ÍNTEGRA, pero ${degraded} gate(s) DEGRADADOS (no pudieron correr) — NO es un cerebro verificado: clona la bóveda / el canónico y re-corre`;
lines.push(`\n${problems ? '⚠️  ' + problems + ' problema(s) — revisar antes de avanzar' : (degraded ? parcial : sano)}\n`);
let out = lines;
if (BOOT && out.join('\n').length > 2000) {
  // presupuesto duro: cada línea del boot se re-inyecta como contexto en CADA sesión
  out = out.filter((l) => !l.startsWith('  ✅') || /BOOT|SANO/.test(l));
  if (out.join('\n').length > 2000) out = out.slice(0, 24).concat(['  … (recortado por presupuesto de stdout; detalle: npm run brain:check)']);
}
console.log(out.join('\n'));
process.exit(problems ? 1 : 0);
