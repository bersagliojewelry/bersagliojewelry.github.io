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
- [ ] **P1.3 — Journal dinámico**: colección `journal` + reglas + admin CRUD + `data.getJournal()` real (hoy `_journal=[]`) + `journal-preview`/`journal.html`. (alta)
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

## Checklist
- [x] Auditoría multi-agente del estado actual (escaneo `whppptwso`)
- [x] Diagnóstico de causa raíz del sync + fix P0 (`47b07b8`, test 5/5)
- [ ] Diseño de arquitectura (DRAFT en §1; pendiente validación del comité)
- [ ] Comité de validación del modelo de datos + skill (Decisión Fuerte)
- [ ] Skill `cms-dinamico` + agente content-section-builder creados
- [ ] P1.1 categorías dinámicas
- [ ] P1.2 siteContent/home + admin
- [ ] P1.3 journal dinámico
- [ ] P2.x nosotros/reviews, films/social, footer/sitemap
- [ ] Transversal SEO/UX + (gated) flip de indexación
