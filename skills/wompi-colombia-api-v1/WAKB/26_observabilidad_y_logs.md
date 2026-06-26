# 26. Observabilidad y Logs

## Resumen Ejecutivo
Sin un buen trazado (tracing), resolver disputas financieras es imposible. En pagos de alto valor como vehículos, perder un log es perder millones.

## Buenas Prácticas de Logueo
- **Request/Response Log:** Guarda TODOS los payloads enviados a Wompi y recibidos. Enmascara (***) datos como correos por protección de datos.
- **Webhook Log Table:** Crea una tabla SQL `wompi_webhooks_audit` que guarde raw json, firmas, ips y el HTTP Status que tu servidor le devolvió a Wompi.
- **Correlación:** Relaciona el `reference` interno tuyo con el `transaction.id` de Wompi desde el minuto 0 en los logs.

## Diagnóstico Proactivo
Si el agente tiene acceso al backend, debe auditar si existe una capa de logs estructurados (Datadog, CloudWatch o ELK) alrededor de los llamadas a `/transactions`.
