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






## 2026-06-09 — §56: Cerebro multi-proyecto (canon) — linter canónico + manifest + cerebros INDEPENDIENTES + kernel v1.1

> Consolidación de la sesión 2026-06-09 trabajada cross-repo desde cars (el "por qué" debe vivir TAMBIÉN en el
> canon — hallazgo del comité v6). **Deliberación:** crudo + síntesis en cars
> (`altorracars.github.io/docs/superpowers/research-archive/` + `…/specs/2026-06-09-comite-v6-…VEREDICTO.md`).

- **Qué pasó**: este repo es el CANON del cerebro multi-proyecto. Se instaló el **linter canónico**
  `scripts/brain-check.mjs` byte-idéntico en los 3 repos (commit `9f7bdfd`), con caps en CHARS +
  modo `--boot` liviano + budgets por-repo en `docs/.brain-manifest.json`; boot-budget honesto
  (informativo explícito, `424dbfd`); las 4 skills de gobernanza (`comite-expertos`, `legal-colombia`,
  `arquitecto-software`, `crm-architect`) descontaminadas y VERSIONADAS en `skills/` (`3bca0c0`);
  el Reflejo de Captura de Deliberación aterrizado en §G.4 de los 3 (`65b9195`).
- **Decisión de arquitectura (cars ADR §171/§172, ratificada por el cliente)**: cerebros
  **INDEPENDIENTES** — NO sync P2P del KERNEL (sobreingeniería); copia manual de mejoras genéricas;
  template/generator (Opción C) diferido a cuando exista build step. Este repo sigue siendo el canon
  del template (`INSTALACION-CEREBRO.md` + marcador de versión).
- **Kernel v1.1 (comité v6, 2026-06-09)**: check #6 endurecido — `skills/` sin `skills-inventory.md`
  ahora es **warn** (problema real), no info. Propagado byte-idéntico ×3 (SHA256 `15D72117…`).
  + `archiveDir` en el manifest (`docs/research-archive/`, README esqueleto creado) + literal "Gemini"
  del Reflejo de Cierre → "consejo externo" (descontaminación pre-clonado) + skill fantasma
  `performance-check` retirada del registro de lóbulos (40:16).
- **Pendiente tracked (checklist v6 en cars)**: GC dos palancas de ESTE repo (CLAUDE.md 27.7k/27k ↗ y
  10 19.2k/18k ↗ — destilar), actualizar `INSTALACION-CEREBRO.md` al estado kernel + bump template
  1.1.0 (ítem P), skill `auditoria-cerebro` (ítem N).

## 2026-06-09 — Comité ×3 "Operación integral" (plan negocio+sistema) + RCA App Check (403 en el canje)
Daniel: "antes de seguir... lanza un comité de expertos sobre todo lo que necesita Bersaglio a nivel general para operar y robustecer facturación, CRM e inventario junto con la web y el punto físico". Comité ×3 (skill `comite-expertos` / W-07) vía Workflow: 5 expertos (arquitecto serverless ejecutor · contador DIAN · ops retail de lujo · seguridad/datos · escéptico PyME), 3 rondas (exactitud → profundidad → claridad), peer review anónimo + presidente. 33 agentes; las 3 rondas aportaron (sin convergencia temprana).

**57.1 Causa/contexto**: tras CRM+Panel v2 en prod, el cliente pidió la vista de NEGOCIO completa (tecnología + operación + legal/tributario + personas), no solo el roadmap técnico. En paralelo, sus capturas del monitor App Check refutaron la suposición del cerebro ("0% verificadas = propagación, NO bug"): 96-100% caía en "no válidas".

**57.2 Resultado (plan estratégico)**: plan integral → bóveda `../brain-private/bersaglio/plan-operacion-robustecimiento-2026-06.md` (CRUDO de la deliberación en `research-archive/2026-06-09-comite-operacion-CRUDO.md`). Núcleo: (a) 4 huecos ANTES de construir módulos: adopción de Kary (compuerta talonario-vs-sistema; >2/10 faltantes = pausa de construcción) · backup probado RESTAURANDO · verdad de la cartera $506M (campaña de confirmación DISEÑADA por el contador antes del piloto — las firmas documentan ventas viejas quizá no declaradas) · estado fiscal DIAN (si la obligación de facturar YA existe, la facturación salta al 1er lugar: facturador gratuito DIAN en días + doble digitación + conciliación semanal); (b) 9 decisiones que solo Daniel puede tomar (con default y fecha); (c) semana 1 día a día con dueño y prueba de "listo"; (d) gemelo (2º proyecto Firebase gratis) = aula de Kary + banco de pruebas + ensayo de restore; (e) "comprobante interno" — PROHIBIDO llamar factura a lo no habilitado por DIAN; (f) RADIAN: factura electrónica a crédito = título de cobro automático del fiado (inclina adelantar F7-DIAN; criterio de proveedor = que maneje eventos de cobro); (g) pasivos invisibles: anticipos de apartados vivos, piezas de clientas en taller sin acta/seguro, contrato de encargo de datos Kary↔Daniel (Ley 1581), riesgo laboral al formalizar vendedoras (forma la define el contador); (h) costo mensual honesto $450-850k COP (contador = el grueso).

**57.3 RCA App Check (verificada EN VIVO, §3.3)**: navegando bersagliojewelry.co → `exchangeRecaptchaV3Token` responde **403** → el SDK adjunta token dummy → el monitor clasifica todo como "no válidas". reCAPTCHA SÍ emite (site key `6LdSoxQt…` correcta en el bundle desplegado). Hipótesis #1: llave **SECRETA** mal registrada en la consola App Check (o tipo de llave ≠ v3 clásica / dominio no autorizado en el admin de reCAPTCHA). Autocrítica (§G.4): la nota "NO bug" de 05/10 era suposición no verificada — corregida en ambos nodos. **Enforcement BLOQUEADO** hasta ~100% verificadas ×7 días.

**57.4 Verificación**: workflow completado (logs 3/3 rondas, 18 cambios clave registrados en el CRUDO); evidencia de red capturada en vivo (status 403); `brain:check` SANO tras consolidar.

**57.5 Anti-patterns evitados**: comité con tensión obligatoria (ejecutor+escéptico, §3.7); deliberación capturada ANTES de cerrar (CRUDO+síntesis, L-31 kernel); NO se activó Enforce con métricas en rojo; plan sensible del negocio → bóveda privada (repo público, L-15); fila §56 faltante en `00-INDICE` detectada y repuesta; L-28 duplicada renumerada (→L-31).

**57.6 Archivos**: bóveda (NUEVOS): `plan-operacion-robustecimiento-2026-06.md` + `research-archive/2026-06-09-comite-operacion-CRUDO.md`. Repo (consolidación): `docs/{99-HISTORIAL-ADR,00-INDICE,05-ESTADO-GLOBAL,10-MEMORIA-CORTO-PLAZO,30-LECCIONES}.md`. Código de app INTACTO (cero cambios).

**57.7 Doctrina**: §3.6/§3.7 + lección nueva **L-32** (monitor App Check: "no válidas" ≠ propagación → diagnóstico por red/403 en el canje). Sin cache bump (no toca SW).

## 2026-06-09 — §58: App Check REPARADO en vivo — causa real: API key restringida sin "Firebase App Check API"
Continuación de §57.3 (canje 403). Sesión guiada con Daniel (consolas GCP/Firebase/reCAPTCHA) + diagnóstico en vivo vía navegador conectado (Claude in Chrome).

**58.1 Causa raíz (verificada leyendo el CUERPO del 403, §3.3)**: la hipótesis inicial de §57.3 (llave secreta mal registrada) resultó FALSA — Daniel re-pegó la secreta y el 403 persistió. Replicando el canje a mano (`grecaptcha.execute(0, {action:'fire_app_check'})` por widgetId + POST `recaptcha_v3_token`) el body reveló: **`API_KEY_SERVICE_BLOCKED`** — la API key del navegador ("Nuevo Browser key", la del bundle `AIzaSyDcAv…`) tiene **allowlist de 6 APIs** (hardening Tier A previo) que NO incluía `firebaseappcheck.googleapis.com`. App Check se instaló (§54) DESPUÉS de restringir la key → todo canje nacía bloqueado, independiente del secreto. Descartes documentados en el camino: tipo de llave v3 ✅, dominios .co/.github.io ✅, site key del bundle == consola ✅, secreta re-pegada ✅.

**58.2 Solución estructural (Daniel, guiado, GCP Console)**: Credenciales → "Nuevo Browser key" → Restricciones de API → añadir **Firebase App Check API** (6→7 APIs) → Guardar (~5 min de propagación). **Cero cambios de código.**

**58.3 No-regresión**: el resto del allowlist y los referrers HTTP quedaron intactos (el candado del hardening sigue vivo); ninguna otra API añadida.

**58.4 Verificación**: EN VIVO post-propagación: `exchangeRecaptchaV3Token` → **200** (antes 403). Observación pendiente (TODO-14): monitor de App Check subiendo a ~100% verificadas ×7 días → recién entonces **Enforce**.

