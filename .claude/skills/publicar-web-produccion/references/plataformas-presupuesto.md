# Plataformas, tipos de sitio y presupuesto (detalle)

Guía de detalle de la sección estrella. Responde a **dónde publicar** según dos ejes: el
**caso de uso** (qué tipo de sitio es) y el **presupuesto** (cuánto puedes o quieres gastar).
Principio rector: **no pagues por lo que no necesitas, y paga solo cuando el riesgo o el
negocio lo justifican.**

> **Cómo leer las cifras:** los datos marcados como verificados llevan fecha (ver *Fuentes*
> al final). Los precios de SaaS cambian seguido; cualquier cifra sin confirmar va marcada
> **(verificar)**. Antes de prometer un número a un cliente, reconfírmalo en la web oficial.
> Los rangos de dominio (~10–12 USD/año) son **estimados**: verifícalos en el registrador.

---

## 1. Adaptación por TIPO DE SITIO

El checklist base (performance, SEO, seguridad, UX) **siempre aplica**. Lo que cambia es el
peso de cada frente, el GO/NO-GO y qué plataforma encaja. Cuatro arquetipos:

### A. Estático / escaparate (portafolio, catálogo sin pagos, landing, brochure)
Solo HTML/CSS/JS. Sin backend ni base de datos en producción.
- **Cambia:** la seguridad de servidor casi no aplica (no hay `.env`, BD ni API keys en
  producción) → **superficie de ataque mínima**, decláralo como fortaleza. El foco real es
  **performance + SEO + cabeceras vía CDN**.
- **Riesgo principal:** secretos en el historial de git, `canonical`/sitemap con dominio
  placeholder, e imágenes pesadas.
- **GO/NO-GO:** GO casi siempre si SEO y enlaces están verdes. NO-GO solo por canonical/
  sitemap con placeholder, OG roto, o imágenes sin optimizar (LCP).
- **Plataforma natural:** GitHub Pages, Cloudflare Pages, Netlify, Vercel (todos en free).
- **Gotchas de GitHub Pages (patrón muy común):**
  - **Preserva el archivo `CNAME`** entre despliegues. Si publicas con una GitHub Action o
    borras/regeneras la rama de salida, el `CNAME` (que fija tu dominio propio) se pierde y
    el dominio deja de resolver. Inclúyelo en la carpeta publicada o usa la opción del action
    que lo conserva.
  - Añade un archivo **`.nojekyll`** en la raíz si tienes carpetas/archivos que empiezan por
    `_` (Jekyll los ignora por defecto).

### B. SPA (React/Vue/Angular, app de una sola página, sin servidor propio)
JS en el cliente que consume APIs de terceros. Sigue siendo desplegable como estático.
- **Cambia:** añade **fallback de rutas** (todas → `index.html`) o tendrás **404 al recargar**
  rutas profundas. Cuida el **tamaño del bundle** (code-splitting, lazy, mide INP). Las
  **API keys de cliente** son públicas por diseño → restríngelas por origen/dominio en el
  panel del proveedor (no las trates como secretas).
- **Riesgo principal:** contenido crítico no indexable (si es CSR puro → usa SSG/prerender),
  bundle gigante (mala LCP/INP) y claves de cliente sin restringir.
- **GO/NO-GO:** NO-GO si el contenido crítico no es indexable o si recargar una ruta profunda
  da 404. Reensaya navegación directa por URL antes de publicar.
- **Fallback de rutas por plataforma:**
  - **Netlify:** archivo `_redirects` con `/* /index.html 200`.
  - **Vercel:** `rewrites` en `vercel.json` apuntando todo a `/index.html`.
  - **Cloudflare Pages:** sirve `index.html` para rutas no encontradas (SPA) o usa `_redirects`.
  - **GitHub Pages:** no hay rewrite de servidor; el truco es **copiar `index.html` a
    `404.html`** para que el enrutado del cliente capture las rutas profundas.

