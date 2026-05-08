# PLAN-NOVO — Recambio Total Bersaglio Jewelry

> **🔒 SOURCE OF TRUTH:** carpeta `BERSAGLIO NOVO/` dentro del repo (handoff de Claude Design).
> **NO** dependas del URL `api.anthropic.com/v1/design/h/...` — expira. Toda referencia visual/funcional viene de los archivos locales.
>
> **⚠️ Antes de ejecutar Fase B (demolición), el usuario DEBE aprobar este documento.**
>
> **Branch sugerida:** `claude/recambio-total-novo` (forkeada desde `main`, NO sobre `claude/review-liquid-glass-pr-Aciap`)
>
> **Admin panel:** **NO SE TOCA.** `js/admin/*`, `js/firestore-service.js`, `js/firebase-config.js`, `js/auth.js`, `admin*.html`, `admin.css` se conservan intactos.

---

## 0. Mapa de archivos en `BERSAGLIO NOVO/` (single source of truth)

```
BERSAGLIO NOVO/
├── README.md                                   handoff Claude Design
└── project/
    ├── bersaglio.html                          87 lines  — entry React + import map
    ├── css/
    │   └── liquid-glass.css                    350 lines — design system completo
    ├── js/
    │   ├── shell.jsx                           319 lines — Logo, Cart, Router, Header, CartDrawer, Footer, PRODUCTS
    │   ├── page-home.jsx                      1075 lines — 9 secciones del home
    │   ├── pages.jsx                          1106 lines — Catalogo, Producto, Nosotros, Contacto, Field, Checkout
    │   └── tweaks-panel.jsx                    419 lines — DEV ONLY, NO PORTAR
    ├── assets/
    │   ├── banner-hero.png                       (~5.7 MB) hero
    │   ├── model-emerald.png                     (~6.6 MB) editorial + dijes
    │   ├── earrings-emerald.png                  (~6.2 MB) topos clásicos
    │   ├── earrings-travertino.png               (~6.2 MB) halo
    │   ├── ring-sapphire.jpg                     (~85 KB)  trinity
    │   └── logo-bersaglio.png                    (~178 KB) logo
    └── uploads/                                  imagería extra del cliente (no son finales)
```

> **Reglas para usar el bundle:**
> 1. Cuando un coding agent necesite reproducir layout / copy / colores / animaciones, **lee directamente** los archivos de `BERSAGLIO NOVO/project/`.
> 2. Las imágenes en `assets/` son **placeholders** del prototipo — las imágenes finales las sube el admin a Firebase Storage.
> 3. La carpeta `uploads/` es material de marca del cliente (logos, presentaciones .docx). Solo referencia, no se sirve.
> 4. `tweaks-panel.jsx` es un dev-only panel para mover sliders del prototipo. **NO portar.**
> 5. La estructura React (`useState`, `useContext`, JSX) es referencia — la implementación final será **vanilla ESM** (ver §3).

---

## 1. Tabla maestra de páginas

| URL pública | Archivo HTML | JS handler | Source-of-truth en BERSAGLIO NOVO |
|---|---|---|---|
| `/` (home) | `index.html` | `js/pages/home.js` | `page-home.jsx` líneas 1-1075 |
| `/colecciones.html` | `colecciones.html` | `js/pages/catalogo.js` | `pages.jsx` líneas 7-97 (function `Catalogo`) |
| `/pieza.html?p=<slug>` | `pieza.html` | `js/pages/pieza.js` | `pages.jsx` líneas 98-197 (function `Producto`) |
| `/nosotros.html` | `nosotros.html` | `js/pages/nosotros.js` | `pages.jsx` líneas 198-537 (function `Nosotros`) |
| `/contacto.html` | `contacto.html` | `js/pages/contacto.js` | `pages.jsx` líneas 538-969 (function `Contacto`) |
| `/carrito.html` | `carrito.html` | `js/pages/carrito.js` | `pages.jsx` líneas 995-1106 (function `Checkout`) |
| `/journal.html` | `journal.html` | `js/pages/journal.js` | derivado de `HomeJournal` (page-home.jsx 869-1045) — full archive |
| `/entrada.html?e=<slug>` | `entrada.html` | `js/pages/entrada.js` | nuevo — derivado de la card de portada de `HomeJournal` |
| `/gracias.html` | `gracias.html` | inline | no existe en bundle — diseño legal heredado en aqua |
| `/privacidad.html` | `privacidad.html` | inline | no existe en bundle — copy heredada |
| `/terminos.html` | `terminos.html` | inline | no existe en bundle — copy heredada |

---

## 2. Especificación EXACTA del HOME (page-home.jsx)

### 2.1 Estructura macro

`<Home>` renderiza 9 secciones en este orden (page-home.jsx líneas 7-23):

```
1. <HomeHero/>          → líneas 28-364
2. <HomeMarquee/>       → líneas 367-451
3. <HomeCategories/>    → líneas 456-553
4. <HomeFeatured/>      → líneas 558-606
5. <HomeEditorial/>     → líneas 609-650
6. <HomeServices/>      → líneas 653-695
7. <HomeAtelier/>       → líneas 698-867
8. <HomeJournal/>       → líneas 869-1045  ⭐ NUEVA en este handoff
9. <HomeCTA/>           → líneas 1050-1075
```

### 2.2 Sección 1 — HomeHero (líneas 28-364)

**Concept:** pieza central flotando con parallax 3D de capas cristal en respuesta al cursor.

**Elementos:**
- Layout grid 2 columnas (1.1fr / 1fr en desktop, 1fr stacked en ≤920px)
- **Izquierda (copy):**
  - Chip pair: `<span class="chip"><chip-dot/>Alta Joyería · Colombia</span>` + `<span class="chip">[gem-svg gold] Esmeralda Colombiana</span>`
  - H1 display Cormorant Garamond clamp(52px, 7vw, 104px), peso 300:
    > Donde la luz<br>
    > _<em class="emerald-text">cobra alma</em>_<br>
    > <small style=opacity:0.7>& la gema, eternidad.</small>
  - P descripción 17px ink-soft max 500px:
    > "Esmeraldas de Muzo, diamantes certificados y oro 18K esculpidos en piezas únicas. Cada creación Bersaglio es una arquitectura de luz diseñada para trascender generaciones."
  - 2 CTAs: `btn-aqua btn-aqua-emerald "Explorar colecciones →"` + `btn-aqua "Agendar asesoría privada"`
  - Stats crystalline (3 glass cards): **18K** Oro Ley 750 · **GIA** Certificación · **1:1** Asesoría privada
- **Derecha (3D stage):**
  - Halo iridiscente conic-gradient (480px, blur 40px, animado float 22s)
  - Card principal `glass glass-iridescent glass-lg` 8%/12% inset, fondo `assets/model-emerald.png`, gradient overlay, contenido inferior:
    - Eyebrow "Featured"
    - Display "Halo Esmeralda"
    - Sub "Topos · Oro 18K · Edición 2026"
    - Glass-pill price "$ 12.400.000" mono
  - Floating card top-right (gem) — `data-tilt="1.8"` — animation float 8s:
    - Icon gradient emerald 40×40
    - Label "GEMA"
    - Value "Muzo · 2.4 ct"
  - Floating card mid-left (cert) — `data-tilt="1.5"` — float 10s -2s delay:
    - Icon gradient gold 32×32
    - Label "CERTIFICADO"
    - Value "GIA · N° 2183-4412"
  - Floating tag bottom-center (`glass-emerald`) — `data-tilt="2"` — float 12s -4s:
    - Eyebrow "Atelier 2026"
    - Italic display "Colección Muzo"
    - Sub "6 piezas únicas"

**Animations:**
- `mousemove` global → calcula `x,y` relativos al stage → aplica `perspective(1200px) rotateY(mx*4*depth) rotateX(-my*4*depth)` a cada `[data-tilt]`
- `@keyframes float` aplicado a halo y floating cards con duración variable

### 2.3 Sección 2 — HomeMarquee (líneas 367-451)

**Concept:** cinta de credenciales que recorre con velocidad sutil, en glass-pill verde-cristal con fades laterales.

**7 ítems en orden:**
1. "Oro 18K · Ley 750"
2. "Esmeraldas Colombianas"
3. "Asesoría Personalizada"
4. "Garantía Vitalicia"
5. "Atelier en Cartagena"
6. "Envío Asegurado Mundial"
7. "Una pieza, una historia"

**Separador entre ítems:** línea hairline gold 14px + diamante rotado 6×6 + línea 14px (todo `oklch(85% 0.14 88 / 0.7)`)

**Animation:** `@keyframes hmMarquee from translateX(0) to translateX(-33.333%)` — duración 50s linear infinite. Items duplicados 3× en el track.

**Estilo del contenedor pill:**
- `padding: 8px 0; borderRadius: 999`
- `background: linear-gradient(135deg, oklch(75% 0.04 155 / 0.22) 0%, oklch(65% 0.06 155 / 0.18) 50%, oklch(75% 0.04 155 / 0.22) 100%)`
- `backdrop-filter: blur(16px) saturate(150%)`
- Multi-shadow inset highlights (ver líneas 387-394 del bundle)
- Fades laterales 50px ancho con `linear-gradient(90deg, oklch(80% 0.05 155 / 0.5), transparent)` izquierda + reverso derecha

**Texto de cada ítem:**
- Font display, 14px, weight 500, color `#fff`
- Padding horizontal 28px
- Text-shadow: `0 1px 2px oklch(15% 0.04 155 / 0.7), 0 0 8px oklch(15% 0.04 155 / 0.5)`

### 2.4 Sección 3 — HomeCategories (líneas 456-553)

**Concept:** dock iOS-style, 6 cards verticales 3:4 con imagen full-bleed + gradient overlay + hover lift y zoom interno de imagen.

