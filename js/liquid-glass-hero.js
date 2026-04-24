/* Liquid Glass Hero — 3D parallax tilt
   Reads data-tilt="0.4" etc. and applies perspective rotation based on mouse position.
   Only on desktop (pointer: fine) and when prefers-reduced-motion is NOT set. */
(function () {
    if (typeof window === 'undefined') return;

    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (reducedMotion || isCoarse) return;

    function init() {
        var stage = document.querySelector('.hero-aqua-grid');
        if (!stage) return;

        var targets = Array.prototype.slice.call(
            stage.parentNode.querySelectorAll('[data-tilt]')
        );
        if (!targets.length) return;

        var mouseX = 0, mouseY = 0;
        var rafId = null;

        function onMove(e) {
            var rect = stage.getBoundingClientRect();
            mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
            if (rafId) return;
            rafId = requestAnimationFrame(apply);
        }

        function apply() {
            rafId = null;
            for (var i = 0; i < targets.length; i++) {
                var el = targets[i];
                var depth = parseFloat(el.getAttribute('data-tilt')) || 1;
                var ry = mouseX * 4 * depth;
                var rx = -mouseY * 4 * depth;
                // Preserve the existing translateX(-50%) for .hero-aqua-float--tag
                var base = el.classList.contains('hero-aqua-float--tag') ? 'translateX(-50%) ' : '';
                el.style.transform = base + 'perspective(1200px) rotateY(' + ry + 'deg) rotateX(' + rx + 'deg) translateZ(0)';
            }
        }

        window.addEventListener('mousemove', onMove, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
