# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM + Fase M EN PROD** (§47-§82). ⚙️ **OPUS 4.8 interino** (marcar `[OPUS-4.8]` · `feedback_opus_interino`).
>
> **🔨 WOMPI F2 — la web cobra sola (Decisión Fuerte·DINERO).** Gate live ✅ (§147) · legal ✅ (§157) · consentimiento persistido ✅ (§157.10). **Falta ENCENDER → TODO-42** (llaves Kary + precios + deploy functions + §03 + flag). SSoT → spec `2026-06-28-wompi-checkout-web-design`. `[[project_comercio_pagos]]`
> _MCP Firebase=escritura prod · merge a main=Claude · Gemini asesora/Claude implementa (`[[feedback_consejo_externo_readonly]]`) · pruebas vivo DIFERIDAS (§130.4)._

---

## 📋 Pendientes abiertos (TODO-NN) — ledger único

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-03/04 | (baja) headers `99`→`## NN.` · anomalías 🔧 en `skills/` | 🔲 | baja |
| TODO-07 | **Contenido real web**: reseñas Google Maps (Nosotros), Films, feed Redes (`js/data/home-media.js`, `js/pages/nosotros.js`) | 🔲 | cliente entrega datos |
| TODO-08 | **Hardening Fase 2**: Tier A ✅; pend. CSP/reglas/claims (Tier B/C) → `41-SEGURIDAD §1.5` | 🟡 | Tier B = emulador+deploy gated |
| TODO-09 | **Fase M** M0→M6 ✅ EN PROD (§78-§80); ACUERDOS R1-R5+A8 GATEADOS/inertes — encender=Daniel. Restan: M7·M2c·ASESOR/RBAC (TODO-19). | 🟡 | encender R6 (Daniel) |
| TODO-14 | **App Check: MONITOREO; Enforce DIFERIDO** (Daniel 2026-06-23: sin flujo alto el monitoreo no es representativo → activar SOLO con tráfico alto). Registro reparado (§58). | ⏸️ | esperar flujo alto |
| TODO-17 | **Toda captura → CRM**: contacto→Bandeja ✅; falta newsletter (`addSubscription`→`subscriptions`) | 🔲 | tras App Check |
| TODO-18 | **Plan operación integral §57**: semana 1 + 9 decisiones de Daniel + compuerta de adopción + campaña cartera → bóveda | 🟡 | Daniel (decisiones 1-9) |
| TODO-33 | **Panel admin "tipo app" (fluidez)** — DISEÑADO (`50 §5`); A3 menú+VT ✅ (v29); pend. esqueletos/prefetch/fonts/VT-al-final; router SPA CONGELADO. PAUSADO. | 🟡 | reanudar tras demo |
| TODO-21 | **Revisión post-Fable de `[OPUS-4.8]`** (H-08): por riesgo (dinero §81 > seguridad §65/§66 > CMS > docs); ~50 commits | 🔲 | Fable vuelve |
| TODO-22 | **Gate-de-git en el linter** (H-06): `brain:check` warne si el estado diverge de git AL ARRANCAR. Kernel → cars-operador (L-31). | 🔲 | cars-operador |
| TODO-23 | **Frase canónica del gate de DINERO** (H-18): Claude = gate experto; Kary = smoke post-deploy no bloqueante. → Gemini. | 🔲 | Gemini |
| TODO-28 | **Correcciones web** F1-F5 ✅ EN PROD (§93-§98). Pend: C1 (Daniel) · responsive fino. | 🟡 | C1 |
| TODO-29 | **Kernel lea `### L-NN` de `3*-LECCIONES*`** (no solo `30`) → shard real sin stub (hoy workaround M-06). Kernel → cars-operador (L-31). | 🔲 | cars-operador |
| TODO-35 | **Visibilidad SITE-WIDE** (SEO·AEO·GA4·GSC·Maps·SSG) 🟢 EN PROD. Falta: A2b por-cat + eventos `generate_lead`/`contact` + 2º flujo GA. 🔑 Google authuser=3. | 🟢 | A2b |
| TODO-39 | **B1 paso 4b — apartados/abonos** (decisión §128.4): ¿el mostrador aparta piezas (anticipo+saldo)? Si sí, saldo = CARTERA (reusar `clientes/{id}.saldoActual`, NO pagos paralelos; link pedido↔cliente). Fork caro → preguntar a Daniel. | 🟡 | decisión Daniel |
| TODO-37 | **PLAN MAESTRO DE COMERCIO** (ACTIVO): físico+digital. SSoT → spec `plan-maestro-comercio-v3`. B0/B0.5 + B1 mostrador 1-6 EN PROD; paso 7 catalogo.json CDN diseñado. Decisiones dueño: ADDI · Persona Jurídica. | 🟢 | B1 |
| TODO-41 | **Facturación multi-línea** (Daniel 2026-06-26): la factura/POS debe cobrar **modificaciones/servicios** por código, no solo piezas (variación de peso/ajuste = línea aparte). Toca POS/factura. Spec `modelo-inventario §10`. | 🔲 | tras carga inventario |
| TODO-42 | **Wompi F2 (cobro web) — ENCENDIDO en prod 2026-06-30** (flag ON; cache v62; CFs prod `pub_prod`+`production.wompi.co` tras fix [[L-65]]). **PEND gate live (Daniel)**: (1) pegar URL del webhook en panel → "URL de Eventos" → Guardar; (2) re-test real (Widget debe decir PRODUCCIÓN, no "pruebas") → pieza ≥$1.500, su tarjeta → ver `pagado`. Precios = cuando Kary valide (botón oculto sin precio). SSoT → spec §12-§14 + `[[project_comercio_pagos]]`. | 🟢 | URL Eventos + re-test |
| TODO-47 | **Verdad de marca (riesgo SIC)** — confirmar con Kary qué es REAL y retirar lo no comprobable: equipo, certificaciones, cifras/año, envíos, horario único 8-7. **Financiación ✅ RESUELTA** (Daniel 2026-06-30: NO ADDI, solo Wompi 4 cuotas 0% → FAQ corregida). Detalle → §133.2(A) · `[[feedback_no_demo_en_index]]` | 🔲 | Kary |
| TODO-48 | **Reseñas reales** — conectar `reviews` (aprobadas) → Nosotros + gestión admin (las falsas ya se quitaron; 1 huérfana de prueba en `reviews`). | 🔲 | feature |
| TODO-49 | **Legal e-commerce** ✅ LISTO + DESPLEGADO (§157.x): Términos/Privacidad reales (retracto/reversión Ley 2439/garantía 12m/SIC/datos) + consentimiento persistido (LEGAL-10). Verif. comité ×3 + consejo ×2. Detalle → `42-LEGAL §4/§5`. | 🟢 | — |
| TODO-50 | **Catálogo de lujo** — imagen real + filtros gema/tipo + badges. Detalle → §133.2(B/C). (Taxonomía=TODO-57.) | 🔲 | tras TODO-44 |
| TODO-63 | **Rediseño UX checkout** — DISEÑADO 2026-06-30 (arquitecto+mockup+comité×4+Antigravity; spec `2026-06-30-checkout-redesign-design`). Antigravity cazó 3 FATALES (capa externa>interna): **legal_id Cédula/NIT** (DIAN/transportadora/antifraude Wompi), **pickup IGUAL pide dirección de facturación** (antifraude), **Habeas Data antes del consentimiento → mover a fin Step 2** (Ley 1581, verif. `carrito.js:310`). + redirect>modal · `getEnvioConfig` SSoT · país `<select>` nativo · reserva tardía atada a sesión · ancho al contenedor. **PEND gate Daniel**: GD-1 recaudador (Diana=Kary?) · GD-2 cobro internacional · GD-3 a-medida sin retracto → construir (Claude valida en Chrome, `[[feedback_validacion_chrome_directa]]`). | 🟡 | gate Daniel |
| TODO-57 | **Modelo GEMA** (§150-§151, plano `badgeGem`/`gemFilterIds`). HECHO: fundación+form+backfill 32/32+JSON-LD (test 9/9). **Pend**: `settings/gems`+bake · filtros TODO-50 · live form. SSoT → spec. | 🟡 | settings/gems |
> ✅ **Cerrados** (detalle → ADRs/`99` + lecciones): TODO-62 (pinch-zoom iOS §156.18 → L-62) · TODO-61 (§156 primera cara + "Asesoría privada" §156.1-16) · TODO-60/59/58/56/55/54/53/52/51/46/45/44 · TODO-40+32. Pend Daniel: precios + fotos IA.

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier C pend.) · Fase 3 CRM ✅ · Fase M M0→M6 ✅ EN PROD (R1-R6 gateados). Horizonte: **Wompi F2** → R6/M7 → inventario/facturación + RBAC. Charter → `50-ARQUITECTURA`.

