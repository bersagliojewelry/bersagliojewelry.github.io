---
name: caza-bugs
description: Usar al TOCAR o ROZAR un subsistema con estado observable (render, listener/onSnapshot, CRUD, flujo de pasos) — editarlo, refactorizarlo con cambio de comportamiento, o cambiar el estado compartido (doc de base de datos, sessionStorage, caché) que otro flujo lee — ANTES de darlo por bueno. Recorre su CAMINO VIVO end-to-end, en especial las dos fronteras del estado-cero (crear el 1er ítem y verlo aparecer; borrar el último y ver colapsar limpio), no solo el cambio puntual. Encapsula el reflejo barato siempre-on y la escalera de escalado calibrada (revisión adversarial + comité + consejo externo) sin gastar de más en lo trivial. NO es para depurar un fallo ya reproducible (eso es systematic-debugging) ni para el gate de evidencia del claim final (verification-before-completion). Triggers — "verifica que no rompí nada", "probé el cambio pero no el flujo", "edité X y lo di por bueno", "esto se rozó con Y", "antes de cerrar/commitear esta funcionalidad".
actualizada: 2026-09-02
reglas: 66
lecciones: [G:G-001, G:G-004, G:G-010, G:G-011, G:G-013]
origen: propia
---

# 🐛 Caza-bugs — recorrer el camino vivo de lo que tocas, no solo tu diff

> Nace de un bug real: edité un módulo de render bajo UNA lente, lo di por bueno, y nunca
> probé "crear el 1er ítem → ¿aparece?". El bug solo emergía desde CERO ítems. La lección no
> fue "faltó maquinaria pesada" — fue que faltó el chequeo BARATO de 30 segundos.
> PORTABLE: cero rutas de un repo; adapta al stack del proyecto activo (lee su cerebro).

## 0. Cuándo aplica / cuándo NO
- **SÍ**: al MODIFICAR o ROZAR un subsistema con estado observable por el usuario.
- **NO**: un bug YA reproducible → `systematic-debugging`. El claim final "hecho/pasa" →
  `verification-before-completion`. Edit trivial sin camino de usuario (copy, color, refactor
  puro sin cambio de comportamiento).

## 1. La Ley (siempre-on, casi gratis)
Toco/rozo una pieza → mi unidad de verificación es el **CAMINO VIVO end-to-end que pasa por
ella**, NO "mi cambio quedó como yo quería". Mirar la pieza con una sola lente (la del cambio)
es exactamente como se escapan los bugs.

## 2. Checklist del estado-cero (el filo — lidera con esto)
La clase de bug nº1: el contenedor se **ACTUALIZA** pero nunca se **CREA** cuando arranca vacío.
Recorre las **dos fronteras** + la carrera de carga:
- **vacío → 1**: crea el 1er ítem. ¿Aparece en vivo? ¿Persiste tras **recarga dura**? (el 1er
  paint suele ser async-vacío — si el render no monta el contenedor vacío, el refresh no puede
  crearlo y el ítem nunca aparece).
- **N → vacío**: borra el último. ¿La vista colapsa limpio, o queda un contenedor/encabezado
  huérfano?
- **carrera de carga**: ¿el listener puede llegar ANTES de que monte el DOM? ¿doble render por
  dos listeners?
Los demás estados (lleno, idempotencia/re-montar) son secundarios; no diluyas el filo en una
lista de QA genérica.

## 2c. Checklist de lo que QUITAS (borrar también es tocar)

El checklist del estado-cero mira lo que se crea. Un borrado tiene su propia frontera, y se salta con
la misma facilidad porque «quitar» se siente seguro. Si el diff **retira** contenido, una sección, una
opción o un dato:

- **¿Quién lo ENLAZA?** Caso real: se ocultó una sección de la portada con una guarda de render y
  resultó que **80 enlaces de 40 páginas** —la cabecera y el pie de todo el sitio— aterrizaban en su
  ancla. Un ancla sin destino **no da error**: deja al visitante donde estaba, viendo una web que no
  responde. 🎯 *Cuando el contenido de una sección desaparece, lo que hay que revisar no es la
  sección: es quién la enlaza.* Busca el `#ancla`, la ruta y el `id` en TODO el sitio construido, no
  solo en el fichero que editas.
- **¿Existe una segunda copia?** Un dato de demo suele vivir en dos pantallas —la portada y el
  listado—, una regla vive en el repo y en producción, un texto vive en el fuente y en el build.
  Retirar es un `grep` GLOBAL del VALOR (el precio, el nombre, el identificador), no una edición.
- **⚠️ Y escribe el comentario de «retirado» DESPUÉS de que el grep dé cero.** Al revés se convierte
  en un sello que nadie vuelve a levantar: quien audita lee «retirada» y no busca la copia. Caso real:
  una card inventada de $2.100.000.000 sobrevivió meses en un segundo fichero **debajo de un
  comentario que certificaba su retirada**.
- **¿Quedó huérfano lo que la acompañaba?** Flechas de carrusel sin tarjetas, encabezado sin cuerpo,
  filtro sin opciones, botón sin destino. Lo que rodea al contenido borrado rara vez se borra solo.

## 2b. Checklist del DINERO (obligatorio si el subsistema mueve plata)
Nace de un bug REAL (traslado duplicado de $5.6M, 2026-07-09): el camino vivo del dinero tiene
fronteras propias que el checklist visual no cubre. Si el diff toca caja/pagos/stock/saldos:
- **Ida-y-vuelta con recarga**: haz la operación → navega a OTRA página → VUELVE (recarga
  completa). ¿La UI pide repetir la operación? ¿El estimado cuadra? (El bug real: 4 listeners
  llegaban en desorden al recargar y el modal pedía trasladar de nuevo lo ya trasladado.)
- **Foto incompleta**: ¿alguna decisión AUTOMÁTICA (modal, bloqueo, alerta, cálculo) se dispara
  con datos a medio llegar? Toda automatización sobre datos remotos exige un gate de "fuentes
  listas". Los botones manuales pueden ser optimistas; lo automático NO.
- **Conservación**: después de cada operación, suma las tres vistas del mismo peso — UI
  estimada, sello/ecuación del servidor y ledger. ¿Dan el MISMO número? Un descuadre entre
  vistas es el bug, aunque cada vista "se vea bien" sola.
- **El camino de deshacer**: anula/reversa/cancela la operación recién hecha. ¿TODAS las vistas
  se netean (no solo una)? (Bug real #2: la reversa arreglaba la bóveda pero el cierre del turno
  seguía contando el fantasma.) ¿Deshacer dos veces está bloqueado?
- **Negativos a la vista**: fuerza un estado imposible (deshacer tras mover el dinero). ¿El
  número negativo SE VE en rojo, o un formateador lo recorta a $0 y esconde la anomalía?
- **Doble sesión**: la misma operación desde dos pestañas/sesiones. ¿Idempotencia real o
  duplicado con id nuevo?
Donde caces uno, blíndalo con un test de integración del ESCENARIO completo (no del paso).

## 3. "Rozar" — el disparador (con su frontera)
- **SÍ dispara** si mi diff cambia una entrada/salida/contrato, **O el estado compartido** (doc
  de BD, sessionStorage, caché) que **otro** subsistema lee — aunque no edite su archivo.
- **NO dispara**: color, copy, refactor puro sin cambio de comportamiento, edición mecánica.
- **Alcance (regla de parada, anti-infinito y anti-atrofia)**: recorre hasta el primer punto
  donde el usuario VE el efecto de mi cambio, **+ un salto a quien comparte mi estado**. No el
  producto entero; tampoco solo mi pantalla (ese fue el error original).

## 4. Ejecutar > razonar — y donde lo caces, blíndalo
Prefiere **EJECUTAR** el camino (emulador / preview / correr el flujo) sobre razonar que
"debería funcionar" — razonar fue lo que falló. Donde el preview no pinte lo dinámico, traza el
flujo por código de forma **adversarial** (¿qué monta el nodo? ¿quién dispara el refresh? ¿en
qué orden?), no una sola pasada complaciente. **Donde caces el bug, blíndalo con un test del
estado-cero** (p. ej.: `renderX()` con 0 ítems emite el contenedor que `refreshX()` puede
poblar) vía `test-driven-development` — ese test es el único gate mecanizable real.

## 4b. 🔇 El fallback SILENCIOSO — el bug que se disfraza de "funciona"
Un `catch {}` vacío o un `on('error', () => {})` puesto "para degradar con elegancia" **no degrada:
OCULTA**. La UI muestra el estado de reserva, nadie ve un error, y el sistema queda en un fallo
PERMANENTE que además se documenta como verdad ("solo falta X"). Caso propio 2026-08-20: el basemap
de un portal llevaba semanas sin pintar y el estado registraba «falta solo la vista en foreground»;
el error real (`There is no tile manager with ID …`) solo apareció al añadir un `console.error` en DEV.
**⚠️ Antes de culpar a una librería, comprueba `document.visibilityState`**: en una pestaña `hidden`
(y toda pestaña automatizada suele estarlo) Chrome congela `requestAnimationFrame` → mapas, canvas,
WebGL y animaciones **nunca completan su carga** y producen síntomas idénticos a un bug real, con
errores internos incluidos que parecen la causa. Caso propio 2026-08-20: 4 cambios de dependencia
probados contra un "bug" que era una pestaña oculta. **Bisecciona hacia abajo hasta el caso mínimo**
(un estilo sin fuentes, un canvas que solo pinta un color): si el mínimo TAMPOCO funciona, el problema
no está donde crees. Y si el mismo síntoma sobrevive a **dos versiones mayores distintas** de la
librería, la hipótesis es errónea, no la versión.

