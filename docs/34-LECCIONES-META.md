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


## L-31 (detalle movido desde `30`, 2026-07-10 — stub allá)
### L-31: Kernel del cerebro compartido ×3 — escape del pre-commit + salvamento de deliberaciones por transcript *(renumerada 2026-06-09: era L-28 duplicada)*
**Disparador**: el `brain-check.mjs` (kernel byte-idéntico en los 3 repos) corre en pre-commit; tocas el kernel o pierdes una deliberación sin capturar. **Lección (comité v6, 2026-06-09)**: (1) un kernel con bug bloquea los pre-commit de los 3 repos a la vez (blast radius ×3) → SIEMPRE probar el candidato contra los 3 ANTES de propagar (copia temporal + correr); diagnóstico primero (`node scripts/brain-check.mjs` suelto); `git commit --no-verify` SOLO con pedido explícito del cliente. (2) Una deliberación (comité/workflow) que cerró sin capturarse NO está perdida: el harness persiste transcripts por-máquina en `~/.claude/projects/<proyecto>/<sesión>/` → localizar por fecha, extraer el crudo, archivar en `archiveDir` (manifest) + síntesis retroactiva. Prevención: PRIMER acto tras un workflow = copiar el resultado al `archiveDir`. **(3) Escritor ÚNICO del kernel (dueño 2026-06-15)**: SOLO cars-operador escribe `brain-check/diff.mjs` + la §G cross-repo; bersaglio = dominio de su instancia (`05`/`10`/`30`/lóbulos)+app, NO toca el kernel (editarlo → peer-hash #11 ROJO ×3). Cambio de kernel desde bersaglio → vía el dueño a cars, que lo origina y propaga byte-idéntico ×3 (caso: git-gate H-06/TODO-22). **⚠️ ACTUALIZACIÓN 2026-07-10 (cars §302, mandato del dueño): el escritor único ahora es INMOBILIARIA-operador (traspaso de liderazgo del cerebro ×4); cambio de kernel desde bersaglio → vía el dueño a inmobiliaria.**

### M-09: Muestrear ≠ contar — extrapolé de la 1ª página de una lista PAGINADA y lo afirmé como hecho (2026-07-17)
**Disparador**: vas a afirmar una proporción/total ("la mayoría", "casi todas", "N de M") sobre una lista larga que ves en una UI.
**El fallo**: auditando el GBP vi 5 reseñas (las de la 1ª página, ordenadas por recientes), 4 sin responder → afirmé *"la mayoría de tus 85 reseñas están sin responder"* y lo escribí en `10` **y lo commiteé**. El dueño me corrigió. Al CONTAR de verdad (9 págs × 10, `navigate_next`): **74/85 respondidas (87%) / 11 sin responder**, y las 11 eran TODAS recientes (págs 1-2; págs 3-9 = 10/10 respondidas). La lista era **paginada de 10**, no scroll infinito: la 1ª página era el peor sesgo posible (lo más nuevo = lo aún no atendido).
**Lección**: (1) una muestra de la 1ª página de una lista **ordenada** (por fecha/relevancia) NO es representativa — está sesgada POR el orden; (2) antes de afirmar una proporción, **cuenta el universo** (paginar/JS) y **valida la suma contra un contador independiente** (aquí: 85 contadas == 85 del panel público → método verificado); (3) si no puedes contar, di "en la muestra que vi (N=5)…" y NO generalices; (4) daño extra: un claim falso commiteado al cerebro contamina a todos los "yo" futuros → al corregir, corregir el NODO, no solo la conversación.
**Regla**: §3.3 no es solo para código — aplica a CUALQUIER hecho, incluidos los que lees en una UI. "Mayoría/casi todos" es un CLAIM CUANTITATIVO: exige conteo, no impresión.

### M-23: El sello "(al fecha)" del 05 caduca en silencio — REINCIDENTE (A2-§175 → §192): re-sellar no arregla el mecanismo (2026-07-18)
**Disparador**: editas cualquier celda del `05` (o del `10`) — ¿moviste el sello del encabezado? Nadie lo hace.
**El fallo (×2 documentado)**: §175-A2 encontró el `05` sellado "(al 2026-06-28)" con cuerpo del 07-08; se "resolvió" re-sellando. El §192 encontró EXACTAMENTE lo mismo: sello "(al 2026-07-08)" con cuerpo del 17-jul — más dos contradicciones internas gemelas ("EN PROD hasta §188" junto a "v97 = §189"; "APP v53" con v54 real en código). El patrón: el 05 se edita POR CELDAS y cada editor actualiza su celda sin mirar las vecinas ni el sello. La disciplina "muévelo en cada edición" ya demostró ×2 que no se sostiene por honor.
**Lección**: (1) reincidencia = el fix anterior atacó el SÍNTOMA (fecha vieja) y no el MECANISMO (nada compara sello vs contenido); (2) el gate correcto es del kernel y es barato: comparar el sello contra la fecha del último commit de git del archivo (sello < git-date = "contenido más nuevo que el sello") + detectar contradicción interna "EN PROD hasta §NN" vs "vXX = (§MM)" con MM>NN — propuesto a la cola del kernel (TODO-71, escritor = inmobiliaria-operador, L-31.3); (3) mientras el gate no exista, la auditoría Nivel-2 es el único barrido que lo caza → no espaciarla; (4) hermana de M-08 (no fijar hechos-por-comando a mano): el sello ES un hecho-por-comando (git lo sabe) fijado a mano.
