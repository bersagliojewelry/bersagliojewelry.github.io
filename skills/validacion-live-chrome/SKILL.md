---
name: validacion-live-chrome
description: Usar DESPUÉS de un merge/deploy cuando los cambios YA están EN VIVO y hace falta EVIDENCIA REAL del comportamiento (no localhost, no opinión). Genero un PROMPT autocontenido + esquema de observabilidad para la extensión "Claude in Chrome" del dueño: él abre la web y mete sus credenciales (Claude NUNCA las maneja), la extensión recorre el camino vivo y emite OBSERVABILIDAD (consola, network, DOM, respuestas literales, transiciones de estado); el dueño la pega aquí y YO actúo (diagnostico, fix, re-validar). Cubre el hueco de verificacion live (L-08: no hay E2E en localhost; el dueño verifica al final). Casos: bot logueado vs NO logueado, finalizar/iniciar/recargar conversacion, formularios, flujos con sesion. CRITICO ADVERSARIAL: refuta, no confirma. Complementa caza-bugs. Triggers: "ya se mergeo, valida en vivo", "pruebalo en la web desplegada", "lanzale un prompt a la extension de Chrome", "valida adversarial", "evidencia real post-merge", "observabilidad del sitio live".
---

# 🔭 Validación Live vía extensión "Claude in Chrome" (post-merge)

> El dueño hace la **verificación final en vivo** (memoria + L-08: E2E solo contra producción, nunca
> localhost). Esta skill convierte ese paso manual en un **protocolo con evidencia**: yo redacto el
> prompt, la extensión Chrome lo ejecuta en la sesión REAL del dueño, y me devuelve **observabilidad**
> que YO interpreto. Es un APOYO para CAZAR EVIDENCIAS, no para que Claude opere credenciales ni mueva dinero.
> PORTABLE: cero rutas de un repo concreto — leo el cerebro del proyecto activo para llenar la URL,
> el subsistema tocado y los escenarios. Adapta al stack que sea.
>
> ⚔️ **Postura ADVERSARIAL (no confirmadora) — eje de la skill (dueño 2026-06-23)**: el objetivo es **ROMPER, no aprobar**. (1) La extensión NO se limita al camino feliz: prueba bordes, ciclos repetidos, entradas raras y caminos infelices, e intenta hacer fallar el cambio. Además **explora con LIBRE ALBEDRÍO acotado** (es mis OJOS): pulsa zonas/botones que no le listé, por iniciativa propia — siempre dentro de las barandas (§4: nada irreversible sin OK). (2) YO trato cada **"✅" del reporte como HIPÓTESIS a refutar**: lo cruzo contra el código, exijo evidencia para todo negativo ("sin errores" = sweep explícito, no ausencia de mención), y **nombro lo que NO se probó**. Un reporte que solo confirma el camino feliz **NO cierra nada**. (Hermana mental: `asesor-critico-honesto`.)

## 0. Cuándo aplica / cuándo NO
- **SÍ**: tras un merge/deploy con el cambio YA en vivo, cuando el subsistema tocado tiene **estado
  observable por el usuario** (bot/chat, login/sesión, formularios/leads, CRUD, render condicional) y
  necesito evidencia real que NO puedo obtener en localhost (L-08) ni leyendo el diff. **También**:
  flujos MULTI-SUPERFICie (público→admin: lo que entra por el bot/form debe aparecer en el panel/CRM)
  y **auditorías de diseño/UX + copywriting + flujo comercial en vivo** (recorrer la conversación/journey
  completa de saludo a cierre; recolectar defectos visuales, de copy y de flujo para el plan de rediseño).
- **NO**: cambios sin superficie viva (docs, cerebro, tooling, refactor interno sin efecto observable);
  un bug YA reproducible → `systematic-debugging`; el gate del claim final → `verification-before-completion`.
- **Relación con `caza-bugs`**: caza-bugs DECIDE *qué* recorrer (camino vivo desde estado-cero: vacío→1 y
  N→vacío + recarga); esta skill es *cómo* recorrerlo en PRODUCCIÓN cuando la sesión es del dueño.

