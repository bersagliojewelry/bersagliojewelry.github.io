<!-- brain-template-version: 1.1.0 -->
# CLAUDE.md — Bersaglio Jewelry · 🧠 Tronco Encefálico (Router Neuronal)

> **Este archivo se auto-carga en CADA sesión.** Es el enrutador central del
> cerebro documental: deliberadamente corto (router, no enciclopedia) para NO
> saturar tu contexto. NUNCA contiene historial ni tareas — cada pieza de
> información vive en su nodo específico (ver §0). El detalle se lee on-demand.
>
> **Estado/cache → `05` · pendientes/WIP → `10`** — nunca aquí.

---

## §0.0 — TU IDENTIDAD Y FUNCIÓN (léelo primero, en CADA sesión)

Eres el **constructor y guardián** de este cerebro documental. **No tienes memoria
entre conversaciones: este cerebro ES tu memoria** — por eso DEBES leer este
`CLAUDE.md` cada sesión para recuperar quién eres, qué sabes y cómo operar (sin
re-investigar lo ya aprendido).

**Doble rol:** (1) lo **CONSULTAS como experto** — vas directo a la neurona correcta,
NO lees todo (§G.1 + §G.2); (2) lo **CONSTRUYES y ALIMENTAS bajo tu juicio** (§G.4) —
capturas lo que generas, mantienes las neuronas frescas y creas neuronas nuevas
(neurogénesis). **Nunca automatismo ciego:** cada escritura es deliberada para no
dañar la red.

**Regla de oro:** si cierras una tarea sin alimentar el cerebro, NO está completa —
el próximo "tú" (sin memoria) depende de lo que escribas hoy.

---

## §0 — Mapa de nodos de memoria (índice de enrutamiento)

El cerebro se divide en **nodos**. Auto-cargas SOLO `CLAUDE.md` + `05` + `10` (§G.1); el resto se lee on-demand por trigger (§G.2). Así no quemas contexto.

