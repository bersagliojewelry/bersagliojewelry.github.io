# PLAN ÚNICO ERP — Bersaglio v4 (2026-07-04 · Fable 5)

> **SSoT del roadmap completo del mini-ERP** (pedidos · logística · POS · facturación interna ·
> contabilidad · inventario · CRM · reportes). **Sucede y absorbe** a `2026-06-25-plan-maestro-comercio-v3`
> (que queda como referencia de decisiones de fondo) y al plan Fable (`2026-07-03-auditoria-holistica-plan-fable`,
> cuyo remanente vivo = carril D). Directiva de Daniel (2026-07-04): *"super prioridad completar el POS y el
> sistema de pedidos y logística; todo conectado en un único sistema CRM; tú defines el orden para no
> retroceder y que todo engrane; al final solo retoques de diseño"*. Los precios NO son bloqueante.
>
> **Proceso**: lectura de specs vivas + estudio del sistema hermano ALTORRA (agente, síntesis abajo) +
> **comité ×3 acotado** (arquitecto · operación-joyería · adversario de secuencia; veredicto unánime
> APROBAR_CON_CAMBIOS, cambios INTEGRADOS aquí). CRUDO → bóveda
> `../brain-private/bersaglio/2026-07-04-comite-plan-erp-v4-CRUDO.json`. Consejo Externo: prompt listo en
> `2026-07-04-plan-unico-erp-v4-PROMPT-CONSEJO-EXTERNO.md` (no bloquea F1; su crítica se integra en las specs de fase).

---

## 0. Punto de partida (verificado contra código 2026-07-04)

**Ya construido y en prod (se CONSUME, no se rehace)**: entidad `pedidos` CF-only (crear/confirmar/anular/
cierreCaja/iniciarPagoWeb) + webhook Wompi verificado con dinero real (§164) + reaper TTL · stock atómico v3
con ledger `pieces/{id}/movimientos` + `reponerStock` centralizado · POS Mostrador (1 pieza, precio fijo/por
peso server-side, VOID, cierre Z, export contador bruto/neto) · CRM cartera (344 clientes, saldo por CF,
aging, acuerdos gateados) · checkout web completo (entrega/legal_id/consentimiento) · seguridad (RBAC claims,
reglas endurecidas) · SSG/SEO/legal e-commerce.

**Huecos reales**: NO existen estados de logística (el ciclo muere en `pagado`) · NO hay módulo admin de
Pedidos (placeholders "Pronto": Ventas/Facturas/CxC/Recibos/Inventario/Reportes) · pedido NO se liga a
cliente CRM · sin apartados/abonos · sin factura multi-línea · sin UI de inventario/kardex · sin KPIs.

**Lecciones ALTORRA adoptadas** (sistema hermano; NO tiene facturación/contabilidad/logística — ahí Bersaglio
va adelante): ingestión multicanal por UNA sola ruta con dedup server-side (L-26/L-31) · lead≠deal → aquí
pedido≠cliente≠movimiento, colecciones separadas con FK · reportes = agregación client-side sin backend nuevo
(§165 ALTORRA) · fechas de agenda con dayKey LOCAL UTC-5 (L-30) · censo exhaustivo de escritores al endurecer
reglas (L-41) · lo verificable se mecaniza en linter/test, no en doctrina (M-10/M-16).

---

## 1. ÍTEM 0 — Día 1, en paralelo, cero código

- **(a) Decisión Daniel — TODO-39 apartados/plan separe** en el mostrador (anticipo + abonos). El comité
  opina que en joyería CO la respuesta natural es sí (la cartera de $506M lo prueba); decide Daniel.
- **(b) Decisión Daniel — política de flete nacional** para pedidos web YA pagados: ¿se cobra aparte
  (registro manual del cobro por Kary: link Wompi/transferencia) o lo asume la casa? El modelo soporta ambas
  (`flete{valorCOP, cobro: cobrado|asumido, medio, estado}`); la POLÍTICA es del dueño.
- **(c) PAT GitHub** (Daniel, guiado por Claude cuando toque): prerrequisito del carril D (rebuild automático
  del catálogo al vender). Pedirlo temprano para que D no espere.
