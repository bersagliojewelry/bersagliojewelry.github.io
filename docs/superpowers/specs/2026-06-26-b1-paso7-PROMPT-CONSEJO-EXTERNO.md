# PROMPT para Consejo Externo (Gemini 3.1 Pro · High) — B1 Paso 7 `catalogo.json` a CDN

> **Daniel: copia TODO el bloque de abajo en Antigravity (Gemini 3.1 Pro, High) y tráeme la respuesta.**
> Es una Decisión Fuerte (arquitectura del sitio público + contrato de datos). Gemini ve el repo en
> solo-lectura; el prompt referencia archivos reales. Gemini ASESORA, NUNCA edita — yo delibero/decido/implemento.

---

Eres un revisor de arquitectura adversarial. Tienes acceso de SOLO LECTURA a este repositorio (alta joyería
Bersaglio, HTML/JS vanilla + Vite + Firebase + GitHub Pages). NO propongas editar archivos: solo critica.
**Tú mismo propusiste hace unos días la "Opción A" de abajo (fuga #8 de tu pasada anterior). Ahora Claude
DIVERGE hacia una síntesis "C". Tu trabajo NO es defender tu propuesta por ego ni rendirte por cortesía: es
cazar el fallo en el razonamiento de Claude con evidencia. Si A sigue siendo superior, demuéstralo.**

## Problema (crudo)
Hoy CADA visitante del sitio público abre listeners Firestore `onSnapshot` en vivo a `pieces` (≤500) y
`collections` — ver `js/core/data.js` (`load()` → `onPiecesChange`/`onCollectionsChange` en
`js/firestore-service.js`). Eso hace que el costo de reads escale con el tráfico (fuga si una pieza viraliza por
campaña Meta/prensa). El catálogo público NO necesita tiempo real. El checkout ya valida stock atómico
server-side con la Cloud Function `crearPedido` (candado = pieza). Las piezas son ÚNICAS (1 unidad c/u).

Contexto de código que YA existe (revísalo):
- `scripts/generate-pieces.mjs` — SSG que en el build del CI lee `pieces`/`collections`/`journal` de Firestore y
  hornea HTML por pieza + sitemap + listados, con guards anti-fail-silent (`SSG_SELFTEST`, `bake-integrity`,
  `isPublishable` cero-demo).
- `.github/workflows/deploy.yml` — Pages auto-deploy: push a `main` + cron diario 07:00 UTC + `workflow_dispatch`.
- `public/sw.js` — Service Worker (HTML network-first; CSS/JS cache-first; bump de `CACHE_NAME`).
- `docs/superpowers/specs/2026-06-26-b1-paso7-catalogo-cdn-design.md` — el diseño completo + la revisión del comité.
- Lección registrada `docs/32-LECCIONES-CARGA.md` L-53: Firebase Storage sin `cacheControl` sirve `private, max-age=0`.

## Las 3 opciones
- **A (tu propuesta original)**: Cloud Function trigger onWrite(pieces/collections) → compila `catalogo.json` →
  Firebase Storage/CDN; el público lo lee gratis. Frescura: segundos.
- **B**: extender el SSG existente para emitir `dist/data/catalogo.json` servido por GitHub Pages CDN. Frescura:
  cron diario + on-push. Cero costo incremental, reusa pipeline probado, same-origin, sin deploy manual.
- **C (síntesis de Claude tras su comité interno)**: núcleo de B (SSG→Pages, cero egress de Storage) + rebuild
  ON-DEMAND: al marcar una pieza vendida (vía las CF de venta `crearPedido`/`anularPedido` ya desplegadas) se
  dispara un `repository_dispatch` a GitHub Actions → rebuild del catálogo en ~1-2 min. La verdad de stock vive
  en el checkout (`crearPedido`); el `available` del JSON es solo una señal optimista. Fallback si el JSON cae:
  servir el último JSON cacheado (stale), NO volver a Firestore live. SW con stale-while-revalidate + URL del JSON
  versionada por build. Guard de monotonicidad en el SSG (si #piezas cae <80% → falla el build).

## Invariantes que cualquier opción DEBE cumplir
1. Cero contenido demo en prod (cero-demo). 2. Máximo valor con MÍNIMO costo (free tier; sin cargo-cult).
3. SEO/SSG intacto (el HTML horneado sigue siendo la base de visibilidad). 4. La caché del catálogo NO debe
contaminar el CRM (lección dura: caché global contagió el CRM → solo-público). 5. Deploy de reglas/functions es
MANUAL. 6. La verdad de stock es server-side (`crearPedido`), no el cliente.

## Preguntas (sé específico, con evidencia del código)
1. ¿La síntesis C es realmente superior a tu A para ESTE stack, o hay un fallo que Claude no vio? ¿En qué
   escenario concreto A (CF→Storage, frescura en segundos) sigue siendo necesaria pese al costo de egress?
2. ¿El `repository_dispatch` desde una Cloud Function tiene una trampa (latencia real, fiabilidad, rate-limit de
   Actions ~10 builds/hora, fallo silencioso, ráfaga de ventas → ráfaga de builds)? ¿Cómo lo blindarías?
3. ¿"La verdad de stock solo en el checkout, sin revalidar por-ficha" deja un hueco operativo o reputacional en
   joyería de lujo que justifique más frescura (grilla/búsqueda/recos/links de WhatsApp/feed de Meta Ads)?
4. ¿El contrato del `catalogo.json` (§5 del diseño) omite algún campo o expone alguno que NO debería ser público?
5. ¿Qué riesgo de segundo orden se le escapó al comité de Claude y a ti?

No te subordines a Claude ni a tu yo anterior. Veredicto claro: A, B o C, y por qué.
