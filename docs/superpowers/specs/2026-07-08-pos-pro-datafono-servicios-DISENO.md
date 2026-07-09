# F2 · POS profesional — Datáfono + reconciliación de vouchers + venta SIN pieza (TODO-73)

> **Decisión Fuerte de dinero** (Daniel 2026-07-08, tras §177). Toca el motor de cobro
> (`crearPedidoCore`) y el cierre de caja (`cerrarTurnoCore`). Interinato Opus: **TDD estricto**,
> NO tocar webhook/firma/reaper/snapshot. SSoT del modelo de caja: `2026-07-06-f2-0-caja-boveda-DISENO.md`.
> Decisiones del dueño ya tomadas: (1) descuadre de vouchers **NO bloquea** el cierre (como el efectivo);
> (2) venta **SIN pieza** = venta normal con solo servicios/línea libre.

## §1 · Problema (reportado por Daniel)
Los POS de joyería grande: (a) cobran con **datáfono** (tarjeta) — hoy no existe ese medio; (b) al
cerrar caja **cuadran los vouchers** del datáfono (cantidad de vouchers = nº de ventas con tarjeta; suma
de vouchers = total cobrado con tarjeta) — hoy el arqueo solo cuenta efectivo; (c) a veces se factura
**solo un servicio/modificación** (un arreglo) sin vender una pieza — hoy toda venta exige elegir pieza.

## §2 · Modelo actual (verificado en código)
- `MEDIOS = ['efectivo','transferencia','wompi','addi']` (`pedidos-core.js:14`). `crearPedidoCore` exige
  `pieceId` (`:200`), lee la pieza, evalúa stock, arma `items=[{L0 pieza}, ...extras]`, `total` server-side.
- `estadoInicial`: efectivo en-mano→`entregado`; efectivo con-envío→`pagado`; resto→`pago_por_verificar`.
- `cerrarTurnoCore` (`caja-core.js:65`) ya calcula `esperadoPorMedio` (Σ ventas por medio, `ESTADOS_CON_DINERO`)
  y acepta `conteoPorMedio` (objeto) — pero **solo reconcilia `efectivo`** (`declaradoEfectivo`/`descuadre`).
  `esperadoEfectivo` = fondo + ventas_efectivo + ingresos − egresos + bóveda↔cajón.
- POS `handleCierre` (`pos.js:1137`) manda `conteoPorMedio:{efectivo}`; `renderDigitalBreakdown` muestra
  transferencia/wompi/addi **informativos** (no se cuentan). El efectivo se cuenta a ciegas.
- `ventasEfectivoTurno` (pos.js) suma solo `medio==='efectivo'` → el datáfono NO entra al efectivo del cajón (correcto: es tarjeta).

## §3 · Diseño

### 3a · Medio DATÁFONO (tarjeta)
- `MEDIOS += 'datafono'`. `MEDIO_LABEL.datafono='Datáfono (tarjeta)'`. Opción en `#pos-medio`.
- **Pago inmediato** (el datáfono aprueba en el acto → como efectivo, NO "por verificar"):
  `enMano = (medio==='efectivo' || medio==='datafono') && canal==='pos' && !requiereEnvio`;
  `estadoInicial = (medio==='efectivo'||medio==='datafono') ? (enMano?'entregado':'pagado') : 'pago_por_verificar'`.
- El datáfono **NO suma al efectivo del cajón** (`ventasEfectivoTurno` sigue solo efectivo). Su plata vive en el voucher.
- Hint en `updateMedioHint`: "Tarjeta: queda ENTREGADA (pagada) de una vez; su voucher se cuadra al cerrar caja".

### 3b · Reconciliación de vouchers al CIERRE (descuadre NO bloquea)
- `cerrarTurnoCore` cuenta también la **CANTIDAD** de ventas datáfono con dinero → `esperadoDatafono = { suma: esperadoPorMedio.datafono, cantidad: <nº ventas datafono con dinero> }`.
- Acepta `conteo.datafono = { suma, cantidad }` (la cajera cuenta los vouchers a ciegas: cuántos y por cuánto).
- Calcula `declaradoDatafono` (enteros) y `descuadreDatafono = { suma: decl.suma−esp.suma, cantidad: decl.cantidad−esp.cantidad }`.
- **Sella en el turno** `esperadoDatafono`/`declaradoDatafono`/`descuadreDatafono` y los **devuelve**. **Nunca bloquea** (Daniel) — igual que el efectivo, el descuadre queda registrado para auditoría.
- Generalización acotada: solo el datáfono se "cuenta" (voucher físico). Transferencia/Wompi/Addi siguen informativos (se concilian contra banco/pasarela, no hay voucher físico).
- UI cierre: si hubo ventas datáfono, el modal pide **dos campos** extra (nº de vouchers + suma de vouchers) además del efectivo; al revelar el resultado muestra esperado vs contado (cantidad y suma) + descuadre por cada uno, con el mismo lenguaje "Cuadra/Sobra/Falta".

