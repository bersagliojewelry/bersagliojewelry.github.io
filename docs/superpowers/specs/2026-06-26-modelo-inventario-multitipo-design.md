# Modelo de Inventario Multi-Tipo — DISEÑO (Decisión Fuerte · TODO-40)

> **Estado**: DISEÑO. Decisión Fuerte (modelo de datos + toca el POS en prod `crearPedido`/`anularPedido` + reglas).
> **Autor**: Claude `[OPUS-4.8]` (2026-06-26). **Pendiente**: comité ×3 + consejo externo (Gemini) + luz verde Daniel.
> **Origen**: Daniel revela que Bersaglio NO es todo único (`[[project_inventario_multitipo]]`). Idealmente PRECEDE
> la carga masiva de inventario (si no, recargar). Conecta con paso 7 §11 (escasez) y el `catalogo.json`.

## 1. Realidad del negocio (Daniel 2026-06-26)
4 modos de disponibilidad + mucho inventario por cargar:
1. **Lote / serie** — varias unidades iguales (cantidad N).
2. **Única / a medida / exclusiva** — 1 de 1 irrepetible.
3. **Por encargo** — se fabrica bajo pedido (sin inventario).
4. **Agotada pero RE-FABRICABLE** — "se fabrica una vez, pero si la solicitan se le fabrica" (stock 0 pero pedible).

## 2. Modelo ACTUAL verificado (código real)
- **Datos de pieza**: `stockType ∈ {finito, encargo}` + `cantidad` int≥0 (form `admin-piezas.html`; valida `pieceClassValid`,
  `firestore.rules:358`). `estado`/`reservaId`/`reservaExpira` = **stock transaccional CF-only** (`pieceStockLocked`,
  `firestore.rules:368` — Kary nunca los manda; no des-vende a mano). `cantidad` la EDITA Kary (no bloqueada).
- **POS** (`functions/pedidos-core.js:77`): al vender una **finita** marca `estado='vendida'`; **NO decrementa `cantidad`**.
  Las `encargo` no se marcan (se fabrican). `anularPedido` reintegra `vendida→disponible`.
- **Bug de fondo**: Kary declara `cantidad`, la CF marca `estado` — **dos sistemas paralelos desconectados**. Vender 1
  de un lote de 3 marca TODA la pieza vendida → se "pierden" las otras 2. El modelo NO soporta multi-unidad real.

## 3. Diseño propuesto — 3 campos cubren los 4 tipos
Añadir UN campo a los 2 existentes (cambio mínimo, aditivo):

| Campo | Quién escribe | Valores | Significado |
|---|---|---|---|
| `stockType` | Kary (admin) | `finito` \| `encargo` | ¿tiene inventario físico? (ya existe) |
| `cantidad` | Kary declara · **CF decrementa** | int ≥ 0 | unidades disponibles (finito). Lote: N · única: 1 (ya existe) |
| `refabricable` | Kary (admin) | bool (NUEVO) | para `finito`: al llegar a 0, ¿se puede pedir bajo encargo? |

**Los 4 tipos**:
1. **Lote/serie** → `finito`, `cantidad:N`, `refabricable` según reabastezca.
2. **Única/a-medida** → `finito`, `cantidad:1`, `refabricable:false` (irrepetible).
3. **Por encargo** → `encargo` (cantidad/refabricable no aplican).
4. **Agotada-refabricable** → `finito`, `cantidad:0`, `refabricable:true` → ofrece "bajo pedido" (no desaparece).

**Estado derivado de disponibilidad (para `available`/escasez del `catalogo.json` + cliente):**
- `encargo` → disponible · "Hecho por encargo".
- `finito` `cantidad>umbral` → disponible (sin escasez).
- `finito` `cantidad` 1–umbral → disponible · "Solo quedan N" / "Última unidad".
- `finito` `cantidad:0` `refabricable:true` → disponible (bajo pedido) · "Agotado · se fabrica bajo pedido".
- `finito` `cantidad:0` `refabricable:false` → NO disponible · fuera del listado, ficha "Vendida·ver similares" (paso 7 §10.1).

