/**
 * Creates a pagination component
 * @param {Object} config Configuration object
 * @param {number} config.totalItems Total number of items to paginate
 * @param {number} config.itemsPerPage Number of items per page
 * @param {string} config.containerSelector CSS selector for the pagination container
 * @param {Function} config.onPageChange Callback function when page changes
 * @returns {Object} Pagination controller object
 */
export function createPagination({ totalItems, itemsPerPage, containerSelector, onPageChange }) {
    let currentPage = 1;
    const container = document.querySelector(containerSelector);
    if (!container) return null;

    /**
     * Create a pagination button
     * @param {string|number} content Button content
     * @param {string|null} action Button action (prev, next, or null for page number)
     * @returns {HTMLButtonElement} Created button
     */
    function createButton(content, action = null) {
        const button = document.createElement('button');
        button.className = 'pagination-btn hover-effect';
        if (typeof content === 'number' && content === currentPage) {
            button.classList.add('active');
        }
        button.textContent = content;
        if (action) {
            button.dataset.action = action;
        }
        return button;
    }

    /**
     * Update pagination display
     */
    function updateDisplay() {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        container.innerHTML = '';

        // Previous button
        if (totalPages > 1) {
            const prevButton = createButton('<', 'prev');
            prevButton.disabled = currentPage === 1;
            container.appendChild(prevButton);
        }

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            // Show first page, last page, current page, and pages around current
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - 2 && i <= currentPage + 2)
            ) {
                container.appendChild(createButton(i));
            } else if (
                (i === currentPage - 3 && currentPage > 4) ||
                (i === currentPage + 3 && currentPage < totalPages - 3)
            ) {
                // Add ellipsis
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                container.appendChild(ellipsis);
            }
        }

        // Next button
        if (totalPages > 1) {
            const nextButton = createButton('>', 'next');
            nextButton.disabled = currentPage === totalPages;
            container.appendChild(nextButton);
        }
    }

    /**
     * Handle pagination clicks
     * @param {Event} e Click event
     */
    function handleClick(e) {
        const button = e.target.closest('button');
        if (!button) return;

        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const action = button.dataset.action;
        let newPage = currentPage;

        if (action === 'prev' && currentPage > 1) {
            newPage = currentPage - 1;
        } else if (action === 'next' && currentPage < totalPages) {
            newPage = currentPage + 1;
        } else if (!action) {
            newPage = parseInt(button.textContent);
        }

        if (newPage !== currentPage) {
            currentPage = newPage;
            updateDisplay();
            onPageChange(currentPage);
        }
    }

    // Initialize
    container.addEventListener('click', handleClick);
    updateDisplay();

    // Return controller
    return {
        updateTotal(newTotal) {
            totalItems = newTotal;
            currentPage = 1;
            updateDisplay();
        },
        getCurrentPage() {
            return currentPage;
        },
        destroy() {
            container.removeEventListener('click', handleClick);
        }
    };
}
