# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🟣 **INTERINATO #3 — OPUS 4.8 OPERA** (desde 2026-07-10). Cargar SIEMPRE `opus-interino-protocolo` + `asesor-critico-honesto` + `caza-bugs`. **Frentes**: TODO-76 (F-IA-2 ✅ code-complete) **+ TODO-35 visibilidad/SEO** (ampliado por Daniel 17jul — la regla vieja "único frente = TODO-76" quedó superada). Decisiones Fuertes/dinero nuevo → cola del titular. Fable audita por `git log --grep="[OPUS-4.8]"`.
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
| TODO-17 | **Toda captura → CRM**: contacto→Bandeja ✅; falta newsletter (`addSubscription`→`subscriptions`). ⚠️ **SUBE (§189)**: hoy el email del suscriptor solo vive en `localStorage` del visitante → **el lead se PIERDE**. El evento `bj:email-subscribed` ya lleva el email en `detail` listo para engancharlo. | 🔲 | tras App Check |
| TODO-18 | **Plan operación integral §57**: semana 1 + 9 decisiones de Daniel + compuerta de adopción + campaña cartera → bóveda | 🟡 | Daniel (dec. 1-9) |
| TODO-33 | **Panel admin "tipo app"** — DISEÑADO (`50 §5`); A3 menú+VT ✅ (v29); pend. esqueletos/prefetch/fonts/VT; router SPA CONGELADO. PAUSADO. | 🟡 | tras demo |
| TODO-22/29 | Kernel → cars-operador (L-31): gate-de-git en linter (H-06) · kernel lea `### L-NN` de `3*-LECCIONES*` (shard sin stub, hoy M-06). | 🔲 | cars-operador |
| TODO-23 | **Frase canónica del gate de DINERO** (H-18): Claude=gate experto; Kary=smoke no bloqueante. → Gemini. | 🔲 | Gemini |
| TODO-28 | **Correcciones web** F1-F5 ✅ EN PROD (§93-§98). Pend: C1 (Daniel) · responsive fino. | 🟡 | C1 |
| TODO-35 | **Visibilidad SITE-WIDE** (SEO·AEO·GA4·GSC·Maps·SSG). Spec `2026-07-10-visibilidad-seo-aeo-geo-DISENO.md` (47 findings). **A1·A2 [§184] · A3 [§187] · A4 [§188] ✅** (cubeta A = COMPLETA salvo A5). Cuello real: 27 págs "rastreada sin indexar" = juicio de valor, NO técnico. ⚠️ FAQPage retirado (§188.7). SIGUE: **B2 GBP** (mayor palanca local) · **TODO-48 reseñas en web** · A5 feed ⏳precios · eventos `generate_lead`/`contact` + 2º flujo GA. Cobertura ~3-7d tras sitemap 17jul. 🔑 authuser=3. | 🟢 | B2 / Daniel-FAQ |
| TODO-68 | **PLAN ÚNICO ERP v4** (SSoT = spec 2026-07-04, incl. D-1/D-2 + §11 modelos): F1·F2.0·F2.1·caja ✅ (§172) → 70 ✅ (§173) → F2.2 ✅ (§176) → **F2.4 apartados (TODO-39)** → 2.3 térmica → F3 inventario → carril D → F4-F6. | 🟢 | F2.4 (TODO-39) |
| TODO-39 | **Apartados (F2.4)**: SPEC Decisión Fuerte HECHA = **SSoT** (`specs/2026-07-09-f2-4-apartados-DISENO.md` + PROMPT-CONSEJO + mockup; comité/bóveda): modelo, anticipo=pasivo segregado, 2 planos, IVA a la entrega, cancelación §7.1, RBAC cajera 20%/60d. **Pend: Daniel corre consejo externo + abogado CO → implementar.** | 🟡 | implementar |
| TODO-67 | **Normalizar fotos 0954/0994 en Storage** (§162.7): tras el fix del cruce, cada foto vive en la CARPETA del doc contrario (URLs funcionan; riesgo: borrar una pieza barre la foto de la otra). Re-subir cada foto desde el admin (2 min) o mover objetos. | 🔲 | menor |
| TODO-47 | **Verdad de marca (riesgo SIC)** — confirmar con Kary qué es REAL y retirar lo no comprobable (equipo, certificaciones, cifras, envíos, horario). Financiación ✅ (NO ADDI, solo Wompi 4 cuotas 0%). Detalle → §133.2(A) · `[[feedback_no_demo_en_index]]`. | 🔲 | Kary |
| TODO-48 | **Reseñas reales** — conectar `reviews` aprobadas → Nosotros + gestión admin. | 🔲 | feature |
| TODO-50 | **Catálogo de lujo** — imagen real + filtros gema/tipo + badges. Detalle → §133.2(B/C). (Taxonomía=TODO-57.) | 🔲 | tras TODO-44 |
| TODO-71 | **Endurecer gates del cerebro (cross-repo, §175)**: (a) `[[feedback_*]]` vs memoria del harness (HUECO B); (b) `ssotFacts` / dup 05↔10 (check #8 inerte, HUECO C); (c) Sonda 5 `auditoria-cerebro`. | 🔲 | cars-operador |
| TODO-57 | **Modelo GEMA** (§150-§151; SSoT → spec). HECHO: fundación+form+backfill 32/32+JSON-LD (9/9). **Pend**: `settings/gems`+bake · filtros (TODO-50) · live form · D.0 = `badgeGem`/`gemFilterIds` fuera de `PUBLIC_SPEC_KEYS` (`generate-pieces.mjs:676`) → whitelist. | 🟡 | D.0 (whitelist gema) |
| TODO-76 | **F-IA-2 + DEPURACIÓN (INTERINATO Opus 4.8)** — spec `.../2026-07-10-f-ia-2-DISENO.md` (**SSoT**: checklist+commits+notas B5+encolados). **B0-B5 ✅ CODE-COMPLETE** (SW v93/APP v53). CERO functions/dinero nuevo. ⏳ validar B1-B5 funcional-con-sesión (deploy+login). `[[feedback_reorganizar_no_es_depurar]]` | 🟢 | Fable: auditar `[OPUS-4.8]` + validar vivo |
> ✅ **Cerrados** (detalle → ADRs/`99` vía `00-INDICE`): TODO-75 (§183; n8n/Canva-lote PARQUEADOS) · 73 (§179) · 74 (§178) · 72 (§177) · 41 (§176) · 70 (§173) · 69 (§172) · 37/65/63/49/42/66/64/21/40/32 + 62-44. Pend Daniel: fotos IA.

---

## 📝 Bitácora (efímera)

> 2026-07-17 · **[OPUS-4.8] Auditoría GSC + GBP** (TODO-35 · B2 · skill `maps-gbp-local`). **Detalle+doctrina → spec visibilidad.** **GSC**: 9 indexadas / **27 "rastreada: sin indexar"** = juicio de VALOR (no técnico) · 2 noindex · 0 404 · sitemap reenviado (52) · 17 Producto no válidas (falta `price`, NO bloquea indexar) · CWV sin datos. **GBP**: verificado 100%, **85 reseñas ★5,0**, **74 respondidas / 11 NO** (contado). Perfil sin tocar 6 sem; reseñas es/en → ❓turista anglo; **las 85 NO están en la web** → **TODO-48 SUBE** (espacio ya existe: `nosotros.js` §10 `resenas.items` hide-when-empty; colección `reviews`+reglas hechas, SIN consumir). ⚠️ NO `aggregateRating` con reseñas de Google. **Palancas**: responder 11 · reseñas en web · GBP fresco · precios · enlaces.
> 2026-07-17 · **[OPUS-4.8] 🔴 fuga de PII a GA4 CORTADA → §189** (SW v97). Guard `stripPII` en `track()` (cuello único) + `test:analytics` 10/10 + verificado en vivo. Los eventos `generate_lead`/`contact` **YA existían** → ese pendiente era falso. **TODO-17 SUBE** (email solo en localStorage = lead perdido).
> 2026-07-17 · **[OPUS-4.8] A4 ✅ CERRADO → §188** (og:type=product). **FAQPage RETIRADO**: rich result muerto 07-may-2026 → la FAQ **visible** es CONTENIDO y choca con TODO-47. Meta-lección → ALTORRA §3.7 + skill.
> 2026-07-17 · **[OPUS-4.8] Journal ✅ §186** (visual+CMS colocación, v95) **· §187** (indexable + Article, v96).
> 2026-07-17 · **[OPUS-4.8] ENTREGABLE → ALTORRA** (harán skill SEO/AEO/GEO): `docs/superpowers/specs/2026-07-17-aprendizajes-SEO-AEO-GEO-para-skills.md`. **CORRIGE 3** del borrador 07-10: PreOrder-sin-price NO válido · keyword en NOMBRE del GBP = suspensión · "solicitar indexación" NO sirve contra "rastreada sin indexar". ❓cascada del hub = NO observada.
> 2026-07-10 · **[OPUS-4.8] F-IA-2 B0-B5 ✅ CODE-COMPLETE** (SW v93; ⏳ funcional-con-sesión; Fable audita). **[FABLE-5] §181-183 prod · 1ª APPROVED ✅**. `[[feedback_opus_interino]]`
> **Pend Daniel/no-gate** (→ ADRs §165-171): cartera migrada (v5 §8) · consejo+abogado apartados (TODO-39) · instructivo Kary · push A.6 · TODO-67 fotos · abogado CO. ADC gcloud caducado — firebase CLI auth OK. **Precios = paso FINAL.**
