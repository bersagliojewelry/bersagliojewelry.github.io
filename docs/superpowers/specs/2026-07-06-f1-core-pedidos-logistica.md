# F1-CORE — Pedidos & Logística (spec ejecutable · 2026-07-06 · Fable 5)

> **SSoT de F1-CORE** (plan único ERP v4 `2026-07-04-plan-unico-erp-v4.md` §2). Escrita para que
> **Opus 4.8 la ejecute SIN decisiones abiertas** si la cuota Fable muere (interinato §158/§161;
> cuota al 88% al escribirla). TODO lo verificable contra código fue verificado por Fable HOY —
> las rutas/líneas citadas son reales, no supuestas. **Regla de lectura: si el código real
> contradice esta spec, STOP y preguntar a Daniel — no improvisar en dinero.**

---

## 0. REGLAS DE INTERINATO OPUS 4.8 (vinculantes, antes de tocar nada)

1. **Anúnciate**: commits con tag `[OPUS-4.8]` en el cuerpo; footer `Co-Authored-By:` del modelo REAL de la sesión.
2. **TDD estricto en `functions/`**: test ROJO primero → implementación → VERDE. Nada de dinero sin test.
3. **NO tocar jamás** (fuera de alcance de F1-CORE): `functions/wompi-core.js` (firma/verificación), `confirmarPagoWompiCore` (webhook), `liberarReserva*` (reaper), el **snapshot inmutable** del pedido (`total`/`desglose` NUNCA se recalculan), `crm-service`/cartera, reglas de `clientes|movimientos`.
4. **Suites que deben quedar verdes** (comandos exactos):
   `npm run test:codigo-pedido` · `npm run test:pedidos` · `npm run test:sidebar` · `npm run test:wompi` · `node --test tests/gracias-estado.test.mjs` · `npm run test:rules` (emulador) · `firebase emulators:exec --only firestore --project demo-bersaglio "node --test functions/pedidos.integration.test.mjs"` (⚠️ UN archivo de integración por sesión de emulador — en paralelo se pisan, lección 2026-07-06) · ídem `wompi.integration` · `npm run build`.
5. **Deploy**: manual (L-22) `firebase deploy --only "firestore:rules,functions:<solo-las-tocadas>" --project bersaglio-jewelry` SOLO con suites verdes; Pages = merge `Desarrollo→main` (ff-only) + push. Cache: bump `CACHE_NAME` en `public/sw.js` + `APP_VERSION` en `js/admin/sidebar-data.js` JUNTOS + actualizar `05`.
6. **Cerebro**: al cerrar cada bloque → ADR en `99` + fila en `00-INDICE` + `10`/`05` al día + `npm run brain:check` SANO. Espacial del panel → `docs/21-ESPACIAL-ADMIN.md` (no `20`).
7. **Convenciones de código**: TODA interpolación a `innerHTML` pasa por `esc()` (L-03/F6) · CF-only para dinero/stock (el cliente NUNCA escribe `pedidos`) · anular≠borrar · `serverTimestamp` + autor en TODO evento (regla §9.7 del plan v4) · sin `transition:all`/`backdrop-filter` en listas (§3.1).
8. **Si un test existente se rompe y no entiendes por qué → STOP**, no lo "arregles" mutando el assert. 2 fallos seguidos en el mismo bug → lee `docs/00-INDICE.md` → tramo del ADR análogo (regla §G.2 🔴).
9. Al volver Fable: auditoría de cierre (patrón §161) — deja los commits atómicos y descriptivos para facilitarla.

## 1. Estado REAL del código (verificado 2026-07-06 — no re-descubrir)

