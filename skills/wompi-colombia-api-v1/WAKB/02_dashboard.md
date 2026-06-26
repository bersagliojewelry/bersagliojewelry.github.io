# 02. Dashboard

## Resumen Ejecutivo
El Dashboard de Wompi es una consola de administración web. Es un cliente que consume servicios administrativos de Wompi. **No es el motor transaccional ni sustituye a la API.**

## ¿Qué es?
Una interfaz gráfica (UI) para que equipos de operaciones, financieros y desarrolladores gestionen el comercio, obtengan llaves, configuren webhooks y exporten reportes.

## ¿Para qué sirve?
Sirve para separar la configuración de la operación. Permite cambiar parámetros críticos (como la URL de los eventos o generar nuevas llaves) sin tener que tocar código en el backend del comercio.

## Conceptos Clave
- **Sección de Desarrolladores:** Donde viven las llaves y la configuración de Webhooks.
- **Módulo de Reportes:** Permite descargar CSVs o Asobancaria para conciliación.
- **Módulo de Transacciones:** Visor histórico de pagos y sus estados.

## Configuración e Integración
- **Webhooks:** Solo se puede configurar UNA url de webhooks activa por ambiente. 
- **Llaves:** Pueden ser rotadas desde el Dashboard si existe sospecha de compromiso.

## Errores Comunes
- Eliminar credenciales en uso.
- Configurar la URL de webhooks apuntando a un entorno local sin tunel (ej. `localhost`).
- Confundir las métricas de Sandbox con Producción.

## Diagnóstico
Cuando un usuario reporta "Wompi no funciona", el agente debe preguntar si el problema es en la API (transaccional) o si hay errores al iniciar sesión o descargar reportes (Dashboard).

## Buenas Prácticas
Aplicar MFA (Multi-Factor Authentication), limitar roles (si aplica el producto), y auditar quién y cuándo rotó llaves.

## Qué debe saber hacer el agente
Guiar paso a paso a un usuario por las opciones del Dashboard para encontrar las credenciales, configurar webhooks o generar reportes, confirmando siempre primero el ambiente (Sandbox vs Producción) y la intención del usuario **antes** de rotar llaves o modificar la URL de webhooks (operaciones sensibles que impactan la operación en vivo).
