# Prompt de Consejo Externo (Gemini/Antigravity) — F2.1 Contrato de identidad de cliente

> **Uso**: Daniel pega esto en Antigravity/Gemini (consejo read-only, NO edita). Anti-anclaje (R1): se
> entrega el problema CRUDO + opciones descartadas + invariantes, no la conclusión ya elegida. Al volver,
> Claude VERIFICA cada afirmación contra el código real antes de adoptar (regla de oro del dueño).

---

Eres un asesor crítico adversarial. NO tienes que estar de acuerdo. Tu trabajo es encontrar el fallo que rompe el contrato PARA SIEMPRE. Sé escéptico y concreto.

## Sistema
Joyería de alta gama en Colombia (esmeraldas, oro 18k). Firebase + Firestore + Cloud Functions + GitHub Pages. Mini-ERP con CRM. Operadora única: "Kary" (no técnica), atiende mostrador en PC Windows/Chrome + quiere tablet. Dueño: "Daniel". Ventas presenciales (mostrador/POS) y ventas web (Wompi). El CRM es admin/owner-only. Todo el dinero/stock es CF-only + append-only + anular≠borrar, con sello de tiempo+autor del servidor.

## Problema a resolver
Necesitamos ligar cada **pedido** (venta) a un **cliente** del CRM, con una **clave canónica de identidad** que:
- deduplique clientes (no crear el mismo dos veces),
- permita que un pedido web (que trae la cédula del comprador) encuentre al cliente existente,
- sea el contrato que un **futuro portal del cliente** usará para que el cliente entre y vea "mis pedidos"/su cartera.

## Hechos que NO se pueden cambiar (invariantes)
- Los pedidos web ya guardan `docType`+`docNumber` (cédula) del comprador (para DIAN/antifraude). Los pedidos de mostrador pueden NO tener documento.
- Hay 344 clientes migrados de Excel **por nombre, sin cédula**. No se les puede exigir cédula retroactivamente.
- La cédula colombiana NO es secreta (va impresa en cada factura).
- En Colombia un mismo humano cambia de documento en el tiempo: Tarjeta de Identidad→Cédula (a los 18); Pasaporte→PPT→Cédula (migrante); Cédula de Extranjería→Cédula (naturalizado); una empresa usa NIT.
- Ley 1581 (Habeas Data): guardar el documento de una persona exige consentimiento previo/expreso/informado; el titular tiene derecho a rectificar y suprimir; hay retención fiscal (~10 años) sobre soportes de factura.

## Opciones que YA descartamos (no las repropongas sin refutar la razón)
- "Clave = solo el NÚMERO del documento": descartada (colisión coincidental entre tipos; y no une los distintos números del mismo humano).
- "Una clave = una persona = un cliente": descartada (parte al humano que cambió de documento en varios clientes con saldos separados).
- "Cédula en texto plano como ID del documento del índice": descartada (viaja a logs/backups = riesgo Habeas Data).
- "Normalizar el documento en el navegador y en el servidor (misma función espejada)": descartada (diverge → duplicados silenciosos).
- "Portal del cliente que da datos con solo teclear la cédula": descartada (account-takeover + enumeración de clientes de lujo = inteligencia para hurto).

## Preguntas para ti (refuta, no confirmes)
1. Diseña o critica el modelo de identidad: ¿una persona-cliente que POSEE varios documentos (aliases) + una tabla índice `documento-hasheado → clienteId` es correcto? ¿Qué caso colombiano lo rompe igual?
2. ¿Qué pasa cuando la prevención de duplicados falla y hay que FUSIONAR dos clientes que ya tienen saldos/pedidos? ¿Cuál es el mínimo irreductible que debe existir el día 1 para no quedar sin salida?
3. ¿Cómo debe atarse HOY el contrato para que el futuro portal del cliente NO nazca enumerable/inseguro, sin construir el portal todavía?
4. ¿Deduplicar por teléfono (además del documento) mientras casi nadie tiene documento cargado — ayuda o crea nuevos falsos-positivos?
5. Para NIT de empresa: ¿el dígito de verificación entra o no en la clave canónica? Justifica.
6. ¿Qué omitimos por completo? El fallo que ninguna de las 5 opciones descartadas cubre.

Responde priorizando lo IRREVERSIBLE (lo que, si se escribe mal hoy, obliga a picar el contrato después).
