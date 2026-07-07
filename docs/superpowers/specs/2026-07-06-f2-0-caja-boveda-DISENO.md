# F2.0 — Sesión de caja + Bóveda antirrobo · DISEÑO (arquitecto · 2026-07-06 · Opus 4.8 interino)

> **Insumo del flujo fuerte** (W-11): este documento es el DISEÑO que se somete a comité ×3 + consejo
> externo ANTES de escribir la spec ejecutable y tocar código de dinero. SSoT del roadmap: plan v4 §2.0
> (`2026-07-04-plan-unico-erp-v4.md`). Todo lo verificable contra código fue verificado hoy (rutas reales).
> **Interinato Opus (spec f1-core §0)**: diseño de dinero sin Fable → se potencia con comité + consejo;
> Fable audita al volver. **Ningún código se toca hasta que Daniel dé el gate sobre este diseño.**

---

## 0. Problema de negocio (lente 1)
Hoy el POS solo tiene **cierre Z a ciegas** (`arqueo`, §B1): Kary cuenta el efectivo al final y el sistema
revela el descuadre. Falta el **ciclo empresarial de caja**: no hay apertura con fondo, no hay registro de
gastos/ingresos del día, y —crítico para joyería— **no hay control antirrobo del efectivo**. Daniel
(2026-07-04): *"súper prioridad completar el POS"* + directiva antirrobo: el cajón solo debe contener montos
chicos; el grueso vive en la caja fuerte (bóveda). Un atraco al cajón debe encontrar máximo el `limiteCajon`,
jamás el día completo.

**Valor**: control real del efectivo (menos pérdida/robo), trazabilidad contable (turnos con responsable),
y base para F2.3 (impresión/cajón físico) y F4 (conciliación).

---

## 1. Estado REAL del código (verificado 2026-07-06 — no re-descubrir)
- **`arqueo/{turnoId}`** (`firestore.rules:670`): `read isVentas · create/update/delete false` (CF-only).
  Cada doc = un cierre Z puntual: `{aperturaDesde, cierreTs, autor, esperadoPorMedio, ajustesPorMedio,
  esperadoEfectivo, declaradoEfectivo, descuadre}`. **NO existe concepto de turno abierto.**
- **`cierreCajaCore`** (`pedidos-core.js:737`): idempotente por `arqueoId`; ventana = desde el último
  `cierreTs desc`; esperado por medio (recolecta creados/confirmados/anulados/cancelados/reembolsados en la
  ventana, dedup por id); `ESTADOS_CON_DINERO` cuenta pagado+posteriores; `ajustesPorMedio` resta
  devoluciones de turnos previos. Escritor único = CF.
- **UI cierre** (`pos.js:361` `openCierre`/`handleCierre`): modal "Cerrar caja", conteo a ciegas, muestra
  esperado/contado/descuadre. `exportarContador` (CSV bruto/neto). `_arqueoId = uid()` por cierre.
- **Config owner-only**: patrón existente `config/cartera` (`firestore.rules:885` → `docId=='cartera'
  ? isOwner() : isAdmin()`) con `autoAprobacionMax`. **Cortocircuito anti-lockout**: el owner JAMÁS
  depende del doc de config (fail-open para owner).
- **Recompute idempotente de saldo** (charter §50): `recalcSaldoCliente` (`onDocumentWritten` de
  movimientos) recalcula `saldoActual` desde TODOS los movimientos no-anulados en tx — **nunca incrementa**.
  Es la ÚNICA escritura del saldo (Admin SDK). **Este es el patrón canónico para el saldo de bóveda.**
- **Roles** (`firestore.rules:24-42`): `isOwner` · `isAdmin`(owner+admin) · `isVentas`(owner+admin+catalogo).
- **`crearPedidoCore`** (`pedidos-core.js:~140`): venta POS efectivo nace `pagado`/`entregado` (ruta corta
  §167). NO conoce turnos hoy.
- **Deuda técnica detectada (L-72 residual)**: `pos.js:409` `ESTADO_LBL` = 3er mapping local de estados
  (pagado/pago_por_verificar/anulado) en el export CSV → debe usar `estadoPedido()` compartido. Se corrige
  DENTRO de F2.0 (roza el POS).

---

## 2. Decisiones de arquitectura (las 6 lentes) — con PUNTOS ABIERTOS para el comité

### D1 · Modelo de turno: colección `turnos` nueva vs extender `arqueo`
El plan v4 dice *"evoluciona arqueo — misma colección, CF-only, sin paralelo"*. Pero el ciclo de vida de un
TURNO (abierto→movimientos→cerrado) es una entidad distinta al SNAPSHOT puntual que hoy es `arqueo`.
- **Propuesta (A)**: nueva colección **`turnos/{id}`** con `estado:'abierto'|'cerrado'` + subcolección
  `turnos/{id}/movimientos`. `arqueo` legacy queda **read-only histórico** (límite de guardián §G.4: no se
  borra). "Sin paralelo" se honra porque el cierre Z suelto MUERE — el turno lo reemplaza; no hay dos
  sistemas de cierre vivos.
- **Alternativa (B)**: reusar `arqueo/{id}` + campo `estado`. Menos colecciones, pero la ventana de
  `cierreCajaCore` (que ordena por `cierreTs`) se complica con docs abiertos sin `cierreTs`, y los
  movimientos no tienen hogar natural.
- **Me inclino por A** (claridad de ciclo de vida + hogar de movimientos + histórico intacto). ⚠️ Punto
  para el comité: ¿desviarse del "misma colección" del plan está justificado? (evidencia: la ventana y los
  movimientos).

