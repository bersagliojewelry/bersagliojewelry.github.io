# 06. API REST

## Resumen Ejecutivo
Wompi expone una API RESTful estándar para desarrolladores. Utiliza JSON como formato de intercambio, códigos HTTP convencionales, y una autenticación basada en encabezados Bearer Token (Llave Privada).

## ¿Qué es?
Es la puerta de entrada programática para la pasarela de pagos. Expone recursos como `/transactions`, `/merchants`, `/payment_sources`, y `/tokens`.

## ¿Para qué sirve?
Permite construir flujos de pago nativos 100% integrados en el ecosistema del comercio, con control total del frontend y la experiencia de usuario (UX).

## Conceptos Clave
- **Base URL:** `https://production.wompi.co/v1` o `https://sandbox.wompi.co/v1`.
- **Headers Requeridos:** `Authorization: Bearer <PRV_KEY>` (salvo endpoints públicos).
- **Formatos:** Peticiones y respuestas SIEMPRE en `application/json`.
- **Paginación:** La API utiliza meta tags en las respuestas (ej. `meta.next_url`) para navegar listas.

## Errores Comunes
- Omitir el encabezado `Authorization`.
- Enviar montos como decimales (`85000.50`) en lugar de centavos (`8500050`).
- Ignorar los códigos HTTP (ej. interpretar un 422 como un error de servidor en lugar de un error de validación de campos).

## Diagnóstico
Para depurar un error de API, el agente debe siempre pedir: el Endpoint atacado, el JSON de Request, y el JSON de Response (incluyendo el código HTTP).

## Qué debe saber hacer el agente
Interpretar cualquier payload JSON de Wompi, estructurar cURL commands para pruebas, y mapear un código HTTP al problema específico.
