# F-CHASIS-A — Navegación v2 + design-system de dinero (presentación) · Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar la navegación plana duplicada en 8 HTML por un rail agrupado (IA "C") generado desde datos, y arreglar las dos quejas visibles (números desbordados, no se encuentra Vendedoras) — sin tocar el backend ni los datos.

**Architecture:** Una función pura `renderSidebar(navData, {role, activePage})` genera el HTML del rail desde un array `grupos→ítems` (gating por rol declarativo, placeholders "pronto"). Cada `admin*.html` deja un `<aside>` vacío que el módulo llena al init. Las quejas de dinero se resuelven con CSS (`adm-money` tabular-nums + `min-width:0`/`clamp` en stat-cards) y centralizando el color del saldo en tokens. Todo es reversible y sin migración de datos.

**Tech Stack:** Vanilla JS (ESM) + Vite, CSS con tokens `--adm-*`, tests con `node --test` (ya usado en `functions/` y `tests/`).

**Fuera de alcance (planes siguientes):** barra superior con búsqueda federada + Crear (Plan 2); integridad de lectura (unsubscribe + detector de truncado, Plan 2); endurecimiento de reglas/RBAC/App Check (Plan 3 backend); backfill Money ×100 (post-Consejo Externo). Spec maestro: [2026-06-07-bersaglio-arquitectura-maestra-design.md](../specs/2026-06-07-bersaglio-arquitectura-maestra-design.md).

---

## Estructura de archivos

- **Crear** `js/admin/sidebar-data.js` — el árbol de navegación como dato (grupos → ítems).
- **Crear** `js/admin/render-sidebar.js` — `renderSidebar()` puro (datos → HTML) + mapa de iconos. Sin imports de Firebase (testeable).
- **Crear** `tests/render-sidebar.test.mjs` — tests `node --test` de la función pura.
- **Modificar** `js/admin/shared.js` — `initSidebar()` monta `renderSidebar`, aplica gating por rol, link activo, badge, y cablea hamburguesa por delegación.
- **Modificar** los 8 `admin*.html` — reemplazar el bloque `<nav>` duplicado por un `<aside id="adm-sidebar">` que se llena por JS; quitar el script inline de hamburguesa.
- **Modificar** `css/admin.css` — estilo de placeholder "pronto", clase `.adm-money`, fix de desbordamiento en stat-cards, `nowrap` solo en numéricas.
- **Crear** `js/admin/saldo-format.js` — helper compartido `saldoClass(saldo)` (color por token, reemplaza hex hardcodeado).
- **Modificar** `js/admin/cuentas.js` y `js/admin/cuenta.js` — usar `saldoClass()` + `.adm-money`; añadir `#confirm-dialog` en `admin-cuenta.html`.

Añadir scripts a `package.json`: `"test:sidebar": "node --test tests/render-sidebar.test.mjs"`.

---

## Task 1: Datos de navegación + `renderSidebar()` puro (TDD)

**Files:**
- Create: `js/admin/sidebar-data.js`
- Create: `js/admin/render-sidebar.js`
- Test: `tests/render-sidebar.test.mjs`
- Modify: `package.json` (script `test:sidebar`)

- [ ] **Step 1: Escribir el test que falla**

