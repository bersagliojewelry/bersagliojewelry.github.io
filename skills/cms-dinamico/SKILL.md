---
name: cms-dinamico
description: Usar al construir o EXTENDER un CMS donde el contenido de la web pública se administra desde un panel — migrar contenido HARDCODED a una base de datos (Firestore u otra), decidir singleton-vs-colección, reglas público-read/editor-write con validación tipada, cableado live-sync, scaffold de CRUD admin sin duplicar (anti-monolito), saneo de URLs (XSS), fallback elegante y SEO de contenido dinámico. Triggers: "CMS dinámico", "contenido administrable desde el panel", "migrar hardcoded a Firestore/base de datos", "hacer la web editable sin tocar código", "singleton vs colección".
actualizada: 2026-09-02
reglas: 11
lecciones: []
---

# 🧩 CMS dinámico — convertir contenido hardcoded en administrable

> Potencia al **arquitecto** (framework · backend · frontend a la vez) cuando un sitio debe
> volverse **editable desde un panel sin tocar código**. PORTABLE: cero rutas/§ de un repo
> concreto — adapta los patrones a la capa de datos del proyecto activo (lee su cerebro).
> Principio rector: **docs TIPADOS, NO un page-builder genérico** (anti-monolito).

## 0. Cuándo aplica
Migrar una sección hardcoded (textos, banners, listas, journal, videos, redes) a datos
administrables; diseñar el modelo de contenido; o extender un CMS existente. NO para lógica
de negocio sensible (eso es backend con su propio gating), ni edits triviales.

## 1. Árbol de decisión — SINGLETON vs COLECCIÓN
- **Singleton** (`siteContent/{page}`, 1 doc): contenido de BAJA escritura, por página/sección (textos de Home, Nosotros, footer). Costo = **1 lectura/página con `getDoc` one-shot** (NO listener live — ver §3).
- **Colección** (1 doc/item, como los productos): LISTA de N con vida propia, paginable/ordenable (journal, videos, posts de redes). Live `onSnapshot` con `limit(N)`.
- **REUTILIZAR antes de crear**: categorías/menús derivan de las colecciones existentes; "destacados" de un flag (`featured`) sobre los items que ya hay. No inventar colección nueva si una existente ya modela el dato.

## 2. Reglas de seguridad (backend) — plantilla literal
```
match /<contenido>/{id} {
  allow read:   if true;                       // contenido público por diseño
  allow create: if isEditor() && xCreateValid();
  allow update: if isEditor() && xTypesValid();
  allow delete: if isAdmin();                  // borrar contenido = acción admin auditada
}
```
- **`hasOnly` OBLIGATORIO** en cada colección pública (repo público = el atacante ve qué campo llega a href/src). Enumera los campos EXACTOS; **size-cap en TODO string**; **cero datos sensibles**.
- **Idioms-gotcha**: (a) campo opcional → `!('campo' in d) || d.campo is <tipo>` — acceder a un campo AUSENTE *lanza* error de evaluación (falla-cerrado en silencio); NO `d.campo == null`. (b) server-clock → `d.createdAt == request.time` (obliga serverTimestamp, bloquea fechas del cliente / denial-of-wallet).
- **Storage** (si suben imágenes/videos): restringe `contentType` (`image/.*` SIN `svg+xml` — el SVG es ejecutable) y `size`; videos en su propio path con cap.
- **SoD**: `editor` = contenido web; NINGUNA regla de negocio/CRM debe usar `isEditor()` (esas exigen admin/owner). Verifícalo.

## 3. Cableado live-sync (frontend) — 3 capas + coalesce
1. **Servicio** exporta `onXChange(cb) = onSnapshot(query(col, limit(N)), snap => cb(map))` y `createX/updateX` **transaccionales** (optimistic-lock por `_version` + audit log + señal de invalidación de caché).
2. **Capa de datos** suscribe en `load()`, guarda en memoria, y notifica **coalescido en un `requestAnimationFrame`** (avalancha de snapshots = UN render).
3. **Página** renderiza con skeleton/fallback → se re-suscribe al cambio con **refresh quirúrgico** (toca solo lo que cambió; evita image-flash).
- **EXCEPCIÓN de costo**: textos de baja escritura → `getDoc` one-shot, **NO listener** (cada `onSnapshot` es un listener persistente × visitante; mata el techo en free-tier). El refresco lo da la señal de caché.

## 4. Seguridad de URLs — `safeUrl()` OBLIGATORIO
`escape()`/HTML-encoding es **contexto-HTML**: NO neutraliza `javascript:`/`data:`/`vbscript:` ni breakouts de CSS `url()`. En CUALQUIER campo editable que entre a `href`/`src`: pásalo por `safeUrl(raw)` con **allow-list de esquema** (`http/https/mailto/tel` + relativos same-origin; quita whitespace/control). Para fondos: **`<img src=safeUrl()>` + `object-fit:cover`**, NUNCA interpolar en `style="background:url(...)"`.

## 5. Fallback elegante (cero downtime al migrar)
- **Singleton**: `getX() = merge({...DEFAULTS_HARDCODED, ...docOrEmpty})` campo-a-campo (un doc parcial NUNCA borra secciones).
- **Colección**: `getX() = docs.length ? docs : BAKED` (lista vacía degrada al array de bootstrap).
- Mantén el **safety-timeout del first paint** (el contenido nuevo NUNCA bloquea el primer render).
- **Testea el mapeo PURO** (datos→descriptores) en un módulo sin dependencias de red — es la verificación confiable cuando el preview headless no pinta dinámico.

## 6. Scaffold del admin — anti-monolito
Clonar el CRUD por sección = monolito por acreción. **Factoriza un motor `createResourceAdmin(descriptor)`** (tabla + modal + save con optimistic-lock + toasts) y `createTypedDoc/updateTypedDoc` genéricos; usa los recursos existentes (productos/colecciones) como cobayas en **refactor VERDE** ANTES de añadir secciones. Cada sección nueva = ~30 líneas de **descriptor** (el descriptor ES el tipo → siguen siendo docs tipados). Singleton = form → `setDoc(merge)`, sin tabla/id-gen.
- **UX/IA**: UN grupo "Contenido web" (role editor) con UNA página de pestañas internas, NO N páginas sueltas (evita el "menú plano"; menos shells que cachear).

## 7. SEO de contenido dinámico (sin tocar la palanca de indexación)
- Por cada tipo nuevo: JSON-LD (Article/Product/Breadcrumb), `title`/`meta`/`canonical` tras hidratar, sumarlo al **sitemap dinámico** (generado de los datos, no hardcoded).
- **Client-side puro NO basta para indexar** (el crawler recibe HTML vacío; `?id=` colapsa a una canónica; previews de redes rotas). Diseña **pre-render híbrido** (SSG del snapshot en CI + hidratación live) para las superficies SEO; client-side solo para no-SEO (carrito, drawers, panel).
- **El flip `noindex`→`index` es Decisión Fuerte gated** (contenido real + rutas-path + pre-render + robots/sitemap + Consejo Externo) — NO competencia de esta skill: deja todo listo, el arquitecto enciende.

## Checklist por sección migrada
modelo (singleton/colección decidido por el ARQUITECTO) · regla + `hasOnly` con idioms · getter/`onXChange` con fallback · CRUD admin (motor o form) · render público con refresh quirúrgico + `safeUrl` · test del mapeo puro + test de reglas (emulador) + build verde · cero datos sensibles · NO tocar indexación.
