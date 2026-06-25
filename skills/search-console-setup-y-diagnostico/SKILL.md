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
- Vincular **GA4 ↔ GSC** (y Google Ads) para cruzar datos.

## 2. Pre-deploy (lo GARANTIZA el SSG — verifícalo antes de pedir indexación)
- [ ] title + meta description **únicos** por página (no duplicados).
- [ ] **canonical autorreferencial** correcto (cada ficha apunta a sí misma).
- [ ] JSON-LD **válido** (Rich Results Test sin errores).
- [ ] `robots.txt` con `Sitemap: <baseUrl>/sitemap.xml` + habilita bots IA.
- [ ] **CERO `noindex` residual** (el bug clásico: un `noindex` global de "en construcción" que nadie quitó →
  Google obedece y NO indexa NADA). Búscalo: `curl -s <url> | grep -i noindex` debe salir vacío.

## 3. Sembrar la indexación (acelera el descubrimiento)
- **Enviar el sitemap** en GSC (Sitemaps → `sitemap.xml`).
- **URL Inspection** en la home + 2-3 fichas clave → "Solicitar indexación" (empuja a Google a rastrear ya).
- No esperes pasivo: el sitemap + inspection siembran; el resto Google lo descubre por links internos.

## 4. 🌳 Árbol de diagnóstico "no aparezco en Google" (en orden)
1. **`site:tudominio.com`** en Google → ¿0 resultados? → Google no tiene NADA indexado → ve a 2/3.
2. **URL Inspection** de la URL que falta → ¿"URL no está en Google"? mira el motivo:
   - "Excluida por `noindex`" → quita el noindex (paso 2 de arriba).
   - "Página alternativa con canonical adecuado" → tu canonical apunta a otra URL (revisa).
   - "Rastreada, no indexada" → contenido fino/duplicado → mejora el contenido único.
   - "Descubierta, no rastreada" → presupuesto de rastreo/latencia → sitemap + links internos + paciencia.
3. **Page Indexing** (Coverage) → patrones de exclusión masiva (noindex, 404, redirect, canonical).
4. **Manual Actions / Security** → ¿penalización manual o hackeo? (raro pero fatal — descártalo).
5. **Latencia**: un sitio nuevo tarda **días-semanas** en indexar. Si todo lo anterior está OK → es tiempo.

## 5. Bucle mensual (de diagnóstico a mejora)
- **Performance**: queries con **muchas impresiones + CTR bajo** → reescribir title/meta (el snippet no atrae).
  **Striking distance** (posición 8-20) → empujar esas páginas (más contenido/links internos) para subir a la pág 1.
- **Rich Results / Enhancements**: cero errores (los structured-data de la skill `semantic-schema-aeo`).
- **Core Web Vitals** (informe CWV): verde (móvil primero).

## 6. API GSC (avanzado, opcional, gratis)
Service account (GCP) + GitHub Action programada → exportar el histórico de Performance (GSC borra >16 meses).
Útil para tendencias largas. **No indexa**; solo lee datos. (La service account = ⛔ del dueño.)

## ✅ Checklist
- [ ] Propiedad Dominio verificada (TXT DNS) · GA4↔GSC vinculados.
- [ ] Pre-deploy verde (titles únicos, canonical, JSON-LD, robots+Sitemap, CERO noindex).
- [ ] Sitemap enviado + URL Inspection en home+2-3 fichas.
- [ ] Árbol de diagnóstico documentado (si no aparece, seguir los 5 pasos en orden).
- [ ] Bucle mensual agendado (Performance/Rich Results/CWV).
