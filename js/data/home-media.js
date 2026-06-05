/**
 * Bersaglio Jewelry — Datos de Films y Redes del home.
 *
 * HARDCODED ahora, con forma lista para Firestore (Fase 2 del CRM podrá migrarlos;
 * las secciones ya re-renderizan vía sus init()). Miniaturas → /img/ (assets ya
 * optimizados en public/img).
 *
 * TODO (contenido real):
 *  - FILMS: conectar a fuente real (Firestore `films/` o Storage / YouTube / Vimeo).
 *  - SOCIAL: feed real vía Meta Graph API (Instagram/Facebook) + TikTok Display API,
 *    cacheado server-side cada X horas. Hoy son ejemplos representativos.
 */

export const VIDEO_CATEGORIES = ['Todos', 'Atelier', 'Educativo', 'Colección', 'Ofertas', 'Inventario'];

export const FILMS = [
    { id: 'v-laverde',    title: 'El nacimiento de La Verde',          cat: 'Atelier',    dur: '4:12', thumb: '/img/model-emerald-800.webp',     featured: true, desc: '380 horas de orfebrería condensadas en un cortometraje. La pieza central de la campaña 2026, de la mina al cuello.' },
    { id: 'v-leer',       title: 'Cómo leer una esmeralda',            cat: 'Educativo',  dur: '6:30', thumb: '/img/gema.webp' },
    { id: 'v-atrato',     title: 'Colección Atrato · 2026',            cat: 'Colección',  dur: '1:45', thumb: '/img/earrings-emerald-800.webp' },
    { id: 'v-argollas',   title: '−15% en argollas de boda',           cat: 'Ofertas',    dur: '0:30', thumb: '/img/banner.webp',                badge: 'Oferta' },
    { id: 'v-pave',       title: 'Detrás del engaste pavé',            cat: 'Atelier',    dur: '3:20', thumb: '/img/ring-sapphire-800.webp' },
    { id: 'v-muzo',       title: 'Muzo vs Coscuez: el verde decide',   cat: 'Educativo',  dur: '5:10', thumb: '/img/earrings-travertino-800.webp' },
    { id: 'v-inventario', title: 'Esmeraldas disponibles esta semana', cat: 'Inventario', dur: '2:00', thumb: '/img/collage-800.webp',           badge: 'En vivo' },
    { id: 'v-historia',   title: 'Una pieza, una historia',            cat: 'Atelier',    dur: '2:48', thumb: '/img/banner-hero-800.webp' },
];

export const SOCIAL_PLATFORMS = ['Todas', 'Instagram', 'Facebook', 'TikTok'];

export const SOCIAL = [
    { platform: 'Instagram', thumb: '/img/earrings-emerald-800.webp',    caption: 'Topos Halo recién salidos del atelier',  stat: '2.4k',  kind: 'likes', date: 'hace 2 h', type: 'reel' },
    { platform: 'TikTok',    thumb: '/img/gema.webp',                    caption: 'POV: ves una Muzo Vieja por primera vez', stat: '38.1k', kind: 'views', date: 'hace 5 h', type: 'video' },
    { platform: 'Instagram', thumb: '/img/ring-sapphire-800.webp',       caption: 'El zafiro Trinity, edición de 12 piezas',  stat: '1.9k',  kind: 'likes', date: 'ayer',     type: 'photo' },
    { platform: 'Facebook',  thumb: '/img/model-emerald-800.webp',       caption: 'Nuestro atelier te espera con un café',    stat: '512',   kind: 'likes', date: 'ayer',     type: 'photo' },
    { platform: 'TikTok',    thumb: '/img/banner-hero-800.webp',         caption: 'Cartagena al atardecer desde el atelier',  stat: '64.7k', kind: 'views', date: 'hace 2 d', type: 'video' },
    { platform: 'Instagram', thumb: '/img/earrings-travertino-800.webp', caption: 'Detalle: engaste pavé a 40x de aumento',   stat: '3.1k',  kind: 'likes', date: 'hace 3 d', type: 'reel' },
    { platform: 'Facebook',  thumb: '/img/collage-800.webp',             caption: 'Colección Atrato 2026 · ya disponible',    stat: '847',   kind: 'likes', date: 'hace 4 d', type: 'photo' },
    { platform: 'TikTok',    thumb: '/img/banner.webp',                  caption: 'Cómo limpiar tu esmeralda en casa',        stat: '22.5k', kind: 'views', date: 'hace 5 d', type: 'video' },
];
