# CMS — Edición visual WYSIWYG (preview en vivo): viabilidad + diseño

> **Origen**: petición de Daniel (2026-06-15) — esperaba que cada sección editable tuviera
> **previsualización de cómo aparece en la web, y que la previsualización fuera editable**
> (mover piezas/botones/textos), "como un Canva con Photoshop sobre lo que ya tenemos". Pidió
> evaluarlo con comité + consejo externo; si no es viable, NO hacerlo y en su lugar mejorar la
> facilidad para un no-técnico.
>
> **Deliberación**: comité ×3 + red-team (12 agentes) — workflow `wf_0c0cbdab-f05`. CRUDO →
> bóveda `bersaglio/research-archive/2026-06-15-comite-wysiwyg-CRUDO.json`. Verificado contra
> código real (hero.js `heroInner`/`refreshHero`, singleton-admin-core `data-sf`/`collectSingleton`,
> html.js `escape`/`mount`). **Consejo externo (Gemini) PENDIENTE** → 3 preguntas al pie (relay
> en el próximo chat). **[OPUS-4.8 interino]**.

---

## 1 · ¿Viable el "Canva/Photoshop" (lienzo libre)? — **NO**

Un lienzo libre real (arrastrar/redimensionar/colocar cualquier cosa donde sea) **no es viable** aquí:
1. **Wix/Canva tienen servidor propio** que dibuja la página al vuelo; Bersaglio es **estático** (GitHub Pages) → replicar Canva = construir un motor de layout/coordenadas/responsive/undo desde cero = el monstruo que 1 ingeniero no mantiene (es lo que el comité previo ya recortó 10×).
2. **Rompería la marca** "Liquid Glass" (su valor es que nadie la puede desalinear).
3. **Riesgo de seguridad en repo público**: el lienzo mete contenido sin la forma controlada (`escape`/`safeUrl`) → abre inyección.

**Pero lo que Daniel realmente describe NO es "diseñar libre" — es "ver exactamente qué edito y cómo queda, enseguida, y tocarlo donde está".** Eso **SÍ es viable, barato y seguro**, y es como lo hacen Shopify/Sanity **sin** lienzo libre.

## 2 · Recomendación: **Vista en vivo + clic-para-editar (split view)**

> Pantalla partida: **izquierda** el formulario que Kary ya conoce; **derecha** la sección REAL de la web (su CSS/marca de verdad) que se **actualiza al instante** mientras escribe. **Clic en el preview → salta al campo** correspondiente (y cursor en campo → resalta el bloque).

Da el **80-90% de la sensación "Photoshop" con el 10-20% del costo/riesgo**. Es **aditivo** (no reemplaza nada).

- **SÍ podrá Kary**: editar textos/enlaces/imágenes de los campos existentes · verlo al instante con la marca real · clic-para-editar bidireccional · descartar antes de publicar · (futuro) elegir entre 2-3 presets aprobados.
- **NO podrá** (la baranda ES el producto): arrastrar/mover/redimensionar · crear secciones/HTML libre · escribir "encima" con `contentEditable`. *"Mover" ≠ "editar": para un no-técnico, mover da miedo y desorden, no poder.*

## 3 · Cómo se construye sobre lo que YA existe (clave: de "meses" a "días")

El motor ya tiene las dos mitades correctas:
- **Renderer puro por sección** (`heroInner(c)` → HTML real de la web) → el preview **reusa el MISMO renderer** = fidelidad de marca total y gratis.
- **Campos ya etiquetados** (`data-sf="seccion.campo"` + `collectSingleton`) → conectar preview↔campo (clic-para-editar) es casi gratis.
- Ya existen el re-pintado por sección (`refreshHero`) y el filtro anti-XSS (`escape`/`safeUrl`).

**Mecánica**: Kary teclea → recolecta borrador → merge con DEFAULTS → re-pinta SOLO esa sección en el panel derecho. Todo en memoria hasta "Publicar". **Mismo filtro de seguridad → cero superficie de ataque nueva.**

**Riesgos y barandas**:
- **Seguridad (repo público)**: el preview pasa por el MISMO `escape`/`safeUrl`. **Gate mecánico obligatorio**: test que inyecte `<img onerror=...>` en un campo y verifique que el preview lo escapa.
- **`contentEditable`**: **RECHAZADO** (pegar/Enter inyecta HTML; el clic-para-editar ya cubre el 90% sin el riesgo).
- **Marca**: el layout NO es editable, solo el contenido → imposible "dejarlo feo".
- **Costo**: reusa renderers/filtros existentes, sin doble fuente de verdad, sin librerías → el ingeniero no hereda un motor.
- **⚠️ "Ver en móvil" puede ser humo**: el responsive mira el ancho de la *pantalla*, no del `<div>`. Cambiar el ancho de un div puede NO disparar el modo móvil real → fase posterior (iframe o container-queries), NO en el MVP.

