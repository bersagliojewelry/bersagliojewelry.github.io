# 🩺 05 — ESTADO GLOBAL (Heartbeat · Snapshot de salud del sistema)

> **Nodo: signos vitales.** AUTO-CARGA (con `CLAUDE.md` + `10`). Responde *"¿en qué estado está el
> sistema AHORA, antes de tocar nada?"*. Lo lee el Reflejo de Auto-auditoría (`CLAUDE.md §G.4`) al arrancar.
> **Mantenimiento (Frescura §G.4)**: actualizar al cambiar cache/branch/riesgo. **Tope ~25 líneas (§G.5)**.
> **NO fijar aquí el hash/PR exacto de PROD** (se vuelve stale — lo cazó la auditoría §114 ×3): el commit
> vivo lo dice `git fetch` (§3.3 = fuente de verdad); aquí el estado va por CONTENIDO, no por hash.

| Señal | Valor (al 2026-06-24) |
|---|---|
| **Build** | 🟢 Vite VERDE (~5s). Panel v2 en prod (§50-§53); norte = spec maestra v3. Suite local verde (acuerdos·estado·paridad·saldo·reconciliación·rules 186·resource-admin·no-demo·backup). ⚠️ Preview headless no pinta dinámico (L-05) → verificar en `dev`/deploy. |
| **Cache version vigente** | `bersaglio-v27` (`public/sw.js`; verificado SW↔manager↔05). Último bump por §107 (View Transitions). Indicador `APP_VERSION` = criterio de deploy. |
| **PROD / branch** | **Web "app-like" §103-§113 CERRADO EN PROD ✅** (View Transitions §107 + caché SWR §108 + LQIP §111 + Cache-Control Storage §112 + correo OWNER §113), validado Daniel+Chrome. `Desarrollo`≈`main` (merge por PR de Daniel). **Commit exacto → `git fetch` (NO fijarlo aquí, §3.3/§114).** **🎯 Rol "catálogo" de Kary CERRADO EN PROD ✅** (§115, TODO-19/31a; Kary verificada EN VIVO — ve/maneja SOLO Piezas+Colecciones; 4 fixes L-55/56/57). **SIGUIENTE**: **panel admin "tipo app"** (TODO-33, Decisión Fuerte — diseñar sesión nueva; fluidez sin exponer seguridad). `arquitecto-software` SIEMPRE. ⚙️ OPUS 4.8 interino. |
| **Backend / Firebase** | CRM + Fase M (M0→M6) EN PROD (§47-§82). **🔄 RESET-A-CERO** (Daniel 2026-06-20): Kary recarga de cero → cartera/clientes históricos = **DESECHABLES** (no citar los 344/$506M como vivos). Vendedoras = dato (`vendedoras/{id}`, Kary las crea); CRM admin/owner-only. `recalcSaldoCliente` viva (Node 22 / ff v7). ⚠️ Reglas/functions = deploy MANUAL (L-22). |
| **Hosting** | GitHub Pages (`bersagliojewelry.co` / `.github.io`), auto-deploy por Actions on-push-a-`main` · **GEMELO** `bersaglio-gemelo.web.app` (Spark, aula/banco de pruebas/restore, §61). |
| **Cerebro** | 🧠 template v1.0.0 · kernel v1.1 (byte-idéntico ×3, §56) · cerebros INDEPENDIENTES · skills catalogadas. **GC (TODO-32 ✅)**: shard `30`→`32-LECCIONES-CARGA` + `00` ratchet 28k; `20`/`31` ≥90% (nudge informativo). Auditoría Nivel-2 §114 (2026-06-24). |

## ⚠️ Flags de riesgo activos (→ hardening F6 · detalle `docs/41-SEGURIDAD.md`)
- 🟠 **Deploy reglas/functions = MANUAL** (CI = Pages only, **L-22**): `firebase deploy --only firestore:rules,firestore:indexes,functions`. Functions Node 22 + ff v7 ✅ (§48).
- 🟠 **F6**: App Check REPARADO (§58) — **TODO-14 Enforce DIFERIDO** hasta flujo alto de clientes (Daniel 2026-06-23); queda en monitoreo. 🏁 F6 técnico COMPLETO (§68): RBAC claims (§65/§66) + alerta de truncado (§68). Resto del programa: App Check Enforce + compuerta de adopción → Fase M; política cartera APROBADA → config en Fase M.

## 🧩 Sub-sistemas
Liquid Glass (Vite) ✅ · Sync en vivo Firestore ✅ · Checkout Stepper 3 pasos ✅ · Cart/Wishlist drawers ✅ · Animaciones staggered ✅
