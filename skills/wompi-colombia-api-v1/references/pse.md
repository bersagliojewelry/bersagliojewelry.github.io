# Flujo de Pagos por PSE

Para operaciones de alto valor adquisitivo, las tarjetas de crédito suelen ser rechazadas por topes bancarios o controles antifraude. PSE se convierte en el canal principal. Sin embargo, PSE es un flujo asíncrono y requiere pasos adicionales.

## 1. El Flujo de Dos Pasos de PSE

La integración de PSE requiere interactuar con el backend y frontend en dos momentos diferentes.

### Paso 1: Obtener Instituciones Financieras (Bancos)
Para mostrarle al usuario la lista de bancos disponibles, se debe consultar a Wompi. Esta consulta la puede hacer el frontend directamente.
- **Endpoint:** `GET /pse/financial_institutions`
- **Autenticación:** Llave Pública (Bearer o en Headers según configuración, típicamente `Authorization: Bearer pub_...`).
- **Resultado:** Renderizar un selector (dropdown) en el UI para que el cliente elija su banco.

### Paso 2: Creación de la Transacción
Una vez el usuario selecciona su banco y tipo de cliente, el backend inicia la transacción.
- **Endpoint:** `POST /transactions`
- **Autenticación:** Llave Privada.

**Payload Requerido:**
```json
{
  "amount_in_cents": 8500000000,
  "currency": "COP",
  "signature": "hash_generado_en_el_backend",
  "customer_email": "cliente@ejemplo.com",
  "payment_method": {
    "type": "PSE",
    "user_type": 0, 
    "user_legal_id_type": "CC",
    "user_legal_id": "1000111222",
    "financial_institution_code": "1022",
    "payment_description": "Pago orden ORDER-000453"
  },
  "reference": "ORDER-000453"
}
```
**Campos Clave PSE:**
- `user_type`: `0` para Persona Natural, `1` para Persona Jurídica.
- `user_legal_id_type`: Tipo de documento. Valores válidos para PSE: `CC` (Cédula de Ciudadanía), `CE` (Cédula de Extranjería) y `NIT` (Persona Jurídica, junto con `user_type: 1`).
- `user_legal_id`: Número de documento.
- `financial_institution_code`: El código del banco obtenido en el Paso 1.
- `payment_description`: Descripción del pago. **REQUERIDO**, máximo 64 caracteres. Si falta, Wompi responde `422`.
- (Opcionales antifraude) `reference_one` (IP del cliente), `reference_two` (fecha apertura producto yyyymmdd), `reference_three` (documento del beneficiario).

## 2. Redirección y Asincronía

- Al enviar el POST, la transacción quedará inicialmente en estado `PENDING`.
- ⚠️ La URL de redirección **NO está garantizada** en la respuesta inicial del POST. Debes consultar `GET /v1/transactions/{id}` (llave privada) mediante un *long polling* corto (p. ej. cada 1–3 s, timeout ~10–15 s) hasta que `data.payment_method.extra.async_payment_url` esté poblado.
- **Acción Obligatoria:** Solo cuando `async_payment_url` aparezca, redirige al cliente a esa URL para completar el pago en el portal de su banco (Pasarela ACH). Este *polling* de redirección es **distinto** del cronjob de resiliencia de 5 minutos de la sección 3.

## 3. Respaldo (Cronjobs y Polling)

- Las sesiones bancarias de PSE pueden tomar hasta 30 minutos.
- Si el cliente abandona el proceso, se le cae el internet, o el Webhook de Wompi sufre una demora/falla en la entrega, el sistema podría quedarse con un pedido bloqueado en un **estado local interno de tu base de datos** (p. ej. `PAYMENT_IN_PROGRESS` — **no** es un status de Wompi). Recuerda: los únicos valores de `transaction.status` en Wompi son `PENDING`, `APPROVED`, `DECLINED`, `VOIDED`, `ERROR`.
- **Arquitectura Resiliente:** Se DEBE implementar un **Cronjob de respaldo** que se ejecute cada 5 minutos. Este job consultará activamente el estado de las transacciones antiguas en estado `PENDING` haciendo un `GET /transactions/{id}` a Wompi con la llave privada, garantizando que tarde o temprano se actualice la base de datos aunque el Webhook falle.