**Nota técnica** ⚠️ **REVISADA 2026-06-15 (ver Adenda al pie)**: el MVP usa **iframe `srcdoc`**, NO `<div>`. La premisa original (abajo) —«panel y web comparten CSS»— resultó **FALSA**: `admin-contenido.html` solo carga `admin.css`, así que un `<div>` exigiría inyectar el CSS público en el panel = **bleed inverso** que contamina el panel de trabajo. *Nota original (superada): montar el preview en un `<div>` namespaceado, NO iframe en el MVP (el iframe no hereda el CSS hasheado por Vite); el iframe solo si aparece colisión real de estilos.*

## 4 · Faseo (cada fase entrega valor sola)

| Fase | Entrega | Esfuerzo |
|---|---|---|
| **F1 — Vista en vivo (MVP)** | Split: formulario + render real que se actualiza al teclear. Solo **Home/hero** (ya instrumentado). Botón Descartar. | **S (días)** — 80% de la sensación |
| **F2 — Clic-para-editar** | Clic en preview → enfoca campo; cursor en campo → resalta bloque. Microcopy + primer-uso ("Toca cualquier texto para editarlo"). | **M** — aquí Daniel "siente Photoshop" |
| **F3 — Barandas de confianza** | Aviso al salir con cambios sin publicar · "Publicado ✓" · deshacer por campo. | **S** |
| **F4 — Presets + ver en móvil** | 2-3 layouts aprobados por sección; toggle móvil (si se resuelve el responsive). **Solo si Kary lo pide tras F1-F3.** | **M (opcional)** |

**MVP = F1 sobre Home (días).** **Validación obligatoria antes de F3/F4**: mostrarle F1+F2 a Daniel en vivo para confirmar que ESTO es su "Photoshop" antes de invertir en lo opcional.

## 5 · Qué NO hacer (descartado por el comité)
- Lienzo libre / drag-drop de bloques (reabre el monstruo vetado 10×).
- `contentEditable` (inyección desproporcionada en repo público).
- ~~iframe + postMessage~~ → **REVERTIDO 2026-06-15 (ver Adenda)**: SÍ se adopta iframe-`srcdoc` en F1 (la página del preview NO carga el CSS público; fidelidad pixel + "ver en móvil" lo justifican).
- Prometer F1-F2 para TODAS las páginas hoy: **solo Home está instrumentado**; cada sección necesita preparar su renderer igual primero → es trabajo por sección, no "gratis una vez". (Decirlo para no crear expectativa falsa.)

---

## Para el consejo externo (Gemini) — 3 preguntas (anti-anclaje, relay en el próximo chat)

1. **Sitio estático + repo público**: para un CMS por formularios sobre un sitio 100% estático (GitHub Pages) mantenido por **un solo ingeniero**, cuyas piezas de UI son funciones puras que generan HTML como string y cuya única defensa anti-XSS es escapado por-campo en el render — ¿cuál es el enfoque de edición visual WYSIWYG inline con mejor relación valor/riesgo, y cuáles son los modos de fallo no obvios que típicamente subestima un equipo pequeño al construirlo?
2. **Reusar el render real para el preview**: si el preview en vivo se construye reutilizando exactamente el mismo código que pinta la web pública (mismo escapado, mismo merge de datos), montado en un `<div>` del panel admin en lugar de un iframe aislado — ¿qué riesgos concretos de seguridad o de fuga/colisión de estilos introduce el `<div>` compartido frente al iframe `srcdoc`, y bajo qué condiciones el iframe deja de ser sobreingeniería y se vuelve necesario?
3. **WYSIWYG sin lienzo, para usuario no técnico**: dado que el objetivo es la *sensación* de edición visual directa (ver y tocar sobre el render real) y NO libertad de diseño, ¿qué patrones de interacción concretos —más allá de preview en vivo y clic-para-editar bidireccional— maximizan la confianza de un editor no técnico sobre un layout blindado, y qué evidencia existe de que añadir "presets de layout" mejora o, por el contrario, confunde la experiencia?

---

