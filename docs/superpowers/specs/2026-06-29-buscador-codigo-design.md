# Buscador por CÓDIGO — DISEÑO (TODO-58)

> Feature acotada (no Decisión Fuerte: aditiva, reversible = quitar la caja). Autor: Claude `[OPUS-4.8]`
> (2026-06-29). Pedido de Daniel: Kary le da el código de una pieza al cliente → el cliente la encuentra y
> la compra en la web → impulsa la venta presencial/WhatsApp y el uso de Wompi. Respuestas de Daniel
> (AskUserQuestion): **alcance = buscador + link** · **ubicación = catálogo + acceso en inicio**.

## 1. Problema / valor
Kary atiende presencial o por WhatsApp y conoce el **código** de la pieza (ej. `0953`). Hoy no hay forma de
que el cliente salte directo a ESA pieza en la web. Esto cierra el puente venta-presencial → web (y, cuando
Wompi 2c esté vivo, → cobro online). El código es ÚNICO → no es un "filtro" sino un **salto directo** a la pieza.

⚠️ **Precisión (no humo)**: el "comprar con Wompi en la web" depende de **Wompi 2c** (legal + llaves prod, TODO-42/49, aún pend). El buscador funciona YA (lleva a la pieza con el flujo actual) y deja el camino listo para cuando Wompi prod encienda.

## 2. Verdad verificada (ground truth)
- Cada pieza tiene `code` ÚNICO (ej. "0953") + URL canónica `pieceUrl(p)` → `/pieza/<slug>.html` (`js/core/urls.js`).
- `js/core/data.js` (singleton compartido catálogo↔home): `getAll/getByCollection/getBySlug`; **falta `getByCode`**.
- `js/pages/catalogo.js`: filtros en `renderFilters()` (`.cat-controls`); datos en memoria vía `data`.
- `js/pages/home.js`: compone secciones de `js/home/*`; comparte `data`.
- SSG (`scripts/generate-pieces.mjs`): hornea piezas en `dist/pieza/<slug>.html` (loop ~L741) + `catalogo.json`.
- `public/404.html`: ya redirige `/pieza/<slug>.html` faltante → `/pieza.html?p=<slug>` (patrón reutilizable).

## 3. DISEÑO (4 piezas · todo ADITIVO)
1. **`data.getByCode(code)`** (data.js): busca `_pieces` por `code` normalizado (trim) → pieza | null. Reusable.
2. **Buscador por código** (componente compartido `js/core/buscador-codigo.js`): input + botón. Submit →
   `data.getByCode` → si halla, `location.assign(pieceUrl(p))` (1 salto al canónico); si NO halla y los datos
   están listos → mensaje amable inline ("no encontramos ese código" + WhatsApp); si los datos no cargaron →
   navega a `/p/<code>` (lo resuelve el stub; inexistente → 404). Montado en **catálogo** (en `.cat-controls`)
   y en **inicio** (banda discreta).
3. **Link compartible `/p/<code>`** (SSG bakea `dist/p/<code>.html`): stub con OG/title/imagen de la pieza
   (preview lindo en WhatsApp) + `<link rel=canonical>` al canónico + `robots noindex,follow` + redirect
   instantáneo (`meta refresh 0` + `location.replace`). Kary comparte `bersagliojewelry.co/p/0953`.
4. **`Ref. <code>` discreto en la ficha** (SSG template + cliente `pieza.js`): el cliente confirma la pieza
   y obtiene el código para referenciar. Estética premium (etiqueta sobria).

## 4. No-regresión / invariantes
- INTACTO: `pieceUrl`/slug contract (urls.js), render de tarjetas (`renderCard`/`renderPieceCardHTML`), filtros de
  colección/sort, `catalogo.json`, modelo de pieza. La búsqueda es ADITIVA (no toca la grilla ni los filtros).
- Código ÚNICO ya garantizado por slug único (guard SSG `SLUG DUPLICADO`). `getByCode` devuelve el primero (no debería haber colisión).
- **Sin cache bump**: el buscador vive en chunks JS hasheados (cache-first por hash → fresco por hash nuevo); el
  Ref se hornea en HTML (network-first) + chunk; los stubs `/p/*` son páginas NUEVAS. Nada toca `SHELL_ASSETS`.

## 5. Riesgos
- **Typo de Kary** → no-match amable + WhatsApp (no callejón). 
- **Datos no cargados al teclear** (home) → fallback a `/p/<code>` (stub) en vez de "no existe" falso.
- **Preview social del link**: por eso el stub lleva OG real de la pieza (no un redirect pelado que daría preview pobre).
- Normalización del código: trim; los códigos son numéricos tipo "0953" (se respeta tal cual; sin forzar mayúsculas).

## 6. IAP
- (A) MODIFICAR: `js/core/data.js` (+getByCode), `js/pages/catalogo.js` (montar buscador), `js/pages/home.js`
  (+sección), `scripts/generate-pieces.mjs` (bake stubs `/p/<code>` + Ref en template), `js/pages/pieza.js`/ficha
  (Ref cliente), `public/404.html` (opcional: `/p/<code>` sin .html → stub/SPA). NUEVO: `js/core/buscador-codigo.js`,
  `js/home/codigo.js` (sección home), `tests/buscador-codigo.test.mjs`.
