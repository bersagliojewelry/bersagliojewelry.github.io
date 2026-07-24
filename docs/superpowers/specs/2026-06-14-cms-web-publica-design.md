# CMS de la web pública — Diseño (todo el contenido administrable desde el panel)

> **Origen**: directiva de Daniel (2026-06-14) — Kary pide la web lista para mostrar TODO el
> contenido (piezas, colecciones, destacados, journal, videos, redes, textos) y que sea
> **editable desde el panel admin sin tocar código**, de la mano con **SEO, UX y redes**.
> Trabajo autónomo nocturno (commits + pruebas propias). Acuerdos/R6 EN PAUSA.
> **[OPUS-4.8 interino]**. Lidera el **arquitecto** (Decisión Fuerte: modelo de datos).

## 0. Auditoría (escaneo multi-agente `whppptwso`, 2026-06-14 — 109 items, 5 frentes)

**Estado actual = híbrido**:
- ✅ **`pieces` y `collections`** tienen live-sync real (`js/core/data.js` `onSnapshot` → `firestore-service.js` → `db.onChange()`; reglas `allow read: if true`). El catálogo, la ficha de pieza y "destacados" del Home leen en vivo.
- ❌ **Todo lo demás es HARDCODED**: Home (hero, marquee, editorial, services, atelier, cta), Journal (`js/data/journal.js`), Films + Social (`js/data/home-media.js`), Nosotros (`js/pages/nosotros.js`), footer/contacto. Las "categorías" del Home (`js/home/categories.js`) son cards hardcodeadas; solo los contadores son live.
- 🐛 **Causa raíz del "no sincroniza"** (ya CORREGIDA, commit `47b07b8`): el admin guardaba `piece.collection` = **id** del doc de colección; el público filtra/relaciona por **slug** → si `id != slug`, match cero → catálogo/relacionados vacíos **en silencio**. Fix: matcher puro tolerante (slug O id) `js/core/collection-match.js` + el admin guarda slug. Prod tiene **0 piezas** → sin migración.
- 🔎 **SEO**: *soft-launch* deliberado (ADR SEO-02, `3f654e1`): solo Home/Nosotros/Contacto `index,follow`; catálogo/pieza/journal/etc `noindex`. `sitemap.xml` = 3 URLs. Structured data (JSON-LD product/breadcrumb) ya se inyecta en `pieza.js`. Render client-side (cold-load del crawler a considerar).
- 🔐 Rol **`editor`** = "contenido web" ya existe (excluido del CRM). `config` partido por sensibilidad (L-15: repo público).

## 1. Decisión de arquitectura (6 lentes)

**Principio**: **docs tipados, NO un page-builder genérico** (anti-monolito §3.6). Se EXTIENDE el patrón ya probado de `pieces`/`collections` (lectura pública + escritura `editor` + live `onSnapshot`) a todo el contenido. Cero datos sensibles en colecciones públicas (separación CMS↔CRM).

**Modelo de datos** (Firestore):
| Patrón | Para | Docs |
|---|---|---|
| **Singleton** `siteContent/{page}` | contenido de baja escritura por página/sección (textos) | `siteContent/home` (hero, editorial, services, atelier, cta, marquee), `siteContent/nosotros` (chapters, valores, equipo, stats), `siteContent/global` (footer, contacto, datos de la maison) |
| **Colección** (1 doc por item, como `pieces`) | listas | `journal` (entradas), `films` (videos), `socialPosts` (redes), `reviews` (ya existe; falta UI) |
| **Reutilizar** | categorías del Home, destacados | derivar de `collections` (bannerUrl/slug/featured) y `pieces` (featured) — sin colección nueva |

**Reglas** (`firestore.rules`): por cada colección/doc nuevo → `allow read: if true` (contenido público por diseño) + `allow write: if isEditor()` con **validador `hasOnly`** tipado (L-15). Singletons `siteContent/{page}` con whitelist de campos.

**Lectura pública**: cada sección lee de su doc/colección vía `firestore-service.js` (nuevos `onXChange`) + `data.js` (getters) + live refresh (`db.onChange`), igual que piezas. Fallback al contenido actual hardcoded si el doc no existe aún (degradación elegante, cero downtime).

**Costo (Firestore Spark)**: singletons = 1 lectura por página; listas paginadas/limitadas. Consolidar textos de Home en UN doc, no N docs.

**Integración**: REST/onSnapshot (default Firebase). Films/Social: empezar con datos CURADOS en Firestore (editor los sube); feed automático real (Meta/TikTok API) = fase futura cara → NO ahora.