**Reglas**: (1) todo fallback **grita en DEV aunque calle en PROD** — silenciar es una decisión de UX,
nunca de observabilidad; (2) al auditar un subsistema con modo degradado, busca **la señal binaria que
distingue vivo de fallback** (aquí: la clase `.is-live` que el propio código añade) y compruébala — no
juzgues por captura de pantalla, porque el fallback se ve BIEN; (3) si el código no expone su estado,
**añade una sonda gateada por DEV** antes de seguir adivinando; (4) desconfía de un estado que diga
"verificado" sin decir QUÉ se verificó: aquí se había verificado el SERVIDOR de tiles, no el render.

## 4c. 🕳️ El camino que el JS TAPA — el fallback que nadie ejecuta jamás
Un formulario progresivamente mejorado tiene DOS caminos: el `fetch` de la isla y el POST nativo del
navegador. Al probar en un navegador **siempre corre el primero**, así que el segundo puede llevar
meses roto sin que ninguna verificación lo note — y es justo el que atiende a quien tiene el JS
bloqueado, la red a medias o un bot de accesibilidad. **Ejercítalo con `curl`**, que es lo único que
lo dispara de verdad:
- POST nativo = `Content-Type: application/x-www-form-urlencoded` **y** cabecera `Origin` del propio
  sitio. Sin `Origin` muchos frameworks (Astro, SvelteKit, Next con Server Actions) devuelven **403**
  por su comprobación anti-CSRF, y ese 403 se confunde con un bug tuyo: no lo es, es que `curl` no
  simula un navegador salvo que se lo digas.
- Espera un **303 con `Location`**, no un 200: el patrón correcto es POST-Redirect-GET (un F5 no
  puede reenviar el formulario).
- Comprueba que el redirect **conserva el contexto** (la búsqueda, los filtros, lo ya escrito). Un
  error que devuelve el formulario en blanco pierde al usuario igual que un fallo.

**Y desconfía del middleware que toca TODAS las respuestas.** Una cabecera añadida a cada respuesta
(noindex de staging, request-id, CORS) alcanza también a las respuestas que el framework fabrica, y
algunas son **inmutables** por el estándar Fetch — `Response.redirect()` y `Response.error()` nacen
con las cabeceras congeladas y cualquier `set()` **lanza**. Resultado: 500 en todo endpoint que
redirija, o sea exactamente el fallback sin JS. Si además la cabecera solo se añade fuera de
producción, el 500 aparece **solo en staging**, que es donde se verifica todo. Patrón seguro:
`try { headers.set(...) } catch { reconstruir la Response con Headers nuevas }`.

**Regla portable**: cuando un subsistema tenga un camino A (el que usa la gente con todo funcionando)
y un camino B (degradado, de error, sin JS, sin permisos), **B no está probado hasta que lo hayas
disparado tú**. Enuméralos antes de cerrar: es una lista corta y casi siempre hay uno que nadie ha
ejecutado nunca.

## 4d. 🚧 La defensa que vive en la CONFIGURACIÓN y no en el código
Un comentario que dice *«esto no puede pasar, las reglas ya lo impiden»* apunta a un archivo del repo,
y lo que corre en producción es **el que está desplegado**. Entre los dos no hay nada: ningún gate
compara el ruleset del repo con el vivo, así que la diferencia no produce error, produce **confianza**.
Caso propio (2026-08-21): una página no comprobaba el estado de publicación de un registro porque las
Security Rules filtraban por estado — y esas reglas llevaban semanas sin desplegarse; el ruleset vivo
era el anterior, con lectura abierta. Un borrador se habría publicado entero, con precio y contacto, e
indexable.
**Comprobación**, no razonamiento: pregúntale al proveedor qué hay desplegado (`firebase deploy --only
… --dry-run`, la consola, `terraform plan`, el panel del CDN) y compáralo con el archivo. Si no puedes
comprobarlo en el momento, **asume que NO está** y pon el invariante también en el código.
**Regla portable**: el invariante que protege un dato se implementa en el código *aunque* también viva
en la configuración — defensa en profundidad, no delegación. Y reutiliza la MISMA lista que ya use otro
camino del sistema (aquí, la whitelist de estados con la que se construye el índice del catálogo), para
que las dos no puedan discrepar. Aplica igual a Firebase Rules, RLS de Supabase, políticas de bucket,
reglas de WAF y CORS del CDN.

## 4e. 🔑 Identificadores que se derivan de la presentación
Antes de cambiar el formato de una URL, busca quién la está PARSEANDO. Es un patrón silencioso:
guardas algo con una clave sacada de la dirección (`?id=`, un segmento del path) y el día que la
dirección cambia, todo lo guardado deja de reconocerse — sin error, sin log, y con la interfaz
pintándose perfectamente. Caso propio: los favoritos en `localStorage` sacaban su clave del `?id=` del
enlace de cada tarjeta. **Regla**: la clave de persistencia sale del DATO (un atributo que pone quien
conoce el registro), nunca de parsear la presentación; y un *slug* tampoco sirve, porque cambia al
corregir una tilde del título. Aceptar el formato viejo además del nuevo evita romper a partir de hoy,
pero **no reconstruye lo que ya se perdió**: por eso se arregla la fuente, no solo el lector.

## 4f. ✅ El ÉXITO que no está cableado — el peor de los fallos silenciosos

Un `mostrarExito()` conectado a nada: el botón revela el mensaje de confirmación y **no envía**. Es
la forma más dañina del fallback silencioso (§4b), porque las otras solo fallan — ésta **miente**, y
quien se lo cree es una persona esperando una respuesta que no va a llegar.

- **Dónde vive**: en réplicas de mockup y prototipos que se dieron por terminados. El mockup pintaba
  el estado de éxito para enseñarlo, y al implementar quedó el `hidden`/`removeAttribute` como si
  fuera el comportamiento. Nadie lo nota porque **la pantalla hace exactamente lo que se espera**.
- **Cómo cazarlo, en un minuto**: por cada mensaje de éxito de la interfaz, busca su emisor y sigue
  el hilo hasta una llamada de red o una escritura. `grep` de los ids de confirmación contra `fetch`
  / `submit` / el cliente de datos. Si el hilo se corta antes, es un éxito de mentira.
- **La misma sonda en negativo**: ¿qué mensaje sale cuando el envío FALLA? Si no existe ninguno,
  probablemente tampoco existe el envío.
- **Al arreglarlo, arregla también el TEXTO.** Si el flujo no es lo que el mensaje promete
  («reserva confirmada» cuando es una solicitud), cablearlo sin tocar la copia sustituye una mentira
  técnica por una comercial.

## 4g. 🕹️ El control que NO RESPONDE — hermano del éxito no cableado

Un botón o un enlace que nadie escucha. No falla, no avisa, no ensucia la consola: se pulsa y **no
pasa nada**. Si §4f miente diciendo que algo salió bien, éste no dice nada — y el silencio se
interpreta igual de mal: *«esto está roto»*, no *«esto todavía no existe»*.

- **Dónde vive**: menús laterales de paneles (secciones planeadas y no construidas), «Ver todo →»
  junto a tablas topadas, y cualquier `<a href="#">` que en realidad quería ser un botón. Casi
  siempre viene del mockup: allí el menú tenía siete entradas porque el diseño las imaginaba todas.
- **Cómo cazarlo, con un barrido**: por cada `<button>` y cada `<a href="#">`, comprueba si alguien
  lo BUSCA por su `id`, su clase o su `data-*`. Se automatiza en 60 líneas y encuentra en minutos
  lo que a mano no se ve nunca.
- **⚠️ Y el barrido tiene tres trampas** — las tres son «buscar al oyente donde no mira nadie», y las
  tres producen falsos positivos que matan el gate antes de que sirva:
  1. **El CSS no escucha.** Si lees el archivo entero, una regla `.mi-clase { … }` del `<style>`
     hace pasar por cableado a un control que no lo está. Mira SOLO el `<script>`.
  2. **Mencionar no es escuchar.** `el.className = 'mi-clase'` es una asignación. Solo cuentan los
     contextos donde la clase SIRVE PARA ENCONTRAR el elemento (`querySelector`, `closest`,
     `matches`, `getElementsByClassName`).
  3. **La delegación existe.** Medio panel puede estar cableado con un único oyente en el documento
     que pregunta `e.target.closest('#miBoton')`. Sin esa rama acusarás a controles perfectamente
     vivos.
  4. **🔴 LA BUENA PRÁCTICA PUEDE DEJARLO CIEGO — y es la trampa peor, porque falla en VERDE.** Un
     barrido que busca `class="…"` o `className = '…'` no ve nada en un módulo que pasa las clases
     como ARGUMENTO (`el('div', 'mi-clase')`)… que es justo lo que sale de prohibir `innerHTML` por
     seguridad. Caso real: un módulo aportaba **0 clases visibles y 16 invisibles**, y el gate decía
     ✅. *El código más limpio acaba siendo el menos vigilado, porque los patrones del barrido se
     escribieron mirando el código sucio.* **Comprobación de bolsillo, y cuesta un minuto**: tras
     añadir un módulo, mira si el CONTADOR del gate subió. Si escribiste 200 líneas y el gate ve las
     mismas clases que antes, no es que esté todo bien: es que no te está mirando.
