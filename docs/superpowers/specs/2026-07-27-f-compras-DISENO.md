# F-COMPRAS — "Proveedores" · DISEÑO EJECUTABLE (BORRADOR para refutación) · 2026-07-27 [OPUS-5]

> **SSoT del diseño de F-COMPRAS** (plan maestro v5 §4 → esta spec lo vuelve ejecutable).
> Decisión Fuerte de dinero ⇒ flujo fuerte W-11. **Estado: BORRADOR del arquitecto — pendiente
> comité ×3 + consejo externo + mockup.** Producido por el interino (Opus 5) siguiendo el patrón
> §158/§161 (cuando el titular no está, el interino diseña con el flujo completo y Fable audita al
> volver — mismo precedente que la spec de apartados F2.4).
> Insumos: plan v5 §4 · skill `auditoria-financiera` (7 invariantes) · F-TESORERÍA (§194, recién
> auditada por rompimiento) · cartera CxC ya probada · `42-LEGAL` (771-5, retenciones).

## §0.8 — DIRECTIVA DEL DUEÑO (2026-07-27) — **prevalece sobre TODO**

> Daniel, respondiendo a las dos preguntas de alcance:
> - *"Generalmente le fían, paga después, pero se puede presentar el tema del pago de contado.
>   **Todos los negocios con los proveedores pueden celebrarse, entonces deben existir todas las
>   posibilidades y no cerrarse solo a una.**"*
> - Sobre anticipos: *"Es posible, como también puede que no, o que le quede debiendo. **Todas las
>   posibilidades existen.**"*

**D0 · NINGÚN camino se cierra.** El módulo debe soportar, sin obligar a ninguno:
compra a crédito con plazo · compra de contado · anticipo antes de recibir · pago parcial que deja
saldo · anticipo que cubre de más (queda saldo a favor) · devolución/nota crédito. La UI **no puede
exigir** un flujo: cada compra elige el suyo. Anti-patrón explícitamente prohibido: un formulario
que obligue a poner vencimiento, o que no deje registrar una compra ya pagada.

## §0 — Qué es (y qué NO es)

**Es**: el espejo de la cartera, del otro lado. La cartera responde *"¿quién me debe?"*;
F-COMPRAS responde *"**¿a quién le debo, cuánto y cuándo se vence?**"*, y amarra cada pago a la
cuenta real de donde salió la plata (art. 771-5 ET: sin bancarización el gasto no es deducible).

**NO es** (anti-scope, hereda el del plan v5 y de F-TESORERÍA): órdenes de compra / pedidos a
proveedor · recepción de mercancía contra la orden · **cálculo de retenciones** (las liquida el
contador con el exporte; aquí solo se captura `regimen`) · costeo de inventario / kardex valorizado ·
partida doble · multi-moneda. Tampoco toca el módulo de piezas: una compra NO crea inventario en v1.

## §1 — Decisiones de arquitectura (a refutar por el comité)

- **A1 · El ledger es POR DOCUMENTO, no saldo corriente.** La cartera de clientas lleva saldo
  corriente; aquí NO alcanza: el valor del módulo es *"esta factura vence el viernes"*, y eso exige
  que cada factura tenga su propio saldo y su vencimiento. `proveedores/{id}/documentos/{opId}`
  append-only.
- **A2 · Un pago apunta a UN documento** (`documentoId`), y un documento admite N pagos (pago
  parcial = D0). Sin "aplicaciones" multi-factura en v1: es la complejidad que hunde estos módulos,
  y con el volumen de Kary no paga su costo. El anticipo se cruza con UN cruce explícito (A3).
- **A3 · El anticipo es un documento de signo contrario** (saldo a favor del negocio), no un pago
  suelto. Cruzarlo contra una factura = un movimiento `cruce_anticipo` que baja ambos saldos en la
  MISMA tx. Sin esto, la plata adelantada queda sin rastro y el saldo del proveedor miente.
