# Wompi Checkout Web (Fase 2) — DISEÑO (Decisión Fuerte · DINERO · TODO-42)

> **Estado**: DISEÑO candidato (arquitecto). Decisión Fuerte (dinero + seguridad + toca POS/stock en prod + reglas).
> **Autor**: Claude `[OPUS-4.8]` (2026-06-28). **Pipeline W-11**: Fase A (evidencia) ✅ · Fase B (comité+consejo) PENDIENTE · mockup PENDIENTE · gate live PENDIENTE.
> **Alcance fijado por Daniel (2026-06-28)**: cobro web = **"Comprar ahora", UNA pieza por pago** (no carrito multi-pieza).
> **SSoT relacionados**: `2026-06-26-modelo-inventario-multitipo-design.md §11.4(F2)/§12.2(C3,C5,D3,D4)` (motor ya deliberado) · `2026-06-25-plan-maestro-comercio-v3.md §6(matriz pago)/§136(async)/§140(bruto-neto)`. `[[project_comercio_pagos]]`.

---

## 1. Objetivo
La web cobra sola: una pieza con precio, stock y `visibilidad:publica`, ≤ $2.5M, se paga con Wompi (tarjeta/PSE/Nequi) sin intervención manual. El mostrador (B1) ya cobra; esto agrega el canal **web** sobre el MISMO candado de stock y el MISMO modelo de `pedidos`. Visión: "como Mercado Libre" (`§11.0` del modelo de inventario).

## 2. Evidencia verificada (Fase A — ground truth)

### 2.1 Lo que YA existe (no reinventar)
- **`crearPedido`** (`functions/pedidos.js:30`, `pedidos-core.js`, `onCall invoker:public`): único escritor de `pedidos`; **candado atómico en la pieza** (`runTransaction`); **total recalculado server-side**; `estado` derivado del `medio`. **Ya acepta `canal ∈ {pos,web,whatsapp}` y `medio ∈ {efectivo,transferencia,wompi,addi}`** (`pedidos-core.js:12-13`). Hoy decrementa `cantidad` (`consumioStock`).
- **`confirmarPago`** (`pedidos.js:42`): flipea `pago_por_verificar → pagado`, idempotente, SoD (solo CF muta estado).
- **`anularPedido`** (`pedidos.js:54`): `anulado` append-only + reintegra stock (`increment(+1)`), idempotente.
- **`cierreCaja`** (`pedidos.js:67`): arqueo Z; `esperadoPorMedio` ya incluye `wompi`.
- **Reglas** (`firestore.rules`): `pedidos` create/update/delete = `false` (solo Admin SDK); `pieces.{cantidad,estado,reservaId,reservaExpira}` = CF-only (`pieceStockLocked`); `/pieces` read blinda `visibilidad:privada` (D5).
- **Campos legacy listos**: `pieces.reservaId` y `pieces.reservaExpira` **existen pero NUNCA se usan** → los activa F2.
- **Runtime**: Node 22, firebase-functions ^7, firebase-admin ^13.
- **Frontend**: `js/pages/carrito.js` stepper 3 pasos; paso 3 = 3 opciones OFFLINE (WhatsApp/transferencia/asesor) vía `confirmOrder()`; el carrito (`js/core/cart.js`) guarda solo `{slug, qty}` (sin precios → bien).

### 2.2 Lo que FALTA construir
1. **Iniciar pago web** (reservar + firmar): crear pedido `pago_pendiente` + reservar pieza (TTL) + firma de integridad.
2. **Webhook receptor** (HTTP) `confirmarPagoWompi`: valida firma Eventos + idempotencia + re-consulta API Wompi + valida monto → marca pagado / libera.
3. **Reaper** (Cloud Scheduler) `liberarReservasVencidas`: libera reservas no pagadas vencidas.
4. **Pantalla de pago** (4ª opción "Pagar ahora" en paso 3) + Widget Wompi.
5. **`forzarConfirmarPago`** (owner-only, override de emergencia) — menor.

