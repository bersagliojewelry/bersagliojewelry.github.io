/**
 * Árbol de navegación del panel como DATO (IA "C").
 * Cada ítem: { label, href, icon, role, badgeId?, soon? }
 * role = rol MÍNIMO para ver el ítem ('editor' | 'admin' | 'owner').
 * Grupos con label === null = ítems sueltos (sin encabezado).
 *
 * RAIL v2 (comité ×3 IA/contadora/UX · 2026-07-10 · ADR §182): grupos por dominio de negocio,
 * frecuencia de uso primero, CERO placeholders "PRONTO" (un grupo nace cuando su página existe
 * de verdad), nombre del menú == título de la página. Futuro ya decidido (no improvisar):
 * Cartera se separa de Clientes (F-IA-2) · Compras/Proveedores (F-COMPRAS) · Finanzas suma
 * "Cuentas y bancos" (F-TESORERIA) · grupo Reportes con el export contador (F-REPORTES).
 */
export const NAV = [
  { label: null, items: [
    { label: 'Hoy', href: 'admin.html', icon: 'home', role: 'editor' },
  ]},
  { label: 'Ventas', items: [
    // Mostrador (POS, B1 §126): role 'catalogo' → Kary lo ve (espeja a quién autoriza la CF crearPedido).
    { label: 'Mostrador', href: 'admin-pos.html',     icon: 'cart',    role: 'catalogo' },
    { label: 'Pedidos',   href: 'admin-pedidos.html', icon: 'receipt', role: 'catalogo' },
  ]},
  { label: 'Clientes', items: [
    // Directorio + cartera (CxC). La separación en dos páginas = F-IA-2; mientras, un solo ítem honesto.
    { label: 'Clientes y cartera', href: 'admin-cuentas.html',   icon: 'users', role: 'admin' },
    { label: 'Interesados',        href: 'admin-consultas.html', icon: 'inbox', role: 'editor', badgeId: 'inq-badge' },
  ]},
  { label: 'Finanzas', items: [
    // Caja y turnos = historial + arqueos + línea de tiempo (control del dueño). El turno se OPERA
    // desde el Mostrador (patrón Odoo/Shopify POS); aquí se AUDITA.
    { label: 'Caja y turnos', href: 'admin-auditoria.html', icon: 'receipt', role: 'owner' },
    { label: 'Bóveda',        href: 'admin-boveda.html',    icon: 'shield',  role: 'owner' },
  ]},
  { label: 'Inventario', items: [
    { label: 'Piezas',      href: 'admin-piezas.html',      icon: 'gem',     role: 'catalogo' },
    { label: 'Colecciones', href: 'admin-colecciones.html', icon: 'layers',  role: 'catalogo' },
    // Servicios = catálogo de cosas COBRABLES (grabado, ajuste, reparación) — vive con el inventario,
    // no en Sistema (comité: es un catálogo, no una configuración).
    { label: 'Servicios',   href: 'admin-servicios.html',   icon: 'receipt', role: 'owner' },
  ]},
  { label: 'Sitio web', items: [
    { label: 'Journal',           href: 'admin-contenido.html#journal',  icon: 'invoice', role: 'editor' },
    { label: 'Textos / Home',     href: 'admin-contenido.html#home',     icon: 'home',    role: 'editor' },
    { label: 'Textos / Contacto', href: 'admin-contenido.html#contacto', icon: 'inbox',   role: 'editor' },
  ]},
  { label: 'Sistema', items: [
    { label: 'Usuarios',         href: 'admin-usuarios.html',   icon: 'shield',  role: 'owner' },
    // Negocio y equipo (ex "Configuración"): datos del negocio + vendedoras + pendientes. La fusión
    // con Parámetros en UNA página de pestañas = F-IA-2 (mata la cobranza duplicada).
    { label: 'Negocio y equipo', href: 'admin-config.html',     icon: 'gear',    role: 'admin' },
    { label: 'Parámetros',       href: 'admin-parametros.html', icon: 'sliders', role: 'owner' },
    { label: 'Salud del sistema', href: 'admin-salud.html',     icon: 'pulse',   role: 'owner' },
  ]},
];

// Ítem de pie (siempre visible, abre el sitio en nueva pestaña).
export const NAV_FOOTER = { label: 'Ver sitio', href: 'index.html', icon: 'external', target: '_blank' };

// Versión visible del panel (criterio de deploy para no-técnicos, spec §9.1): Kary
// confirma que está en la versión nueva tras un despliegue. Se bumpea JUNTO al
// CACHE_NAME del Service Worker (`public/sw.js`) en cada cambio del shell admin.
export const APP_VERSION = 'v48 · 2026-07-10';   // [FABLE-5] Rail v2 (IA por dominios, comité ×3) + KPI cartera legible + Anular=void solo turno abierto — SW v88
