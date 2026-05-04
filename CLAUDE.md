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
| ~10580+ | Portfolio V5 — CSS Slider | `.lb-viewport`, `.lb-track`, `.lb-slide`, `.lb-arrow`, `.lb-dot` |
| 11152-11530 | Featured Pieces V4 — 3D tilt, magnetic CTA, hover reveal | `.featured.featured-v7` |
| 11531-11680 | Featured V4 — Responsive + Accessibility | `.featured.featured-v7` |
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

### 2026-04-16 — Lookbook V7: spine strip para gap entre páginas del spread
**Archivos:** `css/style.css`

- **Síntoma:** gap visible (franja del fondo verde oscuro) entre la página izquierda y derecha de cada spread en reposo. Presente en TODOS los spreads, no solo al abrir/cerrar la portada. El problema era completamente distinto al gap de la animación del shift.
- **Root cause:** StPageFlip en HTML mode posiciona las páginas con `left: Npx` y `width: Npx` calculados desde `boundsRect`. Deberían estar flush (sin espacio), pero en la práctica queda un gap visible causado por: (1) subpixel rendering cuando `getBlockWidth()` es impar (centerX tiene decimales), (2) `perspective: 2000px` en `.stf__block` que afecta el rasterizado 3D de los `.stf__item` con `transform-style: preserve-3d`, (3) diferencias de redondeo entre navegadores.
- **Fix:** Pseudo-elemento `::after` en `.stf__block` que funciona como "spine strip" — una franja vertical de 12px del color de las páginas (`#faf8f3`) centrada exactamente en el lomo del libro (`left: 50%; transform: translateX(-50%)`). Z-index 0 (detrás de las páginas que usan z-index 1+). Se oculta automáticamente en `is-cover-state` / `is-back-state` (cuando solo hay una página visible y no existe lomo).
- **Nota:** Este es un fix visual (cosmético), no estructural. La causa raíz está dentro del renderizado interno de StPageFlip que no podemos modificar. El spine strip es la misma técnica usada en editores de PDF y eReaders para ocultar artefactos de renderizado en el lomo del libro.

### 2026-04-17 — Portfolio V5: Reconstrucción completa sin StPageFlip
**Archivos:** `js/components/lookbook.js` (reescrito), `css/style.css` (nuevos estilos + limpieza), `package.json`

**Motivación:** Tras múltiples intentos de corregir bugs fundamentales de StPageFlip (gap al abrir/cerrar portada, libro atascado en página 2, hover displacement), se decidió eliminar la librería por completo y reconstruir el portafolio desde cero con tecnología más simple y robusta.

**Enfoque nuevo: Slider CSS puro**
- `transform: translateX(-N * 100%)` sobre un flex track — sin librerías externas
- Cada slide ocupa 100% del viewport del slider
- Navegación: flechas, dots, teclado (ArrowLeft/Right), swipe táctil
- Datos desde Firestore via `catalog.js` (misma interfaz `renderLookbook()`)

**Estructura de slides:**
- **Cover** — Portada con marca, año, tagline
- **Intro** (por colección) — Nombre, subtítulo, descripción, conteo de piezas
- **Gallery** (por colección) — Grid 2×2 de piezas con imagen, nombre, precio
- **Back** — Contraportada con CTA

**Cambios en `lookbook.js`:**
- Eliminado: import `PageFlip`, `initPageFlip()`, `flipNext/flipPrev`, sistema de shift `--pf-cover-shift`, listeners `changeState`/`changeOrientation`, `IntersectionObserver` para lazy init, clases `is-cover-state`/`is-back-state`
- Nuevo: `buildPages()` (misma lógica de datos), `renderSlide()` genera HTML por tipo, `initSlider()` con `goTo(n)`, touch/swipe handling, keyboard nav, dot navigation por event delegation
- Dedupe por content signature (JSON de páginas) — evita re-renders en bursts de Firestore

**Nuevos estilos CSS (prefijo `lb-`):**
- `.lb-viewport` — Contenedor con overflow:hidden, centrado, aspect-ratio 4/3 (desktop) / 3/4 (mobile)
- `.lb-track` — Flex row con transition, contiene slides
- `.lb-slide` — 100% flex-basis, variantes `--cover`, `--back`, `--intro`, `--gallery`
- `.lb-arrow` — Flechas de navegación absolutas
- `.lb-dots` / `.lb-dot` — Indicadores de página
- `.lb-counter` — "1 / N"
- `.lb-piece` — Card de pieza con hover gold border
- Responsive: 479px, 767px, 1024px, 1280px

**CSS eliminado (~1000 líneas):**
- Todas las reglas `.pf-*` (wrapper, side-btn, book-area, pagination, dots, pages, cover, back, intro, gallery, piece, etc.)
- Todas las reglas `.stf__*` (parent, canvas, block)
- Bloque `.lookbook-v7 .pf-*` completo (overrides V7 para PageFlip)
- Spine strip (`stf__block::after`)
- Anti-flash (`.pf-book:not(.is-ready)`)
- Cover shift system (`--pf-cover-shift`, `is-cover-state`, `is-back-state`)
- Referencias `.pf-piece-img` en shimmer section

**Dependencia eliminada:**
- `page-flip: ^2.0.7` removida de `package.json`

**NO TOCAR (reglas Portfolio V5):**
- Los estilos `lb-*` en style.css son el diseño activo del portafolio
- `renderLookbook()` es la interfaz pública — `app.js` la llama en paint y en `db.onChange`
- El slider NO usa librerías externas — solo CSS transitions + JS vanilla
- Touch/swipe usa threshold de 40px y 8px para distinguir scroll vertical de swipe horizontal
- La signature de dedupe evita rebuilds innecesarios en snapshots de Firestore — no quitar

**Reglas anteriores de PageFlip/Lookbook en este archivo (OBSOLETAS):**
Las secciones documentadas arriba sobre StPageFlip (shift dinámico, sincronización, easing, spine strip, stuck bug, etc.) son historial. Ya no aplican al código actual.

### 2026-04-18 — Portfolio V9: smart adaptive fit (anti-crop + anti-white-rectangle)
**Archivos:** `js/components/lookbook.js`, `css/style.css`

**Problema:** Con `object-fit: cover` las piezas con aspect ratio distinto al de la card quedaban recortadas (ej. anillo plateado con brazo cortado). Con `object-fit: contain` aparecía un rectángulo blanco feo alrededor.

**Solución — dos capas automáticas:**

**Capa 1 — Detección de ratio (JS):** al cargar cada imagen, `applyAdaptiveFit()` compara `img.naturalWidth/naturalHeight` vs el ratio de la card. Si la diferencia supera el 18% (`FIT_TOLERANCE`), se agrega la clase `.ptf-card-visual--contain` → switch a `object-fit: contain` + `padding: 10%`. Si el ratio coincide, se mantiene `cover`.

**Capa 2 — Blurred backdrop (CSS):** `.ptf-card-backdrop` es un div con `background-image` de la misma foto, `filter: blur(32px) saturate(1.1) brightness(0.55)` + `scale(1.15)`. Solo visible cuando la card está en modo contain (opacity 0 → 1). Rellena el espacio vacío con colores del propio producto, eliminando el rectángulo blanco.

**Stacking de z-index en la card:**
- `.ptf-card-backdrop` z-index 0 (fondo)
- `.ptf-card-visual::before` shimmer (mismo contexto, antes en source)
- `.ptf-card-img` z-index 1 (por encima de shimmer)
- `.ptf-card-overlay` z-index 2 (hover text)

**NO TOCAR:**
- `FIT_TOLERANCE = 0.18` — calibrado para distinguir piezas alargadas de cuadradas
- `padding: 10%` en `.ptf-card-visual--contain .ptf-card-img` — da respiro visual, no saturar
- El backdrop usa la MISMA url de imagen (`piece.image`) — no pre-generar thumbnails
- No volver a `vignette` / radial-gradient (falló previamente)
- No volver a `contain` puro sin backdrop (rectángulo blanco)

### 2026-04-18 — Revert: eliminar sistema adaptive fit del portfolio (commit `3aff9ed`)
**Archivos:** `js/components/lookbook.js`, `css/style.css`

**Motivo:** El sistema de backdrop borroso producía halos grises/verdes feos alrededor de las piezas. El usuario resolvió el problema de raíz subiendo fotos en PNG con fondo transparente, haciendo innecesario el sistema adaptativo.

**Eliminado de lookbook.js:**
- `applyAdaptiveFit()` y constante `FIT_TOLERANCE`
- `ptf-card-backdrop` div del HTML de cada card
- Clase `.ptf-card-visual--contain`
- Restaurado `setupShimmer()` simple sin lógica adaptativa

**Eliminado de style.css:**
- Reglas `.ptf-card-backdrop` (blur, scale, opacity)
- Reglas `.ptf-card-visual--contain` (padding, object-fit)
- Reglas de shimmer para `.ptf-card-visual--contain`

**NOTA:** La sección anterior de este archivo (Portfolio V9 adaptive fit) es ahora histórica. El código fue revertido completamente.

### 2026-04-18 — Featured V3: implementación inicial Claude Design Variant C (commit `960570c`)
**Archivos:** `js/components/featured.js`, `css/style.css`

**Descripción:** Primera implementación de las tarjetas de la sección "Piezas que definen momentos" basada en el diseño Claude Design Variant C (Asimétrico), adaptada al tema oscuro esmeralda.

**Características implementadas:**
- Grid asimétrico: `grid-template-columns: 1.15fr 0.95fr 1.1fr`
- Offsets verticales: `offset-up`, `offset-down`, `offset-mid` alternando cards
- Numerales editoriales: `nº 01`, `nº 02` en serif italic
- Gold shimmer border: `::before` con gradient animado `@keyframes feat-goldSweep`
- Inner glow: `::after` con `radial-gradient` siguiendo mouse via `--mx`/`--my`
- Shine sweep: diagonal gold flash across image on hover
- Badge, wishlist/cart buttons, spec grid 2×2, CTA con botón primary + link
- Imagen con grayscale parcial que se remueve en hover
- Responsive: 3→2→1 columnas

### 2026-04-18 — Featured V3.1: fix badge, contraste, spec grid, CTA (commit `43c7177`)
**Archivos:** `js/components/featured.js`, `css/style.css`

