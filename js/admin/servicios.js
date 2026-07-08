/**
 * Bersaglio Admin — Catálogo de servicios/modificaciones (F2.2 · CMS owner-only, spec §8.3 A).
 *
 * El dueño crea/edita/retira los servicios que el mostrador cobra junto con la pieza. El PRECIO ES
 * DINERO: las reglas lo blindan a owner-write acotada (sin CF) y el cobro re-lee el precio server-side
 * (crearPedido). Cada cambio de precio escribe un asiento INMUTABLE en servicios/{id}/historial. El
 * anti-duplicado por `codigo` se valida aquí (las reglas no cruzan documentos). Render XSS-safe
 * (createElement/textContent, no innerHTML). Soft-delete: retirar = activo:false, nunca borrar.
 */
import { requireAuth, initSidebar, admToast, admConfirm } from './shared.js';
import { currentUser } from '../auth.js';
import { onServiciosAllChange, crearServicio, actualizarServicioPrecio, setServicioActivo } from '../pedidos-service.js';

const cop = n => '$' + Math.round(Math.max(0, Number(n) || 0)).toLocaleString('es-CO');
const uid = () => currentUser()?.user?.uid || null;

let _servicios = [];
let _unsub = null;

async function init() {
    await requireAuth('owner');   // el catálogo de PRECIOS es owner-only (espeja la regla del servidor)
    initSidebar();
    document.getElementById('serv-crear').addEventListener('click', handleCrear);
    _unsub = onServiciosAllChange(
        (list) => { _servicios = list; render(); },
        () => { /* transitorio: subscribeWithRetry reintenta solo */ },
    );
}

function render() {
    const ul = document.getElementById('servicios-list');
    const empty = document.getElementById('servicios-empty');
    if (!ul) return;
    ul.textContent = '';
    if (!_servicios.length) { empty.hidden = false; return; }
    empty.hidden = true;
    for (const s of _servicios) ul.appendChild(row(s));
}

function row(s) {
    const li = document.createElement('li');
    li.className = 'serv-cms-item' + (s.activo ? '' : ' serv-cms-item--off');

    const info = document.createElement('div');
    info.className = 'serv-cms-info';
    const name = document.createElement('span'); name.className = 'serv-cms-name'; name.textContent = s.nombre || '(sin nombre)';
    const meta = document.createElement('span'); meta.className = 'serv-cms-meta';
    meta.textContent = `${s.codigo || '—'} · ${s.naturaleza === 'bien' ? 'Bien' : 'Servicio'}${s.activo ? '' : ' · retirado'}`;
    info.append(name, meta);

    const price = document.createElement('strong'); price.className = 'serv-cms-price'; price.textContent = cop(s.precio);

    const actions = document.createElement('div'); actions.className = 'serv-cms-actions';
    const editBtn = document.createElement('button'); editBtn.type = 'button'; editBtn.className = 'adm-btn adm-btn--ghost adm-btn--sm'; editBtn.textContent = 'Cambiar precio';
    editBtn.addEventListener('click', () => startEdit(li, s));
    const toggleBtn = document.createElement('button'); toggleBtn.type = 'button'; toggleBtn.className = 'adm-btn adm-btn--ghost adm-btn--sm'; toggleBtn.textContent = s.activo ? 'Retirar' : 'Activar';
    toggleBtn.addEventListener('click', () => toggle(s));
    actions.append(editBtn, toggleBtn);

    li.append(info, price, actions);
    return li;
}

// Editor inline del precio (reemplaza la fila; al guardar/cancelar el listener re-pinta con la verdad).
function startEdit(li, s) {
    li.textContent = '';
    const info = document.createElement('div'); info.className = 'serv-cms-info';
    const name = document.createElement('span'); name.className = 'serv-cms-name'; name.textContent = s.nombre || '(sin nombre)';
    info.appendChild(name);

    const input = document.createElement('input'); input.type = 'number'; input.min = '0'; input.inputMode = 'numeric';
    input.className = 'adm-input serv-cms-edit-input'; input.value = String(Math.round(Number(s.precio) || 0));

    const actions = document.createElement('div'); actions.className = 'serv-cms-actions';
    const save = document.createElement('button'); save.type = 'button'; save.className = 'adm-btn adm-btn--primary adm-btn--sm'; save.textContent = 'Guardar';
    const cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'adm-btn adm-btn--ghost adm-btn--sm'; cancel.textContent = 'Cancelar';
    save.addEventListener('click', () => {
        const nuevo = Number(input.value);
        if (!Number.isInteger(nuevo) || nuevo < 0) { admToast('El precio debe ser un entero mayor o igual a 0 (sin decimales).', 'danger'); return; }
        if (nuevo === Math.round(Number(s.precio) || 0)) { render(); return; }
        admConfirm(`¿Cambiar el precio de «${s.nombre}» de ${cop(s.precio)} a ${cop(nuevo)}? Las ventas ya registradas conservan su precio.`, async () => {
            try { await actualizarServicioPrecio(s.id, nuevo, s.precio, uid()); admToast('Precio actualizado.', 'success'); }
            catch (e) { admToast('No se pudo actualizar el precio.', 'danger'); render(); }
        });
    });
    cancel.addEventListener('click', () => render());
    actions.append(save, cancel);

    li.append(info, input, actions);
    input.focus(); input.select();
}

function toggle(s) {
    const msg = s.activo
        ? `¿Retirar «${s.nombre}» del mostrador? Dejará de aparecer al cobrar (las ventas viejas no cambian).`
        : `¿Reactivar «${s.nombre}»? Volverá a aparecer en el mostrador.`;
    admConfirm(msg, async () => {
        try { await setServicioActivo(s.id, !s.activo); admToast(s.activo ? 'Servicio retirado.' : 'Servicio activado.', 'success'); }
        catch (e) { admToast('No se pudo cambiar el estado.', 'danger'); }
    });
}

async function handleCrear() {
    const hint = document.getElementById('serv-crear-err');
    const err = (m) => { hint.textContent = m; hint.hidden = false; };
    const codigo = (document.getElementById('serv-codigo').value || '').trim().toUpperCase();
    const nombre = (document.getElementById('serv-nombre').value || '').trim();
    const precio = Number(document.getElementById('serv-precio').value);
    const naturaleza = document.getElementById('serv-naturaleza').value;
    if (!codigo || codigo.length > 20) return err('El código es obligatorio (máx. 20 caracteres).');
    if (!nombre || nombre.length > 80) return err('El nombre es obligatorio (máx. 80 caracteres).');
    if (!Number.isInteger(precio) || precio < 0) return err('El precio debe ser un entero mayor o igual a 0 (sin decimales).');
    if (_servicios.some(s => String(s.codigo || '').toUpperCase() === codigo)) return err(`Ya existe un servicio con el código «${codigo}».`);
    hint.hidden = true;
    const btn = document.getElementById('serv-crear'); btn.disabled = true;
    try {
        await crearServicio({ codigo, nombre, precio, naturaleza }, uid());
        document.getElementById('serv-codigo').value = '';
        document.getElementById('serv-nombre').value = '';
        document.getElementById('serv-precio').value = '';
        document.getElementById('serv-naturaleza').value = 'servicio';
        admToast(`✓ Servicio «${nombre}» creado.`, 'success');
    } catch (e) {
        err('No se pudo crear el servicio. Revisa tu conexión o permisos.');
    } finally {
        btn.disabled = false;
    }
}

init();
