# 🩺 05 — ESTADO GLOBAL (Heartbeat · Snapshot de salud del sistema)

> **Nodo: signos vitales.** AUTO-CARGA (con `CLAUDE.md` + `10`). Responde *"¿en qué estado está el
> sistema AHORA, antes de tocar nada?"*. Lo lee el Reflejo de Auto-auditoría (`CLAUDE.md §G.4`) al arrancar.
> **Mantenimiento (Frescura §G.4)**: actualizar al cambiar cache/branch/riesgo. **Tope ~25 líneas (§G.5)**.
> **NO fijar aquí el hash/PR exacto de PROD** (se vuelve stale — lo cazó la auditoría §114 ×3): el commit
> vivo lo dice `git fetch` (§3.3 = fuente de verdad); aquí el estado va por CONTENIDO, no por hash.

| Señal | Valor (al 2026-06-28) |
|---|---|
| **Build** | 🟢 Vite VERDE (~5s). Panel v2 en prod (§50-§53); norte = spec maestra v3. Suite local verde (acuerdos·estado·paridad·saldo·reconciliación·rules 233·resource-admin·no-demo·backup). ⚠️ Preview headless no pinta dinámico (L-05) → verificar en `dev`/deploy. |
| **Cache version vigente** | `bersaglio-v83` (`public/sw.js`; SW↔05 OK; admin `APP_VERSION v45`). v83 = TODO-70 POS profesional (caja OBLIGATORIA). Historial de bumps → ADRs. |
| **PROD / branch** | `Desarrollo`≈`main` (**merge a main = Claude**, autoriz. `[[feedback_claude_deploy_autorizado]]`; **commit exacto → `git fetch`**, §114). **EN PROD** hasta §173 (Mostrador operable + **caja OBLIGATORIA** · 32 piezas v3 · catálogo voz+gema · legal e-commerce; detalle → `99`/`00`). **paso 7 catalogo.json→CDN**: 7a ✅, falta 7b-7d (Bloque D). **Pend operativo Daniel**: precios (⛔ GATE Bloque A) + imágenes IA. **MCP Firebase = escritura prod**. `arquitecto-software` SIEMPRE. |
| **Backend / Firebase** | CRM + Fase M (M0→M6) EN PROD (§47-§82). **🔄 RESET-A-CERO** (Daniel 2026-06-20): cartera/clientes históricos = **DESECHABLES**. Vendedoras = dato (Kary crea); CRM admin/owner-only. ⚠️ Reglas/functions = deploy MANUAL (L-22). **WOMPI WEB OPERATIVO Y VERIFICADO EN PROD (§164)**. Falta OPERATIVO: **cargar precios reales** (Daniel/Kary) + **monitorear 1ª venta APPROVED**. |
| **Hosting** | GitHub Pages (`bersagliojewelry.co` / `.github.io`), auto-deploy por Actions on-push-a-`main` (+ paso SSG `generate` + gate `SSG_SELFTEST` + cron diario, §116) · **GEMELO** `bersaglio-gemelo.web.app` (Spark, aula/banco de pruebas/restore, §61). |
| **Cerebro** | 🧠 template v1.0.0 · kernel v1.1 (byte-idéntico ×3, §56) · cerebros INDEPENDIENTES · skills catalogadas. **GC (TODO-32 ✅)**: shard `30`→`32-LECCIONES-CARGA` + `00` ratchet 28k; `20`/`31` ≥90% (nudge informativo). Auditoría Nivel-2 §114 (2026-06-24). |

## ⚠️ Flags de riesgo activos (→ hardening F6 · detalle `docs/41-SEGURIDAD.md`)
- 🟠 **Deploy reglas/functions = MANUAL** (CI = Pages only, **L-22**): `firebase deploy --only firestore:rules,firestore:indexes,functions`. Functions Node 22 + ff v7 ✅ (§48).
- 🟠 **F6**: App Check REPARADO (§58) — **TODO-14 Enforce DIFERIDO** hasta flujo alto de clientes (Daniel 2026-06-23); queda en monitoreo. 🏁 F6 técnico COMPLETO (§68): RBAC claims (§65/§66) + alerta de truncado (§68). Resto del programa: App Check Enforce + compuerta de adopción → Fase M; política cartera APROBADA → config en Fase M.
- 🟢 **PLAN ÚNICO ERP v4 (TODO-68**, spec `2026-07-04-plan-unico-erp-v4`) = roadmap vigente. **F1 ✅ (§165-§168)** · **F2.0 caja+bóveda ✅ EN PROD (§169-§170**, gate owner verde · `config/caja` **enforceTurno:true (§173 caja OBLIGATORIA)**·fondo200k·límite4M · runbook §9.4 pend Kary · B5d rol `caja` diferido L-78). **F2.1 vínculo cliente + contrato de identidad ✅ EN PROD (§171)**: 5 CFs + reglas + `IDENTIDAD_PEPPER` (Secret Manager) + UI POS adjuntar (banner+cola+modal) + **gate Chrome prod VERDE** · flag `config/identidad.activo=true` = **LIVE Kary**. Follow-ups: aviso consent legal-colombia + instructivo Kary · F2.1b match web dormido. **TODO-70 POS profesional ✅ §173.** **F2.2 factura multi-línea EN CURSO (TODO-41)**: H1 motor `lineasExtra`+reglas `servicios` + H2 export ✅ en `Desarrollo` (TDD verde · commits eee8e65/9a6232a · SIN deploy/merge/SW-bump); falta UI mostrador + CMS + gate. → 2.4 apartados · 2.3 térmica (hardware). **GATE vivo: precios reales + 1ª APPROVED.**
- ⚙️ **INTERINATO OPUS 4.8** activo (Fable sin cuota gratis 2026-07-06; Daniel avisa el retorno) — spec f1-core §0 VINCULANTE (tag `[OPUS-4.8]` + TDD estricto + deploy manual + no tocar webhook/firma/reaper/snapshot).

## 🧩 Sub-sistemas
Liquid Glass (Vite) ✅ · Sync en vivo Firestore ✅ · Checkout Stepper 3 pasos ✅ · Cart/Wishlist drawers ✅ · Animaciones staggered ✅
