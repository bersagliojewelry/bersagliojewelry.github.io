# ⚡ 10 — MEMORIA A CORTO PLAZO (WIP / Sprint activo)

> **Nodo neuronal: Memoria a Corto Plazo** (auto-carga con `CLAUDE.md` + `05`). Solo lo VIVO:
> foco, pendientes (TODO-NN = ledger único), bitácora efímera. Estado técnico → `05`.
> **Pizarra, no archivo**: al cerrar tarea → ADR en `99` + fila en `00`, lecciones a `30`, podar (GC §G.4).

---

## 🎯 Foco actual

> 🎉 **CRM en producción** (ADR §47/§49): 344 clientes de Kary (cartera $506.510.780), `recalcSaldoCliente` viva, CRM admin-only (vendedoras = entidad de datos). **Panel v2 desplegado**: F-CHASIS-A §50 · Morosos §51 · F5 filtros §52 · F4 Bandeja §53. **Cerebro**: kernel multi-proyecto ADR §56 (v1.1 ×3, cerebros independientes); GC de este repo HECHO 2026-06-09 (comité v6 ítem H).
>
> **▶️ ESTADO — tren M0→M4 EN PROD (§78.8) · M5 CONSTRUIDO (§79, falta PR)**: gestiones de cobro en la ficha (UI v14; reglas vivas desde M1 sin cambios; verif. experta 13 agentes, 9 fixes). **Para cerrar M5**: PR `Desarrollo→main` (Daniel) → verificar v14 + sección por fetch → marcar §79.8. Kary prueba TODO al final (directiva 2026-06-12).
> - **Vigilancia M4**: 1er corte real = **1 de julio 03:50 Bogotá** → verificar `cortes/2026-06` ese día (respaldo: callable `generarCorte`).
> - **Deferido al PRÓXIMO deploy de reglas** (verif. M5): `size()` en `nota`/`soporte` de `gestionValida` + validadores hermanos (`solicitudValida`, `asientoValido`) — hoy sin tope server-side en docs inmutables.
> - **Siguiente**: M6 espera respuesta de Kary (plazo 30 ó 90 días) · M7 necesita gestiones acumuladas (M5 lo destrabó) · M2c pulido · B6 reportes · TODO-19 RBAC.
> - **Vivo aparte**: TODO-20 correo del owner (riesgo activo) · TODO-14 App Check ×7d→Enforce (Daniel, L-32) · DIAN PAUSADA · Vendedoras fuera de Configuración · pendientes Daniel/Kary en bóveda.
>
> **Decisiones vivas (Panel v2/morosos)**: plazo 30 días (config) · `fecha` en movimientos (migrados=CUTOFF; sin fecha→ámbar) · VENCIDO día 1 · rangos 1-30/31-60/+60. Norte: spec `2026-06-07-bersaglio-arquitectura-maestra-design.md` v3.
> **Pendiente operativo**: crear vendedoras reales (Daniel/Kary).
>
> ⚠️ **Deploy (L-22 + L-26)**: reglas/functions = deploy manual mío; sitio + merge a `main` = PR que mergea Daniel (`git fetch` siempre). Admin SDK = ADC (L-23).

---

## 📋 Pendientes abiertos (TODO-NN) — ledger único

