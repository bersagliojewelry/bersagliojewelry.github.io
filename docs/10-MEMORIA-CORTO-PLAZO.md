# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> ⚙️ **OPUS 4.8 INTERINATO** (Fable sin cuota; Daniel avisa el retorno): commits `[OPUS-4.8]` + footer real + TDD estricto en `functions/` + deploy manual + NO tocar webhook/firma/reaper/snapshot. `[[feedback_opus_interino]]`
>
> **🧭 FOCO = PLAN ÚNICO ERP v4 (TODO-68)**. F1·F2.0·F2.1·caja-tiempo-real·TODO-70·F2.2 ✅ EN PROD (§165-§176). Correcciones Daniel 2026-07-08 (validación no-holística `[[feedback_validacion_chrome_holistica]]`): **TODO-72 UX ✅ (§177)**; **TODO-73 money-model CORE ✅ TDD (`d6a5728`, SIN deploy) · UI pend → Daniel trae ajustes en sesión nueva**; **TODO-74 index carga fluida: Capa B skeleton ✅ (`f5d4858`) · Capa A pend**. DESPUÉS: F2.4 (TODO-39). `[[project_comercio_pagos]]`
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
| TODO-68 | **PLAN ÚNICO ERP v4** (SSoT spec 2026-07-04): F1·F2.0·F2.1·caja-tiempo-real ✅ (§172) → TODO-70 ✅ (§173) → F2.2 ✅ (§176) → **F2.4 apartados (TODO-39)** → 2.3 térmica → F3 inventario → carril D → F4-F6. D-1 apartados=SÍ · D-2 flete aparte. §11 = estrategia modelos. | 🟢 | F2.4 (TODO-39) |
| TODO-39 | **Apartados/abonos (= F2.4 del plan v4)**: **D-1 = SÍ (Daniel 2026-07-04)** → pagos 1..N REUSANDO cartera CRM + pieza apartada bloqueada en web. Spec (Decisión Fuerte, comité+consejo) en paralelo al cierre de F1; reglas finas con Kary. D-2 flete = COBRAR APARTE (contrato en F1). | 🟢 | spec tras F1-PUENTE |
| TODO-67 | **Normalizar fotos 0954/0994 en Storage** (§162.7): tras el fix del cruce, cada foto vive en la CARPETA del doc contrario (URLs funcionan; riesgo: borrar una pieza barre la foto de la otra). Re-subir cada foto desde el admin (2 min) o mover objetos. | 🔲 | menor |
| TODO-47 | **Verdad de marca (riesgo SIC)** — confirmar con Kary qué es REAL y retirar lo no comprobable (equipo, certificaciones, cifras, envíos, horario). Financiación ✅ (NO ADDI, solo Wompi 4 cuotas 0%). Detalle → §133.2(A) · `[[feedback_no_demo_en_index]]`. | 🔲 | Kary |
| TODO-48 | **Reseñas reales** — conectar `reviews` aprobadas → Nosotros + gestión admin. | 🔲 | feature |
| TODO-50 | **Catálogo de lujo** — imagen real + filtros gema/tipo + badges. Detalle → §133.2(B/C). (Taxonomía=TODO-57.) | 🔲 | tras TODO-44 |
| TODO-71 | **Endurecer gates del cerebro (cross-repo, §175)**: (a) resolver `[[feedback_*]]` vs memoria del harness (portan autorizaciones; HUECO B); (b) `ssotFacts` / reducir dup 05↔10 (check #8 inerte, HUECO C); (c) Sonda 5 `auditoria-cerebro`. → cars-operador. | 🔲 | cars-operador |
| TODO-57 | **Modelo GEMA** (§150-§151). HECHO: fundación+form+backfill 32/32+JSON-LD (test 9/9). **Pend**: `settings/gems`+bake · filtros (TODO-50) · live form. D.0: `badgeGem`/`gemFilterIds` fuera de `PUBLIC_SPEC_KEYS` (`generate-pieces.mjs:676`) → whitelist con Bloque D. SSoT → spec. | 🟡 | D.0 (whitelist gema) |
| TODO-73 | **POS-pro money-model (Daniel 2026-07-08, Decisión Fuerte, TDD)** — SSoT spec `…/2026-07-08-pos-pro-datafono-servicios-DISENO.md` (comité ×3 §8 · decisiones §9). Alcance: datáfono · vouchers al cierre · venta sin pieza · pago dividido `pagos[]`. **CORE ✅ TDD** (`d6a5728`: f2-3 16/16 + no-reg verdes; SIN deploy, backward-compat). **Pend UI** (`pos.js`/`admin-pos.html`: constructor pagos + datáfono + cierre con conteo vouchers + venta-sin-pieza `_sinPieza`) → deploy `functions` + gate → ADR. Daniel trae ajustes en sesión nueva. NO tocar webhook/firma/reaper/snapshot. | 🟡 | UI → deploy+gate |
| TODO-74 | **Index carga fluida (Daniel 2026-07-08)** — visitante nuevo/incógnito: hueco en blanco + lento entre hero y editorial. **Capa B ✅ skeleton de cristal (`f5d4858`, cache v84, solo PÚBLICO)**: estado "cargando" = encabezado + fantasmas que respiran; cero-ficción + watchdog 8s + a11y intactos; comité ×3. **Pend Capa A** (Decisión Fuerte, capa datos): `data.js` consume `catalogo.json` (SSG, paso "7b") → primer paint instantáneo en frío + Firestore live-upgrade diff-gate por `slug`; L-54 (normalizador único, jamás alimentar cobro); `reservedHeight` a retirar. Flujo: consejo externo + gate. **SSoT+comité → spec `2026-07-08-index-carga-fluida-skeleton.md`**. | 🟡 | Capa A |
> ✅ **Cerrados** (detalle → ADRs/`99`): TODO-72 (§177 Grupo A UX: esqueleto catálogo·zoom·caja-cerrada) · TODO-41 (§176 F2.2 facturación multi-línea OPERATIVO) · TODO-70 (§173 POS profesional/caja OBLIGATORIA ON) · TODO-69 (§172 caja tiempo real+auditoría) · TODO-37/65/63/49/42/66/64/21/40/32 + 62-44 (rango). Pend Daniel: precios + fotos IA.

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": F1 rediseño ✅ · F2 hardening (Tier C pend.) · F3 CRM ✅ · Fase M M0-M6 ✅ (R1-R6 gateados). Horizonte: Wompi F2 → inventario/facturación + RBAC. Charter → `50-ARQUITECTURA`.

---

## 📝 Bitácora (efímera)

> 2026-07-08 · **F2.2 (§176)** + **TODO-72 UX (§177)** cerradas. **TODO-73** diseño+comité×3+CORE TDD ✅ (`d6a5728`, SIN deploy). Gotcha: `test:rules` falla si `http-server` de altorra ocupa `:8080` (matar PID).
> 2026-07-08 · **TODO-74 Capa B skeleton ✅** (`f5d4858`): index para visitante nuevo/incógnito (hueco en blanco+lento). Comité ×3 → cristal que respira (no gris SaaS); B-ahora/A-después. Solo público → **deploy a `main` por CHERRY-PICK** (aísla core TODO-73 backend, sigue en `Desarrollo`). Falta: validar live + ADR + Capa A.
> **Pend no-gate (→ ADRs §165-171)**: instructivo Kary · push A.6 · badge sidebar · TODO-67 fotos · botón "Atelier" · abogado CO. ⚠️ ADC gcloud caducado — firebase CLI SÍ auth (bersagliojewelry@gmail.com).
