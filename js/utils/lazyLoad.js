/**
 * Initialize lazy loading for images
 * @param {string} selector - CSS selector for images to lazy load
 */
export function initLazyLoading(selector = 'img[data-src]') {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    // Observe all images that have a data-src attribute
    document.querySelectorAll(selector).forEach(img => {
        imageObserver.observe(img);
    });
}
