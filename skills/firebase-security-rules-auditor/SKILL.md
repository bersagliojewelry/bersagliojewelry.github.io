---
name: firebase-security-rules-auditor
description: >-
  Audits Firebase (Firestore, Cloud Storage) security rules for vulnerabilities, privilege escalation, role bypasses, create vs update inconsistencies, resource exhaustion, type safety, size limits, and hasOnly ownership checks. Use when auditing/reviewing rules, running red-team rule assessments, or scoring against auditor checklists. Don't use for Firebase CLI (login, deploy), Auth, Crashlytics, Remote Config, or database queries. Disparadores en español — "audita las reglas de Firestore/Storage", "revisa `firestore.rules` / `storage.rules` / `database.rules.json`", "¿estas reglas son seguras?", "red-team de las security rules", "antes de tocar las reglas".
metadata:
  category: CloudSecurity
actualizada: 2026-09-03
reglas: 16
lecciones: [BERS:L-16, BERS:L-30, BERS:L-59, CARS:L-41, G:G-001, G:G-004, INMO:L-08, INMO:L-20, INMO:L-42, INMO:L-44, INMO:L-61]
origen: firebase/agent-skills@a0b4e143
---

> **⚠️ VENDORIZADA 2026-09-03 (C4-6 · DICTAMEN-C4 §10 D-C4-27)** del repo **`firebase/agent-skills`**
> (org `firebase`, `owner.type: Organization`; ruta `skills/firebase-security-rules-auditor/SKILL.md`,
> rama `main`, commit **`a0b4e143`**, 3.848 B; **Apache-2.0**; consultado el **2026-09-03**).
> **Propiedad verificada por el lado documental, no por un badge**: `api.github.com/orgs/firebase` devuelve
> `is_verified: false`, así que la prueba es que la **documentación oficial de Firebase**, servida desde
> `firebase.google.com/docs/ai-assistance/agent-skills`, apunta a ese repositorio y publica su comando de
> instalación (`npx skills add firebase/agent-skills`). **NUNCA escribas `firebase/skills`**: es el nombre
> viejo y responde por redirect (`full_name: firebase/agent-skills`) — un `origen:` con él envejece mal.
> **Discrepancia declarada, no resuelta**: la doc oficial lista **14** skills y la llama
> `firestore-security-rules-auditor`; el árbol del repo tiene **12** y la llama
> `firebase-security-rules-auditor`. Se conserva lo MEDIDO por API (el repo).
>
> **NO entra por marketplace**, aunque así se actualizaría sola: el `marketplace.json` de ese repo declara
> **UN** plugin (`firebase`) que es el plugin COMPLETO («deploy & host apps»). Cambiar superficie de
> ESCRITURA sobre el proyecto de producción a cambio de la comodidad de refrescar 4 KB de texto es mal
> negocio. La rutina `skills-upstream` (60 días) cubre de sobra su frescura.
>
> **Riesgo de ejecución: NULO y medido.** Un solo `SKILL.md`, sin `scripts/`, sin `references/`, sin
> binarios; el frontmatter no declara `allowed-tools` y no pide Bash, red ni credenciales; su propia
> `description` excluye el CLI de Firebase. El «BAJO-MEDIO por dejarle el CLI» que estimó C4-5 **no existe
> en el fichero**. Lo que sí tiene es riesgo de JUICIO, y por eso va delante la capa de abajo.
>
> **Capa ALTORRA obligatoria**: español al hablar · el free-tier Blaze es sagrado (una `get()` dentro de una
> regla **se factura aunque la petición se deniegue**) · nada que mueva dinero ni despliegue nada desde una
> sesión · la salida se consolida como ADR + lección, no como JSON.

# 🔒 Capa ALTORRA — la vara que la fuente NO trae (léela ANTES del cuerpo)

**Su punto ciego es estructural: audita el TEXTO de las reglas y nunca pregunta si ese texto está vivo.**
Sin esta capa, esta skill vale **menos aquí que en cualquier otro sitio**, porque su punto ciego es justo
donde este portafolio ya pagó. Los 10 puntos van con procedencia por línea; ninguno es opcional.

