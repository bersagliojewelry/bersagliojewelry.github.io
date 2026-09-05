#!/usr/bin/env node
/**
 * session-handoff.mjs — Caja negra anti-saturación (TODO-28 #1, comité §33).
 * Escribe la foto REAL de la sesión (git, no promesas) a docs/.handoff-auto.md para que
 * el próximo operador arranque con datos aunque esta sesión muera sin consolidar (mata M-01).
 *
 * Modos:
 *   --end        SessionEnd/Stop: escribe la foto en silencio (exit 0 siempre — jamás bloquear).
 *                v1.33.0 (B7 · F-06): además mira el ÚLTIMO mensaje del asistente y, si cierra
 *                prometiendo el siguiente paso o pidiendo un permiso ya dado, emite UN
 *                `systemMessage` y deja línea en docs/.promesas-log. Exhortación, no puerta.
 *   --precompact PreCompact: escribe la foto Y deja el 🚩 flag docs/.consolidacion-pendiente.
 *                NO emite JSON: el esquema del harness no admite hookSpecificOutput en PreCompact y
 *                al fallar en la RAIZ descartaba el objeto entero — 0/15 entregas en 44 dias (§291).
 *   --boot-echo  SessionStart: escribe el marker del canario + 💓 HEARTBEAT (F2 §52: sidecar
 *                docs/.estado-auto.md con la mitad DERIVABLE del estado — solo-local, SIN red,
 *                degradación RUIDOSA) + imprime foto/estado/nags (entra al contexto). Y COBRA los
 *                dos flags: 🚨 docs/.vigia-alerta (v1.30.0) primero y ⛔ docs/.consolidacion-pendiente
 *                después — un cerebro roto invalida el trabajo; uno sin consolidar solo lo retrasa.
 *                v1.33.0: imprime `BOOT-OK <sha7>` (token DERIVADO del eco, que el #24 compara con
 *                docs/.boot-marker · B6) y el 🧠 sidecar de FALENCIAS del maestro (A2), pagado con
 *                el recorte del bloque de commits del handoff (26 → 8 líneas).
 *   --boot-echo --compact  la rama `matcher:"compact"` del SessionStart: además RE-INYECTA
 *                `docs/05` + `docs/10` enteros, porque tras compactar el harness solo garantiza el
 *                CLAUDE.md de raíz (B11 · F-17).
 * Kill-switch heartbeat (§52): si falla 2×/mes y su ausencia no cuesta nada medible → borrarlo.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, appendFileSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', '.handoff-auto.md');
const MARKER = join(ROOT, 'docs', '.boot-marker'); // canario de boot (TODO-31b §49): prueba de que SessionStart corrió
// 🚩 El TOKEN de consolidación (§291): lo PONE PreCompact, lo COBRA el SessionStart siguiente (que
// es el canal medido 15/15) y lo BORRA el pre-commit al commitear docs/10 o docs/99. Su VIDA es la
// métrica de cumplimiento: un token que envejece dice que la orden se ignoró; un disparo no dice nada.
const FLAG = join(ROOT, 'docs', '.consolidacion-pendiente');
// 🚨 El flag del VIGÍA (PLAN-CIERRE §5, capa 2). Lo levanta `scripts/vigia.mjs` de la bóveda cuando
// algo del cerebro sale ROJO sin nadie delante (tarea diaria de Windows, 07:00); lo COBRA este
// SessionStart —el único canal medido 15/15— y lo BORRA el pre-commit cuando el vigía vuelve a dar
// verde. Solo existe donde el vigía lo pone (hoy, INMO): en los demás repos esta línea es inerte, y
// esa es la forma correcta de repartir un kernel compartido — no un `if (repo === …)`.
const VIGIA = join(ROOT, 'docs', '.vigia-alerta');
// 📣 El log de PROMESAS (B7 · F-06). Lo escribe `--end` cuando el último mensaje del asistente
// cierra prometiendo el siguiente paso o pidiendo un permiso ya dado, sin haberlo ejecutado.
// Gitignored. Se declara lo que es: un mecanismo que ENTREGA UNA EXHORTACIÓN, no una puerta —
// su tasa de conversión (avisos → paso ejecutado en el turno siguiente) está por medir, 30 días
// desde el 2026-09-03. Hasta entonces NO se afirma que funcione: solo que dispara y deja rastro.
const PROMESAS = join(ROOT, 'docs', '.promesas-log');
const mode = process.argv[2] || '--end';
const FLAGS = process.argv.slice(2);
const esCompact = FLAGS.includes('--compact'); // lo pasa la rama `matcher:"compact"` del SessionStart

const git = (args, cwd = ROOT) => {
  try { return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return '(git no disponible)'; }
};

// Guardián de la bóveda compartida (M-03 §49): el gate vive pegado al recurso, no en doctrina.
// Devuelve null si no hay bóveda/git; si hay, {root, dirty: n} con n = archivos sin commitear.
const boveda = () => {
  try {
    const archiveDir = JSON.parse(readFileSync(join(ROOT, 'docs', '.brain-manifest.json'), 'utf8')).archiveDir;
    if (!archiveDir) return null;
    let dir = join(ROOT, archiveDir);
    for (let i = 0; i < 4 && !existsSync(join(dir, '.git')); i++) dir = join(dir, '..');
    if (!existsSync(join(dir, '.git'))) return null;
    const porcelain = git(['status', '--porcelain'], dir);
    if (porcelain === '(git no disponible)') return null;
    return { root: dir, dirty: porcelain ? porcelain.split('\n').length : 0 };
  } catch { return null; }
};

// 🧠 SIDECAR DE FALENCIAS (A2 · dictamen `DICTAMEN-FALENCIAS-MODELO.md` §2): las cinco falencias
// del MODELO que más error cuestan hoy, escritas en la bóveda y leídas aquí. Vive fuera del repo a
// propósito —es conocimiento del maestro, no de este proyecto— y por eso se paga con el recorte del
// bloque «Últimos commits (24h)»: el arranque real tiene que quedar MÁS BAJO, no más alto.
// Si la bóveda no está clonada, se DICE (una línea), jamás se calla: un sidecar ausente en silencio
// es exactamente la ficción que el heartbeat existe para matar (§52).
const sidecarFalencias = () => {
  const rel = join('maestro', 'dominios', 'modelo-claude', 'SIDECAR.md');
  const b = boveda();
  const candidatos = [b && join(b.root, rel), join(ROOT, '..', 'brain-private', rel)].filter(Boolean);
  for (const p of candidatos) { try { if (existsSync(p)) return readFileSync(p, 'utf8').trimEnd(); } catch { /* siguiente */ } }
  return '🧠 FALENCIAS: sidecar NO disponible (bóveda sin clonar en esta máquina) → maestro/dominios/modelo-claude/SIDECAR.md';
};

