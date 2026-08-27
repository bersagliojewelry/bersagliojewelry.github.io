# 🩺 05 — ESTADO GLOBAL (Heartbeat · Snapshot de salud del sistema)

> **Nodo: signos vitales.** AUTO-CARGA (con `CLAUDE.md` + `10`): *"¿en qué estado está el sistema AHORA,
> antes de tocar nada?"*. Tablero, no bitácora — se PISA, no se apila (su tope lo fija el manifest, §G.5 — no se copia aquí); se
> actualiza al cambiar cache/branch/riesgo (Frescura §G.4).
> **NUNCA el hash/PR exacto de PROD** (se vuelve stale — lo cazó la auditoría §114 ×3): el commit vivo lo
> dice `git fetch` (§3.3); aquí el estado va por CONTENIDO.

| Señal | Valor (al 2026-07-25) |
|---|---|
| **Build** | 🟢 Vite VERDE (~4s). Panel v2 en prod (§50-§53); norte = spec maestra v3. Suite local verde (rules 248 · cartera 26 · **teso 38** · caja 38 · y las puras). ⚠️ Preview headless no pinta dinámico (L-05) → verificar en `dev`/deploy. |
| **Cache** | ⚙️ El nº vigente lo GENERA el heartbeat → `docs/.estado-auto.md` (no se copia aquí: se desincroniza). Juicio: v98 = F-TESORERÍA B2-B5, desplegada 24-jul; admin va por `APP_VERSION` aparte. ⚠️ `SHELL_ASSETS` **no** precachea JS/HTML del panel, así que bumpear APP_VERSION sola no refresca el shell. |
| **PROD / branch** | ⚙️ Alineación de ramas y commit vivo → `docs/.estado-auto.md` + `git fetch` (§114: el hash exacto NUNCA se escribe aquí). Reglas: **merge a main = Claude** · deploy functions/rules **MANUAL** (el CI solo hace Pages/Hosting, L-22): `firebase deploy --only firestore:rules,firestore:indexes,functions` — Node 22 + ff v7 ✅ (§48) · **MCP Firebase escribe en PROD** · `arquitecto-software` SIEMPRE. **EN PROD hasta §192** `verificado-vivo:2026-07-18`: rail v2 · POS-pro · F2.2 · 32 piezas v3 · SEO A1-A4+B2 · garantía de por vida (§191) · legal. **Precios reales = PASO FINAL** (Daniel: al lanzar a Kary, no es gate intermedio). |
| **Backend / Firebase** | CRM + Fase M (M0→M6) EN PROD (§47-§82). **🔄 RESET-A-CERO** (Daniel 2026-06-20): cartera/clientes históricos = **DESECHABLES**. Vendedoras = dato (Kary crea); CRM admin/owner-only. ⚠️ Reglas/functions = deploy MANUAL (L-22). **WOMPI WEB OPERATIVO Y VERIFICADO EN PROD (§164)**. Falta OPERATIVO: **cargar precios reales** (Daniel/Kary) + **monitorear 1ª venta APPROVED**. |
| **Hosting** | GitHub Pages (`bersagliojewelry.co` / `.github.io`) `verificado-vivo: 2026-08-27` (el `.github.io` redirige 301 → `.co`, que responde 200 con su título e indexable; el sello cubre SOLO que la web sirve), auto-deploy por Actions on-push-a-`main` (+ paso SSG `generate` + gate `SSG_SELFTEST` + cron diario, §116) · **GEMELO** `bersaglio-gemelo.web.app` (Spark, aula/banco de pruebas/restore, §61). |
| **Cerebro** | 🧠 kernel byte-idéntico ×4 (versión → su stamp) · template v1.1.0 · cerebros INDEPENDIENTES · skills catalogadas · caps → manifest. Auditoría Nivel-2 → §175. |

## ⚠️ Flags de riesgo activos (→ hardening F6 · detalle `docs/41-SEGURIDAD.md`)
- 🟠 **F6**: App Check REPARADO (§58) — **TODO-14 Enforce DIFERIDO** hasta flujo alto de clientes (Daniel 2026-06-23); queda en monitoreo. 🏁 F6 técnico COMPLETO (§68): RBAC claims (§65/§66) + alerta de truncado (§68). Resto del programa: App Check Enforce + compuerta de adopción → Fase M; política cartera APROBADA → config en Fase M.
- 🟢 **Roadmap = plan maestro v5** (spec `2026-07-10`). F1→F2.2 + caja tiempo real + POS-pro + **F-IA-2 ✅** EN PROD (§165-§192; `enforceTurno:true`/`identidad.activo` LIVE). **F-TESORERÍA (TODO-78) = B0→B6 ✅ COMPLETA EN PROD** (§194: B6 rompimiento → 1 P0 + 1 P1 arreglados con TDD y desplegados; 6 P2 a la cola §8). **PENDIENTE: auditoría del titular** (§4) antes de Kary. SIGUE: → F-REPORTES → F2.4 apartados (TODO-39) → 2.3 térmica → limpieza → rompimiento → **lanzamiento (ahí: precios reales)**. 1ª APPROVED ✅.
- 🟣 **INTERINATO #4 = `[OPUS-5]`** (quién ejecuta y con qué protocolo → `10`, dueño del WIP). ⚠️ **Auditar por AMBOS marcadores**: B2·B3·B4 llevan `[OPUS-4.8]` heredado por error y NO se reescriben (ya pusheados). El titular audita B0→B6 + el comité de F-COMPRAS al volver (§158/§161). **Gate de Daniel: Kary NO usa hasta confiabilidad 100%.** Narrativa → §192-§194.

## 🧩 Sub-sistemas
Liquid Glass (Vite) ✅ · Sync en vivo Firestore ✅ · Checkout Stepper 3 pasos ✅ · Cart/Wishlist drawers ✅ · Animaciones staggered ✅
