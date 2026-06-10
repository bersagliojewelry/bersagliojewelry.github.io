/**
 * Bersaglio Admin — Parámetros del sistema (M0-C, solo owner).
 *
 * Render dirigido por metadatos (SECCIONES/LISTAS de parametros-form.js, módulo
 * puro): una sola fuente de definición de campos. Guardado POR SECCIÓN con
 * validación completa antes de escribir; "Restaurar recomendados" por sección.
 * La frontera real es la regla `config/cartera` write owner-only.
 *
 * XSS: todo valor dinámico interpolado en HTML pasa por esc() (disciplina del
 * panel; esc() escapa también comillas para contextos de atributo, L-34).
 */

import { admToast, admConfirm, initSidebar, esc, requireAuth, fmtDateTime, currentUser } from './shared.js';
import { onConfigCarteraChange, updateConfigCartera } from '../crm-service.js';
import { DEFAULTS, SECCIONES, LISTAS, validarConfigCartera, leerPath, escribirPath } from './parametros-form.js';

let _vivo = null;       // último snapshot de config/cartera
let _borrador = null;   // copia editable (solo se re-sincroniza si NO hay cambios sin guardar)
let _dirty = new Set(); // ids de sección con cambios sin guardar

async function init() {
    await requireAuth('owner');
    initSidebar();

    onConfigCarteraChange((data) => {
        _vivo = data;
        if (_dirty.size === 0) {
            _borrador = structuredClone({ ...DEFAULTS, ...(data || {}) });
            render();
        } else {
            admToast('Los parámetros cambiaron en el servidor — guarda o descarta tus cambios', 'default', 4000);
        }
        renderMeta();
    });
}

// ─── Render ────────────────────────────────────────────────────────────────────

function render() {
    const root = document.getElementById('parametros-root');
    if (!_borrador) return;

    const secciones = SECCIONES.map(renderSeccion).join('');
    const listas = `
        <div class="adm-section" style="margin-top:20px;">
            <div class="adm-section-head"><h2>Listas del negocio</h2></div>
            <div class="adm-section-body">
                <p style="font-size:12px;color:var(--adm-muted);margin:0 0 14px;">
                    Valores en MAYÚSCULAS_CON_GUIONES o minúsculas, una sola palabra por valor.
                </p>
                ${LISTAS.map(renderLista).join('')}
                <div style="display:flex;gap:10px;margin-top:14px;">
                    <button class="adm-btn adm-btn--primary" data-guardar="listas">Guardar listas</button>
                    <button class="adm-btn adm-btn--ghost" data-restaurar="listas">Restaurar recomendados</button>
                </div>
            </div>
        </div>`;

    root.innerHTML = secciones + listas;
    wire(root);
}

function renderSeccion(sec) {
    const campos = sec.campos.map((c) => {
        const v = leerPath(_borrador, c.path);
        return `
        <div style="margin-bottom:16px;">
            <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;">${esc(c.label)}
                <span style="font-weight:400;color:var(--adm-muted);">(${esc(c.sufijo)})</span>
            </label>
            <input type="number" class="adm-input" style="max-width:220px;" inputmode="numeric"
                   data-path="${esc(c.path)}" data-seccion="${esc(sec.id)}" value="${esc(v)}"
                   min="${c.min}" max="${c.max}" step="1">
            <div style="font-size:12px;color:var(--adm-muted);margin-top:4px;max-width:640px;line-height:1.5;">${esc(c.ayuda)}</div>
        </div>`;
    }).join('');

    return `
        <div class="adm-section" style="margin-top:20px;">
            <div class="adm-section-head"><h2>${esc(sec.titulo)}</h2></div>
            <div class="adm-section-body">
                <p style="font-size:12px;color:var(--adm-muted);margin:0 0 14px;max-width:680px;">${esc(sec.descripcion)}</p>
                ${campos}
                <div style="display:flex;gap:10px;">
                    <button class="adm-btn adm-btn--primary" data-guardar="${esc(sec.id)}">Guardar cambios</button>
                    <button class="adm-btn adm-btn--ghost" data-restaurar="${esc(sec.id)}">Restaurar recomendados</button>
                </div>
            </div>
        </div>`;
}

