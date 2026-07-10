# F2.4 — APARTADOS / PLAN SEPARE (Diseño · Decisión Fuerte) · 2026-07-09 · [OPUS-4.8]

> **SSoT del diseño de F2.4** del PLAN ÚNICO ERP v4 (`2026-07-04-plan-unico-erp-v4.md §2.4`, D-1).
> **Estado: DISEÑO APROBADO-POR-CLAUDE, pend. decisiones del dueño (§7) + params de Kary → luego implementación.**
> Producido por el **flujo fuerte COMPLETO** (W-11): evidencia verificada (lectura de código + 3 lectores
> acotados + legal-colombia) → arquitecto → **comité ×3 acotado** (5 expertos, 17 agentes; CRUDO en bóveda
> `../brain-private/bersaglio/2026-07-09-comite-f2-4-apartados-{CRUDO.json,DIGEST.md}`) → veredicto de Claude
> (verifica/refuta, no acata). Consejo externo: prompt en `2026-07-09-f2-4-apartados-PROMPT-CONSEJO-EXTERNO.md`.
> **Modelo**: Opus 4.8 interino (Fable sin cuota; F2.4 es Decisión Fuerte → Fable audita al volver, patrón §158/§161).

---

## 0. Qué es y qué NO es (tesis rectora)

Un **apartado** = el cliente reserva una pieza con un **anticipo** y paga el resto en **abonos** hasta
completar; ahí se le entrega. Directiva de Daniel (D-1, 2026-07-04): apartados = **SÍ**; abonos reusan la
cartera CRM; la pieza apartada se bloquea en la web.

**Instrumento jurídico (a aprobar §7):** "**reserva revocable con anticipo imputable, que NO constituye
promesa de compraventa ni obligación de celebrar el contrato**" (blinda contra art. 1611 CC — promesa
bilateral vinculante). NO es fiado, NO es venta hasta la entrega.

**Alcance v1 (piloto, anti-gold-plating):** pieza tipo **ÚNICA**, **1 ítem** por apartado, canal **POS
presencial**, **penalidad OFF**, transferencia **con verificación**. Lo demás (lote/serie, multi-ítem,
web+retracto, encargo/a-medida) = fases posteriores, con costuras sembradas hoy.

---

## 1. El crux y su resolución — DOS PLANOS DEL DINERO

El error central del diseño ingenuo (y el P0 que cazó el comité): tratar el apartado como un fiado normal
(`factura(+total)` + `abono`) **contamina** dos cosas verificadas en código:
- `functions/saldo.js` `computeSaldo`: `factura:+1 / abono:−1` sobre TODOS los movimientos → el cliente
  aparecería **moroso** en el aging (`crm-estado-cuenta.js`) durante todo el apartado. **FALSO: el anticipo
  es un PASIVO (anticipos recibidos), no una cuenta por cobrar.**
- `functions/caja-core.js:102` `cerrarTurnoCore`: es split-aware sobre `pagos[]`; con `pagos:[]` vacío,
  `pagosDe(p)` deriva `[{medio,total}]` → un apartado atado a turno se contaría al total. Y al **completar**
  (`entregado` ∈ `ESTADOS_CON_DINERO`) se contaría **otra vez** (doble-conteo) o quedaría **invisible** en
  reportes de venta (`pagos:[]`).

**Solución (verificada):** separar explícitamente dos dimensiones que el dinero SIEMPRE tuvo mezcladas:

### 1.A · Plano TESORERÍA (arqueo, por TURNO) — qué efectivo hay en el cajón HOY
- Abono en **efectivo** → ingreso en `movsCaja` con **`naturaleza:'anticipo_apartado'`** + `turnoId` del
  turno abierto → afecta `esperadoEfectivo` del cierre. **Requiere turno abierto (si no → BLOQUEADO).**
- Abono por **datáfono** → tally del medio (concilia con el lote de vouchers §179), NO afecta efectivo.
- Abono por **transferencia** → tally del medio; nace `pendiente_verificar` (no cuenta hasta conciliar).
- **`cerrarTurnoCore` SÍ se modifica**: particiona cada línea por `{afectaTesoreria, naturaleza}` — la
  exclusión se hace por **campo booleano tras el fetch** (NO `!=` en query: límite de una-desigualdad de
  Firestore, verificado). El apartado-pedido lleva **`turnoId:null`** → nunca aparece en el query de ventas
  del cierre (`where turnoId==X`) → **cero doble-conteo del pedido**; su plata entra SOLO como los ingresos
  `anticipo_apartado` de cada turno.

