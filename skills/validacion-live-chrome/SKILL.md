---
name: validacion-live-chrome
description: Usar DESPUÉS de un merge/deploy cuando los cambios YA están EN VIVO en la web y hace falta EVIDENCIA REAL del comportamiento (no opinión, no localhost). Genera un PROMPT/checklist autocontenido para la extensión "Claude in Chrome" del dueño: él abre la web en vivo, mete sus credenciales (Claude NUNCA maneja credenciales), la extensión recorre el camino vivo y emite OBSERVABILIDAD (consola, network, DOM, respuestas reales, transiciones de estado); el dueño pega ese reporte aquí y YO tomo acciones (diagnóstico→fix→re-validar). Resuelve el hueco crónico de "verificación live" (L-08: no se puede E2E en localhost; el dueño hace la verificación final). Casos: bot logueado vs NO logueado, finalizar/iniciar/recargar conversación, formularios, flujos con sesión. NO reemplaza caza-bugs (ese es el reflejo de recorrer el camino vivo; esta skill es el INSTRUMENTO para hacerlo en producción cuando yo no tengo la sesión). Triggers — "ya se mergeó, valida en vivo", "pruébalo en la web ya desplegada", "lánzale un prompt a la extensión de Chrome", "el bot logueado/no logueado", "¿se actualiza al finalizar conversación?", "necesito evidencia real post-merge", "observabilidad del sitio live".
---

# 🔭 Validación Live vía extensión "Claude in Chrome" (post-merge)

> El dueño hace la **verificación final en vivo** (memoria + L-08: E2E solo contra producción, nunca
> localhost). Esta skill convierte ese paso manual en un **protocolo con evidencia**: yo redacto el
> prompt, la extensión Chrome lo ejecuta en la sesión REAL del dueño, y me devuelve **observabilidad**
> que YO interpreto. Es un APOYO para CAZAR EVIDENCIAS, no para que Claude opere credenciales ni mueva dinero.
> PORTABLE: cero rutas de un repo concreto — leo el cerebro del proyecto activo para llenar la URL,
> el subsistema tocado y los escenarios. Adapta al stack que sea.

## 0. Cuándo aplica / cuándo NO
- **SÍ**: tras un merge/deploy con el cambio YA en vivo, cuando el subsistema tocado tiene **estado
  observable por el usuario** (bot/chat, login/sesión, formularios/leads, CRUD, render condicional) y
  necesito evidencia real que NO puedo obtener en localhost (L-08) ni leyendo el diff.
- **NO**: cambios sin superficie viva (docs, cerebro, tooling, refactor interno sin efecto observable);
  un bug YA reproducible → `systematic-debugging`; el gate del claim final → `verification-before-completion`.
- **Relación con `caza-bugs`**: caza-bugs DECIDE *qué* recorrer (camino vivo desde estado-cero: vacío→1 y
  N→vacío + recarga); esta skill es *cómo* recorrerlo en PRODUCCIÓN cuando la sesión es del dueño.

## 1. División de trabajo (innegociable)
1. **Dueño**: abre la web en vivo y **mete él mismo las credenciales/login**. Claude NO maneja credenciales.
2. **Yo (Claude-dev)**: entrego el **PROMPT autocontenido** (§2) — qué recorrer, qué observar, qué reportar.
3. **Extensión Chrome** (en la sesión logueada del dueño): ejecuta + emite el **reporte de observabilidad** (§3).
4. **Dueño**: pega el reporte aquí → **yo tomo acciones**: caza-bugs → fix → re-validar (vuelta a §2).

> Dos modos: **(a) relay humano** (default — el dueño pega el prompt en la extensión y me pega la
> respuesta; respeta credenciales + L-08); **(b) directo** vía `mcp__Claude_in_Chrome__*` SOLO si el
> navegador del dueño está conectado Y él ya hizo login. Default = (a).

## 2. El PROMPT para la extensión (plantilla — yo la lleno y se la paso al dueño en el chat)
> Regla: **autocontenido** (la extensión no ve este repo ni nuestro chat), **observar > actuar**, y
> **prohibido lo destructivo** sin OK explícito del dueño. Pego la plantilla rellena, lista para copiar:

```
Eres un validador de QA en una web EN VIVO. NO inventes; reporta solo lo que observes.
URL: {URL_EN_VIVO}
Contexto del cambio que valido: {QUÉ SE MERGEÓ / subsistema tocado}
PROHIBIDO (sin que yo lo autorice explícitamente): enviar leads/formularios reales, pagos,
borrar/editar datos, o cualquier acción irreversible. Si un paso lo requiere, DETENTE y avísame.

Recorre estos escenarios y para CADA uno reporta la observabilidad de §3:
{ESCENARIOS — p.ej.:
 A) Bot SIN login: abre el widget, manda 3 mensajes (saludo, pregunta real del negocio, algo ambiguo);
    ¿responde con sentido o cae en "no te entendí"? ¿aparecen botones? ¿qué hacen?
 B) Bot CON login (yo ya inicié sesión): repite A; ¿cambia el comportamiento/persistencia?
 C) Finalizar conversación: ¿el historial se actualiza solo? ¿inicia una nueva? ¿exige Ctrl+Shift+R?
 D) Recargar la página a mitad de conversación: ¿se conserva el estado? ¿se pierde?}

Al terminar, entrégame UN reporte estructurado con el formato de "Observabilidad" (abajo).
```

## 3. Esquema de OBSERVABILIDAD (qué debe devolver — para que el relay sea accionable, no anecdótico)
Por cada escenario, exijo:
- **Consola**: errores/warnings (texto literal del primero relevante), o "limpia".
- **Network**: requests fallidos (status ≥400 / CORS / timeout) con URL + código, o "sin fallos".
- **DOM/estado**: qué se renderizó / cambió (aparición de widget, botones, modales, vacíos).
- **Respuestas reales**: cita LITERAL de lo que dijo el bot/UI (no parafraseo) — la evidencia de oro.
- **Transición**: qué pasó al finalizar/iniciar/recargar (¿optimista? ¿exigió refresh? ¿se perdió estado?).
- **Veredicto del escenario**: ✅ esperado / ⚠️ raro / ❌ roto, en una línea.

## 4. Barandas de seguridad
- **Credenciales = solo el dueño.** Nunca las pido, recibo ni pego.
- **Observar > actuar.** Nada irreversible (lead/pago/borrado/edición de prod) sin OK explícito; el prompt
  ya lo prohíbe. Para probar el envío real de un lead → el dueño decide y usa datos de prueba marcados.
- **PII**: si la observabilidad trae datos personales reales, el dueño los tacha antes de pegar.
- **App Check / reCAPTCHA**: un 403 al bot del navegador de prueba puede ser esperado (es el guardrail) —
  lo distingo de un fallo real leyendo el cerebro del proyecto antes de declarar bug.

## 5. Yo tomo acciones (el relay de vuelta)
1. Ingiero el reporte como **evidencia citada** (§3.3 del cerebro: evidencia antes de afirmar).
2. Triage con `caza-bugs`: ¿el síntoma está en el camino vivo del estado-cero? ¿es código viejo revivido
   (`anti-codigo-muerto` — el caso testigo: botones que mandan al motor VIEJO que no entiende)?
3. Fix → re-emito el prompt (§2) con el escenario que falló → confirmo ✅ en vivo antes de cerrar.

## 6. Conexiones
- `caza-bugs` (qué recorrer) · `verification-before-completion` (no cerrar sin evidencia) ·
  `proceso-decision-fuerte` **paso 7** (gate empírico con pruebas de estado en un navegador REAL) ·
  `anti-codigo-muerto` (validar que lo nuevo no dejó lo viejo roto EN VIVO).

## 7. Salida (veredicto citable, no "se ve bien")
`live: {URL} · escenarios: [A✅ B⚠️ C❌ …] · evidencia: [consola/network/citas] · acción: [fix §X / re-validar / cerrado]`.

---
> **[HONOR]** — sin gate de linter (la ejecución vive en el navegador del dueño, fuera de mi alcance
> mecánico); se cumple por honor como los demás reflejos §G.4. Admisión: declarado [HONOR] (anti-M-10).
