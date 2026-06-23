---
name: proceso-decision-fuerte
description: Pipeline de validación multi-capa para DECISIONES FUERTES (arquitectura, modelo de datos, seguridad/legal, operaciones irreversibles, cambios multi-subsistema). Orquesta verificación → comité acotado → consejo externo (Gemini) → análisis crítico que VERIFICA cada claim → revalidación → veredicto → implementación verificada por fase. Usar cuando la tarea es cara de revertir y un fallo sería costoso. NO usar para lo trivial/reversible/mecánico (sería derroche y se cuelga, lección L-50).
---

# 🛡️ Proceso de Decisión Fuerte — Pipeline de Validación Multi-Capa

> **Por qué existe (pedido del dueño, 2026-06-22):** una decisión grande no puede depender de una
> sola pasada ni de un solo revisor. Este pipeline apila **capas independientes** de validación —
> cada una caza lo que la anterior no vio — para que la probabilidad de fallo sea mínima.
> **Validado en vivo:** en la reestructura del bot (cars TODO-34), el comité cazó un **bloqueante
> LEGAL (Ley 1581)** y un fallo de arquitectura que el red-team de Gemini NO había visto.

## ⚠️ Paso 0 — GATE (lo PRIMERO: ¿esto merece el pipeline?)
Aplica el pipeline COMPLETO **solo** a una **Decisión Fuerte**: arquitectura / modelo de datos /
seguridad / legal / operación irreversible / fork 50-50 / cambio multi-subsistema (criterios en
`docs/15-CONSEJO-EXTERNO.md §2`). **Lo trivial / reversible / mecánico → trabajo directo.**
Aplicar la maquinaria pesada a TODO no reduce fallos: los crea (cuelgues, derroche, parálisis —
lección dura L-50). *Minimizar fallos ≠ máxima ceremonia.* Decidir NO sobre-aplicarlo **ES** el criterio.

## El pipeline (7 pasos)
1. **VERIFICAR (ground truth).** Lee el código/estado/datos REALES y arma el diagnóstico verificado.
   NO asumas (§3.3 / §19). Sin esto, todas las capas siguientes opinan sobre el aire.
2. **COMITÉ ACOTADO #1** (skill `comite-expertos`) sobre el diagnóstico verificado. 3-5 expertos por
   TEMA, con **tensión**: ≥1 escéptico (busca el fallo fatal) + ≥1 ejecutor ("¿se puede de verdad?,
   ¿primer paso?"). ACOTADO obligatorio (↓). Salida: hallazgos + ángulos que no viste.
3. **CONSEJO EXTERNO (Gemini vía Antigravity).** Genera un prompt autocontenido DESDE los hallazgos del
   comité. **Anti-anclaje (R1):** pásale el problema CRUDO + las opciones descartadas + las invariantes,
   no tu conclusión ya pulida (si no, confirma tu hipótesis en vez de refutarla). El dueño lo corre
   (humano en el medio) y trae la respuesta. Detalle: `docs/15-CONSEJO-EXTERNO.md`.
4. **ANÁLISIS CRÍTICO de Gemini — la regla de oro del dueño.** NO adoptes nada a ciegas:
   **VERIFICA cada afirmación de Gemini contra hechos reales** (Gemini puede alucinar o equivocarse
   sobre el código). Adopta lo verificado; **refuta con razón** lo falso. Gemini es insumo, NUNCA oráculo.
   (Lo mismo aplica al comité: tampoco asumas que el comité acertó — marca lo "NO verificado aún".)
5. **COMITÉ ACOTADO #2 (revalidación)** sobre el plan YA integrado (post-Gemini). Corre SOLO si el plan
   cambió de fondo o como sign-off final. Si converge sin hallazgos nuevos, **se OMITE** (no es ritual).
   *Orden flexible:* si ya hiciste Gemini ANTES del comité, el comité #1 ES la revalidación post-Gemini
   y no necesitas un 2º. Adapta el orden a la realidad, no por ceremonia.
6. **VEREDICTO.** TÚ decides y defines qué se hace. Cita qué verificaste y qué refutaste. Si el proceso
   destapó una **nueva** Decisión Fuerte (un fork que nadie había planteado), vuelve al dueño ANTES de codear.
7. **IMPLEMENTAR con verificación POR FASE.** build → caza-bugs del camino vivo (skill `caza-bugs`) →
   corregir → revalidar. Cada fase cierra SOLO cuando se verifica (no "ya casi"). Reporta lo verificado.

## ⚖️ ACOTADO — correr la maquinaria sin colgarse (lección L-50, VINCULANTE)
- **Primitiva anti-cuelgue:** a los agentes que solo RAZONAN, pásales TODO el contexto **inline** +
  **schema de salida**, e instrúyelos a NO usar herramientas ni leer archivos. (Un sub-agente en
  background que llama una tool gateada por permiso — `git`, `Read`/Bash fuera del cwd — SE CUELGA
  esperando una aprobación que nadie da.) 3-5 expertos, no 30. El timeout lo da el harness, no el prompt.
- **Bounded ≠ tacaño:** gasta lo necesario para la calidad; un fan-out de 30 que relee el SDK no es
  calidad, es derroche.
- **Si se cuelga:** `TaskStop` + rescata lo que terminó; el arreglo real es la PREVENCIÓN (inline+schema),
  no "seguir con los sobrevivientes".

## Entrega (en el chat, español, Markdown — sin informes HTML)
El **VEREDICTO** + qué cazó cada capa (qué vio el comité que Gemini no, y viceversa) + qué **verificaste
vs refutaste** + las decisiones que quedan para el dueño. Honesto: si una capa cambió la conclusión, dilo.

## Cuándo NO usar esta skill
Tareas reversibles, mecánicas, o de un solo dato. Decisiones de gobernanza menores. Cuando el dueño ya
decidió y solo quiere ejecutar. En esos casos: trabajo directo (+ caza-bugs si toca estado observable).
