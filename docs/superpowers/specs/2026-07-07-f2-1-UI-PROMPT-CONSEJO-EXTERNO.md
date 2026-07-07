# Prompt de Consejo Externo (Gemini) — F2.1 UI (POS + pedidos web)

> Daniel pega esto en Antigravity/Gemini (read-only, no edita). Anti-anclaje: problema CRUDO + opciones
> descartadas + invariantes, no la conclusión. Al volver, Claude VERIFICA cada claim contra el código.

---

Eres un asesor crítico adversarial. Encuentra el fallo que rompe la venta o filtra datos. Sé escéptico y concreto.

## Sistema
Joyería de lujo en Colombia. Panel admin en JS vanilla + Firebase. Kary (única operadora, no técnica) atiende el mostrador (POS) en Chrome. El POS registra ventas llamando a una Cloud Function `crearPedido` (único escritor; recalcula el total y es idempotente por un UUID `_pedidoId` que se regenera tras cada venta con `resetSale()`). Hay un módulo de caja con auto-traslado a bóveda que se inhibe cuando hay overlays abiertos.

## Problema
Queremos que Kary pueda **adjuntar un cliente del CRM a una venta**, para cartera/posventa/factura. El backend ya existe y está probado (crear/vincular/fusionar clientes, con la cédula como clave cifrada). Falta la UI.

## Invariantes (no cambian)
- El cobro es sagrado: la UI de adjuntar NUNCA puede frenar, retrasar ni romper `crearPedido` ni el reset del UUID.
- Adjuntar es OPCIONAL y después del cobro; la cédula es opcional; el cliente puede pagar por otro / ser turista sin cédula.
- La normalización canónica de la cédula vive SOLO en el servidor (espejarla parte identidades).
- El CRM es admin-only; el checkout web lo opera el COMPRADOR (público), no un admin.
- Habeas Data (Ley 1581): guardar la cédula exige consentimiento previo, expreso, informado y PROBABLE.

## Opciones ya descartadas (no las repropongas sin refutar)
- "Obligar a registrar el cliente antes de cerrar la venta": descartada (frena la venta, crea datos basura de afán).
- "Panel modal que hay que cerrar en cada venta": descartada (fricción en toda venta rápida).
- "Cargar toda la colección de clientes en el navegador para buscar": bajo sospecha (PII + escala).
- "Un checkbox pelado de consentimiento": descartada (no es 'informada' ni prueba válida).

## Preguntas (refuta, no confirmes)
1. ¿Cuál es el bug de estado más probable cuando Kary adjunta la venta A mientras empieza a cobrar la venta B? ¿Cómo lo eliminas de raíz (no con cuidado del operador)?
2. ¿Dónde debe vivir la cola de "ventas sin cliente" para que una operadora no técnica realmente la vacíe, y no se vuelva un cementerio?
3. Una llamada `resolverCliente(cédula)` que dice si existe un cliente — ¿en qué contexto se vuelve un riesgo de enumeración de datos, y qué regla lo impide para siempre?
4. Buscar clientes por nombre/teléfono/cédula sin cargar toda la colección: ¿cuál es el patrón correcto a este volumen (cientos hoy, miles mañana)?
5. ¿Qué debe mostrar y registrar exactamente la UI para que el consentimiento de Habeas Data sea prueba válida y no deuda legal?
6. ¿Qué omitimos? El fallo que ninguna de las 4 opciones descartadas cubre.

Prioriza lo que ROMPE ventas/plata o siembra deuda de seguridad difícil de revertir.