### 1.B · Plano REVENUE / P&L (por PERIODO) — cuándo se reconoce la VENTA
- La venta se reconoce **UNA vez, en la ENTREGA FÍSICA** (no en el anticipo, no en cada abono).
- **v1 DIFIERE el motor de reportes (`libroReconocimiento`) a F4** (Contabilidad & Reportes — es su fase
  dueña). v1 **captura la data** (abonos con medio original + timestamp de entrega + `entregadoEn`) para que
  F4 reconstruya el revenue. **Veredicto de Claude (modera al comité):** construir 5 reconciliadores + outbox
  DIAN + colección `libroReconocimiento` para 2 personas de bajo volumen viola §3.6/L-50 (sobre-ceremonia
  crea fallos). Lo caro de retrofitear (segregación contable, dos planos, hold, idempotencia, régimen legal)
  se hace YA; el reporting se hace cuando se construyan los reportes.

> **Conflicto anotado (§8):** cualquier lector EXISTENTE de `pedido.pagos[]` (dashboards/export/live) debe
> auditarse pieza por pieza en implementación — un apartado (`pagos:[]`, `turnoId:null`) se ve como $0 ahí.
> Verificado: el consumidor crítico (`cerrarTurnoCore`) es seguro por `turnoId:null`. El resto = gate empírico.

---

## 2. Modelo de datos

### `pedidos/{id}` (apartado) — CF-only
```
esApartado: true
estado: 'apartado' | 'pagado' | 'entregado' | 'cancelado'   // + flag ortogonal vencido:bool
clienteId: <obligatorio>            // F2.1 vincularClientePedido YA existe; aquí es requisito de creación
canalOrigen: 'pos'                  // v1 solo pos (costura para web/retracto)
tipoInventario: 'unica'            // v1 solo unica (lote/serie bloqueado por TODO-40)
pieceId
totalCongelado: int                // SNAPSHOT inmutable del precio (precioCongelado ON, art. 42.6 Ley 1480)
tarifaIVA, baseGravable, snapshotAt // IVA se causa a la ENTREGA, pero se congela la tarifa
saldoApartado: int                 // DENORMALIZADO CF-only = totalCongelado − Σabonos CONFIRMADOS
anticipoMinPct, plazoVence          // server-clock America/Bogota
regimenLegal, politicaCancelacion   // sellados del config al abrir (evidencia)
habeasDataAuthAt
clientRequestId                     // IDEMPOTENCIA (check-and-set en la tx)
turnoId: null                       // NUNCA atado a un turno (su plata cruza turnos vía abonos)
pagos: []                           // el dinero NO vive en el pedido (vive en los movimientos segregados)
```

### Movimientos de dinero (subcolección `clientes/{id}/movimientos` — reuso de la cartera, tipos NUEVOS)
- `apartado_anticipo` / `apartado_abono` — llevan `pedidoId` (**añadir a whitelist `movimientoValido`**),
  `medioOriginal ∈ {efectivo,transferencia,datafono,credito}` (INMUTABLE), `estadoAbono ∈ {confirmado,
  pendiente_verificar}`, `naturaleza`, `turnoId?`.
- **`saldo.js` `computeSaldo` se modifica**: estos tipos **NO** entran en `saldoActual` (fiado); alimentan un
  **`saldoAnticipos`** separado (pasivo a favor del cliente). Así el aging/cobro/Habeas Data NO se contaminan.

### `movsCaja` (caja-core) — se añade `naturaleza`
- Cada línea porta `naturaleza ∈ {venta, anticipo_apartado, abono_cartera, devolucion, ...}` + `afectaTesoreria`.
- **`CONCEPTOS_CAJA` (caja-core.js:191) — añadir** `abono_apartado` (ingreso) + `devolucion_apartado`
  (egreso, para reembolsos). Cambio de una línea en el `Set`, pero exige `test:rules`/`test:caja` verdes.

### `pieces/{id}.disponibilidad` (CF-only, DISTINTO de `piece.estado` manual)
```
disponibilidad: { estadoDisp: 'disponible'|'reservada'|'vendida', holdRef: pedidoId|null }
```
Campo consultable que **oculta la pieza del catálogo `onSnapshot`** y que se **chequea en TODO path de venta**
(POS/walk-in/web) → fuerza "exactamente UNA disposición terminal por unidad" = anti-oversell de pieza única.