- `functions/pedidos-core.js`: núcleos PUROS testeables (`crearPedidoCore` L~140, `iniciarPagoWebCore` L~240, `confirmarPagoCore`, `anularPedidoCore`, `cierreCajaCore` L~566, `reponerStock` L~83, `evaluarStock`/`aplicarConsumo` L~41-70, `reservarCodigo`/`generarCodigoPedido` §166). Wrappers auth en `functions/pedidos.js` (`verifyRole`, roles `owner|admin|catalogo`).
- **Estados HOY** (censo): `pago_pendiente · pago_por_verificar · pagado · pagado_sin_stock · a_revisar · expirado · anulado`. El ciclo MUERE en `pagado` — eso es lo que F1-CORE arregla.
- **Doc pedido**: `numero`(interno) · `codigo` BJ-XXXX-XXXX (§166, público) · `pieceId/Slug/Name` · `canal`(pos|web|whatsapp) · `medio`(efectivo|transferencia|wompi|addi) · `estado` · `total`+`desglose`(INMUTABLES) · `consumioStock` · `shipping{...}` · `tipoEntrega`(tienda|nacional|internacional|null) · `habeasData` · `wompiTxId?` · `confirmadoPor/En?` · `revisarMotivo?` · `autor` · `createdAt/updatedAt`.
- **Reglas**: `pedidos` read=isVentas, write=false; **`match /{sub=**}` ya cubre subcolecciones** (historial NO necesita regla nueva). `codigosPedido`/`contadores` deny-all.
- **⚠️ P0 ARQUEO (hallazgo Fable)**: `cierreCajaCore` suma SOLO `estado==='pagado'` (L~603). Si avanzas un pedido antes del cierre Z, su dinero se ESFUMA del arqueo. El fix es PARTE de F1-CORE (ver §3.4).
- **Piezas SIN campo de costo** (verificado en `js/admin/piezas.js`): `costoSnapshot` nace `null` (§3.5).
- **Módulo Pedidos (F1-PUENTE §165)**: `admin-pedidos.html` + `js/admin/pedidos.js` (lista viva `onPedidosChange` + modal detalle read-only + buscador tolerante + deep-link `?id=`) + helper puro `js/admin/pedidos-format.js` (estados/labels/resumen — extenderlo, no duplicar).
- Comprobante web §164: `gracias.js` usa `sessionStorage bj-ultimo-pago` {codigo, pedidoId, publicKey} + consulta el estado de la tx a Wompi. El "comprobante-por-token" = esta página con `?ref=<pedidoId>`.

## 2. TABLA DE TRANSICIONES (SSoT — el corazón; NO if-chains)

En `functions/pedidos-core.js`, exportada para tests y para el espejo del cliente:

```js
// Estados nuevos F1-CORE: preparacion · despacho_nacional · entrega_local · listo_retiro ·
// entregado · reembolsado · cancelado. F2 añade FILAS (p.ej. apartado), no reabre la CF.
const TRANSICIONES = {
  pagado:            ['preparacion', 'entregado', 'cancelado'],   // 'entregado' directo = venta en mano (POS)
  preparacion:       ['despacho_nacional', 'entrega_local', 'listo_retiro', 'cancelado'],
  despacho_nacional: ['entregado'],
  entrega_local:     ['entregado'],
  listo_retiro:      ['entregado'],
  entregado:         ['reembolsado'],                              // retracto Ley 1480 (5 días) / garantía
};
// `cancelado` = ANTES de entregar (repone stock si consumioStock, reusa reponerStock; motivo obligatorio).
// `reembolsado` = DESPUÉS de entregado (dinero devuelto; NO repone stock automático — la pieza volvió
//   físicamente o no: decisión humana → acción separada en F3/kardex; registrar `reembolso{motivo, medio, monto}`).
// pago_por_verificar/pago_pendiente/a_revisar/pagado_sin_stock NO están en la tabla: sus salidas son las
// CFs existentes (confirmarPago→pagado · anularPedido=VOID · webhook/reaper). avanzarPedido SOLO gobierna post-pago.
```

**Espejo cliente**: copiar la tabla a `js/admin/pedidos-format.js` (`TRANSICIONES_PEDIDO`) + **test de PARIDAD** (patrón gem/metal: el test importa ambas y las compara deepEqual — frontera CJS↔ESM, igual que `derivarEstado`).

## 3. CF `avanzarPedido` (callable, staff `catalogo`+) — contrato exacto

### 3.1 Input/validación
`{ pedidoId, a, datos? , nota? }` → tx: lee pedido (404 si no existe) · valida `TRANSICIONES[estado]?.includes(a)` (si no: `failed-precondition` "transición inválida {de}→{a}") · **idempotente**: si `estado===a`, retorna `{yaEstaba:true}` sin escribir.

### 3.2 Efectos por transición (en LA MISMA tx)
- Común: `update {estado:a, updatedAt}` + **historial append-only** `pedidos/{id}/historial/{autoId}`: `{de, a, autor, at:serverTimestamp, nota:nota||null, dayKey}` — `dayKey` LOCAL Bogotá `YYYY-MM-DD` (UTC-5 fijo, patrón L-30: `new Date(Date.now()-5*3600e3).toISOString().slice(0,10)`).
- `a==='despacho_nacional'`: exige `datos.flete` válido → persiste `flete{valorCOP:entero>0|0, cobro:'cobrado'|'asumido' (D-2: default cobrado), medio, estado:'pendiente'|'recibido'}` + `transportadora`(string req) + `guia`(string req) + `valorDeclarado?` + `asegurado?:bool` + `pesoEntregado?`. **JAMÁS tocar `total`/`desglose`** (flete = cargo ADITIVO, se muestra aparte).
  - **Merma**: si `desglose.tipo==='por_peso'` y `datos.pesoEntregado>0` y `pesoEntregado < desglose.peso` → asiento en `pieces/{pieceId}/movimientos/{merma-<pedidoId>}`: `{delta:0, motivo:'merma', pedidoId, gramos:(desglose.peso-pesoEntregado), actor, at}` (ledger = única fuente del stock; NO campo suelto en el pedido).
