# Bersaglio Jewelry - Instrucciones para Claude

## Sobre el proyecto
Sitio web de e-commerce de alta joyeria colombiana (esmeraldas, diamantes, oro 18k).
URL: https://bersagliojewelry.co/
Stack: HTML, CSS, JavaScript vanilla, Firebase (Firestore + Auth + Storage).

## Estructura del sitio
- `index.html` — Pagina principal / landing
- `colecciones.html` — Todas las colecciones
- `anillos.html`, `argollas.html`, `topos-aretes.html`, `dijes-colgantes.html` — Categorias
- `pieza.html` — Detalle de pieza individual
- `carrito.html`, `lista-deseos.html` — Carrito y wishlist
- `contacto.html`, `nosotros.html`, `servicios.html` — Paginas informativas
- `journal.html`, `entrada.html` — Blog
- `admin*.html` — Panel de administracion
- `css/` — Estilos
- `js/` — Scripts
- `img/` — Imagenes

## Diseno con Stitch
Siempre que te pida disenar algo, usa las herramientas de Stitch MCP para generar el diseno primero:
1. Usa `generate_screen_from_text` para crear disenos nuevos desde descripciones de texto.
2. Usa `edit_screens` para modificar disenos existentes.
3. Usa `generate_variants` para crear variantes de un diseno.
4. Usa `list_projects` y `list_screens` para ver los disenos existentes.
5. Despues de generar el diseno en Stitch, implementa el resultado en el codigo HTML/CSS/JS del proyecto.

## Paleta de colores
- Esmeralda oscuro: #0a1a0f, #0d2818, #1a4d2e
- Dorado: #c8a96e, #d4af37, #b8860b
- Fondo oscuro: #050a07
- Texto claro: #f5f0e8, #e8dcc8

## Estilo de diseno
- Lujo, elegancia, minimalismo
- Tipografia serif para titulos, sans-serif para cuerpo
- Animaciones sutiles (GSAP)
- Responsive / mobile-first
- Idioma: Espanol (Colombia)

---

## PROTOCOLO DE DOCUMENTACION
**REGLA:** Cada edicion, modificacion, correccion de errores o cualquier ejecucion que se realice debe documentarse en este archivo. Esto incluye:
- Que se cambio y por que
- Que archivos fueron tocados
- Que NO se debe tocar al limpiar codigo legacy

---

## ARQUITECTURA CSS ACTUAL — style.css

### Sistema de versionamiento
El archivo `css/style.css` tiene ~13,750 lineas con multiples capas de overrides acumuladas. El diseno ACTIVO y FINAL es **V7**. Las capas anteriores (V1-V6) son legacy y candidatas a limpieza.

### Mapa de secciones en style.css

#### ZONA LEGACY (candidatas a limpieza)
Estas secciones contienen estilos que fueron sobrescritos por V7. Al limpiar, **verificar una por una** que V7 las reemplaza antes de eliminar.

