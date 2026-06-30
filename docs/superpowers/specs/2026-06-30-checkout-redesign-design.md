# Rediseño UX del Checkout (TODO-63) — DISEÑO consolidado (Decisión Fuerte · money path)

> **Autor**: Claude `[OPUS-4.8]` (2026-06-30). **Pipeline W-11**: arquitecto ✅ · mockup ✅ (show_widget) · comité ×4 ✅ · consejo externo Antigravity ✅ · **validación Chrome = Claude vía extensión** (no prompt — `[[feedback-validacion-chrome-directa]]`) · gate dueño PENDIENTE.
> **Deliberación cruda** → `../brain-private/bersaglio/2026-06-30-todo63-checkout-redesign-comite-consejo-CRUDO.md` (+ comité full en `tasks/wn18xdohm.output`).
> **Disparador**: Daniel probando el cobro Wompi en vivo (6 hallazgos) + go-live Wompi (`[[project_comercio_pagos]]`).

## 1. Alcance (los 6 hallazgos de Daniel)
1. Selector de **tipo de entrega** (recoger en tienda Cartagena / nacional / internacional) que decide campos + medios de pago. (Pickup = SÍ, confirmado Daniel.)
2. Selector de **país con bandera + indicativo** junto al teléfono/WhatsApp.
3. Al elegir "Pagar ahora", **ocultar los otros medios** + volver atrás.
4. Tarjetas de pago **enormes** en desktop → acotar.
5. **Widget Wompi grande** → responsive.
6. Tras cancelar, la pieza queda **apartada ~2-3 min** ("desaparece" pagar) → comunicar/mejorar.

## 2. Lo que la capa externa (Antigravity) cazó que el comité NO vio — VERIFICADO, se ADOPTA
- **A1 [FATAL] `legal_id` (Cédula/NIT) obligatorio**: transportadoras + DIAN (guía/factura) y el **antifraude de Wompi** (tx de alto valor sin `legal_id` se rechazan). → Step 2 (cuando hay pago online) pide **Tipo de documento (CC/CE/Pasaporte/NIT) + Número** y se pasan al `customer_data`/payload de Wompi. (Verificar nombres de campo exactos contra skill `wompi-api-core` al construir.)
- **A2 [FATAL] Pickup IGUAL necesita dirección de facturación**: el antifraude de Wompi usa dirección+ciudad de la tarjeta; pickup con dirección vacía → rechazos. → Para "Recoger en tienda", el bloque NO se titula "Envío" sino **"Datos de facturación"**, con **Ciudad + Dirección obligatorias** + micro-copy *"Requerido por seguridad bancaria; no haremos envíos a esta dirección."* **(Corrige al comité y al primer mockup, que ocultaban la dirección en pickup.)**
- **A3 [ALTO·legal] Habeas Data se captura antes del consentimiento**: VERIFICADO — el checkbox vive en `renderStepPayment` (Step 3, `carrito.js:~310`) pero el Step 2 ya guarda Nombre/Email/Teléfono en `sessionStorage` → viola Ley 1581. → Mover **consentimiento (Habeas Data + Términos + aviso de retracto 5 días)** al **final del Step 2**, obligatorio para avanzar, para **TODOS** los métodos (no solo Wompi).

## 3. Conflicto deliberado — ocultar medios al elegir "Pagar ahora"
- **Daniel**: ocultar los otros medios, "atrás" para verlos. **Antigravity**: NO ocultar (pánico; si la tarjeta falla no hay salida; en lujo muchos prefieren transferencia). **Comité**: ocultar PERO con botón de retorno prominente + foco + sin pérdida.
- **RESOLUCIÓN (Claude delibera/decide)**: se hace lo que pidió Daniel (**ocultar/enfocar**), PERO con las defensas que neutralizan el riesgo de Antigravity: (a) botón **"Cambiar método de pago" real, ≥44px, visible sin scroll** (no un "←" diminuto); (b) la **reserva se crea TARDE** (al abrir el pago real, no al seleccionar el radio) → explorar "Pagar ahora" no aparta la pieza; (c) **reserva atada a la sesión** → si la tarjeta falla, cambiar a transferencia/otra tarjeta funciona de inmediato sobre el mismo candado. Así el cliente nunca queda atrapado.

