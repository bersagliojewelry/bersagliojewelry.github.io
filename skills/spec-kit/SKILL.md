---
name: spec-kit
description: Spec-Driven Development (SDD) — el método de GitHub spec-kit para construir software CON IA con rigor. Úsalo ANTES de codear una funcionalidad o proyecto NUEVO no trivial: convierte una idea vaga en spec ejecutable → plan técnico → tareas ordenadas → implementación verificable, en vez de saltar directo a código. El flujo de 7 fases (constitution → specify → clarify → plan → tasks → analyze → implement) separa el QUÉ/POR-QUÉ (spec, estable, sin tecnología) del CÓMO (plan, tecnología+arquitectura) de las TAREAS (unidades ejecutables [P]-paralelizables), marca lo ambiguo con [NEEDS CLARIFICATION] (no adivinar), y mete gates de constitución (test-first, simplicidad, anti-abstracción). Triggers — "armemos una spec", "spec-driven", "planeemos bien esta feature antes de codear", "convierte este requerimiento en plan/tareas", "constitution del proyecto", "quiero specs ejecutables", construir algo nuevo desde cero con calidad. NO uses para: fixes triviales, ediciones de una línea, hacking exploratorio, o depurar un bug ya reproducible (eso es systematic-debugging). Portable: cero rutas de un repo; adapta al stack del proyecto activo.
---

# 🧭 Spec-Kit — Spec-Driven Development (SDD)

