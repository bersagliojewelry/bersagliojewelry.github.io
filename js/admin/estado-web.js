/**
 * js/admin/estado-web.js — Tarjeta "Estado de tu web" (cero-ficción · UX Kary).
 *
 * Resumen VIVO, en lenguaje de Kary (sin jerga), de qué secciones gestionables del
 * index se ven HOY en la web y cuáles aún no. Usa la MISMA fuente de umbrales y
 * completitud que el render público y la columna "¿Se ve en la web?"
 * (js/core/home-sections.js) → es imposible que el panel diga una cosa y la web otra.
 *
 * Suscribe 3 colecciones (films/socialPosts/journal) y se desuscribe en destroy().
 * Las secciones de IDENTIDAD estática (Inicio, Nosotros, Contacto) SIEMPRE se ven
 * (copy real de marca), por eso no dependen de un umbral.
 */
import { onCollectionChange } from '../firestore-service.js';
import { mount } from '../core/html.js';
import { esc } from './shared.js';
import {
    MIN_FILMS, MIN_SOCIAL, MIN_JOURNAL,
    isFilmComplete, isSocialComplete, isJournalComplete,
} from '../core/home-sections.js';

// Secciones DINÁMICAS del index (las que pueden estar vacías). `coll` = colección Firestore.
const SECTIONS = [
    { coll: 'films',       label: 'Videos',  min: MIN_FILMS,   complete: isFilmComplete   },
    { coll: 'socialPosts', label: 'Redes',   min: MIN_SOCIAL,  complete: isSocialComplete },
    { coll: 'journal',     label: 'Journal', min: MIN_JOURNAL, complete: isJournalComplete },
];

export function createEstadoWeb() {
    let host = null;
    const state = { films: [], socialPosts: [], journal: [] };
    const unsubs = [];

    const qualifying = (list, complete) =>
        list.filter(it => it.published === true && complete(it).complete).length;

    function render() {
        if (!host) return;
        const visibles = ['Inicio', 'Nosotros', 'Contacto'];   // identidad estática: siempre
        const ocultas  = [];
        for (const s of SECTIONS) {
            const n = qualifying(state[s.coll] || [], s.complete);
            if (n >= s.min) visibles.push(`${s.label} (${n})`);
            else            ocultas.push(`${s.label} (faltan ${s.min - n})`);
        }
        const ocultasHTML = ocultas.length
            ? `<p style="margin:8px 0 0;font-size:13px;color:#9a7730;"><strong>Aún no se ven:</strong> ${esc(ocultas.join(', '))}.</p>`
            : `<p style="margin:8px 0 0;font-size:13px;color:var(--adm-success);"><strong>Todo lo que gestionas se está viendo en tu web.</strong></p>`;
        mount(host, `
            <div style="border:1px solid var(--adm-border);border-radius:var(--adm-radius);padding:16px 18px;background:var(--adm-accent-light);">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
                    <h2 style="margin:0;font-size:15px;color:var(--adm-accent);">Estado de tu web</h2>
                    <a class="adm-btn adm-btn--ghost adm-btn--sm" href="index.html" target="_blank" rel="noopener">Ver mi web como cliente ↗</a>
                </div>
                <p style="margin:10px 0 0;font-size:13px;color:var(--adm-text,#333);"><strong>Hoy se ve:</strong> ${esc(visibles.join(', '))}.</p>
                ${ocultasHTML}
            </div>`);
    }

    function mountInto(hostEl) {
        host = hostEl;
        render();   // pinta de inmediato (identidad estática) y se enriquece al llegar los datos
        unsubs.push(onCollectionChange('films',       list => { state.films       = list; render(); }, { limit: 200, truncationLabel: 'videos' }));
        unsubs.push(onCollectionChange('socialPosts', list => { state.socialPosts = list; render(); }, { limit: 200, truncationLabel: 'publicaciones' }));
        unsubs.push(onCollectionChange('journal',     list => { state.journal     = list; render(); }, { limit: 200, truncationLabel: 'entradas' }));
    }

    function destroy() {
        unsubs.forEach(u => { try { u(); } catch { /* noop */ } });
        unsubs.length = 0;
        if (host) mount(host, '');
        host = null;
    }

    return { mount: mountInto, destroy };
}

export default createEstadoWeb;
