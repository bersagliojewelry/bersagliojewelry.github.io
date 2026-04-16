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

### 2026-04-04 — Consolidacion ticker + trust strip en un unico marquee
**Archivos modificados:** `index.html`, `css/style.css`, `CLAUDE.md`

**Cambios realizados:**
1. **Hero ticker unificado** — Se fusionaron las dos barras debajo del hero (ticker animado + trust strip estatico) en un unico ticker marquee animado. El ticker ahora incluye los 6 items: Certificado La Verde / Jewelers of America, Oro 18K · Ley 750, Envio asegurado, Asesoria personalizada, Esmeraldas colombianas, Visitanos en Cartagena Colombia. Contenido duplicado en el HTML para loop infinito via CSS `translateX(-50%)`.
2. **Trust strip removido** — Se comento el HTML del `.trust-strip.trust-strip-v7` en index.html y se agrego `display: none !important` en CSS como respaldo.
3. **Velocidad del ticker ajustada** — Animation duration aumentada de 25s a 45s (desktop) y de 18s a 30s (mobile <480px) para compensar el mayor contenido.

**CSS modificado:**
- `.hero-v7 .hero-ticker-track` animation-duration: 25s → 45s
- Mobile ticker animation-duration: 18s → 30s
- Nuevo bloque: `.trust-strip.trust-strip-v7 { display: none !important; }`

**Notas:**
- Solo index.html usaba el trust strip, no afecta otras paginas.

### 2026-04-04 — Limpieza de codigo muerto (hero-meta, trust-strip V7)
**Archivos modificados:** `index.html`, `css/style.css`, `CLAUDE.md`

**Cambios realizados:**
1. **Eliminado comentario HTML del trust strip** — Se removio el bloque comentado `<!-- <div class="trust-strip trust-strip-v7">...</div> -->` del index.html.
2. **Eliminado CSS completo de Trust Strip V7** — ~200 lineas de CSS eliminadas (base + responsive + accesibilidad) ya que el HTML fue removido.
3. **Eliminado CSS de hero-meta V7** — ~65 lineas de CSS eliminadas (`.hero-v7 > .hero-meta`, `.hero-meta-inner`, `.hero-badge`, `.hero-badge-sep` + responsive) ya que hero-meta no existe en el HTML.
4. **Eliminadas referencias hero-meta en responsive** — Se limpiaron las reglas `.hero-v7 .hero-meta-inner` en los breakpoints de 1024px, 1280px, 1600px y 479px.
5. **Eliminada regla safe-area hero-meta** — Se removio `padding-bottom: env(safe-area-inset-bottom)` para `.hero-v7 > .hero-meta`.
6. **Eliminada regla display:none del trust-strip** — Era redundante ya que el HTML fue removido.

**Resultado:** ~270 lineas de CSS muerto eliminadas. El archivo style.css queda mas limpio sin afectar ningun estilo visible.

### 2026-04-04 — Iconos diferenciados en ticker + eliminar pause on hover
**Archivos modificados:** `index.html`, `css/style.css`, `CLAUDE.md`

**Cambios realizados:**
1. **SVG Oro 18K** — Cambiado de rombo generico a icono de lingote (rectangulo con divisiones).
2. **SVG Esmeraldas colombianas** — Cambiado de rombo generico a icono de gema facetada (octogono con facetas internas).
3. **Eliminado pause on hover** — Se removio la regla `.hero-v7 > .hero-ticker:hover .hero-ticker-track { animation-play-state: paused }` para que el ticker nunca se detenga ni con mouse ni con touch.

### 2026-04-04 — Rediseno completo del header (desktop + mobile)
**Archivos modificados:** `snippets/header.html`, `css/style.css`, `js/components.js`, `CLAUDE.md`

**Cambios en el HTML (header.html):**
1. **SVGs eliminados de dropdown items** — Los menus de Colecciones y Servicios ya no muestran iconos SVG. Solo texto (nombre + descripcion).
2. **Contacto movido fuera del nav-list** — Ahora es un boton `.nav-action-btn.nav-contact-btn` dentro de `.nav-actions`, simetrico con WhatsApp.
3. **WhatsApp rediseñado** — Usa clase `.nav-action-btn.nav-wa-btn` con tamaño identico al de Contacto.
4. **Boton de cuenta agregado** — `.nav-account-btn` con icono de usuario, preparado para futuro login/registro.
5. **Botones icono unificados** — Busqueda, cuenta, wishlist y carrito usan clase `.nav-icon-btn` para coherencia.
6. **Mobile menu header** — Nuevo `.nav-menu-header` con marca "BERSAGLIO" y boton "Cerrar" con X.
7. **Mobile menu footer** — Nuevo `.nav-menu-footer` con botones Contacto y WhatsApp en mobile.

