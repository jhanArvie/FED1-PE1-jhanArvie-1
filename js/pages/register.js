import { registerUser } from '../api/auth.js';
import { validateRegistrationForm } from '../utils/validation.js';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const nameInput = document.getElementById('registerName');
    const emailInput = document.getElementById('registerEmail');
    const passwordInput = document.getElementById('registerPassword');
    const bioInput = document.getElementById('registerBio');
    const bioCharCount = document.getElementById('bioCharCount');

    // Add character counter for bio
    bioInput.addEventListener('input', () => {
        const currentLength = bioInput.value.length;
        bioCharCount.textContent = `${currentLength}/160 characters`;


        // Optional: Change color when approaching limit
        if (currentLength >= 140) {
            bioCharCount.style.color = '#ff6b6b';  // Red when close to limit
        } else {
            bioCharCount.style.color = '';  // Reset to default color
        }
    });

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();


            const formData = {
                name: nameInput.value.trim(),
                email: emailInput.value,
                password: passwordInput.value
            };

            const bioLength = bioInput.value.length;

            // Validate form data
            const validationResult = validateRegistrationForm(formData);
            if (!validationResult.isValid) {

                alert(validationResult.error);
                return;
            }

            // Add optional bio if provided (now checking if length is within limit)
            if (bioInput.value) {
                if (bioLength > 160) {

                    alert('Bio must be 160 characters or less');
                    return;
                }
                formData.bio = bioInput.value;

            } else {

            }

            try {

                await registerUser(formData);
                alert('Registration successful! Please login.');
                window.location.href = '/account/login.html';
            } catch (error) {
                console.error('Registration failed:', error);
                alert(`Registration failed: ${error.message}`);
            }
        });
    } else {
        console.error('Register form not found');
    }
});