# Migración a la web pública — Guía de mirror perfecto

> **Para Claude (trabajando dentro del repo `bersagliojewelry.github.io`).**
> Este documento describe **exactamente** todos los cambios de diseño, copy e interacción
> que se hicieron en el _UI kit_ de este Design System (`ui_kits/storefront/`) y cómo
> portarlos 1:1 a la web pública. El objetivo es un **mirror perfecto**.

---

## 0. Lo más importante antes de empezar

### Las dos arquitecturas
| | UI kit (este Design System) | Web pública (`bersagliojewelry.github.io`) |
|---|---|---|
| Render | React 18 + Babel inline (JSX en `.jsx`) | **Vanilla JS** con template literals `html\`…\`` + ES modules (`import`) |
| Datos | estáticos en `data.jsx` | **dinámicos desde Firestore** (`data.getFeatured()`, `data.onChange()`) |
| Estilos | `css/*.css` (mirror de producción) + **`css/kit.css`** (todo lo nuevo) | `css/*.css` |
| Imágenes | `assets/…webp/png` | `/img/…` con `<picture>` AVIF/WebP responsive |

**No copies JSX tal cual.** Porta cada componente JSX a una función `renderXxx()` que
devuelve `html\`…\``, siguiendo el patrón que ya existe en `js/pages/*.js`.

### La gran ventaja: **las clases CSS ya coinciden**
El kit fue construido como _mirror_ usando los **mismos nombres de clase de producción**
(`home-hero`, `home-featured`, `bj-header-pill`, `abt-*`, `ct-*`, `hj-*`, etc.).
Por eso, **casi todo el CSS nuevo se copia directo**. La estrategia recomendada:

> Crear **`css/enhancements.css`** en producción, pegar ahí los bloques nuevos de
> `ui_kits/storefront/css/kit.css`, y **cargarlo de ÚLTIMO** (después de todos los demás
> CSS) para que sus overrides ganen. Ajustar rutas de imagen `../../assets/…` → `/img/…`.

⚠️ **No copies** de `kit.css`: el bloque `@font-face` (producción ya autohospeda fuentes),
ni las reglas con prefijo legacy **`.k-*`** del home (producción usa `.home-*`, `.at-*`,
`.hj-*` — ver §3). Sí copia todo lo demás (motion, header morph, dock, reseñas, spacing).

### Tokens de movimiento (añadir a `:root` si no existen)
```css
--ease-glass:   cubic-bezier(0.2, 0.9, 0.2, 1);
--ease-elastic: cubic-bezier(0.175, 0.885, 0.32, 1.05);
--ease-drawer:  cubic-bezier(0.32, 0.72, 0, 1);
--press-scale:  0.96;
```

### Assets nuevos a copiar a `/img/` (o `/public/img/`)
| Archivo en el kit | Uso | Sugerencia de nombre en prod |
|---|---|---|
| `assets/gema.png` | Joya central flotante de la sección Atelier del home | `/img/gema.png` |
| `assets/emerald-gem.png` | Gema dentro de la “isla dinámica”/dock Atajos | `/img/emerald-gem.png` |
| `assets/cart-gems.png` | Ilustración del **carrito vacío** | `/img/cart-gems.png` |

---

## 1. Estándares de diseño aplicados (aplican a TODAS las páginas)

1. **Ritmo vertical estandarizado.** Espacio uniforme entre secciones:
   - **Home:** `padding: 46px 0` por sección (más denso).
   - **Nosotros / Contacto:** `margin-bottom: 72px` (o `padding` equivalente) uniforme.
   - **Regla del footer:** la ÚLTIMA sección de cada página debe tener `margin-bottom: 0`
     y dejar que el `padding-bottom` de la página (≈72px) sea el único espacio al footer.
     (Antes se duplicaba a ~144px.)
2. **Escala tipográfica reducida** (editorial, no gigante). Ver valores exactos por página en §4 y §5.
3. **SVG finos de marca**, nunca emoji. Logos reales para redes (ver §6).
4. **Sin afirmaciones inventadas** en copy (áreas, cargos, convenios, renders 3D). Ver §7.