## 1. División de trabajo (innegociable)
1. **Dueño**: abre la web en vivo y **mete él mismo las credenciales/login**. Claude NO maneja credenciales.
2. **Yo (Claude-dev)**: entrego el **PROMPT autocontenido** (§2) — qué recorrer, qué observar, qué reportar.
3. **Extensión Chrome** (en la sesión logueada del dueño): ejecuta + emite el **reporte de observabilidad** (§3).
4. **Dueño**: pega el reporte aquí → **yo tomo acciones**: caza-bugs → fix → re-validar (vuelta a §2).

> Dos modos: **(b) DIRECTO = DEFAULT cuando el navegador del dueño está conectado** (verificado
> 2026-06-24: `list_connected_browsers` → conectado): **Claude maneja la extensión** vía
> `mcp__Claude_in_Chrome__*` (navega, lee DOM/consola/red, clicks) — tras merge+~5min de deploy el dueño
> avisa y Claude conduce la validación SOLO (es los OJOS), caza diseño/bugs/regresiones por su cuenta.
> Login/credenciales = solo el dueño (el admin exige sesión ya iniciada); acciones irreversibles, OK
> explícito. **(a) relay humano** (el dueño pega prompt→respuesta) = fallback si el navegador NO está
> conectado. Para cambios LOCALES no-deployados → `preview_*` (no toca el navegador del dueño).

## 2. El PROMPT para la extensión (plantilla — yo la lleno y se la paso al dueño en el chat)
> Regla: **autocontenido** (la extensión no ve este repo ni nuestro chat), **observar > actuar**, y
> **prohibido lo destructivo** sin OK explícito del dueño. Pego la plantilla rellena, lista para copiar:

```
Eres un validador de QA en una web EN VIVO. NO inventes; reporta solo lo que observes.
URL: {URL_EN_VIVO}
Contexto del cambio que valido: {QUÉ SE MERGEÓ / subsistema tocado}
PROHIBIDO (sin que yo lo autorice explícitamente): enviar leads/formularios reales, pagos,
borrar/editar datos, o cualquier acción irreversible. Si un paso lo requiere, DETENTE y avísame.

MÉTODO DE OBSERVACIÓN (OBLIGATORIO): NO te bases en UN solo screenshot de lo último visible. Lee el
DOM COMPLETO de la conversación (TODOS los bubbles desde el PRIMER mensaje) — usa get_page_text / lee
el contenedor de mensajes entero — y haz SCROLL del chat de ARRIBA (inicio) hasta ABAJO (final),
capturando cada tramo. Un screenshot solo muestra el viewport; los bugs viven también ARRIBA del fold
(mensajes/CTAs/quickReplies duplicados, defectos de diseño en mensajes anteriores). Reporta el flujo
COMPLETO y en ORDEN (saludo→cierre), no solo lo último.

COBERTURA DE SESIÓN (obligatoria si el cambio toca auth/sesión): haz PRIMERO los escenarios
CON login (ya estoy logueado); LUEGO CIERRA SESIÓN (logout NO necesita credenciales) y repite
el camino como visitante SIN login; reporta toda DIFERENCIA entre ambos estados. (Para volver a
entrar yo reingreso la contraseña.) Busca TODAS las fallas posibles — estamos ajustando en
iteraciones: encontrar un fallo nuevo es ÉXITO, no fracaso. NO te detengas en el primer ✅.

Recorre estos escenarios y para CADA uno reporta la observabilidad de §3:
{ESCENARIOS — p.ej.:
 A) Bot SIN login: abre el widget, manda 3 mensajes (saludo, pregunta real del negocio, algo ambiguo);
    ¿responde con sentido o cae en "no te entendí"? ¿aparecen botones? ¿qué hacen?
 B) Bot CON login (yo ya inicié sesión): repite A; ¿cambia el comportamiento/persistencia?
 C) Finalizar conversación: ¿el historial se actualiza solo? ¿inicia una nueva? ¿exige Ctrl+Shift+R?
 D) Recargar la página a mitad de conversación: ¿se conserva el estado? ¿se pierde?}

Sé ADVERSARIAL, no confirmador: tu meta es ROMPERLO. No te quedes en el camino feliz —
prueba bordes, repite ciclos (ej. finalizar→reabrir 2-3 veces), entradas raras y caminos
infelices. Para CADA afirmación negativa ("sin errores", "no falla") PRUÉBALA con un sweep
explícito de consola/network (di qué patrón buscaste) — la ausencia de mención NO es prueba.
Reporta además qué NO pudiste probar.

EXPLORACIÓN AUTÓNOMA (eres mis OJOS — libre albedrío): ADEMÁS de los escenarios que te di, EXPLORA por
iniciativa PROPIA — pulsa botones/links/menús/iconos/zonas que NO te listé, prueba caminos inesperados,
inputs raros, dobles clics, atrás/adelante, resize, y estados límite. Si algo te da curiosidad o huele
a bug, PÚLSALO/PRUÉBALO. Esa libertad SIEMPRE está acotada por lo PROHIBIDO de arriba: nada irreversible/
destructivo/envíos reales sin mi OK — ante la duda, DETENTE y avísame. Reporta qué exploraste por tu
cuenta y qué encontraste (lo no-anticipado suele ser el mejor hallazgo).

Al terminar, entrégame UN reporte estructurado con el formato de "Observabilidad" (abajo).
```