**6 categorías exactas:**
| name | count | img | hue | pos |
|---|---|---|---|---|
| Anillos | 24 | ring-sapphire.jpg | 200 | center |
| Topos | 18 | earrings-travertino.png | 30 | center |
| Argollas | 12 | earrings-emerald.png | 155 | center |
| Dijes | 16 | model-emerald.png | 155 | "center top" |
| Pulseras | 9 | banner-hero.png | 90 | center |
| Editorial | 6 | model-emerald.png | 155 | center |

**Implementación dinámica:** las 6 categorías se leen de `db.getCollections()` (Firestore). El `count` se calcula con `db.getByCollection(slug).length`. Si admin agrega nueva categoría, aparece automáticamente.

**Header sobre el dock:**
- Eyebrow "Nuestras categorías"
- H2 clamp(38, 5vw, 64) peso 300: "Un universo _<em class=emerald-text>en cristal</em>_"
- P 16px ink-soft max 520px: "Cada categoría es una exploración distinta de forma, luz y significado."

**Card spec:**
- `glass` con `padding:3` (ribete cristal de 3px alrededor de la imagen)
- `aspect-ratio: 3/4`, `borderRadius: 28`
- Imagen `position:absolute inset:0`, transition `transform .8s cubic-bezier(.2,.9,.2,1)`
- Overlay gradient con `--hue` dinámico para cada categoría
- Bottom-left absolute (14px / 14px / bottom 14px):
  - Display name clamp(18, 1.7vw, 22) peso 400 white text-shadow
  - Mono count "{N} piezas" 10px tracked uppercase color `oklch(95% 0.04 90 / 0.9)`
- **Hover:** card `translateY(-8px)` + imagen interna `scale(1.08)`

**Grid breakpoints:**
- Default: 6 columnas
- ≤980px: 3 columnas
- ≤520px: 2 columnas

### 2.5 Sección 4 — HomeFeatured (líneas 558-606)

**Concept:** grid editorial de piezas destacadas con cards `glass glass-iridescent`.

**Header:** flex space-between
- Izquierda: eyebrow "Piezas destacadas" + H2 "Selección _<em class=emerald-text>curada</em>_"
- Derecha: `btn-aqua "Ver todo el catálogo →"`

**Grid:** `auto-fit minmax(280px, 1fr)` gap 22px. Pieces leídas de `db.getFeatured()` (Firestore where featured=true).

**Card spec:**
- `glass glass-iridescent` padding 0 borderRadius 30
- Hover `translateY(-10px)` + boxShadow lift
- Imagen aspect 4/5, gradient top + bottom subtle
- Tag chip `top:14, left:14` con `chip-dot var(--bj-gold-500)` (si `p.tag` existe — "Best Seller", "Edición limitada", etc.)
- Wishlist btn `top:14, right:14` — 36px circle, icon heart, glass white-translucent
- Body padding 20px 22px:
  - Mono eyebrow categoría 10px tracked
  - Display name 22px peso 500 ink-emerald
  - Sub "stones · gold" 12px ink-soft
  - Footer (border-top hairline white 0.5):
    - Mono price `$ X.XXX.XXX` 15px peso 600 emerald-800
    - "Ver pieza →" 11px ink-mute con flecha 10×10

### 2.6 Sección 5 — HomeEditorial (líneas 609-650)

**Concept:** split image+quote, glass-iridescent.

**Layout:** grid 1.1fr / 1fr, gap 28, items stretch (≤920px stacked).

**Izquierda — Editorial Image card:**
- `glass glass-iridescent` borderRadius 44, padding 0, minHeight 500, position relative
- Background `url(assets/model-emerald.png) center/cover` full-bleed
- Gradient overlay `linear-gradient(180deg, transparent 40%, oklch(18% 0.05 155 / 0.65))`
- Bottom-left content (28px / 28px / bottom 28px):
  - Chip white-translucent backdrop-blur(16): `<chip-dot var(--bj-gold-300)/>Editorial`
  - H3 italic display 38px peso 300 white: "La Verde, 2026"
  - P 14px opacity 0.9 max 420: "Seis piezas esculpidas alrededor de la luz esmeralda colombiana."

**Derecha — Quote glass card:**
- `glass` borderRadius 44, padding 32 28, flex column justify-center
- Eyebrow "Nuestra filosofía"
- H2 clamp(32, 3.6vw, 52) peso 300: "Más que vender joyas,<br>_<em class=emerald-text>nos apasiona asesorar.</em>_"
- P 16px line-height 1.7 ink-soft: "Cada pieza tiene un significado. Somos cómplices silenciosos de los momentos que definen una vida: una propuesta, una promesa, un legado."
- Quote block italic display 22px emerald-800 padding-left 20 border-left 2px gold-500: '"Una joya Bersaglio no se compra. Se adopta."'
- Stats footer (border-top white 0.5, gap 40):
  - **12+** Años · **800+** Piezas únicas · **JA** Certificado
  - Stats: display 32px emerald-800 + eyebrow 10px

### 2.7 Sección 6 — HomeServices (líneas 653-695)

**Concept:** 4 servicios glass cards centrados, icon gradient emerald circle.

**Header:**
- Eyebrow "Experiencia premium"
- H2 clamp(38, 5vw, 60) peso 300: "Un servicio a la altura<br>_<em class=emerald-text>de cada pieza</em>_"

**4 servicios exactos:**
| # | Title | Description | Icon |
|---|---|---|---|
| 1 | Diseño a medida | Crea la pieza de tus sueños con nuestro atelier. Desde boceto hasta entrega. | pen |
| 2 | Asesoría privada | Consulta 1:1 con nuestros gemólogos. Virtual o en nuestra casa en Cartagena. | user |
| 3 | Certificación GIA | Cada pieza con diamante incluye certificado del Gemological Institute. | check |
| 4 | Garantía vitalicia | Mantenimiento, pulido y verificación de piedras de por vida. | shield |

**Iconos SVG (paths):**
- pen: `M12 20h9M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z`
- user: `M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2` + `circle cx=12 cy=7 r=4`
- check: `M20 6L9 17l-5-5`
- shield: `M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z`

**Card:**
- `glass` borderRadius 28 padding 24×22 text-align center
- Icon circle 60×60 margin auto 18 bottom:
  - Background `radial-gradient(circle at 30% 30%, oklch(95% 0.08 150), oklch(65% 0.17 155) 70%)`
  - Box-shadow `inset 0 2px 0 oklch(100% 0 0 / 0.9), 0 8px 24px -4px oklch(50% 0.15 155 / 0.4)`
  - SVG 22×22 stroke white
- Display title 19px peso 500 ink-emerald margin-bottom 8
- P 13px ink-soft line-height 1.6

**Grid:** `auto-fit minmax(240px, 1fr)` gap 18.

**Servicios dinámicos (decisión):** mantener hardcoded en JS (4 servicios fijos de marca). Migrar a Firestore solo si admin necesita editar copy en el futuro (fase 2 del proyecto).

### 2.8 Sección 7 — HomeAtelier (líneas 698-867)

**Concept:** 4 esquinas con cards (1 en cada corner), joya central, líneas SVG conectando todo.

**4 pasos:**
| # | Title | Description |
|---|---|---|
| 01 | Diseño a medida | Fabricamos y diseñamos. Creamos la joya de tus sueños desde cero, con los mejores metales y gemas. |
| 02 | Asesoría cercana | Te visitamos puerta a puerta. Esa cercanía es nuestro sello: encontramos la pieza que refleje tu esencia. |
| 03 | Garantía certificada | Todas nuestras piezas vienen garantizadas. Diamantería con certificación internacional GIA. |
| 04 | Cuidado de por vida | Limpieza, mantenimiento y restauración. Tus joyas brillarán como el primer día, siempre. |

**Header:**
- Chip "<chip-dot gold-500/>Atelier Bersaglio"
- H2 clamp(36, 4vw, 56) peso 300: "El proceso detrás de _<em class=emerald-text>una pieza única</em>_"
- P 15px ink-soft: "Cuatro pasos que convierten una idea en patrimonio familiar."

**Stage:** `glass glass-iridescent` minHeight 580 borderRadius 48 padding 36, background `linear-gradient(160deg, oklch(96% 0.02 90 / 0.6), oklch(94% 0.05 150 / 0.45))`.

**SVG conectores radiales:** elemento absoluto inset 0, 4 línear gradients que conectan cada corner card al centro (radial fade gold).

**Joya central:** SVG decorativa esmeralda compleja en el centro del stage.

**4 cards (corners):**
- Posiciones:
  - 0: `top: 20, left: 20`
  - 1: `top: 20, right: 20`
  - 2: `bottom: 20, left: 20`
  - 3: `bottom: 20, right: 20`
- Display number 64px italic emerald-700 (posicionado según corner: izq/der)
- Title display 18px peso 500 ink-emerald
- Desc 12.5px ink-soft

**Mobile (≤768px):** colapsa a stack vertical, cards full-width, joya central oculta o reducida (ver bundle líneas 800-867).

### 2.9 Sección 8 — HomeJournal (líneas 869-1045) ⭐

**Concept:** Above-the-fold tipo periódico (NYT-style) con masthead + breaking ticker + portada + sidebar "Más leídos" + newsletter inline + trio inferior. **MUY DETALLADA.**

**Masthead (líneas 901-918):**
- Mono "EST. 2014" 10px tracked
- Vertical hairline 18px gold-500
- H2 display 34px: "The _<em>Bersaglio</em>_ Journal"
- Right: mono "Issue Nº 14 · Marzo 2026" + btn-aqua "Archivo completo →"
- Border-bottom 2px emerald-800
- Línea fina dorada gradient horizontal

**Breaking ticker (923-938):**
- Glass borderRadius 14, padding 10×18, flex
- Badge "EN VIVO" mono 10px white background emerald-800 con dot pulsante gold-300
- 4 noticias en marquee 38s linear:
  1. "Nuevo: Colección Atrato 2026 disponible"
  2. "Live · Subasta privada Casa Bersaglio 14·04"
  3. "Guía: 7 mitos sobre las esmeralda colombianas"
  4. "Atelier abierto · Cartagena · Cita previa"
