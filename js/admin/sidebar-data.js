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
    // Mostrador (POS, B1 §126): role 'catalogo' → Kary lo ve (espeja a quién autoriza la CF crearPedido).
    { label: 'Mostrador', href: 'admin-pos.html',     icon: 'cart',    role: 'catalogo' },
    // Pedidos (F1-PUENTE · TODO-68): role 'catalogo' espeja la regla de LECTURA de `pedidos`.
    // Los placeholders "Ventas"/"Facturas"/"CxC" se retiraron (plan v4 §2): una-entidad-por-concepto
    // también en la nav — la factura vive en el pedido; CxC vive en Clientes (cartera CRM).
    { label: 'Pedidos',   href: 'admin-pedidos.html', icon: 'receipt', role: 'catalogo' },
    // Bóveda (F2.0 B5b-1): caja fuerte OWNER-only (discreción D7 §9.9) — saldo + consignar/reponer
    // + conteo físico + aprobaciones (Dual-Approval). NUNCA visible desde el POS de venta.
    { label: 'Bóveda',    href: 'admin-boveda.html',  icon: 'shield',  role: 'owner' },
    // Auditoría de caja (F2 "caja en tiempo real" · TODO-69): OWNER-only. Línea de tiempo de cada
    // turno (quién abrió/movió/vendió/cerró + hora), solo lectura, sobre la data que ya graban las CFs.
    { label: 'Auditoría', href: 'admin-auditoria.html', icon: 'receipt', role: 'owner' },
  ]},
  { label: 'Cobranza', items: [
    { label: 'Pagos / Recibos', href: '#', icon: 'receipt', role: 'admin', soon: true },
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
export const APP_VERSION = 'v45 · 2026-07-08';   // TODO-70 POS profesional: caja obligatoria (cierre solo-turno + anomalías fuera-de-turno) — SW v83
