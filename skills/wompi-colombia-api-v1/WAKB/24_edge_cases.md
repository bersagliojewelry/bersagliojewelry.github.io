# 24. Edge Cases

## Resumen Ejecutivo
Situaciones raras pero críticas en finanzas donde el 99% de las integraciones fallan.

## El Webhook Fantasma
El cliente paga, el banco descuenta, pero el internet de Wompi hacia el comercio falla. El cliente no recibe el producto. 
**Mitigación:** Job de polling cada 5 min con `GET /transactions/{id}` para órdenes viejas `PENDING`, sondeando hasta un estado terminal (`APPROVED`, `DECLINED`, `VOIDED`, `ERROR`); `PENDING` es normal en PSE/Nequi hasta que el usuario completa el pago. **CRÍTICO:** el webhook y este poller transicionan la **misma** orden, así que la fulfillment (despacho, liberación de inventario) debe ejecutarse **exactamente una vez** mediante una transición atómica e idempotente — p. ej. `UPDATE ordenes SET estado='APPROVED' WHERE id=? AND estado='PENDING'` y disparar efectos secundarios solo si la actualización afectó 1 fila. Sin esa guarda, un webhook tardío (Wompi reintenta hasta 3 veces en 24 h) y el poller pueden **doble-despachar** la misma orden.

## Alteración en el Frontend
El usuario edita el monto en la consola Chrome (de $90M a $9,000) y le da pagar.
**Mitigación:** Integrity Signature hecha siempre desde los montos de la Base de Datos segura en Backend.

## La Redirección Engañosa
El cliente copia la URL de "Pago Exitoso" y la abre 10 veces en incognito para estafar.
**Mitigación:** Las páginas de éxito JAMÁS liberan inventario. Solo renderizan "Gracias", el inventario lo libera el Webhook autenticado.
