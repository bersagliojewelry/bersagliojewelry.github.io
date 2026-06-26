# 23. QA y Testing

## Resumen Ejecutivo
Las pruebas manuales dando click en "Pagar" no son suficientes. 

## Escenarios Obligatorios
- **Test de Timeout:** Desconectar el internet a mitad de un pago PSE y verificar que el cronjob rescata el estado.
- **Test de Doble Gasto:** Mandar el mismo Webhook de Wompi repetido 5 veces con Postman. ¿Se crearon 5 ventas en la base de datos o funcionó la Idempotencia?
- **Test de Firma Falsa:** Modificar 1 letra del `signature.checksum` del Webhook y probar. **Resultado esperado:** el backend recalcula `SHA256(valores de signature.properties + timestamp del evento + EventsSecret)`, detecta que **no** coincide (ni con `signature.checksum` ni con el header `X-Event-Checksum`), **no** procesa ni persiste el evento, registra una alerta de seguridad y responde `HTTP 200` para que Wompi no reintente un evento falsificado. **Nunca** debe hacer crash (un solo POST malformado sería un vector de DoS) ni devolver 4xx.

## Tarjetas de Sandbox
Wompi provee números de tarjetas específicos (`4242...`) con CVCs específicos para simular aprobaciones, rechazos por fondos y bloqueos de riesgo. ¡Úsalos!
