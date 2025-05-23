/**
 * Check authentication state
 * @returns {Object|null} The user object if authenticated, null otherwise
 */
export function checkAuth() {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');

    if (!token || !user) {
        // Redirect to login if not authenticated
        window.location.href = '../account/login.html';
        return null;
    }

    try {
        const parsedUser = JSON.parse(user);
        return parsedUser;
    } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '../account/login.html';
        return null;
    }
}