**Problemas corregidos:**
1. **Badge roto** — Se veía como rectángulo vertical oscuro sobre imagen oscura. Cambiado a gold gradient bg (`#e8c086→#aa8752`), texto oscuro, `white-space: nowrap`, pill shape.
2. **Texto ilegible** — Colores demasiado similares al fondo. piece-name subido a `#f5f0e8`, spec-lbl opacity de 0.4→0.55, spec-val a white `#f5f0e8` con weight 600.
3. **Consultar invisible** — Ghost button transparente sobre fondo oscuro. Cambiado a text link (`.piece-btn-link`) con color gold y flecha SVG siempre visible.
4. **Descripción en MAYÚSCULAS** — Base CSS `.piece-desc { text-transform: uppercase }` en línea 1085. Override con `text-transform: none !important` en V7. Plus `normCase()` en JS para convertir ALL-CAPS de Firestore a sentence case.
5. **Badge/num overlap** — `piece-num` movido de top-left a `bottom:18px, right:20px`.
6. **Actions overlap** — Movido de `top:52px, left:14px` a `top:8px, right:8px`.

### 2026-04-19 — Featured V4: 3D tilt, magnetic buttons, hover reveal, scroll entrance (commit `d335387`)
**Archivos:** `js/components/featured.js`, `css/style.css`

**Descripción:** Reimplementación completa de la sección Featured basada en Claude Design V2 potentiated. Resuelve los 3 problemas pendientes del usuario y agrega tecnología visual premium.

**Cambios en featured.js:**
- **Eliminado:** `OFFSETS`, `piece-num`, clases `offset-*`, `animate-on-scroll`, `tallClass`, `piece-desc`, `piece-top-row`, `piece-btn-link`
- **Nuevo HTML:**
  - `.piece-media` reemplaza `.piece-image-wrapper` (link wrapper para imagen)
  - `.piece-reveal` dentro de la imagen — descripción que sube desde abajo en hover
  - `.piece-meta-row` reemplaza `.piece-top-row`
  - `.piece-btn.ghost` reemplaza `.piece-btn-link` — dos botones side-by-side
  - `.spec-cell.has-border` para separadores verticales en spec grid
- **3D Tilt:** mousemove calcula `rotateX`/`rotateY` con `perspective(1000px)` + `translateZ(6px)`. Clase `.is-tilting` desactiva CSS transition de transform durante tracking activo.
- **Magnetic buttons:** `--bx`/`--by` en `.piece-btn` para radial gold gradient que sigue el cursor.
- **Scroll reveal:** IntersectionObserver con stagger delay (`i * 0.12s`). Solo desktop (no touch, no reduced-motion). Inline styles se limpian post-animación para evitar conflicto con tilt.
- **getTopSpecs:** ahora retorna máx 3 specs (antes 4) para grid de 3 columnas.

**Cambios en CSS (Featured V7 block, líneas ~11152-11680):**
- **Readability fix:**
  - `.piece-name`: color `#ffffff` (antes `#f5f0e8`)
  - `.spec-val`: color `#ffffff`, `font-family: var(--font-display)`, `font-size: 16px`
  - `.spec-lbl`: color `rgba(232,192,134,0.65)` (antes 0.55)
  - `.piece-reveal p`: color `rgba(245,240,232,0.88)` con line-clamp 3
- **Spacing fix:**
  - Grid gap: `18px` (antes `28px`)
  - Offsets eliminados completamente
  - Imagen uniforme `aspect-ratio: 4/5` (no más alternancia tall/square)
  - Responsive gap: `14px` en tablet/mobile
- **Numbering removed:** sin `.piece-num` — elemento y CSS eliminados
- **Spec grid:** 3 columnas con `border-left` gold como separador (antes 2×2 con dark cells)
- **CTA row:** `flex-direction: row` con dos botones `flex: 1` (antes column con primary + link)
- **Magnetic buttons CSS:**
  - `.piece-btn.primary::before` — `radial-gradient(circle 80px at --bx --by, white 30%, transparent)` aparece en hover
  - `.piece-btn.ghost::before` — `radial-gradient(circle 80px at --bx --by, gold 20%, transparent)` aparece en hover
  - `.piece-btn.primary:hover` — `translateY(-1px)` + gold shadow
  - `.piece-btn.ghost:hover` — border brightens + text lightens
- **3D tilt CSS:**
  - `.piece-card` base: `transform-style: preserve-3d`, CSS transition incluye transform
  - `.piece-card.is-tilting`: CSS transition EXCLUYE transform (JS controla directo)
  - Mouse leave → JS limpia inline transform → CSS transition suaviza regreso
- **Hover reveal:**
  - `.piece-reveal`: `position: absolute`, bottom-anchored, gradient `rgba(5,10,7,0.92)→transparent`
  - `transform: translateY(100%)` → `translateY(0)` en hover
  - Mobile/touch: siempre visible (`transform: translateY(0)`)

**CSS Eliminado (~554 líneas reemplazadas por ~530 nuevas):**
- `.piece-num` y hover
- `.piece-image-wrapper` y `.piece-image-wrapper.tall`
- `.piece-top-row`
- `.piece-desc`
- `.piece-btn-link` y hover
- `.piece-float-meta`
- Offset rules (`.offset-up`, `.offset-down`, `.offset-mid`)
- Vignette `piece-image-wrapper::after`
- Grayscale image filter

**NO TOCAR (reglas Featured V4):**
- Los estilos `.featured-v7 .piece-*` en style.css (líneas ~11152-11680) son el diseño activo
- `renderFeaturedPieces()` es la interfaz pública — `app.js` la llama
- La clase `.is-tilting` es crítica: sin ella, el CSS transition de transform interfiere con el tracking 3D
- Scroll reveal usa inline styles temporales que se limpian post-animación — no mover a CSS classes
- `getTopSpecs` retorna máx 3 specs — no subir a 4 (el grid es de 3 columnas)
- Magnetic button vars `--bx`/`--by` se setean en mousemove del container — no mover a card-level
- `@keyframes feat-goldSweep` sigue dentro del bloque Featured V7 — no mover

### 2026-04-23 — Featured V4.1: micro-cirugía de tarjetas (commit `02c4d41`)
**Archivos:** `js/components/featured.js`, `css/style.css`

**8 fixes aplicados:**
1. **Card bg más transparente** — `rgba(8,12,9,0.65)` → `rgba(10,18,12,0.35)` para que el emerald marble del body se vea a través, como en portfolio.
2. **Badge glassmorphism** — Cambiado de `linear-gradient(135deg, #e8c086, #aa8752)` (gold sólido) a `rgba(200,169,110,0.15)` + `backdrop-filter: blur(12px)` + `border: 1px solid rgba(200,169,110,0.25)` + `color: #e8c086`. Mismo estilo que `.ptf-card-badge` del portfolio.
3. **Descripción siempre visible** — Eliminado `.piece-reveal` (hover slide-up). Descripción ahora es `<p class="piece-desc">` dentro de `.piece-info`, siempre visible, con `line-clamp: 3` y color `rgba(245,240,232,0.68)`.
4. **Nombre en capitalize** — Agregado `text-transform: capitalize !important` a `.featured-v7 .piece-name` para override del base `text-transform: uppercase` (línea 1075 de style.css).
5. **Info glass bg** — `.featured-v7 .piece-info` ahora tiene `background: rgba(10,20,14,0.55)` + `backdrop-filter: blur(14px)` para override del base `linear-gradient(to bottom, var(--champagne), var(--ivory))` (línea 1066). "Efecto agua" glassmorphism.
6. **Contraste specs** — Resuelto por fix #5: el fondo glass oscuro hace que el texto blanco (`#ffffff`) de `.spec-val` sea legible.
7. **Ghost button hover** — Agregado `background: rgba(200,169,110,0.1)` en hover para que el botón "Consultar" no desaparezca contra el fondo.
8. **Buttons overlap** — Agregado `position: static !important` a `.featured-v7 .piece-wishlist-btn, .piece-cart-btn` para override del base `position: absolute; top: 10px; right: 10px` (línea 1630) que ponía ambos botones encima uno del otro ignorando el flex column layout de `.piece-actions`.

**Eliminado de CSS:** Bloque `.piece-reveal` completo (~30 líneas), referencias en responsive (mobile 620px) y accessibility (reduced-motion, hover:none).

**Root causes de los bugs:**
- Base CSS sin namespace (`.piece-info`, `.piece-name`, `.piece-wishlist-btn`) tiene reglas con colores claros (ivory, champagne, black) y `position: absolute` que no eran overrideadas por V7 (faltaban `!important` + las propiedades específicas).
- V7 usaba doble clase `.featured-v7 .piece-*` pero no cubría TODAS las propiedades del base → las no-overrideadas sangraban.

### 2026-04-24 — Featured V4.2 + Portfolio polish: simetría + Aqua Liquid Glass
**Archivos:** `css/style.css`

**Problemas reportados:**
1. Fondo de `.piece-media` era negro casi opaco — rompía con la estética del portfolio (aqua).
2. Las tarjetas tenían alturas distintas (la central más alta por wrap de "Superior – AA" en CALIDAD).
3. Pedido general: elevar polish con estética "Liquid Glass" tipo iOS 26, sin reestructurar.

**Fixes de simetría (Featured V4.2):**
- `.featured-v7 .featured-grid { align-items: stretch }` (antes `start`) — las cards ahora se estiran al alto común.
- `.featured-v7 .piece-card { display: flex; flex-direction: column; height: 100% }` — la card ahora es un contenedor flex vertical.
- `.featured-v7 .piece-info { flex: 1 1 auto; display: flex; flex-direction: column }` — el info crece para llenar el espacio restante.
- `.featured-v7 .piece-cta-row { margin-top: auto }` — los botones CTA quedan fijos al fondo aunque la descripción sea corta.
- `.featured-v7 .spec-val { white-space: nowrap; overflow: hidden; text-overflow: ellipsis }` — evita el wrap de valores largos como "Superior – AA" que rompía la simetría.

**Fixes de Aqua/Liquid Glass (Featured V4.2):**
- `.featured-v7 .piece-media` — Cambio de `rgba(5,10,7,0.8)` (negro casi opaco) a multi-capa aqua: dos radial-gradients (tinte esmeralda + accent dorado) sobre un linear-gradient emerald translúcido + `backdrop-filter: blur(20px) saturate(1.35)`. El marble del body se ve a través, creando profundidad.
- `.featured-v7 .piece-card` — Highlight superior especular via `box-shadow: inset 0 1px 0 rgba(255,255,255,0.06)` + sombra inferior inset sutil. En hover: highlight sube a 0.1 opacity + gold glow 40px ambient.
- `.featured-v7 .piece-info` — Gradient vertical con saturate 1.3 en el backdrop-filter + highlight superior inset — "efecto agua" amplificado.