### D2 · Saldo del cajón: DERIVADO (recompute) vs materializado
El efectivo del cajón en un turno = `fondoApertura + ventas_efectivo − traslados_a_bóveda + ingresos − egresos`.
- **Propuesta**: **DERIVAR** al vuelo (patrón recompute, como `recalcSaldoCliente`) desde los eventos del
  turno (ventas efectivo + movimientos + traslados), NO materializar un campo mutable. Un turno tiene pocos
  eventos (un día) → derivar es O(pocos), barato y **imposible de desincronizar**. El POS lo recalcula tras
  cada cobro vía `onSnapshot` del turno + sus movimientos + ventas efectivo del turno.
- Lente seguridad/mantenibilidad: materializar dinero = fragilidad (el Excel murió por eso, charter §50).

### D3 · La "regla dura del cajón": UX operativa + integridad server de traslados
Plan: *"tras CADA cobro en efectivo, si el cajón supera `limiteCajon`, el sistema EXIGE el traslado a bóveda
ANTES de continuar"*.
- **Propuesta**: la venta NUNCA se bloquea (el efectivo ya entró físicamente — bloquear el registro
  perdería la venta). Tras el cobro, si `efectivoCajon > limiteCajon`, el POS **abre un modal de traslado
  obligatorio** (no se puede registrar otra venta hasta trasladar; el traslado sugerido deja el cajón en
  `fondoTrabajo`). Es **UX operativa**. La **integridad** la garantiza el server: la CF `registrarTraslado`
  valida monto/tipo/autor y escribe el ledger de bóveda (CF-only). Caso $30M directo: el modal aparece
  inmediatamente y el traslado sugerido = todo lo que excede `fondoTrabajo`.
- Lente seguridad: el candado de integridad va al server (traslados CF-only); la regla de flujo va a UX
  (el dinero físico no espera a un candado). ⚠️ Comité: ¿un empleado malicioso podría ignorar el modal? →
  el cierre a ciegas lo delata (el esperado del cajón descuenta traslados; si no trasladó, el conteo físico
  no cuadra con el esperado inflado). El antirrobo es del LADRÓN EXTERNO (atraco), no del empleado (eso lo
  cubre el descuadre + SoD). Documentar el modelo de amenaza.

### D4 · Enlace venta↔turno: ¿`crearPedido` exige turno abierto?
Plan: *"ninguna venta en efectivo sin turno abierto"*.
- **Propuesta**: `crearPedidoCore` en `canal==='pos' && medio==='efectivo'` lee el turno abierto; si **no
  hay turno abierto → rechaza** (`failed-precondition`, "abre la caja primero") y el POS ofrece abrir. Si
  hay → guarda `turnoId` en el pedido (aditivo). Transferencia/Wompi NO exigen turno (no tocan el cajón).
  ⚠️ Esto TOCA `crearPedido` (dinero) → TDD estricto + no romper los 24 tests de integración. Cambio
  mínimo y aditivo (una lectura + un campo). El comité valida el riesgo.
- Alternativa: no tocar crearPedido; el POS (client-side) exige turno antes de habilitar "Registrar". Más
  débil (client-side se salta) pero cero riesgo backend. **Me inclino por la server-side** (integridad),
  con el POS reforzando la UX.

### D5 · Bóveda: singleton + ledger recompute
- **`boveda/{'main'}`**: `{saldo, updatedAt}` — `saldo` recalculado por CF `recalcBoveda`
  (`onDocumentWritten` de `bovedaMovimientos`) desde el ledger no-anulado, NUNCA incrementado (patrón
  `recalcSaldoCliente`). Read isVentas (o isAdmin — ver D7 discreción).
- **`bovedaMovimientos/{id}`** (ledger CF-only): `{tipo, monto, turnoId?, autor, ts, nota, anulado?}` con
  `tipo ∈ {cajon_a_boveda, boveda_a_banco, boveda_a_cajon, conteo_fisico}`. `conteo_fisico` = evento de
  verificación (al consignar/semanal) que registra el conteo real (no altera saldo; registra diferencia).
- Signos: `cajon_a_boveda` +bóveda; `boveda_a_banco` −bóveda; `boveda_a_cajon` −bóveda (+fondo cajón).

### D6 · Config owner-only `config/caja`
- `config/caja`: `{fondoTrabajo, limiteCajon}` — regla `docId=='caja'||'cartera' ? isOwner() : isAdmin()`.
  Cortocircuito anti-lockout: el owner nunca depende del doc (default si falta: `limiteCajon=∞` → sin
  alarma hasta que el owner lo configure; NUNCA bloquea por config ausente).

### D7 · Discreción (antirrobo) — visibilidad de saldos
Plan: *"los saldos de bóveda NUNCA en pantallas a la vista del público"*.
- **Propuesta**: el saldo de bóveda y los traslados = vista **admin/owner** (no en la pantalla de venta
  del POS que un cliente podría ver por encima del hombro). El POS solo muestra el modal de traslado cuando
  toca (monto puntual), no el saldo acumulado. ⚠️ Comité: ¿`boveda` read isAdmin o isVentas? Kary es
  `owner`/`admin` (opera todo, `[[project_crm_kary_sole_operator]]`); las vendedoras no tienen usuario. →
  read isAdmin es suficiente y más discreto.

---

## 3. Modelo de datos propuesto (contratos ADITIVOS — regla plan v4 §219)
```
turnos/{turnoId}                      # CF-only (write false); read isVentas
  estado: 'abierto' | 'cerrado'
  fondoApertura: entero               # base declarada al abrir
  aperturaPor, aperturaTs             # autor + serverTimestamp
  cierrePor?, cierreTs?               # al cerrar
  conteoPorMedio?: {efectivo,...}     # conteo a ciegas real (al cerrar)
  esperadoPorMedio?, esperadoEfectivo?, descuadre?, observaciones?
turnos/{turnoId}/movimientos/{movId}  # ingresos/egresos manuales del turno
  tipo: 'ingreso' | 'egreso'
  concepto: <lista cerrada>           # p.ej. pago_domiciliario, compra_empaques, otro
  monto: entero>0, nota?, comprobante?
  autor, ts (serverTimestamp), anulado?, anuladoPor?, anuladoEn?

boveda/main                           # singleton; saldo recompute CF-only
  saldo: entero, updatedAt
bovedaMovimientos/{id}                # ledger append-only CF-only
  tipo: 'cajon_a_boveda'|'boveda_a_banco'|'boveda_a_cajon'|'conteo_fisico'
  monto: entero, turnoId?, autor, ts, nota?, anulado?

config/caja                           # owner-only (patrón config/cartera)
  fondoTrabajo: entero, limiteCajon: entero

pedidos/{id}                          # ADITIVO
  turnoId?: string                    # solo POS efectivo; enlaza la venta al turno
```