**Cambios en CSS (style.css, final del archivo):**
1. **Dropdown icons ocultos** — `.dropdown-link-icon { display: none }` limpia los menus.
2. **Botones simetricos** — `.nav-action-btn` da padding/font-size identico a Contacto y WhatsApp.
3. **Botones icono** — `.nav-icon-btn` unifica busqueda, cuenta, wishlist, carrito con 36x36px.
4. **Search trigger visible** — Color explicito, no transparente.
5. **Mobile menu completo** — Fondo oscuro esmeralda (no ivory), slide desde derecha, flexbox vertical.
6. **Mobile header con Cerrar** — Boton con X + "Cerrar" visible, borde dorado sutil.
7. **Mobile dropdowns corregidos** — `position: static`, sin `translateX(-50%)`, padding-left para indent, max-height accordion.
8. **Mobile footer** — Botones Contacto y WhatsApp al pie del menu.
9. **body.menu-open** — Bloquea scroll del body.
10. **3 breakpoints responsive** — 968px (mobile), 479px (small mobile), 600-968px (tablet).

**Cambios en JS (components.js):**
1. **closeMenu() refactorizado** — Funcion unica reutilizada.
2. **Boton Cerrar** — `#navMenuClose` cierra el menu.
3. **Accordion exclusivo** — Al abrir un dropdown se cierran los demas.
4. **WhatsApp mobile sync** — El link mobile sincroniza href con el desktop via MutationObserver.

**IMPORTANTE — Reglas para el header:**
- La clase `.nav-contact-btn` ya NO esta en el nav-list, esta en `.nav-actions`
- El mobile menu usa fondo oscuro, NO ivory
- Los dropdown items NO tienen `.dropdown-link-icon` visible
- El boton `.nav-account-btn` es placeholder para futuro sistema de auth

### 2026-04-04 — Rediseno completo seccion Servicios (index + pagina)
**Archivos modificados:** `js/data/catalog.js`, `js/components/services.js`, `index.html`, `servicios.html`, `css/style.css`, `CLAUDE.md`

**Cambios en datos (catalog.js):**
- 4 pilares actualizados: Diseno y Fabricacion a Medida, Asesoria Personalizada, Certificacion y Garantia, Taller y Mantenimiento
- Textos reescritos con info real de la marca (fabricantes, puerta a puerta, etc.)
- Nuevo icono "tools" (wrench) para Taller y Mantenimiento

**Cambios en services.js:**
- Agregado icono Phosphor "tools" (wrench light) para el nuevo servicio de Taller
- Componente actualizado a V5, misma estructura showcase layout

**Cambios en index.html:**
- Subtitulo actualizado: "...cuidamos cada detalle para que tu inversion perdure en el tiempo"
- CTA actualizado: "Conoce todos nuestros servicios"

**Cambios en servicios.html (reescritura completa):**
- Hero: "Mas que joyas, creamos un legado" + eyebrow "Fabricantes de Alta Joyeria"
- Seccion intro narrativa (`.svc-intro`): Historia de marca puerta a puerta, fabricantes directos
- 5 tarjetas de servicio numeradas (`.svc-card`): Asesoria, Diseno/Fabricacion, Taller, Garantia/Certificacion, Envios
- Cada tarjeta con numero grande lateral, titulo, descripcion, CTA individual
- Seccion proceso 3 pasos (`.svc-process`): Consulta, Propuesta, Creacion/entrega
- CTA final mantenido
- Eliminados: brand-statement quote anterior, `services-detail-grid` con 6 cards, inline styles en proceso

**Cambios en CSS (nuevas clases):**
- `.svc-intro`, `.svc-intro-inner`, `.svc-intro-text`, `.svc-intro-line` — Intro narrativa con tipografia serif italic
- `.svc-card`, `.svc-card-number`, `.svc-card-content`, `.svc-card-title`, `.svc-card-desc`, `.svc-card-cta` — Tarjetas numeradas estilo editorial
- `.svc-process-section`, `.svc-process-grid`, `.svc-process-step`, `.svc-process-num`, `.svc-process-title`, `.svc-process-desc` — Pasos del proceso
- Responsive: 768px (mobile cards + proceso vertical), 479px (compact)
- Accesibilidad: prefers-reduced-motion

**Notas:**
- Las clases legacy `.service-detail-card`, `.services-detail-grid` en CSS quedan huerfanas (ya no hay HTML que las use), candidatas a limpieza
- El showcase layout del index (gema central con 4 servicios) se mantiene intacto
- Colores de texto en servicios page ahora son claros sobre fondo oscuro (corregido contraste)