- Separador `◆` color gold-500 entre cada

**Cover Story (article principal, izquierda 1.55fr):**
- Issue: "Issue Nº 14"
- Date: "Marzo 2026"
- Section: "Reportaje"
- Read time: "8 min"
- Kicker: "Las gemas que cambiaron Cartagena"
- Title H3 clamp(34, 3.6vw, 52) peso 400: "Esmeraldas: la historia oculta detrás del verde colombiano"
- Excerpt 16px line-height 1.7 ink-soft, **column-count 2** (2 columnas tipo periódico, gap 32, text-align justify)
- **Drop cap:** primera letra del excerpt en display 42px peso 400 emerald-800 float left
- Image: `assets/ring-emerald.png` aspect 16/10 borderRadius 24, vignette inferior emerald-ink 0.65 alpha
- Sección bandera top-left: badge mono uppercase background `var(--bj-gold-700)` "REPORTAJE" + read time
- Author block (border-top 14px paddingTop):
  - Avatar circle 36×36 emerald gradient con iniciales "MB" italic display
  - Author name "Por María Camila Bersaglio" 13px weight 500 ink-emerald
  - Mono date "MARZO 2026" 10px tracked
  - Right: "Continuar leyendo →" 13px weight 500 emerald-800

**Sidebar "Más leídos" (derecha 1fr):**
- Header flex baseline:
  - H4 italic display 22px peso 500 ink-emerald: "Más leídos"
  - Mono right "ESTA SEMANA" 10px tracked gold-700
  - Border-bottom 1px ink-emerald
- 4 stories en lista numerada (border-bottom hairline gold 0.3 entre cada):
  1. **Atelier · 12·03·26** — "Los seis pulsos de un anillo a medida" — 5 min
  2. **Mercado · 06·03·26** — "Por qué el oro 18K supera al 14K en patrimonio" — 4 min
  3. **Diseño · 28·02·26** — "Trinity: la geometría que enamoró a Cartier" — 6 min
  4. **Cuidado · 19·02·26** — "Rituales caseros para conservar el fuego de tu diamante" — 3 min
- Number 0N display 30px italic gold-700 izquierda
- Sec mono 10px tracked uppercase emerald-800
- Date `·` separator gold-500 + ink-soft
- Title display 18px peso 500 ink-emerald textWrap balance
- Mono read time 10px ink-soft

**Newsletter inline (sidebar bottom):**
- `glass glass-emerald` padding 22 borderRadius 20, white text
- Mono "NEWSLETTER" 10px tracked opacity 0.85
- Display 20px peso 400: "Una nota cada<br>_<em style=color:gold-300>luna llena</em>_"
- Input form glass white-translucent: input + btn gold "Suscribir"

**Trio inferior (líneas 1016-1029):** grid 3 columnas (collapse 1 col en ≤920px)
1. **Entrevista** — "_'La esmeralda es paciencia geológica'_" — Andrés Forero, gemólogo GIA — `assets/earrings-emerald.png`
2. **Editorial** — "Bodas que no se desvanecen" — Ensayo · Lina Restrepo — `assets/ring-sapphire.jpg`
3. **Patrimonio** — "Joyas que cruzaron tres generaciones" — Archivo familiar Bersaglio — `assets/earrings-travertino.png`

Cada uno: image aspect 5/4 borderRadius 18, badge sec top-left mono blur backdrop, h4 display 22px peso 500 textWrap balance, mono author 11px tracked uppercase ink-soft.

**Datos dinámicos:** todo el contenido del journal (cover, ticker, sideStories, trio) se migra a Firestore `journal/` en fase 2. En fase 1, hardcoded.

### 2.10 Sección 9 — HomeCTA (líneas 1050-1075)

**Concept:** glass-iridescent CTA centrado con halo gold radial.

- Padding 48×40 borderRadius 48
- Halo absoluto top:0 left:50% transformX:-50% width:600 height:300, gradient gold ellipse blur 40
- Eyebrow "Visita nuestra casa"
- H2 clamp(38, 5vw, 72) peso 300: "Cartagena<br>_<em class=emerald-text>de Indias</em>_"
- P 16px ink-soft max 520: "Calle 36 # 6-32, Calle San Agustín Chiquita. Te esperamos con una experiencia privada."
- 2 CTAs: `btn-aqua btn-aqua-emerald "Agendar visita"` + `btn-aqua "Ver catálogo online"`

---

## 3. Especificación de páginas internas (pages.jsx)

### 3.1 Catalogo (líneas 7-97)

**Concept:** hero centrado + filtros pills + sort dropdown + grid de cards. Pieces dinámicos de Firestore.

**Hero:**
- Eyebrow "Catálogo · 2026"
- H1 clamp(48, 6vw, 88) peso 300: "Todas las _<em class=emerald-text>piezas</em>_"
- P 16px ink-soft max 540: "Explora nuestra colección completa. Cada pieza es única, con certificación de origen y oro de ley 750."

**Filtros (línea 42):** glass-pill con 6 botones — "Todo · Anillos · Aretes · Argollas · Dijes · Editorial". Categorías DINÁMICAS desde `db.getCollections()`. Active state: emerald gradient.

**Sort dropdown:** glass-pill con label "Orden" mono uppercase + select (Destacados / Precio menor / Precio mayor).

**Grid:** `auto-fit minmax(280px, 1fr)` gap 22. Same card markup que HomeFeatured.

### 3.2 Producto (líneas 98-197)

**Concept:** detail page con gallery + thumbs + info panel.

**Breadcrumb:** mono "INICIO → CATÁLOGO → {pieza.name}".

**Layout:** grid 1.1fr / 1fr gap 48 (stack ≤920px).

**Gallery (izquierda):**
- Main image `glass glass-iridescent` borderRadius 36 aspect 4/5 mb 14
- Chip top-right glass white-translucent: gem-svg + "GIA Certificado"
- Thumbs grid 3-cols gap 10: cada uno aspect 1, glass borderRadius 18, border 2px emerald-600 si activo

**Info (derecha):**
- Eyebrow `{pieza.cat} · Bersaglio 2026`
- H1 clamp(38, 4vw, 56) peso 300
- Price row mono 28px emerald-800 + "IVA incluido" 11px tracked uppercase ink-mute
- Description P 16px line-height 1.7 ink-soft mb 32
- Specs 4 glass cards 2×2 (line-height fluido):
  - **Gema principal** | piece.specs.stone
  - **Metal** | piece.specs.metal
  - **Origen** | "Muzo, Colombia"
  - **Entrega** | "2-3 semanas"
- Talla selector (eyebrow "Talla" + 5 glass pills 5/6/7/8/9 + "A medida" pill) — solo si pieza.collection ∈ {anillos, argollas}
- Actions:
  - 1 btn-aqua btn-aqua-emerald flex 1: "Agregar al carrito"
  - 1 btn-aqua 58×58 wishlist heart icon
- Bottom btn-aqua btn-aqua-gold full-width: "Consultar con un asesor"

### 3.3 Nosotros (líneas 198-537) — 340 líneas, MUY EXPANDIDA

**Concept:** historia editorial completa con chapters timeline + valores + equipo + prensa + FAQs accordion.

#### Hero editorial (líneas 252-280):
- Mono CAPITULO 00 · QUIÉNES SOMOS gold-700 tracked
- H1 clamp(56, 7.5vw, 120) peso 200: "Una joya<br>_<em class=emerald-text peso=300>se elige,</em>_<br>no se compra."
- P 19px ink-soft max 540
- P 16px italic ink-mute max 540

#### 5 Chapters (líneas 204-211 — array `chapters`):

| Year | Title | Description |
|---|---|---|
| 2013 | El primer encuentro | "Kary Mendoza comienza visitando familias en Cartagena, casa por casa. No vendía joyas: escuchaba historias. Cumpleaños, aniversarios, primeras comuniones, herencias. Cada conversación se convertía en una pieza pensada con propósito." |
| 2016 | La primera vitrina | "Tras tres años de relaciones íntimas, abre un primer espacio en el Centro Histórico. La filosofía no cambió: la puerta se abre con cita previa, una taza de café tinto, y la promesa de que ninguna pieza sale del atelier sin haber sido pensada para alguien específico." |
| 2020 | Reconocimiento internacional | "Bersaglio se convierte en miembro de Jewelers of America, certificación que avala estándares éticos en abastecimiento de gemas, trazabilidad de oro y prácticas laborales. Esmeraldas certificadas Muzo y diamantes con reporte GIA." |
| 2023 | Diez años de oficio | "Más de mil piezas entregadas, cada una con su libreta de origen: la mina de la gema, el orfebre que la talló, el cliente que la encargó, la ocasión que celebra. La memoria viva del atelier." |
| 2026 | Colección La Verde | "Seis piezas únicas con esmeraldas Muzo Vieja sin tratamiento, monturas en oro 18K paladiado y diamantes briolette. Una declaración: la esmeralda colombiana no necesita imitar a otras gemas, basta con dejar que cuente su propia historia." |

#### 6 Valores (líneas 214-220 — array `valores`):

