# Spec — Fase 1: Mirror del rediseño (Home · Nosotros · Contacto)

> **Programa "Nuevo Bersaglio".** Este es el sub-proyecto 1 de 3 (Diseño → Hardening → CRM).
> Estado: aprobado por el cliente (enfoque "pulir+endurecer", CSS in-place, diseño primero).
> Fecha: 2026-06-05 · Branch de trabajo: `Desarrollo` (merge a `main` solo a pedido).

---

## 1. Contexto y fuentes de verdad

El sitio actual YA es el resultado del "recambio total" (PLAN-NOVO ejecutado): vanilla ESM
modular, SEO-shells + router SPA, Firestore en vivo, imágenes optimizadas, PWA. Esta fase
**no reconstruye**: aplica con fidelidad de pixel el rediseño nuevo sobre esa base.

**Fuentes de verdad (locales; el live link de Claude Design expiró — 404):**
- `Bersaglio Jewelry Design System/design_handoff_bersaglio_redesign/MIGRACION.md` — changelog exhaustivo por página (valores exactos).
- `.../design_handoff_bersaglio_redesign/kit.css` + `css-reference/*.css` — CSS nuevo verbatim.
- `.../design_handoff_bersaglio_redesign/components/*.jsx` — markup/SVG/datos de referencia (NO portar JSX; portar a `html\`\``).
- `Bersaglio Jewelry Design System/CAPTURAS/1..38.png` — verdad visual (mapa en §8).
- Extracciones exactas (CSS + markup/SVG/datos) ya realizadas y disponibles en la sesión.

---

## 2. Decisiones de arquitectura (vinculantes en esta fase)

1. **CSS in-place, no override-layer.** Se editan los CSS modulares de origen
   (`css/home.css`, `nosotros.css`, `contacto.css`, `components.css`, tokens en `liquid-glass.css`).
   NO se crea `enhancements.css`. Una sola fuente de verdad por página (sin capa-sombra).
2. **Modularización de `home.js`.** `js/pages/home.js` (644 líneas) se parte en `js/home/*.js`
   (un módulo por sección); `home.js` queda como compositor que importa y ordena. Vanilla ESM,
   mejor ramificado. Se hace **al tocar cada sección** para el rediseño (no en pasada aparte).
3. **Reveals con IntersectionObserver.** Nueva utilidad `js/core/reveal.js` (IO + `prefers-reduced-motion`).
   Reemplaza el polling rAF del kit. Observa `.reveal`/`.reveal-soft`, añade `.in` al entrar.
4. **Parallax del hero: DESACTIVADO.** Se neutraliza el handler `pointermove`/`data-tilt` en el
   hero; se conserva la animación de entrada (`heroUp`), shimmer y demás efectos.
5. **Assets en `public/img/`** (servidos en `/img/`). `gema.png` ya existe; copiar
   `emerald-gem.png` y `cart-gems.png`. Toda ruta `../../assets/…` del kit → `/img/…`.
6. **Datos nuevos: hardcoded ahora, Firestore-ready.** `FILMS`, `SOCIAL`, `RESEÑAS` viven en
   `js/data/*` con forma lista para Firestore (Fase 2 del CRM podrá migrarlos). Lo ya dinámico
   (piezas, colecciones, consultas) se mantiene 100% conectado a Firestore — no se toca el cableado.
7. **Sin regresión de API.** No se renombran IDs/clases/funciones exportadas/endpoints existentes.
   Cambios aditivos; `renderPieceCardHTML` sigue siendo el único renderer de tarjetas.
8. **Accesibilidad y motion.** `prefers-reduced-motion` en TODA animación nueva; foco visible
   intacto; SVGs decorativos con `aria-hidden`; el dock arrastrable con labels/aria.
9. **Cache bump.** Tras cambiar shell estático/comportamiento: `public/sw.js` `bersaglio-v6` → `v7`,
   reflejar en `docs/05-ESTADO-GLOBAL.md` (CLAUDE.md §4).

---

## 3. Alcance Fase 1

**Incluye:** estándares globales (tokens motion, motion layer, header morph, footer legal),
Home (índice) completo, Nosotros, Contacto. Más el componente global **QuickDock "Atajos"**.

**NO incluye (fases siguientes):** seguridad/escalabilidad (Fase 2), CRM/facturación/inventario
(Fase 3), conexión real de Reseñas/Films/Redes (TODOs, §7). Catálogo/Pieza/Carrito/Journal no
cambian en esta fase salvo el shell global (header/footer/dock) que es transversal.

---

## 4. Inventario de cambios

