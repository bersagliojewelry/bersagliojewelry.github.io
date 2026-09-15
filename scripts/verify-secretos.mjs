#!/usr/bin/env node
/*
 * GATE — secretos en un repositorio PÚBLICO.
 *
 * EL DEFECTO QUE CAZA. Una credencial commiteada. En un repo privado sería un susto; aquí es una
 * publicación: `bersagliojewelry.github.io` sirve el árbol entero y GitHub lo indexa, así que una
 * clave subida está cosechada antes de que nadie la note. Y no basta con borrarla después — queda
 * en el historial de git para siempre; lo único que sirve es que NO ENTRE.
 *
 * POR QUÉ AQUÍ DUELE MÁS. Este repo mueve dinero: Wompi en el checkout, Functions con tesorería y
 * cartera, y un panel con datos de clientas reales. «NUNCA commitear secretos» es doctrina escrita
 * (CLAUDE.md §2) y hasta hoy NADA la hacía cumplir: una promesa sin mecanismo. El `.gitignore` tapa
 * los nombres que alguien previó (`*serviceAccount*.json`, `.env`, `LEGALES/`); no tapa la clave
 * pegada dentro de un `.js`, un `.md` de notas o un JSON de migración con otro nombre.
 *
 * DE DÓNDE VIENE. Réplica del gate ya probado en el repo hermano de inmobiliaria (su §262 +
 * auditoría #18, hallazgos N18-06/N18-07). Allí se midió que un barrido con PREDICADO —solo si el
 * commit toca cierta carpeta— deja pasar más de la mitad de los commits, y que recorrer el DISCO
 * saltándose los dotfiles deja CIEGO al gate sobre `.claude/`, `.github/` y los manifiestos del
 * cerebro, que sí se commitean. Este fichero nace ya con las dos correcciones puestas.
 *
 * ⚠️ LO QUE NO MIRA, A PROPÓSITO: la `apiKey` de Firebase (`AIza…`) es PÚBLICA por diseño —viaja en
 * el HTML de cualquier app web y quien protege los datos son las Rules, no ella—. Igual la
 * `pub_prod_…` de Wompi y la site key de reCAPTCHA: van en el bundle a propósito. Buscarlas daría
 * un rojo permanente contra algo correcto, y un gate que grita por lo correcto se desactiva solo en
 * la cabeza de quien lo lee. Lo que SÍ se busca es la `prv_…`, que es la que autoriza cobros.
 *
 * 🔭 DE DÓNDE SALE LA LISTA. Del ÍNDICE DE GIT (`git ls-files -z --cached --others
 * --exclude-standard`), que es exactamente la superficie de fuga: lo versionado + lo ya `git
 * add`eado + lo no ignorado, con los dotfiles DENTRO. Un fichero recién staged aparece en el acto —
 * justo el instante en que el hook tiene que verlo. El precio, aceptado: los artefactos
 * gitignoreados dejan de mirarse; no pueden commitearse, y su FUENTE sí se barre.
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1').replace(/\/$/, '');

/**
 * Carpetas fuera del barrido, cada una con su razón. Desde que la lista sale de git, las
 * gitignoreadas ya no aparecen solas y quedan aquí como cinturón: si alguna se versionara algún
 * día, la exclusión sigue siendo la decisión escrita.
 *
 * 🚫 NO está aquí, y es deliberado: `_legacy` — que en ESTE repo está versionado (9 ficheros) y por
 * tanto también se publica. Una credencial en código retirado se cosecha igual que una en código
 * vivo.
 */
const FUERA = new Set([
  'node_modules',          // dependencias: no son nuestras y su volumen ahogaría la señal
  '.git',                  // el historial se revisa con otras herramientas, no leyendo objetos
  'dist',                  // artefacto del build: si algo entró, entró por el fuente, que sí se mira
  '.firebase',             // caché del CLI de Firebase; gitignored
  '.playwright-mcp',
  '.superpowers',
  '_temp_fouronesysERP',   // clon de un ERP de TERCEROS que quedó anidado aquí; no es de Bersaglio
]);

/** Ficheros exentos, con su motivo — la única forma honesta de excluir algo. */
const EXENTOS = new Map([
  ['scripts/verify-secretos.mjs', 'este archivo: sus propios patrones se citan literalmente aquí'],
]);