### 2026-04-04 — Header V2: simetria desktop + mobile panel premium
**Archivos modificados:** `css/style.css`, `CLAUDE.md`

**Problemas corregidos:**
1. **Desktop simetria** — El CSS legacy `.nav-contact-btn` (linea ~9801) tenia padding 9px 22px / font-size 10.5px que hacia Contacto mas grande que WhatsApp. Se neutralizo, ahora ambos botones usan height:34px fijo identico.
2. **Mobile menu legacy conflicto** — El CSS legacy (linea ~1553) tenia `background: var(--ivory)` (blanco), `right: -100%` y `color: var(--text-primary)` que conflictuaba con el panel oscuro nuevo. Se neutralizo dejando solo `.hamburger { display: flex }` y las reglas de about-grid/contact-grid.
3. **Mobile close button** — La X SVG grande fue refinada: ahora 14px con opacity, junto al texto "CERRAR" sin borde prominente. Sin la X blanca grande del diseño anterior.
4. **Mobile footer cortado** — Agregado `margin-top: auto` + `padding-bottom: calc(16px + env(safe-area-inset-bottom))` para que Contacto/WhatsApp siempre sean visibles, incluso con la barra del navegador iOS.
5. **Separador visual desktop** — Linea vertical sutil entre botones texto y botones icono via `.nav-account-btn::before`

### 2026-04-04 — Fix critico mobile menu: hamburger X doble, panel no abria
**Archivos modificados:** `css/style.css`, `js/components.js`, `CLAUDE.md`

**Root causes identificados y corregidos:**
1. **Doble boton cerrar** — El CSS `.hamburger.is-active` transformaba las 3 lineas en X (z-index 1002 encima del panel z-index 1001), creando un segundo boton cerrar sobre el del panel. Solucion: `.hamburger.is-active { display: none !important }` — el hamburger se oculta cuando el menu esta abierto, y el panel usa su propio boton "Cerrar".
2. **Panel no cubria pantalla completa** — `.nav-menu` usaba `height: 100%` que se resolvia contra el parent `<nav>` (72px) en vez del viewport. Solucion: `height: 100vh; height: 100dvh; min-height: 100vh`.
3. **transform en .header rompia position:fixed del panel** — Cuando `.header-hidden` aplicaba `transform: translateY(-100%)`, creaba un nuevo stacking context que hacia que `position: fixed` del `.nav-menu` fuera relativo a `.header` (escondido) y no al viewport. Solucion: en JS, remover `header-hidden` al abrir menu + no aplicar `header-hidden` mientras menu esta abierto.
4. **transition-delay en is-open** — Se corrigio para especificar `visibility 0s 0s` explicitamente en el estado abierto en vez de usar `transition-delay: 0s` que pisaba todos los delays.

### 2026-04-04 — Mobile menu V3: contraste, legibilidad y footer visible
**Archivos modificados:** `css/style.css`, `CLAUDE.md`

**Problemas corregidos:**
1. **Footer (Contacto/WhatsApp) no visible** — `margin-top: auto` empujaba los botones debajo del fold. Cambiado a `margin-top: 8px`. `.nav-list` cambiado de `flex: 1 0 auto` a `flex: 0 0 auto` para que no ocupe todo el espacio vertical.
2. **Fondo demasiado oscuro** — Gradiente cambiado de `#060d09/#0a1a0f/#07100a` (casi negro) a `#0e1f15/#132b1e/#0e1f15` (verde esmeralda oscuro pero legible).
3. **Texto de nav-links** — Font-size de 12px a 13px, padding de 16px a 18px vertical.
4. **Dropdown names** — Color de `rgba(220,200,165,0.6)` a `rgba(235,220,195,0.85)`, font-size de 11px a 12px.
5. **Dropdown descriptions** — Color de `rgba(200,190,170,0.25)` (casi invisible) a `rgba(215,205,185,0.6)`, font-size de 9.5px a 11px.
6. **Dropdown "ver catalogo"** — Color de `rgba(201,169,110,0.4)` a `0.7`, font-size de 10px a 11px.
7. **Boton cerrar** — Color de `rgba(220,200,165,0.45)` a `rgba(235,220,195,0.8)`, font-size de 9px a 10px. SVG opacity de 0.6 a 0.85.
8. **Brand text** — Color de `rgba(201,169,110,0.7)` a `0.9`.
9. **Dropdown arrow** — Color de `rgba(201,169,110,0.3)` a `0.6`.
10. **Separadores (borders)** — Nav-item border de `0.05` a `0.1`, header border de `0.08` a `0.15`, footer border de `0.08` a `0.15`.
11. **Footer buttons** — Height de 44px a 46px, font-size de 9px a 10.5px.
12. **Small mobile (479px)** — Nav-link font-size de 11px a 12px, footer btn height de 40px a 44px, font-size de 8.5px a 9.5px.