---

## 3. Máquina de estados (fila nueva en `TRANSICIONES`, `pedidos-core.js:136`)

```
apartado → { pagado, cancelado }
pagado   → { entregado, cancelado }      // pagado = saldoApartado ≤ 0 (SOLO abonos 'confirmado')
entregado, cancelado = terminales
```
- Se ELIMINA `apartado→entregado` directo (pasa por `pagado`). `vencido` = FLAG ortogonal, no estado.
- `totalCongelado` inmutable → **no existe `pagado→apartado`** (protege contra el re-precio del oro).
- **Toda transición = read-check-write en la MISMA transacción** que sus efectos (assert `estado ∈
  permitido` atómico con el consumo de stock / reembolso) → cierra el "entregado/reembolsado fantasma" por
  concurrencia caja↔owner.

---

## 4. Ciclo de vida (CFs nuevas)

| CF | Qué hace (atómico salvo efectos externos) |
|---|---|
| **`crearApartado`** | alta/dedup cliente inline (Habeas Data) + **hold** de la pieza + **snapshot precio/IVA** + registra anticipo (efectivo→`movsCaja` turno-gated / transferencia→`pendiente_verificar`) + `clientRequestId`. Recibo interno (no DIAN). |
| **`registrarAbonoApartado`** | efectivo **turno-gated** (turno abierto o BLOQUEADO); transferencia→`pendiente_verificar`; tesorería por medio; recompute `saldoApartado`; **idempotente** (`clientRequestId`). |
| **`confirmarAbonoTransferencia`** | concilia contra evento Wompi/banco/Nequi → `pendiente_verificar`→`confirmado` (nunca screenshots). |
| **`cambiarPiezaApartado`** (swap) | atómico: conserva `clienteId`+trail; libera hold viejo + toma nuevo; re-snapshot; re-valida `anticipoMinPct`; derrame a `saldoAnticipos` si baja / top-up si sube. |
| **`entregarApartado`** | guard intra-tx: consumo **definitivo** de stock (`entregado`) + marca `entregadoEn` + captura data para revenue F4 + (F4) factura DIAN. Excedente (Σabonos>total) → cap en total + saldo a favor. |
| **`cancelarApartado`** | bifurca pre/post-factura; reembolso **fan-out** `revierteMovId` por medio/pagador; void (pre-corte lote) vs refund (post-corte, tx nueva); (F4) nota crédito DIAN si post-factura. |
| **`reaperApartadosVencidos`** | scheduled (Bogota), idempotente con checkpoint per-doc, **lock del `pedido`**. SOLO marca `vencido:true` + **libera el hold** + reclasifica abonos a **saldo a favor reembolsable** + alerta al owner. **NUNCA reembolsa efectivo/tarjeta** (una CF no tiene cajón) y **NUNCA impone crédito en tienda**. `pagado` vencido (propiedad del cliente, *res perit domino*) → solo ALERTA. |

**Núcleo transaccional + outbox:** los efectos NO-transaccionales (factura DIAN, void/refund datáfono,
WhatsApp) van a una cola idempotente POST-commit (**la outbox es F4**; v1 = recibo interno + acciones manuales).

---

## 5. Stock / hold (reuso de `pedidos-core.js`)

- Apertura = **HOLD** (reserva), NO consumo: la pieza sale del catálogo por `disponibilidad='reservada'`,
  `holdRef=pedidoId`. NO muta `piece.estado`, NO registra venta/COGS.
- Consumo **definitivo** solo en `entregado` (reusa `aplicarConsumo`/ledger).
- Reintegro **por tipo** (tabla explícita): `unica`=liberar disponibilidad; `lote/serie`=reponer cantidad
  (**bloqueado v1**); `encargo`=null-op. El reintegro = inverso EXACTO del hold (no infla inventario, reusa
  `reponerStock`).

---

## 6. Legal / fiscal (orientación — validar con abogado + contador CO antes de operar)

- **Recibo/contrato** (art. 23-24 Ley 1480): pieza + foto + `totalCongelado` con **IVA incluido SOLO
  informativo** + leyenda *"el IVA se causa y factura a la ENTREGA"* (**sin liquidar IVA como impuesto
  cobrado** → no gatilla causación en el abono) + anticipo + plazo + política de cancelación + custodia/riesgo
  + "sin intereses".
