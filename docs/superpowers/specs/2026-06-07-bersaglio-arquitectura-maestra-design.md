# Bersaglio — Arquitectura maestra del sistema (Panel v2 → mini-ERP de joyería)

> **Tipo:** documento de diseño / north-star de arquitectura (no es el spec de implementación de una fase).
> **Fecha:** 2026-06-07 · **Autor:** Claude (arquitecto) + Daniel (owner) · **Estado:** borrador **v3** (tras red-team empresarial + revisión adversarial + **Consejo Externo Gemini 3.1 Pro**, §16) — aprobado por Daniel.
> **Origen:** brainstorm "Rediseño Panel v2". El cliente rechazó el panel actual por "muy básico / no parece un CRM que contiene todo" y exige pensar **todo el sistema desde ya** (CRM+leads, cartera, facturación, inventario, pagos, trazabilidad), construido **por fases**.
> **Insumos:** auditoría arquitectónica [2026-06-06](2026-06-06-auditoria-panel-crm.md) · grounding del código real · investigación de CRMs/suites (Salesforce, HubSpot, Zoho, Pipedrive, Dynamics, QuickBooks, Alegra, Siigo, Shopify, Odoo, Square) · blueprint de **Altorra Cars** (mismo stack, red-teamed con Gemini 3.1 Pro) · red-team empresarial interno (7 lentes).
> **Regla rectora:** pensar como arquitecto (`CLAUDE.md §3.6`) — *un CRM de dinero nunca miente en silencio*.

---

## 1. Contexto y veredicto

Bersaglio es un **mini-ERP de comercio de alta joyería** sobre la misma web (Firebase + Vite + GitHub Pages). Un solo backend **canal-agnóstico** sostiene todo el ciclo: captar interesado → cliente → vender (mostrador hoy, web mañana) → facturar → bajar inventario → cobrar (contado/crédito/apartado) → cartera → **todo trazable**.

**El backend de cartera ya es sólido** (en prod: 344 clientes, cartera $506M): `saldoActual` desnormalizado escrito **solo** por la Cloud Function `recalcSaldoCliente`; libro `movimientos` append-only; RBAC server-side; módulo desacoplado. **No se reescribe**: se **extiende por eventos**.

**La brecha a nivel empresa** (red-team) está en 3 frentes que hoy "callan" errores sobre $506M:
1. **Integridad transaccional** — el flujo de venta es una *saga* de triggers `at-least-once` sin idempotencia, sin máquina de estados ni reconciliación.
2. **Red de seguridad operativa** — no hay backup/PITR, ni alertas de error, ni append-only real en reglas.
3. **Modelo de dinero** — `saldo.js` usa `float`/`round2`; debe tratarse como **entero de COP** (ya exacto en JS; sin migración, §16), con redondeo de IVA por residual.

Todo se cierra en **serverless zero-budget, sin un solo microservicio**. Lo barato y crítico se **adelanta a F-CHASIS**.

### 1.1 Bugs reales verificados en el código actual (no teóricos)
- `firestore.rules:158` — `movimientos` permite `update/delete` libre al admin → contradice "anular ≠ borrar" y rompe la auditoría.
- `functions/index.js:143` — `onInquiryCreated` incrementa el contador **no idempotente** (duplica en reintento).
- `firestore.rules:128/135/143/198` — `reviews/subscriptions/inquiries/push_tokens` con `create: if true` sin App Check → spam y **denial-of-wallet** (la apiKey es pública en el bundle).
- `saldo.js`, `cuentas.js:26` — dinero como `float`.
- `crm-service.js:35,40,84,118,141` — `limit(2000)` **mudo**: si se supera, el total se reporta **menor** en silencio.
- `firestore.rules:11-13` — RBAC por `get()` de `users/{uid}` en cada chequeo (lecturas extra + acoplamiento).
- `firestore-rules-test.yml` pausado; cero índices compuestos CRM.

---

## 2. Decisiones de arquitectura (principios congelados)