### C. E-commerce (catálogo + pagos)
Hay **dinero y datos de cliente** de por medio. Dos sub-modelos:
- **C1. Catálogo estático + pago externo:** el sitio es estático y delega el carrito/cobro a
  un servicio (links de pago, widget de carrito). Coste casi nulo, sin PCI propio.
- **C2. Tienda gestionada:** plataforma todo-en-uno (catálogo, carrito, pagos, inventario).
  Cuesta mensualidad, pero te quita encima el cumplimiento PCI, fraude y operación.
- **Cambia:** **pagos = PCI-DSS**. Nunca proceses tarjetas tú mismo; usa un proveedor que
  tokenice (Stripe/PayPal/Mercado Pago/Square). En el cliente solo va la **clave publicable**
  (`pk_…`); la **secreta** (`sk_live_…`) y los secretos de webhook **jamás** en el front.
  Prueba el **flujo de compra real** en producción (pago de prueba/sandbox). Cabeceras
  estrictas + HTTPS forzado obligatorios.
- **Riesgo principal:** clave secreta en el front, manejar tarjetas sin PCI, checkout no
  probado en producción, y precios/stock desincronizados.
- **GO/NO-GO:** NO-GO si hay clave secreta en el front, si el checkout no se probó en
  producción, o si no hay HTTPS forzado.
- **⚠️ GitHub Pages NO sirve para esto.** Sus términos **prohíben** el uso para e-commerce/
  transacciones comerciales primarias y para enviar tarjetas/contraseñas (ver §2 Tier 0).
  Para tienda con pagos $0 usa **Cloudflare Pages o Netlify**, no GitHub Pages.

### D. App con backend (servidor, BD, autenticación, lógica de negocio)
- **Cambia:** aplica **TODO** el frente de seguridad de servidor: gestión de secretos del
  lado servidor (`.env` en gitignore desde el primer commit, entornos dev/staging/prod
  separados), CORS estricto, rate limiting, validación de entrada, auth/sesiones seguras,
  dependencias sin CVEs, backups de BD, y **observabilidad** (sin logs/errores no sabes si
  está caído). El backend es la superficie real de ataque.
- **Riesgo principal:** secretos del servidor expuestos, sin rollback de BD (migraciones no
  reversibles), sin monitoreo (te enteras del caído por un cliente, no por una alerta).
- **GO/NO-GO:** NO-GO si hay secretos expuestos en repo/historial, sin rollback de BD, o sin
  observabilidad mínima.
- **Plataforma natural:** funciones/servidor (Cloudflare Workers, Netlify/Vercel Functions)
  en bajo volumen; hosting/PaaS gestionado al crecer.

### Tabla resumen (peso de cada frente por tipo)
| Frente | Estático | SPA | E-commerce | Backend |
|---|---|---|---|---|
| Performance | Alto | Crítico (JS/INP) | Alto | Medio |
| SEO técnico | Crítico | Crítico (render) | Alto | Variable |
| Seguridad | Bajo (fortaleza) | Bajo–Medio | Crítico (pagos) | Crítico (servidor) |
| UX / checkout | Medio | Medio (rutas) | Crítico (compra) | Alto |
| Rollback | Commit/redeploy | Commit/redeploy | + estado de pedidos | + datos/migraciones |

---

## 2. TIERS DE PRESUPUESTO

### Tier 0 — $0 / sin presupuesto

Objetivo: publicar gratis, con HTTPS, sin tarjeta de crédito. Ideal para escaparates,
portafolios, SPAs y demos.

