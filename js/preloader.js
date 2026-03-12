/**
 * Bersaglio Jewelry — Preloader
 * CSS-only elegant diamond spinner. No external images.
 */

export function initPreloader() {
    if (sessionStorage.getItem('bj-loaded')) return;
    sessionStorage.setItem('bj-loaded', '1');

    const el = document.createElement('div');
    el.id = 'preloader';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
        <div class="preloader-content">
            <div class="preloader-diamond">
                <div class="preloader-diamond-inner"></div>
            </div>
            <div class="preloader-ring">
                <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" />
                </svg>
            </div>
            <span class="preloader-text">BERSAGLIO</span>
        </div>
    `;
    document.body.prepend(el);
    document.body.classList.add('is-preloading');

    const minMs = 1200;
    const start = Date.now();

    function hide() {
        const wait = Math.max(0, minMs - (Date.now() - start));
        setTimeout(() => {
            el.classList.add('preloader--hide');
            el.addEventListener('transitionend', () => {
                el.remove();
                document.body.classList.remove('is-preloading');
            }, { once: true });
        }, wait);
    }

    if (document.readyState === 'complete') {
        hide();
    } else {
        window.addEventListener('load', hide, { once: true });
    }
}
