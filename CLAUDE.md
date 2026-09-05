# CLAUDE.md — bersaglio · 🌉 PUENTE (este repo es el SITIO, no el cerebro)

## Tu cerebro NO está aquí

Este repo es **solo el sitio** (Bersaglio Jewelry). Tu memoria vive en `../brain-private/bersaglio/`:
`CLAUDE.md` (el router), `docs/05-ESTADO-GLOBAL.md`, `docs/10-MEMORIA-CORTO-PLAZO.md` y las demás.

El hook de arranque te los **imprime enteros** (busca «EL CEREBRO DE ESTE PROYECTO VIVE EN OTRA
CARPETA»). **Si no los ves, el hook falló: LÉELOS POR RUTA antes de tocar nada** — router, `05`, `10`.

## Dónde va cada commit

- Cerebro (`docs/`, router, ADRs) → **en la bóveda** `../brain-private/`; su pre-commit corre el linter allí.
  Aquí no hay linter.
- Sitio (web, `js/`, `functions/`, `public/`, tests) → **aquí**, en `Desarrollo`; `Desarrollo`→`main` solo
  con build/tests VERDES (push a `main` = deploy a Pages + Firebase). Nunca los dos en el mismo commit.

## Reglas de oro DE ESTE SITIO

- Pages sirve el `dist` que construye `deploy.yml` (Vite; `npm test` corre antes: si falla, no se publica).
- Cache: bump `CACHE_NAME` en `public/sw.js` (siempre MAYOR); el nº vigente lo reporta el heartbeat, no el `05`.
  Deploys Firebase los hace Claude, nunca el dueño.
- `git add` específico, jamás `-A`. **NUNCA** `--amend`, `--no-verify` ni push forzado. **JAMÁS**
  secretos (`.env`, `*.pem`, `*.xlsx`, `.claude/settings.local.json`): repo PÚBLICO (`secretos.yml` en CI).

*(Puente F8 · kernel en `../brain-private/kernel/`, vía los hooks de `.claude/settings.json`.)*
