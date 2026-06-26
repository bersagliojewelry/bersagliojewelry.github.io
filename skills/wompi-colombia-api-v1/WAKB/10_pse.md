# 10. PSE (Pagos Seguros en Línea)

## Resumen Ejecutivo
PSE es la red interbancaria de Colombia. A diferencia de las tarjetas, requiere redirección del usuario y confirmación asíncrona (webhooks).

## Flujo Operativo
1. **Selección de Banco:** `GET /v1/pse/financial_institutions`, autenticado con la **Public Key** (llave pública, **no** la privada). La respuesta devuelve el `financial_institution_code` de cada banco, que luego se envía en `payment_method.financial_institution_code`.
2. **Creación:** `POST /transactions` con un objeto `payment_method` que incluye (**todos requeridos**): `type: "PSE"`; `user_type` (`0` = persona natural, `1` = persona jurídica); `user_legal_id_type` (`CC`, `CE` o `NIT`); `user_legal_id` (número de documento); `financial_institution_code` (banco del paso 1); y `payment_description` (descripción del pago, **máx. 64 caracteres**). **Omitir `payment_description` hace que Wompi rechace la transacción (422).** Campos antifraude opcionales: `reference_one` (IP del cliente), `reference_two` (fecha apertura yyyymmdd), `reference_three` (documento del beneficiario). A nivel de transacción recuerda también `customer_email`, `acceptance_token` y `accept_personal_auth`.
3. **Redirección:** Wompi responde inicialmente con estado `PENDING`, pero la URL de redirección **NO** viene en la respuesta de creación. Debes consultar `GET /v1/transactions/{id}` (long polling, p. ej. cada 1–3 s con timeout ~10–15 s) hasta que el campo `payment_method.extra.async_payment_url` esté presente. Solo entonces el frontend redirige al usuario a esa URL (portal del banco / pasarela ACH).
4. **Confirmación:** ACH procesa el pago. Wompi envía el Webhook al comercio con APPROVED o DECLINED.

## Errores Comunes
- Creer que porque el navegador volvió a la `redirect_url` del comercio, el pago está aprobado. ¡FALSO! Solo el webhook o un GET a la API dictan la verdad.
- No contemplar que un usuario puede cerrar el navegador en el banco, dejando la transacción PENDING hasta que Wompi la expira.

## Edge Cases
- El banco aprueba el pago, pero hay micro-cortes y el webhook se demora 20 minutos. Solución: Cronjob de polling cada 5 mins sobre las transacciones PENDING.

## Qué debe saber hacer el agente
Escribir arquitecturas resilientes para pagos asíncronos. Jamás aconsejar liberar inventario sin validación de Webhook.
