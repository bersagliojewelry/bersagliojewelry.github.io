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
> 2. **🛡️ Semana 1 del plan §57** (bóveda `plan-operacion-robustecimiento-2026-06.md`): ✅ HECHO: forms endurecidos (§59) · 2FA · backup diario (§60) · **GEMELO VIVO** (§61: `bersaglio-gemelo.web.app`, sembrado, login aula verificado E2E; credenciales aula → seed-gemelo.mjs). **✅ PRE-1 CERRADO (§63): restauración PROBADA** (702/702 docs al gemelo, vista por Daniel, gemelo limpiado y re-sembrado; 1ª copia fuera → `C:\Users\romad\Documents\BersaglioBackups\`, rutina viernes). PENDIENTE: alertas de presupuesto GCP (Daniel) · recorrido del kill-switch (Daniel, bóveda `runbook-interruptor-emergencia.md`) · firmar contrato (bóveda) · talonarios/arqueo (Kary). **🏁 F6 TÉCNICO COMPLETO**: §64 reconciliación+Salud y §65 RBAC claims DESPLEGADOS (11 functions, claim owner sellado, reglas con §66) · CI VERDE (§67) · §68 alerta de truncado construida (`196484e`, viaja con el PR; **paginación GATED a materializar aging — el banner es el gate**). **Siguiente: compuerta de adopción (smoke de Kary) → FASE M (nuevo plan) → F7 (Consejo Externo antes).** **⏸️ DIAN/factura electrónica PAUSADA por Daniel** (solo si Kary la pide; ventas = "tirilla" comprobante interno rotulado "no es factura electrónica"; supuesto planeación ~$120-150M/año < umbral $183M; detalle → bóveda LEGALES). Decisiones 1-9 respondidas ✅ · **política de cartera v1 APROBADA** (→ config en Fase M) · contrato dueños = entregable pendiente.
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
> **2026-06-10 (7)** · **F6 CERRADO con §68** (`196484e`): alerta VISIBLE de truncado (spec §9.1) — banner en todas las páginas admin cuando un listener llega al tope; detector en clientes/movimientos/mora/fallos/Bandeja. **Decisión**: paginación cursor GATED a materializar el aging (paginar hoy = mora falsa, L-29/Consejo §16); el banner ES el gate. Tests 62 puros + build ✓. Viaja con el merge del PR.
> **2026-06-10 (6)** · **Frente B §65 DESPLEGADO** con OK de Daniel, orden §65.7 completo: functions `--force` (retry de `syncRoleClaim`) → 11 vivas · backfill: claim `owner` sellado+verificado (solo existe la cuenta de Daniel; la de Kary la sellará el trigger al crearse) · reglas publicadas (incl. §66) · preflight 0 drift.
> **2026-06-10 (5)** · **CI de reglas REPARADO §67** (`8b12fc4`): RCA grounded → emulador Firestore exige **Java 21**, CI usaba 17; rojo desde 06-05 (toolchain sin pin). Fix: Java 21 + pin. **Run real VERDE verificado** (push+PR+merge #215). Post-mortem: §62 dio el CI por verde sin verificar el run real (L-37).
> **2026-06-10 (4)** · **Fix seg §66 construido** (`e9ecc37`): "Desactivar usuario" ahora deshabilita la cuenta en Auth (panel→CF `deactivateUser` ya viva) + `signIn`/`requireAuth` chequean `active` + reglas `users/` owner-only. Reporte verificado de Daniel; un campo en doc no es credencial (L-36). Tests 76 reglas + build ✓. El fix de ACCESO viaja con el merge del PR (la CF está viva); las reglas se apilan al deploy del §65.
> **2026-06-10 (3)** · **Frente B §65 construido** (`3e4d4e2`): RBAC custom claims (rol en el token) + hardening frontera `users/` (anti escalada de rol). Revisión adversarial 19 agentes → 12 hallazgos (2 ALTA corregidos: escalada vía `users/` + claim stale convergente; L-35). Tests 75 reglas + 58 puros + build ✓. ⏳ Deploy PENDIENTE de OK de Daniel (orden §65.7; el backfill toca cuentas).
> **2026-06-10 (2)** · **Frente D §64 construido, DESPLEGADO Y MERGEADO** (`c554aec`, PR #214): reconciliación de cartera + vista Salud + trigger blindado. Revisión adversarial 24 agentes → 14 hallazgos, todos corregidos (L-34). Deploy autorizado por Daniel → 10 functions vivas (`functions:list` ✓). Daniel hizo push+merge a `main`.
> **2026-06-09** · F6 semana 1 + operación integral (consolidado en **ADR §57-§63**): comité ×3 plan a bóveda · App Check REPARADO en vivo (§58) · forms endurecidos (§59) · backupDiario (§60) · GEMELO vivo (§61) · PRE-1 restore probado (§63) · 9 decisiones de Daniel + legales (bóveda `LEGALES-kary-2026-06.md`) + política de cartera v1 + contrato dueños BORRADOR · aula de Kary DIFERIDA · DIAN pausada (tirilla interna). Detalle → `00-INDICE` → `99`.
