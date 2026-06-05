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
| **Cache version vigente** | `bersaglio-v8` (en `public/sw.js`). Bump por pulido Fase 1 (transition/radii/#000). |
| **Branch activa** | `Desarrollo` — rediseño Fase 1 **commiteado (`e290f83`) + pusheado a `origin/Desarrollo`** (0/0 ahead/behind, verif. 2026-06-05). Producción (`main`) sin tocar. |
| **Cerebro** | 🧠 template v1.0.0 · `brain:check` SANO (sin huérfanos/vacíos) · skills: 74 catalogadas, 3 instaladas user-level (`~/.claude/skills/`). |
| **Backend / Firebase** | Reglas de Firestore y Storage configuradas en `firestore.rules` y `storage.rules`. |
| **Hosting** | GitHub Pages (`bersagliojewelry.co` o `bersagliojewelry.github.io`). Auto-deploy vía GitHub Actions. |

## ⚠️ Flags de riesgo activos (→ Fase 2 hardening · detalle en `docs/41-SEGURIDAD.md`)
- 🟡 **Fase 2 S1 en curso**: fallback hardcodeado **eliminado** (`firebase-config.js`, env = única fuente + guard; CI inyecta secrets ✓). Pendiente cliente/consola: restringir API key (GCP) + **App Check**. Las API keys web no son secretas por diseño. Detalle: `docs/41-SEGURIDAD §1.5`.
- 🟠 **Reglas/escala (Fase 2 pendiente)**: Storage sube cualquier autenticado (S2, dep. S4); reseñas `read:if true` (S5, cliente ya filtra); sin `validate` server-side (S6). ✅ `onSnapshot` admin con `limit(500)` (S3). Reglas = "decisión cara" → emulador + deploy gated.

## 🧩 Sub-sistemas (resumen)
Diseño Liquid Glass (Vite/Bundled) ✅ · Sincronización en vivo con Firestore ✅ · Checkout Stepper de 3 pasos ✅ · Cart Drawer lateral ✅ · Animaciones de entrada Staggered ✅
