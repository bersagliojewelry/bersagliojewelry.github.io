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