Create `tests/render-sidebar.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderSidebar } from '../js/admin/render-sidebar.js';
import { NAV } from '../js/admin/sidebar-data.js';

test('renderiza grupos y labels', () => {
  const html = renderSidebar(NAV, { role: 'owner', activePage: 'admin.html' });
  assert.match(html, /adm-nav-label">CRM</);
  assert.match(html, /adm-nav-label">Cobranza</);
  assert.match(html, /adm-nav-label">Sistema</);
});

test('marca el link activo por filename', () => {
  const html = renderSidebar(NAV, { role: 'admin', activePage: 'admin-cuentas.html' });
  assert.match(html, /href="admin-cuentas\.html"[^>]*class="adm-nav-link is-active"/);
});

test('oculta Usuarios si el rol no es owner', () => {
  const adminHtml = renderSidebar(NAV, { role: 'admin', activePage: 'admin.html' });
  assert.doesNotMatch(adminHtml, /href="admin-usuarios\.html"/);
  const ownerHtml = renderSidebar(NAV, { role: 'owner', activePage: 'admin.html' });
  assert.match(ownerHtml, /href="admin-usuarios\.html"/);
});

test('placeholders futuros salen deshabilitados, sin href navegable', () => {
  const html = renderSidebar(NAV, { role: 'admin', activePage: 'admin.html' });
  assert.match(html, /Ventas<.*adm-nav-soon|adm-nav-link--soon[^>]*>[^<]*Ventas/s);
  assert.match(html, /aria-disabled="true"/);
});

test('conserva el badge de la Bandeja', () => {
  const html = renderSidebar(NAV, { role: 'admin', activePage: 'admin.html' });
  assert.match(html, /id="inq-badge"/);
});

test('Vendedoras es visible en la nav (grupo Sistema)', () => {
  const html = renderSidebar(NAV, { role: 'admin', activePage: 'admin.html' });
  assert.match(html, /Vendedoras/);
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npm run test:sidebar` (tras añadir el script en Step 4) — o `node --test tests/render-sidebar.test.mjs`
Expected: FAIL — `Cannot find module '../js/admin/render-sidebar.js'`.

- [ ] **Step 3: Crear los datos de navegación**

Create `js/admin/sidebar-data.js`:

```js
/**
 * Árbol de navegación del panel como DATO (IA "C").
 * Cada ítem: { label, href, icon, role, badgeId?, soon? }
 * role = rol MÍNIMO para ver el ítem ('editor' | 'admin' | 'owner').
 * Grupos con label === null = ítems sueltos (sin encabezado).
 */
export const NAV = [
  { label: null, items: [
    { label: 'Hoy', href: 'admin.html', icon: 'home', role: 'editor' },
  ]},
  { label: 'CRM', items: [
    { label: 'Clientes',  href: 'admin-cuentas.html',   icon: 'users',  role: 'admin' },
    { label: 'Bandeja',   href: 'admin-consultas.html', icon: 'inbox',  role: 'editor', badgeId: 'inq-badge' },
  ]},
  { label: 'Ventas', items: [
    { label: 'Ventas',   href: '#', icon: 'cart',    role: 'admin', soon: true },
    { label: 'Facturas', href: '#', icon: 'invoice', role: 'admin', soon: true },
  ]},
  { label: 'Cobranza', items: [
    { label: 'Cuentas por cobrar', href: '#', icon: 'card', role: 'admin', soon: true },
    { label: 'Pagos / Recibos',    href: '#', icon: 'receipt', role: 'admin', soon: true },
  ]},
  { label: 'Catálogo / Inventario', items: [
    { label: 'Piezas',      href: 'admin-piezas.html',      icon: 'gem',    role: 'editor' },
    { label: 'Colecciones', href: 'admin-colecciones.html', icon: 'layers', role: 'editor' },
    { label: 'Inventario',  href: '#', icon: 'box', role: 'admin', soon: true },
  ]},
  { label: 'Reportes', items: [
    { label: 'Reportes / KPIs', href: '#', icon: 'chart', role: 'admin', soon: true },
  ]},
  { label: 'Sistema', items: [
    { label: 'Vendedoras',    href: 'admin-config.html#vendedoras', icon: 'users',  role: 'admin' },
    { label: 'Usuarios',      href: 'admin-usuarios.html',          icon: 'shield', role: 'owner' },
    { label: 'Configuración', href: 'admin-config.html',            icon: 'gear',   role: 'admin' },
  ]},
];

// Ítem de pie (siempre visible, abre el sitio en nueva pestaña).
export const NAV_FOOTER = { label: 'Ver sitio', href: 'index.html', icon: 'external', target: '_blank' };
```