function renderLista(l) {
    const valores = leerPath(_borrador, l.path) || [];
    const chips = valores.map((v) => `
        <span class="adm-pill" style="display:inline-flex;align-items:center;gap:6px;margin:0 6px 6px 0;">
            ${esc(v)}
            <button type="button" data-quitar="${esc(l.path)}" data-valor="${esc(v)}"
                    style="background:none;border:none;cursor:pointer;color:inherit;font-size:14px;line-height:1;padding:0;" title="Quitar">×</button>
        </span>`).join('');

    return `
        <div style="margin-bottom:18px;" data-lista="${esc(l.path)}">
            <div style="font-size:13px;font-weight:600;margin-bottom:2px;">${esc(l.titulo)}
                ${l.espejoUI ? '<span class="adm-pill" style="font-size:10px;margin-left:6px;" title="La validación dura vive en las reglas del servidor">espejo de pantalla</span>' : ''}
            </div>
            <div style="font-size:12px;color:var(--adm-muted);margin-bottom:8px;max-width:640px;line-height:1.5;">${esc(l.ayuda)}</div>
            <div>${chips}</div>
            <div style="display:flex;gap:8px;margin-top:6px;">
                <input type="text" class="adm-input" style="max-width:260px;" placeholder="NUEVO_VALOR" data-input-lista="${esc(l.path)}">
                <button class="adm-btn adm-btn--ghost adm-btn--sm" data-agregar="${esc(l.path)}">Añadir</button>
            </div>
        </div>`;
}

function renderMeta() {
    const sec = document.getElementById('meta-section');
    const info = document.getElementById('meta-info');
    if (!_vivo) { sec.hidden = true; return; }
    sec.hidden = false;
    const cuando = _vivo.actualizadoEn || _vivo.creadoEn;
    info.textContent = `Última modificación: ${fmtDateTime(cuando)} · por: ${_vivo.actualizadoPor || _vivo.fuente || '—'}`;
}

// ─── Cableado ──────────────────────────────────────────────────────────────────

function wire(root) {
    root.querySelectorAll('input[data-path]').forEach((inp) => {
        inp.addEventListener('input', () => {
            const num = inp.value === '' ? NaN : Number(inp.value);
            _borrador = escribirPath(_borrador, inp.dataset.path, Number.isFinite(num) ? num : NaN);
            _dirty.add(inp.dataset.seccion);
        });
    });

    root.querySelectorAll('[data-agregar]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const path = btn.dataset.agregar;
            const inp = root.querySelector(`[data-input-lista="${path}"]`);
            const valor = (inp?.value || '').trim();
            if (!valor) return;
            const arr = leerPath(_borrador, path) || [];
            if (arr.includes(valor)) { admToast('Ese valor ya está en la lista', 'danger'); return; }
            _borrador = escribirPath(_borrador, path, [...arr, valor]);
            _dirty.add('listas');
            render();
        });
    });

    root.querySelectorAll('[data-quitar]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const { quitar: path, valor } = btn.dataset;
            const arr = (leerPath(_borrador, path) || []).filter((x) => x !== valor);
            _borrador = escribirPath(_borrador, path, arr);
            _dirty.add('listas');
            render();
        });
    });

    root.querySelectorAll('[data-guardar]').forEach((btn) => {
        btn.addEventListener('click', () => guardar(btn.dataset.guardar));
    });

    root.querySelectorAll('[data-restaurar]').forEach((btn) => {
        btn.addEventListener('click', () => {
            admConfirm('¿Volver esta sección a los valores recomendados? (No se guarda hasta que pulses "Guardar".)', () => {
                for (const path of pathsDe(btn.dataset.restaurar)) {
                    _borrador = escribirPath(_borrador, path, structuredClone(leerPath(DEFAULTS, path)));
                }
                _dirty.add(btn.dataset.restaurar);
                render();
            });
        });
    });
}

function pathsDe(seccionId) {
    if (seccionId === 'listas') return LISTAS.map((l) => l.path);
    return (SECCIONES.find((s) => s.id === seccionId)?.campos || []).map((c) => c.path);
}

// ─── Guardar ───────────────────────────────────────────────────────────────────

async function guardar(seccionId) {
    // La validación corre sobre la config COMPLETA (coherencia entre secciones).
    const { ok, errores } = validarConfigCartera(_borrador);
    if (!ok) { admToast(errores[0], 'danger', 4500); return; }

    // Solo se escriben los campos de la sección (merge parcial, sin pisar el resto).
    let parcial = {};
    for (const path of pathsDe(seccionId)) {
        parcial = escribirPath(parcial, path, leerPath(_borrador, path));
    }

    try {
        await updateConfigCartera(parcial, currentUser()?.user?.email);
        _dirty.delete(seccionId);
        admToast('Parámetros guardados');
    } catch (err) {
        admToast(`No se pudo guardar: ${err.message}`, 'danger');
    }
}

init();
