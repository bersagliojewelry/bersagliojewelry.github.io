# F-TESORERÍA — "Cuentas y bancos" · DISEÑO EJECUTABLE [FABLE-5]

> **Decisión Fuerte de dinero** (plan maestro v5 §5 → esta spec la vuelve ejecutable).
> Diseñada por el titular (Fable 5, 2026-07-18) para ejecución del interino (Opus 4.8) bajo
> `opus-interino-protocolo` R1-R7 — patrón F-IA-2 probado (§192: 54 commits, 2 nits).
> Insumos: plan v5 §5 (comité ×3) · skill `auditoria-financiera` (7 invariantes) · twenty
> T-3/T-7/T-24/T-25 (§183, vinculantes) · auditoría viva del panel §192 · `42-LEGAL` (771-5, GMF,
> No-responsable-IVA). Consejo externo: PROMPT en `...-f-tesoreria-PROMPT-CONSEJO-EXTERNO.md`
> (Daniel lo corre ANTES de B1; B0 no espera). Mockup: bóveda + artifact.

## §0.6 — COMITÉ ×3 (2026-07-18) · VEREDICTOS INCORPORADOS — **VINCULANTES, prevalecen sobre el cuerpo**

> 3 voces acotadas (arquitecto-dinero · contadora PyME CO · UX-Kary) refutaron el borrador;
> 16 hallazgos, TODOS aceptados por el titular. Crudos → bóveda. Donde el cuerpo contradiga
> esta sección, MANDA ESTA SECCIÓN (patrón F-IA-2 §0.7).

- **V1 [P0·arquitecto] Frontera virtual↔real**: la bóveda YA consigna a banco (`boveda_a_banco`,
  `caja-format.js:38`) — sin pata bancaria, esa plata DESAPARECE de la consolidada y el cuadre
  del banco nunca cierra. **Fix**: cuando el flujo existente de bóveda toque una cuenta REAL,
  esa MISMA CF escribe en la misma tx la pata en `movimientosTesoreria` (tipos nuevos
  `consignacion_in` / `retiro_efectivo_out`, ref al mov de bóveda). ⚠️ Toca CF de bóveda =
  **zona caliente R3**: test del escenario PRIMERO, cambio mínimo, bloque B5, alerta en bitácora.
- **V2 [P1·arquitecto] `reembolso_socia` también nace `pendiente_aprobacion`** (decisión titular:
  TODA plata que sale hacia una socia pide firma del owner; mata la puerta abierta gemela de
  retiro). Además la CF valida reembolso ≤ saldo-aporte recomputado de esa socia (aviso si excede).
- **V3 [P1·arquitecto] Signos**: `ajuste_inverso` exige `refDocumento` y su signo =
  −signo(tipo del ref). El residuo de conciliación NO usa ese tipo: nace el tipo
  **`ajuste_conciliacion`** con campo `direccion ∈ {entrada,salida}` explícito, nace
  `pendiente_aprobacion`. El test de paridad §5.8 cubre ambos.
- **V4 [P1·arquitecto] Idempotencia POR-LIBRO en D9**: al replay de un opId, la CF verifica
  CADA pata (cartera / tesorería) por separado dentro de la tx y crea la faltante si el
  payload la pide — jamás "éxito previo" global. Test específico (flag off→on con mismo opId).
- **V5 [P1·arquitecto] `fechaEfectiva`**: aprobar estampa `fechaEfectiva` = fecha de aprobación;
  recompute y conciliación filtran por `fechaEfectiva` (la `fecha` de solicitud queda de
  auditoría). Mata el descuadre retroactivo de un mes ya sellado.
- **V6 [P2·arquitecto] Saldo negativo GRITA**: sin clamp y sin bloqueo duro — el modal exige
  confirmación explícita ("Nequi quedaría en −$1.800.000 ¿seguro?") y la tarjeta queda en
  rojo persistente mientras el saldo < 0.
