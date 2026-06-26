# B1 · Paso 7 — `catalogo.json` a CDN (desacople costo/tiempo-real) — DISEÑO

> **Estado**: DISEÑO (Decisión Fuerte · arquitectura del sitio público + contrato de datos).
> **Autor**: Claude `[OPUS-4.8]` (2026-06-26). **Pendiente**: Comité ×3 (acotado) + 2ª opinión externa (Gemini) + luz verde Daniel.
> **NO codear hasta avalar** (W-11 / `feedback_flujo_completo_nunca_parcial`).
> Origen: fuga #8 del Consejo Externo (spec maestra §10.8) — "el público NO lee Firestore en vivo".

---

## 1. Problema verificado (evidencia, no asunción)

- **Hoy**: cada visitante público abre **listeners `onSnapshot` en vivo** a `pieces` (limit 500) y `collections`.
  Evidencia: `js/core/data.js` `load()` → `onPiecesChange`/`onCollectionsChange` (`js/firestore-service.js:316,367`).
- **Riesgo (fuga #8, ALTA)**: N visitantes × reads de Firestore = **costo que escala con el tráfico**; si una pieza
  viraliza (campaña Meta, prensa), la factura de reads se dispara. El catálogo público NO necesita tiempo real.
- **Ya existe la mitad de la solución**: el **SSG** (`scripts/generate-pieces.mjs`) ya lee `pieces`/`collections`/`journal`
  de Firestore **en el build (CI)** y hornea HTML+sitemap+listados a `dist/`, con guards anti-fail-silent probados
  (`SSG_SELFTEST`, `bake-integrity`) y filtro `isPublishable` (cero-demo). Corre en `deploy.yml`: push a `main` +
  **cron diario 07:00 UTC** + `workflow_dispatch`. El equipo YA aceptó "escrituras a Firestore NO disparan build → el
  cron las recoge" (comentario `deploy.yml:6-8`).

## 2. Objetivo

El público lee el catálogo desde un **artefacto estático cacheado en CDN** (cero Firestore reads en el camino feliz).
Firestore live queda **reservado a admin/POS/checkout** (donde el tiempo real SÍ importa: stock atómico). Mantener
frescura aceptable para el negocio + el patrón SWR ya existente (§108/§111). Cero regresión de SEO (SSG intacto).

## 3. Tres opciones (decididas por las 6 lentes de arquitecto)

| Lente | **A. CF trigger → Storage** (lo que propuso Gemini) | **B. SSG build → Pages** (recomendada) | **C. Híbrido (B + rebuild on-demand)** |
|---|---|---|---|
| **Negocio** | Frescura en segundos. | Frescura = cron diario + on-push (lujo "segundos" no es requisito: el checkout valida stock server-side, staleness = UX no integridad). | B + botón "Publicar" para Kary (frescura ~1-2 min cuando importa). |
| **Escala** | Storage egress por descarga (CDN si `cacheControl` ok). CF 1×/guardado. | **Pages CDN (Fastly) gratis e ilimitado. CERO reads, CERO egress.** | = B en camino feliz. |
| **Seguridad** | Nuevas `storage.rules` (`read:true`) + la CF debe sanitizar/proyectar. Superficie nueva. | Generado en CI controlado, **reusa guards anti-XSS del SSG**, same-origin (sin CORS). | = B. |
| **Costo** | CF (free 2M) + storage + **egress real si viraliza**. | **Cero costo incremental.** ← gana (`50` L30: máximo valor, mínimo costo). | = B + 1 dispatch/publicación. |
| **Manten.** | Nueva CF (deploy manual L-22) + reglas + invalidación + **2º generador = duplica proyección → divergencia**. | **Reusa pipeline SSG probado (DRY). Una sola proyección pública. Cero deploy manual.** ← gana | B + workflow `repository_dispatch` (complejidad media). |
| **Integración** | `fetch` cross-origin a Storage (CORS + `cacheControl`, gotcha L-53). | `fetch` same-origin `/data/catalogo.json` (ETag/304 nativo Fastly). ← más limpio | = B. |

**Veredicto preliminar de arquitecto: OPCIÓN B** (SSG→Pages + consumo SWR), con **C como evolución**.
> ⚠️ **REVISADO tras Comité ×3 (§9): el veredicto pasa a C (B + rebuild on-demand OBLIGATORIO).** El núcleo de B
> (estático en Pages, cero egress, DRY) se mantiene; pero la frescura on-demand deja de ser opcional. Lee §9. Diverge de la spec/Gemini (que propuso A) — justificación por evidencia (Reflejo de Desafío
Crítico §G.4): el SSG ya hace el 90% del trabajo en CI gratis; Pages CDN es gratis/ilimitado vs egress de Storage;
DRY (una proyección, no dos); L-53 muestra que Storage tiene gotcha de caché ya sufrido. **Esta divergencia es
exactamente lo que el consejo externo (Gemini, autor de la propuesta A) debe revisar.**

## 4. Punto de tensión para el Comité/Consejo: FRESCURA

Único eje donde A gana. ¿Es aceptable que una pieza marcada "vendida" por Kary siga visible en el **listado** público
hasta el próximo build (≤24h con solo cron)?
- **Mitigación dura (ya alineada con la spec)**: la **ficha de pieza** y el **checkout** revalidan stock contra
  Firestore live (1 read puntual) → una pieza vendida muestra "no disponible" aunque el listado la mostrara. Firestore
  reservado a "checkout/login" = lo que la spec misma pide. Integridad garantizada por `crearPedido` (candado atómico).
- **Mitigación de UX (opción C, follow-up)**: botón "Publicar catálogo" en admin → `repository_dispatch` → rebuild ~1-2 min.
- **Decisión a avalar**: ¿arrancamos con B puro (cron + revalidación puntual en ficha) y C queda como follow-up, o C entra ya?

## 5. Contrato del `catalogo.json` (cara de revertir → fijar con cuidado)

Proyección **PÚBLICA** (whitelist de campos — NUNCA volcar el doc crudo; sin costo/peso-taller/notas internas).
Reusa exactamente los campos que el SSG ya proyecta para el schema + los que el cliente necesita para listar/filtrar:

```jsonc
{
  "version": 1,                    // schema-version del contrato (para evolución no-rompedora)
  "generatedAt": "2026-06-26T...", // ISO; el cliente lo usa para diff-gate / "actualizado hace X"
  "collections": [ { "id", "slug", "name", "featured", "order" } ],
  "pieces": [ {
     "id", "slug", "name", "code", "collection",
     "price",            // number | null (null = "bajo consulta"; NUNCA 0)
     "images",           // [url, ...] (Storage https)
     "featured",         // bool (grilla home)
     "specs": { /* whitelist AEO: gema, carat, color, clarity, metal, weight, certificate, origin */ },
     "available"         // bool derivado de estado≠vendida (para badge; el checkout es la verdad)
  } ]
}
```
- **Sólo `isPublishable`** entra (cero-demo: sin "PRUEBA", con nombre+imagen).
- El cliente NO confía en `available` para vender (es señal); la **verdad de stock es `crearPedido`** (server-side).
- Reusar `pieceSlug()` del SSG (mismo contrato de slug que `js/core/urls.js`) → links coherentes.

## 6. IAP (Impact Analysis Previo)

**(A) A modificar**:
- `scripts/generate-pieces.mjs`: + función pura `buildCatalogJson(pieces, collections)` (proyección whitelist) +
  escribir `dist/data/catalogo.json` en `main()` + caso en `SSG_SELFTEST` (valida proyección no filtra campos internos
  ni rompe con payload XSS). Reusa `isPublishable`, `pieceSlug`, `slugMap`.
- `js/core/data.js`: `load()` lee `catalogo.json` (fetch SWR cache-first) como **fuente primaria**; el `onSnapshot`
  live deja de abrirse en público (se conserva el wrapper para admin/POS). Getters (`getAll`/`getFeatured`/…) intactos
  (mismo shape de datos) → consumidores (`catalogo.js`/`home.js`/`pieza.js`) **NO cambian** (§3.2 API estable).
- `public/sw.js`: cachear `/data/catalogo.json` (network-first o SWR) + **cache bump** (§4).

**(B) INTACTOS (verificado)**: `firestore-service.js` (wrappers se conservan, los usa admin/POS) · `firestore.rules`
(las reglas de read público de `pieces`/`collections` siguen — el SSG y el fallback las usan) · todo `js/admin/*`
(sigue en Firestore live) · `crearPedido`/POS · CRM. **NO** se crea CF nueva, **NO** se tocan `storage.rules`.

**(C) Código muerto**: ninguno (los listeners live quedan para admin).
**(D) Refactor scope**: acotado — 1 script + 1 capa de datos + SW. Sin tocar UI ni backend.
**(E) Riesgos + rollback + tests**:
- *Riesgo*: si `catalogo.json` falla al cargar (404/parse), el público se queda sin catálogo. **Mitigación**:
  fallback a `onSnapshot` live (degradación elegante) + el SSG aborta el build si el JSON sale inválido (guard tipo
  `bake-integrity`) → prod queda en el último build bueno.
- *Riesgo*: staleness (§4). Mitigado por revalidación puntual en ficha + checkout server-side.
- *Rollback*: revertir `data.js` a `onSnapshot` (1 commit) — el wrapper sigue ahí.
- *Tests*: `SSG_SELFTEST` extendido (proyección no filtra campos internos, no rompe con XSS, `available` correcto) +
  build verde + `brain:check`. Pruebas en vivo DIFERIDAS al final del plan+rediseño (§130.4).

## 7. Plan de implementación (tras aval) — por sub-pieza, build+tests por commit

1. **7a** `buildCatalogJson` puro + emisión `dist/data/catalogo.json` + guard + caso `SSG_SELFTEST`. (Sin tocar cliente.)
2. **7b** `data.js`: consumo SWR de `catalogo.json` con fallback a live. + cache bump SW.
3. **7c** (decisión §4) revalidación puntual de stock en ficha (`pieza.js`) — o confirmar que ya ocurre en checkout.
4. **7d** (opción C, follow-up) botón "Publicar" + `repository_dispatch` — solo si Daniel lo quiere ya.

## 8. Decisiones abiertas a avalar
1. **Frescura on-demand: automática (dispatch desde CF) vs botón manual (Kary "Publicar")** — §9. Recomiendo dispatch
   automático desde las CF de venta ya existentes (cero acción de Kary, frescura ~2 min, sigue sirviendo Pages = cero egress).
2. **Confirmar** con el consejo externo (Gemini, autor de A) que la síntesis C-automatizado es aceptable vs su CF→Storage.

---

## 9. REVISIÓN tras Comité ×3 (acotado · 2026-06-26) — el diseño cambia

Comité de 4 expertos en paralelo (arquitecto serverless · FinOps Firebase · escéptico e-commerce de lujo · ejecutor
frontend SWR/SW), contexto inline, anti-anclaje (se les dio el problema CRUDO + las 3 opciones, no mi conclusión como
verdad). Cero cuelgues (`feedback_workflows_acotados` respetado). Crudo de los 4 aportes → bóveda/transcript;
síntesis del presidente abajo. **Ganó su sueldo: el diseño v1 (B puro) tenía 4 fallos reales.**

### 9.1 Cambios NETOS al diseño (lo que el comité tapó)
1. **B puro → C, y la frescura on-demand es PISO MÍNIMO, no follow-up** (los 4 convergen; el escéptico tajante).
   Con piezas ÚNICAS, mostrar una vendida como disponible ~24h NO es "solo UX": quema presupuesto de Meta Ads (catálogo
   dinámico apuntando a piezas vendidas), links de WhatsApp/recos a piezas vendidas, doble-promesa a clientes de alto
   valor. **Síntesis: la verdad de stock va al CHECKOUT (`crearPedido`, ya existe); la frescura del LISTADO se resuelve
   con rebuild on-demand** → al marcar vendida (vía CF de venta) se dispara un `repository_dispatch` a Actions → rebuild
   en ~1-2 min. Baja la ventana de staleness de ~24h a ~2 min sin egress de Storage (sigue sirviendo Pages). Esto
   converge con la intención de Gemini (frescura) SIN el costo de egress de su Opción A.
2. **El fallback "→ onSnapshot live" es un FUSIBLE INVERTIDO** (arquitecto + ejecutor): si el JSON cae tras un bad
   deploy, TODO el tráfico vuelve a Firestore justo en el pico viral = reintroduce la fuga. **Fix: fallback al ÚLTIMO
   JSON cacheado (stale), NO a Firestore live masivo.** Firestore live queda solo para admin/POS/checkout.
3. **La fuga REAL a escala NO es el listado: es el stock-check por-ficha** (FinOps): 1 read por vista de ficha escala
   1:1 con el tráfico. **Fix: NO revalidar stock en cada ficha** (eliminar el 7c original); la disponibilidad optimista
   del JSON + el rechazo atómico de `crearPedido` en el checkout bastan. (Con C, el listado ya es fresco a ~2 min.)
4. **Caché del JSON — el bug letal** (arquitecto + ejecutor): si `/data/catalogo.json` entra cache-first en el SW sin
   versionar, se sirve viejo PARA SIEMPRE (el `generatedAt` interno nunca llega). **Fix: (a) URL versionada por build
   (`/data/catalogo.json?v=<buildId>` o `catalogo.<hash>.json`); (b) SW = stale-while-revalidate SOLO para ese path,
   NO cache-first, NO dentro de `SHELL_ASSETS`; (c) NO bumpear `CACHE_NAME` por cambio de datos — desacoplar datos de
   código.** `Cache-Control: max-age=60, stale-while-revalidate` en Pages.

### 9.2 Guards y método (lo que el comité exige antes de codear)
- **Guard de monotonicidad en el SSG** (arquitecto): si el nuevo `catalogo.json` tiene < ~80% de las piezas del
  anterior → FALLAR el build (anti-catálogo-menguado silencioso por un campo nuevo o estado intermedio). Suma al
  `bake-integrity` existente.
- **Contrato byte-idéntico a los getters** (ejecutor): el shape del JSON debe ser EXACTO al que devuelven
  `getAll()/getFeatured()/…` hoy (`{id, ...data}`; Timestamps serializados como string, no objeto) o revienta a
  `catalogo.js`/`home/*`/`pieza.js` sin tocarlos. **Método: primero el SSG + un test `deepEqual(jsonShape, docReal)`
  que CONGELE el contrato; recién con el shape verificado, refactorizar `data.js`.**
- **Race fetch vs fallback** (ejecutor): fetch es el camino primario; `onSnapshot`/stale SOLO en el `.catch()`, nunca
  en paralelo. Flag `this.source` ('fetch'|'cache'|'live') para que un resultado tardío de la rama abandonada no
  re-notifique. El `timeout 4s` pierde sentido con caché síncrona → queda solo como guard de la rama fallback.
- **Imágenes NO en Pages** (FinOps): el JSON lleva URLs de Storage (ya es así: `getFullImage` espera https:// de
  Storage). Confirmar que ninguna imagen pesada se sirva desde Pages (soft-limit ~100GB/mes).

### 9.3 Punto ciego de TODOS (añadido por el presidente)
- **Feed de Meta Ads**: si existe (o existirá) un product feed para Meta catálogo dinámico, DEBE derivarse del MISMO
  `catalogo.json` (un único punto de invalidación). Hoy probablemente no existe (pre-lanzamiento), pero el contrato del
  JSON debe ser la fuente única para que el futuro feed no sea una 3ª copia divergente.

### 9.4 Plan revisado (reemplaza §7)
1. **7a** SSG: `buildCatalogJson` puro (shape byte-idéntico) + `dist/data/catalogo.json` + guard monotonicidad + caso
   `SSG_SELFTEST` (no filtra campos internos, no rompe con XSS) + **test `deepEqual` que congela el contrato**.
2. **7b** `data.js`: fetch SWR de `catalogo.json` (URL versionada) con fallback a **stale cacheado** (no live); flag
   `source`. SW stale-while-revalidate para ese path (fuera del shell). Cache bump solo si cambia el shell.
3. **7c** Frescura on-demand: `repository_dispatch` disparado desde las CF de venta (`crearPedido`/`anularPedido`)
   → rebuild del catálogo. (Decisión 8.1: automático vs botón manual.)
4. **7d** Confirmar que el checkout (`crearPedido`) es la única verdad de stock (ya lo es) — sin revalidación por-ficha.

---

## 10. Integración del Consejo Externo (Gemini 3.1 Pro · 2026-06-26) — DISEÑO v3

Daniel corrió el prompt; Gemini confirmó **C como ganadora** ("A muere aquí": A solo actualizaba el JSON, dejaba el
HTML horneado con schema obsoleto hasta el cron — C unifica HTML+JSON vía `repository_dispatch`). Pero cazó 3 huecos
graves de la C redactada en §9. Peer review verificado contra el código (no acatado) → crudo+análisis en bóveda
`2026-06-26-consejo-externo-b1-paso7-RESPUESTA.md`. **3 correcciones adoptadas, 1 refutada.**

### 10.1 BUG LETAL SEO (el hallazgo que ni el comité ni Claude vimos) — P0 BLOQUEANTE
`scripts/generate-pieces.mjs:174-186` hornea `availability: InStock` (o `PreOrder` sin precio) **sin mirar nunca
`estado`**; `isPublishable` solo filtra nombre+imagen. El estado de venta real es `estado==='vendida'`
(`pos.js:77`, default tolerante `'disponible'`). → al regenerar tras una venta, el HTML `/pieza/<slug>.html` dice
InStock + muestra precio en `<noscript>` → Google/Merchant indexan piezas **vendidas como activas** (discrepancia de
stock, hunde conversión). **Hueco PRE-EXISTENTE**: el catálogo público hoy NO es stock-aware.
**Fix (antes de lanzar el paso 7)**: el SSG lee `estado`; si `vendida` → emite `availability: https://schema.org/OutOfStock`
+ oculta el precio en el `<noscript>` + CTA "vendida · ver similares". El mismo `estado` alimenta `available` en el
`catalogo.json` y un badge en la grilla.
> 🔵 **Decisión de NEGOCIO — RESUELTA (Daniel 2026-06-26)**: opción **(a)** — la pieza vendida **sale del listado
> activo** pero **su página vive** con "Vendida · ver similares" (bueno SEO, no rompe links, alimenta deseo).
>
> **Implicaciones técnicas resueltas (contrato/SSG):**
> - `catalogo.json` incluye **TODAS** las publicables (incl. vendidas) con `available` (= `(estado||'disponible')!=='vendida'`).
>   La **grilla** (`catalogo.js`, 7b) filtra `available`; la **ficha** (`pieza.js`, 7c) muestra la vendida con sello.
>   (Así la ficha hidrata por JS aunque la pieza esté vendida — si la excluyéramos del JSON, la ficha JS no la encontraría.)
> - **SSG hornea** la página de la vendida (`OutOfStock` + sin precio + sello), pero la **EXCLUYE del listado horneado**
>   (`injectListingPage` colecciones) y del catálogo activo de la grilla.
> - **Fechas** (`createdAt`/`updatedAt`): serializar como `{ seconds: <num> }` (el cliente usa `.seconds`,
>   `catalogo.js:65`) → no se toca el consumidor. El shape del doc es `{ id, ...data }` (`firestore-service.js:271`).
> - **Test del contrato**: cobertura de CLAVES (el JSON ⊇ claves que el cliente lee: `id,slug,name,code,collection,
>   price,images,featured,sizes,specs,description,createdAt/updatedAt,available`), NO deepEqual byte-a-byte (los
>   Timestamps difieren entre objeto Firestore y `{seconds}`).

### 10.2 Contrato incompleto — VERIFICADO, corrige §5
Mi whitelist §5 OMITÍA campos que el cliente SÍ consume: `description` (`pieza.js:85`), `sizes` (`pieza.js:204`),
`createdAt`/`updatedAt` (orden del catálogo, `catalogo.js:64-66`), specs completos (similares, `pieza.js:311`).
**Principio corregido del contrato**: incluir **TODO campo que el cliente renderiza/ordena**; excluir **solo**
internos (costo, peso-taller, notas). El test `deepEqual(jsonShape, getAll()[0])` (§9.2) lo garantiza.

### 10.3 Revalidación en ficha — RESTAURADA (Gemini refuta al FinOps del comité)
El §9.1.3 (eliminar la revalidación por-ficha) era sobre-optimización de costo a expensas de la reputación: en lujo
1-de-1, un VIP que se entera AL FINAL de que la pieza no existe es tóxico. **Verificado**: el tráfico de fichas <<
listados (a ~5k vistas/día = 5k reads; free 50k/día) → el costo es asumible. **Fix**: restaurar el **read optimista
no-bloqueante en `pieza.js`** (pinta del JSON al instante; en background 1 `getDoc` → botón "Agotado" si vendida).
SOLO en la ficha, no en grilla/home (respeta §108 solo-público). El listado tolera ~2 min de staleness; la ficha no.

### 10.4 Blindar `repository_dispatch` — ADOPTADO (aterrizado al stack)
`deploy.yml:18-20` tiene `concurrency: group:pages, cancel-in-progress:true` → ráfaga de ventas = coalescencia
(builds se cancelan entre sí): bueno anti-rate-limit, pero extiende la ventana de stock-fantasma (la cubre 10.3).
**Fallo silencioso**: si el PAT expira / Actions cae, el JSON no se reconstruye y Kary no se entera. **Fix**: el
request a la API de GitHub desde la CF (`crearPedido`/`anularPedido`) en **try/catch que NO interrumpe la venta** +
alerta a **`saludEventos`/`salud`** (mismo patrón del blindaje del recálculo de saldo §64; NO Sentry/Slack — no
cableados). **PAT en Secret Manager, scope mínimo** (`workflow`/`repository_dispatch`).

### 10.5 Refutado
- **A no es necesaria** (Gemini mismo concluye que muere): el read-en-ficha (10.3) cubre la concurrencia/hype-drop;
  la verdad atómica ya está en `crearPedido`. Para alta joyería "500 a la misma pieza única en 2 min" es marginal.
- Gemini asumió **Spark**; el proyecto ya es **Blaze** (tiene CFs) — no cambia ninguna conclusión.

### 10.6 Plan v3 (reemplaza §9.4) — orden por riesgo
1. **7a-SSG-stock** (P0): `generate-pieces.mjs` stock-aware (`OutOfStock` + sin precio si vendida) + `buildCatalogJson`
   puro con contrato COMPLETO (10.2) + guard monotonicidad + `SSG_SELFTEST` + test `deepEqual` que congela el contrato.
2. **7b-cliente**: `data.js` fetch SWR de `catalogo.json` (URL versionada, fallback a stale, flag `source`) + SW
   stale-while-revalidate fuera del shell + cache bump.
3. **7c-ficha**: read optimista no-bloqueante en `pieza.js` (badge "Agotado" pre-checkout, solo-público).
4. **7d-frescura**: `repository_dispatch` blindado desde las CF de venta (try/catch + `saludEventos` + PAT scope-mín).
   (Decisión 8.1 automático vs botón manual sigue abierta; recomiendo automático.)
> **Flujo fuerte COMPLETO** ✅: arquitecto + comité ×4 + consejo externo (Gemini) integrado. Listo para implementar
> tras luz verde de Daniel + la decisión de negocio 10.1.

---

## 11. Principio de escasez / exclusividad (Daniel 2026-06-26) — diseño + copy

**Validación (verificada en código)**: el sitio público **NO maneja escasez hoy** (cero menciones de
stock/unidades/queda en `js/pages|components|home`). El contrato del `catalogo.json` (§10.2) ya expone
`stockType`/`available`/`cantidad` → base lista para construirlo.

**Restricción de honestidad (cero-demo + precisión, `feedback_no_demo_en_index`)**: el POS
(`pedidos-core.js:78`) **NO decrementa `cantidad`** — al vender una pieza finita marca TODA la pieza
`estado='vendida'` (cantidad efectiva → 0). Es decir, el modelo actual trata cada pieza como **ÚNICA**
(las 9 reales son `finito`/`cantidad:1`). **"Quedan N unidades" con N>1 NO sería honesto** hasta que el
modelo soporte inventario multi-unidad real (el POS decrementaría cantidad en vez de marcar vendida toda
la pieza) — eso es una mejora de fondo (inventario, B3 del plan maestro), no este paso.

**Reglas de escasez (derivadas de `stockType` + `cantidad` + `available`):**
| Caso | Condición | Badge (copy) | ¿Honesto hoy? |
|---|---|---|---|
| Pieza única | `finito` · `available` · `cantidad===1` | **"Pieza única"** | ✅ (todas las piezas actuales) |
| Penúltimas | `finito` · `cantidad===2` | **"Solo quedan 2"** | ⏳ requiere multi-unidad real |
| Última | `finito` · `cantidad===1` (tras haber tenido más) | **"¡Última unidad!"** | ⏳ requiere multi-unidad real |
| Pocas | `finito` · `cantidad ≤ 3` | **"Pocas unidades"** | ⏳ requiere multi-unidad real |
| Por encargo | `stockType==='encargo'` | **"Hecho por encargo"** (sin urgencia) | ✅ |
| Vendida | `!available` | fuera del listado · ficha "Vendida·ver similares" (§10.1) | ✅ (paso 7) |

**Recomendación (2 fases):**
- **Fase A (ahora, honesta, cubre el 100% real)**: badge **"Pieza única"** (exclusividad de lujo, no presión
  barata) para `finito`/`cantidad:1` + **"Hecho por encargo"** para `encargo`. Se implementa en el cliente
  (grilla `catalogo.js` + ficha `pieza.js`) junto con 7b/7c (cuando el cliente lea el `catalogo.json`).
- **Fase B (futuro)**: inventario multi-unidad real (POS decrementa `cantidad`) → habilita "Solo quedan N" /
  "¡Última unidad!" honestos. → TODO-40.

> 🔵 **Decisión de producto para Daniel**: ¿Fase A ya ("Pieza única" + "Hecho por encargo", honesto para el
> catálogo actual) y Fase B cuando haya piezas en serie? ¿O el negocio ya tiene piezas multi-unidad reales que
> justifiquen construir el inventario por unidad antes?
