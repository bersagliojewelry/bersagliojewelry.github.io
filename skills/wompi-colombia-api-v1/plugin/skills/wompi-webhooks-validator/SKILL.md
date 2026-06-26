---
name: wompi-webhooks-validator
description: Activar cuando el usuario pida ayuda recibiendo, procesando o validando webhooks asíncronos de Wompi Colombia (ej. pagos PSE, Nequi).
---

# Skill: Wompi Webhooks Validator
Este skill es crítico para asegurar que los pagos no sean manipulados (idempotencia y validación criptográfica).

## Instrucciones para el Agente
Cuando el desarrollador esté programando el endpoint POST para recibir el webhook:

1. **Firma (checksum):** OBLIGA al desarrollador a calcular un checksum **SHA-256 simple (NO HMAC)**.
   - El conjunto de campos es **dinámico**: lee el array `signature.properties` del evento (NO lo asumas fijo). Para cada path en `signature.properties`, en orden, resuelve su valor contra el JSON del evento (p. ej. `transaction.amount_in_cents`), concaténalos en orden, luego concatena el `timestamp` (entero UNIX de nivel superior) y por último el `Events Secret` **como sufijo de texto plano**. Aplica SHA-256. Hardcodear `id + status + amount_in_cents` rompe la validación para eventos con otro `properties`.
   - Compara (en tiempo constante) contra el header HTTP **`X-Event-Checksum`** (equivalente a `signature.checksum` del body). **NO** es `x-signature`.
   - Si **no** coincide: registra alerta, **no** proceses el evento y responde `HTTP 200` (para no gastar el presupuesto de 3 reintentos de Wompi en un evento falsificado). Reserva respuestas != 200 solo para fallos transitorios de tu lado.
2. **Idempotencia:** Verifica que el desarrollador use una clave idempotente robusta. **NO** uses solo `transaction.id`: una misma transacción emite varios eventos en su ciclo de vida (p. ej. `PENDING` y luego `APPROVED` en PSE/Nequi) y descartarías el evento final como duplicado. Usa el `id` del **evento**, o la combinación `transaction.id + status`. Wompi reintenta una respuesta no-200 un máximo de 3 veces en 24 h.
3. **Respuesta Rápida:** La lógica pesada (enviar correos, actualizar inventario) debe ser asíncrona. El webhook de Wompi debe recibir un `HTTP 200` en menos de 2 segundos.
