# 🧪 30 — LECCIONES Y DOCTRINAS (Gotchas técnicos y recetas)

> **Nodo neuronal: Memoria Procedimental.** Se consulta on-demand ante el **Trigger de Experiencia (`CLAUDE.md §G.2`)** ANTES de realizar refactorizaciones CSS, editar el Service Worker o depurar comportamientos de renderizado.
>
> **Mantenimiento (Reflejo de Frescura §G.4)**: registrar aquí cada causa raíz confirmada de un bug complejo resuelto o doctrina visual aprobada. **Tope ~350 líneas (§G.5)**. ⚠️ **Sobre cap de chars → plan de shard `31-LECCIONES-FIRESTORE` (L-12..L-17/L-29/L-34..L-40); aún NO creado** (auditoría §82 / H-17).

---

## 🎨 Doctrinas CSS y Principios de Diseño "Liquid Glass"

### 1. Arquitectura CSS (post-NOVO — actualizado 2026-06-05)
*   **NO existe `css/style.css`** (lo eliminó el recambio NOVO). El CSS es **modular por página**: `css/liquid-glass.css` (design system: tokens OKLCH + motion `--ease-*` + primitivas de cristal + `.reveal`), `css/components.css` (header/footer/drawers/dock `.qd-*`), y un archivo por página (`home.css`, `nosotros.css`, `contacto.css`, …).
*   **Carga por página**: critical CSS inline → `liquid-glass` → `components` → `<página>` (la de página gana por cascada).
*   **Regla de oro (rediseño)**: editar el CSS **in-place** en el archivo de su selector. NO crear capa-sombra de override (`enhancements.css`) — una sola fuente de verdad por selector.

### 2. Estética Editorial Premium
*   **Squircles suaves** (radii 12/18/24/34/48px + pill 999) — NUNCA esquinas a 0px. Botones/chips = pill; tarjetas = 24–34; hero/footer = 40–48. (La nota previa de "0px" era de una era V7 anterior, ya obsoleta.)
*   **Glassmorphism iOS 26**: `backdrop-filter: blur(28px) saturate(180%)` con pinlight superior (`--pinlight`) y borde iridiscente cónico (`--iridescent-rim`).
*   **Background Unification**: El patrón exacto es `html { background: var(--bj-pearl) }`, `body { background: transparent }` y `.bj-world { z-index: -1 }`. Si se pinta background sólido en el body, la capa de auroras `.bj-world` queda invisible.
*   **No dividers full-width**: No usar `border-top/bottom` decorativos en secciones. Si se necesitan separadores, usar `<hr>` dentro del contenedor o bordes internos de las tarjetas glass.

### 3. Tipografía (post-NOVO — actualizado)
*   **Display/Títulos**: Cormorant Garamond (`--font-display`, peso 300, itálicas) + Fraunces para el wordmark (`--font-brand`).
*   **Body/UI**: **Manrope** (`--font-ui`) — NO Inter.
*   **Numéricos/eyebrows**: **Space Mono** (`--font-mono`) con `tabular-nums` — NO JetBrains Mono.

---

## 💻 Gotchas Técnicas y Reglas de Código

### L-01: iOS Safari Scroll Lock en Drawers
Para bloquear el scroll de fondo en iOS Safari al abrir el Mobile Menu o el Cart Drawer, `overflow: hidden` es insuficiente. Se debe usar la técnica:
```js
// Bloquear
const scrollY = window.scrollY;
document.body.style.position = 'fixed';
document.body.style.width = '100%';
document.body.style.top = `-${scrollY}px`;
document.body.classList.add('menu-open');

// Desbloquear
document.body.style.position = '';
document.body.style.width = '';
document.body.style.top = '';
document.body.classList.remove('menu-open');
window.scrollTo(0, scrollY);
```

### L-02: Caché del Service Worker y Evitación de FOUC
*   La versión de caché se incrementa en `public/sw.js` (ej. `bersaglio-v3` ➔ `bersaglio-v4`).
*   Cada shell HTML incluye una sección de **Critical CSS inline** (tokens base + reset + skip-link + fade-in inicial). Sin esto, la carga asíncrona de las hojas de estilo mediante `rel="preload"` produce destellos de contenido sin estilo (FOUC).

### L-03: Renderizadores de Producto Únicos (DRY)
*   `renderPieceCardHTML(piece)` en `js/components/piece-card.js` es el **único renderizador de tarjetas de producto**.
*   Toda grilla que muestre piezas (destacados, catálogo, carrito, relacionados) DEBE usar este helper para evitar desalineación visual o duplicación de markup.

### L-04: Contrato del Header Flotante
*   El header pill flotante tiene `position: fixed; pointer-events: none` para no bloquear los clicks debajo de su área transparente lateral. El elemento interno `.header-aqua-pill` tiene `pointer-events: auto` para que el menú sí sea clickable.
*   Si se altera esta estructura, se pueden bloquear clicks en toda la parte superior del sitio web.

### L-05: Preview headless (Claude Preview MCP) no recalcula estilos dinámicos
Síntoma: tras añadir clases por JS, `getComputedStyle` devuelve el valor del snapshot inicial (incluso un `style.opacity` inline lee "0"); IntersectionObserver NO dispara; `preview_screenshot` hace timeout en páginas con mucho `backdrop-filter`. Causa: el renderer del sandbox hace UN pase de estilo inicial, sin recalc/paint en vivo. **Receta**: verificar lo dinámico (reveals, hover, scroll, IO) por CÓDIGO + estructura DOM (`preview_eval` de DOM/text/estilos-de-parse), NO por screenshot ni estilos-post-mutación. Lo visual real, en `npm run dev`/deploy.

### L-06: Reveal-on-scroll robusto (anti-invisibilidad)
`.reveal { opacity:0 }` activado solo por JS es single-point-of-failure: si el activador falla, el contenido queda invisible. `js/core/reveal.js` = IntersectionObserver primario + red de robustez (revelar lo ya visible al cargar + listener scroll/resize pasivo auto-removible) + `prefers-reduced-motion`. Patrón reusable.

