# 04. Credenciales

## Resumen Ejecutivo
En Wompi no existe "una llave maestra". Existen 4 credenciales distintas por ambiente, cada una diseñada bajo el principio de menor privilegio, separando la identidad, la autorización, la integridad y la autenticidad.

## Conceptos Clave
- **Public Key (`pub_`):** Identidad pública. Se usa en el frontend para obtener tokens de tarjetas y el Acceptance Token. No puede cobrar.
- **Private Key (`prv_`):** Autenticación y Autorización API. Va en el header `Authorization: Bearer`. Se usa en el backend para crear transacciones. Jamás exponerla.
- **Integrity Secret (`_integrity_`):** Usada en el backend para firmar (SHA-256) el payload de creación de transacción, evitando alteraciones de monto.
- **Events Secret (`_events_`):** Usada en el backend para validar la integridad de los Webhooks entrantes. Wompi entrega el checksum en el header `X-Event-Checksum` (y también en `signature.checksum` del body). Para validar, recalcula `SHA256(valores de los campos de signature.properties, en orden + timestamp (entero UNIX) + EventsSecret)` y compara. El `EventsSecret` va **al final** de la cadena. Es **SHA-256 plano (NO HMAC)**; el conjunto de `properties` puede variar por tipo de evento, así que léelo dinámicamente del payload.
- **Acceptance Tokens (son DOS):** Tokens efímeros obtenidos con la llave pública vía `GET /merchants/{public_key}`. Ambos son obligatorios cuando se procesan datos personales (Habeas Data / Ley 1581):
  - **`acceptance_token`** (de `presigned_acceptance.acceptance_token`): aceptación de Términos y Condiciones / política de privacidad.
  - **`accept_personal_auth`** (de `presigned_personal_data_auth.acceptance_token`): autorización del tratamiento de datos personales.
  Ambos se envían en el body del `POST /transactions` (o `/payment_sources`). Omitir `accept_personal_auth` causa fallas de validación (422) y de cumplimiento legal.

## Errores Comunes
- Usar la `Public Key` en el header de autorización para un `POST /transactions` (devuelve 401/403).
- Confundir el `Events Secret` con el `Integrity Secret`. Uno firma de salida, el otro valida de entrada.
- Exponer la `Private Key` en un bundle de React/Angular.

## Buenas Prácticas
- Guardar `prv_`, `_integrity_` y `_events_` en Secret Managers o `.env` seguros.
- Rotar las llaves inmediatamente si se subieron por accidente a un repo público (ej. GitHub).

## Qué debe saber hacer el agente
El agente debe actuar como un guardia de seguridad criptográfica. Debe reprender al usuario si nota que propone enviar la `Private Key` al frontend y debe guiar la validación de los hashes SHA-256.
