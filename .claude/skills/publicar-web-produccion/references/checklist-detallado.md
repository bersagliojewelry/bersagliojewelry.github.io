# Checklist detallado — comandos y plantillas

Detalle accionable por frente. Adapta rutas y dominios a tu proyecto.

## 1. Performance

### Imágenes a WebP/AVIF
```bash
# WebP con cwebp (libwebp). Calidad 80 suele ser el punto dulce.
cwebp -q 80 entrada.png -o salida.webp
# Lote con sharp-cli (Node):
npx sharp-cli -i "src/**/*.{jpg,png}" -o dist --format webp
```
- Usa `<picture>` con fallback si necesitas soportar navegadores viejos:
```html
<picture>
  <source srcset="img/foto.webp" type="image/webp">
  <img src="img/foto.jpg" alt="…" width="800" height="600" loading="lazy">
</picture>
```
- Declara `width`/`height` (o `aspect-ratio`) para que el navegador reserve espacio → mejora **CLS**.

### Fuentes
```css
@font-face {
  font-family: "Mi Fuente";
  src: url("/fonts/mifuente.woff2") format("woff2");
  font-display: swap;   /* muestra texto con fuente de respaldo mientras carga */
}
```

### Medición
```bash
npx lighthouse https://midominio.com --view        # informe local
# o PageSpeed Insights: https://pagespeed.web.dev/
```
Objetivos Core Web Vitals (2024+): **LCP ≤ 2.5 s**, **INP ≤ 200 ms** (INP reemplazó a FID en
marzo 2024), **CLS ≤ 0.1**, medidos al percentil 75 de usuarios reales.

## 2. SEO técnico

### Meta + Open Graph + Twitter
```html
<title>Título único y descriptivo</title>
<meta name="description" content="Resumen real de 140–160 caracteres.">
<link rel="canonical" href="https://midominio.com/pagina">  <!-- dominio REAL -->
<meta property="og:title" content="Título para compartir">
<meta property="og:description" content="Descripción para preview.">
<meta property="og:image" content="https://midominio.com/og.jpg">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
```

### robots.txt (raíz)
```
User-agent: *
Allow: /
Sitemap: https://midominio.com/sitemap.xml
```

### sitemap.xml (raíz, URLs absolutas del dominio real)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://midominio.com/</loc></url>
  <url><loc>https://midominio.com/catalogo.html</loc></url>
</urlset>
```
- Tras publicar: dar de alta en **Google Search Console** y enviar el sitemap.
- **JSON-LD** de negocio local si aplica (mejora el SEO de escaparates de negocio físico).
- **GitHub Pages:** añade un archivo `.nojekyll` en la raíz si hay carpetas o archivos que
  empiezan con `_` (Jekyll los ignora por defecto).

## 3. Seguridad y privacidad

### .gitignore (antes del primer commit)
```
.env
.env.*
*.key
*.pem
secrets/
```

### Verificar visibilidad y no exponer repos sensibles
```bash
# Estado real de visibilidad (no lo asumas)
gh repo view OWNER/REPO --json visibility -q .visibility   # esperado: PRIVATE para repos sensibles

