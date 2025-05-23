/**
 * Update navigation based on authentication status
 */
function updateNavigation() {
    const token = localStorage.getItem('accessToken');
    const guestNav = document.getElementById('guestNav');
    const userNav = document.getElementById('userNav');
    const guestNavMobile = document.getElementById('guestNavMobile');
    const userNavMobile = document.getElementById('userNavMobile');

    if (token) {
        // User is logged in
        guestNav?.classList.add('hide');
        userNav?.classList.remove('hide');
        guestNavMobile?.classList.add('hide');
        userNavMobile?.classList.remove('hide');
    } else {
        // User is not logged in
        guestNav?.classList.remove('hide');
        userNav?.classList.add('hide');
        guestNavMobile?.classList.remove('hide');
        userNavMobile?.classList.add('hide');
    }
}

/**
 * Handle user logout
 */
function handleLogout(e) {
    if (e) e.preventDefault();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');

    // Determine if we're in a template directory
    const isInTemplate = window.location.pathname.includes('/templates/');
    const loginPath = isInTemplate ? '../account/login.html' : 'account/login.html';

    // Redirect to login page
    window.location.href = loginPath;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();

    // Add logout event listeners for both desktop and mobile
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtnMobile = document.getElementById('logoutBtnMobile');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    if (logoutBtnMobile) {
        logoutBtnMobile.addEventListener('click', handleLogout);
    }
});

// Export functions for use in other files
export { updateNavigation, handleLogout };
