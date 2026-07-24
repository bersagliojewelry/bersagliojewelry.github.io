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

import { requireAuth, initSidebar, admToast, hasRole, errorMessage } from './shared.js';
import { actualizarConfigSistema } from '../tesoreria-service.js';
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

// ─── Tarjeta "Reglas del sistema" (EDITABLE owner-only · §0.7 D1 → F-TESORERÍA D6) ─────────────
// SoD inv.6: quien OPERA bajo los límites no los reescribe → la escritura va por la callable
// `actualizarConfigSistema` (owner-only, whitelist + rangos + audit trail), NUNCA por setConfig.
// El dueño NO piensa en fracciones: los % se muestran y se piden en % humano (2,65) y se guardan
// como fracción (0,0265). `reteIcaXMil` ya viene en ‰ → se muestra tal cual.
function pct(n) { return `${(Number(n) * 100).toLocaleString('es-CO', { maximumFractionDigits: 2 })}%`; }

const REGLAS_D6 = [
    { campo: 'enforceTurno',  doc: 'caja',   tipo: 'bool',   label: 'Turno de caja obligatorio',      hint: 'Si está en Sí, el Mostrador exige abrir el turno antes de vender.' },
    { campo: 'limiteCajon',   doc: 'caja',   tipo: 'cop',    label: 'Máximo de efectivo en el cajón', hint: 'Al pasarse, el Mostrador pide llevar plata a la bóveda.' },
    { campo: 'wompiPct',      doc: 'fiscal', tipo: 'pct',    label: 'Comisión de Wompi',              hint: 'Lo que Wompi cobra por cada venta cobrada en línea.' },
    { campo: 'wompiFijo',     doc: 'fiscal', tipo: 'cop',    label: 'Comisión fija de Wompi',         hint: 'Valor fijo que Wompi suma a cada transacción.' },
    { campo: 'wompiIvaPct',   doc: 'fiscal', tipo: 'pct',    label: 'IVA sobre la comisión' },
    { campo: 'reteFuentePct', doc: 'fiscal', tipo: 'pct',    label: 'ReteFuente',                     hint: 'La define tu contador. Déjala en 0 si no aplica.' },
    { campo: 'reteIcaXMil',   doc: 'fiscal', tipo: 'permil', label: 'ReteICA (por mil)',              hint: 'En “por mil”: 7 significa 7‰. La define tu contador.' },
];
const BUSINESS_ERR = ['failed-precondition', 'invalid-argument', 'not-found', 'already-exists', 'permission-denied'];
let _cfgD6 = { caja: null, fiscal: null };

// Valor guardado → texto humano. `null` (aún sin configurar) se dice, no se inventa.
function valorTexto(r) {
    const raw = (_cfgD6[r.doc] || {})[r.campo];
    if (raw == null) return '—';
    if (r.tipo === 'bool') return raw ? 'Sí' : 'No';
    if (r.tipo === 'cop') return fmtCOP(raw);
    if (r.tipo === 'pct') return pct(raw);
    return `${Number(raw).toLocaleString('es-CO', { maximumFractionDigits: 2 })}‰`;
}
// Valor guardado → lo que se escribe en el input (en unidades humanas).
function valorInput(r) {
    const raw = (_cfgD6[r.doc] || {})[r.campo];
    if (raw == null) return '';
    if (r.tipo === 'pct') return String(Math.round(Number(raw) * 1000000) / 10000);   // 0,0265 → 2,65
    return String(raw);
}

async function cargarCfgD6() {
    // Tolerante a permisos/ausencia: lo que no se pueda leer queda en null → la fila muestra "—".
    try { _cfgD6.caja = await getConfig('caja'); } catch (err) { console.warn('[config] getConfig caja:', err); _cfgD6.caja = null; }
    try { _cfgD6.fiscal = await getConfig('fiscal'); } catch (err) { console.warn('[config] getConfig fiscal:', err); _cfgD6.fiscal = null; }
    // Defaults de código para lo fiscal aún no configurado (mismos que usa el cálculo bruto→neto).
    _cfgD6.fiscal = { ...FISCAL_DEFAULT, ..._cfgD6.fiscal };
}

