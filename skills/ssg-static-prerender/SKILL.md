---
name: ssg-static-prerender
description: Hornear HTML estático REAL por ítem en el BUILD para hosting estático (GitHub Pages, etc.) — la base de TODA la visibilidad (SEO·AEO·OG-social). Úsala cuando un sitio sirve fichas/piezas/propiedades desde una BD pero el HTML que llega al bot/LLM está vacío (SPA que hidrata por JS): los crawlers de Google/redes/IA NO ejecutan JS, así que schema/meta/contenido DEBEN existir en el HTML del build. Genera, en GitHub Actions on-push+diario, una página por ítem `status:published` con canonical/title/meta/OG/Twitter/JSON-LD/<noscript>, + sitemap.xml, con guards anti-fail-silent (REQUIRED_ANCHORS, bake-integrity, SSG_SELFTEST, safeJsonLd). Portable por `tenant_config.json` (vertical JewelryStore/AutoDealer/RealEstateAgent, colecciones, templates). Arquitectura HUB IoC: el core = funciones puras; cada tenant orquesta. Triggers — "hornear HTML en el build", "SSG", "prerender estático", "mi schema solo lo ve Googlebot/no aparece en curl", "OG no carga en WhatsApp/redes", "indexar fichas de la BD". Parte del paquete de visibilidad (HUB Altorra). NO uses para SSR dinámico (Next/Nuxt server) ni para una página única estática sin BD.
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

## 3. Guards anti-fail-silent (NO negociables — una página rota NUNCA llega a prod)
- **`REQUIRED_ANCHORS`** (por-tenant, en `tenant-build.mjs`): array de marcadores que el template DEBE tener;
  si falta uno → **THROW ruidoso** (no 27 páginas con SEO roto en silencio).
- **bake-integrity**: cada página horneada DEBE cerrar `</html>` y pesar ≥ `MIN_BAKE_BYTES` (ej. 5000); si no →
  **ABORTA el build** (el workflow no commitea → prod queda en el último build bueno). Patrón fail-loud.
- **`SSG_SELFTEST`** (gate DEV con mocks): inyecta payloads de breakout (`</script>`, `"><img onerror>`) y
  verifica que `safeJsonLd`/`escapeAttr` los neutralizan → gate anti-stored-XSS con dientes (no teatro).
- **`safeJsonLd(obj)`**: neutraliza `</script>` + U+2028/U+2029 en sinks JSON-LD/PRERENDERED. **`escapeAttr`/
  `escapeHtml`/`escapeXml`** por contexto (defensa-en-profundidad ante campos editables de un CMS).

## 4. Reglas duras (cruzan todo el paquete)
- **Schema/meta en el HTML del build** (verificable `curl+grep`), jamás solo JS. · **status:published** gatea
  horneado+indexación (no indexar "PRUEBA"). · **slug inmutable** (slugify una vez + sufijo del id; sin SSR no
  hay 301 dinámico — cambiar slug = romper links/ranking). · **cero-demo**: solo data REAL (nunca rating/sameAs/
  origen inventado). · `sitemap`: lastmod **FIJO** en estáticas (Google ignora si todo es "hoy"), `updatedAt` en ítems.
- Corre en **GitHub Actions** on-push (deploy) + diario (refresca lastmod/altas) — repos públicos = Actions gratis.

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
