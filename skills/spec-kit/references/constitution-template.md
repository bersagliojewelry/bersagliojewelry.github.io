# Constitución del proyecto: [NOMBRE]

> El "ADN arquitectónico": principios NO-negociables que TODA spec, plan y código deben cumplir.
> Derivada de github/spec-kit (MIT). Estable; enmendarla exige rationale + aprobación + evaluación
> de compatibilidad. `/analyze` valida los artefactos contra estos artículos.

**Versión**: 1.0.0 · **Ratificada**: <YYYY-MM-DD> · **Última enmienda**: <YYYY-MM-DD>

## Artículos núcleo (defaults fuertes de spec-kit — ajusta a tu contexto)

### Artículo I — Test-First (NO-NEGOCIABLE)
No se escribe código de implementación antes de: (1) tests escritos, (2) aprobados por el dueño,
(3) confirmados FALLANDO (rojo). Invierte el reflejo de la IA de "código primero".

### Artículo II — Simplicidad
Empezar con la estructura MÍNIMA (≤ N proyectos/módulos). Toda complejidad adicional se justifica
en "Complexity Tracking" del plan o no entra. YAGNI por defecto.

### Artículo III — Anti-abstracción
Usar las capacidades del framework DIRECTAMENTE; no envolver en abstracciones propias sin una
razón demostrada. Cada wrapper se gana su lugar.

### Artículo IV — Integración real
Preferir BD/servicios reales sobre mocks donde el riesgo lo amerite. Contract tests obligatorios
antes de implementar integraciones.

### Artículo V — Observabilidad
<Logs/telemetría/trazas mínimas que toda feature debe exponer.>

## Artículos del proyecto  *(los no-negociables PROPIOS — esto es lo que te diferencia)*

### Artículo VI — <Seguridad / privacidad>
<ej. Altorra: cero-fugas-de-leads · datos personales con consentimiento (Ley 1581) · texto legal
público solo con revisión de abogado.>

### Artículo VII — <Despliegue / cambio>
<ej. Altorra: Ocultar≠Borrar · run-paralelo hasta paridad · rollback por gate · deploy de
dinero/prod bajo doble-llave + staging.>

### Artículo VIII — <Versionado / compatibilidad>
<reglas de breaking changes, migraciones, deprecación.>

## Gobernanza
- **Precedencia**: ante conflicto, la constitución gana sobre conveniencia.
- **Enmienda**: propuesta con rationale → revisión del dueño/maintainers → evaluación de
  compatibilidad hacia atrás → bump de versión (semver: MAJOR=quita/redefine un artículo,
  MINOR=agrega, PATCH=aclara).
- **Cumplimiento**: `/analyze` y los gates de `/plan` verifican cada artículo; un ⚠️ se resuelve
  (simplificar) o se justifica explícitamente.