- **Tres salidas legítimas, y el silencio no es una**: cablearlo · quitarlo · o dejar que **diga** por
  qué todavía no puede hacer nada, y dónde se hace hoy esa tarea. La tercera es la que se olvida, y
  suele ser la correcta cuando la sección es real pero futura.
- **Regla del gate, y vale para cualquier gate**: corrige sus **falsos positivos ANTES de encenderlo**.
  Un gate que acusa a un inocente se desactiva solo —en la cabeza de quien lo lee— y el día que grite
  de verdad, nadie mira.

## 4h. 👻 El ancla que no aterriza — y el hueco ENTRE dos gates

Primo de §4g, pero se escapa de su red: `href="#seccion"` cuyo `id` **no existe en la página de
destino**. El navegador no protesta ni ensucia la consola; se queda exactamente donde está. Para
quien lo pulsa no es un error, es *«esta web no responde»* — y es peor que un 404, porque un 404 al
menos se ve.

- **Dónde vive**: en el header y el pie, o sea en TODAS las páginas a la vez. Casi siempre nace del
  mockup, que dibujó el enlace como `href="#"` porque el destino aún no estaba decidido; alguien le
  puso después un nombre plausible (`#nosotros`, `#servicios`) y nadie comprobó que existiera.
- **Cómo cazarlo**: por cada `<a href="#x">` o `<a href="/ruta#x">` del **HTML construido**, mira si
  `id="x"` (o `name="x"`) está en el HTML de esa página. No hace falta red ni navegador: el destino
  está dentro del archivo que ya tienes abierto. Si la ruta destino se sirve en el servidor y no hay
  HTML que abrir, **no lo juzgues** — un gate que adivina, miente.
- **Agrupa el informe por ANCLA, no por página.** Un `#x` roto en un componente compartido son 74
  filas idénticas, y el informe deja de leerse justo cuando más hay que leerlo.

### Las tres lecciones transferibles (valen para cualquier proyecto)

1. **El defecto vive en la JUNTURA de dos gates, no dentro de ninguno.** Un gate miraba rutas
   `/algo`; el otro, el `href="#"` literal. Nadie miraba `href="#algo"`. Al auditar una red de
   verificación, no preguntes *«¿es profundo cada gate?»* sino **«¿qué cae entre dos?»** — dibuja el
   universo de casos y marca cuál gate cubre cada uno. Los sistemas de verificación fallan más por
   solapamiento incompleto que por falta de profundidad.
2. **Una exclusión MAL RAZONADA envejece peor que una sin razonar.** La cabecera del gate justificaba
   por escrito dejar las anclas fuera «porque comprobarlas exige red». Era cierto de los enlaces
   externos y se extendió al ancla sin volver a mirarlo. Nadie la re-cuestionó **porque parecía ya
   pensada**. Cuando leas el `ALCANCE` de un gate, trátalo como una hipótesis a refutar, no como
   documentación: cada exclusión debe nombrar el caso que excluye y por qué ESE caso.
3. **Cuando el defecto vive en un componente compartido, la medición AGREGADA es el único ángulo que
   lo revela.** Buscar el síntoma conocido a mano encuentra una instancia; contar todas las
   ocurrencias del patrón contra su condición de validez encuentra el sistema entero. Aquí: buscar
   `#nosotros` daba un ancla; medir las 664 anclas del build dio **468 enlaces muertos en el menú
   principal**, que nadie iba a buscar. *Si acabas de encontrar una instancia de un patrón, mide el
   patrón antes de arreglar la instancia.*

## 4i. 🔇 El control que funciona pero no dice qué pide — y el comentario que no es neutral

Un `<input>` sin nombre accesible: sin etiqueta (ni envolvente ni con `for`), sin `aria-label`, sin
`aria-labelledby`. El control **funciona**; lo que no hay es forma de saber qué pide. Y el
`placeholder` **no cuenta**: se borra en cuanto escribes, así que justo cuando alguien vuelve al campo
a corregir, ya no queda quien diga qué se le pedía. Tratarlo como etiqueta es escribir el bug y
taparlo a la vez.

- **Dónde duele más**: códigos de un solo uso, importes, campos con formato estricto — donde la
  persona ya está peleando con algo que caduca.
- **Barrido**: sobre el HTML CONSTRUIDO (ahí la etiqueta ya está pintada y no hay que adivinar qué
  envuelve a qué). Falsos positivos a matar antes de encenderlo: los `<template>`, la etiqueta
  ENVOLVENTE, y el input con atributo `hidden` (suele dispararlo un botón que sí tiene nombre).

### Dos hermanos del mismo barrido, que valen para cualquier proyecto

1. **`opacity: 0` esconde de los OJOS y de nadie más.** El nodo sigue en el árbol de accesibilidad y
   sus enlaces siguen en el orden de foco — `pointer-events: none` bloquea el ratón, no el tabulador.
   Un carrusel de N paneles así hace que un lector de pantalla lea los N titulares seguidos, y un
   teclado se pare en botones invisibles. El arreglo sin tocar el diseño es meter `visibility` en la
   transición (`visibility 0s linear <duración>` al ocultar): el fundido se ve igual y solo queda uno.
   *Al auditar «lo que se ve», pregunta siempre qué es lo que se sigue oyendo.*
2. **🔴 Un comentario NO es terreno neutral.** Lo lee el compilador, lo leen tus gates, y en HTML lo
   lee el navegador. Dos veces seguidas en una misma tarde el CONTENIDO de un comentario averió justo
   aquello que documentaba: primero cegó al gate —la nota explicaba por qué NO se usaba una etiqueta,
   y al nombrarla con sus signos de menor y mayor hizo pasar la comprobación de «¿hay etiqueta?»—, y
   después, reescrita en sintaxis de bloque, llevaba dentro el token que cierra el comentario y tumbó
   el build. **Reglas**: (a) un gate quita comentarios, `<script>` y `<style>` antes de analizar —
   *no leas partes del archivo que no pueden ser lo que buscas*; (b) al citar sintaxis dentro de un
   comentario, descríbela con palabras en vez de escribirla; (c) los comentarios internos van en la
   sintaxis que NO viaja al cliente.

## 4j. 🧮 El meta-gate que enumera POR CONVENCIÓN — solo protege a quien la respeta

Un meta-gate («¿están todos mis gates cableados al CI?») casi siempre se escribe enumerando por
patrón de nombre: `Object.keys(scripts).filter(k => k.startsWith('verify:'))`. Funciona, sale verde y
**es exactamente donde se esconde el agujero**: los comprobadores que no siguen la convención le son
invisibles, y el que no la sigue es justo el que nadie vigila.

Caso real (2026-08-26): el meta-gate contaba 7 gates `verify:*` cableados ✅ mientras `typecheck` y
`test` —que no llevan el prefijo— estaban fuera. Resultado: `npm run verify` daba verde con **26
errores de tipos** ya en la rama principal (el CI llevaba días en rojo, con los despliegues parados) y
**855 pruebas unitarias que el CI no ejecutaba nunca**. Entre ellas, las que sostienen invariantes
legales del producto. La red más grande del proyecto no estaba enchufada, bajo un ✅.

**Cómo cazarlo, barato y sin leer código.** No preguntes «¿están mis gates en el CI?» sino las dos
preguntas inversas, que son las que descubren:
1. **Del CI hacia el package**: lista TODO lo que el CI ejecuta y compáralo con lo que corre tu atajo
   local. Lo que el CI corre y el atajo no, es una trampa: empujarás creyendo que está verde.
2. **Del package hacia el CI**: lista TODOS los scripts que verifican algo —no solo los del prefijo—
   y comprueba cuáles no aparecen en el CI. Un `test` que nadie invoca no es una red: es un archivo.

**Reglas.**
- Enumera contra **lo que se ejecuta de verdad**, no contra un patrón de nombres. Si necesitas el
  patrón, **nombra explícitamente** los que quedan fuera de él, en el propio gate.
- Comprueba **las DOS puntas** —CI y atajo local— porque fallan por puntas distintas: en el caso real
  `typecheck` estaba en el CI y faltaba en el atajo; `test` faltaba en los dos.
- El comando que dice «verificar» debe correr **lo mismo que corre el CI**. Si corre menos, no
  verifica: informa. Y se confía en él exactamente igual.
