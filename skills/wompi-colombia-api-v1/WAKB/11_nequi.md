# 11. Nequi

## Resumen Ejecutivo
Nequi es una billetera digital masiva en Colombia. Wompi soporta su integración, permitiendo cobrar enviando notificaciones push al celular del cliente o mediante redirección.

## Flujo Operativo (Push Notification)
1. **Creación:** Backend envía un `POST /transactions` con `payment_method.type: "NEQUI"` y `payment_method.phone_number: "300..."`.
2. **Push:** Wompi gatilla la app de Nequi del cliente. El celular recibe una notificación de cobro.
3. **Estado Inicial:** PENDING.
4. **Decisión del Cliente:** El cliente abre la app de Nequi y "Acepta" o "Rechaza".
5. **Webhook:** Wompi notifica al backend el resultado final.

## Errores Comunes
- No manejar el caso donde el usuario ignora la notificación (Timeout de Nequi).
- Tratarlo como un flujo síncrono. ¡ES ASÍNCRONO! El usuario puede tardar minutos en aceptar.

## Diagnóstico
Si un pago de Nequi falla al instante, validar que el número sea de 10 dígitos y exista en Nequi. Si falla después de un rato, suele ser porque el usuario no aceptó a tiempo o rechazó en la app.

## Qué debe saber hacer el agente
Advertir siempre al desarrollador que el campo `phone_number` es crítico y que el cliente debe estar atento a la app para finalizar el pago.