- **V7 [P0·contadora] GMF/comisiones**: en "Cuadrar mes", botón **"Registrar gastos del
  extracto"** crea movimientos `gasto` con `categoria ∈ {gmf, comision_bancaria,
  comision_pasarela}` SIN aprobación (son cobros del banco). El GMF es deducible 50% (art.
  115 ET) → categoría separada, no "gasto" plano.
- **V8 [P1·contadora] Egresos deducibles**: para `pago_proveedor`/`servicio_publico`/`gasto`,
  `contraparte{nombre, doc?}` es OBLIGATORIA y `soporteURL` advertida ("sin soporte, tu
  contador no lo puede usar").
- **V9 [P1·contadora] Socias — riesgos que Daniel debe conocer** (documentados, no bloquean):
  exógena/art. 594-3 ET (>~1.400 UVT consignadas/año → la socia queda obligada a declarar)
  y SARLAFT bancario (joyería = alto riesgo; depósitos comerciales recurrentes en cuenta
  personal → riesgo de bloqueo). **Fix UI**: cada cuenta de socia muestra "pasó por esta
  cuenta este año: $X" (recompute). Y corrección de lenguaje: no existe "cuenta de la
  empresa" (persona natural) → "cuentas de la titular del RUT".
- **V10 [P1·contadora] `fecha ≥ fechaCorte`**: la CF rechaza movimientos con fecha anterior
  al corte inicial de la cuenta (double-count con saldoInicial). B0 exige soporte del corte
  (foto del extracto) en la cuenta.
- **V11 [P2·contadora] Wompi BRUTO**: el abono de Wompi se registra bruto + su comisión como
  `gasto{comision_pasarela}` en el mismo acto (microcopy del cuadre lo instruye).
- **V12 [P0·UX] Una sola puerta para el abono**: `registrarMovimientoTesoreria` RECHAZA
  `tipo:abono_cartera` con fuente MANUAL (solo lo crea la CF del abono, D9). El campo del
  CRM deja de ser opcional-silencioso: elección explícita con opción "todavía no sé" +
  lista "abonos sin cuenta asignada" visible en "Cuadrar mes" para cerrarlos.
- **V13 [P0·UX] "Guardar cuadre" confirma**: diálogo que repite "$A vs $B · diferencia $C ·
  estos N movimientos quedarán sellados"; con diferencia ≠ 0 NO deja guardar sin resolverla
  (gastos del extracto o ajuste_conciliacion).
- **V14 [P1·UX] Tabla de etiquetas humanas VINCULANTE** (§3-bis). El modal de registrar
  muestra ≤6 opciones agrupadas (Entró plata / Salió plata / Plata de socia); los tipos de
  sistema (`traslado_*`, `ajuste_*`, `abono_cartera`, `consignacion_in`, `retiro_efectivo_out`)
  JAMÁS aparecen en el modal — solo se leen en la tabla.
- **V15 [P1·UX] Microcopy "Cuadrar mes" en 3 pasos** (1. abre tu extracto · 2. marca lo que
  aparezca allá · 3. escribe el saldo final) + **$A definido** = saldo del sistema al cierre
  del mes (todos los movimientos activos del período por fechaEfectiva).
- **V16 [P2·UX] Confirm de traslado con números**: "Sale $M de X (quedará $a) → entra a Y
  (quedará $b)" + combina con V6 si $a < 0.

**§3-bis · Etiquetas humanas (vinculante, es-CO cero jerga)**: ingreso_venta="Entró plata de
una venta" · abono_cartera="Abono de clienta" · pago_proveedor="Pago a proveedor" ·
servicio_publico="Servicio público" · gasto="Gasto" (+ categoría visible) · traslado_out=
"Pasó a otra cuenta" · traslado_in="Llegó de otra cuenta" · aporte_socia="Aporte de socia" ·
reembolso_socia="Devolución a socia (pide aprobación)" · retiro_socia="Retiro de socia (pide
aprobación)" · ajuste_inverso="Corrección (reversa un movimiento)" · ajuste_conciliacion=
"Ajuste del cuadre (pide aprobación)" · consignacion_in="Consignación desde la bóveda" ·
retiro_efectivo_out="Retiro para efectivo".

**Tests que se SUMAN a §5**: (9) consignación bóveda→banco crea ambas patas en una tx y la
consolidada se conserva · (10) replay por-libro V4 (flag off→on, mismo opId ⇒ pata faltante
nace, cartera NO duplica) · (11) `fecha < fechaCorte` ⇒ rechazo · (12) reembolso > aporte ⇒
aviso/pendiente · (13) fechaEfectiva: aprobar tras el cierre del mes NO cae en el período
sellado · (14) `abono_cartera` MANUAL ⇒ rechazo · (15) ajuste_conciliacion direccion
entrada/salida suma correcto en paridad.

## §0.7 — CONSEJO EXTERNO (2026-07-18) · deliberación del titular — **VINCULANTE, prevalece sobre §0.6 y el cuerpo**

> Daniel corrió el PROMPT-CONSEJO (gate de B1 ✅ CUMPLIDO). 7 hallazgos → 4 aceptados (V17-V20),
> 2 ya cubiertos por el comité, 1 REFUTADO. Crudo + deliberación → bóveda. El consejero confirmó
> como intocables: recompute CF-única, ledger append-only+opId, pata atómica cartera↔tesorería, SoD.

- **V17 [P0·aceptado] Efectivo de abonos ENTRA al alcance** (supersede el "límite conocido" de
  D9 y su fila en §8): un abono de cartera en EFECTIVO reduce la deuda pero el billete no
  existía en ningún libro → arqueo "cuadra" aunque el billete se vaya al bolsillo. **Fix**: la
  CF del abono, cuando `medio=efectivo`, escribe en la MISMA tx la pata en el módulo de caja
  (`movsCaja` tipo nuevo `abono_cartera`) → entra al esperado del arqueo automáticamente
  (los movs ya suman en el esperado split-aware). **Exige turno abierto**: sin turno, la UI
  dice "abre el turno en el Mostrador para recibir efectivo". ⚠️ Toca caja = **zona caliente
  R3**: test del escenario PRIMERO (abono efectivo → arqueo lo espera → sin registro = descuadre
  visible), cambio mínimo, bloque B5, alerta en bitácora. Idempotencia por-libro (V4) aplica.
- **V18 [P0·aceptado ADAPTADO] Circuito banco↔efectivo SIEMPRE vía bóveda** (el consejero pedía
  traslados mixtos directos banco→cajón; se adapta a un diseño más simple y con mejor control):
  banco→bóveda = flujo NUEVO "Retiro de banco" en el módulo de bóveda (espejo exacto de la
  Consignación V1: una CF, dos patas — `retiro_efectivo_out` en la cuenta real + ingreso en
  bóveda); bóveda→cajón = flujo EXISTENTE intacto. **NUNCA banco→cajón directo**: un solo
  punto de entrada del efectivo (la bóveda), un solo conjunto de controles.
- **V19 [P1·aceptado] Sello en dos etapas**: los ✓ de conciliación son BORRADOR editable
  (persistible) hasta "Guardar cuadre" (V13 confirma y sella). Tras sellar: acción
  **"Reabrir cuadre de {mes}"** OWNER-only con motivo + audit trail, permitida SOLO mientras
  el mes siguiente no esté sellado. Mata el missclick sin llenar el ledger de inversos basura.
- **V20 [P2·aceptado ADAPTADO] Tipología para margen bruto**: se RETIRA el tipo
  `servicio_publico` (pasa a `gasto{categoria:'servicios_publicos'}`); `categoria` se vuelve
  OBLIGATORIA en `gasto` con lista cerrada: `{gmf, comision_bancaria, comision_pasarela,
  arriendo, nomina, servicios_publicos, papeleria, otros}`; `pago_proveedor` = COSTO DE VENTA
  (etiqueta: "Pago a proveedor (mercancía/taller)") — separado de gasto operativo para que
  F-REPORTES compute margen bruto. El modal V14 pide la categoría en un 2º select humano.
- **[ya cubierto] Riesgo UIAF/exógena** = V9 (acumulado anual + advertencia + lenguaje "titular
  del RUT"). NUEVO para Daniel (acción LEGAL, no software): formalizar con abogado/contador un
  **contrato de cuentas en participación (o mandato)** con las socias mientras se migran las
  cuentas — registrado en `42-LEGAL §7` como pendiente del dueño.
- **[ya cubierto] Wompi neto/GMF** = V7+V11; refuerzo: el helper del cuadre crea ingreso BRUTO
  + `gasto{comision_pasarela}` en UNA sola llamada de CF (no dos pasos manuales).
- **[REFUTADO] "Editor de reglas sin audit trail"**: viola SoD (inv.6 — quien opera no
  reescribe los parámetros de su propio control: limiteCajon/enforceTurno/tasas son parámetros
  de DINERO). La CF de D6 es ~30 líneas y el audit trail ES el control. Se mantiene D6 tal cual
  (ya es mínima: una tarjeta en página existente, sin UI nueva).

**Tests que se SUMAN** (además de §5 y §0.6): (16) abono efectivo con turno abierto → movCaja
nace y el arqueo lo espera; sin turno → rechazo con mensaje · (17) abono efectivo idempotente
por-libro (replay no duplica movCaja) · (18) "Retiro de banco" crea ambas patas en una tx ·
(19) reabrir cuadre: owner sí / admin no / mes siguiente sellado → rechazo · (20) gasto sin
categoria → rechazo; margen: Σ pago_proveedor separable de Σ gasto en el export.

## §0.8 — DIRECTIVA DEL DUEÑO (2026-07-18) — **prevalece sobre TODO (§0.8 > §0.7 > §0.6 > cuerpo)**

> Daniel: *"eso lo carga Kary; la idea es dejarle la plataforma lista y confiable para que
> ella cargue toda su información."* Misma filosofía del CRM (`[[project_crm_kary_sole_operator]]`:
> Kary crea vendedoras/clientes y registra todo). Consecuencias VINCULANTES:

- **V21 · CERO seed de datos por Claude**: se elimina el gate "Daniel/Kary entregan la lista
  de cuentas" (D1/B0). El ÚNICO seed es ESTRUCTURAL: las 2 cuentas virtuales (caja/bóveda).
  Las cuentas reales las crea KARY por la UI cuando la plataforma se le entregue.
- **V22 · Alta de cuenta = flujo de primera clase con onboarding**: el estado-cero de
  "Cuentas y bancos" GUÍA ("Aún no has agregado tus cuentas. Agrega la primera →"). El modal
  de crear cuenta pide, en lenguaje de Kary: nombre para reconocerla · banco/Nequi · de quién
  es (con el aviso de socia si aplica) · **"¿cuánta plata hay hoy según tu extracto?"**
  (saldoInicial) + fecha + **foto del extracto** (V10: el soporte del corte se sube AQUÍ,
  ya no es runbook). Microcopy: "desde hoy el sistema lleva la cuenta contigo".
- **V23 · saldoInicial/fechaCorte INMUTABLES tras el primer movimiento** de la cuenta
  (antes: editables — un error de digitación se corrige recreando la cuenta vacía). Con
  movimientos, corregir el arranque = `ajuste_conciliacion` aprobado. Cierra el doble-conteo
  que V10 vigilaba, ahora en modo autoservicio.
- **V24 · El gate de entrega es CONFIABILIDAD, no datos**: B0 pierde su gate externo → Opus
  puede arrancar YA (consejo §0.7 ya incorporado). La fase termina con B6 (rompimiento) +
  auditoría del titular; SOLO entonces se le presenta a Kary — el gate vigente de Daniel
  ("Kary NO usa hasta confiabilidad 100%") aplica tal cual. La captura de sus cuentas será
  su primer acto de adopción, con la plataforma ya probada.
- **B0 REDEFINIDO**: fundación técnica pura — reglas + índices + seed estructural de las 2
  virtuales + `tesoreria-core.js` esqueleto. Sin dependencia de nadie.

## §0 — Qué es (y qué NO es)

**Es**: el libro auxiliar de tesorería de Kary — las cuentas reales donde vive la plata
(bancos, Nequi, y las virtuales Caja/Bóveda ya existentes), un ledger append-only de
movimientos con soporte, traslados atómicos, subcuentas de socias con SoD, y conciliación
mensual manual contra extracto. Resuelve el dolor #1: descuadres entre cuentas.

**NO es** (anti-scope, comité v5 — Opus NO construye nada de esto): PUC, partida doble
formal, NIIF, centros de costo, multi-moneda, retenciones automáticas, matching bancario
automático, presupuesto, API bancaria. Contabilidad formal = del contador (exportes en
F-REPORTES). Tampoco: tocar el ledger de caja/bóveda existente (§4 costuras).

## §0.5 — Decisiones CERRADAS (D1-D9) — Opus no re-decide

- **D1 · Cuentas semilla = DATO REAL, jamás inventado**: B0 captura con Daniel/Kary la lista
  real (nombre, banco, tipo, titular, esDeSocia, saldoInicial + fechaCorte del corte inicial).
  El plan v5 habla de "7 cuentas" — el número REAL lo da Kary. Caja y Bóveda entran como
  cuentas **virtuales** (`tipo:'caja'|'boveda'`, SIN saldoInicial ni ledger propio en
  tesorería): la vista consolidada LEE sus módulos existentes; sus movimientos NO se duplican.
- **D2 · Ledger CF-única-escritora**: `movimientosTesoreria/{opId}` append-only; escribe SOLO
  la CF `registrarMovimientoTesoreria` (idempotente por opId UUID del cliente — patrón
  `crearPedido`). Cliente jamás escribe la colección (reglas deny-all write).
- **D3 · Traslado = par atómico en UNA transacción**: CF `trasladarEntreCuentas` crea
  `traslado_out` + `traslado_in` con el MISMO `trasladoId` en una tx — jamás dos registros
  sueltos (causa #1 de descuadre). Si una cuenta es virtual (caja/bóveda) el traslado NO
  pasa por esta CF: se usa el flujo existente de caja↔bóveda (§181, acumuladores) y
  tesorería lo LEE — cero doble asiento. **⚠️ CORREGIDO por V1 (§0.6)**: el flujo bóveda↔banco
  SÍ escribe la pata bancaria en tesorería (misma tx, tipos consignacion_in/retiro_efectivo_out).
- **D4 · Socias con SoD** (**corregido por V2**): `retiro_socia` **y `reembolso_socia`** NACEN
  `pendiente_aprobacion` → Bandeja (sección nueva "Tesorería", patrón T-25; reusa el layout
  de "Bóveda y caja"); solo el OWNER aprueba (estampa actor + `fechaEfectiva`, V5).
  `aporte_socia` no requiere aprobación (entra plata). Saldo por socia =
  recompute. La UI muestra la advertencia tributaria (texto en §3; el sistema ordena y
  documenta, no legaliza — meta: migrar a cuenta empresa).
- **D5 · Saldos por recompute server-side**: trigger `onDocumentWritten(movimientosTesoreria)`
  → `recalcularSaldoCuenta` (patrón `recalcSaldoCliente` §43, blindaje §64: fallo →
  `saludEventos`). `cuentasTesoreria.saldoActual` = CF-only. Fórmula PURA
  `computeSaldoCuenta(saldoInicial, movs)` en `functions/tesoreria-core.js` + espejo cliente
  `js/admin/tesoreria-format.js` (invariante 2: mismo número en todas las vistas; test de
  paridad obligatorio como `aging-paridad`).
- **D6 · Editor "Reglas del sistema" (salda la deuda H2/D1 de F-IA-2)**: NACE EN "Negocio y
  equipo" (donde ya vive la tarjeta solo-lectura), NO en tesorería — corrección deliberada
  al v5 ("editable desde Tesorería"): la config del sistema no es un movimiento de plata y
  Kary no debe pasar por el editor para ver sus cuentas. Owner-only (SoD inv.6: quien opera
  no reescribe parámetros): CF `actualizarConfigSistema` valida rangos (enforceTurno bool ·
  limiteCajon entero >0 · tasas fiscales 0-1) + estampa actor + evento en `saludEventos`
  (audit trail). El microcopy de la tarjeta cambia ("El dueño puede editarlos aquí").
- **D7 · Wompi/web SIN auto-posting en v1**: el webhook ya escribe pedidos; duplicarlo a
  tesorería = riesgo de doble conteo. El recaudo web entra en la conciliación mensual
  (Kary registra el/los abonos del extracto como `ingreso_venta` con ref al período).
  Cruce automático pedidos↔payouts = F-REPORTES.
- **D8 · Permisos v1 = roles existentes** (owner/admin): Kary registra, owner aprueba
  retiros/ajustes. Capacidades-flag (T-16/18/19) y row-level = DESPUÉS (rol `caja` F2.0).
- **D9 · Costura abonos de cartera (acotada; corregida por V4+V12)**: el form de abono del
  CRM gana elección EXPLÍCITA `cuentaId` ("¿A qué cuenta entró?" con opción "todavía no sé")
  solo para transferencia/nequi; si viene, la MISMA CF del abono crea el `movimientoTesoreria
  {tipo:'abono_cartera', refDocumento:movimientoId}` con el MISMO opId — **idempotencia
  POR-LIBRO** (V4: al replay se verifica cada pata y se crea la faltante; jamás "éxito previo"
  global). `registrarMovimientoTesoreria` RECHAZA `abono_cartera` manual (V12: una sola
  puerta); los sin-cuenta quedan en la lista "abonos sin cuenta asignada" del cuadre.
  **Efectivo de abonos = LÍMITE CONOCIDO declarado**: hoy no pasa por caja/arqueo; NO se
  resuelve en esta fase (zona caliente R3) → fila explícita en la cola del titular.

## §1 — Modelo de datos

```
cuentasTesoreria/{id}            ← admin crea/edita METADATOS via CF; saldoActual CF-only
  nombre, banco, tipo ∈ {banco,nequi,caja,boveda}, titular ∈ {empresa,kary,daniela,veronica},
  esDeSocia:bool, activa:bool, saldoInicial:{monto:int,moneda:'COP'}, fechaCorte,
  saldoActual:{monto:int,moneda:'COP'}   // recompute D5; virtuales caja/boveda: sin saldos propios
