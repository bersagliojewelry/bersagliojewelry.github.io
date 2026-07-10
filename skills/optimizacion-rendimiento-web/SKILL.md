---
name: optimizacion-rendimiento-web
description: Usar para MEJORAR EL RENDIMIENTO de una página/sitio web end-to-end (velocidad de carga, Core Web Vitals, PageSpeed/Lighthouse) — no como parches sueltos sino como un BUCLE agéntico medible: diagnosticar el cuello real → priorizar por impacto/riesgo → implementar con réplica EXACTA de diseño (cero regresión) → verificar EN VIVO (0 asunciones) → iterar por página. Cubre las técnicas de front (fuentes self-hosted con unicode-range, dieta de JavaScript, critical-path CSS, imágenes modernas/lazy, LCP/FCP, preconnect útil, service-worker/cache, diferir terceros) y ORQUESTA las skills hermanas (SEO, imágenes, verificación live). Es PORTABLE (cualquier stack) y VIVA: cada página a la que se aplica enriquece el catálogo. NO es para features nuevas ni para depurar un bug funcional (eso es systematic-debugging). Triggers — "optimiza el rendimiento", "mejora el PageSpeed/Lighthouse", "el sitio carga lento", "baja el LCP/FCP", "saca X del critical path", "self-host de fuentes", "dieta de JS", "aplica el proceso de optimización a esta página", "hazlo más rápido".
license: MIT
metadata:
  author: operador-cars
  version: "1.0.0"
allowed-tools: Read Write Edit Glob Grep Bash
---

# ⚡ Optimización de Rendimiento Web — playbook agéntico, medible y verificado en vivo

> **Origen (caso real):** sacar Google Fonts del critical path de ~70 páginas self-hosteando las
> fuentes (subsets latin, `unicode-range`) via un script reproducible → 0 requests externas, cero
> regresión tipográfica, confirmado EN VIVO (0 peticiones a `fonts.googleapis`). La lección no fue
> "una técnica", fue el **bucle**: medir el cuello real → mayor win / menor riesgo → réplica exacta
> del diseño → **verificar en producción, no asumir** → iterar.
>
> **PORTABLE:** cero rutas de un repo concreto. Adapta al stack activo (lee su cerebro/CLAUDE.md si
> existe). **VIVA:** cuando descubras una técnica o gotcha nuevo aplicándola a una página, **añádelo**
> al §3 o a `references/` — el sistema mejora con cada página optimizada.
>
> ⚔️ **Postura:** perf sin medición es superstición, y "se ve rápido" no es evidencia. Cada cambio
> trae **número antes/número después** y **verificación live** (hermana: `validacion-live-chrome`).

## 0. Cuándo aplica / cuándo NO

- **SÍ:** te piden acelerar una página/sitio, subir el PageSpeed/Lighthouse, bajar LCP/FCP/TBT/CLS,
  o "aplicar el proceso de optimización" a una página nueva. También cuando TÚ, tocando código,
  detectas un cuello obvio (render-block, JS enorme, imágenes sin optimizar, fuentes externas).
- **NO:** implementar una feature (aunque convenga optimizarla después); depurar un bug funcional
  (→ `systematic-debugging`); el gate del claim final (→ `verification-before-completion`).
- **Antes de tocar nada:** confirma qué está **bloqueado por infraestructura** (p.ej. minify/Brotli/
  critical-CSS suelen exigir un pipeline de build o CDN). No pelees contra el techo de infra: registra
  el bloqueo y ataca lo alcanzable. El mejor win es el que puedes shipear HOY sin romper el diseño.

## 1. El bucle agéntico (el corazón)

Aplica este ciclo por página/superficie. Usa checkboxes:

- [ ] **Medir** — obtén el número base (PageSpeed/Lighthouse: LCP, FCP, TBT, CLS, score) y el
      **waterfall** (qué bloquea el render). Sin número base no hay win demostrable (§2).
- [ ] **Priorizar** — ordena por **impacto × (1/riesgo) × alcanzable-hoy**. El critical path y el LCP
      mandan. Descarta lo bloqueado por infra (anótalo, no lo pelees).
- [ ] **Implementar** — una técnica del §3, con **réplica EXACTA del diseño** (§17.2 de perf: nada
      de `transition:all`, no animar layout props; solo `transform`/`opacity`). Cambio aditivo,
      reversible. Preserva IDs/clases/nombres de función (callsites externos).
