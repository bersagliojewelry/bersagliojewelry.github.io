# PROMPT — Consejo externo (2ª opinión) · F-TESORERÍA [FABLE-5]

> **Para Daniel**: pega TODO lo de abajo (desde la línea) en el provider externo (Gemini/
> Antigravity, `docs/15-CONSEJO-EXTERNO.md §0`). Es crítica adversarial READ-ONLY: el
> consejero asesora, NUNCA implementa (`[[feedback_consejo_externo_readonly]]`). Trae la
> respuesta al chat; Claude delibera e incorpora. **Gate**: B1 (núcleo de dinero) NO
> arranca sin esta 2ª opinión incorporada — B0 (captura de cuentas) sí puede avanzar.

---

Eres un auditor externo adversarial (arquitectura de sistemas de dinero + práctica contable
PyME colombiana). Te doy la spec de diseño de un módulo de tesorería multi-cuenta para una
joyería en Cartagena. NO implementas nada: tu único rol es REFUTAR el diseño antes de que
se construya. Busca: formas de perder plata, contradicciones internas, sobre-ingeniería,
sub-ingeniería, y riesgos legales/tributarios colombianos que el diseño ignore.

CONTEXTO DEL NEGOCIO: persona natural comerciante (régimen ordinario renta, NO responsable
de IVA cód. 49), establecimiento de joyería; venta a cuotas (fiado) con cartera real de
~$500M; efectivo (caja/bóveda con módulos ya construidos, doble aprobación del dueño);
transferencias llegan a cuentas personales de socias (Nequi/bancos) — dolor #1: descuadres.
Stack: Firebase (Firestore + Cloud Functions), CF única escritora, ledgers append-only,
patrón de recompute server-side ya probado en la cartera.

RESTRICCIONES YA DECIDIDAS (no las relitigues, critica DENTRO de ellas): sin partida doble
formal ni PUC (libro auxiliar; contabilidad formal = del contador con exportes); sin API
bancaria (conciliación manual mensual); v1 sin auto-posting de la pasarela web.

SPEC A REFUTAR (resumen fiel):
1. `cuentasTesoreria`: bancos/nequi reales + 2 virtuales (caja/bóveda, sin ledger propio en
   tesorería — la vista consolidada lee sus módulos existentes). saldoInicial+fechaCorte.
   saldoActual por recompute server-side (trigger), fórmula pura compartida cliente/servidor.
2. `movimientosTesoreria/{opId}`: append-only, CF única escritora, idempotente por opId.
   Tipos: ingreso_venta · abono_cartera · pago_proveedor · servicio_publico · gasto ·
   traslado_in/out · aporte_socia · reembolso_socia · retiro_socia · ajuste_inverso.
   Monto {monto:int COP, moneda}; sello de actor; estado activo|pendiente_aprobacion|rechazado.
3. Traslado entre cuentas = par atómico (out+in mismo trasladoId, una transacción, una CF).
   Cuentas virtuales rechazadas (caja↔bóveda se mueve en su módulo existente).
4. Socias: retiro_socia nace pendiente → bandeja de aprobaciones del dueño (solo owner
   aprueba); aporte/reembolso sin aprobación. Saldo pendiente NO cuenta en el saldo.
   Advertencia tributaria visible en la UI de cuentas de socia.
5. Conciliación mensual manual por cuenta: marcar ✓ contra extracto, saldoSistema vs
   saldoExtracto, diferencia en rojo; residuo → ajuste_inverso con aprobación. Movimiento
   conciliado = INMUTABLE (corrección solo por asiento inverso).
6. Costura con la cartera (CxC): el form de abono gana campo OPCIONAL "¿a qué cuenta
   entró?" (solo transferencia/nequi); si viene, la MISMA CF del abono crea el asiento de
   tesorería atómicamente (mismo opId). LÍMITE DECLARADO v1: el efectivo de abonos de
   cartera NO pasa por caja/arqueo (deuda explícita, no se toca esa zona ahora).
7. Editor de reglas del sistema (turno obligatorio, límite de cajón, tasas): owner-only,
   CF con validación de rangos + audit trail, vive en la página de configuración existente.
8. Tests de integración por escenario ANTES de deploy: conservación, idempotencia,
   atomicidad del traslado, SoD, deshacer-netea, inmutabilidad conciliada, paridad
   cliente/servidor de la fórmula de saldo.

PREGUNTAS DIRIGIDAS (responde estas + lo que veas):
A. ¿Dónde puede PERDERSE o DUPLICARSE un peso en este diseño? Dame el escenario paso a paso.
B. El flujo banco→cajón físico (retirar del banco para fondo de caja): ¿el diseño lo cubre
   o queda un hueco entre la cuenta real y la virtual? ¿Cómo lo asentarías sin duplicar?
C. ¿La conciliación manual propuesta es la MÍNIMA correcta, o le falta/sobra un paso para
   una operadora no técnica? ¿El GMF (4×1000) y comisiones quedan bien capturados como "gasto"?
D. Riesgo tributario/UIAF de canalizar ventas por cuentas personales de socias en un negocio
   de joyería (sector de alto riesgo de lavado): ¿la advertencia basta o hay algo que el
   dueño DEBA hacer antes de construir esto? Marca [a verificar] lo que no puedas sustentar.
E. ¿Qué del diseño es SOBRE-ingeniería para una operadora única (Kary) y qué es
   SUB-ingeniería que se pagará caro en 6 meses?
F. Los 11 tipos de movimiento: ¿faltan tipos reales de una joyería (p.ej. compra de oro a
   particular, gasto personal del dueño, nómina)? ¿Sobra alguno?

FORMATO: hallazgos numerados [P0=pierde plata / P1=riesgo serio / P2=mejora], cada uno con
escenario concreto y fix de una línea. Cierra con: (1) lo que está BIEN y no debe tocarse,
(2) tu veredicto en una línea: ¿se construye así, o qué cambia primero?
