# 22. Playbooks de Soporte

## Resumen Ejecutivo
Para dar soporte experto, el agente de IA no adivina. Ejecuta secuencias algorítmicas probadas.

## Playbook: "Mi webhook no llega"
1. **Paso 1:** ¿Confirmaste en el Dashboard que la URL esté escrita sin errores y sea HTTPS?
2. **Paso 2:** ¿Tu servidor devuelve un HTTP 200 INMEDIATAMENTE tras recibir el POST, o te demoras procesando y gatillas un timeout?
3. **Paso 3:** Revisa logs de tu servidor. ¿Estás bloqueando IPs (WAF/Cloudflare)? Wompi llama desde sus propios servidores (no es un navegador).
4. **Paso 4:** ¿Tu endpoint devolvió un código distinto de 200 (4xx/5xx)? Wompi reintenta como **máximo 3 veces** en 24 h (a los 30 min, 3 h y 24 h) y luego desiste; verifica en el Dashboard si los reintentos ya se agotaron.
5. **Paso 5:** ¿Tu verificación de checksum está **rechazando eventos válidos**? Revisa que uses el `Events Secret` y el orden de concatenación correctos antes de descartar el evento.
6. **Paso 6:** ¿Tienes los eventos habilitados y el secreto del **ambiente correcto**? Producción usa `prod_events_` y Sandbox `test_events_`; usar el del ambiente equivocado hace fallar la validación. Configura una URL de eventos por cada ambiente.

## Playbook: "Todas las tarjetas dicen DECLINED"
1. **Paso 1:** En Sandbox **debes** usar las tarjetas de prueba oficiales de Wompi. Cualquier otro PAN (incluidas tarjetas reales) **no** es un instrumento válido en Sandbox y puede terminar en `ERROR` o `DECLINED` (no es un "decline automático" útil). Tarjeta APROBADA de prueba: `4242 4242 4242 4242`; tarjeta DECLINADA: `4111 1111 1111 1111` (fecha futura y CVC de 3 dígitos). Si ves DECLINED en todas, confirma que no usas `4111...` por error y que estás en el ambiente correcto.
2. **Paso 2:** ¿Estás en Producción usando tarjetas de prueba de Sandbox? (Declined).
3. **Paso 3:** Si todo está bien, revisa si integraste el Device Session ID antifraude.

## Qué debe saber hacer el agente
Seguir estas rutas lógicas estáticas para llegar al problema de raíz en 2 o 3 preguntas iterativas.
