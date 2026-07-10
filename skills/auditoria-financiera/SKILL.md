---
name: auditoria-financiera
description: Usar cuando haya que AUDITAR flujos de dinero de un sistema (POS/caja, pagos online, stock con valor, arqueos, saldos, reembolsos) buscando fugas, duplicados, robos enmascarables o estados imposibles — antes de un lanzamiento, tras un incidente de plata perdida, o como barrido periódico. También al DISEÑAR un flujo de dinero nuevo (usar las invariantes como checklist de diseño). Triggers — "hay pérdida de dinero", "el arqueo no cuadra", "audita la caja/pagos", "¿por dónde se puede fugar plata?", "revisa el flujo de dinero antes de lanzar". NO es para depurar un bug puntual ya reproducible (systematic-debugging) ni para contabilidad tributaria (eso es del contador).
---

# 🔍 Auditoría financiera de sistemas — método forense anti-fugas

> Nace de una auditoría REAL (2026-07-10) que encontró 4 P0 vivos en un sistema que "ya
> estaba probado": doble reintegro de stock, reversas de pasarela tragadas por el guard de
> idempotencia, doble cobro invisible y un arqueo ciego a pagos divididos. Todos tenían la
> misma raíz: cada pieza se veía bien SOLA; el dinero se fugaba en las COSTURAS.
> PORTABLE: cero rutas de un repo; adapta colecciones/tablas al stack del proyecto activo.

## 1. Las 7 invariantes del dinero (qué se audita SIEMPRE)
Toda fuga viola al menos una. Recórrelas contra el código real, no contra la intención:
1. **Conservación**: el dinero ni aparece ni desaparece — cada peso que entra/sale tiene
   exactamente UN asiento. Busca: caminos que cuentan 2× (carrera + id nuevo), caminos que
   cuentan 0× (estados excluidos del arqueo, medios descartados con `continue`).
2. **Mismo número en TODAS las vistas**: estimado de UI, ecuación/sello del servidor y
   ledger deben dar idéntico. Tres vistas = tres implementaciones = deriva garantizada si
   no hay tests de paridad. La fuga clásica vive en la vista que "nadie mira".
3. **Idempotencia REAL**: reintento/doble-tap/recarga/replay del webhook → UNA operación.
   Ojo con la idempotencia por-ámbito (id único POR turno/período): el mismo id en otro
   ámbito crea un fantasma. Y ojo al guard que traga eventos DISTINTOS del mismo id
   (una REVERSA llega con el mismo txId que el cobro — no es un replay).
4. **Deshacer netea TODO**: anular/reversar/cancelar debe restar en TODAS las vistas de la
   invariante 2, no solo en una. Y deshacer dos veces debe estar bloqueado (flag que se
   APAGA en el mismo commit de la reposición — cinturón estructural, no gate de estado).
5. **Estados muertos bien definidos**: la lista de estados que "devuelven dinero/stock"
   (anulado/cancelado/expirado/reembolsado) debe ser LA MISMA en cada módulo que la usa.
   Un estado intermedio (p.ej. "por verificar" con porción en efectivo YA cobrada) debe
   tener dueño explícito: ¿cuenta o no cuenta? Documentado y testeado.
6. **SoD (segregación de funciones)**: quien opera no aprueba lo destructivo, no reescribe
   los parámetros de su propio reporte (tasas, límites, config fiscal) y no edita el ledger.
   Ledger inmutable: corregir = asiento inverso con doble rastro, jamás editar/borrar.
7. **Anomalías que GRITAN**: un negativo imposible, un descuadre ausente o un evento sin
   dueño se muestran en rojo — nunca `Math.max(0, x)`, `|| 0` ni catch vacío que los
   convierta en "todo bien". Una herramienta de auditoría falla en rojo, no en verde.

## 2. El método (4 fases)
**Fase A — Mapa del dinero (30 min)**: dibuja cada lugar donde el dinero/stock cambia de
estado (crear venta, cobrar, anular, trasladar, cerrar, webhook, cron). Para cada uno:
¿quién escribe? ¿qué vistas leen? ¿cuál es la autoridad? Si dos "autoridades" coexisten
(p.ej. dos arqueos), eso ya es un hallazgo.

**Fase B — Auditores paralelos por subsistema (con tope)**: lanza N auditores de SOLO
LECTURA, cada uno con (a) lista CERRADA de archivos, (b) las 7 invariantes como lente,
(c) formato de salida obligatorio: `archivo:línea + escenario de fallo paso a paso (qué
acción produce qué número malo)`, (d) la regla anti-humo: "si no puedes trazar el
escenario completo en el código, NO lo reportes", (e) tope de hallazgos (≤8) y la orden
de declarar SANAS las áreas limpias. Sin exploración libre — alcance fijo (los workflows
sin tope se desbocan).

**Fase C — Verificación adversarial PROPIA**: cada P0/P1 reportado se re-verifica leyendo
el código con tus propios ojos ANTES de arreglar (los auditores alucinan rutas plausibles).
Solo se arregla lo confirmado; lo no confirmado se descarta con nota.

**Fase D — Arreglo + blindaje + prueba en vivo**: cada fix lleva (1) su test de integración
del ESCENARIO (no del paso), (2) si es UI, la prueba en vivo del camino completo incluyendo
ida-y-vuelta con recarga (ver `caza-bugs §2b`), (3) los datos históricos corruptos se
reparan con asientos inversos auditados (motivo + autor), nunca editando/borrando.

## 3. Vectores de robo enmascarable (piensa como ladrón)
El arqueo no debe solo "cuadrar": debe hacer IMPOSIBLE que un descuadre real se esconda.
- ¿Existe una venta/porción que el arqueo NO espera pero cuyo efectivo SÍ entró al cajón?
  → robar exactamente eso da "cuadra ✓". (Pagos divididos, estados intermedios, medios
  no listados: los tres casos reales.)
- ¿El conteo es a ciegas (declarar ANTES de ver el esperado)? Si el esperado se muestra
  primero, el conteo se ajusta solo.
- ¿Los vouchers/comprobantes físicos se reconcilian por cantidad Y monto?
- ¿Una anulación post-venta deja rastro de quién y por qué? ¿Las anulaciones se auditan
  por frecuencia/autor (patrón de fraude interno)?

## 4. Checklist de pasarela de pagos (online)
- El webhook valida FIRMA + re-consulta la API como verdad (no confía en el payload).
- Monto + moneda + referencia contra el pedido CONGELADO (moneda ausente = rechazo).
- Reversas (VOIDED/REFUNDED) del MISMO txId se procesan (no las trague el replay-guard)
  → frenar despacho + alertar.
- 2º cobro APPROVED con otro txId sobre lo ya pagado = alerta de doble cobro (reembolso).
- Cobro APPROVED sin pedido = alerta (no solo audit-log que nadie mira).
- Invariantes de negocio (qué NO se cobra online) viven en el SERVIDOR, no en el botón.
- El cron/reaper jamás libera una reserva sin re-consultar el pago; y un PENDING colgado
  eterno también alerta (pieza bloqueada = lucro cesante).

## 5. Salida (formato del informe)
Por hallazgo: severidad (P0 = plata/stock real en riesgo) · invariante violada (1-7) ·
`archivo:línea` · escenario paso a paso con números · fix propuesto · test que lo blinda.
Áreas sanas declaradas en una línea c/u (la ausencia de hallazgos también se reporta).
Cierre: qué NO se auditó (alcance excluido) — el silencio no es cobertura.
