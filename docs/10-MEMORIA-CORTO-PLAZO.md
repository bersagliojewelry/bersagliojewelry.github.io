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
> **Avance B1 (detalle → ADRs §122-§129)**: pasos 1-3 + COP **MERGEADOS a prod**; **paso 4a confirmar pago §128 + paso 5 anular/cierre de caja §129** → **Mostrador OPERABLE** (crear · confirmar pago · anular/VOID · arqueo Z; 15/15 integración + 207/207 reglas) — código `ba6da22`+`1362a32` PEND merge. CFs `crearPedido`/`confirmarPago`/`anularPedido`/`cierreCaja` + reglas DESPLEGADAS. **➡️ SIGUIENTE: paso 6 bruto/neto + export contador** · decisión 4b apartados (TODO-39).
> _**PEND merge Daniel**: §128-§129 (`ba6da22`,`1362a32`). **PEND verif. EN VIVO**: Kary opera el mostrador (registra venta · confirma pago · anula · cierra caja, pieza `seedDemo`). Gotcha dev L-58._ Cola: TODO-39 · TODO-33 · TODO-35.
> - ⚠️ **Deploy** (L-22/L-26): reglas/functions = manual mío; sitio+merge a `main` = PR de Daniel (`git fetch` siempre); Admin SDK = ADC.

---

