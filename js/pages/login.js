import { validateEmail, validatePassword } from '../utils/validation.js';
import { loginUser } from '../api/auth.js';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('email');
const loginPassword = document.getElementById('password');
const errorContainer = document.getElementById('loginError');


/**
 * Display error message with appropriate styling
 * @param {string} message - Error message to display
 * @param {boolean} isRegistrationLink - Whether to include registration link
 */
function displayError(message, isRegistrationLink = false) {
    if (!errorContainer) return;

    if (isRegistrationLink) {
        errorContainer.innerHTML = `${message}<br><a href="register.html" class="text-brand fw-700">Click here to register</a>`;
    } else {
        errorContainer.textContent = message;
    }

    errorContainer.classList.add('show');

    // Clear error after 5 seconds
    setTimeout(() => {
        errorContainer.textContent = '';
        errorContainer.classList.remove('show');
    }, 5000);
}

/**
 * Show loading state on the form
 * @param {boolean} isLoading - Whether to show or hide loading state
 */
function setLoading(isLoading) {
    const submitButton = loginForm.querySelector('button[type="submit"]');
    if (isLoading) {
        submitButton.disabled = true;
        submitButton.textContent = 'Signing in...';
    } else {
        submitButton.disabled = false;
        submitButton.textContent = 'Sign in';
    }
}

/**
 * Handle login form submission
 * @param {Event} event - Form submission event
 */
async function handleLogin(event) {
    event.preventDefault();

    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    // Clear any existing error
    errorContainer.textContent = '';

    // Validate inputs
    if (!validateEmail(email)) {
        displayError('Please enter a valid Noroff email address (@noroff.no or @stud.noroff.no)');
        loginEmail.focus();
        return;
    }

    if (!validatePassword(password)) {
        displayError('Password must be at least 8 characters long');
        loginPassword.focus();
        return;
    }

    try {
        setLoading(true);
        const userData = await loginUser({ email, password });


        // Store last successful login timestamp
        localStorage.setItem('lastLogin', new Date().toISOString());

        // Redirect to account page after successful login
        window.location.href = '/account/login.html';
    } catch (error) {
        console.error('Login error:', error);
        setLoading(false);

        // Handle specific error cases
        if (error.status === 401) {
            displayError('Invalid email or password. If you don\'t have an account, please register.', true);
        } else if (error.message.includes('access token')) {
            displayError('Server error. Please try again later.');
        } else {
            displayError(error.message || 'An error occurred during login. Please try again.');
        }
    }
}

/**
 * Check if user is already logged in
 */
function checkExistingSession() {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    const lastLogin = localStorage.getItem('lastLogin');

    if (token && user && lastLogin) {
        // Check if the last login was within 24 hours
        const lastLoginDate = new Date(lastLogin);
        const now = new Date();
        const hoursSinceLastLogin = (now - lastLoginDate) / (1000 * 60 * 60);

        if (hoursSinceLastLogin < 24) {
            window.location.href = '/account/account.html';
        } else {
            // Clear expired session
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            localStorage.removeItem('lastLogin');
        }
    }
}

// Event listeners
loginForm.addEventListener('submit', handleLogin);

// Check for existing session on page load
document.addEventListener('DOMContentLoaded', checkExistingSession);