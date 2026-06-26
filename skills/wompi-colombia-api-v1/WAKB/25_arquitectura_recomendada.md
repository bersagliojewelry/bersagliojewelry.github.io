# 25. Arquitectura Recomendada

## Resumen Ejecutivo
Integrar Wompi para negocios de alto valor no se soluciona con una API monolítica sincrónica.

## Patrón Event-Driven + Idempotencia
1. Frontend emite intención de pago -> Estado BD: `PAYMENT_IN_PROGRESS`.
2. Cola (ej. SQS/RabbitMQ) se encola esperando el Webhook.
3. El Webhook de Wompi golpea un AWS Lambda/Endpoint ligero. Lo ÚNICO que hace es **validar el checksum del evento** y encolar el payload. Responde `HTTP 200` en ms. **Validación** (ver docs.wompi.co/eventos): `checksum = SHA256(valores de signature.properties EN ORDEN + timestamp UNIX de nivel superior + EventsSecret)`, SHA-256 plano en hexadecimal (NO HMAC ni asimétrico). Compara contra el header `X-Event-Checksum` (= `signature.checksum`), preferiblemente en tiempo constante. Si el header falta o no coincide, **descarta** el evento (no encolar).
4. Un Worker interno desencola, verifica Idempotencia (`IF webhook_procesado RETURN`), actualiza inventario y envía correo de confirmación.

## ¿Por qué esta arquitectura?
Evita que procesar correos lentos o caídas de BD hagan que Wompi reciba un timeout (504). Ante una respuesta distinta de 200, Wompi reintenta el evento un **máximo de 3 veces** durante las siguientes 24 h (aprox. a los 30 min, 3 h y 24 h) — **no** es un bombardeo de reintentos, pero depender de procesos lentos en el handler arriesga **perder** notificaciones. Por eso conviene responder 200 en milisegundos y desacoplar el trabajo pesado a un worker asíncrono.
