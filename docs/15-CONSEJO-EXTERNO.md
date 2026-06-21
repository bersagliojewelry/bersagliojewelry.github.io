# 🛰️ 15 — CONSEJO EXTERNO (red team multi-modelo · 2ª opinión adversarial)

> **Nodo neuronal: protocolo operativo.** Define CUÁNDO y CÓMO pedir una crítica
> adversarial a un modelo externo (de otra familia, no-Claude) antes de una
> decisión fuerte. NO se auto-carga; su EXISTENCIA está flagueada en
> `CLAUDE.md §0` para que cada arranque sepa que el protocolo existe.
>
> **Disparador (Trigger de Decisión Fuerte, `CLAUDE.md §G.2`)**: antes de una
> decisión **cara de revertir**.

---

## §0 — MODELO EXTERNO ACTIVO

> ✅ **Rellenada en la instalación del cerebro** (2026-06-05, FASE 3.8 de `INSTALACION.md`).
> Si el provider externo cambia (el cliente consigue/pierde acceso a un modelo),
> actualizar aquí + revisar la matriz de tier §3 (Reflejo de Frescura `CLAUDE.md §G.4`).

**Provider activo**: `Gemini (Antigravity)` — modelos del cliente: **Gemini 3.1 Pro** (Low/High) → tier TOP · **Gemini 3.5 Flash** (Low/Medium/High) → tier Fast. Provider único, sin ambigüedad de "cuál primero".

**Mapa de tier para ESTE setup** (concreta la matriz genérica §3):
- **TOP (High)** → Gemini 3.1 Pro (High) — arquitectura/datos caros, seguridad/legal, op irreversible, fork duro.
- **TOP (Low)** → Gemini 3.1 Pro (Low) — decisión importante pero acotada.
- **Fast (High/Medium)** → Gemini 3.5 Flash (High o Medium) — sanity-check, generar alternativas, crítica ligera.
- **Fast (Low)** → Gemini 3.5 Flash (Low) — gut-check trivial / fallback si el Pro está agotado.

**Cómo llega la respuesta**:
- [x] Manual: el cliente pega el prompt en Antigravity y me trae la respuesta (humano en el medio, §1).
- [ ] Vía MCP / tool: `n/a` (no cableado — Antigravity es app del cliente, no MCP en este repo).

**Última verificación de disponibilidad**: `2026-06-05`.

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
- **Hechos/código de NUESTRO repo** → depende del provider §0: un IDE agéntico con acceso al repo (**Antigravity, el activo** → Gemini) **SÍ ve el código y el cerebro locales (solo-lectura)** y PUEDE verificar hechos del repo y revisar código/reglas reales; un chat sin acceso (no es el caso hoy) no los vería. El motivo de NO usarlo en lo rutinario NO es que alucine, sino que **el esfuerzo manual del dueño + los tokens no se amortizan** cuando el comité interno (automático) ya basta. Aun así **verifico YO** sus afirmaciones (`CLAUDE.md §3.3`) — insumo, no oráculo.
- Cuando los **tokens estén bajos** → guardarlos para lo grande (§5).

### §2.2 — Decisiones de ESTE proyecto que disparan 🛰️

> ✅ **Rellenada en la instalación** (2026-06-05) con casos del **stack + dominio + provider §0**.
> Mantener viva (§2.4): si aparece un tipo de decisión nuevo que pinta 🛰️ y no está aquí,
> apéndalo ANTES de disparar el consejo (o antes de cerrar la tarea si decides no consultar).

**Casos específicos del proyecto (stack Firebase + e-commerce alta joyería)**:
- **Schema de Firestore** (`pieces` / `collections` / pedidos / usuarios): cambiar la forma (root vs subcolecciones, denormalización, versionado del admin) — caro de migrar por las `firestore.rules` + los listeners `onSnapshot` + el panel admin con auditoría.
- **`firestore.rules` / `storage.rules`** (modelo de seguridad backend): una regla mal puesta expone datos de clientes o permite escritura no autorizada al catálogo/Storage. Seguridad → siempre 🛰️.
- **Cloud Functions con triggers** (`functions/`): triggers de Firestore o callables que tocan datos/pagos/notificaciones FCM — caros de revertir si ya corren en prod.
- **Modelo de auth / acceso al panel admin** (`admin*.html`, claims, quién entra): cambios en el modelo de sesión/permisos — riesgo de exponer el panel privado.
- **Integrar cobro real / pasarela** (hoy checkout 3-pasos con `sessionStorage`, sin cobro): elegir PSE/Wompi/Stripe + manejo de la orden + fiscalidad (DIAN) + SIC — decisión cara y sensible.
- **Estrategia SEO / indexación** (ya configurada: `noindex` + sitemap, commit `3f654e1`): cambiar la política de indexación o el motor de render afecta todo el ranking — caro de revertir.
- **Estrategia de cache del Service Worker** (`public/sw.js`): cambiar network-first ↔ cache-first o el scope puede servir contenido stale a TODOS los clientes hasta el próximo bump (§4 `CLAUDE.md`).