---

## 2. HOME (`js/pages/home.js` + `css/home.css`)

### 2.1 Capa de movimiento (motion layer)
Copiar de `kit.css` el bloque **“MOTION LAYER”**:
- `.reveal` / `.reveal.in` / `.reveal-soft` — fade-up escalonado.
  - En el kit usamos polling con `requestAnimationFrame`/scroll por una limitación del
    iframe de preview. **En producción usa `IntersectionObserver`** (más eficiente):
    al entrar el elemento, añade `.in`. Respeta `prefers-reduced-motion` (ya está en el CSS).
- Entrada del hero (`heroUp` con delays escalonados en eyebrow→título→lead→botón→firma).
- `.btn-aqua-emerald::after` — barrido de brillo (shimmer) en el botón primario.
- **Count-up** de las estadísticas del editorial (anima de 0 al número al entrar en viewport).
- **Parallax 3D del hero al mover el mouse: DESACTIVADO** por decisión del cliente.
  El hero queda **estático**. Conserva la animación de entrada y los demás efectos.
  → En `home.js`, el handler `pointermove`/`data-tilt` del hero debe quedar **deshabilitado**.

### 2.2 Header “Dynamic Island” (afecta `js/core/shell` + `css/components.css`)
Copiar el bloque **“HEADER scroll morph”** de `kit.css`:
- Arriba del todo: `.bj-header-pill:not(.is-scrolled)` → `transform: scale(1.03)` (aireado).
- Al hacer scroll: `.bj-header-pill.is-scrolled` → `scale(0.9)`, padding compacto, más blur,
  el subtítulo “Jewelry” (`.bj-header-sub`) se desvanece, los nav-pills se compactan.
- ⚠️ La clase `is-scrolled` va sobre **`.bj-header-pill`** (el pill), no sobre el contenedor.
  El JS que ya alterna el estado de scroll del header debe togglear esa clase en el pill.

### 2.3 Header — acciones (heart + carrito)
En el header (shell):
- **Añadir botón de Favoritos** (corazón) **entre** el botón Buscar y el del Carrito.
  Lleva su propio **badge** numérico (igual que el carrito) con el conteo de la wishlist.
  Navega a `lista-deseos`.
- **Cambiar el ícono del carrito** de bolsa/tienda a **carrito de compras** (Lucide `shopping-cart`):
  `<path d="M6 2l-2 5v15h16V7l-2-5H6z"/>` → reemplazar por el carrito:
  ```
  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  ```

### 2.4 Sección Atelier — joya central (rediseño)
La sección “El viaje / Curaduría del Atelier” se rediseñó (clases `.at-*` en producción,
en el kit es la escena con la joya). Copiar de `kit.css` el bloque **“ATELIER — process scene”**
(`.k-at-*` en el kit → renómbralas al prefijo que use producción, p.ej. `.at-stage`, etc.):
- **Sin números** grandes de paso.
- **Joya `gema.png` flotante** en el centro con halo dorado-verde + anillo punteado girando
  lento (`atSpin`) + leve levitación.
- **4 tarjetas** acercadas hacia el centro (no pegadas a las esquinas: ~60px arriba/abajo,
  ~70px a los lados) con líneas/relación al centro.
- El grid de **Piezas destacadas** muestra **6 tarjetas** (antes 4): `PRODUCTS.slice(0, 6)`
  → en producción `getFeatured()` limitado a **6**.

### 2.5 Secciones NUEVAS del home (construir en `home.js`)
Se agregaron **dos secciones nuevas, debajo del Journal** (datos en `data.jsx`, port a Firestore/bundle):

**A) Bersaglio Films** (galería multimedia / video):
- Video destacado 16:9 + grid de 4 tarjetas con botón play, duración y categoría.
- Lightbox al hacer click. Datos: `FILMS = [{ title, cat, dur, poster, src? }]`.
- CSS: bloque `.home-films` / `films-*` (copiar de `kit.css` y de `Sections.jsx`).