- [ ] **Step 4: Crear `renderSidebar()` puro + iconos + añadir script de test**

Create `js/admin/render-sidebar.js`:

```js
import { NAV_FOOTER } from './sidebar-data.js';

const ROLE_RANK = { editor: 1, admin: 2, owner: 3 };

const ICONS = {
  home:   '<path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"/>',
  users:  '<path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>',
  inbox:  '<path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clip-rule="evenodd"/>',
  cart:   '<path d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-2 4h12"/><circle cx="8" cy="18" r="1"/><circle cx="16" cy="18" r="1"/>',
  invoice:'<path d="M5 2h8l3 3v13H5z"/><path d="M8 8h6M8 11h6M8 14h4"/>',
  card:   '<path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/><path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9z" clip-rule="evenodd"/>',
  receipt:'<path d="M5 2h10v16l-2-1-2 1-3-1-3 1V2z"/><path d="M8 6h6M8 9h6M8 12h4"/>',
  gem:    '<path fill-rule="evenodd" d="M10 2L3 7l7 5 7-5-7-5zM3 13l7 5 7-5-7-5-7 5z" clip-rule="evenodd"/>',
  layers: '<path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm-2 4a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>',
  box:    '<path d="M3 6l7-3 7 3v8l-7 3-7-3z"/><path d="M3 6l7 3 7-3M10 9v8"/>',
  chart:  '<path d="M3 16V9M8 16V4M13 16v-5M18 16H2"/>',
  shield: '<path d="M10 2l6 3v5c0 4-3 6-6 8-3-2-6-4-6-8V5z"/>',
  gear:   '<path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.53 1.53 0 01-2.29.95c-1.37-.84-2.94.73-2.1 2.1a1.53 1.53 0 01-.95 2.29c-1.56.38-1.56 2.6 0 2.98a1.53 1.53 0 01.95 2.29c-.84 1.37.73 2.94 2.1 2.1a1.53 1.53 0 012.29.95c.38 1.56 2.6 1.56 2.98 0a1.53 1.53 0 012.29-.95c1.37.84 2.94-.73 2.1-2.1a1.53 1.53 0 01.95-2.29c1.56-.38 1.56-2.6 0-2.98a1.53 1.53 0 01-.95-2.29c.84-1.37-.73-2.94-2.1-2.1a1.53 1.53 0 01-2.29-.95zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>',
  external:'<path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>',
};

const svg = (key) =>
  `<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">${ICONS[key] || ''}</svg>`;

function canSee(itemRole, role) {
  return (ROLE_RANK[role] || 0) >= (ROLE_RANK[itemRole] || 1);
}

function linkHTML(item, activePage) {
  if (item.soon) {
    return `<span class="adm-nav-link adm-nav-link--soon" aria-disabled="true">`
      + `${svg(item.icon)}${item.label}<span class="adm-nav-soon-tag">pronto</span></span>`;
  }
  const active = item.href === activePage ? ' is-active' : '';
  const target = item.target ? ` target="${item.target}" rel="noopener"` : '';
  const badge  = item.badgeId ? `<span class="adm-nav-badge" id="${item.badgeId}" hidden></span>` : '';
  return `<a href="${item.href}" class="adm-nav-link${active}"${target}>${svg(item.icon)}${item.label}${badge}</a>`;
}

/**
 * Genera el HTML interno del rail (marca + nav agrupada + Ver sitio).
 * PURO: no toca el DOM ni Firebase. Lo monta initSidebar() en shared.js.
 * @param {Array}  nav         árbol de grupos (sidebar-data.js NAV)
 * @param {Object} opts        { role, activePage }
 * @returns {string} HTML
 */
