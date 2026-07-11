# 🩺 05 — ESTADO GLOBAL (Heartbeat · Snapshot de salud del sistema)

> **Nodo: signos vitales.** AUTO-CARGA (con `CLAUDE.md` + `10`). Responde *"¿en qué estado está el
> sistema AHORA, antes de tocar nada?"*. Lo lee el Reflejo de Auto-auditoría (`CLAUDE.md §G.4`) al arrancar.
> **Mantenimiento (Frescura §G.4)**: actualizar al cambiar cache/branch/riesgo. **Tope ~25 líneas (§G.5)**.
> **NO fijar aquí el hash/PR exacto de PROD** (se vuelve stale — lo cazó la auditoría §114 ×3): el commit
> vivo lo dice `git fetch` (§3.3 = fuente de verdad); aquí el estado va por CONTENIDO, no por hash.

| Señal | Valor (al 2026-07-08) |
|---|---|
| **Build** | 🟢 Vite VERDE (~5s). Panel v2 en prod (§50-§53); norte = spec maestra v3. Suite local verde (acuerdos·estado·paridad·saldo·reconciliación·rules 233·resource-admin·no-demo·backup). ⚠️ Preview headless no pinta dinámico (L-05) → verificar en `dev`/deploy. |
| **Cache version vigente** | `bersaglio-v92` (`public/sw.js`; SW↔05 OK; admin `APP_VERSION v52`). v92 = F-IA-2 B4 (Bandeja única de aprobaciones + badge rail; Salud pierde la sección). v91 = B3 ("Hoy" pulso $). v90 = B2 (Clientes ⇄ Cartera). v89 = B1 pestañas. Historial → ADRs. |
| **PROD / branch** | `Desarrollo`≡`main` alineados (**merge a main = Claude**, `[[feedback_claude_deploy_autorizado]]`; **commit exacto → `git fetch`**, §114). **EN PROD hasta §182** (rail v2 · POS-pro §179 · F2.2 · 32 piezas v3 · legal; detalle → ADRs). Deploy functions/rules = MANUAL (CI = Pages/Hosting; L-22). **Precios reales = PASO FINAL** (Daniel 2026-07-10: se cargan cuando TODO esté 100% confiable y terminado, al lanzar a Kary — NO es gate intermedio). **MCP Firebase = escritura prod**. `arquitecto-software` SIEMPRE. |
| **Backend / Firebase** | CRM + Fase M (M0→M6) EN PROD (§47-§82). **🔄 RESET-A-CERO** (Daniel 2026-06-20): cartera/clientes históricos = **DESECHABLES**. Vendedoras = dato (Kary crea); CRM admin/owner-only. ⚠️ Reglas/functions = deploy MANUAL (L-22). **WOMPI WEB OPERATIVO Y VERIFICADO EN PROD (§164)**. Falta OPERATIVO: **cargar precios reales** (Daniel/Kary) + **monitorear 1ª venta APPROVED**. |
| **Hosting** | GitHub Pages (`bersagliojewelry.co` / `.github.io`), auto-deploy por Actions on-push-a-`main` (+ paso SSG `generate` + gate `SSG_SELFTEST` + cron diario, §116) · **GEMELO** `bersaglio-gemelo.web.app` (Spark, aula/banco de pruebas/restore, §61). |
| **Cerebro** | 🧠 template v1.0.0 · kernel v1.1 (byte-idéntico ×3, §56) · cerebros INDEPENDIENTES · skills catalogadas. **GC**: `30`→`32-LECCIONES-CARGA` · `00`→`00b` range-shard (§174, madre 15.6k); `20`/`31` ≥90% (nudge). Auditoría Nivel-2 §175 (2026-07-08). |

## ⚠️ Flags de riesgo activos (→ hardening F6 · detalle `docs/41-SEGURIDAD.md`)
- 🟠 **Deploy reglas/functions = MANUAL** (CI = Pages only, **L-22**): `firebase deploy --only firestore:rules,firestore:indexes,functions`. Functions Node 22 + ff v7 ✅ (§48).
- 🟠 **F6**: App Check REPARADO (§58) — **TODO-14 Enforce DIFERIDO** hasta flujo alto de clientes (Daniel 2026-06-23); queda en monitoreo. 🏁 F6 técnico COMPLETO (§68): RBAC claims (§65/§66) + alerta de truncado (§68). Resto del programa: App Check Enforce + compuerta de adopción → Fase M; política cartera APROBADA → config en Fase M.
- 🟢 **Roadmap = plan maestro v5** (spec `2026-07-10`; supersede ERP v4/TODO-68). F1→F2.2 + caja tiempo real + POS-pro ✅ EN PROD (§165-§179; `config/caja enforceTurno:true` verificado-vivo:2026-07-08 · `config/identidad.activo=true` LIVE). SIGUE: **F-IA-2+depuración (TODO-76, interino)** → F-TESORERIA → F-COMPRAS → F-REPORTES → F2.4 apartados (TODO-39) → 2.3 térmica → limpieza → rompimiento → **lanzamiento (ahí: precios reales)**. 1ª APPROVED ✅.
- 🟣 **INTERINATO #3 · OPUS 4.8** (2026-07-10). Protocolo `opus-interino-protocolo` VINCULANTE (R1-R7). **SOLO F-IA-2** (spec `2026-07-10-f-ia-2-DISENO.md`): **B0·B1·B2·B3·B4 ✅ (SW v92); §0.7 D1-D7 cerradas por Fable → sigue B5 (Salud legible + "Cierre de mes" in situ + microcopy) SIN preguntar** (CERO functions/dinero nuevo; detalle + desvíos de diseño → spec §B3/§B4, p.ej. Bandeja owner-only). ⏳ Pend: validar B1-B4 funcional-con-sesión (roles/guardar/ciclo aprobar-rechazar vivo) en deploy con login. Cola TITULAR: auditar B1-B5 + F-TESORERIA/COMPRAS/REPORTES + apartados (§6). **Gate Daniel: Kary NO usa hasta confiabilidad 100%.** 1ª APPROVED ✅; precios = paso final.

## 🧩 Sub-sistemas
Liquid Glass (Vite) ✅ · Sync en vivo Firestore ✅ · Checkout Stepper 3 pasos ✅ · Cart/Wishlist drawers ✅ · Animaciones staggered ✅
