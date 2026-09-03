---
name: validacion-live-chrome
description: Usar DESPUÉS de un merge/deploy cuando los cambios YA están EN VIVO y hace falta EVIDENCIA REAL del comportamiento (no localhost, no opinión). Modo DIRECTO = DEFAULT (desde 2026-06-24): YO conduzco la extensión "Claude in Chrome" (mcp__claude-in-chrome__) y entrego el REPORTE con OBSERVABILIDAD real (consola, network, DOM, respuestas literales, transiciones de estado); las credenciales las mete el dueño (Claude NUNCA las maneja). FALLBACK sin extensión conectada: genero un PROMPT autocontenido que el dueño ejecuta y pega aquí. Cubre el hueco de verificación live (doctrina: no hay E2E en localhost — la verificación final es contra producción). Casos: bot logueado vs NO logueado, finalizar/iniciar/recargar conversacion, formularios, flujos con sesion. CRITICO ADVERSARIAL: refuta, no confirma. Complementa caza-bugs. TAMBIÉN decide QUÉ superficie de navegador usar (§0.5): navegador INTEGRADO de Claude Code (`mcp__Claude_Browser__*` — sin las sesiones del dueño; DEFAULT para nuestro dev server, staging público, URLs públicas y descargas de assets públicos) vs EXTENSIÓN Chrome (`mcp__claude-in-chrome__*` — el Chrome REAL logueado del dueño; SOLO cuando el camino exige una credencial/sesión suya). Triggers: "ya se mergeo, valida en vivo", "pruebalo en la web desplegada", "lanzale un prompt a la extension de Chrome", "valida adversarial", "evidencia real post-merge", "observabilidad del sitio live", "¿navegador integrado o extensión?", "abre/descarga/previsualiza en el navegador".
actualizada: 2026-09-02
reglas: 26
lecciones: []
---

# 🔭 Validación Live vía extensión "Claude in Chrome" (post-merge)