1. **IA "C" (estilo HubSpot) definida como DATO**, no HTML: barra superior global + rail agrupado + Workspace "Hoy". `renderSidebar()` lee un array `grupos→ítems`. **Evoluciona a "B" (conmutador de áreas)** sin reescribir cuando los grupos pesen — los grupos de hoy son las áreas de mañana.
2. **Event-driven con orquestador síncrono** (patrón único, ver §6.1; **Consejo §16**): crear una venta/movimiento invoca **una Cloud Function *callable*** que en **una sola transacción** hace TODO el camino del dinero **incluido el nuevo saldo del cliente** (claim de stock + factura + pago/movimiento + `inventoryMoves` + **recompute O(M) del saldo**), garantizando < 500 escrituras/TX. **El saldo NO se deriva async** (evita el *read-your-writes race* → cobros duplicados). Solo lo verdaderamente no-monetario (`crm_aggregates` del dashboard, FCM) puede ir async post-commit. La reconciliación periódica es **red de seguridad**, no requisito de correctitud.
3. **Frontera de escritura del dinero**: las Cloud Functions *callable* transaccionales son el **único escritor** de `ventas/facturas/pagos/inventoryMoves/stock/auditLog`. El front **solo lee**; los totales y consecutivos se calculan **server-side** (nunca se confían al cliente). Reglas: `write: if false` para esas colecciones.
4. **Append-only + "anular ≠ borrar"**: ningún asiento financiero se edita ni se borra (ni por admin); se anula (transición controlada) o se corrige con documento vinculado (nota crédito / ajuste).
5. **Dinero en enteros de COP (pesos enteros), SIN backfill** (revisado por **Consejo §16**): el COP no circula con centavos → los montos ya son **enteros de pesos**, exactos en JS (≤ 2⁵³). **No se migra** la cartera de $506M (riesgo eliminado). Value-object `Money { amount: int, currency: 'COP' }` solo para etiquetar/claridad (sin re-escalar). Disciplina: nunca almacenar fracciones de peso. La precisión de la **base de IVA** (sub-peso) se resuelve por **residual al emitir** (`IVA = bruto − base`), no con `×10000`/`decimal.js` (innecesarios, §16). Si algún día hay multi-moneda: **schema-versioning**, no migración.
6. **IVA incluido**: el precio que maneja Kary ya trae IVA; el sistema **desagrega base e IVA por línea** (`base = bruto / (1+tarifa)`), default **19%** (con `taxCode` por línea para exentos/excluidos a futuro).
7. **Idempotencia por clave determinista**: `facturas/{ventaId}`, `inventoryMoves/{ventaId}_{lineItemId}`, `pagos/{ventaId}_auto`; en el cliente, `setDoc(uuid)` + botón deshabilitado al enviar.
8. **Claim de stock + venta + consecutivo en UNA transacción** (no cadena de triggers post-commit): vender dos veces una pieza única es irreversible.
9. **Saldo síncrono (recompute O(M)) + reconciliación de respaldo** (Consejo §16): `computeSaldo()` corre DENTRO de la transacción de escritura (race-free, sin drift). La reconciliación periódica es red de seguridad; descuadre → **alerta a Kary y a Daniel**. Incremental O(1) = optimización futura solo si la escala lo exige.
10. **RBAC por custom claims** (no `get()` por chequeo). Roles: **owner** (Daniel, **dueño del software**/ingeniero + sistema/salud), **admin** (Kary, **dueña de la tienda**/operación de negocio), **editor** (contenido web), **viewer**, y **vendedora = dato** (no usuario). 
11. **DIAN-ready desde el día 1**: la factura nace con todos los insumos del CUFE; la **integración del proveedor es lo último**.
12. **Cumplimiento Ley 1581** por diseño: `consent` como objeto inmutable + solicitudes ARCO. Base legal **contractual** para los 344 clientes migrados (fiado activo).
13. **Dos clases de alerta** (Kary = **dueña de la tienda**; Daniel = **dueño del software**): (a) **integridad financiera** (descuadre de cartera/saldo, factura sin movimiento) → **a Kary Y a Daniel** — es el dinero de su negocio, debe saberlo; Daniel además diagnostica la causa técnica. (b) **fallo técnico** (error de función, `failedIngestions`, backup/restore, reproceso) → **solo Daniel** (Kary no opera el sistema). El reproceso/recuperación vive en la vista owner-only "Salud".

---

## 3. Mapa de módulos

| Grupo (rail) | Módulo | Estado | Entidades núcleo |
|---|---|---|---|
| **Hoy** | Workspace operativo | 🟢 ahora | derivados (cartera, leads, cumpleaños) |
| **CRM** | Clientes (ficha 360) | 🟢 ahora (promover a nav) | `clientes` (+`movimientos`) |
| **CRM** | Bandeja (Leads + Comunicaciones) | 🟡 siguiente | `leads`, `conversations` |
| **Ventas** | Ventas (orden canal-agnóstica) | 🔵 futuro | `ventas` |
| **Ventas** | Facturación (DIAN-ready) | 🔵 futuro | `facturas`, `notasCredito` |
| **Cobranza** | Cuentas por cobrar (cartera pro) | 🟢 ahora | `clientes.saldoActual`, `movimientos` |
| **Cobranza** | Pagos / Recibos de caja | 🔵 futuro | `pagos` |
| **Catálogo/Inv.** | Piezas · Colecciones | 🟢 ahora | `pieces`, `collections` |
| **Catálogo/Inv.** | Inventario / Stock (único + lote) | 🔵 futuro | `pieces/{id}/stock`, `inventoryMoves` |
| **Reportes** | Aging · ventas · margen · recaudo | 🔵 futuro | `crm_aggregates`, derivados |
| **Sistema** | Vendedoras (sacar de Config) | 🟢 ahora | `vendedoras` |
| **Sistema** | Usuarios / RBAC | 🟢 ahora | `users` + claims |
| **Sistema** | Configuración (tras ⚙) | 🟢 ahora | `config/*` |
| **Sistema** | Salud (owner-only: fallos, backup, reconciliación) | 🔵 futuro | `failedIngestions`, `auditLog` |

Los módulos futuros aparecen como **placeholders atenuados ("pronto")** en su grupo → la IA muestra el sistema completo y nada vuelve a ser un menú plano.

---

