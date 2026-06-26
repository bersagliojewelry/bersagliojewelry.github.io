# 09. Tarjetas (Crédito y Débito)

## Resumen Ejecutivo
El procesamiento de tarjetas requiere tokenización previa por motivos de seguridad y cumplimiento PCI-DSS.

## Flujo Operativo
1. **Tokenización (Frontend):** Se envían PAN, CVC y Expiración en el **cuerpo (body)** de una petición **`POST /tokens/cards`** (HTTPS) usando la `Public Key`. Wompi devuelve un `tok_...`. **Nunca** uses `GET` ni pongas datos de tarjeta en la URL/query string: quedarían registrados en logs de proxies, historial del navegador y access logs del servidor (exposición grave de datos de tarjeta / PCI-DSS).
2. **Cobro (Backend):** El backend recibe el token y crea la transacción con `payment_method.type: "CARD"` y `payment_method.token: "tok_..."` usando la `Private Key`.
3. **Respuesta:** En la mayoría de los casos, la respuesta inicial del POST indicará APPROVED o DECLINED directamente.

## Conceptos Clave
- **Installments (Cuotas):** Obligatorio para tarjetas de crédito en Colombia. Se define en `payment_method.installments`.
- **CVC:** Nunca se guarda. Solo se envía una vez durante la tokenización.

## Errores Comunes
- Intentar enviar el número de la tarjeta directamente al backend y hacer el cobro sin tokenizar (práctica bloqueada y peligrosa).
- No calcular correctamente las cuotas (ej. enviar 0 cuotas).

## Riesgos
Los contracargos. Si el comercio no adjunta el `session_id` del script antifraude, está expuesto a fraudes por tarjeta robada y Wompi no podrá defender el contracargo.

## Qué debe saber hacer el agente
Guiar el flujo de tokenización segura. Explicar por qué el backend jamás debe ver el número real de la tarjeta, sino interactuar exclusivamente con tokens.
