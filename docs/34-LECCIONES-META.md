# 🧠 34 — META-LECCIONES DEL CEREBRO/PROCESO (hija de `30-LECCIONES`)

> **Nodo neuronal: Memoria Procedimental — sub-lóbulo META (cómo opera/falla el cerebro mismo).**
> Hija de `docs/30-LECCIONES.md` (shard §G.5 por saturación, TODO-66/§161). Se consulta on-demand
> ante el **Reflejo de Autocrítica (§G.4)** o al tocar gobernanza/linter/proceso. El kernel lee las
> definiciones `### M-NN` SOLO de `30` → allí queda el **stub-header** de cada una (M-06); el DETALLE vive aquí.
> **Tope ~12000 chars.** 1ª auditoría semántica con artefacto = ADR §82.

---

### M-01: No imprimir un campo de estado del manifest como "hecho" sin gate que verifique su artefacto
`brain:check` anunciaba "auditoría 2026-06-09" (de `deepAudit.last`) sin tabla de hallazgos = fachada → aplica la Regla de ADMISIÓN al propio linter. Detalle → ADR §82.

### M-02: Una lección sobre estado verificable-por-comando (git/build) debe volverse GATE, no prosa [HONOR]
`05` repitió "==main" falso pese a L-26 porque NINGÚN gate lee git (→ TODO-22).

### M-03: Un campo `last` de tracking nace null/baseline, nunca con fecha que finja una ejecución
§56 selló `deepAudit.last=2026-06-09` (instalación) sin corrida → fachada (rel. M-01).

### M-04: La memoria del harness deriva en silencio (fuera de `docs/`, el linter no la cubre)
Ruta de repo stale tras mudanza + memoria de 72d que contradecía la gobernanza → necesita repaso de frescura propio.

### M-05: Edité un subsistema bajo UNA lente y lo di por bueno sin probar el camino vivo (§89)
Di `categories.js` por OK con la lente cero-ficción sin probar el **estado-cero** del camino vivo (*"1ª categoría → ¿aparece?"*). Causa técnica [[L-42]]; meta-falla de PROCESO → reflejo CAZA-BUGS / **W-10**; gate real = test estado-cero ([HONOR]). Detalle → ADR §90.

### M-06: El kernel acopla las definiciones `### L-NN` a `30` → shard de lecciones = stub-en-30 + detalle-en-hija (§96)
`brain-check.mjs` lee `defined` SOLO de `30` y `referenced` de todo el cerebro MENOS las hijas. Mover una lección referenciada en `99` a una hija (`31`) la deja COLGANTE. → el shard TODO-27/§96 deja el **header-stub `### L-NN` en `30`** (defined lo cuenta, refs resuelven) y el CUERPO en `31`. Soporte real multi-archivo (que `defined` lea `3*-LECCIONES*.md`) = cambio de KERNEL → cars-operador (L-31), NO unilateral desde bersaglio; aporte para la pasada Gemini (con TODO-22/23). [HONOR]

### M-08: Un TABLERO (`05`) no debe FIJAR a mano un hecho verificable-por-comando (hash/PR de PROD) — se vuelve stale y CONTRADICE §3.3 (§114) [HONOR]
HA-01 (estado git stale en `05`) reincidió **3 veces** (H-01→HA-01→§114) porque `05` pinneaba el commit/PR exacto de PROD, que caduca en cada deploy de Daniel (L-26) y NINGÚN gate lee git (TODO-22 = kernel/cars-operador, nunca construido). El **retrieval-drill frío lo probó**: una sesión nueva entrega el hash viejo como "verificado". **Regla**: un tablero describe el estado por CONTENIDO (qué features están live); el dato volátil verificable-por-comando (commit exacto) se DELEGA a `git fetch` (git = SSoT), NO se copia a mano. Quitar el hecho stale en su origen es más barato y robusto que un gate que lo vigile. Complementa [[M-02]] (la lección verificable-por-comando debe ser gate, no prosa) — aquí: si no puede ser gate aún, ELIMINA la prosa stale. Detalle → ADR §114.

### M-07: Los node:tests NO corren en CI (solo `test:rules`) → test-rot SILENCIOSO tras refactor de render (§104)
§102 reescribió las 5 secciones del home al modelo 3-estados (`armWatchdog();`+comentario antes del `return`; `>= MIN_FEATURED ? : ''`) y dejó `no-demo-home.test.mjs` **rojo en 6/10** — invisible hasta §104 porque NINGÚN workflow corre los node:tests (CI solo `test:rules`, L-12/L-37). El CÓDIGO cumplía cero-ficción; lo stale eran los regex (demasiado acoplados a la FORMA exacta del render). **Regla**: tras tocar un renderer, correr la batería local (`node --test` de `tests/*` salvo `firestore-rules`); y un gate de PATRÓN debe tolerar variación benigna (stripComments + prefijo de-solo-llamadas) sin perder la detección del bug. Aporte para la pasada Gemini: un `npm test` agregado en CI (junto a TODO-22/23/29). [HONOR]

---

## 🧭 Decisiones de gobernanza 2026-06-24 (operador-cars → ×4 cerebros) [HONOR]
> De la sesión cars (PLAN UNIFICADO, cars §237). Mismo dueño/operación en los 4 repos.
1. **La extensión Claude-in-Chrome la maneja CLAUDE directamente** (no relay): tras merge+~5min de deploy el dueño avisa y Claude conduce la validación live SOLO (es los OJOS), caza diseño/bugs/regresiones. Skill `validacion-live-chrome` modo (b) = DEFAULT con navegador conectado. Login/credenciales = solo el dueño; cambios locales no-deployados → `preview_*`.
2. **NO preguntar "qué sigue" en un plan ya hecho + revisado estratégicamente por mí** (survey/comité/Gemini/arquitecto): yo manejo el ORDEN técnico; solo interrumpo por decisiones del DUEÑO (dinero/legal/go-no-go/irreversible) o su verificación final. Refuerzo emphático del dueño 24/06. Hablarle SIEMPRE en cristiano (es no-técnico).
3. **Un workflow/comité ACOTADO (in-cwd read-only, sin git, sin lecturas fuera de cwd) NO se cuelga** — lo que cuelga es la lectura GATEADA por permiso (git/fuera-de-cwd), NO el fan-out acotado en sí (survey de 5 agentes corrió limpio). La maquinaria pesada (comité/Gemini/workflow) se usa para Decisión Fuerte, acotada.
4. **Verificar TODO claim de un asesor externo (Gemini) contra el código** antes de adoptar — la joya: en cars Gemini revirtió su propio verdicto previo y sus 6 claims se confirmaron leyendo el código. Insumo, no oráculo.