| Lineas aprox. | Seccion | Estado |
|---|---|---|
| 1-82 | Design tokens `:root` | **MANTENER** — Los tokens se usan globalmente |
| 83-97 | Reset | **MANTENER** — Reset base necesario |
| 99-182 | Emerald Marble Background | **MANTENER** — Fondo fijo de toda la pagina |
| 183-324 | Scroll Animations | **MANTENER** — GSAP base |
| 325-692 | Header, Nav, Dropdowns | **MANTENER** — Navegacion global |
| 693-732 | Buttons base | **MANTENER** — Estilos base de botones usados en todo el sitio |
| 732-774 | Brand Statement (original) | LEGACY — Sobrescrito por Brand Statement V7 (linea ~11351) |
| 776-813 | Sections general | LEGACY parcial — V7 sobrescribe padding/spacing |
| 815-900 | Collections (original) | LEGACY — Sobrescrito por Collections V7 (linea ~12136) |
| 920-993 | Featured (original) | LEGACY — Sobrescrito por Featured V7 (linea ~11805) |
| 1275-1315 | CTA Banner (base) | LEGACY — Sobrescrito por CTA V7 (linea ~13524) |
| 1400-1552 | Footer | **MANTENER** — Footer global no modificado por V7 |
| 1553-1680 | Responsive general | LEGACY parcial — V7 tiene sus propios breakpoints |
| 1681-2229 | Wishlist, Toast, Page hero | **MANTENER** — Paginas independientes no tocadas |
| 2230-2293 | Cart page | **MANTENER** — Pagina independiente |
| 2294-2324 | About teaser (original) | LEGACY — Sobrescrito por About V7 (linea ~13240) |
| 2326-2551 | Nosotros, Servicios, Colecciones pages | **MANTENER** — Paginas independientes |
| 2552-2950 | Catalog filters, Pieza detail, Reviews | **MANTENER** — Paginas independientes |
| 2951-3168 | Cart responsive, Confirmation | **MANTENER** — Paginas independientes |
| 3169-3222 | Breadcrumb, Section footer, Stats | **MANTENER** — Componentes reutilizados |
| 3224-3863 | Journal (base + page + article) | **MANTENER** — Paginas de journal |
| 3864-3895 | Stagger animations | **MANTENER** — Animaciones globales |
| 3896-4066 | Hero V2, Section Typography V2, Buttons V2 | LEGACY — Sobrescrito por Hero V7 (linea ~10482) |
| 4067-4280 | Collections V2 | LEGACY — Sobrescrito por Collections V7 |
| 4281-4437 | Featured V2 | LEGACY — Sobrescrito por Featured V7 |
| 4438-4540 | Services V2 | LEGACY — Sobrescrito por Services V7 |
| 4541-4558 | CTA Banner V2, About V2 | LEGACY — Sobrescrito por V7 |
| 4559-4593 | Cart badge V2 | **MANTENER** — Funcionalidad de carrito |
| 4594-4616 | Noise, Scrollbar, Selection | LEGACY parcial — Selection sobrescrito por V7 final polish |
| 4617-4730 | Journal V2, Hero Meta, Featured dark, Collections header, Mobile V2 | LEGACY — V7 sobrescribe |
| 4732-4808 | Extended design tokens, Film grain | **MANTENER** — Tokens y textura global |
| 4809-4931 | Preloader V3 | **MANTENER** — Preloader global |
| 4932-5342 | Phase 1 enhancements (hero, brand, page heroes, about stats, CTA, dividers, services, collections, footer, scroll indicator) | LEGACY — Sobrescrito por V7 en index |
| 5344-5587 | Phase 3 (canvas particulas, hero layout, scroll, Lenis) | LEGACY parcial — Verificar que V7 cubre |
| 5589-5764 | Phase 4 (3D tilt, collections scroll, GSAP, services connector, dividers, cards, journal cards, mobile collections, page hero parallax) | LEGACY parcial — Algunos efectos globales podrian necesitarse |
| 5765-5798 | Reduced motion | **MANTENER** — Accesibilidad global |
| 5799-6379 | Phase 5 (search overlay, floating-label forms, related pieces, pieza sticky layout, search responsive) | **MANTENER** — Funcionalidades de paginas internas |
| 6380-6527 | Phase 6 (PWA banners, CLS fixes) | **MANTENER** — Performance y PWA |
| 6528-6543 | Logo subtitulo | **MANTENER** — Componente header |
| 6544-6566 | Whitespace reduction | LEGACY — V7 maneja spacing |
| 6567-6730 | Banner Image Section | **MANTENER** — Secciones de imagen |
| 6731-6830 | Journal V3, About V3, CTA V3, Collections fix, Featured fix | LEGACY — Sobrescrito por V7 |
| 6831-7150 | Responsive V3 | LEGACY — V7 tiene responsive propio |
| 7151-7248 | Hero decorativos, Piece card hover, CTA subtitulo, Focus visible, Skip to content | LEGACY parcial — focus-visible y skip-to-content **MANTENER** |
| 7249-7596 | Piece card acciones, trust strip responsive, piece-action-btn | LEGACY parcial — Verificar |
| 7597-7678 | Nav spacing, Hero title clip fix, Hero alignment, Watermark, Logo badge | LEGACY — V7 maneja hero |
| 7679-7841 | Cookie consent, Email capture modal | **MANTENER** — Componentes globales |
| 7842-7863 | Collection panel hover | LEGACY — V7 tiene hover propio |
| 7864-7968 | Print stylesheet | **MANTENER** — Impresion |
| 7969-8623 | Lookbook/PageFlip estilos completos | **MANTENER** — Lookbook V7 refina pero no reemplaza la base de PageFlip |
| 8624-9215 | Seamless flow (kill dividers, hero, trust strip, lookbook, featured, brand, collections, services, journal, about) | LEGACY — V7 reemplaza este flujo visual |
| 9216-9473 | CTA dark, Preloader z-index, Various fixes | LEGACY parcial — Verificar preloader |
| 9474-9619 | V4 Emerald marble (hid hero photo, centered content) | LEGACY — V7 sobrescribe completamente |
| 9620-9850 | V5 (restaurar foto hero, editorial left-align) | LEGACY — V7 sobrescribe |
| 9851-10098 | V6 (collections editorial borders) | LEGACY — V7 sobrescribe |
| 10099-10481 | Services Showcase + Unified Background (pre-V7) | LEGACY — Services V7 refina esto |

