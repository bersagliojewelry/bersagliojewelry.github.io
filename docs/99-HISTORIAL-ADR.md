# 99 — HISTORIAL DE CAMBIOS Y DECISIONES (ADRs)

Este archivo contiene el registro histórico de decisiones de diseño, cambios de arquitectura y resolución de bugs del proyecto Bersaglio Jewelry. Se consulta on-demand mediante el enrutamiento del índice sináptico (`docs/00-INDICE.md`).

---

## 2026-04-04 — Rediseno completo index.html V7 (10 fases)
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

---

## 2026-04-04 — Correcciones post-rediseno (hero ticker, fondos, animaciones)
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

---

## 2026-04-04 — Consolidacion ticker + trust strip en un unico marquee
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

---

## 2026-04-04 — Limpieza de codigo muerto (hero-meta, trust-strip V7)
**Archivos modificados:** `index.html`, `css/style.css`, `CLAUDE.md`

**Cambios realizados:**
1. **Eliminado comentario HTML del trust strip** — Se removio el bloque comentado `<!-- <div class="trust-strip trust-strip-v7">...</div> -->` del index.html.
2. **Eliminado CSS completo de Trust Strip V7** — ~200 lineas de CSS eliminadas (base + responsive + accesibilidad) ya que el HTML fue removido.
3. **Eliminado CSS de hero-meta V7** — ~65 lineas de CSS eliminadas (`.hero-v7 > .hero-meta`, `.hero-meta-inner`, `.hero-badge`, `.hero-badge-sep` + responsive) ya que hero-meta no existe en el HTML.
4. **Eliminadas referencias hero-meta en responsive** — Se limpiaron las reglas `.hero-v7 .hero-meta-inner` en los breakpoints de 1024px, 1280px, 1600px y 479px.
5. **Eliminada regla safe-area hero-meta** — Se removio `padding-bottom: env(safe-area-inset-bottom)` para `.hero-v7 > .hero-meta`.
6. **Eliminada regla display:none del trust-strip** — Era redundante ya que el HTML fue removido.

**Resultado:** ~270 lineas de CSS muerto eliminadas. El archivo style.css queda mas limpio sin afectar ningun estilo visible.

---

## 2026-04-04 — Iconos diferenciados en ticker + eliminar pause on hover
**Archivos modificados:** `index.html`, `css/style.css`, `CLAUDE.md`

**Cambios realizados:**
1. **SVG Oro 18K** — Cambiado de rombo generico a icono de lingote (rectangulo con divisiones).
2. **SVG Esmeraldas colombianas** — Cambiado de rombo generico a icono de gema facetada (octogono con facetas internas).
3. **Eliminado pause on hover** — Se removio la regla `.hero-v7 > .hero-ticker:hover .hero-ticker-track { animation-play-state: paused }` para que el ticker nunca se detenga ni con mouse ni con touch.

---

## 2026-04-04 — Rediseno completo del header (desktop + mobile)
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

---

## 2026-04-04 — Rediseno completo seccion Servicios (index + pagina)
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

---

## 2026-04-04 — Header V2: simetria desktop + mobile panel premium
**Archivos modificados:** `css/style.css`, `CLAUDE.md`

**Problemas corregidos:**
1. **Desktop simetria** — El CSS legacy `.nav-contact-btn` (linea ~9801) tenia padding 9px 22px / font-size 10.5px que hacia Contacto mas grande que WhatsApp. Se neutralizo, ahora ambos botones usan height:34px fijo identico.
2. **Mobile menu legacy conflicto** — El CSS legacy (linea ~1553) tenia `background: var(--ivory)` (blanco), `right: -100%` y `color: var(--text-primary)` que conflictuaba con el panel oscuro nuevo. Se neutralizo dejando solo `.hamburger { display: flex }` y las reglas de about-grid/contact-grid.
3. **Mobile close button** — La X SVG grande fue refinada: ahora 14px con opacity, junto al texto "CERRAR" sin borde prominente. Sin la X blanca grande del diseño anterior.
4. **Mobile footer cortado** — Agregado `margin-top: auto` + `padding-bottom: calc(16px + env(safe-area-inset-bottom))` para que Contacto/WhatsApp siempre sean visibles, incluso con la barra del navegador iOS.
5. **Separador visual desktop** — Linea vertical sutil entre botones texto y botones icono via `.nav-account-btn::before`

---

## 2026-04-04 — Fix critico mobile menu: hamburger X doble, panel no abria
**Archivos modificados:** `css/style.css`, `js/components.js`, `CLAUDE.md`

