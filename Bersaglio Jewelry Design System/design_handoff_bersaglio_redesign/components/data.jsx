/* global window */
// Bersaglio storefront — data layer. Shape mirrors the production
// Firestore schema (see js/pages/catalogo.js, js/pages/pieza.js).

const ASSET = '../../assets';

// Collections — slug, display name, description (used in catalogo header).
const COLLECTIONS = [
  { slug: 'anillos',         name: 'Anillos',          description: 'Solitarios, halos y aros de compromiso esculpidos en oro 18K, con esmeraldas colombianas y diamantes certificados.' },
  { slug: 'topos-aretes',    name: 'Topos & Aretes',   description: 'La piedra en su gesto más íntimo. Topos solitarios, briolettes y halos para todos los días.' },
  { slug: 'argollas',        name: 'Argollas',         description: 'Alianzas y argollas en oro 18K — pulido espejo o satinado. La pieza que se hereda.' },
  { slug: 'dijes-colgantes', name: 'Dijes & Colgantes',description: 'Dijes con esmeraldas briolette y gotas de oro sobre cadenas venecianas y rolós.' },
  { slug: 'pulseras',        name: 'Pulseras',         description: 'Pulseras tenis, riveras y eslabones — todas en oro de 18 quilates.' },
  { slug: 'editorial',       name: 'Editorial',        description: 'Piezas únicas de campaña. Cada una existe una sola vez en el mundo.' },
];