- `a==='entrega_local'`: `datos.receptorNombre` (string req — POD liviano).
- `a==='listo_retiro'`: sin datos extra (el POD llega al pasar a entregado).
- `a==='entregado'`: POD por canal — retiro: `datos.cedulaCotejada:true` requerido (Kary coteja contra `shipping.docNumber`); local: nada extra (receptor ya quedó); nacional: `datos.evidencia?` (string url/nota opcional). Persistir `entregadoEn:serverTimestamp` + `pod{...}`.
- `a==='cancelado'`: `datos.motivo` req. Si `consumioStock` y NO hubo reposición previa → **reusar `reponerStock`** (tx, motivo `'cancelado'`, ledgerId `cancelado-<pedidoId>`). Persistir `canceladoEn/Por/motivo`. (Gate: solo alcanzable pre-entrega por la tabla.)
- `a==='reembolsado'`: `datos.reembolso{medio, monto:entero>0, referencia?}` req + persistir `reembolsadoEn/Por`. Con `medio==='wompi'` la UI muestra el instructivo manual (panel Wompi → transacción `wompiTxId` → anular/reversar) — la CF NO llama a Wompi.

### 3.3 Ruta corta POS ("en mano")
En `crearPedidoCore`: si `canal==='pos'` y `medio==='efectivo'` (hoy nace `pagado`) → nace **`entregado`** con `entregadoEn=serverTimestamp` + `pod:{enMano:true}` + historial inicial `{de:'pagado', a:'entregado', autor, nota:'venta en mano'}`, **SALVO** `input.requiereEnvio===true` (checkbox nuevo en el POS) → queda `pagado` y entra al flujo normal. POS por transferencia/wompi sigue naciendo `pago_por_verificar` (confirmarPago→`pagado`→flujo; el checkbox aplica igual tras confirmar — guardar `requiereEnvio:true` en el doc y que `confirmarPago` lo respete: si `!requiereEnvio && canal==='pos'` → confirmar salta directo a `entregado` con historial doble).

### 3.4 ⚠️ FIX ARQUEO (P0 — mismo commit que la tabla, TDD primero)
En `cierreCajaCore`: reemplazar `p.estado === 'pagado'` por `ESTADOS_CON_DINERO.has(p.estado)` donde
`const ESTADOS_CON_DINERO = new Set(['pagado','preparacion','despacho_nacional','entrega_local','listo_retiro','entregado'])` (exportar; test de paridad con la tabla: `ESTADOS_CON_DINERO == {pagado} ∪ alcanzables-desde-pagado − {cancelado, reembolsado}`). Y el bloque de ajustes (hoy solo `anulado`): añadir `cancelado` y `reembolsado` con la MISMA lógica de devolución (dinero contado en cierre previo → resta). Tests: pedido pagado→entregado en el turno cuenta 1 vez; cancelado en turno posterior resta; reembolsado ídem.

### 3.5 Costuras aditivas (mismo bloque backend)
- `items[]` en `crearPedidoCore` + `iniciarPagoWebCore`: `[{pieceId, pieceName, pieceSlug, cantidad:1, precio:total, costoSnapshot:null}]` (1 entrada; F2.2 generaliza). Lectura con adaptador: `const items = p.items || [fabricadoDesdeCamposLegacy]` — helper `itemsDePedido(p)` en `pedidos-format.js`.
- `costoSnapshot: null` — las piezas AÚN no tienen campo de costo (verificado); cuando F3 lo cree, se congela aquí. NO inventar el campo en piezas ahora.
- `clienteId: null` en ambas creaciones (CF-only; la UI de vincular es F2.1).
- Comprobante web: `gracias.js` — si el pedido avanzó, mostrar guía/transportadora. Fuente: la página NO lee Firestore (invitado sin permisos) → **NO hacer endpoint nuevo en F1** (anti-oráculo §166); en su lugar la plantilla WhatsApp del PANEL: botón "Copiar aviso de despacho" en el detalle cuando estado=`despacho_nacional`: `"Tu pedido {codigo} va en camino con {transportadora}, guía {guia}. — Bersaglio"` (helper puro + test). El comprobante-por-token con estado vivo = F2 (requiere endpoint con App Check).