## 3. Flujo end-to-end (Comprar ahora, 1 pieza)
1. Cliente en ficha/carrito con **1 pieza elegible** (precio>0, `finito*` con stock o disponible, `visibilidad:publica`, total ≤ $2.5M) → botón **"Pagar ahora"** en paso 3.
2. Frontend → CF **`iniciarPagoWeb({ pieceId, shipping })`**:
   - `runTransaction` sobre la pieza: precondición (disponible/stock); **reserva** = `cantidad increment(-1)` + `reservaId=pedidoId` + `reservaExpira`.
   - Crea `pedidos/{pedidoId}` `estado:'pago_pendiente'`, `canal:'web'`, `medio:'wompi'`, `total` (recalculado del **doc VIVO** de la pieza, NO `catalogo.json` — §12.2 escala F2), `desglose` snapshot, `reference=pedidoId`.
   - Valida tope ≤ $2.5M server-side (rechaza si excede; mensaje "coordinar con asesor").
   - Genera **firma de integridad** `SHA256(reference + amount_in_cents + currency('COP') + [expiration_time] + integritySecret_TEST)` (hex). `amount_in_cents = total*100`.
   - Devuelve `{ reference, amount_in_cents, currency, signature, publicKey, redirectUrl, expirationTime }`.
3. Frontend abre **Widget de Wompi** (Web Checkout embebido) con esos datos. Cliente paga (tarjeta/PSE/Nequi).
4. Wompi → **webhook** `confirmarPagoWompi` (HTTP público):
   - Valida **firma del evento** (secreto Eventos; HMAC) → si falla `401`.
   - **Idempotencia** por `transaction.id` (registro `webhookEvents/{id}` o check estado).
   - **Re-consulta** `GET /v1/transactions/{id}` (source of truth — no confiar en el payload).
   - Valida `amount_in_cents == pedido.total*100` y `reference == pedidoId`.
   - Máquina de estados: `APPROVED` (solo desde `pago_pendiente`) → `pagado` + limpia `reservaExpira` (queda vendida). `DECLINED/VOIDED/ERROR` → libera reserva (`liberarReserva`) + pedido `cancelado`. Tardío sobre reserva ya liberada → `pagado_sin_stock`/`a_revisar` (NUNCA revende auto).
5. **Redirect informativo** del cliente a `gracias.html?ref=` (la verdad la da el webhook, no el redirect — §12.2 C3).
6. **Reaper** (Cloud Scheduler ~cada 1-2 min): `pedidos` `pago_pendiente` con `reservaExpira` vencido + GRACE (2-3 min) → re-consulta Wompi (¿pagó tarde?) → si no, `liberarReserva` (`increment(+1)`) + pedido `expirado`. Fn única `liberarReserva(pedido)` compartida con `anular` (evita doble +1).

## 4. Decisiones de arquitectura (candidatas → comité)
- **D-W1 · Estado web `pago_pendiente`** (nuevo, distinto del `pago_por_verificar` del mostrador). El reaper SOLO toca `pago_pendiente`; el mostrador (`pago_por_verificar` = "vi la plata pendiente") nunca expira (Kary presente). Aditivo al enum de estados.
- **D-W2 · TTL de reserva ligado a la transacción Wompi, NO 15 min fijos** (⚠️ resuelve §136 BLOQUEANTE): tarjeta = síncrono (segundos); **PSE/Nequi = asíncrono hasta 3h** → una reserva de 15 min libera la pieza mientras el cliente aún paga = doble venta. Fix: `reservaExpira = expiration_time` de la transacción Wompi; el reaper, al vencer, **re-consulta Wompi antes de liberar**. Unifica síncrono y async sin un estado aparte.
- **D-W3 · Widget embebido** (Web Checkout Wompi) — cliente paga sin salir del sitio (marca/UX) > redirect.
- **D-W4 · Monto y validación desde el doc VIVO de la pieza** (no `catalogo.json` horneado, que queda stale — §12.2).
- **D-W5 · Webhook = source of truth**; redirect solo informativo; re-consulta API + valida monto server-side (C3).
- **D-W6 · `forcePosOverride` respeta pago** (D4): el mostrador roba unidad SOLO si la reserva web está `pago_pendiente`; jamás sobre `pagado`.
- **D-W7 · Secretos en Secret Manager / config de Functions** (privada TEST + Integridad TEST + Eventos TEST), NUNCA en repo. Frontend recibe del CF lo que necesita (no expone secretos). Llave pública puede ir en `VITE_` (es pública).
- **D-W8 · Bruto/neto** (§140): el pedido web registra `montoBruto` (lo que paga el cliente); `netoEsperado` = bruto − comisión Wompi (~2,65%+$700+IVA) − retenciones (param contador). Reusa lo del mostrador.