## 3. Esquema de OBSERVABILIDAD (qué debe devolver — para que el relay sea accionable, no anecdótico)
Por cada escenario, exijo:
- **Consola**: errores/warnings (texto literal del primero relevante), o "limpia".
- **Network**: requests fallidos (status ≥400 / CORS / timeout) con URL + código, o "sin fallos".
- **DOM/estado**: qué se renderizó / cambió (aparición de widget, botones, modales, vacíos).
- **Respuestas reales**: cita LITERAL de lo que dijo el bot/UI (no parafraseo) — la evidencia de oro. Recórrelas TODAS scrolleando el chat completo (DOM), NO solo el último bubble del viewport.
- **Transición**: qué pasó al finalizar/iniciar/recargar (¿optimista? ¿exigió refresh? ¿se perdió estado?).
- **Veredicto del escenario**: ✅ esperado / ⚠️ raro / ❌ roto, en una línea.
- **Prueba de negativos**: toda afirmación "sin error/sin fallo" trae el sweep que la respalda (qué patrón se buscó), NO la mera ausencia de mención.
- **No-probado**: lista explícita de lo que NO se recorrió (ciclos, caminos infelices, bordes) — para que YO no lo dé por bueno.
- **Diseño/UX (para el plan de rediseño)**: defectos VISUALES con captura + ubicación + severidad — texto cortado o renderizado vertical (1 letra/línea), botones que se superponen/aplastan la burbuja, overflow, scroll-traps, desalineación, contraste pobre, z-index, responsive roto, estados rotos (vacío/carga/error). Se ACUMULAN para el rediseño, no se arreglan en el acto salvo que rompan el flujo.
- **Consistencia entre sistemas** (si el cambio cruza superficies, p.ej. bot→CRM): el dato que ENTRA por una (chat/lead/escalación) debe aparecer COMPLETO y correcto en la otra (panel/CRM) — sin pérdida ni desfase en la ingestión. Cruzar conteos + contenido (nombre, celular, vehículo, canal, consentimiento).
- **Copywriting & flujo comercial (saludo→cierre)**: recorre la conversación COMPLETA como cliente real (saludo → descubrimiento → captura de datos → agendar/escalar → cierre/finalizar) y caza: mensajes o bloques **duplicados/redundantes** (ej. el mismo CTA/quickReplies 2 veces), CTAs/opciones **prematuros** (pedir fecha antes de pedir datos), tono/ortografía/voz de marca inconsistente, pasos que sobran o faltan, momentos donde el cliente se **confunde o se estanca**, fricción comercial (¿pide datos en mal momento? ¿el CTA correcto en cada paso? ¿el bot aterriza la venta o divaga?). Reporta cita LITERAL + qué se siente mal + sugerencia. Va al backlog de rediseño.

