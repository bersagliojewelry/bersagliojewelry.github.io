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

// ─── Registro de pestañas ───────────────────────────────────────────────────────
// id = ancla en la URL (#journal). create() devuelve un controlador fresco por
// activación (el shell hace destroy() al cambiar de pestaña → sin listeners zombi).
export const TABS = [
    { id: 'journal', label: 'Journal', create: () => createResourceAdmin(journalDescriptor) },
    // Próximas (cuando aterricen): home (singleton), nosotros, films, social, footer.
];

export default TABS;
