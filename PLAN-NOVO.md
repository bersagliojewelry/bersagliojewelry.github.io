# PLAN-NOVO — Recambio Total Bersaglio Jewelry (Mirror Claude Design)

> **Estado:** Plan en revisión. **Antes de ejecutar cualquier eliminación, el usuario debe aprobar este documento.**
> **Source:** `BERSAGLIO NOVO/` (handoff Claude Design — `api.anthropic.com/v1/design/h/FgAo-eaGev_nIskd_OqfCQ`)
> **Branch sugerida de implementación:** `claude/recambio-total-novo` (rama nueva, fork de `main`)
> **Admin panel:** **NO SE TOCA** en absoluto.

---

## 0. Filosofía del recambio

> _Apple-grade aesthetic + dynamic Firebase backbone + Bersaglio brand voice_

1. **Mirror visual exacto** del bundle `BERSAGLIO NOVO/` — tokens, layout, copy, animaciones, microinteracciones
2. **Performance Apple-style** — split codeloading, lazy imports, image preloading, critical CSS, idle prefetch
3. **Dinamismo total** — todo lo que es data (piezas, colecciones, journal, equipo, prensa, FAQs) sale de Firebase. El "static content" del bundle lo migramos a docs Firestore para que el admin lo edite.
4. **Cero dead code** — antes de empezar, BORRAMOS todos los archivos públicos viejos. No hay legacy compatibility, no hay rollback gradual.
5. **Arquitectura modular** — un módulo ESM por componente, lazy chunks, sin bundlers (vanilla ESM nativo, sin build step).

---

## 1. Inventario actual a ELIMINAR

### 1.1 HTML públicas (17 archivos — TODAS borrar)

```
anillos.html        argollas.html       carrito.html       colecciones.html
contacto.html       dijes-colgantes.html entrada.html      gracias.html
index.html          journal.html        lista-deseos.html  nosotros.html
pieza.html          privacidad.html     servicios.html     terminos.html
topos-aretes.html
```

### 1.2 CSS públicas (2 archivos — borrar ambos)

```
css/style.css           — 10,549 líneas (legacy V2/V3/V4/V5/V6/V7 + estructura)
css/liquid-glass.css    — 6,073 líneas (mi rediseño previo, ahora obsoleto)
```

### 1.3 JS público (50+ archivos — borrar TODO excepto Firebase service + admin imports)

**Borrar todo en `js/`:**
- `app.js` `aqua-animations.js` `cart-page.js` `cart.js` `checkout.js` `coleccion.js` `colecciones.js` `components.js` `cookie-consent.js` `cursor.js` `effects.js` `email-capture.js` `entrada.js` `gracias.js` `gsap-core.js` `image-optimizer.js` `journal.js` `liquid-glass-hero.js` `page.js` `parallax.js` `pieza.js` `preloader.js` `prefetch.js` `pwa.js` `recommendations.js` `scroll-animations.js` `search.js` `skeleton.js` `toast.js` `wishlist-page.js` `wishlist.js`
- `js/components/*` (7 archivos)
- `js/effects/*` (3 archivos)
- `js/data/*` (2 archivos)
- `js/utils/*` (2 archivos)

**MANTENER intacto:**
- `js/admin/` (todos los archivos del panel admin)
- `js/firebase-config.js` (config compartida)
- `js/firestore-service.js` (capa de datos compartida con admin)
- `js/auth.js` (autenticación admin)
- `js/analytics.js` (Google Analytics — opcional)

### 1.4 Snippets — borrar
```
snippets/header.html
snippets/footer.html
```

### 1.5 Otros archivos — borrar
- `manifest.json` (lo regeneramos con theme nuevo)
- Imágenes legacy en `img/` que el nuevo diseño no use (después de auditar)

---

## 2. Mirror exacto del diseño nuevo

### 2.1 Páginas (1 SPA con hash routing)

El bundle es una **SPA** controlada por `#hash`:

| Hash | Componente | Líneas JSX |
|---|---|---|
| `#home` (default) | `<Home>` | ~1100 |
| `#catalogo` | `<Catalogo>` | ~91 |
| `#producto/:id` | `<Producto>` | ~100 |
| `#nosotros` | `<Nosotros>` | ~340 |
| `#contacto` | `<Contacto>` | ~432 |
| `#checkout` | `<Checkout>` | ~111 |

**Decisión arquitectónica nuestra:** convertimos esto a páginas estáticas con `?p=<slug>` (web hosting estática) en lugar de SPA porque:
- Mejor SEO
- URLs compartibles
- Páginas individuales se cachean
- Mantiene compatibilidad con admin (que también usa páginas separadas)

Las páginas finales serán:
```
index.html       → home (Hero + Marquee + Categories + Featured + Editorial + Services + Atelier + Journal + CTA)
colecciones.html → catalog grid + filter pills + sort
pieza.html       → producto detail
nosotros.html    → expanded story (chapters, equipo, prensa, FAQs)
contacto.html    → form + sidebar
carrito.html     → checkout 3-step
journal.html     → journal grid (NEW dynamic from Firestore)
entrada.html     → journal entry detail
privacidad.html  → legal
terminos.html    → legal
gracias.html     → post-checkout
```

### 2.2 Secciones del Home (exactas del bundle)

1. **HomeHero** (340 líneas JSX) — 3D parallax con cursor + 3 floating glass cards + halo iridiscente + main featured piece
2. **HomeMarquee** — credenciales scrolleantes en glass-pill
3. **HomeCategories** — dock iOS de 6 categorías con gel circles
4. **HomeFeatured** — grid editorial de piezas destacadas
5. **HomeEditorial** — split image + quote (filosofía)
6. **HomeServices** — 4 servicios glass cards
7. **HomeAtelier** — proceso 4 pasos en emerald glass
8. **HomeJournal** (NUEVO) — preview de últimas 3 entradas del journal
9. **HomeCTA** — Cartagena de Indias visit

### 2.3 Tokens de diseño (replicar 1:1)

```css
/* Brand palette oklch (perceptually uniform) */
--bj-emerald-{100..900}     emeralds
--bj-gold-{100..900}        golds
--bj-pearl --bj-ivory --bj-cream --bj-mist
--bj-ink-emerald            "negro" de la marca (oklch 18% 0.05 155)
--bj-ink-soft --bj-ink-mute

/* Liquid glass system */
--glass-blur: 28px
--glass-saturate: 180%
--glass-tint: oklch(96% 0.02 150 / 0.55)
--glass-shadow (multi-layer)
--pinlight (radial top highlight)
--iridescent-rim (conic gradient)

/* Typography NEW (replace current) */
--font-brand:   "Fraunces"            (was: Fraunces - kept)
--font-display: "Cormorant Garamond"  (was: Fraunces - SWITCH ORDER)
--font-ui:      "Manrope"             (was: Inter - SWITCHED)
--font-mono:    "Space Mono"          (was: JetBrains Mono - SWITCHED)

/* Radii */
--r-sm:10 --r-md:16 --r-lg:22 --r-xl:32 --r-2xl:44 --r-pill:999

/* Background world */
.bj-world (3 radial gradients + linear + 2 drifting blobs)

/* Glass primitives */
.glass + .glass-lg + .glass-pill + .glass-iridescent + .glass-emerald

/* Aqua buttons */
.btn-aqua + .btn-aqua-emerald + .btn-aqua-gold + .btn-aqua-ghost

/* Type helpers */
.eyebrow .display .italic .mono .gold-text .emerald-text
```

---

## 3. Arquitectura nueva (vanilla ESM, no React, no build step)

### 3.1 Estructura de carpetas final