// 💓 HEARTBEAT (F2 §52) — la mitad DERIVABLE del estado se GENERA en cada boot (el 05 ya no la
// escribe a mano: no puede mentir sobre lo que no contiene). SOLO lectura local, CERO red.
// Cada sonda degrada RUIDOSA: fallo = "❌ NO VERIFICADO (motivo)", jamás un valor viejo con sello fresco.
const heartbeat = () => {
  const probe = (fn) => { try { const v = fn(); return (v == null || v === '' || v === '(git no disponible)') ? '❌ NO VERIFICADO' : v; } catch (e) { return `❌ NO VERIFICADO (${String(e && e.message || e).slice(0, 40)})`; } };
  let costoPct = null; // lo llena la sonda de costo; el banner en cristiano lo reusa (F3 §53)
  let manifest = {}; try { manifest = JSON.parse(readFileSync(join(ROOT, 'docs', '.brain-manifest.json'), 'utf8')); } catch { /* banner degrada */ }
  // 🧭 CLASIFICADOR v2 (v1.34.2 · N2b-01/N2b-09 de la Nivel-2 #2 de insema). El viejo `BRAIN_RE`
  // tenía DOS clases —cerebro y «todo lo demás»— y ese «todo lo demás» se llamaba PRODUCTO en el
  // banner. Medido el 2026-09-04 en insema: «8 commits de producto sin ADR» y NINGUNO tocaba el
  // producto (la landing no cambia desde junio); eran `scripts/.kernel-version.json`,
  // `githooks/pre-commit`, `.claude/settings.json`, `.gitignore`, `.github/workflows/` y
  // `scripts/guard-destructivo.mjs` —un kernelFile DECLARADO que el regex viejo no reconocía—.
  // Un banner que nombra producto lo que es fontanería del propio cerebro manda a consolidar lo
  // que no existe. Ahora hay TRES clases y UNA función; si algún día `brain-check.mjs` clasifica
  // rutas (hoy, v1.34.2, NO lo hace: no tiene ningún regex de este tipo), copia esta función o
  // estos literales, no invente los suyos.
  //   · cerebro  = docs/ · CLAUDE.md · skills/ · _legacy/ · githooks/ · .claude/ + los kernelFiles
  //                declarados en el manifest (con regex de respaldo si el manifest no se leyó).
  //   · infra    = .gitignore · .gitattributes · .github/ · package(-lock).json · .editorconfig · CNAME.
  //   · producto = todo lo demás.
  const KERNEL_RE = /^scripts\/(brain|boot-gate|session-handoff|guard-destructivo|verify-|\.kernel-version)/;
  const CEREBRO_RE = /^(docs\/|CLAUDE\.md$|skills\/|_legacy\/|githooks\/|\.claude\/)/;
  const INFRA_RE = /^(\.gitignore$|\.gitattributes$|\.github\/|package\.json$|package-lock\.json$|\.editorconfig$|CNAME$)/;
  const KERNEL_DECL = new Set(Array.isArray(manifest.kernelFiles) ? manifest.kernelFiles : []);
  const clasificarRuta = (ruta) => {
    const r = String(ruta).replace(/\\/g, '/').trim();
    if (!r) return 'infra';
    if (CEREBRO_RE.test(r) || KERNEL_DECL.has(r) || KERNEL_RE.test(r)) return 'cerebro';
    if (INFRA_RE.test(r)) return 'infra';
    return 'producto';
  };
  // Un commit se clasifica por sus rutas: PRODUCTO si toca ≥1 ruta de producto; si no, CEREBRO si
  // toca ≥1 de cerebro; si no, INFRA. Un commit sin rutas (merge vacío) cae en infra y no cuenta.
  const clasificarCommit = (rutas) => rutas.some((f) => clasificarRuta(f) === 'producto') ? 'producto'
    : rutas.some((f) => clasificarRuta(f) === 'cerebro') ? 'cerebro' : 'infra';
  const rutasDe = (c) => c.split('\n').map((l) => l.trim()).filter(Boolean);
  const swP = ['service-worker.js', 'public/sw.js', 'sw.js', 'public/service-worker.js'].map((c) => join(ROOT, c)).find((p) => existsSync(p));
  const lines = [
    '# 💓 Estado DERIVABLE (⚙️ GENERADO por heartbeat en cada boot — NO editar; sidecar gitignored, §52)',
    `- generado: ${new Date().toISOString()} · solo-local (las sondas de red viven en la resonancia F3)`,
    `- git: branch ${probe(() => git(['branch', '--show-current']))} · HEAD ${probe(() => git(['log', '-1', '--format=%h · %s']))}`,
    `- sucios sin commit: ${probe(() => { const d = git(['status', '--porcelain']); return d ? `${d.split('\n').length} archivo(s) (detalle: git status)` : '(limpio)'; })}`,
    `- origin visto hace: ${probe(() => { const p = join(ROOT, '.git', 'FETCH_HEAD'); if (!existsSync(p)) return 'NUNCA → git fetch antes de afirmar deploy (§3.3)'; const h = (Date.now() - statSync(p).mtimeMs) / 3.6e6; return `${h.toFixed(1)}h${h > 24 ? ' ⚠️ refs remotas VIEJAS → git fetch antes de afirmar deploy (§3.3)' : ''}`; })}`,
    `- SW cache vigente: ${swP ? probe(() => (readFileSync(swP, 'utf8').match(/CACHE_(?:NAME|VERSION)\s*=\s*['"]([^'"]+)['"]/) || [])[1]) + ` (${swP.split(/[\\/]/).pop()})` : '(sin service worker)'}`,
    `- CNAME: ${probe(() => existsSync(join(ROOT, 'CNAME')) ? readFileSync(join(ROOT, 'CNAME'), 'utf8').trim() : '(no aplica)')}`,
    `- 🧮 costo-cerebro 30d: ${probe(() => { const out = git(['log', '--since=30.days', '--name-only', '--format=%x01']); const cs = out.split('\x01').map((c) => c.trim()).filter(Boolean); if (!cs.length) return 'sin commits en 30d'; const clases = cs.map((c) => clasificarCommit(rutasDe(c))); const brain = clases.filter((k) => k === 'cerebro').length; const infra = clases.filter((k) => k === 'infra').length; costoPct = Math.round((brain / cs.length) * 100); return `${costoPct}% (${brain}/${cs.length} commits de cerebro · ${infra} de infra · clasificador v2)${costoPct > 30 ? ' 🔴 > bandera 30% (TODO-28 #6: recortar doctrina, no añadir)' : ' ✅ ≤ 30%'}`; })}`,
    `- 🧊 consolidación: ${probe(() => { const last99 = git(['log', '-1', '--format=%ct', '--', 'docs/99-HISTORIAL-ADR.md']); if (!/^\d+$/.test(last99)) return 'sin 99 trackeado'; const prod = git(['log', `--since=${new Date(+last99 * 1000).toISOString()}`, '--name-only', '--format=%x01']).split('\x01').map((c) => c.trim()).filter(Boolean).filter((c) => clasificarCommit(rutasDe(c)) === 'producto').length; return prod >= 3 ? `⚠️ PENDIENTE #${prod}: ${prod} commits de producto sin ADR (npm run brain:archive · clasificador v2)` : `al día (${prod} commit(s) de producto desde el último ADR · clasificador v2)`; })}`,
  ];
  // 🧭 Banner EN CRISTIANO (F3 §53 — primer entregable visible para el dueño; el calendario vive
  // en el tool, no en el humano: cuando algo dice TOCA, un mensaje suyo dispara el mantenimiento).
  const dias = (iso) => Math.floor((Date.now() - new Date(iso)) / 86400000);
  const backup = manifest.lastOffsiteBackup ? dias(manifest.lastOffsiteBackup) : null;
  const da = manifest.deepAudit || {};
  const audDias = da.last ? dias(da.last) : null;
  const audToca = audDias != null && da.maxDays && audDias > da.maxDays;
  lines.push('', '🧭 EN CRISTIANO (para el dueño):',
    `   · Mantenimiento del cerebro: ${costoPct != null ? costoPct + '% del trabajo del mes (meta: menos del 30%)' : 'sin medir aún'}${costoPct > 30 ? ' 🔴' : ''}`,
    `   · Copia de seguridad externa: ${backup != null ? `hace ${backup} día(s)${backup > 35 ? ' ⚠️ TOCA renovarla' : ' ✅'}` : '⚠️ NUNCA hecha'}`,
    `   · Revisión profunda del cerebro: ${audDias != null ? (audToca ? `⚠️ TOCA (última hace ${audDias} días)` : `al día (hace ${audDias} días)`) : '⚠️ nunca'}${audToca || (backup != null && backup > 35) ? ' → di: "haz el mantenimiento mensual"' : ''}`);
  lines.push('', sidecarFalencias());
  return lines.join('\n');
};

