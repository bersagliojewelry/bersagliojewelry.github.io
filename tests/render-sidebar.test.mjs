import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderSidebar } from '../js/admin/render-sidebar.js';
import { NAV, APP_VERSION } from '../js/admin/sidebar-data.js';

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

test('placeholders futuros salen deshabilitados', () => {
  const html = renderSidebar(NAV, { role: 'admin', activePage: 'admin.html' });
  assert.match(html, /adm-nav-link--soon/);
  assert.match(html, /aria-disabled="true"/);
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

test('Vendedoras es visible en la nav (grupo Sistema)', () => {
  const html = renderSidebar(NAV, { role: 'admin', activePage: 'admin.html' });
  assert.match(html, /Vendedoras/);
});

test('Salud solo es visible para el owner (F6 frente D)', () => {
  const adminHtml = renderSidebar(NAV, { role: 'admin', activePage: 'admin.html' });
  assert.doesNotMatch(adminHtml, /href="admin-salud\.html"/);
  const ownerHtml = renderSidebar(NAV, { role: 'owner', activePage: 'admin.html' });
  assert.match(ownerHtml, /href="admin-salud\.html"/);
});

test('Parámetros solo es visible para el owner (M0-C: Kary no gobierna sus límites)', () => {
  const adminHtml = renderSidebar(NAV, { role: 'admin', activePage: 'admin.html' });
  assert.doesNotMatch(adminHtml, /href="admin-parametros\.html"/);
  const ownerHtml = renderSidebar(NAV, { role: 'owner', activePage: 'admin.html' });
  assert.match(ownerHtml, /href="admin-parametros\.html"/);
});

test('muestra el indicador de versión del panel (criterio de deploy, M2a-6)', () => {
  const html = renderSidebar(NAV, { role: 'admin', activePage: 'admin.html' });
  assert.ok(html.includes(APP_VERSION), 'el HTML debe incluir APP_VERSION');
  assert.match(html, /class="adm-version"/);
});