export function renderSidebar(nav, { role = 'editor', activePage = 'admin.html' } = {}) {
  const groups = nav.map(group => {
    const items = group.items
      .filter(it => it.soon || canSee(it.role, role))
      .map(it => linkHTML(it, activePage))
      .join('');
    if (!items) return '';
    const label = group.label ? `<span class="adm-nav-label">${group.label}</span>` : '';
    return `<div class="adm-nav-group">${label}${items}</div>`;
  }).join('');

  const footer = `<div class="adm-nav-divider"></div>${linkHTML(NAV_FOOTER, activePage)}`;

  return `
    <div class="adm-brand">
      <div class="adm-brand-logo">
        <svg width="28" height="29" viewBox="0 0 80 84" fill="none" aria-hidden="true" class="adm-brand-logo-svg">
          <circle cx="40" cy="42" r="28" stroke="currentColor" stroke-width="1.2" opacity="0.85" fill="none"/>
          <line x1="40" y1="4" x2="40" y2="80" stroke="currentColor" stroke-width="0.8" opacity="0.5"/>
          <text x="40" y="54" text-anchor="middle" font-family="Fraunces, serif" font-weight="600" font-size="32" fill="currentColor">B</text>
        </svg>
      </div>
      <div><div class="adm-brand-name">BERSAGLIO</div><div class="adm-brand-role">Panel</div></div>
    </div>
    <nav class="adm-nav">${groups}${footer}</nav>`;
}
```

Then add to `package.json` scripts (after `"test:saldo"`):

```json
    "test:sidebar": "node --test tests/render-sidebar.test.mjs",
```

- [ ] **Step 5: Correr el test y verificar que pasa**

Run: `npm run test:sidebar`
Expected: PASS (6 tests). Si el test de `--soon` falla por el regex, ajustar el assert al HTML real (mantener intención: el ítem soon existe y lleva `aria-disabled`).

- [ ] **Step 6: Commit**

```bash
git add js/admin/sidebar-data.js js/admin/render-sidebar.js tests/render-sidebar.test.mjs package.json
git commit -m "feat(admin): rail de navegación como dato (renderSidebar puro) + tests"
```

---

## Task 2: Montar el rail en `shared.js` + cablear hamburguesa + convertir `admin.html`

**Files:**
- Modify: `js/admin/shared.js` (initSidebar)
- Modify: `admin.html:19-65` (sidebar markup) y `admin.html:164-166` (script inline hamburguesa)

- [ ] **Step 1: Reescribir `initSidebar()` para montar el rail**

En `js/admin/shared.js`, añadir el import arriba (junto a los otros):

```js
import { renderSidebar } from './render-sidebar.js';
import { NAV } from './sidebar-data.js';
```

Reemplazar el cuerpo de `initSidebar()` (líneas 21-48) por:

```js
export function initSidebar() {
    const sidebar = document.querySelector('.adm-sidebar');
    const page = location.pathname.split('/').pop() || 'admin.html';

    // Montar el rail desde datos (si el <aside> está vacío).
    if (sidebar && !sidebar.querySelector('.adm-nav')) {
        const role = currentRole() || 'editor';
        sidebar.insertAdjacentHTML('afterbegin', renderSidebar(NAV, { role, activePage: page }));
        wireSidebarToggle(sidebar);
    }

    updateBadge();

    if (!initSidebar._subscribed) {
        initSidebar._subscribed = true;
        adminDb.on('inquiries', () => updateBadge());
    }

    const user = currentUser();
    if (user) {
        setAuthContext({
            uid:         user.user?.uid || null,
            email:       user.user?.email || null,
            displayName: user.profile?.displayName || user.user?.email?.split('@')[0] || null,
        });
    }

    renderUserInfo();
}

