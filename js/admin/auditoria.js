/**
 * Bersaglio Admin — Auditoría de caja (Fase 2 de "caja en tiempo real" · TODO-69).
 *
 * Vista OWNER-ONLY (discreción D7, igual que la Bóveda): la línea de tiempo COMPLETA de cada turno
 * de caja — quién abrió, quién cerró, cada venta, ingreso/egreso, traslado y aprobación — con el
 * NOMBRE de quién lo hizo y la HORA exacta. Todo EN VIVO (listeners) y de SOLO LECTURA: no escribe
 * nada, no toca dinero. La data ya la graban las Cloud Functions (autor + serverTimestamp en cada
 * acción); aquí solo se CONSOLIDA y se traduce el UID a nombre.
 *
 * Invisibilidad de ROOT (`[[project_root_account_daniel]]`): el nombre se resuelve por-UID con
 * getDoc + fallback; si el viewer no puede leer un doc (p.ej. Kary no ve el doc root de Daniel),
 * cae a una etiqueta genérica → JAMÁS revela al usuario root. El owner-root sí resuelve a todos.
 *
 * DOM seguro (sin innerHTML, patrón boveda.js) → cero superficie de inyección.
 */

import { initSidebar, requireAuth, errorMessage, fmtDateTime, admToast } from './shared.js';
import {
    onTurnosChange, onTurnoChange, onMovsCajaChange, onVentasTurnoChange, onTrasladosTurnoChange,
} from '../pedidos-service.js';
import { conceptoLabel, tipoBovedaLabel } from './caja-format.js';
import { estadoPedido, ESTADOS_SIN_DINERO } from './pedidos-format.js';
import { firestoreDb } from '../firebase-config.js';
import { doc, getDoc } from 'firebase/firestore';

// Descuadre puede ser negativo (falta) → formateo con signo, sin clamp.
const cop = (n) => { const v = Math.round(Number(n) || 0); return (v < 0 ? '-$' : '$') + Math.abs(v).toLocaleString('es-CO'); };

let _turnos   = [];      // lista de turnos (más reciente primero)
let _selId    = null;    // turno seleccionado
let _turno    = null;    // doc del turno seleccionado
let _movs     = [];      // movsCaja del turno
let _ventas   = [];      // pedidos del turno
let _traslados = [];     // bovedaMovimientos del turno
let _turnoUnsubs = [];   // listeners con alcance del turno seleccionado
let _renderTimer = null;

// Cache UID → nombre legible (displayName|email|fallback). Se llena perezoso, una vez por UID.
const _nameCache = new Map();
const shortUid = (u) => (String(u || '').slice(0, 6) || '—') + '…';

// ─── DOM builder seguro (sin innerHTML, patrón boveda.js) ─────────────────────
function el(tag, attrs = {}, kids = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else node.setAttribute(k, v);
    }
    for (const c of [].concat(kids)) if (c) node.appendChild(c);
    return node;
}

async function init() {
    await requireAuth('owner');   // AUDITORÍA = owner-only (discreción D7); un admin/caja se redirige
    initSidebar();

    document.getElementById('aud-export').addEventListener('click', exportarTurno);

    onTurnosChange(
        (turnos) => { _turnos = turnos; onTurnosLoaded(); },
        60,
        (e) => admToast(errorMessage(e, 'No se pudieron leer los turnos de caja.'), 'danger', 4000),
    );
}

// Al llegar la lista: si no hay selección, auto-elige el turno ABIERTO (si lo hay) o el más reciente.
function onTurnosLoaded() {
    if (!_selId && _turnos.length) {
        const abierto = _turnos.find(t => t.estado === 'abierto');
        selectTurno((abierto || _turnos[0]).id);
    }
    renderTurnos();
}

// ─── Resolución UID → nombre (respeta invisibilidad de root: fallback si no se puede leer) ──────
async function ensureNames(uids) {
    const missing = [...new Set(uids)].filter(u => u && u !== 'reaper' && !_nameCache.has(u));
    await Promise.all(missing.map(async (u) => {
        let label = shortUid(u);
        try {
            const s = await getDoc(doc(firestoreDb, 'users', u));
            if (s.exists()) { const d = s.data(); label = d.displayName || d.email || label; }
        } catch { /* root invisible / sin permiso → se queda con el fallback (nunca revela root) */ }
        _nameCache.set(u, label);
    }));
}
function nombre(uid) {
    if (!uid) return '—';
    if (uid === 'reaper') return 'Sistema (automático)';
    return _nameCache.get(uid) || shortUid(uid);
}

