# Plan Maestro de Comercio — Bersaglio (v3 · Gemini v4 INTEGRADO)

> **SSoT del roadmap de comercio unificado** (venta/pedidos/pago/stock/facturación-interna/CRM/posventa,
> físico + digital). Construido 2026-06-25 con el flujo COMPLETO (W-11): auditoría de código + investigación
> de agentes (6 buckets) + 3 comités adversariales + validación en vivo (Chrome) + mockup + diagrama.
> **Estado: convergido + Consejo Externo (Gemini v4) INTEGRADO (§10/§11). B0+B0.5 EJECUTADO (ADR §120, WhatsApp directo en la ficha + GA4). SIGUIENTE: B1 (corazón, mostrador).**
> `[OPUS-4.8]` interino. **Deliberaciones CRUDAS archivadas** (no perder): task outputs
> `tasks/wbhvxojh5` (investigación), `w8ig27z14` (comité plan), `wk715z2q6` (comité calc+unificado),
> `w3qkksqpg` (comité precio corregido).

## 0. La idea que unifica
**Un solo flujo, registrado una vez:** Catálogo+Stock → Cliente → **Pedido** → Pago → Facturación interna →
Contabilidad/CRM/Cartera → Logística → Posventa. **Físico y digital son UN solo sistema** (un POS, una
contabilidad, una facturación interna, un CRM, un inventario). La venta online, por WhatsApp y en mostrador
son la MISMA entidad `Pedido` (canal = atributo); stock compartido; despacho desde la misma tienda.
**DIAN fuera de la plataforma** (la lleva el contador; la plataforma da facturación/contabilidad internas + export).

## 1. Diagnóstico verificado (auditoría de código real)
- El "checkout" actual NO cobra: 3 opciones offline (WhatsApp/transferencia/asesor); la "compra" se guarda
  con `saveInquiry()` → cae en la Bandeja de leads. **NO existe entidad `pedidos`.** (`js/pages/carrito.js`)
- Pieza sin precio → CTA "Consultar" lleva a `/contacto.html` = **fuga de leads**. (`js/pages/pieza.js`)
- Falta clasificación: la pieza no tiene género ni certificación estructurada ni tipo de stock. (`js/admin/piezas.js`)
- Tiempo real: piezas/colecciones/journal/films/redes = `onSnapshot` ✅; textos de página (`siteContent`) = SWR
  cache-first → NO en vivo (exigen recarga). (`js/core/data.js`)
- Catálogo público HOY VACÍO en prod (reset a cero, validado en vivo por Chrome 2026-06-25).
- El panel admin: IA buena (`js/admin/sidebar-data.js`) pero 6 items son placeholders "pronto" (Ventas/Facturas/
  CxC/Recibos/Inventario/Films-Redes/Reportes).

## 2. Hechos externos verificados (investigación)
- **Wompi**: cuenta Persona Natural/Agregador = tope DURO **$2.5M/transacción, $10M/día** (PJ = $10M/$80M;
  Gateway hasta ~$500M). Métodos: tarjetas, PSE, Nequi, Bancolombia (Botón/QR/efectivo), Daviplata, BNPL.
  Confirmación = **webhook SHA256 firmado + idempotente** (reintentos 30min/3h/24h; "redirect solo informativo";
  verificar `GET /v1/transactions/{id}`). Comisión ~2,65%+$700+IVA. **Links de Pago** compartibles por WhatsApp.
  Persona Natural: cédula+RUT, cuenta >30 días, sin Cámara de Comercio. Sandbox disponible.
  **"~20 transacciones para ampliar cupo" = RUMOR no verificado** (ninguna fuente oficial; solo "validaciones internas").
- **Financiación CO**: **ADDI** (3 cuotas 0% sin tarjeta, solo cédula+WhatsApp) = estándar en joyería colombiana,
  NO depende del cupo Wompi → palanca de conversión; Sistecrédito alternativa. **Recomendado integrar.**
