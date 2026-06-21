# 🔐 41 — SEGURIDAD (lóbulo de dominio) — CONTENIDO PRIVADO

> **Este lóbulo fue movido a la bóveda privada** (decisión cross-repo ADR §174 de cars + consejo
> Gemini 2026-06-09: hallazgos de seguridad publicados = mapa para atacantes — clasificación RED).
>
> **Contenido completo (local + GitHub privado)**: `../brain-private/bersaglio/41-SEGURIDAD.md`
> (backlog de hardening Fase 2 con evidencia). El plan F6 también es privado:
> `../brain-private/bersaglio/f6-hardening-plan.md`.
>
> **Estado público-seguro**: App Check desplegado en modo monitor (falta enforcement guiado);
> hardening F6 en curso. Trigger 🔵 "audita seguridad" → leer la bóveda.
>
> **GitHub Secret Scanning (revisado 2026-06-21)**: 3 alertas "Google API Key" (2 en
> `firebase-config.js` = key web actual + una rotada en historial; 1 en `scripts/upload-to-firestore.mjs`
> ya borrado) = la **API key WEB de Firebase, PÚBLICA por diseño** (L-11/L-14). **NO es fuga**:
> verificado que `.env` está gitignored y NO hay service-account/`.pem`/`private_key` commiteado.
> Acción: cerrar las alertas como "won't fix" (Daniel). Hardening real ≠ esconder la key → **App
> Check enforce (TODO-14)** + confirmar restricción por dominio de la key.
>
> ⚠️ Las versiones previas persisten en el historial git público (riesgo residual aceptado, ADR §174 cars).
