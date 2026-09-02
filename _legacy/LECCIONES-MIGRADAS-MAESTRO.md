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

---

> Lote 11 · migrado 2026-09-02 · 20 lecciones.

---

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · pagada en BERS §50 · migrado 2026-09-02 lote 11

### L-28: El Consejo Externo puede SIMPLIFICAR — a veces lo correcto es menos máquina (ADR §50)
Gemini (Consejo Externo) refutó un hardening interno para la escala real (344 clientes): saldo síncrono O(M) en la tx (no incremental+cronjob), sin backfill (COP ya entero exacto; migrar $506M cuadrados = riesgo), DIAN por Adapter (no acoplar el schema a UBL) → más simple y correcto. Regla: una 2ª opinión adversarial puede QUITAR sobre-ingeniería, no solo añadir rigor. Evaluar como peer review (adoptar/refutar CON razón, nunca en bloque). EXT (CMS WYSIWYG): también puede CONFIRMAR sumar complejidad (iframe) — pero se ADOPTA por TU evidencia en código, refutando su retórica ("Game Over" XSS del editor de confianza).

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · pagada en BERS §54 · migrado 2026-09-02 lote 11

### L-30: App Check directo (sobre Firestore) cierra denial-of-wallet con UN init — no reescribas los forms (ADR §54)
El hueco de escritura pública (`create:if true`+apiKey pública → spam agota cuota) NO se cierra reescribiendo cada form a callable (eso es defensa posterior). Core fix: `initializeAppCheck(app,{provider:ReCaptchaV3Provider(key)})` en UN punto (`firebase-config.js`) → adjunta token a CADA petición, sin tocar forms ni reglas. Rollout: (1) gatear por la key (ausente → no-op, misma red que L-14); (2) skip en dev; (3) el init NO bloquea por sí solo (el bloqueo es el Enforcement de consola); (4) monitor→enforce solo cuando el tráfico legítimo ya llega tokenizado. Regla: cierra el hueco con la pieza mínima; la robustez extra es follow-up.

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · pagada en BERS §57→§58 · migrado 2026-09-02 lote 11

### L-32: App Check "no válidas" 96-100% — leer el CUERPO del 403, no adivinar (ADR §57→§58)
"No válidas" = token presente pero RECHAZADO (el SDK web manda dummy si su canje falla) → misconfig real, NUNCA propagación (eso es "desactualizados"). Receta: (1) red del navegador → `exchangeRecaptchaV3Token` 403; (2) replicar el canje a mano y leer el CUERPO — `grecaptcha.execute(widgetId,…)` (por widgetId, NO por site key = falso "Invalid site key"); (3) el body dicta el fix: `API_KEY_SERVICE_BLOCKED` = la API key sin "Firebase App Check API" en su allowlist (el hardening Tier A la restringió §54) → GCP→key→Restricciones→añadir la API. **Meta-regla: al instalar un servicio Google nuevo, revisar las API restrictions de la key PRIMERO.** No Enforce hasta ~100% ×7 días.

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · pagada en BERS §59 · migrado 2026-09-02 lote 11

### L-33: firebase CLI multi-cuenta — deploy con 403 "caller does not have permission" = cuenta activa equivocada
**Disparador**: `firebase deploy` (o el MCP de Firebase) falla con 403 en cualquier API de Google (firebaserules, etc.). **Lección (ADR §59)**: esta máquina alterna 3 proyectos (cars / inmobiliaria / bersaglio) con cuentas Google distintas y el CLI guarda UNA cuenta activa — una sesión en otro repo la cambia. ANTES de diagnosticar permisos/IAM: `firebase login:list` → si la activa no es la del proyecto, `firebase login:use <cuenta>` (fija el default POR DIRECTORIO → la cura persiste y previene la recaída en los 3 repos). El 403 de deploy en este setup casi nunca es IAM real: es la cuenta.

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · pagada en BERS §75 · migrado 2026-09-02 lote 11

### L-39: La UI de dinero se verifica con revisión ADVERSARIAL experta, no con clics de un no-técnico (ADR §75)
**Disparador**: verificar una UI que ESCRIBE dinero (correcciones de saldo/movimientos) antes de publicarla. **Lección**: el gate correcto NO es "el operador no-técnico hace 5 clics" (Kary es dueña no-experta; no detecta un asiento de $0 ni un doble-ajuste). Es una **revisión adversarial multi-agente por dimensiones** (conformidad con reglas DESPLEGADAS · lógica de dinero/signo · wiring/edge-cases) que TRAZA cada escritura contra las reglas reales. En M2a atrapó 2 bugs de dinero BLOQUEANTES (ajustes duplicados sin guard → doble ajuste; corregir con monto vacío → asiento de $0 silencioso) + 1 del spec (rechazo sin botón) que clics manuales jamás verían. **Patrón**: las pruebas (módulo + reglas) cubren la LÓGICA; la revisión adversarial cubre el WIRING y los caminos que producen un dato incorrecto SIN error. Claude es el experto que verifica → [[feedback_claude_experto_verifica]].

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · pagada en BERS §76 · migrado 2026-09-02 lote 11

### L-40: Acciones automáticas sobre dinero — el RENDER sugiere, el CLICK re-valida (ADR §76)
**Disparador**: una UI ofrece una acción "automática" sobre dinero (rechazo de solicitud obsoleta, marcado, baja) basada en lo que se evaluó AL PINTAR la tarjeta. **Lección (verif. M2b, 3 lentes lo hallaron por separado)**: el contexto del render puede MENTIR — un fetch fallido (catch → lista null) o un `limit()` truncado es indistinguible de "el doc no existe", y un veredicto "obsoleta" calculado ahí convierte un blip de red en un rechazo one-way con código de auditoría FALSO. **Regla**: (1) toda escritura disparada por una sugerencia del render RE-LEE el doc fuente en el instante del click y re-valida (espejo del camino de aprobar, §74); (2) un fallo de carga se marca `error:true` — JAMÁS se pinta como contexto real ni habilita botones de decisión (anti rubber-stamping); (3) todo `onSnapshot` de una superficie de control lleva error-callback (un error de listen es TERMINAL: sin él, la cola muere MUDA y "roto" se ve igual que "al día"). Bonus M2b→M3: si una regla futura va a comparar asiento↔solicitud, defínela POR TIPO de solicitud — el contrato §74 hace divergir el top-level POR DISEÑO (delta neto ≠ monto del asiento).

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · pagada en BERS §89 · migrado 2026-09-02 lote 11

### L-42: Sección dinámica rellenada por listener → monta SIEMPRE su `<section>` (ADR §89)
**Disparador**: una sección que se llena con datos async (onSnapshot/onChange) y puede estar vacía al primer paint. **Lección (bug Categorías)**: si `renderX()` devuelve '' sin datos, la sección NUNCA entra al DOM, y un `refreshX()` que solo ACTUALIZA (querySelector + salir si no existe) no puede CREARLA → el contenido jamás aparece (ni en vivo ni al recargar: el primer paint SIEMPRE es sin datos, `data.load()` es async). **Patrón correcto** (films/social/journal/featured): `renderX()` devuelve SIEMPRE `<section class="home-X">${xInner()}</section>`; `refreshX()` hace `mount(sec, xInner())`. La vacía se colapsa por **CSS `:empty{padding:0}`** (0px, anti-CLS), NO omitiendo el nodo. Bug latente: solo aparece al partir de CERO ítems. Desconfía de comentarios "aparecerá al recargar" sin verificar.

> Origen: BERS `docs/30-LECCIONES.md` (titular y cuerpo en la MISMA línea) · pagada en BERS §94 · migrado 2026-09-02 lote 11

