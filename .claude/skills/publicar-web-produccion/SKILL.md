---
name: publicar-web-produccion
description: >
  Guía GENÉRICA para decidir CUÁNDO, CÓMO y DÓNDE publicar cualquier web a producción de
  forma segura, rápida y bien indexada (sirve para cualquier repositorio o proyecto). Úsala
  cuando: (1) vas a desplegar o publicar un sitio web a producción; (2) preparas un repositorio
  para hacerlo público o decides si debe seguir privado; (3) revisas performance, SEO técnico,
  seguridad/secretos o UX antes de un lanzamiento; (4) necesitas decidir si es buen momento
  para publicar (criterio GO / NO-GO); (5) configuras hosting estático (GitHub Pages, Cloudflare
  Pages, Netlify, Vercel); (6) adaptas el checklist al TIPO de sitio (estático/escaparate, SPA,
  e-commerce, app con backend); (7) eliges PLATAFORMA según el PRESUPUESTO ($0, bajo costo, con
  inversión); (8) conectas un dominio propio y HTTPS; (9) montas pagos/e-commerce sin exponer
  claves; (10) manejas datos personales o de menores y APIs sensibles al origen (micrófono,
  cámara, geolocalización).
license: MIT
metadata:
  version: "2.1.0"
allowed-tools: Read Write Edit Glob Grep Bash WebFetch WebSearch
---

# Publicar una web a producción (checklist + go/no-go + plataforma)

Guía **genérica para cualquier repositorio/proyecto** que lleve un sitio web a producción **sin
que se rompa nada**, **eligiendo bien el momento** y **eligiendo bien la plataforma**. Cubre
cuatro frentes (performance, SEO técnico, seguridad/secretos, UX), el criterio de **GO / NO-GO**
que el checklist técnico no suele incluir, la **adaptación por tipo de sitio** (estático/
escaparate, SPA, e-commerce, app con backend) y la **elección de plataforma por presupuesto**
($0 / bajo costo / con inversión). Apunta siempre al **perfeccionamiento**: el free moderno bien
hecho suele bastar; paga solo cuando una métrica concreta lo pida.

> **Regla rectora:** el checklist dice QUÉ revisar; esta skill dice además CUÁNDO publicar y
> DÓNDE. Una web técnicamente perfecta publicada en mal momento (antes de un evento clave, con
> datos sensibles sin sanear, con una API sensible al origen sin reensayar) o en la plataforma
> equivocada (una tienda en un hosting que prohíbe e-commerce) es un fallo de release, no de código.

## Antes de empezar: entiende el sitio

Pregunta o verifica esto **antes** de generar configuración o recomendar plataforma:

- ¿Qué **tipo de sitio** es: estático/escaparate, SPA, e-commerce, o app con backend? Define el
  peso de cada frente y la plataforma (ver "Tipos de sitio").
- ¿Es **estático** (solo HTML/CSS/JS, sin backend) o tiene **servidor/BD/API**? Cambia toda la
  sección de seguridad.