// ─── Lista de turnos (izquierda) ──────────────────────────────────────────────
async function renderTurnos() {
    const ul = document.getElementById('aud-turnos');
    const empty = document.getElementById('aud-turnos-empty');
    empty.hidden = _turnos.length > 0;

    await ensureNames(_turnos.map(t => t.aperturaPor));

    ul.replaceChildren();
    for (const t of _turnos) {
        const abierta = t.estado === 'abierto';
        const pill = el('span', {
            class: `adm-pill adm-pill--${abierta ? 'green' : 'gray'}`,
            text: abierta ? 'Abierta' : 'Cerrada',
        });
        const info = el('div', { class: 'bov-mov-info' }, [
            el('div', { class: 'bov-mov-head' }, [
                el('span', { class: 'bov-mov-tipo', text: fmtDateTime(t.aperturaTs) }),
                pill,
            ]),
            el('span', { class: 'bov-mov-sub', text: `Abrió: ${nombre(t.aperturaPor)}` }),
            (!abierta && t.cierrePor)
                ? el('span', { class: 'bov-mov-sub', text: `Cerró: ${nombre(t.cierrePor)}` })
                : null,
        ]);
        const right = el('div', { class: 'bov-mov-right' });
        if (!abierta && Number.isFinite(Number(t.descuadre))) {
            const d = Number(t.descuadre) || 0;
            const cuadre = el('span', {
                class: 'aud-descuadre-mini',
                text: d === 0 ? 'Cuadra' : (d > 0 ? `Sobra ${cop(d)}` : `Falta ${cop(-d)}`),
            });
            cuadre.style.color = d === 0 ? 'var(--adm-success)' : (d > 0 ? 'var(--adm-accent)' : 'var(--adm-danger)');
            right.appendChild(cuadre);
        }
        const li = el('li', {
            class: 'bov-mov aud-turno' + (t.id === _selId ? ' aud-turno--sel' : ''),
            role: 'button', tabindex: '0',
        }, [info, right]);
        li.addEventListener('click', () => selectTurno(t.id));
        li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectTurno(t.id); } });
        ul.appendChild(li);
    }
}

// ─── Selección de un turno → recablea los listeners con alcance del turno ──────
function selectTurno(id) {
    if (id === _selId) return;
    _turnoUnsubs.forEach(u => { try { u(); } catch { /* noop */ } });
    _turnoUnsubs = [];
    _selId = id;
    _turno = null; _movs = []; _ventas = []; _traslados = [];

    _turnoUnsubs.push(onTurnoChange(id, t => { _turno = t; scheduleDetail(); },
        e => console.warn('[auditoria] turno no legible:', e?.code || e)));
    _turnoUnsubs.push(onMovsCajaChange(id, m => { _movs = m; scheduleDetail(); },
        e => console.warn('[auditoria] movsCaja no legibles:', e?.code || e)));
    _turnoUnsubs.push(onVentasTurnoChange(id, v => { _ventas = v; scheduleDetail(); },
        e => console.warn('[auditoria] ventas del turno no legibles:', e?.code || e)));
    _turnoUnsubs.push(onTrasladosTurnoChange(id, tr => { _traslados = tr; scheduleDetail(); },
        e => console.warn('[auditoria] traslados no legibles:', e?.code || e)));

    renderTurnos();      // actualiza el resaltado
    scheduleDetail();
}

// Debounce: los 4 listeners disparan casi juntos al abrir un turno → una sola pintada.
function scheduleDetail() {
    if (_renderTimer) return;
    _renderTimer = setTimeout(() => { _renderTimer = null; renderDetail(); }, 40);
}

// ─── Línea de tiempo del turno seleccionado ───────────────────────────────────
const tsMillis = (ts) => {
    if (!ts) return 0;
    if (typeof ts.toMillis === 'function') return ts.toMillis();
    if (typeof ts.seconds === 'number') return ts.seconds * 1000;
    const d = new Date(ts); return isNaN(d.getTime()) ? 0 : d.getTime();
};

// Construye los eventos del turno (apertura, ventas, movimientos, traslados, cierre) ordenados por hora.
function buildEventos() {
    const evs = [];
    if (_turno?.aperturaTs) {
        evs.push({ ts: _turno.aperturaTs, kind: 'apertura', label: 'Apertura de caja',
            monto: _turno.fondoApertura, autor: _turno.aperturaPor, sub: 'Fondo de apertura' });
    }
    for (const p of _ventas) {
        const est = estadoPedido(p.estado);
        const muerta = ESTADOS_SIN_DINERO.has(p.estado);
        evs.push({ ts: p.createdAt, kind: 'venta', label: `Venta ${p.codigo || '#' + (p.numero ?? '—')}`,
            monto: p.total, autor: p.autor, sub: p.pieceName || 'Pieza', pill: est, muerta });
    }
    for (const m of _movs) {
        evs.push({ ts: m.ts, kind: m.tipo === 'egreso' ? 'egreso' : 'ingreso',
            label: m.tipo === 'egreso' ? 'Egreso' : 'Ingreso', monto: m.monto, autor: m.autor,
            sub: conceptoLabel(m.concepto) + (m.nota ? ` · ${m.nota}` : ''), muerta: !!m.anulado });
    }
    for (const t of _traslados) {
        evs.push({ ts: t.ts, kind: 'traslado', label: tipoBovedaLabel(t.tipo),
            monto: Math.abs(Number(t.monto) || 0), autor: t.autor, sub: t.nota || '',
            muerta: t.estado === 'rechazado' || !!t.anulado });
    }
    if (_turno?.estado === 'cerrado' && _turno?.cierreTs) {
        evs.push({ ts: _turno.cierreTs, kind: 'cierre', label: 'Cierre de caja',
            monto: _turno.declaradoEfectivo, autor: _turno.cierrePor,
            sub: `Contado ${cop(_turno.declaradoEfectivo)} · esperado ${cop(_turno.esperadoEfectivo)}` });
    }
    return evs.sort((a, b) => tsMillis(a.ts) - tsMillis(b.ts));
}

