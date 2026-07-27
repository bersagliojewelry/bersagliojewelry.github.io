# 🩺 05 — ESTADO GLOBAL (Heartbeat · Snapshot de salud del sistema)

> **Nodo: signos vitales.** AUTO-CARGA (con `CLAUDE.md` + `10`): *"¿en qué estado está el sistema AHORA,
> antes de tocar nada?"*. Tablero, no bitácora — se PISA, no se apila (**tope ~25 líneas**, §G.5); se
> actualiza al cambiar cache/branch/riesgo (Frescura §G.4).
> **NUNCA el hash/PR exacto de PROD** (se vuelve stale — lo cazó la auditoría §114 ×3): el commit vivo lo
> dice `git fetch` (§3.3); aquí el estado va por CONTENIDO.

| Señal | Valor (al 2026-07-25) |
|---|---|
| **Build** | 🟢 Vite VERDE (~4s). Panel v2 en prod (§50-§53); norte = spec maestra v3. Suite local verde (rules 248 · cartera 26 · **teso 38** · caja 38 · y las puras). ⚠️ Preview headless no pinta dinámico (L-05) → verificar en `dev`/deploy. |
| **Cache version vigente** | `bersaglio-v98` (`public/sw.js`; SW↔05 OK; admin `APP_VERSION v59`). v98 = F-TESORERÍA B2-B5 (**DESPLEGADO 2026-07-24**; V17 el 25 solo bumpeó APP_VERSION: `SHELL_ASSETS` no precachea JS/HTML del panel). |
| **PROD / branch** | `Desarrollo`≡`main` alineados (**merge a main = Claude**, `[[feedback_claude_deploy_autorizado]]`; **commit exacto → `git fetch`**, §114). **EN PROD hasta §192** (verificado-vivo:2026-07-18, `git fetch` + barrido Chrome) — rail v2 · POS-pro · F2.2 · 32 piezas v3 · SEO A1-A4+B2 ✅ · garantía de por vida (§191) · legal; detalle → ADRs. Deploy functions/rules = MANUAL (CI = Pages/Hosting; L-22). **Precios reales = PASO FINAL** (Daniel: al lanzar a Kary, NO es gate intermedio). **MCP Firebase = escritura prod**. `arquitecto-software` SIEMPRE. |
| **Backend / Firebase** | CRM + Fase M (M0→M6) EN PROD (§47-§82). **🔄 RESET-A-CERO** (Daniel 2026-06-20): cartera/clientes históricos = **DESECHABLES**. Vendedoras = dato (Kary crea); CRM admin/owner-only. ⚠️ Reglas/functions = deploy MANUAL (L-22). **WOMPI WEB OPERATIVO Y VERIFICADO EN PROD (§164)**. Falta OPERATIVO: **cargar precios reales** (Daniel/Kary) + **monitorear 1ª venta APPROVED**. |
| **Hosting** | GitHub Pages (`bersagliojewelry.co` / `.github.io`), auto-deploy por Actions on-push-a-`main` (+ paso SSG `generate` + gate `SSG_SELFTEST` + cron diario, §116) · **GEMELO** `bersaglio-gemelo.web.app` (Spark, aula/banco de pruebas/restore, §61). |
| **Cerebro** | 🧠 template v1.0.0 · kernel v1.1 (byte-idéntico ×3, §56) · cerebros INDEPENDIENTES · skills catalogadas. **GC 25jul (TODO-77 ✅)**: `00`→`00c` (§158-§175) · `31`→`35-LECCIONES-DINERO`; el resto en leve exceso. Auditoría Nivel-2 §175. |

## ⚠️ Flags de riesgo activos (→ hardening F6 · detalle `docs/41-SEGURIDAD.md`)
- 🟠 **Deploy reglas/functions = MANUAL** (CI = Pages only, **L-22**): `firebase deploy --only firestore:rules,firestore:indexes,functions`. Functions Node 22 + ff v7 ✅ (§48).
- 🟠 **F6**: App Check REPARADO (§58) — **TODO-14 Enforce DIFERIDO** hasta flujo alto de clientes (Daniel 2026-06-23); queda en monitoreo. 🏁 F6 técnico COMPLETO (§68): RBAC claims (§65/§66) + alerta de truncado (§68). Resto del programa: App Check Enforce + compuerta de adopción → Fase M; política cartera APROBADA → config en Fase M.
- 🟢 **Roadmap = plan maestro v5** (spec `2026-07-10`). F1→F2.2 + caja tiempo real + POS-pro + **F-IA-2 ✅** EN PROD (§165-§192; `enforceTurno:true`/`identidad.activo` LIVE). **F-TESORERÍA (TODO-78) = B0→B6 ✅ COMPLETA EN PROD** (§194: B6 rompimiento → 1 P0 + 1 P1 arreglados con TDD y desplegados; 6 P2 a la cola §8). **PENDIENTE: auditoría del titular** (§4) antes de Kary. SIGUE: → F-REPORTES → F2.4 apartados (TODO-39) → 2.3 térmica → limpieza → rompimiento → **lanzamiento (ahí: precios reales)**. 1ª APPROVED ✅.
- 🟣 **INTERINATO** · #3 ✅ auditado (§192). **#4 EN CURSO — `OPUS 5`** (marca `[OPUS-5]` + footer Opus 5). B0 auditado · B1 del titular · **B2·B3·B4 ✅ (los ejecutó Opus 5; sus commits llevan `[OPUS-4.8]` heredado por ERROR — pusheado, NO se reescribe: auditar por AMBOS marcadores) · B5 ✅ · **B6 ✅ COMPLETO** `[OPUS-5]`** (27jul §194: rompimiento adversarial; el P0 vivía en la costura que el propio interinato creó en B5 — auditar el UNDO de cada flujo con pata). **#4 ENTREGADO 27jul: el TITULAR (Fable) retoma** — audita B0→B6 al volver (patrón §158/§161) y arranca en el comité ×3 de F-COMPRAS. Spec = 3 capas de refutación (§0.6/§0.7/§0.8: Kary carga sus cuentas por UI, cero seed). **Zonas calientes R3: bóveda(V1)+caja(V17)** = test primero (B5). **Gate Daniel: Kary NO usa hasta confiabilidad 100%.**

## 🧩 Sub-sistemas
Liquid Glass (Vite) ✅ · Sync en vivo Firestore ✅ · Checkout Stepper 3 pasos ✅ · Cart/Wishlist drawers ✅ · Animaciones staggered ✅
