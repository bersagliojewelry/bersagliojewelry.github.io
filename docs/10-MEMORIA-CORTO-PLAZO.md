# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🟣 **INTERINATO #3 — OPUS 4.8 OPERA** (desde 2026-07-10; Fable quedó al 93% y diseñó el relevo). Cargar SIEMPRE `opus-interino-protocolo` + `asesor-critico-honesto` + `caza-bugs` al arrancar. **Único frente del interino: TODO-76 (F-IA-2, spec exacta)**. Decisiones Fuertes/dinero nuevo → cola del titular (spec F-IA-2 §6). Fable vuelve tras el reset (jueves) y audita por `git log --grep="[OPUS-4.8]"`.
>
> **🧭 FOCO = plan maestro v5** (F1→F2.2 + POS-pro ✅ EN PROD §165-§182): **F-IA-2 ✅ CODE-COMPLETE (TODO-76, interino Opus — B0-B5)** → F-TESORERIA → F-COMPRAS → F-REPORTES → apartados (TODO-39, pend Daniel) → 2.3 térmica → limpieza → rompimiento → **lanzamiento (ahí: precios reales)**. `[[project_comercio_pagos]]`
> _MCP Firebase=escritura prod · **push+merge a main=Claude sin preguntar** (`[[feedback_claude_deploy_autorizado]]`) · consejo externo read-only · Claude valida en Chrome (`[[feedback_validacion_chrome_directa]]`)._

---