| Plataforma | Para qué brilla | Límites free (verificados) | HTTPS / dominio | Uso comercial en free |
|---|---|---|---|---|
| **GitHub Pages** | Estáticos desde un repo **público**; lo más simple si ya usas git | Sitio ≤ 1 GB, ~100 GB/mes banda (suave), 10 builds/hora (suave). Repos **privados** requieren plan de pago | HTTPS gratis y forzable; dominio propio gratis | **NO** (prohíbe e-commerce/negocio) |
| **Cloudflare Pages** | Estático y SPA con **CDN global** y **banda sin límite**; el más generoso para tráfico alto | **Banda sin límite** en todos los planes; 500 builds/mes en free; hasta 20.000 archivos por sitio | HTTPS y dominio propio incluidos, SSL automático; cabeceras propias vía `_headers` | **Sí** |
| **Netlify** | Estático/SPA con buen DX, formularios y funciones; modelo por **créditos** | Plan free con **300 créditos/mes** (banda 20 créditos/GB ≈ **~15 GB** *(aprox., el modelo de créditos varía; reconfirmar)*; cuentas antiguas conservan 100 GB) | HTTPS y dominio propio; cabeceras propias vía `_headers` | **Sí** |
| **Vercel (Hobby)** | Mejor para Next.js/SPA con funciones; DX excelente | **100 GB** transferencia, 1 M invocaciones, 4 CPU-hrs, 100 MB subida estática | HTTPS y dominio propio; cabeceras vía `vercel.json` | **NO** (solo personal/no comercial) |

**Avisos críticos del Tier 0 (ambos verificados):**
- **⚠️ GitHub Pages PROHÍBE el uso comercial.** Sus límites oficiales dicen, textual: *"GitHub
  Pages is not intended for or allowed to be used as a free web-hosting service to run your
  online business, e-commerce site, or any other website that is primarily directed at either
  facilitating commercial transactions or providing commercial software as a service (SaaS)"*
  y *"GitHub Pages sites shouldn't be used for sensitive transactions like sending passwords
  or credit card numbers"*. → **Para tienda con pagos $0 usa Cloudflare Pages o Netlify, NO
  GitHub Pages.** GitHub Pages es excelente para escaparate/portafolio/catálogo **sin pagos**.
- **⚠️ Vercel Hobby = solo NO comercial.** Su definición oficial de uso comercial incluye
  *"recibir pago por crear, actualizar u hospedar el sitio"*, publicidad/ventas, *afiliados
  como propósito principal*, anuncios (p. ej. AdSense) y **hasta pedir donaciones**. Esto
  muerde al consultor: **si cobras a un cliente por construir o alojar su escaparate, ese
  despliegue ya es comercial aunque el sitio no venda online → no puede ir en Hobby.** Usa
  Cloudflare Pages/Netlify free, o el plan Pro de Vercel.
- **GitHub Pages** solo es $0 con repo **público**. Si el código debe ser privado: o pagas
  GitHub Pro/Team, o publicas en Cloudflare/Netlify (que despliegan desde repo privado en free),
  o publicas **solo la carpeta de salida** en un repo público aparte (sin el fuente sensible).
- **Netlify** cambió a modelo de créditos: un pico de tráfico puede agotar los 300 créditos
  antes de lo esperado. Para tráfico alto e impredecible, **Cloudflare Pages** (banda sin
  límite) es lo más predecible.
- **Dominio $0:** lanza con el **subdominio gratuito** de la plataforma (`usuario.github.io`,
  `proyecto.pages.dev`, `proyecto.netlify.app`, `proyecto.vercel.app`). Válido para demos;
  para marca/negocio, pasa a dominio propio (Tier 1).

#### E-commerce en Tier 0 (bajo/nulo costo)
- **Links de pago** (Stripe Payment Links, PayPal, Mercado Pago, Square): generas un enlace o
  botón de cobro y lo pegas en tu sitio estático. **Sin mensualidad**; solo pagas la comisión
  por transacción del proveedor. Ideal para catálogo pequeño o "comprar ahora".
- **Snipcart** permite un carrito propio sobre tu estático sin cuota fija (cobra por
  transacción + comisión de la pasarela) **(verificar tier/comisión actuales)**.
- **Square Online** ofrece un plan gratuito de tienda (con su marca/anuncios) **(verificar
  límites y comisión)**.
- Recuerda: el **hosting** del estático debe ser **Cloudflare Pages o Netlify** (no GitHub
  Pages) si el sitio facilita transacciones comerciales. El proveedor de pago tokeniza y asume
  el PCI; tú no procesas tarjetas.

