# Feature Specification: [NOMBRE DE LA FEATURE]

> Plantilla de **spec** (QUÉ/POR-QUÉ). Derivada de github/spec-kit (MIT). Reglas:
> - Describe necesidades de USUARIO y NEGOCIO, no tecnología. CERO stack/APIs/esquema/código.
> - Marca todo lo no especificado con `[NEEDS CLARIFICATION: pregunta concreta]`. NO adivines.
> - Cada user story debe ser **independientemente testeable** (entrega valor sola).
> - Criterios de éxito **medibles y agnósticos de tecnología**.
> - Reemplaza los ejemplos genéricos por contenido real antes de planear (ACTION REQUIRED).

**Feature ID**: `<NNN-slug>` · **Branch**: `<NNN-slug>` · **Estado**: Draft | Clarified | Planned
**Fecha**: <YYYY-MM-DD> · **Dueño de la decisión**: <quién aprueba>

## 1. Resumen (1 párrafo)
Qué es y para quién, en lenguaje de negocio. El "por qué" en una frase.

## 2. User Scenarios & Testing  *(obligatorio)*
> Historias priorizadas. P1 = MVP imprescindible · P2 = importante · P3 = deseable.
> Cada una INDEPENDIENTE: se puede desarrollar, testear y desplegar sola.

### US1 — [título] (Prioridad: P1)
**Como** <rol> **quiero** <capacidad> **para** <beneficio>.
**Por qué esta prioridad**: <justificación de valor>.
**Test independiente**: <cómo se prueba sola, sin las otras historias>.
**Criterios de aceptación** (Given-When-Then):
- **Given** <contexto> **When** <acción> **Then** <resultado observable>.
- **Given** … **When** … **Then** …

### US2 — [título] (Prioridad: P2)
… (mismo formato)

### US3 — [título] (Prioridad: P3)
…

## 3. Edge Cases  *(obligatorio)*
- Condiciones de borde, entradas inválidas, estado-cero (vacío→1, N→vacío), concurrencia.
- Qué pasa cuando <falla X>? Cómo se comunica al usuario?

## 4. Requirements  *(obligatorio)*
> Funcionales numerados `FR-###`. Cada uno trazable a ≥1 user story. Sin tecnología.
- **FR-001**: El sistema DEBE <comportamiento observable>.
- **FR-002**: El sistema DEBE <…>.
- **FR-003**: El sistema DEBE <…> `[NEEDS CLARIFICATION: <qué falta definir>]`.

### Requisitos no funcionales (si aplica)
- **NFR-001**: <performance / seguridad / accesibilidad / legal> con umbral medible.

## 5. Key Entities  *(si hay datos)*
> Conceptos del dominio (NO esquema de BD). Nombre + qué representa + relaciones clave.
- **<Entidad>**: <qué es>; se relaciona con <…>.

## 6. Success Criteria  *(obligatorio — medibles, agnósticos de tecnología)*
- **SC-001**: <métrica observable> alcanza <umbral> (ej: "el usuario completa la compra en ≤ 3 pasos").
- **SC-002**: <…>.
> Mal: "la API responde rápido". Bien: "el resultado aparece en < 2 s para el 95% de los casos".

## 7. Assumptions
- Decisiones por defecto sobre alcance, usuarios y dependencias (lo que se asume si nadie objeta).

## 8. Out of Scope
- Lo que esta feature explícitamente NO hace (anti-scope-creep).

---
## ✅ Checklist de calidad de la spec (gate antes de /plan)
- [ ] CERO marcadores `[NEEDS CLARIFICATION]` abiertos.
- [ ] Cada user story es independientemente testeable y tiene prioridad.
- [ ] Cada `FR-###` traza a una user story; ninguno trae tecnología.
- [ ] Criterios de éxito medibles y agnósticos de tecnología.
- [ ] Sin features especulativas ("might need"); todo traza a una historia real.
- [ ] Edge cases y estado-cero cubiertos.