## 5. IAP (Impact Analysis Previo)
- **(A) Modificar/crear**:
  - `functions/`: nuevas CF `iniciarPagoWeb` (callable public), `confirmarPagoWompi` (HTTP), `liberarReservasVencidas` (scheduler), `liberarReserva` (helper), `forzarConfirmarPago` (callable owner). Posible refactor: extraer de `confirmarPago`/`anularPedido` la lógica compartida (no romper firmas).
  - `firestore.rules`: estado `pago_pendiente` (derivación), `reservaExpira` ya CF-only; nada que abrir al cliente. **Deploy MANUAL (L-22).**
  - `js/pages/carrito.js`: 4ª opción de pago "Pagar ahora" + rama Wompi en `confirmOrder()` (llama `iniciarPagoWeb` → abre widget). `js/pieza.js`: botón directo "Pagar ahora" (opcional).
  - Config Wompi panel: **URL de Eventos** = URL del webhook (`confirmarPagoWompi`).
  - `firestore.indexes.json`: índice `pedidos` por `estado` + `reservaExpira` (para el reaper).
- **(B) INTACTOS**: `crearPedido`/`confirmarPago`/`anularPedido`/`cierreCaja` (firmas y callsites POS `pos.js:232/307/323/360`) · `cart.js` · modelo `pedidos` (aditivo) · `catalogo.json` · CRM.
- **(C) Código muerto**: ninguno (se activan campos legacy `reservaId/reservaExpira`).
- **(D) Refactor scope**: medio-alto (4-5 CF nuevas en prod + frontend + reglas + scheduler). Sandbox primero.
- **(E) Riesgos+rollback+tests**:
  - P0: webhook mal validado → fraude (pagar $1). Mitigación: firma + re-consulta API + monto server-side (C3) + tests emulador.
  - P0: doble venta web↔mostrador. Mitigación: candado atómico per-doc (ya existe) + D2 (TTL = vida de la transacción) + D6.
  - P1: reserva trabada (fuga de stock). Mitigación: reaper + GRACE.
  - Rollback: cada CF revertible por deploy; el botón "Pagar ahora" detrás de flag.
  - **Pruebas en vivo DIFERIDAS** (§130.4) → todo en **sandbox** (`_test_`, centavos) hasta el paso 5 (llaves reales + legal).

## 6. Preguntas para el comité / consejo externo
1. **D-W2 (TTL = vida de transacción Wompi)**: ¿es la forma correcta de resolver el async PSE/Nequi (§136), o conviene un estado `PAGO_INICIADO_PASARELA` separado como sugería el plan? ¿El reaper re-consultando Wompi antes de liberar es robusto?
2. **¿`iniciarPagoWeb` reusa `crearPedido` (canal:web/medio:wompi) o es una CF aparte?** Reusar evita duplicar el candado, pero `crearPedido` hoy nace `pago_por_verificar`/`pagado`, no `pago_pendiente` con reserva-TTL. ¿Extender o separar?
3. **MVP de medios**: ¿arrancar SOLO con tarjeta (síncrono, más simple) y sumar PSE/Nequi después, o soportar async desde el inicio (más robusto pero más superficie)?
4. **Idempotencia del webhook**: ¿colección `webhookEvents` con doc por `transaction.id`, o basta el gate por transición de estado del pedido?
5. **Elegibilidad**: ¿reglas exactas de cuándo se muestra "Pagar ahora" (precio>0, stock, ≤$2.5M, pública)? ¿Qué pasa con piezas `encargo`/`bajo_pedido` (sin stock inmediato)?
6. **Habeas Data**: tokens `acceptance_token`+`accept_personal_auth` (`GET /merchants/{pub}`) — ¿se piden en el widget o en `iniciarPagoWeb`? (TODO-49 legal).