| # | Title | Description |
|---|---|---|
| 01 | Asesoría antes que venta | "No te mostramos catálogos. Te preguntamos por la persona, la ocasión, el presupuesto, el sentimiento. La pieza correcta aparece después, no antes." |
| 02 | Origen verificable | "Cada esmeralda viene con certificado de mina (Muzo, Coscuez, Chivor). Cada diamante con reporte GIA. Cada gramo de oro con trazabilidad RJC." |
| 03 | Orfebrería paciente | "Cuatro a seis semanas por pieza. Sin atajos, sin moldes industriales. Cera perdida, lima en mano, lupa de relojero." |
| 04 | Servicio de por vida | "Limpieza, pulido, reanclaje, redimensionado. Si la pieza salió de Bersaglio, vuelve cuando lo necesite. Sin costo, sin condiciones, durante toda la vida." |
| 05 | Discreción absoluta | "No publicamos nombres, no etiquetamos clientes, no compartimos imágenes sin permiso explícito. Tu pieza es tu historia." |
| 06 | Herencia como medida del éxito | "No medimos por ventas. Medimos por cuántas de nuestras piezas vuelven al atelier veinte años después, esta vez en manos de la siguiente generación." |

#### 4 Equipo (líneas 223-228 — array `equipo`):

| Nombre | Rol | Bio |
|---|---|---|
| Kary Mendoza | Fundadora & Directora | "Diez años escuchando historias y traduciéndolas en piezas. Su firma está en cada decisión: la gema, el orfebre, el detalle final." |
| Maestro Eliécer Patiño | Orfebre principal | "Treinta y dos años en oficio. Aprendiz en Mompox, oficial en Cartagena. Cera perdida, engaste pavé, tallado de filigrana." |
| Lucía Restrepo | Gemóloga GIA | "Certificada por el Gemological Institute of America. Selecciona y autentica cada esmeralda y diamante antes de que entre al taller." |
| Andrés Beltrán | Diseño & dibujo técnico | "Boceto a mano, render 3D, prototipado en cera. Traduce conversaciones en planos que el orfebre puede ejecutar." |

#### 4 Prensa (líneas 230-235 — array `prensa`):

| Medium | Title | Year |
|---|---|---|
| Vogue Latinoamérica | "La nueva ola de la alta joyería colombiana" | 2024 |
| Forbes Colombia | "Bersaglio: el lujo discreto de Cartagena" | 2023 |
| El Espectador | "Kary Mendoza, la voz detrás del atelier" | 2023 |
| Revista Diners | "Esmeraldas con apellido" | 2022 |

#### 6 FAQs (líneas 237-244 — array `faqs`):

1. **¿Cuánto tarda una pieza a medida?** — "Entre cuatro y seis semanas desde la aprobación del boceto. La primera conversación, los renders y los ajustes pueden sumar dos semanas adicionales. No aceleramos plazos: el oficio paciente no admite atajos."
2. **¿Trabajan con piedras del cliente?** — "Sí. Recibimos gemas heredadas, las evaluamos con nuestra gemóloga, y las integramos en una pieza nueva. Si la talla original tiene daños, ofrecemos retalle previo en taller especializado."
3. **¿Hacen envíos internacionales?** — "Sí, con seguro pleno declarado y entrega registrada por DHL Express o FedEx Priority. Despachamos a más de cuarenta países. Los aranceles del país destino corren por cuenta del cliente."
4. **¿Aceptan financiación?** — "Hasta tres cuotas sin interés con tarjetas locales. Para piezas sobre $50.000.000 COP estructuramos planes a seis o doce meses con entidades aliadas."
5. **¿Puedo visitar el atelier sin comprar?** — "Por supuesto. La cita previa es solo para garantizar que tengamos tiempo para ti. Recibirás un café, te mostraremos el taller, conocerás al maestro orfebre. Sin compromiso de compra."
6. **¿Qué garantía tienen las piezas?** — "Garantía de por vida en estructura y engaste. Si una piedra se afloja, la reparamos sin costo. Si una soldadura cede, la rehacemos. Mientras Bersaglio exista, tu pieza tiene casa."

**Datos dinámicos (decisión):** migrar las 5 arrays (chapters, valores, equipo, prensa, faqs) a Firestore `nosotros/main` document → admin edita.

### 3.4 Contacto (líneas 538-969) — 432 líneas

**Concept:** form glass + sidebar 3 cards. Pre-fills si viene `?ref=<slug>` desde pieza.

**Form fields (state form: {n, e, p, t (motivo), m}):**
- Nombre
- Email
- Teléfono (opcional)
- Motivo pills (radio): asesoria / pieza / visita / otro
- Mensaje (textarea)
- Submit btn-aqua-emerald

**Helper Field component (líneas 970-994):** label + input/textarea con glass-pill style.

**Sidebar 3 cards:**
1. **Casa Bersaglio (glass-emerald):** "Cartagena de Indias" + dirección + horario + "Cómo llegar →"
2. **Directo (glass):** WhatsApp + Email rows + Instagram + Facebook icons
3. **Respuesta garantizada (gold gradient glass):** Eyebrow + "< 24h" display + nota

**Sync:** form submit escribe a Firestore `consultas/` collection.

### 3.5 Checkout (líneas 995-1106)

**Concept:** 3-step stepper (Carrito / Envío / Pago) + sticky summary glass-emerald.

**Stepper:** glass-pill 3 botones con mono number + label.

**Step 1 (Carrito):** items list + qty editor + remove.
**Step 2 (Envío):** form 7 fields (Nombre, Apellido, Dirección, Ciudad, País, CP, Teléfono, Email).
**Step 3 (Pago):** 4 radio cards (Tarjeta crédito, PSE, Transferencia, Financiación 3 cuotas).

**Sidebar sticky (right, 1fr):** glass-emerald con line items + Subtotal + "Envío asegurado Gratis" + "IVA incluido —" + Total mono 24px.

---

## 4. Design system tokens (BERSAGLIO NOVO/project/css/liquid-glass.css)

### 4.1 Colors (oklch)

```css
/* Brand emerald scale */
--bj-emerald-100..900   /* 100=oklch(97% 0.02 150) → 900=oklch(28% 0.08 155) */

/* Brand gold scale */
--bj-gold-100..900      /* 100=oklch(96% 0.04 90) → 900=oklch(55% 0.12 80) */

/* Pearl + neutrals */
--bj-pearl: oklch(98% 0.005 90)
--bj-ivory: oklch(96% 0.012 85)
--bj-cream: oklch(94% 0.018 82)
--bj-mist:  oklch(90% 0.01 150)

/* Ink (replaces black) */
--bj-ink-emerald: oklch(18% 0.05 155)
--bj-ink-soft:    oklch(32% 0.03 155)
--bj-ink-mute:    oklch(50% 0.02 155)
```

### 4.2 Glass system

```css
--glass-blur: 28px
--glass-saturate: 180%
--glass-tint: oklch(96% 0.02 150 / 0.55)
--glass-tint-strong: oklch(94% 0.03 150 / 0.72)
--glass-tint-dark: oklch(35% 0.08 155 / 0.35)
--glass-border: 1px solid oklch(100% 0 0 / 0.5)
--glass-border-inner: inset 0 1px 0 oklch(100% 0 0 / 0.85)
--glass-shadow: multi-layer (5 layers, ver línea 43-48 del bundle)
--glass-shadow-lg: multi-layer larger
--pinlight: radial-gradient(ellipse 60% 50% at 50% 0%, oklch(100% 0 0 / 0.95) 0%, transparent 60%)
--iridescent-rim: conic-gradient(from 180deg at 50% 50%, /* 5 stops */)
```

### 4.3 Typography (NEW vs implementación previa)

```css
--font-brand:   "Fraunces", "Cormorant Garamond", "Times New Roman", serif
--font-display: "Cormorant Garamond", "Fraunces", "Times New Roman", serif
--font-ui:      "Manrope", -apple-system, "SF Pro Text", sans-serif
--font-mono:    "Space Mono", "SF Mono", ui-monospace, Menlo, monospace
```

> **Cambios vs implementación previa:**
> - `--font-display` ahora es **Cormorant Garamond primero** (era Fraunces)
> - `--font-ui` ahora es **Manrope** (era Inter)
> - `--font-mono` ahora es **Space Mono** (era JetBrains Mono)
> - Nuevo token `--font-brand` para el wordmark del header

**Google Fonts URL:** `https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Manrope:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap`

### 4.4 Radii

```css
--r-sm: 10px   --r-md: 16px   --r-lg: 22px
--r-xl: 32px   --r-2xl: 44px  --r-pill: 999px
```

### 4.5 Background `.bj-world` (líneas 102-135 del bundle)

Capa fija z:-1 con:
- 3 radial gradients (emerald top-left, gold top-right, deep emerald bottom)
- 1 linear-gradient base (pearl→mist→ivory)
- 2 drifting blobs `::before` y `::after` con `@keyframes drift 28s ease-in-out infinite`

### 4.6 Glass primitives (líneas 140-188)

- `.glass` — base con backdrop-filter + pinlight `::before`
- `.glass-lg` — radius 32px + larger shadow
- `.glass-pill` — radius 999
- `.glass-iridescent` — `::after` con conic gradient mask (rim)
- `.glass-emerald` — emerald gradient bg + white text

### 4.7 Buttons aqua (líneas 193-270)

- `.btn-aqua` — base white-translucent gel + pinlight `::before`
- `.btn-aqua-emerald` — emerald gradient
- `.btn-aqua-gold` — gold gradient
- `.btn-aqua-ghost` — fully transparent

### 4.8 Helpers

- `.chip` + `.chip-dot` — pill badges
- `.eyebrow` — mono 11px tracked 0.25em uppercase emerald-700
- `.display` — Cormorant peso 300
- `.italic` `.mono`
- `.gold-text` `.emerald-text` — gradient text fill
- `.container` — max 1360px padding 32px (20px en ≤680)
- `.fade-up` — keyframe animation 0.8s

---

## 5. Arquitectura técnica de la nueva web

### 5.1 Stack