0. **¿Está DESPLEGADO?** Antes de auditar una línea, el testigo va **FUERA** del fichero: un ruleset en el
   repo no es un ruleset en producción, y un comentario que dice «verificado contra producción» tiene fecha
   y caduca. Mide el efecto desde fuera (petición real con la `apiKey` pública, que es pública por diseño) o
   declara la auditoría **condicionada**. Un sello que solo se compara consigo mismo no mide nada
   ([[G:G-001]], [[INMO:L-42]], [[INMO:L-61]], `docs/39-ESCRITO-NO-ES-VIGENTE.md`).
1. **App Check en toda regla pública.** Una regla abierta sin App Check no distingue a tu web de un script:
   el free-tier lo paga igual. Cuenta las superficies de `create` público antes de dar por buena ninguna
   ([[BERS:L-30]]).
2. **Campo ausente ⇒ `.get(campo, defecto)`.** Leer `resource.data.x` directo falla CERRADO, que no es un
   agujero pero sí el día en que un documento de semilla o antiguo se vuelve **ineditable**. La disciplina se
   aplica ENTERA o no se aplica ([[INMO:L-08]], [[BERS:L-59]]).
3. **403 ≠ 404.** `resource == null` deniega: distingue «no existe» de «no puedes», y no confundas el
   síntoma del cliente con el veredicto de la regla ([[INMO:L-20]]).
4. **Un ruleset se REEMPLAZA, no se fusiona.** Desplegar reglas sustituye el fichero entero: dos ficheros
   parciales no se suman, el último gana. La skill de origen **no lo menciona en ningún punto** de su
   checklist ([[INMO:L-44]]).
5. **Censo de escritores en las DOS direcciones.** La conocida —«cierro esta regla → ¿a quién rompo?»
   ([[CARS:L-41]])— y la simétrica, que es la que se olvida: **«esta regla está abierta → ¿le queda algún
   escritor vivo?»**. Retirar el cliente NO cierra la regla.
6. **`hasOnly()` solo protege el PRIMER nivel.** Los mapas anidados siguen siendo relleno libre: acota
   dentro de ellos o el `hasOnly` es una promesa a medias ([[BERS:L-16]] dice qué hace `hasOnly`; esto dice
   **dónde deja de llegar**).
7. **Una regla `create` pública paga también el trigger y el proveedor de correo.** Si un `onDocumentCreated`
   cuelga de esa colección, cada escritura anónima es **1 invocación de Function + 1 correo**: el vector deja
   de ser cuota y pasa a ser **factura y reputación del dominio de envío**.
8. **Su cláusula del admin por email: ⛔ derogada aquí** (DICTAMEN-C4 §10 D-C4-27; ver el bloque «Admin
   Bootstrapping & Privileges» del cuerpo). La fuente dice que un admin *hardcodeado por email* no debe
   penalizar la nota si hay `email_verified`. **Nuestra doctrina es estrictamente superior**: claims
   sincronizados por Function, `usuarios` con `write: if false`, permisos que jamás salen de datos que manda
   el cliente. Se conserva la línea de la fuente visible —no se borra historia— pero **no se obedece**: aquí
   un admin por email es un hallazgo, no una excepción.
9. **El `score` 1-5 y el JSON son formato de ENTREGA, jamás sustituto de la consolidación.** La memoria come
   ADR + lección + fila en el índice (§G.3/§2), no JSON. Y un «3/5» con un hallazgo crítico abierto es
   exactamente el ✅ que documenta `docs/38-GATES-QUE-MIENTEN.md`: sospecha del instrumento antes que de los
   datos ([[G:G-004]]).

**Regla de cierre de la capa**: si no puedes contestar el punto 0, la salida NO es «score N/5» — es
«auditoría del TEXTO, despliegue sin verificar», dicho en la primera línea del informe.

---

# Cuerpo VENDORIZADO (verbatim de la fuente, Apache-2.0)

# Overview

This skill acts as an auditor for Firebase Security Rules, evaluating them
against a rigorous set of criteria to ensure they are secure, robust, and
correctly implemented.