- [ ] **Verificar EN VIVO** — §4. Preview local para el diff; extensión Chrome para producción tras
      deploy. **Prueba adversarial:** refuta "0 peticiones externas" leyendo la red real; confirma
      que la tipografía/layout NO cambió (cero regresión).
- [ ] **Medir de nuevo** — re-corre PageSpeed. Reporta **antes → después** con el número. Si no
      mejoró (o empeoró CLS/algo), revierte y re-diagnostica.
- [ ] **Consolidar** — registra la técnica/gotcha en el cerebro del proyecto Y enriquece esta skill
      (§6). Bump de cache si el stack lo exige (o deja que el SW/CDN revalide — conócelo, §3.5).

## 2. Diagnóstico: dónde está el cuello (no adivines)

Mide, no supongas. Fuentes de verdad, por orden:

1. **PageSpeed Insights / Lighthouse** — score móvil (el que importa) + las métricas:
   - **LCP** (Largest Contentful Paint): suele ser el hero (imagen o texto grande). Cuello #1.
   - **FCP** (First Contentful Paint): lo frena el **critical path** (CSS/fuentes/JS render-blocking).
   - **TBT** (Total Blocking Time): JavaScript pesado en el hilo principal.
   - **CLS** (Cumulative Layout Shift): saltos de layout (fuentes sin `swap`, imágenes sin dimensión).
2. **Waterfall de red** (DevTools o `performance.getEntriesByType('resource')`): qué se descarga
   **render-blocking**, qué es externo (DNS+TLS extra), qué pesa, qué se puede diferir.
3. **Coverage / bundle**: cuánto CSS/JS se carga sin usar above-the-fold.

**Cómo medir de forma robusta** (aprendido en cars): la API pública de PageSpeed suele estar sin
cuota y la UI `pagespeed.web.dev` tarda ~90s y a veces se cuelga. La fuente más rica y controlable es
**Lighthouse local contra la URL de PRODUCCIÓN**: `npx --yes lighthouse <url> --form-factor=mobile
--output=json --output-path=lh.json --chrome-flags="--headless=new"` (y `--preset=desktop` para
ordenador). El JSON trae cada audit con su ahorro (ms/KB); parsea `audits[*].details.type==='opportunity'`
(oportunidades) y los `*-insight` (diagnósticos: render-blocking, cache, main-thread, forced-reflow).
Mide **SIEMPRE móvil Y ordenador** — divergen mucho (en cars: móvil 57 vs ordenador 95 con el MISMO código).

> **Lab ≠ campo (dato clave):** el móvil de Lighthouse simula 4G lento + CPU 4× → números pesimistas
> (un FCP lab de 8s puede ser <1s para un usuario real). Los datos de **campo (CrUX, "usuarios reales"
> en PageSpeed)** son la verdad, pero Google solo los publica sobre un umbral de TRÁFICO; un sitio con
> poco tráfico verá **"No hay datos"** — NO es un defecto técnico, se resuelve con visitas (SEO/marketing).
> Usa el lab para HALLAR cuellos (son reales), no para juzgar la experiencia real en cifras absolutas.

> **Cuidado con la varianza en sitios de galería dinámica (aprendido en cars):** si la página carga
> muchas imágenes dinámicas (fotos de producto/vehículo desde Storage/CDN), el nº que entra en el
> trace de Lighthouse VARÍA enormemente entre corridas (en cars: 13 vs 53 imágenes = ±1,8MB), lo que
> ENMASCARA por completo un ahorro de ~500KB en el SCORE (el score puede incluso BAJAR). Para deltas
> pequeños **mide el efecto por RED DIRECTA** — ¿la request desapareció? ¿bajó el peso de esa categoría
> en `resource-summary`? — no por el score global, que es demasiado ruidoso. En cars la Ola 1 se
> confirmó así: logo 412KB → 0 reqs, GSI → 0, Script −96KB (medido en `resource-summary`), aunque el
> score móvil no se movió. Corolario: en un sitio con galería, el mayor cuello suele ser el **payload
> de imágenes dinámicas** — atácalo (lazy agresivo, srcset responsive, CDN) antes que los KB de chrome.

> Regla: **un cuello a la vez**, con su número. "El sitio carga lento" no es accionable; "el FCP es
> 3s porque 2 conexiones externas a fonts.* bloquean el render" sí lo es.

## 3. Catálogo de técnicas (por impacto típico; adapta al diagnóstico)