## 4. Cambio CLAVE: la CF decrementa `cantidad` (decisión cara de revertir)
`crearPedido` (hoy marca `estado='vendida'`) pasa a, dentro de la MISMA transacción atómica (candado=pieza):
- `encargo` → no toca stock (infinito).
- `finito` → `cantidad = cantidad - 1`. Si `cantidad` llega a 0: `refabricable:false` → `estado='agotada'`;
  `refabricable:true` → queda `cantidad:0` SIN `estado` agotada (sigue pedible). **Rechaza la venta si `cantidad<=0`
  y NO refabricable** (precondición, espeja el `estado==='vendida'` actual).
- `anularPedido` → `cantidad = cantidad + 1` (y limpia `estado='agotada'` si la había puesto).

**Tensión `cantidad` editable (Kary) vs decrementada (CF)** — la decisión a validar con comité/consejo:
- **Opción A (recomendada)**: `cantidad` sigue editable por Kary (es SU inventario; reabastecer = subir cantidad) Y la
  CF la decrementa atómicamente. La transacción garantiza consistencia. Simple, reusa el modelo. Riesgo: Kary podría
  subir cantidad y "des-agotar" — pero es legítimo (reabasteció). El stock transaccional crítico (no despachar sin pago)
  sigue en `pedidos`/`estado` CF-only, no en `cantidad`.
- **Opción B**: separar `cantidadInicial` (Kary) de `cantidad` (CF-only, stockLocked). Más limpio pero Kary no reabastece
  sin CF. Sobre-ingeniería para joyería (Kary gestiona inventario a mano). → descartada salvo que el consejo la defienda.

## 5. IAP (Impact Analysis Previo)
**(A) A modificar**:
- `firestore.rules`: `pieceClassValid` + `(!('refabricable' in d) || d.refabricable is bool)`. `cantidad` sigue editable
  (Opción A). `estado` sigue en `pieceStockLocked` (CF-only). **Deploy reglas = MANUAL (L-22).**
- `functions/pedidos-core.js`: `crearPedido` decrementa `cantidad` + lógica agotada/refabricable; `anularPedido`
  re-incrementa. Tests de integración (lote: vender 3 → agota; refabricable: vender hasta 0 → sigue pedible; anular → repone).
  **Deploy functions = MANUAL (L-22).**
- `admin-piezas.html` + `js/admin/piezas.js`: checkbox `refabricable` (visible solo si `finito`; `syncStockFields` lo
  togglea junto con cantidad). `populateForm`/`handleSave`.
- `scripts/generate-pieces.mjs`: `publicPiece` + `refabricable` + `available` y `cantidad` ya consideran los nuevos casos
  (available true si refabricable aunque cantidad 0). SSG schema: `cantidad:0`+refabricable → `availability: PreOrder`
  (no OutOfStock — se puede pedir).
- Cliente (con paso 7 §11): badges de escasez derivados.

**(B) INTACTOS**: el contrato base del `catalogo.json` (paso 7) ya expone `stockType`/`cantidad`/`available` → solo se
SUMA `refabricable` (aditivo). `confirmarPago`/`cierreCaja`/CRM intactos.
**(C) Código muerto**: ninguno.
**(D) Refactor scope**: medio — reglas + CF (núcleo de ventas, en prod) + admin form + SSG + cliente.
**(E) Riesgos + rollback + tests**:
- *Riesgo P0*: tocar `crearPedido` (en prod, dinero/stock). Mitigación: tests de integración por tipo + el candado
  atómico ya existe; cambio aditivo (decrementar en vez de marcar). Rollback: revertir la CF (1 deploy).
- *Riesgo*: piezas legacy sin `refabricable`/`cantidad` → default tolerante (`finito`, cantidad 1, refabricable false).
- *Pruebas en vivo DIFERIDAS* (§130.4); build+tests por commit.

## 6. Migración / carga del inventario
- Piezas legacy: `stockType||'finito'`, `cantidad??1`, `refabricable??false` (defaults tolerantes; ya en el código).
- **La carga masiva debería esperar este modelo** (Daniel: mucho inventario por cargar) — si se carga antes, habría que
  re-tocar cada pieza para fijar tipo/cantidad/refabricable. Orden recomendado: modelo → cargar.

## 7. 6 lentes (arquitecto)
- **Negocio**: refleja la operación real (lotes/única/encargo/refabricable); habilita escasez honesta (conversión).
- **Escala**: el decremento es 1 write atómico por venta (barato); el catálogo público sigue estático (paso 7).
- **Seguridad**: `estado` sigue CF-only; `cantidad` editable por Kary es legítimo (su inventario). Validación server-side
  en reglas + CF.
