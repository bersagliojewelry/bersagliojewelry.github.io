# 🔐 41 — SEGURIDAD (lóbulo hijo de `40-LOBULOS-DOMINIO`)

> **Trigger 🔵 (Auditoría/Dominio).** Nace de la auditoría de seguridad + escalabilidad
> del 2026-06-05 (arranque del programa "Nuevo Bersaglio"). Es el **backlog de Fase 2
> (Hardening)**: hallazgos verificados con evidencia (file:line) + arreglo propuesto.
> Madre: `docs/40-LOBULOS-DOMINIO.md`. Estado vivo/flags → `docs/05-ESTADO-GLOBAL.md`.
>
> **Skills de apoyo (Fase 2/3)**: comando `security-review`, `accessibility-audit`,
> `ecommerce` (DIAN/PSE/Wompi para el CRM-facturación de Fase 3), `crm-architect`.

---

## 0. Resumen ejecutivo
La arquitectura **frontend ya es modular y sana** (vanilla ESM, sin monolitos). Los riesgos
reales viven en **backend (reglas Firebase) + secretos + escalabilidad de listeners**. Nada
de esto bloquea el rediseño (Fase 1), pero **debe resolverse antes de crecer en tráfico/datos**.

## 1. Hallazgos rankeados (evidencia verificada)

| # | Sev | Hallazgo | Evidencia | Arreglo |
|---|---|---|---|---|
| S1 | 🟠 Alto (corr. 2026-06-05) | **Fallback hardcodeado** de llaves Firebase. ⚠️ Corrección verificada: el `.env` **NO está versionado** (`git log --all -- .env` vacío; ignorado en `.gitignore:3`) — la suposición original "`.env` commiteado" era **falsa**. Las API keys web de Firebase **no son secretas por diseño** (viajan en el bundle cliente igual; identifican el proyecto, no autorizan datos). | `js/firebase-config.js:21-27` (`apiKey: import.meta.env... \|\| 'AIzaSy...'`) | (1) Restringir la API key en GCP (HTTP referrer al dominio) · (2) **App Check** (reCAPTCHA) = barrera real contra abuso/quota · (3) reglas S2/S5/S6 · (4) quitar el fallback (que `.env`/CI sea la única fuente). Rotación = opcional (no hubo fuga a git); BFG/filter-repo **innecesario** (nada que purgar). |
| S2 | 🟠 Alto | **Storage rules**: `allow create,update: if request.auth != null` (sin rol) | `storage.rules` | Exigir `request.auth.token.role in ['admin','editor']` (custom claims) + validar existencia del doc. |
| S3 | 🟠 Alto | **Escalabilidad**: `onSnapshot` admin sobre colección completa, sin `limit`/cursor/unsubscribe | `js/firestore-service.js` (onPiecesChange / onInquiriesChange) | `query(..., limit(500))` + paginación por cursor (`startAfter`) + `unsubscribe` al salir. |
| S4 | 🟠 Alto | **Roles leídos en cada regla** (`get(users/$uid)`) → coste/latencia ×N | `firestore.rules` `getUserRole()` | Migrar rol a **custom claims** (set por Cloud Function al cambiar rol); leer `request.auth.token.role`. |
| S5 | 🟡 Medio | **Reseñas no-aprobadas leíbles** (regla `read: if true`, filtro solo cliente) | `firestore.rules` (reviews) | `allow read: if resource.data.approved == true`. |
| S6 | 🟡 Medio | **Sin validación server-side** de campos (name/code/slug) | `firestore.rules` (pieces/collections) | Reglas `validate`: tipos + `size()>0` en create/update. |
| S7 | 🟡 Medio | Sin verificación de email al crear usuario | `functions/index.js` createUser | Verificación de email o estado "suspendido" hasta confirmar. |
| S8 | 🔵 Bajo | Sin headers de seguridad (CSP, X-Frame-Options) en hosting | `firebase.json` | Añadir headers; CSP compatible con Firebase + GA. |

## 1.5 Progreso Fase 2 (2026-06-05, sesión "continua")
Grounding verificado contra el código → **3 correcciones** al backlog original:
- ✅ **CI inyecta los 7 `VITE_*`** en build (`.github/workflows/deploy.yml:28-35`) → quitar el fallback es seguro.
- ⚠️ **S8 corregido**: el sitio se sirve por **GitHub Pages** (no Firebase Hosting; `deploy.yml` usa `upload-pages-artifact`/`deploy-pages`), así que los `headers` de `firebase.json` **NO se envían**. CSP debe ir en `<meta http-equiv>` en los shells HTML.
- 🔗 **S2 depende de S4**: roles solo en `users/{uid}.data.role` (sin custom claims en `functions/`) → cada regla hace `get()`. Storage role-check necesita S4 (claims) o `firestore.get()` en `storage.rules`.

Estado de hallazgos:
- **S1** — ✅ *código*: fallback eliminado (`firebase-config.js`, env única fuente + guard). ⏳ *cliente/Tier C*: restringir API key (GCP) + App Check. Rotación innecesaria.
- **S3** — ✅ `limit(500)` en `onPiecesChange` + `onInquiriesChange` (sin cambio a escala actual). Futuro: `orderBy`+cursor en pieces; `unsubscribe` al salir = responsabilidad del callsite (auditar admin).
- **S5** — ✅ regla endurecida (`allow read: if approved==true || isAdmin()`) + test en `tests/firestore-rules.test.mjs`. Verificación = **CI** (`firestore-rules-test.yml`); pendiente push para green. Deploy gated.
- **S2/S4/S6/S7/S8** — pendientes (Tier B reglas: S6 con CI+deploy gated; Tier C: S4 claims, S2 storage, S7 email-verify, App Check, CSP `<meta>`).

> 🧪 **Harness de testing de reglas (CI, 2026-06-05)**: `@firebase/rules-unit-testing` + `tests/firestore-rules.test.mjs` (node:test) + `.github/workflows/firestore-rules-test.yml` (setup-java + `emulators:exec`). Toda regla nueva se verifica en CI antes de `firebase-deploy.yml`. Local necesita JDK (no instalado) → `30 §L-12`.

## 2. Escalabilidad (cuello de botella real)
- **Listeners admin sin límite** (S3): a ~1k+ piezas, cada cambio reenvía toda la colección.
  Paginar + cursores + unsubscribe es la prioridad de escala.
- **Lecturas de rol por regla** (S4): custom claims elimina el coste por-operación.
- Público (pieces/collections) está OK (read directo, cacheable).

## 3. Orden sugerido de Fase 2
1. **S1** (re-caracterizado 2026-06-05: **NO urgente** — no hubo fuga a git; foco real = App Check + restricción de key + quitar fallback).
2. **S2 + S5 + S6** (reglas: rol en storage, reviews approved, validate de campos).
3. **S4** (custom claims) + ajustar `firestore.rules` para usar el claim.
4. **S3** (paginación de listeners admin).
5. **S7 / S8** (email verify, headers).

> **Nota de gobernanza**: S1 (sacar `.env` del historial) y cualquier cambio de reglas
> en producción son **decisiones caras de revertir** → considerar Consejo Externo (`docs/15`)
> y, para reglas, probar en emulador antes de desplegar. El admin panel y `firestore-service.js`
> NO se tocaron en Fase 1 (regla NO-TOCAR del rediseño).