- **(d) Protocolo interino 1ª APPROVED** (1 página para Kary): qué hacer si cae una venta web antes de que
  exista el módulo Pedidos (mientras el slice puente no esté en prod).
- **(e) Receta interina de apartados** (si TODO-39 = sí): anticipos/abonos se registran YA como movimientos
  de cartera CRM (existe) + la pieza apartada se marca no-disponible en la web (evita doble venta).
- **(f) Inventario de hardware POS (preguntar a Kary/Daniel — gatea F2.3 impresión, no F1)**: ¿hay impresora
  térmica? (marca/modelo, ancho 80mm/58mm, conexión USB/red/Bluetooth) · ¿hay cajón monedero RJ11 conectado a
  la impresora? · ¿en qué equipo opera Kary el mostrador (PC Windows + Chrome / tablet / celular)? Si no hay
  hardware aún, recomendar compra (térmica 80mm USB con puerto de cajón ≈ estándar económico).

## 2. FASE 1 — PEDIDOS & LOGÍSTICA (super-prioridad; arranca YA)

**Racional**: la 1ª APPROVED puede caer en cualquier momento y hoy no hay herramienta post-`pagado`;
riesgo asimétrico (dinero cobrado sin proceso) > todo lo demás. El POS ya cubre el día a día básico.

### F1-PUENTE (primero, días — cierra la ventana ciega)
- Lista + detalle **read-only** de pedidos (todos los canales) con TODO lo que el checkout ya captura:
  contacto, teléfono (botones `wa.me`/`tel:` + copiar dirección/resumen), entrega, legal_id, monto, piezas.
  Ocupa el placeholder "Ventas" del sidebar (se renombra **Pedidos**; los placeholders "Facturas" y "CxC" se
  retiran — factura vive en el pedido, CxC vive en Clientes/cartera; una-entidad-por-concepto aplica a la nav).
- Push FCM real al celular de Kary (A.6) — best effort en el puente; no gatea.
- Entregable operativo: protocolo interino (Ítem 0d) queda obsoleto al desplegar esto.

### F1-CORE (gate de la fase)
- **Máquina de estados server-side** (CF `avanzarPedido`), transiciones como **TABLA** de configuración
  (origen→destinos válidos por canal), NO if-chains — F2 añade filas (apartado), no reabre la CF:
  `pagado → preparacion → (despacho_nacional | entrega_local | listo_retiro) → entregado`
  + **ruta corta POS**: venta mostrador nace `entregado (en mano)` por defecto, con opción explícita
  "requiere envío" que la mete al flujo (capturando entrega) · + terminales `reembolsado` y
  `cancelado` pre-despacho (reponerStock existe) desde el día 1 · traza append-only por transición en
  subcolección `pedidos/{id}/historial` (autor+timestamp+estado; patrón anular≠borrar) · dayKey LOCAL.
- **Flete como CARGO aditivo, snapshot INTACTO** (P0 del comité): el snapshot original nunca se recalcula;
  `despacho_nacional` escribe `flete{valorCOP, cobro, medio, estado}` + transportadora + guía +
  valor_declarado + asegurado + pesoEntregado. La **merma** (pesoCobrado−pesoEntregado) se asienta en el
  ledger de la pieza (no como campo suelto — una sola fuente de verdad del stock). El **export contador
  discrimina flete desde F1** (no esperar a F4).
- **Costuras sembradas HOY (contratos aditivos, la UI llega después)**:
  `items[]` en escrituras nuevas (1 entrada hoy; lectura con adaptador legacy) → F2.3 solo generaliza ·
  `costoSnapshot` congelado por ítem en crearPedido/POS (sin esto, las PRIMERAS ventas quedan sin utilidad
  calculable para siempre) · `clienteId` nullable CF-only (la UI de vincular es F2) · guía/estado expuestos
  en el **comprobante-por-token que ya existe** (§164) + plantilla copiable WhatsApp "tu pedido va con
  {transportadora}, guía {n}" — el silencio post-pago destruye confianza en lujo.