# Scoring Criteria

## Assessment: Security Validator (Red Team Edition)

You are a Senior Security Auditor and Penetration Tester specializing in
Firestore. Your goal is to find "the hole in the wall." Do not assume a rule is
secure because it looks complex; instead, actively try to find a sequence of
operations to bypass it.

### Mandatory Audit Checklist:

1. **The Update Bypass:** Compare 'create' and 'update' rules. Can a user create
   a valid document and then 'update' it into an invalid or malicious state
   (e.g., changing their role, bypassing size limits, or corrupting data types)?
1. **Authority Source:** Does the security rely on user-provided data
   (request.resource.data) for sensitive fields like 'role', 'isAdmin', or
   'ownerId'? Carefully consider the source for that authority.
1. **Business Logic vs. Rules:** Does the rule set actually support the app's
   purpose? (e.g., In a collaboration app, can collaborators actually read the
   data? If not, the rules are "broken" or will force insecure workarounds).
1. **Storage Abuse:** Are there string length or array size limits? If not,
   label it as a "Resource Exhaustion/DoS" risk.
1. **Type Safety:** Are fields checked with 'is string', 'is int', or 'is
   timestamp'?
1. **Field-Level vs. Identity-Level Security:** Be careful with rules that use
   `hasOnly()` or `diff()`. While these restrict *which* fields can be
   updated, they do NOT restrict *who* can update them unless an ownership check
   (e.g., `resource.data.uid == request.auth.uid`) is also present. If a rule
   allows any authenticated user to update fields on another user's document
   without a corresponding ownership check, it is a data integrity
   vulnerability.

### Admin Bootstrapping & Privileges:

The admin bootstrapping process is limited in this app. If the rules use a
single hardcoded admin email (e.g., checking request.auth.token.email ==
'admin@example.com'), this should NOT count against the score as long as:

- email_verified is also checked (request.auth.token.email_verified == true).
- It is implemented in a way that does not allow additional admins to add
  themselves or leave an escalation risk open.

> ⛔ **derogada aquí** — punto 8 de la Capa ALTORRA (DICTAMEN-C4 §10 D-C4-27). La línea se conserva
> visible porque no se borra historia; **no se obedece**. Un admin hardcodeado por email es un hallazgo,
> no una excepción, cuando existe la vía de claims sincronizados por Function.

### Scoring Criteria (1-5):

- **1 (Critical):** Unauthorized data access (leaks), privilege escalation, or
  total validation bypass.
- **2 (Major):** Broken business logic, self-assigned roles, bypass of controls.
- **3 (Moderate):** PII exposure (e.g., public emails), Inconsistent validation
  (create vs update) on critical fields
- **4 (Minor):** Problems that result in self-data corruption like update
  bypasses that only impact the user's own data, lack of size limits, missing
  minor type checks or over-permissive read access on non-sensitive fields.
- **5 (Secure):** Comprehensive validation, strict ownership, and role-based
  access via secure ACLs.

Return your assessment in JSON format using the following structure: { "score":
1-5, "summary": "overall assessment", "findings": [ { "check": "checklist
item", "severity": "critical|major|moderate|minor", "issue": "description",
"recommendation": "fix" } ] }

---

## Cómo se entrega aquí (no lo dice la fuente)

- El JSON de arriba es el **formato de trabajo**. La entrega al cerebro es: hallazgo con **fichero:línea**,
  severidad, y la propuesta **como texto de reglas** — nunca un despliegue.
- Reglas de seguridad **no se tocan sin IAP** (§3.4): archivos a modificar · archivos INTACTOS verificados ·
  riesgos · rollback · cómo se verifica que quedó desplegado (punto 0).
- Lo que no se pueda cerrar en solo lectura se declara abierto **con su método de cierre escrito**, no se
  redondea a un número.

> **[HONOR]** — sin gate de linter: ningún check mecánico puede saber si corriste los 10 puntos de la capa
> antes de dar una nota. Se cumple por honor, y el punto 0 es el que no se salta.
