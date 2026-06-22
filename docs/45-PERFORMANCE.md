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
    > ⚠️ **STALE (2026-06-21)**: `css/style.css` YA NO EXISTE (lo eliminó el recambio NOVO; CSS modular por página, ver `30 §1`). PERF-03 obsoleto.

---

### PERF-04: `backdrop-filter` (cristal) en listas de N + aurora animada = RAM/scroll (recon 2026-06-21, Fase 4 de TODO-28)
*   **Diagnóstico**: `.glass` (`liquid-glass.css:150`) lleva `backdrop-filter: blur` y se aplica a CADA tarjeta repetida (catálogo `.cat-card`, deseos, journal, tarjetas del panel) — **58 `backdrop-filter`** en 9 archivos. Además 2 orbes `.bj-world::before/::after` con `filter: blur(60px)` **animados sin parar** (`drift 28s`) detrás de toda la página → recompute continuo de un blur enorme (costo idle/RAM). Viola §3.1 ("nunca blur en listas de N").
*   **Solución — look IDÉNTICO (directiva Daniel 2026-06-21: "se ve igual + ultra veloz")**: NO quitar el efecto. **(a) `content-visibility: auto` + `contain-intrinsic-size`** en las tarjetas de listas largas → el navegador omite renderizar (y blurear) lo que está FUERA de pantalla; look idéntico, scroll/RAM mucho mejor. **Catálogo ✅ (`a32c56d`)**; falta deseos/journal/relacionados/panel. **(b) aurora**: aligerar el costo del blur animado sin perder el glow (pendiente; trade-off motion↔idle — opción: `will-change:transform` para componer el blur una vez, o pre-blur en imagen). **(c)** reservar el `backdrop-filter` "vivo" solo para superficies estructurales (header/cajones/modales) si hace falta más. **Medición real = dispositivo** (el preview headless no mide blur, `30 §L-09`).

#### ✅ ESTADO 2026-06-21 — IMPLEMENTADO (comité ×3 + consejo Gemini; deliberación → bóveda `2026-06-21-perf-fluidez-movil-comite-v4.md`)
*   **Diagnóstico afinado (comité + Gemini convergen, señal fuerte)**: hay DOS costos que se confundían. **H1** = el `backdrop-filter: blur(46px)` del header FIJO (`components.css:46`, +`.glass` base 28px) se re-rasteriza POR CUADRO al deslizar (×DPR² en pantallas densas) = jank de scroll. **H2** = la aurora animada DEBAJO del header invalida la caché de la capa del header → lo re-desenfoca cada cuadro AUN EN REPOSO (quema GPU/batería → throttling térmico = el "freeze" que empeora a los segundos). **H3** = arranque por JS (`body opacity:0` hasta `.bj-ready`) = LCP/freeze inicial. Riesgos extra confirmados por Gemini: **multiplicador DPR²**, **OOM/VRAM** por blobs del hero, throttling térmico. `header.js:196` onScroll YA es passive y barato (causa hilo-principal descartada).
*   **Refutaciones de Gemini (mejoran el plan, las adopté)**: ❌ quitar `saturate/brightness` del header = INÚTIL (single-pass) + cambia el color de marca → descartado. ❌ backdrop a DPR reducido = INVIABLE en CSS nativo → descartado.
*   **Solución implementada (look idéntico en equipos capaces — directiva Daniel "velocidad sin destruir el diseño")**: modo **`.bj-lite` por CAPACIDAD** (no por tamaño): `js/core/boot.js §C3` marca `<html class=bj-lite>` si `deviceMemory≤4` / `saveData` / `pointer:coarse` / `max-width:920` / `prefers-reduced-motion` (defensivo try/catch → fallback = diseño completo). Cubre el portátil corriente de pantalla grande+GPU débil que un media-query por ancho NO atraparía. CSS `.bj-lite`: header blur 46→16 / base→14 (mantiene saturate/brightness = color esmeralda/oro); aurora `animation:none` (gana por especificidad 0,2,1 al `bjDrift` inline — UNA fuente en `liquid-glass.css`, sin tocar las 12 copias = sin drift); blobs hero + dock `animation:none`. **`content-visibility:auto`** añadido a `.wl-card` (520px) y `.jr-archive-card` (380px) — universal e invisible (relacionados de pieza/entrada NO: 3-4 ítems, no aporta). Build verde; reglas en `dist` con ambos prefijos backdrop. **Sin bump SW** (CSS Vite-hasheado + HTML network-first + inline NO tocado).
*   **Pendiente**: validación de Daniel en dispositivo real → merge a `main`; **fuentes** (4 familias muchos pesos → quitar no usados, verificar antes = invisible, sirve a PC y móvil); **arranque profundo C1** (pre-pintar above-the-fold; estructural, NO "invisible" → decisión aparte); medición fina en Moto G (criterios numéricos en la bóveda). PERF-02 quedó OBSOLETO (el SW ya cachea JS hasheado por `request.destination`).

