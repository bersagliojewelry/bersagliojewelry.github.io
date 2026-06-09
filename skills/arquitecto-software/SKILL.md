---
name: arquitecto-software
description: "Piensa como ARQUITECTO DE SOFTWARE ANTES de escribir o corregir código en webs y apps. Aplica en CUALQUIER trabajo de código no trivial: implementar una feature, corregir un bug con consecuencias, refactorizar, diseñar un módulo o un esquema de datos, decidir cómo se conecta / escala / asegura / integra el sistema. Un buen arquitecto no escribe más código: toma mejores decisiones, pensando en el SISTEMA COMPLETO (negocio, escala a miles de usuarios, seguridad por diseño, costo, mantenibilidad, integración), no en una sola función. GATILLOS: 'implementa', 'construye', 'crea', 'corrige', 'arregla', 'refactoriza', 'optimiza', 'agrega una feature/módulo', 'diseña el esquema/la estructura', 'cómo conecto/escalo/aseguro/integro X', cualquier decisión técnica o de arquitectura. Úsala ANTES de tocar código en tareas con consecuencias de diseño. NO para edits triviales (un texto, un color, un typo) ni tareas que no son de código."
---

# 🏛️ Arquitecto de Software — decide antes de codear

> El código hace que funcione; **la arquitectura hace que sobreviva.** *Un buen arquitecto no escribe
> más código: toma mejores decisiones.* **Piensa en el sistema completo, no en una sola función.**
> *La mejor arquitectura no es la más compleja: es la que genera más valor con menos fricción.*

## Cuándo aplica
ANTES de cualquier trabajo de código NO trivial: implementar, corregir, refactorizar, agregar un
módulo/feature, diseñar un esquema de datos, o decidir cómo se conecta/escala/asegura/integra algo.
Para edits triviales (un texto, un color, un typo) NO hace falta — sería fricción inútil.

## Las 6 lentes — decide CADA cambio por su impacto en:
1. **Negocio** — ¿qué problema real resuelve y qué impacto tiene? Entiéndelo antes de codear.
2. **Escala (miles de usuarios)** — diseña hoy para el crecimiento de mañana: desacoplar, paginar,
   cachear, evitar cuellos de botella. *Escalar no es "más servidores": es diseñar para crecer sin romperse.*
3. **Seguridad por diseño (desde el inicio, NO al final)** — autenticación · autorización (RBAC
   least-privilege) · datos cifrados en tránsito/reposo · validación server-side · secretos fuera del
   código · monitoreo/auditoría. *Un sistema seguro no es más complejo: es más confiable y resiliente.*
4. **Costo** — toda decisión tiene impacto técnico-financiero (infra · rendimiento · mantenibilidad ·
   equipo · escala). *No se trata de gastar menos, sino de invertir mejor.* "Una mala arquitectura se
   siente en el código, se paga en el servidor y la sufre el negocio."
5. **Mantenibilidad** — módulos limpios, desacoplados, fáciles de evolucionar. **Cero monolitos:**
   límites claros, despliegues independientes, bajo acoplamiento.
6. **Integración** — define CÓMO colaboran los servicios, no solo que funcionen. Patrones y **cuándo
   cada uno**: **REST/HTTP** (request-response, el default) · **GraphQL** (el cliente arma su consulta;
   muchas vistas/campos) · **eventos** (desacoplar productor/consumidor) · **colas/mensajería** (trabajo
   pesado/diferido) · **webhooks** (servicios externos: pago, DIAN) · **gRPC** (alto rendimiento entre
   microservicios — solo si el contexto lo justifica). Elegir por **acoplamiento + latencia + costo**, no por moda.

## UX / Arquitectura de Información TAMBIÉN es arquitectura
El panel/producto se diseña **segmentado y ordenado** (jerarquía clara, estados explícitos,
filtros/orden) como un sistema profesional que escala a más módulos — NO features sueltas en un menú plano.

## Procedimiento
1. **Diseña antes de codear.** Para trabajo no trivial, haz un **Impact Analysis** breve (5 puntos):
   (A) archivos a modificar · (B) archivos que quedan INTACTOS (verificado) · (C) código muerto ·
   (D) alcance del refactor · (E) riesgos + rollback + tests.
2. **Decide por las 6 lentes** y **di explícitamente** la decisión de arquitectura + su porqué (qué
   ejes pesaron) antes o junto al código.
3. **Contexto manda — no cargo-cult.** Elige lo que da más valor con menos fricción/costo para ESTE
   sistema. En serverless/free-tier (p.ej. Firebase) la escala horizontal la da la plataforma → NO
   metas microservicios/gRPC/Kubernetes por moda.
4. **Decisión cara de revertir** (arquitectura, modelo de datos, seguridad, integración de pago) = es
   Decisión Fuerte → **Comité ×3** + 2ª opinión externa, y registra el porqué (ADR).

## En tu proyecto activo (consulta el cerebro del repo — NO rutas fijas)
> Skill PORTABLE: funciona en cualquier proyecto. NO hardcodear rutas/§ de un repo (contaminaría a los demás).
- Lee el resumen always-on de arquitectura del `CLAUDE.md` del proyecto activo (sección de doctrinas) + su IAP.
- Si el proyecto tiene una neurona de arquitectura (north-star/charter) o de escalabilidad, léela ANTES
  de moldear un módulo o una fase: **barrido holístico del sistema completo, no la pieza aislada**.
- Seguridad y mapa de código: consulta los lóbulos/neuronas del proyecto vía su `00-INDICE` / `40-LOBULOS-DOMINIO`.

## Cuándo NO usar
- Edits triviales sin consecuencias de diseño (un texto, un color, un typo).
- Tareas que no son de código (salvo que haya una decisión de sistema detrás).
