/**
 * js/admin/contenido-tabs.js — Registro de pestañas del panel "Contenido web"
 * (admin-contenido.html). Decisión UX #3 del comité: UNA página de pestañas, no
 * 6 admin-*.html sueltos. Cada pestaña expone un controlador { mount, destroy }.
 *
 * Recursos-LISTA (journal/films/social) usan el motor genérico createResourceAdmin
 * con un DESCRIPTOR (~30 líneas). Singletons (siteContent/home, nosotros, global)
 * usarán otro scaffold (form→setDoc) cuando aterricen — se registran aquí igual.
 */
import { createResourceAdmin } from './resource-admin.js';
import { createSingletonAdmin } from './singleton-admin.js';
import { HOME_DEFAULTS } from '../home/siteContent-defaults.js';
import { CONTACTO_DEFAULTS } from '../pages/contacto-defaults.js';
import { NOSOTROS_DEFAULTS } from '../pages/nosotros-defaults.js';
import { renderHomePreview } from './home-preview.js';
import { renderContactoPreview } from './contacto-preview.js';
import { renderNosotrosPreview } from './nosotros-preview.js';

// ─── Descriptor: Journal (entradas editoriales) ─────────────────────────────────
// El esquema del doc (campos) coincide con el contrato que consumen las páginas
// públicas (js/data/journal.js): title/section/kicker/excerpt/body/date/read/
// author/authorRole/image/featured. El id del doc = slug (URL SEO).
const journalDescriptor = {
    collection: 'journal',
    singular:   'entrada',
    plural:     'entradas',
    titleKey:   'title',
    idFrom:     'slug',
    listLimit:  100,
    columns: [
        { key: 'title',     label: 'Título',    type: 'text'  },
        { key: 'section',   label: 'Sección',   type: 'text'  },
        { key: 'date',      label: 'Fecha',     type: 'date'  },
        { key: 'published', label: 'Estado',    type: 'badge', on: 'Publicada', off: 'Borrador' },
    ],
    fields: [
        { name: 'title',      label: 'Título',                       type: 'text',     required: true, slugSource: true, placeholder: 'El alma verde de Muzo' },
        { name: 'slug',       label: 'Slug (URL)',                   type: 'slug',     hint: 'Se genera del título. Al editar una entrada ya creada, el enlace no cambia.' },
        { name: 'section',    label: 'Sección',                      type: 'text',     placeholder: 'Reportaje · Atelier · Mercado · Diseño…' },
        { name: 'kicker',     label: 'Antetítulo (sobre la imagen)', type: 'text',     placeholder: 'Las gemas que cambiaron Cartagena' },
        { name: 'date',       label: 'Fecha',                        type: 'date'      },
        { name: 'read',       label: 'Tiempo de lectura',            type: 'text',     placeholder: '5 min' },
        { name: 'author',     label: 'Autor',                        type: 'text',     placeholder: 'Por María Camila Bersaglio' },
        { name: 'authorRole', label: 'Cargo del autor',              type: 'text',     placeholder: 'Directora editorial' },
        { name: 'image',      label: 'Imagen de portada',            type: 'image'     },
        { name: 'excerpt',    label: 'Resumen (tarjeta del listado)',type: 'textarea', rows: 2 },
        { name: 'body',       label: 'Cuerpo del artículo',          type: 'textarea', rows: 12, hint: 'Separa párrafos con una línea en blanco.' },
        { name: 'featured',   label: 'Destacada (portada del Journal)', type: 'checkbox' },
        { name: 'published',  label: 'Publicada (visible en la web)',   type: 'checkbox' },
    ],
    toDoc(v) {
        const doc = {
            title:      v.title,
            section:    v.section    || '',
            kicker:     v.kicker     || '',
            read:       v.read       || '',
            author:     v.author     || '',
            authorRole: v.authorRole || '',
            image:      v.image      || '',
            excerpt:    v.excerpt    || '',
            body:       v.body       || '',
            featured:   !!v.featured,
            published:  !!v.published,
        };
        if (v.slug) doc.slug = v.slug;     // el id ya es el slug; se guarda por trazabilidad
        if (v.date) doc.date = v.date;     // omitir vacío: '' no pasa el regex ISO de las reglas
        return doc;
    },
};