### L-43: Google Fonts — pesos en RANGO `..` (no lista discreta) = fuente variable → ~½ archivos, cero cambio visual. Detalle → `45` PERF-06 · §94.

> Origen: BERS `docs/31-LECCIONES-FIRESTORE.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §51 (su EXT, en §78) · migrado 2026-09-02 lote 11

### L-29: Aging/mora "en vivo" sin infra nueva — FIFO puro + collectionGroup filter-free + fecha round-trip
**Disparador**: derivar antigüedad/mora de una cartera (cuentas por cobrar) sobre un saldo desnormalizado. **Lecciones** (ADR §51): (1) la mora se calcula **al leer** con un helper PURO espejo del saldo (FIFO: créditos contra cargos del más viejo al más nuevo; envejecer el pendiente desde `fecha+plazo`) → **cero** Cloud Function/scheduler/denormalización; la materialización (`diasVencido` en el doc + recompute diario) solo hace falta a escala (difiérela). (2) Para la mora de una **lista** hace falta TODO el set de movimientos → `collectionGroup('movimientos')` **sin filtros (solo `limit`)** → NO requiere índice compuesto (un índice faltante = `FAILED_PRECONDITION` = pantalla en blanco en prod); añadir un `where`/`orderBy` OBLIGA a declarar el índice. Requiere un match de reglas `/{path=**}/movimientos/{id}` (el match anidado NO autoriza collectionGroup). (3) Usar el **mismo origen** (los movimientos, vía listener) para saldo y vencido evita que se desincronicen en una vista de dinero. (4) `'YYYY-MM-DD'` que pasa un regex NO es una fecha válida: `Date.UTC(2026,12,45)` la **envuelve** en silencio (→ 2027-02-14) → validar **round-trip** (los componentes UTC deben coincidir) y caer a "sin fecha" si no. **Regla**: la antigüedad es derivable y barata; no la materialices hasta que la escala lo exija (Consejo §16). Relacionado: **L-28** (menos máquina), **L-22** (deploy de reglas/índices = manual). **EXT (§78)**: otra trampa de calendario JS — `setMonth(mes-1)` sobre un día 29-31 "normaliza" hacia ADELANTE y devuelve el mes EN CURSO; toda aritmética de "mes anterior/siguiente" se ANCLA al día 1 (`new Date(y, m-1, 1)`) ANTES de desplazar, o quema docs inmutables con el período equivocado justo en los cierres.

> Origen: BERS `docs/31-LECCIONES-FIRESTORE.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §64 · migrado 2026-09-02 lote 11

### L-34: Transacciones Firestore y esc() en atributos — grietas que la revisión adversarial cazó (ADR §64)
**Disparador**: callback de `runTransaction` o interpolar texto en atributo HTML del panel. **Lecciones (rev. F6 frente D, 24 ag. · detalle → §64)**: (1) el callback de `runTransaction` se RE-EJECUTA en contención → **resetear al inicio de cada intento todo estado capturado fuera** (un `let` externo devolvió saldo fantasma). (2) `esc()` que solo escapa `&<>` es insuficiente en atributo (`title="${esc(x)}"`): una comilla cierra el atributo = inyección — el `esc()` de `shared.js` ya escapa `"`/`'` (no crear escapes locales). (3) validar que un docId no traiga `/` antes de `.doc()` (ruta con barras = otro doc). (4) `orderBy` de UN campo usa índice automático; la doctrina anti-índices (L-29) es para `where`+`orderBy` COMBINADOS; sin `orderBy` un `limit()` trunca docs arbitrarios. **EXT (CMS)**: `esc()`=contexto-HTML; **href/src exigen `safeUrl()`**; `style=`/`url()` no lo cubre nadie (allow-list/numérico, p.ej. `--cat-hue`). **Auditar TODO renderer del ADMIN con href/src que use solo `esc()`** (caso `colecciones.js:53` bannerUrl en `<a href>` sin safeUrl = stored-XSS admin). Fix `esc(safeUrl(x))`.

> Origen: BERS `docs/31-LECCIONES-FIRESTORE.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §65 · migrado 2026-09-02 lote 11

### L-35: Custom claims de Firebase — el espejo doc→claim es un RECONCILIADOR, no un copista (ADR §65)
**Disparador**: mover el rol de `users/{uid}.role` a un custom claim. **Lecciones (rev. adversarial 19 ag., 2 ALTA · detalle → §65)**: (1) **la frontera es donde ESCRIBE el cliente**: si el panel escribe `users/{uid}` DIRECTO, las REGLAS son la única frontera → validar `role` ahí (whitelist `role in ['admin','editor']`; no acuñar owner ni degradarlo). Una CF con guardas no protege un camino que no pasa por ella. (2) **el claim TIENE PRECEDENCIA y persiste** (uno malo no se auto-corrige al refrescar) → trigger espejo **convergente**: derivar del **doc actual** (no de `event.data.after`) y comparar con Auth antes de escribir → idempotente ante entrega at-least-once sin orden; `retry:true` + capturar `auth/user-not-found`. (3) `setCustomUserClaims(uid,null)` **arrasa TODO** el mapa de claims. (4) degradar el rol NO invalida el token vigente (≤1h) → `revokeRefreshTokens` para corte real. (5) orden de deploy: functions→backfill→rules→preflight. (6) script ADC de backfill: guardia anti-`*_EMULATOR_HOST` + abortar ante error transitorio (no reportar éxito falso).

> Origen: BERS `docs/31-LECCIONES-FIRESTORE.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §66 · migrado 2026-09-02 lote 11

### L-36: "Desactivar" debe DESHABILITAR la cuenta de Auth — un campo en un doc NO es una credencial (ADR §66)
**Disparador**: botón "Desactivar usuario" / soft-delete que marca `active:false`. **Lección** (detalle → §66): marcar un campo NO bloquea el acceso — Auth sigue emitiendo tokens y el "desactivado" entra con su rol. **El bloqueo DURO es `getAuth().updateUser(uid,{disabled:true})`** (CF con Admin SDK): `disabled` no puede `signIn` (`auth/user-disabled`) ni refrescar. El panel debe llamar la CF (única que toca Auth); el check cliente de `active` en `requireAuth` es **defensa en profundidad**, no frontera. Corolario: si la página es `requireAuth('owner')`, las reglas de `users/` = **owner-only** en write. Relacionado [[L-35]].

> Origen: BERS `docs/31-LECCIONES-FIRESTORE.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §67 · migrado 2026-09-02 lote 11

### L-37: CI con toolchain SIN PIN = bomba de tiempo · el emulador Firestore exige Java 21 (ADR §67)
**Disparador**: CI que instala una herramienta sin versión (`npm i -g pkg`/`@latest`) y "pasa en local". **Lecciones** (detalle → §67): (1) **verde local ≠ verde en CI** — verificar el run REAL de Actions (API `actions/runs`→`conclusion`), no el playbook (§62 dio el CI por verde sin que pasara nunca; pariente de L-26/L-27). (2) el emulador Firestore de firebase-tools 15.x exige **Java 21** (class file 65.0); con 17 → `UnsupportedClassVersionError` y `emulators:exec` sale **exit 1 ANTES de los tests** (el exit code no distingue "no arrancó" de "test rojo" — leer el log). Fix: `setup-java 21`. (3) `emulators:exec` que falla SIEMPRE desde una FECHA, en cualquier commit = regresión por dependencia flotante (v15 subió el piso de Java de un día para otro). **Regla: PIN de las herramientas del CI** (`firebase-tools@15.18.0`). (4) el requisito de Java sube con el tiempo; revisar al actualizar.

> Origen: BERS `docs/31-LECCIONES-FIRESTORE.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §72 · migrado 2026-09-02 lote 11