### 3c · Venta SIN pieza (solo servicios/monto libre)
- `crearPedidoCore`: `pieceId` **opcional**. Guard nuevo: `if (!pieceId && lineasExtra.length===0) throw 'Una venta necesita al menos una pieza o un servicio.'`
- Sin pieza: NO lee pieza / NO evalúa stock / NO decrementa; `piezaTotal=0`; `items = itemsExtra` (sin L0); `total = extrasTotal` (guard `total>0`); `consumioStock=false`; `desglose = { tipo:'sin_pieza', total:0 }`; `pieceName` = etiqueta legible (nombre/concepto de la 1ª línea, con "+N" si hay varias) para la lista de ventas.
- `enMano`/`estadoInicial`/enlace-turno: idénticos (por medio). `anularPedidoCore` ya salta la reposición si no hay `ped.pieceId` (`:727`) → sin cambio.
- Reglas Firestore: `pedidos` write:false cliente (escribe la CF) → **sin cambio de reglas**.
- POS UI: en el picker, acción secundaria "Cobrar solo servicio/modificación (sin pieza)" → abre la venta con el bloque de servicios ABIERTO, sin paso de precio de pieza; `computeTotal` con base 0; botón exige ≥1 línea.

## §4 · Invariantes que se preservan
- Total RECALCULADO server-side; `items[]`=SSoT (`sumaItems===total` o aborta). Idempotencia por `pedidoId`+fingerprint.
- Precio de servicio LEÍDO del catálogo en la tx (cero confianza cliente). Candado atómico solo si hay pieza.
- Cierre O(<400) por turnoId; ecuación de efectivo intacta (datáfono NO altera el efectivo esperado).
- NO se tocan: webhook Wompi, firma de integridad, reaper, snapshot inmutable del pedido (interinato).

## §5 · Archivos
- `functions/pedidos-core.js`: `MEDIOS+datafono` · pieceId opcional + rama sin-pieza · `enMano`/estadoInicial datáfono.
- `functions/caja-core.js`: `cerrarTurnoCore` cuenta cantidad datáfono + reconcilia `conteo.datafono`.
- `js/admin/pos.js`: medio datáfono (label+hint) · `computeTotal` sin-pieza · flujo "sin pieza" · cierre (inputs voucher + render descuadre datáfono) · `MEDIO_LABEL`.
- `admin-pos.html`: `<option datafono>` · botón "sin pieza" · campos voucher en el modal de cierre.
- Tests: `functions/f2-3-pos-pro.integration.test.mjs` (nuevo, emulador) + extender `caja.integration`/`f2-2` si aplica.

## §6 · Plan de pruebas (TDD — se escriben ANTES)
1. `crearPedido` medio=`datafono` (pos, sin envío) → `estado='entregado'`, cuenta en `esperadoPorMedio.datafono`, NO en efectivo.
2. `crearPedido` SIN pieza + 1 servicio → total=precio servicio, `items` sin L0, `consumioStock` ausente/false, NO decrementa ninguna pieza; `pieceName` legible.
3. `crearPedido` SIN pieza y SIN líneas → rechaza (`invalid-argument`).
4. `crearPedido` SIN pieza + servicio, luego **anular** → queda `anulado`, no repone stock (no hay pieza), reversa el total en el arqueo.
5. `cerrarTurno` con 3 ventas datáfono ($X total) → `esperadoDatafono={suma:X,cantidad:3}`; conteo `{suma:X,cantidad:3}` → descuadre 0; conteo `{suma:X-1000,cantidad:2}` → descuadre `{suma:-1000,cantidad:-1}` y **cierra igual** (no bloquea).
6. `cerrarTurno` sin ventas datáfono → `esperadoDatafono={suma:0,cantidad:0}`, sin exigir conteo.
7. No-regresión: efectivo/transferencia/wompi/addi + F2.2 (servicios sobre pieza) intactos; `sumaItems===total` en todos.

## §7 · Comité + gate
- Comité ×3 sobre este spec (money-safety) ANTES de codear. Consejo externo: si hay provider; si no, marcar NO-revisado-externo.
- Gate Chrome HOLÍSTICO en prod (login owner): venta datáfono → cierre cuenta voucher → descuadre; venta solo-servicio → anular. Barrido completo (lección §177).