## 📋 Pendientes abiertos (TODO-NN) — ledger único

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-03 | (Opcional) headers de `99` a formato numerado `## NN.` (hoy por fecha, válido) | 🔲 | baja |
| TODO-04 | (Opcional) anomalías 🔧 en `skills/` (formatos no-skill) | 🔲 | baja |
| TODO-07 | **Contenido real web**: reseñas Google Maps (Nosotros), Films, feed Redes (`js/data/home-media.js`, `js/pages/nosotros.js`) | 🔲 | cliente entrega datos |
| TODO-08 | **Hardening Fase 2**: Tier A ✅; pend. CSP/reglas/claims (Tier B/C) → `41-SEGURIDAD §1.5` | 🟡 | Tier B = emulador+deploy gated |
| TODO-09 | **Fase M**: M0→M6 ✅ EN PROD (§78-§80; 1er corte 1-jul); ACUERDOS R1-R5 (§81)+A8 (§87) GATEADOS/inertes — **encender = Daniel** (deploy+bandera+prueba; baja urgencia por reset). Restan: M7·M2c·ASESOR/RBAC (TODO-19). Kary prueba al final; verif. POR HITO = experta de Claude | 🟡 | encender R6 (Daniel) |
| TODO-14 | **App Check: MONITOREO; Enforce DIFERIDO** (Daniel 2026-06-23: sin flujo alto el monitoreo no es representativo → activar SOLO con tráfico alto). Registro reparado (§58). | ⏸️ | esperar flujo alto |
| TODO-17 | **Toda captura → CRM**: contacto→Bandeja ✅; falta newsletter (`addSubscription`→`subscriptions`) | 🔲 | tras App Check |
| TODO-18 | **Plan operación integral §57**: semana 1 + 9 decisiones de Daniel + compuerta de adopción + campaña cartera → bóveda | 🟡 | Daniel (decisiones 1-9) |
| TODO-33 | **Panel admin "tipo app" (fluidez)** (Decisión Fuerte). DISEÑADO (comité ×4+Gemini, veredicto `50 §5`; CRUDO→bóveda). Fase 0: **A3 menú instantáneo ✅** (`655556d`, v29) + fix VT v28 ✅ EN VIVO; pend. esqueletos/paralelizar/prefetch-asset/self-host fonts/VT-al-final. Router falso-SPA CONGELADO salvo 🟥 gate seguridad (revalidar rol/ruta) + no-leak IoC. **PAUSADO por TODO-34 (urgente).** | 🟡 | reanudar tras demo |
| TODO-21 | **Revisión post-Fable de `[OPUS-4.8]`** (H-08): por riesgo (dinero §81 > seguridad §65/§66 > CMS > docs); ~50 commits | 🔲 | Fable vuelve |
| TODO-22 | **Gate-de-git en el linter** (H-06): que `brain:check` warne si el estado de deploy declarado diverge de git. Toca kernel ×3 → **cars-operador** (L-31). *§114: mitigado en parte al dejar de fijar el hash en `05`.* | 🔲 | cars-operador (kernel) |
| TODO-23 | **Frase canónica del gate de verificación de DINERO** (H-18): Claude experto = gate; Kary = smoke POST-deploy no bloqueante. Aporte a la pasada Gemini (cars consolida) | 🔲 | Gemini |
| TODO-28 | **Correcciones web** (Daniel 2026-06-21): F1-F5 ✅ EN PROD (§93-§98). Pend.: arranque **C1** (Daniel) · responsive fino device-driven. | 🟡 | C1 + responsive |
| TODO-29 | **Kernel lea `### L-NN` de `3*-LECCIONES*.md`** (no solo `30`) → shard REAL de lecciones sin stub en `30` (hoy workaround M-06). Cambio de kernel = cars-operador (L-31). | 🔲 | cars-operador (kernel) |
| TODO-35 | **Visibilidad SITE-WIDE** (SEO·AEO·GA4·GSC·Maps·SSG). **🟢 EN PROD ✅** (PR#345 + merges 2026-06-25): A1 piezas SSG + B marca/Maps + A2a catálogo/journal + GA4 (G-HS26X60DK3 + Consent v2) + GA/GSC config (retención 14m · GA4↔GSC · sitemap). Detalle→commits/bóveda `2026-06-25-*`. **Falta**: A2b por-cat/artículo+migrar `?col=` (necesita contenido) · Eventos clave `generate_lead`/`contact` + excluir tráfico interno · consolidar 2º flujo GA `G-F0CEWY7SP1`=Firebase · prompt HUB. 🔑 Google bajo `bersagliojewelry@gmail.com` (authuser=3). ⚠️ App Check Enforce→`FIREBASE_SA_KEY`. **Tail folded de §118/§119 (esperan catálogo de Kary):** validación data-driven de recos + **BigQuery export** (config GA) + microbugs ficha (sizes/slug/enum/precio/caché-stale/lightbox/cart-sin-precio). | 🟢 | A2b · prompt HUB · catálogo |
| TODO-39 | **B1 paso 4b — apartados/abonos** (decisión, §128.4): ¿el mostrador necesita apartar piezas (anticipo + saldo) ahora? Si sí, el saldo = CARTERA (ya existe `clientes/{id}.saldoActual` vía factura/abono) → **reusar cartera, NO** un sistema de pagos paralelo en el pedido; requiere link pedido↔cliente CRM. Fork caro de revertir (§8 spec) → preguntar a Daniel. | 🟡 | decisión Daniel |
| TODO-37 | **PLAN MAESTRO DE COMERCIO** (Daniel 2026-06-25, ACTIVO): roadmap unificado físico+digital. SSoT → `docs/superpowers/specs/2026-06-25-plan-maestro-comercio-v3.md` (Gemini v4 integrado; CRUDO → tasks `wbhvxojh5`/`w8ig27z14`/`wk715z2q6`/`w3qkksqpg`). **B0+B0.5 EN PROD ✅ §120** (PR #359; WhatsApp directo + GA4 `whatsapp_click` + `waLink`; cache v34; verificado en vivo; piezas prueba limpias). **SIGUIENTE B1 (corazón, MOSTRADOR)**: entidad `pedidos` por CF callable + stock atómico (candado=pieza) + cotización rápida + VOID + merma (pesoCobrado/pesoEntregado) + caja/arqueo (Cierre-Z) + bruto/neto + export contador + `catalogo.json` a CDN (spec §11). Diseño detallado + IAP por sub-pieza. Decisiones abiertas dueño: ADDI · Persona Jurídica. `[OPUS-4.8]` | 🟢 | ejecutar B1 |
> ✅ **Cerrados recientes**: histórico completo → ADRs §88-§129 + `00`/`99` (no re-listar aquí; últimos: §127 todo en COP / cierra TODO-38 · §128 confirmar pago · §129 anular VOID + cierre de caja).

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier A/B ✅, C pend.) · Fase 3 CRM ✅ en prod · **Fase M tren M0→M6 ✅ EN PROD** + ACUERDOS R1-R6 construidos/gateados (charter `50-ARQUITECTURA`, plan `fase-m-plan.md`). Horizonte: R6 acuerdos → M7 castigo → M2c → reportes/aging B6 → (futuro) inventario/facturación + RBAC/asesor (TODO-19).

---

## 📝 Bitácora (efímera)

> Podada (GC) 2026-06-25. Histórico → ADR §37-§115 + bóveda `2026-06-*`. Lecciones → `30`/`31`/`32`.
>
> **▶️ Hitos**: detalle en ADRs §88-§129. Vivo: **TODO-37 B1 — Mostrador OPERABLE** (crear venta §126 · confirmar pago §128 · anular/VOID + cierre de caja §129); CFs+reglas desplegadas, pend. merge `ba6da22`+`1362a32` + verif. en vivo.
>
> **🚦 Próximo**: **verif. en vivo del mostrador** (Kary: registra venta · confirma pago · anula · cierra caja, pieza `seedDemo`) tras el merge. Luego **paso 6 bruto/neto + export al contador** (spec §7; obligación desde la 1ª venta). Pend. decisión 4b apartados (TODO-39). Cola: TODO-33 (parpadeo) · TODO-35 (A2b/eventos/HUB). **Regla**: `arquitecto-software` SIEMPRE · **Bersaglio = 100% COP (§127)** · **W-11** en diseño/decisión cara · `[[feedback_workflows_acotados]]`.
