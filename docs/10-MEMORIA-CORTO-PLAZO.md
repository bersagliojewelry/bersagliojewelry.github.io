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
| TODO-78 | **F-TESORERÍA — SPEC CERRADA, lista para Opus**: `docs/superpowers/specs/2026-07-18-f-tesoreria-DISENO.md` (D1-D9 + **§0.6 V1-V16 comité vinculantes** + B0-B6 + tests) + PROMPT-CONSEJO (mismo dir) + mockup (artifact 🏦). **Gates**: B0 = lista real de cuentas de Kary · **B1 NO arranca sin consejo externo incorporado** · V1 = zona caliente R3. | 🟢 | Daniel: cuentas + consejo |
| TODO-77 | **SHARD de `30`** (§G.5) — **SUBE (§192)**: el tope duro (44000) ya BLOQUEÓ la captura normal de M-23 (hubo que micro-podar). Extraer categoría a hija (ojo: L-81/1022c tiene su detalle SOLO en `30` → mover, no recortar). Sesión fresca. | 🔲 | poda 30 |
| TODO-07 | **Contenido real web**: reseñas Maps (Nosotros), Films, feed Redes (`home-media.js`). | 🔲 | cliente entrega datos |
| TODO-08 | **Hardening Fase 2**: Tier A ✅; pend. CSP/reglas/claims (Tier B/C) → `41-SEGURIDAD §1.5` | 🟡 | Tier B = emulador+deploy gated |
| TODO-09 | **Fase M** M0→M6 ✅ EN PROD (§78-§80); ACUERDOS R1-R5+A8 GATEADOS/inertes — encender=Daniel. Restan: M7·M2c·ASESOR/RBAC (19). | 🟡 | encender R6 |
| TODO-14 | **App Check: MONITOREO; Enforce DIFERIDO** (Daniel: sin flujo alto el monitoreo no es representativo → activar SOLO con tráfico alto). Reparado §58. | ⏸️ | flujo alto |
| TODO-17 | **Toda captura → CRM**: contacto→Bandeja ✅; falta newsletter (`addSubscription`→`subscriptions`). ⚠️ **SUBE (§189)**: hoy el email del suscriptor solo vive en `localStorage` del visitante → **el lead se PIERDE**. El evento `bj:email-subscribed` ya lleva el email en `detail` listo para engancharlo. | 🔲 | tras App Check |
| TODO-18 | **Plan operación integral §57**: semana 1 + 9 decisiones de Daniel + compuerta de adopción + campaña cartera → bóveda | 🟡 | Daniel (dec. 1-9) |
| TODO-33 | **Panel admin "tipo app"** — DISEÑADO (`50 §5`); A3 menú+VT ✅ (v29); pend. esqueletos/prefetch/fonts/VT; router SPA CONGELADO. PAUSADO. | 🟡 | tras demo |
| TODO-22/29 | Kernel → cars-operador (L-31): gate-de-git en linter (H-06) · kernel lea `### L-NN` de `3*-LECCIONES*` (hoy M-06). | 🔲 | cars-operador |
| TODO-23 | **Frase canónica del gate de DINERO** (H-18): Claude=gate experto; Kary=smoke no bloqueante. → Gemini. | 🔲 | Gemini |
| TODO-28 | **Correcciones web** F1-F5 ✅ EN PROD (§93-§98). Pend: C1 (Daniel) · responsive fino. | 🟡 | C1 |
| TODO-35 | **Visibilidad SITE-WIDE** (SSoT → spec `2026-07-10-visibilidad-seo-aeo-geo-DISENO.md`, 47 findings). **A1·A2 §184 · A3 §187 · A4 §188 · B2 GBP §190 ✅**. Cuello real: 27 págs "rastreada sin indexar" = juicio de VALOR, no técnico (FAQPage retirado §188.7). SIGUE: **TODO-48 reseñas en web** · FAQ visible (Daniel: solo verificable) · A5 ⏳precios · GBP posts · enlaces. 🔑 authuser=3. | 🟢 | TODO-48 / FAQ |
| TODO-68 | **PLAN ÚNICO ERP v4** (SSoT = spec 2026-07-04, incl. D-1/D-2 + §11 modelos): F1·F2.0·F2.1·caja ✅ (§172) → 70 ✅ (§173) → F2.2 ✅ (§176) → **F2.4 apartados (TODO-39)** → 2.3 térmica → F3 inventario → carril D → F4-F6. | 🟢 | F2.4 (TODO-39) |
| TODO-39 | **Apartados (F2.4)**: SPEC Decisión Fuerte HECHA = **SSoT** (`docs/superpowers/specs/2026-07-09-f2-4-apartados-DISENO.md` + PROMPT-CONSEJO + mockup; comité/bóveda): modelo, anticipo=pasivo segregado, 2 planos, IVA a la entrega, cancelación §7.1, RBAC cajera 20%/60d. **Pend: Daniel corre consejo externo + abogado CO → implementar.** | 🟡 | implementar |
| TODO-67 | **Normalizar fotos 0954/0994 en Storage** (§162.7): tras el fix del cruce, cada foto vive en la CARPETA del doc contrario (URLs funcionan; riesgo: borrar una pieza barre la foto de la otra). Re-subir cada foto desde el admin (2 min) o mover objetos. | 🔲 | menor |
| TODO-47 | **Verdad de marca (riesgo SIC)** — confirmados por Daniel (17jul): ✅ garantía de por vida (→§191) · ✅ certificados autenticidad · ✅ reseñas familiares · ✅ platino (2º; ppal oro 18K) · ✅ oro por peso. **⚠️ CIFRAS SIN CUADRAR**: home 40+/**5.000+** vs Nosotros-en-vivo (Firestore) **43·desde-1983/+12.000** → mismatch de PIEZAS; defaults de código VIEJOS (13/2013/1.200/equipo antiguo — NO tocados, esperan cifras canónicas de Kary). **Sin verificar**: certificaciones (Jewelers of America 2020 · RJC · Muzo Origin) = claims de terceros verificables. Guard anti-demo ya cubre `js/pages/` (testimonios). → §191.7 · `[[feedback_no_demo_en_index]]`. | 🔲 | Kary: cifras+certs |
| TODO-48 | **Reseñas reales en la web** — espacio EXISTE (`nosotros.js §10`, hide-when-empty; Firestore `[]`; default sin fakes). 85 ★5,0 reales en GBP. Falta: curar + poblar (colección `reviews` con reglas hechas). ⚠️ arista legal de republicar Google → validar. | 🔲 | curaduría + legal |
| TODO-50 | **Catálogo de lujo** — imagen real + filtros gema/tipo + badges → §133.2(B/C). (Taxonomía=57.) | 🔲 | tras 44 |
| TODO-71 | **Endurecer gates del cerebro (cross-repo, §175)**: (a) `[[feedback_*]]` vs memoria del harness (HUECO B); (b) `ssotFacts` / dup 05↔10 (check #8 inerte, HUECO C); (c) Sonda 5 `auditoria-cerebro`. | 🔲 | cars-operador |
| TODO-57 | **Modelo GEMA** (§150-§151; SSoT → spec). HECHO: fundación+form+backfill 32/32+JSON-LD (9/9). **Pend**: `settings/gems`+bake · filtros (TODO-50) · live form · D.0 = `badgeGem`/`gemFilterIds` fuera de `PUBLIC_SPEC_KEYS` (`generate-pieces.mjs:676`) → whitelist. | 🟡 | D.0 (whitelist gema) |
> ✅ **Cerrados** (detalle → ADRs/`99` vía `00-INDICE`): TODO-75 (§183; n8n/Canva-lote PARQUEADOS) · 73 (§179) · 74 (§178) · 72 (§177) · 41 (§176) · 70 (§173) · 69 (§172) · 37/65/63/49/42/66/64/21/40/32 + 62-44. Pend Daniel: fotos IA.

---

## 📝 Bitácora (efímera)

> 2026-07-18 · **[FABLE-5]** Sinapsis inmob §33-§37: liderazgo ✅ · 15 skills sync (paid-ads/ad-creative v2.2/2.8) · import cars ⛔ tope 30 (TODO-77).
> 2026-07-17 · **[OPUS-4.8] Jornada SEO + verdad-de-marca → ADRs §188-§191** (PROD, SW v97): og:type + FAQPage retirado §188 · 🔴 PII a GA4 cortada §189 (**TODO-17 SUBE**) · GBP 85/85 §190 · garantía de por vida §191. Palancas SEO: TODO-48 · FAQ visible · GBP fresco · enlaces.
> 2026-07-18 · **[FABLE-5] F-TESORERÍA DISEÑADA → TODO-78** (spec + comité ×3 con 2 P0 cazados en el borrador: pata bancaria de consignación V1 · GMF irrepresentable V7 · crudos en bóveda · mockup artifact · prompt-consejo listo para Daniel). Patrón F-IA-2: Opus ejecuta B0-B6 sin re-decidir.
> 2026-07-18 · **[FABLE-5] AUDITORÍA TITULAR + Nivel-2 → §192** (interinato: calidad de titular, B1-B5 validado vivo, 2 fix APP v54 · M-23 reincidente · propuestas kernel → TODO-71). deepAudit 18-jul.
> 2026-07-17 · **[OPUS-4.8] Guard anti-demo → `js/pages/*-defaults`** (12/12). Destapó **cifras sin cuadrar** (TODO-47): home 5.000+ ≠ Nosotros-en-vivo 12.000/43 años; default viejo. NO toqué números (esperan canónicas + verificar certs JA/RJC/Muzo).
> 2026-07-17 · **[OPUS-4.8]** Journal §186/§187 · entregable ALTORRA (`docs/superpowers/specs/2026-07-17-aprendizajes-SEO-AEO-GEO-para-skills.md`). **[FABLE-5] §181-183 prod · 1ª APPROVED ✅**. `[[feedback_opus_interino]]`
> **Pend Daniel/no-gate**: llenar "Datos del negocio" en el panel (§192 I-03; datos = identidad LEGAL-08) · marcar 7 avisos test-era en Salud (I-04) · consejo+abogado apartados (39) · instructivo Kary · push A.6 · fotos (67). ADC gcloud caducado (firebase CLI OK). **Precios = paso FINAL.**
