# PROMPT — Consejo externo (2ª opinión) · F-COMPRAS "Proveedores" [OPUS-5]

> **Para Daniel**: pega TODO lo de abajo (desde la línea) en el provider externo (Gemini/
> Antigravity, `docs/15-CONSEJO-EXTERNO.md §0`). Es crítica adversarial READ-ONLY: el
> consejero asesora, NUNCA implementa (`[[feedback_consejo_externo_readonly]]`). Trae la
> respuesta al chat; Claude delibera e incorpora.
> **Gate**: C1 (núcleo de dinero) NO arranca sin esta 2ª opinión incorporada. C0 sí puede avanzar.
> **Anti-anclaje (R1)**: abajo van las opciones DESCARTADAS y las invariantes, para que el
> consejero cace el fallo en la LÓGICA, no la sintaxis — y para no anclarlo a nuestra conclusión.

---

Eres un auditor externo adversarial (arquitectura de sistemas de dinero + práctica contable
PyME colombiana). Te doy el diseño de un módulo de CUENTAS POR PAGAR ("Proveedores") para una
joyería en Cartagena. NO implementas nada: tu único rol es REFUTARLO antes de que se construya.
Busca: formas de pagar dos veces, formas de que la plata desaparezca de un libro y aparezca en
otro, contradicciones con los módulos ya vivos, sobre-ingeniería, sub-ingeniería, y riesgos
tributarios colombianos que el diseño ignore.

CONTEXTO DEL NEGOCIO: persona natural comerciante (régimen ordinario renta, NO responsable de
IVA cód. 49), joyería; compra a talleres, gemólogos y proveedores de oro/piedras. Muchos de esos
proveedores NO facturan. Generalmente le FÍAN (paga después), pero también hay pagos de contado,
anticipos, pagos parciales y quedar debiendo. Una sola operadora (la dueña del negocio) registra
todo; el dueño del sistema aprueba lo destructivo.

STACK Y PIEZAS YA VIVAS EN PRODUCCIÓN (no las relitigues, son hechos):
- Firestore + Cloud Functions. CF única escritora, ledgers append-only, idempotencia por `opId`,
  recompute server-side como autoridad del saldo, "anular = sellar, jamás borrar".
- **Tesorería** (`movimientosTesoreria`): libro de las cuentas REALES (bancos/Nequi). El tipo
  `pago_proveedor` (signo −1) YA EXISTE y hoy se registra a mano desde la UI de tesorería.
- **Bóveda** (`bovedaMovimientos` + saldo espejo) y **caja/turno**: el EFECTIVO vive aquí, NO en
  tesorería. Las cuentas "caja"/"bóveda" existen como virtuales pero el constructor de asientos
  de tesorería las RECHAZA explícitamente.
- **Patrón "pata de sistema"**: cuando una operación de un módulo mueve plata de otro libro, la CF
  del origen escribe el asiento del otro libro EN SU MISMA TRANSACCIÓN (ya probado en: abono de
  cartera → banco; consignación bóveda → banco; retiro banco → bóveda).
- **Cicatriz reciente (costó un P0 real)**: una operación con "pata" en otro libro podía deshacerse
  por DOS vías (anular el origen, o corregirla a mano en el otro libro) ⇒ la reversa restaba dos
  veces / inventaba plata. Se cerró prohibiendo la corrección manual de los asientos que creó otra
  operación. **Regla que quedó: el camino de DESHACER se construye en el mismo commit que el de HACER.**

DISEÑO A REFUTAR:
1. Ledger POR DOCUMENTO (no saldo corriente): cada factura del proveedor tiene su propio saldo y su
   vencimiento (`proveedores/{id}/documentos/{opId}`, append-only). El valor del módulo es "esta
   factura vence el viernes".
2. Un pago apunta a UN documento; un documento admite N pagos (pago parcial). Sin aplicaciones
   multi-factura en v1.
3. El anticipo es un documento de signo contrario (saldo a favor), y se cruza contra una factura con
   un movimiento explícito que baja ambos saldos en la MISMA transacción.
4. Todo pago escribe su pata en el libro de donde salió la plata, misma tx: si es banco/Nequi → el
   libro de tesorería; **si es efectivo → el libro de la BÓVEDA** (nuevo tipo de salida allí).
   Regla operativa: "a los proveedores se les paga de la bóveda o del banco; del cajón no" — si la
   plata está en el cajón, primero se hace el traslado cajón→bóveda que ya existe. El cierre del
   turno de caja queda intacto.