// ─── Descriptor: Textos del Home (SINGLETON siteContent/home) ───────────────────
// P1 del gran plan: textos de hero/editorial editables por formulario. Los DEFAULTS
// (texto actual horneado) pre-rellenan el form; el render público hace merge(DEFAULTS,
// doc). Estructura/imágenes = estandarizadas (no editables aquí). stats = campos planos.
const homeTextsDescriptor = {
    page:  'home',
    title: 'Textos del Home',
    help:  'Edita los textos del inicio y míralos al instante en la vista previa de la derecha. Guarda para publicarlos.',
    defaults: HOME_DEFAULTS,
    preview: { render: renderHomePreview, cssFrom: '/' },
    sections: [
        { key: 'hero', label: 'Portada (Hero)', fields: [
            { name: 'bgImage',          label: 'Imagen de portada',           type: 'image', hint: 'Reemplaza la foto de fondo del inicio. Se optimiza sola; vacío = la imagen actual de la web.' },
            { name: 'locator',          label: 'Ubicación (línea superior)',  type: 'text', max: 44 },
            { name: 'eyebrow',          label: 'Eyebrow (línea pequeña)',     type: 'text', max: 56 },
            { name: 'headline1',        label: 'Titular — línea 1',           type: 'text', max: 48 },
            { name: 'headline2',        label: 'Titular — línea 2 (cursiva)', type: 'text', max: 48 },
            { name: 'manifesto',        label: 'Manifiesto (párrafo)',        type: 'textarea', rows: 5, max: 700 },
            { name: 'ctaLabel',         label: 'Botón — texto',               type: 'text', max: 32 },
            { name: 'ctaHref',          label: 'Botón — enlace',              type: 'text', hint: 'Ruta interna, ej. /colecciones.html' },
            { name: 'signatureEyebrow', label: 'Firma — antetítulo',          type: 'text', max: 24 },
            { name: 'signatureName',    label: 'Firma — nombre',              type: 'text', max: 32 },
        ]},
        { key: 'editorial', label: 'Editorial (filosofía)', fields: [
            { name: 'chip',       label: 'Chip de la imagen',           type: 'text', max: 20 },
            { name: 'imageTitle', label: 'Imagen — título',             type: 'text', max: 32 },
            { name: 'imageSub',   label: 'Imagen — subtítulo',          type: 'text', max: 90 },
            { name: 'eyebrow',    label: 'Eyebrow',                     type: 'text', max: 32 },
            { name: 'title1',     label: 'Título — línea 1',            type: 'text', max: 56 },
            { name: 'title2',     label: 'Título — línea 2 (cursiva)',  type: 'text', max: 56 },
            { name: 'lead',       label: 'Párrafo principal',           type: 'textarea', rows: 4, max: 460 },
            { name: 'quote',      label: 'Cita',                        type: 'textarea', rows: 3, max: 340 },
            { name: 'stat1Num',   label: 'Dato 1 — número',             type: 'text', max: 8 },
            { name: 'stat1Lab',   label: 'Dato 1 — etiqueta',           type: 'text', max: 18 },
            { name: 'stat2Num',   label: 'Dato 2 — número',             type: 'text', max: 8 },
            { name: 'stat2Lab',   label: 'Dato 2 — etiqueta',           type: 'text', max: 18 },
            { name: 'stat3Num',   label: 'Dato 3 — número',             type: 'text', max: 8 },
            { name: 'stat3Lab',   label: 'Dato 3 — etiqueta',           type: 'text', max: 18 },
        ]},
        { key: 'atelier', label: 'Atelier (el viaje de creación)', fields: [
            { name: 'chip',       label: 'Chip',                        type: 'text', max: 28 },
            { name: 'title1',     label: 'Título — línea 1',            type: 'text', max: 40 },
            { name: 'title2',     label: 'Título — línea 2 (cursiva)',  type: 'text', max: 36 },
            { name: 'lead',       label: 'Bajada',                      type: 'textarea', rows: 2, max: 120 },
            { name: 'step1Title', label: 'Paso 1 — título',             type: 'text', max: 36 },
            { name: 'step1Desc',  label: 'Paso 1 — descripción',        type: 'textarea', rows: 2, max: 190 },
            { name: 'step2Title', label: 'Paso 2 — título',             type: 'text', max: 36 },
            { name: 'step2Desc',  label: 'Paso 2 — descripción',        type: 'textarea', rows: 2, max: 190 },
            { name: 'step3Title', label: 'Paso 3 — título',             type: 'text', max: 36 },
            { name: 'step3Desc',  label: 'Paso 3 — descripción',        type: 'textarea', rows: 2, max: 190 },
            { name: 'step4Title', label: 'Paso 4 — título',             type: 'text', max: 36 },
            { name: 'step4Desc',  label: 'Paso 4 — descripción',        type: 'textarea', rows: 2, max: 190 },
            { name: 'ctaLabel',   label: 'Botón — texto',               type: 'text', max: 28 },
            { name: 'ctaHref',    label: 'Botón — enlace',              type: 'text', hint: 'Ruta interna, ej. /contacto.html' },
        ]},
        { key: 'cta', label: 'Cierre (Nuestra Maison · Cartagena)', fields: [
            { name: 'eyebrow',   label: 'Eyebrow',                     type: 'text', max: 44 },
            { name: 'title1',    label: 'Título — línea 1',            type: 'text', max: 28 },
            { name: 'title2',    label: 'Título — línea 2 (cursiva)',  type: 'text', max: 32 },
            { name: 'lead',      label: 'Párrafo',                     type: 'textarea', rows: 3, max: 320 },
            { name: 'cta1Label', label: 'Botón 1 — texto',            type: 'text', max: 30 },
            { name: 'cta1Href',  label: 'Botón 1 — enlace',           type: 'text', hint: 'Ruta interna, ej. /contacto.html' },
            { name: 'cta2Label', label: 'Botón 2 — texto',            type: 'text', max: 30 },
            { name: 'cta2Href',  label: 'Botón 2 — enlace',           type: 'text', hint: 'Ruta interna, ej. /colecciones.html' },
            { name: 'address',   label: 'Dirección',                  type: 'text', max: 100 },
        ]},
    ],
};

