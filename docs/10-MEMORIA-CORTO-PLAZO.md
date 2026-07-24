# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🟣 **F-TESORERÍA (TODO-78) · B0-B4 ✅ EN CÓDIGO (no en prod)**. Daniel: desplegar el BUNDLE coherente al final (no bloque suelto). **Hecho**: B0 (auditado) · B1 (6 CFs+trigger+espejo) · B2 (página "Cuentas y bancos") · B3 (cuadre "Cuadrar mes") · **B4 (Bandeja sección "Tesorería" aprobar/rechazar-con-motivo + `aprob-badge` suma · "Plata total" en Hoy = cajón+bóveda+cuentas vía `sumaSaldosReales` · V9 socias "pasó por esta cuenta este año")**. **Falta gate E2E vivo del bundle** → DEPLOY + login (L-05).
>
> **SIGUE B5 (costuras finales, §6)**: D9 (abono del CRM→cuenta, flag off hasta test verde) + D6 (editor "Reglas del sistema" en Negocio y equipo, owner-only) + microcopy global + extensión del cuadre diario 3:30 en Salud. **⚠️ Zonas calientes R3 = test PRIMERO** (V1 bóveda↔banco · V17 abono efectivo→caja · V18 retiro de banco; **mapa de ejecución + orden sugerido D6→V1→V18→V17→D9 → spec §9** [OPUS mapeó 2026-07-23]). Luego B6 (rompimiento adversarial read-only + Chrome holístico) → **DEPLOY MANUAL del bundle** (`firebase deploy --only firestore:rules,firestore:indexes,functions` + seed virtuales prod; SW ya v98) + E2E holístico Chrome.
>
> **Protocolo por sesión**: `asesor-critico-honesto` + `caza-bugs` + `auditoria-financiera`; spec COMPLETA (§0.8>§0.7>§0.6>cuerpo, sin re-decidir; TDD en el MISMO commit). Modelo lo decide Daniel (`/model`): Opus → + `opus-interino-protocolo`, marca **`[OPUS-5]`** (desde 2026-07-24); Fable → `[FABLE-5]`. ⚠️ B2-B4 quedaron firmados `[OPUS-4.8]` por error → auditar por AMBOS (→ `05`).
>
> **🧭 Roadmap** (detalle → `05`): …F-IA-2 ✅ → **F-TESORERÍA (B4)** → F-COMPRAS → F-REPORTES → apartados → limpieza → rompimiento → lanzamiento. _MCP Firebase=prod · push+merge a main=Claude · consejo read-only · valida en Chrome._ `[[project_comercio_pagos]]`

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
| TODO-33 | **Panel admin "tipo app"** — DISEÑADO (`50 §5`); A3 menú+VT ✅ (v29); pend. esqueletos/prefetch/fonts/VT; router SPA CONGELADO. PAUSADO. | 🟡 | tras demo |
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
> ✅ **Cerrados** (detalle → ADRs/`99` vía `00-INDICE`): TODO-75 (§183; n8n/Canva-lote PARQUEADOS) · 73 (§179) · 74 (§178) · 72 (§177) · 41 (§176) · 70 (§173) · 69 (§172) · 37/65/63/49/42/66/64/21/40/32 + 62-44. Pend Daniel: fotos IA.

---

## 📝 Bitácora (efímera)

> 2026-07-23 · **[OPUS-4.8] B4 ✅ en código**: Bandeja sección "Tesorería" (aprobar/rechazar-con-motivo, patrón bóveda + `window.prompt`; `aprob-badge` suma pendientes) · "Plata total" en Hoy (cajón+bóveda+Σcuentas vía `sumaSaldosReales`, inv.2) · V9 socias "pasó por esta cuenta este año" (`throughputAnio`). Sin tocar functions/ (usa CFs de B1). Gates: build verde · teso-vista 8/8 · paridad 5/5. **Dudas declaradas (R7)**: (a) V9 throughput = Σ|monto| firmes del año sobre `_movs` (tope 200) = informativo, NO cifra fiscal; si >200 movs/año undercuenta → señala "o más". (b) rechazo por `window.prompt` (patrón `handleReabrir`), no modal. (c) E2E vivo deferido al deploy (L-05). SW v98/APP v55.
> 2026-07-18/23 · **B0-B3 ✅ en código** (detalle → Foco): B0 [OPUS] fundación (core/reglas/índices/seed; `servicio_publico` retirado V20) · B1+auditoría-B0 [FABLE] (6 CFs+trigger+espejo+paridad; 25 ticks legacy, kernel v1.6) · B2 [OPUS] página "Cuentas y bancos" · B3 [OPUS] cuadre "Cuadrar mes" (V19). Gates offline verde (integración 15/15). Auditoría interinato #3 → §192.
> **Pend Daniel/no-gate**: llenar "Datos del negocio" en el panel (§192 I-03; datos = identidad LEGAL-08) · marcar 7 avisos test-era en Salud (I-04) · consejo+abogado apartados (39) · instructivo Kary · push A.6 · fotos (67). ADC gcloud caducado (CLI OK). **Precios = paso FINAL.**
