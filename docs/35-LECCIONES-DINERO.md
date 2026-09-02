# 💰 35 — LECCIONES · DINERO, TRANSACCIONES E IDEMPOTENCIA (hija de `30-LECCIONES`)

> **Hija de `30-LECCIONES.md`** (shard por saturación §G.5, 2026-07-25). Detalle de las lecciones
> donde el fallo se paga en PLATA: escrituras multi-libro en una transacción, idempotencia, patas
> entre módulos (cartera↔caja↔bóveda↔tesorería), arqueo/turno y la frontera cliente↔Cloud Function.
> Los `### L-NN` stub-header viven en la MADRE `30` (el kernel los lee de allí); aquí va el detalle — salvo el de las **migradas al maestro** (L-84 lote 2 · L-85 y L-86 lote 13), que es un stub con su puntero: hoy solo L-81 conserva cuerpo aquí.
>
> **Cuándo leerme**: ANTES de tocar una CF que escriba dinero, una idempotencia por opId, el arqueo
> de caja o una "pata" en otro libro. Método → skill `auditoria-financiera`; checklist → `caza-bugs §2b`.
> Categoría en crecimiento: F-COMPRAS, F-REPORTES y apartados escribirán aquí.

### L-84: El `code` de un callable llega PREFIJADO — toda tabla por `code` falla en SILENCIO (TODO-79)
⇒ **Migrada al maestro** (F2 lote 2): [[BERS:L-84]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-85: Idempotencia con destino TEMPORAL — ancla el destino, no lo re-resuelvas
⇒ **Migrada al maestro** (F2 lote 13): [[BERS:L-85]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-86: Cuando un flujo gana un LIBRO nuevo, el camino de DESHACER lo hereda en el MISMO commit
⇒ **Migrada al maestro** (F2 lote 13): [[BERS:L-86]] · cuerpo íntegro en `/_legacy/LECCIONES-MIGRADAS-MAESTRO.md` (raíz del repo).

### L-81 [detalle, movido de 30 por GC — TODO-77]

Un sistema de sesión/turno de caja con el gate en OFF (`enforceTurno:false`) NO es "suave", es un HUECO: permite ventas HUÉRFANAS (`turnoId:null`) que no entran al arqueo del turno ni a la auditoría por-turno → plata cobrada FUERA del control de caja. Un POS profesional exige turno abierto para vender (toda venta amarrada a turno + cajero; caja cerrada = solo "abrir", ni vender ni cerrar). Doctrina: al construir un feature de caja/arqueo/auditoría, el gate DEBE quedar ON — con él OFF toda la contabilidad del turno miente y la auditoría tiene un punto ciego. Corolario: una vista por-turno debe VERIFICAR que no existan documentos fuera de turno (o marcarlos como anomalía visible), no asumir que todos pertenecen a uno. → **TODO-70 ✅ RESUELTO §173** (enforceTurno:true en prod · cierre solo-turno, Z legacy retirado · ventas ocultas con caja cerrada `sinTurnoAbierto` · panel de anomalías `esOrfana` en Auditoría) · `pos.js` `ventaBloqueadaPorCaja` · `auditoria.js` · `config/caja`
