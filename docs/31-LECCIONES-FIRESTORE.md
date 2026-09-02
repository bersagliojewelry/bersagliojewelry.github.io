# 🔥 31 — LECCIONES FIRESTORE / CLOUD FUNCTIONS / REGLAS (hija de `30-LECCIONES`)

> **Nodo neuronal: Memoria Procedimental — sub-lóbulo Backend Firebase.** Hija de
> `docs/30-LECCIONES.md` (§G.5 sharding por saturación de chars). Se consulta on-demand
> ante el **Trigger de Experiencia (`CLAUDE.md §G.2`)** ANTES de tocar `firestore.rules`,
> Cloud Functions, índices, custom claims o el emulador. La madre `30` deja un **stub de
> 1 línea por cada L-NN** aquí movida (para que `[[L-NN]]` siga resolviendo en `30`, donde
> el kernel lee las definiciones); el DETALLE vive aquí — salvo el de las **migradas al
> maestro** (F2 lote 10: `L-12` `L-13` `L-14` `L-16` `L-17`), que aquí dejan su propio stub.
>
> **Mantenimiento (Reflejo de Frescura §G.4)**: nuevas lecciones Firestore/CF/reglas se
> escriben aquí, dejando su stub `### L-NN: <título> → 31` en `30`. **Tope ~16000 chars.**
> ⚠️ El kernel `brain-check.mjs` lee las definiciones `### L-NN` SOLO de `30` (escritor
> único = cars-operador, L-31): por eso el header-stub DEBE permanecer en `30`.

---