| Nodo neuronal | Archivo | Auto-carga | Cuándo leerlo |
|---|---|---|---|
| 🧠 **Tronco Encefálico** | `CLAUDE.md` (este) | ✅ Siempre | Router + identidad + doctrinas + gobernanza. |
| 🩺 **Estado Global (signos vitales)** | `docs/05-ESTADO-GLOBAL.md` | ✅ Siempre (boot) | Snapshot de salud: build, cache, branch, flags. "¿Dónde estoy parado?" antes de tocar nada. |
| 💓 **Estado DERIVABLE** | `docs/.estado-auto.md` | ✅ lo imprime el hook | Rama, HEAD, sucios, caché del SW, costo y deuda de consolidación: **se generan en cada arranque**. Gitignored, NO se edita; si contradice al `05`, manda ESTE. |
| ⚡ **Corto Plazo (WIP)** | `docs/10-MEMORIA-CORTO-PLAZO.md` | ✅ Siempre (2ª lectura) | Sprint actual, pendientes (TODO-NN), bitácora (estado técnico → `05`). |
| 🗃️ **Backlog** | `docs/11-BACKLOG.md` | ❌ on-demand | Los pendientes **SIN EMPEZAR** (🔲). Fuera del boot (01/08, dueño): el `10` es la pizarra del SPRINT. Vuelven al `10` al entrar en sprint; ninguno está cerrado. |
| 🛰️ **Consejo Externo** | `docs/15-CONSEJO-EXTERNO.md` | ❌ on-demand | Trigger de Decisión Fuerte (lista → §G.2 🛰️): crítica adversarial del **provider externo** (cuándo + tier → `15 §0`). |
| 🗺️ **Espacial** | `docs/20-MEMORIA-ESPACIAL.md` | ❌ on-demand | Trigger de Desorientación: dónde vive un componente, flujos, arquitectura, layouts. **Hija → `21` (panel/CRM).**  Hija: **`21-ESPACIAL-ADMIN.md`** (admin/CRM). |
| 🧪 **Procedimental (experiencia)** | `docs/30-LECCIONES.md` | ❌ on-demand | Trigger de Experiencia: ANTES de una op riesgosa/repetitiva (refactor CSS, tocar caché/SW) o si un síntoma "te suena". Gotchas + recetas + doctrinas Liquid Glass. **Hija → `31`.** |
| 🧩 **Hojas hijas de `30`** | `docs/31-LECCIONES-FIRESTORE.md` · `docs/32-LECCIONES-CARGA.md` · `docs/33-DOCTRINAS-CSS.md` · `docs/34-LECCIONES-META.md` · `docs/35-LECCIONES-DINERO.md` | ❌ on-demand | Backend · carga web · CSS/diseño · meta (`M-NN`) · dinero. El stub vive en `30` (ahí lo lee el kernel); el detalle, en la hija. |
| 🗂️ **Índice sináptico** | `docs/00-INDICE.md` | ❌ on-demand | ANTES de leer el historial (offset exacto) Y para el enrutamiento semántico (síntoma → neurona). Mapa § → línea de **§176+** + ruteo. |
| 🗂️ **Índice histórico** (hijas de `00`) | `docs/00a-INDICE-HIST.md` · `00b` · `00c` | ❌ on-demand | Range-shards (§140/§174/§193): §1–§115→`00a`; §116–§157→`00b`; §158–§175→`00c`. Madre `00` = ruteo + §176+. |
| 📚 **Largo Plazo** | `docs/99-HISTORIAL-ADR.md` | ❌ on-demand | Trigger de Error / detalle histórico de un §. NUNCA completo — usa offset/limit. |
| 🎯 **Lóbulos de Dominio** | `docs/40-LOBULOS-DOMINIO.md` | ❌ on-demand | Trigger 🔵 §G.2: registry de dominios; lóbulos hijos (`41-SEGURIDAD`/`42-LEGAL`/`43-UX`/`45-PERFORMANCE`…) nacen on-demand con contenido real. |
| 🏛️ **Arquitectura** | `docs/50-ARQUITECTURA.md` | ❌ on-demand | North-star técnico + **charter del CRM** (Fase 3). Léelo ante Decisión Fuerte o al diseñar/extender módulos. Resumen en §3.6. |
| 🔁 **Workflows reutilizables** | `docs/60-WORKFLOWS.md` | ❌ on-demand | Catálogo de recetas que detectan las MISMAS inconsistencias/errores (red-team de reglas, auditoría por dimensiones, verif. post-subagente, comité ×3…). Léelo antes de una revisión/auditoría/op repetitiva. |
| 🛠️ **Skills externas** | `skills/` + tool Skill | ❌ on-demand | Expertise de terceros (NO neurona; recurso paralelo). Consultar PRIMERO al disparar Trigger 🔵. **Catálogo → `docs/skills-inventory.md`**. |
| 📖 **Manual del cerebro** | `docs/INSTALACION-CEREBRO.md` | ❌ on-demand | Protocolo de instalación + reinstalación + migración entre versiones del template. Consulta al actualizar la versión del cerebro. |

**Hojas de detalle** (enlazadas desde su neurona madre, on-demand): nacen cuando hay contenido. Convención de nombre: `docs/<tema>.md`. Cada hoja queda referenciada desde la neurona madre — nada huérfano (§G.5).

### 🏆 Regla de oro anti-saturación (CÓMO leer el Largo Plazo)

NUNCA leas `docs/99-HISTORIAL-ADR.md` completo (puede llegar a 40k+ líneas = muerte por contexto). En su lugar:

1. `Read docs/00-INDICE.md` → encuentra la línea del § que buscas.
2. `Read docs/99-HISTORIAL-ADR.md offset=<línea> limit=~150` → lee SOLO ese tramo.

