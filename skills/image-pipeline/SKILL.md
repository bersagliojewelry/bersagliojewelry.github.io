---
name: image-pipeline
description: Optimizar imágenes en el BUILD para velocidad (Core Web Vitals) + SEO de imagen + señal local — porque en joyería/autos/inmuebles la imagen ES el producto y pesa el LCP. Úsala al procesar las fotos de cualquier sitio del paquete de visibilidad: generar WebP/AVIF (con fallback), dimensiones responsivas (`srcset`), `width`/`height` para matar CLS, `loading="lazy"`+`decoding="async"` below-fold y `fetchpriority="high"` SOLO en el LCP, `alt` descriptivo real, `ImageObject` JSON-LD, y EXIF geo (señal local menor/opcional). Corre en el build (Sharp/equivalente), como módulo del SSG. Reglas duras: NUNCA upscaling (verificar que la variante exista físicamente antes de referenciarla en `srcset`), `alt` real (cero-demo, no relleno), imágenes absolutas para feeds/OG. Triggers — "optimizar imágenes", "WebP/AVIF", "imágenes lentas/LCP", "srcset responsive", "alt text", "ImageObject schema", "EXIF geo", "fotos pesadas". Lee `tenant_config.json` (imageFormats, imageGeoExif). Fusionable con `ssg-static-prerender`. NUEVA en el paquete (Altorra ya usa `sharp` → se amplía).
---

# 🖼️ Image Pipeline — imágenes rápidas + indexables + locales

> Parte del paquete de visibilidad (HUB). En estos verticales la **imagen es el producto** y manda el LCP.
> `imagePipeline(src, opts)` vive en el core (IoC) y corre en el build. Lee `tenant_config.json` (imageFormats, imageGeoExif).

## 0. Las 3 ganancias (una pasada, tres beneficios)
1. **Velocidad (CWV/LCP)**: formatos modernos (WebP/AVIF) pesan ~30-50% menos → LCP baja → mejor ranking + UX.
2. **SEO de imagen**: `alt` real + `ImageObject` + nombres de archivo descriptivos → Google Images + rich results.
3. **Señal local (opcional)**: EXIF geo en las fotos (lat/lng del local) = señal menor de local SEO.

## 1. Generación en el build (Sharp o equivalente)
```js
// imagePipeline(src, { formats:['webp','avif'], widths:[400,800,1200], geo }) -> { variants, imageObject }
import sharp from 'sharp';
for (const w of widths) for (const fmt of cfg.imageFormats) {
  await sharp(src).resize({ width: w, withoutEnlargement: true })   // ⛔ NUNCA upscaling
                  [fmt]({ quality: fmt === 'avif' ? 50 : 75 }).toFile(out(src, w, fmt));
}
```
**REGLA DURA (lección §95-§97 de Altorra)**: el optimizer **NO hace upscaling** → una variante grande de un
original chico NO se genera. **Antes de poner una variante en `srcset`, verifica que el archivo EXISTE físicamente**
(referenciar una variante inexistente = imagen rota). El SSG debe emitir solo las variantes realmente generadas.

## 2. Markup que emite (en el HTML del build)
```html
<picture>
  <source type="image/avif" srcset="/img/foto-400.avif 400w, /img/foto-800.avif 800w" sizes="(max-width:600px) 100vw, 50vw">
  <source type="image/webp" srcset="/img/foto-400.webp 400w, /img/foto-800.webp 800w" sizes="...">
  <img src="/img/foto-800.jpg" width="800" height="600" alt="<alt REAL>"
       loading="lazy" decoding="async" fetchpriority="auto">  <!-- LCP: loading="eager" + fetchpriority="high" -->
</picture>
```
- **`width`+`height` SIEMPRE** (mata CLS). · **`loading="lazy"`+`decoding="async"`** below-fold; el **LCP** (hero/
  1ª foto de la ficha) = `fetchpriority="high"` + sin lazy. · **`alt` real y descriptivo** (cero-demo: "anillo de
  compromiso oro 18k diamante 0.5ct" > "imagen1"). · `<picture>` con fallback JPG para navegadores viejos.

## 3. ImageObject (schema) + feeds/OG
```jsonc
{ "@type":"ImageObject", "contentUrl":"<absoluta https>", "caption":"<alt>",
  "exifData": [ /* si imageGeoExif: GeoCoordinates */ ] }
```
- Las URLs de imagen para **OG** (`og:image`) y **feeds** (`image_link`) deben ser **absolutas https** (los bots/
  destinos no resuelven relativas). El pipeline expone la URL absoluta vía el core.

## 4. Reglas duras
- NUNCA upscaling · verificar existencia física de cada variante antes de referenciarla · `alt` real (no relleno) ·
  `width`/`height` siempre · LCP marcado (eager+high), el resto lazy · imágenes absolutas para OG/feeds.

## ✅ Checklist
- [ ] WebP/AVIF + fallback generados (sin upscaling; variantes existen físicamente).
- [ ] `<picture>`/`srcset` + `width`/`height` + lazy/async (LCP = eager+fetchpriority high).
- [ ] `alt` real y descriptivo por imagen (cero-demo) · `ImageObject` con contentUrl absoluta.
- [ ] og:image / feed image_link = URL absoluta https.
- [ ] (Opcional) EXIF geo si `imageGeoExif` y el dueño lo autoriza.