- **Envíos**: ⚠️ **Coordinadora NO transporta joyas**; TCC mensajería topa $3.5M. Alto valor → **Servientrega
  "Mercancía Premier"** (asegura hasta $300M, 2% del valor declarado) o mensajería de valores. Declarar 100% +
  prueba de entrega (POD) + foto/video antes de sellar. Modelo de estados: Falabella (Solicitud→Preparación→
  En camino→Listo para retiro→Entregado).
- **Lujo (el "plus")**: precio bajo consulta + cita/asesora; recogida segura en showroom con cita; envío asegurado
  con firma; **clienteling** (el CRM guarda el "porqué": gustos/fechas → recompra); **certificado visible** (GIA
  diamantes; **CDTEC/Gübelin** esmeraldas, mina Muzo/Chivor) = lo que justifica el ticket alto.
- **WhatsApp**: app Business + catálogo nativo (gratis); API después. `wa.me/57XXXXXXXXXX?text=` con ref de pieza;
  **GA4 no mide el clic solo** → evento `whatsapp_click` + marcar conversión + UTM. Form largo pierde en móvil →
  CTA WhatsApp directo en alta intención.
- **Legal de plataforma (no DIAN)**: retracto Ley 1480 (5 días hábiles; excepción "a medida", avisar antes →
  flag `a_medida`); reversión del pago (Art 51, pagos electrónicos); garantía legal; deber de información (razón
  social/NIT/dirección/contacto, precio con IVA, retracto, link SIC); **habeas data** Ley 1581 (checkbox autorización
  NO pre-marcado + política; **RNBD no aplica** por tamaño); **RUCOM** (joyero <2kg oro/año exento de registro pero
  **guardar certificado de origen** de cada compra); KYC + preferir pagos trazables (LA/FT).

## 3. Arquitectura convergente (3 comités → mismo núcleo)
1. **Stock con UN candado = el doc de la pieza.** Estado en la pieza: `disponible|reservada|vendida` +
   `reservaId` + `reservaExpira` (serverTimestamp). TODOS los caminos (web/WhatsApp/POS) ejecutan `runTransaction`
   sobre ESE doc: leen estado, validan, escriben atómico → imposible doble venta. "Mostrador gana sobre reserva
   sin pago" se decide DENTRO de la transacción. **La reserva NO vive en colección aparte.**
2. **Reserva por TTL evaluado por comparación de timestamp** en cada lectura transaccional (`reservaExpira > now()`,
   `now()` = server time, NUNCA reloj del cliente). El TTL nativo de Firestore solo limpia basura, jamás es el árbitro.
   Ventana corta (~10-15 min).
3. **El pedido SOLO lo crea una Cloud Function callable.** `allow create: if false` en `pedidos` para todo rol →
   único escritor = Admin SDK de la CF. El cliente/POS manda SOLO insumos (pieceId, peso, manoObra, medio, canal);
   la CF lee `valor-gramo` server-side, recalcula el total y persiste. La calculadora del navegador = PREVIEW
   (vía CF de preview que devuelve el total sin persistir; el navegador NUNCA lee el valor-gramo crudo).
4. **Precisión exacta del dinero**: enteros COP, redondeo UNA vez al final (regla fija), server-side; IVA
   discriminado que sume exacto. Documentar decimales del peso y orden de operaciones.
5. **Snapshot inmutable en el pedido**: peso, valor-gramo NUMÉRICO usado, mano de obra, **costo del día** (para
   utilidad real), total, fecha, autor. **Inmutabilidad por CAPAS** (las reglas Firestore NO aplican al Admin SDK):
   (a) reglas para el cliente; (b) la CF no expone ningún update de campos monetarios; (c) **correcciones = asiento
   nuevo append-only (nota de ajuste que referencia el original)** — REUSA el patrón `anular≠borrar` del CRM (§42/§43).
6. **`valor-gramo` en Configuración**: `write` solo owner/admin, `read` NO pública (no exponer margen), cada cambio
   auditado (autor+timestamp+valor anterior). En el commit, si cambió respecto al preview → reconfirmación explícita de Kary.