- **IVA (art. 429 ET):** se causa **a la ENTREGA**; factura electrónica de venta con IVA 19% al entregar.
  Anticipo = **recibo de caja interno** (no documento electrónico DIAN; supera 5 UVT → cerrar puerta a tiquete
  POS) **[a verificar con contador]**.
- **No-forfeiture (art. 831 C.Co):** el saldo abandonado NO se decomisa (enriquecimiento sin causa); política
  de saldos abandonados = reintento de contacto + provisión del pasivo.
- **Cláusula abusiva (art. 42-43 Ley 1480):** PROHIBIDO el híbrido reembolsable-con-penalidad (re-caracteriza
  a arras art. 1859-1861 CC). Régimen ÚNICO (§7).
- **Retracto (art. 47) / reversión del pago (art. 51 + Dec. 587/2016):** aplican a canal WEB (5 días) → fuera
  de v1 (POS presencial no da retracto); el modelo porta `canalOrigen` para engancharlo.
- **Habeas Data (Ley 1581):** autorización de tratamiento + finalidad en el alta inline de `crearApartado`.
- **SARLAFT/UIAF** (joyería = sector nombrado): acumulador de efectivo por cliente **ON**; captura de
  identidad del pagador **gated por umbral acumulado** (no por cada abono → evita sobre-recolección); ROS;
  reembolso al mismo pagador identificado.

---

## 7. DECISIONES DEL DUEÑO (forks reales — resolver ANTES de implementar)

