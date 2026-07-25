# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🟣 **RELEVO → LA NUEVA SESIÓN ARRANCA EN (a) E2E de UI en prod, (b) B5·V17** (zona caliente: test PRIMERO). **F-TESORERÍA (TODO-78) · B0-B4 + B5(D6·V1·V18) ✅ EN PROD (2026-07-24: merge a main + `firebase deploy` de functions/reglas/índices + seed de las 2 virtuales).** ⚠️ **E2E con login PENDIENTE**: se verificó el DEPLOY (9 CFs listadas, reglas OK, docs creados), NO la pantalla. **Hecho**: B0-B3 · B4 (Bandeja "Tesorería" + badge · "Plata total" en Hoy · V9 socias) · D6 (editor de reglas) · V1 · V18. Suites verdes (teso 31/31 · caja 38/38).
>
> **B5 EN CURSO (costuras, §6)**: D6 ✅ · V1 ✅ · V18 ✅. **SIGUE `V17`** (abono en EFECTIVO → pata en `movsCaja` tipo nuevo `abono_cartera`, EXIGE turno abierto; idempotencia por-libro V4) → D9 (abono→`cuentaId`, flag off hasta verde) + microcopy + cuadre diario 3:30 en Salud. **⚠️ Zona caliente R3 = test PRIMERO. Pista: la CF del abono del CRM aún NO está localizada** (buscar el escritor de `movimientos` de cartera). **Mapa de ejecución + precisiones → spec §9.** Luego B6 (rompimiento adversarial read-only + Chrome holístico) → **DEPLOY MANUAL del bundle** (`firebase deploy --only firestore:rules,firestore:indexes,functions` + seed virtuales prod; SW ya v98) + E2E holístico Chrome.
>
> **Protocolo por sesión**: `asesor-critico-honesto` + `caza-bugs` + `auditoria-financiera`; spec COMPLETA (§0.8>§0.7>§0.6>cuerpo, sin re-decidir; TDD en el MISMO commit). Modelo lo decide Daniel (`/model`): Opus → + `opus-interino-protocolo`, marca **`[OPUS-5]`** (desde 2026-07-24); Fable → `[FABLE-5]`. ⚠️ B2-B4 quedaron firmados `[OPUS-4.8]` por error → auditar por AMBOS (→ `05`).
>
> **🧭 Roadmap** (detalle → `05`): …F-IA-2 ✅ → **F-TESORERÍA (B5)** → F-COMPRAS → F-REPORTES → apartados → limpieza → rompimiento → lanzamiento. _MCP Firebase=prod · push+merge a main=Claude · consejo read-only · valida en Chrome._ `[[project_comercio_pagos]]`

---

