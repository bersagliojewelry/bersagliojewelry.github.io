# 🩺 05 — ESTADO GLOBAL (Heartbeat · Snapshot de salud del sistema)

> **Nodo: signos vitales.** AUTO-CARGA (con `CLAUDE.md` + `10`). Responde *"¿en qué estado está el
> sistema AHORA, antes de tocar nada?"*. Lo lee el Reflejo de Auto-auditoría (`CLAUDE.md §G.4`) al arrancar.
> **Mantenimiento (Frescura §G.4)**: actualizar al cambiar cache/branch/riesgo. **Tope ~25 líneas (§G.5)**.
> **NO fijar aquí el hash/PR exacto de PROD** (se vuelve stale — lo cazó la auditoría §114 ×3): el commit
> vivo lo dice `git fetch` (§3.3 = fuente de verdad); aquí el estado va por CONTENIDO, no por hash.

| Señal | Valor (al 2026-06-26) |
|---|---|
| **Build** | 🟢 Vite VERDE (~5s). Panel v2 en prod (§50-§53); norte = spec maestra v3. Suite local verde (acuerdos·estado·paridad·saldo·reconciliación·rules 186·resource-admin·no-demo·backup). ⚠️ Preview headless no pinta dinámico (L-05) → verificar en `dev`/deploy. |
| **Cache version vigente** | `bersaglio-v43` (`public/sw.js`; verificado SW↔05; admin `APP_VERSION v26`). Último bump: **§134 voz de marca de las 32 piezas** — nombre evocador + descripción de 3 movimientos + badge por gema (escritos a Firestore vía MCP) + el badge por pieza ahora se ve en la TARJETA (`p.tag\|\|p.badge`). 9 destacadas con variedad entre colecciones. (v42 = footer/precio/slug §133.) `APP_VERSION` = criterio de deploy. |
| **PROD / branch** | `Desarrollo`≈`main` (**merge a main = Claude**, autoriz. 2026-06-27 `[[feedback_claude_deploy_autorizado]]`; **commit exacto → `git fetch`**, §114). **EN PROD ✅**: web app-like §103-§113 · rol catálogo Kary §115 · Visibilidad/SEO+GA4 §116 · ficha §118 + grilla/recos §119. **EN MAIN**: B1 completo hasta §130 ✅ — **Mostrador OPERABLE** (crear/confirmar-pago/VOID/arqueo Z/bruto-neto/export contador; CFs+reglas desplegadas; §128-§130 PR #369/#370). ⚠️ **Pruebas en vivo DIFERIDAS al final del plan+rediseño** (§130.4; build+tests por commit = red). **EN CURSO: paso 7 `catalogo.json` a CDN** (flujo COMPLETO: comité+Gemini; **7a ✅** SSG stock-aware+JSON `6436475`; falta **7b** cliente SWR·**7c** read-ficha·**7d** dispatch). **TODO-40 INVENTARIO v3 DESPLEGADO ✅ (§131) + 32 PIEZAS REALES CARGADAS ✅ (§132)**: reglas v3 + functions desplegadas; **32 piezas importadas de certificados TrueLab** (QR→scrape SPA→clasif por foto→MCP; código=Nº reporte, Oro 18k, "Consultar precio", imágenes temporales) — EN VIVO (grilla+ficha por fallback SPA; anillos10·dijes9·aretes5·pulseras3·topos3·cadenas2). **Pend (operativo Daniel)**: precios + imágenes IA (panel v3); deploy hornea fichas/sitemap (SEO). Visión = web cobra AUTO Wompi "Mercado Libre" → **F2** Wompi + **TODO-41** factura multi-línea. Decisión 4b (TODO-39) · IVA/retenciones (contador). **MCP Firebase = vía de escritura prod**. `arquitecto-software` SIEMPRE. ⚙️ OPUS 4.8 interino. |
| **Backend / Firebase** | CRM + Fase M (M0→M6) EN PROD (§47-§82). **🔄 RESET-A-CERO** (Daniel 2026-06-20): Kary recarga de cero → cartera/clientes históricos = **DESECHABLES** (no citar los 344/$506M como vivos). Vendedoras = dato (`vendedoras/{id}`, Kary las crea); CRM admin/owner-only. `recalcSaldoCliente` viva (Node 22 / ff v7). ⚠️ Reglas/functions = deploy MANUAL (L-22). |
| **Hosting** | GitHub Pages (`bersagliojewelry.co` / `.github.io`), auto-deploy por Actions on-push-a-`main` (+ paso SSG `generate` + gate `SSG_SELFTEST` + cron diario, §116) · **GEMELO** `bersaglio-gemelo.web.app` (Spark, aula/banco de pruebas/restore, §61). |
| **Cerebro** | 🧠 template v1.0.0 · kernel v1.1 (byte-idéntico ×3, §56) · cerebros INDEPENDIENTES · skills catalogadas. **GC (TODO-32 ✅)**: shard `30`→`32-LECCIONES-CARGA` + `00` ratchet 28k; `20`/`31` ≥90% (nudge informativo). Auditoría Nivel-2 §114 (2026-06-24). |

## ⚠️ Flags de riesgo activos (→ hardening F6 · detalle `docs/41-SEGURIDAD.md`)
- 🟠 **Deploy reglas/functions = MANUAL** (CI = Pages only, **L-22**): `firebase deploy --only firestore:rules,firestore:indexes,functions`. Functions Node 22 + ff v7 ✅ (§48).
- 🟠 **F6**: App Check REPARADO (§58) — **TODO-14 Enforce DIFERIDO** hasta flujo alto de clientes (Daniel 2026-06-23); queda en monitoreo. 🏁 F6 técnico COMPLETO (§68): RBAC claims (§65/§66) + alerta de truncado (§68). Resto del programa: App Check Enforce + compuerta de adopción → Fase M; política cartera APROBADA → config en Fase M.

## 🧩 Sub-sistemas
Liquid Glass (Vite) ✅ · Sync en vivo Firestore ✅ · Checkout Stepper 3 pasos ✅ · Cart/Wishlist drawers ✅ · Animaciones staggered ✅