- ⚠️ **El paso de RESTAURACION de una mordida es una COPIA, nunca un revert del control de versiones.**
  Si el archivo tiene trabajo sin commitear, un `git checkout <archivo>` no distingue tu sonda de tu
  trabajo: se lleva las dos. Copia antes, copia despues. Me costo rehacer una consolidacion entera.

- Al escribir un archivo NUEVO, no des por hecho que los gates lo cubren: pregúntate cuál de ellos
  **abre este archivo**. Un archivo nuevo es donde más fácil entra lo que ningún gate mira.

### 4j-bis. 🎭 El gate que AFIRMA haber pasado — el peor de los tres

Hay una escalera de maldad y conviene tenerla presente, porque cada peldaño se detecta distinto:
**no tener gate** < **tener uno que nadie invoca** (§4j) < **tener uno que dice ✅ sin mirar**.

El tercero aparece cuando a una herramienta de CLI le falta su prerrequisito y, en vez de fallar,
**pregunta**: `«npm i <paquete> — Continue?»`. En un CI sin terminal nadie contesta, el proceso
termina con **código 0** y el paso sale en verde sin haber abierto un archivo. Caso real: un día
entero de «Tipos ✅» con 26 errores dentro, cuatro corridas verdes y deploy incluido.

**Y por qué en tu máquina sí funciona.** Porque el paquete estaba en el `node_modules` de la RAÍZ del
repo, no en el del subproyecto: Node lo encuentra subiendo un nivel. El CI instala dentro del
subproyecto y allí no existe. *Una dependencia que solo existe por la disposición de carpetas de
quien programa no existe.* Es la divergencia local↔CI por la cara que nadie mira: no «rojo en CI,
verde en local», sino **verde en CI porque el gate se apagó**.

**Cómo cazarlo.**
- Exige el prerrequisito **en el LOCKFILE**, no en `node_modules`. El lockfile es lo que reinstala el
  CI; `node_modules` es exactamente lo que te engaña.
- **Estrena todo gate rompiéndolo a propósito EN EL ENTORNO DONDE VA A CORRER.** Un worktree con
  instalación limpia sobre un commit malo conocido lo responde en dos comandos, y la respuesta es un
  antes/después que se puede enseñar: *antes exit 0 sin salida; después exit 1 con los 26 errores.*
  Un gate que nunca se ha visto en ROJO en CI no está probado: está estrenado a medias.
- Desconfía de un ✅ que no dice **cuánto** miró. Exige a tus gates que impriman el recuento
  (archivos, enlaces, pruebas): un número es lo único que distingue «revisado» de «no hice nada».
- El prerrequisito también puede estar presente y ser **incompatible** (versión fuera del peer). Eso
  al menos lanza, y por eso es menos grave: el silencio es el enemigo, no el error.

- ⏱️ **El detector más barato: el RELOJ.** Compara cuánto TARDA el paso en CI. Un gate que revisa
  cientos de archivos en 4 segundos no está optimizado: no está haciendo nada. En el caso real, el
  paso «Tipos» tardó 4 s en todas sus corridas históricas y 21 s en la primera con checker de verdad
  — la confesión estaba impresa en cada corrida, en verde, y por eso nadie la leyó. La duración por
  paso suele darla la API de CI sin credenciales; compárala contra el día que sabías que funcionaba.

**Y una regla de método, que es de donde salió todo esto**: una corrida de CI en verde **no es
evidencia de que el gate mirara**. Si vas a afirmar el estado de un despliegue, ábrelo y míralo — la
deducción «mi gate falla en local, luego el CI está rojo» puede ser exactamente al revés.

### 4j-ter. Las DOS direcciones de una regla «X debe llevar Y» — y por qué siempre falta la misma

Toda regla de la forma *«cada X debe llevar su Y»* necesita **dos barridos distintos**, y casi nadie
escribe el segundo porque el primero **ya da un ✅ que se ve idéntico**.

- **Dirección A — «¿los Y resuelven?»**: recorre los Y existentes y comprueba que apunten a algo real
  (enlaces que no rompen, referencias que existen, ficheros indexados). Es fácil: hay por dónde
  empezar a recorrer, porque los objetos están ahí.
- **Dirección B — «¿todo X TIENE un Y?»**: recorre las **afirmaciones** y pregunta por su objeto. Es
  la que caza el caso grave — el que no enlaza nada—, y es la que falta, porque **lo ausente no
  aparece en ninguna lista que puedas iterar**.
- 🎯 **Señal para reconocerlo en un gate propio**: si tu bucle empieza por `for (cada Y encontrado)`,
  solo tienes A. El caso peor —cero Y— nunca entra en ese bucle y por tanto no puede fallar.
- **Al escribir B, MIDE el patrón contra tu propio corpus antes de confiar en él**, y **lee los casos
  marcados uno a uno**. Un patrón que suena razonable puede ser inservible en tu idioma: *«panel de»*
  como señal de deliberación casaba con *«el panel de gestión»* y daba ~90 % de falsos positivos.
  Cuenta también con las **NEGACIONES** (*«sin comité ni consejo externo»*), que dicen lo contrario de
  lo que buscas, y con los objetos citados **en otro formato** (un nombre suelto en vez de una ruta).
- **Y si B destapa deuda vieja, congélala en vez de falsificarla**: un baseline declarado que solo
  puede BAJAR protege de aquí en adelante; reescribir el pasado para que cuadre destruye el registro.

## 4k. 👯 GEMELOS — el mismo nombre en dos sitios, y ningún gate puede verlo

Un defecto que **no produce ningún síntoma** hasta que alguien importa el equivocado: dos símbolos
exportados con el **mismo nombre** desde módulos distintos. No hay ruta rota, ni tipo incompatible, ni
prueba que falle, ni queja del compilador — porque no hay conflicto: hay dos módulos, y cada
declaración es perfectamente legítima por separado. El único indicio es que dos cosas se llamen igual,
y eso solo se ve **mirando el conjunto**, nunca leyendo un archivo.

**Es barato de barrer y conviene hacerlo de vez en cuando**, no esperar a tropezarlo: extrae los
nombres exportados de todo el proyecto y busca los que aparezcan en más de un módulo. En un barrido
real, de 496 exportados salieron 11 colisiones: nueve inofensivas y **dos que no** — una constante de
IVA duplicada y dos funciones de etiqueta que devolvían singular y plural.

**Ordena los hallazgos por daño, que no todos pesan igual:**
1. **Mismo tipo, VALOR distinto** — lo peor. Importar el equivocado **compila** y cambia el
   comportamiento en silencio (dos topes de subida: 10 MB y 3 MB).
2. **Mismo tipo, SALIDA distinta** — texto «casi bien». «Tipo: Apartamentos» en vez de
   «Tipo: Apartamento» se lee casi correcto, así que **nadie lo reporta nunca**.
3. **Tipos distintos** — lo caza el compilador. Molesto, no peligroso.
4. **🔴 El mismo CONCEPTO enumerado dos veces, con miembros distintos** — el gemelo que no comparte
   nombre y por eso no lo busca nadie. Caso real: la lista de tipos de inmueble del dominio tenía
   doce valores; el desplegable de la portada tenía otros seis, escritos a mano. Ofrecía uno que el
   dominio **no puede guardar jamás** (así que esa opción no podía devolver un resultado nunca) y
   omitía cinco que sí existen — que otra página del mismo sitio sí dejaba elegir. Nadie lo vio
   porque **cada lista era correcta por su cuenta**: no hay error hasta que las comparas.
   *Antídoto*: (a) la prueba que compara **lo que la interfaz ENSEÑA con lo que el sistema ACEPTA**
   —copiar las etiquetas reales al test y exigir que todas resuelvan—; y (b) donde se pueda,
   **derivar** una de la otra (el enlace del menú calcula su destino a partir de su etiqueta) para
   que no puedan volver a separarse. Un puente explícito se ve fallar en su test; un puente
   implícito falla devolviendo CERO, que no se distingue de «no hay nada».

5. **🔍 Y el método: busca por CONCEPTO, no por identificador.** El gemelo que más tarda en aparecer
   es el que **se llama distinto**. Caso real: había tres tablas de etiquetas para lo mismo. Busqué
   `etiquetaTipoPlural`, encontré una copia, la consolidé y di el problema por cerrado — sin
   preguntarme si el mismo concepto tenía más nombres. La tercera se llamaba `etiquetaTipoSingular`
   y vivía en otro fichero. *Un `grep` del nombre confirma lo que ya sospechabas; lo que encuentra
   al tercero es listar los NOMBRES POSIBLES de la cosa antes de buscar* (singular/plural, label/
   etiqueta/texto/nombre, MAP/TABLA/DICT, el idioma del proyecto y el inglés).
   💡 Y cuando se pueda, deja que el **tipo** haga de gate: un `Record<Union, T>` obliga a que la
   tabla esté completa, así que el día que la unión crezca el compilador enumera las copias
   incompletas él solo. Fue exactamente lo que destapó la tercera — no la destapó una revisión.

   ⚠️ **Segunda instancia, encontrada quince minutos después de escribir esta regla**: `05` llevaba
   DOS sellos de fecha — `verificado-vivo:` (por afirmación, lo mide un gate) y `(al AAAA-MM-DD)` (del
   nodo, lo mide otro). Re-verifiqué de verdad, actualicé los primeros, y titulé el commit
   «re-sellado». El aviso siguió encendido y lo leí al día siguiente como un recordatorio NUEVO.
   *Un aviso que sobrevive a tu arreglo no es ruido: o el arreglo falló, o mide algo que no tocaste.*