// Cablea la hamburguesa por delegación (antes vivía como script inline por página).
function wireSidebarToggle(sidebar) {
    const btn = document.getElementById('hamburger-btn');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (!btn || !backdrop) return;
    const toggle = () => { sidebar.classList.toggle('is-open'); backdrop.classList.toggle('is-visible'); };
    btn.addEventListener('click', toggle);
    backdrop.addEventListener('click', toggle);
    sidebar.addEventListener('click', (e) => {
        if (e.target.closest('.adm-nav-link')) { sidebar.classList.remove('is-open'); backdrop.classList.remove('is-visible'); }
    });
}
```

> Nota: `renderUserInfo()` ya hace el gating de Usuarios/Cuentas por estilo; con el rail generado, esos `<a>` solo existen si el rol los permite, así que el gating por `style.display` se vuelve redundante pero **no estorba** (no encontrará el link y no hará nada). Se limpia en el Plan 2.

- [ ] **Step 2: Vaciar el `<aside>` de `admin.html` y quitar el script inline**

En `admin.html`, reemplazar TODO el bloque `<aside class="adm-sidebar"> ... </aside>` (líneas 19-65) por:

```html
    <!-- Sidebar (se rellena desde datos por js/admin/shared.js → renderSidebar) -->
    <aside class="adm-sidebar"></aside>
```

Y **borrar** el script inline de hamburguesa al final (líneas 164-166):

```html
<script>
(function(){var b=document.getElementById('hamburger-btn')...})();
</script>
```

(Su lógica ahora vive en `wireSidebarToggle` de `shared.js`.)

- [ ] **Step 3: Verificar en el navegador**

Run: `npm run dev` y abrir `http://localhost:5173/admin.html` (tras iniciar sesión o con `bj_auth` en sessionStorage).
Expected: el rail muestra los grupos (Hoy · CRM · Ventas · Cobranza · Catálogo/Inventario · Reportes · Sistema), "Hoy" activo, Vendedoras visible, ítems "pronto" atenuados, badge de Bandeja, y la hamburguesa abre/cierra en móvil. Verificar con `preview_*` (snapshot + screenshot).

- [ ] **Step 4: Verificar build**

Run: `npm run build`
Expected: build verde (✓).

- [ ] **Step 5: Commit**

```bash
git add js/admin/shared.js admin.html
git commit -m "feat(admin): montar rail agrupado desde datos en el dashboard + hamburguesa por JS"
```

---

## Task 3: Desplegar el rail a las 7 páginas admin restantes

**Files (cada una, mismo cambio que Task 2 Step 2):**
- Modify: `admin-piezas.html`, `admin-colecciones.html`, `admin-consultas.html`, `admin-usuarios.html`, `admin-cuentas.html`, `admin-cuenta.html`, `admin-config.html`

- [ ] **Step 1: En cada archivo, reemplazar el bloque `<aside class="adm-sidebar"> ... </aside>` por el `<aside>` vacío**

Reemplazo (idéntico en las 7):

```html
    <aside class="adm-sidebar"></aside>
```

- [ ] **Step 2: En cada archivo, borrar el `<script>` inline de hamburguesa** (el bloque `(function(){var b=document.getElementById('hamburger-btn')...})()`), ya cubierto por `wireSidebarToggle`.

- [ ] **Step 3: Añadir `id="vendedoras"` a la sección de vendedoras en `admin-config.html`**

Buscar el contenedor de la gestión de vendedoras (cerca de `#vend-nombre`) y añadir `id="vendedoras"` a su `<section>`/`<div class="adm-section">` contenedor, para que `admin-config.html#vendedoras` ancle ahí.

- [ ] **Step 4: Verificar cada página en el navegador**

Run: `npm run dev`; abrir cada `admin-*.html`.
Expected: el rail aparece idéntico, con el link activo correcto en cada página (p.ej. en `admin-piezas.html` "Piezas" sale `is-active`), Usuarios solo visible para owner. Verificar con `preview_snapshot` en 2-3 páginas.

- [ ] **Step 5: Verificar build + commit**

Run: `npm run build` → verde.

