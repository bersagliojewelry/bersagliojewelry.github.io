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
> **Curación inicial hecha** (§38, commit `1be38d1`): skills 78→74 (4 ruido a `_legacy/skills-removed/`), inventario reconciliado, `CEREBRO NUEVO/` retirada del repo. Queda solo TODO-03 (opcional, baja prioridad).
>
> Proyecto: build 🟢, branch `Desarrollo`, cache `bersaglio-v6`. Listo para nuevos requerimientos.
>
> **🚫 Callejones sin salida**: ninguno.

---

## 📋 Pendientes abiertos (TODO-NN)

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-01 | **Dedup de skills/**: 4 carpetas-ruido cuarentenadas a `_legacy/skills-removed/` (78→74). | ✅ Cerrado | → §38 / commit `1be38d1` |
| TODO-02 | **Curar `docs/skills-inventory.md`**: reconciliado vs 74 carpetas reales; +`sales-enablement`; documentado folder≠name + cuarentena. | ✅ Cerrado | → §38 / commit `1be38d1` |
| TODO-03 | (Opcional) Migrar headers de `99-HISTORIAL` a formato numerado `## NN.` para el offset-drift estricto del linter (hoy convención por fecha, válida y verde). | 🔲 Abierto | Baja prioridad |

---

## 🔮 Contexto estratégico
El sitio web se encuentra en una versión sumamente madura y rápida, con todas las imágenes del home y timeline histórico optimizadas (ahorro del 98.6% en assets) y el Service Worker cacheando con la versión `bersaglio-v6`.

---

## 📝 Bitácora (efímera — se vacía al consolidar)
- **2026-06-05**: Upgrade del cerebro a template v1.0.0 (upgrade quirúrgico, memoria preservada). ADR §37 + fila en `00-INDICE`. Detalle del proceso en `docs/INSTALACION-CEREBRO.md`. Commit `76764ea`.
- **2026-06-05**: Curación post-upgrade (ADR §38, commit `1be38d1`): dedup de skills (78→74), inventario reconciliado, `CEREBRO NUEVO/` eliminada. TODO-01/02 cerrados.
