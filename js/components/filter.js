/**
 * Extract number from string if it exists
 * @param {string} str - String to extract number from
 * @returns {number} - Extracted number or Infinity if no number found
 */
function extractNumber(str) {
    const match = str.match(/\d+/);
    return match ? parseInt(match[0]) : Infinity;
}

/**
 * Sort posts by date
 * @param {Array} posts - Array of blog posts
 * @param {string} sortOrder - 'latest' or 'oldest'
 * @returns {Array} - Sorted posts
 */
export function sortPostsByDate(posts, sortOrder = 'latest') {
    return [...posts].sort((a, b) => {
        const dateA = new Date(a.created);
        const dateB = new Date(b.created);
        return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });
}

/**
 * Sort posts by title
 * @param {Array} posts - Array of blog posts
 * @param {string} sortOrder - 'title-az' or 'title-za'
 * @returns {Array} - Sorted posts
 */
export function sortPostsByTitle(posts, sortOrder = 'title-az') {
    return [...posts].sort((a, b) => {
        // Extract numbers from titles if they exist
        const numA = extractNumber(a.title);
        const numB = extractNumber(b.title);

        // If both titles have numbers and they're different, sort by number
        if (numA !== Infinity && numB !== Infinity && numA !== numB) {
            return sortOrder === 'title-az' ? numA - numB : numB - numA;
        }

        // Otherwise sort alphabetically
        const multiplier = sortOrder === 'title-az' ? 1 : -1;
        return multiplier * a.title.localeCompare(b.title);
    });
}

/**
 * Search posts by title
 * @param {Array} posts - Array of blog posts
 * @param {string} searchTerm - Search term
 * @returns {Array} - Filtered posts
 */
export function searchPosts(posts, searchTerm) {
    if (!searchTerm) return posts;

    const term = searchTerm.toLowerCase().trim();
    return posts.filter(post =>
        post.title.toLowerCase().includes(term)
    );
}

/**
 * Get unique tags from all posts
 * @param {Array} posts - Array of blog posts
 * @returns {Array} - Array of unique tags
 */
function getUniqueTags(posts) {
    const tagSet = new Set();
    posts.forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
            post.tags.forEach(tag => tagSet.add(tag));
        }
    });
    return Array.from(tagSet).sort();
}

/**
 * Filter posts by tag
 * @param {Array} posts - Array of blog posts
 * @param {string} tag - Tag to filter by
 * @returns {Array} - Filtered posts
 */
export function filterPostsByTag(posts, tag) {
    if (!tag || tag === 'all') return posts;
    return posts.filter(post =>
        post.tags && Array.isArray(post.tags) && post.tags.includes(tag)
    );
}

/**
 * Initialize sorting and filtering functionality
 * @param {Array} posts - Array of all posts
 * @param {Function} onFilterChange - Callback function when filters change
 */
export function initializeFilters(posts, onFilterChange) {
    const dateSelect = document.getElementById('sortDate');
    const titleSelect = document.getElementById('sortTitle');
    const tagSelect = document.getElementById('tagFilter');
    const searchInput = document.getElementById('searchInput');

    // Populate tag filter options
    const tags = getUniqueTags(posts);
    tagSelect.innerHTML = `
        <option value="all">All Tags</option>
        ${tags.map(tag => `<option value="${tag}">${tag}</option>`).join('')}
    `;

    // Set defaults
    dateSelect.value = 'latest';
    titleSelect.value = 'none';
    tagSelect.value = 'all';
    searchInput.value = '';

    // Add event listeners
    dateSelect.addEventListener('change', () => {
        titleSelect.value = 'none'; // Reset title selection when date filter changes
        updateFilters();
    });

    titleSelect.addEventListener('change', () => {
        if (titleSelect.value !== 'none') {
            dateSelect.value = 'latest'; // Reset date selection when title filter is used
        }
        updateFilters();
    });

    tagSelect.addEventListener('change', updateFilters);

    // Add debounced search input listener
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(updateFilters, 300); // Wait 300ms after typing stops
    });

    function updateFilters() {
        let sortType = 'date';
        let sortValue = dateSelect.value;

        // Check if title sort is selected
        if (titleSelect.value !== 'none') {
            sortType = 'title';
            sortValue = titleSelect.value;
        }

        const filters = {
            sortType,
            sortValue,
            tag: tagSelect.value,
            searchTerm: searchInput.value
        };

        onFilterChange(filters);
    }

    // Trigger initial filter
    updateFilters();
}
