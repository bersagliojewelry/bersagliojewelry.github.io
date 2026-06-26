# B1 — El Mostrador (corazón del comercio) · Diseño detallado

> **SSoT de ejecución de B1.** Aterriza la arquitectura YA convergida del Plan Maestro
> (`2026-06-25-plan-maestro-comercio-v3.md` §3-§6 + §10 Gemini) en modelo de datos +
> contratos de Cloud Functions + reglas + secuencia. **Diseño, no código** (arquitecto
> §3.6: diseñar antes de codear). `[OPUS-4.8]`.
>
> **Regla de oro de B1:** un `Pedido` solo lo crea/muta una **Cloud Function callable**
> (Admin SDK). El navegador/POS manda INSUMOS; el servidor lee `valor-gramo`, recalcula
> y persiste. El stock se cierra con UN candado: el doc de la pieza, en `runTransaction`.

---

## 0. Por qué mostrador primero (1A)
Kary YA vende en el mostrador hoy (presencial). El pedido presencial NO depende de pasarela
ni de cuenta de cliente → es el camino más corto a "registrar la venta una vez" y deja montada
TODA la maquinaria (pedido por CF + stock atómico + caja + bruto/neto) que luego reusan web y
WhatsApp (canal = atributo). Secuencia: **1A mostrador → 1B cobro Wompi → 1C cuenta de cliente.**

## 1. Modelo de datos (límites de módulo)

### 1.1 `pieces` (extensión aditiva — el candado de stock)
Campos NUEVOS (additivos, no rompen lectura pública; default tolerante):
- `estado`: `'disponible' | 'reservada' | 'vendida'` (default `'disponible'` si ausente).
- `reservaId`: string|null — id del pedido/cotización que la tiene tomada.
- `reservaExpira`: Timestamp|null — **serverTimestamp**, árbitro del TTL (NUNCA reloj cliente).
- `stockType`: `'finito' | 'encargo'` (default `'finito'`). `encargo` = se fabrica, no bloquea unidad.
- `cantidad`: int (default 1; alta joyería = pieza única = 1). Para `encargo`/insumos > 1.
- `gender`: `'mujer'|'hombre'|'unisex'|null` · `certificacion: {tipo,entidad,numero}|null` (clasificación spec §4).
> El público NO lee `reserva*`/`estado` para decidir (lo hace la CF en transacción). El catálogo
> solo oculta `vendida` si Kary quiere (display), no es la fuente de verdad del stock.

### 1.2 `pedidos` (NUEVO — append-only, escritor único = CF)
```
pedidos/{id}:
  numero            // correlativo legible (CF lo asigna; ver §3.6)
  canal             // 'pos' | 'web' | 'whatsapp'         (atributo, MISMA entidad)
  medio             // 'efectivo'|'wompi'|'transferencia'|'addi'  (del pago; ver pagos)
  estado            // máquina de estados §2.3
  clienteRef        // ref a clientes/{id} (CRM) — opcional (invitado permitido)
  customerUid       // uid self-service — opcional (1C)
  items: [ { pieceId, slug, nombre, ... snapshot ... } ]
  desglose          // SNAPSHOT INMUTABLE (§1.5)
  fiscal: { base, iva, total }        // enteros COP, suman exacto
  montoBruto        // lo que paga el cliente (Gemini §10.5)
  netoEsperado      // bruto − comisión Wompi − retenciones (parámetros del contador)
  entrega: { tipo:'tienda'|'domicilio', guia?, transportadora?, flete? }
  a_medida          // bool (excepción retracto Ley 1480)
  autor             // uid de Kary (quién registró)
  createdAt, updatedAt
  ajustes: []       // notas append-only (anular≠borrar, reusa CRM §42/§43)
```

### 1.3 `pedidos/{id}/pagos/{pid}` (NUEVO — 1..N, reusa movimientos de cartera CRM)
Un pedido puede tener anticipo + abonos + saldo. Cada pago: `{ medio, monto, fecha, comprobanteRef?, tipo:'anticipo'|'abono'|'saldo', autor }`. **El export separa recibos de caja (anticipos) de la venta final** (IVA causado sobre lo facturado/entregado, no sobre el anticipo) — Gemini §10.6.

