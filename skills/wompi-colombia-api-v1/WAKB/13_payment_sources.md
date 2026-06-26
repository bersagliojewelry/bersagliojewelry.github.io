# 13. Payment Sources (Fuentes de Pago)

## Resumen Ejecutivo
Wompi permite a los comercios "guardar" la tarjeta o medio de pago de un cliente recurrente (ej. Netflix, Uber) usando `Payment Sources`.

## ¿Qué es?
Un Payment Source (Fuente de pago) es un recurso persistente en Wompi asociado a un cliente. 

## ¿Para qué sirve?
Permite hacer "Cargos Automáticos" (One-Click checkout o Suscripciones) sin que el usuario tenga que digitar su tarjeta cada vez.

## Flujo Operativo
1. Tokenizar la tarjeta (Public Key).
2. Obtener el Acceptance Token del usuario (Public Key).
3. **Guardar Fuente:** POST a `/payment_sources` (Private Key) enviando el token de la tarjeta, el correo del cliente, el Acceptance Token (`acceptance_token`) y el Token de Autorización de Datos Personales (`accept_personal_auth`). Wompi devuelve un `source_id` (ej. `3456`).
4. **Cobrar Recurrente:** Al mes siguiente, hacer POST a `/transactions` enviando el `source_id` en el campo `payment_source_id`.

## Errores Comunes
- Intentar cobrar recurrentemente a PSE o Efectivo (no se puede, es un pull asíncrono, no una tarjeta guardada).
- Olvidar que generar un Payment Source requiere explícitamente **ambos** tokens (`acceptance_token` y `accept_personal_auth`) por Habeas Data / protección de datos personales.

## Qué debe saber hacer el agente
Mapear el flujo de guardado de tarjetas para casos de suscripción o e-commerce rápido (One-click).
