# 07. Transacciones

## Resumen Ejecutivo
El núcleo de Wompi es el recurso Transaction. Cada intento de mover dinero crea un registro inmutable en el endpoint `/transactions`.

## ¿Qué es?
El objeto `Transaction` representa un intento de pago, ya sea por tarjeta, PSE, Nequi o Efectivo. Cada transacción tiene un ciclo de vida definido.

## Conceptos Clave
- **`amount_in_cents`:** Monto total de la operación (Siempre en centavos COP).
- **`reference`:** Identificador único del comercio para esa venta (ej. ID del carrito). **Debe ser único.**
- **`status`:** PENDING, APPROVED, DECLINED, ERROR, VOIDED.
- **`payment_method`:** El objeto que contiene la lógica específica (tipo de pago, token, banco).

## Flujo Operativo
El ciclo de vida estándar es:
1. CREATION (`POST /transactions`) -> Devuelve 201 Created (Status: PENDING o APPROVED).
2. ASYNC UPDATE (Webhook) -> Notifica el cambio a APPROVED / DECLINED.

## Errores Comunes
- Enviar una `reference` duplicada que ya fue aprobada en otra transacción.
- No guardar el `transaction.id` proporcionado por Wompi en la base de datos local para futura conciliación.

## QA y Pruebas
Simular transacciones aprobadas, rechazadas por fondos insuficientes, y transacciones que se quedan en PENDING indefinidamente (para probar timeouts en el backend).

## Qué debe saber hacer el agente
Validar el payload de creación de transacciones asegurando que los campos requeridos estén presentes y bien formados: `amount_in_cents`, `currency`, `reference`, `signature`, `payment_method`, `customer_email` y —cuando se procesan datos personales (prácticamente toda transacción por API directa, por Habeas Data)— los **dos** tokens de aceptación: `acceptance_token` (de `presigned_acceptance.acceptance_token`) y `accept_personal_auth` (de `presigned_personal_data_auth.acceptance_token`), ambos obtenidos vía `GET /merchants/{public_key}`. Si falta cualquiera de los dos tokens, Wompi rechaza el payload (422).
