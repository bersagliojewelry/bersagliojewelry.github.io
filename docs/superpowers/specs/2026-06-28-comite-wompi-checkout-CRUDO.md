# CRUDO — Comité ×5 acotado · Wompi Checkout Web (F2) · 2026-06-28

> Deliberación cruda (Reflejo de Captura §G.4). 5 expertos en paralelo, inline+sin-tools (L-50). Síntesis → spec `2026-06-28-wompi-checkout-web-design.md §9`.

## E1 · Seguridad de pagos (escéptico fraude)
- **FATAL**: la firma del WEBHOOK ≠ firma de integridad. Wompi NO usa HMAC para el evento: concatena los VALORES de las propiedades de `signature.properties` (en orden) + `timestamp` del evento + **secreto de Eventos** → SHA256 → comparar contra `signature.checksum` con `crypto.timingSafeEqual`. Si se implementa como HMAC o con campos propios → evento APPROVED forjado marca `pagado`.
- Firma integridad: `reference+amount_in_cents+currency+[expiration]+IntegritySecret`; expiration SOLO si se envía; usa secreto de Integridad (no Eventos); amount entero, currency "COP".
- Redirect: jamás fuente de verdad; `gracias.html` solo lee Firestore por pedidoId, nunca marca pagado desde query param (forjable).
- Re-consulta GET /transactions/{id}: validar status APPROVED + amount==total + currency + **match reference↔pedidoId** (sin esto: confused-deputy, reusar tx aprobada de otro pedido).
- Idempotencia DUAL: `webhookEvents/{transaction.id}` create atómico (replay) + gate por transición de estado en runTransaction. Rechazar timestamp rancio.
- Endurecer HTTP: solo POST (405 al resto), validar firma ANTES de escribir, 200 rápido aun si se ignora (Wompi reintenta si no 2xx → tormenta), límite de body, allowlist IP si Wompi la publica.
- Secretos por ENTORNO (no por flag del cliente); pub_test_ vs pub_prod_ distintas; rotar secreto Eventos invalida firmas en vuelo (ventana doble-secreto).
- acceptance_token: con Widget lo gestiona Wompi; con API directa hay que pasarlo.
- Async tardío: webhook revalida en runTransaction que la reserva siga viva y apunte a ESTE pedido; si no → `a_revisar`, nunca pagado normal. Sugiere estado separado `pago_iniciado_pasarela`.

## E2 · Arquitecto transaccional Firestore (concurrencia)
- Webhook-tardío-tras-reaper-tras-reventa: APPROVED solo transiciona `pago_pendiente→pagado` y NUNCA vuelve a tocar `cantidad` (la reserva ya descontó en paso 2); cualquier otro estado origen → `pagado_sin_stock`. Invariante duro.
- Doble +1 (reaper/anular/declined): liberación condicional a transición de estado del pedido DENTRO de la misma runTransaction que el increment(+1). Atómico o nada.
- **Idempotencia**: gate por estado NO basta (dos entregas APPROVED concurrentes leen pago_pendiente antes de escribir). Doble llave: `webhookEvents/{txId}` create-in-tx + transición condicional. El doc de eventos persiste (reintentos 30min/3h/24h; sin TTL corto).
- **CF NUEVA, no reusar crearPedido** (nace pagado/por_verificar + decrementa con semántica de venta confirmada; forzarlo a pago_pendiente bifurca con flags → regresión POS). Compartir SOLO el helper de candado `reservarUnidad(pieceId,pedidoId)`.
- Reaper: si Wompi no responde → NUNCA liberar a ciegas (doble-venta si APPROVED en vuelo); reintentar siguiente tick (reserva viva = seguro). GRACE 2-3min DEMASIADO corto para PSE async; TTL al peor caso (3h+).
- Validar monto contra el total CONGELADO en el pedido al reservar, NO contra doc vivo (precio pudo cambiar). Doc vivo para INICIAR; congelado para VERIFICAR.
- Ledger movimientos: docId `{pedidoId}-{tipo}` (idempotente) DENTRO de la tx que cambia cantidad.
- `a_revisar`: definir dueño + SLA o es dinero perdido silencioso.
- Hot-doc: no aplica (lujo, baja frecuencia, candado per-doc OK).