**SEO (Decisión Fuerte — gated)**: la política de indexación (`noindex`→`index`) y el motor de render (client-side vs pre-render/SSG) afectan TODO el ranking y son caros de revertir (`15-CONSEJO-EXTERNO`). → **Flip de indexación = palanca de LANZAMIENTO**, solo cuando haya contenido REAL (catálogo cargado), con Comité + Consejo Externo. Mientras: client-side render + meta/JSON-LD/sitemap dinámicos listos para cuando se encienda.

## 2. Cola de implementación (en fila, cada una: datos + reglas + CRUD admin + público live + test + commit)

- [x] **P0 — Sincronización pieza↔colección** (el bug real): matcher tolerante + admin guarda slug. `47b07b8`. ✅
- [ ] **P1.1 — Categorías del Home dinámicas**: `js/home/categories.js` deriva de `data.getCollections()` (kill array hardcoded); editable vía el admin de colecciones que YA existe. (media)
- [ ] **P1.2 — `siteContent/home`**: textos de hero/editorial/services/atelier/cta → doc singleton + admin (nueva página `admin-contenido.html` o sección) + render con fallback. (media)
- [x] **P1.3 — Journal dinámico**: colección `journal` + reglas (journalValid+publicContentValid) + admin CRUD (motor genérico) + `data.getJournal()` real + `journal-preview`/`journal.html`/`entrada.html` con fallback baked + fix eager. `67fc21e`+`66dfd04`. ✅
- [ ] **P2.1 — Nosotros** (`siteContent/nosotros`) + **reviews** admin UI (colección ya existe). (alta)
- [ ] **P2.2 — Films + Social**: colecciones `films`/`socialPosts` + admin + render; datos curados. (alta)
- [ ] **P2.3 — Footer/Contacto** (`siteContent/global`) + **sitemap dinámico** (de pieces/collections/journal). (media)
- [ ] **Transversal — SEO/UX**: meta dinámico por pieza/colección, JSON-LD donde falte, sitemap dinámico; **flip de indexación = Decisión Fuerte gated** (council + contenido real).

## 3. Skill + Agente (lo pidió Daniel: potenciar al arquitecto para CMS)
- **Skill `cms-dinamico`** (vía `skill-creator`): patrones del CMS de ESTE tipo de trabajo — singleton vs colección, reglas público-read/editor-write con `hasOnly`, cableado live-sync (`firestore-service`→`data`→`onChange`), scaffold de CRUD admin, SEO de contenido dinámico, fallback elegante. PORTABLE (no hardcodear rutas del repo).
- **Agente "content-section-builder"** (vía `agent-creator`): dado un módulo hardcoded, andamia doc/colección Firestore + reglas + CRUD admin + render público live + test.

## 4. Riesgos
- Repo público (L-15): validar reglas con `hasOnly` por colección nueva; cero datos sensibles en contenido.
- SoD: contenido web = rol `editor`, separado del CRM (owner/admin).
- Anti-monolito: docs tipados, no page-builder genérico.
- SEO cold-load: render client-side → considerar pre-render para crawlers (Decisión Fuerte).
- Costo Firestore: consolidar en singletons; paginar listas.
- Films/Social feed real = alto costo → arrancar curado.
- **Catálogo vacío en prod (0 piezas)**: cargar el catálogo real (migración o Kary) es tarea aparte, prerequisito del flip SEO.

## 5. Comité de diseño (`wrpym7h3p`, 6 lentes) — veredicto: **REFINAR** (diseño sólido, 0 rediseños)

