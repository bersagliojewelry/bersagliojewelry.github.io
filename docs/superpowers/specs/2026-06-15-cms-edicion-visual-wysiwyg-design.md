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

**Nota técnica (anti-sobreingeniería)**: montar el preview en un **`<div>` namespaceado** (`.cms-preview`; los selectores ya son `home-*`, no chocan con `adm-*`), **NO** iframe `srcdoc`/postMessage en el MVP (el iframe no hereda el CSS hasheado por Vite y reintroduce fricción de build). El iframe solo si aparece colisión real de estilos.

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
- iframe + postMessage (resuelve un problema que aquí no existe — panel y web comparten código).
- Prometer F1-F2 para TODAS las páginas hoy: **solo Home está instrumentado**; cada sección necesita preparar su renderer igual primero → es trabajo por sección, no "gratis una vez". (Decirlo para no crear expectativa falsa.)

---

## Para el consejo externo (Gemini) — 3 preguntas (anti-anclaje, relay en el próximo chat)

1. **Sitio estático + repo público**: para un CMS por formularios sobre un sitio 100% estático (GitHub Pages) mantenido por **un solo ingeniero**, cuyas piezas de UI son funciones puras que generan HTML como string y cuya única defensa anti-XSS es escapado por-campo en el render — ¿cuál es el enfoque de edición visual WYSIWYG inline con mejor relación valor/riesgo, y cuáles son los modos de fallo no obvios que típicamente subestima un equipo pequeño al construirlo?
2. **Reusar el render real para el preview**: si el preview en vivo se construye reutilizando exactamente el mismo código que pinta la web pública (mismo escapado, mismo merge de datos), montado en un `<div>` del panel admin en lugar de un iframe aislado — ¿qué riesgos concretos de seguridad o de fuga/colisión de estilos introduce el `<div>` compartido frente al iframe `srcdoc`, y bajo qué condiciones el iframe deja de ser sobreingeniería y se vuelve necesario?
3. **WYSIWYG sin lienzo, para usuario no técnico**: dado que el objetivo es la *sensación* de edición visual directa (ver y tocar sobre el render real) y NO libertad de diseño, ¿qué patrones de interacción concretos —más allá de preview en vivo y clic-para-editar bidireccional— maximizan la confianza de un editor no técnico sobre un layout blindado, y qué evidencia existe de que añadir "presets de layout" mejora o, por el contrario, confunde la experiencia?

---

**Síntesis ejecutable**: Daniel obtiene su "Photoshop" honesto (ver + tocar lo correcto + deshacer, sobre su render con su marca); Kary edita sin miedo y sin poder romper nada; el repo público conserva intacta su única defensa anti-XSS; el ingeniero no hereda ningún motor. El comité anterior tenía razón en cerrar el lienzo — **esto no lo reabre, lo vuelve innecesario.** Encaja como evolución de P1/P2 (singleton-admin ya construido); el preview reusa los renderers públicos por sección.
