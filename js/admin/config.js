/**
 * Bersaglio Admin — "Negocio y equipo" (F-IA-2 B1, §0.7 D1/D6/D7).
 *
 * UNA página de pestañas que fusiona lo que antes eran 3 páginas (Configuración +
 * Parámetros + Usuarios), matando la duplicación de cobranza (hallazgo A3 §182):
 *   · Negocio  → datos del negocio (config/negocio, admin) + tarjeta "Reglas del
 *                sistema" (solo lectura, owner: config/caja + config/fiscal).
 *   · Cobranza → días de plazo REAL (config/negocio.diasPlazo, admin) + política de
 *                cartera (config/cartera, owner) montada por initParametros().
 *   · Equipo   → Vendedoras (CRUD, admin).
 *   · Usuarios → gestión de usuarios (owner) montada por initUsuarios().
 *
 * El gate de rol es por PESTAÑA (hasRole('owner')); el candado REAL vive en las
 * reglas/callables del servidor — la UI solo respeta. Kardex y "Pendientes" salieron
 * de la UI (§0.7): la colección `pendientes` NO se borra, solo se retira su pantalla.
 *
 * XSS: todo valor dinámico se pinta con textContent (createElement), nunca innerHTML.
 */

import { requireAuth, initSidebar, admToast, hasRole } from './shared.js';
import adminDb from './db.js';
import { currentUser } from '../auth.js';
import {
    getConfig, setConfig, fmtCOP,
    onVendedorasChange, createVendedora, updateVendedora,
} from '../crm-service.js';
import { initParametros } from './parametros.js';
import { initUsuarios } from './usuarios.js';
import { FISCAL_DEFAULT } from './fiscal.js';

function setVal(id, v) { const el = document.getElementById(id); if (el) el.value = v ?? ''; }
function getVal(id) { return (document.getElementById(id)?.value || '').trim(); }

// Mini-fábrica DOM (texto SIEMPRE por textContent — cero interpolación en HTML).
function el(tag, { cls, text, css } = {}) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    if (css) n.style.cssText = css;
    return n;
}

let _paramMounted = false;   // política de cartera (owner) se monta 1 vez, al abrir Cobranza

// ─── Pestañas ────────────────────────────────────────────────────────────────
function activarTab(name, isOwner) {
    document.querySelectorAll('.adm-tab').forEach((t) => t.classList.toggle('is-active', t.dataset.tab === name));
    document.querySelectorAll('.adm-tabpanel').forEach((p) => { p.hidden = p.dataset.panel !== name; });

    // Montaje lazy owner-only (evita suscribir/leer si nunca se abre la pestaña).
    if (name === 'cobranza' && isOwner && !_paramMounted) {
        _paramMounted = true;
        const cont = document.getElementById('cobranza-politica');
        if (cont) cont.hidden = false;
        initParametros();
    }
    if (name === 'usuarios' && isOwner) {
        initUsuarios();   // idempotente (bandera interna)
    }
}

function wireTabs(isOwner) {
    document.getElementById('config-tabs')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.adm-tab');
        if (btn) activarTab(btn.dataset.tab, isOwner);
    });
}

// ─── Tarjeta "Reglas del sistema" (solo lectura, owner · §0.7 D1) ─────────────
function pct(n) { return `${(Number(n) * 100).toLocaleString('es-CO', { maximumFractionDigits: 2 })}%`; }

async function renderReglasSistema() {
    const body = document.getElementById('reglas-sistema-body');
    if (!body) return;
    // Tolerante a permisos: si una lectura falla, esa fila muestra "—" (no rompe la tarjeta).
    let caja = null, fiscal = null;
    try { caja = await getConfig('caja'); } catch (err) { console.warn('[config] getConfig caja:', err); }
    try { fiscal = await getConfig('fiscal'); } catch (err) { console.warn('[config] getConfig fiscal:', err); }
    const f = { ...FISCAL_DEFAULT, ...(fiscal || {}) };

    const sinRetenciones = (f.reteFuentePct || 0) === 0 && (f.reteIcaXMil || 0) === 0;
    const filas = [
        ['Turno de caja obligatorio', caja == null ? '—' : (caja.enforceTurno ? 'Sí' : 'No')],
        ['Máximo de efectivo en el cajón', (caja && typeof caja.limiteCajon === 'number') ? fmtCOP(caja.limiteCajon) : '—'],
        ['Comisión por cobrar con Wompi', `${pct(f.wompiPct)} + ${fmtCOP(f.wompiFijo)} + IVA ${pct(f.wompiIvaPct)}`],
        ['Retenciones', sinRetenciones ? 'Sin configurar — las define el contador' : `ReteFuente ${pct(f.reteFuentePct)} · ReteICA ${f.reteIcaXMil}‰`],
    ];
    body.replaceChildren();
    for (const [k, v] of filas) {
        const row = el('div', { cls: 'adm-readonly-row' });
        row.appendChild(el('span', { text: k }));
        row.appendChild(el('span', { cls: 'adm-readonly-val', text: v }));
        body.appendChild(row);
    }
}

