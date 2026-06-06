# 🧪 30 — LECCIONES Y DOCTRINAS (Gotchas técnicos y recetas)

> **Nodo neuronal: Memoria Procedimental.** Se consulta on-demand ante el **Trigger de Experiencia (`CLAUDE.md §G.2`)** ANTES de realizar refactorizaciones CSS, editar el Service Worker o depurar comportamientos de renderizado.
>
> **Mantenimiento (Reflejo de Frescura §G.4)**: registrar aquí cada causa raíz confirmada de un bug complejo resuelto o doctrina visual aprobada. **Tope ~350 líneas (§G.5)**.

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
> ✅ **ACTUALIZACIÓN (2026-06-06)**: el JDK **YA está instalado** local — `C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot` (Temurin 25 LTS), solo faltaba enlazarlo. Para correr la suite local (PowerShell): `$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot"; $env:PATH="$env:JAVA_HOME\bin;$env:PATH"; npm run test:rules`. La 1ª corrida descarga el emulador (`cloud-firestore-emulator-v*.jar`). `firebase-tools` disponible vía npx (15.x). El "no hay Java local" del cerebro era **stale**.

### L-13: Reglas `validate` tolerantes a merge updates (Firestore)
En un `update`, `request.resource.data` es el estado **resultante completo** del doc (merge ya aplicado), NO solo el delta. Por eso: exige obligatorios SOLO en `create` (`d.name is string && d.name.size()>0`); en `update` valida **tipos solo-si-presente** — pero con el idiom CORRECTO `!('x' in d) || d.x is T` (ver ⚠️ abajo). Así un patch parcial (p.ej. solo `images`) y los docs legacy NO se rompen.
> ⚠️ **CORRECCIÓN (2026-06-06, verificada en emulador)**: la versión original de L-13 decía que "acceder a una clave ausente con `data.foo` devuelve `null` (no lanza)" — **ES FALSO** para `request.resource.data`: acceder a un campo AUSENTE **lanza** `Property X is undefined on object` → deny. Por eso `d.x == null || d.x is T` **revienta** cuando `x` no existe. Ese hecho erróneo generó el bug S6 (3 tests rojos = el "fallo de CI sin diagnosticar"). Idiom correcto: **`!('x' in d) || d.x is T`** (presencia primero) o `d.get('x', null)`. Caso real: S6 + CRM en `firestore.rules` + `tests/firestore-rules.test.mjs` (ADR §42). Ver **L-16**.

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

### L-15: Datos privados del negocio NUNCA al repo (sobre todo si es público)
GitHub Pages en cuentas Free sirve desde repos **públicos** → TODO el repo (incl. `docs/`) es visible en internet. Un Excel/CSV con saldos, nombres de clientes o deudas en la raíz = **fuga de datos** al commitear. Receta: `.gitignore` para `*.xlsx`/`*.xls`/`*.csv` (datos operativos ≠ código); en docs de diseño **anonimizar** nombres reales (`[Nombre]`, "Vendedora N"). Los datos reales viven LOCAL o en Firestore (privado, con reglas), nunca en el repo. Caso real (2026-06-06): el Kardex `*.xlsx` se gitignoró + el análisis se anonimizó.