### L-38: Reglas Firestore — guard `(A || B)` + `hasOnly` que whitelista B = estado contradictorio (ADR §72)
**Disparador**: escribir/auditar una transición de máquina de estados en `firestore.rules` con un campo condicional por estado (p.ej. `motivoRechazo` solo en 'rechazada'). **Lección**: un guard `(d.estado=='aprobada' || nonEmptyStr(d.motivoRechazo))` junto a `affectedKeys().hasOnly([...,'motivoRechazo'])` deja pasar `aprobada`+`motivoRechazo` (el disyunto izq. corta en `true`; el `hasOnly` solo limita QUÉ cambió, no QUÉ estado RESULTA) → dato internamente contradictorio que el consumidor futuro lee mal. **Idiom robusto**: atar el campo al estado por PRESENCIA — `(d.estado=='rechazada' ? nonEmptyStr(d.motivoRechazo) : !('motivoRechazo' in d))` (un estado lo EXIGE, el otro lo PROHÍBE). Usar `'campo' in d` (presencia, seguro), NO `d.campo` (lanza si ausente, L-13). El red-team W-01 (§72) lo halló por su cuenta y coincidió con el reporte de Daniel → un guard `(A||B)` con `hasOnly` que whitelista B es un anti-patrón a revisar en CADA transición.

> Origen: BERS `docs/32-LECCIONES-CARGA.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §100 · migrado 2026-09-02 lote 11

### L-45: Cero-demo → cazar los fallbacks horneados en CSS (`background:url`), no solo defaults/Firestore; verificar en navegador REAL (ADR §100)
**Disparador**: directiva "sin contenido demo / hide-when-empty" en una página con imágenes, O un "flash de imagen vieja" que un fix de datos NO resolvió. **Lección (bug Daniel 2026-06-23, corrige L-44)**: un slot multimedia suele pintar `<img>` del CMS **o** caer a un `.X-image-bg { background:url('/img/demo') }` cuando el campo está vacío. Ese fondo CSS demo (a) se muestra cuando el CMS está vacío (viola cero-ficción) y (b) **parpadea** antes de que cargue la `<img>` real → se ve como "imagen vieja→nueva". **Una auditoría cero-demo que solo mira `-defaults.js`/Firestore NO lo ve** (los defaults ya eran `image:''`); hay que `grep` los `url(/img/...)` en TODO el CSS. Fix: estado vacío = superficie de marca (gradiente), nunca foto demo. **Meta (§3.3)**: la RCA del §99 (L-44) era ERRADA y su fix (`_siteReady`/`withoutImages`) EMPEORÓ el bug — falló por verificar solo en preview **headless** (L-05). La prueba decisiva fue **Playwright sobre el sitio en vivo** (vio descargar `earrings-travertino.avif`). Para un bug visual de timing/caché: verifica en navegador real, no headless. Trampa adyacente: en grid, `margin:0 auto` quita el stretch → un hijo `position:absolute` colapsa el marco a ~0 (la foto "no se ve" en móvil) → `width:100%`.

> Origen: BERS `docs/32-LECCIONES-CARGA.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §102 · migrado 2026-09-02 lote 11

### L-46: Placeholder de CARGA = invisible (neutro casi-blanco), NUNCA un color saturado (ADR §102)
**Disparador**: una sección con imagen del CMS/red que tarda en cargar (getDoc/onSnapshot) y necesita un placeholder mientras llega. **Lección (bug Daniel 2026-06-23, "pantalla verde")**: un placeholder con color SATURADO (un gradiente de marca) se ve como "pantalla de espera" fea y compite con el contenido. El placeholder de carga debe ser **INVISIBLE**: neutro casi-blanco (`oklch(94% 0.02 150)`, patrón `featured.js`/colecciones) + la imagen como `background:url` ENCIMA (carga sobre el neutro, sin hueco ni swap). **Separar 2 estados distintos**: *vacío permanente* (no hay imagen → puede tener tratamiento de marca) vs *cargando* (sí hay, aún no llega → invisible). El patrón fluido (reserva de alto `section-reserve.js` + `bj-fade-in`) YA existía → **reusar, no reinventar**. Aplica a CUALQUIER slot multimedia. La skill `arquitecto-software` (lente UX/Mantenibilidad) lo habría cazado antes (directiva Daniel: invocarla SIEMPRE al construir/corregir).

> Origen: BERS `docs/32-LECCIONES-CARGA.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §104 · migrado 2026-09-02 lote 11

### L-47: LQIP "blur-up" del CMS — doble fondo CSS + campo compañero + safeLqip (ADR §104)
**Disparador**: imagen editable del CMS (`siteContent`) que tarda (getDoc one-shot + descarga de Storage) y deja "hueco"→pop. **Lección (§103 F1)**: generar un **LQIP** (data-URI ~40px en `image-optimizer.makeLqip`, reusa el `<canvas>` del optimizador) y guardarlo en un **campo compañero `<campo>Lqip`** del MISMO sub-mapa (aditivo; viaja con la URL → NO es caché, no tapa cambios; Firestore = verdad). Render = **doble fondo CSS** (`background-image:url(real),url(lqip)` → real ARRIBA, LQIP detrás; el CSS ya da `cover/center`) en los `div` de fondo, y LQIP como `background` del propio `<img>` (visible hasta que el `src` pinta) → **blur-up sin JS, sin CSP, degrada solo**. **LQIP > Blurhash-librería** en vanilla/zero-budget (cero dep, cero JS público, reusa canvas). **Seguridad**: un `data:image` en CSS `url()` NO pasa por `safeUrl` (rechaza `data:` por diseño) → usa `safeLqip()` (regex `data:image/(webp|avif|jpeg|png);base64,[A-Za-z0-9+/=]+`): sin comilla/paréntesis/espacio = imposible breakout del `url()`. El compañero es un detalle del field-type `image` en `singleton-admin-core` (render+collect, top-level y en ítems de lista). Reglas backend → [[L-48]].

> Origen: BERS `docs/32-LECCIONES-CARGA.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §105 · migrado 2026-09-02 lote 11

### L-49: "Imágenes que cambian de zoom al cargar" rara vez es resize — mídelo; suele ser la animación de ENTRADA replay en recarga (ADR §105)
**Disparador**: en RECARGA unas imágenes "están más pequeñas y luego se acomodan" (parece zoom/object-fit). **Lección (bug Daniel 2026-06-23)**: NO asumas resize — **mide la caja** (`preview_eval`: `clientWidth`, `transform`). Aquí era estable; el hover-zoom no dispara en mount (un `transition` solo anima si el valor CAMBIA tras montar). Causa real: la **animación de entrada `.reveal`** (`opacity`+`translateY`, ~0.9s) **replay en recarga sobre una sección YA visible** → el `transform` la promueve a capa GPU → el navegador difumina sus imágenes durante la transición. **Fix reusable**: lo ya visible en el 1er paint se asienta SIN animar (`.reveal-static`/`transition:none`) en el mecanismo COMPARTIDO (`reveal.js`), no por sección.

