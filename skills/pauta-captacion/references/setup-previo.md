# Setup previo obligatorio — EN ORDEN (cada paso desbloquea el siguiente) · verificado 2026-07-18

0. **Gates legales (bloqueantes absolutos — estado real 2026-07-18):**
   a. **Matrícula de arrendador: EXISTE ✅** — el NÚMERO lo entrega Daniel al CIERRE DE OBRA (decisión suya:
      la web debe generar confianza antes de exhibir los sellos). Sin número visible NO sale la pieza de
      arriendo (Ley 820 art. 31). Hasta entonces placeholders `No. ____` — JAMÁS inventar.
   b. **RNT: EXISTE ✅** — número también al cierre de obra. Sin RNT exhibido NO sale renta corta (Ley
      300/1996 · Ley 2068/2020 art. 38).
   c. **Política de privacidad con URL propia publicada** en el portal — requisito OFICIAL de instant forms
      (facebook.com/business/help/761812391313386) + Ley 1581/2012 + aviso en la landing que capte datos.
1. **WhatsApp Business** con +57 300 243 9810 **conectado a la página de Facebook de ALTORRA** (o al
   portafolio) — requisito CTWA. Si sale atenuado en Ads Manager → "Connect account" con código de país +
   número (help/447934475640650 · developers.facebook.com/docs/marketing-api/ad-creative/messaging-ads/click-to-whatsapp/).
2. **Business portfolio + cuenta publicitaria en COP + higiene de cuenta**: revisar y apagar deliberadamente
   las auto-mejoras que rompen la pieza aprobada ("probar funciones de contenido nuevas", mejoras visuales) —
   criterio: control de MARCA off, volumen de entrega on (`meta-ads-diagnostico §Higiene`; ❓ nombres de UI
   cambian — verificar en el Ads Manager vigente).
3. **Píxel/dataset en Events Manager** — hoy píxel y dataset son la misma cosa (dataset ID = pixel ID; UN
   solo id para snippet browser y CAPI — help/750785952855662). Código base `fbq` en el `<head>` del layout
   compartido del portal (developers.facebook.com/docs/meta-pixel/get-started). Verificar PageView con Meta
   Pixel Helper.
4. **Verificación de dominio `altorrainmobiliaria.co`** — ⚠️ **YA NO es requisito** para eventos ni pauta
   (AEM manual ELIMINADO: sin 8 eventos priorizados, sin conversion domain — help/721422165168355). Hacerla
   igual: gratis, 5 min, DNS TXT en Cloudflare; protege edición de links y marca (help/286768115176155).
5. **GA4 + Consent Mode v2 + `whatsapp_click`** según `ga4-lead-tracking` — verificado EN VIVO en DebugView
   antes de pautar (cero-demo).
6. **Landing de captación VERIFICADA** (regla pre-pauta de `meta-ads-diagnostico`): PageSpeed OK + CTA claro
   + tracking del lead disparando. Pauta nueva SOLO sobre landing verificada.
7. **CAPI Worker** (paralelo a semana 1): POST a `graph.facebook.com/v25.0/{PIXEL_ID}/events` (verificar
   versión de Graph vigente al implementar), token como secret del Worker (JAMÁS en repo), `event_id` UUID
   compartido browser/server para dedup, em/ph en SHA-256, IP desde `CF-Connecting-IP`. **Validar dedup en
   Test Events ANTES de confiar.** Free-tier: 100k req/día del Worker sobran. Zaraz (1M eventos/mes) =
   alternativa ❓ solo tras validar server-side en Test Events. CAPI Gateway de Meta = DESCARTADO (solo
   AWS/GCP con costo de infra).
8. **Campaña por el conector Meta Ads MCP — creada EN PAUSA → revisión de Daniel → encender.** El clasificador
   bloquea operaciones autónomas sobre la cuenta: las acciones de dinero se ejecutan CON Daniel presente.

## Parches de vigencia aplicados a skills existentes (2026-07-18 — trazabilidad)
1. `paid-ads/references/conversion-tracking.md` — AEM/verify-domain/top-8-events = MUERTO; CAPI Gateway =
   descartado para ALTORRA.
2. `paid-ads/references/platform-setup-checklists.md` — ídem AEM; Special Ad Category con alcance geográfico
   (solo EE.UU./Canadá; diáspora sí caería).
3. `paid-ads/references/meta-decision-system.md` — números USD B2B inoperables tal cual; usar MÉTODO con
   equivalencias COP (§4 del SKILL.md).
4. `paid-ads/references/google-search-playbook.md` + SKILL — bidding: Maximize Clicks PRIMERO en campañas
   nuevas (oficial), baseline 15 conv/30 días, cambio 17-ago-2026 (tCPA ejecuta más cerca del target).
5. `meta-ads-diagnostico` — el "objetivo Mensajes" fue retirado (las MÉTRICAS del framework siguen válidas);
   "website > form en intención" re-etiquetado ❓ con la palanca oficial Higher Intent+OTP.
