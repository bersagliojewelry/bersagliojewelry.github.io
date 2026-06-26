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

---

## 11. Modelo v2 — post-Gemini + visión "pensar en grande" (Daniel 2026-06-26)

> **Gemini RECHAZÓ el §10.** Claude verificó sus 13 claims contra el código (crudo+tabla → bóveda
> `2026-06-26-gemini-inventario-multitipo-CRUDO.md`). 2 innegociables reales + 1 cambio de visión de Daniel
> que reactiva el reaper. Este §11 es el modelo que se implementa (reemplaza §10.1 donde difiere).

### 11.0 Cambio de visión que lo gobierna todo (Daniel)
> *"El pago por web se genera AUTOMÁTICO (Wompi/PSE) para piezas con stock; lo presencial es lo único manual.
> Más adelante más pasarelas. La idea es que esto sea como Mercado Libre. Pensar en grande."*

⇒ La web **transaccionará** (cobra sola) ⇒ habrá **concurrencia real web↔mostrador** sobre la misma `cantidad`
⇒ el **reaper/reserva del comité §9.1 SÍ es necesario** (no era YAGNI). Y aparece una regla nueva: con pago
**automático**, *"mostrador gana"* solo aplica sobre reservas web **NO pagadas**; jamás sobre una venta web **pagada**.

### 11.1 Decisiones de arquitectura (resueltas con evidencia)

**D1 · enum, no bool (resuelve la inconsistencia §9.1↔§10.1; comité+Gemini coinciden).**
Se EXTIENDE el enum existente `stockType` (aditivo, NO rename — §3.2) a **3 valores**, y se ELIMINA el bool `refabricable`:
| `stockType` | cantidad | Cubre | `estado` derivado |
|---|---|---|---|
| `finito` | int≥0 | Lote/serie (N) · Única/a-medida (1) | `cantidad<=0 → agotada` (fuera del listado) |
| `finito_refabricable` | int≥0 | Agotada pero re-fabricable | `cantidad<=0 → bajo_pedido` (sigue pedible, PreOrder) |
| `encargo` | n/a (null) | Por encargo (se fabrica) | siempre disponible |
Cierra los combos imposibles por definición (no existe "encargo+refabricable"). `cantidad` solo aplica a `finito*`.

**D2 · `cantidad` = stock TRANSACCIONAL (cierra el TOCTOU, Gemini claim 3 — INNEGOCIABLE).**
Hoy `cantidad` la pisa el merge del form (`piezas.js:480-493`) y NO está en `pieceStockLocked` (`rules:368`). Al pasar a
ser decrementada por la CF, eso resucita inventario fantasma. Fix:
- El form de edición del admin **NO envía `cantidad`** (blind update) → no la pisa.
- `cantidad` inicial se fija solo al **CREAR** la pieza; reabastecer = acción dedicada **`reabastecerStock(pieceId, +N)`**
  (CF, `FieldValue.increment`, nunca `set` absoluto — comité §9.1).
- Reglas: en `update`, `cantidad` ausente del payload del cliente (se suma a la familia `pieceStockLocked`); la CF la gestiona.

**D3 · Reserva multi-canal + reaper (comité §9.1, ahora REFORZADO por la web transaccional).**
Candado atómico = doc de la pieza (`runTransaction`), uniforme para web y mostrador:
- **Crear pedido** → `cantidad = increment(-1)` + pedido nace `pago_pendiente`(web)/`pago_por_verificar`(pos). 
- **`reservaExpira` (TTL)** en pedidos no pagados + **reaper** (Cloud Scheduler) → vencido: `increment(+1)` + pedido `expirado`.
- **`confirmarPago`** (mostrador) / **webhook Wompi** (web) → `pagado`; NO toca stock (ya decrementado).
- **`anularPedido`** → `increment(+1)` idempotente (gateado por transición de estado del pedido).