// Catalog — mirror of Firestore /pieces.
// Required fields (used by catalogo.js + pieza.js): id, slug, name, collection, price,
// images[], tag?, featured?, specs.{stones, metal, ...}, description, story (paragraphs).
const PRODUCTS = [
  {
    id: 'halo-emerald', slug: 'topos-halo-esmeralda',
    name: 'Topos Halo Esmeralda', collection: 'topos-aretes', price: 12400000,
    images: [`${ASSET}/earrings-emerald.webp`, `${ASSET}/earrings-travertino.webp`, `${ASSET}/model-emerald.webp`],
    tag: 'Best Seller', featured: true,
    specs: { stones: 'Esmeralda · Diamante', stone: 'Esmeralda Muzo', metal: 'Oro amarillo 18K', origin: 'Muzo, Boyacá', guarantee: 'Vitalicia' },
    description: 'Un halo de diamantes que orbita una esmeralda colombiana de talla cojín. Engaste a microscopio, 40x de aumento, para que cada uña sostenga el fuego sin tocar la luz.',
    story: [
      'Cada topo es engastado a mano por Eliécer Patiño en nuestro atelier de Cartagena. La esmeralda central viaja desde la mina de Muzo, en Boyacá, donde es seleccionada por color y "jardín".',
      'El halo está construido con 22 diamantes redondos de 1.2mm, clarity VS, color G. Tomamos cuatro horas en engastarlos uno a uno.',
    ],
  },
  {
    id: 'emerald-classic', slug: 'topos-esmeralda-classic',
    name: 'Topos Esmeralda Classic', collection: 'topos-aretes', price: 9800000,
    images: [`${ASSET}/earrings-travertino.webp`, `${ASSET}/earrings-emerald.webp`],
    specs: { stones: 'Esmeralda colombiana', stone: 'Esmeralda Coscuez', metal: 'Oro amarillo 18K', cut: 'Cojín', guarantee: 'Vitalicia' },
    description: 'La esmeralda en su gesto más puro: solitaria, sobre cuatro uñas de oro 18K. La pieza que se hereda sin pedir permiso a ninguna época.',
    story: ['Esmeraldas de Coscuez con verde profundo y "jardín" controlado. Talla cojín ovalada, 5x4mm cada una. Aceitadas con resina natural, certificado GIA opcional.'],
  },
  {
    id: 'trinity-sapphire', slug: 'anillo-trinity-zafiro',
    name: 'Anillo Trinity Zafiro', collection: 'anillos', price: 14800000,
    images: [`${ASSET}/ring-sapphire.webp`, `${ASSET}/model-emerald.webp`, `${ASSET}/earrings-emerald.webp`],
    tag: 'Edición limitada', featured: true,
    specs: { stones: 'Zafiro · Diamantes', stone: 'Zafiro azul', metal: 'Oro 18K paladiado', edition: '12 piezas', size: 'Hecho a medida' },
    description: 'Tres aros entrelazados, tres significados que tú eliges. Una reinterpretación del gesto Trinity en oro 18K paladiado, coronada por un zafiro de corte real.',
    story: ['Inspirado en el Trinity de Cartier (1924), pero con tres aros del mismo tono de oro y un único zafiro central. Edición limitada a 12 piezas numeradas.'],
  },
  {
    id: 'editorial-emerald', slug: 'collar-la-verde',
    name: 'Collar La Verde', collection: 'editorial', price: 38600000,
    images: [`${ASSET}/model-emerald.webp`, `${ASSET}/banner-hero.webp`, `${ASSET}/ring-sapphire.webp`],
    tag: 'Pieza única', featured: true,
    specs: { stones: '11 esmeraldas Muzo', accent: 'Diamantes GIA', metal: 'Oro amarillo 18K', piece: 'Única' },
    description: 'La pieza central de la campaña La Verde 2026: una cascada de esmeraldas briolette engarzadas en hilos de oro, diseñada para un único cuello en el mundo.',
    story: [
      'Diseñada por Kary Mendoza durante dos meses de bocetos antes de tocar el oro. Las once esmeraldas briolette fueron seleccionadas en Muzo a lo largo de medio año.',
      'Cada hilo está tejido a mano. La pieza tomó 380 horas de orfebrería.',
    ],
  },
  {
    id: 'argolla-aurora', slug: 'argollas-aurora',
    name: 'Argollas Aurora', collection: 'argollas', price: 6200000,
    images: [`${ASSET}/banner.webp`, `${ASSET}/earrings-travertino.webp`],
    specs: { stones: 'Oro pulido', metal: 'Oro 18K · Ley 750', finish: 'Pulido espejo', section: 'Confort', engraving: 'Incluido' },
    description: 'La alianza no se elige para impresionar; se elige para durar. Oro 18K liso, sección confort, pensado para los 50 años que vienen.',
    story: ['Aleación europea estándar (oro 75%, plata 12.5%, paladio 12.5%) para resistencia estructural. Grabado interior incluido — fecha, iniciales o un verso.'],
  },
  {
    id: 'dije-muzo', slug: 'dije-gota-muzo',
    name: 'Dije Gota de Muzo', collection: 'dijes-colgantes', price: 8900000,
    images: [`${ASSET}/gema.webp`, `${ASSET}/earrings-emerald.webp`],
    specs: { stones: 'Esmeralda briolette', stone: 'Esmeralda Muzo Vieja', chain: 'Veneciana 45cm', metal: 'Oro amarillo 18K' },
    description: 'Una sola gota de esmeralda briolette, suspendida de una cadena veneciana de oro 18K. La piedra gira con la luz; nunca se queda quieta.',
    story: ['Esmeralda briolette de 1.8 quilates, extraída de Muzo antes de 1990 ("Muzo Vieja"). Su transparencia es notablemente superior a las de mina contemporánea.'],
  },
  {
    id: 'pulsera-tenis', slug: 'pulsera-tenis-diamante',
    name: 'Pulsera Tenis Diamante', collection: 'pulseras', price: 18600000,
    images: [`${ASSET}/ring-sapphire.webp`, `${ASSET}/banner.webp`],
    tag: 'Best Seller',
    specs: { stones: '54 diamantes', cut: 'Brillante 2.2mm', metal: 'Oro blanco 18K', clarity: 'VS · color G' },
    description: 'La pulsera tenis clásica, reinterpretada en proporciones más íntimas. 54 diamantes brillante en línea sobre oro blanco 18K.',
    story: ['Engaste tipo carril con doble seguro de mariposa. Pesa apenas 8.4 gramos pero refracta como una pieza tres veces más grande.'],
  },
  {
    id: 'anillo-jardin', slug: 'anillo-jardin-esmeralda',
    name: 'Anillo Jardín Esmeralda', collection: 'anillos', price: 16400000,
    images: [`${ASSET}/earrings-emerald.webp`, `${ASSET}/model-emerald.webp`],
    featured: true,
    specs: { stones: 'Esmeralda · 8 diamantes', stone: 'Esmeralda Chivor', metal: 'Oro amarillo 18K', size: 'Hecho a medida' },
    description: 'Una esmeralda esmeralda-cut central enmarcada por ocho diamantes baguette que dibujan un jardín cuadrado.',
    story: ['Esmeralda de 1.6 quilates, talla esmeralda 7x5mm. Los diamantes baguette están engastados a presión sin uñas — un acabado que solo se logra en oro 18K bien aleado.'],
  },
];

