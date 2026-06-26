# Webhooks (Eventos Asíncronos)

Wompi utiliza un sistema de Webhooks para notificar de forma asíncrona a nuestro servidor sobre los cambios de estado en las transacciones. Dado que un ecommerce o app procesa flujos fuera del navegador, **la validación de este Webhook es el único mecanismo confiable y autorizado para confirmar una venta.**

## 1. Estructura del Evento

Wompi enviará peticiones `POST` a nuestra Event URL. El payload principal viene dentro de `data.transaction`.

Ejemplo de payload oficial (Mock compatible):
```json
{
  "event": "transaction.updated",
  "data": {
    "transaction": {
      "id": "1234-1718209999-92831",
      "status": "APPROVED",
      "status_message": "La transacción ha sido aprobada",
      "reference": "ORDER-000451",
      "amount_in_cents": 8500000000,
      "currency": "COP",
      "payment_method_type": "PSE",
      "payment_method": {
        "type": "PSE",
        "user_type": 0,
        "financial_institution_code": "1022"
      },
      "created_at": "2026-06-26T15:30:14.000Z",
      "finalized_at": "2026-06-26T15:31:28.000Z"
    }
  },
  "timestamp": 1782487888,
  "signature": {
    "properties": [
      "transaction.id",
      "transaction.status",
      "transaction.amount_in_cents"
    ],
    "checksum": "d8f9a87c4efdf6c44b0aab4c57fbb1fd7df4d0d3a17d9ef8ce5f13b0a7b90f20"
  }
}
```

## 2. Validación de la Firma Criptográfica (Event Signature)

Para prevenir ataques donde un tercero falsifique un Webhook para liberar un vehículo de alto valor sin pagar, **DEBEMOS validar criptográficamente la firma del evento**. 

> **Atención:** Esta firma es DIFERENTE a la Firma de Integridad usada para crear el pago. Aquí se usa el **Secreto de Eventos (Event Secret)** proporcionado en el dashboard.

El checksum llega en el header HTTP `X-Event-Checksum` y **también** dentro del payload en `signature.checksum` (son idénticos). La validación en Wompi v1 utiliza las propiedades indicadas en el arreglo `signature.properties`. (Nota: `x-signature` es de **otras** pasarelas como Stripe; Wompi Colombia **no** usa ese header.)

**Fórmula de Validación (exacta y verificada contra docs.wompi.co):**

`checksum = SHA256( CONCAT( valores de signature.properties EN ORDEN  +  timestamp de nivel superior (entero UNIX — SIEMPRE OBLIGATORIO)  +  Events Secret AL FINAL ) )`, en hexadecimal, comparado contra `signature.checksum` (case-insensitive).

1. Extrae los valores de cada path en `signature.properties`, en orden (p. ej. `transaction.id`, `transaction.status`, `transaction.amount_in_cents`).
2. Concaténalos como strings planos, **sin separadores**.
3. Anexa el `timestamp` de nivel superior (entero UNIX). **Es obligatorio, nunca opcional.**
4. Anexa **al final** el `Events Secret` del dashboard (secret-suffix).
5. Calcula SHA-256 sobre la cadena y compárala (case-insensitive) contra `signature.checksum` (o el header `X-Event-Checksum`).

> ⚠️ **NO es HMAC** ni criptografía asimétrica: es un SHA-256 con el secreto concatenado al final. En Node usa `crypto.createHash('sha256').update(valores + timestamp + eventSecret).digest('hex')`, **NO** `crypto.createHmac('sha256', eventSecret)`.

Ejemplo verificado (docs oficiales):
```
concatenado = "1234-1610641025-49201" + "APPROVED" + "4490000" + "1530291411" + "prod_events_XXXX"
SHA256(concatenado) = 3476DDA50F64CD7CBD160689640506FEBEA93239BC524FC0469B2C68A3CC8BD0
```

Si la firma NO hace match, el evento debe registrarse con estado `ERROR_SIGNATURE`, lanzar una alerta crítica al equipo de soporte y **detener el flujo inmediatamente (retornar 422 o 400)**.

## 3. Reglas de Negocio (Edge Cases y Arquitectura)

### Regla 1: Desacoplamiento del Frontend
- NUNCA liberar inventario ni confirmar ventas basándose en retornos del frontend (URLs de éxito). El cliente puede modificar parámetros o la conexión puede fallar.
- **La liberación de inventario digital o confirmación de reserva vehicular SOLO debe hacerse tras recibir y validar exitosamente el estado `APPROVED` a través de este Webhook validado criptográficamente.**

### Regla 2: Idempotencia (At-Least-Once Delivery)
- Wompi puede enviar el mismo Webhook varias veces. Mientras tu endpoint no responda `HTTP 200` (por timeout o cualquier respuesta != 200), Wompi reintentará la notificación un **máximo de 3 veces** distribuidas en las siguientes 24 h (aprox. a los 30 min, 3 h y 24 h), tras lo cual **deja de reintentar**. La reentrega **NO es infinita**: un job de respaldo que consulte `GET /transactions/{id}` es **obligatorio** (no opcional) para reconciliar eventos perdidos.
- Antes de procesar el evento, se debe verificar en base de datos si el `transaction.id` o `event.id` ya fue procesado. 
- Si ya fue procesado, responder inmediatamente con un `HTTP 200` y NO ejecutar ninguna acción (para evitar duplicación de facturas o reservas).

### Regla 3: Manejo de Concurrencia (Venta Doble)
- Si dos usuarios intentan pagar el mismo vehículo a la vez, el inventario no se bloquea permanentemente con la intención de pago.
- Se debe usar un bloqueo optimista (`SELECT ... FOR UPDATE` o versionado de filas) en la base de datos al momento en que el Webhook procesa el `APPROVED`. Si el vehículo ya fue vendido, registrar saldo a favor y notificar.