### 1.4 Valor del gramo — INPUT, NO config almacenada (CORREGIDO Daniel 2026-06-26)
El precio del oro **VARÍA** → el valor del gramo **NO se guarda fijo**; es un **INPUT que Kary ingresa
al momento** de calcular/facturar (campo en la calculadora, junto al peso). → **NO existe `config/precios`
con valor-gramo almacenado.** [Futuro opcional: guardar el ÚLTIMO valor usado como conveniencia de
auto-llenado, NUNCA como árbitro.] Implicación de seguridad: ya no hay "margen oculto server-side" que
proteger — la cotización es client-side (calculadora); la integridad del dinero se garantiza al CREAR el
pedido (paso 3), donde la CF RE-CALCULA `peso × valor_gramo + mano` con los insumos de Kary y lo congela
como snapshot inmutable (§1.5).

### 1.5 `desglose` — snapshot inmutable (utilidad real)
Congela en el pedido: `pesoCobrado` (g), `valorGramoUsado` (número), `manoObra`, `costoDelDia`
(para utilidad real), subtotal, iva, total, fecha, autor. **Merma** (Gemini §10.2): `pesoEntregado`
se registra en despacho; `pesoCobrado − pesoEntregado` = merma controlada. Inmutabilidad por CAPAS
(las reglas NO aplican al Admin SDK): (a) reglas para el cliente; (b) la CF no expone update de
campos monetarios; (c) corrección = asiento nuevo append-only (nota de ajuste que referencia el original).

### 1.6 `arqueo` / Cierre Z (NUEVO — núcleo de la "herramienta de confianza")
`arqueo/{turnoId}: { aperturaTs, cierreTs, autor, esperadoPorMedio:{efectivo,...}, declaradoEfectivo, descuadre }`.
Kary declara el efectivo físico al cierre → el sistema compara con lo esperado → descuadre detectado.

## 2. Stock atómico + reserva (el corazón de la concurrencia)

### 2.1 Candado = el doc de la pieza
TODOS los caminos (web/WhatsApp/POS) ejecutan `runTransaction` sobre `pieces/{id}`: leen `estado`,
validan, escriben atómico. "Mostrador gana sobre reserva sin pago" se decide DENTRO de la transacción.
La reserva NO vive en colección aparte.

### 2.2 TTL por comparación de timestamp server-side
En cada lectura transaccional: una reserva está viva si `reservaExpira > now()` (`now` = server time).
Ventana corta (~10-15 min). El TTL nativo de Firestore solo limpia basura, jamás es el árbitro.

### 2.3 Máquina de estados de pago (incluye pasarela asíncrona — Gemini §10.1)
`creado → (PAGO_INICIADO_PASARELA) → pago_por_verificar → pagado → preparacion → despacho|listo → entregado`.
- **`PAGO_INICIADO_PASARELA`** (BLOQUEANTE Gemini): PSE/Nequi tardan hasta 3h → la reserva corta NO sirve.
  Este estado mantiene la pieza BLOQUEADA hasta que el webhook resuelva (o expire la transacción Wompi).
  El POS muestra alerta "pieza en pago online, NO vender". El webhook, al confirmar, **re-chequea stock
  atómico**; si ya se vendió → marca para **reembolso**, no despacha (link WhatsApp "zombi").
- `pagado` SOLO lo confirma Kary tras ver el dinero (regla dura; no se despacha sin ver la plata).
  Doble visto bueno de Daniel sobre umbral (reusa SoD del CRM).

## 3. Contratos de Cloud Functions (callables — único escritor)
> `pedidos` y `pieces.estado/reserva*` tienen `allow write: if false` para todo rol → solo el Admin SDK
> de estas CF escribe. El cliente/POS manda SOLO insumos; la CF valida claim (owner/admin/catálogo según
> acción), recalcula server-side y persiste. Firmas (a refinar al codear, verificar APIs CRM reusadas):