// Decorate products with back-compat shortcuts used by simpler components
PRODUCTS.forEach((p) => {
  p.img = p.images && p.images[0];
  const col = COLLECTIONS.find((c) => c.slug === p.collection);
  p.cat = col ? col.name : p.collection;
  p.stones = p.specs && p.specs.stones;
  p.gold = p.specs && p.specs.metal;
  p.gallery = p.images;
  p.desc = p.description;
});

// Catalog helpers (mirror of data.js API)
function getCollections() { return COLLECTIONS; }
function getAll() { return PRODUCTS; }
function getFeatured(n = 8) {
  return [...PRODUCTS].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).slice(0, n);
}
function countByCollection(slug) { return PRODUCTS.filter((p) => p.collection === slug).length; }
function getBySlug(slug) { return PRODUCTS.find((p) => p.slug === slug || p.id === slug); }
function getRelated(p, n = 3) {
  return PRODUCTS.filter((x) => x.id !== p.id && x.collection === p.collection).slice(0, n);
}

// Marquee + services (used by home)
const MARQUEE = ['Oro 18K · Ley 750', 'Esmeraldas Colombianas', 'Asesoría Personalizada', 'Garantía Vitalicia', 'Atelier en Cartagena', 'Envío Asegurado Mundial', 'Una pieza, una historia'];

const SERVICES = [
  { t: 'Diseño a medida',   d: 'Crea la pieza de tus sueños con nuestro atelier. Desde boceto hasta entrega.', icon: 'pen' },
  { t: 'Asesoría privada',  d: 'Consulta 1:1 con nuestros gemólogos. Virtual o en nuestra casa en Cartagena.', icon: 'user' },
  { t: 'Certificación GIA', d: 'Cada pieza con diamante incluye certificado del Gemological Institute.',     icon: 'check' },
  { t: 'Garantía vitalicia',d: 'Mantenimiento, pulido y verificación de piedras de por vida.',                icon: 'shield' },
];

// Atelier — 4-step process
const ATELIER = [
  { n: '01', t: 'El Diseño y Concepto', d: 'Concebimos la joya desde el boceto inicial sobre papel, seleccionando metales nobles y gemas con carácter propio.' },
  { n: '02', t: 'Asesoría Confidencial', d: 'Un diálogo íntimo y pausado para dar con la pieza exacta que refleje tu legado.' },
  { n: '03', t: 'Garantía y Certificación', d: 'Respaldamos cada piedra con reportes internacionales de la GIA y origen de mina.' },
  { n: '04', t: 'Custodia de por vida', d: 'Mantenimiento, pulido y restauración vitalicia. Nuestras piezas nacen con vocación de eternidad.' },
];