**B) Lo último en nuestras redes** (feed social):
- Grid de tarjetas (Instagram / Facebook / TikTok) con thumb, caption, stat (likes/views) y fecha.
- Tabs por red. **Sin** la nota “Feed sincronizado vía Meta Graph API…” (se eliminó).
- **Logos de marca reales** (ver §6), no íconos genéricos.
- Datos: `SOCIAL = [{ platform, thumb, caption, stat, kind, date, type }]`.
- _Viabilidad real:_ se puede automatizar con Instagram Basic Display / Meta Graph API y
  TikTok Display API (cachear miniaturas server-side cada X horas).

### 2.6 Dock flotante “Atajos” (isla dinámica de agua) — NUEVO
Componente fijo abajo-centro (`Overlays.jsx` → `QuickDock`). Copiar el bloque **“QUICK DOCK”**
completo de `kit.css` + el filtro SVG gooey (`#qd-goo`) que va en el DOM.
Comportamiento:
- **Isla pill de agua** (104×30px) fija, ancha y baja, **arrastrable** (clic sostenido), con
  flotación sutil. Dentro: **mar de esmeralda + oro** con olas SVG animadas (el oro = aire arriba,
  la esmeralda = mar abajo), recortado al pill (`overflow:hidden`, sin desbordes), nítido/saturado.
  Lleva la **gema `emerald-gem.png`** centrada con glow pulsante.
- Etiqueta **“ATAJOS”** pequeña encima (mono, sin reflejo blanco encima del texto).
- **Hover:** la isla saca un **pico pequeño** de agua hacia arriba (tensión superficial) + aparece
  un **borde bold verde esmeralda** resaltándola. (NO mover toda la imagen ni seguir el cursor.)
- **Click:** abre una **franja glass de herramientas** (toolbar premium, muy translúcida,
  blur 40 / saturate 200, rim iridiscente) con accesos (WhatsApp, etc.). Se **cierra al click afuera**
  (sin botón X). La franja también es arrastrable por su grab-handle.

### 2.7 Footer (`css/components.css` + shell)
- **Quitar** de las columnas los enlaces Términos/Privacidad (en columna “Servicio” quedan
  Contacto, Asesoría, Envíos, Garantía).
- **Quitar** el texto “Certificado JA · Jewelers of America”.
- **Añadir** una línea legal pequeña y discreta junto al copyright, alineada a la derecha:
  **Términos · Cookies · Privacidad** (gris tenue, hover esmeralda). Copiar `.bj-footer-legal*` de `kit.css`.

### 2.8 Carrito vacío
Estado vacío del drawer del carrito: usar la ilustración **`cart-gems.png`** (≈140px, drop-shadow
esmeralda) en lugar del ícono de corazón.

### 2.9 CTA final del home
- Título “Casa San Agustín” ⟶ **“Nuestra Maison”** (evita confusión con el hotel homónimo).
- Lead reescrito (sin “a puerta cerrada”).
- Añadir **dirección real** en mono pequeño:
  `Calle 36 # 6-32 · San Agustín Chiquita / Centro Histórico · Bolívar, Colombia`.

### 2.10 Iconos de servicios (sección “Una experiencia a la altura…”)
Reemplazar por SVG finos correctos (estilo Lucide):
- Diseño a medida → **pen-tool** (pluma + gema).
- Asesoría privada → **users** (dos personas).
- Certificación GIA → **roseta/sello con check** (badge), no un simple ✓.
- Garantía vitalicia → **escudo con check**.

### 2.11 Marquee y spacing
- La cinta de credenciales bajo el hero: `margin-top: 10px` (antes negativo, la cortaba).
- Spacing uniforme del home: copiar el bloque **“UNIFORM rhythm”** de `kit.css`
  (todas las secciones `padding: 46px 0`).

---

## 3. Nota sobre clases legacy `.k-*` (NO portar)
El home del kit conserva en `kit.css` reglas con prefijo **`.k-*`** (`.k-hero`, `.k-marquee`,
`.k-section`, `.k-cats`, `.k-grid`, `.k-card`, `.k-editorial`, `.k-jr-*`, etc.) de una versión
anterior. **Producción ya usa las clases definitivas** (`home-hero`, `home-featured`,
`home-editorial`, `hj-*`…). **Ignora las `.k-*`** salvo las del **dock (`.qd-*`)** y la
**escena Atelier (`.k-at-*`)**, que sí son funcionalidad nueva (renómbralas al prefijo de prod si aplica).