movimientosTesoreria/{opId}      ← deny-all write en reglas; CF única escritora (D2)
  cuentaId, fecha, monto:{monto:int,moneda:'COP'}   // T-3: jamás number desnudo; signo por tipo
  tipo ∈ {ingreso_venta, abono_cartera, pago_proveedor, servicio_publico, gasto,
          traslado_in, traslado_out, aporte_socia, reembolso_socia, retiro_socia,
          ajuste_inverso, ajuste_conciliacion, consignacion_in, retiro_efectivo_out}  // V1/V3
  categoria? ∈ {gmf, comision_bancaria, comision_pasarela, otros}   // solo tipo=gasto (V7)
  direccion? ∈ {entrada, salida}                                    // solo ajuste_conciliacion (V3)
  fechaEfectiva?                                                    // estampada al aprobar (V5)
  estado ∈ {activo, pendiente_aprobacion, rechazado}   // nacen pendientes: retiro_socia,
                                                       // reembolso_socia (V2), ajuste_inverso, ajuste_conciliacion
  contraparte:{tipo,id}?, descripcion, soporteURL?, refDocumento?, trasladoId?,
  conciliado:bool=false, periodoConciliado?,
  creadoPor:{uid,nombre,fuente ∈ MANUAL|SISTEMA}      // T-7 sello de actor
  aprobadoPor:{uid,nombre,at}?                         // retiros/ajustes