### L-07: Optimizar PNG pesados del handoff antes de servir
PNG del handoff venían a 1.3–1.9 MB para mostrarse a 34–140px. `sharp` (en devDeps) → webp: emerald-gem 1833→13.5KB, cart-gems 1284→69.8KB. Receta: `sharp(src).resize(N,{fit:'inside'}).webp({quality:82})`. Borrar el PNG pesado tras migrar.

### L-08: Mirror ≠ rebuild — auditar el estado real antes de "reconstruir"
El cliente pidió "reconstruir"; la auditoría (3 agentes en paralelo) mostró que el rebuild (PLAN-NOVO) YA estaba hecho. Lección: ante "rehacer todo", auditar primero el estado real y proponer pulir > re-demoler si la base ya es sana ("invertir mejor, no gastar por gastar").

### L-09: Preview headless — los screenshots mueren con CUALQUIER blur pesado (amplía L-05)
Síntoma: `preview_screenshot` hace timeout (30s) en desktop **incluso tras desactivar `backdrop-filter`** por inyección. Causa: el `filter: blur()` de las capas decorativas (`.bj-world` aurora `blur(60px)` fija + hero blobs `blur(40-50px)`) y sobre todo el **modal email-capture que auto-abre** con backdrop `backdrop-filter: blur(8px)` a pantalla completa saturan el renderer del sandbox. Recetas: (1) el PRIMER screenshot tras carga fresca suele funcionar (antes de que el modal abra); editar un `.html` dispara reload de Vite → ventana limpia para 1 shot. (2) Para todo lo demás NO pelear con screenshots → `preview_eval`/`preview_inspect` (computed values, fiables) + lectura de CSS. (3) **Verificar fuentes sin screenshot**: medir ancho de render de un `<span>` por familia vs su fallback (si difieren >2px, la fuente está activa); `document.fonts.check()` da falsos negativos con el subsetting `unicode-range` de Google Fonts.

### L-10: El critical-CSS inline puede driftear de los tokens externos
Cada shell HTML duplica tokens en su `<style>` critical inline (radii, colores, fuentes) para evitar FOUC (L-02). Si cambias un token en `liquid-glass.css` y NO en el inline de los 12 shells, hay drift: above-the-fold usa el valor viejo hasta que carga la hoja async. Caso real (corregido en ADR §41): radii inline `10/16/22/32/44` vs sistema `12/18/24/34/48`. Receta: al tocar tokens del design-system, propágalos al critical inline de TODOS los shells — reemplazo literal por script sobre `*.html` (auto-scopear a los que contienen el valor viejo).

### L-11: Verifica el HOSTING real antes de escribir headers/CSP/redirects
`firebase.json` puede tener un bloque `hosting` (headers, rewrites) que **NO se usa** si el sitio se sirve por **GitHub Pages** (deploy vía `actions/deploy-pages`, no `firebase deploy --only hosting`). Caso real (Fase 2): la S8 "añadir CSP/headers a `firebase.json`" era **moot** — GitHub Pages ignora esos headers. En GitHub Pages, CSP/headers solo via `<meta http-equiv>` en el HTML (o un CDN delante). Receta: confirma quién sirve mirando `.github/workflows/*.yml` (`upload-pages-artifact`/`deploy-pages` = GitHub Pages) antes de tocar headers. Corolario seguridad: las **API keys web de Firebase son públicas por diseño** (van en el bundle cliente); la protección real es App Check + restricción de key + reglas, no ocultar la key.

### L-12: Testear Firestore rules sin Java local — vía CI (zero-budget)
El emulador Firestore necesita un JDK; si la máquina del dev no lo tiene, NO se pueden testear reglas localmente. Patrón zero-budget: `@firebase/rules-unit-testing` + tests con `node:test` (cero deps extra) + workflow GitHub Actions con `actions/setup-java` (Temurin, gratis en runners) que corre `firebase emulators:exec --only firestore --project demo-<x> "node --test tests/..."`. Se verifica en cada push que toque `firestore.rules`/`tests/**`, **antes** de que `firebase-deploy.yml` despliegue. Los roles que las reglas leen de `users/{uid}` se siembran con `testEnv.withSecurityRulesDisabled()`. El prefijo `--project demo-` evita necesitar credenciales reales.
> ✅ **ACTUALIZACIÓN (2026-06-06)**: el JDK YA está local (Temurin 25, `C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot`); correr `npm run test:rules` con `$env:JAVA_HOME` apuntando ahí (1ª corrida baja el emulador). El "no hay Java local" era **stale**.

### L-13: Reglas `validate` tolerantes a merge updates (Firestore)
En un `update`, `request.resource.data` es el estado **resultante completo** del doc (merge ya aplicado), NO solo el delta. Por eso: exige obligatorios SOLO en `create` (`d.name is string && d.name.size()>0`); en `update` valida **tipos solo-si-presente** — pero con el idiom CORRECTO `!('x' in d) || d.x is T` (ver ⚠️ abajo). Así un patch parcial (p.ej. solo `images`) y los docs legacy NO se rompen.
> ⚠️ **CORRECCIÓN (2026-06-06, emulador)**: en `request.resource.data`, acceder a un campo AUSENTE **lanza** (`Property X is undefined`) → `d.x == null || d.x is T` revienta. Idiom correcto: **`!('x' in d) || d.x is T`** (presencia primero) o `d.get('x', null)`. Generó el bug S6 (ADR §42). Ver **L-16**.

### L-14: NO quitar el fallback de config PÚBLICA sin confirmar que la fuente real está poblada (incidente prod 2026-06-06)
Quitar el fallback hardcodeado de las API keys **web** de Firebase (S1) **tumbó producción**. Causa: `deploy.yml` **referencia** los secrets `VITE_FIREBASE_*`, pero referenciar ≠ que estén configurados en GitHub. Si faltan, el build inyecta `undefined` → con `apiKey` undefined, inicializar Firebase **lanza en module-eval** → como casi todo importa `firebase-config.js`, **el arranque entero se cae** (shell carga; contenido + botones muertos; páginas atascadas en su pantalla de "Cargando"). Las API keys web son **públicas por diseño** → el fallback NO es riesgo de seguridad, es una **red de seguridad** (zero-budget/un dev → los secrets pueden faltar). **Doctrina**: (1) un fallback de config PÚBLICA se mantiene; (2) antes de depender solo de secrets de CI, confirmar que existen (`gh secret list` o Settings→Secrets→Actions); (3) síntoma en prod = páginas en "Cargando" + botones muertos → mira la consola del navegador (`invalid-api-key`). Fix: restaurar el fallback (`firebase-config.js`).

