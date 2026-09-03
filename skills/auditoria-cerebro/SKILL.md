---
name: auditoria-cerebro
description: Auditoría profunda Nivel-2 del cerebro documental del proyecto activo — lo que el linter estructural NO puede medir (fidelidad, frescura, función). Sondas FALSABLES sin puntaje numérico; cierra con GC pareado (masa-neta ≤0) y actualiza deepAudit en el manifest. Disparo - cuando brain-check imprime "auditoría Nivel-2 VENCIDA", antes de exportar el template a un repo nuevo, o a pedido ("audita el cerebro").
actualizada: 2026-09-02
reglas: 11
lecciones: [G:G-001, G:G-002, G:G-004, G:G-005, G:G-010, G:G-011, G:G-013, G:G-014]
origen: propia
---

# 🔬 Auditoría de Cerebro — Nivel 2 (semántica)

> **Qué es**: el linter (`brain:check`) valida ESTRUCTURA (caps, huérfanas, refs). Esta skill valida
> lo que ningún linter puede: **¿el contenido es verdad? ¿está fresco? ¿el cerebro FUNCIONA como
> memoria?** Es la 2ª mitad del criterio "SANO" (evaluación de 2 niveles).
> **Anti-score-teatro**: SIN puntaje numérico (un score LLM no es reproducible). Cada sonda es
> FALSABLE: produce hallazgos con evidencia `archivo:línea` + comando de verificación, o pasa.
> **KPIs del lazo**: hallazgos REINCIDENTES (vs auditoría anterior) + tasa de re-investigación.

## Protocolo (en orden; cada sonda = subagente o verificación directa)

## Reglas transversales de toda sonda (se aplican ANTES de escribir un hallazgo)

1. **Prueba tu instrumento con un caso conocido antes de acusar a un nodo.** Un rojo de TU sonda se
   sospecha ANTES que el dato auditado, y más si es redondo o unánime: mide un caso que SABES bien y
   uno que SABES mal; si tu instrumento no los separa, no tienes medida, tienes una opinión con
   números. Medido en esta misma corrida: contar los stubs por TAMAÑO dio 54 contra los 53 declarados
   y se iba a abrir un hallazgo de fidelidad contra un `05` correcto; contados por CONTENIDO (el
   centinela `http-equiv="refresh"`) salen 53·7·6 = 66, exacto. **Un hallazgo de más contra un nodo
   correcto es peor que uno de menos**, porque empuja a «arreglar» lo que estaba bien.
   *(procedencia: [[G:G-004]] reglas 1 y 2.)*
2. **Toda sonda declara su MARCO, su umbral y su denominador; el veredicto declara lo que NO midió.**
   «Toma 3-5 hechos» sin marco es «los que tenía entre las manos» (M-31). Escribe de qué conjunto
   saliste (p. ej.: *todas las filas de `05` + todas las TODO de `10` comprobables desde disco o git;
   descartadas las que exigen mundo exterior*) y publica el reparto (4 pasan / 4 fallan). Estados
   admitidos, además de cerrado/abierto/reincidente/retirado: **`⏳ NO VERIFICABLE este turno` con el
   motivo escrito** (exige red, vive fuera del repo, exige otra sonda) y **`🟡 PARCIAL` con las dos
   listas enumeradas** cuando el hallazgo nombra varios objetos — un veredicto atómico sobre un
   hallazgo compuesto cierra de más o deja abierto de más. *(procedencia: [[G:G-001]] corolario del
   denominador; [[G:G-005]] regla 1 — la regla viaja escrita junto al dato.)*
3. **Re-verificar la premisa incluye el caso «premisa a MEDIAS».** La regla dura dice que un hallazgo
   sin la línea que lo implementa es una OPINIÓN; falta el caso intermedio: **la línea existe y dice
   otra cosa, o dice más**. Abre la línea y **cuenta cuántos ejes mide**: un gate de frescura que mide
   días **y** commits calla por el eje que no miraste (medido: sello a 2 días de antigüedad —bajo el
   umbral de 10— y 89 commits —bajo un umbral de 120 que en un repo de 26 commits/día no dispara
   jamás). Veredicto: **«premisa CORREGIDA»**, ni cerrado ni abierto tal cual estaba escrito.
   *(procedencia: [[G:G-002]] receta; [[G:G-013]] — cuántos límites hay y sobre qué mide cada uno.)*
4. **La cita `archivo:línea` se re-ancla por CONTENIDO, y publicas el par viejo→nuevo.** El fichero se
   mueve debajo de la auditoría: en esta corrida **5 de 18** citas heredadas habían derivado en dos
   días (`:93→:101`, `:571→:650`, `:1198→:1313`, `:314/:319/:359→:376/:421`). Una comprobación
   mecánica «¿la línea 571 dice eso?» habría RETIRADO cinco hallazgos vivos — un instrumento que falla
   **por clases**, no al azar. La línea es una pista; el ancla es el texto. *(procedencia: [[G:G-004]]
   regla 3 «declara, no descubras»; [[G:G-011]] regla 1 — dos fronteras y de qué objeto es cada una.)*
5. **Un hallazgo CERRADO declara qué superficie cambió su arreglo, y esa superficie se re-mide en la
   misma pasada.** El residuo del remedio no es reincidencia (el viejo está bien cerrado) ni es
   independiente: es hijo suyo, y se cuelga de su fila. Medido: cerrar «el escáner de secretos no ve
   los dotfiles» dejó `_legacy/` declarado FUERA con el motivo «código retirado que no se sirve» —y el
   mismo día la migración escribió ahí 146 KB en un repo PÚBLICO. El motivo escrito dejó de describir
   el contenido y **ningún gate mira un motivo**. *(procedencia: [[G:G-014]] — todo enunciado
   auto-referencial es un puntero SIN gate; cuéntalo y reescríbelo en el mismo cambio.)*
