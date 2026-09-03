---
name: ssg-static-prerender
description: Hornear HTML estático REAL por ítem en el BUILD para hosting estático (GitHub Pages, etc.) — la base de TODA la visibilidad (SEO·AEO·OG-social). Úsala cuando un sitio sirve fichas/piezas/propiedades desde una BD pero el HTML que llega al bot/LLM está vacío (SPA que hidrata por JS): los crawlers de Google/redes/IA NO ejecutan JS, así que schema/meta/contenido DEBEN existir en el HTML del build. Genera, en GitHub Actions on-push+diario, una página por ítem `status:published` con canonical/title/meta/OG/Twitter/JSON-LD/<noscript>, + sitemap.xml, con guards anti-fail-silent (REQUIRED_ANCHORS, bake-integrity, SSG_SELFTEST, safeJsonLd). Portable por `tenant_config.json` (vertical JewelryStore/AutoDealer/RealEstateAgent, colecciones, templates). Arquitectura HUB IoC: el core = funciones puras; cada tenant orquesta. Triggers — "hornear HTML en el build", "SSG", "prerender estático", "mi schema solo lo ve Googlebot/no aparece en curl", "OG no carga en WhatsApp/redes", "indexar fichas de la BD". Parte del paquete de visibilidad (HUB Altorra). NO uses para SSR dinámico (Next/Nuxt server) ni para una página única estática sin BD.
actualizada: 2026-09-02
reglas: 11
lecciones: []
---

# 🏭 SSG Static Prerender — hornear HTML real en el build (la base de la visibilidad)

> Destilado de la fábrica SSG verificada de Altorra Cars (`scripts/generate-vehicles.mjs`). Portable a
> cualquier proyecto vía `tenant_config.json`. Parte del **paquete de visibilidad** (HUB Altorra).
> Arquitectura + esquema de config → `references/tenant-config.md` · contrato del core IoC → `references/ioc-core-contract.md`.

## 0. La ley (por qué existe)
Hosting estático = sin SSR. Los bots sociales (WhatsApp/Facebook/X) y los crawlers de **Google + LLMs
(GPTBot/PerplexityBot/Google-Extended)** **NO ejecutan JavaScript**. Si tu `<head>`/schema/contenido se
inyecta por JS en runtime → el bot ve una página vacía → **no indexas, no apareces, el OG no carga**.
**REGLA DURA**: el schema/meta/contenido clave SIEMPRE en el **HTML del build**, verificable por
`curl -s URL | grep`, NUNCA solo por JS runtime. Esta skill hornea ese HTML.

## 1. Arquitectura IoC (la corrección de Gemini, adoptada — el core NO toca el template)
El **Core Library** compartido (`scripts/visibility-core/`) = **funciones PURAS**, jamás lee un template:
- `validateTenant(config)` → fail-fast anti-contaminación (aborta si el vertical no matchea).
- `buildSchema(vertical, data)` → string JSON-LD (vía `safeJsonLd`).
- `buildSitemap(entries)` → string XML. · `safeJsonLd`, `escapeHtml/Attr/Xml` (primitivas de seguridad).
**Cada tenant** tiene su `tenant-build.mjs` (NO compartido): lee SU template, **pide piezas al core**, las
inyecta donde quiera (`.replace()`), corre bake-integrity, escribe. Así el template puede diferir por proyecto
sin acoplarse al core; un cambio no-breaking del core no toca ningún template. (Distribución del core = **D′
vendored + `VERSION`**, sin lockstep; reusa la replicación-kernel del HUB; migrar a NPM luego = re-empaque.)

## 2. La receta (qué hace `tenant-build.mjs`, paso por paso)
1. **`connectDb()`**: lee la BD en el build — Admin SDK si hay `FIREBASE_SA_KEY` (lectura autenticada → permite
   endurecer reglas + drafts), si no SDK cliente anónimo (fallback, cero regresión). Interfaz uniforme.
2. **`validateTenant(config)`** (del core): ABORTA si el vertical/campos no corresponden (§5 anti-contaminación).
3. **Por cada ítem `status:published`** (gate anti-indexar pruebas/borradores): parte del template y por
   `.replace()` inyecta en anclas declaradas: `<base href="/">`, `<link canonical>`, `<title>`, `<meta description>`,
   **OG** (og:url/title/description/image), **Twitter card**, **JSON-LD** (`buildSchema(vertical,data)`), y un
   **`<noscript>`** con el contenido clave (h1/img/precio/specs) para crawlers sin JS. Inyecta
   `<script>window.PRERENDERED_<TYPE>_ID = safeJsonLd(id)</script>` para que el JS hidrate sin query param.
4. **Guards** (§3). 5. **`buildSitemap()`** → `sitemap.xml` + `data/*-slugs.json`.

