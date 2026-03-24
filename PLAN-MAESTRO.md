# PLAN MAESTRO DE CRECIMIENTO Y MEJORAMIENTO — BERSAGLIO JEWELRY

> **Objetivo:** Convertir bersagliojewelry.co en la mejor y más avanzada página web de joyería del mundo.
> **Infraestructura:** GitHub Pages + Firebase (hosting, functions, analytics)
> **Fecha de inicio:** 2026-03-19

---

## DIAGNÓSTICO EJECUTIVO

| Pilar | Puntuación Actual | Meta |
|---|---|---|
| Rendimiento / Core Web Vitals | 6/10 | 9.5/10 |
| SEO Técnico | 8/10 | 10/10 |
| Accesibilidad | 9/10 | 10/10 |
| UI / Diseño Premium | 7/10 | 10/10 |
| UX / Dinamismo | 7.5/10 | 10/10 |
| Comercial / Conversión | 4/10 | 9/10 |
| Código / Arquitectura | 8/10 | 10/10 |

---

## HALLAZGOS CRÍTICOS

### Rendimiento — Bombas de peso

| Archivo | Peso actual | Problema |
|---|---|---|
| `img/banner.png` | 5.5 MB | Sin WebP, sin srcset |
| `Pic/Banner.png` | 5.5 MB | **Duplicado exacto** |
| `img/collage.png` | 2.2 MB | Sin WebP |
| `Pic/collage.png` | 2.2 MB | **Duplicado exacto** |
| `css/style.css` | 192 KB | 7,238 líneas sin minificar |

→ El banner de 5.5 MB destruye el LCP (Largest Contentful Paint). Solo optimizar imágenes puede mover Lighthouse de ~55 a ~85.

### SEO — Estado actual
- ✅ `pieza.js` ya inyecta **Product Schema** dinámicamente
- ✅ `pieza.js` ya inyecta **BreadcrumbList Schema** dinámicamente
- ✅ URLs de productos individuales **están en `sitemap.xml`** (RESUELTO)
- ✅ Animación `scroll-bounce` unificada a **1 sola definición** (RESUELTO)
- ✅ Product Schema ahora incluye `offers` completo — fix Google Search Console mar-2026
- ✅ `js/utils/schema.js` genera JSON-LD centralizado para todas las páginas

### Comercial — Estado actual
- ✅ `carrito.html` funcional con checkout Wompi (procesador colombiano)
- ✅ Integración WhatsApp para consultas de piezas
- Sin programa de recomendación ni email marketing visible

### Código — Design Tokens
- ✅ Ya existen CSS custom properties en `:root` (colores, spacing, tipografía, shadows)
- ❌ Muchos valores hardcodeados en lugar de usar las variables existentes

---

## FASE 1 — CORTO PLAZO (Semanas 1–3): Fundación de Rendimiento y SEO

### 1.1 Optimización crítica de imágenes
**Estado:** ✅ Completado

**Acción:** Convertir banner.png y collage.png a WebP con versiones responsive.

```bash
# Conversión masiva con sharp-cli
npx sharp-cli --input img/banner.png --output img/banner.webp --quality 85
npx sharp-cli --input img/banner.png --output img/banner-800.webp --width 800 --quality 80
npx sharp-cli --input img/banner.png --output img/banner-1200.webp --width 1200 --quality 82
npx sharp-cli --input img/banner.png --output img/banner-1920.webp --width 1920 --quality 85
npx sharp-cli --input img/collage.png --output img/collage.webp --quality 85
```

En `index.html` reemplazar el `<img>` del hero por `<picture>`:

```html
<!-- ANTES (5.5 MB, una sola imagen) -->
<img src="img/banner.png" alt="..." loading="eager" fetchpriority="high">

<!-- DESPUÉS (responsive + WebP, ~120–200 KB según dispositivo) -->
<picture>
  <source
    type="image/webp"
    srcset="
      img/banner-800.webp   800w,
      img/banner-1200.webp 1200w,
      img/banner-1920.webp 1920w
    "
    sizes="100vw"
  >
  <source srcset="img/banner.png" sizes="100vw">
  <img
    src="img/banner-1200.webp"
    alt="Bersaglio Jewelry — Alta joyería con esmeraldas colombianas"
    class="hero-bg-img"
    loading="eager"
    fetchpriority="high"
    decoding="async"
    width="1920"
    height="1080"
  >
</picture>
```