## 📋 Pendientes abiertos (TODO-NN) — ledger único

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-03/04 | (baja) headers `99`→`## NN.` · anomalías 🔧 en `skills/` | 🔲 | baja |
| TODO-77 | **SHARD de `30`** (§G.5): rozando el tope duro (44000) → no admite otra lección. Extraer categoría a hija (ojo: L-81/1022c tiene su detalle SOLO en `30` → mover, no recortar). | 🔲 | poda 30 |
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
| TODO-35 | **Visibilidad SITE-WIDE** (SEO·AEO·GA4·GSC·Maps·SSG). Spec `2026-07-10-visibilidad-seo-aeo-geo-DISENO.md` (47 findings). **A1 ✅ · A2 ✅ [§184] · A3 ✅ [§187]**. **Auditoría GSC 17jul** (→ bitácora): el cuello NO es técnico — 27 págs "rastreada sin indexar" = juicio de valor. SIGUE: **B2 GBP** (mayor palanca local) · **A4** geo/FAQ (pide lat/lng del pin) · A5 feed ⏳precios · eventos `generate_lead`/`contact` + 2º flujo GA. Sitemap reenviado 17jul → revisar cobertura ~3-7d. 🔑 authuser=3. | 🟢 | B2/A4 |
| TODO-68 | **PLAN ÚNICO ERP v4** (SSoT spec 2026-07-04): F1·F2.0·F2.1·caja-tiempo-real ✅ (§172) → TODO-70 ✅ (§173) → F2.2 ✅ (§176) → **F2.4 apartados (TODO-39)** → 2.3 térmica → F3 inventario → carril D → F4-F6. D-1 apartados=SÍ · D-2 flete aparte. §11 = estrategia modelos. | 🟢 | F2.4 (TODO-39) |
| TODO-39 | **Apartados (F2.4)**: SPEC Decisión Fuerte HECHA (`specs/2026-07-09-f2-4-apartados-DISENO.md` + PROMPT-CONSEJO + mockup; comité/bóveda). Modelo: pedido `estado:apartado`+`turnoId:null`; anticipo=PASIVO segregado; 2 planos (tesorería/turno vs revenue→F4); stock=hold; IVA a la entrega; v1=pieza única/POS. Cancelación resuelta (§7.1: reembolso 100%+saldo-a-favor). RBAC=cajera·20%/60d. **Pend: Daniel corre consejo externo + abogado CO → implementar.** | 🟡 | implementar |
| TODO-67 | **Normalizar fotos 0954/0994 en Storage** (§162.7): tras el fix del cruce, cada foto vive en la CARPETA del doc contrario (URLs funcionan; riesgo: borrar una pieza barre la foto de la otra). Re-subir cada foto desde el admin (2 min) o mover objetos. | 🔲 | menor |
| TODO-47 | **Verdad de marca (riesgo SIC)** — confirmar con Kary qué es REAL y retirar lo no comprobable (equipo, certificaciones, cifras, envíos, horario). Financiación ✅ (NO ADDI, solo Wompi 4 cuotas 0%). Detalle → §133.2(A) · `[[feedback_no_demo_en_index]]`. | 🔲 | Kary |
| TODO-48 | **Reseñas reales** — conectar `reviews` aprobadas → Nosotros + gestión admin. | 🔲 | feature |
| TODO-50 | **Catálogo de lujo** — imagen real + filtros gema/tipo + badges. Detalle → §133.2(B/C). (Taxonomía=TODO-57.) | 🔲 | tras TODO-44 |
| TODO-71 | **Endurecer gates del cerebro (cross-repo, §175)**: (a) resolver `[[feedback_*]]` vs memoria del harness (portan autorizaciones; HUECO B); (b) `ssotFacts` / reducir dup 05↔10 (check #8 inerte, HUECO C); (c) Sonda 5 `auditoria-cerebro`. → cars-operador. | 🔲 | cars-operador |
| TODO-57 | **Modelo GEMA** (§150-§151). HECHO: fundación+form+backfill 32/32+JSON-LD (test 9/9). **Pend**: `settings/gems`+bake · filtros (TODO-50) · live form. D.0: `badgeGem`/`gemFilterIds` fuera de `PUBLIC_SPEC_KEYS` (`generate-pieces.mjs:676`) → whitelist con Bloque D. SSoT → spec. | 🟡 | D.0 (whitelist gema) |
| TODO-76 | **F-IA-2 + DEPURACIÓN (INTERINATO Opus 4.8)** — spec `.../2026-07-10-f-ia-2-DISENO.md`. **B0·B1·B2·B3·B4·B5 ✅ → CODE-COMPLETE** (SW v93/APP v53; checklist con commits en la spec). B5 = Salud legible + "Cierre de mes" in situ (D4) + microcopy GLOBAL (SOLO texto; encolados+desvíos → spec notas B5). CERO functions/dinero nuevo. ⏳ validar B1-B5 funcional-con-sesión (deploy+login). `[[feedback_reorganizar_no_es_depurar]]` | 🟢 | Fable: auditar `[OPUS-4.8]` + validar vivo |
> ✅ **Cerrados** (→ ADRs/`99`): TODO-75 (§183; síntesis `mineria-recursos-2026-07-10.md`; n8n/Canva-lote PARQUEADOS) · 73 (§179) · 74 (§178) · 72 (§177) · 41 (§176) · 70 (§173) · 69 (§172) · 37/65/63/49/42/66/64/21/40/32 + 62-44. Pend Daniel: fotos IA.

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": F1✅ · F2 hardening (Tier C pend) · F3 CRM✅ · Fase M M0-M6✅. Charter → `50-ARQUITECTURA`.

---

## 📝 Bitácora (efímera)

> 2026-07-17 · **[OPUS-4.8] Auditoría GSC + GBP** (TODO-35 · B2 · skill `maps-gbp-local`). **GSC**: 9 indexadas / **27 "rastreada: actualmente sin indexar"** = juicio de VALOR de Google, NO bloqueo técnico (las rastrea a diario; casi todas `/pieza/*`) · 2 noindex · 0 404. Sitemap **REENVIADO** (leído 10jul=37; hoy 52). Producto: 17 no válidas por falta `price` → **NO bloquea indexación, solo el rich snippet** (docs Google); review/rating opcionales → **NO inventar**. CWV sin datos. **L**: "solicitar indexación" pieza-a-pieza NO sirve contra "rastreada sin indexar" (ya la rastreó). **GBP**: verificado 100%, cat "Joyería", **85 reseñas ★5,0** · **74 RESPONDIDAS (87%) / 11 sin responder** (CONTADO 9 págs × 10, suma 85 = cuadra con el contador público; págs 3-9 = 10/10 respondidas). Las 11 son todas RECIENTES → disciplina de respuesta ya existe, solo falta ponerse al día. Perfil sin tocar 6 sem (pide fotos/posts mensuales); reseñas mixtas es/en → **turista anglo** (¿SEO solo-es deja plata?); **las 85 NO están en la web** → TODO-48 SUBE. ⚠️ NO `aggregateRating` con reseñas de Google (3º, contra política). **A4 geo ✅** (10.4251642,-75.5492068 · `/g/11z12mf6kd`) horneado, deploy `d1015f2`. Palancas: responder reseñas · reseñas en web · GBP fresco · precios · enlaces.
> 2026-07-17 · **[OPUS-4.8] Journal ✅ §186** (visual+CMS colocación, v95) **· §187** (indexable + Article, v96).
> 2026-07-10 · **[OPUS-4.8] F-IA-2 B0-B5 ✅ CODE-COMPLETE** (SW v93; ⏳ funcional-con-sesión; Fable audita). **[FABLE-5] §181-183 prod · 1ª APPROVED ✅**. `[[feedback_opus_interino]]`
> **Pend Daniel/no-gate** (→ ADRs §165-171): cartera migrada (v5 §8) · consejo+abogado apartados (TODO-39) · instructivo Kary · push A.6 · TODO-67 fotos · abogado CO. ADC gcloud caducado — firebase CLI auth OK. **Precios = paso FINAL.**