## 2bis. Patrón cáscara-noindex + horneada-canónica (✅ verificado en prod, 2026-07-17)
- La cáscara SPA (`pieza.html?id=`, `entrada.html?e=`) queda **`noindex`**; el SSG hornea la URL bonita e
  indexable (`/pieza/<slug>.html`, `/journal/<slug>.html`) **reusando esa misma cáscara como template**:
  `robots: index, follow` + **canonical autorreferencial** + `<base href="/">` (la horneada vive en subdir →
  las rutas relativas deben resolver a la raíz) + OG/Twitter/JSON-LD propios. **Cero duplicado**: la cáscara
  noindex nunca compite con la horneada.
- **Compatibilidad hacia atrás**: la horneada inyecta `window.PRERENDERED_<T>_SLUG`; el JS lo lee **con
  fallback al `?param=`** → los enlaces viejos ya compartidos (WhatsApp/redes) siguen funcionando, quedan
  noindex y su canonical apunta a la horneada. **Migrar URLs sin romper nada.**
- 🏆 **Regla de oro: contenido real SIN URL indexable = trabajo perdido.** *(Caso real: 6 guías escritas y
  publicadas eran INVISIBLES para Google porque solo vivían en `entrada.html?e=<slug>` noindex — el hub era
  indexable pero cada artículo era un callejón sin salida.)*
- Para artículos, el **`<noscript>` lleva el CUERPO COMPLETO** (breadcrumb + H1 + imagen + párrafos + CTA),
  no solo el resumen: el texto ES el activo SEO. No es cloaking — es idéntico a lo que el usuario ve hidratado.
- ❓ **HIPÓTESIS (no medido — NO convertir en regla)**: "el hub indexado arrastra las fichas en cascada".
  Observado lo contrario en prod: hubs indexados y las 27 fichas enlazadas NO, tras ~2 meses. El hub ayuda al
  *descubrimiento*, pero **descubrir ≠ indexar**: el juicio de valor de Google es por-página.

## 2ter. Title/meta keyword-first SIN sacrificar la voz de marca (✅ verificado en prod)
- Desacoplar **meta (SEO)** de **og (social)**: `<title>` + `<meta description>` → keyword de
  **PRODUCTO + CATEGORÍA + CIUDAD** (lo que Google lee y rankea) · **H1 y copy VISIBLE** → voz editorial
  intacta · `og:description`/`twitter:description` → el copy de marca (preview social).
- Nombre de producto poético ("Puro Albor") → **derivar el tipo de producto del slug** para el título:
  *"Anillo de Diamante · Puro Albor · <Marca> <Ciudad>"*.
- Reproyectar el posicionamiento (ej. "atelier exclusivo" → "ecommerce con envíos a todo el país") se hace en
  **meta description + schema description**, SIN tocar el copy visible de la marca.

## 3. Guards anti-fail-silent (NO negociables — una página rota NUNCA llega a prod)
- **`REQUIRED_ANCHORS`** (por-tenant, en `tenant-build.mjs`): array de marcadores que el template DEBE tener;
  si falta uno → **THROW ruidoso** (no 27 páginas con SEO roto en silencio).
- **bake-integrity**: cada página horneada DEBE cerrar `</html>` y pesar ≥ `MIN_BAKE_BYTES` (ej. 5000); si no →
  **ABORTA el build** (el workflow no commitea → prod queda en el último build bueno). Patrón fail-loud.
- **`SSG_SELFTEST`** (gate DEV con mocks): inyecta payloads de breakout (`</script>`, `"><img onerror>`,
  `U+2028/U+2029`) y verifica: sin breakout crudo, JSON-LD y globals inyectados PARSEAN, `robots index`
  presente, canonical correcto, **determinismo** (misma entrada → misma salida). Sin red — gate de CI.
- **Puerta cero-ficción**: hornear **solo** lo `published` **Y COMPLETO** (título + imagen + resumen) +
  **slug seguro** (regex anti path-traversal: sin `/`, sin `..`) — espejo de la regla server-side.
- **`safeJsonLd(obj)`**: neutraliza `</script>` + U+2028/U+2029 en sinks JSON-LD/PRERENDERED. **`escapeAttr`/
  `escapeHtml`/`escapeXml`** por contexto (defensa-en-profundidad ante campos editables de un CMS).

## 4. Reglas duras (cruzan todo el paquete)
- **Schema/meta en el HTML del build** (verificable `curl+grep`), jamás solo JS. · **status:published** gatea
  horneado+indexación (no indexar "PRUEBA"). · **slug inmutable** (slugify una vez + sufijo del id; sin SSR no
  hay 301 dinámico — cambiar slug = romper links/ranking). · **cero-demo**: solo data REAL (nunca rating/sameAs/
  origen inventado). · `sitemap`: lastmod **FIJO** en estáticas (Google ignora si todo es "hoy"), `updatedAt` en ítems.