## 4. Arquitectura de información (IA "C")

**Barra superior global** (en cada `.html`, vía `shared.js`): logo · **búsqueda federada** (`Ctrl/⌘K`, client-side sobre el set ya cargado; migrar a índice server cuando el volumen lo exija) · **+Crear** (cliente/lead/venta/abono/pieza/vendedora) · **notificaciones** (leads sin contestar, vencimientos, **descuadre de cartera → Kary y Daniel**; fallos técnicos/ingestión → solo Daniel) · **engranaje** (Configuración) · **perfil** (rol + salir).

**Rail lateral** (como dato, `renderSidebar()`, gating por rol declarativo): `Hoy` · grupo **CRM** · **Ventas** · **Cobranza** · **Catálogo/Inventario** · **Reportes** · **Sistema** · pie (Ver sitio ↗ + bloque de usuario). En móvil colapsa a hamburguesa (ya existe el toggle).

**Configuración** (tras el engranaje, fuera del flujo diario): Negocio (díasPlazo, plazos crédito, métodos de pago) · Facturación (numeración, resoluciones DIAN, datos fiscales) · Vendedoras · Usuarios/RBAC · Preferencias.

**Workspace "Hoy"** (home operativa, no menú): KPIs de cartera (total / **vencida en rojo** / a favor) · bandeja de leads sin contestar con SLA · cumpleaños del día · movimientos recientes · (owner) pendientes de salud.

---

## 5. Modelo de dominio

**Nodo central = `clientes/{id}` (la persona).** Encaja con lo existente; se **extiende, no se reescribe**. Todo lo nuevo de dinero lleva metadatos `id, createdAt, createdBy, updatedAt, _version` (optimistic locking).

- **`clientes/{id}`** [existe] — `nombre, telefono, whatsapp, cumpleanos, notas, vendedoraId, origen, activo, saldoActual` (solo CF), `saldoActualizadoEn`. **Extensiones**: `estadoCuenta` (enum, derivado), `diasVencido` (materializado por CF), `leadId` origen, datos fiscales opcionales del adquiriente (tipoDoc, numDoc, DV).
- **`clientes/{id}/movimientos/{id}`** [existe, append-only] — `tipo {apertura|factura|abono|ajuste|anticipo}`, `monto` (Money), `fecha` (real del hecho, Fase M), `registradoEn` (server), `registradoPor`, `descripcion`, `anulado/anuladoPor/anuladoEn`, `historial[]`. **Fuente de verdad del saldo.**
- **`vendedoras/{id}`** [existe] — `nombre, activa`. Entidad de datos (no usuario).
- **`pieces/{id}`** [existe, PÚBLICO] — catálogo (`name, code, slug, collection, price, images, specs, featured`). **No** lleva stock/costo. Añadir `clasificacionTributaria`, `taxCode`, `unspsc`.
  - **`pieces/{id}/stock`** (PRIVADO, nuevo) — modelo **polimórfico** `tipoStock {unica|lote}`: comunes `estado {disponible|reservado|apartado|vendido}, costo (Money), reservadoPor, reservadoHasta, _version`. Única → 1 unidad + serial/certificado; Lote → `cantidad:int + costoUnitario`.
- **`leads/{id}`** (nuevo) — reemplaza `inquiries`/"Consultas": `contactoNombre/telefono/whatsapp`, `source {web_form|whatsapp|mostrador|manual}`, `status {nuevo|trabajando|calificado|convertido|perdido}`, `slaDueAt`, `pieceOfInterestId`, `consent {}`, `convertedTo {clienteId}`.
- **`conversations/{id}/messages`** (nuevo, diferible) — hilo omnicanal ligado a lead/cliente.
- **`ventas/{id}`** (nuevo) — **orden raíz event-driven**: `clienteId, canal {mostrador|web}, lineItems[{pieceId, stockId, descripcion(snapshot), cantidad, valorUnitario(Money), descuento, taxCode, base, impuestos[], totalLinea}]`, `total (Money), condicionPago {contado|credito|apartado}, plazoDias, vendedoraId, estado`, `facturaId`, `fulfillment {inventario, factura, pago, saldo}` (máquina de estados).
- **`facturas/{id}` (= `{ventaId}`)** (nuevo, DIAN-ready) — ver §7.
- **`pagos/{id}`** (nuevo) — recibo de caja: `clienteId, metodo {efectivo|transferencia|tarjeta}, lineasPago[] (mixto), aplicaciones[{facturaId, monto}], sobranteA (saldo a favor), fecha`. Emite movimiento `abono`.
- **`notasCredito/{id}`** (nuevo) — `notaCreditoDe (facturaId), lineasDevueltas[]` → dispara reverso en `movimientos` + reingreso a inventario.
- **`inventoryMoves/{id}`** (nuevo) — kardex: `pieceId, tipo {entrada|salida_venta|reserva|liberacion|ajuste|merma|devolucion}, cantidad, costoUnitario (Money), motivo, ventaId, usuario, fecha`.
- **`auditLog/{id}`** (nuevo) — rastro inmutable de eventos de dinero/cumplimiento.
- **`crm_aggregates/cartera`** (nuevo) — agregado desnormalizado (dashboard O(1)).
- **`config/{negocio,status,counters}`** [existe] + `counters/{rangoDIAN}` para consecutivos.
- **`failedIngestions/{id}`** (nuevo) — dead-letter (reproceso owner-only).

