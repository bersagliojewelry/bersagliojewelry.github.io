# Workflow comando-por-comando (playbook SDD)

> Cómo ejecutar cada fase de spec-kit en Claude Code (sin el CLI `specify`). Derivado de
> github/spec-kit (MIT). El CLI original expone estos como slash-commands `/speckit.*`; aquí
> son pasos que YO ejecuto leyendo la plantilla correspondiente de `../references/`.

## Mapa rápido
| Fase | Comando spec-kit | Entrada | Salida | Plantilla |
|---|---|---|---|---|
| 1 | `/speckit.constitution` | principios de calidad/test/UX/perf | `constitution.md` | constitution-template |
| 2 | `/speckit.specify` | descripción de la feature | `specs/<id>/spec.md` | spec-template |
| 3 | `/speckit.clarify` | huecos de la spec | "Clarifications" en spec.md | — |
| 4 | `/speckit.plan` | spec aprobada + stack | `plan.md`+`data-model.md`+`contracts/` | plan-template |
| 5 | `/speckit.tasks` | plan validado | `tasks.md` | tasks-template |
| 6 | `/speckit.analyze` | spec+plan+tasks | reporte de inconsistencias | — |
| 7 | `/speckit.implement` | todo lo anterior | código + tests | — |
| + | `converge` | código + spec | tareas faltantes | — |
| + | `checklist` | criterios de calidad | checklist por dominio | checklist |
| + | `taskstoissues` | tasks.md | GitHub issues | — |

## 1. constitution
1. Pregunta/define los no-negociables del proyecto (test, simplicidad, seguridad, legal, deploy).
2. Rellena `constitution-template.md` → `constitution.md` (en `memory/` o donde el proyecto guarde gobernanza).
3. Una vez por proyecto; reusar/enmendar, no recrear.

## 2. specify
1. Toma la descripción de la feature. Numérala (`001`, `002`, …) + slug semántico → `specs/<NNN-slug>/`.
2. Rellena `spec-template.md`. **Disciplina**: solo QUÉ/POR-QUÉ; cero tecnología.
3. Donde no sepas, escribe `[NEEDS CLARIFICATION: <pregunta>]`. NO adivines.
4. Corre el checklist de la spec. Si no pasa, no avances.

## 3. clarify  *(gate antes de plan)*
1. Lista todos los `[NEEDS CLARIFICATION]`.
2. Conviértelos en preguntas concretas al dueño (agrupadas, priorizadas).
3. Anexa las respuestas en una sección "Clarifications" + actualiza los `FR-###` afectados.
4. **Gate**: cero marcadores abiertos. Solo entonces → plan.

## 4. plan
1. Lee la spec aprobada. Rellena `plan-template.md`.
2. **Constitution Check ANTES de research** (gate). Aplica `arquitecto-software` (6 pilares).
3. Phase 0 research (decisiones con rationale; las fuertes → escalar). Phase 1 design
   (data-model, contracts, quickstart, trazabilidad FR→decisión).
4. **Re-check Constitution** tras el diseño. ⚠️ → Complexity Tracking o simplificar.

## 5. tasks
1. Lee plan.md (+ data-model/contracts). Rellena `tasks-template.md`.
2. Deriva tareas de contratos/entidades/escenarios. Ordena por fases (Setup→Foundational→Stories→Polish).
3. Marca `[P]` lo paralelizable; test-antes-de-implementación dentro de cada story.

## 6. analyze  *(recomendado)*
Cruza spec ↔ plan ↔ tasks. Reporta (NO edita):
- `FR-###` sin tarea (cobertura faltante) · tareas sin `FR`/artículo (huérfanas).
- Inconsistencias spec↔plan · ambigüedades residuales · violaciones de constitución.
En Altorra esto ≈ el review adversarial; escala con `adversarial-review`/`caza-bugs` si el riesgo lo amerita.

## 7. implement
1. Ejecuta `tasks.md` en orden. TDD donde la constitución lo exige (test rojo → verde).
2. Al tocar estado observable → `caza-bugs` (recorrer el camino vivo, estado-cero).
3. **Verifica contra los Success Criteria MEDIBLES de la spec** (no "parece andar").
4. Cierre: spec sin marcadores · Constitution Check ✅ · analyze limpio · criterios cumplidos.

## Anti-patrones (qué NO hacer)
- Saltar de la idea directo al código (el problema que SDD resuelve).
- Meter tecnología en la spec / requisitos de negocio en el plan.
- Rellenar huecos con suposiciones en vez de `[NEEDS CLARIFICATION]`.
- Tareas sin archivos nombrados · implementación antes del test (viola Test-First).
- Sobre-procesar lo trivial: para un fix de una línea, esto es overkill (ver SKILL §0.1).
