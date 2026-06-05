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
| S1 | 🔴 Crítico | `.env` con llaves Firebase reales versionado + **fallback hardcodeado** | `.env` · `js/firebase-config.js` (apiKey `... || 'AIza...'`) | Rotar llaves en consola Firebase (cliente) · sacar `.env` de git (BFG/filter-repo, **necesita pedido explícito**: reescribe historia) · `.gitignore` · quitar fallback. |
| S2 | 🟠 Alto | **Storage rules**: `allow create,update: if request.auth != null` (sin rol) | `storage.rules` | Exigir `request.auth.token.role in ['admin','editor']` (custom claims) + validar existencia del doc. |
| S3 | 🟠 Alto | **Escalabilidad**: `onSnapshot` admin sobre colección completa, sin `limit`/cursor/unsubscribe | `js/firestore-service.js` (onPiecesChange / onInquiriesChange) | `query(..., limit(500))` + paginación por cursor (`startAfter`) + `unsubscribe` al salir. |
| S4 | 🟠 Alto | **Roles leídos en cada regla** (`get(users/$uid)`) → coste/latencia ×N | `firestore.rules` `getUserRole()` | Migrar rol a **custom claims** (set por Cloud Function al cambiar rol); leer `request.auth.token.role`. |
| S5 | 🟡 Medio | **Reseñas no-aprobadas leíbles** (regla `read: if true`, filtro solo cliente) | `firestore.rules` (reviews) | `allow read: if resource.data.approved == true`. |
| S6 | 🟡 Medio | **Sin validación server-side** de campos (name/code/slug) | `firestore.rules` (pieces/collections) | Reglas `validate`: tipos + `size()>0` en create/update. |
| S7 | 🟡 Medio | Sin verificación de email al crear usuario | `functions/index.js` createUser | Verificación de email o estado "suspendido" hasta confirmar. |
| S8 | 🔵 Bajo | Sin headers de seguridad (CSP, X-Frame-Options) en hosting | `firebase.json` | Añadir headers; CSP compatible con Firebase + GA. |

## 2. Escalabilidad (cuello de botella real)
- **Listeners admin sin límite** (S3): a ~1k+ piezas, cada cambio reenvía toda la colección.
  Paginar + cursores + unsubscribe es la prioridad de escala.
- **Lecturas de rol por regla** (S4): custom claims elimina el coste por-operación.
- Público (pieces/collections) está OK (read directo, cacheable).

## 3. Orden sugerido de Fase 2
1. **S1** (urgente, barato salvo rotación de llaves del cliente).
2. **S2 + S5 + S6** (reglas: rol en storage, reviews approved, validate de campos).
3. **S4** (custom claims) + ajustar `firestore.rules` para usar el claim.
4. **S3** (paginación de listeners admin).
5. **S7 / S8** (email verify, headers).

> **Nota de gobernanza**: S1 (sacar `.env` del historial) y cualquier cambio de reglas
> en producción son **decisiones caras de revertir** → considerar Consejo Externo (`docs/15`)
> y, para reglas, probar en emulador antes de desplegar. El admin panel y `firestore-service.js`
> NO se tocaron en Fase 1 (regla NO-TOCAR del rediseño).
