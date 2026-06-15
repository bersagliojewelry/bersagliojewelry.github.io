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
