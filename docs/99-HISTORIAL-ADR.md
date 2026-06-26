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

**83.7 Doctrina + estado**: aplanar un modelo cara-de-revertir es GRATIS antes de que existan datos en prod → el gate externo debe correr en esa ventana (L-54). Reglas: `.size()` topa cardinalidad de listas pero NO recursa en list-of-map (string por-hoja = client-side). EN PROD: P4 core (texto+listas) desplegado+validado 2026-06-19. **Imágenes en `Desarrollo` `b78c3aa`, pendiente merge de Daniel** (storage.rules avif ya desplegado). Sin cache bump (JS hasheado por Vite; HTML network-first).

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

## 2026-06-20 — §86: CMS global inc4 — páginas legales a la fuente única (incl. responsable Ley 1581) [OPUS-4.8]

> Cliente: "continua". Cierra el último frente de contacto horneado: las páginas legales (Términos/Privacidad). Decisión de arquitecto registrada: el contacto del *responsable* (Ley 1581) es la MISMA entidad que el contacto comercial → derivarlo lo mantiene siempre exacto (mejor cumplimiento), alineado con la directriz de Daniel "editar una vez, actualiza en todos lados".

**86.1 Causa/contexto**: tras inc3 (§85) quedaban contactos horneados solo en lo legal: `terminos.js` (pie: mailto + wa.me) y `privacidad.js` (pie mailto + PROSA §02 "Responsable del tratamiento" con email+WhatsApp [exigido por Ley 1581] + §06 "Tus derechos" con email). Dejarlos sería la ÚNICA copia viva → reabriría la deriva (peor: el responsable legal quedaría stale si Daniel cambia el número).

**86.2 Solución estructural**: ambas páginas leen `mergeGlobal(data.getSiteContent('global')).contacto` en `renderAll` (fallback al default = valor real → migración-cero). `terminos`: el pie deriva mailto (`safeUrl('mailto:'+c.email)`) + WhatsApp (`safeUrl(waHref(c.whatsapp))`). `privacidad`: el pie deriva el mailto; la PROSA legal usa tokens `{{EMAIL}}`/`{{WA}}` sustituidos en `renderSection(s,c)` ANTES del `escape` (XSS-safe; el texto legal queda byte-idéntico con el default). Render por `mount()` (helper sancionado de `html.js` — evita `innerHTML` directo, hook de seguridad) + re-pinta una vez al resolver `data.loadSiteContent('global')` (el listener de TOC vive en `main`, sobrevive al re-pintado).

**86.3 No-regresión**: estructura/IDs/anchors del TOC intactos; solo cambian 2 valores de contacto, defaulteados al valor actual → salida idéntica sin override. Resto de la prosa legal sin tocar.

**86.4 Tests/verificación**: build VERDE (3.33s) + preview en vivo (`/terminos.html`: pie → `mailto:info@bersagliojewelry.co` + `wa.me/573013752592`; `/privacidad.html`: §02 responsable, §06 derechos y pie con valores reales, CERO tokens `{{` colgando; cero errores JS de runtime, solo Firestore offline del entorno L-05).

**86.5 Anti-patterns evitados**: dejar la ÚNICA copia viva en lo legal (→ deriva del responsable); `innerHTML` directo (→ `mount()` sancionado, hook); romper prosa legal al derivar (→ tokens pre-escape, byte-idéntico); acoplar compliance a un typo del CMS (mitigado: `safeUrl` + el valor se escapa; mismo riesgo que editar el archivo a mano).

**86.6 Archivos**: MODIFICADOS `js/pages/terminos.js`, `js/pages/privacidad.js` (commit `26bf8f8`). INTACTOS: `js/core/{global-defaults,html,safe-url}.js`, resto de prosa legal. Sin deploy de reglas (cero claves nuevas) ni bump de SW (JS hasheado por Vite).

**86.7 Doctrina + estado**: una "fuente única" NO está completa mientras quede una copia viva — incluido el texto legal (donde una copia stale del responsable es además un riesgo de cumplimiento). Derivar contacto en prosa legal se hace con tokens sustituidos ANTES de escapar, preservando el texto byte-idéntico. EN `Desarrollo` (`26bf8f8`), pendiente merge de Daniel. FOLLOW-UP restante: `home/social.js` (feed IG/FB/TikTok, otro sub-sistema) · `hideWhenEmpty` general · usuarios/SPA P5.

## 2026-06-20 — §87: ACUERDOS R6 — clamp `pagado` por D0 (deuda al pacto) cierra el bug A8 [OPUS-4.8]

> Cliente: "continuemos" (eligió retomar R6, lo más delicado por ser dinero). Cierra el HIGH que dejó R6 en NO-GO desde 2026-06-13 (§81 + re-verif `0d2835b`). **Decisión Fuerte verificada adversarialmente** (red-team 6 ángulos, 0 hallazgos), NO por comité externo (Consejo no invocado; el deploy/encendido es de Daniel y puede sumarlo). **Contexto nuevo (Daniel 2026-06-20): la plataforma se RESETEA a cero en cartera/clientes — Kary recargará desde cero** → el censo de acuerdos ya era 0 y los datos se borran, así que A8 nunca corrompió prod; el fix es para la corrección FUTURA.

**87.1 Causa raíz (RCA, verificada leyendo código)**: el "pagado del plan" (cuánto del cronograma ya está cubierto) se calculaba `pagado = Σcuotas − deudaCubierta`, asumiendo `Σcuotas == deuda-al-pactar (D0)` — no validado. El clamp por `pagadoReal` (`be342aa`) acotaba por la reducción FIFO total, pero ésta INCLUYE abonos PRE-pacto. Repro A8: factura 200k + abono 100k ambos pre-pacto + cuotas Σ200k → CON acuerdo `vencido=0` (mora OCULTA) vs SIN acuerdo `100k`. El abono pre-pacto ya bajó la deuda al pactar; contarlo como "pago del plan" borró una cuota vencida.

**87.2 Solución estructural**: `pagado = max(0, min(deudaAlPacto − deudaCubierta, Σcuotas, pagadoReal))`. `deudaAlPacto` (D0) = **replay FIFO con SOLO los créditos `registradoEn ≤ creadoEn(acuerdo)`** sobre los cargos que ya existían al pactar (regMs ≤ ancla; orden FIFO ya fijado). Así `pagado` = reducción de la deuda cubierta POSTERIOR al pacto = pagos reales hacia el plan (verdad de servidor, infalsificable). Créditos sin `regMs` → tratados pre-pacto (conservador: nunca infla `pagado`/oculta mora). `pagadoReal` se conserva como cota defensiva (§be342aa). Se capturó `creditList` (créditos con su `regMs`) en el loop principal.

**87.3 No-regresión**: byte-idéntico en `js/crm-estado-cuenta.js` + `functions/crm-estado-cuenta.mjs` (test:paridad 4/4). Sin acuerdos → salida idéntica (el código de D0 solo corre con acuerdo). Reglas SIN cambio (no emulador). Acuerdos siguen GATEADOS/inertes en prod (`acuerdosActivos` off).

**87.4 Tests/verificación**: acuerdos 18/18 (incl. test A8 repro + contraste post-pacto) · estado 24/24 · paridad byte 4/4 · insumos 6/6 · generador 6/6 · auditoría 16/16 · saldo 12/12 · build VERDE. **Red-team adversarial** (workflow `we1r6qjqy`, 6 ángulos: timing en frontera · abonos parciales múltiples · FIFO retro-fechado · cuotas infladas+abono · fronteras del clamp · legacy sin regMs) ejecutado contra el código real = **0 hallazgos confirmados**. También corregido el bug del FIXTURE line78 (abonos que pagan el plan deben registrarse POST-pacto; `mov()` por defecto registra pre-pacto).

**87.5 Anti-patterns evitados**: contar abonos pre-pacto como pago del plan (→ D0 server-truth); confiar en `saldoAlPactar` autodeclarado (→ replay FIFO infalsificable); revertir `be342aa` (→ se mantiene como cota); fixture que enmascara el bug (→ corregido + test A8 que falla con el código viejo). Comité degradado=GO falso (L de §82/§81) → esta vez red-team ejecutado de verdad (cada agente corrió `node`).

**87.6 Archivos**: MODIFICADOS `js/crm-estado-cuenta.js`, `functions/crm-estado-cuenta.mjs`, `tests/acuerdos-aging.test.mjs` (commit `55bc8ef`). Deliberación: red-team `we1r6qjqy` (resultado en el transcript del workflow). INTACTO: reglas, corte, UI de acuerdos, generador.

**87.7 Doctrina + estado**: el "pagado" de un plan de cuotas SOLO cuenta pagos POSTERIORES al pacto (reloj de servidor); un abono pre-pacto baja la deuda-al-pactar, no las cuotas. Para verificar dinero cara-de-revertir, el red-team debe EJECUTAR el código (no razonar en abstracto). EN `Desarrollo` (`55bc8ef`), pendiente merge. **R6 técnicamente DESBLOQUEADO**; encender (deploy reglas/functions + `acuerdosActivos=true` + `encender-acuerdos.mjs --aplicar` + prueba en vivo de Daniel) queda para cuando Kary recargue datos — baja urgencia por el reset-a-cero. Pendiente menor: complemento `Σcuotas>saldoAlPactar` en validador/reglas/UI (el formula D0 ya hace inofensivas las cuotas infladas).

## 2026-06-20 — §88: CMS cero-ficción Fase B — gestión de Videos/Redes + puerta dura + UX Kary [OPUS-4.8]