**Síntesis ejecutable**: Daniel obtiene su "Photoshop" honesto (ver + tocar lo correcto + deshacer, sobre su render con su marca); Kary edita sin miedo y sin poder romper nada; el repo público conserva intacta su única defensa anti-XSS; el ingeniero no hereda ningún motor. El comité anterior tenía razón en cerrar el lienzo — **esto no lo reabre, lo vuelve innecesario.** Encaja como evolución de P1/P2 (singleton-admin ya construido); el preview reusa los renderers públicos por sección.

---

## ADENDA 2026-06-15 — Consejo externo Gemini integrado + reversión a iframe

> Síntesis completa + CRUDO → bóveda `2026-06-15-consejo-gemini-wysiwyg-SINTESIS.md` (workflow `wf_85aa13c5-a27`, 6 ag. grounded en código). Peer review §15: adopté lo correcto, refuté con razón. **[OPUS-4.8]**.

**Gemini CONFIRMA la dirección** (split + clic-para-editar, sin lienzo/`contentEditable`). De sus 6 críticas: **2 ya resueltas** en código (escapado por-contexto: `safe-url.js`), **3 adoptadas**, **1 (iframe) revierte mi veredicto**.

### Cambio de decisión: **iframe-`srcdoc` desde F1** (antes: `<div>`)
Hechos VERIFICADOS que tumbaron el "div" del comité previo:
1. `admin-contenido.html` carga **solo `admin.css`** (NO `home.css`/`components.css`) → un `<div>` obliga a inyectar el CSS público en el panel = **bleed inverso** (contamina el panel CRM/Panel v2) + reset de aislamiento frágil.
2. iframe-`srcdoc` da documento limpio; referencia el MISMO CSS público por `<link>` (como `index.html`) → sin fricción de Vite-hash.
3. El preview **no necesita JS público** (parallax off; animaciones de entrada no aplican) → iframe limpio, sin bootstrappear GSAP/Lenis.
4. **Fidelidad = propósito del MVP** (Daniel valida "esto es mi Photoshop"); corrimientos cosméticos en SU hero corromperían la validación.
5. **F4 "ver en móvil"** exige viewport real → el `<div>` era callejón.
Confianza ~65-70%, **reversible** (si hay FOUC por `<link>`s en cada repintado o el hero dependiera de JS público → volver a `<div>`). **Refuto el "Game Over" de Gemini**: el iframe se adopta por fidelidad/costo, NO por seguridad (editor único de confianza; el vector real estaba FUERA del preview ↓).

### Otros puntos de Gemini adoptados
- **Límites de caracteres** por campo + contador visual (calibrar a dónde rompe cada layout) → F1/F3. *Tipografía de lujo: el aire es parte del diseño.*
- **DOM-trashing** (innerHTML en cada tecla): NO aplica a F1 (foco en el form, preview pasivo); en **F2** sí (listeners en el preview) → **delegación de eventos** + **debounce** del repintado.
- **Presets**: solo si el **schema de datos es idéntico** entre variantes (tema/orden); si añaden/quitan campos → bloques distintos, no "variante mágica" → regla para F4.

### Hallazgo de seguridad (auditoría) — **ARREGLADO**
`js/admin/colecciones.js:53`: `bannerUrl` editable iba a `<a href="${esc(...)}">` con solo `esc()`, **sin `safeUrl()`** → stored-XSS de contexto admin al clic "Ver banner" (la web pública sí lo saneaba). Fix: `esc(safeUrl(...))` + `rel="noopener noreferrer"` (href L53 + img L180). **Deuda latente**: `categories.js:28,32` interpola `--cat-hue`/`object-position` en `style=` (contexto CSS sin cobertura) — inocuo hoy (hue/pos no editables); validar numérico/allow-list antes de exponerlos.

### F1 — definición actualizada
Split: form (izq) + **iframe-`srcdoc`** (der) que re-pinta la sección Home/hero al teclear (debounce), con `<link>` al CSS público; botón Descartar; límites de caracteres. Sigue siendo **días**. Validación obligatoria con Daniel antes de F2+.

---

## ESTADO F1 (2026-06-17) — construido + verificado headless; PENDIENTE fidelidad visual con Daniel

