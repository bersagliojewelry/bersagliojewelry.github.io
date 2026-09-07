# Bersaglio Jewelry — Mejoras de SEO & Performance (Fase 4)

> Guía accionable para portar a producción (`bersagliojewelry.github.io`). Cada bloque incluye
> el **diagnóstico**, el **código listo para pegar** y la **prioridad**. Fundamentado en el código
> real del repo y en las auditorías internas `docs/43-UX.md` y `docs/45-PERFORMANCE.md`.

---

## 1 · SEO técnico

### 1.1 · Datos estructurados JSON-LD — **prioridad ALTA**
Hoy las páginas no emiten Schema.org. Google necesita JSON-LD para mostrar *rich results*
(precio, rating, breadcrumbs, artículos). Añade estos `<script type="application/ld+json">`.

**Organization + LocalBusiness** (en `index.html`, una sola vez):
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "JewelryStore",
  "name": "Bersaglio Jewelry",
  "image": "https://bersagliojewelry.co/img/logo-bersaglio.png",
  "description": "Alta joyería con esmeraldas colombianas, diamantes certificados GIA y oro 18K. Atelier en Cartagena de Indias.",
  "@id": "https://bersagliojewelry.co/",
  "url": "https://bersagliojewelry.co/",
  "telephone": "+57-300-000-0000",
  "priceRange": "$$$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Centro Histórico, Casa San Agustín",
    "addressLocality": "Cartagena de Indias",
    "addressRegion": "Bolívar",
    "addressCountry": "CO"
  },
  "founder": { "@type": "Person", "name": "Kary Mendoza" },
  "foundingDate": "2014",
  "sameAs": [
    "https://www.instagram.com/bersagliojewelry",
    "https://www.facebook.com/bersagliojewelry"
  ]
}
</script>
```

**Product** (generado por pieza en `pieza.html`, desde los datos de Firestore):
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Topos Halo Esmeralda",
  "image": ["https://bersagliojewelry.co/img/earrings-emerald.png"],
  "description": "Halo de diamantes que orbita una esmeralda colombiana de talla cojín…",
  "brand": { "@type": "Brand", "name": "Bersaglio Jewelry" },
  "material": ["Oro 18K", "Esmeralda Muzo", "Diamante"],
  "offers": {
    "@type": "Offer",
    "priceCurrency": "COP",
    "price": "12400000",
    "availability": "https://schema.org/InStock",
    "url": "https://bersagliojewelry.co/pieza.html?p=topos-halo-esmeralda"
  }
}
</script>
```

