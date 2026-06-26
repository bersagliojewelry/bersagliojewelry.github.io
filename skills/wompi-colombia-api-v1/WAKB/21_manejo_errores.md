# 21. Manejo de Errores HTTP

## Resumen Ejecutivo
Una integración madura no asume "200 OK" siempre. Wompi sigue estándares RESTful rigurosos.

## Códigos Clave
- **401 Unauthorized:** Llave inválida o usando ambiente cruzado (Test en Prod).
- **404 Not Found:** La transacción o recurso no existe.
- **422 Unprocessable Entity:** Payload mal formado o validación fallida (`type: INPUT_VALIDATION_ERROR`): faltan o son inválidos campos (ej. no mandaste `signature`, falta `payment_description` en PSE, `payment_method.type` no habilitado para tu comercio), o el Acceptance Token expiró. El detalle viene en `error.messages`.
- **5XX:** Wompi o ACH están caídos. Usa lógica de Retry con backoff exponencial.

> **Importante:** Wompi documenta únicamente los códigos **401, 404 y 422**. **No** existe un `400 Bad Request` ni un `403 Forbidden` en su contrato; los errores de validación son `422`.
>
> **Rechazo de Antifraude:** **NO es un error HTTP.** La petición responde exitosamente (`HTTP 200/201`) y la transacción se crea con `status: DECLINED`; el motivo viene en `status_message`. Es un resultado de negocio — manéjalo leyendo el `status` de la transacción, no el código HTTP.

## Diagnóstico del Agente
Nunca decir "Fallo la API" genéricamente. El agente siempre debe pedir el Body del error. Para errores 422 de validación, `error.type` es `"INPUT_VALIDATION_ERROR"` y `error.messages` es un objeto cuyas claves son nombres de campo y cuyos valores son **arreglos** de mensajes. Ejemplo:

```json
{
  "error": {
    "type": "INPUT_VALIDATION_ERROR",
    "messages": {
      "amount_in_cents": ["El monto debe ser un entero positivo."]
    }
  }
}
```

El agente debe leer `error.messages[<campo>][0]` (primer elemento del arreglo), no tratar `error.messages.<campo>` como un string escalar.