| Capa | Tech | Por qué |
|---|---|---|
| **HTML** | Static `.html` files (1 por página) | SEO, URLs únicas, GitHub Pages compat, admin separado |
| **CSS** | 1 archivo system + 1 por página | Critical CSS inline + lazy load |
| **JS** | Vanilla ES2022 + ESM nativo | 0 KB framework, sin build step |
| **Templating** | Tagged template literals (`html\`...\``) + escape utility | Más rápido que React, equivalente expressivo |
| **Routing** | Cada página es archivo HTML real (no SPA) | SEO, sharing, admin compat |
| **Data** | Firestore via existing `firestore-service.js` | Admin sync intacto |
| **State** | localStorage (cart, wishlist) + sessionStorage (shipping form) | Sin lib externa |
| **Animations** | CSS transitions + transform/opacity únicamente | GPU compositor, no JS animation lib |
| **Performance** | Critical CSS inline + `<link rel="preload">` + Service Worker | Apple-grade LCP < 2s |
| **Image opt** | `<picture>` AVIF + WebP + fallback PNG, responsive `srcset` | Smaller payload |

### 5.2 Estructura de carpetas FINAL

```
.
├── index.html                  shell + critical CSS + boot.js
├── colecciones.html
├── pieza.html
├── nosotros.html
├── contacto.html
├── carrito.html
├── journal.html
├── entrada.html
├── gracias.html  privacidad.html  terminos.html
│
├── admin*.html                 ← INTACTO
├── admin.css                   ← INTACTO
│
├── css/
│   ├── liquid-glass.css        ← MIRROR EXACTO bundle (350 líneas)
│   ├── components.css          ← reglas por componente
│   └── pages.css               ← reglas por página
│
├── js/
│   ├── core/
│   │   ├── boot.js             entry — init, mount components
│   │   ├── data.js             wrapper de firestore-service para páginas públicas
│   │   ├── cart.js             cart store + localStorage
│   │   ├── wishlist.js         wishlist store + localStorage
│   │   ├── router.js           link interceptor + history transitions
│   │   ├── format.js           $ COP, dates, slugs
│   │   └── html.js             html`` tagged template + escape util
│   │
│   ├── components/
│   │   ├── header.js           header pill flotante
│   │   ├── footer.js           footer 4-col grid
│   │   ├── cart-drawer.js      lateral right drawer
│   │   ├── wishlist-drawer.js
│   │   ├── search-overlay.js   Cmd+K palette
│   │   ├── cookie-banner.js
│   │   ├── email-modal.js
│   │   ├── piece-card.js       SHARED renderer (6 surfaces)
│   │   ├── glass-image.js      lazy <picture> con LQIP placeholder
│   │   └── tilt-3d.js          parallax cursor (HOME hero only)
│   │
│   ├── home/
│   │   ├── hero.js             HomeHero + 3D tilt + 3 floating cards
│   │   ├── marquee.js          7 credenciales scroll 50s
│   │   ├── categories-dock.js  6 cards 3:4 con imagen + count live
│   │   ├── featured.js         grid db.getFeatured()
│   │   ├── editorial.js        split image+quote
│   │   ├── services.js         4 services hardcoded
│   │   ├── atelier.js          4 corner cards + joya central + SVG conectores
│   │   ├── journal-preview.js  masthead + ticker + cover + sidebar + trio
│   │   └── cta-cartagena.js
│   │
│   ├── pages/
│   │   ├── home.js             compose home/* sections
│   │   ├── catalogo.js         filter pills + sort + grid
│   │   ├── pieza.js            gallery + thumbs + info + specs + talla + CTAs + GIA
│   │   ├── nosotros.js         hero + chapters + valores + equipo + prensa + faqs
│   │   ├── contacto.js         form + sidebar
│   │   ├── carrito.js          3-step checkout + sticky summary
│   │   ├── journal.js          full archive grid
│   │   └── entrada.js          single entry detail
│   │
│   ├── firebase-config.js      ← INTACTO
│   ├── firestore-service.js    ← INTACTO
│   ├── auth.js                 ← INTACTO
│   ├── analytics.js            ← OPCIONAL mantener
│   └── admin/                  ← INTACTO
│
├── img/                        auditar y mantener solo lo activo
├── BERSAGLIO NOVO/             ← se mueve a `.handoff/` y se ignora del deploy
├── PLAN-NOVO.md                este archivo
├── CLAUDE.md                   actualizar al final con arquitectura nueva
└── manifest.json               regenerar con theme aqua
```

### 5.3 Pattern: tagged template HTML + lazy init

Ejemplo `js/components/piece-card.js`:

```javascript
import { html, escape } from '../core/html.js';
import { format$ } from '../core/format.js';

export function renderPieceCard(piece) {
  return html`
    <article class="glass glass-iridescent piece-card" data-slug="${escape(piece.slug)}">
      <a href="pieza.html?p=${escape(piece.slug)}" class="piece-media">
        ${piece.image ? html`<img src="${escape(piece.image)}" alt="${escape(piece.name)}" loading="lazy" decoding="async">` : ''}
      </a>
      <div class="piece-body">
        <span class="piece-eyebrow mono">${escape(piece.cat)}</span>
        <h3 class="piece-name">${escape(piece.name)}</h3>
        <span class="piece-meta">${escape(piece.specs?.stone || '')} · ${escape(piece.specs?.metal || '')}</span>
        <div class="piece-footer">
          <span class="piece-price mono">${format$(piece.price)}</span>
          <a href="pieza.html?p=${escape(piece.slug)}" class="piece-link">Ver pieza →</a>
        </div>
      </div>
    </article>`;
}
```

`js/core/html.js`:
```javascript
const ESC = { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' };
export const escape = s => String(s ?? '').replace(/[&<>"']/g, c => ESC[c]);
export const html = (strings, ...values) => strings.raw.reduce((r,s,i)=> r + s + (values[i] ?? ''), '');
```

### 5.4 Performance budgets (Apple-grade target)

| Métrica | Mobile target | Desktop target |
|---|---|---|
| LCP | < 2.0s | < 1.5s |
| FCP | < 1.0s | < 0.7s |
| CLS | < 0.05 | < 0.05 |
| TBT | < 200ms | < 100ms |
| INP | < 200ms | < 100ms |
| Critical CSS inline | < 6 KB | < 6 KB |
| Main CSS deferred | < 30 KB gzip | < 30 KB gzip |
| Core JS first load | < 15 KB gzip | < 15 KB gzip |
| Total JS first load (home) | < 40 KB gzip | < 40 KB gzip |
| Hero image AVIF | < 80 KB | < 120 KB |

### 5.5 Optimizaciones específicas

1. **Critical CSS inline** en `<head>` de cada `.html` (~6 KB):
   - Tokens `:root`
   - Reset + base body
   - `.bj-world` background
   - `.glass`, `.glass-pill`, `.btn-aqua` mínimos
   - `.container`
   - Header pill (above-the-fold)
2. **Resto de CSS deferred** con `<link rel="preload" as="style" onload="this.rel='stylesheet'">`
3. **Fonts:** preconnect + `<link rel="preload">` solo para Manrope 500 (UI principal). Resto async via `font-display: swap`.
4. **Hero image** con `<link rel="preload" as="image" fetchpriority="high">` + `<picture>` AVIF (60% size) + WebP fallback + responsive `srcset` (640w/1280w/1920w).
5. **Below-fold images:** `loading="lazy" decoding="async"`.
6. **JS lazy:** cada `js/pages/*.js` se carga con `import()` dinámico desde `boot.js` según `<body data-page="...">`.
7. **`content-visibility: auto`** en secciones below-the-fold (reduce paint cost en scroll inicial).
8. **`@view-transition`** (Chrome 111+) — transiciones nativas suaves entre páginas; fallback fade.
9. **Service Worker:** cache stale-while-revalidate para CSS/JS, network-first 5s timeout para HTML, cache-first 30 días para imágenes. NO cachear Firebase requests.
10. **`requestIdleCallback`** prefetch de la siguiente página probable.
11. **`<link rel="modulepreload">`** para módulos JS críticos (boot + components/header).
12. **Animation:** ÚNICAMENTE `transform` + `opacity` (compositor layer). `will-change` solo durante interacción.

---

## 6. Sync admin Firestore (NO TOCAR)

### 6.1 Schema actual (preservado)

```
pieces/{id}                    → admin-piezas.html
  code, slug, name, collection, featured, badge, description,
  priceLabel, price, specs.{stone,carat,metal,accent,cut,color,clarity,certificate,weight},
  images[], _version, createdBy, updatedBy, createdAt, updatedAt

collections/{id}               → admin-colecciones.html
  slug, name, subtitle, description, bannerUrl, featured,
  pieces (count, auto), _version

consultas/{id}                 → admin-consultas.html
  name, email, phone, motivo, message, createdAt

system/meta                    → automated
  lastDataUpdate, lastJournalUpdate

journal/{slug}                 → admin-journal.html (NUEVO admin opcional)
  title, excerpt, body (markdown), image, author, category,
  publishedAt, readMin

nosotros/main                  → admin-nosotros.html (NUEVO admin opcional)
  chapters[], valores[], equipo[], prensa[], faqs[]

system/marquee                 → admin-system.html (NUEVO opcional)
  items[]

system/services                → admin-system.html (NUEVO opcional)
  services[]

system/atelier                 → admin-system.html (NUEVO opcional)
  steps[]
```

### 6.2 Decisión sobre contenido estático

**FASE 1:** todo el copy de chapters/valores/equipo/prensa/faqs/journal/marquee/services/atelier va **hardcoded** en archivos JS (mismo contenido que el bundle). Sync admin inmediato solo para `pieces` + `collections` + `consultas` (lo que ya existía).

**FASE 2 (opcional, futuro):** crear nuevos archivos admin (`admin-nosotros.html`, `admin-journal.html`, `admin-system.html`) y migrar los arrays a Firestore. Las páginas ya estarán suscritas a `db.onChange()` para sync live.

### 6.3 Páginas con `db.onChange()` obligatorio

