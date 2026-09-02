# 🗄️ Lecciones MIGRADAS AL CEREBRO MAESTRO — cuarentena §G.4 (cuerpo íntegro)

> Estas lecciones **no se han perdido ni se han editado**: su cuerpo íntegro está aquí y su copia
> consultable vive en el maestro (`brain-private/maestro/lecciones/migradas/BERS/<ID>.md`), donde
> se lee desde CUALQUIER proyecto. En `docs/30-LECCIONES.md` sigue su titular —que es lo que hace
> resolver cualquier `[[L-NN]]` del repo— y allí mismo —o en `35`, para `L-84`— queda su stub con el puntero a este fichero.
>
> **Para qué sirve este fichero**: es el punto de retorno. El ABORT del lote reconstruye el cuerpo
> DESDE AQUÍ, a propósito y no con `git checkout` — un checkout restaura blobs de git y no probaría
> nada del mecanismo (`brain-private/cerebro-maestro/ENSAYO-ROLLBACK-F2.md §5`).

> Lote 2 · migrado 2026-09-01 · 3 lecciones.

---

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · pagada en BERS «2026-04-05 · Fix V2: auditoría profunda touch scroll» (esa era del 99 no numera §) y reaplicada en el cart drawer («2026-04-28 · POLISH SESSION», ítem 2) · migrado 2026-09-01 lote 2

### L-01: iOS Safari Scroll Lock en Drawers
Para bloquear el scroll de fondo en iOS Safari al abrir el Mobile Menu o el Cart Drawer, `overflow: hidden` es insuficiente. Se debe usar la técnica:
```js
// Bloquear
const scrollY = window.scrollY;
document.body.style.position = 'fixed';
document.body.style.width = '100%';
document.body.style.top = `-${scrollY}px`;
document.body.classList.add('menu-open');

// Desbloquear
document.body.style.position = '';
document.body.style.width = '';
document.body.style.top = '';
document.body.classList.remove('menu-open');
window.scrollTo(0, scrollY);
```

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · pagada en BERS §181 (traslado duplicado $5.6M + auditoría anti-fugas de los 4 libros) · migrado 2026-09-01 lote 2

### L-83: Dinero + listeners = jamás decidir en automático sobre foto incompleta (traslado duplicado $5.6M)
(1) Decisión AUTOMÁTICA de dinero exige "fuentes listas" — o mejor: agregado denormalizado en UN doc (CF, misma tx = foto atómica); (2) deshacer netea TODAS las vistas del mismo peso (la reversa arreglaba la bóveda pero no el cierre del turno → +$11.2M sellado); (3) formateadores jamás recortan anomalías (`Math.max(0,x)` mudó −$5.4M en "$0"). Método → skill `auditoria-financiera`; checklist → `caza-bugs §2b`. Caso: ADR §181.

> Origen: BERS `docs/35-LECCIONES-DINERO.md` (titular en `docs/30-LECCIONES.md`) · pagada en BERS §193 (TODO-79: los rechazos de las CF llegan con su motivo real) · migrado 2026-09-01 lote 2

### L-84: El `code` de un callable llega PREFIJADO — toda tabla por `code` falla en SILENCIO (TODO-79)

El SDK de callables entrega `err.code = 'functions/failed-precondition'`, no `'failed-precondition'`.
Consecuencia real en Bersaglio: la tabla `ERROR_MESSAGES` y los `BUSINESS_ERR.includes(err.code)`
repetidos en 6 módulos del panel NUNCA acertaron → **todo rechazo de negocio de una CF se mostró como
el genérico "Ocurrió un error"** durante meses, incluidos los de DINERO (el microcopy "qué pasó + qué
pasó con la plata + qué hacer" se perdía justo donde más importa, y empuja a la usuaria a reintentar a
ciegas o a mentirle al sistema). Lo cazó el E2E de D6 (F-TESORERÍA B5), no los tests.
Doctrina: **normaliza el code en UN solo lugar** y prefiere el `message` del servidor cuando el
rechazo es de negocio Y viene de un callable — pero jamás para `internal`/`unknown` (traza técnica)
ni para el `permission-denied` de las REGLAS de Firestore (su message es "Missing or insufficient
permissions", ruido). Fix central en `js/admin/error-format.js` (`errorMessage`), cero churn de
callsites: la condición prefijada seguía dando falso, así que el arreglo va en la rama a la que
SIEMPRE se cae. Corolario portable: un helper puro atrapado dentro de un módulo con DOM/SDK es un
helper sin test → extraerlo (`*-format.js`) es parte del fix.

---

> Lote 9 · migrado 2026-09-01 · 1 lección.

---

> Origen: BERS `docs/30-LECCIONES.md` (cuerpo Y titular en la MADRE, sin hoja hija) · §155 es el único §NN que cita su cuerpo (allí se refutó «la caja no cabe en el header» con esta receta) · migrado 2026-09-01 lote 9

### L-05: Preview headless (Claude Preview MCP) no recalcula estilos dinámicos
Síntoma: `getComputedStyle` da el snapshot inicial; IntersectionObserver y **`requestAnimationFrame` NO disparan si la pestaña está `hidden`** (→ el código en rAF, p.ej. wiring, no auto-corre; `renderAll()` síncrono SÍ pinta); `preview_screenshot` hace timeout. **Receta**: verifica lo dinámico por CÓDIGO + DOM (`preview_eval`) o invoca el handler a mano (`import()`+call); **layout/fit** con `preview_resize` + `scrollWidth-clientWidth`/`getBoundingClientRect`/`getComputedStyle.display` (determinista, sin captura — así se refutó "la caja no cabe en el header", §155); NO por screenshot ni post-mutación. Lo visual real, en `npm run dev`/deploy.
