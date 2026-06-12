# 🩺 05 — ESTADO GLOBAL (Heartbeat · Snapshot de salud del sistema)

> **Nodo neuronal: signos vitales.** Se **AUTO-CARGA** (junto a `CLAUDE.md` +
> `docs/10-MEMORIA-CORTO-PLAZO.md`). Responde *"¿en qué estado está el sistema AHORA, antes de
> tocar nada?"*. Lo lee el **Reflejo de Auto-auditoría (`CLAUDE.md §G.4`)** al arrancar.
>
> **Mantenimiento (Reflejo de Frescura §G.4)**: actualizar al cambiar cache version,
> branch o al detectar/resolver un riesgo. **Tope ~25 líneas (§G.5)**.

| Señal | Valor (al 2026-06-10) |
|---|---|
| **Build** | 🟢 Vite VERDE (✓ ~14s). Rediseño Fase 1 aplicado (shell + Home modular + Nosotros + Contacto; doctrina pulida §41). ⚠️ Preview headless local no pinta dinámico (L-05) — verificar en `npm run dev`/deploy. Panel v2 en prod (F-CHASIS-A §50 · Morosos §51 · F5 §52 · F4 §53); norte = spec maestra v3. Frente D §64 DESPLEGADO. **Frente B §65 + fix seg §66 construidos en `Desarrollo`**: RBAC custom claims + hardening `users/` owner-only. **CI de reglas REPARADO (§67, `8b12fc4`)**: estaba ROJO desde 2026-06-05 (emulador exigía Java 21, CI usaba 17) — NO era test rojo. Tests local: sidebar 7/7 · estado 15/15 · saldo 12/12 · reconciliación 9/9 · rules **100/100** (M1 §72 + M2a-1b §73 red-teamed) · backup-codec 7/7. |
| **Cache version vigente** | `bersaglio-v13` (`public/sw.js`). Bump por Fase M / M4 (auditoría en Salud + aviso SLA). Indicador `APP_VERSION` `v13` en el sidebar (criterio de deploy). |
| **Branch activa** | `Desarrollo` (adelante de `main` — falta PR de M4). **🔒 TREN M2a+M2b+M3 EN PROD (§77.8)** · **M4 CONSTRUIDO COMPLETO** (reglas+CF DESPLEGADAS · UI v13 verificada por 22 agentes, 12 fixes — bitácora del `10`). Falta: PR (Daniel) → verificar v13+sección en prod → ADR §78 + CRUDOs. **13 functions** nodejs22 vivas (`corteMensual` 1° de mes 03:50 + `generarCorte`); `.co` HTTP 200. `git fetch` antes de afirmar (L-26). |
| **Cerebro** | 🧠 template v1.0.0 (canon) · **kernel v1.1** (`brain-check.mjs` byte-idéntico ×3 + manifest + `archiveDir`; ADR §56 2026-06-09) · **cerebros INDEPENDIENTES** (cars §171/§172) · skills 77 catalogadas (4 de gobernanza versionadas en `skills/`) · ⏳ GC dos palancas (CLAUDE.md+10 sobre cap ↗) + INSTALACION→1.1.0 tracked (checklist v6 en cars). |
| **Backend / Firebase** | **CRM en prod + Reestructura Fase R desplegada** (ADR §47 + §49, 2026-06-06). **344 clientes** de Kary (**cartera $506.510.780**) + 12 pendientes. **Fase R**: vendedoras = entidad de datos (`vendedoras/{id}`, Kary las crea); CRM (`clientes`/`movimientos`/`vendedoras`) **admin/owner-only**; rol `vendedora` + app + `solicitudesCorreccion` ELIMINADOS. `recalcSaldoCliente` viva (Node 22 / ff v7). ⚠️ Reglas/functions = deploy manual (L-22). **Pendiente: smoke de panel por Kary · Fase M (movimientos robustos) · revisar nombres.** |
| **Hosting** | GitHub Pages (`bersagliojewelry.co` / `.github.io`), auto-deploy vía Actions · **GEMELO**: `bersaglio-gemelo.web.app` (Spark sin Blaze, aula/banco de pruebas/restore, §61; deploy con `firebase.gemelo.json`). |

## ⚠️ Flags de riesgo activos (→ hardening F6 · detalle en `docs/41-SEGURIDAD.md`)
- 🟠 **Deploy reglas/functions = MANUAL** (CI es Hosting/Pages only, **L-22**): `firebase deploy --only firestore:rules,firestore:indexes,functions`. ✅ Functions Node 22 + ff v7 (ADR §48).
- 🟠 **F6 en curso**: App Check REPARADO (§58, canje 200 en vivo) — TODO-14: monitor ~100% ×7d → **Enforce** guiado (PROHIBIDO antes, L-32). Forms endurecidos ✅ (§59) · CI+entero-COP ✅ (§62) · PRE-1 backup+restore ✅ (§63) · **reconciliación+Salud ✅ DESPLEGADA (§64)** (10 functions; §64 mergeado a `main` PR #214). **🏁 F6 TÉCNICO COMPLETO (§68)**: RBAC claims DESPLEGADO (§65: 11 functions, claim owner sellado, reglas con §66) + alerta de truncado visible (§68, viaja con el PR; paginación GATED a materializar aging — el banner es el gate). Falta del programa: App Check Enforce (monitor ×7d, TODO-14) + compuerta de adopción → Fase M. Luego: política cartera APROBADA → config en Fase M.

## 🧩 Sub-sistemas (resumen)
Diseño Liquid Glass (Vite/Bundled) ✅ · Sincronización en vivo con Firestore ✅ · Checkout Stepper de 3 pasos ✅ · Cart Drawer lateral ✅ · Animaciones de entrada Staggered ✅
