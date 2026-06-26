---
name: wompi-colombia-api-v1
description: Skill maestro para la integración completa de la API v1 de Wompi Colombia. Úsalo cuando necesites implementar pagos en Colombia, Wompi, Bancolombia, o transacciones para tu plataforma (tarjetas, PSE, Nequi, efectivo).
---

# Integración Wompi Colombia API v1

Este documento define la base arquitectónica y los flujos principales para la integración con la API de Wompi, optimizada para procesar pagos de alto valor.

## 1. URLs Base (Entornos)

- **Producción:** `https://production.wompi.co/v1`
- **Sandbox:** `https://sandbox.wompi.co/v1`

## 2. Regla de Oro: Montos y Moneda

Todas las transacciones en Wompi deben manejarse con las siguientes condiciones estrictas:
- **Montos:** Siempre se envían en **centavos** (`amount_in_cents`). Ejemplo: Para cobrar $85,000,000 COP, el valor a enviar es `8500000000`.
- **Moneda:** Siempre usar `"COP"`.
> **Nota de Seguridad:** NUNCA confíes en el monto enviado desde el navegador (frontend). El backend siempre debe reconstruir el precio desde la base de datos (precio + comisión + IVA + descuentos) para evitar manipulación.

## 3. Manejo de Llaves (Autenticación)

- **Llave Pública (`pub_...`):** Se usa exclusivamente en el **Frontend**. Sirve para tokenizar tarjetas de crédito, consultar instituciones financieras de PSE y generar identificadores de sesión de dispositivo.
- **Llave Privada (`prv_...`):** Se usa exclusivamente en el **Backend**. Sirve para crear transacciones (`POST /transactions`), consultar estados y solicitar devoluciones/anulaciones. NUNCA debe exponerse al frontend.

## 4. Firma de Integridad (Creación de Transacción)

Para garantizar que los datos de la transacción no sean alterados antes de llegar a Wompi, se debe enviar un `signature` al crear la transacción.
La firma se genera concatenando la referencia, el monto en centavos, la moneda y el Secreto de Integridad (proporcionado en el Dashboard de Wompi), y aplicando una función hash **SHA-256**.

**Fórmula:**
`SHA-256(Referencia + Monto en Centavos + Moneda + Secreto de Integridad)`

> **Nota (expiración):** Si la transacción usa `expiration_time`, este se concatena **antes** del Secreto de Integridad: `SHA-256(Referencia + Monto + Moneda + ExpirationTime + Secreto)`. El hash es hexadecimal y se genera **solo en el backend**. Esta firma de integridad (creación de transacción / Widget) es **distinta** del checksum de eventos/webhooks, que sí incluye el `timestamp` y usa el `Events Secret`.

### Snippet de Ejemplo (Node.js)
```javascript
const crypto = require('crypto');

function generateIntegritySignature(reference, amountInCents, currency, integritySecret) {
    const concatenatedString = `${reference}${amountInCents}${currency}${integritySecret}`;
    return crypto.createHash('sha256').update(concatenatedString).digest('hex');
}

// Ejemplo de uso:
// generateIntegritySignature('ORDER-001', 8500000000, 'COP', 'test_integrity_xyz123')
```

## 5. Payloads Básicos

### Tarjeta de Crédito (Tokenizada)
Pre-requisito: El frontend debe haber tokenizado la tarjeta para obtener un `token_id`.
```json
{
  "amount_in_cents": 8500000000,
  "currency": "COP",
  "signature": "hash_generado_en_el_backend",
  "customer_email": "cliente@ejemplo.com",
  "payment_method": {
    "type": "CARD",
    "token": "tok_test_12345",
    "installments": 1
  },
  "reference": "ORDER-000451",
  "session_id": "session_id_generado_por_script_antifraude",
  "acceptance_token": "eyJhbGciOi... (de presigned_acceptance)",
  "accept_personal_auth": "eyJhbGciOi... (de presigned_personal_data_auth)"
}
```
> **Seguridad Antifraude:** Para pagos con tarjeta de alto valor, es **crítico** enviar el campo `session_id` generado por el script antifraude de Wompi en el frontend. Sin esto, las transacciones corren altísimo riesgo de ser rechazadas (DECLINED) por sospecha de fraude.

> **Habeas Data (obligatorio):** Cuando se procesan datos personales, el body debe incluir **dos** tokens obtenidos de `GET /merchants/{public_key}`: `acceptance_token` (de `presigned_acceptance.acceptance_token`) y `accept_personal_auth` (de `presigned_personal_data_auth.acceptance_token`). Omitir cualquiera de los dos causa rechazo `422` (Ley 1581 de Colombia).

### Nequi
```json
{
  "amount_in_cents": 15000000,
  "currency": "COP",
  "signature": "hash_generado_en_el_backend",
  "customer_email": "cliente@ejemplo.com",
  "payment_method": {
    "type": "NEQUI",
    "phone_number": "3991112233"
  },
  "reference": "ORDER-000452"
}
```

## 6. Manejo de Devoluciones (Voids/Refunds)
Si una transacción es aprobada pero el vehículo ya fue reservado (choque de inventario):
- **Tarjetas:** Invocar la API de anulaciones de Wompi (Void si es el mismo día antes del corte, Refund si ya hubo corte).
- **PSE / Transferencias:** No soportan reversiones automáticas por API. El sistema debe registrar un "Saldo a favor" en el sistema o requerir intervención manual contable.

---

## 7. Flujos Avanzados

Para implementar lógicas asíncronas complejas, procesamiento de PSE, eventos del sistema y recaudos en efectivo, **DEBES** leer y aplicar las instrucciones detalladas en los siguientes archivos de referencia ubicados en la carpeta `references/`:

- **[Webhooks y Seguridad](./references/webhooks.md)**: Flujo de validación asíncrono, idempotencia y confirmación de inventario digital.
- **[Flujo PSE](./references/pse.md)**: Pagos asíncronos de alto valor, selección de bancos, redirecciones y cronjobs de respaldo.
- **[Pagos en Efectivo](./references/cash_payments.md)**: Recaudos físicos a través de corresponsales bancarios.
- **[Arquitectura y Credenciales](./references/architecture_and_credentials.md)**: Manejo de las 4 credenciales (Public, Private, Events, Integrity) y el rol del Dashboard.
- **[Knowledge Map y Tarjetas](./references/knowledge_map.md)**: Mapa mental y proceso cognitivo del agente de IA, junto con las tarjetas maestras (Wompi, Dashboard, Ambientes).