**Relaciones:** `clientes` = centro. `ventas→clientes`, `ventas→pieces` (líneas), `ventas→facturas` (1:1, id compartido), `facturas←pagos` (N:M vía `aplicaciones`), `pagos→movimientos` (un pago emite un abono), `facturas a crédito→movimientos` (emite "factura"), `leads→clientes` (`convertedTo`), `vendedoras←clientes`, `pieces←inventoryMoves`. **`saldoActual` jamás se escribe directo**: lo deriva la CF desde `movimientos`. Así facturación/ventas/pagos **emiten** movimientos y el CRM los **consume** — sin acoplar la cartera dentro de facturación.

### 5.1 Dinero (`Money`)
Montos = **enteros de COP** (pesos), ya exactos en JS — **sin re-escalar ni migrar** (Consejo §16). `Money { amount:int, currency:'COP' }` solo etiqueta. `fmtCOP` (ya existe) formatea a la vista. Redondeo del IVA **una vez por línea** (no del total): `base = round(bruto/(1+tarifa))`, `IVA = bruto − base` (residual) → subtotales cuadran al centavo (requisito DIAN). Descuento global se prorratea a las líneas antes de base/IVA.

### 5.1.1 Por qué NO hay backfill (Consejo §16)
El plan v2 proponía un backfill `×100` de la cartera; el Consejo Externo lo descartó por **innecesario y de alto riesgo**: tocar datos contables cuadrados es buscarse problemas, y los montos COP ya son enteros exactos. Disciplina a futuro: validar en la frontera de escritura que ningún `monto` lleve fracción de peso. Si alguna vez entra otra moneda/escala, se usa **schema-versioning** (`_moneyV`) con normalización en la capa de lectura — no una migración masiva.

---

## 6. Flujo de eventos / trazabilidad

**Evento raíz: crear `ventas/{id}`** (cliente + líneas + condición de pago) vía Cloud Function *callable* transaccional. En **una** transacción (todos son escrituras Firestore):
1. **Inventario** — `claimStock(stockRef, qty)`: única = guard de estado; lote = check-and-decrement (nunca `increment(-q)` a secas, rechaza cruce por cero). Bloquea si no hay stock. Emite `inventoryMoves`.
2. **Factura** — `facturas/{ventaId}` con consecutivo server-side (§7), IVA desagregado, adquiriente congelado.
3. **Pago / cartera** según `condicionPago`:
   - **Contado** → `pagos/{ventaId}_auto` (recibo) en el mismo acto → abono → **saldo 0, sin cartera** (atómico).
   - **Crédito** → la factura emite movimiento `factura` → **nace la CxC** (`vence = fecha + diasPlazo`). Cobro posterior = recibo → abono.
   - **Apartado** → reserva 30 días + movimiento `anticipo` (pasivo, no contamina cartera). Si caduca (Scheduler) → libera la pieza + el anticipo queda como **saldo a favor**.

Efectos **asíncronos** (solo lo NO-monetario): materializar `estadoCuenta`/`diasVencido`, actualizar `crm_aggregates` del dashboard, FCM. **El `saldoActual` se escribe SÍNCRONO dentro de la transacción** (§6.1, Consejo §16); `recalcSaldoCliente` queda como reconciliador de respaldo.

**Idempotencia**: claves deterministas + `fulfillment.{paso}=done` chequeado en transacción. **Reconciliación** (Scheduler, ver §9.1): recomputa saldos y agregados, verifica factura↔movimiento y pago↔abono; descuadre → `auditLog` + **alerta a Kary (es su negocio) y a Daniel (causa técnica)**. **Trazabilidad**: todo en su libro (append-only, kardex, factura inmutable + nota crédito, recibos), cada escritura con `actorUid/actorEmail`.

### 6.1 Patrón transaccional, límites y estados de error
**Patrón único (decidido):** una Cloud Function *callable* `registrarVenta` ejecuta **una transacción Firestore** que: (1) `claimStock` por línea (update de estado/cantidad, sin creates extra), (2) crea `facturas/{ventaId}`, (3) crea `pagos/{ventaId}_auto` (contado) o emite el movimiento `factura` (crédito) / `anticipo` (apartado), (4) escribe `inventoryMoves/{ventaId}_{lineItemId}`, **(5) recalcula y escribe el `saldoActual` del cliente DENTRO de la misma transacción** (recompute O(M) reusando `computeSaldo()`). **Límite Firestore ~500 escrituras/TX**: una venta de N líneas ≈ 2N+4 escrituras → tope práctico ~200 líneas/venta (holgadísimo para joyería). Solo lo **no-monetario** (`crm_aggregates` del dashboard, FCM) corre async post-commit. **El saldo es síncrono** (Consejo §16): evita el *read-your-writes race* (cobrar → UI recarga → saldo sin cambiar → doble cobro).
**Idempotencia (incluye fraude de consecutivo):** la TX lee `ventas/{id}.fulfillment.{paso}` antes de actuar; si `done`, no repite. El **consecutivo DIAN** se asigna **solo si** `!fulfillment.factura` (lee+incrementa `counters/{rangoDIAN}` en la misma TX) → un reintento **nunca** salta ni duplica número.
**Estados de error (qué ve Kary):** la TX es atómica → o la venta queda **completa** o se **revierte entera** (sin estados a medias en el camino crítico del dinero). Si falla la **materialización async** (p.ej. recálculo de saldo), el descuadre lo detecta la reconciliación → `auditLog`/`failedIngestions` + **alerta de integridad a Kary** (es su dinero) **y a Daniel** (que diagnostica/repara la causa técnica); la venta queda registrada y el saldo se corrige en el siguiente ciclo. Errores de validación (sin stock, línea de crédito excedida) → mensaje claro a Kary **antes** de cobrar.