```
Reglas: `cuentasTesoreria` read admin/owner; write deny (CF). `movimientosTesoreria` read
admin/owner; write deny. Índices: (cuentaId, fecha desc) · (cuentaId, conciliado, fecha) ·
(estado, tipo). **Un movimiento `conciliado:true` es INMUTABLE** (ni la CF lo edita;
corrección = `ajuste_inverso` aprobado — inv.6 ledger inmutable).

## §2 — Cloud Functions (contratos; núcleos puros en `functions/tesoreria-core.js`)

1. `crearCuentaTesoreria({nombre,banco,tipo,titular,esDeSocia,saldoInicial,fechaCorte})` —
   admin; virtuales caja/boveda se crean por seed B0 y no aceptan saldoInicial.
2. `registrarMovimientoTesoreria({opId, cuentaId, tipo, monto, fecha, descripcion,
   soporteURL?, contraparte?})` — admin; idempotente (opId existe → return éxito previo);
   valida: cuenta activa y NO virtual · tipo≠traslado_* (eso es de la CF 3) · monto>0 ·
   retiro_socia → estado pendiente_aprobacion.
3. `trasladarEntreCuentas({opId, origenId, destinoId, monto, descripcion})` — par atómico
   D3; rechaza cuentas virtuales (mensaje: "Caja↔Bóveda se mueve desde su módulo").
4. `aprobarMovimientoTesoreria({opId, decision ∈ aprobar|rechazar, motivo?})` — OWNER-only;
   estampa aprobadoPor; rechazado NO cuenta en saldo (recompute filtra estado='activo'…
   pendiente TAMPOCO cuenta hasta aprobarse — el saldo solo ve plata firme).
5. `marcarConciliado({cuentaId, periodo:'YYYY-MM', opIds:[]})` — admin; solo movimientos
   activos de esa cuenta; estampa periodoConciliado; audit en descripción.
6. `recalcularSaldoCuenta` — trigger D5 + callable de reparación (patrón `repararSaldo` §64).
7. `actualizarConfigSistema({campo, valor})` — OWNER-only (D6).
   **CERO cambios a CFs existentes salvo**: la CF de abono del CRM (D9, aditivo con flag).

## §3 — UI (voz-panel es-CO, §0.5 F-IA-2; microcopy dinero: qué pasó + qué pasó con la plata + qué hacer)

- **`admin-tesoreria.html` + `js/admin/tesoreria.js`** — "Cuentas y bancos" (rail: grupo
  Finanzas, entre Bóveda y Aprobaciones). Layout: fila de tarjetas-cuenta (nombre, banco,
  saldo `.adm-money`, chip "de socia" si aplica, chip "virtual" para Caja/Bóveda con link a
  su módulo) + **"Plata total: $X"** (Σ activas + cajón + bóveda; fila owner como en Hoy) +
  tabla de movimientos de la cuenta seleccionada (fecha, tipo humano, monto con signo,
  soporte 📎, conciliado ✓) + botones "Registrar movimiento" / "Trasladar entre cuentas"
  (modales propios, patrón `#confirm-dialog`; traslado muestra "sale de X → entra a Y" antes
  de confirmar). Estado-cero honesto por sección (L-42: montar SIEMPRE la sección).
