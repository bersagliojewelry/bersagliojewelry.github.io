# 🩺 05 — ESTADO GLOBAL (Heartbeat · Snapshot de salud del sistema)

> **Nodo neuronal: signos vitales.** Se **AUTO-CARGA** (junto a `CLAUDE.md` +
> `docs/10-MEMORIA-CORTO-PLAZO.md`). Responde *"¿en qué estado está el sistema AHORA, antes de
> tocar nada?"*. Lo lee el **Reflejo de Auto-auditoría (`CLAUDE.md §G.4`)** al arrancar.
>
> **Mantenimiento (Reflejo de Frescura §G.4)**: actualizar al cambiar cache version,
> branch o al detectar/resolver un riesgo. **Tope ~25 líneas (§G.5)**.

| Señal | Valor (al 2026-06-05) |
|---|---|
| **Build** | 🟢 Vite VERDE (✓ ~3.2s). **Rediseño Fase 1 (mirror) aplicado**: shell global + Home (modularizada `js/home/*` + Atelier + Films + Redes + dock Atajos) + Nosotros + Contacto. Verificado por build + estructura DOM + **pulido de doctrina (transition/radii/#000) aplicado y verificado en vivo** (ADR §41, build ✓3.68s). ⚠️ Preview headless local no pinta dinámico (L-05) — verificar visual en `npm run dev`/deploy. |
| **Cache version vigente** | `bersaglio-v9` (en `public/sw.js`). Bump por HOTFIX prod (restaurar fallback de llaves Firebase). |
| **Branch activa** | `Desarrollo` — rediseño Fase 1 **commiteado (`e290f83`) + pusheado a `origin/Desarrollo`** (0/0 ahead/behind, verif. 2026-06-05). Producción (`main`) sin tocar. |
| **Cerebro** | 🧠 template v1.0.0 · `brain:check` SANO (sin huérfanos/vacíos) · skills: 74 catalogadas, 3 instaladas user-level (`~/.claude/skills/`). |
| **Backend / Firebase** | **CRM Fase 3 Bloques 1-4 ✅ VERIFICADO E2E** (emuladores: login vendedora→factura/abono→CF→saldo en vivo; login owner→Panel Kary ve cartera). B1 RBAC · B2 CF saldo · B3 Panel Kary (`admin-cuentas/cuenta/config.html`) · B4 App vendedora (`vendedora*.html`, scoped). Datos: `js/crm-service.js`. + editabilidad (corregir saldo/editar cliente/días-plazo) + tablero Pendientes. **B5 cargador Fase A PROBADO** (345/345 exacto, `functions/cargar-migracion.mjs`). Tests rules 59 + saldo 12 + integración 5; build verde. **NO desplegado** (`main` intacto). **Siguiente = DÍA DE LANZAMIENTO: desplegar + migrar** (playbook en `10`). |
| **Hosting** | GitHub Pages (`bersagliojewelry.co` o `bersagliojewelry.github.io`). Auto-deploy vía GitHub Actions. |

## ⚠️ Flags de riesgo activos (→ Fase 2 hardening · detalle en `docs/41-SEGURIDAD.md`)
- 🟢 **Incidente prod 2026-06-06 RESUELTO en código**: quitar el fallback de llaves (S1) tumbó el sitio (secrets `VITE_*` no estaban en GitHub) → **fallback restaurado** (build verde); revive al desplegar. Pendiente: poblar secrets `VITE_*` en GitHub. Detalle: `41 §1.5` + `30 L-14`.
- 🟠 **Reglas/escala (Fase 2)**: ✅ S5 + S6 (⚠️ S6 tenía bug `==null` → corregido 2026-06-06, era el rojo de CI) + S3 (`limit(500)`). Pendiente Tier C: S2 storage (dep. S4 claims), App Check, CSP `<meta>`. ✅ **CI rules-test: misterio resuelto** (era S6); reactivar `push`/`pull_request` cuando Daniel pushee (`41 §1.5`). S5/S6 desplegadas vía merge a main; reglas CRM Bloque 1 aún NO en main.

## 🧩 Sub-sistemas (resumen)
Diseño Liquid Glass (Vite/Bundled) ✅ · Sincronización en vivo con Firestore ✅ · Checkout Stepper de 3 pasos ✅ · Cart Drawer lateral ✅ · Animaciones de entrada Staggered ✅
