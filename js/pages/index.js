import { initLazyLoading } from '../utils/lazyLoad.js';
import { updateNavigation } from '../layout/nav.js';
import { sortPostsByDate, sortPostsByTitle, filterPostsByTag, searchPosts, initializeFilters } from '../components/filter.js';
import { initializeCarousel } from '../components/carousel.js';
import { createPagination } from '../components/pagination.js';

// Constants
const API_BASE_URL = 'https://v2.api.noroff.dev';
const postsPerPage = 12;
let currentPage = 1;
let allPosts = [];
let pagination = null;

// DOM Elements
const thumbnailWrapper = document.querySelector('.thumbnail-wrapper');
const poemHeader = document.getElementById('poemHeader');
const poemTitle = document.getElementById('poemTitle');
const poemAuthor = document.getElementById('poemAuthor');
const poemPublished = document.getElementById('poemPublished');
const headerImage = poemHeader.querySelector('img');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

/**
 * Display posts from Gaspar6's account
 */
async function displayGaspar6Posts() {
    thumbnailWrapper.innerHTML = '<div class="loading-spinner">Loading...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/blog/posts/gaspar6`);
        const data = await response.json();

        if (!data || !data.data) {
            thumbnailWrapper.innerHTML = `
                <p class="text-center">No posts available.</p>
            `;
            return;
        }

        allPosts = Array.isArray(data.data) ? data.data : [data.data];

        // Initialize carousel with posts
        initializeCarousel(allPosts);

        // Initialize filters after posts are loaded
        initializeFilters(allPosts, (filters) => {


            // First apply search
            let filteredPosts = searchPosts(allPosts, filters.searchTerm);

            // Then filter by tag
            filteredPosts = filterPostsByTag(filteredPosts, filters.tag);

            // Finally apply sorting
            if (filters.sortType === 'date') {
                filteredPosts = sortPostsByDate(filteredPosts, filters.sortValue);
            } else {
                filteredPosts = sortPostsByTitle(filteredPosts, filters.sortValue);
            }

            // Update pagination and display posts
            pagination = createPagination({
                totalItems: filteredPosts.length,
                itemsPerPage: postsPerPage,
                containerSelector: '.pagination-controls',
                onPageChange: (page) => displayPagedPosts(filteredPosts, page)
            });

            // Display first page
            displayPagedPosts(filteredPosts, 1);
        });

    } catch (error) {
        console.error('Error fetching posts:', error);
        thumbnailWrapper.innerHTML = `
            <p class="text-center">Error loading posts. Please try again.</p>
        `;
    }
}

/**
 * Display the posts in the thumbnail wrapper
 * @param {Array} posts Array of posts to display
 * @param {number} page Page number to display
 */
function displayPagedPosts(posts, page) {
    thumbnailWrapper.innerHTML = '';

    if (posts.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results font-brand text-center p-4';
        noResults.innerHTML = `
            <h3 class="fs-24 mb-2">No Posts Found</h3>
            <p class="fs-18">No poems found.</p>
        `;
        thumbnailWrapper.appendChild(noResults);
        return;
    }

    const startIndex = (page - 1) * postsPerPage;
    const endIndex = Math.min(startIndex + postsPerPage, posts.length);
    const postsToShow = posts.slice(startIndex, endIndex);

    postsToShow.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'account-thumbnail-container radius-10';
        postElement.dataset.postId = post.id;

        postElement.innerHTML = `
            <div class="account-thumbnail-content cursor-pointer" data-post-id="${post.id}">
                <img data-src="${post.media?.url || '../assets/images/image-1.png'}" 
                     src="../assets/images/image-1.png"
                     alt="${post.media?.alt || 'Thumbnail Image'}" 
                     class="account-thumbnail-img" />
                <div class="account-thumbnail-title font-brand bg-secondary text-center fs-18 fs-30-desktop fw-700">
                    ${post.title}
                </div>
                <div class="account-thumbnail-tags">
                    ${post.tags ? post.tags.map(tag => `<span class="account-thumbnail-tag">${tag}</span>`).join('') : ''}
                </div>
            </div>
        `;

        thumbnailWrapper.appendChild(postElement);
    });

    // Initialize lazy loading for the new images
    initLazyLoading('.account-thumbnail-img');
    setupThumbnailClicks();
}

/**
 * Set up click handlers for thumbnails to view full posts
 */
function setupThumbnailClicks() {
    const thumbnails = document.querySelectorAll('.account-thumbnail-content');
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            const postId = thumbnail.dataset.postId;
            fetchSpecificPost(postId);
        });
    });
}

/**
 * Fetch a specific post by ID
 * @param {string} postId - The ID of the post to fetch
 */
async function fetchSpecificPost(postId) {
    console.log('Fetching specific post:', postId);
    try {
        const response = await fetch(`${API_BASE_URL}/blog/posts/gaspar6/${postId}`);
        const data = await response.json();
        console.log('Received post data:', data);

        if (data && data.data) {
            localStorage.setItem('viewPost', JSON.stringify(data.data));
            window.location.href = `post/index.html?id=${postId}`;
        } else {
            console.error('Invalid post data received:', data);
        }
    } catch (error) {
        console.error('Error fetching post:', error);
    }
}

// Listen for carousel post clicks
document.addEventListener('carouselPostClick', (event) => {
    const { postId } = event.detail;
    fetchSpecificPost(postId);
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    displayGaspar6Posts();
});