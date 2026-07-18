---
name: proceso-decision-fuerte
description: Pipeline de validación multi-capa para DECISIONES FUERTES (arquitectura, modelo de datos, seguridad/legal, operaciones irreversibles, cambios multi-subsistema). Orquesta verificación → comité acotado → consejo externo (Gemini) → análisis crítico que VERIFICA cada claim → revalidación → veredicto → implementación verificada por fase. Usar cuando la tarea es cara de revertir y un fallo sería costoso. NO usar para lo trivial/reversible/mecánico (sería derroche y se cuelga, lección cars-L-50).
---

# 🛡️ Proceso de Decisión Fuerte — Pipeline de Validación Multi-Capa

> **Por qué existe (pedido del dueño, 2026-06-22):** una decisión grande no puede depender de una
> sola pasada ni de un solo revisor. Este pipeline apila **capas independientes** de validación —
> cada una caza lo que la anterior no vio — para que la probabilidad de fallo sea mínima.
> **Validado en vivo:** en la reestructura del bot (cars TODO-34), el comité cazó un **bloqueante
> LEGAL (Ley 1581)** y un fallo de arquitectura que el red-team de Gemini NO había visto.

## ⚠️ Paso 0 — GATE (lo PRIMERO: ¿esto merece el pipeline?)
Aplica el pipeline COMPLETO a una **Decisión Fuerte** (arquitectura / modelo de datos / seguridad / legal /
operación irreversible / fork 50-50 / cambio multi-subsistema, criterios en `docs/15-CONSEJO-EXTERNO.md §2`)
**O a un trabajo de DISEÑO/UI no trivial** (layout/jerarquía/patrón visual que se repite en el sitio).
**Lo trivial / reversible / mecánico → trabajo directo.**
Aplicar la maquinaria pesada a TODO no reduce fallos: los crea (cuelgues, derroche, parálisis —
lección dura cars-L-50). *Minimizar fallos ≠ máxima ceremonia.* Decidir NO sobre-aplicarlo **ES** el criterio.

> 🔒 **REGLA DURA — COMPLETO o no se aplicó (Daniel 2026-06-25, tras aplicarlo a medias):** cuando el GATE
> dispara, se recorren TODAS las capas que apliquen y se entregan al dueño SIN que los pida los **3 artefactos
> visibles**: (a) **MOCKUP** del diseño (si es UI) · (b) **prompt de CONSEJO EXTERNO** (Gemini, para que el dueño
> lo corra) · (c) **VALIDACIÓN LIVE** en navegador real — **YO conduzco la extensión Claude-in-Chrome** (el dueño
> solo debe estar logueado) y entrego el REPORTE de lo recorrido/hallado, NO un prompt. (El "prompt de Chrome" es
> solo FALLBACK si la extensión NO está conectada.) **Falta uno → el flujo está INCOMPLETO.** El flujo no
> puede depender de recordar piezas sueltas: el checklist canónico vive en **W-11 (`docs/60-WORKFLOWS.md`)**.

## 🧰 Los 6 instrumentos y su ORDEN (evidencia ANTES de deliberación; el gate empírico cierra)
Pedido del dueño (2026-06-25): cuando el GATE dispara una Decisión Fuerte, el flujo se aplica con sus
**6 instrumentos COMPLETOS**, en este orden. Regla madre: **las capas de EVIDENCIA preceden a las de
OPINIÓN — ninguna opinión corre sobre aire** (basura entra, basura sale).

**FASE A — EVIDENCIA (ground-truth verificado, ANTES de opinar):**
1. **SKILLS** — orquestan el método (esta skill + `validacion-live-chrome` / `caza-bugs` / `deep-research`
   / skill de dominio). Eligen CÓMO se aplican los demás instrumentos.
