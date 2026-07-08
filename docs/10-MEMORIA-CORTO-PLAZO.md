# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> ⚙️ **OPUS 4.8 INTERINATO** (Fable sin cuota; Daniel avisa el retorno): commits `[OPUS-4.8]` + footer real + TDD estricto en `functions/` + deploy manual + NO tocar webhook/firma/reaper/snapshot. `[[feedback_opus_interino]]`
>
> **🧭 FOCO = PLAN ÚNICO ERP v4 (TODO-68)** — SSoT spec `2026-07-04-plan-unico-erp-v4`. **F1 · F2.0 · F2.1 · caja-tiempo-real ✅ EN PROD (§165-§172)** · **TODO-70 POS profesional ✅ §173**. **EN CURSO = F2.2 factura multi-línea (TODO-41)**: **H1-H4 ✅ construidos+probados en `Desarrollo`** (motor+reglas TDD · export · UI mostrador · CMS). **H5 cierre BLOQUEADO** → ⚠️ `origin/main` DIVERGIÓ (cerebro-only §174/§175, código NO conflictúa): reconciliar brain PRIMERO, ADR=§176, gate necesita login owner de Daniel (ver TODO-41). **SIGUE tras F2.2**: 2.4 apartados (TODO-39) · 2.3 térmica (D-5). Precios NO bloquean; 1ª APPROVED viva. `[[project_comercio_pagos]]`
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
| TODO-68 | **PLAN ÚNICO ERP v4** (SSoT spec 2026-07-04): F1 ✅ · F2.0 caja ✅ · F2.1 vínculo ✅ · "caja tiempo real" ✅ (§172). **Sigue**: TODO-70 ✅ (§173) → **F2.2 factura multi-línea (TODO-41)** → F2.4 apartados (TODO-39) → 2.3 térmica (hardware, D-5) → F3 inventario → carril D → F4-F6. D-1 apartados=SÍ · D-2 flete aparte · D-5 sin comprar. §11 = estrategia de modelos. | 🟢 | F2.2 (TODO-41) |
| TODO-39 | **Apartados/abonos (= F2.4 del plan v4)**: **D-1 = SÍ (Daniel 2026-07-04)** → pagos 1..N REUSANDO cartera CRM + pieza apartada bloqueada en web. Spec (Decisión Fuerte, comité+consejo) en paralelo al cierre de F1; reglas finas con Kary. D-2 flete = COBRAR APARTE (contrato en F1). | 🟢 | spec tras F1-PUENTE |
| TODO-41 | **Facturación multi-línea = F2.2** (decisión "AMBOS" = catálogo servicios + línea libre). Spec §8 ✅ (comité ×3 · gate fiscal RESUELTO: No responsable IVA → sin lógica por línea, `naturaleza` future-proof) · `42-LEGAL §7`. **H1-H4 ✅ (Opus · `Desarrollo`)**: motor `lineasExtra` + reglas `servicios/{id}` (precio-server-side · línea libre blindada · fingerprint · `items[]`=SSoT · `desglose`=subtotal pieza · owner-write acotada · soft-delete · historial) · export "Servicios (bruto)" · UI mostrador (`onServiciosChange`, total en vivo) · CMS `admin-servicios.html`+`servicios.js`. Commits `eee8e65`/`9a6232a`/`1e09689`/`79ce696` · **f2-2 16/16 · rules 242/242 · no-reg 24+31 · build verde**. SIN SW bump (admin=network-first + assets hasheados; NO tocar 05 cache). **H5 cierre = BLOQUEADO**: (a) **⚠️ DIVERGENCIA git — `origin/main` ADELANTE de Desarrollo**: main tiene `c542e52` cerebro-only (§174 range-shard 00→00b · §175 Nivel-2 audit) que Desarrollo NO tiene; el código F2.2 (functions/rules/js/html/css) NO conflictúa, pero `05`/`00-INDICE`/`CLAUDE.md`/manifest SÍ → mergear a ciegas REVIERTE el shard. **Reconciliar PRIMERO** (traer main→Desarrollo, resolver 05/00) antes de merge. (b) **ADR = §176** (§174/§175 tomados en main), NO §174. (c) **gate live Chrome NECESITA login owner de Daniel** (no puedo hacer venta real en prod). Pasos H5: reconciliar brain → deploy MANUAL `firebase deploy --only functions,firestore:rules` → merge `Desarrollo→main` → gate (venta pieza+servicio, anular) → SW bump si aplica → ADR §176+`00`+`30`. Topes en `config/caja` (topeLineaLibre 2M/topeExtrasTotal 10M/umbral 500k). | 🟡 | H5: reconciliar brain + gate (Daniel) |
| TODO-67 | **Normalizar fotos 0954/0994 en Storage** (§162.7): tras el fix del cruce, cada foto vive en la CARPETA del doc contrario (URLs funcionan; riesgo: borrar una pieza barre la foto de la otra). Re-subir cada foto desde el admin (2 min) o mover objetos. | 🔲 | menor |
| TODO-47 | **Verdad de marca (riesgo SIC)** — confirmar con Kary qué es REAL y retirar lo no comprobable: equipo, certificaciones, cifras/año, envíos, horario único 8-7. **Financiación ✅ RESUELTA** (Daniel 2026-06-30: NO ADDI, solo Wompi 4 cuotas 0% → FAQ corregida). Detalle → §133.2(A) · `[[feedback_no_demo_en_index]]` | 🔲 | Kary |
| TODO-48 | **Reseñas reales** — conectar `reviews` aprobadas → Nosotros + gestión admin. | 🔲 | feature |
| TODO-50 | **Catálogo de lujo** — imagen real + filtros gema/tipo + badges. Detalle → §133.2(B/C). (Taxonomía=TODO-57.) | 🔲 | tras TODO-44 |
| TODO-57 | **Modelo GEMA** (§150-§151, plano `badgeGem`/`gemFilterIds`). HECHO: fundación+form+backfill 32/32+JSON-LD (test 9/9). **Pend**: `settings/gems`+bake · filtros TODO-50 · live form. **Prerequisito D.0 del plan Fable**: `badgeGem`/`gemFilterIds` NO están en `PUBLIC_SPEC_KEYS` (`generate-pieces.mjs:676`) → al conmutar 7b el badge cae al regex. Hacer con el Bloque D. SSoT → spec. | 🟡 | D.0 (whitelist gema) |
> ✅ **Cerrados** (detalle → ADRs/`99`): TODO-70 (§173 POS profesional/caja OBLIGATORIA ON) · TODO-69 (§172 caja tiempo real+auditoría) · TODO-37/65/63/49/42/66/64/21/40/32 + 62-44 (rango). Pend Daniel: precios + fotos IA.

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": F1 rediseño ✅ · F2 hardening (Tier C pend.) · F3 CRM ✅ · Fase M M0-M6 ✅ (R1-R6 gateados). Horizonte: Wompi F2 → inventario/facturación + RBAC. Charter → `50-ARQUITECTURA`.