> El dueño hace la **verificación final en vivo** (doctrina: E2E solo contra producción, nunca
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

## 0.5 — QUÉ superficie de navegador usar (integrado vs extensión vs preview) — decidir SIEMPRE primero
Hay **tres** superficies de navegador con límites distintos. Elegir mal = fricción o fallo. La pregunta
madre: **¿el camino necesita una CREDENCIAL/SESIÓN del dueño?**

| Superficie | Tools | Qué es / límite | USAR para |
|---|---|---|---|
| **Navegador INTEGRADO** (default) | `mcp__Claude_Browser__*` (`navigate`/`read_page`/`computer`/`get_page_text`/`read_network_requests`/`preview_*`) | Navegador DENTRO de Claude Code. **YO lo conduzco 100%**. Límite: **NO tiene las sesiones logueadas del dueño** — es un navegador limpio y aislado de su Chrome real. | Previsualizar/verificar **nuestro dev server** (`preview_start`), **staging** público (`*.workers.dev`), **URLs públicas** (docs, competencia, referentes), **descargar assets PÚBLICOS**, inspeccionar DOM/red/consola de cualquier sitio **sin login**. Es el DEFAULT. |
| **Extensión "Claude in Chrome"** | `mcp__claude-in-chrome__*` (cargar con ToolSearch si están deferred) | El **Chrome REAL del dueño** con SUS sesiones. Límite: requiere que la extensión esté **conectada** (`list_connected_browsers`) y el dueño logueado; opero en su navegador real → más cautela, nada irreversible sin OK. | SOLO cuando el camino **exige una sesión suya**: el **panel admin del producto**, dashboards autenticados (**Firebase console, Search Console, GBP, Cloudflare, Meta**), o validar el **producto desplegado** tal como lo ve él/un usuario en su entorno real. Es el gate de `proceso-decision-fuerte` §7. |
| **`preview_*`** (subconjunto del integrado) | `mcp__Claude_Browser__preview_*` | Arranca/gestiona **nuestro dev server local**. | Cambios **locales no-deployados** (antes del merge). |

**Regla de una línea:** ¿necesita login/sesión del dueño? → **extensión Chrome**. ¿No? → **navegador integrado** (default). ¿Es nuestro código local sin deploy? → **`preview_*`** en el integrado.

**Descargas (ej. imágenes/assets públicos):** un asset PÚBLICO se baja con el integrado o con `WebFetch`/curl (más directo); NUNCA hace falta la extensión para algo público. ⚠️ Barandas globales siguen rigiendo: descargar un archivo pide permiso explícito (nombre·fuente·tamaño), y **JAMÁS descargar/usar imágenes de terceros con derechos** (Google Images, stock sin licencia) para el producto — usar placeholders libres de regalías o stock licenciado (L-O10).

**No confundir superficies:** el integrado NO ve lo que el dueño tiene logueado (si necesito su panel admin real, es la extensión); la extensión NO sirve para previsualizar nuestro código local sin deploy (eso es `preview_*`). Ante la duda: empiezo por el integrado (no toca su navegador) y solo escalo a la extensión si choco con un muro de login que solo su sesión abre.

## 1. División de trabajo (innegociable)
1. **Dueño**: abre la web en vivo y **mete él mismo las credenciales/login**. Claude NO maneja credenciales.
2. **Yo (Claude-dev)**: entrego el **PROMPT autocontenido** (§2) — qué recorrer, qué observar, qué reportar.
3. **Extensión Chrome** (en la sesión logueada del dueño): ejecuta + emite el **reporte de observabilidad** (§3).
4. **Dueño**: pega el reporte aquí → **yo tomo acciones**: caza-bugs → fix → re-validar (vuelta a §2).

> Dos modos: **(b) DIRECTO = DEFAULT cuando el navegador del dueño está conectado** (verificado
> 2026-06-24: `list_connected_browsers` → conectado): **Claude maneja la extensión** vía
> `mcp__claude-in-chrome__*` (navega, lee DOM/consola/red, clicks) — tras merge+~5min de deploy el dueño
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

## 5bis. Mide el nodo que verá el usuario, no el que escribiste

Un chequeo sobre el markup estático **no prueba nada** del contenido que pinta el JS: son dos
poblaciones distintas de nodos y pueden tener estilos distintos sin que nada avise (ver
`ssg-static-prerender` §4bis). Reglas de método:

1. **Inyecta datos de prueba y mide el resultado**, no la plantilla. Una tabla vacía se ve perfecta.
2. **Compara contra un control.** Duplica el nodo, ponle a mano lo que el framework le habría puesto
   y mide los dos: «53px de alto contra 157, sin fondo, sin borde, sin padding» es un hallazgo;
   «se ve raro» no. El control convierte una sospecha en evidencia.
3. **La geometría es el instrumento cuando no hay captura de pantalla.** `getBoundingClientRect` +
   `getComputedStyle` cazan lo que el ojo perdona y sobreviven a que el panel del navegador no esté
   visible. Cuatro medidas que pagan siempre: (a) `left` de cabecera vs de fila — si no cuadran, la
   rejilla no se aplicó; (b) `scrollWidth > clientWidth` — texto recortado; (c) `top` de un hermano
   contra el `bottom` del anterior — solapes; (d) `body.scrollWidth` vs `clientWidth` — desborde.
4. **El texto recortado se juzga por lo que ES, no por si cabe.** Un identificador o una fecha
   aguantan puntos suspensivos; una INSTRUCCIÓN («Preaviso de terminación por mora. Escrito, con
   constancia de entrega») cortada a la mitad deja al operador sin la parte que le dice qué hacer.
   Esa envuelve.
5. **Si la pantalla está tras una puerta de acceso que no puedes abrir**, no la des por buena:
   sírvete el HTML de la ruta y renderízalo sin sus `<script>`. Se pierde el comportamiento, pero el
   layout y el CSS son reales — y es exactamente lo que estás juzgando.

6. **Guarda de medibilidad: una comparación de ceros no es una comparación.** Si el contenedor está
   oculto todo mide 0, y `[0,0,0] === [0,0,0]` da verde — te has dado un ✅ sin comparar nada. Antes
   de emitir veredicto exige que la medida exista (`medible = cabecera.some(x => x > 0) &&
   altos.every(h => h > 0)`) y devuelve «SIN MEDIR» si no. Comprueba también que la cadena de padres
   hasta `body` está visible, no solo que el elemento existe.

7. **Cuando tu arreglo de CSS «no hace nada», la primera pregunta es ¿GANA?, no ¿ESTÁ?** Una regla
   puede compilarse, servirse y perder en silencio. Tres trampas, por frecuencia: (a) `@media` **no
   aporta especificidad** — empata con la regla que quiere vencer, y entre iguales decide el ORDEN DE
   APARICIÓN, así que las overrides van al FINAL del bloque; los frameworks que acotan por atributo
   (Astro `[data-astro-cid-…]`, Vue `[data-v-…]`) suben los DOS lados por igual, con lo que el empate
   es la norma y no la excepción. (b) No concluyas «no se compiló» de un `grep` del BUILD hecho con la
   sintaxis del FUENTE: los minificadores reescriben (`max-width: 900px` → `width<=900px`), y ese
   vacío se lee como ausencia cuando la regla llevaba ahí desde el principio. Busca lo que el
   compilador no puede reescribir —el nombre de clase— o pregúntale al CSSOM vivo. (c) Los selectores
   se sacan de la cadena del DOM **medida**, no de tu memoria del marcado. Las tres se zanjan de una
   vez recorriendo `document.styleSheets` y listando qué reglas casan con el nodo y en qué orden.

8. **Un campo por debajo de 16 px es un fallo medible en móvil, no una preferencia tipográfica.**
   Safari en iOS amplía la página al enfocar cualquier campo con letra menor y **no deshace ese zoom**
   al salir: quien toca el buscador se queda con la página ampliada. Cabe en una línea de todo barrido
   móvil: `[...document.querySelectorAll('input,select,textarea')].filter(x =>
   parseFloat(getComputedStyle(x).fontSize) < 16)`. Y el arreglo **nunca** es `maximum-scale=1`: eso
   apaga la lupa a quien la necesita para leer. Se arregla el tamaño, no se quita el zoom.

9. **La geometría NO dice si algo está oculto — y eso limita la regla 3.** Un `<details>` cerrado, o
   cualquier elemento bajo `content-visibility: hidden`, **conserva su caja de layout**: Chrome se
   salta el pintado, no el tamaño. Medido en vivo, un panel devolvía `getBoundingClientRect().height
   = 158` **cerrado y abierto por igual**, y estuve a un paso de apuntar un panel que se escapaba —
   un bug que no existía. El instrumento correcto es **`el.checkVisibility()`**, que dio `false`
   cerrado y `true` abierto. Regla: la geometría mide **cuánto ocupa**; la visibilidad se pregunta
   con `checkVisibility()`, y `display`/`visibility` computados tampoco bastan (los dos decían
   `grid` / `visible` con el panel cerrado). ⚠️ Y `elementFromPoint` devuelve `null` cuando el panel
   integrado reporta un viewport de 0×0: si vas a usarlo, **imprime `innerWidth` primero** o estarás
   leyendo un `null` que no significa «no hay nada ahí».

10. **🧊 En el panel integrado el renderer está CONGELADO — y eso decide QUÉ puedes medir ahí.** No
    hay frames: no avanzan las transiciones ni las animaciones, `scrollTo`/`scrollTop` **desde el
    script de la página** no se aplican, y `await requestAnimationFrame(...)` **cuelga la
    herramienta hasta el timeout** (45 s tirados). Tres antídotos concretos, todos verificados:
    - **Para medir una propiedad con `transition`**, apágalas y lee: inyecta un
      `<style>*,*::before,*::after{transition:none!important;animation:none!important}</style>` y
      luego `getComputedStyle`, que fuerza el recálculo síncrono — sin esperas, que no hay frames que
      esperar. Sin esto leerás el valor **INICIAL** y creerás que tu regla no aplica. Caso real: la
      variable del `:root` decía `0px` y el `top` computado decía `66.99px`; el `transform` de otro
      elemento estaba en `-0.008px` en vez de `-100%`. Los dos al 0,8% de su recorrido — a un paso de
      apuntar un bug que no existía.
    - **Para hacer scroll de verdad, usa el scroll DEL PANEL** (`computer{action:'scroll'}`), no el
      del script: ese sí desplaza y **sí dispara los manejadores** (medido: `scrollY` 0 → 47 → 809, y
      un header con auto-ocultar alternó su clase). La distinción importa: no es que el panel no
      haga scroll, es que no lo hace desde `window.scrollTo`.
    - **Para que la geometría signifique algo, emula un viewport primero** (`resize_window`). Sin
      eso `innerWidth` puede ser **0**, y entonces `elementFromPoint` devuelve `null` y toda medida
      relativa al viewport es humo. Con viewport emulado se pueden medir solapes reales — un bug
      anotado como «no medible aquí, hace falta el Chrome del dueño» se midió aquí.
    ⚠️ Y el meta-aviso: esto no se descubre, **se consulta**. Si tu cerebro tiene una lección sobre
    el panel congelado, léela ANTES de abrir el navegador. Un disparador redactado sobre operaciones
    «riesgosas» no alcanza a medir, que no se siente riesgoso — y ahí se pierden las sondas.

## 6. Conexiones (doble vía)
- **Hacia mí** (qué recorrer / cómo cerrar): `caza-bugs` · `verification-before-completion` · `anti-codigo-muerto` (que lo nuevo no dejó lo viejo roto EN VIVO).
- **Soy el gate empírico DE**: `proceso-decision-fuerte` **paso 7** (pruebas de estado en un navegador REAL cierran la decisión).
- **Escalo HACIA** (§5.3, gateado+bounded): `comite-expertos` (fix ambiguo) · `proceso-decision-fuerte`+Consejo Externo Gemini `15` (Decisión Fuerte) · skills de dominio (`legal-colombia`/seguridad/UX) · backlog de rediseño (defectos de diseño).

## 7. Salida (veredicto citable, no "se ve bien")
`live: {URL} · escenarios: [A✅ B⚠️ C❌ …] · evidencia: [consola/network/citas] · acción: [fix §X / re-validar / cerrado]`.

---
> **[HONOR]** — sin gate de linter (la ejecución vive en el navegador del dueño, fuera de mi alcance
> mecánico); se cumple por honor como los demás reflejos §G.4. Admisión: declarado [HONOR] (anti-M-10).
