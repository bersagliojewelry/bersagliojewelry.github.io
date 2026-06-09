# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO:
> foco, pendientes (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM en producción** (ADR §47/§49): 344 clientes de Kary (cartera $506.510.780), `recalcSaldoCliente` viva, CRM admin-only (vendedoras = entidad de datos). **Panel v2 desplegado**: F-CHASIS-A §50 · Morosos §51 · F5 filtros §52 · F4 Bandeja §53. **Cerebro**: kernel multi-proyecto ADR §56 (v1.1 ×3, cerebros independientes); GC de este repo HECHO 2026-06-09 (comité v6 ítem H).
>
> **▶️ RETOMAR AQUÍ — EN ESTE ORDEN (plan del comité ADR §57, entregado a Daniel 2026-06-09):**
> 1. **🔒 App Check — REPARAR el registro, NO enforce** (TODO-14, RCA §57.3): el canje `exchangeRecaptchaV3Token` da **403** (verificado en vivo) → guiar a Daniel: admin de reCAPTCHA (llave `6LdSoxQt…` tipo v3 + dominios .co/.github.io autorizados) → copiar llave **SECRETA** → re-pegarla en Firebase→App Check→reCAPTCHA v3. Enforce SOLO con ~100% verificadas ×7 días (L-32). ⚠️ NUNCA con métricas en rojo.
> 2. **🛡️ Semana 1 del plan §57** (bóveda `plan-operacion-robustecimiento-2026-06.md`): frenos de gasto (alertas de presupuesto + endurecer reglas de forms + identificar origen de las 3.6K inválidas) · **gemelo** (2º proyecto Firebase: aula Kary + banco de pruebas + restore) · backup diario + restore probado (TODO-15) · 2FA Google+GitHub · kill-switch doc · talonarios/arqueo (Kary) · **cita contador** (¡puede reordenar TODO: ¿obligación de facturar YA?!) · 9 decisiones de Daniel (pendientes de respuesta).
> 3. **🏗️ Luego**: resto F6 (CI rule-test TODO-10 · entero-COP · reconciliación+Salud · claims) → compuerta de adopción → Fase M → F7 (Consejo Externo antes). Plan F6 técnico → bóveda `f6-hardening-plan.md`.
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
| TODO-14 | **App Check: reparar el registro** (RCA 403 §57.3: llave SECRETA en consola) → ~100% ×7d → enforce | 🟡 | Daniel (consolas, guiado) |
| TODO-15 | **Backup PRE-1** (bloqueante F7): export diario + **restore probado en el gemelo** (runbook) — semana 1 del plan §57 | 🔲 | Daniel (consola+presupuesto) |
| TODO-17 | **Toda captura → CRM**: contacto→Bandeja ✅; falta newsletter (`addSubscription`→`subscriptions`) en el panel | 🔲 | tras App Check |
| TODO-18 | **Plan operación integral §57**: semana 1 día a día · 9 decisiones de Daniel · compuerta de adopción · campaña cartera (diseño del contador ANTES del piloto) → bóveda | 🟡 | Daniel (decisiones 1-9 + contador) |

> ✅ Cerrados y consolidados (retirados en el GC 2026-06-09): TODO-01/02→§38 · 05→§47 · 06→`e290f83` · 11→spec §16 · 12→§50 · 13→§51 · 16→§55 · settings.local→`e3d390f`.

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier A/B ✅, C pendiente) · Fase 3 CRM ✅ en prod (charter `50-ARQUITECTURA`). SW `bersaglio-v9`. Horizonte: vendedoras + reportes/aging + (futuro) inventario/facturación.

---

## 📝 Bitácora (efímera)

> Vaciada en el GC 2026-06-09 (comité v6, ítem H). Todo lo anterior consolidado: **ADR §37-§56**
> (lanzamiento CRM, Fase R, Panel v2, morosos, F5/F4, App Check, cerebro/TODO-16, kernel §56).
> Detalle de cualquier § → `00-INDICE` → `99`.
>
> **2026-06-09 (tarde)** · Comité ×3 "operación integral" (33 agentes, 3 rondas) → plan a bóveda + **ADR §57** · RCA App Check verificada EN VIVO (canje 403) → TODO-14 redefinido (reparar registro, NO enforce) · fila §56 repuesta en `00` · L-28 duplicada → L-31 + L-32 nueva.
