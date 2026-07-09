# 🩺 05 — ESTADO GLOBAL (Heartbeat · Snapshot de salud del sistema)

> **Nodo: signos vitales.** AUTO-CARGA (con `CLAUDE.md` + `10`). Responde *"¿en qué estado está el
> sistema AHORA, antes de tocar nada?"*. Lo lee el Reflejo de Auto-auditoría (`CLAUDE.md §G.4`) al arrancar.
> **Mantenimiento (Frescura §G.4)**: actualizar al cambiar cache/branch/riesgo. **Tope ~25 líneas (§G.5)**.
> **NO fijar aquí el hash/PR exacto de PROD** (se vuelve stale — lo cazó la auditoría §114 ×3): el commit
> vivo lo dice `git fetch` (§3.3 = fuente de verdad); aquí el estado va por CONTENIDO, no por hash.

| Señal | Valor (al 2026-07-08) |
|---|---|
| **Build** | 🟢 Vite VERDE (~5s). Panel v2 en prod (§50-§53); norte = spec maestra v3. Suite local verde (acuerdos·estado·paridad·saldo·reconciliación·rules 233·resource-admin·no-demo·backup). ⚠️ Preview headless no pinta dinámico (L-05) → verificar en `dev`/deploy. |
| **Cache version vigente** | `bersaglio-v84` (`public/sw.js`; SW↔05 OK; admin `APP_VERSION v45`). v84 = TODO-74 index carga fluida (skeleton de cristal destacadas+colecciones). Historial de bumps → ADRs. |
| **PROD / branch** | `Desarrollo`≈`main` (**merge a main = Claude**, autoriz. `[[feedback_claude_deploy_autorizado]]`; **commit exacto → `git fetch`**, §114). **EN PROD (main)** hasta §178 (Mostrador+caja OBLIGATORIA · F2.2 §176 · Grupo A UX §177 · **index skeleton §178** · 32 piezas v3 · legal). **`main`≡`Desarrollo` alineados** (merge §178). **⚠️ TODO-73 core money-model ya en `main` pero `functions` SIN DESPLEGAR** (ningún CI despliega functions: deploy.yml=Pages, firebase-deploy.yml=Hosting; deploy manual L-22) — **NO ejecutar `firebase deploy --only functions` hasta UI+gate** (backward-compat de todos modos). **Pend operativo Daniel**: precios (⛔ GATE) + imágenes IA. **MCP Firebase = escritura prod**. `arquitecto-software` SIEMPRE. |
| **Backend / Firebase** | CRM + Fase M (M0→M6) EN PROD (§47-§82). **🔄 RESET-A-CERO** (Daniel 2026-06-20): cartera/clientes históricos = **DESECHABLES**. Vendedoras = dato (Kary crea); CRM admin/owner-only. ⚠️ Reglas/functions = deploy MANUAL (L-22). **WOMPI WEB OPERATIVO Y VERIFICADO EN PROD (§164)**. Falta OPERATIVO: **cargar precios reales** (Daniel/Kary) + **monitorear 1ª venta APPROVED**. |
| **Hosting** | GitHub Pages (`bersagliojewelry.co` / `.github.io`), auto-deploy por Actions on-push-a-`main` (+ paso SSG `generate` + gate `SSG_SELFTEST` + cron diario, §116) · **GEMELO** `bersaglio-gemelo.web.app` (Spark, aula/banco de pruebas/restore, §61). |
| **Cerebro** | 🧠 template v1.0.0 · kernel v1.1 (byte-idéntico ×3, §56) · cerebros INDEPENDIENTES · skills catalogadas. **GC**: `30`→`32-LECCIONES-CARGA` · `00`→`00b` range-shard (§174, madre 15.6k); `20`/`31` ≥90% (nudge). Auditoría Nivel-2 §175 (2026-07-08). |

## ⚠️ Flags de riesgo activos (→ hardening F6 · detalle `docs/41-SEGURIDAD.md`)
- 🟠 **Deploy reglas/functions = MANUAL** (CI = Pages only, **L-22**): `firebase deploy --only firestore:rules,firestore:indexes,functions`. Functions Node 22 + ff v7 ✅ (§48).
- 🟠 **F6**: App Check REPARADO (§58) — **TODO-14 Enforce DIFERIDO** hasta flujo alto de clientes (Daniel 2026-06-23); queda en monitoreo. 🏁 F6 técnico COMPLETO (§68): RBAC claims (§65/§66) + alerta de truncado (§68). Resto del programa: App Check Enforce + compuerta de adopción → Fase M; política cartera APROBADA → config en Fase M.
- 🟢 **PLAN ÚNICO ERP v4 (TODO-68**, spec `2026-07-04`) = roadmap. **F1·F2.0·F2.1·caja-tiempo-real·TODO-70 ✅ EN PROD (§165-§173)** (`config/caja enforceTurno:true` verificado-vivo:2026-07-08 · `config/identidad.activo=true` LIVE Kary; detalle→ADRs). **F2.2 ✅ OPERATIVO (§176)** (falta cargar servicios reales, data). **Grupo A UX (§177)** + **index skeleton (§178, carga fría, TODO-74 cerrado)** ✅ EN PROD (`[[feedback_validacion_chrome_holistica]]`). **🟡 TODO-73 POS-pro money-model (Decisión Fuerte): CORE ✅ EN TDD** (datáfono·`pagos[]`·venta-sin-pieza·vouchers; `d6a5728` en `Desarrollo`, SIN deploy; spec+comité§8) **UI pend. — Daniel trae ajustes** → deploy `functions`+gate+ADR. SIGUE: F2.4 (TODO-39). **GATE negocio: precios reales + 1ª APPROVED.**
- ⚙️ **INTERINATO OPUS 4.8** activo (Fable sin cuota gratis 2026-07-06; Daniel avisa el retorno) — spec f1-core §0 VINCULANTE (tag `[OPUS-4.8]` + TDD estricto + deploy manual + no tocar webhook/firma/reaper/snapshot).

## 🧩 Sub-sistemas
Liquid Glass (Vite) ✅ · Sync en vivo Firestore ✅ · Checkout Stepper 3 pasos ✅ · Cart/Wishlist drawers ✅ · Animaciones staggered ✅