## 📋 Pendientes abiertos (TODO-NN) — ledger único

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-03/04 | (baja) headers `99`→`## NN.` · anomalías 🔧 en `skills/` | 🔲 | baja |
| TODO-78 | **F-TESORERÍA** (SSoT spec `2026-07-18-f-tesoreria-DISENO.md`, prevalencia §0.8>§0.7>§0.6>cuerpo; zonas calientes V1/V17; legal Daniel → `42-LEGAL §7`). **B0-B4 ✅ en código · SIGUE B5 → B6 → deploy bundle+E2E** (detalle → Foco). | 🟢 | B5 |
| TODO-77 | **SHARD de `30`** (§G.5) — **SUBE (§192)**: el tope duro (44000) ya BLOQUEÓ la captura normal de M-23 (hubo que micro-podar). Extraer categoría a hija (ojo: L-81/1022c tiene su detalle SOLO en `30` → mover, no recortar). Sesión fresca. | 🔲 | poda 30 |
| TODO-07 | **Contenido real web**: reseñas Maps (Nosotros), Films, feed Redes (`home-media.js`). | 🔲 | cliente entrega datos |
| TODO-08 | **Hardening Fase 2**: Tier A ✅; pend. CSP/reglas/claims (Tier B/C) → `41-SEGURIDAD §1.5` | 🟡 | Tier B = emulador+deploy gated |
| TODO-09 | **Fase M** M0→M6 ✅ EN PROD (§78-§80); ACUERDOS R1-R5+A8 GATEADOS/inertes — encender=Daniel. Restan: M7·M2c·ASESOR/RBAC (19). | 🟡 | encender R6 |
| TODO-14 | **App Check: MONITOREO; Enforce DIFERIDO** (Daniel: sin flujo alto el monitoreo no es representativo → activar SOLO con tráfico alto). Reparado §58. | ⏸️ | flujo alto |
| TODO-17 | **Toda captura → CRM**: contacto→Bandeja ✅; falta newsletter (`addSubscription`→`subscriptions`). ⚠️ **§189**: el email del suscriptor solo vive en `localStorage` → **el lead se PIERDE**; el evento `bj:email-subscribed` ya lo lleva en `detail`. | 🔲 | tras App Check |
| TODO-18 | **Plan operación integral §57**: semana 1 + 9 decisiones de Daniel + compuerta de adopción + campaña cartera → bóveda | 🟡 | Daniel (dec. 1-9) |
| TODO-33 | **Panel admin "tipo app"** — DISEÑADO (`50 §5`); A3 menú+VT ✅ (v29); pend. esqueletos/prefetch/fonts; router SPA CONGELADO. PAUSADO. | 🟡 | tras demo |
| TODO-22/29 | Kernel → cars-operador (L-31): gate-de-git en linter (H-06) · kernel lea `### L-NN` de `3*-LECCIONES*` (hoy M-06). | 🔲 | cars-operador |
| TODO-23 | **Frase canónica del gate de DINERO** (H-18): Claude=gate experto; Kary=smoke no bloqueante. → Gemini. | 🔲 | Gemini |
| TODO-28 | **Correcciones web** F1-F5 ✅ EN PROD (§93-§98). Pend: C1 (Daniel) · responsive fino. | 🟡 | C1 |
| TODO-35 | **Visibilidad SITE-WIDE** (SSoT spec `2026-07-10-visibilidad-seo-aeo-geo-DISENO.md`, 47 findings). A1·A2 §184·A3 §187·A4 §188·B2 GBP §190 ✅. Cuello: 27 págs "rastreada sin indexar" = juicio de VALOR (FAQPage retirado §188.7). SIGUE: TODO-48 reseñas · FAQ visible (solo verificable) · A5 ⏳precios · GBP posts · enlaces. 🔑 authuser=3. | 🟢 | TODO-48 / FAQ |
| TODO-68 | **PLAN ÚNICO ERP v4** (SSoT spec 2026-07-04 + §11 modelos): F1·F2.0·F2.1·caja·70·F2.2 ✅ (§172-§176) → **F2.4 apartados (TODO-39)** → 2.3 térmica → F3 inventario → carril D → F4-F6. | 🟢 | F2.4 (TODO-39) |
| TODO-39 | **Apartados (F2.4)**: SPEC Decisión Fuerte = **SSoT** (`docs/superpowers/specs/2026-07-09-f2-4-apartados-DISENO.md`): anticipo=pasivo segregado, IVA a la entrega, cancelación §7.1, RBAC cajera 20%/60d. **Pend: Daniel corre consejo externo + abogado CO → implementar.** | 🟡 | implementar |
| TODO-67 | **Normalizar fotos 0954/0994 en Storage** (§162.7): tras el fix del cruce, cada foto vive en la CARPETA del doc contrario (URLs funcionan; riesgo: borrar una pieza barre la foto de la otra). Re-subir cada foto desde el admin (2 min) o mover objetos. | 🔲 | menor |
| TODO-47 | **Verdad de marca (riesgo SIC)** — Daniel 17jul: ✅ garantía de por vida (§191)·certificados·reseñas familiares·platino (2º, ppal oro 18K)·oro por peso. **⚠️ CIFRAS SIN CUADRAR**: home 40+/**5.000+** vs Nosotros-vivo **43·desde-1983/+12.000** → mismatch piezas; defaults código VIEJOS (esperan cifras canónicas de Kary). **Sin verificar**: certificaciones (Jewelers of America 2020·RJC·Muzo Origin) = claims de 3os. Guard anti-demo cubre `js/pages/`. → §191.7 · `[[feedback_no_demo_en_index]]`. | 🔲 | Kary: cifras+certs |
| TODO-48 | **Reseñas reales en la web** — espacio EXISTE (`nosotros.js §10`, hide-when-empty; Firestore `[]`; default sin fakes). 85 ★5,0 reales en GBP. Falta: curar + poblar (colección `reviews` con reglas hechas). ⚠️ arista legal de republicar Google → validar. | 🔲 | curaduría + legal |
| TODO-50 | **Catálogo de lujo** — imagen real + filtros gema/tipo + badges → §133.2(B/C). (Taxonomía=57.) | 🔲 | tras 44 |
| TODO-71 | **Endurecer gates del cerebro (cross-repo, §175)**: (a) `[[feedback_*]]` vs memoria del harness (HUECO B); (b) `ssotFacts` / dup 05↔10 (check #8 inerte, HUECO C); (c) Sonda 5 `auditoria-cerebro`. | 🔲 | cars-operador |
| TODO-57 | **Modelo GEMA** (§150-§151; SSoT spec). HECHO: fundación+form+backfill 32/32+JSON-LD. **Pend**: `settings/gems`+bake · filtros (TODO-50) · live form · D.0 whitelist `badgeGem`/`gemFilterIds` en `PUBLIC_SPEC_KEYS` (`generate-pieces.mjs:676`). | 🟡 | D.0 (whitelist gema) |
> ✅ **Cerrados** (→ ADRs vía `00-INDICE`): 75 (§183; n8n/Canva PARQUEADOS) · 73·74·72·41·70·69 (§172-§179) · 37/65/63/49/42/66/64/21/40/32 + 62-44. Pend Daniel: fotos IA.

---

## 📝 Bitácora (efímera)

> 2026-07-24 · **[OPUS-5] B5: D6 ✅ · V1 ✅ (P0) · V18 ✅** (TDD estricto; el rojo de V1 REPRODUJO el P0 en vivo). D6 = "Reglas del sistema" editable owner (whitelist+rangos+audit). V1/V18 = frontera bóveda↔banco: la MISMA tx escribe la pata (`{opId}-teso`, fuente SISTEMA); cuenta inválida ⇒ aborta TODO; V4 por-libro (el replay crea la faltante); V1 retrocompatible sin `cuentaId`, V18 la EXIGE (flujo nuevo). Gates: teso **31/31** · **caja 38/38 SIN regresión** · resto verde. **Detalle → spec §9 + commits.**
> 2026-07-23 · **B4 ✅**: Bandeja "Tesorería" (aprobar/rechazar) + badge · "Plata total" en Hoy (`sumaSaldosReales`) · V9 socias (`throughputAnio`). **Dudas (R7)**: V9 informativo (tope 200 → "o más"), NO cifra fiscal · rechazo por `prompt` · E2E vivo → deploy (L-05).
> 2026-07-18/23 · **B0-B3 ✅** (detalle → Foco/commits): B0 fundación [OPUS] (`servicio_publico` retirado V20) · B1+auditoría-B0 [FABLE] · B2 página · B3 cuadre (V19). Auditoría interinato #3 → §192.
> **Pend Daniel/no-gate**: llenar "Datos del negocio" en el panel (§192 I-03; datos = identidad LEGAL-08) · marcar 7 avisos test-era en Salud (I-04) · consejo+abogado apartados (39) · instructivo Kary · push A.6 · fotos (67). ADC gcloud caducado (CLI OK). **Precios = paso FINAL.**
