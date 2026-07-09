# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> ⚙️ **OPUS 4.8 INTERINATO** (Fable sin cuota; Daniel avisa el retorno): commits `[OPUS-4.8]` + footer real + TDD estricto en `functions/` + deploy manual + NO tocar webhook/firma/reaper/snapshot. `[[feedback_opus_interino]]`
>
> **🧭 FOCO = PLAN ÚNICO ERP v4 (TODO-68)** — SSoT spec `2026-07-04-plan-unico-erp-v4`. **F1 · F2.0 · F2.1 · caja-tiempo-real ✅ EN PROD (§165-§172)** · **TODO-70 POS profesional ✅ §173**. **F2.2 factura multi-línea ✅ OPERATIVO EN PROD (§176, cierra TODO-41)** — deploy backend + gate vivo Chrome verde (venta pieza+servicio $150k server-side → anular → arqueo $0). Falta cargar servicios reales (data). **⚠️ CORRECCIONES (Daniel 2026-07-08, PAUSAN F2.4)** tras validación Chrome no-holística (`[[feedback_validacion_chrome_holistica]]`): **TODO-72 Grupo A UX ✅ EN PROD (§177)** (esqueleto catálogo · zoom · caja-cerrada; gate holístico verde). **EN CURSO = TODO-73 Grupo B money-model** (datáfono + vouchers al cierre + venta-sin-pieza) = Decisión Fuerte → spec+comité+TDD. **DESPUÉS**: F2.4 (TODO-39) → 2.3 térmica. `[[project_comercio_pagos]]`
> _MCP Firebase=escritura prod · **push+merge a main=Claude sin preguntar** (`[[feedback_claude_deploy_autorizado]]`) · consejo externo read-only · Claude valida en Chrome (`[[feedback_validacion_chrome_directa]]`)._

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
| TODO-33 | **Panel admin "tipo app" (fluidez)** — DISEÑADO (`50 §5`); A3 menú+VT ✅ (v29); pend. esqueletos/prefetch/fonts/VT-al-final; router SPA CONGELADO. PAUSADO. | 🟡 | tras demo |
| TODO-22/29 | Kernel → cars-operador (L-31): gate-de-git en linter (H-06) · kernel lea `### L-NN` de `3*-LECCIONES*` (shard sin stub, hoy M-06). | 🔲 | cars-operador |
| TODO-23 | **Frase canónica del gate de DINERO** (H-18): Claude=gate experto; Kary=smoke no bloqueante. → Gemini. | 🔲 | Gemini |
| TODO-28 | **Correcciones web** F1-F5 ✅ EN PROD (§93-§98). Pend: C1 (Daniel) · responsive fino. | 🟡 | C1 |
| TODO-35 | **Visibilidad SITE-WIDE** (SEO·AEO·GA4·GSC·Maps·SSG) 🟢 EN PROD. Falta: A2b por-cat + eventos `generate_lead`/`contact` + 2º flujo GA. 🔑 Google authuser=3. | 🟢 | A2b |
| TODO-68 | **PLAN ÚNICO ERP v4** (SSoT spec 2026-07-04): F1 ✅ · F2.0 caja ✅ · F2.1 vínculo ✅ · "caja tiempo real" ✅ (§172). **Sigue**: TODO-70 ✅ (§173) → F2.2 ✅ (§176) → **F2.4 apartados (TODO-39)** → 2.3 térmica (hardware, D-5) → F3 inventario → carril D → F4-F6. D-1 apartados=SÍ · D-2 flete aparte · D-5 sin comprar. §11 = estrategia de modelos. | 🟢 | F2.4 (TODO-39) |
| TODO-39 | **Apartados/abonos (= F2.4 del plan v4)**: **D-1 = SÍ (Daniel 2026-07-04)** → pagos 1..N REUSANDO cartera CRM + pieza apartada bloqueada en web. Spec (Decisión Fuerte, comité+consejo) en paralelo al cierre de F1; reglas finas con Kary. D-2 flete = COBRAR APARTE (contrato en F1). | 🟢 | spec tras F1-PUENTE |
| TODO-67 | **Normalizar fotos 0954/0994 en Storage** (§162.7): tras el fix del cruce, cada foto vive en la CARPETA del doc contrario (URLs funcionan; riesgo: borrar una pieza barre la foto de la otra). Re-subir cada foto desde el admin (2 min) o mover objetos. | 🔲 | menor |
| TODO-47 | **Verdad de marca (riesgo SIC)** — confirmar con Kary qué es REAL y retirar lo no comprobable: equipo, certificaciones, cifras/año, envíos, horario único 8-7. **Financiación ✅ RESUELTA** (Daniel 2026-06-30: NO ADDI, solo Wompi 4 cuotas 0% → FAQ corregida). Detalle → §133.2(A) · `[[feedback_no_demo_en_index]]` | 🔲 | Kary |
| TODO-48 | **Reseñas reales** — conectar `reviews` aprobadas → Nosotros + gestión admin. | 🔲 | feature |
| TODO-50 | **Catálogo de lujo** — imagen real + filtros gema/tipo + badges. Detalle → §133.2(B/C). (Taxonomía=TODO-57.) | 🔲 | tras TODO-44 |
| TODO-71 | **Endurecer gates del cerebro (cross-repo · cars-operador · §175)**: (a) resolver `[[feedback_*]]` contra la memoria del harness — portan autorizaciones (deploy-a-main, interinato) y ningún gate los toca (HUECO B); (b) re-armar `ssotFacts` o reducir la duplicación 05↔10 de estado-de-fase — check #8 inerte desde §114 (HUECO C); (c) Sonda 5 de `auditoria-cerebro` que nombre `[[...]]`. Kernel byte-idéntico ×3 → coordina cars-operador. | 🔲 | cars-operador |
| TODO-57 | **Modelo GEMA** (§150-§151, plano `badgeGem`/`gemFilterIds`). HECHO: fundación+form+backfill 32/32+JSON-LD (test 9/9). **Pend**: `settings/gems`+bake · filtros TODO-50 · live form. **Prerequisito D.0 del plan Fable**: `badgeGem`/`gemFilterIds` NO están en `PUBLIC_SPEC_KEYS` (`generate-pieces.mjs:676`) → al conmutar 7b el badge cae al regex. Hacer con el Bloque D. SSoT → spec. | 🟡 | D.0 (whitelist gema) |
| TODO-73 | **POS-pro money-model (Daniel 2026-07-08, Decisión Fuerte, TDD)** — SSoT spec `docs/superpowers/specs/2026-07-08-pos-pro-datafono-servicios-DISENO.md` (**comité ×3 ✅ §8** · decisiones dueño ✅ §9). Alcance: (a) **DATÁFONO** (medio tarjeta, pago inmediato); (b) **cuadre de vouchers al cierre** (cuenta #+suma de pagos datáfono; descuadre NO bloquea; anulados excluidos+avisados — "se reversa en terminal"); (c) **venta SIN pieza** (`pieceId` opcional, `items`=extras, sin stock); (d) **PAGO DIVIDIDO `pagos[]`** (Daniel SÍ: 1 pieza, varios medios; `Σpagos===total`; el arqueo suma por PAGO no por pedido). Orden: **core TDD primero** (`pedidos-core`+`caja-core`) → UI (constructor de pagos + cierre vouchers + sin-pieza) → gate holístico. Bloqueantes del comité: null-safe `conteo.datafono` (o revienta cierres solo-efectivo); doble-cierre devuelve vouchers; cantidad+suma del MISMO predicado. Interinato: NO tocar webhook/firma/reaper/snapshot. Futuro: datáfono sincronizado con POS. | 🔴 | EN CURSO (core TDD) |
> ✅ **Cerrados** (detalle → ADRs/`99`): TODO-72 (§177 Grupo A UX: esqueleto catálogo·zoom·caja-cerrada) · TODO-41 (§176 F2.2 facturación multi-línea OPERATIVO) · TODO-70 (§173 POS profesional/caja OBLIGATORIA ON) · TODO-69 (§172 caja tiempo real+auditoría) · TODO-37/65/63/49/42/66/64/21/40/32 + 62-44 (rango). Pend Daniel: precios + fotos IA.

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": F1 rediseño ✅ · F2 hardening (Tier C pend.) · F3 CRM ✅ · Fase M M0-M6 ✅ (R1-R6 gateados). Horizonte: Wompi F2 → inventario/facturación + RBAC. Charter → `50-ARQUITECTURA`.

---

## 📝 Bitácora (efímera)

> 2026-07-08 · **F2.2 cerrada (§176)**: backend desplegado + gate vivo prod verde (servicio→venta $150k server-side→anular→arqueo $0). **Gotcha**: `test:rules` falla si el `http-server` de altorra ocupa `:8080` (matar PID).
> 2026-07-08 · **PIVOTE (Daniel)**: al validar F2.2 en Chrome NO barrí holísticamente → dejé pasar 4 errores que Daniel sí vio (`[[feedback_validacion_chrome_holistica]]` guardada). Pausada F2.4; abiertos **TODO-72** (UX) + **TODO-73** (POS money-model). Grupo A en curso.
> **Pend no-gate (→ ADRs, §165-171)**: instructivo Kary (abrir caja) · push A.6 · badge sidebar · TODO-67 fotos · botón "Atelier" · runbook §9.4 · [a verificar] abogado CO. ⚠️ ADC gcloud (MCP/scripts) caducado — firebase CLI SÍ auth (bersagliojewelry@gmail.com). _Reglas vivas → CLAUDE.md §3 + memorias._