**Retoques paralelos Portfolio V5:**
- `.ptf-card` — Agregado mismo patrón de highlight especular superior + shadow inferior inset. Hover añade ambient glow gold 30px + gold inset glow 40px.
- `.ptf-card-badge` — `backdrop-filter` subido de `blur(12px)` a `blur(14px) saturate(1.4)`. Agregado `box-shadow` con highlight especular superior + drop shadow sutil.

**Notas Liquid Glass:**
- Sin librerías externas — todo CSS nativo (`backdrop-filter`, `box-shadow` inset, multi-gradientes).
- `saturate()` en backdrop-filter es clave para el look "aqua" — amplifica los colores del fondo detrás del blur, dando ese feel iridiscente de iOS 26.
- Los highlights superiores (`inset 0 1px 0 rgba(255,255,255,0.x)`) simulan el borde brillante del glass refractivo.

**NO TOCAR:**
- El `saturate(1.35)` en `.piece-media` backdrop-filter es el punto exacto — subir a 1.5+ introduce tinte verde excesivo, bajar a 1.1 pierde el "aqua".
- Los spec values DEBEN tener `nowrap + ellipsis` — sin esto vuelve el bug de simetría.
- `height: 100%` en `.piece-card` requiere `align-items: stretch` en el grid — ambos van juntos, no quitar uno sin el otro.

### 2026-04-24 — Aurora Layer: fondo sitewide animado (Liquid Glass)
**Archivos:** `css/style.css`

**Cambio:** El fondo marble esmeralda estático ahora tiene una capa aurora animada encima — 4 radial gradients esmeralda/dorado que derivan lentamente (120s por ciclo) dando el feel "el fondo respira" de iOS 26 Liquid Glass.

**Implementación:**
- `body::before` (marble, ~línea 107) — z-index cambiado de `-1` a `-2` para dejar espacio al aurora encima.
- Nuevo `html::before` con z-index `-1` — capa aurora fija, oversize (`150% × 150%`, `top: -25%; left: -25%`) para no revelar bordes durante el drift.
- Animación `@keyframes aurora-drift`: translate3d + scale sutil en 4 puntos (0/25/50/75/100%). `ease-in-out` + 120s = movimiento orgánico casi imperceptible.
- 4 radial gradients: esmeralda medio (0.22 opacity), gold accent (0.08), emerald profundo (0.18), emerald brillante (0.14). Sin mix-blend-mode — alpha blend natural para preservar los tonos del marble.

**Performance:**
- `prefers-reduced-motion: reduce` → `animation: none` (se queda estático pero visible).
- `pointer: coarse` (touch devices) → `animation-duration: 240s` + `opacity: 0.7` (ahorra batería y GPU en móvil).
- `will-change: transform` — GPU compositing layer dedicado, no repinta el resto de la página.
- `pointer-events: none` — no intercepta eventos de touch/click.

**Stacking context final del fondo:**
- `body` background-color `#030806` (base)
- `body::before` z-index `-2` → marble estático detallado
- `html::before` z-index `-1` → aurora animado (encima del marble)
- Contenido del sitio z-index `auto` (0+) → encima de todo el fondo
- `body::after` z-index `+2` → film grain (solo desktop, oculto en touch)

**NO TOCAR:**
- El z-index `-2` del marble es crítico — si vuelve a `-1` el aurora queda detrás (invisible).
- La oversize del aurora layer (`150% × 150%`, `-25%` offset) es necesaria para que el `scale(1.05)` del keyframe no revele el fondo negro del body. No reducir.
- Sin `mix-blend-mode` — probamos `screen` y quemaba la marble. Alpha blend natural es la decisión correcta.
- Las opacidades de los 4 radial gradients (0.22, 0.08, 0.18, 0.14) están calibradas para ser perceptibles sin dominar — no subirlas.

### 2026-04-24 — Aqua Liquid Glass: tratamiento sitewide a todas las secciones
**Archivos:** `css/style.css`

**Secciones transformadas:**

| Sección | Antes | Después |
|---|---|---|
| **Header (scrolled)** | `rgba(5,9,8,0.95)` opaco, blur 12px | `rgba(10,20,14,0.55)` glass, blur 24px saturate 1.3 |
| **Dropdown menus** | `rgba(10,10,10,0.95)` opaco, border-radius | Glass blur 24px saturate 1.3, sharp corners, specular |
| **Mobile menu** | Opaque gradient `#0e1f15→#132b1e` | `rgba(10,20,14,0.75)` blur 30px saturate 1.4 |
| **Footer** | `rgba(5,9,8,0.8)` semi-opaco | Glass blur 20px saturate 1.25 + specular highlight |
| **Brand Statement** | `rgba(10,26,15,0.35)` sin glass | Glass blur 16px saturate 1.2 |
| **Collections panels** | `rgba(8,14,10,0.5)` blur 8px | `rgba(10,20,14,0.35)` blur 18px saturate 1.3 + specular |
| **Collections body** | `rgba(6,12,8,0.65)` opaco | Glass blur 14px saturate 1.2 + specular |
| **Collections img area** | `rgba(5,10,7,0.6)` plano | Aqua radial gradient + emerald translúcido |
| **Journal featured card** | `rgba(10,16,12,0.4)` sin glass | Glass blur 16px saturate 1.3 + specular + gold ambient hover |
| **Journal body** | Sin glass | Glass blur 14px saturate 1.2 |
| **About collage frame** | Gold border `rgba(201,169,110,0.12)` | White subtle `rgba(255,255,255,0.06)` — no more gold fade |
| **About stats** | `rgba(5,10,7,0.3)` plano | Glass blur 12px saturate 1.2 + specular |
| **CTA inner** | `rgba(10,26,15,0.4)` con blur 16px | Refinado: blur 20px saturate 1.3 + specular highlight |

**Patrón unificado Aqua Liquid Glass:**
- `backdrop-filter: blur(Npx) saturate(1.2-1.4)` — el `saturate` amplifica los colores del marble/aurora detrás, creando el "aqua" iridiscente.
- `box-shadow: inset 0 1px 0 rgba(255,255,255,0.04-0.06)` — highlight especular superior que simula el borde brillante del glass.
- Backgrounds semi-transparentes `rgba(10,20,14, 0.25-0.55)` — dejan pasar el marble + aurora.
- Gold ambient glow en hover (`0 0 25-30px rgba(200,169,110,0.06-0.08)`).

**NO TOCAR:**
- Los valores de `saturate()` están calibrados por sección. El header usa 1.3 (bastante transparente), el mobile menu 1.4 (necesita más vibración por ser fullscreen).
- El `blur(30px)` del mobile menu es intencionalmente alto — el panel es fullscreen y necesita más difuminado para verse glass sobre cualquier contenido.
- Los `@supports not (backdrop-filter)` fallbacks usan opacidades más altas (0.85+) — no bajarlos.

### 2026-04-24 — Aqua Liquid Glass: unificación sitewide + fixes index + limpieza legacy
**Archivos:** `css/style.css`, `CLAUDE.md`

**1. Fixes específicos del index (commit `f947bb7`):**
- Frame decorativo gold del About image eliminado (`display: none` en `.about-teaser-collage-frame` y `.about-v7` versión) — el usuario reportó que "opacaba" la imagen.
- Fondo translúcido del collage removido (`background: transparent`) — imagen queda crystal clear.
- Glow esmeralda decorativo en esquina inferior del about removido — el aurora global ya crea profundidad.
- `.animate-on-scroll`: duración de 0.45s → 0.35s con easing Apple `cubic-bezier(0.32, 0.72, 0, 1)` + `translateY(12px)` (antes 18px). Sensación premium-fast.

**2. Aqua Unified Theme Layer — nuevo bloque al final del archivo:**
Tokens introducidos en `:root`:
```
--aqua-bg           rgba(10, 20, 14, 0.42)
--aqua-bg-strong    rgba(10, 20, 14, 0.58)
--aqua-bg-soft      rgba(14, 28, 20, 0.28)
--aqua-blur         blur(18px) saturate(1.35)
--aqua-blur-lg      blur(24px) saturate(1.4)
--aqua-highlight    inset 0 1px 0 rgba(255, 255, 255, 0.06)
--aqua-border       1px solid rgba(200, 169, 110, 0.12)
--aqua-border-hover 1px solid rgba(200, 169, 110, 0.28)
--aqua-glow-hover   0 0 30px rgba(200, 169, 110, 0.08)
```

Aplicado a TODAS las superficies restantes de páginas secundarias:
- `.page-hero` (nosotros, servicios, colecciones, catalog pages, pieza, cart, wishlist, journal, entrada, contacto)
- `.catalog-filters` + `.catalog-filter-btn` (anillos, argollas, topos-aretes, dijes-colgantes, colecciones)
- `.catalog-collection-card` (colecciones.html)
- `.contact-channel` (contacto.html)
- `.review-card` + `.related-card` + `.pieza-main-image` + `.pieza-info` + `.pieza-guarantees` (pieza.html)
- `.cart-card` + `.cart-summary` + `.cart-inquiry-note` (carrito.html)
- `.wishlist-empty` + `.wishlist-actions` (lista-deseos.html)
- `.journal-hero-card` + `.journal-grid-card` (journal.html)
- `.nosotros-section` + `.team-card` + `.brand-story-card`
- `.svc-card` + `.svc-process-step` (servicios.html)
- Form inputs: text, email, tel, search, password, textarea, select (contacto, checkout, search overlay)

Performance:
- `@media (pointer: coarse)`: reduce blur a 10px saturate 1.25 para ahorrar GPU en móvil.
- `@media (prefers-reduced-motion: reduce)`: remueve `transform` y `transition` de hovers.

**3. Limpieza legacy — 596 líneas eliminadas:**
Bloques removidos (líneas originales 8867-9462):
- `INDEX REDESIGN V4 — EMERALD MARBLE BACKGROUND SYSTEM` (~145 líneas) — Kill hero photo + set emerald bg. V7 lo reemplazó.
- `INDEX REDESIGN V5 — HERO + HEADER EDITORIAL` (~201 líneas) — Restore hero photo + split layout. V7 lo reemplazó.
- `INDEX REDESIGN V6 — COLLECTIONS: TARJETAS EDITORIALES` (~248 líneas) — Tarjetas verticales collections. V7 lo reemplazó.