try {
  if (mode === '--boot-echo') {
    const hb = heartbeat();
    writeFileSync(join(ROOT, 'docs', '.estado-auto.md'), hb + '\n', 'utf8');
    // 🎟️ TOKEN DE ENTREGA (B6 · F-10). El marcador decía «alguien arrancó aquí» y el #24 lo creía
    // por `includes`: un fichero con la fecha puesta a mano satisfacía el gate sin que el hook
    // hubiera EMITIDO nada. Ahora el token se DERIVA del contenido que este eco imprime, se
    // publica en stdout (`BOOT-OK <sha7>`) y se escribe aquí; el #24 COMPARA los dos. Distingue
    // emitir de entregar ([[INMO:L-73]]): un token escrito sin eco no coincide con ninguno.
    const token = createHash('sha256').update(hb).digest('hex').slice(0, 7);
    writeFileSync(MARKER, `${new Date().toISOString()}\ntoken=${token}\n`, 'utf8');
    // 🚨 EL VIGÍA VA ANTES QUE TODO, incluida la consolidación, y el orden es deliberado: un cerebro
    // ROTO invalida el trabajo que se haga encima, mientras que uno sin consolidar solo lo retrasa.
    // Si los dos flags están puestos, se imprimen los dos y el texto dice cuál manda.
    if (existsSync(VIGIA)) {
      const v = readFileSync(VIGIA, 'utf8');
      const campo = (k) => (v.match(new RegExp(`^${k}=(.+)$`, 'm')) || [])[1] || '?';
      const ts = campo('ts');
      const edad = /^\d{4}-/.test(ts) ? `${((Date.now() - new Date(ts)) / 3.6e6).toFixed(1)}h` : 'edad ?';
      const resumen = v.split(/^resumen:$/m)[1] || '';
      console.log(`🚨 ORDEN DEL CEREBRO — EL VIGÍA ENCONTRÓ ${campo('rojos')} PIEZA(S) EN ROJO (hace ${edad}, modo ${campo('modo')})
Algo del cerebro se rompió SIN NADIE DELANTE. ANTES de cualquier otra cosa —antes incluso de consolidar—: arréglalo o, si no se puede, déjalo DIAGNOSTICADO por escrito.${resumen.trimEnd()}
Informe completo: ${campo('informe')}
Este flag NO se borra solo ni lo borra el vigía: lo borra el pre-commit de este repo cuando \`node ../brain-private/scripts/vigia.mjs --recheck\` vuelva a dar verde (docs/.vigia-alerta).
`);
    }
    // ⛔ LA ORDEN, por el canal que SÍ entrega (§291). Medido: SessionStart entra al contexto 15/15
    // —también con source=compact, justo después del corte— y PreCompact 0/15. Va la PRIMERA y corta:
    // lo que se lee al final de un volcado de 6k no es una orden, es un pie de página.
    if (existsSync(FLAG)) {
      const f = readFileSync(FLAG, 'utf8');
      const ts = (f.match(/^ts=(.+)$/m) || [])[1] || '';
      const hd = (f.match(/^head=(.+)$/m) || [])[1] || '?';
      const edad = ts ? `${((Date.now() - new Date(ts)) / 3.6e6).toFixed(1)}h` : 'edad ?';
      console.log(`⛔ ORDEN DEL CEREBRO — CONSOLIDACIÓN PENDIENTE (hace ${edad}, corte en ${hd})
La sesión anterior COMPACTÓ SIN CONSOLIDAR. ANTES de cualquier otra cosa: pon al día docs/10 (foco, avances, callejones) y consolida a docs/99 lo que ya esté cerrado.
Este flag NO se borra solo: lo borra el pre-commit cuando commitees docs/10 o docs/99 (docs/.consolidacion-pendiente).
`);
    }
    console.log(`BOOT-OK ${token}`);
    console.log(hb);
    // ♻️ RE-INYECCIÓN TRAS COMPACTAR (B11 · F-17). Medido en la doc oficial de compaction (leída el
    // 2026-09-03): tras un compact el harness re-inyecta el `CLAUDE.md` de RAÍZ, pero los ficheros
    // leídos vuelven como mucho los CINCO más recientes, y uno de más de 5 000 tokens vuelve como
    // REFERENCIA, sin contenido. O sea: el arranque que §G.1 exige —`05` + `10`— puede no sobrevivir
    // al primer corte. Aquí se paga a propósito: el stdout de SessionStart SÍ entra al contexto (doc
    // oficial de hooks, misma consulta), así que en la rama `compact` se vuelven a poner los dos
    // nodos ENTEROS. No es gasto extra: es el presupuesto de arranque que el repo ya tiene medido.
    if (esCompact) {
      const nodos = ['docs/05-ESTADO-GLOBAL.md', 'docs/10-MEMORIA-CORTO-PLAZO.md'];
      let coste = 0;
      const trozos = [];
      for (const rel of nodos) {
        const p = join(ROOT, rel);
        if (!existsSync(p)) { trozos.push(`\n### ${rel} — NO EXISTE en este repo.`); continue; }
        const txt = readFileSync(p, 'utf8');
        coste += txt.length;
        trozos.push(`\n### ${rel} (${txt.length}c, re-inyectado entero)\n\n${txt.trimEnd()}`);
      }
      console.log(`\n♻️ RE-INYECCIÓN POST-COMPACT (§G.1): el harness devuelve el CLAUDE.md de raíz, pero NO garantiza \`docs/05\` ni \`docs/10\`. Van enteros aquí abajo (${coste}c — es el presupuesto de arranque, no un extra). Si aun así no los ves, LÉELOS por ruta antes de seguir.`);
      console.log(trozos.join('\n'));
    }
    if (existsSync(OUT)) {
      const ageH = (Date.now() - statSync(OUT).mtimeMs) / 3.6e6;
      if (ageH < 48) {
        console.log(`\n🕹️ HANDOFF AUTOMÁTICO de la sesión anterior (hace ${ageH.toFixed(1)}h — datos de git, no promesas):\n`);
        console.log(readFileSync(OUT, 'utf8'));
      }
    }
    const b = boveda();
    if (b && b.dirty) console.log(`\n⚠️ BÓVEDA COMPARTIDA SUCIA (M-03 §49): ${b.dirty} archivo(s) sin commitear en ${b.root} — commitea+pushea AHORA (respaldo ajeno también vale, aunque el crudo sea de otro cerebro).`);
    process.exit(0);
  }

  const b = boveda();
  // 💸 EL PAGO DEL SIDECAR (B11 · A2). El bloque de commits llegó a 26 líneas y es lo MENOS denso
  // del handoff: quien arranca necesita saber POR DÓNDE va, no el diario entero — para eso está
  // `git log`. Se recorta a 8 y se DICE cuántos había: el sidecar de falencias entra pagado, y el
  // arranque real queda por debajo de donde estaba (medido por el #2, no prometido).
  const TOPE_COMMITS = 8;
  const todos = (git(['log', '--since=24hours', '--format=- %h %s']) || '').split('\n').filter(Boolean);
  const commits = todos.length
    ? todos.slice(0, TOPE_COMMITS).join('\n') + (todos.length > TOPE_COMMITS ? `\n- … y ${todos.length - TOPE_COMMITS} commit(s) más en 24h (\`git log --since=24hours\`)` : '')
    : '- (ninguno)';
  const foto = [
    `# 🕹️ Handoff automático (escrito por hook, no por Claude) — ${new Date().toISOString()}`,
    `> Foto REAL de git al cierre/compactación. Si contradice a docs/10, ESTA es la verdad (M-01).`,
    ``,
    `- Branch: ${git(['branch', '--show-current'])} · HEAD: ${git(['log', '-1', '--format=%h · %s'])}`,
    `- Sucios sin commit: ${git(['status', '--porcelain']) || '(limpio)'}`,
    `- Bóveda (brain-private): ${b ? (b.dirty ? `⚠️ SUCIA — ${b.dirty} archivo(s) sin commitear (M-03: commitear+pushear)` : 'limpia ✅') : '(no accesible)'}`,
    ``,
    `## Últimos commits (24h · ${todos.length}, se listan ${Math.min(todos.length, TOPE_COMMITS)})`,
    commits,
  ].join('\n');
  writeFileSync(OUT, foto, 'utf8');

  // 📣 B7 · F-06 — «cierra prometiendo el siguiente paso o pidiendo un permiso ya dado».
  // MECANISMO QUE ENTREGA UNA EXHORTACIÓN, no una puerta: NO se emite `permissionDecision:"block"`
  // (eso forzaría un turno más y la fuente avisa del trade-off), sino un `systemMessage` que ve el
  // dueño + una línea en `docs/.promesas-log`. Lo medible es el LOG; la tasa de conversión —¿el
  // turno siguiente ejecuta el paso?— se mide 30 días antes de decidir si esto se queda.
  // El último texto del asistente llega en `last_assistant_message` (doc oficial de hooks, 2026-09-03:
  // «Hooks that need the final assistant text of the current turn should use `last_assistant_message`
  // on Stop and SubagentStop instead of reading the transcript»); si no viene, se cae al transcript.
  if (mode === '--end' && !process.stdin.isTTY) {
    try {
      const ev = JSON.parse(readFileSync(0, 'utf8'));
      let ultimo = typeof ev.last_assistant_message === 'string' ? ev.last_assistant_message : '';
      if (!ultimo && ev.transcript_path && existsSync(ev.transcript_path)) {
        const filas = readFileSync(ev.transcript_path, 'utf8').split('\n').filter(Boolean);
        for (let i = filas.length - 1; i >= 0 && !ultimo; i--) {
          try {
            const j = JSON.parse(filas[i]);
            if (j.type === 'assistant' && j.message && Array.isArray(j.message.content))
              ultimo = j.message.content.filter((c) => c.type === 'text').map((c) => c.text).join('\n');
          } catch { /* fila no-JSON: se salta */ }
        }
      }
      const cola = ultimo.trim().split(/\n{2,}/).pop() || '';
      const PATRONES = [
        /\bahora\s+(voy|procedo|paso|sigo|aplico|hago)\b/i, /\ba continuación\b/i,
        /\bvoy a\s/i, /\bel siguiente paso\b/i, /\bprocedo a\b/i, /\bpaso a\b/i,
        /¿\s*(aplico|procedo|sigo|continúo|lo hago|quieres que|te parece si|empiezo)\b/i,
        /\bNext,? I'?ll\b/i, /\bI'?ll (now|go ahead and|proceed)\b/i, /\bShall I\b/i,
      ];
      const pega = PATRONES.filter((re) => re.test(cola)).length;
      if (pega && cola.length < 900) {
        appendFileSync(PROMESAS, `${new Date().toISOString()}\t${pega}\t${cola.replace(/\s+/g, ' ').slice(0, 200)}\n`, 'utf8');
        process.stdout.write(JSON.stringify({
          systemMessage: '📣 F-06: el turno cierra PROMETIENDO el siguiente paso (o pidiendo un permiso ya dado) sin haberlo ejecutado. Si el paso estaba autorizado, hazlo ahora en vez de anunciarlo. [aviso, no puerta — registrado en docs/.promesas-log]',
        }));
      }
    } catch { /* sin stdin, JSON malo o transcript ilegible: el handoff ya está escrito */ }
  }

  if (mode === '--precompact') {
    // 🚩 Aquí ya NO se le habla al modelo, y esa es toda la corrección (§291). El bloque que vivía
    // aquí emitía `hookSpecificOutput`, que el esquema del harness NO admite para PreCompact: la
    // validación falla en la RAÍZ y descarta el objeto entero — `systemMessage` incluido, aunque
    // fuera válido por su cuenta. Medido: 0/15 entregas en 44 días, 5 copias byte-idénticas, y 13 de
    // los 15 fallos SIN una sola línea visible (las 2 visibles fueron `/compact` manuales).
    // Este modo pasa a DEJAR RASTRO en vez de HABLAR, y no emite JSON ninguno: cero contrato con el
    // esquema = cero forma de violarlo en silencio ([[L-73]]).
    // ⚠️ preTokens NO se registra: el contrato de PreCompact no lo entrega (la medición D8a lo sacó
    // del `compact_boundary` del transcript, que se escribe DESPUÉS). Leer stdin para buscarlo
    // arriesgaba colgar el hook 15 s por un dato que no está; el identificador del token es el HEAD.
    writeFileSync(FLAG, [
      '# 🚩 CONSOLIDACIÓN PENDIENTE — la escribió session-handoff --precompact (§291).',
      '# La orden la da el SIGUIENTE SessionStart; este fichero lo BORRA el pre-commit al commitear docs/10 o docs/99.',
      `ts=${new Date().toISOString()}`,
      `head=${git(['log', '-1', '--format=%h'])}`,
      'preTokens=n/d (el contrato PreCompact del harness no lo entrega)',
      '',
    ].join('\n'), 'utf8');
    // stdout PLANO, sin estructura: en PreCompact no entra al contexto haga lo que haga, así que no
    // se le pide que entregue nada — solo deja huella para quien lea el transcript.
    console.log('🧠 PreCompact: foto en docs/.handoff-auto.md + 🚩 flag de consolidación pendiente (la orden la dará el próximo SessionStart).');
  }
  process.exit(0);
} catch {
  process.exit(0); // jamás bloquear la sesión por el hook
}