**Objetivo:** Mejorar legibilidad para todos los usuarios incluyendo adultos mayores, con contraste WCAG adecuado sobre fondo oscuro.

### 2026-04-05 — Fix: touch scroll bloqueado en movil/tablet
**Archivos modificados:** `css/style.css`, `js/preloader.js`, `js/components.js`, `CLAUDE.md`

**Root cause:**
- `overflow-x: hidden` en `body` (linea 94 de style.css) causa un bug conocido de WebKit/iOS Safari donde el scroll vertical con touch queda bloqueado. La solucion es mover `overflow-x: hidden` al elemento `html` en vez de `body`.
- El preloader (`body.is-preloading { overflow: hidden }`) depende de una animacion GSAP para remover la clase. Si GSAP falla o se demora, el scroll queda permanentemente bloqueado.
- El dev overlay aplica `document.body.style.overflow = 'hidden'` inline y solo lo remueve dentro de un listener `animationend`. Si la animacion CSS falla, el scroll queda bloqueado.

**Cambios realizados:**
1. **CSS** — Movido `overflow-x: hidden` de `body` a `html`. Esto previene overflow horizontal sin interferir con el scroll vertical touch en iOS/WebKit.
2. **Preloader safety timeout** — Agregado `setTimeout` de 6s que remueve `is-preloading` del body como fallback, garantizando que el scroll se restaure aunque GSAP falle.
3. **Dev overlay safety timeout** — Agregado `setTimeout` de 800ms que remueve `overflow: hidden` y elimina el overlay si `animationend` nunca se dispara.

**Notas:**
- Ningun `preventDefault()` en touchmove/wheel fue encontrado — el problema era puramente CSS.
- Lenis smooth scroll ya se desactiva correctamente en touch devices (`pointer: coarse` check).
- `touch-action` no estaba definido en ninguna parte, no era causa del problema.

### 2026-04-05 — Fix V2: auditoria profunda touch scroll + limpieza codigo muerto
**Archivos modificados:** `css/style.css`, `js/components.js`, `js/preloader.js`, `js/components/header.js` (eliminado), `CLAUDE.md`

**Root causes identificados y corregidos (auditoria completa):**

1. **`overflow-x: hidden` en html/body bloquea touch en iOS/WebKit** — Reemplazado por `overflow-x: clip` (con fallback `hidden`) en `body`. `overflow-x: clip` NO crea un scroll container, permitiendo scroll vertical touch nativo. Removido de `html` completamente.

2. **Film grain `body::after` con z-index 9995** — Aunque tenia `pointer-events: none`, en dispositivos tactiles un pseudo-elemento position:fixed de alto z-index sobre toda la pantalla puede interferir con la cadena de eventos touch. Solucion: `display: none` en `@media (pointer: coarse)` — desactiva grain en touch devices (tambien ahorra GPU).

3. **`body.menu-open { overflow: hidden }` insuficiente en iOS** — `overflow: hidden` en body NO bloquea scroll en iOS Safari. Cambiado a tecnica `position: fixed; width: 100%` + guardar/restaurar scroll position via JS (`lockScroll`/`unlockScroll`).

4. **`.hero-canvas` sin `pointer-events: none`** — El canvas de particulas cubria todo el hero section (100vh) y podia interceptar touch events. Agregado `pointer-events: none`.

5. **`.hero-overlay` sin `pointer-events: none`** — El overlay del hero (position:absolute inset:0) podia interceptar touch. Agregado `pointer-events: none` en la definicion base (linea ~588). La segunda definicion (linea ~5310) ya lo tenia.

6. **Duplicacion `scroll-behavior: smooth`** — Definido en `html` (linea 85) y repetido con `!important` al final del archivo. Eliminada la duplicacion.

7. **`js/components/header.js` — Codigo muerto eliminado** — Contenia `initHeader()` exportado pero nunca importado en ningun modulo. Tenia su propio handler de scroll duplicado y hamburger handler que cerraba menu en TODOS los clicks de anchor (incluyendo dropdowns). Eliminado el archivo completo.

8. **Safety net global mejorado** — Timeout de 8s que limpia `is-preloading`, `search-open`, `overflow` inline, `top` inline y `position` inline del body. No incluye `menu-open` para evitar conflicto con el lockScroll/unlockScroll.

