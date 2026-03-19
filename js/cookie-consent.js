/**
 * Bersaglio Jewelry — Cookie Consent (GDPR)
 * Lightweight, no external dependencies.
 */

const COOKIE_KEY = 'bj_cookie_consent';

export function initCookieConsent() {
    if (localStorage.getItem(COOKIE_KEY)) return;

    const banner = document.getElementById('cookie-banner');
    if (!banner) return;

    banner.hidden = false;

    document.getElementById('cookie-accept')?.addEventListener('click', () => {
        localStorage.setItem(COOKIE_KEY, 'accepted');
        banner.hidden = true;
        // Initialize analytics only after consent
        import('./analytics.js').then(m => m.initAnalytics?.());
    });

    document.getElementById('cookie-decline')?.addEventListener('click', () => {
        localStorage.setItem(COOKIE_KEY, 'declined');
        banner.hidden = true;
    });
}