---

## 7. Facturación DIAN-ready + pagos

La entidad nace con todos los insumos del CUFE aunque la integración sea lo último (una factura emitida no se edita; back-fill imposible). **Tipos** (Daniel confirmó los tres, integrar al final): `factura_electronica`, `tiquete_pos`, `documento_soporte` (compras a informales), más `nota_credito`/`nota_debito` — cada uno con su **resolución y consecutivo** propios.

`facturas/{id}`: `numeracion {resolucionId, prefijo, consecutivo (CF transaccional contra counters/{rangoDIAN}), claveTecnica, vigencia}`, `tipoAmbiente {pruebas|produccion}`, `tipoDocumentoFiscal`, `fechaEmision` (congelada al emitir) + `registradoEn`, `cufe` (null hasta emitir), `xmlUblPath`, `qrData`, `dianStatus {borrador|emitida|validada_dian|rechazada_dian|contingencia|anulada}`, **adquiriente como snapshot inmutable** (tipoDoc, numDoc, DV validado módulo 11, tipoPersona, responsabilidadFiscal, email), `lineItems` tax-aware, totales recomputados server-side. **Anular** = emitir `notaCredito` (consecutivo propio) → reverso en `movimientos` + reingreso a inventario; la factura conserva su número. Contingencia = segundo rango. **Secretos DIAN solo en Secret Manager**, jamás en Firestore ni `VITE_*`.

**Pagos**: recibo separado; pago mixto (`lineasPago[]`) y multi-factura (`aplicaciones[]`); sobrante → saldo a favor.

**Redondeo determinista (DIAN):** por línea `base = round(bruto/(1+tarifa))`, `iva = bruto - base` (el IVA absorbe el centavo residual → `base+iva == bruto` exacto). Cabecera: `totalBase = Σ base`, `totalIVA = Σ iva`, `totalBruto = Σ bruto`; se verifica `totalBase+totalIVA == totalBruto` al centavo. Método: half-up sobre enteros.

**Estados pre-integración DIAN:** mientras la integración del proveedor es "lo último", la factura se emite **localmente** (`dianStatus: local_emitida`) con número+fecha+adquiriente y se imprime como comprobante con aviso "pendiente de validación DIAN"; al conectar el proveedor pasa a `validada_dian` (o `contingencia`). Permite operar facturación antes de la integración **sin rehacer el modelo**.

**Patrón Adapter (Consejo §16):** el schema día-1 guarda la **estructura fiscal natural del negocio** (base/IVA/total por línea, adquiriente, consecutivo, fechas, tipo de documento, inmutabilidad) — necesaria de todos modos — y **NO** se acopla al anexo técnico UBL 2.1. Los campos UBL-específicos (`cufe`, `claveTecnica`, `xmlUblPath`, `qrData`) los produce un **Mapper/Adapter** en la fase de integración (F7-DIAN), que lee la BD y ensambla el XML/JSON que pida el proveedor tecnológico. Así no rigidizamos el modelo hoy ni dependemos de las reglas de agrupación del proveedor (que pueden variar).

---

## 8. Seguridad, RBAC y cumplimiento

- **RBAC por custom claims** (`request.auth.token.role`), escritas por CF (`setCustomUserClaims`); `users/{uid}.role` queda como espejo legible para UI; `getIdToken(true)` tras cambiar rol; `revokeTime` para cortar sesiones de operador desactivado.
- **Frontera de escritura**: colecciones de dinero `write: if false` (solo Admin SDK vía CF). Validación de montos/stock server-side.
- **Append-only real en reglas** (`movimientos`, `auditLog`, facturas emitidas): `delete: if false`; `update` solo transiciones válidas (`anulado false→true`).
- **App Check + ingestión pública por CF** (`submitLead` con `enforceAppCheck`, reCAPTCHA, dedup, rate-limit). `create: if false` directo para `leads/reviews/subscriptions`.
- **Storage rules por rol** (claim) para imágenes de piezas.
- **Ley 1581**: `consent` objeto inmutable `{otorgado, fecha, canal, finalidades[], versionAviso, evidencia}`; `dataRequests/{id}` (ARCO, +10 hábiles); política + aviso publicados; retención fiscal de facturas (~5 años) vs supresión → se anonimiza el perfil, no la factura. Base legal **contractual** para los 344 migrados.
- **Flujo de asignación de rol**: CF `adminSetRole` chequeada por `role==owner`; solo Daniel ve "Cambiar rol" en Configuración › Usuarios; transiciones válidas auditadas (`changedBy/changedAt/revokeTime`). Tras cambiar rol → `getIdToken(true)`.

