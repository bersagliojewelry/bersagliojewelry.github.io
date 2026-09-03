---
name: guia-web-moderna
description: >-
  Envoltura de gobierno para decidir QUÉ API NATIVA del navegador se usa hoy en el portal (Astro + islas) o
  en el legacy vanilla, y con qué techo de soporte — container queries, `popover`, `<dialog>`, View
  Transitions, `:has()`, `content-visibility`, `@starting-style`, anchor positioning, subgrid, `oklch`,
  `light-dark()`, scroll-driven animations, INP. Fija la PRECEDENCIA: el design system del proyecto
  (`tokens.css`, disciplina de color, `img.ts`) y las lecciones pagadas MANDAN sobre cualquier guía externa,
  y nada se declara mejorado sin medirlo en vivo. Léela ANTES de consultar el plugin `modern-web-guidance`
  (Google Chrome, marketplace oficial) y ANTES de meter una feature moderna «porque existe». Disparadores —
  "¿qué API nativa hay para esto?", "container queries", "popover / dialog / drawer", "view transitions",
  "modo oscuro", "`:has()`", "content-visibility", "¿esto lo soporta Safari/Firefox?", "sustituir JS por CSS
  nativo", "modernizar este componente", "modern-web-guidance". NO es para medir (eso es
  `optimizacion-rendimiento-web` + `validacion-live-chrome`) ni para elegir stack (eso está SELLADO).
actualizada: 2026-09-03
reglas: 13
lecciones: [BERS:L-07, CARS:L-23, CARS:L-54, CARS:L-55, G:G-001, G:G-002, G:G-004, G:G-005, INMO:L-38, INMO:L-68]
origen: propia
---

# 🧭 Guía web moderna — la envoltura que decide QUIÉN manda

> **Skill PROPIA (gobernada nº 46), nacida el 2026-09-03 por DICTAMEN-C4 §10 D-C4-29.** No es una copia de
> nada: es la capa que faltaba entre un catálogo externo de APIs del navegador y un proyecto con design
> system SELLADO y lecciones pagadas. El catálogo se consulta; esta skill decide.
>
> **Capa ALTORRA obligatoria**: español al hablar · el design system del proyecto es SSoT · cero regresión
> visual · nada se declara mejorado sin medida en vivo.
>
> **El hueco que llena, medido** (agente frío, 2026-09-03, sobre `portal/src`, 189 ficheros): **50 `@media`
> frente a 0 `@container`**, y CERO ocurrencias de `:has(`, `popover`, `<dialog`, `@view-transition`,
> `@starting-style`, `content-visibility`, `oklch`, `light-dark(`, `anchor-name`/`position-anchor` y
> `subgrid`. Los índices del maestro (`layout-y-caja`, `css-cascada`, `carga-y-peso`: 29 filas) son
> **patologías** — el cerebro sabe **por qué se rompió**; no sabía **con qué se construye hoy**. Ejes
> ortogonales, no duplicados.

## Las 8 reglas de precedencia (ninguna es opcional)

1. **`tokens.css` y la disciplina de color MANDAN sobre cualquier guía externa. JAMÁS modo oscuro.**
   Procedencia: DICTAMEN-C4 §10 **D-C4-29** (a) · memoria `identidad-marca-inmobiliaria` («el FONDO SIEMPRE
   es blanco», «SIN negro») · `CLAUDE.md §1` (design system SELLADO). El roce es real y está medido: la guía
   `guides/visual-design/dark-mode.md` del catálogo manda `<meta name="color-scheme" content="light dark">`,
   `color-scheme: light dark` y `light-dark()` en los tokens — **de frente contra el mandato de marca**. Con
   un `description` externo que se declara MANDATORY/FIRST, un agente obediente metería modo oscuro donde
   está PROHIBIDO. La paleta, el `color-scheme` y las fuentes los decide el design system del proyecto: una
   guía externa **no toca tokens**.
2. **Antes de tocar imágenes, `portal/src/lib/img.ts` y [[INMO:L-38]] mandan sobre cualquier guía externa.**
   `srcset` es campo minado con número pagado: ponerlo a las 7 fotos **empeoró +63 % en escritorio y +21 %
   en móvil** (medido 2026-08-20). La regla se escribe ANTES de que haga falta, precisamente porque la guía
   que se leyó (`optimize-image-priority`) no contradice nada pero el catálogo tiene otras
   (`deliver-optimized-decorative-images.md`) que no se leyeron. Vale también el criterio de peso vs hueco
   ([[BERS:L-07]]).
3. **Todo bloque `@container` va al FINAL de su hoja.** `@media` pesa **CERO** en especificidad
   ([[INMO:L-68]]) y `@container` se comporta idéntico: si el bloque va ANTES de la regla que quiere pisar,
   empata y gana la de después. **La guía externa no lo dice: nuestra lección la EXTIENDE.**
4. **`container-type: inline-size` aplica `contain: layout style` y convierte al elemento en containing
   block** de sus descendientes `position: absolute`. Verifícalo VIVO antes de repetir el patrón en otras
   cards: es exactamente el terreno de [[CARS:L-23]] y [[CARS:L-54]]. **Nuestra lección PROTEGE de la
   guía**, que no lo advierte.
