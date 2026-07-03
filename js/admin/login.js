/**
 * Bersaglio Admin — Login Page Controller
 */

import { signIn, resetPassword, sessionReady, signOut } from '../auth.js';

function init() {
    // 1. Cablear la UI PRIMERO (síncrono): submit/Enter vivos desde el 1er ms. Antes el sleep de
    //    500ms los dejaba muertos medio segundo (TODO-64 P3).
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('forgot-password-btn').addEventListener('click', showResetForm);
    document.getElementById('reset-form').addEventListener('submit', handleReset);
    document.getElementById('back-to-login-btn').addEventListener('click', showLoginForm);

    // 2. Leer el motivo de expulsión y LIMPIAR la URL AQUÍ. Antes lo borraba un inline del <head>
    //    de admin-login.html ANTES de que este módulo lo leyera → el mensaje nunca se mostraba
    //    (TODO-64 H3). Ahora se lee primero y se limpia después.
    const params  = new URLSearchParams(location.search);
    const errCode = params.get('error');
    if (location.search) history.replaceState(null, '', location.pathname);

    // 3. Redirigir si YA hay sesión — determinista, con el rol REAL, SIN timeout mágico.
    //    `sessionReady()` resuelve tras escribir `bj_auth`, así el destino nunca rebota por falta
    //    de la pista de sesión (TODO-64 H1/H2).
    routeIfLoggedIn(errCode);
}

async function routeIfLoggedIn(errCode) {
    const { user, profile } = await sessionReady();

    if (user && profile) {
        // Sesión viva + perfil válido → página del rol, UNA sola redirección (sin rebotes/flashes).
        // Catálogo (Kary) no ve admin.html (requireAuth('editor')) → directo a Piezas.
        window.location.replace(profile.role === 'catalogo' ? 'admin-piezas.html' : 'admin.html');
        return;
    }
    if (user && !profile) {
        // Sesión de Auth sin doc de perfil (no es staff válido) → cerrar SIN navegar y avisar.
        await signOut({ redirect: false });
        showError('login-error', 'Tu cuenta no tiene acceso al panel. Contacta al administrador.');
        return;
    }

    // Sin sesión → mostrar el motivo de expulsión (si lo hubo) y quedarse en el login.
    if (errCode === 'forbidden')     showError('login-error', 'No tienes permisos suficientes para acceder.');
    else if (errCode === 'disabled') showError('login-error', 'Tu cuenta fue desactivada. Contacta al administrador.');
}

async function handleLogin(e) {
    e.preventDefault();
    const btn   = document.getElementById('login-submit');
    const email = document.getElementById('login-email').value.trim();
    const pass  = document.getElementById('login-password').value;

    if (!email || !pass) {
        showError('login-error', 'Ingresa tu email y contraseña.');
        return;
    }

    btn.disabled    = true;
    btn.textContent = 'Verificando...';
    hideError('login-error');

    try {
        const { profile } = await signIn(email, pass);
        window.location.replace(profile?.role === 'catalogo' ? 'admin-piezas.html' : 'admin.html');
    } catch (err) {
        showError('login-error', err.message);
        btn.disabled    = false;
        btn.textContent = 'Iniciar sesión';
    }
}

async function handleReset(e) {
    e.preventDefault();
    const btn   = document.getElementById('reset-submit');
    const email = document.getElementById('reset-email').value.trim();

    if (!email) {
        showError('reset-error', 'Ingresa tu correo electrónico.');
        return;
    }

    btn.disabled    = true;
    btn.textContent = 'Enviando...';
    hideError('reset-error');

    try {
        await resetPassword(email);
        document.getElementById('reset-message').textContent = 'Enlace enviado. Revisa tu correo (incluye spam).';
        document.getElementById('reset-message').hidden = false;
        btn.textContent = 'Enlace enviado';
    } catch {
        showError('reset-error', 'No se pudo enviar el enlace. Verifica el correo.');
        btn.disabled    = false;
        btn.textContent = 'Enviar enlace';
    }
}

function showResetForm() {
    document.getElementById('login-form').hidden = true;
    document.getElementById('reset-form').hidden = false;
    document.getElementById('reset-email').focus();
}

function showLoginForm() {
    document.getElementById('reset-form').hidden = true;
    document.getElementById('login-form').hidden = false;
    document.getElementById('login-email').focus();
}

function showError(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.hidden = false;
}

function hideError(id) {
    document.getElementById(id).hidden = true;
}

init();