- **Conciliación**: pestaña dentro de la misma página ("Cuadrar mes"): selector cuenta+mes →
  lista de no-conciliados con checkbox → "según el sistema $A · según tu extracto $B
  (input) · diferencia $C EN ROJO si ≠0" → botón "Guardar cuadre" (marcarConciliado) +
  si residuo: "Registrar ajuste (pide aprobación del dueño)".
- **Bandeja**: sección 3 "Tesorería" (retiros de socia + ajustes pendientes; owner aprueba/
  rechaza con motivo — réplica exacta del patrón "Bóveda y caja" B4).
- **Hoy (fila owner)**: la tarjeta "Efectivo total" evoluciona a "Plata total" (cajón +
  bóveda + cuentas activas) usando el MISMO helper `tesoreria-format.js` (inv.2).
- **Advertencia socias** (una vez por página de cuenta de socia): "Esta es una cuenta
  personal de {nombre}. El sistema ordena y documenta cada peso, pero mezclar plata
  personal y del negocio tiene riesgos tributarios para ella. La meta es migrar todo a la
  cuenta de la empresa."
- **Nueva pieza de rail**: cero "PRONTO"; la página nace completa.

## §4 — Costuras (lo que NO se toca y cómo se conecta)

| Costura | Regla |
|---|---|
| Caja/Bóveda | Sus ledgers/CFs/acumuladores (§181) INTACTOS (R3 zona caliente). Tesorería los LEE para consolidar (cajón = fórmula compartida `ventasEfectivoTurno`; bóveda = su saldo). Traslados caja↔bóveda siguen en su módulo. |
| POS/pedidos | INTACTO. Ninguna venta escribe tesorería en v1 (D7). |
| CRM abonos | SOLO D9 (campo opcional + asiento atómico). El resto intacto. |
| Wompi | INTACTO (D7). |
| Bandeja | Se EXTIENDE con sección Tesorería (patrón B4; `aprob-badge` suma pendientes de tesorería). |
| Salud | `recalcularSaldoCuenta` reporta fallos a `saludEventos` (patrón §64); cuadre diario 3:30 AM se EXTIENDE para comparar saldoActual vs recompute de cada cuenta. |