**Eliminar duplicados:** `Pic/` directorio completo (7.9 MB liberados).

### 1.2 CSS — Limpiar bloat de scroll-bounce
**Estado:** ✅ Completado

Eliminar las 3 definiciones duplicadas de `@keyframes scroll-bounce` (líneas ~618, ~4780, ~5029) y mantener solo una definición unificada:

```css
/* MANTENER SOLO ESTA DEFINICIÓN */
@keyframes scroll-bounce {
  0%, 100% { transform: translateY(0); opacity: 1; }
  50%      { transform: translateY(8px); opacity: 0.6; }
}
```

### 1.3 Accesibilidad — Skip link
**Estado:** ✅ Completado

Añadir como primera línea del `<body>` en `snippets/header.html`:

```html
<a href="#main-content" class="skip-link">Saltar al contenido principal</a>
```

```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 1rem;
  background: var(--gold);
  color: var(--black);
  padding: 0.5rem 1rem;
  font-weight: 600;
  z-index: 9999;
  border-radius: 0 0 4px 4px;
  transition: top 0.2s;
}
.skip-link:focus { top: 0; }
```

### 1.4 Accesibilidad — Alt text en logos
**Estado:** ✅ Completado

Cambiar `alt=""` por `alt="Bersaglio Jewelry"` en header y footer:

```html
<img src="img/logo-bj2.png" alt="Bersaglio Jewelry" class="logo-img">
```

### 1.5 Cookie Consent (GDPR)
**Estado:** ✅ Completado

Banner ligero sin dependencias externas en `snippets/footer.html`:

```html
<div id="cookie-banner" class="cookie-banner" role="dialog" aria-live="polite"
     aria-label="Consentimiento de cookies" hidden>
  <p>Usamos cookies de análisis para mejorar tu experiencia.
     <a href="/privacidad.html">Política de privacidad</a></p>
  <div class="cookie-actions">
    <button id="cookie-accept" class="btn-cookie btn-cookie--accept">Aceptar</button>
    <button id="cookie-decline" class="btn-cookie btn-cookie--decline">Rechazar</button>
  </div>
</div>
```

Nuevo archivo `js/cookie-consent.js`:

```js
const COOKIE_KEY = 'bj_cookie_consent';

export function initCookieConsent() {
  if (localStorage.getItem(COOKIE_KEY)) return;
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  banner.hidden = false;

  document.getElementById('cookie-accept').addEventListener('click', () => {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    banner.hidden = true;
    import('./analytics.js').then(m => m.initAnalytics?.());
  });
  document.getElementById('cookie-decline').addEventListener('click', () => {
    localStorage.setItem(COOKIE_KEY, 'declined');
    banner.hidden = true;
  });
}
```

### 1.6 Vite — Minificación CSS/JS
**Estado:** ✅ Completado

En `vite.config.js` añadir opciones de build:

```js
build: {
  cssMinify: true,
  minify: 'terser',
  terserOptions: {
    compress: { drop_console: true, drop_debugger: true }
  }
}
```

---

## FASE 2 — MEDIANO PLAZO (Semanas 4–8): Experiencia Premium y Conversión

### 2.1 Sistema de Checkout Funcional
**Estado:** ✅ Completado (Wompi — procesador colombiano, alternativa a Stripe)

**Arquitectura:** Firebase Functions como backend serverless + Stripe Checkout hosted.

```js
// functions/index.js — Firebase Cloud Function
const functions = require('firebase-functions');
const stripe = require('stripe')(functions.config().stripe.secret);

exports.createCheckoutSession = functions.https.onRequest(async (req, res) => {
  const { items } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: items.map(item => ({
      price_data: {
        currency: 'cop',
        product_data: { name: item.nombre, images: [item.imagen] },
        unit_amount: item.precio * 100,
      },
      quantity: item.cantidad,
    })),
    mode: 'payment',
    success_url: 'https://bersagliojewelry.co/gracias.html?session_id={CHECKOUT_SESSION_ID}',
    cancel_url:  'https://bersagliojewelry.co/carrito.html',
    locale: 'es',
  });

  res.json({ sessionId: session.id });
});
```

