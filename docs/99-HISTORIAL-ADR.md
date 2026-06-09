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

---

## 2026-06-03 — Ajuste de Hero y Optimización de Velocidad de Carga (Imágenes WebP/AVIF)
Solución de desbordamiento de contenido en el Hero del Home y optimización drástica de rendimiento mediante el uso de variantes optimizadas de imágenes.

**Entregables:**
- **UX-13**: Ajuste de dimensiones verticales en el Hero del Home. Se redujo el padding de `.home-hero-content` de `clamp(40px, 6vw, 88px)` a `clamp(24px, 4vw, 48px)` y se achicaron los márgenes inferiores de eyebrow, headline y manifesto a 16px/20px/20px, recuperando más de 100px de altura y garantizando que el botón de acción "Descubrir la colección" no se corte.
- **PERF-03**: Optimización de peso de recursos en Home y Nosotros. Se sustituyeron referencias de imágenes pesadas en bruto (.png de hasta 6.6 MB cada una) por sus variantes optimizadas y pre-comprimidas WebP/AVIF (~25-180 KB), reduciendo el peso de carga inicial en un 98.6%.
- **PERF-04**: Actualización de Service Worker (`public/sw.js`). Se cambió la precarga de la imagen de héroe a `/img/banner-hero-1200.webp` para evitar que almacene 5.7 MB innecesariamente en caché, y se incrementó la versión a `bersaglio-v6`.

---

## 2026-06-05 — Upgrade del cerebro neuronal a template v1.0.0 (Consejo Externo + gobernanza ampliada)
Migración del cerebro documental vivo a la plantilla portable v1.0.0 mediante **upgrade quirúrgico**: adoptar la estructura/gobernanza nueva SIN perder la memoria acumulada (36 ADRs previos, lecciones L-01..L-04, lóbulos 43-UX/45-PERFORMANCE). Disparado por el cliente: instalación de `CEREBRO NUEVO/` vía `INSTALACION.md`.

**37.1 Causa raíz / contexto**: el proyecto YA tenía un cerebro neuronal (misma arquitectura, versión previa sin marcador de template). El protocolo de `INSTALACION.md` asumía un proyecto sin cerebro; aplicarlo literal habría pisado la memoria. Se confirmó con el cliente la estrategia (AskUserQuestion: upgrade quirúrgico + provider Gemini/Antigravity + merge de skills).

**37.2 Solución estructural**: (a) `CLAUDE.md` reescrito a la gobernanza v1.0.0 (§G.1–G.5: sharding + reflejos ampliados + Trigger 🛰️) conservando §1 real (Bersaglio) y §4 adaptado a `public/sw.js`/`bersaglio-vN`; marcador `<!-- brain-template-version: 1.0.0 -->`. (b) Nuevos nodos: `15-CONSEJO-EXTERNO.md` (red team) y `docs/skills-inventory.md`. (c) `brain-check.mjs` actualizado al linter superset (cap 40-LOBULOS, refs cruzadas 5a/5b/5c) con 2 parches: check #3 consciente de convención (headers por fecha vs `## NN.`) y check #4a adaptado a `public/sw.js`. (d) Hook `SessionStart` en `.claude/settings.json` + `githooks/pre-commit` + `core.hooksPath=githooks`.

**37.3 No-regresión**: memoria intacta — `00/05/10/20/30/40/43/45/99` preservados (solo se APENDIÓ wiring de 15 + skills-inventory + esta ADR). CLAUDE.md previo cuarentenado en `_legacy/CLAUDE-previo.md`. `package.json` ya tenía `brain:check` + `type:module` (sin cambios). `skills/` curada intacta (75) + 3 anexadas → 78.

**37.4 Verificación**: `npm run brain:check` → ✅ CEREBRO SANO (huérfanas, caps, desync índice, refs cruzadas). Barrido anti-placeholders (FASE 3.9) limpio.

