/**
 * Bersaglio Jewelry — Renderer Utility
 * Lightweight rendering helpers for dynamic content.
 * Designed to be backend-agnostic: works with local data now,
 * easily swappable to Firebase/API later.
 */

const Renderer = {

    /**
     * Render HTML into a target element
     */
    render(selector, html) {
        const el = document.querySelector(selector);
        if (el) el.innerHTML = html;
    },

    /**
     * Render a list of items using a template function
     */
    renderList(selector, items, templateFn) {
        const html = items.map(templateFn).join('');
        this.render(selector, html);
    },

    /**
     * Create element from HTML string
     */
    createElement(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    },

    /**
     * Lazy load images with IntersectionObserver
     */
    initLazyImages() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '100px' });

        document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
    },

    /**
     * Scroll-triggered fade-in animations
     */
    initScrollAnimations() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    }
};

export default Renderer;
