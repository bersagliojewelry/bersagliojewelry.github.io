# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM + Fase M (M0→M6) EN PROD** (§47-§82). **🔄 RESET A CERO** (Daniel 2026-06-20): cartera/clientes históricos DESECHABLES. ⚙️ **OPUS 4.8 interino** (marcar `[OPUS-4.8]` · `feedback_opus_interino`).
>
> **🔚 SESIÓN CERRADA por contexto (970k/1M · 2026-06-27).** Hecho hoy: F1 inventario v3 DESPLEGADO (§131) + **32 piezas reales de TrueLab cargadas y EN VIVO** (§132).
> **🔜 PRÓXIMA SESIÓN — Daniel pide un FLUJO ACOTADO de EVALUACIÓN INTEGRAL** (diseño · frontend · backend · copywriting · marca · estructura): cazar y eliminar lo GENÉRICO, apropiar TODO a la voz de Bersaglio (leer **Nosotros** + index + journal + `siteContent`). Daniel: "hay muchas cosas que no he notado". Flujo ACOTADO `[[feedback_workflows_acotados]]` + W-11 si es Decisión/Diseño. Hallazgos concretos de Daniel → **TODO-44/45/46**. `[[feedback_voz_de_marca_no_generico]]`.
> _Mostrador EN PROD (§122-§130). Pagos §121 → `[[project_comercio_pagos]]`. Pruebas en vivo DIFERIDAS (§130.4). Deploy: reglas/functions = manual mío; merge a main = Daniel. **MCP Firebase = escritura prod** (gcloud sin cuenta · ADC sin permiso). Cola post-eval: F2 Wompi · TODO-41 · TODO-39 · TODO-33 · TODO-35._

---

