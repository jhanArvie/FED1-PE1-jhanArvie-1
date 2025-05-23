/**
 * Posts API module for handling all post-related API calls
 */

const API_URL = 'https://v2.api.noroff.dev';

/**
 * Get all public posts
 * @returns {Promise} Array of all posts
 */
export async function getAllPosts() {
    try {

        
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const response = await fetch(`${API_URL}/blog/posts`, requestOptions);

        if (!response.ok) {

            let errorData;
            try {
                errorData = await response.json();
                console.error('Error response data:', errorData);
            } catch (parseError) {
                console.error('Could not parse error response:', parseError);

                errorData = { message: 'Failed to parse error response' };
            }
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Detailed error in getAllPosts:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        throw error;
    }
}

/**
 * Get posts by user
 * @param {string} name - The username
 * @param {string} id - Optional post ID
 * @returns {Promise} The posts data
 */
export async function getUserPosts(name, id = '') {
    const token = localStorage.getItem('accessToken');

    if (!token) {
        console.error('No token found for user posts request');
        throw new Error('Authentication required');
    }



    try {
        const endpoint = id
            ? `${API_URL}/blog/posts/${name}/${id}`
            : `${API_URL}/blog/posts/${name}`;



        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch posts');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
    }
}

/**
 * Create a new post
 * @param {Object} postData - The post data
 * @param {string} postData.title - The title of the post
 * @param {string} postData.body - The content of the post
 * @param {string} postData.tags - Comma-separated tags
 * @param {string} postData.media - URL of the post image
 * @param {string} postData.mediaAlt - Alt text for the image
 * @returns {Promise} The created post data
 */
export async function createPost(postData) {
    const token = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user || !user.name) {
        throw new Error('User not found. Please log in again.');
    }

    try {
        // Format the request body according to API requirements
        const requestBody = {
            title: postData.title.trim(),
            body: postData.body.trim(),
            tags: Array.isArray(postData.tags)
                ? postData.tags
                : postData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            media: {
                url: postData.media.trim(),
                alt: postData.mediaAlt?.trim() || postData.title.trim()
            }
        };

        // Validate required fields
        if (!requestBody.title) throw new Error('Title is required');
        if (!requestBody.body) throw new Error('Content is required');
        if (!requestBody.media.url) throw new Error('Media URL is required');
        if (!requestBody.tags.length) throw new Error('At least one tag is required');

        // Validate URL
        try {
            new URL(requestBody.media.url);
        } catch {
            throw new Error('Invalid media URL');
        }



        const response = await fetch(`${API_URL}/blog/posts/${user.name}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });



        const data = await response.json();

        if (!response.ok) {
            console.error('API Error:', {
                status: response.status,
                statusText: response.statusText,
                data
            });

            // Handle specific API errors
            if (data.errors?.length > 0) {
                throw new Error(data.errors[0].message);
            }

            // Handle general HTTP errors
            switch (response.status) {
                case 400:
                    throw new Error('Invalid post data. Please check all fields.');
                case 401:
                    throw new Error('Session expired. Please log in again.');
                case 403:
                    throw new Error('You do not have permission to create posts.');
                case 404:
                    throw new Error('API endpoint not found. Please check the documentation.');
                case 429:
                    throw new Error('Too many requests. Please try again later.');
                default:
                    throw new Error('Failed to create post. Please try again.');
            }
        }

        return data.data;
    } catch (error) {
        console.error('Create post error:', error);
        throw error; // Re-throw to be handled by the UI
    }
}

/**
 * Delete a post by ID
 * @param {string} id - The ID of the post to delete
 * @returns {Promise} The response data
 */
export async function deletePost(id) {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
        console.error('❌ Authentication missing:', { token: !!token, user: !!userStr });
        throw new Error('Authentication required');
    }

    try {
        const user = JSON.parse(userStr);


        if (!user.name) {
            throw new Error('User name not found');
        }

        const url = `${API_URL}/blog/posts/${user.name}/${id}`;


        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });



        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Delete failed:', {
                error: errorData,
                response: {
                    status: response.status,
                    statusText: response.statusText
                }
            });
            throw new Error(errorData.message || 'Failed to delete post');
        }


        return true;
    } catch (error) {
        console.error('Delete error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
}