---

### PERF-05: Carga fluida del index — secciones dinámicas que SALTAN al llegar Firebase (CLS) · 2026-06-21
*   **Diagnóstico (Daniel + comité ×3 + Gemini)**: el index es client-rendered; `.home-cats` (colecciones) y `.home-featured` (piezas) nacen vacías, el CSS `:empty` las colapsa, y al responder Firestore (hasta 4s) se EXPANDEN de golpe → salto de layout, la landing "se siente fea". Dos saltos: GRANDE (sección 0→N filas; lo cura RESERVAR el alto en boot) y CHICO (imagen sin decodificar; lo cura `aspect-ratio` en el tile — YA EXISTE).
*   **Tesis del comité (corrige mi v0)**: lo que baja el CLS es **reservar el alto antes de que lleguen los datos, NO un skeleton**. Skeleton/shimmer VETADO (se ve barato above-the-fold + re-introduce costo GPU). Los grandes reservan + fundido callado.
*   **IMPLEMENTADO (commit+push, Daniel mergea)**: `js/core/section-reserve.js` (guarda en localStorage el alto real de la grilla por sección+ancho; lo reserva en la siguiente carga). `data.js`: `isReady('cats'|'featured')` (readiness por sección; tras el timeout de `load()` todas se consideran listas → vacías colapsan = red de seguridad anti-carga-eterna) + `_notify()` al vencer el timeout. `categories.js`/`featured.js`: 3 estados (CARGANDO=reserva alto+aria-busy / DATOS=contenido+fade-in / VACÍO=colapsa); **cap 6 colecciones + "ver todas"** (decisión Daniel) + **centradas si <6** (`home.css` dock `display:flex; justify-content:center`, flex-basis por breakpoint). Fade-in `bj-fade-in` (swap directo en `.bj-lite`/RM → cero costo GPU). Error de red = SILENCIO TOTAL (cero-ficción). Solo cats+featured; journal/films/social = hide-when-empty intacto.
*   **Reserva CONDICIONAL (§3.4)**: solo reserva si hay alto guardado (revisita); 1ª visita sin dato → '' colapso limpio (nunca reservar a ciegas = nunca salto-inverso). → exacto en revisitas, settle mínimo la 1ª vez.
*   **Consejo Gemini (peer review, integrado tras `310d6bb`)**: cazó un bug real que yo había simplificado — `isReady()` se fiaba del timeout de 4s → colapso-y-reexpansión en red lenta (¡el escenario de Daniel!). FIX: `isReady('cats'/'featured')` = datos REALES (`_initialCols`/`_initialPieces`), NO `_loaded`; + **watchdog 8s** por sección (anti-carga-eterna); + fade al entrar a contenido (suaviza dato tardío); + gate `.bj-lite` al shimmer de `.pz-skeleton` (pieza.css). REFUTADO/DIFERIDO: state-injection/prerender (= C1 estructural, el ideal de Gemini; siguiente paso, no este lote).
*   **Fix scroll en recarga (Daniel reportó 2026-06-21)**: en `Ctrl+Shift+R` la página caía a media página (a veces arriba, inconsistente). RCA verificada: `history.scrollRestoration` estaba en `'auto'` (default) → el navegador restauraba la posición previa mientras el contenido client-rendered aún cambiaba de alto (carrera; AGRAVADO por la reserva, que ahora hace que la página alcance su alto antes → la restauración "acierta" a la vieja posición). FIX: `history.scrollRestoration='manual'` en `boot.js` → la recarga empieza arriba, el contenido se desarrolla bajo el pliegue sin mover la vista. Verificado en dev (`scrollRestoration='manual'`, `scrollY=0` tras reload). **Lección reusable**: página client-rendered de alto variable + scrollRestoration 'auto' = salto de scroll al recargar → 'manual'.
*   **Flash de páginas data-dependientes (Daniel reportó 2026-06-22)**: además del index, varias páginas pintaban el estado por DEFECTO/VACÍO/EQUIVOCADO antes de que llegara Firestore y luego saltaban al correcto. Auditoría + fix (mismo patrón: readiness REAL por sección, NO el timeout de 4s; estado de carga reservado SIN texto equivocado; watchdog 8s anti-carga-eterna; `entrada.js` ya era el patrón correcto a replicar):
    - **catálogo** (`catalogo.js`): mostraba "Todas las piezas" genérico + filtro solo "Todo" + "No hay piezas" FALSO → ahora estado CARGANDO (eyebrow + reservado) hasta `isReady('cats')&&isReady('featured')`.
    - **pieza** (`pieza.js`): mostraba "Esta pieza descansa en otro lugar" (404 FALSO) al timeout de 4s en red lenta → ahora skeleton hasta `isReady('featured')` real.
    - **journal** (`journal.js`): mostraba "El Journal está en preparación" (vacío FALSO) → ahora carga hasta `isReady('journal')` (nuevo flag `_initialJournal` en data.js).
    - **lista-deseos** (`lista-deseos.js`): mostraba "Pieza retirada" FALSO por cada favorito → ahora tarjeta reservada hasta `isReady('featured')`.
    - **entrada** (`entrada.js`): ya OK (`_settled`); + watchdog 8s.
    - **nosotros/contacto**: NO tocados (muestran defaults reales, no equivocado/vacío). **Lección reusable**: página client-rendered → gatear el render data-dependiente en readiness REAL + watchdog; nunca pintar el default/vacío durante la carga.