## 7. 6 lentes (arquitecto)
- **Negocio**: habilita venta web automática 24/7 sobre el catálogo real; pieza única de alto valor pagada online sin fricción.
- **Escala (Mercado Libre)**: candado per-doc (Firestore serializa por pieza; joyería = baja contención); STOCK separado de PAGO → sumar pasarela = nuevo `medio`+webhook sin tocar el candado (§11.3).
- **Seguridad**: total/firma server-side; webhook con firma+re-consulta+monto; secretos en Secret Manager; reglas CF-only; tope $2.5M server-side.
- **Costo**: cero infra nueva salvo 1 Cloud Scheduler (reaper, barato); comisión Wompi a `netoEsperado`.
- **Mantenibilidad**: reusa modelo `pedidos`+candado; CF nuevas desacopladas; `liberarReserva` única compartida.
- **Integración**: webhook = evento que dispara la confirmación; el POS llama la CF (request-response); cada canal entra por el mismo candado (§11.3 Integración).

## 8. Plan de implementación (sandbox primero)
1. **Reglas** (aditivas: estado `pago_pendiente`) — deploy manual primero.
2. **CFs** en sandbox: `iniciarPagoWeb` (firma TEST) · `confirmarPagoWompi` (webhook) · `liberarReserva`+reaper · `forzarConfirmarPago`. Tests emulador EN ROJO primero (firma válida/ inválida, monto distinto, idempotencia, reserva→pago, reserva→expira, doble venta).
3. **Frontend**: 4ª opción "Pagar ahora" + widget (llave pública TEST).
4. **Config panel Wompi**: URL de Eventos = webhook (sandbox).
5. **Gate empírico**: validación live (navegador real) con tarjetas de prueba Wompi + precios TEMPORALES <$2.5M.
6. **Paso 5 (futuro)**: legal TODO-49 + desactivar modo pruebas + llaves prod (Kary) + URL de Eventos prod.

---

## 9. VEREDICTO del Comité ×5 (2026-06-28)
> Crudo → `2026-06-28-comite-wompi-checkout-CRUDO.md`. 5 lentes (seguridad/concurrencia/Wompi/ejecutor/legal-UX), inline+sin-tools (L-50). El diseño base SOBREVIVE; se ACOTA (MVP) y se ENDURECE (firmas/idempotencia/legal). Cero cuelgues.

### 9.1 Convergencias fuertes (varios lentes coincidieron = señal real)
- **[FATAL] La firma del WEBHOOK ≠ firma de integridad** (E1+E3). Wompi NO usa HMAC para el evento: concatena los VALORES de `signature.properties` (en orden) + `timestamp` + **secreto de Eventos** → SHA256 → comparar contra `signature.checksum` con `crypto.timingSafeEqual`. Implementarlo como HMAC o con campos propios = evento APPROVED forjado marca `pagado`. → **D-W5 corregida**.
- **[FATAL] Firma de integridad exacta** (E1+E3): `reference+amount_in_cents+currency+[expiration_time]+IntegritySecret`, sin separadores; `expiration_time` SOLO si se envía al widget; secreto de **Integridad** (no Eventos); amount entero; currency `"COP"`. "Lo firmado == lo enviado".
- **CF NUEVA `iniciarPagoWeb`, NO reusar `crearPedido`** (E2+E4, fuerte): `crearPedido` (prod, POS) nace pagado/por_verificar y decrementa con semántica de venta confirmada; forzarlo a `pago_pendiente` lo bifurca con flags → regresión del POS. Reusar SOLO un **helper de candado/total extraído a función pura** (`reservarUnidad`), con test de regresión que `crearPedido` queda byte-idéntico. → **D-W9 (nueva)**.
- **MVP = solo TARJETA** (E3+E4): tarjeta es síncrona (APPROVED/DECLINED en segundos) → el webhook es respaldo y el reaper casi no se ejercita. PSE/Nequi (asíncronos, hasta 3h) → Fase 2b. Diferir PSE NO crea retrabajo si desde el día 1 se escribe `pago_pendiente`+`reservaExpira`. → **D-W2 se aplaza a 2b; MVP usa lazy-expire**.
- **Idempotencia DOBLE LLAVE** (E1+E2): `webhookEvents/{transaction.id}` (create atómico en la tx, contra replay; persiste — Wompi reintenta 30min/3h/24h) **+** transición de estado condicional dentro del mismo `runTransaction`. Una sola no basta. → **D-W10 (nueva)**.
- **Habeas Data: el Widget gestiona los tokens Wompi** (E1+E3+E5) (`acceptance_token`/`accept_personal_auth` vía checkboxes); pasarlos manualmente SOLO con API directa. PERO no reemplazan **mi propia autorización** de datos en el form.

