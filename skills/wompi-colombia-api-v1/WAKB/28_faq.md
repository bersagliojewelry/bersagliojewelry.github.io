# 28. FAQ (Preguntas Frecuentes)

## ¿Puedo usar la API para cobrar pero que la UI sea el Checkout?
Sí, no son mutuamente excluyentes. El Checkout/Widget alojado maneja la **UI** de pago, pero a nivel de servidor **sigues usando la API**: (a) debes generar la **firma de integridad del lado del servidor** (no en el frontend, para no exponer el `IntegritySecret`), y (b) confirmas el estado final consultando `GET https://production.wompi.co/v1/transactions/{id}` y/o escuchando los eventos (webhooks). Si usas la API de transacciones directa, tú diseñas toda la UI. Ambos enfoques comparten el mismo backend de Transacciones y los mismos eventos. La URL de redirección **nunca** sirve como validación, solo para informar al usuario.

## ¿Qué pasa si el cliente paga con PSE y no configuré webhooks?
El dinero le entrará a tu cuenta de Wompi y la transacción llegará a un estado final (`APPROVED`/`DECLINED`) **independientemente** de si configuraste webhooks. Sin webhooks, tu tienda simplemente no se entera automáticamente del resultado, pero **NO** se pierde el dinero: puedes recuperar el estado consultando `GET /v1/transactions/{id}` (polling/conciliación). Lo recomendable es implementar webhooks y, como respaldo, un cronjob de polling (ver módulo 27, "Rescate Automático").

## ¿Cómo reembolso dinero a una cuenta de ahorros?
Usando la API de Traslados/Transferencias a Terceros, ya que PSE/Nequi no soportan la función de `refunds` nativa de tarjetas.

## ¿Puedo omitir la Firma de Integridad?
Wompi puede configurar tu cuenta para no exigirla, pero corres un riesgo legal y financiero gravísimo. Mejor implementarla.
