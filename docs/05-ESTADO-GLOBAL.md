# 🩺 05 — ESTADO GLOBAL (Heartbeat · Snapshot de salud del sistema)

> **Nodo: signos vitales.** AUTO-CARGA (con `CLAUDE.md` + `10`). Responde *"¿en qué estado está el
> sistema AHORA, antes de tocar nada?"*. Lo lee el Reflejo de Auto-auditoría (`CLAUDE.md §G.4`) al arrancar.
> **Mantenimiento (Frescura §G.4)**: actualizar al cambiar cache/branch/riesgo. **Tope ~25 líneas (§G.5)**.
> **NO fijar aquí el hash/PR exacto de PROD** (se vuelve stale — lo cazó la auditoría §114 ×3): el commit
> vivo lo dice `git fetch` (§3.3 = fuente de verdad); aquí el estado va por CONTENIDO, no por hash.

| Señal | Valor (al 2026-06-28) |
|---|---|
| **Build** | 🟢 Vite VERDE (~5s). Panel v2 en prod (§50-§53); norte = spec maestra v3. Suite local verde (acuerdos·estado·paridad·saldo·reconciliación·rules 186·resource-admin·no-demo·backup). ⚠️ Preview headless no pinta dinámico (L-05) → verificar en `dev`/deploy. |
| **Cache version vigente** | `bersaglio-v71` (`public/sw.js`; SW↔05 OK; admin `APP_VERSION v34`). v71 = gracias con estado real + comprobante (§164); v70 = stepper sin salto (gate A.9); v69 = anti-flash CMS (§163). Detalle → TODO-65. |
| **PROD / branch** | `Desarrollo`≈`main` (**merge a main = Claude**, autoriz. `[[feedback_claude_deploy_autorizado]]`; **commit exacto → `git fetch`**, §114). **EN PROD** hasta §157 (web app-like · rol Kary · SEO/GA4 · ficha/grilla · **Mostrador OPERABLE** B1 §128-§130 · **32 piezas reales v3** §131-§132 · catálogo voz+gema §134-§156 · legal e-commerce §157). Detalle histórico → `99`/`00`. **paso 7 catalogo.json→CDN**: 7a ✅, falta 7b-7d (= Bloque D del plan Fable). **Pend operativo Daniel**: precios (⛔ GATE Bloque A) + imágenes IA. Decisión 4b (TODO-39) · factura multi-línea (TODO-41). **MCP Firebase = escritura prod**. `arquitecto-software` SIEMPRE. |
| **Backend / Firebase** | CRM + Fase M (M0→M6) EN PROD (§47-§82). **🔄 RESET-A-CERO** (Daniel 2026-06-20): cartera/clientes históricos = **DESECHABLES**. Vendedoras = dato (Kary crea); CRM admin/owner-only. `recalcSaldoCliente` viva. ⚠️ Reglas/functions = deploy MANUAL (L-22). **WOMPI WEB = OPERATIVO Y VERIFICADO EN PROD (§164, gate A.9 EJECUTADO)**: URL Eventos corregida+persistida · webhook DECLINED real auditado · reaper repone verificado · gracias estado-real+comprobante · alerta `venta-web-pagada` a Kary. **Falta solo OPERATIVO: cargar precios reales** (cada pieza con precio se vuelve comprable) + **monitorear la 1ª venta APPROVED**. → `10` TODO-65. |
| **Hosting** | GitHub Pages (`bersagliojewelry.co` / `.github.io`), auto-deploy por Actions on-push-a-`main` (+ paso SSG `generate` + gate `SSG_SELFTEST` + cron diario, §116) · **GEMELO** `bersaglio-gemelo.web.app` (Spark, aula/banco de pruebas/restore, §61). |
| **Cerebro** | 🧠 template v1.0.0 · kernel v1.1 (byte-idéntico ×3, §56) · cerebros INDEPENDIENTES · skills catalogadas. **GC (TODO-32 ✅)**: shard `30`→`32-LECCIONES-CARGA` + `00` ratchet 28k; `20`/`31` ≥90% (nudge informativo). Auditoría Nivel-2 §114 (2026-06-24). |

## ⚠️ Flags de riesgo activos (→ hardening F6 · detalle `docs/41-SEGURIDAD.md`)
- 🟠 **Deploy reglas/functions = MANUAL** (CI = Pages only, **L-22**): `firebase deploy --only firestore:rules,firestore:indexes,functions`. Functions Node 22 + ff v7 ✅ (§48).
- 🟠 **F6**: App Check REPARADO (§58) — **TODO-14 Enforce DIFERIDO** hasta flujo alto de clientes (Daniel 2026-06-23); queda en monitoreo. 🏁 F6 técnico COMPLETO (§68): RBAC claims (§65/§66) + alerta de truncado (§68). Resto del programa: App Check Enforce + compuerta de adopción → Fase M; política cartera APROBADA → config en Fase M.
- 🟢 **PLAN FABLE §158-§164 COMPLETO**: backend A/B/C/E EN PROD (deploy manual 2026-07-03) + **encendido A.9 EJECUTADO (§164)**. Monitoreo 2026-07-04: pedido DECLINED del gate quedó `expirado` (reaper OK post-cierre) · 0 pedidos nuevos · Pages VERDE re-verificado (runs success, prod sirve v71; flag `47ccfe6` resuelto). **GATE vivo = OPERATIVO: precios reales (Daniel/Kary) + monitorear 1ª APPROVED.** Remanentes P3 §161.7 y Bloque D ABSORBIDOS por el **PLAN ÚNICO ERP v4 (TODO-68**, spec `2026-07-04-plan-unico-erp-v4`) — roadmap vigente: F1 Pedidos&Logística → F2 POS completo → F3 Inventario → carril D → F4-F6.

## 🧩 Sub-sistemas
Liquid Glass (Vite) ✅ · Sync en vivo Firestore ✅ · Checkout Stepper 3 pasos ✅ · Cart/Wishlist drawers ✅ · Animaciones staggered ✅
