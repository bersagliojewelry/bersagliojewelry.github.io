# F2.2 — Facturación multi-línea (pieza + servicios/modificaciones) · DISEÑO

> **Estado**: BORRADOR de diseño (paso 1 del flujo fuerte). Falta: comité ×3 + consejo externo → refinar → implementar (CF TDD estricto, interinato Opus 4.8) → gate live Chrome.
> **SSoT del plan**: `2026-07-04-plan-unico-erp-v4.md` (F2.2). Deriva de `modelo-inventario-multitipo-design.md §10` + **TODO-41**.
> **Decisión de negocio (Daniel 2026-07-07)**: **AMBOS** — catálogo de servicios (código+precio fijo, Kary lo gestiona) **+** línea libre (concepto+precio a mano) para trabajos únicos.

---

## 0 · Objetivo

Hoy el Mostrador cobra **UNA pieza** por venta. F2.2 permite que una venta/factura tenga **varias líneas**:
la pieza **+** N líneas de "servicio/modificación" (grabado, ajuste de talla, reparación, mantenimiento…),
cobradas por **código de catálogo** (precio fijo) **o** como **línea libre** (concepto + precio a mano).

**No-objetivos** (para no ampliar el alcance): (a) NO es venta de varias PIEZAS en una factura (sigue 1 pieza + servicios; multi-pieza = evaluación aparte si Daniel lo pide); (b) NO toca inventario (los servicios no descuentan stock); (c) NO congela costo (F3, hoy `costoSnapshot:null`).

---

## 1 · La costura YA existe (F1-CORE)

`crearPedidoCore` ([pedidos-core.js:244](../../../functions/pedidos-core.js)) ya escribe el snapshot con un arreglo de líneas:
```js
items: [{ pieceId, pieceName, pieceSlug, cantidad: 1, precio: total, costoSnapshot: null }],
```
con el comentario *"F2.2 generaliza a N líneas"*. F2.2 **extiende** este arreglo; no reescribe el motor.

---

## 2 · Modelo de datos

### 2.1 Catálogo de servicios — colección nueva `servicios/{id}` (CF-only o admin-write acotado)
| Campo | Quién | Tipo | Nota |
|---|---|---|---|
| `codigo` | Kary | string único | ej. `GRAB`, `TALLA`, `REP` (para buscar/facturar rápido) |
| `nombre` | Kary | string | ej. "Grabado láser", "Ajuste de talla" |
| `precio` | Kary | number (COP entero) | precio fijo del servicio |
| `activo` | Kary | bool | inactivo = no aparece en el POS, pero facturas viejas lo conservan |

Gestión: página CMS simple owner/admin (`admin-servicios.html` o pestaña en Configuración). **Decisión abierta A** (ver §6).

### 2.2 Extensión de `pedido.items[]`
Cada ítem gana un discriminador `tipo` (aditivo; los pedidos viejos sin `tipo` se leen como `'pieza'`):
```js
items: [
  { tipo: 'pieza',    pieceId, pieceName, pieceSlug, cantidad, precio, costoSnapshot: null },
  { tipo: 'servicio', servicioId, codigo, nombre, cantidad, precio },   // precio = del catálogo (server-side)
  { tipo: 'libre',    concepto, cantidad, precio },                     // precio = del cliente, con guardas
]
```
`total = Σ(item.precio × item.cantidad)` — **recalculado SIEMPRE en el servidor**.

---

## 3 · Cambios en la Cloud Function `crearPedido` (⚠️ motor de cobro)

`crearPedidoCore(db, input)` acepta un nuevo `input.lineasExtra?: Array` (opcional; ausente = comportamiento actual EXACTO → no-regresión):
```js
lineasExtra: [
  { tipo: 'servicio', servicioId, cantidad? },   // el server LEE el precio del catálogo (nunca del cliente)
  { tipo: 'libre', concepto, precio, cantidad? }, // el server toma el precio del cliente, con guardas
]
```
**Money-safety (invariantes NO negociables)**:
1. **Servicios**: el precio se lee de `servicios/{servicioId}` DENTRO de la tx (candado) — el navegador manda solo el id. Servicio inexistente/inactivo → `failed-precondition`. Cero confianza en el precio del cliente.
2. **Línea libre**: `precio` del cliente PERO con guardas server-side: entero positivo, `≤ TOPE` (ej. $50.000.000, anti-dedo), `concepto` obligatorio (1–120 chars). `cantidad` entero 1..N (tope pequeño).
3. `total` = precio de la pieza (lógica actual intacta) **+** Σ(líneas extra). Sigue siendo la ÚNICA verdad (el snapshot congela el desglose).
4. **Idempotencia intacta**: mismo `pedidoId` → mismo pedido (las líneas ya quedaron en el snapshot; no se recobran).
5. **Arqueo/turno**: `total` con servicios entra al turno igual (ventas por medio). La pieza sigue mandando el consumo de stock; los servicios NO tocan stock.