```
.
├── index.html                  ← shell mínimo + script type=module
├── colecciones.html            ← shell mínimo
├── pieza.html
├── nosotros.html
├── contacto.html
├── carrito.html
├── journal.html
├── entrada.html
├── gracias.html
├── privacidad.html
├── terminos.html
│
├── admin*.html                 ← INTACTO
│
├── css/
│   ├── liquid-glass.css        ← MIRROR EXACTO del bundle (350 líneas)
│   ├── components.css          ← reglas por componente (header, hero, cards, etc)
│   └── pages.css               ← reglas específicas por página
│
├── js/
│   ├── core/
│   │   ├── boot.js             ← entry point único, importa tokens + carga shell
│   │   ├── router.js           ← link interceptor + page transitions
│   │   ├── data.js             ← capa Firestore unificada
│   │   ├── cart.js             ← localStorage + onChange (NEW clean)
│   │   ├── wishlist.js         ← localStorage + onChange (NEW clean)
│   │   └── utils.js            ← escapeHtml, format$, debounce, etc
│   │
│   ├── components/
│   │   ├── header.js           ← header pill (4 nav + cart + search)
│   │   ├── footer.js
│   │   ├── cart-drawer.js
│   │   ├── wishlist-drawer.js
│   │   ├── hero.js             ← hero 3D parallax (HOME ONLY)
│   │   ├── marquee.js
│   │   ├── categories-dock.js  ← live count from Firestore
│   │   ├── featured.js         ← featured pieces grid
│   │   ├── editorial.js        ← image+quote split
│   │   ├── services.js
│   │   ├── atelier.js
│   │   ├── journal-preview.js  ← home journal section
│   │   ├── cta-cartagena.js
│   │   ├── piece-card.js       ← shared (used in 6 surfaces)
│   │   ├── search-overlay.js   ← Cmd+K palette
│   │   ├── cookie-banner.js
│   │   └── email-modal.js
│   │
│   ├── pages/
│   │   ├── home.js             ← compone secciones del home
│   │   ├── catalogo.js         ← filter pills + sort + grid
│   │   ├── pieza.js            ← detail (gallery + info + specs + talla + CTAs)
│   │   ├── nosotros.js         ← chapters + valores + equipo + prensa + FAQs
│   │   ├── contacto.js         ← form + sidebar
│   │   ├── carrito.js          ← 3-step checkout
│   │   ├── journal.js          ← journal grid + filters
│   │   └── entrada.js          ← journal entry detail
│   │
│   ├── firebase-config.js      ← INTACTO (compartido con admin)
│   ├── firestore-service.js    ← INTACTO (compartido con admin)
│   ├── auth.js                 ← INTACTO
│   └── admin/*                 ← INTACTO
│
├── snippets/                   ← BORRADO (componentes ahora en js/components)
│
├── img/                        ← auditar y mantener solo lo usado
└── BERSAGLIO NOVO/             ← BORRADO al final (era handoff)
```

### 3.2 Decisiones técnicas

| Decisión | Por qué |
|---|---|
| **Vanilla ESM nativo** (no Webpack/Vite) | Despliega en GitHub Pages sin CI build. `<script type="module">` carga lo necesario. |
| **No React** | El bundle Claude Design usa React pero solo como prototipo. Usamos vanilla ES2022 con tagged template literals para HTML. Más rápido en first paint y bundle 0 KB de framework. |
| **Hash routing solo en home** | Las demás páginas son archivos HTML reales (mejor SEO + URLs compartibles + admin compat). |
| **Lazy import de páginas** | Cada `pages/*.js` se carga solo cuando se necesita (`import()` dinámico). |
| **Critical CSS inline en `<head>`** | Solo el "above the fold" del shell + bj-world tokens. El resto en `<link rel="stylesheet">`. |
| **Image preload + LQIP** | Hero image con `<link rel="preload" as="image">`. El resto con `loading="lazy"`. |
| **Service Worker (PWA)** | Cache stale-while-revalidate para CSS/JS, network-first para HTML, cache-first para assets. |
| **`requestIdleCallback`** para prefetch | Antes de scroll, precarga la siguiente página. |
| **`view-transition` API** (Chrome 111+) | Transiciones nativas suaves entre páginas; fallback a fade en otros browsers. |

---

## 4. Performance "Apple-style"

### 4.1 Métricas objetivo (Lighthouse Mobile, Slow 4G throttle)

