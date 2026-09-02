# 🗄️ _legacy — Cuarentena reversible

> Zona de cuarentena del cerebro neuronal. Aquí se conserva (NO se borra) lo que
> se reemplaza durante upgrades/migraciones, por si hay que rescatar información
> no migrada. Límite de guardián (`CLAUDE.md §G.4`): **cuarentenar antes que borrar**.

| Archivo | Qué es | Fecha | Motivo |
|---|---|---|---|
| `CLAUDE-previo.md` | Versión anterior del `CLAUDE.md` (cerebro neuronal pre-template-v1.0.0). | 2026-06-05 | Upgrade del cerebro a la plantilla portable v1.0.0. Su `§1` (identidad real de Bersaglio) y `§4` (cache bump `bersaglio-vN`) se cosecharon al nuevo `CLAUDE.md`. La gobernanza `§G` se reemplazó por la versión ampliada (G.5 sharding + reflejos). Conservado por si algo no migró. |
| `skills-removed/` | 4 carpetas de `skills/` retiradas en la curación (TODO-01). | 2026-06-05 | Ruido/duplicados malformados — detalle en `skills-removed/README.md`. Reversible: `git mv` de vuelta a `skills/` si alguna se necesita. |
| `LECCIONES-MIGRADAS-MAESTRO.md` | Cuerpo íntegro de las lecciones mudadas al **cerebro maestro**: **lote 2** (2026-09-01) `L-01` (scroll lock iOS), `L-83` (dinero + listeners) y `L-84` (`err.code` prefijado); **lote 9** (2026-09-01) `L-05` (preview headless: `rAF`/IntersectionObserver no disparan con la pestaña `hidden`) — la primera de la cola de bersaglio, en un lote bi-repo con cars (§198). | 2026-09-01 | **NO es código muerto**: es el **punto de retorno** del lote. La copia consultable vive en `brain-private/maestro/lecciones/migradas/BERS/`; aquí queda el original byte a byte para que el ABORT lo reconstruya **sin `git checkout`**. Los titulares siguen en `docs/30-LECCIONES.md` (es la tabla de resolución del kernel) y el stub de `L-84` en `docs/35-LECCIONES-DINERO.md`. |
