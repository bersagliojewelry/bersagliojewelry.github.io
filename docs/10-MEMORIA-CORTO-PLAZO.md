# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `docs/05-ESTADO-GLOBAL.md`,
> es de las primeras lecturas de cada sesión (Ignorancia Selectiva, `CLAUDE.md §G`).
> Contiene solo lo vivo: foco actual, pendientes abiertos, bitácora. Estado técnico → `docs/05-ESTADO-GLOBAL.md`.
>
> **Es la pizarra, no el archivo.** Al cerrar una tarea: consolidar a ADR (`docs/99-HISTORIAL-ADR.md`) +
> fila en `docs/00-INDICE.md`, extraer lecciones a `docs/30-LECCIONES.md`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual
> 🏗️ **Cerebro neuronal actualizado a template v1.0.0** (2026-06-05, upgrade quirúrgico). Toda la memoria previa PRESERVADA (36 ADRs en `99`, lecciones L-01..L-04, lóbulos `43-UX`/`45-PERFORMANCE`). **Nuevo**: nodo `15-CONSEJO-EXTERNO` (red team 🛰️ vía Gemini/Antigravity), `skills-inventory.md`, gobernanza ampliada (§G.5 sharding + reflejos), linter `brain:check` mejorado y adaptado a `public/sw.js`/`bersaglio-vN`, hook `SessionStart` + `githooks/pre-commit`. CLAUDE.md previo cuarentenado en `_legacy/`.
>
> Proyecto: build 🟢, branch `Desarrollo`, cache `bersaglio-v6`. Listo para nuevos requerimientos.
>
> **🚫 Callejones sin salida**: ninguno.

---

## 📋 Pendientes abiertos (TODO-NN)

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-01 | **Curación de skills/**: dedup de variantes (`SKILL-canvas-design` vs `canvas-design-creative`; `ecommerce skills` vs `ecommerce`) + revisar utilidad de `example-plugin` y `accessibility-audit-workspace`. | 🔲 Abierto | — |
| TODO-02 | **Curar `docs/skills-inventory.md`**: vino de la plantilla; ajustarlo al set real de skills cargado en ESTE entorno (marcar ✅ usable / ⚠️ repo-only / 🔧 anomalía por skill). | 🔲 Abierto | — |
| TODO-03 | (Opcional) Migrar headers de `99-HISTORIAL` a formato numerado `## NN.` para activar el chequeo estricto de offset-drift del linter (hoy usa convención por fecha, válida y verde). | 🔲 Abierto | — |

---

## 🔮 Contexto estratégico
El sitio web se encuentra en una versión sumamente madura y rápida, con todas las imágenes del home y timeline histórico optimizadas (ahorro del 98.6% en assets) y el Service Worker cacheando con la versión `bersaglio-v6`.

---

## 📝 Bitácora (efímera — se vacía al consolidar)
- **2026-06-05**: Upgrade del cerebro a template v1.0.0 (upgrade quirúrgico, memoria preservada). Consolidado como ADR en `99` + fila en `00-INDICE`. Detalle del proceso en `docs/INSTALACION-CEREBRO.md`.
