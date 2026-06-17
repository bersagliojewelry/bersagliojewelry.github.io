# Cuándo publicar (GO / NO-GO) — árbol ampliado y casos especiales

El checklist técnico responde "¿está bien construida?". Esta guía responde "¿es buen momento
para exponerla al público?". Son decisiones distintas.

## Árbol de decisión

```
¿El repo es privado/sensible y NO está pensado para ser público? ─ sí ─▶ NO-GO (no cambies la
        │ no                                                              visibilidad; publica
        │                                                                 solo el build)
¿Datos personales/de menores sin aviso ni consentimiento? ──────── sí ─▶ NO-GO (sanear primero)
        │ no
¿Secretos en el repo o en el historial de git? ──────────────────── sí ─▶ NO-GO (rotar + purgar)
        │ no
¿Clave de pago SECRETA en el front, o checkout sin probar en prod? ─ sí ─▶ NO-GO (e-commerce)
        │ no
¿API sensible al origen probada solo en localhost? ──────────────── sí ─▶ Reensayar en https/staging
        │ no
¿Evento crítico inminente que dependa del sitio? ────────────────── sí ─▶ Publicar con margen
        │ no                                                              (no la noche antes)
¿Hay plan de rollback? ──────────────────────────────────────────── no ─▶ Prepararlo antes del GO
        │ sí
Checklist técnico verde ─────────────────────────────────────────▶ GO + smoke test en dominio real
```

## Casos especiales

### 0. Repos privados/sensibles: NUNCA publicar lo que no debe ser público
Hay repos cuyo destino correcto es **permanecer privados para siempre** (bóveda de notas, monorepo
con credenciales de cliente, backend con secretos, borradores legales). Exponerlos es irreversible:
una vez indexados/clonados, asume que el contenido ya salió.
- **Antes de tocar la visibilidad**, confirma: *¿este repo está pensado para ser público?* Si no
  es un sí rotundo → **NO-GO**, déjalo privado.
- Verifica la visibilidad real, no la asumas: `gh repo view --json visibility -q .visibility`.
- Para sitios estáticos, **separa publicación de repo**: sirve solo la carpeta de salida
  (`dist/`/`public/`) sin hacer público todo el fuente. Revisa que ramas/tags/forks no filtren
  material sensible.
- Si un repo sensible ya estuvo público: privatízalo, **rota todo secreto** y, si hubo datos de
  terceros, evalúa obligación de notificación.

### A. Sitio estático vs. con backend
- **Estático** (HTML/CSS/JS, sin servidor): no hay `.env`, BD ni API keys en producción →
  **superficie de ataque mínima**. Varios puntos de "seguridad de servidor" no aplican, y eso es
  una **fortaleza** que conviene declarar. HTTPS es gratis y automático en GitHub Pages/Netlify/
  Vercel/Cloudflare Pages.
- **Con backend**: aplica TODO el frente de seguridad (gestión de secretos, CORS, rate limiting,
  validación de entrada, cabeceras, dependencias con CVEs, backups y rollback de BD). El backend
  es la superficie real de ataque.

### B. APIs del navegador sensibles al origen
`getUserMedia` (micrófono/cámara), geolocalización, portapapeles, notificaciones y service workers
**se comportan distinto en `localhost` que en `https`**:
- `localhost` se trata como contexto seguro aunque sea http; un dominio público **debe** ser `https`.
- Los **permisos** (el diálogo del navegador) y su persistencia cambian de origen a origen.
- **Regla:** si una demo se ensayó en `localhost`, **reensáyala en el dominio `https` real antes
  de depender de ella en público**. No asumas que "funcionaba en local" = "funcionará publicado".

### C. Datos personales y de menores
- Antes de exponer datos de personas (sobre todo **menores**): aviso de privacidad, base legal y
  **consentimiento** (de acudientes si son menores). Minimiza los datos recogidos.
- Verifica la **normativa que aplique** según la ubicación de los titulares: Colombia → **Ley 1581
  de 2012** y Decreto 1377 de 2013 (Art. 7: interés superior del menor + autorización del
  representante legal); UE → **GDPR Art. 8** (consentimiento parental por debajo de 16 años, mínimo
  13 según el Estado); etc.
- Sanea el repo: que no haya nombres, fotos ni audios de personas sin autorización, ni en los
  archivos ni en el historial. En **demos/jurados**, usa datos **ficticios o anonimizados**.

### D. E-commerce: no publiques con pagos rotos o claves expuestas
- **NO-GO** si hay una clave de pago **secreta** (`sk_live_…`, secretos de webhook) en el front,
  si el flujo de compra no se probó **en producción** (pago de prueba/sandbox), o si no hay HTTPS
  forzado. En el cliente solo va la clave **publicable** (`pk_…`).
- **GitHub Pages no aplica para tienda con pagos**: sus términos prohíben e-commerce/transacciones
  comerciales y enviar tarjetas. Usa Cloudflare Pages o Netlify (ver referencia de plataformas).

### E. No publiques la noche antes de un evento
- Publica con **margen** (días, no horas) para detectar y corregir problemas.
- Ten un **rollback** probado (volver a la versión anterior en minutos): en hosting estático suele
  ser revertir el commit/redeploy; con backend, suma rollback de datos/migraciones.
- Si el evento se hará en `localhost` y ya está ensayado allí, lo de menor riesgo es **presentar en
  local y publicar después** del evento.

### F. Smoke test post-deploy (siempre)
Tras el GO, en el **dominio real**:
1. Carga la home y las rutas críticas (HTTP 200, sin errores de consola).
2. Ejecuta la función estrella de punta a punta.
3. Revisa la pestaña de red: sin 404 ni recursos externos rotos; HTTPS sin "mixed content".
4. Comparte un enlace y revisa el **preview** (Open Graph) en WhatsApp/redes.

## Resumen
Publicar es una decisión de **gestión de riesgo**, no solo de checklist. Cuando dudes entre
"publico ya" y "espero", pregunta: *¿qué pasa si falla en vivo y quién lo ve?* Si la respuesta es
grave o irreversible, espera y reensaya.