### L-16: Reglas de seguridad — los tests "felices" no bastan; revisar adversarialmente el PAYLOAD de create
Tests positivos (crea cliente OK, crea movimiento OK) verifican el camino feliz pero **NO** los huecos de inyección. Una revisión adversarial (workflow, 4 lentes: escalada/lectura/integridad/robustez) del CRM Bloque 1 encontró 7 huecos reales que 32 tests verdes NO cubrían. Patrones de endurecimiento (reusables en CUALQUIER regla Firestore):
- **`hasOnly` whitelist** en create: `d.keys().hasOnly([...campos permitidos...])` → bloquea campos server-only (saldos, contadores) y cualquier inyección. Lo que escribe SOLO una Cloud Function (vía Admin SDK, que bypassa reglas) **nunca** debe estar en la whitelist del cliente.
- **Campos de estado/auditoría no nacen del cliente**: en create, prohibir `anulado:true`, `anuladoPor/En`, `autorizadoPor/En`, `estado!='pendiente'` → si no, un rol de menor privilegio se auto-aprueba o manipula el cálculo derivado al crear.
- **Restringir por rol dentro del validador**: un mismo `tipo`/operación puede ser legítimo para admin pero no para un rol scoped (ej. vendedora solo `factura`/`abono`, no `apertura`/`ajuste`).
- **Multi-tenant: validar la PERTENENCIA del recurso referenciado**, no solo que el actor firme con su uid. Una solicitud sobre `clienteId` ajeno pasa si solo validas `vendedoraUid==auth.uid`; hay que `get()` el padre y comparar el dueño.
- **`list`/`query` se evalúan distinto a `get`**: testear `getDocs(collection)` sin filtro (debe FALLAR) + `query(..., where(campo,'==',uid))` (debe pasar) — el aislamiento de cartera vive ahí, no en el `get` de doc individual.
- **Robustez a campos ausentes en `get().data`**: `get(...).data.campoOpcional` revienta si falta → envolver en `('campo' in data) ? data.campo : null` (caso: cliente directo sin `vendedoraUid`). Relacionado con **L-13**.
Caso real: ADR §42 (firestore.rules CRM). Anti-anclaje: dile a los lentes lo que YA sabes para que busquen lo demás.

### L-17: Testear Cloud Functions — lógica pura (sin emulador) + integración (con emulador)
Una CF tiene dos partes con riesgos distintos; sepáralas:
- **Lógica de negocio/dinero → función PURA** en su propio módulo (ej. `functions/saldo.js` `computeSaldo(movs)`), sin Firestore. Se testea con `node --test` **sin emulador** (rápido, determinista) → ahí va la "precisión exacta como las matemáticas". Redondea a 2 decimales (`Math.round((n+EPSILON)*100)/100`) para evitar `0.1+0.2=0.30000000000000004`.
- **Glue del trigger → integración** con `firebase emulators:exec --only firestore,functions "node --test ..."`. Escribe con **firebase-admin** (en `functions/node_modules`; el test vive en `functions/` para resolverlo) — bypassa reglas; `emulators:exec` exporta `FIRESTORE_EMULATOR_HOST` → admin se conecta solo. El trigger es **async**: hacer **poll** del doc afectado hasta el valor esperado (timeout ~15s), no `assert` inmediato. Valida lo que el unit test NO puede: que el trigger registre y dispare, que `transaction.get(query)` (leer una colección en transacción, Admin SDK) funcione, y la extracción de `event.params`.
- **Recompute idempotente** (recalcular desde la fuente de verdad) > incrementar: imposible de desincronizar (el pecado del Excel con `#REF!`). El trigger escribe en un doc PADRE distinto a la subcolección que lo dispara → no hay loop.
Caso real: ADR §43 (`recalcSaldoCliente` + `functions/saldo.js`). Java local: `30 §L-12`.

### L-18: En DEV la app conecta a los emuladores Firebase → cómo verificar UI auth-gated
`firebase-config.js` conecta Auth/Firestore/Storage a los **emuladores** cuando corre en `npm run dev` (la consola lo confirma: "Connected to emulators"). Implicaciones para verificar una pantalla admin (auth + datos):
- **Verificación funcional real**: `firebase emulators:start --only firestore,auth` (JDK, `30 §L-12`) + sembrar un usuario con rol + datos, luego `npm run dev` + login. Sin emuladores corriendo, el dev queda "offline" (listeners fallan, 0 datos) — los warnings "Could not reach Cloud Firestore backend" son ESO, no un bug del código.
- **Mostrar SOLO el diseño** (sin auth/datos, p.ej. para que el cliente apruebe la dirección): crear un **mock estático** `_preview-*.html` (mismo `css/admin.css`, datos hardcodeados, sin imports de JS), renderizarlo en el preview, capturar, y BORRARLO (no commitear). Sortea el guard de auth y L-05.
- ⚠️ Screenshots del preview se **cuelgan** con el CSS de cristal del admin (L-09): la 1ª captura tras carga fresca a veces pasa; si insiste en timeout, NO pelear — describir + confiar en build/estructura + reuso de componentes ya validados. Caso real: ADR §44.

### L-19: Roles que no son jerárquicos — no forzarlos en la escala de niveles
`vendedora` NO es "más/menos que" owner/admin/editor: es un **eje distinto** (CRM scoped vs contenido web). Meterla en `ROLE_LEVELS={owner:3,admin:2,editor:1}` con nivel 1 le daría acceso a páginas de `editor` (`hasMinRole('vendedora','editor')` = 1>=1 = true → piezas/colecciones). Solución: dejarla **FUERA** de la escala (queda nivel 0 → bloqueada de las páginas jerárquicas) + un guard por **membresía exacta** `requireAuthExact(['vendedora','admin','owner'])` para sus propias páginas. Regla general: si un rol no encaja en un "≥ que" limpio, NO lo metas en la jerarquía numérica; usa allow-list exacta. (En `functions/index.js` sí está `vendedora:1` pero ahí `ROLE_LEVEL` solo valida que el CALLER tenga ≥ owner para crear usuarios — no concede acceso.) Caso: ADR §45.