### 9.2 Refinamientos clave (1 lente, alto valor)
- **Validar monto contra el total CONGELADO en el pedido** (E2), no contra el doc vivo: doc vivo para INICIAR (congela precio en el pedido); webhook VERIFICA contra el congelado. → corrige matiz de D-W4.
- **Match obligatorio `reference`↔`pedidoId`** en la re-consulta (E1): sin él, confused-deputy (reusar tx aprobada de otro pedido).
- **APPROVED solo `pago_pendiente→pagado`, jamás re-toca `cantidad`** (E2): la reserva ya descontó en paso 2; otro estado origen → `pagado_sin_stock`/`a_revisar` (con **dueño + SLA** definidos, o es dinero perdido).
- **Reaper NUNCA libera a ciegas** (E1+E2): si Wompi no responde → reintentar siguiente tick (reserva viva = seguro), nunca soltar sin confirmación.
- **Endurecer el endpoint HTTP** (E1): solo POST, validar firma ANTES de escribir, responder 200 rápido aun si se ignora (no provocar tormenta de reintentos), timestamp fresco, límite de body, allowlist IP si Wompi la publica.
- **Secretos por ENTORNO, no por flag** (E1): selector test/prod; `pub_test_`≠`pub_prod_`; dominio **`checkout.wompi.co`** para el widget (NO `sandbox.wompi.co`, que es la API REST).

### 9.3 Sobre-ingeniería recortada del MVP (E4)
- `forzarConfirmarPago` (owner) → **DIFERIR**. Reaper + Cloud Scheduler → **DIFERIR a Fase 2b (PSE)**; en solo-tarjeta basta **lazy-expire** (al reintentar `iniciarPagoWeb`, si `reservaExpira<now` recicla). No construir máquina de estados completa para 1 pieza ≤$2.5M.

### 9.4 Decisiones que quedan para el dueño (legal — bloquean el COBRO REAL, no el sandbox)
- **Vendedor≠cobrador**: el cargo aparece como "Diana Niño", no "Bersaglio" → informar al cliente + razón social/NIT; evaluar cuenta a nombre del comercio. (TODO-49 / `legal-colombia`).
- **Factura electrónica DIAN**: ¿la emite la socia o el comercio? Resolver antes del cobro real.
- **Habeas Data + T&C + retracto/reversión**: publicar política + checkboxes no premarcados (TODO-49).

### 9.5 Plan F2 ACTUALIZADO (post-comité)
- **Fase 2a (MVP, sandbox, solo TARJETA)**: helper `reservarUnidad` extraído (+ test regresión POS) · CF `iniciarPagoWeb` (reserva + firma integridad + congelar monto + lazy-expire) · CF HTTP `confirmarPagoWompi` (firma evento por `signature.properties` + idempotencia doble llave + re-consulta API + match reference + monto congelado) · frontend 4ª opción "Pagar ahora" tras flag + Widget (`checkout.wompi.co`) · URL de Eventos sandbox · tests emulador EN ROJO primero. Sin reaper/forzar/PSE.
- **Fase 2b (PSE/Nequi)**: estado `pago_iniciado_pasarela` + reaper (Cloud Scheduler, re-consulta antes de liberar) + manejo PENDING/async_payment_url + UX "confirmando pago".
- **Fase 2c (cobro real)**: legal §9.4 + llaves prod (Kary) + desactivar modo pruebas + URL Eventos prod.

### 9.6 Decisiones nuevas
- **D-W9**: `iniciarPagoWeb` = CF nueva; comparte helper `reservarUnidad` puro; `crearPedido` intacto (test byte-idéntico).
- **D-W10**: idempotencia webhook = `webhookEvents/{txId}` (create-in-tx) + transición de estado condicional.
- **D-W11**: monto verificado contra total CONGELADO en el pedido (no doc vivo).

---

## 10. Prompt de CONSEJO EXTERNO (Gemini/Antigravity — read-only, anti-anclaje)
> Para que Daniel lo pegue en el proveedor externo. Anti-anclaje (R1): se le da el problema + invariantes + opciones DESCARTADAS, no la conclusión pulida; puede leer el repo (solo-lectura). NUNCA edita/implementa.