| Página | Listener | Re-renders |
|---|---|---|
| home (index.html) | `data.onChange()` | categories-dock + featured + journal-preview |
| colecciones | `data.onChange()` | filter pills + grid |
| pieza | `data.onChange()` | entire detail page |
| carrito | `cart.onChange + data.onChange` | items + summary |
| journal (fase 2) | `data.onChange()` | grid |
| entrada (fase 2) | `data.onChange()` | content |

---

## 7. Plan de ejecución (FASES)

### 🔵 FASE A — Foundation (1 día, riesgo CERO)

A.1 Tag git `pre-novo-backup` apuntando a `main` actual. Garantiza rollback instantáneo.
A.2 Crear branch `claude/recambio-total-novo` desde `main`.
A.3 Mover `BERSAGLIO NOVO/` a `.handoff/` (mantener pero ignorar del deploy via `.gitignore`).
A.4 Verificar que admin panel sigue funcionando 100%.
A.5 **Confirmación del usuario para proceder.**

**DoD A:** branch creada, backup tag pushed, admin verificado funcional.

---

### 🔴 FASE B — Demolición pública (1 día, riesgo MEDIO — point of no return)

B.1 Borrar 17 HTML públicos (lista en §1.1)
B.2 Borrar `css/style.css` y `css/liquid-glass.css`
B.3 Borrar 50+ JS públicos (mantener admin/, firestore-service.js, firebase-config.js, auth.js, analytics.js)
B.4 Borrar `snippets/`
B.5 Auditar `img/` — mantener solo imágenes referenciadas por admin
B.6 Commit "Phase B: demolish legacy public site"

**DoD B:** site público vacío (sin landing), admin 100% funcional, commit pusheado.

---

### 🟢 FASE C — Foundation nueva (1 día)

C.1 Copiar `BERSAGLIO NOVO/project/css/liquid-glass.css` a `css/liquid-glass.css` (mirror exacto, 350 líneas)
C.2 Crear `css/components.css` (vacío)
C.3 Crear `css/pages.css` (vacío)
C.4 Crear estructura `js/core/`, `js/components/`, `js/home/`, `js/pages/`
C.5 Crear `js/core/{boot,data,cart,wishlist,router,format,html}.js`
C.6 Crear shells HTML mínimos en cada página con:
   - Critical CSS inline
   - `<link rel="preload">` fonts
   - `<div class="bj-world" aria-hidden="true">`
   - `<div id="header-mount">` `<div id="footer-mount">`
   - `<main data-page="home|catalogo|...">` con placeholders
   - `<script type="module" src="js/core/boot.js">`
C.7 Smoke test: home carga con bg pearl + bj-world. No content yet. Verificar Lighthouse baseline.

**DoD C:** estructura nueva en su lugar, foundation lista, sin contenido.

---

### 🟢 FASE D — Shell components (1 día)

D.1 `js/components/header.js` — header pill flotante con 4 nav (Inicio/Colecciones/Nosotros/Contacto) + cart icon (que dispara cart-drawer)
D.2 `js/components/footer.js` — footer 4-col grid con marca/colecciones/casa/servicio + social icons + copyright
D.3 `js/components/cart-drawer.js` — slide-in right, items list, qty editor, remove, "Ir al checkout"
D.4 `js/components/wishlist-drawer.js`
D.5 `js/components/cookie-banner.js`
D.6 `js/components/email-modal.js`
D.7 `js/components/search-overlay.js` — Cmd+K palette
D.8 `css/components.css` — estilos asociados
D.9 Wire en boot.js: mount header + footer + register drawer triggers + cookie/email init
D.10 Smoke test: header se ve correcto, cart drawer se abre, search overlay con Cmd+K.

**DoD D:** shell global funciona en todas las páginas (aunque sin contenido aún).

---

### 🟢 FASE E — HOME completa (2 días — la fase más grande)

E.1 `js/home/hero.js` — implementa HomeHero (líneas 28-364 del bundle) con `tilt-3d.js` + 3 floating cards + main featured-piece reading from Firestore
E.2 `js/home/marquee.js` — 7 credenciales en pill verde-cristal (líneas 367-451)
E.3 `js/home/categories-dock.js` — 6 cards 3:4 con imagen + count live de Firestore (líneas 456-553)
E.4 `js/home/featured.js` — grid de `db.getFeatured()` (líneas 558-606)
E.5 `js/home/editorial.js` — split image+quote (líneas 609-650)
E.6 `js/home/services.js` — 4 servicios hardcoded (líneas 653-695)
E.7 `js/home/atelier.js` — 4 corners + joya central + SVG conectores (líneas 698-867)
E.8 `js/home/journal-preview.js` — masthead + ticker + cover + sidebar + trio (líneas 869-1045) — la más compleja
E.9 `js/home/cta-cartagena.js` — glass-iridescent CTA con halo gold (líneas 1050-1075)
E.10 `js/pages/home.js` — compone todas las secciones en orden + `data.onChange()` listener
E.11 Smoke test: home idéntica al bundle pixel-by-pixel (verificar contra render del bundle si es posible)

**DoD E:** home pasa Lighthouse Mobile ≥ 85, sync admin → categories dock + featured demuestra live update.

---

### 🟢 FASE F — Catálogo (1 día)

F.1 `js/pages/catalogo.js` — hero + filter pills (Todo + dynamic from `db.getCollections`) + sort dropdown + grid via `piece-card.js`
F.2 URL state `?col=<slug>` con `history.replaceState`
F.3 Smoke test

---

### 🟢 FASE G — Pieza (1 día)

G.1 `js/pages/pieza.js` — gallery 4/5 + thumbs grid + info card glass + 4-cell specs + price+IVA + talla selector (anillos/argollas) + 3-button CTA + asesor gold + GIA chip overlay + related pieces
G.2 SEO: og:title/description/image dinámico + ProductSchema JSON-LD
G.3 Smoke test

---

### 🟢 FASE H — Nosotros (1 día)

H.1 `js/pages/nosotros.js` — hero editorial + 5 chapters timeline + 6 valores numerados + 4 equipo cards + 4 prensa list + 6 FAQs accordion + CTA
H.2 Datos hardcoded en JS array (de §3.3)
H.3 Smoke test

---

### 🟢 FASE I — Contacto (1 día)

I.1 `js/pages/contacto.js` — form con motivo pills + sidebar 3 cards (Casa/Directo/<24h)
I.2 Submit a Firestore `consultas/`
I.3 Pre-fill con `?ref=<slug>` cuando viene de pieza
I.4 Smoke test

---

### 🟢 FASE J — Carrito (1 día)

J.1 `js/pages/carrito.js` — 3-step stepper + sticky glass-emerald summary + Wompi handler preservado
J.2 sessionStorage shipping persistence
J.3 Smoke test

---

### 🟢 FASE K — Journal + Entrada (1 día)

K.1 `js/pages/journal.js` — full archive grid + filter por categoría
K.2 `js/pages/entrada.js` — entry detail (hero image + body + author + related)
K.3 Datos hardcoded en JS o Firestore migration (decisión fase 2)
K.4 Smoke test

---

### 🟢 FASE L — Páginas legales (medio día)

L.1 `gracias.html` `privacidad.html` `terminos.html` — shells aqua + content estático

---

### 🟡 FASE M — Performance polish (1-2 días)

M.1 Critical CSS extraction (above-the-fold por página)
M.2 Image optimization (AVIF + WebP + responsive srcset)
M.3 Service Worker registration
M.4 Resource hints (preconnect, modulepreload)
M.5 `content-visibility: auto`
M.6 View Transitions API
M.7 Lighthouse audit + iterate hasta target

---

### 🟢 FASE N — QA + sync admin verification (1 día)

N.1 Test E2E: admin agrega/edita/borra pieza → verificar home featured + categories dock count + colecciones grid + pieza detail todos actualizan
N.2 Mobile responsive en 320/480/768/920/1280/1600
N.3 Cross-browser: Safari 16+, Chrome 110+, Firefox 110+, Edge 110+
N.4 A11y: keyboard nav, focus rings, ARIA, screen reader, prefers-reduced-motion
N.5 Validate HTML + CSS + JS

---

### 🟢 FASE O — Documentación final (1 día)

O.1 Reescribir `CLAUDE.md` con nueva arquitectura (archivar viejo en `CLAUDE-LEGACY.md`)
O.2 Documentar contratos por componente + reglas NO-TOCAR
O.3 Mover `.handoff/BERSAGLIO NOVO/` a `.gitignore` y borrar del repo (ya cumplió su función)
O.4 Final commit + merge a main
O.5 Tag `v2.0-novo-launch`

---

## 8. Mapeo en sesiones de Claude Code

Considerando timeouts y context limits:

| Sesión | Fases | Output esperado |
|---|---|---|
| 1 | A + B | Backup + branch + demolición + commit. Admin verificado. |
| 2 | C + D | Foundation + shell components. Header + drawers funcionan. |
| 3 | E (home) | Home idéntica al bundle. Sync admin live demonstrado. |
| 4 | F + G | Catálogo + Pieza. |
| 5 | H + I | Nosotros + Contacto. |
| 6 | J + K | Carrito + Journal. |
| 7 | L + M | Legales + Performance. Lighthouse ≥ 90. |
| 8 | N + O | QA + Docs final. Merge to main. |

**~8 sesiones** de trabajo efectivo.

---

## 9. Riesgos y mitigaciones

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Admin se rompe accidentalmente | media | Tag backup; smoke test admin cada commit |
| Sync Firestore se rompe | baja | `firestore-service.js` no se toca; auditar imports |
| Performance no llega a target | media | Lighthouse en cada fase; iterate antes de avanzar |
| Mobile rompe | media | Testing breakpoint por breakpoint en cada componente |
| User feedback cambia diseño durante implementación | alta | Plan vivo; ajustar fases si user reporta cambios |
| Firebase quotas explotan | baja | Listeners onChange con coalescing rAF |
| Cache stale después de deploy | media | SW con versión + `Cache-Control` correcto |
| URL routing rompe | baja | Páginas estáticas separadas → cada URL independiente |
| Imágenes pesadas del bundle (5-6 MB) en producción | alta | OBLIGATORIO comprimir a AVIF + responsive antes de servir |