### L-20: Una escritura secundaria (telemetría) no debe tumbar un flujo crítico (login)
`signIn` hacía `await setDoc({lastLogin})` en el doc del propio usuario SIN try/catch; como las reglas de `users` no dejan auto-actualizarse (solo owner/admin), una vendedora/editor era **denegada** y el LOGIN entero fallaba. Regla: una escritura **secundaria** (telemetría, contadores, lastLogin, analytics) va en **best-effort** (try/catch) — nunca bloquea el flujo principal. Corolario: si una regla restringe `users` a admin, "el usuario actualiza su propio lastLogin" choca → best-effort en cliente (elegido) o permitir self-update de campos no-sensibles en reglas. **Lo cazó el E2E con emuladores** (los tests de reglas no cubrían el write de `lastLogin` de signIn) — recordatorio de que el E2E ve lo que el unit test no. Caso: ADR §46.

### L-21: Verificar la estructura de CADA hoja de un Excel heredado (no extrapolar)
Migrando el Kardex, el supuesto "una fila = un cliente con saldo" valió para la hoja de Kary
(por cliente) pero NO para la de vendedoras (**por factura**: cada fila es una compra). El
extractor produjo basura para vendedoras: los "#REF! de clientas" eran descripciones de
producto ("Cadena", "Dije San Benito"). Solo un **volcado crudo de filas reales** lo reveló.
Regla: ante un Excel heredado/desordenado, **verifica la estructura de CADA hoja con un volcado
crudo ANTES de escribir el extractor**; no extrapoles de una hoja a otra ni confíes en un
análisis previo (el `kardex-analisis` describía la hoja de Kary y se asumió igual para todas).
Consecuencia: la hoja de vendedoras no se auto-migra → se cargan los clientes fresco. Caso: Bloque 5.

### L-15: Datos privados del negocio NUNCA al repo (sobre todo si es público)
GitHub Pages en cuentas Free sirve desde repos **públicos** → TODO el repo (incl. `docs/`) es visible en internet. Un Excel/CSV con saldos, nombres de clientes o deudas en la raíz = **fuga de datos** al commitear. Receta: `.gitignore` para `*.xlsx`/`*.xls`/`*.csv` (datos operativos ≠ código); en docs de diseño **anonimizar** nombres reales (`[Nombre]`, "Vendedora N"). Los datos reales viven LOCAL o en Firestore (privado, con reglas), nunca en el repo. Caso real (2026-06-06): el Kardex `*.xlsx` se gitignoró + el análisis se anonimizó.

### L-22: El CI de este repo NO despliega reglas/índices/functions — solo Hosting/Pages
`firebase-deploy.yml` usa `FirebaseExtended/action-hosting-deploy` = **Hosting only**; `deploy.yml` = GitHub Pages. Ambos en push a `main`. NINGUNO despliega `firestore.rules`, `firestore.indexes.json` ni Cloud Functions → **mergear a `main` NO los despliega**; hay que `firebase deploy --only firestore:rules,firestore:indexes,functions` **manual** (CLI logueado). Corolario crítico: **código en `main` ≠ desplegado** — las reglas/functions del CRM estaban en el código pero `recalcSaldoCliente` NO existía en prod (`firebase functions:list` lo confirmó) hasta el deploy manual. Verificar el estado real de prod (`functions:list` / `git fetch`), no el playbook (§3.3). Orden de lanzamiento: **desplegar functions ANTES de migrar** (el cargador hace poll esperando a `recalcSaldoCliente`). Caso: ADR §47 (corrigió un supuesto erróneo del playbook de `10`).

### L-23: Un script Admin SDK (`node`) necesita ADC — `firebase login` NO sirve
Los scripts de migración/seed (`functions/*.mjs` con `firebase-admin`) autentican por **Application Default Credentials**, no por el login del Firebase CLI. Resolución ADC: (1) `GOOGLE_APPLICATION_CREDENTIALS` → service-account JSON, o (2) `gcloud auth application-default login` (user creds; el owner del proyecto tiene permisos). Fijar quota project: `gcloud auth application-default set-quota-project <proyecto>` (evita "quota exceeded"/"API not enabled"). El test en emulador NO ejercita ADC (auth bypasseada) → ese camino queda sin verificar hasta correrlo contra prod. **Antes de la escritura irreversible**: preflight READ-ONLY (count + marca de migración) que confirma ADC y que la colección está limpia. En PowerShell, `CUTOFF=x node ...` (sintaxis bash) NO setea la var → usar `$env:CUTOFF='x'; node ...`. Caso: ADR §47.

### L-42: Sección dinámica rellenada por listener → monta SIEMPRE su `<section>` (ADR §89)
**Disparador**: una sección que se llena con datos async (onSnapshot/onChange) y puede estar vacía al primer paint. **Lección (bug Categorías)**: si `renderX()` devuelve '' sin datos, la sección NUNCA entra al DOM, y un `refreshX()` que solo ACTUALIZA (querySelector + salir si no existe) no puede CREARLA → el contenido jamás aparece (ni en vivo ni al recargar: el primer paint SIEMPRE es sin datos, `data.load()` es async). **Patrón correcto** (films/social/journal/featured): `renderX()` devuelve SIEMPRE `<section class="home-X">${xInner()}</section>`; `refreshX()` hace `mount(sec, xInner())`. La vacía se colapsa por **CSS `:empty{padding:0}`** (0px, anti-CLS), NO omitiendo el nodo. Bug latente: solo aparece al partir de CERO ítems. Desconfía de comentarios "aparecerá al recargar" sin verificar.

