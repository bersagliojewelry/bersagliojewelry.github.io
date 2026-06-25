---
name: ga4-lead-tracking
description: Medir lo que importa en un negocio offline/bajo-consulta (joya, carro, inmueble) con GA4 — el LEAD, no `purchase` — con Consent Mode v2 (Ley 1581 Colombia) y links de WhatsApp trazables (dark-social). Úsala al instrumentar analítica en cualquier sitio del paquete de visibilidad: GA4 por EVENTOS (no es factor de ranking, pero te dice QUÉ optimizar), key events `generate_lead`/`contact`/`whatsapp_click`/`view_item`, un solo helper `trackEvent(name,params)` (DRY, lee los mismos datos del ítem que el SSG), y un generador de links WhatsApp con UTM + hash de sesión + contexto del ítem prerelleno. Reglas duras: Consent Mode v2 default DENIED antes del config → update granted al aceptar el banner; NUNCA PII (tel/email/cédula) a GA4 ni en URL; verificar EN VIVO en DebugView (cero-demo); vincular GA4↔Search Console↔Ads. Portable por `tenant_config.json` (ga4MeasurementId). Triggers — "instalar GA4", "medir conversiones/leads", "consent mode", "trackear clicks de WhatsApp", "qué eventos mido", "analítica sin romper privacidad", "lead funnel". NO uses para e-commerce con checkout online (ahí sí `purchase`).
---

# 📊 GA4 Lead Tracking — medir el lead, no la compra (negocio offline Colombia)

> Parte del paquete de visibilidad (HUB). GA4 NO mueve el ranking — guía QUÉ optimizar (qué fichas convierten,
> de dónde vienen). Lee `tenant_config.json` (`ga4MeasurementId`; si vacío, no inyecta). El ID del dueño es ⛔ (lo pide la sesión-implementadora).

## 0. La tesis
Joya/carro/inmueble se venden **offline, "bajo consulta"** → NO hay `purchase` que medir. El evento de valor es
el **LEAD**: el momento en que alguien pide info (WhatsApp, formulario, llamada). Medir eso = saber qué inventario/
ciudad/canal trae clientes. En Colombia **todo cierra por WhatsApp** (dark-social) → hay que **trazar el click de WA**.

## 1. Consent Mode v2 ANTES del config (Ley 1581 — no negociable)
```html
<!-- 1. consent default DENIED, ANTES de gtag config -->
<script>
  window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    ad_storage:'denied', analytics_storage:'denied',
    ad_user_data:'denied', ad_personalization:'denied'   // los 4 signals v2
  });
</script>
<!-- 2. gtag.js async, ID desde build/env (VITE_GA_MEASUREMENT_ID / tenant_config) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>
<script>gtag('js', new Date()); gtag('config', 'G-XXXX', { anonymize_ip:true });</script>
```
Al **aceptar el banner** → `gtag('consent','update',{analytics_storage:'granted', ...})`. Sin aceptar, GA4 corre en
modo cookieless básico (sin PII, sin cookies). El banner es CODIFICABLE; el texto legal exacto → revisión de abogado.

## 2. Los key events (máx 2-3 de valor) — un solo helper DRY
```js
// js/analytics.js — lee los MISMOS datos del ítem que el SSG (PRERENDERED_*), cero duplicación.
export function trackEvent(name, params = {}) {
  if (typeof gtag !== 'function') return;
  gtag('event', name, { ...params });   // NUNCA PII aquí
}
// Eventos:
trackEvent('view_item', { items:[{ item_id:id, item_name:title, item_category:vertical }], currency:'COP' });
trackEvent('whatsapp_click', { item_id:id, channel:'whatsapp', source:utmSource });   // ← key event
trackEvent('generate_lead', { method:'form', item_id:id });                            // ← key event
trackEvent('contact', { method:'phone' });
```
Marca `generate_lead`/`whatsapp_click` como **Key Events** en GA4. Máx 2-3 (no ruido).

## 3. WhatsApp trazable (el cierre real — dark-social)
Genera el link de WA en el build/cliente con UTM + hash de sesión + **contexto del ítem en el texto prerelleno**:
```js
function waLink(cfg, item, sessionHash) {
  const text = `Hola, me interesa: ${item.title} (ref ${item.id}). Vi esto en ${cfg.baseUrl}`;
  const utm = `utm_source=web&utm_medium=whatsapp&utm_campaign=ficha&item=${item.id}&s=${sessionHash}`;
  // el contexto va en el TEXTO (lo lee el asesor), los UTM en el evento GA (no en PII)
  return `https://wa.me/${cfg.nap.phone.replace(/\D/g,'')}?text=${encodeURIComponent(text)}`;
}
// onclick → trackEvent('whatsapp_click', {...}) ANTES de abrir wa.me
```
Así: GA4 cuenta el lead + el asesor recibe el contexto del ítem (sabe qué carro/joya sin preguntar). El hash de
sesión liga la conversación al recorrido web SIN mandar PII a GA4.

## 4. Reglas duras
- **NUNCA PII** (teléfono/email/cédula/nombre) a GA4 ni en la URL. El contexto del ítem va en el TEXTO de WA, no en params GA.
- **Verificar EN VIVO en DebugView** (no asumir que dispara — cero-demo): abre el sitio con `?debug_mode=1`, haz
  cada acción, confirma el evento + params en GA4 DebugView. Un evento "instalado" pero que no dispara = inútil.
- **Excluir tráfico interno** (IP del dueño/oficina) en GA4 Admin · vincular **GA4 ↔ Search Console ↔ Google Ads**.
- Consent Mode v2 ANTES del config · `anonymize_ip`.

## ✅ Checklist
- [ ] Consent default DENIED (4 signals) cargado ANTES de `gtag('config')`.
- [ ] `ga4MeasurementId` desde `tenant_config`/env (no hardcode).
- [ ] `view_item` + `whatsapp_click` + `generate_lead` disparan y se ven en **DebugView en vivo**.
- [ ] Links de WA con texto-contexto + evento `whatsapp_click` antes de abrir.
- [ ] Cero PII en eventos/URL · key events marcados · tráfico interno excluido · GA4↔GSC↔Ads vinculados.
