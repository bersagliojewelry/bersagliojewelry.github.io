# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `05-ESTADO-GLOBAL`,
> es de las primeras lecturas de cada sesión (Ignorancia Selectiva, `CLAUDE.md §G`).
> SOLO lo vivo: foco actual, pendientes abiertos, bitácora. Estado técnico → `05`.
>
> **Es la pizarra, no el archivo.** Al cerrar una tarea: consolidar a ADR (`99`) +
> fila en `00-INDICE`, extraer lecciones a `30`, y PODAR esto al foco vivo (GC §G.4).
>
> **Convención de handoff (relevo a ventana nueva)**: el "Foco actual" debe incluir
> **🚫 Callejones sin salida** — qué se probó que FALLÓ y NO reintentar, con el porqué.
> Le ahorra al próximo "tú" repetir errores ya descartados (relevo curado > `/compact`).

---

## 🎯 Foco actual

> 🏗️ **Bootstrap del cerebro neuronal.** Esta es la primera sesión sobre este proyecto.
> Antes de tocar código: completar §1 de `CLAUDE.md` (identidad/stack/deploy) y los
> placeholders de `05-ESTADO-GLOBAL.md`. Correr `npm run brain:check` para validar.
>
> **🚫 Callejones sin salida**: ninguno aún.

---

## 📋 Pendientes abiertos (TODO-NN)

> Al cerrar uno: ✅ + link al ADR §NN, y retirarlo en la próxima poda.

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| **TODO-01** | Rellenar `CLAUDE.md §1` con identidad/stack/deploy del proyecto | 🟡 en curso | conocer el proyecto |
| **TODO-02** | Rellenar placeholders de `05-ESTADO-GLOBAL.md` (build, branch, prod) | 🟡 en curso | depende de TODO-01 |
| **TODO-03** | Mapear estructura inicial en `20-MEMORIA-ESPACIAL.md` (carpetas/módulos clave) | 🟡 en curso | depende de TODO-01 |
| **TODO-04** | Validar `npm run brain:check` SANO antes del primer commit | 🔮 | depende de TODO-01..03 |

---

## 🔮 Contexto estratégico

- Cerebro recién trasplantado al proyecto. El sistema neuronal (CLAUDE.md + nodos + linter + hooks) está cableado y validado, pero las neuronas de contenido (`05`, `10`, `20`) aún son plantillas — se llenan al conocer el proyecto.
- Las skills viven en `skills/` (catálogo paralelo). El framework de auditoría se activa con el **Trigger 🔵** cuando el cliente pida análisis especializado.

## 📝 Bitácora (efímera)

- _(vacía — añadir entradas con fecha al avanzar la tarea actual)_
