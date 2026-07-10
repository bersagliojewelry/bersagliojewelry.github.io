import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderSidebar } from '../js/admin/render-sidebar.js';
import { NAV, APP_VERSION } from '../js/admin/sidebar-data.js';

test('renderiza grupos y labels', () => {
  const html = renderSidebar(NAV, { role: 'owner', activePage: 'admin.html' });
  assert.match(html, /adm-nav-label">Clientes</);
  assert.match(html, /adm-nav-label">Cartera</);
  assert.match(html, /adm-nav-label">Finanzas</);
  assert.match(html, /adm-nav-label">Sistema</);
});

test('F-IA-2 B2: Clientes (directorio) separado de Cartera (cobro)', () => {
  const html = renderSidebar(NAV, { role: 'admin', activePage: 'admin.html' });
  // El directorio es admin-clientes.html; la cartera queda en admin-cuentas.html.
  assert.match(html, /href="admin-clientes\.html"/);
  assert.match(html, /href="admin-cuentas\.html"/);
  // Ya no existe el ítem fusionado "Clientes y cartera".
  assert.doesNotMatch(html, /Clientes y cartera/);
  // admin-cuentas.html vive bajo el grupo "Cartera".
  const m = html.match(/adm-nav-label">Cartera<\/span>([\s\S]*?)<\/div>/);
  assert.ok(m, 'debe existir el grupo Cartera');
  assert.match(m[1], /href="admin-cuentas\.html"/);
});

test('marca el link activo por filename', () => {
  const html = renderSidebar(NAV, { role: 'admin', activePage: 'admin-cuentas.html' });
  assert.match(html, /href="admin-cuentas\.html"[^>]*class="adm-nav-link is-active"/);
});

test('Usuarios ya NO es ítem del rail (F-IA-2 B1: absorbido como pestaña owner de "Negocio y equipo")', () => {
  // Ni admin ni owner ven un ítem "Usuarios" en el rail — se gestiona dentro de admin-config.html.
  for (const role of ['admin', 'owner']) {
    const html = renderSidebar(NAV, { role, activePage: 'admin.html' });
    assert.doesNotMatch(html, /href="admin-usuarios\.html"/, `rol ${role} no debe ver el ítem Usuarios`);
  }
});

test('el renderer soporta placeholders `soon` (capacidad), pero el rail v2 NO trae ninguno (comité 2026-07-10)', () => {
  // Capacidad del renderer: probada con un fixture (un grupo nace cuando su página existe de verdad).
  const fixture = [{ label: 'Futuro', items: [{ label: 'Algo', href: '#', icon: 'chart', role: 'admin', soon: true }] }];
  const conSoon = renderSidebar(fixture, { role: 'admin', activePage: 'admin.html' });
  assert.match(conSoon, /adm-nav-link--soon/);
  assert.match(conSoon, /aria-disabled="true"/);
  // Rail real: cero "PRONTO" visibles (anti grupos-cascarón, ADR §182).
  const real = renderSidebar(NAV, { role: 'owner', activePage: 'admin.html' });
  assert.doesNotMatch(real, /adm-nav-link--soon/);
});

test('Pedidos (F1-PUENTE) visible para el staff de ventas y sin placeholders retirados', () => {
  const html = renderSidebar(NAV, { role: 'admin', activePage: 'admin.html' });
  assert.match(html, /href="admin-pedidos\.html"/);
  // Plan v4 §2: una-entidad-por-concepto también en la nav — estos placeholders NO deben volver.
  assert.doesNotMatch(html, />Facturas</);
  assert.doesNotMatch(html, /Cuentas por cobrar/);
});

test('conserva el badge de la Bandeja', () => {
  const html = renderSidebar(NAV, { role: 'admin', activePage: 'admin.html' });
  assert.match(html, /id="inq-badge"/);
});

test('rail v2: Negocio y equipo (ex Configuración, incluye Vendedoras) visible para admin', () => {
  const html = renderSidebar(NAV, { role: 'admin', activePage: 'admin.html' });
  assert.match(html, /Negocio y equipo/);
  assert.match(html, /href="admin-config\.html"/);
});

test('Salud solo es visible para el owner (F6 frente D)', () => {
  const adminHtml = renderSidebar(NAV, { role: 'admin', activePage: 'admin.html' });
  assert.doesNotMatch(adminHtml, /href="admin-salud\.html"/);
  const ownerHtml = renderSidebar(NAV, { role: 'owner', activePage: 'admin.html' });
  assert.match(ownerHtml, /href="admin-salud\.html"/);
});

test('Parámetros ya NO es ítem del rail (F-IA-2 B1: fusionado en la pestaña Cobranza de "Negocio y equipo")', () => {
  // La política de cartera se edita dentro de admin-config.html (pestaña Cobranza, solo owner).
  for (const role of ['admin', 'owner']) {
    const html = renderSidebar(NAV, { role, activePage: 'admin.html' });
    assert.doesNotMatch(html, /href="admin-parametros\.html"/, `rol ${role} no debe ver el ítem Parámetros`);
  }
});

test('rail v2: el grupo Sistema queda con exactamente 2 ítems (Negocio y equipo + Salud)', () => {
  const html = renderSidebar(NAV, { role: 'owner', activePage: 'admin.html' });
  // Aísla el grupo Sistema (desde su label hasta el siguiente grupo/divisor).
  const m = html.match(/adm-nav-label">Sistema<\/span>([\s\S]*?)<\/div>/);
  assert.ok(m, 'debe existir el grupo Sistema');
  const items = (m[1].match(/adm-nav-link/g) || []).length;
  assert.equal(items, 2, 'Sistema debe tener solo Negocio y equipo + Salud');
  assert.match(m[1], /href="admin-config\.html"/);
  assert.match(m[1], /href="admin-salud\.html"/);
});

test('muestra el indicador de versión del panel (criterio de deploy, M2a-6)', () => {
  const html = renderSidebar(NAV, { role: 'admin', activePage: 'admin.html' });
  assert.ok(html.includes(APP_VERSION), 'el HTML debe incluir APP_VERSION');
  assert.match(html, /class="adm-version"/);
});