- **Módulo Pedidos completo**: filtros estado/canal/medio/fecha · **fila de totales del filtro activo**
  (n + suma COP, client-side = KPI-v0, ~80% del valor de "ventas por canal" al 5% del costo) · colas de
  excepción que cuentan SOLO lo que espera acción (por_verificar → confirmar; a_revisar; pagado_sin_stock →
  **dos acciones**: "ofrecer refabricación/encargo" (el tipo refabricable existe) o "reembolsar" con
  instructivo Wompi paso a paso) · POD liviano por canal (retiro = cotejo cédula==legal_id; local = nombre
  receptor; nacional = guía+evidencia) — 3 campos, no burocracia.
- **Gate F1**: E2E de los 3 flujos de entrega en prod + Kary llega del push al detalle + validación Chrome.

### F1-EXTRAS (no gatean; solapables con F2)
Badge sidebar · alerta reaper N-ticks (A.5) · login rol-desconocido · citas de retiro del día en "Hoy".

## 3. FASE 2 — POS COMPLETO + vínculo CRM

Orden interno corregido por el comité (2.2 es prerrequisito de apartados):
- **2.0 SESIÓN DE CAJA COMPLETA (directiva Daniel 2026-07-04, ref. flujo estándar tipo Changarrito)**: hoy
  existe solo el cierre Z a ciegas; se completa el ciclo empresarial de caja como entidad **`turnos de caja`**
  (evoluciona `arqueo` — misma colección, CF-only, sin paralelo):
  **(a) APERTURA** diaria/por turno: fondo inicial (base) declarado + responsable + `serverTimestamp` —
  ninguna venta en efectivo sin turno abierto (el POS lo exige y ofrece abrir);
  **(b) MOVIMIENTOS DE CAJA** del turno: ingresos/egresos manuales con concepto de lista cerrada + monto +
  nota + comprobante opcional (p.ej. "pago domiciliario", "compra empaques") — append-only, anular≠borrar;
  **(c) CIERRE** (ya existe, se enlaza al turno): conteo real A CIEGAS por medio → esperado = fondo + ventas
  efectivo + ingresos − egresos → descuadre calculado y sellado + observaciones;
  **(d) HISTÓRICO de turnos** con resumen (fondo/ventas por medio/gastos/esperado/real/descuadre/quién);
  **(e) SELLO UNIVERSAL**: todo evento de caja lleva fecha+hora del SERVIDOR + autor (regla §9.7) — nada con
  hora del dispositivo. El cierre Z actual sigue operando sin cambios hasta que 2.0 lo suceda (sin ventana rota).
- **2.1 Vínculo pedido↔cliente**: buscar/crear cliente rápido en mostrador; pedidos web sugieren match.
  **Clave canónica de identidad = legal_id normalizado** (dedup estilo ALTORRA) — el MISMO contrato que
  usará el portal (F5) para el claim. Documentar como decisión.
- **2.2 Factura multi-línea (TODO-41)**: generaliza `items[]`/cargos de F1 a N piezas + servicios por código
  (aquí nacen "ajuste de talla" y "garantía" — la posventa rutinaria de joyería); transacción multi-candado,
  movId por línea (nota C.5 del plan Fable).
- **2.3 Recibo/factura interna + IMPRESIÓN TÉRMICA + CAJÓN (directiva Daniel 2026-07-04)**: al facturar en
  POS el sistema imprime de inmediato y abre el cajón. Arquitectura por capas con fallback (módulo aislado
  `js/admin/print-service.js`, límite limpio §3.6):
  **v1 (día 1)**: recibo 80mm por print CSS (`@page` 80mm, márgenes 0) — funciona con CUALQUIER térmica
  instalada como impresora del sistema; Chrome `--kiosk-printing` opcional para saltar el diálogo;
  **v2**: ESC/POS DIRECTO vía WebSerial/WebUSB (Chrome): ticket raw + **pulso de apertura del cajón**
  (ESC p) inmediato tras cobro en efectivo/apertura de turno/arqueo — cada apertura del cajón queda
  REGISTRADA (evento auditado con autor+hora servidor); fallback automático a v1 si el hardware/navegador
  no soporta. **Reimpresión** desde el histórico del pedido/turno. Numeración = `contadores` existente.
  Gatea: inventario de hardware (Ítem 0f). El comprobante web **reusa el artefacto por-token de §164**
  (no crear un segundo recibo paralelo).