**Root causes identificados y corregidos:**
1. **Doble boton cerrar** — El CSS `.hamburger.is-active` transformaba las 3 lineas en X (z-index 1002 encima del panel z-index 1001), creando un segundo boton cerrar sobre el del panel. Solucion: `.hamburger.is-active { display: none !important }` — el hamburger se oculta cuando el menu esta abierto, y el panel usa su propio boton "Cerrar".
2. **Panel no cubria pantalla completa** — `.nav-menu` usaba `height: 100%` que se resolvia contra el parent `<nav>` (72px) en vez del viewport. Solucion: `height: 100vh; height: 100dvh; min-height: 100vh`.
3. **transform en .header rompia position:fixed del panel** — Cuando `.header-hidden` aplicaba `transform: translateY(-100%)`, creaba un nuevo stacking context que hacia que `position: fixed` del `.nav-menu` fuera relativo a `.header` (escondido) y no al viewport. Solucion: en JS, remover `header-hidden` al abrir menu + no aplicar `header-hidden` mientras menu esta abierto.
4. **transition-delay en is-open** — Se corrigio para especificar `visibility 0s 0s` explicitamente en el estado abierto en vez de usar `transition-delay: 0s` que pisaba todos los delays.

---

## 2026-04-04 — Mobile menu V3: contraste, legibilidad y footer visible
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

---

## 2026-04-05 — Fix: touch scroll bloqueado en movil/tablet
**Archivos modificados:** `css/style.css`, `js/preloader.js`, `js/components.js`, `CLAUDE.md`

**Root cause:**
- `overflow-x: hidden` en `body` (linea 94 de style.css) causa un bug conocido de WebKit/iOS Safari donde el scroll vertical con touch queda bloqueado. La solucion es mover `overflow-x: hidden` al elemento `html` en vez de `body`.
- El preloader (`body.is-preloading { overflow: hidden }`) depends of dynamic GSAP classes. Add timeout safety.
- Dev overlay safety timeout added.

---

## 2026-04-05 — Fix V2: auditoria profunda touch scroll + limpieza codigo muerto
**Archivos modificados:** `css/style.css`, `js/components.js`, `js/preloader.js`, `js/components/header.js` (eliminado), `CLAUDE.md`

**Root causes y fixes:**
1. **`overflow-x: hidden` en html/body bloquea touch** — Reemplazado por `overflow-x: clip` en body.
2. **Film grain body::after** — Desactivado en touch devices para no interferir con touch chains.
3. **`body.menu-open`** — Cambiado a técnica WebKit `position: fixed` con window.scrollY.
4. **Canvas y overlay en hero** — `pointer-events: none` añadido.
5. **js/components/header.js** — Borrado (código muerto).

---

## 2026-04-14 — Fix bugs admin overwrite + real-time sync (Fases 1, 2, 3)
**Archivos:** `js/firestore-service.js`, `js/admin/db.js`, `js/admin/piezas.js`, `js/admin/colecciones.js`, `js/data/catalog.js`, `js/pieza.js`, `js/app.js`

**Cambios:**
- **Fase 1 (Overwrite)**: Split en `createX` y `updateX` con runTransaction. ID de pieza generado vía timestamp + random.
- **Fase 2 (Real-time)**: catalog.js usa `onSnapshot`. app.js y pages re-render en db.onChange. Campo manual `code` con unicidad.
- **Fase 3 (Hardening)**: Optimistic locking con `_version`. Transacciones abortan en `version-conflict`. Audit log en subcolecciones.

---

## 2026-04-15 — Rename label "Claridad" → "Calidad" (commit bbdee6)
**Archivos:** `admin-piezas.html`, `js/pieza.js`, `js/cart-page.js`, `js/wishlist-page.js`, `js/components/featured.js`
- Cambiado el texto visible de "Claridad" a "Calidad" en especificaciones y admin. Data key Firestore sigue siendo `clarity`.

---

## 2026-04-15 — Unificación de fondo Journal / About / CTA (commit c514dfe)
**Archivo:** `css/style.css`
- `.journal-preview.journal-v7`, `.about-teaser.about-v7` y `.cta-banner.cta-v7` cambias a background transparent para dejar ver el fondo de mármol esmeralda global.

---

## 2026-04-15 — Fix false version-conflict al borrar imagen (commit bd907e3)
**Archivos:** `js/firestore-service.js`, `js/admin/db.js`, `js/admin/piezas.js`, `js/admin/colecciones.js`
- `updatePiece` retorna `{version: nextVersion}` y el admin UI actualiza `_editingVersion` local para evitar conflictos al borrar imágenes en lote.