7. **Caja/contabilidad unificada**: cada `Pedido` captura **MEDIO** (efectivo/Wompi/transferencia/Addi) y **CANAL**
   (web/WhatsApp/POS); arqueo separado por medio; **export al contador** con IVA discriminado + base + total + medio +
   canal + fecha + identificación.

## 4. Modelo de datos (límites de módulo)
- `pieces` (existe): + `gender`, `certificacion{tipo,entidad,numero}`, `stockType (finito|encargo)`, `cantidad`,
  `leadTimeDias`, `estado`, `reservaId`, `reservaExpira`. Precio: `price` fijo o ausente (=bajo consulta).
- `pedidos` (nuevo): número, `clienteRef|customerUid`, items[], total (server-side), `desglose` (snapshot inmutable),
  `medio`, `canal`, `estado` (creado→pago_por_verificar→pagado→preparación→despacho/listo→entregado), `entrega`
  (domicilio{guia,transportadora}|tienda), `comprobanteRef`, `a_medida`, fiscal{base,iva,total}. Append-only +
  notas de ajuste.
- `customers` (nuevo, self-service): clave=uid, claim `customer`; SEPARADO de `clientes` (CRM admin); vínculo
  `clienteId` opcional seteado SOLO por Kary. El cliente lee proyección read-only de su cartera.
- `config/precios` (nuevo): `valorGramo` por metal/quilataje (owner-only write, read no pública, auditado).
- Comprobantes en Storage: ruta namespaced por pedido/uid, read solo dueño/staff, escritura validada (tipo/tamaño),
  nunca público/listable.

## 5. Modelo de precio (CORREGIDO — Daniel)
Al CLIENTE solo DOS estados: **precio fijo** (visible) o **bajo consulta** (sin precio). NO existe "por peso" visible.
La **calculadora por peso es INTERNA**, aparece al **facturar/crear el pedido**: pieza con precio fijo → directo;
pieza bajo consulta → el sistema ofrece a Kary calcular (peso × valor-gramo + mano de obra) o digitar → se fija en
la factura/pedido (server-side, ver §3.3-3.5).

## 6. Matriz de pago (cero fugas) — pieza CON precio en checkout
1. ≤$2.5M y bajo tope diario → **Wompi** (+ ADDI/Sistecrédito a cuotas).
2. >$2.5M o tope diario alcanzado → el cliente ELIGE sin salir obligado: (a) **transferencia EN PLATAFORMA** + subir
   comprobante → "pago por verificar" → Kary verifica → envío; (b) **WhatsApp/"Reservar con asesora"** (puede recibir
   Link de Pago Wompi si cabe). Pieza **bajo consulta** → asesora; precio se fija al facturar.
Regla dura: "pagado" SOLO lo confirma Kary tras ver el dinero; no se despacha sin ver la plata; doble visto bueno de
Daniel sobre umbral (reusa SoD del CRM).

## 7. Plan por bloques (v3) — ventana de pruebas + bugfix entre cada uno
- **B0 (base, urgente)**: cerrar merges + borrar piezas de prueba; catálogo "mínimo publicable" + clasificación
  (género/certificación/tipo-de-stock); **WhatsApp directo + GA4 `whatsapp_click` en CTAs (frena la fuga YA)**;
  auditar capa de datos en vivo; ordenar panel; EN PARALELO iniciar trámite cupo Wompi + confirmar facturación con contador.
- **B1 (corazón, arranca por el MOSTRADOR)**: 1A = entidad `pedidos` unificada (POS presencial primero — Kary ya vende
  hoy) creada SOLO por CF, snapshot inmutable, calculadora interna al facturar, stock atómico server-side, comprobante
  "por verificar"≠"pagado", entrega diferenciada tienda/domicilio (envío asegurado), checkout invitado, señales de
  confianza (certificado visible), captura medio+canal. 1B = cobro Wompi (+ADDI) con webhook firmado/idempotente +
  gate de cupo server-side. 1C = cuenta de cliente + portal (claim `customer`, reglas auditadas antes de abrir registro).