### 3.6 Wrapper y deploy
`functions/pedidos.js`: `exports.avanzarPedido = onCall(...)` con `verifyRole('catalogo')` (mismo patrón crearPedido) + autor = uid/email. Deploy: `--only "functions:avanzarPedido,functions:crearPedido,functions:confirmarPago,functions:cierreCaja"` (+rules solo si cambian — no deberían).

## 4. UI Módulo Pedidos completo (Opus con esta spec + patrones del PUENTE)

Sobre `js/admin/pedidos.js` (extender, NO reescribir):
1. **Filtros** (barra sobre la tabla, patrón `adm-filtros-bar` de cuentas.js): chips de estado (todos + cada estado con conteo) · select canal · select medio · rango fecha (date inputs desde/hasta sobre `createdAt`). Client-side sobre `_pedidos` (≤200 docs, suficiente F1).
2. **Fila de totales del filtro activo** (KPI-v0): bajo la tabla, `n pedidos · $suma COP` del subconjunto filtrado (excluir de la suma los sin-dinero: `expirado/anulado/cancelado/pago_pendiente`). Helper puro `totalesFiltro(pedidos)` + test.
3. **Colas de excepción** (stat-cards arriba, patrón adm-stats): `Por verificar (n)` → filtro pago_por_verificar · `Revisar (n)` → a_revisar+pagado_sin_stock · `Para despachar (n)` → pagado+preparacion. Cuentan SOLO lo accionable; card→aplica el filtro.
   - `pagado_sin_stock` en el detalle: dos acciones (texto guía): "Ofrecer refabricación/encargo" (WhatsApp prellenado) o "Reembolsar" (instructivo Wompi paso a paso + botón avanzar a reembolsado).
4. **Acciones de transición en el detalle** (deja de ser read-only): botones = `TRANSICIONES_PEDIDO[estado]` (espejo); cada uno abre mini-form de los `datos` requeridos (§3.2) → `avanzarPedido` callable (nuevo transporte en `js/pedidos-service.js`) → toast + el listener vivo refresca. `admConfirm` en cancelar/reembolsar.
5. **Historial en el detalle**: bloque nuevo leyendo `pedidos/{id}/historial` orderBy at desc (getDocs one-shot al abrir; la regla ya permite read staff).
6. Mini-instructivo Kary (regla v4 §9.5): 6-8 líneas en `docs/` hoja o en el propio modal (tooltip "¿cómo despacho?").

## 5. F1-EXTRAS (no gatean; si hay tiempo)
Push FCM A.6 (venta-web-pagada → notificación al celular de Kary; deep-link `admin-pedidos.html?id=` ya listo — ojo al rebote frío documentado en §165.4) · badge sidebar Pedidos (patrón inq-badge) · alerta reaper N-ticks · export contador: columna flete/codigo.

## 6. Tests EXIGIDOS (nombres/comandos)
- `functions/avanzar-pedido.test.mjs` (puro): tabla exportada íntegra · paridad `ESTADOS_CON_DINERO`↔tabla.
- `tests/pedidos-format.test.mjs` (ampliar): paridad TRANSICIONES cliente↔CF (leer la CJS con createRequire) · `itemsDePedido` legacy+nuevo · `totalesFiltro` · plantilla despacho.
- `functions/avanzar-pedido.integration.test.mjs` (emulador, SOLO): transición válida escribe estado+historial(+dayKey) · inválida falla y NO escribe · idempotencia (a===estado) · despacho exige flete/guia · merma asienta en ledger · cancelado repone stock (cantidad+1 + ledger) · reembolsado exige datos · ruta corta POS (efectivo→entregado; requiereEnvio→pagado) · **arqueo**: pagado→entregado mismo turno cuenta; cancelado turno-después resta.
- `pedidos.integration` y `wompi.integration` existentes: deben seguir 24/24 y 16/16 (la ruta corta cambia asserts del estado POS efectivo — actualizarlos CON el cambio, es esperado; documentarlo en el commit).

## Checklist (evidencia por ítem)
- [ ] Tabla TRANSICIONES + ESTADOS_CON_DINERO + fix arqueo (TDD) — evidencia: suites
- [ ] avanzarPedidoCore + wrapper + historial/dayKey/flete/merma/POD (TDD) — evidencia: integración emulador
- [ ] Ruta corta POS + requiereEnvio (crearPedido/confirmarPago) — evidencia: integración
- [ ] Costuras items[]/costoSnapshot:null/clienteId:null — evidencia: integración asserts de doc
- [ ] Deploy manual functions + suites verdes + SW/APP bump + 05
- [ ] UI: filtros+totales+colas+acciones+historial — evidencia: Chrome prod
- [ ] Gate F1: E2E de los 3 flujos de entrega EN PROD (crear venta POS de prueba → avanzar → entregar → anular al final para no ensuciar) + validación Chrome + ADR
