# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🟣 **INTERINATO #3 — OPUS 4.8 OPERA** (desde 2026-07-10; Fable quedó al 93% y diseñó el relevo). Cargar SIEMPRE `opus-interino-protocolo` + `asesor-critico-honesto` + `caza-bugs` al arrancar. **Único frente del interino: TODO-76 (F-IA-2, spec exacta)**. Decisiones Fuertes/dinero nuevo → cola del titular (spec F-IA-2 §6). Fable vuelve tras el reset (jueves) y audita por `git log --grep="[OPUS-4.8]"`.
>
> **🧭 FOCO = plan maestro v5** (F1→F2.2 + POS-pro ✅ EN PROD §165-§182): **F-IA-2 + depuración (TODO-76, interino)** → F-TESORERIA → F-COMPRAS → F-REPORTES → apartados (TODO-39, pend Daniel) → 2.3 térmica → limpieza → rompimiento → **lanzamiento (ahí: precios reales)**. `[[project_comercio_pagos]]`
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
| TODO-39 | **Apartados (F2.4)**: SPEC Decisión Fuerte HECHA (`specs/2026-07-09-f2-4-apartados-DISENO.md` + PROMPT-CONSEJO + mockup; comité/bóveda). Modelo: pedido `estado:apartado`+`turnoId:null`; anticipo=PASIVO segregado; 2 planos (tesorería/turno vs revenue→F4); stock=hold; IVA a la entrega; v1=pieza única/POS. Cancelación resuelta (§7.1: reembolso 100%+saldo-a-favor). RBAC=cajera·20%/60d. **Pend: Daniel corre consejo externo + abogado CO → implementar.** | 🟡 | implementar |
| TODO-67 | **Normalizar fotos 0954/0994 en Storage** (§162.7): tras el fix del cruce, cada foto vive en la CARPETA del doc contrario (URLs funcionan; riesgo: borrar una pieza barre la foto de la otra). Re-subir cada foto desde el admin (2 min) o mover objetos. | 🔲 | menor |
| TODO-47 | **Verdad de marca (riesgo SIC)** — confirmar con Kary qué es REAL y retirar lo no comprobable (equipo, certificaciones, cifras, envíos, horario). Financiación ✅ (NO ADDI, solo Wompi 4 cuotas 0%). Detalle → §133.2(A) · `[[feedback_no_demo_en_index]]`. | 🔲 | Kary |
| TODO-48 | **Reseñas reales** — conectar `reviews` aprobadas → Nosotros + gestión admin. | 🔲 | feature |
| TODO-50 | **Catálogo de lujo** — imagen real + filtros gema/tipo + badges. Detalle → §133.2(B/C). (Taxonomía=TODO-57.) | 🔲 | tras TODO-44 |
| TODO-71 | **Endurecer gates del cerebro (cross-repo, §175)**: (a) resolver `[[feedback_*]]` vs memoria del harness (portan autorizaciones; HUECO B); (b) `ssotFacts` / reducir dup 05↔10 (check #8 inerte, HUECO C); (c) Sonda 5 `auditoria-cerebro`. → cars-operador. | 🔲 | cars-operador |
| TODO-57 | **Modelo GEMA** (§150-§151). HECHO: fundación+form+backfill 32/32+JSON-LD (test 9/9). **Pend**: `settings/gems`+bake · filtros (TODO-50) · live form. D.0: `badgeGem`/`gemFilterIds` fuera de `PUBLIC_SPEC_KEYS` (`generate-pieces.mjs:676`) → whitelist con Bloque D. SSoT → spec. | 🟡 | D.0 (whitelist gema) |
| TODO-76 | **F-IA-2 + DEPURACIÓN (INTERINATO Opus 4.8)** — spec: `docs/superpowers/specs/2026-07-10-f-ia-2-DISENO.md`. **B0·B1·B2·B3·B4 ✅** (§0.7 D1-D7 cerradas por Fable). EJECUTAR: **B5** Salud legible + "Cierre de mes" IN SITU (D4, `salud.js:18`→`auditoria-cartera.js`) + pasada de microcopy GLOBAL. CERO functions/dinero nuevo; gates Chrome holísticos. `[[feedback_reorganizar_no_es_depurar]]` | 🟡 | Opus: B5 |
> ✅ **Cerrados** (detalle → ADRs/`99`): TODO-75 (§183 minería; síntesis `mineria-recursos-2026-07-10.md`; n8n/Canva-lote PARQUEADOS) · 73 (§179) · 74 (§178) · 72 (§177) · 41 (§176) · 70 (§173) · 69 (§172) · 37/65/63/49/42/66/64/21/40/32 + 62-44 (rango). Pend Daniel: fotos IA.

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": F1 rediseño ✅ · F2 hardening (Tier C pend.) · F3 CRM ✅ · Fase M M0-M6 ✅ (R1-R6 gateados). Horizonte: Wompi F2 → inventario/facturación + RBAC. Charter → `50-ARQUITECTURA`.

---

## 📝 Bitácora (efímera)

> 2026-07-10 · **[OPUS-4.8] SESIÓN CERRADA → relevo a conversación nueva**. Retomar con **"ejecuta B5"**: cargar `opus-interino-protocolo`+`asesor-critico-honesto`+`caza-bugs`; leer spec **§5.5** = (1) Salud legible (semáforos con nombre humano · "Registro de fallos"→"Avisos del sistema"), (2) **"Cierre de mes" IN SITU** (D4: corte+acta YA viven en `salud.js:18`→`auditoria-cartera.js` — solo reescribir presentación + estado-vacío honesto, NO mover mecánica), (3) **pasada de microcopy GLOBAL** (cada texto pasa la pregunta 2 del §0.5; CERO lógica). B1-B4 en prod (SW v92), ⏳ validar funcional-con-sesión con login. Desarrollo≡main.
> 2026-07-10 · **[OPUS-4.8] F-IA-2 B4 ✅ (SW v92)** — Bandeja ÚNICA de aprobaciones (`admin-aprobaciones.html`+`bandeja.js`: cartera `initAprobaciones` tal cual + bóveda `aprobarEventoCaja` existente) + badge `aprob-badge` (owner); Salud pierde sección/semáforo/modal (D2). CERO callables nuevas. build + test:sidebar 13/13 + traza. Detalle + desvío owner-only → spec §B4. ⏳ ciclo vivo→deploy. `[[feedback_opus_interino]]`
> 2026-07-10 · **[OPUS-4.8] B0·B1·B2·B3 ✅** (→spec §0.7/checklist + §B3): B1 pestañas · B2 directorio⇄Cartera · B3 "Hoy" pulso $ (dedup `ventasEfectivoTurno`→caja-format). Desplegados.
> 2026-07-10 · **[FABLE-5] D1-D7 + previo → spec §0.7 · ADRs §181-183** (§181/§182 en prod · 1ª APPROVED ✅). ⚠️ **Pend Daniel**: cartera migrada (spec v5 §8) · consejo+abogado apartados (TODO-39). Precios = paso FINAL.
> **Pend no-gate (→ ADRs §165-171)**: instructivo Kary · push A.6 · TODO-67 fotos · botón "Atelier" · abogado CO. ⚠️ ADC gcloud caducado — firebase CLI SÍ auth (bersagliojewelry@gmail.com).
