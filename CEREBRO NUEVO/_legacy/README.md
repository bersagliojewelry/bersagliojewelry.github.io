# 🗄️ _legacy/ — Cuarentena de archivos descartados

> Carpeta de cuarentena. Los archivos que se mueven aquí **no se sirven ni se enlazan**
> desde ninguna parte del proyecto. Se conservan en vez de borrarse para poder
> revertir si hiciera falta (Reflejo del límite de guardián, `CLAUDE.md §G.4`:
> "apendar, no sobrescribir; cuarentenar, no borrar").
>
> Verificación previa al mover (doctrina `CLAUDE.md §3.3`): cero referencias internas
> (`grep` en HTML/JS/MJS/JSON/TS) y ninguno aparece en sitemap/manifest/router.

| Archivo | Qué era | Por qué se cuarentenó | Fecha |
|---|---|---|---|
| _(vacío)_ | | | |

## Cómo revertir un archivo

```bash
git mv _legacy/<archivo> <ruta-original>
```

Si tras un tiempo confirmamos que ninguno hace falta, se borran definitivamente
en una fase posterior (con ADR que lo justifique).
