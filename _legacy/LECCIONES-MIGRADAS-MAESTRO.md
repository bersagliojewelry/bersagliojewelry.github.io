# 🗄️ Lecciones MIGRADAS AL CEREBRO MAESTRO — cuarentena §G.4 (cuerpo íntegro)

> Estas lecciones **no se han perdido ni se han editado**: su cuerpo íntegro está aquí y su copia
> consultable vive en el maestro (`brain-private/maestro/lecciones/migradas/BERS/<ID>.md`), donde
> se lee desde CUALQUIER proyecto. En `docs/30-LECCIONES.md` sigue su titular —que es lo que hace
> resolver cualquier `[[L-NN]]` del repo— y allí mismo —o en `35`, para `L-84`— queda su stub con el puntero a este fichero.
>
> **Para qué sirve este fichero**: es el punto de retorno. El ABORT del lote reconstruye el cuerpo
> DESDE AQUÍ, a propósito y no con `git checkout` — un checkout restaura blobs de git y no probaría
> nada del mecanismo (`brain-private/cerebro-maestro/ENSAYO-ROLLBACK-F2.md §5`).

> Lote 2 · migrado 2026-09-01 · 3 lecciones.

---

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · pagada en BERS «2026-04-05 · Fix V2: auditoría profunda touch scroll» (esa era del 99 no numera §) y reaplicada en el cart drawer («2026-04-28 · POLISH SESSION», ítem 2) · migrado 2026-09-01 lote 2

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

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · pagada en BERS §181 (traslado duplicado $5.6M + auditoría anti-fugas de los 4 libros) · migrado 2026-09-01 lote 2

### L-83: Dinero + listeners = jamás decidir en automático sobre foto incompleta (traslado duplicado $5.6M)
(1) Decisión AUTOMÁTICA de dinero exige "fuentes listas" — o mejor: agregado denormalizado en UN doc (CF, misma tx = foto atómica); (2) deshacer netea TODAS las vistas del mismo peso (la reversa arreglaba la bóveda pero no el cierre del turno → +$11.2M sellado); (3) formateadores jamás recortan anomalías (`Math.max(0,x)` mudó −$5.4M en "$0"). Método → skill `auditoria-financiera`; checklist → `caza-bugs §2b`. Caso: ADR §181.