**Construido y verificado headless (sin login), en `Desarrollo`** — commits `909c58c`·`8e075fc`·`fdfaeb3`·`7eccf8c`·`d74ad9f`·`217f426`·`cb14c71`·`2326483`·`cbf0e20`·`f0c7911`:
- Preview en vivo **Home + Contacto** (split formulario|iframe; debounce 180ms) · **límites de caracteres** + contador (42 Home, 32 Contacto) · **Deshacer guardado** (undo 1 nivel) + **Descartar** (genéricos en singleton-admin).
- **Mapa de archivos**: `js/admin/live-preview.js` (iframe `sandbox="allow-scripts allow-same-origin"` — same-origin OBLIGATORIO o el viewport colapsa a 0, ver bug 3; lee los `<link>` de la página vía `cssFrom`; normaliza preload+noscript; monta por `createContextualFragment`+postMessage) · `home-preview.js`/`contacto-preview.js` (reusan renderers PUROS: `heroInner/editorialInner/atelierInner/ctaInner` de `js/home/*`; `contactoHeroSection/ProcesoSection/FaqSection` de `js/pages/contacto.js`) · `singleton-admin.js` (split opt-in por `descriptor.preview={render,cssFrom}` + updateCounter + undo) · `singleton-admin-core.js` (maxlength+contador) · `contenido-tabs.js` (descriptores).

**Bugs de fidelidad del smoke de Daniel (2026-06-17), CORREGIDOS**:
1. **Layout roto en Contacto** (`cb14c71`): CSS **modular por página** (`index.html`→`home.css`, `contacto.html`→`contacto.css`); el preview cargaba siempre el de `/`. Fix: `cssFrom` por descriptor (Home `/`, Contacto `/contacto.html`).
2. **Fondo oscuro** (`2326483`): el srcdoc forzaba `body{background:--bj-ink-emerald}` que pisaba el real `body{background:--bj-pearl}` (liquid-glass.css:98). Fix: quitar el override → el CSS de la página decide.
3. **🔴 CAUSA RAÍZ DOMINANTE — viewport colapsado a 0px** (`f0c7911`, reporte Daniel "no se ve para nada igual"). RCA con **experimento controlado en Chromium** (preview server en vivo): un `srcdoc` con `sandbox="allow-scripts"` SIN `allow-same-origin` queda en **origen opaco** → su `window.innerWidth` interno = **0**. El CSS cargaba y los colores/fuentes aplicaban (engañoso), PERO todo el layout (`.container` max-width, `100vw`, flex/grid, media-queries) se computaba contra **0px de ancho** → todas las secciones aplastadas. Control: misma config sin sandbox → innerWidth 600; con `allow-same-origin` → innerWidth 820. **Fix**: `sandbox="allow-scripts allow-same-origin"`. **Verificado E2E con el módulo real + HTML/CSS reales**: viewport 0→816, hero `0×0`→`806×1062`, editorial alto 1156, CTA 505. **Seguridad** (toca ADR §82): la defensa XSS real vive en los renderers (`escape()`/`safeUrl()`) + `createContextualFragment` NO ejecuta `<script>`; el único JS que corre es el render-listener propio → el sandbox-sin-same-origin era defensa redundante que ROMPÍA la función. Contexto = operador autenticado. Riesgo residual despreciable; revisión post-Fable (TODO-21) + nota en `41-SEGURIDAD`. **Lección** (→`30` al shardear): *un `srcdoc` sandbox sin `allow-same-origin` colapsa el viewport a 0 en Chromium; para previews que necesitan layout real, `allow-same-origin` es obligatorio.*

**▶️ PENDIENTE F1 — EMPEZAR AQUÍ la próxima sesión**:
1. **Daniel: hard-refresh (Ctrl+Shift+R)** en `/admin-contenido.html` → RE-VALIDAR Home + Contacto: ¿fondo claro + layout + tipografía = idéntico a la web? (Ahora con alta confianza: layout verificado headless por medición, no solo por lectura.)
2. ~~**Vigilar fidelidad residual** (reveal)~~ → **RESUELTO `cbf0e20`** (2026-06-17). Investigado a fondo: `.reveal{opacity:0}` + `.reveal.in{opacity:1}` (liquid-glass.css:362-369) es el **ÚNICO** patrón invisible-hasta-JS sobre contenido estructural (verificado con grep de TODO el CSS; el resto de `opacity:0` son componentes interactivos cerrados o keyframes CSS-puros). **Por qué el smoke del 17 se veía bien**: los renderers del preview (hero/editorial/atelier/cta, contacto hero/proceso/faq) NO emiten `.reveal`, y los wrappers `home-X` reciben `reveal` solo de [home.js:59](../../../js/pages/home.js) (JS público que el iframe no corre) → quedan visibles. Las únicas con `.reveal` hardcoded (`social`/`films`) no son editables. **Solución estructural (defensa en profundidad)**: el `<style>` del srcdoc fuerza `.reveal,.reveal-soft{opacity:1!important;transform:none!important;transition:none!important}` — idéntico a lo que el CSS público hace bajo `prefers-reduced-motion` (un preview estático = sin animación de scroll = estado final revelado). Blinda el día que el editor de `nosotros` (P4) monte secciones con `.reveal`. Lección reusable: **un preview en iframe sin el JS público debe neutralizar TODO patrón "invisible-hasta-que-JS-añade-clase" replicando `reduced-motion`** (→ a `30` cuando se sharde).
3. Calibrar valores de `max` contra el layout real.
4. Headless NO puede screenshotear dentro del iframe (no carga fuentes/imágenes externas) → la validación visual la hace Daniel.