**Verificación previa a eliminación:**
- `.hero` selectors: solo se usan en `index.html` (otras páginas usan `.page-hero`).
- `.collections` selectors: solo en `index.html` (`colecciones.html` usa `.catalog-collection-card`).
- `.services` V6 selectors: solo en `index.html` (`servicios.html` usa `.svc-card`).
- `.hero-badge` NO fue tocado — sigue existiendo para catálogo.

**CSS total:** 14,596 → 14,000 líneas (4% reducción sin afectar visual).

**Futuras tuneadas:**
- Para ajustar la apariencia aqua en TODO el sitio, modificar solo los tokens `--aqua-*` en `:root` del bloque final — propaga automáticamente a todas las páginas.
- Los tokens son la fuente de verdad. Cualquier componente nuevo debe referenciarlos vía `var(--aqua-*)` en vez de hardcodear valores.

**NO TOCAR:**
- Los tokens `--aqua-*` en `:root` del bloque final son el sistema unificado — nunca duplicar sus valores inline.
- El bloque Aqua Unified está al final del archivo (después de "Responsive servicios") — debe mantenerse allí para ganar en source order sin necesidad de especificidad elevada.
- `transparent !important` en `.about-v7 .about-teaser-collage` background es crítico — devuelve el velo oscuro si se toca.

---

## 2026-04-26 — REDISEÑO LIQUID GLASS iOS AQUA (Fases 1-10)