| Métrica | Target |
|---|---|
| **LCP** (Largest Contentful Paint) | < 2.0s |
| **FCP** (First Contentful Paint) | < 1.0s |
| **CLS** (Cumulative Layout Shift) | < 0.05 |
| **TBT** (Total Blocking Time) | < 200ms |
| **INP** (Interaction to Next Paint) | < 200ms |
| **Performance score** | > 90 |
| **Accessibility score** | 100 |
| **Best Practices** | 100 |
| **SEO** | 100 |

### 4.2 Técnicas que aplicamos

1. **Critical CSS inline** (~6 KB) en `<head>` de cada página: tokens + bj-world + glass primitives + skip-link.
2. **Resto de CSS deferred** con `<link rel="preload" as="style" onload="...">`.
3. **Fonts preconnect + font-display: swap** + `<link rel="preload">` solo para Manrope 500 (UI principal). Resto async.
4. **Hero image** con `<link rel="preload" as="image" fetchpriority="high">` + `<picture>` AVIF + WebP fallbacks + `loading="eager"`.
5. **Below-the-fold images** con `loading="lazy" decoding="async"`.
6. **Image responsive** — generar 3 sizes (640w, 1280w, 1920w) por imagen + AVIF (60% del tamaño).
7. **JS módulos cargan async** — `<script type="module">` ya es defer-by-default. Más `import()` dinámico para páginas.
8. **CSS animation con `transform` + `opacity` ÚNICAMENTE** (compositor layer) — nunca con width/height/top/left.
9. **`will-change` solo durante interacción**, removido al terminar.
10. **Service Worker** — registra al `load`, controla 2da visita en adelante. Cache:
    - HTML: network-first 5s timeout → cache fallback
    - CSS/JS: stale-while-revalidate
    - Imágenes: cache-first 30 días
    - Firebase requests: NO se cachean (deja que SDK maneje)
11. **Resource hints**: `<link rel="preconnect">` para fonts.googleapis + Firestore + Wompi.
12. **`content-visibility: auto`** en secciones below-the-fold (reduces paint cost en scroll).
13. **`@view-transition` con name por sección** para transiciones nativas (Chrome 111+).
14. **`HTTP/2 push`** no aplica en GitHub Pages — usamos `<link rel="modulepreload">` para JS críticos.

### 4.3 Bundle size targets

| Recurso | Target |
|---|---|
| Critical CSS inline (per page) | < 6 KB |
| Main CSS (deferred) | < 30 KB |
| JS core (boot.js + router.js + data.js + utils.js) | < 15 KB |
| JS por página (lazy) | < 10 KB cada una |
| Total JS first load (home) | < 40 KB |
| Hero image (AVIF) | < 80 KB |

---

## 5. Sync con admin Firestore — invariantes

### 5.1 Schema actual (intacto)

| Colección | Campos clave |
|---|---|
| `pieces` | id, code, slug, name, collection, featured, badge, description, priceLabel, price, specs.{stone,carat,metal,...}, images, _version, createdAt |
| `collections` | id, slug, name, subtitle, description, bannerUrl, featured, pieces (count) |
| `journal` (NEW) | slug, title, excerpt, body, image, author, category, publishedAt |
| `consultas` | name, email, phone, motivo, message, createdAt |
| `nosotros/static` (NEW) | chapters[], valores[], equipo[], prensa[], faqs[] |
| `system/meta` | lastDataUpdate, lastJournalUpdate |

### 5.2 Migración de contenido estático del bundle → Firestore

El bundle tiene contenido HARDCODEADO en JSX (chapters, valores, equipo, prensa, FAQs, journal entries, marquee items, services, etc.). Hay que **migrar todo a Firestore** para que el admin lo edite.

**Decisión:**
- Crear documento `nosotros/main` en Firestore con los arrays {chapters, valores, equipo, prensa, faqs}
- Crear colección `journal/` en Firestore con N entradas (actualmente hardcodeadas en el bundle)
- Crear documento `system/marquee` con array de credenciales
- Crear documento `system/services` con array de los 4 servicios
- Crear documento `system/atelier` con array de los 4 pasos del proceso