---

## 9. Observabilidad, respaldo y operación (owner-only)

> **Kary = dueña de la tienda; Daniel = dueño del software.** Kary no **opera** el sistema (errores técnicos, backup, reproceso = Daniel), pero **sí debe enterarse de cualquier descuadre de SU dinero**: las alertas de **integridad financiera** llegan a Kary *y* a Daniel; las de **fallo técnico**, solo a Daniel.

- **Backup**: PITR (7 días) + backup diario programado (retención ~14 semanas) + **restore probado una vez** (runbook). **Bloqueante**: ninguna colección crítica nueva nace sobre datos sin copia.
- **Observabilidad**: alert policy de Cloud Monitoring sobre `execution_count status=error` (email/Telegram) + logging estructurado en cada `catch`. Vista owner-only **"Sistema › Salud"** que lista `failedIngestions` con botón **reprocesar**.
- **CI**: reactivar `firestore-rules-test.yml`; gatear deploy de reglas/índices; **un índice compuesto por pantalla en el mismo PR** (un índice faltante = `FAILED_PRECONDITION` = pantalla en blanco en prod).
- **Listeners**: registry central de `unsubscribe` en `shared.js` + teardown en navegación; ningún handler de `onSnapshot` escribe a Firestore.
- **Backup ≠ gratis**: el PITR de Firestore tiene costo (~$0.15/GB/día) y la retención es infra real. Alternativa **zero-budget**: export programado (Scheduler → Cloud Storage) + retención por lifecycle. Elegir y **presupuestar** explícitamente; el restore probado es pre-requisito (§10.1, PRE-1).

### 9.1 Testing, rendimiento y reconciliación
**Testing (antes de F7):** además de reactivar `firestore-rules-test.yml`, tests **unit + integración** del flujo de dinero en el emulador: transacciones contado/crédito/apartado, **idempotencia multi-reintento**, reconciliación, pago mixto N:M, nota crédito + reverso, y **validación "entero-COP"** en la frontera de escritura. Cobertura mínima ~80% del flujo de dinero. Un índice compuesto faltante debe **romper el build**, no producción.
**Presupuesto de rendimiento (SLA):** búsqueda federada < 500 ms; pintado < 2 s; estimar cartera proyectada (años 3-5) y movimientos/cliente (media/máx) para dimensionar lecturas. **Reemplazar `limit(2000)` mudo** (`crm-service.js:23`, usado en `:35,40,84,118,141`) por **paginación por cursor + alerta cuando `rowcount == limit`**.
**Reconciliación = red de seguridad (no fuente de correctitud, Consejo §16):** como el saldo se calcula **síncrono** dentro de la transacción (§6.1), no hay drift por diseño; la reconciliación es un chequeo de respaldo (p.ej. diario) que recomputa `saldoActual`/`crm_aggregates` desde la fuente de verdad y verifica factura↔movimiento y pago↔abono. Descuadre (no debería ocurrir) > umbral (p.ej. $1M) → alerta inmediata a **Kary y Daniel**; menor → `auditLog`. **Saldo = recompute O(M) síncrono** (trivial a 344 clientes, *race-free*); incremental O(1) solo si un cliente acumulara miles de movimientos. Alerting de errores de Functions entra en F6.
**Índices compuestos (criticidad):** ya (clientes, movimientos, piezas) · F4 (leads por estado+origen+SLA) · F5/F7 (ventas, pagos) · F9 (reportes). Gatear en CI; deploy del índice en el PR de su pantalla (Firestore propaga en background, sin downtime).

---

## 10. Decomposición por fases

Cada fase tendrá su **propio spec → plan → build** (este documento es el norte, no el spec de implementación). **F-CHASIS se descompone** para entregar valor visible pronto (la queja del cliente) sin sacrificar integridad: lo de escala/cumplimiento se difiere a F6, dejando en los pre-requisitos solo lo que protege los datos.

### 10.1 Pre-requisitos (antes de tocar dinero nuevo)
- **PRE-1 Backup operativo** (§9): export programado a Cloud Storage (alternativa zero-cost al PITR pago) + **restore probado**. Bloqueante: nada nuevo sobre datos sin copia.
- **PRE-2 ~~Backfill Money~~ ELIMINADO** (Consejo §16): no hay migración; los montos COP ya son enteros exactos. Solo se añade validación "entero-COP" en la frontera de escritura.
- **PRE-3 Append-only real en reglas** + arreglar bugs §1.1.
- **PRE-4 RBAC por custom claims** (§8) + flujo de asignación de rol (§10.4).

### 10.2 Fases