**Article** (en `entrada.html` para cada nota del Journal) y **BreadcrumbList** (en catálogo y pieza)
completan el set. Valida todo en [search.google.com/test/rich-results](https://search.google.com/test/rich-results).

### 1.2 · Open Graph por pieza y por artículo — **prioridad ALTA**
`index.html` ya tiene OG correcto, pero `pieza.html`, `colecciones.html`, `journal.html` y
`entrada.html` heredan el OG genérico → al compartir un anillo en WhatsApp/Instagram sale el banner
de inicio, no la pieza. Inyecta OG dinámico por página:
```html
<meta property="og:type" content="product">
<meta property="og:title" content="Topos Halo Esmeralda · Bersaglio Jewelry">
<meta property="og:description" content="Esmeralda Muzo + diamantes GIA en oro 18K. Pieza única del atelier de Cartagena.">
<meta property="og:image" content="https://bersagliojewelry.co/img/earrings-emerald.png">
<meta property="og:url" content="https://bersagliojewelry.co/pieza.html?p=topos-halo-esmeralda">
<meta property="product:price:amount" content="12400000">
<meta property="product:price:currency" content="COP">
```
> Este es el complemento natural del **momento *shareable*** que añadimos en la Fase 2.

### 1.3 · Meta description, canonical y `hreflang` por página — **prioridad MEDIA**
Cada `*.html` debe llevar su propia `<meta name="description">` (única, 150–160 car.) y
`<link rel="canonical">`. El sitio es es-CO; declara idioma para evitar SEO duplicado:
```html
<link rel="canonical" href="https://bersagliojewelry.co/colecciones.html">
<link rel="alternate" hreflang="es-co" href="https://bersagliojewelry.co/colecciones.html">
<link rel="alternate" hreflang="x-default" href="https://bersagliojewelry.co/">
```

### 1.4 · `alt` descriptivos en toda imagen — **prioridad ALTA (también accesibilidad)**
En el código actual varias imágenes usan `alt=""` (hero, tiles). Para SEO de imágenes y lectores de
pantalla, describe la pieza: `alt="Topos de esmeralda colombiana y diamantes en oro 18K"`. El banner
hero debe describir la escena: `alt="Modelo con collar de esmeraldas en el atelier de Cartagena"`.

### 1.5 · `sitemap.xml` con todas las piezas y notas — **prioridad MEDIA**
El `public/sitemap.xml` existe pero es estático. Genéralo en build incluyendo cada `pieza.html?p=…`
y `entrada.html?e=…`, con `<lastmod>` y `<image:image>` por pieza. Mantén `robots.txt` apuntando a él.

---

## 2 · Performance

### 2.1 · View Transitions nativas (PERF-01) — **prioridad ALTA**
`js/core/router.js` envuelve un cambio de `location.href` (navegación dura) dentro de
`document.startViewTransition()`. Eso **rompe** la transición (las JS View Transitions solo aplican en
SPA) y genera el rechazo *"Transition was skipped"*. **Solución:** quita el wrapper JS y deja la
directiva nativa cross-document, ya presente en `liquid-glass.css`:
```css
@view-transition { navigation: auto; }
```
Soportado nativamente por Chrome/Edge 126+. Sin JS, sin parpadeos, sin promesa colgada.

### 2.2 · Service Worker `Cache-First` para JS con hash (PERF-02) — **prioridad MEDIA-ALTA**
`public/sw.js` omite cachear los bundles de Vite porque su nombre lleva hash. Pero dentro de una misma
versión son inmutables → cachéalos `Cache-First`; un deploy nuevo cambia el hash y descarga el nuevo:
```js
if (url.pathname.startsWith('/dist/assets/js/')) {
  event.respondWith(
    caches.open('bj-js-v1').then(async (cache) => {
      const hit = await cache.match(event.request);
      return hit || fetch(event.request).then((res) => { cache.put(event.request, res.clone()); return res; });
    })
  );
  return;
}
```

### 2.3 · Purgar la "Zona Legacy" de `style.css` (PERF-03) — **prioridad MEDIA**
`css/style.css` tiene +10.500 líneas, mayormente anuladas por `liquid-glass.css`. Es CSS
render-blocking muerto. Elimina progresivamente los bloques V1–V7 (Hero V7, Lookbook V7 viejos);
reduce el archivo a menos de la mitad (~40–50 KB menos de descarga inicial) sin tocar la estructura activa.

### 2.4 · Precargar fuentes self-hosted — **prioridad MEDIA**
Ahora que las fuentes son locales (`fonts/`), precarga las 2 que entran en el primer pintado para
evitar FOUT (Cormorant para titulares, Manrope para UI). Usa `font-display: swap` (ya aplicado):
```html
<link rel="preload" href="/fonts/CormorantGaramond-VariableFont_wght.ttf" as="font" type="font/ttf" crossorigin>
<link rel="preload" href="/fonts/Manrope-VariableFont_wght.ttf" as="font" type="font/ttf" crossorigin>
```
> Bonus: el sitio ya self-hostea las fuentes vía `@font-face` → puedes **eliminar el `<link>` a
> Google Fonts** de todos los `*.html` y los dos `preconnect` a `fonts.gstatic.com`, ganando latencia.

### 2.5 · Imágenes — ya bien encaminado — **prioridad BAJA**
El repo ya sirve `avif`/`webp` responsivos con `<picture>` y precarga el hero LCP (`fetchpriority="high"`).
Refuerzos: `loading="lazy"` + `decoding="async"` en todo lo *below-the-fold* (catálogo, journal, atelier);
define `width`/`height` o `aspect-ratio` en cada imagen para reservar espacio y subir el CLS a ≈0.

---

## 3 · Accesibilidad y UX (refuerzos finales)

- **`prefers-reduced-motion`** — ya respetado en el sistema; mantenlo en cualquier animación nueva
  (los reveals, el ticker y el parallax del kit ya lo gatean).
- **Focus visible** — el anillo dorado `outline` ya existe en `components.css`; verifícalo en los
  nuevos overlays (búsqueda, quick-view) al portarlos.
- **Landmarks y `aria`** — `<main>`, `<nav>`, `<header>`, `<footer>` ya están; añade `aria-label` a
  los drawers y al modal de pieza, y `role="dialog"` + foco atrapado en quick-view/búsqueda.
- **Contraste** — el texto ink-emerald sobre pearl cumple AA; cuida el texto blanco sobre imágenes:
  las *protection gradients* (vignettes) ya lo garantizan en hero y tiles.

---

## 4 · Checklist priorizado

| # | Mejora | Categoría | Prioridad | Esfuerzo |
|---|--------|-----------|-----------|----------|
| 1 | JSON-LD Organization + Product + Article | SEO | 🔴 Alta | Medio |
| 2 | OG/Twitter por pieza y artículo | SEO/Social | 🔴 Alta | Bajo |
| 3 | `alt` descriptivos en toda imagen | SEO/A11y | 🔴 Alta | Bajo |
| 4 | View Transitions nativas (quitar wrapper JS) | Perf | 🔴 Alta | Bajo |
| 5 | SW Cache-First para JS hasheado | Perf | 🟠 Media-Alta | Medio |
| 6 | Meta description + canonical + hreflang por página | SEO | 🟠 Media | Medio |
| 7 | sitemap.xml dinámico con piezas y notas | SEO | 🟠 Media | Medio |
| 8 | Eliminar Google Fonts CDN + precargar fuentes locales | Perf | 🟠 Media | Bajo |
| 9 | Purgar Zona Legacy de style.css | Perf | 🟠 Media | Medio |
| 10 | lazy/async + aspect-ratio en imágenes below-fold | Perf/CLS | 🟢 Baja | Bajo |
| 11 | `role="dialog"` + foco atrapado en overlays | A11y | 🟢 Baja | Bajo |

---

*Las mejoras 4 y 8 también eliminan dos errores/avisos de consola actuales
(`"Transition was skipped"` y la dependencia de red a Google Fonts).*
