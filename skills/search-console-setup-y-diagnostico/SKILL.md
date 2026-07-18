---
name: search-console-setup-y-diagnostico
description: Dar de alta Google Search Console (GSC) y diagnosticar por qué un sitio "no sale en Google" — la herramienta gratis que dice qué indexó Google, con qué queries apareces y qué está roto. Úsala al lanzar/auditar la indexación de cualquier sitio del paquete de visibilidad: alta (propiedad Dominio + TXT DNS, fallback HTML/meta), checklist pre-deploy que el SSG ya garantiza (title/desc únicos, canonical autorreferencial, JSON-LD válido, robots con Sitemap:, cero noindex residual), envío de sitemap + URL Inspection en home+2-3 fichas (sembrar), el ÁRBOL de diagnóstico "no aparezco" (site: → URL Inspection → Page Indexing → Manual Actions/Security → latencia), el bucle mensual (Performance: CTR bajo+impresiones altas→reescribir meta; striking distance pos 8-20; Rich Results; CWV), y la API GSC (service account + Action programada) para histórico >16 meses. Regla clave: GSC NO indexa automáticamente vía API; es diagnóstico+envío. Triggers — "no aparezco en Google", "Search Console", "indexación", "enviar sitemap", "por qué no me indexa", "URL Inspection", "cobertura/coverage", "queries de búsqueda", "rich results errores". Lee `tenant_config.json` (baseUrl, gscVerification). Cuenta GSC del dueño = ⛔.
---

# 🔎 Search Console — alta + diagnóstico "no salgo en Google"

> Parte del paquete de visibilidad (HUB). GSC = ojos de Google sobre tu sitio (gratis). NO indexa por ti
> (no hay "indexación automática vía API") — verifica, envía, diagnostica. Lee `tenant_config.json` (baseUrl).

## 1. Alta (una vez)
- Propiedad tipo **Dominio** (cubre http/https/www/subdominios) → verificación **TXT en DNS** (la más robusta).
  Fallback: propiedad de prefijo-URL + archivo HTML o meta-tag (`tenant_config.gscVerification`).
- ✅ **La propiedad puede vivir en OTRA cuenta Google (`authuser=N`)**: la pantalla "Bienvenida / agregar
  propiedad" en `authuser=0` NO prueba que no exista — revisar `search.google.com/u/1/`, `/u/2/`… ANTES de
  re-crear nada. *(Verificado en prod 2026-07-17: la propiedad vivía en `authuser=3`.)*
- Vincular **GA4 ↔ GSC** (y Google Ads) para cruzar datos.

## 2. Pre-deploy (lo GARANTIZA el SSG — verifícalo antes de pedir indexación)
- [ ] title + meta description **únicos** por página (no duplicados).
- [ ] **canonical autorreferencial** correcto (cada ficha apunta a sí misma).
- [ ] JSON-LD **válido** (Rich Results Test sin errores).
- [ ] `robots.txt` con `Sitemap: <baseUrl>/sitemap.xml` + habilita bots IA.
- [ ] **CERO `noindex` residual** (el bug clásico: un `noindex` global de "en construcción" que nadie quitó →
  Google obedece y NO indexa NADA). Búscalo: `curl -s <url> | grep -i noindex` debe salir vacío.

## 3. Sembrar la indexación (acelera el DESCUBRIMIENTO — no convence a Google)
- **Enviar el sitemap** en GSC (Sitemaps → `sitemap.xml`). ⚠️ **Y RE-ENVIARLO cada vez que añadas URLs**: el
  "Correcto / N descubiertas" refleja la ÚLTIMA lectura, no el archivo actual *(verificado 2026-07-17: el
  archivo tenía 52 URLs y GSC mostraba 37 de una lectura 7 días vieja — las 15 nuevas NO existían para Google)*.
  Reenviar = Sitemaps → escribir `sitemap.xml` → ENVIAR → confirma "Se ha enviado…". Y **"descubiertas" ≠
  "indexadas"**: contadores distintos.
- **URL Inspection** en la home + 2-3 fichas clave → "Solicitar indexación". ⚠️ **SOLO sirve para URLs que
  Google aún NO conoce** (descubrimiento real). Contra **"Rastreada: actualmente sin indexar" NO sirve**: Google
  ya la leyó y DECIDIÓ no indexarla — re-pedirlo no cambia un juicio de valor, solo quema la cuota (~10-12/día).
  **Mirar el ESTADO antes de gastar cuota** (tabla §4bis).
- No esperes pasivo: sitemap + inspection siembran; el resto lo descubre por links internos. Dominios nuevos
  tardan **semanas** en indexar — decirlo honesto al dueño.

## 4. 🌳 Árbol de diagnóstico "no aparezco en Google" (en orden)
1. **`site:tudominio.com`** en Google → ¿0 resultados? → Google no tiene NADA indexado → ve a 2/3.
2. **URL Inspection** de la URL que falta → ¿"URL no está en Google"? mira el motivo:
   - "Excluida por `noindex`" → quita el noindex (paso 2 de arriba).
   - "Página alternativa con canonical adecuado" → tu canonical apunta a otra URL (revisa).
   - "Rastreada, no indexada" → contenido fino/duplicado → mejora el contenido único (ver §4bis).
   - "Descubierta, no rastreada" → presupuesto de rastreo/latencia → sitemap + links internos + paciencia.
