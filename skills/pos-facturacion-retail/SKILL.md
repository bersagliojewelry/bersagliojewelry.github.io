---
name: pos-facturacion-retail
description: Usar al DISEÑAR, auditar o explicar un sistema POS / facturación / caja de retail (joyería, tienda, concesionario, restaurante) — para que el sistema se comporte como los POS profesionales reales (Square, Odoo POS, Alegra POS, Siigo) y no como una app de "botones que mueven números". Cubre semántica de anulación vs devolución, sesiones de caja y arqueo, pagos divididos, notas crédito y el contexto colombiano (DIAN, POS electrónico). Triggers — "¿por qué se puede anular una venta entregada?", "cómo funciona un POS de verdad", "diseña el flujo de devoluciones", "arqueo/cierre de caja", "factura electrónica DIAN".
actualizada: 2026-09-02
reglas: 6
lecciones: []
---

# POS y facturación de retail — cómo funcionan los sistemas reales

> Origen: pregunta real del dueño (2026-07-10): *"¿por qué se anularía una venta que ya está
> confirmada, con dinero ingresado y entregada al cliente?"* — Tenía razón: el sistema ofrecía
> "Anular" donde un POS real jamás lo permite. Esta skill codifica la semántica correcta.

## 1. Los TRES caminos de deshacer una venta (jamás uno solo)
| Camino | Cuándo | Ventana | Quién | Efecto |
|---|---|---|---|---|
| **VOID (anular)** | Error de REGISTRO inmediato: se digitó mal, el cliente se arrepintió antes de irse | SOLO el turno/sesión de caja ABIERTO (antes del arqueo) | La cajera | Reverso completo: venta marcada anulada (nunca borrada), stock repuesto, el dinero no salió o se devuelve en el acto; el arqueo del turno ya no la espera |
| **DEVOLUCIÓN (return/refund)** | El cliente REGRESA con el producto después (horas/días) | Post-cierre, según política (retracto Ley 1480 Art. 47 CO: 5 días HÁBILES en ventas a distancia (igual que legal-colombia); garantía) | Supervisor/dueño (aprobación) | Documento NUEVO (nota crédito / reembolso) enlazado a la venta original — la venta original NO se toca; el dinero sale HOY (egreso trazable o reversa de pasarela); el stock vuelve por alta consciente si el producto está apto |
| **CORRECCIÓN contable** | La venta fue real pero mal clasificada (medio/monto) | Cualquier momento | Dueño (doble aprobación) | Asiento inverso + asiento correcto — jamás editar el original |
Regla de oro: **una venta con dinero ingresado y mercancía entregada NUNCA se "anula"** — se
devuelve o se corrige, cada una con su documento, su motivo y su aprobación. Si tu UI muestra
"Anular" fuera del turno abierto, es un agujero de auditoría (y de robo).

## 2. Sesión de caja (turno) — el contenedor de TODO el efectivo
- Apertura: fondo declarado (base para cambio) → todo movimiento de efectivo pertenece a UN turno.
- Durante: ventas por medio, ingresos/egresos con concepto de lista CERRADA + nota, traslados a
  bóveda/caja fuerte cuando se supera el límite del cajón (con registro par).
- **Arqueo A CIEGAS**: la cajera declara lo contado ANTES de ver lo esperado (si ve el esperado
  primero, el conteo "se ajusta solo"). Esperado = fondo + ventas efectivo + ingresos − egresos
  − traslados netos. Descuadre = declarado − esperado; se SELLA con el turno (inmutable).
- Vouchers de datáfono: se reconcilian por CANTIDAD y MONTO contra el sistema; anulaciones de
  tarjeta del turno se listan (el voucher físico existe aunque la venta muriera).
- Pagos divididos (split-tender): cada pierna va a SU medio en el arqueo; la porción en medios
  inmediatos (efectivo/tarjeta) cuenta aunque la pierna diferida (transferencia) siga pendiente.

## 3. Documento de venta (la factura vive en el pedido)
- Snapshot INMUTABLE al confirmar: items {id, nombre, precio, cantidad, naturaleza bien/servicio},
  total, medio(s), vendedor, cliente (si se identifica). El precio se re-lee SERVER-side al
  cobrar (el carrito/la UI solo muestran).
- Numeración: consecutivo interno contable (nunca se reusa, ni al anular) + código público para
  el cliente. En Colombia: si hay resolución DIAN de facturación, el rango/prefijo es sagrado.
- Estados post-pago como MÁQUINA (tabla, no ifs): pagado → preparación → despacho/retiro →
  entregado → (devuelto). Los estados "con dinero" definen qué espera el arqueo.

## 4. Colombia (DIAN) — lo mínimo para no pisar callos
- **Documento equivalente POS electrónico** (Res. 000165/2023): obligatorio vía proveedor
  tecnológico autorizado; tope 5 UVT por operación para venderle a consumidor final con POS —
  por encima, factura electrónica. Joyería de alta gama: casi toda venta supera el tope →
  planear FE con proveedor (Alegra/Siigo/Factus como emisores) e integrarse por Adapter (no
  acoplar el schema propio a UBL).
- Nota crédito electrónica para devoluciones sobre factura electrónica emitida.
- Bancarización (art. 771-5 ET): pagos relevantes por canal financiero trazable para que el
  gasto/costo sea deducible — todo pago del sistema exige cuenta origen.
- No calcular retenciones en el POS: se capturan los datos (NIT, régimen) y el contador liquida.

## 5. Anti-patrones que delatan un POS amateur (checklist de auditoría)
- "Anular" visible fuera del turno abierto o sin motivo/traza. ✗
- Editar/borrar ventas o movimientos (en vez de documentos inversos). ✗
- Arqueo que muestra el esperado antes del conteo. ✗
- Ventas mixtas que no reparten por medio en el arqueo. ✗
- Devolución sin documento propio (tocando la venta original). ✗
- Efectivo del cajón calculado en el cliente como única verdad (la autoridad es el server). ✗
- Números de dinero que se recortan/clampan cuando dan negativo. ✗
- Descuentos/cambios de precio sin registro de quién y por qué. ✗

## 6. Diseño de referencia mínimo (para construir uno nuevo)
Entidades: venta (snapshot) · sesión/turno · movimientoCaja · traslado (par atómico) · devolución
(doc enlazado) · arqueo (sellado). Principios: server como único escritor del dinero · ledger
append-only · idempotencia por id de operación GLOBAL · doble aprobación de lo destructivo ·
misma cifra en las 3 vistas (UI/sello/ledger — ver skill `auditoria-financiera`).
