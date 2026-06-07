/**
 * Bersaglio Admin — formato compartido de leads (Bandeja, F4).
 * Única fuente del estado/etiqueta/color del pipeline de leads y del origen.
 * Los leads viven (por ahora) en la colección `inquiries` evolucionada (ADR §53):
 * el pipeline `status` se añade encima del flujo de consultas existente. La
 * ingestión blindada (colección `leads` + CF + App Check) es F6.
 */

// Pipeline de venta del interesado (decisión Daniel 2026-06-07: 5 etapas).
export const LEAD_ESTADOS = Object.freeze(['nuevo', 'trabajando', 'calificado', 'convertido', 'perdido']);

export const LEAD_LABEL = Object.freeze({
  nuevo: 'Nuevo', trabajando: 'Trabajando', calificado: 'Calificado',
  convertido: 'Cliente', perdido: 'Perdido',
});

/**
 * Estado normalizado de un lead. Legacy (consulta sin `status`): se deriva de
 * `read` para no inflar la bandeja con consultas viejas ya vistas.
 */
export function leadStatus(lead) {
  const s = lead?.status;
  if (LEAD_ESTADOS.includes(s)) return s;
  if (s === 'new') return 'nuevo';   // alias legacy: el formulario web escribía 'new'
  return lead?.read ? 'trabajando' : 'nuevo';
}

/** ¿Necesita atención? = está en 'nuevo' (sin trabajar). Maneja el badge del rail. */
export function esPendiente(lead) {
  return leadStatus(lead) === 'nuevo';
}

/** ¿El lead está cerrado (convertido o perdido)? */
export function esCerrado(lead) {
  const s = leadStatus(lead);
  return s === 'convertido' || s === 'perdido';
}

// Color del pill por estado (tokens, sin hex).
function pillClass(status) {
  switch (status) {
    case 'nuevo':      return 'adm-pill--red';
    case 'trabajando': return 'adm-pill--gold';
    case 'calificado': return 'adm-pill--emerald';
    case 'convertido': return 'adm-pill--green';
    case 'perdido':    return 'adm-pill--gray';
    default:           return 'adm-pill--gray';
  }
}

/** Pill HTML del estado del lead. */
export function leadBadgeHTML(lead) {
  const s = leadStatus(lead);
  return `<span class="adm-pill ${pillClass(s)}">${LEAD_LABEL[s]}</span>`;
}

// Origen del lead (canal). `source` lo setea el formulario web / la alta manual.
const ORIGEN_LABEL = Object.freeze({
  web: 'Web', web_form: 'Web', formulario: 'Web', contacto: 'Web',
  whatsapp: 'WhatsApp', wa: 'WhatsApp',
  mostrador: 'Mostrador', manual: 'Manual', instagram: 'Instagram',
});

/** Etiqueta legible del origen (default: Web, que es de donde llega el formulario). */
export function origenLabel(source) {
  if (!source) return 'Web';
  return ORIGEN_LABEL[String(source).toLowerCase()] || source;
}

/**
 * Días transcurridos desde `createdAt` hasta hoy. Acepta number(ms)|Date|ISO y
 * Firestore Timestamp (vivo: `.toMillis()`) o su forma serializada en caché (`{seconds}`).
 * null si no hay fecha parseable.
 */
export function diasDesde(createdAt, hoy = new Date()) {
  if (createdAt == null) return null;
  let t;
  if (typeof createdAt === 'number') t = createdAt;
  else if (createdAt instanceof Date) t = createdAt.getTime();
  else if (typeof createdAt.toMillis === 'function') t = createdAt.toMillis();
  else if (typeof createdAt.seconds === 'number') t = createdAt.seconds * 1000;
  else t = Date.parse(createdAt);
  if (!Number.isFinite(t)) return null;
  return Math.max(0, Math.floor((hoy.getTime() - t) / 86400000));
}

/**
 * ¿Lead 'nuevo' demorado (SLA simple)? Un interesado sin trabajar hace > `dias`.
 * SLA fino por canal (24/12/48h, norte §10.4) se difiere; aquí basta el aviso.
 */
export function estaDemorado(lead, dias = 2, hoy = new Date()) {
  if (leadStatus(lead) !== 'nuevo') return false;
  const d = diasDesde(lead?.createdAt, hoy);
  return d != null && d > dias;
}