## 4. Barandas de seguridad
- **Credenciales = solo el dueño.** Nunca las pido, recibo ni pego.
- **Observar > actuar.** Nada irreversible (lead/pago/borrado/edición de prod) sin OK explícito; el prompt
  ya lo prohíbe. Para probar el envío real de un lead → el dueño decide y usa datos de prueba marcados.
- **PII**: si la observabilidad trae datos personales reales, el dueño los tacha antes de pegar.
- **App Check / reCAPTCHA**: un 403 al bot del navegador de prueba puede ser esperado (es el guardrail) —
  lo distingo de un fallo real leyendo el cerebro del proyecto antes de declarar bug.

## 5. Yo tomo acciones (el relay de vuelta)
1. Ingiero el reporte **ADVERSARIALMENTE** (§3.3 evidencia antes de afirmar): cada "✅" es hipótesis a refutar. (a) cruzo cada claim contra el código (¿qué función lo explica? ¿es plausible?); (b) exijo el sweep para los negativos (no acepto "se ve bien"); (c) nombro los gaps no probados; (d) **NUNCA cierro por el "✅" del reporte solo** — confirmo contra el código o pido el escenario faltante.
2. Triage con `caza-bugs`: ¿el síntoma está en el camino vivo del estado-cero? ¿es código viejo revivido
   (`anti-codigo-muerto` — el caso testigo: botones que mandan al motor VIEJO que no entiende)?
3. **Clasifico el hallazgo y ESCALO según haga falta** (severidad × reversibilidad × ambigüedad — gateado, no por defecto):
   - **Claro y de bajo riesgo** (causa verificada, fix mínimo, reversible) → **fix directo** + re-validar. La mayoría cae aquí (§233/§234 lo fueron — no sobre-maquinar, L-50).
   - **Causa ambigua / varios fixes plausibles / toca contrato o estado compartido** → **`comite-expertos` ACOTADO** (inline, pocos expertos, sin tools, razonan sobre el diagnóstico ya verificado) para elegir el fix.
   - **Decisión Fuerte** (arquitectura, modelo de datos, seguridad/privacidad/legal, dinero, op irreversible — p.ej. pérdida de datos en la ingestión; un fix de privacidad con alcance arquitectónico) → **`proceso-decision-fuerte`** completo (verificar → comité → **consejo externo Gemini `15`** → verificar cada claim → revalidar → veredicto → impl por fase).
   - **Dominio especializado** (legal/seguridad/UX/SEO/perf) → **skill** relevante (`legal-colombia` para datos personales/Ley 1581, etc.) + lóbulo `40`.
   - **SIEMPRE BOUNDED** (memoria `feedback-agent-machinery-bounded`): los fan-outs grandes cuelgan en esta máquina; la maquinaria anti-fallos no puede ser fuente de fallos. Defectos de DISEÑO → al backlog del rediseño, no al fix inmediato.
4. Fix (directo o vía la maquinaria elegida) → re-emito el prompt (§2) con el escenario que falló → confirmo ✅ en vivo antes de cerrar.

## 6. Conexiones (doble vía)
- **Hacia mí** (qué recorrer / cómo cerrar): `caza-bugs` · `verification-before-completion` · `anti-codigo-muerto` (que lo nuevo no dejó lo viejo roto EN VIVO).
- **Soy el gate empírico DE**: `proceso-decision-fuerte` **paso 7** (pruebas de estado en un navegador REAL cierran la decisión).
- **Escalo HACIA** (§5.3, gateado+bounded): `comite-expertos` (fix ambiguo) · `proceso-decision-fuerte`+Consejo Externo Gemini `15` (Decisión Fuerte) · skills de dominio (`legal-colombia`/seguridad/UX) · backlog de rediseño (defectos de diseño).

## 7. Salida (veredicto citable, no "se ve bien")
`live: {URL} · escenarios: [A✅ B⚠️ C❌ …] · evidencia: [consola/network/citas] · acción: [fix §X / re-validar / cerrado]`.

---
> **[HONOR]** — sin gate de linter (la ejecución vive en el navegador del dueño, fuera de mi alcance
> mecánico); se cumple por honor como los demás reflejos §G.4. Admisión: declarado [HONOR] (anti-M-10).
