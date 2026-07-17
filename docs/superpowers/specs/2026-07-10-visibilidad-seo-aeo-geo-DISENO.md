# Visibilidad SEO/AEO/GEO — diagnóstico + plan masticado [OPUS-4.8]

> Auditoría del 2026-07-10 (Daniel pidió "top 1-3 de joyerías en Cartagena" + que las joyas se
> indexen y aparezcan como productos). Método: verificación en vivo (navegador integrado incógnito
> + extensión Chrome sobre GSC authuser=3) + **workflow de 6 agentes** (`w9930xxeu`, 47 findings,
> crudo en `tasks/w9930xxeu.output`). Norte: TODO-35 visibilidad. **Esta spec es la SSoT del plan.**

## 0. Los 2 problemas del dueño (verbatim)
1. Indexación pobre; las joyas NO aparecen como productos (tipo Mercado Libre con foto+precio);
   "inundar Google de más información"; reproyectar de **atelier de piezas únicas → joyería
   completa/ecommerce con inventario y entrega inmediata**.
2. "Joyerías en Cartagena" NO aparece ni en top 100 (Map Pack) pese a ficha 5.0/85 reseñas.

## 1. Diagnóstico REAL (verificado en vivo — corrige varias hipótesis)
- **GSC SÍ configurado** (propiedad URL-prefix `https://bersagliojewelry.co/` en **authuser=3**;
  yo miré authuser=0 al inicio → welcome vacío; Daniel corrigió). 55 clics orgánicos ya.
- **Sitemap SÍ enviado** (10 jul 2026, estado "Correcto", **37 páginas descubiertas**).
- **Solo 3 indexadas** · 2 "Excluida por noindex" (NO son piezas: `colecciones.html?col=argollas`
  rastreada 7-jun con el candado viejo — hoy ya es index en prod; y `entrada.html?e=oro-18k-vs-14k`
  del journal por query-param que sí tiene noindex). **Las 32 piezas = "Descubierta: actualmente
  sin indexar"** (en cola; el sitemap entró HOY, dominio nuevo indexa lento). **NO hay bug de bloqueo.**
- **NO es fallo técnico del sitio**: el SSG voltea noindex→index en prod (colecciones/journal/piezas
  = index,follow verificado); sitemap OK; schema JewelryStore con NAP+areaServed+openingHours;
  `sameAs` (IG/FB/TikTok) YA poblado en `tenant_config.json`. La base está bien construida.
- **Causa raíz de la no-indexación**: dominio nuevo + autoridad ~0 + títulos flojos (piezas de
  PRUEBA con title poético sin keyword → thin/duplicate). Se acelera con A1 (hecho) + Solicitar
  indexación + tiempo.
- **Causa raíz del no-ranking local**: PROMINENCIA baja — web nueva (3 indexadas), **IG 1.8k / FB
  90** vs competidores (Obelisco 172k, Golden Deluxe 57k, El Diamante 8.2k), sin citations en
  directorios (donde.co, etc.). Competidores que rankean ("18 Karats - Joyería y Esmeraldas en
  Cartagena", "Joyas La Torre", "Fenomena", "Joyería Rimer"): keyword+ciudad en nombre/title + social.
- **Shopping (foto+precio)**: bloqueado por **precios** (piezas en PreOrder sin price; gate del dueño
  = precios al final). El schema ya emite price en cuanto exista.
- **Reseñas 5.0/85 NO se pueden pegar como aggregateRating** en el schema (Google prohíbe
  self-serving; penaliza). Estrellas orgánicas = reseñas recolectadas ON-SITE (decisión de producto).

## 2. Plan en 3 cubetas
### 🟢 A — Ejecutable por Claude (código/texto/schema, sin depender de nada)
- **A1 ✅ HECHO (commit `374b8e1`, deploy `43e0666`)**: title/meta keyword-first (home + 31 piezas +
  colecciones/nosotros/contacto) — "Anillo de Diamante · Puro Albor · Bersaglio Jewelry Cartagena";
  home "Joyería en Cartagena · ..."; `og:description` conserva el poema (desacoplado); reproyección
  ecommerce en metas + `tenant_config.description`. Helper `tipoDeSlug`. Copy VISIBLE intacto.
- **A2** — Páginas de categoría indexables horneadas: `/coleccion/<tipo>.html` (anillos/aretes/
  cadenas/dijes) + `/gema/<slug>.html` (esmeralda/diamante/rubí/zafiro), H1 keyword+Cartagena, intro
  voz de marca, JSON-LD ItemList, enlazadas en header/footer. (cola-media/larga; hoy solo `?col=`.)
- **A3** — Journal/blog: hornear `/journal/<slug>.html` (Article schema) reemplazando `entrada.html?e=`
  (noindex) + 4-6 guías fundacionales (elegir esmeralda, anillo compromiso Cartagena, Muzo vs Chivor).
- **A4 ✅ HECHO** — Schema/AEO: `geo` del pin real (deploy `d1015f2`) + `og:type=product` en la ficha
  horneada (`cc63199`, guard en REQUIRED_ANCHORS + selftest; 32/32 verificadas). `hasMap`/`sameAs` YA estaban.
  ⚠️ **FAQPage SACADO de A4 — el motivo original ya no existe** (verificado 2026-07-17 en fuente primaria,
  `developers.google.com/search/docs/appearance/structured-data/faqpage`): *"This feature will no longer
  appear in Google Search starting May 7, 2026"* — las FAQ rich results murieron del todo (incluso para
  los gov/health que tenían la excepción de 2023); docs retiradas el 15-jun-2026 y GSC quitó el informe.
  FAQPage sigue siendo schema VÁLIDO y Google lo parsea para entender la página, pero **cero efecto
  visible en Search**. → Poner el *schema* solo = teatro SEO. Lo que sí vale es la **FAQ VISIBLE**
  (AEO/GEO: los LLM citan lo que pueden extraer + ataca el cuello real "rastreada sin indexar" = juicio
  de valor). Eso NO es tarea de schema sino de **CONTENIDO**, y choca con **TODO-47** (verdad de marca /
  riesgo SIC: garantía, certificados, devoluciones NO confirmados con Kary) → reclasificada, ver `10`.