---

## 2026-04-15 — Lookbook V7: mejoras móvil + lazy load (commit b91e3de)
- Dimensiones inteligentes y adaptativas por breakpoint para PageFlip en móvil.
- Dedupe por content signature (JSON stringify) evita re-renderings. Lazy-loading de PageFlip vía IntersectionObserver.

---

## 2026-04-15 — Lookbook V7: anti-flash + intento de centrado (commit 1f5ac20)
- Config `size: 'fixed'`. `.is-ready` clase de CSS oculta páginas en crudo antes de la construcción de PageFlip.

---

## 2026-04-15 — Lookbook V7: centrado tapa/contratapa con shift dinámico (commit 850e730)
- En modo landscape (PC), expone variable `--pf-cover-shift = maxW/2 px` en el wrapper. CSS traslada el canvas para centrar visualmente.

---

## 2026-04-15 — Lookbook V7: sincronización del shift con animación (commit 66edc6a)
- Quita `is-cover-state` al inicio del flip, logrando que el slide horizontal ocurra en paralelo y termine junto con la rotación de 600ms.

---

## 2026-04-15 — Lookbook V7: fix "stuck at page 2" + gap real (audit completo)
- Reemplazado `flip()` por `flipNext()` / `flipPrev()` nativos. Predicción de estado de tapa/contratapa en JS antes del flip.
- Curva de transición CSS de transform ajustada a ease-in-out-cubic de 0.6s.

---

## 2026-04-16 — Lookbook V7: eliminar gap residual (easing mismatch)
- Cambiado easing CSS de `cubic-bezier` a `linear` para coincidir con la interpolación lineal interna de StPageFlip.

---

## 2026-04-16 — Lookbook V7: spine strip for gap between pages del spread
- Se añade un pseudoelemento `::after` en `.stf__block` para simular un lomo de libro blanco de 12px que cubre el gap subpixel en spreads dobles.

---

## 2026-04-17 — Portfolio V5: Reconstrucción completa sin StPageFlip
**Archivos:** `js/components/lookbook.js` (reescrito), `css/style.css`, `package.json`
- Eliminada dependencia `page-flip` debido a bugs insalvables.
- Implementado slider CSS puro basado en translation horizontal de track flex.
- Soporta Cover, Intro por colección, Gallery 2x2 y Back. Navegación táctil por swipe.

---

## 2026-04-18 — Portfolio V9: smart adaptive fit (anti-crop + anti-white-rectangle)
- Detección de aspect ratio de imágenes en JS. Si difiere >18%, usa contain + padding.
- Se añade un fondo borroso (`.ptf-card-backdrop`) con la misma imagen escalada y con opacidad reducida para ocultar bordes blancos.

---

## 2026-04-18 — Revert: eliminar sistema adaptive fit del portfolio (commit 3aff9ed)
- Eliminado el sistema adaptativo ya que el cliente subió fotos recortadas limpiamente con fondo transparente. Revertido lookbook.js y style.css.

---

## 2026-04-18 — Featured V3: implementación inicial Claude Design Variant C (commit 960570c)
- Grid asimétrico con numerales editoriales, gold sweep en bordes, glows radiales en mousemove, shine sweep al pasar mouse. Grayscale al 30% dinámico.

---

## 2026-04-18 — Featured V3.1: fix badge, contraste, spec grid, CTA (commit 43c7177)
- Badge con gold bg, textos con mayor contraste, specs grid de 2x2, botón de consulta modificado para visibilidad.

---

## 2026-04-19 — RECONSTRUCCIÓN LÍQUIDO & CRISTAL (Phases A-G)
**Cambio fundamental:** Inversión total de tema de **dark emerald V7** a **light pearl Liquid Glass iOS 26**.
**Estética:**
- `--black` mapea a ink esmeralda oklch.
- Fondo pearl en html/body con blobs animados en la capa `.bj-world`.
- Glassmorphism con highlight superior e iridescent conic rim.
- Botones aqua gel con 3D lift.
- Fuentes display: Fraunces, UI: Inter, Mono: JetBrains.

**Fases ejecutadas:**
- **Phase A (Backup)**: Copia a `.handoff/` y backup branch.
- **Phase B (Demolición)**: Limpieza masiva de stubs y legacy JS/HTML/CSS.
- **Phase C (Foundation)**: Shells de SEO y utilidades core (boot, router, cart, html).
- **Phase D (Shell)**: Header flotante, footer, cart drawer, wishlist drawer, search overlay, cookie banner, newsletter modal.
- **Phase E (Home)**: Implementación de las 9 secciones.
- **Phase F (Catálogo)**: Pills de filtros dinámicos, query params persistentes.
- **Phase G (Pieza)**: Galería de pieza, talla selectors, specs y similares.
- **Build-fix**: Assets movidos a `public/img/`, sw.js bump v3, copia tolerable de snippets.