- **B2 (importante)**: captura multicanal → CRM + analítica/GSC/BigQuery + clienteling (preferencias/fechas).
- **B3 (importante)**: facturación interna + contabilidad interna + EXPORT al contador + inventario + cartera visible
  al cliente + reportes/KPIs (4-6 números para Daniel: ventas por canal, margen, caja cuadra, cartera).
- **B4 (puede esperar)**: RBAC granular (Contador/Asesor) + panel tipo-app (TODO-33) + Persona Jurídica (sube cupo) +
  automatizaciones.

## 8. Decisiones del dueño
- ✅ **Registro = invitado + cuenta opcional** post-compra (sin bajar seguridad). (Daniel 2026-06-25)
- ✅ **DIAN fuera de la plataforma** (contador aparte); plataforma = facturación/contabilidad internas + export.
- ✅ **Calculadora interna al facturar** (no visible al cliente).
- 🔲 **ADDI/Sistecrédito**: recomendado integrar (decisión pendiente de Daniel).
- 🔲 **Persona Jurídica vs ampliar cupo Wompi**: evaluar con contador (sube tope a $10M/$80M).
- ✅ **Pasada de Consejo Externo (Gemini v4)**: INTEGRADA (10 fugas adoptadas, §10/§11).

## 9. Logística (Daniel 2026-06-25)
- **Local Cartagena**: domiciliario de confianza propio, **GRATIS** (sin flete, sin guía de transportadora; confirmación de entrega propia).
- **Nacional**: Kary/equipo eligen la transportadora de confianza por pedido; el **flete se SUMA a la facturación**; guía + transportadora quedan en el pedido. Guía de elección (investigación): Coordinadora NO lleva joyas → Servientrega "Mercancía Premier" asegurado / mensajería de valores; declarar 100% + POD.
- **Recogida en tienda**: opción premium (cita; identificación del receptor).
- Pago: por ahora SOLO **Wompi** (cuenta Persona Natural aprobada ✓ — BERSAGLIO/Diana Margarita Nino Mendoza). **ADDI** cuando Kary haga la vinculación. Resto sujeto a confirmación.