---

### Tier 1 — Bajo costo (dominio propio + planes free)

Objetivo: imagen profesional con **dominio propio** y correo, manteniendo el hosting en free.
El gasto típico es **solo el dominio**.

| Concepto | Opción recomendada | Costo (estimado / a verificar) |
|---|---|---|
| **Dominio .com** | **Cloudflare Registrar** (precio **a costo**, sin markup ni cuota sorpresa; igual en alta y renovación) | ~**10–11 USD/año** .com *(a costo; verificar en oficial)* |
| **Dominio .com (alt.)** | **Porkbun** (precio plano, sin subida al renovar; WHOIS y SSL gratis) | ~**11–12 USD/año** .com *(verificar)* |
| **Dominio (amplia variedad de TLD)** | **Namecheap** u otro registrador | varía por TLD **(verificar)** |
| **Hosting** | El mismo free del Tier 0 + dominio propio | $0 |
| **Correo profesional básico** | Reenvío de correo (Cloudflare Email Routing es gratis) o buzón económico | gratis–pocos USD/mes **(verificar)** |

**Notas del Tier 1:**
- El **principio verificado** sigue en pie aunque la cifra exacta envejezca: **Cloudflare
  Registrar vende a costo (sin markup)** y **Porkbun no sube el precio en la renovación**
  (sin "trampa de renovación"). El número de USD baila por aumentos de ICANN/Verisign:
  reconfírmalo. Cloudflare Registrar solo registra dominios cuyo DNS ya gestionas en Cloudflare.
- El salto de Tier 0 a Tier 1 suele ser **solo el dominio**: el hosting puede seguir gratis.
  El dominio propio mejora marca, confianza, SEO y deliverability del correo.
- **Correo:** para recibir en `hola@tudominio.com` sin pagar buzón, usa **reenvío** (gratis en
  Cloudflare Email Routing). Para *enviar* desde tu dominio con buena entregabilidad, un buzón
  gestionado o un servicio de envío transaccional **(verificar plan/precio)**.

#### Conectar dominio propio + HTTPS, por plataforma
- **GitHub Pages:** *Settings → Pages → Custom domain*; crea un `CNAME` (subdominio `www` →
  `usuario.github.io`) o registros `A`/`AAAA` (ápex) a las IPs de GitHub Pages. **Verifica el
  dominio** (anti-takeover). Marca **Enforce HTTPS** (puede tardar hasta 24 h; el certificado
  es automático). Recuerda **preservar el `CNAME`** entre despliegues (ver §1.A).
- **Cloudflare Pages:** *Custom domains → Set up a domain*; si el DNS ya está en Cloudflare, el
  registro y el SSL se configuran casi solos.
- **Netlify:** *Domain management → Add a domain*; apunta tu DNS o delega los *nameservers* a
  Netlify DNS. Certificado Let's Encrypt automático; activa el redirect a HTTPS.
- **Vercel:** *Project → Settings → Domains → Add*; añade el `CNAME`/`A` indicado. HTTPS
  automático. (Recuerda: si el sitio o su despliegue es comercial, Hobby no aplica.)

> **HTTPS en todas:** las cuatro emiten certificado gratis y forzable. **Nunca** publiques un
> sitio de negocio en `http` sin redirección a `https`.

---

### Tier 2 — Con presupuesto para invertir

Objetivo: pagar **donde el riesgo o el negocio lo justifican**: una tienda real, tráfico
crítico, datos sensibles, o necesidad de SLA/soporte/observabilidad. Paga por caso, no por moda.