6. **Mide con el instrumento del kernel, y escribe la unidad junto al número.** Dos instrumentos son
   DOS series aunque midan «lo mismo»: `wc -c` cuenta **bytes** y el linter cuenta **caracteres** —en
   un cerebro lleno de emojis y acentos eso da 3455 contra 3303 sobre el mismo fichero—, y `git show`
   normaliza CRLF mientras el disco no. Antes de comparar contra un tope, un porcentaje o una serie
   histórica, di con qué regla se tomó cada número; si normalizas, di **qué descartas**.
   *(procedencia: [[G:G-005]] regla 1 y [[G:G-010]] — lo que una normalización descarta es lo que su
   gate no puede ver.)*

### Sonda 0 — Diff vs auditoría anterior (SIEMPRE primero)
Localiza la tabla de hallazgos de la auditoría anterior (en el `archiveDir` del manifest).
Para cada hallazgo previo: ¿cerrado con evidencia, abierto-tracked, o REINCIDENTE?
**Reincidente = regresión del lazo → meta-lección M-NN obligatoria en el nodo de lecciones.**
> ⚠️ **Y re-verifica su PREMISA, no solo su estado** (ADR §206). Un hallazgo heredado dice DOS cosas:
> que existe un problema y que sigue abierto. La sonda 0 comprueba la segunda por diseño y **la
> primera no la comprueba nadie**. Caso real: un hallazgo afirmaba *«el umbral es de 90 días y eso es
> laxo»*; medido dos auditorías después, el umbral era **30** y siempre lo había sido — no había nada
> que apretar, y la auditoría intermedia lo había listado como «sigue abierto» sin mirarlo.
> 🎯 **Un hallazgo abierto es una afirmación sin sello como cualquier otra, y cuantas más auditorías
> sobreviva, más cierto parece y menos lo es.** Si su premisa cita una cifra, un nombre de chequeo o
> un fichero, ábrelo. Y cuando resulte falso, **se RETIRA, no se cierra**: cerrar afirma que hubo algo
> que arreglar.
>
> 🎯 **Y la prueba concreta, porque «re-verifica la premisa» es demasiado blando para
> ejecutarlo**: *todo hallazgo que apele a una REGLA del cerebro (SSoT, formato canónico, frescura,
> ruteo) tiene que citar la línea del linter o del manifest que la implementa. Si esa línea no
> existe, el hallazgo es una OPINIÓN.* Medido en la #16 de inmobiliaria: de 13 abiertos, **3 eran
> falsos y los 3 fallaban por esto**. El peor decía que un dato violaba el SSoT — pero el único
> mecanismo SSoT es el gate #8, que solo vigila lo declarado en `ssotFacts`, y el dato no estaba
> ahí; además su cifra fallaba ×28 y «arreglarlo» habría puesto el linter en rojo permanente
> contra cuatro documentos que por ley deben llevar ese dato. Suena a disciplina, se apoya en un
> ADR real y su cifra pequeña parece cuidadosa: por eso nadie lo abre.
>
> ⚠️ **Y re-verifica el OBJETO del remedio, no solo la premisa** (M-31, 27-ago-2026). Un hallazgo que
> propone actuar sobre algo concreto —*«hay que partir el nodo X»*, *«hay que arreglar el gate Y»*—
> hereda el foco del turno que lo escribió. Caso real: la auditoría anterior cerró diciendo que tocaba
> partir el nodo cuyo techo se había subido dos veces esa noche; medido al día siguiente, ese nodo
> estaba al **79 %** y ni entraba en el top-12 de saturación, mientras otro llevaba días **clavado en su
> cap de líneas**, bloqueado. No se eligió el peor: se eligió **el que estaba entre las manos**.
> 🎯 **Todo hallazgo que nombre un objeto declara la medición que lo eligió — con su denominador — o no
> lo eligió nadie.** Un remedio sin denominador es una corazonada con formato de tabla, y sobrevive
> auditorías porque nadie vuelve a preguntarse *por qué ESE*. Sospecha sobre todo del hallazgo escrito
> **al final** de una sesión larga: es cuando el foco pesa más y medir cuesta más.

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
Sin presupuesto para subagentes: corre las sondas 0-2 y 6 tú mismo (verificación directa) y marca 3-5
como `[PENDIENTE: requiere subagentes]` en la tabla. **`deepAudit.last` solo se mueve cuando la
auditoría está COMPLETA**; en una parcial se escribe `deepAudit.parcial: ["3","4","5","7"]` junto al
`last` ANTERIOR, y el nudge sigue encendido a propósito — es un aviso que no debe apagarse mientras
falte lo que mide. Una auditoría parcial honesta vale más que una completa fingida, y la forma de ser
honesta es **no darle al gate el dato que le falta**.
*(`parcial` es una sub-clave de `deepAudit`: medido el 2026-09-02 en `scripts/brain-check.mjs` —el
schema del manifest solo valida las claves de PRIMER nivel—, así que no hace falta tocar `KNOWN_KEYS`
en los 4 repos; el mecanismo que sostiene la regla es que `last` NO se mueve, no la clave nueva.)*
> ⛔ derogada (G-002 · 2026-09-02): «…marca 3-5 como `[PENDIENTE: requiere subagentes]` en la tabla, y
> **actualiza deepAudit igual**». Apagaba el nudge con la auditoría a medias: green-tuning del propio
> gate que dispara esta skill.
