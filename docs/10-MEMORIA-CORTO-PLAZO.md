# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO:
> foco, pendientes (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM en producción** (ADR §47/§49): 344 clientes de Kary (cartera $506.510.780), `recalcSaldoCliente` viva, CRM admin-only (vendedoras = entidad de datos). **Panel v2 desplegado**: F-CHASIS-A §50 · Morosos §51 · F5 filtros §52 · F4 Bandeja §53. **Cerebro**: kernel multi-proyecto ADR §56 (v1.1 ×3, cerebros independientes); GC de este repo HECHO 2026-06-09 (comité v6 ítem H).
>
> **▶️ RETOMAR AQUÍ — EN ESTE ORDEN (pedido de Daniel):**
> 1. **🔒 App Check — solo falta ENFORCEMENT** (ADR §54, TODO-14): código en prod VERIFICADO en vivo (reCAPTCHA v3 wired en público+admin). Monitor en 0% verificadas = propagación+caché, NO bug. Daniel re-mira el monitor (Firebase→App Check→APIs) → cuando "verificadas" ≈100% → **Enforce** (Firestore+Storage+Functions JUNTOS, 1 clic, reversible). ⚠️ NUNCA con 0% (rompe el sitio). Guiado con pantallazos.
> 2. **🏗️ Seguir F6**: CI rule-test (TODO-10) · entero-COP · reconciliación+Salud · RBAC claims · **backup PRE-1** (TODO-15, bloquea F7). Plan → bóveda privada (`../brain-private/bersaglio/f6-hardening-plan.md`, ADR §174 cars). Luego F7 (Consejo Externo antes).
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
| TODO-10 | Reactivar CI rules-test (`on: [push, pull_request]` en `firestore-rules-test.yml`; causa del rojo ya resuelta) | 🔲 | a pedido (requiere push) |
| TODO-14 | **App Check enforcement** (código en prod OK; ver RETOMAR #1) | 🟡 | Daniel (enforce guiado) |
| TODO-15 | **Backup PRE-1** (bloqueante F7): PITR vs export programado + restore probado (runbook) | 🔲 | Daniel (consola+presupuesto) |
| TODO-17 | **Toda captura → CRM**: contacto→Bandeja ✅; falta newsletter (`addSubscription`→`subscriptions`) en el panel | 🔲 | tras App Check |

> ✅ Cerrados y consolidados (retirados en el GC 2026-06-09): TODO-01/02→§38 · 05→§47 · 06→`e290f83` · 11→spec §16 · 12→§50 · 13→§51 · 16→§55 · settings.local→`e3d390f`.

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier A/B ✅, C pendiente) · Fase 3 CRM ✅ en prod (charter `50-ARQUITECTURA`). SW `bersaglio-v9`. Horizonte: vendedoras + reportes/aging + (futuro) inventario/facturación.

---

## 📝 Bitácora (efímera)

> Vaciada en el GC 2026-06-09 (comité v6, ítem H). Todo lo anterior consolidado: **ADR §37-§56**
> (lanzamiento CRM, Fase R, Panel v2, morosos, F5/F4, App Check, cerebro/TODO-16, kernel §56).
> Detalle de cualquier § → `00-INDICE` → `99`.