| # | Decisión | Estado (2026-07-09) |
|---|---|---|
| **A/B/C. Política de cancelación (régimen + default + penalidad)** | ¿qué pasa con el dinero si cancela? | ✅ **RESUELTA (veredicto §7.1)**: reembolso 100% (default dinero ≤15 días hábiles) · saldo a favor VOLUNTARIO **sin vencimiento**/reconvertible · **cero penalidad/decomiso** (art. 43.5 lo prohíbe) · costo de oportunidad se ataca UPSTREAM (plazo corto para única cara + relistado). **Pend: Daniel corre consejo externo + gate abogado CO antes del recibo.** |
| **D. RBAC** | ¿quién ABRE / ABONA / ENTREGA? | ✅ **Daniel 2026-07-09: también la CAJERA** (rol `caja` F2.0) puede abrir/abonar/**entregar**. Entrega dispara la venta/factura — el cajero cierra venta (SoD relajada por decisión del dueño). |
| **E. Reglas finas (Kary)** | anticipo mínimo, plazo máximo. | ✅ **Daniel 2026-07-09: 20% · 60 días** (America/Bogota) — confirmar el número final con Kary. |
| **F. Revenue reporting** | `libroReconocimiento` ahora vs F4. | **F4** (capturar data ya) — veredicto de Claude. |
| **G. Swap de pieza** | operación de 1ª clase vs cancelar+reabrir. | **Swap** atómico (`cambiarPiezaApartado`) — recomendado. |
| **H. Naturaleza del instrumento** | aprobar "reserva revocable con anticipo imputable, NO promesa". | **Aprobar** (blinda art. 1611 CC) — recomendado; se cierra con §7.1. |

### §7.1 — Decisión Fuerte enfocada: política de cancelación de PIEZA ÚNICA (en curso 2026-07-09)
> Daniel: *"si es para una pieza única perdería la joyería... lanzar comité + consejo externo con agentes y skills"*.
> Tensión: **costo de oportunidad de la pieza única** (retenida ~60d) vs **límites de la ley de consumo CO**
> (Ley 1480 art.42-43 cláusulas abusivas; art.831 C.Co no-forfeiture) vs **relación de marca de lujo**.
> Pre-frame de arquitecto: la joyería NO pierde la pieza (vuelve al mercado al cancelar) NI el dinero si se
> convierte en **saldo a favor** (crédito redimible) → el downside real es solo el TIEMPO fuera de mercado.
**VEREDICTO (comité enfocado 4 críticos + evidencia legal `.gov.co` + síntesis Claude; el presidente-agente cayó por límite semanal → sinteticé yo, que soy el decisor). CRUDO/evidencia en bóveda `2026-07-09-f2-4-apartados-EVIDENCIA-LEGAL.md`:**

> 🔴 **Restricción legal DURA (art. 43.5 Ley 1480):** decomisar/retener el anticipo del consumidor = **NULO de pleno derecho**. NO existe penalidad legal por cancelar. La protección del negocio NO puede venir de quedarse con la plata.
>
> **P0 que cazó el comité (corrige mi v0):** un **saldo a favor CON VENCIMIENTO** = decomiso diferido / renuncia a un derecho irrenunciable → **también ilegal**. Mi v0 proponía crédito a 180 días: eso reintroduce la retención prohibida.
>
> **Política final (a validar con abogado CO antes del recibo):**
> 1. **Anticipo 100% reembolsable, siempre. Default = DINERO**, por el mismo medio de pago, en **plazo cierto (≤15 días hábiles)** escrito en el recibo (sin plazo → la demora = retención de facto).
> 2. **Saldo a favor = alternativa VOLUNTARIA del cliente** (documentada, con leyenda "el efectivo es el default y está disponible"), **SIN vencimiento** — o si vence, su valor se paga en dinero — y **reconvertible a efectivo en cualquier momento**. Nunca impuesto.
> 3. **Cero penalidad / cero decomiso**, incluido al **vencer el plazo sin que el cliente pague ni cancele**: el negocio libera la pieza, pero el anticipo sigue 100% reembolsable (→ saldo a favor reembolsable, jamás decomiso).
> 4. **Instrumento = "reserva revocable"** que GENUINAMENTE omite un requisito estructural de la promesa (art. 1611/1618): no obliga a celebrar la venta futura; **la revocación es facultad SOLO del consumidor** (no del negocio → evita cláusula de terminación unilateral abusiva).
> 5. **Costo de oportunidad = se ataca UPSTREAM, no reteniendo**: **plazo más corto para pieza única de alto valor** (umbral de precio, p.ej. 30d vs 60d) + **relistado instantáneo** al cancelar + anticipo 20% como filtro de seriedad.
> 6. **Segmentar por canal y tipo**: v1 = **POS presencial + pieza única (NO a-medida)**. Web (venta a distancia) → retracto art. 47 (reembolso íntegro + reversión art. 51) = fuera de v1. **A-medida (futuro)**: la pieza NO vuelve al mercado → anticipo igual reembolsable, pero el ÚNICO lever legítimo es cobrar la **labor realmente ejecutada como servicio real** (no penalidad), con visto bueno de abogado.
>
> **Reencuadre para Daniel (corregido por el escéptico):** la joyería NO pierde la pieza (vuelve al mercado) NI puede quedarse con plata que no era suya (ilegal). La pérdida real = solo el **tiempo** fuera de mercado, mitigada upstream; y el saldo a favor convierte muchas cancelaciones en ventas futuras (~68% recompra). El miedo de Daniel es legítimo SOLO en pieza **a-medida** → ahí, labor real cobrable, no penalidad.
>
> **Consejo externo (pend. Daniel):** falta pasar el `-PROMPT-CONSEJO-EXTERNO.md` para 2ª opinión. **Abogado CO = gate antes de fijar el recibo.**

**Conflictos sin resolución técnica limpia (§ para el consejo externo):** pagador≠titular (regalo/tercero:
SARLAFT vs derecho de consumo) · doble-abono HUMANO (caja + ficha CRM, dos ids: mitigación UX foto+monto+saldo,
no lock duro) · encargo/a-medida (el anticipo SÍ causa IVA como servicio, art. 429 ET) · B2B agente de
retención (retefuente puede causarse al abono) · pieza única vencida revendida deja al cliente solo con saldo.

---

## 8. Reglas de Firestore / código a tocar (NO aditivo trivial — exige tests verdes)
- `firestore.rules` `movimientoValido`: añadir `pedidoId` + tipos `apartado_anticipo/_abono` + `naturaleza`.
- `pedidos`: `estado/saldoApartado/totalCongelado/tarifaIVA/vencido` = **CF-only**.
- `pieces.disponibilidad/holdRef` = **CF-only**; el catálogo público lee `disponibilidad`.
- `functions/saldo.js` `computeSaldo`: segregar tipos apartado → `saldoAnticipos`, fuera de `saldoActual`.
- `functions/caja-core.js`: `CONCEPTOS_CAJA` += `abono_apartado`/`devolucion_apartado`; `cerrarTurnoCore`
  partición por `naturaleza`/`afectaTesoreria` (filtro en código, no query).
- `pedidos-core.js` `TRANSICIONES`: fila `apartado`.
- Índices compuestos: vista Apartados (`esApartado`+estado+orden plazo), `movimientos(clienteId,pedidoId)`,
  barrido de vencidos (scheduler).
- **Auditar TODO lector de `pedido.pagos[]`** (regresión §179/TODO-73 en PROD).

---

## 9. GATE EMPÍRICO — lista CERRADA de caminos estado-cero/borde (caza-bugs end-to-end al implementar)

1. 1er apartado → aparece en vista Apartados en vivo + al recargar; la pieza DESAPARECE del catálogo público en vivo.
2. Cancelar el ÚLTIMO apartado → vista colapsa limpio; pieza REAPARECE (hold liberado) en vivo y al recargar.
3. Pieza única apartada + venta POS/walk-in en paralelo → 2º path BLOQUEADO por `disponibilidad` (no oversell).
4. Abono efectivo justo mientras se cierra el turno (carrera) → entra al turno correcto O reintenta contra turno nuevo; nunca sobrante/huérfano.
5. Abono efectivo SIN turno abierto → BLOQUEADO (no `movsCaja` sin `turnoId`).
6. Abono transferencia con screenshot → `pendiente_verificar`; `saldoApartado` NO baja hasta conciliar.
7. Sobrepago (Σabonos>total) → reconocimiento capado en total, excedente → saldo a favor, invariante preservado.
8. `saldoApartado ≤ 0` → estado `pagado`; pieza sigue en bóveda; sin movimiento de dinero.
9. Entrega (`pagado→entregado`) → consumo definitivo + data de venta capturada UNA vez.
10. Cancelación pre-entrega con abonos efectivo → egreso `devolucion_apartado` (turno abierto) + reversa recibo; sin nota crédito.
11. Cancelación con abono datáfono: pre-corte → void (tally negativo); post-corte → refund (tx nueva).
12. Cancelación con medios/pagadores distintos → fan-out `revierteMovId`; reembolso al mismo pagador (SARLAFT).
13. Reaper: apartado vencido parcialmente abonado → marca `vencido` + libera hold + reclasifica a saldo a favor + alerta; NINGÚN refund autónomo.
14. Reaper: apartado `pagado` vencido → NO auto-cancela; solo alerta.
15. Reaper crash a mitad de lote → idempotente (checkpoint per-doc), retoma sin doble-procesar.
16. Carrera reaper↔abono final → lock del `pedido`; sin doble disposición.
17. Swap de pieza → conserva `clienteId`+trail; hold viejo→nuevo atómico; re-snapshot; re-valida anticipo.
18. Cliente con 2+ apartados → el paso de abono FUERZA elegir el pedido correcto CON foto antes de aplicar dinero.
19. Doble-tap de máquina (retry CF/wifi) → idempotencia `clientRequestId`; una sola escritura.
20. Doble-abono humano (caja + ficha CRM) → UX gate (foto+monto+saldo) lo detecta (conflicto abierto §7).
21. Cierre de turno con mezcla de naturalezas (venta + anticipo + abono cartera + devolución) → arqueo cuadra + desglose por naturaleza visible.
22. Congelamiento de precio: el oro sube entre abono y entrega → `total` NO cambia; % abonado estable.
23. Vencimiento en la frontera del día (tz Bogota) → la acción del reaper cae en el día correcto respecto al arqueo.

---

## 10. Qué cazó cada capa (trazabilidad de la Decisión Fuerte)
- **Lectura de código (evidencia):** F2.1 ya existe · `pagos[]` es split no-parcial · el arqueo suma por turnoId · movimiento sin `pedidoId` hoy.
- **Arquitecto (candidato):** un apartado = fiado + pieza retenida; reuso máximo.
- **Comité (refutó el candidato):** el anticipo es PASIVO no fiado (P0 contable) · revenue sin hogar (P0) ·
  stock = hold no consumo · idempotencia faltante · `cerrarTurnoCore` SÍ se toca · legal (IVA a la entrega,
  no-forfeiture, régimen único).
- **Veredicto de Claude (verificó/moderó):** aceptó los P0 (verificados en `saldo.js`/`caja-core.js`); **moderó
  la sobre-ingeniería** (difiere `libroReconocimiento`/outbox/5-reconciliadores a F4, L-50); acotó v1 a pieza única.
- **Pendiente:** consejo externo (prompt listo) + decisiones del dueño (§7) + gate empírico en implementación.