```bash
git add admin-piezas.html admin-colecciones.html admin-consultas.html admin-usuarios.html admin-cuentas.html admin-cuenta.html admin-config.html
git commit -m "feat(admin): desplegar el rail desde datos a las 7 páginas restantes (elimina nav duplicada)"
```

---

## Task 4: CSS — placeholder "pronto" + espaciado de grupos

**Files:**
- Modify: `css/admin.css` (tras la regla `.adm-nav-badge`, ~línea 219)

- [ ] **Step 1: Añadir estilos del placeholder y refinar grupos**

Insertar en `css/admin.css` después de `.adm-nav-badge { ... }`:

```css
/* Grupos del rail (IA v2) */
.adm-nav-group + .adm-nav-group { margin-top: 6px; }
.adm-nav-group .adm-nav-label:first-child { margin-top: 4px; }

/* Ítems "pronto" (módulos futuros) */
.adm-nav-link--soon {
    color: oklch(28% 0.08 155 / 0.38);
    cursor: default;
}
.adm-nav-link--soon svg { color: oklch(28% 0.08 155 / 0.3); }
.adm-nav-soon-tag {
    margin-left: auto;
    font-size: 8.5px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: oklch(28% 0.08 155 / 0.45);
    background: oklch(28% 0.08 155 / 0.06);
    padding: 2px 6px;
    border-radius: 6px;
}
```

- [ ] **Step 2: Verificar en navegador**

Run: `npm run dev`; los ítems "pronto" se ven atenuados con su etiqueta, los grupos separados.
Expected: jerarquía visual clara. `preview_screenshot` del rail.

- [ ] **Step 3: Commit**

```bash
git add css/admin.css
git commit -m "style(admin): estilos de grupos del rail + placeholders 'pronto'"
```

---

## Task 5: Design-system de dinero (presentación) — `adm-money` + fix de números desbordados

**Files:**
- Modify: `css/admin.css` (stat-cards ~313-319; añadir `.adm-money` y `.adm-num`)

- [ ] **Step 1: Arreglar el desbordamiento de stat-cards**

En `css/admin.css`, reemplazar `.adm-stat-body {}` (línea ~313) por:

```css
.adm-stat-body { min-width: 0; }
```

Y reemplazar `.adm-stat-card { ... }` añadiendo `min-width: 0` (para que el flex item pueda encoger):

```css
.adm-stat-card {
    background: var(--adm-white);
    border: 1px solid var(--adm-border);
    border-radius: var(--adm-radius-lg);
    padding: 20px;
    display: flex;
    align-items: flex-start;
    gap: 14px;
    box-shadow: var(--adm-shadow-sm);
    min-width: 0;
}
```

Y reemplazar `.adm-stat-value { font-size: 26px; ... }` por una versión fluida que no desborde:

```css
.adm-stat-value {
    font-size: clamp(18px, 2.2vw, 26px);
    font-weight: 700;
    color: var(--adm-text);
    line-height: 1.05;
    overflow-wrap: anywhere;
}
```

- [ ] **Step 2: Añadir las clases de dinero**

Insertar en `css/admin.css` (junto a las stat-cards):

```css
/* Números de dinero: monoespaciado tabular para que nunca se desborden ni "bailen" */
.adm-money, .adm-num {
    font-family: 'Space Mono', monospace;
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum" 1;
    white-space: nowrap;
}
.adm-money--debe   { color: var(--adm-danger); }
.adm-money--favor  { color: var(--adm-success); }
.adm-money--cero   { color: var(--adm-muted); }
```

- [ ] **Step 3: `nowrap` solo en numéricas (matar el scroll horizontal en móvil)**

Localizar en `css/admin.css` la regla `.adm-table { ... white-space: nowrap; ... }` (~línea 398) y **quitar** `white-space: nowrap;` de ahí. Añadir en su lugar reglas dirigidas:

```css
.adm-table td, .adm-table th { white-space: normal; }
.adm-table .adm-money, .adm-table .adm-num, .adm-table .adm-nowrap { white-space: nowrap; }
.adm-table td.adm-cell-main { max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
```