- **Cotización rápida = CLIENT-SIDE** (CORREGIDO Daniel 2026-06-26, §1.4): como Kary INGRESA el valor del
  gramo, no hay secreto server-side → la calculadora es client-side (`js/admin/calculadora.js`, función PURA
  `calcularPrecio({valorGramo,peso,manoObra})` = `peso×gramo+mano`, enteros COP). **NO necesita CF.** ✅ PASO 2
  HECHO (§124): modal en la topbar de Piezas. La recomputación server-side se mantiene en `crearPedido`
  (paso 3) para el snapshot inmutable + integridad.
- **`crearPedido({ items, canal, medio, peso?, manoObra?, entrega, clienteRef?, aMedida? })` → `{ pedidoId, numero }`**:
  `runTransaction` → valida stock de cada item, marca `reservada`/`vendida`, lee valor-gramo, recalcula
  total, persiste pedido + desglose inmutable + 1er pago si aplica. Si valor-gramo cambió vs el preview
  → reconfirmación explícita de Kary.
- **`registrarPago({ pedidoId, medio, monto, tipo, comprobanteRef? })` → `{ saldo }`**: agrega pago 1..N;
  recalcula saldo; `pagado` cuando suma ≥ total (lo confirma Kary).
- **`anularPedido({ pedidoId, motivo })` → `{ ok }`** (VOID, Gemini §10.4): flujo atómico (solo Kary)
  que REINTEGRA la pieza al catálogo (`estado→disponible`) + traza (nota de ajuste). Inmutable ≠ no-anulable.
- **`cierreCaja({ turnoId, declaradoEfectivo })` → `{ esperado, descuadre }`**: arqueo del turno.
- **(1B) webhook Wompi**: SHA256 firmado + idempotente; verifica `GET /v1/transactions/{id}`;
  re-chequea stock atómico; gate de cupo server-side ($2.5M/$10M Persona Natural).

## 4. Precisión del dinero (no negociable)
Enteros COP; redondeo UNA vez al final (regla fija), server-side; IVA discriminado que sume exacto.
Documentar decimales del peso y orden de operaciones. **Bruto/Neto** (Gemini §10.5): `netoEsperado =
montoBruto − comisión Wompi (2,65%+$700+IVA) − retenciones (ReteFuente/ReteICA por parámetro del
contador)`. El export al contador lo incluye (sin esto el banco no cuadra).

## 5. Reglas (firestore.rules)
- `pedidos`: `allow read` dueño/staff; `allow create,update,delete: if false` (solo Admin SDK/CF).
- `pieces`: `estado`/`reserva*` NO editables por el cliente (la CF los maneja); resto = rol catálogo (§115/§117).
- `config/precios`: `read` solo owner/admin (no exponer margen); `write` solo owner/admin, auditado.
- Comprobantes en Storage: ruta namespaced por pedido/uid, read solo dueño/staff, write validada
  (tipo/tamaño), nunca público/listable.

## 6. Costo de reads / `catalogo.json` (Gemini §10.8)
El público NO lee Firestore en vivo (hoy `onSnapshot` = riesgo de costo si viraliza). Al guardar Kary,
una CF compila `catalogo.json` → Storage/CDN; el público lo lee gratis; Firestore solo en checkout/login.
Encaja con el SSG (§116) + SWR (§108/§111). Republish-on-change (segundos); live-listener reservado a admin/checkout.

## 7. Secuencia de construcción (cada paso: ventana de prueba en EMULADOR + bugfix)
1. **`pieces` extensión** (estado/reserva/stockType/cantidad/clasificación) — aditivo, reglas + admin form.
2. **Calculadora client-side** ✅ §124 (`calcularPrecio` puro + modal en Piezas; valor-gramo = input de Kary, §1.4; NO CF). [Recomputación server-side → paso 3.]
3. **`crearPedido` CF** (stock atómico + desglose inmutable) + UI mostrador + `pedidos` reglas.
4. **`registrarPago` + pagos 1..N** (reusa movimientos cartera CRM) + comprobante "por verificar"≠"pagado".
5. **`anularPedido` (VOID)** + **`cierreCaja`/arqueo** (Cierre Z).
6. **Bruto/neto + export básico al contador** (obligación desde la 1ª venta — NO esperar a B3).
7. **`catalogo.json` a CDN** (desacople costo/tiempo-real).
> Cada paso se prueba con `functions/seed-piezas.mjs` en emulador (L-58) + node:tests de CF (patrón saldo/reconciliacion).

