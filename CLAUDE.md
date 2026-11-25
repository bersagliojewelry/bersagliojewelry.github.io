# CLAUDE.md — bersaglio · 🌉 PUENTE (este repo es el SITIO, no el cerebro)

## Tu cerebro NO está aquí

Este repo es **solo el sitio** (Bersaglio Jewelry). Tu memoria vive en `../brain-private/bersaglio/`:
`CLAUDE.md` (el router), `docs/05-ESTADO-GLOBAL.md`, `docs/10-MEMORIA-CORTO-PLAZO.md` y las demás.

Los tres primeros entran **ENTEROS** por los imports de abajo (desde el 24-nov-2026). El hook de arranque
añade los avisos vivos y no los repite; su eco llega **cortado** si pasa de 10.000 c: no te fíes de él para
el router, el `05` ni el `10`. **Si no los ves en tu contexto, falta el permiso de imports externos de esta
carpeta: LÉELOS POR RUTA antes de tocar nada** y avísale a Daniel.

@../brain-private/bersaglio/CLAUDE.md
@../brain-private/bersaglio/docs/05-ESTADO-GLOBAL.md
@../brain-private/bersaglio/docs/10-MEMORIA-CORTO-PLAZO.md

## Dónde va cada commit

- Cerebro (`docs/`, router, ADRs) → **en la bóveda** `../brain-private/`; su pre-commit corre el linter allí.
  Aquí no hay linter.
- Sitio (web, `js/`, `functions/`, `public/`, tests) → **aquí**, **directo en `main`**, solo con build/tests VERDES
  (push a `main` = deploy a Pages; rules/functions a mano → `05`). Nunca los dos en el mismo commit. ⛔ **`Desarrollo` es HISTORIA**
  (remoto `archivo`) y **JAMÁS se mergea**: no comparte historia con `main` desde el cascarón (`merge-base` exit 1).

## Reglas de oro DE ESTE SITIO

- Pages sirve el `dist` que construye `deploy.yml` (Vite; `npm test` corre antes: si falla, no se publica).
- Cache: bump `CACHE_NAME` en `public/sw.js` (siempre MAYOR); el nº vigente lo reporta el heartbeat, no el `05`.
  Deploys Firebase los hace Claude, nunca el dueño.
- `git add` específico, jamás `-A`. **NUNCA** `--amend`, `--no-verify` ni push forzado. **JAMÁS**
  secretos (`.env`, `*.pem`, `*.xlsx`, `.claude/settings.local.json`): repo PÚBLICO (`secretos.yml` en CI).

*(Puente F8 · kernel en `../brain-private/kernel/`, vía los hooks de `.claude/settings.json`.)*