### 3.1 Fuentes — self-host + `unicode-range` (saca Google Fonts del critical path)
Cargar de `fonts.googleapis.com`+`fonts.gstatic.com` mete 2 conexiones externas (DNS+TLS) EN el
critical path. Self-hostea los `woff2` en el mismo origen. **Clave:** conserva el `unicode-range`
de Google → el navegador solo baja el subset+peso que la página usa (idéntico a Google, sin peso
muerto). Script reproducible: [scripts/fetch-fonts.mjs](scripts/fetch-fonts.mjs).
- **Réplica EXACTA:** self-hostea las MISMAS familias/pesos/subsets que ya se pedían → cero cambio
  visual (son los mismos `woff2`). Mantén `font-display: swap`.
- **Gotchas:** (a) si un JS/guard reinyecta las fuentes de Google como fallback, apúntalo a lo local.
  (b) un `@import` de fuente en un CSS = render-block en **cascada** (peor que un `<link>`) → elimínalo.
  (c) retira los `preconnect` a `fonts.*` (ya son conexiones muertas). (d) para español basta el
  subset `latin` (á,é,í,ó,ú,ñ,ü,¿,¡ están en U+00xx); `latin-ext` queda de red de seguridad y **no
  se transfiere** salvo que aparezca un glifo de ese rango. (e) marca los `woff2` como `binary` en
  `.gitattributes` (autocrlf los corrompe).

### 3.2 JavaScript — dieta, `defer`/`async`, code-split, lazy
El JS bloquea el render y el hilo principal (TBT). Por orden:
- **Diferir lo no-crítico:** `defer`/`async` en `<script>`; retrasa lo que no se necesita above-fold.
- **Dieta / gate por página:** no cargues módulos que esa página no usa (gate por ruta/condición).
- **Code-split / `import()` dinámico:** librerías pesadas (export a Excel, editores) van en chunk
  aparte, cargado bajo demanda.
- **Lazy de terceros:** analytics/tag-manager/chat/mapas → tras interacción o idle, no en el boot.

### 3.3 CSS — critical path
- Difiere el CSS no-crítico con el truco `media="print" onload="this.media='all'"` (sale del
  render-blocking sin FOUC del above-fold).
- Critical-CSS inline (above-fold) es potente pero **frágil** (FOUC si te equivocas) y suele exigir
  build → trátalo como técnica avanzada con verificación visual estricta (o difiérelo si no hay pipeline).

### 3.4 Imágenes — el LCP suele vivir aquí (→ delega en `image-pipeline`)
- Formatos modernos (AVIF/WebP), `<picture>` con `srcset` responsive, `loading="lazy"`+`decoding="async"`
  below-fold, `fetchpriority="high"` SOLO en el LCP, `width`/`height` para no generar CLS.
- **Verifica FÍSICAMENTE** que cada variante del `srcset` existe (los optimizers no hacen upscaling).
- Detalle y pipeline reproducible → skill `image-pipeline`.

### 3.5 Red / cache / service-worker
- `preconnect` SOLO a orígenes críticos que de verdad se usan (≤2); el resto `dns-prefetch`.
- **Conoce la estrategia del SW/CDN** antes de esperar propagación: `networkFirst` sirve fresco;
  `stale-while-revalidate` sirve la copia vieja y actualiza en background (→ la 1ª visita tras el
  deploy puede mostrar recursos viejos **desde caché**; se limpia en la 2ª). No confundas eso con un
  bug (verifícalo: `transferSize===0` = servido de caché, no de red).
- Precache de assets estables (logos, fuentes) para acelerar visitas de retorno.

### 3.6 Terceros y guardarraíles
Widgets de Google (reCAPTCHA, GSI Sign-In), chats y mapas inyectan sus PROPIAS fuentes/recursos.
No los confundas con los tuyos al auditar la red (filtra por la familia/host: `Cardo`/`Manrope` = tuyo;
`Roboto`/`Google Sans` = del widget). Diferir/lazy-cargar esos widgets cuando el negocio lo permita.

**Sospechosos habituales del "JS sin usar" (caso cars, ~445KB / ~2,6s en móvil):** reCAPTCHA/App Check
(~375KB), Google Sign-In / GSI (~97KB, + lanza errores `FedCM` en consola que BAJAN Best-Practices) y
Google Tag Manager / Analytics (~166KB) se cargan en el ARRANQUE pero solo se usan al interactuar
(login, formulario, tracking). **Diferirlos al primer uso** (click en “Ingresar”, submit, o `requestIdleCallback`)
recupera cientos de KB y varios segundos en móvil; GSI diferido además elimina los errores de consola.
Ojo con App Check: no lo difieras a ciegas si protege desde el inicio — evalúa el modelo de seguridad.
**Y busca imágenes pesadas sueltas:** en cars, `logo-placeholder.png` pesaba 413KB (más que reCAPTCHA) —
un solo asset mal optimizado puede superar a todo el JS de terceros. Ordena `network-requests` por peso.