**Tecnica lockScroll/unlockScroll (JS):**
```js
lockScroll()  → guarda window.scrollY, aplica body.style.top = -scrollY, agrega .menu-open
unlockScroll() → remueve .menu-open y body.style.top, restaura window.scrollTo(0, saved)
```
Esta tecnica es la recomendacion de WebKit para bloquear scroll detras de modales en iOS Safari.

**CSS body.menu-open actualizado:**
```css
body.menu-open {
    overflow: hidden;
    position: fixed;
    width: 100%;
    /* top is set dynamically via JS */
}
```

### 2026-04-14 — Fix bugs admin overwrite + real-time sync (Fases 1, 2, 3)

**Bugs reportados:**
1. Admin: al crear una pieza/colección se sobrescribía/eliminaba la anterior.
2. Web pública: cambios en piezas/colecciones no se reflejaban en tiempo real — requerían refresh manual.

**Referencia:** Patrón de `altorracars/altorracars.github.io` para optimistic locking, audit log y sync en vivo.

**Branch:** `claude/fix-admin-overwrite-bug-R4gwU`

#### Fase 1 — Fix overwrite (commit `c775dc5`)
**Archivos:** `js/firestore-service.js`, `js/admin/db.js`, `js/admin/piezas.js`, `js/admin/colecciones.js`

- **Root cause:** `setDoc` sin `{merge: true}` borraba todos los campos no presentes en el payload. Además `saveCollection` usaba el slug como id, colisionando con documentos existentes.
- Split de `savePiece` / `saveCollection` en `createX` (fail si existe) + `updateX` (merge).
- `createPiece`: id generado con `p${Date.now()}${random6}` para evitar colisiones.
- `createCollection`: retry con sufijo `-2`, `-3`… si el id base está ocupado.
- `patchPiece()` para updates parciales (ej. solo imágenes) con merge.
- `openModal()` en piezas y colecciones hace hard-clear del hidden id field para evitar reuso de ids stale.
- `handleFiles()` usa bucket temporal `tmp${Date.now()}` para piezas nuevas.

#### Fase 2 — Real-time sync + campo código (commit `13b7df4`)
**Archivos:** `js/data/catalog.js`, `js/pieza.js`, `js/app.js`, `js/cart-page.js`, `js/wishlist-page.js`, `js/admin/piezas.js`, `admin-piezas.html`

- **catalog.js:** `load()` ahora usa `onSnapshot` como fuente primaria (no double-fetch). Promise memoizada, idempotente. `_notify` coalesce via `requestAnimationFrame`.
- **pieza.js:** dedupe por signature JSON + re-render completo en cada update. Maneja borrado (renderiza not-found) y revival.
- **app.js:** helper `renderAllSections` llamado en paint inicial y en `db.onChange` (incluye journal y services).
- **cart-page.js / wishlist-page.js:** agregado `db.onChange(() => render())` para sincronizar cambios de piezas en vivo.
- **Plus — campo código manual:**
  - Nuevo input `code` obligatorio en formulario de pieza con validación de unicidad case-insensitive.
  - Columna "Código" como primera columna en tabla admin con estilo pill dorado.
  - Helper text: "Identificador único de la pieza (manual)".

#### Fase 3 — Hardening (commit `d072f7a`)
**Archivos:** `js/firestore-service.js`, `js/admin/db.js`, `js/admin/shared.js`, `js/admin/piezas.js`, `js/admin/colecciones.js`

- **Optimistic locking via `_version`:**
  - `createPiece` / `createCollection` corren en `runTransaction`, stampean `_version: 1`.
  - `updatePiece` / `updateCollection` en transacción — si el caller pasa `opts.expectedVersion` y la versión en Firestore cambió, aborta con `code: 'version-conflict'`.
  - `patchPiece` (updates solo de imágenes) intencionalmente salta el version check.
- **Audit log:** `writeAuditLog()` escribe en subcolección `<collection>/<docId>/auditLog` con `{action, version, actorUid, actorEmail, actorDisplayName, timestamp, changes/snapshot}`. Best-effort — falla del audit nunca bloquea el save principal.
- **Retry con backoff exponencial:** `withRetry()` wrappea todas las operaciones. Reintenta solo errores transientes (`unavailable`, `deadline-exceeded`, `aborted`, `cancelled`, `internal`, `resource-exhausted`). 4 intentos con backoff 250ms → 500ms → 1s → 2s + jitter.
- **Cache invalidation:** `signalCacheInvalidation()` actualiza `system/meta.lastDataUpdate` como señal para cachés del frontend público.
- **Auth context:** `setAuthContext()` inyecta el usuario actual desde `admin/shared.js:initSidebar()` para que todo write quede atribuido en el audit log.
- **Admin UI:**
  - `openModal()` captura `_version` del doc cargado como `_editingVersion`.
  - `handleSave()` pasa `expectedVersion` y maneja `version-conflict` / `not-found` con toasts en español de 5s ("Otra persona modificó esta pieza mientras la editabas. Recarga para ver los cambios.").

