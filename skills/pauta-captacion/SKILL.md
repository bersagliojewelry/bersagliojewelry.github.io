---
name: pauta-captacion
description: "ORQUESTADORA de la pauta de captación de propietarios de ALTORRA (Meta primero, Google fase 2). Úsala al planear, montar, encender u optimizar campañas de captación (arriendo/venta/renta corta) — enruta a las skills especialistas y es dueña SOLO de lo que ninguna cubre: el playbook de la primera campaña a escala COP, el setup previo en orden, los gates legales go/no-go y la capa de VIGENCIA (qué feature/benchmark murió, verificado contra doc oficial 2026-07-18). Triggers — 'montar la campaña', 'encender la pauta', 'campaña de captación', 'pauta de propietarios', 'presupuesto de Meta', 'configurar píxel/CAPI', 'cuándo pautamos'. NO es para diagnóstico de campaña viva (meta-ads-diagnostico) ni creación de piezas (ad-creative/marketing-psicologico-conversion)."
actualizada: 2026-09-02
reglas: 12
lecciones: []
origen: propia
---

# 📣 Pauta de Captación ALTORRA — orquestadora (Meta → Google)

> **Nace del blueprint §37 (2026-07-18)**: 4 frentes de investigación contra doc OFICIAL de Meta/Google/Cloudflare
> (crudo + blueprint en bóveda `2026-07-18-investigacion-pauta-*`). **Regla de vigencia (L-30): toda afirmación de
> plataforma lleva fecha+URL oficial; sin URL oficial = ❓BENCHMARK. Re-verificar los ❓ y las URLs al montar cada
> campaña nueva — las features MUEREN** (ej.: el objetivo "Mensajes" ya no existe; AEM/8-eventos-iOS14 murió).

## §0 Qué hace y qué DELEGA (nunca duplicar)
| Necesidad | Skill dueña |
|---|---|
| Hooks, plantillas estáticas (Search-Bar/Offer-Deadline/Review/Before-After) | `ad-creative` v2.8 |
| Dolor del propietario, ganchos, cronograma orgánico, guardarraíles legales CO | `marketing-psicologico-conversion` §1/§9b-d/§10 |
| Voz, registro tú/usted (⚠️ **PROPIETARIOS = USTED**, §3.1), barrios prohibidos, reglas de pauta | `catalogo-voz-altorra` §3.1/§6.3 |
| GA4 + Consent Mode v2 + `whatsapp_click` | `ga4-lead-tracking` |
| Diagnóstico de campaña VIVA (3 preguntas) + higiene de cuenta + pre-audit landing | `meta-ads-diagnostico` |
| Oferta al propietario (Value Equation) | `offers` |
| Método kill/keep/scale + Andromeda + estructura Google Search | `paid-ads` v2.2 (⚠️ con los parches de vigencia 2026-07-18 en sus references) |
| Las 3 piezas creativas | `Brief_Diseño_Piezas_Captacion` (bóveda `pauta/`) |

## §0c 🧠 REGISTRO DE APRENDIZAJE PROPIO (la fuente experta CRECE — mandato Daniel 2026-08-20)

> Esta constelación no es solo doctrina leída: es **expertise ganada en campañas reales**. Regla del
> router (`CLAUDE.md §G.4 · Destilar a SKILLS`): **toda campaña que se cierra —venda o no, de CUALQUIER
> negocio— deja su aprendizaje transferible aquí dentro.** El caso con cifras va a su neurona; la regla
> que sirve para la próxima campaña va a la skill. Un aprendizaje que se queda en el caso NO cuenta.

| Serie | Dónde vive | Qué acumula | Estado |
|---|---|---|---|
| **`D-NN`** | `meta-ads-diagnostico` §caso Bersaglio | Meta Ads — experiencia PROPIA verificada en Ads Manager | **D-1..D-17** (2 campañas cerradas) |
| **`G-NN`** | *(nacerá en `meta-ads-diagnostico` o skill hermana)* | Google Ads — **vacío a propósito**: aún no corrimos ninguna | ⛔ sin experiencia real |
| `L-NN` / `M-NN` | `30-LECCIONES` / `33-LECCIONES-META` | Gotchas técnicos y fallos del propio método | vivo |

**Jerarquía de fiabilidad al escribir aquí** (hereda L-30): **experiencia propia MEDIDA** (con cifras y
fecha) > **doc oficial** de la plataforma (con URL) > benchmark ajeno (marcar ❓). Nunca al revés, y
**jamás inventar la serie `G-NN` desde teoría**: una skill que afirma de más se convierte en la fuente de
verdad de todos los proyectos futuros y propaga el error. Sin campaña real, la casilla se queda vacía.

