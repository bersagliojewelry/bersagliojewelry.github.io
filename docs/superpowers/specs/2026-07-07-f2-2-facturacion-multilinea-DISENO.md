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

## Checklist
- [ ] Comité ×3 sobre este diseño (Decisión Fuerte de dinero) — refinar §6.
- [ ] Consejo externo (provider) — crítica adversarial.
- [ ] Decisiones A–D cerradas (Daniel/comité).
- [ ] CF `crearPedido` + `servicios` (TDD estricto, interinato).
- [ ] Reglas `servicios` + tests.
- [ ] UI POS multi-línea + total en vivo.
- [ ] CMS de servicios (Kary).
- [ ] Gate live Chrome + ADR + cache bump.
