# 🩺 05 — ESTADO GLOBAL (Heartbeat · Snapshot de salud del sistema)

> **Nodo neuronal: signos vitales.** Se **AUTO-CARGA** (junto a `CLAUDE.md` +
> `docs/10-MEMORIA-CORTO-PLAZO.md`). Responde *"¿en qué estado está el sistema AHORA, antes de
> tocar nada?"*. Lo lee el **Reflejo de Auto-auditoría (`CLAUDE.md §G.4`)** al arrancar.
>
> **Mantenimiento (Reflejo de Frescura §G.4)**: actualizar al cambiar cache version,
> branch o al detectar/resolver un riesgo. **Tope ~25 líneas (§G.5)**.

| Señal | Valor (al 2026-06-05) |
|---|---|
| **Build** | 🟢 **Vite build e integridad verificados**. La prueba experimental de activos (`scripts/test-build.mjs`) pasó con éxito (0 rotos, 200 OK en todas las páginas). |
| **Cache version vigente** | `bersaglio-v6` (en `public/sw.js`). |
| **Branch activa** | `Desarrollo` — **3 commits del upgrade del cerebro (§37-§38) commiteados y SIN pushear** a `origin/Desarrollo`. |
| **Cerebro** | 🧠 template v1.0.0 · `brain:check` SANO · sin huérfanos/vacíos (auditoría 2026-06-05). |
| **Backend / Firebase** | Reglas de Firestore y Storage configuradas en `firestore.rules` y `storage.rules`. |
| **Hosting** | GitHub Pages (`bersagliojewelry.co` o `bersagliojewelry.github.io`). Auto-deploy vía GitHub Actions. |

## ⚠️ Flags de riesgo activos
- Ninguno detectado. El proyecto corre sin incidencias locales.

## 🧩 Sub-sistemas (resumen)
Diseño Liquid Glass (Vite/Bundled) ✅ · Sincronización en vivo con Firestore ✅ · Checkout Stepper de 3 pasos ✅ · Cart Drawer lateral ✅ · Animaciones de entrada Staggered ✅
