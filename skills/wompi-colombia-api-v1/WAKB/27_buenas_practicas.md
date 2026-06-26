# 27. Buenas Prácticas 

## Resumen Ejecutivo
Para pasar a producción, el agente de IA auditará que se cumplan estas 5 reglas de oro.

1. **Secretos Seguros:** `.env` validado, nada hardcodeado.
2. **Validación de Integridad (Idempotencia):** Base de datos con lock/constraint única para el `transaction_id`.
3. **Webhook Seguro:** `Events Secret` validando SHA-256 correctamente y devolviendo 200 rápido.
4. **Rescate Automático (Cronjob):** Mecanismo de polling para transacciones PENDING en PSE que nunca llegaron al webhook.
5. **Cero Trust Frontend:** El cliente paga $5M. El JS dice $5M. Wompi te manda webhook de $5M. El backend revisa: "¿El carro en BD valía $5M? SÍ -> Aprobar. NO -> Fraude, Rechazar."
