# 🩺 05 — ESTADO GLOBAL (Heartbeat · Snapshot de salud del sistema)

> **Nodo neuronal: signos vitales.** Se **AUTO-CARGA** (junto a `CLAUDE.md` +
> `docs/10-MEMORIA-CORTO-PLAZO.md`). Responde *"¿en qué estado está el sistema AHORA, antes de
> tocar nada?"*. Lo lee el **Reflejo de Auto-auditoría (`CLAUDE.md §G.4`)** al arrancar.
>
> **Mantenimiento (Reflejo de Frescura §G.4)**: actualizar al cambiar cache version,
> branch o al detectar/resolver un riesgo. **Tope ~25 líneas (§G.5)**.

| Señal | Valor (al 2026-06-07) |
|---|---|
| **Build** | 🟢 Vite VERDE (✓ ~3.2s). **Rediseño Fase 1 (mirror) aplicado**: shell global + Home (modularizada `js/home/*` + Atelier + Films + Redes + dock Atajos) + Nosotros + Contacto. Verificado por build + estructura DOM + **pulido de doctrina (transition/radii/#000) aplicado y verificado en vivo** (ADR §41, build ✓3.68s). ⚠️ Preview headless local no pinta dinámico (L-05) — verificar visual en `npm run dev`/deploy. · **Panel v2 F-CHASIS-A desplegado** (ADR §50): navegación "C" como dato (`renderSidebar`/`sidebar-data`) + `adm-money` + saldo por tokens. Norte (mini-ERP): spec `specs/2026-06-07-bersaglio-arquitectura-maestra-design.md` v3. **Morosos/Vencidos (ADR §51) construido en `Desarrollo` (sin desplegar)**: mora EN VIVO (helper puro `crm-estado-cuenta.js`, FIFO) + `fecha` en movimientos + KPI cartera vencida. Tests: sidebar 6/6 · estado 15/15 · saldo 12/12 · rules 37/37. |
| **Cache version vigente** | `bersaglio-v9` (en `public/sw.js`). Bump por HOTFIX prod (restaurar fallback de llaves Firebase). |
| **Branch activa** | `Desarrollo` (`e3c6d72`). **Prod `main` = `0cfdb1d` (PR #199) DESPLEGADO 2026-06-07**: rediseño + CRM + Fase R + Panel v2 F-CHASIS-A + **PRE-integridad §13 (append-only/idempotencia) + MOROSOS/VENCIDOS §51 (aging)**. Reglas+functions desplegadas (`firebase deploy`); 6 functions nodejs22 vivas; `bersagliojewelry.co` HTTP 200. `git fetch` antes de afirmar (L-26). |
| **Cerebro** | 🧠 template v1.0.0 · `brain:check` SANO (sin huérfanos/vacíos) · skills: 74 catalogadas, 3 instaladas user-level (`~/.claude/skills/`). |
| **Backend / Firebase** | **CRM en prod + Reestructura Fase R desplegada** (ADR §47 + §49, 2026-06-06). **344 clientes** de Kary (**cartera $506.510.780**) + 12 pendientes. **Fase R**: vendedoras = entidad de datos (`vendedoras/{id}`, Kary las crea); CRM (`clientes`/`movimientos`/`vendedoras`) **admin/owner-only**; rol `vendedora` + app + `solicitudesCorreccion` ELIMINADOS. `recalcSaldoCliente` viva (Node 22 / ff v7). ⚠️ Reglas/functions = deploy manual (L-22). **Pendiente: smoke de panel por Kary · Fase M (movimientos robustos) · revisar nombres.** |
| **Hosting** | GitHub Pages (`bersagliojewelry.co` o `bersagliojewelry.github.io`). Auto-deploy vía GitHub Actions. |

## ⚠️ Flags de riesgo activos (→ Fase 2 hardening · detalle en `docs/41-SEGURIDAD.md`)
- 🟢 **Incidente prod L-14 RESUELTO**: fallback de llaves restaurado; **sitio en vivo verificado HTTP 200** (`bersagliojewelry.co` + `.github.io`, 2026-06-06). Opcional: poblar secrets `VITE_*` en GitHub (el fallback ya cubre). Detalle: `41 §1.5` + `30 L-14`.
- 🟠 **Deploy reglas/functions = MANUAL** (CI es Hosting/Pages only, **L-22**): `firebase deploy --only firestore:rules,firestore:indexes,functions`. Reglas S5/S6 + CRM desplegadas. ✅ **Functions en Node 22 + firebase-functions v7** (ADR §48 — deuda runtime resuelta). Tier C pendiente (App Check, CSP, S2 storage).

## 🧩 Sub-sistemas (resumen)
Diseño Liquid Glass (Vite/Bundled) ✅ · Sincronización en vivo con Firestore ✅ · Checkout Stepper de 3 pasos ✅ · Cart Drawer lateral ✅ · Animaciones de entrada Staggered ✅