**58.5 Anti-patterns evitados**: NO encadenar hipótesis a ciegas (tras fallar la #1 se leyó la EVIDENCIA del body — Trigger 🔴 §G.2); NO Enforce con métricas en rojo; diagnóstico con el canje REAL del SDK (por widgetId — ejecutar por site key da el falso negativo "Invalid site key"); datos de consolas del cliente manejados sin exfiltrar secretos (la clave secreta nunca pasó por el chat).

**58.6 Archivos**: código de la app: CERO. Cerebro: `docs/{05,10,30 (L-32 reescrita),99,00-INDICE}`. Consolas (Daniel): GCP API key. Además hoy: 2FA activado en Google ×2 y GitHub.

**58.7 Doctrina + cache**: L-32 reescrita con la receta completa (leer el body del 403; `API_KEY_SERVICE_BLOCKED` vs `App attestation failed`; **meta-regla: al instalar un servicio Google nuevo, revisar las API restrictions de la key PRIMERO**). Sin cache bump (no se tocó el SW ni el shell).

## 2026-06-09 — §59: F6 frenos de gasto — forms públicos con forma exacta + push_tokens cerrado (desplegado)
Daniel: "apruebo todo, continuemos" (política de cartera v1 **APROBADA** → bóveda actualizada). Primera tarea técnica de la semana 1 del plan §57.

**59.1 Causa**: hueco denial-of-wallet residual (spec maestra §1.1): `create: if true` SIN validación en `reviews`/`subscriptions`/`inquiries`/`push_tokens` — un bot podía escribir documentos de cualquier forma y tamaño. App Check (§58) ya sella el navegador pero sin Enforce aún; defensa en profundidad exige forma exacta server-side.

**59.2 Solución estructural**: 3 validadores de create (whitelist `keys().hasOnly` + tipos + tamaños máximos + `createdAt == request.time` ⇒ solo `serverTimestamp()`, nunca fechas del cliente) espejo del payload REAL de `js/firestore-service.js`: **reviews** (author≤120, comment≤2000, rating 1-5, `approved == false` anti auto-aprobación), **subscriptions** (email con regex + ≤254, active solo true), **inquiries** (name≤120, message≤3000, `status == 'nuevo'` forzado, pieceSlug null|string). **push_tokens: CERRADO** (`create, update: if false`) — grep verificó CERO writers en js/ y functions/ (la feature FCM nunca aterrizó); reabrir con validación cuando exista.

**59.3 No-regresión**: tests con el payload EXACTO de los 3 formularios públicos (pasan) → los forms del sitio siguen vivos; los 37 tests previos intactos; cero cambios al código de la app.

**59.4 Verificación**: `npm run test:rules` **51/51** (14 nuevos + 1 actualizado) · `firebase deploy --only firestore:rules` **Deploy complete** · el probe de spam contra prod fue denegado por el clasificador del harness — verificación queda en emulador + release del mismo archivo (suficiente; no se insistió).

**59.5 Anti-patterns evitados**: validar contra el payload real (no romper forms en prod); cerrar ≠ borrar la regla de push_tokens (read admin se conserva); NO re-investigar el "origen de las 3.6K inválidas" — quedó explicado por §58 (el canje estaba bloqueado para TODOS los visitantes, no era abuso); primer test-run "todo rojo" era un emulador huérfano en el puerto 8080, no las reglas (matar proceso antes de re-diagnosticar).

**59.6 Archivos**: `firestore.rules` (+3 validadores, 4 matches endurecidos), `tests/firestore-rules.test.mjs` (+14 tests, 1 actualizado, import serverTimestamp). **INTACTOS**: js/, functions/, *.html.

**59.7 Doctrina + cache**: §3.6 (defensa en profundidad cost-aware) + **L-33 nueva** (firebase CLI multi-cuenta: deploy 403 "caller does not have permission" = cuenta activa equivocada → `firebase login:list` / `login:use` ANTES de diagnosticar IAM; `login:use` fija el default POR DIRECTORIO y previene la recaída). Sin cache bump (reglas son server-side, no tocan el SW).

## 2026-06-09 — §60: Backup diario automático de Firestore DESPLEGADO (PRE-1, parte 1)
Daniel: "continuemos" → segunda roca de la semana 1 del plan §57. Hasta hoy la cartera de $506M NO tenía copia de seguridad (bloqueante PRE-1, spec maestra §10.1).

**60.1 Causa**: riesgo de pérdida total — sin export, sin PITR; el peor escenario del comité §57 ("copias que se probaron restaurando") estaba en cero.

**60.2 Solución estructural (zero-budget deliberado, §3.6)**: función programada **`backupDiario`** (v2 onSchedule, 3:00 AM America/Bogota, retry 2, maxInstances 1): dump COMPLETO de Firestore (recursivo con subcolecciones) → JSON comprimido en el bucket por defecto (`backups/firestore/backup-YYYY-MM-DD.json.gz`) + **retención 30 días** (borra copias viejas en la misma corrida) + guard anti-dump-vacío (una base vacía no rota copias buenas). **Por qué JSON dump y no el export gestionado**: cero IAM extra (el SA por defecto ya lee Firestore/escribe Storage), restaurable y legible, suficiente a esta escala (cientos de docs); el export oficial/PITR queda como upgrade path documentado. Piezas: `functions/backup.js` (handler) + `functions/backup-codec.js` (serialización PURA de Timestamp/ref/GeoPoint/Buffer, patrón L-17) + `functions/restore-backup.mjs` (restauración al gemelo/emulador; **se NIEGA a escribir sobre prod sin `--force-prod`**).

**60.3 No-regresión**: deploy dirigido `--only functions:backupDiario` (las 6 functions existentes intactas); index.js solo re-exporta. Limitación documentada: docs "fantasma" no se recorren (no existen en este modelo).

**60.4 Verificación**: codec `npm run test:backup` **7/7** (round-trip de todos los tipos; map plano {latitude,longitude} NO se confunde con GeoPoint) · deploy **Successful create** (us-central1, Node 22 2nd Gen; APIs eventarc/pubsub habilitadas automáticamente) · **PENDIENTE: verificar la 1ª corrida real** (3 AM) en la próxima sesión — `backups/firestore/` debe tener el archivo del día; alternativa: Daniel fuerza una corrida en Cloud Scheduler.

**60.5 Anti-patterns evitados**: no big-bang (deploy dirigido); restore-sobre-prod bloqueado por diseño; sin IAM nuevo que mantener; guard de dump vacío; copia ≠ probada — el "restore probado" (PRE-1 parte 2) queda explícitamente PENDIENTE hasta el gemelo.

**60.6 Archivos**: NUEVOS `functions/{backup.js,backup-codec.js,backup.test.mjs,restore-backup.mjs}`; EDITADOS `functions/index.js` (re-export), `package.json` (script test:backup). INTACTOS: resto de functions, reglas, front.

**60.7 Doctrina + cache**: §3.6 (valor con menos fricción: dump JSON > maquinaria IAM a esta escala) + L-17 (lógica pura testeable). Sin cache bump. **Restante PRE-1**: 1ª corrida verificada → gemelo → restore probado con ojos de Daniel → copia semanal FUERA de la cuenta (descarga manual viernes hasta automatizar).

## 2026-06-09 — §61: GEMELO vivo — bersaglio-gemelo.web.app (aula de Kary + banco de pruebas + sala de restore)
"continuemos" → tercera roca de la semana 1 §57. Proyecto `bersaglio-gemelo` creado por CLI (display name SIN paréntesis — GCP los rechaza), Firestore `(default)` us-central1 creado por CLI (la consola habilitó la API al abrir el asistente — el primer intento CLI dio 403 API-disabled), Auth email/password habilitada por Daniel (consola, 2 clics).

**61.1 Causa**: el plan §57 exige un entorno idéntico a prod donde (a) Kary aprenda con datos de juguete, (b) todo cambio que toque dinero se ensaye ANTES de prod, (c) el backup se restaure "con ojos".

**61.2 Solución**: proyecto **Spark (SIN Blaze, deliberado**: sin facturación vinculada → imposible que genere costos) + config de deploy **AISLADA** (`firebase.gemelo.json` — jamás se cruza con la de prod) + mismas reglas 51/51 desplegadas + sembrador `functions/seed-gemelo.mjs` (**se NIEGA a correr contra prod**; 5 clientas ficticias con saldos PRE-calculados usando el `computeSaldo` de prod, 2 vendedoras, 3 piezas demo, usuarios del aula admin/owner) + hosting con build parametrizado (VITE_* del gemelo en UN solo comando para no contaminar builds futuros) + **interruptor NUEVO `VITE_RECAPTCHA_SITE_KEY='off'`** en `js/firebase-config.js` (apaga App Check explícitamente en entornos sin él; el fallback de prod solo aplica cuando la var no viene).

**61.3 No-regresión**: build de prod de control → fallback `6LdSoxQt` presente en `dist/js/chunks/firebase-config-*.js`. Gotcha de verificación: los chunks JS viven en `dist/js/chunks/`, NO en `dist/assets/` (ahí va el CSS) — grep en la carpeta correcta antes de concluir. Prod sin cambios de comportamiento (var ausente = mismo camino de siempre).

**61.4 Verificación E2E EN VIVO (navegador real)**: login `aula-kary@…` → panel Piezas (3 demo visibles) → CRM Cuentas: total $4.300.000 · vencida $1.900.000 con rangos 31-60/+60 · cartera por vendedora · "Ámbar Entrenamiento" **Vencido · 89 días de mora** → el motor de aging corre idéntico sobre datos de juguete. (Truco de automatización: el tecleo del Chrome MCP no aterrizaba en el input del login → rellenar por JS + `dispatchEvent('input')` + click del submit.)

**61.5 Anti-patterns evitados**: Spark deliberado con limitación DOCUMENTADA (las Cloud Functions NO corren en el gemelo → `recalcSaldoCliente` no vive ahí; los saldos del aula van pre-calculados en el seed; si el aula avanzada las necesita → vincular Blaze, decisión de Daniel, seguiría ~$0) · datos 100% ficticios (la regla §57: datos reales SOLO en ensayos de restore y se borran después) · deploy con `--config` explícito (cero riesgo de pisar prod).

**61.6 Archivos**: NUEVOS `firebase.gemelo.json`, `functions/seed-gemelo.mjs`; EDITADO `js/firebase-config.js` (interruptor 'off'). Consolas: Firestore DB (CLI) + Auth (Daniel).

**61.7 Doctrina + cache**: §3.6 (aislamiento por archivo de config > flags mentales). Sin cache bump (el chunk va hasheado por Vite; el shell no cambió). **Restante PRE-1**: restaurar el 1er backup EN el gemelo con ojos de Daniel (mañana, cuando exista `backup-2026-06-10.json.gz`) · alertas de presupuesto (Daniel) · kill-switch doc.

## 2026-06-09 — §62: F6 cimientos — CI de reglas REACTIVADO (TODO-10) + entero-COP en 3 capas (desplegado)
Daniel: "¿no se puede hacer nada hoy?" → sí: los ítems de Etapa 1 que no esperan al backup de las 3 AM.

**62.1 Causa**: (a) el CI de reglas llevaba pausado desde 2026-06-06 (rojo sin diagnosticar entonces; la suite ya corre verde local con el MISMO comando) → las reglas se desplegaban sin red automática; (b) el dinero aún aceptaba decimales (`monto is number` + `round2` a centavos) contradiciendo la decisión congelada entero-COP (spec §5.1, Consejo §16).

**62.2 Solución**: (a) **CI reactivado** (`firestore-rules-test.yml`): triggers `push`/`pull_request` CON filtro de paths (solo corre cuando cambian reglas/tests — cost-aware §3.6, no quema runner en commits de docs) + `workflow_dispatch`. (b) **entero-COP en 3 capas**: reglas `monto is int` (un decimal llega como double y se RECHAZA en la frontera; JS envía enteros como int → cero fricción para el panel) · `saldo.js` `round2`→`redondearAPeso` (Math.round al peso completo; residuo flotante legacy redondea, nunca fracciona) · tests en ambas capas (decimal rechazado / entero pasa / saldo siempre `Number.isInteger`).

**62.3 No-regresión**: la cartera migrada es entera (Excel COP) → `is int` no rechaza operaciones legítimas; el panel ya produce enteros (`adm-money`, F-CHASIS-A). Test antiguo "redondeo a 2 decimales" REESCRITO a la doctrina nueva (0.1+0.2 → 0 pesos, no 0.3).

**62.4 Verificación**: saldo **12/12** · reglas **53/53** (2 nuevos entero-COP) · `deploy --only firestore:rules` ✅ · `deploy --only functions:recalcSaldoCliente` ✅. ⚠️ El CI queda ACTIVO en GitHub cuando la rama se suba/mergee (el workflow vive en el repo remoto); local ya está commiteado.

**62.5 Anti-patterns evitados**: validación en la FRONTERA (reglas) y no solo en la UI; redondeo en UNA capa autoritativa (la CF) en vez de regado por el front; CI con path-filter (no big-bang de minutos); test legacy actualizado en el MISMO cambio (no quedó mintiendo).

**62.6 Archivos**: `firestore.rules` (is int), `functions/saldo.js` (redondearAPeso), `functions/saldo.test.mjs` (test reescrito), `tests/firestore-rules.test.mjs` (+2), `.github/workflows/firestore-rules-test.yml` (reactivado). INTACTOS: front, demás functions.

**62.7 Doctrina + cache**: spec §5.1/Consejo §16 ejecutados. **TODO-10 ✅ CERRADO** (efectivo al push/merge). Sin cache bump. Restante Etapa 1/F6: restore probado (mañana) · RBAC claims · reconciliación + Salud · paginación cursor · kill-switch doc.

## 2026-06-10 — §63: PRE-1 CERRADO — restauración PROBADA con ojos de Daniel (backup→gemelo→verificado→limpiado)
Daniel forzó la 1ª corrida de `backupDiario` (Cloud Scheduler "Forzar ejecución") → ensayo completo de restauración la misma noche en que se construyó el sistema de backup.

**63.1 Ensayo ejecutado (ciclo completo)**: (1) `backupDiario` corrió OK en prod → `backups/firestore/backup-2026-06-10.json.gz` (**702 docs, 29 KB**; el guard anti-vacío no saltó); (2) `download-backup.mjs` la bajó (solo-lectura); (3) `restore-backup.mjs --target bersaglio-gemelo` restauró **702/702**; (4) **verificación con ojos en el panel del gemelo**: "Directo de Kary — 344 clientes — $506.664.328" + 349 totales (344 reales + 5 juguete) — los datos reales REVIVIDOS desde la copia, captura vista por Daniel; (5) **limpieza obligatoria** (regla §57: datos reales NUNCA viven en el ambiente de pruebas): `firestore:delete --all-collections --project bersaglio-gemelo --force` + re-seed de juguete; (6) la copia descargada quedó como **1ª copia FUERA de la cuenta**: `C:\Users\romad\Documents\BersaglioBackups\` (carpeta local; rutina: viernes, manual, hasta automatizar).

**63.2 Resultado**: **TODO-15 / PRE-1 CERRADO** — backup diario automático (3 AM, retención 30d) + restauración probada de punta a punta + runbook (`restore-backup.mjs` con bloqueo anti-prod) + copia off-account. La cartera ya nunca duerme sin red. Nota de frescura: la cartera viva marca $506.664.328 (evolucionó desde los $506.510.780 de la migración — Kary o ajustes posteriores; el snapshot del backup es la verdad del día).

**63.3 No-regresión**: prod solo fue LEÍDO (download + el dump de la función); el wipe fue exclusivamente en el gemelo (--project explícito); el gemelo quedó como antes del ensayo (juguete).

**63.4 Verificación**: salida de cada paso capturada + screenshot del panel del gemelo con los datos reales + gemelo re-verificado con seed de juguete.

**63.5 Anti-patterns evitados**: "copia que nunca se restauró = promesa" (el comité §57) — probada el día 1; datos reales borrados del entorno de pruebas inmediatamente; wipe SOLO con --project gemelo explícito; el archivo local NO se versionó en git (datos de clientas fuera de repos).

**63.6 Archivos**: cero código nuevo (se usaron las piezas de §60/§61). Local: `BersaglioBackups\backup-2026-06-10.json.gz`.

**63.7 Doctrina**: la dupla §60+§61 pagó el mismo día (backup+gemelo = restauración ensayable a demanda). **Restante F6**: RBAC claims · reconciliación+Salud · paginación cursor · alertas presupuesto (Daniel) · recorrido del kill-switch (Daniel).

## 2026-06-10 — §64: F6 frente D — reconciliación de cartera + vista Salud (red de seguridad del dinero)

Construido en `Desarrollo` (commit `c554aec`); siguiente paso del plan §57 tras cerrar PRE-1 (§63). Revisión adversarial multi-agente ANTES del commit (workflow 24 agentes, 4 dimensiones → 14 hallazgos confirmados, TODOS corregidos; CRUDO en `archiveDir`).

**64.1 Causa raíz**: `recalcSaldoCliente` (trigger async, ÚNICA escritura de `saldoActual`) no tenía try-catch → un fallo = saldo desactualizado EN SILENCIO, sin señal en panel ni métricas. Sin reconciliación, un descuadre solo se descubriría cobrando mal. (Plan F6 frente D, bóveda `f6-hardening-plan.md`.)

**64.2 Solución estructural** (patrón "cuadrar caja"): (a) trigger blindado — catch registra evento en `saludEventos` (id determinista `recalc-{event.id}`, idempotente ante reintentos) y RE-LANZA (visible en métricas para la futura alerta de Monitoring); (b) `reconciliacionDiaria` 3:30 AM (tras el backup de las 3:00) + callable `reconciliarCartera`: full-scan `clientes`+collectionGroup → `compararSaldos()` PURA (`functions/reconciliacion.js`, espejo de `saldo.js`) → resultado a `salud/reconciliacion` (pisar, top-50 descuadres) con **re-verificación puntual** de cada sospechoso (anti falsa-alarma: el full-scan no es vista consistente y el trigger tiene lag); (c) callable `repararSaldo` = la MISMA transacción del trigger (extraída a `recalcularSaldoCliente()`, reset de estado por intento) + auto-resuelve eventos abiertos del cliente; valida `clienteId` sin barras (anti inyección de ruta vía Admin SDK); (d) `backupDiario` reporta a `salud/backup` (best-effort); (e) vista `admin-salud.html` (semáforo backup/cuadre/fallos + Reparar/Reconciliar/Marcar resuelto) + ítem "Salud" owner en sidebar; (f) reglas: `salud` read-only admin + write:false; `saludEventos` update SOLO whitelist (`resuelto` false→true UNA vez, `resueltoEn == request.time`, `resueltoPor == uid`). **Decisión deliberada**: reglas/callables a nivel ADMIN (Kary puede operar la red de seguridad); solo la ENTRADA del menú es owner — la UI no es frontera de seguridad.

**64.3 No-regresión**: camino feliz del trigger IDÉNTICO (verificado por revisor contra HEAD); cero renombres (trigger conserva nombre/path; `crm-service` 100% aditivo); clases CSS reutilizadas de `admin.css`; `esc()` endurecido es aditivo (escapa también `"`/`'` — los callsites existentes solo ganan seguridad). SW sin bump (admin no precacheado, HTML network-first, JS hasheado).

**64.4 Tests**: `reconciliacion.test.mjs` 9/9 (política de descuadres: bordes legacy/anulados/huérfanos) · reglas **64/64** (+11 de salud: whitelist, anti-suplantación, anti-re-resolución, sello server-time, write cerrado) · sidebar 7/7 (Salud owner-only) · 58 puros totales · build Vite ✓.

**64.5 Anti-patterns evitados** (de la revisión): estado fuera del callback de transacción (fuga entre retries) · `esc()` sin comillas en contexto de atributo (inyección) · toast "no se pudo reparar" cuando solo falló el refresco · `limit()` sin `orderBy` que truncaría los eventos MÁS nuevos (orderBy de 1 campo = índice automático, NO compuesto) · falsa alarma de descuadre por carrera benigna · timeout 60s del callable vs 300s del scheduled.

**64.6 Archivos**: NUEVOS `functions/reconciliacion.js`+test · `functions/salud.js` · `admin-salud.html` · `js/admin/salud.js`. MODIFICADOS `functions/index.js` · `functions/backup.js` · `firestore.rules` · `js/crm-service.js` (+ primer uso de `httpsCallable`, import lazy) · `js/admin/{shared,sidebar-data,render-sidebar}.js` · tests · `package.json` (`test:reconciliacion`). INTACTOS `saldo.js`, `crm-estado-cuenta.js`, páginas admin previas, `sw.js`.

**64.7 Doctrina + estado**: upgrade path anotado (reconciliación INCREMENTAL por `saldoActualizadoEn` cerca de ~25k docs; purga de `saludEventos` resueltos antiguos). **DESPLEGADO a prod 2026-06-10 con OK explícito de Daniel** (el clasificador bloqueó el primer intento — correcto, se pidió autorización): reglas publicadas + **10 functions vivas** (3 nuevas `create` OK, verificado `functions:list`). 1ª corrida real: 3:30 AM o "Forzar ejecución" (Daniel). La vista Salud llega a prod con el merge del PR. Lección L-34 → `30`. Restante F6: RBAC claims (frente B) · paginación cursor.

## 2026-06-10 — §65: F6 frente B — RBAC por custom claims (rol en el token) + hardening de la frontera `users/`

Construido en `Desarrollo` (commit `3e4d4e2`); cierra el penúltimo frente técnico de F6. Revisión adversarial PRE-commit (workflow 19 agentes, 3 dimensiones → **12 hallazgos confirmados + 4 refutados**; 2 de severidad ALTA corregidos antes del commit; CRUDO en `archiveDir`).

**65.1 Causa raíz**: el RBAC leía el rol con `get(users/{uid})` en CADA chequeo de reglas + `verifyRole` leía Firestore por llamada (lectura extra por request, doctrina S4). Además — hallazgo de la revisión, severidad ALTA preexistente — la regla de `users/` no validaba el campo `role` en el write directo del cliente (`js/auth.js` escribe el doc, NO la CF con guardas): un admin podía escribir `role:'owner'` en otro doc (escalar) o degradar al owner.

**65.2 Solución estructural**: (a) el rol viaja como **custom claim** en el token → `getUserRole()` (reglas) y `verifyRole` (functions) lo leen del token PRIMERO, **fallback dual** al doc durante la transición (sin lockout); precedencia del claim documentada. (b) Trigger **`syncRoleClaim`** RECONCILIADOR Auth↔doc: deriva el estado DESEADO del doc actual y lo compara con Auth, escribiendo solo si difieren → **convergente ante la entrega desordenada/at-least-once** de los triggers (no deja claim viejo pegado); `retry:true`; maneja huérfanos (doc sin user Auth → evento en `saludEventos`, no re-lanza); refleja `active:false` (→ `disabled` en Auth + claim retirado) y **revoca refresh tokens** al degradar/desactivar (cierra la ventana de privilegio retenido). (c) **Hardening de `users/` en reglas** (el fix ALTA): `usersFieldsValidos()` (whitelist de claves), create solo `admin|editor`, update donde un admin NO puede acuñar un owner (`role in ['admin','editor']`) ni tocar al owner (`resource.data.role != 'owner'`). (d) **`backfill-claims.mjs`**: script ADC único (preflight solo-lectura por defecto, `--aplicar` escribe + verifica) con guardia anti-emulador (aborta si hay `*_EMULATOR_HOST`) y abort ante error transitorio (no clasifica como huérfano, hallazgo #11).

**65.3 No-regresión**: `verifyRole` conserva firma y todos los callers (`await` sin destructuring — `callerData` null en la vía claim no afecta a nadie, verificado por la revisión); fallback dual = comportamiento IDÉNTICO para tokens sin claim; el camino de `lastLogin` del owner sigue pasando (whitelist lo incluye). Cero renombres. SW sin bump.

**65.4 Tests**: reglas **75/75** (+6 de escalada de rol: admin no acuña owner / no degrada al owner / no se auto-promueve / inyección de campos rechazada; +5 de claims: claim-solo, precedencia, fallback) · 58 puros · build ✓.

**65.5 Anti-patterns evitados** (de la revisión): trigger que espeja el snapshot del evento (no converge ante reorden) → leer el estado actual + comparar; `setCustomUserClaims` que crashea con `auth/user-not-found` sin capturar; backfill con `catch {}` ciego que reporta éxito ante fallo transitorio; ADC redirigido al emulador en silencio; frontera `users/` sin validar `role`.

**65.6 Archivos**: NUEVO `functions/backfill-claims.mjs` (ignore en `firebase.json`). MODIFICADOS `functions/index.js` (`verifyRole` + `syncRoleClaim`) · `firestore.rules` (`getUserRole` + `usersFieldsValidos`) · `js/admin/salud.js` (label del evento huérfano) · `tests/firestore-rules.test.mjs`. INTACTOS resto del CRM.

**65.7 Doctrina + estado · ORDEN DE DESPLIEGUE (crítico, hallazgo #6)**: desplegar en este orden para no abrir ventana — **1º `firebase deploy --only functions`** (trigger + verifyRole nuevo), **2º `node functions/backfill-claims.mjs --aplicar`** (acuña claims a los usuarios existentes), **3º `firebase deploy --only firestore:rules`** (activa la precedencia del claim), **4º preflight** (`node functions/backfill-claims.mjs` → cero drift). La única combinación mala es backfill aplicado SIN trigger desplegado (cubierta por este orden). **Aceptado por diseño** (2-3 usuarios de confianza): el ID token vigente retiene el rol ≤1h tras una degradación (el `revokeRefreshTokens` corta la renovación; el corte inmediato exigiría `checkRevoked`/`auth_time` por request — upgrade path). Upgrade path anotado: re-sync periódico de claims (reconciliación en `salud.js`) + mover TODA mutación de roles a la CF (hoy mitigado por la validación en reglas). **DESPLEGADO a prod 2026-06-10 con OK explícito de Daniel, en el orden exacto**: (1º) functions con `--force` (el retry de `syncRoleClaim` exige confirmación; idempotente por diseño) → **11 functions vivas** (`syncRoleClaim` create OK, verificado `functions:list`); (2º) backfill aplicado: claim `owner` sellado y VERIFICADO en la cuenta de Daniel (única en `users/` — la de Kary no existe aún; el trigger la sellará al crearse); (3º) reglas publicadas (incluye el hardening §66); (4º) preflight final: **0 drift**. Lección L-35 → `30`.

## 2026-06-10 — §66: Seg — "Desactivar usuario" AHORA bloquea el acceso + frontera `users/` owner-only

Reporte verificado de Daniel (spawned task, derivado de la revisión del §65): el botón "Desactivar" del panel de usuarios NO bloqueaba el acceso. Construido en `Desarrollo` (`e9ecc37`).

**66.1 Causa raíz** (verificada leyendo código): `js/admin/usuarios.js` llamaba al `deactivateUser` **cliente** (`js/auth.js`), que solo escribía `{active:false}` en el doc vía `setDoc` merge — **nunca deshabilitaba la cuenta en Firebase Auth**. Y NADA validaba `active`: ni `signIn` (auth.js:81), ni `requireAuth` (auth.js:180), ni las reglas. Un usuario "desactivado" seguía iniciando sesión y operando con su rol intacto. La CF `deactivateUser` correcta (functions/index.js:172, hace `updateUser(uid,{disabled:true})`) existía y estaba VIVA en prod (desplegada con §64) — pero el panel nunca la llamaba. *Un doc no es una credencial.*

**66.2 Solución estructural**: (a) **`auth.js deactivateUser` ahora llama la CF** (`httpsCallable`, import lazy de `firebase/functions` para no inflar el bundle público) → deshabilita Auth + protege al owner server-side. (b) **`signIn` + `requireAuth` rechazan `active:false`** (defensa en profundidad + mensaje claro ante `auth/user-disabled`); como cada página admin es una carga fresca que re-lee el perfil, cierra la ventana de una sesión abierta tras desactivar. (c) **Reglas `users/` → OWNER-ONLY** en create/update (la gestión de usuarios ES `requireAuth('owner')`): un admin ya no muta docs de usuario, cerrando el punto (b) del reporte (no reescribe `role` de otros ni toca al owner) — complementa el hardening §65 que validaba `role` en el write directo. Las CFs (`deactivateUser`/`updateUserRole`) corren con Admin SDK y SALTAN estas reglas.

**66.3 Decisiones deliberadas**: NO se cambió el flujo de `createUser`/`updateUserRole` a CF (proposal (a) del reporte) — `createUser` cambiaría la operativa (crear la cuenta Auth + password desde el panel, hoy se hace en consola) y `updateUserRole` ya queda protegido por las reglas owner-only; el cambio NECESARIO de servidor era solo desactivar (deshabilitar Auth). El bloqueo cliente de `active` NO es la frontera dura (JS es evitable) — la frontera es **Auth disabled** (CF) + reglas; el check cliente es UX + defensa en profundidad.

**66.4 No-regresión**: `deactivateUser` conserva firma (usuarios.js sin cambios); `signIn`/`requireAuth` solo AÑADEN un rechazo (no alteran el camino feliz); reglas owner-only no rompen `lastLogin` (el self-write de no-owner ya estaba denegado, best-effort). Build ✓.

**66.5 Tests**: reglas **76/76** (+admin NO muta usuarios · +admin NO desactiva por write directo; flip del test §65 "admin SÍ cambia rol" → ahora denegado por owner-only).

**66.6 Archivos**: MODIFICADOS `js/auth.js` · `firestore.rules` · `tests/firestore-rules.test.mjs`. INTACTOS `js/admin/usuarios.js` (la firma del wrapper no cambió), CFs (ya correctas).

**66.7 Doctrina + DESPLIEGUE**: la corrección de **acceso viaja con el deploy del SITIO** (merge del PR → Pages) y funciona en prod YA (la CF `deactivateUser` está viva) — **NO requiere deploy de functions**. El endurecimiento de **reglas** (`users/` owner-only) se apila sobre las reglas pendientes del §65 → sale con ese mismo `firebase deploy --only firestore:rules` (OK de Daniel). Lección L-36 → `30`.

## 2026-06-10 — §67: CI de reglas REPARADO — el emulador Firestore exige Java 21 (post-mortem de §62)

Daniel notó que TODOS los merges salían con los checks en rojo ("All checks have failed · Firestore Rules Tests"). Investigación grounded (workflow 3 agentes, evidencia oficial, confianza alta) — construido en `Desarrollo` (`8b12fc4`).

**67.1 Causa raíz**: el emulador de Cloud Firestore que trae `firebase-tools` 15.x está compilado a **class file 65.0 (Java 21)**; el workflow `firestore-rules-test.yml` instalaba **Java 17** → `UnsupportedClassVersionError` al arrancar el emulador → `firebase emulators:exec` devolvía **exit 1 ANTES de ejecutar `node --test`** (el exit code no distingue "emulador no arrancó" de "test rojo"). Detonante: el CI instalaba `firebase-tools` **sin pin** (`npm install -g firebase-tools` = latest); cuando salió **v15.0.0 (2025-12-10, "Removed support for running emulators with Java versions prior to 21")** el piso de Java saltó a 21 de un día para otro → el CI empezó a fallar el **2026-06-05** sin que se tocara el repo. Firma: falla SIEMPRE, en todos los commits (docs incluidos), en el step del emulador, no en aserciones.

**67.2 Solución**: en `.github/workflows/firestore-rules-test.yml` — `actions/setup-java java-version: 17 → 21` + **pin `firebase-tools@15.18.0`** (la versión validada verde en local con el comando IDÉNTICO del CI, 76/76). El pin impide que un futuro bump de toolchain vuelva a romper el CI en silencio (§3.6, builds reproducibles).

**67.3 Post-mortem (autocrítica §G.4 — el cerebro contribuyó al error)**: **§62 (TODO-10) declaró "CI reactivado verde" asumiéndolo porque la suite pasaba en LOCAL — sin verificar un run real de Actions.** El CI NUNCA pasó desde la reactivación. Defecto: afirmar estado de CI sin evidencia del CI real (§3.3 / [[L-26]] / [[L-27]] aplicados a Actions, no solo a git). Corrección de doctrina → [[L-37]]: "verde local ≠ verde en CI"; verificar `conclusion` del run vía API; PIN de toolchain de CI.

**67.4 No-regresión**: cambio acotado al workflow YAML; no toca reglas, tests ni código de app. Las `actions/*@v4` se dejan como están (el warning de Node 20 es informativo, no bloquea — node24 = mantenimiento aparte, fuera de alcance).

**67.5 Verificación**: el run sobre `8b12fc4` debe pasar (replica el entorno local verde: Java 21 + firebase-tools 15.18.0). Evidencia: Firebase CLI release notes v15.0.0/v14.19.0 + doc oficial del emulador (Java 21 / gcloud 528.0.0). CRUDO de la investigación en `archiveDir`.

**67.6 Archivos**: MODIFICADO `.github/workflows/firestore-rules-test.yml`. **Estado real corregido**: el CI de reglas estaba ROJO desde 2026-06-05 (no "verde" como decía §62/05).

## 2026-06-10 — §68: F6 CERRADO — alerta visible de truncado (spec §9.1) · paginación GATED a materializar aging

Último frente técnico de F6. Construido en `Desarrollo` (`196484e`).

**68.1 Causa raíz**: el `limit(2000)` de los listeners era MUDO — si una lista de dinero llegaba al tope, el panel mostraba datos incompletos (mora/cartera calculadas sobre un subconjunto) y solo quedaba un `console.warn` que nadie ve. La spec §9.1 lo pide textual: *"paginación por cursor + alerta cuando rowcount == limit"*.

**68.2 Solución (la mitad con valor HOY)**: la capa de datos emite `bj:truncado` cuando un snapshot llega al tope (`detectarTruncado()` en `crm-service`: Clientes · Historial del cliente · collectionGroup de mora · Registro de fallos; detector inline en `onInquiriesChange` de `firestore-service` — módulos desacoplados, mismo evento) → `js/admin/truncado.js` (STANDALONE, testeable, espejo del patrón `render-sidebar`) pinta un **banner persistente** en todas las páginas admin (cableado en `initSidebar`), con dedup por origen y cierre que NO silencia para siempre. En el sitio público el evento no tiene listener (no-op).

**68.3 DECISIÓN ARQUITECTÓNICA — paginación por cursor GATED, no construida**: la mora EN VIVO (ficha + lista) se calcula recorriendo TODOS los movimientos (diseño deliberado [[L-29]], avalado por el Consejo §16: *"no materialices hasta que la escala lo exija"*). **Paginar esas listas hoy = mora calculada sobre datos incompletos = números falsos de dinero.** La paginación real DEPENDE de materializar primero el aging (`diasVencido` + recompute) — trabajo diferido a propósito. **El banner ES el gate**: si aparece (≈2000 movimientos totales, años a ritmo actual; o 500 leads), se dispara el trabajo de materialización+paginación. Construir paginación hoy sería teatro (la lista paginada seguiría cargando TODOS los movimientos para la mora).

**68.4 No-regresión**: detección read-only en callbacks de snapshot (cero cambio del flujo de datos); `dispatchEvent` con try/catch (entornos sin DOM); vendedoras/pendientes sin detector (tablas mínimas, evitar ruido — deliberado).

**68.5 Tests**: `truncado.test.mjs` 4/4 (origen nombrado, multi-origen, botón de cierre, escape XSS) → **62 puros totales** · build ✓. Autocrítica en construcción: un import `shared.js↔truncado.js` circular se detectó y corrigió ANTES del commit (standalone, patrón del proyecto).

**68.6 Archivos**: NUEVOS `js/admin/truncado.js` + `tests/truncado.test.mjs`. MODIFICADOS `js/crm-service.js` · `js/firestore-service.js` · `js/admin/shared.js` · `package.json` (`test:truncado`). Viaja con el **merge del PR** (solo sitio — sin deploy de functions/reglas).

**68.7 Doctrina + estado**: **F6 TÉCNICO COMPLETO** — A App Check ✅(§58, Enforce a ×7d) · C cimientos ✅(§62) · D reconciliación+Salud ✅(§64) · B RBAC claims ✅(§65) + §66/§67. Siguiente del programa: **compuerta de adopción** (smoke de Kary) → **Fase M** (movimientos robustos, nuevo plan) → F7 con Consejo Externo. Gate de escala documentado aquí y en el banner.

## 2026-06-10 — §69: FASE M diseñada — plan v3 del Comité ×3 (gobierno de movimientos) → bóveda `fase-m-plan.md`

Daniel ordenó arrancar la Fase M. Comité ×3 por iniciativa propia (§3.7): 33 agentes (contador-auditor DIAN · arquitecto Firestore · UX back-office · escéptico de fraude interno · PM de alcance), 3 rondas con peer review anónimo. **Plan completo → bóveda `fase-m-plan.md`** (umbrales sensibles fuera del repo público); CRUDO en `archiveDir`.

**69.1 Problema**: implementar la política de cartera v1 APROBADA (ajustes con aprobación registrada de Daniel, gestiones de cobro, vencimientos, candidatas a castigo) + resolver el choque del spec original de Fase M ("editar movimientos con historial") con la doctrina append-only vigente.

**69.2 Decisiones estructurales del plan** (las que definen la fase): (a) **NO se reforma el append-only** ni se adelanta el callable-único-escritor de F7: el gate de aprobación = "el asiento nace solo al aprobarse" (colección `solicitudes` aparte) + separación owner/admin en CREATE y ANULACIÓN de reglas; (b) **"editar" se DESCARTA**: corregir = PAR atómico anular+crear vinculado (`correccionDe`/`corregidoPor`) en un writeBatch; (c) **mapa de control por EFECTO en saldo**: todos los reductores enumerados y gateados (ajuste negativo, apertura negativa, anulación de cargo, anulación de abono = owner SIEMPRE); el ABONO no se gatea (trabajo diario) → controles compensatorios (medioPago obligatorio, conciliación mensual CON ACTA + arqueo, materialidad anti-abono-token); (d) **expand-contract vinculante** (reglas aditivas → UI verificada en prod con indicador de versión → reglas restrictivas), con **M2a+M2b+M3 como TREN ACOPLADO** (ni teatro de control ni candado sin válvulas); (e) **corte mensual INMUTABLE** del aging por CF (`cortes/{YYYY-MM}`, ancla probatoria para provisión/expediente/CEI — punto ciego que el peer review destapó); (f) **riesgo residual DECLARADO**: lapping (misatribución entre clientas) — invisible a controles de totales; mitigación = confirmación externa por clienta (PRIORIDAD 1 de B6) + recomendación operativa inmediata (WhatsApp de confirmación por abono); (g) supuesto de DOS actores explícito `[HONOR]` (Daniel aprueba solo con SU cuenta/sesión).

**69.3 Slices**: **M0-H** (HOTFIX hoy: `saldoActual` escribible por admin rules:225 + apertura negativa sin gate rules:68 — 2 agujeros verificados) → M0 config/cartera+calibración dry-run → M1 reglas aditivas (`solicitudes`+`gestiones`+índice collectionGroup) → M2a UI Kary (ciclo completo, sin callejones) → M2b superficie de Daniel → M3 reglas restrictivas (Decisión Fuerte: Consejo Externo si hay provider) → M4 auditoría detectiva+cortes → M2c/M5/M6/M7 (pulido·gestiones·vencimiento·señal castigo). FUERA: B6 (recibo/acuse anti-lapping prioridad 1, provisión, CEI, digest), F7 (callable único escritor, castigo ejecutable).

**69.4 Preguntas a Daniel/Kary** (se disparan AL CERRAR M0, con el dry-run en la mano): (1) Kary: plazo default 30 vs 90; (2) Daniel: cadencia de revisión (→`slaRevisionDias`, gate mecánico) + compromiso de cuenta propia + conciliación mensual; (3) tope $50k confirmado con datos (p90 de neutros históricos); (4) Kary: qué saldo decir con corrección pendiente; (5) SÍ/NO formal a 3 desviaciones de la política (castigo como asiento de crédito NO anulación · tope POR TRANSACCIÓN con vigilancia mensual · verificación trimestral integrada).

**69.5-69.7**: Verificación por slice = suite emulador + red-team de reglas (60-WORKFLOWS, agente distinto) + IAP + deploy gated + guiones de prueba CON Kary y CON Daniel (checklist 5 tareas, criterio numérico). Archivos: solo bóveda+cerebro (código arranca en M0-H). Doctrina: el comité corrigió al borrador v0 en puntos materiales (gate por efecto y no por tipo; tren acoplado vs slices sueltos; corte mensual inmutable; lapping declarado) — el proceso ×3 pagó.

## 2026-06-10 — §70: Fase M · M0-H DESPLEGADO + M0 ejecutado (config sembrada, calibración, preguntas disparadas)

Con autorización explícita de Daniel ("autorizo todo").

**70.1 M0-H en prod**: los 2 agujeros verificados quedaron cerrados en producción — (a) `clientes` update con whitelist `affectedKeys` (un admin ya NO pisa `saldoActual` a mano; verificado que `updateCliente` escribe dentro de la whitelist); (b) apertura NEGATIVA → owner-only (su único uso legítimo, §43 migración, ya pasó). Test que FIJABA el contrato viejo (apertura neg de admin permitida) reemplazado deliberadamente. El ajuste negativo de admin conserva su régimen hasta M3 (test lo fija).

**70.2 M0 ejecutado**: (a) **`config/cartera` SEMBRADA en prod** (11 campos: `autoAprobacionMax` 50000 provisional · `slaRevisionDias: null` hasta la pregunta 2 · motivos ajuste/neutros/anulación · `plazoDefault` 30 · `criteriosCastigo` 360/180/3/3 + materialidad 1%/10k · espejos UI mediosPago/resultadosGestion) vía `functions/seed-config-cartera.mjs` (idempotente, NO pisa, guardia anti-emulador); (b) **regla owner-only para `config/cartera`** desplegada (quien opera bajo los límites no puede reescribirlos; `config/negocio` sigue admin — test de no-regresión); (c) **calibración dry-run** (`tools/calibracion-fase-m.mjs`, read-only sobre el backup local): **CERO movimientos operativos** — 344/344 son aperturas de migración, sin ajustes/abonos/anulaciones → el tope $50k nace PROVISIONAL por definición (recalibrar a 90 días de datos vivos); salami hoy: 0 clientas con ≥2 cargos sub-tope; (d) **Consejo Externo verificado DISPONIBLE** (Gemini 3.1 Pro tier TOP, `15 §0`) → M3 tendrá 2ª opinión; (e) **runbook** → bóveda `fase-m-runbook.md` (anti-lockout de config, ausencia de Daniel, rollback de M3 como evento de control, supuesto 2 actores, drift de claims).

**70.3 Tests**: reglas **83/83** (4 M0-H + 3 M0). **70.4 Backfill endurecido** (hallazgos #7/#11 de la revisión §65): guardia de vars de emulador + error transitorio de Auth ABORTA (no clasifica como huérfano).

**70.5 Preguntas 1-5 DISPARADAS a Daniel/Kary con los datos en la mano** (cierran M0; gatean el tren M2a/M2b/M3): plazo 30/90 (Kary) · cadencia→`slaRevisionDias`+cuenta propia+conciliación (Daniel) · tope $50k provisional confirmado (Daniel, dato: cero histórico) · saldo con corrección pendiente (Kary) · 3 desviaciones SÍ/NO (Daniel). **Siguiente slice: M1 (reglas aditivas `solicitudes`+`gestiones`+índice collectionGroup) — no depende de las respuestas.**

**70.6 Archivos**: NUEVOS `functions/seed-config-cartera.mjs` · `tools/calibracion-fase-m.mjs` · bóveda `fase-m-runbook.md`. MODIFICADOS `firestore.rules` (M0-H + config/cartera) · `tests/firestore-rules.test.mjs` · `functions/backfill-claims.mjs`. INTACTOS: saldo/estado-cuenta/reconciliación (cero cambio de flujo de dinero).

**70.7 Doctrina**: la calibración con datos reales convirtió la pregunta 3 de opinión a hecho ("no hay dato → provisional con fecha de recalibración") — *el dato decide, no la intuición* (Aporte B del comité). Cache SW: no aplica (cero cambios de shell/JS público).

## 2026-06-10 — §71: Preguntas 1-5 RESPONDIDAS (tren desbloqueado) + M0-C panel Parámetros owner-only

> Daniel: *"tú eres el experto... contador, abogado y arquitecto... elabora un panel de configuración completo, profesional como lo manejan los grandes. Kary no podrá gestionarlo, solo mi usuario."*

**71.1 Respuestas (cierran las preguntas del §69 → enmiendas v1.1 de la política en bóveda)**: (1) cadencia 48h → **`slaRevisionDias: 2` GRABADO en `config/cartera` prod**; (2) cuenta propia ✅ confirmado; (3) conciliación mensual: con el usuario de Daniel **hasta que exista el rol CONTADOR** (futuro usuario para tareas contables pesadas — encaja en el RBAC por claims §65, rol aditivo); (4) tope $50k provisional ok (recalibrar ~sept 2026); (5) las 3 desviaciones contables DELEGADAS a Claude como experto y ADOPTADAS (castigo=asiento de crédito · tope por transacción+vigilancia mensual · verificación trimestral en M4). Plazo fiado: 30 por ahora, configurable (pregunta 6); copy de corrección pendiente aprobado (pregunta 7). **Directiva de gobierno nueva**: TODO parámetro va a configuración con default sensato puesto por Claude; memoria de usuario actualizada (delegación de experto).

**71.2 M0-C construido — panel "Parámetros" (`admin-parametros.html`, owner-only)**: render dirigido por METADATOS (`js/admin/parametros-form.js`, módulo PURO patrón render-sidebar: DEFAULTS espejo del seed + SECCIONES con label/ayuda/sufijo/min/max + LISTAS chips) → el controlador (`js/admin/parametros.js`) solo cablea. Secciones: Aprobaciones y topes · Plazos · Criterios de castigo · Listas del negocio (motivos ajuste/neutros/anulación + mediosPago/resultadosGestion marcadas "espejo de pantalla" — honestidad: la validación dura vive en las reglas). Guardado POR SECCIÓN (merge parcial) con validación COMPLETA previa (coherencia: neutros ⊆ ajuste; DESCUENTO_AUTORIZADO/CASTIGO/OTRO jamás neutros) + "Restaurar recomendados" + trazabilidad (actualizadoEn/Por) + protección anti-pisada (no re-renderiza con cambios sin guardar). Frontera real = regla `config/cartera` write owner-only (ya desplegada §70); UI gating = sidebar `role:'owner'` + `requireAuth('owner')`.

**71.3 No-regresión**: `config/negocio` (Kary) intacta; sidebar aditivo (ítem Parámetros + icono sliders). **71.4 Tests**: parámetros 9/9 (defaults auto-válidos, metadatos sin huérfanos, entero-COP, rangos, listas, coherencia política, inmutabilidad de escribirPath) · sidebar 9/9 (Parámetros owner-only) · **72 puros totales** · build ✓ (`dist/admin-parametros.html` verificado).

**71.5 Pendiente registrado** (pedido de Daniel "más adelante"): sacar **Vendedoras** de Configuración (es operación de Kary, no configuración del sistema) — reorganización de IA del grupo Sistema, programada para la ventana del tren M2. **71.6 Archivos**: NUEVOS `admin-parametros.html` · `js/admin/parametros{-form,}.js` · `tests/parametros-form.test.mjs`. MODIFICADOS `js/crm-service.js` (onConfigCarteraChange/updateConfigCartera) · `js/admin/{sidebar-data,render-sidebar}.js` · tests sidebar · `package.json`. **71.7**: viaja con el merge del PR (sin deploy de reglas/functions — la regla ya estaba). Siguiente slice: **M1 (reglas aditivas `solicitudes`+`gestiones`+índice collectionGroup)**.

## 2026-06-10 — §72: M1 red-team adversarial (gate §69) + fix de contrato motivoRechazo↔estado

> Gate del plan §69 ANTES de desplegar las reglas de M1 (commit `42669c4`, construido sin red-team por rate-limit del servidor API ×2). En paralelo, Daniel reportó el mismo bug de contrato; el red-team lo confirmó por su cuenta = convergencia humano + adversarial.

**72.1 Causa raíz** (verificada leyendo `firestore.rules`): en `transicionSolicitudValida()`, la rama owner combinaba `affectedKeys().hasOnly(['estado','resueltoPor','resueltoEn','motivoRechazo'])` con el guard `(d.estado=='aprobada' || nonEmptyStr(d.motivoRechazo))`. Al aprobar, el disyunto izquierdo corta en `true` → `motivoRechazo` quedaba PERMITIDO (no requerido) en una aprobación → estado de datos contradictorio `aprobada`+`motivoRechazo` que el aprobador futuro M2b leería. El `hasOnly` limita QUÉ cambió, no QUÉ estado RESULTA.

**72.2 Solución estructural**: atar el campo al estado resultante por PRESENCIA — `(d.estado=='rechazada' ? nonEmptyStr(d.motivoRechazo) : !('motivoRechazo' in d))`. Reemplaza (no apila) el guard viejo redundante: rechazo EXIGE motivoRechazo; aprobación NO lo porta. Resuelve también el componente de tipo del hardening #4 (`nonEmptyStr` ya exige `is string` en rechazo; la aprobación no admite el campo). Comentario del invariante añadido en la función.

**72.3 No-regresión**: IDs/funciones/match intactos; `solicitudValida`/`gestionValida`/índices sin tocar. Tests previos (aprobar-limpio sol1; rechazar con/sin motivo sol2) verdes bajo el ternario; el `!('campo' in d)` usa presencia (seguro), no `d.campo` (lanza si ausente).

**72.4 Red-team + tests**: workflow W-01 (5 lentes adversariales — SoD · forma/inyección · máquina-estados · collectionGroup · semántica-forward → verificación adversarial de cada hallazgo), **22 agentes, 2.3M tokens, SIN rate-limit esta vez**. **Veredicto: 0 bloqueantes de deploy, 0 m1-bugs.** 17 hallazgos verificados: 12 no-explotables, 5 reales (4 forward-risk-m2b + 1 hardening), ninguno explotable por actor de menor privilegio (la frontera de M1 — SoD admin-no-aprueba, sello server-time, whitelist, suplantación negada, gestiones inmutables, sin borrado — aguanta). Tests reglas **99/99** en emulador (Java 25; +1 nuevo: aprobar con motivoRechazo colado → `assertFails` y aprobar-limpio → `assertSucceeds`, sobre semilla `sol5`).

**72.5 Forward-risks DIFERIDOS a M2b** (no bloquean el deploy de reglas; backlog en bóveda `fase-m-plan.md`): (#1) la rama owner no exige `solicitadoPor != uid` → el owner puede AUTO-aprobar su solicitud — **DECISIÓN de Daniel**: SoD estricto al owner vs excepción consciente (riesgo bajo: el owner ya puede ajustar directo hoy). (#2) `correccion` sin `correccionDe`/`datosCorreccion` se acepta (tipo↔payload sin acoplar) → M2b DEBE re-validar el payload, nunca confiar ciegamente en `datosCorreccion`. (#4) `motivoRechazo` sin tope de tamaño (consistente con el resto del lóbulo CRM que no topa strings — opcional).

**72.6 Archivos**: MODIFICADOS `firestore.rules` (1 cláusula + comentario en `transicionSolicitudValida`) · `tests/firestore-rules.test.mjs` (semilla `sol5` + 1 test). CRUDO del red-team → bóveda `research-archive/2026-06-10-redteam-m1-firestore-CRUDO.json`. INTACTOS: `firestore.indexes.json`, functions, resto de reglas.

**72.7 Doctrina + cache**: lección **L-38** (guard `(A||B)` + `hasOnly` que whitelista B = estado contradictorio → ternario por presencia). Sin cache bump (§4: solo reglas, cero shell/JS público). **Deploy de rules+indexes de M1 = DESPLEGADO 2026-06-10** (Daniel autorizó deploy permanente; PR #221 mergeado a `main`; índice COLLECTION_GROUP `solicitudes` confirmado en prod). W-01 funcionó como gate: atrapó exactamente lo que Daniel vio + 4 forward-risks que M2b heredará documentados.

## 2026-06-10 — §73: M2a-1b — ensanche aditivo de anulacionValida (enlace de corrección) + par atómico

> El par de corrección de M2a (anular original + crear reemplazo) enlaza ambas patas con `motivoCategoria` (qué tipo de corrección) + `corregidoPor` (id del reemplazo) en la anulación. La `anulacionValida` desplegada (M1 no la tocó) solo permitía 4 claves en su `hasOnly` → bloqueaba el par. Primer slice del build M2a tras el cimiento (contrato puro + capa de datos).

**73.1 Causa/necesidad** (verificada en `firestore.rules`): `anulacionValida.hasOnly(['anulado','anuladoPor','anuladoEn','motivoAnulacion'])` rechazaba cualquier campo extra → la pata "anular" del par no podía portar el enlace al reemplazo.

**73.2 Solución estructural**: **EXPAND aditivo** — +`motivoCategoria` y +`corregidoPor` al `hasOnly`, ambos OPCIONALES con validación de tipo (`nonEmptyStr(motivoCategoria)`; `corregidoPor is string`). NO se exigen todavía (M3 hará `motivoCategoria` obligatorio + gate por tipo/monto = contract). `corregidoPor` NO se verifica cross-doc por diseño (§69; M4 audita "corrección sin enlace" de forma detectiva).

**73.3 No-regresión**: los 4 controles previos INTACTOS (append-only one-way `anulado false→true`, `anuladoPor==uid`, `motivoAnulacion` no vacío); el test existente "admin SÍ anula con motivo" (sin los campos nuevos) sigue verde. El whitelist sigue bloqueando inyección de claves.

**73.4 Tests + red-team**: reglas **100/100** en emulador (+1 M2a-1b: enlace válido pasa; campo extra `hacked` y tipos inválidos `motivoCategoria:''`/`corregidoPor:123` fallan). **Red-team W-01 enfocado** (5 agentes, 3 lentes: alcance del expand · abuso de campos · no-regresión/forward → verificación adversarial). **Veredicto: 0 bloqueantes, 0 bugs del ensanche** (es estrictamente EXPAND: antes `motivoCategoria` ni existía → no introduce ni debilita nada).

**73.5 FORWARD-RISK registrado** (del red-team, no explotable, no bloquea): entre el deploy de M2a-1b y el de M3, una anulación puede hacerse SIN `motivoCategoria` (operación legítima, válido hoy). Como la anulación es one-way append-only, M3 al volverlo obligatorio **NO cubre retroactivamente** (no se puede re-anular para backfillear). **Mitigación**: (a) M2a-4 incorpora `motivoCategoria` al modal de anular → toda anulación de M2a en adelante lo lleva → cierra la ventana huérfana; (b) M3/M4 deben tratar las anulaciones legacy/pre-M2a-4 con una categoría `sin_clasificar_legacy`, NUNCA asumir cobertura retroactiva. *Endurecer la regla es trivial; reconstruir la intención de una anulación pasada, no.*

**73.6 Par atómico construido** (desbloquea M2a-2): `crm-service.js` `corregirMovimientoBatch` — `writeBatch` atómico (anular original enlazado con `motivoCategoria`+`corregidoPor` + crear reemplazo con `correccionDe`, MISMO tipo y fecha; fecha nueva + `CORRECCION_FECHA` para corrección de fecha). `movimientoValido` admite `correccionDe` (sin `hasOnly` hasta M3). Build verde.

**73.7 Archivos + deploy**: MODIFICADOS `firestore.rules` (`anulacionValida` +2 claves) · `tests/firestore-rules.test.mjs` (semilla `mLink` + 1 test) · `js/crm-service.js` (`corregirMovimientoBatch` + import `writeBatch`). CRUDO → bóveda `research-archive/2026-06-10-redteam-m2a1b-anulacion-CRUDO.json`. **DESPLEGADO 2026-06-10** (solo reglas; índices sin cambio; autorización permanente de Daniel). Sin cache bump (reglas + JS dormido sin UI). Siguiente: UI de Kary (M2a-3).

## 2026-06-10 — §74: Contrato de la solicitud de corrección (diseño verificado) + UI "Corregir movimiento" (M2a-3)

> Antes de construir el botón "Corregir" por movimiento (la pata más cara de M2a), se DISEÑÓ y VERIFICÓ el contrato de datos de la solicitud de corrección — lo que la pantalla de aprobación de Daniel (M2b) consumirá — vía workflow de 3 lentes → síntesis → verificación adversarial. Veredicto SÓLIDO. Cara de revertir (regla de datos en prod) → se pineó ANTES de codear.

**74.1 Decisión (contrato verificado)**: una solicitud `tipo:'correccion'` guarda: `monto` = DELTA NETO firmado al saldo (`signo(tipo)×(montoNuevo−montoOriginal)`; MISMO significado que en una solicitud `ajuste` → cero ramas en M2b/M4; `delta=0` válido para corrección de solo fecha). `datosCorreccion` (map) = `{ reemplazo:{tipo,monto,fecha?,descripcion?}, snapshotOriginal:{tipo,monto,fecha?,descripcion?,anulado:false}, motivoCategoria }`. `correccionDe` (id original) y `saldoAlSolicitar` (int) van TOP-LEVEL (la regla los valida con tipo propio; el map solo es `is map`). El snapshot es EVIDENCIA, no autoridad.

**74.2 Cómo M2b aplica (al construirse)**: UN `writeBatch` ejecutado por Daniel, 3 escrituras (anular original con motivoCategoria+corregidoPor + crear reemplazo con correccionDe+solicitudId, `registradoPor=Daniel` + transicionar solicitud→aprobada). Garantía anti-doble-corrección/TOCTOU = `anulacionValida.resource.anulado==false` (atómica, pre-batch), NO la re-lectura. M2b RE-LEE el original y re-valida (a) vigente, (b) tipo coincide, (c) original no mutado vs snapshot, (d) delta coherente, (e) reemplazo válido; (f) drift de saldo y (g) drift de snapshot ADVIERTEN. **NUNCA confía en `datosCorreccion`** (honra el forward-risk #2 del red-team M1 §72).

**74.3 Verificación**: workflow de 5 agentes (3 propuestas — lentes contable/arquitecto/UX → síntesis → verificación adversarial). Veredicto **SÓLIDO**: el payloadEjemplo pasa `solicitudValida()` clave por clave TAL CUAL desplegada (`monto is int` admite el delta negativo); M2b puede re-validar sin confianza ciega; sin exploit. CRUDO → bóveda.

**74.4 UI construida (M2a-3)**: botón "Corregir" por movimiento (`cuenta.js`/`admin-cuenta.html`) → modal con motivo derivado (PREGUNTAS_CORRECCION + "la fecha está mal"→CORRECCION_FECHA) + monto/fecha correctos + ANUNCIO en vivo del efecto + ruteo `corregirMovimientoBatch` (auto) / `crearSolicitud` (a Daniel). Gate = `anulacionRequiereAprobacion` (anular el original es la pata destructiva). Sin toast optimista; error humano en permission-denied.

**74.5 efectoSaldo compartido**: `efectoSaldo(tipo,monto)` + `planearCorreccionMovimiento` extraídos a `js/crm-correccion.js` (PURO): UNA fórmula de signo para el productor (M2a) y el re-validador (M2b), sin copias divergentes. Tests crm-correccion **22/22** (+ efectoSaldo + 5 de planearCorreccionMovimiento). Build verde.

**74.6 DEFERIDOS (del verificador — al backlog `fase-m-plan.md` para no perder)**: (1) cuando M3 endurezca `movimientoValido()` con `hasOnly`, DEBE whitelistar `correccionDe` + `solicitudId` + `medioPago` o el SET del reemplazo (pata 2 del batch de M2b) revienta. (2) M2b genera `solicitudId` server-side (nunca del cliente). (3) M2b importa `efectoSaldo` (no copiar la fórmula).

**74.7 Archivos**: `js/crm-correccion.js` · `tests/crm-correccion.test.mjs` · `admin-cuenta.html` (modal corregirmov) · `js/admin/cuenta.js` (wireCorregirMov + botón Corregir + _movsById). CRUDO → bóveda `research-archive/2026-06-10-diseno-contrato-correccion-CRUDO.json`. **Sin deploy** (la UI no va en vivo hasta M2a-6: cache bump + merge + smoke con Kary). Sin cache bump aún.

## 2026-06-10 — §75: Verificación EXPERTA de la UI de M2a (reemplaza el smoke de Kary) + go-live

> Daniel (enfático): *"NO necesitamos a Kary, ella no sabe nada, no es contadora, solo dueña de la empresa, y nos dio la decisión a nosotros; necesito que seas el experto en todo."* → Kary NO es verificadora; **Claude verifica como experto**. El gate "smoke con Kary" del plan Fase M se REEMPLAZA. Memoria `feedback_claude_experto_verifica`.

**75.1 Verificación**: revisión adversarial multi-agente de TODA la UI de M2a (12 agentes, 3 dimensiones — conformidad con reglas desplegadas · lógica de dinero · wiring/edge-cases → verificación adversarial de cada hallazgo). **Atrapó 3 bugs reales** (2 bloqueantes de dinero) que clics de un no-técnico NO habrían visto.

**75.2 Bugs corregidos**: (1) BLOQUEANTE — "Corregir saldo" no bloqueaba ajustes duplicados (2º envío idéntico → doble ajuste si Daniel aprueba ambos) → guard `mismo tipo+monto pendiente` (paridad con corregir-movimiento). (2) BLOQUEANTE — corregir un movimiento con monto vacío/0 creaba un asiento de **$0 silencioso** (corrompe el saldo) → guarda `!(monto>0)` para factura/abono + `required` en el input. (3) SPEC — un ajuste rechazado quedaba SIN botón → "Volver a corregir saldo" (`_abrirCorregirSaldo`).

**75.3 Re-verificación**: agente adversarial enfocado a los 3 fixes → **3/3 CERRADOS, sin regresiones**. Build verde. **0 bloqueantes restantes**. Lección **L-39**.

**75.4 Go-live**: cache `bersaglio-v10` + indicador `APP_VERSION` v10 + reglas M1/M2a-1b ya en prod → merge `Desarrollo→main` (Pages despliega M2a). Archivos: `js/admin/cuenta.js` · `admin-cuenta.html`. CRUDO → `research-archive/2026-06-10-verif-experta-ui-m2a-CRUDO.json`. Siguiente: M2b (superficie de Daniel; contrato §74).

## 2026-06-11 — §76: M2b — Superficie de aprobación de Daniel (cola en Salud) + verificación experta pre-push

> Slice M2b del tren Fase M (plan §69 L80-87): la otra mitad del sistema de control — Kary pide (M2a, en prod), Daniel decide AQUÍ. **Decisión de Daniel al iniciar (backlog §72-1, SoD del owner)**: *"sí, recomendado pero que esto no incluya mi usuario… yo sí puedo hacer de todo"* → **excepción consciente**: el owner NO tiene candado de auto-aprobación (puede todo; cualquier inconveniente lo corrige él con su usuario). CERO cambios en reglas.

**76.1 Contexto/decisiones**: cola de pendientes en Salud (owner-only) vía collectionGroup de M1 (índice COLLECTION_GROUP estado+creadoEn verificado VIVO en prod con `firestore:indexes`). SoD owner = excepción consciente (arriba). Backlog §72-2 cumplido: M2b re-valida SIEMPRE, nunca confía en `datosCorreccion`. §72-3 (tope motivoRechazo) descartado por consistencia (nadie topa strings; solo el owner lo escribe).

**76.2 Solución estructural**: (1) `js/crm-aprobacion.js` PURO — re-validador §74 (a-e bloquean, f/g advierten; `efectoSaldo` IMPORTADO) + planners de payload (`solicitudId` = id real del doc; el ajuste aprobado porta `motivo`+`nota` TOP-LEVEL = deferido 4 nuevo); (2) `crm-service.js` — `onSolicitudesPendientesChange(cb, onError)` (un error de listen es TERMINAL → la cola nunca muere muda) + batches atómicos (corrección 3 escrituras / ajuste 2 / rechazo con motivo); (3) `js/admin/aprobaciones.js` — tarjeta con contexto PR3 (clienta, mora, últimos 5 movs, saldo ANTES→DESPUÉS recomputado al render, alerta roja de drift PR2), aprobar/rechazar POR solicitud (sin "aprobar todo"), banner de identidad, modal de rechazo con motivo obligatorio, rechazos automáticos (obsoleta `ASIENTO_YA_NO_VIGENTE` / no-cuadra `DATOS_NO_COINCIDEN`) SIEMPRE re-validados al click; (4) `cuenta.js` — "Volver a corregir" sigue la cadena `corregidoPor` hasta el asiento vigente + guard anti-asiento-anulado + textos humanos para los rechazos automáticos.

**76.3 No-regresión**: M2a intacto (cuenta.js solo aditivo); `estadoBadgeHTML` conserva su salida (se extrajo `estadoPillClass`); reglas/functions/índices SIN cambios (`firestore.rules` byte-idéntico).

**76.4 Verificación**: tests puros crm-aprobacion **21/21** · suite de reglas **104/104** (4 nuevos M2b: batch 3-escrituras del owner PASA · original ya-anulado revienta el batch ENTERO y la solicitud queda pendiente · batch simple 2-escrituras PASA · admin NO ejecuta la aprobación) · build verde · **verificación experta pre-push (workflow 16 agentes, 4 lentes + verificación adversarial)**: 7 confirmados, todos corregidos — (a) falso "obsoleta" por fallo de carga de contexto → el rechazo automático ahora RE-LEE el original al click (espejo de aprobar); (b) tarjeta sin contexto ofrecía Aprobar a ciegas → tarjeta neutra sin botones de decisión + Reintentar; (c) bucle sin salida de Kary (re-solicitar sobre asiento anulado) → cadena corregidoPor + guard; (d) cola moría en silencio sin error-callback → estado de error visible; (e) handleAprobar sin catch → catch+toast; (f) choque M2b→M3 en la regla COINCIDENCIA → motivo/nota top-level + ENMIENDA del plan M3 (deferido 4); (g) 05 stale v10→v11. 2 falsos positivos descartados con razón (mapa SIGNO display-only; drift de dos fuentes = diseño explícito del plan).

**76.5 Anti-patterns evitados**: confiar en el render para escribir códigos de auditoría (el render SUGIERE, el click RE-VALIDA — L-40) · toast optimista · innerHTML con datos (tarjetas 100% createElement/textContent) · "aprobar todo" · fallo silencioso de listener · link a ficha muerta.

**76.6 Archivos**: NUEVOS `js/crm-aprobacion.js` · `js/admin/aprobaciones.js` · `tests/crm-aprobacion.test.mjs`. MODIFICADOS `js/crm-service.js` · `admin-salud.html` · `js/admin/salud.js` · `js/admin/cuenta.js` · `js/admin/saldo-format.js` · `tests/firestore-rules.test.mjs` · `package.json` · `public/sw.js` · `js/admin/sidebar-data.js`. INTACTOS `firestore.rules` · `firestore.indexes.json` · `functions/*` · `js/crm-correccion.js` · `js/crm-estado-cuenta.js`.

**76.7 Doctrina + cache**: bump `bersaglio-v11` + `APP_VERSION` v11 (§4). Lección **L-40**. CRUDO → bóveda `research-archive/2026-06-11-verif-experta-m2b-CRUDO.json`; plan M3 ENMENDADO (regla COINCIDENCIA por tipo de solicitud — la redacción literal habría reventado toda aprobación al desplegar el candado) + deferido 4 en `fase-m-plan.md`. **Pendiente para cerrar M2b**: PR `Desarrollo→main` (mergea Daniel) + guion de verificación CON Daniel en prod (plan L87, 5 tareas). Siguiente: M3 candado (Consejo Externo ANTES).

**76.8 CIERRE — guion EJECUTADO EN PROD (2026-06-11, mismo día)**: Daniel mergeó el PR #226 (Pages desplegó; sw `v11` + bundle M2b verificados VIVOS por fetch). Daniel no quiso operar el guion (*"pensé que tú harías las pruebas"* — coherente con [[feedback_claude_experto_verifica]]): **Claude lo ejecutó como experto vía el navegador de Daniel** (Chrome MCP; Daniel SOLO inició sesión — Claude jamás toca credenciales). Fixtures: `functions/seed-guion-m2b.mjs` (clienta de ensayo `zz-prueba-m2b` + 3 movimientos + 4 solicitudes espejo EXACTO del contrato §74; preflight/aplicar/verificar/limpiar; siembra AUTORIZADA explícitamente por Daniel). **Resultado 5/5**: (1) cola con contexto real — mora "Vencido · 15 días" EXACTA, saldo 460k recomputado; (2) ajuste simple aprobado (2 escrituras, toast, contador 4→3); (3) corrección aprobada (3 escrituras: original TACHADO en la mini-lista, reemplazo $80k con fecha original, mora recalculada a "Al día" en vivo); (4) rechazo con motivo (Kary lo ve en la ficha con botón "Volver a corregir saldo"); (5) alerta roja de drift visible con el fixture ($999.000) **y además en condiciones reales** (tras aprobar (2), las tarjetas restantes alertaron "era $460.000" — PR2 funcionando en vivo). **Auditoría interna 10/10** (`--verificar`): saldo final $10.000 exacto; sellos `resueltoPor`=uid de Daniel; aprobada sin `motivoRechazo`; asiento con motivo+nota top-level+`solicitudId`; f1 anulado con `motivoCategoria`+`corregidoPor`→reemplazo; 5 asientos. Estado vacío ("Al día · No hay solicitudes") verificado. 0 errores de consola. **Limpieza VERIFICADA** (recursiveDelete + vigilancia de fantasma del trigger: cero rastro). **M2b CERRADO.**

## 2026-06-12 — §77: M3 — el CANDADO de las reglas (construido + Consejo Externo + red-team; deploy en 2 etapas)

> El slice más delicado de la Fase M: las reglas RESTRICTIVAS (contract del expand-contract §69). Proceso completo de Decisión Fuerte: **Consejo Externo Gemini 3.1 Pro High ANTES** (anti-anclaje §15: postura sellada en la bóveda; síntesis peer-review: 4 adoptados / 5 refutados con razón) → censo de evidencia en prod → implementación → suite exhaustiva → **red-team W-01 por 16 agentes DISTINTOS** → 2 bloqueos operacionales reales corregidos. También quedaron registradas 2 directivas de Daniel: RBAC por dependencias (TODO-19 → `50-ARQUITECTURA §5`) y migrar el correo del owner (TODO-20 → bóveda `41-SEGURIDAD §1.7`).

**77.1 Consejo Externo (Gemini, vía Daniel/Antigravity)**: ADOPTADO — (a) **cota de fecha FUTURA** en CREATE (su mejor hallazgo: una factura fechada 2030 jamás vence = deuda parqueada fuera de la mora; el comité solo había visto la fecha como reloj de auditoría); (b) sin `abs()` en rules → tope negativo con signo; (c) 4 casos de test (update mutante · legacy sucia VERDE · hijacking · fechas extremas); (d) censo legacy pre-deploy. REFUTADO — pitufeo (residual declarado, M4 detective), mutación encubierta (hasOnly ya desplegado), contención térmica del get() (confunde lecturas con escrituras), veneno hasOnly en legacy (la anulación valida el DELTA desde M0-H), **grace period 15 min para anular abonos** (reabre el vector #1 del skimming; política A.3 deliberada — si la fricción real de Kary resulta frecuente, se re-presenta a Daniel CON datos). Prompt+respuesta+síntesis → bóveda `research-archive/2026-06-11-consejo-externo-m3-prompt.md`.

**77.2 Evidencia pre-deploy**: `functions/censo-movimientos-m3.mjs` (read-only) sobre los 344 movimientos de prod: TODOS con exactamente las 7 claves base (⊆ whitelist), fechas ISO en cotas, montos enteros, tipos válidos, `anulado` presente → cero riesgo legacy.

**77.3 El candado (firestore.rules)**: `movimientoValido(clienteId)` — whitelist `hasOnly` de 13 claves · `registradoEn == request.time` · `fechaHechoValida` (ISO + piso 2015 + **no futura** +2d vía `timestamp.date(int(split))`; 2026-02-30 revienta → deny) · abono ⇒ `medioPago` de lista LITERAL (cero get en el camino diario) · `vencimiento` solo facturas (futuro permitido — es su uso) · gate de AJUSTE (`ajusteAutorizado`): motivo de taxonomía literal + nota; negativo del admin solo motivo ∈ `config.motivosNeutros` (**config-driven** con default canónico — el panel Parámetros lo edita; red-team) y `monto >= -tope`; get() SOLO en la rama admin (anti-lockout) · **COINCIDENCIA** (`asientoCoincideConSolicitud`): solicitudId ⇒ owner + solicitud PENDIENTE del MISMO cliente (get anclado al path → hijacking cross-cliente imposible) + match POR TIPO (ajuste: tipo/monto/motivo; corrección: contra `datosCorreccion.reemplazo` + `correccionDe` — enmienda §76). `anulacionValida` — tabla de predicados que LEE `resource.data`: abono ⇒ owner SIEMPRE (anti-skimming) · factura/apertura/ajuste >0 ≤tope ⇒ admin · >tope u ≤0 ⇒ owner (falla cerrado) · `motivoCategoria` OBLIGATORIO de lista = **UNIÓN** (anulación pura + categorías del mostrador `ABONO_NO_REGISTRADO`/`DESCUENTO_AUTORIZADO` — bloqueante del red-team) · `anuladoEn == request.time` · delta-only (legacy sucia anulable).

**77.4 Red-team W-01 (16 agentes, 4 lentes + verificación adversarial — CRUDO en bóveda)**: 2 bloqueos operacionales REALES que la suite verde no veía — (1) BLOQUEANTE: el modal "Corregir movimiento" deriva motivoCategoria de PREGUNTAS_CORRECCION y dos valores no estaban en la lista de anulación → ni Kary ni Daniel podían completar el caso cotidiano "descuento autorizado" → lista UNIÓN + tests; (2) IMPORTANTE: corregir un ABONO brickeado (el reemplazo no llevaba `medioPago`) → propagación en TODA la cadena (`planearCorreccionMovimiento` + `planAprobacionCorreccion` + `corregirMovimientoBatch`, herencia del original re-leído + fallback 'otro') + test de batch de abono. +5 huecos de suite cerrados (factura/abono negativos · autoría suplantada · rama corrección de la coincidencia · bordes exactos ±tope · tolerancia +2d y mes 13/00). 3 falsos positivos refutados con razón. **Suite final: 133/133** + crm-correccion 22/22 + crm-aprobacion 22/22 + build verde.

**77.5 Forward-compat de la UI (en ESTE cambio, ANTES del contract — doctrina expand-contract)**: ajuste directo de Kary envía `motivo`+`nota` top-level (`addMovimiento` + cuenta.js) · un AJUSTE ya no se corrige con par (botón Corregir oculto para ajustes; se anula + ajuste nuevo; bloqueador en el validador M2b + guard en reSolicitar) · reemplazo de abono porta `medioPago`. Cache bump **v12**.

**77.6 No-regresión**: M2a/M2b INTACTOS en comportamiento (cambios aditivos); functions/índices SIN cambios; `estadoCuenta`/`computeSaldo` intactos.

**77.7 DEPLOY EN 2 ETAPAS (gated)**: (1) UI v12 → PR `Desarrollo→main` (mergea Daniel) → verificar v12 VIVO; (2) SOLO entonces `firebase deploy --only firestore:rules` + smoke del flujo diario EN PROD el mismo día. Rollback = evento de control (runbook §69-D). Las reglas NO se despliegan hasta cumplir (1).

**77.8 CIERRE — CANDADO EN PROD + smoke 4/4 (2026-06-12, mismo día)** [ver §78 para M4]: Etapa 1: Daniel mergeó PR #228 → `sw v12` + bundle nuevo verificados VIVOS por fetch. Etapa 2: `firebase deploy --only firestore:rules` → compilación y release OK (el compilador validó `timestamp.date/int/split/get-default`). **Smoke EN PROD vía navegador de Daniel** (autorizado; él solo inició sesión): clienta de ensayo creada DESDE LA UI (`3van9pWsUdujmLnmI2jQ`; el 1er intento falló por el emoji en el nombre — tipeo del browser-driver, no reglas) → bajo el candado vivo pasaron las 4 operaciones del mostrador: factura $40.000 ✓ · abono $10.000 efectivo ✓ · ajuste directo −$5.000 ERROR_REGISTRO+nota ✓ (y el botón Corregir OCULTO en la fila del ajuste — v12) · anulación con categoría DUPLICADO ✓ (tachada). Saldo recalculado EXACTO en cada paso (40→30→25→−15 a favor). **Auditoría interna** (`functions/limpiar-cliente-prueba.mjs --verificar`, herramienta nueva con doble candado anti-borrado de clientas reales): los 3 asientos portan el contract completo (reloj de servidor, fecha ISO, medioPago, motivo+nota top-level, anulación sellada). **Limpieza VERIFICADA: cero rastro.** Riesgo conocido aceptado: el smoke corre como OWNER (las ramas gateadas del admin quedan cubiertas por el emulador byte-idéntico; el primer día de Kary bajo v12 es el smoke admin natural — vigilar). **M3 CERRADO → el TREN M2a+M2b+M3 COMPLETO Y OPERANDO.** Siguiente: M4 (auditoría detectiva en Salud + corte mensual inmutable).

## 2026-06-12 — §78: M4 — Auditoría detectiva construida COMPLETA (reglas+CF desplegadas; UI v13 lista para PR)

> La pata DETECTIVA del sistema de control (plan §69-M4): lo que las reglas no pueden sumar, aquí se vigila. Construido punta a punta en la misma sesión que cerró M3, con verificación experta propia. **Directiva de Daniel (2026-06-12): Kary prueba TODO al final, no por etapas — la verificación por slice sigue siendo experta de Claude.**

**78.1 Contexto**: con el candado M3 operando, el preventivo real es el tope POR TRANSACCIÓN; M4 añade la vigilancia de lo agregable (pitufeo mensual, patrones de evasión) + el ancla probatoria (corte mensual inmutable) + el acta de conciliación (SoD del arqueo: Kary no se arquea a sí misma).

**78.2 Construido**: (1) REGLAS desplegadas — `conciliaciones/{mes}` (acta create-once owner, docId YYYY-MM validado, reloj de servidor, update/delete false) + `cortes/{mes}` (write false al cliente; solo la CF); (2) DETECTORES PUROS `js/crm-auditoria.js` (11/11) — tajadas del mes por clienta vs tope mensual (anulados cuentan: el intento queda firmado), anulaciones con flag determinista "corrección sin enlace", alerta "rechazada burlada" (±10% piso $1.000, ventana 30d sobre resueltoEn), recaudo por medioPago (anulados/legacy aparte), muestra trimestral con sorteo SEMBRADO (imposible re-sortear), degradado por SLA; (3) CF `corteMensual` DESPLEGADA (día 1, 03:50 Bogotá; foto del aging por clienta del mes cerrado; inmutable — si existe no reescribe) + `generarCorte` callable owner de respaldo; **aging = `functions/crm-estado-cuenta.mjs` copia BYTE-IDÉNTICA del módulo del panel, con test de PARIDAD (3/3) que revienta ante divergencia** (L-03: una fórmula) + bordes de `mesAnterior` en Bogotá (rollover de enero); (4) UI — sección "Cartera — mes en curso" en Salud (`js/admin/auditoria-cartera.js`) + acta con prefill del recaudo real + aviso de SLA en "Hoy" (`js/admin/aviso-solicitudes.js`, admin/owner, con re-evaluación por paso del tiempo). Cache **v13**.

**78.3 No-regresión**: M2a/M2b/M3 intactos; `salud.js` solo añade el init; `dashboard.js` solo el aviso; listeners nuevos con onError (L-40).

**78.4 Verificación**: detectores 11/11 (fixtures del plan: clienta sobre tope resaltada · sin-enlace dispara · burlada dispara · degradado al exceder SLA · totales · muestra determinista) · reglas 136/136 (acta one-way/forma/docId; cortes solo-CF) · paridad 3/3 · build verde · **verificación experta (22 agentes, 3 lentes + adversarial; CRUDO en bóveda)**: 12 confirmados corregidos — **BLOQUEANTE: `setMonth(-1)` sobre días 29-31 "normaliza" al mes EN CURSO → el acta inmutable se habría quemado con el MES EQUIVOCADO justo en los cierres** (anclado al día 1 + guard mes-no-cerrado); el form del acta ya no se reconstruye por snapshots en vivo (solo refresca el resumen); acta gateada por movsLoaded/truncado/contradicción cuadra+diferencias; onError en onActaChange/onUltimoCorteChange; ventana de rechazadas 120d documentada (corre sobre creadoEn, la detección sobre resueltoEn); copy sin anglicismos; estados vacíos honestos por bloque.

**78.5 Anti-patterns evitados**: doc inmutable alimentado con datos parciales (gates) · matemática de calendario sin anclar al día 1 (L-29 ext) · listener mudo · re-render que pisa input del usuario · sorteo re-jugable.

**78.6 Archivos**: NUEVOS `js/crm-auditoria.js` · `js/admin/auditoria-cartera.js` · `js/admin/aviso-solicitudes.js` · `functions/corte.js` · `functions/crm-estado-cuenta.mjs` · `tests/crm-auditoria.test.mjs` · `tests/aging-paridad.test.mjs`. MODIFICADOS `firestore.rules` · `js/crm-service.js` · `admin-salud.html` · `js/admin/salud.js` · `js/admin/dashboard.js` · `functions/index.js` · `public/sw.js` · `js/admin/sidebar-data.js` · `package.json` · `tests/firestore-rules.test.mjs`.

**78.7 PENDIENTE para CERRAR M4** (próxima sesión): PR `Desarrollo→main` (mergea Daniel) → verificar v13 + sección en prod vía navegador → marcar cierre aquí (§78.8). El PRIMER corte real corre solo el 1 de julio 03:50 (verificar `cortes/2026-06` ese día o correr `generarCorte`). Luego: M2c/M5-M7 (diferibles) · B6 reportes · TODO-19 RBAC · TODO-20 correo owner (riesgo activo).

**78.8 CIERRE — M4 EN PROD (2026-06-12)**: Daniel mergeó el PR #232 (`ba7a465`; `git fetch` lo reveló al arrancar la sesión — L-26). Verificado VIVO por fetch (mismo patrón de evidencia que §76.8/§77.8): `sw.js` en prod = `bersaglio-v13` · `admin-salud.html` contiene la sección "Cartera — mes en curso (auditoría)" · el bundle del panel (`admin-CFxHr7PX.js`) porta el aviso de degradado SLA · chunk `crm-auditoria` precargado en prod. Reglas+CF ya estaban desplegadas desde §78.2. No hubo smoke interactivo con sesión: la verificación de UI quedó cubierta por los 22 agentes pre-merge (§78.4) + directiva de Daniel (Kary prueba TODO al final). Solo queda SIN mergear el commit de cerebro `b59b9e2` (documentación; viaja con el próximo PR). **M4 CERRADO → tren M2a+M2b+M3+M4 COMPLETO Y OPERANDO EN PROD.** Vigilancia restante: el PRIMER corte real corre el 1 de julio 03:50 Bogotá → verificar `cortes/2026-06` ese día (o correr `generarCorte` como respaldo). Siguiente del programa: M2c/M5-M7 (diferibles) · B6 reportes · TODO-19 RBAC · TODO-20 correo owner.

## 2026-06-12 — §79: M5 — Gestiones de cobro: la UI del expediente (reglas vivas desde M1)

> Con el tren M0→M4 operando, Daniel delegó "lo que sigue". De los slices sin compuerta (M2c pulido · M5 gestiones), **M5 se eligió por apalancamiento de tiempo**: la candidatura a castigo (M7) exige gestiones repartidas en ≥3 meses calendario DISTINTOS — ese reloj solo corre cuando Kary puede registrarlas, y la cartera vieja ya califica como pre-candidata. Cada semana sin esta UI atrasaba linealmente el expediente.

**79.1 Contexto**: las reglas de `clientes/{id}/gestiones` viven desplegadas desde M1 (§72): create admin con `gestionValida()` (whitelist, listas literales, reloj de servidor), update/delete FALSE (evidencia art. 146 ET — una equivocación se aclara con OTRA gestión) + collectionGroup read. `registrarGestion()` ya existía en `crm-service.js`. Faltaba TODO lo visible.

**79.2 Construido**: (1) `js/crm-gestiones.js` PURO — listas espejo LITERAL de la regla (tipos llamada/whatsapp/visita/otro · resultados promesa_pago/sin_acuerdo/no_contesto/numero_invalido/otro, con etiquetas de mostrador), `validarGestion()` (espejo + UNA exigencia extra: fecha no futura — la UI evita el dato absurdo, la regla sigue siendo la frontera), `ordenarGestiones()` (fecha del hecho DESC, empate por creadoEn; el serverTimestamp PENDIENTE cuenta como el más nuevo) y `esEnlaceSeguro()` (solo http(s) clickeable — corta javascript:); (2) `onGestionesChange()` en `crm-service.js` (orderBy creadoEn = índice automático, cero índices nuevos; detector de truncado; `onError` L-40); (3) ficha (`admin-cuenta.html` + `cuenta.js`): sección "Gestiones de cobro" con contador, timeline (tarjetas con fecha·tipo·resultado·nota·soporte·sello de registro VISIBLE) y modal de registro (selects de mostrador, fecha default hoy con `max` anti-futuro, nota en textarea, copy de inmutabilidad explícito). El conteo sale del MISMO listener (set completo de la clienta); el aggregate count() de C4 §69 queda para la lista CxC de M7. Cache **v14**.

**79.3 No-regresión**: diff 100% aditivo — flujos factura/abono/anular/corregir/editar/solicitudes INTACTOS (verificado por la lente de integración); `firestore.rules`, `functions/` e índices SIN cambios.

**79.4 Verificación**: tests puros 14/14 (`test:gestiones`, listas espejo con deriva=rojo) + suites afectadas (estado 15 · corrección 22 · auditoría 11 · sidebar 9) + build verde · **verificación experta (13 agentes, 4 lentes: contrato/integración/seguridad-DOM/UX-Kary + refutación adversarial; CRUDO en bóveda)**: 9 confirmados / 0 refutados, todos atendidos — 2 IMPORTANTES: (a) toast de error genérico de 2.5s sin siguiente paso → copy accionable + 5000ms; (b) **offline, addDoc NO falla: el botón quedaba congelado sin aviso y un reintento crearía una gestión DOBLE imborrable** → guardia `navigator.onLine` antes de enviar + aviso honesto a los 8s SIN re-habilitar; 6 menores: orden transitorio del serverTimestamp pendiente (Infinity en el desempate + test), contador "(N)" stale si el listener muere, `max` en el date-picker, sello de registro visible en móvil (no solo tooltip), textarea para la nota, y validación más temprana. **1 DIFERIDO al próximo deploy de reglas**: `gestionValida` no acota `size()` de nota/soporte (docs inmutables; mismo gap en `solicitudValida`/`asientoValido`) — anotado en `10`.

**79.5 Anti-patterns evitados**: listener mudo (onError + estado honesto + contador limpio) · reintento que duplica evidencia inmutable · dato absurdo permitido por el picker y reclamado tarde · sort con NaN (Infinity−Infinity) · enlace de soporte ejecutable (javascript:) · innerHTML con datos de Firestore (todo textContent).

**79.6 Archivos**: NUEVOS `js/crm-gestiones.js` · `tests/crm-gestiones.test.mjs`. MODIFICADOS `js/crm-service.js` (solo +onGestionesChange) · `js/admin/cuenta.js` · `admin-cuenta.html` · `public/sw.js` (v14) · `js/admin/sidebar-data.js` (APP_VERSION) · `package.json` (script). INTACTOS `firestore.rules` · `functions/*` · `firestore.indexes.json`.

**79.7 PENDIENTE para CERRAR M5**: PR `Desarrollo→main` (mergea Daniel) → verificar v14 + sección por fetch → marcar cierre aquí (§79.8). Kary prueba TODO al final (directiva 2026-06-12). El conteo de "gestiones VÁLIDAS" para candidatura (meses distintos, materialidad) es M7 — esta UI solo registra y muestra.

**79.8 CIERRE — M5 EN PROD (2026-06-12, mismo día)**: Daniel mergeó el PR #233 (`bf1c308`). Verificado VIVO por fetch (patrón §78.8): `sw.js` en prod = `bersaglio-v14` · `admin-cuenta.html` porta la sección de gestiones · el bundle de la ficha (`admin-cuenta-DbIJUd1L.js`) contiene el módulo (`promesa_pago`). **M5 CERRADO.** En el mismo mensaje Daniel dio la directiva de producto que DESTRABA M6 (ver §80): el acuerdo de pago se pacta POR DEUDA al crearla — "todas las deudas no son iguales" — y lo configurable queda en el panel como default.

## 2026-06-12 — §80: M6 — Acuerdo de pago POR DEUDA (vencimiento explícito + aging por acuerdo)

> Directiva de Daniel (2026-06-12, resuelve la pregunta 1 del plan §69 por diseño): *"un cliente se le puede dar plazo de lo que ella decida… en vez de la configuración, cuando se crea el fiado ahí mismo se coloca el acuerdo de pago… todas las deudas no son iguales"*. El default (días de plazo) SIGUE configurable en el panel; cada deuda lo sobreescribe con su acuerdo. **Salvedad ampliada de Daniel (mismo día, REGISTRADA para el siguiente diseño)**: en Cartagena el fiado se pacta como PLAN DE PAGOS — monto, fecha final, número de cuotas, periodicidad (quincenal/mensual/fechas específicas) — y se considera VENCIDO cuando una fecha de pago pactada pasa sin recaudo. M6 implementa la FECHA FINAL (el ancla del caso simple y del complejo); el plan de cuotas con fechas pactadas es un cambio de modelo de datos de dinero → se diseña como slice propio (M6b/B6, Decisión Fuerte: modelo + semántica de vencido por cuota + interacción con M7).

**80.1 Contexto**: el candado M3 ya admitía `vencimiento` (solo facturas, ISO, piso 2015, futuro permitido) — campo inerte hasta hoy. M6 lo vuelve OPERATIVO: el aging lo obedece.

**80.2 Construido**: (1) `js/crm-estado-cuenta.js` — vencimiento EFECTIVO por cargo = `mov.vencimiento ?? fecha+diasPlazo`; FIFO sigue por `fecha` (semántica fijada con test); vencimiento imposible (pasa la regex de la regla) → fallback por round-trip; cargo sin fecha → `sinFecha` intacto; nueva `vencimientoDefaultISO()` = LA MISMA suma del fallback (L-03); saneo de `diasPlazo` idéntico en ambas rutas (isFinite+trunc); `fechaVencidoMasAntigua` re-anclada al cargo con PEOR mora (coherente con `diasMora` post-M6). Copia BYTE-IDÉNTICA a `functions/crm-estado-cuenta.mjs` (paridad 3/3) → el corte mensual hereda la fórmula. (2) HERENCIA CONDICIONAL en correcciones (3 rutas: planner puro M2a, batch directo, aprobación M2b): el reemplazo de una factura conserva el acuerdo SOLO si `acuerdo >= fecha corregida`; si la fecha nueva lo pasa (típico: acuerdo = default de una fecha con dedazo), el acuerdo se SUELTA y la mora se re-ancla a fecha+plazo — jamás nace `vencimiento < fecha`; el planner es la única fuente (el batch solo valida formato). (3) UI — campo "Acuerdo de pago (¿para cuándo quedó?)" en el modal de factura: prellenado `fecha+plazo`, sigue a la fecha mientras Kary no lo toque (`_vencTocado`; el `min` se refresca SIEMPRE), obligatorio, tope anti-dedazo +365d con toast; "acuerdo: DD/MM/YYYY" visible en el historial (copy neutro, no "vence" en presente); modal Corregir muestra el acuerdo del original + anuncio que dice LA VERDAD (se mantiene / se suelta; ya no "cambia la fecha de mora" cuando el acuerdo manda) + hint de renegociación (anular + factura nueva). (4) DETECTOR M4 `acuerdosLargos()` (`js/crm-auditoria.js` + bloque en Salud): facturas vivas con `vencimiento − fecha > 120d` — el acuerdo sin techo reabre el vector de parqueo que el Consejo M3 cerró en la fecha; la regla no se toca (el acuerdo largo legítimo existe), se VIGILA. Cache **v15**.

**80.3 No-regresión**: reglas/functions/índices SIN cambios (la regla COINCIDENCIA compara tipo/monto/correccionDe — el asiento con vencimiento pasa, verificado contra el texto de la regla); facturas pre-M6 sin acuerdo conservan el comportamiento exacto (fallback = fórmula previa); pre-M6 `fechaVencidoMasAntigua` era idéntica por monotonía.

**80.4 Verificación**: estado 24/24 (9 casos M6) · paridad 3/3 · corrección 27/27 · aprobación 25/25 · auditoría 12/12 · gestiones 14/14 · build verde · **verificación experta (16 agentes, 4 lentes: fórmula del dinero / contrato / integración / UX + refutación adversarial; CRUDO en bóveda)**: 12 confirmados / 0 refutados, TODOS corregidos — 4 IMPORTANTES: (a) CORRECCION_FECHA congelaba para siempre un acuerdo nacido del default de una fecha equivocada y el anuncio lo negaba; (b) podía nacer `vencimiento < fecha` al corregir; (c) sin camino visible de renegociación (el evento más frecuente del mostrador); (d) parqueo de mora con acuerdo futuro sin techo (suprime SLA/aging y se congela en cortes inmutables). 8 menores (min stale ×2, saneo divergente, fechaVencidoMasAntigua incoherente, fallback asimétrico del batch, copy "vence" como alarma…).

**80.5 Anti-patterns evitados**: dos copias de la suma fecha+plazo (default UI vs fallback aging) · invariante de creación no aplicada en corrección · anuncio que confirma un modelo mental falso · campo de dinero saneado distinto en dos rutas · vector de evasión sin control detectivo · sort/contrato público mutado sin test que lo fije.

**80.6 Archivos**: MODIFICADOS `js/crm-estado-cuenta.js` + `functions/crm-estado-cuenta.mjs` (byte-idéntico) · `js/crm-correccion.js` · `js/crm-aprobacion.js` · `js/crm-service.js` · `js/admin/cuenta.js` · `admin-cuenta.html` · `js/crm-auditoria.js` · `js/admin/auditoria-cartera.js` · `public/sw.js` (v15) · `js/admin/sidebar-data.js` · tests ×4. INTACTOS `firestore.rules` · `functions/index.js`/`corte.js` · `firestore.indexes.json`.

**80.7 PENDIENTE para CERRAR M6**: PR `Desarrollo→main` (mergea Daniel) → verificar v15 + campo en prod por fetch → marcar cierre aquí (§80.8). Kary prueba TODO al final. SIGUIENTE DISEÑO (de la salvedad de Daniel): plan de pagos por cuotas (modelo + vencido por cuota pactada + M7) — slice propio con diseño deliberado, NO improvisado.

**80.8 CIERRE — M6 EN PROD (2026-06-12, mismo día)**: Daniel mergeó el PR #234 (`2299162`). Verificado VIVO por fetch (patrón §79.8): `sw.js` = `bersaglio-v15` · campo "Acuerdo de pago" en `admin-cuenta.html` · chunk `crm-estado-cuenta-CZUhsqyK.js` porta la fórmula nueva. **M6 CERRADO → tren M0→M6 COMPLETO Y OPERANDO.** En el mismo mensaje Daniel AMPLIÓ la visión (registrada en `50-ARQUITECTURA §5`): a los morosos se les hace seguimiento fijando ACUERDOS DE PAGO, y a futuro los pactará un ASESOR ASIGNADO, no Kary — todo debe diseñarse para empresa grande. → El diseño del modelo cuotas/acuerdos arranca con esa restricción de escala (ADR §81 al cerrar).

## 2026-06-12 — §81: ACUERDOS DE PAGO / plan de cuotas — diseño v2 (Consejo Externo) + build R1-R5 [OPUS-4.8 interino]

> ⚠️ **[OPUS-4.8 interino]** Fable 5 quedó NO disponible (memoria `feedback_opus_interino`); R1-R5 los construyó **Opus 4.8** y deben revisarse cuando Fable vuelva (Daniel avisará). Commits con footer `Co-Authored-By: Claude Opus 4.8`. Spec viva: `docs/superpowers/specs/2026-06-12-acuerdos-de-pago-design.md` (v2, checklist R1-R5 ✅).

**81.1 Causa raíz / origen**: directivas de Daniel 2026-06-12 — el fiado se pacta como PLAN (monto, fecha final, cuotas, periodicidad; vencido = fecha pactada sin recaudo) · seguimiento a morosos con ACUERDOS DE PAGO · a futuro los pacta un ASESOR asignado (pensar para empresa grande). Diseño v1 (comité 7 agentes, CRUDO `research-archive/2026-06-12-comite-acuerdos-cuotas-CRUDO.json`) → **Consejo Externo Gemini 3.1 Pro lo DEMOLIÓ** (respuesta + síntesis: `…2026-06-12-consejo-externo-acuerdos-respuesta.md`): hueco de fraude (jineteo) + sobre-ingeniería. Síntesis adopto/refuto: 4 hallazgos ADOPTADOS.

**81.2 Decisión estructural (v2, Consejo integrado)** — el acuerdo NO mueve dinero, re-programa la EXIGIBILIDAD: (a) **solo `alcance:'saldo'`** (el FIFO global ciego no atribuye por factura → matar el alcance granular); (b) **MUTEX `acuerdoVigenteId` en el doc del cliente** = la verdad de "cuál acuerdo vive"; crear/renegociar/anular es un batch que mueve el puntero (getAfter) → IMPOSIBLE el "acuerdo suelto" que ocultaba mora (vector de jineteo); (c) **ESCUDO de 2 estados** (no tramos): al-día → la deuda cubierta se rige por el cronograma; ROTO (≥N cuotas vencidas impagas, knob owner) → el escudo cae y revive el vencimiento ORIGINAL (mora histórica para el castigo M7); (d) **`acuerdoAlCorte` cristalizado** en el corte inmutable (estado al-dia/en-mora/incumplido firmado por el reloj — evidencia DIAN art. 146). YAGNI: fuera `acuerdoMaxSinAprobacion`; el mutex hizo innecesarios los detectores `solapados`/`huerfanos`.

**81.3 Build R1-R5 (todo gateado por `config/cartera.acuerdosActivos`, OFF en prod = inerte)**: R1 fórmula escudo (`6a7ba3f`) · R2 reglas mutex (`039ff2d`) · R3 corte estadoAlCorte + `formulaVersion:3` (`71e03e6`) · R4 UI saldo-only `pactarAcuerdo`/`anularAcuerdo` (`459bfb6`) · R5 detectores v2 (`3276c10`). Doc del diseño v2 (`ef95efa`) + memoria espacial (`919485c`).

**81.4 No-regresión**: sin acuerdos, `estadoCuenta` es BYTE-idéntica a la fórmula previa (test que lo fija) → 344 clientas legacy + M6 intactos, cero migración. Tren M0→M6 intacto. La implementación v1 de acuerdos quedó SUPERSEDED (reemplazada en el árbol, nunca estuvo viva).

**81.5 Verificación (ingeniería)**: `test:estado` (incl. M6) · `test:acuerdos` 15/15 (escudo) · `test:insumos` 4/4 (paridad de insumos + `acuerdoAlCorte`) · `test:paridad` 3/3 (byte panel↔functions) · `test:generador` 6/6 · `test:auditoria` 16/16 · emulador `test:rules` 144/144 (mutex: create suelto y jineteo denegados; renegociar/anular atómicos; cerrado inmutable) · build verde · grep sin refs v1. **Falta la verificación POR HITO** (comité + prueba en vivo, cadencia `feedback_verificacion_por_hitos`) — es parte de R6, NO se hizo aún.

**81.6 Anti-patterns evitados**: acuerdo suelto (mutex) · atribución por factura sobre FIFO global (saldo-only) · tramos sobre-ingenierizados (escudo) · estado derivado almacenado en el doc (cumplido/incumplido se DERIVAN; solo el corte los cristaliza) · sub-programación que esconde deuda (corte de frontera) · evidencia autodeclarada para el castigo (mora histórica desde cortes inmutables).

**81.7 Archivos**: MODIFICADOS `js/crm-estado-cuenta.js` + `functions/crm-estado-cuenta.mjs` (byte) · `firestore.rules` · `firestore.indexes.json` (índice CG acuerdos, ya de v1) · `js/crm-service.js` · `js/admin/cuenta.js` · `admin-cuenta.html` (ya de v1) · `js/crm-acuerdos.js` (generador, v1) · `js/crm-auditoria.js` · `js/admin/auditoria-cartera.js` · `functions/corte.js` · tests (`acuerdos-aging`, `corte-insumos`, `crm-auditoria`, `firestore-rules`, `crm-acuerdos`). `public/sw.js` = `v16` (sin bump nuevo: el rework no tocó shells; los chunks JS los rehashea Vite).

**81.8 PENDIENTE para CERRAR (R6, próxima sesión)**: (1) `firebase deploy --only firestore:rules,firestore:indexes,functions` (deploy manual mío, L-22); (2) encender `config/cartera`: `acuerdosActivos=true` + `horizonteAcuerdoDias=730` + `acuerdoIncumplidoCuotas=2`; (3) **verificación POR HITO** (comité de agentes + prueba en vivo de la feature completa vía navegador de Daniel) + CRUDOs; (4) marcar cierre §81.9. La cota futura del `vencimiento` M6 sigue sin techo en reglas (riesgo residual conocido, lo vigila `acuerdosLargos`). Diseño del ASESOR (RBAC, TODO-19) y de "fechas específicas" libres = slices futuros.

## 2026-06-15 — §82: AUTO-AUDITORÍA SEMÁNTICA Nivel-2 del cerebro (1ª con artefacto real) — 20 hallazgos [OPUS-4.8]

> **Deliberación**: comité multiagente — 8 sondas + verificación adversarial (workflow `auditoria-cerebro-nivel2`, skill `auditoria-cerebro`) → CRUDO `research-archive/2026-06-15-auditoria-cerebro-nivel2-CRUDO.md`. **[OPUS-4.8 interino]**.

**82.1 Causa raíz**: a pedido de Daniel, 1ª auditoría semántica REAL. Descubierto que `deepAudit.last=2026-06-09` era un baseline de INSTALACIÓN (§56 dejó la skill `auditoria-cerebro` como item N pendiente) SIN tabla de hallazgos en ningún lado — `brain:check:448` lo propagaba como "auditoría semántica: 2026-06-09" cada arranque (fachada, M-01). No había baseline con qué diffear.

**82.2 Solución estructural**: esta corrida se siembra como la 1ª auditoría con artefacto (CRUDO en bóveda + este ADR + fila en `00` + `deepAudit.last=2026-06-15`, `coveredHeaderCount=82`, `ssotFacts` poblado). 20 hallazgos verificados (H-01…H-20), 5 falsos positivos refutados, 4 meta-lecciones (→`30 §Meta` M-01…M-04), 2 ítems de Decisión Fuerte → consejo externo (TODO-22/23).

**82.3 Hallazgos ALTA corregidos**: H-01 `05` decía "Desarrollo==main (PR #239)" siendo FALSO (Desarrollo +3 sobre `origin/main`, XSS `1fcd8c2` sin mergear; último PR #246) — cazado por 5 sondas; H-06 gate SSoT inerte (sin `ssotFacts`) + ningún gate lee git → `brain:check` decía "SANO" mientras `05` mentía; H-11 memoria del harness con ruta de repo inexistente (Desktop); H-12 memoria de 72d ordenaba escribir historial en CLAUDE.md (contradice §2/§G.3).

**82.4 Acciones de cierre**: GC de `05` (branch real ahead/behind, fecha, functions canónico 13 ✓`functions:list`); GC de `10` (Foco CMS = mergeado #243-#246, poda bitácora, dedupe cartera→`05`); `ssotFacts` poblado (cartera, dueño `05`) = gate vivo; memorias corregidas (ruta, protocolo de doc, footer Opus, dedupe estado); fila ruteo mora/aging en `00`; RESPUESTA Gemini WYSIWYG archivada verbatim (H-09) + cita de CRUDO efímero saneada (H-10). TODO-21 (ledger [OPUS-4.8]), TODO-22 (gate-git, Decisión Fuerte), TODO-23 (gate verificación dinero, Decisión Fuerte).

**82.5 Anti-patterns evitados**: score-teatro (sondas FALSABLES con evidencia `archivo:línea`+comando, sin puntaje LLM); auditoría que no cierra (GC pareado masa-neta boot ≤0); tocar el kernel ×3 a la ligera (gate-git diferido a Decisión Fuerte, L-31).

**82.6 Archivos**: `05`, `10`, `00-INDICE`, `30-LECCIONES`, este `99`, `.brain-manifest.json` (deepAudit+ssotFacts), `CLAUDE.md` (regla de admisión right-sized, H-15). Memoria del harness + bóveda = fuera del repo. INTACTOS: kernel `brain-check.mjs` (cambio diferido a TODO-22), código de producción.

**82.7 Doctrina**: M-01 ningún campo de estado del manifest se imprime como "hecho realizado" sin gate que verifique su artefacto. M-02 una lección procedimental sobre estado verificable-por-comando (git) debe volverse GATE, no quedar en prosa ([HONOR] se olvida). M-03 un campo `last` de tracking nace null/baseline, nunca con fecha que finja ejecución. M-04 la memoria del harness deriva en silencio (vive fuera de `docs/`, brain:check no la cubre). Próxima auditoría YA puede diffear.

## 2026-06-19 — §83: CMS P4 — Nosotros editable (motor de listas + modelo PLANO + imágenes) [OPUS-4.8]

> Cliente: "continuemos con Nosotros (P4)" + "poder añadir las imágenes del panel". La última página rica del sitio (12 secciones) pasa a CMS, con LISTAS repetibles (añadir/quitar/reordenar) — la primera capacidad de cardinalidad variable del CMS.

**83.1 Causa/contexto**: Nosotros tenía ~340 líneas de copy + 7 listas horneadas en `js/pages/nosotros.js`. El diseño (workflow 7 agentes `wf_159130b5`, CRUDO en bóveda) eligió **field-type `list` en el singleton-admin existente** (NO un scaffold aparte): reuso total de scaffold/guardado/preview/undo/imagen de Home y Contacto; las listas viven como arrays DENTRO de sub-mapas → las reglas (que no recursan, solo `is map`) las aceptan sin cambio en el camino crítico.

**83.2 Solución estructural**: (Fase 0) `nosotros.js` → renderers PUROS parametrizados + `nosotros-defaults.js` (SSoT) + `mergeNosotros` (planos=spread, listas=REEMPLAZO; `[]`=hide-when-empty, ausente=default). (Fase 1) field-type `list` en `singleton-admin-core` (`fieldHTML` rama list + `itemTemplateHTML` + `collectList` orden/trim/cap/compacta + `reindexItemSf` PURO). (Fase 2) UI add/del/up/down + reindex de `data-sf` 0..n + `updateItemTitle` en `singleton-admin.js`. (Fase 3) `nosotros-preview.js` + descriptor + pestaña. (Fase 4) cap de cardinalidad server-side `siteListOk` en `firestore.rules`. **Decisión B (Daniel)**: encabezados con conteo (valores/timeline) editables. **Imágenes (petición Daniel)**: hero/atelier (swap fondo CSS↔`<img>` safeUrl) + foto opcional por persona en equipo (fallback iniciales), reusando field-type `image` (P3.5).

**83.3 Modelo de datos (cara de revertir — gate de Decisión Fuerte)**: 2ª opinión externa Gemini (read-only, `docs/15`; síntesis en bóveda) **ADOPTADA**: aplanar de 8 claves (grab-bag `cartagena`) a **12 claves LÓGICAS** (`hero·manifiesto·maison·valores·timeline·equipo·atelier·cifras·certificaciones·resenas·faqs·cierre`), una por sección — desacopla el dato de la maqueta. **Migración CERO** porque se hizo ANTES de que existieran datos en prod. Refutado "imágenes=migración dolorosa" (es aditivo); diferidos con gatillo: IDs/deep-linking · rich-text/Markdown · reset-de-fábrica · concurrencia multi-editor (Bersaglio=single-operator Kary).

**83.4 Tests/verificación**: `tests/singleton-admin.test.mjs` 25/25 (core list + merge + reindex + image-en-lista) · `tests/firestore-rules.test.mjs` 169/169 (modelo plano, cap 24, "cartagena ya no existe", lista vacía OK, mal-tipado rechazado) · build verde · **revisión adversarial 9 agentes (0 crít/alto/regresión)** (CRUDO bóveda) · página pública IDÉNTICA con doc vacío (preview: 12 secciones, fallback de imágenes). Daniel validó el editor en vivo.

**83.5 Anti-patterns evitados**: scaffold duplicado (un solo motor `list`); deep-merge de arrays (reemplazo); array a nivel raíz (las reglas lo rechazarían); acoplar el modelo a la maqueta (aplanado pre-prod); poison-pill (guard por-ítem `raw||{}` → una escritura corrupta no blanquea la página); cap solo client-side (Fase 4 server-side, cierra la asimetría con `journalValid`); URL sin sanear (safeUrl en toda imagen).

**83.6 Archivos**: NUEVOS `js/pages/nosotros-defaults.js`, `js/admin/nosotros-preview.js`. MODIFICADOS `js/pages/nosotros.js`, `js/admin/singleton-admin-core.js`, `js/admin/singleton-admin.js`, `js/admin/contenido-tabs.js`, `css/admin.css`, `css/nosotros.css`, `firestore.rules`, tests. DEPLOY: `firebase deploy --only firestore:rules,storage` (cuenta `bersagliojewelry@gmail.com`). Deliberaciones → bóveda (`cms-p4-design`, `cms-p4-review`, `consejo-gemini-p4-modelo-SINTESIS`). INTACTO: Home/Contacto CMS (camino plano + field-type image sin tocar).

**83.7 Doctrina + estado**: aplanar un modelo cara-de-revertir es GRATIS antes de que existan datos en prod → el gate externo debe correr en esa ventana (L-39). Reglas: `.size()` topa cardinalidad de listas pero NO recursa en list-of-map (string por-hoja = client-side). EN PROD: P4 core (texto+listas) desplegado+validado 2026-06-19. **Imágenes en `Desarrollo` `b78c3aa`, pendiente merge de Daniel** (storage.rules avif ya desplegado). Sin cache bump (JS hasheado por Vite; HTML network-first).

## 2026-06-19 — §84: CMS web pública — cierre de fase visual (WYSIWYG F1+F2 · P3.5 imagen · F3 barandas · global datos de contacto) [OPUS-4.8]

> Consolidación (GC) de los increments del CMS que se desplegaron sin ADR propio (P4 = §83). Detalle técnico vivo → spec `docs/superpowers/specs/2026-06-15-cms-edicion-visual-wysiwyg-design.md`.

**84.1 WYSIWYG (F1 preview fiel + F2 clic-para-editar)**: el panel `admin-contenido.html` edita los singletons con **vista previa en vivo en iframe `srcdoc`** que reusa los renderers públicos puros. RCA dominante (Daniel "no se ve igual"): un `srcdoc` con `sandbox="allow-scripts"` SIN `allow-same-origin` queda en **origen opaco → viewport 0px** → layout colapsado; fix `allow-scripts allow-same-origin` (seguro: el contenido viaja escapado y `createContextualFragment` no corre `<script>`; toca ADR §82/`41-SEGURIDAD`). Fidelidad: iframe a **viewport desktop 1440 escalado** con `transform:scale` (+ `ResizeObserver`) porque tomar el ancho del panel (~760) disparaba el layout móvil. Sticky: `.adm-layout{height:100dvh}` cierra la cadena del app-shell para que el preview ancle. F2: `data-sf-section` (solo en el preview) + `postMessage` bidireccional clic↔foco. Commits `f0c7911`/`04e8769`/`6bb68ff`/`c98978a`. EN PROD.

**84.2 P3.5 — field-type `image` reusable**: subida a Storage (`optimizeImage` canvas→avif/webp ≤1600px + `uploadAsset`) con la URL en un `<input hidden data-sf>` (lo recoge `collectSingleton` como un campo más); render con `<img safeUrl>` + fallback al asset estático. **Hallazgo**: `storage.rules` solo permitía png/jpeg/webp pero `optimizeImage` produce **avif** → subidas rechazadas (bug latente también en piezas); fix `+image/avif`. Reusado luego en Nosotros (hero/atelier/fotos de equipo, §83). Commit `c6b7ff7`; `storage.rules` desplegado 2026-06-19. EN PROD.

**84.3 F3 — barandas del CMS**: estado `dirty` (marcado en cualquier edición texto/lista/imagen; limpiado al guardar/descartar/deshacer/cargar) + indicador **"Publicado ✓ / ● Cambios sin publicar"** + `beforeunload` (cierre/recarga) + `confirm` al cambiar de pestaña en `contenido.js` (revierte el hash si se cancela). `isDirty()` expuesto; `resource-admin` (journal) intacto. Admin-only, sin cambio de reglas. Commit `3c91ecf`. EN PROD.

**84.4 global — datos de contacto FUENTE ÚNICA**: nuevo singleton `siteContent/global` (claves ya whitelisted: contacto·footer·redes; cero deploy de reglas). RCA: el WhatsApp estaba **duplicado en 6 archivos, 2 con un número FALSO** (`573001234567` en footer+wishlist vs el real `573013752592`). Solución: whatsapp/email/instagram viven UNA vez en `global.contacto` (guardados como se muestran; href derivado con `waHref`/`igHref`); el footer (every-page) y los canales de la página Contacto **derivan** los mismos enlaces → imposible que driften. `redes`=solo Facebook. Pestaña "Datos globales". inc1 `7174348` (EN PROD) + inc2 `f52de0e` (**pendiente último merge**). **Pendiente inc3**: `wa.me` restantes (FAQ CTA contacto, carrito, lista-deseos, wishlist).

**84.5 Verificación/anti-patterns**: build + 27 tests CMS (`singleton-admin.test.mjs`) + 169 reglas (`firestore-rules.test.mjs`) + verificación en preview (página idéntica / hrefs derivados). Anti-patterns: dato duplicado entre componentes (→ fuente única + derivación); URL sin sanear (safeUrl en toda imagen/enlace editable); preview que rompe función por sandbox redundante.

**84.6 Archivos**: `js/admin/{singleton-admin,singleton-admin-core,contenido,contenido-tabs,live-preview,*-preview}.js`, `js/core/global-defaults.js` (NUEVO), `js/components/footer.js`, `js/pages/contacto.js`, `js/home/hero.js`, `css/{admin,nosotros}.css`, `storage.rules`. Spec WYSIWYG = SSoT del detalle. INTACTO: lógica de negocio (CRM/Fase M).

**84.7 Doctrina + estado**: un dato compartido por N componentes = UNA fuente + derivación (nunca copiar; la copia derivó en el bug del WhatsApp falso). Un preview en iframe sin JS público debe neutralizar patrones "invisible-hasta-JS" (reveal) replicando reduced-motion. EN PROD: WYSIWYG+P3.5+F3+global-inc1; **global-inc2 pendiente del merge final de Daniel** (sin deploy de reglas). Sin cache bump (Vite hashea).

## 2026-06-19 — §85: CMS global inc3 — wa.me restantes a la fuente única (cierre anti-deriva) [OPUS-4.8]

> Cliente: "continua". Cierra el pendiente que §84.4 dejó explícito: los CTAs de WhatsApp del NEGOCIO que seguían con el número horneado (`573013752592`) ahora derivan de `siteContent/global.contacto`. (inc2 `f52de0e` ya entró a `main` vía PR #265 — el flag "pendiente merge" de §84.4/`05` quedó resuelto.)

**85.1 Causa/contexto**: inc1/inc2 (§84.4) consolidaron whatsapp/email/instagram en `global.contacto` y cablearon footer (every-page) + canales de Contacto. Quedaban 5 consumidores con el número horneado → la "fuente única" aún NO era cierta. Barrido (`grep wa.me|573013752592|…`) clasificó: CTAs del NEGOCIO (cablear) vs teléfono del CLIENTE en admin/CRM (intactos) vs share `wa.me/?text` sin número en `entrada.js` (no es canal de contacto).

**85.2 Solución estructural**: cada consumidor deriva el enlace de la fuente única con fallback al default (= número real → migración-cero, sin cambio de comportamiento hasta que Daniel edite):
- `wishlist-drawer.js` / `lista-deseos.js` / `carrito.js`: `buildShareURL`/`buildWhatsAppCheckoutURL` → `waHref(mergeGlobal(data.getSiteContent('global')).contacto.whatsapp)` + `?text=`. Re-pintan por `data.onChange`/`.then` ya existentes (el load de `global` lo dispara `mountFooter` en cada página pública).
- `contacto.js`: la fn PURA `contactoFaqSection(c, waUrl)` recibe el enlace como **parámetro opcional con default seguro** (NO se importa `data` en la fn pura → el preview del CMS, que la llama sin 2º arg, sigue intacto). `renderFAQRapido` pasa el derivado; `refreshCanales` re-pinta el FAQ al llegar el override de `global` (cierra hueco de timing: `global` puede resolver después de `contacto`).
- `quick-dock.js` (atajo GLOBAL): el tool WhatsApp deriva de `global`; como el dock tiene estado de drag/posición, se **parchea el href en sitio** (`a.href = waUrl()`) on `data.onChange` en vez de re-renderizar.

**85.3 No-regresión**: IDs/clases/exports intactos; `contactoFaqSection` backward-compatible (default param) → `admin/contacto-preview.js` sin tocar. `global-defaults.js` (helpers `waHref/igHref/mergeGlobal`) SOLO consumido, no modificado.

**85.4 Tests/verificación**: build VERDE (3.18s) + 35 tests (`singleton-admin` incl. `mergeGlobal`/`waHref/igHref` + `lead-format`) + preview en vivo (`/contacto.html`: FAQ CTA, quick-dock y canal → `wa.me/573013752592`; `/lista-deseos.html` con ítem sembrado → share `wa.me/573013752592?text=…` bien formado; cero errores JS de runtime, solo Firestore offline del entorno headless L-05).

**85.5 Anti-patterns evitados**: dato duplicado entre componentes (→ derivación de fuente única); importar `data` en una fn PURA reusada por el admin (→ param opcional con default); re-render de un componente con estado efímero (drag) por un cambio de dato (→ patch in-place del atributo); tocar prosa legal / feed social por 1 número (→ diferido como follow-up, no es deriva viva: el default ahí ya es el número real).

**85.6 Archivos**: MODIFICADOS `js/components/{wishlist-drawer,quick-dock}.js`, `js/pages/{carrito,contacto,lista-deseos}.js` (commit `f757b25`). INTACTOS: `js/core/global-defaults.js`, `js/components/footer.js`, `js/admin/contacto-preview.js`, `js/core/data.js`, admin/CRM (teléfono del cliente), `js/pages/entrada.js` (share sin número), array `CANALES` de `contacto.js` (su href horneado lo sobrescribe `resolve()` → nunca llega al usuario). Sin bump de SW (JS hasheado por Vite; mismo criterio que inc1/inc2).

**85.7 Doctrina + estado**: completar una "fuente única" exige barrer TODOS los consumidores (incluidos componentes globales tipo dock) — una sola copia viva reabre la deriva que el patrón quería matar. Para inyectar un dato derivado en una fn de render PURA reusada por el preview del CMS: param opcional con default seguro, nunca acoplar `data`. En componentes con estado efímero: parchear el atributo, no re-renderizar. EN `Desarrollo` (`f757b25`), pendiente merge de Daniel; sin deploy de reglas (cero cambio de claves). FOLLOW-UP (inc4): legal `terminos.js`/`privacidad.js` (número en prosa) + `home/social.js` (feed IG/FB/TikTok, otro sub-sistema) + `hideWhenEmpty` general + usuarios/SPA P5.