| Necesidad | Opción de pago | Cuándo **sí** vale | Cuándo **NO** vale (quédate en free) |
|---|---|---|---|
| **Tienda real (catálogo + pagos + inventario)** | E-commerce gestionado (p. ej. Shopify Basic ~**$39/mes**, anual más barato; **(verificar)**) | Vendes en serio; quieres dejar de operar PCI/fraude/stock a mano; varios productos | Catálogo de pocos ítems o ventas esporádicas → links de pago en estático |
| **Carrito en estático sin migrar de plataforma** | Widget de carrito (p. ej. Snipcart ~**$20/mes mín. + ~2%/transacción**; **(verificar)**) | Quieres carrito propio en tu estático sin moverte a Shopify | Pocas ventas → links de pago directos salen más baratos |
| **CDN/seguridad gestionada (WAF, reglas)** | Cloudflare **Pro** (~**$20/mes anual** o **$25/mes** mensual; **(verificar)**) | Tráfico/abuso real; necesitas el ruleset WAF gestionado | Sitio pequeño: el **free** de Cloudflare ya da CDN, SSL y DNS suficientes |
| **Observabilidad (errores en producción)** | Sentry (free hasta ~**5.000 errores/mes**; de pago desde ~**$26/mes** Team; **(verificar)**) | App con backend o SPA con usuarios reales: necesitas saber qué se rompe y para quién | Sitio estático sin lógica: el free basta o ni lo necesitas |
| **Hosting/funciones a escala** | Vercel Pro (~**$20/usuario-mes**; **(verificar)**) / Netlify de pago / Cloudflare de pago | Proyecto comercial (Hobby es no comercial), tráfico alto, equipo | Demo o proyecto personal sin ingresos → el free correspondiente alcanza |

**Criterio para subir a Tier 2:**
- **Paga cuando:** hay **ingresos** que dependen del sitio (downtime = dinero perdido);
  manejas **datos sensibles** o pagos a escala; necesitas **SLA/soporte**; el tráfico o el
  abuso superan lo que el free aguanta; o necesitas **WAF/observabilidad** porque ya tienes
  usuarios reales y superficie de ataque.
- **NO pagues cuando:** es un portafolio/escaparate/demo; el tráfico cabe holgado en el free;
  no hay backend ni pagos propios; o pagas "por si acaso" sin una métrica que lo justifique.
  El **free moderno cubre la mayoría de escaparates indefinidamente.**
- **Regla de oro:** **empieza en el tier más bajo que cumpla el caso, y sube solo cuando una
  métrica concreta (banda, errores, ventas, riesgo) lo pida.** Bajar de tier después es fácil;
  recuperar meses de sobrepago, no.

---

## 3. Tabla maestra: caso de uso × presupuesto

| Caso de uso \ Presupuesto | **$0** | **Bajo costo** | **Con inversión** |
|---|---|---|---|
| **Portafolio / escaparate** | GitHub Pages o Cloudflare Pages, subdominio gratis | + dominio propio (Cloudflare Registrar / Porkbun) | Rara vez. Cloudflare Pro solo si hay abuso/tráfico real |
| **Catálogo (sin pagos en el sitio)** | Estático (GitHub/Cloudflare/Netlify) + links de pago | + dominio propio + correo de reenvío | Cloudflare Pro (WAF/CDN) si el tráfico lo pide |
| **Tienda con pagos** | Estático en **Cloudflare/Netlify** + links de pago — **sin mensualidad** (**NO GitHub Pages**: prohíbe e-commerce) | Mismo + dominio propio (más confianza en checkout) | E-commerce gestionado (Shopify) o carrito (Snipcart) **(verificar)** |
| **SPA / app cliente** | Cloudflare Pages / Netlify / Vercel free (Hobby solo si NO comercial) | + dominio propio | Vercel/Netlify de pago si es comercial o de alto tráfico; + Sentry |
| **App con backend** | Funciones en free (Workers/Functions) en bajo volumen | + dominio propio | Hosting/PaaS gestionado + observabilidad (Sentry) + WAF; SLA/soporte |

**Por qué (resumen de criterio):**
- **Escaparate → casi siempre $0.** El hosting estático gratuito moderno (CDN + HTTPS) cubre el
  caso indefinidamente. Subir de tier no aporta valor salvo marca (dominio) o abuso (WAF).
- **Tienda → el presupuesto define el modelo, no al revés.** Pocas ventas: links de pago en
  estático ($0 fijo, en Cloudflare/Netlify). Negocio en serio: gestionado (te quita PCI/operación).