```
Actúa como auditor adversarial senior de pagos + Firebase. Repo local (solo lectura): e-commerce de alta joyería (Bersaglio, Colombia, COP), vanilla JS + Vite, Firebase (Firestore + Cloud Functions Node 22), pasarela Wompi Colombia. Quiero CONECTAR cobro web con Wompi (Fase 2). NO edites; solo critica.

OBJETIVO: la web cobra UNA pieza ("Comprar ahora") ≤ $2.5M COP (tope cuenta Persona Natural). El mostrador (POS) ya cobra y NO se debe romper.

LEE: `docs/superpowers/specs/2026-06-28-wompi-checkout-web-design.md` (diseño + veredicto del comité §9), `functions/pedidos-core.js` + `functions/pedidos.js` (crearPedido/confirmarPago/anularPedido), `firestore.rules` (candado de stock /pieces), `js/pages/carrito.js` (checkout actual).

DISEÑO PROPUESTO (resumen): CF nueva `iniciarPagoWeb` reserva la pieza (decrementa cantidad + reservaId + reservaExpira en runTransaction) y crea pedido `pago_pendiente` con total y firma de integridad server-side; el cliente paga en el Widget de Wompi; un webhook HTTP `confirmarPagoWompi` valida la firma del evento (secreto de Eventos, SHA256 de signature.properties+timestamp+secreto), re-consulta GET /v1/transactions/{id}, valida monto==total-congelado y reference==pedidoId, y marca `pagado`. MVP solo TARJETA (PSE/Nequi async después, con reaper).

INVARIANTES (no se pueden violar): (a) jamás doble-venta de pieza única; (b) jamás confiar en el cliente para el monto; (c) un pago falsificado nunca marca pagado; (d) no romper los contratos del POS (crearPedido/confirmarPago/anularPedido/cierreCaja); (e) secretos nunca en el repo; (f) tope $2.5M server-side.

OPCIONES YA DESCARTADAS (no las repropongas sin argumento nuevo): reusar/extender `crearPedido` (riesgo de regresión del POS) → se eligió CF nueva con helper compartido; reserva fija de 15 min → no sirve para PSE/Nequi async; confiar en el redirect de Wompi → se usa el webhook + re-consulta como verdad.

PREGUNTAS:
1. ¿El algoritmo de firma del WEBHOOK (signature.properties en orden + timestamp + EventsSecret, SHA256, comparación constante) es EXACTAMENTE el de Wompi hoy? ¿Y el orden de la firma de integridad? Señala cualquier desviación de la doc oficial vigente.
2. ¿La idempotencia doble llave (webhookEvents/{txId} + transición de estado en runTransaction) tiene alguna ventana de carrera contra los reintentos de Wompi (30min/3h/24h)?
3. ¿"MVP solo tarjeta primero" es el menor riesgo, o hay una trampa al enchufar PSE/Nequi después?
4. ¿Algún FALLO FATAL de seguridad/consistencia que el comité (§9) NO vio? ¿Algún supuesto del diseño que el código real CONTRADICE?
5. Cumplimiento Colombia (Habeas Data, retracto art.47, reversión art.51, vendedor≠cobrador): ¿qué falta para no exponerse a multa SIC?

Devuelve hallazgos priorizados (FATAL/alto/medio) con evidencia (archivo:línea cuando aplique) y el arreglo concreto. Si algo del diseño está BIEN, dilo (no inventes problemas).
```

---

## 11. Consejo externo (Gemini) INTEGRADO + VEREDICTO FINAL (2026-06-28)
> Gemini auditó diseño + código (read-only). Cada claim VERIFICADO contra el código real (regla de oro del dueño). **Todos resultaron CORRECTOS (cero alucinaciones)**; el consejo cazó un punto ciego del comité.