---

## 10. Definition of Done (final del proyecto)

✅ Visualmente: mirror pixel-perfecto del bundle en cada página
✅ Performance: Lighthouse Mobile ≥ 90 en cada métrica core
✅ Sync admin: test E2E pasa para piezas, colecciones, consultas (+ journal/nosotros si fase 2)
✅ Mobile: 320/480/768/920/1280/1600 todos funcionales
✅ A11y: keyboard nav completo, focus rings, ARIA, screen reader, prefers-reduced-motion
✅ Cross-browser: Safari 16+, Chrome 110+, Firefox 110+, Edge 110+
✅ SEO: canonical, og, schema.org, sitemap.xml, robots.txt
✅ No dead code: cero referencias a archivos viejos, `style.css` y `liquid-glass.css` antiguos no existen
✅ CLAUDE.md actualizado con arquitectura nueva + contratos + NO-TOCAR

---

## 11. Próximos pasos inmediatos

1. **Usuario revisa este plan** y confirma o pide ajustes
2. **Si OK:** ejecutar Fase A (backup + branch nueva + mover bundle)
3. **Punto de no retorno:** Fase B (demolición). Una vez ejecutada, reverso = revert + force push
4. **Sesión 1 termina con Fase B commiteada** y admin verificado funcional

---

## 12. Apéndice — Snippets de referencia

### 12.1 Manifest Google Fonts (exacto del bundle)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Manrope:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

### 12.2 PRODUCTS array (datos placeholder iniciales — bundle líneas 312-317)

```javascript
const PRODUCTS_PLACEHOLDER = [
  { id:"halo-emerald", name:"Topos Halo Esmeralda", cat:"Aretes", price: 12400000, img:"assets/earrings-travertino.png", stones:"Esmeralda · Diamante", gold:"Oro 18K", tag:"Best Seller" },
  { id:"emerald-classic", name:"Topos Esmeralda Classic", cat:"Aretes", price: 9800000, img:"assets/earrings-emerald.png", stones:"Esmeralda colombiana", gold:"Oro amarillo 18K" },
  { id:"trinity-em", name:"Anillo Trinity Zafiro", cat:"Anillos", price: 14800000, img:"assets/ring-sapphire.jpg", stones:"Zafiro · Diamantes", gold:"Oro amarillo 18K", tag:"Edición limitada" },
  { id:"model-em", name:"Editorial Esmeralda", cat:"Editorial", price: 0, img:"assets/model-emerald.png", stones:"Esmeralda · Diamantes", gold:"Oro 18K", hideCart:true },
];
```

> En producción, estos datos vienen de Firestore `pieces/` collection. El placeholder solo aplica si Firestore está vacío y necesitamos seed.

### 12.3 BersaglioLogo SVG (bundle shell.jsx 8-17)

```html
<svg width="40" height="42" viewBox="0 0 80 84" fill="none" style="display:block">
  <circle cx="40" cy="42" r="28" stroke="#0f5132" stroke-width="1.2" opacity="0.85" fill="none"/>
  <line x1="40" y1="4" x2="40" y2="80" stroke="#0f5132" stroke-width="0.8" opacity="0.5"/>
  <text x="40" y="54" text-anchor="middle" font-family="Fraunces, serif" font-weight="600" font-size="32" fill="#0f5132">B</text>
</svg>
```

Uso en footer con tone gold: cambiar `#0f5132` por `#d4a94a`.

### 12.4 Critical CSS skeleton para `<head>`

```html
<style>
  /* Critical above-the-fold (~5 KB) */
  :root {
    --bj-emerald-700: oklch(42% 0.14 155);
    --bj-emerald-800: oklch(34% 0.11 155);
    --bj-pearl: oklch(98% 0.005 90);
    --bj-ink-emerald: oklch(18% 0.05 155);
    --bj-ink-soft: oklch(32% 0.03 155);
    --bj-gold-500: oklch(82% 0.14 85);
    --bj-gold-700: oklch(72% 0.14 82);
    --glass-tint: oklch(96% 0.02 150 / 0.55);
    --glass-blur: 28px;
    --font-brand: "Fraunces", serif;
    --font-display: "Cormorant Garamond", serif;
    --font-ui: "Manrope", -apple-system, sans-serif;
    --r-pill: 999px;
  }
  *,*::before,*::after { box-sizing: border-box; }
  html, body { margin:0; padding:0; }
  body {
    font-family: var(--font-ui);
    color: var(--bj-ink-emerald);
    background: var(--bj-pearl);
    -webkit-font-smoothing: antialiased;
    line-height: 1.55;
    overflow-x: hidden;
  }
  .bj-world {
    position: fixed; inset: 0; z-index: -1;
    background:
      radial-gradient(1200px 900px at 15% 10%, oklch(92% 0.07 150 / 0.65), transparent 60%),
      radial-gradient(1000px 800px at 90% 20%, oklch(95% 0.06 90 / 0.55), transparent 55%),
      radial-gradient(1400px 1000px at 50% 110%, oklch(88% 0.10 155 / 0.55), transparent 55%),
      linear-gradient(180deg, oklch(97% 0.01 150) 0%, oklch(94% 0.02 150) 50%, oklch(96% 0.015 90) 100%);
    overflow: hidden;
  }
  .container { width: 100%; max-width: 1360px; margin: 0 auto; padding: 0 32px; }
  @media (max-width: 680px) { .container { padding: 0 20px; } }
  /* Header pill skeleton (above-the-fold)... */
</style>
<link rel="preload" href="css/liquid-glass.css" as="style" onload="this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="css/liquid-glass.css"></noscript>
```

---

## 13. Status

⏸ **Esperando aprobación del usuario antes de Fase A.**

Una vez confirmado, el plan se ejecuta en orden A → O sin saltos. Cualquier desvío de scope debe documentarse aquí y aprobarse por separado.

**Source of truth final:** `BERSAGLIO NOVO/project/` + este documento.

---

## 14. CLARIFICACIONES FINALES DEL USUARIO (decisiones tomadas)

Después de la primera revisión del plan, el usuario respondió:

### 14.1 Demolición total — CONFIRMADO
Sin medias tintas. Todo el sitio público antiguo se elimina. Admin queda intacto.

### 14.2 Arquitectura: SPA principal + 4 SEO shells (cambio crítico)

> _"Necesito que implementes ingeniería arquitectónica, no quiero páginas estáticas — solo las que sean necesarias para SEO. El resto, web 100% dinámica."_

**Implementación:**

| Tipo | Archivos | Por qué |
|---|---|---|
| **SEO shells** (5 archivos `.html`) | `index.html`, `colecciones.html`, `nosotros.html`, `contacto.html`, `journal.html` | Crawlers de Google, og:image preview en redes sociales, URLs compartibles |
| **SPA dinámico** (todo lo demás) | Pieza detail, Entrada blog, Carrito, Checkout, Wishlist, Search results | Render via JS leyendo Firestore, hash routing `#/<route>/<param>` |
| **Páginas legales estáticas** | `gracias.html`, `terminos.html`, `privacidad.html` | Contenido legal raramente cambia |

**Routing:**
- URL canónica para piezas: `/pieza.html?p=<slug>` — Google lo indexa, og:tags inyectados al cargar
- Navegación interna: usa `view-transitions` API + JS push-state para sentirse como SPA sin recarga
- Header/footer/drawers son persistentes — solo el `<main>` cambia entre rutas
- `js/core/router.js` intercepta clicks en `<a>` internos, hace fetch del HTML target, intercambia el `<main>` con view-transition, mantiene el shell

**Tipos de routing:**
1. **Pages SEO** (`/colecciones`, `/nosotros`): full HTML shell + JS hidrata. El crawler ve todo.
2. **Dynamic params** (`/pieza?p=trinity`): shell mínimo + JS lee Firestore + actualiza `<title>` + `<meta>` + content. Google JS-aware lo indexa.
3. **Pure dynamic** (carrito, búsqueda, wishlist drawer): solo en JS, no necesitan SEO.

### 14.3 Vanilla ESM = JavaScript modular nativo (aclaración técnica)

> _"NO entiendo esto de Vainilla ESM"_

**Significa:** JavaScript nativo del navegador con módulos ES (`import`/`export`). NO React. NO Webpack. NO build step.

**Ventajas vs React + Babel del bundle:**
- 0 KB de framework (React = 50 KB gzip)
- Sin paso de compilación → deploy directo a GitHub Pages
- Más rápido en first paint (no hay que parsear React + transpile JSX en el navegador)
- Mismo resultado visual exacto que el bundle

**Cómo replicamos React sin React:** usamos **tagged template literals** (`html\`<div>...</div>\``) que generan strings + `<container>.innerHTML = html\`...\``. Equivalente expresivo, ~5 KB de utilidades en lugar de 50 KB.

### 14.4 Migración de contenido a Firestore = mirror del bundle

> _"Solo migramos si así lo podemos implementar en Bersaglio NOVO pero siempre que sea un mirror del proyecto"_

**Decisión:** el bundle tiene todo hardcoded (es un prototipo). Replicamos:

- **Fase 1:** copy literal del bundle hardcoded en módulos JS (`js/data/copy.js`). Mismo contenido, mismo orden, misma estructura.
- **Fase 2 (opcional):** crear `admin-nosotros.html`, `admin-journal.html`, `admin-marquee.html` que escriben a Firestore. Las páginas públicas ya están suscritas a `data.onChange()`, así que admin → público live.

Lo que YA es dinámico (no requiere migración):
- `pieces` (catálogo) — admin existente
- `collections` (categorías) — admin existente
- `consultas` (formulario contacto) — admin existente

### 14.5 Imágenes Apple-style — implementación

