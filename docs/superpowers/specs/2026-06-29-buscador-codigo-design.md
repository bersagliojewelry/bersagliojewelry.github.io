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
- **(2) link `/p/<code>` (SSG stubs OG) + (3) acceso en INICIO + (4) `Ref.` en ficha + (5) 404 polish → PEND.**
→ ADR al cerrar TODO-58.