- [ ] **Step 4: Verificar build + visual**

Run: `npm run build` → verde. `npm run dev` → abrir `admin-cuentas.html` en móvil (preview_resize 380px).
Expected: los montos no se salen de las stat-cards; la tabla no genera scroll horizontal; nombres largos con ellipsis. `preview_screenshot` antes/después.

- [ ] **Step 5: Commit**

```bash
git add css/admin.css
git commit -m "style(admin): clase adm-money (tabular-nums) + fix de stat-cards desbordadas + nowrap solo numérico"
```

---

## Task 6: Centralizar color del saldo en tokens (quitar hex hardcodeado)

**Files:**
- Create: `js/admin/saldo-format.js`
- Modify: `js/admin/cuentas.js:27` (saldoCell) y `js/admin/cuenta.js:49-50` (renderHeader)

- [ ] **Step 1: Crear el helper compartido**

Create `js/admin/saldo-format.js`:

```js
import { fmtCOP } from '../crm-service.js';

/** Clase de color del saldo (token-based). saldo > 0 = debe (rojo). */
export function saldoClass(saldo) {
  if (saldo > 0) return 'adm-money adm-money--debe';
  if (saldo < 0) return 'adm-money adm-money--favor';
  return 'adm-money adm-money--cero';
}

/** Etiqueta del saldo para la ficha. */
export function saldoLabel(saldo) {
  if (saldo > 0) return 'Saldo (debe)';
  if (saldo < 0) return 'Saldo a favor';
  return 'Saldo';
}

/** Celda de saldo lista para innerHTML (clase + monto formateado). */
export function saldoCellHTML(saldo) {
  return `<span class="${saldoClass(saldo)}">${fmtCOP(saldo)}</span>`;
}
```

- [ ] **Step 2: Usar el helper en `cuentas.js`**

En `js/admin/cuentas.js`, añadir el import:

```js
import { saldoCellHTML } from './saldo-format.js';
```

Reemplazar la función `saldoCell()` (línea ~27, la que usa `var(--adm-danger,#c0392b)` / `#1b7a4b` inline) por una que delega:

```js
function saldoCell(saldo) {
  return saldoCellHTML(saldo);
}
```

(Si `saldoCell` se llama con otro arg, conservar la firma; el objetivo es eliminar los hex `#c0392b` / `#1b7a4b` inline.)

- [ ] **Step 3: Usar el helper en `cuenta.js`**

En `js/admin/cuenta.js`, importar:

```js
import { saldoClass, saldoLabel } from './saldo-format.js';
```

Reemplazar las líneas 49-50 de `renderHeader()` (las que asignan color con `var(--adm-danger,#c0392b)` / `#1b7a4b`) por el uso de clase:

```js
const elSaldo = document.getElementById('f-saldo');           // ajustar al id real del valor
if (elSaldo) elSaldo.className = saldoClass(saldo);
const elLabel = document.getElementById('f-saldo-label');
if (elLabel) elLabel.textContent = saldoLabel(saldo);
```

> Antes de editar, **leer** `cuenta.js:36-55` para confirmar el id real del elemento del valor del saldo y conservarlo.

- [ ] **Step 4: Verificar — cero hex hardcodeado de saldo**

Run: `npm run build` → verde. Buscar que no queden hex de saldo:
Run (Grep): `#c0392b` y `#1b7a4b` en `js/admin/` → 0 resultados.
`npm run dev` → `admin-cuentas.html` y una ficha: saldos en rojo (debe) / verde (a favor) / gris (cero) con `adm-money`.

- [ ] **Step 5: Commit**

```bash
git add js/admin/saldo-format.js js/admin/cuentas.js js/admin/cuenta.js
git commit -m "refactor(admin): centralizar color/etiqueta del saldo en tokens (quita hex hardcodeado)"
```

---

