# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO:
> foco, pendientes (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM en producción** (ADR §47/§49): 344 clientes de Kary (cartera $506.510.780), `recalcSaldoCliente` viva, CRM admin-only (vendedoras = entidad de datos). **Panel v2 desplegado**: F-CHASIS-A §50 · Morosos §51 · F5 filtros §52 · F4 Bandeja §53. **Cerebro**: kernel multi-proyecto ADR §56 (v1.1 ×3, cerebros independientes); GC de este repo HECHO 2026-06-09 (comité v6 ítem H).
>
> **▶️ RETOMAR AQUÍ — EN ESTE ORDEN (plan del comité ADR §57, entregado a Daniel 2026-06-09):**
> 1. **🔒 App Check REPARADO** (ADR §58, 2026-06-09): causa real `API_KEY_SERVICE_BLOCKED` (API key restringida sin App Check API); Daniel la añadió en GCP → canje **200 EN VIVO**. TODO-14 restante: vigilar el monitor (Firebase→App Check→APIs) → cuando "verificadas" ≈100% sostenido **×7 días** → **Enforce** guiado (Firestore+Storage juntos). ⚠️ NUNCA antes (L-32).
> 2. **🛡️ Semana 1 del plan §57** (bóveda `plan-operacion-robustecimiento-2026-06.md`): ✅ HECHO: forms endurecidos (§59) · 2FA · backup diario (§60) · **GEMELO VIVO** (§61: `bersaglio-gemelo.web.app`, sembrado, login aula verificado E2E; credenciales aula → seed-gemelo.mjs). **✅ PRE-1 CERRADO (§63): restauración PROBADA** (702/702 docs al gemelo, vista por Daniel, gemelo limpiado y re-sembrado; 1ª copia fuera → `C:\Users\romad\Documents\BersaglioBackups\`, rutina viernes). PENDIENTE: alertas de presupuesto GCP (Daniel) · recorrido del kill-switch (Daniel, bóveda `runbook-interruptor-emergencia.md`) · firmar contrato (bóveda) · talonarios/arqueo (Kary). **🏁 F6 COMPLETO** (§64-§68). **▶️ FASE M (plan §69 + enmiendas v1.1, bóveda)**: M0-H+M0 DESPLEGADOS (§70) · preguntas 1-5 respondidas + M0-C Parámetros (§71) · **M1 RED-TEAMEADO ✅ (ADR §72)**: W-01 (5 lentes/22 agentes) → **0 bloqueantes, 0 m1-bugs**; el red-team confirmó por su cuenta el bug que reportó Daniel (`aprobada`+`motivoRechazo`) → **fix de contrato ternario aplicado, reglas 99/99 verdes**. **⛔ PENDIENTE: deploy de rules+indexes de M1 CON OK de Daniel** (L-22 manual). **Tren luego**: M2a UI de Kary (smoke/compuerta de adopción) → M2b superficie Daniel (**backlog de hardening del red-team en `fase-m-plan.md`: SoD del owner #1 = decisión de Daniel · re-validar `datosCorreccion` #2**) → M3 candado (tren acoplado; Consejo Externo ANTES de M3 — Gemini disponible). Pendiente: Vendedoras fuera de Configuración (ventana M2). Expand-contract vinculante. **⏸️ DIAN/factura electrónica PAUSADA por Daniel** (solo si Kary la pide; ventas = "tirilla" comprobante interno rotulado "no es factura electrónica"; supuesto planeación ~$120-150M/año < umbral $183M; detalle → bóveda LEGALES). Decisiones 1-9 respondidas ✅ · **política de cartera v1 APROBADA** (→ config en Fase M) · contrato dueños = entregable pendiente.
> 3. **🏗️ Luego**: último frente F6 (paginación cursor) → compuerta de adopción → Fase M → F7 (Consejo Externo antes). Plan F6 técnico → bóveda `f6-hardening-plan.md`.
>
> **Decisiones vivas (Panel v2/morosos)**: plazo 30 días (config) · `fecha` en movimientos (migrados=CUTOFF; sin fecha→ámbar) · VENCIDO día 1 · rangos 1-30/31-60/+60. Norte: spec `2026-06-07-bersaglio-arquitectura-maestra-design.md` v3.
> **Pendiente operativo**: smoke del panel por Kary · crear vendedoras reales.
>
> ⚠️ **Deploy (L-22 + L-26)**: reglas/functions = deploy manual mío; sitio + merge a `main` = PR que mergea Daniel (`git fetch` siempre). Admin SDK = ADC (L-23).

---

## 📋 Pendientes abiertos (TODO-NN) — ledger único

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-03 | (Opcional) headers de `99` a formato numerado `## NN.` (hoy por fecha, válido) | 🔲 | baja prioridad |
| TODO-04 | (Opcional) anomalías 🔧 en `skills/` (skill-creator anidado; code-simplifier/modernization formatos no-skill) | 🔲 | baja prioridad |
| TODO-07 | **Contenido real**: reseñas Google Maps (Nosotros), Films, feed Redes (`js/data/home-media.js`, `js/pages/nosotros.js`) | 🔲 | cliente entrega datos |
| TODO-08 | **Fase 2 Hardening**: Tier A ✅; pendiente CSP/reglas/claims (Tier B/C) → bóveda `41-SEGURIDAD §1.5` | 🟡 | Tier B = emulador+deploy gated |
| TODO-09 | **Fase 3 CRM**: en prod ✅; siguiente **Fase M** (movimientos robustos, spec listo) + B6 reportes/atrasados | 🟡 | Fase M = nuevo plan |
| TODO-14 | **App Check: reparar el registro** (RCA 403 §57.3: llave SECRETA en consola) → ~100% ×7d → enforce | 🟡 | Daniel (consolas, guiado) |
| TODO-17 | **Toda captura → CRM**: contacto→Bandeja ✅; falta newsletter (`addSubscription`→`subscriptions`) en el panel | 🔲 | tras App Check |
| TODO-18 | **Plan operación integral §57**: semana 1 día a día · 9 decisiones de Daniel · compuerta de adopción · campaña cartera (diseño del contador ANTES del piloto) → bóveda | 🟡 | Daniel (decisiones 1-9 + contador) |

> ✅ Cerrados y consolidados (retirados en el GC 2026-06-09): TODO-01/02→§38 · 05→§47 · 06→`e290f83` · **10→§62** (CI reactivado; activo al subir/mergear) · 11→spec §16 · 12→§50 · 13→§51 · **15→§63 (PRE-1 CERRADO: backup+restore PROBADO+copia fuera)** · 16→§55 · settings.local→`e3d390f`.

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier A/B ✅, C pendiente) · Fase 3 CRM ✅ en prod (charter `50-ARQUITECTURA`). SW `bersaglio-v9`. Horizonte: vendedoras + reportes/aging + (futuro) inventario/facturación.

---

## 📝 Bitácora (efímera)

> Vaciada en el GC 2026-06-09 (comité v6, ítem H). Todo lo anterior consolidado: **ADR §37-§56**
> (lanzamiento CRM, Fase R, Panel v2, morosos, F5/F4, App Check, cerebro/TODO-16, kernel §56).
> Detalle de cualquier § → `00-INDICE` → `99`.
>
> **2026-06-10 (11)** · **M1 RED-TEAMEADO + fix de contrato (ADR §72)**: W-01 (5 lentes/22 agentes/2.3M tok, **sin rate-limit esta vez**) → **0 bloqueantes, 0 m1-bugs**; el red-team confirmó por su cuenta el bug que Daniel reportó en paralelo (`aprobada`+`motivoRechazo` colado por guard `(A||B)`+`hasOnly`) → fix ternario por presencia, **reglas 99/99 verdes** (+1 test sobre `sol5`). 4 forward-risk-m2b + 1 hardening DIFERIDOS (backlog en `fase-m-plan.md`). CRUDO → bóveda · lección L-38. **PENDIENTE: deploy rules+indexes M1 con OK de Daniel → tren M2a.** (Lección operativa de (10), aún válida: workflow con `failures`+0 tool_uses ≠ veredicto.)
> **2026-06-10 (9)** · **Respuestas 1-5 + M0-C (§71)**: SLA 48h → `slaRevisionDias:2` grabado en prod · 3 desviaciones adoptadas (delegación: "tú eres el contador, abogado y arquitecto") · rol CONTADOR futuro · **panel Parámetros owner-only** (metadatos puros + validación de coherencia; 72 puros + build ✓) · memoria de usuario actualizada · enmiendas v1.1 → bóveda. Pendiente: Vendedoras fuera de Configuración (ventana M2).
> **2026-06-10 (8)** · **FASE M: M0-H + M0 DESPLEGADOS (§70)** con OK de Daniel: saldoActual blindado + apertura neg owner-only · `config/cartera` sembrada (owner-only) · calibración: **cero histórico operativo** (344/344 = migración) → tope provisional · Consejo Externo disponible · runbook a bóveda · reglas 83/83. **Preguntas 1-5 entregadas a Daniel/Kary.**
> **2026-06-09/10 (2-7 + sem.1)** · F6 punta a punta + operación integral, todo consolidado en **ADR §57-§68** (App Check §58 · forms §59 · backup §60 · GEMELO §61 · PRE-1 §63 · frentes D/B §64/§65 · §66-§68; L-34/L-35/L-36/L-37; política cartera v1 + legales + contrato BORRADOR en bóveda; aula Kary diferida; DIAN pausada). Detalle → `00-INDICE` → `99`.