> ⚠️ La línea es **pista, no verdad absoluta**: si el tramo no arranca en el header
> esperado, regenera con `grep -n "^## "` o corre `npm run brain:check`.

---

## §1 — Identidad y arquitectura

- **Negocio**: Bersaglio Jewelry — e-commerce de **alta joyería colombiana** (esmeraldas, diamantes, oro 18k). Marca pearl/emerald/gold, estética editorial premium "Liquid Glass".
- **Stack**: HTML/CSS/JS **vanilla** (sin frameworks React/Vue; modularizado con **Vite**) + **Firebase SDK** (Auth, Firestore, Storage, FCM) + **GSAP** + **Lenis** (smooth scroll). CSS con `lightningcss`, imágenes optimizadas con `sharp-cli` (webp/avif).
- **Hosting / Deploy**: **GitHub Pages** (`bersagliojewelry.co` / `bersagliojewelry.github.io`). CI/CD vía **GitHub Actions** al pushear a `main`: `.github/workflows/deploy.yml` (Pages) + `firebase-deploy.yml` (rules/functions).
- **Project IDs / namespaces**: Firebase project `bersaglio-jewelry` (`.firebaserc`; config en `js/firebase-config.js` vía vars `VITE_*`).
- **Áreas**: (1) **Sitio público** (`index`, `colecciones`, `pieza`, `nosotros`, `contacto`, `carrito`, `journal`, `lista-deseos`, legales); (2) **Panel admin privado** (`admin*.html`, `js/admin/` — estilo oscuro, auth + versionado); (3) **Backend Firebase** (`functions/`, `firestore.rules`, `storage.rules`, `firestore.indexes.json`).
- **Secretos** (lista completa en `.env.example` — NO re-preguntar): `VITE_FIREBASE_*` + `VITE_VAPID_KEY` (FCM). El `.env` real existe local; NUNCA commitearlo.
- **Características clave**: inventario vivo → `05` §Sub-sistemas (dueño único, no se duplica aquí).
- **Entorno**: Windows 11 · PowerShell · raíz del repo · `Ctrl+Shift+R` tras bump de SW.

Detalle profundo de cualquier subsistema → `docs/20-MEMORIA-ESPACIAL.md` + ADRs vía `docs/00-INDICE.md`.

---

## §2 — Protocolo de documentación (OBLIGATORIO en cada commit relevante)

### Dónde documentar

- **WIP / tarea en curso**: se registra en el Corto Plazo (`docs/10-MEMORIA-CORTO-PLAZO.md`).
- **NUEVOS ADRs**: al cerrar una tarea, se APENDEN al final del Largo Plazo (`docs/99-HISTORIAL-ADR.md`) + fila en `docs/00-INDICE.md` (consolidación §G.3). NUNCA a este CLAUDE.md.
- **Este CLAUDE.md**: solo se edita cuando cambia algo always-on (una doctrina, el esquema de nodos, una regla de gobernanza). NUNCA historial ni pendientes ni cache version.

### Cómo documentar (formato canónico ADR)

Cada cambio funcional se documenta con una sección numerada (§NN) que incluye:

Encabezado `## <fecha> — <título>` (convención por fecha de este cerebro) + cita del cliente si reportó, y 7 puntos:
**NN.1** Causa raíz (RCA §3.3, verificada leyendo código) · **NN.2** Solución estructural (de fondo) ·
**NN.3** No-regresión (IDs/funciones/callsites intactos, build OK) · **NN.4** Tests / verificación ·
**NN.5** Anti-patterns evitados (§3) · **NN.6** Archivos modificados/INTACTOS ·
**NN.7** Doctrina aplicada + cache bump (si aplica §4).

### Reglas git