**Y el subtipo más traicionero: el valor duplicado que HOY coincide.** No hay nada que arreglar y por
eso se deja — pero lo que existe es el mecanismo para romperlo: el día que ese número cambie, alguien
edita la copia que encuentra y la otra sigue con el valor viejo. **Compruébalo antes de decidir**: si
las copias coinciden, es deuda; si difieren, es un bug vivo y ya está corriendo.

**🔴 Y desconfía especialmente del comentario que promete unicidad.** El caso real llevaba escrito
*«si cambia la tarifa, cambia aquí y solo aquí»*… al lado de una de las DOS copias. Un comentario así
no solo es falso: es **activamente dañino**, porque quien lo lee cierra la búsqueda justo antes de
encontrar la otra. Si vas a escribir «el único sitio donde vive X», compruébalo primero — o no lo
escribas.

**Cómo se arregla, en orden de preferencia:**
- **Un dueño y el resto DERIVA** (importar, o `Exclude`/`Pick` sobre el tipo del dueño). Si el dueño
  cambia, los derivados se enteran o dejan de compilar.
- **Renombrar para que el nombre diga en qué se diferencian** cuando la diferencia es deliberada
  (`etiquetaTipoSingular` / `etiquetaTipoPlural`). Mejor que un comentario que avisa: un nombre que lo
  hace imposible.
- **Declararlo con su motivo** si de verdad es inofensivo, y que el motivo explique por qué importar
  el equivocado no puede hacer daño en silencio. Declarado y contado ≠ ignorado.
- Y deja el barrido como **gate con deuda congelada**: los legítimos declarados, y falla solo si
  aparece uno nuevo.

## 4l. 🪞 ESPEJOS entre lenguajes — la regla escrita dos veces en dos idiomas

El gemelo de §4k, pero peor: la misma lista escrita en **dos lenguajes distintos**. Reglas de seguridad
de la base de datos y su predicado equivalente en el código; un enum de la API y su copia en el
cliente; un esquema de validación y el tipo que lo acompaña; una lista de permisos en un YAML y la del
middleware. Ni el compilador ni un barrido de símbolos pueden ayudar: **no son el mismo idioma**, así
que nada los relaciona salvo la intención de quien los escribió.

**El indicio está escrito en el propio código, y es la palabra «espeja».** Busca los comentarios que
dicen *«espeja X»*, *«el mismo que Y»*, *«tiene que coincidir con»*. Cada uno es una promesa de
sincronía **sin nada que la sostenga**. En un barrido real había tres, y los tres coincidían — no
había bug, había el mecanismo para tenerlo.

**🔴 Y sospecha del NOMBRE que promete la verificación.** El caso que más me gustó: una prueba llamada
*«los roles espejan a las Rules»* que **no abría el archivo de reglas ni una vez** — comprobaba que las
funciones hacen lo que la propia prueba espera, una tautología con buen nombre. Es la especie del
comentario que promete unicidad (§4k): un nombre que promete algo apaga la pregunta de si alguien lo
hace. **Ante un test o una función cuyo nombre afirme una correspondencia, ábrelo y comprueba que
lee las DOS fuentes.** Si solo lee una, el nombre está mintiendo, y arreglarlo es tan valioso como
añadir la comprobación: quitar una promesa falsa devuelve la pregunta.

**Por qué el daño es de los que no avisan.** Las dos direcciones fallan calladas: si el código es más
permisivo que la frontera real, se publican cosas que el servidor luego niega (enlaces a un 404); si
es más restrictivo, hay datos válidos que nadie muestra — invisibles, sin un solo error. Y cuando lo
que diverge son **permisos**, el fallo silencioso es de seguridad.


**Y el espejo que casi nadie llama espejo: un DOCUMENTO que copia pasos de otro.** Un runbook canónico
y un resumen suyo en otra página; una guía de despliegue y su version corta en el README. La copia
siempre envejece, y **la del paso MÁS CARO es la más peligrosa**, porque suele conservarse justo con
ese argumento («esto es lo que más caro sale equivocarse»). Caso real: la copia iba por detrás y le
faltaba entero uno de los dos errores catastróficos que el original ya documentaba, y arrastraba un
recuento que el código había corregido semanas antes — un recuento cuyo descuadre, en su día, había
delatado un enlace roto. *Una copia rancia del paso más caro es peor que un puntero.* Al encontrarla:
comprueba qué tiene la copia que NO tenga el original, mueve solo eso, y deja un puntero.

**Cómo se comprueba, barato**: extrae la lista de cada lado con una expresión regular y compara los
conjuntos. Es frágil, y no importa **si falla del lado correcto**:
🔒 **si la extracción no encuentra nada, PONTE EN ROJO, nunca en verde.** Un comparador que no
encontró nada que comparar y dice ✅ es el peor de los gates que mienten, y aquí es el que vigila los
permisos. Pruébalo en **tres** direcciones, no dos: cambia el lado A, cambia el lado B, y **rompe la
extracción** — esa tercera es la que distingue un comparador de un adorno.

## 4m. 🧮 El UMBRAL cuyo denominador nadie audita — el gate en el que no hay nada roto

Las especies anteriores dejan rastro: algo no se ejecuta (§4j), algo no se abre, algo afirma sin mirar
(§4j-bis). Ésta no deja ninguno. El gate **corre**, **abre el archivo**, e imprime un número **cierto**
— y la comparación no significa nada, porque su **denominador** no puede ser lo que aparenta.

**El caso que la enseñó**: un linter reportaba un archivo como `9331/16000 · 58 %`. Su margen real eran
**124**. La cifra que todo el mundo lee como holgura estaba equivocada **54 veces**, llevaba meses así, y
estaba igual en los tres repositorios que compartían la herramienta. No había bug: el cálculo hacía
exactamente lo que decía. Fallaba una **premisa** que nadie había puesto en voz alta — *«el límite de
cada parte es su techo»*— verdad para treinta casos y mentira para tres, porque esos tres vivían además
bajo un **límite global** y **sus límites locales sumaban más que él**. No podían cumplirse a la vez.

**Por qué sobrevive tanto.** Un número correcto no invita a comprobarlo, y el porcentaje responde a una
pregunta distinta de la que uno cree hacer: `9331/16000` contesta *«¿cuánto de mi límite gasté?»*, y
quien lo lee entiende *«¿cuánto me cabe?»*. Mientras las dos preguntas den respuestas parecidas nadie
nota nada; el día que divergen, la herramienta sigue en verde.

**Cómo se caza — al revés que las demás**: no auditando el gate, sino **la aritmética de sus umbrales**.
La pregunta de una línea, y vale para cualquier sistema con límites anidados:

> **¿Pueden cumplirse TODOS los límites locales a la vez sin romper el global?**
> Si `Σ(locales) > global`, los locales son **decorativos** y el porcentaje que publican es ficción.

Dónde aparece fuera de un linter: cuotas por servicio contra la cuota de la cuenta · presupuestos por
equipo contra el del departamento · `maxConnections` por instancia contra el límite del motor de base de
datos · reintentos por capa contra el *timeout* del cliente · tamaños por adjunto contra el máximo del
mensaje. En todos, cada parte se declara «dentro de su límite» hasta el día que coinciden.

**Qué hacer, y qué NO hacer.**
1. **Publica el límite EFECTIVO donde se lee**: `global − lo que ocupan los demás`. La cifra honesta va
   en la salida, no en un comentario del archivo de configuración que nadie abre.
2. **Deja UN solo gate bloqueando: el global.** Es tentador convertir cada límite efectivo en gate, y es
   un error — **repartir la culpa entre partes no tiene respuesta objetiva**: si una parte se pasa y otra
   va sobrada, ningún criterio mecánico dice cuál recorta. Eso lo decide una persona. Y tres avisos
   diciendo lo mismo no dan el triple de seguridad: enseñan a ignorar los tres.
   ⚠️ Y la frontera de esta regla: vale para límites **derivados** del global (repartir la culpa entre
   partes no tiene respuesta objetiva). Un presupuesto **por-elemento independiente** —longitud de
   fila, tamaño por fichero, deuda congelada que solo puede bajar— **sí debe bloquear**, y su verde
   agregado responde a otra pregunta: el contenedor puede estar al 65 % y el commit bloquearse igual.
   *(cualificación por [[G:G-013]], 2026-09-02.)*
3. **No recalibres a una partición exacta sólo para que cuadre.** Si el reparto exacto deja a cada parte
   con margen cero, el gate muerde en cada cambio y acabas desactivándolo. El diagnóstico honesto no es
   *«hay que ajustar los límites»*: es *«el sistema está al 99 % y no hay sitio»*. Dilo así.

