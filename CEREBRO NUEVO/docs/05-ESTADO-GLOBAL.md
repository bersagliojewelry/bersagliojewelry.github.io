# 🩺 05 — ESTADO GLOBAL (Heartbeat · Snapshot de salud del sistema)

> **Nodo neuronal: signos vitales.** Se **AUTO-CARGA** (junto a `CLAUDE.md` +
> `10-CORTO-PLAZO`). Responde *"¿en qué estado está el sistema AHORA, antes de
> tocar nada?"*. Lo lee el **Reflejo de Auto-auditoría (`CLAUDE.md §G.4`)** al arrancar.
>
> **Mantenimiento (Reflejo de Frescura §G.4)**: actualizar al cambiar versión,
> branch, build o al detectar/resolver un riesgo. **Tope ~25 líneas (§G.5)** — es un
> tablero, no una bitácora.

| Señal | Valor |
|---|---|
| **Build** | 🟢 cerebro recién instalado · proyecto pendiente de configurar (rellenar `CLAUDE.md §1`). |
| **Versión / Cache** | _(rellenar si el proyecto tiene service-worker: `vYYYYMMDDHHMMSS`; si no, "n/a")_ |
| **Branch activa** | _(rellenar tras `git status`)_ |
| **Producción** | _(rellenar: rama o tag de prod + última vez verificado)_ |
| **Deploys backend pendientes** | _(rellenar: ninguno / lista)_ |

## ⚠️ Flags de riesgo activos
- _(sin flags — añadir a medida que aparezcan)_

## 🧩 Sub-sistemas (resumen)
_(1 línea por sub-sistema cuando el proyecto crezca — ej. "frontend ✅ · backend API ✅ · cron jobs ⏳")_
