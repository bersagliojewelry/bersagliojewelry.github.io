/**
 * Bersaglio Jewelry — Cinematic Preloader
 * Reveal sequence: Logo → Brand name → Gold separator → Tagline → Fade out
 */

export function initPreloader() {
    // Show only once per browser session (not on every page change)
    if (sessionStorage.getItem('bj-loaded')) return;
    sessionStorage.setItem('bj-loaded', '1');

    const el = document.createElement('div');
    el.id = 'preloader';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
        <div class="preloader-inner">
            <div class="preloader-logo-wrap">
                <img src="img/logo-bj2.png" alt="" class="preloader-logo-img" draggable="false">
            </div>
            <div class="preloader-label">
                <span class="preloader-brand">BERSAGLIO</span>
                <span class="preloader-sep"></span>
                <span class="preloader-sub">JEWELRY</span>
            </div>
        </div>
    `;

    document.body.appendChild(el);
    document.body.classList.add('is-preloading');

    const exit = () => {
        el.classList.add('preloader--exit');
        document.body.classList.remove('is-preloading');
        el.addEventListener('transitionend', () => el.remove(), { once: true });
    };

    // Total display time: 2.5s (animations finish around 2.0s)
    setTimeout(exit, 2500);
}
