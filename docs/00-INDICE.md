# 00 — ÍNDICE SINÁPTICO (mapa § → línea del Historial ADR)

> **Nodo neuronal: Índice sináptico.** Mapa § → línea de
> `docs/99-HISTORIAL-ADR.md`. Es la tabla de contenidos del
> nodo de Largo Plazo. Se consulta on-demand (Trigger de Error/Historia, ver
> `CLAUDE.md §G`).
>
> **Cerebro completo**: 🧠 `CLAUDE.md` (router/identidad) · 🩺 `docs/05-ESTADO-GLOBAL.md` (signos vitales)
> · ⚡ `docs/10-MEMORIA-CORTO-PLAZO.md` (WIP) · 🛰️ `docs/15-CONSEJO-EXTERNO.md` (red team) · 🗺️ `docs/20-MEMORIA-ESPACIAL.md` (arquitectura)
> · 🧪 `docs/30-LECCIONES.md` (experiencia/recetas) · 🔥 `docs/31-LECCIONES-FIRESTORE.md` (backend: Firestore/CF/reglas; hija de 30) · 🎯 `docs/40-LOBULOS-DOMINIO.md` (registry dominios) · 🏛️ `docs/50-ARQUITECTURA.md` (arquitectura/charter CRM) · 🔁 `docs/60-WORKFLOWS.md` (workflows reutilizables) · 🗂️ este (índice) · 📚 `docs/99-HISTORIAL-ADR.md` (largo plazo) · 🛠️ `docs/skills-inventory.md` (catálogo skills).
>
> **Cómo usarlo (regla de oro anti-saturación)**:
> 1. Busca aquí el § que necesitas y su línea de inicio.
> 2. Lee SOLO ese tramo: `Read docs/99-HISTORIAL-ADR.md offset=<línea> limit=~150`.
> 3. NUNCA leas el historial completo (satura el contexto al instante).
>
> Ejemplo: para el Lookbook §19 → línea 256 → `Read docs/99-HISTORIAL-ADR.md offset=256 limit=150`.
>
> Grep rápido: `grep -n "^## " docs/99-HISTORIAL-ADR.md` o PowerShell `Select-String` regenera este mapa.

---

## 🧭 Enrutamiento semántico (síntoma/tema → neurona) — CONSULTA ESTO PRIMERO

| Tu situación / síntoma | Ve a |
|---|---|
| ¿Dónde vive un módulo / ruta / flujo / componente? | 🗺️ `20-ESPACIAL` |
| Hallazgos/presentación para Kary (histórico Kardex→plataforma) / pendientes viejos | bóveda privada → stub `docs/PENDIENTES-Y-HALLAZGOS.md` (los VIVOS = tabla TODO del `10`) |
| Voy a mover/renombrar archivos, refactor de estructura | 🧪 `30-LECCIONES` + 🗺️ `20-ESPACIAL` |
| Conflicto al fusionar / cache / service worker | 🧪 `30-LECCIONES` L-02 + `CLAUDE.md §4` |
| Errores conocidos y gotchas de estilo (CSS modular por página) | 🧪 `30-LECCIONES` |
| ¿Qué hay pendiente? estado del sprint | ⚡ `10-CORTO-PLAZO` (TODOs) |
| ¿Cómo/dónde se calcula la mora / aging / cartera vencida / a quién cobrar? | `js/crm-estado-cuenta.js` (helper PURO `estadoCuenta`, FIFO en vivo) + ADR §51 |
| 🔵 Audita SEGURIDAD / Firebase rules | 🎯 `40-LOBULOS-DOMINIO` → 41-SEGURIDAD (on-demand) |
| 🔵 Audita UX / interfaz / componentes | 🎯 `40-LOBULOS-DOMINIO` → 43-UX |
| 🔵 Audita PERFORMANCE / LCP / Vite | 🎯 `40-LOBULOS-DOMINIO` → 45-PERFORMANCE |
| 🔵 Audita ACCESIBILIDAD / skip-link / focus | 🎯 `40-LOBULOS-DOMINIO` → 48-ACCESIBILIDAD + Skill `accessibility-audit` |
| ⚖️ Algo LEGAL: términos, privacidad, datos personales, retracto, garantía, cookies, RUCOM, IVA, lavado de activos | 🎯 `40-LOBULOS` → `42-LEGAL` + Skill `legal-colombia` (NUNCA plugins legales extranjeros) |
| 🔁 Voy a revisar/auditar/verificar algo de forma sistemática (reglas, diseño, lo que dejó un subagente, si algo cumple) | 🔁 `docs/60-WORKFLOWS.md` (catálogo de workflows de detección reutilizables) |
| 🐛 Voy a TOCAR o ROZAR un subsistema (render/CRUD/flujo/estado compartido) y quiero no dejar escapar un bug | 🔁 `60-WORKFLOWS` **W-10** (camino vivo desde estado-cero + escalada) + skill `caza-bugs` |
| 🛰️ Decisión fuerte / cara de revertir / fork 50-50 → ¿2ª opinión? | 🛰️ `docs/15-CONSEJO-EXTERNO.md` (cuándo + qué tier del provider externo §0) |
| 🏛️ Decisión de arquitectura / diseño o escalado del CRM / límites de módulo / "cero monolitos" | 🏛️ `docs/50-ARQUITECTURA.md` |
| 🛠️ ¿Qué skill tengo para X? / mapa de skills | 🛠️ `docs/skills-inventory.md` + 🎯 `40-LOBULOS §Recursos Externos` |
| 🌱 Crear / sugerir una SKILL nueva (capacidad portable) | 🎯 `40-LOBULOS-DOMINIO` §Reflejo de Sugerencia de Skills + Skill `skill-creator` |
| El "por qué" de una decisión / detalle de un § | tabla "§ → línea" abajo → 📚 `99-HISTORIAL` |