> Origen: BERS `docs/32-LECCIONES-CARGA.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §106 (su EXT, en §111) · migrado 2026-09-02 lote 11

### L-50: Un placeholder de imagen solo MEJORA si PRECEDE a la imagen — en MPA estático el LQIP llega con el getDoc y SUMA un 3er estado (ADR §106)
**Disparador**: añadir un LQIP/placeholder a imágenes del CMS en sitio estático (datos por `getDoc`). **Lección (revert §104, Daniel "ahora es peor")**: el LQIP llega CON el `getDoc`, NO antes del 1er paint → neutro→borroso→nítida = **3 estados**, PEOR que neutro→nítida. Un placeholder solo reduce churn si está ANTES que la imagen (la **sustituye**, no la **suma**) → exige caché/prefetch o SSG. **Reglas**: (1) el **feedback de usuario manda** sobre el beneficio teórico; (2) cuenta los ESTADOS visibles (¿reemplazo o suma?) al optimizar carga; (3) revert sano: quita SOLO el render y **conserva la fontanería** (datos+tests) para cuando exista la pieza habilitadora. Relacionado [[L-47]], [[L-46]], §103.3.
> **EXT (2026-06-23 · §111 RESUELTO)**: re-cablear LQIP en `siteContent` SÍ es seguro con carga **cache-first** + diff-gate por `version` (§111): el blur PRECEDE a la imagen (la caché §108 lo habilita). El 3er estado de §106 era por `getDoc` server-first POR VISITA. [[L-52]].

> Origen: BERS `docs/32-LECCIONES-CARGA.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §107 · migrado 2026-09-02 lote 11

### L-51: MPA "app-like" — empieza por `@view-transition` cross-document (barato/nativo), no por el router falso-SPA (caro) (ADR §107)
**Disparador**: pedir navegación "tipo app" (sin flash/parpadeo entre páginas) en un sitio multi-página. **Lección (§103 F2)**: hay 2 niveles. (1) **View Transitions cross-document** (`@view-transition{navigation:auto}` en un CSS global cargado por TODAS las shells): ~3 líneas, cross-fade nativo entre páginas del mismo origen, **cero JS, degrada solo, no toca la nav** (el `location.href` cross-shell ya lo dispara), respeta "sin caché pegajoso" (cada página carga fresca) → quita el flash blanco = ~80% de la molestia. (2) **router falso-SPA** (intercepta, `fetch`+swap `<main>`, contenido en memoria): nav INSTANTÁNEA real, pero exige **`destroy()`/teardown en cada page-handler** (listeners/`onSnapshot`/observers, `33-DOCTRINAS-CSS §Observadores` —ex §3.5— anti-zombi) → refactor grande/frágil si los handlers asumen carga fresca. **Regla**: ship (1) primero y EVALÚA; construye (2) solo si (1) no basta (no precluye nada). Verifica soporte (`document.startViewTransition`) + que la regla esté en una hoja cargada. Relacionado §103.1/.2.

---

> Lote 12 · migrado 2026-09-02 · 20 lecciones.

---

> Origen: BERS `docs/32-LECCIONES-CARGA.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §108 (su EXT del comité, en el mismo §108.7-.12) · migrado 2026-09-02 lote 12

### L-52: "Instante + fresco" = SWR NATIVO de la plataforma (Firestore `persistentLocalCache`) + diff-gate, NO un SWR a mano (ADR §108)
**Disparador**: pedir "carga instantánea pero siempre fresca" de contenido dinámico/CMS en sitio estático. **Lección (idea Daniel + research)**: el patrón estándar es **stale-while-revalidate** (web.dev; Google en ads). NO lo hagas a mano con localStorage (parpadea → lo descartó §103). Firestore lo trae **nativo**: `persistentLocalCache` → `onSnapshot` sirve la copia local AL INSTANTE y revalida (`metadata.fromCache`). Anti-parpadeo = **diff-gate**: re-pinta SOLO si el dato cambió (igual→no toca el DOM). Respeta "ver cambios en vivo" (onSnapshot live). 1ª visita sin caché carga normal; el resto instantáneo. **Matiz**: el §103 generalizó de más al decir "CERO SWR" — era contra el localStorage a mano, NO contra el caché NATIVO + diff-gate. Implementar SIEMPRE con workflow/comité (Decisión Fuerte, capa de datos). Relacionado §103.2, [[L-50]].
> **EXT (2026-06-23 · workflow comité×5+Gemini → 4 bloqueantes; F1 ✅; detalle §108.7-.12 + bóveda).** (1) caché GLOBAL contagia el CRM (I3/I6) ⇒ SOLO-público. (2) fallback ≠ try/catch (fallo async) ⇒ feature-detect. (3) diff-gate puede ocultar cambio (I1) ⇒ firma `id+_version+StorageURL`. (4) gatear MOUNT no basta (§105) ⇒ +`observeReveals`. `getDoc` server-first online ⇒ `siteContent` ok. [[feedback_workflows_acotados]].

> Origen: BERS `docs/32-LECCIONES-CARGA.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §112 · migrado 2026-09-02 lote 12

### L-53: Firebase Storage SIN `cacheControl` → servido `private, max-age=0` = re-fetch por visita (ADR §112)
**Disparador**: blur-up/caché de imagen del CMS que se ve en CADA visita, no solo la 1ª. **Lección**: sin `cacheControl`, Storage sirve `private, max-age=0` → el navegador revalida siempre → nunca instantáneo de caché. Fix: `cacheControl:'public, max-age=31536000'` en la subida (`_upload`) + backfill `setMetadata` (`migrate-cache-control.mjs`, no re-subir). Seguro cachear largo: la downloadURL se versiona por TOKEN. **Mídelo** (`curl -I`), no asumas que "ya cachea". [[L-47]]/[[L-52]].

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · pagada en BERS §115 · migrado 2026-09-02 lote 12

### L-55: RBAC por niveles — TODOS los mapas de rol deben incluir el rol nuevo Y manejar el rango 0 (`??`, no `||`) (ADR §115)
**Disparador**: añadir un rol a una jerarquía numérica de roles. **Lección (rol "catálogo" §115, 2 bugs cazados EN VIVO)**: (1) el nivel del rol vive DUPLICADO en N mapas que DEBEN concordar — en bersaglio son **3**: `js/auth.js ROLE_LEVELS` (guard de páginas), `functions/index.js ROLE_LEVEL` (`verifyRole`+`syncRoleClaim`), `js/admin/render-sidebar.js ROLE_RANK` (filtro del menú). El plan olvidó el 3º → al añadir un rol, `grep` TODOS los `ROLE_LEVEL*`/`ROLE_RANK` + whitelists `role in [...]` (reglas/CFs) ANTES de cerrar. (2) **El rango 0 es FALSY**: un rol con nivel 0 (catálogo, por debajo de editor) rompe los defaults `|| 0`/`|| 1` (`0 || 1` = 1) → el ítem 'catalogo' quedaba OCULTO incluso para catálogo. Usar **`??`** (nullish, respeta el 0), nunca `||`, en cualquier comparación de rango con defaults. (3) Lo cazó la prueba EN VIVO (el emulador valida REGLAS, no el render del menú — L-05/§101). Detalle build → ADR §115.

> Origen: BERS `docs/31-LECCIONES-FIRESTORE.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §115 · migrado 2026-09-02 lote 12

### L-56: Callable v2 que falla con 403 (no se ejecuta) = falta el invoker público — delete+recreate (ADR §115) [stub-header en 30]
**Disparador**: una callable v2 (`onCall`) falla con 403/error opaco sin que el código corra. **Lección (`createUser` §115)**: Cloud Run debe permitir invocación PÚBLICA (`allUsers`→`run.invoker`); la seguridad real es `verifyRole` DENTRO. **Causa**: la fn se creó pero nunca se invocó → el binding `allUsers` no se concedió, y **firebase-tools NO re-aplica el invoker en UPDATE** (solo en CREATE). **Fix**: `functions:delete <fn> --force` + `deploy --only functions:<fn>` + `invoker:'public'` en opciones. **Diagnóstico** (`curl -X POST` sin auth): 403 HTML = NO público; 401 JSON = SÍ público. El firebase CLI tiene la identidad correcta (no ADC, §110.3). Relacionado [[L-33]], [[L-23]].

> Origen: BERS `docs/32-LECCIONES-CARGA.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §115 · migrado 2026-09-02 lote 12

