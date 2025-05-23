// DOM Elements
const poemHeader = document.getElementById('poemHeader');
const poemTitle = document.getElementById('poemTitle');
const poemAuthor = document.getElementById('poemAuthor');
const poemPublished = document.getElementById('poemPublished');
const headerImage = poemHeader.querySelector('img');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentHeaderIndex = 0;
let headerPosts = [];

/**
 * Initialize the carousel with posts
 * @param {Array} posts Array of posts to display in carousel
 */
export function initializeCarousel(posts) {
    headerPosts = [...posts]
        .sort((a, b) => new Date(b.created) - new Date(a.created))
        .slice(0, 3);

    updateHeaderPost();
    setupHeaderControls();
}

/**
 * Update the header post display
 */
function updateHeaderPost() {
    const post = headerPosts[currentHeaderIndex];

    // Update header content with smooth fade transition
    poemHeader.style.opacity = '0';

    setTimeout(() => {
        // Update image with fallback and error handling
        if (post.media?.url) {
            headerImage.src = post.media.url;
            headerImage.alt = post.media.alt || 'Post Image';
        } else {
            headerImage.src = 'assets/images/default-post.png';
            headerImage.alt = 'Default Post Image';
        }

        // Update text content
        poemTitle.textContent = post.title;
        poemAuthor.innerHTML = `<span>Author:</span> <span>${post.author.name}</span>`;
        poemPublished.innerHTML = `<span>Published:</span> <span>${new Date(post.created).toLocaleDateString()}</span>`;

        // Add click handlers to title and image
        const headerImgContainer = document.querySelector('.header-img-container');
        const addClickHandler = (element) => {
            if (element) {
                element.style.cursor = 'pointer';
                element.addEventListener('click', () => {
                    // Dispatch custom event when post is clicked
                    const event = new CustomEvent('carouselPostClick', {
                        detail: { postId: post.id }
                    });
                    document.dispatchEvent(event);
                });
            }
        };

        // Add click handlers to both title and image
        addClickHandler(headerImgContainer);
        addClickHandler(poemTitle);

        // Fade in the updated content
        poemHeader.style.opacity = '1';
    }, 300); // Match this with your CSS transition time
}

/**
 * Set up header carousel controls
 */
function setupHeaderControls() {
    prevBtn.addEventListener('click', () => {
        currentHeaderIndex = (currentHeaderIndex - 1 + headerPosts.length) % headerPosts.length;
        updateHeaderPost();
    });

    nextBtn.addEventListener('click', () => {
        currentHeaderIndex = (currentHeaderIndex + 1) % headerPosts.length;
        updateHeaderPost();
    });
}