3. **Page Indexing** (Coverage) → patrones de exclusión masiva (noindex, 404, redirect, canonical).
4. **Manual Actions / Security** → ¿penalización manual o hackeo? (raro pero fatal — descártalo).
5. **Latencia**: un sitio nuevo tarda **días-semanas** en indexar. Si todo lo anterior está OK → es tiempo.

## 4bis. Los 4 estados de "Páginas sin indexar" — el estado DEFINE la acción (✅ verificado 2026-07-17)
| Estado en GSC | Qué significa | ¿Solicitar indexación? |
|---|---|---|
| **Descubierta: actualmente sin indexar** | En cola; falta autoridad/tiempo | Puede ayudar |
| **Rastreada: actualmente sin indexar** | La leyó y **DECIDIÓ** que no vale la pena | **NO ayuda** → atacar prominencia/contenido/enlaces |
| **Excluida por noindex** | Intencional o candado viejo | Revisar si es intencional |
| **No se ha encontrado (404)** | Enlace roto | Arreglar el enlace |

**"Rastreada: sin indexar" = juicio de VALOR de Google — no existe truco técnico.** Orden real de palancas
(por impacto): (1) **GBP optimizado** (mayor palanca local) → (2) **datos que DIFERENCIEN cada página**
(precio/disponibilidad/specs reales — no plantillas clonadas) → (3) **reseñas reales on-site** → (4) **enlaces
externos** (lo que más pesa y lo más lento) → (5) **contenido único indexable** (guías/blog: el mejor activo
contra este estado exacto). **Esto es de semanas, no de días — quien prometa lo contrario, miente.**

## 5. Bucle mensual (de diagnóstico a mejora)
- **Performance**: queries con **muchas impresiones + CTR bajo** → reescribir title/meta (el snippet no atrae).
  **Striking distance** (posición 8-20) → empujar esas páginas (más contenido/links internos) para subir a la pág 1.
- **Rich Results / Enhancements**: cero errores (los structured-data de la skill `semantic-schema-aeo`).
- **Core Web Vitals** (informe CWV): verde (móvil primero). ✅ **"No se han recogido suficientes datos de uso"
  NO es un bug ni una tarea de código**: significa que el sitio no tiene tráfico suficiente para el Chrome UX
  Report. Es un síntoma diagnóstico (te dice dónde estás), no algo que arreglar.

## 6. API GSC (avanzado, opcional, gratis)
Service account (GCP) + GitHub Action programada → exportar el histórico de Performance (GSC borra >16 meses).
Útil para tendencias largas. **No indexa**; solo lee datos. (La service account = ⛔ del dueño.)

## 7. Método de trabajo (aprendido en producción, 2026-07-17)
- ✅ **Traducir GSC al dueño — "no elegible" ≠ "roto"**: GSC alarma en ROJO por cosas que NO afectan la
  indexación (ej. Product sin `price` → pierde solo el rich result; la página se rastrea, indexa y posiciona
  igual). Antes de reportar "error crítico", responder: ¿bloquea la indexación o solo el adorno? Casi siempre
  es lo segundo — no alarmar sin necesidad.
- ✅ **CONTAR ≠ MUESTREAR** (regla dura para cualquier claim cuantitativo): las listas de GSC/GBP paginan
  (10/pág) y ordenan por reciente — leer la 1ª página y extrapolar es el sesgo máximo. Antes de decir "la
  mayoría / casi todos / N de M": (1) recorrer el universo (paginar TODO); (2) validar la suma contra un
  contador independiente; (3) si no se puede contar → "en la muestra que vi (N=…)" SIN generalizar.
  *(Caso real: "la mayoría de 85 reseñas sin responder" tras ver 5 → al contar: 74/85 respondidas. Falso.)*
- ⚠️ **Automatización con la extensión de Chrome — la técnica varía POR WIDGET**: SIEMPRE verificar el EFECTO
  en pantalla antes de dar la acción por hecha. Lo estable: la barra de URL Inspection es un combobox que no
  acepta `type` fiable → `form_input(ref)`; el modal "Estamos probando…" intercepta los Enter siguientes →
  cerrarlo antes de la próxima URL; si Enter no envía (p.ej. el campo de sitemap) → localizar y clicar el
  botón real (ENVIAR).

## ✅ Checklist
- [ ] Propiedad Dominio verificada (TXT DNS) · GA4↔GSC vinculados · (¿existe ya en otro `authuser`?).
- [ ] Pre-deploy verde (titles únicos, canonical, JSON-LD, robots+Sitemap, CERO noindex).
- [ ] Sitemap enviado (y RE-enviado tras añadir URLs) + URL Inspection solo en URLs que Google no conoce.
- [ ] Árbol de diagnóstico + tabla de estados §4bis (mirar el ESTADO antes de gastar cuota).
- [ ] Bucle mensual agendado (Performance/Rich Results/CWV).
