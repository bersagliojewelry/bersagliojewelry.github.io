# 🩺 05 — ESTADO GLOBAL (Heartbeat · Snapshot de salud del sistema)

> **Nodo neuronal: signos vitales.** Se **AUTO-CARGA** (junto a `CLAUDE.md` +
> `docs/10-MEMORIA-CORTO-PLAZO.md`). Responde *"¿en qué estado está el sistema AHORA, antes de
> tocar nada?"*. Lo lee el **Reflejo de Auto-auditoría (`CLAUDE.md §G.4`)** al arrancar.
>
> **Mantenimiento (Reflejo de Frescura §G.4)**: actualizar al cambiar cache version,
> branch o al detectar/resolver un riesgo. **Tope ~25 líneas (§G.5)**.

| Señal | Valor (al 2026-06-09) |
|---|---|
| **Build** | 🟢 Vite VERDE (✓ ~3.2s). **Rediseño Fase 1 (mirror) aplicado**: shell global + Home (modularizada `js/home/*` + Atelier + Films + Redes + dock Atajos) + Nosotros + Contacto. Verificado por build + estructura DOM + **pulido de doctrina (transition/radii/#000) aplicado y verificado en vivo** (ADR §41, build ✓3.68s). ⚠️ Preview headless local no pinta dinámico (L-05) — verificar visual en `npm run dev`/deploy. · **Panel v2 F-CHASIS-A desplegado** (ADR §50): navegación "C" como dato (`renderSidebar`/`sidebar-data`) + `adm-money` + saldo por tokens. Norte (mini-ERP): spec `specs/2026-06-07-bersaglio-arquitectura-maestra-design.md` v3. **Morosos/Vencidos (ADR §51) construido en `Desarrollo` (sin desplegar)**: mora EN VIVO (helper puro `crm-estado-cuenta.js`, FIFO) + `fecha` en movimientos + KPI cartera vencida. Tests: sidebar 6/6 · estado 15/15 · saldo 12/12 (entero-COP §62) · rules **53/53** (§59+§62) · backup-codec 7/7 (§60). |
| **Cache version vigente** | `bersaglio-v9` (en `public/sw.js`). Bump por HOTFIX prod (restaurar fallback de llaves Firebase). |
| **Branch activa** | `Desarrollo` (F5/F4 mergeados a `main`; **F6 App Check §54 sin mergear**). Prod `main` (PR #199+) DESPLEGADO: rediseño + CRM + Fase R + Panel v2 + PRE-integridad + Morosos §51 + **F5 filtros §52 + F4 Bandeja §53**. **7 functions** nodejs22 vivas (+`backupDiario` §60: backup 3AM + retención 30d; 1ª corrida por verificar); `.co` HTTP 200. `git fetch` antes de afirmar (L-26). |
| **Cerebro** | 🧠 template v1.0.0 (canon) · **kernel v1.1** (`brain-check.mjs` byte-idéntico ×3 + manifest + `archiveDir`; ADR §56 2026-06-09) · **cerebros INDEPENDIENTES** (cars §171/§172) · skills 77 catalogadas (4 de gobernanza versionadas en `skills/`) · ⏳ GC dos palancas (CLAUDE.md+10 sobre cap ↗) + INSTALACION→1.1.0 tracked (checklist v6 en cars). |
| **Backend / Firebase** | **CRM en prod + Reestructura Fase R desplegada** (ADR §47 + §49, 2026-06-06). **344 clientes** de Kary (**cartera $506.510.780**) + 12 pendientes. **Fase R**: vendedoras = entidad de datos (`vendedoras/{id}`, Kary las crea); CRM (`clientes`/`movimientos`/`vendedoras`) **admin/owner-only**; rol `vendedora` + app + `solicitudesCorreccion` ELIMINADOS. `recalcSaldoCliente` viva (Node 22 / ff v7). ⚠️ Reglas/functions = deploy manual (L-22). **Pendiente: smoke de panel por Kary · Fase M (movimientos robustos) · revisar nombres.** |
| **Hosting** | GitHub Pages (`bersagliojewelry.co` / `.github.io`), auto-deploy vía Actions · **GEMELO**: `bersaglio-gemelo.web.app` (Spark sin Blaze, aula/banco de pruebas/restore, §61; deploy con `firebase.gemelo.json`). |

## ⚠️ Flags de riesgo activos (→ hardening F6 · detalle en `docs/41-SEGURIDAD.md`)
- 🟠 **Deploy reglas/functions = MANUAL** (CI es Hosting/Pages only, **L-22**): `firebase deploy --only firestore:rules,firestore:indexes,functions`. ✅ Functions Node 22 + ff v7 (ADR §48).
- 🟠 **F6 en curso · App Check REPARADO 2026-06-09** (ADR §58): causa real = API key del navegador con allowlist SIN "Firebase App Check API" (`API_KEY_SERVICE_BLOCKED`; la hipótesis "llave secreta" §57.3 quedó descartada). Daniel añadió la API (6→7) en GCP → canje `exchangeRecaptchaV3Token` **200 verificado en vivo**. TODO-14 restante: monitor ~100% verificadas ×7d → **Enforce** guiado (PROHIBIDO antes, L-32). 2FA Google+GitHub ✅. **Forms públicos endurecidos ✅ DESPLEGADO** (§59: forma exacta + push_tokens cerrado; rules 51/51). Resto F6: CI rule-test (TODO-10) · entero-COP · reconciliación/Salud · RBAC claims · backup PRE-1 (TODO-15, semana 1). **Próximo: backup+gemelo (semana 1 §57) · política cartera APROBADA → config en Fase M.**

## 🧩 Sub-sistemas (resumen)
Diseño Liquid Glass (Vite/Bundled) ✅ · Sincronización en vivo con Firestore ✅ · Checkout Stepper de 3 pasos ✅ · Cart Drawer lateral ✅ · Animaciones de entrada Staggered ✅