## §8 · Comité ×3 (money-safety) — hallazgos y resoluciones (2026-07-08)
Tres expertos (contabilidad · concurrencia/idempotencia · UX-caja) razonaron sobre este spec + `pedidos-core`/`caja-core` verificados. Hallazgos incorporados:
- **[BLOQUEANTE] Null-safety de `conteo.datafono`** (`caja-core.js:121`): `conteo.datafono` es objeto anidado; `entero(conteo.datafono.suma)` reventaría **todo cierre solo-efectivo de hoy**. → `const cd = (conteo.datafono && typeof conteo.datafono==='object') ? conteo.datafono : {}`. Test obligatorio: cierre `{efectivo:X}` sin `datafono` cierra limpio.
- **[BLOQUEANTE] Doble-cierre idempotente pierde los vouchers** (`caja-core.js:76-81`): añadir `esperadoDatafono/declaradoDatafono/descuadreDatafono` TAMBIÉN al return de la rama `estado==='cerrado'` (leídos del turno sellado). Test: cerrar → re-cerrar → mismos 3 campos.
- **[ALTA · contable] Voucher físico vs ciclo del pedido**: un voucher se imprime al aprobar la tarjeta; anular la venta en el POS NO reversa el cobro en el datáfono/banco. Con `ESTADOS_CON_DINERO`, un datáfono anulado sale del esperado → la cajera cuenta un voucher que "SOBRA" (donde se esconde el fraude cobro-tarjeta/anulo/devuelvo-efectivo). **Resolución (MVP)**: `esperadoDatafono` = medios-que-cuentan (consistente con la plata); ADEMÁS exponer `datafonoAnuladoEnTurno = {suma,cantidad}` en el cierre → una sobra queda EXPLICABLE ("N cobros con tarjeta anulados: verifica que se anularan también en el datáfono"). NO bloquea. *(Decisión de proceso pendiente de confirmar con Daniel; el default es seguro y legible.)*
- **[ALTA · UX] Campos de voucher vacíos → "Falta $X · Faltan 3 vouchers" FALSO** (el error visible que Daniel odia): si se muestran los campos, **exigirlos** (como el efectivo: vacío → toast, no enviar). El core distingue `conteo.datafono` AUSENTE de `{0,0}`.
- **[ALTA · UX] No formatear la CANTIDAD como dinero** ("$3"): monto con `cop()`; cantidad como entero + "voucher(s)". Lenguaje: **Cuadra/Sobra/Falta** para el monto ($); **coinciden/sobran N/faltan N voucher(s)** para la cantidad. Mostrar SIEMPRE ambas etiquetadas (cruce = diagnóstico: cantidad-ok+monto-mal = tecleó mal; monto-ok+cantidad-mal = miscontó).
- **[MEDIA] `computeTotal` bloquea sin-pieza** (`pos.js:580` `if(!_selected) return 0`): flag `_sinPieza` → `base=0`, `total=extrasTotal`; botón se activa con ≥1 línea (precio>0).
- **[MEDIA] Guards**: `piezaTotal<=0 throw` SOLO si hay pieza; guard universal `total<=0 throw`. `pedidoId` sigue obligatorio.
- **[MEDIA] Consumidores de forma sin-pieza**: doc con `pieceId:null`, `pieceSlug:null` (NO el fallback `piece.slug||pieceId`); `desglose.tipo:'sin_pieza'` (la merma solo actúa en `por_peso` — verificado: `precio_fijo` ya avanza sin `peso`). Export contador usa `total`/`items` (verificado, OK).
- **[MEDIA] Cantidad y suma del MISMO predicado**: `medio==='datafono' && ESTADOS_CON_DINERO.has(estado)` en el MISMO `forEach` (cero lecturas nuevas).
- **[MEDIA · UX] Etiquetas claras**: "Datáfono (tarjeta en el local)" vs "Wompi (link/QR de pago)"; orden efectivo→datáfono→transferencia→wompi→addi; `renderDigitalBreakdown` NO incluye datáfono (evita doble-conteo). Botón sin-pieza SIEMPRE visible (no anidado en el hint que se oculta); encabezado "Servicio / Modificación (sin pieza)".
- **[BAJA] Back-compat**: turnos viejos sin `esperadoDatafono`/`datafono` → tratar ausente como `{suma:0,cantidad:0}` en el render (no NaN).
- **[LIMITACIÓN documentada] NO split-tender**: un pedido = UN medio. Pagar una pieza mitad tarjeta / mitad efectivo NO se modela (produciría descuadre datáfono/efectivo). → trabajo FUTURO (confirmar prioridad con Daniel).

**Tests añadidos al plan §6** (del comité): (8) cierre solo-efectivo SIN `conteo.datafono` no crashea; (9) doble-cierre devuelve los 3 campos de voucher; (10) datáfono ANULADO en el turno sale de esperado (suma Y cantidad) y aparece en `datafonoAnuladoEnTurno`; (11) turno MIXTO efectivo+datáfono: cantidad datáfono excluye las efectivo.

