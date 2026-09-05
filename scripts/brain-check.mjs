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
//       v1.31.0 (C4-2 · D-C4-5): el schema (#15) conoce `skillFiles` — la lista explícita de skills
//       gobernadas que `brain:pull` reparte desde el canon de la bóveda. Sin esta línea, los cuatro
//       repos avisarían «clave desconocida» en cada commit, que es como se apaga un gate por hartazgo.
//       v1.32.0 (C4-3/§7): (24) el canario deja de INFERIR el arranque de los commits y MIDE el
//       CABLEADO del SessionStart (settings.json + core.hooksPath + pre-commit que llama a
//       brain-check); `BOOT_CANARY_SKIP` retirado. Y `pull.mjs` —que viaja junto al canónico, no
//       dentro de los repos— reparte skills con exit 1 si dejó alguna sin repartir (D-C4-8) y
//       rechaza en ROJO un `manifest.repo` que no sea una punta conocida (D-C4-12).
//       v1.33.0 (FALENCIAS DEL MODELO · pieza B): (31) inventario de EJECUTOR — cada viñeta
//       imperativa del router declara su gate o `[HONOR]`, y la cifra «sin declarar» se PUBLICA
//       con trinquete (`ejecutorBaseline`); INFORMATIVO en esta versión, a la espera de ver la
//       cifra en los 4 repos (B4 · F-13). (16) amplía vocabulario: «verificado/medido/probado/
//       corrido/tests verdes/✅» en `05`, `10` y el ÚLTIMO ADR exigen ANCLA resoluble en su
//       párrafo — y se dice lo que mide: PRESENCIA DE ANCLA, NO EL ACTO (B5 · F-01/F-08).
//       (24) el marcador gana TOKEN: `--boot-echo` deriva `BOOT-OK <sha7>` del eco que imprime y
//       lo escribe; aquí se RE-DERIVA del sidecar y se COMPARA, en vez de creerle a la fecha
//       (B6 · F-10). Y el schema (#15) conoce `egressAllowlist` (hosts a los que el guard
//       `PreToolUse` deja escribir · B2) y `ejecutorBaseline`.
// ===========================================================
const KERNEL_VERSION = '1.34.3';
import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
// ⚠️ v1.34.0 (R-03) LEVANTA la vieja regla «sin child_process», y dice por qué. El eje de COMMITS
// del #12 le preguntaba al REFLOG (`.git/logs/HEAD`), que es un fichero LOCAL: se poda, no viaja en
// un clone y no apunta como `commit` lo que entra por pull/merge/reset. Medido en INMO el
// 2026-09-04: el reflog daba 52 commits desde el sello donde `git rev-list` ve 386 en 10 días — el
// instrumento veía el 13 % de lo que había pasado. Portabilidad NUNCA fue «no llamar a git»: era
// «no depender de que git conteste». Toda llamada va por `gitOut()`, en try/catch, y si git no
// responde el gate lo DICE (degrade) en vez de devolver un número inventado. El fichero sigue
// siendo byte-idéntico ×repos y sigue sin escribir nada.
import { execFileSync } from 'child_process';
import { homedir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');
let problems = 0;
const BOOT = process.argv.includes('--boot');
// v1.34.0 (R-04): `--pre-commit` NO cambia NI UN chequeo. Declara que este veredicto va a decidir si
// un commit entra, y por eso «árbol en movimiento» degrada aquí a ROJO en vez de limitarse a avisar.
// `GIT_INDEX_FILE` lo pone git en TODO hook: es el respaldo para los repos cuyo `githooks/pre-commit`
// todavía no pasa el flag (el reparto de v1.34.0 lo añade). Dos señales, ninguna adivinada.
const PRECOMMIT = process.argv.includes('--pre-commit') || !!process.env.GIT_INDEX_FILE;
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
/*
 * ── 🌀 ÁRBOL EN MOVIMIENTO (v1.34.0 · R-04) ────────────────────────────────────────────────────
 * Por qué existe, con reloj: el 2026-09-03 el MISMO comando sobre el MISMO repo dio **❌ 6
 * bloqueantes a las 17:23:35Z y ✅ 15 verdes a las 17:46:51Z** — 23 minutos, cero ediciones del
 * lector. Otra sesión estaba reescribiendo el árbol mientras el linter lo leía
 * (`scripts/skills-canon.mjs` reescrito a las 17:42:38). El daño NO es el rojo: es que un LECTOR
 * —una auditoría, el vigía, otro agente— publique como avería del sistema lo que era otro escritor,
 * y ese informe ENTRE AL CEREBRO como conocimiento. Búsqueda previa de mecanismo:
 * `grep -rn '\.lock|flock|single-writer'` sobre `scripts/` y `githooks/` → 2 aciertos, ambos
 * COMENTARIOS; **0 cerrojos**.
 * Cómo: `read()` apunta el mtime de CADA fichero en el instante en que lo lee —es el único lector
 * de contenido del linter (§259), así que la cobertura es total sin listar nada a mano— y al final
 * se re-comprueban todos; en paralelo se compara el `git status --porcelain` de antes y después.
 * No bloquea a nadie mientras corre ni escribe un cerrojo: sólo se NIEGA A FIRMAR un veredicto
 * sobre un disco que se movió. Con `--pre-commit` eso es ROJO, porque ese veredicto decide si
 * entra un commit y un veredicto no fiable no puede dejar pasar nada.
 */
const vistos = new Map();                       // ruta → mtimeMs en el instante en que se leyó
const mtimeDe = (p) => { try { return statSync(p).mtimeMs; } catch { return null; } };
const read = (p) => { if (!vistos.has(p)) vistos.set(p, mtimeDe(p)); return readFileSync(p, 'utf-8').replace(/\r\n/g, '\n'); };
// Único punto por el que este linter le habla a git (v1.34.0 · R-03/R-04). Falla ABIERTO y lo DICE:
// si git no contesta devuelve null, y quien llama degrada en vez de inventarse un número.
let GIT_MUDO = null;                            // primer motivo por el que git no contestó, si pasó
const gitOut = (args) => {
  try {
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }).trim();
  } catch (e) {
    if (!GIT_MUDO) GIT_MUDO = (e && e.message ? String(e.message).split('\n')[0] : 'git no respondió');
    return null;
  }
};
const STATUS_INI = gitOut(['status', '--porcelain']);   // foto del árbol ANTES de mirar nada

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
  // v1.34.0 (#26 · R-02): la MITAD SEMÁNTICA del mismo trinquete — las filas de tabla del índice
  // que NO empiezan por `| §NN`, que son justamente la capa «síntoma → neurona» con la que se
  // enruta a un agente frío. Se congela APARTE del `§NN` a propósito: son dos poblaciones con
  // dueños distintos (una crece con cada ADR, la otra con cada síntoma aprendido) y mezclarlas
  // dejaría que una financiara la deuda de la otra. Medido en la cartera el 2026-09-04: 153 filas
  // semánticas, de las que 2 pasan del RUIDO — INMO 1 · CARS 1 · BERS 0 · INSE 0.
  // ⚠️ Si NO se declara, esta mitad CUENTA e IMPRIME pero solo AVISA (info): así ningún repo nace
  // en rojo el día del reparto. Declararla es lo que la convierte en trinquete.
  'indexSemanticRowOverLimitBaseline',
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
  // v1.34.0 (#12 · R-03): QUÉ nodos vigila el gate de frescura. Estaba HARDCODEADO como dos rutas
  // literales dentro del kernel: la lista de lo que caduca en ESTE cerebro era una constante del
  // código COMPARTIDO. Con la clave, un repo suma el nodo que se le pudre rápido sin forkear el
  // kernel; sin ella rige el par de siempre (`docs/05` + `docs/10`) y el gate lo DICE.
  'staleNodes',
  'countableFacts',
  // v1.27.0 (dictamen F2 · D6): TECHO del arranque REAL (always-on + sidecars + C0 + MEMORY.md).
  // NO sustituye a `bootCharsTarget` —ese sigue siendo la palanca de poda de lo que el repo
  // controla— sino que techa lo que antes ni se CONTABA. Opcional a propósito: sin la clave el
  // gate #2 solo informa, para no romperle el commit a los hermanos que aún no la han adoptado.
  'bootRealTarget',
  // v1.31.0 (C4-2 · D-C4-5): lista EXPLÍCITA de las skills gobernadas que este repo consume, igual
  // que `kernelFiles` con el kernel. La reparte `brain:pull` desde el canon de la bóveda
  // (`brain-private/skills/`). Es explícita a propósito: así una skill AUSENTE aquí es una decisión
  // declarada y no un olvido — que es justo lo que C4-1 midió (kit 5 · inmo 8 · cars 14 · bers 13 ·
  // inse 16 ausencias, ninguna de ellas decidida por nadie).
  'skillFiles',
  // v1.33.0 (B2 · F-14): hosts a los que el hook `PreToolUse` (`scripts/guard-destructivo.mjs`)
  // deja ESCRIBIR por red sin preguntar. Sin la clave, el guard usa su lista por defecto; con
  // ella, cada repo declara sus destinos legítimos y el resto se para. Nombrarla aquí es lo que
  // impide que un `egressAllowList` mal escrito apague el filtro en silencio.
  'egressAllowlist',
  // v1.33.0 (B4 · F-13): línea base CONGELADA de viñetas imperativas del router SIN ejecutor
  // declarado (ni `#NN`/`brain:check`/`pre-commit`/`verify-`/`gate`, ni `[HONOR]`). Trinquete
  // igual que #26 y #7c: solo puede BAJAR. Informativo en esta versión — bloquear es una decisión
  // que se toma con la cifra de los 4 repos delante, no antes de tenerla.
  'ejecutorBaseline',
  // v1.33.0 (B5 · F-01/F-08): línea base CONGELADA de afirmaciones de verificación SIN ancla
  // resoluble en su párrafo (`05`, `10` y el ÚLTIMO ADR de `99`). Mismo trinquete. Y la mitad que
  // NO cubre se imprime en cada corrida: mide PRESENCIA DE ANCLA, no el acto de verificar.
  'anclaBaseline',
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
// puede llevar 327 commits detrás: por calendario está fresco y por trabajo real es una fósil.
// ⚠️ El sello tiene granularidad de DÍA, así que se cuenta desde el FINAL del día sellado: nunca
// sobre-cuenta lo que se selló esa misma tarde. Es la dirección segura del error.
//
// v1.34.0 (R-03) — SE CAMBIA LA FUENTE, no la semántica. Hasta hoy esto contaba líneas del REFLOG
// (`.git/logs/HEAD`). El reflog es un diario LOCAL de hacia dónde se movió HEAD en ESTE clon: se
// poda solo (`gc.reflogExpire`, 90 días), no viaja en un `git clone` —un cerebro recién clonado
// contaba CERO— y no marca como `commit` lo que llega por `pull`, `merge` o `reset`. Medido en INMO
// el 2026-09-04: desde el sello del `05`, el reflog contaba **52** donde `git rev-list` ve **386**
// en 10 días. El gate no estaba midiendo el trabajo del repo: medía el trayecto de un clon.
// Ahora se resuelve el sello a un SHA (`rev-list -1 --before`) y se cuenta `<sha>..HEAD`, que es la
// historia real y la misma en cualquier clon. Si git no contesta, devuelve null y quien llama lo
// DICE — un eje que no pudo mirar no puede salir en verde.
const cacheCommitsDesde = new Map();          // el #16 llama una vez por marcador: se cachea por fecha
function commitsDesde(fechaISO) {
  if (cacheCommitsDesde.has(fechaISO)) return cacheCommitsDesde.get(fechaISO);
  let n = null;
  if (Number.isFinite(Date.parse(`${fechaISO}T23:59:59Z`))) {
    // El commit MÁS RECIENTE que ya existía al cerrar el día sellado. '' = no había ninguno todavía.
    const sha = gitOut(['rev-list', '-1', `--before=${fechaISO}T23:59:59Z`, 'HEAD']);
    if (sha !== null) {
      const c = sha === '' ? gitOut(['rev-list', '--count', 'HEAD']) : gitOut(['rev-list', '--count', `${sha}..HEAD`]);
      if (c !== null && /^\d+$/.test(c)) n = Number(c);
    }
  }
  cacheCommitsDesde.set(fechaISO, n);
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
  // v1.34.3: si no hay `.git` en ninguno de los 4 niveles, el 7b degradaba en SILENCIO (K5 lo midio); ahora lo dice.
  if (!existsSync(join(vaultGit, '.git'))) info('bóveda: no se encontró `.git` subiendo 4 niveles desde archiveDir → el cotejo local↔origin NO corrió');
  if (existsSync(join(vaultGit, '.git'))) {
    const refSha = (name) => {
      const direct = join(vaultGit, '.git', name);
      if (existsSync(direct)) return read(direct).trim().slice(0, 40);
      const packed = join(vaultGit, '.git', 'packed-refs');
      if (existsSync(packed)) { const l = read(packed).split('\n').find((x) => x.endsWith(' ' + name)); if (l) return l.slice(0, 40); }
      return null;
    };
    // v1.34.2 (N2b · insema): el `if` de arriba solo prueba que existe `.git`, y de ahí se leía
    // `HEAD` a pelo. Una bóveda ESPEJO con `.git/` vacío (el sandbox de reparto que se usa para
    // estrenar el kernel sin tocar el clon real) mata el linter entero con ENOENT antes de dar
    // veredicto. Un linter NUNCA muere por un fichero ausente: falla ABIERTO y lo dice. Sin `HEAD`
    // no hay `headRef` y el gate degrada por el mismo camino que ya recorre cuando la ref no
    // resuelve (`local`/`remote` a null → ni ✅ ni ⚠️, silencio); se añade la línea que lo NOMBRA
    // para que el silencio no se confunda con «respaldo al día».
    const headP = join(vaultGit, '.git', 'HEAD');
    if (!existsSync(headP)) info('bóveda: `.git` existe pero SIN HEAD (repo vacío o espejo de prueba) → el cotejo local↔origin NO corrió');
    const headRef = existsSync(headP) ? (read(headP).match(/ref:\s*(\S+)/) || [])[1] : undefined;
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

// 12) Fechas stale en los nodos que caducan [info · corre también en --boot]
//     v1.34.0 (R-03) — RE-ARMADO, sin renumerar nada. Tenía dos ejes y ninguno podía disparar:
//     (a) la LISTA de nodos vigilados era una constante literal del kernel (`docs/05` y `docs/10`),
//         o sea que «qué caduca aquí» lo decidía el código compartido y no cada cerebro. Ahora sale
//         al manifest (`staleNodes`), con el par de siempre como fallback: nadie pierde cobertura.
//     (b) el eje de COMMITS venía del REFLOG, que es local (ver `commitsDesde` arriba: 52 contra
//         386 medidos en INMO), y su umbral implícito era 120 — inalcanzable antes que el eje de
//         días en 3 de los 4 repos. Ritmos reales medidos con `git rev-list` el 2026-09-04, en la
//         ventana de `staleDays`=10: INMO 386 commits (38,6/día) · CARS 51 (5,1) · BERS 41 (4,1) ·
//         INSE 32 (3,2). Con 120 el eje llegaba el día ~3,1 / ~23,5 / ~29,3 / ~37,5: sólo INMO lo
//         alcanzaba. Con **30** llega el día ~0,8 / ~5,9 / ~7,3 / ~9,4 — antes del día 10 en LOS
//         CUATRO. Ese es el default nuevo, y es una cifra medida, no un número redondo bonito.
//     (c) el bloque no tenía `head()`: no se podía citar ni ver dónde empieza. Ahora lo tiene.
//     ⚠️ Sigue siendo `info`: no bloquea. Lo que cambia es que ya no puede quedarse MUDO por
//        construcción, y que el silencio del manifest se DECLARA (degrade) en vez de asumirse.
head('\n12) Frescura de los nodos que caducan (sello vs días Y commits reales):');
{
  const staleDays = manifest.staleDays || 10;
  // El default de 30 no es un tope estético: es la cifra que los cuatro ritmos medidos alcanzan
  // ANTES que `staleDays`. Un umbral que el repo no puede alcanzar es un eje decorativo [[M-05]].
  const STALE_COMMITS_DEFAULT = 30;
  const staleCommits = typeof manifest.staleCommits === 'number' ? manifest.staleCommits : STALE_COMMITS_DEFAULT;
  const today = new Date();
  let oldest = null, oldestWhere = '', oldestSeal = '';
  // v1.34.0 (R-03a): la lista sale del manifest. `staleNodes` es de cada cerebro; el par histórico
  // es el fallback, para que un repo que no la declare mida exactamente lo que medía ayer.
  const NODOS_FECHA = Array.isArray(manifest.staleNodes) && manifest.staleNodes.length
    ? manifest.staleNodes
    : ['docs/05-ESTADO-GLOBAL.md', 'docs/10-MEMORIA-CORTO-PLAZO.md'];
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
    if (days > staleDays || (csFecha !== null && csFecha > staleCommits))
      // El --boot lleva versión CORTA: cada char de esta salida se re-inyecta como contexto en cada
      // arranque, y desde v1.34.0 el eje de commits sí dispara, así que esta línea aparece a menudo.
      info(BOOT
        ? `frescura: ${oldestWhere} sellado hace ${days}d${csFecha !== null ? ` y ${csFecha} commit(s)` : ''} (umbral ${staleDays}d / ${staleCommits}) → re-verificar y re-sellar el NODO.`
        : `frescura: ${oldestWhere} sellado hace ${days} día(s)${csFecha !== null ? ` y ${csFecha} commit(s)` : ''} (umbral ${staleDays}d / ${staleCommits} commits · FUENTE: git rev-list, no el reflog) → re-verificar vs git real y re-sellar «${oldestSeal}» — ESE sello, el del NODO. Los «verificado-vivo:» de dentro son OTRA cosa (los mide el #16) y actualizarlos NO apaga este aviso: pasó de verdad (§272).`);
    // El «todo en orden» es COBERTURA (distingue «miré y está fresco» de «no miré»), pero no vale
    // los chars del arranque: el SessionStart re-inyecta cada línea del --boot como contexto.
    else if (!BOOT) info(`frescura: ${oldestWhere} es el sello más viejo — ${days}d${csFecha !== null ? ` y ${csFecha} commit(s)` : ''} de ${staleDays}d / ${staleCommits} commits (FUENTE: git rev-list). Los dos ejes por debajo del umbral.`);
    // Un eje que no pudo mirar no se cuenta como eje que dijo que sí. v1.34.0 (R-03b).
    if (csFecha === null) degrade(`frescura: el eje de COMMITS no pudo contarse${GIT_MUDO ? ` (${GIT_MUDO})` : ''} → este gate decidió SOLO con el calendario. Es media medición, no una verde.`);
  }
  // v1.34.0 (R-03c): el manifest callado ya no es una decisión invisible. No bloquea (nadie nace en
  // rojo por esto), pero el veredicto deja de ser «íntegro» hasta que el repo declare su cifra.
  if (typeof manifest.staleCommits !== 'number')
    degrade(BOOT
      ? `frescura: manifest sin \`staleCommits\` → rige el default medido ${STALE_COMMITS_DEFAULT}. Declárala.`
      : `frescura: el manifest NO declara \`staleCommits\` → rige el default medido ${STALE_COMMITS_DEFAULT} (ritmos de 2026-09-04, ventana de ${staleDays}d: INMO 38,6 · CARS 5,1 · BERS 4,1 · INSE 3,2 commits/día). Declárala con su \`_comment\`: el silencio no es una decisión.`);
  // v1.34.0 (R-03a): si la lista sale del código y no del manifest, dilo — es cobertura, no detalle.
  // Fuera del --boot por el mismo motivo que arriba: es un recordatorio de configuración, no una alarma.
  if (!BOOT && !(Array.isArray(manifest.staleNodes) && manifest.staleNodes.length))
    info(`frescura — LISTA: el manifest no declara \`staleNodes\`; se vigilan los ${NODOS_FECHA.length} de siempre (${NODOS_FECHA.join(' · ')}). Un cerebro con más nodos que caducan rápido los añade ahí, sin tocar el kernel.`);
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
//     v1.34.0 (R-03d): tenía el mismo defecto que el #12 y por el mismo motivo — ningún `head()`.
//     Su salida aparecía colgando del cuerpo del #13, así que TODA cita a «#14» era inverificable
//     por bloque: `FALENCIAS.md` lo nombra y no había forma de resolver dónde empieza. Un mapa de
//     mecanismos con anclas que no resuelven convierte cada verificación futura en re-investigación.
//     ⛔ NO se renumera: `FALENCIAS.md` lo cita por ESE número. Gana cabecera, no identidad.
head('\n14) Auditoría Nivel-2 vigente (deepAudit: plazo y ADRs sin cubrir):');
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

  // ── 16b) ANCLA O NADA (v1.33.0 · B5 · F-01/F-08) ────────────────────────────────────────────
  // El bloque de arriba mide la EDAD de un marcador que alguien decidió poner. Este mira el otro
  // lado: el vocabulario con el que el cerebro AFIRMA haber verificado algo. La falencia F-01 del
  // modelo es «afirma trabajo/verificaciones que no ejecutó (también de subagentes)», y su
  // razonamiento visible no sirve de auditoría — así que lo único mecanizable es exigir que la
  // afirmación venga con algo que un tercero pueda ABRIR: una ruta que existe, un `§NN` indexado,
  // un sha resoluble en el reflog, o una cifra con su denominador.
  // ⚠️ LO QUE ESTE GATE MIDE, DICHO SIN ADORNOS: **mide presencia de ancla, no el acto**. Una ruta
  // que existe satisface el gate sin que la verificación haya ocurrido — es literalmente F-03
  // (satisfacer el gate aportando el texto que el gate pide). No lo hace inútil: sube el coste de
  // afirmar en falso y publica la mitad que no cubre ([[INMO:M-10]]). Informativo con trinquete:
  // bloquear se decide con la cifra de los 4 repos delante, no antes de tenerla.
  {
    const VOCAB = /\b(verificad[oa]s?|medid[oa]s?|probad[oa]s?|corrid[oa]s?|comprobad[oa]s?)\b|tests?\s+(verdes|pasan|en verde)|✅/i;
    const fuentes = [];
    for (const rel of ['docs/05-ESTADO-GLOBAL.md', 'docs/10-MEMORIA-CORTO-PLAZO.md']) {
      const p = join(ROOT, rel);
      if (existsSync(p)) fuentes.push([rel, read(p)]);
    }
    if (existsSync(histPath)) {
      // El ÚLTIMO ADR y solo ese: el histórico entero es deuda de otra época y exigirle anclas
      // retroactivas sería un rojo inaccionable de 299 filas. Lo que se vigila es lo que se ESCRIBE.
      const txt = read(histPath);
      const cortes = [...txt.matchAll(/^##\s+\d+\.\s.*$/gm)];
      if (cortes.length) {
        const ult = cortes[cortes.length - 1];
        fuentes.push([`docs/99-HISTORIAL-ADR.md (último ADR: ${ult[0].slice(0, 60).trim()})`, txt.slice(ult.index)]);
      }
    }
    const indiceTxt = indexPaths.length ? readIndex() : '';
    const EXT = /\b[\w./@-]+\.(?:md|mjs|js|cjs|json|html|css|ts|tsx|astro|ya?ml|sh|txt|svg|webp)\b/g;
    // (c) un sha que RESUELVE en este repo. v1.33 lo buscaba en el reflog (.git/logs/HEAD); v1.34.0 (R-03)
    // borró esa lectura —el reflog es un diario LOCAL que no viaja con el clon— pero dejó vivo su uso, y
    // el linter moría con `ReferenceError: reflogTxt is not defined` en cuanto un párrafo con vocabulario
    // de verificación citaba un sha que no resolvía por (a) ni (b). INSEMA lo pisó a la primera; los tres
    // repos densos nunca llegaban a esta rama (estreno del reparto, 2026-09-04 · v1.34.1). Ahora se
    // pregunta a los OBJETOS (`git cat-file -e <sha>^{commit}`), que sí viajan con el clon; si git no
    // contestó antes (GIT_MUDO), la rama degrada a «no resuelve» y deciden (d) o el sinAncla — nunca un crash.
    const shaCache = new Map();
    const shaResuelve = (sha) => {
      if (shaCache.has(sha)) return shaCache.get(sha);
      let ok = false;
      if (GIT_MUDO === null) {
        try { execFileSync('git', ['-C', ROOT, 'cat-file', '-e', `${sha}^{commit}`], { stdio: 'ignore' }); ok = true; } catch { ok = false; }
      }
      shaCache.set(sha, ok);
      return ok;
    };
    const ancla = (parrafo) => {
      for (const m of parrafo.matchAll(EXT)) {          // (a) ruta que EXISTE
        const r = m[0].replace(/^\.\//, '');
        const base = r.split('/').pop();
        if (existsSync(join(ROOT, r)) || existsSync(join(DOCS, base)) || existsSync(join(ROOT, base))) return true;
      }
      for (const m of parrafo.matchAll(/§\s?(\d+[a-z]?)/g))  // (b) §NN INDEXADO (no cualquier §)
        if (indiceTxt.includes(`§${m[1]}`)) return true;
      for (const m of parrafo.matchAll(/\b([0-9a-f]{7,40})\b/g)) // (c) sha que RESUELVE en el repo (objetos, no reflog)
        if (shaResuelve(m[1])) return true;
      if (/\b\d+\s*\/\s*\d+\b/.test(parrafo)) return true;   // (d) cifra CON denominador ([[INMO:L-58]])
      return false;
    };
    let afirma = 0; const sinAncla = [];
    for (const [rel, txt] of fuentes) {
      for (const parrafo of txt.split(/\n\s*\n/)) {
        if (!VOCAB.test(parrafo)) continue;
        afirma++;
        if (!ancla(parrafo)) sinAncla.push(`${rel} → «${parrafo.replace(/\s+/g, ' ').trim().slice(0, 70)}…»`);
      }
    }
    const base = Number.isInteger(manifest.anclaBaseline) ? manifest.anclaBaseline : null;
    const cab = `ancla-o-nada (B5): ${afirma - sinAncla.length}/${afirma} afirmación(es) de verificación llevan ancla resoluble en su párrafo; ${sinAncla.length} SIN ancla`;
    if (!afirma) degrade('ancla-o-nada (B5): CERO párrafos con vocabulario de verificación en 05/10/último-ADR → este gate no comparó nada. O el cerebro no afirma haber verificado nada, o el vocabulario se le escapa.');
    else if (base === null) info(`${cab}. Sin \`anclaBaseline\` en el manifest: este repo aún no congeló la línea base → CONGÉLALA en ${sinAncla.length} para que solo pueda bajar. ⚠️ Mide PRESENCIA DE ANCLA, NO EL ACTO de verificar.${sinAncla.length ? ' Ejemplos: ' + sinAncla.slice(0, 3).join(' · ') : ''}`);
    else if (sinAncla.length > base) warn(`${cab}, por encima de la deuda CONGELADA (${base}) → una afirmación NUEVA sin ancla. Pon la ruta/§/sha que la respalda, o retira la afirmación. ⚠️ El gate mide PRESENCIA DE ANCLA, NO EL ACTO. Ejemplos: ${sinAncla.slice(0, 3).join(' · ')}`);
    else info(`${cab} (deuda congelada ${base}; una nueva bloquea). ⚠️ Mide PRESENCIA DE ANCLA, NO EL ACTO de verificar.${sinAncla.length < base ? ` Bajó de ${base} a ${sinAncla.length}: baja el trinquete en el manifest.` : ''}`);
  }
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

// 24) 🐤 Canario de boot — el CABLEADO del SessionStart, MEDIDO (v1.32.0) [--full]
//     Existe por A-03: si los hooks del harness están muertos (máquina nueva, settings.json roto,
//     node fuera de PATH), el cerebro arranca sin signos vitales y NADA lo detecta.
//
//     LO QUE CAMBIÓ EN v1.32.0, Y POR QUÉ. Desde v1.8.0 este gate INFERÍA el arranque a partir de
//     los commits: «hubo actividad git posterior al marker ⇒ alguien trabajó aquí en sesión ⇒ los
//     hooks no dispararon». La premisa era falsa y se rompió dos veces. La primera, con la
//     distribución del kernel compartido (§216.9), que se parcheó filtrando los mensajes con la
//     palabra «kernel». La segunda, el 2-sep-2026, con la orden de merges del dueño: 54 entradas de
//     reflog en CARS —merges, no kernel— dejaron el canario en rojo en tres repos a la vez. Y la
//     salida que se propuso entonces —correr `session-handoff --boot-echo` a mano— compra siete días
//     y no arregla nada (INMO:M-25: sin mecanismo, «ya lo hicimos» es una nota).
//
//     El canario NO se apaga: deja de INFERIR y pasa a MEDIR exactamente lo que quería saber, que es
//     si el contrato está CABLEADO. Son tres mitades verificables con `fs`, sin adivinar intención:
//       (1) `.claude/settings.json` invoca `session-handoff`   → el SessionStart existe;
//       (2) `core.hooksPath` apunta a una carpeta con `pre-commit` → los hooks de git están cableados;
//       (3) ese `pre-commit` invoca `brain-check`               → y el linter corre de verdad.
//     El marcador (`docs/.boot-marker`) pasa a ser INFORMACIÓN —cuándo arrancó por última vez una
//     sesión aquí— y deja de ser el veredicto: un repo que nadie abre en un mes, con el cableado
//     intacto, NO tiene una avería. Con esto `BOOT_CANARY_SKIP` sobra y se retira: era ceguera
//     permanente para tapar una premisa mala, y la única forma de apagar el canario vuelve a ser la
//     explícita —`harnessCanary: false` con su razón en el manifest—.
head('\n24) Canario de boot (¿está CABLEADO el SessionStart? — se mide, no se infiere):');
if (BOOT) head('  ⏭️  omitido en --boot (lo está escribiendo esta misma sesión)');
else {
  // v1.10.3 (ADR 85, U-13): el gate le preguntaba al PROPIO archivo vigilado si debía vigilarlo.
  // Borra el hook de settings.json y el canario contestaba «no aplica en este repo»: falla ABIERTO
  // ante justo la regresión que existe para cazar. La declaración vive en el manifest.
  const declared = manifest.harnessCanary === true;
  if (!declared) info(manifest.harnessCanary === false
    ? 'canario de boot APAGADO por declaración EXPLÍCITA (harnessCanary:false) — su razón debe estar en el manifest'
    : 'canario de boot no declarado en el manifest (harnessCanary) — no aplica en este repo');
  else {
    const settingsP = join(ROOT, '.claude', 'settings.json');
    const sessionStart = existsSync(settingsP) && read(settingsP).includes('session-handoff');
    const gitCfg = join(ROOT, '.git', 'config');
    // En un worktree (o un submódulo) `.git` es un FICHERO y no hay `config` que leer: la mitad de
    // git NO se puede medir aquí. Eso sale DEGRADADO, nunca rojo — un gate que acusa por no poder
    // mirar es el mismo error que el que absuelve por no poder mirar, con el signo cambiado. Es la
    // misma salida que ya da el #25, y por lo mismo.
    const cfg = existsSync(gitCfg) ? read(gitCfg) : null;
    const mHooks = cfg && cfg.match(/^\s*hooksPath\s*=\s*(.+)$/m);
    const hooksDir = mHooks ? mHooks[1].trim() : join('.git', 'hooks');
    const hookP = join(ROOT, hooksDir, 'pre-commit');
    const preCommit = existsSync(hookP);
    const preCommitLlama = preCommit && read(hookP).includes('brain-check');
    const roto = [];
    if (!sessionStart) roto.push('.claude/settings.json NO invoca session-handoff (no hay hook SessionStart)');
    if (cfg !== null) {
      if (!preCommit) roto.push(`no hay pre-commit en "${hooksDir}/"`);
      else if (!preCommitLlama) roto.push(`"${hooksDir}/pre-commit" existe pero NO invoca brain-check`);
    }

    // El marcador es INFORMACIÓN, no veredicto. Lo escribe el `SessionStart` (`session-handoff
    // --boot-echo`) en cada arranque y lo refresca el vigía de la bóveda en los repos cuyo cableado
    // acaba de verificar — así que su edad dice «cuándo se supo por última vez que esto vivía», no
    // «cuándo trabajó alguien aquí». Se nombra tal cual para que nadie lea de más.
    const markerP = join(DOCS, '.boot-marker');
    const ageH = existsSync(markerP) ? (Date.now() - statSync(markerP).mtimeMs) / 3.6e6 : Infinity;
    const edad = ageH === Infinity ? 'sin marcador: nadie ha arrancado ni verificado esto todavía'
      : ageH < 48 ? `último latido (SessionStart o vigía) hace ${Math.round(ageH)}h`
      : `último latido (SessionStart o vigía) hace ${Math.round(ageH / 24)}d`;

    // 🎟️ TOKEN DE ENTREGA (v1.33.0 · B6 · F-10). Una FECHA en un fichero prueba que alguien
    // escribió una fecha. Desde v1.33.0 `--boot-echo` deriva el token del CONTENIDO que imprime
    // (`BOOT-OK <sha7>` = sha256 del heartbeat) y escribe ese mismo texto en `docs/.estado-auto.md`.
    // Aquí se RE-DERIVA del sidecar y se COMPARA con el `token=` del marcador: si cuadran, el eco
    // se EMITIÓ de verdad; si no, alguien puso el marcador sin que hubiera eco. Distingue emitir de
    // entregar ([[INMO:L-73]]) sin creerle a un `includes` ni a un `touch`.
    // Un marcador SIN `token=` no es un fallo: lo escribe el vigía de la bóveda cuando verifica el
    // cableado desde fuera, y lo escribían los kernels < v1.33.0. Se DICE, no se acusa.
    if (existsSync(markerP)) {
      const tok = (read(markerP).match(/^token=([0-9a-f]{7})$/m) || [])[1];
      const sidecarP = join(DOCS, '.estado-auto.md');
      if (!tok) info(`canario — marcador SIN token de entrega: lo escribió el vigía de la bóveda o un kernel anterior a v1.33.0. Mide EDAD, no entrega; el próximo \`--boot-echo\` de este repo pondrá el token.`);
      else if (!existsSync(sidecarP)) degrade(`canario — el marcador trae token \`${tok}\` pero no hay \`docs/.estado-auto.md\` con qué compararlo (¿clon recién hecho?): la ENTREGA no se puede verificar aquí.`);
      else {
        const esperado = createHash('sha256').update(read(sidecarP).replace(/\n$/, '')).digest('hex').slice(0, 7);
        if (esperado === tok) ok(`canario — ENTREGA verificada: el token del marcador (\`${tok}\`) es el sha del eco que quedó en docs/.estado-auto.md. El SessionStart no solo disparó: entregó.`);
        else warn(`canario — el token del marcador (\`${tok}\`) NO es el del eco guardado (\`${esperado}\`): el marcador se escribió SIN que ese eco se emitiera, o el sidecar se editó después. Un marcador que no corresponde a ningún eco es justo la ficción que este token existe para matar — corre \`node scripts/session-handoff.mjs --boot-echo\` y vuelve a mirar.`);
      }
    }

    if (roto.length) {
      warn(`el manifest declara harnessCanary pero el cableado del arranque está ROTO (${roto.length}/${cfg === null ? 1 : 3} mitades medibles): ${roto.join(' · ')}. El cerebro arrancaría SIN signos vitales y nadie lo notaría. Recablea (settings.json + \`git config core.hooksPath githooks\` + cp githooks/pre-commit), o pon harnessCanary:false con su razón. [${edad}]`);
    } else if (cfg === null) {
      // Un worktree (o un submódulo) no tiene `.git/config`: la mitad de git NO se puede medir aquí.
      // Sale DEGRADADO, jamás verde y jamás rojo — acusar por no poder mirar es el mismo error que
      // absolver por no poder mirar, con el signo cambiado. Misma salida que el #25, y por lo mismo.
      info(`canario DEGRADADO — el SessionStart SÍ está en settings.json, pero sin .git/config legible (¿worktree o submódulo?) el cableado de los hooks de git no se puede verificar desde aquí. [${edad}]`);
    } else {
      // Las tres mitades presentes: el contrato está instalado. El marcador se DICE, no juzga.
      ok(`cableado COMPLETO (SessionStart + core.hooksPath="${hooksDir}" + pre-commit que llama a brain-check) — ${edad}`);
    }
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
//     v1.34.0 (R-02): la ceguera de este gate NO era de grado, era de CLASE. El regex `^\|\s*§(\d+)`
//     solo miraba las filas de ADR; la capa «sintoma -> neurona» —la que de verdad enruta a un agente
//     FRIO, que es quien mas depende del indice— no se contaba A NINGUNA LONGITUD. Medido el
//     2026-09-04 en los cuatro repos: 858 filas `§NN` (216 por encima del RUIDO, con su trinquete)
//     frente a 153 filas semanticas de las que se median CERO; 28 pasan de 200c y 2 pasan de 260c
//     (peor: CARS docs/00-INDICE.md:54 = 665c). Ahora el gate entra en TODA fila de tabla y publica
//     su COBERTURA con denominador [[M-27]]: una sonda que enumera y no dice sobre cuantos, miente.
head('\n26) Longitud de fila del índice (ruteo, no narración):');
if (BOOT) head('  ⏭️  omitido en --boot');
else if (!indexPaths.length) info('sin índice');
else {
  const LIMITE = 200, RUIDO = 260;   // avisa desde 260c para no ahogar por 10 chars de mas
  const ES_FILA = /^\|/;                       // fila de tabla markdown
  const ES_SEP = /^\|[\s:|-]+\|?\s*$/;         // la fila `|---|---|` no es contenido, es sintaxis
  const gordas = [];        // filas `| §NN` — la poblacion vieja, con su trinquete de siempre
  const gordasSem = [];     // filas de tabla que NO son `| §NN` — la capa semantica (R-02)
  let filasNN = 0, filasSem = 0;
  for (const p of indexPaths) {
    const f = p.split(/[\\/]/).pop();
    read(p).split('\n').forEach((l, i) => {
      if (!ES_FILA.test(l) || ES_SEP.test(l)) return;
      const m = l.match(/^\|\s*§(\d+)\b/);
      if (m) { filasNN++; if (l.length > RUIDO) gordas.push({ f, n: i + 1, s: m[1], c: l.length }); return; }
      filasSem++;
      if (l.length > RUIDO) gordasSem.push({ f, n: i + 1, c: l.length });
    });
  }
  // COBERTURA primero, siempre: cuantas filas MIRO cada mitad. Sin esto, «0 gordas» y «no miré
  // ninguna fila» se imprimen igual, que es el modo de fallo que este bloque estrena arreglado.
  info(`cobertura del #26 — §NN: ${gordas.length}/${filasNN} por encima de ${RUIDO}c · semánticas: ${gordasSem.length}/${filasSem}${filasSem ? '' : ' ⚠️ esta mitad no vio NI UNA fila: el índice no tiene capa semántica en tabla, o el patrón dejó de casar'}`);
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
  // ── La MITAD SEMÁNTICA (v1.34.0 · R-02) ────────────────────────────────────────────────────
  // Mismo LIMITE y mismo RUIDO que la mitad `§NN`: es la misma regla escrita del manifest, aplicada
  // a la población que hasta hoy nadie contaba. Trinquete PROPIO (`indexSemanticRowOverLimitBaseline`)
  // porque las dos poblaciones crecen por motivos distintos. Y con una diferencia deliberada: si el
  // manifest NO la declara, esto AVISA pero no bloquea — el reparto de v1.34.0 congela cada repo en
  // su cifra medida, y hasta entonces ningún cerebro nace en rojo por un gate que acaba de abrir los
  // ojos. Un gate nuevo que bloquea el día que llega no se estrena: se desactiva ([[M-05]]).
  const baseSem = manifest.indexSemanticRowOverLimitBaseline;
  if (!gordasSem.length) ok(`filas semánticas del índice (${filasSem}) dentro de ${LIMITE}c (+holgura)`);
  else {
    gordasSem.sort((a, b) => b.c - a.c);
    const topS = gordasSem.slice(0, 5).map((g) => `${g.f}:${g.n} (${g.c}c)`).join(' · ');
    const detS = `${gordasSem.length} fila(s) SEMÁNTICA(S) de ${filasSem} por encima de ${RUIDO}c (objetivo ${LIMITE}c): ${topS}${gordasSem.length > 5 ? ' …' : ''}`;
    if (typeof baseSem !== 'number') {
      info(`${detS} → la capa síntoma→neurona es la que lee un agente FRÍO: una fila que narra deja de enrutar. (Declara \`indexSemanticRowOverLimitBaseline\`: ${gordasSem.length} congela lo de hoy y bloquea lo nuevo.)`);
    } else if (gordasSem.length > baseSem) {
      warn(`${detS} → son ${gordasSem.length - baseSem} MÁS que la deuda congelada (${baseSem}). Acorta la fila nueva: el síntoma enruta, el detalle vive en la neurona.`);
    } else if (gordasSem.length < baseSem) {
      info(`${detS} → por DEBAJO de la deuda congelada (${baseSem}): baja \`indexSemanticRowOverLimitBaseline\` a ${gordasSem.length} para que el trinquete no se afloje.`);
    } else {
      info(`${detS} → deuda congelada en ${baseSem}; una fila semántica gorda nueva bloquea.`);
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

// 31) INVENTARIO DE EJECUTOR — ¿quién hace cumplir cada regla del router? [info, --full]
//     (v1.33.0 · B4 · falencia F-13 del modelo: «lo escrito no es restricción dura».)
//     El router ya tiene la regla correcta —«Regla de ADMISIÓN (anti-teatro): toda regla nueva
//     declara su gate del linter o lleva [HONOR] explícito»— y hasta hoy NADIE la ejecutaba: no
//     había cifra de cuántas viñetas imperativas tienen gate, cuántas llevan [HONOR] y cuántas no
//     declaran nada. Esa tercera categoría es justo la que un modelo racionaliza saltarse («es un
//     cambio pequeño», «preserva el comportamiento»). Es [[INMO:M-10]] literal: el ✅ se lee como
//     cobertura total porque la mitad no cubierta NO SE PUBLICA. Este gate la publica.
//     INFORMATIVO A PROPÓSITO EN ESTA VERSIÓN: bloquear con una cifra que nadie ha visto todavía
//     en los cuatro repos sería fijar el techo antes de medir. Primero la cifra; la decisión de
//     subirlo a bloqueante se toma con las cuatro delante.
//     ⚠️ Y lo que NO mide: que el ejecutor citado exista de verdad ni que muerda. Mide DECLARACIÓN.
head('\n31) Inventario de ejecutor (¿quién hace cumplir cada regla del router?):');
if (BOOT) head('  ⏭️  omitido en --boot');
else {
  const IMPERATIVO = /NUNCA|SIEMPRE|OBLIGATORI|jam[áa]s|\bdebe[nr]?\b|prohibid[oa]s?/i;
  const EJECUTOR = /#\d+|brain:check|brain-check|pre-commit|verify-|\bgates?\b|\[HONOR\]/i;
  const HONOR = /\[HONOR\]/;
  // Una viñeta NO es una línea: es la línea que la abre MÁS sus continuaciones (el router envuelve
  // a ~110 columnas, y el `[HONOR]` o el `#NN` caen a menudo en la segunda línea). Contar por línea
  // suelta daba «1 [HONOR]» donde hay cuatro — el mismo error de medir la superficie equivocada.
  const bloques = []; let actual = null;
  claude.split('\n').forEach((l, i) => {
    if (/^\s{0,6}(?:[-*+]|\d+[.)])\s+\S/.test(l)) { actual = { linea: i + 1, txt: l }; bloques.push(actual); return; }
    if (actual && /^\s{2,}\S/.test(l)) { actual.txt += ' ' + l.trim(); return; }  // continuación
    actual = null;                                                                // corta el bloque
  });
  let conGate = 0, honor = 0; const sinDeclarar = [];
  for (const b of bloques) {
    if (!IMPERATIVO.test(b.txt)) continue;
    if (HONOR.test(b.txt)) { honor++; continue; }
    if (EJECUTOR.test(b.txt)) { conGate++; continue; }
    sinDeclarar.push(`L${b.linea}: «${b.txt.replace(/\s+/g, ' ').trim().slice(0, 62)}…»`);
  }
  const totalImp = conGate + honor + sinDeclarar.length;
  const base = Number.isInteger(manifest.ejecutorBaseline) ? manifest.ejecutorBaseline : null;
  if (!totalImp) degrade('inventario de ejecutor: CERO viñetas imperativas en CLAUDE.md → este gate no contó nada (¿el router no manda, o el patrón no lo ve?).');
  else {
    const cab = `inventario de ejecutor: ${totalImp} viñeta(s) imperativa(s) en CLAUDE.md → ${conGate} con ejecutor citado · ${honor} [HONOR] · ${sinDeclarar.length} SIN DECLARAR`;
    if (base === null) info(`${cab}. Sin \`ejecutorBaseline\` en el manifest: congélalo en ${sinDeclarar.length} y solo podrá bajar. INFORMATIVO en v1.33.0 (no bloquea). ⚠️ Mide la DECLARACIÓN, no que el ejecutor exista ni que muerda.${sinDeclarar.length ? ' Las primeras: ' + sinDeclarar.slice(0, 3).join(' · ') : ''}`);
    else if (sinDeclarar.length > base) info(`${cab} — POR ENCIMA de la deuda congelada (${base}): ha entrado al router una regla imperativa sin ejecutor. Cítale su gate (\`#NN\`) o márcala \`[HONOR]\`; si no cabe por el candado del boot, la que sale es una regla DEL ROUTER (§G.5, one-in-one-out). INFORMATIVO en v1.33.0, a propósito. Nuevas: ${sinDeclarar.slice(0, 4).join(' · ')}`);
    else info(`${cab} (deuda congelada ${base}${sinDeclarar.length < base ? ` — BAJÓ a ${sinDeclarar.length}: baja también el trinquete en el manifest` : ''}). ⚠️ Mide la DECLARACIÓN, no que el ejecutor muerda.`);
  }
}

// ── 🌀 ÁRBOL EN MOVIMIENTO — la re-comprobación (v1.34.0 · R-04) ──────────────────────────────
// Va AQUÍ, después del último chequeo y antes del veredicto, porque lo que decide no es ningún
// hallazgo: es si este veredicto se puede firmar. Dos sondas independientes, ninguna adivinada.
let ARBOL_MOVIDO = false;
{
  const movidos = [];
  for (const [p, antes] of vistos) {
    const ahora = mtimeDe(p);
    if (antes === null && ahora === null) continue;              // no existía y sigue sin existir
    if (antes === null || ahora === null || ahora !== antes) movidos.push(p.slice(ROOT.length + 1).replace(/\\/g, '/'));
  }
  const statusFin = gitOut(['status', '--porcelain']);
  const statusCambio = STATUS_INI !== null && statusFin !== null && STATUS_INI !== statusFin;
  if (movidos.length || statusCambio) {
    const detalle = [
      movidos.length ? `${movidos.length} fichero(s) que este linter LEYÓ cambiaron mientras corría: ${movidos.slice(0, 5).join(' · ')}${movidos.length > 5 ? ' …' : ''}` : '',
      statusCambio ? '`git status --porcelain` NO es el mismo al empezar y al terminar' : '',
    ].filter(Boolean).join(' · ');
    const msg = `🌀 ÁRBOL EN MOVIMIENTO: ${detalle}. VEREDICTO NO FIABLE — otra sesión (o un script) estaba escribiendo. NO publiques este resultado como avería del sistema hasta re-correrlo con el árbol quieto (§ el 2026-09-03 el mismo comando dio ❌6 y ✅15 con 23 min de diferencia y cero ediciones).`;
    ARBOL_MOVIDO = true;
    if (PRECOMMIT) warn(`${msg} En pre-commit esto es ROJO: un veredicto que no se puede firmar no puede dejar pasar un commit.`);
    else degrade(msg);
  } else if (!BOOT && STATUS_INI === null) {
    degrade(`🌀 árbol en movimiento: no se pudo comparar \`git status\`${GIT_MUDO ? ` (${GIT_MUDO})` : ''} → esta mitad NO miró. Queda la de mtime, sobre ${vistos.size} fichero(s) leídos.`);
  } else if (!BOOT) {
    ok(`árbol estable durante la corrida: ${vistos.size} fichero(s) leídos sin cambiar de mtime y \`git status\` idéntico al empezar y al terminar`);
  }
}

const sano = '✅ CEREBRO SANO (estructura íntegra' + (manifest.deepAudit && manifest.deepAudit.last ? ' · auditoría semántica: ' + manifest.deepAudit.last : '') + ')';
const parcial = `🟠 ESTRUCTURA ÍNTEGRA, pero ${degraded} gate(s) DEGRADADOS (no pudieron correr) — NO es un cerebro verificado: clona la bóveda / el canónico y re-corre`;
// v1.34.0 (R-04): un ✅ y un «veredicto no fiable» en la misma pantalla es el modo de fallo que este
// cambio ataca — el lector se queda con el ✅. Si el árbol se movió, el titular lo dice y manda.
const movido = `🌀 VEREDICTO NO FIABLE — el árbol cambió mientras este linter lo leía${problems ? ` (y ${problems} hallazgo[s] colgando de esa lectura)` : ''}. Ni ✅ ni ❌: no se pudo mirar quieto. NO publiques este resultado como avería del sistema; re-corre con el árbol parado.`;
lines.push(`\n${ARBOL_MOVIDO ? movido : (problems ? '⚠️  ' + problems + ' problema(s) — revisar antes de avanzar' : (degraded ? parcial : sano))}\n`);
let out = lines;
if (BOOT && out.join('\n').length > 2000) {
  // presupuesto duro: cada línea del boot se re-inyecta como contexto en CADA sesión
  out = out.filter((l) => !l.startsWith('  ✅') || /BOOT|SANO/.test(l));
  if (out.join('\n').length > 2000) out = out.slice(0, 24).concat(['  … (recortado por presupuesto de stdout; detalle: npm run brain:check)']);
}
console.log(out.join('\n'));
process.exit(problems ? 1 : 0);