---

## 📝 Bitácora (efímera)

> 2026-07-08 · **Sesión "F2.2 H1-H4"** (Opus): motor+reglas TDD (`eee8e65`) · export (`9a6232a`) · UI mostrador (`1e09689`) · CMS servicios (`79ce696`). f2-2 16/16 · rules 242/242 · no-reg 24+31 · build verde. **🔴 HALLAZGO al ir a cerrar (H5)**: `git fetch` → **`origin/main` ADELANTE** (commit cerebro-only `c542e52`: §174 range-shard 00→00b + §175 Nivel-2 audit) que Desarrollo NO tiene. Código F2.2 (functions/rules/js/html/css) NO conflictúa; SÍ conflictúan `05`/`00-INDICE`/`CLAUDE.md`/manifest → **NO mergear a ciegas (revierte el shard)**. Reconciliar main→Desarrollo primero; **ADR F2.2 = §176** (§174/§175 tomados); **gate live necesita login owner de Daniel**. Detenido antes de deploy/merge (§3.3). **Gotcha**: `test:rules` falla si el `http-server` de altorra ocupa `:8080` (matar PID) — entorno, no reglas.
> **Pend no-gate (→ ADRs, §165-171)**: instructivo Kary (abrir caja) · push A.6 · badge sidebar · TODO-67 fotos · botón "Atelier" · runbook §9.4 · [a verificar] abogado CO. ⚠️ ADC gcloud (MCP/scripts) caducado — firebase CLI SÍ auth (bersagliojewelry@gmail.com). _Reglas vivas → CLAUDE.md §3 + memorias._
