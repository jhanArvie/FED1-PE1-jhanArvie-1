import { getUserPosts, deletePost } from '../api/posts.js';
import { checkAuth } from '../utils/auth.js';

// Get form elements
const form = document.querySelector('.edit-post-form');
const titleInput = document.getElementById('post-title');
const contentInput = document.getElementById('post-content');
const imageUrlInput = document.getElementById('post-image-url');
const imageNameInput = document.getElementById('post-image-name');
const tagsInput = document.getElementById('post-tags');
const charCount = document.querySelector('.edit-post-charcount');
const deleteButton = document.querySelector('.edit-post-delete');
const cancelButton = document.querySelector('.edit-post-cancel');
const submitButton = document.querySelector('.edit-post-submit');

// Get post ID from URL
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

// Initialize form with post data
async function initializeForm() {
    try {
        // Check authentication
        const user = checkAuth();
        if (!user) return;

        // Get post data from localStorage
        const storedPost = localStorage.getItem('editPost');
        if (storedPost) {
            const post = JSON.parse(storedPost);

            // Fill form fields
            titleInput.value = post.title || '';
            contentInput.value = post.body || '';
            imageUrlInput.value = post.media?.url || '';
            imageNameInput.value = post.media?.alt || '';
            tagsInput.value = post.tags?.join(', ') || '';

            // Update character count
            updateCharCount();
        } else {
            console.error('No post data found');
            alert('Error loading post data. Redirecting to account page...');
            window.location.href = '../account/account.html';
        }
    } catch (error) {
        console.error('Error initializing form:', error);
        alert('Error loading post data. Please try again.');
    }
}

// Update character count
function updateCharCount() {
    const count = contentInput.value.length;
    charCount.textContent = `${count}/10000`;
}

// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        submitButton.disabled = true;
        submitButton.innerHTML = 'Updating...';

        const postData = {
            title: titleInput.value.trim(),
            body: contentInput.value.trim(),
            tags: tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag),
            media: {
                url: imageUrlInput.value.trim(),
                alt: imageNameInput.value.trim()
            }
        };

        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('No authentication token found');
        }



        // Get username from auth
        const user = checkAuth();
        if (!user || !user.name) {
            throw new Error('User not authenticated');
        }

        // Make API call to update post
        const response = await fetch(`https://v2.api.noroff.dev/blog/posts/${user.name}/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(postData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', {
                status: response.status,
                statusText: response.statusText,
                errorData
            });
            throw new Error(`Failed to update post: ${errorData.message || response.statusText}`);
        }

        // Clear stored post data
        localStorage.removeItem('editPost');

        // Redirect to account page
        window.location.href = '../account/account.html';

    } catch (error) {
        console.error('Error updating post:', error);
        alert('Failed to update post. Please try again.');

        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = 'Submit Post';
    }
});

// Handle delete button
deleteButton.addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        try {
            deleteButton.disabled = true;
            deleteButton.innerHTML = 'Deleting...';

            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            await deletePost(postId, token);

            // Clear stored post data
            localStorage.removeItem('editPost');

            // Redirect to account page
            window.location.href = '../account/account.html';

        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post. Please try again.');

            // Reset button state
            deleteButton.disabled = false;
            deleteButton.innerHTML = 'Delete Post';
        }
    }
});

// Handle cancel button
cancelButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
        // Clear stored post data
        localStorage.removeItem('editPost');
        // Redirect to account page
        window.location.href = '../account/account.html';
    }
});

// Add character count listener
contentInput.addEventListener('input', updateCharCount);

// Handle sign out
const signOutLinks = document.querySelectorAll('a[href="../account/login.html"]');
signOutLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        // Clear all authentication data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.removeItem('editPost');
        // Redirect to login page
        window.location.href = '../account/login.html';
    });
});

// Initialize form when page loads
document.addEventListener('DOMContentLoaded', initializeForm);