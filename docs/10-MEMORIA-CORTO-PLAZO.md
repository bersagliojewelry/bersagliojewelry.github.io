# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM + Fase M EN PROD** (§47-§82). ⚙️ **OPUS 4.8 interino** (marcar `[OPUS-4.8]` · `feedback_opus_interino`).
>
> **🔬 §133 EVAL INTEGRAL DE MARCA (esta sesión).** Barrido exhaustivo (12 págs + 8 comps + 32 piezas + contenido en vivo por MCP) + comité acotado de 5 lentes (raw → bóveda `2026-06-27-eval-marca-comite`). Diagnóstico ENTREGADO; **4 decisiones de Daniel** (↓ bitácora). Detalle completo → **ADR §133**. `[[feedback_voz_de_marca_no_generico]]` · `[[feedback_workflows_acotados]]`.
> **✅ Aplicado ya**: reseñas inventadas ELIMINADAS del doc vivo (`siteContent/nosotros.resenas=[]`); fixes de código (footer + "sin precio"→`priceLabel` + slug oculto, §133) **MERGEADOS a main (#382, `51c5655`)** → desplegando en Pages. Cache **v42**.
> **🔜 Próximo**: backlog de marca **TODO-47..51** (verdad/SIC · reseñas reales · legal · catálogo de lujo · origen gemas). Cola: F2 Wompi · TODO-41/39/37/33/35 · `[[project_comercio_pagos]]`.
> _Mostrador EN PROD (§122-§130). Pruebas en vivo DIFERIDAS (§130.4). **MCP Firebase = escritura prod**. merge a main = Claude (autoriz. 2026-06-27)._

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
| TODO-47 | **Verdad de marca (riesgo SIC)** — confirmar con Kary qué es REAL y retirar lo no comprobable: equipo, certificaciones, cifras/año, financiación, envíos, horario único 8-7. Detalle → §133.2(A) · `[[feedback_no_demo_en_index]]` | 🔲 | Kary |
| TODO-48 | **Reseñas reales** — conectar `reviews` (aprobadas) → Nosotros + gestión admin (las falsas ya se quitaron; 1 huérfana de prueba en `reviews`). | 🔲 | feature |
| TODO-49 | **Legal e-commerce** — consentimiento habeas data en forms + verificar privacidad/terminos (retracto). Skill `legal-colombia`. Prereq Wompi. | 🔲 | pre-Wompi |
| TODO-50 | **Catálogo de lujo** — imagen real (no certificado) + filtros gema/tipo + taxonomía canónica + badges por gema. Detalle → §133.2(B/C). | 🔲 | tras TODO-44 |
| TODO-51 | **Origen honesto de gemas** no-colombianas (rubí/zafiro/diamante; el sitio sugiere todo Muzo/Chivor). | 🔲 | con TODO-44 |
> ✅ **Cerrados recientes**: **TODO-44 voz de marca catálogo (§134)** · **TODO-45/46 (§133)** · TODO-40 + 32 piezas TrueLab (§131/§132). Histórico → ADRs §88-§134 + `00`/`99`. Pend operativo Daniel: precios + imágenes IA (panel v3).

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño · Fase 2 hardening (Tier C pend.) · Fase 3 CRM ✅ · **Fase M M0→M6 ✅ EN PROD** + ACUERDOS R1-R6 gateados (charter `50-ARQUITECTURA`). Horizonte: R6 → M7 → M2c → B6 → (futuro) inventario/facturación + RBAC (TODO-19).

---

## 📝 Bitácora (efímera)

> Podada (GC) 2026-06-26. Histórico → ADR §37-§130 + bóveda `2026-06-*`. Lecciones → `30`/`31`/`32`.
>
> **▶️ §133 EVAL INTEGRAL DE MARCA (2026-06-27).** Diagnóstico → Daniel; **4 decisiones**: (1) eliminar lo inventado (reseñas ✅; equipo/certs → Kary = TODO-47) + reseñas reales desde admin (TODO-48); (2) sin precios aún; (3) Claude propone 32 nombres, Daniel aprueba (TODO-44); (4) fixes seguros ✅. Todo el detalle → **ADR §133** + bóveda.
> **▶️ §134 (mismo día):** Daniel aprobó TODO → 32 piezas + 7 colecciones en voz + 9 destacadas variadas (MCP, en vivo) + **skill `catalogo-voz-bersaglio`** (invocable). Badge en tarjeta, v43. ADR §134. **merge a main = Claude** ahora.
> **🚦 Reglas vivas**: `arquitecto-software` SIEMPRE · Bersaglio = 100% COP (§127) · NO inventado/no-verificable (`[[feedback_no_demo_en_index]]`) · la voz solo se presta a lo verificable · pruebas en vivo SOLO al final (§130.4) · W-11/mockup en decisión-diseño · `[[feedback_workflows_acotados]]` · `[[feedback_reintentar_agentes_no_saltar_flujo]]`. Cola: TODO-47..51 · F2 Wompi · TODO-37/39/33/35.