- **A5** — Merchant/Shopping: generador de feed de productos LISTO (sin activar hasta precios).
- **Extra**: sembrar H1/hero real en el HTML servido del home (hoy el copy visible es client-side);
  `public/sitemap.xml` seed obsoleto (3 URLs) → guard; lastmod dinámico.

### 🔑 B — Necesita a Daniel (Claude guía)
- **B1 ✅ diagnosticado**: GSC verificado + sitemap enviado. **HECHO hoy**: Solicitar indexación de
  `colecciones.html` (en cola prioritaria). PENDIENTE: solicitar home + 8-10 piezas ancla en tandas
  (~10/día límite); revisar informe Páginas semanal.
- **B2** — GBP (business.google.com): confirmar categoría primaria "Joyería" + secundarias (Joyero,
  Tienda de anillos de compromiso, Comprador de oro...), cargar PRODUCTOS con foto (empuja fotos de
  joyas a Google YA sin Merchant), Posts semanales, responder reseñas. **Mayor palanca del ranking local.**
- **B3** — Citations (donde.co, Páginas Amarillas CO, directorios) con NAP idéntico + crecer redes.

### ⏳ C — Espera precios (paso final)
- Google Shopping / fichas producto (foto+precio) — encender A5 + Merchant Center al cargar precios.
- Estrellas orgánicas → sistema de reseñas on-site (decisión de producto aparte).

## 3. Estado al cierre (2026-07-10)
- ✅ **A1 en prod** (títulos keyword-first, commit `374b8e1` / deploy `43e0666`).
- ✅ **B1 Search Console (verificado en vivo, authuser=3)**: sitemap enviado (37 desc.), diagnóstico
  completo. **7 URLs solicitadas a indexación prioritaria**: home · colecciones (hub) · nosotros ·
  anillo-diamante-0953 · aretes-esmeralda-0679 · pulsera-rubi-0954 · topos-zafiro-0581 (1 joya por
  gema; el resto por cascada del hub + sitemap). Límite GSC ~10-12/día. **Truco extensión Chrome**:
  la barra de inspección no acepta `type` → `form_input(ref)` + DOS `Return` en llamadas SEPARADAS;
  cerrar el modal "probando" antes de la siguiente URL.
- ✅ **Ciclo de precios VERIFICADO** (pregunta de Daniel): al guardar precio, `updateTypedDoc` sella
  `updatedAt` server-side (`firestore-service.js:218`) → cron diario (`deploy.yml:9`) re-hornea →
  sitemap `lastmod=updatedAt` (`generate-pieces.mjs:1054`) + schema InStock+price. Funciona AUTO
  con ≤24h de retraso (mitigable con `workflow_dispatch` el día del cambio).
- ⏳ **Skills SEO/AEO/GEO**: prompt masticado ENTREGADO a Daniel (aportar aprendizajes a
  search-console/ssg-static-prerender/semantic-schema-aeo/maps-gbp-local) → ejecutar en sesión fresca.

## 4. Relevo — retomar en conversación NUEVA (el dueño elige el orden)
- **A2/A3 (Claude, construcción)**: páginas de categoría horneadas (`/coleccion/<tipo>` + `/gema/<slug>`)
  + blog `/journal/<slug>` con 4-6 guías. Volumen ("inundar Google") + cola larga. Ver findings P0
  del frente "Arquitectura de contenido" en `tasks/w9930xxeu.output`.
- **B2 (juntos, Chrome)**: optimizar el GBP (categorías 2ª, productos con foto, posts). Mayor palanca
  del ranking local = problema #2 del dueño.
- **A4 (Claude)**: geo coords (pedir lat/lng del pin) + FAQPage + og:type=product.
- **Skills**: correr el prompt entregado (portable a Altorra).
- **Revisar en ~3-7 días** en GSC (authuser=3): cuántas de las 7 pasaron a indexadas + cuántas piezas
  entró la cascada. Crudo auditoría: `tasks/w9930xxeu.output` (47 findings). Competidores/redes → `10`.