**Admin nuevo:**
- Crear `admin-nosotros.html` para editar el doc `nosotros/main`
- Crear `admin-journal.html` para CRUD de entries del journal
- Crear `admin-system.html` para editar marquee/services/atelier

**Esto es opcional** — fase 2 del plan. En fase 1, el contenido va hardcodeado en JS y se sirve igual.

### 5.3 db.onChange() obligatorio

Cada página pública con data dinámica suscribe a `db.onChange()` para sync admin → público en tiempo real:
- `home` → categories dock + featured + journal preview
- `colecciones` → pills + grid
- `pieza` → entire page
- `nosotros` → todas las arrays (chapters/valores/equipo/prensa/faqs) si en fase 2
- `journal` → grid
- `entrada` → contenido
- `carrito` + `wishlist` → re-render si admin cambia precio/imagen

---

## 6. Plan de ejecución por fases (sin retrocesos)

### **FASE A — Auditoría + Foundation (1 día, riesgo CERO)**

A.1 Backup completo: tag git `pre-novo-backup` apuntando a `main` actual.
A.2 Crear branch `claude/recambio-total-novo` desde `main`.
A.3 Mover `BERSAGLIO NOVO/` a `.handoff/` y agregar a `.gitignore` (no es parte del deploy).
A.4 Confirmación del usuario.

### **FASE B — Demolición (1 día, riesgo MEDIO)**

B.1 Borrar todos los HTML públicos (17 archivos).
B.2 Borrar `css/style.css` y `css/liquid-glass.css`.
B.3 Borrar todos los JS públicos (mantener admin/, firebase-config.js, firestore-service.js, auth.js).
B.4 Borrar `snippets/`.
B.5 Limpiar `img/` (solo borrar lo no usado por admin — se decide imagen por imagen).
B.6 Commit "demolición" + push.

**Verificación entre B y C:** el admin panel sigue funcionando 100% (sus archivos no se tocaron).

### **FASE C — Foundation nueva (1 día)**

C.1 Crear `css/liquid-glass.css` (mirror exacto del bundle, 350 líneas).
C.2 Crear `css/components.css` (vacío, se llenará por componente).
C.3 Crear `css/pages.css` (vacío).
C.4 Crear estructura `js/core/`, `js/components/`, `js/pages/`.
C.5 Crear `js/core/boot.js`, `router.js`, `data.js`, `cart.js`, `wishlist.js`, `utils.js`.
C.6 Crear shell HTML mínimo en cada `index.html` (con bj-world + critical CSS inline + boot.js).
C.7 Smoke test: home carga, bj-world se ve, sin contenido aún. Verificar performance baseline.

### **FASE D — Componentes shell (header + footer + drawers, 1 día)**

D.1 `js/components/header.js` — header pill flotante con 4 nav + search + cart icon
D.2 `js/components/footer.js` — footer aqua
D.3 `js/components/cart-drawer.js` — drawer lateral (puerta JS) con localStorage cart
D.4 `js/components/wishlist-drawer.js` — análogo
D.5 `js/components/cookie-banner.js` — banner pill
D.6 `js/components/email-modal.js` — modal capture
D.7 `js/components/search-overlay.js` — Cmd+K palette
D.8 `css/components.css` — todos los estilos asociados
D.9 Smoke test en home: header se ve, cart drawer se abre, search overlay con Cmd+K funciona

### **FASE E — Página HOME (2 días)**

Por componente:
E.1 `hero.js` (HomeHero del bundle, 340 líneas) — 3D parallax + halo iridiscente + 3 floating glass cards + featured-piece reading from Firestore
E.2 `marquee.js` — credenciales scrolleantes
E.3 `categories-dock.js` — 6 gel circles, count live de Firestore
E.4 `featured.js` — grid de pieces.featured=true
E.5 `editorial.js` — split image+quote (filosofía)
E.6 `services.js` — 4 servicios glass cards
E.7 `atelier.js` — 4 pasos emerald glass
E.8 `journal-preview.js` — últimas 3 entradas del journal
E.9 `cta-cartagena.js` — visit CTA
E.10 `pages/home.js` — compose all sections
E.11 Smoke test: home idéntica al bundle, sync admin live, performance OK