## 4. Verificación LIVE (adversarial — refuta, no confirmes)

Perf se demuestra con observabilidad, no con fe. Dos planos:

- **Diff local (antes de deploy):** levanta el sitio y usa `preview_*` / DevTools. Confirma por
  **computed styles y red**, no por screenshot (más preciso para fuentes): `document.fonts.ready` +
  `getComputedStyle` + `performance.getEntriesByType('resource')`. Sweep explícito: "0 peticiones a
  `fonts.(googleapis|gstatic)`", "solo subsets `latin`", "N familias aplicadas en el DOM".
- **Producción (tras deploy):** skill `validacion-live-chrome` (extensión Chrome en la sesión del
  dueño). Mide antes/después con PageSpeed. **Cero regresión visual** es requisito, no opcional:
  un screenshot del render confirma que la tipografía/layout es idéntica.
- **Trampa del SW (§3.5):** si en producción ves peticiones externas residuales, comprueba
  `transferSize===0` (caché) y re-carga: si desaparecen en la 2ª visita, es transición SWR, no un fallo.

## 5. Integración con el ecosistema (orquesta, no dupliques)

Esta skill es la **espina**; delega en las hermanas:
- **SEO / visibilidad:** `ssg-static-prerender` (pre-render estático + `<noscript>`), `semantic-schema-aeo`
  (schema/AEO), `maps-gbp-local` (local/GBP), `search-console-setup-y-diagnostico` (indexación), agente
  `seo-auditor` (auditoría read-only). Perf y SEO se refuerzan: un sitio rápido rankea mejor; el SSG
  sirve HTML listo (mejor FCP + indexable).
- **Imágenes:** `image-pipeline`. **Accesibilidad:** `accessibility-audit` (a11y es parte de calidad).
- **Verificación:** `validacion-live-chrome`, `caza-bugs`. **Publicar:** `publicar-web-produccion`.
- **Arquitectura / criterio:** `arquitecto-software`, `asesor-critico-honesto`; fixes ambiguos →
  `comite-expertos` (acotado).

## 6. Iteración: el sistema mejora por página (VIVA)

Cada página a la que aplicas el bucle deja aprendizaje. Al cerrar una optimización:
- Registra el **antes→después** y la técnica en el cerebro del proyecto (ADR/lección).
- Si descubriste una técnica o gotcha **reutilizable**, **edítala aquí** (§3 o `references/`) — con
  disparador y el número que la respalda. Así la próxima página parte de más arriba.
- Mantén un checklist por-página (fuentes ✅ · JS ✅ · CSS · imágenes · red/SW · terceros) para saber
  qué falta en cada superficie.

## Ground rules

- ALWAYS mide antes y después (número real). Sin base, no hay win.
- ALWAYS réplica EXACTA del diseño: cero regresión visual es requisito (el dueño lo exige).
- ALWAYS verifica en vivo (red + computed styles), nunca "se ve rápido". Refuta tus propias asunciones.
- ALWAYS un cuello a la vez, priorizado por impacto × (1/riesgo) × alcanzable-hoy.
- NEVER animes layout props (width/height/top/left/margin/padding) — solo `transform`/`opacity`.
  NEVER `transition: all` ni `* { transition }` global. NEVER `backdrop-filter` en grids de N ítems.
- NEVER pelees contra el techo de infra (minify/Brotli/critical-CSS sin pipeline): regístralo y sigue.
- NEVER renombres IDs/clases/funciones existentes (rompe callsites). Cambios aditivos.
- PREFER script reproducible sobre edición manual masiva (self-host de fuentes, optimizar imágenes).
- PREFER sacar del critical path (diferir/self-host/lazy) antes que micro-optimizar bytes.

## Scripts

- [scripts/fetch-fonts.mjs](scripts/fetch-fonts.mjs) — self-host reproducible de Google Fonts
  (descarga los `woff2` de los subsets configurados con `unicode-range`, reescribe a rutas locales,
  emite el CSS). Edita el array `FAMILIES` con las familias/ejes que tu sitio pide y córrelo con Node 18+.

---
> **[HONOR]** — sin gate de linter (la mejora vive en el navegador/PageSpeed, fuera del alcance
> mecánico de un check). Se cumple por honor: **número antes/después + verificación live** en cada
> aplicación, o la optimización NO está cerrada.