- **2.4 APARTADOS (TODO-39, si Daniel dice sí)**: pagos 1..N (anticipo/abonos/saldo) REUSANDO movimientos +
  saldo de cartera CRM; estado `apartado` = fila nueva en la tabla de transiciones de F1. **Decisión Fuerte**:
  su spec (comité+consejo) se corre EN PARALELO al cierre de F1 para que no espere.
- **2.5 Kardex read-only por pieza** (adelantado de F3: el ledger existe, es solo UI; Kary necesita ver
  movimientos para entender excepciones desde que haya ventas reales).

## 4. FASE 3 — INVENTARIO (puro)

- **3.1 Módulo Inventario**: vista stock multi-tipo (v3 ya en datos) + merma (UI sobre lo asentado en F1) +
  alertas stock bajo (simple). Valorización = columna derivada del kardex (el costo ya viaja en snapshot
  desde F1) — sin motor aparte.
- **3.2 Carga masiva** con Kary: flujo de alta rápida + plantilla (destrabada por precios/fotos — operativo).

## 5. CARRIL D — Catálogo público que escala (paralelo, fuera de fases)

El Bloque D del plan Fable NO engrana con inventario admin; su gatillo es (a) PAT GitHub y (b) señal de
costo/tráfico del onSnapshot. Se activa en cuanto exista el PAT: D.0 gems whitelist → D.1 query menguada →
7b JSON CDN con SWR → 7c/7d → D.5 filtros gema + catálogo lujo (TODO-57/50) → D.6 perf imágenes.

## 6. FASE 4 — CONTABILIDAD & REPORTES ("herramienta de confianza")

- **4.1 Reportes/KPIs** (agregación client-side, patrón ALTORRA): utilidad real (costoSnapshot de F1),
  histórico de arqueos/caja cuadra, ventas por canal-medio-período (lo no cubierto por KPI-v0), top piezas,
  cartera vencida (ya existe — se enlaza), leads→conversión.
- **4.2 Vista de recibos de caja** (anticipos/abonos de F2). Conciliación formal SOLO si el cierre Z
  demuestra no bastar (2 personas, 1 caja — no sobre-construir).
- **4.3 Export contador ampliado**: multi-línea + IVA de comisión discriminado (parcial ✅).

## 7. FASE 5 — CRM 360 / POSVENTA

- **5.1 Ingestión unificada** (patrón ALTORRA L-26/L-31): newsletter→CRM (TODO-17) · reviews reales (TODO-48)
  · timeline de actividades por cliente · clienteling (preferencias/fechas → recompra; el "porqué" de cada compra).
- **5.2 Portal del cliente** ("mis pedidos", cartera visible, claim por legal_id de F2): **condicionado a
  demanda medida** (clientes recurrentes pidiéndolo) — en lujo la relación vive en WhatsApp con Kary.
- **5.3 Contenido real web** (TODO-07) + verdad de marca (TODO-47) con Kary.

## 8. FASE 6 — ESCALA & PULIDO FINAL

RBAC granular (contador/asesor, TODO-19) · panel tipo-app (TODO-33, medir primero) · App Check enforce
(TODO-14, con tráfico) · Persona Jurídica Wompi · automatizaciones · **retoques finales de diseño** (el
cierre que pidió Daniel).

## 8b. Radar de completitud (visión de arquitecto — previsto, cada cosa con su fase)

Para que nada sorprenda después ("mirar al futuro", Daniel 2026-07-04). Previsto ≠ construir ya: cada ítem
tiene fase dueña y algunos esperan SEÑAL real (no sobre-construir para 2 personas):
- **Gastos generales del negocio** (arriendo, servicios, nómina — no solo gastos de caja): registro simple en
  F4 para que la utilidad de los reportes sea NETA real, no solo margen de piezas.
- **Proveedores y compras de material** (oro/piedras): registro de compra + **certificado de origen adjunto
  (RUCOM/LA-FT — obligación legal ya identificada en plan v3 §2)** → F3 (junto a inventario); costo de compra
  alimenta la valorización.
- **Comisiones de vendedoras**: `vendedoraId` ya existe en clientes; snapshot de comisión por venta (patrón
  ALTORRA §186) → F4 (reporte por vendedora). Señal: cuando Daniel defina el esquema de comisiones.