> Cliente: "continua". Cierra la GESTIÓN de TODO-24 (PRIORIDAD #1 Daniel 2026-06-20: index 100% gestionable SIN ficción). Fase A (`4ae6c0f`) mató la ficción viva (home-media borrado + Films/Redes a Firestore con hide-when-empty + journal sin baked); **Fase B da el panel + la puerta + los avisos para Kary**. Spec `docs/superpowers/specs/2026-06-20-cms-cero-ficcion-design.md`; regla `feedback_no_demo_en_index`. **Revisión adversarial 4 agentes** (workflow `wf_bad959b3-1c0`; CRUDO en bóveda `research-archive/2026-06-20-review-cero-ficcion-faseB-CRUDO.json`) → 1 HIGH + 1 MED corregidos antes de cerrar.

**88.1 Causa raíz (verificada leyendo código)**: tras Fase A, `films/`/`socialPosts/` se leían con hide-when-empty pero (a) NO había panel para que Kary los cargara; (b) NO había puerta server-side que impidiera publicar un doc a-medias; (c) el riesgo #1 del comité era la divergencia panel↔home↔reglas (tres "contadores" de "¿se ve?" que podían discrepar). La revisión halló además que el render contaba SOLO por `published` (sin re-chequear completitud) → una entrada legacy de journal publicada-incompleta se pintaría rota (las reglas validan al ESCRIBIR, no re-validan docs viejos), y que `nonEmptyStr` aceptaba solo-espacios (`' '.size()>0`).

**88.2 Solución estructural**:
- **SSoT** `js/core/home-sections.js`: umbrales (MIN_FILMS=3·MIN_SOCIAL=4·MIN_JOURNAL=1·MIN_FEATURED=3·SOCIAL_PLATFORMS) + predicados `isFilmComplete`/`isSocialComplete`/`isJournalComplete` (con `.trim()`). Una sola fuente para home + panel + tarjeta.
- **Panel**: `filmsDescriptor`/`socialDescriptor` (motor `createResourceAdmin`, ~30 líneas c/u) → pestañas "Videos"/"Redes"; tipo de campo nuevo `select` (Red social, placeholder "— Elige —", sin typos que rompan el filtro).
- **PUERTA dura** (firestore.rules): `filmValid`/`socialValid` + endurecido `journalValid`: `published⇒` campos reales no vacíos (film: title+thumb+href · social: thumb+caption+platform∈{Instagram,Facebook,TikTok} · journal: title+image+excerpt). `nonEmptyStr` ahora `v.trim().size()>0` (un espacio NO es contenido). matches `films/{id}`+`socialPosts/{id}` (read público, write editor+validador, delete admin).
- **Defensa en profundidad** (cliente): el render re-aplica la completitud — `completeFilms()`/`completeSocial()` filtran por `isXComplete` antes del umbral, y `entries()` (journal.js) filtra por `isJournalComplete` → un doc legacy publicado-incompleto NUNCA se pinta, sin depender solo de la regla.
- **UX Kary** (resource-admin): columna "¿Se ve en la web?" (`visibilityStatus`/`visibilityCell` puros: Sí se ve / Listo, casi / No se ve todavía + motivo); tarjeta "Estado de tu web" (`estado-web.js`, vivo, +botón "Ver mi web como cliente"); empty-state naranja con guía; confirmación al borrar/despublicar el último que sostiene una sección (`wouldHide`).
- **Gate CI** (no-demo-home): barrera #5 — ningún módulo de `js/home/` exporta un array de items (fuente demo nueva con otro nombre).

**88.3 No-regresión**: `createResourceAdmin` reusado vía descriptor (sin clonar CRUD); IDs/clases/callsites intactos; `journalValid` endurecido NO rompe entradas completas ya publicadas (test de no-regresión verde); `films.js`/`social.js` importan el umbral del SSoT (refactor de salida idéntica). Build Vite verde.

**88.4 Tests/verificación**: reglas **185/185** (emulador Java: films/social happy+incompletos+hasOnly+lectura/borrado + 3 nuevos de "solo-espacios" + gate journal) · puros **36** (resource-admin 16: select + visibilityStatus/visibilityCell escapado; no-demo 4: barrera #5) · build Vite ✓. Revisión adversarial 4 ag. ejecutada contra el código real.

**88.5 Anti-patterns evitados**: duplicar umbrales (→ SSoT única); confiar solo en la regla en el render (→ defensa en profundidad); `nonEmptyStr` sin trim (→ blanco-visual publicable, cerrado); render() arbitrario en columnas (→ tipo declarativo `visible` por mount()+esc()+safeUrl); `select` que vacía en silencio un valor legacy (→ se conserva inyectando opción); listener de la tarjeta sin teardown (→ `destroy()` en `pagehide`); toasts/botones con género fijo ("Nueva video") → neutros ("Añadir", "Se guardó").

**88.6 Archivos**: NUEVOS `js/core/home-sections.js`, `js/admin/estado-web.js`. MODIFICADOS `js/home/films.js`·`social.js`, `js/data/journal.js`, `js/admin/{resource-admin,resource-admin-core,contenido-tabs,contenido}.js`, `admin-contenido.html`, `firestore.rules`, `public/sw.js` (v17→v18), `tests/{firestore-rules,resource-admin,no-demo-home}.test.mjs`. INTACTOS: `piece-card`, CRM, otros singletons, pieces/collections. Deliberación: review `wf_bad959b3-1c0` (CRUDO en bóveda).

**88.7 Doctrina + estado**: cero-ficción por **defensa en profundidad** (la regla impide ESCRIBIR ficción; el render re-valida para no pintar la legacy) · **SSoT** que sincroniza panel↔home↔reglas · `.get(k,'')` (idiom S6) y `.trim()` en reglas · comité decide / Claude ejecuta+verifica (red-team de la única frontera server-side). **cache bump v18→v19** (§4).

**88.8 Adenda 2026-06-20 (href + DEPLOY)**: Daniel resolvió el pendiente de diseño → **`href` OBLIGATORIO al publicar en Redes** (cada tarjeta enlaza al post real; sin enlace = tarjeta muerta). Aplicado en las 3 capas en el MISMO commit `8abaab4`: `socialValid` (`published⇒href` no vacío), `isSocialComplete` (espejo), descriptor `required:true`; SW v19; rules 186 + puros 21 + build verdes. **DEPLOY HECHO**: censo prod previo (journal/films/socialPosts `published==true` = **0 docs** → sin lockout legacy) → `firebase deploy --only firestore:rules` (cuenta `bersagliojewelry@gmail.com`, proyecto `bersaglio-jewelry`) → "released rules to cloud.firestore" → **verificado en vivo** (`firebase_get_security_rules`: filmValid/socialValid/match films+socialPosts/`href` gate/`.trim()` presentes). Fase B (v18) ya en prod (PR #272). **Resta solo**: Daniel mergea `Desarrollo→main` el cliente (form `required` + SW) — las reglas y la web v18 ya están en prod; socialPosts vacía hasta que Kary cargue, así que la regla por delante del form no afecta a nadie en el ínterin.

**88.9 Adenda 2026-06-20 (Destacadas — último hueco del index)**: censo de prod reveló catálogo **vacío** (0 piezas / 0 colecciones) → el index EN VIVO mostraba el placeholder *"El atelier está afilando la próxima curaduría"* en Destacadas (única sección no conforme; Categorías ya ocultaba bien y `cardsFrom` no tiene fallback demo — se corrigió el comentario stale). `featured.js` ahora aplica `MIN_FEATURED` (decisión Daniel "con mínimo: 3 destacadas") y se OCULTA bajo el umbral SIN placeholder (espejo de Films/Redes; `featuredInner()` → '' ). Gate `no-demo-home` para Destacadas (umbral + sin placeholder). SW v19→v20. `a566dc5`; no-demo 5/5 + build verdes. Cliente pendiente de merge (la web sale con el próximo PR de Daniel). Cobertura cero-ficción del index: Hero/Marquee/Editorial/Atelier/CTA always-on; Destacadas/Categorías/Films/Redes/Journal hide-when-empty. **Índice 100% cero-ficción cerrado.**

## 2026-06-21 — §89: BUG — Categorías no aparecía al crear la 1ª colección (la sección no se creaba en vivo) [OPUS-4.8]

> Cliente (probando el panel): "creé una colección de prueba, la destaqué en el home y no apareció ni en tiempo real ni recargando". Bug real en el render dinámico del home, expuesto por el estado fresco (0 colecciones) tras el reset.

**89.1 Causa raíz (verificada leyendo el código + reproducida en navegador)**: `refreshCategories()` solo sabía ACTUALIZAR una sección ya presente (`sec = querySelector('.home-cats'); if (!dock) return`). Pero `renderCategories()` devolvía `''` cuando no había colecciones — y el PRIMER PAINT del home SIEMPRE ocurre sin datos (`data.load()` es async, no bloquea el paint) → la sección `.home-cats` nunca entraba al DOM. Cuando la colección llegaba (en vivo por `data.onChange`, o tras recargar) `refreshCategories` no encontraba la sección (`sec=null`) y se rendía con un comentario erróneo ("aparecerá al recargar" — falso, porque al recargar el paint también es sin datos). El bug estaba latente desde que Categorías pasó a cero-ficción (B3: `cardsFrom` dejó de devolver el fallback baked); solo se manifestó al partir de 0 colecciones (test de Daniel = crear la 1ª).

**89.2 Solución estructural**: alinear `categories.js` al patrón de las otras 4 dinámicas (films/social/journal/featured): `renderCategories()` SIEMPRE devuelve `<section class="home-cats">${categoriesInner()}</section>` (envoltorio presente aunque el inner sea ''), y `refreshCategories()` hace `mount(sec, categoriesInner())` sobre el contenedor que ya existe → una colección nueva aparece sin recargar. Además, CSS `:empty` colapsa las secciones dinámicas vacías a 0px (`.home-cats/featured/films/social/journal:empty { padding: 0 }`) — antes una sección vacía dejaba 92px de hueco (46px×2 de padding); con el fix de §88.9 + esta sección siempre montada, sin la regla `:empty` quedarían huecos en el index fresco. Espejo de la directriz de la spec: "reservar 0px, no altura fija".

**89.3 No-regresión**: `cardsFrom`/`tile`/`countByCollection` intactos; el contrato del dock no cambia; las otras 4 dinámicas ya tenían el patrón correcto (no se tocan). Build verde.

**89.4 Tests/verificación**: `no-demo-home` 6/6 (gate nuevo: `renderCategories` envuelve SIEMPRE en `<section>` + `refresh` hace `mount`). **Verificado en navegador** (preview dev): `.home-cats` SIEMPRE en el DOM (antes ausente); vacía → `:empty` colapsa a `padding 0px`; inyectada una colección + `refreshCategories()` → aparece la tarjeta "ANILLOS / Próximamente" EN VIVO y el padding vuelve a 46px; consola sin errores (solo el ruido esperado de Firestore offline en dev).

**89.5 Anti-patterns evitados**: una función `refresh` que solo actualiza pero no puede CREAR su nodo (acopla la visibilidad al estado del primer paint); comentario que afirma un comportamiento no verificado ("aparecerá al recargar"); skeleton de altura fija para sección vacía (→ 0px por `:empty`, anti-CLS).

**89.6 Archivos**: MODIFICADOS `js/home/categories.js`, `css/home.css`, `public/sw.js` (v20→v21), `tests/no-demo-home.test.mjs`. `6b327a0`. INTACTOS: las otras secciones del home, `categories-data.js`. Cliente pendiente de merge (la web sale con el próximo PR de Daniel).

**89.7 Doctrina (→ L-42)**: una sección DINÁMICA que se rellena por listener DEBE montar SIEMPRE su `<section>` envoltorio en el render inicial (vacío si no hay datos) y que el `refresh` rellene ese contenedor; si el render devuelve '' sin datos, el refresh no puede crear la sección y el contenido nunca aparece (el primer paint es sin datos). El colapso visual de la sección vacía se hace por CSS (`:empty`), no omitiendo el nodo.

## 2026-06-21 — §90: Capacidad CAZA-BUGS (TODO-25) — reflejo del camino vivo + escalada calibrada + gate del estado-cero [OPUS-4.8]

> Directiva de Daniel (2026-06-21, tras §89): *"que no se te escapen bugs así; verifica de punta a punta lo que tocas, y para lo grande usa la maquinaria pesada — pero no gastes de más en lo trivial"*. Esta capacidad se diseñó con un **panel adversarial de 9 agentes** (4 lentes de diseño → 4 críticos → 1 síntesis) que RECORTÓ la sobre-ingeniería; alcance elegido por Daniel = "Completo".

**90.1 Causa raíz (verificada)**: §89 NO se escapó por falta de maquinaria pesada — se escapó por un hueco de PROCESO barato: estuve EN `js/home/categories.js` con `§3.3` ("verifica, no asumas") VIGENTE y aun así lo di por bueno mirándolo con UNA sola lente (cero-ficción, L-41), sin recorrer el camino vivo del usuario desde **estado-cero** (*"creo la 1ª categoría, ¿aparece?"*). Las doctrinas actuales no cierran ese hueco: `§3.3` exige citar evidencia al **afirmar** (epistémico), `§3.4 IAP` lista archivos/tests al **planear** (estático sobre el diff), `§3.7` auto-crítica es una pasada **interna** de razonamiento. Ninguna obliga a **EJECUTAR/recorrer** el comportamiento observable del subsistema rozado partiendo de 0 ítems — que es exactamente donde vivía el bug (el primer paint siempre es async-vacío).

**90.2 Solución estructural (NETO-NUEVO sobre el cerebro, calibrada)**:
- **(a) Reflejo barato siempre-on**: al TOCAR o ROZAR un subsistema con estado observable (render/`onSnapshot`/CRUD/flujo), recorrer su camino END-TO-END desde el estado-cero — las **2 fronteras** vacío→1 (crear 1er ítem, ¿aparece en vivo Y tras recarga dura?) y N→vacío (borrar el último, ¿colapsa limpio?) — antes de darlo por bueno, no solo el diff. *"Rozar"* = mi diff cambia una entrada/salida/contrato **O el estado compartido** (doc Firestore, sessionStorage, caché SW) que otro subsistema lee, aunque no edite su archivo. NO dispara en refactor puro / copy / color / edición mecánica. Aterriza como **W-10** (`60-WORKFLOWS`) y, en su versión always-on cross-repo, en la `§G` (la origina cars, ver 90.8).
- **(b) Escalada calibrada (2 niveles + freno ortogonal, NO una escalera de 6)**: N0 reflejo barato (default, ~90%); N1 maquinaria pesada SOLO si no-trivial/caro de revertir → enruta a `systematic-debugging` → W-06 → §3.7/W-07/Consejo §15, **citando a sus dueños SSoT, sin redefinir criterios**. Freno: 2 fallos = Trigger Error §G.2.
- **(c) Skill portátil `caza-bugs`** (`~/.claude/skills/`, llega a los 4 repos por el dir de usuario): el MÉTODO general (camino vivo + cuándo escalar), deliberadamente corta.
- **(d) Gate mecanizable del estado-cero (la pieza estrella)**: el reflejo es [HONOR]; el ÚNICO cierre determinista es un test. Se **generalizó** el invariante L-42 (antes solo cubría `categories.js`) a las **5 secciones dinámicas del home** (categories/films/social/journal/featured): `renderX()` con 0 ítems DEBE emitir la `<section>` que `refreshX()` puede poblar. Así un futuro §89 en films/redes/journal también revienta el build.

**90.3 No-regresión**: doctrinas existentes INTACTAS — `§3.3`/`§3.4`/`§3.7`/`§G.2` se CITAN, no se reescriben (SSoT; el criterio "cuándo comité" sigue siendo dueño §3.7; "2 fallos = STOP" sigue siendo §G.2). **CLAUDE.md gana 0 líneas** (ya sobre cap de chars; el reflejo always-on lo origina cars en `§G`, L-31). Las 5 secciones del home no se tocan (ya cumplían L-42). El test generalizado solo lee fuentes y regex-matchea (sin runtime). Build verde.

**90.4 Tests / verificación**: panel adversarial 9 agentes (diseño 4 lentes + 4 críticos de redundancia/sobre-ingeniería/admisión/cobertura + síntesis); crudo archivado. Verificación de los 5 módulos del home (todos siguen el patrón L-42 — confirmado leyendo cada archivo, reflejo CAZA-BUGS aplicado a sí mismo). Gate `no-demo-home` generalizado: la regla L-42 se asserta para las 5 secciones → **10/10 verde** (`node --test tests/no-demo-home.test.mjs`) + `npm run build` verde. **El gate se verificó por EJECUCIÓN, no por razonamiento** (la lección de §89): se inyectó el bug §89 en `categories.js` → el test se puso ROJO solo en esa sección (los otros 4 siguieron verdes) → restaurado con git → 10/10 de nuevo. *(Dos harness improvisados de `node -e` se corrompieron por el escape del shell y dieron falsos negativos — confirmación de que "trazar/improvisar" no basta: el gate real, no el atajo.)*

**90.5 Anti-patterns evitados (recortes del panel, transparencia)**: NO se creó un bloque `§3.8` en CLAUDE.md (cap + re-decía §3.3/§3.7); NO una escalera de 6 escalones ni el clasificador D/R/E/V/M (duplicaban §3.7/§G.2/W-01..09); skill recortada a método (no re-implementa la escalera ni IAP); M-05 a 2 líneas (la causa técnica ya vive en L-42); **NO se acopló el shard 30→31 a este commit** (mezcla tipos §2 + op riesgosa → TODO-27); corregido un error factual del diseño ("el circuit-breaker es mecanizable" = FALSO, verificado en `scripts/brain-check.mjs`: no hay contador de fallos → toda la escalada es [HONOR], el único gate real es el test estado-cero).

**90.6 Archivos**: NUEVO `~/.claude/skills/caza-bugs/SKILL.md` (global) · MODIFICADOS `docs/30-LECCIONES.md` (M-05) · `docs/60-WORKFLOWS.md` (W-10) · `docs/skills-inventory.md` (catálogo) · `docs/99-HISTORIAL-ADR.md`/`docs/00-INDICE.md` (este ADR) · `docs/10-MEMORIA-CORTO-PLAZO.md` (TODO-25 ✅ · TODO-26 handoff · TODO-27 shard) · `docs/05-ESTADO-GLOBAL.md` (flag cap 30) · `tests/no-demo-home.test.mjs` (gate L-42 generalizado a 5 secciones). INTACTOS: las 5 secciones del home, `CLAUDE.md`, el kernel `brain-check`. **Sin cache bump** (no cambia el shell del SW; el test no se sirve).

**90.7 Doctrina aplicada**: §3.6 (arquitecto: el proceso CORRECTO para cada caso, no más proceso) + §3.7 (auto-crítica + comité por iniciativa, anunciado) + Regla de ADMISIÓN (lo [HONOR] se declara, no se finge gate) + L-28 (el panel SIMPLIFICÓ: menos máquina) + L-31 (cars = escritor único de la `§G` cross-repo). → M-05, L-42, W-10, skill `caza-bugs`.

**90.8 Handoff a cars-operador (`§G` cross-repo — L-31, bersaglio NO la escribe)**: cars añade a la `§G.4` (byte-idéntica en los 4 cerebros), contiguo al Reflejo de Captura/Cierre, este texto **tal cual**:
> *"- **Reflejo de Caza-bugs (verificar el camino vivo, no solo el diff)**: al TOCAR o ROZAR un subsistema con estado observable por el usuario (render / listener / CRUD / flujo), recorre su comportamiento END-TO-END antes de cerrar, en especial las dos fronteras del estado-cero (crear el 1er ítem y verlo aparecer en vivo Y al recargar; borrar el último y ver colapsar limpio). 'Rozar' = mi diff cambia una entrada/salida/contrato O el estado compartido que otro subsistema lee, aunque no edite su archivo. Escala a maquinaria pesada SOLO si es no-trivial/caro de revertir; NUNCA en lo trivial (§3.7). Capacidad portátil: skill `caza-bugs`. [HONOR] (no hay gate de linter; honor como el resto de §G.4)."*

Gate opcional para el kernel (lo decide cars): un check trivial "toda L-NN cuyo ADR toca una sección dinámica (render+refresh) enlaza un test en `tests/`" — mecaniza "si capturaste la lección, ¿la blindaste con test?" sin fingir verificar el camino. Procedimiento de propagación = el de TODO-22 (escribir una vez + `brain:check` ×4 ANTES de commitear, blast-radius ×4). Dependencia de orden: la skill `caza-bugs` ya existe (bersaglio la creó). Registrado como **TODO-26** (aporte de bersaglio a la pasada Gemini única; cars consolida).

## 2026-06-21 — §91: Consejo Externo — corrección factual "el modelo externo (vía Antigravity) SÍ ve el código" + skill comité [OPUS-4.8]

> Propagación cross-repo desde **cars §224** (decisión + deliberación de 7 agentes allá). El dueño aclaró: el consejo externo es Gemini **vía Antigravity** (IDE agéntico con acceso LOCAL al repo, como Claude Code) → lee el código/cerebro reales, **solo-lectura**.

- **.1 Causa**: `docs/15` (L61/L125/L158) + la skill global `comite-expertos` (Paso 5) afirmaban "el modelo externo no ve el código → alucina → solo juicio". FALSO con Antigravity. Esa creencia falsa encadenó la herramienta a "opinador abstracto" → causa estructural del sub-uso.
- **.2 Fix (TIER MÍNIMO)**: corregidas las 3 frases de `docs/15` (fraseo **provider-aware**: el activo §0=Antigravity ve el código; un chat sin acceso no) + skill `comite-expertos` Paso 5, propagada **byte-idéntica ×4** (sha `48a5e2f6`). Preservado el límite VERDADERO: **NUNCA edita/implementa/commitea** + insumo-no-oráculo + no-memoria-entre-sesiones.
- **.3 No-regresión / archivos**: el error nunca fue "no edita" — fue confundir "no edita" con "no ve"; el límite solo-lectura queda palabra por palabra. `§G`/kernel INTACTOS. Sin cache bump (documental). MOD: `docs/15-CONSEJO-EXTERNO.md`, `skills/comite-expertos/SKILL.md`, `docs/00`/`docs/99`.
- **.4 Doctrina + SIGUIENTE**: §3.3 (no propagar un hecho FALSO) · Reflejo de Desafío Crítico (§15.6 "protocolo sin uso → revisarlo"). **TIER COMPLETO** (ampliar triggers a seguridad/dinero/arquitectura, con patrón "comité primero → Gemini al final") = decisión del dueño, gated por pase Gemini → detalle + matriz en cars §224 + bóveda `../brain-private/altorracars/2026-06-21-consejo-externo-cobertura-SINTESIS.md`.

## 2026-06-22 — §92: Guardián del índice (cars TODO-32) evaluado y N/A aquí — headers fecha-leading; el check #3 ya vigila el drift [OPUS-4.8]

> Evaluación de la propagación cross-repo del guardián `brain-index.mjs` de **cars (TODO-32 / §229)**. Decisión: **NO instalarlo aquí** — sería código muerto. Se registra como callejón probado (no fingir cobertura sin hacer nada).

- **.1 Hallazgo (verificado)**: el guardián RECONCILIA la columna §→línea del `00` parseando headers numéricos `## NN.`. bersaglio usa headers **fecha-leading** (`## 2026-… — §N:`) y los ADRs viejos ni siquiera llevan `§N` en el header → un copy byte-idéntico parsea **0 ADRs, reconcilia 0**, sale 0 y *parecería instalado* sin hacer nada (falsa cobertura — fingir trabajo hecho).
- **.2 Decisión**: NO se instala `brain-index.mjs` ni se toca `kernelFiles`/`package.json`. El drift de offsets del índice (real — bersaglio SÍ usa nº de línea) lo **detecta el check #3 de `brain-check`** (read-only, ya vigente) y se corrige a mano como hasta ahora. PRE-REQUISITO para que el guardián aplique algún día: **normalizar headers** (que TODOS lleven `§N` mecánico) — tarea aparte, no urgente.
- **.3 Tombstones (convención disponible, manual)**: `> ⛔ REEMPLAZADO POR §M` bajo un ADR superado = NO lo apliques, ve a §M. Aquí es convención **manual** (el validador vive en el guardián, que no está instalado); útil igual como aviso humano. Sin casos aún.
- **.4 No-regresión / doctrina**: kernel (`brain-check`/`brain-diff`) y `§G` INTACTOS. Sin cache bump (documental). §3.3 (verificar antes de afirmar) + §G.4 "No silent caps". Decisión completa + matriz de compatibilidad ×4 cerebros → **cars §229**.
- **.5 Doctrina §228 — lo único que SÍ aplica sin el guardián**: principio "el índice es on-demand → NO se comprime con pérdida; si crece, ratchet ↑ el cap (§173)". Cap de `00` elevado **16k→24k chars** (ya estaba sobre-cap antes de §92; un índice on-demand casi no cuesta contexto de boot). El check #3 de `brain-check` seguirá detectando el drift de offsets, que se corrige a mano.

## 2026-06-22 — §93: Sprint perf + UX móvil — `.bj-lite` por capacidad · carga fluida del index · fix del flash data-dependiente · scroll/header/responsive [OPUS-4.8]

> Daniel reportó la web "freezada/feezada" en MÓVIL de gama baja (en su PC de alta gama no se notaba), flashes de carga (contenido equivocado/vacío antes de Firebase) y varios bugs móvil. **Comité ×3 BLINDADO + consejo externo Gemini** (2 deliberaciones, ver bóveda). TODO mergeado a `main` (PRs #289-292; verif. `git fetch` 2026-06-22). Detalle técnico vivo → `45-PERFORMANCE` PERF-04/05.

- **.1 Causa raíz (verificada en código)**: (a) **GPU móvil saturada** — `backdrop-filter: blur(46px)` del header FIJO se re-rasteriza POR CUADRO al scroll (×DPR²) + la aurora animada (`blur(60px)`+scale, infinita) DEBAJO del header invalida su caché → re-blur cada cuadro aun en reposo (throttling térmico = el "freeze" que empeora a los segundos); blobs hero + dock animados sin parar. (b) **Flash**: páginas client-rendered pintaban el estado por defecto/vacío/equivocado ANTES de que llegara Firestore (catálogo "Todas las piezas"+"no hay piezas" falso; pieza "no encontrada" al timeout de 4s; journal "en preparación"; lista-deseos "Pieza retirada" por cada favorito). (c) `history.scrollRestoration='auto'` saltaba a media página al recargar en página client-rendered de alto variable. (d) bugs móvil: franja blanca abajo (fondo fijo `inset:0` no cubre el viewport iOS al ocultarse la barra), exceso de espacio hero↔header, touch del dock fallaba (umbral de arrastre 4px < temblor del dedo).
- **.2 Solución estructural**: **`.bj-lite` por CAPACIDAD** (`boot.js §C3`: `deviceMemory≤4`/`saveData`/`coarse`/`≤920`/RM → `<html class=bj-lite>`, defensivo; cubre el portátil débil que un media-query por ancho no atrapa) baja header blur 46→16, detiene aurora/blobs/dock en equipos modestos; **equipos capaces 100% IDÉNTICOS**. **Carga fluida = RESERVAR el alto, NO skeleton** (tesis del comité; skeleton se ve barato + re-introduce GPU): `js/core/section-reserve.js` (localStorage, alto de la última carga) + `data.isReady(sección)` (datos REALES, no `_loaded`) + watchdog 8s + 3 estados (cargando=reserva / datos=fade-in / vacío=colapsa silencioso). **Flash**: readiness real por sección en catálogo/pieza/journal/lista-deseos (`entrada.js` ya era el patrón correcto). **Cupo 6 colecciones en el inicio + "ver todas" + centradas si <6** (decisión Daniel). `scrollRestoration='manual'`. **Header auto-oculto** al bajar / visible al subir + iconos a la derecha en móvil. **3 bugs móvil**: `.bj-world height:100lvh`; hero `padding-top` 110→84px; dock umbral táctil 4→12px.
- **.3 No-regresión**: equipos capaces y pantallas grandes = diseño BYTE-idéntico (todo gated por `.bj-lite`/readiness real); IDs/clases/endpoints INTACTOS (§3.2); **sin bump SW** (CSS Vite-hasheado + HTML network-first + critical-CSS inline NO tocado); auditoría responsive = 5 páginas × móvil/tablet **sin scroll horizontal**.
- **.4 Tests / verificación**: build verde por commit; preview headless verificó lo medible (`scrollRestoration='manual'`+scrollY=0; `.bj-world` cubre el viewport; hero 84px; header auto-hide oculta-al-bajar/muestra-al-subir; reglas `.bj-lite` con ambos prefijos backdrop en `dist`; cero scroll horizontal). Sandbox SIN Firestore → el camino CON datos lo validó **Daniel en dispositivo real** ("más rápido, invisible"). Gemini cazó un bug que yo simplifiqué (`isReady` fiándose del timeout de 4s → colapso-y-reexpansión en red lenta) → corregido con readiness real + watchdog.
- **.5 Anti-patterns evitados (§3)**: skeleton/shimmer above-the-fold (barato + GPU) → reserva muda; NO reservar a ciegas en 1ª visita (§3.4, evita salto-inverso); NO animar `height`; error de red en index = **silencio total** (cero-ficción, jamás cartel de sistema); `.bj-lite`/RM = swap directo 0ms (cero costo GPU); workflow de auditoría sin tope se desbocó (2h30/4.7M tok, DETENIDO) → comité BLINDADO (sin herramientas/explorar + tope) corrió 15 min OK (`[[feedback_workflows_acotados]]`).
- **.6 Archivos**: JS — `boot.js`, `core/data.js`, `core/section-reserve.js` (NUEVO), `pages/home.js`(vía secciones), `home/categories.js`, `home/featured.js`, `pages/catalogo.js`, `pages/pieza.js`, `pages/journal.js`, `pages/lista-deseos.js`, `pages/entrada.js`, `components/header.js`, `components/quick-dock.js`. CSS — `liquid-glass.css`, `components.css`, `home.css`, `pieza.css`. Cerebro — `45` PERF-04/05, `10`, `30`(lección via 45). INTACTOS: kernel, `§G`, schema/rules.
- **.7 Doctrina + deliberación**: §3.1 (nunca blur en listas de N / animar solo transform-opacity) · §3.7 (comité ×3 por iniciativa) · §G.2 (Decisión → consejo externo Gemini, read-only). Deliberaciones CRUDO+SÍNTESIS → bóveda `../brain-private/bersaglio/2026-06-21-perf-fluidez-movil-comite-v4.md` + `2026-06-21-carga-fluida-index-comite-v3.md`. **PENDIENTE de la fase** (no bloqueante): fuentes (quitar pesos no usados, invisible) · **arranque C1** (pre-render/state-injection del above-the-fold = el "remate" de Gemini para la 1ª visita; estructural) · TODO-28 **F2-CRM colas mudas** + **F5** borrado-colección-bloquea-si-piezas · responsive fino device-driven.

## 2026-06-22 — §94: Fuentes — Google Fonts a sintaxis de rango (fuente variable) [OPUS-4.8]

> Cierra el pendiente "fuentes" de la fase perf (§93.7 / PERF-04/05). Sin reporte del cliente: optimización invisible por iniciativa propia (paso 2 del plan post-§93). Commit código `f926eca`.

- **.1 Causa raíz (verificada con curl + `document.fonts`)**: el `<link>` de Google Fonts (idéntico en 24 HTML) pedía las 4 familias como **listas de pesos discretas** (`Manrope:wght@300;400;500;600;700`, `Cormorant:…0,300;0,400;0,500;0,600;1,300;1,400`, etc.). Con lista discreta, la API css2 de Google sirve **un archivo estático por peso×subset** → 72 `@font-face` / 28 KB de CSS / ~14 woff2 descargados (subset latin). Manrope y Cormorant Garamond SON fuentes variables, pero la sintaxis discreta impedía aprovecharlo.
- **.2 Solución estructural**: reescribir cada eje a **sintaxis de rango** (`..`) para que Google sirva UNA fuente variable por familia: `Fraunces…400..500` · `Cormorant…0,300..600;1,300..400` · `Manrope…300..700` · Space Mono `400;700` intacto (no es VF). Resultado medido en navegador: **25 `@font-face` / 10 KB / ~6 woff2** (Cormorant 6→2, Manrope 5→1; Fraunces y Space Mono igual). Cobertura de pesos **IDÉNTICA** (mismos 300–700 disponibles), entregada como VF.
- **.3 No-regresión**: **cero cambio visual** — el VF cubre exactamente los mismos pesos que las estáticas (incl. `font-weight:200` que ya caía a 300 antes y sigue igual). IDs/clases/roles `--font-brand/display/ui/mono` INTACTOS (§3.2). **Sin bump SW**: Google Fonts es cross-origin → el SW hace pass-through (`sw.js:51`, nunca cachea); HTML network-first (mismo criterio §93). `.handoff/` y `skills/` NO tocados.
- **.4 Tests / verificación**: build Vite verde (3.85s). Verificación en navegador (preview headless, fuentes son `<link>` estático → SÍ medible pese a L-05): `document.fonts` reportó 25 faces con pesos en RANGO (`Manrope 300 700`, `Cormorant 300 600` + `300 400 italic`, `Fraunces 400 500`); las 6 del subset latin `[loaded]` 200 OK, ningún 404; heading de muestra resuelve `"Cormorant Garamond" weight 300` → render correcto. `curl` con UA Chrome confirmó el conteo 72→25 antes de editar.
- **.5 Anti-patterns evitados (§3)**: NO el análisis riesgoso peso-por-peso×familia con herencia de cascada (150 reglas `font-weight` → alta probabilidad de quitar un peso usado = fallback feo; el cliente exige "look idéntico"); en su lugar, el cambio de entrega VF mantiene TODOS los pesos → cero riesgo, mayor ahorro. NO estrechar rangos a los extremos (ganancia marginal una vez es VF, riesgo innecesario). NO tocar el handoff. Verificar ANTES de afirmar (§3.3): curl + document.fonts, no asumido.
- **.6 Archivos**: 24 HTML del sitio (12 públicos: index/colecciones/pieza/nosotros/contacto/carrito/journal/lista-deseos/entrada/gracias/terminos/privacidad + 12 admin) — 1 línea c/u (la URL del `<link>`). INTACTOS: `.handoff/BERSAGLIO NOVO/project/bersaglio.html`, todo `css/`/`js/`, `public/sw.js`, `Bersaglio Jewelry Design System/`. Cerebro — `99` (este §94), `00`, `45` PERF-06, `30` L-43, `10`, `05`.
- **.7 Doctrina aplicada**: §3.1 (performance), §3.3 (evidencia antes de afirmar: curl + navegador), §3.4 (IAP previo: A-E), §2 (commit código vs cerebro separados). Sin deliberación cara (cambio mecánico de bajo riesgo, no Decisión Fuerte → §3.7 no aplica). **Restan de la fase**: arranque C1 (estructural) · F2-CRM colas mudas · F5 borrado-colección · responsive fino.

## 2026-06-22 — §95: Admin — bloquear borrado de colección con piezas asociadas (F5/TODO-28) [OPUS-4.8]

> Decisión del comité+consejo (F5, ya tomada) ejecutada: el borrado de una colección con piezas dejaba piezas HUÉRFANAS. Paso 4 del plan post-§93 (F5 antes que F2-CRM por no tocar dinero). Código `2de1397`.

- **.1 Causa raíz (verificada en `js/admin/colecciones.js`)**: `handleDelete` borraba tras un simple confirm ("las piezas asociadas no serán eliminadas") SIN chequear si había piezas. Una pieza referencia su colección por `p.collection` (= id, a veces slug); al borrar la colección esas piezas quedan huérfanas → en el sitio público apuntan a una colección inexistente (filtros/enlaces rotos). Bug latente adicional: `getPieceCount(id)` compara solo por `id`, mientras `renderTable` usa `slug || id` → subcontaría piezas referenciadas por slug.
- **.2 Solución estructural**: guard de integridad referencial en la UI (las reglas Firestore no pueden contar docs de otra colección eficientemente). `countPiecesIn(col)` = conteo DEFENSIVO (`p.collection === col.slug || col.id`). En `handleDelete`: `pCount>0` → bloquea con toast danger explicativo ("tiene N piezas, reasígnalas o elimínalas primero"), NO borra; `pCount===0` → confirm + `deleteCollection`. Pista UX: botón de borrar atenuado (opacity .4) + title explicativo cuando hay piezas.
- **.3 No-regresión**: borrar colección VACÍA sigue igual; IDs/funciones (`deleteCollection`, `getPieceCount`, `handleSave`) INTACTOS (§3.2); `firestore.rules` INTACTAS (`allow delete: if isAdmin()` — guard de cardinalidad = cliente, no reglas). Sin bump SW (JS Vite-hasheado).
- **.4 Tests/verificación**: build verde. Camino vivo razonado (caza-bugs estado-cero): col 0 piezas→borrable; +1 pieza→bloqueada; −esa pieza→borrable de nuevo (recálculo en cada click + `adminDb.on('pieces')` re-render). Admin NO ejercitable headless (`requireAuth('editor')` + Firestore ausente, L-05) → smoke funcional = Kary post-deploy, no bloqueante (Claude experto verifica la lógica, [[feedback_claude_experto_verifica]]).
- **.5 Anti-patterns evitados (§3)**: NO usar `getPieceCount` (solo-id) para el guard = habría permitido borrados huérfanos por slug → conteo defensivo. NO intentar el guard en reglas (contar cross-colección es ineficiente/imposible). NO `disabled` en el botón (perdería el feedback del click) → atenuado + click→toast. Borrado destructivo sin red de integridad = anti-patrón corregido.
- **.6 Archivos**: `js/admin/colecciones.js` (`handleDelete` reescrito + `countPiecesIn` nuevo + title del botón en `renderTable`). INTACTOS: `firestore.rules`, `adminDb`/`db.js`, `piezas.js`, resto del admin. Cerebro — `99` (este §95), `00`, `10`.
- **.7 Doctrina aplicada**: §3.4 (IAP A-E), §3.6 (integridad referencial = sistema completo: una colección borrada rompe el catálogo público), §G.4 caza-bugs (estado-cero), §3.3 (verificado en código). Decisión F5 = comité+consejo previo (bóveda perf, ya capturada). **Lección reusable** (borrar entidad padre debe bloquearse si hay hijos que la referencian; conteo defensivo de la FK lógica) capturada aquí; extraer a `30` cuando el shard TODO-27 libere cap (hoy `30` al tope). **Restan de la fase**: arranque C1 (decisión de Daniel) · F2-CRM colas mudas (dinero, verif. experta).

## 2026-06-22 — §96: Cerebro — shard `30-LECCIONES` → `31-LECCIONES-FIRESTORE` (TODO-27) [OPUS-4.8]

> Mantenimiento del cerebro pedido por Daniel (antes de F2). `30` rozando el tope de chars (deuda H-17/§82). Neurogénesis de neurona hija + **descubrimiento del acoplamiento del kernel**.

- **.1 Causa raíz**: `30-LECCIONES` sobre cap de chars (43982c/40000) — el bloque Firestore/CF/reglas (lecciones densas, con su detalle ya en los ADRs) lo inflaba.
- **.2 Solución (shard índice↔detalle, análogo a 00↔99)**: creada `docs/31-LECCIONES-FIRESTORE.md` (hija de `30`) con el DETALLE de 11 lecciones backend (L-12/13/14/16/17/29/34/35/36/37/38); en `30` cada una queda como **stub de 1 línea** (header `### L-NN` + título + puntero a `31`). `30`: 43982c→32600c. Neurogénesis completa (§G.5): fila CLAUDE.md §0 + tabla caps §G.5 + mapa `00` + `caps` del manifest + puntero madre→hija en `30` + bitácora `10`.
- **.3 No-regresión (descubrimiento del kernel)**: `brain-check.mjs` lee las definiciones `### L-NN` SOLO de `30` (línea 220); `referenced` barre todo el cerebro MENOS las hijas → mover una lección entera (las 11 se citan en `99`) la dejaría COLGANTE. Por eso el **stub-header permanece en `30`** (defined lo cuenta; `refs L-/M- 48/48 resuelven` ✅). Soporte multi-archivo real (defined sobre `3*-LECCIONES*.md`) = cambio de KERNEL → cars-operador (L-31), NO unilateral. Capturado en **M-06**.
- **.4 Verificación**: `brain:check` SANO — `30` 32600c ✅, `31` 14316c/16000 ✅, refs 48/48 resuelven, 18 docs alcanzables (incl. `31`), manifest JSON válido.
- **.5 Anti-patterns evitados**: NO mover lecciones enteras (rompería el linter); NO tocar el kernel (escritor único cars-operador, §3.3/L-31); NO subir el char-cap de `30` para evadir el trabajo (§G.5).
- **.6 Archivos**: NUEVO `docs/31-LECCIONES-FIRESTORE.md`. Cerebro — `30` (11 stubs + nota madre→hija + M-06), `CLAUDE.md` (§0 + §G.5), `00` (mapa + fila §96), `.brain-manifest.json` (caps), `10`, este §96.
- **.7 Doctrina**: §G.5 (sharding por saturación), §G.4 (neurogénesis con conexión completa, nada huérfano), §3.3 (verificado el kernel ANTES de mover), §3.6 (no romper la red compartida). **Deuda restante**: el kernel soporte multi-archivo de lecciones (cars-operador, con TODO-22/23). **TODO-27 ✅.**

## 2026-06-22 — §97: Auditoría de cerebro Nivel-2 (semántica) — 2ª con artefacto [OPUS-4.8]

> Mantenimiento pedido por Daniel (tras el shard §96, antes de F2). Skill `auditoria-cerebro`, ejecución **ACOTADA** (`feedback_workflows_acotados`): 2 subagentes Explore read-only (S3 retrieval-drill + S7 adversarial, sin MCP/web) + sondas directas del auditor; SIN workflow desbocado. CRUDO+tabla → bóveda `archiveDir/2026-06-22-auditoria-cerebro-nivel2-CRUDO.md`. **Deliberación:** subagentes + verificación directa; hallazgos refutados con evidencia.

- **.1 Resultado**: cerebro SANO en sus 2 mitades (estructura vía `brain:check` + semántica vía esta auditoría). 3 hallazgos reales (1 ALTA corregido, 1 MEDIA documentada→TODO-29, 1 BAJA opcional); 3 falsos positivos/sobreestimados refutados.
- **.2 HA-01 (ALTA, REINCIDE H-01 §82)**: `05:14`+`10` con estado git STALE ("alineada a `4faffb1` / §94-95 pendientes de merge") cuando `git fetch` → `origin/main`=`cee5a85` (Daniel mergeó §94/§95 EN la sesión, L-26). CORREGIDO con hashes reales (`origin/main`=`cee5a85`, `origin/Desarrollo`=`81b7a4c`, local=`cbfea97`; solo §96 pendiente). Reincidencia = el gate-git (TODO-22, kernel/cars-operador) sigue ausente; **M-02 lo predijo** — sin gate que lea git, el `05` driftea cada vez que Daniel mergea mientras trabajo.
- **.3 HA-02 (MEDIA)→TODO-29**: TODO-27 (shard) ✅ correctamente (se ejecutó, `30` 44k→33k), pero la mejora estructural del kernel (`defined` lea `3*-LECCIONES*.md`) = deuda de cars-operador (M-06/§96.7), aporte a la pasada cars junto a TODO-22/23 — no falsa cobertura.
- **.4 Sondas verdes**: **S3 retrieval-drill 4/4 DIRECTO** (1.75 saltos prom.; el shard §96 MEJORÓ el ruteo: lecciones Firestore→`31` en 1 salto); S4 captura §93 fiel (bóvedas+callejones+refutado); S5 memorias→SSoT; S0 diff: H-16/H-17 (economía) mejorados por el shard.
- **.5 Refutados (Claude delibera, no acata)**: adversarial #5 (L-31 ×3 sin convergencia) por el check #11 peer-hash; #2/#3 sobreestimados (patrón stub↔ADR es normal; el shard SÍ se completó).
- **.6 GC pareado (masa-neta ≤ 0)**: la auditoría/turno añadió a `CLAUDE.md` (2 filas §96) y `10` (correcciones+TODO-29); compensado podando `10` (foco TODO-24 stale + fila TODO-28 redundante + cierre de TODO-24). **BOOT 40836c→39963c (Δ −873c ✅)**.
- **.7 Cierre**: CRUDO+tabla+fila README a bóveda; `deepAudit` `last=2026-06-22 coveredHeaderCount=97`; accionable HA-02→TODO-29 (`10`), HA-03 opcional, HA-01 ya corregido; TODO-24 cerrado→§88. Doctrina: §G.4 (auto-auditoría), §3.3 (git verificado), `feedback_workflows_acotados`.

## 2026-06-22 — §98: CRM — listeners con re-suscripción robusta (F2 colas mudas) [OPUS-4.8]

> TODO-28 F2 (recon §`2026-06-21-recon-correcciones-web` + L-40). En dinero, un listener congelado = "roto" se ve igual que "al día". Código `856f913`.

- **.1 Causa raíz (verificada en `crm-service.js`)**: NINGUNO de los 18 listeners `onSnapshot` del CRM re-suscribía tras un error transitorio de Firestore (bajón de red/deadline/refresh de token TERMINA el stream y NO reintenta solo). 10 SIN error-callback morían MUDOS (alta/baja posterior no propaga hasta recargar); 8 CON onError avisaban a la UI pero quedaban CONGELADOS. El sprint perf (§93) ya lo había resuelto para el público con `subscribeWithRetry`, pero el CRM no lo usaba.
- **.2 Solución estructural**: (a) `subscribeWithRetry` EXTRAÍDO de `firestore-service.js` a un módulo de infraestructura NEUTRAL `js/core/live-query.js` → el CRM (módulo desacoplado del catálogo, charter §3) lo reusa SIN acoplarse al servicio público (DRY + límites limpios §3.6). (b) `subscribeWithRetry` +4º param `onUiError` OPCIONAL (aditivo): se invoca en CADA fallo (la UI avisa) MIENTRAS el helper re-suscribe (backoff exp + retry al volver la red). (c) los 18 listeners → `subscribeWithRetry(() => ref, cb, 'label'[, onError])`; las superficies de control (cola de aprobación, rechazadas, acta, cortes, gestiones, acuerdos) pasan su onError → ahora avisan Y se recuperan solas.
- **.3 No-regresión**: contrato de retorno intacto (devuelve cleanup = unsubscribe, igual que `onSnapshot`); los 3 call-sites PÚBLICOS de `subscribeWithRetry` siguen (param opcional, no lo pasan); `onSnapshot` quitado de ambos imports (huérfano); IDs/funciones exportadas del CRM INTACTAS (§3.2). Sin bump SW (JS Vite-hasheado).
- **.4 Tests/verificación**: build verde. Auto-crítica experta: `() => q` re-usa la Query inmutable (válido para re-suscribir); `attempt=0` resetea el backoff al éxito; el helper garantiza "jamás 2 onSnapshot vivos"; `onUiError` en try/catch (la UI no rompe el retry). CRM NO ejercitable headless (auth+Firestore, L-18) → smoke funcional = Kary post-deploy (no bloqueante; Claude experto verifica la lógica, [[feedback_claude_experto_verifica]]).
- **.5 Anti-patterns evitados (§3)**: NO importar el helper de `firestore-service.js` (acoplaría el CRM al módulo público, viola el charter §3) → módulo neutral en `core/`. NO duplicar el helper (DRY). NO dejar los 8 onError matando el listener (avisar sin recuperarse = banner permanente). NO tocar la lógica de cálculo de dinero (solo la suscripción).
- **.6 Archivos**: NUEVO `js/core/live-query.js`. `js/firestore-service.js` (import del helper, −def, −onSnapshot import). `js/crm-service.js` (import + 18 listeners, −onSnapshot). INTACTOS: reglas, functions, lógica de saldo. Cerebro — `99` (§98), `00`, `10`, `20-ESPACIAL`.
- **.7 Doctrina**: §3.6 (límites de módulo limpios; infra compartida en neutral), §3.5 (onSnapshot de superficie de control con manejo robusto), L-40 (cola muda), §3.3 (verificado en código). **Cierra TODO-28 F2.** Restan de la fase: arranque C1 (decisión de Daniel) · responsive fino.

## 2026-06-22 — §99: Nosotros — anti-flash de imagen al cambiar la portada (bug Daniel) [OPUS-4.8]

> Daniel reportó URGENTE: al cambiar la imagen de portada de Nosotros, aparece la VIEJA y luego la NUEVA (flash); "o en cualquiera" sección. Código `0850847`.

- **.1 Causa raíz (verificada en código)**: `nosotros.init()` pinta `repaint()` con un valor PROVISIONAL (`getSiteContent('nosotros')` = defaults o lo que haya en memoria) ANTES de que `loadSiteContent` confirme el doc REAL de Firestore (línea 462 vs 466). El doble-paint hace que la imagen de portada "salte" de la provisional a la real. Es el MISMO patrón que §93/PERF-05 corrigió para catálogo/pieza/journal/lista-deseos, pero Nosotros/Contacto se dejaron FUERA ("muestran defaults reales" — válido para el TEXTO, NO para las imágenes). DESCARTADO como causa (verificado): Firebase sin persistencia IndexedDB, URLs de imagen ÚNICAS (`uploadAsset`+`Date.now()`), SW cross-origin pass-through (no cachea Storage), default de `hero.image` vacío.
- **.2 Solución estructural**: gate `_siteReady` en `nosotros.js` (extiende §93 a las IMÁGENES): hasta que `loadSiteContent` confirma el doc real, `repaint()` pinta el texto con defaults pero las imágenes (hero/atelier/equipo) VACIADAS (`withoutImages`) → el render muestra el fondo reservado (`.abt-hero-image-bg`), NO una `<img>` provisional. Al llegar el valor real, `_siteReady=true` + repaint → la imagen aparece UNA vez. `loadSiteContent` siempre resuelve (catch interno en `data.js`) → sin riesgo de imágenes ocultas.
- **.3 No-regresión**: el texto sigue con defaults; en carga fresca el comportamiento es equivalente (sin-imagen→real); el gate solo AÑADE protección contra pintar una imagen provisional (stale/bfcache/default-con-imagen). IDs/clases intactos. Sin bump SW (JS Vite-hasheado). Solo `js/pages/nosotros.js`.
- **.4 Tests/verificación**: build verde. Navegador (preview): Nosotros carga, texto pintado, hero SIN `<img>` provisional (bg reservado), atelier idem, 0 errores de mi código (solo Firestore-unavailable esperado, L-05). El FLASH real necesita Firestore con datos + el escenario de navegación → **verificación final = Daniel en prod**. Trigger exacto (bfcache vs stale-memory) no reproducible headless; el fix es defensivo para TODOS los casos de imagen-provisional.
- **.5 Anti-patterns evitados (§3)**: NO pintar una imagen provisional antes del valor confirmado (causa del flash); NO bloquear todo el render esperando Firestore (solo gatear imágenes; el texto default es seguro — §93); NO adivinar el RCA (§3.3: descarté persistencia/caché/URL/SW verificando cada uno).
- **.6 Archivos**: `js/pages/nosotros.js` (`_siteReady` + `withoutImages` + gate en `repaint`/`init`). INTACTOS: storage-service, data.js, resto. Cerebro — `99` (§99), `00`, `10`, `30` L-44, `45` PERF-05.
- **.7 Doctrina**: §3.3 (RCA verificado, descartando causas), §93/PERF-05 (readiness real, no pintar el estado equivocado), L-42 (secciones dinámicas). **PENDIENTE**: el MISMO patrón afecta Contacto (hero) y quizá Home (atelier/editorial) → extender el gate TRAS confirmar que Nosotros resuelve el síntoma (Daniel en prod). Lección → L-44.
> ⚠️ **SUPERSEDED por §100 (2026-06-23)**: la RCA de este § era ERRADA (el flash era un fondo CSS demo, no el doble-paint). El fix `_siteReady`/`withoutImages` se REVIRTIÓ. Ver §100.

## 2026-06-23 — §100: Cero-demo en multimedia — fondos CSS demo removidos (corrige la RCA del §99) [OPUS-4.8]

> Daniel 2026-06-23 (sobre §99): *"no funcionó, sigue apareciendo la foto vieja al ingresar"* + *"en móvil esa fotografía no es visible"* + directiva: *"audita TODAS las secciones multimedia, deben cargar dinámicamente; si no hay nada cargado no pueden mostrar fotografías; arregla el CMS; las imágenes demo deben ser eliminadas en su totalidad."*

- **.1 Causa raíz (RCA REAL, verificada en navegador real)**: el §99 diagnosticó MAL. El flash "vieja→nueva" NO era el doble-paint defaults→Firestore (el default ya es `image:''` → el 1er paint nunca tuvo imagen CMS). La "foto vieja" era un **fondo CSS demo horneado**: `.abt-hero-image-bg { background: url('/img/earrings-travertino') }` (`nosotros.css:80`). La maquinaria `_siteReady`/`withoutImages` del §99 lo **EMPEORÓ**: forzaba `image:''` en el 1er paint → garantizaba renderizar el div con el fondo demo. Verificado con Playwright sobre el sitio EN VIVO: descargaba `earrings-travertino-1200.avif`. Móvil: `.abt-hero-image` colapsaba a 1×2px (`margin:0 auto` quita el stretch del grid + contenido `position:absolute` = 0 ancho intrínseco).
- **.2 Solución estructural**: cero-ficción (`feedback_no_demo_en_index`). Estado SIN imagen CMS → **superficie de marca** (gradiente esmeralda), NUNCA foto demo. Con imagen del CMS → `<img>`. Auditadas TODAS las secciones multimedia con fallback demo horneado: `.abt-hero-image-bg` (earrings), `.atl-image-bg` (ring-sapphire, demo VIVO en prod), `.home-editorial-image-bg` (model-emerald), `categories.js FALLBACK_IMG` (banner-hero). Removida la maquinaria `_siteReady`/`withoutImages` del §99 (premisa falsa). Móvil: `+width:100%`.
- **.3 No-regresión**: IDs/clases intactos. `repaint()` vuelve al render simple `mount(main, renderAll(_content))`. categories: `<img>` con imagen, `.cat-tile-img-bg` sin ella. Build verde. Cache bump v21→v22 (§4).
- **.4 Tests/verificación (navegador real — corrige el vacío del §99)**: Playwright sobre el sitio vivo confirmó el demo (earrings.avif descargado) + atelier mostrando ring demo en prod. Tras el fix (dev server + Firestore): **0 demos descargados** (earrings/ring/model=[]), vacío=superficie de marca, móvil `.abt-hero-image`=340×425px (era 1×2). Sin demo en CSS crítico inline. Firestore `siteContent/nosotros` (leído por MCP): `hero.image`=1 imagen real, `atelier`/`equipo` vacíos.
- **.5 Anti-patterns evitados (§3)**: una directiva cero-demo NO se cumple solo vaciando datos del CMS — hay que cazar los fallbacks horneados en CSS (`background:url`), invisibles a una auditoría que solo mira `-defaults.js`/Firestore. RCA verificada en navegador REAL antes de afirmar (§3.3; el §99 falló por verificar solo en preview headless, L-05).
- **.6 Archivos**: `css/nosotros.css`, `css/home.css`, `js/home/categories.js`, `js/pages/nosotros.js`, `public/sw.js` (v22). Cerebro: `99`(§100), `00`, `10`, `30` L-45, `05`. Código `36da485`. CONSERVADOS (marca, marcados para Daniel): `banner-hero` (hero Home, estructura estándar), `gema.png` (joya decorativa atelier Home). Archivos `/img/*` demo NO borrados (sin refs en prod; housekeeping aparte; la carpeta `Bersaglio Jewelry Design System/` los referencia con ruta propia).
- **.7 Doctrina**: §3.3 (verifica en navegador real, no asumas), cero-ficción (`feedback_no_demo_en_index`), §3.6 (auditoría sistémica, no parche aislado). **Supersede la RCA del §99** (su fix se revirtió). PENDIENTE: confirmar flash en prod (Daniel) · borrado auto de imagen vieja de Storage (feature aparte) · decisión banner-hero/gema. Lección → L-45.

## 2026-06-23 — §101: Proceso de validación de Decisión Fuerte — veredicto (consejo Gemini doble-ciego) [OPUS-4.8]

> Cierre del proceso pedido por Daniel (2026-06-22): "yo instruyo → Claude revisa → comité → prompt Gemini → análisis crítico verificado → 2º comité → veredicto → actúa". Pipeline ya vivía en skill `proceso-decision-fuerte`. Gemini corrido por Daniel SIN el anexo del comité interno (doble-ciego). Crudo Gemini → bóveda `2026-06-23-consejo-gemini-proceso-RESPUESTA.md`; comité ×4 → `2026-06-22-proceso-validacion-comite-CRUDO.md`.

- **.1 Causa raíz / contexto**: la propuesta original tenía 5 capas de DELIBERACIÓN y 0 de VERIFICACIÓN empírica (hallazgo del comité ×4). Riesgo: "tres LLMs sobre el mismo diff = un fallo correlacionado revisado 3 veces" + falsa confianza ("pasó N filtros" baja la guardia del único verificador real).
- **.2 Solución / veredicto**: el pipeline actual (`proceso-decision-fuerte`) es SÓLIDO — Gemini, a doble-ciego, reinventó casi el mismo proceso (gatillo solo-Decisión-Fuerte, comité acotado, anti-anclaje, comité #2 omitible, verificación por fase) → convergencia = validación. **Cambio único aplicado** (lo que faltaba): endurecer Paso 7 a **GATE EMPÍRICO con "Pruebas de Estado"** — "verificado" JAMÁS sobre análisis estático; antes del gate humano de algo irreversible, EVIDENCIA real (build/test/log/captura/navegador real, no headless); el dueño aprueba sobre evidencia, no sobre filtros. + nota: doble-ciego PARALELO preferible (Gemini ve el crudo a la vez que el comité). NO se lanzó 2º comité (converge → omitido, según el propio paso 5 de la skill + `feedback_workflows_acotados`).
- **.3 No-regresión**: gatillo asimétrico intacto (lo trivial va directo — §3.7); skill editada (paso 3 + paso 7), no reescrita. Gobernanza, sin cambio de código de producto.
- **.4 Análisis crítico (NO acaté a Gemini — §3.3)**: VERIFICADO real → "deliberar ≠ verificar" (evidencia DURA esta semana: §99 falló headless, §100 OK con Playwright = L-45). EXAGERADO/refutado → (a) "apilar LLMs = cámara de eco que alucina en conjunto": el comité con TENSIÓN/lentes diversos cazó un bloqueante LEGAL (Ley 1581) que el red-team de Gemini NO vio → la diversidad refuta la tesis; (b) "latencia humana desincroniza el contexto de Claude": refutado EN VIVO — esta sesión se reinició entre prompt y respuesta y NO se perdió nada porque el estado estaba capturado en cerebro/bóveda (el cerebro documental ES la mitigación, §G.4).
- **.5 Anti-patterns evitados**: no rediseñar lo que ya funciona (Gemini "reinventó" el proceso existente → tomar solo el delta, no reescribir); no adoptar a Gemini como oráculo (verifiqué/refuté); no lanzar maquinaria redundante (2º comité) violando la propia conclusión.
- **.6 Archivos**: skill `~/.claude/skills/proceso-decision-fuerte/SKILL.md` (paso 3 doble-ciego + paso 7 gate empírico). Cerebro: `99`(§101), `00`, `10`, `05`. Bóveda: crudo Gemini + síntesis. Sin código de producto.
- **.7 Doctrina**: §3.3 (verifica, no asumas — elevado a EVIDENCIA-antes-de-aprobar), §3.6/§3.7 (rigor asimétrico), L-45 (navegador real), `feedback_consejo_externo_readonly` (Gemini asesora, Claude decide), `feedback_workflows_acotados`. Proceso `proceso-decision-fuerte` CERRADO.
> ⚠️ **Aclaración (Daniel 2026-06-23)**: "doble-ciego" aquí = **anti-anclaje** (Gemini no ve las conclusiones del comité, ni viceversa), NO que "Gemini no vea nada". **Gemini (Antigravity) SÍ lee el código y el cerebro** — es un agente que puede leer Y EDITAR como Claude; en el ROL de consejo externo le damos solo-lectura/crítico adversarial **por decisión nuestra, no por incapacidad**. La frase "Gemini a ciegas" fue imprecisa. → corregido `feedback_consejo_externo_readonly`; alinear el cerebro de cars (lo definen distinto, tarea pendiente de Daniel).

## 2026-06-23 — §102: Carga fluida — placeholder verde→neutro (corrige la UX del §100) [OPUS-4.8]

> Daniel 2026-06-23: *"tu implementación es terrible, se pone una pantalla verde primero y luego aparece la foto; no es fluido como las colecciones/piezas; el CMS es prácticamente igual al de colecciones, ¿por qué te cuesta tanto?"* + *"invoca la skill del arquitecto de software, que SIEMPRE debe invocarse al construir/corregir"*.

- **.1 Causa raíz (ground truth verificado)**: el §100 usó un **GRADIENTE ESMERALDA SATURADO** como placeholder (`.abt-hero-image-bg` etc.). Durante el getDoc one-shot de `siteContent`, ese bloque verde se ve como "pantalla de espera". El patrón fluido YA existía y es bueno (`featured.js`, comité+Gemini 2026-06-21): placeholder = `oklch(94% 0.02 150)` (neutro casi-blanco INVISIBLE) + imagen como `background:url` ENCIMA + reserva de altura (`section-reserve.js`). **Error de CRITERIO DE DISEÑO, no arquitectónico**: conflé "estado vacío" (superficie de marca) con "estado de carga" (debe ser invisible).
- **.2 Solución (reuso del patrón featured; lente Mantenibilidad+UX, skill `arquitecto-software`)**: los 4 placeholders (`.abt-hero-image-bg`, `.atl-image-bg`, `.home-editorial-image-bg`, `.cat-tile-img-bg`) → neutro `oklch(94% 0.02 150)` + cover/center. El render (hero+atelier Nosotros, editorial Home) pinta la imagen CMS como `background-image` inline sobre el div neutro (= featured), no un `<img>` que reemplaza un bloque de color → carga **sin hueco ni salto verde→foto**.
- **.3 No-regresión**: cero-demo del §100 intacto (el neutro tampoco es demo). IDs/clases intactos. Reglas CSS `.abt-hero-img`/`.atl-img`/`.home-editorial-img` quedan MUERTAS (limpieza menor pendiente). Build verde. Cache v22→v23.
- **.4 Tests/verificación (GATE EMPÍRICO §101, navegador real)**: dev → placeholder `lab(93%)` neutro (no verde/gradiente). **PROD (Playwright, post-deploy `da9feae`)**: `.abt-hero-image-bg` = neutro `lab(93%)` + `background-image:url(firebasestorage…)` (imagen real ENCIMA); atelier neutro; `.abt-hero-img` eliminado; 0 verde. Screenshot: hero con foto real, sin pantalla verde.
- **.5 Anti-patterns evitados**: no inventar (reusar patrón featured probado); no usar color saturado como placeholder (debe ser INVISIBLE, no competir con el contenido); verificación empírica en prod ANTES de afirmar (§101).
- **.6 Archivos**: `css/nosotros.css`, `css/home.css`, `js/pages/nosotros.js`, `js/home/editorial.js`, `public/sw.js` (v23). Código `2a1936a` (merge `da9feae`). Cerebro: `99`(§102), `00`, `10`, `05`, `30` L-46. Skill `arquitecto-software` invocada.
- **.7 Doctrina**: `arquitecto-software` (6 lentes; SIEMPRE al construir/corregir, directiva Daniel), **reuso > reinvento**, **placeholder de carga = invisible (neutro), NUNCA saturado** (L-46), GATE EMPÍRICO §101. PENDIENTE menor: limpiar CSS muerto. Lección → L-46.

## 2026-06-23 — §103: Arquitectura de carga "app-like" (DECISIÓN; implementación faseada PENDIENTE) [OPUS-4.8]

> Daniel 2026-06-23: *"las imágenes del CMS tardan, no como el banner instantáneo; la página no carga como una app (clic en menús = espera). Que por complacer no inyectes un caché forzado que no permita ver los cambios en tiempo real. Invoca TODO el workflow."* Workflow completo corrido. GO de Daniel al fork. **Deliberación → bóveda**: comité ×3 (`2026-06-23-comite-carga-instantanea-CRUDO.md`), prompt+respuesta Gemini (`...consejo-...-prompt.md` / `...RESPUESTA.md`).

- **.1 Ground truth (verificado)**: (a) imágenes CMS lentas = `getSiteContent`=getDoc one-shot Firestore por carga, SIN persistencia; el banner es instantáneo por ser `<picture>` estático horneado. (b) navegación lenta = router híbrido (`router.js`): misma-shell=SPA(pushState); **cruce de shells = `location.href` = recarga completa** (re-HTML+re-JS+re-Firestore). (c) SW: HTML network-first, JS/CSS/img cache-first, Firestore pass-through (datos en vivo OK). (d) `image-optimizer.js` ya procesa cada imagen en un canvas (sitio del LQIP); el flujo CMS de imagen es `singleton-admin.js` (`optimizeImage→uploadAsset→URL al doc`).
- **.2 Veredicto (Gemini superó a mi comité; análisis crítico VERIFICADO, no acatado)**: arquitectura objetivo = **(1) router falso-SPA** (Swup/Barba-style: intercepta cruce de shells, `fetch` HTML, swap `<main>`, JS/Firestore EN MEMORIA → nav instantánea) + **(2) caché Firestore en memoria (Map/sesión) + prefetch on-hover** + **(3) Blurhash/LQIP en Firestore** (generado en `image-optimizer`, reveal premium) — **CERO SWR-localStorage** (refutado: flicker; y el matiz de que el blurhash también vive en Firestore). Opcional **(4) SSG-bake del hero + auto-rebuild** (único camino a instantáneo-en-frío real; infra mayor).
- **.3 Refutado de Gemini (no acaté)**: el ejemplo "precio 5k→6k parpadea" NO aplica — `siteContent` no tiene precios (viven en piezas). Matiz honesto: en GitHub Pages estático, la 1ª carga fría SIEMPRE espera el getDoc; instantáneo-en-frío del hero solo con SSG-bake.
- **.4 Restricción dura respetada**: caché en memoria per-sesión + revalida; blurhash del Firestore vivo; sin caché pegajoso. Regla de oro: *Firestore = única verdad, SIEMPRE se consulta; el caché solo acelera el 1er paint, nunca tapa un cambio.*
- **.5 Plan FASEADO (pendiente, sesión fresca + GATE EMPÍRICO por fase)**: **Fase 1 Blurhash** (toca `firestore.rules` whitelist + modelo + `image-optimizer` + `singleton-admin` + render → test emulador + deploy manual L-22). **Fase 2 router falso-SPA + memoria + prefetch** (toca TODA la navegación: forms, drawers, scroll, atrás/adelante, SEO → comité #2 de casos borde + gate empírico). **Fase 3 opcional SSG-bake**.
- **.6 Archivos a tocar (Fase 1)**: `firestore.rules`, `js/image-optimizer.js`, `js/admin/singleton-admin.js`, `js/pages/nosotros.js`+`js/home/editorial.js` (render), defaults. (Fase 2): `js/core/router.js`+`boot.js`+page-handlers. **NADA implementado aún** — solo decisión.
- **.7 Doctrina**: workflow `proceso-decision-fuerte` COMPLETO (verificar→arquitecto→comité→Gemini→análisis crítico→veredicto→**fork→volver al dueño**, paso 6). **Decidir ≠ implementar** (§101): la implementación de reglas-de-seguridad + sitio-en-vivo se hace en sesión fresca, no fatigada. Lección → (al implementar).

## 2026-06-23 — §104: Implementación §103 F1 — LQIP "blur-up" en imágenes del CMS [OPUS-4.8]

> Implementa la **Fase 1** decidida en §103 (decidir≠implementar §101). Daniel: *"continua"*. Sesión fresca, `arquitecto-software` invocada, IAP §3.4, gate empírico.

- **104.1 Causa raíz (verificada leyendo código)**: las imágenes singleton de `siteContent` (editorial Home; hero/atelier Nosotros) se pintan como `background-image:url(real)` en un `<div class="*-image-bg">` SOLO tras el `getDoc` one-shot; la imagen baja de Storage después → superficie de marca vacía hasta que la real pinta = "hueco"→pop (a diferencia del banner estático horneado). §103.1.
- **104.2 Solución estructural**: **LQIP** (Low-Quality Image Placeholder) = data-URI base64 ~40px generado en `image-optimizer.makeLqip()` (reusa el `<canvas>` que ya optimiza), guardado en un **campo compañero `<campo>Lqip`** DENTRO del mismo sub-mapa de `siteContent` (aditivo). Render = **doble fondo CSS** (real ARRIBA, LQIP detrás) en los `div` de fondo, y LQIP como fondo del propio `<img>` en hero-Home/avatar-equipo → **blur-up sin JS, sin CSP, degrada solo** (sin LQIP = comportamiento actual exacto). Regla de oro §103 respetada: el LQIP viaja en el MISMO doc que la URL (no es caché, no tapa cambios; Firestore = única verdad).
- **104.3 Decisión de arquitecto (LQIP > Blurhash-librería)**: 6 lentes → vanilla/zero-budget gana con LQIP (CERO dependencia, CERO JS en el público, reusa el canvas existente) frente a Blurhash (exige librería de decode en cada carga). Render-safety: `safeLqip()` con regex `^data:image/(webp|avif|jpeg|png);base64,[A-Za-z0-9+/=]+$` → imposible que contenga comilla/paréntesis/espacio → **imposible romper el `url()`** (más estricto que `safeUrl`, que rechaza `data:` por diseño). El "Blurhash" del §103 era una etiqueta-concepto; la realización vanilla correcta es LQIP.
- **104.4 Hallazgo que CORRIGE §103.6** (Reflejo de Captura): `siteContentValid` hace `hasOnly` SOLO a nivel de SECCIÓN (`d.keys().hasOnly([secciones+meta])` + `is map`); **NO recursa en las claves internas** del sub-mapa. → añadir `imageLqip`/`bgImageLqip` dentro de una sección existente **NO requiere tocar `firestore.rules`** (el §103.6 asumía "whitelist de reglas"). **Sin deploy manual de reglas** (L-22 no aplica a F1). → [[L-48]] (31).
- **104.5 No-regresión**: IDs/clases/firmas intactas; `optimizeImage` sin cambios (firma estable); **CSS sin cambios** (los 3 `.*-image-bg` ya traen `background-size:cover` → el 2º fondo lo hereda); `firestore.rules` INTACTO. Build Vite ✓ (sin nuevos warnings; el de `firebase-config` 543KB es preexistente).
- **104.6 Tests/verificación**: **unitarios 257/257** (`safe-url`+`safeLqip`; `lqip` nuevo; `singleton-admin` con compañero top-level y de lista; `no-demo-home` reparado) · **reglas emulador 187/187** (+lock test: `imageLqip` interno se acepta sin cambio de reglas) · **build ✓**. Preview headless NO pinta dinámico (L-05) + el LQIP solo existe tras subir una imagen → el blur-up VISUAL lo verifican Daniel/Kary en `dev`/deploy (igual que §102).
- **104.7 Archivos**: **NEW** `js/core/lqip.js` (helpers `lqipBgStyle`/`lqipImgStyle`), `tests/lqip.test.mjs`. **MOD** `js/core/safe-url.js` (+`safeLqip`), `js/image-optimizer.js` (+`makeLqip`), `js/admin/singleton-admin-core.js`+`singleton-admin.js` (campo compañero en form/collect/upload/clear), `js/home/siteContent-defaults.js`+`js/pages/nosotros-defaults.js` (claves `*Lqip`), `js/home/editorial.js`+`hero.js`+`js/pages/nosotros.js` (render blur-up), `public/sw.js` (v23→v24), `tests/{safe-url,singleton-admin,firestore-rules}.test.mjs`. **Aparte** (fix preexistente, commit propio): `tests/no-demo-home.test.mjs`. **INTACTO**: `firestore.rules`, `firestore-service.js`, CSS, renderers de producto/CRM.
- **104.8 Caza-bugs colateral (Reflejo §G.4)**: durante el gate, `no-demo-home.test.mjs` salió **rojo en 6/10** (5 de L-42 + 1 de `< MIN_FEATURED`) — **test-rot silencioso desde §102** (la reescritura 3-estados añadió `armWatchdog();`+comentario antes del `return` y cambió `< MIN_FEATURED` por `>= MIN_FEATURED ? : ''`). El CÓDIGO de las 5 secciones cumple cero-ficción; lo stale eran los regex. Reparado: `stripComments` a alcance de módulo + L-42 tolera llamadas benignas previas (sin dejar pasar un `return ''` temprano) + acepta ambas formas del guard de umbral. Causa de fondo: **los node:tests NO corren en CI** (solo `test:rules`) → rot invisible. → M-07.
- **104.9 Doctrina**: `arquitecto-software` (6 lentes) · IAP §3.4 · cache bump §4 (v24) · gate empírico §101. **Pendiente**: F2 router falso-SPA (toda la nav → comité #2 de casos borde + gate). Lecciones → `30` L-47 (LQIP) · `31` L-48 (whitelist de reglas a nivel de sección) · `30 §Meta` M-07.

## 2026-06-23 — §105: Fix — "zoom/asentamiento" feo de imágenes en RECARGA (reveal-on-scroll replay) [OPUS-4.8]

> Daniel (con capturas): *"al recargar, las imágenes de las colecciones están más pequeñas y luego se acomodan a su zoom; arréglalo + garantiza que no pase en NINGUNA sección con imágenes, incl. piezas aún sin cargar."* Bug en PROD (independiente del F1, que sigue en Desarrollo).

- **105.1 Causa raíz (MEDIDA en navegador, no asumida — caza-bugs)**: NO es un resize/zoom real de la imagen. Medí en el dev server que la caja del `.cat-tile-img` es **estable** (180×242, `transform:none`) durante TODA la carga (incl. reveal+montaje), y que el hover-zoom (`transition:transform`) NO dispara en carga. La causa es la animación de entrada **`.reveal`** (`opacity 0→1` + `transform: translateY(30px)`, **0.9s**) que `home.js` aplica a las secciones del home: en RECARGA la sección ya está a la vista → la entrada se reproduce de inmediato; el `transform` promueve la sección a **capa GPU** y el navegador rasteriza/difumina sus imágenes durante la transición → se percibe como "imágenes más pequeñas que luego se acomodan (zoom)".
- **105.2 Solución estructural (SISTÉMICA, 1 sitio = todas las secciones)**: en el mecanismo compartido `js/core/reveal.js`, lo que YA está en el viewport en el PRIMER paint se **ASIENTA sin animar** (clase `.reveal-static` = `transition:none` + `.in`); solo lo que ENTRA por scroll anima (efecto intencional preservado). Cubre TODA sección con `.reveal` (colecciones, destacadas, editorial, atelier, journal, servicios, cierre) y cualquier página que use `.reveal` → incluye piezas.
- **105.3 Garantía pedida (otras secciones/imágenes)**: el patrón hover-zoom (`transition:transform` + `:hover scale(1.0x)`) es uniforme en todo el sitio (cat-tile/featured/catalogo/pieza/journal/social/films/wishlist) y se MIDIÓ que NO dispara en carga (transform queda `none`). Las cajas de imagen usan contenedor con tamaño (aspect-ratio o `width/height:100%`+`object-fit:cover`) → estables. Único jank de carga = el reveal replay, ahora resuelto en la raíz.
- **105.4 No-regresión**: el scroll-reveal de lo below-fold queda INTACTO (misma lógica IO/scroll; solo se "pela" lo visible hacia el camino instantáneo). Sin errores JS propios. Build ✓.
- **105.5 Verificación (empírica, navegador real; Firebase offline en sandbox L-05)**: dev server + preview. Above-fold (`home-cats/editorial/featured`, top<vh) → `reveal-static in`, opacity 1, transform none, **transition none** (instantáneo) ✅; below-fold (`services/atelier/cta`) → opacity 0, `translateY(30px)`, 0.9s (animan al scroll) ✅; consola sin errores propios. El efecto VISUAL con datos reales lo confirma Daniel en prod (el sandbox no alcanza Firebase → no carga colecciones).
- **105.6 Archivos**: `js/core/reveal.js` (pela lo visible → asentado), `css/liquid-glass.css` (+`.reveal-static`). **INTACTO**: `categories.js`/`home.css`/renderers (la causa NO estaba ahí — el código de colecciones es correcto). Cache sigue **v24** (un solo bump cubre todo el delta pendiente vs prod v23).
- **105.7 Doctrina/lección**: **caza-bugs** (medir el camino vivo > asumir; "imágenes que cambian de zoom al cargar" ≠ siempre resize — la medición descartó object-fit/layout y apuntó a la animación de entrada) + **arquitecto-software** (fix en el mecanismo compartido, no un parche por sección). → L-49.

## 2026-06-23 — §106: REVERT del render LQIP (§104 F1) — el placeholder borroso añadía un 3er estado feo [OPUS-4.8]

> Daniel (con capturas): *"ahora es PEOR — aparece la caja vacía, luego la imagen borrosa, luego la nítida: 3 cosas diferentes."* Feedback de usuario > beneficio teórico.

- **106.1 Causa raíz**: en un sitio **estático MPA**, el LQIP vive DENTRO del doc de Firestore (`siteContent`) → llega **con el `getDoc`, NO antes** del 1er paint. Secuencia real: defaults (neutro §102) → getDoc → LQIP borroso → descarga imagen → nítida = **3 estados**. El §103.3 ya anticipó que la 1ª carga fría SIEMPRE espera el getDoc; el LQIP **no reemplaza el estado vacío, lo SUMA**. Antes del F1: neutro→nítida (2). Con F1 suelto: neutro→borroso→nítida (3, peor).
- **106.2 Por qué F1 necesita F2**: el LQIP solo da "borroso→nítida" (premium, sin neutro) cuando el doc está disponible ANTES de pintar — eso lo logra el **F2 (router + caché-memoria + prefetch)**: al navegar, el doc (con LQIP) se precarga → el borroso aparece instantáneo. Desplegar el RENDER del F1 **sin** F2 fue prematuro.
- **106.3 Solución**: **revertir SOLO el render** del LQIP en las 3 superficies (`editorial.js`, `hero.js`, `nosotros.js`) → vuelve a neutro→foto (2 estados, comportamiento §102). **Se conserva la fontanería** (generación `makeLqip` + campo compañero + `safeLqip` + `lqip.js` + defaults + tests) como base lista para el F2 (donde el render se reactiva con la caché-memoria). NO es código muerto: la generación corre y persiste datos; los helpers siguen testeados (55/55).
- **106.4 No-regresión**: capa de datos intacta (tests 55/55: lqip/safe-url/singleton-admin/no-demo-home). Build ✓. Reglas sin cambio. `lqip.js` ya no se importa en render (sí en su test) → tree-shaken del bundle.
- **106.5 Archivos**: `js/home/editorial.js`+`hero.js`, `js/pages/nosotros.js` (render → §102), `public/sw.js` (v25→v26), `docs/05`. CONSERVADO: `js/core/lqip.js`, `safe-url.safeLqip`, `image-optimizer.makeLqip`, `singleton-admin*` (companion), defaults `*Lqip`, tests.
- **106.6 Doctrina/lección**: **feedback de usuario manda sobre el beneficio teórico**; una optimización de carga que SUMA un estado en vez de reemplazarlo EMPEORA la percepción. Un LQIP en un MPA estático solo rinde CON la caché que lo hace **preceder** a la imagen (F2/SSG). → L-50. Reactivar el render del LQIP es parte del **F2 (TODO-30)**.

## 2026-06-23 — §107: F2.0 — View Transitions cross-document (cross-fade entre páginas) [OPUS-4.8]

> Daniel: *"continuemos F2."* Arranque del F2 (navegación app-like) por el paso de mayor ROI / menor riesgo, ANTES del router completo.

- **107.1 Contexto + decisión de arquitecto (6 lentes)**: §103 decidió "router falso-SPA". Al implementar, hallazgo verificado (leyendo `boot.js`/`router.js`/handlers): los page-handlers **NO tienen `destroy()`** (asumen carga fresca) → el router completo exige teardown en CADA uno (listeners/`onSnapshot`/observers) = refactor GRANDE y frágil (§3.5 anti-zombi). Decisión: arrancar el F2 con **View Transitions cross-document nativas** (`@view-transition { navigation: auto }`): cross-fade entre páginas del mismo origen en vez del flash blanco. **Cero JS, cero teardown, degrada solo** (navegador sin soporte = nav normal), y **respeta la regla dura de Daniel** ("sin caché que tape cambios": cada página sigue cargando FRESCA; esto es SOLO la transición visual). *Más valor con menos fricción.*
- **107.2 VT vs router (qué resuelve cada uno)**: VT elimina el **parpadeo/flash** (lo que más molesta) pero el contenido sigue recargando (la imagen aún baja tras el cross-fade). El **router falso-SPA (F2.1, pendiente)** da nav INSTANTÁNEA real (contenido en memoria, sin recarga) — pero es el build grande con teardown. Estrategia: **VT primero (ship + evaluar); router solo si VT no basta** para sentirlo "app-like". VT NO precluye el router (cuando llegue, usará `startViewTransition` para el swap same-document).
- **107.3 Implementación**: `@view-transition { navigation: auto }` + duración 0.34s + guard `prefers-reduced-motion` en `css/liquid-glass.css` (cargado en las 12 shells públicas → todas opt-in). `router.js` INTACTO (el `location.href` cross-shell ya dispara el VT nativo). Cache v27.
- **107.4 No-regresión**: solo CSS aditivo; la navegación (router) NO cambia → nada que romper. Build ✓. Verif. navegador real: `@view-transition` parseada y activa + `startViewTransition` soportado + sin errores propios (solo Firebase-offline del sandbox, L-05). El cross-fade VISUAL lo confirma Daniel en Chrome.
- **107.5 Archivos**: `css/liquid-glass.css` (+`@view-transition`), `public/sw.js` (v26→v27), `docs/05`. INTACTO: `router.js`, `boot.js`, page-handlers.
- **107.6 Pendiente F2.1 (router falso-SPA)**: intercepta cruce de shells → `fetch` HTML → swap `<main>`+title+CSS → corre el handler con **teardown** → memoria+prefetch → `startViewTransition` para el swap. Sesión dedicada + comité de casos borde. → TODO-30. Doctrina: arquitecto-software (6 lentes) · §3.5 (anti-zombi) · gate empírico. → L-51.

## 2026-06-23 — §108: F2.x "caché inteligente" (SWR nativo de Firestore) — DIRECCIÓN decidida + research; implementación vía WORKFLOW (próxima sesión) [OPUS-4.8]

> Daniel (tras probar F2.0): la imagen del CMS aún tarda (blanco→foto), no fluida como el hero. Propuso una **caché inteligente** (fluida si no hay cambios; se actualiza solo si el CMS cambió; 1ª carga más lenta, luego app). Pidió: **cerrar aquí** y que la PRÓXIMA sesión haga el **workflow completo (comité + consejo externo + skills + agentes)** para revisar/mitigar bugs y anticiparse, ANTES de implementar.

- **108.1 Problema**: el hero es instantáneo por ser ESTÁTICO (horneado); el contenido del CMS carga tras `getDoc` (blanco→foto). F2.0 (View Transitions, §107) quitó el flash blanco ENTRE páginas pero NO la carga del contenido. El router (F2.1) tampoco arregla la 1ª carga + es grande/riesgoso (handlers sin teardown).
- **108.2 Dirección (idea de DANIEL, validada por research)**: **SWR (stale-while-revalidate)** = patrón estándar (web.dev; Google lo usa en ads). Firestore lo trae **NATIVO**: caché persistente IndexedDB → `onSnapshot` entrega la copia local AL INSTANTE y revalida; `metadata.fromCache` distingue. Render desde caché + **diff-gate** (re-pintar SOLO si el dato cambió) = fluido SIN parpadeo cuando no hay cambios, y update EN VIVO cuando los hay (respeta la regla dura de Daniel). DISTINTO del "SWR-localStorage a mano" que el §103 descartó (ese parpadeaba): aquí es el mecanismo OFICIAL, robusto.
- **108.3 Diseño propuesto (A VALIDAR en el workflow, no implementado)**: (1) `initializeFirestore(app,{ localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })` en `js/firebase-config.js`. (2) `js/core/data.js` + flujos de render: pintar desde caché en el 1er paint (no DEFAULTS vacíos) + **diff-gate** del re-render. (3) Imágenes: asegurar caché de bytes (SW cachea Storage cross-origin, hoy pass-through; o cache-control). Resultado: 1ª visita carga (sin caché); resto INSTANTÁNEO. Probablemente hace **innecesario el router F2.1**.
- **108.4 Research (síntesis + fuentes)**: web.dev/articles/stale-while-revalidate · web.dev/case-studies/ads-case-study-stale-while-revalidate · firebase.google.com/docs/firestore/manage-data/enable-offline · Jake Archibald Offline Cookbook. API v12 verificada (persistentLocalCache + onSnapshot cache-first + metadata.fromCache + includeMetadataChanges).
- **108.5 MANDATO próxima sesión (Daniel, explícito)**: workflow COMPLETO = `proceso-decision-fuerte` (es Decisión Fuerte: capa de datos) + `comité-expertos` ×3 + **consejo externo Gemini** (read-only §15) + skills (`arquitecto-software`, `caza-bugs`) + agentes → **revisar/mitigar bugs y anticipar** casos borde ANTES de codear. **Casos borde a cubrir**: 1ª visita sin caché · multi-tab · diff-gate correcto (igual→no toca DOM; cambió→update) · fallo IndexedDB (fallback memoria, defensivo) · cuota de storage · caché de bytes de imagen (Storage cross-origin + SW pass-through actual) · interacción con los `onSnapshot` existentes (CRM/público, `live-query.js`) · que NO tape cambios en vivo · primera-carga-tras-cambio (parpadeo único aceptado por Daniel). **BOUNDED** (`[[feedback_workflows_acotados]]`): el comité razona sobre el research/diseño YA verificado; agentes SIN re-explorar libre + TOPE; nada de workflow desbocado. Gate empírico §101 por fase + emulador para reglas si aplica.
- **108.6 Estado**: F2.0 (§107) + §106 (revert LQIP) + §105 en `Desarrollo` (`493612f`), **PENDIENTE merge de Daniel** a `main` (despliega F2.0 cross-fade + revert + v27). NADA del smart-cache implementado (a propósito: el workflow lo vetea primero). → TODO-30 reorientado. → L-52.

## 2026-06-23 — §108 (cont.): WORKFLOW ejecutado (4 bloqueantes cazados ANTES de codear) + FASE 1 implementada [OPUS-4.8]

> Daniel: "arranca la caché inteligente (§108)". Corrido el mandato: pipeline `proceso-decision-fuerte` completo + ACOTADO. Deliberación CRUDA (comité ×5 + peer-review) + síntesis + respuesta Gemini → bóveda `2026-06-23-108-cache-inteligente-{comite-CRUDO.json,SINTESIS.md}`.

- **108.7 Workflow** (Decisión Fuerte: capa de datos + cache SW + costo escala + público↔CRM): GATE→Verificar(8 archivos reales)→Arquitecto(diseño candidato 3 patas)→**Comité ×5 acotado** (inline+schema, sin herramientas; 10 agentes, ~1.08M tok, 3.5 min, SIN desboque — `[[feedback_workflows_acotados]]` funcionó) + peer-review anónimo→**Gemini CRUDO doble-ciego** (Daniel lo corrió)→verificar/refutar→Veredicto. Comité #2 OMITIDO (convergencia). **Convergencia INDEPENDIENTE comité↔Gemini = señal fuerte.**
- **108.8 Los 4 bloqueantes** (mi diseño candidato los tenía): (1) **fallback inviable**: la API moderna `persistentLocalCache` NO tiene `.catch()`; fallo de IndexedDB es ASÍNCRONO + instancia no re-inicializable → un try/catch NO atrapa → **feature-detect ANTES de init**. (2) **caché GLOBAL contagia al CRM de dinero** (verificado `crm-service.js:15` comparte `firestoreDb`): saldos stale + semántica offline invertida + PII/dinero en IndexedDB en claro tras logout (I3/I6). **Doc oficial Firebase** respalda: info sensible ⇒ no persistir → **caché SOLO-PÚBLICO; admin/CRM = memoria**. (3) **diff-gate puede ocultar un cambio** (viola I1): firma `id+_version+StorageURL` ordenada, ante duda re-renderiza. (4) **gatear MOUNT no basta** (regresión §105): envolver mount+`observeReveals`, `.reveal-static` para contenido de caché.
- **108.9 Hechos Firebase v12 verificados en docs oficiales**: onSnapshot emite cache→server; sin `includeMetadataChanges` una transición solo-metadata NO re-dispara. **`getDoc` server-first online** ⇒ `siteContent` (textos/legales) NO queda stale online → **I1 a salvo sin tocarlo**. Caché Firestore auto-gestiona 100MB LRU (el riesgo de cuota era del SW/3b, descartado).
- **108.10 Veredicto = GO con cambios, 3 FASES** (no big-bang): **F1** caché persistente SOLO-público + feature-detect (CRM/dev=memoria) · **F2** diff-gate (firma blindada) envolviendo mount+reveal · **F3** Cache-Control+URL versionada; **APLAZAR 3a LQIP** (revive §106 + falta backfill + infla doc, satura el TTFB de la F1).
- **108.11 FASE 1 implementada + gate empírico local** (`js/firebase-config.js`, Build 🟢): `isAdminPage`(regex) + `pickLocalCache()`(admin|dev→`memoryLocalCache`; público+prod+IndexedDB→`persistentLocalCache`+multiTab) + `createFirestore()` con red de seguridad `getFirestore`. `getDoc`/`siteContent` SIN cambios. **Verificado navegador real (Playwright)**: localhost→`firestoreIdbPresent:false` (memoria, no contamina emulador) ✅ · IP de red (no-dev)→se creó `firestore/[DEFAULT]/bersaglio-jewelry/main` ✅ · contra Firestore PROD por IP: 0 errores, App Check limpio (catálogo vacío = reset-a-cero, legítimo). **Sin código muerto** (`getFirestore` sigue en el fallback). **Sin cache-bump SW**: `firebase-config` es JS hasheado por Vite (HTML network-first toma el hash nuevo) → no toca `SHELL_ASSETS`.
- **108.12 Pendiente F1**: UX "volver=instantáneo" con datos reales (catálogo vacío por reset) · Safari privado/multi-tab/admin=memoria en prod real → gate sobre **gemelo** o post-deploy. **Merge `Desarrollo`→`main` = Daniel** (L-26). Sigue: F2 (diff-gate) · F3.

## 2026-06-23 — §108 (cont. 2): hallazgo en vivo (caché OK) + F3 LQIP + umbral comercial + bug de precio [OPUS-4.8]

- **108.13 Hallazgo en vivo** (extensión Claude-in-Chrome de Daniel, prod, F1 ya desplegada): la **caché FUNCIONA** — en recarga normal (F5) las imágenes salen de caché (`transferSize=0`), instantáneas, SIN "vacío→foto". El "vacío→foto" que Daniel seguía viendo era por **Ctrl+Shift+R** (recarga dura **bypassa la caché** a propósito al probar sus cambios del CMS) o 1ª-visita-fría (0.3–1.1s de descarga Storage). ⇒ el **cache-control NO era la palanca** (las .webp ya se cachean); lo único que queda es la 1ª carga fría → **LQIP**. (También: IndexedDB Firestore poblada = F1 activa; 2 no-bloqueantes: `InvalidStateError` de View Transitions §107 en frío + Firestore Listen 503 transitorio que se auto-cura.)
- **108.14 F3 = LQIP blur-up** (`f1a48b0`): subida genera `makeLqip` en paralelo a `optimizeImage` y guarda `imageLqip` (pieza, SOLO la principal → payload mínimo, mitiga la inflación del doc que marcó el SRE §108.8) / `bannerLqip` (colección). Render `lqipBgStyle`/`lqipImgStyle` en `featured.js`/`categories.js`(+`categories-data.js`) que **DEGRADA al comportamiento actual si no hay LQIP** → seguro para datos viejos. Reglas SIN cambio (`pieces`/`collections` no usan `hasOnly` → campo nuevo permitido). **Backfill**: Daniel re-sube las imágenes existentes para que generen el blur. Verificado navegador real: home 0 errores, `background-image` válido. (El §106 revirtió el render LQIP en flujo getDoc; aquí va sobre piezas/colecciones que montan CON su dato vía onSnapshot → blur→nítido, sin el estado vacío que motivó §106.)
- **108.15 Umbral comercial** (`a15a02a`, **directiva Daniel**: "lo comercial no se discute; el index debe mostrar lo que haya aunque la joyería quede con 1 pieza; no umbral así de fuerte"): `MIN_FEATURED` 3→1 + el filtro de Destacadas pasa de exigir PRECIO a exigir **FOTO** (la franja es escaparate visual; el precio es opcional → `format$()` pinta "Cotización"). Cero-ficción solo OCULTA si hay 0. Verificado: Destacadas aparece con 2 piezas (antes oculta). Ajuste de la doctrina cero-ficción: real ≠ demo, no imponer umbral de dignidad fuerte.
- **108.16 Bug colateral resuelto** (`782977e`): guardar una pieza SIN precio fallaba con "Missing or insufficient permissions". RCA: el form mandaba `price: parseFloat('')||null = null`; la regla `pieceCreateValid/pieceTypesValid` exige `!('price' in d) || d.price is number` → `null` presente NO es número → DENY. `savePiece` (db.js) borra `undefined` pero NO `null`. Fix: el form solo incluye `price` cuando es número válido (omitir vacío). Pre-existente (contrato form↔reglas S6), no de §108. **Lección reusable**: en reglas Firestore, un opcional `!('x' in d) || d.x is T` RECHAZA `null` → el cliente debe OMITIR el opcional vacío, no mandar `null` (gotcha form↔reglas).

## 2026-06-23 — §109: InvalidStateError benigno de View Transitions (§107) — guard de rechazo [OPUS-4.8]

> Tarea-chip (spawn) tras §108.13: la extensión Claude-in-Chrome de Daniel cazó en prod, SOLO en arranque frío/reload, `InvalidStateError: Transition was aborted because of invalid state`. NO-bloqueante (la página renderiza bien) pero ensucia la consola.

- **109.1 RCA** (verificada en código): NO hay `document.startViewTransition` en JS (`router.js` solo hace `location.href`; las transiciones de §107 son la regla DECLARATIVA `@view-transition{navigation:auto}` en `liquid-glass.css`). ⇒ el error es un **rechazo no-manejado de la maquinaria NATIVA** del navegador al **abortar la VT cross-document en un reload** (un reload no transiciona → la promesa de la VT rechaza con InvalidStateError).
- **109.2 Fix mínimo** (`75163d4`): guard `unhandledrejection` en `boot.js` (el JS compartido que carga más temprano) que captura SOLO ese rechazo conocido (`name==='InvalidStateError'` + `/transition was aborted/i`); cualquier otro se deja propagar (nunca un swallow amplio). NO toca el cross-fade. + **dedup** (anti-código-muerto): había DOS `@view-transition` idénticos en `liquid-glass.css` (líneas 12 y 106) → queda 1.
- **109.3 Verificación**: navegador real (Playwright) — disparé el `DOMException` EXACTO y el guard lo capturó (no se filtró a consola); regla `@view-transition` presente (cross-fade intacto); build verde. NO reproducible en Playwright (`page.goto` no dispara la VT como un reload/click real) → confirmación final en prod = **extensión de Daniel**. Sin cache bump SW (boot.js/CSS hasheados por Vite + HTML network-first).
- **109.4 Lección reusable**: las View Transitions cross-document **declarativas** (`@view-transition`) emiten un rechazo BENIGNO `InvalidStateError` al abortarse en reload → si molesta en consola, guard `unhandledrejection` **DIRIGIDO** (por name+message), no en el `pagereveal` (que un módulo deferido puede llegar tarde a registrar). NO relacionado con §108.

## 2026-06-23 — §110: proceso de MIGRACIÓN server-side (no re-subir) + hallazgo siteContent + auth [OPUS-4.8]

> **Directiva de arquitecto de Daniel**: re-subir imágenes a mano NO es solución — no escala a miles de piezas/colecciones/multimedia. **Cada cambio de plataforma debe traer su migración.** Patrón establecido: `scripts/migrate-*.mjs`.

- **110.1 Proceso de migración** (`fbe5379`, `scripts/migrate-lqip.mjs`): Admin SDK + `sharp`, server-side → baja la imagen de Storage (sin CORS) → genera el LQIP → escribe el campo en Firestore. **DRY-RUN por defecto**, `--apply` escribe; **idempotente** (salta lo ya migrado), re-ejecutable, lotes; `TARGETS` extensible (pieces→`imageLqip` / collections→`bannerLqip` hoy; journal/films/redes cuando su render use LQIP). +`firebase-admin` devDep. `.gitignore`: claves SA. **Verificado** que carga+sharp corren; **PENDIENTE de CORRER**: la credencial de esta máquina (ADC `authorized_user`) tiene `quota_project_id=altorra-cars` → `PERMISSION_DENIED` en el Firestore de bersaglio. Daniel debe proveer credencial de **bersaglio**: `gcloud auth application-default set-quota-project bersaglio-jewelry` (si su cuenta tiene acceso) **o** una **SA key** de bersaglio (`GOOGLE_APPLICATION_CREDENTIALS=...json`). Luego: dry-run → `--apply` backfillea TODO sin re-subir.
- **110.2 Hallazgo — `siteContent` (nosotros/hero/editorial) sigue "vacío→foto"**: el F3 (§108.14) cableó LQIP SOLO en **piezas + colecciones**. Las imágenes de PÁGINA (`siteContent`) tienen el dato LQIP (singleton-admin lo genera, §103 F1) pero su **RENDER se revirtió en §106** → no muestran blur. Daniel re-subió el banner de nosotros y siguió lento por esto (no es bug, es cobertura faltante). **PENDIENTE**: extender el render LQIP a `siteContent` (re-cablear con cuidado lo que §106 revirtió — la fontanería existe).
- **110.3 Auth gotcha (reusable)**: el ADC `application_default_credentials.json` lleva un `quota_project_id` por-proyecto; en una máquina multi-proyecto (altorra+bersaglio) un script Admin SDK contra el proyecto B falla con `PERMISSION_DENIED` si el ADC apunta al proyecto A. Fix: `set-quota-project` (global, reversible) o SA key por-proyecto (limpio, sin choque).
- **110.4 EJECUTADA (2026-06-23)**: Daniel descargó una **SA key de bersaglio** (Firebase Console → Cuentas de servicio → Generar clave privada; guiado con widget visual + deep-link `console.firebase.google.com/project/bersaglio-jewelry/settings/serviceaccounts/adminsdk`). Corrida con `GOOGLE_APPLICATION_CREDENTIALS=<...Downloads/bersaglio-jewelry-firebase-adminsdk-*.json>` (resolvió el bloqueo de §110.1; la SA key NO choca con el ADC de altorra → vía limpia de §110.3). **dry-run → 8 a migrar (2 piezas + 6 colecciones), 0 fallos → `--apply` → 8 LQIP ESCRITOS, 0 fallos**; re-dry-run confirmó idempotencia (8 ya con LQIP, 0 a migrar). El render de piezas/colecciones (§108.14) YA está en prod → el blur-up es visible **sin deploy**. La key queda fuera del repo (`.gitignore`) → Daniel la borra/revoca tras la corrida. Pendiente futuro: extender `TARGETS` (journal/films/redes) cuando su render use LQIP.

## 2026-06-23 — §111: LQIP en `siteContent` vía SWR cache-first — resuelve §110.2 SIN repetir el 3er estado de §106 [OPUS-4.8]

> Daniel "continuemos con los pendientes de §108/§110". De los 3 pendientes: #2 (extender LQIP a `siteContent`) ELEGIDO "hacerlo bien ahora"; #1 (migración) "darme acceso de bersaglio" (sigue bloqueada por credencial); F2-piezas opcional (la evidencia §108.13 mostró que no parpadea). **Hallazgo de arranque (git fetch §3.3)**: Daniel YA mergeó PR #318 → el código de §108/§109 + el script de migración están EN PROD; el `05`/`10` decían "pendiente PR" (stale, reincidencia HA-01) → corregido.

- **111.1 Causa raíz / tensión resuelta**: §110.2 marcó "extender el render LQIP a `siteContent`" pero chocaba con **L-50** (Trigger de Experiencia §G.2): en §106 el render LQIP se revirtió porque el `getDoc` era **server-first en CADA visita** → el blur llegaba *después* del 1er paint (defaults) = 3 estados (neutro→borroso→nítido) en *toda* carga → Daniel: "peor". La sesión anterior dejó la tensión SIN resolver. **Reconciliación (verificada en código)**: con la caché de §108 (`persistentLocalCache`) aplicada a `siteContent`, las **revisitas pintan desde caché al instante** (la foto ya está en HTTP-cache → el blur no se ve) y el blur-up solo aparece en **carga fría** (1ª-visita / recién-subida / Ctrl+Shift+R) — rara y transitoria (más aún con el reset). Así "3 estados por-visita" → "instantáneo en revisitas". L-50 EXIGE justo esto: el placeholder solo mejora si **precede** a la imagen → caché-memoria, no `getDoc` server-first.
- **111.2 Solución estructural**: (a) **Capa de datos** — `data.loadSiteContent(page, onUpdate)` pasa a **SWR cache-first**: `getDocFromCache` (instantáneo; pinta) → `getDocFromServer` (revalida) → **diff-gate por `version`** (el writer la bumpea en cada `saveSiteContent`) → re-pinta SOLO si cambió; ante CUALQUIER duda (sin caché / versión distinta / doc nulo) re-pinta (I1: nunca tapa un cambio). Costo IDÉNTICO al `getDoc` one-shot previo (§2.B): caché local + 1 lectura de servidor, SIN listener. (b) **Render LQIP (degrada solo)** — `lqipBgStyle`/`lqipImgStyle` en hero+editorial (home) y hero+atelier (nosotros); el blur viaja en el MISMO doc que la URL (no es caché, no tapa cambios). Sin LQIP → comportamiento actual exacto.
- **111.3 No-regresión**: `getSiteContent` (one-shot) INTACTO → el admin (`singleton-admin.js`) que lo usa para prefill sigue server-fresh (memoria, §108.11). Callers de TEXTO (contacto/términos/privacidad/footer) usan `.then(...)` → `loadSiteContent` sigue devolviendo promesa → INTACTOS (solo home/nosotros estrenan el repaint cache-rápido vía `onUpdate`). Reglas SIN cambio (L-48: campo interno aditivo). **Sin bump SW** (JS hasheado por Vite; HTML network-first toma el hash nuevo). IDs/clases/firmas estables.
- **111.4 Tests / verificación**: build 🟢 · 45/45 (lqip + singleton-admin + safe-url) · **navegador real (Playwright/preview)**: home y nosotros renderizan completos (defaults); la ruta SWR **degrada limpio offline** (mi `catch` → defaults; los `[error]` de consola son del SDK de Firebase por estar offline, NINGUNO sin capturar de mi código); render del blur degrada solo. El UX final (blur-up + revisita instantánea) requiere datos reales + caché persistente → **confirmación en prod = Daniel** (igual que §108.12/§109.3; local = caché de memoria + L-05).
- **111.5 Anti-patterns evitados**: re-introducir el render §106 a ciegas (lo hubiera repetido — §G.2); SWR-a-mano con localStorage (§103 lo descartó por parpadeo, L-52); diff-gate que oculte un cambio (I1 — gate por `version` + "ante duda re-pinta"); listener permanente en singletons (rompe §2.B/Spark); código muerto (quité el import `safeUrl` ya no usado en `editorial.js`).
- **111.6 Archivos**: `js/core/data.js` (loadSiteContent SWR), `js/firestore-service.js` (+getSiteContentFromCache/FromServer, +import getDocFromCache/getDocFromServer), `js/home/hero.js`+`editorial.js` (render LQIP), `js/pages/nosotros.js` (render LQIP hero+atelier), `js/pages/home.js` (onUpdate). INTACTOS: `getSiteContent`, admin, reglas, SW, `lqip.js`/`safe-url.js`. Commit `f6ff72e` (Desarrollo).
- **111.7 Doctrina**: SWR nativo de Firestore = `persistentLocalCache` + `getDocFromCache→getDocFromServer` + **diff-gate por `version`** (cuando es getDoc one-shot, no onSnapshot). Un placeholder solo ayuda si PRECEDE a la imagen (L-50); la caché es lo que lo habilita. Sin cache bump (JS hasheado). → L-50 EXT, [[L-52]].
- **111.8 Validación en prod + cobertura completada (2026-06-23, commit `f8f79ec`)**: Daniel mergeó (PR #321) → validó con **2 opiniones** (Daniel: "más rápido, blur en frío, instantáneo desde caché en revisitas — el blur no sobra, es la caché inteligente" = modelo mental EXACTO; extensión Chrome: consola limpia ✅, sin `InvalidStateError` suelto ✅, transiciones suaves ✅, 2ª carga instantánea transferSize 0 ✅; hero Nosotros + featured/editorial Home con blur ✅). **Hallazgo de la extensión**: las piezas del **catálogo** mostraban foto SIN blur → verificado: §108.14 cableó el blur SOLO en el Home; el resto del sitio no. Las piezas ya tienen `imageLqip` (migrado §110.4) → completado en `catalogo.js`/`lista-deseos.js`/`pieza.js` (imagen principal idx 0; guard anti-blur-incorrecto en miniaturas). Carrito/drawers/búsqueda OMITIDOS (piezas ya vistas→caché, blur no visible). Mismo patrón `featured.js` (degrada solo). Pendiente Daniel: merge de `f8f79ec`. Futuro: LQIP por-imagen (hoy solo images[0]) si se quiere blur en miniaturas del detalle.

## 2026-06-23 — §112: Cache-Control en imágenes de Storage — el blur salía en CADA visita (no solo la 1ª) [OPUS-4.8]

> Daniel (corrige mi mala lectura de su feedback previo): *"la 2ª, 3ª y siguientes veces seguía apareciendo el blur, y NO debería — ya cargó y guardó en caché en la 1ª pasada; solo debería reaparecer cuando se actualice la foto del CMS."* Modelo mental correcto; yo había leído su nota anterior como "ya funciona así" (no era). Autocrítica → investigación con evidencia.

- **112.1 RCA (evidencia dura, no asumida)**: leí el `cacheControl` real de los 8+ objetos de Storage con el Admin SDK → **todos `undefined`** (`_upload` en `storage-service.js` subía con `contentType`+`customMetadata` pero SIN `cacheControl`). `curl -I` a una imagen en vivo → **`Cache-Control: private, max-age=0`** (el default de Firebase Storage sin cacheControl) → el navegador **revalida en CADA visita** → la imagen nunca sale instantánea de caché → el LQIP (blur) se ve SIEMPRE mientras re-carga, no solo en frío. Reconcilia con §108.13 (lo que vio cacheado era memoria de sesión / ventana corta, no un revisit real). Es el **"F3 Cache-Control" que §108.10 había APLAZADO**.
- **112.2 Solución estructural**: `cacheControl: 'public, max-age=31536000'` en `_upload` (cubre TODAS las subidas: assets/banners/piezas, un solo helper). **Seguro cachear largo** porque la downloadURL se **versiona por token** (cada (re)subida = token nuevo = URL nueva en Firestore) → foto actualizada = URL nueva = cache miss = se re-descarga (blur 1 vez); foto sin cambios = URL estable = instantáneo (sin blur). = EXACTO lo que pidió Daniel. NO usé `immutable` (conservador; la URL-versionada ya da la frescura).
- **112.3 Backfill (no re-subir)**: `scripts/migrate-cache-control.mjs` (patrón §110/§112; Admin SDK, `bucket.getFiles()`→`setMetadata({cacheControl})` solo en imágenes, dry-run/idempotente). **EJECUTADO**: dry-run 18 → `--apply` 18/18, 0 fallos. **Verificado por `curl -I`**: served `Cache-Control: public, max-age=31536000` (era `private, max-age=0`); re-dry-run = "18 ya correctas" (idempotente). `setMetadata` NO cambia la URL → los objetos existentes se auto-curan: la próxima carga re-fetcha 1 vez (capturando el header nuevo) y cachea → de ahí en más instantáneo.
- **112.4 No-regresión**: `_upload` es el único helper de subida → un solo punto. Sin cambio de reglas/SW (JS hasheado; metadata de Storage no es shell). El LQIP (§108/§111) NO estaba mal — solo le faltaba ESTO para no verse en revisitas; juntos dan el comportamiento deseado (blur en frío/cambio, instante en revisita). Build verde.
- **112.5 Anti-patterns evitados**: arreglar a ciegas (medí el header real antes); asumir que §108.13 "ya cachea" sin re-verificar (lo refuté con evidencia); `immutable` con URL no-garantizada-versionada (usé max-age largo + token-versioning). Mala lectura del feedback de Daniel → corregida con autocrítica.
- **112.6 Archivos**: `js/storage-service.js` (`_upload` +cacheControl), `scripts/migrate-cache-control.mjs` (nuevo). Commit `2eb71fe` (Desarrollo). INTACTO: reglas, SW, render. Pendiente Daniel: merge (para que las NUEVAS subidas cacheen; las existentes ya están backfilled en prod).
- **112.7 Doctrina / lección**: Firebase Storage SIN `cacheControl` → servido `private, max-age=0` → re-fetch por visita (mata cualquier blur-up/caché de imagen). SIEMPRE setear `cacheControl` largo en la subida; es seguro porque la downloadURL se versiona por token. → L-53.

## 2026-06-23 — §113: migrar correo del usuario OWNER → personal de Daniel (TODO-20 ✅, seguridad) [OPUS-4.8]

> Directiva Daniel (URGENTE): el super-admin NO debe colgar del correo de la empresa (`bersagliojewelry@gmail.com`, que será de Kary) — riesgo de que un tercero recupere la clave del dueño. Owner → correo PERSONAL de Daniel.

- **113.1 Hallazgo**: la **consola de Firebase Authentication NO permite editar el email** de un usuario (solo Restablecer clave / Inhabilitar / Borrar — confirmado por pantallazo de Daniel). Una sola cuenta existía (`bersagliojewelry@gmail.com` = owner, uid `Ly5SQw8...`); Kary sin cuenta.
- **113.2 Seguridad verificada ANTES de tocar**: el owner se identifica por **rol/uid** (`users/{uid}.role=='owner'` → claim vía `syncRoleClaim`), NO por correo (grep en `firestore.rules` `isOwner()=getUserRole()=='owner'` + `functions/index.js` `verifyRole`; cero correo "quemado"). ⇒ cambiar el email del MISMO uid conserva el rol → **0 riesgo de lockout**.
- **113.3 Solución**: `scripts/migrate-owner-email.mjs` (Admin SDK; busca al owner por rol, valida colisión de email, `updateUser(uid,{email,emailVerified:true})` + refleja `users/{uid}.email`). Dry-run/idempotente. **Cambio de "ajuste de cuenta" → permiso explícito de Daniel** (tier ask-then-act); Claude lo corrió con su OK + dry-run mostrado primero (Daniel no corre comandos). La contraseña NO cambia.
- **113.4 Ejecutado + verificado**: dry-run (owner `Ly5SQw8...`, `bersagliojewelry@gmail.com`→`danielrome_drm@hotmail.com`, sin colisión) → `--apply`. Verificación: Auth email=`danielrome_drm@hotmail.com` (verificado=true), `users/{uid}` email actualizado + role=owner intacto + active; `bersagliojewelry@gmail.com` ahora LIBRE (para Kary, rol catálogo TODO-19). Daniel prueba login (mismo password). Reversible (re-correr con el correo viejo).
- **113.5 Doctrina / lección**: la consola Firebase no edita el email de un Auth user → usar Admin SDK `updateUser`. Cambiar el email de un usuario conserva su uid/rol/claim (la identidad es el uid, no el correo) → seguro para "renombrar" un login sin perder permisos. NO migrado aún: la cuenta Google/proyecto Firebase (IAM/billing) sigue en `bersagliojewelry@gmail.com` — se migra al FINAL del proyecto (decisión Daniel). → `41-SEGURIDAD §1.7`.
- **113.6 Adenda (mismo flujo)**: el `displayName` del owner pasó de "Bersaglio Owner" → **"Daniel Romero"** (Auth `updateUser` + `users/{uid}` merge; rol owner intacto) — el panel lo muestra al recargar Usuarios. Daniel confirmó login OK con el correo nuevo + SA key borrada. **Siguiente (sesión fresca)**: construir el rol "catálogo" de Kary — plan archivo-por-archivo en `50-ARQUITECTURA §5` (TODO-19/31).

## 2026-06-24 — §114: Cerebro — 3ª auditoría semántica Nivel-2 (skill `auditoria-cerebro`) [OPUS-4.8]

> Disparada por Daniel (nota de mantenimiento: "el cerebro acumuló 18 decisiones nuevas → toca auditoría/destilado"). Ejecución ACOTADA (`feedback_workflows_acotados`): sondas de estado/frescura/economía en directo + **1 subagente Explore read-only** (Sonda 3 retrieval-drill frío), SIN MCP/web/workflow desbocado. **Deliberación:** skill `auditoria-cerebro` (8 sondas) + retrieval-drill frío; CRUDO+tabla → bóveda `2026-06-24-auditoria-cerebro-nivel2-CRUDO.md`.

- **114.1 Causa raíz / gatillo**: 18 ADRs nuevos desde §97 (`99` 97→115 headers `##`) → boot crecido a 43.164c (vs objetivo 31.500) y 3 nodos always-on sobre cap. Auditoría Nivel-2 VENCIDA.
- **114.2 Sonda 0 (diff vs §97)**: de los 3 hallazgos previos, **HA-01 (estado git stale en `05`) REINCIDE por 3ª vez** (H-01→HA-01→hoy). HA-02/HA-03 siguen tracked (deuda kernel cars-operador). Reincidente = regresión del lazo → **meta-lección M-08**.
- **114.3 Hallazgo estrella (Sondas 1+3)**: `05` declaraba PROD = `282d58d`/PR #323, pero `git fetch` → `origin/main`=`89dd9ac`/PR #327 (Daniel mergeó #324-327 entre sesiones, L-26). El **retrieval-drill frío lo PROBÓ empíricamente**: el agente, leyendo solo el boot, entregó el hash viejo como "verificado" sin saberlo. **RCA estructural**: `05` fijaba a mano un hecho VOLÁTIL (hash/PR exacto) que se vuelve stale en cada deploy y CONTRADICE §3.3 ("nunca afirmar deploy sin `git fetch`; refs locales STALE"). El gate-git (TODO-22) nunca se construyó (es kernel/cars-operador).
- **114.4 Solución estructural (de fondo)**: `05` ya **NO fija el hash/PR de PROD**; describe el estado por CONTENIDO (qué features están live) y delega el commit exacto a `git fetch` (git = SSoT del hash). Elimina la fuente del stale dentro del alcance de bersaglio, sin tocar el kernel → mitiga parcialmente TODO-22. + **L-39 duplicada** (dos `### L-39` distintas, ambas referenciadas en `99`) → la 2ª (CMS-listas) renumerada a **L-54** + ref §83.7 actualizada.
- **114.5 Sondas restantes**: S2 frescura (`05` sello "al 2026-06-21" vs contenido §113 del 23 → re-sellado al 24). S3 ruteo 4/5 directo (0.4 saltos prom.; el único "fallo" es el dato stale, no el ruteo). S4 deliberación §108 reconstruible (SÍNTESIS+CRUDO+Gemini en bóveda) ✅. S5 SSoT memorias del harness apuntan, sin duplicar estado ✅. S6 economía: boot −4.326c (43.164→38.838); `30`(43.8k)/`00`(26k) sobre cap + `20`/`31` ≥90% → **TODO-32**. S7 adversarial: defecto L-39 (corregido) + CLAUDE.md ~1.2k sobre cap por crecimiento legítimo de gobernanza (trim seguro de prosa descriptiva; resto = canon).
- **114.6 GC pareado (masa-neta ≤ 0)**: BOOT **−4.326c** (`05` −1.450, `10` −2.592, `CLAUDE.md` −~290 trim de aforismos §3.6 + celdas descriptivas §0). Los 3 always-on quedan bajo/cerca de cap. Cumple la regla del cierre.
- **114.7 Doctrina aplicada**: §3.3 (un tablero NO debe fijar a mano un hecho verificable-por-comando) · §G.4 Autocrítica/Frescura · skill `auditoria-cerebro` (anti-score-teatro, sondas falsables) · `feedback_workflows_acotados` (1 subagente acotado). Sin cache bump (solo cerebro). `deepAudit` re-sellado (last=2026-06-24, coveredHeaderCount=116). Accionables → TODO-32 (economía) + refuerzo TODO-22.

## 2026-06-24 — §115: RBAC — rol "catálogo" de Kary (TODO-19/31a) EN PROD + 4 fixes [OPUS-4.8]

> Construcción del 1er rol granular (catálogo = Kary gestiona SOLO Piezas+Colecciones, candado en el resto). DISEÑADO en §113 (plan archivo-por-archivo `50 §5`); construido + desplegado + **verificado EN VIVO por Daniel** (Kary entra, ve y maneja Piezas+Colecciones, bloqueada del resto). Cierra TODO-19 + TODO-31a. Plan en `50 §5`.

- **115.1 Diseño**: `catalogo:0` (por DEBAJO de editor) en la jerarquía numérica → **auto-denegado en TODO** (clientes/dinero/CMS/config/users/vendedoras exigen `isEditor`/`isAdmin`/`isOwner`, que NO lo incluyen) y SOLO se le ABRE pieces/collections. Candado mínimo y robusto (el olvido futuro es "no ve", nunca "ve de más").
- **115.2 Build (núcleo, `d26a255`)**: `firestore.rules` helper `isCatalogo()` (editor+ ∪ catálogo) en pieces/collections create+update; delete = `isAdmin() || rol=='catalogo'` (editor sigue SIN delete); `usersFieldsValidos`+users-create whitelist +`catalogo`. `functions/index.js` `ROLE_LEVEL`+`catalogo:0` (`syncRoleClaim` ya lo acepta) + `createUser`/`updateUserRole` validan +catálogo. `auth.js ROLE_LEVELS` + `render-sidebar.js ROLE_RANK` + `sidebar-data.js` (Piezas/Colecciones→`role:'catalogo'`); login→`admin-piezas.html`; piezas/colecciones `requireAuth('catalogo')`. Verif: emulador **rules 196/196** + build. **+10 tests** (CRUD catálogo + CANDADO en CRM/CMS/config/users).
- **115.3 UI usuarios (TODO-31a, `dae9c63`)**: modal sin UID manual → `auth.createUser` wrapper llama la CF `createUser` (Auth+perfil, owner-only) + campo contraseña + opción Catálogo; modo ADD/EDIT (`_editingUid`).
- **115.4 Deploy + 4 FIXES (cazados EN VIVO, no por tests)**: rules+functions desplegadas (`bersagliojewelry@gmail.com`, L-33). (a) **3er mapa de rol** olvidado por el plan (`render-sidebar ROLE_RANK`) → cazado leyendo el código → **L-55(1)**. (b) **createUser 403** (`d8184d5`): callable nunca invocada → faltaba el invoker público; firebase-tools no lo re-aplica en update → **delete+recreate** → **L-56**; +mapeo de `email-already-exists` a error claro. (c) **menú no mostraba Piezas/Colecciones a catálogo** (`6d4f44d`): bug **falsy-0** (`0 || 1`=1) → `??` en vez de `||` → **L-55(2)**. (d) **parpadeo blanco** entre secciones del admin (`86e3541`): `body display:none` hasta requireAuth cruzaba la VT a un body oculto → el guard inline muestra el shell de inmediato si autenticado → **L-57**.
- **115.5 No-regresión**: editor/admin/owner SIN cambio (todos los demás matches intactos); editor sigue sin delete; pill "Catálogo" añadida en Usuarios. APP_VERSION v17→v20.
- **115.6 Verificación**: gate EMPÍRICO (§101) — Daniel en vivo: Kary crea cuenta `bersagliojewelry@gmail.com`/Catálogo, entra, ve SOLO Piezas+Colecciones, maneja ambas. (El emulador valida REGLAS, no el render del menú ni el invoker → la prueba en vivo cazó (a)(b)(c)(d); L-05.)
- **115.7 Doctrina + siguiente**: `arquitecto-software` SIEMPRE · candado server-side = la seguridad (independiente de la velocidad del cliente). **Pendiente (Decisión Fuerte, sesión nueva)**: **panel admin "tipo app"** (router falso-SPA + menú persistente + datos cacheados en memoria de sesión + nav instantánea) para la fluidez REAL sin exponer nada — diseñar con proceso (comité+externo) → `50-ARQUITECTURA` (TODO-33). Login-parpadea (TODO-31b) se subsume ahí.

## 2026-06-25 — §116: Programa de Visibilidad (TODO-35) — SSG + marca/Maps + GA4 EN PROD + GA/GSC configurado [OPUS-4.8]

> Trigger "ALTORRA CARS YA TERMINO CONTINUA". Se portó la fábrica SSG de Altorra a Bersaglio y se implementó+desplegó el grueso del paquete de visibilidad (piezas/colecciones/journal indexables, marca/Maps, GA4 con consentimiento), + configuración EN VIVO de Analytics y Search Console con la extensión de Chrome. Datos reales de Daniel (NAP/redes/horarios). Mergeado a `main` por Daniel. CRUDO/detalle → bóveda `2026-06-25-implementacion-visibilidad-SINTESIS.md` (+ research/spec `2026-06-25-*`).

- **116.1 Causa raíz / gatillo (RCA §3.3, verificada en código + curl en vivo)**: Bersaglio invisible — `noindex,nofollow` en todo el catálogo/colecciones/journal; schema solo por JS (bots sociales/IA no ejecutan JS → veían página vacía); sitemap de 3 URLs; y **GA4 MUERTO** (`initAnalytics()` nunca se llamaba → cero `gtag` en vivo).
- **116.2 Solución estructural — SSG (A1/A2a)**: `scripts/generate-pieces.mjs` hornea HTML real por ítem sobre `dist/` tras `vite build`: `/pieza/<slug>.html` (Product+Breadcrumb+OG+Twitter+`<noscript>`+`PRERENDERED`) + listados colecciones/journal (CollectionPage/Blog+noscript) + sitemap. `noindex→index` en horneadas. `js/core/urls.js` = SSoT slug→URL (9 callsites). `404.html` fallback pieza no-horneada→`?p=`. `robots.txt` invita bots-IA. Cron diario + gate `SSG_SELFTEST` en `deploy.yml`. Calca los guards probados de Altorra (REQUIRED_ANCHORS/bake-integrity/safeJsonLd/slug-dup).
- **116.3 Solución — marca/Maps (B) + GA4 (C)**: `tenant_config.json` (NAP/sameAs SSoT, vertical JewelryStore) → `@graph` JewelryStore+WebSite horneado en `index.html` + `seller` en piezas. `analytics.js`+`boot.js`: GA4 ENCENDIDO (`initAnalytics` ahora SÍ se llama) con **Consent Mode v2** cableado al `cookie-banner` (denegado por defecto → grant al aceptar; Ley 1581), ID `G-HS26X60DK3`. Bugfixes EN VIVO: "Abrir en mapas"→ficha real, iconos footer→logos marca (Simple Icons), horarios 8-19 ×7, handles IG/FB/TikTok rotos→reales (4 archivos).
- **116.4 Configuración de plataforma (Chrome · cuenta `bersagliojewelry@gmail.com` authuser=3)**: GA4 retención eventos 2m→**14m**; **GA4↔Search Console VINCULADO**; sitemap **reenviado** a GSC (5 págs). GA4 verificado vivo (dataLayer: consent default denied + config G-HS26X60DK3 + grant al aceptar; gtag cargado).
- **116.5 Anti-patterns evitados (§3)**: schema solo-JS (ahora en el build, verificable `curl+grep`) · cero-demo (geo/rating/horarios omitidos si no hay dato; NAP real) · slug inmutable · no romper API (helper aditivo; shell `pieza.html` sigue noindex; `?p=` legacy funciona) · `feedback_workflows_acotados` (implementación directa, sin workflow desbocado).
- **116.6 Archivos**: NUEVOS `scripts/generate-pieces.mjs`, `js/core/urls.js`, `tenant_config.json`. MOD `js/analytics.js`·`js/core/boot.js`·`js/core/{schema,global-defaults}.js`·`js/pages/{pieza,catalogo,carrito,lista-deseos,contacto}.js`·`js/home/{featured,social}.js`·`js/components/{cart-drawer,wishlist-drawer,search-overlay,footer}.js`·`public/{robots.txt,404.html}`·`.github/workflows/deploy.yml`·`package.json`. INTACTO `public/sw.js` (sin bump). Commits `10a26bf`…`143e29e`.
- **116.7 Doctrina + TAIL**: `arquitecto-software` SIEMPRE; SSG = schema en el build (patrón HUB Altorra). **SIN cache bump** (assets hasheados por Vite + HTML network-first; SW v30 intacto). **Pendiente**: A2b (por-categoría `/coleccion/<slug>` + por-artículo + migrar `?col=`, necesita contenido) · Eventos clave GA4 `generate_lead`/`contact` (al dispararse) · excluir tráfico interno (IP) · consolidar 2º flujo GA (Firebase) · **prompt Altorra HUB**. **META (Daniel)**: AMPLIAR skills `ga4-lead-tracking`/`search-console-setup-y-diagnostico`/`maps-gbp-local` para cubrir la CONFIG en consola + verificación-Chrome-en-vivo (no solo código) → lo hará el HUB bajo prompt, DESPUÉS de implementar todo el plan.

## 2026-06-25 — §117: Storage abre rol catálogo (Kary) para imágenes de piezas/colecciones — desacople Firestore↔Storage [OPUS-4.8]

> Daniel reportó URGENTE: "Error al subir imagen. Verifica tu conexión" al cargar fotos de pieza en `admin-piezas.html`.

- **117.1 Causa raíz (RCA verificada en reglas REALES desplegadas + user doc, no asumida)**: al crear el rol `catalogo` (§115), `firestore.rules` lo incluyó en `isCatalogo()` para pieces/collections, PERO `storage.rules` siguió con `isContentRole()=[owner,admin,editor]` (sin catálogo). Kary (`users/YDJDcv…`, `role:catalogo`, verificada vía firestore MCP) editaba la pieza (Firestore OK) pero Storage rechazaba la imagen → `storage/unauthorized`. El toast genérico "Verifica tu conexión" (`piezas.js:251`, NO loguea `error.code`) lo disfrazó de problema de red. **Desacople cross-artefacto** (contrato Firestore↔Storage divergente).
- **117.2 Solución estructural**: MIRROR de `isCatalogo()` en `storage.rules` (=`[owner,admin,editor,catalogo]`) para **pieces+collections** (create/update/delete). `assets`/CMS se quedan en `isContentRole()` (editor+, SIN catálogo) → least-privilege intacto (Kary no toca CMS, igual que en Firestore). `validImage` (size + allowlist png/jpeg/webp/avif) sin cambios.
- **117.3 No-regresión**: helpers existentes intactos; `assets` sin cambio; `validImage` igual. Reglas validadas (firebase MCP `validate_security_rules`: OK) ANTES del deploy.
- **117.4 Verificación**: reglas re-leídas DESPLEGADAS en prod (firebase MCP `get_security_rules`: `catalogo` presente en pieces/collections) + user `catalogo` confirmado (Kary Mendoza, active). PEND.: re-subida EN VIVO por Kary (sin re-login — cambió la REGLA, no su claim).
- **117.5 Anti-patterns evitados (§3)**: NO blanket-grant (catálogo NO se metió en `assets`) · NO adiviné (leí reglas reales + user doc; descarté hipótesis avif al ver que prod ya lo permitía) · deploy `--only storage` (no arrastró functions/firestore).
- **117.6 Archivos**: MOD `storage.rules` (commit `e300ff2`). Deploy MANUAL de storage (L-22). INTACTO `firestore.rules`/`functions`.
- **117.7 Doctrina + LECCIÓN reutilizable**: al **añadir/cambiar un ROL**, reflejarlo en TODOS los artefactos del contrato (`firestore.rules` ∧ `storage.rules` ∧ CFs ∧ claims) — un rol abierto en uno y cerrado en otro = "puede A pero no B" silencioso (es el "desacople de contrato cross-artefacto" que marca el consejo Gemini R2 en `15`). **Follow-up**: mejorar el toast de `piezas.js` (distinguir permisos vs red; loguear `error.code`). [HONOR]

## 2026-06-25 — §118: Ficha de pieza "Carta Gemológica" + fixes demo-críticos (TODO-34) EN PROD [OPUS-4.8]

> Daniel (2026-06-25): auditoría de la página de PIEZA antes de mostrarla al público. (Flujo W-11; CRUDO comité → bóveda.)

- **118.1 Causa raíz (verificada en `pieza.js`)**: la ficha vieja inventaba copy ("esmeralda de Cartagena" en piezas que no lo eran = mentira verificable, viola `feedback_no_demo_en_index`), mostraba specs en bloque plano sin jerarquía de alta joyería, el riel "También podría gustarte" usaba el shell legacy `?p=<slug>` (URLs sucias / contenido duplicado) y faltaba `og-image.jpg` (404 al compartir).
- **118.2 Solución estructural**: ficha **"Carta Gemológica"** dinámica (`buildSpecs` agrupa Calidad/Metal/Origen; la GEMA = hero; hide-when-empty SIN defaults inventados; escala 2→11 specs sin huecos) · `descriptionFor` cero-demo (oculta descripción de prueba/vacía) · riel relacionados con `pieceUrl` (URLs limpias `/pieza/<slug>.html`, `10a26bf`) · refinamientos de Daniel (gema quitada del cuerpo → solo grabado de fondo `emeraldGemSVG`, dorado→esmeralda, columnas armonizadas, campos = solo datos reales del admin) · `og-image.jpg` 1200×630 creado.
- **118.3 No-regresión**: `renderPieceCardHTML` único renderer intacto (L-03); shell legacy `?p=` sigue vivo (canonical → URL limpia, sin duplicado); cache **v32**.
- **118.4 Verificación**: build + tests verdes; validado LOCAL en Chrome (Daniel). Guía de handoff a Claude Design (`design_handoff_carta_gemologica`, NO mirror).
- **118.5 Anti-patterns evitados (§3)**: cero-demo (sin copy ficticio) · sin renombrar IDs/clases (§3.2) · `transform`/`opacity` only.
- **118.6 Archivos**: `js/pages/pieza.js` (ficha+recos), `js/core/urls.js` (contrato URL), `public/sw.js` (v32), asset `og-image.jpg`. Commits `[OPUS-4.8]` en `Desarrollo` → mergeados por Daniel (PR #356/#357).
- **118.7 Doctrina + lección**: en alta joyería la ficha ES producto — jerarquía curada (hero gema + grupos) > tabla plana; cero-demo es ley (mejor vacío que mentira). Las **5 piezas `zzz-prueba-*`** live ya removidas del catálogo prod (verificado 2026-06-25: colección `pieces` vacía vía firestore MCP). [HONOR]

## 2026-06-25 — §119: Grilla inteligente (Flexbox) + recomendaciones por contenido + medición GA4 (TODO-36) EN PROD [OPUS-4.8]

> Daniel (2026-06-25): la grilla dejaba una tarjeta "huérfana" fea + quería recomendaciones reales + medir. Flujo W-11 COMPLETO (comité ×4 + mockup + consejo Gemini verificado + Chrome).

- **119.1 Causa raíz**: grilla CSS `grid` de N columnas fijas → última fila con 1 huérfana (5→4+1); recomendaciones inexistentes/al azar (riesgo "relleno mentiroso"); `select_item` GA4 apuntando a `.piece-card` (clase INEXISTENTE → evento MUERTO, cazado por Gemini).
- **119.2 Solución estructural**: (a) **grilla Flexbox** SSoT `balancedCols` (`js/core/grid-balance.js`): reparte para evitar huérfana (5→3+2, 7→4+3) vía `--cols`+`justify-center`+`max-width` (centra la huérfana sola; NO grid/data-cols — cambio pedido por Gemini) en destacadas/catálogo/relacionados. (b) **Recos por CONTENIDO** (`computeRelated` en `pieza.js`): categoría=COMPUERTA, gema/metal/precio solo ORDENAN, precio ausente=neutro; si faltan afines, COMPLETA con Destacadas (curaduría real) y el título cambia a uno HONESTO ("Más de X" / "También en {gema}" / "del atelier") — nunca azar bajo título mentiroso (fallback curado = cambio de Gemini). (c) **GA4 real**: `view_item` (+`source_piece_slug` de co-vista), `view_item_list` por impresión real (IntersectionObserver), `select_item` arreglado (`.piece-card`→`[data-piece-slug]`).
- **119.3 No-regresión**: `renderPieceCardHTML` intacto; `balancedCols` cubre bordes (0/1/N grande sin huérfana); cache **v33**.
- **119.4 Verificación**: build + **25 tests** (incl. `grid-balance.test.mjs`, fija ejemplos de Daniel) + CSS live en Chrome (5→3+2 centrado, sola→460px, 8→4+4). Re-verificado en código esta sesión: `analytics.js` (select_item `[data-piece-slug]` L246, `source_piece_slug` en `trackPieceView`, view_item_list IO en `trackRelatedImpression`).
- **119.5 Anti-patterns evitados (§3)**: sin azar mentiroso (cero-demo) · sin `transition:all` · sin observer global con subtree (§3.5) · IDs/clases estables.
- **119.6 Archivos**: `js/core/grid-balance.js` (nuevo), `js/pages/pieza.js`+catálogo+featured, `js/analytics.js`, dock Colecciones hasta 7 (`e65cca5`), traductor central de errores del panel (`10ddb66`), `public/sw.js` (v33). Commits `[OPUS-4.8]` → PR #357/#358 (Daniel).
- **119.7 Doctrina + lección**: una recomendación SIN dato real es ruido — categoría como compuerta (no peso suelto) + título honesto > "relacionados" al azar. Un evento GA4 con selector inexistente es telemetría muerta: verificar el selector contra el DOM real. CRUDO comité/Gemini → bóveda. [HONOR]

## 2026-06-25 — §120: Plan Maestro de Comercio B0+B0.5 — WhatsApp directo en la ficha (frena la fuga) [OPUS-4.8]

> Arranque de TODO-37 (Plan Maestro de Comercio v3, Gemini v4 integrado). Daniel: "decide tú la parte técnica según el plan". Decisión de arquitecto: cerrar B0 + B0.5 antes del corazón B1 (mostrador) — valor entregable hoy, reversible, de-risk.

- **120.1 Causa raíz (dx del plan, verificada en código)**: en alta joyería la mayoría de piezas es "bajo consulta" (sin precio); el CTA de la ficha (`pieza.js`) caía a `/contacto.html?ref=` = formulario largo que pierde en móvil → **fuga de leads** (Plan §1/§2). GA4 no medía la intención de contacto por WhatsApp.
- **120.2 Solución estructural**: los 3 CTAs de la ficha (sin-precio primario, con-precio secundario, 404) abren **WhatsApp directo** con la pieza YA escrita (nombre + Ref. + URL canónica). Helper puro `waLink(display,text)` en `global-defaults.js` (encodea el mensaje; reusa la FUENTE ÚNICA del número `siteContent/global.contacto.whatsapp` → fallback al real, nunca href vacío). Se CONSERVA el formulario como vía secundaria (sin-precio) para no perder la captura a CRM hasta B2. Evento GA4 **`whatsapp_click`** (delegado por `[data-wa-click]`, con item_id/name/category de la pieza) = señal de LEAD canónica para marcar conversión; mapeo a Meta Pixel `Lead`.
- **120.3 No-regresión**: `asesorHref`/`/contacto.html?ref=` intacto (vía secundaria, `contacto.js` lee `ref` sin cambios); regla `contact` previa intacta (selectores distintos → sin doble conteo); `renderPieceCardHTML` intacto; cache **v34**.
- **120.4 Verificación**: build verde + **266 tests** (incl. nuevo `tests/wa-link.test.mjs` ×4) + enlace probado END-TO-END por Node (número real `573013752592`, mensaje encodeado, URL SSG canónica). Render visual NO verificable (catálogo prod vacío + preview headless L-05) → spot-check Chrome cuando Kary cargue una pieza.
- **120.5 Anti-patterns evitados (§3)**: aditivo (sin renombrar §3.2) · helper puro testeable · sin CSS nuevo (reusa `btn-aqua`) · NO se eliminó la captura a CRM (vía secundaria) · IAP previo (§3.4).
- **120.6 Archivos**: `js/core/global-defaults.js` (`waLink`), `js/pages/pieza.js` (CTAs+helpers `asesorWaText`/`asesorWaHref`), `js/analytics.js` (`whatsapp_click`+FB Lead), `public/sw.js` (v34), `tests/wa-link.test.mjs` (nuevo). Commits `[OPUS-4.8]` → **EN PROD ✅ (PR #359, Daniel mergeó en sesión)**. **Verificado EN VIVO** (emulador+seed, L-58): sin-precio→WhatsApp primario, con-precio→carrito+WhatsApp 2º, evento `whatsapp_click` con contexto de pieza, cero errores de consola.
- **120.7 Doctrina + lección**: "frena la fuga primero" — el slice de menor riesgo y mayor valor inmediato va antes del corazón. Reusar la FUENTE ÚNICA del número (anti-deriva) y dejar el evento de lead listo para que B2 capture WhatsApp→CRM. **SIGUIENTE**: B1 (entidad `pedidos` por mostrador, CF callable, stock atómico candado=pieza, caja/arqueo Cierre-Z, bruto/neto) — diseño detallado + IAP por sub-pieza. [HONOR]

## 2026-06-26 — §121: Catálogo de prueba EN PROD + decisiones del dueño (pruebas reales · Wompi · ADDI) [OPUS-4.8]

> Daniel (2026-06-26): "subamos las piezas de prueba a la web real... la idea es que TODAS las pruebas las hagamos en la web real, es la única garantía que funciona."

- **121.1 Contexto**: arranque de B1. El catálogo prod estaba vacío → no se podía probar nada en vivo (B0.5/grilla/recos/futuro B1). Daniel decide **probar en la WEB REAL** (no emulador): fase pre-lanzamiento, pocos clientes, negocio nuevo.
- **121.2 Decisión 1 — pruebas en prod**: se suben **9 piezas de prueba a producción** (`pieces`, 5 con precio + 4 bajo consulta, enlazadas a las 7 colecciones REALES de Kary: anillos/aretes/cadenas/dijes/pulseras). Excepción EXPLÍCITA a "nada demo en prod" (`[[feedback-no-demo-en-index]]`) SOLO durante esta fase pre-lanzamiento; la regla revive al lanzar de verdad. Cada pieza marcada **`seedDemo:true`** → limpieza = borrar `pieces` con ese flag.
- **121.3 Decisión 2 — Wompi/Persona**: ❌ **NO** Persona Jurídica. Se trabaja con la cuenta Wompi de **Kary (Persona Natural)** y sus topes ($2.5M/transacción, $10M/día). A las **20 transacciones** se pide aumento de cupo; **Daniel avisa** cuando lo suban para ajustar gates server-side. Topes PN = el plan por ahora.
- **121.4 Decisión 3 — ADDI**: ❄️ **CONGELADO**. Bersaglio no está registrado en ADDI; **Kary** debe vincular. Inerte hasta aviso de Daniel. No diseñar para ADDI ahora.
- **121.5 Cómo (verificado)**: ADC local = altorra (code 7 PERMISSION_DENIED sobre bersaglio, §110.3) → Admin SDK NO escribe prod. Se escribió vía **Firebase MCP** (auth `bersagliojewelry@gmail.com`). Imágenes = assets reales del repo (`/img/*-800.webp`, HTTP 200 en prod).
- **121.6 Verificación EN VIVO**: `firestore query` confirma 9 piezas en prod; `bersagliojewelry.co/colecciones.html` (Playwright) renderiza las 9 (slugs presentes), 0 errores de consola, imágenes 200 (las 3 "vacías" del screenshot = lazy below-fold, no 404). Banco de pruebas reusable en emulador = `functions/seed-piezas.mjs` (L-58).
- **121.7 Doctrina**: una regla del dueño (no-demo) admite excepción TEMPORAL explícita del dueño para su propio negocio en fase de prueba — se documenta el alcance y el cómo-revertir (flag `seedDemo`), no se borra la regla. Decisiones de pago/persona FIJADAS → no re-preguntar (`[[project-comercio-pagos]]`). [HONOR]

## 2026-06-26 — §122: B1 paso 1 — extensión de inventario en `pieces` (stockType/cantidad/gender) EN PROD [OPUS-4.8]

> Arranque de la CONSTRUCCIÓN de B1 (el mostrador) tras el diseño detallado. Daniel: "continúa conforme al plan."

- **122.1 Objetivo**: `pieces` no tenía inventario ni clasificación → el flujo pedidos/stock (B1) necesita base. Paso 1 del diseño (`2026-06-25-b1-mostrador-design.md` §1.1/§7): aditivo, sin romper.
- **122.2 Solución**: campos NUEVOS que controla Kary — `stockType` (finito|encargo), `cantidad` (int≥0), `gender` (mujer|hombre|unisex). Reglas: `pieceClassValid()` con type-check + **enum** + idiom de opcionales (`!('x' in d) || ...`), sumado a `pieceCreateValid`/`pieceTypesValid` (que NO usan hasOnly → tolerantes a merge-patch). Form admin: sección "Inventario y clasificación" (gender se OMITE vacío, como price). Seed con stockType:finito/cantidad:1.
- **122.3 Seguridad por diseño (§3.6)**: `estado`/`reservaId`/`reservaExpira` (stock TRANSACCIONAL) NO se permiten al cliente aquí A PROPÓSITO — los escribe SOLO la CF del pedido (Admin SDK, ignora reglas); su candado CF-only se diseña en el paso del pedido (evita que un operador des-venda manipulando `estado`).
- **122.4 No-regresión**: piezas legacy sin los campos → `!('x' in d)` pasa; patch-merge (solo images) intacto (test). 196→**201 tests de reglas** verdes.
- **122.5 Verificación**: 201/201 rules (emulador) + build verde + **deploy a prod** (`firebase deploy --only firestore:rules`, compiló OK) + read-back: `pieceClassValid` confirmado VIVO en reglas desplegadas (firebase MCP, §3.3/§117).
- **122.6 Archivos**: `firestore.rules`, `tests/firestore-rules.test.mjs`, `admin-piezas.html`, `js/admin/piezas.js`, `functions/seed-piezas.mjs`. Reglas DESPLEGADAS (L-22); el form va a prod con el merge de Daniel (sitio = GitHub Pages). Commit `17a2851`.
- **122.7 Doctrina + siguiente**: extender un modelo = aditivo + idiom de opcionales + validar **enum** (no campo libre) por seguridad; separar el dato que controla el HUMANO (clasificación) del dato TRANSACCIONAL (stock = CF-only). **SIGUIENTE B1 paso 2**: CF `cotizacionRapida` (preview server-side sin mutar) → paso 3 `crearPedido` (stock atómico candado=pieza). [HONOR]

## 2026-06-26 — §123: 3 correcciones de Daniel — form flotante en ficha, 9 destacadas, orden contacto [OPUS-4.8]

> Daniel 2026-06-26 tras revisar la web pública con las 9 piezas de prueba.

- **123.1 Correcciones**: (1) **"Prefiero dejar mis datos" navegaba a `/contacto.html`** → el lead se perdía (el cliente caía en una página ajena, perdía el hilo de la pieza). FIX: form FLOTANTE (modal) en la MISMA ficha, con la pieza ENLAZADA, guarda vía `saveInquiry`→`inquiries` (MISMO destino que contacto); optimista (éxito ya + Firestore en background) + GA4 `generate_lead`; cierra backdrop/Escape/X (`pieza.js` + `css/pieza.css`). (2) **Home mostraba solo 6 destacadas** (slice 6) aunque había 9 → ahora hasta **9** (`featured.js`: getFeatured(9)+slice(0,9)); guard en el admin (`piezas.js`): destacar una **10ª** se bloquea con mensaje (ya hay 9, quita una). (3) **Contacto**: los 3 canales (WhatsApp/correo/IG) iban ENCIMA del form → ahora **DEBAJO** (`contacto.js` `renderAll`: form primero).
- **123.2 No-regresión**: `saveInquiry` reusado (no se duplica la captura); `asesorHref` (link a contacto) ELIMINADO de la ficha (sin uso → anti código muerto §3.4); el modal usa `mount()` (idiom seguro, no `innerHTML` directo — lo cazó el hook de seguridad). Cache **v35**.
- **123.3 Verificación EN VIVO** (dev+emulador): modal abre + pieza enlazada ("Te contactamos por {pieza}") + campos nombre/tel/email/mensaje + submit→éxito + `saveInquiry` sin error; 9 destacadas (refreshFeatured monta 9); form arriba de canales (y=521 < y=1631). Screenshot del modal BLOQUEADO por **L-05** (backdrop-filter → timeout del renderer); verificación FUNCIONAL por código (preview_eval).
- **123.4 Gotcha de DEV (NO es bug de prod)**: en dev+emulador, `data.load()` resuelve el 1er snapshot ANTES de que `data.onChange(refresh)` se suscriba (`home.js`/`pieza.js`) → la sección queda en skeleton/vacío y el watchdog no actúa si `isReady=true`. En PROD la latencia de red evita la carrera (Daniel ve contenido = renderiza). Para VERIFICAR en dev: forzar un refresh (toggle wishlist / llamar `refreshFeatured`). → L-58. Robustez futura posible: refrescar 1× tras suscribir si data ya está lista (fuera de scope; bajo riesgo en prod).
- **123.5 Archivos**: `js/pages/pieza.js`, `css/pieza.css`, `js/pages/contacto.js`, `js/home/featured.js`, `js/admin/piezas.js`, `public/sw.js` (v35). Commit `adb7369`. Va a prod con el merge de Daniel (sitio = GitHub Pages).
- **123.6 Doctrina**: capturar el lead DONDE está la intención (en la ficha, no mandándolo a otra página = fuga); un tope de UI (9 destacadas) se hace visible en el render Y se protege en el ORIGEN (guard en el save, no solo en el render). [HONOR]

## 2026-06-26 — §124: B1 paso 2 — calculadora de precio por peso (valor-gramo = input, no config) [OPUS-4.8]

> Daniel 2026-06-26: "eso varía, la idea es que dentro de la calculadora esté el espacio para colocar el valor del gramo y el peso."

- **124.1 Corrección de diseño**: el plan original (B1 §1.4/§3.3) guardaba `valorGramo` en `config/precios` (owner-only) y la CF lo leía server-side (no exponer margen). Daniel: el precio del oro **VARÍA** → el valor del gramo es un **INPUT que Kary ingresa al momento** (junto al peso), NO config fija. Simplifica: ya no hay secreto server-side que proteger → la cotización es CLIENT-SIDE.
- **124.2 Solución (paso 2 de B1)**: `js/admin/calculadora.js` — función PURA `calcularPrecio({valorGramo,peso,manoObra})` = `peso×gramo+mano` (enteros COP, redondeo al final) + `initCalculadora` (modal). Modal en la topbar de Piezas (botón "🧮 Calculadora"): Kary ingresa valor del gramo de hoy + peso + mano de obra → ve oro/mano/total en vivo + copiar total. Reusa el patrón `.adm-modal` (sin CSS de modal nuevo); vive en Piezas (Kary ya accede como 'catalogo' → sin nueva página/RBAC).
- **124.3 No-regresión / seguridad**: la integridad del dinero NO se pierde — la recomputación server-side de la MISMA fórmula se mantiene en `crearPedido` (paso 3), donde la CF recalcula con los insumos de Kary y congela el snapshot inmutable (§1.5). `config/precios` con valor-gramo queda SIN uso (futuro opcional: último valor usado como auto-llenado, no árbitro).
- **124.4 Verificación**: `calcularPrecio` unit-testeado (**6 tests**: caso real, decimales, solo-mano, inválidos→0, strings) + build verde. UI admin (modal) NO verificable en dev (el panel exige login Firebase; no levanté el emulador de Auth, solo Firestore) → se verifica al entrar al panel (post-merge); lógica + build verdes.
- **124.5 Archivos**: `js/admin/calculadora.js` (nuevo), `admin-piezas.html` (botón+modal), `js/admin/piezas.js` (init), `css/admin.css` (estilos), `js/admin/sidebar-data.js` (APP_VERSION v21), `public/sw.js` (v36), `tests/calculadora.test.mjs` (nuevo). Commit `79e7c61`. Va a prod con el merge de Daniel.
- **124.6 Doctrina**: un dato que VARÍA (precio del oro) es INPUT operativo, no config almacenada; escuchar al dueño SIMPLIFICA (menos máquina = menos riesgo, §3.6); la integridad del dinero se garantiza en el ÚNICO escritor (la CF del pedido), no en el preview. **SIGUIENTE B1 paso 3**: `crearPedido` CF (entidad `pedidos`, stock atómico candado=pieza, recompute server-side + snapshot inmutable). [HONOR]

## 2026-06-26 — §125: B1 paso 3 (backend) — el pedido: `crearPedido` CF + candado de stock atómico [OPUS-4.8]

> Daniel: "CONTINUA". El corazón del mostrador: registrar una venta de forma SEGURA (dinero + stock).

- **125.1 Solución (backend del pedido)**: `crearPedido` = ÚNICO escritor de `pedidos`. Núcleo en `functions/pedidos-core.js` (SIN auth/firebase-functions → testeable contra emulador): `runTransaction` sobre el doc de la pieza = **CANDADO atómico** (imposible doble venta aunque dos cajas registren a la vez); total **RECALCULADO server-side** (precio fijo, o peso×gramo+mano — espejo de `calcularPrecio`; NO confía en el total del cliente); **snapshot INMUTABLE** (`desglose`); **correlativo atómico** (`contadores/pedidos` en la MISMA tx); **IDEMPOTENTE** por `pedidoId` (UUID del cliente → reintento no duplica el cobro). Wrapper `functions/pedidos.js` (onCall): auth rol {owner,admin,catálogo} + mapea `PedidoError`→`HttpsError`.
- **125.2 Seguridad (candado CF-only)**: reglas — `pieceStockLocked` (estado/reservaId/reservaExpira = cliente-DENY; el `merge:true` del admin PRESERVA el valor que pone la CF, hallazgo §122/§124-build) + match `pedidos` (read solo ventas, create/update/delete:false) + `contadores` (deny-all). El ESTADO DE VENTA solo lo escribe la CF (Admin SDK, ignora reglas) → nadie des-vende ni cambia precios por fuera.
- **125.3 Verificación**: reglas **206/206** en emulador LIMPIO (los fallos de acuerdos del 1er intento = estado sucio del emulador viejo de toda la sesión, NO las reglas — confirmado al re-correr limpio). Integración **6/6** (`functions/pedidos.integration.test.mjs`): **doble-venta BLOQUEADA**, idempotencia (mismo pedidoId no duplica), total por-peso + precio-fijo, correlativo, efectivo→pagado/transferencia→por-verificar. Reglas DESPLEGADAS a prod (manual L-22; compiló+released OK).
- **125.4 Pendiente (paso 3 NO cerrado del todo)**: (a) el **POS UI** que llama a `crearPedido` (Kary registra la venta) — sin construir; (b) **deploy de la CF** (`firebase deploy --only functions`) — RETENIDO a propósito (inerte sin UI; se despliega CON el POS para verificar en vivo — código de dinero = deploy deliberado). MVP actual = UNA pieza, mostrador; multi-item/`pagos` 1..N/VOID/merma = increments siguientes (diseño §1-§3).
- **125.5 Archivos**: `functions/pedidos-core.js` + `pedidos.js` + `pedidos.integration.test.mjs` (nuevos), `functions/index.js` (export `crearPedido`), `firestore.rules`, `tests/firestore-rules.test.mjs`. Commit `e6ab0a1`. CF SIN desplegar (reglas SÍ).
- **125.6 Doctrina + lección**: el candado de concurrencia = UN doc (la pieza) en `runTransaction` (no una colección de reservas aparte); el dinero se recalcula en el ÚNICO escritor server-side (el cliente solo manda insumos); **extraer el NÚCLEO de una CF sin firebase-functions/auth la hace testeable end-to-end** (patrón para las CFs siguientes: registrarPago/anularPedido/cierreCaja). **SIGUIENTE**: POS UI + deploy CF + verificación en vivo. [HONOR]

## 2026-06-26 — §126: B1 paso 3 (UI) — POS "Mostrador" + deploy de la CF `crearPedido` [OPUS-4.8]

> Daniel 2026-06-26: "continúa con el POS de B1". Eligió construcción **DIRECTA** (reusa el panel; sin mockup — arquitectura ya convergida + design system aprobado; AskUserQuestion).

- **126.1 Solución (la cara del mostrador)**: `admin-pos.html` ("Mostrador", grupo Ventas del menú, `role:catalogo` → Kary lo ve) + `js/admin/pos.js` (vista) + `js/pedidos-service.js` (transporte AISLADO: callable `crearPedido` + lectura `ultimasVentas`; reusable por web/WhatsApp, §3.6 cero monolitos). Flujo: buscar/elegir pieza disponible (`estado≠vendida`) → precio (FIJO si la pieza trae `price`, o POR PESO con `calcularPrecio` REUSADO de §124) → medio de pago (efectivo→pagado / otro→por verificar) → confirmar → `crearPedido`. UUID de idempotencia por venta (`crypto.randomUUID`); "Ventas recientes" lee `pedidos` (staff). Reusa el design system admin — NO pantalla nueva de cero.
- **126.2 Regla de oro del dinero (la UI ESPEJA a la CF)**: muestra EXACTO lo que cobra el servidor — `isPrecioFijo` (pieza con `price` numérico) → total = price y se OCULTA el por-peso (la CF ignora peso/gramo ahí, confirmado por el test "precio FIJO"); si no → `peso×gramo+mano`. Nunca un total visible ≠ total cobrado (el peor bug de dinero). `price:0` → avisa (la CF rechaza total≤0) en vez de dejar registrar y fallar.
- **126.3 No-regresión / seguridad**: CF/núcleo/reglas de §125 INTACTOS (solo se exporta+despliega). Render con `esc()` en TODA interpolación (L-03/F6; el hook de seguridad lo exigió). El menú ESPEJA al permiso server-side: Kary ve Mostrador porque la CF la autoriza (owner/admin/catálogo) — no amplía su alcance arbitrariamente. Errores de negocio de la CF (p.ej. "Esa pieza ya fue vendida.") se muestran tal cual; el resto vía `errorMessage`.
- **126.4 Verificación**: build VERDE (chunk `admin-pos` emitido). **6/6 integración CF** re-corridos en emulador limpio (doble-venta BLOQUEADA · idempotencia · por-peso · precio-fijo ignora peso · sin-total rechaza · transferencia→por-verificar). **CF `crearPedido` DESPLEGADA a prod** (`firebase deploy --only functions:crearPedido` → "Successful create operation", Node 22 2nd Gen, us-central1). Verificación EN VIVO (Kary registra venta de pieza `seedDemo`) PENDIENTE del merge de Daniel a `main` (sitio = Pages; la UI no está en prod hasta el merge). L-05: el panel exige login Firebase → no verificable en preview headless.
- **126.5 Archivos**: `admin-pos.html` + `js/admin/pos.js` + `js/pedidos-service.js` (nuevos); `js/admin/sidebar-data.js` (ítem Mostrador + APP_VERSION v22), `public/sw.js` (v37), `css/admin.css` (estilos POS). Commit `02ab6a7` (código). CF ya en prod; la página va a prod con el merge de Daniel.
- **126.6 Caveat (follow-up → TODO-38)**: el campo `price` del form de Piezas está rotulado "Precio USD" pero la CF lo cobra como **COP enteros** (`total = entero(piece.price)`). Para la mayoría de piezas (alta joyería = "Consultar precio", sin `price` numérico) el camino es POR PESO y no aplica; pero una pieza con `price` numérico se cobraría como COP. Aclarar la unidad del precio fijo (USD vs COP) = tarea aparte (no bloquea el POS — el POS muestra el valor para que Kary lo VEA antes de confirmar).
- **126.7 Doctrina**: la UI de dinero ESPEJA al único escritor (server) en vez de duplicar su lógica; un total visible ≠ cobrado es el peor bug. El menú por rol ESPEJA al permiso del backend (no lo define). Aislar transporte (servicio) de vista para reuso multicanal. **SIGUIENTE B1 paso 4**: `registrarPago` 1..N + comprobante "por verificar"≠"pagado". [HONOR]

## 2026-06-26 — §127: Todo en COP — rótulo de precio "USD"→"pesos" (cero dólares en la web) [OPUS-4.8]

> Daniel 2026-06-26 (tras el merge de §126): "TODO debe cobrarse en pesos colombianos, nada de dólares en la web."

- **127.1 Hallazgo (NO era bug de cobro)**: el cobro SIEMPRE fue en COP — `format$` (`js/core/format.js`) usa `toLocaleString('es-CO')` en TODA la web pública (ficha/catálogo/home/carrito/wishlist/buscador); la CF `crearPedido` cobra `entero(price)` en pesos; el POS muestra `cop()`. El ÚNICO punto equivocado era el RÓTULO del form de Piezas (`admin-piezas.html`): decía "Precio USD" → engañoso para Kary (podía creer que ingresaba dólares). El número guardado en `price` siempre se interpretó como pesos.
- **127.2 Fix**: rótulo → "Precio en pesos (COP)" + `<small>` "siempre en pesos colombianos (nunca dólares); vacío = por peso / Consultar precio". Único archivo con "USD" en la web/panel (grep: el resto = `skills/`/`docs/`/`_legacy/` + `.usdz` = formato de modelo 3D, no moneda). Cache v38 + APP_VERSION v23.
- **127.3 Verificación**: build verde; `grep -i "USD|dólar|dollar"` sin más hits en código de la web pública/panel. `format$` (es-CO) confirma que el público ya veía COP.
- **127.4 Doctrina (regla del dueño)**: **Bersaglio = 100% COP; cero dólares en la web**. Un rótulo de moneda equivocado es deuda de confianza aunque el cobro sea correcto (Daniel: "datos exactos como las matemáticas"). Cierra TODO-38. [HONOR]

## 2026-06-26 — §128: B1 paso 4a — confirmar pago ("vi la plata"): por_verificar → pagado [OPUS-4.8]

> Daniel: "TODO MERGEADO CONTINUA". Mitad SIN ambigüedad del paso 4; la otra mitad (abonos/apartados) queda como decisión (TODO-39).

- **128.1 Problema**: `crearPedido` deja las ventas no-efectivo en `pago_por_verificar`, pero NO había forma de marcarlas pagadas → faltaba el gate SoD "no se despacha sin ver la plata".
- **128.2 Solución**: CF `confirmarPago` (núcleo `confirmarPagoCore` en `pedidos-core.js`, testeable): `runTransaction` `pago_por_verificar`→`pagado` + `confirmadoPor`/`confirmadoEn`; IDEMPOTENTE (re-confirmar = no-op `yaEstaba`); rechaza inexistente / estado no-confirmable. SOLO la CF flipea el estado (reglas `pedidos` update:false → ya desplegadas, sin cambio). Wrapper onCall (`rolDeVentas` owner/admin/catálogo) + export en `index.js`. UI: botón "Confirmar pago" en las ventas "por verificar" de "Ventas recientes" (`pos.js`) → `confirmarPago` callable (`pedidos-service.js`) → admConfirm "¿ya viste el pago?".
- **128.3 Verificación**: build verde + **9/9 integración** (6 crearPedido + 3 confirmarPago: confirma·idempotente·inexistente). **CF DESPLEGADA a prod** (`firebase deploy --only functions:confirmarPago` → Successful create, Node 22). Cache v39 + APP_VERSION v24. Commit `ba6da22`. Verif. en vivo tras merge Daniel.
- **128.4 Decisión PENDIENTE (paso 4b — abonos/apartados → TODO-39)**: si Kary aparta piezas (anticipo + saldo) en el mostrador, ese saldo = CARTERA (deuda del cliente) y la cartera YA existe (`clientes/{id}.saldoActual` vía movimientos factura/abono). Un sistema de pagos paralelo en el pedido DUPLICARÍA la cartera. Fork (§8 de la spec): preguntar a Daniel si el mostrador necesita apartados ahora + reusar cartera vs pagos-en-pedido.
- **128.5 Doctrina**: el estado de dinero (`pagado`) lo flipea SOLO el servidor, nunca el cliente (SoD); confirmar es idempotente (doble clic no rompe). NO duplicar un sistema que ya existe (cartera) — integrar, no reconstruir. **SIGUIENTE**: decisión apartados (4b) → VOID + arqueo (paso 5). [HONOR]