## Task 7: `#confirm-dialog` compartido en la ficha (no más confirm() gris del SO)

**Files:**
- Modify: `admin-cuenta.html` (añadir el dialog antes de `</body>`, junto al toast-wrap)

- [ ] **Step 1: Añadir el markup del diálogo**

En `admin-cuenta.html`, antes de `<div class="adm-toast-wrap"...>` (o antes de `</body>`), insertar:

```html
<!-- Diálogo de confirmación compartido (usado por admConfirm) -->
<div class="adm-dialog" id="confirm-dialog" hidden>
  <div class="adm-dialog-backdrop"></div>
  <div class="adm-dialog-box" role="alertdialog" aria-modal="true" aria-describedby="confirm-msg">
    <p id="confirm-msg" class="adm-dialog-msg"></p>
    <div class="adm-dialog-actions">
      <button id="confirm-cancel" class="adm-btn adm-btn--ghost">Cancelar</button>
      <button id="confirm-ok" class="adm-btn adm-btn--primary">Confirmar</button>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Verificar estilos del diálogo**

Run (Grep): `.adm-dialog` en `css/admin.css`.
- Si existe → seguir.
- Si NO existe, añadir en `css/admin.css`:

```css
.adm-dialog[hidden] { display: none; }
.adm-dialog { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; }
.adm-dialog-backdrop { position: absolute; inset: 0; background: oklch(20% 0.05 155 / 0.45); }
.adm-dialog-box { position: relative; background: #fff; border-radius: var(--adm-radius-lg); padding: 22px 24px; max-width: 380px; width: calc(100% - 40px); box-shadow: var(--adm-shadow-lg, 0 20px 50px rgba(18,40,32,.25)); }
.adm-dialog-msg { margin: 0 0 18px; color: var(--adm-text); font-size: 14px; }
.adm-dialog-actions { display: flex; justify-content: flex-end; gap: 10px; }
```

- [ ] **Step 3: Verificar que `admConfirm` usa el diálogo (no el confirm nativo)**

`npm run dev` → en una ficha de cliente, pulsar "Anular" en un movimiento.
Expected: aparece el diálogo estilizado (no el `confirm()` gris del navegador). `admConfirm` (shared.js:143) ya prefiere `#confirm-dialog` si existe. `preview_screenshot`.

- [ ] **Step 4: Commit**

```bash
git add admin-cuenta.html css/admin.css
git commit -m "feat(admin): diálogo de confirmación propio en la ficha (reemplaza confirm() del SO)"
```

---

## Self-Review (cobertura del spec F-CHASIS-A)

- ✅ **renderSidebar() como dato + grupos + placeholders + gating por rol** → Tasks 1-4.
- ✅ **Promover Clientes** (ítem CRM → admin-cuentas.html) y **sacar Vendedoras a nav** (grupo Sistema) → Task 1 (datos) + Task 3 (anchor).
- ✅ **Eliminar nav duplicada en 8 HTML** → Tasks 2-3.
- ✅ **Quick wins de dinero**: `adm-money`+tabular-nums, fix stat-cards desbordadas, hex→tokens, `nowrap` solo numérico → Tasks 5-6.
- ✅ **#confirm-dialog en la ficha** → Task 7.
- ⏭️ **Diferido a Plan 2**: barra superior (búsqueda federada + Crear + notificaciones + engranaje + perfil), integridad de lectura (unsubscribe + detector de truncado).
- ⏭️ **Diferido a Plan 3 (backend)**: append-only en reglas, RBAC por claims, App Check, fix de bugs §1.1 de reglas/functions.
- ⏭️ **Post-Consejo Externo**: backfill Money ×100.

Sin placeholders de plan. Tipos/funciones consistentes (`renderSidebar`, `saldoClass`, `saldoCellHTML`, `wireSidebarToggle`). Cache bump del SW: **no aplica** (no cambian assets del shell público ni `public/sw.js`; el panel admin no se precachea por ruta).