## §9 · PAGO DIVIDIDO / split-tender (Daniel 2026-07-08: SÍ, lo necesita) — modelo `pagos[]`
Una pieza (o servicio) se puede pagar con VARIOS medios a la vez (ej. $2M tarjeta + $1M efectivo). Esto
UNIFICA el modelo: el medio deja de ser un escalar → el pedido lleva `pagos[]`. Absorbe también el datáfono
(un medio más) y la reconciliación de vouchers (cuenta los PAGOS datáfono, no los pedidos).

- **Modelo**: `pedido.pagos = [{ medio, monto }]` con `Σ monto === total` (aserto server-side, como `items`).
  Pago único = `[{ medio, monto: total }]`. `medio` (top-level, back-compat) = el medio si es único, o `'mixto'`
  si hay >1 medio distinto (para el badge de la lista). Legacy (pedidos sin `pagos`) → se derivan de `{medio,total}`.
- **`crearPedidoCore`**: `input.pagos` opcional. Si ausente → `[{medio: input.medio||'efectivo', monto: total}]` (compat).
  Validar: cada `pago.medio ∈ MEDIOS`, `monto` entero >0, `Σ monto === total` (o `invalid-argument`). Máx ~4 pagos.
- **`estadoInicial`** (regla conservadora): `inmediato = todos los pagos ∈ {efectivo,datafono}`. Si `inmediato && pos && !envio` → `entregado`; si `inmediato && envio` → `pagado`; si **algún** pago es diferido (transferencia/wompi/addi) → `pago_por_verificar` (la venta entera espera; `confirmarPago` la libera). MVP: sin estados parciales por pago.
- **`cerrarTurnoCore`** (SSoT del arqueo = `pagos`): por cada pedido con dinero (`ESTADOS_CON_DINERO`), si tiene `pagos[]` → sumar cada `pago.monto` a `ventasPorMedio[pago.medio]`; si no (legacy) → `ventasPorMedio[medio] += total`. **Voucher datáfono**: `esperadoDatafono.cantidad` = nº de PAGOS `medio==='datafono'` en pedidos con dinero; `.suma` = Σ esos `monto`. El efectivo del cajón = Σ porciones efectivo (idéntico patrón). La ecuación de efectivo se preserva (usa `ventasPorMedio.efectivo` ya split-aware).
- **POS UI**: el paso "3 · Medio de pago" se vuelve un **constructor de pagos**: por defecto 1 pago = total (como hoy). Botón "Dividir pago" → agrega líneas `{medio, monto}`; el sistema muestra "faltan $X por asignar" y solo habilita registrar cuando `Σ === total`. Datáfono es un medio del selector de cada línea.
- **Invariante nuevo**: `Σ pagos.monto === total === Σ items` (doble aserto). Idempotencia/turno/candado intactos.
- **No-regresión**: pago único (mayoría) se comporta idéntico a hoy; `ventasEfectivoTurno` (pos.js) debe volverse split-aware o el cajón sub-cuenta los efectivos de pagos mixtos.
- **Tests añadidos**: (12) pago dividido tarjeta+efectivo → `pagos` suma total, arqueo asigna a cada medio, voucher datáfono cuenta 1; (13) `Σ pagos ≠ total` → rechaza; (14) split con un diferido → `pago_por_verificar`; (15) legacy sin `pagos` → arqueo lo cuenta por `{medio,total}` (compat).

> **Nota de alcance**: §9 (split-tender) agranda TODO-73 a un "POS-pro money-model" completo. Se implementa con TDD sobre el core primero (pedidos/caja), luego la UI (constructor de pagos + cierre con vouchers + sin-pieza), luego gate holístico. El core es lo caro de revertir → va con pruebas ANTES.

## Checklist
- [x] Comité ×3 sobre el spec (money-safety) — findings incorporados (§8)
- [x] Decisiones del dueño: anular-tarjeta (se reversa en terminal) + pago dividido (SÍ) — §9
- [ ] Núcleo `pagos[]` + datáfono + sin-pieza (TDD, pedidos-core) verde
- [ ] `cerrarTurnoCore` split-aware + vouchers (TDD, caja-core) verde
- [ ] Tests escritos ANTES (rojos) — plan §6
- [ ] 3a datáfono (core + POS) verde
- [ ] 3b vouchers al cierre (core + UI) verde
- [ ] 3c venta sin pieza (core + POS) verde
- [ ] No-regresión: suites caja/f2-2/rules verdes
- [ ] Gate Chrome holístico prod verde
- [ ] ADR + índice + cierre TODO-73