**Nuevos campos en docs Firestore (piezas + colecciones):**
- `_version` (number) — monotónico, empieza en 1
- `createdBy` / `updatedBy` (string) — uid del admin
- `createdAt` / `updatedAt` (timestamp) — serverTimestamp

**Nueva colección Firestore:** `system/meta` con `lastDataUpdate`.
**Nueva subcolección:** `<pieces|collections>/<docId>/auditLog`.

**NO TOCAR:**
- El campo `_version` se maneja exclusivamente en el service layer — `db.js` lo borra de los payloads antes de enviarlos.
- `patchPiece` NO debe agregar version check — es para partials concurrentes de imágenes.
- El id de pieza se genera con `p${Date.now()}${random6}` — no cambiar al slug.
- `saveCollection` en creación genera id con retry `-2`/`-3`… — no volver al slug directo.

### 2026-04-15 — Documentación fases 1-3 (commit `034b428`)
**Archivo:** `CLAUDE.md`
Bloque de fases 1-3 documentado con root causes, archivos tocados y reglas "NO TOCAR".

### 2026-04-15 — Rename label "Claridad" → "Calidad" (commit `bb8dee6`)
**Archivos:** `admin-piezas.html`, `js/pieza.js`, `js/cart-page.js`, `js/wishlist-page.js`, `js/components/featured.js`

- Cambio puramente de display label en admin (formulario de pieza) y en todas las vistas públicas que renderizan specs.
- **El data key Firestore sigue siendo `clarity`** — solo cambia el texto visible. No hay migración de datos.

### 2026-04-15 — Unificación de fondo Journal / About / CTA (commit `c514dfe`)
**Archivo:** `css/style.css`

- `.journal-preview.journal-v7`, `.about-teaser.about-v7` y `.cta-banner.cta-v7` cambiados a `background: transparent !important` para dejar pasar el `Emerald Marble Background` global del body.
- Antes cada sección tenía su propio gradiente (`linear-gradient(155deg, …)`) y rompía la continuidad visual con el resto del index.

### 2026-04-15 — Fix false `version-conflict` al borrar imagen (commit `bd907e3`)
**Archivos:** `js/firestore-service.js`, `js/admin/db.js`, `js/admin/piezas.js`, `js/admin/colecciones.js`

- **Síntoma:** Editar pieza → borrar una imagen → Guardar → toast "Otra persona modificó esta pieza mientras la editabas" aunque no haya otros usuarios.
- **Root cause:** `patchPiece()` (delete imagen) bumpea `_version` en Firestore pero el `_editingVersion` local del modal queda stale. Al guardar el resto del form, `expectedVersion` no coincide → conflict falso.
- **Fix:**
  - `updatePiece` / `updateCollection` ahora retornan `{version: nextVersion}`.
  - `patchPiece` propaga la nueva version al caller.
  - En `piezas.js` / `colecciones.js`, los handlers de delete imagen actualizan `_editingVersion = newVersion` tras el patch.

### 2026-04-15 — Lookbook V7: mejoras móvil + lazy load (commit `b91e3de`)
**Archivos:** `js/components/lookbook.js`, `css/style.css`

Tres bugs reportados:
1. **Libro descentrado en tapa/contratapa** — empezó este hilo de fixes
2. **Móvil: libro alargado y angosto, tipografía ilegible** — porque la fórmula desktop (`vw * 0.42`) daba ~158px en un viewport de 375px
3. **Carga ultralenta del lookbook en móvil** — PageFlip se inicializaba en cada burst de snapshot

**Cambios:**
- **Dimensiones por dispositivo:** branch `isMobile = vw < 768`. Móvil usa `min(vw - 80, 380)` (en pantallas <380px reserva 56px) con altura 1.4× el ancho. Desktop usa `min(maxH * 0.78, vw * 0.42)` cap a 750px.
- **Dedupe por content signature:** se calcula JSON de la estructura de páginas; si la signature no cambió, se salta el rebuild + reinit de PageFlip. Evita teardown/reinit en cada snapshot burst de Firestore.
- **Lazy init con IntersectionObserver:** PageFlip no se construye hasta que el lookbook está a 300px del viewport. Mejora dramáticamente el first paint en móvil.
- **Tipografía mobile <767px:** override de `pf-cover-eyebrow`, `pf-cover-title`, `pf-cover-year`, `pf-cover-tagline`, `pf-intro-*`, `pf-piece-*` etc. con `clamp()` para que el texto respire en celulares.
- **State classes** `is-cover-state` / `is-back-state` agregadas al wrapper en `updateUI()` para futuro centrado CSS.

