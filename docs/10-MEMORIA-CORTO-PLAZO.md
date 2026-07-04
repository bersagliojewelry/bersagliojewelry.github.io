# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM + Fase M EN PROD** (§47-§82). Wompi web verificado en prod (§164). ⚙️ FABLE 5 activo.
>
> **🧭 FOCO = PLAN ÚNICO ERP v4 (TODO-68, Daniel 2026-07-04: "un solo sistema, tú defines el orden")** — SSoT: spec `2026-07-04-plan-unico-erp-v4`. **F1-PUENTE CONSTRUIDO y mergeado a main (`0819e12`, 2026-07-04)**: módulo Pedidos read-only en vivo (admin-pedidos.html) + nav Ventas real. Pend del puente: **validación Chrome en prod** + push FCM A.6 (best-effort, no gatea). **Sigue: F1-CORE** (CF `avanzarPedido` por TABLA + flete/merma + costuras items[]/costoSnapshot/clienteId — con FABLE, §11 de la spec). Precios NO bloquean; monitorear 1ª APPROVED sigue vivo. `[[project_comercio_pagos]]`
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
| TODO-22 | **Gate-de-git en el linter** (H-06): `brain:check` warne si el estado diverge de git AL ARRANCAR. Kernel → cars-operador (L-31). | 🔲 | cars-operador |
| TODO-23 | **Frase canónica del gate de DINERO** (H-18): Claude = gate experto; Kary = smoke post-deploy no bloqueante. → Gemini. | 🔲 | Gemini |
| TODO-28 | **Correcciones web** F1-F5 ✅ EN PROD (§93-§98). Pend: C1 (Daniel) · responsive fino. | 🟡 | C1 |
| TODO-29 | **Kernel lea `### L-NN` de `3*-LECCIONES*`** (no solo `30`) → shard real sin stub (hoy workaround M-06). Kernel → cars-operador (L-31). | 🔲 | cars-operador |
| TODO-35 | **Visibilidad SITE-WIDE** (SEO·AEO·GA4·GSC·Maps·SSG) 🟢 EN PROD. Falta: A2b por-cat + eventos `generate_lead`/`contact` + 2º flujo GA. 🔑 Google authuser=3. | 🟢 | A2b |
| TODO-68 | **PLAN ÚNICO ERP v4** (SSoT: spec 2026-07-04): Ítem 0 → F1-PUENTE → F1-CORE (pedidos+logística) → F2 POS completo (**2.0 sesión de caja apertura/movimientos/cierre + 2.3 impresión térmica+cajón**, Daniel 04-jul) → F3 inventario → carril D → F4-F6 + radar 8b. Comité ×3 ✅ (bóveda). D-1 apartados=SÍ · D-2 flete=cobrar aparte · D-5 hardware=SIN comprar aún (Windows+tablet). **F2.0f = antirrobo bóveda** (limiteCajon/fondoTrabajo + traslados ledger). **§11 = estrategia de modelos (anunciar Fable/Opus/Sonnet por paso; front-load Fable hasta 07-07)**. | 🟢 | arrancar F1-PUENTE (Fable) |
| TODO-39 | **Apartados/abonos (= F2.4 del plan v4)**: **D-1 = SÍ (Daniel 2026-07-04)** → pagos 1..N REUSANDO cartera CRM + pieza apartada bloqueada en web. Spec (Decisión Fuerte, comité+consejo) en paralelo al cierre de F1; reglas finas con Kary. D-2 flete = COBRAR APARTE (contrato en F1). | 🟢 | spec tras F1-PUENTE |
| TODO-41 | **Facturación multi-línea** (Daniel 2026-06-26): factura/POS cobra modificaciones/servicios por código (no solo piezas). Spec `modelo-inventario §10`. | 🔲 | tras carga inventario |
| TODO-67 | **Normalizar fotos 0954/0994 en Storage** (§162.7): tras el fix del cruce, cada foto vive en la CARPETA del doc contrario (URLs funcionan; riesgo: borrar una pieza barre la foto de la otra). Re-subir cada foto desde el admin (2 min) o mover objetos. | 🔲 | menor |
| TODO-47 | **Verdad de marca (riesgo SIC)** — confirmar con Kary qué es REAL y retirar lo no comprobable: equipo, certificaciones, cifras/año, envíos, horario único 8-7. **Financiación ✅ RESUELTA** (Daniel 2026-06-30: NO ADDI, solo Wompi 4 cuotas 0% → FAQ corregida). Detalle → §133.2(A) · `[[feedback_no_demo_en_index]]` | 🔲 | Kary |
| TODO-48 | **Reseñas reales** — conectar `reviews` aprobadas → Nosotros + gestión admin. | 🔲 | feature |
| TODO-50 | **Catálogo de lujo** — imagen real + filtros gema/tipo + badges. Detalle → §133.2(B/C). (Taxonomía=TODO-57.) | 🔲 | tras TODO-44 |
| TODO-57 | **Modelo GEMA** (§150-§151, plano `badgeGem`/`gemFilterIds`). HECHO: fundación+form+backfill 32/32+JSON-LD (test 9/9). **Pend**: `settings/gems`+bake · filtros TODO-50 · live form. **Prerequisito D.0 del plan Fable**: `badgeGem`/`gemFilterIds` NO están en `PUBLIC_SPEC_KEYS` (`generate-pieces.mjs:676`) → al conmutar 7b el badge cae al regex. Hacer con el Bloque D. SSoT → spec. | 🟡 | D.0 (whitelist gema) |
> ✅ **Cerrados** (detalle → ADRs/`99` + lecciones): TODO-37 (plan v3 SUCEDIDO por v4; sus §3-§11 siguen de referencia) · TODO-65 (remanente Fable ABSORBIDO por TODO-68: carril D + F1-extras) · TODO-63 (checkout v63/v64; A.2→§161, gate-live→§164) · TODO-49 (legal §157 → `42-LEGAL`) · TODO-42 (A.9 §164) · TODO-66 (shard 30→34) · TODO-64 (login L-66) · TODO-21 (§158) · TODO-62/61/60/59/58/56/55/54/53/52/51/46/45/44 · TODO-40+32. Pend Daniel: precios + fotos IA.

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier C pend.) · Fase 3 CRM ✅ · Fase M M0→M6 ✅ EN PROD (R1-R6 gateados). Horizonte: **Wompi F2** → R6/M7 → inventario/facturación + RBAC. Charter → `50-ARQUITECTURA`.

