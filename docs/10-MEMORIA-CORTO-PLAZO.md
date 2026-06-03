# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo.** Junto con `CLAUDE.md` + `docs/05-ESTADO-GLOBAL.md`,
> es de las primeras lecturas de cada sesión (Ignorancia Selectiva, `CLAUDE.md §G`).
> Contiene solo lo vivo: foco actual, pendientes abiertos, bitácora. Estado técnico → `docs/05-ESTADO-GLOBAL.md`.
>
> **Es la pizarra, no el archivo.** Al cerrar una tarea: consolidar a ADR (`docs/99-HISTORIAL-ADR.md`) +
> fila en `docs/00-INDICE.md`, extraer lecciones a `docs/30-LECCIONES.md`, y PODAR esto al foco vivo (GC §G.4).

---

## 🎯 Foco actual
*   **Ajuste de Hero y Velocidad de Carga**: Rediseñar espaciados en el Hero del Home para acomodar el botón sin cortes, y optimizar las imágenes del carrusel, journal y fondos usando WebP/AVIF.
*   **Integración y Despliegue**: Fusionar cambios locales a la rama principal (`main`) para despliegue automatizado en producción.

---

## 📋 Pendientes abiertos (TODO-NN)

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| **TODO-01** | Integrar cambios a la rama principal (main) y desplegar | ⏳ En curso | — |

---

## 🔮 Contexto estratégico
La optimización del Hero del Home resuelve un problema visual crítico de corte de botones. Al mismo tiempo, sustituir los PNGs pesados de la carga inicial por WebP de ~25-180KB mitiga por completo el retraso de renderizado inicial (LCP).

---

## 📝 Bitácora (efímera — se vacía al consolidar)
- **2026-06-03**: Ajuste de padding/márgenes en el Hero. Sustitución de imágenes PNG pesadas en CSS y JS por sus equivalentes optimizados. Bump de Service Worker a v6. Compilación e integridad certificadas.

