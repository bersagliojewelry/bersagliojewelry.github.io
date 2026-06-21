# 🩺 05 — ESTADO GLOBAL (Heartbeat · Snapshot de salud del sistema)

> **Nodo neuronal: signos vitales.** Se **AUTO-CARGA** (junto a `CLAUDE.md` +
> `docs/10-MEMORIA-CORTO-PLAZO.md`). Responde *"¿en qué estado está el sistema AHORA, antes de
> tocar nada?"*. Lo lee el **Reflejo de Auto-auditoría (`CLAUDE.md §G.4`)** al arrancar.
>
> **Mantenimiento (Reflejo de Frescura §G.4)**: actualizar al cambiar cache version,
> branch o al detectar/resolver un riesgo. **Tope ~25 líneas (§G.5)**.

| Señal | Valor (al 2026-06-19) |
|---|---|
| **Build** | 🟢 Vite VERDE (~5s). Panel v2 en prod (§50-§53); norte = spec maestra v3. Suite local verde: acuerdos 18/18 (A8 §87) · estado 24 · paridad byte 4 · saldo 12 · reconciliación 9 · **rules 186** (emulador Java; +films/social/journal-gate + href §88) · resource-admin 17 · no-demo 6 · backup 7. ⚠️ Preview headless no pinta dinámico (L-05) → verificar en `dev`/deploy. |
| **Cache version vigente** | `bersaglio-v21` (`public/sw.js`). Bump por fix Categorías (§89: sección siempre montada + `:empty` colapsa dinámicas vacías). Indicador `APP_VERSION` en el sidebar = criterio de deploy. |
| **Branch activa** | `Desarrollo` ≈ `main` (**antes de mergear: `git fetch` + `reset --hard origin/main`**; Daniel mergea en paralelo por GitHub Desktop, L-26). **CMS web pública COMPLETO en prod** (§83-§86, PR #265-#267: WYSIWYG · textos · imágenes · `global` contacto). **TODO-24 — ÍNDICE 100% CERO-FICCIÓN CERRADO** (§88): Videos/Redes/Journal/Destacadas/Categorías hide-when-empty; Hero/Marquee/Editorial/Atelier/CTA always-on. **Reglas DESPLEGADAS + verificadas en vivo** (censo prod: catálogo+contenido VACÍO → sin lockout). v18 en prod (PR #272); **cliente v21 (href Redes + Destacadas + FIX Categorías §89 + SW) commiteado, pendiente merge Daniel** (`8abaab4`·`a566dc5`·`6b327a0`). **🔄 RESET-A-CERO** (Kary recarga TODO de cero). **R6 bug A8 RESUELTO** (§87 `55bc8ef`, red-team 0 hallazgos; gated, encender=Daniel). 🔒 TREN M0→M6 EN PROD. ⚙️ OPUS 4.8 interino. 1er corte = 1 jul. `.co` 200. |
| **Cerebro** | 🧠 template v1.0.0 (canon) · **kernel v1.1** (`brain-check.mjs` byte-idéntico ×3 + manifest + `archiveDir`; ADR §56 2026-06-09) · **cerebros INDEPENDIENTES** (cars §171/§172) · skills 77 catalogadas (4 de gobernanza versionadas en `skills/`) · ⏳ GC dos palancas (CLAUDE.md+10 sobre cap ↗) + INSTALACION→1.1.0 tracked (checklist v6 en cars). |
| **Backend / Firebase** | **CRM en prod + Reestructura Fase R desplegada** (ADR §47 + §49, 2026-06-06). **344 clientes** de Kary (**cartera $506.510.780**) + 12 pendientes. **Fase R**: vendedoras = entidad de datos (`vendedoras/{id}`, Kary las crea); CRM (`clientes`/`movimientos`/`vendedoras`) **admin/owner-only**; rol `vendedora` + app + `solicitudesCorreccion` ELIMINADOS. `recalcSaldoCliente` viva (Node 22 / ff v7). ⚠️ Reglas/functions = deploy manual (L-22). **Pendiente: smoke de panel por Kary · Fase M (movimientos robustos) · revisar nombres.** |
| **Hosting** | GitHub Pages (`bersagliojewelry.co` / `.github.io`), auto-deploy vía Actions · **GEMELO**: `bersaglio-gemelo.web.app` (Spark sin Blaze, aula/banco de pruebas/restore, §61; deploy con `firebase.gemelo.json`). |

## ⚠️ Flags de riesgo activos (→ hardening F6 · detalle en `docs/41-SEGURIDAD.md`)
- 🟠 **Deploy reglas/functions = MANUAL** (CI es Hosting/Pages only, **L-22**): `firebase deploy --only firestore:rules,firestore:indexes,functions`. ✅ Functions Node 22 + ff v7 (ADR §48).
- 🟠 **F6 en curso**: App Check REPARADO (§58, canje 200 en vivo) — TODO-14: monitor ~100% ×7d → **Enforce** guiado (PROHIBIDO antes, L-32). Forms endurecidos ✅ (§59) · CI+entero-COP ✅ (§62) · PRE-1 backup+restore ✅ (§63) · **reconciliación+Salud ✅ DESPLEGADA (§64)** (§64 mergeado a `main` PR #214). **🏁 F6 TÉCNICO COMPLETO (§68)**: RBAC claims DESPLEGADO (§65: claim owner sellado, reglas con §66) + alerta de truncado visible (§68, viaja con el PR; paginación GATED a materializar aging — el banner es el gate). Falta del programa: App Check Enforce (monitor ×7d, TODO-14) + compuerta de adopción → Fase M. Luego: política cartera APROBADA → config en Fase M.

## 🧩 Sub-sistemas (resumen)
Diseño Liquid Glass (Vite/Bundled) ✅ · Sincronización en vivo con Firestore ✅ · Checkout Stepper de 3 pasos ✅ · Cart Drawer lateral ✅ · Animaciones de entrada Staggered ✅