- **Ciclo precio → re-indexación** (✅ verificado): el `<lastmod>` del ítem sale de su `updatedAt` → el update
  del admin DEBE sellarlo **server-side** (`serverTimestamp`). Con el cron diario, un cambio de precio se
  refleja en ≤24h; para inmediatez el día del cambio → rebuild manual (`workflow_dispatch`).
- Corre en **GitHub Actions** on-push (deploy) + diario (refresca lastmod/altas) — repos públicos = Actions gratis.
- **Verificar en PRODUCCIÓN, no en local**: tras cada deploy, `curl + grep` sobre la URL real (robots,
  canonical, JSON-LD, sitemap). Un build verde no prueba que prod esté bien. ⚠️ Limitación conocida: los
  navegadores headless/sandbox **no siempre completan la conexión de Firestore** → el contenido dinámico no
  hidrata ahí; NO confundirlo con un bug del sitio (verificar el HTML servido con `curl` + test determinista).

## 4bis. El CSS acotado del framework NO alcanza a los nodos que crea el JS

Astro, Svelte y los SFC de Vue acotan el CSS de un componente **reescribiendo el selector**: `.fila`
compila a `.fila[data-astro-cid-XXXX]` (o `.fila.svelte-abc123`), y el atributo se lo pone el
compilador a los elementos **de la plantilla**. Un nodo creado en tiempo de ejecución con
`document.createElement` no lo lleva, así que **ninguna regla le aplica**. No hay error, no hay
warning, el build sale verde y los tests pasan: la pantalla simplemente sale despintada.

- **Es peligroso justo donde más duele**: los paneles y listados renderizan por JS *casi todo* su
  DOM, así que el fallo se concentra en el contenido, no en la cáscara. Y es INVISIBLE si solo miras
  el markup estático — que es lo que ves si nunca hay datos reales delante.
- **Dos arreglos, y la elección tiene criterio**: `:global(.x)` regla a regla cuando la página es
  casi toda estática y sus clases no tienen namespace propio; el bloque entero `is:global` cuando la
  página TIENE un namespace exclusivo y su DOM es mayormente de runtime. La segunda no es pereza: la
  lista de `:global()` hay que mantenerla cada vez que un script añade una clase, y **olvidarla no
  rompe nada que el build pueda ver**.
- **Cuidado al globalizar**: si una regla se apoya en una clase del design system (`.alt-input.is-mal`),
  ánclala a un contenedor de la página o se aplicará a todo el sitio.
- **Ponle un gate, no una lección.** Estático y barato: clases que un script ASIGNA a nodos nuevos
  (`className = '…'` o un `class="…"` de plantilla) ∩ clases definidas en un `<style>` sin
  `is:global` de una página que cargue ese script. **`classList.add/toggle` NO cuenta**: casi siempre
  son banderas de estado sobre elementos que ya venían en la plantilla, y contarlas solo da ruido.
- **El gate tiene que seguir los imports.** Su primera versión miraba solo las menciones literales de
  la página y se le escaparon 2 de 4 módulos, porque la página importaba uno que importaba a los
  otros. Un gate que solo mira la superficie **aprueba lo que no comparó**.

## 5. Anti-contaminación por vertical (`validateTenant`, fail-fast — clave del HUB multi-proyecto)
Validador **a mano** (sin Zod — build node-plano, dep-free, estilo REQUIRED_ANCHORS): asegura que `config.vertical`
∈ {JewelryStore, AutoDealer, RealEstateAgent} y que NO emite campos de otro vertical (joya con `kilometraje`/VIN,
o auto con `quilates` → THROW antes del SSG → el Action ABORTA). Agregar un proyecto nuevo = nuevo `tenant_config`
+ correr; el core no cambia. Detalle de campos por vertical → `references/tenant-config.md`.

## 6. Adopción en un proyecto (checklist)
- [ ] `tenant_config.json` en la raíz (vertical, colecciones, template paths, `MIN_BAKE_BYTES`, baseUrl) → `references/tenant-config.md`.
- [ ] `scripts/visibility-core/` vendored (funciones puras + `VERSION`) — el HUB lo provee/propaga.
- [ ] `scripts/tenant-build.mjs` (orquestador propio: connectDb → validateTenant → loop published → inyectar → guards → sitemap).
- [ ] Templates con las anclas que declara `REQUIRED_ANCHORS`.
- [ ] Workflow `.github/workflows/build-ssg.yml` on-push + cron diario (`npm run generate`).
- [ ] Campo `status` por ítem en la BD (`published|draft|archived`) + `slug` inmutable + `updatedAt`.
- [ ] Verificación EN VIVO: `curl -s <url-ficha> | grep -E 'application/ld\+json|og:title|<title>'` muestra el contenido (no vacío).

> Pareja natural: `semantic-schema-aeo` (qué schema inyectar), `image-pipeline` (las imágenes que el `<noscript>`/OG
> referencian), `product-feeds` (otra salida del mismo build). Crédito de patrón: fábrica SSG de Altorra Cars.