### L-57: Admin MPA "fluido" — mostrar el shell de inmediato; el `body display:none` hasta requireAuth cruza la VT a un body OCULTO=blanco (ADR §115)
**Disparador**: parpadeo/blanco largo al navegar entre páginas de un panel admin MPA con auth-gate. **Lección (§115, Daniel en vivo)**: las shells admin ocultan `<body style="display:none">` hasta que `requireAuth` lo muestra (tras cargar el bundle Firebase ~636KB + resolver auth) → aunque haya `@view-transition` (heredada vía `@import liquid-glass.css`, §107), la VT cruza hacia un body OCULTO = **blanco largo**. **Fix barato**: el guard inline (ya sabe si hay sesión por `sessionStorage.bj_auth`) MUESTRA el shell de inmediato si autenticado (`document.body.style.display=''`) → la VT cruza al shell REAL; la seguridad sigue intacta (`requireAuth` valida ROL y redirige; los DATOS cargan DESPUÉS, el shell no es dato). **Límite**: quita el blanco pero NO el retraso de armar menú+contenido en cada nav (el MPA recarga TODO: HTML+bundle+auth+fetch). **La fluidez REAL = panel tipo app / router falso-SPA** (menú persistente + datos cacheados en memoria de sesión + nav instantánea) = **Decisión Fuerte** ([[L-51]] nivel 2; diseño → `50-ARQUITECTURA`). **Seguridad (pregunta de Daniel, 2026-06-24)**: cachear en memoria de la SESIÓN los datos que el servidor YA autorizó NO expone nada — el candado es server-side (reglas Firestore), independiente de la velocidad del cliente; fluidez y seguridad son ortogonales.

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · pagada en BERS §131 · migrado 2026-09-02 lote 12

### L-59: Desplegar reglas `read` row-level — la query pública DEBE igualar el set legible (ADR §131)
Regla `read` POR-FILA (`visibilidad != 'privada'`) sobre una colección pública. 3 trampas: (1) una query que devuelva UN doc denegado FALLA ENTERA → la query pública filtra EXACTAMENTE al set legible (`where` espeja la regla) Y backfill/borra los legacy sin el campo ANTES de desplegar (si no, catálogo roto). (2) catálogo legítimamente VACÍO NO aborta el build/SSG (distínguelo del fallo "se leyeron pero la proyección las perdió"). (3) escribir/borrar prod exige consentimiento explícito; ADC ≠ auth del CLI/MCP (puede dar PERMISSION_DENIED con el CLI logueado).

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · pagada en BERS §132 · migrado 2026-09-02 lote 12

### L-60: Importar datos reales de fuente externa (certificados QR → SPA) — pipeline reusable (ADR §132)
Cargar inventario masivo desde fotos con QR a una página de terceros. Receta (32 piezas TrueLab): (1) **QR de fotos** = `jsqr`+`sharp` (RGBA raw; upscale ×2-3+sharpen+recortes; varias variantes); `jsqr`/`tesseract` se instalan `--no-save` y se podan → reinstalar. (2) **Página SPA** (WebFetch da cáscara) → Chrome MCP navegando como usuario (`history.pushState`+`PopStateEvent` recorre N rutas en 1 `evaluate_script`; el SPA se autentica solo — NUNCA replicar su credencial). (3) **OCR** (tesseract) NO fiable para un código exacto → usa el id EXACTO del SPA. (4) clasificación = montage etiquetado (1 lectura por N). (5) carga a prod = MCP Firestore. (6) no inventar lo no certificado.

> Origen: BERS `docs/32-LECCIONES-CARGA.md` (titular en `docs/30-LECCIONES.md`) · sin §NN de ADR: su cuerpo ancla el caso en TODO-58 (links compartibles), no en un ADR · migrado 2026-09-02 lote 12

### L-61: Los artefactos del SSG viven SOLO en `dist/` — verifícalos con `vite preview`, NO con el dev server
**Disparador**: probar en navegador algo que produce el SSG. **Lección**: el SSG hornea `dist/pieza/*`, `dist/p/<code>.html` (links compartibles TODO-58), `catalogo.json`, `sitemap.xml` tras `vite build`. `npm run dev` sirve la FUENTE → ahí dan 404. Verifícalos con `vite build && npm run generate && npm run preview` (:4173 sirve `dist/`). Con [[L-05]] (headless no pinta lo dinámico → el `<title>` horneado es la prueba, no el `h1` hidratado). **Stub `/p/<code>`**: `noindex,follow` + `canonical` + redirect doble (meta refresh + JS) → los bots leen los `og:*` sin redirigir (preview), el humano salta; código→archivo con whitelist `[A-Za-z0-9_-]` (anti path-traversal); sin cache bump.

> Origen: BERS `docs/30-LECCIONES.md` (titular y cuerpo en la MISMA línea) · pagada en BERS §156.18 · migrado 2026-09-02 lote 12

### L-62: crash pinch-zoom iOS = MEMORIA; fix = RESTAR capas en móvil (content-visibility + quitar `filter:blur`), NUNCA promover GPU → §156.18

> Origen: BERS `docs/30-LECCIONES.md` (titular y cuerpo en la MISMA línea) · pagada en BERS §156.19 · migrado 2026-09-02 lote 12

### L-63: Dos flotantes `fixed` en la misma esquina (cookie banner ↔ FAB asesoría) se pisan → el consentimiento manda; bandera `body.bj-cookie-active` + el FAB cede por CSS (regla después de `.is-revealed` gana por orden) + banner z-210 > FAB z-200 → §156.19

> Origen: BERS `docs/31-LECCIONES-FIRESTORE.md` (titular en `docs/30-LECCIONES.md`) · sin §NN de ADR: su cuerpo ancla el caso en el go-live de Wompi del 2026-06-30 · migrado 2026-09-02 lote 12

### L-65: `secrets:set` ≠ deploy de `.env` (Cloud Functions gen2) [stub-header en 30]
**Disparador**: cambiar un env var no-secreto en `functions/.env` (`WOMPI_PUBLIC_KEY`/`WOMPI_API_BASE`). **Lección (Wompi go-live 2026-06-30)**: el auto-redeploy de `firebase functions:secrets:set` actualiza el binding del secreto pero **NO re-lee `functions/.env`** → quedan los env vars del último deploy COMPLETO. Síntoma: `.env` ya con `pub_prod`+`production.wompi.co` pero el Widget abría en **"modo pruebas"** (la CF devolvía `pub_test` del deploy sandbox) → un pago real habría fallado. **Fix**: tras cambiar `.env`, `firebase deploy --only functions` completo (log: *"Loaded environment variables from .env"*). Relacionado [[L-56]], [[L-22]].

> Origen: BERS `docs/30-LECCIONES.md` (titular y cuerpo en la MISMA línea) · pagada en BERS §159 · migrado 2026-09-02 lote 12

### L-66: Redirect de login = DETERMINISTA (`sessionReady()` resuelve TRAS escribir `bj_auth`), NUNCA timeout. Rol insuficiente → SU landing, no al login. Pestaña nueva = 1 rebote esperado (sessionStorage por-pestaña; NO localStorage). → §159