> Port portable del método **GitHub spec-kit** (https://github.com/github/spec-kit, MIT).
> spec-kit normalmente instala slash-commands `/speckit.*` + plantillas vía el CLI `specify`.
> Esta skill captura el MÉTODO y las PLANTILLAS para ejecutarlo en cualquier proyecto sin el CLI.
> Plantillas verbatim-adaptadas → `references/`. Cuándo escalar y cómo, abajo.

## 0. La inversión (por qué importa)
**El código sirve a la spec, no al revés.** En SDD la spec en lenguaje natural es la *fuente de
verdad*; el código es la "última milla" generada. Mantener: *Maintenance = evolucionar la spec ·
Debugging = arreglar la spec/plan que generó código incorrecto · Refactor = reestructurar para
claridad.* El objetivo no es reemplazar al humano: es **amplificarlo automatizando la traducción
mecánica** spec→código, dejando criterio/creatividad para la persona.

## 0.1 Cuándo aplica / cuándo NO
- **SÍ**: feature/proyecto NUEVO no trivial · requerimiento ambiguo que hay que aterrizar ·
  cuando "saltar a código" produciría re-trabajo · cuando varias personas/agentes deben alinearse.
- **NO**: fix de una línea · refactor puro · bug ya reproducible (→ `systematic-debugging`) ·
  exploración throwaway. **No sobre-procesar lo trivial** (mismo principio de `caza-bugs`).
- **Combina con**: `arquitecto-software` (los 6 pilares en /plan), `caza-bugs` (recorrer el camino
  vivo en /implement), `comite-expertos`/`proceso-decision-fuerte` (decisiones fuertes del /plan),
  `test-driven-development` (el test-first de la constitución).

## 1. Las 3 separaciones innegociables
| Artefacto | Responde | Contiene | NO contiene |
|---|---|---|---|
| **Spec** (QUÉ/POR-QUÉ) | qué necesita el usuario y por qué | user stories priorizadas (P1/P2/P3), criterios de aceptación Given-When-Then, requisitos `FR-###`, criterios de éxito MEDIBLES y agnósticos de tecnología | stack, APIs, esquema de datos, estructura de código |
| **Plan** (CÓMO) | con qué tecnología y arquitectura | contexto técnico, elección de stack CON rationale, modelo de datos, contratos de API, escenarios de test, gates de constitución | el desglose de tareas (eso va en tasks) |
| **Tasks** | en qué orden y qué se paraleliza | `[ID] [P?] [Story] Descripción`, dependencias, test-antes-de-implementación | decisiones de arquitectura nuevas (ya están en plan) |

Si te descubres metiendo "React/Postgres/endpoint" en la **spec** → STOP, eso es plan. La spec
sobrevive a los cambios de tecnología.

## 2. La regla [NEEDS CLARIFICATION] (honestidad epistémica — el corazón del método)
**No adivines.** Cuando la spec no define algo, márcalo: `[NEEDS CLARIFICATION: método de auth no
especificado — email/contraseña, SSO, OAuth?]`. Un LLM que rellena huecos con suposiciones
plausibles-pero-equivocadas es la fuente nº1 de re-trabajo. Los marcadores:
- fuerzan checkpoints de revisión con el dueño,
- mantienen la spec testeable,
- **son un GATE**: "no quedan marcadores [NEEDS CLARIFICATION]" debe cumplirse ANTES de planear.
Esto es el mismo ADN que el §3.3 del cerebro ("verifica, no asumas") aplicado a requisitos.

## 3. La Constitución (el ADN arquitectónico)
Antes de specs, fija los principios NO-negociables del proyecto en `constitution.md`
(plantilla → `references/constitution-template.md`). Defaults fuertes de spec-kit:
- **Test-First (NO-NEGOCIABLE)**: no se escribe código de implementación antes de tests escritos,
  aprobados, y confirmados en ROJO (fallando). Invierte el reflejo de la IA de "código primero".
- **Simplicidad / Anti-abstracción**: empezar mínimo (≤ pocos proyectos), usar el framework
  directo en vez de envolverlo; toda capa de complejidad se JUSTIFICA en "Complexity Tracking".
- **Integración real**: preferir BD/servicios reales sobre mocks; contract tests antes de implementar.
- **Artículos del proyecto**: slots para los no-negociables propios (seguridad, versionado, perf…).
  En Altorra: cero-fugas-de-leads, Ocultar≠Borrar, run-paralelo, Ley 1581/legal con abogado.
La constitución es estable; enmendarla exige rationale + aprobación + evaluación de compatibilidad.

## 4. El flujo de 7 fases (el playbook)
Ejecuta en orden; cada fase produce un artefacto y pasa su gate antes de seguir. Detalle
comando-por-comando + checklists → `references/workflow.md`.

1. **constitution** → `constitution.md`. Principios de gobernanza. (Una vez por proyecto; reusar.)
2. **specify** → `specs/<NNN-slug>/spec.md` (plantilla `references/spec-template.md`). La idea →
   spec estructurada: user stories P1/P2/P3 *independientemente testeables*, requisitos `FR-###`,
   criterios de éxito medibles. Marca ambigüedades con `[NEEDS CLARIFICATION]`.
3. **clarify** → resuelve los `[NEEDS CLARIFICATION]` con preguntas estructuradas al dueño; anexa
   sección "Clarifications". **Gate: cero marcadores abiertos** antes de planear.
4. **plan** → `specs/<...>/plan.md` (+ `data-model.md`, `contracts/`, `research.md`, `quickstart.md`;
   plantilla `references/plan-template.md`). Stack + arquitectura + **Constitution Check** (gate
   antes de Fase 0; re-check tras el diseño). Aquí aplica `arquitecto-software` (6 pilares).
   → **Audita el plan** con el subagente **`plan-auditor`** (revisión adversarial vs constitución+spec,
   caza sobre-ingeniería y requisitos sin cubrir) ANTES de generar tareas.
5. **tasks** → `specs/<...>/tasks.md` (plantilla `references/tasks-template.md`). Desglose ordenado
   por fases (Setup → Foundational[bloquea todo] → User Stories[por prioridad, paralelizables] →
   Polish), notación `[ID] [P?] [Story]`, test-antes-de-implementación.
6. **analyze** (opcional, recomendado) → validación CRUZADA spec↔plan↔tasks: huecos de cobertura,
   inconsistencias, requisitos sin tarea, tareas sin requisito. No edita; reporta. → subagente
   **`spec-analyze`** (read-only) hace exactamente esto y devuelve veredicto READY / NOT-READY.
7. **implement** → ejecuta las tareas en orden, TDD donde aplique. Al tocar estado observable,
   recorre el **camino vivo** (`caza-bugs`). Verifica contra los criterios de éxito de la spec.

Extras de spec-kit: `converge` (medir código vs spec → tareas faltantes), `checklist` (checklist de
calidad por dominio), `taskstoissues` (tasks → GitHub issues).

## 5. Plantilla-como-prompt (por qué las plantillas son el truco)
Las plantillas no son formularios: son *prompts que restringen al LLM hacia calidad* —
(1) fuerzan el nivel de abstracción correcto (spec sin tecnología), (2) obligan a marcar
incertidumbre, (3) traen checklists que actúan como "tests unitarios de la spec", (4) ordenan
test-antes-de-código, (5) prohíben features especulativas ("might need" → cada feature trazable a
una user story concreta). Usa SIEMPRE la plantilla de `references/`; no improvises la estructura.

## 6. Adaptación a Claude Code (sin el CLI `specify`)
- Escribe los artefactos en `specs/<NNN-slug>/` del repo activo (o donde el proyecto convenga).
- Numera features secuencialmente (`001`, `002`, …); slug semántico del nombre.
- Si el proyecto YA tiene su propia disciplina (p.ej. el cerebro Altorra: ADR/IAP §37/spec en
  `docs/superpowers/specs/`), **mapea** las fases a esa disciplina en vez de duplicar — la spec de
  spec-kit ≈ el IAP+spec; el plan ≈ el ADR de diseño; analyze ≈ el review adversarial.
- Para un proyecto sin disciplina propia, esto ES la disciplina: úsalo tal cual.

## 7. El gate de cierre (no es teatro)
Una corrida SDD está completa cuando: spec sin `[NEEDS CLARIFICATION]` · plan pasó Constitution
Check · tasks cubren todos los `FR-###` (analyze limpio) · implement verificado contra los
criterios de éxito MEDIBLES de la spec (no "parece andar"). Si falta uno, vuelve a su fase.

## 8. Subagentes companion (las "herramientas" del método)
Dos subagentes read-only (en `~/.claude/agents/`; fuente versionada en `agents/` de esta skill):
- **`plan-auditor`** — revisión adversarial del `plan.md` vs constitución+spec ANTES de tareas
  (caza sobre-ingeniería, complejidad sin justificar, requisitos sin cubrir). Sesgo: simplicidad.
- **`spec-analyze`** — chequeo CRUZADO spec↔plan↔tasks ANTES de implementar (FR sin tarea, tareas
  huérfanas, `[NEEDS CLARIFICATION]` abiertos, violaciones de constitución). Veredicto READY/NOT.
Ambos REPORTAN, no editan (fiel a "analyze no edita"). Invócalos por nombre vía Task.

> Crédito: método y plantillas derivados de **github/spec-kit** (MIT). Esta skill es una adaptación
> portable; la fuente canónica del CLI/commands evoluciona en el repo original.