/**
 * Patrones de secreto REAL. Cada uno nombra lo que es, porque el mensaje tiene que decirle a quien
 * lo lea QUÉ se le coló — no un número de línea y suerte.
 */
const PATRONES = [
  ['clave privada PEM',         /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['cuenta de servicio Google', /"type"\s*:\s*"service_account"/],
  ['token de GitHub',           /\b(?:ghp|gho|ghu|ghs|ghr)_[0-9A-Za-z]{36}\b|\bgithub_pat_[0-9A-Za-z_]{22,}/],
  ['clave de Resend',           /\bre_[0-9A-Za-z]{20,}\b/],
  ['llave PRIVADA de Wompi',    /\bprv_(?:prod|test)_[0-9A-Za-z]{20,}\b/],
  ['clave de OpenAI',           /\bsk-(?:proj-)?[0-9A-Za-z_-]{40,}\b/],
  ['clave de Anthropic',        /\bsk-ant-[0-9A-Za-z_-]{40,}\b/],
  ['clave viva de Stripe',      /\bsk_live_[0-9A-Za-z]{20,}\b/],
  ['token de Slack',            /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/],
  ['AWS access key',            /\bAKIA[0-9A-Z]{16}\b/],
];

/*
 * ⛔ 2026-09-15 (S7-01) — ESTO ERA UNA LISTA BLANCA DE EXTENSIONES, Y ESA ES LA FORMA EXACTA EN QUE
 * UN ESCÁNER DE SECRETOS MIENTE. La bóveda ya había pagado esta lección el 2026-09-08 (`0d53e30d`):
 * una auditoría adversarial plantó un token con forma real en cuatro ficheros RASTREADOS POR GIT
 * que la lista no cubría —un hook sin extensión, un `env.example`, un `.toml`, un `.patch`— y el
 * escáner salió VERDE en los cuatro. El arreglo no cruzó a los repos públicos, que son justo los
 * que publican. Medido aquí el 15-sep: en bersaglio, 57 de 623 ficheros listados por git caían en
 * el punto ciego (`.jsx`, `.css`, `.docx`, `.firebaserc`, `.env.example`).
 *
 * Ahora se escanea TODO lo que git lista salvo (a) binarios por extensión conocida y (b) lo que
 * huele a binario por CONTENIDO (un NUL en los primeros 8 KB). No es más cobertura: es otra
 * DIRECCIÓN DEL FALLO. Antes, olvidar una extensión creaba un punto ciego silencioso; ahora,
 * olvidar un binario cuesta milisegundos de lectura. Un gate de seguridad falla hacia MIRAR DE
 * MÁS. Y lo que se salta se CUENTA y se publica, causa por causa, en la línea del verde.
 *
 * `svg` NO está en la lista a propósito: es XML, lo escribe gente, y ha llevado claves.
 */
const BINARIO = /\.(png|jpe?g|gif|webp|avif|ico|bmp|tiff?|pdf|zip|gz|tgz|bz2|xz|7z|rar|woff2?|ttf|otf|eot|mp[34]|m4a|wav|ogg|webm|mov|avi|exe|dll|so|dylib|node|wasm|class|jar|bin|dat|db|sqlite3?|pyc|ds_store)$/i;

/**
 * La superficie de fuga, en rutas relativas a la raíz. `-z` (NUL como separador) porque sin él git
 * ENTRECOMILLA y escapa las rutas con acentos — y este proyecto escribe en español.
 */
function archivos() {
  let salida;
  try {
    salida = execFileSync(
      'git',
      ['-C', RAIZ, 'ls-files', '-z', '--cached', '--others', '--exclude-standard'],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
    );
  } catch (e) {
    console.error('');
    console.error('❌ verify:secretos — `git ls-files` no pudo listar el repo:');
    console.error(`   ${String(e.message).split('\n')[0]}`);
    console.error('   Falla CERRADO a propósito: sin lista, este gate no mira NADA y su ✅ sería la');
    console.error('   mentira exacta que vigila el anti-vacío de abajo. Arregla el PATH de git.');
    process.exit(1);
  }
  return salida
    .split('\0')
    .filter(Boolean)
    .filter((rel) => !rel.split('/').some((seg) => FUERA.has(seg)))
    .filter((rel) => !BINARIO.test(rel));
}

const fallos = [];
let mirados = 0;
let binarios = 0;
let exentos = 0;
let ilegibles = 0;

for (const rel of archivos()) {
  if (EXENTOS.has(rel)) { exentos++; continue; }
  let src;
  try {
    src = readFileSync(join(RAIZ, rel), 'utf8');
  } catch {
    ilegibles++;
    continue;
  }
  // Olfateo de binario por CONTENIDO, no por nombre: un NUL en los primeros 8 KB. Cubre lo que la
  // denylist de extensiones no anticipó, y sin puntos ciegos nuevos — lo saltado se CUENTA y se dice.
  if (src.slice(0, 8192).includes('\u0000')) { binarios++; continue; }
  mirados++;
  for (const [nombre, pat] of PATRONES) {
    const m = src.match(pat);
    if (!m) continue;
    const linea = src.slice(0, m.index).split('\n').length;
    fallos.push({ rel, linea, nombre });
  }
}

/*
 * ANTI-VACÍO. Un ✅ sobre cero ficheros es la forma de mentir que más veces ha cazado este cerebro:
 * si el barrido deja de encontrar el árbol —una ruta mal resuelta, un `FUERA` de más— el gate pasa
 * en verde precisamente cuando ha dejado de mirar. El umbral es holgado a propósito: no vigila un
 * número exacto, vigila que el barrido SIGA OCURRIENDO.
 * RE-MEDIDO el 5-sep-2026 tras F8 (el cerebro documental se mudó a la bóveda privada y este repo
 * quedó solo con el sitio): 337 ficheros de texto barridos (antes 819, medidos el 31-ago-2026 con
 * docs/, skills/ y el kernel dentro). El piso viejo de 400 hizo fallar el escáner en el primer
 * intento tras adelgazar: un umbral se calibra contra el árbol que existe. Piso nuevo = la mitad.
 * RE-CALIBRADO el 2026-09-15 (S7-01): con la denylist de binarios en vez de la lista blanca de
 * extensiones, el barrido pasa de 336 a 390 ficheros. El piso viejo (168) seguia pasando, pero estaba
 * medido contra un arbol que ya no es el que se escanea, y un piso calibrado bajo es justo lo que
 * deja pasar un barrido mutilado. Piso nuevo = la mitad de lo medido HOY.
 */
if (mirados < 195) {
  console.error('');
  console.error(`❌ verify:secretos — solo ${mirados} fichero(s) barridos: el escaneo dejó de ver el árbol.`);
  console.error('   Con tan pocos, un ✅ no significaría «limpio» sino «no miré». Arregla la ruta o');
  console.error('   la lista de exclusiones ANTES de creerte el verde.');
  process.exit(1);
}

if (fallos.length) {
  console.error('');
  console.error('🚨 verify:secretos — CREDENCIAL en un repositorio PÚBLICO:');
  console.error('');
  for (const f of fallos) console.error(`   ${f.rel}:${f.linea}  →  ${f.nombre}`);
  console.error('');
  console.error('   El dominio sirve este árbol y GitHub lo indexa: dala por cosechada.');
  console.error('   1) ROTA la credencial primero — borrarla del archivo no la invalida, y el');
  console.error('      historial de git la conserva para siempre.');
  console.error('   2) Luego sácala del repo: a una variable de entorno o a `firebase secrets:set`.');
  console.error('   Si es un caso legítimo, decláralo en `EXENTOS` CON SU MOTIVO escrito.');
  process.exit(1);
}

const listados = mirados + binarios + exentos + ilegibles;
console.log(`✅ verify:secretos — ${mirados} de ${listados} fichero(s) listados por git barridos con ${PATRONES.length} patrones: ninguna credencial en el repo público.`);
console.log(`   saltados ${listados - mirados}: ${binarios} binario(s) por CONTENIDO (NUL en los primeros 8 KB) · ${exentos} exento(s) declarados uno a uno CON motivo · ${ilegibles} ilegible(s). Los binarios por EXTENSIÓN ni siquiera entran en la lista (denylist \`BINARIO\`).`);
