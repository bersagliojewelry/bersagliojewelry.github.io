# 🩺 05 — ESTADO GLOBAL (Heartbeat · Snapshot de salud del sistema)

> **Nodo neuronal: signos vitales.** Se **AUTO-CARGA** (junto a `CLAUDE.md` +
> `docs/10-MEMORIA-CORTO-PLAZO.md`). Responde *"¿en qué estado está el sistema AHORA, antes de
> tocar nada?"*. Lo lee el **Reflejo de Auto-auditoría (`CLAUDE.md §G.4`)** al arrancar.
>
> **Mantenimiento (Reflejo de Frescura §G.4)**: actualizar al cambiar cache version,
> branch o al detectar/resolver un riesgo. **Tope ~25 líneas (§G.5)**.

| Señal | Valor (al 2026-06-21) |
|---|---|
| **Build** | 🟢 Vite VERDE (~5s). Panel v2 en prod (§50-§53); norte = spec maestra v3. Suite local verde: acuerdos 18/18 (A8 §87) · estado 24 · paridad byte 4 · saldo 12 · reconciliación 9 · **rules 186** (emulador Java; +films/social/journal-gate + href §88) · resource-admin 17 · no-demo 10 (gate L-42 estado-cero ×5 secciones, §90) · backup 7. ⚠️ Preview headless no pinta dinámico (L-05) → verificar en `dev`/deploy. |
| **Cache version vigente** | `bersaglio-v27` (`public/sw.js`). Bump por §107 (**F2.0**: View Transitions cross-document → cross-fade entre páginas, sin flash blanco). v26=revert LQIP §106 · v25=§105 recarga · v24=§104 F1. Indicador `APP_VERSION` = criterio de deploy. |
| **Branch activa** | `origin/main` (PROD) = `282d58d` (**PR #323**) · `Desarrollo` SINCRONIZADO. **Web "app-like" §103-§112 CERRADO EN PROD ✅** (validado Daniel + extensión Chrome): View Transitions §107 + caché SWR §108 (F1/F3) + LQIP siteContent/catálogo/wishlist/detalle §111/111.8 + Cache-Control Storage §112 (fix del "blur en cada visita": objetos sin cacheControl → `private,max-age=0`). Migraciones EJECUTADAS en prod: LQIP 8/8 (§110.4) + cache-control 18/18 (§112) + **§113 correo OWNER → `danielrome_drm@hotmail.com`** (bersaglio libre para Kary), SA key bersaglio. **🎯 Foco = usuarios&permisos** (TODO-19 rol catálogo Kary + candado reglas · TODO-31 auto-creación/flicker). Patrón `scripts/migrate-*.mjs` reusable. Cola: cerebro cars · C1 · responsive · CSS muerto. `arquitecto-software` SIEMPRE. **🔄 RESET-A-CERO** (Kary). ⚙️ OPUS 4.8 interino. 1er corte 1-jul. |
| **Cerebro** | 🧠 template v1.0.0 (canon) · **kernel v1.1** (`brain-check.mjs` byte-idéntico ×3 + manifest + `archiveDir`; ADR §56 2026-06-09) · **cerebros INDEPENDIENTES** (cars §171/§172) · skills 79 catalogadas ×4 repos (+`caza-bugs`; set emparejado cross-repo por cars) · ⏳ GC tres palancas (CLAUDE.md+10+30 sobre cap ↗; 30→shard `31-LECCIONES-FIRESTORE` = TODO-27) · skill `caza-bugs` (§90) + INSTALACION→1.1.0 tracked (checklist v6 en cars). |
| **Backend / Firebase** | **CRM en prod + Reestructura Fase R desplegada** (ADR §47 + §49, 2026-06-06). **344 clientes** de Kary (**cartera $506.510.780**) + 12 pendientes. **Fase R**: vendedoras = entidad de datos (`vendedoras/{id}`, Kary las crea); CRM (`clientes`/`movimientos`/`vendedoras`) **admin/owner-only**; rol `vendedora` + app + `solicitudesCorreccion` ELIMINADOS. `recalcSaldoCliente` viva (Node 22 / ff v7). ⚠️ Reglas/functions = deploy manual (L-22). **Pendiente: smoke de panel por Kary · Fase M (movimientos robustos) · revisar nombres.** |
| **Hosting** | GitHub Pages (`bersagliojewelry.co` / `.github.io`), auto-deploy vía Actions · **GEMELO**: `bersaglio-gemelo.web.app` (Spark sin Blaze, aula/banco de pruebas/restore, §61; deploy con `firebase.gemelo.json`). |

## ⚠️ Flags de riesgo activos (→ hardening F6 · detalle en `docs/41-SEGURIDAD.md`)
- 🟠 **Deploy reglas/functions = MANUAL** (CI es Hosting/Pages only, **L-22**): `firebase deploy --only firestore:rules,firestore:indexes,functions`. ✅ Functions Node 22 + ff v7 (ADR §48).
- 🟠 **F6 en curso**: App Check REPARADO (§58, canje 200 en vivo) — TODO-14: **Enforce DIFERIDO** hasta flujo alto de clientes (Daniel 2026-06-23: sin tráfico representativo el monitoreo no es preciso); queda en monitoreo. Forms endurecidos ✅ (§59) · CI+entero-COP ✅ (§62) · PRE-1 backup+restore ✅ (§63) · **reconciliación+Salud ✅ DESPLEGADA (§64)** (§64 mergeado a `main` PR #214). **🏁 F6 TÉCNICO COMPLETO (§68)**: RBAC claims DESPLEGADO (§65: claim owner sellado, reglas con §66) + alerta de truncado visible (§68, viaja con el PR; paginación GATED a materializar aging — el banner es el gate). Falta del programa: App Check Enforce (monitor ×7d, TODO-14) + compuerta de adopción → Fase M. Luego: política cartera APROBADA → config en Fase M.

## 🧩 Sub-sistemas (resumen)
Diseño Liquid Glass (Vite/Bundled) ✅ · Sincronización en vivo con Firestore ✅ · Checkout Stepper de 3 pasos ✅ · Cart Drawer lateral ✅ · Animaciones de entrada Staggered ✅
