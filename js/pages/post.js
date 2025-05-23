import { checkAuth } from '../utils/auth.js';

/**
 * Format date to a readable string
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Display the post content
 */
function displayPost() {
    // Get post data and current user data from localStorage
    const postData = localStorage.getItem('viewPost');
    const currentUserData = localStorage.getItem('user');

    if (!postData) {
        console.error('No post data found');
        window.location.href = '../index.html';
        return;
    }

    try {
        const post = JSON.parse(postData);
        const currentUser = currentUserData ? JSON.parse(currentUserData) : null;

        // Update page title
        document.title = `${post.title} - PoemTales`;

        // Update header image
        const headerImg = document.querySelector('.blogpost-header-img');
        headerImg.src = post.media?.url || '../assets/images/image-1.png';
        headerImg.alt = post.media?.alt || 'Post Image';

        // Update post title
        const titleElement = document.querySelector('h1');
        titleElement.textContent = post.title;

        // Update author info and bio
        const authorSpan = document.getElementById('authorName');
        const authorBioElement = document.getElementById('authorBio');
        const authorName = post.author?.name || 'Anonymous';

        authorSpan.textContent = authorName;

        // Set bio - if current user is the author, use their bio from localStorage
        if (currentUser && currentUser.name === authorName) {
            authorBioElement.textContent = currentUser.bio || 'No bio available';

        } else {
            authorBioElement.textContent = post.author?.bio || 'No bio available';

        }

        // Update publish date
        const dateSpan = document.getElementById('publishDate');
        dateSpan.textContent = formatDate(post.created);

        // Update tags
        const tagWrapper = document.querySelector('.tag-wrapper');
        tagWrapper.innerHTML = post.tags?.map(tag =>
            `<span class="tag tag--brand">${tag}</span>`
        ).join('') || '';

        // Update poem content
        const poemContent = document.querySelector('.blog-poem');
        poemContent.textContent = post.body;

        // Setup share button
        const shareBtn = document.querySelector('.btn-primary');
        shareBtn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: post.title,
                    text: `Check out this poem on PoemTales: ${post.title}`,
                    url: window.location.href
                }).catch(console.error);
            } else {
                // Fallback: copy URL to clipboard
                navigator.clipboard.writeText(window.location.href)
                    .then(() => alert('Link copied to clipboard!'))
                    .catch(console.error);
            }
        });

        // Update navigation based on auth status
        if (currentUser) {
            // Update desktop nav
            const desktopNav = document.querySelector('.nav-desktop ul:last-child');
            desktopNav.innerHTML = `
                <li><a href="../account/account.html">My Poems</a></li>
                <div class="divider-desktop radius-10 bg-brand"></div>
                <li><a href="#" id="signOutDesktop">Sign out</a></li>
            `;

            // Update mobile nav
            const mobileNav = document.querySelector('.nav-mobile ul:last-child');
            mobileNav.innerHTML = `
                <li><a href="../account/account.html">My Poems</a></li>
                <div class="divider radius-10 bg-brand"></div>
                <li><a href="#" id="signOutMobile">Sign out</a></li>
            `;

            // Add sign out handlers
            ['signOutDesktop', 'signOutMobile'].forEach(id => {
                document.getElementById(id)?.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                    localStorage.removeItem('viewPost');
                    window.location.href = '../account/login.html';
                });
            });
        }

    } catch (error) {
        console.error('Error displaying post:', error);
        alert('Error loading post. Redirecting to home page...');
        window.location.href = '../index.html';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', displayPost);
