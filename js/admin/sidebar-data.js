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
    // F-IA-2 B2: el DIRECTORIO (contacto/relación) se separó de la CARTERA (cobro/mora).
    { label: 'Clientes',    href: 'admin-clientes.html',  icon: 'users', role: 'admin' },
    { label: 'Interesados', href: 'admin-consultas.html', icon: 'inbox', role: 'editor', badgeId: 'inq-badge' },
  ]},
  { label: 'Cartera', items: [
    // Cuentas por cobrar: KPIs + mora + acuerdos (admin-cuentas.html, ex "Clientes y cartera").
    { label: 'Cartera', href: 'admin-cuentas.html', icon: 'card', role: 'admin' },
  ]},
  { label: 'Finanzas', items: [
    // Caja y turnos = historial + arqueos + línea de tiempo (control del dueño). El turno se OPERA
    // desde el Mostrador (patrón Odoo/Shopify POS); aquí se AUDITA.
    { label: 'Caja y turnos', href: 'admin-auditoria.html', icon: 'receipt', role: 'owner' },
    { label: 'Bóveda',        href: 'admin-boveda.html',    icon: 'shield',  role: 'owner' },
    // F-TESORERÍA B2 (§3): cuentas y bancos (bancos/Nequi + virtuales caja/bóveda). admin: Kary
    // registra/traslada (read admin/owner por reglas); owner aprueba retiros/ajustes (Bandeja, B4).
    { label: 'Cuentas y bancos', href: 'admin-tesoreria.html', icon: 'card', role: 'admin' },
    // F-IA-2 B4 (D5): bandeja ÚNICA de aprobaciones (cartera M2b + bóveda/caja). Owner-only: sus
    // fuentes son owner-read (bóveda `read isOwner`) y las callables validan owner. badge vivo.
    { label: 'Aprobaciones',  href: 'admin-aprobaciones.html', icon: 'invoice', role: 'owner', badgeId: 'aprob-badge' },
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
    // F-IA-2 B1 (§0.7 D1): "Negocio y equipo" absorbió Parámetros (→ pestaña Cobranza, owner) y
    // Usuarios (→ pestaña owner) en UNA página de pestañas. El rail Sistema queda compacto.
    { label: 'Negocio y equipo',  href: 'admin-config.html', icon: 'gear',  role: 'admin' },
    { label: 'Salud del sistema', href: 'admin-salud.html',  icon: 'pulse', role: 'owner' },
  ]},
];

// Ítem de pie (siempre visible, abre el sitio en nueva pestaña).
export const NAV_FOOTER = { label: 'Ver sitio', href: 'index.html', icon: 'external', target: '_blank' };

// Versión visible del panel (criterio de deploy para no-técnicos, spec §9.1): Kary
// confirma que está en la versión nueva tras un despliegue. Se bumpea JUNTO al
// CACHE_NAME del Service Worker (`public/sw.js`) en cada cambio del shell admin.
export const APP_VERSION = 'v56 · 2026-07-25';   // [OPUS-5] B5·V17: el abono en efectivo entra al arqueo + los rechazos del servidor llegan con su motivo (TODO-79)