```js
// js/checkout.js — Frontend
import { loadStripe } from '@stripe/stripe-js';
const stripe = await loadStripe('pk_live_TU_CLAVE_PUBLICA');

export async function iniciarCheckout(items) {
  const { sessionId } = await fetch('https://us-central1-TU-PROYECTO.cloudfunctions.net/createCheckoutSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  }).then(r => r.json());

  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) console.error(error.message);
}
```

### 2.2 Sitemap dinámico con productos
**Estado:** ✅ Completado

Actualizar `public/sitemap.xml` para incluir cada pieza. Generar en build con Vite plugin:

```js
// vite.config.js — plugin adicional
{
  name: 'generate-sitemap',
  closeBundle() {
    // Leer catálogo y generar URLs para cada pieza
    // Escribir sitemap.xml actualizado
  }
}
```

### 2.3 Micro-interacciones y animaciones premium
**Estado:** ✅ Completado (tilt.js + micro.js con flyToCart/flyToWishlist)

Efecto tilt 3D en tarjetas de colección:

```js
// js/effects/tilt3d.js
export function initTilt(selector = '.collection-card') {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', ({ offsetX, offsetY, currentTarget: el }) => {
      const { offsetWidth: w, offsetHeight: h } = el;
      const x = ((offsetX / w) - 0.5) * 16;
      const y = ((offsetY / h) - 0.5) * -16;
      el.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) scale3d(1.03,1.03,1.03)`;
    });
    card.addEventListener('mouseleave', el =>
      el.currentTarget.style.transform = '');
  });
}
```

### 2.4 Lazy loading universal en catálogo
**Estado:** ✅ Completado (IntersectionObserver en renderer.js)

Asegurar que toda imagen del catálogo tenga `loading="lazy"` y `decoding="async"`.

### 2.5 Email Capture + Marketing
**Estado:** ✅ Completado (modal exit intent + timer 45s, localStorage)

Popup de captura de email con exit intent y timer (45s).

---

## FASE 3 — LARGO PLAZO (Semanas 9–20): Liderazgo Global

### 3.1 Migración a Firebase Hosting + CDN de Imágenes
**Estado:** ⚙️ Configurado (firebase.json + .firebaserc listos, pendiente deploy con plan Blaze)

**Por qué Firebase:** Es gratis (plan Spark), tiene CDN global incluido, y soporta Functions para el checkout.

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Inicializar proyecto
firebase init hosting
# → Public directory: dist
# → Single-page app: No
# → Automatic builds: Yes (GitHub Actions)

firebase init functions
# → Para el checkout de Stripe
```

`firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|png|gif|webp|avif|svg)",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
      }
    ],
    "rewrites": []
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs20"
  }
}
```

### 3.2 Visualizador 3D de Piezas (Model Viewer / Three.js)
**Estado:** ⬜ Pendiente

```html
<!-- pieza.html — sección de visualización 3D -->
<script type="module"
  src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js">
</script>

<model-viewer
  id="pieza-3d"
  src="models/anillo-esmeralda-001.glb"
  ios-src="models/anillo-esmeralda-001.usdz"
  alt="Anillo con esmeralda colombiana — vista 3D interactiva"
  auto-rotate
  camera-controls
  ar
  ar-modes="webxr scene-viewer quick-look"
  shadow-intensity="1"
  environment-image="neutral"
  exposure="0.95"
  style="width:100%; height:500px; background:#141414; border-radius:12px;"
>
  <button slot="ar-button" class="btn-ar">Ver en tu mano (RA)</button>
</model-viewer>
```

### 3.3 Recomendaciones Personalizadas (IA local)
**Estado:** ✅ Completado (js/recommendations.js con scoring colaborativo)

Algoritmo collaborative-filtering ligero basado en localStorage.