| Fase | Entrega | Depende de |
|---|---|---|
| **F-CHASIS-A** (MVP visible, ~2-3 sem) | Shell IA (`renderSidebar()` como dato + grupos + placeholders; **promover Clientes**; **sacar Vendedoras** de Config) · barra superior (búsqueda federada, +Crear, notificaciones, engranaje, perfil) · quick wins (`adm-money`+enteros, `#confirm-dialog`, hex→tokens, tablas responsive mínimas) · integridad (unsubscribe + detector de truncado audible) | PRE-1..4 |
| **F1** | Dominio `estadoCuenta` + centralizar signo/color/etiqueta (hoy duplicado) | F-CHASIS-A |
| **F2** | Fase M: `movimientos.fecha` real + `historial[]` + consumir `diasPlazo` (aging en vivo en F5; materialización de `diasVencido` a F6) | F1 |
| **F3** | Design-system de datos completo (no bloquea F4/F5; lo mínimo va en F-CHASIS-A) | F-CHASIS-A |
| **F4-leads** | Bandeja: `leads` + ingestión por CF (normaliza, dedup, consent, dead-letter) + UI (estados, origen, SLA, convertir a cliente). **Sin** omnicanal | F1, F-CHASIS-A |
| **F4-comms** (diferible) | `conversations` omnicanal (WhatsApp 1-clic) | F4-leads |
| **F5** | CxC pro: KPI cartera vencida + chips/filtros/orden + aging (en vivo) + por vendedora + **control de crédito** (§10.4) | F1, F2 |
| **F6** | Escala + **hardening diferido**: `crm_aggregates` + paginación por cursor + índices + **App Check** + observabilidad/alertas + reconciliación de respaldo + vista Salud owner-only · *(saldo incremental O(1) solo si la escala lo exige, §16)* | F2, F5 |
| **F7-core** | Ventas + Facturación (local) + Pagos: entidad `ventas` + flujo §6.1 (contado/crédito/apartado) + idempotencia + frontera de escritura + **devoluciones/cambios** + **comisiones** (§10.4) | F6, F2, **Consejo Externo** |
| **F7-DIAN** (diferible, "lo último") | Integración del proveedor DIAN (CUFE/XML/validación) | F7-core |
| **F8** | Inventario: stock por pieza (único+lote) + estados + kardex + claim transaccional + bloqueo sin-stock + **certificados** + **una bodega** (§10.4) | F7-core |
| **F9** | Reportes: aging, ventas por canal/vendedora, recaudo, rotación, margen por pieza, export CSV (sobre agregados O(1)) | F6, F7, F8 |
| **(último)** | F7-DIAN · canal web de ventas | F7, F8 |

### 10.3 Grafo de dependencias
```
PRE-1..4 → F-CHASIS-A ─┬─ F1 → F2 ─┬───────────→ F5 → F6 → F7-core ─┬─ F8 → F9
                       │           │                                 └─ F7-DIAN
                       ├─ F3       └─ F4-leads → F4-comms
                       └─ (quick wins visibles ya)
```

### 10.4 Decisiones comerciales y de alcance (decididas en el norte, detalladas por fase)
- **Control de crédito**: `clientes.lineaCredito` + `diasPlazoCliente` (hereda `config` si nulo). Venta a crédito valida `saldo + venta ≤ lineaCredito`, si no bloquea/alerta (F5/F7).
- **Comisiones de vendedora**: `vendedoras.comisionTasa` (+ `comisionPorPieza?`); agregado mensual por CF; pago a vendedora como documento separado (F7/F9).
- **Devoluciones/cambios**: nota crédito (reverso + reingreso a stock) + venta nueva, event-driven; sobrante → saldo a favor (F7-core).
- **Certificados gemológicos**: `stock.certificados[] {numero, emisor, fechaEmision, url, asociadoA, anuladoEn}`; requerido pre-venta si pieza única; cadena certificado↔factura↔cliente inmutable (F8).
- **Bodega**: **una sola** (decisión adoptada; simplifica `claimStock`). Multi-bodega = evolución futura (entidad `bodegas` + traspasos como `inventoryMoves tipo=transferencia`).
- **SLA de leads**: web_form 24 h · whatsapp 12 h · mostrador 48 h; vencido → badge + notificación; +24 h sin respuesta → escala a owner (F4).
- **Anulación auditada**: transición `anulado:true` exige rol owner/admin + `motivoAnulacion` + registro en `auditLog` (reglas en PRE-3 / flujo en F7).

---

## 11. Evolución C → B (sin reescribir)
`renderSidebar()` lee un array de **grupos** → los pinta todos en un rail. Esos grupos **ya son las futuras áreas**. Cuando un grupo supere ~6-8 ítems o existan >5 grupos con contenido real, se añade un **conmutador de área** (top bar / columna estrecha, patrón Odoo/Alegra): selecciona área → filtra el rail a ese grupo. **Cero cambio de datos ni de rutas** (deep-links intactos): solo cambia el componente de render.

---

## 12. Decisiones Fuertes → Consejo Externo (`docs/15`)
> ✅ **REVISADAS por el Consejo Externo (Gemini 3.1 Pro) el 2026-06-07 — ver §16 para qué se adoptó/refutó/cambió.** Cambios netos: saldo **síncrono** (no async), **sin backfill** de Money, **recompute O(M)** (no incremental prematuro), DIAN por **Adapter** (no UBL en el schema hoy).