> Origen: BERS `docs/35-LECCIONES-DINERO.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §193 (TODO-79: los rechazos de las CF llegan con su motivo real) · migrado 2026-09-01 lote 2

### L-84: El `code` de un callable llega PREFIJADO — toda tabla por `code` falla en SILENCIO (TODO-79)

El SDK de callables entrega `err.code = 'functions/failed-precondition'`, no `'failed-precondition'`.
Consecuencia real en Bersaglio: la tabla `ERROR_MESSAGES` y los `BUSINESS_ERR.includes(err.code)`
repetidos en 6 módulos del panel NUNCA acertaron → **todo rechazo de negocio de una CF se mostró como
el genérico "Ocurrió un error"** durante meses, incluidos los de DINERO (el microcopy "qué pasó + qué
pasó con la plata + qué hacer" se perdía justo donde más importa, y empuja a la usuaria a reintentar a
ciegas o a mentirle al sistema). Lo cazó el E2E de D6 (F-TESORERÍA B5), no los tests.
Doctrina: **normaliza el code en UN solo lugar** y prefiere el `message` del servidor cuando el
rechazo es de negocio Y viene de un callable — pero jamás para `internal`/`unknown` (traza técnica)
ni para el `permission-denied` de las REGLAS de Firestore (su message es "Missing or insufficient
permissions", ruido). Fix central en `js/admin/error-format.js` (`errorMessage`), cero churn de
callsites: la condición prefijada seguía dando falso, así que el arreglo va en la rama a la que
SIEMPRE se cae. Corolario portable: un helper puro atrapado dentro de un módulo con DOM/SDK es un
helper sin test → extraerlo (`*-format.js`) es parte del fix.

---

> Lote 9 · migrado 2026-09-01 · 1 lección.

---

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · §155 es el único §NN que cita su cuerpo (allí se refutó «la caja no cabe en el header» con esta receta) · migrado 2026-09-01 lote 9

### L-05: Preview headless (Claude Preview MCP) no recalcula estilos dinámicos
Síntoma: `getComputedStyle` da el snapshot inicial; IntersectionObserver y **`requestAnimationFrame` NO disparan si la pestaña está `hidden`** (→ el código en rAF, p.ej. wiring, no auto-corre; `renderAll()` síncrono SÍ pinta); `preview_screenshot` hace timeout. **Receta**: verifica lo dinámico por CÓDIGO + DOM (`preview_eval`) o invoca el handler a mano (`import()`+call); **layout/fit** con `preview_resize` + `scrollWidth-clientWidth`/`getBoundingClientRect`/`getComputedStyle.display` (determinista, sin captura — así se refutó "la caja no cabe en el header", §155); NO por screenshot ni post-mutación. Lo visual real, en `npm run dev`/deploy.

---

> Lote 10 · migrado 2026-09-02 · 20 lecciones.

---

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · sin §NN de ADR: su cuerpo no cita ninguno · migrado 2026-09-02 lote 10

### L-06: Reveal-on-scroll robusto (anti-invisibilidad)
`.reveal { opacity:0 }` activado solo por JS es single-point-of-failure: si el activador falla, el contenido queda invisible. `js/core/reveal.js` = IntersectionObserver primario + red de robustez (revelar lo ya visible al cargar + listener scroll/resize pasivo auto-removible) + `prefers-reduced-motion`. Patrón reusable.

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · sin §NN de ADR: su cuerpo no cita ninguno · migrado 2026-09-02 lote 10

### L-07: Optimizar PNG pesados del handoff antes de servir
PNG del handoff venían a 1.3–1.9 MB para mostrarse a 34–140px. `sharp` (en devDeps) → webp: emerald-gem 1833→13.5KB, cart-gems 1284→69.8KB. Receta: `sharp(src).resize(N,{fit:'inside'}).webp({quality:82})`. Borrar el PNG pesado tras migrar.

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · sin §NN de ADR: su cuerpo no cita ninguno (ancla el caso en el rebuild PLAN-NOVO) · migrado 2026-09-02 lote 10

### L-08: Mirror ≠ rebuild — auditar el estado real antes de "reconstruir"
Ante "rehacer todo", auditar primero el estado real (el rebuild PLAN-NOVO YA estaba hecho); pulir > re-demoler si la base es sana ("invertir mejor, no gastar por gastar").

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · sin §NN de ADR: su cuerpo no cita ninguno · migrado 2026-09-02 lote 10

### L-09: Preview headless — los screenshots mueren con CUALQUIER blur pesado (amplía L-05)
Síntoma: `preview_screenshot` hace timeout (30s) en desktop **incluso tras desactivar `backdrop-filter`** por inyección. Causa: el `filter: blur()` de las capas decorativas (`.bj-world` aurora `blur(60px)` fija + hero blobs `blur(40-50px)`) y sobre todo el **modal email-capture que auto-abre** con backdrop `backdrop-filter: blur(8px)` a pantalla completa saturan el renderer del sandbox. Recetas: (1) el PRIMER screenshot tras carga fresca suele funcionar (antes de que el modal abra); editar un `.html` dispara reload de Vite → ventana limpia para 1 shot. (2) Para todo lo demás NO pelear con screenshots → `preview_eval`/`preview_inspect` (computed values, fiables) + lectura de CSS. (3) **Verificar fuentes sin screenshot**: medir ancho de render de un `<span>` por familia vs su fallback (si difieren >2px, la fuente está activa); `document.fonts.check()` da falsos negativos con el subsetting `unicode-range` de Google Fonts.

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · pagada en BERS §41 (los radii del critical inline habían driftado del design-system) · migrado 2026-09-02 lote 10

### L-10: El critical-CSS inline puede driftear de los tokens externos
Cada shell HTML duplica tokens en su `<style>` critical inline (radii, colores, fuentes) para evitar FOUC (L-02). Si cambias un token en `liquid-glass.css` y NO en el inline de los 12 shells, hay drift: above-the-fold usa el valor viejo hasta que carga la hoja async. Caso real (corregido en ADR §41): radii inline `10/16/22/32/44` vs sistema `12/18/24/34/48`. Receta: al tocar tokens del design-system, propágalos al critical inline de TODOS los shells — reemplazo literal por script sobre `*.html` (auto-scopear a los que contienen el valor viejo).

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · sin §NN de ADR: su cuerpo ancla el caso en «Fase 2» (la S8 de CSP/headers que resultó moot) · migrado 2026-09-02 lote 10

### L-11: Verifica el HOSTING real antes de escribir headers/CSP/redirects
`firebase.json` puede tener un bloque `hosting` (headers, rewrites) que **NO se usa** si el sitio se sirve por **GitHub Pages** (deploy vía `actions/deploy-pages`, no `firebase deploy --only hosting`). Caso real (Fase 2): la S8 "añadir CSP/headers a `firebase.json`" era **moot** — GitHub Pages ignora esos headers. En GitHub Pages, CSP/headers solo via `<meta http-equiv>` en el HTML (o un CDN delante). Receta: confirma quién sirve mirando `.github/workflows/*.yml` (`upload-pages-artifact`/`deploy-pages` = GitHub Pages) antes de tocar headers. Corolario seguridad: las **API keys web de Firebase son públicas por diseño** (van en el bundle cliente); la protección real es App Check + restricción de key + reglas, no ocultar la key.

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · sin §NN de ADR: su cuerpo ancla el caso en 2026-06-06 (el Kardex `*.xlsx` gitignorado) · migrado 2026-09-02 lote 10

### L-15: Datos privados del negocio NUNCA al repo (sobre todo si es público)
GitHub Pages en cuentas Free sirve desde repos **públicos** → TODO el repo (incl. `docs/`) es visible en internet. Un Excel/CSV con saldos, nombres de clientes o deudas en la raíz = **fuga de datos** al commitear. Receta: `.gitignore` para `*.xlsx`/`*.xls`/`*.csv` (datos operativos ≠ código); en docs de diseño **anonimizar** nombres reales (`[Nombre]`, "Vendedora N"). Los datos reales viven LOCAL o en Firestore (privado, con reglas), nunca en el repo. Caso real (2026-06-06): el Kardex `*.xlsx` se gitignoró + el análisis se anonimizó.

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · pagada en BERS §44 · migrado 2026-09-02 lote 10

### L-18: En DEV la app conecta a los emuladores Firebase → cómo verificar UI auth-gated
`firebase-config.js` conecta Auth/Firestore/Storage a los **emuladores** cuando corre en `npm run dev` (la consola lo confirma: "Connected to emulators"). Implicaciones para verificar una pantalla admin (auth + datos):
- **Verificación funcional real**: `firebase emulators:start --only firestore,auth` (JDK, `30 §L-12`) + sembrar un usuario con rol + datos, luego `npm run dev` + login. Sin emuladores corriendo, el dev queda "offline" (listeners fallan, 0 datos) — los warnings "Could not reach Cloud Firestore backend" son ESO, no un bug del código.
- **Mostrar SOLO el diseño** (sin auth/datos, p.ej. para que el cliente apruebe la dirección): crear un **mock estático** `_preview-*.html` (mismo `css/admin.css`, datos hardcodeados, sin imports de JS), renderizarlo en el preview, capturar, y BORRARLO (no commitear). Sortea el guard de auth y L-05.
- ⚠️ Screenshots del preview se **cuelgan** con el CSS de cristal del admin (L-09): la 1ª captura tras carga fresca a veces pasa; si insiste en timeout, NO pelear — describir + confiar en build/estructura + reuso de componentes ya validados. Caso real: ADR §44.

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · pagada en BERS §45 · migrado 2026-09-02 lote 10

### L-19: Roles que no son jerárquicos — no forzarlos en la escala de niveles
`vendedora` NO es "más/menos que" owner/admin/editor: es un **eje distinto** (CRM scoped vs contenido web). Meterla en `ROLE_LEVELS={owner:3,admin:2,editor:1}` con nivel 1 le daría acceso a páginas de `editor` (`hasMinRole('vendedora','editor')` = 1>=1 = true → piezas/colecciones). Solución: dejarla **FUERA** de la escala (queda nivel 0 → bloqueada de las páginas jerárquicas) + un guard por **membresía exacta** `requireAuthExact(['vendedora','admin','owner'])` para sus propias páginas. Regla general: si un rol no encaja en un "≥ que" limpio, NO lo metas en la jerarquía numérica; usa allow-list exacta. (En `functions/index.js` sí está `vendedora:1` pero ahí `ROLE_LEVEL` solo valida que el CALLER tenga ≥ owner para crear usuarios — no concede acceso.) Caso: ADR §45.

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · pagada en BERS §46 · migrado 2026-09-02 lote 10

### L-20: Una escritura secundaria (telemetría) no debe tumbar un flujo crítico (login)
`signIn` hacía `await setDoc({lastLogin})` en el doc del propio usuario SIN try/catch; como las reglas de `users` no dejan auto-actualizarse (solo owner/admin), una vendedora/editor era **denegada** y el LOGIN entero fallaba. Regla: una escritura **secundaria** (telemetría, contadores, lastLogin, analytics) va en **best-effort** (try/catch) — nunca bloquea el flujo principal. Corolario: si una regla restringe `users` a admin, "el usuario actualiza su propio lastLogin" choca → best-effort en cliente (elegido) o permitir self-update de campos no-sensibles en reglas. **Lo cazó el E2E con emuladores** (los tests de reglas no cubrían el write de `lastLogin` de signIn) — recordatorio de que el E2E ve lo que el unit test no. Caso: ADR §46.

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · pagada en BERS §47 (Bloque 5: el extractor del Excel heredado) · migrado 2026-09-02 lote 10

### L-21: Verificar la estructura de CADA hoja de un Excel heredado (no extrapolar)
El supuesto "1 fila = 1 cliente con saldo" valió para la hoja de Kary (por cliente) pero NO para la de vendedoras (**por factura**: cada fila = una compra) → el extractor produjo basura ("#REF! de clientas" eran descripciones de producto). Regla: ante un Excel heredado, **verifica CADA hoja con un volcado crudo ANTES de escribir el extractor**; no extrapoles de una hoja a otra ni confíes en un análisis previo. Caso: Bloque 5 / ADR §47.

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · pagada en BERS §47 · migrado 2026-09-02 lote 10

### L-23: Un script Admin SDK (`node`) necesita ADC — `firebase login` NO sirve
Los scripts de migración/seed (`functions/*.mjs` con `firebase-admin`) autentican por **Application Default Credentials**, no por el login del Firebase CLI. Resolución ADC: (1) `GOOGLE_APPLICATION_CREDENTIALS` → service-account JSON, o (2) `gcloud auth application-default login` (user creds; el owner del proyecto tiene permisos). Fijar quota project: `gcloud auth application-default set-quota-project <proyecto>` (evita "quota exceeded"/"API not enabled"). El test en emulador NO ejercita ADC (auth bypasseada) → ese camino queda sin verificar hasta correrlo contra prod. **Antes de la escritura irreversible**: preflight READ-ONLY (count + marca de migración) que confirma ADC y que la colección está limpia. En PowerShell, `CUTOFF=x node ...` (sintaxis bash) NO setea la var → usar `$env:CUTOFF='x'; node ...`. Caso: ADR §47.

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · pagada en BERS §47 · migrado 2026-09-02 lote 10

### L-24: Verificar SIEMPRE los datos tras una migración (la fila "TOTAL" del Excel se cuela)
Una fila **"TOTAL"** del Excel entró como un cliente más → cartera al doble ($1.012M vs $506M real). Receta: tras migrar, **leer total + top-N saldos + conteos** (un total se delata: ≈ suma de los demás) + filtro `NON_CLIENT_RE` anclado al inicio. **Testear el regex con casos** (`totales?` no matchea "TOTAL"; usar `total(es)?`) — regex sin probar = suposición (§3.3). Caso: ADR §47.

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · pagada en BERS §48 · migrado 2026-09-02 lote 10

### L-25: Subir un major de dependencia crítica — verificar, no asumir (firebase-functions v6→v7)
Para actualizar un major de una dep que corre en prod (functions con dinero real): (1) el **`package.json` instalado** en `node_modules` es fuente AUTORITATIVA offline de `engines` (Node mín) + `peerDependencies` (compat) + `exports` (subpaths/imports válidos) — para esas preguntas no hace falta el changelog; (2) el **test de integración con emulador** prueba "¿funciona nuestro código con vX?" mejor que leer notas de versión (carga las functions igual que el deploy y ejercita el trigger); (3) **smoke test en prod** tras desplegar (doc temp marcado + cleanup) confirma que el trigger dispara de verdad; (4) si un agente de research queda sin red, NO inventar el changelog (§3.3) — usar el paquete instalado + WebFetch del release oficial. firebase-functions v7 solo cambió: Node mín 18, quita `functions.config()`, renombra v1 Event→LegacyEvent; la API v2 (onCall/HttpsError/onDocument*) NO cambió. Relacionado con **L-17** (testing de CFs). Caso: ADR §48.

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · pagada en BERS §50 · migrado 2026-09-02 lote 10

### L-27: Verificar el REPO tras un subagente — no fiarse del reporte (truncado/socket/pasos omitidos)
**Disparador**: ejecutar un plan con subagentes (F-CHASIS-A, ADR §50). **Lección**: 3 incidentes en una sesión — un subagente reportó progreso pero su salida se **truncó** y NO llegó a commitear ni añadió el script a `package.json`; otro murió por **socket closed** (0 cambios persistidos); un tercero requirió contraste. **Regla**: tras CADA subagente, el controlador VERIFICA en el repo real (`git log`/`git status`, Grep, build, tests) ANTES de marcar la tarea hecha — el reporte es pista, no evidencia (§3.3). Bonus: `grep` de Bash con `\|` dio **falso negativo** buscando un hex; usar la herramienta **Grep** (ripgrep), no `grep` por shell, para checks de verdad/ausencia.

> Origen: BERS `docs/31-LECCIONES-FIRESTORE.md` (titular en `docs/30-LECCIONES.md`) · sin §NN de ADR: su cuerpo no cita ninguno (su ACTUALIZACIÓN se fecha 2026-06-06) · migrado 2026-09-02 lote 10

### L-12: Testear Firestore rules sin Java local — vía CI (zero-budget)
El emulador Firestore necesita un JDK; si la máquina del dev no lo tiene, NO se pueden testear reglas localmente. Patrón zero-budget: `@firebase/rules-unit-testing` + tests con `node:test` (cero deps extra) + workflow GitHub Actions con `actions/setup-java` (Temurin, gratis en runners) que corre `firebase emulators:exec --only firestore --project demo-<x> "node --test tests/..."`. Se verifica en cada push que toque `firestore.rules`/`tests/**`, **antes** de que `firebase-deploy.yml` despliegue. Los roles que las reglas leen de `users/{uid}` se siembran con `testEnv.withSecurityRulesDisabled()`. El prefijo `--project demo-` evita necesitar credenciales reales.
> ✅ **ACTUALIZACIÓN (2026-06-06)**: el JDK YA está local (Temurin 25, `C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot`); correr `npm run test:rules` con `$env:JAVA_HOME` apuntando ahí (1ª corrida baja el emulador). El "no hay Java local" era **stale**.

> Origen: BERS `docs/31-LECCIONES-FIRESTORE.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §42 (el bug S6 de las reglas) · migrado 2026-09-02 lote 10

### L-13: Reglas `validate` tolerantes a merge updates (Firestore)
En un `update`, `request.resource.data` es el estado **resultante completo** del doc (merge ya aplicado), NO solo el delta. Por eso: exige obligatorios SOLO en `create` (`d.name is string && d.name.size()>0`); en `update` valida **tipos solo-si-presente** — pero con el idiom CORRECTO `!('x' in d) || d.x is T` (ver ⚠️ abajo). Así un patch parcial (p.ej. solo `images`) y los docs legacy NO se rompen.
> ⚠️ **CORRECCIÓN (2026-06-06, emulador)**: en `request.resource.data`, acceder a un campo AUSENTE **lanza** (`Property X is undefined`) → `d.x == null || d.x is T` revienta. Idiom correcto: **`!('x' in d) || d.x is T`** (presencia primero) o `d.get('x', null)`. Generó el bug S6 (ADR §42). Ver **L-16**.

> Origen: BERS `docs/31-LECCIONES-FIRESTORE.md` (titular en `docs/30-LECCIONES.md`) · sin §NN de ADR: su cuerpo ancla el caso en el incidente de prod del 2026-06-06 · migrado 2026-09-02 lote 10

### L-14: NO quitar el fallback de config PÚBLICA sin confirmar que la fuente real está poblada (incidente prod 2026-06-06)
Quitar el fallback hardcodeado de las API keys **web** de Firebase (S1) **tumbó producción**. Causa: `deploy.yml` **referencia** los secrets `VITE_FIREBASE_*`, pero referenciar ≠ que estén configurados en GitHub. Si faltan, el build inyecta `undefined` → con `apiKey` undefined, inicializar Firebase **lanza en module-eval** → como casi todo importa `firebase-config.js`, **el arranque entero se cae** (shell carga; contenido + botones muertos; páginas atascadas en su pantalla de "Cargando"). Las API keys web son **públicas por diseño** → el fallback NO es riesgo de seguridad, es una **red de seguridad** (zero-budget/un dev → los secrets pueden faltar). **Doctrina**: (1) un fallback de config PÚBLICA se mantiene; (2) antes de depender solo de secrets de CI, confirmar que existen (`gh secret list` o Settings→Secrets→Actions); (3) síntoma en prod = páginas en "Cargando" + botones muertos → mira la consola del navegador (`invalid-api-key`). Fix: restaurar el fallback (`firebase-config.js`).

> Origen: BERS `docs/31-LECCIONES-FIRESTORE.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §42 · migrado 2026-09-02 lote 10

### L-16: Reglas de seguridad — los tests "felices" no bastan; revisar adversarialmente el PAYLOAD de create
Tests positivos (crea cliente OK, crea movimiento OK) verifican el camino feliz pero **NO** los huecos de inyección. Una revisión adversarial (workflow, 4 lentes: escalada/lectura/integridad/robustez) del CRM Bloque 1 encontró 7 huecos reales que 32 tests verdes NO cubrían. Patrones de endurecimiento (reusables en CUALQUIER regla Firestore):
- **`hasOnly` whitelist** en create: `d.keys().hasOnly([...campos permitidos...])` → bloquea campos server-only (saldos, contadores) y cualquier inyección. Lo que escribe SOLO una Cloud Function (vía Admin SDK, que bypassa reglas) **nunca** debe estar en la whitelist del cliente.
- **Campos de estado/auditoría no nacen del cliente**: en create, prohibir `anulado:true`, `anuladoPor/En`, `autorizadoPor/En`, `estado!='pendiente'` → si no, un rol de menor privilegio se auto-aprueba o manipula el cálculo derivado al crear.
- **Restringir por rol dentro del validador**: un mismo `tipo`/operación puede ser legítimo para admin pero no para un rol scoped (ej. vendedora solo `factura`/`abono`, no `apertura`/`ajuste`).
- **Multi-tenant: validar la PERTENENCIA del recurso referenciado**, no solo que el actor firme con su uid. Una solicitud sobre `clienteId` ajeno pasa si solo validas `vendedoraUid==auth.uid`; hay que `get()` el padre y comparar el dueño.
- **`list`/`query` se evalúan distinto a `get`**: testear `getDocs(collection)` sin filtro (debe FALLAR) + `query(..., where(campo,'==',uid))` (debe pasar) — el aislamiento de cartera vive ahí, no en el `get` de doc individual.
- **Robustez a campos ausentes en `get().data`**: `get(...).data.campoOpcional` revienta si falta → envolver en `('campo' in data) ? data.campo : null` (caso: cliente directo sin `vendedoraUid`). Relacionado con **L-13**.
Caso real: ADR §42 (firestore.rules CRM). Anti-anclaje: dile a los lentes lo que YA sabes para que busquen lo demás.

> Origen: BERS `docs/31-LECCIONES-FIRESTORE.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §43 · migrado 2026-09-02 lote 10

### L-17: Testear Cloud Functions — lógica pura (sin emulador) + integración (con emulador)
Una CF tiene dos partes con riesgos distintos; sepáralas:
- **Lógica de negocio/dinero → función PURA** en su propio módulo (ej. `functions/saldo.js` `computeSaldo(movs)`), sin Firestore. Se testea con `node --test` **sin emulador** (rápido, determinista) → ahí va la "precisión exacta como las matemáticas". Redondea a 2 decimales (`Math.round((n+EPSILON)*100)/100`) para evitar `0.1+0.2=0.30000000000000004`.
- **Glue del trigger → integración** con `firebase emulators:exec --only firestore,functions "node --test ..."`. Escribe con **firebase-admin** (en `functions/node_modules`; el test vive en `functions/` para resolverlo) — bypassa reglas; `emulators:exec` exporta `FIRESTORE_EMULATOR_HOST` → admin se conecta solo. El trigger es **async**: hacer **poll** del doc afectado hasta el valor esperado (timeout ~15s), no `assert` inmediato. Valida lo que el unit test NO puede: que el trigger registre y dispare, que `transaction.get(query)` (leer una colección en transacción, Admin SDK) funcione, y la extracción de `event.params`.
- **Recompute idempotente** (recalcular desde la fuente de verdad) > incrementar: imposible de desincronizar (el pecado del Excel con `#REF!`). El trigger escribe en un doc PADRE distinto a la subcolección que lo dispara → no hay loop.
Caso real: ADR §43 (`recalcSaldoCliente` + `functions/saldo.js`). Java local: `31 §L-12`.
