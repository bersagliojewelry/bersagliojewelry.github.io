# 19. Reportes y Conciliación

## Resumen Ejecutivo
A nivel financiero, la API transaccional no es suficiente. El equipo contable necesita entender qué transacciones se pagaron y cuánto cobró Wompi de comisión.

## ¿Qué es?
La descarga de consolidados (CSV, formatos Asobancaria) que cruzan ventas vs depósitos bancarios.

## Conceptos Clave
- **Conciliación:** El proceso de emparejar las órdenes de tu BD con el dinero real que entró al banco.
- **Liquidación (Payout):** El momento en que Wompi transfiere el saldo de las ventas a la cuenta de ahorros/corriente del comercio.

## Flujo Operativo
Se pueden generar reportes desde el Dashboard o consultar por API (si aplica el producto). Cruza usando el campo `reference` que el comercio envió inicialmente.

## Errores Comunes
- Mandar referencias aleatorias (UUIDs sin sentido) que hacen imposible que contabilidad sepa a qué pedido de Magento/Shopify corresponde el dinero.
- Ignorar que las comisiones e IVA se descuentan antes del payout.

## Qué debe saber hacer el agente
Advertir siempre al desarrollador que el campo `reference` no es solo técnico, sino que es el ancla financiera para toda la compañía.
