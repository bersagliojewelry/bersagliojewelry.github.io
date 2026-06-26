# 18. Dashboard Avanzado

## Resumen Ejecutivo
Para comercios Enterprise, el Dashboard expone funcionalidades avanzadas de roles, reglas antifraude y gestión de links de pago masivos.

## Funciones Avanzadas
- **Roles:** SuperAdmin, Administrador, Preparador, Aprobador. Permite flujos operativos donde una persona crea reembolsos y otra los autoriza.
- **Cobros a terceros (Splits):** Funcionalidad específica para marketplaces.
- **Reglas de negocio antifraude:** Ajustar la agresividad del motor (ej. rechazar transacciones sin `session_id`).

## Errores Comunes
- Dar permisos de SuperAdmin al equipo de soporte de Nivel 1.
- No activar el doble factor de autenticación (2FA) para roles administrativos.

## Qué debe saber hacer el agente
Conocer que Wompi no es solo una API simple, sino que soporta arquitecturas Enterprise mediante configuración directa en consola, lo que disminuye el código personalizado.