## ESTADO F2 (2026-06-18) — clic-para-editar construido + verificado headless

**`04e8769`** — bidireccional, **nivel sección** (los renderers públicos no traen marcadores por-campo):
- **Clic en el preview → formulario**: listener de clic en el `srcdoc` → `closest('[data-sf-section]')` → `postMessage({t:'sf-click',section})` al padre → `singleton-admin` enfoca el primer campo de esa sección (`[data-sf^="key."]`) + resalta el `<fieldset>` (box-shadow 1.2s).
- **Foco en campo → preview**: `focusin` en el form → `preview.highlight(key)` → el `srcdoc` añade `.sf-hl` (outline esmeralda) a la sección. Cursor `pointer` sobre las secciones; microcopy "Toca una sección…".
- **Marcadores**: `data-sf-section` en `home-preview` (en los `<section>`) y `contacto-preview` (wrapper `<div>`). SOLO del preview admin → NO afecta la web pública. Keys == keys de sección del descriptor.
- **API nueva** en `live-preview.js`: `highlight(section)` + `onSectionClick(cb)`. Sin `contentEditable`; cero superficie XSS nueva.

**🐞 Bug cazado en verificación (lección reusable → `30` al shardear)**: el guard `/^[\w-]+$/` dentro del **template literal** del `srcdoc` perdía el backslash (`` `\w` `` evalúa a `"w"`), generando `/^[w-]+$/` (set `{w,-}`) → rechazaba toda sección y el resaltado nunca aplicaba. Invisible al leer; solo apareció al ejecutar. **Lección**: *al embeber un regex en un template string que se inyecta como código, escapar los backslashes (`\\w`) o evitar el regex.* Resuelto eliminando el regex: comparación directa de strings (sin interpolar la sección en el selector → además cierra inyección).

**Verificado E2E headless** (módulos reales, preview server): clic en hijo profundo de cada sección → key correcta al padre; `highlight` de cada sección resalta la correcta + limpieza; Contacto marca hero/proceso/faq. Build verde; singleton-core 5/5.

**✅ F2 DESPLEGADO en prod** (merge `4102e33`, bundle `admin-contenido-D-uLyOPX.js`).

## DECISIÓN ARQ — preview a viewport desktop ESCALADO (2026-06-18, `6bb68ff`, skill `arquitecto-software`)

**Síntoma (Daniel, tras validar F1/F2)**: el preview "no se ve exacto" vs la web real + una "línea verde" a la derecha ("códigos peleándose").
**RCA (medido en el preview server, no supuesto)**: el iframe tomaba el ancho del panel (~760px), **por debajo de los breakpoints del sitio (920/1100px)** → renderizaba la versión móvil/tablet (h1 **34px**), no la desktop que ve el visitante (h1 **62px**). La "línea verde" = el **scrollbar de la marca** (esmeralda 10px, `liquid-glass.css:336`), visible por el alto del contenido — NO un conflicto de código (0 elementos desbordan; `clientW = innerW − 10px`).
**Decisión (6 lentes)**: renderizar el iframe a un **viewport lógico desktop `REF_WIDTH=1440`** (el `.container` del sitio queda a su max 1360, como en desktop) y **escalar con `transform: scale()`** para caber en el panel (`ResizeObserver` re-escala al cambiar de ancho). **Scrollbar oculto** en el srcdoc. `admin.css`: el alto pasa al `.sf-preview-host`; el iframe lo llena escalado. Técnica estándar de CMS (Shopify/Wix/Figma). No cara de revertir (2 archivos) → sin comité; validada empíricamente.
**Verificado E2E** (módulos reales): Home+Contacto viewport 1440, h1 62/66px, escala 0.528 → ancho visual 760 (cabe), `sinScroll=true`; **F2 sigue funcionando con el transform** (clic=atelier, highlight=cta). Build verde; núcleo 5/5.
**Sub-fix sticky del preview (`c98978a`, 2026-06-18)**: el preview se perdía al bajar en el form a editar. RCA: `.adm-layout` usaba `min-height:100vh` → el layout crecía con el contenido, `.adm-content{overflow-y:auto}` nunca desbordaba (no era scroller), el scroll caía al window y `.adm-main{overflow:hidden}` rompía el contexto del `sticky`. Fix: **`.adm-layout{height:100dvh}`** cierra la cadena app-shell → `.adm-content` es el scroller real → el `.sf-preview{sticky;top:12px}` ancla y queda fijo mientras el form scrollea (mejora todo el admin: sidebar+topbar fijos). **NO verificable headless** (el preview server reporta `innerHeight=0` → `vh/dvh=0`); diagnóstico confirmado por mock (sticky roto con min-height). Cambio de shell global → validar también que las tablas (Clientes) sigan scrolleando.