---

## Mapa § → línea

| § | Tema | Línea |
|---|---|---|
| §1 | 2026-04-04 — Rediseño completo index.html V7 (10 fases) | 7 |
| §2 | 2026-04-04 — Correcciones post-rediseño | 25 |
| §3 | 2026-04-04 — Consolidación ticker + trust strip | 44 |
| §4 | 2026-04-04 — Limpieza de código muerto (V7) | 62 |
| §5 | 2026-04-04 — Iconos diferenciados en ticker | 77 |
| §6 | 2026-04-04 — Rediseño completo del header (desktop + mobile) | 87 |
| §7 | 2026-04-04 — Rediseño completo sección Servicios | 119 |
| §8 | 2026-04-04 — Header V2: simetría desktop | 153 |
| §9 | 2026-04-04 — Fix crítico mobile menu | 165 |
| §10 | 2026-04-04 — Mobile menu V3: contraste y legibilidad | 176 |
| §11 | 2026-04-05 — Fix: touch scroll bloqueado | 195 |
| §12 | 2026-04-05 — Fix V2: auditoría profunda touch scroll | 205 |
| §13 | 2026-04-14 — Fix bugs admin overwrite + real-time sync | 217 |
| §14 | 2026-04-15 — Rename label "Claridad" → "Calidad" | 227 |
| §15 | 2026-04-15 — Unificación de fondo Journal / About / CTA | 233 |
| §16 | 2026-04-15 — Fix false version-conflict al borrar imagen | 239 |
| §17 | 2026-04-15 — Lookbook V7: mejoras móvil | 245 |
| §18 | 2026-04-15 — Lookbook V7: anti-flash + intento de centrado | 251 |
| §19 | 2026-04-15 — Lookbook V7: centrado tapa/contratapa | 256 |
| §20 | 2026-04-15 — Lookbook V7: sincronización de shift | 261 |
| §21 | 2026-04-15 — Lookbook V7: stuck at page 2 fix | 266 |
| §22 | 2026-04-16 — Lookbook V7: eliminar gap residual | 272 |
| §23 | 2026-04-16 — Lookbook V7: spine strip | 277 |
| §24 | 2026-04-17 — Portfolio V5: Reconstrucción sin StPageFlip | 282 |
| §25 | 2026-04-18 — Portfolio V9: smart adaptive fit | 290 |
| §26 | 2026-04-18 — Revert: eliminar adaptive fit | 296 |
| §27 | 2026-04-18 — Featured V3: Variant C (Asimétrico) | 301 |
| §28 | 2026-04-18 — Featured V3.1: fix badge y contraste | 306 |
| §29 | 2026-04-19 — RECONSTRUCCIÓN LÍQUIDO & CRISTAL (Phases A-G) | 311 |
| §30 | 2026-04-27 — ITERACIÓN POST-LAUNCH (Fases 11-18) | 332 |
| §31 | 2026-04-28 — POLISH SESSION (Fases 19-21 + Items 1-2 + Session 3) | 347 |
| §32 | 2026-06-03 — Optimización de Rendimiento (PERF-01 y PERF-02) | 359 |
| §33 | 2026-06-03 — Mejoras Estéticas Premium (Estilo iOS y Rediseño de Panel Admin) | 369 |
| §34 | 2026-06-03 — Diseño Ultra-Premium, Composición Espacial y Copywriting Editorial | 381 |
| §35 | 2026-06-03 — SEO, Tracking, Optimización AVIF y Rediseño Premium de Autor en Admin | 393 |
| §36 | 2026-06-03 — Ajuste de Hero y Optimización de Velocidad de Carga (Imágenes WebP/AVIF) | 410 |
| §37 | 2026-06-05 — Upgrade del cerebro neuronal a template v1.0.0 | 420 |
| §38 | 2026-06-05 — Curación post-upgrade: dedup de skills + reconciliación inventario | 439 |
| §39 | 2026-06-05 — Auditoría de instalación de skills + auto-detección (catalogación) | 452 |
| §40 | 2026-06-05 — Rediseño Fase 1 (mirror): shell + Home + Nosotros + Contacto + dock Atajos | 469 |
| §41 | 2026-06-05 — Fase 1 pulido: auditoría visual + 3 fixes doctrina (transition/radii/#000) | 488 |
| §42 | 2026-06-06 — CRM Fase 3 · Bloque 1: rol vendedora + reglas RBAC cuentas por cobrar + endurecimiento adversarial | 507 |
| §43 | 2026-06-06 — CRM Fase 3 · Bloque 2: Cloud Function `recalcSaldoCliente` (saldo server-side) + modelo de signo | 526 |
| §44 | 2026-06-06 — CRM Fase 3 · Bloque 3: Panel de Kary (primera UI — Cuentas, ficha, bandeja, cumpleaños, config) | 545 |
| §45 | 2026-06-06 — CRM Fase 3 · Bloque 4: App de vendedora responsive (mis clientes, ficha, factura/abono, solicitar corrección) | 564 |
| §46 | 2026-06-06 — CRM Fase 3 · Verificación E2E (emuladores) + fix login (lastLogin best-effort) | 583 |
| §47 | 2026-06-06 — CRM Fase 3 · LANZAMIENTO a prod: deploy (reglas+functions) + migración Fase A (344 clientes de Kary) | 600 |
| §48 | 2026-06-06 — Mantenimiento · Upgrade runtime Cloud Functions (Node 20→22 + firebase-functions v6→v7) | 617 |
| §49 | 2026-06-06 — CRM Reestructura Fase R: vendedora = dato (no usuario) + CRM admin-only | 634 |
| §50 | 2026-06-07 — Panel v2 (mini-ERP): diseño maestro + Consejo Externo + F-CHASIS-A construido y desplegado | 651 |
| §51 | 2026-06-07 — F1+F2+slice F5: función de Morosos/Vencidos (aging de cartera) — en vivo, sin CF nueva | 668 |
| §52 | 2026-06-07 — F5 (slice): filtros/chips de la lista CxC (estado · mora · vendedora) | 685 |
| §53 | 2026-06-07 — F4-leads: Bandeja (pipeline de leads sobre `inquiries`) + convertir a cliente | 702 |
| §54 | 2026-06-08 — F6 inicio: App Check (código listo, rollout pendiente de consola) | 719 |
| §55 | 2026-06-08 — Mejoras al cerebro (TODO-16): Comité ×3 + Legal Colombia + Arquitecto + Workflows | 736 |
| §56 | 2026-06-09 — Cerebro multi-proyecto (canon): linter canónico + manifest + cerebros INDEPENDIENTES + kernel v1.1 | 763 |
| §57 | 2026-06-09 — Comité ×3 "Operación integral" (plan negocio+sistema → bóveda) + RCA App Check (403 en el canje) | 788 |
| §58 | 2026-06-09 — App Check REPARADO en vivo: API key restringida sin App Check API (API_KEY_SERVICE_BLOCKED) → 200 | 805 |
| §59 | 2026-06-09 — F6 frenos de gasto: forms públicos con forma exacta + push_tokens cerrado (51/51, desplegado) | 822 |
| §60 | 2026-06-09 — Backup diario automático de Firestore desplegado (PRE-1 parte 1; restore probado pendiente) | 839 |
| §61 | 2026-06-09 — GEMELO vivo: bersaglio-gemelo.web.app (Spark, aula+banco de pruebas+restore) — E2E verificado | 856 |
| §62 | 2026-06-09 — F6 cimientos: CI de reglas reactivado (TODO-10 ✅) + entero-COP en 3 capas (desplegado) | 873 |
| §63 | 2026-06-10 — PRE-1 CERRADO: restauración PROBADA (702/702 → gemelo, vista por Daniel) + copia fuera de cuenta | 890 |
| §64 | 2026-06-10 — F6 frente D: reconciliación de cartera + vista Salud (trigger blindado · reconciliacionDiaria · repararSaldo) | 907 |
| §65 | 2026-06-10 — F6 frente B: RBAC por custom claims (rol en el token) + hardening frontera users/ (anti escalada de rol) | 925 |
| §66 | 2026-06-10 — Seg: "Desactivar usuario" bloquea acceso (CF deshabilita Auth + active check) + reglas users/ owner-only | 943 |
| §67 | 2026-06-10 — CI de reglas REPARADO: emulador Firestore exige Java 21 (era 17) + pin firebase-tools; post-mortem de §62 | 961 |
| §68 | 2026-06-10 — F6 CERRADO: alerta visible de truncado (spec §9.1); paginación GATED a materializar aging (banner = gate) | 977 |
| §69 | 2026-06-10 — FASE M diseñada (Comité ×3, 33 agentes): plan v3 → bóveda fase-m-plan.md; M0-H hotfix + tren M2a/M2b/M3 | 995 |
| §70 | 2026-06-10 — Fase M: M0-H desplegado + M0 ejecutado (config/cartera sembrada owner-only · calibración: cero histórico → tope provisional · preguntas 1-5 disparadas) | 1009 |
| §71 | 2026-06-10 — Preguntas 1-5 respondidas (SLA 48h grabado · delegación de experto · rol contador futuro) + M0-C panel Parámetros owner-only; tren M2/M3 desbloqueado | 1025 |
| §72 | 2026-06-10 — M1 red-team adversarial (W-01, 22 agentes → 0 bloqueantes/0 m1-bugs) + fix contrato motivoRechazo↔estado (99/99); 4 forward-risk-m2b diferidos; deploy reglas M1 pendiente OK Daniel | 1037 |
| §73 | 2026-06-10 — M2a-1b: ensanche aditivo de anulacionValida (motivoCategoria+corregidoPor) + par atómico corregirMovimientoBatch; red-team W-01 0 bloqueantes; 100/100; DESPLEGADO | 1055 |
| §74 | 2026-06-10 — Contrato solicitud de corrección (workflow 5 agentes → SÓLIDO: monto=delta neto, datosCorreccion={reemplazo,snapshotOriginal,motivoCategoria}) + UI "Corregir movimiento" M2a-3 + efectoSaldo compartido (22/22) | 1073 |
| §75 | 2026-06-10 — Verificación EXPERTA de la UI de M2a (12 agentes; reemplaza smoke de Kary) → 3 bugs de dinero (2 bloqueantes: ajuste duplicado, asiento $0) corregidos + go-live | 1091 |
| §76 | 2026-06-11 — M2b: superficie de aprobación de Daniel (cola en Salud, re-validación §74, batches atómicos) + SoD owner = excepción consciente + verif. experta 16 agentes (7 fixes; plan M3 enmendado) + cache v11 | 1103 |
| §77 | 2026-06-12 — M3: el CANDADO (Consejo Externo Gemini + censo 344 docs + red-team 16 agentes → 2 bloqueos corregidos; 133/133) + forward-compat UI v12; CERRADO EN PROD mismo día (77.8: smoke 4/4) | 1123 |
| §78 | 2026-06-12 — M4 EN PROD: detectores (11/11) + acta/cortes (reglas+CF DESPLEGADAS, paridad byte-idéntica 3/3) + UI v13 + verif. experta 22 agentes (12 fixes; BLOQUEANTE rollover setMonth del acta); CERRADO mismo día (78.8: PR #232 + v13 vivo por fetch; 1er corte real = 1 jul) | 1143 |
| §79 | 2026-06-12 — M5 gestiones de cobro (UI del expediente; reglas vivas desde M1): módulo puro espejo + timeline/modal en ficha + UI v14 + verif. experta 13 agentes (9 fixes; offline anti-duplicado) + deferido size() a próximo deploy de reglas; CERRADO mismo día (79.8: PR #233 + v14 vivo por fetch) | 1163 |
| §80 | 2026-06-12 — M6 acuerdo de pago POR DEUDA (directiva Daniel; resuelve pregunta 1): vencimiento efectivo en aging (paridad 3/3) + herencia condicional en correcciones + UI v15 + detector acuerdosLargos + verif. experta 16 agentes (12 fixes); CERRADO mismo día (80.8: PR #234 + v15 vivo; directiva asesores → 50 §5) | 1183 |
---

| §81 | 2026-06-12 — ACUERDOS de pago / plan de cuotas: diseño v2 (Consejo Externo Gemini demolió la v1) + build R1-R5 [OPUS-4.8 interino]: mutex `acuerdoVigenteId` (cierra jineteo) · solo saldo · escudo de 2 estados · `acuerdoAlCorte` cristalizado; GATEADO/inerte (`acuerdosActivos` off); rules 144/144; PENDIENTE R6 (deploy + bandera + verif. por hito) | 1203 |
| §82 | 2026-06-15 — AUTO-AUDITORÍA semántica Nivel-2 del cerebro (1ª con artefacto): 8 sondas + verificación adversarial → 20 hallazgos (H-01 `05`=="main" FALSO, cazado ×5 sondas · H-06 gate SSoT inerte/ningún gate lee git · H-11/H-12 memoria stale); GC de 05/10, `ssotFacts` vivo, memorias corregidas, deepAudit re-sellado [OPUS-4.8] | 1223 |
| §83 | 2026-06-19 — CMS P4 Nosotros editable: motor field-type `list` (add/quitar/reordenar; `reindexItemSf` PURO) en el singleton + MODELO PLANO 12 claves (2ª opinión Gemini adoptada: eliminado grab-bag `cartagena`, migración cero pre-prod) + headers editables (decisión B) + guards anti poison-pill + cap reglas `siteListOk` 24 + imágenes (hero/atelier/fotos equipo, field-type image). EN PROD (core); imágenes pendiente merge. 25 CMS + 169 reglas + revisión adversarial 9 ag. [OPUS-4.8] | 1241 |
| §84 | 2026-06-19 — CMS web pública, cierre de fase visual (consolidación GC): WYSIWYG F1 preview-fiel + F2 clic-para-editar (RCA sandbox→viewport 0px; iframe 1440 escalado; sticky 100dvh) · P3.5 field-type `image` (avif + fix storage.rules) · F3 barandas (dirty + "Publicado ✓" + beforeunload + confirm cambio de pestaña) · `global` datos de contacto FUENTE ÚNICA (whatsapp/email/instagram una vez en `global.contacto`; footer+Contacto derivan vía waHref/igHref; corrige WhatsApp falso duplicado en 6 archivos). EN PROD salvo global-inc2 (pendiente merge). [OPUS-4.8] | 1259 |
| §85 | 2026-06-19 — CMS global inc3: wa.me del negocio horneados → derivan de `global.contacto` (waHref) en wishlist·lista-deseos·carrito·FAQ·quick-dock. Migración-cero. inc2 en main (PR #265). build+35 tests+preview. `f757b25`. [OPUS-4.8] | 1277 |
| §86 | 2026-06-20 — CMS global inc4: páginas legales (Términos/Privacidad, incl. responsable Ley 1581) derivan de `global.contacto` vía tokens {{EMAIL}}/{{WA}} pre-escape (byte-idéntico, XSS-safe). build+preview. `26bf8f8` (PR #266/#267 prod). [OPUS-4.8] | 1298 |
| §87 | 2026-06-20 — ACUERDOS R6 fix bug A8 (dinero): `pagado` acotado por D0 (deuda al pacto = replay FIFO de SOLO créditos post-pacto) → un abono pre-pacto ya no oculta cuotas vencidas. js/+functions byte; test A8 + fixtures. Verif: suite verde + red-team 6 áng. EJECUTADO 0 hallazgos. R6 desbloqueado (gated; encender=Daniel, baja urgencia por reset). `55bc8ef`. [OPUS-4.8] | 1316 |
| §88 | 2026-06-20 — CMS cero-ficción Fase B (cierre TODO-24 → **índice 100% cero-ficción**): SSoT umbrales/completitud (`home-sections.js`) · panel Videos/Redes (`select`) · PUERTA reglas (filmValid/socialValid + journalValid endurecido + `nonEmptyStr.trim()`) · defensa en profundidad (render re-filtra) · UX Kary (¿Se ve?·Estado de tu web·confirmación) · barrera #5. Adendas: href Redes + Destacadas hide-when-empty. Review 4 ag. (HIGH+MED corregidos). EN PROD: v18 (PR #272) + reglas desplegadas+verificadas (censo 0); resta merge cliente. SW v20. [OPUS-4.8] | 1334 |
| §89 | 2026-06-21 — BUG Categorías no aparecía al crear la 1ª colección: `renderCategories` devolvía '' sin datos (1er paint siempre sin datos) → sección nunca en DOM → `refreshCategories` no la creaba. Fix: render monta SIEMPRE el `<section>` + refresh `mount()` (patrón films/journal, L-42) + CSS `:empty` colapsa dinámicas vacías a 0px. Verificado en navegador. SW v21 · `6b327a0`, pendiente merge. [OPUS-4.8] | 1362 |
| §90 | 2026-06-21 — Capacidad CAZA-BUGS (TODO-25): reflejo barato del camino vivo desde estado-cero (las 2 fronteras vacío→1 / N→vacío) + escalada calibrada 2 niveles (cita §3.7/§G.2, no redefine) + skill portátil `caza-bugs` + **gate estado-cero generalizado a las 5 secciones del home** (L-42). Panel adversarial 9 ag. recortó la sobre-ingeniería. `§G` cross-repo → cars (TODO-26); shard 30→31 → TODO-27. [OPUS-4.8] | 1380 |
| §91 | 2026-06-21 — Consejo Externo: corrección factual "el modelo externo vía Antigravity SÍ ve el código (solo-lectura), como Claude Code" + skill comité Paso 5 (byte-idéntico ×4, sha `48a5e2f6`). Propagación de cars §224. Límite NUNCA-edita INTACTO. [OPUS-4.8] | 1407 |
| §92 | 2026-06-22 — Guardián del índice (cars TODO-32) evaluado y **N/A aquí** (headers fecha-leading, sin anclaje §N → 0 reconcilia = falsa cobertura); el check #3 ya vigila el drift; tombstone = convención manual. Matriz ×4 → cars §229. [OPUS-4.8] | 1416 |
| §93 | 2026-06-22 — Sprint perf + UX móvil: `.bj-lite` por capacidad (header blur/aurora/blobs/dock off en equipos modestos; capaces idénticos) · carga fluida del index (RESERVAR alto NO skeleton + `isReady(sección)` real + watchdog 8s + 3 estados + cap 6 colecciones centradas) · fix del flash en catálogo/pieza/journal/lista-deseos (readiness real) · `scrollRestoration` manual · header auto-oculto + iconos a la derecha en móvil · 3 bugs móvil (franja blanca `100lvh` / espacio hero / touch dock). Comité ×3 blindado + Gemini. EN MAIN (PRs #289-292). Detalle → `45` PERF-04/05. [OPUS-4.8] | 1426 |
| §94 | 2026-06-22 — Fuentes: Google Fonts de listas de pesos discretas → **sintaxis de rango** (`..`) = una fuente VARIABLE por familia. Cobertura de pesos IDÉNTICA (cero cambio visual), pero `@font-face` 72→25, CSS 28→10 KB, woff2 descargados ~14→6 (Cormorant 6→2, Manrope 5→1). Cierra el pendiente "fuentes" de §93.7/PERF-04/05. Verif. `document.fonts` + curl. 24 HTML (públicos+admin); SW sin bump (cross-origin). Código `f926eca`. [OPUS-4.8] | 1438 |
| §95 | 2026-06-22 — Admin: **bloquear borrado de colección con piezas asociadas** (F5/TODO-28, decisión comité). `handleDelete` con guard de integridad referencial: si la colección tiene piezas (conteo defensivo `slug‖id`), avisa y NO borra; solo borra vacías. Botón atenuado + title cuando hay piezas. Guard en UI (reglas no cuentan cross-colección). Evita piezas huérfanas en el sitio público. Código `2de1397`. [OPUS-4.8] | 1450 |
| §96 | 2026-06-22 — Cerebro: **shard `30-LECCIONES` → `31-LECCIONES-FIRESTORE`** (TODO-27 ✅). 11 lecciones backend (Firestore/CF/reglas) movidas al detalle en `31`; en `30` quedan stubs de 1 línea (`30`: 44k→32.6k chars). **Descubrimiento**: el kernel lee `### L-NN` solo de `30` → el stub-header DEBE quedar en `30`; multi-archivo real = cambio de kernel (cars-operador, M-06). Neurogénesis completa + brain:check sano. [OPUS-4.8] | 1462 |
| §97 | 2026-06-22 — Cerebro: **2ª auditoría semántica Nivel-2** (skill `auditoria-cerebro`, acotada: 2 subagentes read-only + sondas directas). 3 hallazgos: **HA-01** estado git stale en `05`/`10` (REINCIDE H-01; corregido — `origin/main`=`cee5a85`, §94/95 ya en main, gate-git TODO-22 ausente) · HA-02→TODO-29 (deuda kernel multi-archivo) · HA-03 menor. S3 retrieval 🟢 4/4 directo (shard mejoró ruteo). Refutado adversarial #5 (check #11). GC pareado BOOT −873c. CRUDO→bóveda. [OPUS-4.8] | 1474 |
| §98 | 2026-06-22 — CRM: **listeners con re-suscripción robusta** (F2 colas mudas, TODO-28✅). `subscribeWithRetry` (sprint perf §93) extraído a módulo NEUTRAL `js/core/live-query.js` → el CRM lo reusa sin acoplarse al público (charter §3, DRY). +param `onUiError` aditivo (avisa Y re-suscribe). 18 listeners convertidos. Antes: 10 morían mudos, 8 avisaban pero congelados (L-40). Código `856f913`. [OPUS-4.8] | 1486 |
| §99 | 2026-06-22 — **Bug Daniel: flash de imagen en Nosotros** al cambiar la portada (vieja→nueva). RCA: doble-paint (defaults/memoria → doc real de Firestore) pinta una imagen provisional; §93/PERF-05 dejó Nosotros fuera (válido para texto, no imágenes). Fix: gate `_siteReady` — no pintar `<img>` provisional, fondo reservado hasta confirmar. Verif. navegador (sin img provisional); flash real → Daniel en prod. Pendiente extender a Contacto/Home. Código `0850847`. **⚠️ SUPERSEDED por §100 (RCA errada).** [OPUS-4.8] | 1498 |
| §100 | 2026-06-23 — **Cero-demo en multimedia (corrige RCA del §99)**. El flash NO era doble-paint: era un FONDO CSS demo horneado (`.abt-hero-image-bg { background:url(earrings) }`); `_siteReady`/`withoutImages` del §99 lo empeoraba. RCA verificada en navegador REAL (Playwright, sitio vivo descargaba earrings.avif). Fix: 3 fondos CSS demo (earrings/ring/model) + `FALLBACK_IMG` de categorías → superficie de marca (gradiente, cero-ficción); maquinaria §99 revertida; móvil `.abt-hero-image` 1×2→340×425 (+width:100%). Conservados: banner-hero/gema (marca). Cache v22. Código `36da485`. [OPUS-4.8] | 1511 |

> Mantener este índice sincronizado: cuando se agregue un ADR §57+ al historial,
> añadir su fila aquí con la línea de inicio (`Select-String` o `grep`).
