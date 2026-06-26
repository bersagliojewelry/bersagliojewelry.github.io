# 14. Acceptance Tokens (son DOS)

## Resumen Ejecutivo
Wompi, bajo las normativas colombianas y de tratamiento de datos personales, requiere prueba de que el cliente final aceptó que sus datos serán procesados por la pasarela.

## ¿Qué es?
Son en realidad **DOS** tokens de aceptación de **vigencia corta** (JWT firmados con un campo `exp`), no uno solo. Ambos se obtienen de `GET /merchants/{public_key}` y **deben solicitarse de nuevo en cada checkout** porque expiran:

- **`presigned_acceptance.acceptance_token`** → se envía en el body como **`acceptance_token`**: aceptación de los Términos y Condiciones / política de privacidad.
- **`presigned_personal_data_auth.acceptance_token`** → se envía en el body como **`accept_personal_auth`**: autorización del tratamiento de datos personales (Habeas Data / Ley 1581).

Cuando se procesan datos personales del usuario, **ambos** son obligatorios en `POST /transactions` y `POST /payment_sources`.

## Flujo Operativo
1. Frontend hace `GET /merchants/{public_key}`.
2. La respuesta incluye **DOS** presigned tokens, cada uno con su link (permalink) al contrato: `presigned_acceptance.acceptance_token` (TyC / política de privacidad) y `presigned_personal_data_auth.acceptance_token` (autorización de tratamiento de datos personales).
3. En la pantalla de pago se muestran ambos enlaces y el(los) checkbox(es): "[ ] Acepto los TyC y la autorización de tratamiento de datos de Wompi".
4. Si el usuario acepta y presiona "Pagar", el backend inyecta **ambos** tokens en el POST `/transactions` o `/payment_sources`: `acceptance_token` = `presigned_acceptance.acceptance_token`, y `accept_personal_auth` = `presigned_personal_data_auth.acceptance_token`. Bajo Habeas Data, cuando se procesan datos personales **ambos** son obligatorios; cada uno es de un solo uso y expira rápido, así que se piden frescos por cada intento de pago.

## Errores Comunes
- Hardcodear un Acceptance Token antiguo (vencen rápidamente).
- **Enviar solo `acceptance_token` y olvidar `accept_personal_auth`** (o viceversa): cuando hay datos personales, omitir cualquiera de los dos provoca rechazo `422` e incumplimiento de Habeas Data.
- No mostrar al usuario los **dos** links reales (TyC y autorización de datos personales) (riesgo legal).
- Confundir cualquiera de los dos tokens con la Public Key o con el Token de la Tarjeta.

## Diagnóstico
Si la API devuelve `422 Unprocessable Entity` diciendo "Acceptance token is invalid or expired", el comercio está reutilizando un token viejo en lugar de pedir uno nuevo por cada intento de pago.

## Qué debe saber hacer el agente
Guiar cómo extraer dinámicamente **ambos** tokens (`acceptance_token` y `accept_personal_auth`) antes de construir el payload final, y validar que los dos viajen en el body cuando se procesan datos personales.
