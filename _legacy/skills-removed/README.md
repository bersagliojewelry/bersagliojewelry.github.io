# 🗄️ skills-removed — Carpetas de `skills/` cuarentenadas (curación 2026-06-05)

> Retiradas de `skills/` durante la curación del cerebro (TODO-01). **No borradas**:
> cuarentenadas aquí (límite de guardián `CLAUDE.md §G.4`). Cada una se verificó antes
> de mover (§3.3). Para restaurar una: `git mv "_legacy/skills-removed/<x>" "skills/<x>"`.

| Carpeta | Por qué se retiró | Reemplazada por |
|---|---|---|
| `SKILL-canvas-design/` | Duplicado **malformado** de `canvas-design-creative`: su archivo interno se llama `SKILL-canvas-design.md` en vez de `SKILL.md` (no cargaría como skill), y su frontmatter es `name: canvas-design-creative`. | `skills/canvas-design-creative/` (canónica, `SKILL.md` válido). |
| `ecommerce skills/` | Duplicado **byte-idéntico** de `ecommerce/SKILL.md` (verificado con `diff`), con nombre de carpeta con **espacio** (no carga limpio). | `skills/ecommerce/` (canónica). |
| `example-plugin/` | **Boilerplate de demostración** (slash command de ejemplo "legacy format" + skills `example-command`/`example-skill`). No es una capacidad real. | — (sin reemplazo: era ruido). |
| `accessibility-audit-workspace/` | Solo contenía `trigger-eval.json` (datos de evaluación de triggers). **No es una skill** (sin `SKILL.md`); ensuciaba el catálogo. | `skills/accessibility-audit/` es la skill real (framework WCAG). El eval queda aquí archivado. |

**Resultado**: `skills/` pasó de 78 → **74** carpetas válidas. Catálogo en `docs/skills-inventory.md` (reconciliado).
