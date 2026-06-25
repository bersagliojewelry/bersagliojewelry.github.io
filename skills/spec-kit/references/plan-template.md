# Implementation Plan: [NOMBRE DE LA FEATURE]

> Plantilla de **plan** (CÓMO). Derivada de github/spec-kit (MIT). Traduce la spec aprobada a
> arquitectura técnica CON rationale. Aplica `arquitecto-software` (6 pilares). Output esperado:
> `plan.md` → `research.md` → `data-model.md` → `quickstart.md` → `contracts/` → (luego) `tasks.md`.

**Feature ID**: `<NNN-slug>` · **Spec**: `./spec.md` · **Fecha**: <YYYY-MM-DD>

## 1. Technical Context
- **Lenguaje/runtime**: <…>  · **Dependencias clave**: <…>
- **Almacenamiento**: <BD/colas/cache>  · **Testing**: <framework + niveles>
- **Plataforma/target**: <web/mobile/CLI/server>  · **Restricciones de performance**: <umbrales>
- **Restricciones del proyecto**: <legal, seguridad, presupuesto, equipo>

## 2. Constitution Check  *(GATE — debe pasar ANTES de la Fase 0; re-check tras el diseño)*
> Verifica el plan contra `constitution.md`. Cada artículo: ✅ cumple / ⚠️ requiere justificación.
- [ ] **Test-First**: el plan ordena tests ANTES de implementación.
- [ ] **Simplicidad**: estructura mínima (≤ N proyectos); sin capas no justificadas.
- [ ] **Anti-abstracción**: usa el framework directo; no wrappers innecesarios.
- [ ] **Integración real**: contract tests + servicios reales sobre mocks donde importa.
- [ ] **Artículos del proyecto**: <listar y verificar los no-negociables propios>.
> Cualquier ⚠️ → documentar en §6 Complexity Tracking con justificación, o simplificar.

## 3. Project Structure
> Dónde viven los archivos. Elegir UN patrón (single project / web app / mobile+API) y mostrarlo.
```
specs/<NNN-slug>/
  spec.md · plan.md · research.md · data-model.md · quickstart.md · contracts/ · tasks.md
src/  ...   tests/  ...
```

## 4. Phase 0 — Research  *(→ research.md)*
- Preguntas abiertas del stack/dominio; benchmarks, compatibilidades, restricciones org.
- Para cada decisión: opciones consideradas → elegida → **rationale** → descartadas y por qué.
- Decisiones FUERTES (caras de revertir) → escalar (`proceso-decision-fuerte` / `comite-expertos`).

## 5. Phase 1 — Design  *(→ data-model.md, contracts/, quickstart.md)*
- **Data model**: entidades, campos, relaciones, invariantes (deriva de "Key Entities" de la spec).
- **Contracts**: contratos de API/interfaces (request/response, errores) en `contracts/`.
- **Test scenarios**: mapear cada criterio de aceptación G-W-T a un test de contrato/integración.
- **Quickstart**: cómo validar la feature end-to-end (el guion de aceptación).
- **Trazabilidad**: cada `FR-###` de la spec → decisión/contrato que lo cumple.

## 6. Complexity Tracking
> SOLO si algún Constitution Check salió ⚠️. Tabla: cada complejidad extra se gana su lugar.
| Complejidad introducida | Por qué es necesaria | Alternativa más simple descartada y por qué |
|---|---|---|
| <…> | <…> | <…> |

## 7. Progress / Gates
- [ ] Constitution Check inicial ✅
- [ ] Phase 0 research cerrado (sin decisiones abiertas)
- [ ] Phase 1 design completo (data-model + contracts + quickstart)
- [ ] Constitution Check re-check tras diseño ✅
- [ ] Listo para `/tasks`