> Origen: BERS `docs/30-LECCIONES.md` (titular y cuerpo en la MISMA línea) · pagada en BERS §160.2 · migrado 2026-09-02 lote 12

### L-67: Fechas en negocio = reloj INYECTABLE (`opts.hoy`, default fecha real). Fixture de fechas fijas + código con reloj real = bomba de tiempo (test se pone rojo sin commit — `corte-insumos` R6 murió jun→jul). → §160.2

> Origen: BERS `docs/30-LECCIONES.md` (titular y cuerpo en la MISMA línea) · pagada en BERS §161 · migrado 2026-09-02 lote 12

### L-68: Path IDEMPOTENTE que retorna el recurso reusado debe REFRESCAR el input mutable del reintento (shipping/entrega) — descartarlo en silencio pierde correcciones del usuario (pedido pagado con datos viejos). Lo derivado del recurso (total/firma) queda intacto. → §161

> Origen: BERS `docs/30-LECCIONES.md` (titular y cuerpo en la MISMA línea) · pagada en BERS §161 · migrado 2026-09-02 lote 12

### L-69: El "LCP real" se verifica contra el RENDERER vivo (quién pinta qué), no contra un preload/etiqueta heredada — un preload huérfano descarga con `fetchpriority=high` algo que jamás se pinta Y compite con el LCP; precachearlo consagra el error. → §161

> Origen: BERS `docs/30-LECCIONES.md` (titular y cuerpo en la MISMA línea) · pagada en BERS §163 · migrado 2026-09-02 lote 12

### L-70: Un caché local (localStorage/SDK) solo mata el flash de contenido CMS en visitas REPETIDAS — la 1ª visita de un dispositivo nuevo exige HORNEAR el contenido en el HTML del build (SSG re-hornea por push+cron); y el preload debe re-apuntarse a lo que el renderer pintará con los DATOS reales (semilla: memoria > localStorage > horneado > defaults). → §163

> Origen: BERS `docs/30-LECCIONES.md` (titular y cuerpo en la MISMA línea) · pagada en BERS §164+ (su cuerpo se ancla como «monitoreo post-§164») · migrado 2026-09-02 lote 12

### L-71: MCP Firebase `firestore_query_collection` NO matchea campos timestamp con `string_value` — devuelve `[]` SIN error (falso "no hay datos": trampa en monitoreo de `pedidos`/ventas). Para consultas por fecha usar `firestore_list_documents` con `orderBy: "createdAt desc"` + mask; ante un `[]` sospechoso, re-probar con ventana amplia ANTES de concluir "0 resultados". → monitoreo post-§164

> Origen: BERS `docs/30-LECCIONES.md` (titular y cuerpo en la MISMA línea) · pagada en BERS §167 · migrado 2026-09-02 lote 12

### L-72: El mapa de estados es SSoT COMPARTIDO: toda vista que pinte estados (POS, Pedidos, exports) importa `estadoPedido()` de pedidos-format — un mapping local ("trinario") se pudre en silencio cuando el backend suma estados Y ofrece acciones imposibles ("Confirmar pago" sobre un entregado/expirado). Al añadir estados: grep de quién mapea estados a mano. Cazado en el gate E2E. → §167

> Origen: BERS `docs/30-LECCIONES.md` (titular y cuerpo en la MISMA línea) · sin §NN de ADR: su cuerpo ancla el caso en el frente F2.0 B0b (spec), no en un ADR · migrado 2026-09-02 lote 12

### L-73: Un nombre de subcolección alimenta un `collectionGroup` GLOBAL. Antes de reusar un nombre (`movimientos`, `pagos`…) para un subsistema NUEVO, `grep collectionGroup('<nombre>')`: si existe un consumidor (aging CxC = corte/salud/reconciliación agrupan por `parent.parent.id`), tu colección lo contamina/infla su full-scan aunque el grouping "salve" hoy. Nombre DISTINTO por dominio (`movsCaja` ≠ `movimientos`). Reglas: cada match explícito basta; añade un match `collectionGroup` SOLO si el dominio necesita cross-doc. → F2.0 B0b

> Origen: BERS `docs/30-LECCIONES.md` (titular y cuerpo en la MISMA línea) · sin §NN de ADR: su cuerpo ancla el caso en el frente F2.0 B1 (spec), no en un ADR · migrado 2026-09-02 lote 12

### L-74: Invariante "SOLO UNO abierto/activo" (turno de caja, sesión única…) = **puntero singleton transaccional**, NO `query where estado=='abierto'` (TOCTOU: dos aperturas concurrentes leen "ninguno" y crean dos). Un doc `caja/estado {turnoAbiertoId}`: la CF lo lee+escribe en la MISMA `runTransaction` que crea/cierra → Firestore serializa por ese doc (1 gana, la otra reintenta y falla `failed-precondition`). O(1), sin índice. Idempotencia: `opId == docId` (create-if-not-exists). SIEMPRE un test de carrera (`Promise.allSettled` de 2 → exactamente 1 fulfilled). → F2.0 B1 `functions/caja-core.js`

---

> Lote 13 · migrado 2026-09-02 · 18 lecciones.

---

> Origen: BERS `docs/30-LECCIONES.md` (titular y cuerpo en la MISMA línea) · sin §NN de ADR: su cuerpo ancla el caso en el frente F2.0 B2 (spec), no en un ADR · migrado 2026-09-02 lote 13

### L-75: Tests de integración que comparten un CONTADOR global (`contadores/pedidos`) se contaminan si dos `*.integration.test.mjs` corren en el MISMO emulador (`node --test a.mjs b.mjs`) → los `numero` correlativos chocan (falso fallo con pinta de regresión). Cada `test:X:integration` asume su emulador limpio (los scripts npm lo aíslan). Ante un fallo de correlativo al combinar suites: correr por SEPARADO antes de gritar "regresión". → F2.0 B2

> Origen: BERS `docs/30-LECCIONES.md` (titular y cuerpo en la MISMA línea) · pagada en BERS §169 (F2.0 B3) · migrado 2026-09-02 lote 13

### L-76: Test de idempotencia con `opId==docId` (create-if-not-exists): NO uses `Promise.all` + XOR `a.yaExistia!==b.yaExistia` — el emulador aborta una de las dos tx bajo contención extrema (en prod el cliente reintenta) → falso rojo flaky. Como el docId único hace la duplicación IMPOSIBLE por construcción, usa `Promise.allSettled` + asera el ESTADO FINAL (1 solo doc · saldo no duplicado · puntero correcto), tolerando 1 abort. La carrera concurrente pura pruébala aparte con opId DISTINTOS (tolera rechazos). → F2.0 B3

> Origen: BERS `docs/30-LECCIONES.md` (titular y cuerpo en la MISMA línea) · pagada en BERS §169 (F2.0 B5b-1) · migrado 2026-09-02 lote 13

### L-77: Un rol que NO puede LEER una colección (bóveda = owner-only, discreción D7) no puede derivar su estado client-side. Para una métrica OPERATIVA (efectivo del cajón), el operador con permiso (owner) usa el ledger real (listener exacto y reload-proof); el rol sin permiso cae a un contador EN MEMORIA por sesión — NUNCA localStorage (invariante del comité: "nada de dinero/PII en storage"). La AUTORIDAD del dinero es siempre el recompute server (el cierre), jamás la vista estimada. → F2.0 B5b-1 `js/admin/pos.js`

> Origen: BERS `docs/30-LECCIONES.md` (titular y cuerpo en la MISMA línea) · pagada en BERS §169 (F2.0 B5b-1) · migrado 2026-09-02 lote 13