---

## 4. NOSOTROS (`js/pages/nosotros.js` + `css/nosotros.css`)

### 4.1 Escala tipográfica (reducir)
| Elemento | Antes | Ahora |
|---|---|---|
| `.abt-hero-title` | `clamp(56px,7.5vw,120px)` | `clamp(40px,4.6vw,68px)` |
| `.abt-section-title` | `clamp(36px,4.5vw,60px)` | `clamp(26px,3vw,40px)` |
| `.abt-manifiesto-title` | `clamp(32px,4.5vw,64px)` | `clamp(24px,3.2vw,42px)` |
| `.abt-stat-num` | `clamp(40px,4.5vw,64px)` | `clamp(32px,3.4vw,48px)` |
| `.abt-timeline-year` | `clamp(64px,7vw,96px)` | `clamp(46px,4.8vw,68px)` |
| `.abt-timeline-title` | 32px | 26px |
| `.atl-text-title` | 42px | 30px |
| `.cert-title` | 38px | 28px |
| `.abt-cta-title` | `clamp(36px,4.5vw,56px)` | `clamp(28px,3vw,42px)` |
| (hero-lead 19→16, hero-italic 16→15, timeline-desc 17→15, val/team/press/faq −2px) | | |

### 4.2 Espaciado uniforme
Todos los `margin-bottom: 110px` → **`72px`**. `.abt-page` padding `120/120` → `108/72`.

### 4.3 Eliminar subtítulos (eyebrows) obvios
Quitar estos `mono abt-eyebrow`: **“EL MANIFIESTO”**, **“RECORRIDO”**, **“EL TALLER”**,
**“PREGUNTAS FRECUENTES”**, **“LAS MANOS”**. (Conservar los editoriales con valor:
“Nuestros principios”, “Nos han escrito”→ahora reseñas, etc.)

### 4.4 Timeline “Trece años en cinco capítulos”
Las 5 pestañas deben caber en **una sola fila** (no scroll horizontal que corta la 5ª, ni huérfana):
`.abt-timeline-tabs { display:flex; gap:6px; }` (sin `overflow-x:auto`) +
`.abt-timeline-tab { flex:1 1 0; min-width:0; padding:10px 12px; font-size:11.5px;
white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-align:center; }`.
En `max-width:860px` → `flex-wrap:wrap`.

### 4.5 Sección “Prensa” → **Reseñas de clientes (Google Maps)**
Reemplazar “En la prensa / NOS HAN ESCRITO” por testimonios:
- Eyebrow **“EN SUS PALABRAS”** + título **“Historias que nos confiaron”**.
- Grid 2×2 de tarjetas glass: **5 estrellas doradas** (SVG), reseña en serif itálica,
  **nombre del cliente** y fuente **“Reseña en Google Maps”**.
- CSS: bloque `.resena-*` de `kit.css`. Datos: `RESEÑAS = [{ n, t, loc }]`.
  **Sustituir por reseñas reales de Google Maps** cuando el cliente las entregue.

### 4.6 Copy corregido (find → replace en el bundle/datos)
- **Valor #01** (duplicaba “sofisticación”):
  > … sino como un susurro de distinción. Una joya Bersaglio es **la expresión poética de tu estilo y de tu esencia.**
- **Atelier “Donde el oficio toma forma”** (reescrito, sin 200m² ni cargos inventados):
  > P1: *En el corazón del Centro Histórico de Cartagena tenemos nuestra casa: un espacio **abierto al público** donde te recibimos con calma y una atención cálida y personalizada. Aquí se conversa, se diseña y se crea — porque en Bersaglio no revendemos: fabricamos cada pieza.*
  > P2: ***Kary y su equipo** acompañan cada paso: desde la primera conversación y el boceto a mano, hasta dar vida a la joya y entregarla firmada. Un proceso cercano, sin prisas y hecho a la medida de tu historia.*
