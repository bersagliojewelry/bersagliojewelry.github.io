# PROMPT — CONSEJO EXTERNO · F2.4 Apartados (Decisión Fuerte)

> **Para Daniel:** pega esto en el proveedor externo (Antigravity/Gemini — read-only, NO edita). Trae la
> respuesta y Claude la integra como un peer-review más (verifica/refuta, no acata). Anti-anclaje: abajo va
> el problema CRUDO + invariantes + opciones descartadas + conflictos abiertos, **no** la conclusión ya
> pulida — tu trabajo es CAZAR EL FALLO, no aprobar.

---

Eres un revisor adversarial senior (arquitecto de sistemas de dinero + contador DIAN Colombia + abogado de
protección al consumidor CO). Revisa el diseño de una funcionalidad de **apartados/plan separe** para una
**joyería de lujo colombiana** (2 personas: dueña Kary opera; Daniel dueño). Stack: **Firebase/Firestore**,
Cloud Functions como único escritor de dinero/stock, sin backend propio. Bajo volumen, alto ticket.

Puedes leer el código y las specs (solo-lectura). Archivos clave:
- Diseño propuesto: `docs/superpowers/specs/2026-07-09-f2-4-apartados-DISENO.md`
- Núcleo de pedidos/estados/pagos: `functions/pedidos-core.js` (tabla `TRANSICIONES`, `crearPedidoCore`, `pagos[]` split-tender §179, `cerrarTurnoCore` legacy)
- Núcleo de caja/turnos/bóveda: `functions/caja-core.js` (`cerrarTurnoCore`, `movimientoCajaCore`, `CONCEPTOS_CAJA`)
- Cartera/saldo: `functions/saldo.js` (`computeSaldo`), `js/crm-service.js` (`addMovimiento`), `firestore.rules` (`movimientoValido`)
- Vínculo cliente (ya existe): `functions/identidad-cf.js` (`vincularClientePedidoCore`)

## El problema CRUDO
El cliente aparta una pieza con un anticipo y paga en abonos (1..N, en el tiempo) hasta completar; ahí se
entrega. Hay que modelarlo SIN romper lo que ya está en PRODUCCIÓN.

## Invariantes que NO se pueden romper
1. Todo dinero/stock: **CF-only + append-only + anular≠borrar** (correcciones = asiento nuevo).
2. **Una entidad por concepto**: pedido=`pedidos`, dinero-cliente=`movimientos` CRM, stock=`pieces`+ledger, persona=`clientes`. Nada paralelo.
3. El **arqueo de caja debe cuadrar exacto** (ni sub- ni sobre-reporte del efectivo). El arqueo (`cerrarTurnoCore`) suma ventas por `turnoId` sobre `pagos[]`, solo estados-con-dinero; el efectivo esperado = fondo + ventas.efectivo + ingresos(`movsCaja`) − egresos + bóveda.
4. El money-model `pagos[]` (§179, TODO-73) está **EN PROD**: es split-tender con `Σpagos===total`, inmediato; §179.5 dice explícito que **NO es pago parcial**.
5. Operadora ÚNICA no técnica: el flujo debe ser simple y a prueba de error.

## Contexto verificado (hechos, no supuestos)
- El vínculo pedido↔cliente (`clienteId`) ya existe como CF idempotente.
- Un `movimiento` de cartera hoy NO puede llevar `pedidoId` (whitelist de reglas lo rechaza).
- La cartera (`computeSaldo`) suma `factura:+1 / abono:−1` sobre TODOS los movimientos del cliente → cualquier movimiento cuenta en el `saldoActual`/aging.
- El arqueo con un pedido de `pagos:[]` vacío deriva `[{medio, total}]` (fallback), y `entregado` ∈ estados-con-dinero.

## Opciones ya DESCARTADAS (y por qué) — no las repropongas sin refutar el motivo
- **Reusar `factura`+`abono` de fiado tal cual**: contamina `saldoActual` (el cliente aparece moroso) y confunde un PASIVO (anticipo) con un ACTIVO (fiado). Descartado.
- **Meter los abonos en `pedido.pagos[]`**: rompe `Σpagos===total` mientras el saldo es parcial, y arriesga doble/triple conteo del efectivo (cartera + pagos[] + `movsCaja`). Descartado.
- **Consumir la unidad de stock al abrir el apartado** (como una venta): registra venta/COGS fantasma antes de pagar. Descartado a favor de un HOLD (reserva) con consumo definitivo solo en la entrega.
- **Que el reaper reembolse solo al vencer**: una CF no tiene cajón/turno; auto-reembolsar o auto-decomisar es inseguro/ilegal. Descartado: el reaper solo marca vencido + libera hold + reclasifica a saldo a favor + alerta.

## Diseño propuesto (resumen — atácalo)
- Apartado = `pedido` con `estado:'apartado'`, `esApartado:true`, `clienteId` obligatorio, `pagos:[]`, `turnoId:null`.
- **DOS planos del dinero**: (A) TESORERÍA por turno — abono efectivo → `movsCaja` naturaleza `anticipo_apartado` (turno-gated); (B) REVENUE/P&L por periodo — venta se reconoce en la ENTREGA (v1 solo captura la data; el motor de reportes se difiere a F4).
- Dinero en cartera con tipos SEGREGADOS `apartado_anticipo/_abono` (pasivo `saldoAnticipos`, fuera del `saldoActual` de fiado).
- Stock = HOLD (`piece.disponibilidad`), consumo definitivo solo en entrega, chequeado en todo path de venta.
- Cancelación: régimen ÚNICO 100% reembolsable sin penalidad (default dinero); reembolso fan-out por medio/pagador; no-forfeiture.
- IVA se causa a la ENTREGA (factura DIAN al entregar); anticipo = recibo interno sin IVA liquidado.
- v1 acotado: pieza ÚNICA, 1 ítem, POS presencial, penalidad OFF.

## Lo que te pido (sé adversarial, específico, y prioriza)
1. **¿Dónde se descuadra el arqueo o se pierde/duplica dinero?** Busca la carrera o el borde que rompe la tesorería (abono ↔ cierre de turno, cancelación con abonos en turnos ya cerrados, sobrepago, doble-abono humano desde caja y ficha).
2. **¿El plano REVENUE diferido a F4 deja un hueco irreversible?** ¿Qué data DEBE capturarse hoy para que F4 reconstruya el revenue sin ambigüedad? ¿Rompe algún lector existente de `pagos[]`?
3. **Contable/DIAN (CO):** ¿el tratamiento del anticipo como pasivo + IVA a la entrega es correcto? ¿riesgos con retefuente B2B, tiquete POS >5 UVT, numeración DIAN, encargo/a-medida (IVA de servicio al anticipo)?
4. **Legal (CO):** ¿el instrumento "reserva revocable con anticipo imputable" evita la promesa de compraventa (art. 1611 CC)? ¿la política no-forfeiture + reembolso 100% es la correcta vs arras? ¿cláusulas del recibo obligatorias?
5. **SARLAFT/UIAF:** ¿la captura de identidad del pagador gated por umbral acumulado es defendible? ¿el conflicto pagador≠titular (regalo) tiene salida limpia?
6. **¿Qué está SOBRE-diseñado para 2 personas de bajo volumen?** (contrapeso: no queremos maquinaria inútil).
7. **El fallo fatal que el diseño no vio.** Uno concreto, con el camino que lo dispara.

Responde priorizado por severidad (P0/P1/P2), con el camino concreto que dispara cada hallazgo. No apruebes: refuta.