Lista original de decisiones caras de revertir (antes de **congelar el modelo de datos**, gate previo a F7):
1. Entidad raíz = **VENTA** (no factura ni pago); toda la trazabilidad cuelga de ahí.
2. **Frontera de escritura** financiera por Cloud Function (front solo lee).
3. ~~Money entero + backfill `×100`~~ → §16: **sin backfill** (COP ya entero exacto en JS).
4. **Factura DIAN-ready** (consecutivo server-side, adquiriente snapshot, impuestos por línea, contingencia).
5. **Claim de stock transaccional** (único + lote) + **idempotencia**.
6. ~~Saldo incremental~~ → §16: **recompute O(M) síncrono** (incremental solo a futuro si la escala lo exige).
7. **Backup/PITR** antes de crear colecciones críticas.
8. **RBAC a custom claims**.
9. **App Check + ingestión por CF**.
10. **Anticipos/notas crédito/pagos mixtos** como entidades (no flags).

---

## 13. Decisiones resueltas (Daniel, 2026-06-07) y supuestos
- **DIAN**: emite factura electrónica + tiquete POS + documento soporte; **integración al final**.
- **IVA incluido** (default 19%, desagregar por línea).
- **Moneda**: solo **COP**.
- **Apartado** (no informado → estándar adoptado): reserva **30 días**; si no completa → anticipo a **saldo a favor**. *(Afinar con Daniel.)*
- **Migrados**: 344 = únicos activos con deuda vigente (base contractual); ajustes los hace Kary.
- **Roles de propiedad**: **Kary = dueña de la tienda** (su negocio, su dinero); **Daniel = dueño del software** (ingeniero). Errores técnicos/backup/reproceso = Daniel; **descuadre financiero = Kary también lo sabe** (es su plata) + Daniel arregla la causa.

## 14. No-objetivos / YAGNI
- Sin microservicios/k8s/gRPC: serverless event-driven.
- Sin multi-moneda real (COP), sin feeds FX, sin bot/LLM en la bandeja (clasificación determinista primero).
- Sin app de vendedora (es dato). Sin multi-tenant (un solo negocio).
- El conmutador de áreas (B) **no** se construye hasta que los módulos lo justifiquen.

---

## 15. Próximos pasos
1. **Cerrados los bloqueantes** de la revisión adversarial (§5.1.1, §6.1, §7 redondeo, §9.1, decomposición §10) — incorporados en esta versión (v2).
2. **Consejo Externo** sobre §12 (ventana ~1 sem; puede correr en paralelo a F-CHASIS-A; **obligatorio antes de F7**). Ideal: revisar este documento completo.
3. Spec de implementación de **F-CHASIS-A** (writing-plans) → construir por tareas con subagentes + doble revisión (como Fase R).
4. Consolidar este norte en el cerebro: `50-ARQUITECTURA` (resumen) + ADR en `99` + fila en `00-INDICE` + foco en `10`.

---

## 16. Resultado del Consejo Externo (Gemini 3.1 Pro · 2026-06-07)
> Decisión TOP (modelo de datos de dinero). Provider `docs/15 §0`. **Anti-anclaje**: el prompt se envió SIN la postura de Claude. La respuesta se evaluó como **peer review** (no oráculo): adoptar lo correcto, refutar con razón. Daniel corrió el prompt y trajo la respuesta.

**✅ Adoptado (mejora el diseño):**
1. **Saldo síncrono en la transacción** (no async). Razón del consejo: *read-your-writes race* → la operadora cobra, la UI recarga antes del trigger, el saldo se ve igual → doble cobro. → §2.2, §6.1 reescritos.
2. **Mantener recompute O(M)**, no incremental prematuro: a 344 clientes es trivial, puro y race-free. (Revierte una recomendación del red-team interno; el consejo acierta para esta escala.) → §9.1.
3. **Sin backfill de Money**: el COP no usa centavos → montos ya enteros exactos en JS; migrar $506M es riesgo innecesario. → §2.5, §5.1, §5.1.1, §10.1 PRE-2 eliminado.
4. **DIAN por Adapter**: guardar estructura fiscal natural + Mapper a UBL en la integración; no acoplar el schema al anexo UBL hoy. → §7.

**❌ Refutado (con razón):**
5. **`×10000` / `decimal.js`**: innecesarios. Con montos COP enteros (exactos) y la base de IVA por **residual** (`IVA = bruto − base`), no hay pérdida de precisión. Sí se adopta la preocupación de fondo: política de redondeo rigurosa (ya en §5.1/§7).

**✓ Confirmado:** CRUD transaccional sobre event-sourcing (§6.1). Límites conocidos aceptados: consecutivo 1-write/seg (irrelevante a mano), 500 escrituras/TX (~200 líneas/venta), reglas del proveedor DIAN (las absorbe el Adapter).

**Neto:** arquitectura **más simple y más correcta** a la misma escala; se eliminaron dos workstreams riesgosos (backfill + maquinaria async/reconciliación-como-requisito). Pendiente: cuando se cierre F-CHASIS-A, volcar esto como ADR en `99` + fila en `00-INDICE`.
