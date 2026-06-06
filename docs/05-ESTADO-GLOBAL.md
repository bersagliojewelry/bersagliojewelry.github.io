# 🩺 05 — ESTADO GLOBAL (Heartbeat · Snapshot de salud del sistema)

> **Nodo neuronal: signos vitales.** Se **AUTO-CARGA** (junto a `CLAUDE.md` +
> `docs/10-MEMORIA-CORTO-PLAZO.md`). Responde *"¿en qué estado está el sistema AHORA, antes de
> tocar nada?"*. Lo lee el **Reflejo de Auto-auditoría (`CLAUDE.md §G.4`)** al arrancar.
>
> **Mantenimiento (Reflejo de Frescura §G.4)**: actualizar al cambiar cache version,
> branch o al detectar/resolver un riesgo. **Tope ~25 líneas (§G.5)**.

| Señal | Valor (al 2026-06-06) |
|---|---|
| **Build** | 🟢 Vite VERDE (✓ ~3.2s). **Rediseño Fase 1 (mirror) aplicado**: shell global + Home (modularizada `js/home/*` + Atelier + Films + Redes + dock Atajos) + Nosotros + Contacto. Verificado por build + estructura DOM + **pulido de doctrina (transition/radii/#000) aplicado y verificado en vivo** (ADR §41, build ✓3.68s). ⚠️ Preview headless local no pinta dinámico (L-05) — verificar visual en `npm run dev`/deploy. |
| **Cache version vigente** | `bersaglio-v9` (en `public/sw.js`). Bump por HOTFIX prod (restaurar fallback de llaves Firebase). |
| **Branch activa** | `Desarrollo` (`f76ee51`, ya es ancestro de `main`). **Prod `main` = `a04b1a3` (PR #189) DESPLEGADO**: rediseño Fase 1 + CRM completo. Sitio en vivo HTTP 200 verif. 2026-06-06. |
| **Cerebro** | 🧠 template v1.0.0 · `brain:check` SANO (sin huérfanos/vacíos) · skills: 74 catalogadas, 3 instaladas user-level (`~/.claude/skills/`). |
| **Backend / Firebase** | **CRM Fase 3 DESPLEGADO A PROD + MIGRADO** (ADR §47, 2026-06-06). Reglas+índices+functions desplegadas manual (`recalcSaldoCliente` viva en prod). **Migración Fase A hecha**: **344 clientes** de Kary (corte 2026-06-06), **cartera $506.510.780**, saldos 345/345 exactos (se borró 1 fila "TOTAL" basura, L-24); **12 pendientes** sembrados. B1-B5 + editabilidad. Datos: `js/crm-service.js`. ⚠️ El CI NO despliega reglas/functions → manual (L-22). **Pendiente: vendedoras (faltan correos), revisar nombres con Kary, B6 reportes, atrasados.** |
| **Hosting** | GitHub Pages (`bersagliojewelry.co` o `bersagliojewelry.github.io`). Auto-deploy vía GitHub Actions. |

## ⚠️ Flags de riesgo activos (→ Fase 2 hardening · detalle en `docs/41-SEGURIDAD.md`)
- 🟢 **Incidente prod L-14 RESUELTO**: fallback de llaves restaurado; **sitio en vivo verificado HTTP 200** (`bersagliojewelry.co` + `.github.io`, 2026-06-06). Opcional: poblar secrets `VITE_*` en GitHub (el fallback ya cubre). Detalle: `41 §1.5` + `30 L-14`.
- 🟠 **Deploy reglas/functions = MANUAL** (CI es Hosting/Pages only, **L-22**): `firebase deploy --only firestore:rules,firestore:indexes,functions`. Reglas S5/S6 + CRM desplegadas. ✅ **Functions en Node 22 + firebase-functions v7** (ADR §48 — deuda runtime resuelta). Tier C pendiente (App Check, CSP, S2 storage).

## 🧩 Sub-sistemas (resumen)
Diseño Liquid Glass (Vite/Bundled) ✅ · Sincronización en vivo con Firestore ✅ · Checkout Stepper de 3 pasos ✅ · Cart Drawer lateral ✅ · Animaciones de entrada Staggered ✅
