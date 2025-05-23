import { getUserPosts, deletePost } from '../api/posts.js';
import { checkAuth } from '../utils/auth.js';
import { initLazyLoading } from '../utils/lazyLoad.js';

// Pagination state
let currentPage = 1;
const postsPerPage = 12;
let allPosts = [];

/**
 * Display user's posts in the account page
 */
async function displayUserPosts() {
    const thumbnailsWrapper = document.querySelector('.account-thumbnails-wrapper');
    thumbnailsWrapper.innerHTML = '<div class="loading-spinner">Loading...</div>';

    try {
        const user = checkAuth();
        if (!user || !user.name) {
            throw new Error('User not found or invalid');
        }

        const response = await getUserPosts(user.name);
        allPosts = response.data;

        if (!allPosts || !Array.isArray(allPosts) || allPosts.length === 0) {
            thumbnailsWrapper.innerHTML = `
                <p class="text-center">No posts yet. Start creating your poems!</p>
            `;
            return;
        }

        updatePagination(allPosts.length);
        displayPosts(currentPage);

    } catch (error) {
        console.error('Error fetching posts:', error);
        thumbnailsWrapper.innerHTML = `
            <p class="text-center">Error loading posts. Please try again.</p>
        `;
    }
}

/**
 * Display posts for the given page
 * @param {number} page The page number to display
 */
function displayPosts(page) {
    const thumbnailsWrapper = document.querySelector('.account-thumbnails-wrapper');
    thumbnailsWrapper.innerHTML = '';

    const startIndex = (page - 1) * postsPerPage;
    const endIndex = Math.min(startIndex + postsPerPage, allPosts.length);
    const postsToShow = allPosts.slice(startIndex, endIndex);

    postsToShow.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'account-thumbnail-container radius-10';
        postElement.dataset.postId = post.id; // Add post ID to the container
        postElement.innerHTML = `
            <div class="account-thumbnail-controls">
                <button class="btn account-edit-btn" data-post-id="${post.id}">
                    <span>Edit</span>
                    <img loading="lazy" src="../assets/icons/Edit-Document.png" alt="Edit Icon">
                </button>
                <button class="btn account-delete-btn" data-post-id="${post.id}">
                    <img loading="lazy" src="../assets/icons/Remove.png" alt="Delete Icon">
                </button>
            </div>
            <div class="account-thumbnail-content cursor-pointer" data-post-id="${post.id}">
                <img data-src="${post.media.url || '../assets/images/image-1.png'}" 
                     src="../assets/images/image-1.png"
                     alt="${post.media.alt || 'Thumbnail Image'}" 
                     class="account-thumbnail-img" />
                <div class="account-thumbnail-title font-brand bg-secondary text-center fs-18 fs-30-desktop fw-700">
                    ${post.title}
                </div>
                <div class="account-thumbnail-tags">
                    ${post.tags ? post.tags.map(tag => `<span class="account-thumbnail-tag">${tag}</span>`).join('') : ''}
                </div>
            </div>
        `;
        thumbnailsWrapper.appendChild(postElement);
    });

    // Initialize lazy loading for the new images
    initLazyLoading('.account-thumbnail-img');
    setupPostControls();
    setupThumbnailClicks();
}

/**
 * Update pagination controls
 * @param {number} totalPosts The total number of posts
 */
function updatePagination(totalPosts) {
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    const paginationControls = document.querySelector('.pagination-controls');
    paginationControls.innerHTML = '';

    // Previous button
    const prevButton = createPaginationButton('&lt;', 'prev');
    prevButton.disabled = currentPage === 1;
    paginationControls.appendChild(prevButton);

    // Calculate which page numbers to show
    let pagesToShow = [];

    // Always show first page
    pagesToShow.push(1);

    // Calculate range around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        if (i === 1 || i === totalPages) continue; // Skip if it's first or last page
        pagesToShow.push(i);
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
        pagesToShow.push(totalPages);
    }

    // Sort and remove duplicates
    pagesToShow = [...new Set(pagesToShow)].sort((a, b) => a - b);

    // Add page numbers with ellipsis
    let previousPage = 0;
    pagesToShow.forEach(pageNum => {
        if (pageNum - previousPage > 1) {
            // Add ellipsis
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            paginationControls.appendChild(ellipsis);
        }
        const pageButton = createPaginationButton(pageNum);
        if (pageNum === currentPage) pageButton.classList.add('active');
        paginationControls.appendChild(pageButton);
        previousPage = pageNum;
    });

    // Next button
    const nextButton = createPaginationButton('&gt;', 'next');
    nextButton.disabled = currentPage === totalPages;
    paginationControls.appendChild(nextButton);
}

/**
 * Create a pagination button
 * @param {string} content The button content
 * @param {string|null} action The button action (prev, next, or null for page number)
 * @returns {HTMLButtonElement} The created button
 */
function createPaginationButton(content, action = null) {
    const button = document.createElement('button');
    button.className = 'pagination-btn';
    button.innerHTML = content;
    if (action) button.dataset.action = action;

    button.addEventListener('click', () => {
        const totalPages = Math.ceil(allPosts.length / postsPerPage);

        if (action === 'prev' && currentPage > 1) {
            currentPage--;
        } else if (action === 'next' && currentPage < totalPages) {
            currentPage++;
        } else if (!action) {
            currentPage = parseInt(content);
        }

        displayPosts(currentPage);
        updatePagination(allPosts.length);
    });

    return button;
}