### **FASE F — Página CATÁLOGO (1 día)**

F.1 `pages/catalogo.js` — hero centrado + filter pills (Todo + dynamic) + sort dropdown + grid via piece-card.js
F.2 Wire `?col=<slug>` URL state con history.replaceState
F.3 Smoke test

### **FASE G — Página PIEZA (1 día)**

G.1 `pages/pieza.js` — gallery 4/5 + thumbs + glass info card + 4-cell specs + price + IVA + talla (anillos/argollas) + 3-button CTA + asesor gold + GIA chip + related pieces
G.2 SEO: og:title, og:image, og:description dinámico desde Firestore
G.3 ProductSchema JSON-LD inyectado
G.4 Smoke test

### **FASE H — Página NOSOTROS (1 día)**

H.1 `pages/nosotros.js` — hero editorial + chapters timeline + valores numerados + equipo cards + prensa list + FAQs accordion + CTA
H.2 Datos hardcoded en JS (fase 1) o desde `nosotros/main` en Firestore (fase 2 si se decide)
H.3 Smoke test

### **FASE I — Página CONTACTO (1 día)**

I.1 `pages/contacto.js` — form glass con motivo pills + sidebar 3 cards (Casa/Directo/<24h)
I.2 Submit a Firestore `consultas/` collection
I.3 Smoke test

### **FASE J — Página CARRITO + Checkout (1 día)**

J.1 `pages/carrito.js` — 3-step stepper (Carrito → Envío → Pago) + sidebar sticky glass-emerald
J.2 Wompi handler preservado
J.3 Smoke test

### **FASE K — Página JOURNAL + ENTRADA (1 día)**

K.1 `pages/journal.js` — grid de entries + filtro por categoría
K.2 `pages/entrada.js` — entry detail (hero image + body markdown + author + related)
K.3 Migrar entries existentes a Firestore `journal/`
K.4 Smoke test

### **FASE L — Páginas legales (medio día)**

L.1 `pages/privacidad.js`, `pages/terminos.js`, `pages/gracias.js` — todas con shell aqua + content estático

### **FASE M — Performance polish (1-2 días)**

M.1 Critical CSS inline por página (extraer above-the-fold)
M.2 Image optimization (AVIF + WebP responsive)
M.3 Service Worker
M.4 Resource hints
M.5 `content-visibility: auto`
M.6 View Transitions API
M.7 Lighthouse audit + iterate hasta target

### **FASE N — QA + Sync admin verification (1 día)**

N.1 Test E2E: admin agrega pieza → home featured + colecciones + categories dock todos actualizan
N.2 Mobile responsive en cada breakpoint (480/620/768/920/1280)
N.3 Cross-browser (Safari, Chrome, Firefox, Edge)
N.4 A11y: keyboard nav, focus rings, screen reader, prefers-reduced-motion
N.5 Validate HTML + CSS + JS

### **FASE O — Documentación + cleanup (1 día)**

O.1 Reescribir `CLAUDE.md` desde cero (mantener historial pero archivar lo viejo en `CLAUDE-LEGACY.md`)
O.2 Documentar arquitectura nueva, contratos de componentes, NO-TOCAR
O.3 Borrar `BERSAGLIO NOVO/` del repo (ya implementado)
O.4 Final commit + merge a main

---

## 7. Estimación total

| Fase | Tiempo | Riesgo |
|---|---|---|
| A. Foundation | 1 día | 0% |
| B. Demolición | 1 día | medio (sin recovery rápido si admin se rompe) |
| C. Foundation nueva | 1 día | bajo |
| D. Shell components | 1 día | bajo |
| E. Home (8 sub-secciones) | 2 días | medio |
| F. Catálogo | 1 día | bajo |
| G. Pieza | 1 día | medio |
| H. Nosotros | 1 día | bajo |
| I. Contacto | 1 día | bajo |
| J. Carrito | 1 día | medio |
| K. Journal | 1 día | medio (Firestore data migration) |
| L. Legales | 0.5 días | 0% |
| M. Performance | 1-2 días | medio |
| N. QA | 1 día | 0% |
| O. Docs | 1 día | 0% |
| **TOTAL** | **15-16 días** efectivos | — |