| ID | Item | Estado | Bloqueo |
|---|---|---|---|
| TODO-03 | (Opcional) headers de `99` a formato numerado `## NN.` (hoy por fecha, válido) | 🔲 | baja prioridad |
| TODO-04 | (Opcional) anomalías 🔧 en `skills/` (skill-creator anidado; code-simplifier/modernization formatos no-skill) | 🔲 | baja prioridad |
| TODO-07 | **Contenido real**: reseñas Google Maps (Nosotros), Films, feed Redes (`js/data/home-media.js`, `js/pages/nosotros.js`) | 🔲 | cliente entrega datos |
| TODO-08 | **Fase 2 Hardening**: Tier A ✅; pendiente CSP/reglas/claims (Tier B/C) → bóveda `41-SEGURIDAD §1.5` | 🟡 | Tier B = emulador+deploy gated |
| TODO-09 | **Fase M**: tren M0→M4 ✅ EN PROD (§78.8; 1er corte real 1 jul) · **M5 construido (§79, falta PR)**. Restan M2c (pulido) · M6 (espera plazo de Kary) · M7 (necesita gestiones acumuladas) + B6. **Directiva Daniel 2026-06-12: Kary prueba TODO al final; verificación por slice = experta de Claude** | 🟡 | PR de M5 (Daniel) |
| TODO-14 | **App Check: reparar el registro** (RCA 403 §57.3: llave SECRETA en consola) → ~100% ×7d → enforce | 🟡 | Daniel (consolas, guiado) |
| TODO-17 | **Toda captura → CRM**: contacto→Bandeja ✅; falta newsletter (`addSubscription`→`subscriptions`) en el panel | 🔲 | tras App Check |
| TODO-18 | **Plan operación integral §57**: semana 1 día a día · 9 decisiones de Daniel · compuerta de adopción · campaña cartera (diseño del contador ANTES del piloto) → bóveda | 🟡 | Daniel (decisiones 1-9 + contador) |
| TODO-19 | **RBAC por dependencias/roles granulares** (directiva Daniel 2026-06-11): usuarios administrativo/contable, comercial/asistente de ventas… controlar qué ve y maneja cada uno → `50-ARQUITECTURA §5` | 🔲 | post-Fase M; Decisión Fuerte (matriz de permisos + Consejo) |
| TODO-20 | **Migrar correo del usuario OWNER** al personal de Daniel (hoy = correo de la empresa → riesgo de recuperación de clave por terceros) → bóveda `41-SEGURIDAD §1.7` | 🟡 | Daniel da su correo personal (~15 min guiados) |

> ✅ Cerrados y consolidados (retirados en el GC 2026-06-09): TODO-01/02→§38 · 05→§47 · 06→`e290f83` · **10→§62** (CI reactivado; activo al subir/mergear) · 11→spec §16 · 12→§50 · 13→§51 · **15→§63 (PRE-1 CERRADO: backup+restore PROBADO+copia fuera)** · 16→§55 · settings.local→`e3d390f`.

---

## 🔮 Contexto estratégico
Programa "Nuevo Bersaglio": Fase 1 rediseño ✅ · Fase 2 hardening (Tier A/B ✅, C pendiente) · Fase 3 CRM ✅ en prod · **Fase M: tren M0→M4 ✅ EN PROD (candado + auditoría detectiva operando)** (charter `50-ARQUITECTURA`, plan `fase-m-plan.md`). SW `bersaglio-v13`. Horizonte: M2c/M5-M7 → reportes/aging B6 → (futuro) inventario/facturación + RBAC dependencias (TODO-19).

---

## 📝 Bitácora (efímera)

> Podada (GC) 2026-06-12. Todo consolidado: **ADR §37-§77** — CRM/Fase R/Panel v2/morosos (§37-§56) · F6 + operación integral (§57-§68) · **Fase M completa hasta el candado: M0→M2a (§69-§75) · M2b (§76, guion 5/5 en prod) · M3 (§77, Consejo Gemini + red-team + smoke 4/4)**. Lecciones L-38/L-39/L-40. Herramientas: `seed-guion-m2b.mjs` · `censo-movimientos-m3.mjs` · `limpiar-cliente-prueba.mjs`. Detalle de cualquier § → `00-INDICE` → `99`.
>
> **2026-06-12 (noche) · M4 CONSTRUIDO COMPLETO** → **ADR §78** (todo el detalle ahí; CRUDO de la verif. 22-agentes en bóveda).
> **2026-06-12 · M4 CERRADO (§78.8)**: PR #232 mergeado por Daniel; v13 + sección Cartera + aviso SLA + chunk `crm-auditoria` verificados VIVOS por fetch. Vigilar 1er corte real (1 jul). Oferta de `/schedule` para esa verificación: Daniel dijo "después lo vemos".
> **2026-06-12 · M5 CONSTRUIDO** → **ADR §79** (elegido sobre M2c por time-leverage: el reloj de meses distintos de M7 solo corre con gestiones registrables). Verif. experta 13 agentes → 9 fixes aplicados + 1 deferido a reglas (CRUDO en bóveda). Tests 14/14 + suites + build verdes.
