---
name: auditoria-cerebro
description: Auditoría profunda Nivel-2 del cerebro documental del proyecto activo — lo que el linter estructural NO puede medir (fidelidad, frescura, función). Sondas FALSABLES sin puntaje numérico; cierra con GC pareado (masa-neta ≤0) y actualiza deepAudit en el manifest. Disparo - cuando brain-check imprime "auditoría Nivel-2 VENCIDA", antes de exportar el template a un repo nuevo, o a pedido ("audita el cerebro").
---

# 🔬 Auditoría de Cerebro — Nivel 2 (semántica)

> **Qué es**: el linter (`brain:check`) valida ESTRUCTURA (caps, huérfanas, refs). Esta skill valida
> lo que ningún linter puede: **¿el contenido es verdad? ¿está fresco? ¿el cerebro FUNCIONA como
> memoria?** Es la 2ª mitad del criterio "SANO" (evaluación de 2 niveles).
> **Anti-score-teatro**: SIN puntaje numérico (un score LLM no es reproducible). Cada sonda es
> FALSABLE: produce hallazgos con evidencia `archivo:línea` + comando de verificación, o pasa.
> **KPIs del lazo**: hallazgos REINCIDENTES (vs auditoría anterior) + tasa de re-investigación.

## Protocolo (en orden; cada sonda = subagente o verificación directa)

### Sonda 0 — Diff vs auditoría anterior (SIEMPRE primero)
Localiza la tabla de hallazgos de la auditoría anterior (en el `archiveDir` del manifest).
Para cada hallazgo previo: ¿cerrado con evidencia, abierto-tracked, o REINCIDENTE?
**Reincidente = regresión del lazo → meta-lección M-NN obligatoria en el nodo de lecciones.**

### Sonda 1 — Fidelidad de estado (la clase "App-Check ×3 estados")
Toma 3-5 hechos de estado declarados en los nodos always-on (05/10): versión desplegada, qué está
LIVE, branch, gates. Verifícalos contra la realidad (git log/origin, archivos, consola si aplica).
Cualquier contradicción entre nodos o vs la realidad = hallazgo (cita ambas fuentes).

### Sonda 2 — Frescura honesta
¿Los sellos de fecha de 05/10 reflejan su contenido? ¿Hay afirmaciones que caducan solas
("en sync con main", "X pendiente" ya hecho)? Contrasta vs `git log` real de los últimos días.

### Sonda 3 — RETRIEVAL-DRILL (la función, no el almacén) ⭐
Lanza un subagente FRÍO (sin este contexto) con SOLO el boot del proyecto (CLAUDE.md + 05 + 10) y
3-5 preguntas canónicas extraídas de casos REALES de re-investigación pasada (no del índice — eso
sería teatro de función). Ej.: "¿dónde vive X?", "¿por qué se decidió Y?", "¿qué NO debes reintentar?".
Mide: ¿llegó a la neurona correcta? ¿en cuántos saltos? ¿cuánto contexto quemó? Falla de retrieval
= hallazgo de ruteo (el conocimiento existe pero el cerebro no lo ENTREGA).

### Sonda 4 — Captura de deliberación (fidelidad, no presencia)
El linter (check #7) valida PRESENCIA. Tú validas FIDELIDAD: toma la última síntesis de deliberación
y pregunta: *¿una sesión fresca re-tomaría la MISMA decisión leyendo SOLO la síntesis?* ¿Los
"callejones probados" están? ¿Lo refutado tiene su porqué?

### Sonda 5 — Consistencia de la memoria del harness (MEMORY.md)
Si el harness mantiene una memoria propia (MEMORY.md / memoria de usuario): ¿APUNTA al cerebro o
DUPLICA estado? (regla SSoT). ¿Contradice algún nodo? Duplicación = hallazgo.

### Sonda 6 — Economía y caps
¿El boot creció desde la última auditoría? ¿Hay neuronas ≥90% sin plan de shard? ¿Texto narrativo
en el 10 que ya es ADR? (El linter da números; tú juzgas si el CONTENIDO que queda merece estar.)

### Sonda 7 — Voz adversarial (riesgos no estimados)
Un subagente pregunta: "¿qué falla de este cerebro NO está cubierta por ninguna sonda ni gate?"
Lo que encuentre alimenta la próxima versión de esta skill (anti-engorde: también propone QUITAR
gates que no cazaron nada en 2 auditorías).

## Cierre (obligatorio — la auditoría que no cierra es teatro)

1. **Tabla de hallazgos** máquina-legible (ID | severidad | categoría | hallazgo | evidencia | estado)
   → al `archiveDir` del manifest + fila en su README.
2. **Síntesis** como ADR en el historial del repo (+ fila en el índice), con línea-ancla `Deliberación:`.
3. **GC pareado (masa-neta)**: toda auditoría cierra con una poda equivalente — el delta de chars
   del boot tras la auditoría debe ser ≤ 0, o la auditoría está INCOMPLETA.
4. **Actualizar `deepAudit` en `docs/.brain-manifest.json`**: `last` = hoy, `coveredHeaderCount` =
   número actual de headers `## ` en el historial. (Esto apaga el nudge del linter — y es lo que
   hace al disparador auto-vigilado: si no lo actualizas, el nudge sigue encendido.)
5. Hallazgos accionables → filas TODO-NN en el nodo 10 (ledger único). NO crear docs de estado nuevos.

## Modo sin-tokens (fallback)
Sin presupuesto para subagentes: corre las sondas 0-2 y 6 tú mismo (verificación directa), marca
3-5 como `[PENDIENTE: requiere subagentes]` en la tabla, y actualiza deepAudit igual — una
auditoría parcial HONESTA vale más que una completa fingida.
