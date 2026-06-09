# 🩺 45 — AUDITORÍA DE RENDIMIENTO Y MEJORAS TÉCNICAS

> **Lóbulo de Dominio: Performance.** Registra los hallazgos técnicos, oportunidades de optimización identificadas en el repositorio y los planes de acción correspondientes.
>
> **Metodología**: Evaluado a partir del análisis estático de código en `js/core/router.js`, `public/sw.js` y el sistema de estilos.

---

## 🧭 Hallazgos y Oportunidades de Mejora

### PERF-01: View Transitions incorrectas en navegadores (Gotcha del Router)
*   **Diagnóstico**: En [router.js](file:///c:/Users/romad/Documents/GitHub/bersagliojewelry.github.io/js/core/router.js#L84-L92) la función `transitionTo` envuelve un cambio de `location.href` (navegación dura entre páginas HTML) en un callback de `document.startViewTransition()`.
*   **Problema**: Las View Transitions en JS solo funcionan de manera síncrona en aplicaciones de una sola página (SPA). Al cambiar `location.href`, el navegador realiza una carga completa, destruyendo la transición e interrumpiendo el flujo. Esto puede provocar parpadeos o retrasos en la carga.
*   **Solución recomendada**: Retirar el wrapper de JS en `transitionTo` (dejar que haga navegación nativa) y, en su lugar, habilitar transiciones nativas entre páginas (Cross-Document View Transitions) agregando la siguiente directiva al CSS en `liquid-glass.css`:
    ```css
    @view-transition {
      navigation: auto;
    }
    ```
    *(Nota: Esto es soportado de manera nativa por Chrome 126+ y no requiere JS).*

---

### PERF-02: Falta de caché para scripts JS autogenerados por Vite (Hashed)
*   **Diagnóstico**: En [sw.js](file:///c:/Users/romad/Documents/GitHub/bersagliojewelry.github.io/public/sw.js#L90-L92), el Service Worker omite almacenar en caché los scripts JS porque sus nombres contienen un hash dinámico que varía con cada compilación de Vite.
*   **Problema**: Aunque el hash cambie entre compilaciones, durante la vida útil de una misma versión del sitio web el script es inmutable. El no cachear estos scripts (especialmente librerías pesadas como GSAP o Lenis) fuerza al navegador a descargarlos en cada recarga o navegación entre shells HTML, afectando negativamente el rendimiento de red.
*   **Solución recomendada**: Dado que los nombres de los bundles son únicos (e.g., `vendor-gsap-a87f8f9e.js`), implementar una estrategia de caché **Cache-First** para los recursos que viven en `/dist/assets/js/`. Si el sitio se actualiza, la URL en el HTML referenciará un hash nuevo, ignorando la versión antigua en caché y descargando la nueva de forma segura.

---

### PERF-03: Deuda técnica de código muerto en Style.css
*   **Diagnóstico**: El archivo `css/style.css` mantiene más de 10,500 líneas de código estructural. Con la introducción de `css/liquid-glass.css`, la gran mayoría de los colores, tipografías y efectos visuales de las versiones anteriores (V1-V7) son anulados mediante overrides.
*   **Problema**: Descargar un archivo CSS de más de 10k líneas que en su mayoría es código muerto incrementa el tamaño del bundle inicial que bloquea el renderizado (Render-Blocking Assets).
*   **Solución recomendada**: Purgar progresivamente la "ZONA LEGACY" de `style.css`. La eliminación de bloques como el Hero V7 legacy o el Lookbook V7 viejo puede reducir el peso del archivo a menos de la mitad sin alterar la estructura activa.

---

## 📋 Plan de Acción y Priorización

| ID | Tarea | Prioridad | Impacto estimado |
|---|---|---|---|
| **PERF-01** | Corregir View Transitions en `router.js` y mover a directiva `@view-transition` en CSS | Alta | Mejora en la fluidez visual de navegación entre shells |
| **PERF-02** | Configurar caché Cache-First en `sw.js` para scripts con hashes en su nombre | Media-Alta | Reducción drástica del tiempo de carga en visitas recurrentes |
| **PERF-03** | Limpieza progresiva y modularización de la Zona Legacy de `style.css` | Media | Reducción del tamaño de activos bloqueantes (~40-50KB menos de descarga) |
