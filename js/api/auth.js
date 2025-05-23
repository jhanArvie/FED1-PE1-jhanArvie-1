const API_BASE_URL = 'https://v2.api.noroff.dev';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's name
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @param {string} [userData.bio] - User's bio (optional)
 * @returns {Promise} Registration response
 */
export async function registerUser(userData) {
    try {

        const requestBody = {
            name: userData.name,
            email: userData.email.toLowerCase(),
            password: userData.password,
            bio: userData.bio || ''  // Include bio if provided
        };

        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.errors && data.errors.length > 0) {
                console.error('Validation errors:', data.errors);
                throw new Error(data.errors.map(err => err.message).join(', '));
            }
            throw new Error(data.message || 'Registration failed');
        }

        return data;
    } catch (error) {
        console.error('Registration error details:', error);
        throw error;
    }
}

/**
 * Login user
 * @param {Object} credentials - User login data
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - User's password
 * @returns {Promise} Login response
 */
export async function loginUser(credentials) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: credentials.email.toLowerCase(),
                password: credentials.password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Login failed');
            error.status = response.status;
            throw error;
        }

        // Verify we got the required data
        const responseData = data.data;
        if (!responseData?.accessToken) {
            console.error('No access token in response:', data);
            throw new Error('Invalid API response: No access token received');
        }

        // Store the access token and user data
        localStorage.setItem('accessToken', responseData.accessToken);
        localStorage.setItem('user', JSON.stringify({
            name: responseData.name,
            email: responseData.email,
            avatar: responseData.avatar?.url || null,
            bio: responseData.bio || '',  // Include bio in localStorage
            accessToken: responseData.accessToken
        }));

        return responseData;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}