*   **Pendiente**: validar en navegador REAL con datos (el sandbox/emulador no alcanza Firestore → solo verifiqué camino vacío/timeout, scroll y que no hay errores); medir CLS bajo Slow 4G + scroll (criterio <0.05; comité §9). 1ª-visita-exacta vía cupo fijo (§3.1) = refinamiento futuro. Deliberación completa + verdict Gemini → bóveda `2026-06-21-carga-fluida-index-comite-v3.md`.

---

## 📋 Plan de Acción y Priorización

| ID | Tarea | Prioridad | Impacto estimado |
|---|---|---|---|
| **PERF-01** | Corregir View Transitions en `router.js` y mover a directiva `@view-transition` en CSS | Alta | Mejora en la fluidez visual de navegación entre shells |
| **PERF-02** | Configurar caché Cache-First en `sw.js` para scripts con hashes en su nombre | Media-Alta | Reducción drástica del tiempo de carga en visitas recurrentes |
| **PERF-03** | ~~Limpieza Zona Legacy de `style.css`~~ — **OBSOLETO** (`style.css` ya no existe) | — | — |
| **PERF-04** | Modo `.bj-lite` por capacidad (header blur, aurora/blobs/dock off en equipos modestos) + `content-visibility` listas — ver ESTADO 2026-06-21 ✅ implementado, falta validación en dispositivo | **Alta** | Fluidez en gama baja (PC y móvil); equipos capaces idénticos |
