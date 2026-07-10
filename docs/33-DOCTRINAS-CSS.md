# 🎨 33 — DOCTRINAS CSS Y DISEÑO "LIQUID GLASS" (hija de `30-LECCIONES`)

> **Nodo neuronal: Memoria Procedimental — sub-lóbulo de Doctrinas de Diseño/CSS.**
> Hija de [`30-LECCIONES`](30-LECCIONES.md) (§G.5 sharding por saturación de `30`). Se consulta
> on-demand ante el **Trigger de Experiencia (`CLAUDE.md §G.2`)** ANTES de refactorizar CSS, tocar el
> design system (`liquid-glass.css`), tipografía o la estética de marca. Son PRINCIPIOS estables (no
> `L-NN`): el kernel sigue leyendo las defs `### L-NN` SOLO de `30` — aquí NO hay lecciones numeradas.
>
> **Mantenimiento (Frescura §G.4)**: nuevas doctrinas de diseño/CSS se escriben AQUÍ; las lecciones
> de bug (`L-NN`) siguen en `30` (o sus hijas `31`/`32`). La madre `30` deja un puntero a esta hoja.

---

## 🎨 Doctrinas CSS y Principios de Diseño "Liquid Glass"

### 1. Arquitectura CSS (post-NOVO — actualizado 2026-06-05)
*   **NO existe `css/style.css`** (lo eliminó el recambio NOVO). El CSS es **modular por página**: `css/liquid-glass.css` (design system: tokens OKLCH + motion `--ease-*` + primitivas de cristal + `.reveal`), `css/components.css` (header/footer/drawers/dock `.qd-*`), y un archivo por página (`home.css`, `nosotros.css`, `contacto.css`, …).
*   **Carga por página**: critical CSS inline → `liquid-glass` → `components` → `<página>` (la de página gana por cascada).
*   **Regla de oro (rediseño)**: editar el CSS **in-place** en el archivo de su selector. NO crear capa-sombra de override (`enhancements.css`) — una sola fuente de verdad por selector.

### 2. Estética Editorial Premium
*   **Squircles suaves** (radii 12/18/24/34/48px + pill 999) — NUNCA esquinas a 0px. Botones/chips = pill; tarjetas = 24–34; hero/footer = 40–48. (La nota previa de "0px" era de una era V7 anterior, ya obsoleta.)
*   **Glassmorphism iOS 26**: `backdrop-filter: blur(28px) saturate(180%)` con pinlight superior (`--pinlight`) y borde iridiscente cónico (`--iridescent-rim`). ⚠️ En MÓVIL el backdrop-filter/`filter:blur()` pesa por memoria al pinch-zoom (iOS) → ver [[L-62]] (`32`/ADR §156.18): degradar lo decorativo en móvil.
*   **Background Unification**: El patrón exacto es `html { background: var(--bj-pearl) }`, `body { background: transparent }` y `.bj-world { z-index: -1 }`. Si se pinta background sólido en el body, la capa de auroras `.bj-world` queda invisible.
*   **No dividers full-width**: No usar `border-top/bottom` decorativos en secciones. Si se necesitan separadores, usar `<hr>` dentro del contenedor o bordes internos de las tarjetas glass.

### 3. Tipografía (post-NOVO — actualizado)
*   **Display/Títulos**: Cormorant Garamond (`--font-display`, peso 300, itálicas) + Fraunces para el wordmark (`--font-brand`).
*   **Body/UI**: **Manrope** (`--font-ui`) — NO Inter.
*   **Numéricos/eyebrows**: **Space Mono** (`--font-mono`) con `tabular-nums` — NO JetBrains Mono.
*   Complementos (minado impeccable §183): display con `clamp()` techo ≤6rem y letter-spacing ≥-0.04em; `text-wrap: balance` en h1–h3 y `text-wrap: pretty` en prosa; ratio ≥1.25 entre pasos de jerarquía.

### 4. Calidad y legibilidad — checklist WCAG (minado impeccable v3.9.1, ADR §183 · detalle → `mineria-recursos-2026-07-10.md §5`)
*   **Contraste**: body ≥4.5:1, texto grande ≥3:1 — INCLUIDOS placeholders. Gris-sobre-color prohibido: usar sombra oscura del propio hue.
*   **Legibilidad**: largo de línea 65–75ch · line-height body 1.5–1.7 · texto ≥14px (ideal 16) · tracking body ≤0.05em · ALL-CAPS solo en labels/eyebrows · justificado prohibido sin `hyphens`.
*   **Estructura**: jerarquía h1→h2→h3 sin saltos · padding ≥8–16px dentro de contenedores con borde/fondo · padding horizontal ≥16px contra el borde del viewport.
*   **Motion**: `prefers-reduced-motion` OBLIGATORIO con alternativa (crossfade/instante) por CADA animación. **Reveal-safety**: NUNCA gatear la visibilidad del contenido a una transición por clase (en tabs ocultos/headless queda la sección EN BLANCO) — aplica a nuestro `.reveal`.
*   **Z-index semántico**: escala nombrada dropdown→sticky→modal→toast→tooltip; nunca 999/9999 sueltos.
*   ⚠️ **Guardia de marca**: el detector "slop" de impeccable marca nuestras firmas deliberadas (Liquid Glass, itálica serif display, Fraunces, paleta perla, dark-glow). La estética Bersaglio es color/estilo **comprometido, declarado** — no slop. Si algún día se corre `detect.mjs` como gate (W-11), pre-cargar allow-list de marca.