- **Costo**: cero infra nueva; reusa CF/reglas/SSG existentes.
- **Mantenibilidad**: 1 campo nuevo (`refabricable`); aditivo, defaults tolerantes; no rompe legacy.
- **Integración**: el `catalogo.json` (paso 7) es el punto único; el cliente deriva escasez de 3 campos.

## 8. Preguntas para comité / consejo externo
1. ¿`cantidad` editable por Kary + decrementada por la CF (Opción A) es seguro, o hay que separar inicial/disponible (B)?
2. ¿El modelo de 3 campos (stockType+cantidad+refabricable) cubre los 4 tipos sin huecos, o falta un caso (p.ej.
   reserva temporal, pre-venta, made-to-order con anticipo)?
3. ¿Decrementar en `crearPedido` (que crea el pedido en `pago_por_verificar`) es correcto, o el stock debe bajar solo
   al CONFIRMAR el pago? (riesgo: reservar stock con un pedido sin pagar vs vender dos veces).
4. ¿La escasez "Solo quedan N" con `cantidad` editable por Kary es suficientemente honesta?

---

## 9. REVISIÓN tras Comité ×4 (acotado · 2026-06-26) — el modelo "3 campos" NO basta

Crudo → bóveda `2026-06-26-comite-inventario-multitipo-CRUDO.md`. Cero cuelgues. **3 fallos estructurales + decisiones
técnicas duras. El modelo simple debe revisarse; faltan datos de negocio (Daniel) antes de cerrarlo.**

### 9.1 Lo ADOPTADO ya (técnico, no necesita a Daniel)
- **Decremento al CREAR + reserva + reaper** (ing. transaccional): decrementar al crear cierra el oversell, pero exige
  `reservaExpira` (TTL, ya previsto en el modelo) + un **reaper** (Cloud Scheduler) que libere pedidos
  `pago_por_verificar` vencidos (`expirado` + `increment(+1)`) — si no, **fuga de stock** (unidad inmovilizada para
  siempre). `confirmarPago` NO toca stock (ya decrementado).
- **`cantidad` = ÚNICA verdad; `estado` DERIVADO** (ejecutor): `cantidad<=0 && !refabricable → agotada`. NUNCA escribir
  `estado='vendida'` Y `cantidad` en paralelo (incoherencia: vendida con stock 4).
- **`FieldValue.increment(-1/+1)`, NUNCA `set` absoluto** (arquitecto + transaccional): Kary reabasteciendo con
  `set({cantidad})` pisa decrementos concurrentes. Reabasto = delta o CF transaccional.
- **Idempotencia por transición de estado del pedido** (transaccional): anular/reaper gatean sobre el cambio de estado
  del pedido (token); libera la unidad exactamente una vez; re-evalúa `estado` (agotada→disponible si cantidad>0).
- **Legacy `cantidad ?? 1`** (ejecutor): nunca `undefined--`=NaN.
- **Deploy reglas PRIMERO (aditivas), luego CF; tests de integración en ROJO antes de tocar la CF viva** (ejecutor).
- **Modelo: enum `disponibilidad` en vez de bool `refabricable` ortogonal** (arquitecto): el bool multiplica estados
  inválidos (`encargo`+`refabricable` se solapan). Enum cierra las combinaciones imposibles.

### 9.2 Lo que DEPENDE de Daniel (negocio — bloquea el modelo final)
El comité demostró que el modelo correcto depende de cómo opera Bersaglio DE VERDAD:
- **A. Variantes por TALLA** (el agujero más grande): ¿un anillo en tallas 5/6/7 es 1 ficha con stock por talla, o ya
  se maneja como fichas separadas? Si hay stock por talla → `cantidad` plana NO sirve; se necesita un **sub-doc de
  variantes** (talla → stock + precio). Hoy `sizes` es solo un array sin stock.
- **B. Precio por gramo / no fungible**: en un "lote", ¿cada pieza pesa/cuesta distinto (oro al gramo) o son idénticas
  con un precio? Si varían → "cantidad:N + un precio" miente; cada unidad sería su propia ficha.