**FALTA**: deploy + Daniel valida fidelidad desktop + sticky en vivo. **Luego**: F3 (barandas: aviso al salir sin publicar; "Publicado ✓") · `nosotros` (editor de listas P4) · `global`. (Futuro: **toggle desktop/móvil = F4**.)

## P3.5 — Imagen de portada editable + field-type "imagen" reusable (2026-06-18, `c6b7ff7`)

**Terreno ya preparado** (comité B5 2026-06-14): `optimizeImage` (canvas→avif/webp ≤1600px, `image-optimizer.js`) + `uploadAsset`→`assets/` (`storage-service.js`) + `storage.rules` con rol+tipo+tamaño. P3.5 = **reuso**, no construcción.
- **Field-type `image`** (genérico, `singleton-admin-core`): `<input hidden>` con la URL (`collectSingleton` la recoge como cualquier campo) + preview + botón subir/quitar. **Reusable** para futuras imágenes (Nosotros, etc.).
- **Handler** (`singleton-admin`): `optimizeImage` → `uploadAsset` (progreso) → URL al hidden → `refreshPreview` (el iframe muestra la imagen al instante). DOM seguro (sin `innerHTML`).
- **Renderer** (`hero.js`): `c.bgImage` → `<img class="home-hero-img home-hero-img-fallback" fetchpriority=high>` (LCP preservado) con **fallback** al `<picture>` estático srcset. URL por `safeUrl` (anti stored-XSS; safe-url.js prescribe este patrón exacto).
- **🔒 Hallazgo de seguridad**: `optimizeImage` produce **AVIF** (canvas) pero `storage.rules` solo permitía `png|jpeg|webp` → subidas avif rechazadas (**bug latente también en PIEZAS**). Fix: `+image/avif` a la allowlist (seguro, no ejecutable). **REQUIERE deploy de `storage.rules`**.
- **Trade-off**: la imagen custom es un solo archivo optimizado (sin srcset multi-tamaño del pipeline sharp). Aceptable (≤1600px, peso bajo).
- **Verificado**: build; núcleo **9/9** (4 tests nuevos incl. anti-XSS de la URL); render hero con/sin imagen + `javascript:` neutralizado (preview server). **Upload real (auth+Storage) lo valida Daniel.**
- **Alcance MVP**: solo la portada del Home. Extensiones (imagen del editorial, etc.) reusan el field-type. **FALTA**: deploy sitio + `firebase deploy --only storage` (reglas avif) + Daniel valida la subida.

## P4 — Editor de listas repetibles (Nosotros) — DISEÑO (2026-06-18, workflow `wf_159130b5`)

> **Deliberación**: workflow 7 agentes (3 entender + comité 3 enfoques + síntesis arquitecto, ~1.07M tok). **CRUDO** → bóveda `research-archive/2026-06-18-cms-p4-design-CRUDO.json`.

**Enfoque elegido**: **field-type `list` en el singleton-admin existente** (NO scaffold aparte). Descartados: scaffold dedicado (2 scaffolds = drift, sin beneficio para 7 listas de 1 página) e incremental puro (deja FAQ/reseñas sin add/quitar → migración futura). Razón (lentes): **mantenibilidad+reuso** (mismo scaffold/guardado/preview/undo/imagen que Home y Contacto), **seguridad** (CERO cambio de reglas en el camino crítico — las listas viven en sub-mapas ya `is map`, y `siteContentValid` no recursa), **costo** (1 write/guardado; `merge:true` reemplaza el sub-mapa).