## §5 — Invariantes + tests de integración POR ESCENARIO (R2: en el MISMO commit del código)

`functions/tesoreria.integration.test.mjs` (emulador, patrón `caja.integration`):
1. **Conservación**: registrar ingreso 100 + gasto 30 + traslado 50 A→B ⇒ saldoA = ini+100−30−50, saldoB = ini+50; Σ global constante en el traslado.
2. **Idempotencia**: replay del MISMO opId (registrar y trasladar) ⇒ 1 solo asiento/par.
3. **Atomicidad del traslado**: inyectar fallo tras el out (mock) ⇒ NO queda medio-par (tx aborta).
4. **SoD**: retiro_socia nace pendiente y NO afecta saldo; aprobar (owner) lo activa y resta; rechazar no resta; admin llamando a aprobar ⇒ permission-denied.
5. **Deshacer netea**: ajuste_inverso aprobado revierte exactamente; segundo inverso del mismo ref ⇒ rechazado.
6. **Inmutabilidad conciliada**: editar/anular un conciliado ⇒ rechazo; corrección solo por inverso.
7. **Virtuales**: registrar/trasladar sobre cuenta caja/boveda ⇒ rechazo con mensaje.
8. **Paridad**: `computeSaldoCuenta` (functions) ≡ `tesoreria-format` (cliente) sobre el mismo fixture (test node puro, patrón `aging-paridad`).
Reglas: `firestore-rules.test.mjs` gana casos: write directo a las 2 colecciones ⇒ deny; read por rol. **⚠️ L-22: deploy de reglas es MANUAL.**

## §6 — Bloques de ejecución (cada uno: build+tests verdes · SW/APP bump · checklist con evidencia · validación Chrome propia del camino completo, caza-bugs §2b)

- **B0 · Fundación técnica** (**redefinido por §0.8 V21/V24 — sin gate externo**): reglas +
  índices + seed ESTRUCTURAL de las 2 cuentas virtuales + esqueleto `tesoreria-core.js`.
  SIN UI aún. Las cuentas reales las creará Kary por la UI (V22) al recibir la plataforma.
  *Gate del consejo externo: ✅ CUMPLIDO e incorporado (§0.7) — B1 desbloqueado.*
- **B1 · Núcleo de dinero**: `tesoreria-core.js` puro + CFs 1-6 + trigger + tests §5 (1-8)
  + casos de reglas. CERO UI. Gate de salida: suites verdes en emulador.
- **B2 · Página "Cuentas y bancos"**: lista+saldos+registrar+trasladar+rail. Gate: Chrome
  E2E (crear movimiento→verlo→recargar→persiste; traslado muestra par; estado-cero).
- **B3 · Conciliación**: pestaña cuadre + marcarConciliado + ajuste con aprobación.
- **B4 · Socias + Bandeja + Hoy**: sección Tesorería en Bandeja + badge · "Plata total" en
  Hoy (helper compartido) · advertencia socias.
