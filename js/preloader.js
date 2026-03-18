/**
 * Bersaglio Jewelry — Preloader
 * Muestra CARGANDO.png girando hasta que la página cargue.
 * CSS-only rotation — sin dependencias externas.
 */

export function initPreloader() {
    if (sessionStorage.getItem('bj-loaded')) return;
    sessionStorage.setItem('bj-loaded', '1');

    const el = document.createElement('div');
    el.id = 'preloader';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
        <div class="preloader-spinner">
            <img src="Pic/CARGANDO.png" class="preloader-img" alt="" draggable="false">
        </div>
    `;
    document.body.prepend(el);
    document.body.classList.add('is-preloading');

    const minMs = 1400;
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
