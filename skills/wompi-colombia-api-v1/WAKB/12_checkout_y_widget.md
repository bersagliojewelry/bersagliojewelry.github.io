# 12. Checkout y Widget

## Resumen Ejecutivo
Para comercios que no quieren manejar la complejidad de PCI-DSS, UI de pagos, o lógicas de retry, Wompi ofrece interfaces Hosted (Web Checkout) y Drop-in (Widget).

## ¿Qué es?
- **Widget:** Un modal que se superpone a la web del comercio. Se inyecta con un tag `<script>`. 
- **Web Checkout:** Una redirección total a una página alojada por Wompi (`checkout.wompi.co`).

## ¿Para qué sirve?
Reduce el tiempo de integración de meses a días/horas. Wompi se encarga de mostrar los campos de tarjeta, manejar los bancos de PSE, e implementar los flujos de Nequi automáticamente.

## Conceptos Clave
- **Parámetros de inicialización (obligatorios):** El Widget/Web Checkout **no** se inicializa solo con la Public Key. Requiere: (1) **Public Key** (`data-public-key`); (2) **Currency** (`data-currency`, p. ej. `COP`); (3) **Amount in cents** (`data-amount-in-cents`); (4) **Reference** (`data-reference`, referencia única del pedido); y (5) **Integrity Signature** (`data-signature:integrity`) — **OBLIGATORIA**. La firma = `SHA256(reference + amount_in_cents + currency + [expiration_time] + IntegritySecret)` en hexadecimal, y **debe generarse del lado del servidor** para no exponer el `IntegritySecret` al navegador. Sin esta firma, la transacción es rechazada.
- **Reference:** El comercio provee la referencia del pedido al inicializar el widget.
- **Redirect URL:** A dónde enviará el Checkout al usuario tras terminar (éxito o fallo).

## Errores Comunes
- Confiar en que si el usuario fue redirigido a la "Página de Éxito", el pago se hizo. (Riesgo de fraude de manipulación de URL).
- No implementar webhooks en el backend creyendo que el widget hace el trabajo de backend.

## Diagnóstico
Si el widget no carga, verificar que la Public Key corresponda al dominio habilitado en el Dashboard o que esté usando la versión correcta del script de Wompi.

## Qué debe saber hacer el agente
Recordar incansablemente que aunque el Checkout es fácil de integrar en el Frontend, el Backend SIGUE NECESITANDO WEBHOOKS para validar la venta.