**Meta de negocio que ordena este registro**: que Bersaglio y ALTORRA vendan con pauta. Techo actual
identificado (D-17): sin señal de compra downstream, Meta optimiza hacia *quien chatea*, no hacia *quien
compra*. Ese es el problema a resolver, y cada campaña nueva debe acercarse a él o descartarlo con datos.

## §0b EMBUDO CREATIVO obligatorio (mandato Daniel 2026-07-18: "el proceso debe ser pro, no una sola skill")
Ninguna pieza ni copy que vaya a DINERO sale de una sola fuente ni de una sola pasada. Pipeline vinculante:
1. **Grounding sweep** (SIEMPRE, antes de crear): Brief de bóveda (`pauta/`) + backlog TikTok
   (`compartido-marketing/BACKLOG-material-tiktok.md`) + banco de ganchos (`marketing-psicologico-conversion §9b`)
   + **espionaje Ads Library** (tool `ads_library_search`, país CO, términos del nicho → anotar patrones ACTIVOS
   de la competencia) + preguntas reales de WhatsApp/comentarios/GSC cuando existan + métricas propias
   (planilla CPQL / Ads Manager) cuando la cuenta ya tenga historia.
2. **Generación multi-ángulo**: ≥3 candidatos por pieza (categorías del banco §9b + plantillas `ad-creative`).
   Registro correcto: **propietarios = USTED** (ancla: "Usted descansa, nosotros nos encargamos").
3. **Filtro de voz**: esencia + Test de Alma + §6.3 del catálogo. El telegráfico-robot reprueba igual que el folksy.
4. **Crítica adversarial**: comité ×3 lentes (conversión / voz / cliente objetivo) para toda pieza que va a
   dinero; consejo externo si además es Decisión Fuerte.
5. **Aprobación de Daniel** (gate; siempre EN PAUSA antes del "sí").
6. **Post-campaña**: métricas → iteración (Mode 2 de `ad-creative`); lo aprendido vuelve al banco y al backlog.
🎨 **Receta visual adoptada (2026-07-18)**: fondo generado por IA (Google Flow / Nano Banana; prompt SIN texto,
con paleta navy/oro y espacio negativo) + composición HTML/CSS con tokens reales de marca + render Playwright a
píxel exacto (feed 1080² y stories 1080×1920 con márgenes 250px). El texto/logo NUNCA se le piden a la IA de
imagen. Fuente editable en bóveda `pauta/outputs/`.

## §1 GATES legales go/no-go (bloqueantes ABSOLUTOS — estado 2026-07-18)
1. **Matrícula de arrendador**: EXISTE ✅ — el NÚMERO lo entrega Daniel al CIERRE DE OBRA. Sin número visible
   NO sale la pieza de arriendo (Ley 820 art. 31: obligatorio en toda publicidad).
2. **RNT**: EXISTE ✅ — número también al cierre de obra. Sin RNT exhibido NO sale la pieza de renta corta
   (Ley 300/1996 + Ley 2068/2020 art. 38).
3. **Política de privacidad con URL propia publicada** en el portal — requisito OFICIAL de instant forms
   (facebook.com/business/help/761812391313386) + Ley 1581/2012 (el gate más temprano del portal, 42-LEGAL).
4. **Landing verificada** (regla pre-pauta de `meta-ads-diagnostico`): velocidad + CTA claro + tracking del lead vivo.
⇒ **El encendido de la pauta CONVERGE con el cierre de obra de la web.** Todo se construye listo-para-encender.

## §2 La primera campaña (resumen ejecutivo — detalle en `references/playbook-primera-campana.md`)
- **Objetivo Leads** (el objetivo "Mensajes" YA NO EXISTE — help/451202588606868, verificado 2026-07-18) ·
  destino **WhatsApp CTWA** ("Maximizar conversaciones" — el evento más frecuente/barato) + 2ª pieza con
  **Instant Form "Higher Intent" + OTP** (la palanca OFICIAL de calidad de lead — help/252352181957512).
- **1 campaña · 1 conjunto (máx 2) · 2-4 anuncios** · CBO default (no pelearlo) · **Advantage+ audience AMPLIA**
  ("we recommend targeting as broadly as possible" — help/793748385630490): límites duros SOLO Cartagena+área,
  edad 28+ ❓(criterio propio), español. El filtro "propietario" lo hace el copy/form/conversación, NO el targeting.