### L-41: Cero-ficción / hide-when-empty — defensa en profundidad, no una capa (ADR §88)
**Disparador**: una sección pública DINÁMICA se oculta si no tiene contenido real suficiente (nunca demo) + panel que avisa "¿se ve?". **Reglas** (detalle → §88): (1) **SSoT** de umbral+completitud en UN módulo (`home-sections.js`) para render+panel+tarjeta — duplicar = divergencia. (2) la regla valida al ESCRIBIR pero NO re-valida docs viejos → el **render TAMBIÉN re-filtra completitud** (un legacy incompleto se colaría si confías solo en la regla). (3) `nonEmptyStr` con **`.trim()`** (`' '.size()>0` deja publicar en blanco). (4) gate CI barrera #5 (ningún módulo de `js/home/` exporta array de items). (5) con `merge:true` la puerta cierra también en updates. Lo cazó la revisión adversarial (HIGH render-legacy + MED whitespace).

### L-40: Acciones automáticas sobre dinero — el RENDER sugiere, el CLICK re-valida (ADR §76)
**Disparador**: una UI ofrece una acción "automática" sobre dinero (rechazo de solicitud obsoleta, marcado, baja) basada en lo que se evaluó AL PINTAR la tarjeta. **Lección (verif. M2b, 3 lentes lo hallaron por separado)**: el contexto del render puede MENTIR — un fetch fallido (catch → lista null) o un `limit()` truncado es indistinguible de "el doc no existe", y un veredicto "obsoleta" calculado ahí convierte un blip de red en un rechazo one-way con código de auditoría FALSO. **Regla**: (1) toda escritura disparada por una sugerencia del render RE-LEE el doc fuente en el instante del click y re-valida (espejo del camino de aprobar, §74); (2) un fallo de carga se marca `error:true` — JAMÁS se pinta como contexto real ni habilita botones de decisión (anti rubber-stamping); (3) todo `onSnapshot` de una superficie de control lleva error-callback (un error de listen es TERMINAL: sin él, la cola muere MUDA y "roto" se ve igual que "al día"). Bonus M2b→M3: si una regla futura va a comparar asiento↔solicitud, defínela POR TIPO de solicitud — el contrato §74 hace divergir el top-level POR DISEÑO (delta neto ≠ monto del asiento).

### L-39: La UI de dinero se verifica con revisión ADVERSARIAL experta, no con clics de un no-técnico (ADR §75)
**Disparador**: verificar una UI que ESCRIBE dinero (correcciones de saldo/movimientos) antes de publicarla. **Lección**: el gate correcto NO es "el operador no-técnico hace 5 clics" (Kary es dueña no-experta; no detecta un asiento de $0 ni un doble-ajuste). Es una **revisión adversarial multi-agente por dimensiones** (conformidad con reglas DESPLEGADAS · lógica de dinero/signo · wiring/edge-cases) que TRAZA cada escritura contra las reglas reales. En M2a atrapó 2 bugs de dinero BLOQUEANTES (ajustes duplicados sin guard → doble ajuste; corregir con monto vacío → asiento de $0 silencioso) + 1 del spec (rechazo sin botón) que clics manuales jamás verían. **Patrón**: las pruebas (módulo + reglas) cubren la LÓGICA; la revisión adversarial cubre el WIRING y los caminos que producen un dato incorrecto SIN error. Claude es el experto que verifica → [[feedback_claude_experto_verifica]].

### L-39: CMS con LISTAS repetibles (`list` en singleton) → patrones, fragilidad del reindex (`reindexItemSf` PURO), cap server-side (`siteListOk`), MODELO PLANO (1 clave lógica por sección, NO agrupar por maqueta; aplanar ANTES de tener datos en prod = migración cero — consejo Gemini §P4) y guard por-ítem anti poison-pill en spec §P4.

### L-38: Reglas Firestore — guard `(A || B)` + `hasOnly` que whitelista B = estado contradictorio (ADR §72)
**Disparador**: escribir/auditar una transición de máquina de estados en `firestore.rules` con un campo condicional por estado (p.ej. `motivoRechazo` solo en 'rechazada'). **Lección**: un guard `(d.estado=='aprobada' || nonEmptyStr(d.motivoRechazo))` junto a `affectedKeys().hasOnly([...,'motivoRechazo'])` deja pasar `aprobada`+`motivoRechazo` (el disyunto izq. corta en `true`; el `hasOnly` solo limita QUÉ cambió, no QUÉ estado RESULTA) → dato internamente contradictorio que el consumidor futuro lee mal. **Idiom robusto**: atar el campo al estado por PRESENCIA — `(d.estado=='rechazada' ? nonEmptyStr(d.motivoRechazo) : !('motivoRechazo' in d))` (un estado lo EXIGE, el otro lo PROHÍBE). Usar `'campo' in d` (presencia, seguro), NO `d.campo` (lanza si ausente, L-13). El red-team W-01 (§72) lo halló por su cuenta y coincidió con el reporte de Daniel → un guard `(A||B)` con `hasOnly` que whitelista B es un anti-patrón a revisar en CADA transición.

### L-37: CI con toolchain SIN PIN = bomba de tiempo · el emulador Firestore exige Java 21 (ADR §67)
**Disparador**: CI que instala una herramienta sin versión (`npm i -g pkg`/`@latest`) y "pasa en local". **Lecciones** (detalle → §67): (1) **verde local ≠ verde en CI** — verificar el run REAL de Actions (API `actions/runs`→`conclusion`), no el playbook (§62 dio el CI por verde sin que pasara nunca; pariente de L-26/L-27). (2) el emulador Firestore de firebase-tools 15.x exige **Java 21** (class file 65.0); con 17 → `UnsupportedClassVersionError` y `emulators:exec` sale **exit 1 ANTES de los tests** (el exit code no distingue "no arrancó" de "test rojo" — leer el log). Fix: `setup-java 21`. (3) `emulators:exec` que falla SIEMPRE desde una FECHA, en cualquier commit = regresión por dependencia flotante (v15 subió el piso de Java de un día para otro). **Regla: PIN de las herramientas del CI** (`firebase-tools@15.18.0`). (4) el requisito de Java sube con el tiempo; revisar al actualizar.

