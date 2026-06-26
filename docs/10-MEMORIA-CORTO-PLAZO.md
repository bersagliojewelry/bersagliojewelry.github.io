# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO: foco, pendientes
> (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM + Fase M (M0→M6) EN PRODUCCIÓN** (§47-§82). **🔄 RESET A CERO** (Daniel 2026-06-20): Kary recarga de cero → cartera/clientes históricos DESECHABLES (bajan urgencias de dinero). ⚙️ **OPUS 4.8 interino** (marcar `[OPUS-4.8]` · `feedback_opus_interino`).
>
> **🚦 Frente: TODO-37 PLAN MAESTRO DE COMERCIO — B1 (el mostrador) EN CONSTRUCCIÓN** (diseño `2026-06-25-b1-mostrador-design.md`). **🌱 Banco de pruebas EN PROD**: 9 piezas `seedDemo:true` (§121; pruebas en la WEB REAL = decisión Daniel, excepción pre-lanzamiento).
> **🔒 Decisiones FIJADAS (§121, NO re-preguntar)**: Wompi = cuenta de Kary Persona Natural (NO PJ; topes $2.5M/$10M; aumento a 20 tx → Daniel avisa) · ADDI ❄️ congelado (Kary vincula).
> **Avance B1 (detalle → ADRs §122-§130)**: pasos 1-6 + COP **EN PROD ✅** (PR #369/#370; Mostrador OPERABLE: crear·pago·VOID·arqueo Z·bruto-neto·export contador). **➡️ paso 7 `catalogo.json` a CDN EN CURSO** (spec `2026-06-26-b1-paso7`; flujo fuerte COMPLETO ✅: comité ×4+Gemini → veredicto **C**; decisión 10.1 = vendida sale del listado, su página vive "Vendida"). **7a ✅** (`6436475`: SSG stock-aware [corrige bug letal SEO `InStock`] + `catalogo.json` contrato público; verificado datos reales: 16 claves, cero fuga internos). **Sigue: 7b cliente SWR · 7c read-ficha · 7d dispatch on-demand.** · decisión 4b apartados (TODO-39).
> _⚠️ **Pruebas en vivo DIFERIDAS al final del plan+rediseño** (Daniel §130.4; build+tests por commit = red de seguridad). Gotcha dev L-58._ Cola: TODO-39 · TODO-33 · TODO-35.
> - ⚠️ **Deploy** (L-22/L-26): reglas/functions = manual mío; sitio+merge a `main` = PR de Daniel (`git fetch` siempre); Admin SDK = ADC.

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
| TODO-40 | **MODELO INVENTARIO MULTI-TIPO** (Daniel 2026-06-26, Decisión Fuerte, PRECEDE la carga masiva): diseño + comité ×4 + respuestas Daniel ✅ (§10: talla ajustable [no variantes] · precio fijo por ficha · `visibilidad` pública/privada · `refabricable`; CF decrementa al CREAR + reserva+reaper; `estado` derivado de `cantidad`). Spec `2026-06-26-modelo-inventario-multitipo`. | 🟡 | consejo Gemini → implementar |
| TODO-41 | **Facturación multi-línea** (Daniel 2026-06-26): la factura/POS debe cobrar **modificaciones/servicios** por código, no solo piezas (variación de peso/ajuste = línea aparte). Toca POS/factura. Spec `modelo-inventario §10`. | 🔲 | tras modelo inventario |
> ✅ **Cerrados recientes**: histórico → ADRs §88-§130 + `00`/`99` (últimos: §128-§130). **Fix suelto**: bug admin "Cantidad" habilitada en stock "Por encargo" → `49fe96a` (deshabilitada en encargo).

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier A/B ✅, C pend.) · Fase 3 CRM ✅ en prod · **Fase M tren M0→M6 ✅ EN PROD** + ACUERDOS R1-R6 construidos/gateados (charter `50-ARQUITECTURA`, plan `fase-m-plan.md`). Horizonte: R6 acuerdos → M7 castigo → M2c → reportes/aging B6 → (futuro) inventario/facturación + RBAC/asesor (TODO-19).

---

## 📝 Bitácora (efímera)

> Podada (GC) 2026-06-25. Histórico → ADR §37-§115 + bóveda `2026-06-*`. Lecciones → `30`/`31`/`32`.
>
> **▶️ Hitos**: detalle en ADRs §88-§130. Vivo: **TODO-37 B1 — Mostrador OPERABLE + export contador** (crear §126 · confirmar pago §128 · anular/VOID + arqueo §129 · bruto/neto §130); CFs+reglas desplegadas, pend. merge `ba6da22`+`1362a32`+`f3c9060`.
>
> **🚦 Próximo**: **paso 7 EN CURSO** — 7a ✅ (`6436475`); sigue **7b** cliente SWR (`data.js` lee `catalogo.json`, fallback stale, SW SWR+URL versionada) · **7c** read-ficha optimista · **7d** dispatch on-demand blindado (plan §10.6). CRUDO+respuesta→bóveda `2026-06-26-*-b1-paso7-*`. Luego: 4b apartados (TODO-39) · IVA/retenciones (contador). **Regla**: `arquitecto-software` SIEMPRE · COP (§127) · pruebas en vivo al final (§130.4) · W-11 · `[[feedback_workflows_acotados]]`. Cola: TODO-33 (parpadeo) · TODO-35 (A2b/eventos/HUB). **Regla**: `arquitecto-software` SIEMPRE · **Bersaglio = 100% COP (§127)** · **pruebas en vivo SOLO al final del plan+rediseño (§130.4)** · **W-11** en diseño/decisión cara · `[[feedback_workflows_acotados]]`.
