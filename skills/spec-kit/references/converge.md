# `converge` — medir el CÓDIGO YA ESCRITO contra spec/plan/tasks y apendar lo que falta

> **Origen (C4-4 · DICTAMEN-C4 §8 D-C4-14, aplicado 2026-09-03).** Método portado de
> `github/spec-kit`, plantilla `templates/commands/converge.md`, versión **1.0.4** (MIT), consultada el
> **2026-09-03**. Se porta **solo el MÉTODO, en español**: ni el CLI `specify`, ni sus scripts
> bash/PowerShell, ni el mecanismo de hooks de `.specify/extensions.yml` — esta skill evita el CLI a
> propósito (§6 del `SKILL.md`) y así sigue. Lo que queda abajo es el procedimiento, reexpresado.

## Por qué existe (y por qué aquí pesa el doble)

`analyze` compara los TRES papeles entre sí (spec ↔ plan ↔ tasks). `converge` compara **el código que
ya existe** contra esos papeles. Es la respuesta operativa a `39-ESCRITO-NO-ES-VIGENTE`: un plan
escrito no prueba que el repo lo cumpla, y una tarea marcada ✅ no prueba que el código esté. Aquí
`converge` es el procedimiento que convierte esa sospecha en una lista de tareas nuevas.

**No es un `diff`.** No mira git, ni ramas, ni historia: mide el ESTADO PRESENTE del código contra la
intención escrita. Un repo recién empezado no es un fallo del método — es «todo el alcance falta».

## El procedimiento (en orden; los pasos no se saltan)

1. **Localiza los tres artefactos** de la feature: `spec.md`, `plan.md`, `tasks.md`. Si falta
   cualquiera, PARA y dilo — sin los tres no hay contra qué converger. `constitution.md` es opcional:
   si existe y no es la plantilla vacía, sus principios `MUST` entran como criterio de severidad.
2. **Carga por revelación mínima**, no el fichero entero: de la spec, los requisitos `FR-###`, los
   criterios de éxito `SC-###`, las user stories con sus escenarios de aceptación y los casos borde;
   del plan, decisiones de arquitectura, modelo de datos y restricciones técnicas; de las tareas,
   solo los IDs existentes y el número de la última fase.
3. **Construye el inventario de intención**: cada `FR`, `SC` y escenario de aceptación recibe una
   clave estable (`US1/AC2`, `FR-014`…), y de plan+tasks sale la lista de ficheros/áreas en alcance.
   **No se infiere alcance fuera de lo que los artefactos declaran**: lo que nadie escribió no se
   audita aquí.
4. **Recorre el código en alcance** y anota SOLO donde hay hueco. Cuatro tipos:
   **`falta`** (no está), **`parcial`** (está a medias), **`contradice`** (el código va contra la
   intención escrita o contra un `MUST` de la constitución) y **`no pedido`** (existe y nadie lo
   pidió — se reporta para que alguien lo mire, no se borra). Cada hallazgo lleva: id, referencia a su
   origen (`FR-###`/`SC-###`/`US#/AC#`), tipo, severidad, descripción y **evidencia** (fichero:línea).
5. **Asigna severidad** con esta escala: **CRÍTICA** = viola un `MUST` de la constitución o bloquea
   una user story P1 · **ALTA** = hueco (falta/parcial) en un requisito central o en un criterio de
   aceptación · **MEDIA** = parcial en un requisito secundario, o «no pedido» de propósito dudoso ·
   **BAJA** = huecos menores o añadidos de bajo riesgo.
6. **Presenta la tabla ANTES de escribir nada**: hallazgos por severidad + los contadores (requisitos
   revisados, decisiones de plan revisadas, si hubo o no chequeo de constitución, hallazgos por tipo y
   por severidad). Quien lee decide antes de que el fichero cambie.
7. **Apenda las tareas nuevas a `tasks.md`, y NADA más.** Una sola cabecera nueva
   `## Fase N: Convergencia` (N = la siguiente al máximo existente), un ítem por hallazgo accionable,
   CRÍTICA y ALTA primero, con la forma
   `- [ ] T### <verbo en imperativo> según <referencia> (<tipo de hueco>)`. Los IDs siguen desde el
   máximo `T###` que ya había.
8. **Si no hay huecos, `tasks.md` no se toca — ni un byte**, y menos una cabecera vacía. Se reporta
   «✅ Convergido: la implementación satisface spec, plan y tasks» con los mismos contadores.
9. **Cierra diciendo qué sigue**: implementar las tareas nuevas, o revisar los «no pedido» con el
   dueño.

## Lo prohibido (esto es lo que hace fiable al método)

- **Solo se apenda, y solo en `tasks.md`.** Nunca se reescribe la spec ni el plan; nunca se reordena,
  renumera, edita ni borra una tarea existente; nunca se toca código de aplicación desde `converge`.
- **Las fases de Convergencia anteriores se dejan quietas**: la nueva se apenda debajo. Así la
  historia de convergencias es legible.
- **Nada de inferir alcance** más allá de los artefactos. Si el código hace algo que nadie escribió,
  eso es un hallazgo `no pedido`, no una excusa para ampliar el alcance sobre la marcha.
- **Sin git**: ni comparación de ramas, ni historial, ni «lo que cambió». Es una foto del presente.

## Cómo encaja con lo nuestro

- **Fase 6.5 del flujo**: va DESPUÉS de `implement` (o a mitad, cuando alguien hereda un repo con
  papeles viejos), no antes. `analyze` mira papeles; `converge` mira el repo.
- El subagente **`spec-analyze`** sigue siendo read-only y NO hace esto: `converge` sí escribe, pero
  solo apendando en `tasks.md`.
- La evidencia `fichero:línea` de cada hallazgo es el mismo estándar que exige §3.3 del router
  (evidencia leída este turno, no memoria) y el que usan `auditoria-cerebro` y `caza-bugs`.