**37.5 Anti-patterns evitados**: NO se pisó memoria (REGLA DURA #1/#4); NO se inventaron datos (§1 y 15 §2.2 derivados de evidencia leída del repo); NO se crearon lóbulos vacíos; cuarentena en vez de borrado (§G.4 límite de guardián).

**37.6 Archivos**: NUEVOS → `docs/15-CONSEJO-EXTERNO.md`, `docs/skills-inventory.md`, `docs/INSTALACION-CEREBRO.md`, `.claude/settings.json`, `githooks/pre-commit`, `_legacy/{README,CLAUDE-previo}.md`, +3 skills. MODIFICADOS → `CLAUDE.md`, `scripts/brain-check.mjs`, `docs/{00,10,40}`. INTACTOS → `docs/{05,20,30,43,45}`, `package.json`, código de la app.

**37.7 Doctrina aplicada**: §G.3 consolidación (esta ADR), §G.4 captura + límite de guardián. Pendientes de curación → TODO-01..03 en `10`. Sin cache bump (no cambió el shell de la app).

---

## 2026-06-05 — Curación post-upgrade: dedup de skills + reconciliación de inventario
Primera curación tras el upgrade del cerebro (§37). Cierra TODO-01 y TODO-02 de `10`.

**38.1 Contexto**: tras el upgrade, `skills/` tenía 78 carpetas con ruido/duplicados detectados en el barrido de instalación.

**38.2 Acciones**: (a) **Dedup (TODO-01)**: cuarentenadas 4 carpetas a `_legacy/skills-removed/` (verificadas con evidencia, reversibles vía `git mv`): `SKILL-canvas-design` (dup malformado de `canvas-design-creative` — archivo interno mal nombrado), `ecommerce skills` (dup byte-idéntico de `ecommerce`, nombre con espacio), `example-plugin` (boilerplate demo), `accessibility-audit-workspace` (solo eval JSON, sin `SKILL.md`). `skills/` 78 → 74. (b) **Inventario (TODO-02)**: `docs/skills-inventory.md` reconciliado contra las 74 carpetas reales; añadida `sales-enablement` (faltaba del catálogo); documentadas las carpetas cuyo nombre ≠ `name:` (`animate-skill-main`, `claude-skills-llm-council-main`, `firecrawl-cli`, bundle "taste" anidado) + registro de la cuarentena. (c) **Limpieza**: `CEREBRO NUEVO/` (paquete fuente, commit `6f49236`) eliminada del repo — ya trasplantada; manual en `docs/INSTALACION-CEREBRO.md`.

**38.3 No-regresión / verificación**: ninguna skill canónica perdida (las 4 retiradas eran ruido o dup; sus canónicas `canvas-design-creative`/`ecommerce`/`accessibility-audit` siguen activas). Contenido cuarentenado intacto y reversible. `brain:check` → SANO. Commits `76764ea` (upgrade) + `1be38d1` (curación).

**38.4 Pendiente**: TODO-03 (opcional) — migrar headers de `99` a formato numerado `## NN.` para activar el offset-drift estricto del linter. NO se hizo: la convención por fecha es válida y el linter ya la respeta (parche check #3).

---

## 2026-06-05 — Auditoría de instalación de skills + auto-detección (catalogación)
Cruce de las 74 skills del repo vs las cargadas en la interfaz, instalación de las repo-only útiles, y mecanismo de auto-catalogación. A pedido del cliente.

**39.1 Listado instaladas vs no**: cruzado el `name:` real de cada `SKILL.md` (varias carpetas tienen nombre ≠ name) contra las skills disponibles vía tool `Skill`. Resultado: **70/74 ya disponibles** (bundle `anthropic-skills:*` + `superpowers:*`). **Repo-only (no cargadas)**: `claude-automation-recommender`, `claude-md-improver`, `session-report`, y `design-taste-frontend-v1` (legacy, dentro del bundle taste).

**39.2 Instalación**: copiadas las 3 útiles a `~/.claude/skills/` (nivel usuario) → **activas en sesión sin reinicio** (la interfaz re-escaneó). `design-taste-frontend-v1` NO instalada (es la v1 legacy; el default `design-taste-frontend` ya está cargado). No se puede "hot-cargar" por API en la sesión viva, pero `~/.claude/skills/` surtió efecto. Es config global (todos los proyectos), reversible.

**39.3 Anomalías**: `asesor-critico-honesto` tenía `name: Asesor_Critico_Honesto` → corregido a kebab `asesor-critico-honesto`. 🔧 documentadas (no rompen — el repo es catálogo, no fuente): `code-simplifier` (def. de subagente sin `SKILL.md`), `code-modernization` (plugin de comandos/agentes), `skill-creator/skill-creator/` (anidado redundante).

**39.4 Auto-detección (regla nueva)**: (a) `CLAUDE.md §G.4` nuevo **Reflejo de Catalogación de Skills** — toda skill nueva en `skills/`/`~/.claude/skills/` se auto-detecta y documenta en `skills-inventory` sin pedirlo. (b) `brain-check.mjs` **check #6**: marca toda carpeta de `skills/` ausente del inventario ("skill sin catalogar") — backstop determinista (maneja folder≠name y bundles anidados). (c) `skills-inventory.md` reconciliado: 3 meta ✅ user-level, nota de auditoría de instalación, sección de skills del bundle no-presentes-en-repo, doctrina de mantenimiento auto-detección.

**39.5 Verificación**: `brain:check` → SANO (74/74 skills catalogadas, CLAUDE.md 231/320, sin huérfanos/vacíos).

**39.6 Pendiente**: ninguno bloqueante. Limpieza opcional de las 🔧 (quarantine de `skill-creator/skill-creator/`, normalización de `code-*`) queda como mejora menor.

---

## 2026-06-05 — Rediseño Fase 1 (mirror Liquid Glass): shell + Home + Nosotros + Contacto + dock Atajos
Cliente: aplicar con fidelidad de pixel el rediseño nuevo (`design_handoff_bersaglio_redesign` + 38 CAPTURAS) sobre la base actual, **pensando como arquitecto** (modular, sin monolitos, escalable, seguro). El live link de Claude Design expiró (404) → fuente de verdad local.

**40.1 RCA / contexto**: auditoría inicial (3 agentes) reveló que el "recambio total" del PLAN-NOVO YA estaba ejecutado → **no se re-demolió, se pulió**. El frontend ya era modular; los gaps reales son backend/seguridad (→ `41-SEGURIDAD`) + aplicar el mirror visual. Spec: `docs/superpowers/specs/2026-06-05-rediseno-fase1-design.md`.

**40.2 Solución estructural (9 incrementos verificados)**: (1) Foundation: tokens de motion en `:root`, capa `.reveal` + `js/core/reveal.js` (IntersectionObserver + red de robustez anti-invisibilidad + prefers-reduced-motion), assets. (2) Shell: header "Dynamic Island" (morph sobre el pill) + Buscar/Favoritos(badge wishlist)/ícono carrito nuevo; footer legal. (3) Home base: `home.js` → `js/home/*` (9 módulos, sin monolito), spacing 46px, parallax OFF, reveals, íconos servicios Lucide, CTA "Nuestra Maison"+dirección, shimmer. (4) Atelier: `gema.png` flotante + anillo `atSpin` + `.at-flow` + 4 cards con dot (sin números), 6 destacadas. (5) Films + Redes (`js/home/{films,social}.js` + `js/data/home-media.js`, datos Firestore-ready, logos de marca, sin emoji, sin nota Meta API). (6) QuickDock "Atajos" (`js/components/quick-dock.js` + `.qd-*` + filtro gooey). (7) Nosotros (tipografía↓, spacing 72, quitar eyebrows, timeline 1 fila, Prensa→Reseñas Google Maps, copy sin datos inventados). (8) Contacto (tipografía↓, spacing, padding-top 132, 3 canales sin Teléfono, SVGs WhatsApp/IG/coffee/phone, proceso alineado, FAQ 2×2, copy). (9) Cierre.

**40.3 No-regresión**: Firestore intacto (destacadas/categorías en vivo vía `data.onChange`); admin/`firestore-service`/`firebase-config`/`auth`/`analytics` NO tocados; `renderPieceCardHTML` intacto; IDs/clases reusadas; CSS editado **in-place** (sin override-layer); cada incremento con build verde + verificación DOM por `preview_eval`.

**40.4 Verificación**: `npm run build` VERDE en cada incremento (✓ ~3s, 0 errores propios; solo Firestore-offline en sandbox). Estructura verificada: 9 secciones home en orden; atelier gema/atSpin/4-dots; films(5 pills, lightbox)/social(4 tabs, logos); dock 5 tools+gooey; nosotros 4 reseñas/20★ + prensa fuera + timeline 5 tabs + copy "abierto al público"/"Con o sin cita"; contacto 3 canales + FAQ 2×2 + proceso "Manos a la Obra" + hero 132. Imágenes nuevas optimizadas con sharp: emerald-gem 1833→13.5KB, cart-gems 1284→69.8KB (webp).

**40.5 Anti-patterns evitados**: NO override-layer `enhancements.css` (CSS in-place, una fuente por selector); NO re-demolición; NO monolito (home partido a `js/home/*`); NO emoji; NO datos inventados (m²/cargos/convenios/renders 3D corregidos); reveals con IO (no polling rAF del kit); parallax OFF; CERO CSS muerto (press/banner-emoji/blob-dock/telefono removidos).

**40.6 Archivos** — NUEVOS: `js/core/reveal.js`, `js/home/{hero,marquee,categories,featured,editorial,services,atelier,journal-preview,cta,films,social}.js`, `js/components/quick-dock.js`, `js/data/home-media.js`, `.claude/launch.json`, `docs/41-SEGURIDAD.md`, el spec, `public/img/{emerald-gem,cart-gems}.webp`. MODIFICADOS: `css/{liquid-glass,components,home,nosotros,contacto}.css`, `js/core/boot.js`, `js/components/{header,footer,cart-drawer}.js`, `js/pages/{home,nosotros,contacto}.js`, `public/sw.js`. INTACTOS: admin/, firestore-service, firebase-config, auth.

**40.7 Doctrina + cache**: §3.1 perf (transform/opacity + RM), §3.2 API estable, §3.4 IAP por incremento. Cache `public/sw.js` **v6→v7** (§4) + reflejado en `05`. Riesgos de seguridad detectados → `41-SEGURIDAD` (Fase 2). TODOs de contenido real (reseñas Google Maps, Films, Redes Meta/TikTok) en código + `10`. Siguiente: Fase 2 hardening + Fase 3 CRM/facturación/inventario. Lecciones → `30-LECCIONES`; estructura nueva → `20-ESPACIAL`.

---

## 2026-06-05 — Fase 1 pulido: auditoría visual en vivo + 3 fixes de doctrina (transition/radii/#000)
Sesión "retomar Nuevo Bersaglio" → opción A: revisar el rediseño Fase 1 en `npm run dev` y ajustar detalles visuales. Metodología: skill `impeccable` (audit-first) + doctrina del cerebro (la fuente de contexto de diseño aquí es el cerebro, no PRODUCT/DESIGN.md).

**41.1 RCA / contexto**: Fase 1 (`e290f83`) estaba commiteada+pusheada (no "WIP" como decía el cerebro — corregido) pero verificada solo por build+DOM (L-05). Auditoría en vivo (`preview_eval`/`inspect` + lectura de CSS de Home/Nosotros/Contacto/`components`) → el rediseño está **sólido** (L-08: pulir, no demoler). 3 desviaciones objetivas de doctrina detectadas con evidencia file:line.

**41.2 Solución estructural (3 fixes)**: (1) `transition: all` → lista explícita (`background-color,border-color,color,box-shadow,transform`) en 12 spots Fase 1 (`components`×3, `home`×2, `nosotros`×2, `contacto`×5) — cumple §3.1 y elimina un reflow latente (border-width 1→1.5px se animaba). (2) Radii del critical-CSS inline sincronizadas en los **12 shells HTML** (`10/16/22/32/44`→`12/18/24/34/48`) para igualar `liquid-glass.css` + doctrina (`30 §2`). (3) Hero `background: #000` → `var(--bj-ink-emerald)` (sin negro puro; estado de carga tibio).

**41.3 No-regresión**: solo CSS/HTML cosmético; sin tocar JS, Firebase/rules, admin; `transition:all` de otras páginas (carrito/pieza/lista-deseos/admin) NO tocado (misma deuda, otra fase). IDs/clases/selectores intactos.

**41.4 Verificación**: `npm run build` VERDE (✓ 3.68s; warning de chunk = Firebase SDK, preexistente). En vivo (`preview_eval`): `--r-sm=12px`, `--r-2xl=48px`; `.home-hero-banner` bg = oklch(18% .05 155) (no #000); `.films-pill` transition = lista explícita (no `all`). Fonts verificadas **activas** por render-width (Cormorant/Fraunces/Manrope/Space Mono) — `document.fonts.check()` daba falso negativo por subsetting `unicode-range`. Sin errores nuevos en consola (solo Firestore-offline del emulador local).

**41.5 Anti-patterns evitados**: no `transition: all` (§3.1); no `#000` en superficies (impeccable); edición CSS in-place; sin tocar lo fuera de scope; verificación por **evidencia/computed-values**, no por screenshot (L-05).

**41.6 Archivos** — MODIFICADOS: `css/{components,home,nosotros,contacto}.css`; los 12 shells HTML (critical-CSS radii: index, nosotros, contacto, carrito, colecciones, entrada, gracias, journal, lista-deseos, pieza, privacidad, terminos); `public/sw.js` (v8). INTACTOS: JS, admin/, firestore/firebase, otras CSS.

**41.7 Doctrina + cache**: §3.1 (transition explícito), §3.4 IAP previo. Cache `public/sw.js` **v7→v8** (§4, cambian shells) + reflejado en `05`. UX-01 (haptic) ya estaba implementado → `43-UX` actualizado. Observaciones (fuera de scope): modal email-capture auto-abre en load (intrusivo; su backdrop full-screen `blur(8px)` causa timeouts de screenshot — refina L-05); deuda `transition:all` en carrito/pieza/lista-deseos/admin. Lecciones → `30` L-09/L-10.

---

## 2026-06-06 — CRM Fase 3 · Bloque 1 (Fundamentos): rol vendedora + reglas RBAC de cuentas por cobrar + endurecimiento adversarial
Cliente: "Construyamos el Bloque 1 del CRM". Ejecución del plan `docs/superpowers/plans/2026-06-06-crm-bloque1-fundamentos.md` (TDD, skill `executing-plans`) sobre la spec aprobada `docs/superpowers/specs/2026-06-06-crm-cuentas-design.md`. NO toca producción (reglas aditivas; sin merge a `main`).

**42.1 RCA / contexto**: Primer módulo del CRM = núcleo de **cuentas por cobrar / fiado** (reemplaza el Kardex Excel). Prerrequisito del plan: harness `npm run test:rules` en verde. Hallazgo de arranque: **Java SÍ estaba instalado** (`C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot`, Temurin 25 LTS) — solo faltaba enlazarlo (`JAVA_HOME`/PATH vacíos); el "bloqueo crónico de Java" del cerebro era stale (L-12 corregida). Al correr la suite EXISTENTE, **3 tests S5/S6 fallaban** = la causa del "fallo de CI sin diagnosticar": los validadores S6 usaban `d.campo == null` para opcionales, pero en reglas Firestore **acceder a un campo ausente LANZA error** (`Property X is undefined on object`), no devuelve null (L-13 tenía ese hecho AL REVÉS → corregida; ver §42.5).

**42.2 Solución estructural**: (1) **Fix S6** (4 validadores) `d.campo == null` → `!('campo' in d) || d.campo is <tipo>` → suite a 14/14. (2) **Tarea 1**: rol `vendedora` en `functions/index.js` (`ROLE_LEVEL` + `createUser`/`updateUserRole`). (3) **Tareas 2-5** (TDD rojo→verde): helpers `isVendedora`/`clienteOwnerUid`/`clienteValido`/`movimientoValido` + reglas de `clientes` (admin todo; vendedora scoped a `vendedoraUid==auth.uid`; sin editar/borrar), subcolección `movimientos` (append-only para vendedora), `solicitudesCorreccion` (crea pendiente; admin aprueba), `config` (write endurecido `isOwner`→`isAdmin`). (4) **Revisión adversarial** (workflow, 4 lentes) → 7 huecos reales corregidos: vendedora no crea movimiento `anulado:true` ni con auditoría de anulación; vendedora limitada a `tipo` `factura`/`abono` (no `apertura`/`ajuste`); `clienteValido` con `hasOnly` (bloquea `saldoActual` = solo CF, e inyección de campos); solicitud con dueño del `clienteId` + `estado=='pendiente'` + sin `autorizadoPor`; `clienteOwnerUid` tolerante a cliente directo de Kary (sin `vendedoraUid`); `config/{docId}` read = solo `status` público (resto admin/vendedora). Descartado por evidencia: "vendedora desactivada conserva acceso" → `deactivateUser` deshabilita el usuario en Auth (`functions/index.js:114`) → no autentica.

**42.3 No-regresión**: solo `firestore.rules` + `functions/index.js` + `tests/firestore-rules.test.mjs` (todo aditivo salvo el fix S6 y el endurecimiento de `config`, ambos correctos). CERO cambios en `js/`, admin, SW o shells → **sin cache bump** (§4 no aplica). Build Vite VERDE (✓ 2.90s, 124 módulos). `config/status` sigue público → health-check de la web intacto; `onInquiryCreated` usa Admin SDK (bypassa reglas) → intacto.

**42.4 Verificación**: `npm run test:rules` (emulador Firestore local, JDK 25) **54/54 PASS** = S5/S6 (Fase 2) + CRM (clientes/movimientos/config/solicitudes) + HARD (endurecimiento: anulado-en-create, tipo por rol, hasOnly, auto-aprobación, cliente directo, owner≈admin, editor/ghost denegados, aislamiento en `list`/`query`, confidencialidad de config). TDD real: rojo observado (9 `assertSucceeds` fallando sin reglas) → verde tras reglas.

**42.5 Anti-patterns evitados + autocrítica**: idiom correcto de opcionales en reglas (presencia antes que acceso); whitelist `hasOnly` anti-inyección; campos server-only (`saldoActual`, `anulado`, auditoría) nunca escribibles por el cliente; verificación por evidencia (emulador real, no asunción). **Reflejo de Autocrítica**: L-13 afirmaba que `data.foo` ausente "devuelve null (no lanza)" — FALSO para `request.resource.data` (lanza) → ese hecho erróneo generó el bug S6. Corregido en `30`.

**42.6 Archivos** — MODIFICADOS: `firestore.rules` (helpers CRM + fix S6 + `clientes`/`movimientos`/`solicitudesCorreccion` + `config`), `functions/index.js` (rol `vendedora`), `tests/firestore-rules.test.mjs` (+40 tests: 14→54). INTACTOS: todo `js/`, admin, SW, shells, `storage.rules`. Colecciones nuevas en Firestore (declaradas en reglas): `clientes`, `clientes/{}/movimientos`, `solicitudesCorreccion`, `config/negocio`.

**42.7 Doctrina + cache + siguiente**: §3.3 (verificar con evidencia: el emulador desmintió 2 supuestos del cerebro), §3.4 IAP, §3.6 (seguridad por diseño: RBAC server-side + append-only). Sin cache bump. **Pendiente de despliegue**: las reglas NO están en `main` (deploy = merge gated por OK de Daniel). **Recomendado**: reactivar triggers `push`/`pull_request` en `.github/workflows/firestore-rules-test.yml` (la causa del rojo ya está resuelta). **Siguiente (Bloque 2)**: Cloud Function `onWrite` de `movimientos` que recalcula `saldoActual` (resolver ahí el signo de `ajuste`/saldo a favor, hoy `monto>=0`). Lecciones → `30` (L-12/L-13 corregidas, L-16 nueva); espacial → `20`; seguridad → `41`; arquitectura → `50 §5`.

---

## 2026-06-06 — CRM Fase 3 · Bloque 2 (Saldo): Cloud Function `recalcSaldoCliente` + modelo de signo
Cliente: "YA COMMITEÉ TODO CONTINUA" (tras Bloque 1, commit `903b758`). Construcción del cálculo de saldo server-side (spec `crm-cuentas-design.md §4`), continuación directa de §42.

**43.1 RCA / contexto**: el Bloque 1 dejó el libro de movimientos pero `saldoActual` era solo un campo desnormalizado sin quién lo escribiera. El Kardex Excel calculaba el saldo con fórmulas frágiles (`#REF!`); el reemplazo confiable es una Cloud Function que recomputa el saldo desde la fuente de verdad (los movimientos) en cada cambio. Decisión de diseño abierta heredada de §42: el signo de `ajuste` y el "saldo a favor" (spec §11) — resuelta aquí (§43.2).

**43.2 Solución estructural**: (1) **`functions/saldo.js`** — función PURA `computeSaldo(movimientos)`: `saldo = Σ` con signo de movimientos NO anulados; `factura`/`apertura`/`ajuste` suman, `abono` resta; redondeo a 2 decimales (anti-drift de float); defensiva (tipo desconocido/monto no numérico/anulado aportan 0). (2) **Trigger `recalcSaldoCliente`** (`onDocumentWritten('clientes/{clienteId}/movimientos/{movId}')`) en `functions/index.js`: en **transacción** lee el cliente (si no existe, no lo resucita) + toda su subcolección de movimientos, recomputa con `computeSaldo`, y escribe `saldoActual` + `saldoActualizadoEn` vía Admin SDK (bypassa reglas → es la ÚNICA escritura de `saldoActual`). Idempotente; no re-dispara (escribe en el cliente, no en movimientos). (3) **Regla `movimientoValido`**: `monto` de `factura`/`abono` ≥ 0; `apertura`/`ajuste` (solo admin) admiten **negativo** → modela saldo a favor inicial y corrección a la baja. **Modelo de signo**: saldo **positivo = el cliente debe**; **negativo = saldo a favor** (spec §11). Marcado como confirmable por Daniel/Kary (doctrina "no asumir" en plata).

**43.3 No-regresión**: solo `functions/` (+ trigger), `firestore.rules` (relajación de `monto` para apertura/ajuste, aditiva), `tests/` y `package.json` (3 scripts nuevos: `test:saldo`, `test:saldo:integration`). CERO cambios en `js/`, admin, SW, shells → **sin cache bump**. Las funciones existentes (`createUser`/`onPieceDeleted`/`onInquiryCreated`…) intactas y cargadas OK por el emulador. Build Vite VERDE (✓ 2.96s).

**43.4 Verificación**: TDD en 3 capas. (a) **Aritmética pura** `npm run test:saldo` → **12/12** (factura/abono/apertura/ajuste, anulado excluido, saldo a favor negativo, escenario realista de cuenta corriente, defensivos, decimales 0.1+0.2=0.3). (b) **Reglas** `npm run test:rules` → **57/57** (incl. 3 nuevos: admin apertura/ajuste negativos OK, vendedora factura negativa FAIL). (c) **Integración** `npm run test:saldo:integration` (emuladores Firestore+Functions) → **5/5**: el trigger dispara y `saldoActual` cuadra tras factura(100k)→abono(60k)→apertura −10k(50k)→anular factura(−50k)→borrar abono(−10k). Log confirma `recalcSaldoCliente` registrado y ejecutado.

**43.5 Anti-patterns evitados**: lógica de dinero como **función pura testeable** (no enterrada en el trigger) → precisión exacta verificable sin emulador; recomputar desde la fuente de verdad (idempotente) en vez de incrementar (evita drift, el pecado del Excel); transacción para carreras; `saldoActual` server-only (Admin SDK, nunca el cliente). Verificación end-to-end real, no asumida (§3.3). Decisión de signo **explícita y marcada**, no silenciosa (doctrina "no asumir").

**43.6 Archivos** — NUEVOS: `functions/saldo.js`, `functions/saldo.test.mjs`, `functions/saldo.integration.test.mjs`. MODIFICADOS: `functions/index.js` (import + trigger `recalcSaldoCliente`), `firestore.rules` (`movimientoValido` signo), `tests/firestore-rules.test.mjs` (+3 tests, 57 total), `package.json` (scripts). INTACTOS: todo `js/`, admin, SW, shells, `storage.rules`. Campo nuevo en `clientes`: `saldoActualizadoEn` (timestamp).

**43.7 Doctrina + cache + siguiente**: §3.3, §3.4, §3.6 (cost-aware: recompute O(movs/cliente), aceptable para un libro de fiado), memoria "precisión exacta / no asumir". Sin cache bump. **Pendiente de despliegue**: el trigger solo corre desplegado (`firebase-deploy.yml` al merge a `main`, gated por Daniel). **Recomendado**: el CI debería correr también `test:saldo` (+ integración) además de `test:rules`. **Siguiente (Bloque 3)**: Panel de Kary (cartera total/por vendedora, atrasados, cumpleaños) + bandeja de correcciones — primera UI del CRM. Lecciones → `30 §L-17`; espacial → `20`; seguridad → `41 §1.6`; arquitectura → `50 §5`.

---

## 2026-06-06 — CRM Fase 3 · Bloque 3 (Panel de Kary): primera UI del CRM
Cliente: "continuemos con lo que recomiendes" (+ directiva: Claude commitea; revisión visual de Daniel al final). Primera interfaz del CRM, dentro del panel admin existente.

**44.1 RCA / contexto**: el backend (B1 reglas + B2 saldo) necesitaba UI para que Kary opere el fiado. Se reusó el patrón admin existente (`admin-*.html` + `js/admin/*.js` + `css/admin.css` oscuro + auth `requireAuth`/`hasRole` + `adminDb`). Spec §7.

**44.2 Solución estructural**: (1) **`js/crm-service.js`** — capa de datos del CRM **desacoplada** del `firestore-service.js` público (límite de módulo, charter §3): clientes/movimientos/solicitudes/config + helpers (`carteraTotals`, `carteraPorVendedora`, `cumpleanosDelMes`, `fmtCOP`). (2) **Cuentas** (`admin-cuentas.html`+`cuentas.js`): lista de clientes con saldo (coloreado) + cartera total/por vendedora + nuevo cliente (modal) + búsqueda + **bandeja de solicitudes pendientes** (aprobar = anula el movimiento referido y marca aprobada / rechazar) + **cumpleaños del mes** (link WhatsApp). (3) **Ficha** (`admin-cuenta.html`+`cuenta.js`): saldo en vivo (`onClienteChange`) + historial + ➕factura/➕abono (modal) + anular. (4) **Configuración** (`admin-config.html`+`config.js`): fecha de corte de migración + datos del negocio (`config/negocio`). (5) Nav "Cuentas" en las 6 páginas admin + gating en `shared.js` (oculto a editor); ⚙ Configuración en el topbar de Cuentas. La UI es **solo-lectura del saldo** (lo escribe la CF); solo agrega/anula movimientos.

**44.3 No-regresión**: archivos nuevos + nav aditivo (1 link en 6 páginas) + `shared.js` (1 gating) + `css/admin.css` (estilos ficha, aditivos). Vite **hashea** `admin.css` (`/assets/auth-*.css`) → **sin cache bump** (auto-invalida, §4 verificado). Resto del admin intacto. Build Vite VERDE.

**44.4 Verificación**: `npm run build` VERDE (Vite descubre las 3 páginas nuevas + bundles). **Diseño validado visualmente** vía mocks estáticos renderizados en el preview (capturas de Cuentas + ficha + móvil mostradas a Daniel → consistente con el admin, aprobado). Las secciones añadidas (bandeja/cumpleaños/config) reusan los MISMOS componentes ya validados. ⚠️ Verificación **funcional** (con datos+auth) pendiente: en `dev` la app conecta a **emuladores** (L-18) → camino real = `firebase emulators:start` + seed + `npm run dev` + login; o desplegar. Screenshots del preview se cuelgan con el CSS de cristal del admin (L-09) → no se pelean.

**44.5 Anti-patterns evitados**: módulo CRM **desacoplado** (no inflar el service público); **reuso** del patrón y componentes admin (no reinventar UI); saldo **solo-lectura** en la UI (fuente = CF); verificación visual por mock estático (sortea auth+L-05); no pelear screenshots (L-09).

**44.6 Archivos** — NUEVOS: `admin-cuentas.html`, `admin-cuenta.html`, `admin-config.html`, `js/admin/{cuentas,cuenta,config}.js`, `js/crm-service.js`. MODIFICADOS: `admin.html` + `admin-{piezas,colecciones,consultas,usuarios}.html` (nav), `js/admin/shared.js` (gating), `css/admin.css` (ficha). INTACTOS: backend, sitio público.

**44.7 Doctrina + siguiente**: §3.6 (módulos desacoplados, reuso), patrón existente. Sin cache bump. ⚠️ **"Cuentas atrasadas"** (spec §7) **NO implementado**: requiere modelo de vencimiento/aging (los movimientos no tienen fecha de vencimiento) → diferido (decidir el modelo con Daniel/Kary). **Pendiente despliegue** (gated). **Siguiente (Bloque 4)**: app de vendedora responsive — **añadir `vendedora` a `auth.js ROLE_LEVELS`** (hoy no está) + vistas scoped. Luego B5 (migración Excel) y B6 (reportes). Lección L-18 (dev↔emuladores); espacial → `20`; arquitectura → `50 §5`.

---

## 2026-06-06 — CRM Fase 3 · Bloque 4 (App de vendedora, responsive)
Cliente: "vamos a Bloque 4 y luego probamos". App móvil-first para que cada vendedora gestione SOLO su cartera, separada del Panel de Kary.

**45.1 RCA / contexto**: las vendedoras (uso diario en celular) necesitan vistas simples scoped a sus clientes. Reusa `crm-service.js` + componentes de `css/admin.css` + auth Firebase compartida; pero shell propio (sin el sidebar admin).

**45.2 Solución estructural**: (1) **`auth.js` `requireAuthExact(roles)`** — guard por **membresía exacta**. **Decisión clave**: `vendedora` NO se mete en `ROLE_LEVELS` (jerarquía owner>admin>editor); si tuviera nivel 1 (=editor) heredaría acceso a páginas de editor. Queda FUERA (nivel 0 → bloqueada de páginas jerárquicas); sus páginas usan `requireAuthExact(['vendedora','admin','owner'])`. (2) **`login.js`**: redirect por rol (`vendedora`→`vendedora.html`, resto→`admin.html`). (3) **`crm-service`**: `onClientesDeVendedora(uid)` (query `where vendedoraUid==uid` — un `list` sin ese filtro lo deniegan las reglas) + `crearSolicitud`. (4) **`vendedora.html`+`cuentas.js`**: mis clientes (tarjetas táctiles) + mi cartera + nuevo cliente (a su nombre, `origen:'vendedora'`). (5) **`vendedora-cliente.html`+`ficha.js`**: saldo en vivo + movimientos + ➕factura/➕abono + **solicitar corrección** (no anula; pide a Kary). `js/vendedora/ui.js` = helpers lean (sin arrastrar `firestore-service`). (6) `css/admin.css` `.vend-*` (móvil-first, fondo sólido sin auroras → ligero).

**45.3 No-regresión**: archivos nuevos + `auth.js`/`login.js`/`crm-service.js` aditivos + `admin.css` aditivo. Backend, sitio público y panel admin intactos. Build VERDE. Sin cache bump (Vite hashea `admin.css`; páginas nuevas network-first).

**45.4 Verificación**: `npm run build` VERDE (Vite descubre `vendedora.html` + `vendedora-cliente.html` + bundles). **Diseño validado por mocks** (capturas móviles de "Mis cuentas" + ficha mostradas a Daniel → consistente, aprobado). Funcional pendiente: login como vendedora con emuladores+seed (L-18) o desplegado.

**45.5 Anti-patterns evitados**: rol como **eje separado** (no forzar la jerarquía → L-19); app **desacoplada y lean** (`ui.js` propio); las **reglas** son la fuente del aislamiento (la UI filtra, las reglas garantizan); **solicitar corrección** en vez de editar (append-only para vendedora).

**45.6 Archivos** — NUEVOS: `vendedora.html`, `vendedora-cliente.html`, `js/vendedora/{ui,cuentas,ficha}.js`. MODIFICADOS: `js/auth.js` (`requireAuthExact`), `js/admin/login.js` (redirect por rol), `js/crm-service.js` (`onClientesDeVendedora`+`crearSolicitud`), `css/admin.css` (`.vend-*`). INTACTOS: backend, admin, sitio público.

**45.7 Doctrina + siguiente**: §3.3, §3.6. Sin cache bump. Lección **L-19** (rol no-jerárquico). **Siguiente = PROBAR** (cliente: "luego probamos"): desplegar reglas+functions (o emuladores+seed), login como Kary y como vendedora, validar el flujo **factura → saldo** end-to-end. Luego B5 (migración del Kardex) y B6 (reportes). Espacial → `20`.

---

## 2026-06-06 — CRM Fase 3 · Verificación E2E (emuladores) + fix de login (lastLogin)
Cliente: "vamos a Bloque 4 y luego probamos". Prueba end-to-end real en local tras construir B1-B4 (emuladores Firestore+Auth+Functions, SIN tocar producción).

**46.1 RCA / contexto**: B1-B4 estaban verificados por tests (reglas 57, CF 12+5) + build, pero el **glue del navegador** (login por rol, UI→datos, CF→UI en vivo) no se había probado. Setup: `firebase emulators:start --only firestore,auth,functions --project bersaglio-jewelry` + `functions/seed-emulator.mjs` (owner+vendedora+1 cliente) + `npm run dev` (la app conecta a emuladores, L-18) + login automatizado en el preview.

**46.2 Bug encontrado + fix**: el login de la **vendedora** falló con `PERMISSION_DENIED`. Causa: `signIn()` (`auth.js`) escribía `lastLogin` en `users/{uid}` del **propio** usuario, pero la regla `users` `update` solo permite owner/admin → vendedora/editor **denegados** → el `await setDoc` lanzaba → **login fallaba**. Habría bloqueado el login de TODA vendedora/editor en producción. **Fix**: `lastLogin` best-effort (try/catch) — es telemetría, no debe tumbar la sesión.

**46.3 No-regresión**: solo `auth.js` (try/catch aditivo). Login de owner/admin intacto (su `lastLogin` sí lo permiten las reglas). Build verde.

**46.4 Verificación (E2E, post-fix)**: **vendedora** login → su app (solo SU cliente, scoped) → registrar **factura $500.000** → CF `recalcSaldoCliente` recomputa → saldo en vivo **$500.000** → **abono $200.000** → saldo **$300.000** (resta exacta). **Owner** login → redirect a `admin.html` → Panel de Kary ve el mismo cliente + cartera **$300.000** (read admin sin filtro). Toda la cadena (auth + RBAC scoped + CF + UI en vivo) confirmada con datos reales en emulador.

**46.5 Anti-patterns evitados**: telemetría no-crítica nunca bloquea auth (best-effort); **E2E con emuladores caza bugs de integración** que los tests de reglas/unitarios NO ven (el write de `lastLogin` de signIn no estaba en ningún test); verificación con datos reales, no asumida (§3.3).

**46.6 Archivos** — MODIF: `js/auth.js` (lastLogin best-effort). NUEVO: `functions/seed-emulator.mjs` (herramienta E2E local). `firebase.json` (ignore `*.test.mjs` + `seed-emulator.mjs` del deploy de functions).

**46.7 Doctrina + siguiente**: §3.3. Sin cache bump. **CRM (B1-B4) VERIFICADO end-to-end.** Pendiente: B5 (migración del Kardex), B6 (reportes), "atrasados" (aging). **Despliegue a producción gated por Daniel** (merge a `main` + `firebase deploy --only functions,firestore:rules`). Lección **L-20**; procedimiento E2E reusable (seed + L-18).

## 2026-06-06 — CRM Fase 3 · LANZAMIENTO a producción: deploy + migración Fase A (344 clientes de Kary)
Cliente: "retomemos el lanzamiento del CRM". Día de lanzamiento: desplegar el CRM a prod y migrar la cartera real de Kary. Precedido por una auditoría de preparación read-only (workflow de 4 agentes) que aterrizó el estado REAL (§3.3) y corrigió supuestos del playbook.

**47.1 Causa raíz / contexto**: El CRM (B1-B5 + editabilidad) estaba construido y verificado en emulador (345/345) pero NO desplegado a prod. El audit reveló 3 correcciones al cerebro: (a) `main` NO estaba "intacta" — ya tenía rediseño Fase 1 + CRM B1-4 (merge del incidente L-14); (b) el playbook afirmaba que `firebase-deploy.yml` despliega reglas+functions → **FALSO**, es Hosting-only (L-22); (c) **`recalcSaldoCliente` NO existía en prod** (`functions:list` mostró solo las 5 pre-CRM) = bloqueo duro para migrar (el cargador hace poll esperándola).

**47.2 Solución (secuencia de lanzamiento)**: (1) **Deploy manual** `firebase deploy --only firestore:rules,firestore:indexes,functions` → reglas CRM + índices + **`recalcSaldoCliente` creada** + 5 functions actualizadas (`--force` seguro: `index.js` sigue exportando las 5). (2) Merge `Desarrollo→main` ya hecho vía **PR #189** (`a04b1a3`, 12:35) → CI redesplegó sitio (Pages+Hosting). (3) **ADC** para el Admin SDK: `gcloud auth application-default login` + `set-quota-project` (NO basta `firebase login`, L-23). (4) **Preflight read-only** (ADC ok, `clientes`=0, sin marca) antes de escribir. (5) **Migración** `$env:CUTOFF='2026-06-06'; node functions/cargar-migracion.mjs` → 345 clientes + aperturas → CF recomputó → **345/345 exacto** al primer intento. (6) Seed de 12 pendientes.

**47.3 No-regresión**: sitio en vivo HTTP 200 verificado (`bersagliojewelry.co` + `.github.io`) post-deploy; fallback de llaves Firebase presente (L-14 cubierto). Reglas compiladas OK; las 5 functions previas solo actualizadas (no borradas).

**47.4 Verificación + corrección de datos**: la verificación post-migración leyó **cartera $1.012M** con un cliente **"TOTAL" = $506M** en el top → era la **fila de totales del Excel** colada como cliente (su saldo ≈ la suma de los demás). Borrado de prod (1 doc + movimiento). **Estado final correcto: 344 clientes, cartera $506.510.780, 12 pendientes, 13 con saldo a favor (anticipos).** Extractor parchado (`NON_CLIENT_RE`) para no recolarla (L-24).

**47.5 Anti-patterns evitados**: no confiar en refs/playbook stale (audit + `git fetch` + `functions:list` reales, §3.3); no escribir a prod sin preflight read-only; no asumir que el merge a `main` despliega reglas/functions (es manual); verificación de datos post-migración (cazó la fila TOTAL), no asumir "345 ok".

**47.6 Archivos** — código MODIF: `tools/extraer-kardex.py` (filtro `NON_CLIENT_RE`). PROD (no-código): reglas+índices+functions desplegadas; 344 clientes + aperturas + 12 pendientes en Firestore. Temporales creados+borrados (`functions/_{preflight,verify,analyze,delete-total}.mjs`). Cerebro: 05/10/30/99/00.

**47.7 Doctrina + siguiente**: §3.3 + §G.4 (auditoría previa). Sin cache bump (no se tocó shell). Lecciones **L-22/L-23/L-24**. **Pendiente post-lanzamiento**: vendedoras (crear accesos — faltan correos; cargan clientes fresco, L-21), revisar nombres con Kary (editabilidad lista), B6 reportes + "atrasados" (aging con `config.diasPlazo`). Deuda técnica: runtime **Node 20** (decommission 2026-10-30) + `firebase-functions` viejo.

## 2026-06-06 — Mantenimiento · Upgrade del runtime de Cloud Functions (Node 20→22 + firebase-functions v6→v7)
Tarea spin-off de la deuda técnica de ADR §47 (avisos del deploy). Daniel la lanzó; ejecutada en la rama `chore/upgrade-functions-v7-node22`.

**48.1 Causa**: El deploy del lanzamiento avisó que el runtime **Node 20** se decomisiona el 2026-10-30 y que `firebase-functions` (6.6.0) estaba viejo (latest 7.2.5, un major por delante). Sin actualizar, a futuro no se podría desplegar functions.

**48.2 Solución**: `functions/package.json` → `engines.node` 20→**22**, `firebase-functions` ^6.3.0→**^7.2.5**, `firebase-admin` ^13.0.0→**^13.10.0**. `npm install --prefix functions`. **Cero cambios de código**: la superficie usada (v2 `onCall`/`HttpsError` + `onDocumentWritten/Created/Deleted`) NO cambió en v7.

**48.3 No-regresión / compatibilidad** (§3.3, evidencia múltiple): (a) breaking changes v7 del release oficial (WebFetch) — Node mín 18, se elimina `functions.config()`, v1 Event→LegacyEvent; NADA toca nuestra superficie; (b) el `package.json` instalado (autoritativo offline): `engines.node>=18` (22 ✅) + `peerDependencies.firebase-admin ^11||^12||^13` (13.10 ✅) + exports `./v2/https` y `./v2/firestore` con `require`; (c) **tests verdes con v7**: `test:saldo` 12/12 (puro) + `test:saldo:integration` 5/5 (emulador carga las 6 functions y `recalcSaldoCliente` ejecuta).

**48.4 Deploy + verificación en prod**: `firebase deploy --only functions` → las **6 functions actualizadas a Node.js 22 (2nd Gen)**, sin avisos de deprecación. `functions:list` confirma `nodejs22` en las 6. **Smoke test en prod** (cliente TEMP `activo:false`): `recalcSaldoCliente` recalculó factura→123, abono→100; cliente borrado. Verificado: **344 clientes reales intactos, 0 residuos**.

**48.5 Anti-patterns evitados**: no subir un major a ciegas (breaking changes + tests + smoke); no confiar solo en memoria del changelog (el agente de research quedó sin red y NO inventó, §3.3 — se usó el paquete instalado + release oficial); smoke en prod sin tocar datos reales (temp + cleanup).

**48.6 Archivos** — MODIF: `functions/package.json` (+ `functions/package-lock.json`). PROD: 6 functions redeployadas a nodejs22. Temporales creados+borrados (`functions/_smoke-v7.mjs`, `_count.mjs`). Cerebro: 05/10/30/99/00.

**48.7 Doctrina + siguiente**: §3.3 + L-17 (testing functions). Sin cache bump. Lección **L-25**. Deuda Node 20 de §47 → **RESUELTA**. Repo: rama `chore/upgrade-functions-v7-node22` mergeada a `Desarrollo`; PR a `main` pendiente (flujo de Daniel).

## 2026-06-06 — CRM Reestructura Fase R: vendedora = dato (no usuario) + CRM admin-only
Cliente: "Kary me dijo que ninguna de las vendedoras tendrán usuario… ella es quien creará a las vendedoras y asignará sus clientes". Reestructura del CRM ya en producción (ADR §47). Diseño: spec `docs/superpowers/specs/2026-06-06-crm-restructure-kary-y-movimientos-design.md`; plan `docs/superpowers/plans/2026-06-06-crm-fase-r-roles.md`. Ejecutada con subagentes (1 implementador + doble revisión spec/calidad por tarea).

**49.1 Causa**: el diseño original (spec §2/§5/§6/§7) modelaba a la vendedora como USUARIO (rol `vendedora`, app móvil propia, flujo `solicitudesCorreccion`). El negocio real: **solo Kary (admin) opera**; las vendedoras le pasan la info y ella carga todo (memoria `project-crm-kary-sole-operator`).

**49.2 Solución (6 tareas TDD)**: (1) reglas: nueva colección `vendedoras` + CRM (`clientes`/`movimientos`/`vendedoras`) **admin/owner-only**; quitar `isVendedora()` y el bloque `solicitudesCorreccion`; `clienteValido` usa `vendedoraId`. (2) `crm-service.js`: API de vendedoras (`onVendedorasChange`/`createVendedora`/`updateVendedora`) + `vendedoraId`; quitar scope/solicitudes. (3) UI gestión de vendedoras en Configuración (crear/desactivar). (4) Panel usa `vendedoraId` + dropdown desde `vendedoras`; quitar bandeja de solicitudes. (5) quitar el rol vendedora (auth/login/functions) + **borrar la app de vendedora** (`vendedora*.html`, `js/vendedora/*`). (6) verificación + deploy.

**49.3 No-regresión / verificación**: reglas 29/29, saldo 12/12 + integración 5/5, build verde; revisión de coherencia end-to-end (GO). `recalcSaldoCliente` intacta. Los **344 clientes** quedan sin tocar (sin vendedora → "Directo de Kary", editables por admin). Smoke en prod: 344 intactos, colección `vendedoras` write/read/delete OK.

**49.4 Deploy**: `firebase deploy --only firestore:rules,functions` (manual, L-22) — reglas + 6 functions actualizadas. Sitio (panel nuevo) por **PR #191 → `main` → CI**. Sitio HTTP 200. Falta solo el smoke de panel en navegador (Kary): Configuración→Vendedoras→crear + asignar a un cliente.

**49.5 Anti-patterns evitados**: subagentes con doble revisión por tarea (spec, luego calidad); TDD en reglas (red→green); `node --check` por archivo + build full al final (tareas acopladas por el build); verificación de datos en prod; no asumir estado de git — `origin/main` avanzó por PR de Daniel (`git fetch` siempre, §3.3, **L-26**).

**49.6 Archivos** — 16 (−905/+184): `firestore.rules`, `tests/firestore-rules.test.mjs`, `js/crm-service.js`, `js/admin/{config,cuentas,cuenta}.js`, `admin-{config,cuentas}.html`, `js/auth.js`, `js/admin/login.js`, `functions/index.js`; borrados `vendedora.html`, `vendedora-cliente.html`, `js/vendedora/*`. Commits `e37a466·bae17ac·274a097·ddef8f3·26d6327·3719787` (`feature/crm-fase-r-roles` → Desarrollo → main PR #191). Cerebro: 05/10/20/30/99/00.

**49.7 Doctrina + siguiente**: §3.3 + §G.4 + memoria `project-crm-kary-sole-operator`. Sin cache bump (Vite hashea; shell público no tocado). Lección **L-26**. **Siguiente = Fase M** (movimientos robustos: `fecha` real editable + `historial` de edición + transparencia; spec listo). Pendiente operativo: que Kary cree sus vendedoras + revise nombres.

## 2026-06-07 — Panel v2 (mini-ERP): diseño maestro + Consejo Externo + F-CHASIS-A construido y desplegado
Cliente: el panel se veía "muy básico / no parece un CRM que contiene todo"; exige pensar TODO el sistema desde ya (CRM/leads + cartera + facturación + inventario + pagos + trazabilidad) y construir por fases. Brainstorm con compañero visual + 5 workflows (grounding del panel · investigación de CRMs líderes · diseño del sistema completo con estudio del blueprint de Altorra Cars + suites Alegra/Siigo/Shopify/Odoo/Square · red-team empresarial 7 lentes · revisión adversarial del spec). Diseño: spec maestro `docs/superpowers/specs/2026-06-07-bersaglio-arquitectura-maestra-design.md` (v3) + plan `docs/superpowers/plans/2026-06-07-f-chasis-a-navegacion-v2.md`.

**50.1 Causa**: la BD del CRM ya es sólida (ADR §42/§43), pero la capa de presentación + dominio era cruda: nav plana duplicada en 8 HTML, números desbordados, Vendedoras enterrada en Config, sin estados de cuenta. El cliente además amplió el alcance a mini-ERP.

**50.2 Solución (arquitectura, v3)**: IA "C" (HubSpot: barra superior + rail agrupado como DATO + Workspace "Hoy"), evoluciona a "B" (conmutador de áreas) sin reescribir. Event-driven con **orquestador síncrono** (CF callable = único escritor del dinero; **saldo síncrono O(M)** en la misma transacción). **Money entero de COP sin backfill**. Factura **DIAN-ready por Adapter** (no acopla el schema a UBL). Append-only + anular≠borrar. RBAC por custom claims. Leads/Comunicaciones reemplazan "Consultas". Fases F-CHASIS-A→F9. Backup/observabilidad = owner (Daniel), no Kary; **descuadre financiero alerta a Kary (dueña tienda) Y Daniel (dueño software)**.

**50.3 Consejo Externo (Gemini 3.1 Pro, anti-anclaje, §16 del spec)**: peer review → **adoptado**: saldo síncrono (mata el read-your-writes race), recompute O(M) (no incremental prematuro — revierte una rec del red-team interno), SIN backfill (COP ya entero exacto en JS), DIAN por Adapter. **Refutado con razón**: x10000/decimal.js (innecesario con residual de IVA). Neto: diseño más simple y correcto, dos workstreams riesgosos eliminados.

**50.4 F-CHASIS-A construido (7 tasks TDD, subagentes + doble revisión)**: `render-sidebar.js` (`renderSidebar()` PURO) + `sidebar-data.js` (`NAV` como dato, gating por rol, placeholders "pronto") + 6 tests; rail montado desde datos en `shared.js` (elimina nav duplicada + script inline de hamburguesa en los 8 HTML); CSS de grupos + `.adm-money` (Space Mono/tabular-nums) + fix de stat-cards desbordadas + nowrap solo numérico; `saldo-format.js` (quita hex hardcodeado `#c0392b`/`#1b7a4b` de cuentas.js/cuenta.js); `#confirm-dialog` en ficha + config. Vendedoras y Clientes promovidos a nav.

**50.5 No-regresión / verificación**: `test:sidebar` 6/6 + build verde en cada paso; render verificado por snapshot del preview (7 grupos, placeholders, Vendedoras visible, adm-money); revisión final adversarial APPROVED_WITH_NITS → 3 fixes aplicados (gating de placeholders por rol; dialog en config; limpieza de dead code). 0 hex de saldo. Sin cache bump (shell público no tocado; Vite hashea).

**50.6 Archivos** — nuevos: `js/admin/{sidebar-data,render-sidebar,saldo-format}.js`, `tests/render-sidebar.test.mjs`, 2 docs spec/plan; modificados: `js/admin/{shared,cuentas,cuenta}.js`, los 8 `admin*.html`, `css/admin.css`, `package.json`, `.gitignore`. Commits `91f9105`..`080df2b` (rama `feat/panel-v2-f-chasis-a` → Desarrollo ff → main PR #194/#195). **Desplegado**: Pages deploy de `2fef1fe` success; `bersagliojewelry.co` HTTP 200; `admin.html` servido con 0 nav hardcodeada (rail v2 vivo).

**50.7 Doctrina + siguiente**: §3.6 (arquitecto) + §G.2 (Consejo Externo) + §G.4. Lecciones **L-27** (verificar el repo tras subagentes — no fiarse del reporte: truncado/socket/pasos omitidos) + **L-28** (el Consejo Externo puede SIMPLIFICAR: a veces lo correcto es menos máquina, no más). **Siguiente = F1** (dominio `estadoCuenta`: helper puro + centralizar signo/color/etiqueta). Decisiones fuertes restantes (ventas/facturación/inventario) → Consejo Externo antes de F7.

## 2026-06-07 — F1+F2+slice F5: función de MOROSOS/VENCIDOS (aging de cartera) — en vivo, sin CF nueva
Cliente (sesión previa): tras F-CHASIS-A, "construir la función de morosos/vencidos" para saber a quién cobrar. Decisiones de negocio congeladas por Daniel: plazo **30 días** (config, sin por-cliente aún), **VENCIDO desde el día 1** pasado el plazo, **rangos 1-30/31-60/+60**, vencidos en **rojo**. Fusiona F1 (dominio `estadoCuenta` + centralizar etiqueta) + F2-slice (`movimientos.fecha` real + consumir `diasPlazo`) + slice de F5 (vista CxC: vencido en rojo, orden por mora, KPI cartera vencida). Spec: `docs/superpowers/specs/2026-06-07-morosos-vencidos-design.md`.

**51.1 Causa**: la cartera tenía `saldoActual` pero **cero antigüedad** → la cartera "no decía" qué deuda estaba vencida (un CRM de dinero que calla, §3.6). La BD ya estaba lista (los 344 migrados traen `fecha:CUTOFF`, `cargar-migracion.mjs:48`) pero la UI no capturaba `fecha` en movimientos nuevos ni derivaba mora.

**51.2 Solución (en vivo, cero infra nueva)**: helper PURO `js/crm-estado-cuenta.js` `estadoCuenta(movs, {hoy,diasPlazo,fechaCorte})` — **espejo de `saldo.js`**: reparte créditos (abonos/aperturas-ajustes negativos) contra cargos del más viejo al más nuevo (**FIFO**), envejece el pendiente desde `vencimiento = fecha + diasPlazo` → `{saldo,vencido,alDia,sinFecha,buckets{d1_30,d31_60,d60plus},diasMora,estado}`. **Aging EN VIVO** (cálculo al leer, no materializado): la ficha lo deriva de los movimientos ya cargados; la lista los trae por `onAllMovimientosChange` (listener collectionGroup) → saldo y vencido del **mismo origen** (no se desincronizan). Decisión del norte §10.2-F2 + Consejo §16 (materializar `diasVencido` y paginar = F6). **`saldoActual` intacto** como fuente de verdad (lo escribe solo la CF). Fecha sin valor → fallback a `config.fechaCorteMigracion`; sin ninguna → `sinFecha` (cuenta en saldo, NO en vencido; pill ámbar "Falta fecha").

**51.3 No-regresión**: `computeSaldo`/`recalcSaldoCliente`/`anularMovimiento` INTACTOS (la mora deriva, no toca el saldo). `fecha` **inmutable** tras crearse (`anulacionValida` solo deja mutar 4 claves). `addMovimiento` retro-compatible (`fecha` opcional). Renderers de saldo extendidos **aditivamente** (`saldo-format.js`). IDs/exports estables.

**51.4 Tests/verificación**: `test:estado` **15/15** (FIFO, límites de bucket 30/31/60/61, día-0=al-día, fallback corte, fecha imposible→sinFecha, anulado, plazo custom). `test:saldo` **12/12** (no-regresión). `test:rules` **37/37** (+3: collectionGroup admin-lee / editor-deniega / `fecha` ISO; +1 rechazo formato no-ISO). `vite build` verde. **Revisión adversarial 3 lentes** (matemática/integración/reglas, workflow) → aplicados: validación round-trip de fecha, formato ISO en reglas, listener en vivo (coherencia), truncado audible, pill ámbar sinFecha; **rechazado** con razón: "fechaCorte impide rastrear sinFecha" (el fallback es intencional — la deuda vieja envejece desde el corte, decisión de Daniel).

**51.5 Anti-patterns evitados**: sin CF/scheduler/denormalización prematura (eso es F6, no se adelantó). **collectionGroup filter-free** (solo `limit`) → NO requiere índice → sin `FAILED_PRECONDITION`/pantalla en blanco (spec §9.1). Fecha validada round-trip → `2026-13-45`/`2026-02-30` no se "envuelven" en silencio (caen a `sinFecha`). Truncado de `limit(2000)` audible (S3). Color/etiqueta por **tokens** (sin hex). El `allow write:if false` que sugirió el revisor en el match collectionGroup se **descartó** (no-op engañoso en semántica OR; el comentario ya documenta que es solo-lectura).

**51.6 Archivos** — nuevos: `js/crm-estado-cuenta.js`, `tests/estado-cuenta.test.mjs`, `docs/superpowers/specs/2026-06-07-morosos-vencidos-design.md`; modificados: `js/crm-service.js` (`addMovimiento` +fecha; `onAllMovimientosChange`), `js/admin/{cuenta,cuentas,saldo-format}.js`, `admin-cuenta.html` (campo fecha + sello estado), `admin-cuentas.html` (KPI vencida + columnas Estado/Vencido), `css/admin.css`, `firestore.rules` (collectionGroup read + fecha ISO), `tests/firestore-rules.test.mjs`, `package.json` (`test:estado`). **INTACTOS**: `functions/saldo.js`, `functions/index.js`.

**51.7 Doctrina + siguiente**: §3.6 + §3.3 + §G.2 (revisión adversarial). Lección **L-29** (aging FIFO en vivo + collectionGroup filter-free + validación de fecha round-trip). **Cache: SIN bump** (admin no está en `SHELL_ASSETS`; HTML network-first; Vite hashea). ✅ **DESPLEGADO a prod 2026-06-07** (Daniel mergeó `Desarrollo→main` PR #199 `0cfdb1d` → front por Pages; Claude desplegó `firebase deploy --only firestore:rules,functions` — reglas append-only/collectionGroup/fecha ISO + 6 functions nodejs22 incl. `onInquiryCreated` idempotente §13). Smoke: `functions:list` OK + `.co` HTTP 200. **TODO-13 cerrado**. **Siguiente**: F5 completo (chips/filtros/control de crédito) o F4-leads (Bandeja).

## 2026-06-07 — F5 (slice): filtros/chips de la lista CxC (segmentar la cartera)
Daniel: tras desplegar morosos, "F5 completo". Decisión de alcance (AskUserQuestion): **control de crédito NO** ahora — la tienda no usa cupo por cliente; la validación de crédito de todos modos vive en la venta (F7). Así F5 = **solo filtros** sobre la lista CxC ya construida en §51.

**52.1 Causa**: la lista CxC (§51) muestra los clientes ordenados por mora, pero sin segmentar; Kary necesita responder "¿a quién le cobro?" filtrando por estado, antigüedad y vendedora.

**52.2 Solución (front puro)**: barra de filtros sobre la lista — chips de **estado** (Todos/Vencidos/Al día/A favor) + **rango de mora** (Todas/1-30/31-60/+60) + **select de vendedora** (Todas/Directo de Kary/cada una) + **contador** ("N de M") — combinables con la búsqueda por nombre y el orden por mora. Predicado puro `pasaFiltros(c)` (AND de los filtros activos), `_filterEstado/_filterRango/_filterVendedora`. **Reusa** los componentes existentes `.adm-filters`/`.adm-filter-btn` (no reinventa, §3.2).

**52.3 No-regresión**: front-only (CERO reglas/datos/functions/CF). Búsqueda + orden por mora + estado de cuenta (`estadoCuenta`, §51) intactos. Sin tocar el helper ni el servicio.

**52.4 Verificación**: `vite build` verde + ids HTML↔JS verificados (Grep). Admin tras login → smoke visual de Kary (igual que §51; preview headless no autentica, L-05).

**52.5 Anti-patterns evitados**: re-uso estricto del chip existente (§3.2). De paso, **fix de doctrina** en `.adm-filter-btn`: quita `transition: all` → props específicas (§3.1) + añade `cursor: pointer` que faltaba. Tokens (el único `#fff` es texto sobre `--adm-accent`, igual que el patrón ya usado en `.vend-summary`).

**52.6 Archivos**: `js/admin/cuentas.js` (estado de filtros + `pasaFiltros` + `wireFiltros` + `populateFiltroVendedora` + contador), `admin-cuentas.html` (barra de filtros), `css/admin.css` (`.adm-filtros-bar` + fix `.adm-filter-btn`). **INTACTOS**: `crm-estado-cuenta.js`, `crm-service.js`, reglas, functions.

**52.7 Doctrina + siguiente**: §3.2 (re-uso) + §3.1 (transition). **Sin cache bump** (admin no precacheado). **Front-only** → live al mergear `Desarrollo→main` (Pages); no requiere deploy de reglas/functions. **Siguiente**: F4-leads (Bandeja) o control de crédito junto con F7 (ventas).

## 2026-06-07 — F4-leads: Bandeja (pipeline de leads sobre `inquiries`)
Daniel: tras F5, "vamos con F4". Decisión de alcance (AskUserQuestion): pipeline de **5 estados** (Nuevo→Trabajando→Calificado→Cliente/Perdido). Decisión de arquitecto: **evolucionar `inquiries`** (NO crear la colección `leads` aún) → F4 es **front+servicio**, sin reglas/functions/CF, se publica por Pages. La colección `leads` formal + ingestión blindada por CF + App Check es **F6** (depende de TODO-14, acción de Daniel en consola).

**53.1 Causa**: la "Bandeja" (`admin-consultas.html`) era una bandeja de entrada read/unread; no había forma de trabajar a un interesado por etapas hasta volverlo cliente.

**53.2 Solución**: pipeline de leads sobre `inquiries`. Helper PURO `js/admin/lead-format.js` (espejo de `saldo-format.js`): `leadStatus` (normaliza + alias legacy `new`→`nuevo` + deriva de `read`), `esPendiente` (badge = estado 'nuevo'), `leadBadgeHTML`, `origenLabel`, `diasDesde` (Timestamp/`{seconds}`-aware), `estaDemorado` (SLA simple). UI (`consultas.js` reescrito): chips por estado + conteo, columna Origen, antigüedad + aviso "demorado", modal con selector de estado + **"Convertir a cliente"** (admin → `createCliente` + marca convertido + abre ficha) + **alta manual** de lead (mostrador). `saveInquiry` setea `status:'nuevo'` (entra al pipeline). Badge del rail + stat del dashboard + pill de recientes coherentes (`esPendiente`/`leadBadgeHTML`).

**53.3 No-regresión**: front+servicio (CERO reglas/functions/CF). Reglas de `inquiries` intactas. Saldo/CRM/morosos intactos. Legacy (`status:'new'` o sin status) mapeado sin migración. CSV migrado a estado de pipeline (+ Origen/Cliente). `markRead` (código muerto) eliminado; `read:false` redundante quitado de `addInquiry`.

**53.4 Tests/verificación**: `test:leads` **8/8** (estado/legacy/origen/antigüedad-Timestamp/demorado) + build verde + cross-check **31 ids HTML↔JS, 0 faltantes**. **Revisión adversarial 2 lentes** (integración/RBAC + no-regresión) → aplicados: convertir **idempotente** (guarda `convertedTo`) + marcado **best-effort** (no deja cliente huérfano invisible; navega a la ficha igual), CSV con estado real, dashboard coherente (label "Leads pendientes" + pill por estado), `setStatus` sincroniza `_all` (anti-parpadeo), estado 'convertido' visible en el modal. **Rechazado**: "addInquiry no setea status" (lo fija `saveInquiry`).

**53.5 Anti-patterns evitados**: re-uso de `.adm-filter-btn`/pills (§3.2). Sin CF/App Check prematuro (F6). Convertir idempotente + best-effort en vez de fingir atomicidad (la plena = CF transaccional, F7). Helper de leads aislado y testeado (no lógica de estado dispersa en la vista).

**53.6 Archivos** — nuevos: `js/admin/lead-format.js`, `tests/lead-format.test.mjs`; modificados: `js/admin/{consultas,db,shared,dashboard}.js`, `js/firestore-service.js` (saveInquiry `status:'nuevo'`), `admin-consultas.html` (reescrito a Bandeja), `admin.html` (label del stat), `css/admin.css` (`.adm-pill--emerald` + `.adm-kv-label`), `package.json` (`test:leads`). **INTACTOS**: `firestore.rules`, `functions/*`, `crm-estado-cuenta.js`, `crm-service.js`.

**53.7 Doctrina + siguiente**: §3.2 + §3.6 + §G.2. **Gaps conocidos diferidos a F6** (hardening): (a) `inquiries.update` (reglas) deja a un editor escribir `convertedTo` — impacto BAJO (el botón es admin-gated; editores no operan la Bandeja; es solo un link, sin dinero); F6 endurece leads (`create:if false` + App Check + reglas de campo); (b) colección `leads` formal + ingestión por CF (normaliza/dedup/consent/dead-letter). Atomicidad plena de "convertir" = F7 (CF transaccional). **Sin cache bump** (admin no precacheado). **Front-only** → live al mergear `Desarrollo→main`. **Siguiente**: F6 (escala + hardening: App Check, agregados, leads formales) o F7 (ventas/factura — requiere Consejo Externo + PRE-infra TODO-14).

## 2026-06-08 — F6 inicio: App Check (código listo, rollout pendiente de consola de Daniel)
Daniel: "pasemos a F6" + eligió (AskUserQuestion) arrancar por **App Check** (cerrar el hueco de spam/costos). F6 = fase de escala+hardening (4 frentes); plan grounded por workflow de 4 agentes → `docs/superpowers/specs/2026-06-08-f6-hardening-plan.md`. **Housekeeping previo** (commit `e3d390f`): `.claude/settings.local.json` desindexado + gitignorado (era config local del harness, trackeada por error → ruido cada sesión).

**54.1 Causa**: hueco **denial-of-wallet** VIVO en prod — `firestore.rules` con `create: if true` en `reviews`/`subscriptions`/`inquiries`/`push_tokens` + apiKey pública en el bundle → un bot puede spamear las colecciones públicas y **agotar la cuota/factura** de Firebase. Riesgo #1 (spec §1.1/§8).

**54.2 Solución (slice elegido)**: **App Check sobre Firestore directo** (NO reescribir los formularios a Cloud Functions — eso es defensa-en-profundidad posterior; proporcionalidad). `initializeAppCheck` con **reCAPTCHA v3** en `js/firebase-config.js` (UN solo punto → cubre sitio público **y** admin). Gateado por `VITE_RECAPTCHA_SITE_KEY` + **skip en dev** (emuladores). Cableado en `deploy.yml` (secret del build) + `.env.example`. **NO rompe nada por sí solo**: solo ADJUNTA un token a cada petición; el rechazo se activa con **Enforcement** en la consola (rollout **monitor→enforce**).

**54.3 No-regresión**: gateado — sin la key (o en dev) → **no-op**, el sitio sigue vivo (misma red de seguridad que el fallback de llaves, L-14). CERO cambios a reglas/forms/functions. Build verde (`firebase/app-check` resuelve en firebase v12.11).

**54.4 Verificación**: `vite build` verde. El efecto real se observa en el **monitor de App Check** (consola) tras que Daniel registre reCAPTCHA + agregue el secret + mergee → Pages rebuild con la key → tokens fluyen.

**54.5 Anti-patterns evitados**: NO reescribir los forms públicos a CF callables (el workflow lo propuso; App Check directo cierra el hueco con UN `init` — la CF-ingestion con dedup/rate-limit es follow-up, no el core fix). Gateado por key = **no big-bang**, no romper prod. Rollout **monitor-only antes de enforce**.

**54.6 Archivos**: `js/firebase-config.js` (`initializeAppCheck` + reorden de `isDev`), `.env.example` (`VITE_RECAPTCHA_SITE_KEY`), `.github/workflows/deploy.yml` (secret del build), `docs/superpowers/specs/2026-06-08-f6-hardening-plan.md` (plan F6), `.gitignore` (housekeeping). **INTACTOS**: `firestore.rules`, `functions/*`, formularios.

**54.7 Doctrina + ACCIONES DE DANIEL (consola, desbloquean el efecto)**: §3.6 (seguridad por diseño). (1) Firebase Console → **App Check** → registrar la web app con **reCAPTCHA v3** → copiar la **site key**; (2) GitHub repo → Settings → Secrets and variables → Actions → nuevo secret **`VITE_RECAPTCHA_SITE_KEY`**; (3) mergear `Desarrollo→main` → Pages rebuild; (4) verificar en el **monitor** de App Check que llegan peticiones "verificadas"; (5) cuando el tráfico legítimo esté tokenizado, activar **Enforcement** (Firestore + Storage + Functions). Lección **L-30** (App Check directo > reescribir forms a CF para cerrar denial-of-wallet; gatear por key = rollout sin romper). **Siguiente F6**: cimientos (CI rule-test + entero-COP) · reconciliación/Salud · RBAC claims · backup (PRE-1, antes de F7).

## 2026-06-08 — Mejoras al cerebro (TODO-16): Comité ×3 + Legal Colombia + Arquitecto + Workflows reutilizables
Daniel (orden de la sesión): *"ahora íbamos a mejorar el cerebro"* → describió **5 frentes** (comité de expertos, skill legal colombiana, pensar como arquitecto, workflows reutilizables) + la directiva de que la calidad sea automática (*"no debería tener que pedir el comité"*). Decisiones del cliente: legal = método + leyes clave (no enciclopedia) · comité = Claude + 2ª opinión externa · orden = Claude decide. **No es un bug: mejora proactiva del cerebro y las capacidades.**

**55.1 Causa raíz (verificada con 4 subagentes en paralelo)**: (a) los plugins legales cargados son extranjeros — `legalzoom` confirmado **US-only, excluye explícitamente la ley no-estadounidense** (el plugin `legal` ni siquiera está instalado en disco) → riesgo de meter contenido legal de **jurisdicción equivocada** al sitio colombiano; (b) la doctrina de arquitecto ya estaba **~95% en `CLAUDE §3.6` + `50-ARQUITECTURA`** (reescribirla sería duplicar); (c) ya existía `llm-council` (5 lentes fijos → peer-review anónimo → síntesis) reutilizable como base del comité; (d) los workflows de detección existían **dispersos** (recetas sueltas en `30`, specs ad-hoc), sin catálogo invocable.

**55.2 Solución estructural (5 frentes · principio: reusar, no duplicar)**:
- **(1) Comité ×3** → skill `comite-expertos` (adapta `llm-council` con 3 cambios: **expertos inferidos por tema** + opera sobre la **última respuesta** + **itera ×3** + 2ª opinión externa Gemini en Decisión Fuerte; corrige el bug HTML heredado). Regla de tensión: siempre ≥1 escéptico + ≥1 ejecutor.
- **(1b) Calidad automática** → regla nueva `CLAUDE §3.7`: **auto-crítica SIEMPRE** (casi gratis) + **Comité ×3 por iniciativa propia** SOLO en decisiones con stakes/incertidumbre/caras de revertir; **NO** en lo trivial (un comité de ~30 agentes sobre un dato es gastar peor, viola §3.6).
- **(2) Legal Colombia** → skill `legal-colombia` (guardrail que **frena** los plugins legales extranjeros para contenido del sitio + método de **investigación profunda en fuentes oficiales `.gov.co`**) + lóbulo `42-LEGAL` (marco verificado: Ley 1480 retracto/garantía/reversión, Ley 1581 habeas data, RUCOM/ANM, SAGRILAFT/UIAF, DIAN/IVA 19%, páginas legales del sitio, TODOs `LEGAL-01..06`). La skill **habilita a Claude a producir/actualizar** los textos legales (el abogado = visto bueno final, no freno).
- **(3) Arquitecto** → skill PORTÁTIL `arquitecto-software` (6 lentes + IAP; sirve también en ALTORRA) + enriquecido `50 §1.6` (patrones de integración REST/GraphQL/eventos/colas/webhooks/gRPC + cuándo cada uno) + **anclada** en `50 §3` la regla operativa "barrer TODO el panel antes de cada fase" (antes solo en memoria `feedback_revisar_panel_completo`).
- **(4) Workflows reutilizables** → neurona nueva `60-WORKFLOWS` (catálogo `W-01..W-09`: red-team de reglas, auditoría por dimensiones, red-team de diseño, verificación post-subagente, testing de CF, análisis multi-agente, comité ×3, investigación grounded, brain:check).

**55.3 No-regresión**: TODO aditivo. `CLAUDE.md` solo creció (247/320). Ningún nodo perdió contenido (límite de guardián: apendar, no sobrescribir). Skills instaladas user-level (`~/.claude/skills/`) → reversibles borrando la carpeta. App, `firestore.rules`, `functions/*` INTACTOS.

**55.4 Tests / verificación**: `brain:check` **SANO** en cada paso (77 skills catalogadas; neuronas `42-LEGAL` + `60-WORKFLOWS` reconocidas como hijas; caps OK; refs L-/M- y hojas OK). Las 3 skills aparecen **activas en la interfaz** (auto-disparo por description). Investigación legal verificada en fuentes oficiales (`funcionpublica`, `secretariasenado`, `sic`, `dian`, `supersociedades`, `uiaf`, `anm`).

**55.5 Anti-patterns evitados**: NO reinventar el comité (se adaptó `llm-council`); NO duplicar la doctrina arquitecto (enriquecida in-place); NO "comité completo en cada respuesta" (→ tiered §3.7); NO incrustar todas las leyes (método + leyes clave evergreen); NO crear neuronas/lóbulos vacíos (`42-LEGAL` y `60-WORKFLOWS` nacen con contenido real, §G.4).

**55.6 Archivos**: **NUEVOS**: `skills/{comite-expertos,legal-colombia,arquitecto-software}/SKILL.md` (+ copias instaladas en `~/.claude/skills/`), `docs/42-LEGAL.md`, `docs/60-WORKFLOWS.md`. **EDITADOS**: `CLAUDE.md` (§3.7 nueva + §0 ×2), `docs/50-ARQUITECTURA.md` (§1.6 + §3), `docs/40-LOBULOS-DOMINIO.md`, `docs/00-INDICE.md`, `docs/skills-inventory.md`, `docs/05`, `docs/10`. **INTACTOS**: código de app, `firestore.rules`, `functions/*`.

**55.7 Doctrina + follow-ups**: §3.6 (arquitecto: reusar > duplicar) + **§3.7 nueva** (calidad por defecto). **Sin cache bump** (no toca SW ni shell). **Follow-ups legales `LEGAL-01..06`** viven en `42-LEGAL` (auditar páginas legales del sitio, verificar umbrales SAGRILAFT/RNBD, esmeraldas, IVA oro, flujo RUCOM). Skills portátiles (`arquitecto-software`, `comite-expertos`) sirven también a ALTORRA.