**Refinamientos ADOPTADOS** (verificados contra código):
- **A. Seguridad (BLOQUEANTE #1)** ✅ HECHO: `safeUrl()` (`js/core/safe-url.js`, `39983f2`) — `escape()` es contexto-HTML, NO cubre `javascript:`/`data:`/CSS-`url()`. Usar en TODO campo editable→href/src; migrar `background-image:url()` a `<img src=safeUrl()>`.
- **B. Costo Spark**: el claim "1 lectura/página" es FALSO — cada `onSnapshot` es un listener persistente. **Textos de baja escritura (`siteContent/*`) → `getDoc` one-shot, NO listener**; `onSnapshot` solo para lo que cambia seguido (pieces).
- **C. Anti-monolito (BLOQUEANTE #2)**: clonar el CRUD ×6 = ~2400 líneas. **Factorizar un motor `createResourceAdmin(descriptor)` + `createTypedDoc/updateTypedDoc` (firestore-service) + validador `publicContentValid(d, allowedKeys)` (rules)** usando pieces/collections como cobayas en refactor VERDE. Cada sección = ~30 líneas de descriptor.
- **D/UX (BLOQUEANTE #3)**: UN grupo `Contenido web` (role:editor) en `sidebar-data.js` + UNA `admin-contenido.html` de pestañas, NO 6 admin-*.html sueltos (anti "menú plano").
- **E. Dos scaffolds**: SINGLETON-FORM (siteContent: form→`setDoc(merge)`+_version) vs COLLECTION-LIST (journal/films/social: el motor).
- **F. Caps**: `limit(N)`+truncado en colecciones nuevas; journal separa LISTADO (onSnapshot) del `body` (getDoc en `entrada.html?slug=X`).
- **G. Fallback por modo**: singleton=`merge({...DEFAULTS,...doc})`; colección=`docs.length?docs:BAKED`. Mantener safety-timeout de first paint.
- **H. Reutilizar**: enganchar cada escritura a `signalCacheInvalidation()` (system/meta); `siteContent/home` en sub-mapas `{hero:{},editorial:{}}`.
- **Reglas idioms (gotchas)**: campo opcional → `!('x' in d) || d.x is tipo` (acceder a campo ausente LANZA → falla-cerrado); server-clock → `d.createdAt == request.time`; `hasOnly` OBLIGATORIO + size-cap en todo string (L-15).

**Bloqueantes restantes**: #2 factor CRUD (antes de features) · #3 grupo UX/admin-contenido · #5 endurecer `storage.rules` (hoy `assets/` acepta CUALQUIER contentType auth!=null; svg ejecutable → restringir a `image/*` sin svg; videos `content/` con cap+contentType) · #6 reconciliar `reviews` `pieceId`(índice)↔`pieceSlug`(query) antes de su UI · `delete:isAdmin()` para journal/films/social/siteContent · tests de reglas por colección (emulador).

**Modelo de datos final**: `siteContent/{home,nosotros,global}` singletons (getDoc); `journal/{slug}` (LISTADO + body separado), `films/{id}`, `socialPosts/{id}` colecciones (onSnapshot+limit); `collections` +hue/pos/img (aditivo, categorías dinámicas); `reviews` (reconciliar); `system/meta` (reusar cache-signal).

**SEO**: **pre-render HÍBRIDO** (SSG snapshot en CI tras build + hidratación live), NO client-side puro (crawler recibe HTML vacío, og:image roto, `?p=` colapsa a 1 canónica, `robots.txt` Disallow `/dist/` puede bloquear el JS). DISEÑADO ahora, EJECUTADO en el flip (prod vacío hoy). Gate del flip (Decisión Fuerte + Consejo): rutas-path `/pieza/<slug>/`, pre-render con meta/JSON-LD reales, robots corregido + GSC piloto, sitemap dinámico, contenido con profundidad. Auto-rebuild = CF onWrite debounced→`repository_dispatch`. **Todo P1-P2 se construye bajo el `noindex` actual sin tocar la palanca.**

**Orden de build (corregido)**: P1.1 categorías (mínimo riesgo, sin colección/regla/listener nuevos — solo +hue/pos/img a collections) → JOURNAL (valida el motor+agente, antes que el singleton sin precedente; incluir fix del consumo eager `journal-preview.js:13` + cablear los 3 consumidores en el MISMO commit) → siteContent/home (primer singleton). Pre-commit: `onJournalChange`/`onSiteContentChange` SIN gatear el first-paint + getters con fallback.

## Checklist
- [x] Auditoría multi-agente del estado actual (escaneo `whppptwso`) · consolidado en §84
- [x] Diagnóstico de causa raíz del sync + fix P0 (`47b07b8`, test 5/5)
- [x] Diseño de arquitectura validado por comité → §5 (`wrpym7h3p`)
- [x] Comité de validación del modelo de datos + skill (6 lentes, REFINAR) → §5 (`wrpym7h3p`)
- [x] safeUrl() cimiento de seguridad (BLOQUEANTE #1) → `39983f2`
- [x] Factorizar motor CRUD genérico (BLOQUEANTE #2) + grupo UX `Contenido web` (#3) → `8b507cb` (servicio: createTypedDoc) + `67fc21e` (UI: createResourceAdmin + admin-contenido + grupo sidebar)
- [x] P1.1 categorías dinámicas (Home dock deriva de `collections`) → `d4caaf6`
- [x] Skill `cms-dinamico` creada (user-global, catalogada en skills-inventory) · [ ] agente content-section-builder (pendiente) · catálogo: docs/skills-inventory.md
- [x] P1.3 journal dinámico — admin (`67fc21e`; reglas journal en emulador 151/151) + público lectura con fallback baked + fix bug "eager" (`66dfd04`)
- [x] P1.2 siteContent/home + admin — scaffold singleton (form→setDoc merge) + textos hero/editorial editables (`c98f77d` base + `905330c` UI). Resto de singletons (nosotros/contacto/global) = P2; UNDO = P2.
- [ ] P2.x nosotros/reviews, films/social, footer/sitemap
- [ ] Transversal SEO/UX + (gated) flip de indexación
- [ ] Deploy del milestone: merge Desarrollo→main (Daniel, L-26) + `firebase deploy --only firestore:rules` + cache bump v16→v17 + APP_VERSION