- **Descuentos/promociones**: línea de descuento controlada en la factura multi-línea (F2.2) con umbral de
  autorización del owner (reusa SoD del CRM). No módulo de promos masivas (eso es e-commerce de volumen, no lujo).
- **Cotizaciones formales**: la CF `cotizacion_rapida` (diseñada en plan v3 §10.3) + PDF/WhatsApp con vigencia
  → F2/F4 según demanda de Kary.
- **Reparaciones/garantía como flujo** (recepción de pieza del cliente → taller → entrega): v1 = servicio en
  factura multi-línea (F2.2) + estado en pedido; flujo de taller completo SOLO si el volumen lo pide (señal).
- **Devolución por retracto** (Ley 1480, 5 días): la máquina de estados F1 ya trae `reembolsado`; el flujo
  formal con plazos/registro → junto al módulo Pedidos (F1) como acción documentada.

---

## 9. Reglas de engranaje (vinculantes, anti-retroceso)

1. **Una entidad por concepto**: pedido=`pedidos` · dinero-cliente=`movimientos` CRM · stock=`pieces`+ledger ·
   persona=`clientes` (clave legal_id). NADA paralelo — ni en datos ni en navegación del panel.
2. Todo dinero/stock = **CF-only + append-only + anular≠borrar**. Correcciones = asiento nuevo.
3. **Contratos primero**: los campos/colecciones que una fase futura necesita se siembran ADITIVOS en la fase
   que toca ese código (items[], costoSnapshot, clienteId, flete, tabla de transiciones).
4. Cada fase: **spec → IAP → tests → deploy manual (L-22) → validación Chrome → ADR** + criterio de "hecho"
   y tamaño acotado ANTES de arrancar (anti-gold-plating). Decisión Fuerte → comité + consejo.
5. Cada módulo entregado incluye **mini-instructivo para Kary** (operadora única, no técnica).
6. Los precios NO bloquean ninguna fase; la 1ª APPROVED se monitorea siempre.
7. **Sello universal de tiempo y autor**: todo evento de dinero/caja/estado queda fijado con fecha+hora del
   SERVIDOR (`serverTimestamp`, nunca el reloj del dispositivo) + quién lo hizo — ya es el patrón del sistema
   (CRM/pedidos/arqueo); vinculante para caja, cajón, impresión y logística (directiva Daniel 2026-07-04).

## 10. Decisiones abiertas del dueño (gates puntuales, no de fase)

| # | Decisión | Bloquea | Estado |
|---|---|---|---|
| D-1 | Apartados/plan separe en mostrador (TODO-39) | F2.4 (solo ese ítem) | ✅ **SÍ** (Daniel 2026-07-04) — abonos = cartera CRM; pieza apartada se bloquea en la web; reglas finas (anticipo mínimo/plazo) se confirman con Kary en la spec de F2.4 |
| D-2 | Flete nacional pedido web pagado: cobrar aparte vs asumir | contrato flete F1-core | ✅ **COBRAR APARTE** (Daniel 2026-07-04, ratifica §9 del plan v3) — Kary cotiza/informa/cobra (link Wompi o transferencia); `flete{valorCOP, cobro:'cobrado', medio, estado}` en el pedido |
| D-3 | PAT GitHub | carril D | ⏳ pedida 2026-07-04 |
| D-5 | Inventario hardware POS (Ítem 0f: impresora térmica modelo/conexión · cajón monedero · equipo de Kary) | F2.3 impresión (solo ese ítem) | ⏳ preguntar a Kary |
| D-4 | ADDI (Kary vincula) / Persona Jurídica (contador) | nada del plan | ❄️ congeladas (sin cambio) |

## Checklist (evidencia por ítem al ejecutar)
- [ ] Ítem 0: decisiones D-1/D-2 registradas + protocolo interino entregado a Kary
- [ ] F1-PUENTE en prod (lista+detalle read-only + push) — evidencia: Chrome + pedido real visible
- [ ] F1-CORE en prod (tabla de estados + flete/merma/costuras + colas + gate E2E 3 flujos)
- [ ] F2 completa (sesión de caja 2.0 + vínculo cliente + multi-línea + recibo/impresión térmica/cajón + apartados + kardex)
- [ ] F3 (inventario UI + carga masiva) · Carril D (tras PAT) · F4 · F5 · F6 — ADR por fase