**D4 · "Mostrador gana" con candado de pago (Gemini claim 2, refinado para pago automático).**
`forcePosOverride` (POS) roba la unidad SOLO si la reserva en conflicto es **no pagada** (`pago_pendiente`/`por_verificar`):
cancela ese pedido (→`cancelado`) y procede. **NUNCA** sobre un pedido web **`pagado`** (sería reembolso): ahí el POS ve
"agotada" y no fuerza. Regla de negocio nueva, crítica del modelo automático.

**D5 · Blindaje VIP (`visibilidad:privada`) — Gemini claim 5 — INNEGOCIABLE, va ANTES del campo.**
`firestore.rules /pieces:590` hoy = `allow read: if true`. Antes de introducir `visibilidad`:
`allow read: if !('visibilidad' in resource.data && resource.data.visibilidad == 'privada') || isVentas();`
(público lee solo no-privadas; staff lee todo). El SSG excluye privadas = defensa en profundidad (oscuridad), pero la
**regla** es la barrera real. La web pública/checkout solo lee piezas públicas (las privadas se facturan vía mostrador/CRM).

**D6 · Transición de tipo purga campos (Gemini claim 6).** Al cambiar `stockType`→`encargo`, `cantidad`=null (admin/CF
limpian el campo del tipo anterior; sin basura que rompa la escasez).

### 11.2 Modelo final v2 (campos de la pieza)
| Campo | Escribe | Valores | Nota |
|---|---|---|---|
| `stockType` | Kary (admin) | `finito`·`finito_refabricable`·`encargo` | **enum 3 (D1)**; reemplaza stockType-2 + refabricable |
| `cantidad` | **CF-only** (crear+increment+reabastecer) | int≥0 / null(encargo) | **stock transaccional (D2)**; el form NO la pisa |
| `visibilidad` | Kary | `publica`·`privada` | **NUEVO**; privada = facturable fuera del catálogo (D5 blinda la regla) |
| `sizes` | Kary | array | tallas ajustables, sin stock por talla (§10 A) |
| `price` | Kary | number fijo | por ficha; modificación = línea facturable aparte (TODO-41) |
| `estado` | **CF-only** | derivado de cantidad+stockType | `agotada`/`bajo_pedido`/disponible (D1) |
| `reservaExpira` | **CF-only** | ts / null | TTL de la reserva no pagada (D3) |

### 11.3 6 lentes (arquitecto)
- **Negocio**: refleja la operación real (lote/única/encargo/refabricable) + venta web automática + privadas VIP.
- **Escala (Mercado Libre)**: candado per-doc (Firestore serializa por pieza; joyería = baja contención por pieza, sin
  cuello de botella). El modelo separa STOCK (cantidad/reserva) de PAGO (medio/pasarela/webhook) → sumar pasarela = nuevo
  `medio` + su webhook, **sin tocar el candado de stock**. Diseñado para crecer sin retrabajo.
- **Seguridad**: `cantidad`/`estado`/`reservaExpira` CF-only (validación server-side); regla `/pieces` blinda privadas (D5).
- **Costo**: cero infra nueva en Fase 1; reaper = 1 Cloud Scheduler (Fase 2) — barato. Catálogo público sigue estático (SSG).
- **Mantenibilidad**: enum aditivo, defaults tolerantes (legacy `finito`/`cantidad??1`/`publica`); módulos desacoplados.
- **Integración**: `catalogo.json` (paso 7) = punto único de lectura pública; webhooks de pasarela (Wompi→Fase 2) =
  evento que dispara `confirmarPago`; el POS llama la CF (request-response). Cada canal entra por el mismo candado.

### 11.4 Fases (pensar en grande SIN sobre-construir)
- **FASE 1 (AHORA · precede la carga masiva · solo mostrador)**: enum `stockType` (D1) + `visibilidad` (D5 con regla
  blindada) + `cantidad` transaccional bajo CF (D2) + `reabastecerStock` + transición purga (D6) + SSG filtra privadas +
  CF `crearPedido` decrementa `cantidad` con candado (mostrador, sin reaper: Kary presente, `anular` repone). Tests en rojo
  primero. **Desbloquea la carga de inventario.**