# Publicar SOLO el build (estático) sin exponer el código fuente:
#  - GitHub Pages: rama gh-pages o carpeta /docs con el output del build
#  - Cloudflare Pages / Netlify / Vercel: conecta el repo o sube la carpeta dist/ directamente
```
- Una rama o un **fork** antiguo puede seguir conteniendo lo que borraste en `main`: revísalos.
- Si un repo sensible estuvo público aunque sea brevemente: privatízalo, **rota todos los
  secretos** y, si hubo datos de terceros/menores, evalúa notificación a la autoridad/titulares.

### Purgar un secreto ya commiteado
```bash
# 1) ROTA la credencial YA (asúmela comprometida) en el proveedor.
# 2) Reescribe el historial:
pipx run git-filter-repo --path .env --invert-paths     # recomendado
# o BFG:  bfg --delete-files .env
# 3) Empuja reescrito y coordina con el equipo (rompe clones existentes):
git push --force-with-lease
```
> Borrar el archivo en un commit nuevo **no** lo elimina del historial. Activa además
> **push protection / secret scanning** del proveedor como red de seguridad.

### E-commerce: claves de pago y PCI básico
- **En el front solo va la clave publicable** (`pk_…`). Las claves secretas (`sk_live_…`) y los
  secretos de webhook viven en backend/funciones, **nunca** en el bundle estático.
- **Usa pasarela gestionada** (página de pago alojada, *redirect* o *iframe* del proveedor): el
  dato de tarjeta lo captura y procesa el tercero PCI-compliant; **tu sitio nunca lo toca**.
- **Alcance PCI:** externalizar totalmente el pago te ubica en **SAQ A** (el cuestionario más
  simple). Evita **Direct Post / formularios JS propios** que capturan la tarjeta en tu dominio
  (te sacan de SAQ A). Si embebes la pasarela en **iframe**, ajusta `frame-src`/`frame-ancestors`
  de la CSP para permitir el dominio del proveedor sin abrir el sitio entero.
- **Valida y firma los webhooks** de la pasarela en backend antes de marcar un pedido como
  pagado; no confíes en parámetros que vengan del cliente.

### Datos personales y de menores — por región (verificar siempre la vigente)
| Región | Norma | Punto clave para menores |
|---|---|---|
| Colombia | **Ley 1581 de 2012** (+ Decreto 1377 de 2013) | Art. 7: tratamiento de datos de menores solo si respeta su **interés superior**; autorización del representante legal tras oír al menor. |
| Unión Europea / EEE | **GDPR Art. 8** | Consentimiento parental para servicios en línea por debajo de **16 años**; cada Estado puede bajar el umbral hasta **13**. |
| Otras | (verificar la local) | Confirma por **ubicación de los titulares**, no solo del servidor. |

Checklist:
- [ ] Aviso de privacidad accesible + base legal + consentimiento; **minimiza** los datos recogidos.
- [ ] Sin fotos/audios/nombres de menores reales sin autorización (ni en archivos ni en historial).
- [ ] En **demos/jurados**, usa datos **ficticios o anonimizados**.

### Cabeceras de seguridad por tipo de hosting
| Hosting | Mecanismo de cabeceras | HTTPS auto | Nota |
|---|---|---|---|
| Netlify | archivo `_headers` | Sí | Cabeceras completas. |
| Vercel | `headers` en `vercel.json` | Sí | Cabeceras completas. |
| Cloudflare Pages | archivo `_headers` o Transform Rules | Sí | Cabeceras completas; CDN propio. |
| GitHub Pages | **No** soporta cabeceras HTTP personalizadas | Sí | Solo CSP parcial vía `<meta http-equiv>`; para cabeceras estrictas pon Cloudflare delante. |

**Netlify / Cloudflare Pages** — archivo `_headers`:
```
/*
  Content-Security-Policy: default-src 'self'
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains
```

**Vercel** — `vercel.json`:
```json
{ "headers": [ { "source": "/(.*)", "headers": [
  { "key": "X-Content-Type-Options", "value": "nosniff" },
  { "key": "X-Frame-Options", "value": "DENY" },
  { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
  { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" }
] } ] }
```

**GitHub Pages** (no permite cabeceras HTTP personalizadas) — solo CSP parcial vía `<meta>`
(`X-Frame-Options`/`HSTS` **no** funcionan así):
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'">
```

Audita en **Mozilla Observatory**: https://developer.mozilla.org/en-US/observatory (objetivo A/A+).

## 4. UX

### 404 personalizada
- **GitHub Pages / Netlify:** un archivo `404.html` en la raíz se sirve automáticamente.
- Incluye enlace a inicio y al buscador; mantén la cabecera/branding del sitio.

### Fallback de rutas en una SPA
- **Netlify:** archivo `_redirects` → `/* /index.html 200`.
- **Vercel:** `rewrites` en `vercel.json` apuntando todo a `/index.html`.
- **Cloudflare Pages:** sirve `index.html` para rutas no encontradas, o usa `_redirects`.
- **GitHub Pages:** no hay rewrite de servidor → **copia `index.html` a `404.html`** para que el
  enrutado del cliente capture rutas profundas (recargar `/ruta/profunda` ya no dará 404).

### Enlaces rotos
```bash
npx linkinator https://midominio.com --recurse
# o lychee (Rust):  lychee --verbose ./**/*.html
```

### Formularios
- Envía un formulario de prueba **en producción** y confirma que el webhook/BD/correo recibe los datos.
- Verifica el mensaje de éxito y el de error.

### Smoke test post-deploy
- Abre el dominio real, recorre las rutas críticas, prueba la función estrella (login, compra,
  micrófono, etc.) y revisa la consola del navegador (0 errores) y la pestaña de red (sin 404,
  sin recursos externos rotos, sin "mixed content").
