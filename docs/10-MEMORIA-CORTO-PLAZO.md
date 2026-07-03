# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM + Fase M EN PROD** (§47-§82). ⚙️ **OPUS 4.8 interino** (marcar `[OPUS-4.8]` · `feedback_opus_interino`).
>
> **🔨 WOMPI F2 ENCENDIDO en prod** (vivo pero DORMIDO: botón "Pagar ahora" OCULTO sin precios) → **foco = PLAN MAESTRO AUDITORÍA (TODO-65, Fable 2026-07-03)**: Opus implementa por bloques. **A0 login (incendio diario) → A dinero (GATE: NO cargar precios hasta cerrar A) → B/C/D/E**. SSoT → `2026-07-03-auditoria-holistica-plan-fable.md`. `[[project_comercio_pagos]]`
> _MCP Firebase=escritura prod · merge a main=Claude · consejo externo read-only (`[[feedback_consejo_externo_readonly]]`) · Claude valida en Chrome (`[[feedback_validacion_chrome_directa]]`)._

---

## 📋 Pendientes abiertos (TODO-NN) — ledger único

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-03/04 | (baja) headers `99`→`## NN.` · anomalías 🔧 en `skills/` | 🔲 | baja |
| TODO-07 | **Contenido real web**: reseñas Maps (Nosotros), Films, feed Redes (`home-media.js`). | 🔲 | cliente entrega datos |
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
| TODO-37 | **PLAN MAESTRO COMERCIO** (ACTIVO, físico+digital). SSoT → spec `plan-maestro-comercio-v3`. B0/B0.5+B1 mostrador 1-6 EN PROD; paso 7 catalogo.json CDN diseñado. | 🟢 | B1 |
| TODO-41 | **Facturación multi-línea** (Daniel 2026-06-26): factura/POS cobra modificaciones/servicios por código (no solo piezas). Spec `modelo-inventario §10`. | 🔲 | tras carga inventario |
| TODO-42 | **Wompi F2 ENCENDIDO** pero DORMIDO (botón oculto sin precios). **PEND**: URL Eventos en panel + gate live (Daniel) — pero PRIMERO el **hardening Bloque A del plan Fable** (3 P1). SSoT → spec Wompi §12-§14 + plan `§3`. | 🟢 | Bloque A → gate live |
| TODO-47 | **Verdad de marca (riesgo SIC)** — confirmar con Kary qué es REAL y retirar lo no comprobable: equipo, certificaciones, cifras/año, envíos, horario único 8-7. **Financiación ✅ RESUELTA** (Daniel 2026-06-30: NO ADDI, solo Wompi 4 cuotas 0% → FAQ corregida). Detalle → §133.2(A) · `[[feedback_no_demo_en_index]]` | 🔲 | Kary |
| TODO-48 | **Reseñas reales** — conectar `reviews` aprobadas → Nosotros + gestión admin. | 🔲 | feature |
| TODO-49 | **Legal e-commerce** ✅ LISTO + DESPLEGADO (§157.x): Términos/Privacidad reales (retracto/reversión Ley 2439/garantía 12m/SIC/datos) + consentimiento persistido (LEGAL-10). Verif. comité ×3 + consejo ×2. Detalle → `42-LEGAL §4/§5`. | 🟢 | — |
| TODO-50 | **Catálogo de lujo** — imagen real + filtros gema/tipo + badges. Detalle → §133.2(B/C). (Taxonomía=TODO-57.) | 🔲 | tras TODO-44 |
| TODO-63 | **Rediseño UX checkout — DESPLEGADO + VERIFICADO LIVE (v63/v64)** (comité×4+Antigravity+gate; entrega/país/legal_id/consentimiento · Wompi REDIRECT · §3 GD-2 · éxito · tests 12/12). Fixes v64 (país CO+57 · borrado fotos robusto · caché síncrono CMS). **PEND remanente vivo = A.2 del plan Fable** (reserva-reintento: reusar pedidoId + guard de estado server) + gate-live redirect (Daniel). Spec `2026-06-30-checkout-redesign-design`. | 🟡 | A.2 + gate-live |
| TODO-64 | **Bug LOGIN admin — parpadeos** (Daniel 2026-07-03). **A0 IMPLEMENTADO [OPUS-4.8] 2026-07-03** (v65): `sessionReady()` determinista reemplaza el timeout 500ms (H1); `requireAuth` rutea rol insuficiente a su landing SIN borrar `bj_auth` (H2, caso Kary/catálogo); limpieza de `?error` movida a `login.js` (H3, mapea forbidden+disabled). Build verde; verif. sandbox OK (H3 + form-first + sin-loop). **PEND**: verif. FABLE en Chrome de los 4 caminos con login REAL (manual · recarga admin.html · pestaña nueva · catálogo→admin.html). SSoT → plan `§2`. | 🟡 | verif. Fable Chrome |
| TODO-57 | **Modelo GEMA** (§150-§151, plano `badgeGem`/`gemFilterIds`). HECHO: fundación+form+backfill 32/32+JSON-LD (test 9/9). **Pend**: `settings/gems`+bake · filtros TODO-50 · live form. **Prerequisito D.0 del plan Fable**: `badgeGem`/`gemFilterIds` NO están en `PUBLIC_SPEC_KEYS` (`generate-pieces.mjs:676`) → al conmutar 7b el badge cae al regex. Hacer con el Bloque D. SSoT → spec. | 🟡 | D.0 (whitelist gema) |
| TODO-65 | **PLAN MAESTRO auditoría holística (Fable 5, 2026-07-03)** para que **Opus 4.8 implemente**. 6 bloques: A0 login · A dinero (GATE pre-precios) · B fugas/robustez · C pulidos POS/fiscal · D catálogo CDN+gema · E higiene. Auditoría 6 áreas × verificación adversarial. **SSoT → `docs/superpowers/specs/2026-07-03-auditoria-holistica-plan-fable.md`** · crudo → bóveda `2026-07-03-auditoria-holistica-6areas-CRUDO.json`. Absorbe TODO-42/63/40/37-paso7/57/50. | 🟢 | Opus ejecuta por bloque |
> ✅ **Cerrados** (detalle → ADRs/`99` + lecciones): TODO-62 (pinch-zoom iOS §156.18 → L-62) · TODO-61 (§156 primera cara + "Asesoría privada" §156.1-16) · TODO-60/59/58/56/55/54/53/52/51/46/45/44 · TODO-40+32. Pend Daniel: precios + fotos IA.

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier C pend.) · Fase 3 CRM ✅ · Fase M M0→M6 ✅ EN PROD (R1-R6 gateados). Horizonte: **Wompi F2** → R6/M7 → inventario/facturación + RBAC. Charter → `50-ARQUITECTURA`.

---

## 📝 Bitácora (efímera)

> Podada (GC) 2026-07-03. Histórico Wompi/legal (2026-06-30) → ADR §157 + spec Wompi §12-§14 + [[L-63]]/[[L-65]].
>
> **2026-07-03 (auditoría holística Fable):** 6 áreas × verificación adversarial → **plan maestro TODO-65** para Opus (`2026-07-03-auditoria-holistica-plan-fable`). Login TODO-64 diagnosticado (A0). 3 P1 dinero = GATE pre-precios (Bloque A). Confirmado sano: seguridad backend, núcleo Wompi, inventario v3. Crudo → bóveda. Build verde; suite 330/331 (1 rojo = corte-insumos necesita emulador, no regresión → E.1).
> _(TODO vivo pre-existente: botón "Hablar con el Atelier" en la ficha — ADR §156.12.)_
> **🚦 Reglas vivas**: arquitecto SIEMPRE · 100% COP (§127) · NO inventado (`[[feedback_no_demo_en_index]]`) · pruebas vivo solo al final (§130.4) · W-11 en decisión-diseño · `[[feedback_workflows_acotados]]`.
