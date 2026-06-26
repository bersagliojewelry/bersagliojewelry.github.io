# 20. Reembolsos (Refunds y Voids)

## Resumen Ejecutivo
Existen situaciones de retracto, fraude o falta de inventario donde el dinero debe volver al cliente. 

## Conceptos Clave
- **Void (Anulación):** Posible solo mientras la transacción **no se ha liquidado** con el adquirente (normalmente el mismo día; el corte suele ser alrededor de las 9:00 PM, pero el horario exacto depende del adquirente/red y es **ilustrativo, no contractual**). Aplica a tarjeta. El dinero "nunca salió", por lo que no hay comisiones.
- **Refund (Reembolso):** Se hace días después. El dinero ya había entrado. El banco puede tardar de 15 a 30 días hábiles en devolverlo a la tarjeta del cliente.

## Flujo Operativo
- **Void / Anulación:** `POST /v1/transactions/{transaction_id}/void` (Private Key). Solo válido mientras la transacción está en un estado anulable, antes de la liquidación con el adquirente (solo tarjeta).
- **Refund / Devolución:** `POST /v1/transactions/{transaction_id}/refunds` (Private Key). Se especifica el monto a devolver en centavos (soporta reembolsos parciales).

## Errores Comunes
- Intentar reembolsar un pago PSE o Nequi por API. **¡PSE NO SOPORTA REEMBOLSOS AUTOMÁTICOS POR API!** Requiere transferencia manual bancaria desde el equipo contable.
- Prometerle al cliente que el dinero estará en 24 horas (es culpa del banco emisor que tarda semanas).

## Qué debe saber hacer el agente
Distinguir qué métodos de pago soportan el endpoint `/refunds` y cuáles requieren operaciones manuales.
