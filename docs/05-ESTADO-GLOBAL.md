# 🩺 05 — ESTADO GLOBAL (Heartbeat · Snapshot de salud del sistema)

> **Nodo: signos vitales.** AUTO-CARGA (con `CLAUDE.md` + `10`). Responde *"¿en qué estado está el
> sistema AHORA, antes de tocar nada?"*. Lo lee el Reflejo de Auto-auditoría (`CLAUDE.md §G.4`) al arrancar.
> **Mantenimiento (Frescura §G.4)**: actualizar al cambiar cache/branch/riesgo. **Tope ~25 líneas (§G.5)**.
> **NO fijar aquí el hash/PR exacto de PROD** (se vuelve stale — lo cazó la auditoría §114 ×3): el commit
> vivo lo dice `git fetch` (§3.3 = fuente de verdad); aquí el estado va por CONTENIDO, no por hash.

| Señal | Valor (al 2026-07-18) |
|---|---|
| **Build** | 🟢 Vite VERDE (~5s). Panel v2 en prod (§50-§53); norte = spec maestra v3. Suite local verde (acuerdos·estado·paridad·saldo·reconciliación·rules 233·resource-admin·no-demo·backup). ⚠️ Preview headless no pinta dinámico (L-05) → verificar en `dev`/deploy. |
| **Cache version vigente** | `bersaglio-v98` (`public/sw.js`; SW↔05 OK; admin `APP_VERSION v55`). v98 = F-TESORERÍA B2 página "Cuentas y bancos" (**en código, deploy MANUAL pend.**) · v97 = fix PII GA4 (§189) · v96 = Journal indexable (§187). Historial → ADRs. |
| **PROD / branch** | `Desarrollo`≡`main` alineados (**merge a main = Claude**, `[[feedback_claude_deploy_autorizado]]`; **commit exacto → `git fetch`**, §114). **EN PROD hasta §192** (verificado-vivo:2026-07-18, `git fetch` + barrido Chrome) — rail v2 · POS-pro §179 · F2.2 · 32 piezas v3 · SEO A1-A4+B2 ✅ · garantía de por vida (§191) · legal; detalle → ADRs. Deploy functions/rules = MANUAL (CI = Pages/Hosting; L-22). **Precios reales = PASO FINAL** (Daniel 2026-07-10: se cargan cuando TODO esté 100% confiable y terminado, al lanzar a Kary — NO es gate intermedio). **MCP Firebase = escritura prod**. `arquitecto-software` SIEMPRE. |
| **Backend / Firebase** | CRM + Fase M (M0→M6) EN PROD (§47-§82). **🔄 RESET-A-CERO** (Daniel 2026-06-20): cartera/clientes históricos = **DESECHABLES**. Vendedoras = dato (Kary crea); CRM admin/owner-only. ⚠️ Reglas/functions = deploy MANUAL (L-22). **WOMPI WEB OPERATIVO Y VERIFICADO EN PROD (§164)**. Falta OPERATIVO: **cargar precios reales** (Daniel/Kary) + **monitorear 1ª venta APPROVED**. |
| **Hosting** | GitHub Pages (`bersagliojewelry.co` / `.github.io`), auto-deploy por Actions on-push-a-`main` (+ paso SSG `generate` + gate `SSG_SELFTEST` + cron diario, §116) · **GEMELO** `bersaglio-gemelo.web.app` (Spark, aula/banco de pruebas/restore, §61). |
| **Cerebro** | 🧠 template v1.0.0 · kernel v1.1 (byte-idéntico ×3, §56) · cerebros INDEPENDIENTES · skills catalogadas. **GC**: `30`→`32-LECCIONES-CARGA` · `00`→`00b` range-shard (§174, madre 15.6k); `20`/`31` ≥90% (nudge). Auditoría Nivel-2 §175 (2026-07-08). |

## ⚠️ Flags de riesgo activos (→ hardening F6 · detalle `docs/41-SEGURIDAD.md`)
- 🟠 **Deploy reglas/functions = MANUAL** (CI = Pages only, **L-22**): `firebase deploy --only firestore:rules,firestore:indexes,functions`. Functions Node 22 + ff v7 ✅ (§48).
- 🟠 **F6**: App Check REPARADO (§58) — **TODO-14 Enforce DIFERIDO** hasta flujo alto de clientes (Daniel 2026-06-23); queda en monitoreo. 🏁 F6 técnico COMPLETO (§68): RBAC claims (§65/§66) + alerta de truncado (§68). Resto del programa: App Check Enforce + compuerta de adopción → Fase M; política cartera APROBADA → config en Fase M.
- 🟢 **Roadmap = plan maestro v5** (spec `2026-07-10`). F1→F2.2 + caja tiempo real + POS-pro + **F-IA-2 ✅** EN PROD (§165-§192; `enforceTurno:true`/`identidad.activo` LIVE). SIGUE: **F-TESORERÍA (TODO-78; B0-B3 ✅ en código —8 CFs/reglas/índices/espejo/página+cuadre, verde offline, NO en prod; SIGUE B4 Bandeja/Hoy → B5-B6 → deploy bundle, ver `10`)** → F-COMPRAS → F-REPORTES → F2.4 apartados (TODO-39) → 2.3 térmica → limpieza → rompimiento → **lanzamiento (ahí: precios reales)**. 1ª APPROVED ✅.
- 🟣 **INTERINATO OPUS 4.8** · #3 ✅ auditado (§192). **#4 EN PAUSA: B0 de Opus auditado ✅ (0 sorpresas); B1 lo hizo el titular (2026-07-23). B2→B6 = con el modelo que Daniel active (`/model`; relevo curado en `10`).** Spec = 3 capas de refutación (§0.6/§0.7/§0.8: Kary carga sus cuentas por UI, cero seed). **Zonas calientes R3: bóveda(V1)+caja(V17)** = test primero (B5). **Gate Daniel: Kary NO usa hasta confiabilidad 100%.**

## 🧩 Sub-sistemas
Liquid Glass (Vite) ✅ · Sync en vivo Firestore ✅ · Checkout Stepper 3 pasos ✅ · Cart/Wishlist drawers ✅ · Animaciones staggered ✅