- **A4 · Todo pago escribe su pata EN EL LIBRO DE DONDE SALIÓ LA PLATA, en la misma tx** — patrón
  D9/V1 ya probado y auditado en §194. **`cuentaId`/origen es OBLIGATORIO en el pago** (771-5; a
  diferencia del abono de cartera, donde "todavía no sé" era legítimo: aquí la deducibilidad depende
  de saber de dónde salió). Dos destinos según el origen (resuelto en R1, ex-P1):
  - **Banco/Nequi** → `movimientosTesoreria` tipo `pago_proveedor` (ya existe en `SIGNO_TESORERIA`,
    −1), fuente SISTEMA, idempotente POR-LIBRO, ancla `pataTeso.cuentaId` en el documento.
  - **Efectivo** → `bovedaMovimientos` (NO tesorería). Ver R1.
  ⚠️ **CORRECCIÓN al borrador (verificado 2026-07-27, `tesoreria-core.js:23-27,216,255`)**:
  `pago_proveedor` **NO es un tipo nuevo** — ya está vivo en producción como movimiento MANUAL
  (`admin-tesoreria.html:216`), exige `contraparte.nombre` (V8) y NO lleva `categoria` (es costo de
  venta, no gasto). Por eso **NO se añade a `PATA_TIPOS`**: eso mataría la puerta manual que Kary ya
  usa para el pago suelto sin factura. La convivencia se resuelve en A7.
- **A7 · El guard de "no se corrige a mano" discrimina por ORIGEN, no por TIPO** (hallazgo del
  comité, 2026-07-27). Hoy `tesoreria-core.js:311` rechaza el `ajuste_inverso` manual mirando
  `PATA_TIPOS.includes(orig.tipo)` — correcto solo mientras esos 3 tipos sean exclusivos de sistema.
  En cuanto UN tipo pueda nacer por ambas puertas (que es justo lo que trae F-COMPRAS), el guard por
  tipo **falla en silencio**: o prohíbe corregir un movimiento manual legítimo, o deja corregir a mano
  una pata de sistema (el P0 de §194 otra vez). → El guard pasa a
  `PATA_TIPOS.includes(orig.tipo) || orig.creadoPor?.fuente === 'SISTEMA'`.
  Cinturón y tirantes: los 3 tipos actuales nacen SIEMPRE con `fuente:'SISTEMA'`
  (`construirPataSistema:598`), así que la condición vieja se conserva ⇒ **cero regresión**, y el
  criterio queda dicho como lo que de verdad es: *lo que creó otra operación se deshace por su origen*.
  **Se implementa con test primero (zona caliente R3) en C0, ANTES de tocar compras.**
- **A5 · Se reusa lo probado, no se inventa**: CF única escritora + idempotencia por `opId` + append
  only + anular = sellar `anulado` (jamás borrar) + recompute server-side del saldo + SoD para lo
  destructivo. Núcleo puro en `functions/compras-core.js`, espejo cliente `js/admin/compras-format.js`
  con test de paridad (invariante 2). **Cero ecuaciones nuevas copiadas a mano** (L-86).
- **A6 · Rail**: grupo **Compras** (plan v5 §2, ya previsto) con UNA página "Proveedores"
  (directorio + deudas + pagos), voz es-CO: "Proveedores", jamás "CxP".

## §2 — RESUELTO por el comité ×3 (2026-07-27, `[OPUS-5]`) — ex-preguntas P1-P5

> Comité inline de 4 (contador CO · arquitecto de ledgers · escéptico red-team · ejecutor de
> mostrador), sobre código YA verificado esta sesión (no sobre supuestos del borrador).
> **Pendiente: consejo externo (lo corre Daniel) + mockup.** Estas resoluciones son la BASE que el
> consejo debe intentar refutar, no un cierre.