### L-36: "Desactivar" debe DESHABILITAR la cuenta de Auth — un campo en un doc NO es una credencial (ADR §66)
**Disparador**: botón "Desactivar usuario" / soft-delete que marca `active:false`. **Lección** (detalle → §66): marcar un campo NO bloquea el acceso — Auth sigue emitiendo tokens y el "desactivado" entra con su rol. **El bloqueo DURO es `getAuth().updateUser(uid,{disabled:true})`** (CF con Admin SDK): `disabled` no puede `signIn` (`auth/user-disabled`) ni refrescar. El panel debe llamar la CF (única que toca Auth); el check cliente de `active` en `requireAuth` es **defensa en profundidad**, no frontera. Corolario: si la página es `requireAuth('owner')`, las reglas de `users/` = **owner-only** en write. Relacionado [[L-35]].

### L-35: Custom claims de Firebase — el espejo doc→claim es un RECONCILIADOR, no un copista (ADR §65)
**Disparador**: mover el rol de `users/{uid}.role` a un custom claim. **Lecciones (rev. adversarial 19 ag., 2 ALTA · detalle → §65)**: (1) **la frontera es donde ESCRIBE el cliente**: si el panel escribe `users/{uid}` DIRECTO, las REGLAS son la única frontera → validar `role` ahí (whitelist `role in ['admin','editor']`; no acuñar owner ni degradarlo). Una CF con guardas no protege un camino que no pasa por ella. (2) **el claim TIENE PRECEDENCIA y persiste** (uno malo no se auto-corrige al refrescar) → trigger espejo **convergente**: derivar del **doc actual** (no de `event.data.after`) y comparar con Auth antes de escribir → idempotente ante entrega at-least-once sin orden; `retry:true` + capturar `auth/user-not-found`. (3) `setCustomUserClaims(uid,null)` **arrasa TODO** el mapa de claims. (4) degradar el rol NO invalida el token vigente (≤1h) → `revokeRefreshTokens` para corte real. (5) orden de deploy: functions→backfill→rules→preflight. (6) script ADC de backfill: guardia anti-`*_EMULATOR_HOST` + abortar ante error transitorio (no reportar éxito falso).

### L-34: Transacciones Firestore y esc() en atributos — grietas que la revisión adversarial cazó (ADR §64)
**Disparador**: callback de `runTransaction` o interpolar texto en atributo HTML del panel. **Lecciones (rev. F6 frente D, 24 ag. · detalle → §64)**: (1) el callback de `runTransaction` se RE-EJECUTA en contención → **resetear al inicio de cada intento todo estado capturado fuera** (un `let` externo devolvió saldo fantasma). (2) `esc()` que solo escapa `&<>` es insuficiente en atributo (`title="${esc(x)}"`): una comilla cierra el atributo = inyección — el `esc()` de `shared.js` ya escapa `"`/`'` (no crear escapes locales). (3) validar que un docId no traiga `/` antes de `.doc()` (ruta con barras = otro doc). (4) `orderBy` de UN campo usa índice automático; la doctrina anti-índices (L-29) es para `where`+`orderBy` COMBINADOS; sin `orderBy` un `limit()` trunca docs arbitrarios. **EXT (CMS)**: `esc()`=contexto-HTML; **href/src exigen `safeUrl()`**; `style=`/`url()` no lo cubre nadie (allow-list/numérico, p.ej. `--cat-hue`). **Auditar TODO renderer del ADMIN con href/src que use solo `esc()`** (caso `colecciones.js:53` bannerUrl en `<a href>` sin safeUrl = stored-XSS admin). Fix `esc(safeUrl(x))`.

### L-33: firebase CLI multi-cuenta — deploy con 403 "caller does not have permission" = cuenta activa equivocada
**Disparador**: `firebase deploy` (o el MCP de Firebase) falla con 403 en cualquier API de Google (firebaserules, etc.). **Lección (ADR §59)**: esta máquina alterna 3 proyectos (cars / inmobiliaria / bersaglio) con cuentas Google distintas y el CLI guarda UNA cuenta activa — una sesión en otro repo la cambia. ANTES de diagnosticar permisos/IAM: `firebase login:list` → si la activa no es la del proyecto, `firebase login:use <cuenta>` (fija el default POR DIRECTORIO → la cura persiste y previene la recaída en los 3 repos). El 403 de deploy en este setup casi nunca es IAM real: es la cuenta.

### L-32: App Check "no válidas" 96-100% — leer el CUERPO del 403, no adivinar (caso resuelto: API key restringida)
**Disparador**: monitor de App Check en 0% verificadas tras desplegar el SDK. **Lección (ADR §57→§58)**: "clientes desactualizados" = falta token (caché → eso SÍ es propagación); "**no válidas**" = token presente pero RECHAZADO (el SDK web manda token dummy si su canje falla) → misconfiguración real, NUNCA propagación. **Receta verificada**: (1) red del navegador → `exchangeRecaptchaV3Token` 403; (2) NO encadenar hipótesis: replicar el canje a mano y leer el **CUERPO** del error — `grecaptcha.execute(0, {action:'fire_app_check'})` (el SDK renderiza un widget invisible; ejecutar por **widgetId**, NO por site key — por site key da el falso negativo "Invalid site key") + POST con `{'recaptcha_v3_token': token}`; (3) el body dicta el fix: **`API_KEY_SERVICE_BLOCKED`** = la API key del navegador tiene allowlist de APIs SIN "Firebase App Check API" (caso real: el hardening Tier A restringió la key a 6 APIs ANTES de instalar App Check §54) → GCP→Credenciales→key→Restricciones de API→añadir la API (~5 min propagación, cero código); `App attestation failed` = secreto/tipo de llave/dominio mal registrados. **Meta-regla: al instalar CUALQUIER servicio Google nuevo, revisar las API restrictions de la key PRIMERO.** PROHIBIDO Enforce hasta ~100% verificadas ×7 días.

