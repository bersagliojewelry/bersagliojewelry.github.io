/**
 * Bersaglio Admin — Login Page Controller
 */

import { signIn, resetPassword, currentUser } from '../auth.js';

async function init() {
    // If already logged in, redirect to dashboard
    // Small delay to let auth state resolve
    await new Promise(r => setTimeout(r, 500));
    if (currentUser()) {
        window.location.replace('admin.html');
        return;
    }

    // Check for error params
    const params = new URLSearchParams(location.search);
    if (params.get('error') === 'forbidden') {
        showError('login-error', 'No tienes permisos suficientes para acceder.');
    }

    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('forgot-password-btn').addEventListener('click', showResetForm);

    // Reset form
    document.getElementById('reset-form').addEventListener('submit', handleReset);
    document.getElementById('back-to-login-btn').addEventListener('click', showLoginForm);
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
        await signIn(email, pass);
        window.location.replace('admin.html');
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
