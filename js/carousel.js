/**
 * ALTORRA CARS - Carousel System
 * Sistema de carrusel deslizante reutilizable con soporte touch
 * FASE 2: Mejoras Visuales
 */

class Carousel {
    constructor(containerElement, options = {}) {
        this.container = containerElement;
        this.wrapper = this.container.querySelector('.carousel-wrapper');
        this.items = Array.from(this.wrapper.children);

        // Options
        this.options = {
            itemsPerView: options.itemsPerView || this.getItemsPerView(),
            gap: options.gap || 16,
            autoplay: options.autoplay || false,
            autoplayDelay: options.autoplayDelay || 5000,
            loop: options.loop !== false,
            showIndicators: options.showIndicators !== false,
            showNavigation: options.showNavigation !== false,
            ...options
        };

        // State
        this.currentIndex = 0;
        this.isTransitioning = false;
        this.autoplayInterval = null;
        this.touchStartX = 0;
        this.touchEndX = 0;

        this.init();
    }

    init() {
        if (this.items.length === 0) return;

        // Create navigation buttons
        if (this.options.showNavigation && this.items.length > this.options.itemsPerView) {
            this.createNavigation();
        }

        // Create indicators
        if (this.options.showIndicators && this.items.length > this.options.itemsPerView) {
            this.createIndicators();
        }

        // Setup touch events
        this.setupTouchEvents();

        // Setup resize handler
        window.addEventListener('resize', () => this.handleResize());

        // Start autoplay if enabled
        if (this.options.autoplay) {
            this.startAutoplay();
        }

        // Initial render
        this.updateCarousel();
    }

    getItemsPerView() {
        const width = window.innerWidth;
        if (width < 640) return 1;
        if (width < 968) return 2;
        return 3;
    }

    createNavigation() {
        // Previous button
        this.prevBtn = document.createElement('button');
        this.prevBtn.className = 'carousel-nav prev';
        this.prevBtn.innerHTML = '‹';
        this.prevBtn.setAttribute('aria-label', 'Anterior');
        this.prevBtn.addEventListener('click', () => this.prev());

        // Next button
        this.nextBtn = document.createElement('button');
        this.nextBtn.className = 'carousel-nav next';
        this.nextBtn.innerHTML = '›';
        this.nextBtn.setAttribute('aria-label', 'Siguiente');
        this.nextBtn.addEventListener('click', () => this.next());

        this.container.appendChild(this.prevBtn);
        this.container.appendChild(this.nextBtn);
    }

    createIndicators() {
        const totalPages = Math.ceil(this.items.length / this.options.itemsPerView);

        this.indicatorsContainer = document.createElement('div');
        this.indicatorsContainer.className = 'carousel-indicators';

        for (let i = 0; i < totalPages; i++) {
            const indicator = document.createElement('button');
            indicator.className = 'carousel-indicator';
            indicator.setAttribute('aria-label', `Ir a página ${i + 1}`);
            indicator.addEventListener('click', () => this.goToPage(i));
            this.indicatorsContainer.appendChild(indicator);
        }

        this.container.appendChild(this.indicatorsContainer);
        this.updateIndicators();
    }

    setupTouchEvents() {
        // Touch events (mobile)
        this.wrapper.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.stopAutoplay();
        }, { passive: true });

        this.wrapper.addEventListener('touchmove', (e) => {
            this.touchEndX = e.touches[0].clientX;
        }, { passive: true });

        this.wrapper.addEventListener('touchend', () => {
            this.handleSwipe();
            if (this.options.autoplay) {
                this.startAutoplay();
            }
        });

        // Mouse drag events (desktop)
        let isDragging = false;
        let dragStartX = 0;

        this.wrapper.style.cursor = 'grab';

        this.wrapper.addEventListener('mousedown', (e) => {
            if (e.target.closest('button, a')) return;
            isDragging = true;
            dragStartX = e.clientX;
            this.wrapper.style.cursor = 'grabbing';
            this.stopAutoplay();
        });

        this.wrapper.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            this.touchEndX = e.clientX;
        });

        const endDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            this.wrapper.style.cursor = 'grab';
            this.touchStartX = dragStartX;
            this.handleSwipe();
            if (this.options.autoplay) {
                this.startAutoplay();
            }
        };

        this.wrapper.addEventListener('mouseup', endDrag);
        this.wrapper.addEventListener('mouseleave', endDrag);
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.next();
            } else {
                this.prev();
            }
        }
    }

    handleResize() {
        const newItemsPerView = this.getItemsPerView();
        if (newItemsPerView !== this.options.itemsPerView) {
            this.options.itemsPerView = newItemsPerView;
            this.currentIndex = 0;
            this.updateCarousel();
        }
    }

    updateCarousel() {
        if (this.isTransitioning) return;

        const itemWidth = this.container.offsetWidth / this.options.itemsPerView;
        const gap = this.options.gap;
        const offset = -(this.currentIndex * (itemWidth + gap));

        this.wrapper.style.transform = `translateX(${offset}px)`;

        // Update navigation buttons
        if (this.prevBtn && this.nextBtn) {
            const maxIndex = this.items.length - this.options.itemsPerView;
            this.prevBtn.disabled = !this.options.loop && this.currentIndex === 0;
            this.nextBtn.disabled = !this.options.loop && this.currentIndex >= maxIndex;
        }

        // Update indicators
        this.updateIndicators();
    }

    updateIndicators() {
        if (!this.indicatorsContainer) return;

        const indicators = this.indicatorsContainer.querySelectorAll('.carousel-indicator');
        const currentPage = Math.floor(this.currentIndex / this.options.itemsPerView);

        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentPage);
        });
    }

    next() {
        if (this.isTransitioning) return;

        const maxIndex = this.items.length - this.options.itemsPerView;

        if (this.currentIndex >= maxIndex) {
            if (this.options.loop) {
                this.currentIndex = 0;
            } else {
                return;
            }
        } else {
            this.currentIndex++;
        }

        this.updateCarousel();
    }

    prev() {
        if (this.isTransitioning) return;

        if (this.currentIndex <= 0) {
            if (this.options.loop) {
                this.currentIndex = this.items.length - this.options.itemsPerView;
            } else {
                return;
            }
        } else {
            this.currentIndex--;
        }

        this.updateCarousel();
    }

    goToPage(pageIndex) {
        if (this.isTransitioning) return;

        this.currentIndex = pageIndex * this.options.itemsPerView;
        this.updateCarousel();
    }

    startAutoplay() {
        if (this.autoplayInterval) return;

        this.autoplayInterval = setInterval(() => {
            this.next();
        }, this.options.autoplayDelay);
    }

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }

    destroy() {
        this.stopAutoplay();
        if (this.prevBtn) this.prevBtn.remove();
        if (this.nextBtn) this.nextBtn.remove();
        if (this.indicatorsContainer) this.indicatorsContainer.remove();
    }
}

/**
 * Initialize all carousels on the page
 */
function initializeCarousels() {
    const carouselContainers = document.querySelectorAll('.carousel-container');
    const carousels = [];

    carouselContainers.forEach(container => {
        const options = {
            autoplay: container.dataset.autoplay === 'true',
            autoplayDelay: parseInt(container.dataset.autoplayDelay) || 5000,
            loop: container.dataset.loop !== 'false',
            showIndicators: container.dataset.showIndicators !== 'false',
            showNavigation: container.dataset.showNavigation !== 'false'
        };

        carousels.push(new Carousel(container, options));
    });

    return carousels;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Carousel, initializeCarousels };
}
