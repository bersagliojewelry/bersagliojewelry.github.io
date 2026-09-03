#!/usr/bin/env node
/**
 * guard-destructivo.mjs — hook `PreToolUse` (matcher `Bash|PowerShell`): SEGUNDA capa (B2).
 * ===========================================================================================
 * QUÉ ES, Y QUÉ NO. La capa DURA es `permissions.deny` del `.claude/settings.json` de proyecto
 * (B1): la evalúa el harness FUERA del modelo. Esto es la segunda capa, y se declara por qué NO
 * puede ser la primera — doc oficial de hooks (code.claude.com/docs/en/hooks, consultada el
 * 2026-09-03): «A timed-out `command`, `http`, or `mcp_tool` hook doesn't block the tool call.
 * The call continues through the normal permission flow, so don't count on a stalled hook to act
 * as a gate.» Un hook que se cuelga NO bloquea; una deny-list sí. Por eso van las dos, en ese
 * orden, y por eso este script es de regex puro y sub-segundo: sin red, sin `child_process`, sin
 * leer nada grande. Lo que aporta sobre B1 es lo que un patrón `Bash(...)` no sabe hacer: mirar
 * el comando ENTERO (partido por `&&`/`||`/`;`/`|`) y decidir por HOST en el egress.
 *
 * CONTRATO (doc oficial, misma consulta):
 *   - entrada: JSON por stdin con `tool_name`, `tool_input`, `cwd`, `hook_event_name`…
 *   - salida: `{"hookSpecificOutput":{"hookEventName":"PreToolUse",
 *              "permissionDecision":"deny"|"ask","permissionDecisionReason":"…"}}`
 *     y exit 0 SIN salida = «the normal permission flow applies».
 *
 * REGLA DE ORO: jamás romper la sesión. Cualquier fallo interno sale por el camino silencioso
 * (exit 0 sin JSON) — un guardián que revienta el turno se desactiva a la semana.
 *
 * SONDA (así se estrena, sin esperar a que pase de verdad):
 *   echo '{"tool_name":"Bash","tool_input":{"command":"git commit --no-verify -m x"},"cwd":"."}' \
 *     | node scripts/guard-destructivo.mjs
 */
import { readFileSync, appendFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// ── Hosts a los que SÍ se puede escribir sin preguntar. Default del kernel; un repo puede
// ampliarlo con `egressAllowlist` en su `docs/.brain-manifest.json` (clave del schema, #15).
// `*.x` = sufijo. Los locales entran siempre: un POST a localhost no sale de la máquina.
const EGRESS_DEFAULT = [
  'github.com', 'api.github.com', '*.github.com',
  '*.googleapis.com', '*.firebaseio.com',
  'wa.me', 'docs.wompi.co', '*.wompi.co',
  'platform.claude.com', 'code.claude.com', 'anthropic.com', '*.anthropic.com',
  'localhost', '127.0.0.1',
];

const salir = (decision, motivo, ctx) => {
  if (decision) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: decision,
        permissionDecisionReason: motivo,
      },
    }));
  }
  log(ctx, decision || 'pasa', motivo);
  process.exit(0);
};

// Una línea por decisión, en `docs/.guard-log` (gitignored). El contador de ese fichero es la
// medición del mecanismo: un guard con el log a CERO no ha demostrado nada todavía.
const log = (ctx, decision, motivo) => {
  try {
    if (!ctx || decision === 'pasa') return; // solo se registra lo que el guard TOCA
    const base = existsSync(join(ctx.cwd, 'docs')) ? join(ctx.cwd, 'docs') : ctx.cwd;
    appendFileSync(join(base, '.guard-log'),
      `${new Date().toISOString()}\t${decision}\t${ctx.tool}\t${String(ctx.cmd).replace(/\s+/g, ' ').slice(0, 160)}\t${motivo}\n`, 'utf8');
  } catch { /* el log jamás decide nada: si no se puede escribir, la decisión sigue en pie */ }
};