- **UBICACIÓN** (dirección completa): `Cartagena de Indias / Calle 36 # 6-32 / San Agustín Chiquita · Centro Histórico / Bolívar, Colombia`.
- **VISITAS**: **“Con o sin cita previa”** + `Lun–Sáb · 10:00–19:00` (antes “Solo con cita”).

---

## 5. CONTACTO (`js/pages/contacto.js` + `css/contacto.css`)

### 5.1 Escala tipográfica
| Elemento | Antes | Ahora |
|---|---|---|
| `.ct-hero-title` | `clamp(56px,7vw,110px)` | `clamp(40px,4.6vw,66px)` |
| `.ct-success-title` | 32px | 26px |
| `.ct-proceso-title` | `clamp(28px,3.4vw,44px)` | `clamp(24px,2.9vw,38px)` |
| `.ct-faq-title` | `clamp(28px,3.5vw,42px)` | `clamp(24px,2.8vw,36px)` |
| `.ct-respuesta-num` | 48px | 40px |
| (hero-lead 18→16, canal-title 18→16, atelier-title 24→20, proceso-stepname 20→18) | | |

### 5.2 Espaciado
Todos los `margin: 0 auto 110px` / `margin-bottom: 110px/120px` → **72px**.
`.ct-page` padding-top → **132px** (para separar “CONSERJERÍA PRIVADA” del header).
**Última sección** `.ct-faq-section { margin-bottom: 0; }` (evita el doble espacio al footer).

### 5.3 Canales
- **Eliminar** el canal **Teléfono `+57 (5) 660 1234`** (no existe). Quedan 3: WhatsApp, Correo, Instagram.
- `.ct-canales { grid-template-columns: repeat(3, 1fr); }`.

### 5.4 SVG mejorados (toda la sección)
- **WhatsApp** (canal): logo **oficial** de WhatsApp (no burbuja de texto). Path en `Pages.jsx`.
- **Instagram** (canal): **glifo de marca** (cámara), no el cuadrito genérico.
- **Banner “Cita Privada”**: emoji ☕ → **SVG de taza** (Lucide coffee) en caja glass esmeralda.
- **Banner “Llamada”**: emoji ☎ → **SVG de teléfono** en caja glass dorada.
  CSS: `.ct-banner-icon` pasa de `font-size:32px` a caja 44×44 glass con `color` por variante
  (`--visit` emerald, `--call` gold). Copiar de `kit.css`/`contacto.css`.
- **Mapa del atelier**: cuadrícula de calles refinada + río sutil + manzanas + pin dorado “Atelier”.

### 5.5 Proceso “Después de que nos escribes”
- **Alinear las píldoras de tiempo** al fondo de cada columna:
  `.ct-proceso-step { display:flex; flex-direction:column; height:100%; }` +
  `.ct-proceso-time { margin-top:auto; align-self:flex-start; }`.
- **Paso 01**: “…leído directamente por **Kary Mendoza y su equipo**.” (sin “gemólogo experto”).
- **Paso 04**: título **“Manos a la Obra”**, copy **sin promesa de renders 3D**:
  > *Si decides que Bersaglio sea el custodio de tu legado, damos vida a tu pieza paso a paso: del primer boceto a mano alzada hasta la creación final en nuestro taller, siempre con tu aprobación.* (tiempo: “A medida”).

### 5.6 Sección “Antes de tu visita” (FAQ) — rediseño
Antes era 2 columnas (mucho espacio en blanco a la izquierda). Ahora:
- **Encabezado centrado** arriba (eyebrow “ANTES DE TU VISITA” + título “Lo que necesitas saber”
  + lead + botón “Preguntar por WhatsApp” con `white-space:nowrap`).
- **Las 4 FAQs en grid 2×2** de tarjetas glass (`.ct-faq-grid` + `.ct-faq-card`, copiar de `kit.css`).

