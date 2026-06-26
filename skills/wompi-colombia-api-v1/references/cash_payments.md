# Pagos en Efectivo (Recaudo)

Wompi permite generar códigos de recaudo para que los clientes paguen físicamente en efectivo a través de corresponsales bancarios y puntos de pago (como Corresponsales Bancolombia, Efecty, etc.).

## 1. Creación de la Transacción

El flujo inicial es similar a los demás medios de pago, pero el tipo de método de pago cambia.

- **Endpoint:** `POST /transactions`
- **Autenticación:** Llave Privada en el backend.

**Payload Requerido:**
```json
{
  "amount_in_cents": 500000000,
  "currency": "COP",
  "signature": "hash_generado_en_el_backend",
  "customer_email": "cliente@ejemplo.com",
  "payment_method": {
    "type": "BANCOLOMBIA_COLLECT" 
  },
  "reference": "ORDER-000454"
}
```
*Nota: Reemplazar `"BANCOLOMBIA_COLLECT"` por otros tipos de redes de recaudo si aplican (ej. `"EFECTY"`), según la disponibilidad en el dashboard de Wompi.*

## 2. Naturaleza Asíncrona

Al crear la transacción:
1. El estado inicial será `PENDING`.
2. La respuesta de la API entregará información en `data.payment_method.extra`, la cual típicamente incluirá detalles como el **Código de Convenio**, **Referencia de Pago** o un código de barras.
3. El frontend debe mostrar esta información (o enviarla por correo/SMS) al cliente indicándole las instrucciones para dirigirse a un punto físico y realizar el depósito.
4. **Vencimiento:** Estos códigos tienen una fecha/hora de expiración.

## 3. Confirmación de Pago

La confirmación del pago en efectivo es **completamente asíncrona** y dependiente del tiempo que tarde el cliente en ir al establecimiento y que la red procese el pago.

- El sistema no debe confirmar ninguna operación ni liberar el inventario solo con generar el código.
- Se debe esperar obligatoriamente el **Webhook `transaction.updated`** con el estado `APPROVED`.
- Aplican exactamente las mismas reglas de validación criptográfica, idempotencia y confirmación de inventario descritas en la sección de **Webhooks**.