```js
// js/recommendations.js
export function getRecommendations(currentPiezaId, catalog, limit = 4) {
  const history = JSON.parse(localStorage.getItem('bj_viewed') ?? '[]');
  const current = catalog.find(p => p.id === currentPiezaId);
  if (!current) return [];

  return catalog
    .filter(p => p.id !== currentPiezaId)
    .map(p => ({
      ...p,
      score:
        (p.coleccion === current.coleccion ? 3 : 0) +
        (p.material === current.material   ? 2 : 0) +
        (Math.abs(p.precio - current.precio) / current.precio < 0.3 ? 2 : 0) +
        (history.includes(p.id) ? 1 : 0)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
```

### 3.4 Email Marketing (Klaviyo / Mailchimp)
**Estado:** ⬜ Pendiente

Flujos automatizados:
1. **Welcome Series** (3 emails / 7 días) → historia de la marca
2. **Wishlist Abandon** → recordatorio a las 24h y 72h
3. **Post-compra** → cuidado de la joya + invitación a reseña
4. **Aniversario** → oferta exclusiva

### 3.5 Sistema de Reseñas + AggregateRating Schema
**Estado:** ⬜ Pendiente

```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.9",
  "bestRating": "5",
  "ratingCount": "47"
}
```
→ Genera estrellas doradas en Google — CTR +15–30%

### 3.6 PWA Avanzada + Web Push Notifications
**Estado:** ⚙️ Parcial (PWA + Service Worker v2 completados, Web Push/FCM pendiente plan Blaze)

Usar Firebase Cloud Messaging (FCM) para notificaciones push.

---

## MÉTRICAS OBJETIVO FINAL

| Métrica | Actual (estimado) | Objetivo Fase 3 |
|---|---|---|
| LCP | ~8–12 s (banner 5.5 MB) | < 1.5 s |
| FID / INP | ~50 ms | < 20 ms |
| CLS | ~0.05 | < 0.05 |
| Lighthouse Performance | ~50–60 | 95+ |
| Lighthouse SEO | ~85 | 100 |
| Tiempo de carga 3G | ~20 s | < 4 s |

---

## RESUMEN: ORDEN DE IMPLEMENTACIÓN

```
═══════════════════════════════════════════════════════════════
  FASE 1 — FUNDACIÓN (Semanas 1-3)                    ██████████ 100%
═══════════════════════════════════════════════════════════════
SEMANA 1   ✅ Imágenes WebP + eliminar duplicados       → LCP -70%
SEMANA 1   ✅ CSS: limpiar scroll-bounce duplicados
SEMANA 1   ✅ Skip link + alt logos                      → accesibilidad
SEMANA 2   ✅ Cookie consent propio                      → GDPR compliant
SEMANA 2   ✅ Lazy loading universal                     → FID mejora
SEMANA 3   ✅ Vite minificación CSS+JS activa            → bundle -40%

═══════════════════════════════════════════════════════════════
  FASE 2 — EXPERIENCIA PREMIUM (Semanas 4-8)          █████████░ 90%
═══════════════════════════════════════════════════════════════
SEMANA 4   ✅ Checkout funcional con Wompi               → conversión activa
SEMANA 5   ✅ Sitemap dinámico con productos
SEMANA 6   ✅ Tilt 3D cards + micro-interacciones
SEMANA 7   ✅ Email capture + marketing (exit intent)
SEMANA 8   ✅ Sistema de recomendaciones IA local        → js/recommendations.js
SEMANA 8   ✅ OG Image meta tags dinámicos               → homepage + páginas de producto
SEMANA 8   ✅ Collection panel hover enhancements
SEMANA 8   ✅ Cart page UX + Wompi checkout
SEMANA 8   ✅ PWA: Service Worker v2 + WebP cache
SEMANA 8   ✅ Product Schema JSON-LD centralizado        → fix Google Search Console mar-2026

═══════════════════════════════════════════════════════════════
  FASE 3 — LIDERAZGO GLOBAL (Semanas 9-20)            ███░░░░░░░ 30%
═══════════════════════════════════════════════════════════════
SEMANA 9   ⚙️ Firebase Hosting configurado               → pendiente plan Blaze para deploy
SEMANA 10  ⬜ Migrar hosting + CDN imágenes              (requiere Firebase Blaze)
SEMANA 12  ⬜ Visualizador 3D / AR primeras 3 piezas     (requiere modelos .glb)
SEMANA 14  ⬜ Klaviyo/Mailchimp integración email        (requiere cuenta proveedor)
SEMANA 16  ⬜ Sistema de reseñas + AggregateRating       (requiere backend Firestore)
SEMANA 20  ⬜ Web Push con FCM                           (requiere Firebase Blaze)
```