## 4. CFs nuevas (callables, CF-only, staff) — contratos
- `abrirTurno({fondoApertura})` → crea `turnos` estado abierto (rechaza si ya hay uno abierto).
- `movimientoCaja({turnoId, tipo, concepto, monto, nota?})` → append en `turnos/{id}/movimientos`.
- `anularMovimientoCaja({turnoId, movId, motivo})` → marca anulado (owner-only, la goma).
- `registrarTraslado({tipo, monto, turnoId?, nota?})` → append `bovedaMovimientos`; `recalcBoveda` recompute.
- `cerrarTurno({turnoId, conteoPorMedio})` → SUCEDE a `cierreCaja`: esperado en ventana [aperturaTs,now],
  esperado efectivo = fondo + ventas efectivo + ingresos − egresos − trasladosCajónBóveda; descuadre; sella.
- **`crearPedido`** (MODIFICADO, aditivo): POS efectivo exige turno abierto + guarda `turnoId`.
- **`recalcBoveda`** (trigger `onDocumentWritten bovedaMovimientos`): recompute del saldo (patrón §50).

## 5. Impact Analysis Previo (IAP §3.4)
- **(A) A modificar**: `functions/pedidos-core.js` (turno/bóveda cores + crearPedido enlaza turno) ·
  `functions/pedidos.js` (wrappers callables + trigger recalcBoveda) · `firestore.rules` (turnos/boveda/
  bovedaMovimientos/config caja) · `js/admin/pos.js` (apertura/movimientos/alerta límite/cierre enlazado +
  fix ESTADO_LBL L-72) · `admin-pos.html` (modales) · `css/admin.css` · nueva página o sección "Bóveda"
  (admin) · `js/pedidos-service.js` (transportes) · SW/APP bump.
- **(B) INTACTOS (verificado)**: `wompi-core.js` · `confirmarPagoWompiCore`/webhook · `liberarReserva*`
  (reaper) · snapshot inmutable (`total`/`desglose`) · `crm-service`/cartera · reglas `clientes|movimientos`
  · `avanzarPedido` (F1-CORE, recién cerrado). El `arqueo` legacy queda read-only (no se toca ni borra).
- **(C) Código muerto**: ninguno nuevo; `cierreCajaCore` se conserva hasta que `cerrarTurno` lo suceda
  sin ventana rota (el plan lo exige) → luego se marca legacy.
- **(D) Refactor scope**: extraer la lógica de "esperado por medio en ventana" de `cierreCajaCore` para
  reusarla en `cerrarTurno` (DRY — no duplicar el cálculo de dinero).
- **(E) Riesgos + rollback + tests**: TOCAR `crearPedido` (dinero) = riesgo alto → TDD, 24 tests de
  integración verdes, casos nuevos (turno obligatorio, traslado, cierre enlazado, bóveda recompute).
  Rollback: feature detrás de la existencia de `config/caja`/turno abierto (si no hay turno, ¿se degrada al
  cierre Z viejo o se exige abrir? → decisión de migración, ver §6). Deploy manual (L-22).

## 6. Puntos ABIERTOS que decide el comité + consejo (no improvisar)
1. **D1** — ¿`turnos` nueva o extender `arqueo`? (me inclino por `turnos` nueva).
2. **D4** — ¿`crearPedido` server-side exige turno (toca dinero) o solo el POS client-side? (me inclino server).
3. **Migración sin ventana rota**: al desplegar, ¿el 1er día sin turno abierto EXIGE abrir (y el cierre Z
   viejo muere de una) o hay periodo de gracia? Riesgo operativo para Kary.
4. **Conceptos de movimientos** (lista cerrada): ¿cuáles? (pago_domiciliario, compra_empaques, préstamo,
   retiro_socio, otro…) — insumo de Kary.
5. **`conteo_fisico` de bóveda**: ¿obligatorio al consignar, o verificación opcional? ¿alerta si difiere?
6. **Alerta FCM a Daniel** en traslados/ventas efectivo sobre umbral: ¿en F2.0 o difería? (reusa infra A.6).

## 7. Plan de fases (tras el gate de diseño)
1. Backend TDD: config/caja + turnos (abrir/movimiento/cerrar) + bóveda (traslado/recompute) + crearPedido
   enlaza turno. Reglas. Suites verdes.
2. UI POS: apertura, movimientos, alerta de límite + modal traslado, cierre enlazado. Vista Bóveda (admin).
3. Deploy manual + SW bump + gate en prod (Chrome) + ADR. Fix L-72 (ESTADO_LBL) incluido.

---

## 8. VEREDICTO DEL COMITÉ ×3 + DISEÑO v2 (correcciones estructurales) — 2026-07-06
> Comité acotado (5 expertos: ledger · seguridad/amenazas · contador · SRE · UX) + peer review + presidente.
> CRUDO → bóveda `2026-07-06-comite-f2-caja-boveda-CRUDO.json`. **Veredicto: el armazón (D1 turnos, D5
> singleton+ledger, D4 server-side, D7 layout) es SÓLIDO, pero el comité destapó 9 defectos ESTRUCTURALES
> de dinero + 13 riesgos. NO se escribe la spec ejecutable hasta integrar esto.** Cada corrección tiene su
> origen (experto/severidad). Esta v2 es la base de la spec.

