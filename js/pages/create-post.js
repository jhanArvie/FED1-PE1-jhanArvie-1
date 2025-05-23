import { createPost } from '../api/posts.js';

// DOM Elements
const createPostForm = document.getElementById('createPostForm');
const postTitle = document.getElementById('postTitle');
const postContent = document.getElementById('postContent');
const postImageUrl = document.getElementById('postImageUrl');
const postImageName = document.getElementById('postImageName');
const postTags = document.getElementById('postTags');
const submitButton = document.getElementById('submitPost');
const charCount = document.getElementById('charCount');
const errorMessage = document.getElementById('errorMessage');
const signOutDesktop = document.getElementById('signOutDesktop');
const signOutMobile = document.getElementById('signOutMobile');
const burgerMenuLogin = document.getElementById('burgerMenuLogin');
const navMenuLogin = document.getElementById('navMenuLogin');

// Constants
const MAX_CONTENT_LENGTH = 10000;

/**
 * Handle sign out
 */
function handleSignOut(e) {
    e.preventDefault();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.href = '/account/login.html';
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
    if (!navMenuLogin) return;
    
    if (navMenuLogin.hasAttribute('open')) {
        navMenuLogin.close();
    } else {
        navMenuLogin.showModal();
    }
}

/**
 * Display error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

/**
 * Update character count for content textarea
 */
function updateCharCount() {
    const currentLength = postContent.value.length;
    charCount.textContent = `${currentLength}/${MAX_CONTENT_LENGTH}`;
    
    if (currentLength > MAX_CONTENT_LENGTH) {
        charCount.classList.add('text-brand');
    } else {
        charCount.classList.remove('text-brand');
    }
}

/**
 * Show loading state
 */
function setLoading(isLoading) {
    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading ? 'Creating post...' : 'Submit Post';
}

/**
 * Format tags from comma-separated string to array
 */
function formatTags(tagsString) {
    return tagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
}

/**
 * Validate form inputs
 */
function validateForm() {
    const title = postTitle.value.trim();
    const content = postContent.value.trim();
    const imageUrl = postImageUrl.value.trim();
    const tags = postTags.value.trim();

    if (!title) {
        throw new Error('Title is required');
    }
    
    if (!content) {
        throw new Error('Content is required');
    }
    
    if (content.length > MAX_CONTENT_LENGTH) {
        throw new Error(`Content must be less than ${MAX_CONTENT_LENGTH} characters`);
    }
    
    if (!imageUrl) {
        throw new Error('Image URL is required');
    }
    
    try {
        new URL(imageUrl);
    } catch {
        throw new Error('Please enter a valid image URL');
    }

    if (!tags) {
        throw new Error('At least one tag is required');
    }

    const formattedTags = formatTags(tags);
    if (formattedTags.length === 0) {
        throw new Error('Please enter at least one valid tag');
    }

    return { title, content, imageUrl, tags: formattedTags };
}

/**
 * Handle form submission
 */
async function handleSubmit(event) {
    event.preventDefault();
    errorMessage.style.display = 'none';
    
    try {
        const validatedData = validateForm();
        setLoading(true);
        
        const postData = {
            title: validatedData.title,
            body: validatedData.content,
            media: validatedData.imageUrl,
            mediaAlt: postImageName.value.trim() || validatedData.title,
            tags: validatedData.tags
        };
        
        await createPost(postData);
        
        // Show success message and redirect
        alert('Post created successfully!');
        window.location.href = '/account/account.html';
        
    } catch (error) {
        console.error('Error creating post:', error);
        showError(error.message);
        setLoading(false);
    }
}

// Event Listeners
postContent.addEventListener('input', updateCharCount);
createPostForm.addEventListener('submit', handleSubmit);
signOutDesktop.addEventListener('click', handleSignOut);
signOutMobile.addEventListener('click', handleSignOut);
burgerMenuLogin.addEventListener('click', toggleMobileMenu);

// Close dialog when clicking outside
navMenuLogin.addEventListener('click', (e) => {
    const dialogDimensions = navMenuLogin.getBoundingClientRect();
    if (
        e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom
    ) {
        navMenuLogin.close();
    }
});

// Close dialog with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenuLogin.hasAttribute('open')) {
        navMenuLogin.close();
    }
});

// Check authentication on page load
const token = localStorage.getItem('accessToken');
if (!token) {
    window.location.href = '/account/login.html';
}