- **Quién commitea Y despliega: Claude, por defecto** (cliente 2026-06-06). **Commits**: `git add` ESPECÍFICO (nunca `-A`/`.`), footer `Co-Authored-By: <modelo Claude VIGENTE de la sesión> <noreply@anthropic.com>` (no copiar de commits viejos), separados por tipo (código vs cerebro). **Deploys**: solo con build/tests VERDES, anunciando qué (incidente L-14). Prod = merge `Desarrollo→main` (Pages) + `firebase deploy --only functions,firestore:rules`.
- NUNCA `--amend`/`--no-verify`/`--no-gpg-sign` sin pedido. NUNCA commitear secretos/datos privados (`.env`, credentials, `*.pem`, `*.xlsx`, `.claude/settings.local.json`).
- Al cerrar un pendiente, marcar su `TODO-NN` como ✅ + link al §X. Mantén este CLAUDE.md liviano.

---

## §3 — Doctrinas always-on (resumen ejecutable)

### 3.1 Performance
- NUNCA `transition: all` ni `* { transition }` global.
- NUNCA animar layout props (width/height/top/left/margin/padding) — solo `transform`/`opacity`.
- NUNCA `backdrop-filter` en listas de N elementos (solo superficies estructurales del cristal).
- Imágenes: `loading="lazy"` + `decoding="async"` below-fold; `fetchpriority="high"` solo LCP; servir webp/avif.

### 3.2 HTML/CSS / API estable
- NUNCA renombrar IDs/clases CSS/endpoints/funciones exportadas existentes sin migración. Cambios aditivos.
- Re-uso estricto de `renderPieceCardHTML` (`js/components/piece-card.js`) — único renderer de tarjetas de producto (L-03).
- Para sustituir un campo manteniendo callsites: alias + deprecación gradual.

### 3.3 Verifica, no asumas — evidencia antes de afirmar (UNIVERSAL)
- Antes de afirmar CUALQUIER hecho (código, git/remoto, config, estado, tus capacidades): cita la evidencia que leíste ESTE turno (archivo/comando). Si no lo verificaste → di "no verificado/creo" o ve a verificar. Caso código: LEE los paths ANTES de tocar.
- Bug recurrente o síntoma que no encaja: telemetría → diagnóstico → reporte → STOP → autorización → fix.
- Git: NUNCA afirmar estado de despliegue sin `git fetch` (refs `origin/*` locales son STALE).

### 3.4 IAP — Impact Analysis Previo
Antes de CUALQUIER commit no-trivial: 5 secciones → (A) archivos a modificar, (B) archivos INTACTOS verificados, (C) código muerto identificado, (D) refactor scope, (E) riesgos + rollback + tests.

### 3.5 Observadores y eventos globales
- CERO `MutationObserver` global con `subtree:true` que ejecute ops DOM (causa clicks bloqueados / loops). Usar refresh explícito desde el callsite.
- CERO `pointermove` persistente global (solo durante drag activo).
- Selectores substring `[class*="x"]` son peligrosos — matchean clases hijas; excluir namespaces con `:not()`.

### 3.6 🏛️ REGLA DE ORO — Piensa como arquitecto (SIEMPRE, antes de tocar nada)
> Tu trabajo va MÁS ALLÁ del código: decides cómo el sistema se conecta, escala, se asegura, cuesta y
> evoluciona. *El código hace que funcione; la arquitectura hace que sobreviva.*
- Cada cambio se decide por: **negocio · escalabilidad · seguridad-por-diseño · costo · mantenibilidad ·
  integración**. Escala = desacoplar, paginar/cachear, distribuir. Seguridad DESDE EL INICIO (authn · authz
  RBAC least-privilege · validación en servidor · datos en reposo), nunca al final. Costo = impacto
  técnico-financiero, no solo la factura. La UX del panel también es arquitectura: segmentado y ordenado.
- **Cero monolitos**: módulos desacoplados, límites claros, bajo acoplamiento. **Zero-budget/serverless**
  (Firebase): escala gestionada + event-driven — **NO** microservicios ni k8s por moda.