### 2026-04-15 — Lookbook V7: anti-flash + intento de centrado (commit `1f5ac20`)
**Archivos:** `js/components/lookbook.js`, `css/style.css`

- **PageFlip config:** `size: 'stretch'` → `size: 'fixed'`, `autoSize: true` → `false`. Da dimensiones exactas y predecibles.
- **Anti-flash en Ctrl+Shift+R:** tras `loadFromHTML`, JS añade clase `is-ready` al `.pf-book` y `.pf-wrapper`. CSS oculta los `.pf-page` crudos del markup hasta que `.pf-book.is-ready` exista, evitando el "flash" del libro agrandado antes de que PageFlip construya su canvas.
- **Intento fallido de centrado** con `width: auto` + flex en `.pf-book` — descentraba la paginación inferior y no atacaba el root cause (ver siguiente fix).

### 2026-04-15 — Lookbook V7: centrado tapa/contratapa con shift dinámico (commit `850e730`)
**Archivos:** `js/components/lookbook.js`, `css/style.css`

- **Root cause real (ROOT CAUSE):** En modo landscape (PC) PageFlip dibuja un **SPREAD doble** de `2 × maxW`. La tapa cerrada vive en la mitad derecha del canvas y la contratapa en la mitad izquierda. El `.stf__parent` ya está centrado en `.pf-book-area`, pero visualmente solo se ve la mitad ocupada → tapa offset right por `maxW/2`.
- **Fix:**
  - JS calcula tras `initPageFlip` si la orientación es `landscape`. Si sí, expone `--pf-cover-shift = maxW/2 px` en `.pf-wrapper`. En portrait (móvil) el canvas muestra una sola página → shift = 0.
  - CSS aplica `translateX(-shift)` a `.pf-book` cuando el wrapper tiene `.is-cover-state`, y `translateX(+shift)` cuando tiene `.is-back-state`. Páginas internas (spread completo) sin transform.
  - Listener `changeOrientation` para recalcular el shift si cambia la orientación.
- **Eliminado** el hack previo `width: auto` en `.pf-book` que descentraba la paginación.

### 2026-04-15 — Lookbook V7: sincronización del shift con animación (commit `66edc6a`)
**Archivos:** `js/components/lookbook.js`, `css/style.css`

- **Síntoma:** al abrir tapa o cerrar contratapa, durante el flip se veía un espacio entre las dos mitades del libro y al final pegaba un salto.
- **Root cause:** el evento `flip` de PageFlip solo dispara cuando la animación **termina**, así que el `translateX(-shift)` se mantenía durante todo el flip y luego cambiaba de golpe. Rotación de página y deslizamiento del libro estaban desincronizados.
- **Fix:**
  - Listener `changeState` que detecta el **inicio** del flip (`'flipping'` / `'user_fold'` / `'fold_corner'`) y quita `is-cover-state` / `is-back-state` enseguida. El `.pf-book` empieza a deslizarse al centro **en paralelo** con la rotación de la página.
  - Transición CSS de `transform` aumentada de `0.45s` a `0.6s` (igualada al `flippingTime: 600` de PageFlip) con easing `cubic-bezier(0.65, 0, 0.35, 1)` para que ambos movimientos terminen juntos y se vean cinematográficos.

### 2026-04-15 — Lookbook V7: fix "stuck at page 2" + gap real (audit completo)
**Archivos:** `js/components/lookbook.js`, `css/style.css`

**Dos bugs reportados tras `f804504`:**
1. **Libro atascado en página 2** — ni los botones ni drag avanzaban más allá del primer spread tras abrir la tapa.
2. **Gap al abrir/cerrar** — seguía visible el salto "la tapa se despega del libro".

**Audit + root causes:**

1. **Stuck bug.** `flipTo()` llamaba `_flipInstance.flip(_currentPage + 1)`. En landscape+showCover el evento `flip` dispara con el índice de la página derecha del nuevo spread: tras la primera apertura, `_currentPage = 2`. Entonces `flipTo(3)` llama `flip(3)`, pero la página 3 es la izquierda del siguiente spread y PageFlip no normaliza correctamente un target mid-spread → el libro queda congelado. La API nativa `flipNext()` / `flipPrev()` sí respeta los límites de spread.