---

## 2026-04-27 — ITERACIÓN POST-LAUNCH (Fases 11-18 + fixes de fondo)
Mejoras de paridad visual tras lanzarse el diseño Liquid Glass.

**Fases:**
- **Fase 11**: Header simplificado a 4 links planos. Catálogo con pills dinámicos y sort dropdown.
- **Fase 12**: bg unificado con bersaglio.html (eliminado aurora duplicada). Preloader de 350ms.
- **Fase 13**: `html { background: pearl }` + `body { background: transparent }` para arreglar el z-index de `.bj-world`.
- **Fase 14**: Purga total de section dividers, washed-out overlays y bordes oscuros en sections.
- **Fase 15**: Eliminadas 2348 líneas de CSS muerto en `style.css`.
- **Fase 16**: Banner editorial en nosotros y timeline interactiva de 4 hitos.
- **Fase 17**: Thumbs en pieza, GIA badge en imagen, talla selector en anillos/argollas.
- **Fase 18**: Contacto con 3 cards estilizadas (Casa, Directo, Garantía).

---

## 2026-04-28 — POLISH SESSION (Fases 19-21 + Items 1-2 + Session 3)
 Roadmap final del rediseño.

**Entregables:**
- **Fase 19**: Purga final de Collections V7 y component legacy.
- **Fase 21**: Mobile tweaks para compact drawer, cards en dock, dock gems, etc.
- **Item 1**: Checkout de 3 pasos (Carrito, Envío, Pago). Stepper glass y persistencia en sessionStorage.
- **Item 2**: Cart drawer lateral con animaciones fluidas y iOS scroll lock.
- **Sesión 3**: Animaciones de entrada staggered (`js/aqua-animations.js`), focus ring de accesibilidad global y skip-link.

---

## 2026-06-03 — Optimización de Rendimiento (PERF-01 y PERF-02)
Implementación de mejoras de rendimiento y fluidez visual en la rama `Desarrollo`.

**Entregables:**
- **PERF-01**: Eliminación del wrapper de JS para `document.startViewTransition` en `router.js` que causaba parpadeos en navegaciones completas. Habilitación de transiciones entre documentos nativas mediante CSS `@view-transition { navigation: auto; }` en `css/liquid-glass.css`.
- **PERF-02**: Caché de tipo Cache-First para todos los bundles de JS compilados por Vite en el Service Worker (`public/sw.js`). Incremento de la versión de caché del sistema a `bersaglio-v4` para renovación limpia.
- **PERF-03**: Verificación de que la deuda de código muerto de `style.css` ya se encuentra solventada (archivo eliminado en versiones previas).

---

## 2026-06-03 — Mejoras Estéticas Premium (Estilo iOS y Rediseño de Panel Admin)
Implementación de mejoras visuales en la rama `Desarrollo` para lograr un look & feel moderno tipo iOS / Apple en el sitio público y el panel de administración.

**Entregables:**
- **UX-01**: Respuesta táctil sitewide en el estado `:active { transform: scale(0.96) }` para todos los botones, tarjetas de producto y enlaces interactivos.
- **UX-02**: Transición elástica controlada en los cajones laterales (`.bj-cart-drawer` y `.bj-wishlist-drawer`) mediante curvas cubic-bezier de rebote iOS.
- **UX-03**: Morfosis dinámica en scroll del header pill flotante (Dynamic Island effect), aplicando reducción de escala, padding y desenfoque acrílico ultra-saturado (`backdrop-filter: blur(40px) saturate(210%)`).
- **UX-04**: Suavizado de radios de esquina (`--r-sm` a `--r-2xl`) para emular la curvatura squircle de Apple.
- **UX-06**: Rediseño completo del panel de administración (`css/admin.css`) integrando sidebar y topbar translúcidos (glassmorphism), radios squircle, botones en forma de píldora (pill), respuesta táctil `:active`, y unificación de colores con la paleta esmeralda y oro de Bersaglio.

---

## 2026-06-03 — Diseño Ultra-Premium, Composición Espacial y Copywriting Editorial
Refinamiento narrativo y espacial de Bersaglio Jewelry para lograr un posicionamiento de ultra-lujo al estilo de una maison de alta joyería, y unificación estética del Panel de Administración con el branding público en la rama `Desarrollo`.