## 📋 Pendientes abiertos (TODO-NN) — ledger único

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-03 | (Opcional) headers de `99` a formato numerado `## NN.` (hoy por fecha, válido) | 🔲 | baja |
| TODO-04 | (Opcional) anomalías 🔧 en `skills/` (formatos no-skill) | 🔲 | baja |
| TODO-07 | **Contenido real web**: reseñas Google Maps (Nosotros), Films, feed Redes (`js/data/home-media.js`, `js/pages/nosotros.js`) | 🔲 | cliente entrega datos |
| TODO-08 | **Hardening Fase 2**: Tier A ✅; pend. CSP/reglas/claims (Tier B/C) → `41-SEGURIDAD §1.5` | 🟡 | Tier B = emulador+deploy gated |
| TODO-09 | **Fase M** M0→M6 ✅ EN PROD (§78-§80); ACUERDOS R1-R5+A8 GATEADOS/inertes — encender=Daniel. Restan: M7·M2c·ASESOR/RBAC (TODO-19). | 🟡 | encender R6 (Daniel) |
| TODO-14 | **App Check: MONITOREO; Enforce DIFERIDO** (Daniel 2026-06-23: sin flujo alto el monitoreo no es representativo → activar SOLO con tráfico alto). Registro reparado (§58). | ⏸️ | esperar flujo alto |
| TODO-17 | **Toda captura → CRM**: contacto→Bandeja ✅; falta newsletter (`addSubscription`→`subscriptions`) | 🔲 | tras App Check |
| TODO-18 | **Plan operación integral §57**: semana 1 + 9 decisiones de Daniel + compuerta de adopción + campaña cartera → bóveda | 🟡 | Daniel (decisiones 1-9) |
| TODO-33 | **Panel admin "tipo app" (fluidez)** (Decisión Fuerte). DISEÑADO (comité ×4+Gemini, veredicto `50 §5`; CRUDO→bóveda). Fase 0: **A3 menú instantáneo ✅** (`655556d`, v29) + fix VT v28 ✅ EN VIVO; pend. esqueletos/paralelizar/prefetch-asset/self-host fonts/VT-al-final. Router falso-SPA CONGELADO salvo 🟥 gate seguridad (revalidar rol/ruta) + no-leak IoC. **PAUSADO por TODO-34 (urgente).** | 🟡 | reanudar tras demo |
| TODO-21 | **Revisión post-Fable de `[OPUS-4.8]`** (H-08): por riesgo (dinero §81 > seguridad §65/§66 > CMS > docs); ~50 commits | 🔲 | Fable vuelve |
| TODO-22 | **Gate-de-git en el linter** (H-06): que `brain:check` warne si el estado de deploy declarado diverge de git. Toca kernel ×3 → **cars-operador** (L-31). *§114: mitigado en parte al dejar de fijar el hash en `05`.* | 🔲 | cars-operador (kernel) |
| TODO-23 | **Frase canónica del gate de verificación de DINERO** (H-18): Claude experto = gate; Kary = smoke POST-deploy no bloqueante. Aporte a la pasada Gemini (cars consolida) | 🔲 | Gemini |
| TODO-28 | **Correcciones web** (Daniel 2026-06-21): F1-F5 ✅ EN PROD (§93-§98). Pend.: arranque **C1** (Daniel) · responsive fino device-driven. | 🟡 | C1 + responsive |
| TODO-29 | **Kernel lea `### L-NN` de `3*-LECCIONES*.md`** (no solo `30`) → shard REAL de lecciones sin stub en `30` (hoy workaround M-06). Cambio de kernel = cars-operador (L-31). | 🔲 | cars-operador (kernel) |
| TODO-35 | **Visibilidad SITE-WIDE** (SEO·AEO·GA4·GSC·Maps·SSG). **🟢 EN PROD ✅** (PR#345; detalle→commits/bóveda `2026-06-25-*`). **Falta**: A2b por-cat/artículo+migrar `?col=` (necesita contenido) · eventos `generate_lead`/`contact`+excluir tráfico interno · consolidar 2º flujo GA · prompt HUB · tail §118/§119 (recos data-driven + BigQuery export + microbugs ficha) — esperan catálogo de Kary. 🔑 Google `bersagliojewelry@gmail.com` authuser=3. ⚠️ App Check Enforce→`FIREBASE_SA_KEY`. | 🟢 | A2b · catálogo |
| TODO-39 | **B1 paso 4b — apartados/abonos** (decisión, §128.4): ¿el mostrador necesita apartar piezas (anticipo + saldo) ahora? Si sí, el saldo = CARTERA (ya existe `clientes/{id}.saldoActual` vía factura/abono) → **reusar cartera, NO** un sistema de pagos paralelo en el pedido; requiere link pedido↔cliente CRM. Fork caro de revertir (§8 spec) → preguntar a Daniel. | 🟡 | decisión Daniel |
| TODO-37 | **PLAN MAESTRO DE COMERCIO** (Daniel 2026-06-25, ACTIVO): roadmap físico+digital. SSoT → `docs/superpowers/specs/2026-06-25-plan-maestro-comercio-v3.md` (Gemini v4 integrado). **B0/B0.5 EN PROD ✅ §120**; **B1 mostrador**: pasos 1-6 EN PROD, paso 7 `catalogo.json` a CDN DISEÑADO v3 (ver Foco). Decisiones abiertas dueño: ADDI · Persona Jurídica. `[OPUS-4.8]` | 🟢 | ejecutar B1 |
| TODO-41 | **Facturación multi-línea** (Daniel 2026-06-26): la factura/POS debe cobrar **modificaciones/servicios** por código, no solo piezas (variación de peso/ajuste = línea aparte). Toca POS/factura. Spec `modelo-inventario §10`. | 🔲 | tras carga inventario |
| TODO-42 | **Inventario v3 — F2** (futuro, cuando se conecte el checkout web Wompi): reserva web al crear + `reservaExpira` + reaper (Cloud Scheduler) + webhook Wompi→`confirmarPago` + `forcePosOverride` con candado de pago. Diseño → `…modelo-inventario-multitipo-design.md §11.4/§12.2`. | 🔲 | checkout web Wompi |
| TODO-44 | **Voz de marca en las 32 piezas** (Daniel 2026-06-27, §132): nombres PROPIOS de Bersaglio (no el literal del certificado) que diferencien; descripciones PROFUNDAS que transmitan la marca SIN repetir specs (que ya están en la ficha); **badges únicos por pieza** (no el mismo genérico). + (operativo) precios + imágenes IA. `[[feedback_voz_de_marca_no_generico]]` | 🔲 | próxima sesión (eval) |
| TODO-45 | **Limpieza UI piezas** (Daniel 2026-06-27): (a) quitar el campo **`slug`** del modal `admin-piezas.html` (se autogenera → info invisible, no debe verse al agregar); (b) quitar el badge genérico **"— Editorial —"** de las cards del catálogo público (`js/components/piece-card.js`). | 🔲 | próxima sesión |
| TODO-46 | **Escaneo INTEGRAL de diseño + marca** (Daniel 2026-06-27, **FLUJO ACOTADO**): evaluar TODO (frontend·backend·copywriting·marca·estructura), cazar lo genérico, apropiar a la voz de Bersaglio (leer Nosotros/index/journal/`siteContent`). Daniel intuye más cosas sin notar → barrido exhaustivo. `[[feedback_workflows_acotados]]` | 🔲 | próxima sesión |
> ✅ **Cerrados recientes**: histórico → ADRs §88-§132 + `00`/`99`. **TODO-40 INVENTARIO v3 ✅ DESPLEGADO** (§131) + **32 piezas reales CARGADAS de TrueLab** (§132, L-60). Pend operativo de Daniel: precios + imágenes IA (panel v3); deploy para hornear fichas/sitemap (SEO). (§128-§130 mostrador.)

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier A/B ✅, C pend.) · Fase 3 CRM ✅ en prod · **Fase M tren M0→M6 ✅ EN PROD** + ACUERDOS R1-R6 construidos/gateados (charter `50-ARQUITECTURA`, plan `fase-m-plan.md`). Horizonte: R6 acuerdos → M7 castigo → M2c → reportes/aging B6 → (futuro) inventario/facturación + RBAC/asesor (TODO-19).

---

## 📝 Bitácora (efímera)

> Podada (GC) 2026-06-26. Histórico → ADR §37-§130 + bóveda `2026-06-*`. Lecciones → `30`/`31`/`32`.
>
> **▶️ Cerrado por contexto** (ver Foco ↑). Hoy: §131 deploy v3 + §132 carga 32 piezas TrueLab (L-60). Próxima: eval integral de marca/diseño (TODO-44/45/46).
> **🚦 Reglas vivas**: `arquitecto-software` SIEMPRE · Bersaglio = 100% COP (§127) · pruebas en vivo SOLO al final (§130.4) · W-11 en decisión cara · `[[feedback_workflows_acotados]]` · `[[feedback_reintentar_agentes_no_saltar_flujo]]`. Cola: TODO-37 paso 7 (pausado) · TODO-39 · TODO-33 · TODO-35.