5. **La guía aconseja; NO mide.** Nada se declara mejorado sin `validacion-live-chrome` (producción) y sin
   número antes/después de `optimizacion-rendimiento-web`. El instrumento se prueba antes que los datos
   ([[G:G-004]]) y la medida viaja con su regla al lado ([[G:G-005]]). Un cambio «moderno» sin medida es una
   preferencia, no una mejora.
6. **Menú/drawer: `popover` SÍ; `inert` + `IntersectionObserver` por JS NO.** Un popover cerrado está en
   `display:none` por hoja de estilos del navegador — fuera del orden de tabulación **sin depender de ningún
   evento**, que es justo lo que [[CARS:L-55]] declara frágil («el evento que no dispara lo deja muerto»).
   La parte buena de la guía externa converge con nuestra lección; su variante «robusta» por JS la
   reintroduce. **Manda la lección.**
7. **El plugin `modern-web-guidance` (Google Chrome, marketplace oficial) se CONSULTA si está habilitado —
   no manda, y su CLI JAMÁS se vendoriza.** Tres cosas, las tres medidas el 2026-09-03:
   - Su `description` dice *«MANDATORY: Execute FIRST for all HTML/CSS and clientside JS tasks. Do NOT
     skip»*. **Aquí NO manda**: compite con doctrinas siempre-activas del proyecto y las reglas 1-4 le pasan
     por encima. Es una fuente, no una orden.
   - Corre por `npx -y modern-web-guidance@latest …`: descarga y ejecuta código de npm **sin pinear**, y el
     binario (`modern-web.mjs`) **no está en el árbol del repo** del plugin (se publica solo a npm; el
     fuente vive aparte). **Auditar el plugin no es auditar lo que corre.** Por eso no se vendoriza el CLI y
     por eso el permiso, si se da, va con el patrón exacto `npx -y modern-web-guidance@latest *` — **nunca
     `npx *`**.
   - **Telemetría a Google ENCENDIDA por defecto**: el README declara que se recogen *«installation counts,
     guide retrieval IDs, and CLI tool search queries generated by the agent»* (los prompts crudos no). Las
     consultas que el agente escribe sobre el código del proyecto SALEN del PC. Opt-out: `DISABLE_TELEMETRY=1`,
     ya puesto en el bloque `env` del `.claude/settings.json` de los cuatro repos. **Salida de emergencia sin
     `npx`**: las ~160 guías son markdown plano en el repo y se leen por WebFetch con riesgo de ejecución
     CERO — se pierde el buscador semántico, se conserva el contenido; y **nunca** se vendorizan sus fechas
     de Baseline ([[G:G-001]]).
8. **Lo que una herramienta dice de sí misma es un sello auto-declarado: el testigo es su README completo,
   su `package.json` y su red — no su titular** ([[G:G-001]], [[G:G-002]]). Caso de manual: el mismo README
   afirma que el CLI *«works offline, completely private and local»* y tres párrafos más abajo declara la
   telemetría. Y el corolario operativo: **si una feature no es Baseline "widely available", el fallback es
   obligatorio**; si Firefox o Safari no la soportan y hay que mantener el JS de todas formas, quedan **dos
   fuentes de verdad del mismo estado** y entonces **no se toca**. El catálogo funciona como **techo de
   soporte**, no como lista de novedades — hay guías suyas que se autodesaconsejan, y ésas se obedecen.

## Cómo se usa (orden fijo)

1. Comprueba si el plugin ya es invocable (`ListSkills` / `ListPlugins`): el listado del harness **no**
   coincide con `settings.json`.
2. Si NO está habilitado, usa `references/baseline-2026-09.md` (tabla medida, con fecha) y/o lee la guía
   concreta por WebFetch. Si está, consúltalo — y aplica igualmente las reglas 1-8.
3. Pasa el candidato por las reglas 1-4 (¿toca tokens? ¿toca imágenes? ¿es `@container`?) y por la 8
   (¿Baseline? ¿fallback? ¿dos fuentes de verdad?).
4. Impleméntalo **aditivo** (nunca renombres IDs/clases/funciones) y **mídelo** (regla 5) antes de decir que
   mejoró.
5. Al cerrar: si la aplicación dejó un gotcha reutilizable, súbelo a esta skill como regla numerada, y el
   caso a la lección/ADR del proyecto (§G.4).

## Qué NO entra aquí, y por qué

- **Las ~160 guías del catálogo NO se vendorizan.** Su valor real son **21+ fechas de Baseline con versión
  de navegador**, que caducan solas: congelarlas nos haría dueños de una foto fija de un objetivo en
  movimiento — un sello sin testigo externo ([[G:G-001]]) y `39-ESCRITO-NO-ES-VIGENTE` a los seis meses.
  Además, D-C4-20: los plugins del marketplace no entran al canon.
- **La tabla de `references/baseline-2026-09.md` es una FOTO fechada, no una fuente viva.** Si la fecha ya
  no dice nada, se vuelve a medir contra el catálogo o contra la doc del navegador — no se «actualiza de
  memoria».
- **Elegir stack.** Vanilla en el legacy · Astro + islas en el portal está SELLADO: prohibido
  React/Vue/Angular/Svelte y Tailwind/Bootstrap. Ninguna guía externa reabre eso.

> **[HONOR]** — sin gate de linter: ningún check mecánico sabe si consultaste el catálogo antes de escribir
> CSS ni si mediste después. Se cumple por honor, y las reglas 1 y 5 son las que no se saltan.