// The Bersaglio Journal — subset of production js/data/journal.js
const JOURNAL_TICKER = [
  'Nuevo: Colección Atrato 2026 disponible',
  'Live · Subasta privada Casa Bersaglio 14·04',
  'Guía: 7 mitos sobre las esmeraldas colombianas',
  'Atelier abierto · Cartagena · Cita previa',
];
const JOURNAL = [
  { slug: 'esmeraldas-historia-oculta', section: 'Reportaje', kicker: 'Las gemas que cambiaron Cartagena', title: 'Esmeraldas: la historia oculta detrás del verde colombiano', excerpt: 'Un viaje al corazón de Muzo y Coscuez, donde la geología, la herencia indígena y el oficio artesanal convergen para producir las esmeraldas más codiciadas del planeta.', date: '14·03·26', dateLong: 'Marzo 2026', read: '8 min', author: 'María Camila Bersaglio', authorRole: 'Directora editorial', img: `${ASSET}/earrings-emerald.webp`, featured: true },
  { slug: 'seis-pulsos-anillo', section: 'Atelier', kicker: 'Detrás del taller', title: 'Los seis pulsos de un anillo a medida', excerpt: 'Desde el boceto hasta la entrega, así viaja una pieza por las manos de cuatro oficios.', date: '12·03·26', dateLong: 'Marzo 2026', read: '5 min', author: 'Andrés Beltrán', authorRole: 'Diseñador atelier', img: `${ASSET}/ring-sapphire.webp` },
  { slug: 'oro-18k-vs-14k', section: 'Mercado', kicker: 'Patrimonio', title: 'Por qué el oro 18K supera al 14K en patrimonio', excerpt: 'Una diferencia de 4 quilates parece menor — pero a treinta años, la prima del 18K se nota en color, estructura y valor.', date: '06·03·26', dateLong: 'Marzo 2026', read: '4 min', author: 'Kary Mendoza', authorRole: 'Directora', img: `${ASSET}/banner-hero.webp` },
  { slug: 'trinity-cartier', section: 'Diseño', kicker: 'Historia del diseño', title: 'Trinity: la geometría que enamoró a Cartier', excerpt: 'Tres anillos entrelazados, tres metales, tres significados.', date: '28·02·26', dateLong: 'Febrero 2026', read: '6 min', author: 'María Camila Bersaglio', authorRole: 'Directora editorial', img: `${ASSET}/model-emerald.webp` },
  { slug: 'rituales-diamante', section: 'Cuidado', kicker: 'Mantenimiento', title: 'Rituales caseros para conservar el fuego de tu diamante', excerpt: 'Una rutina mensual de tres pasos para que tu diamante mantenga el brillo del primer día.', date: '19·02·26', dateLong: 'Febrero 2026', read: '3 min', author: 'Lucía Restrepo', authorRole: 'Gemóloga GIA', img: `${ASSET}/earrings-travertino.webp` },
  { slug: 'paciencia-geologica', section: 'Entrevista', kicker: 'Conversaciones del atelier', title: '"La esmeralda es paciencia geológica"', excerpt: 'Andrés Forero, gemólogo GIA con 18 años de oficio, sobre cómo leer una piedra.', date: '14·02·26', dateLong: 'Febrero 2026', read: '9 min', author: 'María Camila Bersaglio', authorRole: 'Directora editorial', img: `${ASSET}/gema.webp` },
];
const JOURNAL_ISSUE = { number: 'Issue Nº 14', date: 'Marzo 2026', est: 'EST. 2014' };

// ── Bersaglio Films · multimedia (videos) ──────────────────────────
const VIDEO_CATEGORIES = ['Todos', 'Atelier', 'Educativo', 'Colección', 'Ofertas', 'Inventario'];
const VIDEOS = [
  { id: 'v-laverde',   title: 'El nacimiento de La Verde',          cat: 'Atelier',    dur: '4:12', thumb: `${ASSET}/model-emerald.webp`, featured: true,  desc: '380 horas de orfebrería condensadas en un cortometraje. La pieza central de la campaña 2026, de la mina al cuello.' },
  { id: 'v-leer',      title: 'Cómo leer una esmeralda',            cat: 'Educativo',  dur: '6:30', thumb: `${ASSET}/gema.webp` },
  { id: 'v-atrato',    title: 'Colección Atrato · 2026',            cat: 'Colección',  dur: '1:45', thumb: `${ASSET}/earrings-emerald.webp` },
  { id: 'v-argollas',  title: '−15% en argollas de boda',           cat: 'Ofertas',    dur: '0:30', thumb: `${ASSET}/banner.webp`, badge: 'Oferta' },
  { id: 'v-pave',      title: 'Detrás del engaste pavé',            cat: 'Atelier',    dur: '3:20', thumb: `${ASSET}/ring-sapphire.webp` },
  { id: 'v-muzo',      title: 'Muzo vs Coscuez: el verde decide',   cat: 'Educativo',  dur: '5:10', thumb: `${ASSET}/earrings-travertino.webp` },
  { id: 'v-inventario',title: 'Esmeraldas disponibles esta semana', cat: 'Inventario', dur: '2:00', thumb: `${ASSET}/collage.webp`, badge: 'En vivo' },
  { id: 'v-historia',  title: 'Una pieza, una historia',            cat: 'Atelier',    dur: '2:48', thumb: `${ASSET}/banner-hero.webp` },
];