### 11.1 Verificado → ADOPTADO
- **[FATAL → corrige al comité] Reaper OBLIGATORIO en Fase 2a (NO diferible).** Verificado: `pedidos-core.js:64` bloquea venta si `finito && cantidad<=0` (agotada); reservar baja cantidad→0 ⇒ pieza `agotada` ⇒ `generate-pieces.mjs:576,658` la filtra (`available:false`). Cliente abandona el widget → la pieza desaparece del catálogo → nadie vuelve a llamar `iniciarPagoWeb` → **lazy-expire NUNCA corre** → pieza única secuestrada para siempre. ⇒ Cloud Scheduler (reaper) que barre `pedidos pago_pendiente` vencidos es OBLIGATORIO desde 2a. (Revierte el recorte del comité §9.3.)
- **[FATAL] DECLINED/ERROR NO cancelan el pedido.** El Widget permite reintentar con el mismo `reference`(pedidoId) y nuevo `transaction.id`; cancelar en el 1er DECLINED rompe el reintento exitoso (llega APPROVED a pedido anulado → fallo/doble venta). ⇒ El webhook **solo AUDITA** los no-aprobados (`webhookEvents`) y **solo `APPROVED` transiciona** a pagado; la liberación la hace el reaper por tiempo. (Corrige §3.4.)
- **[FATAL] D-W6 (forcePosOverride) ELIMINADA.** Verificado: `pedidos-core.js:64` ya bloquea el POS si cantidad<=0 (correcto). Forzar el robo → cantidad -1 → doble venta si la web paga. ⇒ El POS NO roba reservas web; espera al reaper/expiración. (Para PSE en 2b, "mostrador espera 3h" = cuestión abierta a reconsiderar entonces.)
- **[ALTO] PENDING también en tarjeta** (3DS / revisión de fraude): no asumir APPROVED/DECLINED inmediato. ⇒ El reaper RE-CONSULTA Wompi y NO libera si la tx sigue viva/PENDING; respeta `expiration_time`. (Refuerza el reaper obligatorio.)
- **[ALTO·impl] `signature.properties` viene en dot-notation** (`"transaction.amount_in_cents"`): resolver rutas anidadas `prop.split('.').reduce((o,i)=>o?.[i], body)`, NO `body[prop]` (daría undefined → firma del webhook siempre falla).
- **[MEDIO] Habeas Data en Step 2**: checkbox obligatorio no premarcado (los tokens del Widget solo amparan a Wompi, no a Bersaglio/CRM). `carrito.js` form de envío.
- **[MEDIO] Vendedor≠cobrador en el frontend**: aviso en checkout "el cargo aparecerá a nombre de [Diana Niño / razón social]".

### 11.2 Confirmado correcto por Gemini ✓
Firma de integridad exacta (`expiration_time` en ISO-8601 UTC) · idempotencia doble llave (D-W10) · monto vs total congelado (D-W11).

### 11.3 Meta — qué cazó cada capa
El COMITÉ optimizó "no sobre-construir" y difirió el reaper; el CONSEJO EXTERNO, cruzando con el modelo de inventario real (`cantidad 0 → agotada → invisible`), demostró que ese recorte secuestra stock → reaper obligatorio. **Capa externa cazó el punto ciego de la interna.** Cero claims refutados.

### 11.4 Plan Fase 2a FINAL (sandbox · solo TARJETA · listo para construir)
1. **Reglas** (estado `pago_pendiente`) — deploy manual, aditivas primero (L-22).
2. **Helper `reservarUnidad`/`liberarReserva`** extraído de `pedidos-core` (puro) + test regresión `crearPedido` byte-idéntico.
3. **CF `iniciarPagoWeb`** (reserva + `reservaExpira` + firma integridad + congelar monto + valida ≤$2.5M).
4. **CF HTTP `confirmarPagoWompi`** (firma evento dot-notation + idempotencia doble llave + re-consulta API + match `reference` + monto congelado; **solo APPROVED transiciona**; DECLINED/PENDING solo auditan).
5. **Reaper (Cloud Scheduler) `liberarReservasVencidas`** — re-consulta Wompi antes de liberar; respeta `expiration_time`. **OBLIGATORIO.**
6. **Frontend**: 4ª opción "Pagar ahora" tras flag + Widget (`checkout.wompi.co`) + checkbox Habeas Data + aviso vendedor.
7. **Config** URL de Eventos (sandbox) + **tests emulador EN ROJO primero** (firma válida/inválida, monto distinto, idempotencia, reserva→pago, reserva→expira-por-reaper, doble venta, regresión POS).
- **2b** (después): PSE/Nequi + estado `pago_iniciado_pasarela` + override POS. **2c**: legal (TODO-49) + llaves prod (Kary).

**VEREDICTO**: diseño CERRADO y verificado por 3 capas (arquitecto + comité ×5 + consejo externo, todo contra código real). Listo para construir Fase 2a.