- **B5 · Costuras finales**: D9 (abono→cuenta, flag off hasta test verde) + D6 (editor
  reglas del sistema) + microcopy global + extensión del cuadre diario en Salud.
- **B6 · Rompimiento acotado**: mini-campaña adversarial (agentes read-only intentando
  romper conservación/idempotencia sobre el código, NO prod) + validación Chrome holística
  final. Entrega al titular para auditoría §4-protocolo.

## §7 — Checklist (marcar con evidencia: commit + test + validación)
- [ ] B0 cuentas reales capturadas + reglas/índices/seed — evidencia: doc de cuentas + dry-run
- [ ] B1 CFs + tests §5.1-8 verdes (emulador) — evidencia: salida de suite
- [ ] B2 página + Chrome E2E — evidencia: capturas + consola limpia
- [ ] B3 conciliación E2E (mes de prueba) — evidencia: cuadre con diferencia 0 y con residuo→ajuste
- [ ] B4 Bandeja/Hoy/socias — evidencia: retiro pendiente→aprobado en vivo; plata total == suma manual
- [ ] B5 D9+D6 con flags — evidencia: abono con cuenta crea asiento; config editada por owner con audit
- [ ] B6 rompimiento + Chrome holístico — evidencia: informe adversarial + barrido
- [ ] Consolidación: ADR + `21-ESPACIAL` + `31-LECCIONES` si hay gotchas + `05`/`10`

## §8 — Cola del titular (NO ejecutar sin Fable/Daniel)
- ~~Efectivo de abonos → caja~~ **ENTRÓ al alcance como V17 (§0.7)** — ya no es cola.
- **De la sesión de V17 (2026-07-25, comité ×3)**: (a) compensatorio en el turno ABIERTO, con
  aprobación del owner, al anular un abono de un turno YA sellado (hoy: rechazo honesto) —
  patrón reverso de bóveda; (b) prohibir `otro` como medio de abono (vector de evasión #1 según el
  auditor de fraude: declarar otro medio y quedarse el billete); (c) consecutivo de recibos por turno
  — el único testigo EXTERNO de un abono jamás registrado; (d) "dientes" al descuadre (hoy nunca
  bloquea, decisión de Daniel); (e) botón "Abrir caja y guardar abono" dentro del modal (UX: hoy el
  rechazo la manda al Mostrador; ⚠️ el fondo de apertura NO se debe pre-cargar del último cierre —
  sería una base que nadie contó).
- Capacidades-flag T-16/18/19 + rol `caja` (F2.0 matiz).
- Auto-posting Wompi→tesorería (F-REPORTES).
- Decisión Daniel pendiente del v5 §8: destino de los 344 clientes en la limpieza.

## §9 — Mapa de ejecución B5 [OPUS-4.8, mapeo del 2026-07-23 · pura ubicación, sin re-diseño]

> B0-B4 ✅ (código). B5 pendiente. Orden sugerido por RIESGO CRECIENTE: **D6 → V1 → V18 → V17 → D9**
> → microcopy/Salud. Cada sub-paso: test-PRIMERO (R2/R3), commit atómico, alerta en bitácora.

- **D6 (menor riesgo, self-contained)**: tarjeta "Reglas del sistema" hoy SOLO-LECTURA en
  `js/admin/config.js` (`renderReglasSistema`, body `#reglas-sistema-body`) + `admin-config.html`.
  Lee `config/caja` (`enforceTurno`, `limiteCajon`) y `config/fiscal` (tasas). **CF nueva
  `actualizarConfigSistema`** (owner-only) en `functions/tesoreria.js`+core (CF 7 §2): valida rangos
  (`enforceTurno` bool · `limiteCajon` int>0 · tasas 0-1), escribe el doc `config/*`, estampa actor +
  evento en `saludEventos`. Hacer editables (owner) al menos `enforceTurno`+`limiteCajon` (SoD inv.6:
  el ejemplo exacto del REFUTADO §0.7). Nota diseño abierta: firma `{campo,valor}` (spec §2) vs
  `{seccion,patch}` — decidir al implementar. Config se escribe hoy por cliente vía `setConfig`
  (crm-service) para `config/negocio`; las reglas de dinero deben ir por la CF, NO por `setConfig`.
- **V1 + V18 (HOT · `functions/pedidos.js`)**: el traslado de bóveda vive en **`registrarTraslado`**
  (index.js:259); tipos de bóveda en `js/admin/caja-format.js:34-42` (`boveda_a_banco` = consignación,
  `boveda_a_cajon`, etc.). V1: cuando el traslado sea `boveda_a_banco` a una cuenta REAL, la MISMA tx
  escribe la pata `consignacion_in` en `movimientosTesoreria` (vía `registrarMovimientoTesoreriaCore`
  con `fuente:'SISTEMA'` — puerta interna, NO la CF pública que fuerza MANUAL, ver `tesoreria.js:48`).
  Exige que la consignación ELIJA cuenta de tesorería (cambio UI en `js/admin/boveda.js`). V18 = flujo
  nuevo banco→bóveda espejo (pata `retiro_efectivo_out`). Tests §5.9/§5.18.