**Source design:** `bersaglio.html` (handoff de Claude Design — `https://api.anthropic.com/v1/design/h/UqqQSXNapxuUvUhGsP-yvw`)
**Branch original:** `redesign-liquid-glass` (snapshot React independiente, no se mergea)
**Branch de implementación:** `claude/review-liquid-glass-pr-Aciap` (mergeado a main vía PRs #130-#139)
**Commits:** 11 (10 fases + 1 fix)

### Decisión arquitectónica

**Cambio fundamental:** flip total del tema de **dark emerald V7 → light pearl Liquid Glass iOS 26**.

Estética nueva:
- **Cero negro puro** — todos los `--black*` tokens remappean a `--bj-ink-emerald` (`oklch(18% 0.05 155)`)
- **Fondo pearl** — `body { background: oklch(98% 0.005 90) }` con aurora pearl/emerald/gold + capa `.bj-world` con blobs animados
- **Glassmorphism iOS 26** — `backdrop-filter: blur(28px) saturate(180%)` con highlight pinlight superior + iridescent rim conic-gradient
- **Botones aqua gel** — `.btn-aqua` con linear-gradient + pinlight + 3D lift en hover
- **Tipografía**: Fraunces (display) + Inter (UI) + JetBrains Mono (numeric) — los nuevos tokens son `--font-display-aqua`, `--font-ui-aqua`, `--font-mono`. Los legacy Cormorant + Montserrat siguen cargados pero no usados en el nuevo theme.

### Arquitectura final

#### CSS — single source of truth
| Archivo | Líneas | Rol |
|---|---|---|
| `css/style.css` | 12,504 | **Solo estructura** (layout, grid, animations, JS hooks). Sin colores oscuros activos. V2/V3/V4/V5/V6 legacy eliminados. |
| `css/liquid-glass.css` | 3,696 | **Único source visual.** Tokens + primitives + overrides + componentes específicos del nuevo diseño. Cargado AFTER `style.css` en cada `<link>` de las 17 páginas públicas. |

#### JS — componentes refactorizados
| Archivo | Líneas | Rol |
|---|---|---|
| `js/components/piece-card.js` | ~140 | **Renderer compartido**. `renderPieceCardHTML(piece)` + `wirePieceCardActions(container)`. Usado por 6 surfaces: home featured, colecciones overview, 4 catálogos individuales, pieza related, carrito, wishlist. Single source of truth para el markup de cards. |
| `js/components/categories-dock.js` | ~95 | **Dock iOS-style en home**. Lee `db.getCollections()` + cuenta live via `db.getByCollection(slug).length`. Suscribe a `db.onChange()`. Mapeo cosmético `slug → glyph + hue` (anillos ◈ 155, topos ◉ 85, etc.). |
| `js/components/featured.js` | ~35 | Slim wrapper que delega a `renderPieceCardHTML` + `wirePieceCardActions`. Antes ~140 líneas. |
| `snippets/header.html` | ~150 | **Header pill flotante** — `.header.header-aqua` shell + `.header-aqua-pill` glass-iridescent + nav-pills + cart/wishlist badges + mobile drawer |

#### JS — código eliminado (~2,400 líneas)
- `js/components/lookbook.js` — Portfolio V5 slider, no en diseño
- `js/effects/hscroll.js` — `initCollectionsHScroll`, target era `#collections-track-outer` que se eliminó
- `js/canvas/particles.js` — solo lo importaba `hero-animation.js`
- `js/hero-animation.js` — `initHero` para markup V7 que se eliminó

### Las 10 fases (commits)

| Fase | Commit | Descripción | Archivos |
|---|---|---|---|
| **1** | `945810d` | Limpieza HTML/JS muerto del home: `<section.lookbook-v7>`, `<section.brand-statement>` legacy, `<section.collections-v7>`, `<section.about-teaser>`. Removidos imports + safeRender de `renderLookbook`, `renderCollections`, `initHero`, `initCollectionsHScroll`, `initBannerKenBurns` en `app.js`. | `index.html`, `app.js` |
| **2** | `9904b49` | `categories-dock.js` con count live de Firestore. HTML del dock convertido en `<div id="categories-dock">` rellenado por JS. Suscripción a `db.onChange()`. | `categories-dock.js`, `index.html`, `app.js` |
| **3** | `b1cbba4` | Featured cards rewrite: glass-iridescent + image 4/5 + badge chip + wishlist+cart top-right + eyebrow (collection name live) + título Fraunces + meta `stones · metal` + price+arrow. Eliminados: 3D tilt, magnetic buttons, hover reveal, scroll entrance. | `featured.js`, `liquid-glass.css` |
| **4** | `d00f94c` | Header pill flotante (top:18px, max 1080px, glass-iridescent). Nav-pills con active emerald gradient. Dropdowns glass blur 28px. Mobile drawer fullscreen pearl. Todos los IDs preservados (`#header`, `#hamburger`, `#navMenu`, `#navMenuClose`, `#wa-nav`, `#wa-nav-mobile`, `#wishlistCount`, `#cartCount`, `#search-trigger`). | `snippets/header.html`, `liquid-glass.css` |
| **5** | `8af3474` | `piece-card.js` shared renderer extraído. Catálogos (anillos/argollas/topos/dijes/colecciones) con hero editorial (breadcrumb glass-pill + section-eyebrow + display title con italic emerald-text + lead) + CTA aqua. CSS scope loosened: `.featured-v7 .piece-*` → `.piece-*` para que aplique en todas las grids. | 5 catalog HTMLs + `coleccion.js`, `colecciones.js`, `featured.js` (refactor), `piece-card.js` (nuevo), `liquid-glass.css` |
| **6** | `1dd9847` | Pieza detail aqua: gallery glass-iridescent (aspect 4/5) + thumbs grid + glass info card + 4-cell specs glass + price row mono + 3-button CTA group (WhatsApp emerald + cart toggle + wishlist 48×48). Related section usa `renderPieceCardHTML`. | `pieza.js`, `liquid-glass.css` |
| **7** | `e18d21c` | Carrito + wishlist. Cards delegan a `renderPieceCardHTML`. `wirePieceCardActions` reemplaza wire-up manual. Heros editoriales con breadcrumb glass-pill. | `carrito.html`, `lista-deseos.html`, `cart-page.js`, `wishlist-page.js` |
| **8** | `3092661` | Contacto: glass form con 5 motivo pills (Esmeraldas / Diseño a medida / Asesoría privada / Garantía / Otro) como radios estilizados. Pre-selected: "Diseño a medida". Hidden `#contactInterest` mirror sync para preservar payload backend. Form-fields aqua con label-above-input. Submit `btn-aqua-emerald`. | `contacto.html`, `liquid-glass.css` |
| **9** | `29d15a3` | Heros aqua + CTAs en nosotros, servicios, journal, gracias, terminos, privacidad. `entrada.html` skipped (renderiza dynamic). | 6 HTMLs |
| **10** | `6b3ef5f` | Mobile hero responsive (floating cards stack compact ≤620px). Preloader pearl (gradient text contrastado). Eliminados 4 archivos JS muertos. Removida 1 inline style oscura en `nosotros.html`. | `liquid-glass.css`, `nosotros.html`, JS deletions |
| extra | `00aa557` | Fix: wishlist page wirea ahora también el cart button (era no-op desde Phase 7). | `wishlist-page.js` |

### Tokens canónicos (en `:root` de liquid-glass.css)

```css
/* Brand palette (oklch perceptually uniform) */
--bj-emerald-{100..900}     /* 100=oklch(97% 0.02 150), 900=oklch(28% 0.08 155) */
--bj-gold-{100..900}        /* 100=oklch(96% 0.04 90),  900=oklch(55% 0.12 80) */
--bj-pearl                  /* oklch(98% 0.005 90)  — body bg */
--bj-ivory                  /* oklch(96% 0.012 85) */
--bj-cream                  /* oklch(94% 0.018 82) */
--bj-mist                   /* oklch(90% 0.01 150) */
--bj-ink-emerald            /* oklch(18% 0.05 155) — "negro" de marca */
--bj-ink-soft               /* oklch(32% 0.03 155) */
--bj-ink-mute               /* oklch(50% 0.02 155) */

/* Liquid Glass tokens */
--glass-blur:    28px;
--glass-saturate: 180%;
--glass-tint:    oklch(96% 0.02 150 / 0.55);
--glass-border:  1px solid oklch(100% 0 0 / 0.5);
--glass-shadow:  /* multi-layer inset highlight + emerald drop shadow */
--pinlight:      radial-gradient(ellipse 60% 50% at 50% 0%, white 95% / 0%, transparent 60%);
--iridescent-rim: conic-gradient(from 180deg, emerald → gold → champagne → sapphire → emerald);

/* Aqua tokens (existing system, flipped to light) */
--aqua-bg:        oklch(96% 0.02 150 / 0.55);
--aqua-bg-strong: oklch(94% 0.03 150 / 0.72);
--aqua-bg-soft:   oklch(98% 0.005 90 / 0.35);
--aqua-blur:      blur(28px) saturate(180%);
--aqua-blur-lg:   blur(32px) saturate(200%);
--aqua-highlight: inset 0 1px 0 oklch(100% 0 0 / 0.85);
--aqua-border:    1px solid oklch(100% 0 0 / 0.5);
--aqua-border-hover: 1px solid oklch(82% 0.14 85 / 0.45);
--aqua-glow-hover:   0 0 30px oklch(82% 0.14 85 / 0.18);

/* Override de tokens legacy (mantienen compat con style.css) */
--text-primary    → var(--bj-ink-emerald)
--text-secondary  → var(--bj-ink-soft)
--text-on-dark    → var(--bj-ink-emerald)  /* invertido: ahora es ink */
--black           → var(--bj-ink-emerald)
--black-deep      → var(--bj-ink-emerald)
--black-carbon    → var(--bj-ink-emerald)
--ivory           → var(--bj-pearl)
--emerald-deep    → var(--bj-emerald-900)

/* Fonts */
--font-display-aqua: "Fraunces", "Cormorant Garamond", Georgia, serif;
--font-ui-aqua:      "Inter", -apple-system, "SF Pro Text", sans-serif;
--font-mono:         "JetBrains Mono", "SF Mono", ui-monospace, Menlo, monospace;
```

### Primitives reutilizables

```html
<!-- Glass card base -->
<div class="glass">…</div>                       <!-- radius 22px, blur 28px, pinlight top -->
<div class="glass glass-lg">…</div>              <!-- radius 32px + larger shadow -->
<div class="glass glass-pill">…</div>            <!-- radius 999px -->
<div class="glass glass-iridescent">…</div>      <!-- + conic gradient rim ::after -->
<div class="glass glass-emerald">…</div>         <!-- emerald linear-gradient bg + white text -->

<!-- Aqua gel button -->
<a class="btn-aqua">Default</a>                  <!-- white-translucent gel + emerald text -->
<a class="btn-aqua btn-aqua-emerald">Primary</a> <!-- emerald gradient + white text -->
<a class="btn-aqua btn-aqua-gold">Gold</a>       <!-- gold gradient + dark text -->

<!-- Chip pill (badges, tags) -->
<span class="chip"><span class="chip-dot"></span>Texto</span>

<!-- Type helpers -->
<span class="emerald-text">italic emerald gradient text</span>
<span class="gold-text">gold gradient text</span>
<span class="mono">$ 12.400.000</span>           <!-- JetBrains Mono tabular-nums -->
```

### Sync admin → público (invariantes)

Cada surface pública con data dinámica suscribe a `db.onChange()`:

| Página | Listener | Re-renders |
|---|---|---|
| `index.html` (`app.js`) | `renderAllSections(' (realtime)')` | categories dock + featured + journal + services |
| `pieza.html` (`pieza.js`) | `handleRealtimeUpdate(piece)` | pieza completa + related |
| `colecciones.html` (`colecciones.js`) | inline arrow | grid colecciones + filtros |
| `anillos/argollas/topos/dijes` (`coleccion.js`) | inline arrow | hero + grid filtrado |
| `carrito.html` (`cart-page.js`) | `renderCart()` | items + summary |
| `lista-deseos.html` (`wishlist-page.js`) | `renderWishlist()` | grid + count |

**Schema Firestore intacto:** ningún campo renombrado o eliminado. Optimistic locking + audit log + version conflicts (Fases 1-3 del admin de 2026-04-14) siguen funcionando sin cambios.

### Páginas alcanzadas

**Públicas (17, todas con liquid-glass.css):**
- `index.html` — hero 3D parallax + marquee + categories dock + featured + editorial split + atelier + Cartagena CTA
- `colecciones.html`, `anillos.html`, `argollas.html`, `topos-aretes.html`, `dijes-colgantes.html` — heros editoriales + cards aqua
- `pieza.html` — gallery + glass info card + specs grid + 3-button CTA + related
- `carrito.html`, `lista-deseos.html` — cards aqua + heros editoriales
- `contacto.html` — glass form + motivo pills
- `nosotros.html`, `servicios.html` — heros editoriales + CTAs aqua
- `journal.html`, `entrada.html` — heros aqua (entrada renderiza dinámico)
- `gracias.html`, `terminos.html`, `privacidad.html` — heros aqua

**Admin (intactas):** `admin.html`, `admin-login.html`, `admin-piezas.html`, `admin-colecciones.html`, `admin-consultas.html`, `admin-usuarios.html` — siguen con `admin.css` propio. Decisión consciente: el panel admin tiene su propia estética dark editorial separada.

### REGLAS — NO TOCAR

1. **`liquid-glass.css` es el único source de visuales.** No agregar reglas de color/bg/typography en `style.css`. Si necesitas extender, hazlo al final de `liquid-glass.css`.
2. **Tokens en `:root` del top de `liquid-glass.css`** son la fuente de verdad. Nunca hardcodear `oklch(...)` o `rgba(...)` inline en componentes — siempre referenciar `var(--bj-*)` o `var(--aqua-*)`.
3. **`renderPieceCardHTML(piece)`** es el único renderer de cards. Cualquier nueva página que muestre piezas DEBE usar este helper + `wirePieceCardActions(container)`. NO duplicar markup.
4. **`db.onChange()` es obligatorio** en cada página que muestre data dinámica. Sin él, el admin sync se rompe.
5. **IDs del header son contrato con `js/components.js`.** Si reescribes `snippets/header.html`, preserva: `#header`, `#hamburger`, `#navMenu`, `#navMenuClose`, `#wa-nav`, `#wa-nav-mobile`, `#wishlistCount`, `#cartCount`, `#search-trigger`, clase `.nav-link[href]` para active state, clase `.dropdown-toggle` para mobile accordion.
6. **Schema Firestore intacto.** No renombrar ni eliminar campos de `pieces`, `collections`, `journal`, `consultas`, `system/meta`. Si una nueva sección necesita un dato derivado (ej. count por categoría), calcularlo on-the-fly via `db.getByCollection(slug).length`, NO agregar campo nuevo.
7. **Header pill flotante:** `.header.header-aqua` con `position: fixed, top: 18px, pointer-events: none` y el `.header-aqua-pill` interior con `pointer-events: auto`. Esto es el contrato — sin ello el header bloquea clicks de TODO el sitio.
8. **`main { padding-top: 92px }`** compensa el header flotante. En home, `.hero.hero-aqua` tiene su propio `padding-top: 92px` y `main:has(> .hero.hero-aqua) { padding-top: 0 }` evita doble-spacing.
9. **Mobile drawer técnica:** `body.menu-open { position: fixed; width: 100% }` + JS guarda/restaura `window.scrollY` via `body.style.top`. Es la solución oficial WebKit para iOS Safari scroll lock detrás de modal.
10. **Skeleton placeholder hide rule:** `#pieza-content:has(.pieza-aqua-layout) + #pieza-skeleton { display: none }` — el skeleton se oculta automáticamente cuando el contenido renderiza.

### Cómo extender el sistema

**Para agregar una nueva sección al home:**
```html
<section class="hero-aqua-newthing">
    <div class="container">
        <span class="section-eyebrow">Eyebrow</span>
        <h2 class="hero-aqua-page-title">Título <em class="emerald-text">accent</em></h2>
        <p class="hero-aqua-page-lead">Lead.</p>
        <div class="glass glass-iridescent">
            …contenido glass…
        </div>
    </div>
</section>
```
Si necesita data dinámica: importar `db` + suscribir a `db.onChange()` + render method.

**Para agregar una nueva página interna:**
1. Copy structure from `anillos.html` o `nosotros.html`
2. Asegurar 4 `<link>` en orden: preconnects → Cormorant+Montserrat → Fraunces+Inter+JetBrains → `style.css` → `liquid-glass.css`
3. `<div class="bj-world" aria-hidden="true">` justo después de `<body>`
4. `<meta name="theme-color" content="#f8faf6">`
5. Page hero: `<section class="page-hero hero-aqua-page">` con breadcrumb glass-pill + eyebrow + título display + lead

**Para agregar una nueva categoría/colección:**
- Crear el doc en Firestore vía admin panel
- Si quieres página dedicada: copiar `anillos.html`, cambiar `data-collection="<nuevo-slug>"`, agregar entry a `VISUAL_MAP` en `categories-dock.js` con glyph + hue. Si NO creas página, el dock linkea a `colecciones.html?col=<slug>` automáticamente.

**Para tunear apariencia global:**
- Los tokens `--bj-*` y `--aqua-*` en `:root` son la palanca. Cambiar 1 valor propaga a todo el sitio.
- Para cambiar el balance del Liquid Glass effect: ajustar `--glass-blur`, `--glass-saturate`, `--glass-tint` en `:root`.
- Para cambiar el "aurora": editar `html::before { background: ... }` en liquid-glass.css.

### Ramas y PRs (referencia histórica)

- `redesign-liquid-glass` (origen): handoff React de Claude Design. NO se mergea — historia no compartida con `main`.
- `claude/review-liquid-glass-pr-Aciap`: branch de implementación de las 10 fases sobre `main`. Auto-mergeada commit-por-commit vía PRs #130-#139 (bot del repo).
- Sesión: `https://claude.ai/code/session_01P55KdjwfpEtaiZV7kpVvmC`

---

## 2026-04-27 — ITERACIÓN POST-LAUNCH (Fases 11-18 + fixes de fondo)

Después de las 10 fases del rediseño inicial, el usuario reportó varios issues de paridad visual con el diseño Claude (a través de iteraciones del mismo bundle handoff con distintos hashes: `UJDpyaeGYl68tMwai8d--A`, `PCgqgjtOtSt7F7YZv_lN0A`, `46JeX6nXuv9FXkPt70BgnQ`, `qCRgz7dRtGiigfTkz97mtQ`, `mgw73qlVL6it2nXTafW0_g`, `u7FZqnxLdcZ5SWrKVKPCWQ`, `Ta-Pmh5qKfAS4uFupe4Q0Q`, `82uDQdS1-yE3ReJrrIATyw` — todos comparten la misma estructura del bundle pero `WebFetch` falla con maxContentLength por el tamaño del JSON). Trabajo iterativo en 8 commits microquirúrgicos.

### Fase 11 — Header simplificado + Catálogo dinámico (commit `d6c19e6`)

**Problema reportado:** el header tenía 2 dropdowns + 4 íconos. El diseño tiene solo 4 nav links planos + 1 cart.

**Solución:**
- `snippets/header.html` reescrito: logo + 4 links (Inicio · Colecciones · Nosotros · Contacto) + 1 cart icon. Eliminados Servicios dropdown, Colecciones submenu, search trigger, wishlist icon, account icon, WhatsApp visible icon. `<a id="wa-nav" hidden>` se mantiene oculto para que `initWhatsAppButton` siga funcionando.
- `js/components.js`: removido handler de dropdown-toggle (~22 líneas). Cualquier nav-link click cierra el mobile drawer.
- `colecciones.html` reescrito: hero "CATÁLOGO · 2026" + "Todas las **piezas**" (italic emerald) + filter pills container (.glass-pill con `Todo` + N pills dinámicos por cada `db.getCollections()`) + sort dropdown (5 opciones: destacados/recientes/precio asc/precio desc/nombre).
- `js/colecciones.js` reescrito: tracks `activeFilter` + `activeSort`, `renderTitle()` actualiza dinámicamente el título según filtro activo (collection name italic emerald + col.description), URL state via `history.replaceState({}, '', '?col=<slug>')`.
- CSS Phase 11: ~250 líneas para `.catalog-pills`, `.catalog-pill`, `.catalog-sort`, `.catalog-sort-select` con focus ring dorado.

### Fase 12 — Background unification + load fluidity (commit `465f511`)

**Problema reportado:** "el fondo no está igual" + "la fluidez con la que carga la página no es la misma".

**Root cause:** mi implementación tenía DOS capas de bg compitiendo:
- `html::before` (aurora layer que YO añadí — el diseño NO la tiene)
- `.bj-world` con valores ligeramente distintos

**Fix bg:**
- `html::before { display: none }` — eliminada capa fantasma
- `.bj-world` ahora carga el bg EXACTO del bersaglio.html source: 3 radial-gradients + 1 linear-gradient + 2 blobs ::before/::after con drift 28s. Opacidad blobs 0.55 → 0.6 (match exacto). Colores corregidos.

**Fix fluidez:**
- `js/preloader.js`: `minMs: 1800ms → 350ms` (5× más rápido)
- Animación de salida: 11-step staggered GSAP timeline → crossfade único de 0.35s
- Total tiempo a página visible: ~3s → ~0.7s

### Fase 13 — Body transparente para hacer .bj-world visible (commit `ee2e0d6`)

**Problema:** después de Fase 12, el usuario seguía viendo el fondo plano pearl, NO los gradientes del diseño.

**Root cause:** `body { background: var(--bj-pearl) !important }` pintaba un color sólido ENCIMA del `.bj-world` (z-index: -1). Bug clásico de CSS: cuando body tiene bg-color y un hijo tiene z-index:-1 (con body como non-stacking-context), el hijo queda detrás del body's bg.

**Fix:**
```css
html { background: var(--bj-pearl) !important; }     /* fallback antes de bj-world */
body { background: transparent !important; }          /* deja pasar bj-world */
.bj-world { position: fixed; z-index: -1; ... }       /* ahora SÍ visible */
```

### Fase 14 — Kill section dividers + dark washes (commit `4cc8ed0`)

**Problema reportado:** banda verde oscura full-width entre cards y CTA en colecciones.html. Otras líneas ocultas similares.

**Root cause encontrado en style.css:**
- L11810: `.cta-banner.cta-v7` con border-top + border-bottom dorados (`rgba(200,169,110,0.12)`) — 2 líneas thin visibles
- L11821: `.cta-banner.cta-v7::before` con radial-gradient `rgba(26,77,46,0.15)` — wash esmeralda oscuro
- L11831: `.cta-banner.cta-v7::after` con textura de ruido
- L12018: `.lookbook-v7, .featured-v7, .brand-statement-v7, .collections-v7, .services-v7, .journal-v7, .about-v7` con `border-top: 1px solid rgba(200, 169, 110, 0.08)` — gold dividers entre cada sección
- L12029: mismos selectores con `::before` gradient `linear-gradient(90deg, transparent, gold 0.12, transparent)` — otra línea decorativa
- L4498-4534: legacy `.cta-banner::before` con shimmer-border animation + `::after` con logo watermark
- L1484: `.footer { border-top: 1px solid gold }`

**Fix:** nuevo bloque PHASE 14 al final de liquid-glass.css (~99 líneas) con `!important` para ganar la cascada:
1. `border-top: none + border-bottom: none` en cada V7 section + .cta-banner.cta-v7
2. `::before` en cada V7 section: `display:none + content:none + bg:none`
3. `.cta-banner.cta-v7::before/::after` AND legacy `.cta-banner::before/::after`: killed
4. `.section-divider`, `.section-transition`, `hr.section-divider`: hidden
5. Catch-all `section[class*="-v7"]::before/::after`: bg transparent + no border
6. `.footer`: no border-top + no box-shadow
7. `.hero.hero-v7::before/::after`: killed

### Fase 15 — Purga de 2348 líneas de CSS muerto (commit `7d656a9`)

**Pedido del usuario:** "verifiquemos código muerto del diseño viejo".

Auditados los bloques V7-era donde los selectores ya no existen en HTML/JS. Eliminadas ~2348 líneas de `style.css`:

| Bloque borrado | Líneas | Razón |
|---|---|---|
| HERO V7 EDITORIAL CINEMÁTICO | 272 | Markup `<picture>`, `.hero-overlay`, `.hero-canvas`, `.hero-accent-line`, etc. ya no existen |
| HERO V7 RESPONSIVE | 169 | Mismos selectors muertos |
| HERO TICKER (marquee viejo) | 84 | Reemplazado por `.hero-aqua-marquee` en Phase 1 |
| PHASE 10 CTA V7 + Section Transitions + Final Polish | 263 | Inner classes `.cta-content`, `.cta-title`, `.cta-desc`, `.cta-btn` muertas |
| LOOKBOOK V7 | 52 | Componente eliminado en Phase 1 |
| PORTFOLIO V9 ADAPTIVE LUXURY GRID | 590 | Componente eliminado |
| HEADER REDESIGN V2 + Mobile/Tablet | 484 | Reemplazado por `.header.header-aqua.pill` (Phase 4) |
| ABOUT TEASER V7 + Responsive | 270 | Reemplazado por editorial split |
| BRAND STATEMENT V7 | 163 | Reemplazado por `hero-aqua-editorial-quote` |

**HTML cleanup adicional:** `nosotros.html` reemplazó `<section.brand-statement>` legacy (con `.brand-statement-inner`, `.brand-divider`, `.brand-quote`, `.brand-origin`) por su versión aqua glass.

**Resultado:** `style.css` 13,252 → 10,904 líneas (-18%).

### Fase 16 — Nosotros: editorial banner + timeline (commit `ea39ac1`, parte 1)

Nueva sección entre page-hero y brand-statement:
- `.glass.glass-iridescent.nosotros-editorial-banner` 21:9 con banner.png full-bleed + dark gradient overlay + chip "Atelier Bersaglio · Cartagena" + cita italic Fraunces "Nuestra casa es **tu casa**." con accent gold

Nueva sección antes del CTA:
- `.glass.nosotros-timeline` con título "Nuestra **línea del tiempo**" + grid 4 columnas: 2012 (El comienzo) / 2016 (Atelier) / 2020 (Certificación) / 2026 (Colección La Verde). Cada milestone: año mono dorado + línea gold→transparent + título Fraunces 20px + descripción Inter 13px.

### Fase 17 — Pieza detail enhancements (commit `ea39ac1`, parte 2)

| Mejora | Detalle |
|---|---|
| **GIA chip overlay** | Movido del info-card a esquina top-right de la imagen principal con `backdrop-filter: blur(16px) saturate(180%)`. Lee `piece.specs.certificate` |
| **IVA incluido** | `pieza-price-iva` section-eyebrow (10px tracked) al lado del precio mono |
| **Talla selector** | Solo aparece cuando `piece.collection ∈ {anillos, argollas}`. 5 glass pills (5/6/7/8/9) + "A medida". Active state emerald gradient + white text. Click handler toggles `.is-active` |
| **Consultar con asesor** | Nuevo `btn-aqua-gold` full-width debajo del grupo de 3 CTAs. Link a `contacto.html?ref=<slug>` para tracking |

### Fase 18 — Contacto sidebar (commit `ea39ac1`, parte 3)

Reemplazado el listado vertical de 5 canales por sidebar de 3 cards del diseño:

| Card | Estilo | Contenido |
|---|---|---|
| **Casa Bersaglio** | `glass-emerald` (linear-gradient esmeralda + texto blanco) | "Cartagena de Indias" + dirección + horario + "Cómo llegar →" link gold |
| **Directo** | Glass white translucent | WhatsApp + Email rows con label tracked uppercase + value (mono para teléfono) + Instagram + Facebook como social icons circulares |
| **Respuesta garantizada** | Gold gradient glass | Eyebrow gold + Fraunces gigante "< 24h" + nota descriptiva |

Form column ajustada a 1.25fr para balancear.

---

## INVENTARIO COMPLETO post-Fase 18

### Estructura CSS final
| Archivo | Líneas | Rol |
|---|---|---|
| `css/style.css` | 10,904 | Solo estructura (layout, grid, animations, JS hooks). Sin colores oscuros activos. V2/V3/V4/V5/V6/V7 legacy mayormente eliminados. |
| `css/liquid-glass.css` | 4,442 | **Único source visual.** Tokens + primitives + overrides + componentes específicos del nuevo diseño. Cargado AFTER `style.css` en cada `<link>` de las 17 páginas públicas. |

### Componentes JS finales
| Archivo | Líneas | Rol |
|---|---|---|
| `js/components/piece-card.js` | ~140 | Renderer compartido (single source of truth para markup de cards en 6 surfaces) |
| `js/components/categories-dock.js` | ~95 | Dock iOS con count live de Firestore |
| `js/components/featured.js` | ~35 | Slim wrapper que delega a piece-card |
| `js/components/journal.js` | (sin cambios) | Render de journal preview |
| `js/components/services.js` | (sin cambios) | Render de services |
| `js/components/collections.js` | (sin cambios — sigue usándose en colecciones.html legacy) | |
| `snippets/header.html` | ~80 | Header pill flotante simplificado (4 nav + 1 cart) |
| `snippets/footer.html` | (sin cambios) | Footer con grid de columnas |

### JS legacy eliminado
- `js/components/lookbook.js` (Phase 1)
- `js/effects/hscroll.js` (Phase 1)
- `js/canvas/particles.js` (Phase 10)
- `js/hero-animation.js` (Phase 10)
- (Total: ~2400 líneas de JS muerto eliminadas)

### Sección por página — qué se ve

**index.html** (home, render por `js/app.js`):
1. Hero 3D parallax + halo iridiscente + 3 floating glass cards (gem / GIA cert / Atelier 2026 tag)
2. Marquee glass-pill con 6 credenciales + ◆ separadores
3. Categories Dock iOS (6 gel circles dinámicos desde admin)
4. Featured V8 grid (cards glass-iridescent con eyebrow + título + meta + price)
5. Editorial split (image card + quote glass)
6. Atelier process (4 pasos numerados en emerald glass)
7. CTA Cartagena (glass-iridescent + gold halo)

**colecciones.html** (catálogo, render por `js/colecciones.js`):
1. Hero centrado: "CATÁLOGO · 2026" + "Todas las **piezas**"
2. Controls bar: filter pills (Todo + dynamic) + sort dropdown
3. Grid de cards via `renderPieceCardHTML`
4. CTA "¿No encuentras lo que buscas?"

**anillos.html / argollas.html / topos-aretes.html / dijes-colgantes.html** (catálogos individuales, render por `js/coleccion.js`):
1. Hero editorial con breadcrumb glass-pill
2. Grid de cards filtradas por slug

**pieza.html** (render por `js/pieza.js`):
1. Breadcrumb glass-pill
2. Layout 1.05fr 1fr: gallery (main image glass-iridescent + thumbs) | info card glass
3. Info: badges + collection link + nombre + descripción + 4-cell specs grid + price+IVA + talla selector (anillos/argollas) + 3-button CTA group + "Consultar con asesor" gold
4. GIA chip overlay sobre imagen
5. Guarantees pill strip
6. Related pieces grid

**carrito.html / lista-deseos.html**:
1. Hero editorial
2. Grid cards via `renderPieceCardHTML`
3. Cart summary (carrito) / share + clear actions (wishlist)

**contacto.html**:
1. Hero editorial
2. Grid 1.25fr 1fr: form glass-iridescent con motivo pills | sidebar 3 cards

**nosotros.html**:
1. Hero editorial
2. Editorial banner (NUEVO Phase 16)
3. Brand statement quote
4. Quiénes somos / Misión / Visión (texto)
5. Valores (6 cards)
6. Timeline (NUEVO Phase 16)
7. CTA

**servicios.html**:
1. Hero editorial
2. Atelier intro narrativa
3. 5 service cards (numbered)
4. 3-step process
5. CTA

**journal.html / entrada.html**:
1. Hero aqua
2. Grid de entradas
3. Detalle de entrada (entrada renderiza dinámico)

**gracias.html / terminos.html / privacidad.html**:
1. Hero aqua simple
2. Contenido legal/agradecimiento

### Sync admin verificado en cada página
- `db.onChange()` re-renderiza: home (categories dock + featured + journal + services), pieza, carrito, wishlist, colecciones (pills + grid), catálogos individuales (hero + grid)
- Optimistic locking + audit log + version conflicts intactos
- Wishlist + cart localStorage persist
- Schema Firestore intacto (no se borran ni renombran campos)

---

## Notas para futuras iteraciones

1. **Talla selector en pieza** es solo client-side por ahora. Si necesitas guardar la selección en cart, agrega un campo `size` al cart item y modifica `cart.toggle(slug)` para recibir size opcional.
2. **Hero 3D parallax** depende de `js/liquid-glass-hero.js` que solo corre si `pointer: fine` (desktop) y NO `prefers-reduced-motion`. Si quitas el script, los floating cards quedan estáticos pero todavía se ven bien.
3. **Bloques style.css restantes potencialmente muertos:** Featured V7 (~471 líneas), Featured V7 Responsive (~70), Collections V7 + Responsive (~353), Services V7 + Responsive (~452), Journal V7 + Responsive (~313), Section Headers V7 (~121). Pueden seguir limpiándose en futuras iteraciones — el override liquid-glass.css ya neutraliza su efecto visual.
4. **Background system:** la regla **definitiva** es `html { background: var(--bj-pearl) }` + `body { background: transparent }` + `.bj-world { z-index: -1; ...gradientes... }`. NO TOCAR — si vuelves a poner `body { background: pearl }` el `.bj-world` queda invisible (bug del z-index:-1 detrás de body bg).
5. **Section dividers:** todos los `border-top/bottom` decorativos en V7 sections + `::before` gradient lines fueron neutralizados en Phase 14. Si en una futura iteración añades un divider intencional, hazlo dentro de `.glass` containers — NO con borders en sections fullwidth porque rompen el flow del bj-world.
6. **CSS scope loosening:** las cards `.piece-*` tienen sus rules sin parent `.featured-v7` (Phase 5). Esto permite que el mismo markup funcione en home/catálogo/wishlist/cart. No re-anidar bajo `.featured-v7`.

---

## REGLAS — NO TOCAR (post-Fase 18)

Adicional a las reglas previas (1-10), añade:

11. **`html { background: pearl }` + `body { background: transparent }`** es el único patrón válido para que `.bj-world` se vea. Cambiar uno de los dos rompe el fondo.
12. **`.cta-banner.cta-v7` debe permanecer transparent** — la legacy `.cta-banner { background: var(--emerald-deep) !important }` (style.css L7866 antes de Phase 15) ya está limpiada, pero si vuelve, override en liquid-glass.css con specificity ≥ 2 + !important.
13. **No uses `border-top/bottom` en `<section>` fullwidth** — rompe el flow del bj-world. Para dividers usa `<hr>` dentro de `.container` (max-width 1360px) o sólo dentro de glass cards.
14. **`renderPieceCardHTML` es el único renderer de cards** — wishlist-page, cart-page, colecciones, coleccion, featured, pieza-related TODAS lo usan. Si necesitas variantes (ej. compact card para sidebar), agrega un parámetro al helper, NO duplicar markup.
15. **El header pill simplificado de Phase 11 es el contrato actual** — 4 nav links + 1 cart icon. NO volver a meter dropdowns ni íconos extra (search/wishlist/account/wa). Wishlist queda accesible solo via footer link y los heart buttons en cards.
16. **`#wa-nav[hidden]`** se mantiene en el header como anchor invisible para que `initWhatsAppButton` no rompa. NO eliminar.
17. **El preloader minMs es 350ms** (Phase 12). Si subes a 1000+ms se siente lento. Si bajas a 0, el preloader no se ve y los users que llegan directo a una página interna pueden ver flash de pearl bg.
18. **Talla selector visible solo en `collection ∈ {anillos, argollas}`** — si admin crea una colección "alianzas" o similar que también necesita talla, añade el slug al check en `renderPiece()`.
19. **Todos los gradientes del bg deben usar oklch** — no hex ni rgba para colores de marca. Mantiene la coherencia perceptual a través de medios.
20. **`--emerald-deep` ahora es `oklch(28% 0.08 155)`** vía remapeo en `:root`. Si renombras este token o cambias su valor, verifica todos los usos legacy en style.css.

### Próximos handoffs Claude Design

Si el usuario te pasa un nuevo URL `api.anthropic.com/v1/design/h/<hash>?open_file=bersaglio.html`, **NO intentes WebFetch** — el endpoint devuelve >10MB JSON y siempre falla con `maxContentLength size of 10485760 exceeded`. En su lugar, usa el bundle previamente extraído en `/tmp/`:
- `/tmp/liquid-glass.css` (design system)
- `/tmp/page-home.jsx` (Home component)
- `/tmp/shell.jsx` (Header/Footer/Cart drawer)
- `/tmp/pages.jsx` (Catalogo, Producto, Nosotros, Contacto, Checkout)

Estos archivos representan la base del diseño que el usuario itera. Los cambios entre hashes son típicamente sub-pixel ajustes que no se reflejan en el bundle estructural.

Si el bundle no está en `/tmp` (sesión nueva), pídelo al usuario o usa la rama `redesign-liquid-glass` del repo donde está como snapshot histórico.

---

## 2026-04-28 — POLISH SESSION (Fases 19-21 + Items 1-2 + Session 3)

Tras documentar Phases 11-18, el usuario aprobó proceder con el roadmap pendiente que se le había propuesto en orden. 4 commits adicionales que cierran el rediseño.

### Fase 19 — Limpieza adicional de V7 muerto + Phase 20 verificación + Phase 21 mobile (commit `8522c1f`)

**Phase 19 — Collections V7 purgado:**
Auditados los selectores legacy V7 restantes en `style.css`. Encontrados con 0 referencias en HTML/JS:
- `collections-v7` wrapper (eliminado de index.html en Phase 1, no aparece en colecciones.html post-Phase 11)
- `js/components/collections.js` orphan (no se importa en ningún sitio — `app.js` lo eliminó en Phase 1, `colecciones.html` ahora usa el nuevo layout `.catalog-pills + .featured-grid`)

Eliminados:
- CSS Collections V7 + Responsive bloque (~355 líneas, lines 9167-9521)
- `js/components/collections.js` (orphan)

`style.css`: 10,904 → 10,549 líneas.

**Phase 20 — Pieza thumbs verificación (no-code-change):**
Auditado `js/pieza.js renderPiece()` — los `pieza-thumbs` ya iteran correctamente sobre `piece.images?.map()` con click handler `initGalleryThumbs()` que swappea `mainImg.src` via `data-img` attribute. Ya estaba funcionando, no requirió fix. Documentado para evitar futuras auditorías redundantes.

**Phase 21 — Mobile responsive polish (~135 líneas en liquid-glass.css):**
Añadidos 4 bloques `@media` para cubrir gaps en breakpoints existentes:

| Breakpoint | Cambios |
|---|---|
| `≤480px` (compact phone) | Hero title clamp 40-56px, lead 14px, CTAs vertical full-width. Header pill compact (gap 4px, padding 4-10, logo 13px, icons 32px). Page hero title 34-48px. Categories dock gem 48px. Catalog pills + sort 11/12px. Pieza CTA group vertical, talla pills 42px, specs cell 12-14 padding. Contacto motivo pills 7px×12px. Editorial/CTA Cartagena padding tighter. |
| `≤620px` (mobile portrait) | Hero floating cards offsets reducidos (gem right 4, cert left 4, tag bottom -2%). Marquee items 11px gap 36px. CTA actions vertical full-width. Editorial gap 20px. |
| `≤768px` (tablet) | Pieza price row wrap. Contacto sidebar cards 22px padding, time 40px. Pieza guarantees pill stack vertical 12px gap. |
| `(hover:none) and (pointer:coarse)` | Disable hover transforms en `.piece-card`, `.hero-aqua-cat`, `.nosotros-timeline-item`, `.contact-channel`, `.contact-direct-social` (battery + previene accidental scale en touch) |

### Item 1 — Checkout 3-step stepper (commit `83bd734`)

**Source:** `/tmp/pages.jsx` Checkout component (Carrito → Envío → Pago).

**HTML restructure (carrito.html):**
- `.glass.glass-pill.checkout-stepper` arriba con 3 botones (Carrito 01 / Envío 02 / Pago 03), activo con emerald gradient
- `.checkout-layout` grid 1.4fr 1fr (single-col en ≤920px): main content izquierda + sticky `.glass-emerald` summary derecha
- Step 1: cart actions existentes + grid via `renderPieceCardHTML` + nuevo "Continuar al envío"
- Step 2 (NUEVO): glass card con shipping form — 7 fields en grid 2/3-col (Nombre/Apellido, Dirección, Ciudad/País/CP, Teléfono/Email), HTML5 validation
- Step 3 (NUEVO): glass card con 3 payment radio cards (Wompi / Transferencia bancaria / Coordinar por WhatsApp) con highlight emerald glow ring usando `:has(input:checked)`
- Sticky aside `.glass-emerald` con line items + subtotal/envío/IVA + total mono + Wompi quick-pay (solo step 1 vía `[data-step-show="1"]`)

**JS additions (js/cart-page.js):**
- `initStepper()`:
  - Click delegation en `.checkout-stepper` permite saltar entre pasos
  - `.checkout-step-next/prev` buttons advance/rewind
  - Shipping form submit: HTML5 `checkValidity()` → `sessionStorage 'bj-shipping'` → `goToStep(3)`
  - Restore al cargar la página si hay datos guardados
  - `btn-confirm-payment`: lee radio `payMethod`:
    - `wompi` → existing `wompiCheckout.pay()` + clears cart on success
    - `transfer` → redirect `gracias.html?method=transfer`
    - `whatsapp` → reuses `btn-cart-wa` click
- `renderCart()` actualizado para toggle visibility de stepper + layout (oculto cuando cart vacío)
- `renderCheckoutSummary()` rewritten para nuevo sidebar sticky markup

**CSS (~290 líneas en liquid-glass.css "ITEM 1" block):**
- `.checkout-stepper`: glass-pill 460px max + 3 inner pills con activo emerald gradient
- `.checkout-layout`: grid 1.4fr 1fr
- `.checkout-step-view.glass`: 28px radius 36px padding (24px en ≤568px)
- `.checkout-step-title`: Fraunces clamp 24-32px con italic emerald em
- `.checkout-shipping-form`: flex column 16px gap, `.checkout-form-row--2/3` variants colapsan en 568px
- `.checkout-step-prev`: ghost transparent border button
- `.checkout-payment-opt`: glass radio cards con `:has(input:checked)` emerald bg + 2px glow ring
- `.checkout-summary-sticky`: glass-emerald sticky top:110px, white text
- `.checkout-unpriced-note`: white-translucent inset note dentro del sidebar emerald
- `.cart-inquiry-note`: neutralizada (era dark legacy → aqua glass)
- Mobile (≤480): stepper 8px padding, summary static (no sticky)

### Item 2 — Cart drawer lateral (commit `01ad5e9`)

**Source:** `/tmp/shell.jsx` CartDrawer component.

**Nuevo archivo `js/components/cart-drawer.js` (~165 líneas):**
- Lazy DOM build: drawer + backdrop solo se crean en primer `openDrawer()` call
- Empty state: gem SVG + "Tu carrito está vacío" + btn-aqua-emerald
- Populated: header (eyebrow count + display title) + scrollable items list + footer (subtotal/quote-note + checkout CTA + "Seguir explorando")
- iOS body scroll lock: `position:fixed` + saved `scrollY` restore on close
- `cart.onChange()` + `db.onChange()` re-render si está abierto
- Exposed `window.openCartDrawer` para uso programático futuro

**Wire-up (js/components.js):**
- `initCartDrawer()` después de `initializeCart()`
- Header `.cart-btn` intercept: `e.preventDefault()` + `openDrawer()` salvo Cmd/Ctrl/Shift-Click (preserva new-tab)

**CSS (~280 líneas en liquid-glass.css "ITEM 2" block):**
- `.cart-drawer-backdrop`: dimmed emerald + blur(8px), opacity transition 0.4s
- `.cart-drawer`: fixed right, width min(440px,100vw), pearl glass blur 32 sat 190%, slide-in `translateX(110%→0)` 0.45s `cubic-bezier(.32,.72,0,1)`
- `.cart-drawer-header`: padded title + close button (36px circle glass)
- `.cart-drawer-empty`: centered icon + Fraunces tagline + CTA
- `.cart-drawer-items`: scrollable middle area
- `.cart-drawer-item`: 14px padded white-translucent rounded card con 70px square image + name (ellipsis) + meta + mono price + 28px remove button (red on hover)
- `.cart-drawer-footer`: subtotal mono 22px + checkout-btn full-width emerald gel + ghost "Seguir explorando"
- `body.cart-drawer-open`: `position:fixed; width:100%` (iOS scroll lock)
- Mobile (≤480px): drawer = 100vw

### Sesión 3 — Polish: animations + a11y (commit `c426b2d`)

**Nuevo archivo `js/aqua-animations.js` (~70 líneas):**
- `initAquaAnimations()`:
  - Auto-tags every `<section>` in `<main>` con `.aqua-fade-in` (skip si ya tagged)
  - Auto-tags grid containers (`.featured-grid`, `.hero-aqua-cats-dock`, `.nosotros-timeline-grid`, `.checkout-payment-options`, `.contact-sidebar`) con `.aqua-stagger`
  - IntersectionObserver con threshold 12% + rootMargin -10% bottom → revela cada elemento una vez, después unobserve
  - Respeta `prefers-reduced-motion` (no-op si reduce)
- `refreshAquaAnimations(rootEl?)` exportado para re-observar nuevos elementos rendered async (Featured cards, journal, categories dock)

**Wire-up (js/components.js):**
- `initAquaAnimations()` en `requestAnimationFrame` después de loadAllComponents
- `refreshAquaAnimations()` después de 1500ms para JS-rendered cards

**CSS additions (~75 líneas en liquid-glass.css "SESSION 3" block):**
- `.aqua-fade-in`: opacity 0 → 1 + translateY 18 → 0, 0.7s
- `.aqua-stagger > *`: opacity 0 + translateY 14, transition 0.6s con `nth-child` delays 0.05/0.12/0.19/0.26/0.33/0.40s
- `*:focus-visible`: 2px gold outline `oklch(82% 0.14 85 / 0.7)` at 3px offset (sitewide a11y)
- `.btn-aqua*:focus-visible`: 4px offset
- `.skip-link`: emerald pill 999px hidden -100px top → revela on focus a top:16px (Tab key)
- Reduced-motion kills todas las transitions

### INVENTARIO FINAL post-Sesión 3

| Recurso | Estado |
|---|---|
| `css/style.css` | 10,549 líneas |
| `css/liquid-glass.css` | 5,238 líneas |
| `CLAUDE.md` | 1,508 líneas (antes de este apéndice) |
| Total commits en branch | **45** (todos auto-mergeados a main) |

**Componentes JS finales:**
- `js/components/piece-card.js` — renderer compartido (6 surfaces)
- `js/components/categories-dock.js` — dock iOS live count
- `js/components/featured.js` — slim wrapper para piece-card
- `js/components/journal.js` — render journal preview
- `js/components/services.js` — render services
- `js/components/cart-drawer.js` — drawer lateral (NUEVO Sesión 3)
- `js/aqua-animations.js` — entrance animations (NUEVO Sesión 3)

**Componentes JS borrados (limpieza acumulada):**
- `js/components/lookbook.js` (Phase 1)
- `js/effects/hscroll.js` (Phase 1)
- `js/canvas/particles.js` (Phase 10)
- `js/hero-animation.js` (Phase 10)
- `js/components/collections.js` (Phase 19)
- Total: ~2,500 líneas de JS muerto eliminadas a lo largo del proceso

### REGLAS — NO TOCAR (post-Sesión 3, suma a las 20 anteriores)

21. **`.cart-drawer` se construye lazy** en el primer `openDrawer()` call. NO crear DOM upfront — desperdicia ciclos y no aporta nada hasta que el usuario abre el drawer.
22. **Header `.cart-btn` debe usar `e.preventDefault()`** condicionado a no-modifier-keys. Cmd/Ctrl/Shift-Click preserva navegación a `carrito.html` (UX standard de e-commerce: open in new tab).
23. **`body.cart-drawer-open`** usa la misma técnica que `body.menu-open`: `position:fixed; width:100%; top:-{savedY}`. NO mezclar con `overflow:hidden` — en iOS Safari es la única técnica que respeta scroll position al cerrar.
24. **Stepper buttons en `.checkout-stepper`** — los 3 botones de paso son clickables solo si cart tiene items. Si vacío, click en step 2/3 hace nada (return en delegation).
25. **Form shipping persistence** usa `sessionStorage 'bj-shipping'`. NO usar `localStorage` (datos sensibles + temporales). Se limpia en Wompi success.
26. **Payment radio cards** usan CSS `:has(input:checked)` para el highlight ring. Esto es Chrome 105+/Safari 15.4+/Firefox 121+. Para fallback, también usamos JS `accent-color` + el border default. Si Firefox <121 muestra fallback, no es bug.
27. **Animation classes** (`.aqua-fade-in`, `.aqua-stagger`) deben ser auto-tagged via `initAquaAnimations()`. Solo override manual en HTML si quieres skip alguna section específica.
28. **`refreshAquaAnimations()`** debe llamarse después de cualquier `innerHTML = ...` que renderice secciones nuevas. Ya está hookead en components.js para el delay inicial.
29. **`*:focus-visible`** override es global — si una librería externa (Wompi widget, search overlay) tiene su propio focus style, agregar selector específico para no quitarlo.
30. **Skip-link** debe permanecer como PRIMER elemento dentro de `<body>` (después del `<div class="bj-world">`). Tab key debe revelarlo. NO mover.