**Entregables:**
- **UX-07**: Copywriting editorial poético y evocativo sitewide en `js/pages/home.js`, `js/pages/nosotros.js`, y `js/pages/contacto.js`, eliminando frases comerciales convencionales.
- **UX-08**: Aumento masivo de paddings verticales y gaps en `css/home.css`, `css/nosotros.css`, y `css/contacto.css` para dotar a las páginas de "whitespace" lujoso.
- **UX-09**: Refinamiento de variables tipográficas sitewide aumentando el kerning a `0.32em` para la clase `.eyebrow` y creación del helper `.display-luxe`.
- **UX-10**: Micro-interacción de resplandor difuso coloreado (hover glow) con tonos de esmeralda fina y oro en `.home-featured-card:hover` dentro de `css/home.css`.
- **UX-11**: Rediseño definitivo y unificación del panel administrativo (`css/admin.css`) integrando el fondo dinámico `.bj-world` atenuado en `body`, habilitando fuentes de visualización premium (`Fraunces` y `Cormorant Garamond`), y puliendo los bordes y cristalería acrílica.

---

## 2026-06-03 — SEO, Tracking, Optimización AVIF y Rediseño Premium de Autor en Admin
Implementación de mejoras de SEO JSON-LD, analítica e-commerce (GA4 + Pixel de Facebook), compresión AVIF dinámica en subida de imágenes, rediseño de sidebar claro perlado (Light Liquid Glass) y copywriting emocional optimizado.

**Entregables:**
- **SEO-01**: Inyección de esquemas JSON-LD dinámicos para productos, colecciones y migas de pan (Breadcrumbs) en `js/core/schema.js` y páginas.
- **ANALYTICS-01**: Integración asíncrona de Google Analytics 4 y Pixel de Facebook mapeando eventos clave de e-commerce y conversión de leads en `js/analytics.js` y formularios.
- **IMG-01**: Verificación de exportación AVIF dinámica vía Canvas con fallback a WebP en el cargador de imágenes `js/image-optimizer.js`.
- **ADMIN-01**: Rediseño del sidebar del panel administrativo a estilo traslúcido perlado claro (Light Liquid Glass), unificación de botones y campos de entrada con la marca, e inyección del logotipo SVG oficial de Bersaglio en todos los encabezados administrativos.
- **ADMIN-02**: Solución técnica en el login de administración (`css/admin.css`) para corregir la superposición de los formularios de ingreso y restablecimiento de contraseña mediante la regla `[hidden] { display: none !important; }`.
- **COPY-01**: Modificación integral de los textos del Home, Nosotros y Contacto con copywriting literario, emotivo y enriquecido con palabras clave de SEO (esmeraldas colombianas de Muzo/Chivor, filigrana momposina, atelier, oro de 18 quilates).
- **CONTACT-01**: Actualización global de datos de contacto unificados (Dominio: `bersagliojewelry.co`, Correo: `info@bersagliojewelry.co`, Celular/WhatsApp: `+57 301 375 2592`) en `carrito.js`, `lista-deseos.js`, `privacidad.js`, `terminos.js` y `contacto.js`.
- **SEO-02**: Estrategia de Lanzamiento Suave (Soft Launch) configurando `noindex, nofollow` en las 9 páginas en borrador o con información no verídica (`colecciones.html`, `pieza.html`, `carrito.html`, `lista-deseos.html`, `journal.html`, `entrada.html`, `gracias.html`, `privacidad.html` y `terminos.html`) y dejando indexables solo Home, Nosotros y Contacto. Reconstrucción de `sitemap.xml` para reflejar estas 3 URL únicas.
- **COPY-02**: Integración de la historia institucional real de Bersaglio (origen de puerta a puerta, visión personalizada) en `js/pages/nosotros.js`, traduciendo los conceptos a un copywriting editorial premium, estructurando una nueva sección para la Misión y Visión corporativa, y ajustando el CSS en `css/nosotros.css`.
- **UX-12**: Estabilización estática del Hero en `js/pages/home.js` removiendo el efecto de movimiento parallax/tilt sobre la imagen y el banner. Ajuste fino de tipografía en `css/home.css` (reducción de Headline font-size a `clamp(34px, 4.5vw, 62px)` y line-height a `1.15`, y reducción de `max-width` de la columna de texto a `620px`) para evitar el solapamiento con el rostro de la modelo e integrar un copywriting más fiel e institucional a Bersaglio.