#### ZONA V7 ACTIVA — NO TOCAR
Estas secciones son el diseno FINAL y ACTIVO. **NUNCA eliminar ni modificar sin autorizacion explicita.**

| Lineas aprox. | Seccion | Clase CSS |
|---|---|---|
| 10482-10819 | Hero V7 — Editorial cinematico premium | `.hero.hero-v7` |
| 10820-11024 | Hero V7 — Responsive (6 breakpoints) | `.hero.hero-v7` |
| 11025-11137 | Trust Strip V7 — Barra de confianza | `.trust-strip.trust-strip-v7` |
| 11138-11228 | Trust Strip V7 — Responsive | `.trust-strip.trust-strip-v7` |
| 11229-11350 | Section Headers V7 — Tipografia editorial | `.section-eyebrow`, `.section-title`, `.section-subtitle` con padres V7 |
| 11351-11511 | Brand Statement V7 — Cita editorial | `.brand-statement.brand-statement-v7` |
| 11512-11724 | Lookbook V7 — Portafolio digital | `.lookbook-section.lookbook-v7` |
| 11725-11804 | Lookbook V7 — Responsive | `.lookbook-section.lookbook-v7` |
| 11805-12040 | Featured Pieces V7 — Grid editorial | `.featured.featured-v7` |
| 12041-12135 | Featured V7 — Responsive | `.featured.featured-v7` |
| 12136-12392 | Collections V7 — Categorias editoriales | `.collections.collections-v7` |
| 12393-12483 | Collections V7 — Responsive | `.collections.collections-v7` |
| 12484-12813 | Services V7 — Showcase editorial | `.services.services-v7` |
| 12814-12936 | Services V7 — Responsive | `.services.services-v7` |
| 12937-13159 | Journal V7 — Preview editorial | `.journal-preview.journal-v7` |
| 13160-13239 | Journal V7 — Responsive | `.journal-preview.journal-v7` |
| 13240-13434 | About Teaser V7 — Nuestra historia | `.about-teaser.about-v7` |
| 13435-13518 | About V7 — Responsive + Accesibilidad | `.about-teaser.about-v7` |
| 13519-13720 | CTA Banner V7 — Llamada a accion | `.cta-banner.cta-v7` |
| 13721-13750+ | Section Transitions + Final Polish | Transiciones entre secciones V7, `::selection`, smooth scroll |

### Patron de especificidad V7
Todas las reglas V7 usan **doble clase** (`.section-base.section-v7`) + `!important` para sobrescribir las capas legacy sin necesidad de eliminarlas. Esto permite limpieza progresiva sin romper nada.

---

## ARQUITECTURA HTML — index.html

### Clases V7 activas en cada seccion
Cada seccion del index tiene su clase V7 que activa los estilos premium:

| Seccion HTML | Clase V7 | Elementos V7 agregados |
|---|---|---|
| `#inicio` (Hero) | `.hero-v7` | `.hero-accent-line`, `.hero-meta-inner` con SVGs, scroll indicator con `writing-mode: vertical-rl` |
| Trust Strip | `.trust-strip-v7` | Separadores `<span>` vacios en vez de texto `·` |
| `#portafolio` (Lookbook) | `.lookbook-v7` | Sin cambios HTML adicionales |
| `#piezas` (Featured) | `.featured-v7` | Sin cambios HTML adicionales |
| Brand Statement | `.brand-statement-v7` | `<blockquote>` en vez de `<p>`, `.brand-lines` con gem SVG |
| `#colecciones` | `.collections-v7` | Sin cambios HTML adicionales |
| `#servicios` | `.services-v7` | Sin cambios HTML adicionales |
| Journal Preview | `.journal-v7` | Sin cambios HTML adicionales |
| About Teaser | `.about-v7` | Se removio `style="..."` inline del div de stats |
| CTA Banner | `.cta-v7` | `.cta-accent-line` (x2), `.cta-v7-btn`, removido inline style del eyebrow |

---

## PRINCIPIOS DE DISENO V7

### Estetica
- **0px border-radius** en todo (estetica editorial/lujo sharp)
- **Glassmorphism** con `backdrop-filter: blur()` + `@supports` fallback
- **Ghost borders** — Bordes invisibles que aparecen en hover (`rgba(gold, 0.15)` → `rgba(gold, 0.35)`)
- **Tipografia fluida** con `clamp()` en todos los tamanos
- **Transiciones cinematicas** con `cubic-bezier(0.25, 0.46, 0.45, 0.94)`

### Responsividad
- 6 breakpoints: base (mobile-first), 480px, 768px, 1024px, 1280px, 1600px
- `dvh` con fallback a `vh` para viewport heights
- `env(safe-area-inset-*)` para dispositivos con notch
- `hover: none` media query para dispositivos tactiles

### Accesibilidad
- `prefers-reduced-motion: reduce` en cada seccion V7
- `focus-visible` con anillo dorado (estilos globales existentes)
- Skip-to-content link (estilos globales existentes)

### Tipografia
- **Display/Titulos:** Cormorant Garamond, serif (weight 300-400)
- **Body/UI:** Montserrat, sans-serif (weight 300-500)
- **Eyebrows:** Montserrat uppercase, letter-spacing 2-4px, font-size 10-12px

---

## REGLAS PARA LIMPIEZA DE CODIGO

### ANTES de eliminar cualquier bloque CSS legacy:
1. **Verificar** que la seccion V7 correspondiente cubre todos los estilos
2. **Buscar** si algun selector legacy es usado por paginas DISTINTAS a index.html (colecciones.html, pieza.html, etc.)
3. **Probar** en movil Y desktop despues de cada eliminacion
4. **NO eliminar** en lote — ir seccion por seccion

### Secciones SEGURAS para eliminar (solo afectan index.html y V7 las reemplaza):
- Hero V2 (linea ~3896)
- Collections V2 (linea ~4067)
- Featured V2 (linea ~4281)
- Services V2 (linea ~4438)
- CTA V2 (linea ~4541)
- About V2 (linea ~4535)
- Journal V2 (linea ~4617)
- Whitespace reduction (linea ~6544)
- Journal V3, About V3, CTA V3 (linea ~6731)
- Responsive V3 entero (linea ~6831) — **solo si** se verifica que paginas internas no dependen de el
- Seamless flow (linea ~8624)
- V4 Emerald marble (linea ~9474)
- V5 restauracion (linea ~9620)
- V6 editorial borders (linea ~9851)

### Secciones que REQUIEREN verificacion antes de eliminar:
- Phase 1-6 enhancements — Algunos aplican a paginas internas (page heroes, pieza detail, search, forms)
- Responsive general original — Paginas internas podrian depender
- Stagger animations, GSAP states — Usados globalmente
- Collection panel hover, Piece card hover — Usados en paginas de coleccion