- **Piezas activas: ARRIENDO + VENTA** (con números reales tras la entrega) · RENTA CORTA espera su RNT visible.
- **Presupuesto**: COP 40-60k/día ≈ 1,2-1,8M/mes ❓BENCHMARK (piso ~600k/mes sin señal ❓; Ads Manager alerta el
  mínimo real oficial al crear el conjunto). **Aceptar "learning limited" A PROPÓSITO** (regla oficial ~50
  eventos/semana sigue vigente — la mitigación oficial ES nuestro diseño: 1 conjunto, amplio, evento frecuente).
- **CPL esperado ❓**: banda LatAm USD 5-15; planear pesimista USD 10 ≈ COP 40k. **No existe benchmark de
  captación de PROPIETARIOS — el dato real lo produce nuestra planilla CPQL desde el día 1.** TRM: confirmar al presupuestar.
- **Días 1-7 NO TOCAR NADA** (edición significativa resetea aprendizaje — oficial) · día 7 diagnóstico
  (`meta-ads-diagnostico`) · **día 14 decisión por CPQL-propietario** (método TCPL de `meta-decision-system`
  re-anclado a COP; umbral de evidencia: ~3× CPA objetivo o ~100 clics) · escalar +20% cada 5 días · retargeting
  0% al inicio (revisar a las 4-6 semanas con ~1.000 visitantes ❓).

## §3 Setup previo EN ORDEN (detalle + URLs en `references/setup-previo.md`)
0. Gates §1 → 1. **WhatsApp Business** (+57 300 243 9810) conectado a la página de Facebook → 2. Portafolio +
cuenta publicitaria en COP + higiene (apagar auto-mejoras que rompen la pieza — `meta-ads-diagnostico`) →
3. **Píxel/dataset** (UN id para snippet y CAPI; fbq en el `<head>` del layout) → 4. Verificación de dominio
(**ya NO es requisito** — AEM murió — pero hacerla: gratis, DNS TXT, brand safety) → 5. GA4 + Consent Mode v2 +
`whatsapp_click` verificado en DebugView → 6. Landing verificada → 7. **CAPI vía Cloudflare Worker** ($0: POST a
`graph.facebook.com/v25.0/{PIXEL_ID}/events`, `event_id` UUID compartido para dedup, em/ph SHA-256, token como
secret JAMÁS en repo; validar dedup en Test Events ANTES de confiar) → 8. Campaña por el conector Meta Ads MCP,
**creada EN PAUSA, revisión de Daniel, encender**. Contrato de seguridad: TODO cambio de dinero = "sí" explícito.

## §4 Doctrina de escala COP
Los números de los references gringos (`meta-decision-system` en USD B2B, "work email") NO se importan — se
importa el MÉTODO. Equivalencias ALTORRA: work email → **OTP de teléfono** · TCPL → **CPQL-propietario** (lead
calificado en planilla: ¿es dueño? ¿inmueble en Cartagena?) · $5k/mes por anuncio → escala COP con evidencia 3×.

## §5 Google Ads = FASE 2 (no ahora)
Activar SOLO cuando Meta convierta de forma estable y haya presupuesto total >COP 3M/mes ❓. Base:
`paid-ads/references/google-search-playbook.md` CON sus parches de vigencia 2026-07-18 (Maximize Clicks primero
en campañas nuevas — oficial; baseline 15 conv/30 días; desde 17-ago-2026 tCPA ejecuta MÁS CERCA del target — no
ponerlo holgado). Keywords de captación = volumen bajísimo en Cartagena: pasar por Keyword Planner de la cuenta
ANTES de gastar un peso. Política de vivienda de Google: solo EE.UU./Canadá (espejo de Meta) — Colombia libre;
pauta a diáspora en EE.UU. SÍ caería bajo ambas políticas.

## ✅ Checklist de encendido
- [ ] Números de matrícula (+RNT si renta corta) ENTREGADOS y visibles en piezas/footer.
- [ ] Política de privacidad publicada · WhatsApp Business conectado a la página · píxel PageView verificado.
- [ ] GA4 `whatsapp_click` en DebugView · landing verificada · CAPI dedup validado en Test Events (o fase 0 sin píxel).
- [ ] Campaña Leads creada EN PAUSA vía MCP · presupuesto confirmado con TRM del día · "sí" de Daniel → encender.
- [ ] Planilla CPQL abierta desde el día 1 · cita de diagnóstico día 7 y decisión día 14 agendadas.