let ctx = null;
try {
  const crudo = readFileSync(0, 'utf8');           // stdin: lo entrega el harness, no bloquea
  const ev = JSON.parse(crudo);
  const tool = ev.tool_name || '';
  if (tool !== 'Bash' && tool !== 'PowerShell') process.exit(0);
  const cmd = String((ev.tool_input && ev.tool_input.command) || '');
  if (!cmd.trim()) process.exit(0);
  ctx = { cwd: ev.cwd || process.cwd(), tool, cmd };

  // Allowlist de egress: default + lo que declare el manifest del repo donde corre el hook.
  let allow = EGRESS_DEFAULT;
  try {
    const mp = join(ctx.cwd, 'docs', '.brain-manifest.json');
    if (existsSync(mp)) {
      const m = JSON.parse(readFileSync(mp, 'utf8'));
      if (Array.isArray(m.egressAllowlist) && m.egressAllowlist.length) allow = m.egressAllowlist;
    }
  } catch { /* manifest ilegible → default del kernel, y se sigue */ }

  const hostPermitido = (h) => {
    const host = h.toLowerCase();
    return allow.some((p) => (p.startsWith('*.')
      ? (host === p.slice(2) || host.endsWith(p.slice(1)))
      : host === p.toLowerCase()));
  };

  // 🩹 LO PRIMERO: FUERA LOS CUERPOS DE HEREDOC. Un heredoc es DATO, no comando — y el PRIMER
  // disparo real de este guard (2026-09-03, contra su propio commit) fue un FALSO POSITIVO: el
  // mensaje DESCRIBÍA los patrones prohibidos y el guard se bloqueó a sí mismo. Un guardián con
  // falsos positivos se desactiva en una semana, así que se arregla en el estreno, no después.
  const sinHeredoc = cmd.replace(/<<-?\s*'?"?([A-Za-z_][A-Za-z0-9_]*)'?"?[\s\S]*?^\1\s*$/gm, ' <<HEREDOC ');

  // El harness ya sabe partir por operadores para las reglas de permiso; aquí se hace igual, para
  // que `algo-inocente && rm -rf x` no se cuele por mirar solo la cabeza del comando.
  const trozos = sinHeredoc.split(/&&|\|\||;|\||\n/).map((s) => s.trim()).filter(Boolean);
  // Y CADA PATRÓN SE ANCLA AL PROGRAMA, no al texto suelto: lo peligroso es que el trozo EJECUTE
  // `git`/`rm`/`curl`, no que alguna parte del comando los NOMBRE (un `-m "…"` es prosa). Se
  // quitan antes `sudo` y las asignaciones de entorno, que es como lo lee un shell — y la doc
  // oficial de permisos avisa de lo mismo para las reglas `deny` ("matches past any leading
  // assignment"). Sin esto, el guard mide el TEXTO del comando en vez de lo que el comando HACE.
  const CABEZA = /^\s*(?:sudo\s+)?(?:[A-Za-z_][A-Za-z0-9_]*=\S*\s+)*/;
  // Y el ARGUMENTO de `-m`/`--message` se vacía: un mensaje de commit es PROSA. Lo destapó el
  // mismo estreno — `git commit -m "…por qué --no-verify está prohibido…"` se denegaba a sí
  // mismo. Solo se vacía el mensaje: el resto del comando se sigue mirando entero.
  const sinMensaje = (s) => s.replace(/(^|\s)(-m|--message)(\s+|=)("(?:[^"\\]|\\.)*"|'[^']*'|\S+)/g, '$1$2 MSG');
  const cuerpo = (t) => sinMensaje(t.replace(CABEZA, ''));

  // ── FAMILIA DESTRUCTIVA (la misma de B1; aquí sin la fragilidad del patrón por prefijo) ──────
  const DENY = [
    [/^git\b[^\n]*(\s)--no-verify(\s|$)/, 'salta los githooks (`--no-verify`): el pre-commit es el único gate duro del cerebro'],
    [/^git\b[^\n]*(\s)--no-gpg-sign(\s|$)/, '`--no-gpg-sign` sin pedido — prohibido por el router §2'],
    [/^git\b[^\n]*\s--amend(\s|$)/, 'reescribe historia ya escrita (`git commit --amend`)'],
    [/^git\b[^\n]*\bpush\b[^\n]*\s(--force|--force-with-lease|-f)(\s|=|$)/, 'push forzado: pisa historia del remoto'],
    [/^git\b[^\n]*\breset\b[^\n]*\s--hard(\s|$)/, '`git reset --hard`: tira trabajo sin papelera'],
    [/^git\b[^\n]*\bclean\b[^\n]*\s-[a-zA-Z]*f/, '`git clean -f`: borra ficheros no rastreados sin papelera'],
    [/^rm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r)\b/i, '`rm -rf`: borrado recursivo y forzado'],
    [/^rm\b[^\n]*--recursive[^\n]*--force/, '`rm --recursive --force`: la forma larga de `rm -rf`'],
    [/^git\s+config\b[^\n]*\bcore\.hooksPath\b\s*[=\s]\s*\S/, 'reapunta `core.hooksPath`: desconecta el pre-commit de este repo'],
    [/^git\s+config\b[^\n]*--unset\s+core\.hooksPath/, 'desconecta `core.hooksPath`: deja el repo sin pre-commit'],
    [/^Remove-Item\b[^\n]*-Recurse[^\n]*-Force/i, '`Remove-Item -Recurse -Force`: el `rm -rf` de PowerShell'],
    [/^Remove-Item\b[^\n]*-Force[^\n]*-Recurse/i, '`Remove-Item -Force -Recurse`: el `rm -rf` de PowerShell'],
  ];
  // GRISES: no se bloquean — se PREGUNTAN. Son destructivos con marcha atrás o con contexto.
  const ASK = [
    [/^git\s+checkout\s+--\s/, '`git checkout -- <path>` descarta cambios locales sin copia'],
    [/^git\s+restore\b(?![^\n]*--staged)/, '`git restore` descarta cambios del working tree'],
    [/^git\s+branch\s+-D\b/, '`git branch -D` borra una rama sin comprobar que esté mergeada'],
    [/^git\s+stash\s+(drop|clear)\b/, '`git stash drop/clear` tira trabajo guardado'],
    [/^rm\s+-[a-zA-Z]*r\b(?![^\n]*-[a-zA-Z]*f)/, '`rm -r` recursivo (sin `-f`)'],
  ];

  for (const t of trozos) {
    for (const [re, motivo] of DENY) if (re.test(cuerpo(t))) salir('deny', `⛔ guard-destructivo (B2): ${motivo}. Si de verdad hace falta, lo ejecuta el DUEÑO en su terminal.`, ctx);
  }

  // ── EGRESS con ESCRITURA (F-14): a un host fuera de la allowlist, se para ────────────────────
  const ESCRIBE = /(^|\s)(-d|--data|--data-raw|--data-binary|--data-urlencode|-F|--form|-T|--upload-file)(\s|=)|(^|\s)(-X|--request)\s+(POST|PUT|PATCH|DELETE)\b|(^|\s)-Method\s+(POST|PUT|PATCH|DELETE)\b|(^|\s)--method\s+(POST|PUT|PATCH|DELETE)\b/i;
  for (const t of trozos) {
    const esRed = /^(?:[\w./\\-]*[/\\])?(curl|wget|Invoke-WebRequest|Invoke-RestMethod|iwr|irm)(\s|$)/i.test(cuerpo(t));
    const esGhEscritura = /^gh\s+api\b/.test(cuerpo(t)) && (ESCRIBE.test(t) || /(^|\s)(-f|--field|--raw-field)(\s|=)/.test(t));
    if (!esRed && !esGhEscritura) continue;
    if (esRed && !ESCRIBE.test(t)) continue;                    // GET: leer no es exfiltrar
    const m = t.match(/https?:\/\/([^/\s'"`)]+)/i);
    if (!m) {
      if (esGhEscritura) {                                       // `gh api repos/...` → github
        salir('ask', `🟡 guard-destructivo (B2): escritura por \`gh api\` — confírmala. Comando: ${t.slice(0, 120)}`, ctx);
      }
      salir('ask', `🟡 guard-destructivo (B2): petición de ESCRITURA por red sin URL literal (¿variable, redirección?) — el host no se puede comprobar contra la allowlist. Confírmalo tú.`, ctx);
    }
    const host = m[1].replace(/^.*@/, '').replace(/:\d+$/, '');
    if (!hostPermitido(host)) {
      salir('deny', `⛔ guard-destructivo (B2): ESCRITURA por red a \`${host}\`, que NO está en \`egressAllowlist\` (F-14, exfiltración/prompt-injection). Si el destino es legítimo, decláralo en docs/.brain-manifest.json.`, ctx);
    }
  }

  for (const t of trozos) {
    for (const [re, motivo] of ASK) if (re.test(cuerpo(t))) salir('ask', `🟡 guard-destructivo (B2): ${motivo} — confírmalo antes de correrlo.`, ctx);
  }

  process.exit(0); // nada que decir: el flujo normal de permisos decide
} catch {
  process.exit(0); // jamás bloquear la sesión por el guard (ni siquiera por un JSON malformado)
}