---

## CHECKLIST: CUANDO SE ACTIVE FIREBASE BLAZE

> Guardar esta sección como referencia. Una vez activado el plan Blaze, ejecutar en orden:

### Paso 1 — Deploy Firebase Hosting (reemplaza GitHub Pages)
```bash
npm run build                     # Generar dist/
firebase deploy --only hosting    # Desplegar a CDN global
```
- Configurar dominio personalizado `bersagliojewelry.co` en Firebase Console > Hosting
- Verificar headers de cache (ya configurados en firebase.json)
- Apuntar DNS del dominio a Firebase (CNAME o A records que te dará la consola)

### Paso 2 — Firestore: Sistema de Reseñas
```bash
firebase init firestore
```
- Crear colección `reviews` en Firestore con reglas de seguridad
- Implementar formulario de reseña en `pieza.html` (post-compra)
- Calcular AggregateRating dinámico y añadirlo al Product Schema
- **Impacto SEO:** estrellas doradas en Google → CTR +15–30%

### Paso 3 — Cloud Functions
```bash
firebase init functions
firebase deploy --only functions
```
- Migrar lógica de checkout a Cloud Function si se necesita backend para Wompi webhooks
- Función para enviar emails transaccionales (confirmación de compra, reseñas)
- Función para generar sitemap dinámico automáticamente

### Paso 4 — Firebase Cloud Messaging (Web Push)
- Registrar vapidKey en Firebase Console > Cloud Messaging
- Implementar suscripción a push en `js/pwa.js`
- Añadir handler `push` en Service Worker
- Flujos de notificación: nuevas piezas, ofertas, recordatorio wishlist

### Paso 5 — Firebase Analytics (reemplaza GA4)
- Migrar de Google Analytics a Firebase Analytics
- Configurar eventos personalizados: view_item, add_to_cart, begin_checkout
- Dashboard en Firebase Console con métricas de conversión

---

## STACK TÉCNICO

| Componente | Actual | Objetivo (con Blaze) |
|---|---|---|
| Hosting | GitHub Pages | Firebase Hosting (CDN global) |
| Functions | Ninguno | Firebase Cloud Functions |
| Database | localStorage | Firestore (reseñas, pedidos) |
| Imágenes | WebP optimizado | WebP/AVIF + Firebase CDN cache |
| Analytics | GA4 (con consent) | Firebase Analytics |
| Pagos | Wompi (checkout hosted) | Wompi + Cloud Function webhooks |
| Push | Ninguno | Firebase Cloud Messaging |
| Build | Vite 6 + Terser | Vite 6 + Terser + LightningCSS |
| 3D | Ninguno | Model Viewer (Google) |
| Email | localStorage capture | Klaviyo/Mailchimp API |

---

## NOTAS IMPORTANTES

1. **Product Schema** centralizado en `js/utils/schema.js` — genera JSON-LD válido con `offers` para todas las páginas (homepage, catálogo, detalle). Corregido en mar-2026 tras alerta de Google Search Console.
2. **BreadcrumbList Schema** implementado en `js/pieza.js`.
3. **Design Tokens CSS** ya existen en `:root` — se usarán como base, solo falta refactorizar hardcodes.
4. **Firebase** configurado (firebase.json + .firebaserc). Actualmente en plan Spark; migrar a Blaze para Functions y FCM.
5. **Checkout** implementado con Wompi (procesador colombiano) en lugar de Stripe — más adaptado al mercado local.
6. Cada fase se implementa y se testea antes de pasar a la siguiente.

---

## HISTORIAL DE CAMBIOS

| Fecha | Cambio |
|---|---|
| 2026-03-19 | Plan maestro creado |
| 2026-03-24 | Fix Product Schema: Google Search Console reportó "must specify offers/review/aggregateRating" en 6 productos. Creado `js/utils/schema.js` centralizado. |
| 2026-03-24 | Añadido og:image dinámico en páginas de producto |
| 2026-03-24 | Auditoría completa: actualizado estados reales de todas las fases |