---

## 📝 Bitácora (efímera)

> 2026-07-04 (3ª sesión): **F1-PUENTE IMPLEMENTADO con Fable** (spec v4 §11: front-load) — admin-pedidos.html + pedidos.js (lista+detalle read-only EN VIVO, deep-link ?id=, WhatsApp/copiar) + pedidos-format.js puro (test 7/7) + onPedidosChange (subscribeWithRetry) + nav Ventas real (fuera placeholders Ventas/Facturas/CxC) + SW v72/APP v35. Tests sidebar 10/10 · build OK · merge a main `0819e12`. Preview local = login (correcto, L-05); validación final = Chrome prod.
> 2026-07-04 (sesiones 1-2, resumen): monitoreo post-encendido VERDE (reaper solo · Pages v71 OK · L-71) + **PLAN ÚNICO ERP v4 definido y ampliado** (TODO-68; SSoT = spec, comité ×3 en bóveda, D-1/D-2/D-5 decididas). Consolidado previo (GC): §157-§164 vía `00-INDICE`. Pend menor: TODO-67 fotos · auditoría Nivel-2 del cerebro vencida (sesión de mantenimiento).
> _(TODO vivo pre-existente: botón "Hablar con el Atelier" en la ficha — ADR §156.12.)_
> **🚦 Reglas vivas**: arquitecto SIEMPRE · 100% COP (§127) · NO inventado (`[[feedback_no_demo_en_index]]`) · pruebas vivo solo al final (§130.4) · W-11 en decisión-diseño · `[[feedback_workflows_acotados]]`.
