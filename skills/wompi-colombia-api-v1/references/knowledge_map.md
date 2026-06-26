# Wompi AI Agent Knowledge Map v1.0

Este documento define la estructura de conocimiento y las "Tarjetas" (Knowledge Cards) maestras que el Agente de IA debe dominar para brindar soporte experto en la integración de Wompi Colombia.

## Estructura del Conocimiento (5 Niveles)

- **NIVEL 1 (Dominio Principal):** WOMPI (Empresa, Productos, Dashboard, API, Seguridad, Integraciones, Operación, QA, Arquitectura, Soporte, DevOps, Riesgos).
- **NIVEL 2 (Subdominios):** Entendimiento profundo de Tarjetas, PSE, Nequi, Llaves, Roles, Arquitectura REST, Seguridad, patrones de arquitectura, resolución de códigos de error HTTP, y DevOps (observabilidad, idempotencia, circuit breaker, etc.).
- **NIVEL 3 (Ramas):** Desglose de cada subdominio (Ej. API -> Merchant, Acceptance Token, Transactions, Webhooks, Rate Limits, etc.).
- **NIVEL 4 (Habilidades):** Capacidades del agente (Explicar, configurar, validar, probar, diagnosticar, depurar, documentar, interpretar, recomendar).
- **NIVEL 5 (Inteligencia / Resolución):** Proceso cognitivo estructurado ante problemas: **Clasificar -> Tipo -> Problema -> Nivel -> Prioridad -> Playbook -> Checklist -> Diagnóstico**. (Ej. *No responde inmediatamente a "No llegan Webhooks", sino que clasifica y sigue el playbook*).

---

## TARJETA 001: Wompi

### 1. Resumen y Flujo
Wompi es una pasarela de pagos de Bancolombia que procesa pagos electrónicos (tarjetas, PSE, Nequi, efectivo). 
**Flujo:** Cliente -> Frontend -> Backend -> API Wompi -> Entidad financiera -> Resultado -> Webhook -> Actualización en BD.

### 2. Conceptos Clave
Comercio (Merchant), Transacción, Fuente de pago (Payment Source), Token, Checkout, Widget, API REST, Webhook, Acceptance Token, Integrity Signature, Public Key, Private Key, Sandbox, Producción.

### 3. Errores Comunes y Riesgos
- Usar credenciales de Sandbox en Producción (o viceversa).
- Exponer la Private Key en el frontend.
- No validar la firma de integridad ni la autenticidad de los webhooks.
- Asumir que una respuesta HTTP exitosa significa que el pago ya fue aprobado.
- No manejar estados pendientes ni implementar idempotencia.

### 4. Buenas Prácticas
Mantener ambientes separados, implementar idempotencia, registrar logs con identificadores de correlación, validar firmas y eventos asíncronos. NUNCA confiar únicamente en el frontend para confirmar un pago.

---

## TARJETA 002: Dashboard de Wompi

### 1. Resumen Ejecutivo
Centro de administración web. **No procesa pagos por sí mismo**, actúa como la consola de gestión de la plataforma. Configura la operación, pero no reemplaza a la API.

### 2. Módulos Principales
- **Inicio / Transacciones / Reportes:** Monitoreo y conciliación.
- **Credenciales:** Obtención de Public Key, Private Key, Integrity Secret, Event Secret.
- **Webhooks:** Configuración de la URL de eventos.
- **Configuración / Usuarios:** Parámetros del negocio y administración de accesos.

### 3. Errores Comunes y Diagnóstico
- Configurar URL de webhook equivocada o eliminar credenciales activas.
- Mezclar credenciales de Sandbox y Producción.
- Ante un error, el agente debe preguntar: ¿Qué ambiente usa? ¿Qué módulo? ¿Afecta a la API o solo al Dashboard?

---

## TARJETA 003: Ambientes (Sandbox y Producción)

### 1. Resumen Ejecutivo
Dos ambientes 100% independientes. Sandbox para pruebas (dinero ficticio), Producción para operación real (dinero real).

### 2. Independencia Estricta
Cada ambiente tiene su propio conjunto de: credenciales, webhooks, configuraciones, y datos. **No se comparten recursos.**

### 3. Errores Comunes
- Usar Public Key de Sandbox con Private Key de Producción.
- Apuntar el Webhook de Producción a un servidor de pruebas local.
- Realizar pruebas funcionales con dinero real directamente en Producción.

### 4. Solución y Buenas Prácticas
Usar variables de entorno para automatizar el cambio de configuración. Validar siempre autenticación, creación de transacciones, y webhooks en Sandbox antes de pasar a Producción.
