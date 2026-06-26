# 16. Webhooks

## Resumen Ejecutivo
Un Webhook es el mecanismo de comunicación asíncrona mediante el cual Wompi informa a tu backend que una transacción cambió de estado. Es la **única fuente de verdad** para confirmar una compra.

## ¿Qué es?
Es una petición HTTP POST que Wompi dispara hacia la URL configurada en el Dashboard de eventos.

## Conceptos Clave
- **Event Secret:** Llave secreta para validar la autenticidad.
- **Idempotencia:** Wompi puede enviar el evento `APPROVED` varias veces si falla la red. Tu base de datos debe identificar si ese `transaction.id` ya fue procesado para no duplicar ventas.
- **Payload:** Viene en `data.transaction`.

## Flujo Operativo y Validación
1. Wompi envía el Webhook.
2. Tu backend toma las variables definidas en `signature.properties` del JSON recibido (usualmente id, status, y amount).
3. Construye el string a hashear concatenando, **EN ESTE ORDEN**: (a) los valores de los campos listados en `signature.properties`, en el orden exacto en que aparecen (p. ej. `transaction.id`, `transaction.status`, `transaction.amount_in_cents`); (b) el campo de nivel superior `timestamp` (entero UNIX, **OBLIGATORIO**); y (c) **al final**, el `Events Secret` como **sufijo de texto plano** (NO como llave HMAC). Aplica **SHA-256** al string completo. Es un SHA-256 de secreto compartido (secret-suffix), **no** HMAC-SHA256 ni esquema asimétrico; implementarlo como HMAC produce un checksum que nunca coincide. Ej.: `SHA256('1234-1610641025-49201' + 'APPROVED' + '4490000' + '1530291411' + 'prod_events_XXXX')`.
4. Compara el hash con el campo `signature.checksum` recibido.
5. Si coincide, procesas la orden (de forma **idempotente**) y respondes `HTTP 200`. Si **no** coincide, **NO** proceses ni persistas el evento: regístralo con una alerta de seguridad y responde `HTTP 200` igualmente, para que Wompi no gaste su presupuesto de reintentos (máx. 3 en 24 h) en un evento ya rechazado. Un mismatch suele indicar un `Events Secret` equivocado (error de config) o un evento falsificado/replay; ninguno se beneficia de reintentos. Reserva las respuestas != 200 solo para fallos transitorios de tu lado que sí quieras que Wompi reintente.

## Errores Comunes
- Depender de la redirección del Frontend en lugar del Webhook.
- No responder HTTP 200 rápidamente. Ante una respuesta distinta de 200, Wompi reintenta el evento un **máximo de 3 veces** dentro de una ventana de 24 h (aprox. a los 30 min, 3 h y 24 h del intento inicial) y luego desiste **definitivamente**. Por eso el endpoint debe ser idempotente y responder 200 de inmediato; si los 3 reintentos fallan, el evento se pierde y deberás conciliarlo consultando `GET /transactions/{id}`.

## Qué debe saber hacer el agente
Escribir código defensivo que valide la firma del webhook ANTES de procesar la lógica de negocio, y manejar concurrencia.
