# Activos Meta de ALTORRA Inmobiliaria — inventario REAL (ordenado 2026-07-18, ADR §38)

> Auditoría + limpieza ejecutada EN VIVO (MCP oficial + Chrome del dueño, con sus aprobaciones explícitas).
> Estos IDs son identificadores operativos (no secretos — el pixel ID viaja en el HTML público igual).
> El token de CAPI, cuando exista, va como SECRET del Worker — JAMÁS aquí.

## Estructura vigente (post-limpieza)
| Activo | ID | Estado |
|---|---|---|
| **Business portfolio** | `807047192483289` — "Altorra Inmobiliaria" | ✅ (hermano: "Altorra Cars", separado) |
| **Cuenta publicitaria** | `1784008112275023` — renombrada **"ALTORRA Inmobiliaria - Ads"** | ✅ RECLAMADA al portafolio 2026-07-18 (permanente; términos comerciales aceptados con ok de Daniel). COP · prepago (saldo ~$4.992 COP al 07-18 — recargar antes de pautar) · ⚠️ aún NO habilitada para Ads MCP (rollout gradual de Meta — reintentar) |
| **Página de Facebook** | `807043122483696` — "Altorra Inmobiliaria " | ✅ en el portafolio como página principal · nit: espacio al final del nombre (editar en la Página, no crítico) |
| **Instagram** | `@altorrainmobiliaria` (asset `102476579273811`) | ✅ en el portafolio · **página↔IG CONECTADO ✅** (`verificado-vivo: 2026-07-18`, settings de la página: cubre contenido, ANUNCIOS, estadísticas, mensajes → **placement IG listo para pauta**) · **login del asset en BM ✅ CERRADO 2026-07-18** (el OAuth web daba "Sorry, something went wrong" — bug de Meta; Daniel lo completó desde el CELULAR y funcionó; quedaron 2 personas asignadas: identidad IG acceso total + FB acceso parcial incl. Anuncios) · toggle "DMs de IG en bandeja de la página" = OFF (decisión dueño) |
| **WhatsApp Business (WABA)** | `1089080446378494` — nombre "propietario" | ✅ en el portafolio · número **+57 300 2439810** vinculado ✅ · **Conectado** ✅ (`verificado-vivo: 2026-07-18` — Daniel abrió la app y el número sincronizó) · vínculo **página FB↔WhatsApp ✅ verificado** (número principal de la página + botón CTA WhatsApp ON + mostrar número ON → **requisito CTWA cumplido**) · nit: renombrar el asset NO está expuesto en la UI actual (intentado 07-18: menú "…" de Business settings y WhatsApp Manager, sin opción) |
| **Píxel / Dataset** | `1032884172712946` — **"ALTORRA Inmobiliaria - Web"** | ✅ CREADO 2026-07-18 (sin categorías restrictivas a propósito — Housing no aplica a CO, §34). Sin actividad: se cablea al portal (setup-previo §3) + CAPI Worker (§7) |
| Cuenta publicitaria vieja | `36557834` | CERRADA — se deja quieta (sin acción) |
| Personas | Daniel (FB, acceso total, activo) + Daniel (identidad IG, inactivo) | ✅ sin terceros |

## Pendientes que solo el dueño puede hacer (cazarlos en el próximo lote)
1. ~~Login de Instagram~~ ✅ **HECHO 2026-07-18** — el OAuth web falló ("Sorry, something went wrong", bug de Meta) pero Daniel lo completó **desde el celular** y funcionó. 📚 Lección reutilizable: cuando un flujo OAuth de Meta falle en web, probar la vía móvil (app Business Suite / IG del teléfono) antes de pelear con cookies.
2. ~~Abrir WhatsApp Business en el teléfono~~ ✅ **HECHO 2026-07-18** — número **Conectado** + vínculo página↔WhatsApp verificado (CTWA listo).
3. **Recargar saldo/confirmar método de pago** antes de encender (prepago actual ≈ COP 5k).
4. (Opcional, cosmético) Quitar el espacio final del nombre de la página. *(El renombre del WABA "propietario" NO está disponible en la UI — verificado 07-18.)*

## Centro de seguridad del portfolio (ordenado 2026-07-18)
- **Dominio de confianza agregado** ✅: `altorrainmobiliaria.co` (aprobación de pares) — ya figura en "Acción completada". Solo el dominio de producción; el staging workers.dev NO se agrega (no recibe pauta).
- **Protección de la cuenta publicitaria**: guardada 2× con "Cambios aplicados" → **Protección predeterminada** (solo anuncios sospechosos requieren aprobación) + **Daniel Romero marcado como aprobador** (checkbox verificado). Se DESCARTÓ "adicional" (aprobar cada anuncio = fricción para operador único) y "personalizada" (tope por presupuesto redundante: la cuenta es prepago).
- ⚠️ **Alerta residual que puede NO desaparecer**: el panel sigue diciendo "0 aprobadores"/"1 cuenta sin la opción". Diagnóstico: recomputo perezoso del panel o el contador solo cuenta pares NO-admin (los admins son revisores implícitos; en negocio unipersonal no existe "par"). **NO bloquea pautar** — no reintentar en loop.
- **2FA del portfolio = "Nadie"** (pendiente decisión del dueño): subirla a "Todos" exige que su FB personal tenga 2FA activo ANTES o se bloquea el acceso. Proponérselo, no tocarlo unilateralmente.
- **Verificación del negocio DISPONIBLE** ("Cumple los requisitos para la verificación"): opcional, NO es gate de pauta; requiere docs del negocio (dueño). Recomendable post-obra.
- **NO se activó** "Require ads to use trusted website domains for all landing pages": interacción con destino CTWA (WhatsApp) sin verificar — revisitar tras la 1ª campaña.
- Completadas previas: acceso total ≤10 usuarios ✅ · administrador alternativo ✅.

