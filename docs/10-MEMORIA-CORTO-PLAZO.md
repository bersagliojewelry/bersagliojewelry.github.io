# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO:
> foco, pendientes (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM en producción** (ADR §47/§49): 344 clientes de Kary (cartera $506.510.780), `recalcSaldoCliente` viva, CRM admin-only (vendedoras = entidad de datos). **Panel v2 desplegado**: F-CHASIS-A §50 · Morosos §51 · F5 filtros §52 · F4 Bandeja §53. **Cerebro**: kernel multi-proyecto ADR §56 (v1.1 ×3, cerebros independientes); GC de este repo HECHO 2026-06-09 (comité v6 ítem H).
>
> **▶️ RETOMAR — FASE M en curso** (tren M2a→M2b→M3; plan+enmiendas → bóveda `fase-m-plan.md`):
> - **M2a EN CURSO** (slice más pesado; diseño+chunks → bóveda `fase-m-m2a-design.md` + tareas #1-#7). HECHO: contrato puro del gate (`js/crm-correccion.js`, 16/16) + capa de datos solicitudes/gestiones + **par atómico `corregirMovimientoBatch`** (`crm-service.js`) + **M2a-1b DESPLEGADO** (ensanche aditivo de `anulacionValida` §73; red-team W-01 0 bloqueantes; reglas 100/100). **UI: M2a-3 + M2a-4 COMPLETOS** (`admin-cuenta.html`/`cuenta.js`/`crm-service.js`/`crm-correccion.js`, build verde, 22/22 + 100/100): anular con `motivoCategoria` (cierra §73) · abono con `medioPago` · rediseño "Corregir saldo" (anuncio + ruteo) · **botón "Corregir" por movimiento** (motivo derivado + par atómico/solicitud). **Contrato de la solicitud de corrección DECIDIDO Y VERIFICADO** (workflow 5 agentes → SÓLIDO, ADR §74): `monto`=delta neto firmado, `datosCorreccion`={reemplazo,snapshotOriginal,motivoCategoria}; M2b re-valida sin confiar ciegamente. `efectoSaldo` compartido. **M2a COMPLETO Y VERIFICADO** (M2a-1..6). **Cambio de gate**: Kary NO es verificadora (dueña no-técnica, delegó en Claude → [[feedback_claude_experto_verifica]]); el smoke de Kary se reemplazó por **verificación experta adversarial (§75, 12 agentes)** que atrapó **2 bugs de dinero bloqueantes** (ajuste duplicado; corregir con monto vacío → asiento $0) + 1 del spec (rechazo sin botón) → corregidos, re-verificados 3/3, L-39. Cache `v10`. **▶️ GO-LIVE de M2a por merge `Desarrollo→main`** (autorización permanente de Daniel). **Siguiente: M2b** (superficie de aprobación de Daniel; contrato §74 + backlog en `fase-m-plan.md`: SoD owner #1, re-validar datosCorreccion, 3 diferidos) → M3 candado (Consejo Externo antes).
> - **Tren luego**: M2b superficie Daniel (backlog hardening del red-team → `fase-m-plan.md`: SoD owner #1 = decisión Daniel · re-validar `datosCorreccion` #2) → M3 candado (Consejo Externo ANTES — Gemini disponible). Expand-contract vinculante.
> - **Hecho antes (consolidado en ADR §57-§72)**: F6 completo · plan operación + GEMELO + PRE-1 restore · M0-H/M0/M0-C · **M1 desplegado §72**. TODO-14 vivo: App Check monitor ×7d → Enforce (Daniel, NUNCA antes, L-32). Pendientes Daniel/Kary: alertas presupuesto GCP · kill-switch (bóveda) · firmar contrato (bóveda) · talonarios/arqueo.
> - **⏸️ DIAN PAUSADA** (tirilla interna; detalle → bóveda LEGALES). Política de cartera v1 APROBADA. Vendedoras fuera de Configuración = ventana M2.
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
