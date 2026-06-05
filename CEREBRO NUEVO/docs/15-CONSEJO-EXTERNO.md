# 🛰️ 15 — CONSEJO EXTERNO (red team multi-modelo · 2ª opinión adversarial)

> **Nodo neuronal: protocolo operativo.** Define CUÁNDO y CÓMO pedir una crítica
> adversarial a un modelo externo (de otra familia, no-Claude) antes de una
> decisión fuerte. NO se auto-carga; su EXISTENCIA está flagueada en
> `CLAUDE.md §0` para que cada arranque sepa que el protocolo existe.
>
> **Disparador (Trigger de Decisión Fuerte, `CLAUDE.md §G.2`)**: antes de una
> decisión **cara de revertir**.

---

## §0 — MODELO EXTERNO ACTIVO (rellenar en instalación)

> ⚠️ **Esta sección la rellena Claude durante la instalación del cerebro** (FASE 3.8
> de `INSTALACION.md`). El usuario indica qué herramienta tiene disponible y Claude
> adapta la matriz de tiers (§3) al ecosistema correcto.

**Provider activo**: `<rellenar — uno o varios: Gemini (Antigravity) | ChatGPT (Plus/Pro) | Perplexity Pro | Mistral / Llama local | Otro | Ninguno (solo-Claude)>`

**Cómo llega la respuesta**:
- [ ] Manual: el cliente pega el prompt en la herramienta y me trae la respuesta.
- [ ] Vía MCP / tool: `<nombre del tool si está cableado>`.

**Última verificación de disponibilidad**: `<YYYY-MM-DD>`.

> Si el provider activo es **"Ninguno"**: el Trigger 🛰️ degrada a "marcar la decisión
> como NO revisada externamente" + considerar la skill **`llm-council`** (panel
> multi-modelo simulado) como sustituto parcial. El protocolo de §4 sigue siendo útil
> para estructurar mi propio análisis adversarial interno.

---

## §1 — Qué es y por qué lo tenemos

Acceso a un modelo de otra familia (no-Claude) como **segunda opinión adversarial**. El valor NO es "el otro modelo piensa por mí" — es **diversidad de sesgos**: Claude y Gemini/GPT/etc. fallan en cosas distintas, así que un crítico de otra familia atrapa puntos ciegos. (Mismo concepto que la skill `llm-council`, pero con humano en el medio.)

**Humano en el medio (clave)**: yo marco la decisión → el cliente corre el prompt en el modelo externo → me pega la respuesta → **yo la evalúo como peer review** (adopto lo correcto, refuto con razones lo que esté mal). NUNCA me subordino al modelo externo; es insumo, no oráculo.

---

## §2 — Cuándo consultarlo (y cuándo NO)

### §2.1 — Principios universales (siempre aplican)

**SÍ (vale la fricción + tokens):**
- 🏛️ **Arquitectura / modelo de datos** caro de revertir (esquemas, contratos de API, límites de módulos).
- 🔀 **Fork 50/50**: estoy genuinamente dividido entre 2+ enfoques viables (aviso explícito).
- ⚠️ **Operación irreversible/destructiva** (migraciones, refactor masivo, borrados de datos/estructura).
- 🔒 **Seguridad / legal** (regulaciones aplicables: GDPR, Ley 1581, HIPAA, PCI; secrets; rules backend).
- 🤔 **Incertidumbre** tuya o mía que quiera un desempate.

**NO (no malgastar tokens):**
- Trabajo rutinario, mecánico o **reversible** (fixes con RCA claro, edits triviales).
- **Hechos/código de NUESTRO repo** → el modelo externo no ve el código ni el cerebro; alucina. Eso lo verifico YO leyendo código (`CLAUDE.md §3.3`). Sirve solo para **juicio/estrategia/tradeoffs**.
- Cuando los **tokens estén bajos** → guardarlos para lo grande (§5).

### §2.2 — Decisiones de ESTE proyecto que disparan 🛰️ (rellenar en instalación)

> ⚠️ **Rellenado por Claude durante la instalación** (FASE 3.8 de `INSTALACION.md`)
> con casos concretos derivados del **stack + dominio + provider activo §0**.
> Si la lista queda vacía o genérica, el Trigger 🛰️ NO se va a disparar al momento
> correcto — el cerebro pierde la mitad de su utilidad estratégica.

**Casos específicos del proyecto (rellenar — mínimo 3-5 entradas concretas)**:
- `<rellenar — ej. para CRM Firebase: "cambiar el schema de Firestore (subcolecciones vs root) — caro de migrar por las rules backend">`
- `<rellenar — ej. para API REST: "diseñar un endpoint público que va al contrato del SDK público — versionar mal explota a los consumidores">`
- `<rellenar — ej. para landing SEO: "elegir el motor de SSR/SSG (Astro vs Next) — migrar después implica reescribir todas las rutas">`
- `<rellenar>`
- `<rellenar>`

**Decisiones legales/compliance específicas (si aplican)**:
- `<rellenar — ej. "tratamiento de datos personales bajo Ley 1581 Colombia: campos sensibles del cliente">` o **"n/a"** si el proyecto no toca PII.

**Decisiones de infra costosa (si aplican)**:
- `<rellenar — ej. "elegir entre Cloudflare Pages vs Vercel para un sitio con 50k MAU — costos divergen 10x">` o **"n/a"**.

### §2.3 — Decisiones rutinarias de ESTE proyecto que NO requieren 🛰️ (rellenar en instalación)

> Listar para evitar sobre-consultar. Igual rellena en instalación con el contexto detectado.

