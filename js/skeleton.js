/**
 * Bersaglio Jewelry — Skeleton Shimmer + Image Fade-in
 *
 * Injects a shimmer placeholder behind every piece image.
 * When the image finishes loading, the shimmer fades out
 * and the image fades in — smooth premium transition.
 *
 * Works with both static HTML images and dynamically rendered ones.
 */

const SKELETON_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" aria-hidden="true">
    <polygon points="12,2 22,8.5 12,22 2,8.5"/>
    <line x1="2" y1="8.5" x2="22" y2="8.5"/>
    <polyline points="7,2 12,8.5 17,2"/>
</svg>`;

function createShimmer() {
    const div = document.createElement('div');
    div.className = 'skeleton-shimmer';
    div.setAttribute('aria-hidden', 'true');
    div.innerHTML = SKELETON_SVG;
    return div;
}

function revealImage(img) {
    if (img.dataset.shimmerReady) return;
    img.dataset.shimmerReady = '1';

    const wrapper = img.closest('.piece-image-wrapper, .piece-card-img, .piece-card-visual, .pf-piece-img, .pieza-main-image');
    if (!wrapper) {
        // No wrapper — just reveal immediately
        img.classList.add('is-loaded');
        return;
    }

    // Insert shimmer if not already there
    let shimmer = wrapper.querySelector('.skeleton-shimmer');
    if (!shimmer) {
        shimmer = createShimmer();
        // Insert shimmer before the image so it appears underneath
        wrapper.style.position = 'relative';
        wrapper.insertBefore(shimmer, wrapper.firstChild);
    }

    function onLoaded() {
        img.classList.add('is-loaded');
        shimmer.classList.add('is-hidden');
        // Remove shimmer from DOM after fade-out animation
        setTimeout(() => shimmer.remove(), 350);
    }

    if (img.complete && img.naturalWidth > 0) {
        onLoaded();
    } else {
        img.addEventListener('load', onLoaded, { once: true });
        img.addEventListener('error', () => {
            // On error, just remove shimmer so placeholder shows
            shimmer.classList.add('is-hidden');
            setTimeout(() => shimmer.remove(), 350);
        }, { once: true });
    }
}

/**
 * Process all piece images currently in the DOM.
 * Safe to call multiple times (idempotent via data-shimmer-ready).
 */
export function processImages() {
    const selectors = [
        '.piece-img',
        '.piece-card-img-real',
        '.pf-piece-img img',
        '.pieza-img',
    ];

    document.querySelectorAll(selectors.join(',')).forEach(revealImage);
}

/**
 * Observe the DOM for dynamically added images (from Firestore renders).
 */
export function initSkeletonShimmer() {
    // Process existing images
    processImages();

    // Watch for dynamically rendered piece cards
    const observer = new MutationObserver(() => processImages());
    observer.observe(document.body, { childList: true, subtree: true });
}