// ─── Descriptor: Textos de Contacto (SINGLETON siteContent/contacto) ────────────
// Solo el COPY (hero/proceso/faq); formulario, canales y horarios = estandarizados.
const contactoTextsDescriptor = {
    page:  'contacto',
    title: 'Textos de Contacto',
    help:  'Edita los textos de contacto (encabezado, "qué esperar" y FAQ) y míralos al instante en la vista previa. El formulario y los canales se gestionan aparte.',
    defaults: CONTACTO_DEFAULTS,
    preview: { render: renderContactoPreview, cssFrom: '/contacto.html' },
    sections: [
        { key: 'hero', label: 'Encabezado', fields: [
            { name: 'eyebrow',    label: 'Eyebrow',                     type: 'text', max: 44 },
            { name: 'titleLine1', label: 'Título — línea 1',            type: 'text', max: 40 },
            { name: 'titleEm',    label: 'Título — parte en cursiva',   type: 'text', max: 36 },
            { name: 'titleTail',  label: 'Título — cierre',             type: 'text', max: 24 },
            { name: 'lead',       label: 'Bajada',                      type: 'textarea', rows: 3, max: 320 },
        ]},
        { key: 'proceso', label: 'Qué esperar (proceso)', fields: [
            { name: 'eyebrow',    label: 'Eyebrow',                     type: 'text', max: 44 },
            { name: 'title1',     label: 'Título',                      type: 'text', max: 40 },
            { name: 'title2',     label: 'Título — cursiva',            type: 'text', max: 36 },
            { name: 'step1Title', label: 'Paso 1 — título',             type: 'text', max: 36 },
            { name: 'step1Desc',  label: 'Paso 1 — descripción',        type: 'textarea', rows: 2, max: 150 },
            { name: 'step1Time',  label: 'Paso 1 — tiempo',             type: 'text', max: 16 },
            { name: 'step2Title', label: 'Paso 2 — título',             type: 'text', max: 36 },
            { name: 'step2Desc',  label: 'Paso 2 — descripción',        type: 'textarea', rows: 2, max: 150 },
            { name: 'step2Time',  label: 'Paso 2 — tiempo',             type: 'text', max: 16 },
            { name: 'step3Title', label: 'Paso 3 — título',             type: 'text', max: 36 },
            { name: 'step3Desc',  label: 'Paso 3 — descripción',        type: 'textarea', rows: 2, max: 150 },
            { name: 'step3Time',  label: 'Paso 3 — tiempo',             type: 'text', max: 16 },
            { name: 'step4Title', label: 'Paso 4 — título',             type: 'text', max: 36 },
            { name: 'step4Desc',  label: 'Paso 4 — descripción',        type: 'textarea', rows: 2, max: 150 },
            { name: 'step4Time',  label: 'Paso 4 — tiempo',             type: 'text', max: 16 },
        ]},
        { key: 'faq', label: 'Preguntas frecuentes', fields: [
            { name: 'eyebrow', label: 'Eyebrow',            type: 'text', max: 44 },
            { name: 'title1',  label: 'Título',             type: 'text', max: 40 },
            { name: 'title2',  label: 'Título — cursiva',   type: 'text', max: 36 },
            { name: 'lead',    label: 'Bajada',             type: 'textarea', rows: 2, max: 200 },
            { name: 'q1', label: 'Pregunta 1', type: 'text', max: 90 },     { name: 'a1', label: 'Respuesta 1', type: 'textarea', rows: 2, max: 320 },
            { name: 'q2', label: 'Pregunta 2', type: 'text', max: 90 },     { name: 'a2', label: 'Respuesta 2', type: 'textarea', rows: 2, max: 320 },
            { name: 'q3', label: 'Pregunta 3', type: 'text', max: 90 },     { name: 'a3', label: 'Respuesta 3', type: 'textarea', rows: 2, max: 320 },
            { name: 'q4', label: 'Pregunta 4', type: 'text', max: 90 },     { name: 'a4', label: 'Respuesta 4', type: 'textarea', rows: 2, max: 320 },
        ]},
    ],
};