### 8.1 Los 9 invariantes DUROS (bloqueantes del gate — sin esto no hay spec)
1. **SEMILLA DE BÓVEDA firmada por Daniel** (riesgo #1). El comité asumió "Kary YA tiene millones físicos" →
   **REFUTADO por Daniel (gate §8.6.1): la bóveda arranca en $0**. El defecto se resuelve trivial y limpio: el
   ledger nace vacío ($0, certificado por Daniel), NO hay dinero histórico que sembrar. Se conserva el
   **asiento fundacional** `tipo:'saldo_inicial', monto:0` (owner-only) como PRIMER movimiento explícito (deja
   traza de que el arranque en cero fue una decisión firmada, no un olvido). El `fondoApertura` del primerísimo
   turno = **$200.000** (la "base"; no hay cierre previo del cual heredar). Si el futuro exige sembrar un saldo
   real, el mismo asiento `saldo_inicial` lo soporta con `monto>0`.
2. **IDEMPOTENCIA por opId** en las 3 CF de escritura del ledger (`registrarTraslado`, `movimientoCaja`,
   `cerrarTurno`) + `crearPedido` (ledger, severidad alta). Sin ella: doble-tap del modal / retry por
   timeout / re-entrega de plataforma → DOS movimientos → recompute infla el saldo / "vaciado dos veces".
   → El cliente genera un `opId` UNA vez y la CF hace **create-if-not-exists** (opId = docId; si existe,
   no-op idempotente que devuelve el mismo resultado).
3. **RECOMPUTE SÍNCRONO en la misma `runTransaction`** para TODA decisión de dinero (riesgo #2/#3, alta).
   `boveda/main` (materializado por el trigger `recalcBoveda`) es **vista de conveniencia SIN autoridad** —
   NUNCA fuente de una precondición. Todo gate (rechazar venta por límite, cerrar turno, validar traslado)
   RECOMPUTA el saldo desde el ledger dentro de su propia tx. El trigger sirve para MOSTRAR, no para decidir.
4. **PUNTERO SINGLETON del turno abierto** `caja/estado {turnoAbiertoId|null}` — NO query `where
   estado==abierto` (TOCTOU sin garante; dos aperturas concurrentes dejan 2 turnos + índice no listado).
   `abrirTurno` = `runTransaction` sobre `caja/estado`: lee puntero; si `!=null` aborta; si `null` crea
   turno + set puntero atómico. Invariante "un solo turno abierto" transaccional real, O(1), sin índice.
5. **ATOMICIDAD `crearPedido`↔turno** (riesgo doble-gasto, alta). `crearPedidoCore` (POS efectivo) lee el
   puntero + valida `abierto` + escribe el pedido con `turnoId` en UNA `runTransaction`; `cerrarTurno`
   flipea `estado→cerrado` en su tx (**el cierre gana**; la venta tardía re-lee 'cerrado' y falla limpio).
   **TEST DE CARRERA obligatorio** ("cerrarTurno vs crearPedido concurrentes → exactamente uno gana, sin
   pedido huérfano") — sin ese test D4 NO pasa el gate.
6. **PERTENENCIA POR `turnoId`, NO por ventana temporal** (contradicción D2/§4, alta). El esperado del
   cierre recomputa sobre `{pedidos where turnoId==id AND estado in ESTADOS_CON_DINERO} + movimientos +
   traslados`, NUNCA sobre el rango `[aperturaTs, now]` (diverge bajo skew / confirmación Wompi tardía /
   reembolso). La ventana temporal solo como validación cruzada, jamás como fuente del cálculo.
7. **ECUACIÓN DE CIERRE COMPLETA** (riesgo #6, contradicción interna): `esperado_cajon = fondoApertura +
   ventas_efectivo + ingresos − egresos + boveda_a_cajon − cajon_a_boveda`. El diseño v1 omitía
   `+boveda_a_cajon` → CADA cierre con una reposición de cambio quedaba descuadrado por construcción.
   Separar además `efectivo_a_retirar = esperado − fondoProximoDia`; el descuadre SIEMPRE sobre `esperado`.
8. **`conteo_fisico` OBLIGATORIO con ajuste firmado + consecuencia** (§6.5 reabierto, alta). "Opcional /
   registra pero se ignora" vacía TODO el antirrobo interno. → Obligatorio en cada consignación
   (`boveda_a_banco`) y semanal; si `|conteo − saldo_derivado| > umbral` → **alerta FCM inmediata a Daniel
   + bloqueo de nuevos traslados** hasta reconciliar con un movimiento de `ajuste_faltante/ajuste_sobrante`
   (owner-only, con motivo) que SÍ entra al recompute. Invariante: `saldo_recomputado == último_conteo`.
9. **FLAG `enforceTurno`** en `config/caja` (§6.3 reabierto, alta — de pregunta a mecanismo). Default
   `false` en el 1er deploy: `crearPedido` con `false` = comportamiento viejo (no exige turno); `true` =
   exige. Deploy en frío → venta de prueba → Daniel activa el flag. **Rollback = flip, sin re-deploy**
   (kill-switch; hoy el deploy modificado de crearPedido rompería a Kary a mitad de venta sin escape).

### 8.2 Modelo de amenaza — HONESTIDAD (el comité exigió declararlo)
**F2.0 mitiga al LADRÓN EXTERNO** (un atraco al cajón encuentra máximo `limiteCajon`, jamás el día completo).
**NO mitiga al operador infiel**: Kary es owner y registra/traslada/anula/concilia/cuenta/aprueba — no hay
Segregation of Duties interna posible. Un traslado FALSO (declara `cajon_a_boveda` de $X, mete $X−Y) o la
anulación de su propio traslado tras sacar el efectivo re-cuadran el libro con el faltante dentro, y el
descuadre a ciegas NO lo delata (el esperado se deriva de los mismos traslados que el operador controla).
**El único control compensatorio real = SoD HACIA AFUERA**: Daniel (no Kary) hace el conteo físico de
bóveda, fija `limiteCajon`, y recibe **alertas FCM inmutables** de: toda anulación de movimiento de dinero
físico · todo egreso de caja · descuadre sobre umbral · conteo que difiere · límite sin configurar N días ·
saldo negativo. **Alerta FCM = NO diferible** (§6.6 reabierto): sin ella F2.0 es "contabilidad prolija sin
vigilancia". El modelo de coacción/duress queda FUERA de alcance (fase de seguridad física posterior),
salvo la afirmación barata: **la app REGISTRA, nunca ABRE la caja fuerte física**.

### 8.3 Riesgos nuevos incorporados al modelo de datos v2
- **recalcBoveda O(n) sin cota** (ledger histórico permanente, miles de docs a 2-3 años) → **checkpoint
  mensual** `boveda/checkpoints/{mes}` (saldo sellado, anclado en conteo_fisico); recompute solo desde el
  último checkpoint + movimientos posteriores. `recalcBoveda` no-op si `saldo_nuevo == actual` (evita
  re-trigger). `bovedaMovimientos` append-only ESTRICTO (regla prohíbe delete; anulación por campo).
- **fondoApertura NO libre** (vector: inflarlo para absorber un faltante) → server sugiere/fuerza
  `= fondoTrabajo` o `= efectivo del cierre anterior`; si difiere, motivo + alerta.
- **Turno olvidado multi-día** → aviso proactivo al entrar al POS + política de turno vencido (cierre
  forzado owner-revisable); si no, un faltante del día 1 se diluye en el día 2 (arqueo inauditable).
- **Bóveda↔banco sin conciliación** → `boveda_a_banco` con estado `en_transito→confirmado` + nº de
  consignación, confirmado por owner.
- **Índice compuesto silencioso** (query `turnoId + medio + estado`) → declararlo en `firestore.indexes.json`
  ANTES del deploy (si no, el query revienta en runtime con "needs index").
- **Guard duro de montos** en CADA CF del ledger: rechazar no-entero / negativo / overflow (invariante
  server, no anotación de schema) + tolerancia de redondeo COP.
- **Reembolso/anulación sobre turno SELLADO** (frontera estado-cero): un turno cerrado es inmutable → el
  ajuste cae en el turno ACTUAL como `ajuste_inter_turno` (cerrarTurno debe modelarlo; hoy solo el path
  legacy lo maneja vía `ajustesPorMedio`).
- **Sesión owner abierta en mostrador** (riesgo #10): fuera de alcance duro de F2.0, pero anotado — timeout/
  re-auth para operaciones de dinero = candidato de fase de hardening.
- **`config/caja` nace con antirrobo APAGADO** (`limiteCajon=∞` default + lo configura Kary) → alerta a
  Daniel "el antirrobo lleva N días desactivado"; `limiteCajon`/`fondoTrabajo` owner-EXCLUSIVOS (reforzar).

### 8.4 Modelo de datos v2 (deltas sobre §3)
```
caja/estado                   # NUEVO singleton — puntero del turno abierto (invariante transaccional)
  turnoAbiertoId: string|null
config/caja                   # owner-only: enforceTurno:bool(false) · fondoTrabajo:200000 · limiteCajon:4000000
                              #   · alertas:{destinatarios:[uid...], Daniel SIEMPRE en anulaciones} · conteoPor:[uid...]
bovedaMovimientos/{opId}      # opId = docId (idempotencia). tipos += saldo_inicial · ajuste_faltante ·
                              #   ajuste_sobrante · (boveda_a_banco gana estado:en_transito|confirmado + nroConsignacion)
boveda/checkpoints/{YYYY-MM}  # NUEVO — saldo sellado mensual anclado en conteo_fisico (cota del recompute)
turnos/{turnoId}/movimientos/{opId}   # opId idempotente; egreso: comprobante OBLIG. sobre umbral; 'otro' nota OBLIG.
turnos/{turnoId}              # + ajusteInterTurno? (reembolsos de turnos sellados que caen aquí)
```

### 8.5 Conceptos de movimientos (§6.4 — default sensato, NO bloquea por Kary)
Arrancar con: `pago_domiciliario · compra_empaques · adelanto_vendedora · gasto_menor · retiro_socio · otro`.
`otro` exige nota obligatoria; `otro` recurrente = señal para promover un concepto. **Alerta FCM a Daniel en
TODO egreso** (evento de mayor riesgo de fraude interno, hoy el menos controlado).

### 8.6 GATE de Daniel — RESPONDIDO (2026-07-06)
1. **Semilla de bóveda = $0** (Daniel: *"empezará desde cero con una base de 200 mil"*). ⚑ **Corrige la
   premisa del comité** (que asumió millones históricos, ver §8.1.1): NO hay dinero acumulado que sembrar → la
   bóveda nace legítimamente en $0, auditable, sin asiento de millones. El **`fondoApertura` del primer turno =
   $200.000** (la "base"). `saldo_inicial` de bóveda = 0 certificado por Daniel (el ledger arranca vacío).
2. **`limiteCajon` = $4.000.000** · **`fondoTrabajo` = $200.000** (Daniel). Valores iniciales de `config/caja`,
   owner-only, editables después. → El default `limiteCajon=∞` de §8.3 se reemplaza por estos valores concretos.
3. **Conteo/alertas = Daniel (default) PERO configurable para asignar TAMBIÉN al usuario de Kary** (Daniel:
   *"ok listo pero debe quedar la posibilidad de colocar estas funciones al usuario de Kary"*). → **destinatario
   de alertas FCM y operador del conteo físico = CONFIGURABLES** (`config/caja`, owner-only). Default = Daniel.
   ⚠️ **TRADE-OFF (§8.2, Daniel debe conocerlo)**: asignar el conteo/alertas a Kary la vuelve auto-vigilante →
   el antirrobo INTERNO se degrada a auto-reporte. **Mitigación DURA de diseño**: las alertas de **anulación de
   dinero físico** son INMUTABLES y SIEMPRE incluyen a Daniel — la config solo AÑADE destinatarios, JAMÁS
   remueve a Daniel de las alertas críticas (Kary no puede quitarse su propia vigilancia). Daniel fija la config.
4. **Conceptos de movimientos**: se arranca con los 6 default (§8.5); ajustables en la spec o en vivo.
5. **Consejo externo (Gemini): SÍ** (Daniel) → prompt `-PROMPT-CONSEJO-EXTERNO.md` actualizado con la
   restricción nueva (configurabilidad Kary) para su pregunta #1. Se espera su respuesta ANTES de codear.

### 8.7 Preguntas para el CONSEJO EXTERNO (Gemini) — las 4 del comité
Prompt autocontenido preparado aparte (R1 anti-anclaje: problema crudo + opciones). Ejes: (1) control
compensatorio para operadora única sin SoD; (2) recompute síncrono vs checkpoint+materializado en el
hot-path; (3) checkpoint mensual sobre Firestore zero-budget — ¿introduce su propio hueco?; (4) migración
T0+flag vs periodo de gracia — ¿venta en vuelo cruzando el corte?

---

## 9. CONSEJO EXTERNO (Gemini) INTEGRADO — DISEÑO v3 (final antes de la spec) · 2026-07-06
> Respuesta de Gemini + verificación de Claude → CRUDO en bóveda
> `2026-07-06-consejo-gemini-f2-caja-boveda-RESPUESTA.md`. Gemini aportó 5 cosas que el comité NO tenía;
> Claude las adopta con matices (no subordinación, §3.3). **Esto cierra el diseño; falta solo 2 decisiones de
> negocio de Daniel (§9.6) y confirmar el modelo de owner (§9.1) → luego spec ejecutable con spec-kit.**

### 9.1 Dual-Approval para eventos destructivos — ADOPTADO (Kary aprueba; §9.6.3 reencuadrado)
Los eventos DESTRUCTIVOS de caja — `ajuste_faltante/ajuste_sobrante` de bóveda y el **reverso** de un traslado
(§9.3) — nacen `pendiente_aprobacion` y **requieren `isOwner()` (Kary) para entrar al recompute**. Reusa el
patrón SoD del CRM (movimientos sobre `autoAprobacionMax` → aprobación owner, `rules:100-104`;
`[[feedback_claude_experto_verifica]]` "operadora registra / dueño aprueba"). Ahora el aprobador es **Kary
(owner, presente en el negocio)** — no Daniel — así que la fricción es mínima. **MATIZ a Gemini** (no todo
evento): los egresos rutinarios y los traslados normales cajón→bóveda NO piden aprobación (sería fricción
diaria) → van con **alerta al owner**. Solo lo destructivo/correctivo pide la firma de Kary. La solicita el rol
`caja`, la aprueba `owner` (panel de aprobaciones, §7 fase 2).

### 9.2 Cota de turno (límite Firestore 500 lecturas/tx) — hace seguro el invariante #3
El recompute síncrono es correcto PERO un turno con >400 docs (turno olvidado en fin de semana alto) haría
explotar `cerrarTurno`/`registrarTraslado` con "Transaction too large". **Fix**: `caja/estado` lleva un
contador `docsDelTurno`; al acercarse a ~350-400, el POS FUERZA cerrar el turno (y abrir otro) antes de seguir
vendiendo; + **auto-cierre por caducidad 24h** (turno olvidado). Así el recompute síncrono es SIEMPRE O(<400).

### 9.3 Inmutabilidad ESTRICTA de bóveda (reverso, no `anulado`) — corrige §8.3 y el checkpoint
El campo `anulado:true` + checkpoint mensual = hueco FATAL (anular en el pasado un movimiento ya sellado en un
checkpoint no afecta el presente → dinero alterado invisible). **Fix**: `bovedaMovimientos` es INMUTABLE
ESTRICTO (regla prohíbe update/delete). Anular = **NUEVO** movimiento `tipo:'reverso', reversaA:<opId>,
monto:-X`, ts ACTUAL (entra en el checkpoint activo). Patrón contable estándar (reversing entries) + refuerza
antirrobo (el reverso deja traza permanente, no se puede "restaurar config y ocultar"). El reverso de un
traslado es evento destructivo → Dual-Approval (§9.1).

### 9.4 Runbook de activación `enforceTurno` (flanqueado) — cierra §6.3
Para que ninguna venta caiga en el hueco T0: **(1) Kary hace el ÚLTIMO cierre Z viejo** (limpia la casa) →
**(2) Daniel activa `enforceTurno`** → **(3) Kary abre el 1er turno**. Todo pedido `ts<T0` quedó en el cierre Z
viejo; `ts>=T0` exige turnoId. Cero dinero huérfano. Documentar como runbook operativo en la spec.

### 9.5 🚨 turnoId en TODA venta POS (corrige el defecto masivo D4+#6)
**El defecto más valioso que cazó Gemini (el comité no lo vio)**: el invariante #6 (pertenencia por turnoId) +
D4 (transferencia/Wompi no guardan turnoId) haría que el cierre de turno reporte **$0 en medios digitales** —
Kary pierde su reporte diario de tarjetas/transferencias (el viejo `cierreCajaCore` desglosa TODOS los medios).
**Fix (opción 1 de Gemini, acotada por Claude a POS)**: `crearPedido` en **canal POS** guarda el `turnoId`
activo para TODOS los medios (efectivo, transferencia, wompi, addi), no solo efectivo → `cerrarTurno` desglosa
`esperadoPorMedio` completo por una sola query `where turnoId==id`. **MATIZ**: las ventas **WEB** (canal web,
el cliente paga solo) NO tienen turno → no llevan turnoId → reporte de ingresos digitales aparte (módulo
Pedidos + export contador ya lo cubren). D4 sigue válido en su esencia (transferencia/wompi no son candado del
cajón), pero SÍ heredan el turnoId si la venta es de mostrador. **DECISIÓN DE NEGOCIO → §9.6.2**.

### 9.6 Decisiones de negocio de Daniel — RESPONDIDAS + REENCUADRADAS (2026-07-06)
> ⚑ **Reencuadre fundamental (Daniel 2026-07-06)**: *"Kary no es mi socia, yo no soy dueño de Bersaglio, solo
> soy el desarrollador… una vez me pague le entregaré el software, luego ella podrá crear usuarios y dar roles.
> En caja no se entregará el usuario de Kary sino un usuario de caja con roles de caja."* → **La respuesta
> previa "ambos owner" queda ANULADA.** Coincide con `[[user_daniel_romero]]` (Daniel = dueño del SISTEMA;
> empresa Bersaglio = Kary Mendoza). Modelo REAL de producción:
1. **`owner` = Kary** (dueña del negocio y del sistema). **`caja` = rol NUEVO** (la cajera/vendedora del
   mostrador). **Daniel = desarrollador** (construye y entrega; NO rol operativo). Kary reparte roles al recibir.
2. **Arqueo del turno = MOSTRADOR SOLO** (Daniel: *"aparte"*). El cierre concilia solo el mostrador (efectivo
   del cajón + medios que la cajera cobró ahí, por `turnoId`). Las ventas WEB → reporte digital aparte. ✅ §9.5.
3. **Dual-Approval SÍ (Kary aprueba)** (Daniel: *"Kary (dueña) aprueba"* — la respuesta previa "solo alerta"
   fue bajo premisa falsa de que Daniel era el aprobador). Ahora quien aprueba es Kary (`owner`), presente en el
   negocio → **el Dual-Approval de Gemini REVIVE** (§9.1). Cero fricción de dueño-ausente.

### 9.7 ✅ SoD RESTAURADA (la consecuencia preocupante se DISUELVE)
Con dos roles separados (cajera `caja` opera / dueña `owner` supervisa+aprueba), el **antirrobo interno SÍ
funciona, natural y sin fricción**: es la Segregation of Duties que el comité y Gemini pedían, pero DENTRO del
sistema. La cajera maneja el cajón (máx `limiteCajon`); la dueña (Kary) ve la bóveda, fija límites, hace el
conteo físico, consigna al banco, aprueba ajustes y recibe alertas. **F2.0 protege contra el ladrón EXTERNO
(límite del cajón) Y contra el mal manejo INTERNO (SoD cajera↔dueña)**. La preocupación de §9.7-previa (ambos
owner sin control) queda anulada por el reencuadre §9.6.

### 9.8 Mitigación INCORRUPTIBLE (complementa el Dual-Approval, no lo reemplaza)
Sobre el Dual-Approval (§9.1) se conserva, como defensa en profundidad y protección MUTUA (limpia a la cajera
si no fue ella):
1. **Ledger de dinero INCORRUPTIBLE**: `bovedaMovimientos` y `turnos/*/movimientos` = CF-only + append-only
   ESTRICTO — la regla Firestore prohíbe `update`/`delete` **incluso al owner** (§9.3). Corregir = reverso con
   doble rastro. Nada de dinero se puede borrar u ocultar.
2. **Alerta al owner (Kary) SIEMPRE**: las alertas de eventos delicados incluyen SIEMPRE al `owner` — fijo en
   el código de la CF. `config/caja` solo AÑADE destinatarios (p.ej. el celular de Daniel durante el soporte),
   nunca remueve al owner.
3. **Historial auditable a demanda** por el owner (append-only, inocultable).
> Diseño CERRADO (comité ×3 + Gemini + decisiones de Daniel + modelo de roles) → **spec ejecutable**.

### 9.9 Modelo de roles DEFINITIVO de caja (base de la spec)
Nuevo rol **`caja`** en el árbol de roles (`firestore.rules`, junto a owner/admin/editor/catalogo). Helper
`isCaja()` = `getUserRole() in ['owner','admin','caja']` para OPERAR el POS; el resto sigue owner-only.
| Acción | `caja` (cajera) | `owner` (Kary) |
|---|---|---|
| Abrir turno · registrar venta POS · movimientos (ingreso/egreso) · cerrar turno | ✅ | ✅ |
| Traslado cajón→bóveda (vaciar el cajón al superar el límite) | ✅ (registra; no ve el total) | ✅ |
| Ver saldo ACUMULADO de bóveda · consignar al banco (bóveda→banco) · reponer fondo (bóveda→cajón) | ❌ | ✅ |
| Editar `config/caja` (límites, enforceTurno, destinatarios) · conteo físico de bóveda | ❌ | ✅ |
| **Aprobar** ajuste de faltante/sobrante · reverso de traslado | ❌ (los solicita) | ✅ (los aprueba) |
- El POS de venta NUNCA muestra a la cajera el saldo acumulado de bóveda (discreción D7). La cajera ve solo su
  turno (fondo, ventas, efectivo del cajón, alerta de límite).
- Todas las CF validan por rol (`isCaja()` para operar; `isOwner()` para supervisar/aprobar). Wrappers como los
  de `pedidos.js` (`verifyRole`). Daniel (dev) opera en desarrollo; en producción no es un rol del negocio.

---

## 10. SPEC EJECUTABLE — plan de implementación TDD por bloques (interinato Opus §0 f1-core)
> Reglas de interinato: TDD estricto en `functions/` (rojo→verde), commits `[OPUS-4.8]`, deploy manual con
> suites verdes, NO tocar `wompi-core`/webhook/reaper/snapshot. Cada bloque cierra verde antes del siguiente.
> **Núcleos PUROS testeables** en `pedidos-core.js` (o un nuevo `caja-core.js` si crece); wrappers en `pedidos.js`.

### Bloque B0 — Rol `caja` + `config/caja` + reglas (fundación, sin dinero aún)
- `firestore.rules`: helper `isCaja()` (owner/admin/caja); `config/caja` → `docId in ['cartera','caja'] ?
  isOwner() : isAdmin()`; colecciones nuevas `turnos`/`caja`/`boveda`/`bovedaMovimientos` = CF-only
  (read por rol, write false) + append-only ESTRICTO en los ledgers (sin update/delete ni owner).
- Tests: `test:rules` (emulador) — caja lee su turno pero NO `boveda/main`; caja NO escribe `config/caja`;
  nadie hace update/delete de `bovedaMovimientos`. Rojo→verde.

### Bloque B1 — Turnos: abrir/cerrar por PUNTERO singleton (invariante #4, sin ventas aún)
- `abrirTurnoCore(db,{fondoApertura,autor})`: runTransaction sobre `caja/estado` (puntero); si `turnoAbiertoId!=null`
  aborta `failed-precondition`; si null crea `turnos/{id}` (estado abierto, fondoApertura, aperturaTs, aperturaPor)
  + set puntero. `cerrarTurnoCore(db,{turnoId,conteoPorMedio,autor})`: flip estado→cerrado + limpia puntero + esperado
  por medio (§8.1.7 ecuación completa) + descuadre. Idempotencia por opId.
- Tests (`functions/caja.integration.test.mjs`, emulador, SOLO): abrir con puntero null crea 1 turno; 2ª apertura
  concurrente → exactamente 1 gana (test de carrera); cerrar limpia puntero; doble-cierre idempotente; ecuación
  de cierre con boveda_a_cajon. Rojo→verde.

### Bloque B2 — Enlace venta↔turno + ruta corta + cota (invariantes #5/#6, toca crearPedido)
- `crearPedidoCore`: si `canal==='pos'` → lee puntero `caja/estado` en la MISMA tx; si `enforceTurno && !turnoAbierto`
  → rechaza ("abre la caja"); si hay turno → guarda `turnoId` (TODOS los medios POS, §9.5). Incrementa `docsDelTurno`;
  al superar ~350 → señal de cierre forzado. `enforceTurno` (flag config, default false).
- Tests: venta POS con turno guarda turnoId (todos los medios); sin turno + enforceTurno rechaza; test de carrera
  cerrarTurno vs crearPedido (uno gana, sin huérfano); ventas 24/24 existentes verdes; wompi 16/16.

### Bloque B3 — Bóveda: traslado/reverso + recompute + checkpoint (invariantes #2/#3, §9.3)
- `registrarTrasladoCore`, `reversoCore` (crea movimiento compensatorio, NO edita), `recalcBoveda` (trigger
  onDocumentWritten; recompute desde último checkpoint + posteriores; no-op si saldo igual). `saldo_inicial:0`
  fundacional. Todo con recompute SÍNCRONO en tx para gates (§8.1.3). Idempotencia opId.
- Tests: traslado cajón→bóveda actualiza saldo por recompute; reverso deja doble rastro (no borra); doble-tap
  opId no duplica; checkpoint acota el recompute; guard duro de montos (no negativo/no entero rechaza).

### Bloque B4 — Dual-Approval + alertas (§9.1/§9.8)
- `ajuste_faltante/sobrante` y `reverso` nacen `pendiente_aprobacion`; `aprobarEventoCaja` (isOwner) → entra al
  recompute. Alertas FCM al owner (hardcoded) en eventos delicados (reusa infra A.6). Egresos/traslados normales
  = alerta, no aprobación.
- Tests: evento destructivo no cuenta hasta aprobación owner; caja NO puede aprobar; alerta se emite (mock).

### Bloque B5 — UI (POS caja + vista Bóveda owner + panel aprobaciones) + fix L-72
- POS: apertura de turno, movimientos, alerta de límite + modal traslado obligatorio, cierre enlazado. Vista
  Bóveda (owner-only, discreta). Panel de aprobaciones (owner). Fix `ESTADO_LBL` (`d244d77`, ya en Desarrollo).
- SW/APP bump. Gate en prod (Chrome, con usuario caja + usuario owner de prueba). ADR.

### Checklist (evidencia por bloque)
- [x] B0 reglas rol caja + config/caja + append-only — evidencia: test:rules 233/233 (B0a root+enum + B0b colecciones; commit `[OPUS-4.8]`). ⚑ Desvío: subcolección `movsCaja` (no `movimientos`) para no contaminar el CG de cartera → L-73.
- [x] B1 turnos por puntero + test de carrera — evidencia: `functions/caja-core.js` (`abrir/cerrarTurnoCore`) + `caja.integration` **8/8** (puntero singleton #4, idempotencia opId #2, ecuación #7, test de carrera → 1 gana) + pedidos-integración **24/24** (no-regresión). Cierre COMPLETO computa ventas por turnoId con filtro de estado en JS → **sin índice compuesto** (evita el trap §8.3; solo auto-index de `turnoId`). Commit `[OPUS-4.8]`.
- [ ] B2 enlace venta↔turno + enforceTurno + cota — evidencia: integración + ventas/wompi verdes
- [ ] B3 bóveda traslado/reverso/recompute/checkpoint — evidencia: integración
- [ ] B4 Dual-Approval + alertas — evidencia: integración
- [ ] B5 UI + gate prod (Chrome) + SW bump + ADR