**Modelo de datos** `siteContent/nosotros`: sub-mapas por sección; cada lista = array `items` **DENTRO de un sub-mapa ya whitelisted** (NUNCA array a nivel raíz, que las reglas rechazarían). Ej: `valores{items:[{t,d}]}` (el `n` 01.. lo deriva el renderer), `timeline{items:[{y,t,d}]}`, `equipo{items:[{n,r,b}]}`, `cartagena{…,stats:[],certs:[],resenas:[]}`, `cierre{faqs:[],cta…}`. **mergeNosotros**: planos→spread; listas→**REEMPLAZO** (no spread; un doc parcial no pisa la lista con undefined). `setDoc(merge:true)` reemplaza el array entero (correcto para reordenar/quitar).

**Plan** (fases): **0** refactor `nosotros.js` → renderers parametrizados + `nosotros-defaults.js` (SSoT) + `mergeNosotros`; `init()` consume `getSiteContent('nosotros')`. *El GRUESO del esfuerzo, inevitable en cualquier enfoque; verificar web con doc vacío = idéntica a hoy.* · **1** field-type `list` en `singleton-admin-core` (fieldHTML rama list + `itemTemplateHTML` + `collectSingleton` agrupa `sec.items.i.sub`→array con trim+**recorte a max** + merge reemplaza arrays) + tests · **2** UI en `singleton-admin` (listener click add/del/up/down + **reindex de data-sf** [punto frágil → test obligatorio] + refreshPreview) · **3** `nosotros-preview.js` (espejo de contacto-preview) + descriptor en `contenido-tabs` + pestaña (L191 ya la reserva) · **4** (opcional, aditivo) cap de size por lista en reglas · **5** verif por hito.

**Riesgos** (mitigados): reindex tras mutar (test); no-regresión del core a 4 niveles (rama list SOLO con `type==='list'`; el camino plano queda intacto + tests singletons home/contacto ANTES de desplegar); reglas no validan cardinalidad (cap client-side en collect); Fase 0 subestimable (tratarla como hito propio).

**Reuso TOTAL**: el handler de imagen (P3.5) y el contador funcionan sin tocar (solo dependen de `[data-sf]`/`[data-img-wrap]`, agnósticos a la anidación). Preview = `live-preview.js` sin cambios.

**⚖️ DECISIONES (Daniel, 2026-06-18) ✅**: **(1)** cardinalidad = **SÍ añadir/quitar/reordenar** → motor `list` completo · **(2)** lista vacía = **la sección DESAPARECE** (hideWhenEmpty; `mergeNosotros` respeta `[]` explícito — defaults SOLO si la sección no existe en el doc) · **(3)** reseñas = **a mano ahora** (lista editable; Kary pega las reales) · **(4)** fotos de equipo = **iniciales por ahora** (sin field-type image en equipo; mejora posterior). **(5) PENDIENTE**: el modelo de datos es **cara de revertir** → 2ª opinión externa (Gemini, `docs/15`) ANTES del deploy a prod (patrón establecido en este proyecto). Prompt anti-anclaje preparado en la bóveda.

## P4 — ESTADO: IMPLEMENTADO (2026-06-19, [OPUS-4.8]) — pendiente gate de deploy

Construcción completa de las 5 fases + Fase 4 (endurecimiento de reglas). Modelo final = el del CRUDO de diseño, acotado por la whitelist YA desplegada (`firestore.rules` claves nosotros). Desviaciones menores vs el boceto del CRUDO (documentadas): hero/manifiesto/maison/atelier/cierre incluyen MÁS campos planos para capturar el copy real fielmente (titlePre/Em/Tail del manifiesto, leadItalic del hero, ubicación/visitas en 2 líneas c/u, etc.); los encabezados de sección quedaron **literales fijos** en el renderer (no editables) — ver hallazgo B abajo.

**Archivos**: `js/pages/nosotros-defaults.js` (NUEVO) · `js/pages/nosotros.js` (refactor a renderers puros) · `js/admin/singleton-admin-core.js` (field-type `list` + `itemTemplateHTML` + `collectList` + `reindexItemSf`) · `js/admin/singleton-admin.js` (UI add/del/up/down + reindex) · `js/admin/nosotros-preview.js` (NUEVO) · `js/admin/contenido-tabs.js` (descriptor + TABS) · `css/admin.css` (.sf-list/.sf-item) · `firestore.rules` (Fase 4: `siteListOk` cap ≤60/lista) · tests.