- **FASE 2 (cuando se conecte el checkout web Wompi)**: reserva web al crear + `reservaExpira` + reaper (Cloud Scheduler) +
  webhook Wompi→`confirmarPago` + `forcePosOverride` con candado de pago (D4).
- **FASE 3 (Mercado Libre)**: multi-pasarela (PSE/otras), cada una = `medio`+webhook sobre el mismo candado.

### 11.5 IAP v2 (delta sobre §5)
- **(A) Modificar**: `firestore.rules` (enum stockType 3, `visibilidad` validado, regla read blindada D5, `cantidad` a
  stockLocked en update) · `functions/pedidos-core.js` (decrementa cantidad + estado derivado; + `reabastecerStock`; Fase 2:
  reserva/reaper/override) · `functions/` nueva CF `reabastecerStock` · `js/admin/piezas.js`+`admin-piezas.html` (select de 3
  + checkbox/`visibilidad`; QUITAR `cantidad` del save de edición; botón Reabastecer) · `scripts/generate-pieces.mjs`
  (filtra `visibilidad:privada`; PreOrder para `finito_refabricable`). **Deploy reglas+functions = MANUAL (L-22).**
- **(B) INTACTOS**: contrato base `catalogo.json` (aditivo: +visibilidad-filter, +estado bajo_pedido) · `confirmarPago`/
  `cierreCaja`/CRM · carrito web (sigue lead-gen hasta Fase 2).
- **(C) Código muerto**: el bool `refabricable` NO se introduce (se evita); `estado='vendida'` directo → reemplazado por
  derivación de `cantidad`.
- **(D) Refactor scope**: medio-alto (reglas + núcleo CF de ventas en prod + admin + SSG). Fase 1 acotada.
- **(E) Riesgos+rollback+tests**: P0 = tocar `crearPedido` (prod, dinero/stock) → tests de integración por tipo EN ROJO
  antes; candado atómico ya existe; rollback = revertir CF (1 deploy). Migración legacy = defaults tolerantes. Pruebas en
  vivo DIFERIDAS (§130.4).

---

## 12. Modelo v3 — consolidación del Comité adversarial v2 (2026-06-26)

> Comité acotado ×5 (`wf_3b6fd939-9ee`, crudo+síntesis → bóveda `2026-06-26-comite-inventario-v2-SINTESIS.md`).
> **Veredicto unánime: `aprobado_con_cambios`** (modelo base correcto; refinamientos críticos). Convergencias fuertes
> (C1-C5) = varios lentes coinciden. Este §12 manda sobre §11 donde refina.

### 12.1 Cambios INNEGOCIABLES adoptados (sobre v2)
- **C1 · Migración = EL entregable de F1.** Script idempotente legacy `{estado, refabricable}` → `{stockType, cantidad,
  visibilidad}` ANTES de activar la CF de decremento. `refabricable:true→finito_refabricable`; `vendida→cantidad:0`;
  `visibilidad:'publica'` a todo. Invariante post: ¬`(estado=='vendida' && cantidad>0)` ∧ ¬`(finito* && cantidad==null)`.
  Gate de deploy: 0 piezas finito* sin cantidad. (Sin esto: `increment(-1)` sobre cantidad ausente → -1 → pieza desaparece.)
- **C2 · `cantidad` CF-only por IGUALDAD** (no "ausencia", ambigua con merge:true): regla `req.resource.data.cantidad ==
  resource.data.cantidad` en update de cliente + **blindar también CREATE**. `cantidad`/`estado`/`reservaExpira` → familia
  stockLocked. Único escritor = CF.
- **D5 fail-CLOSED** (corrige v2): el default "ausente=pública" es fail-open (VIP sin campo se filtra). Backfill `'publica'`
  a todo legacy + criterio unificado en regla+SSG+queries como **`visibilidad != 'privada'`** (NO igualdad a 'publica', que
  borraría legacy del catálogo).