// ── Social feed (latest posts; in production fed from Meta/TikTok APIs → Firestore) ──
const SOCIAL_PLATFORMS = ['Todas', 'Instagram', 'Facebook', 'TikTok'];
const SOCIAL = [
  { platform: 'Instagram', thumb: `${ASSET}/earrings-emerald.webp`, caption: 'Topos Halo recién salidos del atelier ✨', stat: '2.4k', kind: 'likes', date: 'hace 2 h', type: 'reel' },
  { platform: 'TikTok',    thumb: `${ASSET}/gema.webp`,             caption: 'POV: ves una Muzo Vieja por primera vez', stat: '38.1k', kind: 'views', date: 'hace 5 h', type: 'video' },
  { platform: 'Instagram', thumb: `${ASSET}/ring-sapphire.webp`,   caption: 'El zafiro Trinity, edición de 12 piezas', stat: '1.9k', kind: 'likes', date: 'ayer', type: 'photo' },
  { platform: 'Facebook',  thumb: `${ASSET}/model-emerald.webp`,    caption: 'Nuestro atelier te espera con un café', stat: '512', kind: 'likes', date: 'ayer', type: 'photo' },
  { platform: 'TikTok',    thumb: `${ASSET}/banner-hero.webp`,      caption: 'Cartagena al atardecer desde el atelier', stat: '64.7k', kind: 'views', date: 'hace 2 d', type: 'video' },
  { platform: 'Instagram', thumb: `${ASSET}/earrings-travertino.webp`, caption: 'Detalle: engaste pavé a 40x de aumento', stat: '3.1k', kind: 'likes', date: 'hace 3 d', type: 'reel' },
  { platform: 'Facebook',  thumb: `${ASSET}/collage.webp`,          caption: 'Colección Atrato 2026 · ya disponible', stat: '847', kind: 'likes', date: 'hace 4 d', type: 'photo' },
  { platform: 'TikTok',    thumb: `${ASSET}/banner.webp`,           caption: 'Cómo limpiar tu esmeralda en casa', stat: '22.5k', kind: 'views', date: 'hace 5 d', type: 'video' },
];

const fmt$ = (n) => '$ ' + Number(n).toLocaleString('es-CO') + ' COP';
const fmtShort = (n) => '$ ' + (n / 1000000).toFixed(1).replace('.0', '') + 'M';

// Legacy alias used by simplified Home/Catalog screens
const CATEGORIES = COLLECTIONS.map((c) => ({ name: c.name, slug: c.slug, img: PRODUCTS.find((p) => p.collection === c.slug)?.img || `${ASSET}/banner.webp` }));

Object.assign(window, {
  COLLECTIONS, CATEGORIES, PRODUCTS, MARQUEE, SERVICES, ATELIER,
  JOURNAL, JOURNAL_TICKER, JOURNAL_ISSUE,
  VIDEOS, VIDEO_CATEGORIES, SOCIAL, SOCIAL_PLATFORMS,
  getCollections, getAll, getFeatured, countByCollection, getBySlug, getRelated,
  fmt$, fmtShort,
});