- **V17 + D9 (HOT · caja + abono CRM)**: ubicar la CF de abono del CRM (F2.1 vínculo cliente; NO está
  en el mapa de exports como "abono" — buscar en `functions/` el escritor de `movimientos` de cartera).
  V17: abono en EFECTIVO → pata en `movsCaja` (tipo nuevo `abono_cartera`), exige turno abierto,
  idempotente por-libro (V4). D9: form de abono gana `cuentaId` opcional → misma CF crea la pata
  `abono_cartera` en tesorería con el MISMO opId (flag off hasta test verde). Tests §5.10/§5.16/§5.17.
- **Cierre B5**: microcopy global + extender el cuadre diario 3:30 (`functions/salud.js`
  `reconciliacionDiaria`, index.js:288) para comparar `saldoActual` vs recompute de cada cuenta.

**✅ D6 HECHO (2026-07-24, [OPUS-5])** — `CAMPOS_CONFIG` (whitelist cerrada de 7 campos) +
`actualizarConfigSistemaCore` owner-only con rangos/MERGE/audit; UI editable en `config.js`;
7 tests → integración **22/22**. Dos precisiones que valen para el resto de B5:
1. **`reteIcaXMil` es POR MIL (0-100), no fracción 0-1** — el cuerpo de la spec decía "tasas 0-1"
   y aplicado literal habría rechazado el 7‰ real del contador. Validar cada tasa en SU unidad.
2. **⚠️ `saludEventos` tiene DOS semánticas y el Hoy las distingue por `resuelto`** (detalle al final
   de esta sección) — un evento de AUDITORÍA nace `resuelto:true`; un FALLO real, `resuelto:false`.

**✅ V17 HECHO (2026-07-25, [OPUS-5])** — 3 commits: TODO-79 (prerrequisito) + core/CF con TDD 16/16 +
UI. **DOS premisas de esta spec resultaron FALSAS al verificarlas** (§3.3), y la corrección está en el
código, no en la prosa:
1. **NO existía "la CF del abono del CRM"** (§9 mandaba ubicarla): el abono lo escribía el NAVEGADOR
   (`js/crm-service.js addMovimiento` → `addDoc`), validado solo por reglas. Y `movsCaja` es CF-only
   (`allow write: if false`) ⇒ la pata del efectivo SOLO puede nacer en servidor. Por eso el abono gana
   puerta propia: `functions/cartera-core.js` + `cartera.js` (`registrarAbonoCartera` admin ·
   `anularAbonoCartera` owner, espejando `anulacionValida`: NO amplía permisos).
2. **«los movs ya suman en el esperado» es falso para un tipo nuevo**: la ecuación suma SOLO
   `ingreso`/`egreso` y está COPIADA en 3 sitios (`caja-core cerrarTurnoCore` · `pos.js movsSums` ·
   `auditoria.js`, que rotula lo desconocido como "Ingreso"). ⇒ **DESVÍO DELIBERADO de la letra de
   §0.7** (§G.4 Desafío Crítico, con evidencia — patrón L-73): la pata nace `tipo:'ingreso'` +
   `concepto:'abono_cartera'`, no `tipo:'abono_cartera'`. Así entra al esperado en los 3 espejos SIN
   tocar la ecuación — que es LITERALMENTE lo que §0.7 pide que ocurra. Se cumple la intención; la
   palabra no. `CONCEPTOS_CAJA` NO lo incluye a propósito: la puerta manual de caja debe seguir
   rechazándolo (una sola puerta, V12 análogo; con test).
3. **Hallazgo del comité ×3** (lo caro): la idempotencia por-libro de V1/V18 **no transfiere** — allá
   el destino es determinista, aquí es TEMPORAL ("el turno abierto"). Sin ancla, un replay tardío mete
   la plata en el turno equivocado o en uno sellado. Fix: `pataCaja.turnoId` ANCLADO en el movimiento;
   el replay se resuelve contra ESE turno; si ya cerró y la pata falta, NO se reescribe el arqueo
   firmado → se reporta + ALERTA (`resuelto:false`). El turno se lee DENTRO de la tx → serializa contra
   el cierre. → **L-85**.
4. **La anulación entró al alcance** (era la mitad del control): anular un abono con pata netea AMBOS
   libros en una tx; si el turno de la pata ya cerró, RECHAZA. *Cola del titular*: el compensatorio en
   el turno abierto con aprobación del owner (patrón reverso de bóveda).
5. **FALTA para cerrar V17** (sin esto el control es parcial): **negar en reglas el create client-side
   de `tipo=='abono' && medioPago=='efectivo'`** — hoy `corregirMovimientoBatch` puede recrear un abono
   en efectivo sin pata (mitigado con guard de UI, que no alcanza a pestañas viejas). ⚠️ Dependencia: el
   carril de corrección debe pasar por la CF antes o con ese cierre.

**⚠️ `saludEventos` tiene DOS semánticas y el Hoy las distingue por `resuelto`**: la tarjeta
   "Avisos" cuenta los eventos con `resuelto !== true` como FALLAS del sistema (`hoy.js`
   `initSenalAvisos`). Un evento de **auditoría** (config cambiada, y lo que V1/V18/V17 registren
   como traza, no como fallo) debe nacer **`resuelto: true`** o le enciende una alarma falsa al
   dueño; los fallos REALES del recompute siguen naciendo `resuelto: false` (patrón §64). Fijado
   con test. *(Lección pendiente de anclar en `30` cuando se haga su shard — TODO-77.)*
