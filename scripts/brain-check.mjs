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
//       · 🔒 2b) BOOT REAL = alwaysOn+sidecars+C0+MEMORY.md vs `bootRealTarget` [warn si declarado · v1.27.0, D6]
//   (3) Desync 00→99 [warn, --full]                     (10) Huérfanas: BFS 2º orden + neurona NN[a-z]- sin registro directo [warn, --full]
//   (4) Frescura cache SW↔05 [warn, opcional]           (12) Fechas stale en 05/10 [info, --boot]
//   (5) Refs cruzadas ADR/L-M/hojas [warn]              (13) Specs: checklist con evidencia RESOLUBLE [warn, --full]
//       + 5c) cita viva a lección ⚰️ cuarentenada [warn] (14) deepAudit Nivel-2 vencida [info] + tableFile existe [warn]
//       · v1.29.0 (F2): 5b y 5c IGNORAN refs cualificadas `PREFIJO:ID` — las valida el maestro
//   (6) Skills↔inventario [warn, --full]                (15) Schema del manifest: clave desconocida [warn]
//   (7) archiveDir íntegro [warn, --full]               (16) Fiabilidad M-22: `verificado-vivo` stale [info, --full]
//       (0-canónico, 7, 7b, 14-tableFile) DEGRADAN si la bóveda o el canónico no están clonados
//       v1.12.0: (8-dueño, 16-sin-marcadores, 27-sin-rutas) DEGRADAN si el gate no comparó NADA
//       (29) v1.13.0: cifras CONTABLES del cerebro vs el código (cura «CF 9» contra 11 reales)
//       (el ✅ INMERECIDO, §120) · (26) trinquete de filas gordas del índice
//       + 7b) bóveda: commits ≠ origin vía fs [warn]
//       v1.30.0 (PLAN-CIERRE §5, capa 2): `session-handoff --boot-echo` COBRA el flag 🚨
//       `docs/.vigia-alerta` que levanta el vigía de la bóveda. Aquí NO cambia ni un chequeo: el
//       bump es del KERNEL, que se reparte entero, y su sello tiene UN dueño — esta constante.
// ===========================================================
const KERNEL_VERSION = '1.30.0';
import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { homedir } from 'os';
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
/*
 * ⚠️ NORMALIZA CRLF, y no es cosmética: este lector alimenta CADA medición del linter (§259).
 *
 * En Windows, git convierte los finales de línea al hacer checkout, así que un fichero que acaba de
 * pasar por un commit gana **un byte por línea** sin que su contenido cambie ni un carácter. Medido
 * el 28-ago: `CLAUDE.md` +150 y el `10` +117 = **267 chars fantasma en el presupuesto de arranque**,
 * suficiente para que el gate ordenara PODAR un boot que estaba por debajo del objetivo. Y `05`, que
 * lo genera el heartbeat, tenía CERO: o sea que el número bailaba según qué fichero hubiera tocado
 * git el último.
 *
 * El propio kernel ya lo sabía —el gate #1 hace este mismo `replace` desde hace versiones— pero lo
 * arregló en SU línea y dejó los otros 55 usos midiendo `\r` como si fuera conocimiento. 🎯 *Un
 * arreglo puesto en el sitio donde dolió, en vez de en el instrumento, deja el fallo vivo en todos
 * los demás.* Normalizar solo puede RELAJAR: ninguna medida crece, así que no bloquea a nadie.
 */
