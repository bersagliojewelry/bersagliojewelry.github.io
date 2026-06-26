# Arquitectura y Credenciales (Dashboard y Seguridad)

Este documento detalla el funcionamiento del Dashboard y el modelo de seguridad por capas en el ecosistema Wompi.

## 1. El Dashboard de Wompi

El Dashboard es un **cliente administrativo** (Frontend Administrativo) y NO el motor transaccional.

**Lo que SÍ hace:**
- Configurar el comercio (ej. URL de Webhooks).
- Gestionar credenciales (llaves y secretos).
- Consultar transacciones, eventos y reportes.
- Administrar usuarios y roles (si aplica).

**Lo que NO hace:**
- NO procesa pagos ni tarjetas.
- NO valida firmas ni ejecuta antifraude.
- NO sustituye la lógica de negocio de la aplicación.

> **Principio de Diseño:** La API procesa. Los Webhooks notifican. El Dashboard administra. Cada componente tiene una responsabilidad distinta y está fuertemente desacoplado.

## 2. Los Dos Ambientes

Wompi tiene dos entornos aislados. NUNCA se deben mezclar llaves ni URLs entre ellos.
- **Sandbox:** Entorno de pruebas (dinero ficticio, prefijos `_test_`).
- **Producción:** Entorno real (dinero real, prefijos `_prod_`).

## 3. Filosofía de Seguridad por Capas

El modelo de seguridad de Wompi no depende de una sola credencial, sino que responde a diferentes problemas mediante capas:

1. **Identidad (¿Quién eres?):** Resuelto por la *Public Key*. Identifica al comercio.
2. **Autenticación y Autorización (¿Qué puedes hacer?):** Resuelto por la *Private Key*. Demuestra posesión y autoriza operaciones privilegiadas en la API.
3. **Integridad (¿Cómo sé que no modificaste los datos?):** Resuelto por el *Integrity Secret* (Firma de Integridad). Garantiza que montos y referencias no fueron alterados al crear la transacción.
4. **Autenticidad de Eventos (¿Cómo sé que el Webhook es real?):** Resuelto por el *Events Secret*. Firma criptográfica para validar eventos asíncronos.

> **Principio de Menor Privilegio:** Cada credencial tiene únicamente los permisos necesarios para cumplir su función. NUNCA reutilices llaves para propósitos incorrectos.

## 4. Las 4 Credenciales Principales en Detalle

### A. Public Key (Llave Pública)
- **Prefijos:** `pub_test_`, `pub_prod_`
- **Uso:** Identificación pública (Principalmente en el **Frontend**).
- **Endpoint asociado:** `GET /merchants/{public_key}` (Para obtener información del comercio y el Acceptance Token).
- **Propósito:** Tokenización de tarjetas, obtención del Acceptance Token, consulta de instituciones financieras (PSE), Widget y Web Checkout. 
- **Límites:** NO autoriza operaciones privilegiadas ni llamadas a la API que requieran autenticación, NO firma webhooks, NO genera integridad.

### B. Private Key (Llave Privada)
- **Prefijos:** `prv_test_`, `prv_prod_`
- **Uso:** Autenticación y Autorización API exclusivamente en el **Backend** (`Authorization: Bearer ...`).
- **Propósito:** Creación de transacciones (`POST /transactions`), devoluciones, y operaciones privilegiadas. 
- **Seguridad:** NUNCA debe publicarse, guardarse en apps móviles, ni enviarse al frontend. Su compromiso permite a terceros crear transacciones a nombre del comercio.

### C. Events Secret (Secreto de Eventos)
- **Prefijos:** `test_events_`, `prod_events_`
- **Uso:** Validación de Webhooks (Eventos Asíncronos) en el Backend.
- **Propósito:** Verificar que el Webhook (`transaction.updated`) realmente fue enviado por Wompi mediante la comparación del checksum (SHA-256). **NO** sirve para autenticar llamadas.

### D. Integrity Secret (Secreto de Integridad)
- **Prefijos:** `test_integrity_`, `prod_integrity_`
- **Uso:** Firma de Integridad en el Backend al momento de crear una transacción.
- **Propósito:** Generar un hash SHA-256 para enviarlo en el campo `signature` al hacer el `POST /transactions`, asegurando que los datos sensibles (monto, moneda, referencia) no fueron alterados por el usuario desde el navegador.

## 5. Acceptance Tokens (Tokens de Aceptación — son DOS)
- No son "llaves", sino **tokens temporales** que expiran.
- Ambos se obtienen de la **misma** respuesta de `GET /merchants/{public_key}` (con la llave pública), y cada uno expone además un permalink al PDF del contrato que debe presentarse al usuario:
  1. **`presigned_acceptance.acceptance_token`** → se envía en el body como **`acceptance_token`** (aceptación de TyC / política de privacidad).
  2. **`presigned_personal_data_auth.acceptance_token`** → se envía en el body como **`accept_personal_auth`** (autorización del tratamiento de datos personales).
- **Propósito:** Registrar la aceptación expresa del usuario. Cuando se involucran datos personales, **ambos** son obligatorios al crear una transacción (`POST /transactions`) o una fuente de pago (`POST /payment_sources`), por la Ley de Habeas Data (Ley 1581) de Colombia.