async function renderReglasSistema() {
    const body = document.getElementById('reglas-sistema-body');
    if (!body) return;
    await cargarCfgD6();
    body.replaceChildren();
    for (const r of REGLAS_D6) body.appendChild(filaRegla(r));
}

function filaRegla(r) {
    const row = el('div', { cls: 'adm-readonly-row' });
    const izq = el('div', { css: 'flex:1;min-width:0;' });
    izq.appendChild(el('span', { text: r.label }));
    if (r.hint) izq.appendChild(el('span', { cls: 'pos-hint', css: 'display:block;margin:2px 0 0;', text: r.hint }));
    row.appendChild(izq);
    row.appendChild(el('span', { cls: 'adm-readonly-val', text: valorTexto(r) }));
    const btn = el('button', { cls: 'adm-btn adm-btn--ghost adm-btn--sm', text: 'Editar' });
    btn.type = 'button';
    btn.addEventListener('click', () => row.replaceWith(filaEdicion(r)));
    row.appendChild(btn);
    return row;
}

function filaEdicion(r) {
    const row = el('div', { cls: 'adm-readonly-row' });
    row.appendChild(el('span', { css: 'flex:1;min-width:0;', text: r.label }));

    let campoInput;
    if (r.tipo === 'bool') {
        campoInput = el('select', { cls: 'adm-input' });
        for (const [v, t] of [['true', 'Sí'], ['false', 'No']]) {
            const o = el('option', { text: t }); o.value = v; campoInput.appendChild(o);
        }
        campoInput.value = String(((_cfgD6[r.doc] || {})[r.campo]) === true);
    } else {
        campoInput = el('input', { cls: 'adm-input' });
        campoInput.type = 'number';
        campoInput.min = '0';
        campoInput.step = (r.tipo === 'cop') ? '1' : '0.01';
        campoInput.value = valorInput(r);
        campoInput.placeholder = r.tipo === 'pct' ? 'Ej. 2,65 (=2,65%)' : (r.tipo === 'permil' ? 'Ej. 7 (=7‰)' : 'Ej. 2000000');
    }
    campoInput.style.cssText = 'max-width:180px;';
    row.appendChild(campoInput);

    const guardar = el('button', { cls: 'adm-btn adm-btn--primary adm-btn--sm', text: 'Guardar' });
    guardar.type = 'button';
    const cancelar = el('button', { cls: 'adm-btn adm-btn--ghost adm-btn--sm', text: 'Cancelar' });
    cancelar.type = 'button';
    cancelar.addEventListener('click', () => row.replaceWith(filaRegla(r)));
    guardar.addEventListener('click', () => guardarRegla(r, campoInput, guardar, row));
    row.appendChild(guardar);
    row.appendChild(cancelar);
    return row;
}

async function guardarRegla(r, campoInput, btn, row) {
    // Unidades HUMANAS → unidades de dominio. El rango REAL lo valida la CF (server-side).
    let valor;
    if (r.tipo === 'bool') {
        valor = campoInput.value === 'true';
    } else {
        const n = Number(campoInput.value);
        if (campoInput.value === '' || !Number.isFinite(n)) { admToast('Escribe un número.', 'danger'); return; }
        if (r.tipo === 'pct') valor = Math.round((n / 100) * 1000000) / 1000000;   // 2,65 → 0,0265 (sin ruido de coma flotante)
        else valor = n;
    }
    btn.disabled = true; btn.textContent = 'Guardando…';
    try {
        await actualizarConfigSistema({ campo: r.campo, valor });
        admToast('✓ Regla actualizada', 'success');
        await cargarCfgD6();
        row.replaceWith(filaRegla(r));
    } catch (err) {
        const msg = (BUSINESS_ERR.includes(err?.code) && err?.message) ? err.message : errorMessage(err, 'No se pudo guardar la regla.');
        admToast(msg, 'danger', 4500);
        btn.disabled = false; btn.textContent = 'Guardar';
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
