# TODO-74 — Index carga fluida (skeleton + carga instantánea)

> **Origen**: Daniel 2026-07-08 — el visitante NUEVO/incógnito veía un HUECO EN BLANCO
> (sin señal de carga) entre el hero y la sección editorial, y la carga era lenta.
> Este doc captura la deliberación (comité ×3) + el plan, para no re-deliberar. SSoT de la
> Capa A (Decisión Fuerte). Detalle de código → commits `f5d4858` (Capa B) + ADR al cierre.

## Problema (verificado en código)

Las franjas dinámicas `Colecciones` (`js/home/categories.js`) y `Piezas destacadas`
(`js/home/featured.js`) se llenan desde Firestore (`data.load()` → `onSnapshot`). Estados:
`listo+datos → contenido` · `listo+bajo umbral → '' (colapsa, cero-ficción)` ·
`cargando → reservaba el alto guardado en localStorage, o '' si no había (1ª visita/incógnito)`.
→ En 1ª visita/incógnito **colapsaba a '' = hueco en blanco sin feedback** (decisión comité v3,
anti-CLS del recurrente). Además las piezas NO tienen semilla horneada (el hero sí, `__BJ_SC`
§163) → carga lenta en frío. Existe `catalogo.json` (SSG, `dist/data/`, CDN Pages) que el
cliente NUNCA consumió (paso "7b" planeado, `generate-pieces.mjs:690`).

## Deliberación — comité ×3 (2026-07-08, sobre hechos verificados, sin re-explorar)

4 expertos (perf/CLS · arquitecto datos · UX lujo · ejecutor+a11y). Tensión real
**escéptico-CLS vs ejecutor**, resuelta como **SECUENCIA**, no "o uno u otro":

- **Perf/CLS (escéptico)**: el fallo fatal es un skeleton "a lo bruto" — grilla llena de
  fantasmas que colapsa al llegar 1 pieza real = salto amplificado. Mitigar: POCOS fantasmas
  (4/3), reservar por `aspect-ratio` (NO `min-height` px). La cura real del salto es la Capa A
  (conteo real desde `catalogo.json` → primer paint = contenido, CLS=0).
- **Arquitecto datos**: `catalogo.json`-first + Firestore-live-upgrade es SWR canónico, PERO
  exige un **normalizador único** por el que pasen AMBAS fuentes; firma del diff-gate por
  `slug|name|image|price|tag|featured|available|order` (NO `updatedAt` crudo — formatos
  distintos = re-pintado perpetuo); comparar por `slug`, NUNCA por índice. Solo INDEX (carrito/
  checkout exigen verdad viva). `catalogo.json` NUNCA alimenta un cobro (revalidar antes).
- **UX lujo**: skeleton SÍ, pero NO el brillo gris SaaS → **cristal mate que respira** (pulso
  de opacidad 2.5s, velo esmeralda/dorado ≤6%, no barrido diagonal); pocos (3/4); encabezado
  SIEMPRE visible (ancla); pulsos desincronizados; con Capa A el skeleton casi no se ve.
- **Ejecutor+a11y**: "B sin A = 80% con 20% del riesgo" → B primero. Skeleton en la rama
  `else` (tras `_gaveUp`) reusando render/refresh → watchdog 8s sigue mandando; cero estado
  nuevo; cero-ficción intacta. `aria-busy`+`aria-hidden`; animar solo opacity (§3.1);
  off en `.bj-lite`+reduced-motion.

**Síntesis (presidente)**: el feedback de Daniel gana sobre el anti-CLS teórico (L-50). No es
skeleton-vs-instantáneo: es **B ahora** (skeleton, seguro, resuelve el hueco) **+ A después**
(instantáneo, cura la lentitud y vuelve el skeleton casi invisible con conteo real → CLS≈0).

## Capa B — Skeleton ✅ (commit `f5d4858`, cache v84, EN PROD por cherry-pick)

`css/home.css` (`.bj-skel` cristal que respira) + `featured.js`/`categories.js` (rama "cargando"
→ encabezado + 4 fantasmas / 3 tiles reusando `.home-featured-card`/`.cat-tile`). Solo PÚBLICO.
Validado live en prod (Chrome): skeleton → contenido real; secciones vacías colapsan; sin errores.
Gotcha: en pestaña `hidden` el skeleton persiste (Firestore + timers throttled) — correcto, no bug.

## Capa A — Carga instantánea (PENDIENTE · Decisión Fuerte)

**Plan**: `data.js` consume `catalogo.json` como fuente rápida del PRIMER paint (piezas+
colecciones reales al instante en frío) y Firestore `onSnapshot` hace live-upgrade con diff-gate.
**Reglas duras (comité, L-54)**: (1) normalizador único idempotente (Firestore crudo → derivar
`available` con `inventario-model` desde `cantidad/stockType`; timestamps → epoch); (2) firma por
`slug` (campos visibles normalizados, sin `updatedAt` crudo); (3) SOLO index; (4) `catalogo.json`
jamás alimenta un cobro; (5) fallback a skeleton si el fetch estático falla (404). Retirar
`reservedHeight` (superado por el skeleton). **Flujo**: consejo externo (read-only) + gate holístico.

## Checklist

- [x] Capa B skeleton implementada, build verde, cache v84 — evidencia: commit `f5d4858`.
- [x] Validada live en prod (Chrome holístico) — evidencia: skeleton→contenido real + secciones vacías colapsadas, 2026-07-08.
- [ ] Capa A: consejo externo + implementación con normalizador único + gate holístico.
- [ ] Cierre TODO-74: ADR en `99` + fila `00` + lección L-82 en `32` (skeleton cold-load supera reserva-en-blanco; gotcha pestaña hidden).