### L-30: App Check directo (sobre Firestore) cierra denial-of-wallet con UN init — no reescribas los forms
**Disparador**: cerrar el hueco de escritura pública (`create:if true` + apiKey pública → spam masivo agota cuota/factura) en F6 (ADR §54). **Lección**: la forma proporcionada NO es reescribir cada formulario público a una Cloud Function callable (el plan inicial del workflow) — eso es defensa-en-profundidad posterior (dedup/rate-limit). El **core fix** es **App Check sobre Firestore directo**: `initializeAppCheck(app,{provider:ReCaptchaV3Provider(key)})` en UN punto (`firebase-config.js` cubre público + admin) → el SDK adjunta un token a CADA petición → los bots quedan fuera, **sin tocar forms ni reglas**. Claves del rollout sin romper prod: (1) **gatear por la key** (`VITE_RECAPTCHA_SITE_KEY` ausente → no-op, sitio vivo — misma red que el fallback L-14); (2) **skip en dev** (emuladores se romperían); (3) el `init` **NO bloquea nada** por sí solo (solo adjunta token) — el bloqueo es el **Enforcement** de la consola; (4) **monitor→enforce**: activar enforcement solo tras ver en el monitor que el tráfico legítimo ya llega tokenizado. Acción de consola (Daniel): registrar reCAPTCHA v3 + secret del build + enforcement. **Regla**: cierra el hueco con la pieza mínima que lo cierra; la robustez extra (CF ingestion) es follow-up.

### L-29: Aging/mora "en vivo" sin infra nueva — FIFO puro + collectionGroup filter-free + fecha round-trip
**Disparador**: derivar antigüedad/mora de una cartera (cuentas por cobrar) sobre un saldo desnormalizado. **Lecciones** (ADR §51): (1) la mora se calcula **al leer** con un helper PURO espejo del saldo (FIFO: créditos contra cargos del más viejo al más nuevo; envejecer el pendiente desde `fecha+plazo`) → **cero** Cloud Function/scheduler/denormalización; la materialización (`diasVencido` en el doc + recompute diario) solo hace falta a escala (difiérela). (2) Para la mora de una **lista** hace falta TODO el set de movimientos → `collectionGroup('movimientos')` **sin filtros (solo `limit`)** → NO requiere índice compuesto (un índice faltante = `FAILED_PRECONDITION` = pantalla en blanco en prod); añadir un `where`/`orderBy` OBLIGA a declarar el índice. Requiere un match de reglas `/{path=**}/movimientos/{id}` (el match anidado NO autoriza collectionGroup). (3) Usar el **mismo origen** (los movimientos, vía listener) para saldo y vencido evita que se desincronicen en una vista de dinero. (4) `'YYYY-MM-DD'` que pasa un regex NO es una fecha válida: `Date.UTC(2026,12,45)` la **envuelve** en silencio (→ 2027-02-14) → validar **round-trip** (los componentes UTC deben coincidir) y caer a "sin fecha" si no. **Regla**: la antigüedad es derivable y barata; no la materialices hasta que la escala lo exija (Consejo §16). Relacionado: **L-28** (menos máquina), **L-22** (deploy de reglas/índices = manual). **EXT (§78)**: otra trampa de calendario JS — `setMonth(mes-1)` sobre un día 29-31 "normaliza" hacia ADELANTE y devuelve el mes EN CURSO; toda aritmética de "mes anterior/siguiente" se ANCLA al día 1 (`new Date(y, m-1, 1)`) ANTES de desplazar, o quema docs inmutables con el período equivocado justo en los cierres.

### L-28: El Consejo Externo puede SIMPLIFICAR — a veces lo correcto es menos máquina, no más
**Disparador**: cerrar un diseño de datos tras un red-team interno que pidió hardening (saldo incremental, backfill Money, async + reconciliación). **Lección**: Gemini 3.1 Pro (Consejo Externo, ADR §50) refutó parte de eso para la escala real (344 clientes): saldo **síncrono O(M)** dentro de la transacción (no incremental + cronjob), **sin backfill** (el COP ya es entero exacto en JS; migrar $506M cuadrados = riesgo), DIAN por **Adapter** (no acoplar el schema a UBL). Resultado: más simple y más correcto. **Regla**: una 2ª opinión adversarial no solo añade rigor — puede QUITAR sobre-ingeniería. Evaluar como peer review (adoptar/refutar **con razón**, p.ej. se refutó `x10000`/`decimal.js`), nunca acatar ni descartar en bloque (§G.2 + `docs/15`). **EXT (CMS WYSIWYG, 2026-06-15)**: el consejo externo también puede CONFIRMAR sumar complejidad — Gemini recomendó **iframe** (que mi comité había descartado) y lo ADOPTÉ, pero por las razones VERIFICADAS en código (la página del preview no carga el CSS público → `<div>`=bleed inverso; fidelidad pixel; "ver en móvil"), **refutando** su justificación (alarma "Game Over": el editor es único y de confianza, el vector XSS real estaba FUERA del preview). *Peer review = adoptar la conclusión por TU evidencia, no por la retórica del modelo.*