En sesiones de Claude Code con timeout, traducimos esto a:
- **Sesión 1:** Fases A + B (auditoría + demolición + commit)
- **Sesión 2:** Fases C + D (foundation + shell components)
- **Sesión 3:** Fase E (home completo)
- **Sesión 4:** Fases F + G (catálogo + pieza)
- **Sesión 5:** Fases H + I (nosotros + contacto)
- **Sesión 6:** Fases J + K (carrito + journal)
- **Sesión 7:** Fases L + M (legales + performance)
- **Sesión 8:** Fases N + O (QA + docs final)

**~8 sesiones de trabajo**.

---

## 8. Riesgos y mitigaciones

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Admin panel se rompe accidentalmente | media | Tag `pre-novo-backup` antes de empezar; smoke test admin después de cada fase |
| Sync Firestore se rompe | baja | `firestore-service.js` no se toca; auditar imports en cada componente nuevo |
| Performance no llega a target | media | Lighthouse en cada fase; iterate antes de avanzar |
| Mobile rompe | media | Testing en cada componente antes de pasar al siguiente |
| User feedback durante implementación cambia diseño | alta | Mantener Plan vivo, ajustar fases sobre la marcha |
| Firebase quotas explotan | baja | Usar listeners onChange con coalescing rAF (ya implementado) |
| Cache stale después de deploy | media | Service Worker con versión + `Cache-Control` correcto |
| URL routing se rompe | baja | Páginas estáticas separadas (no SPA) → cada URL es independiente |

---

## 9. Definition of Done (DoD)

✅ **Visualmente:** mirror pixel-perfecto del bundle Claude Design en cada página
✅ **Performance:** Lighthouse Mobile ≥ 90 en cada métrica core
✅ **Sync admin:** test E2E pasa para piezas, colecciones, journal
✅ **Mobile:** todas las páginas funcionan en 320px, 480px, 768px, 1280px
✅ **A11y:** keyboard nav completo, focus rings, ARIA, screen reader, reduced-motion
✅ **Cross-browser:** Safari 16+, Chrome 110+, Firefox 110+, Edge 110+
✅ **SEO:** canonical, og, schema.org en cada página
✅ **No dead code:** cero referencias a archivos viejos
✅ **Documentación:** CLAUDE.md actualizado con arquitectura nueva + contratos + NO-TOCAR

---

## 10. Próximos pasos inmediatos

1. **Usuario revisa este plan** y confirma o pide ajustes
2. **Si OK:** ejecutar Fase A (backup + branch nueva)
3. **Punto de no retorno:** Fase B (demolición). Una vez ejecutada, reverso = revert + force push.
4. **Sesión 1 termina con Fase B commiteada** y admin verificado funcional.

---

## 11. Apéndice — referencias del bundle

- `BERSAGLIO NOVO/project/bersaglio.html` — entry point React (referencia, no usar tal cual)
- `BERSAGLIO NOVO/project/css/liquid-glass.css` — design system (350 líneas, mirror 1:1)
- `BERSAGLIO NOVO/project/js/page-home.jsx` — Home (1100+ líneas, 9 secciones)
- `BERSAGLIO NOVO/project/js/pages.jsx` — Catalogo, Producto, Nosotros, Contacto, Checkout (970+ líneas)
- `BERSAGLIO NOVO/project/js/shell.jsx` — Header, Footer, CartDrawer, providers (~600 líneas)
- `BERSAGLIO NOVO/project/js/tweaks-panel.jsx` — dev tweaks (NO portar — es solo prototyping)
- `BERSAGLIO NOVO/project/assets/` — imágenes ejemplo (no son finales — admin sube las reales)
- `BERSAGLIO NOVO/project/uploads/` — material de marca subido por usuario

---

**Status:** ⏸ esperando aprobación del usuario para iniciar Fase A.