🎯 **La regla, portable**: **un porcentaje sin su denominador auditado es decoración.** Ante cualquier
`X/Y` que una herramienta imprima, la primera pregunta no es si `X` está bien calculado — es **si `Y` es
de verdad el techo**.

- **Un contador AGREGADO es una opinión disfrazada de medida.** Si tu número suma casos que piden
  respuestas distintas —«está bien», «está abreviado», «es ambiguo», «está mal»—, no informa: sólo
  sube y baja, y lo que alarma sin informar se aprende a ignorar. Medido en un caso real: de 123
  rutas que un gate agrupaba como *«aceptadas por coincidencia de nombre — pueden estar mal»*,
  **119 resolvían por sufijo único** (abreviaturas legítimas y sin ambigüedad) y sólo 4 eran
  irresolubles para un lector. La cura no es afinar el umbral: es **partir el número por clase** y
  nombrar, con su línea, sólo la clase que pide acción.
- **Un umbral se denomina en la unidad en la que el sistema AVANZA.** Si el trabajo se mide en
  commits, «hace 30 días» mide el calendario del observador, no la realidad observada: un sello de
  **7 días** puede llevar **327 commits** detrás. Usa umbral doble —lo que llegue antes— y, cuando la
  marca no tenga la resolución de esa unidad (una fecha sin commit), **redondea hacia el lado que no
  exagera**: es preferible tardar en avisar a gritar por trabajo que no ocurrió.

### 4m-bis. La cifra COMPUESTA cuya mitad no vigila nadie

Variante de la anterior, y se caza con aritmética de primaria. Una afirmación del tipo **«20 en código
/ 17 desplegadas»** compara **dos mundos**: uno lo puede contar una herramienta desde donde estás; el
otro **no**. Y ahí está la trampa — el ✅ del lado contable **hace parecer verificada la frase entera**.

**Caso real**: un gate contaba las funciones del repositorio y decía «20 == lo que afirma la
documentación» ✅. La misma línea añadía «17 desplegadas — las 2 que faltan son las programadas».
**20 − 17 = 3.** La tercera llevaba semanas escrita, probada y **sin correr**, y nadie lo vio porque
la mitad no contable envejece sola mientras la contable renueva el visto bueno a su lado.

**Lo que lo delató no fue un gate: fue que la resta no daba.**
🎯 **Una cifra compuesta que no cuadra consigo misma es la sonda más barata que existe, y es gratis.**
Cuando leas «A de B», «X de Y», «N de M activos» — haz la resta y exige que el resto esté explicado por
nombre. Si el texto dice «faltan 2» y la resta da 3, hay una tercera cosa que nadie está mirando.

**Y la causa de fondo, que conviene buscar aparte**: pregúntate **por qué** nadie desplegó / migró /
apagó lo que falta. En el caso real la respuesta era una **colisión de siglas** dentro del mismo
documento —el mismo prefijo significaba dos productos distintos a cuatro líneas de distancia—, de
modo que dos frases ciertas, leídas juntas, afirmaban algo falso que ninguna decía. Arreglar la cifra
sin arreglar la ambigüedad garantiza la reincidencia: corrige **donde nace**, no donde se nota.


**🔒 Y el subtipo más caro: el candado que vigila la CAUSA en vez del EFECTO.** No es que falte el
gate — es que existe, se escribió para exactamente este problema, y aun así no lo ve. Caso real: un
candado impedía compilar en producción con el catálogo en modo muestra, y su mensaje de error decía
literalmente *«publicarías inmuebles que NO EXISTEN, con precio y barrio»*. Vigilaba una **variable
de entorno**. Las seis secciones de la portada que servían inventario inventado **no leían esa
variable** —ni el catálogo—, así que con la variable bien puesta el candado daba **verde** y salían
veinticinco inmuebles que no existen.

🎯 *Un candado sobre la causa declarada solo protege a quien pasa por esa causa. El que quieras
proteger de verdad se comprueba sobre el EFECTO: lo que sale servido.*

**Dos preguntas que lo destapan en un minuto:**
1. **«¿Por qué camino tiene que pasar algo para que este gate lo vea?»** Si la respuesta es «por
   leer tal variable / tal módulo / tal función», entonces todo lo que produzca el mismo efecto por
   otro camino es invisible para él. Enumera esos otros caminos.
2. **«¿Puedo escribir el síntoma a mano y ver si el gate falla?»** Es la prueba negativa, y contesta
   la pregunta anterior sin discutirla. Un gate que no puedes hacer fallar a propósito no sabes qué
   cubre.

💡 Y cuando lo arregles, la tentación es **añadir un segundo candado**. Casi siempre es peor: dos
gates para un problema es uno que alguien dejará de mantener. Mejor **meter lo que se escapaba
dentro del denominador del que ya existe** — colgarlo de la misma variable, del mismo módulo, del
mismo camino— y así el gate que ya tenías empieza a cubrirlo sin que nadie tenga que acordarse.

**🧾 Y el motivo con el que declaras una deuda decide si la estás gestionando o autorizando.** Casi
todo gate serio deja declarar excepciones «con su motivo». El motivo es donde se cuela el problema.

Caso real: tres cifras de inventario falsas se servían en la portada, **declaradas** en el gate con
el motivo *«conteo de muestra; sale en el cutover»*. El sistema las conocía, las vigilaba, y las
dejaba pasar porque alguien había prometido quitarlas — en el momento de más presión del proyecto,
sobre una línea que nadie iba a estar mirando.

🎯 *El motivo debe decir **qué** retira la deuda. Si la respuesta es «alguien se acordará», la
declaración no está gestionando la deuda: la está autorizando.* Reescríbelo como un mecanismo —
cuelga la excepción de un interruptor, una variable, un tipo— y entonces el motivo es comprobable.

💡 **Y audita las declaraciones viejas al revés: quita la que creas muerta y mira si el gate falla.**
Una excepción que ya no corresponde a nada es peor que la deuda, porque da por vigilado algo que
nadie vigila. Si al quitarla el gate sigue verde, la deuda no existía — y eso no se «cierra», se
RETIRA: cerrar afirmaría que hubo algo que arreglar.

**🚧 Y no confundas BLOQUEADO con PROTEGIDO.** Encuentras algo peligroso, ves que hoy no puede
salir, y respiras. Pregunta lo siguiente antes de respirar: **¿por qué está bloqueado?** Porque el
bloqueo se levantará por *su* razón, no por la tuya.

Caso real: una página publicaba una ficha completa —galería, precio, formulario de reserva— de un
inmueble que no existe. No podía salir a producción… porque un gate legal exigía un número de
registro turístico que aún no había. Ese gate vigila el **registro**, no que el inmueble exista. El
día que llegue el número, el gate pasa y sale exactamente lo mismo.

🎯 *Un bloqueo ajeno es un plazo, no una solución.* Si lo que te protege es una condición que
alguien está trabajando activamente para levantar —una credencial pendiente, un flag de staging, un
`noindex` temporal— entonces tu problema tiene fecha de salida y no lo sabes.

⚠️ **Y el reverso, que me costó una escalada en falso**: antes de dar algo por roto, **lee la
pantalla entera**. Escalé ese hallazgo como el más grave de la sesión y resultó que la página ya
llevaba su descargo —«este alojamiento es un ejemplo»— al final del panel. *Con cinco hallazgos de
la misma clase encima, el sexto se reconoce antes de comprobarlo: la racha que te hace bueno
buscando es la misma que te hace rápido concluyendo.*

💡 Lo que sí quedaba: el descargo vivía **debajo** del formulario. *Un descargo que llega después de
la decisión no es un descargo, es una nota al pie.* Va donde se toma la decisión, no donde termina.

**🧮 Y un agregado que CUADRA no valida sus partes.** Caso real: una nota decía «10 desplegadas + 19
desplegadas». Medido: 29 desplegadas. El total era exacto — y la lista estaba mal: una que figuraba
como pendiente ya estaba hecha, y otra que sí faltaba no aparecía. **Dos errores que se compensan
dejan una suma perfecta.**

🎯 *Comprueba el dato que vas a USAR, no el que es fácil de contar.* Si vas a actuar sobre la lista
—«¿qué me falta?»— verificar la suma no verifica nada. Es el pariente del denominador: allí el gate
miraba la variable equivocada, aquí la comprobación miraba el nivel equivocado.

⚠️ **Y el caso agudo: cuando la nota va a disparar algo IRREVERSIBLE.** Estuve a un comando de un
despliegue a producción porque una nota decía que algo no estaba desplegado; ya lo estaba, desde
días antes. *La documentación es memoria, no verdad.* Antes de que una frase escrita te haga tocar
producción —desplegar, borrar, migrar, enviar— mide el estado real. El coste de mirar es un comando;
el de no mirar, un cambio que ya no puedes retirar.

### 4m-ter. 🔖 El SELLO que decide el próximo reparto — y los dos procesos que se lo pasan

Especie nueva, medida el 2026-09-02 sobre el reparto de skills gobernadas: el gate comparaba las seis
copias contra el canon, imprimía «las 43 idénticas al canon» y salía ✅ — y el reparto estaba **roto en
las 172 combinaciones repo×skill**, porque lo que decide el reparto de mañana no son las copias, es un
**sello** (`_reparto-baseline.json`) que ningún gate abría.