2. **PLUGINS (MCP)** — DOS usos: **(a) verificar el SISTEMA VIVO** (no inferir del código): MCP del backend
   (p.ej. **firebase MCP**: `firestore_query_collection`, `functions_get_logs`) lee datos/logs/estado REALES;
   `deep-research`/firecrawl traen evidencia externa. **Si un plugin PUEDE leerlo del sistema vivo, NO lo adivines.**
   **(b) en DISEÑO/UI → generar un MOCKUP** con un plugin de diseño (`visualize`/`show_widget` para reglas de
   layout — rápido, inline; Stitch/Canva/Figma para rediseño visual): "muéstrame cómo debe quedar" → YO verifico/
   delibero (no acato a ciegas). Un render funcional ≠ buen diseño (`feedback_flujo_diseno_mockup`).
3. **EXTENSIÓN (Chrome)** — verifica la **SUPERFICIE VIVA** (UI/UX/flujo del usuario real) en la sesión del dueño
   (`validacion-live-chrome` + plugins `chrome-devtools`/`playwright`/Claude-in-Chrome; postura adversarial: romper,
   no aprobar). ⭐ **Modo DIRECTO (default):** YO conduzco la extensión (`mcp__claude-in-chrome__*`) y entrego el
   REPORTE de la validación live — la lista CERRADA de caminos estado-cero + borde que YO recorrí. Solo si la
   extensión NO está conectada → fallback: paso al dueño un "prompt de Chrome".
4. **AGENTES (BOUNDED)** — paralelizan recolección/análisis cuando es amplio; SIEMPRE acotados (in-cwd,
   inline+schema, sin tools gateadas — L-50). **Nunca fan-out grande/background aquí** (cuelga + quema).
→ Producto de Fase A: **diagnóstico VERIFICADO** (hechos citables, no opiniones).

**FASE B — DELIBERACIÓN (sobre la evidencia de Fase A):**
5. **COMITÉ** acotado (`comite-expertos`) razona sobre el diagnóstico verificado (lógica/trade-offs).
6. **CONSEJO** (Gemini/Antigravity, `docs/15`) crítica adversarial externa → **YO verifico cada claim**
   (la gema, paso 4). → **VEREDICTO** (yo) → **implementar por fase** → **EXTENSIÓN (gate empírico live)**
   cierra con Pruebas de Estado.

**Por qué "nunca falla":** evidencia (2-4) SIEMPRE antes que opinión (5-6), y el gate empírico (extensión
live) SIEMPRE al final. Saltar Fase A = comité/Gemini opinan sobre aire. El GATE (Paso 0) sigue mandando:
en lo S/M corre el núcleo seco; el flujo de 6 COMPLETO es para lo irreversible/caro (cars-L-50).

> Mapa instrumentos→pasos: SKILLS=transversal · PLUGINS+EXTENSIÓN+AGENTES=paso 1 (Verificar) + paso 7
> (gate) · COMITÉ=pasos 2/5 · CONSEJO=pasos 3/4 · VEREDICTO=paso 6.

## El pipeline (7 pasos)
1. **VERIFICAR (ground truth).** Lee el código/estado/datos REALES y arma el diagnóstico verificado.
   NO asumas (§3.3 / §19). Sin esto, todas las capas siguientes opinan sobre el aire. **Usa la Fase A
   COMPLETA:** plugins MCP (datos/logs del sistema vivo) + extensión (superficie viva) + agentes bounded,
   no solo lectura de código — el código dice qué DEBERÍA pasar; el sistema vivo dice qué ESTÁ pasando.
1.5. **DISEÑO DE ARQUITECTO** (skill `arquitecto-software`, 6 pilares: negocio·escalabilidad·seguridad·
   costos·mantenibilidad·comunicación) — **CONDICIONAL pero con valor real.** Para decisiones ESTRUCTURALES
   (arquitectura / modelo de datos / que tocan ≥2 pilares): corre el arquitecto ANTES del comité. Su valor NO
   es "una etapa más" — es **separar PROPONER de CRITICAR**: el arquitecto entrega un **diseño candidato
   CONCRETO** (+ explícito "lo que NO verifiqué") y el comité lo ATACA fresco, en vez de generar un diseño
   difuso anclado a sí mismo. Para Decisiones Fuertes NO-estructurales, el arquitecto NO es etapa aparte: vive
   como ROL OBLIGATORIO dentro del comité (evita duplicar y anclar — escéptico 2026-06-23). + skill de dominio
   del proyecto SOLO si el GATE detecta ese dominio. **Anti-amplificación:** arquitecto y comité razonan sobre
   el MISMO diagnóstico — si el ground-truth estaba mal, AMBOS lo amplifican con más confianza; re-pregunta
   "¿qué evidencia respalda este diagnóstico?" antes de apilar capas.