- **R1 (ex-P1) · El efectivo se paga desde la BÓVEDA, y su pata va al libro de la bóveda.**
  La opción (b) del borrador — "el pago acepta cuenta VIRTUAL" — **es imposible hoy y sería un bug**:
  `construirPataSistema` rechaza explícitamente caja/bóveda (`tesoreria-core.js:582`), porque el
  efectivo NO vive en `movimientosTesoreria` sino en `bovedaMovimientos` + `boveda/main`. Escribirlo
  en tesorería lo contaría DOS VECES (exactamente el P0 de §194).
  → **Decisión**: la CF de compras, cuando el origen es efectivo, llama a la puerta de la BÓVEDA
  (nuevo tipo en `SIGNO_BOVEDA`, signo −1) en su misma tx. Espejo exacto de V1/V18.
  → **Regla operativa (voz es-CO)**: *"A los proveedores se les paga de la bóveda o del banco. Del
  cajón no."* Si la plata está en el cajón, primero el traslado cajón→bóveda que YA existe.
  → **El turno/cajón queda INTACTO** (zona caliente R3): meter pagos en la ecuación de cierre del
  turno era el camino caro, y no compra nada — la bóveda ya es el punto único de control del efectivo.
  → El guard de saldo insuficiente de la bóveda (`caja-core.js:325`) aplica solo: la anomalía GRITA.
- **R2 (ex-P2) · Sí a la unicidad, pero el duplicado caro es el PAGO, no la factura.**
  (a) Unicidad `nit|numero` **solo cuando hay número** (sin número no hay llave — R3 lo permite);
  Firestore no tiene *unique constraint* ⇒ doc-llave determinista escrito en la MISMA tx, no un query
  "a ver si existe" (que es una carrera). Rechazo duro con mensaje claro.
  (b) **Detector de pago gemelo** (mismo `documentoId` + mismo monto + misma fecha) ⇒ **confirmación
  explícita, NO bloqueo**: pagar dos cuotas iguales el mismo día es legítimo; pagar dos veces la misma
  es el error #1 de CxP. El sistema pregunta, no decide.
