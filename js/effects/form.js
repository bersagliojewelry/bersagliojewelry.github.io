/**
 * Bersaglio Jewelry — Form Experience
 * Phase 5: floating labels, live validation, character counter,
 * animated submit (loading → success).
 */

/* ─── Floating label upgrade ────────────────────────────────── */
function upgradeFormFields(form) {
    // Already upgraded
    if (form.dataset.upgraded) return;
    form.dataset.upgraded = '1';

    form.querySelectorAll('.form-field input, .form-field textarea, .form-field select')
        .forEach(input => {
            // Reflect "has value" state on the wrapper
            const update = () => {
                const filled = input.value.trim() !== '' ||
                               (input.tagName === 'SELECT' && input.value !== '');
                input.closest('.form-field').classList.toggle('is-filled', filled);
            };

            input.addEventListener('input', update);
            input.addEventListener('change', update);
            input.addEventListener('focus', () =>
                input.closest('.form-field').classList.add('is-focused'));
            input.addEventListener('blur', () => {
                input.closest('.form-field').classList.remove('is-focused');
                update();
                validateField(input);
            });

            update(); // initial state
        });
}

/* ─── Validation ─────────────────────────────────────────────── */
const VALIDATORS = {
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    tel:   v => !v || v.replace(/[\s\-+()]/g, '').length >= 7,
    text:  v => v.trim().length >= 2,
    textarea: v => v.trim().length >= 5,
    select: v => !!v,
};

function validateField(input) {
    if (input.type === 'hidden') return true;
    if (!input.required && !input.value.trim() &&
        input.tagName !== 'SELECT') return true;  // optional + empty → ok

    const type     = input.tagName === 'SELECT'   ? 'select'   :
                     input.tagName === 'TEXTAREA'  ? 'textarea' : input.type;
    const validate = VALIDATORS[type] || VALIDATORS.text;
    const valid    = validate(input.value);

    input.closest('.form-field')?.classList.toggle('is-invalid', !valid);
    input.closest('.form-field')?.classList.toggle('is-valid',   valid);
    return valid;
}

/* ─── Character counter (textarea) ──────────────────────────── */
function addCharCounter(textarea, max = 600) {
    const counter = document.createElement('span');
    counter.className = 'form-char-counter';
    counter.textContent = `0 / ${max}`;
    textarea.closest('.form-field')?.appendChild(counter);

    textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        if (textarea.value.length > max) textarea.value = textarea.value.slice(0, max);
        counter.textContent  = `${Math.min(len, max)} / ${max}`;
        counter.classList.toggle('is-near', len >= max * 0.9);
    });
}

/* ─── Submit handler ─────────────────────────────────────────── */
function handleSubmit(form, e) {
    e.preventDefault();

    // Validate all required fields
    let valid = true;
    form.querySelectorAll('input[required], select[required], textarea')
        .forEach(input => {
            if (!validateField(input)) valid = false;
        });

    if (!valid) {
        const first = form.querySelector('.is-invalid input, .is-invalid select, .is-invalid textarea');
        first?.focus();
        return;
    }

    const btn    = form.querySelector('[type="submit"]');
    const origTx = btn ? btn.textContent : '';

    // Loading state
    if (btn) {
        btn.disabled     = true;
        btn.textContent  = 'Enviando…';
        btn.classList.add('is-loading');
    }

    // Simulate async send (replace with real fetch when backend is ready)
    setTimeout(() => {
        if (btn) {
            btn.textContent = '¡Consulta enviada!';
            btn.classList.remove('is-loading');
            btn.classList.add('is-success');
        }

        // Show success banner
        let banner = form.querySelector('.form-success-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.className = 'form-success-banner';
            banner.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22" aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
                <p><strong>Mensaje enviado</strong><br>
                Te responderemos en menos de 24 horas.</p>
            `;
            form.appendChild(banner);
        }
        banner.classList.add('is-visible');

        // Reset after delay
        setTimeout(() => {
            form.reset();
            form.querySelectorAll('.form-field').forEach(f =>
                f.classList.remove('is-filled','is-focused','is-invalid','is-valid'));

            if (btn) {
                btn.textContent = origTx;
                btn.disabled    = false;
                btn.classList.remove('is-success');
            }

            banner.classList.remove('is-visible');
        }, 5000);

    }, 1200);
}

/* ─── Main init ─────────────────────────────────────────────── */
export function initFormExperience(selector = '#contactForm') {
    const form = document.querySelector(selector);
    if (!form) return;

    upgradeFormFields(form);

    const textarea = form.querySelector('textarea');
    if (textarea) addCharCounter(textarea, 600);

    form.addEventListener('submit', e => handleSubmit(form, e));
}