### 5.7 Copy de FAQ corregido
- **¿Necesito cita previa?** → *No es obligatoria: puedes acercarte directamente o reservar una cita para una atención más dedicada. Ambas son bienvenidas.*
- **¿Hay parqueadero?** → *En el Centro Histórico encuentras varios parqueaderos privados y seguros a pocos pasos del atelier.* (sin convenio inventado.)
- **¿Atienden en otro idioma?** → *Español e inglés. Francés e italiano con cita previa, informándolo al agendar.*

---

## 6. Iconografía / logos de marca (SVG)
- **Redes sociales** (feed del home + canales de contacto): usar **glifos de marca reales**
  (Instagram cámara, Facebook “f”, TikTok nota, WhatsApp logo oficial). Los paths exactos están
  en `ui_kits/storefront/Sections.jsx` (`PlatformIcon`) y `Pages.jsx` (`CT_CANAL_ICON`).
- **Resto de UI**: íconos de línea finos estilo **Lucide** (stroke 1.6–2). **Nunca emoji.**

---

## 7. Reglas de copy (recordatorio de marca)
- Español es-CO, “tú”, “nosotros” para la casa. **Sin emoji.**
- **No afirmar** datos que no se conocen: áreas (m²), cargos del equipo, convenios, renders 3D.
- El atelier es **abierto al público** y **fabricante** (no reventa); atención con o sin cita.
- Precios en COP (`$ 14.800.000`). Oro = acento, nunca relleno grande.

---

## 8. Checklist de migración
- [ ] Crear `css/enhancements.css`, pegar bloques nuevos de `kit.css`, cargarlo de último.
- [ ] Añadir tokens de motion a `:root` (si faltan).
- [ ] Copiar `gema.png`, `emerald-gem.png`, `cart-gems.png` a `/img/`. Ajustar rutas en el CSS.
- [ ] Home: header morph + heart con badge + ícono carrito; atelier con `gema.png` (6 destacadas);
      secciones Films y Redes; dock “Atajos”; footer legal; carrito vacío; CTA Maison + dirección;
      íconos de servicios; marquee +10px; spacing 46px; **parallax hero desactivado**;
      reveals con IntersectionObserver; count-up; shimmer del botón.
- [ ] Nosotros: escala tipográfica; spacing 72px; quitar eyebrows obvios; timeline 1 fila;
      Prensa→Reseñas (Google Maps); 4 correcciones de copy.
- [ ] Contacto: escala tipográfica; spacing 72px (+ última sección `margin-bottom:0`);
      quitar teléfono; SVG (WhatsApp/Instagram/banners/mapa); proceso alineado + copy pasos 01/04;
      FAQ rediseñada 2×2 + 3 correcciones de copy; hero `padding-top:132px`.
- [ ] Verificar `prefers-reduced-motion` en todas las animaciones nuevas.
- [ ] Sustituir reseñas de ejemplo por reseñas reales de Google Maps.
- [ ] Conectar Films/Redes a su fuente real (Firestore / Meta Graph API / TikTok Display API).

---

## 9. Mapa de archivos del kit (de dónde sacar cada cosa)
| Necesitas… | Archivo del kit |
|---|---|
| Todo el CSS nuevo (motion, header, dock, atelier, reseñas, spacing) | `ui_kits/storefront/css/kit.css` |
| Markup/lógica del Home (hero, atelier, films, social) | `Screens.jsx`, `Sections.jsx` |
| Markup/lógica de Nosotros y Contacto | `Pages.jsx` |
| Dock “Atajos” + filtro gooey + overlays | `Overlays.jsx` |
| Header, footer, drawer carrito, logos/íconos | `Shell.jsx` |
| Datos de ejemplo (productos, films, social, reseñas, FAQ, proceso) | `data.jsx`, `Pages.jsx` |
| App wiring + orden de carga de CSS | `index.html` |
| CSS por página (mirror de prod ya editado) | `css/{home,nosotros,contacto,…}.css` |

> Para fidelidad de pixel: lee el archivo del kit indicado y **lifta valores exactos**
> (hex/oklch, radios, paddings, easings). Las clases ya coinciden con producción.
