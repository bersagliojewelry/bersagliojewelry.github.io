# PROMPT PARA CONSEJO EXTERNO (Gemini 3.1 Pro High vía Antigravity) — Plan Único ERP v4

> **Uso**: Daniel pega TODO lo de abajo en Antigravity cuando quiera y trae la respuesta a Claude,
> quien la evalúa como peer review (adopta lo correcto, refuta lo errado — el consejo asesora, NUNCA edita).
> **No bloquea** el arranque de la Fase 1; su crítica se integra en las specs detalladas de fase.

---

Actúa como arquitecto de sistemas ERP adversarial con experiencia REAL en retail de joyería de lujo
latinoamericano. Tu trabajo es ENCONTRAR FALLAS en el roadmap siguiente, no validarlo. Sé específico y
despiadado: fugas operativas, fiscales, de concurrencia, de secuencia, y todo lo que un plan "de escritorio"
no ve hasta que duele en producción.

CONTEXTO: Bersaglio Jewelry, alta joyería colombiana (Cartagena). 2 personas operan: Kary (operadora única,
no técnica: mostrador + despachos + CRM) y Daniel (dueño). Stack serverless zero-budget: Firebase
(Firestore/Functions/Auth) + GitHub Pages + JS vanilla. 100% COP. DIAN la lleva el contador externo (la
plataforma solo da facturación/contabilidad internas + export CSV). Pagos online: Wompi (tope
$2.5M/transacción, cuenta Persona Natural), verificado en prod. Ventas: web + mostrador físico + WhatsApp.
Envíos: local Cartagena con domiciliario propio gratis; nacional con transportadora asegurada elegida por
pedido; recogida en tienda con cita.

YA CONSTRUIDO (auditado, en producción): entidad pedidos creada SOLO por Cloud Functions con snapshot
inmutable de precios · stock atómico multi-tipo (lote/única/encargo/refabricable) con ledger append-only ·
POS de mostrador (una pieza por venta, VOID, cierre Z de caja con descuadre, export al contador con
bruto/comisión/retenciones/neto) · checkout web con Wompi (webhook firmado idempotente + reaper de reservas)
· CRM de cartera con 344 clientes y $506M en cuentas por cobrar (saldo recalculado server-side, aging FIFO,
acuerdos de pago) · RBAC por claims.

EL PLAN A CRITICAR (resumen; orden = prioridad):
- ÍTEM 0 (día 1, sin código): decidir apartados/plan separe · decidir política de flete nacional post-pago
  (cobrar aparte vs asumir) · pedir PAT GitHub · protocolo interino para la 1ª venta web.
- FASE 1 PEDIDOS & LOGÍSTICA: primero un "slice puente" read-only (lista+detalle de pedidos pagados con
  datos de contacto/entrega + push al celular) en días; luego máquina de estados server-side por TABLA de
  transiciones (pagado→preparación→despacho_nacional|entrega_local|listo_retiro→entregado; ruta corta POS
  "entregado en mano"; terminales reembolsado/cancelado), flete como CARGO aditivo (snapshot intacto, con
  estado de cobro), merma de oro asentada al ledger de la pieza, y costuras sembradas hoy: items[] (1 ítem),
  costoSnapshot congelado (utilidad futura), clienteId nullable, guía visible en el comprobante del cliente.
  Colas de excepción (pago_por_verificar / a_revisar / pagado_sin_stock con opción "ofrecer refabricación").
- FASE 2 POS COMPLETO: vínculo pedido↔cliente (clave canónica = cédula normalizada) → factura multi-línea
  (piezas + servicios: ajuste de talla, garantía) → recibo imprimible → APARTADOS reusando los movimientos
  de la cartera CRM (anticipo/abonos = asientos de cartera, no colección paralela) → kardex read-only.
- FASE 3 INVENTARIO: UI de stock multi-tipo + merma + carga masiva. (Valorización = derivada del costo ya
  congelado.)
- CARRIL D (paralelo): catálogo público servido desde JSON estático en CDN (hoy es onSnapshot de Firestore
  que escala costo con tráfico) + filtros por gema.
- FASE 4 CONTABILIDAD/REPORTES: KPIs client-side (utilidad real por costo congelado, caja cuadra, ventas por
  canal), vista de recibos. FASE 5 CRM 360 (ingestión unificada multicanal, clienteling, portal cliente
  condicionado a demanda). FASE 6 escala (RBAC granular, App Check enforce, PJ Wompi, retoques de diseño).
- REGLAS: una entidad por concepto (nada paralelo) · dinero/stock CF-only append-only · contratos aditivos
  sembrados en la fase que toca el código · cada módulo con mini-instructivo para la operadora.

PREGUNTAS CONCRETAS (responde estas primero, luego lo que veas):
1. ¿Qué fuga operativa/fiscal/de concurrencia ves en el manejo del flete post-pago y la merma de oro?
2. ¿El modelo de apartados sobre la cartera CRM (asientos de cartera + estado 'apartado' en el pedido) tiene
   alguna trampa contable o de UX que no estemos viendo (IVA sobre anticipos, apartado que expira, cliente
   que abandona con 80% pagado)?
3. ¿Qué falta en la máquina de estados de pedidos para joyería real (talleres, ajustes post-entrega,
   devoluciones por retracto Ley 1480 de 5 días)?
4. ¿El orden de fases desperdicia algún time-to-value obvio o paga deuda cara después?
5. ¿Qué harías DISTINTO para un equipo de 2 personas sin presupuesto?

Formato: hallazgos numerados con severidad (BLOQUEANTE/ALTA/MEDIA/BAJA), cada uno con el escenario concreto
donde duele y el cambio propuesto. Nada de generalidades.