## E3 · Especialista Wompi Colombia (integración real)
- **FATAL** firma integridad: orden exacto `reference+amount_in_cents+currency+[expiration_time]+secret`, sin separadores; expiration ANTES del secreto y SOLO si se envía al widget. Lo firmado = exactamente lo enviado.
- Widget: existe Widget JS (`checkout.wompi.co/widget.js`, WidgetCheckout) y Web Checkout redirect (`checkout.wompi.co/p/?...`). Dominio = **checkout.wompi.co** (NO sandbox.wompi.co, que es solo la API REST). Params: public-key, currency, amount-in-cents, reference, signature:integrity, redirect-url, expiration-time. Soportan tarjeta+PSE+Nequi+Bancolombia.
- Firma EVENTO (distinta): leer `signature.properties` del propio evento, concatenar valores en orden + timestamp + EventsSecret → SHA256 → comparar checksum. No inventar properties.
- expiration_time existe, pero NO depender de él como única fuente; reserva con TTL propio + reaper que re-consulta.
- **MVP solo-tarjeta** (síncrono APPROVED/DECLINED); PSE/Nequi async (PENDING→APPROVED, async_payment_url, polling) después.
- Habeas Data: GET /merchants/{public_key} → presigned_acceptance + presigned_personal_data_auth; el **Widget los gestiona solo** (checkboxes); pasarlos solo con API directa.
- Sandbox: tarjetas/usuarios de prueba + endpoint para forzar APPROVED/DECLINED/VOIDED. NO recuerda de memoria la lista exacta → confirmar en doc oficial (no inventar).
- Topes $2.5M/$10M = de la cuenta PN, rechazar >$2.5M server-side antes de iniciar. Comisión la asume el comercio (no se suma al cobro).

## E4 · Ingeniero ejecutor pragmático
- **CF NUEVA `iniciarPagoWeb`** (no extender crearPedido en prod): reusar helper de candado/total extraído a función pura, sin cambiar la firma de crearPedido. POS ni se entera.
- **Solo-tarjeta primero SÍ reduce riesgo** (no retrabajo): webhook = respaldo, reaper casi no se ejercita. Diferir PSE no crea retrabajo si desde día 1 se escribe pago_pendiente + reservaExpira.
- Sobre-ingeniería a recortar del MVP: `forzarConfirmarPago` → diferir; reaper+Scheduler → diferir a fase PSE (en solo-tarjeta: lazy-expire al reintentar en iniciarPagoWeb si reservaExpira<now).
- Camino crítico (todo tras flag): (1) extraer helper candado/total + test regresión crearPedido byte-idéntico; (2) iniciarPagoWeb; (3) confirmarPagoWompi webhook; (4) frontend 4ª opción tras flag; (5) URL Eventos + deploy manual + activar flag.
- Tests emulador imprescindibles: POS sigue verde (regresión); webhook idempotente; firma inválida rechazada; doble compra último ítem → uno gana, otro sin stock.
- Rollback = apagar flag frontend (CF nuevas quedan inertes sin callsites; cero rollback de datos).
- NO diferible: firma webhook, idempotencia, total server-side, candado compartido. No construir máquina de estados completa para 1 pieza ≤$2.5M.

## E5 · Legal e-commerce CO + UX
- **FATAL** vendedor≠cobrador: el cargo aparece como "Diana Niño", no Bersaglio → mostrar razón social/NIT del vendedor + nota "el cargo aparecerá como [nombre]"; idealmente cuenta a nombre del comercio.
- **FATAL** Habeas Data (Ley 1581): checkbox NO premarcado "Autorizo tratamiento de datos según [Política]" + política publicada ANTES del submit; guardar fecha/hora/versión. Los tokens Wompi NO reemplazan TU autorización.
- T&C + retracto (5 días, art 47) + reversión (art 51) informados; piezas a medida/encargo exceptuadas de retracto; reversión ineludible (tarjeta/PSE) → proceso devolución <30 días (complejo con cuenta de socia).
- Factura electrónica DIAN obligatoria al cobrar: ¿la emite la socia o el comercio? Resolver antes de cobro real.
- UX: 7 campos antes de pagar = abandono → pedir mínimo pre-pago (nombre/email/tel), dirección DESPUÉS; país fijo Colombia. Estado PENDING (PSE/Nequi) con "confirmando tu pago" + polling + email. Reserva expira mientras paga → extender TTL en sesión activa. Declinado → mensaje humano + WhatsApp. Confianza: sellos pago seguro + foto pieza + política devolución.
- Elegibilidad "Pagar ahora": precio>0 Y pública Y ≤$2.5M Y stock. encargo/bajo_pedido → asesor (o anticipo etiquetado, excluido de retracto). bajo consulta → asesor.
- (No es abogado litigante → validar art 47/51 + tema socia con skill `legal-colombia`.)
