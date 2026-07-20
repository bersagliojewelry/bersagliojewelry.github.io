# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🟣 **INTERINATO #4 — OPUS 4.8 OPERA** (abierto 2026-07-18; #3 F-IA-2 cerrado y auditado §192). **Al arrancar sesión nueva: cargar SIEMPRE `opus-interino-protocolo` + `asesor-critico-honesto` + `caza-bugs` (+ `auditoria-financiera` §3.3, es dinero).** **FRENTE ÚNICO = F-TESORERÍA (TODO-78)** con spec cerrada: leer `docs/superpowers/specs/2026-07-18-f-tesoreria-DISENO.md` COMPLETA (prevalencia §0.8>§0.7>§0.6>cuerpo) y ejecutar **B0→B6 sin re-decidir** (R2: TDD por escenario en el MISMO commit; R3 zonas calientes bóveda-V1/caja-V17 = test primero; R4 validación viva). **PROGRESO: B0 ✅ (código, emulador verde) → SIGUE B1 (núcleo de dinero: CFs 1-6 + trigger + tests §5.1-8).** Decisiones Fuertes/dinero nuevo distinto → cola del titular. Fable audita al volver por `git log --grep="[OPUS-4.8]"`.
>
> **🧭 Roadmap** (detalle → `05`): …F-IA-2 ✅ → **F-TESORERÍA (B0)** → F-COMPRAS → F-REPORTES → apartados → limpieza → rompimiento → lanzamiento. _MCP Firebase=prod · push+merge a main=Claude · consejo read-only · valida en Chrome._ `[[project_comercio_pagos]]`

---

## 📋 Pendientes abiertos (TODO-NN) — ledger único

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-03/04 | (baja) headers `99`→`## NN.` · anomalías 🔧 en `skills/` | 🔲 | baja |
| TODO-78 | **F-TESORERÍA — SPEC CERRADA, Opus puede ARRANCAR YA**: `docs/superpowers/specs/2026-07-18-f-tesoreria-DISENO.md` (D1-D9 · §0.6 comité · §0.7 consejo ✅ · **§0.8 directiva del dueño: CERO seed, Kary carga sus cuentas por la UI; gate = confiabilidad, no datos** — prevalece §0.8>§0.7>§0.6>cuerpo · B0-B6 · 20 tests) + mockup 🏦. Zonas calientes R3: V1/V17. Acción legal Daniel → `42-LEGAL §7`. **B0 ✅** (core puro `computeSaldoCuenta` + reglas + índices + seed 2 virtuales; 15+245+2 tests verde emulador; NO desplegado a prod aún — L-22). SIGUE B1. | 🟢 | Opus: B1 |
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

> 2026-07-18 · **[OPUS-4.8] F-TESORERÍA B0 ✅** (interinato #4, TDD R2): núcleo puro `functions/tesoreria-core.js` (`computeSaldoCuenta` recompute D5 + seed 2 virtuales) + reglas `cuentasTesoreria`/`movimientosTesoreria` CF-only + 3 índices. Tests: `test:tesoreria` 15/15 · `test:rules` 245/245 (0 regresión) · `test:tesoreria:integration` 2/2. Resolución de spec: `servicio_publico` RETIRADO (V20>cuerpo). **Pend deploy MANUAL** (reglas+índices+seed prod, L-22) al llegar B2. SIN cache bump (no toca shell).
> 2026-07-18 · **[FABLE-5]** Sinapsis inmob §33-§37: liderazgo ✅ · 15 skills sync (paid-ads/ad-creative v2.2/2.8) · import cars ⛔ tope 30 (TODO-77).
> 2026-07-18 · **[FABLE-5] AUDITORÍA TITULAR + Nivel-2 → §192** (interinato: calidad de titular, B1-B5 validado vivo, 2 fix APP v54 · M-23 reincidente · propuestas kernel → TODO-71). deepAudit 18-jul.
> **Pend Daniel/no-gate**: llenar "Datos del negocio" en el panel (§192 I-03; datos = identidad LEGAL-08) · marcar 7 avisos test-era en Salud (I-04) · consejo+abogado apartados (39) · instructivo Kary · push A.6 · fotos (67). ADC gcloud caducado (firebase CLI OK). **Precios = paso FINAL.**