## 8. Decisiones del dueño (FIJADAS por Daniel 2026-06-26)
- ❄️ **ADDI/Sistecrédito = CONGELADO**: NO integrar todavía — Bersaglio aún no está registrado en ADDI;
  **Kary debe hacer el proceso de vinculación**. Queda inerte hasta que **Daniel avise**. (No diseñar para ADDI ahora.)
- ❌ **Persona Jurídica = NO**: la cuenta es de **Kary (Persona Natural)**; se trabaja con **su cuenta Wompi**
  tal cual, con sus topes ($2.5M/transacción, $10M/día). **A las 20 transacciones** se solicita aumento de cupo;
  **Daniel avisará cuando lo aumenten** para que Claude ajuste los gates server-side. Por ahora, los topes PN del plan.
- 🔲 **Parámetros de retención** (ReteFuente/ReteICA) — los da el contador (cuando lleguemos a bruto/neto).
- 🟡 **Ventana exacta de reserva TTL** y umbral de doble-VB — decido como arquitecto (reversible);
  confirmo el umbral $ con Daniel al llegar.
- 🧪 **Pruebas en la WEB REAL** (Daniel 2026-06-26): fase pre-lanzamiento, pocos clientes → TODAS las pruebas
  se hacen en prod (no emulador); es la única garantía. Las 9 piezas de prueba (`seedDemo:true`) viven en prod
  hasta que Kary cargue el catálogo real (limpieza: borrar `pieces` con `seedDemo==true`). Excepción explícita
  a "nada demo en prod" SOLO durante esta fase. → ADR §121.
- 🛰️ Si al detallar `pedidos`/`pagos` aparece un fork caro-de-revertir NO cubierto por la arquitectura
  convergida → **W-11** (comité + consejo externo) ANTES de codear (§3.7).

## Checklist (evidencia al ejecutar)
- [x] `pieces` extendido (stockType/cantidad/gender, aditivo) — ADR §122; `pieceClassValid` DESPLEGADA a prod (read-back OK); 201 tests rules + build verdes; `estado/reserva*` diferidos al CF
- [x] Calculadora de precio (client) — §124: `calcularPrecio` puro (`peso×gramo+mano`) + modal en Piezas; 6 tests + build verdes; valor-gramo = input de Kary (§1.4, varía)
- [x] `crearPedido` CF con stock atómico + test de doble-venta (runTransaction) — §125: `pedidos-core.js` (núcleo testeable) + wrapper onCall; 6 tests integración (doble-venta bloqueada, idempotencia, dinero). **CF DESPLEGADA a prod (§126)**
- [x] `pedidos` reglas (`create:false`) + `pieceStockLocked` (estado CF-only) + test rules — §125: 206/206; DESPLEGADAS a prod
- [x] **POS UI "Mostrador"** (`admin-pos.html` + `js/admin/pos.js` + `js/pedidos-service.js`) que llama `crearPedido` — §126: UI ESPEJA a la CF (precio fijo o por peso, `calcularPrecio` reusado); menú `role:catalogo`; "Ventas recientes"; v37; commit `02ab6a7`. Pend: verif. en vivo tras merge de Daniel
- [x] **paso 4a — `confirmarPago`** (por_verificar→pagado, "vi la plata", SoD) — §128: CF `confirmarPagoCore` + botón "Confirmar pago" en Ventas recientes; 9/9 integración; **DESPLEGADA a prod** (`ba6da22`)
- [ ] **paso 4b — `registrarPago` 1..N abonos/apartados** — PEND DECISIÓN (§128.4 / TODO-39): si el mostrador aparta piezas (anticipo+saldo), el saldo = CARTERA existente → reusar, NO pagos-en-pedido paralelos. Preguntar a Daniel + link pedido↔cliente
- [ ] `anularPedido` (VOID reintegra pieza) + `cierreCaja` (arqueo)
- [ ] bruto/neto + export contador
- [ ] `catalogo.json` a CDN
- [ ] verificado en emulador (seed) + node:tests de CF