- ¿El **repositorio** está pensado para ser **público**, o es privado/sensible (bóveda, claves,
  datos personales, código propietario)? Si es sensible → **no lo hagas público** (NO-GO #0).
- ¿Maneja **datos personales** (formularios, cuentas, fotos/audios de personas, **menores**)? Si
  sí → hay obligaciones legales antes de publicar.
- ¿Usa **APIs del navegador sensibles al origen** (micrófono `getUserMedia`, cámara, geolocalización,
  portapapeles, notificaciones)? Se comportan distinto en `https` que en `localhost`.
- ¿Hay un **evento/fecha crítica** (demo, jurado, lanzamiento) ligada a esta publicación?
- ¿Qué **presupuesto** hay ($0 / bajo costo / con inversión) y qué **hosting** se usará?

## Tipos de sitio (qué cambia en el checklist y en el GO/NO-GO)

| Tipo | Frente que MÁS pesa | Cambio clave en el GO/NO-GO |
|---|---|---|
| **Estático / escaparate** (catálogo sin pagos) | SEO + Performance | Superficie de ataque mínima: fortaleza. GO casi siempre si SEO y enlaces verdes. |
| **SPA** (sin backend propio) | Performance (JS/INP) + SEO (render) | NO-GO si contenido crítico no indexable o si recargar una ruta profunda da 404. |
| **E-commerce** (catálogo + pagos) | Seguridad/pagos + UX checkout | NO-GO si clave de pago secreta en cliente, sin HTTPS forzado, o checkout no probado en prod. |
| **App con backend** | Seguridad de servidor | NO-GO si secretos en repo/historial, sin rollback de BD, CVEs, o sin observabilidad. |

- **Estático:** WebP/AVIF, OG/preview, sitemap/robots, Search Console; en GitHub Pages solo CSP
  vía `<meta>`. **Gotcha:** preserva el archivo `CNAME` entre despliegues o el dominio propio deja
  de resolver.
- **SPA:** HTML indexable (o SSG/prerender); fallback de rutas (todas → `index.html`; en GitHub
  Pages copia `index.html` a `404.html`); mide INP; restringe las API keys de cliente por origen.
- **E-commerce:** **nunca** claves secretas en el front; usa checkout alojado (Stripe/PayPal/
  Mercado Pago/Square/Snipcart/Shopify); prueba la compra completa en prod (sandbox). **GitHub
  Pages prohíbe e-commerce** → usa Cloudflare Pages o Netlify.
- **Backend:** TODO el frente de seguridad de servidor + observabilidad + rollback de datos.

Detalle por tipo: ver [plataformas y presupuesto](references/plataformas-presupuesto.md).

## Proceso (checklist por frente)

### 1. Performance
- [ ] Imágenes en **WebP/AVIF** (no PNG/JPG pesados); usa `loading="lazy"` y `width`/`height` para
      evitar saltos de layout.
- [ ] **Minifica** JS y CSS (los frameworks lo hacen en el build; en sitios vanilla, recomendable).
- [ ] `font-display: swap` en `@font-face` (evita texto invisible; mejora CLS/LCP).
- [ ] Mide con **Lighthouse / PageSpeed Insights**; apunta a **90+**. Core Web Vitals objetivo:
      **LCP ≤ 2.5 s**, **INP ≤ 200 ms** (INP reemplazó a FID en marzo 2024), **CLS ≤ 0.1**.

### 2. SEO técnico
- [ ] **Favicon propio** (no el por defecto de Vite/Next/React).
- [ ] `<title>` y `<meta name="description">` reales y únicos por página.
- [ ] **Open Graph** y **Twitter Card** (preview en WhatsApp/redes), con `og:image` válida.
- [ ] **`<link rel="canonical">` con el dominio REAL** — nunca un placeholder (`*.local`,
      `ejemplo.com`). Si no hay dominio aún, no pongas canonical.
- [ ] **`robots.txt`** y **`sitemap.xml`** en la raíz (con URLs absolutas del dominio real).
- [ ] **JSON-LD** (datos estructurados; negocio local si aplica).
- [ ] Registra el sitio en **Google Search Console** tras publicar.

### 3. Seguridad y variables de entorno  → ver `## Seguridad` abajo

### 4. UX y verificación final
- [ ] **Página 404 personalizada** que devuelva al usuario al flujo (y, en SPA, fallback de rutas).
- [ ] Pasa un **detector de enlaces rotos** por todo el sitio.
- [ ] Prueba **formularios y checkout reales en producción** (que el webhook/BD/pago reciba de verdad).
- [ ] Prueba en **varios dispositivos y conexiones** (móvil, red lenta).
- [ ] Accesibilidad mínima: foco visible de teclado, contraste AA, `prefers-reduced-motion`.
- [ ] **Smoke test post-deploy**: abre el dominio real y recorre las rutas críticas.

Detalle, comandos y plantillas: ver [checklist detallado](references/checklist-detallado.md).

## Seguridad

> **Tres riesgos que hunden una publicación:** (1) **exponer un repo privado/sensible** que nunca
> debió ser público; (2) **fugar secretos** (una API key en el historial de git queda ahí para
> siempre, aunque la borres en un commit posterior); (3) **publicar datos personales** (sobre todo
> de **menores**) sin base legal. Los tres se evitan ANTES del primer push, no después.

- **NUNCA hagas público un repo privado/sensible** (bóveda, claves, datos personales, código
  propietario) para "ahorrar" en hosting. Verifica la visibilidad real, no la asumas:
  `gh repo view --json visibility -q .visibility`. Si necesitas Pages con código privado, publica
  **solo** la carpeta de salida en un repo aparte, o paga el plan que permita Pages privado.
- **NUNCA** subas `.env`, claves, tokens ni credenciales al repo. Añade `.env` (y respaldos/
  módulos sensibles) a `.gitignore` **antes** del primer commit.
- Si un secreto **ya** se commiteó: **rótalo de inmediato** (asume que está comprometido) y **purga
  el historial** con `git filter-repo` o BFG; borrarlo en un commit nuevo **no** basta. Revisa
  también ramas, tags y forks.
- **E-commerce:** en el cliente solo va la **clave publicable** (`pk_…`); la **secreta** (`sk_live_…`)
  y los secretos de webhook **jamás** en el front. Usa pasarela gestionada (página alojada/redirect/
  iframe) para que tu sitio nunca toque el dato de tarjeta (alcance PCI SAQ A).
- **Datos personales/de menores:** aviso de privacidad + base legal + consentimiento (de acudientes
  si son menores); minimiza los datos. Verifica la norma por **ubicación de los titulares**
  (Colombia: **Ley 1581 de 2012**; UE: **GDPR Art. 8**). En demos, usa datos ficticios/anonimizados.
- **HTTPS** siempre y **forzado** (redirige http→https). En hosting estático moderno es automático.
- **Cabeceras de seguridad** (cuando el hosting lo permita): `Content-Security-Policy`,
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (o `frame-ancestors` en CSP),
  `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security`.
  - **Netlify / Cloudflare Pages:** archivo `_headers`. **Vercel:** `headers` en `vercel.json`.
    **GitHub Pages:** no permite cabeceras HTTP personalizadas → solo CSP parcial vía
    `<meta http-equiv>`; para cabeceras estrictas pon Cloudflare delante.
- Audita con **Mozilla Observatory** (`developer.mozilla.org/observatory`) y apunta a A/A+.
- **Sitio estático = menor superficie de ataque** (sin `.env`, BD ni API keys en producción). Es
  una **fortaleza**, no una carencia: decláralo así.

Detalle (purga de historial, PCI, menores por región, cabeceras/CSP por hosting): ver
[checklist detallado](references/checklist-detallado.md).

## Cuándo publicar (GO / NO-GO)

Aplica este árbol **antes** de desplegar:

0. **¿Este repositorio es privado/sensible y NO está pensado para ser público?** → **NO-GO**. No
   cambies la visibilidad. Si necesitas publicar un sitio desde él, publica **solo el build** y
   mantén el código fuente privado.
1. **¿Hay datos personales o de menores** sin aviso de privacidad ni consentimiento? → **NO-GO**
   hasta sanear (aviso, consentimientos, normativa local — Colombia: **Ley 1581 de 2012**; Europa:
   GDPR; verifica la que aplique).
2. **¿Hay secretos en el repo o en el historial?** → **NO-GO** hasta rotar y purgar.
3. **¿Es e-commerce con una clave de pago secreta en el front, o un checkout sin probar en
   producción?** → **NO-GO** hasta mover la clave a backend y probar la compra completa en prod.
4. **¿El sitio usa APIs sensibles al origen** (micrófono, cámara, geolocalización) y solo se ha
   probado en `localhost`? → **Reensaya en `https`/staging primero.** El comportamiento de permisos
   cambia entre `localhost` y `https`; publicar sin reensayar puede romper la función en producción.
5. **¿Hay un evento/demo crítico inminente** que dependa del sitio? → **No publiques la noche antes.**
   Publica con margen para un smoke test y un rollback. Si el evento se hace en `localhost` y ya está
   ensayado allí, **presenta en local primero y publica después**.
6. **¿Tienes plan de rollback** (volver a la versión anterior en minutos; con backend, también de
   datos)? → Si no, prepáralo antes del GO.
7. Si nada de lo anterior bloquea y el checklist está verde → **GO**, seguido de smoke test en el
   dominio real.

Casos especiales y matices: ver [cuándo publicar](references/cuando-publicar.md).

## Elección de plataforma por presupuesto y caso de uso

La pregunta no es solo *cuándo* publicar, sino **dónde**. Decide con dos ejes: **caso de uso** (qué
tipo de sitio) × **presupuesto**. Principio rector: **empieza en el tier más bajo que cumpla el
caso; sube solo cuando una métrica concreta (banda, ventas, errores, riesgo) lo pida.** El hosting
estático gratuito moderno cubre la mayoría de escaparates **indefinidamente**.

### Los tres tiers
- **$0 / sin presupuesto:** **Cloudflare Pages** (banda sin límite, permite uso comercial),
  **Netlify** free, **GitHub Pages** (repo público, **solo escaparate/sin pagos**), **Vercel
  Hobby** (**solo NO comercial**). Subdominio gratuito de la plataforma. E-commerce de bajo/nulo
  costo: **links de pago** (Stripe/PayPal/Mercado Pago/Square) en un estático — sin mensualidad,
  solo comisión por venta. ⚠️ **GitHub Pages PROHÍBE el uso comercial/e-commerce y enviar tarjetas**
  → para tienda con pagos $0 usa Cloudflare Pages o Netlify, no GitHub Pages. ⚠️ **Vercel Hobby es
  solo no comercial**: *cobrar por construir/hospedar el sitio*, publicidad, afiliados o donaciones
  ya lo hacen comercial.
- **Bajo costo:** lo anterior **+ dominio propio**. **Cloudflare Registrar** vende a costo (sin
  markup; ~10–11 USD/año .com *(estimado, verificar)*) o **Porkbun** (precio plano; ~11–12 USD/año
  .com *(verificar)*). El hosting sigue gratis; el gasto típico es **solo el dominio**. Correo de
  recepción gratis con reenvío (Cloudflare Email Routing).
- **Con inversión:** paga **por caso, no por moda**. Tienda real → e-commerce gestionado (Shopify
  ~$39/mes *(verificar)*). Carrito en estático → Snipcart (~$20/mes mín. + ~2% *(verificar)*).
  CDN/seguridad → Cloudflare **Pro** (~$20–25/mes *(verificar)*) por el WAF gestionado.
  Observabilidad → Sentry (free ~5.000 errores/mes; Team ~$26/mes *(verificar)*).

### Tabla de decisión (caso de uso × presupuesto)

| Caso de uso \ Presupuesto | **$0** | **Bajo costo** | **Con inversión** |
|---|---|---|---|
| **Portafolio / escaparate** | GitHub/Cloudflare Pages, subdominio gratis | + dominio propio | Rara vez. Cloudflare Pro solo si hay abuso/tráfico real |
| **Catálogo (sin pagos en sitio)** | Estático + links de pago | + dominio + correo de reenvío | Cloudflare Pro (WAF/CDN) si el tráfico lo pide |
| **Tienda con pagos** | Estático en **Cloudflare/Netlify** + links de pago (sin mensualidad) — **NO GitHub Pages** | + dominio (más confianza en checkout) | E-commerce gestionado (Shopify) o carrito (Snipcart) *(verificar)* |
| **SPA / app cliente** | Cloudflare/Netlify free, o Vercel Hobby **solo si NO comercial** | + dominio propio | Vercel/Netlify de pago si es comercial o alto tráfico; + Sentry |
| **App con backend** | Funciones en free, bajo volumen | + dominio propio | Hosting/PaaS gestionado + Sentry + WAF + SLA |

**Cuándo NO pagar:** portafolio/escaparate/demo; el tráfico cabe holgado en el free; no hay backend
ni pagos propios; o pagarías "por si acaso" sin una métrica que lo justifique. Bajar de tier después
es fácil; recuperar meses de sobrepago, no.

### Conectar dominio propio + HTTPS (resumen por plataforma)
- **GitHub Pages:** *Settings → Pages → Custom domain*; `CNAME` (www→`usuario.github.io`) o `A`/
  `AAAA` (ápex) a IPs de GitHub; **verifica el dominio** (anti-takeover); **Enforce HTTPS** (hasta
  24 h). Recuerda **preservar el `CNAME`** entre despliegues.
- **Cloudflare Pages:** *Custom domains → Set up a domain*; si el DNS ya está en Cloudflare, SSL casi automático.
- **Netlify:** *Domain management → Add a domain*; apunta DNS o delega nameservers; cert Let's Encrypt + redirect HTTPS.
- **Vercel:** *Settings → Domains → Add*; añade el `CNAME`/`A` indicado; HTTPS automático (recuerda:
  Hobby es no comercial, incluso cobrar por hospedar el sitio).
> Las cuatro emiten certificado gratis y forzable. **Nunca** publiques un sitio de negocio en `http`
> sin redirección a `https`.

Detalle (límites verificados, e-commerce de bajo costo, correo, repos sensibles, fuentes con URL):
ver [plataformas y presupuesto](references/plataformas-presupuesto.md).

## Ground rules

- **ALWAYS** identifica el **tipo de sitio** y si el repo es **privado/sensible** antes de aplicar
  el checklist o recomendar plataforma.
- **ALWAYS** pregunta si el sitio es estático o con backend, y si maneja datos de menores, **antes**
  de generar configuración de seguridad o decidir el GO.
- **ALWAYS** usa el dominio real en `canonical`, `sitemap.xml` y Open Graph; nunca un placeholder.
- **ALWAYS** ten `.env` en `.gitignore` antes del primer commit y trata cualquier secreto commiteado
  como comprometido.
- **ALWAYS** empieza en el tier más bajo que cumpla el caso y sube solo cuando una métrica concreta
  (banda, ventas, errores, riesgo) lo justifique; no pagues "por si acaso".
- **ALWAYS** verifica precios/tiers y la **cláusula de uso comercial** en la web oficial antes de
  prometer "$0" o una cifra a un negocio; marca lo no confirmado como "verificar".
- **NEVER** hagas público un repo privado/bóveda (claves, datos personales, código propietario) para
  "ahorrar" en hosting; publica solo la carpeta de salida o paga el plan que permita Pages privado.
- **NEVER** uses **GitHub Pages** para una **tienda/e-commerce**: sus términos prohíben transacciones
  comerciales y enviar tarjetas/contraseñas → usa Cloudflare Pages o Netlify.
- **NEVER** uses **Vercel Hobby** para un sitio **comercial** (tienda, SaaS, blog monetizado, ads,
  afiliados, donaciones, o **cobrar por construir/hospedar** el sitio): su uso es solo no comercial.
- **NEVER** pongas claves de pago **secretas** (`sk_live`, secretos de webhook) en el front; solo la
  clave publicable.
- **NEVER** publiques con datos personales/de menores sin aviso de privacidad y consentimiento; usa
  datos ficticios en demos.
- **NEVER** publiques la noche anterior a un evento crítico sin margen para smoke test y rollback.
- **NEVER** confíes en "borré el secreto en otro commit": rota y purga el historial.
- **PREFER** Cloudflare Pages para estático/SPA con tráfico (banda sin límite, permite comercial).
- **PREFER** presentar/ensayar en `localhost` o `staging` antes de exponer a `https` una función
  sensible al origen.
- **PREFER** hosting estático cuando no haya backend: menos superficie de ataque, HTTPS gratis, menor costo.
- **PREFER** dominio propio a costo (Cloudflare Registrar / Porkbun) cuando el sitio es de marca o
  negocio; un subdominio gratuito basta para demos.

## Reference Files

- [Checklist detallado](references/checklist-detallado.md) — comandos y plantillas por frente (WebP,
  robots.txt, sitemap, purga de secretos, PCI/claves de pago, datos de menores por región, cabeceras
  de seguridad/CSP por hosting, fallback de rutas SPA, 404).
- [Cuándo publicar](references/cuando-publicar.md) — árbol de decisión ampliado (con NO-GO #0 de
  repos sensibles y nodo de e-commerce) y casos especiales (estático vs backend, APIs sensibles al
  origen, datos de menores, rollback, smoke test).
- [Plataformas y presupuesto](references/plataformas-presupuesto.md) — adaptación por tipo de sitio,
  los tres tiers con límites free verificados, tabla maestra caso × presupuesto, conexión de dominio/
  HTTPS por plataforma, e-commerce de bajo costo, repos sensibles y fuentes verificadas con URL.
