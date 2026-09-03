# Baseline — foto MEDIDA el 2026-09-03 (no es una fuente viva)

> **Qué es.** Las líneas de soporte que un agente frío leyó **verbatim** de las guías de
> `GoogleChrome/modern-web-guidance` (paquete npm v0.0.186, Apache-2.0, plugin oficial del marketplace
> `claude-plugins-official`) el **2026-09-03**, por WebFetch a `raw.githubusercontent.com` — sin ejecutar
> su CLI. Crudo: `relevos/2026-09-02-fable/c4-6/frio-modern-web-guidance.md`.
>
> **Para qué sirve.** Para no quedarse a ciegas cuando el plugin NO está habilitado. El frío leyó 21+
> fechas de Baseline; aquí están las que quedaron **citadas verbatim** en el crudo — las únicas que puedo
> reproducir sin inventar.
>
> ⚠️ **Esto CADUCA y no se actualiza de memoria.** Es una foto fija de un objetivo en movimiento
> ([[G:G-001]]): si la fecha de arriba ya no dice nada, se vuelve a medir contra la guía o contra la doc
> del navegador. **Nunca se amplía esta tabla con datos recordados.**

| Feature | Guía de origen | Estado Baseline (verbatim) | Navegadores (verbatim) |
|---|---|---|---|
| **Container queries** (`@container`, `container-type`) | `guides/css/size-aware-styling.md` | «Widely available. It's been Baseline since **2023-02-14**.» | «Chrome 105 (Sep 2022), Edge 105 (Sep 2022), Firefox 110 (Feb 2023), and Safari 16 (Sep 2022).» |
| **Popover API** (`popover`, `popovertarget`) | `guides/ui-components/navigation-drawer.md` | «**Newly** available. It's been Baseline since **2024-04-16**.» | «Chrome 114 (May 2023), Edge 114 (Jun 2023), Firefox 125 (Apr 2024), and Safari 17 (Sep 2023).» |
| **`inert`** | `guides/ui-components/navigation-drawer.md` | «Widely available… Baseline since **2023-04-11**.» | (no citado verbatim en el crudo) |
| **Cross-document view transitions** (`@view-transition`) | `guides/ui-behaviors/cross-document-transitions.md` | «**limited availability**» · «are a progressive enhancement; the core functionality of the site remains unaffected.» | «Chrome 126 (Jun 2024), Edge 126 (Jun 2024), and Safari 18.2 (Dec 2024). **Unsupported in: Firefox.**» |
| **`content-visibility`** | `guides/performance/defer-rendering-heavy-content.md` | «Available since **2025-09-15**.» + «Always pair `content-visibility: auto` with `contain-intrinsic-size`.» | «Chrome 108+, Edge 108+, Firefox 130+, Safari 26+.» |
| **Scroll-state queries** (`container-type: scroll-state`) | `guides/ui-atoms/state-aware-sticky-headers.md` | (sin Baseline: soporte parcial) | «Chrome 133 (Feb 2025) and Edge 133 (Feb 2025). **Unsupported in: Firefox and Safari.**» |
| **Container STYLE queries** | `guides/css/design-token-reactivity.md` | «Until there is Baseline support for container style queries it is **NOT RECOMMENDED** that they be used for core features that must be available across all browsers.» | (la propia guía se autodesaconseja) |

## Cómo se lee esta tabla

- **«Widely available»** → se puede usar sin fallback obligatorio (container queries, `inert`).
- **«Newly available»** → la propia guía obliga: *«For features that are not Baseline widely available, you
  MUST follow the fallback recommendations in the guide»*. Caso `popover`: el fallback es gratis
  (`@supports selector(:popover-open)` conservando la regla vieja).
- **«Limited availability» / sin Firefox o sin Safari** → solo como **mejora progresiva** que se pueda
  ignorar sin romper nada (`@view-transition`), o **no se toca** si obligaría a mantener el JS igualmente y
  dejaría dos fuentes de verdad del mismo estado (scroll-state queries).
- **Guía que se autodesaconseja** → se obedece a la guía (container style queries).

## Lo que el frío midió sobre nuestro código (misma fecha, misma pasada)

`portal/src`, 189 ficheros, grep del 2026-09-03: **50 `@media` · 0 `@container`**, y **0** en `:has(`,
`popover`, `<dialog`, `@view-transition`, `@starting-style`, `content-visibility`, `oklch`, `light-dark(`,
`prefers-color-scheme`, `anchor-name`/`position-anchor`, `subgrid`. Es el tamaño del hueco, no una lista de
tareas: cada candidato pasa antes por las 8 reglas del `SKILL.md`.
