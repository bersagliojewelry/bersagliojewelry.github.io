# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> ⚙️ **OPUS 4.8 INTERINATO** (Fable sin cuota; Daniel avisa el retorno): commits `[OPUS-4.8]` + footer real + TDD estricto en `functions/` + deploy manual + NO tocar webhook/firma/reaper/snapshot. `[[feedback_opus_interino]]`
>
> **🧭 FOCO = PLAN ÚNICO ERP v4 (TODO-68)** — SSoT spec `2026-07-04-plan-unico-erp-v4`. **F1 ✅ (§165-§168) · F2.0 caja+bóveda ✅ (§169-§170) · F2.1 vínculo cliente ✅ (§171, flag LIVE) · "caja en tiempo real" ✅ EN PROD (§172, gate Chrome verde)** = F1 reactividad (ventas EN VIVO + panel optimista) + F2 Auditoría owner. · **TODO-70 POS profesional ✅ §173: caja OBLIGATORIA ON en prod (`enforceTurno:true`) + cierre solo-turno + anomalías; gate Chrome verde; SW v83.** **SIGUE (plan v4 §3)**: 2.2 factura multi-línea (TODO-41, prereq TODO-70 ✅) → 2.4 apartados (TODO-39, EXIGE 2.2). 2.3 térmica BLOQUEADA por hardware (D-5). F2.1b match web dormido. Precios NO bloquean; 1ª APPROVED viva. `[[project_comercio_pagos]]`
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
| TODO-70 | **🔴 Profesionalizar el POS — caja OBLIGATORIA (prereq F2.2)** (Daniel 2026-07-07): `config/caja.enforceTurno=false` (prod) deja vender con caja CERRADA → venta `turnoId:null` FUERA de arqueo/auditoría (§172). **Fix**: (1) `enforceTurno:true` (decisión Daniel/Kary); (2) UI de estado (ocultar "Cerrar caja" sin turno · bloquear venta · limpiar "ventas recientes" con caja cerrada); (3) retirar Z legacy `cierreCaja`; (4) marcar `turnoId:null` como anomalía en Auditoría. | TODO-41 | **Facturación multi-línea = F2.2** (Daniel: decisión **"AMBOS"** = catálogo servicios + línea libre). Spec ✅ + comité ×3 ✅ + **gate fiscal RESUELTO** (No responsable de IVA → sin lógica por línea; `naturaleza` future-proof). Detalle: spec `2026-07-07-f2-2-...§8` · `42-LEGAL §7` · CRUDO bóveda. Costura `items[]` ya en `pedidos-core.js:244`. **BUILD**: `servicios`(colección+reglas+CMS owner)·`crearPedido lineasExtra`(TDD)·POS multi-línea(colapsado+chips+línea libre blindada)·export `naturaleza`·gate. **Prereq TODO-70 ✅ §173 → LISTO PARA CONSTRUIR.** | 🟢 | listo (spec §8 ✅) |
| TODO-67 | **Normalizar fotos 0954/0994 en Storage** (§162.7): tras el fix del cruce, cada foto vive en la CARPETA del doc contrario (URLs funcionan; riesgo: borrar una pieza barre la foto de la otra). Re-subir cada foto desde el admin (2 min) o mover objetos. | 🔲 | menor |
| TODO-47 | **Verdad de marca (riesgo SIC)** — confirmar con Kary qué es REAL y retirar lo no comprobable: equipo, certificaciones, cifras/año, envíos, horario único 8-7. **Financiación ✅ RESUELTA** (Daniel 2026-06-30: NO ADDI, solo Wompi 4 cuotas 0% → FAQ corregida). Detalle → §133.2(A) · `[[feedback_no_demo_en_index]]` | 🔲 | Kary |
| TODO-48 | **Reseñas reales** — conectar `reviews` aprobadas → Nosotros + gestión admin. | 🔲 | feature |
| TODO-50 | **Catálogo de lujo** — imagen real + filtros gema/tipo + badges. Detalle → §133.2(B/C). (Taxonomía=TODO-57.) | 🔲 | tras TODO-44 |
| TODO-57 | **Modelo GEMA** (§150-§151, plano `badgeGem`/`gemFilterIds`). HECHO: fundación+form+backfill 32/32+JSON-LD (test 9/9). **Pend**: `settings/gems`+bake · filtros TODO-50 · live form. **Prerequisito D.0 del plan Fable**: `badgeGem`/`gemFilterIds` NO están en `PUBLIC_SPEC_KEYS` (`generate-pieces.mjs:676`) → al conmutar 7b el badge cae al regex. Hacer con el Bloque D. SSoT → spec. | 🟡 | D.0 (whitelist gema) |
> ✅ **Cerrados** (detalle → ADRs/`99`): TODO-70 (§173 POS profesional/caja OBLIGATORIA ON) · TODO-69 (§172 caja tiempo real+auditoría) · TODO-37/65/63/49/42/66/64/21/40/32 + 62-44 (rango). Pend Daniel: precios + fotos IA.

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier C pend.) · Fase 3 CRM ✅ · Fase M M0→M6 ✅ EN PROD (R1-R6 gateados). Horizonte: **Wompi F2** → R6/M7 → inventario/facturación + RBAC. Charter → `50-ARQUITECTURA`.

---

## 📝 Bitácora (efímera)

> 2026-07-08 · **Sesión "POS profesional + F2.2"**: **TODO-70 CERRADO → §173** — caja OBLIGATORIA ON en prod (`config/caja.enforceTurno:true`, MCP merge 1 campo) + cierre solo-turno (Z legacy retirado) + ventas ocultas con caja cerrada + panel de anomalías fuera-de-turno (Auditoría). CERO `functions/` (el gate server ya existía+testeado `caja.integration.test.mjs:169`). Encendido decidido por Daniel (AskUserQuestion) sobre evidencia prod: 0 ventas reales (gate precios/1ª APPROVED abierto), Kary ya probó turnos, 0 huérfanas vivas → la 1ª venta real nace bajo control de caja. **Gate Chrome prod VERDE**. SW v82→**v83**·APP **v45**. **SIGUE = F2.2** factura multi-línea (TODO-41): spec `2026-07-07-f2-2` §8 comité×3 + gate fiscal ✅ → LISTA (Opus + TDD estricto). Pend NO-gate: instructivo Kary (abrir caja cada mañana).
> **Consolidado (→ ADRs)**: F2.1 §171 (flag LIVE · [a verificar] abogado CO) · F2.0 §169-170 (runbook §9.4 + B5d rol `caja` → Kary) · F1 §165-168. Pend no-gate: push A.6 · badge sidebar · TODO-67 fotos · botón "Atelier". ⚠️ ADC gcloud caducado. Nivel-2 cerebro vencida (§173).
> **🚦 Reglas vivas**: arquitecto SIEMPRE · 100% COP (§127) · NO inventado (`[[feedback_no_demo_en_index]]`) · pruebas vivo solo al final (§130.4) · W-11 en decisión-diseño · `[[feedback_workflows_acotados]]` · **interinato Opus: dinero con comité+consejo+skills+agentes**.
