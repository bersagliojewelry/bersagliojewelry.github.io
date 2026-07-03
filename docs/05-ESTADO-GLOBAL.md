# 🩺 05 — ESTADO GLOBAL (Heartbeat · Snapshot de salud del sistema)

> **Nodo: signos vitales.** AUTO-CARGA (con `CLAUDE.md` + `10`). Responde *"¿en qué estado está el
> sistema AHORA, antes de tocar nada?"*. Lo lee el Reflejo de Auto-auditoría (`CLAUDE.md §G.4`) al arrancar.
> **Mantenimiento (Frescura §G.4)**: actualizar al cambiar cache/branch/riesgo. **Tope ~25 líneas (§G.5)**.
> **NO fijar aquí el hash/PR exacto de PROD** (se vuelve stale — lo cazó la auditoría §114 ×3): el commit
> vivo lo dice `git fetch` (§3.3 = fuente de verdad); aquí el estado va por CONTENIDO, no por hash.

| Señal | Valor (al 2026-06-28) |
|---|---|
| **Build** | 🟢 Vite VERDE (~5s). Panel v2 en prod (§50-§53); norte = spec maestra v3. Suite local verde (acuerdos·estado·paridad·saldo·reconciliación·rules 186·resource-admin·no-demo·backup). ⚠️ Preview headless no pinta dinámico (L-05) → verificar en `dev`/deploy. |
| **Cache version vigente** | `bersaglio-v65` (`public/sw.js`; SW↔05 OK; admin `APP_VERSION v31` — ⚠️ sin bump desde v31, revisar E.2 del plan). v65 = fix login TODO-64 (A0); v64 = fixes país/borrado-fotos/caché-CMS. Detalle → TODO-64/63. |
| **PROD / branch** | `Desarrollo`≈`main` (**merge a main = Claude**, autoriz. `[[feedback_claude_deploy_autorizado]]`; **commit exacto → `git fetch`**, §114). **EN PROD** hasta §157 (web app-like · rol Kary · SEO/GA4 · ficha/grilla · **Mostrador OPERABLE** B1 §128-§130 · **32 piezas reales v3** §131-§132 · catálogo voz+gema §134-§156 · legal e-commerce §157). Detalle histórico → `99`/`00`. **paso 7 catalogo.json→CDN**: 7a ✅, falta 7b-7d (= Bloque D del plan Fable). **Pend operativo Daniel**: precios (⛔ GATE Bloque A) + imágenes IA. Decisión 4b (TODO-39) · factura multi-línea (TODO-41). **MCP Firebase = escritura prod**. `arquitecto-software` SIEMPRE. |
| **Backend / Firebase** | CRM + Fase M (M0→M6) EN PROD (§47-§82). **🔄 RESET-A-CERO** (Daniel 2026-06-20): cartera/clientes históricos = **DESECHABLES** (no citar 344/$506M como vivos). Vendedoras = dato (`vendedoras/{id}`, Kary crea); CRM admin/owner-only. `recalcSaldoCliente` viva (Node 22/ff v7). ⚠️ Reglas/functions = deploy MANUAL (L-22). **WOMPI F2 ENCENDIDO** (flag ON; llaves prod Secret Manager; CFs `production.wompi.co`; suite 36/36) pero **DORMIDO** (botón oculto sin precios). **Pend**: URL Eventos panel + gate live (Daniel) + **hardening Bloque A del plan Fable** (3 P1). → `10` TODO-42/65. |
| **Hosting** | GitHub Pages (`bersagliojewelry.co` / `.github.io`), auto-deploy por Actions on-push-a-`main` (+ paso SSG `generate` + gate `SSG_SELFTEST` + cron diario, §116) · **GEMELO** `bersaglio-gemelo.web.app` (Spark, aula/banco de pruebas/restore, §61). |
| **Cerebro** | 🧠 template v1.0.0 · kernel v1.1 (byte-idéntico ×3, §56) · cerebros INDEPENDIENTES · skills catalogadas. **GC (TODO-32 ✅)**: shard `30`→`32-LECCIONES-CARGA` + `00` ratchet 28k; `20`/`31` ≥90% (nudge informativo). Auditoría Nivel-2 §114 (2026-06-24). |

## ⚠️ Flags de riesgo activos (→ hardening F6 · detalle `docs/41-SEGURIDAD.md`)
- 🟠 **Deploy reglas/functions = MANUAL** (CI = Pages only, **L-22**): `firebase deploy --only firestore:rules,firestore:indexes,functions`. Functions Node 22 + ff v7 ✅ (§48).
- 🟠 **F6**: App Check REPARADO (§58) — **TODO-14 Enforce DIFERIDO** hasta flujo alto de clientes (Daniel 2026-06-23); queda en monitoreo. 🏁 F6 técnico COMPLETO (§68): RBAC claims (§65/§66) + alerta de truncado (§68). Resto del programa: App Check Enforce + compuerta de adopción → Fase M; política cartera APROBADA → config en Fase M.
- 🔴 **GATE PRECIOS (Fable 2026-07-03, TODO-65)**: Wompi vivo pero DORMIDO (botón oculto sin precios). **NO cargar precios hasta cerrar Bloque A** del plan `2026-07-03-auditoria-holistica-plan-fable` (3 P1 dinero). **A0 login ✅ RESUELTO+verif live (§159, v65)** → siguiente = Bloque A (dinero).

## 🧩 Sub-sistemas
Liquid Glass (Vite) ✅ · Sync en vivo Firestore ✅ · Checkout Stepper 3 pasos ✅ · Cart/Wishlist drawers ✅ · Animaciones staggered ✅