### 4.1 Global (todas las páginas)
- **Tokens motion** en `:root` (`liquid-glass.css`): `--ease-glass`, `--ease-elastic`, `--ease-drawer`, `--press-scale`. (Hoy NO existen — prioridad 1, muchos bloques dependen de ellos.)
- **Motion layer**: `.reveal/.reveal.in/.reveal-soft`, entrada hero `heroUp` escalonada, shimmer `.btn-aqua-emerald::after`, guards `prefers-reduced-motion`.
- **Header "Dynamic Island"**: `.bj-header-pill:not(.is-scrolled)` scale 1.03; `.is-scrolled` scale 0.9 + padding/blur compactos + `.bj-header-sub` fade + nav compacto. (JS ya togglea `is-scrolled` en el pill.)
- **Header acciones**: añadir botón Favoritos (corazón + badge wishlist) entre Buscar y Carrito → navega `lista-deseos`; cambiar ícono carrito a `shopping-cart` (paths exactos extraídos).
- **Footer**: línea legal (Términos · Cookies · Privacidad) — `.bj-footer-legal*` ya existe en prod; verificar markup. Quitar Términos/Privacidad de columnas + "Certificado JA".

### 4.2 Home (`js/pages/home.js` → `js/home/*` + `css/home.css`)
- **Spacing uniforme** 46px (override de 100–120px). Marquee `margin-top: 10px`.
- **Atelier redesign**: `gema.png` flotante + halo + anillo punteado girando (`atSpin`) + 4 cards "pulled-in" (corner-0..3) + líneas SVG `.at-flow`. 6 destacadas (`getFeatured()` slice 6).
- **Sección NUEVA "Bersaglio Films"** (`.home-films`): feature 16:9 + grid lateral + lightbox. Datos `FILMS` (8 items extraídos).
- **Sección NUEVA "Lo último en nuestras redes"** (`.home-social`): tabs por red + grid 8 cards + logos de marca (IG/FB/TikTok SVG exactos). Sin nota "Meta Graph API".
- **QuickDock "Atajos"** (`js/components/quick-dock.js` + `.qd-*`): isla de agua arrastrable + olas SVG + filtro gooey `#qd-goo` en DOM + toolbar glass (Buscar/WhatsApp/Cita/Favoritos/Arriba). Cierra al click afuera.
- **Carrito vacío**: ilustración `cart-gems.png`.
- **CTA "Nuestra Maison"** + dirección real mono.
- **Íconos servicios** (Lucide multi-path: pen-tool, users, GIA badge, shield-check).
- **Parallax OFF**; reveals IO; count-up de stats; shimmer del botón primario.