5. La cuenta/origen del pago es OBLIGATORIA (art. 771-5 ET: sin bancarización el gasto no es
   deducible) — a diferencia del abono de cliente, donde "todavía no sé de dónde entró" sí se acepta.
6. El módulo NO calcula retenciones (las liquida el contador con un exporte; aquí solo se captura el
   régimen del proveedor), NO valoriza inventario, NO hace órdenes de compra ni recepción de
   mercancía, NO usa partida doble. Una compra NO crea inventario en v1.
7. Compra SIN factura: permitida, marcada, con advertencia visible ("sin factura tu contador no puede
   descontar esta compra de impuestos"). Nunca un bloqueo.
8. Control de duplicados: (a) número de factura único por proveedor cuando hay número, con doc-llave
   determinista escrito en la misma transacción (Firestore no tiene unique constraint); (b) detector
   de "pago gemelo" (mismo documento + mismo monto + misma fecha) que pide CONFIRMACIÓN, no bloquea.
9. Aprobación del dueño solo para lo destructivo: anular un pago ya hecho, anular una factura con
   pagos. Registrar una compra o un pago normal NO pide permiso.
10. Pagar MÁS del saldo del documento no se bloquea (queda saldo a favor), pero se avisa y el saldo a
    favor se muestra en rojo.
11. La deuda con proveedores NO entra al indicador de "plata total" (es plata comprometida, no plata
    que se tiene); va como señal aparte ("le debes $X, lo próximo vence el …"), visible para quien paga.

OPCIONES QUE YA SE DESCARTARON (dinos si descartamos mal):
- (D-a) Que el pago en efectivo escribiera su asiento en el libro de TESORERÍA usando la cuenta
  virtual "bóveda". Descartada: el saldo de la bóveda ya se lleva en su propio libro ⇒ contaría la
  misma plata dos veces.
- (D-b) Permitir pagar al proveedor desde el CAJÓN del mostrador. Descartada: obligaría a meter el
  pago en la ecuación de cierre del turno (zona de alto riesgo ya estabilizada) sin ganar nada.
- (D-c) Marcar el tipo `pago_proveedor` como "solo de sistema". Descartada: mataría la puerta manual
  que la operadora ya usa hoy para el pago suelto sin factura. En su lugar, la regla de "esto no se
  corrige a mano" pasa a mirar el ORIGEN del asiento (¿lo creó otra operación?) en vez del tipo.
- (D-d) Aplicaciones multi-factura (un pago que salda 3 facturas) en v1. Descartada por complejidad;
  se acepta como deuda conocida que una transferencia que paga 3 facturas se registre como 3 pagos.

INVARIANTES QUE EL DISEÑO DEBE CUMPLIR (úsalas como vara de medir):
(1) Conservación: pagar $X baja el saldo del proveedor en $X y baja el libro de origen en $X, en una
sola transacción. (2) El mismo número en todas las vistas (directorio, ficha, recompute del servidor).
(3) Idempotencia verificada LIBRO POR LIBRO: reintentar la misma operación no duplica el documento, ni
el pago, ni el asiento del otro libro. (4) Deshacer netea TODO. (5) "Anulado" significa lo mismo en
todos los módulos. (6) Corregir = asiento inverso, jamás editar ni borrar. (7) La anomalía GRITA
(saldo negativo, vencido, pago sin soporte) — nunca se esconde con un "máximo(0, …)".

RESPÓNDEME:
A. Los 3 fallos MÁS GRAVES del diseño, cada uno con el escenario paso a paso donde se pierde o se
   duplica plata (si no encuentras 3, dilo — no inventes).
B. ¿La decisión (4)+(D-a)+(D-b) sobre el pago en efectivo es correcta, o hay una tercera vía mejor?
C. ¿(D-c) — discriminar "lo que no se corrige a mano" por ORIGEN en vez de por TIPO — es sólido, o
   abre un hueco nuevo? ¿Qué caso lo rompe?
D. ¿Qué exige la práctica tributaria colombiana (771-5, retenciones, soportes de compras a no
   facturadores / documento soporte del art. 1.6.1.4.12 DUR) que este diseño ignore y que sea CARO
   agregar después?
E. Qué es SOBRE-ingeniería aquí y debería salir de v1, y qué es SUB-ingeniería y va a doler en 6 meses.
