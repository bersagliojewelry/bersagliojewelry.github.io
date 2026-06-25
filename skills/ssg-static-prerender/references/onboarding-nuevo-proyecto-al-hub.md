# Plantilla — sumar un proyecto NUEVO al HUB de Visibilidad

> Pasos turnkey para incorporar un proyecto (un 5º cerebro / un sitio nuevo) al paquete de visibilidad del
> HUB (Altorra Cars). **El HUB CONSTRUYE y PROPAGA; cada proyecto IMPLEMENTA** en su propia sesión, con datos
> REALES del dueño (cero-demo). Las 7 skills + el agente `seo-auditor` son portables vía `tenant_config.json`
> (cero hardcode de proyecto). Arquitectura → `ioc-core-contract.md` · esquema del config → `tenant-config.md`.

## A. Propagación — la ejecuta el HUB (operador-cars)
1. **Copiar byte-idéntico** las 7 skills a `skills/` del repo destino:
   `ssg-static-prerender` (+`references/` +`agents/seo-auditor`) · `semantic-schema-aeo` · `ga4-lead-tracking` ·
   `maps-gbp-local` · `search-console-setup-y-diagnostico` · `product-feeds` · `image-pipeline`.
2. El agente `seo-auditor` ya vive **global** en `~/.claude/agents/` (compartido ×proyectos) **y** bundled dentro
   de `ssg-static-prerender/agents/` (viaja con la skill). NO requiere carpeta `agents/` por-repo.
3. **Catalogar** en `docs/skills-inventory.md` del destino → sección §Paquete de Visibilidad (reconciliar si el
   repo ya pre-anotó; **nunca duplicar** la sección).
4. **L-48**: `git status` ANTES de tocar el git del repo destino (sesiones concurrentes). Commitear SOLO los
   paths nuevos (JAMÁS `git add -A`); push a la rama de trabajo del repo; el **dueño mergea a `main` en web**.

## B. Implementación — la ejecuta la sesión del proyecto (pide datos al dueño)
1. `tenant_config.json` en la raíz → esquema en `tenant-config.md`. Fijar `vertical`
   (`JewelryStore`|`AutoDealer`|`RealEstateAgent`|…). Los campos ⛔ (NAP/redes/GA4/GSC/coords) **los aporta el dueño**.
2. `scripts/visibility-core/` **vendored** (funciones puras + `VERSION`) — lo provee el HUB (D′, byte-idéntico, sin lockstep).
3. `scripts/tenant-build.mjs` propio (orquestador IoC: connectDb → `validateTenant` → loop `status:published` →
   inyectar piezas del core → guards bake-integrity → sitemap). El core NUNCA lee el template; el tenant orquesta.
4. Templates con las anclas que declara `REQUIRED_ANCHORS`. Campo `status` por ítem + `slug` inmutable + `updatedAt`.
5. Workflow `.github/workflows/build-ssg.yml` on-push + cron diario (`npm run generate`).
6. **Gate antes de pedir indexación**: correr el agente `seo-auditor` contra el HTML del BUILD (read-only).

## C. Verticales soportados (gateados por `validateTenant`, anti-contaminación)
`JewelryStore` (Bersaglio) · `AutoDealer` (Altorra Cars) · `RealEstateAgent` (Inmobiliaria). Un vertical NUEVO =
añadir su rama en `validateTenant`/`buildSchema` del **core** (cambio del HUB, no del proyecto).

## D. Cero-demo (regla dura — cruza todo el paquete)
Ningún dato estructurado inventado (`AggregateRating`/`review`/`sameAs`/precio falsos = acción manual de Google).
Un campo sin dato REAL se **omite**, no se rellena. Vacío > inventado.

## E. Estado de propagación (actualizar al propagar)
| Proyecto | vertical | 7 skills en `skills/` | tenant_config | implementado |
|---|---|---|---|---|
| altorracars (HUB) | AutoDealer | ✅ | pend | pend (fábrica SSG previa existe) |
| bersaglio | JewelryStore | ✅ (2026-06-25) | pend | pend (sesión bersaglio) |
| inmobiliaria | RealEstateAgent | ✅ (2026-06-25) | pend | pend |
| insema | (definir) | ✅ (2026-06-25) | pend | pend |