- **R3 (ex-P3) · Compra sin factura: SÍ, sin bloqueo — con la voz corregida.**
  El flag interno puede llamarse como sea, pero **en pantalla dice "Sin factura"** (jamás "sin soporte
  formal": es jerga, y el panel habla claro). Microcopy: *"Sin factura tu contador no puede descontar
  esta compra de impuestos."* Columna separada en el exporte al contador.
- **R4 (ex-P4) · SoD confirmado + lo que faltaba.** Owner aprueba: **anular un pago ya hecho** y
  **anular una factura con pagos**. Registrar factura/pago normal: Kary opera (no se le pide permiso
  para trabajar). **Añadido**: pagar MÁS del saldo del documento NO se bloquea (D0 lo permite: queda
  saldo a favor), pero **grita** — confirmación + saldo del proveedor en rojo (invariante 7).
- **R5 (ex-P5) · NO se toca "Plata total"; la señal es aparte Y la ve Kary.**
  Confirmado: la deuda es plata comprometida, no plata que se tiene; sumarla o restarla de la
  consolidada la haría mentir. Señal propia en Hoy: *"Le debes $X · lo próximo vence el …"*.
  **Corrección al borrador**: NO puede ser fila owner-only — **Kary es quien paga**; una alerta de
  vencimiento que no ve quien paga no sirve para nada.

### ⚠️ Deuda CONOCIDA que se acepta en v1 (declarada, no descubierta después)
**Una transferencia que paga VARIAS facturas se registra como N pagos** (A2: un pago → un documento).
El extracto bancario mostrará 1 salida y el módulo N líneas. Es tolerable **solo porque v1 no incluye
conciliación bancaria de proveedores**; el día que se agregue (F-REPORTES o conciliación), esto se
resuelve con un "pago múltiple" que agrupe N aplicaciones bajo UNA salida de plata. Queda escrito para
que no se descubra como bug.

## §3 — Invariantes (skill `auditoria-financiera`) que el módulo DEBE cumplir

1. **Conservación**: pagar $X baja el saldo del proveedor en $X y baja la cuenta real en $X. Ni más
   ni menos, y en una sola transacción.
2. **Mismo número en todas las vistas**: saldo del proveedor en el directorio == en su ficha == en
   el recompute del servidor. Test de paridad obligatorio.
3. **Idempotencia por-libro** (V4/L-85): replay del mismo `opId` no duplica ni el documento, ni el
   pago, ni la pata de tesorería; cada libro se verifica por separado.
4. **Deshacer netea TODO** (L-86 — la lección que costó el P0 de §194): anular un pago netea el
   proveedor **y** la cuenta real. **Al escribir este módulo, el camino de deshacer se construye en
   el MISMO commit que el de hacer.**
5. **Estados muertos únicos**: `anulado` significa lo mismo aquí que en cartera y tesorería.
6. **SoD + ledger inmutable**: corregir = asiento inverso, jamás editar/borrar (P4).
7. **La anomalía GRITA**: saldo negativo de proveedor (le pagué de más), factura vencida, pago sin
   soporte → en rojo, sin `Math.max(0,…)` que lo esconda.

## §4 — Costuras (lo que NO se toca)

| Costura | Regla |
|---|---|
| Tesorería | Se USA su puerta de sistema (`construirPataSistema`) para el pago por BANCO. Su ledger y su recompute INTACTOS. **`PATA_TIPOS` NO gana `pago_proveedor`** (A4): en su lugar, el guard del inverso pasa a mirar el ORIGEN (A7). |
| Bóveda | **SE TOCA** (R1): gana un tipo de salida en `SIGNO_BOVEDA` para el pago en efectivo. Zona caliente R3 ⇒ **test primero, cambio mínimo, alerta al titular**. |
| Caja / turno | **INTACTO**. El pago a proveedor NO entra a la ecuación de cierre del turno (R1): se paga de la bóveda, no del cajón. |
| Cartera | INTACTA. Comparten patrón, no código de negocio. |
| Piezas/inventario | INTACTO: una compra NO crea ni valoriza inventario en v1. |
| Salud | El cuadre 3:30 gana la comparación saldo-proveedor vs su recompute (patrón §194). |

## §5 — Bloques de ejecución (propuesta, cada uno con tests del ESCENARIO)

- **C0 · Fundación**: **(0a) el guard por ORIGEN (A7) con test primero — se hace ANTES de todo lo
  demás, porque es la costura que hace posible la convivencia manual/sistema y toca zona caliente R3.**
  Luego: modelo + reglas (deny-all write, CF única) + índices + `compras-core.js` puro.
- **C1 · Núcleo**: CFs (crear proveedor · registrar documento · registrar pago con pata · cruzar
  anticipo · anular) + recompute + tests §3. CERO UI.
- **C2 · Página "Proveedores"**: directorio + ficha con saldo y documentos + estado-cero honesto.
- **C3 · Registrar compra y pago** (los dos caminos de D0) + microcopy de dinero.
- **C4 · Vencimientos**: qué se vence, señal en Hoy (P5), y el exporte para el contador.
- **C5 · Rompimiento acotado** + Chrome holístico (patrón B6 §194).

## §6 — Checklist (marcar con evidencia)
- [x] **Comité ×3 acotado** sobre este borrador → §2 R1-R5 + A7 + deuda declarada (2026-07-27 `[OPUS-5]`).
      Evidencia: 3 correcciones al borrador propio (A4 `pago_proveedor` ya vivo · R1 opción (b) imposible ·
      R5 owner-only mal), 1 decisión nueva (A7) y 1 deuda declarada (A2 / pago múltiple).
- [ ] Consejo externo (prompt aparte: `2026-07-27-f-compras-PROMPT-CONSEJO-EXTERNO.md`) — lo corre Daniel
- [ ] Mockup de la página (Claude Design)
- [ ] C0…C5 con build+tests verdes y validación Chrome propia
- [ ] Consolidación: ADR + `21-ESPACIAL` + `35-LECCIONES-DINERO` + `05`/`10`
