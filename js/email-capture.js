/**
 * Bersaglio Jewelry — Email Capture Modal
 * Shows after 45s of session or on exit intent.
 * Stores subscription status in localStorage.
 */

const STORAGE_KEY = 'bj_subscribed';
const MODAL_ID    = 'email-capture-modal';

export function initEmailCapture() {
    if (localStorage.getItem(STORAGE_KEY)) return;

    // Inject modal HTML if not already in DOM
    if (!document.getElementById(MODAL_ID)) {
        injectModal();
    }

    // Show after 45 seconds
    const timer = setTimeout(showModal, 45_000);

    // Exit intent (mouse leaves viewport top)
    document.addEventListener('mouseleave', e => {
        if (e.clientY < 10) showModal();
    }, { once: true });

    // Cleanup on subscribe
    window._emailCaptureTimer = timer;
}

function showModal() {
    const modal = document.getElementById(MODAL_ID);
    if (!modal || modal.classList.contains('is-visible')) return;
    modal.hidden = false;
    // Force reflow then add class for animation
    modal.offsetHeight;
    modal.classList.add('is-visible');
}

function hideModal() {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) return;
    modal.classList.remove('is-visible');
    setTimeout(() => { modal.hidden = true; }, 300);
}

function injectModal() {
    const div = document.createElement('div');
    div.id = MODAL_ID;
    div.className = 'email-modal';
    div.hidden = true;
    div.setAttribute('role', 'dialog');
    div.setAttribute('aria-label', 'Suscripción al newsletter');

    div.innerHTML = `
        <div class="email-modal-backdrop"></div>
        <div class="email-modal-content">
            <button class="email-modal-close" aria-label="Cerrar">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            <div class="email-modal-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="0.8"><polygon points="12,2 22,8.5 12,22 2,8.5"/></svg>
            </div>
            <h2 class="email-modal-title">Recibe piezas exclusivas</h2>
            <p class="email-modal-desc">Sé el primero en conocer nuestras nuevas creaciones, colecciones limitadas y eventos privados.</p>
            <form class="email-modal-form" id="email-capture-form">
                <input type="email" class="email-modal-input" placeholder="tu@email.com" required aria-label="Correo electrónico">
                <button type="submit" class="email-modal-submit">Suscribirme</button>
            </form>
            <p class="email-modal-privacy">Sin spam. Puedes cancelar en cualquier momento.</p>
        </div>
    `;

    document.body.appendChild(div);

    // Event listeners
    div.querySelector('.email-modal-close').addEventListener('click', () => {
        hideModal();
        localStorage.setItem(STORAGE_KEY, 'dismissed');
    });

    div.querySelector('.email-modal-backdrop').addEventListener('click', () => {
        hideModal();
        localStorage.setItem(STORAGE_KEY, 'dismissed');
    });

    div.querySelector('#email-capture-form').addEventListener('submit', e => {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        // For now, store locally. When Klaviyo/Mailchimp is integrated,
        // this will POST to the API instead.
        localStorage.setItem(STORAGE_KEY, email);
        clearTimeout(window._emailCaptureTimer);

        // Show success state
        const content = div.querySelector('.email-modal-content');
        content.innerHTML = `
            <div class="email-modal-icon" aria-hidden="true" style="color: var(--emerald-light);">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h2 class="email-modal-title">Bienvenido/a</h2>
            <p class="email-modal-desc">Te avisaremos cuando tengamos algo especial para ti.</p>
        `;
        setTimeout(hideModal, 2500);
    });
}
