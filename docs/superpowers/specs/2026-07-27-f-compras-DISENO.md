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
- **A4 · Todo pago escribe su pata en TESORERÍA, en la misma tx** — patrón D9/V1 ya probado y
  auditado en §194: `movimientosTesoreria` tipo `pago_proveedor` (ya existe en `SIGNO_TESORERIA`,
  −1), fuente SISTEMA, idempotente POR-LIBRO, ancla `pataTeso.cuentaId` en el documento. **`cuentaId`
  es OBLIGATORIO en el pago** (771-5; a diferencia del abono de cartera, donde "todavía no sé" era
  legítimo: aquí la deducibilidad depende de saber de dónde salió).
  ⚠️ **Excepción a resolver**: el pago en EFECTIVO desde el cajón/bóveda. Ver §2 P1.
- **A5 · Se reusa lo probado, no se inventa**: CF única escritora + idempotencia por `opId` + append
  only + anular = sellar `anulado` (jamás borrar) + recompute server-side del saldo + SoD para lo
  destructivo. Núcleo puro en `functions/compras-core.js`, espejo cliente `js/admin/compras-format.js`
  con test de paridad (invariante 2). **Cero ecuaciones nuevas copiadas a mano** (L-86).
- **A6 · Rail**: grupo **Compras** (plan v5 §2, ya previsto) con UNA página "Proveedores"
  (directorio + deudas + pagos), voz es-CO: "Proveedores", jamás "CxP".

## §2 — Preguntas ABIERTAS para el comité ×3 y el consejo externo

- **P1 · ¿Cómo se paga a un proveedor en EFECTIVO?** V18 fijó que el efectivo entra y sale SIEMPRE
  por la bóveda (un solo punto de control). Un pago en efectivo al taller sale del cajón o de la
  bóveda, no de un banco ⇒ o (a) se prohíbe y se obliga a registrar primero un retiro a bóveda, o
  (b) el pago acepta cuenta VIRTUAL (caja/bóveda) y escribe su pata en el módulo correspondiente
  (patrón V17). **Esta es la decisión cara del módulo** y toca zona caliente R3.
- **P2 · ¿La factura del proveedor necesita `numero` único por proveedor?** (control de duplicados —
  pagar dos veces la misma factura es el fraude/error #1 en CxP). Propuesta: sí, con rechazo duro y
  mensaje claro; a confirmar contra la realidad de los talleres (que a veces no facturan).
- **P3 · ¿Compras sin factura?** Muchos talleres/gemólogos no facturan. Si se exige `numero`+`nit`,
  el módulo se vuelve inusable; si no se exige, el exporte al contador queda cojo. Propuesta:
  documento con `sinSoporteFormal:true` + advertencia visible ("sin soporte tu contador no lo puede
  deducir"), nunca un bloqueo.
- **P4 · SoD**: ¿qué exige aprobación del owner? Propuesta: **anular un pago ya hecho** y **anular
  una factura con pagos**; registrar factura/pago normal NO (Kary opera). A refutar.
- **P5 · ¿El saldo del proveedor entra a alguna vista consolidada?** La deuda NO es plata que se
  tiene, es plata comprometida. Propuesta: NO tocar "Plata total" (mentiría); una señal aparte
  ("le debes $X, lo próximo vence el …") en Hoy, fila owner.

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
| Tesorería | Se USA su puerta de sistema (`construirPataSistema`, `PATA_TIPOS` gana `pago_proveedor`). Su ledger y su recompute INTACTOS. |
| Caja/Bóveda | INTACTOS salvo que P1 decida lo contrario (zona caliente R3 ⇒ test primero). |
| Cartera | INTACTA. Comparten patrón, no código de negocio. |
| Piezas/inventario | INTACTO: una compra NO crea ni valoriza inventario en v1. |
| Salud | El cuadre 3:30 gana la comparación saldo-proveedor vs su recompute (patrón §194). |

## §5 — Bloques de ejecución (propuesta, cada uno con tests del ESCENARIO)

- **C0 · Fundación**: modelo + reglas (deny-all write, CF única) + índices + `compras-core.js` puro.
- **C1 · Núcleo**: CFs (crear proveedor · registrar documento · registrar pago con pata · cruzar
  anticipo · anular) + recompute + tests §3. CERO UI.
- **C2 · Página "Proveedores"**: directorio + ficha con saldo y documentos + estado-cero honesto.
- **C3 · Registrar compra y pago** (los dos caminos de D0) + microcopy de dinero.
- **C4 · Vencimientos**: qué se vence, señal en Hoy (P5), y el exporte para el contador.
- **C5 · Rompimiento acotado** + Chrome holístico (patrón B6 §194).

## §6 — Checklist (marcar con evidencia)
- [ ] Comité ×3 acotado sobre este borrador (P1-P5 son su materia prima)
- [ ] Consejo externo (prompt aparte) — lo corre Daniel
- [ ] Mockup de la página (Claude Design)
- [ ] C0…C5 con build+tests verdes y validación Chrome propia
- [ ] Consolidación: ADR + `21-ESPACIAL` + `35-LECCIONES-DINERO` + `05`/`10`
