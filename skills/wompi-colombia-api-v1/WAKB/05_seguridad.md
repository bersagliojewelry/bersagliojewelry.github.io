# 05. Seguridad (PCI DSS, TLS, Criptografía)

## Resumen Ejecutivo
La seguridad en Wompi se basa en desvincular al comercio de la manipulación directa de información sensible (datos de tarjeta), usar encriptación en tránsito, y validación criptográfica en reposo.

## Conceptos Clave
- **Tokenización:** Wompi recibe el PAN (número de tarjeta) directo en su frontend (Widget) o mediante su endpoint de tokenización, y devuelve un `tok_...`. El backend del comercio NUNCA toca el PAN, reduciendo el scope de certificación PCI-DSS a SAQ A o SAQ A-EP.
- **Firmas SHA-256 (secreto compartido):** Wompi usa un **hash SHA-256 plano con construcción secret-suffix** (NO es HMAC ni criptografía asimétrica): se calcula `SHA256(concatenación de valores + [timestamp] + Secreto)` en hexadecimal. Para **eventos/webhooks** el `timestamp` es obligatorio y el `EventsSecret` va al final: `SHA256(valores_de_properties + timestamp + EventsSecret)`, entregado en `X-Event-Checksum` y `signature.checksum`. Para la **Integrity Signature** del Widget/transacción: `SHA256(Reference + Amount + Currency + [ExpirationTime] + IntegritySecret)`, sin timestamp. Implementarlo como HMAC produce un digest que **nunca** coincide.
- **TLS 1.2+:** Obligatorio para todas las comunicaciones API.
- **Device Session ID:** Scripts antifraude de Wompi que el frontend debe cargar. Recopila huella digital del dispositivo para evitar fraudes y contracargos.

## Flujo Operativo (Seguridad Antifraude)
1. Frontend incluye el script antifraude (Fingerprint).
2. Se genera un `session_id`.
3. Backend adjunta el `session_id` al `POST /transactions`.
4. El motor antifraude de Wompi evalúa el riesgo. Si el riesgo es alto, la transacción resultante queda en estado **`DECLINED`**, con el motivo en el campo `status_message` de la respuesta. (No existe un código dedicado `400 FRAUD_SUSPECTED`: una petición mal formada puede devolver `HTTP 422`, pero el rechazo por riesgo se refleja como una transacción `DECLINED`, no como un código HTTP 4xx.)

## Errores Comunes
- No incluir el `session_id` en cobros por tarjeta de crédito, causando rechazos sistemáticos por riesgo.
- Guardar logs de los CVV o números de tarjeta (violación grave de PCI-DSS).

## Qué debe saber hacer el agente
Debe explicar por qué la tokenización es obligatoria, cómo estructurar la Integrity Signature en código (Node, Python, PHP), y cómo mitigar los falsos positivos del motor antifraude enviando datos consistentes (IPs, correos, sesión).