/**
 * Set up post controls (edit and delete buttons)
 */
async function setupPostControls() {
    const posts = document.querySelectorAll('.account-thumbnail-container');

    posts.forEach(thumbnailContainer => {
        const postId = thumbnailContainer.dataset.postId; // Updated to match the new data attribute
        const deleteBtn = thumbnailContainer.querySelector('.account-delete-btn');
        const editBtn = thumbnailContainer.querySelector('.account-edit-btn');
        const deleteIcon = deleteBtn.querySelector('img');

        // Setup Edit Button Handler
        editBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            if (!postId) {
                console.error('No post ID found for edit action');
                return;
            }

            try {
                // Disable button and show loading state
                editBtn.disabled = true;
                const originalContent = editBtn.innerHTML;
                editBtn.innerHTML = 'Loading...';

                // Find the post data
                const post = allPosts.find(p => p.id === postId);
                if (post) {
                    // Store post data in localStorage for edit page
                    localStorage.setItem('editPost', JSON.stringify(post));
                    // Navigate to edit page
                    window.location.href = `../post/edit.html?id=${postId}`;
                } else {
                    throw new Error('Post data not found');
                }

            } catch (error) {
                console.error('Failed to navigate to edit page:', error);
                // Reset button state
                editBtn.disabled = false;
                editBtn.innerHTML = originalContent;
                alert('Failed to open edit page. Please try again.');
            }
        });

        // Setup Delete Button Handler
        deleteBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            if (!postId) {
                console.error('No post ID found for delete action');
                return;
            }

            if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
                try {
                    // Disable button and show loading state
                    deleteBtn.disabled = true;
                    const originalContent = deleteBtn.innerHTML;
                    deleteBtn.innerHTML = 'Deleting...';

                    // Delete the post
                    await deletePost(postId);

                    // Animate removal
                    thumbnailContainer.style.transition = 'all 0.3s ease';
                    thumbnailContainer.style.opacity = '0';
                    thumbnailContainer.style.transform = 'scale(0.9)';

                    // Update local posts array
                    allPosts = allPosts.filter(post => post.id !== postId);

                    // Wait for animation
                    await new Promise(resolve => setTimeout(resolve, 300));

                    // Remove from DOM
                    thumbnailContainer.remove();

                    // Update pagination if needed
                    updatePagination(allPosts.length);

                    // If current page is empty and not the first page, go to previous page
                    const postsOnCurrentPage = document.querySelectorAll('.account-thumbnail-container').length;
                    if (postsOnCurrentPage === 0 && currentPage > 1) {
                        currentPage--;
                        displayPosts(currentPage);
                    }
                } catch (error) {
                    console.error('Error deleting post:', error);
                    alert('Failed to delete post. Please try again.');
                    // Reset the UI state
                    thumbnailContainer.style.opacity = '1';
                    deleteBtn.disabled = false;
                    deleteIcon.src = '../assets/icons/Remove.png';
                }
            }
        });
    });
}

/**
 * Initialize the account page functionality
 * - Checks authentication
 * - Sets up sign out handlers
 * - Initializes mobile menu
 */
function initAccountPage() {
    const user = checkAuth();
    if (!user) return; // User not authenticated

    // Add sign out event listeners - use both class and ID selectors
    const signOutDesktop = document.getElementById('signOutDesktop');
    const signOutMobile = document.getElementById('signOutMobile');

    const handleSignOutClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSignOut();
    };

    if (signOutDesktop) {
        signOutDesktop.addEventListener('click', handleSignOutClick);
    }

    if (signOutMobile) {
        signOutMobile.addEventListener('click', handleSignOutClick);
    }

    // Mobile menu functionality
    const burgerMenu = document.getElementById('burgerMenuLogin');
    const navMenu = document.getElementById('navMenuLogin');

    if (burgerMenu && navMenu) {
        burgerMenu.addEventListener('click', () => {
            navMenu.showModal();
        });

        // Close dialog when clicking outside
        navMenu.addEventListener('click', (e) => {
            const dialogDimensions = navMenu.getBoundingClientRect();
            if (
                e.clientX < dialogDimensions.left ||
                e.clientX > dialogDimensions.right ||
                e.clientY < dialogDimensions.top ||
                e.clientY > dialogDimensions.bottom
            ) {
                navMenu.close();
            }
        });
    }
}

/**
 * Handle sign out
 */
function handleSignOut() {

    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    // Use absolute path from root
    window.location.href = '/account/login.html';
}

/**
 * Set up click handlers for thumbnails to view full posts
 */
function setupThumbnailClicks() {
    const thumbnails = document.querySelectorAll('.account-thumbnail-content');
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', (e) => {
            // Don't trigger if clicking edit or delete buttons
            if (e.target.closest('.account-thumbnail-controls')) return;

            const postId = thumbnail.dataset.postId;
            const post = allPosts.find(p => p.id === postId);
            if (post) {
                // Store the post data for the post page
                localStorage.setItem('viewPost', JSON.stringify(post));
                // Navigate to the post page
                window.location.href = `../post/index.html?id=${postId}`;
            }
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (!user) return; // User not authenticated
    initAccountPage();
    displayUserPosts();
});