### L-78: Habilitar un rol NUEVO end-to-end es un FRENTE completo, no la CF nueva sola. `caja` (F2.0) quedó a medias: reglas + `rolDeCaja` lo distinguen para turno/bóveda, pero `crearPedido` usa `rolDeVentas` y `pedidos`-read = `isVentas` (sin `caja`), y el cliente (`ROLE_LEVELS`/`roleLanding` de `auth.js`) no lo conoce → el usuario del rol NO opera (no vende, no lee, mal landing). Checklist al crear un rol: (1) reglas, (2) TODOS los gates de las CF que debe invocar, (3) read-rules de lo que lee, (4) jerarquía + landing del cliente. Bug adyacente: calcular el rol en tiempo de IMPORT del módulo (antes de `requireAuth`) da `null` → calcularlo TRAS la auth (en init). → F2.0 B5b-1

> Origen: BERS `docs/30-LECCIONES.md` (titular y cuerpo en la MISMA línea) · pagada en BERS §171 (F2.1) · migrado 2026-09-02 lote 13

### L-79: Un panel/acción SECUNDARIA tras una acción de DINERO nunca puede impedir el cierre del estado de esa acción. POS F2.1: abrir el panel "adjuntar cliente" ANTES de `resetSale()` podía, si lanzaba (DOM/dato faltante), dejar `_pedidoId` sin rotar → la venta SIGUIENTE reusa el UUID → `crearPedido` devuelve `yaExistia` → **venta perdida EN SILENCIO con toast de éxito** (lo cazó el comité de regresión, no los tests). Regla: en el handler de éxito corre reset/limpieza PRIMERO (o en `finally`); lo secundario (banner/panel) DESPUÉS en `try/catch`, con su estado capturado POR VALOR (nunca el global que el reset regenera). El botón por fila (`data-id`) = camino AUTORITATIVO (sin traslape A/B). Corolario UI: para lo dinámico NUEVO usa DOM seguro (`createElement`/`textContent`) — el hook de seguridad bloquea `innerHTML` con interpolación aunque uses `esc()`. → F2.1 §171 `js/admin/pos.js`

> Origen: BERS `docs/30-LECCIONES.md` (titular y cuerpo en la MISMA línea) · pagada en BERS §172 · migrado 2026-09-02 lote 13

### L-80: En una superficie del panel donde el usuario espera la VERDAD del dinero/estado (ventas recientes, caja, cartera), NUNCA la alimentes con una lectura de-UNA-vez (`getDocs`/`ultimasVentas`) re-disparada por acciones locales (`loadX()` imperativo): se pudre ante cambios de OTRA sesión o del cierre del turno → exige refrescar (F5) — inaceptable con dinero. Usa un listener robusto (`subscribeWithRetry`/`onSnapshot`) que re-pinta solo; el `getDocs` de una vez queda solo para exports on-demand. Corolario (puntero encadenado): si pintar un estado espera 2 snapshots secuenciales (p.ej. `caja/estado`→`onTurnoChange`), siembra el estado OPTIMISTA con el dato que devuelve la CF y deja que el listener reconcilie — pero NO pre-fijes la clave del puntero (`_cajaEstado.turnoAbiertoId`), porque `id===prev` cancelaría el re-cableado de los listeners de turno. → §172 `js/admin/pos.js`+`auditoria.js`

> Origen: BERS `docs/30-LECCIONES.md` (titular y cuerpo en la MISMA línea) · pagada en BERS §178 · migrado 2026-09-02 lote 13

### L-82: HUECO EN BLANCO en carga fría → SKELETON (reusa el componente real, no reserva-en-blanco); NO acelerar con live-upgrade sobre PRECIOS (bait-and-switch). → ADR §178

> Origen: BERS `docs/35-LECCIONES-DINERO.md` (titular en `docs/30-LECCIONES.md`) · sin §NN de ADR: su cuerpo ancla el caso en el diseño de V17 (F-TESORERÍA B5), que vive en la spec · migrado 2026-09-02 lote 13

### L-85: Idempotencia con destino TEMPORAL — ancla el destino, no lo re-resuelvas

Una pata "en el otro libro" con destino DETERMINISTA (sale del propio doc, p.ej. la cuenta bancaria de
un traslado, V1/V18) es idempotente por-libro sin más: al replay se verifica y se crea la que falte.
Pero si el destino es **temporal** —"el turno de caja ABIERTO"— re-resolverlo en el replay mete la
plata en el turno EQUIVOCADO (otro turno ya abierto) o en uno ya SELLADO, cuyo arqueo se firmó sin
ella. Doctrina: **guarda el destino en el doc de la primera escritura** (`pataCaja.turnoId`) y
resuelve el replay contra ESE destino; si el destino ya se cerró y la pata falta, **NO lo reescribas**
(un arqueo firmado no se re-abre: sería fabricar evidencia) → reporta + ALERTA al dueño (invariante #7:
la anomalía grita, no se traga). Y lee el doc del destino DENTRO de la transacción: eso serializa
contra su cierre, y evita la carrera "abono entra mientras la caja se cierra".
Lo encontró el comité ×3 revisando el diseño de V17; los tests lo fijan
(`functions/cartera.integration.test.mjs`: "ANCLADA al turno").

> Origen: BERS `docs/35-LECCIONES-DINERO.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §194 · migrado 2026-09-02 lote 13

### L-86: Cuando un flujo gana un LIBRO nuevo, el camino de DESHACER lo hereda en el MISMO commit

Un flujo de dinero que empieza tocando 2 libros y luego gana un 3º casi siempre extiende el camino de
IDA (la operación) y olvida el de VUELTA (anular / reversar / cancelar). Pasó dos veces seguidas aquí:
el traslado de bóveda ganó el acumulador del turno (jul-10) y hubo que arreglar la reversa; después
ganó el libro del BANCO (V1/V18) y la reversa volvió a quedarse corta — devolvía la plata a la bóveda
sin quitarla del banco, **inventando** plata en la consolidada. Doctrina: **al añadir una pata, el
mismo commit toca las N puertas de deshacer del flujo, y el test es del ESCENARIO completo
(hacer → deshacer → sumar TODOS los libros), no del paso.** Regla de detección barata: `grep` del
nombre del libro nuevo en la suite del flujo — si el camino de deshacer no aparece ni una vez, el
undo está sin cubrir (aquí `reverso` no aparecía en la suite de tesorería: 31 tests verdes y la fuga
viva).

Dos corolarios que valen más que la lección:
1. **Un vigilante que compara cada libro CONSIGO MISMO jamás ve una fuga ENTRE libros.** El cuadre
   3:30 valida `saldoActual` vs el recompute de ESE ledger; con la plata duplicada en bóveda y banco
   los dos libros quedan internamente perfectos. Un control de conservación necesita una suma
   TRANSVERSAL (la consolidada antes == después), que es justo lo que afirman los tests nuevos.
2. **Sellar una pata abre la puerta a la doble resta**: si además existe una vía manual de corregirla
   (`ajuste_inverso`), inverso + deshacer-el-origen restan dos veces. Una pata de SISTEMA se deshace
   por su ORIGEN y solo por ahí (una sola puerta, mismo principio que V12).
→ §194 · `functions/caja-core.js` (`reversoCore`/`aprobarEventoCajaCore`) · `tesoreria-core.js` (`PATA_TIPOS`)

> Origen: BERS `docs/34-LECCIONES-META.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §82 · migrado 2026-09-02 lote 13