### L-12: Testear Firestore rules sin Java local — vía CI (zero-budget)
⇒ **Migrada al maestro** (F2 lote 10): [[BERS:L-12]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-13: Reglas `validate` tolerantes a merge updates (Firestore)
⇒ **Migrada al maestro** (F2 lote 10): [[BERS:L-13]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-14: NO quitar el fallback de config PÚBLICA sin confirmar que la fuente real está poblada (incidente prod 2026-06-06)
⇒ **Migrada al maestro** (F2 lote 10): [[BERS:L-14]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-16: Reglas de seguridad — los tests "felices" no bastan; revisar adversarialmente el PAYLOAD de create
⇒ **Migrada al maestro** (F2 lote 10): [[BERS:L-16]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-17: Testear Cloud Functions — lógica pura (sin emulador) + integración (con emulador)
⇒ **Migrada al maestro** (F2 lote 10): [[BERS:L-17]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-29: Aging/mora "en vivo" sin infra nueva — FIFO puro + collectionGroup filter-free + fecha round-trip
**Disparador**: derivar antigüedad/mora de una cartera (cuentas por cobrar) sobre un saldo desnormalizado. **Lecciones** (ADR §51): (1) la mora se calcula **al leer** con un helper PURO espejo del saldo (FIFO: créditos contra cargos del más viejo al más nuevo; envejecer el pendiente desde `fecha+plazo`) → **cero** Cloud Function/scheduler/denormalización; la materialización (`diasVencido` en el doc + recompute diario) solo hace falta a escala (difiérela). (2) Para la mora de una **lista** hace falta TODO el set de movimientos → `collectionGroup('movimientos')` **sin filtros (solo `limit`)** → NO requiere índice compuesto (un índice faltante = `FAILED_PRECONDITION` = pantalla en blanco en prod); añadir un `where`/`orderBy` OBLIGA a declarar el índice. Requiere un match de reglas `/{path=**}/movimientos/{id}` (el match anidado NO autoriza collectionGroup). (3) Usar el **mismo origen** (los movimientos, vía listener) para saldo y vencido evita que se desincronicen en una vista de dinero. (4) `'YYYY-MM-DD'` que pasa un regex NO es una fecha válida: `Date.UTC(2026,12,45)` la **envuelve** en silencio (→ 2027-02-14) → validar **round-trip** (los componentes UTC deben coincidir) y caer a "sin fecha" si no. **Regla**: la antigüedad es derivable y barata; no la materialices hasta que la escala lo exija (Consejo §16). Relacionado: **L-28** (menos máquina), **L-22** (deploy de reglas/índices = manual). **EXT (§78)**: otra trampa de calendario JS — `setMonth(mes-1)` sobre un día 29-31 "normaliza" hacia ADELANTE y devuelve el mes EN CURSO; toda aritmética de "mes anterior/siguiente" se ANCLA al día 1 (`new Date(y, m-1, 1)`) ANTES de desplazar, o quema docs inmutables con el período equivocado justo en los cierres.

### L-34: Transacciones Firestore y esc() en atributos — grietas que la revisión adversarial cazó (ADR §64)
**Disparador**: callback de `runTransaction` o interpolar texto en atributo HTML del panel. **Lecciones (rev. F6 frente D, 24 ag. · detalle → §64)**: (1) el callback de `runTransaction` se RE-EJECUTA en contención → **resetear al inicio de cada intento todo estado capturado fuera** (un `let` externo devolvió saldo fantasma). (2) `esc()` que solo escapa `&<>` es insuficiente en atributo (`title="${esc(x)}"`): una comilla cierra el atributo = inyección — el `esc()` de `shared.js` ya escapa `"`/`'` (no crear escapes locales). (3) validar que un docId no traiga `/` antes de `.doc()` (ruta con barras = otro doc). (4) `orderBy` de UN campo usa índice automático; la doctrina anti-índices (L-29) es para `where`+`orderBy` COMBINADOS; sin `orderBy` un `limit()` trunca docs arbitrarios. **EXT (CMS)**: `esc()`=contexto-HTML; **href/src exigen `safeUrl()`**; `style=`/`url()` no lo cubre nadie (allow-list/numérico, p.ej. `--cat-hue`). **Auditar TODO renderer del ADMIN con href/src que use solo `esc()`** (caso `colecciones.js:53` bannerUrl en `<a href>` sin safeUrl = stored-XSS admin). Fix `esc(safeUrl(x))`.

### L-35: Custom claims de Firebase — el espejo doc→claim es un RECONCILIADOR, no un copista (ADR §65)
**Disparador**: mover el rol de `users/{uid}.role` a un custom claim. **Lecciones (rev. adversarial 19 ag., 2 ALTA · detalle → §65)**: (1) **la frontera es donde ESCRIBE el cliente**: si el panel escribe `users/{uid}` DIRECTO, las REGLAS son la única frontera → validar `role` ahí (whitelist `role in ['admin','editor']`; no acuñar owner ni degradarlo). Una CF con guardas no protege un camino que no pasa por ella. (2) **el claim TIENE PRECEDENCIA y persiste** (uno malo no se auto-corrige al refrescar) → trigger espejo **convergente**: derivar del **doc actual** (no de `event.data.after`) y comparar con Auth antes de escribir → idempotente ante entrega at-least-once sin orden; `retry:true` + capturar `auth/user-not-found`. (3) `setCustomUserClaims(uid,null)` **arrasa TODO** el mapa de claims. (4) degradar el rol NO invalida el token vigente (≤1h) → `revokeRefreshTokens` para corte real. (5) orden de deploy: functions→backfill→rules→preflight. (6) script ADC de backfill: guardia anti-`*_EMULATOR_HOST` + abortar ante error transitorio (no reportar éxito falso).

### L-36: "Desactivar" debe DESHABILITAR la cuenta de Auth — un campo en un doc NO es una credencial (ADR §66)
**Disparador**: botón "Desactivar usuario" / soft-delete que marca `active:false`. **Lección** (detalle → §66): marcar un campo NO bloquea el acceso — Auth sigue emitiendo tokens y el "desactivado" entra con su rol. **El bloqueo DURO es `getAuth().updateUser(uid,{disabled:true})`** (CF con Admin SDK): `disabled` no puede `signIn` (`auth/user-disabled`) ni refrescar. El panel debe llamar la CF (única que toca Auth); el check cliente de `active` en `requireAuth` es **defensa en profundidad**, no frontera. Corolario: si la página es `requireAuth('owner')`, las reglas de `users/` = **owner-only** en write. Relacionado [[L-35]].

### L-37: CI con toolchain SIN PIN = bomba de tiempo · el emulador Firestore exige Java 21 (ADR §67)
**Disparador**: CI que instala una herramienta sin versión (`npm i -g pkg`/`@latest`) y "pasa en local". **Lecciones** (detalle → §67): (1) **verde local ≠ verde en CI** — verificar el run REAL de Actions (API `actions/runs`→`conclusion`), no el playbook (§62 dio el CI por verde sin que pasara nunca; pariente de L-26/L-27). (2) el emulador Firestore de firebase-tools 15.x exige **Java 21** (class file 65.0); con 17 → `UnsupportedClassVersionError` y `emulators:exec` sale **exit 1 ANTES de los tests** (el exit code no distingue "no arrancó" de "test rojo" — leer el log). Fix: `setup-java 21`. (3) `emulators:exec` que falla SIEMPRE desde una FECHA, en cualquier commit = regresión por dependencia flotante (v15 subió el piso de Java de un día para otro). **Regla: PIN de las herramientas del CI** (`firebase-tools@15.18.0`). (4) el requisito de Java sube con el tiempo; revisar al actualizar.

### L-38: Reglas Firestore — guard `(A || B)` + `hasOnly` que whitelista B = estado contradictorio (ADR §72)
**Disparador**: escribir/auditar una transición de máquina de estados en `firestore.rules` con un campo condicional por estado (p.ej. `motivoRechazo` solo en 'rechazada'). **Lección**: un guard `(d.estado=='aprobada' || nonEmptyStr(d.motivoRechazo))` junto a `affectedKeys().hasOnly([...,'motivoRechazo'])` deja pasar `aprobada`+`motivoRechazo` (el disyunto izq. corta en `true`; el `hasOnly` solo limita QUÉ cambió, no QUÉ estado RESULTA) → dato internamente contradictorio que el consumidor futuro lee mal. **Idiom robusto**: atar el campo al estado por PRESENCIA — `(d.estado=='rechazada' ? nonEmptyStr(d.motivoRechazo) : !('motivoRechazo' in d))` (un estado lo EXIGE, el otro lo PROHÍBE). Usar `'campo' in d` (presencia, seguro), NO `d.campo` (lanza si ausente, L-13). El red-team W-01 (§72) lo halló por su cuenta y coincidió con el reporte de Daniel → un guard `(A||B)` con `hasOnly` que whitelista B es un anti-patrón a revisar en CADA transición.

### L-48: Reglas `siteContent` — whitelist a nivel de SECCIÓN, no de clave (ADR §104) [stub-header en 30]
**Disparador**: añadir un campo a una página del CMS (`siteContent/{page}`) y dudar si tocar `firestore.rules`. **Lección (§103 F1)**: `siteContentValid` valida `hasOnly([secciones+metadata])` + `<sección> is map` + cap de listas (`siteListOk`), pero **NO recursa en las claves internas** del sub-mapa (editor = de confianza, contenido = marketing reconstruible). ⇒ agregar un campo DENTRO de una sección ya whitelistada (`hero.bgImageLqip`, etc.) **se acepta sin tocar reglas** (L-22 no aplica). SÍ obligan a reglas: sección nueva, lista nueva con cap, o tope server-side. Lock test en `firestore-rules.test.mjs`. Relacionado [[L-16]], [[L-13]], [[L-47]].

### L-56: Callable v2 que falla con 403 (no se ejecuta) = falta el invoker público — delete+recreate (ADR §115) [stub-header en 30]
**Disparador**: una callable v2 (`onCall`) falla con 403/error opaco sin que el código corra. **Lección (`createUser` §115)**: Cloud Run debe permitir invocación PÚBLICA (`allUsers`→`run.invoker`); la seguridad real es `verifyRole` DENTRO. **Causa**: la fn se creó pero nunca se invocó → el binding `allUsers` no se concedió, y **firebase-tools NO re-aplica el invoker en UPDATE** (solo en CREATE). **Fix**: `functions:delete <fn> --force` + `deploy --only functions:<fn>` + `invoker:'public'` en opciones. **Diagnóstico** (`curl -X POST` sin auth): 403 HTML = NO público; 401 JSON = SÍ público. El firebase CLI tiene la identidad correcta (no ADC, §110.3). Relacionado [[L-33]], [[L-23]].

### L-65: `secrets:set` ≠ deploy de `.env` (Cloud Functions gen2) [stub-header en 30]
**Disparador**: cambiar un env var no-secreto en `functions/.env` (`WOMPI_PUBLIC_KEY`/`WOMPI_API_BASE`). **Lección (Wompi go-live 2026-06-30)**: el auto-redeploy de `firebase functions:secrets:set` actualiza el binding del secreto pero **NO re-lee `functions/.env`** → quedan los env vars del último deploy COMPLETO. Síntoma: `.env` ya con `pub_prod`+`production.wompi.co` pero el Widget abría en **"modo pruebas"** (la CF devolvía `pub_test` del deploy sandbox) → un pago real habría fallado. **Fix**: tras cambiar `.env`, `firebase deploy --only functions` completo (log: *"Loaded environment variables from .env"*). Relacionado [[L-56]], [[L-22]].