- (B) INTACTOS: grilla/filtros catálogo, modelo pieza, Wompi, stock.
- (E) Tests: pura `getByCode`/normalización. Build + SSG self-test + verificación preview.

## 7. Estado
DISEÑO cerrado (arquitecto + gate Daniel ×2 respuestas). Implementación por slice:
- **(1) Buscador core en CATÁLOGO — HECHO ✅** (2026-06-29): `data.getByCode` + `js/core/codigo-util.js`
  (PURO: `normalizeCodigo`/`resolverCodigo`, test 5/5) + `js/core/buscador-codigo.js` (render+wire delegado,
  mensaje no-match con nodos DOM = sin XSS) + CSS en `css/catalogo.css`; montado en `catalogo.js`. Verif: test
  5/5 + build VERDE + CSS/layout reales en preview (form/lead/botón OK). Flujo dato-vivo → deploy (L-05 headless).
- **(1b) Búsqueda INTELIGENTE — filtro en vivo por código O nombre (TODO-60) — HECHO ✅** (2026-06-29, Daniel:
  "amplía a nombre + filtra en tiempo real"): el buscador del catálogo evolucionó de "navegar por código" a
  FILTRAR la grilla EN VIVO por código O nombre (`normalizar`/`piezaMatchea`/`filtrarCatalogo` puros, test 10/10;
  debounce 160ms re-pinta solo la grilla; deep-link `?q=`; Enter→si hay 1 resultado va a la pieza; estado-cero
  con CTA WhatsApp). El navigate-by-code (`wireBuscadorCodigo`/`resolverCodigo`) queda para el home/link (slices
  2-3, Vite lo tree-shakea mientras) o se retira. Pend TODO-60: incorporar lo bueno del index de Altorra Cars (ver repo).
- **(4) `Ref. <code>` en la FICHA — HECHO ✅** (2026-06-29): etiqueta sobria "Referencia: <código>" en
  el template SSG + cliente `pieza.js` (el cliente confirma la pieza y obtiene el código para referenciar).
- **(2) link compartible `/p/<code>` (SSG stubs OG) — HECHO ✅** (2026-06-29): el SSG hornea
  `dist/p/<code>.html` (uno por pieza con `code`) = stub con OG/title/imagen REALES de la pieza (preview
  social) + `<link canonical>` al horneado + `robots noindex,follow` + redirect instantáneo (meta refresh +
  `location.replace`, root-relative). Helpers puros `safeCodeForFile` (anti path-traversal: solo
  `[A-Za-z0-9_-]`) + `generateStub` + `bakeStubError`; código duplicado→warn+skip (1ª gana), no apto→skip.
  `404.html` rutea `/p/<code>` (sin-ext→`.html`; inexistente→`/colecciones.html?q=<code>`, deep-link vivo).
  Verif: `SSG_SELFTEST` (stub+safeCode) + build+generate (32 stubs) + **redirect probado en navegador con
  `vite preview` sobre `dist/`** (`/p/0581.html`→`/pieza/topos-zafiro-natural-0581.html`, title correcto).
  Sin cache bump (páginas nuevas). Commit `feat(web) … slice 2`.
- **(3) acceso en INICIO + (5) 404 polish (rediseño) → PEND.**
→ ADR al cerrar TODO-58.

## 8. Buscador inteligente — análisis de Altorra Cars (TODO-60) + estado

Exploración (subagente Explore, read-only, sobre `…/altorracars.github.io`; SÍNTESIS — §G.4 captura de deliberación):
Altorra usa un **autocomplete-dropdown** en el home (`main.js:503-860` `initHeroSearch`) + página de búsqueda con
sidebar de filtros. Ideas portables priorizadas a un buscador de joyas:

- **HECHO ✅ en Bersaglio (catálogo)**: filtro en vivo por código **O nombre** · debounce 160ms · sin tildes ·
  deep-link `?q=` · estado-cero con CTA WhatsApp · **conteo de resultados en vivo** ("N piezas encontradas") ·
  **búsquedas recientes** (localStorage, chips, idea Altorra) · Enter→si 1 resultado va a la pieza.
- **PENDIENTE (plano para sesión fresca)** — de Altorra:
  1. **Autocomplete dropdown jerárquico con conteo**: sugerencias de colecciones/gemas/nombres con "(N)" → 1 clic
     filtra/navega (`getSuggestions()` L599-673; ranking exactas→fuzzy, marca→modelo, +cantidad). Encaja MEJOR en el
     **HOME** (slice 3, sin grilla); en el catálogo la grilla en vivo + conteo + recientes ya cubre.
  2. **Highlight de coincidencias** (`<mark>`) en sugerencias/tarjetas (L676-688). Bajo costo; ojo al mapeo de
     posiciones con acentos + XSS → construir con nodos DOM, no innerHTML.
  3. **Navegación por teclado** ↑↓/Enter/Esc en el dropdown (L804-827, estado `activeIndex`).
  4. **Fuzzy/Levenshtein** para typos ("anilo"→"anillo") (L539-566). Costo medio (~50 líneas).
  5. (Descartado para joyas) NLP de filtros en lenguaje natural (`inventory-search.js`) = overkill.