---

## 📝 Bitácora (efímera)

> Podada (GC) 2026-06-27. Histórico → ADR §37-§130 + bóveda. Lecciones → `30`/`31`/`32`.
>
> **2026-06-30 (Wompi F2 ENCENDIDO en prod):** Daniel cargó las 3 llaves prod (Secret Manager); `.env`→`production.wompi.co`+pub_prod; 3 CFs redesplegadas; flag `WOMPI_WEB_ENABLED=true`; §3 Términos refinado; cache v60; build+suite 36/36 verde; webhook responde 405 a GET ✅. Botón "Pagar ahora" oculto sin precios (seguro). **Pend Daniel**: pegar URL Eventos en panel Wompi + gate live real (pieza $200). Detalle → spec §12-§14. Sin workflow (`[[feedback_workflows_acotados]]`).
>
> **2026-06-30 (Wompi go-live → iteración post-pruebas):** correcciones de consistencia (v61: sin "IVA incluido" en carrito/ficha/cart-drawer — No resp. IVA; nota de envío real; botón "Procesando…" anti doble-clic). Gate live de Daniel cazó el Widget en **"modo pruebas"** → `secrets:set` NO re-empaqueta `.env` (**[[L-65]]**); fix = `firebase deploy --only functions` completo (CFs con `pub_prod`+`production.wompi.co`; cache v62). Daniel pasó el **plan Wompi** (2,65%+$700+IVA · 4 cuotas 0% · **NO ADDI**) → memoria + `fiscal.js` VERIFICADO; FAQ financiación demo corregida. **Pend: Daniel re-test** (Widget = producción) + URL Eventos. **Rediseño UX checkout → TODO-63** (mockup).
> **2026-06-30 (consolidado):** FAB asesoría por zonas (`asesoria-fab.js`, [[L-63]]) · §157.14 foto-héroe sin verde · §157 legal e-commerce LISTO+DESPLEGADO → TODO-49 / ADR §157.x.
> _(§156.x/TODO-62 consolidados en ADR + L-62/L-63. TODO vivo: botón "Hablar con el Atelier" en la ficha — ADR §156.12.)_
> **🚦 Reglas vivas**: arquitecto SIEMPRE · 100% COP (§127) · NO inventado (`[[feedback_no_demo_en_index]]`) · pruebas vivo solo al final (§130.4) · W-11 en decisión-diseño · `[[feedback_workflows_acotados]]`.
