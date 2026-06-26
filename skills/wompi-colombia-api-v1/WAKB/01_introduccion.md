# 01. Introducción a Wompi

## Resumen Ejecutivo
Wompi es la pasarela de pagos desarrollada por Bancolombia, diseñada para abstraer la complejidad de integrar múltiples medios de pago (Tarjetas, PSE, Nequi, Corresponsales) en una única API REST. Actúa como el intermediario entre el ecosistema financiero y el comercio.

## ¿Qué es?
Es una plataforma tecnológica (Payment Service Provider - PSP) que procesa pagos electrónicos. Expone una API moderna orientada a recursos, además de herramientas no-code/low-code como Links de Pago, Widget y Web Checkout.

## ¿Para qué sirve?
Sirve para autorizar, capturar, revertir y conciliar pagos digitales. Permite a negocios de cualquier tamaño aceptar dinero de forma segura, reduciendo la carga de certificación PCI-DSS (gracias a la tokenización) y centralizando la recepción de fondos.

## Conceptos Clave
- **Comercio (Merchant):** Entidad que recibe el pago.
- **Transacción:** Intento de mover fondos de una entidad financiera a Wompi.
- **Fuente de Pago (Payment Source):** Representación tokenizada de un medio de pago (ej. una tarjeta guardada).
- **Token:** Cadena segura que reemplaza datos sensibles (PAN de la tarjeta).

## Flujo Operativo
1. Cliente selecciona pagar.
2. Frontend tokeniza los datos (si es tarjeta) usando la Public Key.
3. Backend recibe el token, calcula la firma de integridad (Integrity Secret) y envía `POST /transactions` (Private Key).
4. Wompi responde el estado (APPROVED, DECLINED, PENDING).
5. (Asíncrono) Wompi envía Webhook validado con el Events Secret.

## Errores Comunes
- Creer que Wompi es solo para tarjetas.
- Intentar integrar sin leer el esquema de llaves (Public, Private, Events, Integrity).
- No implementar manejo asíncrono para PSE o Efectivo.

## Diagnóstico y Solución
Si el agente detecta confusión básica sobre Wompi, debe aclarar de inmediato la diferencia entre API, Widget y Web Checkout, orientando al usuario hacia la integración que mejor se adapte a su infraestructura.

## Qué debe saber hacer el agente
Debe poder explicar qué es Wompi a niveles ejecutivos y técnicos, recomendar el modelo de integración ideal y mapear los requerimientos de negocio con las capacidades de la plataforma.