### 3.7 🧠 Calidad por defecto — auto-crítica SIEMPRE · Comité ×3 por iniciativa propia
- **Auto-crítica SIEMPRE (casi gratis)**: antes de entregar CUALQUIER respuesta sustantiva, una pasada
  interna — *¿qué falla? ¿asumí algo falso? ¿se puede mejorar?* — y corrige.
- **Comité ×3 por INICIATIVA PROPIA (caro)**: dispara `comite-expertos` SIN que lo pidan cuando la respuesta
  sea una DECISIÓN con consecuencias, tenga incertidumbre genuina, sea cara de revertir o un entregable
  importante. Anúncialo. En Decisión Fuerte suma la 2ª opinión externa (§G.2 🛰️).
- **NO en lo trivial**: datos, estados, ediciones mecánicas, ejecutar un plan ya decidido, charla.

## §4 — Cache bump (Service Worker · `public/sw.js`)

Bersaglio TIENE service worker (`public/sw.js`). Al cambiar comportamiento o archivos estáticos del shell:

- Incrementar `CACHE_NAME` en `public/sw.js` (bump siempre MAYOR). **El nº vigente NO se copia al `05`**: lo reporta el heartbeat en `docs/.estado-auto.md` (duplicarlo lo desincroniza). Cliente invalida con **Ctrl+Shift+R**.
- Estrategia SW: HTML network-first → cache → `/offline.html`; CSS/JS cache-first (Vite hashea; solo `SHELL_ASSETS` precachea). Cada shell lleva **Critical CSS inline** anti-FOUC (L-02).
- **Conflicto merge ↔ cache**: resolver → re-bump MAYOR → build OK → commit merge.

---

## §G — Gobernanza Neuronal (sistema nervioso · cómo operas la memoria)

Esta sección es tu sistema nervioso. Define qué lees, cuándo escalas y cómo
consolidas. **Es vinculante.**

### G.1 — Directiva de Ignorancia Selectiva (arranque de sesión)

Al iniciar una conversación estás **estrictamente obligado** a leer SOLO: (1) `CLAUDE.md` (auto-cargado);
(2) `docs/05-ESTADO-GLOBAL.md`; (3) `docs/10-MEMORIA-CORTO-PLAZO.md` (el WIP vivo). Al arrancar, **imprime
2-3 líneas de signos vitales** de `05` — procesarlas te obliga a saber dónde estás parado antes de tocar
código. **IGNORA el resto** (Espacial/Índice/Largo Plazo/hojas) salvo que un trigger (§G.2) o el usuario lo
pida. No leas el historial por si acaso.

### G.2 — Triggers de Recuperación (Escalation Path)

Cuando un trigger se dispara, leer su nodo deja de ser opcional:

- **🔴 Error / Saturación**: si fallas **2 veces** con el mismo bug, DETENTE y lee el Largo Plazo (`00` → tramo de `99`) buscando el § o un bug análogo ANTES de la 3ª solución (prohibido adivinar, §3.3). Loops o contexto saturado: consolida `10` (con 🚫 callejones) y ofrece relevo curado.
- **🟡 Desorientación**: dudas de DÓNDE vive un componente, ruta o flujo → **Espacial** (`20`) ANTES de tocar nada.
- **🧪 Experiencia**: ANTES de op riesgosa/repetitiva (mover/renombrar, merge/rebase, tocar SW o caché, refactor CSS, deploy de rules/functions) → **Procedimental** (`30` + hija). Si un síntoma te suena, ahí está la receta.
- **🟢 Historia**: el porqué de una decisión o el detalle de un § → Índice → Largo Plazo.
- **🔵 Auditoría/Dominio**: análisis especializado (seguridad/legal/UX/SEO/perf/a11y) → (1) skill relevante (`skills-inventory`); (2) `40-LOBULOS`; (3) neurogénesis del hijo con contenido REAL (§G.4); (4) capturar hallazgos + qué skill usaste.
- **🛰️ Decisión Fuerte**: ANTES de algo caro de revertir (arquitectura, modelo de datos, seguridad/legal, op irreversible) considera crítica adversarial del **provider externo** (`15`; otra familia, no-Claude). **Asesora, NUNCA edita**: el comité y el provider DEBATEN; tú deliberas, decides e implementas. Sin provider → sigues solo y marcas la decisión como NO revisada.

