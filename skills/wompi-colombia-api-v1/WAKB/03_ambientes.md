# 03. Ambientes (Sandbox y Producción)

## Resumen Ejecutivo
Wompi dispone de dos mundos paralelos y 100% aislados: Sandbox (pruebas) y Producción (real). La regla de oro es no cruzar jamás llaves, urls, o webhooks entre ambos.

## ¿Qué es?
- **Sandbox:** Entorno para pruebas de integración con tarjetas de prueba y simulaciones de error. Todas las llaves empiezan con `_test_`.
- **Producción:** Entorno que mueve dinero real, interconectado con ACH y redes de tarjetas. Las llaves empiezan con `_prod_`.

## ¿Para qué sirve?
Para que los desarrolladores rompan la integración, prueben edge cases, webhooks y fallos sin mover dinero ni generar contracargos reales.

## Configuración
- La URL de la API cambia: `sandbox.wompi.co/v1` vs `production.wompi.co/v1`.
- Los Webhooks apuntan a URLs distintas según el entorno (ej. `api-staging.com/webhooks` vs `api.com/webhooks`).

## Errores Comunes
- **Mix de llaves:** Usar `prv_test_` en la URL de `production.wompi.co`. Devuelve 401 Unauthorized.
- Probar flujos funcionales pesados directamente en Producción y solicitar reembolsos continuos (alerta de fraude).

## Diagnóstico y Solución
Ante un "Error 401", lo primero que el agente evalúa es el prefijo de la llave versus la URL base utilizada. Si no concuerdan, esa es la solución inmediata.

## Riesgos
Cruzar ambientes puede ocasionar que pruebas automatizadas realicen cobros reales a tarjetas corporativas, o que se simulen pagos que aprueben pedidos de alto valor sin haber recibido dinero.

## Qué debe saber hacer el agente
Detectar automáticamente conflictos de ambientes revisando prefijos de llaves, e instruir al desarrollador en el uso de variables de entorno `.env` para gestionar la transición.