- **C. "A medida"**: ¿una pieza hecha PARA un cliente entra al catálogo público? Si NO → necesita un estado
  archivada/no-replicable (ni "disponible" ni "agotada"), distinto de "única de vitrina".

### 9.3 Próximo paso
Respuestas de Daniel (A/B/C) → refinar el modelo (¿variantes sí/no? ¿enum de disponibilidad final?) → 2ª opinión
externa (Gemini) → implementar (tests en rojo primero). **NO cerrar el modelo ni la carga de inventario sin A/B/C.**

---

## 10. Modelo REFINADO — respuestas de negocio de Daniel (2026-06-26)

Las 3 respuestas **resuelven los 3 agujeros del comité** y simplifican el modelo (no necesita variantes por talla):

**A. Tallas → pieza ÚNICA con talla AJUSTABLE** (no stock por talla). "Una sola pieza, la talla se ajusta al
vender/fabricar." ⇒ `sizes` sigue como array (tallas ofrecidas/ajustables), **SIN** sub-doc de variantes. El agujero #1
del comité NO aplica. ✅

**B. Precio → FIJO por ficha; variaciones = línea de factura aparte.** "Si la publicación detalla UN peso y UNAS
características, TODAS cuestan exactamente lo mismo; a menos que se solicite una modificación al interno." ⇒ cada FICHA =
un peso (en `specs`) = un precio → `cantidad:N` + un precio **SÍ es honesto** (el agujero #2 se cierra por convención de
negocio: otro peso = otra ficha). **NUEVO requisito**: la facturación debe permitir **líneas de tipo "modificación/
servicio"** (códigos facturables), no solo piezas → **TODO-41** (toca el POS/factura, no el inventario). Daniel: "el
sistema debe ser robusto y bien pensado para una joyería SIN LIMITACIONES, SIN VACÍOS."

**C. A medida → eje de VISIBILIDAD (pública | privada), independiente del stock.** Pública = se puede subir como
ejemplo/propuesta (con autorización del cliente + sin contrato de exclusividad). Privada = **NO va al catálogo PERO sí se
factura** (existe en Firestore para la venta/factura, fuera del SSG/`catalogo.json`). ⇒ **campo nuevo `visibilidad ∈
{publica, privada}`**; el agujero #3 se cierra.

### 10.1 Modelo final (campos de la pieza)
| Campo | Escribe | Valores | Nota |
|---|---|---|---|
| `stockType` | Kary | `finito` \| `encargo` | finito = unidades; encargo = bajo pedido (ya existe) |
| `cantidad` | Kary declara · **CF `increment`** | int ≥ 0 | unidades; la CF decrementa al vender. Talla NO la subdivide |
| `refabricable` | Kary | bool | `finito` agotado (0) → "bajo pedido" (no desaparece) |
| `visibilidad` | Kary | `publica` \| `privada` | **NUEVO**. privada = facturable pero fuera del catálogo/SSG |
| `sizes` | Kary | array | tallas ofrecidas (ajustables); sin stock por talla (ya existe) |
| `price` | Kary | number | fijo por ficha (el peso vive en `specs`); variación = modificación facturable |
| `estado` | **CF-only** | derivado | `cantidad<=0 && !refabricable → agotada` (única verdad = `cantidad`) |

- **`catalogo.json` / SSG**: solo piezas `visibilidad:'publica'` entran al catálogo público (las privadas se excluyen del
  SSG y del JSON, pero existen para facturar). Aditivo al filtro `isPublishable`.
- Disponibilidad/escasez derivada (§ paso-7 §11): igual, más el caso privada (no aparece).

### 10.2 Lo que queda para el flujo
- **Adoptado** (comité §9.1): decremento al CREAR + `reservaExpira` + reaper · `cantidad`=única-verdad · `increment` ·
  idempotencia por transición · legacy `??1` · reglas-primero · tests-en-rojo.
- **Resuelto** (Daniel §10): sin variantes por talla · precio fijo por ficha · `visibilidad` pública/privada.
- **Derivado nuevo**: **TODO-41 facturación multi-línea** (pieza + modificación/servicio con códigos) — separado, toca POS/factura.
- **Pendiente**: 2ª opinión externa (Gemini) sobre el modelo refinado → implementar (tests en rojo primero). El modelo
  PRECEDE la carga masiva de inventario.
