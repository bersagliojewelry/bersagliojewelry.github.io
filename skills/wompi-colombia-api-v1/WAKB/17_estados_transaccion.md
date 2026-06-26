# 17. Estados de Transacción

## Resumen Ejecutivo
Cada transacción en Wompi tiene un ciclo de vida regido por una máquina de estados finita. 

## Estados Clave
- **PENDING:** El pago fue creado pero Wompi espera respuesta de la red (muy común en PSE o Efectivo).
- **APPROVED:** El dinero fue descontado. Venta exitosa.
- **DECLINED:** El pago fue rechazado (fondos, fraude, error de banco).
- **ERROR:** Fallo técnico interno de la red.
- **VOIDED:** Una transacción (de tarjeta) que ya había sido **APROBADA** fue anulada/reversada mediante la operación de void (`POST /v1/transactions/{id}/void`), antes de que el dinero se desembolsara al comercio. Es la reversión de una autorización/captura aprobada, **no** la cancelación de una transacción que nunca llegó a `APPROVED`.

## ¿Para qué sirve?
Dicta la lógica de la aplicación del comercio. 
- PENDING = Reserva el inventario por 30 mins.
- APPROVED = Libera el producto.
- DECLINED = Libera el inventario de nuevo a la tienda.

## Errores Comunes
- Bloquear la base de datos de por vida si el estado es PENDING.
- Mostrar "Pago fallido" en un estado PENDING solo porque tardó 5 segundos.

## Diagnóstico
Para saber por qué algo quedó DECLINED, el agente debe buscar el `status_message` en el JSON de respuesta.

## Qué debe saber hacer el agente
Mapear estos estados a la lógica de negocio del comercio e implementar cronjobs para lidiar con estados PENDING "huérfanos".