- **C4 · Ledger append-only** `pieces/{id}/movimientos` `{delta, motivo, pedidoId, actor, ts}` — auditoría de cada cambio
  de stock (lujo: cuadrar inventario, devoluciones, mermas). Toda CF de stock escribe aquí.
- **Negocio F1:** CF **`ajustarStock(pieceId, delta, motivo)`** (MERMA/daño/robo/corrección — delta firmado, no-negativo,
  auditado). Sin esto Kary no opera inventario físico real. + vista admin "pedidos por_verificar antiguos" (F1 sin reaper).
- **Datos:** `crearPedidoCore` **gate por stockType** (no `increment(-1)` ciego sobre encargo/null). Transición D6 (→encargo
  purga cantidad) vía CF **`cambiarTipoPieza`** (cantidad CF-only; el form no la setea).

### 12.2 Adoptado para F2/F3 (DOCUMENTADO ahora, NO se implementa en F1)
- **C3 · Contrato webhook Wompi (escrito ya):** verificar firma HMAC (else 401) + idempotencia por `transactionId` +
  re-consultar API de Wompi (source of truth) + validar `monto==total` server-side + máquina de estados (APPROVED solo
  desde pendiente; VOIDED/DECLINED tardío → `disputa/a_revisar`, NO repone auto). "pagado intocable" (D4) solo vale si no se falsifica.
- **C5 · Invariante STOCK-ONLY:** doc pieza = SOLO `{cantidad, reservaId, reservaExpira}`; el PAGO vive 100% en `/pedidos`;
  ninguna pasarela toca `/pieces` salvo reservar/liberar por `reservaId`. (multi-pasarela sin regresión del candado).
- **Reaper:** CAS dentro de `runTransaction` + estado intermedio **`pagado_sin_stock`/`a_revisar`** (webhook tardío sobre
  reserva ya liberada NUNCA revende auto) + colchón **GRACE** (2-3 min). Fn única **`liberarReserva(pedido)`** compartida por
  reaper+anular (evita doble +1). `forcePosOverride` atómico (releer estado del pedido en la tx; abortar si ya pagó).
- **Máquina de estados del pedido EXPLÍCITA (SSoT):** matriz (estado×evento → ¿legal? ¿toca stock?). Invariante:
  `cantidad_fisica == inicial - reservas_activas - vendidas_confirmadas`.
- **Negocio F2:** estado **`apartado`/abono parcial** EXCLUIDO del reaper (= TODO-39); transición **`devuelto`** (reingreso
  idempotente, post-entrega); validar `price` contra doc VIVO (no `catalogo.json` horneado) en cobro auto.
- **Escala F2:** disponibilidad para COMPRAR se lee de Firestore en vivo (SSG = hint SEO; el JSON horneado queda stale).
  Hot-doc: líneas `cantidad>1` virales → reservas como sub-docs (umbral); piezas únicas → candado per-doc. Multi-vendedor =
  gancho `ownerId` futuro (candado per-doc sobrevive).

### 12.3 PLAN F1 (orden de implementación — precede la carga masiva)
1. **Backfill legacy** (C1) idempotente + invariantes + gate. **PRIMERO.**
2. **Reglas** (C2 + D5 fail-closed + enum 3 + `visibilidad`): deploy MANUAL, aditivas primero (L-22).
3. **CFs:** `crearPedidoCore` (decrementa, gate stockType, estado derivado) · `ajustarStock` · `reabastecerStock` ·
   `cambiarTipoPieza` — todas → ledger `movimientos` (C4).
4. **Admin** (`piezas.js`/`.html`): select enum 3 + `visibilidad`; QUITAR `cantidad` del save de edición; botones Reabastecer/Ajustar.
5. **SSG** (`generate-pieces.mjs`): filtra `!= publica`; PreOrder `finito_refabricable`; excluye privadas del sitemap.
6. **Tests integración EN ROJO primero** (lote→agota, refabricable→bajo_pedido, encargo no decrementa, merma, anular repone,
   migración invariantes). Pruebas en vivo DIFERIDAS (§130.4).
