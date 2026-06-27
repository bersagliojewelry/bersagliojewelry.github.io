# 00 — ÍNDICE SINÁPTICO (mapa § → línea del Historial ADR)

> **Nodo neuronal: Índice sináptico.** Mapa § → línea de
> `docs/99-HISTORIAL-ADR.md`. Es la tabla de contenidos del
> nodo de Largo Plazo. Se consulta on-demand (Trigger de Error/Historia, ver
> `CLAUDE.md §G`).
>
> **Mapa de neuronas** (detalle de cada una → `CLAUDE.md §0`): `CLAUDE.md` · `05-ESTADO-GLOBAL` · `10-MEMORIA-CORTO-PLAZO` · `15-CONSEJO-EXTERNO` · `20-MEMORIA-ESPACIAL` · `30-LECCIONES` · `31-LECCIONES-FIRESTORE` (hija de 30) · `32-LECCIONES-CARGA` (hija de 30) · `40-LOBULOS-DOMINIO` · `50-ARQUITECTURA` · `60-WORKFLOWS` · este `00-INDICE` · `99-HISTORIAL-ADR` · `skills-inventory`.
>
> **Cómo usarlo (regla anti-saturación)**: busca aquí el § + su línea → `Read docs/99-HISTORIAL-ADR.md offset=<línea> limit=~150`. NUNCA leas el historial completo (satura al instante). Regenera el mapa: `grep -n "^## " docs/99-HISTORIAL-ADR.md` (o `Select-String`).

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
| §100 | 2026-06-23 — **Cero-demo multimedia (corrige RCA §99)**: el "flash" era un fondo CSS demo horneado (no doble-paint); 3 fondos demo→superficie de marca; móvil hero 340×425. v22. L-45. [OPUS-4.8] | 1511 |
| §101 | 2026-06-23 — **Proceso Decisión Fuerte — veredicto** (Gemini doble-ciego): Paso 7 endurecido a **GATE EMPÍRICO** ("Pruebas de Estado"; verificado jamás sobre análisis estático). Pipeline ya sólido = convergencia. [OPUS-4.8] | 1523 |
| §102 | 2026-06-23 — **Carga fluida: placeholder verde→neutro** (corrige UX §100): gradiente saturado se veía como pantalla de espera → neutro invisible (patrón `featured`) + bg-image inline. v23. L-46. [OPUS-4.8] | 1536 |
| §103 | 2026-06-23 — **Arquitectura carga "app-like" (DECISIÓN; impl. pendiente)**: router falso-SPA + caché-memoria + prefetch + Blurhash; CERO SWR/prerender. Comité×3+Gemini, GO Daniel. Faseado F1/F2. Decidir≠implementar (§101). [OPUS-4.8] | 1548 |
| §104 | 2026-06-23 — **§103 F1: LQIP "blur-up" CMS**: data-URI en campo compañero + render doble-fondo. LQIP>Blurhash-lib. Corrige §103.6 (reglas whitelistan solo secciones→campo interno sin tocar rules). +reparó test-rot §102 no-demo (M-07). 257/257+187/187, v24. L-47/L-48. [OPUS-4.8] | 1560 |
| §105 | 2026-06-23 — **Fix "zoom/asentamiento" en RECARGA** (Daniel): no era resize (caja medida estable); era la entrada `.reveal` replay en recarga (capa GPU rasteriza imgs). Fix sistémico `reveal.js` (`.reveal-static` asienta lo visible). L-49. [OPUS-4.8] | 1574 |
| §106 | 2026-06-23 — **REVERT render LQIP §104** (Daniel: "peor — vacío→borroso→nítido = 3 estados"): en MPA estático el LQIP llega con getDoc → suma estado. Revertido solo el render (→§102); fontanería conservada para F2. v26. L-50. [OPUS-4.8] | 1586 |
| §107 | 2026-06-23 — **F2.0: View Transitions cross-document** (Daniel "continuemos F2"): `@view-transition` global → cross-fade entre páginas, sin flash. Cero JS, degrada solo, respeta "sin caché". Hallazgo: handlers sin `destroy()` → router (F2.1) es refactor grande → VT primero. v27. L-51. [OPUS-4.8] | 1597 |
| §108 | 2026-06-23 — **F2.x "caché inteligente" (SWR nativo Firestore) — DIRECCIÓN + research; impl. vía WORKFLOW próxima sesión**. Idea de Daniel (caché fluida; update solo si CMS cambió) = SWR estándar (web.dev/Google), NATIVO en Firestore (`persistentLocalCache`+`onSnapshot` cache-first+`metadata.fromCache`)+**diff-gate** (re-pinta solo si cambió→sin parpadeo; respeta "ver cambios en vivo"). Arregla la imagen blanco→foto (lo que F2.1 NO) y quizá hace innecesario el router. **MANDATO Daniel**: workflow completo (proceso-decision-fuerte+comité+Gemini+skills+agentes, BOUNDED) para mitigar bugs ANTES de codear. **CONT. (§108.7-.12, 2026-06-23)**: workflow corrido (comité×5+Gemini doble-ciego → **4 bloqueantes cazados**: fallback feature-detect, caché SOLO-público para no contagiar el CRM, firma diff-gate anti-I1, gate mount+reveal) → GO 3 fases; **F1 implementada+verificada local** (`firebase-config.js`). **CONT.2 (§108.13-.16)**: hallazgo en vivo (caché OK, parpadeo solo en frío/Ctrl+Shift+R) → F3=LQIP (no cache-control) + umbral comercial MIN_FEATURED 3→1 + bug precio-null. L-52. [OPUS-4.8] | 1608 |
| §109 | 2026-06-23 — **InvalidStateError benigno de View Transitions (§107)**: rechazo no-manejado de la VT cross-document nativa al abortar en reload. Fix: guard `unhandledrejection` DIRIGIDO en `boot.js` (silencia SOLO ese error) + dedup `@view-transition`. RCA: no hay startViewTransition en JS. Verif. navegador real. [OPUS-4.8] | 1637 |
| §110 | 2026-06-23 — **Migración server-side** (`migrate-*.mjs`, Admin SDK+sharp): backfill LQIP + gotcha **ADC=altorra** (§110.3, no escribe prod bersaglio). [OPUS-4.8] | 1646 |
| §111 | 2026-06-23 — **LQIP en `siteContent` vía SWR** cache-first (diff-gate por version; resuelve §110.2). `f6ff72e`. [OPUS-4.8] | 1655 |
| §112 | 2026-06-23 — **Cache-Control en Storage** (blur cada visita): `_upload` max-age + backfill. → L-53. [OPUS-4.8] | 1668 |
| §113 | 2026-06-23 — **Correo OWNER → personal** (TODO-20): Admin SDK `updateUser`; owner=rol/uid. `cc42219`. [OPUS-4.8] | 1680 |
| §114 | 2026-06-24 — **3ª auditoría Nivel-2**: HA-01 git-stale ×3 → `05` ya no fija hash (M-08); L-54. [OPUS-4.8] | 1691 |
| §115 | 2026-06-24 — **RBAC rol "catálogo" Kary EN PROD** (TODO-19): solo Piezas+Colecciones; 4 fixes (L-55/56/57). rules 196. [OPUS-4.8] | 1703 |
| §116 | 2026-06-25 — **Programa de Visibilidad (TODO-35) EN PROD**: SSG + marca/Maps + GA4 encendido + Consent v2; GA/GSC config. [OPUS-4.8] | 1715 |
| §117 | 2026-06-25 — **Storage abre rol catálogo** (URGENTE): mirror `isCatalogo()` en `storage.rules`. LECCIÓN: rol = reflejar en TODO el contrato. `e300ff2`. [OPUS-4.8] | 1727 |
| §118 | 2026-06-25 — **Ficha "Carta Gemológica" + fixes demo (TODO-34) EN PROD**: buildSpecs agrupado, cero-demo, URLs limpias `pieceUrl`. v32. PR #356/#357. [OPUS-4.8] | 1739 |
| §119 | 2026-06-25 — **Grilla Flexbox + recos por contenido + GA4 (TODO-36) EN PROD** (W-11): balancedCols, título honesto, select_item arreglado. v33. PR #357/#358. [OPUS-4.8] | 1751 |
| §120 | 2026-06-25 — **Plan Comercio B0+B0.5 — WhatsApp directo (TODO-37) EN PROD** (PR #359): CTAs ficha → WhatsApp con la pieza escrita (`waLink`) + GA4 `whatsapp_click`; form = vía 2ª. v34. [OPUS-4.8] | 1763 |
| §121 | 2026-06-26 — **Catálogo de prueba EN PROD + decisiones del dueño**: 9 piezas prueba (`seedDemo:true`) vía Firebase MCP, verificadas en vivo. DECISIONES (no re-preguntar): pruebas en web real (excepción no-demo) · Wompi=cuenta Kary Persona Natural (NO PJ; aumento a 20 tx) · ADDI congelado. [OPUS-4.8] | 1775 |
| §122 | 2026-06-26 — **B1 paso 1: inventario en `pieces` EN PROD**: `stockType`/`cantidad`/`gender` vía `pieceClassValid` (type+enum); `estado`/`reserva*` diferidos al CF (seguridad). Reglas desplegadas · 201 tests. [OPUS-4.8] | 1787 |
| §123 | 2026-06-26 — **3 correcciones de Daniel**: form flotante en ficha (lead sin navegar) + 9 destacadas (guard máx 9) + canales debajo del form en contacto. v35. Gotcha dev: carrera `data.load`↔`onChange` (L-58). [OPUS-4.8] | 1799 |
| §124 | 2026-06-26 — **B1 paso 2: calculadora de precio por peso**: valor-gramo = INPUT de Kary (VARÍA, no config) → cotización CLIENT-SIDE (`calcularPrecio` puro + modal en Piezas). Recompute server-side → paso 3. 6 tests + build. v36. [OPUS-4.8] | 1810 |
| §125 | 2026-06-26 — **B1 paso 3 (backend): el pedido — `crearPedido` CF + candado de stock atómico**: único escritor de `pedidos`; `runTransaction` sobre el doc de la pieza = imposible doble venta; total recalculado server-side; snapshot inmutable; correlativo; idempotente por pedidoId. Reglas (`pieceStockLocked` CF-only + pedidos create:false) DESPLEGADAS · 206 rules + 6 integración. Núcleo testeable (`pedidos-core.js`). PEND: POS UI + deploy CF. [OPUS-4.8] | 1821 |
| §126 | 2026-06-26 — **B1 paso 3 (UI): POS "Mostrador"** (`admin-pos.html`+`pos.js`+`pedidos-service.js`): Kary elige pieza → precio fijo o por peso (`calcularPrecio` reusado) → medio → confirma → `crearPedido`. UI ESPEJA a la CF (total visible = cobrado); menú `role:catalogo`; idempotente (UUID). **CF `crearPedido` DESPLEGADA a prod**; build+6/6 integración verdes. v37. PEND: verif. en vivo tras merge Daniel. Caveat `price` USD/COP→TODO-38. [OPUS-4.8] | 1832 |
| §127 | 2026-06-26 — **Todo en COP (cero dólares)**: el cobro SIEMPRE fue en pesos (`format$` es-CO público + CF + POS); solo el RÓTULO del form de Piezas decía "Precio USD" (engañoso) → "Precio en pesos (COP)" + nota "nunca dólares". Regla del dueño: Bersaglio = 100% COP. Cierra TODO-38. v38. [OPUS-4.8] | 1844 |
| §128 | 2026-06-26 — **B1 paso 4a: confirmar pago ("vi la plata")**: CF `confirmarPago` (`confirmarPagoCore` testeable) `pago_por_verificar`→`pagado` + `confirmadoPor/En`; idempotente; solo la CF flipea (SoD). Botón "Confirmar pago" en Ventas recientes del POS. Build+9/9 integración; **CF DESPLEGADA a prod**. v39. PEND decisión 4b apartados→cartera (TODO-39). [OPUS-4.8] | 1853 |
| §129 | 2026-06-26 — **B1 paso 5: anular venta (VOID) + cierre de caja (arqueo Z)**: `anularPedido` (marca anulado append-only + REINTEGRA pieza vendida→disponible; idempotente) + `cierreCaja` (conteo a ciegas: declara efectivo → suma pagados en efectivo del turno → descuadre; idempotente; anulados excluidos; colección `arqueo` CF-only). UI: 3 estados + botón Anular + modal Cerrar caja. 15/15 integración + 207/207 reglas; **DESPLEGADO a prod**. v40. [OPUS-4.8] | 1863 |
| §130 | 2026-06-26 — **B1 paso 6: bruto/neto + export al contador**: botón "Exportar contador" → CSV (bruto·comisión Wompi·ReteFuente·ReteICA·neto). `calcularNeto` PURO (`fiscal.js`), tasas PARAM-DRIVEN default "verificar" (no fabricar impuestos; el contador/Wompi confirman). Client-side, sin CF. 5/5 tests. v41. **Directiva: pruebas en vivo DIFERIDAS al final del plan+rediseño**. [OPUS-4.8] | 1874 |
| §131 | 2026-06-27 — **Inventario v3 (TODO-40 F1) DESPLEGADO a prod**: B4 admin (enum3+visibilidad+cantidad CF-only+ajustar/cambiar-tipo `98220b1`) + B5 SSG/cliente (filtra privadas+estado derivado+guard vacío `3545065`/`ba0b456`) + B6 coherencia. Activación: Daniel mergeó (#378/#379); 9 piezas de PRUEBA BORRADAS (clean slate, sin migración); reglas v3 + functions (`crearPedido` decremento + `ajustarStock`/`cambiarTipoPieza` nuevas) DESPLEGADAS; Pages re-deploy OK (catálogo vacío). 213/213 reglas. Pruebas en vivo DIFERIDAS. L-59. [OPUS-4.8] | 1884 |
| §132 | 2026-06-27 — **Carga masiva: 32 piezas reales de certificados TrueLab**: pipeline QR (`jsqr`+`sharp`) → scrape del SPA vía Chrome MCP (pushState, sin tocar credenciales) → clasificación de tipo por foto (montage) → carga vía MCP Firestore. Código=Nº reporte, Oro 18k, "Consultar precio", imágenes temporales del cert. 32/32 EN VIVO (grilla+ficha por fallback SPA). Pend: precios+imágenes (Daniel) + deploy para SEO. L-60. [OPUS-4.8] | 1895 |

> Mantener este índice sincronizado: cuando se agregue un ADR §57+ al historial,
> añadir su fila aquí con la línea de inicio (`Select-String` o `grep`).
