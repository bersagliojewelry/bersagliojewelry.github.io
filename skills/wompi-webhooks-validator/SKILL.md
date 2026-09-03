---
name: wompi-webhooks-validator
description: Activar cuando el usuario pida ayuda recibiendo, procesando o validando webhooks asíncronos de Wompi Colombia (ej. pagos PSE, Nequi).
actualizada: 2026-09-02
reglas: 8
lecciones: []
origen: propia
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
4. **🔴 EL ORDEN DE LAS DOS COMPROBACIONES ES PARTE DE LA SEGURIDAD.** Primero la FIRMA, después la idempotencia — nunca al revés. Si se consulta/ocupa la clave idempotente antes de validar el checksum, basta con enviar basura llevando la clave de un evento legítimo para que el evento **de verdad** se descarte luego como «duplicado»: una denegación de servicio dirigida, gratis, contra un cobro concreto. *Un guardia que apunta en la lista antes de mirar el carnet no es un guardia.* Y por lo mismo, la clave solo se MARCA como vista cuando el evento ya se procesó, no cuando se recibió.
5. **Un `status` que no conoces NO es «aprobado».** Al mapear estados a los tuyos, el `default` va al estado más conservador (pendiente/en espera), jamás al que libera dinero o stock. Y `APPROVED` significa que el dinero salió del pagador — **no** que deba salir hacia el beneficiario: liberar es una decisión del negocio, con sus condiciones, y no la consecuencia automática de un webhook.
6. **Que la CADENA a firmar sea una función pura, separada del hash.** Devuelve el texto a hashear, y que otro lo hashee. Así se prueba el 90 % del riesgo —el orden de los campos, el sufijo del secreto, el `properties` dinámico, la ruta que no resuelve— con pruebas de tabla y sin criptografía, sin servidor y sin credenciales. Y si una ruta del `properties` no resuelve, **devuelve `null`, nunca cadena vacía**: una firma a medias es una firma inventada que puede llegar a coincidir.

7. **🔴 NO ESCRIBAS EL ESTADO: pide una TRANSICIÓN.** Los eventos llegan **desordenados** y se reintentan hasta 3 veces en 24 h, así que un `PENDING` puede aterrizar DESPUÉS de que el dinero ya salió hacia el beneficiario. Si el webhook asigna el estado que trae el evento, ese mensaje tardío deja la operación en «esperando» — es decir, **borra del sistema que la plata ya se giró**, y nada falla. La salida es que el webhook traduzca el evento a una transición y la aplique con la máquina de estados del dominio: los movimientos imposibles se rechazan solos. Y ese rechazo **no es un error**: es el sistema funcionando, así que se registra y se responde 200 — reintentarlo daría lo mismo tres veces.

8. **⚠️ MARCAR LA CLAVE Y APLICAR EL CAMBIO SON ATÓMICOS, y nunca se marca junto a un error.** Dos reglas que son la misma: (a) si marcas la clave y después falla la escritura, el reintento llega, se ve como duplicado y se descarta — un cobro aprobado que **jamás se acredita, sin un solo error en los logs**; por eso ambas escrituras van en una transacción. (b) Si respondes un código de reintento (500) porque no reconoces la referencia —la operación puede estar creándose en ese mismo instante—, **no marques la clave**: el reintento que iba a salvar el pago llegaría y se descartaría. *Marcar junto a un 500 es la combinación que no puede darse nunca.* Escríbelo como una función (`planCoherente`) y haz que una prueba la recorra sobre **todos** los caminos, no sobre el que se te ocurrió.