### NUNCA eliminar:
- Design tokens `:root` (linea 7)
- Reset (linea 83)
- Emerald Marble Background (linea 99)
- Header/Nav/Dropdowns (linea 325)
- Buttons base (linea 693)
- Footer (linea 1400)
- Wishlist/Cart/Pages independientes
- Search overlay + Forms (Phase 5)
- PWA banners (Phase 6)
- Cookie consent + Email capture modal
- Print stylesheet
- Lookbook/PageFlip base styles
- Preloader V3
- **TODA la zona V7 (linea 10482 en adelante)**

---

## HISTORIAL DE CAMBIOS

### 2026-04-04 — Rediseno completo index.html V7 (10 fases)
**Archivos modificados:** `index.html`, `css/style.css`
**Descripcion:** Rediseno premium de toda la pagina principal con estetica editorial nivel Cartier/Bulgari.

**Fases ejecutadas:**
1. **Hero Section** — Layout cinematico con accent line, meta strip con SVGs, scroll indicator vertical
2. **Trust Strip** — Barra flotante con glassmorphism, separadores visuales, tracking amplio
3. **Section Headers + Brand Statement** — Sistema tipografico unificado, blockquote editorial con brand-lines y gem SVG
4. **Lookbook/Portfolio** — Wrapper con glassmorphism, bordes fantasma, hint text estilizado
5. **Featured Pieces** — Header editorial con linea dorada, grid con ghost borders, empty state con gem SVG
6. **Collections** — Panels editoriales con imagen, overlay gradiente, ghost border hover, responsive grid 1-4 columnas
7. **Services** — Refinamiento del showcase existente con glassmorphism, ghost borders, hover cinematico
8. **Journal Preview** — Cards editoriales con imagen, overlay, ghost borders, responsive grid
9. **About Teaser** — Collage con frame decorativo, stats con underline dorado, contenido tipografico refinado
10. **CTA Banner + Final Polish** — Glassmorphism panel, accent lines, boton editorial con fill animation, section transitions, smooth scroll, branded selection color

### 2026-04-04 — Correcciones post-rediseno (hero ticker, fondos, animaciones)
**Archivos modificados:** `index.html`, `css/style.css`, `js/effects.js`

**Cambios realizados:**
1. **Hero meta → Ticker marquee** — Se reemplazo la barra estatica de 3 badges (Certificado, Oro 18K, Envio Asegurado) por un ticker animado horizontal con "Certificado La Verde / Jewelers of America" y "Visitanos en Cartagena, Colombia". El contenido se duplica en el HTML para crear loop infinito via CSS `@keyframes ticker-scroll`. Clase `.hero-ticker` reemplaza `.hero-meta`. Se oculto `.hero-meta` legacy con `display: none`.
2. **Fondos consistentes** — Journal V7 cambiado de `rgba(5,10,7,0.5)` semi-transparente a gradiente solido opaco `linear-gradient(155deg, #060d09, #0a1a0f, #07100a, #050a07)` para igualar el fondo emerald marble del resto del sitio.
3. **Velocidad de animaciones** — `animate-on-scroll` reducido de 0.8-0.9s a 0.45s, `translateY` de 30-40px a 18px. IntersectionObserver rootMargin cambiado de `-20px` a `+80px` (detecta 80px ANTES de entrar al viewport). Nuclear fallback reducido de 3.5s a 2s. Stagger delays reducidos.

**CSS agregado al final de style.css (linea ~13789+):**
- Hero Ticker: `.hero-v7 > .hero-ticker`, `.hero-ticker-track`, `.hero-ticker-item`, `.hero-ticker-sep`, `@keyframes ticker-scroll`
- Animation Speed Fix: Override global de `.animate-on-scroll` duration/transform
- Background Consistency: `.hero-v7 > .hero-meta { display: none }`

**Notas para limpieza futura:**
- Las clases `.hero-meta`, `.hero-meta-inner`, `.hero-badge`, `.hero-badge-sep` en CSS legacy ya no tienen correspondencia en el HTML del index. Son candidatas a eliminacion.
- La doble definicion de `.animate-on-scroll` (linea 184 y 3865) es redundante — la del final de style.css las sobrescribe ambas.
