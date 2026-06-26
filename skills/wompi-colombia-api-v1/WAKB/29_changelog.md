# 29. Changelog (Evolución de la API)

## Resumen
Wompi es un producto vivo y cambia sus endpoints y requerimientos por regulación de Superintendencia Financiera.

## Hitos
- Recolección de señales antifraude: para PSE se pueden enviar los campos **opcionales** `reference_one` (IP del cliente), `reference_two` (fecha de apertura del producto, yyyymmdd) y `reference_three` (documento del beneficiario). Capturar la IP del comprador es clave para prevención de fraude. (Nota: **no** existe un campo de nivel superior `session_id` obligatorio en la API de Wompi Colombia.)
- Soporte para Botón Bancolombia directamente en el Checkout.
- Obligatoriedad de **DOS** Tokens de Aceptación para tratamiento de datos personales (Habeas Data): el de TyC (`presigned_acceptance.acceptance_token`, enviado como `acceptance_token`) y la Autorización de Tratamiento de Datos Personales (`presigned_personal_data_auth.acceptance_token`, enviado como `accept_personal_auth`). Ambos vía `GET /merchants/{public_key}`, requeridos en `POST /transactions` y `POST /payment_sources` cuando se procesan datos personales.

## Qué debe saber hacer el agente
Si el comercio tiene una versión muy vieja (donde se mandaba CVC o PAN al servidor backend), el agente debe exigirle migrar por violación PCI-DSS y guiar la reingeniería a tokenización de frontend.
