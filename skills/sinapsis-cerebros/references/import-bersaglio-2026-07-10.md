# Payload de importación cars→bersaglio (sinapsis 2026-07-10) — ⚠️ BLOQUEADO 2026-07-18, ver nota

> **⚠️ NOTA DEL OPERADOR SINAPSIS (2026-07-18, FABLE-5) — NO aplicar tal cual:**
> (1) **BLOQUEADO por capacidad**: `docs/30-LECCIONES.md` de bersaglio está a 43.999 chars — el kernel
> marca problema (warn→exit 1, bloquea pre-commit) por encima de 44.000 (cap 40.000 ×1.1). Su TODO-77
> (shard de `30`) debe ejecutarse ANTES de pegar L-84 y los stubs.
> (2) **COLISIÓN de numeración**: bersaglio definió su PROPIO M-09 el 2026-07-17 ("Muestrear ≠ contar",
> `30:249` + `34:49`). Al aplicar: renumerar las importadas → M-09 del payload pasa a **M-10** y
> M-10 del payload pasa a **M-11** (precedente de la casa: L-31 "era L-28 dup", L-54 "renum. de L-39 dup").
> (3) La "Nota extra" (converger `meta-ads-diagnostico`) ya quedó ✅ con la re-sincronización de skills 2026-07-18.

> Preparado por operador-cars (Fable 5). El harness bloquea writes cross-repo desde una sesión
> ajena → aplícalo TÚ (operador bersaglio) en 3 pegas + `npm run brain:check` + commit en `Desarrollo`.
> Al terminar: marca la línea de bersaglio en `SKILL.md §4` como ✅ y borra este archivo.

## 1 · `docs/30-LECCIONES.md` — insertar ANTES de la línea `### L-83: Dinero + listeners…`

```markdown
### L-84: Commit en HEAD DESPRENDIDO (tras un resume) queda COLGANTE — verificar la rama ANTES de commitear *(importada de cars, sinapsis 2026-07-10)*
Tras retomar una sesión (resume / checkout de un hash), `git commit` puede caer en detached HEAD: imprime `[detached HEAD abc123]` (NO `[Desarrollo …]`), el push de la rama es un no-op silencioso y un `checkout` posterior puede REVERTIR el working tree. Receta: `git rev-parse --abbrev-ref HEAD` == `Desarrollo` ANTES de commitear; un commit ya colgante se rescata con `git merge --ff-only <hash>` desde la rama. Detalle original: cars `docs/31-LECCIONES-GIT.md`.

```

## 2 · `docs/30-LECCIONES.md` — añadir tras la línea del stub `### M-07: …`

```markdown
### M-09: Un hit de grep prueba PRESENCIA, no semántica — leer el match antes de construir encima *(importada de cars, sinapsis 2026-07-10)* → 34
### M-10: No construir maquinaria NUEVA compleja si hay una solución simple A LA MANO *(importada de cars, sinapsis 2026-07-10)* → 34
```

## 3 · `docs/34-LECCIONES-META.md` — apendar al FINAL del archivo

```markdown

## Importadas de cars (sinapsis 2026-07-10 — stubs en `30`)

### M-09: Un hit de grep prueba PRESENCIA, no semántica — leer el match antes de construir encima *(importada de cars)*
**Defecto**: clasificar o planear sobre resultados de grep/search sin leer QUÉ hace el código matcheado — en cars produjo claims falsos en un plan (el patrón existía pero hacía OTRA cosa) que hubo que refutar con lectura real antes de construir. **Corrección**: todo hit que vaya a sostener una decisión se abre y se lee en su contexto ESE turno; el grep LOCALIZA, no diagnostica. Hermana de la doctrina verifica-no-asumas (§3.3). Detalle original: cars `docs/32-LECCIONES-META.md`.

### M-10: No construir maquinaria NUEVA compleja si hay una solución simple A LA MANO *(importada de cars)*
**Defecto**: ante un problema, diseñar un mecanismo nuevo (script/workflow/capa) cuando el proyecto YA tenía una herramienta visible que lo resolvía — el dueño a cars: "tienes las cosas visibles a la mano e hiciste algo más complejo". **Corrección**: antes de construir, inventariar lo que YA existe (skills, scripts, MCP, funciones del repo) y justificar por qué no basta; maquinaria nueva exige un hueco PROBADO. Detalle original: cars `docs/32-LECCIONES-META.md`.
```

## Nota extra (opcional, tu decisión)
Tu copia repo de `skills/meta-ads-diagnostico/SKILL.md` divergió del GLOBAL (cars le añadió al
global los bullets C-9 pujas Google + C-11 STRATEGY.md y neutralizó "joyería"→"negocio local").
Si quieres converger: `Copy-Item ~\.claude\skills\meta-ads-diagnostico\SKILL.md skills\meta-ads-diagnostico\SKILL.md`.