2. **COMITÉ ACOTADO #1** (skill `comite-expertos`) sobre el diagnóstico verificado. 3-5 expertos por
   TEMA, con **tensión**: ≥1 escéptico (busca el fallo fatal) + ≥1 ejecutor ("¿se puede de verdad?,
   ¿primer paso?"). ACOTADO obligatorio (↓). Salida: hallazgos + ángulos que no viste.
3. **CONSEJO EXTERNO (Gemini vía Antigravity).** Genera un prompt autocontenido DESDE los hallazgos del
   comité. **Anti-anclaje (R1):** pásale el problema CRUDO + las opciones descartadas + las invariantes,
   no tu conclusión ya pulida (si no, confirma tu hipótesis en vez de refutarla). El dueño lo corre
   (humano en el medio) y trae la respuesta. **Doble-ciego preferible (Gemini §101, 2026-06-23):** cuando
   la latencia humana lo permita, corre Gemini sobre el problema CRUDO en PARALELO al comité (ninguno ve
   las conclusiones del otro) → opinión independiente real, no un sello de confirmación. Detalle: `docs/15-CONSEJO-EXTERNO.md`.
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
7. **IMPLEMENTAR + GATE EMPÍRICO con Pruebas de Estado (mandatorio — la capa que las anteriores NO sustituyen).**
   Deliberar NO es verificar; **"verificado" JAMÁS se reporta sobre análisis estático/opinión.** Cada fase
   cierra SOLO con EVIDENCIA real: build verde + caza-bugs del camino vivo en entorno **REAL** (navegador real
   `Playwright`/emulador, NO preview headless — cars-L-05) + (reglas/dinero) test del emulador. Antes del gate humano
   de algo **IRREVERSIBLE**, entrega **Pruebas de Estado** (log de build/test, captura, métrica, recurso medido):
   el dueño aprueba sobre EVIDENCIA, no sobre "pasó N filtros" (anti **teatro-de-seguridad**; N capas de opinar
   no son 1 de probar). *Validado en vivo 2026-06-23:* §99 (flash) FALLÓ por verificar en preview headless; §100
   lo resolvió con navegador real + evidencia. Lección cars-L-45 *(cita de cars; atribución por re-verificar allá)*.
   **El 80% del valor real (lección 2026-06-23):** el gate empírico NO es "build verde" — es una **LISTA
   CERRADA de caminos de ESTADO-CERO y borde** que el arquitecto/comité ENUMERA y `caza-bugs` RECORRE uno por
   uno; el gate reporta **QUÉ caminos recorrió** (no "pasó"), porque el fallo más común es el caso-feliz
   declarado "verde" mientras el bug vivía en el camino que nadie recorrió. Si `caza-bugs` halla un bug →
   `systematic-debugging` (no opinar). Criterio de éxito definido ANTES de codear (`test-driven-development` /
   `verification-before-completion`, en el Veredicto).

## 🗺️ Mapa de skills (GATILLO → skill · CONDICIONAL, NO checklist)
Skill nombrada = **gatillo + acción, nunca catálogo recitado.** El dominio se detecta en el GATE; cada skill
dispara SOLO si su gatillo aplica (meter `legal-colombia` en una decisión de cache = teatro de cobertura).

| Etapa | Skill | Gatillo (si NO aplica → saltar) |
|---|---|---|
| Diseño | `arquitecto-software` | decisión estructural (≥2 de los 6 pilares) |
| Diseño | skill de dominio del proyecto (legal/CRM/CMS/…) | SOLO si el GATE detecta ese dominio |
| Verificar (Fase A) | **PLUGINS MCP del backend** (p.ej. firebase MCP) | hay estado/datos/logs VIVOS que leer del sistema real (Firestore, function logs, mensajería) — no inferir del código |
| Verificar (Fase A) | **`validacion-live-chrome`** (extensión) | hay superficie viva del usuario (UI/chat/flujo) que recorrer en prod |
| Verificar/Diseño | `deep-research` (+ firecrawl-*) | falta EVIDENCIA externa (estándares, precedentes legales, datos de mercado) — no inventar |
| Diseño/Mockup | `frontend-design` + plugin de diseño (`visualize`/`show_widget`/Stitch/Canva/Figma) | tarea de DISEÑO/UI → **mockup OBLIGATORIO** (`feedback_flujo_diseno_mockup`); yo verifico/delibero |
| Crítica | `comite-expertos` | siempre (Decisión Fuerte) |
| Crítica | `asesor-critico-honesto` | fallback anti-anclaje/anti-complacencia si NO hay Gemini (sin tokens) |
| Veredicto | `test-driven-development` / `verification-before-completion` | define el criterio de éxito ANTES de codear |
| Gate empírico | `caza-bugs` | siempre que haya estado observable |
| Gate empírico | `systematic-debugging` | cuando `caza-bugs` halla un bug |

> **Fuera del pipeline de decisión:** `auditoria-cerebro` / `claude-md-improver` = mantenimiento de cerebro
> POST-cierre, no capas de validación. No los metas como etapa.

## 🎯 Cada capa caza un error DISTINTO (regla anti-solape)
Plugins-MCP→**realidad del backend** (lo que el sistema vivo HACE vs lo que el código dice) · Extensión→**realidad
de la superficie** (UX/flujo del usuario real) · Verificar→**hecho** (ground-truth falso) · Arquitecto→**diseño/omisión**
(6 pilares) · Comité→**razonamiento** (lógica/trade-offs) · Gemini→**anclaje/punto-ciego** · Verificar-Gemini→**alucinación
importada** · Gate empírico→**realidad** (lo que falla pese a todo). **Si dos capas cazan el MISMO tipo → fúndelas.** El Comité
#2 es el candidato a redundancia: solo como re-verdict ante claims NUEVOS, nunca por defecto.

## 📏 Intensidad — el GATE clasifica (S/M/L), no todo es pipeline completo
**Núcleo seco SIEMPRE (~4 pasos): GATE → Verificar → Comité acotado → Gate empírico.** Condicional (gated,
disparador declarado): arquitecto separado · Gemini (solo R1-R4: seguridad/dinero/arquitectura/legal) ·
Comité #2 (solo si #1 quedó dividido) · skills de dominio. **Mediano = núcleo seco; pipeline completo = solo
lo irreversible/caro.** *El error a minimizar es DECIDIR mal, no SALTAR pasos* (cars-L-50: sobre-ceremonia CREA fallos).

## ⚖️ ACOTADO — correr la maquinaria sin colgarse (lección cars-L-50, VINCULANTE)
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
**🔒 Los 3 artefactos visibles (Diseño/UI o cualquier UI observable) son OBLIGATORIOS en la entrega — sin que el
dueño los pida:** (a) **mockup** · (b) **prompt de consejo externo** (Gemini, listo para pegar) · (c) **REPORTE de la
validación live conducida por MÍ** (modo DIRECTO; el "prompt de Chrome" es solo FALLBACK si la extensión no está
conectada — igual que la REGLA DURA de arriba y W-11). Falta uno → entrega INCOMPLETA, vuelve y complétala.

## Cuándo NO usar esta skill
Tareas reversibles, mecánicas, o de un solo dato. Decisiones de gobernanza menores. Cuando el dueño ya
decidió y solo quiere ejecutar. En esos casos: trabajo directo (+ caza-bugs si toca estado observable).