const read = (p) => readFileSync(p, 'utf-8').replace(/\r\n/g, '\n');

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
  // v1.11.0 (#28): directorios de TRABAJO fuera de `docs/` (planes, specs) que el cerebro debe citar,
  // su allowlist y la RAZÓN de esa allowlist (una excepción sin razón es una fuga con permiso).
  'workDirs', 'workAllowlist', 'workAllowlistRazon',
  // v1.12.0 (#26): deuda CONGELADA de filas gordas del índice. Trinquete: solo puede bajar.
  'indexRowOverLimitBaseline',
  // v1.13.0 (#29): cifras que el cerebro afirma y el kernel puede CONTAR en el repo.
  // v1.17.0 (#7c · K-05): deuda CONGELADA de deliberaciones declaradas SIN crudo enlazado.
  // Trinquete igual que #26: solo puede bajar; una nueva bloquea.
  'delibAnchorBaseline',
  // v1.23.0 (#6b): deuda CONGELADA de skills portables ya derivadas. Mismo trinquete que #26:
  // solo puede bajar; una NUEVA bloquea. Nace porque el 6b se midio en UN repo y se repartio a
  // cuatro — los hermanos tenian 13-15 derivadas y el gate les bloqueaba el commit de golpe.
  'skillDriftBaseline',
  // v1.19.0 (§143): un sello de frescura envejece con los COMMITS, no con el calendario. Umbral
  // doble: se marca stale por lo que llegue ANTES (días o commits).
  'staleCommits', 'verifiedLiveStaleCommits',
  'countableFacts',
  // v1.27.0 (dictamen F2 · D6): TECHO del arranque REAL (always-on + sidecars + C0 + MEMORY.md).
  // NO sustituye a `bootCharsTarget` —ese sigue siendo la palanca de poda de lo que el repo
  // controla— sino que techa lo que antes ni se CONTABA. Opcional a propósito: sin la clave el
  // gate #2 solo informa, para no romperle el commit a los hermanos que aún no la han adoptado.
  'bootRealTarget',
]);
// v1.14.0: prefijo `x-` para la config de gates PROPIOS de un repo (como las cabeceras de
// extensión de HTTP). Sin él había dos malas salidas: meter una clave de un solo proyecto en
// KNOWN_KEYS —que es compartida por los cuatro repos y acabaría siendo un cajón de sastre— o
// disfrazarla de comentario con `_`, que la hace invisible para quien lea el manifest buscando
// qué gates hay. Con `x-` la clave se declara, se ve, y el kernel no finge conocerla.
for (const k of Object.keys(manifest)) {
  if (!k.startsWith('_') && !k.startsWith('x-') && !KNOWN_KEYS.has(k)) {
    warn(`manifest: clave desconocida "${k}" (¿typo? un typo apaga gates en silencio) — schema v1.2. Si es config de un gate PROPIO de este repo, nómbrala "x-${k}".`);
  }
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
// (ADR §193) Para un nodo always-on su `cap` NO es el techo que aprieta: los tres caps suman
// 39000c sobre un presupuesto de 31500, asi que ninguno puede alcanzarse a la vez. El `10` decia
// "9331c/16000 · 58%" cuando su margen REAL era 124c — un numero que se LEE como holgura y
// significa lo contrario (familia `38-GATES-QUE-MIENTEN`). Se publica el techo EFECTIVO =
// presupuesto - lo que ocupan los OTROS always-on. Solo se REPORTA: el candado sigue siendo UNO
// (el total), porque repartir la culpa entre nodos no tiene respuesta objetiva — por eso §G.5
// dice "paga donde esta el peso" y el pre-aviso del 97% vive en el bloque del boot, no aqui.
const bootReal = {};
if (BOOT_CHARS_TARGET) for (const rel of ALWAYS_ON) {
  const p = join(ROOT, rel);
  if (existsSync(p)) bootReal[rel] = read(p).length;
}
const bootTotalAO = Object.values(bootReal).reduce((a, b) => a + b, 0);
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
  let tag = cc ? `${chars}c/${cc} · ${nLines}L/${lc}` : `${nLines}L/${lc} (${chars}c)`;
  if (cc && rel in bootReal) {
    const efectivo = BOOT_CHARS_TARGET - (bootTotalAO - bootReal[rel]);
    if (efectivo < cc) tag += ` · ⚠️ tope REAL ${efectivo}c (lo fija el BOOT, no su cap)`;
  }
  if (over) warn(`${rel}: ${tag} → SHARD/poda (excede tope)`);
  else if (nudge) say(`  ↗  ${rel}: ${tag} (leve exceso — destilar)`);
  else { ok(`${rel}: ${tag}`); okCaps++; }
  // (N16-04, auditoria #16) preShard se llenaba SOLO en la rama else: cruzar el 100% te hacia
  // DESAPARECER del resumen de saturacion mientras uno al 95% si salia — el gate escondia justo
  // los peores. Ahora entra todo nodo >=90%, marcado con su estado real.
  if (near || nudge || over) preShard.push(over ? `${rel} ‼️>110%` : nudge ? `${rel} ⚠️>100%` : rel);
}
if (BOOT && okCaps) say(`  ✅ ${okCaps}/${capCount} neuronas dentro de tope`);
if (preShard.length) info(`pre-shard: ${preShard.length} neurona(s) ≥90% de su cap (${preShard.join(', ')}) — planear shard/GC ANTES de reventar`);
if (BOOT_CHARS_TARGET) {
  // (ADR §193) Aviso estructural: si los caps de los always-on suman mas que el presupuesto,
  // esos topes son DECORATIVOS y hay que decirlo — es la premisa que hacia enganosa la linea de
  // arriba. No bloquea: no es un error, es una eleccion (dar holgura nominal a la pizarra).
  const sumaAO = ALWAYS_ON.reduce((a, rel) => a + ((CAPS[rel] && CAPS[rel].chars) || 0), 0);
  if (sumaAO > BOOT_CHARS_TARGET)
    info(`los caps de los always-on suman ${sumaAO}c sobre un presupuesto de ${BOOT_CHARS_TARGET}c → NINGUNO de esos topes es el que aprieta; manda el TOTAL. Leer "x% de su cap" como holgura es justo el error que evita el «tope REAL» de arriba.`);
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
  const extraSidecars = sidecars.reduce((a, p) => a + read(p).length, 0);
  if (sidecars.length) {
    info(`+ sidecars del heartbeat: ${extraSidecars}c no medidos por el candado (se generan, no se podan) → boot REAL ≈ ${bootChars + extraSidecars}c`);
  }

  // 🔒 2b) BOOT REAL — la contabilidad COMPLETA del arranque (v1.27.0 · dictamen F2, D6).
  // El candado de arriba mide los 3 always-on del repo, que es lo único que ESTE repo puede podar,
  // y por eso se queda intacto: es la palanca que funciona (los 533c de triple copia se podaron
  // porque mordía). Pero una sesión real arranca con tres cosas más que nadie contaba: los
  // sidecars del heartbeat, el ROUTER GLOBAL `~/.claude/CLAUDE.md` (C0) y el `MEMORY.md` que el
  // harness inyecta por proyecto. Resultado: «31485/31500 ✅» describía un arranque que pesa ~43k.
  // Un número que no miente pero tampoco CUENTA es de la familia `38-GATES-QUE-MIENTEN`, y la
  // cura no es bajar el candado viejo: es techar lo que antes ni se medía.
  const C0_PATH = join(homedir(), '.claude', 'CLAUDE.md');
  const c0Chars = existsSync(C0_PATH) ? read(C0_PATH).length : 0;
  // El slug de `~/.claude/projects/` lo DERIVA el harness de la ruta absoluta del cwd cambiando
  // todo lo no-alfanumérico por "-". Se deriva (jamás se hardcodea un repo en el kernel canónico)
  // y, si la derivación no acierta, se BUSCA en projects/ antes de rendirse; la ausencia se DICE,
  // porque un 0 silencioso sería exactamente la ficción que este bloque viene a matar.
  const PROJECTS = join(homedir(), '.claude', 'projects');
  const memOf = (slug) => join(PROJECTS, slug, 'memory', 'MEMORY.md');
  const slug = ROOT.replace(/[^A-Za-z0-9]/g, '-');
  let memPath = memOf(slug);
  if (!existsSync(memPath) && existsSync(PROJECTS)) {
    const hit = readdirSync(PROJECTS).find((d) => d.toLowerCase() === slug.toLowerCase());
    if (hit) memPath = memOf(hit);
  }
  const memChars = existsSync(memPath) ? read(memPath).length : 0;
  const COMPONENTES = {
    'los always-on del repo': bootChars, 'los sidecars del heartbeat': extraSidecars,
    'el router global C0': c0Chars, 'el MEMORY.md del harness': memChars,
  };
  const bootRealTotal = Object.values(COMPONENTES).reduce((a, b) => a + b, 0);
  const desglose = `alwaysOn ${bootChars}c + sidecars ${extraSidecars}c + C0 ${c0Chars}c + MEMORY.md ${memChars}c`;
  if (!c0Chars) info(`BOOT REAL: sin router global en ${C0_PATH} → C0 suma 0c (no es un cero medido: es un archivo ausente).`);
  if (!memChars) info(`BOOT REAL: sin MEMORY.md del harness para este repo (buscado en ${memPath}) → suma 0c.`);
  const BOOT_REAL_TARGET = manifest.bootRealTarget || null;
  if (!BOOT_REAL_TARGET)
    info(`BOOT REAL = ${bootRealTotal}c (${desglose}) — manifest SIN "bootRealTarget": este repo aún no adoptó el techo (D6), así que solo se INFORMA.`);
  else if (bootRealTotal > BOOT_REAL_TARGET) {
    const [peor, peso] = Object.entries(COMPONENTES).sort((a, b) => b[1] - a[1])[0];
    warn(`BOOT REAL = ${bootRealTotal}c > techo ${BOOT_REAL_TARGET}c (exceso ${bootRealTotal - BOOT_REAL_TARGET}c) · ${desglose}. El componente que más pesa es ${peor} (${peso}c) → poda AHÍ. "bootRealTarget" es un TECHO DE CRECIMIENTO: subirlo NO es cerrar (M-05), la meta es BAJARLO.`);
  } else say(`  ✅ BOOT REAL = ${bootRealTotal}c ≤ techo ${BOOT_REAL_TARGET}c (${desglose})`);
  // Sin banda de pre-aviso al 97%, a diferencia del candado de arriba, y a propósito: D6 fija el
  // techo sobre lo MEDIDO + 800c de holgura, así que un "vas al 97%" saltaría en la PRIMERA
  // corrida y en todas las siguientes. Un guardián que ladra desde el día uno enseña a ignorarlo
  // (la lección del canario, v1.10.1). El desglose entero ya se publica en cada corrida.
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
  const defined = new Set([...leccionesText.matchAll(/^###\s+([LM]-\d{2,})\b/gm)].map((m) => m[1]));
  const allBrain = [claude, indiceText, existsSync(estadoPath) ? read(estadoPath) : '', leccionesText, histText,
    existsSync(cortoPath) ? read(cortoPath) : '', existsSync(espacialPath) ? read(espacialPath) : ''].join('\n');
  /*
   * ⚠️ El lookbehind NO es cosmético (v1.29.0 · F2, `ENSAYO-ROLLBACK-F2.md` §4): una cita
   * CUALIFICADA `[[CARS:L-01]]` no es una ref de ESTE repo — la valida el linter del MAESTRO
   * (F2-DISEÑO §6), porque `L-01` significa cuatro cosas distintas en los cuatro repos. Con solo
   * `\b`, el límite casaba DETRÁS de los dos puntos y el gate leía `L-01` a secas. Dos fallos, y
   * el segundo es peor: con un número AJENO (`BERS:L-84`) inventaba un colgante —ruido visible—;
   * con un número que TAMBIÉN existe aquí (`CARS:L-01`) lo resolvía en silencio contra OTRA
   * lección y estampaba ✅. Ese verde no se distingue del verde correcto por su salida
   * ([[L-74]], `38-GATES-QUE-MIENTEN`).
   * `{2,}` y no `{4}`: los cuatro prefijos de `origenes.json` (INMO/CARS/BERS/INSE) miden 4, pero
   * un quinto repo con otra longitud volvería a mentir EN VERDE — que es justo lo que esto cura.
   * Y el tope se escribe ABIERTO porque MEDIDO no existe: en un lookbehind, `{2,6}` casa igual
   * contra `MAESTRO:` (le basta el sufijo `ESTRO:`), así que el único límite real es el de abajo
   * — publicar un `6` que no rechaza nada sería un número que no significa lo que parece ([[L-58]]).
   * El MISMO guarda se repite abajo en 5c: son dos parsers distintos del mismo ID, y el de 5c
   * mentía igual (una cita `[[BERS:L-05]]` acusaba a la `L-05` ⚰️ de ESTE repo).
   */
  const referenced = new Set([...allBrain.matchAll(/(?<![A-Z]{2,}:)\b([LM]-\d{2,})\b/g)].map((m) => m[1]));
  const dangling = [...referenced].filter((r) => !defined.has(r)).sort();
  if (!referenced.size) info('sin refs L-NN/M-NN aún');
  else if (!dangling.length) ok(`refs L-/M- (${referenced.size} usadas / ${defined.size} def) resuelven en 30`);
  else warn(`refs L-/M- COLGANTES: ${dangling.join(', ')}`);

  /*
   * 5b-bis) IDs REPETIDOS dentro de un MISMO fichero (bersaglio 2026-08-26: dos lecciones
   * distintas reclamaban `L-60`, y `[[L-60]]` resolvia a la primera que apareciera).
   * POR QUE no lo cazaba nadie: `defined` es un Set — colapsa el duplicado, asi que el
   * contador decia «96 definidas» donde habia 97 encabezados. La estructura elegida para
   * deduplicar es la que vuelve INVISIBLE la duplicacion. Aqui se cuenta sobre un ARRAY.
   * POR FICHERO a proposito: madre-puntero + hija-cuerpo comparten ID por DISENO (§G.5);
   * el choque real es el intra-fichero. Barre todo `docs/*.md` para cubrir a las hijas sin
   * mantener una lista a mano — la lista se DERIVA, no se enumera.
   */
  const colisiones = [];
  for (const f of readdirSync(DOCS).filter((x) => x.endsWith('.md')).sort()) {
    const ids = [...read(join(DOCS, f)).matchAll(/^###\s+([LM]-\d{2,})\b/gm)].map((m) => m[1]);
    const vistos = new Set();
    const rep = [...new Set(ids.filter((i) => (vistos.has(i) ? true : (vistos.add(i), false))))].sort();
    if (rep.length) colisiones.push(`${f} → ${rep.join(', ')}`);
  }
  if (colisiones.length) warn(`IDs L-/M- REPETIDOS en un mismo fichero (la ref resuelve al primero): ${colisiones.join(' · ')}`);
  else if (defined.size) ok(`sin IDs L-/M- repetidos dentro de un fichero`);
  // 5c) Tombstones-lite (v1.3 §50): lección ⚰️ citada desde nodos VIVOS (99 puede: es historia).
  const quarantined = new Set([...leccionesText.matchAll(/^###\s+([LM]-\d{2,})\b[^\n]*⚰️/gm)].map((m) => m[1]));
  if (quarantined.size) {
    const liveText = [claude, existsSync(estadoPath) ? read(estadoPath) : '',
      existsSync(cortoPath) ? read(cortoPath) : '', existsSync(espacialPath) ? read(espacialPath) : ''].join('\n');
    const cited = [...quarantined].filter((id) => new RegExp(`(?<![A-Z]{2,}:)\\b${id}\\b`).test(liveText)).sort();
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
  // (El 6b de v1.3 se QUITO por ruido — G-11. Este es OTRO, y con senal demostrada.)
  //
  // 6b (v1.22.0, N16-11): una skill PORTABLE vive en DOS sitios por diseno (§33) y nada comparaba
  // su CONTENIDO. `auditoria-cerebro` llego a tener TRES versiones a la vez: la cargada tenia las
  // dos lecciones nacidas de auditar (M-31 y §206), la de este repo solo una, y los tres hermanos
  // NINGUNA. Es decir, tres cerebros auditaban con el auditor al que le faltaban justo las
  // lecciones que sabe porque audita. El 6a compara NOMBRES de carpeta y no ve nada de esto.
  // Medido al cablearlo: 36 skills en ambos sitios, las 36 identicas → deuda CERO.
  const SKILLS_USUARIO = join(homedir(), '.claude', 'skills');
  if (existsSync(SKILLS_USUARIO)) {
    const derivadas = [];
    let comparadas = 0;
    for (const d of dirs) {
      const aqui = join(SKILLS_DIR, d.name, 'SKILL.md');
      const cargada = join(SKILLS_USUARIO, d.name, 'SKILL.md');
      if (!existsSync(aqui) || !existsSync(cargada)) continue;
      comparadas++;
      // Se NORMALIZA el fin de linea: CRLF vs LF es un artefacto del checkout de git
      // (autocrlf), no deriva de contenido. Sin esto el gate contaba 22 donde habia 14 —
      // medir lo que no es la pregunta ([[L-66]] regla 4), esta vez del lado del gate.
      const mismo = (p) => read(p).replace(/\r\n/g, '\n');
      if (mismo(aqui) !== mismo(cargada)) {
        derivadas.push(`${d.name} (${statSync(aqui).size}b aqui / ${statSync(cargada).size}b cargada)`);
      }
    }
    const baseDrift = Number.isInteger(manifest.skillDriftBaseline) ? manifest.skillDriftBaseline : 0;
    if (derivadas.length > baseDrift) {
      warn(`skill(s) DERIVADAS: ${derivadas.length} > deuda congelada (${baseDrift}) → ${derivadas.slice(0, 3).join(' · ')}${derivadas.length > 3 ? ' …' : ''}. Manda la de ~/.claude (§33): re-copia la nueva, no subas la linea base.`);
    } else if (derivadas.length) {
      info(`skill(s) portables derivadas: ${derivadas.length}, exactamente la deuda CONGELADA (${baseDrift}) de ${comparadas} comunes → ${derivadas.slice(0, 3).join(' · ')}${derivadas.length > 3 ? ' …' : ''}. Una NUEVA bloquea.`);
    } else if (comparadas) {
      ok(`${comparadas} skill(s) portables coinciden byte a byte con la que se carga`);
    }
  }
} else if (existsSync(SKILLS_DIR)) {
  warn('skills/ existe pero docs/skills-inventory.md NO → crear el catálogo (§G.4)');
} else head('  ℹ️  skills/ no existe — omitido');

// v1.19.0 (§143 · §221): «umbrales en DÍAS en un repo que corre en COMMITS». Un sello de hace 7 días
// puede llevar 327 commits detrás: por calendario está fresco y por trabajo real es una fósil. Se
// cuenta con el reflog leído por fs (sin child_process), igual que el canario del #24.
// ⚠️ El sello tiene granularidad de DÍA, así que se cuenta desde el FINAL del día sellado: nunca
// sobre-cuenta lo que se selló esa misma tarde. Es la dirección segura del error.
const reflogPath = join(ROOT, '.git', 'logs', 'HEAD');
const reflogTxt = existsSync(reflogPath) ? read(reflogPath) : null;
function commitsDesde(fechaISO) {
  if (!reflogTxt) return null;
  const t0 = Date.parse(`${fechaISO}T23:59:59Z`) / 1000;
  if (!Number.isFinite(t0)) return null;
  let n = 0;
  for (const l of reflogTxt.split('\n')) {
    const m = l.match(/>\s(\d{9,})\s[+-]\d{4}\t(\w+)/);
    if (m && Number(m[1]) > t0 && m[2].startsWith('commit')) n++;
  }
  return n;
}


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
  // 7c) v1.17.0 (K-05): hasta aquí el #7 valida las anclas que EXISTEN —que resuelvan, y que todo
  //     crudo esté indexado—. Lo que estructuralmente no podía ver es la que FALTA: un ADR que
  //     declara haber corrido un comité, un consejo externo o una tanda de subagentes y NO enlaza su
  //     crudo pasa en verde, porque no hay ancla que validar. Ésa es la dirección afirmación→ancla, y
  //     sin ella el reflejo de captura de §G.4 seguía siendo [HONOR] puro.
  //     El patrón se MIDIÓ antes de escribirlo: la primera versión incluía «panel de …», que en
  //     castellano casa con «el panel de gestión» y daba ~90 % de falsos positivos.
  const inventario = new Set();
  for (const f of files) { inventario.add(f); inventario.add(f.replace(/\.[^.]+$/, '')); }
  const DELIB = /comit[ée]\s*[x×]\s*\d|comit[ée] de expertos|consejo externo|\bsubagentes\b|workflow de \d+\s*agentes?/gi;
  const NEG = /\b(?:sin|nunca|no)\b[^.]{0,40}$/i;
  const secDelib = existsSync(histPath)
    ? read(histPath).split(/(?=^## \d+\. )/m).filter((x) => /^## \d+\. /.test(x)) : [];
  const huerfanas = [];
  for (const sec of secDelib) {
    const ms = [...sec.matchAll(DELIB)];
    if (!ms.length) continue;
    // «Sin comité ×3 ni consejo externo» DECLARA que no se corrió: es lo contrario de una deuda.
    if (ms.every((m) => NEG.test(sec.slice(Math.max(0, m.index - 45), m.index)))) continue;
    if (/research-archive\/|brain-private\//.test(sec)) continue;
    // un token entre backticks que EXISTA en el archiveDir también es ancla (así se citaba antes)
    if ([...sec.matchAll(/`([\w][\w.-]{6,})`/g)]
      .some((m) => inventario.has(m[1]) || inventario.has(m[1].replace(/\.[^.]+$/, '')))) continue;
    huerfanas.push('§' + sec.match(/^## (\d+)\./)[1]);
  }
  const baseDelib = manifest.delibAnchorBaseline;
  if (!secDelib.length) info('7c: sin historial de ADRs que barrer (afirmación→ancla omitido)');
  else if (!huerfanas.length) ok('deliberaciones declaradas: TODAS enlazan su crudo (afirmación→ancla)');
  else if (baseDelib === undefined)
    info(`${huerfanas.length} ADR(s) declaran deliberación EJECUTADA y no enlazan su crudo: ${huerfanas.join(' · ')} → captúralo (§G.4), o declara \`delibAnchorBaseline\` en el manifest para congelar esta deuda y bloquear las nuevas.`);
  else if (huerfanas.length > baseDelib)
    warn(`deliberación declarada SIN crudo enlazado por encima de la deuda congelada (${baseDelib}): ahora ${huerfanas.length} → ${huerfanas.join(' · ')}. Lo nuevo se CAPTURA (§G.4), no se suma al montón.`);
  else if (huerfanas.length < baseDelib)
    info(`deliberación sin crudo: ${huerfanas.length} (< ${baseDelib} congelados) → baja \`delibAnchorBaseline\` a ${huerfanas.length}: el trinquete solo sirve si se aprieta.`);
  else
    info(`deliberación sin crudo: ${huerfanas.length}, exactamente la deuda CONGELADA (${baseDelib}) → ${huerfanas.join(' · ')}. Una nueva bloquea el commit.`);
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
      // v1.12.0 (inmobiliaria §120, TODO-45b): el ✅ INMERECIDO. Este gate buscaba el hecho en los
      // nodos NO-dueños y, al no encontrarlo, aprobaba. Pero si el DUEÑO tampoco lo contiene —el
      // archivo se renombró, la cifra se reescribió, la regex quedó vieja— no hay nada que
      // duplicar y el gate vigila un hecho que ya no existe. Aprobar eso es afirmar sin comparar.
      // `ownerRegex` (opcional): hay hechos cuya forma PROHIBIDA fuera no es la forma en que el
      // dueño los guarda. El stamp del kernel tiene `"version": "1.12.0"` en JSON, mientras que lo
      // que no debe duplicarse por ahí es la PROSA «kernel v1.12.0». Sin esta distinción el gate
      // exigía al dueño una cadena que nunca iba a tener, y degradaba un fact perfectamente vivo.
      const ownerP = fact.owner ? join(ROOT, fact.owner) : null;
      const anclaje = fact.ownerRegex || fact.regex;
      if (!ownerP || !existsSync(ownerP)) {
        degrade(`ssotFacts: el dueño "${fact.owner}" NO EXISTE → "${fact.regex}" no vigila nada`);
      } else if (!new RegExp(anclaje).test(read(ownerP))) {
        degrade(`ssotFacts: el dueño "${fact.owner}" ya NO contiene ${fact.ownerRegex ? `su anclaje "${anclaje}"` : `"${fact.regex}"`} → el hecho se movió o cambió de forma; este gate compara contra el vacío`);
      }
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
  // v1.27.0 (dictamen F2 · D4): el filtro era `/^\d{2}-/` y por eso las neuronas con SUFIJO DE
  // LETRA no existían para este chequeo — `00a`…`00g`, `33a`, `38a`: 9 nodos en inmobiliaria que
  // el BFS de arriba SÍ alcanzaba (de ahí el ✅) mientras el registro no los auditaba jamás. Es
  // la firma de `38-GATES-QUE-MIENTEN`: no fallaba, es que ni miraba. Y una hija con sufijo se
  // registra en su MADRE (`NN-*.md`, §G.5 "SIEMPRE referenciadas desde su neurona madre"), no en
  // el router — misma excepción estructural que ya tenían los lóbulos hijos contra `40`.
  let unregistered = 0;
  const madreDe = (n, num) => universe.some((m) => m !== n && m.startsWith(`${num}-`) && fileText(m).includes(n));
  for (const n of universe.filter((f) => /^\d{2}[a-z]?-/.test(f))) {
    const isChildLobe = /^4[1-9][a-z]?-/.test(n);
    const sufijo = n.match(/^(\d{2})[a-z]-/);
    if (claude.includes(n)) continue;
    if (isChildLobe && lobeRegistry.includes(n)) continue;
    if (sufijo && madreDe(n, sufijo[1])) continue;
    const donde = isChildLobe ? '40-LOBULOS' : sufijo ? `su neurona MADRE ${sufijo[1]}-* (ni en CLAUDE.md §0)` : 'CLAUDE.md §0';
    warn(`neurona ${n} sin registro DIRECTO en ${donde} (§G.5)`); unregistered++;
  }
  if (!orphans.length && !unregistered) ok(`${universe.length} docs alcanzables y neuronas registradas`);
}

// (11 QUITADO v1.3: peer-hash warn no cazó 3 kernels divergentes; F1 = hash-gate BLOQUEANTE vs canónico.)

// 12) Fechas stale en 05/10 [info · corre también en --boot]
{
  const staleDays = manifest.staleDays || 10;
  const today = new Date();
  let oldest = null, oldestWhere = '', oldestSeal = '';
  const NODOS_FECHA = ['docs/05-ESTADO-GLOBAL.md', 'docs/10-MEMORIA-CORTO-PLAZO.md'];
  const sinFecha = [];
  for (const rel of NODOS_FECHA) {
    const p = join(ROOT, rel);
    if (!existsSync(p)) continue;
    const m = read(p).match(/(?:última actualización[:* ]*|\(al |actualizado )\**(\d{4}-\d{2}-\d{2})/i);
    if (m) { const d = new Date(m[1]); if (!oldest || d < oldest) { oldest = d; oldestWhere = rel; oldestSeal = m[0].trim(); } }
    else sinFecha.push(rel);
  }
  if (oldest) {
    const days = Math.floor((today - oldest) / 86400000);
    const csFecha = commitsDesde(oldest.toISOString().slice(0, 10));
    if (days > staleDays || (csFecha !== null && csFecha > (manifest.staleCommits || 120)))
      info(`frescura: ${oldestWhere} sellado hace ${days} día(s)${csFecha !== null ? ` y ${csFecha} commit(s)` : ''} (umbral ${staleDays}d / ${manifest.staleCommits || 120} commits) → re-verificar vs git real y re-sellar «${oldestSeal}» — ESE sello, el del NODO. Los «verificado-vivo:» de dentro son OTRA cosa (los mide el #16) y actualizarlos NO apaga este aviso: pasó de verdad (§272).`);
  }
  // v1.16.0 (K-01+K-04, §208.3): el gate tomaba la fecha MÁS VIEJA de los nodos que la tuvieran, y
  // al que no aportaba ninguna lo saltaba EN SILENCIO. Justo el `10` —la pizarra del WIP, el nodo
  // que más rápido caduca— no usa ninguno de los formatos, así que llevaba un año fuera del gate
  // sin que nada lo dijera. El arreglo NO es teclearle una fecha (eso sería jugar con el gate, que
  // es lo que K-04 denunciaba): es que la COBERTURA se publique, para que un nodo cayéndose en
  // silencio se VEA. M-27 mecanizada.
  if (sinFecha.length)
    info(`frescura — COBERTURA: ${NODOS_FECHA.length - sinFecha.length}/${NODOS_FECHA.length} nodo(s) always-on aportan fecha legible; NO la aportan → ${sinFecha.join(" · ")}. El «sellado hace N días» de arriba NO los cubre. Formatos que lee: «última actualización: YYYY-MM-DD» · «(al YYYY-MM-DD» · «actualizado YYYY-MM-DD».`);
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
  const sinMarcador = [];
  for (const rel of vlScan) {
    const p = join(ROOT, rel);
    if (!existsSync(p)) continue;
    if (!/verificado-vivo:/i.test(read(p))) sinMarcador.push(rel);
    for (const m of read(p).matchAll(/verificado-vivo:\s*(\d{4}-\d{2}-\d{2})/gi)) {
      total++;
      const days = Math.floor((today - new Date(m[1])) / 86400000);
      const cs = commitsDesde(m[1]);
      const vlStaleCommits = manifest.verifiedLiveStaleCommits || 100;
      if (days > vlStaleDays || (cs !== null && cs > vlStaleCommits)) {
        info(`claim "verificado-vivo: ${m[1]}" en ${rel}: ${days}d${cs !== null ? ` y ${cs} commit(s)` : ''} (umbral ${vlStaleDays}d / ${vlStaleCommits} commits) → re-verificar contra realidad o retirar la afirmación (M-22)`);
        stale++;
      }
    }
  }
  if (total && !stale) ok(`${total} claim(s) \`verificado-vivo\` vigentes (≤ ${vlStaleDays}d)`);
  // v1.16.0 (K-01, §208.2): el otro lado del mismo hueco. Un nodo con CERO marcadores no producía
  // hallazgos, así que el gate pasaba en verde sin haberlo mirado nunca. No se EXIGE marcador —no
  // todo nodo afirma sobre realidad externa—, pero la cobertura se PUBLICA: es lo que distingue
  // «no tiene claims que verificar» de «se cayó del gate y nadie lo vio».
  if (total && sinMarcador.length)
    info(`fiabilidad — COBERTURA: ${vlScan.length - sinMarcador.length}/${vlScan.length} nodo(s) escaneados llevan algún «verificado-vivo»; CERO en → ${sinMarcador.join(" · ")} (a esos este gate no los compara con nada).`);
  // v1.12.0 (§120): sin marcadores este gate imprimía «check activo» — un ✅ por CERO comparaciones.
  // Y encima mide solo la EDAD del marcador, nunca el hecho: por eso el 05 pudo sostener «CF 9»
  // contra 11 exports reales con el claim fresquísimo. Que no verificó nada tiene que verse.
  else if (!total) degrade('fiabilidad: 0 marcadores `verificado-vivo:` en los nodos escaneados → este gate NO comparó nada. Marca los claims sobre realidad externa (desplegado/live/datos) o retíralos.');
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
    // v1.16.0 (§216.9): la premisa «hubo commits ⇒ alguien trabajó AQUÍ en sesión» la rompió una
    // práctica adoptada DESPUÉS de escribir el gate: la distribución del kernel compartido, que
    // commitea en un repo hermano desde la sesión de OTRO. En un repo congelado eso deja al canario
    // gritando para siempre y bloqueando cada commit. No se apaga (BOOT_CANARY_SKIP es ceguera
    // permanente): se MIDE. El reflog lleva el mensaje de cada entrada, así que se puede preguntar
    // si TODO lo posterior al marker fue distribución de kernel — y entonces no es trabajo aquí.
    // El predicado NO se adivinó: se MIDIÓ sobre los cuatro repos hermanos. Esos commits usan tres
    // prefijos distintos —`chore(kernel)`, `chore(cerebro)`, `docs(cerebro)`— y lo ÚNICO que los 15
    // comparten es la palabra «kernel» en el mensaje. La primera versión de este gate casó solo con
    // `chore(kernel)` (una convención recordada de memoria) y dejó fuera al repo que más lo
    // necesitaba. La guarda `length > 0` importa: `[].every()` es true y convertiría «sin actividad»
    // en «solo kernel».
    const marcaMs = existsSync(markerP) ? statSync(markerP).mtimeMs : 0;
    const posteriores = (existsSync(reflog) ? read(reflog).split('\n') : [])
      .filter((l) => { const t = l.match(/>\s(\d{9,})\s[+-]\d{4}\t/); return t && Number(t[1]) * 1000 > marcaMs; });
    const soloKernel = posteriores.length > 0 && posteriores.every((l) => /\bkernel\b/i.test(l));
    const trabajandoAqui = actividadH < ageH && !soloKernel;   // git posterior al arranque Y no es distribución
    // Umbral CRÓNICO (168h), no agudo: un repo hermano se mantiene a ráfagas desde la sesión de
    // OTRO —ahí el pre-commit sí corre; lo que no dispara es el SessionStart, que no existe— y con
    // 48h eso gritaba en cada mantenimiento cruzado. Una semana de actividad sin un solo arranque
    // ya no es un patrón de trabajo: es el contrato roto.
    if (ageH > 168 && trabajandoAqui && !process.env.BOOT_CANARY_SKIP)
      warn(`una SEMANA de actividad git (última hace ${Math.round(actividadH)}h) sin que ningún SessionStart escriba docs/.boot-marker (${ageH === Infinity ? 'NUNCA' : Math.round(ageH) + 'h'}) — los hooks del harness NO disparan aquí. Verifica .claude/settings.json (o: node scripts/session-handoff.mjs --boot-echo). Intencional → BOOT_CANARY_SKIP=1.`);
    else if (ageH > 48)
      info(`canario en reposo: marker de hace ${ageH === Infinity ? "nunca" : Math.round(ageH) + "h"}${soloKernel ? ` — las ${posteriores.length} entrada(s) de git posteriores son SOLO distribución de kernel (no es trabajo en este repo, §216.9)` : trabajandoAqui ? " (mantenido desde otra sesión: el pre-commit sí corre)" : " y sin actividad git posterior"}`);
    else ok(`canario vivo (marker de hace ${Math.round(ageH)}h)`);
  }
}

// 30) 🚩 El TOKEN de consolidación: ¿la orden se CUMPLE, o solo se dispara? (v1.28.0 · §291) [--full]
//     La medición D8a dejó claro que «el hook disparó» es la métrica del gate que miente: PreCompact
//     llevaba 44 días emitiendo un JSON que el harness rechazaba en la raíz — 0/15 entregas, y 13 de
//     los 15 fallos sin UNA sola línea visible. Lo que se mide aquí no es el disparo sino la VIDA del
//     pendiente que dejó: el flag nace en PreCompact, se convierte en orden en el SessionStart y solo
//     lo mata un commit a docs/10 o docs/99 (pre-commit).
//     INFORMA y NO bloquea, a propósito: un flag viejo no es un defecto del repo que alguien pueda
//     arreglar editando un fichero — es la evidencia de que la orden se ignoró, y cortarle el commit
//     a quien por fin viene a consolidar sería castigar justo el comportamiento que se quiere.
head('\n30) Token de consolidación pendiente (¿se cumple la orden del PreCompact?):');
if (BOOT) head('  ⏭️  omitido en --boot (el propio SessionStart ya inyecta la orden, si la hay)');
else {
  const flagP = join(DOCS, '.consolidacion-pendiente');
  if (!existsSync(flagP)) ok('sin consolidación pendiente (nadie compactó sin consolidar)');
  else {
    const txt = read(flagP);
    const ts = (txt.match(/^ts=(.+)$/m) || [])[1];
    const hd = (txt.match(/^head=(.+)$/m) || [])[1] || '?';
    const ageH = ts && !isNaN(new Date(ts)) ? (Date.now() - new Date(ts)) / 3.6e6
                                            : (Date.now() - statSync(flagP).mtimeMs) / 3.6e6;
    if (ageH > 24) info(`⚠️ consolidación PENDIENTE desde hace ${Math.round(ageH)}h (corte en ${hd}): la orden del SessionStart lleva más de un DÍA sin cumplirse. Pon al día docs/10 y consolida a docs/99 — el flag muere solo al commitearlos. No bloquea a propósito: su VIDA es la métrica (§291).`);
    else info(`consolidación pendiente de hace ${ageH.toFixed(1)}h (corte en ${hd}) — se cierra commiteando docs/10 o docs/99.`);
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
  // v1.12.0 (§120, TODO-45c): era `info` puro, así que la regla «≤200c» llevaba 52 filas
  // incumpliéndose sin que nada pasara — una intención con impresora. Ahora es un TRINQUETE: la
  // deuda vieja se congela en un número declarado y una fila gorda NUEVA lo supera y BLOQUEA.
  // El número solo puede BAJAR; subirlo para dejar de ver el aviso es exactamente [[M-05]].
  const baseline = manifest.indexRowOverLimitBaseline;
  if (!gordas.length) ok(`filas §NN del índice dentro de ${LIMITE}c (+holgura)`);
  else {
    gordas.sort((a, b) => b.c - a.c);
    const top = gordas.slice(0, 5).map((g) => `§${g.s} (${g.c}c)`).join(' · ');
    const detalle = `${gordas.length} fila(s) §NN por encima de ${RUIDO}c (objetivo ${LIMITE}c): ${top}${gordas.length > 5 ? ' …' : ''}`;
    if (typeof baseline !== 'number') {
      info(`${detalle} → el detalle va al ADR; la fila enruta. (Declara \`indexRowOverLimitBaseline\` en el manifest para congelar esta deuda y bloquear las nuevas.)`);
    } else if (gordas.length > baseline) {
      warn(`${detalle} → son ${gordas.length - baseline} MÁS que la deuda congelada (${baseline}). Acorta la fila nueva: el detalle va al ADR, la fila enruta.`);
    } else {
      if (gordas.length < baseline) info(`${detalle} → por DEBAJO de la deuda congelada (${baseline}): baja \`indexRowOverLimitBaseline\` a ${gordas.length} para que el trinquete no se afloje.`);
      else info(`${detalle} → deuda congelada en ${baseline}; una fila gorda nueva bloquea.`);
    }
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
  // v1.18.0 (§143): el walk guardaba solo NOMBRES, y por eso la única alternativa a la ruta exacta
  // era perdonar por basename. Guardando la ruta relativa se puede resolver por SUFIJO, que es lo
  // que de verdad hace el cerebro al citar («`src/lib/x.ts`» desde el mapa del portal = `portal/src/lib/x.ts`).
  const todasRutas = [];
  const porNombre = new Map();
  let visitados = 0;
  (function walk(d) {
    if (visitados > 20000) return;                       // cota dura: el linter no se cuelga por un repo enorme
    let ents = []; try { ents = readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      if (SKIP_DIR.has(e.name) || e.name.startsWith('.')) continue;
      visitados++;
      if (e.isDirectory()) { walk(join(d, e.name)); continue; }
      const rel = join(d, e.name).slice(ROOT.length + 1).replace(/\\/g, "/");
      todasRutas.push(rel);
      if (!porNombre.has(e.name)) porNombre.set(e.name, []);
      porNombre.get(e.name).push(rel);
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
  let comparadas = 0, exactas = 0, porSufijo = 0, porBase = 0;
  const ambiguas = [];
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
        // v1.18.0: `/invertir.html` con barra inicial es una URL del sitio, no un fichero del repo.
        // Sin esta línea el gate acusaba a un nodo de config por citar correctamente una ruta web.
        if (ruta.startsWith('/')) continue;
        if (PLANTILLA.test(ruta)) continue;                               // ruta-plantilla, no ruta real
        comparadas++;
        if (existsSync(join(ROOT, ruta))) { exactas++; continue; }
        // v1.18.0 (§143 · §221): antes había UNA sola alternativa —«existe un fichero que se llama
        // así en alguna parte»— y el gate la contaba en bloque avisando de que «la ruta puede estar
        // mal». Al medirlo sobre los cuatro repos, 119 de 123 de esas «perdonadas» resolvían por
        // SUFIJO ÚNICO: abreviaturas legítimas y sin ambigüedad. El contador alarmaba sin informar.
        // Ahora la resolución tiene grados, y solo se nombra lo que un lector NO podría resolver.
        const porSuf = todasRutas.filter((t) => t.endsWith('/' + ruta));
        if (porSuf.length === 1) { porSufijo++; continue; }
        if (porSuf.length > 1) { ambiguas.push(`${f}:${i + 1} \`${ruta}\` → ${porSuf.length} candidatos (${porSuf.slice(0, 2).join(', ')}…)`); continue; }
        const mismos = porNombre.get(ruta.split('/').pop()) || [];
        if (mismos.length === 1) { porBase++; continue; }
        if (mismos.length > 1) { ambiguas.push(`${f}:${i + 1} \`${ruta}\` → ${mismos.length} ficheros con ese nombre (${mismos.slice(0, 2).join(', ')}…)`); continue; }
        fantasmas.push(`${f}:${i + 1} → \`${ruta}\``);
      }
    });
  }
  if (!comparadas) degrade('rutas fantasma: 0 rutas citadas en el ámbito (05/10/20/21/22/50) → este gate NO comparó nada');
  else if (!fantasmas.length) {
    ok(`ninguna de las ${comparadas} ruta(s) citadas es fantasma (${exactas} exacta(s) · ${porSufijo} por sufijo ÚNICO · ${porBase} por nombre único)`);
    if (ambiguas.length) info(`${ambiguas.length} cita(s) AMBIGUAS: el fichero existe, pero hay más de un candidato y el lector no puede saber cuál — ${ambiguas.slice(0, 4).join(" · ")}${ambiguas.length > 4 ? " …" : ""} → añade la carpeta que las distingue`);
  } else { warn(`${fantasmas.length} ruta(s) FANTASMA citadas por neuronas (el archivo no existe en el repo): ${fantasmas.slice(0, 6).join(' · ')}${fantasmas.length > 6 ? ' …' : ''} → corregir el nodo o marcar la ruta como retirada`); }
}

// 29) Cifras VERIFICABLES: lo que el cerebro AFIRMA vs lo que hay [--full] (v1.13.0, §121)
//     El #16 vigila la EDAD de un claim; nunca el claim. Por eso el `05` de inmobiliaria sostuvo
//     «CF 9 en código» contra 11 exports reales con el marcador fresquísimo: fresco y falso a la vez.
//     Este gate cierra ese hueco para las afirmaciones CONTABLES — las que se pueden resolver
//     contando algo en el repo. No es genérico por diseño: cada cifra se declara, y declararla es
//     aceptar que alguien la va a comprobar. Una cifra sin declarar sigue siendo palabra de nadie.
head('\n29) Cifras verificables del cerebro (¿lo que afirma es lo que hay?):');
if (BOOT) head('  ⏭️  omitido en --boot');
else if (!Array.isArray(manifest.countableFacts) || !manifest.countableFacts.length) {
  info('manifest sin countableFacts — gate omitido (declarar las cifras que el cerebro afirma)');
} else {
  for (const f of manifest.countableFacts) {
    const fp = join(ROOT, f.countFile || '');
    if (!f.countFile || !existsSync(fp)) { degrade(`cifra "${f.id}": el archivo a contar (${f.countFile}) no existe → nada que comparar`); continue; }
    const src = read(fp);
    // Los nombres pueden venir sueltos (`export const X`) o en lista (`export { a, b } from`).
    const nombres = new Set();
    for (const pat of f.countPatterns || []) {
      for (const m of src.matchAll(new RegExp(pat, 'gm'))) {
        for (const n of String(m[1] || '').split(',')) { const t = n.trim(); if (t) nombres.add(t); }
      }
    }
    const real = nombres.size;
    let visto = 0, malos = [];
    for (const rel of f.claimScan || []) {
      const p = join(ROOT, rel);
      if (!existsSync(p)) continue;
      for (const m of read(p).matchAll(new RegExp(f.claimRegex, 'g'))) {
        visto++;
        if (Number(m[1]) !== real) malos.push(`${rel} dice ${m[1]}`);
      }
    }
    if (!visto) degrade(`cifra "${f.id}": el cerebro NO afirma nada que comparar (hay ${real} ${f.label}). Escríbelo donde toque o retira la cifra del manifest.`);
    else if (malos.length) warn(`cifra "${f.id}": ${malos.join(' · ')} pero hay ${real} ${f.label} → corregir el nodo (contadas en ${f.countFile})`);
    else ok(`${real} ${f.label} == lo que afirma el cerebro`);
  }
}

// ---- salida (presupuesto de stdout en --boot) ----
// 28) Trabajo PENDIENTE fuera de `docs/` que NADIE cita (anti-fuga) [--full]
//     Nace de un fallo REAL (inmobiliaria, 2026-08-20): el MEGA-PLAN del portal —el documento que
//     define TODO el trabajo del proyecto: 4 olas, 13 superficies y los gates del dueño— vive en
//     `specs/` y NINGÚN nodo del cerebro lo citaba. El operador arrancó en frío, leyó CLAUDE.md +
//     05 + 10 como manda §G.1, y se dispuso a improvisar un plan que YA EXISTÍA. El gate #10 no lo
//     caza porque su universo es solo `docs/`. Mandato del dueño: «debe haber una forma de verificar
//     todo lo pendiente, porque si al operador se le olvida queda en el olvido».
//     Un plan que nadie cita no está guardado: está perdido con copia de seguridad.
head('\n28) Planes/specs alcanzables desde el cerebro (anti-fuga):');
if (BOOT) head('  ⏭️  omitido en --boot');
else {
  const workDirs = manifest.workDirs || ['specs'];
  const allowW = new Set(manifest.workAllowlist || []);
  let brainText = claude;
  for (const f of readdirSync(DOCS).filter((f) => f.endsWith('.md'))) brainText += read(join(DOCS, f));
  const sueltos = []; let total = 0;
  for (const d of workDirs) {
    const p = join(ROOT, d);
    if (!existsSync(p)) continue;
    let ents = []; try { ents = readdirSync(p).filter((f) => f.endsWith('.md')); } catch { continue; }
    for (const f of ents) {
      total++;
      if (allowW.has(`${d}/${f}`)) continue;
      if (!brainText.includes(f)) sueltos.push(`${d}/${f}`);
    }
  }
  if (sueltos.length)
    warn(`${sueltos.length} documento(s) de trabajo que NINGÚN nodo cita → INVISIBLES al arrancar en frío: ${sueltos.slice(0, 6).join(' · ')}${sueltos.length > 6 ? ' …' : ''} → cítalos desde su nodo dueño, o decláralos en manifest.workAllowlist CON razón`);
  else if (total) ok(`${total} documento(s) de trabajo citados desde el cerebro`);
  else head('  ℹ️  sin directorios de trabajo declarados (manifest.workDirs)');
}

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
