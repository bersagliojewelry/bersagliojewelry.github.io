# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `docs/05-ESTADO-GLOBAL.md`,
> es de las primeras lecturas de cada sesión (Ignorancia Selectiva, `CLAUDE.md §G`).
> Contiene solo lo vivo: foco actual, pendientes abiertos, bitácora. Estado técnico → `docs/05-ESTADO-GLOBAL.md`.
>
> **Es la pizarra, no el archivo.** Al cerrar una tarea: consolidar a ADR (`docs/99-HISTORIAL-ADR.md`) +
> fila en `docs/00-INDICE.md`, extraer lecciones a `docs/30-LECCIONES.md`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual
> 🎨 **Programa "Nuevo Bersaglio" — Fase 1 (rediseño mirror) COMPLETA** (9 incrementos, build verde, ADR §40). Commiteada en `Desarrollo` (`e290f83`) + pusheada a `origin/Desarrollo` (0/0; TODO-06 ✅). Verificado por build + estructura DOM; falta verificación VISUAL en navegador real (el sandbox no pinta dinámico — L-05).
>
> **Qué se hizo**: shell global (header Dynamic Island + corazón/badge + ícono carrito + footer legal) · Home (modularizada `js/home/*` + spacing 46 + parallax OFF + reveals + Atelier gema/atSpin + Films + Redes + dock "Atajos" + CTA Maison) · Nosotros (tipografía↓, timeline 1 fila, Prensa→Reseñas, copy sin datos inventados) · Contacto (3 canales, SVGs, FAQ 2×2, proceso, copy). Imágenes nuevas → webp. Cache `v7`.
>
> **El programa** (decomposición): Fase 1 Diseño ✅ → **Fase 2 Hardening** (seguridad+escala — backlog en `docs/41-SEGURIDAD.md`) → **Fase 3 CRM + facturación + inventario** (ciclo propio; skills `crm-architect`+`ecommerce`; DIAN requiere proveedor → fasificar). Spec: `docs/superpowers/specs/2026-06-05-rediseno-fase1-design.md`.
>
> **🚫 Callejones sin salida**: ninguno. El live link de Claude Design expira (404) → fuentes locales (handoff + 38 CAPTURAS).

---

## 📋 Pendientes abiertos (TODO-NN)

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-03 | (Opcional) Migrar headers de `99-HISTORIAL` a formato numerado `## NN.` para el offset-drift estricto del linter (hoy convención por fecha, válida y verde). | 🔲 Abierto | Baja prioridad |
| TODO-04 | (Opcional) Limpieza de anomalías 🔧 en `skills/`: cuarentenar `skill-creator/skill-creator/` (anidado redundante); `code-simplifier`/`code-modernization` son formatos subagente/plugin (no skill) — normalizar o dejar documentadas. | 🔲 Abierto | Baja prioridad |
| TODO-05 | Merge `Desarrollo → main` para desplegar a producción (dispara GitHub Pages + Firebase). **Solo a pedido explícito del cliente.** | 🔲 Abierto | A pedido |
| TODO-06 | **Commit del rediseño Fase 1** → commiteado `e290f83` + pusheado `origin/Desarrollo` (verif. 2026-06-05). | ✅ Hecho | — |
| TODO-07 | **Contenido real**: reseñas Google Maps (Nosotros), Films y feed Redes (Meta Graph / TikTok API). Marcado `TODO:` en `js/data/home-media.js` + `js/pages/nosotros.js`. | 🔲 Abierto | Cliente entrega datos/fuentes |
| TODO-08 | **Fase 2 — Hardening** (seguridad + escalabilidad): backlog en `docs/41-SEGURIDAD.md` (S1 `.env`/llaves urgente). | 🔲 Abierto | Siguiente fase |
| TODO-09 | **Fase 3 — CRM + facturación + inventario** (admin): brainstorm→spec→plan propio; `crm-architect`+`ecommerce`. | 🔲 Abierto | Siguiente fase |
| — | `.claude/settings.local.json` sin commitear (permisos del harness). El cliente decide si versionarlo. | ℹ️ info | — |

> ✅ Cerrados y consolidados: **TODO-01 / TODO-02** → ADR §38 (commit `1be38d1`).

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": **Fase 1 (rediseño mirror Liquid Glass) aplicada** sobre la base NOVO. Service Worker en `bersaglio-v7`. Siguen **Fase 2** (hardening — `docs/41-SEGURIDAD.md`) y **Fase 3** (CRM/facturación/inventario en el admin).

---

## 📝 Bitácora (efímera — se vacía al consolidar)
- **2026-06-05**: 🎨 Programa "Nuevo Bersaglio" — **Fase 1 rediseño mirror COMPLETA** (9 incrementos, build verde). ADR §40 + lóbulo `41-SEGURIDAD` (Fase 2) + spec en `docs/superpowers/specs/`. Lecciones nuevas L-05..L-08 en `30`; corregidas lecciones stale (style.css/0px/Inter→modular/squircles/Manrope). Cache v7. WIP sin commitear (TODO-06).
- **2026-06-05 (retomar sesión)**: Verificado git — Fase 1 `e290f83` commiteada **y pusheada** a `origin/Desarrollo` (0/0); **TODO-06 ✅**. Corrección de frescura: `.env` **no está en git** (`git log --all` vacío, nunca estuvo) → **S1 re-caracterizado** en `41` (🔴→🟠): exposición real = fallback hardcodeado + falta de App Check/restricción de key, no un secreto filtrado.
- **2026-06-05 (Fase 1 pulido — opción A)**: Review visual del rediseño (`npm run dev` + skill `impeccable` + doctrina). Veredicto: rediseño **sólido** (L-08). 3 fixes objetivos aplicados+verificados en vivo: `transition:all`→props (12 spots Fase 1), radii critical-CSS sincronizadas (12 shells), hero `#000`→ink-emerald. Build ✓3.68s, cache **v7→v8**, ADR §41, lecciones L-09/L-10, `43-UX` actualizado (UX-01 ya estaba hecho). Deuda: `transition:all` en carrito/pieza/lista-deseos/admin (otra fase). `.claude/settings.local.json` sigue M. Pendiente: elegir A (review visual) / B (hardening) / C (spec CRM).
- **(previo) 2026-06-05**: Cerebro v1.0.0 instalado/curado/auditado (ADR §37-§39, pusheado `origin/Desarrollo`). Ya consolidado.