## Nota WhatsApp Manager (07-18)
Alerta "Falta un método de pago válido" en WhatsApp Manager: aplica SOLO a conversaciones **iniciadas
por el negocio** (plantillas / API). Las iniciadas por el cliente (CTWA = nuestro playbook) siguen en
período gratuito → **NO es gate para encender la pauta**. Se revisará si algún día enviamos plantillas.

## 🟣 BERSAGLIO JEWELRY como SOCIO (agregado 2026-07-25 — operador = líder de pautas ×2 por mandato Daniel)

> Bersaglio nos asignó activos como socio (modelo agencia): se operan desde ESTE Business de Altorra
> (Administrador de anuncios → cambiar de cuenta). Voz = `catalogo-voz-bersaglio`, JAMÁS la de Altorra.
> Constancia completa para su cerebro: bóveda `brain-private/bersaglio/research-archive/2026-07-25-meta-business-setup-lider-pautas.md`.

| Activo de Bersaglio (portfolio `417509312346303`, renombrado "Bersaglio Jewelry") | ID | Nuestro acceso |
|---|---|---|
| Página **Bersaglio Jewelry** (102 seg FB · IG 1,8k vinculado) | asset de la página | **ACCESO TOTAL** (todo excepto acciones delicadas — elevado 2026-07-27, orden Daniel, verificado tras recarga) |
| Cuenta publicitaria del negocio | `2064219544145066` | **ACCESO TOTAL** · COP $0 · SIN método de pago · **✅ Ads-MCP HABILITADO** (verificado 2026-07-27) |
| WhatsApp Product Catalog | — | **ACCESO TOTAL** (administrar todo — elevado 2026-07-27) |
| **WABA "Bersaglio Jewelry -By KaryMendoza"** | `351366081401444` | En el portfolio Bersaglio · número **+57 301 3752592 Conectado, calidad Alta** (`verificado-vivo: 2026-07-27`) → CTWA viable |
| ⚠️ IG `bersaglio_jewelry` | — | NO compartible aún (exige re-login IG en su Business — vía celular) |
| 💰 Saldo prepago **COP $118.835** | cuenta PERSONAL de Kary `2199223463669869` | **DECISIÓN DANIEL 2026-07-27: pautar AQUÍ** (sin reclamar — se opera vía sesión IG de Bersaglio en Chrome, botón "Continuar con Instagram" en business.facebook.com). Recarga real: $100.000 el 25-jul (Mastercard ····3355). **⚠️ IVA 19% APLICA** (facturas FBADS-270-* en cada gasto; ID fiscal 329083056 verificado) → gasto neto máx = saldo/1,19. Límite diario Meta: $96.806. |

📚 **RCA MCP (2026-07-27)**: el conector Meta Ads solo ve cuentas asignadas a la PERSONA, no al Business.
El acceso de socio (Business Altorra) NO bastaba: hubo que **asignar a Daniel (persona) el activo** en
Configuración del Business de Altorra → Cuentas publicitarias → `2064…` → Asignar personas → acceso total.
Tras eso la cuenta apareció en `ads_get_ad_accounts` CON Ads-MCP habilitado (a diferencia de la de Altorra,
aún en rollout). Lección: al recibir un activo como socio, SIEMPRE asignar también a la persona operadora.
⚠️ La cuenta de Kary NO es visible por MCP (es personal de ella) → la 1ª campaña se monta POR NAVEGADOR.

**1ª campaña (semana 28 jul–3 ago 2026)**: plan v2 post-comité + estudio (10 agentes) → bóveda
`brain-private/bersaglio/2026-07-27-plan-pauta-semana1-SINTESIS.md` (+ CRUDO json). Claves: CTWA a
+57 301 3752592 · 1 campaña/1 conjunto/2-3 anuncios · **COP 14.200/día** (IVA dentro del saldo) · spend cap
99.400 · ⛔ Imagen 1 (anillos réplica Cartier) NO sale ni sin textos (distinctive features) · gates con
insumos de Daniel en la síntesis. Píxel de Bersaglio NO existe (para CTWA no es gate).

## Nota MCP
El conector oficial (`mcp.facebook.com/ads`) está instalado y responde; la cuenta activa aún dice
*"Ads MCP is gradually being rolled out"* → hasta que Meta la habilite, la operación fina va por el
navegador (como hoy). **Re-verificada 3× el 2026-07-18: sigue `false`** — re-verificar con
`ads_get_ad_accounts` al inicio de cada sesión de pauta. Dato útil del API: `min_daily_budget` COP ≈ 3.319/día.
**El HUMO ya quedó MONTADO Y PUBLICADO EN PAUSA por extensión Chrome (ADR §42 · campaña `120250036063330588`);
as-built + gotchas → bóveda `2026-07-18-humo/montaje-ads-manager-runbook.md` + L-32** (⚠️ Ads Manager defaultea
a la página de CARS en este usuario multi-marca — verificar página/número SIEMPRE).
