# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `docs/05-ESTADO-GLOBAL.md`,
> es de las primeras lecturas de cada sesión (Ignorancia Selectiva, `CLAUDE.md §G`).
> Contiene solo lo vivo: foco actual, pendientes abiertos, bitácora. Estado técnico → `docs/05-ESTADO-GLOBAL.md`.
>
> **Es la pizarra, no el archivo.** Al cerrar una tarea: consolidar a ADR (`docs/99-HISTORIAL-ADR.md`) +
> fila en `docs/00-INDICE.md`, extraer lecciones a `docs/30-LECCIONES.md`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual
> ✅ **Sesión 2026-06-05 cerrada — cerebro v1.0.0 instalado, curado, auditado y PUSHEADO** a `origin/Desarrollo` (5 commits, ADR §37-§39). `brain:check` SANO, sin huérfanos ni vacíos. **Listo para nuevos requerimientos del cliente.**
>
> **Qué se hizo** (detalle en ADRs): §37 upgrade quirúrgico a template v1.0.0 (memoria preservada: 36 ADRs, L-01..L-04, lóbulos 43-UX/45-PERFORMANCE; nuevo nodo `15-CONSEJO-EXTERNO` red team 🛰️ Gemini/Antigravity; gobernanza §G.5; hook+pre-commit). §38 curación de skills (78→74, 4 ruido a `_legacy/skills-removed/`, `CEREBRO NUEVO/` retirada). Auditoría de integridad (0 huérfanos/dangling, `05` fresco). §39 auditoría+instalación de skills + Reflejo de Catalogación §G.4 + `brain-check` check #6.
>
> **Contexto para el próximo "tú"**: 3 skills instaladas user-level en `~/.claude/skills/` (FUERA del repo, no se ven en git): `claude-automation-recommender`, `claude-md-improver`, `session-report`. Producción NO desplegada (deploy = push a `main`; hoy solo `Desarrollo`).
>
> **🚫 Callejones sin salida**: ninguno.

---

## 📋 Pendientes abiertos (TODO-NN)

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-03 | (Opcional) Migrar headers de `99-HISTORIAL` a formato numerado `## NN.` para el offset-drift estricto del linter (hoy convención por fecha, válida y verde). | 🔲 Abierto | Baja prioridad |
| TODO-04 | (Opcional) Limpieza de anomalías 🔧 en `skills/`: cuarentenar `skill-creator/skill-creator/` (anidado redundante); `code-simplifier`/`code-modernization` son formatos subagente/plugin (no skill) — normalizar o dejar documentadas. | 🔲 Abierto | Baja prioridad |
| TODO-05 | Merge `Desarrollo → main` para desplegar a producción (dispara GitHub Pages + Firebase). **Solo a pedido explícito del cliente.** | 🔲 Abierto | A pedido |
| — | `.claude/settings.local.json` sin commitear (permisos del harness). El cliente decide si versionarlo. | ℹ️ info | — |

> ✅ Cerrados y consolidados: **TODO-01 / TODO-02** → ADR §38 (commit `1be38d1`).

---

## 🔮 Contexto estratégico
El sitio web se encuentra en una versión sumamente madura y rápida, con todas las imágenes del home y timeline histórico optimizadas (ahorro del 98.6% en assets) y el Service Worker cacheando con la versión `bersaglio-v6`.

---

## 📝 Bitácora (efímera — se vacía al consolidar)
- **2026-06-05**: Upgrade del cerebro a template v1.0.0 (upgrade quirúrgico, memoria preservada). ADR §37 + fila en `00-INDICE`. Detalle del proceso en `docs/INSTALACION-CEREBRO.md`. Commit `76764ea`.
- **2026-06-05**: Curación post-upgrade (ADR §38, commit `1be38d1`): dedup de skills (78→74), inventario reconciliado, `CEREBRO NUEVO/` eliminada. TODO-01/02 cerrados.
- **2026-06-05**: Auditoría de integridad (ADR no — fix `23122a0`): 0 huérfanos/vacíos, dangling 48 cerrado, 05 fresco.
- **2026-06-05**: Auditoría e instalación de skills + auto-detección (ADR §39): 70/74 ya cargadas; instaladas 3 user-level (`claude-automation-recommender`, `claude-md-improver`, `session-report`); nuevo Reflejo de Catalogación §G.4 + `brain-check` check #6. Inventario al día.
- **2026-06-05**: 🏁 Sesión cerrada. Todo pusheado a `origin/Desarrollo`. Handoff (estado + pendientes TODO-03/04/05) documentado en foco + TODOs. Próximo chat hereda cerebro SANO.