### 4.3 Nosotros (`js/pages/nosotros.js` + `css/nosotros.css`)
- Escala tipográfica reducida (tabla MIGRACION §4.1, valores exactos extraídos).
- Spacing 110→72px; `.abt-page` 120/120 → 108/72.
- Quitar eyebrows obvios (MANIFIESTO/RECORRIDO/EL TALLER/FAQ/LAS MANOS).
- Timeline en **1 fila** (`flex:1 1 0; min-width:0; ellipsis`; wrap ≤860px).
- **Prensa → Reseñas (Google Maps)**: grid 2×2 `.resena-*`, estrellas doradas SVG, 4 reseñas (datos extraídos). Eyebrow "EN SUS PALABRAS" + "Historias que nos confiaron".
- Correcciones de copy verbatim (valor #01, atelier, ubicación, visitas).

### 4.4 Contacto (`js/pages/contacto.js` + `css/contacto.css`)
- Escala tipográfica reducida (MIGRACION §5.1).
- Spacing →72px; `.ct-page` padding-top **132px**; última sección `.ct-faq-section { margin-bottom:0 }`.
- Quitar canal **Teléfono** (3 canales: WhatsApp/Correo/Instagram); `.ct-canales` 3-col.
- SVGs: WhatsApp oficial, Instagram glifo, banner café (coffee), banner llamada (phone) en cajas glass (`--visit` emerald / `--call` gold); mapa refinado.
- Proceso: columnas full-height, time pill al fondo (`margin-top:auto`); copy pasos 01/04.
- **FAQ 2×2** (`.ct-faq-grid`/`.ct-faq-card`) con header centrado + CTA WhatsApp; 4 FAQs (datos extraídos).

---

## 5. Archivos: nuevos / modificados

**Nuevos:**
- `js/core/reveal.js` — utilidad IntersectionObserver.
- `js/home/{hero,marquee,categories,featured,editorial,services,atelier,journal,films,social,cta}.js` — secciones extraídas (nombres exactos al implementar).
- `js/components/quick-dock.js` — dock "Atajos".
- `js/data/home-media.js` (FILMS + SOCIAL) · `js/data/resenas.js` (RESEÑAS). (O consolidado; decidir al implementar, anti-fragmentación.)
- `public/img/emerald-gem.png`, `public/img/cart-gems.png` (copiados del handoff).

**Modificados:**
- `css/liquid-glass.css` (tokens motion + reveal), `css/home.css`, `css/nosotros.css`, `css/contacto.css`, `css/components.css`.
- `js/pages/home.js` (→ compositor), `js/pages/nosotros.js`, `js/pages/contacto.js`.
- `js/components/header.js` (heart+badge, ícono carrito, morph hooks), `js/components/footer.js` (legal).
- `js/core/boot.js` (montar QuickDock + inicializar reveals).
- `public/sw.js` (cache bump v6→v7) + `docs/05-ESTADO-GLOBAL.md`.

---

## 6. Orden de ejecución (incrementos verificables)

Cada incremento termina con `npm run build` OK + diff resumido + (si posible) screenshot.

1. **Foundation global**: copiar 2 assets; tokens motion en `:root`; `.reveal` CSS; `js/core/reveal.js` + wire en `boot.js`.
2. **Shell global**: header morph (CSS) + heart/badge + ícono carrito (`header.js`); footer legal.
3. **Home A — estructura**: modularizar `home.js` → `js/home/*` (sin cambio visual; verificar idéntico); spacing 46px; parallax OFF; reveals + count-up + shimmer; marquee +10px; íconos servicios; CTA Maison; carrito vacío.
4. **Home B — Atelier redesign** (`gema.png`, atSpin, flow, 4 corners, 6 destacadas).
5. **Home C — secciones nuevas**: Films + Social (datos + logos) + lightbox/tabs.
6. **Home D — QuickDock "Atajos"** (`quick-dock.js` + `.qd-*` + `#qd-goo`).
7. **Nosotros** (tipografía, spacing, eyebrows, timeline 1 fila, Reseñas, copy).
8. **Contacto** (tipografía, spacing, canales, SVGs, proceso, FAQ 2×2, copy).
9. **Cierre**: cache bump v7; `prefers-reduced-motion` audit; responsive 320/480/768/920/1280/1600; `05` actualizado; TODOs (§7) visibles.

**DoD por página:** pixel-match vs CAPTURAS; Firestore intacto (destacadas/categorías en vivo);
responsive OK; `prefers-reduced-motion` OK; build verde; sin regresión de clases/IDs.

---

## 7. TODOs de contenido real (marcados visibles)
- **Reseñas**: sustituir 4 ejemplos por reseñas reales de **Google Maps** (Places API / export).
- **Films**: conectar a fuente real (Firestore `films/` o Storage / YouTube / Vimeo).
- **Redes**: feed real vía **Meta Graph API** (IG/FB) + **TikTok Display API**, cacheado server-side.
Cada uno queda como comentario `TODO:` en el módulo de datos + nota en `10-MEMORIA-CORTO-PLAZO`.

---

## 8. Mapa de CAPTURAS (verdad visual)
Home: 1–15 (hero, categorías, destacadas, editorial, servicios, atelier 7–10, **Films 11**,
**Redes 12–14**, Maison/CTA 15). Global: 16 footer, **17–18 dock Atajos**, 19–20 wishlist.
Catálogo: 21–22. Nosotros: 23 hero, 24 stats, 25–26 valores, 27–28 timeline, **29 equipo**,
**30–31 reseñas**. Contacto: 32–33 + 38 FAQ, 34 canales, 35 form, 36 envíos, 37 proceso 2×2.
> La copia autoritativa es el JSX/datos extraídos (no el OCR de las capturas). Las capturas
> mandan en layout/espaciado/jerarquía visual.

---

## 9. No-regresión, riesgos, rollback
- **No-regresión**: IDs/clases/funciones/endpoints intactos; `renderPieceCardHTML` único; build OK; admin/Firebase/firestore-service NO se tocan.
- **Riesgos**: (a) modularizar `home.js` puede romper el orden de secciones → mitigar verificando render idéntico antes de aplicar deltas; (b) QuickDock gooey/drag es complejo → aislar en su módulo + `prefers-reduced-motion`; (c) cache stale → bump v7 + Ctrl+Shift+R.
- **Rollback**: trabajo en `Desarrollo`; cada incremento es un punto de commit (a pedido). Revert por incremento.

---

## 10. Consolidación al cerebro (al cerrar la fase)
ADR en `99-HISTORIAL` + fila en `00-INDICE`; lecciones a `30`; actualizar `20-ESPACIAL` (nuevas
secciones/dock/`js/home/*`); `05` (cache v7 + flag riesgos seguridad detectados); cerrar TODOs en `10`.