- **App con backend → casi siempre acaba en Tier 2** porque introduce superficie de ataque,
  estado que respaldar y necesidad de observabilidad; el free sirve para arrancar/validar.

---

## 4. Repos sensibles: NUNCA publicar lo que no debe ser público

Elegir plataforma incluye decidir **qué NO se publica**:
- Un repositorio **privado/bóveda** (claves, datos personales, código propietario, respaldos)
  **jamás** debe hacerse público "para usar GitHub Pages gratis". Si necesitas Pages con código
  privado, paga el plan que lo permita o publica **solo** la carpeta de salida (`dist/`/`public/`)
  en un repo público aparte, sin el código fuente sensible.
- **Verifica la visibilidad real** del repo antes de tocar nada (no la asumas):
  `gh repo view OWNER/REPO --json visibility -q .visibility` → debe decir `PRIVATE` para repos
  sensibles. Si la respuesta a *"¿este repo está pensado para ser público?"* no es un sí rotundo
  → **déjalo privado (NO-GO)**.
- **Antes de hacer público cualquier repo:** revisa el **historial completo** (no solo el último
  commit) en busca de secretos; revisa **ramas, tags y forks** (una rama vieja o un fork puede
  seguir conteniendo lo que borraste). Si hubo un secreto, **rótalo y purga el historial**
  (`git filter-repo`/BFG) — borrarlo en un commit nuevo **no** basta.
- Si un repo sensible estuvo público aunque sea minutos: privatízalo, **rota todos los secretos**
  y, si hubo datos de terceros/menores, evalúa la obligación de notificación.

---

## Fuentes (verificadas, 2026-06)

- GitHub Pages — límites y **prohibición de uso comercial/e-commerce y de transacciones
  sensibles (tarjetas/contraseñas)**: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits — verificado 2026-06.
- GitHub Pages — disponibilidad por plan (público gratis; privado requiere plan de pago) y
  HTTPS: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages — verificado 2026-06.
- Cloudflare Pages — límites (builds, archivos) y banda sin límite:
  https://developers.cloudflare.com/pages/platform/limits — verificado 2026-06.
- Cloudflare — planes y precios (Free/Pro/Business): https://www.cloudflare.com/plans/ —
  verificado 2026-06.
- Cloudflare Registrar — precio a costo, sin markup: https://developers.cloudflare.com/registrar/
  — verificado 2026-06 (principio confirmado; la cifra exacta no la publica la web → estimada).
- Netlify — precios y modelo de créditos: https://www.netlify.com/pricing/ — verificado 2026-06
  (cifra ~15 GB derivada del modelo de créditos; aprox., reconfirmar).
- Vercel — límites de cuenta (Hobby 100 GB, 1 M invocaciones, 4 CPU-hrs, 100 MB subida):
  https://vercel.com/docs/limits — verificado 2026-06.
- Vercel — **Hobby es solo no comercial; uso comercial incluye cobrar por crear/hospedar el
  sitio, publicidad, afiliados y donaciones**: https://vercel.com/docs/limits/fair-use-guidelines
  — verificado 2026-06 (texto confirmado verbatim).
- Stripe Payment Links (pasarela gestionada sin backend): https://docs.stripe.com/payment-links
  — verificado 2026-06.
- Shopify — planes y precios: https://www.shopify.com/pricing — **(verificar)** (cifra ~$39/mes
  citada por terceros).
- Snipcart — precios: https://snipcart.com/pricing — **(verificar)**.
- Sentry — planes (free ~5.000 errores/mes; Team desde ~$26/mes): https://sentry.io/pricing/ —
  **(verificar)**.
- Porkbun — precios de dominios: https://porkbun.com/products/domains — **(verificar)** (cifra
  ~$11–12/año citada por terceros).
- Core Web Vitals (INP reemplazó a FID en marzo 2024; LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 al
  p75): https://web.dev/articles/vitals — verificado 2026-06.