**Deliberación (revisión adversarial multi-lente, 9 agentes ~1.24M tok)** → CRUDO `../brain-private/bersaglio/research-archive/2026-06-19-cms-p4-review-CRUDO.json`. Veredicto: **0 críticos/altos, 0 regresiones**. Confirmados (todos low/nit): **(A)** reglas no acotaban cardinalidad de listas (denial-of-wallet) → **RESUELTO en Fase 4** (cap ≤60 server-side, asimetría con `journalValid` cerrada) · **(B)** encabezados con conteo fijo ("Seis cosas", "Trece años en cinco capítulos") driftan si Kary cambia el conteo → **RESUELTO** (Daniel 2026-06-19: "hacerlos editables") — `valores`/`timeline` ganan campos planos de encabezado (eyebrow/titlePre/titleEm), renderers leen el sub-mapa; aditivo, sin cambio de reglas · **(C nit)** título de tarjeta vacía omitía el índice → **arreglado** (`singleton-admin.js` updateItemTitle deriva índice + preserva `.sf-item-untitled`).

### Checklist
- [x] Fase 0: refactor a defaults+renderers+merge — web idéntica con doc vacío (verificado en preview: 12 secciones, hero/valores/timeline/equipo/stats/certs/reseñas/faq correctos; build chunk `nosotros`)
- [x] Fase 1: field-type `list` (fieldHTML rama list, itemTemplateHTML, collectList orden/trim/cap/compacta, reindexItemSf) — tests `tests/singleton-admin.test.mjs` 22/22
- [x] Fase 2: UI add/del/up/down + reindex + updateItemTitle + updateListCount — `js/admin/singleton-admin.js` + `tests/singleton-admin.test.mjs` (reindexItemSf + reindex↔collect)
- [x] Fase 3: nosotros-preview (data-sf-section por sub-mapa) + descriptor 8 secciones + pestaña — `js/admin/nosotros-preview.js` + `js/admin/contenido-tabs.js`
- [x] Fase 4: cap de cardinalidad en `siteContentValid` (siteListOk ≤60) — `npm run test:rules` 168/168 (6 casos nosotros nuevos)
- [x] Verificación: build verde · 105 tests puros + 168 reglas (`tests/firestore-rules.test.mjs` + `tests/singleton-admin.test.mjs`) · revisión adversarial 2026-06-19 (0 crít/alto/regresión) · página pública idéntica (screenshot hero)
- [x] **GATE paso 1 — 2ª opinión EXTERNA del modelo ✅ HECHO** (Gemini vía Antigravity, 2026-06-19): respuesta + síntesis de Claude en bóveda `2026-06-19-consejo-gemini-p4-modelo-SINTESIS.md`. **ADOPTADO: aplanar el modelo 8→12 claves** (se eliminó el grab-bag `cartagena` → atelier·cifras·certificaciones·resenas·faqs·cierre; migración cero porque aún no hay datos en prod) + guards anti poison-pill por-ítem + cap reglas 60→24. Refutados/diferidos (imágenes aditivas · IDs/rich-text/reset/concurrencia = gatillos documentados). El modelo plano ES la recomendación externa → gate de modelo LEVANTADO.
- [ ] **GATE deploy restante**: (2) validación manual de Daniel del editor en vivo (panel requiere login) · (3) `firebase deploy --only firestore:rules` (Fase 4 + modelo plano) + deploy sitio. NO mergear `Desarrollo→main` antes de la validación de Daniel.

### Adenda 2026-06-19 — modelo PLANO (síntesis Gemini)
El modelo final NO es el del CRUDO de diseño (8 claves con `cartagena` agrupando 4 secciones). Tras la 2ª opinión externa se aplanó a **12 claves lógicas** (una por sección): `hero · manifiesto · maison · valores · timeline · equipo · atelier · cifras · certificaciones · resenas · faqs · cierre`. Cada lista es `{items:[…]}` dentro de su clave. Razón: desacoplar el dato de la maqueta visual ANTES de que existan datos (migración cero ahora vs script después). Gatillos de revisión futura documentados en la síntesis (deep-linking→IDs · imágenes en ítems→aditivo · rich-text→Markdown saneado · multi-editor→subcolecciones/guardado por-sección).