### L-31: Kernel del cerebro compartido ×3 — escape del pre-commit + salvamento de deliberaciones por transcript *(renumerada 2026-06-09: era L-28 duplicada)*
**Disparador**: el `brain-check.mjs` (kernel byte-idéntico en los 3 repos) corre en pre-commit; tocas el kernel o pierdes una deliberación sin capturar. **Lección (comité v6, 2026-06-09)**: (1) un kernel con bug bloquea los pre-commit de los 3 repos a la vez (blast radius ×3) → SIEMPRE probar el candidato contra los 3 ANTES de propagar (copia temporal + correr); diagnóstico primero (`node scripts/brain-check.mjs` suelto); `git commit --no-verify` SOLO con pedido explícito del cliente. (2) Una deliberación (comité/workflow) que cerró sin capturarse NO está perdida: el harness persiste transcripts por-máquina en `~/.claude/projects/<proyecto>/<sesión>/` → localizar por fecha, extraer el crudo, archivar en `archiveDir` (manifest) + síntesis retroactiva. Prevención: PRIMER acto tras un workflow = copiar el resultado al `archiveDir`. **(3) Escritor ÚNICO del kernel (dueño 2026-06-15)**: SOLO cars-operador escribe `brain-check/diff.mjs` + la §G cross-repo; bersaglio = dominio de su instancia (`05`/`10`/`30`/lóbulos)+app, NO toca el kernel (editarlo → peer-hash #11 ROJO ×3). Cambio de kernel desde bersaglio → vía el dueño a cars, que lo origina y propaga byte-idéntico ×3 (caso: git-gate H-06/TODO-22).

### L-27: Verificar el REPO tras un subagente — no fiarse del reporte (truncado/socket/pasos omitidos)
**Disparador**: ejecutar un plan con subagentes (F-CHASIS-A, ADR §50). **Lección**: 3 incidentes en una sesión — un subagente reportó progreso pero su salida se **truncó** y NO llegó a commitear ni añadió el script a `package.json`; otro murió por **socket closed** (0 cambios persistidos); un tercero requirió contraste. **Regla**: tras CADA subagente, el controlador VERIFICA en el repo real (`git log`/`git status`, Grep, build, tests) ANTES de marcar la tarea hecha — el reporte es pista, no evidencia (§3.3). Bonus: `grep` de Bash con `\|` dio **falso negativo** buscando un hex; usar la herramienta **Grep** (ripgrep), no `grep` por shell, para checks de verdad/ausencia.

### L-26: Daniel mergea Desarrollo→main por PR en GitHub durante la sesión — `git fetch` SIEMPRE
Dos veces (lanzamiento PR #189; Fase R PR #191) `origin/main` avanzó **solo** mientras yo trabajaba: Daniel ve los commits en `Desarrollo` y mergea el PR en GitHub. Implicación: el estado de `main`/deploy NO es lo que dice mi ref local → `git fetch` antes de afirmar nada (§3.3). El **sitio** se despliega por ese merge (CI on-push-a-main), pero **reglas/functions NO** (L-22) → esas las despliego yo a mano. Patrón: yo commiteo en `Desarrollo` (conviene pushear para que él vea/mergee el PR); el merge a `main` + deploy del sitio lo dispara su PR; el deploy de reglas/functions es manual mío. Caso: ADR §47, §49. **EXT (§75)**: Daniel puede mergear `Desarrollo→main` ANTES de que termines de verificar → publica UI con bugs (caso PR #223: M2a con 2 bugs de dinero antes de mis fixes). **UI de dinero: verificar ANTES de pushear a `Desarrollo` o avisar "no mergees aún"; tras su merge, comprobar el bundle EN PROD y rushear el fix.**

### L-25: Subir un major de dependencia crítica — verificar, no asumir (firebase-functions v6→v7)
Para actualizar un major de una dep que corre en prod (functions con dinero real): (1) el **`package.json` instalado** en `node_modules` es fuente AUTORITATIVA offline de `engines` (Node mín) + `peerDependencies` (compat) + `exports` (subpaths/imports válidos) — para esas preguntas no hace falta el changelog; (2) el **test de integración con emulador** prueba "¿funciona nuestro código con vX?" mejor que leer notas de versión (carga las functions igual que el deploy y ejercita el trigger); (3) **smoke test en prod** tras desplegar (doc temp marcado + cleanup) confirma que el trigger dispara de verdad; (4) si un agente de research queda sin red, NO inventar el changelog (§3.3) — usar el paquete instalado + WebFetch del release oficial. firebase-functions v7 solo cambió: Node mín 18, quita `functions.config()`, renombra v1 Event→LegacyEvent; la API v2 (onCall/HttpsError/onDocument*) NO cambió. Relacionado con **L-17** (testing de CFs). Caso: ADR §48.

### L-24: Verificar SIEMPRE los datos tras una migración (la fila "TOTAL" del Excel se cuela)
La hoja de Kary traía una fila **"TOTAL"** (suma de la columna de saldos) que el extractor metió como un cliente más → la cartera salió **al doble** ($1.012M vs $506M real); la fila TOTAL aparecía como el saldo #1. Receta: tras migrar, **leer cartera total + top-N saldos + conteos**; una fila de totales se delata porque su saldo ≈ la suma de los demás. Filtro defensivo en el extractor (`NON_CLIENT_RE`, anclado al inicio para no tocar nombres reales). **Y testear el regex con casos**: el primer intento `totales?` exigía "totale" y NO matcheaba "TOTAL" (lo correcto: `total(es)?`) — un regex sin probar es una suposición (§3.3). Caso: ADR §47 (se borró la fila de prod).

---

## 🧠 Meta-lecciones del cerebro/proceso (M-NN) — detalle → ADR §82

> Cómo opera/falla el cerebro mismo (Reflejo de Autocrítica §G.4). 1ª auditoría semántica con artefacto = ADR §82.

### M-01: No imprimir un campo de estado del manifest como "hecho" sin gate que verifique su artefacto
`brain:check` anunciaba "auditoría 2026-06-09" (de `deepAudit.last`) sin tabla de hallazgos = fachada → aplica la Regla de ADMISIÓN al propio linter. Detalle → ADR §82.

### M-02: Una lección sobre estado verificable-por-comando (git/build) debe volverse GATE, no prosa [HONOR]
`05` repitió "==main" falso pese a L-26 porque NINGÚN gate lee git (→ TODO-22).

### M-03: Un campo `last` de tracking nace null/baseline, nunca con fecha que finja una ejecución
§56 selló `deepAudit.last=2026-06-09` (instalación) sin corrida → fachada (rel. M-01).

### M-04: La memoria del harness deriva en silencio (fuera de `docs/`, el linter no la cubre)
Ruta de repo stale tras mudanza + memoria de 72d que contradecía la gobernanza → necesita repaso de frescura propio.

### M-05: Edité un subsistema bajo UNA lente y lo di por bueno sin probar el camino vivo (§89)
Di `categories.js` por OK con la lente cero-ficción sin probar el **estado-cero** del camino vivo (*"1ª categoría → ¿aparece?"*). Causa técnica [[L-42]]; meta-falla de PROCESO → reflejo CAZA-BUGS / **W-10**; gate real = test estado-cero ([HONOR]). Detalle → ADR §90.