### M-01: No imprimir un campo de estado del manifest como "hecho" sin gate que verifique su artefacto
`brain:check` anunciaba "auditoría 2026-06-09" (de `deepAudit.last`) sin tabla de hallazgos = fachada → aplica la Regla de ADMISIÓN al propio linter. Detalle → ADR §82.

> Origen: BERS `docs/34-LECCIONES-META.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §82 · migrado 2026-09-02 lote 13

### M-02: Una lección sobre estado verificable-por-comando (git/build) debe volverse GATE, no prosa [HONOR]
`05` repitió "==main" falso pese a L-26 porque NINGÚN gate lee git (→ TODO-22).

> Origen: BERS `docs/34-LECCIONES-META.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §82 · migrado 2026-09-02 lote 13

### M-03: Un campo `last` de tracking nace null/baseline, nunca con fecha que finja una ejecución
§56 selló `deepAudit.last=2026-06-09` (instalación) sin corrida → fachada (rel. M-01).

> Origen: BERS `docs/34-LECCIONES-META.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §82 · migrado 2026-09-02 lote 13

### M-04: La memoria del harness deriva en silencio (fuera de `docs/`, el linter no la cubre)
Ruta de repo stale tras mudanza + memoria de 72d que contradecía la gobernanza → necesita repaso de frescura propio.

> Origen: BERS `docs/34-LECCIONES-META.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §90 · migrado 2026-09-02 lote 13

### M-05: Edité un subsistema bajo UNA lente y lo di por bueno sin probar el camino vivo (§89)
Di `categories.js` por OK con la lente cero-ficción sin probar el **estado-cero** del camino vivo (*"1ª categoría → ¿aparece?"*). Causa técnica [[L-42]]; meta-falla de PROCESO → reflejo CAZA-BUGS / **W-10**; gate real = test estado-cero ([HONOR]). Detalle → ADR §90.

> Origen: BERS `docs/34-LECCIONES-META.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §96 · migrado 2026-09-02 lote 13

### M-06: El kernel acopla las definiciones `### L-NN` a `30` → shard de lecciones = stub-en-30 + detalle-en-hija (§96)
`brain-check.mjs` lee `defined` SOLO de `30` y `referenced` de todo el cerebro MENOS las hijas. Mover una lección referenciada en `99` a una hija (`31`) la deja COLGANTE. → el shard TODO-27/§96 deja el **header-stub `### L-NN` en `30`** (defined lo cuenta, refs resuelven) y el CUERPO en `31`. Soporte real multi-archivo (que `defined` lea `3*-LECCIONES*.md`) = cambio de KERNEL → cars-operador (L-31), NO unilateral desde bersaglio; aporte para la pasada Gemini (con TODO-22/23). [HONOR]

> Origen: BERS `docs/34-LECCIONES-META.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §114 · migrado 2026-09-02 lote 13

### M-08: Un TABLERO (`05`) no debe FIJAR a mano un hecho verificable-por-comando (hash/PR de PROD) — se vuelve stale y CONTRADICE §3.3 (§114) [HONOR]
HA-01 (estado git stale en `05`) reincidió **3 veces** (H-01→HA-01→§114) porque `05` pinneaba el commit/PR exacto de PROD, que caduca en cada deploy de Daniel (L-26) y NINGÚN gate lee git (TODO-22 = kernel/cars-operador, nunca construido). El **retrieval-drill frío lo probó**: una sesión nueva entrega el hash viejo como "verificado". **Regla**: un tablero describe el estado por CONTENIDO (qué features están live); el dato volátil verificable-por-comando (commit exacto) se DELEGA a `git fetch` (git = SSoT), NO se copia a mano. Quitar el hecho stale en su origen es más barato y robusto que un gate que lo vigile. Complementa [[M-02]] (la lección verificable-por-comando debe ser gate, no prosa) — aquí: si no puede ser gate aún, ELIMINA la prosa stale. Detalle → ADR §114.

> Origen: BERS `docs/34-LECCIONES-META.md` (titular en `docs/30-LECCIONES.md`) · sin §NN de ADR: nace de la auditoría del GBP del 2026-07-17; el `99` no la cita por su ID · migrado 2026-09-02 lote 13

### M-09: Muestrear ≠ contar — extrapolé de la 1ª página de una lista PAGINADA y lo afirmé como hecho (2026-07-17)
**Disparador**: vas a afirmar una proporción/total ("la mayoría", "casi todas", "N de M") sobre una lista larga que ves en una UI.
**El fallo**: auditando el GBP vi 5 reseñas (las de la 1ª página, ordenadas por recientes), 4 sin responder → afirmé *"la mayoría de tus 85 reseñas están sin responder"* y lo escribí en `10` **y lo commiteé**. El dueño me corrigió. Al CONTAR de verdad (9 págs × 10, `navigate_next`): **74/85 respondidas (87%) / 11 sin responder**, y las 11 eran TODAS recientes (págs 1-2; págs 3-9 = 10/10 respondidas). La lista era **paginada de 10**, no scroll infinito: la 1ª página era el peor sesgo posible (lo más nuevo = lo aún no atendido).
**Lección**: (1) una muestra de la 1ª página de una lista **ordenada** (por fecha/relevancia) NO es representativa — está sesgada POR el orden; (2) antes de afirmar una proporción, **cuenta el universo** (paginar/JS) y **valida la suma contra un contador independiente** (aquí: 85 contadas == 85 del panel público → método verificado); (3) si no puedes contar, di "en la muestra que vi (N=5)…" y NO generalices; (4) daño extra: un claim falso commiteado al cerebro contamina a todos los "yo" futuros → al corregir, corregir el NODO, no solo la conversación.
**Regla**: §3.3 no es solo para código — aplica a CUALQUIER hecho, incluidos los que lees en una UI. "Mayoría/casi todos" es un CLAIM CUANTITATIVO: exige conteo, no impresión.

> Origen: BERS `docs/34-LECCIONES-META.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §192 · migrado 2026-09-02 lote 13

### M-23: El sello "(al fecha)" del 05 caduca en silencio — REINCIDENTE (A2-§175 → §192): re-sellar no arregla el mecanismo (2026-07-18)
**Disparador**: editas cualquier celda del `05` (o del `10`) — ¿moviste el sello del encabezado? Nadie lo hace.
**El fallo (×2 documentado)**: §175-A2 encontró el `05` sellado "(al 2026-06-28)" con cuerpo del 07-08; se "resolvió" re-sellando. El §192 encontró EXACTAMENTE lo mismo: sello "(al 2026-07-08)" con cuerpo del 17-jul — más dos contradicciones internas gemelas ("EN PROD hasta §188" junto a "v97 = §189"; "APP v53" con v54 real en código). El patrón: el 05 se edita POR CELDAS y cada editor actualiza su celda sin mirar las vecinas ni el sello. La disciplina "muévelo en cada edición" ya demostró ×2 que no se sostiene por honor.
**Lección**: (1) reincidencia = el fix anterior atacó el SÍNTOMA (fecha vieja) y no el MECANISMO (nada compara sello vs contenido); (2) el gate correcto es del kernel y es barato: comparar el sello contra la fecha del último commit de git del archivo (sello < git-date = "contenido más nuevo que el sello") + detectar contradicción interna "EN PROD hasta §NN" vs "vXX = (§MM)" con MM>NN — propuesto a la cola del kernel (TODO-71, escritor = inmobiliaria-operador, L-31.3); (3) mientras el gate no exista, la auditoría Nivel-2 es el único barrido que lo caza → no espaciarla; (4) hermana de M-08 (no fijar hechos-por-comando a mano): el sello ES un hecho-por-comando (git lo sabe) fijado a mano.