2. **Gap real.** El intento anterior (`f804504`) snapeaba el transform sin transición al momento del click, confiando en que PageFlip cacheaba el eje de rotación. En realidad lo que el usuario percibía como "gap" era el **salto instantáneo** del libro de `translateX(-maxW/2)` a `0` al momento del click — visible medio frame antes de que la rotación empezara. El único fix robusto es animar el shift **en paralelo con la rotación**, con mismo duration y easing, y aplicar la clase ANTES de llamar a `flipNext()`.

**Cambios:**

**`lookbook.js`:**
- Eliminado `flipTo()` con el hack `transition: none` + reflow forzado.
- Nuevas funciones `goNext()` / `goPrev()` / `goTo()`:
  - `goNext` / `goPrev` usan `_flipInstance.flipNext()` / `flipPrev()` nativos (fix del stuck bug).
  - `predictNextState()` / `predictPrevState()` calculan si el destino del flip será `is-cover-state` / `is-back-state` basándose en `_currentPage` y las reglas de spread (cover ↔ primer spread usa páginas 1-2, back ↔ último spread usa páginas `totalPages-3` y `-2`).
  - `applyState()` togglea ambas clases en el wrapper ANTES de disparar el flip → el CSS transition del transform arranca al mismo tiempo que la rotación.
- `goTo()` (dots) usa `flip(target)` directo pero sólo con target explícito (dots nunca clickean mid-spread).
- Listener `changeState` (`'flipping'` / `'user_fold'`) como safety net para drags: al iniciar un flip desde cover/back quita la clase para que el shift también anime.
- `updateUI()` reduced a reconciliación final (desde el evento `flip`) — cualquier desincronización por predicción fallida se arregla al terminar la animación.
- `useMouseEvents` vuelto a `true` — ahora que el listener `changeState` cubre el caso drag, se puede dejar que el usuario arrastre las páginas.

**`style.css`:**
- `.lookbook-v7 .pf-book` recupera `transition: transform 0.6s cubic-bezier(0.645, 0.045, 0.355, 1)` (ease-in-out-cubic, aproxima la curva interna de StPageFlip). El slide y la rotación arrancan y terminan juntos → sin salto, sin gap.

**Validación antes de commit:** `node --check js/components/lookbook.js` + `npx vite build` corriendo limpios.

**REGLAS LOOKBOOK V7 (NO TOCAR):**
- PageFlip se inicializa con `size: 'fixed'` + `autoSize: false` — no volver a `'stretch'`.
- El `--pf-cover-shift` se calcula en JS según orientación, NO hardcodear en CSS.
- **Nunca** usar `_flipInstance.flip(_currentPage + 1)` para next/prev — usar **`flipNext()` / `flipPrev()` nativos**. `flip(target)` solo se usa con targets explícitos (dots).
- La predicción de `is-cover-state` / `is-back-state` debe aplicarse ANTES del call a flipNext/flipPrev para que el CSS transition y la rotación arranquen sincronizadas.
- El listener `changeState` cubre drags — si se remueve, los flips iniciados por arrastre muestran otra vez el salto post-animación.
- La transición CSS de `transform` en `.pf-book` debe ser **`0.6s`** para coincidir con `flippingTime: 600`. Si se cambia uno, cambiar el otro.
- Móvil (`vw < 768`) y desktop tienen fórmulas de dimensión distintas — no unificar.
- Lazy init con IntersectionObserver es crítico para móvil — no quitar.
- `useMouseEvents: true` + `showPageCorners: false` es la combinación correcta: drag sí, hover-peek no (el hover-peek era la causa del "libro se mueve solo con el mouse").

### 2026-04-16 — Lookbook V7: eliminar gap residual (easing mismatch)
**Archivos:** `css/style.css`

- **Síntoma:** tras el fix anterior, quedaba un gap pequeño (~0.5cm) durante la apertura/cierre del libro.
- **Root cause:** StPageFlip internamente anima con interpolación **lineal** (avanza cada frame el mismo delta de posición vía un array pre-computado de puntos). El CSS usaba `cubic-bezier(0.645, 0.045, 0.355, 1)` (ease-in-out-cubic) que tiene una curva S — a mitad del flip la rotación iba al ~50% pero el slide iba al ~35%, produciendo un desfase visible de medio centímetro.
- **Fix:** Cambiado el easing CSS de `cubic-bezier(0.645, 0.045, 0.355, 1)` a `linear`. Ahora el slide horizontal y la rotación de la página avanzan al mismo ritmo en cada frame → gap eliminado.
- **Nota:** El easing `linear` se siente natural porque el movimiento dominante es la rotación de la página (llamativo y suave). El slide horizontal es secundario (~150-200px) y pasa desapercibido como "lineal".
