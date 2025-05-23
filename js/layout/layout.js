import { updateNavigation, handleLogout } from './nav.js';

// DOM Elements
const burgerMenu = document.getElementById('burgerMenu');
const navMenu = document.getElementById('navMenu');
const logoutBtnMobile = document.getElementById('logoutBtnMobile');

// Mobile menu functionality
if (burgerMenu && navMenu) {
    burgerMenu.addEventListener('click', () => {
        if (navMenu.open) {
            navMenu.close();
        } else {
            navMenu.showModal();
            updateNavigation(); // Update navigation when opening menu
        }
    });

    // Close modal when clicking outside
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

// Add logout event listener for mobile
if (logoutBtnMobile) {
    logoutBtnMobile.addEventListener('click', handleLogout);
}

// Initialize mobile navigation
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
});

// Listen for storage changes (in case other tabs modify auth state)
window.addEventListener('storage', (e) => {
    if (e.key === 'accessToken') {
        updateNavigation();
    }
});