> _"Lo ideal es que como haremos como lo hace apple importante es mirar como lo hace si son pesadas reducir su tamaño y formato sin perder calidad o decide tu"_

**Apple-style image pipeline (lo que hace apple.com):**

1. **AVIF first, WebP fallback, JPG/PNG último recurso** vía `<picture>`:
   ```html
   <picture>
     <source type="image/avif" srcset="img/hero-640.avif 640w, img/hero-1280.avif 1280w, img/hero-1920.avif 1920w" sizes="100vw">
     <source type="image/webp" srcset="img/hero-640.webp 640w, ..." sizes="100vw">
     <img src="img/hero-1280.jpg" alt="..." loading="eager" fetchpriority="high" decoding="async" width="1920" height="1080">
   </picture>
   ```
2. **Tamaños responsive:** generar 3 resoluciones por imagen (640w mobile, 1280w tablet, 1920w desktop). Browser elige según viewport.
3. **AVIF compresión:** quality 60 mantiene calidad visual con ~30% del tamaño JPG. Las imágenes del bundle (5-6 MB cada una) bajan a ~150-300 KB.
4. **Hero image:** `<link rel="preload" as="image" fetchpriority="high">` en `<head>` para cargar antes del CSS.
5. **Below-fold:** `loading="lazy" decoding="async"`.
6. **LQIP (Low Quality Image Placeholder):** versión 24×24 px en base64 inline como background-color del `<picture>` mientras carga el real. Apple usa esto en su tienda. Da percepción instantánea.
7. **Connection-aware (opcional avanzado):** `if (navigator.connection.effectiveType === '2g')` → cargar solo la versión 640w.
8. **Image CDN no aplica** (GitHub Pages no soporta) → pre-procesamos las imágenes en build manual: usar `sharp` o `cwebp/avifenc` localmente y commit las versiones procesadas.

**Implementación práctica:**
- Las imágenes finales las sube admin a Firebase Storage en su versión raw (PNG/JPG)
- Cuando admin guarda una pieza, un Cloud Function (futuro) genera AVIF + WebP + 3 resoluciones automáticamente y guarda las URLs en el doc Firestore
- Por ahora (manual): proveer al cliente unas instrucciones de cómo procesar imágenes antes de subirlas, OR procesarlas en cliente (browser) usando Canvas API antes de subir a Storage

**Para las imágenes del bundle (placeholder), las procesaremos manualmente** durante Fase L (performance polish).

### 14.6 Estructura final de carpetas (post-clarificaciones)

```
.
├── index.html                      ← SPA principal con view-transitions
├── colecciones.html                ← SEO shell (catálogo)
├── nosotros.html                   ← SEO shell (historia)
├── contacto.html                   ← SEO shell (form + canales)
├── journal.html                    ← SEO shell (archivo blog)
├── gracias.html                    ← legal estática
├── privacidad.html                 ← legal estática
├── terminos.html                   ← legal estática
│
├── admin*.html                     ← INTACTO (5 admin pages)
├── admin.css                       ← INTACTO
│
├── css/
│   ├── liquid-glass.css            mirror exacto bundle (350 líneas)
│   ├── components.css              header/footer/drawers/cards
│   └── pages.css                   estilos por página
│
├── js/
│   ├── core/                       boot, router, data, cart, wishlist, format, html
│   ├── components/                 header, footer, drawers, search, banner, modal, piece-card, glass-image, tilt-3d
│   ├── home/                       9 secciones del home
│   ├── pages/                      home, catalogo, pieza, nosotros, contacto, carrito, journal, entrada
│   ├── data/
│   │   └── copy.js                 contenido literal del bundle (chapters, valores, equipo, prensa, faqs, journal entries, marquee, services)
│   ├── firebase-config.js          ← INTACTO
│   ├── firestore-service.js        ← INTACTO
│   ├── auth.js                     ← INTACTO
│   ├── analytics.js                ← INTACTO
│   └── admin/                      ← INTACTO
│
├── img/                            optimizado AVIF + WebP responsive
├── sw.js                           Service Worker
├── manifest.json                   PWA manifest aqua theme
└── .handoff/
    └── BERSAGLIO NOVO/             bundle de referencia (en .gitignore para deploy, conservado en repo)
```

### 14.7 Definition of Done — actualizado

✅ Mirror visual pixel-perfecto del bundle
✅ **Web 100% dinámica con SPA-feel + 5 SEO shells** (no 11 páginas estáticas)
✅ Routing client-side con view-transitions API + push-state
✅ Lighthouse Mobile ≥ 90 cada métrica
✅ Sync admin → público live verificado
✅ Mobile responsive 320/480/768/920/1280/1600
✅ A11y completo
✅ Cross-browser Safari/Chrome/Firefox/Edge
✅ SEO: og:tags dinámicos por pieza, schema.org JSON-LD, canonical, sitemap, robots
✅ Imágenes AVIF + WebP responsive con LQIP

---

## 15. Status post-aprobación

✅ **Plan aprobado por usuario.**
🚀 **Iniciando Fase A inmediatamente.**

Branch: `claude/recambio-total-novo` (a crear desde main)
Backup tag: `pre-novo-backup`

---

## 16. ESTADO DE EJECUCIÓN — actualizado 2026-05-08

### Branch + PR
- **Rama de rebuild:** `claude/recambio-total-novo`
- **Backup:** `backup/pre-novo` (snapshot de main antes de demoler)
- **PR a main:** [#160](https://github.com/bersagliojewelry/bersagliojewelry.github.io/pull/160)

### Tabla de phases

| Phase | Estado | Commit | Descripción breve |
|---|---|---|---|
| A — Setup | ✅ DONE | `3d25389` | Backup branch + relocate handoff bundle a `.handoff/` |
| B — Demolición | ✅ DONE | `b79c561` | -25,998 líneas: 11 páginas públicas + 50 JS + 7 CSS + snippets/ |
| C — Foundation | ✅ DONE | `c6f001c` | 5 SEO shells + js/core/* (7 archivos) + 7+8 stubs + liquid-glass.css mirror |
| D — Shell components | ✅ DONE | `f89c179` | header pill + footer + 5 drawers/modals + components.css ~750L |
| E — HOME 9 secciones | ✅ DONE | `be71d43` | hero parallax 3D + marquee + cats + featured Firestore + editorial + services + atelier + journal NYT + CTA |
| build-fix | ✅ DONE | `88eef95` | assets→public/, restored admin deps, SW v3, vite tolerant |
| F — Catálogo | ✅ DONE | `d45f15f` | filtros + sort + grid dinámico + URL state |
| G — Pieza detail | ✅ DONE | `33b7553` | gallery sticky + thumbs + info card + specs + talla + 3 CTAs + related + 404 + skeleton |
| **H — Nosotros** | ⏳ NEXT | — | hero + 5 chapters + manifiesto + valores + atelier + equipo + prensa + FAQ |
| I — Contacto | ⏳ TODO | — | form glass + 5 motivo pills + sidebar 3 cards + map |
| J — Carrito stepper | ⏳ TODO | — | 3-step: cards+summary → shipping form → payment radios (Wompi/Transfer/WhatsApp) |
| K — Journal + Entrada | ⏳ TODO | — | grid editorial + drop-cap + masthead + ticker live |
| L — Legal + perf polish | ⏳ TODO | — | gracias/terminos/privacidad + AVIF/WebP responsive + SW stale-while-revalidate |
| M — QA admin sync | ⏳ TODO | — | Test admin → home/catálogo/pieza/related/search live updates |
| N — Documentación + cleanup | ⏳ TODO | — | actualizar PLAN-NOVO + cleanup `.handoff/` |

### Métricas

- **CSS total nuevo:** ~3,200 líneas (liquid-glass + components + home + catalogo + pieza)
- **JS total nuevo:** ~2,300 líneas (core 7 archivos + 7 components + 3 page modules implementados)
- **Vite build:** 5.22s, 51 modules, 13 entry points HTML
- **Bundle size:** firebase-config 119kB gzip (límite Firebase, ineludible) + home page 7kB gzip + pieza 3.6kB gzip + chunks pequeños
- **Files committed:** 73 cambios netos en la rama (vs main)

### Decisiones arquitectónicas confirmadas

1. **5 SEO shells** + SPA dinámico: index.html, colecciones.html, nosotros.html, contacto.html, journal.html
2. **3 dynamic SPA shells** (necesarios para que boot.js detecte data-page): pieza.html ✓, carrito.html ⏳, entrada.html ⏳
3. **Admin intocado:** todos los admin-*.html, css/admin.css, js/admin/*, js/firebase-config.js, js/firestore-service.js, js/storage-service.js, js/image-optimizer.js, js/auth.js, js/analytics.js
4. **Bundle como referencia única:** `.handoff/BERSAGLIO NOVO/` (URL Claude Design expira, este folder es source of truth)
5. **Vanilla ESM** + tagged templates `html\`` — sin React, sin build framework adicional (solo Vite para bundling)
6. **Firestore real-time** vía `js/core/data.js` wrapping `js/firestore-service.js`
7. **localStorage** para cart/wishlist/cookie/email — todos con cross-tab sync via storage event

### Reglas críticas (NO TOCAR)

Ver `CLAUDE.md` reglas 37-50. Resumen:
- Vite `publicDir: 'public'` — assets estáticos van a `/public/`, NO a `/img/` raíz.
- `sw.js` cache version `bersaglio-v3` — bump al cambiar shell assets.
- `html\`` template requiere `escape(value)` para datos externos.
- Page modules se cargan vía dynamic `import()` en `js/core/boot.js`.
- CSS se bundlea con Vite — `sw.js SHELL_ASSETS` solo lista archivos del `public/` (no hashed CSS).
- Critical CSS inline en cada shell es REQUERIDO (FOUC sin él).
- Talla selector solo en `collection ∈ {anillos, argollas}`.
