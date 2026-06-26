# 15. Integrity Signature

## Resumen Ejecutivo
Para evitar que un usuario malintencionado edite el HTML de una tienda, cambie el precio de un Macbook de $5,000,000 a $500 y ejecute el pago, Wompi requiere la Firma de Integridad.

## ¿Qué es?
Es un hash generado en el backend del comercio que Wompi usará para comparar y asegurar que los datos no mutaron.

## ¿Para qué sirve?
Garantiza la inmutabilidad de variables críticas (`reference`, `amount_in_cents`, `currency`) durante el tránsito a la pasarela.

## Flujo Operativo
1. Backend saca el total a cobrar de su BD segura: `500000000`.
2. Backend lee su `Integrity Secret` (ej. `test_integrity_XYZ`).
3. Concatena: `Referencia + Monto + COP + Secreto`.
4. Calcula SHA-256 (en hex).
5. Adjunta el string resultante en el campo `signature` del JSON de la transacción.
6. Wompi repite el hash en sus servidores; si no cruza, devuelve un error.

## Errores Comunes
- Hacer el hash en el frontend (¡Inútil! Expone el Secreto de Integridad).
- Concatenar con espacios o en el orden incorrecto.

## Edge Cases
Si el comercio maneja expiración de la transacción, el campo `expiration_time` también debe incluirse en la cadena concatenada antes del secreto.

## Qué debe saber hacer el agente
Dar el snippet de código exacto en Node, PHP o Python para hacer el hash SHA-256, recordando siempre limpiar espacios en blanco.