**Enrutamiento semántico**: ante una duda, NO escanees el cerebro. Ve al `docs/00-INDICE.md` (capa síntoma → neurona).

### G.3 — Protocolo de Consolidación (sinapsis)

La memoria fluye en UNA dirección: Corto Plazo → Largo Plazo. **Por cada tarea finalizada**: actualiza `10`.
**Cuando se cierra por completo**: MUEVE el recuerdo a `99` (ADR, formato §2) + fila en `00`, marca su TODO ✅
y **retíralo de `10`**. **Regla de PROPIEDAD (SSoT)**: un hecho = UN nodo dueño; el resto APUNTA (estado→`05`
· dominio→lóbulo · WIP→`10` · decisión→`99`). Duplicar estado = divergencia garantizada. **Regla de Oro**:
NUNCA historial ni tareas en este `CLAUDE.md`.

### G.4 — Sistema Autónomo de Auto-construcción (neuroplasticidad, bajo TU guía)

Reflejos VINCULANTES que disparas con juicio en el trabajo normal, **sin que el usuario los pida**. El cerebro crece solo — pero **nunca sin ti**.

- **Captura**: TODO conocimiento reutilizable → su neurona ANTES de cerrar (bug/lección → `30`; arquitectura → `20`; WIP → `10`; decisión cerrada → ADR en `99` + fila en `00`). **Deliberación** (comité / consejo externo / workflow, cara de reproducir) → CRUDO al `archiveDir` del manifest (bóveda `../brain-private/`) + SÍNTESIS con *callejones probados* ANTES de cerrar: el sacrificio de investigación ES conocimiento; perderlo = re-investigar.
- **Caza-bugs (el camino vivo, no solo el diff)**: al TOCAR o ROZAR un subsistema con estado observable (render/listener/CRUD/flujo), recórrelo END-TO-END antes de cerrar, sobre todo las fronteras del estado-cero (crear el 1er ítem y verlo en vivo Y al recargar; borrar el último y ver colapsar limpio). "Rozar" = mi diff cambia una entrada/salida/contrato o el estado que otro lee, aunque no edite su archivo. Maquinaria pesada SOLO si es caro de revertir. Skill `caza-bugs`. [HONOR]
- **Neurogénesis**: conocimiento reutilizable que no encaja y crecerá → crea `docs/NN-NOMBRE.md` + en el MISMO acto (1) fila en §0, (2) registro en `00`, (3) bitácora. Si dudas, apéndalo (anti-fragmentación). Lóbulos hijos de `40` nacen bajo Trigger 🔵 SOLO con contenido real, nunca vacíos por anticipado.
- **Frescura**: si mueves/creas/renombras/eliminas un componente, ruta o flujo → actualiza `20` (+ su hoja) en el MISMO cambio. Una neurona vieja engaña al próximo "tú".
- **Higiene = GC**: `10` es pizarra (cap → manifest). Al cerrar tarea, si supera el cap → PODA: cada tarea CERRADA a ADR en `99` + fila en `00`, lecciones a `30`, `05` si cambió la salud, recorta `10` al foco vivo + pendientes abiertos. ⛔ Nunca volcar a `99` sin convertir en ADR.
- **Auto-auditoría (arranque Y pre-cierre)**: corre **`npm run brain:check`**. Al ARRANCAR: si reporta problemas, o `05`/`10` están viejos, o hay tarea sin consolidar → arréglalo ANTES. Antes de cerrar/idle — PROACTIVO: barrido holístico (brain:check + **frescura vs git real**) → cerebro impecable para el próximo "tú".
- **Auto-mejora / Autocrítica / Desafío Crítico**: llena vacíos donde hubo fricción (re-investigar algo ya sabido = falta un índice o una lección). Si el cerebro contribuyó a un error: nombra el DEFECTO (stale / regla mala / routing errado / sobre-fragmentación), corrígelo en su nodo y registra el meta-aprendizaje en `30 §Meta` (detalle → `34`); si toca gobernanza → ADR + flag en `05`. Solo ante error real, nunca auto-duda en bucle. Cuestiona cualquier regla **con EVIDENCIA verificable** (regla → evidencia → reemplazo → aplicar o ADR): con evidencia ≠ a voluntad. *Un cerebro equivocado es peor que uno incompleto.*
- **Cierre (anti "lo documento después")**: NO está cerrada hasta verificar: ¿`10` al día? ¿`05` si cambió la salud? ¿decisión → ADR en `99` + `00`? ¿lección → `30` con su disparador? ¿cache §4? ¿`brain:check` SANO? **¿hubo deliberación → CRUDO + SÍNTESIS enlazados, o la tarea está INCOMPLETA** (✅ sin deliberación capturada = NO cerrada)? ¿auditoría → lóbulo hijo + skills registradas? Si falta algo, vuelve y hazlo.
- **Skills (§40)**: capacidad REUSABLE y PORTABLE (lo específico de ESTE proyecto va al cerebro) → sugiere crearla vía `skill-creator`; decide el cliente. **Skill = capacidad general; neurona/lóbulo = conocimiento del proyecto.** Skill nueva en `skills/` o `~/.claude/skills/` → `docs/skills-inventory.md` en el MISMO cambio. Backstop: `brain:check` #6.