// ─── Descriptor: Textos de Nosotros (SINGLETON siteContent/nosotros) ────────────
// P4: 8 sub-mapas = whitelist de firestore.rules. Texto plano + LISTAS repetibles
// (valores/timeline/equipo/stats/certs/reseñas/faqs). Las listas viven dentro de su
// sub-mapa (ya `is map`) → cero cambio de reglas. Vaciar una lista → la sección
// desaparece (hide-when-empty). El nº 01.. de valores y el avatar de equipo se derivan.
const nosotrosTextsDescriptor = {
    page:  'nosotros',
    title: 'Textos de Nosotros',
    help:  'Edita los textos y las listas de Nosotros: añade, quita o reordena elementos con los botones de cada tarjeta. La vista previa muestra el primer capítulo y la primera pregunta abiertos (en la web funcionan al hacer clic). Si vacías una lista por completo, esa sección desaparece de la web.',
    defaults: NOSOTROS_DEFAULTS,
    preview: { render: renderNosotrosPreview, cssFrom: '/nosotros.html' },
    sections: [
        { key: 'hero', label: 'Portada (Hero)', fields: [
            { name: 'eyebrow',      label: 'Antetítulo',                  type: 'text', max: 44 },
            { name: 'titleL1',      label: 'Título — línea 1',            type: 'text', max: 32 },
            { name: 'titleEm',      label: 'Título — línea 2 (cursiva)',  type: 'text', max: 32 },
            { name: 'titleTail',    label: 'Título — línea 3',            type: 'text', max: 32 },
            { name: 'lead',         label: 'Párrafo principal',           type: 'textarea', rows: 4, max: 480 },
            { name: 'leadItalic',   label: 'Párrafo en cursiva',          type: 'textarea', rows: 3, max: 320 },
            { name: 'imageEyebrow', label: 'Imagen — antetítulo',         type: 'text', max: 44 },
            { name: 'quote',        label: 'Cita (sin comillas)',         type: 'text', max: 80 },
            { name: 'quoteAuthor',  label: 'Cita — autor',                type: 'text', max: 32 },
        ]},
        { key: 'manifiesto', label: 'Manifiesto', fields: [
            { name: 'titlePre',  label: 'Frase — inicio',                type: 'textarea', rows: 2, max: 120 },
            { name: 'titleEm',   label: 'Frase — parte en cursiva',      type: 'text', max: 80 },
            { name: 'titleTail', label: 'Frase — cierre',                type: 'textarea', rows: 2, max: 200 },
            { name: 'foot',      label: 'Pie (firma)',                   type: 'text', max: 60 },
        ]},
        { key: 'maison', label: 'Filosofía (Misión / Visión)', fields: [
            { name: 'misionTitle', label: 'Misión — título',            type: 'text', max: 40 },
            { name: 'misionDesc',  label: 'Misión — texto',             type: 'textarea', rows: 4, max: 460 },
            { name: 'visionTitle', label: 'Visión — título',            type: 'text', max: 40 },
            { name: 'visionDesc',  label: 'Visión — texto',             type: 'textarea', rows: 4, max: 460 },
        ]},
        { key: 'valores', label: 'Valores (lista)', fields: [
            { name: 'eyebrow',  label: 'Antetítulo',                  type: 'text', max: 44 },
            { name: 'titlePre', label: 'Título — inicio',            type: 'text', max: 48 },
            { name: 'titleEm',  label: 'Título — parte en cursiva',  type: 'text', max: 36 },
            { name: 'items', type: 'list', max: 12, addLabel: 'Añadir valor', singular: 'Valor', itemTitleFrom: 't', itemFields: [
                { name: 't', label: 'Título',      type: 'text', max: 48 },
                { name: 'd', label: 'Descripción', type: 'textarea', rows: 2, max: 240 },
            ]},
        ]},
        { key: 'timeline', label: 'Línea de tiempo (lista)', fields: [
            { name: 'titlePre', label: 'Título — inicio',           type: 'text', max: 48 },
            { name: 'titleEm',  label: 'Título — parte en cursiva', type: 'text', max: 36 },
            { name: 'items', type: 'list', max: 12, addLabel: 'Añadir capítulo', singular: 'Capítulo', itemTitleFrom: 't', itemFields: [
                { name: 'y', label: 'Año',         type: 'text', max: 8 },
                { name: 't', label: 'Título',      type: 'text', max: 60 },
                { name: 'd', label: 'Descripción', type: 'textarea', rows: 3, max: 380 },
            ]},
        ]},
        { key: 'equipo', label: 'Equipo (lista)', fields: [
            { name: 'items', type: 'list', max: 12, addLabel: 'Añadir persona', singular: 'Persona', itemTitleFrom: 'n', itemFields: [
                { name: 'n', label: 'Nombre',      type: 'text', max: 48 },
                { name: 'r', label: 'Cargo',       type: 'text', max: 48 },
                { name: 'b', label: 'Biografía',   type: 'textarea', rows: 3, max: 380 },
            ]},
        ]},
        { key: 'atelier', label: 'Atelier (la casa)', fields: [
            { name: 'title1',      label: 'Título — línea 1',            type: 'text', max: 40 },
            { name: 'titleEm',     label: 'Título — línea 2 (cursiva)',  type: 'text', max: 36 },
            { name: 'p1',          label: 'Párrafo 1',                   type: 'textarea', rows: 3, max: 380 },
            { name: 'p2',          label: 'Párrafo 2',                   type: 'textarea', rows: 3, max: 380 },
            { name: 'ubicacionL1', label: 'Ubicación — línea 1',         type: 'text', max: 60 },
            { name: 'ubicacionL2', label: 'Ubicación — línea 2',         type: 'text', max: 60 },
            { name: 'visitasL1',   label: 'Visitas — línea 1',           type: 'text', max: 48 },
            { name: 'visitasL2',   label: 'Visitas — línea 2',           type: 'text', max: 48 },
        ]},
        { key: 'cifras', label: 'Cifras (lista)', fields: [
            { name: 'items', type: 'list', max: 6, addLabel: 'Añadir cifra', singular: 'Cifra', itemTitleFrom: 'l', itemFields: [
                { name: 'n', label: 'Número',   type: 'text', max: 12 },
                { name: 'l', label: 'Etiqueta', type: 'text', max: 28 },
                { name: 's', label: 'Detalle',  type: 'text', max: 40 },
            ]},
        ]},
        { key: 'certificaciones', label: 'Certificaciones (lista)', fields: [
            { name: 'items', type: 'list', max: 8, addLabel: 'Añadir certificación', singular: 'Certificación', itemTitleFrom: 't', itemFields: [
                { name: 't', label: 'Título',      type: 'text', max: 48 },
                { name: 'd', label: 'Descripción', type: 'text', max: 80 },
            ]},
        ]},
        { key: 'resenas', label: 'Reseñas (lista)', fields: [
            { name: 'items', type: 'list', max: 12, addLabel: 'Añadir reseña', singular: 'Reseña', itemTitleFrom: 'n', itemFields: [
                { name: 'n',   label: 'Nombre',  type: 'text', max: 48 },
                { name: 't',   label: 'Reseña',  type: 'textarea', rows: 3, max: 320 },
                { name: 'loc', label: 'Fuente',  type: 'text', max: 40 },
            ]},
        ]},
        { key: 'faqs', label: 'Preguntas frecuentes (lista)', fields: [
            { name: 'items', type: 'list', max: 12, addLabel: 'Añadir pregunta', singular: 'Pregunta', itemTitleFrom: 'q', itemFields: [
                { name: 'q', label: 'Pregunta',  type: 'text', max: 90 },
                { name: 'a', label: 'Respuesta', type: 'textarea', rows: 3, max: 380 },
            ]},
        ]},
        { key: 'cierre', label: 'Cierre (botón final)', fields: [
            { name: 'ctaEyebrow', label: 'Antetítulo',                  type: 'text', max: 44 },
            { name: 'ctaTitle1',  label: 'Título — línea 1',            type: 'text', max: 28 },
            { name: 'ctaTitleEm', label: 'Título — línea 2 (cursiva)',  type: 'text', max: 36 },
            { name: 'ctaLead',    label: 'Párrafo',                     type: 'textarea', rows: 3, max: 320 },
            { name: 'ctaLabel',   label: 'Botón',                       type: 'text', max: 30 },
        ]},
    ],
};

// ─── Registro de pestañas ───────────────────────────────────────────────────────
// id = ancla en la URL (#journal). create() devuelve un controlador fresco por
// activación (el shell hace destroy() al cambiar de pestaña → sin listeners zombi).
export const TABS = [
    { id: 'journal',  label: 'Journal',            create: () => createResourceAdmin(journalDescriptor) },
    { id: 'home',     label: 'Textos del Home',    create: () => createSingletonAdmin(homeTextsDescriptor) },
    { id: 'contacto', label: 'Textos de Contacto', create: () => createSingletonAdmin(contactoTextsDescriptor) },
    { id: 'nosotros', label: 'Textos de Nosotros', create: () => createSingletonAdmin(nosotrosTextsDescriptor) },
    // Próximas (cuando aterricen): films, social, footer.
];

export default TABS;