async function renderDetail() {
    const summary  = document.getElementById('aud-summary');
    const detEmpty = document.getElementById('aud-detail-empty');
    const tlLabel  = document.getElementById('aud-timeline-label');
    const tl       = document.getElementById('aud-timeline');
    const exportBtn = document.getElementById('aud-export');

    if (!_selId || !_turno) {
        summary.hidden = true; tlLabel.hidden = true; exportBtn.hidden = true;
        tl.replaceChildren();
        detEmpty.hidden = !!_selId;   // con turno elegido pero aún cargando: no mostramos el vacío grande
        return;
    }

    const idAtStart = _selId;
    const eventos = buildEventos();
    await ensureNames([_turno.aperturaPor, _turno.cierrePor, ...eventos.map(e => e.autor)]);
    if (_selId !== idAtStart) return;   // la selección cambió mientras resolvíamos nombres → aborta

    detEmpty.hidden = true;
    summary.hidden = false;
    exportBtn.hidden = false;

    // Resumen
    const abierta = _turno.estado === 'abierto';
    document.getElementById('aud-apertura').textContent = `${fmtDateTime(_turno.aperturaTs)} · ${nombre(_turno.aperturaPor)}`;
    document.getElementById('aud-cierre').textContent = abierta ? 'En curso' : `${fmtDateTime(_turno.cierreTs)} · ${nombre(_turno.cierrePor)}`;
    document.getElementById('aud-fondo').textContent = cop(_turno.fondoApertura);
    const estEl = document.getElementById('aud-estado');
    estEl.textContent = abierta ? 'Abierta' : 'Cerrada';
    estEl.style.color = abierta ? 'var(--adm-success)' : 'var(--adm-muted)';

    // Arqueo (solo si cerrado)
    const arqueo = document.getElementById('aud-arqueo');
    if (!abierta) {
        arqueo.hidden = false;
        document.getElementById('aud-esperado').textContent = cop(_turno.esperadoEfectivo);
        document.getElementById('aud-contado').textContent = cop(_turno.declaradoEfectivo);
        const d = Number(_turno.descuadre) || 0;
        const lbl = document.getElementById('aud-descuadre-label');
        const val = document.getElementById('aud-descuadre');
        if (d === 0)      { lbl.textContent = 'Cuadra ✓'; val.textContent = cop(0);  val.style.color = 'var(--adm-success)'; }
        else if (d > 0)   { lbl.textContent = 'Sobra';     val.textContent = cop(d);  val.style.color = 'var(--adm-accent)'; }
        else              { lbl.textContent = 'Falta';     val.textContent = cop(-d); val.style.color = 'var(--adm-danger)'; }
    } else {
        arqueo.hidden = true;
    }

    // Línea de tiempo
    tlLabel.hidden = false;
    tl.replaceChildren();
    for (const e of eventos) {
        const montoEl = el('strong', { class: 'adm-money', text: cop(e.monto) });
        const head = [el('span', { class: 'bov-mov-tipo', text: e.label })];
        if (e.pill) head.push(el('span', { class: `adm-pill adm-pill--${e.pill.pill}`, text: e.pill.label }));
        const info = el('div', { class: 'bov-mov-info' }, [
            el('div', { class: 'bov-mov-head' }, head),
            e.sub ? el('span', { class: 'bov-mov-sub', text: e.sub }) : null,
            el('span', { class: 'bov-mov-time', text: `${fmtDateTime(e.ts)} · ${nombre(e.autor)}` }),
        ]);
        tl.appendChild(el('li', { class: 'bov-mov aud-ev aud-ev--' + e.kind + (e.muerta ? ' aud-ev--muerta' : '') },
            [info, el('div', { class: 'bov-mov-right' }, [montoEl])]));
    }
}

// ─── Export CSV del turno (para el contador / archivo) ────────────────────────
const csvCell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
function exportarTurno() {
    if (!_turno) return;
    const eventos = buildEventos();
    const head = ['Hora', 'Evento', 'Detalle', 'Monto', 'Quién', 'Estado'];
    const rows = eventos.map(e => [
        fmtDateTime(e.ts), e.label, e.sub || '', Math.round(Number(e.monto) || 0),
        nombre(e.autor), e.pill ? e.pill.label : (e.muerta ? 'anulado' : ''),
    ].map(csvCell).join(','));
    const csv = '﻿' + [head.map(csvCell).join(','), ...rows].join('\r\n');   // BOM → Excel respeta acentos
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const fecha = fmtDateTime(_turno.aperturaTs).replace(/[^\dA-Za-z]/g, '-');
    a.download = `auditoria-turno-${fecha}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    admToast('Descargando el turno…');
}

init();