**Decisiones legales/compliance específicas**:
- **Ley 1581 / Hábeas Data (Colombia)**: tratamiento de datos personales de clientes (formulario de contacto, pedidos, wishlist, newsletter, cookie-banner). Cambios en QUÉ se recolecta, CÓMO se consiente o la retención → 🛰️ + lóbulo `42-LEGAL` on-demand. (Aplica — el proyecto SÍ toca PII.)

**Decisiones de infra costosa**:
- **Costo Firebase a escala**: decisiones que multipliquen lecturas de Firestore (listeners `onSnapshot` muy amplios) o egress de Storage escalan el costo en plan Blaze. Elegir la estrategia de fetching (live vs on-demand) para catálogos grandes → 🛰️. (GitHub Pages es estático/gratis; el riesgo de costo vive en Firebase.)

### §2.3 — Decisiones rutinarias de ESTE proyecto que NO requieren 🛰️

> Listadas para evitar sobre-consultar. Si una decisión de §2.2 se vuelve rutinaria con el tiempo, muévela aquí (§2.4).

- Bugfix con RCA clara verificada (`CLAUDE.md §3.3`) en un módulo aislado (ej. un handler de `js/pages/` o `js/components/`).
- Ajustes de copy / textos visibles (headlines, descripciones de pieza, microcopy, mensajes de error).
- Estilos visuales / micro-interacciones / tweaks de Liquid Glass que NO cambian estructura ni IDs/clases (§3.2).
- Agregar un campo OPCIONAL a una pieza/colección existente sin tocar el schema base ni las `firestore.rules`.
- Cache bump rutinario del SW (`§4`) tras cambiar assets del shell, y optimización de imágenes (webp/avif) + lazy-load.
- Actualizaciones de dependencias minor/patch (Vite, Firebase SDK, GSAP) con build verde (`npm run build`).

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

1. **Marco la decisión** como 🛰️ "vale consejo externo" + elijo el tier (§3) + te entrego un **prompt autocontenido** (el modelo externo no tiene memoria entre sesiones; si es un IDE agéntico como Antigravity **abre los archivos reales → el prompt apunta a rutas/archivos**; si es un chat sin acceso, el contexto va en el prompt).
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

- 🚦 **SOLO-LECTURA — el consejero externo NUNCA edita** (regla del dueño 2026-06-19). Gemini vía Antigravity es un IDE agéntico que *puede* editar, pero aquí solo recibe prompts de **CRÍTICA** (preguntas/hallazgos), JAMÁS tareas de implementación. El **comité interno + el consejero DEBATEN/aportan hallazgos**; quien **DELIBERA** (triaje), **DECIDE** e **IMPLEMENTA** (edita/commitea/pushea) soy **YO (Claude)**. Asesoran; yo resuelvo. **Anti-patrón**: entregar un mensaje de implementación suelto (p.ej. un mensaje de commit) que, pegado en Antigravity, le abra la puerta a editar en paralelo → colisión de dos agentes sobre el mismo repo. **Cierro el ciclo end-to-end yo mismo.**
- **Visibilidad del repo según provider §0**: vía un IDE agéntico (Antigravity, el activo) el modelo **SÍ ve** nuestro código/cerebro (solo-lectura) → PUEDE verificar hechos del repo y revisar código real; un chat sin acceso, no. **Universal: NUNCA escribe** (no edita/implementa/commitea — ver arriba).
- Es **insumo de juicio**, no autoridad: una crítica que esté mal **se refuta**, no se acata.
- **Misma familia ≠ red team**: pedir 2ª opinión a otro Claude (mismo provider) NO cuenta — mismos sesgos. Solo cuenta otra familia (Gemini/GPT/Mistral/Llama/etc.) o la skill `llm-council` que ya combina varios.
- Si el protocolo lleva tiempo sin usarse y no aporta, **revisarlo** (Reflejo de Desafío Crítico `CLAUDE.md §G.4`) — un protocolo muerto es deuda.
- Si el provider activo cambia (el usuario consigue Antigravity, pierde acceso a ChatGPT Pro, etc.), **actualizar §0** en el mismo cambio (Reflejo de Frescura).
