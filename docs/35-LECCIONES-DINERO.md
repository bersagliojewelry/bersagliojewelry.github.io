# 💰 35 — LECCIONES · DINERO, TRANSACCIONES E IDEMPOTENCIA (hija de `30-LECCIONES`)

> **Hija de `30-LECCIONES.md`** (shard por saturación §G.5, 2026-07-25). Detalle de las lecciones
> donde el fallo se paga en PLATA: escrituras multi-libro en una transacción, idempotencia, patas
> entre módulos (cartera↔caja↔bóveda↔tesorería), arqueo/turno y la frontera cliente↔Cloud Function.
> Los `### L-NN` stub-header viven en la MADRE `30` (el kernel los lee de allí); aquí va el detalle.
>
> **Cuándo leerme**: ANTES de tocar una CF que escriba dinero, una idempotencia por opId, el arqueo
> de caja o una "pata" en otro libro. Método → skill `auditoria-financiera`; checklist → `caza-bugs §2b`.
> Categoría en crecimiento: F-COMPRAS, F-REPORTES y apartados escribirán aquí.

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

### L-85: Idempotencia con destino TEMPORAL — ancla el destino, no lo re-resuelvas

Una pata "en el otro libro" con destino DETERMINISTA (sale del propio doc, p.ej. la cuenta bancaria de
un traslado, V1/V18) es idempotente por-libro sin más: al replay se verifica y se crea la que falte.
Pero si el destino es **temporal** —"el turno de caja ABIERTO"— re-resolverlo en el replay mete la
plata en el turno EQUIVOCADO (otro turno ya abierto) o en uno ya SELLADO, cuyo arqueo se firmó sin
ella. Doctrina: **guarda el destino en el doc de la primera escritura** (`pataCaja.turnoId`) y
resuelve el replay contra ESE destino; si el destino ya se cerró y la pata falta, **NO lo reescribas**
(un arqueo firmado no se re-abre: sería fabricar evidencia) → reporta + ALERTA al dueño (invariante #7:
la anomalía grita, no se traga). Y lee el doc del destino DENTRO de la transacción: eso serializa
contra su cierre, y evita la carrera "abono entra mientras la caja se cierra".
Lo encontró el comité ×3 revisando el diseño de V17; los tests lo fijan
(`functions/cartera.integration.test.mjs`: "ANCLADA al turno").

### L-86: Cuando un flujo gana un LIBRO nuevo, el camino de DESHACER lo hereda en el MISMO commit

Un flujo de dinero que empieza tocando 2 libros y luego gana un 3º casi siempre extiende el camino de
IDA (la operación) y olvida el de VUELTA (anular / reversar / cancelar). Pasó dos veces seguidas aquí:
el traslado de bóveda ganó el acumulador del turno (jul-10) y hubo que arreglar la reversa; después
ganó el libro del BANCO (V1/V18) y la reversa volvió a quedarse corta — devolvía la plata a la bóveda
sin quitarla del banco, **inventando** plata en la consolidada. Doctrina: **al añadir una pata, el
mismo commit toca las N puertas de deshacer del flujo, y el test es del ESCENARIO completo
(hacer → deshacer → sumar TODOS los libros), no del paso.** Regla de detección barata: `grep` del
nombre del libro nuevo en la suite del flujo — si el camino de deshacer no aparece ni una vez, el
undo está sin cubrir (aquí `reverso` no aparecía en la suite de tesorería: 31 tests verdes y la fuga
viva).

Dos corolarios que valen más que la lección:
1. **Un vigilante que compara cada libro CONSIGO MISMO jamás ve una fuga ENTRE libros.** El cuadre
   3:30 valida `saldoActual` vs el recompute de ESE ledger; con la plata duplicada en bóveda y banco
   los dos libros quedan internamente perfectos. Un control de conservación necesita una suma
   TRANSVERSAL (la consolidada antes == después), que es justo lo que afirman los tests nuevos.
2. **Sellar una pata abre la puerta a la doble resta**: si además existe una vía manual de corregirla
   (`ajuste_inverso`), inverso + deshacer-el-origen restan dos veces. Una pata de SISTEMA se deshace
   por su ORIGEN y solo por ahí (una sola puerta, mismo principio que V12).
→ §194 · `functions/caja-core.js` (`reversoCore`/`aprobarEventoCajaCore`) · `tesoreria-core.js` (`PATA_TIPOS`)

### L-81 [detalle, movido de 30 por GC — TODO-77]

Un sistema de sesión/turno de caja con el gate en OFF (`enforceTurno:false`) NO es "suave", es un HUECO: permite ventas HUÉRFANAS (`turnoId:null`) que no entran al arqueo del turno ni a la auditoría por-turno → plata cobrada FUERA del control de caja. Un POS profesional exige turno abierto para vender (toda venta amarrada a turno + cajero; caja cerrada = solo "abrir", ni vender ni cerrar). Doctrina: al construir un feature de caja/arqueo/auditoría, el gate DEBE quedar ON — con él OFF toda la contabilidad del turno miente y la auditoría tiene un punto ciego. Corolario: una vista por-turno debe VERIFICAR que no existan documentos fuera de turno (o marcarlos como anomalía visible), no asumir que todos pertenecen a uno. → **TODO-70 ✅ RESUELTO §173** (enforceTurno:true en prod · cierre solo-turno, Z legacy retirado · ventas ocultas con caja cerrada `sinTurnoAbierto` · panel de anomalías `esOrfana` en Auditoría) · `pos.js` `ventaBloqueadaPorCaja` · `auditoria.js` · `config/caja`
