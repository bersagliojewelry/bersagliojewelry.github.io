# PROMPT para Consejo Externo (Gemini 3.1 Pro · High) — Modelo de Inventario Multi-Tipo

> **Daniel: copia TODO el bloque de abajo en Antigravity (Gemini 3.1 Pro, High) y tráeme la respuesta.**
> Decisión Fuerte: toca el cobro/POS en producción + modelo de datos. Gemini ve el repo en solo-lectura.
> Gemini ASESORA, NUNCA edita — yo delibero/decido/implemento.

---

Eres un revisor de arquitectura adversarial con acceso de SOLO LECTURA a este repo (joyería de lujo Bersaglio,
HTML/JS vanilla + Firebase + GitHub Pages). NO propongas editar archivos: critica. Tu trabajo es cazar el fallo en
el modelo de abajo con evidencia, no aprobarlo por cortesía. Si hay un hueco operativo, transaccional o de datos que
rompa una joyería real, demuéstralo.

## Contexto
El POS de mostrador (Cloud Function `crearPedido`, `functions/pedidos-core.js`) hoy, al vender una pieza, marca
`estado='vendida'` y **NO decrementa `cantidad`** → trata todo como pieza única. El negocio NO es todo único: hay
lotes/series, piezas a medida, por encargo, y "agotada pero re-fabricable". Se va a rediseñar el modelo de inventario
ANTES de cargar mucho inventario. Ya pasó por un comité interno ×4 + 3 respuestas de negocio del dueño.

Archivos reales a revisar: `functions/pedidos-core.js` (POS: crearPedido/confirmarPago/anularPedido/cierreCaja) ·
`firestore.rules` (`pieceClassValid` ~358, `pieceStockLocked` ~368 — `estado`/`reservaId`/`reservaExpira` son CF-only;
`cantidad` la edita la admin) · `scripts/generate-pieces.mjs` (SSG → `catalogo.json`) · el diseño completo
`docs/superpowers/specs/2026-06-26-modelo-inventario-multitipo-design.md` (§9 comité, §10 modelo refinado).

## Modelo propuesto (refinado)
Campos de la pieza: `stockType ∈ {finito, encargo}` + `cantidad` (int; la CF decrementa al vender) + `refabricable`
(bool: finito agotado → "bajo pedido") + `visibilidad ∈ {publica, privada}` (privada = facturable pero fuera del
catálogo) + `sizes` (array, talla ajustable — SIN stock por talla) + `price` (fijo por ficha; el peso vive en `specs`).
`estado` = DERIVADO de `cantidad` (CF-only): `cantidad<=0 && !refabricable → agotada`.

Decisiones de negocio del dueño (ya fijadas): (A) tallas = pieza única con talla ajustable, no stock por talla. (B)
precio fijo por ficha (misma ficha = mismo precio; otro peso = otra ficha); las modificaciones/ajustes se facturan en
**líneas aparte con código** (la factura debe ser multi-línea: pieza + modificación/servicio). (C) "a medida" usa
`visibilidad` privada/pública.

Plan transaccional (del comité, a validar): decrementar `cantidad` al **CREAR** el pedido (que nace
`pago_por_verificar`) con `FieldValue.increment(-1)` dentro de la transacción con candado=pieza; `reservaExpira` (TTL) +
un **reaper** (Cloud Scheduler) que libera pedidos vencidos no pagados (`increment(+1)`); `confirmarPago` NO toca stock;
`anularPedido` re-incrementa idempotentemente (gateado por la transición de estado del pedido). Legacy sin `cantidad`
= 1. Reglas-primero (aditivas), luego CF; tests de integración en rojo antes de tocar la CF viva.

## Preguntas (específicas, con evidencia)
1. ¿El modelo de 5 campos (stockType+cantidad+refabricable+visibilidad+sizes) tiene huecos o estados contradictorios?
   ¿`refabricable` debería fundirse con `stockType` en un enum `disponibilidad`, o el bool ortogonal está bien?
2. ¿Decrementar al CREAR + reserva + reaper es la elección correcta para un POS de MOSTRADOR (venta presencial, no
   pasarela)? ¿O en mostrador conviene otra cosa? ¿El reaper introduce algún riesgo nuevo?
3. ¿"`cantidad` editable por la admin (reabastecer) Y decrementada por la CF" es seguro con `FieldValue.increment`, o
   hay un race que se escapa?
4. ¿La convención "precio fijo por ficha + modificaciones en línea aparte" tiene un hueco fiscal/operativo (IVA sobre
   la modificación, devoluciones, anticipos)?
5. ¿`visibilidad: privada` (facturable pero fuera del catálogo) abre algún riesgo de seguridad/fuga (una pieza privada
   que se filtre al `catalogo.json` o a una URL pública horneada)?
6. ¿Qué riesgo de segundo orden se le escapó al comité y al dueño?

No te subordines. Veredicto claro + los cambios innegociables antes de tocar el POS en producción.