1. **Un recuento impreso no valida la pregunta.** «Desconfía de un ✅ que no dice cuánto miró» (§4j-bis)
   no basta: este ✅ decía cuánto miró —43 de 43— y aun así no medía nada, porque **lo contado no era
   lo que decide**. Ante cualquier verde con denominador, la pregunta siguiente es *«¿este número es el
   que gobierna el comportamiento futuro, o solo el estado de hoy?»*. Un agregado en verde suele ser la
   respuesta a otra pregunta. *(procedencia: [[G:G-013]]; enlaza §4j-bis → §4m.)*
2. **El gate que decide con un dato tiene que ABRIR ese dato.** Un sello que solo se compara consigo
   mismo no mide nada: el testigo va fuera. Si un mecanismo mantiene N copias iguales usando un
   registro de «qué repartí la última vez», ese registro es **el sujeto de la auditoría**, no un
   detalle de implementación — y su ausencia en el gate es exactamente por qué el fallo sale en verde.
   Comprobación de bolsillo: `grep` del nombre del fichero de estado dentro del gate; si da **0**, el
   gate es ciego a lo que gobierna. *(procedencia: [[G:G-001]].)*
3. **Cuando dos procesos se pasan un estado de control, pregunta quién lo escribe DESPUÉS de cada
   transición.** Mover algo son **dos efectos** —se escribió allí · se selló aquí— y el segundo sale
   bien aunque el primero falle, o al revés. Si la respuesta es «ninguno de los dos: se sella aparte»,
   el orden correcto es una regla [HONOR] que nadie recordará, y basta con que alguien mejore la fuente
   antes de sellar para que el sistema entre en un bloqueo sin salida documentada. **La guarda va sobre
   el EFECTO**: sella lo que acabas de escribir, no lo que ya coincidía. *(procedencia: [[G:G-010]]
   síntoma 3 — la guarda sobre el EFECTO, y «mover algo son DOS efectos».)*
4. **Si no puedes escribir en el sistema, CLÓNALO — la sonda que no se puede ejecutar es una opinión.**
   «Ejecutar > razonar» no tiene salida cuando el árbol vivo está prohibido, y ahí se abandona el
   método justo donde más falta hace. Patrón portable y barato: `git clone --local` a un scratch +
   hermanos falsos con sus manifests reales + las variables de entorno que localizan las rutas
   (`HOME`/`USERPROFILE`) redirigidas al scratch, y **se declara qué NO se pudo probar con el paso
   exacto que faltaría**. Así se ejercitan las dos fronteras del estado-cero de un subsistema sin
   pantalla: «la pieza nueva que aún no está en ninguna punta» y «la última que desaparece».
   *(procedencia: [[G:G-004]] regla 1 — sin el par conocido no tienes instrumento.)*

## 4n. 🗺️ El censo que mide la superficie EQUIVOCADA — medir no es lo mismo que medir lo que importa

Convertir un hallazgo en censo es la jugada correcta (deja de arreglar la instancia y pasas a barrer la
clase). Pero **un censo hereda el error de la superficie que barre**, y esa elección se hace en un
segundo, sin pensarla: barres *lo que tienes a mano*, que casi nunca es *lo que la clase habita*.

- **Barrer la carpeta ≠ barrer lo publicado.** El árbol de trabajo contiene lo `gitignored` (falsos
  positivos: encontré un informe interno «publicado» en una tienda, y estaba excluido desde hacía meses)
  y **le falta lo que genera el build** (falsos negativos, mucho peores). En estático mide
  `git ls-files`; en construido, `dist/` + el `sitemap`. En ambos casos: **lo que el mundo alcanza**.
- **Barrer un repositorio ≠ barrer la clase.** Si el defecto viene de una plantilla, un mockup o una
  costumbre compartida, la clase vive en **todos** los proyectos que la heredaron. Y ojo al orden: los
  hermanos suelen estar **en producción** mientras tu proyecto está en obra — su exposición es HOY.
- **Cuenta el ALCANCE de cada hallazgo, no solo su archivo.** Lo que vive en un componente compartido
  se multiplica por cada página que lo incluye. Busca dónde se **inyecta** (`loadComponent`, un
  parcial, un layout) antes de decir «una línea»: pueden ser sesenta y cinco páginas.
- **Publica siempre el denominador.** «Limpio» sin «de cuántos» es indistinguible de «no lo miré», y
  dentro de dos semanas —incluido para ti— ya no habrá forma de saber cuál de las dos fue.
- **Un plural que delimita un universo es un COMANDO pendiente, no un hecho.** Cuando escribas
  *«las hermanas»*, *«las páginas»*, *«los callsites»*, *«los nodos»*, *«todos los X»* — esa frase
  está afirmando el resultado de una medición que quizá no hiciste. Ejecútala ahí mismo, **aunque
  creas saber el resultado**: el caso más caro documentado de este patrón ocurrió *dentro del texto
  que lo denunciaba*, el mismo día, con el comando ya escrito en el propio turno. Saber el defecto
  no protege de él; solo protege el hábito mecánico.
- **Reporta también lo EXONERADO, con su motivo.** El candidato a peor hallazgo que resulta estar bien
  protegido es información de primera: te dice que tu intuición de riesgo apunta a la página que
  *parece* peligrosa, y que lo desprotegido está donde nadie clasificó nada como afirmación.

## 4o. 🔌 El camino que recorres está APAGADO — y por eso «no falla»

Recorrer el camino vivo no sirve de nada si el entorno donde lo recorres tiene ese camino
desactivado. Y la forma más común de desactivarlo no es un fallo: es **el valor por defecto de una
bandera**.

**Caso real.** Una isla de catálogo empieza con `if (FUENTE !== 'live') return;` y la fuente por
defecto es `demo`. En todo el entorno de desarrollo, esa isla entera **no se ejecuta**. Se
escribieron 26 pruebas unitarias del filtro nuevo, todas verdes, sobre una función que la página no
llamaba ni una vez. El ✅ era cierto y no probaba nada: su denominador excluía justo el sitio donde
vivía el problema.

**Lo traicionero es que se parece a que funciona.** No hay error en consola, no hay excepción, no
hay pantalla rota: hay una página que se comporta *como antes*, que es exactamente lo que esperarías
si tu cambio aún no estuviera hecho. Con datos de muestra en pantalla, «no cambió nada» y «no se
ejecutó» son indistinguibles a ojo.

**Qué hacer, en este orden:**
1. **Antes de creerte un verde, localiza los apagados.** `grep` por retornos tempranos en el arranque
   del módulo (`if (!X) return`, `if (FUENTE !== …) return`, `?? 'demo'`) y por las banderas que los
   gobiernan. Un `return` en la primera línea de un boot es un interruptor, no una guarda.
2. **Enciéndelo con un fixture y deja el interruptor A MANO.** Si encender el camino cuesta inventar
   un fixture cada vez, no lo hará nadie —ni tú la próxima vez—: conviértelo en un comando
   (`npm run <algo>:live` / `--off`) y escribe en su cabecera POR QUÉ existe.
3. **Verifica con el camino encendido y dilo así.** «26 pruebas en verde» y «lo ejercité con 4 datos
   y estos cinco casos dieron esto» no son la misma afirmación; solo la segunda cubre el arranque,
   el fetch, el pintado y el estado vacío.
4. **Y comprueba las dos direcciones de la bandera.** Que producción no pueda salir con el valor de
   desarrollo (aquí lo bloquea un gate del build) *y* que desarrollo pueda ponerse en el de
   producción. Una bandera que solo se puede mover en un sentido deja la mitad del código sin mirar.

## 4p. 🎚️ El FIXTURE que no puede suspender — datos que no discriminan

Recorrer el camino vivo no basta: hay que recorrerlo **con datos capaces de delatar el fallo**. Caso
real: un fixture de cuatro inmuebles para probar los filtros del buscador, y los cuatro nacieron con
`hab: 3, ban: 2, area: 120` **idénticos**. Con esos datos, un filtro de habitaciones devuelve
siempre los cuatro o siempre ninguno — **exactamente lo mismo que devolvería si no mirara el dato**.
La prueba en vivo se habría pasado en verde con el filtro roto.

🎯 **Un fixture donde todo vale lo mismo no distingue lo que funciona de lo que ni se ejecuta.** Es
el pariente del §4o (el camino apagado) pero un paso más sutil: allí no corres el código, aquí lo
corres y su salida es idéntica en los dos mundos, así que la ejecución no te enseña nada.

**Antes de fiarte de una prueba con datos de muestra, pregúntate qué la haría FALLAR** y comprueba
que ese caso está en el juego:
1. **Varianza por cada eje que filtras u ordenas.** Si dos ítems empatan en el campo, ese campo no
   está probado. Un orden por precio con todos los precios iguales pasa siempre.
2. **Un ítem al que le FALTE el dato**, si tu regla decide algo sobre los ausentes. Es el único que
   distingue «excluye lo desconocido» de «lo deja pasar», y las dos son defendibles: sin ese ítem no
   sabes cuál implementaste.