**Interinato Opus 4.8**: TDD estricto en `functions/` · deploy manual · NO tocar webhook/firma/reaper/snapshot. `crearPedido` SÍ se modifica (es el objetivo), con no-regresión probada (venta de 1 pieza sin líneas = idéntica).

---

## 4 · UI del Mostrador (POS)

Tras elegir la pieza y su precio (flujo actual intacto), aparece un bloque **"Servicios / modificaciones (opcional)"**:
- **Agregar del catálogo**: buscador/`<select>` de servicios activos → clic agrega la línea con su precio.
- **Agregar línea libre**: campo concepto + campo precio → agrega.
- **Lista de líneas** agregadas (con botón quitar) + **total en vivo** (pieza + servicios) que ESPEJA lo que cobrará la CF (doctrina "nunca mostramos un total distinto al que se cobra").
- Confirmar → `crearPedido` con `lineasExtra`.

La factura/ticket (F2.3 térmica, futura) y el detalle en Pedidos muestran el desglose de líneas.

---

## 5 · Reglas Firestore

- `servicios/{id}`: `read` = staff de ventas (para el POS); `write` = admin/owner (o CF-only, decisión A). El precio que cobra la CF se lee server-side, así que aunque el read sea amplio, no hay riesgo de manipulación del cobro.
- `pedidos`: sin cambios (sigue `create,update,delete: if false` → CF-only). `items[]` es parte del snapshot que la CF ya escribe.

---

## 6 · Decisiones abiertas (para el comité / Daniel)

- **A · Gestión del catálogo de servicios**: ¿admin escribe directo `servicios` (más simple, como piezas/colecciones) o CF-only (consistente con la doctrina "el dinero lo escribe la CF")? Como el cobro re-lee el precio server-side, admin-write directo es defendible y más barato. **Propuesta: admin-write con reglas acotadas.**
- **B · Tope de línea libre**: monto máximo por línea (anti-dedo). **Propuesta: $50.000.000** (revisable).
- **C · ¿Servicio sin pieza?** ¿Se puede facturar SOLO un servicio (reparación de pieza ajena, sin vender pieza)? Hoy `crearPedido` exige `pieceId`. Si Daniel factura reparaciones sueltas, hay que permitir venta sin pieza (línea(s) sola(s)). **Pendiente confirmar con Daniel.**
- **D · Impuestos/retenciones por servicio**: el export contador (`calcularNeto`) hoy asume venta de pieza. ¿Los servicios tienen trato fiscal distinto? **Diferir a revisión con el contador.**

---

## 7 · Verificación (plan)

- TDD `functions/`: no-regresión (1 pieza sin líneas = snapshot idéntico) · servicio del catálogo (precio server, no del cliente) · línea libre (guardas: negativo/cero/tope/concepto vacío rechazados) · total = pieza+líneas · idempotencia con líneas · servicio inactivo/inexistente rechazado · arqueo del turno suma el total con servicios.
- `test:rules` para `servicios`.
- Build + gate live Chrome (venta real pieza+servicio en prod, anulada al cierre).

---

## 8 · Síntesis del comité ×3 (v2 — REFINAMIENTOS VINCULANTES)

> Deliberación CRUDA: `../brain-private/bersaglio/2026-07-07-comite-f2-2-multilinea-CRUDO.md` (3 lentes: backend/dinero · UX/mostrador · seguridad/reglas/fiscal). **Veredicto convergente: GO CONDICIONADO** — columna vertebral correcta; cerrar los P0 de abajo antes de codear; **D (fiscal) = gate que exige al contador antes de congelar el esquema.**

