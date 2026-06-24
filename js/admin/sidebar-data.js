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
    { label: 'Cuentas por cobrar', href: '#', icon: 'card',    role: 'admin', soon: true },
    { label: 'Pagos / Recibos',    href: '#', icon: 'receipt', role: 'admin', soon: true },
  ]},
  { label: 'Catálogo / Inventario', items: [
    { label: 'Piezas',      href: 'admin-piezas.html',      icon: 'gem',    role: 'catalogo' },
    { label: 'Colecciones', href: 'admin-colecciones.html', icon: 'layers', role: 'catalogo' },
    { label: 'Inventario',  href: '#', icon: 'box', role: 'admin', soon: true },
  ]},
  // CMS de la web pública (decisión UX #3 del comité): UNA página de pestañas
  // (admin-contenido.html), no 6 admin-*.html sueltos. Rol mínimo: editor.
  { label: 'Contenido web', items: [
    { label: 'Journal',           href: 'admin-contenido.html#journal',  icon: 'invoice', role: 'editor' },
    { label: 'Textos / Home',     href: 'admin-contenido.html#home',     icon: 'home',    role: 'editor' },
    { label: 'Textos / Contacto', href: 'admin-contenido.html#contacto', icon: 'inbox',   role: 'editor' },
    { label: 'Films y Redes',     href: '#', icon: 'chart', role: 'editor', soon: true },
  ]},
  { label: 'Reportes', items: [
    { label: 'Reportes / KPIs', href: '#', icon: 'chart', role: 'admin', soon: true },
  ]},
  { label: 'Sistema', items: [
    { label: 'Vendedoras',    href: 'admin-config.html#vendedoras', icon: 'users',   role: 'admin' },
    { label: 'Usuarios',      href: 'admin-usuarios.html',          icon: 'shield',  role: 'owner' },
    { label: 'Salud',         href: 'admin-salud.html',             icon: 'pulse',   role: 'owner' },
    { label: 'Parámetros',    href: 'admin-parametros.html',        icon: 'sliders', role: 'owner' },
    { label: 'Configuración', href: 'admin-config.html',            icon: 'gear',    role: 'admin' },
  ]},
];

// Ítem de pie (siempre visible, abre el sitio en nueva pestaña).
export const NAV_FOOTER = { label: 'Ver sitio', href: 'index.html', icon: 'external', target: '_blank' };

// Versión visible del panel (criterio de deploy para no-técnicos, spec §9.1): Kary
// confirma que está en la versión nueva tras un despliegue. Se bumpea JUNTO al
// CACHE_NAME del Service Worker (`public/sw.js`) en cada cambio del shell admin.
export const APP_VERSION = 'v17 · 2026-06-20';