- `<rellenar — ej. "ajustar copy de un email transaccional">`
- `<rellenar — ej. "agregar un campo opcional a un formulario existente">`
- `<rellenar — ej. "bugfix en un handler aislado con tests verdes">`
- `<rellenar — ej. "refactor interno de una función sin cambiar su contrato">`

### §2.4 — Reglas dinámicas (Reflejo de Frescura §G.4)

- Cuando aparezca un tipo de decisión NUEVO que pinta como 🛰️ y NO está en §2.2, **apéndalo ahí** ANTES de disparar el consejo (o ANTES de cerrar la tarea si decides no consultar). Mantiene §2.2 vivo.
- Si una decisión de §2.2 se vuelve rutinaria con el tiempo (ya tienes patrón estable), MUÉVELA a §2.3.
- Si el provider activo §0 cambia (el usuario consigue/pierde acceso a un modelo), revisar §2.2: algunos casos solo valen 🛰️ si hay un modelo TOP disponible.

---

## §3 — Selección de tier (yo decido según provider activo §0)

**Principio rector**: el costo del modelo escala con el costo de equivocarse (reversibilidad).

| Tier | Cuándo lo elijo | Equivalencias por provider |
|---|---|---|
| **TOP (High)** | Decisión TOP: arquitectura/modelo de datos caro de revertir, seguridad/legal, op irreversible, fork duro | Gemini 3.x Pro (High) · GPT-5 (High) / o1 / o3 · Claude Opus si el provider activo es solo-Claude |
| **TOP (Low/Medium)** | Decisión importante pero acotada; 2ª opinión sólida sin gastar al máximo | Gemini 3.x Pro (Low) · GPT-5 (Medium) · Claude Sonnet |
| **Fast (High)** | Sanity-check rápido, "¿se me escapó algo obvio?", generar alternativas, crítica ligera | Gemini Flash (High) · GPT-5-mini (High) · Claude Haiku |
| **Fast (Low)** | Gut-check trivial, o **fallback** cuando los tokens del TOP están agotados | Gemini Flash (Low) · GPT-5-nano · Claude Haiku |

Regla simple: **irreversible/caro → TOP (High)** · **importante/acotado → TOP (Low)** · **rápido/barato → Fast**.

> 💡 **Si el provider activo es ChatGPT**: la familia "razonamiento extendido" (o1/o3) es preferible a GPT-5 estándar para arquitectura/seguridad. Reservar GPT-5 estándar para análisis rápido.
>
> 💡 **Si el provider activo es Perplexity**: tiene acceso a búsqueda web — útil cuando la decisión depende de "¿qué está haciendo la industria?" o "¿hay precedentes?". Para puro juicio estratégico, equivale al tier Fast.

---

## §4 — Mecánica del consejo

1. **Marco la decisión** como 🛰️ "vale consejo externo" + elijo el tier (§3) + te entrego un **prompt autocontenido** (el modelo externo no tiene memoria de nuestro trabajo → todo el contexto va en el prompt).
2. **Anti-anclaje**: en las decisiones TOP, **fijo MI postura primero** y la omito del prompt; así el modelo externo no me ancla y comparo después. En las ligeras, el orden no importa.
3. Me pegas la respuesta → la trato como **peer review**: adopto lo correcto, **refuto con razones** lo erróneo, **sintetizo** una postura más fuerte, y te digo explícito **qué cambié y qué descarté**.
4. **El resultado** (decisión final + qué aportó/cambió el modelo externo) queda en el **ADR/lección** correspondiente → el cerebro recuerda el porqué.

### Plantilla de prompt (autocontenido)
```
[CONTEXTO] Proyecto: <1-2 frases>. Stack: <relevante>.
Decisión en juego: <qué se decide y por qué importa>.
Opciones: A) <...>  B) <...>
Restricciones: <costo / irreversibilidad / plazo / etc.>
[TAREA] Actúa como crítico adversarial. No me complazcas.
1) ¿Qué modos de fallo o riesgos NO estoy viendo?
2) ¿Qué opción es más robusta y por qué?
3) ¿Qué evidencia o pregunta cambiaría la decisión?
Sé concreto y breve.
```
(En decisiones TOP NO incluyo mi postura tentativa — anti-anclaje §4.2.)

---

## §5 — Degradación por tokens / disponibilidad

- **TOP agotado** → bajar a **Fast (High)** para una toma más ligera (mejor algo que nada).
- **Provider externo caído / sin acceso temporal** → registrar como tal y posponer la decisión si es posible; si no, marcarla con bandera roja en el ADR.
- **Todo agotado** → **sigo solo** y **marco** que la decisión NO tuvo revisión externa (bandera para revisarla si luego molesta).
- Nunca bloquear el avance esperando tokens: el consejo es un acelerador de confianza, no un requisito.

---

## §6 — Límites duros

- El modelo externo **no ve** nuestro código/cerebro → todo contexto va en el prompt; **jamás** usarlo para verificar hechos del repo.
- Es **insumo de juicio**, no autoridad: una crítica que esté mal **se refuta**, no se acata.
- **Misma familia ≠ red team**: pedir 2ª opinión a otro Claude (mismo provider) NO cuenta — mismos sesgos. Solo cuenta otra familia (Gemini/GPT/Mistral/Llama/etc.) o la skill `llm-council` que ya combina varios.
- Si el protocolo lleva tiempo sin usarse y no aporta, **revisarlo** (Reflejo de Desafío Crítico `CLAUDE.md §G.4`) — un protocolo muerto es deuda.
- Si el provider activo cambia (el usuario consigue Antigravity, pierde acceso a ChatGPT Pro, etc.), **actualizar §0** en el mismo cambio (Reflejo de Frescura).