3. **Un caso que debe dar CERO**, para ver el mensaje de vacío — y que sea el mensaje correcto, que
   «no hay nada que encaje» y «no hay inventario» se arreglan de formas distintas.
4. **Un valor en la FRONTERA exacta** (el `>=` contra el `>`): pedir 4 y que exista uno de 4.

💡 Y escríbelo en el propio fixture: el comentario que dice *para qué* está cada valor es lo que
impide que el siguiente los «normalice» a todos iguales por parecerle más limpio.

## 4q. 🧅 El arreglo que solo alcanza UNA capa — «ya lo quité» contra «ya no se produce»

Cuando arregles *«esto no se debería ver»*, la pregunta no es si desapareció de donde miraste, sino
**en qué capa se PRODUCE** — y hay que revisar todas las que puedan producirlo.

Caso real: un panel servía cifras inventadas de un mockup. Se arregló *bien*: el script dejó de
escribirlas y la identidad pasó a venir de la sesión. Meses después seguían **servidas en el HTML**,
porque el arreglo vivía en el runtime y quien las escribía **también** era el build. Y seguían a un
clic de pestaña, porque el script solo repintaba una de las tres vistas de rol.

🎯 *Un arreglo en el runtime tapa lo que el runtime escribe. Lo que otra capa ya escribió sigue ahí,
y encima ahora está tapado — que es peor, porque el síntoma desapareció de la pantalla donde alguien
lo habría vuelto a ver.*

**Los dos ejes por los que se escapa un arreglo de alcance corto:**
1. **La capa** — build vs runtime · servidor vs cliente · plantilla vs datos · caché vs origen. Si
   el dato malo puede nacer en dos sitios, arreglar uno lo deja vivo en el otro.
2. **Las instancias** — la misma pantalla en otro rol, otro idioma, otra ruta, otro estado. «Lo
   arreglé en la vista del admin» no dice nada sobre las otras dos que comparten el marcado.

**Cómo comprobarlo, y es barato:** busca el valor literal en el **artefacto que se entrega** (el HTML
construido, el bundle, la respuesta de la API), no en el código fuente. El código dice lo que
*quisiste*; el artefacto dice lo que *sale*. Un `grep` de «$4.850M» sobre `dist/` contesta en un
segundo la pregunta que una revisión de diff no contesta nunca.

💡 Y cuando lo arregles, **el gate va sobre el artefacto**: una lista de valores que no pueden
aparecer en lo servido, con su prueba negativa (inyéctalo y comprueba que el gate falla). Un gate
que mira el fuente no habría visto nada de esto, porque en el fuente el arreglo del runtime *estaba*.

## 4r. 🔎 El gate que tiene razón POR DEBAJO de su mensaje

Un gate te señala un síntoma. El síntoma puede ser un falso positivo **y la queja seguir siendo
correcta**, porque lo que el gate detectó no siempre es lo que sabe nombrar.

Caso real: un chequeo avisó de que *«esta página busca ids que NO declara»* y nombró el id de un
control que vive en OTRA página. Leído al pie de la letra era un falso positivo: ese código no corre
aquí. Pero el gate lo veía porque la página **importaba el módulo entero de esa otra página** —con su
mapa, su boot y sus selectores— para usar de él una sola función. El id era el síntoma; la causa era
el **acoplamiento**. Extraer lo común apagó el gate *por la razón correcta*, y de paso la página dejó
de descargar código que no usa.

🎯 **Antes de declarar falso positivo, pregunta qué tendría que ser verdad para que el gate
acertara.** Si la respuesta describe algo que efectivamente pasa —«sí, importo ese módulo entero»—,
el gate acertó y solo se quedó corto al nombrarlo. Silenciarlo entonces es tapar un hallazgo.

**Y el reverso, igual de útil: un refactor cambia lo que los gates PUEDEN ver.** Al extraer un módulo
y exportar sus piezas, el chequeo de símbolos duplicados destapó **tres gemelos que ya existían** —
entre ellos dos funciones con el mismo nombre y **salida distinta** (`' / mes'` con espacios contra
`'/mes'` sin ellos). No los introdujo el refactor: eran privados, y lo privado no lo audita nadie.
*Exportar algo lo somete a gates que antes no lo alcanzaban; si al hacerlo salta un hallazgo viejo,
es un regalo, no un coste del cambio.*

**Y cuando SÍ es falso positivo, enséñale a ver — no le declares una excepción.** Un gate que se
equivoca te ofrece siempre la salida cómoda: silenciar esa línea, globalizar esa regla, apuntar la
excepción «con su motivo». Las tres tapan **tu** caso y dejan el falso positivo esperando al
siguiente que haga lo mismo — y si lo que hacías era el patrón recomendado del proyecto, el
siguiente eres tú otra vez.

Caso real: un chequeo daba por inalcanzable una clase que un script asigna. Medido: el nodo venía de
una plantilla renderizada por el framework, así que llevaba el atributo de acotado y la regla sí le
alcanzaba. La premisa del gate —«lo que asigna el JS nace sin ese atributo»— era cierta en general y
falsa para ese patrón. Se le enseñó el patrón; dejó de equivocarse **para todos**.

⚠️ **Y como tocaste un gate, debes la prueba negativa.** Relajar la condición y ver verde no
demuestra nada: puede que lo hayas dejado ciego. Rompe algo a propósito —una clase que de verdad no
esté en ninguna plantilla— y comprueba que **falla y lo nombra**; restaura y comprueba el verde. Sin
esas dos medidas no sabes si afinaste el gate o lo apagaste, y las dos se leen igual desde fuera.

## 4s. 🔒 Cuando el dato inventado REAPARECE: deja de buscarlo y hazlo imposible

Hay un momento en el que cazar datos falsos deja de ser lo correcto. Si llevas tres, cuatro, cinco
hallazgos de la misma clase —cifras de relleno servidas como si fueran medición— el problema ya no
es que se te escapen: es que **el sistema permite escribirlas**. Seguir barriendo es tratar el
síntoma de algo que tiene arreglo estructural.

🎯 **La pregunta que cambia el trabajo: ¿quién PUEDE escribir este número?** Si la respuesta incluye
a alguien con prisa —tú, un editor, el que rellena un panel— entonces el número volverá, y la
siguiente vez con mejor disfraz.

**Cómo se hace imposible, de más barato a más fuerte:**
1. **Que no exista el campo suelto.** Guarda un AGREGADO que solo tiene sentido como resultado
   —promedio *y* recuento, total *y* sumandos—. Un número que nace de una suma no se inventa sin
   inventar también los sumandos, y eso ya no es un descuido: es una decisión de mentir.
2. **Que el módulo no ofrezca el atajo.** Si exportas una forma de pedir el promedio sin su
   recuento, alguien la usará: la regla dura hasta el siguiente que tenga prisa. *No documentes la
   regla: haz que la API no permita romperla.*
3. **Que las reglas del almacén lo nieguen — también a los tuyos.** El agujero suele ser el staff,
   no el anónimo: un panel de administración con permiso de escritura es exactamente donde alguien
   teclea la cifra bonita. Y **ese permiso ya existía**, así que no lo verás salvo que lo busques.
4. **Que por debajo de un mínimo NO haya dato.** Un promedio de una observación no es un promedio.
   El umbral no es rigor estadístico: es lo que impide que una sola reseña amable se convierta en un
   «5,0» en la portada.

⚠️ **Y al cerrar una regla de escritura, debes el control POSITIVO.** Dos pruebas que comprueban que
se deniega no distinguen «deniega lo correcto» de «deniega todo»: las dos pasan igual si rompiste el
camino entero. Añade la que comprueba que una escritura legítima **sigue pasando**.

💡 El efecto secundario es el mejor: si el dato no puede existir sin su respaldo, la pantalla vacía
deja de ser un fallo que tapar y pasa a ser la verdad. *Y una sección que dice «todavía no hay» es
infinitamente más barata de mantener que uno que hay que recordar limpiar antes de lanzar.*

## 5. Escalar (no gastar de más — CITA a los dueños, no redefinas)
- **N0 — reflejo barato (default, ~90%)**: el checklist §2 + auto-crítica de una pasada. Lo
  trivial se queda aquí; subir "por si acaso" es gastar peor.
- **N1 — maquinaria pesada (SOLO no-trivial / caro de revertir)**: el bug toca dinero/datos/
  seguridad, cruza varios subsistemas, el síntoma no encaja, o es caro de revertir →
  `systematic-debugging` (síntoma no encaja) → `dispatching-parallel-agents` / fan-out
  adversarial (multi-subsistema) → `comite-expertos` + consejo externo para DECISIÓN con
  consecuencias. El criterio de "cuándo comité" lo manda la doctrina del proyecto, no esta skill.
- **Freno**: 2 fallos en el MISMO bug → DETENTE, busca el caso análogo en el historial antes del
  3er intento (prohibido adivinar).

## 6. Salida
Un veredicto **concreto y citable**, no un "OK" genérico:
`camino vivo recorrido: [vacío→1 OK · N→vacío OK · recarga OK]` — o `FALLA en [estado]`. Si
escalé, a qué nivel y por qué.
