---
name: wompi-api-core
description: Activar cuando el usuario quiera crear, leer, o gestionar transacciones, fuentes de pago o tokens de tarjetas en Wompi Colombia.
---

# Skill: Wompi API Core
Este skill faculta al Agente de IA para operar el núcleo transaccional de Wompi Colombia.

## Reglas de Implementación
1. **Tokens primero:** Nunca aceptes procesar números de tarjetas en crudo. Todo debe pasar por la API de tokenización usando `pub_`.
2. **Ambiente:** Verifica que la URL base coincida con el prefijo de la llave.
   - `https://sandbox.wompi.co/v1` -> llaves `_test_`
   - `https://production.wompi.co/v1` -> llaves `_prod_`
3. **Monto en Centavos:** Multiplica siempre el valor en COP por 100 antes de enviarlo en `amount_in_cents`.

## Capacidad Principal
Si el usuario dice "Crea una transacción", guíalo paso a paso verificando que tenga: la **referencia única**; la **firma de integridad** generada en el backend (`SHA256(reference + amount_in_cents + currency + [expiration_time] + IntegritySecret)`, en hexadecimal); **ambos** tokens de aceptación (`acceptance_token` y `accept_personal_auth`) obtenidos de `GET /merchants/{public_key}` cuando hay datos personales (Habeas Data); y el objeto `payment_method` correcto y completo. Para **PSE** recuerda que `payment_description` (máx. 64 caracteres) es **obligatorio** (sin él: `422`), y que la `async_payment_url` se obtiene por *polling* de `GET /transactions/{id}`, no de la respuesta de creación.