**Regla de ADMISIÓN (anti-teatro)**: cada regla cita su gate del linter o lleva `[HONOR]` — el linter solo mecaniza caps/huérfanas/desync/skills/archiveDir; el resto de §G.4 es honor. No fingir mecanización.

**🛡️ Límite de guardián**: los reflejos ENRIQUECEN, nunca borran a la ligera. Eliminar o reescribir conocimiento histórico exige certeza verificada (§3.3). Ante la duda: **apendar, no sobrescribir; cuarentenar en `_legacy/`, no borrar.**

### G.5 — Capacidad de neuronas y Sharding (economía de contexto)

Una neurona sobrecargada satura el contexto. Cada una tiene un TOPE BLANDO (señal, no muro).
📏 **Los topes NO se listan aquí**: viven en `docs/.brain-manifest.json` (`caps`, en **chars** — la unidad real de contexto) y `brain:check` los valida en cada corrida. Copiarlos aquí los desincroniza.

🔻 **CÓMO se poda cada neurona** (mapa por nodo: `20` · `30`+hijas · `00`+shards · `99`) → `docs/60-WORKFLOWS.md §Mapa de PODA`.

- **Always-on (`CLAUDE.md` · `05` · `10`) = el boot**: no se engordan. **One-in-one-out**: toda regla nueva en el router DESPLAZA o fusiona una existente, jamás sube el tope — gate determinista: el kernel BLOQUEA el commit si el always-on supera `bootCharsTarget`. `05` se PISA (tablero, no bitácora); `10` se poda con el GC de §G.4. Nunca historial, tareas ni cache en el router.

**Reflejo de Sharding (neurogénesis por SATURACIÓN)**: al acercarse al tope NO la dejes engordar — extrae una sub-categoría coherente a una hermana `docs/NN-NOMBRE.md` y, como toda neurona nueva (§G.4): (1) fila en §0, (2) registro en `00`, (3) **puntero desde la MADRE a la hija**. 🔗 **Nada huérfano: si una neurona existe y `CLAUDE.md` no la conoce, el cerebro está roto.**

