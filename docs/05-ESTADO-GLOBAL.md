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
- 🟠 **Fallback hardcodeado** de llaves Firebase en `js/firebase-config.js:21-27`. ⚠️ Corregido 2026-06-05: el `.env` **NO está en git** (`git log --all -- .env` vacío; ignorado en `.gitignore:3`). Las API keys web **no son secretas por diseño** → acción real: restringir key (GCP referrer) + **App Check** + reglas (S2/S5/S6); quitar fallback. Rotación NO urgente. Detalle: `docs/41-SEGURIDAD §S1`.
- 🟠 **Reglas/escala**: Storage permite subir a cualquier autenticado (sin rol); reseñas no-aprobadas leíbles; sin validación server-side; `onSnapshot` admin sin paginación.

## 🧩 Sub-sistemas (resumen)
Diseño Liquid Glass (Vite/Bundled) ✅ · Sincronización en vivo con Firestore ✅ · Checkout Stepper de 3 pasos ✅ · Cart Drawer lateral ✅ · Animaciones de entrada Staggered ✅