## 10. Veredicto Consejo Externo (Gemini v4) — INTEGRADO (2026-06-25)
Gemini (que sí pensó como joyería real) cazó fugas operativas/fiscales/concurrencia que el comité de escritorio no vio. Verificadas contra código + investigación + operación. CAMBIOS ADOPTADOS:
1. **Pasarela asíncrona (PSE/Nequi tarda hasta 3h) — BLOQUEANTE**: reserva corta (~15min) NO sirve para pago iniciado por pasarela. Nuevo estado **`PAGO_INICIADO_PASARELA`** que mantiene la pieza bloqueada hasta que el webhook resuelva (o expire la transacción Wompi). El POS muestra **alerta**: "pieza en pago online, NO vender". El webhook, al confirmar, **re-chequea stock atómico**; si ya se vendió → marca para **reembolso**, no despacha (Link de WhatsApp "zombi").
2. **Merma del oro — ALTA**: pieza ajustada en taller (5,2g→4,9g) = fuga de inventario. Dos pesos: **`pesoCobrado`** (congelado en factura) y **`pesoEntregado`** (en despacho) → diferencia = merma controlada.
3. **Cotización rápida**: endpoint `cotizacion_rapida` server-side (pieza + peso → precio, SIN crear pedido ni mutar BD) — Kary cotiza varias piezas en mostrador sin borradores. (= la "CF preview" del comité, aterrizada.)
4. **VOID/anular**: flujo atómico (solo Kary) que reintegra la pieza al catálogo + traza. Inmutable ≠ no-anulable. (= nota de ajuste anular≠borrar del CRM §42.)
5. **Bruto vs Neto — BLOQUEANTE**: el pedido registra `montoBruto` (lo que paga el cliente) y calcula `netoEsperado` = bruto − comisión Wompi (2,65%+$700+IVA) − retenciones (ReteFuente/ReteICA por parámetro del contador). Sin esto el banco NUNCA cuadra. El export al contador lo incluye.
6. **N pagos por pedido — BLOQUEANTE**: entidad **`pagos` 1..N** dentro del pedido (anticipo/abono/saldo, cada uno con medio/fecha/comprobante) — **reusa los movimientos de la cartera CRM**. Export separa recibos de caja (anticipos) vs venta final (IVA causado sobre lo facturado/entregado, no sobre el anticipo).
7. **Arqueo / Cierre Z — BLOQUEANTE**: entidad **`Arqueo/Caja`** por turno: Kary declara el efectivo físico al cierre → sistema compara con esperado → descuadre detectado. (Núcleo de la "herramienta de confianza".)
8. **Costo de reads (DDoS) — ALTA**: el público NO lee Firestore en vivo (hoy `onSnapshot` = riesgo de costo si viraliza). Al guardar Kary, una CF compila **`catalogo.json` → Storage/CDN**; el público lo lee gratis; Firestore solo en checkout/login. Encaja con el SSG ya existente (§116) + SWR (§108/§111). RESUELVE la tensión "tiempo real vs costo": catálogo fresco por republish-on-change (segundos), live-listener reservado a admin/checkout.
9. **Offline POS — ALTA (matizado)**: caché del valor-gramo para **cotizar/borrador offline**; el claim atómico de pieza única y el pago EXIGEN conexión (offline+atomicidad = conflicto). Sync-offline-completo con resolución de conflictos = fase posterior, sin prometerlo en MVP.
10. **RBAC — refutado en parte**: se mantienen los 4 roles ya en prod (owner/admin/editor/catálogo); los roles NUEVOS (Contador/Asesor) quedan DIFERIDOS (no construir para 2 personas ahora).

## 11. REORDENAMIENTO del plan (la "herramienta de confianza" sube a B1-B2)
- **B0.5 (urgente, time-to-value)**: **Links de Pago Wompi dinámicos** (API) generados desde la calculadora interna → para WhatsApp, Kary manda un link referenciado, no un número de cuenta. (Cuenta Wompi aprobada.) + WhatsApp directo con GA4 en CTAs (frena la fuga).
- **B1 (corazón)**: pedido unificado (mostrador primero) + estados de pasarela async + `pagos` 1..N + cotización rápida + VOID + merma (pesoCobrado/pesoEntregado) + stock atómico (candado=pieza) + **caja/arqueo (Cierre Z)** + **bruto/neto con comisión+retención** + **export básico al contador (NO B3 — obligación desde la 1ª venta)** + `catalogo.json` a CDN + cotización offline. Logística: local gratis / nacional con flete a factura / recogida.
- **B2**: **reportes/KPIs de confianza para Daniel/Kary** (utilidades reales [costo del día congelado], inventario real de tienda, todo lo vendido, caja cuadra, cartera, leads) + captura multicanal → CRM + analítica/GSC + clienteling. (Elevado desde B3.)
- **B3**: facturación interna avanzada + inventario por lote + cuenta de cliente/portal (1C) maduro + cartera visible al cliente.
- **B4 (puede esperar)**: roles granulares (Contador/Asesor) + panel tipo-app + Persona Jurídica + automatizaciones + offline-sync completo.

## 12. Pendiente para cerrar
v3 con Gemini integrado = LISTO para diseño detallado por bloque. Al ejecutar: ADRs por bloque + skills (`crm-architect`, `ecommerce`, `legal-colombia`, `ga4-lead-tracking`, `caza-bugs`). Decisiones abiertas del dueño: ADDI (Kary vincula) · Persona Jurídica (con contador). El módulo de **contabilidad/caja/utilidades es ahora núcleo (B1-B2)**, no diferido — directiva Daniel: "Kary necesita una herramienta de confianza (balance, utilidades, inventario real, ventas, posventa, CRM, leads)".
