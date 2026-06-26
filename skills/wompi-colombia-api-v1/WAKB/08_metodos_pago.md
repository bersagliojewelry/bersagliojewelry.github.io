# 08. Métodos de Pago

## Resumen Ejecutivo
Wompi abstiene la complejidad de múltiples redes transaccionales detrás de un único atributo en el JSON de transacciones: `payment_method.type`.

## ¿Qué es?
Representa el canal mediante el cual los fondos se descontarán del cliente.

## ¿Para qué sirve?
Permite al comercio aceptar distintos canales (Tarjetas, PSE, Nequi, Bancolombia, Corresponsales) sin reescribir su arquitectura de pagos. Solo cambia el bloque `payment_method` en el request.

## Conceptos Clave
- **Tipos soportados:** `CARD`, `PSE`, `NEQUI`, `BANCOLOMBIA`, `BANCOLOMBIA_COLLECT`, `BANCOLOMBIA_TRANSFER`.
- **Ecosistema síncrono vs asíncrono:** Tarjetas es (generalmente) síncrono. PSE y Efectivo son asíncronos por diseño.

## Errores Comunes
- Enviar propiedades de tarjeta dentro de un bloque tipo PSE.
- No activar el método de pago en el Dashboard de Wompi, causando un error 403 o 422 al intentar cobrar.

## Diagnóstico
Si un tipo de pago falla recurrentemente con un error de autorización de la plataforma, el agente debe recomendar verificar si el método está "Activo" en la sección de métodos de pago del Dashboard.

## Qué debe saber hacer el agente
Estructurar el objeto `payment_method` correctamente para cada tipo de pago existente en la documentación oficial de Wompi Colombia.