### 8.1 Invariantes de dinero (asertados en la tx, pre-commit)
1. `pedido.total === Σ(item.precio×item.cantidad) === desglose.total` — **`items[]` = SSoT; `desglose` DERIVADO y asertado, jamás del cliente**. Si no cuadra → aborta.
2. Exactamente 1 ítem `tipo:'pieza'`, `cantidad===1` (server-enforced; si no, desincroniza stock).
3. `tipo:'servicio'`: precio LEÍDO de `servicios/{id}` en la tx + `activo===true`, o **FALLA CERRADO** (aborta la venta; nunca omite ni $0).
4. `tipo:'libre'`: precio entero `[1, TOPE]` (rechazar 0/negativo/NaN/float/string), `concepto` 1–120 **saneado**, `cantidad` `[1, MAX]`.
5. **Caps**: nº de líneas por venta `≤ 20` · cap a la suma de extras · `total > 0` (anti-payload/1MiB/timeout).
6. **Idempotencia con FINGERPRINT del payload**: mismo `pedidoId` → snapshot VERBATIM; fingerprint distinto → rechaza/marca; jamás re-decrementa stock ni re-suma al turno.
7. **Snapshot auto-contenido**: cada línea congela `codigo+nombre+precioSnapshot` (no solo `servicioId`) → editar el catálogo mañana NO altera ventas viejas ni la reimpresión.
8. **`lineId` estable por ítem DESDE YA** (barato; habilita anulación parcial futura sin migrar).
9. **Anular revierte el TOTAL COMPLETO** del turno (pieza + servicios), todo-o-nada. **Política post-cierre**: definir (bloquear anulación de turno cerrado, o movimiento compensatorio en el turno abierto).
10. Servicios NO tocan stock (ruta de decremento de la pieza intacta). Mismo `turnoId` que la pieza.
11. `lineasExtra` ausente ⇒ salida **byte-idéntica** al comportamiento actual (test de no-regresión #1).

### 8.2 Seguridad de la línea libre (superficie de fraude/error)
- **Saneo del `concepto` en DOS frentes**: (a) **XSS** al renderizar (POS/auditoría/factura) — DOM-safe; (b) **CSV/Formula-injection** en el export contador — neutralizar líder `= + - @`, filtrar saltos/control/RTL. (El `csvCell` actual escapa comillas pero NO neutraliza el líder de fórmula → **bug latente a corregir también en el export existente**.)
- Auditar cada línea libre: `addedByUid + role + turnoId + precioSnapshot + motivo` (server-side).

### 8.3 Decisiones A–D
- **A · Catálogo `servicios`**: **owner-only** (el precio de servicio ES dinero → least-privilege; `caja`/`admin` NO editan). Write vía reglas directas ACOTADAS (`hasOnly([codigo,nombre,precio,activo,naturaleza,createdAt,updatedAt])` · `precio is int>=0` · `codigo` inmutable en update · `nombre` 1..80 · `activo` bool) + **soft-delete** (prohibir `delete`, solo `activo:false`) + **auditoría del cambio de precio** (doc inmutable). READ = staff ventas (owner/admin/catalogo/**caja**). _(La ruta de VENTA re-lee el precio server-side → segura sin importar cómo se escriba el catálogo; por eso write-directo owner-gated es aceptable y más barato que CF, con la auditoría como red.)_
- **B · Tope línea libre**: **triple cap** (por línea + suma + nº de líneas) + **umbral blando** que marca la línea para revisión del owner en la Auditoría. Tope duro **configurable por el dueño** (`config/…`), alineado al ticket de SERVICIOS (~$1–2M), no al de una pieza.
- **C · Servicio sin pieza**: **NO en F2.2** (rama sin stock/reserva; `pieceId=null` rompe consumidores; toca el reaper PROHIBIDO). Modelo self-describing (`tipo`) no lo precluye → **F2.3 aparte**.
- **D · FISCAL = GATE 🔴**: servicio ≠ bien en IVA/retenciones/factura DIAN. El esquema NACE con **`naturaleza:'bien'|'servicio'` + `precioSnapshot` por línea** y `desglose{subtotalBienes,subtotalServicios}` + slot `impuesto` por línea (default 0, aditivo) → agregar IVA luego NO es migración. **NO congelar el export contador / la lógica fiscal sin confirmar con el CONTADOR**: (1) ¿responsable de IVA? ¿Régimen Simple (RST)? (RST cambia las retenciones); (2) IVA por tipo; (3) ReteFuente/ReteICA bienes vs servicios; (4) UNSPSC/factura. Consultar skill `legal-colombia` + contador.

### 8.4 UX (vinculante)
- **Bloque de servicios COLAPSADO por defecto** ("+ Agregar servicio/modificación") → la venta solo-pieza (mayoría) queda idéntica a hoy.
- **Catálogo PRIMERO** = chips grandes de un toque ("+ Grabado $20.000"); **línea libre = último recurso** "Otro (a mano)", secundario, con concepto obligatorio antes del precio + formato de miles automático.
- **El TOTAL del botón Confirmar = el del SERVIDOR** (nunca un cálculo del navegador que pueda divergir → regla de oro). Confirmación final = recibo miniatura con TOTAL dominante.
- Cantidad: default 1 oculto; stepper "− 1 +" dentro de la línea (no campo tecleable). Botón quitar grande + feedback del nuevo total. Ticket muestra concepto legible, no el código interno.
- Catálogo de servicios: en **Configuración** (no en el flujo POS) + atajo; anti-duplicados al crear; editar precio no altera ventas viejas.

## Checklist
- [x] Comité ×3 sobre este diseño (Decisión Fuerte de dinero) — refinado en §8 (CRUDO en bóveda).
- [ ] **GATE D (fiscal)**: confirmar régimen/IVA/retenciones con el contador ANTES de congelar el esquema/export.
- [ ] Consejo externo (provider) — crítica adversarial.
- [ ] Decisiones A–D cerradas (Daniel/comité).
- [ ] CF `crearPedido` + `servicios` (TDD estricto, interinato).
- [ ] Reglas `servicios` + tests.
- [ ] UI POS multi-línea + total en vivo.
- [ ] CMS de servicios (Kary).
- [ ] Gate live Chrome + ADR + cache bump.