## 4. Convergencias comité+consejo — se ADOPTAN
- Tipo de entrega = **radiogroup nativo** (fieldset+legend+radios), tarjeta estilizada sobre el radio; móvil apilado ≥48px, desktop fila de 3. Rótulo del paso → **"Entrega"** (cubre tienda+envío).
- **`getEnvioConfig(tipo)`** = función pura SSoT → `{ camposVisibles, camposRequeridos, permitePagoOnline, mediosElegibles }`. Render de Entrega y Pago consumen el MISMO objeto (invariante "internacional→no online" en un solo lugar; testeable).
- País = **`<select>` nativo** con bandera emoji en el texto ("🇨🇴 Colombia +57"); indicativo DERIVADO (clave ISO2; +1 colisiona US/CA). Array SSoT `{iso2,nombreEs,indicativo,banderaEmoji}` — Colombia default, resto alfabético; LatAm + USA/Canadá + Europa principal. Móvil ≤380px: país arriba/tel abajo, `inputmode=tel`. Validación tolerante por país.
- **Wompi = REDIRECT** (Web Checkout `checkout.wompi.co`), no modal embebido: el modal falla en in-app webviews (IG/TikTok) con 3DS y pelea con teclado/header en móvil. Persistir estado del checkout en `sessionStorage` + rehidratar al volver + parsear la tx de la URL. Antes del salto: mini-resumen "pago seguro Wompi · cargo como Diana M. Niño M. · vuelves a Bersaglio".
- **Reserva tras cancelar/fallar** = banner `role=status` "Apartamos tu pieza unos minutos — reintenta aquí" + botón **Reintentar pago** activo de inmediato (mismo usuario; re-reserva transparente si el reaper liberó) + fallback WhatsApp. Reintentar con OTRO medio NO debe estar bloqueado por la propia reserva.
- **Ancho**: `max-width` (~520-600px, en ch/rem) al **contenedor entero** (`.ck-card`, centrado), no solo a las tarjetas (Antigravity: si no, queda vacío a la derecha). `width:100%` debajo del tope; preserva reflow 320px / zoom 200%. **Aditivo, sin renombrar IDs/clases (§3.2).**
- **Elegibilidad de "Pagar ahora"** = `permitePagoOnline(tipo) AND precio>0 AND precio ≤ TOPE($2.5M, una constante central) AND stock`. Si `precio > tope` → ocultar "Pagar ahora" y mostrar "por el valor de esta pieza coordinamos el pago contigo" (sin exponer el motivo técnico).
- **Transparencia en Pago**: total COP único + "no incluye IVA" + "retracto 5 días (salvo piezas a la medida)" en voz de marca.
- **Internacional**: desde que se elige el tipo (no esperar a Pago), bloque **"Cierre asistido"** + CTA WhatsApp ancho completo con `wa.me` (indicativo normalizado, solo dígitos) + mensaje pre-cargado (pieza/ID/precio COP/país/nombre), **sin pedir datos de pago**.
- **Éxito post-pago**: pantalla de confirmación con voz de marca + siguiente paso según entrega (cita atelier Cartagena / coordinación envío). **La venta la confirma el WEBHOOK** (no el callback del navegador) y eso retira la pieza del catálogo.
- **a11y**: campos no aplicables fuera del flujo + sin `required` (no trampa WCAG 3.3); foco gestionado + `aria-live` en cambios; controles operables por teclado.

## 5. DECISIONES PARA DANIEL (genuinas — no las puedo decidir solo)
- **GD-1 · Identidad del recaudador (legal, prioridad alta)**: el cargo sale "Diana M. Niño M." — ¿Diana = Kary o es otra socia? Hay que **dejar escrito en Términos** quién recauda y su relación con Bersaglio antes de subir volumen (flanco SIC).
- **GD-2 · Cobro internacional**: ¿cómo se cobra lo internacional por WhatsApp? (recomiendo: **link de pago Wompi generado por el negocio**, y **PROHIBIR transferencias a cuentas personales de vendedoras** — rompe vendedor≠cobrador). 
- **GD-3 · Piezas a la medida / por encargo**: el art. 47 las EXCLUYE del retracto. Si se venden por web → marcarlas "sin retracto" + checkbox de aceptación informada. ¿Confirmas?
- (Decido yo, te informo: legal_id se añade · pickup conserva dirección de facturación · redirect en vez de modal · reserva tardía atada a sesión.)

## 6. Riesgos al construir (R1-R10 del comité): doble fuente de elegibilidad · reserva colgada · deep link WA · redirect rompe estado 3-pasos (rehidratar de sessionStorage) · `required` oculto · cobro/candado (webhook=verdad) · tope no contemplado · cambios NO aditivos (§3.2) · info engañosa SIC (medios del Widget / "4 cuotas" / escasez falsa).

## 7. Plan de construcción (tras el gate del dueño)
1. `getEnvioConfig` + array de países (módulos puros + tests de tabla 3 tipos × medios).
2. Step 2 "Entrega": radiogroup + campos condicionales + país select + legal_id + consentimiento al final.
3. Step 3 "Pago": elegibilidad por config + foco/ocultar con escape prominente + transparencia legal + aviso recaudador.
4. Wompi redirect + persistencia sessionStorage + rehidratación + reserva tardía atada a sesión.
5. CSS: max-width al contenedor; responsive (móvil apilado).
6. Pantalla de éxito post-pago.
7. **Validación en Chrome por Claude (extensión)** en desktop + móvil 360px (incl. teclado abierto en el redirect) + gate del dueño.
