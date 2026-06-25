# Tasks: [NOMBRE DE LA FEATURE]

> Plantilla de **tasks**. Derivada de github/spec-kit (MIT). Deriva del plan: cada contrato,
> entidad y escenario → tareas concretas. NO introduce decisiones de arquitectura nuevas.
> **Notación**: `[ID] [P?] [Story] Descripción`
> - `[ID]` secuencial: `T001`, `T002`, … · `[P]` = paralelizable (sin dependencia con otras [P]
>   del mismo grupo; tocan archivos distintos) · `[Story]` = etiqueta de user story (`US1`/`US2`/…).
> - Cada tarea nombra el/los **archivos** que toca.

**Feature ID**: `<NNN-slug>` · **Plan**: `./plan.md`

## Orden de dependencias (reglas)
1. **Setup** primero (todo lo demás depende).
2. **Foundational** bloquea TODAS las user stories (infra crítica compartida).
3. **User Stories** pueden ir en paralelo entre sí tras Foundational; dentro de cada una:
   **tests antes de implementación**, **modelos antes de servicios**, servicios antes de UI.
4. **Polish** al final (cross-cutting).

---
## Phase 1 — Setup
- [ ] **T001** Inicializar estructura/deps según plan §3. (`<archivos>`)
- [ ] **T002** [P] Configurar linter/formatter/test runner. (`<archivos>`)

## Phase 2 — Foundational  *(MUST complete antes de CUALQUIER user story)*
- [ ] **T003** <infra compartida: auth base, conexión BD, esquema raíz>. (`<archivos>`)
- [ ] **T004** [P] <otra pieza foundational independiente>. (`<archivos>`)

## Phase 3 — US1 (P1, MVP)
- [ ] **T005** [P] [US1] **Test** de contrato/aceptación para <FR-00x> (debe FALLAR primero). (`tests/...`)
- [ ] **T006** [US1] Modelo/entidad <…>. (`src/...`)
- [ ] **T007** [US1] Servicio/lógica <…> (hace pasar T005). (`src/...`)
- [ ] **T008** [US1] UI/endpoint <…>. (`src/...`)

## Phase 4 — US2 (P2)
- [ ] **T009** [P] [US2] Test … (FALLA primero). (`tests/...`)
- [ ] **T010** [US2] Implementación … (`src/...`)

## Phase 5 — US3 (P3)
- [ ] **T0xx** [US3] …

## Phase 6 — Polish  *(cross-cutting)*
- [ ] **T0xx** [P] Manejo de errores/edge cases de la spec §3. (`<archivos>`)
- [ ] **T0xx** [P] Accesibilidad / performance / docs.
- [ ] **T0xx** Verificar contra los **Success Criteria** medibles de la spec §6.

---
## Estrategia de paralelización
- Tras Foundational: US1 ‖ US2 ‖ US3 (equipos/agentes distintos).
- Dentro de una story: tareas `[P]` que tocan archivos distintos corren juntas.
- Los tests `[P]` de una story se escriben juntos ANTES de su implementación (test-first).

## Trazabilidad (gate de /analyze)
- [ ] Cada `FR-###` de la spec tiene ≥1 tarea.
- [ ] Cada tarea traza a un `FR-###` o a un artículo de la constitución (sin tareas huérfanas).
- [ ] Cada user story tiene su test antes de su implementación.