// ─── Vendedoras (entidad que gestiona Kary · reusa el módulo previo) ──────────
function renderVendedoras(list) {
    const wrap = document.getElementById('vendedoras-list');
    const empty = document.getElementById('vendedoras-empty');
    if (!wrap || !empty) return;
    if (!list.length) { wrap.replaceChildren(); empty.hidden = false; return; }
    empty.hidden = true;
    const orden = list.slice().sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'));
    wrap.replaceChildren();
    for (const v of orden) {
        const inactiva = v.activa === false;
        const item = el('div', { cls: `adm-pend-item${inactiva ? ' adm-pend-item--done' : ''}` });
        const left = el('div', { css: 'flex:1;min-width:0;' });
        left.appendChild(el('span', { cls: 'adm-pend-titulo', text: v.nombre || 'Sin nombre' }));
        if (inactiva) left.appendChild(el('span', { cls: 'adm-pill adm-pill--gray', text: 'inactiva' }));
        item.appendChild(left);
        const right = el('div', { css: 'display:flex;gap:6px;white-space:nowrap;' });
        const btn = el('button', { cls: 'adm-btn adm-btn--ghost adm-btn--sm', text: inactiva ? 'Reactivar' : 'Desactivar' });
        btn.setAttribute('data-vend-toggle', v.id);
        btn.setAttribute('data-activa', inactiva ? 'true' : 'false');
        right.appendChild(btn);
        item.appendChild(right);
        wrap.appendChild(item);
    }
}

function wireVendedoras() {
    document.getElementById('vendedora-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = getVal('vend-nombre');
        if (!nombre) { admToast('Escribe el nombre.', 'danger'); return; }
        try {
            await createVendedora({ nombre, createdBy: currentUser()?.user?.uid });
            document.getElementById('vendedora-form').reset();
        } catch (err) { console.error('[config] createVendedora:', err); admToast('No se pudo agregar.', 'danger'); }
    });
    document.getElementById('vendedoras-list')?.addEventListener('click', async (e) => {
        const tg = e.target.closest('[data-vend-toggle]');
        if (!tg) return;
        const activa = tg.getAttribute('data-activa') === 'true';   // valor objetivo
        try { await updateVendedora(tg.getAttribute('data-vend-toggle'), { activa }); }
        catch (err) { console.error('[config] updateVendedora:', err); admToast('No se pudo actualizar.', 'danger'); }
    });
}

// ─── Datos del negocio + días de plazo (config/negocio · merge por pestaña) ───
async function cargarNegocio() {
    try {
        const cfg = await getConfig('negocio');
        if (cfg) {
            setVal('cfg-negocio', cfg.negocioNombre);
            setVal('cfg-nit', cfg.nit);
            setVal('cfg-direccion', cfg.direccion);
            setVal('cfg-telefono', cfg.telefono);
            setVal('cfg-dias-plazo', cfg.diasPlazo);
        }
    } catch (err) { console.warn('[config] getConfig negocio:', err); }
}

function wireGuardado() {
    // Datos del negocio → merge (NO toca diasPlazo ni fechaCorteMigracion — se conservan).
    document.getElementById('config-negocio-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('cfg-negocio-save');
        btn.disabled = true;
        try {
            await setConfig('negocio', {
                negocioNombre: getVal('cfg-negocio'),
                nit:           getVal('cfg-nit'),
                direccion:     getVal('cfg-direccion'),
                telefono:      getVal('cfg-telefono'),
            });
            admToast('Datos del negocio guardados.');
        } catch (err) { console.error('[config] setConfig negocio:', err); admToast('No se pudo guardar.', 'danger'); }
        finally { btn.disabled = false; }
    });

    // Días de plazo → merge (solo diasPlazo; el resto de config/negocio intacto).
    document.getElementById('config-cobranza-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('cfg-cobranza-save');
        btn.disabled = true;
        try {
            await setConfig('negocio', {
                diasPlazo: getVal('cfg-dias-plazo') ? Number(getVal('cfg-dias-plazo')) : null,
            });
            admToast('Cobranza guardada.');
        } catch (err) { console.error('[config] setConfig cobranza:', err); admToast('No se pudo guardar.', 'danger'); }
        finally { btn.disabled = false; }
    });
}

// ─── Init ────────────────────────────────────────────────────────────────────
async function init() {
    await requireAuth('admin');
    await adminDb.init();
    initSidebar();

    const isOwner = hasRole('owner');

    // Revela lo owner-only (pestaña Usuarios + tarjeta de reglas). La política de cartera
    // (cobranza-politica) se revela y monta lazy al abrir Cobranza.
    if (isOwner) {
        document.querySelectorAll('.adm-tab[data-owner], #reglas-sistema').forEach((n) => { n.hidden = false; });
        renderReglasSistema();
    }

    wireTabs(isOwner);
    wireVendedoras();
    onVendedorasChange(renderVendedoras);
    wireGuardado();
    await cargarNegocio();
}

init();
